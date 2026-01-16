"""
좌표 계산 유틸리티

역할:
- 두 좌표 사이의 거리 계산 (Haversine 공식)
- TMAP 좌표와 가장 가까운 정류소 찾기 (상행/하행 구분)
"""

import math
from typing import Optional


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    두 좌표 사이의 거리 계산 (미터)
    Haversine 공식 사용

    Args:
        lat1: 첫 번째 좌표의 위도
        lon1: 첫 번째 좌표의 경도
        lat2: 두 번째 좌표의 위도
        lon2: 두 번째 좌표의 경도

    Returns:
        거리 (미터)
    """
    R = 6371000  # 지구 반지름 (미터)

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def find_closest_station(
    tmap_lat: float, tmap_lon: float, stations: list[dict]
) -> Optional[dict]:
    """
    TMAP 좌표와 가장 가까운 정류소 찾기

    동일한 이름의 정류소가 여러 개 있을 경우 (상행/하행),
    TMAP 좌표와 가장 가까운 정류소를 선택합니다.

    Args:
        tmap_lat: TMAP 위도
        tmap_lon: TMAP 경도
        stations: 정류소 목록 [{ stId, stNm, arsId, tmX(경도), tmY(위도), ... }]

    Returns:
        가장 가까운 정류소 또는 None
    """
    if not stations:
        return None

    closest = None
    min_distance = float("inf")

    for station in stations:
        try:
            # 공공데이터 API 응답에서 tmX는 경도, tmY는 위도
            station_lon = float(station.get("tmX", 0))
            station_lat = float(station.get("tmY", 0))
        except (ValueError, TypeError):
            continue

        if station_lat == 0 or station_lon == 0:
            continue

        dist = calculate_distance(tmap_lat, tmap_lon, station_lat, station_lon)

        if dist < min_distance:
            min_distance = dist
            closest = station

    return closest
