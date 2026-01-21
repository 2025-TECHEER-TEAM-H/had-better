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
        - "수도권9호선(급행)" → "9호선"
        - "9호선(일반)" → "9호선"

        Args:
            tmap_route: TMAP route 필드 값

        Returns:
            호선명
        """
        result = tmap_route

        # "수도권" prefix 제거
        if result.startswith("수도권"):
            result = result[3:]

        # "(급행)", "(일반)" 등 suffix 제거
        if "(" in result:
            result = result.split("(")[0]

        return result

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

            # 디버깅: API 응답 로깅
            logger.info(
                f"버스 노선 검색: bus_number={bus_number}, "
                f"검색 결과 개수={len(routes)}"
            )
            if routes:
                logger.info(f"검색된 노선 목록: {[r.get('busRouteNm') for r in routes]}")

            for route in routes:
                if route.get("busRouteNm") == bus_number:
                    route_id = route.get("busRouteId")
                    logger.info(f"노선 ID 찾음: {bus_number} → {route_id}")
                    return route_id

            # 정확히 일치하는 것이 없으면 첫 번째 결과 사용 (부분 매칭)
            if routes:
                route_id = routes[0].get("busRouteId")
                route_name = routes[0].get("busRouteNm")
                logger.warning(
                    f"정확한 노선명 매칭 실패, 첫 번째 결과 사용: "
                    f"검색={bus_number}, 찾음={route_name}, route_id={route_id}"
                )
                return route_id

            logger.warning(f"버스 노선 ID를 찾을 수 없음: {bus_number}")
            return None
        except Exception as e:
            logger.error(f"버스 노선 ID 조회 실패: bus_number={bus_number}, error={e}")
            return None

    @staticmethod
    def get_station_ids(
        station_name: str,
        tmap_lon: float,
        tmap_lat: float,
        bus_route_id: Optional[str] = None,
    ) -> Optional[dict]:
        """
        정류소명과 좌표로 공공데이터 정류소 ID 조회

        동일한 이름의 정류소가 여러 개 있을 경우 (상행/하행),
        TMAP 좌표와 가장 가까운 정류소를 선택합니다.

        Args:
            station_name: 정류소명
            tmap_lon: TMAP 경도
            tmap_lat: TMAP 위도
            bus_route_id: 버스 노선 ID (선택사항, 제공 시 노선 정차 여부 검증)

        Returns:
            { stId, arsId, name, lon, lat } 또는 None
        """
        try:
            # 정류소명 풀네임으로 검색 (10자 제한 제거)
            search_name = station_name

            stations = bus_api_client.get_station_by_name(search_name)

            # 디버깅: API 응답 로깅
            logger.info(
                f"정류소 검색: station_name={station_name}, "
                f"search_name={search_name}, 검색 결과 개수={len(stations)}"
            )

            if not stations:
                logger.warning(
                    f"정류소를 찾을 수 없음: station_name={station_name}, "
                    f"tmap_coords=({tmap_lon}, {tmap_lat})"
                )
                return None

            # 1순위: 정류소명이 정확히 일치하는 것 찾기
            exact_matches = [
                s for s in stations if s.get("stNm") == station_name
            ]

            # 노선 검증이 필요한 경우
            if bus_route_id:
                # 노선의 정류소 목록 조회
                route_stations = bus_api_client.get_station_by_route(bus_route_id)
                route_station_ids = {s.get("station") for s in route_stations}

                logger.info(
                    f"노선 정류소 검증: bus_route_id={bus_route_id}, "
                    f"노선 정류소 개수={len(route_station_ids)}"
                )

                # 정확 매칭된 것 중 노선에 정차하는 것만 필터링
                if exact_matches:
                    verified_matches = [
                        s for s in exact_matches
                        if s.get("stId") in route_station_ids
                    ]

                    if verified_matches:
                        if len(verified_matches) == 1:
                            closest = verified_matches[0]
                            logger.info(
                                f"정류소명 정확 매칭 + 노선 검증 성공: "
                                f"station_name={station_name}, stId={closest.get('stId')}"
                            )
                        else:
                            closest = find_closest_station(tmap_lat, tmap_lon, verified_matches)
                            logger.info(
                                f"정류소명 정확 매칭 + 노선 검증 (거리 선택): "
                                f"station_name={station_name}, stId={closest.get('stId')}, "
                                f"매칭 개수={len(verified_matches)}"
                            )
                    else:
                        # 정확 매칭은 있지만 노선에 정차 안함 → 거리 기반으로 노선 정류소에서 선택
                        logger.warning(
                            f"정류소명 정확 매칭 실패 (노선 불일치): "
                            f"station_name={station_name}, 정확매칭={len(exact_matches)}개, "
                            f"노선정차=0개 → 거리 기반 선택"
                        )
                        # 전체 검색 결과 중 노선 정류소만 필터링
                        verified_all = [
                            s for s in stations
                            if s.get("stId") in route_station_ids
                        ]
                        if verified_all:
                            closest = find_closest_station(tmap_lat, tmap_lon, verified_all)
                        else:
                            logger.error(
                                f"노선 정류소 찾기 실패: station_name={station_name}, "
                                f"bus_route_id={bus_route_id}"
                            )
                            return None
                else:
                    # 정확 매칭 없음 → 거리 기반으로 노선 정류소에서 선택
                    verified_all = [
                        s for s in stations
                        if s.get("stId") in route_station_ids
                    ]
                    if verified_all:
                        closest = find_closest_station(tmap_lat, tmap_lon, verified_all)
                        logger.warning(
                            f"정류소명 정확 매칭 실패 (거리 기반 + 노선 검증): "
                            f"station_name={station_name}, "
                            f"후보={len(stations)}개, 노선정차={len(verified_all)}개"
                        )
                    else:
                        logger.error(
                            f"노선 정류소 찾기 실패: station_name={station_name}, "
                            f"bus_route_id={bus_route_id}"
                        )
                        return None
            else:
                # 노선 검증 불필요 (기존 로직)
                if exact_matches:
                    # 정확히 일치하는 정류소가 여러 개면 거리로 판단
                    if len(exact_matches) == 1:
                        closest = exact_matches[0]
                        logger.info(
                            f"정류소명 정확 매칭: station_name={station_name}, "
                            f"stId={closest.get('stId')}, 매칭 개수=1"
                        )
                    else:
                        closest = find_closest_station(tmap_lat, tmap_lon, exact_matches)
                        logger.info(
                            f"정류소명 정확 매칭 (거리 기반 선택): station_name={station_name}, "
                            f"stId={closest.get('stId')}, 매칭 개수={len(exact_matches)}"
                        )
                else:
                    # 2순위: 정확한 매칭 없으면 거리 기반 선택 (기존 로직)
                    logger.warning(
                        f"정류소명 정확 매칭 실패 (거리 기반 선택): station_name={station_name}, "
                        f"후보 개수={len(stations)}"
                    )
                    closest = find_closest_station(tmap_lat, tmap_lon, stations)

            if closest:
                try:
                    lon = float(closest.get("tmX", 0))
                    lat = float(closest.get("tmY", 0))
                except (ValueError, TypeError):
                    lon, lat = 0, 0

                st_id = closest.get("stId")
                st_nm = closest.get("stNm")
                ars_id = closest.get("arsId")

                # 디버깅: 선택된 정류소 상세 정보
                logger.info(
                    f"정류소 ID 찾음: TMAP_이름={station_name} → "
                    f"실제_이름={st_nm}, stId={st_id}, arsId={ars_id}, "
                    f"좌표=({lat:.6f}, {lon:.6f})"
                )

                return {
                    "stId": st_id,
                    "arsId": ars_id,
                    "name": st_nm,
                    "lon": lon,
                    "lat": lat,
                }

            logger.warning(
                f"가까운 정류소 없음: station_name={station_name}, "
                f"tmap_coords=({tmap_lon}, {tmap_lat}), candidates={len(stations)}"
            )
            return None
        except Exception as e:
            logger.error(
                f"정류소 ID 조회 실패: station_name={station_name}, "
                f"coords=({tmap_lon}, {tmap_lat}), error={e}"
            )
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

                # 승차 정류소 ID 조회 (노선 검증 포함)
                start = leg.get("start", {})
                start_station = cls.get_station_ids(
                    station_name=start.get("name", ""),
                    tmap_lon=start.get("lon", 0),
                    tmap_lat=start.get("lat", 0),
                    bus_route_id=bus_route_id,  # 노선 검증 추가
                )

                # 하차 정류소 ID 조회 (노선 검증 포함)
                end = leg.get("end", {})
                end_station = cls.get_station_ids(
                    station_name=end.get("name", ""),
                    tmap_lon=end.get("lon", 0),
                    tmap_lat=end.get("lat", 0),
                    bus_route_id=bus_route_id,  # 노선 검증 추가
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
