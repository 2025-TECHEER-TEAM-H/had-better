# 개별 경로(Leg) 상세 조회 API 응답 (GET /api/v1/itineraries/legs/{route_leg_id})

## Request

```
GET /api/v1/itineraries/legs/14
Authorization: Bearer {access_token}
```

## Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "route_leg_id": 14,
    "route_itinerary_id": 3,
    "pathType": 1,
    "totalTime": 1229,
    "totalDistance": 8643,
    "totalWalkTime": 151,
    "totalWalkDistance": 182,
    "transferCount": 0,
    "fare": {
      "regular": {
        "totalFare": 1550,
        "currency": {
          "symbol": "￦",
          "currency": "원",
          "currencyCode": "KRW"
        }
      }
    },
    "legs": [
      {
        "mode": "WALK",
        "sectionTime": 114,
        "distance": 128,
        "start": {
          "name": "출발지",
          "lat": 37.555162,
          "lon": 126.936928
        },
        "end": {
          "name": "신촌",
          "lat": 37.555169444444445,
          "lon": 126.93700277777778
        },
        "steps": [
          {
            "streetName": "",
            "distance": 48,
            "description": "48m 이동",
            "linestring": "126.93693,37.555172 126.93708,37.555176 126.93731,37.55522 126.93745,37.55526"
          },
          {
            "streetName": "",
            "distance": 17,
            "description": "우회전 후 17m 이동",
            "linestring": "126.93745,37.55526 126.937515,37.555115"
          },
          {
            "streetName": "",
            "distance": 14,
            "description": "신촌역 5번출구에서 좌회전 후 14m 이동",
            "linestring": "126.937515,37.555115 126.93766,37.55516 126.93766,37.555157"
          },
          {
            "streetName": "보행자도로",
            "distance": 49,
            "description": "신촌역 5번출구에서 우회전 후 보행자도로를 따라 49m 이동",
            "linestring": "126.93766,37.555157 126.93754,37.55511 126.93733,37.555054 126.937195,37.55501 126.93716,37.55499"
          }
        ]
      },
      {
        "mode": "SUBWAY",
        "sectionTime": 1078,
        "distance": 8598,
        "type": 2,
        "route": "수도권2호선",
        "routeId": "110021006",
        "routeColor": "009D3E",
        "service": 1,
        "start": {
          "name": "신촌",
          "lat": 37.555169444444445,
          "lon": 126.93700277777778
        },
        "end": {
          "name": "상왕십리",
          "lat": 37.56426944444444,
          "lon": 127.02965555555555
        },
        "passStopList": {
          "stations": [
            {
              "index": 0,
              "stationID": "110240",
              "stationName": "신촌",
              "lat": "37.555169",
              "lon": "126.937003"
            },
            {
              "index": 1,
              "stationID": "110241",
              "stationName": "이대",
              "lat": "37.556800",
              "lon": "126.946328"
            },
            {
              "index": 2,
              "stationID": "110242",
              "stationName": "아현",
              "lat": "37.557397",
              "lon": "126.956203"
            },
            {
              "index": 3,
              "stationID": "110243",
              "stationName": "충정로",
              "lat": "37.559683",
              "lon": "126.964306"
            },
            {
              "index": 4,
              "stationID": "110201",
              "stationName": "시청",
              "lat": "37.563625",
              "lon": "126.975494"
            },
            {
              "index": 5,
              "stationID": "110202",
              "stationName": "을지로입구",
              "lat": "37.566042",
              "lon": "126.982275"
            },
            {
              "index": 6,
              "stationID": "110203",
              "stationName": "을지로3가",
              "lat": "37.566286",
              "lon": "126.990928"
            },
            {
              "index": 7,
              "stationID": "110204",
              "stationName": "을지로4가",
              "lat": "37.566642",
              "lon": "126.998094"
            },
            {
              "index": 8,
              "stationID": "110205",
              "stationName": "동대문역사문화공원",
              "lat": "37.565697",
              "lon": "127.008886"
            },
            {
              "index": 9,
              "stationID": "110206",
              "stationName": "신당",
              "lat": "37.565678",
              "lon": "127.019483"
            },
            {
              "index": 10,
              "stationID": "110207",
              "stationName": "상왕십리",
              "lat": "37.564269",
              "lon": "127.029656"
            }
          ]
        },
        "passShape": {
          "linestring": "126.937003,37.555169 126.937425,37.555256 126.939125,37.555814 ... 127.029983,37.564161"
        }
      },
      {
        "mode": "WALK",
        "sectionTime": 37,
        "distance": 54,
        "start": {
          "name": "상왕십리",
          "lat": 37.56426944444444,
          "lon": 127.02965555555555
        },
        "end": {
          "name": "도착지",
          "lat": 37.564436,
          "lon": 127.029281
        },
        "steps": [
          {
            "streetName": "보행자도로",
            "distance": 15,
            "description": "보행자도로를 따라 15m 이동",
            "linestring": "127.029655,37.564266 127.029724,37.564396"
          },
          {
            "streetName": "왕십리로",
            "distance": 39,
            "description": "금안의원에서 좌회전 후 왕십리로를 따라 39m 이동",
            "linestring": "127.029724,37.564396 127.029366,37.56451 127.02933,37.564526"
          }
        ]
      }
    ]
  },
  "meta": {
    "timestamp": "2026-01-14T11:34:57.450365+00:00"
  }
}
```

## 필드 설명

### 최상위 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| route_leg_id | int | 개별 경로 ID |
| route_itinerary_id | int | 경로 묶음 ID |
| pathType | int | 경로 타입 (1:지하철, 2:버스, 3:버스+지하철) |
| totalTime | int | 총 소요시간 (초) |
| totalDistance | int | 총 이동거리 (m) |
| legs | array | 구간별 상세 정보 |

### legs 배열 필드

| 필드 | 타입 | 설명 |
|------|------|------|
| mode | string | 이동수단 (`WALK`, `SUBWAY`, `BUS`) |
| sectionTime | int | 구간 소요시간 (초) |
| distance | int | 구간 이동거리 (m) |
| start | object | 구간 출발 정보 (name, lat, lon) |
| end | object | 구간 도착 정보 (name, lat, lon) |
| route | string | 노선명 (SUBWAY, BUS일 때) |
| routeId | string | 노선 ID |
| routeColor | string | 노선 색상 (HEX) |
| service | int | 운행 여부 (1:운행중, 0:운행종료) |
| passStopList | object | 정류장/역 목록 |
| passShape | object | 경로 좌표 (linestring) |
| steps | array | 도보 상세 정보 (WALK일 때) |

### passStopList.stations 배열 (봇 이동 시뮬레이션용)

| 필드 | 타입 | 설명 |
|------|------|------|
| index | int | 정류장 순서 (0부터 시작) |
| stationID | string | 정류장/역 ID |
| stationName | string | 정류장/역 이름 |
| lat | string | 위도 |
| lon | string | 경도 |

## 봇 이동 시뮬레이션 활용

1. **현재 위치 추적**: `passStopList.stations[current_index]`로 현재 정류장 파악
2. **다음 정류장**: `stations[current_index + 1]`로 다음 목적지 계산
3. **경로 시각화**: `passShape.linestring`으로 지도에 경로 표시
4. **진행률 계산**: `current_index / total_stations * 100`
