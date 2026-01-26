"""
버스 노선 정보 API

프론트엔드 지도에서 버스 노선 표시를 위한 API
- 노선 검색
- 노선별 정류소 목록 (좌표 포함)
"""

import json
import logging

import requests
from django.conf import settings
from django.core.cache import cache
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .utils.bus_api_client import bus_api_client

# 버스 위치 캐시 키 (tasks.py와 동일)
BUS_POSITIONS_CACHE_KEY = "bus:positions:all"

logger = logging.getLogger(__name__)


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


class BusRouteSearchView(APIView):
    """
    버스 노선 검색 API

    GET /api/v1/bus/routes/search?q=360
    """

    permission_classes = [AllowAny]

    @extend_schema(
        summary="버스 노선 검색",
        description="버스 번호로 노선을 검색합니다.",
        parameters=[
            OpenApiParameter(
                name="q",
                description="버스 번호 (예: 360, 472, 6625)",
                required=True,
                type=str,
            ),
        ],
        responses={200: None, 400: None},
        tags=["Bus"],
    )
    def get(self, request):
        """버스 노선 검색"""
        query = request.query_params.get("q", "").strip()

        if not query:
            return error_response(
                code="VALIDATION_REQUIRED_FIELD",
                message="검색어(q)는 필수입니다.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # 버스 노선 검색
        routes = bus_api_client.get_bus_route_list(query)

        # 응답 가공
        result = []
        for route in routes:
            # 버스 유형 판별
            route_type = self._get_bus_type(route.get("busRouteNm", ""))

            result.append(
                {
                    "route_id": route.get("busRouteId"),
                    "route_name": route.get("busRouteNm"),
                    "route_type": route_type,
                    "start_station": route.get("stStationNm"),
                    "end_station": route.get("edStationNm"),
                    "first_bus": route.get("firstBusTm"),
                    "last_bus": route.get("lastBusTm"),
                    "term": route.get("term"),  # 배차간격
                }
            )

        return success_response(result)

    def _get_bus_type(self, bus_number: str) -> str:
        """버스 번호로 유형 판별"""
        try:
            num = int(bus_number)

            # 순환버스 (01~09)
            if 1 <= num <= 9:
                return "circular"

            # 간선버스 (100~399)
            if 100 <= num <= 399:
                return "trunk"

            # 지선버스
            if 400 <= num <= 499:
                return "branch"
            if 5000 <= num <= 5999:
                return "branch"
            if 6000 <= num <= 6999:
                return "branch"
            if 7000 <= num <= 7999:
                return "branch"

            # 광역버스 (9000~9999)
            if 9000 <= num <= 9999:
                return "express"

            return "branch"
        except ValueError:
            # 숫자가 아닌 경우 (마을버스 등)
            if "마을" in bus_number:
                return "town"
            if bus_number.startswith("N"):
                return "night"
            return "branch"


class BusRouteStationsView(APIView):
    """
    버스 노선 정류소 목록 API

    GET /api/v1/bus/routes/{route_id}/stations
    """

    permission_classes = [AllowAny]

    @extend_schema(
        summary="버스 노선 정류소 목록",
        description="특정 노선의 모든 정류소 목록과 좌표를 반환합니다.",
        responses={200: None, 404: None},
        tags=["Bus"],
    )
    def get(self, request, route_id):
        """노선 정류소 목록 조회"""
        # 정류소 목록 조회
        stations = bus_api_client.get_station_by_route(route_id)

        if not stations:
            return error_response(
                code="RESOURCE_NOT_FOUND",
                message="노선 정보를 찾을 수 없습니다.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # 응답 가공
        result = []
        for station in stations:
            # 좌표 추출 (gpsX=경도, gpsY=위도)
            try:
                lon = float(station.get("gpsX") or station.get("tmX") or 0)
                lat = float(station.get("gpsY") or station.get("tmY") or 0)
            except (ValueError, TypeError):
                lon, lat = 0, 0

            result.append(
                {
                    "id": station.get("station") or station.get("stationId"),
                    "name": station.get("stationNm") or station.get("stNm"),
                    "seq": int(station.get("seq", 0)),
                    "ars_id": station.get("arsId"),
                    "coordinates": [lon, lat] if lon and lat else None,
                    "section_speed": station.get("sectSpd"),  # 구간 속도
                    "full_section_dist": station.get("fullSectDist"),  # 전체 구간 거리
                }
            )

        # seq 순서로 정렬
        result.sort(key=lambda x: x["seq"])

        # 메타 정보
        meta = {
            "total_stations": len(result),
            "route_id": route_id,
        }

        return success_response(result, meta=meta)


class BusRoutePathView(APIView):
    """
    버스 노선 경로 (GeoJSON) API

    GET /api/v1/bus/routes/{route_id}/path
    Mapbox Map Matching API를 사용해 정류소 좌표를 도로에 스냅한 경로 반환
    """

    permission_classes = [AllowAny]

    @extend_schema(
        summary="버스 노선 경로 GeoJSON",
        description="Mapbox Map Matching API를 사용해 도로를 따라가는 버스 노선 경로를 반환합니다.",
        responses={200: None, 404: None},
        tags=["Bus"],
    )
    def get(self, request, route_id):
        """노선 경로 GeoJSON 조회 (Mapbox Map Matching 사용)"""
        # 1. 정류소 목록 조회
        stations = bus_api_client.get_station_by_route(route_id)

        if not stations:
            return error_response(
                code="RESOURCE_NOT_FOUND",
                message="노선 정보를 찾을 수 없습니다.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # 정류소 정렬
        sorted_stations = sorted(stations, key=lambda x: int(x.get("seq", 0)))

        # 좌표 추출
        station_coords = []
        for station in sorted_stations:
            try:
                lon = float(station.get("gpsX") or station.get("tmX") or 0)
                lat = float(station.get("gpsY") or station.get("tmY") or 0)
                if lon and lat:
                    station_coords.append([lon, lat])
            except (ValueError, TypeError):
                continue

        if len(station_coords) < 2:
            return error_response(
                code="INSUFFICIENT_DATA",
                message="경로를 그리기에 충분한 좌표가 없습니다.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # 왕복 노선 여부 확인
        start_coord = station_coords[0]
        end_coord = station_coords[-1]
        dist = (
            (start_coord[0] - end_coord[0]) ** 2 + (start_coord[1] - end_coord[1]) ** 2
        ) ** 0.5
        is_loop = dist < 0.002  # 약 200m

        # 2. Mapbox Map Matching API 호출
        try:
            matched_coords = self._mapbox_map_matching(station_coords)

            if matched_coords:
                if is_loop and len(matched_coords) > 2:
                    # 왕복 노선: 중간 지점에서 분리
                    mid_idx = len(matched_coords) // 2
                    outbound = matched_coords[: mid_idx + 1]
                    inbound = matched_coords[mid_idx:]

                    geojson = {
                        "type": "Feature",
                        "properties": {
                            "route_id": route_id,
                            "station_count": len(sorted_stations),
                            "is_loop": True,
                            "source": "mapbox",
                        },
                        "geometry": {
                            "type": "MultiLineString",
                            "coordinates": [outbound, inbound],
                        },
                    }
                else:
                    geojson = {
                        "type": "Feature",
                        "properties": {
                            "route_id": route_id,
                            "station_count": len(sorted_stations),
                            "is_loop": False,
                            "source": "mapbox",
                        },
                        "geometry": {
                            "type": "LineString",
                            "coordinates": matched_coords,
                        },
                    }

                station_list = [
                    {
                        "name": s.get("stationNm") or s.get("stNm"),
                        "ars_id": s.get("arsId"),
                    }
                    for s in sorted_stations
                ]

                return success_response(
                    {
                        "geojson": geojson,
                        "stations": station_list,
                    }
                )

        except Exception as e:
            logger.warning(f"Mapbox Map Matching 실패, 정류소 좌표로 폴백: {e}")

        # 3. Map Matching 실패 시 정류소 좌표 직접 연결
        return self._fallback_station_path(
            route_id, sorted_stations, station_coords, is_loop
        )

    def _mapbox_map_matching(
        self, coordinates: list[list[float]]
    ) -> list[list[float]] | None:
        """
        Mapbox Map Matching API 호출

        정류소 좌표를 도로에 스냅하여 실제 도로를 따라가는 경로 반환

        Args:
            coordinates: [[lon, lat], ...] 정류소 좌표 목록

        Returns:
            [[lon, lat], ...] 도로에 스냅된 좌표 목록 또는 None
        """
        access_token = getattr(settings, "MAPBOX_ACCESS_TOKEN", "")
        if not access_token:
            logger.warning("MAPBOX_ACCESS_TOKEN이 설정되지 않음")
            return None

        # Map Matching API는 한 번에 최대 100개 좌표
        # 좌표가 100개 넘으면 나눠서 호출 후 합치기
        all_matched = []
        chunk_size = 100

        for i in range(0, len(coordinates), chunk_size - 1):  # 1개 겹치게 해서 연결
            chunk = coordinates[i : i + chunk_size]

            if len(chunk) < 2:
                continue

            # 좌표를 "lon,lat;lon,lat;..." 형식으로 변환
            coords_str = ";".join([f"{c[0]},{c[1]}" for c in chunk])

            # radiuses: 각 좌표의 검색 반경 (미터)
            # 50m - 너무 작으면 매칭 실패, 너무 크면 엉뚱한 도로 매칭
            radiuses = ";".join(["50"] * len(chunk))

            url = f"https://api.mapbox.com/matching/v5/mapbox/driving/{coords_str}"
            params = {
                "access_token": access_token,
                "geometries": "geojson",
                "radiuses": radiuses,
                "steps": "false",
                "overview": "full",
                "tidy": "true",  # 불필요한 중간 점 제거
            }

            try:
                response = requests.get(url, params=params, timeout=30)
                response.raise_for_status()
                data = response.json()

                if data.get("code") != "Ok":
                    logger.warning(
                        f"Mapbox Map Matching 실패: {data.get('code')}, {data.get('message')}"
                    )
                    continue

                matchings = data.get("matchings", [])
                if not matchings:
                    logger.warning("Mapbox Map Matching: 매칭 결과 없음")
                    continue

                # 첫 번째 매칭 결과의 geometry 사용
                geometry = matchings[0].get("geometry", {})
                matched_coords = geometry.get("coordinates", [])

                if matched_coords:
                    # 청크 합칠 때 첫 좌표 중복 제거 (첫 청크 제외)
                    if all_matched and matched_coords:
                        matched_coords = matched_coords[1:]
                    all_matched.extend(matched_coords)

                logger.info(
                    f"Mapbox Map Matching 성공: 입력={len(chunk)}개, 출력={len(matched_coords)}개"
                )

            except requests.RequestException as e:
                logger.error(f"Mapbox Map Matching API 요청 실패: {e}")
                continue

        if all_matched:
            logger.info(f"Mapbox Map Matching 전체 완료: 총 {len(all_matched)}개 좌표")
            return all_matched

        return None

    def _fallback_station_path(
        self, route_id: str, sorted_stations: list, station_coords: list, is_loop: bool
    ):
        """Map Matching 실패 시 정류소 좌표로 폴백"""
        station_list = [
            {"name": s.get("stationNm") or s.get("stNm"), "ars_id": s.get("arsId")}
            for s in sorted_stations
        ]

        if is_loop and len(station_coords) > 4:
            # 회차 지점 찾기 (시작점에서 가장 먼 지점)
            start = station_coords[0]
            max_dist = 0
            turn_idx = len(station_coords) // 2
            for i, coord in enumerate(station_coords):
                d = ((start[0] - coord[0]) ** 2 + (start[1] - coord[1]) ** 2) ** 0.5
                if d > max_dist:
                    max_dist = d
                    turn_idx = i

            outbound = station_coords[: turn_idx + 1]
            inbound = station_coords[turn_idx:]

            geojson = {
                "type": "Feature",
                "properties": {
                    "route_id": route_id,
                    "station_count": len(station_coords),
                    "is_loop": True,
                    "source": "stations",
                },
                "geometry": {
                    "type": "MultiLineString",
                    "coordinates": [outbound, inbound],
                },
            }
        else:
            geojson = {
                "type": "Feature",
                "properties": {
                    "route_id": route_id,
                    "station_count": len(station_coords),
                    "is_loop": False,
                    "source": "stations",
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": station_coords,
                },
            }

        return success_response(
            {
                "geojson": geojson,
                "stations": station_list,
            }
        )


class BusMultipleRoutesView(APIView):
    """
    여러 버스 노선 한번에 조회 API

    POST /api/v1/bus/routes/batch
    """

    permission_classes = [AllowAny]

    @extend_schema(
        summary="여러 버스 노선 한번에 조회",
        description="여러 노선의 정류소 정보를 한번에 조회합니다.",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "route_ids": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "노선 ID 목록",
                    }
                },
                "required": ["route_ids"],
            }
        },
        responses={200: None, 400: None},
        tags=["Bus"],
    )
    def post(self, request):
        """여러 노선 한번에 조회"""
        route_ids = request.data.get("route_ids", [])

        if not route_ids:
            return error_response(
                code="VALIDATION_REQUIRED_FIELD",
                message="route_ids는 필수입니다.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # 최대 10개 제한
        if len(route_ids) > 10:
            route_ids = route_ids[:10]

        results = []
        for route_id in route_ids:
            stations = bus_api_client.get_station_by_route(str(route_id))

            if not stations:
                continue

            # 정류소 가공
            stops = []
            for station in sorted(stations, key=lambda x: int(x.get("seq", 0))):
                try:
                    lon = float(station.get("gpsX") or station.get("tmX") or 0)
                    lat = float(station.get("gpsY") or station.get("tmY") or 0)

                    if lon and lat:
                        stops.append(
                            {
                                "id": station.get("station")
                                or station.get("stationId"),
                                "name": station.get("stationNm") or station.get("stNm"),
                                "coordinates": [lon, lat],
                                "ars_id": station.get("arsId"),
                            }
                        )
                except (ValueError, TypeError):
                    continue

            if stops:
                results.append(
                    {
                        "route_id": route_id,
                        "stops": stops,
                    }
                )

        return success_response(results)


class BusAllPositionsView(APIView):
    """
    서울시 전체 버스 실시간 위치 조회 API (화면 영역 기반)

    POST /api/v1/bus/positions/area
    특정 영역(bounds) 내의 모든 버스 위치를 반환
    """

    permission_classes = [AllowAny]

    @extend_schema(
        summary="영역 내 전체 버스 실시간 위치 조회",
        description="지도 화면 영역(bounds) 내의 모든 버스 실시간 위치를 반환합니다.",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "bounds": {
                        "type": "object",
                        "properties": {
                            "sw": {
                                "type": "array",
                                "items": {"type": "number"},
                                "description": "[경도, 위도]",
                            },
                            "ne": {
                                "type": "array",
                                "items": {"type": "number"},
                                "description": "[경도, 위도]",
                            },
                        },
                        "description": "남서(sw), 북동(ne) 좌표",
                    },
                    "route_ids": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "조회할 노선 ID 목록 (없으면 인기 노선)",
                    },
                },
            }
        },
        responses={200: None},
        tags=["Bus"],
    )
    def post(self, request):
        """영역 내 버스 위치 조회 (Redis 캐시 전용 - 외부 API 직접 호출 안함)"""
        bounds = request.data.get("bounds")

        # bounds가 없으면 서울 전체 영역 사용
        if not bounds:
            bounds = {
                "sw": [126.7, 37.4],  # 서울 남서
                "ne": [127.2, 37.7],  # 서울 북동
            }

        sw_lng, sw_lat = bounds["sw"]
        ne_lng, ne_lat = bounds["ne"]

        # Redis 캐시에서만 조회 (Celery가 30초마다 갱신)
        cached_data = cache.get(BUS_POSITIONS_CACHE_KEY)

        if cached_data:
            try:
                data = json.loads(cached_data)
                all_buses = data.get("buses", [])

                # bounds 필터링
                filtered_buses = [
                    bus
                    for bus in all_buses
                    if (
                        sw_lng <= bus["coordinates"][0] <= ne_lng
                        and sw_lat <= bus["coordinates"][1] <= ne_lat
                    )
                ]

                meta = {
                    "total_buses": len(filtered_buses),
                    "routes_count": data.get("routes_count", 0),
                    "cache": "hit",
                }

                return success_response(filtered_buses, meta=meta)

            except (json.JSONDecodeError, KeyError) as e:
                logger.warning(f"캐시 데이터 파싱 오류: {e}")

        # 캐시 미스 - Celery가 아직 데이터를 채우지 않음
        # 외부 API 직접 호출하지 않고 빈 배열 반환 (API 제한 보호)
        logger.info("Redis 캐시 미스 - Celery 태스크가 데이터를 채울 때까지 대기")
        return success_response(
            [],
            meta={
                "total_buses": 0,
                "routes_count": 0,
                "cache": "miss",
                "message": "버스 데이터 로딩 중입니다. 잠시 후 다시 시도해주세요.",
            },
        )


