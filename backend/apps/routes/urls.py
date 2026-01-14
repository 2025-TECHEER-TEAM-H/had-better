"""
경주 관련 URL 설정
"""

from django.urls import path

from .views import RouteListCreateView

urlpatterns = [
    # POST /api/v1/routes - 경주 생성
    # GET /api/v1/routes - 경주 목록 조회
    path('', RouteListCreateView.as_view(), name='route-list-create'),

    # PATCH /api/v1/routes/{route_id} - 경주 상태 변경 (종료/취소)
    # GET /api/v1/routes/{route_id}/result - 경주 결과 조회
]
