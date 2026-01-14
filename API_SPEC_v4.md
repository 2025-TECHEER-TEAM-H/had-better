# API 명세서: HAD BETTER (v4)

## 기본 정보

| 항목 | 값 |
|------|-----|
| Base URL | `https://api.hadbetter.com` (Production) |
| Base URL | `http://localhost:8000` (Development) |
| API Version | v1 |
| 인증 방식 | JWT (Bearer Token) |
| Content-Type | `application/json` |

---

## API 설계 원칙

### RESTful 원칙 준수

| 원칙 | 적용 방식 |
|------|----------|
| 리소스 기반 URI | 명사 복수형 사용 (`/routes`, `/itineraries`, `/places`) |
| HTTP 메서드로 행위 표현 | GET(조회), POST(생성/토글), PATCH(부분수정), PUT(전체수정), DELETE(삭제) |
| Trailing Slash 제거 | URI 끝에 `/` 사용하지 않음 |
| 상태 코드 | 의미에 맞는 HTTP 상태 코드 사용 |
| Stateless | 서버는 클라이언트 상태를 저장하지 않음 |

### ⚠️ 행위(Action)는 HTTP Method로 표현

URI에는 동사를 사용하지 않습니다. 행위는 HTTP Method로 표현합니다.

```
❌ GET  /api/v1/users/getUser
❌ POST /api/v1/routes/123/startRoute
✅ GET  /api/v1/users
✅ PATCH /api/v1/routes/123  (status 변경으로 시작/종료/취소 처리)
```

### ERD ↔ API 명칭 매핑

| ERD 테이블 | API 리소스 | 설명 |
|-----------|-----------|------|
| `route` | `/routes` | 경주(게임) 인스턴스 |
| `route_itinerary` | `/itineraries` | 경로 탐색 결과 묶음 (마킹용) |
| `route_leg` | `/itineraries/{id}/legs` | 개별 경로 (경주에 배정되는 단위) |
| `search_itinerary_history` | `/users/itinerary-history` | 경로 검색 기록 |
| `search_place_history` | `/users/place-history` | 장소 검색 기록 |
| `saved_place` | `/saved-places` | 즐겨찾기 장소 |
| `poi_place` | `/places` | POI 장소 |
| `bot` | (routes 하위) | 봇 |

### Path Parameter 명명 규칙

모든 Path Parameter는 어떤 리소스의 ID인지 명확하게 표기합니다:

| 표기 | 설명 |
|------|------|
| `{route_id}` | 경주(Route) 인스턴스 ID |
| `{route_itinerary_id}` | 경로 옵션(Itinerary) ID |
| `{route_leg_id}` | 경로 구간(Leg) ID |
| `{saved_place_id}` | 즐겨찾기 장소 ID |
| `{poi_place_id}` | POI 장소 ID |
| `{search_place_history_id}` | 장소 검색 기록 ID |
| `{search_itinerary_history_id}` | 경로 검색 기록 ID |

### 사용자 식별 방식

URL에 `user_id`를 포함하지 않습니다. 모든 사용자별 리소스는 **JWT 토큰에서 사용자를 식별**합니다.

```
❌ GET /api/v1/users/{user_id}/places/saved
✅ GET /api/v1/saved-places
```

**서버 처리 방식 (Django 예시):**

```python
class SavedPlaceView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # request.user는 JWT 토큰에서 자동으로 추출됨
        user = request.user
        saved_places = SavedPlace.objects.filter(user=user)
        return Response(SavedPlaceSerializer(saved_places, many=True).data)
```

### 상태값 및 시간 형식 규칙

| 항목 | 규칙 | 예시 |
|------|------|------|
| 상태값 | ENUM 고정 | `PENDING`, `RUNNING`, `FINISHED`, `CANCELED` |
| 시간 필드 | ISO 8601 | `2026-01-12T19:00:00+09:00` |

---

## 인증 (Authentication)

### 인증 헤더

```
Authorization: Bearer {access_token}
```

### 토큰 정보

| 토큰 종류 | 만료 시간 | 용도 |
|----------|----------|------|
| Access Token | 30분 | API 요청 인증 |
| Refresh Token | 7일 | Access Token 갱신 |

### 로그아웃 (Refresh Token 폐기)

Refresh Token Blacklist 방식을 사용합니다:

```python
# Django simplejwt 예시
from rest_framework_simplejwt.tokens import RefreshToken

def logout(request):
    refresh_token = request.data.get("refresh")
    token = RefreshToken(refresh_token)
    token.blacklist()  # 이 토큰은 더 이상 사용 불가
```

---

## 공통 응답 형식

### 성공 응답

```json
{
  "status": "success",
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-12T19:00:00+09:00"
  }
}
```

### 목록 응답 (페이지네이션)

```json
{
  "status": "success",
  "data": [ ... ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_count": 100,
      "total_pages": 5,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

### 에러 응답

```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자 친화적 에러 메시지",
    "details": { ... }
  }
}
```

### HTTP 상태 코드

| 코드 | 설명 | 사용 상황 |
|------|------|----------|
| 200 | OK | 조회, 수정 성공 |
| 201 | Created | 생성 성공 |
| 204 | No Content | 삭제 성공 |
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | 인증 필요/실패 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 리소스 충돌 |
| 422 | Unprocessable Entity | 유효성 검사 실패 |
| 429 | Too Many Requests | Rate Limit 초과 |
| 500 | Internal Server Error | 서버 오류 |

---

## 1. 인증 API (`/api/v1/auth`)

### 1.1 회원가입

```
POST /api/v1/auth/register
```

**Request Body**

```json
{
  "name": "racer_king",
  "email": "user@example.com",
  "password": "securePassword123!",
  "password_confirm": "securePassword123!",
  "nickname": "레이서킹"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| name | string | ✓ | 유저 ID (고유, 영문/숫자/언더스코어) |
| email | string | ✓ | 이메일 (로그인용) |
| password | string | ✓ | 비밀번호 |
| password_confirm | string | ✓ | 비밀번호 확인 |
| nickname | string | ✓ | 닉네임 (표시용) |

**Response `201 Created`**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "racer_king",
      "email": "user@example.com",
      "nickname": "레이서킹",
      "created_at": "2026-01-12T09:00:00+09:00"
    },
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIs...",
      "refresh": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

