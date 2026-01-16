"""
TMAP → 공공데이터 ID 변환 서비스

역할:
- TMAP 경로탐색 응답의 ID를 공공데이터포탈 API에서 사용하는 ID로 변환
- 버스번호/호선명 파싱
- 정류소 좌표 매칭 (상행/하행 구분)
"""

import logging
from typing import Optional

from ..utils.bus_api_client import bus_api_client
from ..utils.geo_utils import find_closest_station

logger = logging.getLogger(__name__)

# 지하철 호선 매핑 (호선명 → 호선 ID)
SUBWAY_LINE_MAP = {
    "1호선": "1001",
    "2호선": "1002",
    "3호선": "1003",
    "4호선": "1004",
    "5호선": "1005",
    "6호선": "1006",
    "7호선": "1007",
    "8호선": "1008",
    "9호선": "1009",
    "경의중앙선": "1063",
    "공항철도": "1065",
    "경춘선": "1067",
    "수인분당선": "1075",
    "신분당선": "1077",
    "우이신설선": "1092",
    "서해선": "1093",
    "경강선": "1081",
    "GTX-A": "1032",
}


class PublicAPIIdConverter:
    """TMAP → 공공데이터 ID 변환 서비스"""

    @staticmethod
    def parse_bus_number(tmap_route: str) -> str:
        """
        TMAP route 필드에서 버스번호 추출

        예시:
        - "지선:6625" → "6625"
        - "간선:472" → "472"
        - "마을:서초15" → "서초15"

        Args:
            tmap_route: TMAP route 필드 값

        Returns:
            버스번호
        """
        if ":" in tmap_route:
            return tmap_route.split(":")[1]
        return tmap_route

    @staticmethod
    def parse_subway_line(tmap_route: str) -> str:
        """
        TMAP route 필드에서 호선명 추출

        예시:
        - "수도권2호선" → "2호선"
        - "수도권경의중앙선" → "경의중앙선"

        Args:
            tmap_route: TMAP route 필드 값

        Returns:
            호선명
        """
        if tmap_route.startswith("수도권"):
            return tmap_route[3:]  # "수도권" 제거
        return tmap_route

    @staticmethod
    def get_bus_route_id(bus_number: str) -> Optional[str]:
        """
        버스번호로 공공데이터 노선 ID 조회

        Args:
            bus_number: 버스번호 (예: "6625")

        Returns:
            busRouteId (예: "100100303") 또는 None
        """
        try:
            routes = bus_api_client.get_bus_route_list(bus_number)

            for route in routes:
                if route.get("busRouteNm") == bus_number:
                    return route.get("busRouteId")

            logger.warning(f"버스 노선 ID를 찾을 수 없음: {bus_number}")
            return None
        except Exception as e:
            logger.error(f"버스 노선 ID 조회 실패: {e}")
            return None

    @staticmethod
    def get_station_ids(
        station_name: str,
        tmap_lon: float,
        tmap_lat: float,
    ) -> Optional[dict]:
        """
        정류소명과 좌표로 공공데이터 정류소 ID 조회

        동일한 이름의 정류소가 여러 개 있을 경우 (상행/하행),
        TMAP 좌표와 가장 가까운 정류소를 선택합니다.

        Args:
            station_name: 정류소명
            tmap_lon: TMAP 경도
            tmap_lat: TMAP 위도

        Returns:
            { stId, arsId, name, lon, lat } 또는 None
        """
        try:
            # 정류소명에서 키워드 추출 (너무 긴 이름은 잘라서 검색)
            search_name = station_name[:10] if len(station_name) > 10 else station_name

            stations = bus_api_client.get_station_by_name(search_name)

            if not stations:
                logger.warning(f"정류소를 찾을 수 없음: {search_name}")
                return None

            # 좌표로 가장 가까운 정류소 찾기
            closest = find_closest_station(tmap_lat, tmap_lon, stations)

            if closest:
                try:
                    lon = float(closest.get("tmX", 0))
                    lat = float(closest.get("tmY", 0))
                except (ValueError, TypeError):
                    lon, lat = 0, 0

                return {
                    "stId": closest.get("stId"),
                    "arsId": closest.get("arsId"),
                    "name": closest.get("stNm"),
                    "lon": lon,
                    "lat": lat,
                }

            return None
        except Exception as e:
            logger.error(f"정류소 ID 조회 실패: {e}")
            return None

    @classmethod
    def convert_legs(cls, legs: list[dict]) -> dict:
        """
        전체 legs의 ID 변환

        경주 시작 시 TMAP legs 데이터를 공공데이터 API에서 사용하는 ID로 변환합니다.

        Args:
            legs: TMAP legs 배열

        Returns:
            변환된 ID 정보 { legs: [...] }
        """
        converted_legs = []

        for leg in legs:
            mode = leg.get("mode")

            if mode == "WALK":
                converted_legs.append({"mode": "WALK"})

            elif mode == "BUS":
                # 버스번호 파싱
                bus_number = cls.parse_bus_number(leg.get("route", ""))

                # 노선 ID 조회
                bus_route_id = cls.get_bus_route_id(bus_number)

                # 승차 정류소 ID 조회
                start = leg.get("start", {})
                start_station = cls.get_station_ids(
                    station_name=start.get("name", ""),
                    tmap_lon=start.get("lon", 0),
                    tmap_lat=start.get("lat", 0),
                )

                # 하차 정류소 ID 조회
                end = leg.get("end", {})
                end_station = cls.get_station_ids(
                    station_name=end.get("name", ""),
                    tmap_lon=end.get("lon", 0),
                    tmap_lat=end.get("lat", 0),
                )

                converted_legs.append(
                    {
                        "mode": "BUS",
                        "bus_route_id": bus_route_id,
                        "bus_route_name": bus_number,
                        "start_station": start_station,
                        "end_station": end_station,
                        "pass_shape": leg.get("passShape", {}).get("linestring"),
                    }
                )

            elif mode == "SUBWAY":
                # 호선명 파싱
                subway_line = cls.parse_subway_line(leg.get("route", ""))
                subway_line_id = SUBWAY_LINE_MAP.get(subway_line)

                # 경유역 목록
                pass_stops = []
                for station in leg.get("passStopList", {}).get("stations", []):
                    pass_stops.append(station.get("stationName"))

                converted_legs.append(
                    {
                        "mode": "SUBWAY",
                        "subway_line": subway_line,
                        "subway_line_id": subway_line_id,
                        "start_station": leg.get("start", {}).get("name"),
                        "end_station": leg.get("end", {}).get("name"),
                        "pass_stops": pass_stops,
                        "pass_shape": leg.get("passShape", {}).get("linestring"),
                    }
                )

        return {"legs": converted_legs}
