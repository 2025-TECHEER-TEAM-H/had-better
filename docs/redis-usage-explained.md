# Redis - 프로젝트에서의 역할과 선택 이유

## 전체 구조에서 Redis의 위치

```
[Django API Server]  ←──읽기/쓰기──→  [Redis (캐시/상태 저장소)]
[Celery Worker]      ←──읽기/쓰기──→  [Redis]
[Django SSE View]    ←──읽기──────→  [Redis]

[RabbitMQ]는 별도로 메시지 브로커(Task Queue + SSE Pub/Sub) 역할
```

RabbitMQ는 **메시지 전달** 담당, Redis는 **상태 저장/캐시** 담당으로 역할이 분리되어 있습니다.

---

## Redis가 우리 프로젝트에서 하는 일

### 1. 봇 상태 관리 (Key: `bot_state:{route_id}`)

Celery Worker가 15~30초마다 봇의 상태를 읽고 업데이트합니다. 경주가 끝나면 자동으로 만료됩니다.

```json
{
    "route_id": 42,
    "bot_id": 7,
    "status": "RIDING_BUS",
    "current_leg_index": 2,
    "total_legs": 5,
    "leg_started_at": "2026-01-30T15:30:00+09:00",
    "vehicle_id": "112958",
    "arrival_time": 120,
    "next_poll_interval": 15,
    "current_position": { "lon": 126.978, "lat": 37.566 },
    "progress_percent": 45.3
}
```

- TTL: 1시간 (경주 진행 중 계속 갱신)
- 봇의 6가지 상태(WALKING, WAITING_BUS, RIDING_BUS, WAITING_SUBWAY, RIDING_SUBWAY, FINISHED) 전환을 추적

### 2. 공공데이터 ID 캐시 (Key: `public_ids:{route_id}`)

TMap API와 서울시 공공데이터 API는 ID 체계가 다릅니다. 경주 시작 시 한 번 변환한 결과를 Redis에 저장하여, 이후 매 폴링마다 재사용합니다.

```json
{
    "legs": [
        { "mode": "WALK" },
        {
            "mode": "BUS",
            "bus_route_id": "100100303",
            "bus_route_name": "6625",
            "start_station": { "stId": "...", "arsId": "..." },
            "end_station": { "stId": "...", "arsId": "..." }
        },
        {
            "mode": "SUBWAY",
            "subway_line_id": "1001",
            "pass_stops": ["역1", "역2", "..."]
        }
    ]
}
```

- TTL: 1시간
- 변환 API 호출을 경주당 1회로 줄여줌

### 3. API 호출 캐시 (Key: `api_call:{route_id}:{api_type}`)

공공데이터 API 호출 실패 시, 직전 응답을 재사용하기 위한 단기 캐시입니다.

- TTL: 60초
- API 타입: `bus_arrival`, `bus_position`, `subway_arrival`, `subway_position`
- 일일 API 호출 제한(1000회) 관리에도 활용

### 4. Celery Task ID 저장 (Key: `celery_task:{route_id}`)

경주 취소 시 실행 중인 Celery Task를 즉시 중단하기 위해 Task ID를 저장합니다.

```
경주 취소 요청 → redis에서 task_id 조회 → celery_app.control.revoke(task_id) → 봇 시뮬레이션 즉시 중단
```

- TTL: 1시간

### 5. 분산 락 (Key: `bot_state_lock:{route_id}`)

여러 Celery Worker가 동시에 같은 봇 상태를 업데이트하는 것을 방지합니다.

```python
with redis_client.bot_state_lock(route_id):
    state = redis_client.get_bot_state(route_id)
    state["status"] = "RIDING_BUS"
    redis_client.set_bot_state(route_id, state)
```

- TTL: 10초 (자동 해제로 데드락 방지)
- `SET NX EX` + Lua 스크립트로 원자적 락 관리

### TTL 요약

| 데이터 | Key 패턴 | TTL | 용도 |
|--------|----------|-----|------|
| 봇 상태 | `bot_state:{route_id}` | 1시간 | 실시간 봇 위치/상태 |
| 공공데이터 ID | `public_ids:{route_id}` | 1시간 | TMAP→공공데이터 ID 변환 캐시 |
| API 호출 캐시 | `api_call:{route_id}:{type}` | 60초 | API 실패 시 직전 응답 재사용 |
| Task ID | `celery_task:{route_id}` | 1시간 | 경주 취소 시 Task 중단 |
| 분산 락 | `bot_state_lock:{route_id}` | 10초 | 동시 업데이트 방지 |

