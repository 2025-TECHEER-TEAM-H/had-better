"""
경주 관련 모델

- Bot: 봇 정보
- Route: 경주 세션 (유저/봇 참가자)
"""

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
