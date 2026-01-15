"""
즐겨찾기(Saved Places) 관련 URL 설정

API 엔드포인트:
- GET    /api/v1/saved-places              - 즐겨찾기 목록 조회
- POST   /api/v1/saved-places              - 즐겨찾기 추가
- DELETE /api/v1/saved-places/{id}         - 즐겨찾기 삭제 (Soft Delete)
- PATCH  /api/v1/saved-places/{id}         - 즐겨찾기 수정
"""

from django.urls import path
from .views_saved import SavedPlaceListCreateView, SavedPlaceDetailView

urlpatterns = [
    # GET/POST /api/v1/saved-places는 config/urls.py에서 직접 정의
    path("<int:saved_place_id>", SavedPlaceDetailView.as_view(), name="saved-place-detail"),
]