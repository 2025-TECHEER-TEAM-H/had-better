"""
사용자 관련 URL 설정
"""

from django.urls import path

urlpatterns = [
    # GET /api/v1/users - 내 정보 조회
    # PATCH /api/v1/users - 내 정보 수정
    # GET /api/v1/users/stats - 내 통계 조회
    # GET /api/v1/users/place-history - 장소 검색 기록 조회
    # DELETE /api/v1/users/place-history - 장소 검색 기록 전체 삭제
    # DELETE /api/v1/users/place-history/{id} - 장소 검색 기록 개별 삭제
    # GET /api/v1/users/itinerary-history - 경로 검색 기록 조회
    # DELETE /api/v1/users/itinerary-history - 경로 검색 기록 전체 삭제
    # DELETE /api/v1/users/itinerary-history/{id} - 경로 검색 기록 개별 삭제
]
