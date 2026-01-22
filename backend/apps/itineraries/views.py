"""
경로 검색 관련 View
"""

import logging

from django.db import transaction
from django.utils import timezone
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from config.responses import success_response


from .models import RouteItinerary, RouteLeg, RouteSegment, SearchItineraryHistory


from .serializers import (
    RouteLegDetailSerializer,
    RouteLegSummarySerializer,
    RouteSearchRequestSerializer,
    SearchItineraryHistoryDetailSerializer,
    SearchItineraryHistorySerializer,
)
from .services import TmapAPIError, TmapTransitService

logger = logging.getLogger(__name__)


def to_seoul_time(dt):
    """datetime을 서울 시간대로 변환하여 ISO 형식 반환"""
    if dt is None:
        return None
    return timezone.localtime(dt).isoformat()


def validate_route_segments(route_leg) -> tuple[bool, str]:
    """
    경로 구간 validation

    Args:
        route_leg: RouteLeg 인스턴스

    Returns:
        (is_valid, error_message) 튜플
    """
    segments = RouteSegment.objects.filter(route_leg=route_leg).order_by('segment_index')

    for seg in segments:
        # 대중교통 구간 검증
        if seg.mode in ['BUS', 'SUBWAY']:
            # 1. 거리가 너무 짧은 경우
            if seg.distance < 500:
                logger.warning(
                    f"짧은 대중교통 구간 감지: route_leg_id={route_leg.id}, "
                    f"mode={seg.mode}, distance={seg.distance}m"
                )
                return False, f"{seg.mode} 구간이 너무 짧습니다 ({seg.distance}m). 다른 경로를 선택해주세요."

            # 2. passStopList 검증 (raw_data에서)
            if route_leg.raw_data and 'legs' in route_leg.raw_data:
                leg_data = route_leg.raw_data['legs'][seg.segment_index]
                pass_stops = leg_data.get('passStopList', {}).get('stations', [])

                if len(pass_stops) <= 2:
                    logger.warning(
                        f"passStopList 부족: route_leg_id={route_leg.id}, "
                        f"mode={seg.mode}, stops={len(pass_stops)}"
                    )
                    return False, f"{seg.mode} 경로의 정류장/역 정보가 부족합니다. 다른 경로를 선택해주세요."

    return True, ""


def parse_linestring_to_coordinates(linestring_str: str) -> list:
    """
    TMAP linestring 문자열을 좌표 리스트로 변환

    Args:
        linestring_str: "lon1,lat1 lon2,lat2 ..." 형태의 문자열

    Returns:
        [[lon, lat], ...] 형태의 좌표 배열
    """
    if not linestring_str:
        return []

    try:
        coordinates = []
        for point in linestring_str.strip().split(' '):
            lon, lat = point.split(',')
            coordinates.append([float(lon), float(lat)])
        return coordinates
    except (ValueError, IndexError) as e:
        logger.warning(f"linestring 파싱 실패: {e}")
        return []


