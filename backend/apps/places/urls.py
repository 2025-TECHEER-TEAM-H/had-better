"""
장소 검색 관련 URL 설정
"""

from django.urls import path  # noqa: I001
from .views import PlaceSearchView, PlaceDetailView

urlpatterns = [
    path("search", PlaceSearchView.as_view(), name="place-search"),
    path("<int:poi_place_id>", PlaceDetailView.as_view(), name="place-detail"),
]