---

## 캐시가 필요했던 이유

원래 RabbitMQ만 사용하고 있었지만, 다음과 같은 요구사항이 생겼습니다:

- Celery Worker가 15~30초마다 봇 상태를 **읽고 쓰기**
- TMAP→공공데이터 ID 변환 결과를 경주 동안 **재사용**
- API 호출 실패 시 직전 응답을 **재활용**
- 경주 종료 후 임시 데이터가 **자동 정리**

이걸 매번 PostgreSQL에 쿼리하면 느리고 불필요한 부하가 생깁니다. 별도의 캐시 저장소가 필요했습니다.

---

## 왜 Redis인가 - 다른 캐시 솔루션과 비교

### 1. Memcached

가장 전통적인 인메모리 캐시입니다.

| | Redis | Memcached |
|---|---|---|
| 데이터 구조 | String, Hash, List, Set, Sorted Set | String만 |
| TTL | 키별 개별 설정 | 키별 개별 설정 |
| 분산 락 | `SET NX EX`로 지원 | 미지원 |
| 영속성 | RDB/AOF로 디스크 백업 가능 | 없음 (재시작 시 전부 소멸) |
| 최대 값 크기 | 512MB | 1MB |
| Pub/Sub | 지원 | 미지원 |

**안 쓴 이유**: 봇 상태는 여러 필드(status, position, vehicle_id, progress 등)로 구성된 복잡한 객체인데, Memcached는 String만 저장 가능하여 매번 전체 JSON을 직렬화/역직렬화해야 합니다. 또한 여러 Celery Worker가 동시에 같은 봇을 업데이트할 수 있어서 **분산 락**이 필수인데, Memcached는 이를 지원하지 않습니다.

### 2. Django 내장 캐시 - 로컬 메모리 (LocMemCache)

Django 프로세스의 메모리에 직접 캐싱하는 방법입니다.

| | Redis | Django LocMemCache |
|---|---|---|
| 프로세스 간 공유 | 별도 서버라 모든 프로세스가 공유 | 프로세스마다 독립 (공유 불가) |
| Celery Worker 접근 | 가능 | 불가능 (Worker는 별도 프로세스) |
| 서버 재시작 | 데이터 유지 가능 | 소멸 |

**안 쓴 이유**: Django 서버와 Celery Worker는 **별도 프로세스**(심지어 별도 Docker 컨테이너)입니다. 로컬 메모리 캐시는 프로세스 간 공유가 안 되므로 Worker가 저장한 봇 상태를 Django SSE View에서 읽을 수 없습니다.

### 3. Django 내장 캐시 - 데이터베이스 (DatabaseCache)

Django의 DB 테이블에 캐싱하는 방법입니다.

| | Redis | Django DatabaseCache |
|---|---|---|
| 속도 | 인메모리, sub-ms | 디스크 I/O, 수~수십 ms |
| 동시성 제어 | 분산 락 지원 | DB 트랜잭션에 의존 |
| 부하 | PostgreSQL과 분리 | PostgreSQL에 추가 부하 |

**안 쓴 이유**: 15~30초마다 반복되는 읽기/쓰기를 DB에 하면 본래 업무(경주 결과 저장, 사용자 조회 등)에 쓰여야 할 PostgreSQL에 불필요한 부하를 주게 됩니다.

---

## Redis 선택의 결정적 이유 요약

| 요구사항 | Redis | Memcached | LocMemCache | DatabaseCache |
|----------|-------|-----------|-------------|---------------|
| Django + Celery Worker 간 데이터 공유 | O | O | X | O |
| 분산 락 (동시성 제어) | O | X | X | 부분적 |
| 복합 데이터 구조 지원 | O | X | O | O |
| TTL 자동 만료 | O | O | O | 직접 구현 |
| 빠른 읽기/쓰기 (인메모리) | O | O | O | X |
| Celery 공식 지원 | O | O | X | X |

**프로세스 간 공유 + 분산 락 + 인메모리 속도 + TTL 자동 만료**를 동시에 만족하는 것이 Redis뿐이었습니다.
