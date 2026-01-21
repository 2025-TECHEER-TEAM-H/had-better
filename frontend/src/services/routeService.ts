/**
 * 경로/경주 관련 API 서비스
 */

import api from '@/lib/api';
import type {
  RouteInfo,
  RouteItinerary,
  RouteLeg,
  RouteParticipant,
  RouteStatus,
} from '@/types/route';

// API 응답 기본 타입
interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// 경로 탐색 요청
interface SearchItineraryRequest {
  start_x: string; // 출발지 경도
  start_y: string; // 출발지 위도
  end_x: string; // 도착지 경도
  end_y: string; // 도착지 위도
}

// 경로 탐색 응답
interface SearchItineraryResponse {
  route_itinerary_id: number;
  legs: RouteLeg[];
}

// 경주 생성 요청
interface CreateRouteRequest {
  route_itinerary_id: number;
  user_leg_index: number; // 사용자가 선택한 경로
  bot_leg_indices: number[]; // 봇들이 사용할 경로 인덱스들
}

// 경주 생성 응답
interface CreateRouteResponse {
  route_itinerary_id: number;
  status: RouteStatus;
  participants: RouteParticipant[];
  sse_endpoint: string;
  start_time: string;
}

// 경주 상태 업데이트 요청
interface UpdateRouteStatusRequest {
  status: RouteStatus;
}

/**
 * 경로 탐색 API
 * 출발지와 도착지를 기반으로 대중교통 경로를 탐색합니다.
 */
export async function searchItinerary(
  data: SearchItineraryRequest
): Promise<ApiResponse<SearchItineraryResponse>> {
  const response = await api.post<ApiResponse<SearchItineraryResponse>>(
    '/itineraries/search',
    data
  );
  return response.data;
}

/**
 * 경로 상세 조회 API
 */
export async function getItinerary(
  routeItineraryId: number
): Promise<ApiResponse<RouteItinerary>> {
  const response = await api.get<ApiResponse<RouteItinerary>>(
    `/itineraries/${routeItineraryId}`
  );
  return response.data;
}

/**
 * 경주 생성 API
 * 사용자와 봇이 경쟁하는 경주를 생성합니다.
 */
export async function createRoute(
  data: CreateRouteRequest
): Promise<ApiResponse<CreateRouteResponse>> {
  const response = await api.post<ApiResponse<CreateRouteResponse>>(
    '/routes',
    data
  );
  return response.data;
}

/**
 * 경주 상세 조회 API
 */
export async function getRoute(
  routeItineraryId: number
): Promise<ApiResponse<RouteInfo>> {
  const response = await api.get<ApiResponse<RouteInfo>>(
    `/routes/${routeItineraryId}`
  );
  return response.data;
}

/**
 * 경주 상태 업데이트 API
 * 경주 취소, 종료 등 상태 변경
 */
export async function updateRouteStatus(
  routeItineraryId: number,
  data: UpdateRouteStatusRequest
): Promise<ApiResponse<RouteInfo>> {
  const response = await api.patch<ApiResponse<RouteInfo>>(
    `/routes/${routeItineraryId}`,
    data
  );
  return response.data;
}

/**
 * 사용자 도착 알림 API
 * 사용자가 목적지에 도착했음을 서버에 알립니다.
 */
export async function notifyUserArrival(
  routeItineraryId: number
): Promise<ApiResponse<{ rank: number; duration: number }>> {
  const response = await api.post<
    ApiResponse<{ rank: number; duration: number }>
  >(`/routes/${routeItineraryId}/arrive`);
  return response.data;
}

/**
 * 경주 결과 조회 API
 */
export async function getRouteResult(
  routeItineraryId: number
): Promise<
  ApiResponse<{
    rankings: Array<{
      participant_type: 'USER' | 'BOT';
      participant_id: number;
      rank: number;
      duration: number;
      arrived_at: string;
    }>;
  }>
> {
  const response = await api.get(`/routes/${routeItineraryId}/result`);
  return response.data;
}

// 기본 내보내기
const routeService = {
  searchItinerary,
  getItinerary,
  createRoute,
  getRoute,
  updateRouteStatus,
  notifyUserArrival,
  getRouteResult,
};

export default routeService;
