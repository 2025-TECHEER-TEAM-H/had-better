"""
사용자 관련 모델
"""

from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.db import models


class UserManager(BaseUserManager):
    """
    커스텀 사용자 매니저
    """

    def create_user(self, name, email, password=None, **extra_fields):
        """
        일반 사용자 생성
        """
        if not name:
            raise ValueError("사용자 ID(name)는 필수입니다.")
        if not email:
            raise ValueError("이메일은 필수입니다.")

        email = self.normalize_email(email)
        user = self.model(name=name, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, name, email, password=None, **extra_fields):
        """
        슈퍼유저 생성
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("슈퍼유저는 is_staff=True 이어야 합니다.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("슈퍼유저는 is_superuser=True 이어야 합니다.")

        return self.create_user(name, email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    커스텀 사용자 모델

    PRD 기반 필드:
    - name: 사용자 ID (고유, 영문/숫자/언더스코어)
    - email: 이메일 (로그인용)
    - nickname: 닉네임 (표시용)
    - type: 사용자 유형 (일반/소셜)
    """

    class UserType(models.TextChoices):
        NORMAL = "normal", "일반"
        SOCIAL = "social", "소셜"

    name = models.CharField(
        max_length=50,
        unique=True,
        verbose_name="사용자 ID",
        help_text="영문, 숫자, 언더스코어만 사용 가능",
    )
    email = models.EmailField(unique=True, verbose_name="이메일")
    nickname = models.CharField(max_length=50, verbose_name="닉네임")
    type = models.CharField(
        max_length=20,
        choices=UserType.choices,
        default=UserType.NORMAL,
        verbose_name="사용자 유형",
    )

    # Django 기본 필드
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # 타임스탬프
    last_login_date = models.DateTimeField(
        null=True, blank=True, verbose_name="최근 로그인 일시"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일시")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일시")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="삭제일시")

    objects = UserManager()

    USERNAME_FIELD = "name"
    REQUIRED_FIELDS = ["email", "nickname"]

    class Meta:
        db_table = "user"
        verbose_name = "사용자"
        verbose_name_plural = "사용자 목록"

    def __str__(self):
        return f"{self.nickname} ({self.name})"
