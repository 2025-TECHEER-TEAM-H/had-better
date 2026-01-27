from django.conf import settings
from django.db import models


class PoiPlace(models.Model):
    """TMap API에서 캐시된 POI 장소"""

    # tmap_pkey: TMap API의 고유 식별자 (서울대학교, 정문, 후문 등 각각 구분)
    tmap_pkey = models.CharField(max_length=100, unique=True)
    # tmap_poi_id: TMap API의 POI ID (같은 장소의 정문/후문 등이 같은 ID를 공유)
    tmap_poi_id = models.CharField(max_length=100, db_index=True)
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True)

    # 좌표 (lon, lat) - JSONField로 저장
    coordinates = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "poi_place"
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.name} ({self.address})"


class SearchPlaceHistory(models.Model):
    """사용자의 장소 검색 기록"""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="search_place_histories",
    )
    keyword = models.CharField(max_length=255)

    # 타임스탬프
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "search_place_history"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.name} - {self.keyword}"


class SavedPlace(models.Model):
    """사용자의 즐겨찾기 장소 (Soft Delete 방식)"""

    CATEGORY_CHOICES = [
        ("home", "집"),
        ("work", "회사"),
        ("school", "학교"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_places"
    )
    poi_place = models.ForeignKey(
        PoiPlace, on_delete=models.CASCADE, related_name="saved_by_users"
    )
    category = models.CharField(
        max_length=10,
        choices=CATEGORY_CHOICES,
        null=True,
        blank=True,
        help_text="집(home), 회사(work), 학교(school) 또는 일반 즐겨찾기(null)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(
        null=True, blank=True, help_text="Soft Delete 타임스탬프"
    )

    class Meta:
        db_table = "saved_place"
        ordering = ["-created_at"]
        constraints = [
            # 같은 사용자가 같은 POI를 중복 저장 방지 (활성 상태만)
            models.UniqueConstraint(
                fields=["user", "poi_place"],
                condition=models.Q(deleted_at__isnull=True),
                name="unique_active_saved_place",
            ),
            # 같은 사용자가 같은 카테고리(home/work/school)를 중복 저장 방지
            models.UniqueConstraint(
                fields=["user", "category"],
                condition=models.Q(deleted_at__isnull=True, category__isnull=False),
                name="unique_active_category_per_user",
            ),
        ]

    def __str__(self):
        category_display = self.get_category_display() if self.category else "일반"
        return f"{self.user.name} - {self.poi_place.name} ({category_display})"
