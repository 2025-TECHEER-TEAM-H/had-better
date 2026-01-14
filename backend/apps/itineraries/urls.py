"""
경로 검색 관련 URL 설정
"""

from django.urls import path

from .views import (
    RouteLegDetailView,
    RouteSearchView,
    SearchItineraryHistoryDetailView,
)

urlpatterns = [
    # POST /api/v1/itineraries/search - 경로 검색
    path('search', RouteSearchView.as_view(), name='route-search'),

    # GET /api/v1/itineraries/search/{search_itinerary_history_id} - 경로 검색 결과 조회
    path(
        'search/<int:search_itinerary_history_id>',
        SearchItineraryHistoryDetailView.as_view(),
        name='search-itinerary-history-detail'
    ),

    # GET /api/v1/itineraries/legs/{route_leg_id} - 개별 경로 상세 조회
    path(
        'legs/<int:route_leg_id>',
        RouteLegDetailView.as_view(),
        name='route-leg-detail'
    ),
]
