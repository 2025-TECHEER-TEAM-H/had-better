/**
 * 장소 관련 API 서비스
 */

import api from "@/lib/api";

// 장소 좌표 타입
interface Coordinates {
  lon: number;
  lat: number;
}

// 장소 검색 결과 타입
export interface PlaceSearchResult {
  poi_place_id: number;
  tmap_poi_id: string;
  name: string;
  address: string;
  category: string;
  coordinates: Coordinates;
}

// 페이지네이션 정보 타입
interface Pagination {
  page: number;
  limit: number;
  total_count: number;
  has_next: boolean;
}

// 장소 검색 응답 타입
interface PlaceSearchResponse {
  status: "success" | "error";
  data?: PlaceSearchResult[];
  meta?: {
    pagination: Pagination;
  };
  error?: {
    code: string;
    message: string;
  };
}

// 장소 상세 정보 타입
export interface PlaceDetail extends PlaceSearchResult {
  is_saved: boolean;
  distance_meters: number | null;
}

// 장소 상세 응답 타입
interface PlaceDetailResponse {
  status: "success" | "error";
  data?: PlaceDetail;
  error?: {
    code: string;
    message: string;
  };
}

// 검색 파라미터 타입
interface SearchParams {
  q: string;
  lat?: number;
  lon?: number;
  page?: number;
  limit?: number;
}

/**
 * 장소 검색 API
 * @param params 검색 파라미터
 * @returns 검색 결과 배열
 */
export async function searchPlaces(params: SearchParams): Promise<PlaceSearchResponse> {
  const response = await api.get<PlaceSearchResponse>("/places/search", {
    params: {
      q: params.q,
      ...(params.lat !== undefined && { lat: params.lat }),
      ...(params.lon !== undefined && { lon: params.lon }),
      ...(params.page !== undefined && { page: params.page }),
      ...(params.limit !== undefined && { limit: params.limit }),
    },
  });
  return response.data;
}

/**
 * 장소 상세 조회 API
 * @param poiPlaceId 장소 ID
 * @param lat 현재 위치 위도 (거리 계산용, 선택)
 * @param lon 현재 위치 경도 (거리 계산용, 선택)
 * @returns 장소 상세 정보
 */
export async function getPlaceDetail(
  poiPlaceId: number,
  lat?: number,
  lon?: number
): Promise<PlaceDetailResponse> {
  const response = await api.get<PlaceDetailResponse>(`/places/${poiPlaceId}`, {
    params: {
      ...(lat !== undefined && { lat }),
      ...(lon !== undefined && { lon }),
    },
  });
  return response.data;
}

// 기본 내보내기
const placeService = {
  searchPlaces,
  getPlaceDetail,
};

export default placeService;
