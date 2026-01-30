# 경로 탐색 API 응답 (POST /api/v1/itineraries/search)

## Request

```json
{
  "startX": "126.936928",
  "startY": "37.555162",
  "endX": "127.029281",
  "endY": "37.564436",
  "departure_name": "신촌",
  "arrival_name": "왕십리"
}
```

## Response (201 Created)

```json
{
  "status": "success",
  "data": {
    "search_itinerary_history_id": 3,
    "route_itinerary_id": 3,
    "requestParameters": {
      "startX": "126.936928",
      "startY": "37.555162",
      "endX": "127.029281",
      "endY": "37.564436",
      "reqDttm": "20260114202228"
    },
    "legs": [
      {
        "route_leg_id": 14,
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
        }
      },
      {
        "route_leg_id": 15,
        "pathType": 2,
        "totalTime": 2267,
        "totalDistance": 10116,
        "totalWalkTime": 232,
        "totalWalkDistance": 249,
        "transferCount": 0,
        "fare": {
          "regular": {
            "totalFare": 1500,
            "currency": {
              "symbol": "￦",
              "currency": "원",
              "currencyCode": "KRW"
            }
          }
        }
      },
      {
        "route_leg_id": 16,
        "pathType": 2,
        "totalTime": 1996,
        "totalDistance": 9626,
        "totalWalkTime": 232,
        "totalWalkDistance": 249,
        "transferCount": 1,
        "fare": {
          "regular": {
            "totalFare": 1500,
            "currency": {
              "symbol": "￦",
              "currency": "원",
              "currencyCode": "KRW"
            }
          }
        }
      }
    ],
    "created_at": "2026-01-14T20:22:28.528762+09:00"
  },
  "meta": {
    "timestamp": "2026-01-14T11:22:28.530000+00:00"
  }
}
```

## 필드 설명

| 필드 | 타입 | 설명 |
|------|------|------|
| search_itinerary_history_id | int | 검색 기록 ID |
| route_itinerary_id | int | 경로 묶음 ID |
| legs | array | 경로 옵션 목록 (최대 10개) |
| legs[].route_leg_id | int | 개별 경로 ID (상세 조회용) |
| legs[].pathType | int | 경로 타입 (1:지하철, 2:버스, 3:버스+지하철) |
| legs[].totalTime | int | 총 소요시간 (초) |
| legs[].totalDistance | int | 총 이동거리 (m) |
| legs[].totalWalkTime | int | 도보 소요시간 (초) |
| legs[].totalWalkDistance | int | 도보 이동거리 (m) |
| legs[].transferCount | int | 환승 횟수 |
| legs[].fare.regular.totalFare | int | 요금 (원) |
