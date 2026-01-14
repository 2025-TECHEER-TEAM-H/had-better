from rest_framework import serializers
from .models import PoiPlace, SearchPlaceHistory


class PoiPlaceSerializer(serializers.ModelSerializer):
    """POI 장소 시리얼라이저"""

    poi_place_id = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = PoiPlace
        fields = ['poi_place_id', 'tmap_poi_id', 'name', 'address', 'category', 'coordinates']


class PoiPlaceDetailSerializer(serializers.ModelSerializer):
    """POI 장소 상세 조회 시리얼라이저"""

    poi_place_id = serializers.IntegerField(source='id', read_only=True)
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = PoiPlace
        fields = ['poi_place_id', 'tmap_poi_id', 'name', 'address', 'category', 'coordinates', 'is_saved']

    def get_is_saved(self, obj):
        """해당 사용자가 이 장소를 즐겨찾기했는지 확인"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False

        try:
            from .models import SavedPlace
            return SavedPlace.objects.filter(user=request.user, poi_place=obj, deleted_at__isnull=True).exists()
        except (ImportError, AttributeError):  # SavedPlace 미구현 또는 필터링 오류
            return False


class SearchPlaceHistorySerializer(serializers.ModelSerializer):
    """장소 검색 기록 시리얼라이저"""

    class Meta:
        model = SearchPlaceHistory
        fields = ['id', 'keyword', 'created_at']
