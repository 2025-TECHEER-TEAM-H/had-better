"""
경로 검색 관련 Serializer
"""

from rest_framework import serializers

from .models import RouteItinerary, RouteLeg, RouteSegment, SearchItineraryHistory


class RouteSearchRequestSerializer(serializers.Serializer):
    """
    경로 검색 요청 Serializer

    Request:
    {
        "startX": "127.02479803562213",
        "startY": "37.504585233865086",
        "endX": "127.03747630119366",
        "endY": "37.479103923078995",
        "count": 10,
        "lang": 0,
        "format": "json"
    }
    """

    startX = serializers.CharField(help_text='출발지 경도 (lon)')
    startY = serializers.CharField(help_text='출발지 위도 (lat)')
    endX = serializers.CharField(help_text='도착지 경도 (lon)')
    endY = serializers.CharField(help_text='도착지 위도 (lat)')
    count = serializers.IntegerField(
        default=10,
        min_value=1,
        max_value=20,
        help_text='경로 개수 (기본값: 10)'
    )
    lang = serializers.IntegerField(
        default=0,
        help_text='언어 (0: 한국어, 1: 영어)'
    )
    format = serializers.CharField(
        default='json',
        help_text='응답 형식 (기본값: "json")'
    )

    # 출발지/도착지 이름 (검색 기록용) - 필수 필드
    departure_name = serializers.CharField(
        required=True,
        help_text='출발지명 (검색 기록용, 건물명 또는 도로명 주소)'
    )
    arrival_name = serializers.CharField(
        required=True,
        help_text='도착지명 (검색 기록용, 건물명 또는 도로명 주소)'
    )


class RouteSegmentSerializer(serializers.ModelSerializer):
    """
    경로 세부 구간 Serializer

    Mapbox에서 사용할 수 있는 형태로 세그먼트 정보 반환
    """

    segment_id = serializers.IntegerField(source='id')
    sectionTime = serializers.IntegerField(source='section_time')
    start = serializers.SerializerMethodField()
    end = serializers.SerializerMethodField()
    routeName = serializers.CharField(source='route_name')
    routeColor = serializers.CharField(source='route_color')
    pathCoordinates = serializers.JSONField(source='path_coordinates')
    geojson = serializers.SerializerMethodField()

    class Meta:
        model = RouteSegment
        fields = [
            'segment_id',
            'segment_index',
            'mode',
            'sectionTime',
            'distance',
            'start',
            'end',
            'routeName',
            'routeColor',
            'pathCoordinates',
            'geojson',
        ]

    def get_start(self, obj):
        return {
            'name': obj.start_name,
            'lat': obj.start_lat,
            'lon': obj.start_lon,
        }

    def get_end(self, obj):
        return {
            'name': obj.end_name,
            'lat': obj.end_lat,
            'lon': obj.end_lon,
        }

    def get_geojson(self, obj):
        """좌표 배열을 GeoJSON으로 변환"""
        if obj.path_coordinates:
            return {
                'type': 'LineString',
                'coordinates': obj.path_coordinates,
            }
        return None


class RouteLegSummarySerializer(serializers.ModelSerializer):
    """
    개별 경로(Leg) 요약 Serializer

    경로 검색 결과에서 각 경로 옵션의 요약 정보
    """

    route_leg_id = serializers.IntegerField(source='id')
    pathType = serializers.IntegerField(source='path_type')
    totalTime = serializers.IntegerField(source='total_time')
    totalDistance = serializers.IntegerField(source='total_distance')
    totalWalkTime = serializers.IntegerField(source='total_walk_time')
    totalWalkDistance = serializers.IntegerField(source='total_walk_distance')
    transferCount = serializers.IntegerField(source='transfer_count')
    fare = serializers.SerializerMethodField()

    class Meta:
        model = RouteLeg
        fields = [
            'route_leg_id',
            'pathType',
            'totalTime',
            'totalDistance',
            'totalWalkTime',
            'totalWalkDistance',
            'transferCount',
            'fare'
        ]

    def get_fare(self, obj):
        """
        요금 정보 추출
        raw_data에서 fare 정보 추출
        """
        raw_data = obj.raw_data or {}
        fare_info = raw_data.get('fare', {})

        if not fare_info:
            return {
                'regular': {
                    'totalFare': obj.total_fare,
                    'currency': {
                        'symbol': '￦',
                        'currency': '원',
                        'currencyCode': 'KRW'
                    }
                }
            }

        return fare_info


