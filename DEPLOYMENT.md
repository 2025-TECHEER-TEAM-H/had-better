# 백엔드 배포 가이드

## 아키텍처 개요

```
┌─────────────────────┐
│  GitHub Actions     │
│  (CI/CD Pipeline)   │
└──────────┬──────────┘
           │
           │ 1. Build & Push Image
           ▼
    ┌──────────────┐
    │   AWS ECR    │
    │ (Container   │
    │  Registry)   │
    └──────┬───────┘
           │
           │ 2. Pull Image
           │
      ┌────┴────┐
      │         │
      ▼         ▼
┌─────────┐  ┌─────────┐
│ EC2 #1  │  │ EC2 #2  │
│ Django  │  │ Celery  │
│ Traefik │  │ Worker  │
│ RabbitMQ│  │ Beat    │
└────┬────┘  └────┬────┘
     │            │
     └────┬───────┘
          │
          ▼
    ┌──────────┐
    │ AWS RDS  │
    │ PostGIS  │
    └──────────┘
```

## 1. AWS 인프라 설정

### 1.1 보안 그룹 (Security Groups)

**Django EC2 보안 그룹:**
```
인바운드 규칙:
- 80 (HTTP): 0.0.0.0/0
- 443 (HTTPS): 0.0.0.0/0
- 5672 (RabbitMQ): Celery EC2의 Private IP
- 15672 (RabbitMQ Admin): 관리자 IP만
- 22 (SSH): 관리자 IP만
```

**Celery EC2 보안 그룹:**
```
인바운드 규칙:
- 22 (SSH): 관리자 IP만

아웃바운드 규칙:
- 5672: Django EC2로 (RabbitMQ)
- 5432: RDS로 (PostgreSQL)
```

**RDS 보안 그룹:**
```
인바운드 규칙:
- 5432 (PostgreSQL): Django EC2 보안 그룹
- 5432 (PostgreSQL): Celery EC2 보안 그룹
```

### 1.2 ECR 레포지토리 생성

```bash
aws ecr create-repository \
  --repository-name hadbetter-backend \
  --region ap-northeast-2
```

### 1.3 RDS 생성

```
엔진: PostgreSQL 16
플러그인: PostGIS 활성화
인스턴스 타입: db.t3.micro (개발) / db.t3.medium (프로덕션)
스토리지: 20GB
백업: 자동 백업 활성화 (7일 보관)
```

## 2. EC2 서버 초기 설정

### 2.1 Docker 설치 (두 서버 모두)

```bash
# Docker 설치
sudo yum update -y
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 재로그인 후 확인
docker --version
docker-compose --version
```

### 2.2 ECR 로그인 설정 (두 서버 모두)

```bash
# AWS CLI 설치
sudo yum install -y aws-cli

# ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin \
  123456789012.dkr.ecr.ap-northeast-2.amazonaws.com
```

### 2.3 Django EC2 설정

```bash
# 프로젝트 디렉토리 생성
mkdir -p ~/hadbetter
cd ~/hadbetter

# docker-compose.django.yml 업로드
# .env.django 파일 생성 및 환경 변수 설정

# 실행
docker-compose -f docker-compose.django.yml up -d

# 로그 확인
docker-compose -f docker-compose.django.yml logs -f
```

### 2.4 Celery EC2 설정

```bash
# 프로젝트 디렉토리 생성
mkdir -p ~/hadbetter
cd ~/hadbetter

# docker-compose.celery.yml 업로드
# .env.celery 파일 생성 및 환경 변수 설정
# DJANGO_EC2_PRIVATE_IP에 Django EC2의 Private IP 입력

# 실행
docker-compose -f docker-compose.celery.yml up -d

# 로그 확인
docker-compose -f docker-compose.celery.yml logs -f
```

## 3. GitHub Actions 설정

### 3.1 GitHub Secrets 추가

```
AWS_REGION: ap-northeast-2
ECR_REGISTRY: 123456789012.dkr.ecr.ap-northeast-2.amazonaws.com
ECR_REPOSITORY: hadbetter-backend

# Django EC2
EC2_DJANGO_HOST: ec2-xx-xx-xx-xx.ap-northeast-2.compute.amazonaws.com
EC2_DJANGO_USER: ec2-user
EC2_DJANGO_SSH_KEY: (SSH Private Key)

# Celery EC2
EC2_CELERY_HOST: ec2-yy-yy-yy-yy.ap-northeast-2.compute.amazonaws.com
EC2_CELERY_USER: ec2-user
EC2_CELERY_SSH_KEY: (SSH Private Key)

# 환경 변수
DJANGO_SECRET_KEY: (비밀 키)
DB_HOST: (RDS 엔드포인트)
DB_PASSWORD: (DB 비밀번호)
RABBITMQ_PASS: (RabbitMQ 비밀번호)
```

### 3.2 배포 워크플로우

`.github/workflows/backend-cd.yml` 참조

## 4. 배포 프로세스

1. **코드 Push** → `main` 브랜치에 push
2. **CI 실행** → 테스트 및 린트 검사
3. **이미지 빌드** → Docker 이미지 빌드
4. **ECR Push** → 이미지를 ECR에 업로드
5. **Django EC2 배포** → SSH 접속 후 컨테이너 재시작
6. **Celery EC2 배포** → SSH 접속 후 컨테이너 재시작

## 5. 모니터링

### 로그 확인

```bash
# Django EC2
docker-compose -f docker-compose.django.yml logs -f backend
docker-compose -f docker-compose.django.yml logs -f traefik

# Celery EC2
docker-compose -f docker-compose.celery.yml logs -f celery-worker
docker-compose -f docker-compose.celery.yml logs -f celery-beat
```

### 헬스 체크

```bash
# Django API
curl http://your-domain.com/api/health

# RabbitMQ
curl http://DJANGO_EC2_IP:15672
```

## 6. 트러블슈팅

### Celery가 RabbitMQ에 연결 안 될 때

1. Django EC2 보안 그룹에서 5672 포트 확인
2. `.env.celery`의 `DJANGO_EC2_PRIVATE_IP` 확인
3. RabbitMQ 로그 확인: `docker logs hadbetter-rabbitmq`

### DB 연결 안 될 때

1. RDS 보안 그룹 확인
2. RDS 엔드포인트 주소 확인
3. DB 자격 증명 확인

### 배포 후 502 에러

1. Backend 컨테이너 로그 확인
2. Traefik 설정 확인
3. 환경 변수 누락 확인

## 7. 롤백

```bash
# 이전 이미지 태그로 롤백
export IMAGE_TAG=previous-tag

# Django EC2
docker-compose -f docker-compose.django.yml up -d

# Celery EC2
docker-compose -f docker-compose.celery.yml up -d
```
