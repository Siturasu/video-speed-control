(() => {
  'use strict';
  const {defaults, normalize, rates} = VideoSpeedSettings;
  const enabled = document.getElementById('enabled');
  const rate = document.getElementById('rate');
  const status = document.getElementById('status');
  for (const value of rates) {
    const option = document.createElement('option'); option.value = String(value); option.textContent = `${value}배속`; rate.append(option);
  }
  async function save() {
    const value = normalize({enabled: enabled.checked, rate: Number(rate.value)});
    rate.disabled = !value.enabled;
    try { await chrome.storage.local.set(value); status.className = ''; status.textContent = value.enabled ? `${value.rate}배속으로 저장했습니다.` : '배속 유지를 해제했습니다.'; }
    catch { status.className = 'error'; status.textContent = '저장에 실패했습니다. 팝업을 다시 열어 주세요.'; }
  }
  enabled.disabled = true;
  rate.disabled = true;
  chrome.storage.local.get(defaults).then(raw => {
    const value = normalize(raw); enabled.checked = value.enabled; rate.value = String(value.rate); enabled.disabled = false; rate.disabled = !value.enabled;
  }).catch(() => {status.className = 'error'; status.textContent = '설정을 읽지 못했습니다. 팝업을 다시 열어 주세요.';});
  enabled.addEventListener('change', save);
  rate.addEventListener('change', save);
})();
