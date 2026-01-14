from django.conf import settings
from django.db import models


class PoiPlace(models.Model):
    """TMap API에서 캐시된 POI 장소"""

    tmap_poi_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    category = models.CharField(max_length=100, blank=True)

    # 좌표 (lon, lat) - JSONField로 저장
    coordinates = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'poi_place'
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.name} ({self.address})"


class SearchPlaceHistory(models.Model):
    """사용자의 장소 검색 기록"""

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='search_place_histories')
    keyword = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'search_place_history'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.name} - {self.keyword}"
