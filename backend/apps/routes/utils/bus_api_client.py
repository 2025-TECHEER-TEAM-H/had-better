"""
서울시 버스 API 클라이언트

역할:
- 버스 노선 ID 조회 (getBusRouteList) -> API 호출
- 정류소 ID 조회 (getStationByName) -> API 호출
- 버스 도착정보 조회 (getArrInfoByRouteAll) -> API 호출
- 버스 실시간 위치 조회 (getBusPosByVehId) -> API 호출

API 문서:
- https://www.data.go.kr (서울특별시_노선정보조회 서비스, 서울특별시_정류소정보조회 서비스)
"""

import logging
import xml.etree.ElementTree as ET
from typing import Optional
from urllib.parse import unquote

import requests
from django.conf import settings

logger = logging.getLogger(__name__)


class SeoulBusAPIClient:
    """서울시 버스 API 클라이언트"""

    BASE_URL = "http://ws.bus.go.kr/api/rest"

    def __init__(self):
        # API 키가 URL 인코딩되어 있으면 디코딩 (requests가 자동으로 인코딩하므로)
        raw_key = getattr(settings, "BUS_API_KEY", "")
        self.api_key = unquote(raw_key)
        self.timeout = 10

    def _parse_xml_response(self, response_text: str) -> list[dict]:
        """
        XML 응답 파싱

        Args:
            response_text: XML 응답 텍스트

        Returns:
            파싱된 아이템 목록
        """
        try:
            root = ET.fromstring(response_text)
            items = []

            # itemList 태그에서 데이터 추출
            for item in root.findall(".//itemList"):
                item_dict = {}
                for child in item:
                    item_dict[child.tag] = child.text
                items.append(item_dict)

            return items
        except ET.ParseError as e:
            logger.error(f"XML 파싱 오류: {e}")
            return []

    def _get_error_message(self, response_text: str) -> Optional[str]:
        """
        API 오류 메시지 추출

        Args:
            response_text: XML 응답 텍스트

        Returns:
            오류 메시지 또는 None
        """
        try:
            root = ET.fromstring(response_text)
            header_cd = root.find(".//headerCd")
            header_msg = root.find(".//headerMsg")

            if header_cd is not None and header_cd.text != "0":
                msg = header_msg.text if header_msg is not None else "알 수 없는 오류"
                return f"[{header_cd.text}] {msg}"
            return None
        except ET.ParseError:
            return None

    def get_bus_route_list(self, bus_number: str) -> list[dict]:
        """
        버스 노선 목록 조회 (API 호출)

        Args:
            bus_number: 버스 번호 (예: "6625")

        Returns:
            노선 목록 [{ busRouteId, busRouteNm, ... }]
        """
        url = f"{self.BASE_URL}/busRouteInfo/getBusRouteList"
        params = {"serviceKey": self.api_key, "strSrch": bus_number}

        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()

            error_msg = self._get_error_message(response.text)
            if error_msg:
                logger.warning(f"버스 노선 조회 오류: {error_msg}")
                return []

            return self._parse_xml_response(response.text)
        except requests.RequestException as e:
            logger.error(f"버스 노선 API 요청 실패: {e}")
            return []

    def get_station_by_name(self, station_name: str) -> list[dict]:
        """
        정류소 목록 조회 (API 호출)

        부분 일치 검색이므로 여러 결과가 반환될 수 있습니다.
        좌표 기반으로 가장 가까운 정류소를 선택해야 합니다.

        Args:
            station_name: 정류소명 (예: "신목초등학교")

        Returns:
            정류소 목록 [{ stId, stNm, arsId, tmX(경도), tmY(위도), ... }]
        """
        url = f"{self.BASE_URL}/stationinfo/getStationByName"
        params = {"serviceKey": self.api_key, "stSrch": station_name}

        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()

            error_msg = self._get_error_message(response.text)
            if error_msg:
                logger.warning(f"정류소 조회 오류: {error_msg}")
                return []

            return self._parse_xml_response(response.text)
        except requests.RequestException as e:
            logger.error(f"정류소 API 요청 실패: {e}")
            return []

    def get_arrival_info(
        self, st_id: str, bus_route_id: str, ord: int = 1
    ) -> Optional[dict]:
        """
        버스 도착정보 조회

        Args:
            st_id: 정류소 ID
            bus_route_id: 노선 ID
            ord: 정류소 순번 (기본 1)

        Returns:
            도착정보 {
                vehId1: 첫 번째 버스 차량 ID,
                arrmsg1: 도착 메시지,
                traTime1: 도착 예정 시간(초),
                sectOrd1: 현재 구간 순번,
                stationNm1: 현재 위치 정류소명,
                ...
            } 또는 None
        """
        url = f"{self.BASE_URL}/arrive/getArrInfoByRouteAll"
        params = {
            "serviceKey": self.api_key,
            "stId": st_id,
            "busRouteId": bus_route_id,
            "ord": ord,
        }

        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()

            error_msg = self._get_error_message(response.text)
            if error_msg:
                logger.warning(f"버스 도착정보 조회 오류: {error_msg}")
                return None

            items = self._parse_xml_response(response.text)
            return items[0] if items else None
        except requests.RequestException as e:
            logger.error(f"버스 도착정보 API 요청 실패: {e}")
            return None

    def get_bus_position(self, veh_id: str) -> Optional[dict]:
        """
        버스 실시간 위치 조회

        Args:
            veh_id: 차량 ID

        Returns:
            위치정보 {
                tmX: 경도,
                tmY: 위도,
                stopFlag: 정차 여부 (0: 운행중, 1: 정차중),
                dataTm: 데이터 수신 시간,
                ...
            } 또는 None

        Note:
            veh_id가 0이거나 없으면 버스가 아직 출발 전입니다.
        """
        if not veh_id or veh_id == "0":
            return None

        url = f"{self.BASE_URL}/buspos/getBusPosByVehId"
        params = {"serviceKey": self.api_key, "vehId": veh_id}

        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()

            error_msg = self._get_error_message(response.text)
            if error_msg:
                logger.warning(f"버스 위치 조회 오류: {error_msg}")
                return None

            items = self._parse_xml_response(response.text)
            return items[0] if items else None
        except requests.RequestException as e:
            logger.error(f"버스 위치 API 요청 실패: {e}")
            return None


# 싱글톤 인스턴스
bus_api_client = SeoulBusAPIClient()