---

### 1.2 로그인

```
POST /api/v1/auth/login
```

**Request Body**

```json
{
  "name": "racer_king",
  "password": "securePassword123!"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| name | string | ✓ | 유저 ID |
| password | string | ✓ | 비밀번호 |

**Response `200 OK`**

```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "racer_king",
      "email": "user@example.com",
      "nickname": "레이서킹"
    },
    "tokens": {
      "access": "eyJhbGciOiJIUzI1NiIs...",
      "refresh": "eyJhbGciOiJIUzI1NiIs..."
    }
  }
}
```

---

### 1.3 토큰 갱신

```
POST /api/v1/auth/refresh
```

**Request Body**

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response `200 OK`**

```json
{
  "status": "success",
  "data": {
    "access": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 1.4 로그아웃

```
POST /api/v1/auth/logout
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Request Body**

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response `200 OK`**

```json
{
  "status": "success",
  "data": {
    "message": "로그아웃 되었습니다."
  }
}
```

**수행되는 작업:**
- Refresh Token을 Blacklist에 추가
- 해당 토큰으로 더 이상 Access Token 갱신 불가

---

## 2. 사용자 API (`/api/v1/users`)

### 2.1 내 정보 조회

```
GET /api/v1/users
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Response `200 OK`**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "racer_king",
    "email": "user@example.com",
    "nickname": "레이서킹",
    "created_at": "2026-01-12T09:00:00+09:00",
    "updated_at": "2026-01-12T15:30:00+09:00"
  }
}
```

---

### 2.2 내 정보 수정

```
PATCH /api/v1/users
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Request Body**

```json
{
  "nickname": "새로운닉네임"
}
```

**Response `200 OK`**

```json
{
  "status": "success",
  "data": {
    "id": 1,
    "name": "racer_king",
    "email": "user@example.com",
    "nickname": "새로운닉네임",
    "updated_at": "2026-01-12T16:00:00+09:00"
  }
}
```

---

### 2.3 내 통계 조회

```
GET /api/v1/users/stats
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Response `200 OK`**

```json
{
  "status": "success",
  "data": {
    "total_routes": 50,
    "wins": 32,
    "losses": 18,
    "win_rate": 64.0,
    "total_distance": 245600,
    "total_time": 86400,
    "average_time": 1728,
    "recent_routes": [
      {
        "route_itinerary_id": 1,
        "rank": 1,
        "total_participants": 3,
        "route_summary": "강남역 → 홍대입구",
        "end_time": "2026-01-12T15:30:00+09:00"
      }
    ]
  }
}
```

---

### 2.4 장소 검색 기록 조회

```
GET /api/v1/users/place-history
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|:----:|-------|------|
| limit | integer | | 10 | 최근 N개 |

**Response `200 OK`**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "keyword": "강남역",
      "created_at": "2026-01-12T10:00:00+09:00"
    },
    {
      "id": 2,
      "keyword": "홍대입구역",
      "created_at": "2026-01-12T09:30:00+09:00"
    }
  ]
}
```

---

### 2.5 장소 검색 기록 삭제 (전체)

```
DELETE /api/v1/users/place-history
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Response `204 No Content`**

---

### 2.6 장소 검색 기록 삭제 (개별)

```
DELETE /api/v1/users/place-history/{search_place_history_id}
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| search_place_history_id | integer | ✓ | 장소 검색 기록 ID |

**Response `204 No Content`**

---

### 2.7 경로 검색 기록 조회

```
GET /api/v1/users/itinerary-history
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|:----:|-------|------|
| limit | integer | | 10 | 최근 N개 |

**Response `200 OK`**

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "departure": { "name": "강남역" },
      "arrival": { "name": "홍대입구역" },
      "created_at": "2026-01-12T10:00:00+09:00"
    }
  ]
}
```

---

### 2.8 경로 검색 기록 삭제 (전체)

```
DELETE /api/v1/users/itinerary-history
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Response `204 No Content`**

---

### 2.9 경로 검색 기록 삭제 (개별)

```
DELETE /api/v1/users/itinerary-history/{search_itinerary_history_id}
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| search_itinerary_history_id | integer | ✓ | 경로 검색 기록 ID |

**Response `204 No Content`**

---

## 3. 장소 API (`/api/v1/places`)

### 3.1 장소 검색

> 💡 **Query String 사용**: 검색은 GET + Query String이 RESTful하며 캐싱/북마크 가능

```
GET /api/v1/places/search
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|:----:|-------|------|
| q | string | ✓ | - | 검색 키워드 |
| lat | number | | - | 현재 위치 위도 (정렬용) |
| lon | number | | - | 현재 위치 경도 (정렬용) |
| page | integer | | 1 | 페이지 번호 |
| limit | integer | | 20 | 결과 수 (최대 50) |

**Response `200 OK`**

```json
{
  "status": "success",
  "data": [
    {
      "poi_place_id": 1,
      "tmap_poi_id": "poi_12345",
      "name": "강남역",
      "address": "서울특별시 강남구 강남대로 396",
      "category": "지하철역",
      "coordinates": {
        "lon": 127.0276,
        "lat": 37.4979
      }
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_count": 45,
      "has_next": true
    }
  }
}
```

