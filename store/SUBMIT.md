# 웹스토어 제출 순서

붙여 넣을 문구는 모두 [LISTING.md](LISTING.md)에 있습니다. 제출 zip은 `extension/` 폴더 내용만 담습니다(만드는 명령은 맨 아래).

## 1. 개발자 등록 (처음 한 번)

1. https://chrome.google.com/webstore/devconsole 에 확장을 올릴 Google 계정으로 로그인합니다.
2. 개발자 계약에 동의하고 등록비(일회 5달러)를 냅니다.
3. 계정 탭에서 게시자 이름과 연락 이메일을 정하고 이메일 인증을 마칩니다. 연락 이메일은 스토어에 공개되고 심사 알림이 오는 주소입니다.

## 2. 새 항목 만들기와 zip 업로드

1. 대시보드에서 "새 항목"을 누릅니다.
2. `video-speed-control-2.0.0.zip`을 올립니다.
3. 업로드 뒤 manifest 오류가 없으면 항목 화면이 열립니다.

## 3. 스토어 등록정보 탭

1. 설명: LISTING.md "상세 설명 (en)"을 붙여 넣습니다.
2. 카테고리: 생산성 > 도구. 언어: 영어.
3. 그래픽: 아이콘 `store/icon-128.png`, 스크린샷 `store/screenshots/en-1.png`~`en-5.png`.
4. 오른쪽 위 언어 선택에서 한국어를 추가하고, 한국어 상세 설명과 `ko-1.png`~`ko-5.png`를 넣습니다.
5. 공식 URL, 홈페이지 URL: `https://github.com/Siturasu/video-speed-control`. 지원 URL: 같은 주소의 `/issues`.
6. 저장합니다.

## 4. 개인정보 보호 탭

1. 단일 목적: LISTING.md의 문구.
2. 권한 사유: activeTab, scripting, storage, 호스트 권한 칸에 LISTING.md의 영어 문구를 하나씩 넣습니다.
3. 원격 코드: "아니요".
4. 데이터 사용: 수집 항목은 모두 미체크, 인증 3개는 모두 체크.
5. 개인정보처리방침 URL: `https://github.com/Siturasu/video-speed-control/blob/main/PRIVACY.md` (브라우저에서 열리는지 먼저 확인)
6. 저장합니다.

## 5. 배포 탭

1. 결제: 무료.
2. 공개 범위: 처음 반응을 보려면 "공개". 먼저 지인만 보게 하려면 "비공개 링크(Unlisted)"로 냈다가 나중에 공개로 바꿉니다.
3. 지역: 모든 지역.

## 6. 제출

1. 오른쪽 위 "검토를 위해 제출"을 누릅니다.
2. "검토 통과 후 자동 게시"를 끄면 통과 뒤 직접 게시 시점을 고를 수 있습니다.
3. 심사는 보통 며칠 걸립니다. 거절 메일이 오면 사유를 LISTING.md 버전 기록에 적고 고친 뒤 버전을 올려 다시 올립니다.

## 제출 zip 만들기

새 버전을 낼 때는 `extension/manifest.json`의 `version`을 올리고 저장소 루트에서 실행합니다.

```sh
v=$(node -p "require('./extension/manifest.json').version")
(cd extension && zip -X -r "../video-speed-control-$v.zip" . -x '.*')
```
