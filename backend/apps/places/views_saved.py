"""
즐겨찾기(Saved Places) 관련 View

API 엔드포인트:
- GET    /api/v1/saved-places              - 즐겨찾기 목록 조회
- POST   /api/v1/saved-places              - 즐겨찾기 추가
- DELETE /api/v1/saved-places/{id}         - 즐겨찾기 삭제 (Soft Delete)
- PATCH  /api/v1/saved-places/{id}         - 즐겨찾기 수정
"""

from django.db import IntegrityError
from django.db.models import Case, IntegerField, Value, When
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_spectacular.types import OpenApiTypes  # 업데이트된 import
from drf_spectacular.utils import OpenApiParameter, extend_schema

from .models import PoiPlace, SavedPlace
from .serializers import (
    SavedPlaceCreateSerializer,
    SavedPlaceDeleteResponseSerializer,
    SavedPlaceListSerializer,
    SavedPlaceResponseSerializer,
    SavedPlaceUpdateSerializer,
)


def to_seoul_time(dt):
    """datetime을 서울 시간대로 변환하여 ISO 형식 반환"""
    if dt is None:
        return None
    return timezone.localtime(dt).isoformat()


def success_response(data, status_code=status.HTTP_200_OK, meta=None):
    """공통 성공 응답 포맷"""
    response = {
        "status": "success",
        "data": data,
    }
    if meta:
        response["meta"] = meta
    return Response(response, status=status_code)


def error_response(code, message, status_code, details=None):
    """공통 에러 응답 포맷"""
    response = {
        "status": "error",
        "error": {
            "code": code,
            "message": message,
        },
    }
    if details:
        response["error"]["details"] = details
    return Response(response, status=status_code)


class SavedPlaceListCreateView(APIView):
    """
    즐겨찾기 목록 조회 및 추가

    GET  /api/v1/saved-places - 목록 조회
    POST /api/v1/saved-places - 추가
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="즐겨찾기 목록 조회",
        description="사용자의 즐겨찾기 장소 목록을 조회합니다. category 파라미터로 필터링 가능합니다.",
        parameters=[
            OpenApiParameter(
                name="category",
                description="카테고리 필터 (콤마 구분: home,work,school)",
                required=False,
                type=OpenApiTypes.STR,
            ),
        ],
        responses={200: SavedPlaceListSerializer(many=True)},
        tags=["Saved Places"],
    )
    def get(self, request):
        """즐겨찾기 목록 조회"""
        user = request.user
        category_filter = request.query_params.get("category")

        # 기본 쿼리: 활성 상태인 즐겨찾기만
        queryset = SavedPlace.objects.filter(
            user=user, deleted_at__isnull=True
        ).select_related("poi_place")

        # 카테고리 필터 적용
        if category_filter:
            categories = [c.strip() for c in category_filter.split(",")]
            queryset = queryset.filter(category__in=categories)

        # 정렬: home → work → school → 기타 (생성일 역순)
        queryset = queryset.annotate(
            category_order=Case(
                When(category="home", then=Value(1)),
                When(category="work", then=Value(2)),
                When(category="school", then=Value(3)),
                default=Value(4),
                output_field=IntegerField(),
            )
        ).order_by("category_order", "-created_at")

        serializer = SavedPlaceListSerializer(queryset, many=True)
        return success_response(serializer.data)

    @extend_schema(
        summary="즐겨찾기 추가",
        description="""
즐겨찾기에 장소를 추가합니다.

