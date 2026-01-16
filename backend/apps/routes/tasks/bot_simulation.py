"""
봇 시뮬레이션 Celery Task (v3 - 동적 주기)

역할:
- 봇 위치 업데이트 (상태별 처리)
- 공공데이터 API 호출 및 실시간 정보 조회
- 동적 폴링 주기 결정 (15초/30초)
- SSE 이벤트 발행

주기:
- 기본: 30초
- 도착 임박 (2분 이내): 15초
"""

import logging
from datetime import datetime

from celery import shared_task
from django.utils import timezone

from ..models import Route
from ..services.bot_state import BotStateManager, BotStatus
from ..services.sse_publisher import SSEPublisher
from ..utils.redis_client import redis_client
from ..utils.bus_api_client import bus_api_client
from ..utils.subway_api_client import subway_api_client
from ..utils.geo_utils import calculate_distance

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def update_bot_position(self, route_id: int) -> dict:
    """
    봇 위치 업데이트 Task (v3 - 동적 주기)

    이 Task는 실행 후 다음 Task를 동적 주기로 예약합니다.
    - 기본: 30초
    - 도착 임박 (2분 이내): 15초

    Args:
        route_id: 경주 ID

    Returns:
        실행 결과 딕셔너리
    """
    try:
        # 1. 봇 상태 조회
        bot_state = BotStateManager.get(route_id)
        if not bot_state:
            logger.warning(f"봇 상태 없음: route_id={route_id}")
            return {"status": "no_state", "route_id": route_id}

        # 2. 이미 종료된 경우
        if bot_state["status"] == BotStatus.FINISHED.value:
            logger.info(f"봇 이미 종료됨: route_id={route_id}")
            return {"status": "already_finished", "route_id": route_id}

        # 3. 공공데이터 ID 조회
        public_ids = redis_client.get_public_ids(route_id)
        if not public_ids:
            logger.warning(f"공공데이터 ID 없음: route_id={route_id}")
            return {"status": "no_public_ids", "route_id": route_id}

        # 4. 경로 데이터 조회
        try:
            route = Route.objects.select_related("route_leg").get(id=route_id)
            legs = route.route_leg.legs
            route_itinerary_id = route.route_itinerary_id
        except Route.DoesNotExist:
            logger.error(f"경주를 찾을 수 없음: route_id={route_id}")
            return {"status": "route_not_found", "route_id": route_id}

        current_leg_index = bot_state["current_leg_index"]

        # 인덱스 범위 체크
        if current_leg_index >= len(legs):
            _finish_bot(route_id, route_itinerary_id, bot_state)
            return {"status": "finished", "route_id": route_id}

        current_leg = legs[current_leg_index]
        current_public_leg = public_ids["legs"][current_leg_index]

        # 5. 상태별 처리 + 다음 폴링 간격 결정
        next_interval = 30  # 기본값

        if bot_state["status"] == BotStatus.WALKING.value:
            next_interval = _handle_walking(
                route_id, route_itinerary_id, bot_state, current_leg, legs, public_ids
            )

        elif bot_state["status"] == BotStatus.WAITING_BUS.value:
            next_interval = _handle_waiting_bus(
                route_id, route_itinerary_id, bot_state, current_leg, current_public_leg
            )

        elif bot_state["status"] == BotStatus.RIDING_BUS.value:
            next_interval = _handle_riding_bus(
                route_id, route_itinerary_id, bot_state, current_leg, current_public_leg, legs, public_ids
            )

        elif bot_state["status"] == BotStatus.WAITING_SUBWAY.value:
            next_interval = _handle_waiting_subway(
                route_id, route_itinerary_id, bot_state, current_leg, current_public_leg
            )

        elif bot_state["status"] == BotStatus.RIDING_SUBWAY.value:
            next_interval = _handle_riding_subway(
                route_id, route_itinerary_id, bot_state, current_leg, current_public_leg, legs, public_ids
            )

        # 6. 다음 Task 예약 (종료되지 않은 경우)
        updated_state = BotStateManager.get(route_id)
        if updated_state and updated_state["status"] != BotStatus.FINISHED.value:
            update_bot_position.apply_async(args=[route_id], countdown=next_interval)

        return {
            "status": "updated",
            "route_id": route_id,
            "next_interval": next_interval,
        }

    except Exception as e:
        logger.exception(f"봇 위치 업데이트 실패: route_id={route_id}, error={e}")
        # 재시도
        raise self.retry(exc=e, countdown=30)


