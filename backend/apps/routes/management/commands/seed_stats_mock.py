"""
통계 페이지 테스트용 Mock 데이터 생성

실제 서비스 구조: 경주 1회 = USER 1명 + BOT 2명 (각각 다른 경로)

Usage:
    python manage.py seed_stats_mock          # 생성
    python manage.py seed_stats_mock --clear   # 삭제
"""

import random
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.itineraries.models import RouteLeg, RouteItinerary, SearchItineraryHistory
from apps.routes.models import Bot, Route
from apps.users.models import User


# 출발/도착 쌍 정의 (좌표 + 지명)
ROUTE_PAIRS = [
    {
        "departure_name": "강남역 2번출구",
        "arrival_name": "홍대입구역 1번출구",
        "start_x": "127.02761971",
        "start_y": "37.49794199",
        "end_x": "126.92370658",
        "end_y": "37.55685344",
    },
    {
        "departure_name": "서울역 1번출구",
        "arrival_name": "여의도역 1번출구",
        "start_x": "126.97199098",
        "start_y": "37.55538328",
        "end_x": "126.92434280",
        "end_y": "37.52163653",
    },
    {
        "departure_name": "잠실역 4번출구",
        "arrival_name": "건대입구역 2번출구",
        "start_x": "127.10013632",
        "start_y": "37.51320934",
        "end_x": "127.06957830",
        "end_y": "37.54028940",
    },
]

# 경로 템플릿 (각 구간에 3개 이상의 경로)
ROUTE_TEMPLATES = {
    ("강남역 2번출구", "홍대입구역 1번출구"): [
        {
            "label": "2호선",
            "legs": [
                {"mode": "WALK", "route": ""},
                {"mode": "SUBWAY", "route": "수도권2호선"},
                {"mode": "WALK", "route": ""},
            ],
            "base_duration": 1500,
        },
        {
            "label": "신분당선 → 2호선",
            "legs": [
                {"mode": "WALK", "route": ""},
                {"mode": "SUBWAY", "route": "신분당선"},
                {"mode": "SUBWAY", "route": "수도권2호선"},
                {"mode": "WALK", "route": ""},
            ],
            "base_duration": 1800,
        },
        {
            "label": "472",
            "legs": [
                {"mode": "WALK", "route": ""},
                {"mode": "BUS", "route": "간선:472"},
                {"mode": "WALK", "route": ""},
            ],
            "base_duration": 2400,
        },
    ],
    ("서울역 1번출구", "여의도역 1번출구"): [
        {
            "label": "1호선 → 5호선",
            "legs": [
                {"mode": "WALK", "route": ""},
                {"mode": "SUBWAY", "route": "수도권1호선"},
                {"mode": "SUBWAY", "route": "수도권5호선"},
                {"mode": "WALK", "route": ""},
            ],
            "base_duration": 1200,
        },
        {
            "label": "150",
            "legs": [
                {"mode": "WALK", "route": ""},
                {"mode": "BUS", "route": "간선:150"},
                {"mode": "WALK", "route": ""},
            ],
            "base_duration": 1800,
        },
        {
            "label": "9호선",
            "legs": [
                {"mode": "WALK", "route": ""},
                {"mode": "SUBWAY", "route": "수도권9호선"},
                {"mode": "WALK", "route": ""},
            ],
            "base_duration": 1400,
        },
    ],
    ("잠실역 4번출구", "건대입구역 2번출구"): [
        {
            "label": "2호선",
            "legs": [
                {"mode": "WALK", "route": ""},
                {"mode": "SUBWAY", "route": "수도권2호선"},
                {"mode": "WALK", "route": ""},
            ],
            "base_duration": 600,
        },
        {
            "label": "302",
            "legs": [
                {"mode": "WALK", "route": ""},
                {"mode": "BUS", "route": "지선:302"},
                {"mode": "WALK", "route": ""},
            ],
            "base_duration": 900,
        },
        {
            "label": "2234",
            "legs": [
                {"mode": "WALK", "route": ""},
                {"mode": "BUS", "route": "지선:2234"},
                {"mode": "WALK", "route": ""},
            ],
            "base_duration": 1100,
        },
    ],
}

# 시간대별 경주 수 설정
TIME_SLOT_CONFIG = {
    "morning": {"hour_range": (6, 11), "count_range": (5, 12)},
    "afternoon": {"hour_range": (12, 17), "count_range": (8, 15)},
    "evening": {"hour_range": (18, 23), "count_range": (4, 10)},
}


