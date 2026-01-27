import logging
from datetime import timedelta
from typing import Any, Dict, Optional

from django.utils import timezone

from apps.routes.models import Route
from apps.routes.utils.bus_api_client import bus_api_client

logger = logging.getLogger(__name__)


class UserBusMonitor:
    """
    유저 경로(Route)에 대한 버스 도착 정보 모니터링 서비스 (최적화 버전)

    특징:
    1. 정류장 도착 예정 시간(ETA) 기준 -3분 ~ +1분 사이에만 API 호출
    2. 호출 활성화 구간에서도 10초 주기로 제한 (Throttle)
    3. 테스트 모드에서는 계획된 도보 시간을 기준으로 ETA 계산
    """

    def __init__(self, route_id: int):
        self.route_id = route_id
        self.is_initialized = False

        # 정적 정보 캐싱
        self.bus_name = None
        self.public_route_id = None
        self.station_id = None
        self.station_ord = None
        self.start_station_name = None
        self.station_lon = None  # 정류장 경도
        self.station_lat = None  # 정류장 위도

        # 시간 제어 관련
        self.arrival_eta = None  # 정류장 도착 예정 시각
        self.last_call_time = None  # 마지막 API 호출 시각
        self.call_interval = 10  # 호출 주기 (초)

    def initialize(self) -> bool:
        """초기화: 노선 정보 및 도착 예정 시간(ETA) 계산"""
        try:
            route = Route.objects.select_related("route_leg").get(id=self.route_id)
        except Route.DoesNotExist:
            logger.error(f"[UserBusMonitor] Route {self.route_id} not found.")
            return False

        # 1. 버스 구간 및 도보 시간 추출
        raw_data = route.route_leg.raw_data
        legs = raw_data.get("legs", [])

        accumulated_seconds = 0
        target_bus_leg = None

        for leg in legs:
            mode = leg.get("mode")
            if mode == "BUS":
                target_bus_leg = leg
                break
            # 버스 타기 전까지의 모든 구간(주로 WALK) 시간을 합산
            accumulated_seconds += leg.get("sectionTime", 0)

        if not target_bus_leg:
            return False

        # 2. 버스 정보 파싱
        tmap_bus_name_raw = target_bus_leg.get("route", "Unknown")
        self.bus_name = (
            tmap_bus_name_raw.split(":")[-1]
            if ":" in tmap_bus_name_raw
            else tmap_bus_name_raw
        )
        start_info = target_bus_leg.get("start", {})
        self.start_station_name = start_info.get("name")
        self.station_lon = start_info.get("lon")
        self.station_lat = start_info.get("lat")

        # 3. ETA 계산 (시작 시간 + 버스 전까지의 소요 시간)
        self.arrival_eta = route.start_time + timedelta(seconds=accumulated_seconds)
        logger.info(f"[UserBusMonitor] Route Start: {route.start_time}")
        logger.info(
            f"[UserBusMonitor] Walk Time: {accumulated_seconds}s, ETA: {self.arrival_eta}"
        )

        # 4. 공공데이터 노선 ID 조회
        route_list = bus_api_client.get_bus_route_list(self.bus_name)
        if route_list:
            for r in route_list:
                if r.get("busRouteNm") == self.bus_name:
                    self.public_route_id = r.get("busRouteId")
                    break

        if not self.public_route_id and route_list:
            self.public_route_id = route_list[0].get("busRouteId")

        if not self.public_route_id:
            return False

        # 5. 정류소 ID 조회
        stations = bus_api_client.get_station_by_route(self.public_route_id)
        target_station = None
        for st in stations:
            st_name = st.get("stationNm") or st.get("stNm")
            if st_name == self.start_station_name or (
                st_name
                and st_name.replace(" ", "") == self.start_station_name.replace(" ", "")
            ):
                target_station = st
                break

        if not target_station:
            return False

        self.station_id = (
            target_station.get("station")
            or target_station.get("stationId")
            or target_station.get("stId")
        )
        seq = (
            target_station.get("seq")
            or target_station.get("staOrder")
            or target_station.get("stationSeq")
        )
        self.station_ord = int(seq) if seq else None

        self.is_initialized = True
        return True

    def check_arrival(self) -> Optional[Dict[str, Any]]:
        """실시간 도착 정보 조회 (최적화 로직 적용)"""
        if not self.is_initialized:
            if not self.initialize():
                return None

        now = timezone.now()

        # 1. 호출 윈도우 체크 (ETA 기준 -3분 ~ +1분)
        start_window = self.arrival_eta - timedelta(minutes=3)
        end_window = self.arrival_eta + timedelta(minutes=1)

        if now < start_window:
            # 아직 정류장 가는 중 (너무 일찍임)
            return {
                "bus_name": self.bus_name,
                "station_name": self.start_station_name,
                "station_lon": self.station_lon,
                "station_lat": self.station_lat,
                "status": "WAITING_FOR_WINDOW",
                "arrival_message": f"정류장 이동 중... (조회 시작까지 {int((start_window - now).total_seconds())}초 남음)",
                "remaining_time": -1,
                "vehicle_id": None,
            }

        if now > end_window:
            # 이미 버스 시간이 지남
            return {
                "bus_name": self.bus_name,
                "station_name": self.start_station_name,
                "station_lon": self.station_lon,
                "station_lat": self.station_lat,
                "status": "WINDOW_CLOSED",
                "arrival_message": "조회 가능 시간이 종료되었습니다.",
                "remaining_time": -1,
                "vehicle_id": None,
            }

        # 2. 호출 주기 체크 (10초 Throttle)
        if (
            self.last_call_time
            and (now - self.last_call_time).total_seconds() < self.call_interval
        ):
            # 아직 10초 안 지남 (Skip API call)
            return None

        # 3. 실제 API 호출
        self.last_call_time = now
        logger.info(
            "[UserBusMonitor] Calling Bus API (Window: -3m ~ +1m, Interval: 10s)"
        )

        arrival_info = bus_api_client.get_arrival_info(
            self.station_id, self.public_route_id, self.station_ord
        )

        if not arrival_info:
            return None

        return {
            "bus_name": self.bus_name,
            "station_name": self.start_station_name,
            "station_lon": self.station_lon,
            "station_lat": self.station_lat,
            "arrival_message": arrival_info.get("arrmsg1", "정보 없음"),
            "remaining_time": arrival_info.get("traTime1", "0"),
            "vehicle_id": arrival_info.get("vehId1", "Unknown"),
            "status": "ACTIVE",
        }
