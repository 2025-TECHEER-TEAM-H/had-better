"""
경로 검색 관련 모델

- RouteItinerary: 경로 탐색 결과 묶음
- RouteLeg: 개별 경로 옵션
- RouteSegment: 경로 내 세부 구간 (WALK, SUBWAY, BUS 등)
- SearchItineraryHistory: 경로 검색 기록
"""

from django.conf import settings
from django.db import models


class RouteItinerary(models.Model):
    """
    경로 탐색 결과 묶음

    TMAP API에서 한 번의 검색으로 반환되는 여러 경로 옵션을 묶는 단위
    """

    # 검색 파라미터 저장
    start_x = models.CharField(max_length=50, verbose_name="출발지 경도")
    start_y = models.CharField(max_length=50, verbose_name="출발지 위도")
    end_x = models.CharField(max_length=50, verbose_name="도착지 경도")
    end_y = models.CharField(max_length=50, verbose_name="도착지 위도")

    # 타임스탬프
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일시")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일시")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="삭제일시")

    class Meta:
        db_table = "route_itinerary"
        verbose_name = "경로 탐색 결과"
        verbose_name_plural = "경로 탐색 결과 목록"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Itinerary #{self.id}: ({self.start_y}, {self.start_x}) -> ({self.end_y}, {self.end_x})"


class RouteLeg(models.Model):
    """
    개별 경로 구간

    경로 탐색 결과 중 하나의 경로 옵션
    경주에서 유저나 봇에게 배정되는 단위
    """

    # 경로 탐색 결과 참조
    route_itinerary = models.ForeignKey(
        RouteItinerary,
        on_delete=models.CASCADE,
        related_name="legs",
        verbose_name="경로 탐색 결과",
    )

    # 경로 인덱스 (같은 itinerary 내 순서)
    leg_index = models.PositiveIntegerField(verbose_name="경로 인덱스")

    # 경로 타입 (1:지하철, 2:버스, 3:버스+지하철, 4:고속/시외버스, 5:기차, 6:항공, 7:해운)
    path_type = models.PositiveSmallIntegerField(verbose_name="경로 타입")

    # 총계 정보
    total_time = models.PositiveIntegerField(verbose_name="총 소요시간 (초)")
    total_distance = models.PositiveIntegerField(verbose_name="총 이동거리 (m)")
    total_walk_time = models.PositiveIntegerField(
        default=0, verbose_name="총 도보 소요시간 (초)"
    )
    total_walk_distance = models.PositiveIntegerField(
        default=0, verbose_name="총 도보 이동거리 (m)"
    )
    transfer_count = models.PositiveSmallIntegerField(
        default=0, verbose_name="환승 횟수"
    )
    total_fare = models.PositiveIntegerField(default=0, verbose_name="총 요금")

    # TMAP API 원본 응답 (상세 정보 저장)
    raw_data = models.JSONField(verbose_name="TMAP API 원본 데이터")

    # 타임스탬프
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일시")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일시")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="삭제일시")

    class Meta:
        db_table = "route_leg"
        verbose_name = "경로 구간"
        verbose_name_plural = "경로 구간 목록"
        ordering = ["route_itinerary", "leg_index"]
        unique_together = ["route_itinerary", "leg_index"]

    def __str__(self):
        return f"Leg #{self.id}: Itinerary {self.route_itinerary_id} - Index {self.leg_index}"

    @property
    def summary(self) -> str:
        """경로 요약 문자열 생성"""
        path_type_names = {
            1: "지하철",
            2: "버스",
            3: "버스+지하철",
            4: "고속버스",
            5: "기차",
            6: "항공",
            7: "해운",
        }
        return path_type_names.get(self.path_type, "대중교통")


class RouteSegment(models.Model):
    """
    경로 내 세부 구간

    각 경로 옵션(RouteLeg) 내의 개별 이동 구간
    예: 도보 → 지하철 2호선 → 도보 (3개의 RouteSegment)
    """

    # 이동수단 타입
    class ModeChoices(models.TextChoices):
        WALK = "WALK", "도보"
        SUBWAY = "SUBWAY", "지하철"
        BUS = "BUS", "버스"
        EXPRESSBUS = "EXPRESSBUS", "고속버스"
        TRAIN = "TRAIN", "기차"
        AIRPLANE = "AIRPLANE", "항공"
        FERRY = "FERRY", "해운"

    # 경로 옵션 참조
    route_leg = models.ForeignKey(
        RouteLeg,
        on_delete=models.CASCADE,
        related_name="segments",
        verbose_name="경로 옵션",
    )

    # 구간 인덱스 (같은 leg 내 순서)
    segment_index = models.PositiveIntegerField(verbose_name="구간 인덱스")

    # 이동수단 정보
    mode = models.CharField(
        max_length=20,
        choices=ModeChoices.choices,
        verbose_name="이동수단",
    )

    # 시간/거리 정보
    section_time = models.PositiveIntegerField(verbose_name="소요시간 (초)")
    distance = models.PositiveIntegerField(verbose_name="이동거리 (m)")

    # 출발/도착 정보
    start_name = models.CharField(max_length=255, verbose_name="출발지명")
    start_lat = models.FloatField(verbose_name="출발지 위도")
    start_lon = models.FloatField(verbose_name="출발지 경도")
    end_name = models.CharField(max_length=255, verbose_name="도착지명")
    end_lat = models.FloatField(verbose_name="도착지 위도")
    end_lon = models.FloatField(verbose_name="도착지 경도")

    # 노선 정보 (대중교통인 경우)
    route_name = models.CharField(
        max_length=100, blank=True, default="", verbose_name="노선명"
    )
    route_color = models.CharField(
        max_length=10, blank=True, default="", verbose_name="노선 색상 (HEX)"
    )

    # 경로 좌표 리스트 (JSONB)
    # [[lon, lat], [lon, lat], ...] 형태로 저장
    # 프론트엔드에서 이 좌표를 사용해 GeoJSON LineString 생성
    path_coordinates = models.JSONField(
        null=True,
        blank=True,
        verbose_name="경로 좌표 리스트",
        help_text="[[lon, lat], [lon, lat], ...] 형태의 좌표 배열",
    )

    # 타임스탬프
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일시")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일시")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="삭제일시")

    class Meta:
        db_table = "route_segment"
        verbose_name = "경로 세부 구간"
        verbose_name_plural = "경로 세부 구간 목록"
        ordering = ["route_leg", "segment_index"]
        unique_together = ["route_leg", "segment_index"]

    def __str__(self):
        return f"Segment #{self.id}: {self.mode} ({self.start_name} → {self.end_name})"


class SearchItineraryHistory(models.Model):
    """
    경로 검색 기록

    사용자의 경로 검색 이력 저장
    """

    # 사용자 참조
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="itinerary_histories",
        verbose_name="사용자",
    )

    # 경로 탐색 결과 참조
    route_itinerary = models.ForeignKey(
        RouteItinerary,
        on_delete=models.CASCADE,
        related_name="search_histories",
        verbose_name="경로 탐색 결과",
    )

    # 출발지/도착지 정보 (표시용)
    departure_name = models.CharField(
        max_length=255, blank=True, default="", verbose_name="출발지명"
    )
    arrival_name = models.CharField(
        max_length=255, blank=True, default="", verbose_name="도착지명"
    )

    # 타임스탬프
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="생성일시")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="수정일시")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="삭제일시")

    class Meta:
        db_table = "search_itinerary_history"
        verbose_name = "경로 검색 기록"
        verbose_name_plural = "경로 검색 기록 목록"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Search #{self.id}: {self.departure_name} -> {self.arrival_name}"
