"""
경주 관련 모델

- Bot: 봇 정보
- Route: 경주 세션 (유저/봇 참가자)
- SubwayStation: 지하철 역 정보 (외부코드 기반 방향 판단용)
"""

import re

from django.conf import settings
from django.db import models


class Bot(models.Model):
    """
    봇 모델

    경주에서 유저와 경쟁하는 가상의 참가자
    """

    class BotType(models.TextChoices):
        RABBIT = "rabbit", "토끼"
        CAT = "cat", "고양이"
        DOG = "dog", "강아지"
        MONKEY = "monkey", "원숭이"

    name = models.CharField(max_length=100, verbose_name="봇 이름")
    type = models.CharField(
        max_length=20,
        choices=BotType.choices,
        default=BotType.RABBIT,
        verbose_name="봇 타입 (생김새)",
    )

    # 타임스탬프
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일시")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일시")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="삭제일시")

    class Meta:
        db_table = "bot"
        verbose_name = "봇"
        verbose_name_plural = "봇 목록"

    def __str__(self):
        return f"Bot: {self.name} ({self.type})"


class Route(models.Model):
    """
    경주 모델

    유저 vs 봇의 경주 인스턴스
    경주 시작 버튼을 누르면 생성됨 (RUNNING 상태로 시작)
    같은 경주의 참가자들은 동일한 route_itinerary를 공유
    """

    class Status(models.TextChoices):
        RUNNING = "RUNNING", "진행중"
        FINISHED = "FINISHED", "완료"
        CANCELED = "CANCELED", "취소"

    class ParticipantType(models.TextChoices):
        USER = "USER", "유저"
        BOT = "BOT", "봇"

    # 참가자 정보 (유저 또는 봇)
    participant_type = models.CharField(
        max_length=10,
        choices=ParticipantType.choices,
        verbose_name="참가자 유형",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="routes",
        null=True,
        blank=True,
        verbose_name="유저",
    )
    bot = models.ForeignKey(
        Bot,
        on_delete=models.CASCADE,
        related_name="routes",
        null=True,
        blank=True,
        verbose_name="봇",
    )

    # 경로 정보
    route_itinerary = models.ForeignKey(
        "itineraries.RouteItinerary",
        on_delete=models.CASCADE,
        related_name="races",
        verbose_name="경로 탐색 결과",
    )
    route_leg = models.ForeignKey(
        "itineraries.RouteLeg",
        on_delete=models.CASCADE,
        related_name="races",
        verbose_name="배정된 경로",
    )

    # 경주 상태 (시작 시 RUNNING으로 생성)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.RUNNING,
        verbose_name="경주 상태",
    )

    # 시간 정보
    start_time = models.DateTimeField(verbose_name="시작 시간")
    end_time = models.DateTimeField(null=True, blank=True, verbose_name="종료 시간")
    duration = models.PositiveIntegerField(null=True, blank=True, verbose_name="소요 시간 (초)")

    # 결과 정보
    rank = models.PositiveSmallIntegerField(null=True, blank=True, verbose_name="순위")
    is_win = models.BooleanField(null=True, blank=True, verbose_name="승리 여부")

    # 출발/도착 좌표
    start_lat = models.FloatField(null=True, blank=True, verbose_name="출발 위도")
    start_lon = models.FloatField(null=True, blank=True, verbose_name="출발 경도")
    end_lat = models.FloatField(null=True, blank=True, verbose_name="도착 위도")
    end_lon = models.FloatField(null=True, blank=True, verbose_name="도착 경도")

    # 타임스탬프
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일시")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일시")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="삭제일시")

    class Meta:
        db_table = "route"
        verbose_name = "경주"
        verbose_name_plural = "경주 목록"
        ordering = ["-created_at"]

    def __str__(self):
        if self.participant_type == self.ParticipantType.USER:
            return f"Route #{self.id}: User {self.user.nickname} - {self.status}"
        else:
            return f"Route #{self.id}: Bot {self.bot.name} - {self.status}"

    @property
    def participant_name(self) -> str:
        """참가자 이름 반환"""
        if self.participant_type == self.ParticipantType.USER:
            return self.user.nickname if self.user else "Unknown"
        else:
            return self.bot.name if self.bot else "Unknown"