**규칙:**
- 집/회사/학교(home, work, school)는 각 카테고리당 1개만 등록 가능
- 이미 삭제된 즐겨찾기는 재추가 시 복원됩니다
- 같은 POI를 중복 추가할 수 없습니다
        """,
        request=SavedPlaceCreateSerializer,
        responses={
            201: SavedPlaceResponseSerializer,
            200: SavedPlaceResponseSerializer,
            400: None,
            404: None,
            409: None,
        },
        tags=["Saved Places"],
    )
    def post(self, request):
        """즐겨찾기 추가"""
        serializer = SavedPlaceCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                code="VALIDATION_FAILED",
                message="입력값이 올바르지 않습니다.",
                status_code=status.HTTP_400_BAD_REQUEST,
                details=serializer.errors,
            )

        user = request.user
        poi_place_id = serializer.validated_data["poi_place_id"]
        category = serializer.validated_data.get("category")

        # POI 존재 확인
        try:
            poi_place = PoiPlace.objects.get(id=poi_place_id)
        except PoiPlace.DoesNotExist:
            return error_response(
                code="RESOURCE_NOT_FOUND",
                message="해당 장소를 찾을 수 없습니다.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # 카테고리 중복 체크 (home/work/school)
        if category:
            existing_category = SavedPlace.objects.filter(
                user=user, category=category, deleted_at__isnull=True
            ).first()

            if existing_category:
                category_display = dict(SavedPlace.CATEGORY_CHOICES).get(
                    category, category
                )
                return error_response(
                    code="CATEGORY_ALREADY_EXISTS",
                    message=f"이미 '{category_display}'이(가) 등록되어 있습니다.",
                    status_code=status.HTTP_409_CONFLICT,
                    details={
                        "category": category,
                        "existing_saved_place_id": existing_category.id,
                    },
                )

        # 기존 즐겨찾기 확인 (삭제된 것 포함)
        existing = SavedPlace.objects.filter(user=user, poi_place=poi_place).first()

        if existing:
            if existing.deleted_at:
                # 삭제된 즐겨찾기 복원
                existing.deleted_at = None
                existing.category = category
                existing.save()

                response_serializer = SavedPlaceResponseSerializer(existing)
                return success_response(
                    data=response_serializer.data,
                    status_code=status.HTTP_200_OK,
                    meta={"action": "restored"},
                )
            else:
                # 이미 활성 상태인 즐겨찾기
                return error_response(
                    code="RESOURCE_CONFLICT",
                    message="이미 즐겨찾기에 추가된 장소입니다.",
                    status_code=status.HTTP_409_CONFLICT,
                    details={"existing_saved_place_id": existing.id},
                )

        # 새로운 즐겨찾기 생성
        try:
            saved_place = SavedPlace.objects.create(
                user=user,
                poi_place=poi_place,
                category=category,
            )
        except IntegrityError:
            return error_response(
                code="RESOURCE_CONFLICT",
                message="즐겨찾기 추가 중 충돌이 발생했습니다.",
                status_code=status.HTTP_409_CONFLICT,
            )

        response_serializer = SavedPlaceResponseSerializer(saved_place)
        return success_response(
            data=response_serializer.data,
            status_code=status.HTTP_201_CREATED,
        )


class SavedPlaceDetailView(APIView):
    """
    즐겨찾기 개별 삭제 및 수정

    DELETE /api/v1/saved-places/{saved_place_id} - 삭제 (Soft Delete)
    PATCH  /api/v1/saved-places/{saved_place_id} - 수정
    """

    permission_classes = [IsAuthenticated]

    def get_object(self, user, saved_place_id):
        """즐겨찾기 객체 조회 (사용자 검증 포함)"""
        try:
            return SavedPlace.objects.get(
                id=saved_place_id, user=user, deleted_at__isnull=True
            )
        except SavedPlace.DoesNotExist:
            return None

    @extend_schema(
        summary="즐겨찾기 삭제",
        description="즐겨찾기에서 장소를 삭제합니다 (Soft Delete).",
        responses={
            200: SavedPlaceDeleteResponseSerializer,
            404: None,
        },
        tags=["Saved Places"],
    )
    def delete(self, request, saved_place_id):
        """즐겨찾기 삭제 (Soft Delete)"""
        saved_place = self.get_object(request.user, saved_place_id)

        if not saved_place:
            return error_response(
                code="RESOURCE_NOT_FOUND",
                message="해당 즐겨찾기를 찾을 수 없습니다.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # Soft Delete
        saved_place.deleted_at = timezone.now()
        saved_place.save()

        return success_response(
            data={
                "saved_place_id": saved_place.id,
                "deleted_at": to_seoul_time(saved_place.deleted_at),
            },
            status_code=status.HTTP_200_OK,
        )

    @extend_schema(
        summary="즐겨찾기 수정",
        description="즐겨찾기의 카테고리를 수정합니다.",
        request=SavedPlaceUpdateSerializer,
        responses={
            200: SavedPlaceResponseSerializer,
            400: None,
            404: None,
            409: None,
        },
        tags=["Saved Places"],
    )
    def patch(self, request, saved_place_id):
        """즐겨찾기 수정"""
        saved_place = self.get_object(request.user, saved_place_id)

        if not saved_place:
            return error_response(
                code="RESOURCE_NOT_FOUND",
                message="해당 즐겨찾기를 찾을 수 없습니다.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        serializer = SavedPlaceUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                code="VALIDATION_FAILED",
                message="입력값이 올바르지 않습니다.",
                status_code=status.HTTP_400_BAD_REQUEST,
                details=serializer.errors,
            )

        # 카테고리 변경 시 중복 체크
        new_category = serializer.validated_data.get("category")
        if new_category and new_category != saved_place.category:
            existing_category = (
                SavedPlace.objects.filter(
                    user=request.user, category=new_category, deleted_at__isnull=True
                )
                .exclude(id=saved_place_id)
                .first()
            )

            if existing_category:
                category_display = dict(SavedPlace.CATEGORY_CHOICES).get(
                    new_category, new_category
                )
                return error_response(
                    code="CATEGORY_ALREADY_EXISTS",
                    message=f"이미 '{category_display}'이(가) 등록되어 있습니다.",
                    status_code=status.HTTP_409_CONFLICT,
                    details={
                        "category": new_category,
                        "existing_saved_place_id": existing_category.id,
                    },
                )

        # 업데이트
        if "category" in serializer.validated_data:
            saved_place.category = serializer.validated_data["category"]

        saved_place.save()

        response_serializer = SavedPlaceResponseSerializer(saved_place)
        return success_response(
            data=response_serializer.data,
            status_code=status.HTTP_200_OK,
        )
