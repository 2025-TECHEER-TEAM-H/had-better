# Backend 테스트 가이드

## 테스트 도구

- **pytest**: Python 테스트 프레임워크 (ASGI 지원)
- **pytest-django**: Django 통합
- **pytest-asyncio**: 비동기 테스트 지원 (SSE 테스트용)
- **pytest-cov**: 코드 커버리지 측정

## 로컬에서 테스트 실행

### 1. 의존성 설치

```bash
cd backend
source venv/bin/activate  # Mac/Linux
# 또는
./venv/Scripts/activate   # Windows

pip install -r requirements.txt
```

### 2. 테스트 실행

```bash
# 전체 테스트 실행
pytest

# 특정 앱 테스트
pytest apps/users

# 특정 파일 테스트
pytest apps/users/tests.py

# 특정 테스트 함수
pytest apps/users/tests.py::test_user_creation

# 커버리지 포함
pytest --cov=apps --cov-report=html
```

### 3. 스크립트 사용 (권장)

```bash
# 테스트 + 커버리지
./scripts/test.sh

# 린트 검사
./scripts/lint.sh

# 자동 포맷팅
./scripts/format.sh
```

## 테스트 작성 예시

### 일반 API 테스트

```python
# apps/users/tests.py
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.mark.django_db
def test_user_registration():
    """사용자 회원가입 테스트"""
    client = APIClient()

    response = client.post('/api/v1/auth/register', {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'testpass123'
    })

    assert response.status_code == 201
    assert User.objects.filter(username='testuser').exists()
```

### 비동기/SSE 테스트

```python
# apps/routes/test_sse.py
import pytest
from django.test import AsyncClient

@pytest.mark.asyncio
@pytest.mark.django_db
async def test_sse_stream():
    """SSE 스트림 엔드포인트 테스트"""
    client = AsyncClient()

    response = await client.get('/api/v1/sse/routes/1')

    assert response.status_code == 200
    assert response['Content-Type'] == 'text/event-stream'
```

### Fixture 사용

```python
# apps/conftest.py
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def test_user():
    """테스트용 사용자"""
    return User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123'
    )

@pytest.fixture
def authenticated_client(test_user):
    """인증된 API 클라이언트"""
    from rest_framework.test import APIClient
    from rest_framework_simplejwt.tokens import RefreshToken

    client = APIClient()
    refresh = RefreshToken.for_user(test_user)
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return client


# 사용 예시
@pytest.mark.django_db
def test_protected_endpoint(authenticated_client):
    response = authenticated_client.get('/api/v1/users/me')
    assert response.status_code == 200
```

## CI에서 자동 실행

PR을 `main` 또는 `develop` 브랜치에 올리면 자동으로:

1. ✅ 린트 검사 (black, isort, flake8)
2. ✅ Django 설정 검사
3. ✅ 마이그레이션 체크
4. ✅ pytest 테스트 실행 (PostgreSQL + Redis 환경)
5. ✅ 코드 커버리지 측정

## 유용한 pytest 옵션

```bash
# 실패한 테스트만 재실행
pytest --lf

# 느린 테스트 제외
pytest -m "not slow"

# 병렬 실행 (pytest-xdist 설치 필요)
pytest -n auto

# 상세한 출력
pytest -vv

# 특정 마커만 실행
pytest -m integration
```

## 트러블슈팅

### 테스트 DB 권한 오류

```bash
# PostgreSQL 접속
psql -U postgres

# 테스트 DB 생성 권한 부여
ALTER USER postgres CREATEDB;
```

### 비동기 테스트 오류

`pytest.ini_options`에 `asyncio_mode = "auto"` 설정 필요 (이미 설정됨)

### 커버리지 리포트 안보임

```bash
# HTML 리포트 생성
pytest --cov=apps --cov-report=html

# 브라우저로 htmlcov/index.html 열기
open htmlcov/index.html
```

## 참고 자료

- [pytest 공식 문서](https://docs.pytest.org/)
- [pytest-django](https://pytest-django.readthedocs.io/)
- [pytest-asyncio](https://pytest-asyncio.readthedocs.io/)
