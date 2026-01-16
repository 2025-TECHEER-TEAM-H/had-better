"""
서울시 지하철 API 클라이언트

역할:
- 실시간 도착정보 조회 (realtimeStationArrival)
- 실시간 열차 위치 조회 (realtimePosition)

API 문서:
- https://data.seoul.go.kr (서울시 지하철 실시간 도착정보)

주의사항:
- 일일 트래픽 제한: 1000회
- recptnDt(수신시간)와 현재시간의 차이만큼 열차가 더 진행한 것으로 보정 필요
"""

import logging
from typing import Optional

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class SeoulSubwayAPIClient:
    """서울시 지하철 API 클라이언트"""

    BASE_URL = "http://swopenAPI.seoul.go.kr/api/subway"

    def __init__(self):
        self.api_key = getattr(settings, "SUBWAY_API_KEY", "")
        self.timeout = 10

    def get_arrival_info(self, station_name: str) -> list[dict]:
        """
        실시간 도착정보 조회

        Args:
            station_name: 역명 (예: "문래")

        Returns:
            도착 열차 목록 [{
                subwayId: 호선 ID (예: "1002"),
                updnLine: 방향 (예: "내선", "외선"),
                trainLineNm: 열차 정보 (예: "성수행 - 당산방면"),
                btrainNo: 열차번호 (예: "2156"),
                barvlDt: 도착예정시간(초),
                arvlMsg2: 도착메시지 (예: "전역 출발"),
                arvlMsg3: 상세메시지 (예: "영등포구청 출발"),
                arvlCd: 도착코드 (0:진입, 1:도착, 2:출발, 3:전역출발, 99:운행중),
                bstatnNm: 종착역,
                lstcarAt: 막차여부 (1:막차, 0:아님),
                recptnDt: 수신시간,
                ...
            }]
        """
        url = f"{self.BASE_URL}/{self.api_key}/json/realtimeStationArrival/0/20/{station_name}"

        try:
            response = requests.get(url, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            # 오류 체크
            if "errorMessage" in data:
                error_info = data["errorMessage"]
                if error_info.get("status") != 200:
                    logger.warning(
                        f"지하철 도착정보 조회 오류: [{error_info.get('code')}] {error_info.get('message')}"
                    )
                    return []

            if "realtimeArrivalList" in data:
                return data["realtimeArrivalList"]

            return []
        except requests.RequestException as e:
            logger.error(f"지하철 도착정보 API 요청 실패: {e}")
            return []
        except (ValueError, KeyError) as e:
            logger.error(f"지하철 도착정보 응답 파싱 실패: {e}")
            return []

    def get_train_position(self, subway_line: str) -> list[dict]:
        """
        실시간 열차 위치 조회

        Args:
            subway_line: 호선명 (예: "2호선")

        Returns:
            열차 위치 목록 [{
                trainNo: 열차번호 (예: "2156"),
                statnNm: 현재 위치 역명,
                statnId: 역 ID,
                updnLine: 방향 (0:상행/내선, 1:하행/외선),
                trainSttus: 상태 (0:진입, 1:도착, 2:출발, 3:전역출발),
                statnTnm: 종착역,
                directAt: 급행여부 (1:급행, 0:아님, 7:특급),
                lstcarAt: 막차여부,
                recptnDt: 수신시간,
                ...
            }]
        """
        url = f"{self.BASE_URL}/{self.api_key}/json/realtimePosition/0/100/{subway_line}"

        try:
            response = requests.get(url, timeout=self.timeout)
            response.raise_for_status()
            data = response.json()

            # 오류 체크
            if "errorMessage" in data:
                error_info = data["errorMessage"]
                if error_info.get("status") != 200:
                    logger.warning(
                        f"지하철 위치정보 조회 오류: [{error_info.get('code')}] {error_info.get('message')}"
                    )
                    return []

            if "realtimePositionList" in data:
                return data["realtimePositionList"]

            return []
        except requests.RequestException as e:
            logger.error(f"지하철 위치정보 API 요청 실패: {e}")
            return []
        except (ValueError, KeyError) as e:
            logger.error(f"지하철 위치정보 응답 파싱 실패: {e}")
            return []

    def filter_by_train_no(
        self, positions: list[dict], train_no: str
    ) -> Optional[dict]:
        """
        열차번호로 필터링

        Args:
            positions: 열차 위치 목록
            train_no: 열차번호

        Returns:
            해당 열차 정보 또는 None
        """
        for pos in positions:
            if pos.get("trainNo") == train_no:
                return pos
        return None

    def filter_by_direction(
        self,
        arrivals: list[dict],
        subway_line_id: str,
        destination_station: str,
    ) -> Optional[dict]:
        """
        방향으로 열차 필터링

        목적지(하차역) 방향으로 가는 열차 중 가장 빨리 도착하는 열차를 선택합니다.

        Args:
            arrivals: 도착 열차 목록
            subway_line_id: 호선 ID (예: "1002")
            destination_station: 하차역명

        Returns:
            해당 방향 첫 번째 열차 또는 None
        """
        for arrival in arrivals:
            # 같은 호선인지 확인
            if arrival.get("subwayId") != subway_line_id:
                continue

            # trainLineNm에 하차역이 포함되어 있는지 확인
            # 예: "성수행 - 홍대입구방면" → "홍대입구"가 포함됨
            train_line_nm = arrival.get("trainLineNm", "")
            if destination_station in train_line_nm:
                return arrival

            # 종착역이 하차역 방향인지 확인 (순환선 등)
            bstatn_nm = arrival.get("bstatnNm", "")
            if destination_station == bstatn_nm:
                return arrival

        return None


# 싱글톤 인스턴스
subway_api_client = SeoulSubwayAPIClient()