class RouteLegDetailSerializer(serializers.ModelSerializer):
    """
    개별 경로(Leg) 상세 Serializer

    경로의 상세 정보 (구간별 이동수단, 정류장 목록 등)
    raw_data에서 TMAP 원본 응답의 legs 정보를 직접 반환
    """

    route_leg_id = serializers.IntegerField(source='id')
    route_itinerary_id = serializers.IntegerField(source='route_itinerary.id')
    pathType = serializers.IntegerField(source='path_type')
    totalTime = serializers.IntegerField(source='total_time')
    totalDistance = serializers.IntegerField(source='total_distance')
    totalWalkTime = serializers.IntegerField(source='total_walk_time')
    totalWalkDistance = serializers.IntegerField(source='total_walk_distance')
    transferCount = serializers.IntegerField(source='transfer_count')
    fare = serializers.SerializerMethodField()
    legs = serializers.SerializerMethodField()

    class Meta:
        model = RouteLeg
        fields = [
            'route_leg_id',
            'route_itinerary_id',
            'pathType',
            'totalTime',
            'totalDistance',
            'totalWalkTime',
            'totalWalkDistance',
            'transferCount',
            'fare',
            'legs',
        ]

    def get_fare(self, obj):
        """요금 정보 추출"""
        raw_data = obj.raw_data or {}
        fare_info = raw_data.get('fare', {})

        if not fare_info:
            return {
                'regular': {
                    'totalFare': obj.total_fare,
                    'currency': {
                        'symbol': '￦',
                        'currency': '원',
                        'currencyCode': 'KRW'
                    }
                }
            }

        return fare_info

    def get_legs(self, obj):
        """
        raw_data에서 TMAP 원본 legs 정보 반환

        API 명세서에 맞게 다음 정보 포함:
        - mode: 이동수단 (WALK, BUS, SUBWAY 등)
        - sectionTime: 구간별 소요시간 (초)
        - distance: 구간별 이동거리 (m)
        - start/end: 출발/도착 정보
        - route: 노선 명칭 (대중교통)
        - routeId: 노선 ID
        - routeColor: 노선 색상
        - type: 이동수단별 노선코드
        - service: 운행 여부
        - passStopList: 정류장 목록 (BUS, SUBWAY)
        - passShape: 구간 좌표
        - steps: 도보 상세 정보 (WALK)
        - Lane: 다중 노선 정보 (버스)
        """
        raw_data = obj.raw_data or {}
        return raw_data.get('legs', [])


class RouteSearchResponseSerializer(serializers.Serializer):
    """
    경로 검색 응답 Serializer

    Response:
    {
        "search_itinerary_history_id": 1,
        "route_itinerary_id": 1,
        "requestParameters": { ... },
        "legs": [ ... ],
        "created_at": "2026-01-12T10:00:00+09:00"
    }
    """

    search_itinerary_history_id = serializers.IntegerField()
    route_itinerary_id = serializers.IntegerField()
    requestParameters = serializers.DictField()
    legs = RouteLegSummarySerializer(many=True)
    created_at = serializers.DateTimeField()


class SearchItineraryHistorySerializer(serializers.ModelSerializer):
    """
    경로 검색 기록 Serializer

    사용자 경로 검색 기록 목록 조회용
    """

    departure = serializers.SerializerMethodField()
    arrival = serializers.SerializerMethodField()

    class Meta:
        model = SearchItineraryHistory
        fields = ['id', 'departure', 'arrival', 'created_at']

    def get_departure(self, obj):
        return {'name': obj.departure_name}

    def get_arrival(self, obj):
        return {'name': obj.arrival_name}


class SearchItineraryHistoryDetailSerializer(serializers.ModelSerializer):
    """
    경로 검색 결과 상세 조회 Serializer
    """

    search_itinerary_history_id = serializers.IntegerField(source='id')
    route_itinerary_id = serializers.IntegerField(source='route_itinerary.id')
    departure = serializers.SerializerMethodField()
    arrival = serializers.SerializerMethodField()
    legs = serializers.SerializerMethodField()

    class Meta:
        model = SearchItineraryHistory
        fields = [
            'search_itinerary_history_id',
            'route_itinerary_id',
            'departure',
            'arrival',
            'legs',
            'created_at'
        ]

    def get_departure(self, obj):
        return {'name': obj.departure_name}

    def get_arrival(self, obj):
        return {'name': obj.arrival_name}

    def get_legs(self, obj):
        """연결된 RouteItinerary의 legs 반환"""
        legs = obj.route_itinerary.legs.all()
        return RouteLegSummarySerializer(legs, many=True).data
