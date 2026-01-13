"""
경주 관련 URL 설정
"""

from django.urls import path

urlpatterns = [
    # POST /api/v1/routes - 경주 생성
    # GET /api/v1/routes - 경주 목록 조회
    # PATCH /api/v1/routes/{route_id} - 경주 상태 변경 (시작/종료/취소)
    # GET /api/v1/routes/{route_id}/result - 경주 결과 조회
]
