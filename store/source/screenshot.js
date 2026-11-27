const params = new URLSearchParams(location.search);
const n = Number(params.get('n') || 1);
const lang = params.get('lang') === 'ko' ? 'ko' : 'en';
const copy = {
  en: [
    ['A speed for every site', 'Turn it on for the site you are watching. SpeedKeep remembers the speed for that site next time.', 'a', '1.5×'],
    ['Change speed from the keyboard', 'Speed up, slow down or switch off without opening anything. On Windows, use Alt+Shift.', null, '1.75×'],
    ['Starts by itself only where you allow it', 'Chrome asks once for that one site. Every other site stays untouched.', 'b', '1.5×'],
    ['Your own presets', 'Keep up to six speeds one click away, or type any speed from 0.25× to 16×.', 'c', '1.5×'],
    ['Nothing leaves your browser', 'No account, no tracking, no ads.', 'a', '1.5×']
  ],
  ko: [
    ['사이트마다 배속을 기억합니다', '보고 있는 사이트에서 켜면, 다음에 그 사이트를 열 때도 같은 배속을 씁니다.', 'a', '1.5×'],
    ['단축키로 바로 바꾸기', '창을 열지 않고 빠르게, 느리게, 끄기를 바로 합니다. Windows에서는 Alt+Shift입니다.', null, '1.75×'],
    ['허용한 사이트에서만 자동 적용', 'Chrome이 그 사이트 하나에 대해서만 한 번 묻습니다. 다른 사이트에는 손대지 않습니다.', 'b', '1.5×'],
    ['프리셋은 직접 정하기', '자주 쓰는 배속 6개까지 한 번에 고르고, 0.25배에서 16배까지 직접 입력할 수도 있습니다.', 'c', '1.5×'],
    ['브라우저 밖으로 나가는 정보가 없습니다', '계정, 추적, 광고가 없습니다.', 'a', '1.5×']
  ]
};
const keys = {en: [['Faster', '.'], ['Slower', ','], ['On / off', '0']], ko: [['빠르게', '.'], ['느리게', ','], ['켜기/끄기', '0']]};
const card = {
  en: [['Settings stay on this device', 'Only your speeds and presets are saved, in Chrome.'], ['No data collected', 'No analytics, no servers, no remote code.'], ['Minimal access', 'Works on the tab you choose. Nothing runs elsewhere.']],
  ko: [['설정은 이 기기에만', '배속과 프리셋만 Chrome 안에 저장합니다.'], ['수집하는 데이터 없음', '분석 도구, 서버, 원격 코드가 없습니다.'], ['최소한의 접근', '직접 고른 탭에서만 동작합니다.']]
};
const [title, sub, pop, toast] = copy[lang][n - 1];
document.documentElement.lang = lang;
document.getElementById('title').textContent = title;
document.getElementById('sub').textContent = sub;
document.getElementById('toast').textContent = toast;
if (pop && n !== 5) document.getElementById('popimg').src = `popup-${lang}-${pop}.png`;
else document.getElementById('popup').hidden = true;
if (n === 2) {
  const box = document.getElementById('keys');
  box.hidden = false;
  for (const [label, key] of keys[lang]) {
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = '<kbd>⌥</kbd><kbd>⇧</kbd><kbd></kbd><span></span>';
    row.children[2].textContent = key;
    row.children[3].textContent = label;
    box.append(row);
  }
}
if (n === 5) {
  const box = document.getElementById('card');
  box.hidden = false;
  for (const [head, body] of card[lang]) {
    const item = document.createElement('div');
    item.innerHTML = '<b></b><span></span>';
    item.firstChild.textContent = head;
    item.lastChild.textContent = body;
    box.append(item);
  }
}