@extend_schema_view(
    post=extend_schema(
        summary='경로 검색',
        description='TMAP 대중교통 API를 사용하여 대중교통 경로를 검색합니다.',
        tags=['경로 검색'],
        request=RouteSearchRequestSerializer,
        responses={201: None}
    )
)
class RouteSearchView(APIView):
    """
    경로 검색 API

    POST /api/v1/itineraries/search
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        # 요청 데이터 검증
        serializer = RouteSearchRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # TMAP API 호출
        try:
            tmap_service = TmapTransitService()
            tmap_response = tmap_service.search_routes(
                start_x=data['startX'],
                start_y=data['startY'],
                end_x=data['endX'],
                end_y=data['endY'],
                count=data.get('count', 10),
                lang=data.get('lang', 0),
                format=data.get('format', 'json'),
            )
        except TmapAPIError as e:
            logger.error(f'TMAP API 오류: {e}')
            return success_response(
                data={'error': str(e)},
                status=status.HTTP_502_BAD_GATEWAY
            )

        # 응답 데이터 파싱 및 저장
        with transaction.atomic():
            # RouteItinerary 생성
            route_itinerary = RouteItinerary.objects.create(
                start_x=data['startX'],
                start_y=data['startY'],
                end_x=data['endX'],
                end_y=data['endY'],
            )

            # RouteLeg 및 RouteSegment 생성
            legs = []
            itineraries = tmap_response.get('metaData', {}).get('plan', {}).get('itineraries', [])

            for leg_index, itinerary in enumerate(itineraries):
                # RouteLeg 생성
                route_leg = RouteLeg.objects.create(
                    route_itinerary=route_itinerary,
                    leg_index=leg_index,
                    path_type=itinerary.get('pathType', 0),
                    total_time=itinerary.get('totalTime', 0),
                    total_distance=itinerary.get('totalDistance', 0),
                    total_walk_time=itinerary.get('totalWalkTime', 0),
                    total_walk_distance=itinerary.get('totalWalkDistance', 0),
                    transfer_count=itinerary.get('transferCount', 0),
                    total_fare=itinerary.get('fare', {}).get('regular', {}).get('totalFare', 0),
                    raw_data=itinerary,
                )
                legs.append(route_leg)

                # RouteSegment 생성 (각 구간별)
                segments = itinerary.get('legs', [])
                for seg_index, segment in enumerate(segments):
                    # 좌표 데이터 파싱
                    linestring_str = ""
                    if segment.get('mode') == 'WALK':
                        # 도보: steps에서 linestring 합치기
                        steps = segment.get('steps', [])
                        linestring_parts = [s.get('linestring', '') for s in steps if s.get('linestring')]
                        linestring_str = ' '.join(linestring_parts)
                    else:
                        # 대중교통: passShape에서 가져오기
                        linestring_str = segment.get('passShape', {}).get('linestring', '')

                    path_coordinates = parse_linestring_to_coordinates(linestring_str)

                    # 출발/도착 정보
                    start_info = segment.get('start', {})
                    end_info = segment.get('end', {})

                    RouteSegment.objects.create(
                        route_leg=route_leg,
                        segment_index=seg_index,
                        mode=segment.get('mode', 'WALK'),
                        section_time=segment.get('sectionTime', 0),
                        distance=segment.get('distance', 0),
                        start_name=start_info.get('name', ''),
                        start_lat=start_info.get('lat', 0),
                        start_lon=start_info.get('lon', 0),
                        end_name=end_info.get('name', ''),
                        end_lat=end_info.get('lat', 0),
                        end_lon=end_info.get('lon', 0),
                        route_name=segment.get('route', ''),
                        route_color=segment.get('routeColor', ''),
                        path_coordinates=path_coordinates,
                    )

            # SearchItineraryHistory 생성 (사용자 검색 기록)
            # 동일한 출발지/도착지 조합에 대한 이전 검색 기록은 soft delete 처리하여
            # 항상 "가장 최근 검색 1개만" 활성 상태로 남도록 정리
            SearchItineraryHistory.objects.filter(
                user=request.user,
                departure_name=data['departure_name'],
                arrival_name=data['arrival_name'],
                deleted_at__isnull=True,
            ).update(deleted_at=timezone.now())

            # 새 기록 생성 (DB에는 계속 누적 저장, UI에서만 5개 제한)
            search_history = SearchItineraryHistory.objects.create(
                user=request.user,
                route_itinerary=route_itinerary,
                departure_name=data['departure_name'],
                arrival_name=data['arrival_name'],
            )

        # 응답 생성
        request_parameters = tmap_response.get('metaData', {}).get('requestParameters', {})

        return success_response(
            data={
                'search_itinerary_history_id': search_history.id,
                'route_itinerary_id': route_itinerary.id,
                'requestParameters': request_parameters,
                'legs': RouteLegSummarySerializer(legs, many=True).data,
                'created_at': to_seoul_time(search_history.created_at),
            },
            status=status.HTTP_201_CREATED
        )


@extend_schema_view(
    get=extend_schema(
        summary='최근 경로 검색 기록 목록 조회',
        description='사용자의 최근 경로 검색 기록을 조회합니다.',
        tags=['경로 검색'],
        responses={200: None}
    ),
    delete=extend_schema(
        summary='최근 경로 검색 기록 전체 삭제',
        description='사용자의 모든 경로 검색 기록을 삭제합니다.',
        tags=['경로 검색'],
        responses={200: None}
    )
)
class SearchItineraryHistoryListView(APIView):
    """
    최근 경로 검색 기록 목록 조회/전체 삭제 API

    GET /api/v1/itineraries/search-histories - 최근 경로 검색 기록 목록 조회
    DELETE /api/v1/itineraries/search-histories - 최근 경로 검색 기록 전체 삭제
    """

    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        최근 경로 검색 기록 목록 조회

        쿼리 파라미터:
        - limit: 조회할 개수 (기본값: 10)
        """
        limit = request.query_params.get("limit", 10)
        try:
            limit = int(limit)
        except ValueError:
            limit = 10

        # 현재 사용자의 검색 기록만 조회 (삭제되지 않은 데이터만, 최신순)
        histories = SearchItineraryHistory.objects.filter(
            user=request.user, deleted_at__isnull=True
        ).order_by('-created_at')[:limit]

        serializer = SearchItineraryHistorySerializer(histories, many=True)
        return success_response(data=serializer.data, status=status.HTTP_200_OK)

    def delete(self, request):
        """
        최근 경로 검색 기록 전체 삭제 (소프트 딜리트)
        """
        deleted_count = SearchItineraryHistory.objects.filter(
            user=request.user, deleted_at__isnull=True
        ).update(deleted_at=timezone.now())

        return success_response(
            data={"deleted_count": deleted_count},
            status=status.HTTP_200_OK
        )


