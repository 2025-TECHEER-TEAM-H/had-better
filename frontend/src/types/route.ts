/**
 * 경로 탐색 관련 타입 정의
 */

// 좌표 타입
export interface Coordinates {
  lon: number;
  lat: number;
}

// 요금 정보
export interface FareInfo {
  regular: {
    totalFare: number;
    currency: {
      symbol: string;
      currency: string;
      currencyCode: string;
    };
  };
}

// 경로 구간 요약 (legs 목록용)
export interface RouteLegSummary {
  route_leg_id: number;
  pathType: number; // 1:지하철, 2:버스, 3:버스+지하철
  totalTime: number; // 초
  totalDistance: number; // m
  totalWalkTime: number; // 초
  totalWalkDistance: number; // m
  transferCount: number;
  fare: FareInfo;
}

// 경로 검색 요청
export interface RouteSearchRequest {
  startX: string; // 출발지 경도
  startY: string; // 출발지 위도
  endX: string; // 도착지 경도
  endY: string; // 도착지 위도
  departure_name: string; // 출발지명
  arrival_name: string; // 도착지명
  count?: number; // 경로 개수 (기본 10)
}

// 경로 검색 응답
export interface RouteSearchResponse {
  search_itinerary_history_id: number;
  route_itinerary_id: number;
  requestParameters: {
    startX: string;
    startY: string;
    endX: string;
    endY: string;
  };
  legs: RouteLegSummary[];
  created_at: string;
}

// 이동 구간 상세 정보 (도보/버스/지하철)
export interface LegStep {
  mode: 'WALK' | 'BUS' | 'SUBWAY' | 'EXPRESSBUS' | 'TRAIN';
  sectionTime: number; // 초
  distance: number; // m
  start: {
    name: string;
    lat: number;
    lon: number;
  };
  end: {
    name: string;
    lat: number;
    lon: number;
  };
  route?: string; // 노선명 (대중교통)
  routeId?: string; // 노선 ID
  routeColor?: string; // 노선 색상
  type?: number; // 노선 코드
  passStopList?: {
    stationList: Array<{
      index: number;
      stationID: string;
      stationName: string;
      lon: string;
      lat: string;
    }>;
  };
  passShape?: {
    linestring: string; // "lon1,lat1 lon2,lat2 ..." 형태
  };
  steps?: Array<{
    description: string;
    distance: number;
    streetName?: string;
  }>;
}

// 경로 상세 응답
export interface RouteLegDetailResponse {
  route_leg_id: number;
  route_itinerary_id: number;
  pathType: number;
  totalTime: number;
  totalDistance: number;
  totalWalkTime: number;
  totalWalkDistance: number;
  transferCount: number;
  fare: FareInfo;
  legs: LegStep[];
}

// 검색 기록 응답
export interface SearchItineraryHistoryResponse {
  search_itinerary_history_id: number;
  route_itinerary_id: number;
  departure: { name: string };
  arrival: { name: string };
  legs: RouteLegSummary[];
  created_at: string;
}

// 경로 타입 이름 매핑
export const PATH_TYPE_NAMES: Record<number, string> = {
  1: '지하철',
  2: '버스',
  3: '버스+지하철',
  4: '고속버스',
  5: '기차',
  6: '항공',
  7: '해운',
};

// 이동수단 아이콘 매핑
export const MODE_ICONS: Record<string, string> = {
  WALK: '🚶',
  BUS: '🚌',
  SUBWAY: '🚇',
  EXPRESSBUS: '🚍',
  TRAIN: '🚆',
};

// 지하철 노선 색상 매핑 (서울)
export const SUBWAY_LINE_COLORS: Record<string, string> = {
  '1호선': '#0052A4',
  '2호선': '#00A84D',
  '3호선': '#EF7C1C',
  '4호선': '#00A5DE',
  '5호선': '#996CAC',
  '6호선': '#CD7C2F',
  '7호선': '#747F00',
  '8호선': '#E6186C',
  '9호선': '#BDB092',
  '경의중앙선': '#77C4A3',
  '공항철도': '#0090D2',
  '신분당선': '#D4003B',
};

// 경주 생성 요청
export interface CreateRouteRequest {
  route_itinerary_id: number;
  user_leg_id: number;
  bot_leg_ids: number[];
}

// 경주 참가자 정보
export interface RouteParticipant {
  route_id: number;
  type: 'USER' | 'BOT';
  user_id: number | null;
  bot_id: number | null;
  name: string | null;
  leg: {
    route_leg_id: number;
    summary: string;
    total_time: number;
  };
}

// 경주 생성 응답
export interface CreateRouteResponse {
  route_itinerary_id: number;
  participants: RouteParticipant[];
  status: 'RUNNING' | 'FINISHED' | 'CANCELED';
  start_time: string;
  created_at: string;
  sse_endpoint: string;
}

// 경주 결과 - 참가자 순위 정보
export interface RouteResultRanking {
  rank: number | null;
  route_id: number;
  type: 'USER' | 'BOT';
  duration: number | null; // 초 단위
  end_time: string | null;
  user_id?: number | null;
  bot_id?: number | null;
  name: string | null;
}

// 경주 결과 응답
export interface RouteResultResponse {
  route_id: number;
  route_itinerary_id: number;
  status: 'RUNNING' | 'FINISHED' | 'CANCELED';
  start_time: string;
  end_time: string | null;
  route_info: {
    departure: {
      name: string | null;
      lat: number | null;
      lon: number | null;
    };
    arrival: {
      name: string | null;
      lat: number | null;
      lon: number | null;
    };
  };
  rankings: RouteResultRanking[];
  user_result: {
    rank: number | null;
    is_win: boolean | null;
    duration: number | null;
  };
}

// 경주 상태 타입
export type RouteStatus = 'RUNNING' | 'FINISHED' | 'CANCELED';

// 경주 상태 변경 요청
export interface UpdateRouteStatusRequest {
  status: RouteStatus;
}

// 경주 상태 변경 응답
export interface UpdateRouteStatusResponse {
  route_id: number;
  status: RouteStatus;
  end_time: string | null;
  updated_at: string;
}

// 초를 분으로 변환하는 유틸리티
export function secondsToMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}

// 미터를 킬로미터로 변환하는 유틸리티
export function metersToKilometers(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)}km`;
  }
  return `${meters}m`;
}

// 초를 "N분 N초" 형식으로 변환하는 유틸리티
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes === 0) {
    return `${remainingSeconds}초`;
  }
  if (remainingSeconds === 0) {
    return `${minutes}분`;
  }
  return `${minutes}분 ${remainingSeconds}초`;
}
