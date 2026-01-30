# Turf.js 경로 보간 - 초보자를 위한 설명

## 문제: 왜 보간이 필요한가?

서울시 공공데이터 API는 버스 GPS 좌표를 **15~30초에 한 번**만 알려줍니다.

이걸 그대로 화면에 반영하면 이런 일이 벌어집니다:

```
0초:   캐릭터가 A 지점에 있음
       ... 30초 동안 가만히 멈춰 있음 ...
30초:  캐릭터가 갑자기 B 지점으로 순간이동
       ... 30초 동안 또 가만히 ...
60초:  캐릭터가 갑자기 C 지점으로 순간이동
```

사용자가 보기에 캐릭터가 **뚝뚝 끊기면서 워프**하는 것처럼 보입니다.

우리가 원하는 건 이겁니다:

```
0초:   캐릭터가 A 지점에서 출발
1초:   A에서 조금 이동
2초:   조금 더 이동
...
30초:  B 지점에 도착 (부드럽게)
31초:  B에서 조금 이동
...
60초:  C 지점에 도착 (부드럽게)
```

이 "중간 위치를 계산해서 채워 넣는 것"이 **보간(interpolation)**입니다.

---

## 단순한 직선 보간 vs 경로 보간

### 직선 보간 (우리가 안 쓰는 방식)

A 지점과 B 지점 사이를 그냥 직선으로 잇는 방법입니다.

```
A ─────────────────── B
     직선으로 이동
```

문제: 버스는 도로를 따라 움직이지, 건물을 뚫고 직선으로 가지 않습니다.

```
A ─ ─ ─ ─ ─ ─ ─ ─ ─ B     ← 직선 (건물 위를 날아감)
A ━━━╮               B
     ┃   ╭━━━━━━━━━━━╯     ← 실제 도로 (이걸 따라가야 함)
     ╰━━━╯
```

### 경로 보간 (우리가 쓰는 방식)

TMap API가 알려준 **실제 도로 경로선** 위를 따라가는 방법입니다.
이걸 가능하게 해주는 라이브러리가 **Turf.js**입니다.

---

## Turf.js가 뭔가요?

Turf.js는 **지도/지리 계산 전용 JavaScript 라이브러리**입니다. 브라우저에서 돌아가며, 우리 프로젝트에서는 이런 기능들을 사용합니다:

| Turf 함수 | 하는 일 | 쉬운 비유 |
|-----------|---------|-----------|
| `turf.lineString()` | 좌표 배열을 "선"으로 만듦 | 점들을 이어서 길을 그림 |
| `turf.nearestPointOnLine()` | GPS 좌표를 선 위의 가장 가까운 점으로 붙임 | 도로 밖에 있는 점을 도로 위로 끌어당김 |
| `turf.along()` | 선의 시작점에서 N km 떨어진 점을 구함 | "이 길 따라서 3km 가면 어디야?" |
| `turf.bearing()` | 두 점 사이의 방향을 구함 | "A에서 B를 바라보면 몇 도 방향이야?" |
| `turf.distance()` | 두 점 사이 거리를 구함 | "A에서 B까지 몇 미터야?" |
| `turf.length()` | 선의 전체 길이를 구함 | "이 길은 총 몇 km야?" |

---

## 보간이 일어나는 과정 (5단계)

실제 코드 흐름을 순서대로 설명합니다.

### 1단계: 경로선(routeLine) 만들기

경주가 시작되면, TMap API가 알려준 경로 좌표들을 하나의 선으로 합칩니다.

```
routeSegments (TMap이 준 데이터)
├── 도보구간: [좌표1, 좌표2, 좌표3]
├── 버스구간: [좌표4, 좌표5, ..., 좌표50]
└── 도보구간: [좌표51, 좌표52]

    ↓ mergeSegmentCoordinates()로 합침

routeLine = [좌표1, 좌표2, ..., 좌표52]  ← 하나의 긴 선
```

코드 위치: `MovingCharacter.tsx` 156~163행

```typescript
// 세그먼트 좌표들을 합치고
const coordinates = mergeSegmentCoordinates(routeSegments);
// Turf.js LineString으로 변환
routeLineRef.current = createRouteLine(coordinates);
```

`createRouteLine()`은 내부적으로 `turf.lineString(coordinates)`를 호출합니다.
좌표 배열을 GeoJSON LineString이라는 표준 형식으로 바꿔주는 겁니다.

