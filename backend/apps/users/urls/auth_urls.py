"""
인증 관련 URL 설정

/api/v1/auth/
"""

from django.urls import path

from apps.users.views import LoginView, LogoutView, RegisterView, TokenRefreshView

urlpatterns = [
    # POST /api/v1/auth/register - 회원가입
    path("register", RegisterView.as_view(), name="register"),
    # POST /api/v1/auth/login - 로그인
    path("login", LoginView.as_view(), name="login"),
    # POST /api/v1/auth/refresh - 토큰 갱신
    path("refresh", TokenRefreshView.as_view(), name="token_refresh"),
    # POST /api/v1/auth/logout - 로그아웃
    path("logout", LogoutView.as_view(), name="logout"),
]
