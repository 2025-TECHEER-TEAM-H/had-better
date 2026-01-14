# PRD: HAD BETTER

## 대중교통 경로 레이싱 서비스

---

## **1. 프로젝트 개요 (Project Overview)**

### 서비스명

# **HAD BETTER**

> "이 길로 갔으면 더 좋았을 텐데 (Had better take this route)"

### 한 줄 설명

> 출발지–목적지 간 여러 경로를 가상 봇(Bot)과 사용자 이동으로 경쟁시켜
> 가장 빠른 경로를 게임처럼 비교·체험하는 지도 기반 서비스

### **1.1 배경 및 목적**

매일 반복되는 지루한 출퇴근 및 등하교길 대중교통 이동 시간을 게임화(Gamification)하여 사용자에게 즐거움을 제공하는 서비스입니다. 사용자는 실제 본인의 이동 경로를 바탕으로 가상의 "봇(실시간 대중교통 데이터 기반으로 움직임)"과 경주를 펼치며, 도착 순위를 경쟁합니다.

### **1.2 목표 (Goals)**

- **시각적 몰입감:** Mapbox GL JS를 활용한 고품질의 3D/2D 지도 경험 제공.
- **단순화된 아키텍처:** RabbitMQ 단일 메시지 브로커를 활용하여 관리 복잡도 최소화 및 데이터 신뢰성 확보.
- **실시간 동기화:** 공공데이터(버스/지하철)와 사용자 GPS의 정확한 매칭.

---

## 2. 문제 정의 (Problem)

- 지도 앱은 **"추천 경로"만 제시**하고
    → 다른 경로가 얼마나 느린지/빠른지 **체감하기 어렵다**

- 사용자는
    - "이 길이 진짜 빠른가?"
    - "다른 길로 가면 얼마나 차이 날까?"
    를 직관적으로 알기 힘들다

---

## 3. 해결 방식 (Solution)

- 동일한 출발지–목적지에 대해
    - **사용자**
    - **여러 가상 봇(다른 경로)**
- 을 동시에 출발시켜
- **실시간 또는 시뮬레이션 경쟁**
- → **도착 순위로 경로 성능을 직관적으로 표현**

---

## 4. 핵심 기능 (MVP)

- 참가자(봇) 생성
- 실시간 대중교통 위치를 활용한 경로 이동 시뮬레이션
- 실시간 순위 변경
- 소요 시간 계산
- 순위 산정 및 결과 제공
- 결과 리포트(경로·시간·순위)

---

## **5. 시스템 아키텍처 및 기술 스택 (System Architecture)**

### **5.1 기술 스택**

- **Frontend:** React, TypeScript, Vite (배포: Vercel)
- **Map Engine:** **Mapbox GL JS** (지도 렌더링, 경로 및 마커 시각화)
- **Geo-Computation:** **Turf.js** (클라이언트 측 지리 공간 분석)
- **Backend:** Django REST Framework (DRF), Uvicorn (배포: AWS EC2/Docker)
- **Gateway:** Traefik (로드밸런싱 및 라우팅)
- **Message Broker:** **RabbitMQ**
    - *역할:* 비동기 작업 큐(Task Queue) 및 실시간 데이터 브로드캐스팅(Pub/Sub 대체).
    - *특징:* RabbitMQ Exchange를 활용해 SSE 메시지 스트림 처리.
- **Async Worker:** Celery (주기적 API 호출 및 백그라운드 작업)
- **Database:** PostgreSQL (AWS RDS) + **PostGIS** (공간 데이터 연산)
- **External APIs:**
    - **Data:** TMap 대중교통 API (경로 탐색 데이터), 공공데이터포털/서울시 (실시간 위치).
    - **Visualization:** Mapbox (지도 타일 및 스타일).

### **5.2 데이터 흐름 (Data Flow)**

1. **Client** 요청 → **Traefik** → **Django**
2. **경주 시작 시:** **Django** → **RabbitMQ** (Celery Task 생성)
3. **데이터 수집:** **RabbitMQ** → **Celery Worker** → **External API** (5초 주기 호출)
4. **실시간 중계:** **Celery** → **RabbitMQ (Topic Exchange)** → **Django (Consumer)** → **Client (SSE Stream)**

