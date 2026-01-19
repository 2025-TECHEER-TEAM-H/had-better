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

상행/하행 구분:
- 외부코드 기반 판단 (subway_station_cache 사용)
  - 외부코드 감소 = 하행 (또는 2호선 외선)
  - 외부코드 증가 = 상행 (또는 2호선 내선)
- updnLine 필드로 열차 필터링: "상행"/"하행" 또는 "내선"/"외선"(2호선)
"""

import logging
from typing import Optional

import requests
from django.conf import settings

from .subway_station_cache import subway_station_cache

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

    @staticmethod
    def _normalize_station_name(name: str) -> str:
        """
        역명 정규화 ("홍대입구역" → "홍대입구")
        """
        if not name:
            return ""
        if name.endswith("역"):
            return name[:-1]
        return name

    @staticmethod
    def _extract_destination_from_train_line_nm(train_line_nm: str) -> str:
        """
        trainLineNm에서 종착역 추출

        예시:
        - "개화행 - 삼성방면" → "개화"
        - "성수행 - 합정방면" → "성수"
        - "중앙보훈병원행 - 언주방면" → "중앙보훈병원"
        """
        if not train_line_nm:
            return ""
        # "행" 앞부분이 종착역
        if "행" in train_line_nm:
            return train_line_nm.split("행")[0].strip()
        return ""

    def filter_by_direction(
        self,
        arrivals: list[dict],
        subway_line_id: str,
        destination_station: str,
        pass_stops: list[str] = None,
    ) -> Optional[dict]:
        """
        방향으로 열차 필터링 (외부코드 기반)

        외부코드를 사용해 상행/하행을 판단하고 updnLine으로 필터링합니다.
        - 외부코드 감소 = 하행 (또는 2호선 외선)
        - 외부코드 증가 = 상행 (또는 2호선 내선)

        Args:
            arrivals: 도착 열차 목록
            subway_line_id: 호선 ID (예: "1002")
            destination_station: 하차역명
            pass_stops: 경유역 목록 (예: ["신논현", "고속터미널", ..., "여의도"])

        Returns:
            해당 방향 첫 번째 열차 또는 None
        """
        if not pass_stops or len(pass_stops) < 2:
            logger.warning("pass_stops가 없거나 부족합니다")
            return None

        # 출발역/도착역
        start_station = pass_stops[0]
        end_station = pass_stops[-1]

        # 외부코드 기반 방향 판단
        target_direction = subway_station_cache.get_direction(
            start_station, end_station, subway_line_id
        )

        if target_direction:
            logger.info(
                f"외부코드 기반 방향 판단: {start_station} → {end_station} = {target_direction}"
            )

            # updnLine으로 필터링
            for arrival in arrivals:
                if arrival.get("subwayId") != subway_line_id:
                    continue

                updn_line = arrival.get("updnLine", "")
                if updn_line == target_direction:
                    logger.info(
                        f"방향 매칭 성공 (외부코드): updnLine={updn_line}, "
                        f"trainLineNm={arrival.get('trainLineNm')}"
                    )
                    return arrival

            logger.warning(
                f"외부코드 방향({target_direction})에 맞는 열차 없음, "
                f"trainLineNm 기반 fallback 시도"
            )

        # Fallback: 기존 trainLineNm 기반 매칭
        return self._filter_by_train_line_nm(
            arrivals, subway_line_id, destination_station, pass_stops
        )

    def _filter_by_train_line_nm(
        self,
        arrivals: list[dict],
        subway_line_id: str,
        destination_station: str,
        pass_stops: list[str],
    ) -> Optional[dict]:
        """
        trainLineNm 기반 방향 필터링 (fallback)

        다음 순서로 방향을 판단합니다:
        1. pass_stops(경유역)가 trainLineNm에 포함되면 맞는 방향
        2. 목적지가 trainLineNm에 포함되면 맞는 방향
        3. 종착역(bstatnNm)이 pass_stops에 있으면 맞는 방향
        """
        # 경유역 정규화 (역 suffix 제거)
        normalized_stops = [self._normalize_station_name(s) for s in pass_stops]
        dest_normalized = self._normalize_station_name(destination_station)

        # 다음 정차역들만 추출 (승차역 제외)
        next_stops = normalized_stops[1:] if len(normalized_stops) > 1 else []

        for arrival in arrivals:
            # 같은 호선인지 확인
            if arrival.get("subwayId") != subway_line_id:
                continue

            train_line_nm = arrival.get("trainLineNm", "")
            bstatn_nm = arrival.get("bstatnNm", "")
            bstatn_normalized = self._normalize_station_name(bstatn_nm)

            # 1. 다음 정차역들 중 하나라도 trainLineNm에 포함되면 맞는 방향
            for stop in next_stops:
                if stop and stop in train_line_nm:
                    logger.info(
                        f"방향 매칭 성공 (경유역): stop={stop} in trainLineNm={train_line_nm}"
                    )
                    return arrival

            # 2. 목적지가 trainLineNm에 포함되어 있는지 확인
            if dest_normalized and dest_normalized in train_line_nm:
                logger.info(
                    f"방향 매칭 성공 (목적지): dest={dest_normalized} in trainLineNm={train_line_nm}"
                )
                return arrival

            # 3. 종착역이 경유역 목록에 있는지 확인
            if bstatn_normalized and bstatn_normalized in normalized_stops:
                logger.info(
                    f"방향 매칭 성공 (종착역): bstatnNm={bstatn_nm} in pass_stops"
                )
                return arrival

        # 매칭 실패 → None 반환 (bot_simulation에서 시간 기반 fallback 사용)
        logger.warning(
            f"지하철 방향 매칭 실패: dest={destination_station}, "
            f"line_id={subway_line_id}, pass_stops={pass_stops[:3]}..."
        )
        return None


# 싱글톤 인스턴스
subway_api_client = SeoulSubwayAPIClient()
