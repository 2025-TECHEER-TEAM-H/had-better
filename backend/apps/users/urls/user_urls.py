"""
사용자 관련 URL 설정

1. Django URL 패턴 작성법
2. path() 함수: URL 경로와 View 연결
3. <int:pk>: URL에서 정수형 파라미터 추출
4. .as_view(): 클래스 기반 뷰를 함수로 변환
5. name: URL 역참조용 이름 (템플릿에서 {% url 'name' %} 사용)
"""

from django.urls import path

# View 클래스 임포트
from ..views import PlaceHistoryDetailView, PlaceHistoryListView, UserMeView

# ============================================
# 사용자 API URL
# ============================================
# [URL 구조]
# /api/v1/users/              → UserMeView (GET: 내 정보 조회, PATCH: 수정)
# /api/v1/users/place-history → PlaceHistoryListView (GET: 목록, DELETE: 전체삭제)
# /api/v1/users/place-history/5 → PlaceHistoryDetailView (DELETE: 개별삭제)
# ============================================
urlpatterns = [
    # ============================================
    # 내 정보 API
    # ============================================
    # path(''): /api/v1/users/ 에 매핑 (config/urls.py에서 prefix 설정)
    # GET /api/v1/users - 내 정보 조회
    # PATCH /api/v1/users - 내 정보 수정
    path("", UserMeView.as_view(), name="user-me"),
    # ============================================
    # 장소 검색 기록 API URL
    # ============================================
    # GET /api/v1/users/place-history - 장소 검색 기록 조회
    # DELETE /api/v1/users/place-history - 장소 검색 기록 전체 삭제
    path("place-history", PlaceHistoryListView.as_view(), name="place-history-list"),
    # <int:pk>: URL에서 정수를 추출하여 view의 pk 파라미터로 전달
    # 예: /place-history/5 → pk=5
    # DELETE /api/v1/users/place-history/{id} - 장소 검색 기록 개별 삭제
    path(
        "place-history/<int:pk>",
        PlaceHistoryDetailView.as_view(),
        name="place-history-detail",
    ),
    # TODO: 추후 구현
    # GET /api/v1/users/stats - 내 통계 조회
    # GET /api/v1/users/itinerary-history - 경로 검색 기록 조회
    # DELETE /api/v1/users/itinerary-history - 경로 검색 기록 전체 삭제
    # DELETE /api/v1/users/itinerary-history/{id} - 경로 검색 기록 개별 삭제
]
