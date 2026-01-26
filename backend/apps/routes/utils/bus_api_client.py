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

    def _get_error_message(self, response_text: str) -> str | None:
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

    def get_station_by_route(self, bus_route_id: str) -> list[dict]:
        """
        노선의 정류소 목록 조회 (API 호출)

        Args:
            bus_route_id: 노선 ID (예: "100100303")

        Returns:
            정류소 목록 [{ seq, stationNm, stationId, arsId, ... }]
        """
        url = f"{self.BASE_URL}/busRouteInfo/getStaionByRoute"
        params = {
            "serviceKey": self.api_key,
            "busRouteId": bus_route_id,
            "resultType": "json",
        }

        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()

            # JSON 파싱
            data = response.json()

            # 에러 체크
            msg_header = data.get("msgHeader", {})
            result_code = msg_header.get("headerCd")

            if result_code not in ("0", "4"):
                logger.warning(
                    f"노선 정류소 조회 오류: [{result_code}] "
                    f"{msg_header.get('headerMsg', '알 수 없는 오류')}"
                )
                return []

            # itemList 추출
            msg_body = data.get("msgBody", {})
            items = msg_body.get("itemList") or []

            # 디버깅: 첫 번째 정류소 구조 확인
            if items:
                logger.info(
                    f"노선 정류소 API 응답 (첫 번째 항목): bus_route_id={bus_route_id}, "
                    f"keys={list(items[0].keys())}"
                )
                logger.info(f"샘플 데이터: {items[0]}")

            return items
        except requests.RequestException as e:
            logger.error(
                f"노선 정류소 API 요청 실패: bus_route_id={bus_route_id}, error={e}"
            )
            return []
        except (ValueError, KeyError) as e:
            logger.error(
                f"노선 정류소 API JSON 파싱 오류: bus_route_id={bus_route_id}, error={e}"
            )
            return []

    def get_arrival_info(
        self, st_id: str, bus_route_id: str, ord: int | None = None
    ) -> dict | None:
        """
        버스 도착정보 조회 (JSON 형식)

        Args:
            st_id: 정류소 ID
            bus_route_id: 노선 ID
            ord: 정류소 순번 (선택사항, None이면 자동 검색)

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
        # ord가 없으면 노선 정류소 목록에서 찾기
        if ord is None:
            logger.info(
                f"ord 없음, 노선 정류소 목록에서 검색: "
                f"st_id={st_id}, bus_route_id={bus_route_id}"
            )
            stations = self.get_station_by_route(bus_route_id)

            # 디버깅: 찾는 중인 st_id와 비교
            found = False
            for i, station in enumerate(stations):
                # 가능한 모든 필드명 시도 (API 문서마다 필드명이 다를 수 있음)
                station_id_fields = ["stationId", "stId", "station"]
                seq_fields = ["seq", "staOrder", "stationSeq"]

                station_id = None
                for field in station_id_fields:
                    if field in station:
                        station_id = station.get(field)
                        break

                if i < 3:  # 처음 3개만 디버깅 출력
                    logger.info(
                        f"정류소 #{i}: station_id={station_id}, st_id_target={st_id}, "
                        f"keys={list(station.keys())[:10]}"
                    )

                if station_id == st_id:
                    # seq 찾기
                    for field in seq_fields:
                        if field in station:
                            ord = int(station.get(field, 0))
                            logger.info(
                                f"ord 찾음: st_id={st_id}, "
                                f"stationNm={station.get('stationNm') or station.get('stNm')}, "
                                f"ord={ord}, seq_field={field}"
                            )
                            found = True
                            break
                    break

            if not found:
                logger.warning(
                    f"ord를 찾을 수 없음: st_id={st_id}, bus_route_id={bus_route_id}, "
                    f"노선 정류소 개수={len(stations)}"
                )
                # ord 없이 시도
                ord = None

        # ord가 있으면 getArrInfoByRoute (단일 정류소), 없으면 getArrInfoByRouteAll 사용
        if ord is not None:
            # 특정 정류소의 도착정보만 조회
            url = f"{self.BASE_URL}/arrive/getArrInfoByRoute"
            params = {
                "serviceKey": self.api_key,
                "stId": st_id,
                "busRouteId": bus_route_id,
                "ord": ord,
                "resultType": "json",
            }
            logger.info(
                f"버스 도착정보 API 호출 (단일 정류소): st_id={st_id}, "
                f"bus_route_id={bus_route_id}, ord={ord}"
            )
        else:
            # ord 없이 모든 정류소 조회
            url = f"{self.BASE_URL}/arrive/getArrInfoByRouteAll"
            params = {
                "serviceKey": self.api_key,
                "stId": st_id,
                "busRouteId": bus_route_id,
                "resultType": "json",
            }
            logger.info(
                f"버스 도착정보 API 호출 (모든 정류소): st_id={st_id}, "
                f"bus_route_id={bus_route_id}"
            )

        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()

            # JSON 파싱
            data = response.json()

            # 에러 체크
            msg_header = data.get("msgHeader", {})
            result_code = msg_header.get("headerCd")

            if result_code not in ("0", "4"):
                logger.warning(
                    f"버스 도착정보 조회 오류: [{result_code}] "
                    f"{msg_header.get('headerMsg', '알 수 없는 오류')}"
                )
                return None

            # itemList 추출
            msg_body = data.get("msgBody", {})
            items = msg_body.get("itemList") or []

            # API 응답 로깅 강화
            logger.info(
                f"버스 API 응답: st_id={st_id}, bus_route_id={bus_route_id}, "
                f"ord={ord}, result_count={len(items)}"
            )

            if not items:
                logger.warning(
                    f"버스 도착정보 없음: st_id={st_id}, bus_route_id={bus_route_id}, ord={ord}"
                )
                return None

            # ord가 있으면 단일 정류소 응답 (첫 번째 항목만 사용)
            if ord is not None:
                item = items[0]
                logger.info(
                    f"단일 정류소 도착정보: bus_route_id={bus_route_id}, ord={ord}, "
                    f"stNm={item.get('stNm')}, "
                    f"arsId={item.get('arsId')}, "
                    f"vehId1={item.get('vehId1')}, "
                    f"traTime1={item.get('traTime1')}, "
                    f"arrmsg1={item.get('arrmsg1')}, "
                    f"vehId2={item.get('vehId2')}, "
                    f"traTime2={item.get('traTime2')}, "
                    f"arrmsg2={item.get('arrmsg2')}"
                )
                return item
            else:
                # ord 없이 전체 조회한 경우 busRouteId로 필터링
                route_ids = [item.get("busRouteId") for item in items[:10]]
                logger.info(
                    f"API 응답 노선 목록 (상위 10개): {route_ids}, "
                    f"찾는 노선: {bus_route_id}"
                )

                for item in items:
                    if item.get("busRouteId") == bus_route_id:
                        logger.info(
                            f"일치하는 노선 발견: bus_route_id={bus_route_id}, "
                            f"stNm={item.get('stNm')}, "
                            f"arsId={item.get('arsId')}, "
                            f"vehId1={item.get('vehId1')}, "
                            f"traTime1={item.get('traTime1')}, "
                            f"arrmsg1={item.get('arrmsg1')}, "
                            f"vehId2={item.get('vehId2')}, "
                            f"traTime2={item.get('traTime2')}, "
                            f"arrmsg2={item.get('arrmsg2')}"
                        )
                        return item

                logger.warning(
                    f"일치하는 노선 없음: bus_route_id={bus_route_id}, "
                    f"검색된 항목 수={len(items)}"
                )
                return None
        except requests.RequestException as e:
            logger.error(
                f"버스 도착정보 API 요청 실패: st_id={st_id}, "
                f"bus_route_id={bus_route_id}, error={e}"
            )
            return None
        except (ValueError, KeyError) as e:
            logger.error(
                f"버스 API JSON 파싱 오류: st_id={st_id}, "
                f"bus_route_id={bus_route_id}, error={e}"
            )
            return None

    def get_bus_position(self, veh_id: str) -> dict | None:
        """
        버스 실시간 위치 조회 (JSON 형식)

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
        params = {
            "serviceKey": self.api_key,
            "vehId": veh_id,
            "resultType": "json",  # JSON 형식으로 요청
        }

        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()

            # JSON 파싱
            data = response.json()

            # 에러 체크
            msg_header = data.get("msgHeader", {})
            result_code = msg_header.get("headerCd")

            if result_code not in ("0", "4"):
                logger.warning(
                    f"버스 위치 조회 오류: [{result_code}] "
                    f"{msg_header.get('headerMsg', '알 수 없는 오류')}"
                )
                return None

            # itemList 추출
            msg_body = data.get("msgBody", {})
            items = msg_body.get("itemList") or []

            return items[0] if items else None
        except requests.RequestException as e:
            logger.error(f"버스 위치 API 요청 실패: {e}")
            return None
        except (ValueError, KeyError) as e:
            logger.error(f"버스 위치 API JSON 파싱 오류: {e}")
            return None

    def get_bus_positions_by_route(self, bus_route_id: str) -> list[dict]:
        """
        노선의 모든 버스 실시간 위치 조회 (JSON 형식)

        Args:
            bus_route_id: 노선 ID (예: "100100303")

        Returns:
            버스 위치 목록 [{
                vehId: 차량 ID,
                tmX: 경도,
                tmY: 위도,
                sectOrd: 현재 구간 순번,
                stopFlag: 정차 여부 (0: 운행중, 1: 정차중),
                dataTm: 데이터 수신 시간,
                plainNo: 차량 번호판,
                busType: 버스 타입 (0: 일반, 1: 저상),
                isFullFlag: 만차 여부,
                congetion: 혼잡도,
                ...
            }]
        """
        url = f"{self.BASE_URL}/buspos/getBusPosByRtid"
        params = {
            "serviceKey": self.api_key,
            "busRouteId": bus_route_id,
            "resultType": "json",
        }

        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()

            # JSON 파싱
            data = response.json()

            # 에러 체크
            msg_header = data.get("msgHeader", {})
            result_code = msg_header.get("headerCd")

            if result_code not in ("0", "4"):
                logger.warning(
                    f"노선 버스 위치 조회 오류: [{result_code}] "
                    f"{msg_header.get('headerMsg', '알 수 없는 오류')}"
                )
                return []

            # itemList 추출
            msg_body = data.get("msgBody", {})
            items = msg_body.get("itemList") or []

            logger.info(
                f"노선 버스 위치 조회: bus_route_id={bus_route_id}, "
                f"운행중인 버스 수={len(items)}"
            )

            return items
        except requests.RequestException as e:
            logger.error(
                f"노선 버스 위치 API 요청 실패: bus_route_id={bus_route_id}, error={e}"
            )
            return []
        except (ValueError, KeyError) as e:
            logger.error(
                f"노선 버스 위치 API JSON 파싱 오류: bus_route_id={bus_route_id}, error={e}"
            )
            return []


# 싱글톤 인스턴스
bus_api_client = SeoulBusAPIClient()
