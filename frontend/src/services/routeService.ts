/**
 * 경로/경주 관련 API 서비스
 */

import api from '@/lib/api';
import type {
  RouteSearchRequest,
  RouteSearchResponse,
  RouteLegDetailResponse,
  SearchItineraryHistoryResponse,
  RouteResultResponse,
  CreateRouteRequest,
  CreateRouteResponse,
  UpdateRouteStatusRequest,
  UpdateRouteStatusResponse,
  RouteInfo,
  RouteItinerary,
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

/**
 * 경로 검색 API
 * @param request 경로 검색 요청 파라미터
 * @returns 경로 검색 결과
 */
export async function searchRoutes(
  request: RouteSearchRequest
): Promise<RouteSearchResponse> {
  const response = await api.post<ApiResponse<RouteSearchResponse>>(
    '/itineraries/search',
    request
  );

  if (response.data.status === 'error') {
    throw new Error(response.data.error?.message || '경로 검색에 실패했습니다.');
  }

  return response.data.data!;
}

/**
 * 경로 상세 조회 API
 * @param routeLegId 경로 ID
 * @returns 경로 상세 정보
 */
export async function getRouteLegDetail(
  routeLegId: number
): Promise<RouteLegDetailResponse> {
  const response = await api.get<ApiResponse<RouteLegDetailResponse>>(
    `/itineraries/legs/${routeLegId}`
  );

  if (response.data.status === 'error') {
    throw new Error(response.data.error?.message || '경로 상세 조회에 실패했습니다.');
  }

  return response.data.data!;
}

/**
 * 경로 탐색 결과 조회 API
 */
export async function getItinerary(
  routeItineraryId: number
): Promise<RouteItinerary> {
  const response = await api.get<ApiResponse<RouteItinerary>>(
    `/itineraries/${routeItineraryId}`
  );

  if (response.data.status === 'error') {
    throw new Error(response.data.error?.message || '경로 조회에 실패했습니다.');
  }

  return response.data.data!;
}

/**
 * 검색 기록 조회 API
 * @param searchItineraryHistoryId 검색 기록 ID
 * @returns 검색 기록 상세
 */
export async function getSearchItineraryHistory(
  searchItineraryHistoryId: number
): Promise<SearchItineraryHistoryResponse> {
  const response = await api.get<ApiResponse<SearchItineraryHistoryResponse>>(
    `/itineraries/search/${searchItineraryHistoryId}`
  );

  if (response.data.status === 'error') {
    throw new Error(response.data.error?.message || '검색 기록 조회에 실패했습니다.');
  }

  return response.data.data!;
}

/**
 * 경주 생성 (시작) API
 * @param request 경주 생성 요청 (route_itinerary_id, user_leg_id, bot_leg_ids)
 * @returns 경주 생성 결과 (참가자 정보, SSE 엔드포인트 등)
 */
export async function createRoute(
  request: CreateRouteRequest
): Promise<CreateRouteResponse> {
  const response = await api.post<ApiResponse<CreateRouteResponse>>(
    '/routes',
    request
  );

  if (response.data.status === 'error') {
    throw new Error(response.data.error?.message || '경주 생성에 실패했습니다.');
  }

  return response.data.data!;
}

/**
 * 경주 상세 조회 API
 */
export async function getRoute(
  routeItineraryId: number
): Promise<RouteInfo> {
  const response = await api.get<ApiResponse<RouteInfo>>(
    `/routes/${routeItineraryId}`
  );

  if (response.data.status === 'error') {
    throw new Error(response.data.error?.message || '경주 조회에 실패했습니다.');
  }

  return response.data.data!;
}

/**
 * 경주 결과 조회 API
 * @param routeId 경주(Route) ID
 * @returns 경주 결과 (순위, duration 등)
 */
export async function getRouteResult(
  routeId: number
): Promise<RouteResultResponse> {
  const response = await api.get<ApiResponse<RouteResultResponse>>(
    `/routes/${routeId}/result`
  );

  if (response.data.status === 'error') {
    throw new Error(response.data.error?.message || '경주 결과 조회에 실패했습니다.');
  }

  return response.data.data!;
}

/**
 * 경주 상태 변경 API
 * @param routeId 경주(Route) ID
 * @param request 상태 변경 요청 (FINISHED, CANCELED)
 * @returns 변경된 경주 상태
 */
export async function updateRouteStatus(
  routeId: number,
  request: UpdateRouteStatusRequest
): Promise<UpdateRouteStatusResponse> {
  const response = await api.patch<ApiResponse<UpdateRouteStatusResponse>>(
    `/routes/${routeId}`,
    request
  );

  if (response.data.status === 'error') {
    throw new Error(response.data.error?.message || '경주 상태 변경에 실패했습니다.');
  }

  return response.data.data!;
}

/**
 * 사용자 도착 알림 API
 * 사용자가 목적지에 도착했음을 서버에 알립니다.
 */
export async function notifyUserArrival(
  routeItineraryId: number
): Promise<{ rank: number; duration: number }> {
  const response = await api.post<
    ApiResponse<{ rank: number; duration: number }>
  >(`/routes/${routeItineraryId}/arrive`);

  if (response.data.status === 'error') {
    throw new Error(response.data.error?.message || '도착 알림에 실패했습니다.');
  }

  return response.data.data!;
}

// 기본 내보내기
const routeService = {
  searchRoutes,
  getRouteLegDetail,
  getItinerary,
  getSearchItineraryHistory,
  createRoute,
  getRoute,
  getRouteResult,
  updateRouteStatus,
  notifyUserArrival,
};

export default routeService;
