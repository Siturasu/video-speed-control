(() => {
  'use strict';
  const core = globalThis.VSC;
  const area = chrome.storage.local;
  const t = (name, ...subs) => chrome.i18n.getMessage(name, subs);
  const $ = id => document.getElementById(id);
  const ui = {
    host: $('host'), unsupported: $('unsupported'), controls: $('controls'), enabled: $('enabled'), rate: $('rate'),
    slower: $('slower'), faster: $('faster'), presets: $('presets'), customForm: $('customForm'), custom: $('custom'),
    auto: $('auto'), status: $('status'), presetForm: $('presetForm'), presetInput: $('presetInput'),
    shortcuts: $('shortcuts'), openShortcuts: $('openShortcuts')
  };
  let tabId = null;
  let host = '';
  let prefs = core.normalizePrefs();
  let site = core.normalizeSite();

  document.documentElement.lang = chrome.i18n.getUILanguage();
  for (const node of document.querySelectorAll('[data-i18n]')) node.textContent = t(node.dataset.i18n);
  for (const node of document.querySelectorAll('[data-i18n-label]')) node.setAttribute('aria-label', t(node.dataset.i18nLabel));

  function say(text, isError = false) {
    ui.status.textContent = text;
    ui.status.classList.toggle('error', isError);
  }

  function render() {
    ui.enabled.checked = site.enabled;
    ui.rate.textContent = site.enabled ? core.formatRate(site.rate) : '1×';
    ui.rate.classList.toggle('off', !site.enabled);
    ui.custom.placeholder = String(site.rate);
    ui.presets.replaceChildren(...prefs.presets.map(rate => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = core.formatRate(rate);
      button.setAttribute('aria-pressed', String(site.enabled && site.rate === rate));
      button.addEventListener('click', () => update({enabled: true, rate}));
      return button;
    }));
    ui.presetInput.value = prefs.presets.join(', ');
  }

  async function update(patch) {
    try {
      site = await core.saveSite(area, host, patch);
      render();
    } catch {
      say(t('saveFailed'), true);
    }
  }

  async function countVideos() {
    const count = () => document.querySelectorAll('video').length;
    try {
      const results = await chrome.scripting.executeScript({target: {tabId, allFrames: true}, func: count});
      return results.reduce((sum, item) => sum + (item.result || 0), 0);
    } catch {
      const [result] = await chrome.scripting.executeScript({target: {tabId}, func: count});
      return result?.result || 0;
    }
  }

  async function renderShortcuts() {
    const labels = {faster: 'shortcutFaster', slower: 'shortcutSlower', toggle: 'shortcutToggle'};
    const rows = [];
    for (const command of await chrome.commands.getAll()) {
      if (!labels[command.name]) continue;
      const term = document.createElement('dt');
      term.textContent = t(labels[command.name]);
      const value = document.createElement('dd');
      value.textContent = command.shortcut || t('shortcutNotSet');
      rows.push(term, value);
    }
    ui.shortcuts.replaceChildren(...rows);
  }

  ui.enabled.addEventListener('change', () => update({enabled: ui.enabled.checked}));
  for (const [button, direction] of [[ui.slower, -1], [ui.faster, 1]]) {
    button.addEventListener('click', () => {
      const base = site.enabled ? site.rate : 1;
      update({enabled: true, rate: core.stepRate(base, prefs.step, direction)});
    });
  }

  ui.customForm.addEventListener('submit', event => {
    event.preventDefault();
    const value = Number(ui.custom.value);
    if (!Number.isFinite(value) || value < core.MIN_RATE || value > core.MAX_RATE) return say(t('invalidRate'), true);
    say('');
    ui.custom.value = '';
    update({enabled: true, rate: core.clampRate(value)});
  });

  ui.auto.addEventListener('change', () => {
    const origins = core.originPatterns(host);
    if (ui.auto.checked) {
      // Must run first in the click handler so Chrome sees the user gesture.
      const request = chrome.permissions.request({origins});
      // Save the choice now in case the popup closes while Chrome shows its prompt.
      // The service worker starts automatic runs only once access is granted.
      update({enabled: true, auto: true});
      request.then(granted => {
        ui.auto.checked = granted;
        if (!granted) {
          update({auto: false});
          say(t('permissionDenied'));
        }
      }, () => {
        ui.auto.checked = false;
        update({auto: false});
        say(t('saveFailed'), true);
      });
    } else {
      update({auto: false});
      chrome.permissions.remove({origins}).catch(() => {});
    }
  });

  ui.presetForm.addEventListener('submit', async event => {
    event.preventDefault();
    const presets = core.parsePresets(ui.presetInput.value);
    if (!presets) return say(t('invalidPresets'), true);
    try {
      prefs = await core.savePrefs(area, {presets});
      render();
      say(t('presetsSaved'));
    } catch {
      say(t('saveFailed'), true);
    }
  });

  ui.openShortcuts.addEventListener('click', () => chrome.tabs.create({url: 'chrome://extensions/shortcuts'}));

  (async () => {
    renderShortcuts().catch(() => {});
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    tabId = tab?.id ?? null;
    host = core.hostFromUrl(tab?.url);
    if (!host || tabId === null) {
      ui.unsupported.hidden = false;
      return;
    }
    ui.host.textContent = host;
    try {
      await core.injectPageScript(tabId);
    } catch {
      ui.unsupported.hidden = false;
      return;
    }
    try {
      prefs = await core.loadPrefs(area);
      site = await core.loadSite(area, host);
      if (site.auto && !(await chrome.permissions.contains({origins: core.originPatterns(host)}))) site = await core.saveSite(area, host, {auto: false});
    } catch {
      say(t('saveFailed'), true);
    }
    ui.auto.checked = site.auto;
    ui.controls.hidden = false;
    render();
    const videos = await countVideos().catch(() => 0);
    say(videos ? t('videosFound', String(videos)) : t('noVideo'));
  })();
})();