**내부 동작:**
- 외부 API (Tmap) 호출하여 검색
- 결과를 `poi_place` 테이블에 upsert
- 로그인 유저인 경우 `search_place_history`에 기록

---

### 3.2 장소 상세 조회

```
GET /api/v1/places/{poi_place_id}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| poi_place_id | integer | ✓ | POI 장소 ID |

**Response `200 OK`**

```json
{
  "status": "success",
  "data": {
    "poi_place_id": 1,
    "tmap_poi_id": "poi_12345",
    "name": "강남역",
    "address": "서울특별시 강남구 강남대로 396",
    "category": "지하철역",
    "coordinates": {
      "lon": 127.0276,
      "lat": 37.4979
    },
    "is_saved": true
  }
}
```

---

## 4. 즐겨찾기 API (`/api/v1/saved-places`)

> 💡 `category`를 통해 집(home), 회사(work), 학교(school)를 구분합니다.
> 전체 조회 시 home → work → school 순으로 상단 정렬됩니다.

### 4.1 즐겨찾기 목록 조회

```
GET /api/v1/saved-places
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|:----:|-------|------|
| category | string | | - | 카테고리 필터 (콤마 구분: `home,work,school`) |

**예시**
```
GET /api/v1/saved-places                        # 전체 (home/work/school 상단 정렬)
GET /api/v1/saved-places?category=home          # 집만
GET /api/v1/saved-places?category=home,work,school  # 집/회사/학교만
```

**Response `200 OK`**

```json
{
  "status": "success",
  "data": [
    {
      "saved_place_id": 1,
      "category": "home",
      "name": "집",
      "poi_place": {
        "poi_place_id": 10,
        "name": "상암동 주민센터",
        "address": "서울특별시 마포구 상암동 123",
        "coordinates": {
          "lat": 37.5665,
          "lon": 126.8895
        }
      },
      "created_at": "2026-01-10T09:00:00+09:00"
    },
    {
      "saved_place_id": 2,
      "category": "work",
      "name": "회사",
      "poi_place": {
        "poi_place_id": 11,
        "name": "강남역 위워크",
        "address": "서울특별시 강남구 테헤란로 123",
        "coordinates": {
          "lat": 37.4979,
          "lon": 127.0276
        }
      },
      "created_at": "2026-01-10T10:00:00+09:00"
    },
    {
      "saved_place_id": 3,
      "category": null,
      "name": "자주가는 카페",
      "poi_place": {
        "poi_place_id": 12,
        "name": "스타벅스 홍대점",
        "address": "서울특별시 마포구 홍대입구 456",
        "coordinates": {
          "lat": 37.5571,
          "lon": 126.9237
        }
      },
      "created_at": "2026-01-11T09:00:00+09:00"
    }
  ]
}
```

**정렬 순서:**
1. `home` (집)
2. `work` (회사)
3. `school` (학교)
4. 기타 (category가 null인 경우, 생성일 역순)

---

### 4.2 즐겨찾기 추가

> 💡 **Soft Delete 방식**: 삭제 시 `deleted_at` 기록, 재추가 시 `deleted_at = null`로 복원
> 
> **집/회사/학교 규칙:**
> - 각 카테고리당 1개만 존재 가능
> - 이미 선점된 카테고리는 추가 불가 (409 Conflict)
> - 전용 버튼으로만 추가 가능

