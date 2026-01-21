/**
 * 경로/봇/SSE 관련 타입 정의
 */

// 봇 상태 enum
export type BotStatus =
  | 'WALKING'
  | 'WAITING_BUS'
  | 'RIDING_BUS'
  | 'WAITING_SUBWAY'
  | 'RIDING_SUBWAY'
  | 'FINISHED';

// 이동 수단 타입
export type TransportMode =
  | 'WALK'
  | 'BUS'
  | 'SUBWAY'
  | 'EXPRESSBUS'
  | 'TRAIN'
  | 'AIRPLANE'
  | 'FERRY';

// 좌표 타입
export interface Coordinate {
  lon: number;
  lat: number;
}

// 경로 세그먼트 (개별 구간)
export interface RouteSegment {
  segment_index: number;
  mode: TransportMode;
  section_time: number; // 초
  distance: number; // m
  start_name: string;
  start_lat: number;
  start_lon: number;
  end_name: string;
  end_lat: number;
  end_lon: number;
  route_name: string; // 노선명
  route_color: string; // HEX 색상
  path_coordinates: [number, number][]; // [[lon, lat], ...]
}

// 경로 leg (경로 옵션)
export interface RouteLeg {
  leg_index: number;
  path_type: number;
  total_time: number; // 초
  total_distance: number; // m
  total_walk_time: number;
  total_walk_distance: number;
  transfer_count: number;
  total_fare: number;
  segments: RouteSegment[];
  raw_data?: {
    legs: RawLegData[];
  };
}

// TMAP API 원본 leg 데이터
export interface RawLegData {
  mode: TransportMode;
  sectionTime: number;
  distance: number;
  start: {
    name: string;
    lon: number;
    lat: number;
  };
  end: {
    name: string;
    lon: number;
    lat: number;
  };
  passShape?: {
    linestring: string; // "lon1,lat1 lon2,lat2 ..."
  };
  passStopList?: {
    stationList: {
      stationName: string;
      lon: string;
      lat: string;
    }[];
  };
}

// 경주 참가자 (봇 또는 유저)
export interface RouteParticipant {
  route_id: number;
  type: 'BOT' | 'USER';
  bot_id?: number;
  user_id?: number;
  leg: RouteLeg;
}

// 경주 상태
export type RouteStatus = 'PENDING' | 'RUNNING' | 'FINISHED' | 'CANCELED';

// 경로 탐색 결과 묶음
export interface RouteItinerary {
  route_itinerary_id: number;
  start_x: string; // 출발지 경도
  start_y: string; // 출발지 위도
  end_x: string; // 도착지 경도
  end_y: string; // 도착지 위도
  legs: RouteLeg[];
  created_at: string;
}

// 경주 정보
export interface RouteInfo {
  route_itinerary_id: number;
  status: RouteStatus;
  start_x: string;
  start_y: string;
  end_x: string;
  end_y: string;
  participants: RouteParticipant[];
  created_at: string;
  started_at?: string;
  ended_at?: string;
}

// ========== SSE 이벤트 타입들 ==========

// SSE 이벤트 기본 타입
export interface SSEEventBase {
  timestamp: string;
}

// 차량 정보 (버스/지하철)
export interface VehicleInfo {
  type: 'BUS' | 'SUBWAY';
  route: string; // 노선명
  vehId?: string; // 버스 차량 ID
  trainNo?: string; // 지하철 열차번호
  position?: Coordinate;
  stopFlag?: number; // 정류장 정차 여부
  pass_shape?: [number, number][]; // 경로 보간용 좌표
}

// bot_status_update 이벤트
export interface BotStatusUpdateEvent extends SSEEventBase {
  route_id: number;
  bot_id: number;
  status: BotStatus;
  leg_index: number;
  progress_percent: number; // 0~100
  arrival_time?: number; // 도착 예정 시간 (초)
  next_update_in?: number; // 다음 업데이트까지 시간 (초)
  vehicle?: VehicleInfo;
  position: Coordinate;
}

// bot_boarding 이벤트
export interface BotBoardingEvent extends SSEEventBase {
  route_id: number;
  bot_id: number;
  station_name: string;
  vehicle: VehicleInfo;
}

// bot_alighting 이벤트
export interface BotAlightingEvent extends SSEEventBase {
  route_id: number;
  bot_id: number;
  station_name: string;
  next_action: string;
}

// participant_finished 이벤트
export interface ParticipantFinishedEvent extends SSEEventBase {
  participant: {
    route_id: number;
    type: 'BOT' | 'USER';
    bot_id?: number;
    user_id?: number;
  };
  rank: number;
  duration: number; // 초
}

// route_ended 이벤트
export interface RouteEndedEvent extends SSEEventBase {
  route_itinerary_id: number;
  reason: string;
}

// connected 이벤트
export interface ConnectedEvent extends SSEEventBase {
  route_itinerary_id: number;
  message: string;
}

// heartbeat 이벤트
export interface HeartbeatEvent extends SSEEventBase {
  route_itinerary_id: number;
}

// error 이벤트
export interface ErrorEvent extends SSEEventBase {
  message: string;
}

// 모든 SSE 이벤트 유니온 타입
export type SSEEvent =
  | { event: 'connected'; data: ConnectedEvent }
  | { event: 'bot_status_update'; data: BotStatusUpdateEvent }
  | { event: 'bot_boarding'; data: BotBoardingEvent }
  | { event: 'bot_alighting'; data: BotAlightingEvent }
  | { event: 'participant_finished'; data: ParticipantFinishedEvent }
  | { event: 'route_ended'; data: RouteEndedEvent }
  | { event: 'heartbeat'; data: HeartbeatEvent }
  | { event: 'error'; data: ErrorEvent };

// SSE 이벤트 타입 문자열
export type SSEEventType = SSEEvent['event'];
