"""
사용자 및 인증 관련 View
"""

from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView

from config.responses import success_response

from .serializers import (
    LoginSerializer,
    LogoutSerializer,
    RegisterSerializer,
    TokenRefreshSerializer,
    UserSerializer,
)


@extend_schema_view(
    post=extend_schema(
        summary='회원가입',
        description='새로운 사용자를 등록하고 JWT 토큰을 발급합니다.',
        tags=['인증'],
        request=RegisterSerializer,
        responses={201: None}
    )
)
class RegisterView(APIView):
    """
    회원가입 API

    POST /api/v1/auth/register
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()

        return success_response(
            data={
                'user': UserSerializer(result['user']).data,
                'tokens': result['tokens']
            },
            status=status.HTTP_201_CREATED
        )


@extend_schema_view(
    post=extend_schema(
        summary='로그인',
        description='유저 ID와 비밀번호로 로그인하고 JWT 토큰을 발급합니다.',
        tags=['인증'],
        request=LoginSerializer,
        responses={200: None}
    )
)
class LoginView(APIView):
    """
    로그인 API

    POST /api/v1/auth/login
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = serializer.save()

        return success_response(
            data={
                'user': UserSerializer(result['user']).data,
                'tokens': result['tokens']
            },
            status=status.HTTP_200_OK
        )


@extend_schema_view(
    post=extend_schema(
        summary='토큰 갱신',
        description='Refresh Token으로 새로운 Access Token을 발급합니다.',
        tags=['인증'],
        request=TokenRefreshSerializer,
        responses={200: None}
    )
)
class TokenRefreshView(APIView):
    """
    토큰 갱신 API

    POST /api/v1/auth/refresh
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = TokenRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return success_response(
            data={
                'access': serializer.validated_data['access']
            },
            status=status.HTTP_200_OK
        )


@extend_schema_view(
    post=extend_schema(
        summary='로그아웃',
        description='Refresh Token을 블랙리스트에 추가하여 무효화합니다.',
        tags=['인증'],
        request=LogoutSerializer,
        responses={200: None}
    )
)
class LogoutView(APIView):
    """
    로그아웃 API

    POST /api/v1/auth/logout
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return success_response(
            data={
                'message': '로그아웃 되었습니다.'
            },
            status=status.HTTP_200_OK
        )