```
POST /api/v1/saved-places
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Request Body - 집/회사/학교 추가**

```json
{
  "poi_place_id": 1,
  "category": "home",
  "name": "우리집"
}
```

**Request Body - 일반 즐겨찾기 추가 ("+" 버튼)**

```json
{
  "poi_place_id": 1,
  "name": "자주가는 카페"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| poi_place_id | integer | ✓ | POI 장소 ID |
| category | string | | 카테고리 (`home`, `work`, `school`) - 없으면 일반 즐겨찾기 |
| name | string | | 사용자 지정 이름 |

**Response `201 Created` (신규 추가)**

```json
{
  "status": "success",
  "data": {
    "saved_place_id": 3,
    "poi_place_id": 1,
    "category": "home",
    "name": "우리집",
    "created_at": "2026-01-12T10:00:00+09:00"
  }
}
```

**Response `200 OK` (복원 - 기존에 삭제했던 즐겨찾기 재추가)**

```json
{
  "status": "success",
  "data": {
    "saved_place_id": 3,
    "poi_place_id": 1,
    "category": null,
    "name": "자주가는 카페",
    "deleted_at": null
  },
  "meta": {
    "action": "restored"
  }
}
```

**Response `409 Conflict` (집/회사/학교 중복)**

```json
{
  "status": "error",
  "error": {
    "code": "CATEGORY_ALREADY_EXISTS",
    "message": "이미 '집'이 등록되어 있습니다.",
    "details": {
      "category": "home",
      "existing_saved_place_id": 1
    }
  }
}
```

---

### 4.3 즐겨찾기 삭제

> 💡 **Soft Delete**: 실제 삭제가 아닌 `deleted_at` 타임스탬프 기록

```
DELETE /api/v1/saved-places/{saved_place_id}
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| saved_place_id | integer | ✓ | 즐겨찾기 장소 ID |

**Response `200 OK`**

```json
{
  "status": "success",
  "data": {
    "saved_place_id": 1,
    "deleted_at": "2026-01-12T10:00:00+09:00"
  }
}
```

---

### 4.4 즐겨찾기 수정

```
PATCH /api/v1/saved-places/{saved_place_id}
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| saved_place_id | integer | ✓ | 즐겨찾기 장소 ID |

**Request Body**

```json
{
  "category": "work",
  "name": "새 회사"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| category | string | | 카테고리 (`home`, `work`, `school`, 또는 null) |
| name | string | | 사용자 지정 이름 |

**Response `200 OK`**

```json
{
  "status": "success",
  "data": {
    "saved_place_id": 1,
    "category": "work",
    "name": "새 회사",
    "updated_at": "2026-01-12T10:00:00+09:00"
  }
}
```

---

## 5. 경로 검색 API (`/api/v1/itineraries`)

### 5.1 경로 검색

> 💡 경로 탐색 시 약 10개의 경로(leg)가 반환되며, 이를 하나의 itinerary로 묶어서 관리

```
POST /api/v1/itineraries/search
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Request Body**

```json
{
  "startX": "127.02479803562213",
  "startY": "37.504585233865086",
  "endX": "127.03747630119366",
  "endY": "37.479103923078995",
  "count": 10,
  "lang": 0,
  "format": "json",
  "departure_name": "강남역",
  "arrival_name": "홍대입구역"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| startX | string | ✓ | 출발지 경도 (lon) |
| startY | string | ✓ | 출발지 위도 (lat) |
| endX | string | ✓ | 도착지 경도 (lon) |
| endY | string | ✓ | 도착지 위도 (lat) |
| count | integer | | 경로 개수 (기본값: 10, 최대: 20) |
| lang | integer | | 언어 (0: 한국어, 1: 영어) |
| format | string | | 응답 형식 (기본값: "json") |
| departure_name | string | | 출발지명 (검색 기록 저장용) |
| arrival_name | string | | 도착지명 (검색 기록 저장용) |

**Response `201 Created`**

```json
{
  "status": "success",
  "data": {
    "search_itinerary_history_id": 1,
    "route_itinerary_id": 1,
    "requestParameters": {
      "startX": "126.936928",
      "startY": "37.555162",
      "endX": "127.029281",
      "endY": "37.564436",
      "reqDttm": "20260112100000"
    },
    "legs": [
      {
        "route_leg_id": 1,
        "pathType": 3,
        "totalTime": 1229,
        "totalDistance": 9089,
        "totalWalkTime": 738,
        "totalWalkDistance": 836,
        "transferCount": 1,
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
        "route_leg_id": 2,
        "pathType": 1,
        "totalTime": 1456,
        "totalDistance": 10200,
        "totalWalkTime": 520,
        "totalWalkDistance": 620,
        "transferCount": 0,
        "fare": {
          "regular": {
            "totalFare": 1400,
            "currency": {
              "symbol": "￦",
              "currency": "원",
              "currencyCode": "KRW"
            }
          }
        }
      }
    ],
    "created_at": "2026-01-12T10:00:00+09:00"
  }
}
```

**Response 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| pathType | int | 경로 종류 (1:지하철, 2:버스, 3:버스+지하철, 4:고속/시외버스, 5:기차, 6:항공, 7:해운) |
| totalTime | int | 총 소요시간 (초) |
| totalDistance | int | 총 이동거리 (m) |
| totalWalkTime | int | 총 도보 소요시간 (초) |
| totalWalkDistance | int | 총 도보 이동거리 (m) |
| transferCount | int | 환승 횟수 |
| fare.regular.totalFare | int | 대중교통 요금 |

---

### 5.2 경로 검색 결과 조회

```
GET /api/v1/itineraries/search/{search_itinerary_history_id}
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| search_itinerary_history_id | integer | ✓ | 경로 검색 기록 ID |

**Response `200 OK`**

```json
{
  "status": "success",
  "data": {
    "search_itinerary_history_id": 1,
    "route_itinerary_id": 1,
    "departure": { "name": "강남역" },
    "arrival": { "name": "홍대입구역" },
    "legs": [
      {
        "route_leg_id": 1,
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
        "route_leg_id": 2,
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
      }
    ],
    "created_at": "2026-01-12T10:00:00+09:00"
  }
}
```

**Response 필드 설명 (legs 배열)**

| 필드 | 타입 | 설명 |
|------|------|------|
| route_leg_id | int | 개별 경로 ID (5.3 상세 조회용) |
| pathType | int | 경로 종류 (1:지하철, 2:버스, 3:버스+지하철, 4:고속/시외버스, 5:기차, 6:항공, 7:해운) |
| totalTime | int | 총 소요시간 (초) |
| totalDistance | int | 총 이동거리 (m) |
| totalWalkTime | int | 총 도보 소요시간 (초) |
| totalWalkDistance | int | 총 도보 이동거리 (m) |
| transferCount | int | 환승 횟수 |
| fare | object | 요금 정보 |

---

### 5.3 개별 경로(Leg) 상세 조회

```
GET /api/v1/itineraries/legs/{route_leg_id}
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| route_leg_id | integer | ✓ | 개별 경로 ID |

**Response `200 OK`**

```json
{
  "status": "success",
  "data": {
    "route_leg_id": 1,
    "route_itinerary_id": 1,
    "pathType": 3,
    "totalTime": 1229,
    "totalDistance": 9089,
    "totalWalkTime": 738,
    "totalWalkDistance": 836,
    "transferCount": 1,
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
          "lat": 37.555169,
          "lon": 126.937003
        },
        "steps": [
          {
            "streetName": "",
            "distance": 48,
            "description": "48m 이동",
            "linestring": "126.93693,37.555172 126.93708,37.555176"
          }
        ]
      },
      {
        "mode": "SUBWAY",
        "sectionTime": 1078,
        "distance": 8598,
        "route": "수도권2호선",
        "routeId": "110021006",
        "routeColor": "009D3E",
        "type": 2,
        "service": 0,
        "start": {
          "name": "신촌",
          "lat": 37.555169,
          "lon": 126.937003
        },
        "end": {
          "name": "신당",
          "lat": 37.565678,
          "lon": 127.019483
        },
        "passStopList": {
          "stations": [
            {
              "index": 0,
              "stationName": "신촌",
              "stationID": "110240",
              "lat": "37.555169",
              "lon": "126.937003"
            },
            {
              "index": 1,
              "stationName": "이대",
              "stationID": "110241",
              "lat": "37.556800",
              "lon": "126.946328"
            }
          ]
        },
        "passShape": {
          "linestring": "126.937003,37.555169 126.937425,37.555256 ..."
        }
      },
      {
        "mode": "WALK",
        "sectionTime": 430,
        "distance": 477,
        "start": {
          "name": "신당",
          "lat": 37.565678,
          "lon": 127.019483
        },
        "end": {
          "name": "왕십리교회",
          "lat": 37.566658,
          "lon": 127.023683
        }
      },
      {
        "mode": "BUS",
        "sectionTime": 238,
        "distance": 776,
        "route": "지선:6211",
        "routeId": "1021193001",
        "routeColor": "53B332",
        "type": 12,
        "service": 0,
        "start": {
          "name": "왕십리교회",
          "lat": 37.566658,
          "lon": 127.023683
        },
        "end": {
          "name": "상왕십리역.센트라스아파트",
          "lat": 37.565961,
          "lon": 127.029989
        },
        "Lane": [
          {
            "route": "간선:302",
            "routeId": "1021050001",
            "routeColor": "0068B7",
            "type": 11,
            "service": 0
          }
        ],
        "passStopList": {
          "stations": [
            {
              "index": 0,
              "stationName": "왕십리교회",
              "stationID": "774977",
              "lat": "37.566658",
              "lon": "127.023683"
            }
          ]
        },
        "passShape": {
          "linestring": "127.023642,37.566658 127.023608,37.567644 ..."
        }
      },
      {
        "mode": "WALK",
        "sectionTime": 194,
        "distance": 231,
        "start": {
          "name": "상왕십리역.센트라스아파트",
          "lat": 37.565961,
          "lon": 127.029989
        },
        "end": {
          "name": "도착지",
          "lat": 37.564436,
          "lon": 127.029281
        },
        "steps": [
          {
            "streetName": "무학로",
            "distance": 48,
            "description": "무학로를 따라 48m 이동",
            "linestring": "127.02995,37.56596 127.02996,37.56553"
          }
        ]
      }
    ]
  }
}
```

**legs 배열 내 필드 설명**

| 필드 | 타입 | 설명 |
|------|------|------|
| mode | string | 이동수단 (`WALK`, `BUS`, `SUBWAY`, `EXPRESSBUS`, `TRAIN`, `AIRPLANE`, `FERRY`) |
| sectionTime | int | 구간별 소요시간 (초) |
| distance | int | 구간별 이동거리 (m) |
| route | string | 노선 명칭 |
| routeId | string | 노선 ID |
| routeColor | string | 노선 색상 (HEX) |
| type | int | 이동수단별 노선코드 |
| service | int | 운행 여부 (1:운행중, 0:운행종료) |
| start | object | 구간 출발 정보 (name, lat, lon) |
| end | object | 구간 도착 정보 (name, lat, lon) |
| steps | array | 도보 상세 정보 (WALK일 때) |
| passStopList | object | 정류장 목록 (BUS, SUBWAY일 때) |
| passShape | object | 구간 좌표 (linestring) |
| Lane | array | 다중 노선 정보 (여러 노선이 가능한 경우) |

---

## 6. 경주 API (`/api/v1/routes`)

> 💡 경주(Route)는 유저 vs 봇의 게임 인스턴스입니다.
> 경주 생성 시 `route` 테이블에 참가자별로 각각 row가 생성됩니다 (유저 1 + 봇 2 = 3개 row).
> 같은 경주의 참가자들은 동일한 `route_itinerary_id`를 가진 `route_leg`로 묶입니다.
> 상태 전이는 PATCH로 통일합니다.

### 6.1 경주 생성

```
POST /api/v1/routes
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Request Body**

