"""
경주 관련 URL 설정
"""

from django.urls import path

from .views import RouteListCreateView, RouteStatusUpdateView, RouteResultView

urlpatterns = [
    # GET/POST /api/v1/routes는 config/urls.py에서 직접 정의

    # PATCH /api/v1/routes/{route_id} - 경주 상태 변경 (종료/취소)
    path('<int:route_id>', RouteStatusUpdateView.as_view(), name='route-status-update'),

    # GET /api/v1/routes/{route_id}/result - 경주 결과 조회
    path('<int:route_id>/result', RouteResultView.as_view(), name='route-result'),
]
