(() => {
  'use strict';
  const {defaults, normalize, rates} = VideoSpeedSettings;
  const CONFIG_EVENT = 'video-speed-control:config:v1';
  const STATUS_EVENT = 'video-speed-control:status:v1';
  let config = {...defaults};
  let currentStatus = {count: 0};
  let host, shadow, select, toggle, status, summary;
  let storageIssue = '';

  function broadcast() {
    document.dispatchEvent(new CustomEvent(CONFIG_EVENT, {detail: JSON.stringify(config)}));
    render();
  }

  function mount() {
    if (host?.isConnected || !document.body || !document.querySelector('video')) return;
    host = document.createElement('div');
    host.id = 'video-speed-control';
    host.style.cssText = 'position:fixed;right:12px;top:12px;z-index:2147483647;color-scheme:light;';
    shadow = host.attachShadow({mode: 'open'});
    shadow.innerHTML = `<style>
      :host{all:initial;font:13px -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;color:#1a1c20}
      *{box-sizing:border-box}details{width:260px;background:#fff;border:1px solid #dcdee3;border-radius:12px;box-shadow:0 2px 10px #0000001a}
      details:not([open]){width:auto}summary{padding:12px;cursor:pointer;font-weight:700;min-height:40px}.body{padding:0 12px 12px}
      .row{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}label{display:flex;align-items:center;gap:8px;min-height:40px}
      select{height:40px;background:#fff;border:1px solid #dcdee3;border-radius:10px;padding:0 12px;font:inherit;color:inherit}
      input{accent-color:#1a1c20;width:16px;height:16px}p{font-size:12px;line-height:1.6;margin:8px 0 0;color:#555d6d}
      :focus-visible{outline:2px solid #5e98fe;outline-offset:2px}[data-warning=true]{color:#921708}
    </style><details open><summary></summary><div class="body"><div class="row"><label><input type="checkbox">배속 유지</label><select aria-label="영상 재생 속도"></select></div><p role="status" aria-live="polite"></p></div></details>`;
    summary = shadow.querySelector('summary');
    select = shadow.querySelector('select');
    toggle = shadow.querySelector('input');
    status = shadow.querySelector('p');
    for (const rate of rates) {
      const option = document.createElement('option'); option.value = String(rate); option.textContent = `${rate}배속`; select.append(option);
    }
    toggle.addEventListener('change', () => save({...config, enabled: toggle.checked}));
    select.addEventListener('change', () => save({...config, rate: Number(select.value)}));
    document.body.append(host);
    render();
  }

  function render() {
    mount();
    if (!host?.isConnected) return;
    host.hidden = !document.querySelector('video');
    summary.textContent = config.enabled ? `영상 배속 ${config.rate}×` : '영상 배속 꺼짐';
    toggle.checked = config.enabled;
    select.value = String(config.rate);
    select.disabled = !config.enabled;
    const s = currentStatus;
    const slow = config.enabled && s.effective !== null && s.effective !== undefined && s.effective < config.rate * 0.75;
    const warning = storageIssue || s.issue || (config.enabled && s.rewinds ? '재생 위치가 되돌아갔습니다. 배속을 낮춰 확인해 주세요.' : '') || (slow ? '실제 진행이 선택한 배속보다 느립니다. 버퍼링이나 재생 제한을 확인해 주세요.' : '');
    const measured = typeof s.effective === 'number' ? ` · 최근 실측 ${s.effective}×` : '';
    status.textContent = warning || (config.enabled ? `현재 ${s.actual ?? config.rate}×${measured}` : '기본 재생 속도로 복구했습니다.');
    status.dataset.warning = String(Boolean(warning));
  }

  async function save(value) {
    config = normalize(value);
    broadcast();
    try { await chrome.storage.local.set(config); storageIssue = ''; }
    catch { storageIssue = '설정 저장 실패: 강의 창을 새로고침해 주세요.'; }
    render();
  }

  document.addEventListener(STATUS_EVENT, event => {
    try { currentStatus = JSON.parse(event.detail); render(); } catch { /* Ignore malformed page status. */ }
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local' || (!changes.enabled && !changes.rate)) return;
    config = normalize({enabled: changes.enabled ? changes.enabled.newValue : config.enabled, rate: changes.rate ? changes.rate.newValue : config.rate});
    broadcast();
  });
  new MutationObserver(mount).observe(document, {childList: true, subtree: true});
  chrome.storage.local.get(defaults).then(value => {config = normalize(value); broadcast();}).catch(() => {
    config.enabled = false; storageIssue = '설정을 읽지 못했습니다. 강의 창을 새로고침해 주세요.'; broadcast();
  });
})();
