"""
경주 관련 View

API 엔드포인트:
- POST   /api/v1/routes              - 경주 생성 (시작)
- GET    /api/v1/routes              - 경주 목록 조회
- PATCH  /api/v1/routes/{route_id}   - 경주 상태 변경 (종료/취소)
- GET    /api/v1/routes/{route_id}/result - 경주 결과 조회
"""

from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_spectacular.utils import extend_schema

from apps.itineraries.models import RouteItinerary, RouteLeg

from .models import Bot, Route
from .serializers import (
    ParticipantSerializer,
    RouteCreateSerializer,
)


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

        # bot_legs 확인
        bot_legs = []
        for bot_leg_id in bot_leg_ids:
            try:
                bot_leg = RouteLeg.objects.get(
                    id=bot_leg_id,
                    route_itinerary=route_itinerary,
                    deleted_at__isnull=True
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

            # 봇 Route 생성
            for i, bot_leg in enumerate(bot_legs):
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

        # 응답 생성
        response_data = {
            "route_itinerary_id": route_itinerary.id,
            "participants": ParticipantSerializer(participants, many=True).data,
            "status": Route.Status.RUNNING,
            "start_time": now.isoformat(),
            "created_at": now.isoformat(),
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
                "start_time": route.start_time.isoformat() if route.start_time else None,
                "end_time": route.end_time.isoformat() if route.end_time else None,
                "duration": route.duration,
            })

        return success_response(data=routes_data)