---

## **6. 주요 기능 요구사항 (Functional Requirements)**

### **6.1 사용자 및 인증 (User & Auth)**

- **[FR-01] 회원가입/로그인:** 이메일/비밀번호 및 소셜 로그인, JWT 기반 인증.
- **[FR-02] 사용자 정보 관리:** 닉네임 수정, 전적 관리.

### **6.2 지도 및 장소 검색 (Map & Search)**

- **[FR-03] Mapbox 지도 출력:**
    - **Mapbox**를 사용하여 지도를 출력.
- **[FR-04] 장소 검색:**
    - 키워드 검색(TMap API 활용) 결과를 리스트로 표시.
    - 선택된 장소 좌표로 Mapbox 카메라 이동(`flyTo`).
    - 검색 이력 저장 및 조회.
- **[FR-05] 즐겨찾기:** 자주 가는 장소 저장 (카테고리 분류 가능).

### **6.3 경로 탐색 (Route Planning)**

- **[FR-06] 대중교통 경로 탐색:**
    - **Data Source:** TMap 대중교통 API 사용 (한국 대중교통 데이터 정확도 때문).
    - **Visualization:** API에서 받은 경로 좌표(LineString)를 **GeoJSON으로 변환**하여 Mapbox Layer에 그림.
- **[FR-07] 경로 데이터 저장:** 선택한 경로의 상세 정보(소요시간, 환승, 상세 좌표) DB 저장.
- **[FR-08] 경로 검색 이력:** 사용자의 경로 검색 이력 저장.

### **6.4 경주 설정 및 진행 (Racing - Core)**

- **[FR-09] 봇 설정:** 내 경로 1개 vs 봇 경로 2개 선택.
- **[FR-10] 모드 구분:**
    - **App:** 실제 GPS 이동.
    - **Web:** 시뮬레이션 모드.
- **[FR-11] 실시간 경주 진행 (Turf.js 활용):**
    - **거리 계산:**
        - 매초 GPS 좌표가 갱신될 때마다 `turf.distance`를 사용하여 목적지까지의 **남은 직선거리**를 계산하여 상단 바에 표시.
    - **경로 이탈 감지 (Route Deviation):**
        - 사용자의 현재 위치가 계획된 경로(LineString)에서 **20m 이상** 벗어났는지 `turf.pointToLineDistance`로 실시간 감지.
        - 이탈 시 화면에 "경로 재탐색 필요" 또는 "경로 이탈" 경고 메시지 출력.
- **[FR-12] 도착 판정 (Client-Side):**
    - 사용자가 목적지 좌표 반경 **50m** 이내에 진입했는지 `turf.distance`로 1초마다 체크.
    - 진입 확인 시 즉시 경주 종료 API(`POST /races/{id}/actions/finish/`)를 호출하여 순위 확정.

### **6.5 통계 및 기록**

- **[FR-13] 전적 저장:** 승/패, 소요 시간 DB 저장.
- **[FR-14] 통계 대시보드:** 사용자 승률 그래프 제공.

---

## **7. 데이터베이스 설계 (ERD)**

### **7.1 테이블 구조**

#### 사용자 관련

| 테이블 | 설명 |
|--------|------|
| `user` | 사용자 정보 (이메일, 비밀번호, 닉네임, 타입, 최근로그인일자) |
| `saved_place` | 즐겨찾기 장소 (카테고리, 이름, 주소, 위도/경도) |
| `search_place_history` | 장소 검색 이력 |
| `search_route_history` | 경로 검색 이력 |

#### 장소/POI 관련

| 테이블 | 설명 |
|--------|------|
| `poi_place` | 장소 정보 통합 데이터 (TMap ID, 이름, 카테고리, 주소, 좌표, 전화번호 등) |

#### 경로 관련

| 테이블 | 설명 |
|--------|------|
| `route_itinerary` | 대중교통 경로 탐색 결과 (총 소요시간, 총 거리, 요금, 환승횟수, 경로타입) |
| `route_leg` | 경로 상세 구간 데이터 (구간인덱스, 이동수단, 소요시간, 거리, 상세좌표, 경로지오메트리) |