```json
{
  "route_itinerary_id": 1,
  "user_leg_id": 1,
  "bot_leg_ids": [2, 3]
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| route_itinerary_id | integer | ✓ | 경로 탐색 결과 묶음 ID |
| user_leg_id | integer | ✓ | 유저가 선택한 경로 (route_leg) ID |
| bot_leg_ids | array | ✓ | 봇에게 배정할 경로 ID 목록 (최대 2개) |

**Response `201 Created`**

```json
{
  "status": "success",
  "data": {
    "route_itinerary_id": 1,
    "participants": [
      {
        "route_itinerary_id": 1,
        "type": "USER",
        "user_id": 1,
        "nickname": "레이서킹",
        "leg": {
          "route_leg_id": 1,
          "summary": "2호선 → 도보",
          "total_time": 2520
        }
      },
      {
        "route_id": 101,
        "type": "BOT",
        "bot_id": 1,
        "name": "Bot 1",
        "leg": {
          "route_leg_id": 2,
          "summary": "버스 → 지하철",
          "total_time": 2880
        }
      },
      {
        "route_id": 102,
        "type": "BOT",
        "bot_id": 2,
        "name": "Bot 2",
        "leg": {
          "route_leg_id": 3,
          "summary": "버스 직행",
          "total_time": 3120
        }
      }
    ],
    "status": "PENDING",
    "created_at": "2026-01-12T10:00:00+09:00"
  }
}
```

---

### 6.2 경주 목록 조회

> 💡 JWT 토큰에서 `user_id`를 추출하여 해당 유저가 참가한 경주 목록을 조회합니다.

```
GET /api/v1/routes
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|---------|------|:----:|-------|------|
| status | string | | - | 상태 필터 (`PENDING`, `RUNNING`, `FINISHED`, `CANCELED`) |
| limit | integer | | 20 | 결과 수 |
| page | integer | | 1 | 페이지 번호 |