def _handle_walking(
    route_id: int,
    route_itinerary_id: int,
    bot_state: dict,
    current_leg: dict,
    legs: list,
    public_ids: dict,
) -> int:
    """WALKING 상태 처리"""
    leg_started_at = datetime.fromisoformat(bot_state["leg_started_at"])

    # 타임존 처리
    if leg_started_at.tzinfo is None:
        leg_started_at = timezone.make_aware(leg_started_at)

    elapsed = (timezone.now() - leg_started_at).total_seconds()
    section_time = current_leg.get("sectionTime", 0)

    # 진행률 계산
    progress_percent = min((elapsed / section_time) * 100, 100) if section_time > 0 else 100

    # SSE 발행
    SSEPublisher.publish_bot_status_update(
        route_itinerary_id=route_itinerary_id,
        bot_state={**bot_state, "progress_percent": progress_percent},
        next_update_in=30,
    )

    # 도보 구간 완료
    if elapsed >= section_time:
        next_leg_index = bot_state["current_leg_index"] + 1

        if next_leg_index >= len(legs):
            _finish_bot(route_id, route_itinerary_id, bot_state)
            return 30

        next_leg = legs[next_leg_index]

        if next_leg["mode"] == "BUS":
            BotStateManager.transition_to_waiting_bus(route_id, next_leg_index)
        elif next_leg["mode"] == "SUBWAY":
            BotStateManager.transition_to_waiting_subway(route_id, next_leg_index)
        else:
            BotStateManager.transition_to_walking(route_id, next_leg_index)

    return 30


def _handle_waiting_bus(
    route_id: int,
    route_itinerary_id: int,
    bot_state: dict,
    current_leg: dict,
    public_leg: dict,
) -> int:
    """WAITING_BUS 상태 처리"""
    bus_route_id = public_leg.get("bus_route_id")
    start_station = public_leg.get("start_station", {})
    st_id = start_station.get("stId") if start_station else None

    if not bus_route_id or not st_id:
        logger.warning(
            f"버스 정보 부족: route_id={route_id}, "
            f"bus_route_id={bus_route_id}, st_id={st_id}"
        )
        SSEPublisher.publish_bot_status_update(
            route_itinerary_id=route_itinerary_id,
            bot_state=bot_state,
            next_update_in=30,
        )
        return 30

    # 도착정보 조회
    arrival_info = bus_api_client.get_arrival_info(st_id, bus_route_id)

    if not arrival_info:
        SSEPublisher.publish_bot_status_update(
            route_itinerary_id=route_itinerary_id,
            bot_state=bot_state,
            next_update_in=30,
        )
        return 30

    veh_id = arrival_info.get("vehId1")
    tra_time = int(arrival_info.get("traTime1", 0) or 0)
    arrmsg = arrival_info.get("arrmsg1", "")

    # 버스 위치 조회 (vehId가 있을 때)
    bus_position = None
    if veh_id and veh_id != "0":
        pos = bus_api_client.get_bus_position(veh_id)
        if pos:
            try:
                bus_position = {
                    "lon": float(pos.get("tmX", 0)),
                    "lat": float(pos.get("tmY", 0)),
                    "stopFlag": int(pos.get("stopFlag", 0)),
                }
            except (ValueError, TypeError):
                pass

    # 탑승 여부 확인
    if tra_time <= 0 or "도착" in arrmsg:
        # 탑승!
        BotStateManager.transition_to_riding_bus(route_id, veh_id)

        SSEPublisher.publish_bot_boarding(
            route_itinerary_id=route_itinerary_id,
            route_id=route_id,
            bot_id=bot_state["bot_id"],
            station_name=start_station.get("name", ""),
            vehicle={
                "type": "BUS",
                "route": public_leg.get("bus_route_name"),
                "vehId": veh_id,
            },
        )
        return 30

    # 대기 중 - 동적 주기 결정
    next_interval = BotStateManager.update_arrival_time(route_id, tra_time)

    SSEPublisher.publish_bot_status_update(
        route_itinerary_id=route_itinerary_id,
        bot_state={**bot_state, "arrival_time": tra_time},
        vehicle_info={
            "type": "BUS",
            "route": public_leg.get("bus_route_name"),
            "vehId": veh_id,
            "arrival_message": arrmsg,
            "position": bus_position,
        },
        next_update_in=next_interval,
    )

    return next_interval