#### 경주 관련

| 테이블 | 설명 |
|--------|------|
| `route` | 경주 세션 정보 (사용자, 봇, 경로, 상태, 시작/종료시간, 순위, 승패, 시작/종료 좌표) |
| `bot` | 봇 정보 (이름, 타입) |

### **7.2 ERD 다이어그램**

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────┐
│      user       │       │  search_place_history │       │    poi_place    │
├─────────────────┤       ├──────────────────────┤       ├─────────────────┤
│ PK user_id      │◄──┐   │ PK search_place_     │   ┌──►│ PK poi_search_  │
│    name         │   │   │    history_id        │   │   │    place_id     │
│    email        │   ├───│ FK user_id           │   │   │ FK search_place_│
│    password     │   │   │    name              │   │   │    history_id   │
│    nickname     │   │   │    created_at        │   ├───│ FK saved_place_ │
│    type         │   │   │    updated_at        │   │   │    id           │
│    last_login   │   │   │    deleted_at        │   │   │    tmap_id      │
│    created_at   │   │   └──────────────────────┘   │   │    name         │
│    updated_at   │   │                              │   │    category     │
│    deleted_at   │   │   ┌──────────────────────┐   │   │    address_road │
└─────────────────┘   │   │  search_route_history │   │   │    address_jibun│
        │             │   ├──────────────────────┤   │   │    latitude     │
        │             ├───│ PK search_route_     │   │   │    longitude    │
        │             │   │    history_id        │   │   │    front_lat    │
        │             │   │ FK user_id           │   │   │    front_lon    │
        │             │   │ FK route_itineraries_│   │   │    phone        │
        │             │   │    id                │   │   │    description  │
        │             │   │    departure         │   │   │    created_at   │
        │             │   │    arrival           │   │   │    updated_at   │
        │             │   │    created_at        │   │   │    deleted_at   │
        │             │   └──────────────────────┘   │   └─────────────────┘
        │             │                              │
        │             │   ┌─────────────────┐        │
        │             │   │   saved_place   │        │
        │             │   ├─────────────────┤        │
        │             └───│ PK saved_place_ │────────┘
        │                 │    id           │
        └────────────────►│ FK user_id      │
                          │    category     │
                          │    name         │
                          │    address      │
                          │    lat          │
                          │    lon          │
                          │    created_at   │
                          │    updated_at   │
                          │    deleted_at   │
                          └─────────────────┘

┌─────────────────────┐       ┌─────────────────┐
│   route_itinerary   │       │    route_leg    │
├─────────────────────┤       ├─────────────────┤
│ PK route_itinerary_ │◄──────│ PK route_leg_id │
│    id               │       │ FK route_       │
│ FK request_id       │       │    itinerary_id │
│    total_time       │       │    leg_index    │
│    total_distance   │       │    mode         │
│    total_fare       │       │    section_time │
│    transfer_count   │       │    distance     │
│    path_type        │       │    path_        │
│    created_at       │       │    coordinates  │
│    updated_at       │       │    path_geometry│
│    deleted_at       │       │    created_at   │
└─────────────────────┘       │    updated_at   │
        ▲                     │    deleted_at   │
        │                     └─────────────────┘
        │
