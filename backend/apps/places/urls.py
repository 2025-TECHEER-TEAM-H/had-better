"""
장소 관련 URL 설정
"""

from django.urls import path  # noqa: I001

from .views import (
    PlaceDetailView,
    PlaceSearchView,
    SearchPlaceHistoryDetailView,
    SearchPlaceHistoryListView,
)

urlpatterns = [
    # 장소 검색 / 상세
    path("search", PlaceSearchView.as_view(), name="place-search"),
    path("<int:poi_place_id>", PlaceDetailView.as_view(), name="place-detail"),
    # 장소 검색 기록
    path(
        "search-histories",
        SearchPlaceHistoryListView.as_view(),
        name="place-search-history-list",
    ),
    path(
        "search-histories/<int:history_id>",
        SearchPlaceHistoryDetailView.as_view(),
        name="place-search-history-detail",
    ),
]