---

### 2단계: GPS 좌표를 경로선 위로 스냅(snap)

SSE로 새 버스 위치를 받으면, 그 GPS 좌표를 경로선 위의 가장 가까운 점으로 "끌어당깁니다".

왜? GPS에는 오차가 있어서, 받은 좌표가 도로 위가 아닐 수 있기 때문입니다.

```
             ● ← GPS가 알려준 위치 (도로 밖)
             │
             │  (가장 가까운 점으로 끌어당김)
             ▼
━━━━━━━━━━━━◉━━━━━━━━  ← 경로선 위의 점 (스냅된 위치)
```

코드 위치: `routeInterpolation.ts` 79~90행

```typescript
function snapToRoute(routeLine, point) {
  const pt = turf.point([point.lon, point.lat]);
  const snapped = turf.nearestPointOnLine(routeLine, pt);
  return {
    snappedPoint: snapped.geometry.coordinates,
    distance: snapped.properties.location,  // 시작점부터의 거리 (km)
  };
}
```

`turf.nearestPointOnLine()`이 핵심입니다. 이 함수는 두 가지를 알려줍니다:
- 경로선 위에서 가장 가까운 점의 좌표
- 그 점이 경로 **시작점에서 몇 km 떨어져 있는지**

이 "시작점부터의 거리"가 보간의 핵심 단위입니다.

---

### 3단계: 보간 상태(InterpolationState) 생성

이전 위치와 새 위치를 둘 다 경로선 위로 스냅한 뒤, "어디서 어디까지 이동해야 하는지"를 기록합니다.

```
경로선:  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                ▲                    ▲
             이전 위치            새 위치
             (3.2km 지점)        (4.8km 지점)

InterpolationState = {
  startDistance: 3.2,    // 시작 거리
  endDistance: 4.8,      // 끝 거리
  startTime: 지금,       // 보간 시작 시각
  duration: 30000,       // 30초 동안 이동 (= SSE 업데이트 간격)
}
```

코드 위치: `routeInterpolation.ts` 167~188행

```typescript
function createInterpolationState(routeLine, previousPosition, currentPosition, duration) {
  // 이전 위치를 경로 위로 스냅 → 시작 거리(km)
  const startSnap = snapToRoute(routeLine, previousPosition);
  // 새 위치를 경로 위로 스냅 → 끝 거리(km)
  const endSnap = snapToRoute(routeLine, currentPosition);

  return {
    startDistance: startSnap.distance,  // 예: 3.2km
    endDistance: endSnap.distance,      // 예: 4.8km
    startTime: Date.now(),
    duration: duration,                 // 예: 30000ms
  };
}
```

---

### 4단계: 매 프레임마다 중간 위치 계산

`requestAnimationFrame`으로 **매 프레임(약 16ms = 1/60초)** 마다 현재 위치를 계산합니다.

핵심 아이디어:
```
경과 시간 비율(t) = 지금까지 흐른 시간 / 전체 보간 시간

현재 거리 = 시작 거리 + (끝 거리 - 시작 거리) x t
```

예시 (30초 보간, 3.2km → 4.8km):

| 경과 시간 | t | 현재 거리 | 설명 |
|-----------|---|-----------|------|
| 0초 | 0.0 | 3.2km | 시작 위치 |
| 3초 | 0.1 | 3.36km | 10% 이동 |
| 15초 | 0.5 | 4.0km | 절반 이동 |
| 27초 | 0.9 | 4.64km | 거의 도착 |
| 30초 | 1.0 | 4.8km | 도착 |

"현재 거리"를 구했으면, `turf.along()`으로 경로선 위에서 해당 거리의 **실제 좌표**를 구합니다.

```
경로선:  ━━━╮
            ┃
            ╰━━━━╮
                 ┃
                 ╰━━━━━━━
         ▲
      "3.36km 지점의 좌표가 뭐야?" → turf.along(routeLine, 3.36)
                                    → [126.978, 37.566]
```

코드 위치: `routeInterpolation.ts` 119~148행 + 153~162행