┌───────┴─────────────────────────────────────────┐
│                      route                       │
├─────────────────────────────────────────────────┤
│ PK route_id                                      │
│ FK user_id                                       │
│ FK bot_id                                        │
│ FK route_leg_id                                  │
│    status                                        │
│    start_time                                    │
│    end_time                                      │
│    duration                                      │
│    rank                                          │
│    is_win                                        │
│    start_lat, start_lon                          │
│    end_lat, end_lon                              │
│    created_at                                    │
│    updated_at                                    │
│    deleted_at                                    │
└─────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────┐
│       bot       │
├─────────────────┤
│ PK bot_id       │
│    name         │
│    type         │
│    created_at   │
│    updated_at   │
│    deleted_at   │
└─────────────────┘
```

### **7.3 주요 필드 설명**

#### `user` 테이블
| 필드 | 타입 | 설명 |
|------|------|------|
| user_id | BIGINT | PK |
| name | VARCHAR(50) | 이름 |
| email | VARCHAR(255) | 이메일 (고유) |
| password | VARCHAR(255) | 암호화된 비밀번호 |
| nickname | VARCHAR(50) | 닉네임 |
| type | VARCHAR(20) | 사용자 유형 (일반/소셜) |
| last_login_date | TIMESTAMP | 최근 로그인 일자 |

#### `route` 테이블 (경주 세션)
| 필드 | 타입 | 설명 |
|------|------|------|
| route_id | BIGINT | PK |
| user_id | BIGINT | FK → user |
| bot_id | BIGINT | FK → bot |
| route_leg_id | BIGINT | FK → route_leg |
| status | VARCHAR(20) | 상태 (WAITING/RUNNING/FINISHED/CANCELLED) |
| start_time | TIMESTAMP | 시작 시간 |
| end_time | TIMESTAMP | 종료 시간 |
| duration | INTEGER | 소요 시간 (초) |
| rank | INTEGER | 순위 |
| is_win | BOOLEAN | 승리 여부 |
| start_lat/lon | DOUBLE PRECISION | 출발 좌표 |
| end_lat/lon | DOUBLE PRECISION | 도착 좌표 |

#### `route_leg` 테이블 (경로 구간)
| 필드 | 타입 | 설명 |
|------|------|------|
| route_leg_id | BIGINT | PK |
| route_itinerary_id | BIGINT | FK → route_itinerary |
| leg_index | INT | 구간 순서 |
| mode | VARCHAR(20) | 이동수단 (WALK/BUS/SUBWAY) |
| section_time | INT | 구간 소요시간 (초) |
| distance | INT | 구간 거리 (미터) |
| path_coordinates | JSONB | 상세 좌표 리스트 |
| path_geometry | GEOMETRY(LineString, 4326) | PostGIS 경로 지오메트리 |

#### `poi_place` 테이블 (POI 정보)
| 필드 | 타입 | 설명 |
|------|------|------|
| poi_search_place_id | BIGINT | PK |
| tmap_id | VARCHAR(100) | TMap POI ID |
| name | VARCHAR(255) | 장소명 |
| category | VARCHAR(100) | 카테고리 |
| address_road | VARCHAR(255) | 도로명 주소 |
| address_jibun | VARCHAR(255) | 지번 주소 |
| latitude/longitude | DOUBLE PRECISION | 중심 좌표 |
| front_latitude/longitude | DOUBLE PRECISION | 입구 좌표 |
| phone | VARCHAR(50) | 전화번호 |

---

## **8. 비기능 요구사항 (Non-Functional Requirements)**

### **성능 및 안정성**

- **메시지 신뢰성:** RabbitMQ의 Message Durability를 활용하여 작업 유실 방지.
- **렌더링 최적화:** Mapbox GL JS의 WebGL 기반 렌더링을 통해 다수의 마커와 복잡한 경로선이 있어도 60fps 유지.

---

## **9. UI/UX 가이드라인**

- **지도 스타일:** Mapbox 기본 스타일 사용 (추후 커스텀 테마 적용 가능).
- **마커:** 버스, 지하철, 사용자 아이콘을 3D 느낌의 SVG 또는 PNG로 제작하여 Mapbox Marker로 적용.
- **경로선:** 내가 가는 길(파란색 Neon), 봇이 가는 길(붉은색/노란색 Neon)으로 구분하여 시인성 확보.
- **브랜딩:** "HAD BETTER" 로고 및 컬러 팔레트 적용.

---

## **10. 개발 일정 (Milestone)**

1. **Phase 1:** 프로젝트 세팅, Docker(Django+RabbitMQ+PostGIS) 환경 구축.
2. **Phase 2:** Mapbox 연동 (API Key 발급, 지도 출력, 마커 테스트).
3. **Phase 3:** TMap API 경로 데이터 → Mapbox GeoJSON 변환 및 그리기 구현.
4. **Phase 4 (Backend Core):** RabbitMQ Exchange 설정, Celery 스케줄러 구현 (실시간 데이터 수집).
5. **Phase 5 (Full Integration):** Django SSE 구현, 프론트엔드 실시간 마커 이동 연동.
6. **Phase 6:** 최종 테스트 및 배포.
