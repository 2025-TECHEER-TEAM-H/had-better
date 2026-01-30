# 버스 실시간 움직임 구현 - 기술 설명

## 한 줄 요약

서울시 공공데이터 API에서 실제 버스 GPS 좌표를 주기적으로 가져와, RabbitMQ → SSE로 프론트엔드에 스트리밍하고, Turf.js로 경로 위에서 부드럽게 보간(interpolation)하여 Mapbox 지도 위에 캐릭터가 움직이는 것처럼 렌더링합니다.

---

## 전체 데이터 흐름

```
서울시 버스 API ──(HTTP)──> Celery Worker ──(Redis 상태 저장)──> SSE Publisher
    ──(RabbitMQ Fanout)──> Django SSE View ──(StreamingHttpResponse)──>
    프론트엔드 EventSource ──(Turf.js 보간)──> Mapbox 캐릭터 렌더링
```

---

## 1단계: 외부 API에서 실시간 버스 위치 수집

경주가 시작되면, Celery Task(`update_bot_position`)가 자기 스케줄링 패턴으로 반복 실행됩니다. 한 번 실행이 끝나면 `apply_async(countdown=다음_간격)`으로 스스로 다음 실행을 예약하는 방식입니다.

이 Task는 서울시 공공데이터포털 버스 API(`ws.bus.go.kr/api/rest`)를 호출해서 두 가지 핵심 정보를 가져옵니다.

- **`getArrInfoByRoute`**: 특정 정류소에서의 버스 도착 예정 정보 (몇 분 후 도착하는지, 차량 ID)
- **`getBusPosByVehId`**: 해당 차량의 실시간 GPS 좌표 (경도, 위도)

폴링 주기는 상황에 따라 동적으로 조절됩니다.

- 기본 30초
- 도착 임박 시(120초 이내) → 15초
- 상태 전환 직후 → 5초

---

## 2단계: 봇 상태 머신

봇은 6개의 상태를 순차적으로 전환하며 이동합니다.

```
WALKING → WAITING_BUS → RIDING_BUS → WALKING → WAITING_SUBWAY → RIDING_SUBWAY → FINISHED
```

각 상태마다 다른 로직이 동작합니다.

| 상태 | 동작 |
|------|------|
| `WALKING` | 경과시간 비율로 경로선(passShape) 위 위치를 보간 |
| `WAITING_BUS` | 도착정보 API를 폴링하다가 도착예정시간 ≤ 80초이면 탑승 판정 |
| `RIDING_BUS` | 실제 버스 GPS 좌표를 받아 봇 위치를 업데이트, 하차역 100m 이내이면 하차 |
| `WAITING_SUBWAY` | 지하철 실시간 도착정보를 폴링하다가 진입/도착 상태면 탑승 |
| `RIDING_SUBWAY` | 열차 위치를 추적하다가 하차역에 도달하면 하차 |
| `FINISHED` | 목적지 좌표 설정 후 결과 저장 |

핵심은 `RIDING_BUS` 상태입니다. 이때 봇의 위치는 **시뮬레이션이 아니라 실제 운행 중인 버스의 GPS 좌표**입니다. 서울시 API에서 받은 GPS를 경로선 위에 스냅(snap)하여 정확한 위치를 산출합니다.

---

## 3단계: SSE로 프론트엔드에 실시간 전송

봇 위치가 업데이트될 때마다 `SSEPublisher`가 RabbitMQ Fanout Exchange에 이벤트를 발행합니다. Django의 SSE View는 RabbitMQ를 구독하고 있다가, 이벤트가 들어오면 `StreamingHttpResponse`로 브라우저에 스트리밍합니다.

전송되는 `bot_status_update` 이벤트의 주요 데이터:

```json
{
  "bot_id": 7,
  "status": "RIDING_BUS",
  "progress_percent": 45.3,
  "next_update_in": 30,
  "position": { "lon": 126.978, "lat": 37.566 },
  "vehicle": {
    "type": "BUS",
    "route": "6625",
    "position": { "lon": 126.979, "lat": 37.567 }
  }
}
```

프론트엔드는 `useRouteSSE` hook에서 `EventSource`로 이 스트림을 수신합니다.

---

## 4단계: Turf.js 경로 보간으로 부드러운 애니메이션

SSE 업데이트는 15~30초 간격으로 들어오기 때문에, 그 사이를 **Turf.js 기반 경로 보간**으로 채웁니다.

`MovingCharacter` 컴포넌트가 이 역할을 합니다.

1. 새 위치가 수신되면, 이전 위치와 현재 위치를 모두 경로선(routeLine) 위에 스냅합니다 (`turf.nearestPointOnLine`)
2. 시작 거리(km)와 도착 거리(km)를 구합니다
3. `requestAnimationFrame`으로 매 프레임마다 경과 시간 비율(t)을 계산합니다
4. `turf.along(routeLine, distance)`로 경로선을 따라가는 정확한 좌표를 구합니다
5. `turf.bearing()`으로 이동 방향을 계산하여 캐릭터가 진행 방향을 바라보게 합니다

이 방식의 장점은 캐릭터가 **직선으로 뚝뚝 끊기면서 이동하는 게 아니라, 실제 도로 경로를 따라 부드럽게 미끄러지듯 이동**한다는 점입니다.

---

## 5단계: TMAP → 공공데이터 ID 변환

TMap 대중교통 API와 서울시 공공데이터 API는 서로 다른 ID 체계를 사용합니다. 경주 시작 시 `PublicAPIIdConverter`가 이를 일괄 변환합니다.

- 버스번호 파싱: `"간선:6625"` → `"6625"` → `getBusRouteList`로 busRouteId 조회
- 정류소 매칭: 이름 + 좌표 기반으로 상행/하행 구분하여 정확한 stId 확보
- 지하철 호선 변환: `"수도권2호선"` → 내부 매핑 테이블로 호선 ID 변환

변환 결과는 Redis에 캐싱하여 이후 매 폴링마다 재사용합니다.

---

## 6단계: Fallback 처리

공공데이터 API를 사용할 수 없는 경우(경기권 버스, API 장애 등)에 대비한 fallback 로직이 있습니다.

- **버스 대기 fallback**: TMap 소요시간의 20% (최소 60초, 최대 300초) 대기 후 탑승 처리
- **버스 탑승 fallback**: TMap 소요시간이 경과하면 하차, 그 사이에는 경로선 기반 시간 보간으로 위치 산출
- **지하철 fallback**: 동일하게 소요시간 기반 하차 판정

---

## 정리: 왜 이렇게 구현했는가

| 설계 결정 | 이유 |
|-----------|------|
| Celery 자기 스케줄링 | 고정 주기 대신 상황에 맞게 폴링 간격을 동적 조절 가능 |
| RabbitMQ Fanout + SSE | 같은 경주를 보는 여러 클라이언트에 동시 브로드캐스트 |
| GPS → 경로선 스냅 | 실제 GPS는 오차가 있으므로, 경로선 위로 투영하여 시각적 정확도 확보 |
| Turf.js 경로 보간 | 15~30초 간격의 업데이트 사이를 경로를 따라 부드럽게 연결 |
| Fallback 시간 기반 시뮬레이션 | API 장애 시에도 경주가 멈추지 않도록 보장 |
