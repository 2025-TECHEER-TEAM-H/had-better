# 배포 체크리스트

## 1. AWS 인프라 준비

### ✅ ECR (Elastic Container Registry)
```bash
# ECR 레포지토리 생성
aws ecr create-repository \
  --repository-name hadbetter-backend \
  --region ap-northeast-2

# 레포지토리 URI 확인
aws ecr describe-repositories \
  --repository-names hadbetter-backend \
  --region ap-northeast-2
```
- [ ] ECR 레포지토리 생성 완료
- [ ] 레포지토리 URI 복사: `123456789012.dkr.ecr.ap-northeast-2.amazonaws.com`

### ✅ RDS (PostgreSQL + PostGIS)
- [ ] RDS 인스턴스 생성 완료
- [ ] PostGIS 확장 활성화
  ```sql
  CREATE EXTENSION IF NOT EXISTS postgis;
  CREATE EXTENSION IF NOT EXISTS postgis_topology;
  ```
- [ ] RDS 엔드포인트 확인: `hadbetter-db.xxxxxxxxxx.ap-northeast-2.rds.amazonaws.com`
- [ ] 데이터베이스 자격 증명 확인

### ✅ EC2 인스턴스

**Django EC2 (EC2 #1)**
- [ ] 인스턴스 생성 (Ubuntu 22.04 LTS 권장)
- [ ] 인스턴스 타입: t3.small 이상
- [ ] Public IP/Elastic IP 할당
- [ ] 보안 그룹 설정:
  - 80 (HTTP): 0.0.0.0/0
  - 443 (HTTPS): 0.0.0.0/0
  - 5672 (RabbitMQ): Celery EC2 Private IP
  - 22 (SSH): 관리자 IP
- [ ] SSH 키 페어 다운로드 및 저장

**Celery EC2 (EC2 #2)**
- [ ] 인스턴스 생성 (Ubuntu 22.04 LTS 권장)
- [ ] 인스턴스 타입: t3.small 이상
- [ ] 보안 그룹 설정:
  - 22 (SSH): 관리자 IP
  - 아웃바운드: 5672 (Django EC2로), 5432 (RDS로)
- [ ] SSH 키 페어 다운로드 및 저장

**RDS 보안 그룹**
- [ ] 5432 포트 인바운드:
  - Django EC2 보안 그룹
  - Celery EC2 보안 그룹

### ✅ IAM 사용자 (GitHub Actions용)
```bash
# IAM 정책 예시
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:PutImage",
        "ecr:InitiateLayerUpload",
        "ecr:UploadLayerPart",
        "ecr:CompleteLayerUpload"
      ],
      "Resource": "*"
    }
  ]
}
```
- [ ] IAM 사용자 생성
- [ ] ECR 권한 부여
- [ ] Access Key ID, Secret Access Key 발급

## 2. EC2 서버 초기 설정

### Django EC2 설정

```bash
# SSH 접속
ssh -i your-key.pem ubuntu@DJANGO_EC2_IP

# Docker 설치
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
sudo systemctl enable docker
sudo systemctl start docker

# 재로그인 후
docker --version

# AWS CLI 설치
sudo apt install -y awscli

# 프로젝트 디렉토리 생성
mkdir -p ~/hadbetter
cd ~/hadbetter

# docker-compose.django.yml 파일 업로드 (scp 또는 git clone)
# .env.django 파일 생성 및 환경 변수 설정
```

**django.yml 업로드:**
```bash
# 로컬에서 실행
scp -i your-key.pem docker-compose.django.yml ubuntu@DJANGO_EC2_IP:~/hadbetter/
```

**.env.django 파일 생성:**
```bash
# EC2에서 실행
cat > ~/hadbetter/.env.django << 'EOF'
ECR_REGISTRY=123456789012.dkr.ecr.ap-northeast-2.amazonaws.com
IMAGE_TAG=latest
DJANGO_SECRET_KEY=your-secret-key
ALLOWED_HOSTS=your-domain.com,api.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=hadbetter
DB_USER=postgres
DB_PASSWORD=your-db-password
REDIS_URL=redis://your-redis:6379/0
RABBITMQ_USER=admin
RABBITMQ_PASS=your-rabbitmq-password
EOF

# 심볼릭 링크 생성 (docker-compose가 .env 파일을 자동으로 읽도록)
ln -s .env.django .env
```

- [ ] Docker 설치 완료
- [ ] docker-compose.django.yml 업로드
- [ ] .env.django 파일 생성 및 설정

### Celery EC2 설정

```bash
# SSH 접속
ssh -i your-key.pem ubuntu@CELERY_EC2_IP

# Docker 설치 (위와 동일)
sudo apt update
sudo apt install -y docker.io docker-compose awscli
sudo usermod -aG docker ubuntu
sudo systemctl enable docker
sudo systemctl start docker

# 프로젝트 디렉토리 생성
mkdir -p ~/hadbetter
cd ~/hadbetter

# docker-compose.celery.yml 파일 업로드
# .env.celery 파일 생성
```

**celery.yml 업로드:**
```bash
# 로컬에서 실행
scp -i your-key.pem docker-compose.celery.yml ubuntu@CELERY_EC2_IP:~/hadbetter/
```

**.env.celery 파일 생성:**
```bash
# EC2에서 실행
# Django EC2의 Private IP 확인 필요!
cat > ~/hadbetter/.env.celery << 'EOF'
ECR_REGISTRY=123456789012.dkr.ecr.ap-northeast-2.amazonaws.com
IMAGE_TAG=latest
DJANGO_SECRET_KEY=your-secret-key
DJANGO_EC2_PRIVATE_IP=10.0.1.100
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=hadbetter
DB_USER=postgres
DB_PASSWORD=your-db-password
REDIS_URL=redis://your-redis:6379/0
RABBITMQ_USER=admin
RABBITMQ_PASS=your-rabbitmq-password
EOF

# 심볼릭 링크 생성
ln -s .env.celery .env
```

- [ ] Docker 설치 완료
- [ ] docker-compose.celery.yml 업로드
- [ ] .env.celery 파일 생성 및 설정
- [ ] Django EC2의 Private IP 확인 및 설정

## 3. GitHub Secrets 설정

GitHub 레포지토리 → Settings → Secrets and variables → Actions

### AWS 관련
- [ ] `AWS_ACCESS_KEY_ID`: IAM Access Key
- [ ] `AWS_SECRET_ACCESS_KEY`: IAM Secret Key
- [ ] `ECR_REGISTRY`: ECR 레포지토리 URI (예: `123456789012.dkr.ecr.ap-northeast-2.amazonaws.com`)

### Django EC2
- [ ] `EC2_DJANGO_HOST`: Django EC2 Public IP 또는 도메인
- [ ] `EC2_DJANGO_USER`: `ubuntu` (또는 `ec2-user`)
- [ ] `EC2_DJANGO_SSH_KEY`: SSH Private Key 전체 내용 (-----BEGIN ... END-----)

### Celery EC2
- [ ] `EC2_CELERY_HOST`: Celery EC2 Public IP 또는 도메인
- [ ] `EC2_CELERY_USER`: `ubuntu` (또는 `ec2-user`)
- [ ] `EC2_CELERY_SSH_KEY`: SSH Private Key 전체 내용

## 4. 수동 초기 배포 (GitHub Actions 전)

### Django EC2에서

```bash
cd ~/hadbetter

# ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin YOUR_ECR_REGISTRY

# 초기 이미지 빌드 및 푸시 (로컬에서 한 번만)
# 또는 GitHub Actions CI에서 빌드된 이미지 사용

# 컨테이너 시작
docker-compose -f docker-compose.django.yml up -d

# 로그 확인
docker-compose -f docker-compose.django.yml logs -f
```

### Celery EC2에서

```bash
cd ~/hadbetter

# ECR 로그인
aws ecr get-login-password --region ap-northeast-2 | \
  docker login --username AWS --password-stdin YOUR_ECR_REGISTRY

# 컨테이너 시작
docker-compose -f docker-compose.celery.yml up -d

# 로그 확인
docker-compose -f docker-compose.celery.yml logs -f
```

- [ ] Django 서버 정상 실행 확인
- [ ] Celery Worker 정상 실행 확인
- [ ] RabbitMQ 연결 확인
- [ ] RDS 연결 확인

## 5. 테스트

### API 테스트
```bash
# Django EC2 Public IP로 테스트
curl http://DJANGO_EC2_IP/api/

# 도메인으로 테스트 (DNS 설정 후)
curl http://api.your-domain.com/api/
```

### RabbitMQ 관리 콘솔
```
http://DJANGO_EC2_IP:15672
ID: admin
PW: your-rabbitmq-password
```

- [ ] API 응답 확인
- [ ] RabbitMQ 관리 콘솔 접속 확인
- [ ] Celery Task 실행 확인

## 6. GitHub Actions 배포 테스트

```bash
# main 브랜치에 push
git checkout main
git pull origin main
git merge feat/backend-cd
git push origin main
```

- [ ] GitHub Actions 워크플로우 실행 확인
- [ ] ECR 이미지 푸시 성공 확인
- [ ] Django EC2 배포 성공 확인
- [ ] Celery EC2 배포 성공 확인

## 7. 모니터링 및 로그 확인

### Django EC2
```bash
# 컨테이너 상태
docker ps

# Backend 로그
docker logs hadbetter-backend -f

# Traefik 로그
docker logs hadbetter-traefik -f

# RabbitMQ 로그
docker logs hadbetter-rabbitmq -f
```

### Celery EC2
```bash
# Celery Worker 로그
docker logs hadbetter-celery-worker -f

# Celery Beat 로그
docker logs hadbetter-celery-beat -f
```

## 8. DNS 및 도메인 설정 (선택)

- [ ] Route 53 또는 도메인 제공자에서 A 레코드 설정
  - `api.your-domain.com` → Django EC2 Public IP
- [ ] SSL 인증서 설정 (Let's Encrypt 또는 AWS ACM)

## 문제 해결

### Celery가 RabbitMQ에 연결 안 될 때
1. Django EC2 보안 그룹 5672 포트 확인
2. `.env.celery`의 `DJANGO_EC2_PRIVATE_IP` 확인 (Public IP 아님!)
3. `docker logs hadbetter-rabbitmq` 확인

### DB 연결 안 될 때
1. RDS 보안 그룹 확인
2. RDS 엔드포인트 주소 확인
3. `.env` 파일의 DB 자격 증명 확인

### 502 Bad Gateway
1. Backend 컨테이너 상태 확인: `docker ps`
2. Backend 로그 확인: `docker logs hadbetter-backend`
3. 환경 변수 누락 확인

## 완료!

모든 체크리스트가 완료되면 배포 준비 완료입니다! 🚀
