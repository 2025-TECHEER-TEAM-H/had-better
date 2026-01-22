"""
Redis 클라이언트 (봇 상태 캐시 전용)

역할:
- 봇 상태 저장/조회/삭제
- 5초마다 Celery Task에서 읽기/쓰기
- 보간 로직을 위한 API 호출 시간 관리
- 분산 락을 통한 동시성 제어
"""

import json
import logging
import time
import uuid
from contextlib import contextmanager
from typing import Generator, Optional

import redis
from django.conf import settings

logger = logging.getLogger(__name__)


class RedisConnectionError(Exception):
    """Redis 연결 오류 커스텀 예외"""
    pass


class LockAcquisitionError(Exception):
    """락 획득 실패 예외"""
    pass


class RedisClient:
    """Redis 클라이언트 (싱글톤)"""

    _instance: Optional["RedisClient"] = None

    def __new__(cls) -> "RedisClient":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._client = redis.from_url(
                settings.REDIS_URL,
                socket_connect_timeout=5,  # 연결 타임아웃 5초
                socket_timeout=5,  # 작업 타임아웃 5초
                retry_on_timeout=True,  # 타임아웃 시 재시도
            )
        return cls._instance

    @property
    def client(self) -> redis.Redis:
        """Redis 클라이언트 인스턴스 반환"""
        return self._client

    def _safe_execute(self, operation: str, func, *args, **kwargs):
        """
        Redis 작업 안전 실행 래퍼

        Args:
            operation: 작업 이름 (로깅용)
            func: 실행할 함수
            *args, **kwargs: 함수 인자

        Returns:
            함수 실행 결과 또는 None (오류 시)

        Raises:
            RedisConnectionError: 연결 오류 시 (재시도 가능한 오류)
        """
        try:
            return func(*args, **kwargs)
        except redis.ConnectionError as e:
            logger.error(f"Redis 연결 오류 ({operation}): {e}")
            raise RedisConnectionError(f"Redis 연결 실패: {e}") from e
        except redis.TimeoutError as e:
            logger.error(f"Redis 타임아웃 ({operation}): {e}")
            raise RedisConnectionError(f"Redis 타임아웃: {e}") from e
        except redis.RedisError as e:
            logger.error(f"Redis 오류 ({operation}): {e}")
            return None

    # =========================================================================
    # 봇 상태 캐시
    # =========================================================================

    def _get_bot_state_key(self, route_id: int) -> str:
        """봇 상태 키 생성"""
        return f"bot_state:{route_id}"

    def set_bot_state(self, route_id: int, state: dict, ttl: int = 3600) -> bool:
        """
        봇 상태 저장

        Args:
            route_id: 경주 ID (봇의 Route ID)
            state: 봇 상태 딕셔너리
            ttl: Time To Live (기본 1시간)

        Returns:
            저장 성공 여부

        Raises:
            RedisConnectionError: 연결 오류 시
        """
        key = self._get_bot_state_key(route_id)
        result = self._safe_execute(
            f"set_bot_state:{route_id}",
            self._client.setex,
            key, ttl, json.dumps(state, ensure_ascii=False)
        )
        return result is not None

    def get_bot_state(self, route_id: int) -> Optional[dict]:
        """
        봇 상태 조회

        Args:
            route_id: 경주 ID

        Returns:
            봇 상태 딕셔너리 또는 None

        Raises:
            RedisConnectionError: 연결 오류 시
        """
        key = self._get_bot_state_key(route_id)
        data = self._safe_execute(
            f"get_bot_state:{route_id}",
            self._client.get,
            key
        )
        if data is None:
            return None
        try:
            return json.loads(data)
        except (json.JSONDecodeError, TypeError):
            logger.warning(f"봇 상태 JSON 파싱 실패: route_id={route_id}")
            return None

    def delete_bot_state(self, route_id: int) -> bool:
        """
        봇 상태 삭제

        Args:
            route_id: 경주 ID

        Returns:
            삭제 성공 여부
        """
        key = self._get_bot_state_key(route_id)
        try:
            self._client.delete(key)
            return True
        except redis.RedisError as e:
            logger.warning(f"봇 상태 삭제 실패: route_id={route_id}, error={e}")
            return False

    def _get_lock_key(self, route_id: int) -> str:
        """봇 상태 락 키 생성"""
        return f"bot_state_lock:{route_id}"

    @contextmanager
    def bot_state_lock(
        self, route_id: int, timeout: int = 10, blocking_timeout: int = 5
    ) -> Generator[bool, None, None]:
        """
        봇 상태 업데이트를 위한 분산 락

        Args:
            route_id: 경주 ID
            timeout: 락 자동 해제 시간 (초, 기본 10초)
            blocking_timeout: 락 획득 대기 시간 (초, 기본 5초)

        Yields:
            락 획득 성공 여부

        Usage:
            with redis_client.bot_state_lock(route_id) as acquired:
                if acquired:
                    # 안전하게 상태 업데이트
                    state = redis_client.get_bot_state(route_id)
                    state['field'] = 'value'
                    redis_client.set_bot_state(route_id, state)
        """
        lock_key = self._get_lock_key(route_id)
        lock_value = str(uuid.uuid4())
        acquired = False

        try:
            # 락 획득 시도 (SET NX EX)
            end_time = time.time() + blocking_timeout
            while time.time() < end_time:
                result = self._client.set(
                    lock_key, lock_value, nx=True, ex=timeout
                )
                if result:
                    acquired = True
                    break
                time.sleep(0.1)  # 100ms 대기 후 재시도

            yield acquired

        except redis.RedisError as e:
            logger.warning(f"락 획득 중 오류: route_id={route_id}, error={e}")
            yield False

        finally:
            # 락 해제 (본인이 획득한 락만 해제)
            if acquired:
                try:
                    # Lua 스크립트로 원자적 삭제 (본인 락만)
                    lua_script = """
                    if redis.call("get", KEYS[1]) == ARGV[1] then
                        return redis.call("del", KEYS[1])
                    else
                        return 0
                    end
                    """
                    self._client.eval(lua_script, 1, lock_key, lock_value)
                except redis.RedisError as e:
                    logger.warning(f"락 해제 중 오류: route_id={route_id}, error={e}")

    def update_bot_state(self, route_id: int, ttl: int = 3600, **kwargs) -> Optional[dict]:
        """
        봇 상태 부분 업데이트

        Args:
            route_id: 경주 ID
            ttl: Time To Live (기본 1시간)
            **kwargs: 업데이트할 필드들

        Returns:
            업데이트된 봇 상태 또는 None

        Raises:
            RedisConnectionError: 연결 오류 시
        """
        state = self.get_bot_state(route_id)
        if state:
            state.update(kwargs)
            self.set_bot_state(route_id, state, ttl)
        return state

    def update_bot_state_atomic(self, route_id: int, ttl: int = 3600, **kwargs) -> Optional[dict]:
        """
        봇 상태 원자적 업데이트 (분산 락 사용)

        동시성 문제가 우려되는 경우 이 메서드를 사용합니다.

        Args:
            route_id: 경주 ID
            ttl: Time To Live (기본 1시간)
            **kwargs: 업데이트할 필드들

        Returns:
            업데이트된 봇 상태 또는 None (락 획득 실패 시)
        """
        with self.bot_state_lock(route_id) as acquired:
            if not acquired:
                logger.warning(f"봇 상태 락 획득 실패: route_id={route_id}")
                return None

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
            존재 여부 (오류 시 False)
        """
        key = self._get_bot_state_key(route_id)
        try:
            return bool(self._client.exists(key))
        except redis.RedisError as e:
            logger.warning(f"봇 상태 존재 확인 실패: route_id={route_id}, error={e}")
            return False

    # =========================================================================
    # API 호출 시간 관리 (보간 로직용)
    # =========================================================================

    def _get_api_call_key(self, route_id: int, api_type: str) -> str:
        """API 호출 시간 키 생성"""
        return f"api_call:{route_id}:{api_type}"

    def set_last_api_call(
        self, route_id: int, api_type: str, data: dict, ttl: int = 60
    ) -> bool:
        """
        마지막 API 호출 정보 저장

        Args:
            route_id: 경주 ID
            api_type: API 타입 (subway_arrival, subway_position, bus_arrival, bus_position)
            data: API 응답 데이터 + 호출 시간
            ttl: Time To Live (기본 60초)

        Returns:
            저장 성공 여부
        """
        key = self._get_api_call_key(route_id, api_type)
        try:
            self._client.setex(key, ttl, json.dumps(data, ensure_ascii=False))
            return True
        except redis.RedisError as e:
            logger.warning(f"API 호출 캐시 저장 실패: route_id={route_id}, api_type={api_type}, error={e}")
            return False

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
        try:
            data = self._client.get(key)
            if data is None:
                return None
            return json.loads(data)
        except (redis.RedisError, json.JSONDecodeError) as e:
            logger.warning(f"API 호출 캐시 조회 실패: route_id={route_id}, api_type={api_type}, error={e}")
            return None

    def delete_api_call_cache(self, route_id: int) -> bool:
        """
        경주 관련 모든 API 호출 캐시 삭제

        Args:
            route_id: 경주 ID

        Returns:
            삭제 성공 여부
        """
        pattern = f"api_call:{route_id}:*"
        try:
            keys = self._client.keys(pattern)
            if keys:
                self._client.delete(*keys)
            return True
        except redis.RedisError as e:
            logger.warning(f"API 호출 캐시 삭제 실패: route_id={route_id}, error={e}")
            return False

    # =========================================================================
    # 공공데이터 ID 캐시 (TMAP → 공공데이터 ID 변환 결과)
    # =========================================================================

    def _get_public_ids_key(self, route_id: int) -> str:
        """공공데이터 ID 캐시 키 생성"""
        return f"public_ids:{route_id}"

    def set_public_ids(self, route_id: int, public_ids: dict, ttl: int = 3600) -> bool:
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

        Returns:
            저장 성공 여부

        Raises:
            RedisConnectionError: 연결 오류 시
        """
        key = self._get_public_ids_key(route_id)
        result = self._safe_execute(
            f"set_public_ids:{route_id}",
            self._client.setex,
            key, ttl, json.dumps(public_ids, ensure_ascii=False)
        )
        return result is not None

    def get_public_ids(self, route_id: int) -> Optional[dict]:
        """
        공공데이터 ID 조회

        Args:
            route_id: 경주 ID

        Returns:
            변환된 ID 정보 또는 None

        Raises:
            RedisConnectionError: 연결 오류 시
        """
        key = self._get_public_ids_key(route_id)
        data = self._safe_execute(
            f"get_public_ids:{route_id}",
            self._client.get,
            key
        )
        if data is None:
            return None
        try:
            return json.loads(data)
        except (json.JSONDecodeError, TypeError):
            logger.warning(f"공공데이터 ID JSON 파싱 실패: route_id={route_id}")
            return None

    def delete_public_ids(self, route_id: int) -> bool:
        """
        공공데이터 ID 삭제

        Args:
            route_id: 경주 ID

        Returns:
            삭제 성공 여부
        """
        key = self._get_public_ids_key(route_id)
        try:
            self._client.delete(key)
            return True
        except redis.RedisError as e:
            logger.warning(f"공공데이터 ID 삭제 실패: route_id={route_id}, error={e}")
            return False

    # =========================================================================
    # Celery Task ID 관리 (즉시 취소용)
    # =========================================================================

    def _get_task_id_key(self, route_id: int) -> str:
        """Celery Task ID 키 생성"""
        return f"celery_task:{route_id}"

    def set_task_id(self, route_id: int, task_id: str, ttl: int = 3600) -> bool:
        """
        Celery Task ID 저장

        Args:
            route_id: 경주 ID
            task_id: Celery Task ID
            ttl: Time To Live (기본 1시간)

        Returns:
            저장 성공 여부
        """
        key = self._get_task_id_key(route_id)
        try:
            self._client.setex(key, ttl, task_id)
            return True
        except redis.RedisError as e:
            logger.warning(f"Task ID 저장 실패: route_id={route_id}, error={e}")
            return False

    def get_task_id(self, route_id: int) -> Optional[str]:
        """
        Celery Task ID 조회

        Args:
            route_id: 경주 ID

        Returns:
            Task ID 또는 None
        """
        key = self._get_task_id_key(route_id)
        try:
            task_id = self._client.get(key)
            if task_id:
                return task_id.decode() if isinstance(task_id, bytes) else task_id
            return None
        except redis.RedisError as e:
            logger.warning(f"Task ID 조회 실패: route_id={route_id}, error={e}")
            return None

    def delete_task_id(self, route_id: int) -> bool:
        """
        Celery Task ID 삭제

        Args:
            route_id: 경주 ID

        Returns:
            삭제 성공 여부
        """
        key = self._get_task_id_key(route_id)
        try:
            self._client.delete(key)
            return True
        except redis.RedisError as e:
            logger.warning(f"Task ID 삭제 실패: route_id={route_id}, error={e}")
            return False

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
