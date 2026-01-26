"""
사용자 및 인증 관련 Serializer
"""

import re

from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import serializers

from rest_framework_simplejwt.tokens import RefreshToken

from apps.places.models import SearchPlaceHistory

from .models import User


def to_seoul_time(dt):
    """datetime을 서울 시간대로 변환하여 ISO 형식 반환"""
    if dt is None:
        return None
    return timezone.localtime(dt).isoformat()


class UserSerializer(serializers.ModelSerializer):
    """
    사용자 정보 Serializer
    """

    created_at = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "name", "email", "nickname", "created_at", "updated_at"]
        read_only_fields = ["id"]

    def get_created_at(self, obj):
        return to_seoul_time(obj.created_at)

    def get_updated_at(self, obj):
        return to_seoul_time(obj.updated_at)


# ============================================
# 내 정보 수정용 Serializer
# ============================================
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
        fields = ["nickname"]  # 수정 가능한 필드만 지정


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
        max_length=50, help_text="유저 ID (고유, 영문/숫자/언더스코어)"
    )
    email = serializers.EmailField(help_text="이메일 (로그인용)")
    password = serializers.CharField(
        write_only=True, min_length=8, help_text="비밀번호 (최소 8자)"
    )
    password_confirm = serializers.CharField(write_only=True, help_text="비밀번호 확인")
    nickname = serializers.CharField(max_length=50, help_text="닉네임 (표시용)")

    def validate_name(self, value):
        """
        name 유효성 검사: 영문, 숫자, 언더스코어만 허용
        """
        if not re.match(r"^[a-zA-Z0-9_]+$", value):
            raise serializers.ValidationError(
                "유저 ID는 영문, 숫자, 언더스코어만 사용 가능합니다."
            )

        if User.objects.filter(name=value).exists():
            raise serializers.ValidationError("이미 사용 중인 유저 ID입니다.")

        return value

    def validate_email(self, value):
        """
        email 중복 검사
        """
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("이미 등록된 이메일입니다.")

        return value

    def validate(self, attrs):
        """
        비밀번호 일치 검사
        """
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "비밀번호가 일치하지 않습니다."}
            )

        return attrs

    def create(self, validated_data):
        """
        사용자 생성 및 토큰 발급
        """
        validated_data.pop("password_confirm")

        user = User.objects.create_user(
            name=validated_data["name"],
            email=validated_data["email"],
            password=validated_data["password"],
            nickname=validated_data["nickname"],
        )

        refresh = RefreshToken.for_user(user)

        return {
            "user": user,
            "tokens": {"access": str(refresh.access_token), "refresh": str(refresh)},
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

    name = serializers.CharField(help_text="유저 ID")
    password = serializers.CharField(write_only=True, help_text="비밀번호")

    def validate(self, attrs):
        """
        인증 처리
        """
        name = attrs.get("name")
        password = attrs.get("password")

        user = authenticate(username=name, password=password)

        if user is None:
            raise serializers.ValidationError(
                {"detail": "유저 ID 또는 비밀번호가 올바르지 않습니다."}
            )

        if not user.is_active:
            raise serializers.ValidationError({"detail": "비활성화된 계정입니다."})

        # 로그인 시간 업데이트
        user.last_login_date = timezone.now()
        user.save(update_fields=["last_login_date"])

        attrs["user"] = user
        return attrs

    def create(self, validated_data):
        """
        토큰 발급
        """
        user = validated_data["user"]
        refresh = RefreshToken.for_user(user)

        return {
            "user": user,
            "tokens": {"access": str(refresh.access_token), "refresh": str(refresh)},
        }


class TokenRefreshSerializer(serializers.Serializer):
    """
    토큰 갱신 Serializer

    Request:
    {
        "refresh": "eyJhbGciOiJIUzI1NiIs..."
    }
    """

    refresh = serializers.CharField(help_text="Refresh Token")

    def validate(self, attrs):
        """
        Refresh Token 유효성 검사 및 새 Access Token 발급
        """
        try:
            refresh = RefreshToken(attrs["refresh"])
            attrs["access"] = str(refresh.access_token)
        except Exception:
            raise serializers.ValidationError(
                {"refresh": "유효하지 않거나 만료된 토큰입니다."}
            )

        return attrs


class LogoutSerializer(serializers.Serializer):
    """
    로그아웃 Serializer

    Request:
    {
        "refresh": "eyJhbGciOiJIUzI1NiIs..."
    }
    """

    refresh = serializers.CharField(help_text="Refresh Token")

    def validate(self, attrs):
        """
        Refresh Token 유효성 검사
        """
        try:
            self.token = RefreshToken(attrs["refresh"])
        except Exception:
            raise serializers.ValidationError({"refresh": "유효하지 않은 토큰입니다."})

        return attrs

    def save(self, **kwargs):
        """
        Refresh Token을 블랙리스트에 추가
        """
        self.token.blacklist()


class SearchPlaceHistorySerializer(serializers.ModelSerializer):
    """
    장소 검색 기록 Serializer

    GET /api/v1/users/place-history 응답에 사용

    Response:
    {
        "id": 1,
        "keyword": "강남역",
        "created_at": "2026-01-12T10:00:00+09:00"
    }
    """

    created_at = serializers.SerializerMethodField()

    class Meta:
        model = SearchPlaceHistory
        fields = ["id", "keyword", "created_at"]
        read_only_fields = ["id"]

    def get_created_at(self, obj):
        return to_seoul_time(obj.created_at)


# ============================================
# 경로 검색 기록 Serializer (2026-01-14)
# ============================================
# 1. SerializerMethodField: 커스텀 필드 생성 (departure, arrival 중첩 객체)
# 2. source='created_at': DB 필드명과 다른 API 필드명 사용 시
# 3. 중첩 객체 형태: { "departure": { "name": "강남역" } }
# ============================================
class ItineraryHistorySerializer(serializers.Serializer):
    """
    경로 검색 기록 Serializer

    GET /api/v1/users/itinerary-history 응답에 사용

    #API 명세서 상 응답 방식 예시
    Response:
    {
        "id": 1,
        "departure": { "name": "강남역" },
        "arrival": { "name": "홍대입구역" },
        "searched_at": "2026-01-12T10:00:00+09:00"
    }
    """

    # 검색 기록 ID (DB의 primary key)
    id = serializers.IntegerField(read_only=True)

    # SerializerMethodField: 아래 get_departure() 메서드가 반환하는 값을 사용
    # 결과: {"name": "강남역"} 형태의 중첩 객체
    departure = serializers.SerializerMethodField()
    arrival = serializers.SerializerMethodField()

    # source="created_at": DB 필드명은 created_at이지만, API 응답에서는 searched_at으로 표시
    searched_at = serializers.SerializerMethodField()

    def get_departure(self, obj):
        """
        SerializerMethodField가 호출하는 메서드
        obj: SearchItineraryHistory 모델 인스턴스
        obj.departure_name: DB에 저장된 출발지 이름 (예: "강남역")
        반환값: {"name": "강남역"}
        """
        return {"name": obj.departure_name}

    def get_arrival(self, obj):
        """
        obj.arrival_name: DB에 저장된 도착지 이름 (예: "홍대입구역")
        반환값: {"name": "홍대입구역"}
        """
        return {"name": obj.arrival_name}

    def get_searched_at(self, obj):
        """created_at을 한국 시간대로 변환"""
        return to_seoul_time(obj.created_at)