**Response `200 OK`**

```json
{
  "status": "success",
  "data": [
    {
      "route_id": 100,
      "route_itinerary_id": 1,
      "status": "FINISHED",
      "route_summary": "강남역 → 홍대입구역",
      "is_win": true,
      "end_time": "2026-01-12T10:47:00+09:00"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_count": 50,
      "has_next": true
    }
  }
}
```

---

### 6.3 경주 상태 변경 (시작/종료/취소)

> ⚠️ **통합**: 기존 actions/start, actions/finish, actions/cancel → PATCH로 통일
> 
> 💡 **순위 결정**: `duration` (소요시간) 짧은 순서대로 순위 결정

```
PATCH /api/v1/routes/{route_id}
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| route_id | integer | ✓ | 경주 참가자 ID (route 테이블의 PK) |

#### 시작 요청

> `start_time`에 현재 시간 기록

```json
{
  "status": "RUNNING"
}
```

**Response `200 OK`**

```json
{
  "status": "success",
  "data": {
    "route_id": 100,
    "status": "RUNNING",
    "start_time": "2026-01-12T10:05:00+09:00",
    "sse_endpoint": "/sse/routes/100"
  }
}
```

#### 종료 요청

> `end_time`에 현재 시간 기록, `duration = end_time - start_time` 자동 계산

```json
{
  "status": "FINISHED"
}
```

**Response `200 OK`**

```json
{
  "status": "success",
  "data": {
    "route_id": 100,
    "status": "FINISHED",
    "start_time": "2026-01-12T10:05:00+09:00",
    "end_time": "2026-01-12T10:47:00+09:00",
    "duration": 2520
  }
}
```

#### 취소 요청

```json
{
  "status": "CANCELED"
}
```

**Response `200 OK`**

```json
{
  "status": "success",
  "data": {
    "route_id": 100,
    "status": "CANCELED",
    "end_time": "2026-01-12T10:10:00+09:00"
  }
}
```

---

### 6.4 경주 결과 조회

> 💡 **순위**: `duration` (소요시간) 짧은 순서대로 정렬

```
GET /api/v1/routes/{route_id}/result
```

**Headers**

```
Authorization: Bearer {access_token}
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| route_id | integer | ✓ | 경주 참가자 ID (route 테이블의 PK) |

**Response `200 OK`**

```json
{
  "status": "success",
  "data": {
    "route_id": 100,
    "route_itinerary_id": 1,
    "status": "FINISHED",
    "start_time": "2026-01-12T10:05:00+09:00",
    "end_time": "2026-01-12T10:47:00+09:00",
    "route_info": {
      "departure": {
        "name": "강남역",
        "lat": 37.4979,
        "lon": 127.0276
      },
      "arrival": {
        "name": "홍대입구역",
        "lat": 37.5571,
        "lon": 126.9237
      }
    },
    "rankings": [
      {
        "rank": 1,
        "route_id": 100,
        "type": "USER",
        "user_id": 1,
        "name": "레이서킹",
        "duration": 2520,
        "end_time": "2026-01-12T10:47:00+09:00"
      },
      {
        "rank": 2,
        "route_id": 101,
        "type": "BOT",
        "bot_id": 1,
        "name": "Bot 1",
        "duration": 2650,
        "end_time": "2026-01-12T10:49:10+09:00"
      },
      {
        "rank": 3,
        "route_id": 102,
        "type": "BOT",
        "bot_id": 2,
        "name": "Bot 2",
        "duration": 2800,
        "end_time": "2026-01-12T10:51:40+09:00"
      }
    ],
    "user_result": {
      "rank": 1,
      "is_win": true,
      "duration": 2520
    }
  }
}
```

**Response 필드 설명**

| 필드 | 설명 |
|------|------|
| rankings | `duration` 오름차순 정렬 (짧은 시간 = 높은 순위) |
| user_result | 현재 유저의 결과 요약 |

---

## 7. SSE (Server-Sent Events)

> 💡 **프론트 애니메이션 방식 채택**
> - 백엔드: 봇의 "상태"만 전송 (어떤 버스/지하철에 탑승했는지)
> - 프론트: turf.js 등으로 경로 위 애니메이션 처리
> - 장점: 백엔드 부하 감소, 부드러운 UX

### 7.1 경주 실시간 스트림

```
GET /sse/routes/{route_id}
```

**Headers**

