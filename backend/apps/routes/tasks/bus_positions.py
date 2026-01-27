"""
Celery 태스크 - 버스 실시간 위치 데이터 캐싱

외부 API에서 버스 위치 데이터를 주기적으로 가져와 Redis에 캐싱합니다.
Django API는 Redis에서 바로 읽어서 빠르게 응답할 수 있습니다.
"""

import json
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

from django.core.cache import cache

from celery import shared_task

from ..utils.bus_api_client import bus_api_client

logger = logging.getLogger(__name__)

# 캐시 키
BUS_POSITIONS_CACHE_KEY = "bus:positions:all"
BUS_POSITIONS_CACHE_TTL = 65  # 65초 (60초 폴링 + 여유 5초)

# 서울시 주요 버스 노선 목록 (15개로 축소 - API 제한 고려)
# 60초마다 15개 노선 조회 = 분당 15회 = 시간당 900회 = 하루 21,600회
# 공공데이터포털 기본 할당량(1,000회/일) 초과하므로 할당량 증가 신청 필요
POPULAR_BUS_ROUTES = [
    # 간선버스 (파랑) - 8개 (주요 노선)
    ("100100057", "360"),  # 360번 (강남-마포)
    ("100100118", "472"),  # 472번 (강남-신촌)
    ("100100016", "151"),  # 151번 (중랑-여의도)
    ("100100043", "261"),  # 261번 (마포-강남)
    ("100100001", "100"),  # 100번 (용산-중구)
    ("100100065", "402"),  # 402번 (종로-서초)
    ("100100124", "501"),  # 501번 (방배-광화문)
    ("100100019", "162"),  # 162번 (광진-여의도)
    # 지선버스 (초록) - 5개
    ("100100463", "5513"),  # 5513번
    ("100100559", "6411"),  # 6411번
    ("100100609", "7011"),  # 7011번
    ("100100650", "7211"),  # 7211번
    ("100100428", "5524"),  # 5524번
    # 광역버스 (빨강) - 2개
    ("100100260", "9401"),  # 9401번
    ("100100261", "9402"),  # 9402번
]


def fetch_route_buses(route_info: tuple) -> list:
    """단일 노선의 버스 위치 조회"""
    route_id, bus_number = route_info
    result = []

    try:
        buses = bus_api_client.get_bus_positions_by_route(route_id)

        for bus in buses:
            try:
                lon = float(bus.get("gpsX") or bus.get("tmX") or 0)
                lat = float(bus.get("gpsY") or bus.get("tmY") or 0)

                if not lon or not lat:
                    continue

                sect_ord = bus.get("sectOrd")

                result.append(
                    {
                        "veh_id": bus.get("vehId"),
                        "route_id": route_id,
                        "bus_number": bus_number,
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
            except (ValueError, TypeError):
                continue

    except Exception as e:
        logger.warning(f"노선 {route_id} 버스 위치 조회 실패: {e}")

    return result


@shared_task(bind=True, name="apps.routes.tasks.fetch_all_bus_positions")
def fetch_all_bus_positions(self):
    """
    모든 인기 노선의 버스 위치를 조회하여 Redis에 캐싱

    Celery Beat이 30초마다 이 태스크를 실행합니다.
    """
    logger.info("버스 위치 데이터 수집 시작...")

    all_buses = []

    # 병렬로 모든 노선 조회 (최대 15개 스레드)
    with ThreadPoolExecutor(max_workers=15) as executor:
        futures = {
            executor.submit(fetch_route_buses, route): route
            for route in POPULAR_BUS_ROUTES
        }

        for future in as_completed(futures):
            try:
                buses = future.result()
                all_buses.extend(buses)
            except Exception as e:
                route = futures[future]
                logger.error(f"노선 {route} 조회 중 오류: {e}")

    # Redis에 캐싱
    cache_data = {
        "buses": all_buses,
        "routes_count": len(POPULAR_BUS_ROUTES),
        "total_buses": len(all_buses),
    }

    cache.set(
        BUS_POSITIONS_CACHE_KEY, json.dumps(cache_data), timeout=BUS_POSITIONS_CACHE_TTL
    )

    logger.info(
        f"버스 위치 데이터 캐싱 완료: {len(all_buses)}대 (노선 {len(POPULAR_BUS_ROUTES)}개)"
    )

    return {
        "total_buses": len(all_buses),
        "routes_count": len(POPULAR_BUS_ROUTES),
    }


@shared_task(name="apps.routes.tasks.get_cached_bus_positions")
def get_cached_bus_positions():
    """
    Redis에서 캐싱된 버스 위치 데이터 조회 (디버그/테스트용)
    """
    cached = cache.get(BUS_POSITIONS_CACHE_KEY)

    if cached:
        data = json.loads(cached)
        return {
            "status": "hit",
            "total_buses": data.get("total_buses", 0),
            "routes_count": data.get("routes_count", 0),
        }

    return {"status": "miss"}
