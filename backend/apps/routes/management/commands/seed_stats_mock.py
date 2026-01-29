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

from apps.itineraries.models import RouteItinerary, RouteLeg, SearchItineraryHistory
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

# 경로 템플릿 (TMap API 실제 응답 기반)
# legs에 RouteTimeline 렌더링에 필요한 start/end/sectionTime/distance/routeColor 포함
ROUTE_TEMPLATES = {
    ("강남역 2번출구", "홍대입구역 1번출구"): [
        {
            "label": "2호선",
            "legs": [
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "출발지"},
                    "end": {"name": "강남"},
                    "sectionTime": 155,
                    "distance": 172,
                },
                {
                    "mode": "SUBWAY",
                    "route": "수도권2호선",
                    "routeColor": "009D3E",
                    "start": {"name": "강남"},
                    "end": {"name": "홍대입구"},
                    "sectionTime": 2356,
                    "distance": 22090,
                    "passStopList": {
                        "stationList": [
                            {"stationID": "222", "stationName": "강남"},
                            {"stationID": "221", "stationName": "교대"},
                            {"stationID": "220", "stationName": "서초"},
                            {"stationID": "219", "stationName": "방배"},
                            {"stationID": "218", "stationName": "사당"},
                            {"stationID": "217", "stationName": "낙성대"},
                            {"stationID": "216", "stationName": "서울대입구"},
                            {"stationID": "215", "stationName": "봉천"},
                            {"stationID": "214", "stationName": "신림"},
                            {"stationID": "213", "stationName": "신대방"},
                            {"stationID": "212", "stationName": "구로디지털단지"},
                            {"stationID": "211", "stationName": "대림"},
                            {"stationID": "234", "stationName": "신도림"},
                            {"stationID": "235", "stationName": "문래"},
                            {"stationID": "236", "stationName": "영등포구청"},
                            {"stationID": "237", "stationName": "당산"},
                            {"stationID": "238", "stationName": "합정"},
                            {"stationID": "239", "stationName": "홍대입구"},
                        ]
                    },
                },
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "홍대입구"},
                    "end": {"name": "도착지"},
                    "sectionTime": 17,
                    "distance": 21,
                },
            ],
            "base_duration": 2528,
        },
        {
            "label": "420 → 2호선",
            "legs": [
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "출발지"},
                    "end": {"name": "지하철2호선강남역"},
                    "sectionTime": 403,
                    "distance": 435,
                },
                {
                    "mode": "BUS",
                    "route": "간선:420",
                    "routeColor": "0068B7",
                    "start": {"name": "지하철2호선강남역"},
                    "end": {"name": "동대문역사문화공원역9번출구"},
                    "sectionTime": 1147,
                    "distance": 8019,
                    "passStopList": {
                        "stationList": [
                            {"stationID": "102894", "stationName": "지하철2호선강남역"},
                            {"stationID": "102895", "stationName": "라퀴역"},
                            {"stationID": "102896", "stationName": "잠원역"},
                            {"stationID": "102897", "stationName": "한남대교남단"},
                            {"stationID": "102898", "stationName": "한남사거리"},
                            {"stationID": "102899", "stationName": "순천향대학병원"},
                            {
                                "stationID": "102900",
                                "stationName": "서울소방재난교육센터",
                            },
                            {
                                "stationID": "102901",
                                "stationName": "국립극장.반얀트리호텔",
                            },
                            {"stationID": "102902", "stationName": "장충동.동국대입구"},
                            {
                                "stationID": "102903",
                                "stationName": "동대문역사문화공원역9번출구",
                            },
                        ]
                    },
                },
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "동대문역사문화공원역9번출구"},
                    "end": {"name": "동대문역사문화공원"},
                    "sectionTime": 106,
                    "distance": 149,
                },
                {
                    "mode": "SUBWAY",
                    "route": "수도권2호선",
                    "routeColor": "009D3E",
                    "start": {"name": "동대문역사문화공원"},
                    "end": {"name": "홍대입구"},
                    "sectionTime": 1021,
                    "distance": 7992,
                    "passStopList": {
                        "stationList": [
                            {"stationID": "205", "stationName": "동대문역사문화공원"},
                            {"stationID": "204", "stationName": "을지로4가"},
                            {"stationID": "203", "stationName": "을지로3가"},
                            {"stationID": "202", "stationName": "을지로입구"},
                            {"stationID": "201", "stationName": "시청"},
                            {"stationID": "243", "stationName": "충정로"},
                            {"stationID": "242", "stationName": "아현"},
                            {"stationID": "241", "stationName": "이대"},
                            {"stationID": "240", "stationName": "신촌"},
                            {"stationID": "239", "stationName": "홍대입구"},
                        ]
                    },
                },
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "홍대입구"},
                    "end": {"name": "도착지"},
                    "sectionTime": 17,
                    "distance": 21,
                },
            ],
            "base_duration": 2694,
        },
        {
            "label": "740 → 7016",
            "legs": [
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "출발지"},
                    "end": {"name": "강남역.강남역사거리"},
                    "sectionTime": 137,
                    "distance": 150,
                },
                {
                    "mode": "BUS",
                    "route": "간선:740",
                    "routeColor": "0068B7",
                    "start": {"name": "강남역.강남역사거리"},
                    "end": {"name": "공덕역2번출구"},
                    "sectionTime": 1970,
                    "distance": 10624,
                    "passStopList": {
                        "stationList": [
                            {
                                "stationID": "105250",
                                "stationName": "강남역.강남역사거리",
                            },
                            {"stationID": "105251", "stationName": "서초디지향아파트"},
                            {
                                "stationID": "105252",
                                "stationName": "서초르네상스보훈회.전원아파트",
                            },
                            {
                                "stationID": "105253",
                                "stationName": "지하철2호선교대역4번출구",
                            },
                            {"stationID": "105254", "stationName": "교대역10번출구"},
                            {
                                "stationID": "105255",
                                "stationName": "서초역.서울중앙지법등기국",
                            },
                            {
                                "stationID": "105256",
                                "stationName": "서울중앙지방검찰청",
                            },
                            {
                                "stationID": "105257",
                                "stationName": "서울지방조달청.서울성모병원",
                            },
                            {
                                "stationID": "105258",
                                "stationName": "반포한강공원.선비사",
                            },
                            {"stationID": "105259", "stationName": "한강중학교"},
                            {"stationID": "105260", "stationName": "용산구청"},
                            {"stationID": "105261", "stationName": "삼각지역"},
                            {"stationID": "105262", "stationName": "전쟁기념관"},
                            {
                                "stationID": "105263",
                                "stationName": "용산꿈나무종합타운",
                            },
                            {
                                "stationID": "105264",
                                "stationName": "효창공원앞역",
                            },
                            {
                                "stationID": "105265",
                                "stationName": "용마루고개",
                            },
                            {
                                "stationID": "105266",
                                "stationName": "공덕사거리",
                            },
                            {"stationID": "105267", "stationName": "공덕역2번출구"},
                        ]
                    },
                },
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "공덕역2번출구"},
                    "end": {"name": "공덕역2번출구"},
                    "sectionTime": 0,
                    "distance": 0,
                },
                {
                    "mode": "BUS",
                    "route": "지선:7016",
                    "routeColor": "53B332",
                    "start": {"name": "공덕역2번출구"},
                    "end": {"name": "홍대입구역"},
                    "sectionTime": 636,
                    "distance": 3050,
                    "passStopList": {
                        "stationList": [
                            {"stationID": "106001", "stationName": "공덕역2번출구"},
                            {
                                "stationID": "106002",
                                "stationName": "대도중학교.서울대원외국어고등학교",
                            },
                            {"stationID": "106003", "stationName": "대흥역"},
                            {"stationID": "106004", "stationName": "광성중고등학교"},
                            {"stationID": "106005", "stationName": "서강대학교"},
                            {"stationID": "106006", "stationName": "신이로터리"},
                            {
                                "stationID": "106007",
                                "stationName": "신이사거리.현대백화점",
                            },
                            {"stationID": "106008", "stationName": "동교동일거리"},
                            {"stationID": "106009", "stationName": "홍대입구역"},
                        ]
                    },
                },
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "홍대입구역"},
                    "end": {"name": "도착지"},
                    "sectionTime": 85,
                    "distance": 78,
                },
            ],
            "base_duration": 2828,
        },
    ],
    ("서울역 1번출구", "여의도역 1번출구"): [
        {
            "label": "1호선 → 5호선",
            "legs": [
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "출발지"},
                    "end": {"name": "서울역"},
                    "sectionTime": 191,
                    "distance": 216,
                },
                {
                    "mode": "SUBWAY",
                    "route": "수도권1호선",
                    "routeColor": "0052A4",
                    "start": {"name": "서울역"},
                    "end": {"name": "신길"},
                    "sectionTime": 780,
                    "distance": 8209,
                    "passStopList": {
                        "stationList": [
                            {"stationID": "133", "stationName": "서울역"},
                            {"stationID": "134", "stationName": "남영"},
                            {"stationID": "135", "stationName": "용산"},
                            {"stationID": "136", "stationName": "노량진"},
                            {"stationID": "137", "stationName": "대방"},
                            {"stationID": "138", "stationName": "신길"},
                        ]
                    },
                },
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "신길"},
                    "end": {"name": "신길"},
                    "sectionTime": 349,
                    "distance": 371,
                },
                {
                    "mode": "SUBWAY",
                    "route": "수도권5호선",
                    "routeColor": "996CAC",
                    "start": {"name": "신길"},
                    "end": {"name": "여의도"},
                    "sectionTime": 120,
                    "distance": 874,
                    "passStopList": {
                        "stationList": [
                            {"stationID": "531", "stationName": "신길"},
                            {"stationID": "526", "stationName": "여의도"},
                        ]
                    },
                },
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "여의도"},
                    "end": {"name": "도착지"},
                    "sectionTime": 164,
                    "distance": 147,
                },
            ],
            "base_duration": 1604,
        },
        {
            "label": "162",
            "legs": [
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "출발지"},
                    "end": {"name": "서울역버스환승센터(4번승강장)"},
                    "sectionTime": 172,
                    "distance": 182,
                },
                {
                    "mode": "BUS",
                    "route": "간선:162",
                    "routeColor": "0068B7",
                    "start": {"name": "서울역버스환승센터(4번승강장)"},
                    "end": {"name": "여의도역"},
                    "sectionTime": 1397,
                    "distance": 6856,
                    "passStopList": {
                        "stationList": [
                            {
                                "stationID": "100001",
                                "stationName": "서울역버스환승센터(4번승강장)",
                            },
                            {"stationID": "100002", "stationName": "갈월동"},
                            {
                                "stationID": "100003",
                                "stationName": "갈월동.서부이촌역10번출구",
                            },
                            {
                                "stationID": "100004",
                                "stationName": "남영역.민주화운동기념관",
                            },
                            {"stationID": "100005", "stationName": "용산경찰서"},
                            {
                                "stationID": "100006",
                                "stationName": "용산꿈나무종합타운.삼효로우체국",
                            },
                            {"stationID": "100007", "stationName": "삼효로2가"},
                            {"stationID": "100008", "stationName": "삼효로3가"},
                            {
                                "stationID": "100009",
                                "stationName": "신번아파트.대교아파트",
                            },
                            {"stationID": "100010", "stationName": "KBS별관"},
                            {
                                "stationID": "100011",
                                "stationName": "시강역1번출구.여의도시외",
                            },
                            {"stationID": "100012", "stationName": "여의도역"},
                        ]
                    },
                },
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "여의도역"},
                    "end": {"name": "도착지"},
                    "sectionTime": 67,
                    "distance": 54,
                },
            ],
            "base_duration": 1636,
        },
        {
            "label": "1호선 → 163",
            "legs": [
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "출발지"},
                    "end": {"name": "서울역"},
                    "sectionTime": 191,
                    "distance": 216,
                },
                {
                    "mode": "SUBWAY",
                    "route": "수도권1호선",
                    "routeColor": "0052A4",
                    "start": {"name": "서울역"},
                    "end": {"name": "대방"},
                    "sectionTime": 720,
                    "distance": 7305,
                    "passStopList": {
                        "stationList": [
                            {"stationID": "133", "stationName": "서울역"},
                            {"stationID": "134", "stationName": "남영"},
                            {"stationID": "135", "stationName": "용산"},
                            {"stationID": "136", "stationName": "노량진"},
                            {"stationID": "137", "stationName": "대방"},
                        ]
                    },
                },
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "대방"},
                    "end": {"name": "대방역7번출구"},
                    "sectionTime": 78,
                    "distance": 86,
                },
                {
                    "mode": "BUS",
                    "route": "간선:163",
                    "routeColor": "0068B7",
                    "start": {"name": "대방역7번출구"},
                    "end": {"name": "여의도역"},
                    "sectionTime": 191,
                    "distance": 989,
                    "passStopList": {
                        "stationList": [
                            {"stationID": "100020", "stationName": "대방역7번출구"},
                            {
                                "stationID": "100021",
                                "stationName": "시강역1번출구.여의도시외",
                            },
                            {"stationID": "100022", "stationName": "여의도역"},
                        ]
                    },
                },
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "여의도역"},
                    "end": {"name": "도착지"},
                    "sectionTime": 67,
                    "distance": 54,
                },
            ],
            "base_duration": 1247,
        },
    ],
    ("잠실역 4번출구", "건대입구역 2번출구"): [
        {
            "label": "2호선",
            "legs": [
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "출발지"},
                    "end": {"name": "잠실"},
                    "sectionTime": 169,
                    "distance": 135,
                },
                {
                    "mode": "SUBWAY",
                    "route": "수도권2호선",
                    "routeColor": "009D3E",
                    "start": {"name": "잠실"},
                    "end": {"name": "건대입구"},
                    "sectionTime": 493,
                    "distance": 5347,
                    "passStopList": {
                        "stationList": [
                            {"stationID": "216", "stationName": "잠실"},
                            {"stationID": "215", "stationName": "잠실나루"},
                            {"stationID": "214", "stationName": "강변"},
                            {"stationID": "213", "stationName": "구의"},
                            {"stationID": "212", "stationName": "건대입구"},
                        ]
                    },
                },
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "건대입구"},
                    "end": {"name": "도착지"},
                    "sectionTime": 145,
                    "distance": 171,
                },
            ],
            "base_duration": 807,
        },
        {
            "label": "N73",
            "legs": [
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "출발지"},
                    "end": {"name": "잠실역7번출구"},
                    "sectionTime": 212,
                    "distance": 228,
                },
                {
                    "mode": "BUS",
                    "route": "간선:N73",
                    "routeColor": "0068B7",
                    "start": {"name": "잠실역7번출구"},
                    "end": {"name": "건대입구역1번출구"},
                    "sectionTime": 653,
                    "distance": 4265,
                    "passStopList": {
                        "stationList": [
                            {"stationID": "200001", "stationName": "잠실역7번출구"},
                            {
                                "stationID": "200002",
                                "stationName": "잠실대교남단",
                            },
                            {
                                "stationID": "200003",
                                "stationName": "대성인쇄지식산업센터",
                            },
                            {"stationID": "200004", "stationName": "아차산사거리"},
                            {"stationID": "200005", "stationName": "아차산초등학교"},
                            {"stationID": "200006", "stationName": "건국대학교앞"},
                            {
                                "stationID": "200007",
                                "stationName": "건대입구역1번출구",
                            },
                        ]
                    },
                },
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "건대입구역1번출구"},
                    "end": {"name": "도착지"},
                    "sectionTime": 100,
                    "distance": 141,
                },
            ],
            "base_duration": 965,
        },
        {
            "label": "303 → N73",
            "legs": [
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "출발지"},
                    "end": {"name": "잠실역.롯데월드몰"},
                    "sectionTime": 196,
                    "distance": 171,
                },
                {
                    "mode": "BUS",
                    "route": "간선:303",
                    "routeColor": "0068B7",
                    "start": {"name": "잠실역.롯데월드몰"},
                    "end": {"name": "잠실대교남단"},
                    "sectionTime": 532,
                    "distance": 2538,
                    "passStopList": {
                        "stationList": [
                            {
                                "stationID": "200010",
                                "stationName": "잠실역.롯데월드몰",
                            },
                            {
                                "stationID": "200011",
                                "stationName": "잠실역.잠실대교남단",
                            },
                            {
                                "stationID": "200012",
                                "stationName": "잠실대교남단",
                            },
                            {
                                "stationID": "200013",
                                "stationName": "잠실대교남단",
                            },
                        ]
                    },
                },
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "잠실대교남단"},
                    "end": {"name": "잠실대교남단"},
                    "sectionTime": 0,
                    "distance": 0,
                },
                {
                    "mode": "BUS",
                    "route": "간선:N73",
                    "routeColor": "0068B7",
                    "start": {"name": "잠실대교남단"},
                    "end": {"name": "건대입구역1번출구"},
                    "sectionTime": 472,
                    "distance": 1988,
                    "passStopList": {
                        "stationList": [
                            {
                                "stationID": "200002",
                                "stationName": "잠실대교남단",
                            },
                            {
                                "stationID": "200003",
                                "stationName": "대성인쇄지식산업센터",
                            },
                            {"stationID": "200004", "stationName": "아차산사거리"},
                            {"stationID": "200005", "stationName": "아차산초등학교"},
                            {"stationID": "200006", "stationName": "건국대학교앞"},
                            {
                                "stationID": "200007",
                                "stationName": "건대입구역1번출구",
                            },
                        ]
                    },
                },
                {
                    "mode": "WALK",
                    "route": "",
                    "start": {"name": "건대입구역1번출구"},
                    "end": {"name": "도착지"},
                    "sectionTime": 100,
                    "distance": 141,
                },
            ],
            "base_duration": 1300,
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
                    user_dur = int(
                        user_tmpl["base_duration"] * random.uniform(0.75, 1.25)
                    )
                    bot1_dur = int(
                        bot1_tmpl["base_duration"] * random.uniform(0.75, 1.25)
                    )
                    bot2_dur = int(
                        bot2_tmpl["base_duration"] * random.uniform(0.75, 1.25)
                    )

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
                                len(
                                    [
                                        leg
                                        for leg in tmpl["legs"]
                                        if leg["mode"] != "WALK"
                                    ]
                                )
                                - 1,
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
                        rank=(
                            1
                            if winner_type == "USER"
                            else (2 if user_dur <= bot2_dur else 3)
                        ),
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
                        rank=(
                            1
                            if winner_type == "BOT1"
                            else (2 if bot1_dur <= bot2_dur else 3)
                        ),
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
                        rank=(
                            1
                            if winner_type == "BOT2"
                            else (2 if bot2_dur <= user_dur else 3)
                        ),
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
