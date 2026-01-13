"""
인증 관련 URL 설정
"""

from django.urls import path

urlpatterns = [
    # POST /api/v1/auth/register - 회원가입
    # POST /api/v1/auth/login - 로그인
    # POST /api/v1/auth/refresh - 토큰 갱신
    # POST /api/v1/auth/logout - 로그아웃
]
