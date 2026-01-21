from urllib.parse import quote  # noqa: F401

import requests
from django.conf import settings
from django.core.paginator import Paginator
from drf_spectacular.openapi import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated  # noqa: F401
from rest_framework.response import Response
from rest_framework.views import APIView

from config.responses import success_response

from .models import PoiPlace, SearchPlaceHistory
from .serializers import PoiPlaceDetailSerializer, PoiPlaceSerializer


class PlaceSearchView(APIView):
    """장소 검색 API"""

    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="places_search",
        summary="장소 검색",
        description="TMap API를 통해 장소를 검색하고 결과를 캐싱합니다. 로그인 사용자는 검색 기록이 저장됩니다.",
        parameters=[
            OpenApiParameter(
                name="q",
                description="검색 키워드 (필수)",
                required=True,
                type=OpenApiTypes.STR,
            ),
            OpenApiParameter(
                name="lat",
                description="현재 위치 위도 (선택)",
                required=False,
                type=OpenApiTypes.FLOAT,
            ),
            OpenApiParameter(
                name="lon",
                description="현재 위치 경도 (선택)",
                required=False,
                type=OpenApiTypes.FLOAT,
            ),
            OpenApiParameter(
                name="page",
                description="페이지 번호 (기본값: 1)",
                required=False,
                type=OpenApiTypes.INT,
            ),
            OpenApiParameter(
                name="limit",
                description="결과 수 (기본값: 20, 최대: 50)",
                required=False,
                type=OpenApiTypes.INT,
            ),
        ],
        responses={
            200: PoiPlaceSerializer(many=True),
            400: {"description": "필수 파라미터 누락"},
            502: {"description": "TMap API 오류"},
        },
        tags=["Places"],
    )
    def get(self, request):
        """
        GET /api/v1/places/search
        검색 키워드로 장소 검색 (TMap API 호출)
        """
        q = request.query_params.get("q")
        lat = request.query_params.get("lat") #필수가 아닌 선택값
        lon = request.query_params.get("lon") #필수가 아닌 선택값
        page = int(request.query_params.get("page", 1))
        limit = int(request.query_params.get("limit", 20))

        # 최대 50개 제한
        if limit > 50:
            limit = 50

        if not q:
            return Response(
                {
                    "status": "error",
                    "error": {
                        "code": "VALIDATION_REQUIRED_FIELD",
                        "message": "검색 키워드(q)는 필수입니다.",
                    },
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # 로그인 사용자인 경우 검색 기록 저장
        if request.user.is_authenticated:
            SearchPlaceHistory.objects.create(user=request.user, keyword=q)

        # TMap API 호출
        try:
            tmap_results = self._search_tmap(q, lat, lon)
        except Exception as e:
            return Response(
                {
                    "status": "error",
                    "error": {
                        "code": "SERVER_EXTERNAL_API",
                        "message": f"TMap API 오류: {str(e)}",
                    },
                },
                status=status.HTTP_502_BAD_GATEWAY,
            )

        # 결과를 poi_place 테이블에 upsert
        poi_places = []
        for result in tmap_results:
            # lon, lat이 None이면 건너뛰기
            if not result.get("lon") or not result.get("lat"):
                continue

            poi_place, _ = PoiPlace.objects.update_or_create(
                tmap_poi_id=result.get("id"),
                defaults={
                    "name": result.get("name"),
                    "address": result.get("address"),
                    "category": result.get("category", ""),
                    "coordinates": {
                        "lon": float(result["lon"]),
                        "lat": float(result["lat"]),
                    },
                },
            )
            poi_places.append(poi_place)

        # 페이지네이션
        paginator = Paginator(poi_places, limit)
        page_obj = paginator.get_page(page)

        serializer = PoiPlaceSerializer(page_obj.object_list, many=True)

        return Response(
            {
                "status": "success",
                "data": serializer.data,
                "meta": {
                    "pagination": {
                        "page": page,
                        "limit": limit,
                        "total_count": paginator.count,
                        "has_next": page_obj.has_next(),
                    }
                },
            },
            status=status.HTTP_200_OK,
        )

    def _search_tmap(self, q, lat=None, lon=None):
        """TMap API 호출하여 검색"""
        url = "https://apis.openapi.sk.com/tmap/pois"

        headers = {
            "Accept": "application/json",
            "appKey": settings.TMAP_API_KEY,
        }

        params = {
            "version": 1,
            "searchKeyword": q,
            "searchType": "all",
            "searchtypCd": "A",
            "reqCoordType": "WGS84GEO",
            "resCoordType": "WGS84GEO",
            "page": 1,
            "count": 20,
            "multiPoint": "N",
            "poiGroupYn": "N",
        }

        # 좌표가 있으면 범위 검색 (선택적)
        if lat and lon:
            params["centerLat"] = lat
            params["centerLon"] = lon
            params["radius"] = 5000  # 5km 반경

        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()
        except requests.exceptions.HTTPError as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(
                f"TMap API Error: {e.response.status_code} - {e.response.text}"
            )
            raise
        except Exception as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"TMap API Request Error: {str(e)}")
            raise

        # 204 No Content 응답 처리
        if response.status_code == 204:
            return []

        # 응답이 비어있으면 빈 리스트 반환
        if not response.text:
            return []

        data = response.json()

        # TMap 응답 파싱
        results = []

        # searchPoiInfo 구조 확인
        if "searchPoiInfo" not in data:
            return results

        poi_info = data["searchPoiInfo"]

        # pois → poi 배열 파싱
        if "pois" in poi_info:
            pois_data = poi_info["pois"]

            # poi가 딕셔너리인 경우 (pois.poi 구조)
            if isinstance(pois_data, dict) and "poi" in pois_data:
                poi_list = pois_data["poi"]
                # 단일 항목이면 리스트로 변환
                if isinstance(poi_list, dict):
                    poi_list = [poi_list]
            elif isinstance(pois_data, list):
                poi_list = pois_data
            else:
                return results

            # 각 POI 항목 파싱
            for poi in poi_list:
                if not poi:
                    continue

                # TMap API 응답에서 좌표 필드명 확인
                lat = poi.get("frontLat") or poi.get("noorLat") or poi.get("lat")
                lon = poi.get("frontLon") or poi.get("noorLon") or poi.get("lon")

                # 주소 조합
                addr_parts = []
                if poi.get("upperAddrName"):
                    addr_parts.append(poi.get("upperAddrName"))
                if poi.get("middleAddrName"):
                    addr_parts.append(poi.get("middleAddrName"))
                if poi.get("lowerAddrName"):
                    addr_parts.append(poi.get("lowerAddrName"))
                if poi.get("detailAddrName"):
                    addr_parts.append(poi.get("detailAddrName"))

                address = " ".join(addr_parts) if addr_parts else ""

                results.append(
                    {
                        "id": poi.get("id"),
                        "name": poi.get("name", ""),
                        "address": address,

                        "category": (
                            # 더# TMap 분류는 코드(mlClass)로 오는 경우가 많아 프론트에서 활용이 어려움.
                        # 가능하면 사람이 읽을 수 있는 bizName 계열을 우선 사용하고, 없으면 mlClass로 fallback. 구체적인 분류가 우선
                            poi.get("lowerBizName")
                            or poi.get("middleBizName")
                            or poi.get("upperBizName")
                            or poi.get("mlClass", "")
                        ),
                        "lat": lat,
                        "lon": lon,
                    }
                )

        return results


class PlaceDetailView(APIView):
    """장소 상세 조회 API"""

    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="places_detail",
        summary="장소 상세 조회",
        description="""
특정 POI 장소의 상세 정보를 조회합니다.

**거리 계산:**
- lat, lon 파라미터를 제공하면 해당 위치에서 장소까지의 거리(미터)를 계산합니다.
- 거리는 Haversine 공식을 사용하여 계산됩니다.
- 파라미터를 제공하지 않으면 distance_meters는 null로 반환됩니다.

**즐겨찾기:**
- 로그인 사용자인 경우 즐겨찾기 여부(is_saved)도 함께 반환됩니다.
        """,
        parameters=[
            OpenApiParameter(
                name="lat",
                description="현재 위치 위도 (거리 계산용, 선택)",
                required=False,
                type=OpenApiTypes.FLOAT,
            ),
            OpenApiParameter(
                name="lon",
                description="현재 위치 경도 (거리 계산용, 선택)",
                required=False,
                type=OpenApiTypes.FLOAT,
            ),
        ],
        responses={
            200: PoiPlaceDetailSerializer(),
            404: {"description": "장소를 찾을 수 없음"},
        },
        tags=["Places"],
    )
    def get(self, request, poi_place_id):
        """
        GET /api/v1/places/{poi_place_id}?lat={lat}&lon={lon}
        장소 상세 조회 (거리 계산 포함)
        """
        try:
            poi_place = PoiPlace.objects.get(id=poi_place_id)
        except PoiPlace.DoesNotExist:
            return Response(
                {
                    "status": "error",
                    "error": {
                        "code": "RESOURCE_NOT_FOUND",
                        "message": "해당 장소를 찾을 수 없습니다.",
                    },
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # 현재 위치 (선택적)
        current_lat = request.query_params.get("lat")
        current_lon = request.query_params.get("lon")

        # Serializer context 생성
        context = {
            "request": request,
        }

        # 현재 위치가 제공되면 context에 추가
        if current_lat and current_lon:
            try:
                context["current_lat"] = float(current_lat)
                context["current_lon"] = float(current_lon)
            except (ValueError, TypeError):
                # 잘못된 좌표 형식이면 무시
                pass

        serializer = PoiPlaceDetailSerializer(poi_place, context=context)

        return success_response(serializer.data)