@extend_schema_view(
    get=extend_schema(
        summary='경로 검색 결과 조회',
        description='저장된 경로 검색 결과를 조회합니다.',
        tags=['경로 검색'],
        responses={200: None}
    ),
    delete=extend_schema(
        summary='경로 검색 기록 단건 삭제',
        description='특정 경로 검색 기록을 삭제합니다.',
        tags=['경로 검색'],
        responses={200: None}
    )
)
class SearchItineraryHistoryDetailView(APIView):
    """
    경로 검색 결과 조회/단건 삭제 API

    GET /api/v1/itineraries/search/{search_itinerary_history_id} - 경로 검색 결과 조회
    DELETE /api/v1/itineraries/search/{search_itinerary_history_id} - 경로 검색 기록 단건 삭제
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, search_itinerary_history_id):
        try:
            search_history = SearchItineraryHistory.objects.select_related(
                'route_itinerary'
            ).prefetch_related(
                'route_itinerary__legs'
            ).get(
                id=search_itinerary_history_id,
                user=request.user,
                deleted_at__isnull=True
            )
        except SearchItineraryHistory.DoesNotExist:
            raise NotFound('검색 기록을 찾을 수 없습니다.')

        return success_response(
            data=SearchItineraryHistoryDetailSerializer(search_history).data,
            status=status.HTTP_200_OK
        )

    def delete(self, request, search_itinerary_history_id):
        """
        경로 검색 기록 단건 삭제 (소프트 딜리트)
        """
        try:
            search_history = SearchItineraryHistory.objects.get(
                id=search_itinerary_history_id,
                user=request.user,
                deleted_at__isnull=True
            )
        except SearchItineraryHistory.DoesNotExist:
            raise NotFound('검색 기록을 찾을 수 없습니다.')

        search_history.deleted_at = timezone.now()
        search_history.save()

        return success_response(
            data={"id": search_history.id},
            status=status.HTTP_200_OK
        )


@extend_schema_view(
    get=extend_schema(
        summary='개별 경로(Leg) 상세 조회',
        description='경로 구간의 상세 정보를 조회합니다.',
        tags=['경로 검색'],
        responses={200: None}
    )
)
class RouteLegDetailView(APIView):
    """
    개별 경로(Leg) 상세 조회 API

    GET /api/v1/itineraries/legs/{route_leg_id}
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, route_leg_id):
        try:
            # raw_data에서 legs 정보를 직접 가져오므로 segments prefetch 불필요
            route_leg = RouteLeg.objects.select_related(
                'route_itinerary'
            ).get(
                id=route_leg_id,
                deleted_at__isnull=True
            )
        except RouteLeg.DoesNotExist:
            raise NotFound('경로를 찾을 수 없습니다.')

        # 사용자 권한 확인 (해당 경로가 사용자의 검색 기록에 있는지)
        user_has_access = SearchItineraryHistory.objects.filter(
            user=request.user,
            route_itinerary=route_leg.route_itinerary,
            deleted_at__isnull=True
        ).exists()

        if not user_has_access:
            raise NotFound('경로를 찾을 수 없습니다.')

        return success_response(
            data=RouteLegDetailSerializer(route_leg).data,
            status=status.HTTP_200_OK
        )
