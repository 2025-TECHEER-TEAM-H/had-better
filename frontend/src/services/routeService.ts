/**
 * 경로 탐색 API 서비스
 *
 * - VITE_USE_MOCK_DATA=true: Mock 데이터 사용
 * - VITE_USE_MOCK_DATA=false 또는 미설정: 실제 API 호출
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
} from '@/types/route';
import {
  mockRouteSearchResponse,
  mockRouteLegDetails,
} from '@/mocks/routeData';

// Mock 데이터 사용 여부
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// API 응답 타입
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
  // Mock 데이터 사용
  if (USE_MOCK_DATA) {
    console.log('[Mock] 경로 검색 API 호출:', request);
    // 약간의 지연을 주어 실제 API 호출처럼 느끼게 함
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 요청 파라미터를 mock 응답에 반영
    return {
      ...mockRouteSearchResponse,
      requestParameters: {
        startX: request.startX,
        startY: request.startY,
        endX: request.endX,
        endY: request.endY,
      },
      created_at: new Date().toISOString(),
    };
  }

  // 실제 API 호출
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
  // Mock 데이터 사용
  if (USE_MOCK_DATA) {
    console.log('[Mock] 경로 상세 조회 API 호출:', routeLegId);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const detail = mockRouteLegDetails[routeLegId];
    if (!detail) {
      throw new Error(`경로 ID ${routeLegId}를 찾을 수 없습니다.`);
    }
    return detail;
  }

  // 실제 API 호출
  const response = await api.get<ApiResponse<RouteLegDetailResponse>>(
    `/itineraries/legs/${routeLegId}`
  );

  if (response.data.status === 'error') {
    throw new Error(response.data.error?.message || '경로 상세 조회에 실패했습니다.');
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
  // Mock 데이터 사용
  if (USE_MOCK_DATA) {
    console.log('[Mock] 검색 기록 조회 API 호출:', searchItineraryHistoryId);
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      search_itinerary_history_id: mockRouteSearchResponse.search_itinerary_history_id,
      route_itinerary_id: mockRouteSearchResponse.route_itinerary_id,
      departure: { name: '명동역' },
      arrival: { name: '이태원역' },
      legs: mockRouteSearchResponse.legs,
      created_at: mockRouteSearchResponse.created_at,
    };
  }

  // 실제 API 호출
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
  // Mock 데이터 사용
  if (USE_MOCK_DATA) {
    console.log('[Mock] 경주 생성 API 호출:', request);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const now = new Date().toISOString();
    return {
      route_itinerary_id: request.route_itinerary_id,
      participants: [
        {
          route_id: 1,
          type: 'USER',
          user_id: 1,
          bot_id: null,
          name: '나',
          leg: {
            route_leg_id: request.user_leg_id,
            summary: '지하철',
            total_time: 1800,
          },
        },
        ...request.bot_leg_ids.map((legId, index) => ({
          route_id: 100 + index + 1,
          type: 'BOT' as const,
          user_id: null,
          bot_id: index + 1,
          name: `Bot ${index + 1}`,
          leg: {
            route_leg_id: legId,
            summary: '버스',
            total_time: 1900 + index * 300,
          },
        })),
      ],
      status: 'RUNNING',
      start_time: now,
      created_at: now,
      sse_endpoint: `/api/v1/sse/routes/${request.route_itinerary_id}`,
    };
  }

  // 실제 API 호출
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
 * 경주 결과 조회 API
 * @param routeId 경주(Route) ID
 * @returns 경주 결과 (순위, duration 등)
 */
export async function getRouteResult(
  routeId: number
): Promise<RouteResultResponse> {
  // Mock 데이터 사용
  if (USE_MOCK_DATA) {
    console.log('[Mock] 경주 결과 조회 API 호출:', routeId);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock 결과 데이터
    return {
      route_id: routeId,
      route_itinerary_id: 1,
      status: 'FINISHED',
      start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30분 전
      end_time: new Date().toISOString(),
      route_info: {
        departure: { name: '명동역', lat: 37.5636, lon: 126.9869 },
        arrival: { name: '이태원역', lat: 37.5345, lon: 126.9946 },
      },
      rankings: [
        { rank: 1, route_id: routeId, type: 'USER', duration: 1110, end_time: new Date().toISOString(), user_id: 1, name: '나' },
        { rank: 2, route_id: 101, type: 'BOT', duration: 1190, end_time: new Date().toISOString(), bot_id: 1, name: 'Bot 1' },
        { rank: 3, route_id: 102, type: 'BOT', duration: 1695, end_time: new Date().toISOString(), bot_id: 2, name: 'Bot 2' },
      ],
      user_result: {
        rank: 1,
        is_win: true,
        duration: 1110,
      },
    };
  }

  // 실제 API 호출
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
  // Mock 데이터 사용
  if (USE_MOCK_DATA) {
    console.log('[Mock] 경주 상태 변경 API 호출:', routeId, request);
    await new Promise((resolve) => setTimeout(resolve, 300));

    const now = new Date().toISOString();
    return {
      route_id: routeId,
      status: request.status,
      end_time: request.status === 'FINISHED' || request.status === 'CANCELED' ? now : null,
      updated_at: now,
    };
  }

  // 실제 API 호출
  const response = await api.patch<ApiResponse<UpdateRouteStatusResponse>>(
    `/routes/${routeId}`,
    request
  );

  if (response.data.status === 'error') {
    throw new Error(response.data.error?.message || '경주 상태 변경에 실패했습니다.');
  }

  return response.data.data!;
}

// 기본 내보내기
const routeService = {
  searchRoutes,
  getRouteLegDetail,
  getSearchItineraryHistory,
  createRoute,
  getRouteResult,
  updateRouteStatus,
};

export default routeService;
