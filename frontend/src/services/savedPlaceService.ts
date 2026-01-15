/**
 * 즐겨찾기 장소 API 서비스
 */

import api from './api';

// API 응답 타입
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    action?: 'restored';
    pagination?: any;
  };
}

// POI 장소 정보
export interface POIPlace {
  poi_place_id: number;
  tmap_poi_id?: string;
  name: string;
  address: string;
  category?: string;
  coordinates: {
    lon: number;
    lat: number;
  };
  is_saved?: boolean;
}

// 즐겨찾기 장소 정보
export interface SavedPlace {
  saved_place_id: number;
  category: 'home' | 'work' | 'school' | null;
  name: string;
  poi_place: POIPlace;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// 즐겨찾기 추가 요청
export interface CreateSavedPlaceRequest {
  poi_place_id: number;
  category?: 'home' | 'work' | 'school';
  name?: string;
}

/**
 * 즐겨찾기 목록 조회
 */
export const getSavedPlaces = async (
  category?: string
): Promise<ApiResponse<SavedPlace[]>> => {
  try {
    const params = category ? { category } : {};
    const response = await api.get<ApiResponse<SavedPlace[]>>('/saved-places', {
      params,
    });
    return response.data;
  } catch (error: any) {
    return {
      status: 'error',
      error: {
        code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
        message: error.response?.data?.error?.message || '즐겨찾기를 불러오는데 실패했습니다.',
      },
    };
  }
};

/**
 * 즐겨찾기 추가
 */
export const createSavedPlace = async (
  data: CreateSavedPlaceRequest
): Promise<ApiResponse<SavedPlace>> => {
  try {
    const response = await api.post<ApiResponse<SavedPlace>>('/saved-places', data);
    return response.data;
  } catch (error: any) {
    return {
      status: 'error',
      error: {
        code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
        message: error.response?.data?.error?.message || '즐겨찾기 추가에 실패했습니다.',
        details: error.response?.data?.error?.details,
      },
    };
  }
};

/**
 * 즐겨찾기 삭제 (Soft Delete)
 */
export const deleteSavedPlace = async (
  savedPlaceId: number
): Promise<ApiResponse<{ saved_place_id: number; deleted_at: string }>> => {
  try {
    const response = await api.delete<ApiResponse<{ saved_place_id: number; deleted_at: string }>>(
      `/saved-places/${savedPlaceId}`
    );
    return response.data;
  } catch (error: any) {
    return {
      status: 'error',
      error: {
        code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
        message: error.response?.data?.error?.message || '즐겨찾기 삭제에 실패했습니다.',
      },
    };
  }
};

/**
 * 즐겨찾기 수정
 */
export const updateSavedPlace = async (
  savedPlaceId: number,
  data: { category?: 'home' | 'work' | 'school' | null; name?: string }
): Promise<ApiResponse<SavedPlace>> => {
  try {
    const response = await api.patch<ApiResponse<SavedPlace>>(
      `/saved-places/${savedPlaceId}`,
      data
    );
    return response.data;
  } catch (error: any) {
    return {
      status: 'error',
      error: {
        code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
        message: error.response?.data?.error?.message || '즐겨찾기 수정에 실패했습니다.',
      },
    };
  }
};
