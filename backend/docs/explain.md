# 경로 검색 DB 구조 변경 설명

> 작성일: 2026-01-14
> 작성자: Backend 팀

## 목차
1. [배경](#1-배경)
2. [TMAP API 응답 분석](#2-tmap-api-응답-분석)
3. [DB 구조 설계](#3-db-구조-설계)
4. [PostGIS → JSONField 변경 (GDAL 이슈)](#4-postgis--jsonfield-변경-gdal-이슈)
5. [최종 DB 구조](#5-최종-db-구조)
6. [프론트엔드 연동 가이드](#6-프론트엔드-연동-가이드)

---

## 1. 배경

경로 검색 API를 구현하면서 TMAP 대중교통 API의 응답 구조를 분석한 결과, 기존 ERD와 다른 구조가 필요하다는 것을 확인했습니다.

### 주요 요구사항
- Mapbox에서 경로를 지도에 표시해야 함
- **구간별로 다른 색상** 적용 필요 (특히 지하철 호선별 색상)
- GeoJSON 형태로 좌표 데이터 제공 필요

---

## 2. TMAP API 응답 분석

### API 호출
```
POST https://apis.openapi.sk.com/transit/routes
```

### 응답 구조
```
metaData
└── plan
    └── itineraries[]  ← 경로 옵션들 (약 10개)
        ├── pathType: 1 (지하철), 2 (버스), 3 (버스+지하철)
        ├── totalTime: 총 소요시간 (초)
        ├── totalDistance: 총 이동거리 (m)
        ├── totalWalkTime: 도보 소요시간
        ├── transferCount: 환승 횟수
        ├── fare: 요금 정보
        └── legs[]  ← 구간들 (WALK → SUBWAY → WALK 등)
            ├── mode: "WALK" | "SUBWAY" | "BUS" | ...
            ├── sectionTime: 구간 소요시간
            ├── distance: 구간 거리
            ├── route: 노선명 (예: "2호선", "간선:472")
            ├── routeColor: 노선 색상 (예: "00A84D", "53B332")
            ├── start: { name, lat, lon }
            ├── end: { name, lat, lon }
            ├── passShape: { linestring: "lon,lat lon,lat ..." }  ← 대중교통
            └── steps[]: { linestring: "..." }  ← 도보
```

### 핵심 발견사항

1. **itineraries vs legs 용어 혼란**
   - TMAP에서 `itineraries`는 "경로 옵션" (예: 최단시간, 최소환승 등)
   - TMAP에서 `legs`는 "세부 구간" (WALK → SUBWAY → WALK)

2. **좌표 데이터 위치**
   - 도보: `legs[].steps[].linestring`
   - 대중교통: `legs[].passShape.linestring`
   - 형식: `"127.027,37.497 127.028,37.498 ..."`

3. **노선 색상 제공**
   - `routeColor` 필드에 HEX 색상 코드 제공
   - 예: 2호선 `00A84D` (초록), 신분당선 `D4003B` (빨강)

---

## 3. DB 구조 설계

### 의사결정 과정

**문제**: 기존 ERD의 `route_leg` 테이블만으로는 구간별 색상 분리가 불가능

**해결**: 새로운 `RouteSegment` 테이블 추가

```
[기존 구조]
RouteItinerary (1) ──< RouteLeg (N)

[변경된 구조]
RouteItinerary (1) ──< RouteLeg (N) ──< RouteSegment (N)
     │                    │                   │
     │                    │                   ├── mode (WALK/SUBWAY/BUS)
     │                    │                   ├── routeColor (노선 색상)
     │                    │                   └── path_coordinates (좌표)
     │                    │
     │                    ├── pathType (1:지하철, 2:버스, 3:버스+지하철)
     │                    ├── totalTime, totalDistance
     │                    └── raw_data (TMAP 원본)
     │
     └── start_x, start_y, end_x, end_y
```

### 테이블 역할

| 테이블 | 역할 | 예시 |
|--------|------|------|
| `RouteItinerary` | 검색 파라미터 저장 | 강남역 → 신논현역 검색 |
| `RouteLeg` | 경로 옵션 (약 10개) | 최단시간 경로, 최소환승 경로 등 |
| `RouteSegment` | 세부 구간 | 도보 5분 → 2호선 10분 → 도보 3분 |

---

## 4. PostGIS → JSONField 변경 (GDAL 이슈)

### 초기 설계: PostGIS GeometryField 사용

처음에는 공간 데이터 처리를 위해 PostGIS를 사용하려고 했습니다:

```python
# 초기 설계 (PostGIS 사용)
from django.contrib.gis.db import models as gis_models

class RouteSegment(models.Model):
    path_geometry = gis_models.LineStringField(srid=4326)  # PostGIS
    path_coordinates = models.JSONField()  # 백업용
```

### 발생한 문제: GDAL 라이브러리 오류

```
django.core.exceptions.ImproperlyConfigured:
Could not find the GDAL library (tried "gdal304", "gdal303", ...)
```

**원인**:
- PostGIS의 GeometryField는 GDAL 라이브러리 필요
- Windows 환경에서 GDAL 설치가 복잡함
- OSGeo4W 설치 + 환경변수 설정 + DLL 경로 설정 필요

### 의사결정: 두 가지 선택지

| 옵션 | 장점 | 단점 |
|------|------|------|
| **1. GDAL 설치** | PostGIS 공간 연산 사용 가능 | Windows 설치 복잡, 팀원 전체 설정 필요 |
| **2. JSONField만 사용** | 설치 간단, 즉시 사용 가능 | DB 레벨 공간 연산 불가 |

### 최종 결정: Option 2 (JSONField만 사용)

**이유**:
1. 우리 서비스에서 **DB 레벨 공간 연산이 필요 없음**
   - 거리 계산, 경로 이탈 감지는 프론트엔드(Turf.js)에서 처리
   - DB는 좌표 저장/조회만 담당

2. **팀 개발 환경 통일** 용이
   - GDAL 설치 없이 바로 개발 가능
   - Docker 환경에서도 추가 설정 불필요

3. **프론트엔드 연동 간편**
   - JSONField에서 바로 GeoJSON 생성 가능
   - 별도 변환 로직 불필요

---

## 5. 최종 DB 구조

### RouteSegment 모델

```python
class RouteSegment(models.Model):
    """경로 내 세부 구간"""

    class ModeChoices(models.TextChoices):
        WALK = "WALK", "도보"
        SUBWAY = "SUBWAY", "지하철"
        BUS = "BUS", "버스"
        EXPRESSBUS = "EXPRESSBUS", "고속버스"
        TRAIN = "TRAIN", "기차"
        AIRPLANE = "AIRPLANE", "항공"
        FERRY = "FERRY", "해운"

    route_leg = models.ForeignKey(RouteLeg, on_delete=models.CASCADE, related_name="segments")
    segment_index = models.PositiveIntegerField()  # 구간 순서

    # 이동수단 정보
    mode = models.CharField(max_length=20, choices=ModeChoices.choices)
    section_time = models.PositiveIntegerField()  # 소요시간 (초)
    distance = models.PositiveIntegerField()  # 거리 (m)

    # 출발/도착 정보
    start_name = models.CharField(max_length=255)
    start_lat = models.FloatField()
    start_lon = models.FloatField()
    end_name = models.CharField(max_length=255)
    end_lat = models.FloatField()
    end_lon = models.FloatField()

    # 노선 정보 (대중교통)
    route_name = models.CharField(max_length=100, blank=True)  # "2호선", "간선:472"
    route_color = models.CharField(max_length=10, blank=True)  # "00A84D" (HEX)

    # 경로 좌표 (JSONField)
    path_coordinates = models.JSONField(null=True, blank=True)
    # 형식: [[lon, lat], [lon, lat], ...]
```

### 마이그레이션 파일

```
apps/itineraries/migrations/
├── 0001_initial.py          # RouteItinerary, RouteLeg, SearchItineraryHistory
└── 0002_routesegment.py     # RouteSegment 추가 (NEW)
```

---

## 6. 프론트엔드 연동 가이드

### API 응답 예시

```json
{
  "segments": [
    {
      "segment_id": 1,
      "segment_index": 0,
      "mode": "WALK",
      "sectionTime": 300,
      "distance": 250,
      "start": { "name": "강남역", "lat": 37.497, "lon": 127.027 },
      "end": { "name": "강남역 2번출구", "lat": 37.496, "lon": 127.028 },
      "routeName": "",
      "routeColor": "",
      "pathCoordinates": [[127.027, 37.497], [127.028, 37.496]],
      "geojson": {
        "type": "LineString",
        "coordinates": [[127.027, 37.497], [127.028, 37.496]]
      }
    },
    {
      "segment_id": 2,
      "segment_index": 1,
      "mode": "SUBWAY",
      "sectionTime": 600,
      "routeName": "2호선",
      "routeColor": "00A84D",
      "geojson": { "type": "LineString", "coordinates": [...] }
    }
  ]
}
```

### Mapbox 연동 코드

```javascript
// 세그먼트별 다른 색상으로 경로 표시
segments.forEach((segment, index) => {
  // 소스 추가
  map.addSource(`segment-${segment.segment_id}`, {
    type: 'geojson',
    data: segment.geojson
  });

  // 레이어 추가 (세그먼트별 색상)
  map.addLayer({
    id: `segment-line-${segment.segment_id}`,
    type: 'line',
    source: `segment-${segment.segment_id}`,
    paint: {
      'line-color': segment.routeColor
        ? `#${segment.routeColor}`  // 대중교통: 노선 색상
        : '#3b82f6',                 // 도보: 기본 파란색
      'line-width': segment.mode === 'WALK' ? 3 : 5,
      'line-dasharray': segment.mode === 'WALK' ? [2, 2] : [1, 0]
    }
  });
});
```

### 주요 노선 색상 참고

| 노선 | routeColor | 색상 |
|------|------------|------|
| 1호선 | `0052A4` | 🔵 파랑 |
| 2호선 | `00A84D` | 🟢 초록 |
| 3호선 | `EF7C1C` | 🟠 주황 |
| 4호선 | `00A5DE` | 🔵 하늘 |
| 신분당선 | `D4003B` | 🔴 빨강 |
| 간선버스 | `53B332` | 🟢 초록 |
| 지선버스 | `5BB025` | 🟢 연두 |

---

## 요약

1. **TMAP API 응답 분석** → `RouteSegment` 테이블 필요성 확인
2. **PostGIS GeometryField** 시도 → **GDAL 라이브러리 오류** 발생
3. **JSONField로 변경** → 설치 간편, 프론트엔드 연동 용이
4. **최종 구조**: `RouteItinerary` → `RouteLeg` → `RouteSegment`

질문이 있으시면 언제든 말씀해주세요!
