"""
경주 관련 View

API 엔드포인트:
- POST   /api/v1/routes              - 경주 생성 (시작)
- GET    /api/v1/routes              - 경주 목록 조회
- PATCH  /api/v1/routes/{route_id}   - 경주 상태 변경 (종료/취소)
- GET    /api/v1/routes/{route_id}/result - 경주 결과 조회
- GET    /api/v1/sse/routes/{route_itinerary_id} - SSE 스트림
"""

import asyncio
import json
import logging

from django.db import transaction
from django.http import StreamingHttpResponse
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


def to_seoul_time(dt):
    """datetime을 서울 시간대로 변환하여 ISO 형식 반환"""
    if dt is None:
        return None
    return timezone.localtime(dt).isoformat()

from drf_spectacular.utils import extend_schema

from apps.itineraries.models import RouteItinerary, RouteLeg, SearchItineraryHistory

from .models import Bot, Route
from .serializers import (
    ParticipantSerializer,
    RouteCreateSerializer,
    RouteStatusUpdateSerializer,
)
from .services.bot_state import BotStateManager
from .services.id_converter import PublicAPIIdConverter
from .tasks.bot_simulation import update_bot_position
from .utils.rabbitmq_client import rabbitmq_client
from .utils.redis_client import redis_client

logger = logging.getLogger(__name__)


def validate_public_ids(public_ids: dict, bot_leg_id: int) -> tuple[bool, str]:
    """
    공공데이터 ID 변환 결과 검증

    Args:
        public_ids: PublicAPIIdConverter.convert_legs() 결과
        bot_leg_id: 봇 경로 ID

    Returns:
        (is_valid, error_message) 튜플
    """
    legs = public_ids.get("legs", [])

    for i, leg in enumerate(legs):
        mode = leg.get("mode")

        if mode == "BUS":
            # 버스 노선 ID 검증
            if not leg.get("bus_route_id"):
                logger.warning(
                    f"봇 경로 ID 변환 실패: bot_leg_id={bot_leg_id}, "
                    f"segment={i}, reason=bus_route_id_not_found"
                )
                return False, f"봇 경로(ID: {bot_leg_id}): {i+1}번째 구간(버스)의 노선 정보를 찾을 수 없습니다. 다른 경로를 선택해주세요."

            # 승차 정류소 검증
            if not leg.get("start_station"):
                logger.warning(
                    f"봇 경로 ID 변환 실패: bot_leg_id={bot_leg_id}, "
                    f"segment={i}, reason=start_station_not_found"
                )
                return False, f"봇 경로(ID: {bot_leg_id}): {i+1}번째 구간(버스)의 승차 정류소를 찾을 수 없습니다. 다른 경로를 선택해주세요."

            # 하차 정류소 검증
            if not leg.get("end_station"):
                logger.warning(
                    f"봇 경로 ID 변환 실패: bot_leg_id={bot_leg_id}, "
                    f"segment={i}, reason=end_station_not_found"
                )
                return False, f"봇 경로(ID: {bot_leg_id}): {i+1}번째 구간(버스)의 하차 정류소를 찾을 수 없습니다. 다른 경로를 선택해주세요."

        elif mode == "SUBWAY":
            # 호선 ID 검증
            if not leg.get("subway_line_id"):
                logger.warning(
                    f"봇 경로 ID 변환 실패: bot_leg_id={bot_leg_id}, "
                    f"segment={i}, reason=subway_line_id_not_found"
                )
                return False, f"봇 경로(ID: {bot_leg_id}): {i+1}번째 구간(지하철)의 호선 정보를 찾을 수 없습니다. 다른 경로를 선택해주세요."

            # 경유역 목록 검증
            pass_stops = leg.get("pass_stops", [])
            if len(pass_stops) <= 2:
                logger.warning(
                    f"봇 경로 ID 변환 실패: bot_leg_id={bot_leg_id}, "
                    f"segment={i}, reason=insufficient_pass_stops, count={len(pass_stops)}"
                )
                return False, f"봇 경로(ID: {bot_leg_id}): {i+1}번째 구간(지하철)의 경유역 정보가 부족합니다. 다른 경로를 선택해주세요."

    return True, ""


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
        }
    }
    if details:
        response["error"]["details"] = details
    return Response(response, status=status_code)


