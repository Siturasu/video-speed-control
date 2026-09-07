(() => {
  'use strict';
  const CONFIG_EVENT = 'video-speed-control:config:v1';
  const STATUS_EVENT = 'video-speed-control:status:v1';
  const nativeRate = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'playbackRate');
  if (!nativeRate?.get || !nativeRate?.set) return;
  const records = new Map();
  let config = {enabled: false, rate: 2};
  let issue = '';
  let pending = false;
  let lastPayload = '';

  function apply(video) {
    let record = records.get(video);
    try {
      if (!record) {
        const previous = Object.getOwnPropertyDescriptor(video, 'playbackRate');
        if (previous && !previous.configurable) throw new Error('다른 배속 도구를 끄고 새로고침해 주세요.');
        const getter = function () { return nativeRate.get.call(this); };
        const setter = function () {
          if (nativeRate.get.call(this) !== config.rate) nativeRate.set.call(this, config.rate);
        };
        record = {previous, getter, setter, sample: null, rewinds: []};
        Object.defineProperty(video, 'playbackRate', {configurable: true, get: getter, set: setter});
        records.set(video, record);
      }
      if (nativeRate.get.call(video) !== config.rate) nativeRate.set.call(video, config.rate);
    } catch (error) {
      issue = error.message || '이 영상에서 선택한 배속을 적용하지 못했습니다.';
    }
  }

  function configure(event) {
    try {
      const value = JSON.parse(event.detail);
      if (typeof value.enabled !== 'boolean' || !Number.isFinite(value.rate) || value.rate < 1 || value.rate > 10) return;
      config = {enabled: value.enabled, rate: Math.round(value.rate * 4) / 4};
      for (const record of records.values()) { record.sample = null; record.rewinds = []; }
      scan();
    } catch { /* Ignore malformed page events. No privileged operation is exposed. */ }
  }

  function publish(videos) {
    const video = videos.find(item => !item.paused && !item.ended) || videos[0];
    const record = video && records.get(video);
    const payload = JSON.stringify({
      count: videos.length,
      enabled: config.enabled,
      requested: config.rate,
      actual: video ? nativeRate.get.call(video) : null,
      effective: record?.effective ?? null,
      rewinds: record?.rewinds.length ?? 0,
      issue
    });
    if (payload !== lastPayload) {
      lastPayload = payload;
      document.dispatchEvent(new CustomEvent(STATUS_EVENT, {detail: payload}));
    }
  }

  function restore(video, record) {
    const own = Object.getOwnPropertyDescriptor(video, 'playbackRate');
    if (own?.get !== record.getter || own?.set !== record.setter) return;
    if (record.previous) Object.defineProperty(video, 'playbackRate', record.previous);
    else delete video.playbackRate;
    nativeRate.set.call(video, 1);
  }

  function sample(video, record) {
    const now = performance.now();
    const position = video.currentTime;
    if (video.paused || video.ended || video.seeking || document.hidden) {
      record.sample = null;
      record.effective = null;
      return;
    }
    if (record.lastPosition != null && position < record.lastPosition - 0.1) record.rewinds.push(now);
    record.lastPosition = position;
    record.rewinds = record.rewinds.filter(time => now - time < 10000);
    if (!record.sample) record.sample = {now, position};
    const elapsed = (now - record.sample.now) / 1000;
    if (elapsed >= 5) {
      record.effective = Math.max(0, Math.round((position - record.sample.position) / elapsed * 100) / 100);
      record.sample = {now, position};
    }
  }

  function scan() {
    pending = false;
    issue = '';
    const videos = Array.from(document.querySelectorAll('video'));
    for (const [video, record] of records) {
      if (!config.enabled || !video.isConnected) {
        restore(video, record);
        records.delete(video);
      }
    }
    if (config.enabled) {
      for (const video of videos) {
        apply(video);
        const record = records.get(video);
        if (record) sample(video, record);
      }
    }
    publish(videos);
  }

  function schedule() {
    if (pending) return;
    pending = true;
    queueMicrotask(scan);
  }

  document.addEventListener(CONFIG_EVENT, configure);
  document.addEventListener('play', schedule, true);
  document.addEventListener('loadedmetadata', schedule, true);
  document.addEventListener('ratechange', schedule, true);
  new MutationObserver(schedule).observe(document, {childList: true, subtree: true});
  setInterval(scan, 500);
  scan();
})();
