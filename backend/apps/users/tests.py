import pytest
from django.contrib.auth import get_user_model

User = get_user_model()


@pytest.mark.django_db
def test_user_creation():
    """사용자 생성 테스트"""
    user = User.objects.create_user(
        name="testuser",
        email="test@example.com",
        nickname="테스트유저",
        password="testpass123",
    )
    assert user.name == "testuser"
    assert user.email == "test@example.com"
    assert user.nickname == "테스트유저"
    assert user.check_password("testpass123")


@pytest.mark.django_db
def test_user_str():
    """사용자 문자열 표현 테스트"""
    user = User.objects.create_user(
        name="testuser2",
        email="test2@example.com",
        nickname="테스트유저2",
        password="testpass123",
    )
    assert str(user) == "테스트유저2 (testuser2)"