class RouteListCreateView(APIView):
    """
    경주 목록 조회 및 생성

    POST /api/v1/routes - 경주 생성 (시작)
    GET  /api/v1/routes - 경주 목록 조회
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="경주 생성 (시작)",
        description="""
경주를 생성하고 시작합니다.

**동작:**
1. route_itinerary_id로 경로 탐색 결과 확인
2. user_leg_id로 유저 경로 배정
3. bot_leg_ids로 봇 경로 배정 (봇 자동 생성)
4. 모든 참가자를 RUNNING 상태로 생성
5. start_time에 현재 시간 기록
        """,
        request=RouteCreateSerializer,
        responses={201: None, 400: None, 404: None},
        tags=["Routes"],
    )
    def post(self, request):
        """경주 생성 (시작)"""
        serializer = RouteCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                code="VALIDATION_FAILED",
                message="입력값이 올바르지 않습니다.",
                status_code=status.HTTP_400_BAD_REQUEST,
                details=serializer.errors,
            )

        data = serializer.validated_data
        route_itinerary_id = data["route_itinerary_id"]
        user_leg_id = data["user_leg_id"]
        bot_leg_ids = data["bot_leg_ids"]

        # route_itinerary 확인
        try:
            route_itinerary = RouteItinerary.objects.get(
                id=route_itinerary_id,
                deleted_at__isnull=True
            )
        except RouteItinerary.DoesNotExist:
            return error_response(
                code="RESOURCE_NOT_FOUND",
                message="해당 경로 탐색 결과를 찾을 수 없습니다.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # user_leg 확인
        try:
            user_leg = RouteLeg.objects.get(
                id=user_leg_id,
                route_itinerary=route_itinerary,
                deleted_at__isnull=True
            )
        except RouteLeg.DoesNotExist:
            return error_response(
                code="RESOURCE_NOT_FOUND",
                message="해당 유저 경로를 찾을 수 없습니다.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # user_leg 경로 검증
        from apps.itineraries.views import validate_route_segments
        is_valid, error_message = validate_route_segments(user_leg)
        if not is_valid:
            return error_response(
                code="INVALID_ROUTE",
                message=error_message,
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # bot_legs 확인 및 검증
        bot_legs = []
        for bot_leg_id in bot_leg_ids:
            try:
                bot_leg = RouteLeg.objects.get(
                    id=bot_leg_id,
                    route_itinerary=route_itinerary,
                    deleted_at__isnull=True
                )

                # bot_leg 경로 검증
                is_valid, error_message = validate_route_segments(bot_leg)
                if not is_valid:
                    return error_response(
                        code="INVALID_ROUTE",
                        message=f"봇 경로(ID: {bot_leg_id}) 검증 실패: {error_message}",
                        status_code=status.HTTP_400_BAD_REQUEST,
                    )

                bot_legs.append(bot_leg)
            except RouteLeg.DoesNotExist:
                return error_response(
                    code="RESOURCE_NOT_FOUND",
                    message=f"해당 봇 경로(ID: {bot_leg_id})를 찾을 수 없습니다.",
                    status_code=status.HTTP_404_NOT_FOUND,
                )

        # 봇 수 제한 (최대 2개)
        if len(bot_legs) > 2:
            return error_response(
                code="ROUTE_TOO_MANY_BOTS",
                message="봇은 최대 2개까지 배정할 수 있습니다.",
                status_code=status.HTTP_400_BAD_REQUEST,
            )

        # 봇 경로 ID 변환 및 검증 (transaction 시작 전)
        bot_public_ids_list = []
        for bot_leg in bot_legs:
            legs = bot_leg.raw_data.get("legs", [])
            public_ids = PublicAPIIdConverter.convert_legs(legs)

            # 공공데이터 ID 변환 결과 검증
            is_valid, error_message = validate_public_ids(public_ids, bot_leg.id)
            if not is_valid:
                return error_response(
                    code="INVALID_PUBLIC_IDS",
                    message=error_message,
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

            bot_public_ids_list.append((bot_leg, public_ids))

        # 출발/도착 좌표
        start_lat = float(route_itinerary.start_y)
        start_lon = float(route_itinerary.start_x)
        end_lat = float(route_itinerary.end_y)
        end_lon = float(route_itinerary.end_x)

        now = timezone.now()
        participants = []

        with transaction.atomic():
            # 유저 Route 생성
            user_route = Route.objects.create(
                participant_type=Route.ParticipantType.USER,
                user=request.user,
                route_itinerary=route_itinerary,
                route_leg=user_leg,
                status=Route.Status.RUNNING,
                start_time=now,
                start_lat=start_lat,
                start_lon=start_lon,
                end_lat=end_lat,
                end_lon=end_lon,
            )
            participants.append(user_route)

            # 봇 타입 목록
            bot_types = [Bot.BotType.RABBIT, Bot.BotType.CAT, Bot.BotType.DOG, Bot.BotType.MONKEY]

            # 봇 Route 생성 및 시뮬레이션 시작
            bot_routes = []
            for i, (bot_leg, public_ids) in enumerate(bot_public_ids_list):
                # 봇 생성
                bot = Bot.objects.create(
                    name=f"Bot {i + 1}",
                    type=bot_types[i % len(bot_types)],
                )

                # 봇 Route 생성
                bot_route = Route.objects.create(
                    participant_type=Route.ParticipantType.BOT,
                    bot=bot,
                    route_itinerary=route_itinerary,
                    route_leg=bot_leg,
                    status=Route.Status.RUNNING,
                    start_time=now,
                    start_lat=start_lat,
                    start_lon=start_lon,
                    end_lat=end_lat,
                    end_lon=end_lon,
                )
                participants.append(bot_route)
                bot_routes.append((bot_route, bot_leg, bot, public_ids))

        # 봇 시뮬레이션 시작 (v3)
        for bot_route, bot_leg, bot, public_ids in bot_routes:
            try:
                # 미리 검증된 public_ids 사용
                legs = bot_leg.raw_data.get("legs", [])
                redis_client.set_public_ids(bot_route.id, public_ids)

                # 봇 초기 상태 생성
                BotStateManager.initialize(
                    route_id=bot_route.id,
                    bot_id=bot.id,
                    legs=legs,
                )

                # 첫 번째 Task 즉시 실행
                update_bot_position.apply_async(
                    args=[bot_route.id],
                    countdown=0,
                )

                logger.info(f"봇 시뮬레이션 시작: route_id={bot_route.id}, bot_id={bot.id}")

            except Exception as e:
                logger.error(f"봇 시뮬레이션 시작 실패: route_id={bot_route.id}, error={e}")
                # 시뮬레이션 시작 실패해도 경주 생성은 계속 진행

        # 응답 생성
        response_data = {
            "route_itinerary_id": route_itinerary.id,
            "participants": ParticipantSerializer(participants, many=True).data,
            "status": Route.Status.RUNNING,
            "start_time": to_seoul_time(now),
            "created_at": to_seoul_time(now),
            "sse_endpoint": f"/api/v1/sse/routes/{route_itinerary.id}",
        }

        return success_response(
            data=response_data,
            status_code=status.HTTP_201_CREATED,
        )

    @extend_schema(
        summary="경주 목록 조회",
        description="내가 참가한 경주 목록을 조회합니다.",
        responses={200: None},
        tags=["Routes"],
    )
    def get(self, request):
        """경주 목록 조회"""
        # JWT에서 user_id 추출
        user = request.user

        # 유저가 참가한 경주 목록
        routes = Route.objects.filter(
            user=user,
            participant_type=Route.ParticipantType.USER,
            deleted_at__isnull=True
        ).select_related('route_itinerary', 'route_leg')

        # 상태 필터
        status_filter = request.query_params.get("status")
        if status_filter:
            routes = routes.filter(status=status_filter)

        routes_data = []
        for route in routes:
            routes_data.append({
                "route_id": route.id,
                "route_itinerary_id": route.route_itinerary.id,
                "status": route.status,
                "is_win": route.is_win,
                "start_time": to_seoul_time(route.start_time),
                "end_time": to_seoul_time(route.end_time),
                "duration": route.duration,
            })

        return success_response(data=routes_data)


class RouteStatusUpdateView(APIView):
    """
    경주 상태 변경

    PATCH /api/v1/routes/{route_id} - 경주 상태 변경 (종료/취소)
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="경주 상태 변경 (종료/취소)",
        description="""
경주 상태를 변경합니다.

**종료 (FINISHED):**
- end_time에 현재 시간 기록
- duration = end_time - start_time 자동 계산

**취소 (CANCELED):**
- end_time에 현재 시간 기록
- duration은 계산하지 않음

**상태 전이 규칙:**
- RUNNING → FINISHED (종료)
- RUNNING → CANCELED (취소)
- 이미 FINISHED/CANCELED 상태인 경우 변경 불가
        """,
        request=RouteStatusUpdateSerializer,
        responses={200: None, 400: None, 404: None, 409: None},
        tags=["Routes"],
    )
    def patch(self, request, route_id):
        """경주 상태 변경"""
        # 요청 데이터 검증
        serializer = RouteStatusUpdateSerializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                code="VALIDATION_FAILED",
                message="입력값이 올바르지 않습니다.",
                status_code=status.HTTP_400_BAD_REQUEST,
                details=serializer.errors,
            )

        new_status = serializer.validated_data["status"]

        # 경주 조회 (본인 소유 확인)
        try:
            route = Route.objects.get(
                id=route_id,
                user=request.user,
                participant_type=Route.ParticipantType.USER,
                deleted_at__isnull=True
            )
        except Route.DoesNotExist:
            return error_response(
                code="ROUTE_NOT_FOUND",
                message="해당 경주를 찾을 수 없습니다.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        # 상태 전이 검증
        if route.status != Route.Status.RUNNING:
            if route.status == Route.Status.FINISHED:
                return error_response(
                    code="ROUTE_ALREADY_FINISHED",
                    message="이미 종료된 경주입니다.",
                    status_code=status.HTTP_409_CONFLICT,
                )
            elif route.status == Route.Status.CANCELED:
                return error_response(
                    code="ROUTE_ALREADY_CANCELED",
                    message="이미 취소된 경주입니다.",
                    status_code=status.HTTP_409_CONFLICT,
                )
            else:
                return error_response(
                    code="ROUTE_INVALID_STATUS_TRANSITION",
                    message="유효하지 않은 상태 전이입니다.",
                    status_code=status.HTTP_400_BAD_REQUEST,
                )

        now = timezone.now()

        # 상태 변경
        route.status = new_status
        route.end_time = now

        # FINISHED인 경우 duration 계산
        if new_status == Route.Status.FINISHED:
            duration_delta = now - route.start_time
            route.duration = int(duration_delta.total_seconds())

        route.save()

        # CANCELED인 경우 같은 경주의 봇 Route도 취소 처리 및 봇 상태 정리
        if new_status == Route.Status.CANCELED:
            # 같은 경주의 봇 Route 조회 (같은 route_itinerary, 같은 start_time)
            bot_routes = Route.objects.filter(
                route_itinerary=route.route_itinerary,
                start_time=route.start_time,
                participant_type=Route.ParticipantType.BOT,
                status=Route.Status.RUNNING,
                deleted_at__isnull=True
            )

            for bot_route in bot_routes:
                # 봇 Route 상태 변경
                bot_route.status = Route.Status.CANCELED
                bot_route.end_time = now
                bot_route.save()

                # 봇 상태 정리 (Redis 캐시 삭제)
                # 다음 Celery Task 실행 시 상태 체크로 인해 자동 종료되지만
                # 즉시 정리하여 리소스 확보
                BotStateManager.delete(bot_route.id)
                logger.info(f"봇 시뮬레이션 중단: route_id={bot_route.id} (경주 취소)")

        # 응답 데이터 생성
        response_data = {
            "route_id": route.id,
            "status": route.status,
            "start_time": to_seoul_time(route.start_time),
            "end_time": to_seoul_time(route.end_time),
        }

        # FINISHED인 경우에만 duration 포함
        if new_status == Route.Status.FINISHED:
            response_data["duration"] = route.duration

        return success_response(data=response_data)


class RouteResultView(APIView):
    """
    경주 결과 조회

    GET /api/v1/routes/{route_id}/result - 경주 결과 조회
    """

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="경주 결과 조회",
        description="""
경주 결과를 조회합니다.

**응답 정보:**
- route_info: 출발지/도착지 정보
- rankings: 모든 참가자의 순위 (duration 오름차순)
- user_result: 현재 유저의 결과 요약

**순위 결정:**
- duration (소요시간) 짧은 순서대로 순위 결정
- 아직 도착하지 않은 참가자는 순위 없음
        """,
        responses={200: None, 404: None},
        tags=["Routes"],
    )
    def get(self, request, route_id):
        """경주 결과 조회"""
        # 경주 조회 (본인 소유 확인)
        try:
            user_route = Route.objects.select_related(
                'route_itinerary', 'route_leg', 'user'
            ).get(
                id=route_id,
                user=request.user,
                participant_type=Route.ParticipantType.USER,
                deleted_at__isnull=True
            )
        except Route.DoesNotExist:
            return error_response(
                code="ROUTE_NOT_FOUND",
                message="해당 경주를 찾을 수 없습니다.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        route_itinerary = user_route.route_itinerary

        # 같은 경주의 모든 참가자 조회
        all_participants = Route.objects.select_related(
            'user', 'bot', 'route_leg'
        ).filter(
            route_itinerary=route_itinerary,
            start_time=user_route.start_time,
            deleted_at__isnull=True
        )

        # 순위 계산 (duration 기준 오름차순, None은 마지막)
        finished_participants = []
        unfinished_participants = []

        for p in all_participants:
            if p.status == Route.Status.FINISHED and p.duration is not None:
                finished_participants.append(p)
            else:
                unfinished_participants.append(p)

        # duration 기준 정렬
        finished_participants.sort(key=lambda x: x.duration)

        # 순위 부여 및 rankings 생성
        rankings = []
        for rank, p in enumerate(finished_participants, start=1):
            ranking_data = {
                "rank": rank,
                "route_id": p.id,
                "type": p.participant_type,
                "duration": p.duration,
                "end_time": to_seoul_time(p.end_time),
            }

            if p.participant_type == Route.ParticipantType.USER:
                ranking_data["user_id"] = p.user.id if p.user else None
                ranking_data["name"] = p.user.nickname if p.user else None
            else:
                ranking_data["bot_id"] = p.bot.id if p.bot else None
                ranking_data["name"] = p.bot.name if p.bot else None

            rankings.append(ranking_data)

        # 아직 도착하지 않은 참가자 추가 (순위 없음)
        for p in unfinished_participants:
            ranking_data = {
                "rank": None,
                "route_id": p.id,
                "type": p.participant_type,
                "duration": None,
                "end_time": None,
            }

            if p.participant_type == Route.ParticipantType.USER:
                ranking_data["user_id"] = p.user.id if p.user else None
                ranking_data["name"] = p.user.nickname if p.user else None
            else:
                ranking_data["bot_id"] = p.bot.id if p.bot else None
                ranking_data["name"] = p.bot.name if p.bot else None

            rankings.append(ranking_data)

        # 유저 결과 찾기
        user_rank = None
        is_win = None
        for r in rankings:
            if r["route_id"] == user_route.id:
                user_rank = r["rank"]
                if user_rank is not None:
                    is_win = (user_rank == 1)
                break

        # 출발지/도착지 이름 조회 (SearchItineraryHistory에서 가져오기)
        departure_name = None
        arrival_name = None
        search_history = SearchItineraryHistory.objects.filter(
            route_itinerary=route_itinerary
        ).first()
        if search_history:
            departure_name = search_history.departure_name
            arrival_name = search_history.arrival_name

        # 응답 데이터 생성
        response_data = {
            "route_id": user_route.id,
            "route_itinerary_id": route_itinerary.id,
            "status": user_route.status,
            "start_time": to_seoul_time(user_route.start_time),
            "end_time": to_seoul_time(user_route.end_time),
            "route_info": {
                "departure": {
                    "name": departure_name,
                    "lat": float(route_itinerary.start_y) if route_itinerary.start_y else None,
                    "lon": float(route_itinerary.start_x) if route_itinerary.start_x else None,
                },
                "arrival": {
                    "name": arrival_name,
                    "lat": float(route_itinerary.end_y) if route_itinerary.end_y else None,
                    "lon": float(route_itinerary.end_x) if route_itinerary.end_x else None,
                },
            },
            "rankings": rankings,
            "user_result": {
                "rank": user_rank,
                "is_win": is_win,
                "duration": user_route.duration,
            },
        }

        return success_response(data=response_data)


class SSEStreamView(APIView):
    """
    SSE 스트림 View

    GET /api/v1/sse/routes/{route_itinerary_id} - 실시간 봇 상태 스트림
    """

    # TODO: 실제 배포 시 인증 복구 필요
    # permission_classes = [IsAuthenticated]
    permission_classes = []  # 테스트용
    authentication_classes = []  # 테스트용

    # DRF content negotiation 우회 (406 에러 해결)
    def perform_content_negotiation(self, request, force=False):
        return (None, None)

    @extend_schema(
        summary="SSE 스트림",
        description="""
경주의 실시간 봇 상태를 SSE 스트림으로 수신합니다.

**이벤트 타입:**
- `connected`: 연결 성공
- `bot_status_update`: 봇 상태 업데이트 (5초 주기)
- `bot_boarding`: 봇 탑승 (버스/지하철)
- `bot_alighting`: 봇 하차
- `participant_finished`: 참가자 도착
- `route_ended`: 경주 종료
- `heartbeat`: 연결 유지 (30초 주기)
- `error`: 에러 발생

**사용 예시:**
```javascript
const eventSource = new EventSource('/api/v1/sse/routes/123');
eventSource.addEventListener('bot_status_update', (e) => {
    const data = JSON.parse(e.data);
    console.log('Bot status:', data);
});
```
        """,
        responses={200: None, 404: None},
        tags=["Routes"],
    )
    def get(self, request, route_itinerary_id):
        """SSE 스트림 연결"""
        # route_itinerary 확인
        try:
            route_itinerary = RouteItinerary.objects.get(
                id=route_itinerary_id,
                deleted_at__isnull=True
            )
        except RouteItinerary.DoesNotExist:
            return error_response(
                code="RESOURCE_NOT_FOUND",
                message="해당 경로 탐색 결과를 찾을 수 없습니다.",
                status_code=status.HTTP_404_NOT_FOUND,
            )

        async def event_stream():
            """SSE 이벤트 스트림 비동기 Generator (ASGI 호환)"""
            # 연결 성공 이벤트 (즉시 전송)
            logger.info(f"SSE connected 이벤트 전송: route_itinerary_id={route_itinerary_id}")
            yield _format_sse_event("connected", {
                "route_itinerary_id": route_itinerary_id,
                "message": "SSE 연결 성공",
            })

            # 테스트용: 1초 대기 후 heartbeat 전송
            await asyncio.sleep(1)
            logger.info(f"SSE heartbeat 이벤트 전송: route_itinerary_id={route_itinerary_id}")
            yield _format_sse_event("heartbeat", {
                "route_itinerary_id": route_itinerary_id,
            })

            # RabbitMQ 구독 (동기 함수를 별도 스레드에서 실행)
            try:
                # subscribe generator를 스레드에서 실행
                def get_next_event(gen):
                    try:
                        return next(gen)
                    except StopIteration:
                        return "STOP"

                # subscribe generator 생성
                subscribe_gen = rabbitmq_client.subscribe(route_itinerary_id, timeout=30)

                # 경주 상태 확인 함수 (DB 조회)
                def check_route_status():
                    """모든 참가자가 종료되었는지 확인"""
                    active_count = Route.objects.filter(
                        route_itinerary_id=route_itinerary_id,
                        status="RUNNING",
                    ).count()
                    return active_count == 0

                while True:
                    # 이벤트 수신 (blocking 호출을 스레드에서)
                    event = await asyncio.to_thread(get_next_event, subscribe_gen)

                    if event == "STOP":
                        break
                    elif event is None:
                        # Heartbeat (타임아웃) - 경주 상태 확인
                        is_ended = await asyncio.to_thread(check_route_status)

                        if is_ended:
                            # 모든 참가자 종료 → route_ended 이벤트 발행 후 종료
                            logger.info(f"SSE 경주 종료 감지: route_itinerary_id={route_itinerary_id}")
                            yield _format_sse_event("route_ended", {
                                "route_itinerary_id": route_itinerary_id,
                                "reason": "all_finished",
                            })
                            break
                        else:
                            # 진행 중 → heartbeat 전송
                            yield _format_sse_event("heartbeat", {
                                "route_itinerary_id": route_itinerary_id,
                            })
                    else:
                        event_type = event.get("event", "unknown")
                        data = event.get("data", {})
                        logger.info(f"SSE 이벤트 수신: type={event_type}")
                        yield _format_sse_event(event_type, data)

                        # 경주 종료 시 스트림 종료
                        if event_type == "route_ended":
                            break

            except Exception as e:
                logger.error(f"SSE 스트림 에러: {e}")
                yield _format_sse_event("error", {
                    "message": "SSE 스트림 에러 발생",
                })

        response = StreamingHttpResponse(
            event_stream(),
            content_type="text/event-stream",
        )
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"  # Nginx 버퍼링 비활성화

        return response


def _format_sse_event(event_type: str, data: dict) -> str:
    """SSE 이벤트 포맷팅"""
    return f"event: {event_type}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"