class Command(BaseCommand):
    help = "통계 페이지 테스트용 Mock 데이터 생성/삭제"

    def add_arguments(self, parser):
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Mock 데이터 삭제",
        )

    def handle(self, *args, **options):
        if options["clear"]:
            self._clear()
        else:
            self._seed()

    def _clear(self):
        """Mock 데이터 삭제 (start_lat=99.0으로 마킹된 것만)"""
        mock_routes = Route.objects.filter(start_lat=99.0)
        count = mock_routes.count()
        if count == 0:
            self.stdout.write("삭제할 Mock 데이터가 없습니다.")
            return

        itinerary_ids = set(mock_routes.values_list("route_itinerary_id", flat=True))
        leg_ids = set(mock_routes.values_list("route_leg_id", flat=True))

        mock_routes.delete()
        RouteLeg.objects.filter(id__in=leg_ids).delete()
        SearchItineraryHistory.objects.filter(
            route_itinerary_id__in=itinerary_ids
        ).delete()
        RouteItinerary.objects.filter(id__in=itinerary_ids).delete()

        self.stdout.write(self.style.SUCCESS(f"Mock 데이터 {count}건 삭제 완료"))

    def _seed(self):
        """Mock 데이터 생성 (경주 1회 = USER 1명 + BOT 2명, 각각 다른 경로)"""
        user = User.objects.first()
        if not user:
            self.stdout.write(self.style.ERROR("유저가 없습니다."))
            return

        bot1 = Bot.objects.first()
        bot2 = Bot.objects.exclude(id=bot1.id).first() if bot1 else None
        if not bot1:
            bot1 = Bot.objects.create(name="stats-mock-bot-1", type="NORMAL")
        if not bot2:
            bot2 = Bot.objects.create(name="stats-mock-bot-2", type="NORMAL")

        total_created = 0
        base_date = timezone.now() - timedelta(days=14)

        for pair in ROUTE_PAIRS:
            dep = pair["departure_name"]
            arr = pair["arrival_name"]
            templates = ROUTE_TEMPLATES.get((dep, arr), [])
            if len(templates) < 3:
                continue

            self.stdout.write(f"\n{dep} → {arr}")

            for slot_name, slot_cfg in TIME_SLOT_CONFIG.items():
                h_lo, h_hi = slot_cfg["hour_range"]
                race_count = random.randint(*slot_cfg["count_range"])

                for _ in range(race_count):
                    # 3개 경로 중 서로 다른 3개를 USER, BOT1, BOT2에 배정
                    selected = random.sample(templates, 3)
                    user_tmpl, bot1_tmpl, bot2_tmpl = selected

                    # RouteItinerary 생성 (경주 세션 1개)
                    ri = RouteItinerary.objects.create(
                        start_x=pair["start_x"],
                        start_y=pair["start_y"],
                        end_x=pair["end_x"],
                        end_y=pair["end_y"],
                    )

                    # SearchItineraryHistory (지명 매핑)
                    SearchItineraryHistory.objects.create(
                        user=user,
                        route_itinerary=ri,
                        departure_name=dep,
                        arrival_name=arr,
                    )

                    # 경주 시간
                    day_offset = random.randint(0, 13)
                    hour = random.randint(h_lo, h_hi)
                    minute = random.randint(0, 59)
                    start_time = (base_date + timedelta(days=day_offset)).replace(
                        hour=hour, minute=minute, second=0, microsecond=0
                    )

                    # 각 참가자 소요시간 (base_duration ±25%)
                    user_dur = int(user_tmpl["base_duration"] * random.uniform(0.75, 1.25))
                    bot1_dur = int(bot1_tmpl["base_duration"] * random.uniform(0.75, 1.25))
                    bot2_dur = int(bot2_tmpl["base_duration"] * random.uniform(0.75, 1.25))

                    # 순위 결정
                    participants = [
                        ("USER", user_tmpl, user_dur),
                        ("BOT1", bot1_tmpl, bot1_dur),
                        ("BOT2", bot2_tmpl, bot2_dur),
                    ]
                    participants.sort(key=lambda x: x[2])
                    winner_type = participants[0][0]

                    # RouteLeg 생성 (각자 다른 경로, leg_index로 구분)
                    leg_counter = [0]

                    def make_leg(tmpl):
                        idx = leg_counter[0]
                        leg_counter[0] += 1
                        return RouteLeg.objects.create(
                            route_itinerary=ri,
                            leg_index=idx,
                            path_type=1,
                            total_time=tmpl["base_duration"],
                            total_distance=5000,
                            total_walk_time=300,
                            total_walk_distance=500,
                            transfer_count=max(
                                0,
                                len([l for l in tmpl["legs"] if l["mode"] != "WALK"]) - 1,
                            ),
                            total_fare=1250,
                            raw_data={"legs": tmpl["legs"]},
                        )

                    user_leg = make_leg(user_tmpl)
                    bot1_leg = make_leg(bot1_tmpl)
                    bot2_leg = make_leg(bot2_tmpl)

                    # Route 생성
                    Route.objects.create(
                        participant_type=Route.ParticipantType.USER,
                        user=user,
                        route_itinerary=ri,
                        route_leg=user_leg,
                        status=Route.Status.FINISHED,
                        start_time=start_time,
                        end_time=start_time + timedelta(seconds=user_dur),
                        duration=user_dur,
                        rank=1 if winner_type == "USER" else (2 if user_dur <= bot2_dur else 3),
                        is_win=(winner_type == "USER"),
                        start_lat=99.0,
                        start_lon=0.0,
                    )

                    Route.objects.create(
                        participant_type=Route.ParticipantType.BOT,
                        bot=bot1,
                        route_itinerary=ri,
                        route_leg=bot1_leg,
                        status=Route.Status.FINISHED,
                        start_time=start_time,
                        end_time=start_time + timedelta(seconds=bot1_dur),
                        duration=bot1_dur,
                        rank=1 if winner_type == "BOT1" else (2 if bot1_dur <= bot2_dur else 3),
                        is_win=(winner_type == "BOT1"),
                        start_lat=99.0,
                        start_lon=0.0,
                    )

                    Route.objects.create(
                        participant_type=Route.ParticipantType.BOT,
                        bot=bot2,
                        route_itinerary=ri,
                        route_leg=bot2_leg,
                        status=Route.Status.FINISHED,
                        start_time=start_time,
                        end_time=start_time + timedelta(seconds=bot2_dur),
                        duration=bot2_dur,
                        rank=1 if winner_type == "BOT2" else (2 if bot2_dur <= user_dur else 3),
                        is_win=(winner_type == "BOT2"),
                        start_lat=99.0,
                        start_lon=0.0,
                    )

                    total_created += 3

                self.stdout.write(f"  {slot_name}: {race_count}회 경주 생성")

        self.stdout.write(
            self.style.SUCCESS(f"\n총 {total_created}건 Route 생성 완료 (Mock)")
        )
        self.stdout.write("삭제하려면: python manage.py seed_stats_mock --clear")
