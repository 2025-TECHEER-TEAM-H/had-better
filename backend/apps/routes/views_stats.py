"""
경주 통계 View

API 엔드포인트:
- GET /api/v1/routes/stats - 경주 통계 조회
  - 파라미터 없음: 출발/도착 쌍 목록
  - departure_name + arrival_name: 시간대별 상세 통계
"""

import logging
import re
from collections import defaultdict

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from drf_spectacular.utils import OpenApiParameter, extend_schema

from apps.itineraries.models import RouteItinerary, SearchItineraryHistory

from .models import Route

logger = logging.getLogger(__name__)


def _clean_route_name(route_name: str) -> str:
    """노선명 정리

    예시:
    - "간선:N31" → "N31"
    - "지선:7016" → "7016"
    - "수도권4호선" → "4호선"
    - "수도권수인분당선" → "수인분당선"
    - "신분당선" → "신분당선"
    """
    if not route_name:
        return ""

    # "간선:N31", "지선:7016" 등 콜론으로 분리
    if ":" in route_name:
        return route_name.split(":")[-1]

    # "수도권4호선" → "4호선"
    match = re.search(r"(\d+호선)", route_name)
    if match:
        return match.group(1)

    # "수도권수인분당선" → "수인분당선"
    if route_name.startswith("수도권"):
        return route_name[3:]

    return route_name


def extract_route_label(raw_data: dict) -> str:
    """raw_data에서 경로 라벨 추출

    raw_data.legs 배열에서 WALK가 아닌 대중교통 구간의
    노선명을 추출하여 " → " 으로 조합합니다.

    예시:
    - BUS("간선:N31") → "N31"
    - SUBWAY("수도권4호선") → SUBWAY("수도권6호선") → "4호선 → 6호선"
    """
    legs = raw_data.get("legs", [])
    transit_names = []
    for leg in legs:
        if leg.get("mode") == "WALK":
            continue
        route_name = leg.get("route", "")
        cleaned = _clean_route_name(route_name)
        if cleaned:
            transit_names.append(cleaned)
    return " → ".join(transit_names) if transit_names else "도보"


def _get_time_slot(hour: int) -> str:
    """시간(0-23)을 시간대로 분류"""
    if 6 <= hour < 12:
        return "morning"
    elif 12 <= hour < 18:
        return "afternoon"
    else:
        return "evening"


TIME_SLOT_META = {
    "morning": {"label": "오전", "time": "06:00 - 12:00"},
    "afternoon": {"label": "오후", "time": "12:00 - 18:00"},
    "evening": {"label": "저녁", "time": "18:00 - 06:00"},
}


