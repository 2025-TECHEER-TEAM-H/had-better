<p align="center">
  <a href="https://github.com/2025-TECHEER-TEAM-H/had-better">
  </a>
</p>

# Index
- [Introduction](#-Introduction)
- [Demo](#-Demo)
- [System Architecture](#-System-Architecture)
- [Tech Stack](#-Tech-Stack)
- [ERD](#-ERD)
- [API](#-API)
- [Monitoring](#-Monitoring)
- [Directory Structure](#-Directory-Structure)
- [Member](#-Member)
<br>

# Introduction
### URL
<blockquote>[배포 URL을 여기에 입력]</blockquote>

### 프로젝트 소개
**HAD BETTER** - 대중교통 경로 레이싱 서비스

사용자가 실제 이동 경로와 가상 봇(실시간 대중교통 데이터 기반)이 경쟁하여 도착 순위를 겨루는 지도 기반 게임화 서비스입니다.

### 핵심 기능
- 참가자(봇) 생성 및 경로 시뮬레이션
- 실시간 대중교통 위치 기반 경로 이동
- 실시간 순위 변경 및 결과 리포트
- TMap API 기반 대중교통 경로 탐색
- SSE를 활용한 실시간 위치 업데이트

### Medium
>  [HAD-BETTER-Medium]

<br>

# Demo
### 메인페이지
https://github.com/user-attachments/assets/c608c83c-b990-4e46-8444-e05c8465f43e


https://github.com/user-attachments/assets/9e8a48ad-efef-4741-9c4a-29d1eb917f75


<br><br>

### 경로 검색
<img width="393" height="852" alt="스크린샷 2026-01-27 172830" src="https://github.com/user-attachments/assets/cf24f35b-ca76-44b3-93ec-a0d80d16541a" />

https://github.com/user-attachments/assets/35be4c6b-619c-4c28-b90f-14ee3bb471c6

<br><br>

### 경주 시작

<br><br>

### 실시간 경주

<br><br>

### 결과 화면
<img width="393" height="850" alt="스크린샷 2026-01-27 173853" src="https://github.com/user-attachments/assets/eee57fc2-5e0c-4e1a-826f-bb9ee0649bd6" />

### 사용자 대시보드 화면
<img width="394" height="853" alt="스크린샷 2026-01-27 172640" src="https://github.com/user-attachments/assets/c36df19a-909a-43a1-bacd-8d30c67526ee" />

<br><br>

# API
<img width="1451" height="772" alt="스크린샷 2026-01-27 201406" src="https://github.com/user-attachments/assets/7cc78e4f-d145-4610-b0f2-39af7a0e4ad0" />
<img width="1457" height="762" alt="스크린샷 2026-01-27 201416" src="https://github.com/user-attachments/assets/823730c6-ec36-48da-9890-b05d76d8149a" />
<img width="1460" height="655" alt="스크린샷 2026-01-27 201427" src="https://github.com/user-attachments/assets/6f09ea9b-7306-4f83-9cdc-dcf5b53f5175" />
<img width="1471" height="604" alt="스크린샷 2026-01-27 201436" src="https://github.com/user-attachments/assets/ca245159-abeb-469d-9483-c8d55220a4cd" />


### 주요 엔드포인트

#### 인증 (Auth)
- `POST /api/v1/auth/register` - 회원가입
- `POST /api/v1/auth/login` - 로그인
- `POST /api/v1/auth/refresh` - 토큰 갱신
- `POST /api/v1/auth/logout` - 로그아웃

#### 사용자 (Users)
- `GET /api/v1/users` - 사용자 정보 조회
- `PATCH /api/v1/users` - 사용자 정보 수정
- `GET /api/v1/users/statistics` - 사용자 통계
- `GET /api/v1/users/search-history` - 검색 기록

#### 장소 (Places)
- `POST /api/v1/places/search` - 장소 검색 (TMap API)
- `POST /api/v1/places/reverse-geocoding` - 역지오코딩
- `GET /api/v1/saved-places` - 즐겨찾기 조회
- `POST /api/v1/saved-places` - 즐겨찾기 추가
- `DELETE /api/v1/saved-places/{id}` - 즐겨찾기 삭제

#### 경로 (Itineraries)
- `POST /api/v1/itineraries/search` - 경로 검색
- `GET /api/v1/itineraries/{id}` - 경로 상세 조회
- `GET /api/v1/itineraries/recent` - 최근 검색 기록

#### 경주 (Routes)
- `POST /api/v1/routes` - 경주 생성
- `GET /api/v1/routes/{id}` - 경주 상세 조회
- `PATCH /api/v1/routes/{id}` - 경주 상태 변경
- `GET /api/v1/routes/{id}/result` - 경주 결과 조회
- `GET /api/v1/sse/routes/{id}` - 실시간 SSE 스트림
<br><br>

# System Architecture
/여기 아키텍쳐 사진

### 아키텍처 특징
- **Frontend**: React + Vite로 구성된 SPA, Vercel 배포
- **Backend**: Django REST Framework + Uvicorn ASGI 서버
- **Message Queue**: RabbitMQ를 통한 비동기 작업 처리
- **Worker**: Celery Worker가 실시간 대중교통 데이터 수집
- **Database**: PostgreSQL + PostGIS 공간 데이터 처리
- **Cache**: Redis를 활용한 실시간 위치 데이터 캐싱
- **Gateway**: Traefik을 통한 리버스 프록시 및 라우팅
- **Monitoring**: Prometheus + Grafana로 메트릭 수집 및 시각화

### 데이터 흐름
1. Client → Traefik → Django (요청 처리)
2. Django → RabbitMQ (Celery Task 생성)
3. RabbitMQ → Celery Worker → External API (30초/15초 동적 주기 호출)
4. Celery → RabbitMQ (Topic Exchange) → Django (Consumer) → Client (SSE Stream)

### 실시간 통신
- SSE (Server-Sent Events)로 봇 상태 전송
- 프론트엔드에서 Turf.js로 애니메이션 처리
- 30초/15초 동적 주기 `bot_status_update` 이벤트 (도착 임박 시 15초)
<br><br>

# ERD
/여기 ERD 테이블 사진

### 주요 테이블
- **user** - 사용자 정보
- **poi_place** - POI 장소 (TMap 데이터)
- **saved_place** - 즐겨찾기 장소 (집/회사/학교 등)
- **route_itinerary** - 경로 탐색 결과 묶음
- **route_leg** - 개별 경로 구간 (PostGIS LineString)
- **route** - 경주 세션 (유저 vs 봇)
- **bot** - 봇 정보 및 상태
<br><br>

# Tech Stack
<div align="center">
  <table>
    <tr>
      <th>Field</th>
      <th>Technology of Use</th>
    </tr>
    <tr>
      <td><b>Frontend</b></td>
      <td>
        <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black">
        <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
        <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white">
        <img src="https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=react&logoColor=white">
        <img src="https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white">
        <img src="https://img.shields.io/badge/Mapbox-000000?style=for-the-badge&logo=mapbox&logoColor=white">
        <img src="https://img.shields.io/badge/Turf.js-3FA03F?style=for-the-badge&logo=javascript&logoColor=white">
        <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white">
        <img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white">
        <img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=white">
      </td>
    </tr>
    <tr>
      <td><b>Backend</b></td>
      <td>
        <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white">
        <img src="https://img.shields.io/badge/Django REST Framework-ff1709?style=for-the-badge&logo=django&logoColor=white">
        <img src="https://img.shields.io/badge/Uvicorn-009688?style=for-the-badge&logo=gunicorn&logoColor=white">
        <img src="https://img.shields.io/badge/Celery-37814A?style=for-the-badge&logo=celery&logoColor=white">
        <img src="https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white">
        <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white">
      </td>
    </tr>
    <tr>
      <td><b>Database</b></td>
      <td>
        <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white">
        <img src="https://img.shields.io/badge/PostGIS-4169E1?style=for-the-badge&logo=postgresql&logoColor=white">
      </td>
    </tr>
    <tr>
      <td><b>External APIs</b></td>
      <td>
        <img src="https://img.shields.io/badge/TMap API-FF5E00?style=for-the-badge&logo=tmap&logoColor=white">
        <img src="https://img.shields.io/badge/공공데이터포털-003876?style=for-the-badge&logo=data&logoColor=white">
        <img src="https://img.shields.io/badge/서울시 API-004098?style=for-the-badge&logo=seoul&logoColor=white">
        <img src="https://img.shields.io/badge/Mapbox API-000000?style=for-the-badge&logo=mapbox&logoColor=white">
      </td>
    </tr>
    <tr>
      <td><b>DevOps</b></td>
      <td>
        <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white">
        <img src="https://img.shields.io/badge/Amazon EC2-FF9900?style=for-the-badge&logo=amazonec2&logoColor=white">
        <img src="https://img.shields.io/badge/GitHub Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white">
        <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white">
        <img src="https://img.shields.io/badge/Traefik-24A1C1?style=for-the-badge&logo=traefikproxy&logoColor=white">
      </td>
    </tr>
    <tr>
      <td><b>Monitoring</b></td>
      <td>
        <img src="https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white">
        <img src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white">
        <img src="https://img.shields.io/badge/Node Exporter-37D100?style=for-the-badge&logo=prometheus&logoColor=white">
        <img src="https://img.shields.io/badge/Celery Exporter-37814A?style=for-the-badge&logo=celery&logoColor=white">
      </td>
    </tr>
    <tr>
      <td><b>ETC</b></td>
      <td>
        <img src="https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white">
        <img src="https://img.shields.io/badge/Notion-000000?style=for-the-badge&logo=notion&logoColor=white">
        <img src="https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white">
        <img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white">
        <img src="https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black">
      </td>
    </tr>
  </table>
</div>
<br>

# Monitoring
<h3 align="left">Prometheus & Grafana</h3>
<table>
    <tr>
        <th>Django Metrics</th>
    </tr>
    <tr>
        <td><img width="1915" height="887" alt="스크린샷 2026-01-27 173456" src="https://github.com/user-attachments/assets/4fbac803-23aa-48b5-8c61-52f4b44921a8" /></td>
    </tr>
    <tr>
        <th>Celery Worker Metrics</th>
    </tr>
    <tr>
        <td><img width="1905" height="816" alt="스크린샷 2026-01-27 173811" src="https://github.com/user-attachments/assets/7e6c7f67-721c-4e52-a94c-c4b072974f78" /></td>
    </tr>
</table>

### 모니터링 항목
- **Django**: HTTP 요청/응답, Database Ops, Models Stats
- **Celery**: Task 처리량, 성공률, 실행 시간, Worker 상태, CPU 사용률
<br><br>

# Directory Structure
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
├── monitoring/              # 모니터링 설정
│   ├── prometheus/
│   │   └── prometheus.yml
│   └── grafana/
│       └── provisioning/
├── docker-compose.yml       # 메인 서비스 설정
└── docker-compose.monitoring.yml  # 모니터링 스택
```
<br>

## Member
| Name | 김민규 | 이현영 | 강동원 | 한동혁 | 이초은 | 조재문 |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Profile | 민규님 프사 | 현영님 프사 | 내 프사 | 동혁님 프사 | 초은님 프사 | 재문님 프사 |
| Role | Team Leader, <br>Fullstack, DevOps | Fullstack, <br>DevOps | Backend, <br>DevOps | Backend, <br>Design | Frontend, <br>Design | Frontend, <br>Design |
| GitHub | <a href="https://github.com/sincereQK"> @sincereQK | <a href="https://github.com/hyl1115"> @hyl1115 | <a href="https://github.com/k-dong1"> @k-dong1 | <a href="https://github.com/Asterisk0707"> @Asterisk0707 | <a href="https://github.com/b94848774-svg"> @b94848774-svg | <a href="https://github.com/whwoans"> @whwoans |
