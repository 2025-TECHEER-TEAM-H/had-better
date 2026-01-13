"""
즐겨찾기 장소 관련 URL 설정
"""

from django.urls import path

urlpatterns = [
    # GET /api/v1/saved-places - 즐겨찾기 목록 조회
    # POST /api/v1/saved-places - 즐겨찾기 추가
    # DELETE /api/v1/saved-places/{saved_place_id} - 즐겨찾기 삭제
    # PATCH /api/v1/saved-places/{saved_place_id} - 즐겨찾기 수정
]
