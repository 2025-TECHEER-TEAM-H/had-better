# 경로 기반 보간 구현 가이드

## 개요

버스/지하철이 **실제 도로/노선을 따라** 이동하도록 Turf.js를 사용한 경로 기반 보간을 구현했습니다.

## 문제점

기존 직선 보간 방식의 문제:
- API가 30초마다 위치 업데이트 → 두 지점 사이를 직선으로 보간
- **문제**: 버스/지하철은 도로/노선을 따라 이동하므로 직선 보간 시 건물을 관통하는 문제 발생

## 해결 방법

백엔드에서 제공하는 **실제 도로 경로 데이터(LineString)**를 사용하여 경로를 따라 보간

### 핵심 개념

1. **경로 데이터**: 백엔드에서 `RouteSegment.pathCoordinates` 제공
2. **경로 스냅**: 30초마다 받은 좌표를 경로선 위로 정렬 (`turf.nearestPointOnLine`)
3. **거리 기반 보간**: 경로 시작점부터의 거리(km)로 보간 (`turf.along`)

## 구현 상세

### 1. 경로 데이터 구조 (백엔드 API)

```typescript
// 백엔드 모델: RouteSegment
interface RouteSegment {
  segment_id: number;
  mode: string;  // "WALK", "BUS", "SUBWAY"
  pathCoordinates: number[][];  // [[lon, lat], [lon, lat], ...]
  geojson: {
    type: 'LineString';
    coordinates: number[][];  // 실제 도로/노선 경로
  };
}
```

### 2. 프론트엔드 구현

#### (1) 경로 데이터 로드

```typescript
// 경주 시작 시 전체 경로 받기
useEffect(() => {
  const fetchRoute = async () => {
    const response = await fetch('/api/v1/routes/123');
    const { segments } = await response.json();

    // 모든 세그먼트의 좌표를 하나로 합치기
    const allCoords: [number, number][] = segments.flatMap(
      (seg: RouteSegment) => seg.pathCoordinates
    );

    const routeLine = turf.lineString(allCoords);
    routeLineRef.current = routeLine;

    // 전체 경로 길이 계산
    const length = turf.length(routeLine, { units: 'kilometers' });
    routeLengthRef.current = length;
  };

  fetchRoute();
}, []);
```

#### (2) 30초마다 위치 업데이트 시 경로 스냅

```typescript
useEffect(() => {
  if (!currentLocation || !previousLocation || !routeLineRef.current) return;

  const routeLine = routeLineRef.current;

  // 이전 위치와 현재 위치를 점으로 변환
  const startPos = turf.point([previousLocation.longitude, previousLocation.latitude]);
  const endPos = turf.point([currentLocation.longitude, currentLocation.latitude]);

  // 경로선 위의 가장 가까운 지점으로 스냅
  const prevPointOnLine = turf.nearestPointOnLine(routeLine, startPos);
  const currentPointOnLine = turf.nearestPointOnLine(routeLine, endPos);

  // 경로 시작점부터의 거리 (km)
  const startDistance = prevPointOnLine.properties.location || 0;
  const endDistance = currentPointOnLine.properties.location || 0;

  // 보간 상태 설정
  interpolationStateRef.current = {
    isInterpolating: true,
    startDistance,      // 시작 거리 (km)
    endDistance,        // 종료 거리 (km)
    startTime: Date.now(),
    duration: 30000,    // 30초 동안 보간
  };
}, [currentLocation, previousLocation]);
```

#### (3) 애니메이션 루프에서 경로 따라 보간

```typescript
const animate = () => {
  const interpState = interpolationStateRef.current;
  const routeLine = routeLineRef.current;

  if (interpState && interpState.isInterpolating && routeLine) {
    const elapsed = Date.now() - interpState.startTime;
    const t = Math.min(elapsed / interpState.duration, 1); // 0 ~ 1

    // 경로 위에서의 거리 보간
    const currentDistance =
      interpState.startDistance +
      (interpState.endDistance - interpState.startDistance) * t;

    // 경로선을 따라 해당 거리만큼 이동한 지점의 좌표 구하기
    const pointOnRoute = turf.along(routeLine, currentDistance);
    const coordinates = pointOnRoute.geometry.coordinates as [number, number];

    // 캐릭터 위치 업데이트
    currentPositionRef.current = coordinates;
  }

  // 지도 업데이트
  updateNaviFeature(map, currentPositionRef.current, bearing, walkFrame, 'walking');

  animationLoopRef.current = window.setTimeout(animate, 120);
};
```

## Turf.js 핵심 함수

