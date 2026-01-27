# 공공데이터포탈 API 연동 흐름 v1.0

## 1. 개요

TMAP 경로탐색 응답에서 받은 버스/지하철 정보를 공공데이터포탈 API와 연동하여 실시간 도착정보 및 위치를 조회하는 흐름을 정의합니다.

---

## 2. 사용 API 목록

### 2.1 버스 API (서울시 공공데이터포탈)

| 서비스 | API | URL | 용도 | TPS |
|--------|-----|-----|------|-----|
| 노선정보조회 | `getBusRouteList` | ws.bus.go.kr/api/rest/busRouteInfo/getBusRouteList | 버스번호 → route_id | 30 |
| 정류소정보조회 | `getStationByNameList` | ws.bus.go.kr/api/rest/stationinfo/getStationByName | 정류소명 → stId, arsId | 30 |
| 버스도착정보조회 | `getArrInfoByRouteAll` | ws.bus.go.kr/api/rest/arrive/getArrInfoByRouteAll | 버스 도착정보 | 30 |
| 버스위치정보조회 | `getBusPosByVehId` | ws.bus.go.kr/api/rest/buspos/getBusPosByVehId | 버스 실시간 위치 | 30 |

### 2.2 지하철 API (서울 열린데이터광장)

| 서비스 | API | URL | 용도 |
|--------|-----|-----|------|
| 실시간 도착정보 | `realtimeStationArrival` | swopenAPI.seoul.go.kr/api/subway/{KEY}/json/realtimeStationArrival/{START}/{END}/{역명} | 특정 역 도착 예정 열차 |
| 실시간 위치정보 | `realtimePosition` | swopenAPI.seoul.go.kr/api/subway/{KEY}/json/realtimePosition/{START}/{END}/{호선명} | 특정 호선 모든 열차 위치 |

---

## 3. TMAP 응답 데이터 구조

### 3.1 전체 구조

```json
{
  "data": {
    "legs": [
      { "mode": "WALK", ... },
      { "mode": "BUS", ... },
      { "mode": "WALK", ... },
      { "mode": "SUBWAY", ... },
      { "mode": "WALK", ... }
    ]
  }
}
```

### 3.2 BUS Leg 예시

```json
{
  "mode": "BUS",
  "route": "지선:6625",
  "routeId": "1021223001",
  "start": {
    "name": "신목초등학교입구",
    "lon": 126.870875,
    "lat": 37.517294444444445
  },
  "end": {
    "name": "문래역3번출구",
    "lon": 126.8943,
    "lat": 37.51905277777778
  },
  "passStopList": {
    "stations": [
      { "index": 0, "stationName": "신목초등학교입구", "lon": "126.870875", "lat": "37.517294", "stationID": "754885" },
      { "index": 1, "stationName": "목동14단지관리사무소앞", ... },
      ...
      { "index": 7, "stationName": "문래역3번출구", "lon": "126.894300", "lat": "37.519053", "stationID": "755020" }
    ]
  }
}
```

### 3.3 SUBWAY Leg 예시

```json
{
  "mode": "SUBWAY",
  "route": "수도권2호선",
  "routeId": "110021006",
  "start": {
    "name": "문래",
    "lon": 126.89483888888888,
    "lat": 37.518077777777776
  },
  "end": {
    "name": "홍대입구",
    "lon": 126.92349722222222,
    "lat": 37.55663055555556
  },
  "passStopList": {
    "stations": [
      { "index": 0, "stationName": "문래", "lon": "126.894839", "lat": "37.518078", "stationID": "110235" },
      { "index": 1, "stationName": "영등포구청", ... },
      { "index": 2, "stationName": "당산", ... },
      { "index": 3, "stationName": "합정", ... },
      { "index": 4, "stationName": "홍대입구", "lon": "126.923497", "lat": "37.556631", "stationID": "110239" }
    ]
  }
}
```

---

## 4. 전체 처리 흐름도

