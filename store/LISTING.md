# Chrome 웹스토어 등록정보

> 최종 수정: 2026-11-28 · 대상 버전 2.0.0

제출 순서는 [SUBMIT.md](SUBMIT.md)에 있습니다. 이 문서는 대시보드 칸마다 붙여 넣을 문구입니다.

## 1. 이름 후보

웹스토어 검색(2026-11-28, 영어 검색 결과 상단 확인)으로 같은 이름의 확장이 없는지만 확인했습니다. 상표 등록 검색(KIPRIS, USPTO)은 하지 않았습니다.

| 후보 | 웹스토어 검색 결과 | 메모 |
|---|---|---|
| SpeedKeep (현재 manifest 이름) | 같은 이름 없음. 비슷한 이름으로 "SpeedHold: Hold to Speed Up"이 있음 | 기능(배속 기억)을 바로 설명 |
| Spoolspeed | 검색 결과 없음 | 독특하지만 뜻이 덜 바로 읽힘 |
| Reelpace | 붙여 쓴 이름은 결과 없음. "Reel"이 인스타그램 릴스 전용 확장들과 섞여 검색됨 | 릴스 전용으로 오해될 수 있음 |

제외한 이름: Paceline(같은 이름의 배속 확장 있음), Pace(같은 이름 있음), Tempo Keeper("Keeper®" 상표와 겹침), Brisk Play("Brisk Teaching"과 겹침).

이름을 바꾸려면 `extension/_locales/en/messages.json`과 `ko/messages.json`의 `appName`, `appShort`만 고치면 됩니다.

## 2. 스토어 등록정보 탭

등록정보 이름: manifest의 `appName` 값이 그대로 쓰입니다.
- en: `SpeedKeep: Video Speed per Site`
- ko: `SpeedKeep: 사이트별 영상 배속`

카테고리: 생산성(Productivity) > 도구(Tools)

기본 언어: 영어. 한국어 등록정보를 추가합니다(스토어 언어 선택에서 한국어 추가).

### 짧은 설명 (132자 이하)

manifest `description`(`appDescription`)이 짧은 설명으로 쓰입니다.

en (107자):
```text
Set video playback speed on the sites you choose. Remembers each site, with presets and keyboard shortcuts.
```

ko (57자):
```text
고른 사이트에서만 영상 재생 속도를 바꿉니다. 사이트마다 배속을 기억하고 프리셋과 단축키를 지원합니다.
```

### 상세 설명 (en)

```text
SpeedKeep changes the playback speed of videos on the sites you choose and remembers your speed for each site.

What it does
- Click the toolbar icon on a page with a video and turn speed on for that site.
- One-click presets (1.25×, 1.5×, 2× by default), plus and minus buttons, or type any speed from 0.25× to 16×.
- Each site keeps its own speed. A lecture site can stay at 1.75× while a news site stays at normal speed.
- Keyboard shortcuts: Alt+Shift+. to speed up, Alt+Shift+, to slow down, Alt+Shift+0 to switch on or off (Option+Shift on Mac). Change them at chrome://extensions/shortcuts.
- A small label on the video shows the new speed when it changes.
- If the player resets the speed when the next video or an ad starts, SpeedKeep puts your speed back.
- Edit your own preset list (up to six speeds).

Start automatically, only where you allow it
By default SpeedKeep does nothing until you click its icon or press a shortcut on a tab. If you want a site to start at your speed every time, tick "Start automatically when I open this site". Chrome then asks you to allow access to that one site. Untick it and the access is removed.

Privacy
SpeedKeep collects no data. Your settings (site name, speed, on/off) stay in Chrome on your device. There are no accounts, analytics, ads or network requests.

Limits
Chrome does not let extensions run on chrome:// pages or the Chrome Web Store. A video embedded from another website inside a page may not be reached. Open the video on its own site in that case.

Feedback and source code: https://github.com/Siturasu/video-speed-control
```

### 상세 설명 (ko)

```text
SpeedKeep은 고른 사이트에서만 영상 재생 속도를 바꾸고, 사이트마다 배속을 기억합니다.

기능
- 영상이 있는 페이지에서 툴바 아이콘을 눌러 그 사이트의 배속을 켭니다.
- 프리셋 한 번 누르기(기본 1.25×, 1.5×, 2×), +/- 버튼, 0.25×~16× 직접 입력
- 사이트마다 배속을 따로 기억합니다. 강의 사이트는 1.75×, 뉴스 사이트는 기본 속도로 둘 수 있습니다.
- 단축키: 빠르게 Alt+Shift+. / 느리게 Alt+Shift+, / 켜기·끄기 Alt+Shift+0 (Mac은 Option+Shift). chrome://extensions/shortcuts 에서 바꿀 수 있습니다.
- 배속이 바뀌면 영상 위에 작은 표시가 잠깐 나타납니다.
- 다음 영상이나 광고가 시작될 때 플레이어가 배속을 1배로 되돌리면 고른 배속으로 다시 맞춥니다.
- 프리셋 목록을 최대 6개까지 직접 정할 수 있습니다.

허용한 사이트에서만 자동 적용
기본으로는 탭에서 아이콘을 누르거나 단축키를 누르기 전까지 아무 일도 하지 않습니다. 어떤 사이트를 열 때마다 바로 적용하고 싶으면 "이 사이트를 열면 자동으로 적용"을 켜세요. Chrome이 그 사이트 하나에 대한 접근 허용을 묻습니다. 끄면 접근 권한도 지웁니다.

개인정보
데이터를 수집하지 않습니다. 설정(사이트 이름, 배속, 켜짐 여부)은 사용자 기기의 Chrome 안에만 저장됩니다. 계정, 분석 도구, 광고, 외부 통신이 없습니다.

제한
Chrome 정책상 chrome:// 페이지와 Chrome 웹스토어에서는 동작하지 않습니다. 다른 사이트의 영상을 페이지 안에 넣어 둔 경우에는 닿지 않을 수 있습니다. 그때는 영상 원래 사이트에서 열어 주세요.

의견과 소스 코드: https://github.com/Siturasu/video-speed-control
```

