/**
 * 즐겨찾기 장소 상태 관리 스토어
 */

import { create } from 'zustand';
import type { SavedPlace, POIPlace } from '../services/savedPlaceService';
import * as savedPlaceService from '../services/savedPlaceService';

interface SavedPlaceState {
  savedPlaces: SavedPlace[];
  isLoading: boolean;
  error: string | null;

  // 액션
  fetchSavedPlaces: (category?: string) => Promise<void>;
  addSavedPlace: (poiPlaceId: number, category?: 'home' | 'work' | 'school', name?: string) => Promise<boolean>;
  removeSavedPlace: (savedPlaceId: number) => Promise<boolean>;
  toggleSavedPlace: (poiPlaceId: number, category?: 'home' | 'work' | 'school', name?: string) => Promise<boolean>;
  isPlaceSaved: (poiPlaceId: number) => boolean;
  getSavedPlaceByPoiId: (poiPlaceId: number) => SavedPlace | null;
  clearError: () => void;
}

export const useSavedPlaceStore = create<SavedPlaceState>((set, get) => ({
  savedPlaces: [],
  isLoading: false,
  error: null,

  fetchSavedPlaces: async (category?: string) => {
    const currentPlaces = get().savedPlaces; // 현재 상태 백업
    set({ isLoading: true, error: null });
    
    try {
      const response = await savedPlaceService.getSavedPlaces(category);
      if (response.status === 'success' && response.data) {
        set({ savedPlaces: response.data, isLoading: false });
        console.log('즐겨찾기 목록 불러오기 성공:', response.data.length, '개');
      } else {
        // 실패해도 기존 데이터 유지 (절대 비우지 않음)
        console.warn('서버 연결 안 됨 (테스트 중) - 즐겨찾기 목록 불러오기 실패, 기존 데이터 유지:', response.error?.message || '알 수 없는 오류');
        set({ savedPlaces: currentPlaces, isLoading: false }); // 기존 데이터 유지
      }
    } catch (error: any) {
      // 네트워크 에러 등 - 기존 데이터 유지 (절대 비우지 않음)
      console.warn('서버 연결 안 됨 (테스트 중) - 즐겨찾기 목록 API 호출 실패, 기존 데이터 유지:', error.message || '알 수 없는 오류');
      set({ savedPlaces: currentPlaces, isLoading: false }); // 기존 데이터 유지
    }
  },

  addSavedPlace: async (poiPlaceId: number, category?: 'home' | 'work' | 'school', name?: string) => {
    // 이미 추가되어 있는지 확인
    const existing = get().getSavedPlaceByPoiId(poiPlaceId);
    if (existing) {
      console.log('이미 즐겨찾기에 추가된 장소입니다:', poiPlaceId);
      return true;
    }

    // 완전한 낙관적 업데이트: 먼저 UI 업데이트
    // saved_place_id는 임시로 사용하되, poi_place.poi_place_id는 정확히 매칭
    const tempId = Date.now(); // 임시 saved_place_id
    const optimisticPlace: SavedPlace = {
      saved_place_id: tempId,
      category: category || null,
      name: name || '',
      poi_place: {
        poi_place_id: poiPlaceId, // 이 값이 isPlaceSaved에서 비교됨
        name: name || '',
        address: '',
        coordinates: { lon: 0, lat: 0 },
      },
      created_at: new Date().toISOString(),
    };

    // 즉시 상태 업데이트 (API 호출 전)
    set((state) => ({
      savedPlaces: [...state.savedPlaces, optimisticPlace],
    }));

    console.log('즐겨찾기 추가 (낙관적 업데이트):', { poiPlaceId, tempId, optimisticPlace });

    // API 호출 (실패해도 UI는 절대 롤백하지 않음)
    try {
      const response = await savedPlaceService.createSavedPlace({
        poi_place_id: poiPlaceId,
        category,
        name,
      });

      if (response.status === 'success' && response.data) {
        // 성공 시 임시 데이터를 실제 데이터로 교체
        set((state) => ({
          savedPlaces: state.savedPlaces.map((sp) =>
            sp.saved_place_id === tempId ? response.data! : sp
          ),
        }));
        console.log('서버 응답 성공 - 실제 데이터로 교체:', response.data);
      } else {
        // 실패해도 UI는 그대로 유지 (롤백 없음)
        console.warn('서버 연결 안 됨 (테스트 중) - 즐겨찾기 추가:', response.error?.message || '알 수 없는 오류');
      }
    } catch (error: any) {
      // 네트워크 에러 등 - UI는 그대로 유지 (롤백 없음)
      console.warn('서버 연결 안 됨 (테스트 중) - 즐겨찾기 추가 API 호출 실패:', error.message || '알 수 없는 오류');
    }

    // 항상 성공으로 반환 (UI는 이미 업데이트됨)
    return true;
  },

  removeSavedPlace: async (savedPlaceId: number) => {
    // 완전한 낙관적 업데이트: 먼저 상태에서 제거
    set((state) => ({
      savedPlaces: state.savedPlaces.filter((p) => p.saved_place_id !== savedPlaceId),
    }));

    // API 호출 (실패해도 UI는 절대 롤백하지 않음)
    try {
      const response = await savedPlaceService.deleteSavedPlace(savedPlaceId);

      if (response.status === 'success') {
        // 성공 - 이미 UI는 업데이트됨
      } else {
        // 실패해도 UI는 그대로 유지 (롤백 없음)
        console.warn('서버 연결 안 됨 (테스트 중) - 즐겨찾기 삭제:', response.error?.message || '알 수 없는 오류');
      }
    } catch (error: any) {
      // 네트워크 에러 등 - UI는 그대로 유지 (롤백 없음)
      console.warn('서버 연결 안 됨 (테스트 중) - 즐겨찾기 삭제 API 호출 실패:', error.message || '알 수 없는 오류');
    }

    // 항상 성공으로 반환 (UI는 이미 업데이트됨)
    return true;
  },

  toggleSavedPlace: async (poiPlaceId: number, category?: 'home' | 'work' | 'school', name?: string) => {
    console.log('toggleSavedPlace 호출됨!', { poiPlaceId, category, name });
    const savedPlace = get().getSavedPlaceByPoiId(poiPlaceId);

    if (savedPlace) {
      // 이미 즐겨찾기 되어 있으면 삭제
      console.log('즐겨찾기 삭제 시도:', savedPlace.saved_place_id);
      return await get().removeSavedPlace(savedPlace.saved_place_id);
    } else {
      // 즐겨찾기 되어 있지 않으면 추가
      console.log('즐겨찾기 추가 시도:', poiPlaceId);
      return await get().addSavedPlace(poiPlaceId, category, name);
    }
  },

  isPlaceSaved: (poiPlaceId: number) => {
    const savedPlaces = get().savedPlaces;
    const isSaved = savedPlaces.some(
      (sp) => sp.poi_place.poi_place_id === poiPlaceId && !sp.deleted_at
    );
    console.log('isPlaceSaved 체크:', { poiPlaceId, isSaved, savedPlaces: savedPlaces.map(sp => ({ id: sp.saved_place_id, poi_id: sp.poi_place.poi_place_id })) });
    return isSaved;
  },

  getSavedPlaceByPoiId: (poiPlaceId: number) => {
    return (
      get().savedPlaces.find(
        (sp) => sp.poi_place.poi_place_id === poiPlaceId && !sp.deleted_at
      ) || null
    );
  },

  clearError: () => {
    set({ error: null });
  },
}));