class RouteStatsView(APIView):
    """경주 통계 조회 API"""

    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="경주 통계 조회",
        description=(
            "출발/도착지별 경주 통계를 조회합니다.\n\n"
            "- 파라미터 없이 호출: 출발/도착 쌍 목록 반환\n"
            "- departure_name + arrival_name 지정: 시간대별 상세 통계 반환"
        ),
        parameters=[
            OpenApiParameter(
                name="departure_name",
                description="출발지명",
                required=False,
                type=str,
            ),
            OpenApiParameter(
                name="arrival_name",
                description="도착지명",
                required=False,
                type=str,
            ),
        ],
    )
    def get(self, request):
        departure_name = request.query_params.get("departure_name")
        arrival_name = request.query_params.get("arrival_name")

        if departure_name and arrival_name:
            return self._get_detail(departure_name, arrival_name)
        return self._get_list()

    @staticmethod
    def _find_place_names(start_x, start_y, end_x, end_y):
        """좌표로 SearchItineraryHistory에서 출발/도착 지명을 찾는다."""
        sih = (
            SearchItineraryHistory.objects.filter(
                deleted_at__isnull=True,
                route_itinerary__start_x=start_x,
                route_itinerary__start_y=start_y,
                route_itinerary__end_x=end_x,
                route_itinerary__end_y=end_y,
            )
            .order_by("-id")
            .first()
        )
        if sih:
            return sih.departure_name, sih.arrival_name
        return None, None

    def _get_list(self):
        """출발/도착 쌍 목록 반환"""
        # 완료된 경주의 RouteItinerary 좌표를 기준으로 그룹핑
        # (SearchItineraryHistory와 Route의 itinerary가 다를 수 있으므로 좌표 매칭)
        finished_routes = Route.objects.filter(
            status=Route.Status.FINISHED,
            deleted_at__isnull=True,
        ).select_related("route_itinerary")

        # 좌표 → {user_total, user_wins} 집계
        coord_stats = {}
        for route in finished_routes:
            ri = route.route_itinerary
            key = (ri.start_x, ri.start_y, ri.end_x, ri.end_y)
            if key not in coord_stats:
                coord_stats[key] = {"user_total": 0, "user_wins": 0}
            if route.participant_type == Route.ParticipantType.USER:
                coord_stats[key]["user_total"] += 1
                if route.is_win:
                    coord_stats[key]["user_wins"] += 1

        route_pairs = []
        for coords, stats in coord_stats.items():
            total = stats["user_total"]
            if total == 0:
                continue
            dep_name, arr_name = self._find_place_names(*coords)
            if not dep_name:
                continue
            route_pairs.append(
                {
                    "departure_name": dep_name,
                    "arrival_name": arr_name,
                    "total_races": total,
                    "user_win_rate": round(stats["user_wins"] / total * 100, 1),
                    "departure_coords": {
                        "lat": float(coords[1]),
                        "lon": float(coords[0]),
                    },
                    "arrival_coords": {
                        "lat": float(coords[3]),
                        "lon": float(coords[2]),
                    },
                }
            )

        # 경주 수 내림차순 정렬
        route_pairs.sort(key=lambda x: x["total_races"], reverse=True)

        return Response(
            {"status": "success", "data": {"route_pairs": route_pairs}},
            status=status.HTTP_200_OK,
        )

    def _get_detail(self, departure_name: str, arrival_name: str):
        """시간대별 상세 통계 반환"""
        # 해당 출발/도착 쌍의 좌표를 SearchItineraryHistory에서 조회
        sih = (
            SearchItineraryHistory.objects.filter(
                departure_name=departure_name,
                arrival_name=arrival_name,
                deleted_at__isnull=True,
            )
            .select_related("route_itinerary")
            .first()
        )

        if not sih:
            # 좌표를 찾을 수 없으면 빈 응답
            return Response(
                {
                    "status": "success",
                    "data": {
                        "departure_name": departure_name,
                        "arrival_name": arrival_name,
                        "total_races": 0,
                        "time_slots": {
                            slot: {
                                **meta,
                                "total_races": 0,
                                "routes": [],
                            }
                            for slot, meta in TIME_SLOT_META.items()
                        },
                        "insight": "아직 경주 데이터가 없습니다.",
                    },
                },
                status=status.HTTP_200_OK,
            )

        # 같은 좌표를 가진 모든 RouteItinerary ID 조회 (좌표 기반 매칭)
        ref_ri = sih.route_itinerary
        itinerary_ids = list(
            RouteItinerary.objects.filter(
                start_x=ref_ri.start_x,
                start_y=ref_ri.start_y,
                end_x=ref_ri.end_x,
                end_y=ref_ri.end_y,
                deleted_at__isnull=True,
            ).values_list("id", flat=True)
        )

        if not itinerary_ids:
            return Response(
                {
                    "status": "success",
                    "data": {
                        "departure_name": departure_name,
                        "arrival_name": arrival_name,
                        "total_races": 0,
                        "time_slots": {
                            slot: {
                                **meta,
                                "total_races": 0,
                                "routes": [],
                            }
                            for slot, meta in TIME_SLOT_META.items()
                        },
                        "insight": "아직 경주 데이터가 없습니다.",
                    },
                },
                status=status.HTTP_200_OK,
            )

        # 해당 itinerary들의 완료된 경주 조회 (USER + BOT 모두 집계)
        all_routes = Route.objects.filter(
            route_itinerary_id__in=itinerary_ids,
            status=Route.Status.FINISHED,
            deleted_at__isnull=True,
        ).select_related("route_leg")

        # 전체 경주 수 (경주 세션 수 = USER 수 기준)
        total_user_races = all_routes.filter(
            participant_type=Route.ParticipantType.USER,
        ).count()

        # 시간대별 + 경로별 집계 (경주 세션 단위로 중복 제거)
        # 같은 세션에서 같은 경로를 USER와 BOT이 동시에 사용할 수 있으므로
        # (세션, 경로) 조합당 1회로 카운트하고, 한 명이라도 이겼으면 1승
        # {time_slot: {route_label: {itinerary_id: {"won": bool, "best_duration": int}}}}
        raw_stats = defaultdict(lambda: defaultdict(dict))
        # 시간대별 경주 세션 수 (route_itinerary_id 기준 중복 제거)
        slot_sessions = defaultdict(set)
        # 경로별 대표 RouteLeg 데이터 (RouteTimeline 렌더링용)
        representative_legs = defaultdict(dict)

        for route in all_routes:
            # 시간대 분류 (서울 시간 기준)
            local_time = timezone.localtime(route.start_time)
            time_slot = _get_time_slot(local_time.hour)

            # 경로 라벨 추출
            raw_data = route.route_leg.raw_data or {}
            route_label = extract_route_label(raw_data)

            it_id = route.route_itinerary_id
            session = raw_stats[time_slot][route_label].get(it_id)
            if session is None:
                raw_stats[time_slot][route_label][it_id] = {
                    "won": bool(route.is_win),
                    "best_duration": route.duration or 0,
                }
            else:
                # 같은 세션+경로에서 한 명이라도 이겼으면 승리
                if route.is_win:
                    session["won"] = True
                # 더 빠른 소요시간 사용
                if route.duration and (
                    session["best_duration"] == 0
                    or route.duration < session["best_duration"]
                ):
                    session["best_duration"] = route.duration

            # 경주 세션 추적
            slot_sessions[time_slot].add(it_id)

            # 경로별 대표 RouteLeg 저장 (첫 번째 것 사용)
            if route_label not in representative_legs[time_slot]:
                leg = route.route_leg
                representative_legs[time_slot][route_label] = {
                    "legs": raw_data.get("legs", []),
                    "total_time": leg.total_time or 0,
                    "total_distance": leg.total_distance or 0,
                    "total_walk_time": leg.total_walk_time or 0,
                    "total_walk_distance": leg.total_walk_distance or 0,
                    "transfer_count": leg.transfer_count or 0,
                    "path_type": leg.path_type or 0,
                }

        # raw_stats → 집계 변환
        stats = defaultdict(dict)
        for time_slot, route_data in raw_stats.items():
            for route_label, sessions in route_data.items():
                count = len(sessions)
                wins = sum(1 for s in sessions.values() if s["won"])
                total_dur = sum(s["best_duration"] for s in sessions.values())
                stats[time_slot][route_label] = {
                    "count": count,
                    "wins": wins,
                    "total_duration": total_dur,
                }

        # 응답 구조 생성
        time_slots_data = {}
        best_overall_rate = 0
        best_overall_route = None
        best_overall_slot = None

        for slot_key, meta in TIME_SLOT_META.items():
            slot_stats = stats.get(slot_key, {})
            routes_list = []
            slot_total = len(slot_sessions.get(slot_key, set()))

            for route_label, data in slot_stats.items():
                count = data["count"]
                wins = data["wins"]
                win_rate = round(wins / count * 100, 1) if count > 0 else 0
                avg_dur = round(data["total_duration"] / count) if count > 0 else 0

                route_entry = {
                    "route_label": route_label,
                    "win_rate": win_rate,
                    "avg_duration": avg_dur,
                    "race_count": count,
                    "wins": wins,
                }

                # 대표 RouteLeg 데이터 추가 (RouteTimeline 렌더링용)
                leg_data = representative_legs.get(slot_key, {}).get(route_label)
                if leg_data:
                    route_entry["leg_detail"] = leg_data

                routes_list.append(route_entry)

                # 전체 최고 승률 추적 (최소 3전 이상만 신뢰)
                if win_rate > best_overall_rate and count >= 3:
                    best_overall_rate = win_rate
                    best_overall_route = route_label
                    best_overall_slot = meta["label"]

            # 승리 횟수 내림차순 정렬
            routes_list.sort(key=lambda x: x["wins"], reverse=True)

            time_slots_data[slot_key] = {
                **meta,
                "total_races": slot_total,
                "routes": routes_list,
            }

        # 인사이트 생성
        if best_overall_route:
            insight = (
                f"{departure_name} → {arrival_name} 구간은 "
                f"{best_overall_slot}에 {best_overall_route} 경로의 "
                f"승률이 {best_overall_rate}%로 가장 높습니다."
            )
        else:
            insight = "아직 충분한 데이터가 없습니다."

        return Response(
            {
                "status": "success",
                "data": {
                    "departure_name": departure_name,
                    "arrival_name": arrival_name,
                    "total_races": total_user_races,
                    "time_slots": time_slots_data,
                    "insight": insight,
                },
            },
            status=status.HTTP_200_OK,
        )
