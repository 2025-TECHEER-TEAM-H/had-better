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
from celery.exceptions import SoftTimeLimitExceeded
from django.utils import timezone

from ..models import Route
from ..services.bot_state import BotStateManager, BotStatus
from ..services.sse_publisher import SSEPublisher
from ..utils.redis_client import redis_client, RedisConnectionError
from ..utils.bus_api_client import bus_api_client
from ..utils.subway_api_client import subway_api_client
from ..utils.geo_utils import calculate_distance

logger = logging.getLogger(__name__)

# API 재시도 설정
MAX_API_RETRIES = 3  # API 재시도 횟수
API_RETRY_INTERVAL = 10  # 10초 간격
MAX_WAITING_TIME = 30 * 60  # 버스 최대 대기 시간: 30분 (초 단위)


def is_night_time() -> bool:
    """심야 시간대 확인 (00:00~05:00)"""
    hour = timezone.now().hour
    return 0 <= hour < 5


def _parse_pass_shape(pass_shape) -> list:
    """
    pass_shape 데이터를 좌표 배열로 파싱

    Args:
        pass_shape: 다양한 형태의 pass_shape 데이터
            - 문자열: "lon,lat lon,lat lon,lat ..."
            - 리스트: [[lon, lat], [lon, lat], ...]
            - None

    Returns:
        좌표 배열 [[lon, lat], [lon, lat], ...] 또는 빈 리스트
    """
    if not pass_shape:
        return []

    # 이미 리스트인 경우
    if isinstance(pass_shape, list):
        # 첫 번째 요소가 리스트/튜플인지 확인
        if pass_shape and isinstance(pass_shape[0], (list, tuple)):
            return pass_shape
        return []

    # 문자열인 경우 파싱
    if isinstance(pass_shape, str):
        try:
            coords = []
            # 공백으로 구분된 좌표들
            for coord_str in pass_shape.strip().split():
                if ',' in coord_str:
                    parts = coord_str.split(',')
                    if len(parts) >= 2:
                        lon = float(parts[0])
                        lat = float(parts[1])
                        coords.append([lon, lat])
            return coords
        except (ValueError, IndexError) as e:
            logger.warning(f"pass_shape 파싱 실패: {e}, value={pass_shape[:100]}...")
            return []

    return []


def _estimate_current_station(
    elapsed: float, section_time: int, pass_stops: list
) -> str | None:
    """
    경과 시간 기반 현재 역/정류장 추정

    Args:
        elapsed: 탑승 후 경과 시간 (초)
        section_time: 전체 소요 시간 (초)
        pass_stops: 경유 정류장/역 목록 (문자열 리스트)

    Returns:
        현재 추정 역/정류장명 또는 None
    """
    if not pass_stops or len(pass_stops) < 2:
        return None

    if section_time <= 0:
        return pass_stops[0]

    progress = min(elapsed / section_time, 1.0)  # 0.0 ~ 1.0
    index = int(progress * (len(pass_stops) - 1))

    return pass_stops[min(index, len(pass_stops) - 1)]


def _calculate_total_progress(
    legs: list,
    current_leg_index: int,
    leg_elapsed_seconds: float,
    current_leg_section_time: int,
) -> float:
    """
    전체 경로 기준 진행률 계산

    Args:
        legs: 전체 경로 legs 배열
        current_leg_index: 현재 leg 인덱스
        leg_elapsed_seconds: 현재 leg에서 경과한 시간(초)
        current_leg_section_time: 현재 leg의 예상 소요 시간(초)

    Returns:
        전체 진행률 (0~100)
    """
    # 전체 예상 시간 계산
    total_time = sum(leg.get("sectionTime", 0) for leg in legs)
    if total_time <= 0:
        return 0

    # 완료된 leg들의 시간 합산
    completed_time = sum(legs[i].get("sectionTime", 0) for i in range(current_leg_index))

    # 현재 leg의 진행 시간 (sectionTime을 초과하지 않도록)
    current_leg_progress_time = min(leg_elapsed_seconds, current_leg_section_time)

    # 전체 진행률
    total_elapsed = completed_time + current_leg_progress_time
    progress = (total_elapsed / total_time) * 100

    return min(progress, 100)


@shared_task(
    bind=True,
    max_retries=3,
    soft_time_limit=60,  # 소프트 타임아웃: 60초 (경고 발생)
    time_limit=90,  # 하드 타임아웃: 90초 (Task 강제 종료)
    acks_late=True,  # 작업 완료 후 ACK (실패 시 재시도 가능)
)
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
        # 0. 경주 상태 확인 (CANCELED/FINISHED 체크) - Task 조기 종료
        try:
            route_check = Route.objects.only("id", "status").get(id=route_id)
            if route_check.status in ["CANCELED", "FINISHED"]:
                logger.info(f"경주 종료됨 (Task 중단): route_id={route_id}, status={route_check.status}")
                # 봇 상태 정리
                BotStateManager.delete(route_id)
                return {"status": "route_ended", "route_id": route_id, "reason": route_check.status}
        except Route.DoesNotExist:
            logger.warning(f"경주를 찾을 수 없음 (Task 중단): route_id={route_id}")
            BotStateManager.delete(route_id)
            return {"status": "route_not_found", "route_id": route_id}

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
            legs = route.route_leg.raw_data.get("legs", [])
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
                route_id, route_itinerary_id, bot_state, current_leg, current_public_leg, legs
            )

        elif bot_state["status"] == BotStatus.RIDING_BUS.value:
            next_interval = _handle_riding_bus(
                route_id, route_itinerary_id, bot_state, current_leg, current_public_leg, legs, public_ids
            )

        elif bot_state["status"] == BotStatus.WAITING_SUBWAY.value:
            next_interval = _handle_waiting_subway(
                route_id, route_itinerary_id, bot_state, current_leg, current_public_leg, legs
            )

        elif bot_state["status"] == BotStatus.RIDING_SUBWAY.value:
            next_interval = _handle_riding_subway(
                route_id, route_itinerary_id, bot_state, current_leg, current_public_leg, legs, public_ids
            )

        # 6. 다음 Task 예약 (종료되지 않은 경우)
        updated_state = BotStateManager.get(route_id)
        if updated_state and updated_state["status"] != BotStatus.FINISHED.value:
            result = update_bot_position.apply_async(args=[route_id], countdown=next_interval)
            # Task ID 저장 (즉시 취소용)
            redis_client.set_task_id(route_id, result.id)

        return {
            "status": "updated",
            "route_id": route_id,
            "next_interval": next_interval,
        }

    except SoftTimeLimitExceeded:
        # 소프트 타임아웃: Task가 너무 오래 걸림 (60초 초과)
        logger.warning(f"봇 위치 업데이트 타임아웃: route_id={route_id}")
        # 다음 Task는 예약하고 현재 Task는 종료
        result = update_bot_position.apply_async(args=[route_id], countdown=30)
        # Task ID 저장 (즉시 취소용)
        redis_client.set_task_id(route_id, result.id)
        return {"status": "timeout", "route_id": route_id}

    except RedisConnectionError as e:
        # Redis 연결 오류: 재시도
        logger.warning(f"Redis 연결 오류 (재시도 예정): route_id={route_id}, error={e}")
        raise self.retry(exc=e, countdown=10, max_retries=5)

    except Exception as e:
        logger.exception(f"봇 위치 업데이트 실패: route_id={route_id}, error={e}")
        # 재시도
        raise self.retry(exc=e, countdown=30)


