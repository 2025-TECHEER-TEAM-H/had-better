"""
HAD BETTER URL Configuration

REST API 규칙 준수: 모든 URI 끝에 trailing slash 사용하지 않음
"""

from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from apps.users.views import UserMeView
from apps.places.views_saved import SavedPlaceListCreateView
from apps.routes.views import RouteListCreateView
from apps.routes.urls import sse_urlpatterns as routes_sse_urlpatterns

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # API v1 - 인증 (trailing slash 없음)
    path('api/v1/auth/', include('apps.users.urls.auth_urls')),

    # API v1 - 사용자
    path('api/v1/users', UserMeView.as_view(), name='user-me'),  # GET/PATCH /api/v1/users
    path('api/v1/users/', include('apps.users.urls.user_urls')),  # 하위 경로들

    # API v1 - 장소
    path('api/v1/places/', include('apps.places.urls')),

    # API v1 - 즐겨찾기
    path('api/v1/saved-places', SavedPlaceListCreateView.as_view(), name='saved-place-list'),  # GET/POST /api/v1/saved-places
    path('api/v1/saved-places/', include('apps.places.urls_saved')),  # 하위 경로들

    # API v1 - 경로 검색
    path('api/v1/itineraries/', include('apps.itineraries.urls')),

    # API v1 - 경주
    path('api/v1/routes', RouteListCreateView.as_view(), name='route-list'),  # GET/POST /api/v1/routes
    path('api/v1/routes/', include('apps.routes.urls')),  # 하위 경로들

    # API v1 - SSE 스트림
    path('api/v1/sse/routes/', include(routes_sse_urlpatterns)),

    # API 문서
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
