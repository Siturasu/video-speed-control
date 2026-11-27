# SpeedKeep (video-speed-control)

고른 사이트에서만 영상 재생 속도를 바꾸고, 사이트마다 배속을 기억하는 Chrome 확장 프로그램입니다.

- 툴바 아이콘을 눌러 지금 탭에서 켭니다. 기본 프리셋 1.25×, 1.5×, 2×와 직접 입력(0.25×~16×)
- 사이트(도메인)마다 켜짐 여부와 배속을 따로 기억
- 단축키: 빠르게 `Alt+Shift+.`, 느리게 `Alt+Shift+,`, 켜기/끄기 `Alt+Shift+0` (Mac은 Option+Shift). `chrome://extensions/shortcuts`에서 바꿀 수 있습니다.
- "이 사이트를 열면 자동으로 적용"을 켠 사이트에서만, 사용자가 허용한 뒤 페이지를 열 때 자동으로 적용
- 데이터 수집, 외부 통신, 원격 코드가 없습니다. [개인정보처리방침](PRIVACY.md)

## 설치

Chrome 웹스토어 등록 전에는 압축해제 방식으로 설치합니다.

1. 이 저장소를 내려받아 압축을 풉니다.
2. `chrome://extensions`에서 오른쪽 위 개발자 모드를 켭니다.
3. "압축해제된 확장 프로그램을 로드합니다"를 누르고 `extension` 폴더를 고릅니다.

## 개발

```sh
node --test test/   # 배속 계산과 사이트별 설정 저장 단위 테스트
```

- `extension/` 확장 본체. 웹스토어 제출 zip에는 이 폴더만 들어갑니다.
- `store/` 스토어 등록정보, 스크린샷, 제출 순서([store/SUBMIT.md](store/SUBMIT.md))
- 설정 구조: `prefs`(스키마 버전, 프리셋, 단계, `features` 플래그)와 사이트별 `site:<도메인>` 키. `extension/lib/core.js` 참고.

## English

SpeedKeep sets the playback speed of HTML5 videos on the sites you choose and remembers it per site. Presets, custom speeds, keyboard shortcuts, and optional automatic start for sites you allow. No data collection, no network requests. See [PRIVACY.md](PRIVACY.md).
