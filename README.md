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

### 5. Figma MCP 서버 설정 (Claude Code 사용 시)

Claude Code를 사용하여 Figma 디자인과 연동하려면 다음 단계를 따르세요.

#### 5.1 Figma API 토큰 생성

1. [Figma](https://figma.com)에 로그인
2. 프로필 아이콘 → **Settings** 클릭
3. **Personal access tokens** 탭 선택
4. **Create a new personal access token** 클릭
5. 토큰명 입력 (예: "HAD BETTER MCP")
6. 토큰 복사 (나중에 다시 볼 수 없음)

#### 5.2 MCP 설정 파일 생성

```bash
# 프로젝트 루트에서 실행
cp .mcp.json.example .mcp.json
```

#### 5.3 토큰 설정

`.mcp.json` 파일을 열어 `FIGMA_API_TOKEN` 값을 실제 토큰으로 변경:

```json
{
  "mcpServers": {
    "figma": {
      "command": "npx",
      "args": [
        "-y",
        "figma-developer-mcp",
        "--figma-api-key=${FIGMA_API_TOKEN}"
      ],
      "env": {
        "FIGMA_API_TOKEN": "여기에_실제_토큰_입력"
      }
    }
  }
}
```

#### 5.4 설정 확인

Claude Code에서 다음 명령 실행:

```
/mcp
```

Figma 서버가 활성화되어 있으면 성공적으로 연결된 것입니다.

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

## 지도 캐릭터 변경 가이드

현재 지도 위에서 움직이는 캐릭터는 3가지 색상 중 선택할 수 있습니다:
- **Green** (초록색) - 현재 기본 설정
- **Yellow** (노란색)
- **Gray** (회색)

### 캐릭터 변경 방법

`frontend/src/components/map/naviSprite.ts` 파일의 **18번째 줄**을 수정하세요.

#### Green 캐릭터 사용 (현재 설정)
```typescript
const base = "/assets/sprites/characters/green";
```

#### Yellow 캐릭터로 변경
```typescript
const base = "/assets/sprites/characters/yellow";
```

그리고 **22-25번째 줄**의 파일명을 다음과 같이 변경:
```typescript
loadImage(map, "navi-walk-0", `${base}/yellow1.png`),
loadImage(map, "navi-walk-1", `${base}/yellow2.png`),
loadImage(map, "navi-walk-2", `${base}/yellow3.png`),
loadImage(map, "navi-walk-3", `${base}/yellow4.png`),
// 대기 상태
loadImage(map, "navi-idle", `${base}/yellow1.png`),
// 도착 상태
loadImage(map, "navi-arrive", `${base}/yellow5.png`),
```

#### Gray 캐릭터로 변경
```typescript
const base = "/assets/sprites/characters/gray";
```

그리고 **22-25번째 줄**의 파일명을 다음과 같이 변경:
```typescript
loadImage(map, "navi-walk-0", `${base}/navi-idle.png`),
loadImage(map, "navi-walk-1", `${base}/navi-walk-1.png`),
loadImage(map, "navi-walk-2", `${base}/navi-idle.png`),
loadImage(map, "navi-walk-3", `${base}/navi-walk-3.png`),
// 대기 상태
loadImage(map, "navi-idle", `${base}/navi-idle.png`),
// 도착 상태
loadImage(map, "navi-arrive", `${base}/navi-arrive.png`),
```

### 캐릭터 크기 조정 (선택사항)

캐릭터 크기가 너무 크거나 작다면 `frontend/src/components/map/naviLayer.ts` 파일의 **52번째 줄**을 수정하세요.

```typescript
"icon-size": 0.6,  // 0.3 ~ 1.0 사이 값으로 조정 가능
```

- 더 작게: `0.4` ~ `0.5`
- 기본: `0.6`
- 더 크게: `0.7` ~ `0.8`
