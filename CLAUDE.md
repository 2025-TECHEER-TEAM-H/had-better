# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 언어 및 커뮤니케이션 규칙

- **기본 응답 언어**: 한국어
- **코드 주석**: 한국어로 작성
- **커밋 메시지**: 한국어로 작성
- **문서화**: 한국어로 작성
- **변수명/함수명**: 영어 (코드 표준 준수)

## 개발 환경 버전

| 도구 | 버전 |
|------|------|
| Python | 3.12.8 |
| Node.js | 24.12.0 |
| Django | 6.0 |

## 개발 명령어

### Docker 환경 실행
```bash
# 전체 서비스 시작 (DB, RabbitMQ, Celery)
docker-compose up -d

# 서비스 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f celery

# 서비스 중지
docker-compose down
```

### Backend (Django)
```bash
cd backend

# 가상환경 활성화 (Windows)
./venv/Scripts/activate

# 가상환경 활성화 (Linux/Mac)
source venv/bin/activate

# 마이그레이션
python manage.py makemigrations
python manage.py migrate

# 개발 서버 실행
python manage.py runserver

# Uvicorn으로 실행 (ASGI)
uvicorn config.asgi:application --reload

# 슈퍼유저 생성
python manage.py createsuperuser
```

### Frontend (React + Vite)
```bash
cd frontend

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview

# 린트
npm run lint
```

## 프로젝트 구조

```
had-better/
├── frontend/                # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # 재사용 가능한 UI 컴포넌트
│   │   ├── pages/           # 페이지 컴포넌트
│   │   ├── hooks/           # 커스텀 훅
│   │   ├── stores/          # Zustand 상태 관리
│   │   ├── services/        # API 클라이언트
│   │   ├── types/           # TypeScript 타입 정의
│   │   └── utils/           # 유틸리티 함수
│   └── ...
├── backend/                 # Django REST Framework
│   ├── config/              # 프로젝트 설정
│   │   ├── settings.py      # Django 설정
│   │   ├── celery.py        # Celery 설정
│   │   ├── urls.py          # 루트 URL 설정
│   │   └── exceptions.py    # 커스텀 예외 핸들러
│   ├── apps/
│   │   ├── users/           # 사용자 및 인증
│   │   ├── places/          # 장소 검색 및 즐겨찾기
│   │   ├── itineraries/     # 경로 검색
│   │   └── routes/          # 경주 관리
│   ├── Dockerfile           # Celery 컨테이너용
│   └── ...
└── docker-compose.yml       # Docker 서비스 설정
```

## 프로젝트 개요

**HAD BETTER** - 대중교통 경로 레이싱 서비스

사용자가 실제 이동 경로와 가상 봇(실시간 대중교통 데이터 기반)이 경쟁하여 도착 순위를 겨루는 지도 기반 게임화 서비스입니다.

### 핵심 기능 (MVP)
- 참가자(봇) 생성 및 경로 시뮬레이션
- 실시간 대중교통 위치 기반 경로 이동
- 실시간 순위 변경 및 결과 리포트

## 기술 스택

### Frontend
- **Framework**: React + TypeScript + Vite
- **Map Engine**: Mapbox GL JS (3D/2D 지도 렌더링)
- **Geo-Computation**: Turf.js (클라이언트 측 거리 계산, 경로 이탈 감지)
- **State Management**: Zustand
- **HTTP Client**: Axios
- **배포**: Vercel

### Backend
- **Framework**: Django 6.0 + DRF + Uvicorn
- **Message Broker**: RabbitMQ (비동기 Task Queue + Pub/Sub)
- **Async Worker**: Celery (Docker 컨테이너로 실행)
- **Database**: PostgreSQL + PostGIS (공간 데이터 연산)
- **Gateway**: Traefik
- **배포**: AWS EC2/Docker

### External APIs
- **경로 탐색**: TMap 대중교통 API
- **실시간 위치**: 공공데이터포털/서울시 API
- **지도 시각화**: Mapbox

## 아키텍처

### 데이터 흐름
1. Client → Traefik → Django (요청 처리)
2. Django → RabbitMQ (Celery Task 생성)
3. RabbitMQ → Celery Worker → External API (5초 주기 호출)
4. Celery → RabbitMQ (Topic Exchange) → Django (Consumer) → Client (SSE Stream)

### 실시간 통신
- SSE (Server-Sent Events)로 봇 상태 전송
- 프론트엔드에서 Turf.js로 애니메이션 처리
- 5초 주기 `bot_status_update` 이벤트

## API 구조

Base URL: `http://localhost:8000` (개발) / `https://api.hadbetter.com` (프로덕션)

### 주요 엔드포인트
| 리소스 | 엔드포인트 | 설명 |
|--------|-----------|------|
| 인증 | `/api/v1/auth/*` | 회원가입, 로그인, 토큰 갱신 |
| 사용자 | `/api/v1/users` | 사용자 정보, 통계, 검색 기록 |
| 장소 | `/api/v1/places/*` | 장소 검색 (TMap API) |
| 즐겨찾기 | `/api/v1/saved-places` | 집/회사/학교 등 저장 |
| 경로 검색 | `/api/v1/itineraries/*` | 대중교통 경로 탐색 |
| 경주 | `/api/v1/routes` | 경주 생성, 상태 변경, 결과 |
| SSE | `/sse/routes/{route_id}` | 실시간 스트림 |

### API 설계 원칙
- RESTful: 명사 복수형 URI, HTTP 메서드로 행위 표현
- Trailing Slash 제거
- JWT 토큰에서 사용자 식별 (URL에 user_id 미포함)
- 상태값: `PENDING`, `RUNNING`, `FINISHED`, `CANCELED`
- 시간 형식: ISO 8601 (`2026-01-12T19:00:00+09:00`)

## 데이터베이스 스키마 (핵심 테이블)

| 테이블 | 설명 |
|--------|------|
| `user` | 사용자 정보 |
| `poi_place` | POI 장소 (TMap 데이터) |
| `saved_place` | 즐겨찾기 장소 |
| `route_itinerary` | 경로 탐색 결과 묶음 |
| `route_leg` | 개별 경로 구간 (PostGIS LineString) |
| `route` | 경주 세션 (유저 vs 봇) |
| `bot` | 봇 정보 |

## 프론트엔드 구현 가이드

### Turf.js 활용
- `turf.distance`: 목적지까지 남은 직선거리 계산
- `turf.pointToLineDistance`: 경로 이탈 감지 (20m 기준)
- `turf.along`: 봇 위치 보간(interpolation)

### 도착 판정
- 목적지 반경 50m 이내 진입 시 `POST /routes/{id}` (status: FINISHED)

### SSE 이벤트 타입
- `connected`: 연결 성공
- `bot_status_update`: 봇 상태 (5초 주기)
- `bot_boarding`: 봇 탑승
- `bot_alighting`: 봇 하차
- `participant_finished`: 참가자 도착
- `route_ended`: 경주 종료
- `heartbeat`: 연결 유지 (30초 주기)

## UI/UX 가이드라인

- **지도 스타일**: Mapbox Studio 커스텀 'Night Racing' 테마
- **경로선**: 사용자(파란색 Neon), 봇(붉은색/노란색 Neon)
- **마커**: 3D 느낌 SVG/PNG 아이콘

**참고**: 프론트엔드 디자인은 초기 세팅 이후 FIGMA MCP SERVER를 통해 수정 예정
