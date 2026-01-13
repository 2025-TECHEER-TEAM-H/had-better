"""
경로 검색 관련 URL 설정
"""

from django.urls import path

urlpatterns = [
    # POST /api/v1/itineraries/search - 경로 검색
    # GET /api/v1/itineraries/search/{search_itinerary_history_id} - 경로 검색 결과 조회
    # GET /api/v1/itineraries/legs/{route_leg_id} - 개별 경로 상세 조회
]