```
Authorization: Bearer {access_token}
Accept: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Path Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| route_id | integer | ✓ | 경주 참가자 ID (route 테이블의 PK) |

### Event Types

#### `connected` - 연결 성공

```
event: connected
data: {"route_id": 100, "connected_at": "2026-01-12T10:05:00+09:00"}
```

#### `bot_status_update` - 봇 상태 업데이트 (5초 주기)

> 봇이 탑승한 버스/지하철 정보와 현재 위치(정류장 인덱스) 전송
> 프론트에서 `passStopList`와 `current_station_index`를 이용해 위치 계산

```
event: bot_status_update
data: {
  "timestamp": "2026-01-12T10:06:00+09:00",
  "bots": [
    {
      "route_id": 101,
      "bot_id": 1,
      "status": "ON_VEHICLE",
      "vehicle": {
        "type": "SUBWAY",
        "vehicle_id": "2호선-2345",
        "route": "수도권2호선",
        "route_id": "110021006",
        "route_color": "009D3E",
        "current_station_index": 5,
        "total_stations": 10
      }
    },
    {
      "route_id": 102,
      "bot_id": 2,
      "status": "ON_VEHICLE",
      "vehicle": {
        "type": "BUS",
        "vehicle_id": "서울72사1234",
        "route": "지선:6211",
        "route_id": "1021193001",
        "route_color": "53B332",
        "current_station_index": 2,
        "total_stations": 4
      }
    }
  ]
}
```

**bot status 값:**

| status | 설명 |
|--------|------|
| `WAITING` | 정류장/역에서 대기 중 |
| `ON_VEHICLE` | 버스/지하철 탑승 중 |
| `WALKING` | 도보 이동 중 |
| `FINISHED` | 도착 완료 |

#### `bot_boarding` - 봇 탑승 이벤트

> 봇이 새로운 버스/지하철에 탑승했을 때 발생

```
event: bot_boarding
data: {
  "timestamp": "2026-01-12T10:06:30+09:00",
  "route_id": 101,
  "bot_id": 1,
  "station_name": "신촌",
  "vehicle": {
    "type": "SUBWAY",
    "vehicle_id": "2호선-2345",
    "route": "수도권2호선",
    "route_color": "009D3E"
  }
}
```

#### `bot_alighting` - 봇 하차 이벤트

> 봇이 버스/지하철에서 하차했을 때 발생

```
event: bot_alighting
data: {
  "timestamp": "2026-01-12T10:15:00+09:00",
  "route_id": 101,
  "bot_id": 1,
  "station_name": "신당",
  "next_action": "WALKING"
}
```

#### `participant_finished` - 참가자 도착

```
event: participant_finished
data: {
  "timestamp": "2026-01-12T10:47:00+09:00",
  "participant": {
    "route_id": 100,
    "type": "USER",
    "user_id": 1,
    "name": "레이서킹"
  },
  "rank": 1,
  "duration": 2520
}
```

#### `route_ended` - 경주 종료

```
event: route_ended
data: {
  "timestamp": "2026-01-12T10:56:40+09:00",
  "route_id": 100,
  "reason": "all_finished"
}
```

#### `heartbeat` - 연결 유지 (30초 주기)

```
event: heartbeat
data: {"timestamp": "2026-01-12T10:06:30+09:00"}
```

#### `error` - 에러 발생

```
event: error
data: {"code": "ROUTE_CANCELED", "message": "경주가 취소되었습니다."}
```

### 프론트엔드 구현 가이드

**1. 경로 라인 그리기**
- 경로 검색 시 받은 `passShape.linestring`으로 지도에 경로 표시

**2. 봇 위치 계산**
- `current_station_index`와 `passStopList.stations`를 이용
- turf.js `along()` 함수로 정류장 간 보간(interpolation)

**3. 애니메이션 처리**
- `bot_status_update` 이벤트 수신 시 목표 위치 계산
- requestAnimationFrame으로 부드럽게 이동

```javascript
// 예시: turf.js로 봇 위치 계산
const stations = passStopList.stations;
const currentIdx = bot.vehicle.current_station_index;
const nextIdx = Math.min(currentIdx + 1, stations.length - 1);

const from = [stations[currentIdx].lon, stations[currentIdx].lat];
const to = [stations[nextIdx].lon, stations[nextIdx].lat];
const line = turf.lineString([from, to]);

