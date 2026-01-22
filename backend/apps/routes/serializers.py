"""
경주 관련 Serializer
"""

from django.utils import timezone
from rest_framework import serializers

from .models import Bot, Route


def to_seoul_time(dt):
    """datetime을 서울 시간대로 변환하여 ISO 형식 반환"""
    if dt is None:
        return None
    return timezone.localtime(dt).isoformat()


class RouteCreateSerializer(serializers.Serializer):
    """
    경주 생성 요청 Serializer

    Request:
    {
        "route_itinerary_id": 1,
        "user_leg_id": 1,
        "bot_leg_ids": [2, 3]
    }
    """

    route_itinerary_id = serializers.IntegerField(
        help_text="경로 탐색 결과 묶음 ID"
    )
    user_leg_id = serializers.IntegerField(
        help_text="유저가 선택한 경로 (route_leg) ID"
    )
    bot_leg_ids = serializers.ListField(
        child=serializers.IntegerField(),
        max_length=2,
        help_text="봇에게 배정할 경로 ID 목록 (최대 2개)"
    )


class BotSerializer(serializers.ModelSerializer):
    """봇 정보 Serializer"""

    class Meta:
        model = Bot
        fields = ["id", "name", "type"]


class RouteLegSummarySerializer(serializers.Serializer):
    """경로 요약 정보 Serializer"""

    route_leg_id = serializers.IntegerField(source="id")
    summary = serializers.SerializerMethodField()
    total_time = serializers.IntegerField()

    def get_summary(self, obj):
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
        return path_type_names.get(obj.path_type, "대중교통")


class ParticipantSerializer(serializers.Serializer):
    """참가자 정보 Serializer"""

    route_id = serializers.IntegerField(source="id")
    type = serializers.CharField(source="participant_type")
    user_id = serializers.IntegerField(source="user.id", allow_null=True)
    bot_id = serializers.IntegerField(source="bot.id", allow_null=True)
    bot_type = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    leg = serializers.SerializerMethodField()

    def get_bot_type(self, obj):
        """봇 타입 (색깔) 반환"""
        if obj.participant_type == Route.ParticipantType.BOT and obj.bot:
            return obj.bot.type
        return None

    def get_name(self, obj):
        """참가자 이름 반환"""
        if obj.participant_type == Route.ParticipantType.USER:
            return obj.user.nickname if obj.user else None
        else:
            return obj.bot.name if obj.bot else None

    def get_leg(self, obj):
        """배정된 경로 정보 반환"""
        return {
            "route_leg_id": obj.route_leg.id,
            "summary": self._get_path_type_name(obj.route_leg.path_type),
            "total_time": obj.route_leg.total_time,
        }

    def _get_path_type_name(self, path_type):
        """경로 타입 이름 반환"""
        path_type_names = {
            1: "지하철",
            2: "버스",
            3: "버스+지하철",
            4: "고속버스",
            5: "기차",
            6: "항공",
            7: "해운",
        }
        return path_type_names.get(path_type, "대중교통")


class RouteCreateResponseSerializer(serializers.Serializer):
    """경주 생성 응답 Serializer"""

    route_itinerary_id = serializers.IntegerField()
    participants = ParticipantSerializer(many=True)
    status = serializers.CharField()
    created_at = serializers.SerializerMethodField()

    def get_created_at(self, obj):
        if isinstance(obj, dict):
            return to_seoul_time(obj.get('created_at'))
        return to_seoul_time(getattr(obj, 'created_at', None))


class RouteStatusUpdateSerializer(serializers.Serializer):
    """
    경주 상태 변경 요청 Serializer

    Request:
    {
        "status": "FINISHED"  # 또는 "CANCELED"
    }
    """

    status = serializers.ChoiceField(
        choices=[Route.Status.FINISHED, Route.Status.CANCELED],
        help_text="변경할 상태 (FINISHED 또는 CANCELED)"
    )


class RouteStatusUpdateResponseSerializer(serializers.Serializer):
    """경주 상태 변경 응답 Serializer"""

    route_id = serializers.IntegerField()
    status = serializers.CharField()
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()
    duration = serializers.IntegerField(allow_null=True)

    def get_start_time(self, obj):
        if isinstance(obj, dict):
            return to_seoul_time(obj.get('start_time'))
        return to_seoul_time(getattr(obj, 'start_time', None))

    def get_end_time(self, obj):
        if isinstance(obj, dict):
            return to_seoul_time(obj.get('end_time'))
        return to_seoul_time(getattr(obj, 'end_time', None))
