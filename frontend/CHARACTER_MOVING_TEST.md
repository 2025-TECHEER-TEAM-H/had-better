# 캐릭터 이동 테스트 가이드

## 개요

실제 대중교통 API가 제공하는 위치 데이터(경도/위도)를 시뮬레이션하여 캐릭터가 지도 위에서 부드럽게 이동하는 기능을 테스트합니다.

## 테스트 목적

1. 30초마다 업데이트되는 API 위치 데이터 시뮬레이션
2. 위치 간 부드러운 보간(interpolation) 이동 구현
3. 걷기 애니메이션 지속적 재생
4. 실제 API 연동 전 로직 검증

## 파일 구조

```
frontend/src/
├── components/
│   ├── CharacterMovingTest.tsx   # 테스트 전용 컴포넌트
│   └── map/
│       ├── naviSprite.ts          # 캐릭터 스프라이트 등록
│       └── naviLayer.ts           # 캐릭터 레이어 관리
└── App.tsx                        # 테스트 모드 스위치
```

## 사용 방법

### 1. 테스트 모드 활성화

`frontend/src/App.tsx` 파일에서:

```typescript
// 23-25줄
const CHARACTER_MOVING_TEST_MODE = true; // false → true로 변경
```

### 2. 개발 서버 실행

```bash
cd frontend
npm run dev
```

### 3. 브라우저에서 확인

http://localhost:5173 접속

- 부평역 근처에서 Green 캐릭터가 걷기 시작
- 30초마다 새 위치로 부드럽게 이동
- 좌측 상단 패널에서 현재 위치 정보 확인

## 구현 내용

### 1. 더미 데이터 생성 (30초 주기)

```typescript
// CharacterMovingTest.tsx 103-118줄
setInterval(() => {
  setCurrentLocation((prev) => {
    // 현실적인 이동 거리: 30-50m
    const walkingDistance = 0.0003 + Math.random() * 0.0002;
    const angle = Math.random() * 2 * Math.PI;

    return {
      latitude: prev.latitude + walkingDistance * Math.sin(angle),
      longitude: prev.longitude + walkingDistance * Math.cos(angle),
      timestamp: new Date().toISOString(),
    };
  });
}, 30000);
```

**실제 API 형태:**

```json
{
  "latitude": 37.489123,
  "longitude": 126.735456,
  "timestamp": "2026-01-18T20:00:00+09:00"
}
```

### 2. 부드러운 보간 이동

```typescript
// CharacterMovingTest.tsx 131-158줄
const duration = 30000; // 30초
const frameInterval = 50; // 50ms
const totalFrames = 600; // 30000 / 50

// 선형 보간
const t = currentFrame / totalFrames;
const interpolatedPos = [
  startPos[0] + (endPos[0] - startPos[0]) * t,
  startPos[1] + (endPos[1] - startPos[1]) * t,
];
```

- 30초 동안 600개 프레임으로 분할
- 50ms마다 위치 업데이트
- 순간이동 없이 자연스럽게 이동

### 3. 걷기 애니메이션

```typescript
// CharacterMovingTest.tsx 59-72줄
setInterval(() => {
  walkFrameRef.current = (walkFrameRef.current + 1) % 4;
  updateNaviFeature(map, position, bearing, walkFrame, 'walking');
}, 120);
```

- 120ms마다 프레임 변경 (0 → 1 → 2 → 3 → 0 반복)
- idle, walk_a, idle, walk_b 순서로 애니메이션

### 4. 방향(Bearing) 계산

```typescript
// CharacterMovingTest.tsx 128-133줄
const dLng = ((lon2 - lon1) * Math.PI) / 180;
const y = Math.sin(dLng) * Math.cos(lat2);
const x = Math.cos(lat1) * Math.sin(lat2) - ...;
const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
```

- 이전 위치와 현재 위치로 이동 방향 계산
- 0° = 북쪽, 90° = 동쪽, 180° = 남쪽, 270° = 서쪽

## 실제 API 연동 방법

### API 엔드포인트 예시