// 5초 동안 부드럽게 이동
const interpolated = turf.along(line, progress * turf.length(line));
```

---

## 8. API 엔드포인트 요약

### 인증 (Auth)

| 메서드 | 엔드포인트 | 설명 | 토큰 |
|--------|-----------|------|:----:|
| POST | `/api/v1/auth/register` | 회원가입 | X |
| POST | `/api/v1/auth/login` | 로그인 | X |
| POST | `/api/v1/auth/refresh` | 토큰 갱신 | X |
| POST | `/api/v1/auth/logout` | 로그아웃 | ✓ |

### 사용자 (Users)

| 메서드 | 엔드포인트 | 설명 | 토큰 |
|--------|-----------|------|:----:|
| GET | `/api/v1/users` | 내 정보 조회 | ✓ |
| PATCH | `/api/v1/users` | 내 정보 수정 | ✓ |
| GET | `/api/v1/users/stats` | 내 통계 조회 | ✓ |
| GET | `/api/v1/users/place-history` | 장소 검색 기록 조회 | ✓ |
| DELETE | `/api/v1/users/place-history` | 장소 검색 기록 전체 삭제 | ✓ |
| DELETE | `/api/v1/users/place-history/{search_place_history_id}` | 장소 검색 기록 개별 삭제 | ✓ |
| GET | `/api/v1/users/itinerary-history` | 경로 검색 기록 조회 | ✓ |
| DELETE | `/api/v1/users/itinerary-history` | 경로 검색 기록 전체 삭제 | ✓ |
| DELETE | `/api/v1/users/itinerary-history/{search_itinerary_history_id}` | 경로 검색 기록 개별 삭제 | ✓ |

### 장소 (Places)

| 메서드 | 엔드포인트 | 설명 | 토큰 |
|--------|-----------|------|:----:|
| GET | `/api/v1/places/search` | 장소 검색 | X |
| GET | `/api/v1/places/{poi_place_id}` | 장소 상세 조회 | X |

### 즐겨찾기 (Saved Places)

| 메서드 | 엔드포인트 | 설명 | 토큰 |
|--------|-----------|------|:----:|
| GET | `/api/v1/saved-places` | 즐겨찾기 목록 (category 필터 가능) | ✓ |
| POST | `/api/v1/saved-places` | 즐겨찾기 추가 | ✓ |
| DELETE | `/api/v1/saved-places/{saved_place_id}` | 즐겨찾기 삭제 (Soft Delete) | ✓ |
| PATCH | `/api/v1/saved-places/{saved_place_id}` | 즐겨찾기 수정 | ✓ |

### 경로 검색 (Itineraries)

| 메서드 | 엔드포인트 | 설명 | 토큰 |
|--------|-----------|------|:----:|
| POST | `/api/v1/itineraries/search` | 경로 검색 | ✓ |
| GET | `/api/v1/itineraries/search/{search_itinerary_history_id}` | 경로 검색 결과 조회 | ✓ |
| GET | `/api/v1/itineraries/legs/{route_leg_id}` | 개별 경로 상세 조회 | ✓ |

### 경주 (Routes)

| 메서드 | 엔드포인트 | 설명 | 토큰 |
|--------|-----------|------|:----:|
| POST | `/api/v1/routes` | 경주 생성 | ✓ |
| GET | `/api/v1/routes` | 경주 목록 조회 (JWT에서 user_id 추출) | ✓ |
| PATCH | `/api/v1/routes/{route_id}` | 경주 상태 변경 (시작/종료/취소) | ✓ |
| GET | `/api/v1/routes/{route_id}/result` | 경주 결과 조회 | ✓ |

### SSE

| 메서드 | 엔드포인트 | 설명 | 토큰 |
|--------|-----------|------|:----:|
| GET | `/sse/routes/{route_id}` | 실시간 스트림 | ✓ |

---

## 9. 에러 코드

### 인증 (AUTH_*)

| 코드 | HTTP | 설명 |
|------|------|------|
| AUTH_REQUIRED | 401 | 인증이 필요합니다 |
| AUTH_INVALID_TOKEN | 401 | 유효하지 않은 토큰 |
| AUTH_TOKEN_EXPIRED | 401 | 만료된 토큰 |
| AUTH_TOKEN_BLACKLISTED | 401 | 폐기된 토큰 (로그아웃됨) |
| AUTH_INVALID_CREDENTIALS | 401 | 잘못된 이메일/비밀번호 |
| AUTH_EMAIL_EXISTS | 400 | 이미 등록된 이메일 |
| AUTH_NAME_EXISTS | 400 | 이미 등록된 유저 ID |

### 리소스 (RESOURCE_*)

| 코드 | HTTP | 설명 |
|------|------|------|
| RESOURCE_NOT_FOUND | 404 | 리소스를 찾을 수 없음 |
| RESOURCE_FORBIDDEN | 403 | 접근 권한 없음 |
| RESOURCE_CONFLICT | 409 | 리소스 충돌 |

### 경주 (ROUTE_*)

| 코드 | HTTP | 설명 |
|------|------|------|
| ROUTE_NOT_FOUND | 404 | 경주를 찾을 수 없음 |
| ROUTE_INVALID_STATUS_TRANSITION | 400 | 유효하지 않은 상태 전이 |
| ROUTE_ALREADY_RUNNING | 409 | 이미 진행 중인 경주 |
| ROUTE_ALREADY_FINISHED | 409 | 이미 종료된 경주 |
| ROUTE_TOO_MANY_BOTS | 400 | 봇 수 초과 (최대 2) |
| ROUTE_INVALID_LOCATION | 400 | 유효하지 않은 위치 |

### 유효성 (VALIDATION_*)

| 코드 | HTTP | 설명 |
|------|------|------|
| VALIDATION_FAILED | 422 | 유효성 검사 실패 |
| VALIDATION_REQUIRED_FIELD | 422 | 필수 필드 누락 |
| VALIDATION_INVALID_FORMAT | 422 | 잘못된 형식 |

### 서버 (SERVER_*)

| 코드 | HTTP | 설명 |
|------|------|------|
| SERVER_ERROR | 500 | 내부 서버 오류 |
| SERVER_EXTERNAL_API | 502 | 외부 API 오류 |
| SERVER_UNAVAILABLE | 503 | 서비스 이용 불가 |

---

## 10. Rate Limiting

| 카테고리 | 제한 | 대상 |
|---------|------|------|
| 인증 | 10 req/min | `/api/v1/auth/*` |
| 검색 | 30 req/min | `/api/v1/places/search` |
| 경로 검색 | 20 req/min | `POST /api/v1/itineraries/search` |
| 일반 | 100 req/min | 기타 모든 엔드포인트 |

---

## 11. 변경 이력

### v4 (Current)

| 변경 사항 | 상세 |
|----------|------|
| ERD 명칭 통일 | `races` → `routes` (경주), `routes` → `itineraries` (경로 검색) |
| 즐겨찾기 API 분리 | `/api/v1/saved-places` |
| 로그아웃 API 추가 | `POST /api/v1/auth/logout` (Refresh Token Blacklist) |
| 장소 상세 조회 추가 | `GET /api/v1/places/{poi_place_id}` |
| 즐겨찾기 수정 추가 | `PATCH /api/v1/saved-places/{saved_place_id}` |
| 검색 기록 API 추가 | 장소/경로 검색 기록 조회 및 삭제 |
| 경주 상태 변경 통합 | actions → `PATCH /api/v1/routes/{route_itinerary_id}` |
| 경주 목록 조회 추가 | `GET /api/v1/routes` (전적 조회용) |
| 위치 저장 안 함 | SSE로만 실시간 처리 (A안 채택) |
| 상태값 통일 | `PENDING`, `RUNNING`, `FINISHED`, `CANCELED` |
| 시간 형식 통일 | ISO 8601 (`2026-01-12T19:00:00+09:00`) |
| Path Parameter 명확화 | 모든 ID에 리소스명 접두사 추가 |

### v3

| 변경 사항 | 상세 |
|----------|------|
| Trailing Slash 제거 | 모든 URI 끝에서 `/` 제거 |
| 행위는 HTTP Method로 | URI에 동사 사용 금지 |
| `/me` 제거 | JWT에서 사용자 추출 |
| 즐겨찾기 토글 | POST 토글 방식 통합 |
