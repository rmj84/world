# Island Life

내 섬을 자유롭게 꾸미는 PC 게임 프로토타입입니다. 두근두근타운/스타듀밸리에서 영감을 받았습니다.
현재 단계는 **섬 꾸미기(싱글 플레이)** 까지이며, 팔로우한 유저의 섬이 옆에 붙는 소셜 기능은 다음 단계입니다.

## 실행 방법

1. [Godot Engine 4.3 이상](https://godotengine.org/download) 설치 (무료)
2. Godot 실행 → "Import" → 이 저장소의 `project.godot` 선택
3. 에디터에서 F5(또는 상단 재생 버튼)로 실행

Windows용 단독 실행 파일(.exe)이 필요하면 Godot 에디터의 `Project > Export`에서
"Windows Desktop" 프리셋을 추가해 내보낼 수 있습니다. (내보내기 템플릿 최초 1회 다운로드 필요)

## 조작법

| 키 | 동작 |
|---|---|
| W A S D / 방향키 | 캐릭터 이동 |
| B | 꾸미기(건축) 모드 켜기/끄기 |
| 마우스 이동 (꾸미기 모드) | 배치 위치 미리보기 |
| 좌클릭 (꾸미기 모드) | 선택한 오브젝트 배치 |
| 우클릭 (꾸미기 모드) | 클릭한 오브젝트 제거 |
| Q / E (꾸미기 모드) | 배치 오브젝트 90도 회전 |
| Esc | 꾸미기 모드 종료 |

배치 가능한 오브젝트: 나무, 꽃, 벤치, 울타리, 가로등, 바위 (하단 팔레트에서 선택)

## 저장

섬 배치 정보는 오브젝트를 놓거나 지울 때마다 자동 저장됩니다.
저장 위치: Godot의 `user://island_save.json` (Windows 기준 보통
`%APPDATA%/Godot/app_userdata/Island Life/island_save.json`)

## 프로젝트 구조

```
project.godot
scripts/
  decoration_catalog.gd   배치 가능한 오브젝트 목록 (autoload: Catalog)
  save_system.gd          섬 레이아웃 저장/불러오기 (autoload: SaveSystem)
  island_grid.gd           그리드 좌표 <-> 월드 좌표 변환, 섬 범위 체크
  player.gd                캐릭터 이동
  camera_rig.gd            3인칭 각도 카메라(캐릭터 추적)
  build_mode_controller.gd 꾸미기 모드 핵심 로직 (배치/제거/회전/저장)
  decoration_palette.gd    꾸미기 모드 UI 팔레트
scenes/
  main.tscn                게임 메인 씬 (진입점)
  island.tscn               섬 지형(잔디/모래/바다)
  player.tscn                캐릭터
  decoration_palette.tscn    꾸미기 UI
  decorations/                나무·꽃·벤치·울타리·가로등·바위 프리팹
```

## 그래픽에 대한 메모

지금은 전부 Godot 기본 프리미티브 도형(구, 원기둥, 상자)으로 만든 플레이스홀더 아트입니다.
"귀여운 로우폴리" 스타일을 제대로 완성하려면 Kenney.nl, Quaternius 같은 무료 로우폴리
에셋팩으로 각 `decorations/*.tscn`의 메시를 교체하면 됩니다. 구조(그리드 배치, 저장, 충돌)는
그대로 유지한 채 비주얼만 바꿀 수 있습니다.

## 다음 단계 (아직 미구현)

- 계정/로그인, 유저별 섬 서버 저장 (지금은 로컬 파일 저장만 있음)
- 다른 유저 팔로우, 팔로우한 유저의 섬이 내 섬 옆에 붙어서 함께 접속해 보이는 기능
- 실시간 멀티플레이(같은 섬에서 여러 캐릭터 동시 이동)