```typescript
// 시간 기반 보간 (매 프레임 호출)
function interpolateByTime(routeLine, state) {
  const elapsed = Date.now() - state.startTime;
  const t = Math.min(elapsed / state.duration, 1);  // 0~1 사이로 제한
  return interpolateAlongRoute(routeLine, state.startDistance, state.endDistance, t);
}

// 경로 따라 거리 기반 보간
function interpolateAlongRoute(routeLine, startDistance, endDistance, t) {
  // 현재 거리 = 시작 + (끝 - 시작) x t
  const currentDistance = startDistance + (endDistance - startDistance) * t;
  // 경로선 위에서 해당 거리의 좌표를 구함
  const currentCoord = getPointAtDistance(routeLine, currentDistance);
  // 10m 앞의 좌표와 비교해서 이동 방향 계산
  const aheadCoord = getPointAtDistance(routeLine, currentDistance + 0.01);
  const bearing = calculateBearing(currentCoord, aheadCoord);

  return { coordinates: currentCoord, bearing, progress: t };
}
```

`getPointAtDistance()`는 내부적으로 `turf.along(routeLine, distance)`를 호출합니다.
"이 선을 따라서 N km 가면 어디야?"에 대한 답을 구하는 함수입니다.

---

### 5단계: 화면에 그리기

계산된 좌표(`displayPosition`)를 Mapbox의 `map.project()`로 화면 픽셀 좌표로 변환하고, 캐릭터 이미지를 해당 위치에 렌더링합니다.

```
[경도, 위도]  →  map.project()  →  { x: 450, y: 320 }  →  CSS left/top 적용
```

코드 위치: `MovingCharacter.tsx` 276~305행

```typescript
const point = map.project(displayPosition);
setScreenPosition({ x: point.x, y: point.y });
```

지도가 이동/줌/회전될 때마다 `map.on('move')` 이벤트로 화면 좌표를 다시 계산합니다.

---

## 전체 흐름 요약 (한 장으로 보기)

```
[SSE 이벤트 수신: 새 GPS 좌표]
          │
          ▼
[이전 좌표 & 새 좌표를 경로선 위로 스냅]
  turf.nearestPointOnLine()
          │
          ▼
[보간 상태 생성]
  시작 거리: 3.2km, 끝 거리: 4.8km, 시간: 30초
          │
          ▼
[매 프레임(16ms)마다 반복] ◄─── requestAnimationFrame
          │
          ├─ 경과 비율 t 계산 (0~1)
          ├─ 현재 거리 = 3.2 + (4.8 - 3.2) x t
          ├─ turf.along(routeLine, 현재거리) → 좌표 획득
          ├─ turf.bearing() → 이동 방향 계산
          └─ map.project() → 화면 좌표 변환 → 캐릭터 렌더링
          │
          ▼
[30초 후 다음 SSE 이벤트 수신 → 위로 돌아감]
```

---

## 경로선이 없을 때는? (Fallback)

경로 데이터가 아직 로드되지 않았거나 없는 경우, 단순한 **직선 보간**으로 대체합니다.

```typescript
// 직선 보간 (경로선 없을 때)
const lon = from.lon + (to.lon - from.lon) * t;
const lat = from.lat + (to.lat - from.lat) * t;
```

Turf.js 없이 단순 덧셈/곱셈으로 중간 좌표를 계산합니다.
경로를 따라가지는 못하지만, 최소한 순간이동하지 않고 부드럽게 움직입니다.

코드 위치: `MovingCharacter.tsx` 234~256행

---

## 방향(bearing) 계산

캐릭터가 진행 방향을 바라보게 하기 위해, 현재 위치에서 10m 앞의 점과 비교하여 방향각을 구합니다.

```typescript
// 현재 위치에서 10m(0.01km) 앞의 좌표
const aheadCoord = getPointAtDistance(routeLine, currentDistance + 0.01);
// 두 점 사이의 방향 (0° = 북, 90° = 동, 180° = 남, 270° = 서)
const bearing = turf.bearing(turf.point(current), turf.point(ahead));
```

코드 위치: `routeInterpolation.ts` 107~113행, 134~140행

---

## 사용된 핵심 파일

| 파일 | 역할 |
|------|------|
| `frontend/src/utils/routeInterpolation.ts` | Turf.js 보간 함수 모음 (snap, along, bearing 등) |
| `frontend/src/components/MovingCharacter.tsx` | 보간 결과를 받아 캐릭터를 지도 위에 렌더링 |
| `frontend/src/hooks/useRouteSSE.ts` | SSE로 새 좌표를 수신하여 MovingCharacter에 전달 |
