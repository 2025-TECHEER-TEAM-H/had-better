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
  save_history?: boolean; // 검색 기록 저장 여부 (기본값: true)
}

// 즐겨찾기 타입
export interface SavedPlace {
  saved_place_id: number;
  category: "home" | "work" | "school" | null;
  poi_place: {
    poi_place_id: number;
    name: string;
    address: string;
    coordinates: Coordinates;
  };
  created_at: string;
}

// 즐겨찾기 목록 응답 타입
interface SavedPlaceListResponse {
  status: "success" | "error";
  data?: SavedPlace[];
  error?: {
    code: string;
    message: string;
  };
}

// 즐겨찾기 추가 요청 타입
interface AddSavedPlaceRequest {
  poi_place_id: number;
  category?: "home" | "work" | "school" | null;
}

// 즐겨찾기 추가 응답 타입
interface SavedPlaceResponse {
  status: "success" | "error";
  data?: {
    saved_place_id: number;
    poi_place_id: number;
    category: "home" | "work" | "school" | null;
    name: string;
    created_at: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

// 최근 검색 기록 타입
export interface SearchPlaceHistory {
  id: number;
  keyword: string;
  created_at: string;
}

// 최근 검색 기록 목록 응답 타입
interface SearchPlaceHistoryListResponse {
  status: "success" | "error";
  data?: SearchPlaceHistory[];
  error?: {
    code: string;
    message: string;
  };
}

// 즐겨찾기 삭제 응답 타입
interface DeleteSavedPlaceResponse {
  status: "success" | "error";
  data?: {
    saved_place_id: number;
    deleted_at: string;
  };
  error?: {
    code: string;
    message: string;
  };
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
      ...(params.save_history !== undefined && { save_history: params.save_history }),
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

/**
 * 즐겨찾기 목록 조회 API
 * @param category 카테고리 필터 (선택)
 * @returns 즐겨찾기 목록
 */
export async function getSavedPlaces(category?: string): Promise<SavedPlaceListResponse> {
  const response = await api.get<SavedPlaceListResponse>("/saved-places", {
    params: category ? { category } : {},
  });
  return response.data;
}

/**
 * 즐겨찾기 추가 API
 * @param data 즐겨찾기 추가 요청 데이터
 * @returns 즐겨찾기 정보
 */
export async function addSavedPlace(data: AddSavedPlaceRequest): Promise<SavedPlaceResponse> {
  const response = await api.post<SavedPlaceResponse>("/saved-places", data);
  return response.data;
}

/**
 * 즐겨찾기 삭제 API
 * @param savedPlaceId 즐겨찾기 ID
 * @returns 삭제 결과
 */
export async function deleteSavedPlace(savedPlaceId: number): Promise<DeleteSavedPlaceResponse> {
  const response = await api.delete<DeleteSavedPlaceResponse>(`/saved-places/${savedPlaceId}`);
  return response.data;
}

/**
 * 최근 장소 검색 기록 목록 조회 API
 * @returns 최근 검색 기록 배열
 */
export async function getSearchPlaceHistories(): Promise<SearchPlaceHistoryListResponse> {
  const response = await api.get<SearchPlaceHistoryListResponse>("/places/search-histories");
  return response.data;
}

/**
 * 최근 장소 검색 기록 전체 삭제 API
 */
export async function clearSearchPlaceHistories(): Promise<void> {
  await api.delete("/places/search-histories");
}

/**
 * 최근 장소 검색 기록 단건 삭제 API
 * @param historyId 검색 기록 ID
 */
export async function deleteSearchPlaceHistory(historyId: number): Promise<void> {
  const response = await api.delete<{ status: "success" | "error"; data?: { id: number }; error?: { code: string; message: string } }>(`/places/search-histories/${historyId}`);
  if (response.data.status === "error") {
    throw new Error(response.data.error?.message || "검색 기록 삭제에 실패했습니다.");
  }
}

// 기본 내보내기
const placeService = {
  searchPlaces,
  getPlaceDetail,
  getSavedPlaces,
  addSavedPlace,
  deleteSavedPlace,
  getSearchPlaceHistories,
  clearSearchPlaceHistories,
  deleteSearchPlaceHistory,
};

export default placeService;