```
GET /api/v1/routes/{routeId}/location
```

### 응답 형식

```json
{
  "status": "success",
  "data": {
    "latitude": 37.489123,
    "longitude": 126.735456,
    "timestamp": "2026-01-18T20:00:00+09:00"
  }
}
```

### 코드 수정 방법

`CharacterMovingTest.tsx` 103-119줄을 다음과 같이 수정:

```typescript
// 더미 데이터 생성 부분 삭제하고:
setInterval(async () => {
  try {
    const response = await fetch(`/api/v1/routes/${routeId}/location`);
    const data = await response.json();

    setPreviousLocation(currentLocation);
    setCurrentLocation({
      latitude: data.data.latitude,
      longitude: data.data.longitude,
      timestamp: data.data.timestamp,
    });
  } catch (error) {
    console.error('❌ API 호출 실패:', error);
  }
}, 30000);
```

## 테스트 시나리오

### 1. 기본 동작 확인

- [x] 캐릭터가 부평역 근처에 표시됨
- [x] 걷기 애니메이션이 계속 재생됨
- [x] 30초마다 콘솔에 "📍 새 위치 데이터 생성" 로그 출력
- [x] 새 위치로 부드럽게 이동 (순간이동 없음)

### 2. 이동 거리 확인

- [x] 30초당 30-50m 이동 (현실적인 걷기 속도)
- [x] 위도/경도 변화량: 약 0.0003-0.0005도

### 3. 애니메이션 확인

- [x] 프레임이 0 → 1 → 2 → 3 순서로 변경
- [x] 120ms 간격으로 부드럽게 전환

### 4. 방향 확인

- [x] 이동 방향에 따라 캐릭터 회전
- [x] Bearing 값이 콘솔에 정확히 출력

## 콘솔 로그 확인

테스트 실행 시 다음 로그가 출력되어야 합니다:

```
✅ 테스트 지도 초기화 완료
🎬 걷기 애니메이션 시작
📍 새 위치 데이터 생성: {이전: "37.489000, 126.735000", 신규: "37.489340, 126.735220"}
🚶 보간 이동 시작 (30초 동안 600프레임)
```

## 문제 해결

### Q: 캐릭터가 표시되지 않음

A: 캐릭터 이미지 파일 확인:

```bash
ls frontend/public/assets/sprites/characters/green/
# character_green_idle.png
# character_green_walk_a.png
# character_green_walk_b.png
# character_green_jump.png
# character_green_front.png
```

### Q: 애니메이션이 작동하지 않음

A: 브라우저 콘솔에서 "🎬 걷기 애니메이션 시작" 로그 확인

- 로그가 없으면 `onMapLoad` 함수가 실행되지 않은 것
- Mapbox Access Token 확인 필요

### Q: 30초가 아닌 다른 주기로 업데이트됨

A: `CharacterMovingTest.tsx` 119줄 interval 값 확인:

```typescript
}, 30000); // 30초 = 30000ms
```

### Q: 캐릭터가 순간이동함

A: 보간 로직 확인:

- `totalFrames`가 600인지 확인
- `frameInterval`이 50ms인지 확인

## 캐릭터 변경 방법

Green → Yellow로 변경하려면:

`frontend/src/components/map/naviSprite.ts` 18줄:

```typescript
const base = '/assets/sprites/characters/yellow'; // green → yellow
```

사용 가능한 캐릭터:

- green
- yellow
- pink
- purple
- gray

## 다음 단계

1. ✅ 더미 데이터로 테스트 완료
2. ⏳ 실제 API 연동 준비
3. ⏳ 여러 캐릭터 동시 표시 (봇 vs 사용자)
4. ⏳ 경로선 표시
5. ⏳ 도착 판정 로직 추가

## 참고

- 이동 거리 계산: 위도/경도 1도 ≈ 111km
- 걷기 속도: 약 4-5km/h (30초에 30-50m)
- 프레임 간격: 120ms (Yellow 캐릭터와 동일)
- 보간 프레임: 600개 (30000ms ÷ 50ms)