```
┌─────────────────────────────────────────────────────────────────┐
│                      TMAP 경로탐색 응답                          │
│                                                                 │
│  legs: [WALK, BUS, WALK, SUBWAY, WALK]                         │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Leg 타입 분기 처리                           │
│                                                                 │
│  for leg in legs:                                               │
│      if leg.mode == "WALK":                                     │
│          → 도보 처리 (API 호출 없음, 시간 경과만 시뮬레이션)        │
│                                                                 │
│      elif leg.mode == "BUS":                                    │
│          → 버스 API 연동 흐름 (섹션 5 참조)                       │
│                                                                 │
│      elif leg.mode == "SUBWAY":                                 │
│          → 지하철 API 연동 흐름 (섹션 6 참조)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 버스 (BUS) API 연동 흐름

### 5.1 전체 흐름도

```
┌─────────────────────────────────────────────────────────────────┐
│                      TMAP BUS Leg 데이터                         │
│                                                                 │
│  route: "지선:6625"                                              │
│  start.name: "신목초등학교입구"                                    │
│  start.lon: 126.870875                                          │
│  start.lat: 37.517294                                           │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ 데이터 파싱
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      1단계: 데이터 추출                           │
│                                                                 │
│  버스번호: "6625" (route에서 "지선:" 제거)                        │
│  정류소명: "신목초등학교입구"                                      │
│  좌표: (126.870875, 37.517294)                                  │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ 2-A: 노선 ID 조회        │     │ 2-B: 정류소 ID 조회      │
│                         │     │                         │
│ API: getBusRouteList    │     │ API: getStationByNameList│
│                         │     │                         │
│ 요청:                    │     │ 요청:                    │
│ - strSrch: "6625"       │     │ - stSrch: "신목초등학교"  │
│                         │     │                         │
│ 응답:                    │     │ 응답:                    │
│ - busRouteId: 100100303 │     │ - stId: 118000108       │
│ - busRouteNm: 6625      │     │ - stNm: 신목초등학교입구  │
│                         │     │ - arsId: 19193          │
│                         │     │ - tmX: 126.8944         │
│ ⏱️ 100ms                │     │ - tmY: 37.5190          │
│                         │     │                         │
│                         │     │ ⏱️ 100ms                │
└───────────┬─────────────┘     └───────────┬─────────────┘
            │                               │
            │                               │
            ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│ 필터링:                  │     │ 필터링:                  │
│                         │     │                         │
│ busRouteNm == "6625"    │     │ 1. stNm에 검색어 포함 확인│
│ 정확히 일치하는 것 선택   │     │                         │
│                         │     │ 2. TMAP 좌표와 거리 계산  │
│                         │     │    - 정류소 1: 21m       │
│                         │     │    - 정류소 2: 10m ✅    │
│                         │     │                         │
│                         │     │ 3. 가장 가까운 것 선택    │
│                         │     │    (상행/하행 구분)       │
└───────────┬─────────────┘     └───────────┬─────────────┘
            │                               │
            │   route_id: 100100303         │   stId: 118000108
            │                               │   arsId: 19193
            └───────────────┬───────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3단계: 버스 도착정보 조회                                         │
│                                                                 │
│ API: getArrInfoByRouteAll                                       │
│ URL: ws.bus.go.kr/api/rest/arrive/getArrInfoByRouteAll          │
│                                                                 │
│ 요청:                                                            │
│ - stId: 118000108                                               │
│ - busRouteId: 100100303                                         │
│ - ord: 정류소 순번                                               │
│                                                                 │
│ 응답:                                                            │
│ - vehId1: 114070504 (첫 번째 버스 차량 ID)                        │
│ - arrmsg1: "3분 20초 후 [2번째 전]"                               │
│ - traTime1: 200 (도착 예정 시간, 초)                              │
│ - sectOrd1: 현재 구간 순번                                        │
│ - stationNm1: "양평신동아아파트" (현재 위치 정류소명)               │
│ - vehId2: 114070512 (두 번째 버스 차량 ID)                        │
│ - arrmsg2: "10분 후 [5번째 전]"                                   │
│                                                                 │
│ ⏱️ 100ms                                                        │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ vehId1 (차량 ID) 추출
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4단계: 버스 실시간 위치 조회                                      │
│                                                                 │
│ API: getBusPosByVehId                                           │
│ URL: ws.bus.go.kr/api/rest/buspos/getBusPosByVehId              │
│                                                                 │
│ 요청:                                                            │
│ - vehId: 114070504                                              │
│                                                                 │
│ 응답:                                                            │
│ - tmX: 126.887492 (경도)                                        │
│ - tmY: 37.522567 (위도)                                         │
│ - stopFlag: 0 (운행 중) / 1 (정차 중)                            │
│ - dataTm: 2026-01-16 14:30:25 (데이터 수신 시간)                 │
│                                                                 │
│ ※ vehId가 0이거나 없으면 버스가 아직 출발 전 → 위치 추적 스킵      │
│                                                                 │
│ ⏱️ 100ms                                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 정류소 좌표 매칭 상세

동일한 이름의 정류소가 여러 개 있을 경우 (상행/하행), TMAP 좌표와 가장 가까운 정류소를 선택합니다.

