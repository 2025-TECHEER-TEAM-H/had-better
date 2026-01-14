"""
사용자 및 인증 관련 Serializer
"""

import re

from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import PlaceSearchHistory, User


class UserSerializer(serializers.ModelSerializer):
    """
    사용자 정보 Serializer
    """

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'nickname', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


# ============================================
# Claude Code 구현 - 내 정보 수정용 Serializer
# ============================================
# [학습 포인트]
# 1. ModelSerializer: Model 기반으로 자동 필드 생성
# 2. fields: 수정 가능한 필드만 지정 (nickname만 수정 가능)
# 3. PATCH 요청에서 partial=True와 함께 사용
# ============================================
class UserUpdateSerializer(serializers.ModelSerializer):
    """
    내 정보 수정 Serializer

    PATCH /api/v1/users 요청 시 사용

    Request:
    {
        "nickname": "새로운닉네임"
    }
    """

    class Meta:
        model = User
        fields = ['nickname']  # 수정 가능한 필드만 지정


class RegisterSerializer(serializers.Serializer):
    """
    회원가입 Serializer

    Request:
    {
        "name": "racer_king",
        "email": "user@example.com",
        "password": "securePassword123!",
        "password_confirm": "securePassword123!",
        "nickname": "레이서킹"
    }
    """

    name = serializers.CharField(
        max_length=50,
        help_text='유저 ID (고유, 영문/숫자/언더스코어)'
    )
    email = serializers.EmailField(
        help_text='이메일 (로그인용)'
    )
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        help_text='비밀번호 (최소 8자)'
    )
    password_confirm = serializers.CharField(
        write_only=True,
        help_text='비밀번호 확인'
    )
    nickname = serializers.CharField(
        max_length=50,
        help_text='닉네임 (표시용)'
    )

    def validate_name(self, value):
        """
        name 유효성 검사: 영문, 숫자, 언더스코어만 허용
        """
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError(
                '유저 ID는 영문, 숫자, 언더스코어만 사용 가능합니다.'
            )

        if User.objects.filter(name=value).exists():
            raise serializers.ValidationError('이미 사용 중인 유저 ID입니다.')

        return value

    def validate_email(self, value):
        """
        email 중복 검사
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('이미 등록된 이메일입니다.')

        return value

    def validate(self, attrs):
        """
        비밀번호 일치 검사
        """
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': '비밀번호가 일치하지 않습니다.'
            })

        return attrs

    def create(self, validated_data):
        """
        사용자 생성 및 토큰 발급
        """
        validated_data.pop('password_confirm')

        user = User.objects.create_user(
            name=validated_data['name'],
            email=validated_data['email'],
            password=validated_data['password'],
            nickname=validated_data['nickname']
        )

        refresh = RefreshToken.for_user(user)

        return {
            'user': user,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }


class LoginSerializer(serializers.Serializer):
    """
    로그인 Serializer

    Request:
    {
        "name": "racer_king",
        "password": "securePassword123!"
    }
    """

    name = serializers.CharField(help_text='유저 ID')
    password = serializers.CharField(write_only=True, help_text='비밀번호')

    def validate(self, attrs):
        """
        인증 처리
        """
        name = attrs.get('name')
        password = attrs.get('password')

        user = authenticate(username=name, password=password)

        if user is None:
            raise serializers.ValidationError({
                'detail': '유저 ID 또는 비밀번호가 올바르지 않습니다.'
            })

        if not user.is_active:
            raise serializers.ValidationError({
                'detail': '비활성화된 계정입니다.'
            })

        # 로그인 시간 업데이트
        user.last_login_date = timezone.now()
        user.save(update_fields=['last_login_date'])

        attrs['user'] = user
        return attrs

    def create(self, validated_data):
        """
        토큰 발급
        """
        user = validated_data['user']
        refresh = RefreshToken.for_user(user)

        return {
            'user': user,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh)
            }
        }


class TokenRefreshSerializer(serializers.Serializer):
    """
    토큰 갱신 Serializer

    Request:
    {
        "refresh": "eyJhbGciOiJIUzI1NiIs..."
    }
    """

    refresh = serializers.CharField(help_text='Refresh Token')

    def validate(self, attrs):
        """
        Refresh Token 유효성 검사 및 새 Access Token 발급
        """
        try:
            refresh = RefreshToken(attrs['refresh'])
            attrs['access'] = str(refresh.access_token)
        except Exception:
            raise serializers.ValidationError({
                'refresh': '유효하지 않거나 만료된 토큰입니다.'
            })

        return attrs


class LogoutSerializer(serializers.Serializer):
    """
    로그아웃 Serializer

    Request:
    {
        "refresh": "eyJhbGciOiJIUzI1NiIs..."
    }
    """

    refresh = serializers.CharField(help_text='Refresh Token')

    def validate(self, attrs):
        """
        Refresh Token 유효성 검사
        """
        try:
            self.token = RefreshToken(attrs['refresh'])
        except Exception:
            raise serializers.ValidationError({
                'refresh': '유효하지 않은 토큰입니다.'
            })

        return attrs

    def save(self, **kwargs):
        """
        Refresh Token을 블랙리스트에 추가
        """
        self.token.blacklist()


# ============================================
# Claude Code 구현 - 장소 검색 기록 Serializer
# ============================================
# [학습 포인트]
# 1. ModelSerializer: PlaceSearchHistory 모델 기반 자동 직렬화
# 2. fields: API 응답에 포함할 필드 지정
# 3. read_only_fields: 클라이언트가 수정할 수 없는 필드 (id, 시간은 서버에서 자동 생성)
# 4. user 필드는 제외: JWT 토큰에서 사용자 정보를 가져오므로 응답에 불필요
# ============================================
class PlaceSearchHistorySerializer(serializers.ModelSerializer):
    """
    장소 검색 기록 Serializer

    GET /api/v1/users/place-history 응답에 사용

    Response:
    {
        "id": 1,
        "keyword": "강남역",
        "searched_at": "2026-01-12T10:00:00+09:00"
    }
    """

    class Meta:
        model = PlaceSearchHistory
        fields = ['id', 'keyword', 'searched_at']  # user는 제외 (JWT에서 가져옴)
        read_only_fields = ['id', 'searched_at']  # 서버에서 자동 생성되는 필드
