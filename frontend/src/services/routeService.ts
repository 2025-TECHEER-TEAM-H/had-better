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

// 기본 내보내기
const routeService = {
  searchRoutes,
  getRouteLegDetail,
  getSearchItineraryHistory,
};

export default routeService;
