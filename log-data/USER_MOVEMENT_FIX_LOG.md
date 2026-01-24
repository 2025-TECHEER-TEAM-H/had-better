# 사용자 이동 속도 버그 수정 기록

> 날짜: 2026-01-24
> 작업자: Claude Opus 4.5 + matt

## 문제 상황

사용자 캐릭터가 구간별 `sectionTime`을 무시하고 일정한 속도로 이동함.

**예시 데이터 (route_leg_411):**
| 구간 | mode | sectionTime | distance | 예상 속도 |
|------|------|-------------|----------|-----------|
| leg[0] | WALK | 544초 | 682m | 1.25 m/s |
| leg[1] | BUS | 356초 | 3347m | 9.4 m/s |
| leg[2] | WALK | 59초 | 43m | 0.73 m/s |

**증상:** WALK 구간 682m를 544초(9분)가 아닌 약 2분만에 완주

---

## 시도 1: WALK linestring 파싱 추가 (부분 성공)

### 문제 분석
`getRouteLineString` 함수에서 WALK 구간은 시작점-끝점만 사용하고, BUS/SUBWAY만 `passShape.linestring` 사용

### 수정 내용
```typescript
// getRouteLineString 함수 (RouteDetailPage.tsx)
if (leg.passShape?.linestring) {
  // BUS/SUBWAY: passShape.linestring 사용
} else if (leg.steps && leg.steps.length > 0) {
  // WALK: steps[].linestring 사용 (추가됨)
  for (const step of leg.steps) {
    if (step.linestring) {
      // 파싱 로직
    }
  }
} else {
  // fallback: 시작점-끝점
}
```

### 결과
- 경로 좌표는 정확해졌지만 **여전히 속도가 빠름**

---

## 시도 2: 기하학적 거리 계산 (실패 - Revert)

### 가설
raw_data의 distance와 실제 linestring의 기하학적 거리가 다를 수 있음

### 수정 내용
`turf.length()`로 실제 경로선 길이를 계산하여 `startGeoDistance`, `endGeoDistance` 추가

### 결과
- raw_data 거리: 4072m
- 기하학적 거리: 4071m
- **거의 동일** → 의미 없음
- **Revert 처리**

---

## 시도 3: 상세 디버그 로깅 추가 (분석용)

### 추가한 로그
- 경로선 좌표 (0%, 25%, 50%, 75%, 100%)
- leg별 예상 끝 지점
- 30초마다 진행 상태
- turf.along 결과 좌표

### 분석 결과
```
⏱️ 30초 경과: leg[0] WALK, 진행률=5.5%, 이동거리=38m
⏱️ 60초 경과: leg[0] WALK, 진행률=11.0%, 이동거리=75m
```

**계산은 정확함!**
- 30초에 38m = 1.27 m/s (예상: 1.25 m/s) ✓
- 로그상 위치는 맞는데 **시각적 위치가 다름**

---

## 시도 4: MovingCharacter 보간 문제 (부분 해결)

### 문제 분석
`MovingCharacter` 컴포넌트가 자체 보간(interpolation) 로직을 가지고 있음:
- `updateInterval=1000ms` (1초 동안 이전→현재 위치 보간)
- 부모에서 `requestAnimationFrame`으로 16ms마다 새 위치 전달
- 16ms마다 보간이 리셋되어 `t = 16/1000 = 1.6%`만 진행

### 수정 내용
```typescript
// MovingCharacter.tsx
interface MovingCharacterProps {
  // ... 기존 props
  skipInterpolation?: boolean;  // 추가
}

// 애니메이션 루프에서
if (skipInterpolation) {
  setDisplayPosition([currentPosition.lon, currentPosition.lat]);
  return;  // 보간 건너뛰기
}
```

```typescript
// RouteDetailPage.tsx - 사용자 캐릭터
<MovingCharacter
  currentPosition={userPosition}
  skipInterpolation={true}  // 추가
  // ...
/>
```

### 결과
- **여전히 빠름** → 다른 문제가 있음

---

## 시도 5: userPosition useMemo 수정 (최종 해결)

### 핵심 문제 발견

