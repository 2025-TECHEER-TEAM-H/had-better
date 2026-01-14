/**
 * 경주 및 경로 관련 타입 정의
 */

import type { Coordinates } from './api';

// 경주 상태
export type RouteStatus = 'PENDING' | 'RUNNING' | 'FINISHED' | 'CANCELED';

// 참가자 타입
export type ParticipantType = 'USER' | 'BOT';

// 이동 수단
export type TransportMode = 'WALK' | 'BUS' | 'SUBWAY' | 'EXPRESSBUS' | 'TRAIN' | 'AIRPLANE' | 'FERRY';

// 봇 상태
export type BotStatus = 'WAITING' | 'ON_VEHICLE' | 'WALKING' | 'FINISHED';

// 경주 참가자
export interface Participant {
  route_id: number;
  type: ParticipantType;
  user_id?: number;
  bot_id?: number;
  name: string;
  nickname?: string;
  leg: RouteLegSummary;
}

// 경로 요약
export interface RouteLegSummary {
  route_leg_id: number;
  summary: string;
  total_time: number;
}

// 경주 생성 요청
export interface CreateRouteRequest {
  route_itinerary_id: number;
  user_leg_id: number;
  bot_leg_ids: number[];
}

// 경주 정보
export interface Route {
  route_id: number;
  route_itinerary_id: number;
  status: RouteStatus;
  route_summary: string;
  is_win?: boolean;
  start_time?: string;
  end_time?: string;
}

// 경주 결과
export interface RouteResult {
  route_id: number;
  route_itinerary_id: number;
  status: RouteStatus;
  start_time: string;
  end_time: string;
  route_info: {
    departure: PlaceInfo;
    arrival: PlaceInfo;
  };
  rankings: RankingEntry[];
  user_result: {
    rank: number;
    is_win: boolean;
    duration: number;
  };
}

// 순위 항목
export interface RankingEntry {
  rank: number;
  route_id: number;
  type: ParticipantType;
  user_id?: number;
  bot_id?: number;
  name: string;
  duration: number;
  end_time: string;
}

// 장소 정보
export interface PlaceInfo {
  name: string;
  lat: number;
  lon: number;
}

// SSE 봇 상태 업데이트
export interface BotStatusUpdate {
  route_id: number;
  bot_id: number;
  status: BotStatus;
  vehicle?: VehicleInfo;
}

// 차량 정보
export interface VehicleInfo {
  type: TransportMode;
  vehicle_id: string;
  route: string;
  route_id: string;
  route_color: string;
  current_station_index: number;
  total_stations: number;
}