def _calculate_walking_position(current_leg: dict, progress: float) -> tuple:
    """
    도보 구간에서 진행률 기반 현재 위치 계산

    Args:
        current_leg: 현재 leg 데이터
        progress: 현재 leg 내 진행률 (0.0 ~ 1.0)

    Returns:
        (lon, lat) 튜플 또는 None
    """
    # pass_shape가 있으면 경로 위에서 보간
    pass_shape = current_leg.get("passShape", {})
    linestring = pass_shape.get("linestring") if isinstance(pass_shape, dict) else None

    if linestring:
        coords = _parse_pass_shape(linestring)
        if coords and len(coords) >= 2:
            # 진행률에 해당하는 좌표 인덱스 계산
            idx = int(progress * (len(coords) - 1))
            idx = max(0, min(idx, len(coords) - 1))
            return coords[idx][0], coords[idx][1]

    # pass_shape가 없으면 start/end 선형 보간
    start = current_leg.get("start", {})
    end = current_leg.get("end", {})

    start_lon = start.get("lon", 0)
    start_lat = start.get("lat", 0)
    end_lon = end.get("lon", 0)
    end_lat = end.get("lat", 0)

    if start_lon and start_lat and end_lon and end_lat:
        lon = start_lon + (end_lon - start_lon) * progress
        lat = start_lat + (end_lat - start_lat) * progress
        return lon, lat

    return None


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

    # 현재 leg 내 진행률 (0.0 ~ 1.0)
    leg_progress = min(elapsed / section_time, 1.0) if section_time > 0 else 0

    # 현재 위치 계산 및 업데이트
    position = _calculate_walking_position(current_leg, leg_progress)
    if position:
        BotStateManager.update_position(route_id, lon=position[0], lat=position[1])

    # 전체 경로 기준 진행률 계산
    progress_percent = _calculate_total_progress(
        legs, bot_state["current_leg_index"], elapsed, section_time
    )

    # 업데이트된 봇 상태 조회 (current_position 포함)
    updated_bot_state = BotStateManager.get(route_id) or bot_state

    # SSE 발행
    SSEPublisher.publish_bot_status_update(
        route_itinerary_id=route_itinerary_id,
        bot_state={**updated_bot_state, "progress_percent": progress_percent},
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


def _handle_waiting_bus_fallback(
    route_id: int,
    route_itinerary_id: int,
    bot_state: dict,
    current_leg: dict,
    public_leg: dict,
    legs: list,
) -> int:
    """
    WAITING_BUS 시간 기반 fallback 처리

    공공데이터 API를 사용할 수 없는 경우 (경기버스 등)
    TMAP 예상 시간의 20%를 대기 시간으로 사용
    """
    # 대기 상태 진행률 계산
    progress_percent = _calculate_total_progress(
        legs, bot_state["current_leg_index"], 0, current_leg.get("sectionTime", 0)
    )

    # 정류장 위치로 봇 위치 업데이트
    start_station = public_leg.get("start_station") or {}
    station_lon = start_station.get("lon")
    station_lat = start_station.get("lat")
    if station_lon and station_lat:
        BotStateManager.update_position(route_id, lon=float(station_lon), lat=float(station_lat))

    leg_started_at = datetime.fromisoformat(bot_state["leg_started_at"])
    if leg_started_at.tzinfo is None:
        leg_started_at = timezone.make_aware(leg_started_at)

    elapsed = (timezone.now() - leg_started_at).total_seconds()

    # TMAP 예상 시간의 20%를 대기 시간으로 사용 (최소 60초, 최대 300초)
    section_time = current_leg.get("sectionTime", 300)
    wait_time = max(60, min(section_time * 0.2, 300))

    if elapsed >= wait_time:
        # 대기 완료 → 탑승 처리
        BotStateManager.transition_to_riding_bus(route_id, "fallback")

        # start_station이 None일 수 있으므로 안전하게 처리
        start_station = public_leg.get("start_station") or {}
        station_name = start_station.get("name", "")

        SSEPublisher.publish_bot_boarding(
            route_itinerary_id=route_itinerary_id,
            route_id=route_id,
            bot_id=bot_state["bot_id"],
            station_name=station_name,
            vehicle={
                "type": "BUS",
                "route": public_leg.get("bus_route_name"),
                "vehId": "fallback",
            },
        )
        return 30

    # 대기 중 - 남은 시간 계산
    remaining = int(wait_time - elapsed)

    # 업데이트된 봇 상태 조회 (current_position 포함)
    updated_bot_state = BotStateManager.get(route_id) or bot_state

    SSEPublisher.publish_bot_status_update(
        route_itinerary_id=route_itinerary_id,
        bot_state={**updated_bot_state, "arrival_time": remaining, "progress_percent": progress_percent},
        vehicle_info={
            "type": "BUS",
            "route": public_leg.get("bus_route_name"),
            "vehId": None,
            "arrival_message": f"약 {remaining}초 후 도착 (예상)",
            "position": None,
        },
        next_update_in=30,
    )

    return 30


def _handle_riding_bus_fallback(
    route_id: int,
    route_itinerary_id: int,
    bot_state: dict,
    current_leg: dict,
    public_leg: dict,
    legs: list,
    public_ids: dict,
) -> int:
    """
    RIDING_BUS 시간 기반 fallback 처리

    공공데이터 API를 사용할 수 없는 경우
    TMAP 예상 시간을 기반으로 하차 처리
    """
    leg_started_at = datetime.fromisoformat(bot_state["leg_started_at"])
    if leg_started_at.tzinfo is None:
        leg_started_at = timezone.make_aware(leg_started_at)

    elapsed = (timezone.now() - leg_started_at).total_seconds()
    section_time = current_leg.get("sectionTime", 600)
    distance = current_leg.get("distance", 0)

    # 짧은 구간 감지: 500m 미만이고 30초 경과 시 즉시 하차
    if distance < 500 and elapsed >= 30:
        logger.warning(
            f"짧은 버스 구간 감지 (fallback 즉시 하차): "
            f"route_id={route_id}, distance={distance}m, elapsed={elapsed}s"
        )
        SSEPublisher.publish_bot_alighting(
            route_itinerary_id=route_itinerary_id,
            route_id=route_id,
            bot_id=bot_state["bot_id"],
            station_name=public_leg.get("end_station", {}).get("name", ""),
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

    # 전체 경로 기준 진행률 계산
    progress_percent = _calculate_total_progress(
        legs, bot_state["current_leg_index"], elapsed, section_time
    )

    if elapsed >= section_time:
        # 하차 처리 (end_station이 None일 수 있으므로 안전하게 처리)
        end_station = public_leg.get("end_station") or {}
        station_name = end_station.get("name", "")

        SSEPublisher.publish_bot_alighting(
            route_itinerary_id=route_itinerary_id,
            route_id=route_id,
            bot_id=bot_state["bot_id"],
            station_name=station_name,
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

    # 탑승 중 SSE 발행 (현재 정류장 추정 추가)
    pass_stops = public_leg.get("pass_stops", [])
    current_station = _estimate_current_station(elapsed, section_time, pass_stops)

    # 버스 위치 추정 (pass_shape 기반 보간)
    leg_progress = min(elapsed / section_time, 1.0) if section_time > 0 else 0
    pass_shape = public_leg.get("pass_shape")
    if pass_shape:
        coords = _parse_pass_shape(pass_shape)
        if coords and len(coords) >= 2:
            idx = int(leg_progress * (len(coords) - 1))
            idx = max(0, min(idx, len(coords) - 1))
            BotStateManager.update_position(route_id, lon=coords[idx][0], lat=coords[idx][1])

    # 업데이트된 봇 상태 조회 (current_position 포함)
    updated_bot_state = BotStateManager.get(route_id) or bot_state

    SSEPublisher.publish_bot_status_update(
        route_itinerary_id=route_itinerary_id,
        bot_state={**updated_bot_state, "progress_percent": progress_percent},
        vehicle_info={
            "type": "BUS",
            "route": public_leg.get("bus_route_name"),
            "vehId": "fallback",
            "currentStation": current_station,  # 추정된 현재 정류장
            "tracking_mode": "estimated",  # 추적 모드 명시
            "position": None,
            "pass_shape": public_leg.get("pass_shape"),  # 경로 보간용
        },
        next_update_in=30,
    )

    return 30


def _handle_waiting_subway_fallback(
    route_id: int,
    route_itinerary_id: int,
    bot_state: dict,
    current_leg: dict,
    public_leg: dict,
    legs: list,
) -> int:
    """
    WAITING_SUBWAY 시간 기반 fallback 처리

    공공데이터 API를 사용할 수 없는 경우
    고정 대기 시간 (120초) 사용
    """
    # 대기 상태 진행률 계산
    progress_percent = _calculate_total_progress(
        legs, bot_state["current_leg_index"], 0, current_leg.get("sectionTime", 0)
    )

    # 역 위치로 봇 위치 업데이트
    start = current_leg.get("start", {})
    start_lon = start.get("lon")
    start_lat = start.get("lat")
    if start_lon and start_lat:
        BotStateManager.update_position(route_id, lon=float(start_lon), lat=float(start_lat))

    leg_started_at = datetime.fromisoformat(bot_state["leg_started_at"])
    if leg_started_at.tzinfo is None:
        leg_started_at = timezone.make_aware(leg_started_at)

    elapsed = (timezone.now() - leg_started_at).total_seconds()
    wait_time = 120  # 2분 대기

    if elapsed >= wait_time:
        # 탑승 처리
        BotStateManager.transition_to_riding_subway(route_id, "fallback")

        SSEPublisher.publish_bot_boarding(
            route_itinerary_id=route_itinerary_id,
            route_id=route_id,
            bot_id=bot_state["bot_id"],
            station_name=public_leg.get("start_station", ""),
            vehicle={
                "type": "SUBWAY",
                "route": public_leg.get("subway_line"),
                "trainNo": "fallback",
            },
        )
        return 30

    remaining = int(wait_time - elapsed)

    # 업데이트된 봇 상태 조회 (current_position 포함)
    updated_bot_state = BotStateManager.get(route_id) or bot_state

    SSEPublisher.publish_bot_status_update(
        route_itinerary_id=route_itinerary_id,
        bot_state={**updated_bot_state, "arrival_time": remaining, "progress_percent": progress_percent},
        vehicle_info={
            "type": "SUBWAY",
            "route": public_leg.get("subway_line"),
            "trainNo": None,
            "arrival_message": f"약 {remaining}초 후 도착 (예상)",
        },
        next_update_in=30,
    )

    return 30


def _handle_riding_subway_fallback(
    route_id: int,
    route_itinerary_id: int,
    bot_state: dict,
    current_leg: dict,
    public_leg: dict,
    legs: list,
    public_ids: dict,
) -> int:
    """
    RIDING_SUBWAY 시간 기반 fallback 처리

    공공데이터 API를 사용할 수 없는 경우
    TMAP 예상 시간을 기반으로 하차 처리
    """
    leg_started_at = datetime.fromisoformat(bot_state["leg_started_at"])
    if leg_started_at.tzinfo is None:
        leg_started_at = timezone.make_aware(leg_started_at)

    elapsed = (timezone.now() - leg_started_at).total_seconds()
    section_time = current_leg.get("sectionTime", 600)
    distance = current_leg.get("distance", 0)

    # 짧은 구간 감지: 500m 미만이고 30초 경과 시 즉시 하차
    if distance < 500 and elapsed >= 30:
        logger.warning(
            f"짧은 지하철 구간 감지 (fallback 즉시 하차): "
            f"route_id={route_id}, distance={distance}m, elapsed={elapsed}s"
        )
        SSEPublisher.publish_bot_alighting(
            route_itinerary_id=route_itinerary_id,
            route_id=route_id,
            bot_id=bot_state["bot_id"],
            station_name=public_leg.get("end_station", ""),
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

    # 전체 경로 기준 진행률 계산
    progress_percent = _calculate_total_progress(
        legs, bot_state["current_leg_index"], elapsed, section_time
    )

    if elapsed >= section_time:
        # 하차 처리
        SSEPublisher.publish_bot_alighting(
            route_itinerary_id=route_itinerary_id,
            route_id=route_id,
            bot_id=bot_state["bot_id"],
            station_name=public_leg.get("end_station", ""),
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

    # 탑승 중 SSE 발행 (현재 역 추정 추가)
    pass_stops = public_leg.get("pass_stops", [])
    current_station = _estimate_current_station(elapsed, section_time, pass_stops)

    # 지하철 위치 추정 (pass_shape 기반 보간)
    leg_progress = min(elapsed / section_time, 1.0) if section_time > 0 else 0
    pass_shape = public_leg.get("pass_shape")
    if pass_shape:
        coords = _parse_pass_shape(pass_shape)
        if coords and len(coords) >= 2:
            idx = int(leg_progress * (len(coords) - 1))
            idx = max(0, min(idx, len(coords) - 1))
            BotStateManager.update_position(route_id, lon=coords[idx][0], lat=coords[idx][1])

    # 업데이트된 봇 상태 조회 (current_position 포함)
    updated_bot_state = BotStateManager.get(route_id) or bot_state

    SSEPublisher.publish_bot_status_update(
        route_itinerary_id=route_itinerary_id,
        bot_state={**updated_bot_state, "progress_percent": progress_percent},
        vehicle_info={
            "type": "SUBWAY",
            "route": public_leg.get("subway_line"),
            "trainNo": "fallback",
            "currentStation": current_station,  # 추정된 현재 역
            "tracking_mode": "estimated",  # 추적 모드 명시
            "pass_shape": public_leg.get("pass_shape"),  # 경로 보간용
        },
        next_update_in=30,
    )

    return 30


def _handle_waiting_bus(
    route_id: int,
    route_itinerary_id: int,
    bot_state: dict,
    current_leg: dict,
    public_leg: dict,
    legs: list,
) -> int:
    """WAITING_BUS 상태 처리"""
    bus_route_id = public_leg.get("bus_route_id")
    start_station = public_leg.get("start_station", {})
    st_id = start_station.get("stId") if start_station else None

    # 대기 상태 진행률 계산 (이전 leg들의 완료 시간 / 전체 시간)
    # 현재 leg는 아직 시작 안 했으므로 현재 leg 진행률 = 0
    progress_percent = _calculate_total_progress(
        legs, bot_state["current_leg_index"], 0, current_leg.get("sectionTime", 0)
    )

    # 정류장 위치로 봇 위치 업데이트
    if start_station:
        station_lon = start_station.get("lon")
        station_lat = start_station.get("lat")
        if station_lon and station_lat:
            BotStateManager.update_position(route_id, lon=float(station_lon), lat=float(station_lat))

    # 디버깅: 버스 정보 확인
    logger.info(
        f"버스 대기 시작: route_id={route_id}, "
        f"bus_route_id={bus_route_id}, st_id={st_id}, "
        f"bus_route_name={public_leg.get('bus_route_name')}"
    )

    # 버스 정보가 없으면 시간 기반 fallback 사용
    if not bus_route_id or not st_id:
        logger.warning(
            f"버스 정보 부족 (시간 기반 fallback): route_id={route_id}, "
            f"bus_route_id={bus_route_id}, st_id={st_id}"
        )
        return _handle_waiting_bus_fallback(
            route_id, route_itinerary_id, bot_state, current_leg, public_leg
        )

    # 도착정보 조회
    logger.info(
        f"버스 API 호출: route_id={route_id}, st_id={st_id}, bus_route_id={bus_route_id}"
    )
    arrival_info = bus_api_client.get_arrival_info(st_id, bus_route_id)
    logger.info(
        f"버스 API 응답: route_id={route_id}, arrival_info={'있음' if arrival_info else '없음'}"
    )

    # API 응답 상세 로깅
    if arrival_info:
        logger.info(
            f"버스 API 응답 상세: route_id={route_id}, "
            f"vehId1={arrival_info.get('vehId1')}, "
            f"traTime1={arrival_info.get('traTime1')}, "
            f"arrmsg1={arrival_info.get('arrmsg1')}, "
            f"vehId2={arrival_info.get('vehId2')}, "
            f"traTime2={arrival_info.get('traTime2')}, "
            f"arrmsg2={arrival_info.get('arrmsg2')}"
        )

    if not arrival_info:
        # API 재시도 로직
        retry_count = bot_state.get("api_retry_count", 0)

        if retry_count < MAX_API_RETRIES:
            # 재시도
            BotStateManager.update_retry_count(route_id, retry_count + 1)
            logger.info(
                f"버스 API 재시도 ({retry_count + 1}/{MAX_API_RETRIES}): "
                f"route_id={route_id}, st_id={st_id}, bus_route_id={bus_route_id}"
            )

            # 심야 시간대 대기 시간 증가
            wait_multiplier = 2.0 if is_night_time() else 1.0
            retry_interval = int(API_RETRY_INTERVAL * wait_multiplier)

            # 업데이트된 봇 상태 조회 (current_position 포함)
            updated_bot_state = BotStateManager.get(route_id) or bot_state

            SSEPublisher.publish_bot_status_update(
                route_itinerary_id=route_itinerary_id,
                bot_state={**updated_bot_state, "arrival_time": None, "progress_percent": progress_percent},
                vehicle_info={
                    "type": "BUS",
                    "route": public_leg.get("bus_route_name"),
                    "status": "searching",  # API 재시도 중
                },
                next_update_in=retry_interval,
            )
            return retry_interval
        else:
            # 최대 재시도 초과 → fallback 전환
            logger.warning(
                f"버스 API 최대 재시도 초과 → fallback 전환: route_id={route_id}"
            )
            BotStateManager.reset_retry_count(route_id)
            return _handle_waiting_bus_fallback(
                route_id, route_itinerary_id, bot_state, current_leg, public_leg, legs
            )

    # API 성공 → 재시도 카운터 리셋
    BotStateManager.reset_retry_count(route_id)

    # 첫 번째 버스 확인
    veh_id = arrival_info.get("vehId1")
    tra_time = int(arrival_info.get("traTime1", 0) or 0)
    arrmsg = arrival_info.get("arrmsg1", "")

    # vehId1이 없으면 두 번째 버스 확인
    if not veh_id or veh_id == "0":
        veh_id = arrival_info.get("vehId2")
        tra_time = int(arrival_info.get("traTime2", 0) or 0)
        arrmsg = arrival_info.get("arrmsg2", "")
        logger.info(
            f"첫 번째 버스 없음, 두 번째 버스 대기: route_id={route_id}, "
            f"vehId2={veh_id}, traTime2={tra_time}, arrmsg2={arrmsg}"
        )

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
    # traTime 기준만 사용: 30초 이하면 탑승 가능
    # 메시지 기준 제거: "곧 도착"이 93초 남았을 때도 나오므로 신뢰 불가
    is_boarding_time = tra_time <= 30  # 30초 이하만

    if is_boarding_time:
        # vehId가 유효한지 확인 (vehId1, vehId2 모두 없는 경우)
        if not veh_id or veh_id == "0":
            # 대기 시간 체크 (최대 30분)
            leg_started_at = bot_state.get("leg_started_at")
            if leg_started_at:
                try:
                    from dateutil import parser
                    started_time = parser.isoparse(leg_started_at)
                    elapsed = (timezone.now() - started_time).total_seconds()

                    if elapsed < MAX_WAITING_TIME:
                        logger.info(
                            f"버스 대기 중 (vehId 없음): route_id={route_id}, "
                            f"경과시간={int(elapsed)}초, 최대={MAX_WAITING_TIME}초, "
                            f"arrmsg={arrmsg}"
                        )
                        # 업데이트된 봇 상태 조회 (current_position 포함)
                        updated_bot_state = BotStateManager.get(route_id) or bot_state

                        # 30초 후 재시도
                        SSEPublisher.publish_bot_status_update(
                            route_itinerary_id=route_itinerary_id,
                            bot_state={**updated_bot_state, "arrival_time": None, "progress_percent": progress_percent},
                            vehicle_info={
                                "type": "BUS",
                                "route": public_leg.get("bus_route_name"),
                                "status": "waiting",
                                "message": arrmsg,
                            },
                            next_update_in=30,
                        )
                        return 30
                except Exception as e:
                    logger.error(f"대기 시간 파싱 오류: {e}")

            # 30분 초과 또는 시간 파싱 실패 → fallback 전환
            logger.warning(
                f"버스 최대 대기 시간 초과 (fallback 전환): route_id={route_id}, "
                f"tra_time={tra_time}, arrmsg={arrmsg}"
            )
            return _handle_waiting_bus_fallback(
                route_id, route_itinerary_id, bot_state, current_leg, public_leg, legs
            )

        # 탑승!
        logger.info(
            f"버스 탑승 판정: route_id={route_id}, veh_id={veh_id}, "
            f"tra_time={tra_time}, arrmsg={arrmsg}, "
            f"탑승조건=traTime<={tra_time}초"
        )
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

    # vehId가 "0"이면 None으로 표시 (버스 배차 없음)
    display_veh_id = veh_id if veh_id and veh_id != "0" else None

    # 업데이트된 봇 상태 조회 (current_position 포함)
    updated_bot_state = BotStateManager.get(route_id) or bot_state

    SSEPublisher.publish_bot_status_update(
        route_itinerary_id=route_itinerary_id,
        bot_state={**updated_bot_state, "arrival_time": tra_time, "progress_percent": progress_percent},
        vehicle_info={
            "type": "BUS",
            "route": public_leg.get("bus_route_name"),
            "vehId": display_veh_id,
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

    # fallback 모드인 경우 시간 기반 처리
    if veh_id == "fallback":
        return _handle_riding_bus_fallback(
            route_id, route_itinerary_id, bot_state, current_leg, public_leg, legs, public_ids
        )

    # 시간 계산
    leg_started_at = datetime.fromisoformat(bot_state["leg_started_at"])
    if leg_started_at.tzinfo is None:
        leg_started_at = timezone.make_aware(leg_started_at)
    elapsed = (timezone.now() - leg_started_at).total_seconds()

    # 디버깅: current_leg 데이터 확인
    logger.info(
        f"current_leg 데이터: keys={list(current_leg.keys())}, "
        f"sectionTime={current_leg.get('sectionTime')}, "
        f"route_id={route_id}"
    )

    section_time = current_leg.get("sectionTime", 600)

    # leg 기준 진행률 (하차 판정용)
    leg_progress = min((elapsed / section_time) * 100, 100) if section_time > 0 else 0

    # 전체 경로 기준 진행률 (SSE용)
    progress_percent = _calculate_total_progress(
        legs, bot_state["current_leg_index"], elapsed, section_time
    )

    # 버스 위치 조회
    pos = bus_api_client.get_bus_position(veh_id)
    if not pos:
        # API 응답 없을 때 시간 기반 하차 판정 (leg 기준 100%)
        if leg_progress >= 100:
            return _alight_from_bus(
                route_id, route_itinerary_id, bot_state, public_leg, legs
            )

        SSEPublisher.publish_bot_status_update(
            route_itinerary_id=route_itinerary_id,
            bot_state={**bot_state, "progress_percent": progress_percent},
            next_update_in=30,
        )
        return 30

    try:
        bus_lon = float(pos.get("tmX", 0))
        bus_lat = float(pos.get("tmY", 0))
        stop_flag = int(pos.get("stopFlag", 0))
    except (ValueError, TypeError):
        return 30

    # 버스 위치로 봇 위치 업데이트
    if bus_lon and bus_lat:
        BotStateManager.update_position(route_id, lon=bus_lon, lat=bus_lat)

    # 하차 정류소 도착 확인 (거리 기반만 사용)
    end_station = public_leg.get("end_station", {})
    should_alight = False

    if end_station:
        end_lon = end_station.get("lon", 0)
        end_lat = end_station.get("lat", 0)

        if end_lon and end_lat:
            distance = calculate_distance(bus_lat, bus_lon, end_lat, end_lon)
            logger.info(
                f"버스 위치 확인: route_id={route_id}, "
                f"distance_to_end={int(distance)}m, bus_pos=({bus_lat:.6f}, {bus_lon:.6f}), "
                f"end_pos=({end_lat:.6f}, {end_lon:.6f})"
            )
            if distance < 100:  # 100m 이내면 하차
                should_alight = True
                logger.info(f"버스 하차 판정 (거리): distance={distance}m")

    if should_alight:
        return _alight_from_bus(
            route_id, route_itinerary_id, bot_state, public_leg, legs
        )

    # 업데이트된 봇 상태 조회 (current_position 포함)
    updated_bot_state = BotStateManager.get(route_id) or bot_state

    # 탑승 중 SSE 발행
    SSEPublisher.publish_bot_status_update(
        route_itinerary_id=route_itinerary_id,
        bot_state={**updated_bot_state, "progress_percent": progress_percent},
        vehicle_info={
            "type": "BUS",
            "route": public_leg.get("bus_route_name"),
            "vehId": veh_id,
            "position": {"lon": bus_lon, "lat": bus_lat},
            "stopFlag": stop_flag,
            "pass_shape": public_leg.get("pass_shape"),  # 경로 보간용
        },
        next_update_in=30,
    )

    return 30


def _alight_from_bus(
    route_id: int,
    route_itinerary_id: int,
    bot_state: dict,
    public_leg: dict,
    legs: list,
) -> int:
    """버스 하차 처리 공통 함수"""
    end_station = public_leg.get("end_station", {})
    SSEPublisher.publish_bot_alighting(
        route_itinerary_id=route_itinerary_id,
        route_id=route_id,
        bot_id=bot_state["bot_id"],
        station_name=end_station.get("name", "") if end_station else "",
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


def _handle_waiting_subway(
    route_id: int,
    route_itinerary_id: int,
    bot_state: dict,
    current_leg: dict,
    public_leg: dict,
    legs: list,
) -> int:
    """WAITING_SUBWAY 상태 처리"""
    start_station = public_leg.get("start_station")
    end_station = public_leg.get("end_station")
    subway_line = public_leg.get("subway_line")
    subway_line_id = public_leg.get("subway_line_id")

    # 대기 상태 진행률 계산
    progress_percent = _calculate_total_progress(
        legs, bot_state["current_leg_index"], 0, current_leg.get("sectionTime", 0)
    )

    # 역 위치로 봇 위치 업데이트 (current_leg의 start 좌표 사용)
    start = current_leg.get("start", {})
    start_lon = start.get("lon")
    start_lat = start.get("lat")
    if start_lon and start_lat:
        BotStateManager.update_position(route_id, lon=float(start_lon), lat=float(start_lat))

    # subway_line_id가 없으면 fallback 사용
    if not subway_line_id:
        logger.warning(
            f"지하철 호선 ID 없음 (시간 기반 fallback): route_id={route_id}, "
            f"subway_line={subway_line}"
        )
        return _handle_waiting_subway_fallback(
            route_id, route_itinerary_id, bot_state, current_leg, public_leg, legs
        )

    if not start_station:
        return _handle_waiting_subway_fallback(
            route_id, route_itinerary_id, bot_state, current_leg, public_leg, legs
        )

    # 도착정보 조회
    arrivals = subway_api_client.get_arrival_info(start_station)

    # 방향 필터링 (pass_stops 활용)
    pass_stops = public_leg.get("pass_stops", [])
    target_train = subway_api_client.filter_by_direction(
        arrivals, subway_line_id, end_station, pass_stops
    )

    # 열차를 찾지 못하면 재시도 또는 fallback 사용
    if not target_train:
        # API 재시도 로직
        retry_count = bot_state.get("api_retry_count", 0)

        if retry_count < MAX_API_RETRIES:
            # 재시도
            BotStateManager.update_retry_count(route_id, retry_count + 1)
            logger.info(
                f"지하철 API 재시도 ({retry_count + 1}/{MAX_API_RETRIES}): "
                f"route_id={route_id}, station={start_station}, line={subway_line}"
            )

            # 심야 시간대 대기 시간 증가
            wait_multiplier = 2.0 if is_night_time() else 1.0
            retry_interval = int(API_RETRY_INTERVAL * wait_multiplier)

            # 업데이트된 봇 상태 조회 (current_position 포함)
            updated_bot_state = BotStateManager.get(route_id) or bot_state

            SSEPublisher.publish_bot_status_update(
                route_itinerary_id=route_itinerary_id,
                bot_state={**updated_bot_state, "arrival_time": None, "progress_percent": progress_percent},
                vehicle_info={
                    "type": "SUBWAY",
                    "route": subway_line,
                    "status": "searching",  # API 재시도 중
                },
                next_update_in=retry_interval,
            )
            return retry_interval
        else:
            # 최대 재시도 초과 → fallback 전환
            logger.warning(
                f"지하철 API 최대 재시도 초과 → fallback 전환: route_id={route_id}"
            )
            BotStateManager.reset_retry_count(route_id)
            return _handle_waiting_subway_fallback(
                route_id, route_itinerary_id, bot_state, current_leg, public_leg, legs
            )

    # API 성공 → 재시도 카운터 리셋
    BotStateManager.reset_retry_count(route_id)

    train_no = target_train.get("btrainNo")
    arrival_time = int(target_train.get("barvlDt", 0) or 0)
    arvl_msg = target_train.get("arvlMsg2", "")
    arvl_msg3 = target_train.get("arvlMsg3", "")
    arvl_cd = int(target_train.get("arvlCd", 99) or 99)  # 도착코드 (0:진입, 1:도착)

    # 탑승 여부 확인 (arvlCd 기반)
    if arvl_cd in [0, 1] or arrival_time <= 30:
        # 0 = 진입, 1 = 도착, 또는 30초 이내면 탑승
        logger.info(
            f"지하철 탑승 판정: route_id={route_id}, train_no={train_no}, "
            f"arvl_cd={arvl_cd}, arrival_time={arrival_time}, arvl_msg={arvl_msg}"
        )
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

    # 업데이트된 봇 상태 조회 (current_position 포함)
    updated_bot_state = BotStateManager.get(route_id) or bot_state

    SSEPublisher.publish_bot_status_update(
        route_itinerary_id=route_itinerary_id,
        bot_state={**updated_bot_state, "arrival_time": arrival_time, "progress_percent": progress_percent},
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


def _normalize_station_name(name: str) -> str:
    """역명 정규화 (홍대입구역 → 홍대입구)"""
    if not name:
        return ""
    name = name.strip()
    if name.endswith("역"):
        return name[:-1]
    return name


def _stations_match(station1: str, station2: str) -> bool:
    """두 역명이 같은지 비교 (정규화된 비교)"""
    return _normalize_station_name(station1) == _normalize_station_name(station2)


def _find_station_index(station_name: str, pass_stops: list[str]) -> int:
    """pass_stops에서 역명의 인덱스를 찾음 (정규화된 비교)"""
    normalized_name = _normalize_station_name(station_name)
    for i, stop in enumerate(pass_stops):
        if _normalize_station_name(stop) == normalized_name:
            return i
    return -1


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

    # fallback 모드인 경우 시간 기반 처리
    if train_no == "fallback":
        return _handle_riding_subway_fallback(
            route_id, route_itinerary_id, bot_state, current_leg, public_leg, legs, public_ids
        )

    # 시간 계산
    leg_started_at = datetime.fromisoformat(bot_state["leg_started_at"])
    if leg_started_at.tzinfo is None:
        leg_started_at = timezone.make_aware(leg_started_at)
    elapsed = (timezone.now() - leg_started_at).total_seconds()

    # 디버깅: current_leg 데이터 확인
    logger.info(
        f"current_leg 데이터: keys={list(current_leg.keys())}, "
        f"sectionTime={current_leg.get('sectionTime')}, "
        f"route_id={route_id}"
    )

    section_time = current_leg.get("sectionTime", 600)

    # leg 기준 진행률 (하차 판정용)
    leg_progress = min((elapsed / section_time) * 100, 100) if section_time > 0 else 0

    # 전체 경로 기준 진행률 (SSE용)
    progress_percent = _calculate_total_progress(
        legs, bot_state["current_leg_index"], elapsed, section_time
    )

    # 열차 위치 조회
    positions = subway_api_client.get_train_position(subway_line)
    pos = subway_api_client.filter_by_train_no(positions, train_no)

    if not pos:
        # API 응답 없을 때 시간 기반 하차 판정 (leg 기준 100%)
        if leg_progress >= 100:
            return _alight_from_subway(
                route_id, route_itinerary_id, bot_state, end_station, legs
            )

        SSEPublisher.publish_bot_status_update(
            route_itinerary_id=route_itinerary_id,
            bot_state={**bot_state, "progress_percent": progress_percent},
            next_update_in=30,
        )
        return 30

    current_station = pos.get("statnNm")
    train_status = pos.get("trainSttus")

    # 하차역 도착 확인 (정규화된 역명 비교)
    should_alight = False
    current_idx = _find_station_index(current_station, pass_stops)
    end_idx = _find_station_index(end_station, pass_stops)

    # 1. 정확히 하차역에 도착
    if _stations_match(current_station, end_station):
        should_alight = True
        logger.info(f"지하철 하차 판정 (역명 일치): current={current_station}, end={end_station}")

    # 2. 하차역을 지나쳤는지 확인 (pass_stops 인덱스 기반)
    elif current_idx >= 0 and end_idx >= 0 and current_idx >= end_idx:
        should_alight = True
        logger.info(
            f"지하철 하차 판정 (인덱스): current_idx={current_idx}, end_idx={end_idx}, "
            f"current={current_station}, end={end_station}"
        )

    if should_alight:
        return _alight_from_subway(
            route_id, route_itinerary_id, bot_state, end_station, legs
        )

    # 역 기반 진행률을 전체 경로에 반영
    if current_idx >= 0 and len(pass_stops) > 1:
        # 현재 leg 내에서의 역 기반 진행률
        station_leg_progress = (current_idx / (len(pass_stops) - 1)) * section_time
        # 전체 경로 기준으로 재계산 (역 기반이 더 정확한 경우)
        station_based_total = _calculate_total_progress(
            legs, bot_state["current_leg_index"], station_leg_progress, section_time
        )
        progress_percent = max(progress_percent, station_based_total)

    # 🚇 지하철 위치 업데이트 (passStopList.stations에서 역 좌표 직접 사용)
    if current_idx >= 0:
        # TMap API 응답의 passStopList.stations에서 역 좌표 가져오기
        pass_stop_list = current_leg.get("passStopList", {})
        stations = pass_stop_list.get("stations", [])

        station_coord = None
        # 현재 역 인덱스로 좌표 찾기
        if stations and current_idx < len(stations):
            station = stations[current_idx]
            station_lon = station.get("lon")
            station_lat = station.get("lat")
            if station_lon and station_lat:
                station_coord = (float(station_lon), float(station_lat))

        # 인덱스로 못 찾으면 역명으로 검색
        if not station_coord and current_station:
            for station in stations:
                if _stations_match(station.get("stationName", ""), current_station):
                    station_lon = station.get("lon")
                    station_lat = station.get("lat")
                    if station_lon and station_lat:
                        station_coord = (float(station_lon), float(station_lat))
                        break

        # 디버깅 로그
        logger.info(
            f"지하철 역 좌표 조회: route_id={route_id}, "
            f"current_station={current_station}, current_idx={current_idx}, "
            f"stations_count={len(stations)}, "
            f"station_coord={station_coord}"
        )

        if station_coord:
            BotStateManager.update_position(
                route_id=route_id,
                lon=station_coord[0],
                lat=station_coord[1]
            )
        else:
            # passStopList.stations에서 좌표를 못 찾은 경우 로그
            logger.warning(
                f"역 좌표 없음: route_id={route_id}, "
                f"current_station={current_station}, current_idx={current_idx}"
            )

    # 업데이트된 봇 상태 조회 (current_position 포함)
    updated_bot_state = BotStateManager.get(route_id) or bot_state

    SSEPublisher.publish_bot_status_update(
        route_itinerary_id=route_itinerary_id,
        bot_state={**updated_bot_state, "progress_percent": progress_percent},
        vehicle_info={
            "type": "SUBWAY",
            "route": subway_line,
            "trainNo": train_no,
            "current_station": current_station,
            "current_station_index": current_idx if current_idx >= 0 else 0,
            "total_stations": len(pass_stops),
            "train_status": train_status,
            "pass_shape": public_leg.get("pass_shape"),  # 경로 보간용
        },
        next_update_in=30,
    )

    return 30


def _alight_from_subway(
    route_id: int,
    route_itinerary_id: int,
    bot_state: dict,
    end_station: str,
    legs: list,
) -> int:
    """지하철 하차 처리 공통 함수"""
    # 🚇 하차역 좌표로 봇 위치 업데이트
    current_leg_index = bot_state["current_leg_index"]
    if current_leg_index < len(legs):
        current_leg = legs[current_leg_index]
        pass_stop_list = current_leg.get("passStopList", {})
        stations = pass_stop_list.get("stations", [])

        # 하차역 좌표 찾기
        end_station_coord = None
        for station in stations:
            station_name = station.get("stationName", "")
            if _stations_match(station_name, end_station):
                station_lon = station.get("lon")
                station_lat = station.get("lat")
                if station_lon and station_lat:
                    end_station_coord = (float(station_lon), float(station_lat))
                    break

        if end_station_coord:
            BotStateManager.update_position(
                route_id=route_id,
                lon=end_station_coord[0],
                lat=end_station_coord[1]
            )
            logger.info(
                f"지하철 하차역 좌표 설정: route_id={route_id}, "
                f"end_station={end_station}, coord={end_station_coord}"
            )
        else:
            logger.warning(
                f"지하철 하차역 좌표 없음: route_id={route_id}, "
                f"end_station={end_station}, stations_count={len(stations)}"
            )

    SSEPublisher.publish_bot_alighting(
        route_itinerary_id=route_itinerary_id,
        route_id=route_id,
        bot_id=bot_state["bot_id"],
        station_name=end_station or "",
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

    # 🚇 상태 전환 후 즉시 bot_status_update 발행 (프론트엔드에서 새 좌표 적용)
    updated_bot_state = BotStateManager.get(route_id)
    if updated_bot_state:
        # 현재 leg까지 완료된 진행률 계산
        completed_time = sum(
            legs[i].get("sectionTime", 0) for i in range(next_leg_index)
        )
        total_time = sum(leg.get("sectionTime", 0) for leg in legs)
        progress_percent = (completed_time / total_time * 100) if total_time > 0 else 0

        SSEPublisher.publish_bot_status_update(
            route_itinerary_id=route_itinerary_id,
            bot_state={**updated_bot_state, "progress_percent": progress_percent},
            next_update_in=30,
        )
        logger.info(
            f"지하철 하차 후 상태 업데이트 발행: route_id={route_id}, "
            f"status={updated_bot_state.get('status')}, progress={progress_percent:.1f}%"
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