```
┌─────────────────────────────────────────────────────────────────┐
│                   정류소 좌표 매칭 예시                           │
│                                                                 │
│  검색: getStationByNameList(stSrch="문래역3번출구")              │
│                                                                 │
│  응답:                                                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ [정류소 1]                                               │    │
│  │ stId: 118000107                                         │    │
│  │ arsId: 19192                                            │    │
│  │ stNm: 문래역3번출구                                      │    │
│  │ tmX: 126.8942227741 (경도)                              │    │
│  │ tmY: 37.5192330216 (위도)                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ [정류소 2]                                               │    │
│  │ stId: 118000108                                         │    │
│  │ arsId: 19193                                            │    │
│  │ stNm: 문래역3번출구                                      │    │
│  │ tmX: 126.8944124856 (경도)                              │    │
│  │ tmY: 37.5190642533 (위도)                               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  TMAP 좌표: (126.8943, 37.51905277)                             │
│                                                                 │
│  거리 계산:                                                      │
│  - 정류소 1: 약 21m                                              │
│  - 정류소 2: 약 10m ✅ 선택                                       │
│                                                                 │
│  결과: stId: 118000108, arsId: 19193                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.3 거리 계산 함수

```python
import math

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    두 좌표 사이의 거리 계산 (미터)
    Haversine 공식 사용
    """
    R = 6371000  # 지구 반지름 (미터)
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + \
        math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c  # 미터 단위
```

### 5.4 버스번호 파싱

TMAP의 route 필드에서 버스번호만 추출합니다.

```python
def parse_bus_number(route: str) -> str:
    """
    TMAP route 필드에서 버스번호 추출
    
    예시:
    - "지선:6625" → "6625"
    - "간선:472" → "472"
    - "마을:서초15" → "서초15"
    """
    if ":" in route:
        return route.split(":")[1]
    return route
```

---

## 6. 지하철 (SUBWAY) API 연동 흐름

### 6.1 전체 흐름도

```
┌─────────────────────────────────────────────────────────────────┐
│                     TMAP SUBWAY Leg 데이터                       │
│                                                                 │
│  route: "수도권2호선"                                            │
│  start.name: "문래"                                              │
│  end.name: "홍대입구"                                            │
│  passStopList.stations: [문래, 영등포구청, 당산, 합정, 홍대입구]   │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ 데이터 파싱
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      1단계: 데이터 추출                           │
│                                                                 │
│  호선명: "2호선" (route에서 "수도권" 제거)                        │
│  승차역: "문래"                                                   │
│  하차역: "홍대입구"                                               │
│  경유역: [문래, 영등포구청, 당산, 합정, 홍대입구]                   │
│                                                                 │
│  지하철호선ID 매핑:                                               │
│  - 1호선: 1001, 2호선: 1002, 3호선: 1003, 4호선: 1004            │
│  - 5호선: 1005, 6호선: 1006, 7호선: 1007, 8호선: 1008            │
│  - 9호선: 1009, 경의중앙선: 1063, 공항철도: 1065                  │
│  - 경춘선: 1067, 수인분당선: 1075, 신분당선: 1077                 │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2단계: 실시간 도착정보 조회                                       │
│                                                                 │
│ API: realtimeStationArrival                                     │
│ URL: swopenAPI.seoul.go.kr/api/subway/{KEY}/json/               │
│      realtimeStationArrival/0/10/{역명}                         │
│                                                                 │
│ 요청:                                                            │
│ - statnNm: "문래"                                                │
│                                                                 │
│ 응답 (여러 열차 정보):                                            │
│ ┌─────────────────────────────────────────────────────────┐     │
│ │ [열차 1]                                                 │     │
│ │ - subwayId: 1002 (2호선)                                 │     │
│ │ - updnLine: "내선" (상행/내선, 하행/외선)                  │     │
│ │ - trainLineNm: "성수행 - 당산방면"                        │     │
│ │ - btrainNo: "2156" (열차번호)                            │     │
│ │ - barvlDt: 180 (도착예정시간, 초)                         │     │
│ │ - arvlMsg2: "전역 출발" (도착메시지)                       │     │
│ │ - arvlMsg3: "영등포구청 출발" (상세메시지)                  │     │
│ │ - arvlCd: 2 (도착코드: 0진입,1도착,2출발,3전역출발,99운행중)│     │
│ │ - bstatnNm: "성수" (종착역)                               │     │
│ │ - lstcarAt: 0 (막차여부: 1막차, 0아님)                    │     │
│ └─────────────────────────────────────────────────────────┘     │
│ ┌─────────────────────────────────────────────────────────┐     │
│ │ [열차 2]                                                 │     │
│ │ - subwayId: 1002                                         │     │
│ │ - updnLine: "외선"                                       │     │
│ │ - trainLineNm: "신도림행 - 영등포구청방면"                 │     │
│ │ - ...                                                    │     │
│ └─────────────────────────────────────────────────────────┘     │
│                                                                 │
│ ※ 필터링: 봇이 타야 할 방향(상행/하행)의 열차만 선택              │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ 열차번호 (btrainNo) 추출
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3단계: 실시간 열차 위치정보 조회                                  │
│                                                                 │
│ API: realtimePosition                                           │
│ URL: swopenAPI.seoul.go.kr/api/subway/{KEY}/json/               │
│      realtimePosition/0/100/{호선명}                            │
│                                                                 │
│ 요청:                                                            │
│ - subwayNm: "2호선"                                              │
│                                                                 │
│ 응답 (해당 호선의 모든 열차 위치):                                 │
│ ┌─────────────────────────────────────────────────────────┐     │
│ │ [열차 1]                                                 │     │
│ │ - trainNo: "2156" (열차번호)                             │     │
│ │ - statnNm: "영등포구청" (현재 위치 역명)                   │     │
│ │ - statnId: "1002000236" (역 ID)                          │     │
│ │ - updnLine: 0 (0:상행/내선, 1:하행/외선)                  │     │
│ │ - trainSttus: 2 (0:진입, 1:도착, 2:출발, 3:전역출발)      │     │
│ │ - statnTnm: "성수" (종착역)                               │     │
│ │ - directAt: 0 (급행여부: 1급행, 0아님, 7특급)             │     │
│ │ - lstcarAt: 0 (막차여부)                                  │     │
│ │ - recptnDt: "2026-01-16 14:30:25" (수신시간)             │     │
│ └─────────────────────────────────────────────────────────┘     │
│ ┌─────────────────────────────────────────────────────────┐     │
│ │ [열차 2]                                                 │     │
│ │ - trainNo: "2158"                                        │     │
│ │ - statnNm: "당산"                                        │     │
│ │ - ...                                                    │     │
│ └─────────────────────────────────────────────────────────┘     │
│                                                                 │
│ ※ 필터링: 도착정보에서 받은 열차번호(btrainNo)와 일치하는 열차 선택│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 방향(상행/하행) 결정 로직

```
┌─────────────────────────────────────────────────────────────────┐
│                    방향 결정 로직                                │
│                                                                 │
│  TMAP 데이터:                                                    │
│  - 승차역: "문래" (index: 0)                                     │
│  - 하차역: "홍대입구" (index: 4)                                 │
│  - 경유역: [문래, 영등포구청, 당산, 합정, 홍대입구]                │
│                                                                 │
│  판단:                                                           │
│  - 다음역(영등포구청) 방향으로 가는 열차 선택                      │
│  - 또는 종착역(bstatnNm)이 하차역 방향인 열차 선택                │
│                                                                 │
│  2호선 예시 (순환선):                                            │
│  - 내선 (상행): 문래 → 영등포구청 → 당산 → 합정 → 홍대입구        │
│  - 외선 (하행): 문래 → 신도림 → 대림 → ...                       │
│                                                                 │
│  → "내선" (updnLine: "내선" 또는 updnLine: 0) 선택               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 호선명 파싱 및 매핑

```python
# 호선 ID 매핑
SUBWAY_LINE_MAP = {
    "1호선": "1001",
    "2호선": "1002",
    "3호선": "1003",
    "4호선": "1004",
    "5호선": "1005",
    "6호선": "1006",
    "7호선": "1007",
    "8호선": "1008",
    "9호선": "1009",
    "경의중앙선": "1063",
    "공항철도": "1065",
    "경춘선": "1067",
    "수인분당선": "1075",
    "신분당선": "1077",
    "우이신설선": "1092",
    "서해선": "1093",
    "경강선": "1081",
    "GTX-A": "1032",
}

def parse_subway_line(route: str) -> str:
    """
    TMAP route 필드에서 호선명 추출
    
    예시:
    - "수도권2호선" → "2호선"
    - "수도권경의중앙선" → "경의중앙선"
    """
    if route.startswith("수도권"):
        return route[3:]  # "수도권" 제거
    return route
```

---

## 7. API 호출 타이밍 및 주기

### 7.1 호출 주기 설계 원칙

일일 트래픽 제한(1000회)을 고려하여 상황별 호출 주기를 차등 적용합니다.

```
┌─────────────────────────────────────────────────────────────────┐
│                    호출 주기 계산                                │
│                                                                 │
│  일일 트래픽 제한: 1000회                                        │
│                                                                 │
│  30초 주기:                                                      │
│  - 1시간당: 120회                                                │
│  - 1000회로 사용 가능: 약 8.3시간 ✅                             │
│                                                                 │
│  15초 주기 (도착 임박 시):                                       │
│  - 1시간당: 240회                                                │
│  - 도착 임박 구간은 짧으므로 (약 2분) 영향 적음                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.2 버스 API 호출 주기

```
┌─────────────────────────────────────────────────────────────────┐
│                    버스 API 호출 타이밍                          │
│                                                                 │
│  [봇 상태: WAITING_BUS - 버스 대기 중]                           │
│                                                                 │
│  1. 초기 1회:                                                    │
│     - getBusRouteList (route_id 조회)                           │
│     - getStationByNameList (stId, arsId 조회)                   │
│                                                                 │
│  2. 도착 임박 시 (2분 이내): 15초마다 반복                        │
│     - getArrInfoByRouteAll (도착정보)                           │
│     - getBusPosByVehId (실시간 위치) - vehId가 있을 때만         │
│                                                                 │
│  3. 일반 대기 시 (2분 이상): 30초마다 반복                        │
│     - getArrInfoByRouteAll (도착정보)                           │
│     - getBusPosByVehId (실시간 위치) - vehId가 있을 때만         │
│                                                                 │
│  [봇 상태: RIDING_BUS - 버스 탑승 중]                            │
│                                                                 │
│  30초마다 반복:                                                  │
│     - getBusPosByVehId (실시간 위치)                            │
│                                                                 │
│  ※ 프론트엔드에서 turf.js로 보간 처리 (섹션 11 참조)             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.3 지하철 API 호출 주기

```
┌─────────────────────────────────────────────────────────────────┐
│                   지하철 API 호출 타이밍                         │
│                                                                 │
│  [봇 상태: WAITING_SUBWAY - 지하철 대기 중]                      │
│                                                                 │
│  1. 도착 임박 시 (2분 이내): 15초마다 반복                        │
│     - realtimeStationArrival (도착정보)                         │
│     - realtimePosition (열차 위치) - 열차번호를 알 때            │
│                                                                 │
│  2. 일반 대기 시 (2분 이상): 30초마다 반복                        │
│     - realtimeStationArrival (도착정보)                         │
│     - realtimePosition (열차 위치) - 열차번호를 알 때            │
│                                                                 │
│  [봇 상태: RIDING_SUBWAY - 지하철 탑승 중]                       │
│                                                                 │
│  30초마다 반복:                                                  │
│     - realtimePosition (열차 위치)                              │
│                                                                 │
│  ※ 프론트엔드에서 turf.js로 보간 처리 (섹션 11 참조)             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4 호출 주기 결정 로직

```python
def get_polling_interval(arrival_time_seconds: int) -> int:
    """
    도착 예정 시간에 따라 API 호출 주기 결정
    
    Args:
        arrival_time_seconds: 도착 예정 시간 (초)
    
    Returns:
        호출 주기 (초)
    """
    if arrival_time_seconds <= 120:  # 2분 이내
        return 15  # 15초 주기
    else:
        return 30  # 30초 주기
```

---

## 8. 응답 시간 및 트래픽 정리

### 8.1 버스 API

| API | 평균 응답시간 | TPS | 일일 제한 |
|-----|-------------|-----|----------|
| getBusRouteList | 100ms | 30 | - |
| getStationByNameList | 100ms | 30 | - |
| getArrInfoByRouteAll | 100ms | 30 | - |
| getBusPosByVehId | 100ms | 30 | - |

### 8.2 지하철 API

| API | 평균 응답시간 | 일일 제한 |
|-----|-------------|----------|
| realtimeStationArrival | 100-200ms | 1000회 |
| realtimePosition | 100-200ms | 1000회 |

### 8.3 트래픽 사용량 계산

```
┌─────────────────────────────────────────────────────────────────┐
│                    일일 트래픽 사용량 예시                        │
│                                                                 │
│  시나리오: 출퇴근 시뮬레이션 (2시간)                              │
│                                                                 │
│  버스 대기 (10분, 도착 임박 2분 포함):                           │
│  - 일반 대기 8분: 8 × 60 / 30 = 16회                            │
│  - 도착 임박 2분: 2 × 60 / 15 = 8회                             │
│  - 소계: 24회                                                    │
│                                                                 │
│  버스 탑승 (15분):                                               │
│  - 15 × 60 / 30 = 30회                                          │
│                                                                 │
│  지하철 대기 (5분, 도착 임박 2분 포함):                           │
│  - 일반 대기 3분: 3 × 60 / 30 = 6회                             │
│  - 도착 임박 2분: 2 × 60 / 15 = 8회                             │
│  - 소계: 14회                                                    │
│                                                                 │
│  지하철 탑승 (20분):                                             │
│  - 20 × 60 / 30 = 40회                                          │
│                                                                 │
│  1회 통근 합계: 약 108회                                         │
│  왕복 합계: 약 216회                                             │
│                                                                 │
│  1000회 / 216회 ≈ 4.6일 사용 가능                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. 에러 처리

### 9.1 버스 API 에러 코드

| 코드 | 설명 |
|------|------|
| 0 | 정상 처리 |
| 1 | 시스템 오류 |
| 2 | 잘못된 쿼리 요청 |
| 3 | 정류소를 찾을 수 없음 |
| 4 | 노선을 찾을 수 없음 |
| 6 | 실시간 정보를 읽을 수 없음 |
| 8 | 운행 종료 |

### 9.2 지하철 API 에러 코드

| 코드 | 설명 |
|------|------|
| INFO-000 | 정상 처리 |
| INFO-200 | 해당하는 데이터가 없음 |
| ERROR-300 | 필수 값 누락 |
| INFO-100 | 인증키 유효하지 않음 |
| ERROR-500 | 서버 오류 |

---

## 10. 주의사항

### 10.1 지하철 도착정보 시간 보정

```
※ 주의사항 : 원천에서 데이터가 수집 및 가공되어 서비스되는 과정에서 
시간 차가 발생할 수 있습니다.

출력값 중 recptnDt(열차 도착정보를 생성한 시각)는 데이터가 생성된 
시간을 의미하며 현재시각과 recptnDt의 차이 만큼 열차가 더 진행한 
것으로 보정해서 사용해야 합니다.

예시) 현재시간이 10시 5분 30초이고, recptnDt가 10시 3분 30초인 경우
2분간의 시차가 발생하므로 도착정보는 2분씩 당겨지거나 
1개의 역을 더 진행한 것으로 판단
```

### 10.2 버스 차량 ID가 0인 경우

```
※ 버스가 아직 출발하지 않은 경우 vehId가 0으로 반환됩니다.
이 경우 getBusPosByVehId API 호출을 스킵하고, 
다음 주기에 다시 도착정보를 조회합니다.
```

### 10.3 정류소명 검색 시 부분 일치

```
※ getStationByNameList API는 부분 일치 검색입니다.
"신목초등학교"로 검색하면 "신목초등학교입구", "신목초등학교" 등 
여러 결과가 반환될 수 있습니다.

반드시 TMAP 좌표와 비교하여 가장 가까운 정류소를 선택해야 합니다.
```

---

## 11. 프론트엔드 보간 처리

### 11.1 보간이 필요한 이유

API 호출 주기가 30초이므로, 보간 없이는 마커가 30초간 멈춰있다가 갑자기 순간이동하는 현상이 발생합니다.

```
┌─────────────────────────────────────────────────────────────────┐
│                    보간 없이 30초 주기                           │
│                                                                 │
│  API 응답 시점:  0초 ─────────────────────────────── 30초       │
│                   │                                    │        │
│  실제 버스 위치:  A정류소 ──────────────────────────→ B정류소    │
│                                                                 │
│  화면에 보이는 것: A정류소에서 30초간 멈춰있다가                   │
│                   갑자기 B정류소로 순간이동 ❌                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    보간 적용 시                                  │
│                                                                 │
│  API 응답 시점:  0초 ─────────────────────────────── 30초       │
│                   │                                    │        │
│  보간된 위치:    A ─→─→─→─→─→─→─→─→─→─→─→─→─→─→─→─→─→ B         │
│                   (부드럽게 이동하는 것처럼 보임) ✅               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.2 보간 전략

#### 방법 1: 단순 선형 보간 (비추천)

```
A ──────────────────────────────────────→ B
  직선으로 이동 (도로 무시)
  
문제: 버스가 건물을 뚫고 지나감 ❌
```

#### 방법 2: 경로 기반 보간 (추천) ✅

TMAP 응답의 `passShape.linestring`을 활용하여 실제 도로 경로를 따라 보간합니다.

```
┌─────────────────────────────────────────────────────────────────┐
│              TMAP passShape 활용한 경로 보간                     │
│                                                                 │
│  TMAP 응답에 이미 경로 좌표가 있음:                               │
│                                                                 │
│  "passShape": {                                                 │
│    "linestring": "126.870911,37.517314 126.870972,37.517231..." │
│  }                                                              │
│                                                                 │
│  이걸 turf.js lineString으로 변환하면:                           │
│                                                                 │
│       ┌──┐                                                      │
│  A ───┘  └───┬───┐                                              │
│              │   └──→ B                                         │
│              │                                                  │
│         실제 도로 경로를 따라 이동! ✅                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.3 turf.js 핵심 함수

| 함수 | 용도 | 예시 |
|------|------|------|
| `turf.lineString()` | passShape → LineString 변환 | 경로 객체 생성 |
| `turf.length()` | 전체 경로 길이 계산 | 3.5km |
| `turf.nearestPointOnLine()` | 현재 위치를 경로 위에 스냅 | 경로 상 가장 가까운 점 |
| `turf.along()` | 경로 시작점에서 N km 지점의 좌표 | 보간 위치 계산 |
| `turf.bearing()` | 두 점 사이 방향 (각도) | 마커 회전용 |

### 11.4 구현 코드 예시

```javascript
import * as turf from '@turf/turf';

class RouteInterpolator {
  constructor(passShapeLinestring) {
    // 1. TMAP passShape를 LineString으로 변환
    this.routeLine = turf.lineString(
      passShapeLinestring.split(' ').map(coord => {
        const [lon, lat] = coord.split(',').map(Number);
        return [lon, lat];
      })
    );
    
    // 2. 전체 경로 길이 계산 (km)
    this.totalLength = turf.length(this.routeLine, { units: 'kilometers' });
    
    // 상태
    this.currentDistance = 0;      // 현재 위치 (km)
    this.currentSpeed = 0;         // 현재 속도 (km/h)
    this.lastUpdateTime = null;    // 마지막 API 업데이트 시간
  }
  
  /**
   * API 응답 수신 시 호출
   * @param {number} lon - 경도
   * @param {number} lat - 위도
   * @param {number} stopFlag - 정차 여부 (0: 운행중, 1: 정차중)
   */
  updateFromAPI(lon, lat, stopFlag) {
    const now = Date.now();
    const currentPoint = turf.point([lon, lat]);
    
    // 현재 위치를 경로 위에 스냅
    const snapped = turf.nearestPointOnLine(this.routeLine, currentPoint);
    const newDistance = snapped.properties.location; // km
    
    // 속도 계산 (이전 위치가 있을 때)
    if (this.lastUpdateTime) {
      const timeDiff = (now - this.lastUpdateTime) / 1000 / 3600; // 시간 단위
      const distanceDiff = newDistance - this.currentDistance;
      
      if (timeDiff > 0 && distanceDiff > 0) {
        this.currentSpeed = distanceDiff / timeDiff; // km/h
      }
    }
    
    // 정차 중이면 속도 0
    if (stopFlag === 1) {
      this.currentSpeed = 0;
    }
    
    // 상태 업데이트
    this.currentDistance = newDistance;
    this.lastUpdateTime = now;
    
    return this.getCurrentPosition();
  }
  
  /**
   * 애니메이션 프레임에서 호출 - 보간된 위치 반환
   * @returns {{ lon: number, lat: number, bearing: number }}
   */
  getInterpolatedPosition() {
    if (!this.lastUpdateTime) return null;
    
    const now = Date.now();
    const elapsed = (now - this.lastUpdateTime) / 1000; // 초
    
    // 예상 이동 거리 계산
    const estimatedDistance = this.currentSpeed * (elapsed / 3600); // km
    const interpolatedDistance = Math.min(
      this.currentDistance + estimatedDistance,
      this.totalLength
    );
    
    // 경로 상의 해당 거리 지점 좌표 구하기
    const point = turf.along(this.routeLine, interpolatedDistance, { 
      units: 'kilometers' 
    });
    
    // 방향(bearing) 계산 - 마커 회전용
    const nextPoint = turf.along(this.routeLine, interpolatedDistance + 0.01, { 
      units: 'kilometers' 
    });
    const bearing = turf.bearing(point, nextPoint);
    
    return {
      lon: point.geometry.coordinates[0],
      lat: point.geometry.coordinates[1],
      bearing: bearing,
      distance: interpolatedDistance
    };
  }
  
  /**
   * 현재 API 기준 위치 반환
   */
  getCurrentPosition() {
    const point = turf.along(this.routeLine, this.currentDistance, { 
      units: 'kilometers' 
    });
    
    return {
      lon: point.geometry.coordinates[0],
      lat: point.geometry.coordinates[1],
      distance: this.currentDistance
    };
  }
}
```

### 11.5 애니메이션 루프 예시

```javascript
// React 컴포넌트 예시
function BusMarker({ passShape, busPosition }) {
  const interpolatorRef = useRef(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  
  // 초기화
  useEffect(() => {
    if (passShape) {
      interpolatorRef.current = new RouteInterpolator(passShape);
    }
  }, [passShape]);
  
  // API 응답 시 업데이트
  useEffect(() => {
    if (interpolatorRef.current && busPosition) {
      interpolatorRef.current.updateFromAPI(
        busPosition.lon,
        busPosition.lat,
        busPosition.stopFlag
      );
    }
  }, [busPosition]);
  
  // 애니메이션 루프
  useEffect(() => {
    let animationId;
    
    const animate = () => {
      if (interpolatorRef.current) {
        const position = interpolatorRef.current.getInterpolatedPosition();
        if (position) {
          setMarkerPosition(position);
        }
      }
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);
  
  if (!markerPosition) return null;
  
  return (
    <Marker
      position={[markerPosition.lat, markerPosition.lon]}
      rotation={markerPosition.bearing}
    />
  );
}
```

### 11.6 보간 처리 흐름도

```
┌─────────────────────────────────────────────────────────────────┐
│                      보간 처리 흐름                              │
│                                                                 │
│  [API 응답 수신 (30초마다)] ────────────────────────────────────  │
│        │                                                        │
│        ▼                                                        │
│  ┌──────────────────┐                                           │
│  │ 1. 현재 위치를 경로에                                         │
│  │    스냅 (nearestPointOnLine)                                 │
│  └────────┬─────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐                                           │
│  │ 2. 이전 위치 ~ 현재 위치                                      │
│  │    실제 이동 거리/시간 계산                                    │
│  │    → 실제 속도 추정                                           │
│  └────────┬─────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐                                           │
│  │ 3. 다음 30초간 예상 이동거리                                   │
│  │    = 추정 속도 × 30초                                         │
│  └────────┬─────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  [requestAnimationFrame 루프 (60fps)]                           │
│        │                                                        │
│        ▼                                                        │
│  ┌──────────────────┐                                           │
│  │ 매 프레임마다:                                                │
│  │ 1. 경과 시간 계산                                             │
│  │ 2. turf.along()으로 보간 위치 계산                            │
│  │ 3. turf.bearing()으로 방향 계산                               │
│  │ 4. 지도에 마커 업데이트                                        │
│  └────────┬─────────┘                                           │
│           │                                                     │
│           ▼                                                     │
│  [30초 후 새 API 응답]                                           │
│        │                                                        │
│        ▼                                                        │
│  ┌──────────────────┐                                           │
│  │ 보간 위치 vs 실제 위치 차이 발생 시                            │
│  │ → 부드럽게 실제 위치로 보정 (easing)                          │
│  └──────────────────┘                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.7 버스 vs 지하철 보간 차이

```
┌─────────────────────────────────────────────────────────────────┐
│                    버스 보간 (복잡)                              │
│                                                                 │
│  특징:                                                          │
│  - 도로 경로가 복잡 (곡선, 교차로 등)                             │
│  - 신호 대기, 정체로 속도 변화 큼                                 │
│  - 정류소 정차 시간 불규칙 (10~30초)                             │
│                                                                 │
│  처리:                                                          │
│  - passShape linestring 기반 경로 보간 필수                      │
│  - stopFlag 확인하여 정차 시 보간 멈춤                            │
│  - 속도 추정 시 최근 2-3회 평균 사용                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   지하철 보간 (단순)                             │
│                                                                 │
│  특징:                                                          │
│  - 역 사이 경로가 거의 직선 또는 완만한 곡선                       │
│  - 역 간 소요시간이 일정 (약 2분)                                │
│  - 정차 시간 일정 (약 20-30초)                                   │
│                                                                 │
│  처리:                                                          │
│  - 단순 선형 보간으로도 충분                                      │
│  - 또는 passShape 사용 (더 정확)                                 │
│  - trainSttus로 상태 확인 (0:진입, 1:도착, 2:출발)               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 11.8 보간 오차 보정 (Easing)

새 API 응답이 왔을 때, 보간된 위치와 실제 위치 사이에 차이가 발생할 수 있습니다.
순간적으로 위치를 바꾸면 마커가 튀는 현상이 발생하므로, easing을 적용하여 부드럽게 보정합니다.

```javascript
class PositionCorrector {
  constructor() {
    this.correctionStartTime = null;
    this.correctionDuration = 1000; // 1초에 걸쳐 보정
    this.fromPosition = null;
    this.toPosition = null;
  }
  
  /**
   * 보정 시작
   * @param {Object} interpolatedPos - 보간된 위치
   * @param {Object} actualPos - 실제 위치 (API 응답)
   */
  startCorrection(interpolatedPos, actualPos) {
    const distance = turf.distance(
      turf.point([interpolatedPos.lon, interpolatedPos.lat]),
      turf.point([actualPos.lon, actualPos.lat]),
      { units: 'meters' }
    );
    
    // 오차가 50m 이상일 때만 보정
    if (distance > 50) {
      this.correctionStartTime = Date.now();
      this.fromPosition = interpolatedPos;
      this.toPosition = actualPos;
    }
  }
  
  /**
   * 보정된 위치 반환
   */
  getCorrectedPosition(currentInterpolatedPos) {
    if (!this.correctionStartTime) {
      return currentInterpolatedPos;
    }
    
    const elapsed = Date.now() - this.correctionStartTime;
    const progress = Math.min(elapsed / this.correctionDuration, 1);
    
    // easeOutCubic 함수
    const eased = 1 - Math.pow(1 - progress, 3);
    
    if (progress >= 1) {
      this.correctionStartTime = null;
      return currentInterpolatedPos;
    }
    
    // 보간 위치와 실제 위치 사이를 easing으로 보정
    return {
      lon: this.fromPosition.lon + (currentInterpolatedPos.lon - this.fromPosition.lon) * eased,
      lat: this.fromPosition.lat + (currentInterpolatedPos.lat - this.fromPosition.lat) * eased
    };
  }
}
```

### 11.9 평균 속도 참고값

보간 시 초기 속도 추정에 사용할 수 있는 참고값입니다.

| 교통수단 | 평균 속도 | 30초당 이동거리 |
|---------|----------|---------------|
| 버스 (시내) | 15-20 km/h | 125-167m |
| 버스 (간선도로) | 20-30 km/h | 167-250m |
| 지하철 (역간) | 35-40 km/h | 292-333m |
| 지하철 (정차 포함) | 25-30 km/h | 208-250m |

---

*문서 버전: 1.0*
*작성일: 2026-01-16*
