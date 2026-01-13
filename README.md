# HAD BETTER

대중교통 경로 레이싱 서비스

> "이 길로 갔으면 더 좋았을 텐데 (Had better take this route)"

사용자가 실제 이동 경로와 가상 봇(실시간 대중교통 데이터 기반)이 경쟁하여 도착 순위를 겨루는 지도 기반 게임화 서비스입니다.

## 개발 환경 버전

| 도구 | 버전 |
|------|------|
| Python | 3.12.8 |
| Node.js | 24.12.0 |
| Django | 6.0 |
| Docker Desktop | 최신 버전 |

## 빠른 시작 가이드

### 1. 저장소 클론

```bash
git clone https://github.com/2025-TECHEER-TEAM-H/had-better.git
cd had-better
```

### 2. Docker 서비스 실행 (DB, RabbitMQ, Celery)

```bash
docker-compose up -d
```

> Docker Desktop이 실행 중이어야 합니다.

### 3. Backend 설정 및 실행

#### Windows

```bash
cd backend

# 가상환경 생성 (최초 1회)
python -m venv venv

# 가상환경 활성화
.\venv\Scripts\activate

# 패키지 설치
pip install -r requirements.txt

# 환경 변수 설정 (최초 1회)
cp .env.example .env

# 마이그레이션
python manage.py migrate

# 서버 실행
python manage.py runserver
```

#### Mac/Linux

```bash
cd backend

# 가상환경 생성 (최초 1회)
python3 -m venv venv

# 가상환경 활성화
source venv/bin/activate

# 패키지 설치
pip install -r requirements.txt

# 환경 변수 설정 (최초 1회)
cp .env.example .env

# 마이그레이션
python manage.py migrate

# 서버 실행
python manage.py runserver
```

### 4. Frontend 설정 및 실행

```bash
cd frontend

# 패키지 설치 (최초 1회)
npm install

# 환경 변수 설정 (최초 1회)
cp .env.example .env

# 개발 서버 실행
npm run dev
```

## 접속 URL

| 서비스 | URL | 설명 |
|--------|-----|------|
| Frontend | http://localhost:5173 | React 개발 서버 |
| Backend API | http://localhost:8000 | Django REST API |
| API 문서 (Swagger) | http://localhost:8000/api/docs/ | API 문서 |
| Admin 페이지 | http://localhost:8000/admin/ | Django 관리자 |
| RabbitMQ 관리 콘솔 | http://localhost:15672 | guest / guest |

## 개발 시 실행 순서

```
1. Docker Desktop 실행
2. docker-compose up -d          # DB, RabbitMQ, Celery 시작
3. cd backend && python manage.py runserver   # Backend 시작
4. cd frontend && npm run dev    # Frontend 시작 (새 터미널)
```

## Docker 서비스 관리

```bash
# 서비스 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f celery        # Celery Worker 로그
docker-compose logs -f celery-beat   # Celery Beat 로그

# 서비스 중지
docker-compose down

# 서비스 재시작 (코드 변경 후 Celery 재시작 필요 시)
docker-compose restart celery celery-beat
```

## 기술 스택

### Frontend
- React + TypeScript + Vite
- Mapbox GL JS
- Turf.js
- Zustand
- Axios

### Backend
- Django 6.0 + Django REST Framework
- Celery + RabbitMQ
- PostgreSQL + PostGIS

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
│   ├── apps/
│   │   ├── users/           # 사용자 및 인증
│   │   ├── places/          # 장소 검색 및 즐겨찾기
│   │   ├── itineraries/     # 경로 검색
│   │   └── routes/          # 경주 관리
│   └── ...
├── docker-compose.yml       # 개발용 Docker 설정
└── docker-compose.prod.yml  # 프로덕션용 Docker 설정 (Traefik 포함)
```

## 문제 해결

### Docker 서비스가 시작되지 않을 때

```bash
# 기존 컨테이너 정리 후 재시작
docker-compose down -v
docker-compose up -d
```

### 포트 충돌 시

- 5432 (PostgreSQL), 5672/15672 (RabbitMQ) 포트가 사용 중인지 확인
- 기존에 로컬에 설치된 PostgreSQL이나 RabbitMQ가 있다면 중지

### 마이그레이션 오류 시

```bash
# 마이그레이션 파일 재생성
python manage.py makemigrations
python manage.py migrate
```
