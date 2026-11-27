// Runs in the page only after the user opens the popup, presses a shortcut, or allows
// automatic start for this site. Keeps the chosen speed on every video in the frame.
(() => {
  'use strict';
  if (globalThis.__videoSpeedControlLoaded) return;
  globalThis.__videoSpeedControlLoaded = true;

  const core = globalThis.VSC;
  const topOrigin = location.ancestorOrigins?.length ? location.ancestorOrigins[location.ancestorOrigins.length - 1] : location.origin;
  const host = core.hostFromUrl(topOrigin) || core.siteHost(location.hostname);
  const key = core.siteKey(host);
  const isTop = window === window.top;
  const touched = new WeakSet();
  const resets = new WeakMap();
  let site = {enabled: false, rate: 1, auto: false};
  let prefs = core.normalizePrefs();
  let toastTimer = 0;

  function videos() {
    return Array.from(document.querySelectorAll('video'));
  }

  function setRate(video) {
    if (!site.enabled) return;
    if (video.playbackRate !== site.rate) {
      try {
        video.playbackRate = site.rate;
        touched.add(video);
      } catch { /* Some players reject unusual rates. Leave them unchanged. */ }
    }
  }

  function applyAll() {
    for (const video of videos()) {
      if (site.enabled) setRate(video);
      else if (touched.has(video)) {
        touched.delete(video);
        video.playbackRate = 1;
      }
    }
  }

  // Players often reset the speed when a new video or ad loads. Put ours back, but stop
  // after repeated resets in one second so we never fight a player in a loop.
  function onMediaEvent(event) {
    const video = event.target;
    if (!(video instanceof HTMLVideoElement) || !site.enabled || video.playbackRate === site.rate) return;
    const now = performance.now();
    const recent = (resets.get(video) || []).filter(time => now - time < 1000);
    if (recent.length >= 10) return;
    recent.push(now);
    resets.set(video, recent);
    setRate(video);
  }

  function toast(text) {
    if (!isTop && !videos().length) return;
    let box = document.getElementById('video-speed-control-toast');
    if (!box) {
      box = document.createElement('div');
      box.id = 'video-speed-control-toast';
      const shadow = box.attachShadow({mode: 'closed'});
      shadow.innerHTML = '<style>:host{all:initial;position:fixed;top:16px;left:16px;z-index:2147483647;pointer-events:none}' +
        'div{font:600 15px/1.2 system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;color:#fff;background:#111c;' +
        'padding:8px 12px;border-radius:8px;transition:opacity .2s}</style><div role="status"></div>';
      box.label = shadow.querySelector('div');
    }
    const parent = document.fullscreenElement || document.documentElement;
    if (box.parentNode !== parent) parent.append(box);
    // Show the label on the video being watched, or at the window corner if none is visible.
    const target = videos().map(video => video.getBoundingClientRect())
      .find(rect => rect.width > 80 && rect.height > 60 && rect.bottom > 0 && rect.top < innerHeight);
    box.style.top = `${Math.max(8, (target?.top ?? 0) + 12)}px`;
    box.style.left = `${Math.max(8, (target?.left ?? 0) + 12)}px`;
    box.label.textContent = text;
    box.label.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { box.label.style.opacity = '0'; }, 1200);
  }

  function describe() {
    return site.enabled ? core.formatRate(site.rate) : chrome.i18n.getMessage('toastOff');
  }

  async function runCommand(command) {
    let patch;
    if (command === 'toggle') patch = {enabled: !site.enabled};
    else if (command === 'faster' || command === 'slower') {
      const base = site.enabled ? site.rate : 1;
      patch = {enabled: true, rate: core.stepRate(base, prefs.step, command === 'faster' ? 1 : -1)};
    } else return site;
    site = await core.saveSite(chrome.storage.local, host, patch);
    applyAll();
    toast(describe());
    return site;
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;
    if (changes[core.PREFS_KEY]) prefs = core.normalizePrefs(changes[core.PREFS_KEY].newValue);
    if (!changes[key]) return;
    const before = site;
    site = core.normalizeSite(changes[key].newValue, prefs);
    applyAll();
    if (before.enabled !== site.enabled || before.rate !== site.rate) toast(describe());
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (sender.id !== chrome.runtime.id || message?.type !== 'vsc:command' || !isTop) return;
    runCommand(message.command).then(sendResponse, () => sendResponse(null));
    return true;
  });

  for (const type of ['play', 'loadedmetadata', 'ratechange']) document.addEventListener(type, onMediaEvent, true);

  (async () => {
    try {
      prefs = await core.loadPrefs(chrome.storage.local);
      site = await core.loadSite(chrome.storage.local, host);
      applyAll();
    } catch { /* Storage is unavailable while the extension reloads. The next event retries. */ }
  })();
})();