def _handle_riding_bus(
    route_id: int,
    route_itinerary_id: int,
    bot_state: dict,
    current_leg: dict,
    public_leg: dict,
    legs: list,
    public_ids: dict,
) -> int:
    """RIDING_BUS 상태 처리"""
    veh_id = bot_state.get("vehicle_id")
    if not veh_id:
        return 30

    # 버스 위치 조회
    pos = bus_api_client.get_bus_position(veh_id)
    if not pos:
        SSEPublisher.publish_bot_status_update(
            route_itinerary_id=route_itinerary_id,
            bot_state=bot_state,
            next_update_in=30,
        )
        return 30

    try:
        bus_lon = float(pos.get("tmX", 0))
        bus_lat = float(pos.get("tmY", 0))
        stop_flag = int(pos.get("stopFlag", 0))
    except (ValueError, TypeError):
        return 30

    # 하차 정류소 도착 확인
    end_station = public_leg.get("end_station", {})
    if end_station:
        end_lon = end_station.get("lon", 0)
        end_lat = end_station.get("lat", 0)

        distance = calculate_distance(bus_lat, bus_lon, end_lat, end_lon)

        if distance < 50:  # 50m 이내면 하차
            # 하차 처리
            SSEPublisher.publish_bot_alighting(
                route_itinerary_id=route_itinerary_id,
                route_id=route_id,
                bot_id=bot_state["bot_id"],
                station_name=end_station.get("name", ""),
            )

            next_leg_index = bot_state["current_leg_index"] + 1

            if next_leg_index >= len(legs):
                _finish_bot(route_id, route_itinerary_id, bot_state)
                return 30

            next_leg = legs[next_leg_index]

            if next_leg["mode"] == "WALK":
                BotStateManager.transition_to_walking(route_id, next_leg_index)
            elif next_leg["mode"] == "SUBWAY":
                BotStateManager.transition_to_waiting_subway(route_id, next_leg_index)
            elif next_leg["mode"] == "BUS":
                BotStateManager.transition_to_waiting_bus(route_id, next_leg_index)

            return 30

    # 탑승 중 SSE 발행
    SSEPublisher.publish_bot_status_update(
        route_itinerary_id=route_itinerary_id,
        bot_state=bot_state,
        vehicle_info={
            "type": "BUS",
            "route": public_leg.get("bus_route_name"),
            "vehId": veh_id,
            "position": {"lon": bus_lon, "lat": bus_lat},
            "stopFlag": stop_flag,
        },
        next_update_in=30,
    )

    return 30


def _handle_waiting_subway(
    route_id: int,
    route_itinerary_id: int,
    bot_state: dict,
    current_leg: dict,
    public_leg: dict,
) -> int:
    """WAITING_SUBWAY 상태 처리"""
    start_station = public_leg.get("start_station")
    end_station = public_leg.get("end_station")
    subway_line = public_leg.get("subway_line")
    subway_line_id = public_leg.get("subway_line_id")

    if not start_station:
        SSEPublisher.publish_bot_status_update(
            route_itinerary_id=route_itinerary_id,
            bot_state=bot_state,
            next_update_in=30,
        )
        return 30

    # 도착정보 조회
    arrivals = subway_api_client.get_arrival_info(start_station)

    # 방향 필터링
    target_train = subway_api_client.filter_by_direction(
        arrivals, subway_line_id, end_station
    )

    if not target_train:
        SSEPublisher.publish_bot_status_update(
            route_itinerary_id=route_itinerary_id,
            bot_state=bot_state,
            next_update_in=30,
        )
        return 30

    train_no = target_train.get("btrainNo")
    arrival_time = int(target_train.get("barvlDt", 0) or 0)
    arvl_msg = target_train.get("arvlMsg2", "")
    arvl_msg3 = target_train.get("arvlMsg3", "")

    # 탑승 여부 확인
    if arrival_time <= 0 or arvl_msg == "도착":
        # 탑승!
        BotStateManager.transition_to_riding_subway(route_id, train_no)

        SSEPublisher.publish_bot_boarding(
            route_itinerary_id=route_itinerary_id,
            route_id=route_id,
            bot_id=bot_state["bot_id"],
            station_name=start_station,
            vehicle={
                "type": "SUBWAY",
                "route": subway_line,
                "trainNo": train_no,
            },
        )
        return 30

    # 대기 중 - 동적 주기 결정
    next_interval = BotStateManager.update_arrival_time(route_id, arrival_time)

    # 열차 위치 조회
    train_position = None
    if train_no and subway_line:
        positions = subway_api_client.get_train_position(subway_line)
        pos = subway_api_client.filter_by_train_no(positions, train_no)
        if pos:
            train_position = {
                "current_station": pos.get("statnNm"),
                "train_status": pos.get("trainSttus"),
            }

    SSEPublisher.publish_bot_status_update(
        route_itinerary_id=route_itinerary_id,
        bot_state={**bot_state, "arrival_time": arrival_time},
        vehicle_info={
            "type": "SUBWAY",
            "route": subway_line,
            "trainNo": train_no,
            "arrival_message": arvl_msg,
            "arrival_detail": arvl_msg3,
            "position": train_position,
        },
        next_update_in=next_interval,
    )

    return next_interval