### 1. `turf.lineString(coordinates)`
좌표 배열로 LineString 생성

```typescript
const line = turf.lineString([
  [126.724759, 37.49384712],
  [126.725000, 37.494000],
  [126.726000, 37.495000],
]);
```

### 2. `turf.nearestPointOnLine(line, point)`
경로선에서 점과 가장 가까운 지점 찾기 + 경로 시작점부터의 거리 반환

```typescript
const point = turf.point([126.7253, 37.4942]);
const snapped = turf.nearestPointOnLine(line, point);

console.log(snapped.properties.location); // 0.234 (km)
```

### 3. `turf.along(line, distance)`
경로 시작점부터 특정 거리만큼 떨어진 지점의 좌표 반환

```typescript
const pointAt500m = turf.along(line, 0.5); // 0.5km = 500m
console.log(pointAt500m.geometry.coordinates); // [lon, lat]
```

### 4. `turf.length(line)`
전체 경로 길이 계산

```typescript
const totalLength = turf.length(line, { units: 'kilometers' });
console.log(totalLength); // 2.345 (km)
```

## 데이터 흐름

```
1. 경주 시작
   ↓
2. 백엔드에서 경로 데이터 받기
   GET /api/v1/routes/123
   → segments[].pathCoordinates
   ↓
3. 모든 세그먼트 좌표 합치기
   → turf.lineString(allCoords)
   ↓
4. 30초마다 위치 API 호출
   GET /api/v1/routes/123/location
   → { latitude, longitude }
   ↓
5. 경로선 위로 스냅
   turf.nearestPointOnLine(line, point)
   → 경로 시작점부터의 거리 (startDistance, endDistance)
   ↓
6. 120ms마다 애니메이션 프레임
   현재 거리 = startDistance + (endDistance - startDistance) * t
   turf.along(line, 현재거리)
   → 경로 위의 정확한 좌표
   ↓
7. 캐릭터 위치 업데이트
```

## 백엔드 API 요구사항

### 경로 생성 API

```
GET /api/v1/routes/{route_id}
```

**응답:**
```json
{
  "route_id": 123,
  "segments": [
    {
      "segment_id": 1,
      "mode": "BUS",
      "pathCoordinates": [
        [126.724759, 37.49384712],
        [126.725000, 37.494000],
        ...
      ],
      "geojson": {
        "type": "LineString",
        "coordinates": [[126.724759, 37.49384712], ...]
      }
    }
  ]
}
```

### 위치 업데이트 API (30초 주기)

```
GET /api/v1/routes/{route_id}/location
```

**응답:**
```json
{
  "latitude": 37.494123,
  "longitude": 126.725234,
  "timestamp": "2026-01-19T14:30:00+09:00"
}
```

## 장점

### 직선 보간 vs 경로 기반 보간

| 항목 | 직선 보간 | 경로 기반 보간 |
|------|-----------|----------------|
| 정확도 | ❌ 건물 관통 가능 | ✅ 실제 도로 따라 이동 |
| 구현 난이도 | 쉬움 | 중간 |
| 추가 라이브러리 | 불필요 | Turf.js |
| API 요구사항 | 위치만 | 경로 + 위치 |
| 사용자 경험 | 부자연스러움 | 자연스러움 |

## 테스트 방법

### 1. 더미 데이터 테스트 (현재 구현)

`CharacterMovingTest.tsx`:
- 출발지 → 목적지 직선으로 더미 경로 생성
- 실제 도로 경로가 아니므로 테스트용

```typescript
const dummyRouteCoordinates: [number, number][] = [
  DEPARTURE,
  DESTINATION,
];
const routeLine = turf.lineString(dummyRouteCoordinates);
```

### 2. 실제 API 연동

백엔드 API 준비 완료 시:

```typescript
// 경로 데이터 받기
const response = await fetch('/api/v1/routes/123');
const { segments } = await response.json();

const allCoords = segments.flatMap(seg => seg.pathCoordinates);
const routeLine = turf.lineString(allCoords);
```

## 다음 단계

1. ✅ 경로 기반 보간 로직 구현 완료
2. ⏳ 백엔드에서 실제 도로 경로 데이터 제공 확인
3. ⏳ 실제 API 연동 테스트
4. ⏳ 여러 캐릭터(봇) 동시 이동 구현
5. ⏳ 경로선 지도에 표시 (Mapbox Layer)

## 참고 자료

- Turf.js 공식 문서: https://turfjs.org/
- Mapbox GL JS: https://docs.mapbox.com/mapbox-gl-js/
- 백엔드 모델: `backend/apps/itineraries/models.py` - RouteSegment