`userPosition` useMemo 로직:
```typescript
const userPosition = useMemo(() => {
  if (isGpsTracking && userLocation) {
    return { lon: userLocation[0], lat: userLocation[1] };
  } else if (isGpsTestMode && userLocation) {
    return { lon: userLocation[0], lat: userLocation[1] };
  } else {
    // ⚠️ 여기가 문제!
    const progress = playerProgress.get('user') || 0;
    const pos = getPositionOnRoute('user', progress);
    return { lon: pos[0], lat: pos[1] };
  }
}, [...]);
```

**문제점:**
- `startUserAutoMove`에서 정확한 위치를 `setUserLocation()`으로 설정
- 하지만 `isGpsTracking`/`isGpsTestMode`가 false면 **else 분기 진입**
- `getPositionOnRoute`가 시간 기반 진행률을 거리 비율로 직접 변환

**getPositionOnRoute 문제:**
```typescript
const targetDistance = totalLength * progress;  // 시간 진행률 → 거리 비율 직접 변환
```

**30초 경과 시 비교:**
| 방식 | 계산 | 결과 |
|------|------|------|
| startUserAutoMove (정확) | (30/544) × 682m | **38m** ✓ |
| getPositionOnRoute (잘못됨) | (30/959) × 4086m | **128m** ✗ |

### 최종 수정
```typescript
const userPosition = useMemo(() => {
  if (isGpsTracking && userLocation) {
    return { lon: userLocation[0], lat: userLocation[1] };
  } else if (isGpsTestMode && userLocation) {
    return { lon: userLocation[0], lat: userLocation[1] };
  } else if (isUserAutoMoving && userLocation) {
    // ✅ 추가: 자동 이동 중일 때 정확한 위치 사용
    return { lon: userLocation[0], lat: userLocation[1] };
  } else {
    // 초기 상태용 fallback
    const progress = playerProgress.get('user') || 0;
    const pos = getPositionOnRoute('user', progress);
    return { lon: pos[0], lat: pos[1] };
  }
}, [isGpsTracking, isGpsTestMode, isUserAutoMoving, userLocation, playerProgress, getPositionOnRoute]);
```

### 결과
**성공!** 구간별 sectionTime에 맞게 정확한 속도로 이동

---

## 추가 수정: WALK 경로 렌더링

### 문제
지도에 경로 그릴 때 WALK 구간이 직선으로 그려짐 (건물 뚫고 지나감)

### 수정 파일
1. `RouteDetailPage.tsx` - routeLines useMemo
2. `RouteSelectionPage.tsx` - routeLines 생성 부분

### 수정 내용
```typescript
// 기존
if (leg.passShape?.linestring) {
  // BUS/SUBWAY 처리
} else {
  // 시작점-끝점만 (직선)
}

// 수정 후
if (leg.passShape?.linestring) {
  // BUS/SUBWAY 처리
} else if (leg.steps && leg.steps.length > 0) {
  // WALK: steps[].linestring 사용 (실제 도보 경로)
} else {
  // fallback
}
```

---

## 최종 수정된 파일 목록

1. **frontend/src/components/MovingCharacter.tsx**
   - `skipInterpolation` prop 추가

2. **frontend/src/app/components/RouteDetailPage.tsx**
   - `userPosition` useMemo에 `isUserAutoMoving` 조건 추가
   - `routeLines`에서 WALK steps[].linestring 파싱 추가
   - `getRouteLineString`에서 WALK steps[].linestring 파싱 추가
   - 과다 디버그 로그 정리

3. **frontend/src/app/components/RouteSelectionPage.tsx**
   - WALK steps[].linestring 파싱 추가

---

## 교훈

1. **로그가 정확해도 시각적 결과가 다를 수 있음** - 계산 로직과 렌더링 로직이 다른 데이터를 사용할 수 있음

2. **useMemo 의존성 확인 필수** - 조건 분기에서 의도치 않은 분기로 들어갈 수 있음

3. **컴포넌트 간 책임 분리** - MovingCharacter가 자체 보간을 하면서 부모의 애니메이션과 충돌

4. **시간 기반 vs 거리 기반 혼용 주의** - progress가 시간 비율인지 거리 비율인지 명확히 해야 함