class BusRealtimePositionsView(APIView):
    """
    버스 실시간 위치 조회 API

    GET /api/v1/bus/routes/{route_id}/positions
    노선의 운행 중인 모든 버스의 실시간 GPS 위치를 반환
    """

    permission_classes = [AllowAny]

    @extend_schema(
        summary="버스 실시간 위치 조회",
        description="노선의 운행 중인 모든 버스의 실시간 GPS 위치를 반환합니다.",
        responses={200: None, 404: None},
        tags=["Bus"],
    )
    def get(self, request, route_id):
        """노선 버스 실시간 위치 조회"""
        # 실시간 버스 위치 조회
        buses = bus_api_client.get_bus_positions_by_route(route_id)

        # 정류소 정보도 함께 조회 (버스가 향하는 정류소 이름 표시용)
        stations = bus_api_client.get_station_by_route(route_id)
        station_map = {}
        for station in stations:
            seq = station.get("seq")
            if seq:
                station_map[str(seq)] = {
                    "name": station.get("stationNm") or station.get("stNm"),
                    "ars_id": station.get("arsId"),
                }

        # 응답 가공
        result = []
        for bus in buses:
            try:
                # gpsX/gpsY 우선 사용 (tmX/tmY는 null일 수 있음)
                lon = float(bus.get("gpsX") or bus.get("tmX") or 0)
                lat = float(bus.get("gpsY") or bus.get("tmY") or 0)

                if not lon or not lat:
                    continue

                # 현재 구간 순번으로 다음 정류소 정보 조회
                sect_ord = bus.get("sectOrd")
                next_station = None
                if sect_ord:
                    # sectOrd는 현재 구간이므로 +1 해서 다음 정류소
                    next_seq = str(int(sect_ord) + 1)
                    next_station = station_map.get(next_seq)

                result.append(
                    {
                        "veh_id": bus.get("vehId"),
                        "plate_no": bus.get("plainNo"),  # 차량 번호판
                        "coordinates": [lon, lat],
                        "sect_ord": int(sect_ord) if sect_ord else None,
                        "stop_flag": bus.get("stopFlag") == "1",  # 정차 여부
                        "bus_type": "저상" if bus.get("busType") == "1" else "일반",
                        "is_full": bus.get("isFullFlag") == "1",  # 만차 여부
                        "congestion": int(bus.get("congetion") or 0),  # 혼잡도 (0~6)
                        "data_time": bus.get("dataTm"),  # 데이터 수신 시간
                        "next_station": next_station,  # 다음 정류소 정보
                    }
                )
            except (ValueError, TypeError) as e:
                logger.warning(f"버스 위치 파싱 오류: {e}")
                continue

        # 메타 정보
        meta = {
            "total_buses": len(result),
            "route_id": route_id,
        }

        return success_response(result, meta=meta)


