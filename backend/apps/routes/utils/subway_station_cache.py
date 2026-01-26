"""
서울시 지하철 역 외부코드 조회 서비스

역할:
- 역명 → 외부코드 조회 (DB 기반)
- 외부코드 비교로 상행/하행 판단

데이터 출처:
- SubwayStation 모델 (서울교통공사_역명_지하철역_검색.csv에서 임포트)

외부코드 규칙:
- 외부코드는 역 순서를 나타냄 (작을수록 기점에 가까움)
- 일반 노선: 외부코드 감소 = 하행, 증가 = 상행
- 2호선 순환선: 외부코드 감소 = 외선(시계방향), 증가 = 내선(반시계방향)

Note:
- 기존 메모리 캐시(CSV) 방식에서 DB 조회 방식으로 변경됨
- 인터페이스는 동일하게 유지 (하위 호환성)
"""

import logging

from apps.routes.models import SubwayStation

logger = logging.getLogger(__name__)


class SubwayStationService:
    """지하철 역 외부코드 조회 서비스 (DB 기반)"""

    @staticmethod
    def get_external_code(station_name: str, line: str) -> int | None:
        """
        역명과 호선으로 외부코드 조회

        Args:
            station_name: 역명 (예: "신논현", "신논현역")
            line: 호선 (예: "9", "9호선", "1009")

        Returns:
            외부코드 (숫자) 또는 None
        """
        try:
            return SubwayStation.get_external_code(station_name, line)
        except Exception as e:
            logger.error(f"지하철 역 외부코드 조회 실패: {e}")
            return None

    @staticmethod
    def get_direction(start_station: str, end_station: str, line: str) -> str | None:
        """
        출발역/도착역으로 상행/하행 판단 (기본 버전)

        Args:
            start_station: 출발역명
            end_station: 도착역명
            line: 호선

        Returns:
            방향 ("상행", "하행", "내선", "외선") 또는 None
        """
        try:
            return SubwayStation.get_direction(start_station, end_station, line)
        except Exception as e:
            logger.error(f"지하철 방향 판단 실패: {e}")
            return None

    @staticmethod
    def get_direction_from_pass_stops(pass_stops: list[str], line: str) -> str | None:
        """
        경유역 목록(pass_stops)을 기반으로 실제 이동 방향 판단

        TMAP이 제공한 경로의 실제 방향을 판단합니다.
        2호선 순환선 등에서 더 정확한 방향 판단이 가능합니다.

        Args:
            pass_stops: 경유역 목록 (예: ["시청", "을지로입구", "을지로3가", ...])
            line: 호선

        Returns:
            방향 ("상행", "하행", "내선", "외선") 또는 None
        """
        try:
            return SubwayStation.get_direction_from_pass_stops(pass_stops, line)
        except Exception as e:
            logger.error(f"지하철 방향 판단 실패 (pass_stops): {e}")
            return None


# 하위 호환성을 위한 싱글톤 인스턴스
# 기존 코드에서 subway_station_cache.get_direction() 형태로 사용 가능
subway_station_cache = SubwayStationService()