### 그래픽

| 항목 | 파일 | 크기 |
|---|---|---|
| 스토어 아이콘 | `store/icon-128.png` | 128×128 |
| 스크린샷 (en) | `store/screenshots/en-1.png` ~ `en-5.png` | 1280×800 |
| 스크린샷 (ko) | `store/screenshots/ko-1.png` ~ `ko-5.png` | 1280×800 |

스크린샷은 가상 데모 화면(`store/source/screenshot.html`)과 실제 팝업 캡처로 만들었습니다. 실제 서비스 화면, 썸네일, 상표는 들어 있지 않습니다. 다시 만들 때는 `store/source/render.mjs`를 씁니다.

1. 사이트별 배속 기억 / 2. 단축키 / 3. 허용한 사이트 자동 적용 / 4. 프리셋 편집 / 5. 데이터 수집 없음

작은 프로모션 타일(440×280)은 선택 항목이라 만들지 않았습니다.

## 3. 개인정보 보호 탭

### 단일 목적

```text
Change and remember the playback speed of HTML5 videos on websites the user chooses.
```

### 권한 사유 (심사용 영어)

activeTab
```text
When the user clicks the toolbar icon or presses one of the extension's keyboard shortcuts, SpeedKeep needs temporary access to that one tab to change the playback speed of the videos on it. Access ends when the tab navigates away. No other tab is touched.
```

scripting
```text
Used to run the extension's own bundled script (content.js, packaged in the extension) in the tab the user chose, so it can set the playback speed of video elements and show a small speed label. It is also used to register the same bundled script only for sites where the user turned on "Start automatically" and granted access. No remote code is ever executed.
```

storage
```text
Saves the user's settings locally on the device: for each site the user has used, the domain name, whether speed control is on, the chosen speed and whether automatic start is on, plus the user's preset speed list. Nothing is synced or sent anywhere.
```

호스트 권한 (optional_host_permissions `*://*/*`)
```text
Not granted at install and not requested until the user asks for it. When the user ticks "Start automatically when I open this site" in the popup, Chrome asks for access to that single site only (for example *://example.com/* and *://www.example.com/*), so the saved speed is applied as soon as that site's pages load. Unticking the option removes the access. The extension never requests access to all sites at once.
```

원격 코드 사용: `아니요, 원격 코드를 사용하지 않습니다(No, I am not using remote code).`

### 데이터 사용 공개

수집 항목 체크: 아무것도 체크하지 않습니다.
(개인 식별 정보, 건강 정보, 금융 및 결제 정보, 인증 정보, 개인 통신, 위치, 웹 기록, 사용자 활동, 웹사이트 콘텐츠 모두 미체크)

설정에 저장하는 사이트 도메인은 기기 밖으로 나가지 않고 개발자가 받지 않으므로 '수집'에 해당하지 않습니다. 문의가 오면 PRIVACY.md의 저장 항목 설명으로 답합니다.

인증 3개는 모두 체크합니다.
- 승인된 사용 사례 외의 목적으로 제3자에게 사용자 데이터를 판매하거나 전송하지 않음
- 단일 목적과 관련 없는 목적으로 사용자 데이터를 사용하거나 전송하지 않음
- 신용도 판단이나 대출 목적으로 사용자 데이터를 사용하거나 전송하지 않음

### 개인정보처리방침 URL

```text
https://github.com/Siturasu/video-speed-control/blob/main/PRIVACY.md
```

## 4. 설치 경고 (2.0.0 실측)

- 설치 때 권한 경고: 없음. Chrome 158 for Testing에서 `chrome.management.getPermissionWarningsByManifest` 결과가 빈 목록이었습니다.
- 자동 적용을 켤 때 Chrome이 띄우는 요청: "'SpeedKeep: 사이트별 영상 배속'이(가) 추가 승인을 요청했습니다. … example.com 및 www.example.com의 데이터를 읽고 변경" (허용/거부)

## 5. 버전 기록

| 버전 | 날짜 | 변경 | 상태 |
|---|---|---|---|
| 2.0.0 | 2026-11-28 | 한 사이트 전용에서 일반 사이트용으로 전환. 팝업에서 켜기, 사이트별 기억, 단축키, 프리셋 편집, 허용 사이트 자동 적용 | 제출 전 |
