import math

from django.utils import timezone
from rest_framework import serializers

from .models import PoiPlace, SavedPlace, SearchPlaceHistory


def to_seoul_time(dt):
    """datetime을 서울 시간대로 변환하여 ISO 형식 반환"""
    if dt is None:
        return None
    return timezone.localtime(dt).isoformat()


def calculate_distance(lat1, lon1, lat2, lon2):
    """
    Haversine 공식을 사용하여 두 지점 간 거리를 미터 단위로 계산

    Args:
        lat1, lon1: 첫 번째 지점의 위도, 경도
        lat2, lon2: 두 번째 지점의 위도, 경도

    Returns:
        float: 거리 (미터)
    """
    # 지구의 반지름 (미터)
    R = 6371000

    # 위도/경도를 라디안으로 변환
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    # Haversine 공식
    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c

    return round(distance, 2)  # 소수점 2자리까지


class PoiPlaceSerializer(serializers.ModelSerializer):
    """POI 장소 시리얼라이저"""

    poi_place_id = serializers.IntegerField(source="id", read_only=True)

    class Meta:
        model = PoiPlace
        fields = [
            "poi_place_id",
            "tmap_poi_id",
            "name",
            "address",
            "category",
            "coordinates",
        ]


class PoiPlaceDetailSerializer(serializers.ModelSerializer):
    """POI 장소 상세 조회 시리얼라이저"""

    poi_place_id = serializers.IntegerField(source="id", read_only=True)
    is_saved = serializers.SerializerMethodField()
    distance_meters = serializers.SerializerMethodField()

    class Meta:
        model = PoiPlace
        fields = [
            "poi_place_id",
            "tmap_poi_id",
            "name",
            "address",
            "category",
            "coordinates",
            "is_saved",
            "distance_meters",
        ]

    def get_is_saved(self, obj):
        """해당 사용자가 이 장소를 즐겨찾기했는지 확인"""
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False

        try:
            from .models import SavedPlace

            return SavedPlace.objects.filter(
                user=request.user, poi_place=obj, deleted_at__isnull=True
            ).exists()
        except (ImportError, AttributeError):  # SavedPlace 미구현 또는 필터링 오류
            return False

    def get_distance_meters(self, obj):
        """현재 위치에서 해당 장소까지의 거리 계산 (미터)"""
        # context에서 현재 위치 정보 가져오기
        current_lat = self.context.get("current_lat")
        current_lon = self.context.get("current_lon")

        # 현재 위치가 제공되지 않았으면 None 반환
        if current_lat is None or current_lon is None:
            return None

        # 장소의 좌표
        place_lat = obj.coordinates.get("lat")
        place_lon = obj.coordinates.get("lon")

        # 좌표가 없으면 None 반환
        if place_lat is None or place_lon is None:
            return None

        try:
            # Haversine 공식으로 거리 계산
            distance = calculate_distance(
                float(current_lat),
                float(current_lon),
                float(place_lat),
                float(place_lon),
            )
            return distance
        except (ValueError, TypeError):
            return None


class SearchPlaceHistorySerializer(serializers.ModelSerializer):
    """장소 검색 기록 시리얼라이저"""

    created_at = serializers.SerializerMethodField()

    class Meta:
        model = SearchPlaceHistory
        fields = ["id", "keyword", "created_at"]

    def get_created_at(self, obj):
        return to_seoul_time(obj.created_at)


# =============================================
# 즐겨찾기 (Saved Places) 시리얼라이저
# =============================================


class PoiPlaceNestedSerializer(serializers.ModelSerializer):
    """즐겨찾기 목록에서 POI 정보 표시용"""

    poi_place_id = serializers.IntegerField(source="id", read_only=True)

    class Meta:
        model = PoiPlace
        fields = ["poi_place_id", "name", "address", "coordinates"]


class SavedPlaceListSerializer(serializers.ModelSerializer):
    """즐겨찾기 목록 조회용 시리얼라이저"""

    saved_place_id = serializers.IntegerField(source="id", read_only=True)
    poi_place = PoiPlaceNestedSerializer(read_only=True)
    created_at = serializers.SerializerMethodField()

    class Meta:
        model = SavedPlace
        fields = ["saved_place_id", "category", "poi_place", "created_at"]

    def get_created_at(self, obj):
        return to_seoul_time(obj.created_at)


class SavedPlaceCreateSerializer(serializers.Serializer):
    """즐겨찾기 추가 요청용 시리얼라이저"""

    poi_place_id = serializers.IntegerField(required=True, help_text="POI 장소 ID")
    category = serializers.ChoiceField(
        choices=["home", "work", "school"],
        required=False,
        allow_null=True,
        help_text="카테고리 (home, work, school) - 없으면 일반 즐겨찾기",
    )


class SavedPlaceUpdateSerializer(serializers.Serializer):
    """즐겨찾기 수정 요청용 시리얼라이저"""

    category = serializers.ChoiceField(
        choices=["home", "work", "school", None],
        required=False,
        allow_null=True,
        help_text="카테고리 (home, work, school, null)",
    )


class SavedPlaceResponseSerializer(serializers.ModelSerializer):
    """즐겨찾기 생성/수정 응답용 시리얼라이저"""

    saved_place_id = serializers.IntegerField(source="id", read_only=True)
    poi_place_id = serializers.IntegerField(source="poi_place.id", read_only=True)
    name = serializers.CharField(source="poi_place.name", read_only=True)
    created_at = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()
    deleted_at = serializers.SerializerMethodField()

    class Meta:
        model = SavedPlace
        fields = [
            "saved_place_id",
            "poi_place_id",
            "category",
            "name",
            "created_at",
            "updated_at",
            "deleted_at",
        ]

    def get_created_at(self, obj):
        return to_seoul_time(obj.created_at)

    def get_updated_at(self, obj):
        return to_seoul_time(obj.updated_at)

    def get_deleted_at(self, obj):
        return to_seoul_time(obj.deleted_at)


class SavedPlaceDeleteResponseSerializer(serializers.Serializer):
    """즐겨찾기 삭제 응답용 시리얼라이저"""

    saved_place_id = serializers.IntegerField()
    deleted_at = serializers.SerializerMethodField()

    def get_deleted_at(self, obj):
        if isinstance(obj, dict):
            return to_seoul_time(obj.get("deleted_at"))
        return to_seoul_time(getattr(obj, "deleted_at", None))
