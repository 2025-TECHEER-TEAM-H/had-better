# Redis + RabbitMQ 봇 시뮬레이션 코드 모음 (v3)

## 변경사항 (v2 → v3)

| 구분 | v2 | v3 |
|------|----|----|
| API 호출 주기 | 5초 고정 (Periodic Task) | **동적 주기 (apply_async)** |
| 버스 API | Mock | **공공데이터포탈 API** |
| 지하철 API | Mock | **서울 열린데이터광장 API** |
| 봇 상태 | 단순 | **arrival_time, next_poll_interval 추가** |
| ID 변환 | 없음 | **PublicAPIIdConverter 클래스** |

---

## 목차

1. [공공데이터 API 클라이언트](#1-공공데이터-api-클라이언트)
2. [ID 변환 서비스](#2-id-변환-서비스)
3. [봇 상태 관리 (v3)](#3-봇-상태-관리-v3)
4. [SSE Publisher (v3)](#4-sse-publisher-v3)
5. [Celery Task (v3 - 동적 주기)](#5-celery-task-v3---동적-주기)
6. [경주 시작 API (v3)](#6-경주-시작-api-v3)
7. [파일 구조](#7-파일-구조)

---

## 1. 공공데이터 API 클라이언트

### 1.1 버스 API 클라이언트

```python
# apps/routes/utils/bus_api_client.py

import math
import requests
import xml.etree.ElementTree as ET
from typing import Optional
from django.conf import settings


class SeoulBusAPIClient:
    """서울시 버스 API 클라이언트"""
    
    def __init__(self):
        self.base_url = settings.SEOUL_BUS_API_BASE
        self.api_key = settings.SEOUL_BUS_API_KEY
    
    def _parse_xml_response(self, response_text: str) -> list[dict]:
        """XML 응답 파싱"""
        root = ET.fromstring(response_text)
        items = []
        for item in root.findall('.//itemList'):
            item_dict = {}
            for child in item:
                item_dict[child.tag] = child.text
            items.append(item_dict)
        return items
    
    def get_bus_route_list(self, bus_number: str) -> list[dict]:
        """
        버스 노선 목록 조회
        
        Args:
            bus_number: 버스 번호 (예: "6625")
            
        Returns:
            노선 목록 [{ busRouteId, busRouteNm, ... }]
        """
        url = f"{self.base_url}/busRouteInfo/getBusRouteList"
        params = {
            "serviceKey": self.api_key,
            "strSrch": bus_number
        }
        
        response = requests.get(url, params=params, timeout=10)
        return self._parse_xml_response(response.text)
    
    def get_station_by_name(self, station_name: str) -> list[dict]:
        """
        정류소 목록 조회 (이름 검색)
        
        Args:
            station_name: 정류소명 (예: "신목초등학교")
            
        Returns:
            정류소 목록 [{ stId, stNm, arsId, tmX, tmY, ... }]
        """
        url = f"{self.base_url}/stationinfo/getStationByName"
        params = {
            "serviceKey": self.api_key,
            "stSrch": station_name
        }
        
        response = requests.get(url, params=params, timeout=10)
        return self._parse_xml_response(response.text)
    
    def get_arrival_info(self, st_id: str, bus_route_id: str, ord: int = 1) -> dict | None:
        """
        버스 도착정보 조회
        
        Args:
            st_id: 정류소 ID
            bus_route_id: 노선 ID
            ord: 정류소 순번
            
        Returns:
            도착정보 { vehId1, arrmsg1, traTime1, ... }
        """
        url = f"{self.base_url}/arrive/getArrInfoByRouteAll"
        params = {
            "serviceKey": self.api_key,
            "stId": st_id,
            "busRouteId": bus_route_id,
            "ord": ord
        }
        
        response = requests.get(url, params=params, timeout=10)
        items = self._parse_xml_response(response.text)
        return items[0] if items else None
    
    def get_bus_position(self, veh_id: str) -> dict | None:
        """
        버스 실시간 위치 조회
        
        Args:
            veh_id: 차량 ID
            
        Returns:
            위치정보 { tmX, tmY, stopFlag, ... }
        """
        url = f"{self.base_url}/buspos/getBusPosByVehId"
        params = {
            "serviceKey": self.api_key,
            "vehId": veh_id
        }
        
        response = requests.get(url, params=params, timeout=10)
        items = self._parse_xml_response(response.text)
        return items[0] if items else None


# 싱글톤 인스턴스
bus_api_client = SeoulBusAPIClient()
```

### 1.2 지하철 API 클라이언트

```python
# apps/routes/utils/subway_api_client.py

import requests
from django.conf import settings


class SeoulSubwayAPIClient:
    """서울시 지하철 API 클라이언트"""
    
    def __init__(self):
        self.base_url = settings.SEOUL_SUBWAY_API_BASE
        self.api_key = settings.SEOUL_SUBWAY_API_KEY
    
    def get_arrival_info(self, station_name: str) -> list[dict]:
        """
        실시간 도착정보 조회
        
        Args:
            station_name: 역명 (예: "문래")
            
        Returns:
            도착 열차 목록 [{ subwayId, btrainNo, barvlDt, arvlMsg2, ... }]
        """
        url = f"{self.base_url}/{self.api_key}/json/realtimeStationArrival/0/20/{station_name}"
        
        response = requests.get(url, timeout=10)
        data = response.json()
        
        if "realtimeArrivalList" in data:
            return data["realtimeArrivalList"]
        return []
    
    def get_train_position(self, subway_line: str) -> list[dict]:
        """
        실시간 열차 위치 조회
        
        Args:
            subway_line: 호선명 (예: "2호선")
            
        Returns:
            열차 위치 목록 [{ trainNo, statnNm, trainSttus, ... }]
        """
        url = f"{self.base_url}/{self.api_key}/json/realtimePosition/0/100/{subway_line}"
        
        response = requests.get(url, timeout=10)
        data = response.json()
        
        if "realtimePositionList" in data:
            return data["realtimePositionList"]
        return []
    
    def filter_by_train_no(self, positions: list[dict], train_no: str) -> dict | None:
        """열차번호로 필터링"""
        for pos in positions:
            if pos.get("trainNo") == train_no:
                return pos
        return None
    
    def filter_by_direction(
        self, 
        arrivals: list[dict], 
        subway_line_id: str,
        destination_station: str
    ) -> dict | None:
        """
        방향으로 열차 필터링
        
        Args:
            arrivals: 도착 열차 목록
            subway_line_id: 호선 ID (예: "1002")
            destination_station: 하차역명
            
        Returns:
            해당 방향 첫 번째 열차
        """
        for arrival in arrivals:
            # 같은 호선인지 확인
            if arrival.get("subwayId") != subway_line_id:
                continue
            
            # 종착역 또는 도착지방면에 하차역이 포함되어 있는지 확인
            train_line_nm = arrival.get("trainLineNm", "")
            if destination_station in train_line_nm:
                return arrival
        
        return None


# 싱글톤 인스턴스
subway_api_client = SeoulSubwayAPIClient()
```

### 1.3 좌표 유틸리티

```python
# apps/routes/utils/geo_utils.py

import math


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    두 좌표 사이의 거리 계산 (미터)
    Haversine 공식 사용
    
    Args:
        lat1, lon1: 첫 번째 좌표
        lat2, lon2: 두 번째 좌표
        
    Returns:
        거리 (미터)
    """
    R = 6371000  # 지구 반지름 (미터)
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + \
        math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c


def find_closest_station(
    tmap_lat: float, 
    tmap_lon: float, 
    stations: list[dict]
) -> dict | None:
    """
    TMAP 좌표와 가장 가까운 정류소 찾기
    
    Args:
        tmap_lat: TMAP 위도
        tmap_lon: TMAP 경도
        stations: 정류소 목록 [{ stId, tmX, tmY, ... }]
        
    Returns:
        가장 가까운 정류소
    """
    closest = None
    min_distance = float('inf')
    
    for station in stations:
        try:
            station_lat = float(station.get('tmY', 0))
            station_lon = float(station.get('tmX', 0))
        except (ValueError, TypeError):
            continue
        
        dist = calculate_distance(tmap_lat, tmap_lon, station_lat, station_lon)
        
        if dist < min_distance:
            min_distance = dist
            closest = station
    
    return closest
```

---

## 2. ID 변환 서비스

```python
# apps/routes/services/id_converter.py

from typing import Optional
from ..utils.bus_api_client import bus_api_client
from ..utils.geo_utils import find_closest_station


# 지하철 호선 매핑
SUBWAY_LINE_MAP = {
    "1호선": "1001",
    "2호선": "1002",
    "3호선": "1003",
    "4호선": "1004",
    "5호선": "1005",
    "6호선": "1006",
    "7호선": "1007",
    "8호선": "1008",
    "9호선": "1009",
    "경의중앙선": "1063",
    "공항철도": "1065",
    "경춘선": "1067",
    "수인분당선": "1075",
    "신분당선": "1077",
    "우이신설선": "1092",
}


class PublicAPIIdConverter:
    """TMAP → 공공데이터 ID 변환 서비스"""
    
    @staticmethod
    def parse_bus_number(tmap_route: str) -> str:
        """
        TMAP route 필드에서 버스번호 추출
        
        예시:
        - "지선:6625" → "6625"
        - "간선:472" → "472"
        """
        if ":" in tmap_route:
            return tmap_route.split(":")[1]
        return tmap_route
    
    @staticmethod
    def parse_subway_line(tmap_route: str) -> str:
        """
        TMAP route 필드에서 호선명 추출
        
        예시:
        - "수도권2호선" → "2호선"
        """
        if tmap_route.startswith("수도권"):
            return tmap_route[3:]
        return tmap_route
    
    @staticmethod
    def get_bus_route_id(bus_number: str) -> Optional[str]:
        """
        버스번호로 공공데이터 노선 ID 조회
        
        Args:
            bus_number: 버스번호 (예: "6625")
            
        Returns:
            busRouteId (예: "100100303") 또는 None
        """
        routes = bus_api_client.get_bus_route_list(bus_number)
        
        for route in routes:
            if route.get("busRouteNm") == bus_number:
                return route.get("busRouteId")
        
        return None
    
    @staticmethod
    def get_station_ids(
        station_name: str,
        tmap_lon: float,
        tmap_lat: float
    ) -> Optional[dict]:
        """
        정류소명과 좌표로 공공데이터 정류소 ID 조회
        
        Args:
            station_name: 정류소명
            tmap_lon: TMAP 경도
            tmap_lat: TMAP 위도
            
        Returns:
            { stId, arsId, name, lon, lat } 또는 None
        """
        # 정류소명에서 키워드 추출 (너무 긴 이름은 잘라서 검색)
        search_name = station_name[:10] if len(station_name) > 10 else station_name
        
        stations = bus_api_client.get_station_by_name(search_name)
        
        if not stations:
            return None
        
        # 좌표로 가장 가까운 정류소 찾기
        closest = find_closest_station(tmap_lat, tmap_lon, stations)
        
        if closest:
            return {
                "stId": closest.get("stId"),
                "arsId": closest.get("arsId"),
                "name": closest.get("stNm"),
                "lon": float(closest.get("tmX", 0)),
                "lat": float(closest.get("tmY", 0))
            }
        
        return None
    
    @classmethod
    def convert_legs(cls, legs: list[dict]) -> dict:
        """
        전체 legs의 ID 변환
        
        Args:
            legs: TMAP legs 배열
            
        Returns:
            변환된 ID 정보 { legs: [...] }
        """
        converted_legs = []
        
        for leg in legs:
            mode = leg.get("mode")
            
            if mode == "WALK":
                converted_legs.append({"mode": "WALK"})
                
            elif mode == "BUS":
                # 버스번호 파싱
                bus_number = cls.parse_bus_number(leg.get("route", ""))
                
                # 노선 ID 조회
                bus_route_id = cls.get_bus_route_id(bus_number)
                
                # 승차 정류소 ID 조회
                start = leg.get("start", {})
                start_station = cls.get_station_ids(
                    station_name=start.get("name", ""),
                    tmap_lon=start.get("lon", 0),
                    tmap_lat=start.get("lat", 0)
                )
                
                # 하차 정류소 ID 조회
                end = leg.get("end", {})
                end_station = cls.get_station_ids(
                    station_name=end.get("name", ""),
                    tmap_lon=end.get("lon", 0),
                    tmap_lat=end.get("lat", 0)
                )
                
                converted_legs.append({
                    "mode": "BUS",
                    "bus_route_id": bus_route_id,
                    "bus_route_name": bus_number,
                    "start_station": start_station,
                    "end_station": end_station,
                    "pass_shape": leg.get("passShape", {}).get("linestring")
                })
                
            elif mode == "SUBWAY":
                # 호선명 파싱
                subway_line = cls.parse_subway_line(leg.get("route", ""))
                subway_line_id = SUBWAY_LINE_MAP.get(subway_line)
                
                # 경유역 목록
                pass_stops = []
                for station in leg.get("passStopList", {}).get("stations", []):
                    pass_stops.append(station.get("stationName"))
                
                converted_legs.append({
                    "mode": "SUBWAY",
                    "subway_line": subway_line,
                    "subway_line_id": subway_line_id,
                    "start_station": leg.get("start", {}).get("name"),
                    "end_station": leg.get("end", {}).get("name"),
                    "pass_stops": pass_stops,
                    "pass_shape": leg.get("passShape", {}).get("linestring")
                })
        
        return {"legs": converted_legs}
```

---

## 3. 봇 상태 관리 (v3)

```python
# apps/routes/services/bot_state.py

from datetime import datetime
from enum import Enum
from typing import Optional
from ..utils.redis_client import redis_client


class BotStatus(str, Enum):
    """봇 상태 Enum (v3 확장)"""
    WALKING = "WALKING"
    WAITING_BUS = "WAITING_BUS"
    RIDING_BUS = "RIDING_BUS"
    WAITING_SUBWAY = "WAITING_SUBWAY"
    RIDING_SUBWAY = "RIDING_SUBWAY"
    FINISHED = "FINISHED"


class BotStateManager:
    """봇 상태 관리 서비스 (v3)"""
    
    @staticmethod
    def initialize(route_id: int, bot_id: int, legs: list) -> dict:
        """
        봇 초기 상태 생성
        """
        # 첫 번째 leg의 mode 확인
        first_leg = legs[0] if legs else {}
        initial_status = BotStatus.WALKING.value
        
        state = {
            "route_id": route_id,
            "bot_id": bot_id,
            "status": initial_status,
            "current_leg_index": 0,
            "total_legs": len(legs),
            "leg_started_at": datetime.now().isoformat(),
            "vehicle_id": None,
            "arrival_time": None,  # v3: 도착 예정 시간 (초)
            "next_poll_interval": 30,  # v3: 다음 폴링 간격
            "current_position": None,  # v3: 현재 위치 좌표
        }
        redis_client.set_bot_state(route_id, state)
        return state
    
    @staticmethod
    def get(route_id: int) -> Optional[dict]:
        return redis_client.get_bot_state(route_id)
    
    @staticmethod
    def update(route_id: int, **kwargs) -> Optional[dict]:
        state = redis_client.get_bot_state(route_id)
        if state:
            state.update(kwargs)
            redis_client.set_bot_state(route_id, state)
        return state
    
    @staticmethod
    def delete(route_id: int):
        redis_client.delete_bot_state(route_id)
        redis_client.delete_public_ids(route_id)
    
    @staticmethod
    def transition_to_waiting_bus(route_id: int, leg_index: int) -> Optional[dict]:
        """WAITING_BUS 상태로 전환"""
        return BotStateManager.update(
            route_id,
            status=BotStatus.WAITING_BUS.value,
            current_leg_index=leg_index,
            leg_started_at=datetime.now().isoformat(),
            vehicle_id=None,
            arrival_time=None,
            next_poll_interval=30
        )
    
    @staticmethod
    def transition_to_riding_bus(
        route_id: int,
        vehicle_id: str
    ) -> Optional[dict]:
        """RIDING_BUS 상태로 전환"""
        return BotStateManager.update(
            route_id,
            status=BotStatus.RIDING_BUS.value,
            vehicle_id=vehicle_id,
            arrival_time=None,
            next_poll_interval=30
        )
    
    @staticmethod
    def transition_to_waiting_subway(route_id: int, leg_index: int) -> Optional[dict]:
        """WAITING_SUBWAY 상태로 전환"""
        return BotStateManager.update(
            route_id,
            status=BotStatus.WAITING_SUBWAY.value,
            current_leg_index=leg_index,
            leg_started_at=datetime.now().isoformat(),
            vehicle_id=None,
            arrival_time=None,
            next_poll_interval=30
        )
    
    @staticmethod
    def transition_to_riding_subway(
        route_id: int,
        train_no: str
    ) -> Optional[dict]:
        """RIDING_SUBWAY 상태로 전환"""
        return BotStateManager.update(
            route_id,
            status=BotStatus.RIDING_SUBWAY.value,
            vehicle_id=train_no,
            arrival_time=None,
            next_poll_interval=30
        )
    
    @staticmethod
    def transition_to_walking(route_id: int, leg_index: int) -> Optional[dict]:
        """WALKING 상태로 전환"""
        return BotStateManager.update(
            route_id,
            status=BotStatus.WALKING.value,
            current_leg_index=leg_index,
            leg_started_at=datetime.now().isoformat(),
            vehicle_id=None,
            arrival_time=None,
            next_poll_interval=30
        )
    
    @staticmethod
    def transition_to_finished(route_id: int) -> Optional[dict]:
        """FINISHED 상태로 전환"""
        return BotStateManager.update(
            route_id,
            status=BotStatus.FINISHED.value,
            next_poll_interval=None
        )
    
    @staticmethod
    def update_arrival_time(route_id: int, arrival_time: int) -> int:
        """
        도착 예정 시간 업데이트 및 다음 폴링 간격 결정
        
        Args:
            route_id: 경로 ID
            arrival_time: 도착 예정 시간 (초)
            
        Returns:
            다음 폴링 간격 (15초 또는 30초)
        """
        # 2분(120초) 이내면 15초, 그 외 30초
        next_interval = 15 if arrival_time <= 120 else 30
        
        BotStateManager.update(
            route_id,
            arrival_time=arrival_time,
            next_poll_interval=next_interval
        )
        
        return next_interval
```

---

## 4. SSE Publisher (v3)

```python
# apps/routes/services/sse_publisher.py

from datetime import datetime
from ..utils.rabbitmq_client import rabbitmq_client


class SSEPublisher:
    """SSE 이벤트 발행 서비스 (v3)"""
    
    @staticmethod
    def publish_bot_status_update(
        route_id: int,
        bot_state: dict,
        vehicle_info: dict = None,
        next_update_in: int = 30
    ):
        """
        봇 상태 업데이트 이벤트 발행 (v3 확장)
        
        Args:
            route_id: 경로 ID
            bot_state: 봇 상태
            vehicle_info: 차량 정보 (위치, 도착정보 등)
            next_update_in: 다음 업데이트까지 시간 (초)
        """
        data = {
            "route_id": bot_state["route_id"],
            "bot_id": bot_state["bot_id"],
            "status": bot_state["status"],
            "leg_index": bot_state["current_leg_index"],
            "progress_percent": bot_state.get("progress_percent"),
            "arrival_time": bot_state.get("arrival_time"),
            "next_update_in": next_update_in,
            "timestamp": datetime.now().isoformat()
        }
        
        if vehicle_info:
            data["vehicle"] = vehicle_info
        
        rabbitmq_client.publish(
            route_id=route_id,
            event_type="bot_status_update",
            data=data
        )
    
    @staticmethod
    def publish_bot_boarding(
        route_id: int,
        bot_id: int,
        station_name: str,
        vehicle: dict
    ):
        """봇 탑승 이벤트 발행"""
        rabbitmq_client.publish(
            route_id=route_id,
            event_type="bot_boarding",
            data={
                "route_id": route_id,
                "bot_id": bot_id,
                "station_name": station_name,
                "vehicle": vehicle,
                "timestamp": datetime.now().isoformat()
            }
        )
    
    @staticmethod
    def publish_bot_alighting(route_id: int, bot_id: int, station_name: str):
        """봇 하차 이벤트 발행"""
        rabbitmq_client.publish(
            route_id=route_id,
            event_type="bot_alighting",
            data={
                "route_id": route_id,
                "bot_id": bot_id,
                "station_name": station_name,
                "next_action": "WALKING",
                "timestamp": datetime.now().isoformat()
            }
        )
    
    @staticmethod
    def publish_participant_finished(
        route_id: int,
        participant: dict,
        rank: int,
        duration: int
    ):
        """참가자 도착 이벤트 발행"""
        rabbitmq_client.publish(
            route_id=route_id,
            event_type="participant_finished",
            data={
                "participant": participant,
                "rank": rank,
                "duration": duration,
                "timestamp": datetime.now().isoformat()
            }
        )
    
    @staticmethod
    def publish_route_ended(route_id: int, reason: str = "all_finished"):
        """경주 종료 이벤트 발행"""
        rabbitmq_client.publish(
            route_id=route_id,
            event_type="route_ended",
            data={
                "route_id": route_id,
                "reason": reason,
                "timestamp": datetime.now().isoformat()
            }
        )
```

---

## 5. Celery Task (v3 - 동적 주기)

```python
# apps/routes/tasks/bot_simulation.py

from celery import shared_task
from datetime import datetime
from django.utils import timezone

from ..models import Route
from ..services.bot_state import BotStateManager, BotStatus
from ..services.sse_publisher import SSEPublisher
from ..utils.redis_client import redis_client
from ..utils.bus_api_client import bus_api_client
from ..utils.subway_api_client import subway_api_client
from ..utils.geo_utils import calculate_distance


@shared_task
def update_bot_position(route_id: int):
    """
    봇 위치 업데이트 Task (v3 - 동적 주기)
    
    이 Task는 실행 후 다음 Task를 동적 주기로 예약합니다.
    - 기본: 30초
    - 도착 임박 (2분 이내): 15초
    """
    # 1. 봇 상태 조회
    bot_state = BotStateManager.get(route_id)
    if not bot_state:
        return {"status": "no_state", "route_id": route_id}
    
    # 2. 이미 종료된 경우
    if bot_state["status"] == BotStatus.FINISHED.value:
        return {"status": "already_finished", "route_id": route_id}
    
    # 3. 공공데이터 ID 조회
    public_ids = redis_client.get_public_ids(route_id)
    if not public_ids:
        return {"status": "no_public_ids", "route_id": route_id}
    
    # 4. 경로 데이터 조회
    try:
        route = Route.objects.select_related('route_leg').get(id=route_id)
        legs = route.route_leg.legs
    except Route.DoesNotExist:
        return {"status": "route_not_found", "route_id": route_id}
    
    current_leg = legs[bot_state["current_leg_index"]]
    current_public_leg = public_ids["legs"][bot_state["current_leg_index"]]
    
    # 5. 상태별 처리 + 다음 폴링 간격 결정
    next_interval = 30  # 기본값
    
    if bot_state["status"] == BotStatus.WALKING.value:
        next_interval = _handle_walking(route_id, bot_state, current_leg, legs, public_ids)
        
    elif bot_state["status"] == BotStatus.WAITING_BUS.value:
        next_interval = _handle_waiting_bus(route_id, bot_state, current_leg, current_public_leg)
        
    elif bot_state["status"] == BotStatus.RIDING_BUS.value:
        next_interval = _handle_riding_bus(route_id, bot_state, current_leg, current_public_leg, legs, public_ids)
        
    elif bot_state["status"] == BotStatus.WAITING_SUBWAY.value:
        next_interval = _handle_waiting_subway(route_id, bot_state, current_leg, current_public_leg)
        
    elif bot_state["status"] == BotStatus.RIDING_SUBWAY.value:
        next_interval = _handle_riding_subway(route_id, bot_state, current_leg, current_public_leg, legs, public_ids)
    
    # 6. 다음 Task 예약 (종료되지 않은 경우)
    updated_state = BotStateManager.get(route_id)
    if updated_state and updated_state["status"] != BotStatus.FINISHED.value:
        update_bot_position.apply_async(
            args=[route_id],
            countdown=next_interval
        )
    
    return {"status": "updated", "route_id": route_id, "next_interval": next_interval}


def _handle_walking(route_id: int, bot_state: dict, current_leg: dict, legs: list, public_ids: dict) -> int:
    """WALKING 상태 처리"""
    leg_started_at = datetime.fromisoformat(bot_state["leg_started_at"])
    elapsed = (timezone.now() - leg_started_at).total_seconds()
    section_time = current_leg["sectionTime"]
    
    progress_percent = min((elapsed / section_time) * 100, 100)
    
    # SSE 발행
    SSEPublisher.publish_bot_status_update(
        route_id=route_id,
        bot_state={**bot_state, "progress_percent": progress_percent},
        next_update_in=30
    )
    
    # 도보 구간 완료
    if elapsed >= section_time:
        next_leg_index = bot_state["current_leg_index"] + 1
        
        if next_leg_index >= len(legs):
            _finish_bot(route_id, bot_state)
            return 30
        
        next_leg = legs[next_leg_index]
        next_public_leg = public_ids["legs"][next_leg_index]
        
        if next_leg["mode"] == "BUS":
            BotStateManager.transition_to_waiting_bus(route_id, next_leg_index)
        elif next_leg["mode"] == "SUBWAY":
            BotStateManager.transition_to_waiting_subway(route_id, next_leg_index)
        else:
            BotStateManager.transition_to_walking(route_id, next_leg_index)
    
    return 30


def _handle_waiting_bus(route_id: int, bot_state: dict, current_leg: dict, public_leg: dict) -> int:
    """WAITING_BUS 상태 처리"""
    
    # 공공데이터 API 호출
    bus_route_id = public_leg.get("bus_route_id")
    start_station = public_leg.get("start_station", {})
    st_id = start_station.get("stId")
    
    if not bus_route_id or not st_id:
        return 30
    
    # 도착정보 조회
    arrival_info = bus_api_client.get_arrival_info(st_id, bus_route_id)
    
    if not arrival_info:
        SSEPublisher.publish_bot_status_update(
            route_id=route_id,
            bot_state=bot_state,
            next_update_in=30
        )
        return 30
    
    veh_id = arrival_info.get("vehId1")
    tra_time = int(arrival_info.get("traTime1", 0) or 0)
    arrmsg = arrival_info.get("arrmsg1", "")
    
    # 버스 위치 조회 (vehId가 있을 때)
    bus_position = None
    if veh_id and veh_id != "0":
        pos = bus_api_client.get_bus_position(veh_id)
        if pos:
            bus_position = {
                "lon": float(pos.get("tmX", 0)),
                "lat": float(pos.get("tmY", 0)),
                "stopFlag": int(pos.get("stopFlag", 0))
            }
    
    # 탑승 여부 확인
    if tra_time <= 0 or "도착" in arrmsg:
        # 탑승!
        BotStateManager.transition_to_riding_bus(route_id, veh_id)
        
        SSEPublisher.publish_bot_boarding(
            route_id=route_id,
            bot_id=bot_state["bot_id"],
            station_name=start_station.get("name"),
            vehicle={
                "type": "BUS",
                "route": public_leg.get("bus_route_name"),
                "vehId": veh_id
            }
        )
        return 30
    
    # 대기 중 - 동적 주기 결정
    next_interval = BotStateManager.update_arrival_time(route_id, tra_time)
    
    SSEPublisher.publish_bot_status_update(
        route_id=route_id,
        bot_state={**bot_state, "arrival_time": tra_time},
        vehicle_info={
            "type": "BUS",
            "route": public_leg.get("bus_route_name"),
            "vehId": veh_id,
            "arrival_message": arrmsg,
            "position": bus_position
        },
        next_update_in=next_interval
    )
    
    return next_interval


def _handle_riding_bus(route_id: int, bot_state: dict, current_leg: dict, public_leg: dict, legs: list, public_ids: dict) -> int:
    """RIDING_BUS 상태 처리"""
    
    veh_id = bot_state.get("vehicle_id")
    if not veh_id:
        return 30
    
    # 버스 위치 조회
    pos = bus_api_client.get_bus_position(veh_id)
    if not pos:
        return 30
    
    bus_lon = float(pos.get("tmX", 0))
    bus_lat = float(pos.get("tmY", 0))
    stop_flag = int(pos.get("stopFlag", 0))
    
    # 하차 정류소 도착 확인
    end_station = public_leg.get("end_station", {})
    end_lon = end_station.get("lon", 0)
    end_lat = end_station.get("lat", 0)
    
    distance = calculate_distance(bus_lat, bus_lon, end_lat, end_lon)
    
    if distance < 50:  # 50m 이내면 하차
        # 하차 처리
        SSEPublisher.publish_bot_alighting(
            route_id=route_id,
            bot_id=bot_state["bot_id"],
            station_name=end_station.get("name")
        )
        
        next_leg_index = bot_state["current_leg_index"] + 1
        
        if next_leg_index >= len(legs):
            _finish_bot(route_id, bot_state)
            return 30
        
        next_leg = legs[next_leg_index]
        
        if next_leg["mode"] == "WALK":
            BotStateManager.transition_to_walking(route_id, next_leg_index)
        elif next_leg["mode"] == "SUBWAY":
            BotStateManager.transition_to_waiting_subway(route_id, next_leg_index)
        
        return 30
    
    # 탑승 중 SSE 발행
    SSEPublisher.publish_bot_status_update(
        route_id=route_id,
        bot_state=bot_state,
        vehicle_info={
            "type": "BUS",
            "route": public_leg.get("bus_route_name"),
            "vehId": veh_id,
            "position": {"lon": bus_lon, "lat": bus_lat},
            "stopFlag": stop_flag
        },
        next_update_in=30
    )
    
    return 30


def _handle_waiting_subway(route_id: int, bot_state: dict, current_leg: dict, public_leg: dict) -> int:
    """WAITING_SUBWAY 상태 처리"""
    
    start_station = public_leg.get("start_station")
    end_station = public_leg.get("end_station")
    subway_line = public_leg.get("subway_line")
    subway_line_id = public_leg.get("subway_line_id")
    
    if not start_station:
        return 30
    
    # 도착정보 조회
    arrivals = subway_api_client.get_arrival_info(start_station)
    
    # 방향 필터링
    target_train = subway_api_client.filter_by_direction(
        arrivals, subway_line_id, end_station
    )
    
    if not target_train:
        SSEPublisher.publish_bot_status_update(
            route_id=route_id,
            bot_state=bot_state,
            next_update_in=30
        )
        return 30
    
    train_no = target_train.get("btrainNo")
    arrival_time = int(target_train.get("barvlDt", 0) or 0)
    arvl_msg = target_train.get("arvlMsg2", "")
    arvl_msg3 = target_train.get("arvlMsg3", "")
    
    # 탑승 여부 확인
    if arrival_time <= 0 or arvl_msg == "도착":
        # 탑승!
        BotStateManager.transition_to_riding_subway(route_id, train_no)
        
        SSEPublisher.publish_bot_boarding(
            route_id=route_id,
            bot_id=bot_state["bot_id"],
            station_name=start_station,
            vehicle={
                "type": "SUBWAY",
                "route": subway_line,
                "trainNo": train_no
            }
        )
        return 30
    
    # 대기 중 - 동적 주기 결정
    next_interval = BotStateManager.update_arrival_time(route_id, arrival_time)
    
    # 열차 위치 조회
    train_position = None
    if train_no and subway_line:
        positions = subway_api_client.get_train_position(subway_line)
        pos = subway_api_client.filter_by_train_no(positions, train_no)
        if pos:
            train_position = {
                "current_station": pos.get("statnNm"),
                "train_status": pos.get("trainSttus")
            }
    
    SSEPublisher.publish_bot_status_update(
        route_id=route_id,
        bot_state={**bot_state, "arrival_time": arrival_time},
        vehicle_info={
            "type": "SUBWAY",
            "route": subway_line,
            "trainNo": train_no,
            "arrival_message": arvl_msg,
            "arrival_detail": arvl_msg3,
            "position": train_position
        },
        next_update_in=next_interval
    )
    
    return next_interval


def _handle_riding_subway(route_id: int, bot_state: dict, current_leg: dict, public_leg: dict, legs: list, public_ids: dict) -> int:
    """RIDING_SUBWAY 상태 처리"""
    
    train_no = bot_state.get("vehicle_id")
    subway_line = public_leg.get("subway_line")
    end_station = public_leg.get("end_station")
    pass_stops = public_leg.get("pass_stops", [])
    
    if not train_no or not subway_line:
        return 30
    
    # 열차 위치 조회
    positions = subway_api_client.get_train_position(subway_line)
    pos = subway_api_client.filter_by_train_no(positions, train_no)
    
    if not pos:
        return 30
    
    current_station = pos.get("statnNm")
    train_status = pos.get("trainSttus")
    
    # 하차역 도착 확인
    if current_station == end_station:
        # 하차!
        SSEPublisher.publish_bot_alighting(
            route_id=route_id,
            bot_id=bot_state["bot_id"],
            station_name=end_station
        )
        
        next_leg_index = bot_state["current_leg_index"] + 1
        
        if next_leg_index >= len(legs):
            _finish_bot(route_id, bot_state)
            return 30
        
        next_leg = legs[next_leg_index]
        
        if next_leg["mode"] == "WALK":
            BotStateManager.transition_to_walking(route_id, next_leg_index)
        elif next_leg["mode"] == "BUS":
            BotStateManager.transition_to_waiting_bus(route_id, next_leg_index)
        
        return 30
    
    # 현재 역 인덱스 계산
    current_idx = pass_stops.index(current_station) if current_station in pass_stops else 0
    
    SSEPublisher.publish_bot_status_update(
        route_id=route_id,
        bot_state=bot_state,
        vehicle_info={
            "type": "SUBWAY",
            "route": subway_line,
            "trainNo": train_no,
            "current_station": current_station,
            "current_station_index": current_idx,
            "total_stations": len(pass_stops),
            "train_status": train_status
        },
        next_update_in=30
    )
    
    return 30


def _finish_bot(route_id: int, bot_state: dict):
    """봇 경주 종료 처리"""
    BotStateManager.transition_to_finished(route_id)
    
    route = Route.objects.get(id=route_id)
    route.end_time = timezone.now()
    route.duration = (route.end_time - route.start_time).total_seconds()
    route.save()
    
    rank = Route.objects.filter(
        route_itinerary_id=route.route_itinerary_id,
        end_time__isnull=False,
        duration__lt=route.duration
    ).count() + 1
    
    SSEPublisher.publish_participant_finished(
        route_id=route_id,
        participant={
            "route_id": route_id,
            "type": "BOT",
            "bot_id": bot_state["bot_id"]
        },
        rank=rank,
        duration=int(route.duration)
    )
    
    unfinished = Route.objects.filter(
        route_itinerary_id=route.route_itinerary_id,
        end_time__isnull=True
    ).count()
    
    if unfinished == 0:
        SSEPublisher.publish_route_ended(route_id)
    
    BotStateManager.delete(route_id)
```

---

## 6. 경주 시작 API (v3)

```python
# apps/routes/views/route.py

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

from ..models import Route
from ..services.bot_state import BotStateManager
from ..services.id_converter import PublicAPIIdConverter
from ..utils.redis_client import redis_client
from ..tasks.bot_simulation import update_bot_position


class RouteStartView(APIView):
    """경주 시작 API (v3)"""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request, route_id):
        try:
            route = Route.objects.select_related('route_leg').get(id=route_id)
        except Route.DoesNotExist:
            return Response(
                {"error": "Route not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if route.start_time:
            return Response(
                {"error": "Route already started"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        legs = route.route_leg.legs
        
        # 1. TMAP → 공공데이터 ID 변환 (v3 추가)
        try:
            public_ids = PublicAPIIdConverter.convert_legs(legs)
            redis_client.set_public_ids(route_id, public_ids)
        except Exception as e:
            return Response(
                {"error": f"ID conversion failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # 2. 경주 시작 시간 기록
        route.start_time = timezone.now()
        route.status = "RUNNING"
        route.save()
        
        # 3. 봇 초기 상태 생성
        BotStateManager.initialize(
            route_id=route_id,
            bot_id=1,
            legs=legs
        )
        
        # 4. 첫 번째 Task 즉시 실행 (v3: Periodic Task 대신 동적 예약)
        update_bot_position.apply_async(
            args=[route_id],
            countdown=0
        )
        
        return Response({
            "status": "success",
            "message": "Route started",
            "route_id": route_id,
            "start_time": route.start_time.isoformat(),
            "sse_endpoint": f"/api/v1/sse/routes/{route_id}/"
        })
```

---

## 7. 파일 구조

```
project/
├── config/
│   ├── __init__.py
│   ├── settings.py          # 공공데이터 API 설정 추가
│   └── celery.py
│
├── apps/
│   └── routes/
│       ├── __init__.py
│       ├── models.py
│       ├── urls.py
│       │
│       ├── views/
│       │   ├── __init__.py
│       │   ├── route.py               # 경주 시작 API (v3)
│       │   └── sse.py
│       │
│       ├── tasks/
│       │   ├── __init__.py
│       │   └── bot_simulation.py      # Celery Task (v3 - 동적 주기)
│       │
│       ├── services/
│       │   ├── __init__.py
│       │   ├── bot_state.py           # 봇 상태 관리 (v3)
│       │   ├── sse_publisher.py       # SSE 발행 (v3)
│       │   └── id_converter.py        # ID 변환 서비스 (v3 추가)
│       │
│       └── utils/
│           ├── __init__.py
│           ├── redis_client.py        # Redis (v3 - public_ids 추가)
│           ├── rabbitmq_client.py
│           ├── bus_api_client.py      # 버스 API (v3 추가)
│           ├── subway_api_client.py   # 지하철 API (v3 추가)
│           └── geo_utils.py           # 좌표 유틸리티 (v3 추가)
│
├── docker-compose.yml
└── requirements.txt
```

---

## 필요한 패키지 (requirements.txt)

```txt
# Django
Django>=4.2

# Django REST Framework
djangorestframework>=3.14

# Celery
celery>=5.3
django-celery-results>=2.5

# Redis
redis>=5.0
django-redis>=5.4

# RabbitMQ
pika>=1.3

# Database
psycopg2-binary>=2.9

# HTTP 요청 (v3 추가)
requests>=2.31

# 기타
python-dateutil>=2.8
```

---

*문서 버전: v3*
*작성일: 2026-01-16*
