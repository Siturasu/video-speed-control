'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const core = require('../extension/lib/core.js');

// Minimal stand-in for chrome.storage.local.
function memoryArea(initial = {}) {
  const data = structuredClone(initial);
  return {
    data,
    async get(keys) {
      if (keys === null) return structuredClone(data);
      const list = typeof keys === 'string' ? [keys] : keys;
      return Object.fromEntries(list.filter(key => key in data).map(key => [key, structuredClone(data[key])]));
    },
    async set(items) { Object.assign(data, structuredClone(items)); }
  };
}

test('clampRate keeps speeds inside the supported range', () => {
  assert.equal(core.clampRate(2), 2);
  assert.equal(core.clampRate(0.1), 0.25);
  assert.equal(core.clampRate(40), 16);
  assert.equal(core.clampRate(1.234), 1.23);
  assert.equal(core.clampRate('abc', 1.5), 1.5);
  assert.equal(core.clampRate(-1, 1), 1);
  assert.equal(core.clampRate(NaN, 1), 1);
});

test('stepRate moves along the step grid', () => {
  assert.equal(core.stepRate(1, 0.25, 1), 1.25);
  assert.equal(core.stepRate(1.25, 0.25, -1), 1);
  assert.equal(core.stepRate(1.3, 0.25, 1), 1.5);
  assert.equal(core.stepRate(1.3, 0.25, -1), 1.25);
  assert.equal(core.stepRate(1.75, 0.25, 1), 2);
  assert.equal(core.stepRate(16, 0.25, 1), 16);
  assert.equal(core.stepRate(0.25, 0.25, -1), 0.25);
  assert.equal(core.stepRate(1, 0, 1), 1.25, 'invalid step falls back to the default');
  // Repeated steps must not drift through floating point error.
  let rate = 1;
  for (let i = 0; i < 12; i += 1) rate = core.stepRate(rate, 0.1, 1);
  assert.equal(rate, 2.2);
});

test('parsePresets accepts up to six valid speeds and sorts them', () => {
  assert.deepEqual(core.parsePresets('2, 1.25 1.5'), [1.25, 1.5, 2]);
  assert.deepEqual(core.parsePresets('1.5,1.5,2'), [1.5, 2]);
  assert.equal(core.parsePresets(''), null);
  assert.equal(core.parsePresets('1, abc'), null);
  assert.equal(core.parsePresets('0.1'), null);
  assert.equal(core.parsePresets('17'), null);
  assert.equal(core.parsePresets('1,2,3,4,5,6,7'), null);
});

test('normalizePrefs fills defaults and keeps only known feature flags', () => {
  const prefs = core.normalizePrefs({presets: [3, 'x'], step: 5, defaultRate: 99, features: {presetSets: true, unknown: true}});
  assert.equal(prefs.schemaVersion, core.SCHEMA_VERSION);
  assert.deepEqual(prefs.presets, [1.25, 1.5, 2]);
  assert.equal(prefs.step, 0.25);
  assert.equal(prefs.defaultRate, 16);
  assert.deepEqual(prefs.features, {presetSets: true, exportImport: false});
  assert.deepEqual(core.normalizePrefs(undefined).features, {presetSets: false, exportImport: false});
});

test('siteHost and hostFromUrl group a domain with its www. form', () => {
  assert.equal(core.hostFromUrl('https://www.YouTube.com/watch?v=1'), 'youtube.com');
  assert.equal(core.hostFromUrl('https://player.vimeo.com/video/1'), 'player.vimeo.com');
  assert.equal(core.hostFromUrl('http://localhost:8080/a'), 'localhost');
  assert.equal(core.hostFromUrl('http://[::1]:8000/'), '[::1]');
  assert.equal(core.hostFromUrl('chrome://extensions'), '');
  assert.equal(core.hostFromUrl('file:///tmp/a.html'), '');
  assert.equal(core.hostFromUrl(undefined), '');
  assert.equal(core.siteHost('example.com.'), 'example.com');
});

test('originPatterns covers bare and www. hosts but not IP addresses twice', () => {
  assert.deepEqual(core.originPatterns('example.com'), ['*://example.com/*', '*://www.example.com/*']);
  assert.deepEqual(core.originPatterns('127.0.0.1'), ['*://127.0.0.1/*']);
  assert.deepEqual(core.originPatterns(''), []);
});

test('site settings are saved per domain and do not leak between sites', async () => {
  const area = memoryArea();
  assert.deepEqual(await core.loadSite(area, 'a.com'), {enabled: false, rate: 1.5, auto: false});
  await core.saveSite(area, 'a.com', {enabled: true, rate: 2});
  await core.saveSite(area, 'b.com', {rate: 1.25});
  assert.deepEqual(await core.loadSite(area, 'a.com'), {enabled: true, rate: 2, auto: false});
  assert.deepEqual(await core.loadSite(area, 'b.com'), {enabled: false, rate: 1.25, auto: false});
  assert.deepEqual(Object.keys(area.data).sort(), ['site:a.com', 'site:b.com']);
});

test('saveSite merges patches and cleans bad values', async () => {
  const area = memoryArea({'site:a.com': {enabled: true, rate: 3, auto: true}});
  const site = await core.saveSite(area, 'a.com', {rate: 100, auto: 'yes'});
  assert.deepEqual(site, {enabled: true, rate: 16, auto: false});
  await assert.rejects(core.saveSite(area, '', {rate: 2}));
});

test('new sites start at the user default speed', async () => {
  const area = memoryArea();
  await core.savePrefs(area, {defaultRate: 1.75});
  assert.equal((await core.loadSite(area, 'new.com')).rate, 1.75);
});

test('autoSites lists only valid sites with automatic start on', async () => {
  const area = memoryArea({
    'site:a.com': {enabled: true, rate: 2, auto: true},
    'site:b.com': {enabled: true, rate: 2, auto: false},
    'site:BAD HOST': {auto: true},
    prefs: core.normalizePrefs()
  });
  assert.deepEqual(await core.autoSites(area), ['a.com']);
});

test('migrate drops the 1.0 global setting and writes current prefs', () => {
  const {updates, removals} = core.migrate({enabled: true, rate: 2});
  assert.deepEqual(removals, ['enabled', 'rate']);
  assert.equal(updates.prefs.schemaVersion, core.SCHEMA_VERSION);
  assert.deepEqual(core.migrate({prefs: core.normalizePrefs()}), {updates: {}, removals: []});
});