def _handle_riding_subway(
    route_id: int,
    route_itinerary_id: int,
    bot_state: dict,
    current_leg: dict,
    public_leg: dict,
    legs: list,
    public_ids: dict,
) -> int:
    """RIDING_SUBWAY 상태 처리"""
    train_no = bot_state.get("vehicle_id")
    subway_line = public_leg.get("subway_line")
    end_station = public_leg.get("end_station")
    pass_stops = public_leg.get("pass_stops", [])

    if not train_no or not subway_line:
        return 30

    # 열차 위치 조회
    positions = subway_api_client.get_train_position(subway_line)
    pos = subway_api_client.filter_by_train_no(positions, train_no)

    if not pos:
        SSEPublisher.publish_bot_status_update(
            route_itinerary_id=route_itinerary_id,
            bot_state=bot_state,
            next_update_in=30,
        )
        return 30

    current_station = pos.get("statnNm")
    train_status = pos.get("trainSttus")

    # 하차역 도착 확인
    if current_station == end_station:
        # 하차!
        SSEPublisher.publish_bot_alighting(
            route_itinerary_id=route_itinerary_id,
            route_id=route_id,
            bot_id=bot_state["bot_id"],
            station_name=end_station,
        )

        next_leg_index = bot_state["current_leg_index"] + 1

        if next_leg_index >= len(legs):
            _finish_bot(route_id, route_itinerary_id, bot_state)
            return 30

        next_leg = legs[next_leg_index]

        if next_leg["mode"] == "WALK":
            BotStateManager.transition_to_walking(route_id, next_leg_index)
        elif next_leg["mode"] == "BUS":
            BotStateManager.transition_to_waiting_bus(route_id, next_leg_index)
        elif next_leg["mode"] == "SUBWAY":
            BotStateManager.transition_to_waiting_subway(route_id, next_leg_index)

        return 30

    # 현재 역 인덱스 계산
    current_idx = 0
    if current_station in pass_stops:
        current_idx = pass_stops.index(current_station)

    SSEPublisher.publish_bot_status_update(
        route_itinerary_id=route_itinerary_id,
        bot_state=bot_state,
        vehicle_info={
            "type": "SUBWAY",
            "route": subway_line,
            "trainNo": train_no,
            "current_station": current_station,
            "current_station_index": current_idx,
            "total_stations": len(pass_stops),
            "train_status": train_status,
        },
        next_update_in=30,
    )

    return 30


def _finish_bot(route_id: int, route_itinerary_id: int, bot_state: dict) -> None:
    """봇 경주 종료 처리"""
    BotStateManager.transition_to_finished(route_id)

    try:
        route = Route.objects.get(id=route_id)
        route.end_time = timezone.now()

        if route.start_time:
            route.duration = (route.end_time - route.start_time).total_seconds()
        else:
            route.duration = 0

        route.status = "FINISHED"
        route.save()

        # 순위 계산
        rank = (
            Route.objects.filter(
                route_itinerary_id=route_itinerary_id,
                end_time__isnull=False,
                duration__lt=route.duration,
            ).count()
            + 1
        )

        SSEPublisher.publish_participant_finished(
            route_itinerary_id=route_itinerary_id,
            participant={
                "route_id": route_id,
                "type": "BOT",
                "bot_id": bot_state["bot_id"],
            },
            rank=rank,
            duration=int(route.duration),
        )

        # 모든 참가자 완주 여부 확인
        unfinished = Route.objects.filter(
            route_itinerary_id=route_itinerary_id,
            end_time__isnull=True,
        ).count()

        if unfinished == 0:
            SSEPublisher.publish_route_ended(route_itinerary_id)

    except Route.DoesNotExist:
        logger.error(f"경주를 찾을 수 없음: route_id={route_id}")

    # 봇 상태 정리
    BotStateManager.delete(route_id)
