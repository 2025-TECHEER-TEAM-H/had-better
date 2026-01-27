"""
사용자 관련 URL 설정

[엔드포인트 목록]
GET/PATCH /api/v1/users                        - 내 정보 조회/수정
GET       /api/v1/users/stats                  - 내 통계 조회
GET/DEL   /api/v1/users/place-history          - 장소 검색 기록 조회/전체삭제
DELETE    /api/v1/users/place-history/{id}     - 장소 검색 기록 개별삭제
GET/DEL   /api/v1/users/itinerary-history      - 경로 검색 기록 조회/전체삭제
DELETE    /api/v1/users/itinerary-history/{id} - 경로 검색 기록 개별삭제
"""

from django.urls import path

from ..views import (
    ItineraryHistoryDetailView,
    ItineraryHistoryListView,
    PlaceHistoryDetailView,
    PlaceHistoryListView,
    UserStatsView,
)

urlpatterns = [
    # 내 정보: GET/PATCH /api/v1/users는 config/urls.py에서 직접 정의
    # 내 통계 조회
    path("stats", UserStatsView.as_view(), name="user-stats"),
    # 장소 검색 기록
    path(
        "place-history", PlaceHistoryListView.as_view(), name="place-history-list"
    ),  # 장소 검색 조회 / 전체 삭제
    path(
        "place-history/<int:pk>",
        PlaceHistoryDetailView.as_view(),
        name="place-history-detail",
    ),  # 개별 삭제
    # 경로 검색 기록
    path(
        "itinerary-history",
        ItineraryHistoryListView.as_view(),
        name="itinerary-history-list",
    ),  # 경로 검색 조회 / 전체 삭제
    path(
        "itinerary-history/<int:pk>",
        ItineraryHistoryDetailView.as_view(),
        name="itinerary-history-detail",
    ),  # 개별 삭제
]
