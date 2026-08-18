# 친절 키오스크

노년층·중장년층이 실제 키오스크(무인 단말기)를 사용할 때 실시간으로 도와주는 모바일 웹앱입니다.
설치 없이 브라우저에서 바로 열 수 있는 PWA(Progressive Web App) 형태로 만들었습니다.

## 핵심 기능

- **카메라로 화면 인식 + AR 버튼 표시**: 사용자가 실제 키오스크 화면을 사진으로 찍으면, Claude(Anthropic)의 이미지 인식으로 어떤 화면인지 판단하고, 다음에 눌러야 할 버튼의 위치를 찾아 찍은 사진 위에 노란 테두리로 직접 표시해줍니다.
- **단계별 안내**: 병원 접수·수납 / 은행 ATM / 패스트푸드·카페 주문, 3종의 사용 흐름을 단계별로 큰 글씨와 음성으로 안내합니다.
- **노년층 UX**: 큰 글씨, 큰 버튼, 고대비 색상, 단계마다 자동 음성 안내(TTS), 쉬운 뒤로가기, "사람이랑 이야기하고 싶어요" 버튼을 제공합니다.

## 왜 "사진 찍어서 인식"인가

완전한 실시간 프레임 단위 AR 인식은 별도의 전용 비전 모델과 고정형 인프라가 필요해 프로토타입 범위를 벗어납니다.
대신 "카메라로 화면을 비추고 사진 한 장을 찍으면 즉시 인식"하는 방식으로 실질적인 체감 속도를 유지하면서
LLM 비전 API(Claude)로 실제 화면을 이해하도록 구현했습니다. 카메라 인식이 실패하거나 API 키가 설정되지
않은 경우에도 항상 수동으로 키오스크 종류를 골라 안내를 볼 수 있습니다.

## 실행 방법

```bash
npm install
npm run dev
```

카메라 인식 기능을 사용하려면 `.env.local`에 Anthropic API 키를 설정하세요 (키가 없어도 수동 안내 기능은 정상 동작합니다):

```
ANTHROPIC_API_KEY=sk-ant-...
```

## 프로젝트 구조

```
app/
  page.tsx                 홈 화면 (카메라 진입 + 키오스크 목록)
  camera/page.tsx           카메라 촬영 및 인식 화면
  guide/[kiosk]/page.tsx    키오스크별 단계 안내 화면
  api/recognize/route.ts    사진을 Claude Vision에 전달해 화면을 인식하는 API
lib/
  kioskData.ts               병원/ATM/패스트푸드 3종의 실사용 단계 데이터
  useTTS.ts                  브라우저 음성 합성(TTS) 훅
components/
  BigButton.tsx / StepCard.tsx / TopBar.tsx   노년층 친화 UI 컴포넌트
public/manifest.json         PWA 매니페스트 (홈 화면에 추가 가능)
legacy-island-game/           이 브랜치와 무관한 이전 Godot 프로토타입 (보존용, 삭제하지 않고 이동만 함)
```

## 데이터 출처와 한계

`lib/kioskData.ts`의 단계별 안내 문구는 특정 제조사·매장의 실제 화면을 캡처하거나 공식 매뉴얼을
그대로 옮긴 것이 아닙니다. 병원 접수/수납, ATM, 패스트푸드 키오스크의 일반적인 사용 순서를
웹 검색으로 확인해 작성했습니다:

- 병원 키오스크 흐름: [병원 키오스크 사용법 - 서울아산병원](https://www.amc.seoul.kr/asan/mobile/healthtv/video/videoDetail.do?videoId=4683&categoryCode=C02009002), [서울대병원 진료비 하이패스](http://www.snuh.org/content/M001004006.do)
- ATM 흐름: [신한은행 ATM 돈찾기 가이드](https://nsol.shinhan.com/contents/guide/step06__withdrawal-from-atm/03.html), [KB 국민은행 ATM 사용법](https://kbthink.com/life/daily/atm.html)
- 패스트푸드 키오스크 흐름: [키오스크 주문 쉬운 사용법 - JinBlog](https://jinblog.kr/%ED%82%A4%EC%98%A4%EC%8A%A4%ED%81%AC-%EC%A3%BC%EB%AC%B8-%EC%89%AC%EC%9A%B4-%EC%82%AC%EC%9A%A9%EB%B2%95-%EC%B2%98%EC%9D%8C-%EC%82%AC%EC%9A%A9%ED%95%98%EB%8A%94-%EB%B6%84%EB%8F%84-%EB%8D%9C-%EB%8B%B9/), [50대 이상 키오스크 사용 방법 - 골든에이지 노트](https://goldenagenote.com/50%EB%8C%80-%EC%9D%B4%EC%83%81-%ED%82%A4%EC%98%A4%EC%8A%A4%ED%81%AC-%EC%82%AC%EC%9A%A9-%EB%B0%A9%EB%B2%95%EF%BD%9C%EC%A3%BC%EB%AC%B8%EB%B6%80%ED%84%B0-%EC%B9%B4%EB%93%9C-%EA%B2%B0%EC%A0%9C%EA%B9%8C/)

여러 출처에서 공통으로 확인되는 **큰 흐름(단계 순서, 일반적인 버튼 명칭)** 은 신뢰할 수 있지만,
매장·기관·제조사마다 화면 문구와 순서가 조금씩 다를 수 있습니다. 이 앱은 "정확한 화면 재현"이
아니라 "낯선 키오스크 앞에서 당황하지 않도록 돕는 일반적인 참고 안내"를 목표로 합니다. 홈 화면
하단에도 이 점을 안내하는 문구를 넣었습니다.

## 다음 단계 (아직 미구현)

- 카메라를 계속 비추기만 해도 실시간으로 버튼 위치가 갱신되는 완전한 프레임 단위 AR (현재는 "사진 한 장 찍기 → 그 사진 위에 위치 표시" 방식)
- 병원/은행/매장별 실제 UI 스크린샷을 직접 수집한 데이터셋 기반 인식 정확도 개선
- 사용 기록 저장, 자주 가는 곳 즐겨찾기
- 다국어(외국인 노동자 등) 지원
