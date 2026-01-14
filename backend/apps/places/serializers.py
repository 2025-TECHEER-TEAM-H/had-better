from rest_framework import serializers
from .models import PoiPlace, SavedPlace, SearchPlaceHistory


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


# =============================================
# 즐겨찾기 (Saved Places) 시리얼라이저
# =============================================

class PoiPlaceNestedSerializer(serializers.ModelSerializer):
    """즐겨찾기 목록에서 POI 정보 표시용"""

    poi_place_id = serializers.IntegerField(source='id', read_only=True)

    class Meta:
        model = PoiPlace
        fields = ['poi_place_id', 'name', 'address', 'coordinates']


class SavedPlaceListSerializer(serializers.ModelSerializer):
    """즐겨찾기 목록 조회용 시리얼라이저"""

    saved_place_id = serializers.IntegerField(source='id', read_only=True)
    poi_place = PoiPlaceNestedSerializer(read_only=True)

    class Meta:
        model = SavedPlace
        fields = ['saved_place_id', 'category', 'poi_place', 'created_at']


class SavedPlaceCreateSerializer(serializers.Serializer):
    """즐겨찾기 추가 요청용 시리얼라이저"""

    poi_place_id = serializers.IntegerField(
        required=True,
        help_text='POI 장소 ID'
    )
    category = serializers.ChoiceField(
        choices=['home', 'work', 'school'],
        required=False,
        allow_null=True,
        help_text='카테고리 (home, work, school) - 없으면 일반 즐겨찾기'
    )


class SavedPlaceUpdateSerializer(serializers.Serializer):
    """즐겨찾기 수정 요청용 시리얼라이저"""

    category = serializers.ChoiceField(
        choices=['home', 'work', 'school', None],
        required=False,
        allow_null=True,
        help_text='카테고리 (home, work, school, null)'
    )


class SavedPlaceResponseSerializer(serializers.ModelSerializer):
    """즐겨찾기 생성/수정 응답용 시리얼라이저"""

    saved_place_id = serializers.IntegerField(source='id', read_only=True)
    poi_place_id = serializers.IntegerField(source='poi_place.id', read_only=True)
    name = serializers.CharField(source='poi_place.name', read_only=True)

    class Meta:
        model = SavedPlace
        fields = ['saved_place_id', 'poi_place_id', 'category', 'name', 'created_at', 'updated_at', 'deleted_at']


class SavedPlaceDeleteResponseSerializer(serializers.Serializer):
    """즐겨찾기 삭제 응답용 시리얼라이저"""

    saved_place_id = serializers.IntegerField()
    deleted_at = serializers.DateTimeField()
