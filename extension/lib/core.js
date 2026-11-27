// Shared settings logic. Loaded by the popup, the service worker and the page script,
// and by Node for unit tests.
(root => {
  'use strict';

  const SCHEMA_VERSION = 1;
  const MIN_RATE = 0.25;
  const MAX_RATE = 16;
  const MAX_PRESETS = 6;
  const PREFS_KEY = 'prefs';
  const SITE_PREFIX = 'site:';

  // Room for paid features later. Every flag stays off until a feature ships.
  const DEFAULT_FEATURES = Object.freeze({presetSets: false, exportImport: false});

  const DEFAULT_PREFS = Object.freeze({
    schemaVersion: SCHEMA_VERSION,
    presets: Object.freeze([1.25, 1.5, 2]),
    step: 0.25,
    defaultRate: 1.5,
    features: DEFAULT_FEATURES
  });

  function roundRate(value) {
    return Math.round(value * 100) / 100;
  }

  function clampRate(value, fallback = 1) {
    const number = Number(value);
    if (!Number.isFinite(number) || number <= 0) return fallback;
    return roundRate(Math.min(MAX_RATE, Math.max(MIN_RATE, number)));
  }

  function stepRate(rate, step, direction) {
    const size = Number.isFinite(step) && step > 0 ? step : DEFAULT_PREFS.step;
    const next = direction > 0 ? rate + size : rate - size;
    // Snap to the step grid so 1.3 + 0.25 lands on 1.5, not 1.55.
    const snapped = direction > 0 ? Math.floor(next / size + 1e-9) * size : Math.ceil(next / size - 1e-9) * size;
    return clampRate(snapped, rate);
  }

  function parsePresets(input) {
    const values = String(input).split(/[\s,]+/).filter(Boolean).map(Number);
    if (!values.length || values.some(value => !Number.isFinite(value) || value < MIN_RATE || value > MAX_RATE)) return null;
    const unique = [...new Set(values.map(roundRate))].sort((a, b) => a - b);
    return unique.length <= MAX_PRESETS ? unique : null;
  }

  function normalizePrefs(raw) {
    const value = raw && typeof raw === 'object' ? raw : {};
    const presets = Array.isArray(value.presets) ? parsePresets(value.presets.join(',')) : null;
    const step = Number.isFinite(value.step) && value.step >= 0.05 && value.step <= 1 ? roundRate(value.step) : DEFAULT_PREFS.step;
    const features = {...DEFAULT_FEATURES};
    for (const name of Object.keys(DEFAULT_FEATURES)) {
      if (typeof value.features?.[name] === 'boolean') features[name] = value.features[name];
    }
    return {
      schemaVersion: SCHEMA_VERSION,
      presets: presets || [...DEFAULT_PREFS.presets],
      step,
      defaultRate: clampRate(value.defaultRate, DEFAULT_PREFS.defaultRate),
      features
    };
  }

  function normalizeSite(raw, prefs = DEFAULT_PREFS) {
    const value = raw && typeof raw === 'object' ? raw : {};
    return {
      enabled: value.enabled === true,
      rate: clampRate(value.rate, prefs.defaultRate),
      auto: value.auto === true
    };
  }

  // One entry per domain: www.example.com and example.com share settings.
  function siteHost(hostname) {
    const host = String(hostname || '').toLowerCase().replace(/\.$/, '');
    if (!host || (!/^[a-z0-9.-]+$/.test(host) && !/^\[[0-9a-f:]+\]$/.test(host))) return '';
    return host.replace(/^www\./, '');
  }

  function hostFromUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? siteHost(parsed.hostname) : '';
    } catch {
      return '';
    }
  }

  function siteKey(host) {
    return SITE_PREFIX + host;
  }

  // Match patterns for one site, covering both the bare and www. host.
  function originPatterns(host) {
    if (!host) return [];
    if (host.startsWith('[') || /^\d+(\.\d+){3}$/.test(host)) return [`*://${host}/*`];
    return [`*://${host}/*`, `*://www.${host}/*`];
  }

  function migrate(stored) {
    const updates = {};
    const removals = [];
    if (!stored[PREFS_KEY] || stored[PREFS_KEY].schemaVersion !== SCHEMA_VERSION) {
      updates[PREFS_KEY] = normalizePrefs(stored[PREFS_KEY]);
    }
    // Version 1.0 stored a single global {enabled, rate} for one site. Drop it.
    for (const legacy of ['enabled', 'rate']) if (legacy in stored) removals.push(legacy);
    return {updates, removals};
  }

  async function loadPrefs(area) {
    const stored = await area.get(PREFS_KEY);
    return normalizePrefs(stored[PREFS_KEY]);
  }

  async function savePrefs(area, patch) {
    const prefs = normalizePrefs({...(await loadPrefs(area)), ...patch});
    await area.set({[PREFS_KEY]: prefs});
    return prefs;
  }

  async function loadSite(area, host) {
    const key = siteKey(host);
    const stored = await area.get([PREFS_KEY, key]);
    return normalizeSite(stored[key], normalizePrefs(stored[PREFS_KEY]));
  }

  async function saveSite(area, host, patch) {
    if (!host) throw new Error('No site');
    const site = normalizeSite({...(await loadSite(area, host)), ...patch}, await loadPrefs(area));
    await area.set({[siteKey(host)]: site});
    return site;
  }

  async function autoSites(area) {
    const stored = await area.get(null);
    return Object.keys(stored)
      .filter(key => key.startsWith(SITE_PREFIX) && stored[key]?.auto === true)
      .map(key => key.slice(SITE_PREFIX.length))
      .filter(host => siteHost(host) === host);
  }

  // Only callable from the popup or service worker, right after a user gesture.
  async function injectPageScript(tabId) {
    const files = ['lib/core.js', 'content.js'];
    try {
      await chrome.scripting.executeScript({target: {tabId, allFrames: true}, files});
    } catch {
      // Some frames on the page may be off limits. The top frame is enough to work.
      await chrome.scripting.executeScript({target: {tabId}, files});
    }
  }

  function formatRate(rate) {
    return `${roundRate(rate)}×`;
  }

  const api = {
    SCHEMA_VERSION, MIN_RATE, MAX_RATE, MAX_PRESETS, PREFS_KEY, SITE_PREFIX, DEFAULT_PREFS, DEFAULT_FEATURES,
    roundRate, clampRate, stepRate, parsePresets, normalizePrefs, normalizeSite,
    siteHost, hostFromUrl, siteKey, originPatterns, migrate,
    loadPrefs, savePrefs, loadSite, saveSite, autoSites, injectPageScript, formatRate
  };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.VSC = api;
})(globalThis);