class BusTrackPositionsView(APIView):
    """
    사용자 지정 버스 번호로 실시간 위치 추적 API

    POST /api/v1/bus/positions/track
    사용자가 입력한 버스 번호들의 실시간 위치를 반환
    """

    permission_classes = [AllowAny]

    @extend_schema(
        summary="사용자 지정 버스 실시간 위치 추적",
        description="사용자가 입력한 버스 번호들의 실시간 위치를 반환합니다. 최대 5개 노선까지 지원.",
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "bus_numbers": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": '버스 번호 목록 (예: ["360", "472", "151"])',
                        "example": ["360", "472"],
                    },
                },
                "required": ["bus_numbers"],
            }
        },
        responses={200: None, 400: None},
        tags=["Bus"],
    )
    def post(self, request):
        """사용자 지정 버스 번호로 위치 조회"""
        bus_numbers = request.data.get("bus_numbers", [])

        if not bus_numbers:
            return error_response(
                code="VALIDATION_REQUIRED_FIELD",
                message="bus_numbers는 필수입니다.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # 최대 5개 노선 제한 (API 호출량 관리)
        if len(bus_numbers) > 5:
            bus_numbers = bus_numbers[:5]
            logger.warning(f"버스 번호가 5개를 초과하여 앞 5개만 사용: {bus_numbers}")

        all_buses = []
        routes_info = []

        for bus_number in bus_numbers:
            bus_number = str(bus_number).strip()
            if not bus_number:
                continue

            # 1. 버스 번호로 route_id 조회
            routes = bus_api_client.get_bus_route_list(bus_number)

            # 정확히 일치하는 노선 찾기
            route = None
            for r in routes:
                if r.get("busRouteNm") == bus_number:
                    route = r
                    break

            if not route:
                # 정확한 일치가 없으면 첫 번째 결과 사용
                route = routes[0] if routes else None

            if not route:
                logger.warning(f"버스 노선을 찾을 수 없음: {bus_number}")
                continue

            route_id = route.get("busRouteId")
            route_name = route.get("busRouteNm")

            routes_info.append(
                {
                    "bus_number": bus_number,
                    "route_id": route_id,
                    "route_name": route_name,
                }
            )

            # 2. 해당 노선의 버스 위치 조회
            buses = bus_api_client.get_bus_positions_by_route(route_id)

            for bus in buses:
                try:
                    lon = float(bus.get("gpsX") or bus.get("tmX") or 0)
                    lat = float(bus.get("gpsY") or bus.get("tmY") or 0)

                    if not lon or not lat:
                        continue

                    sect_ord = bus.get("sectOrd")

                    all_buses.append(
                        {
                            "veh_id": bus.get("vehId"),
                            "route_id": route_id,
                            "bus_number": route_name,
                            "plate_no": bus.get("plainNo"),
                            "coordinates": [lon, lat],
                            "sect_ord": int(sect_ord) if sect_ord else None,
                            "stop_flag": bus.get("stopFlag") == "1",
                            "bus_type": "저상" if bus.get("busType") == "1" else "일반",
                            "is_full": bus.get("isFullFlag") == "1",
                            "congestion": int(bus.get("congetion") or 0),
                            "data_time": bus.get("dataTm"),
                        }
                    )
                except (ValueError, TypeError) as e:
                    logger.warning(f"버스 위치 파싱 오류: {e}")
                    continue

        meta = {
            "total_buses": len(all_buses),
            "routes_count": len(routes_info),
            "routes": routes_info,
        }

        return success_response(all_buses, meta=meta)