class SubwayStation(models.Model):
    """
    지하철 역 정보

    외부코드 기반 상행/하행 방향 판단에 사용됩니다.
    외부코드가 작을수록 기점에 가깝습니다.
    - 외부코드 감소 = 하행 (또는 2호선 외선)
    - 외부코드 증가 = 상행 (또는 2호선 내선)

    데이터 출처: 서울교통공사_역명_지하철역_검색.csv
    """

    station_code = models.CharField(max_length=20, verbose_name="전철역 코드")
    station_name = models.CharField(max_length=50, db_index=True, verbose_name="전철역명")
    line = models.CharField(max_length=20, verbose_name="호선")
    line_num = models.PositiveSmallIntegerField(db_index=True, verbose_name="호선 번호")
    external_code = models.CharField(max_length=20, verbose_name="외부코드")
    external_code_num = models.PositiveIntegerField(
        null=True, blank=True, db_index=True, verbose_name="외부코드 숫자"
    )

    class Meta:
        db_table = "subway_station"
        verbose_name = "지하철 역"
        verbose_name_plural = "지하철 역 목록"
        indexes = [
            models.Index(fields=["station_name", "line_num"]),
        ]

    def __str__(self):
        return f"{self.station_name} ({self.line})"

    def save(self, *args, **kwargs):
        # 호선 번호 자동 추출 (02호선 → 2)
        if self.line and not self.line_num:
            numbers = re.findall(r"\d+", self.line)
            if numbers:
                self.line_num = int(numbers[0])

        # 외부코드에서 숫자 추출 (P143 → 143, 234-4 → 234)
        if self.external_code and not self.external_code_num:
            numbers = re.findall(r"\d+", str(self.external_code))
            if numbers:
                self.external_code_num = int(numbers[0])

        super().save(*args, **kwargs)

    @classmethod
    def get_external_code(cls, station_name: str, line: str) -> int | None:
        """
        역명과 호선으로 외부코드 조회

        Args:
            station_name: 역명 (예: "신논현", "신논현역")
            line: 호선 (예: "9", "9호선", "1009")

        Returns:
            외부코드 (숫자) 또는 None
        """
        # 역명 정규화 (신논현역 → 신논현)
        name = station_name.strip()
        if name.endswith("역"):
            name = name[:-1]

        # 호선 번호 추출
        if line.startswith("100"):
            # API 호선 ID (1009 → 9)
            line_num = int(line[-1]) if line[-1] != "0" else int(line[-2:])
        else:
            numbers = re.findall(r"\d+", str(line))
            line_num = int(numbers[0]) if numbers else None

        if line_num is None:
            return None

        # 정확히 일치하는 역 검색
        station = cls.objects.filter(
            station_name=name, line_num=line_num
        ).first()

        # 부분 일치 시도
        if not station:
            station = cls.objects.filter(
                station_name__contains=name, line_num=line_num
            ).first()

        if station:
            return station.external_code_num

        return None

    @classmethod
    def get_direction(
        cls, start_station: str, end_station: str, line: str
    ) -> str | None:
        """
        출발역/도착역으로 상행/하행 판단

        Args:
            start_station: 출발역명
            end_station: 도착역명
            line: 호선

        Returns:
            방향 ("상행", "하행", "내선", "외선") 또는 None
        """
        start_code = cls.get_external_code(start_station, line)
        end_code = cls.get_external_code(end_station, line)

        if start_code is None or end_code is None:
            return None

        # 호선 번호 추출
        if line.startswith("100"):
            line_num = int(line[-1]) if line[-1] != "0" else int(line[-2:])
        else:
            numbers = re.findall(r"\d+", str(line))
            line_num = int(numbers[0]) if numbers else None

        # 2호선 순환선은 내선/외선
        if line_num == 2:
            if end_code < start_code:
                return "외선"  # 시계방향
            else:
                return "내선"  # 반시계방향

        # 일반 노선
        if end_code < start_code:
            return "하행"
        else:
            return "상행"
