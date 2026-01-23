"""
봇 상태 관리 서비스 (v3)

역할:
- 봇 상태 Enum 정의 (확장된 상태)
- 봇 상태 초기화/조회/업데이트/삭제
- 상태 전환 메서드 (WALKING, WAITING_BUS, RIDING_BUS 등)
- 도착 예정 시간 기반 동적 폴링 간격 결정
"""

from enum import Enum
from typing import Optional

from django.utils import timezone

from ..utils.redis_client import redis_client


def get_seoul_timestamp() -> str:
    """서울 시간대 타임스탬프 반환"""
    return timezone.localtime(timezone.now()).isoformat()


class BotStatus(str, Enum):
    """봇 상태 Enum (v3 확장)"""

    WALKING = "WALKING"
    WAITING_BUS = "WAITING_BUS"
    RIDING_BUS = "RIDING_BUS"
    WAITING_SUBWAY = "WAITING_SUBWAY"
    RIDING_SUBWAY = "RIDING_SUBWAY"
    FINISHED = "FINISHED"


class BotStateManager:
    """봇 상태 관리 서비스 (v3)"""

    @staticmethod
    def initialize(
        route_id: int,
        bot_id: int,
        legs: list,
        start_lon: float = None,
        start_lat: float = None,
    ) -> dict:
        """
        봇 초기 상태 생성

        Args:
            route_id: 경주 ID
            bot_id: 봇 ID
            legs: TMAP legs 배열
            start_lon: 출발지 경도 (초기 위치)
            start_lat: 출발지 위도 (초기 위치)

        Returns:
            생성된 봇 상태
        """
        # 첫 번째 leg의 mode에 따라 초기 상태 결정
        initial_status = BotStatus.WALKING.value
        initial_position = None

        if legs and len(legs) > 0:
            first_leg = legs[0]
            first_mode = first_leg.get("mode", "WALK")

            # 첫 번째 leg의 mode에 따라 상태 설정
            if first_mode == "BUS":
                initial_status = BotStatus.WAITING_BUS.value
            elif first_mode == "SUBWAY":
                initial_status = BotStatus.WAITING_SUBWAY.value
            else:
                initial_status = BotStatus.WALKING.value

            # 초기 위치 설정 (첫 번째 leg의 시작점)
            start = first_leg.get("start", {})
            if start.get("lon") and start.get("lat"):
                initial_position = {"lon": start["lon"], "lat": start["lat"]}

        # 출발지 좌표가 명시적으로 제공된 경우 우선 사용
        if start_lon and start_lat:
            initial_position = {"lon": start_lon, "lat": start_lat}

        state = {
            "route_id": route_id,
            "bot_id": bot_id,
            "status": initial_status,
            "current_leg_index": 0,
            "total_legs": len(legs),
            "leg_started_at": get_seoul_timestamp(),
            "vehicle_id": None,
            "arrival_time": None,  # v3: 도착 예정 시간 (초)
            "next_poll_interval": 30,  # v3: 다음 폴링 간격
            "current_position": initial_position,  # v3: 현재 위치 좌표 (출발지)
            "progress_percent": 0,  # v3: 진행률 (0%)
        }
        redis_client.set_bot_state(route_id, state)
        return state

    @staticmethod
    def get(route_id: int) -> Optional[dict]:
        """
        봇 상태 조회

        Args:
            route_id: 경주 ID

        Returns:
            봇 상태 딕셔너리 또는 None
        """
        return redis_client.get_bot_state(route_id)

    @staticmethod
    def update(route_id: int, **kwargs) -> Optional[dict]:
        """
        봇 상태 부분 업데이트 (원자적 업데이트)

        분산 락을 사용하여 동시성 문제를 방지합니다.

        Args:
            route_id: 경주 ID
            **kwargs: 업데이트할 필드들

        Returns:
            업데이트된 봇 상태 또는 None
        """
        return redis_client.update_bot_state_atomic(route_id, **kwargs)

    @staticmethod
    def delete(route_id: int) -> None:
        """
        봇 상태 삭제

        봇 상태와 함께 공공데이터 ID 캐시도 삭제합니다.

        Args:
            route_id: 경주 ID
        """
        redis_client.delete_bot_state(route_id)
        redis_client.delete_public_ids(route_id)
        redis_client.delete_api_call_cache(route_id)

    @staticmethod
    def transition_to_waiting_bus(route_id: int, leg_index: int) -> Optional[dict]:
        """
        WAITING_BUS 상태로 전환

        Args:
            route_id: 경주 ID
            leg_index: 현재 leg 인덱스

        Returns:
            업데이트된 봇 상태
        """
        return BotStateManager.update(
            route_id,
            status=BotStatus.WAITING_BUS.value,
            current_leg_index=leg_index,
            leg_started_at=get_seoul_timestamp(),
            vehicle_id=None,
            arrival_time=None,
            next_poll_interval=30,
        )

    @staticmethod
    def transition_to_riding_bus(route_id: int, vehicle_id: str) -> Optional[dict]:
        """
        RIDING_BUS 상태로 전환

        Args:
            route_id: 경주 ID
            vehicle_id: 버스 차량 ID (vehId)

        Returns:
            업데이트된 봇 상태
        """
        return BotStateManager.update(
            route_id,
            status=BotStatus.RIDING_BUS.value,
            vehicle_id=vehicle_id,
            arrival_time=None,
            next_poll_interval=30,
        )

    @staticmethod
    def transition_to_waiting_subway(route_id: int, leg_index: int) -> Optional[dict]:
        """
        WAITING_SUBWAY 상태로 전환

        Args:
            route_id: 경주 ID
            leg_index: 현재 leg 인덱스

        Returns:
            업데이트된 봇 상태
        """
        return BotStateManager.update(
            route_id,
            status=BotStatus.WAITING_SUBWAY.value,
            current_leg_index=leg_index,
            leg_started_at=get_seoul_timestamp(),
            vehicle_id=None,
            arrival_time=None,
            next_poll_interval=30,
        )

    @staticmethod
    def transition_to_riding_subway(route_id: int, train_no: str) -> Optional[dict]:
        """
        RIDING_SUBWAY 상태로 전환

        Args:
            route_id: 경주 ID
            train_no: 열차번호

        Returns:
            업데이트된 봇 상태
        """
        return BotStateManager.update(
            route_id,
            status=BotStatus.RIDING_SUBWAY.value,
            vehicle_id=train_no,
            arrival_time=None,
            next_poll_interval=30,
        )

    @staticmethod
    def transition_to_walking(route_id: int, leg_index: int) -> Optional[dict]:
        """
        WALKING 상태로 전환

        Args:
            route_id: 경주 ID
            leg_index: 현재 leg 인덱스

        Returns:
            업데이트된 봇 상태
        """
        return BotStateManager.update(
            route_id,
            status=BotStatus.WALKING.value,
            current_leg_index=leg_index,
            leg_started_at=get_seoul_timestamp(),
            vehicle_id=None,
            arrival_time=None,
            next_poll_interval=30,
        )

    @staticmethod
    def transition_to_finished(route_id: int) -> Optional[dict]:
        """
        FINISHED 상태로 전환

        Args:
            route_id: 경주 ID

        Returns:
            업데이트된 봇 상태
        """
        return BotStateManager.update(
            route_id,
            status=BotStatus.FINISHED.value,
            next_poll_interval=None,
        )

    @staticmethod
    def update_arrival_time(route_id: int, arrival_time: int) -> int:
        """
        도착 예정 시간 업데이트 및 다음 폴링 간격 결정

        2분(120초) 이내면 15초 주기, 그 외에는 30초 주기로 설정합니다.
        이는 일일 트래픽 제한(1000회)을 고려한 설계입니다.

        Args:
            route_id: 경주 ID
            arrival_time: 도착 예정 시간 (초)

        Returns:
            다음 폴링 간격 (15초 또는 30초)
        """
        # 2분(120초) 이내면 15초, 그 외 30초
        next_interval = 15 if arrival_time <= 120 else 30

        BotStateManager.update(
            route_id,
            arrival_time=arrival_time,
            next_poll_interval=next_interval,
        )

        return next_interval

    @staticmethod
    def update_position(route_id: int, lon: float, lat: float) -> Optional[dict]:
        """
        현재 위치 좌표 업데이트

        Args:
            route_id: 경주 ID
            lon: 경도
            lat: 위도

        Returns:
            업데이트된 봇 상태
        """
        return BotStateManager.update(
            route_id,
            current_position={"lon": lon, "lat": lat},
        )

    @staticmethod
    def update_retry_count(route_id: int, count: int) -> Optional[dict]:
        """
        API 재시도 카운터 업데이트

        Args:
            route_id: 경주 ID
            count: 재시도 횟수

        Returns:
            업데이트된 봇 상태
        """
        return BotStateManager.update(
            route_id,
            api_retry_count=count,
        )

    @staticmethod
    def reset_retry_count(route_id: int) -> Optional[dict]:
        """
        API 재시도 카운터 리셋

        Args:
            route_id: 경주 ID

        Returns:
            업데이트된 봇 상태
        """
        return BotStateManager.update(
            route_id,
            api_retry_count=0,
        )
