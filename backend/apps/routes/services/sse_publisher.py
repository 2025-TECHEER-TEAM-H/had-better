"""
SSE 이벤트 발행 서비스 (v3)

역할:
- RabbitMQ를 통해 SSE 이벤트 발행
- 봇 상태 업데이트, 탑승/하차, 참가자 도착, 경주 종료 이벤트

이벤트 타입:
- bot_status_update: 봇 상태 업데이트 (5초 주기)
- bot_boarding: 봇 탑승 (버스/지하철)
- bot_alighting: 봇 하차
- participant_finished: 참가자 도착
- route_ended: 경주 종료

주의:
- rabbitmq_client.publish()는 route_itinerary_id를 사용합니다.
- 같은 경주의 모든 참가자가 동일한 Exchange를 구독합니다.
"""

import logging
from typing import Optional

from django.utils import timezone

from ..utils.rabbitmq_client import rabbitmq_client

logger = logging.getLogger(__name__)


class SSEPublisher:
    """SSE 이벤트 발행 서비스 (v3)"""

    @staticmethod
    def publish_bot_status_update(
        route_itinerary_id: int,
        bot_state: dict,
        vehicle_info: Optional[dict] = None,
        next_update_in: int = 30,
    ) -> None:
        """
        봇 상태 업데이트 이벤트 발행 (v3 확장)

        Args:
            route_itinerary_id: 경로 탐색 결과 ID (Exchange 식별용)
            bot_state: 봇 상태 딕셔너리
            vehicle_info: 차량 정보 (위치, 도착정보 등)
            next_update_in: 다음 업데이트까지 시간 (초)
        """
        data = {
            "route_id": bot_state["route_id"],
            "bot_id": bot_state["bot_id"],
            "status": bot_state["status"],
            "leg_index": bot_state["current_leg_index"],
            "progress_percent": bot_state.get("progress_percent"),
            "arrival_time": bot_state.get("arrival_time"),
            "next_update_in": next_update_in,
            "timestamp": timezone.now().isoformat(),
        }

        if vehicle_info:
            data["vehicle"] = vehicle_info

        if bot_state.get("current_position"):
            data["position"] = bot_state["current_position"]

        logger.info(
            f"SSE 발행: route_itinerary_id={route_itinerary_id}, "
            f"event=bot_status_update, route_id={data['route_id']}"
        )
        result = rabbitmq_client.publish(
            route_itinerary_id=route_itinerary_id,
            event_type="bot_status_update",
            data=data,
        )
        logger.info(f"SSE 발행 결과: {result}")

    @staticmethod
    def publish_bot_boarding(
        route_itinerary_id: int,
        route_id: int,
        bot_id: int,
        station_name: str,
        vehicle: dict,
    ) -> None:
        """
        봇 탑승 이벤트 발행

        Args:
            route_itinerary_id: 경로 탐색 결과 ID (Exchange 식별용)
            route_id: 봇의 경주 ID
            bot_id: 봇 ID
            station_name: 탑승 정류소/역 이름
            vehicle: 차량 정보 {
                type: "BUS" | "SUBWAY",
                route: 노선명 (예: "6625", "2호선"),
                vehId: 차량 ID (버스),
                trainNo: 열차번호 (지하철)
            }
        """
        rabbitmq_client.publish(
            route_itinerary_id=route_itinerary_id,
            event_type="bot_boarding",
            data={
                "route_id": route_id,
                "bot_id": bot_id,
                "station_name": station_name,
                "vehicle": vehicle,
                "timestamp": timezone.now().isoformat(),
            },
        )

    @staticmethod
    def publish_bot_alighting(
        route_itinerary_id: int,
        route_id: int,
        bot_id: int,
        station_name: str,
    ) -> None:
        """
        봇 하차 이벤트 발행

        Args:
            route_itinerary_id: 경로 탐색 결과 ID (Exchange 식별용)
            route_id: 봇의 경주 ID
            bot_id: 봇 ID
            station_name: 하차 정류소/역 이름
        """
        rabbitmq_client.publish(
            route_itinerary_id=route_itinerary_id,
            event_type="bot_alighting",
            data={
                "route_id": route_id,
                "bot_id": bot_id,
                "station_name": station_name,
                "next_action": "WALKING",
                "timestamp": timezone.now().isoformat(),
            },
        )

    @staticmethod
    def publish_participant_finished(
        route_itinerary_id: int,
        participant: dict,
        rank: int,
        duration: int,
    ) -> None:
        """
        참가자 도착 이벤트 발행

        Args:
            route_itinerary_id: 경로 탐색 결과 ID (Exchange 식별용)
            participant: 참가자 정보 {
                route_id: 경주 ID,
                type: "BOT" | "USER",
                bot_id: 봇 ID (봇인 경우)
            }
            rank: 도착 순위
            duration: 소요 시간 (초)
        """
        rabbitmq_client.publish(
            route_itinerary_id=route_itinerary_id,
            event_type="participant_finished",
            data={
                "participant": participant,
                "rank": rank,
                "duration": duration,
                "timestamp": timezone.now().isoformat(),
            },
        )

    @staticmethod
    def publish_route_ended(
        route_itinerary_id: int,
        reason: str = "all_finished",
    ) -> None:
        """
        경주 종료 이벤트 발행

        Args:
            route_itinerary_id: 경로 탐색 결과 ID (Exchange 식별용)
            reason: 종료 사유 ("all_finished", "canceled", "timeout")
        """
        rabbitmq_client.publish(
            route_itinerary_id=route_itinerary_id,
            event_type="route_ended",
            data={
                "route_itinerary_id": route_itinerary_id,
                "reason": reason,
                "timestamp": timezone.now().isoformat(),
            },
        )

    @staticmethod
    def publish_heartbeat(route_itinerary_id: int) -> None:
        """
        하트비트 이벤트 발행

        연결 유지를 위해 30초 주기로 발행합니다.

        Args:
            route_itinerary_id: 경로 탐색 결과 ID (Exchange 식별용)
        """
        rabbitmq_client.publish(
            route_itinerary_id=route_itinerary_id,
            event_type="heartbeat",
            data={
                "route_itinerary_id": route_itinerary_id,
                "timestamp": timezone.now().isoformat(),
            },
        )

    @staticmethod
    def publish_error(
        route_itinerary_id: int,
        error_code: str,
        error_message: str,
    ) -> None:
        """
        에러 이벤트 발행

        Args:
            route_itinerary_id: 경로 탐색 결과 ID (Exchange 식별용)
            error_code: 에러 코드
            error_message: 에러 메시지
        """
        rabbitmq_client.publish(
            route_itinerary_id=route_itinerary_id,
            event_type="error",
            data={
                "route_itinerary_id": route_itinerary_id,
                "error_code": error_code,
                "error_message": error_message,
                "timestamp": timezone.now().isoformat(),
            },
        )
