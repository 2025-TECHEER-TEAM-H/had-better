"""
Redis 클라이언트 (봇 상태 캐시 전용)

역할:
- 봇 상태 저장/조회/삭제
- 5초마다 Celery Task에서 읽기/쓰기
- 보간 로직을 위한 API 호출 시간 관리
"""

import json
from typing import Optional

import redis
from django.conf import settings


class RedisClient:
    """Redis 클라이언트 (싱글톤)"""

    _instance: Optional["RedisClient"] = None

    def __new__(cls) -> "RedisClient":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._client = redis.from_url(settings.REDIS_URL)
        return cls._instance

    @property
    def client(self) -> redis.Redis:
        """Redis 클라이언트 인스턴스 반환"""
        return self._client

    # =========================================================================
    # 봇 상태 캐시
    # =========================================================================

    def _get_bot_state_key(self, route_id: int) -> str:
        """봇 상태 키 생성"""
        return f"bot_state:{route_id}"

    def set_bot_state(self, route_id: int, state: dict, ttl: int = 3600) -> None:
        """
        봇 상태 저장

        Args:
            route_id: 경주 ID (봇의 Route ID)
            state: 봇 상태 딕셔너리
            ttl: Time To Live (기본 1시간)
        """
        key = self._get_bot_state_key(route_id)
        self._client.setex(key, ttl, json.dumps(state, ensure_ascii=False))

    def get_bot_state(self, route_id: int) -> Optional[dict]:
        """
        봇 상태 조회

        Args:
            route_id: 경주 ID

        Returns:
            봇 상태 딕셔너리 또는 None
        """
        key = self._get_bot_state_key(route_id)
        data = self._client.get(key)
        return json.loads(data) if data else None

    def delete_bot_state(self, route_id: int) -> None:
        """
        봇 상태 삭제

        Args:
            route_id: 경주 ID
        """
        key = self._get_bot_state_key(route_id)
        self._client.delete(key)

    def update_bot_state(self, route_id: int, ttl: int = 3600, **kwargs) -> Optional[dict]:
        """
        봇 상태 부분 업데이트

        Args:
            route_id: 경주 ID
            ttl: Time To Live (기본 1시간)
            **kwargs: 업데이트할 필드들

        Returns:
            업데이트된 봇 상태 또는 None
        """
        state = self.get_bot_state(route_id)
        if state:
            state.update(kwargs)
            self.set_bot_state(route_id, state, ttl)
        return state

    def exists_bot_state(self, route_id: int) -> bool:
        """
        봇 상태 존재 여부 확인

        Args:
            route_id: 경주 ID

        Returns:
            존재 여부
        """
        key = self._get_bot_state_key(route_id)
        return bool(self._client.exists(key))

    # =========================================================================
    # API 호출 시간 관리 (보간 로직용)
    # =========================================================================

    def _get_api_call_key(self, route_id: int, api_type: str) -> str:
        """API 호출 시간 키 생성"""
        return f"api_call:{route_id}:{api_type}"

    def set_last_api_call(
        self, route_id: int, api_type: str, data: dict, ttl: int = 60
    ) -> None:
        """
        마지막 API 호출 정보 저장

        Args:
            route_id: 경주 ID
            api_type: API 타입 (subway_arrival, subway_position, bus_arrival, bus_position)
            data: API 응답 데이터 + 호출 시간
            ttl: Time To Live (기본 60초)
        """
        key = self._get_api_call_key(route_id, api_type)
        self._client.setex(key, ttl, json.dumps(data, ensure_ascii=False))

    def get_last_api_call(self, route_id: int, api_type: str) -> Optional[dict]:
        """
        마지막 API 호출 정보 조회

        Args:
            route_id: 경주 ID
            api_type: API 타입

        Returns:
            API 응답 데이터 + 호출 시간 또는 None
        """
        key = self._get_api_call_key(route_id, api_type)
        data = self._client.get(key)
        return json.loads(data) if data else None

    def delete_api_call_cache(self, route_id: int) -> None:
        """
        경주 관련 모든 API 호출 캐시 삭제

        Args:
            route_id: 경주 ID
        """
        pattern = f"api_call:{route_id}:*"
        keys = self._client.keys(pattern)
        if keys:
            self._client.delete(*keys)

    # =========================================================================
    # 공공데이터 ID 캐시 (TMAP → 공공데이터 ID 변환 결과)
    # =========================================================================

    def _get_public_ids_key(self, route_id: int) -> str:
        """공공데이터 ID 캐시 키 생성"""
        return f"public_ids:{route_id}"

    def set_public_ids(self, route_id: int, public_ids: dict, ttl: int = 3600) -> None:
        """
        공공데이터 ID 저장

        경주 시작 시 TMAP ID를 공공데이터 ID로 변환한 결과를 캐싱합니다.

        Args:
            route_id: 경주 ID
            public_ids: 변환된 ID 정보 {
                "legs": [
                    { "mode": "WALK" },
                    {
                        "mode": "BUS",
                        "bus_route_id": "100100303",
                        "bus_route_name": "6625",
                        "start_station": { "stId": "...", "arsId": "...", ... },
                        "end_station": { "stId": "...", "arsId": "...", ... },
                        ...
                    },
                    ...
                ]
            }
            ttl: Time To Live (기본 1시간)
        """
        key = self._get_public_ids_key(route_id)
        self._client.setex(key, ttl, json.dumps(public_ids, ensure_ascii=False))

    def get_public_ids(self, route_id: int) -> Optional[dict]:
        """
        공공데이터 ID 조회

        Args:
            route_id: 경주 ID

        Returns:
            변환된 ID 정보 또는 None
        """
        key = self._get_public_ids_key(route_id)
        data = self._client.get(key)
        return json.loads(data) if data else None

    def delete_public_ids(self, route_id: int) -> None:
        """
        공공데이터 ID 삭제

        Args:
            route_id: 경주 ID
        """
        key = self._get_public_ids_key(route_id)
        self._client.delete(key)

    # =========================================================================
    # 연결 테스트
    # =========================================================================

    def ping(self) -> bool:
        """Redis 연결 테스트"""
        try:
            return self._client.ping()
        except redis.ConnectionError:
            return False


# 싱글톤 인스턴스
redis_client = RedisClient()
