"""
TMAP 대중교통 API 서비스
"""

import logging
from typing import Any

from django.conf import settings

import requests

logger = logging.getLogger(__name__)


class TmapTransitService:
    """TMAP 대중교통 경로 탐색 API 서비스"""

    BASE_URL = "https://apis.openapi.sk.com/transit/routes"

    def __init__(self):
        self.api_key = settings.TMAP_API_KEY
        if not self.api_key:
            raise ValueError("TMAP_API_KEY가 설정되지 않았습니다.")

    def search_routes(
        self,
        start_x: str,
        start_y: str,
        end_x: str,
        end_y: str,
        count: int = 10,
        lang: int = 0,
        format: str = "json",
    ) -> dict[str, Any]:
        """
        대중교통 경로 탐색

        Args:
            start_x: 출발지 경도 (lon)
            start_y: 출발지 위도 (lat)
            end_x: 도착지 경도 (lon)
            end_y: 도착지 위도 (lat)
            count: 경로 개수 (기본값: 10)
            lang: 언어 (0: 한국어, 1: 영어)
            format: 응답 형식 (기본값: json)

        Returns:
            TMAP API 응답 데이터
        """
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "appKey": self.api_key,
        }

        payload = {
            "startX": start_x,
            "startY": start_y,
            "endX": end_x,
            "endY": end_y,
            "count": count,
            "lang": lang,
            "format": format,
        }

        try:
            response = requests.post(
                self.BASE_URL,
                headers=headers,
                json=payload,
                timeout=30,
            )
            response.raise_for_status()
            data = response.json()

            logger.info(f"TMAP 경로 탐색 성공: {start_y},{start_x} -> {end_y},{end_x}")
            return data

        except requests.exceptions.Timeout:
            logger.error("TMAP API 요청 타임아웃")
            raise TmapAPIError("TMAP API 요청 시간이 초과되었습니다.")

        except requests.exceptions.HTTPError as e:
            logger.error(f"TMAP API HTTP 오류: {e}")
            raise TmapAPIError(f"TMAP API 오류: {e}")

        except requests.exceptions.RequestException as e:
            logger.error(f"TMAP API 요청 실패: {e}")
            raise TmapAPIError(f"TMAP API 요청 실패: {e}")

        except ValueError as e:
            logger.error(f"TMAP API 응답 파싱 실패: {e}")
            raise TmapAPIError("TMAP API 응답을 파싱할 수 없습니다.")


class TmapAPIError(Exception):
    """TMAP API 오류"""

    pass
