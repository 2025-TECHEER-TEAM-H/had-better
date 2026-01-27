/**
 * 사용자 GPS 위치 상태 관리 스토어
 * - 현재 GPS 위치 저장
 * - 여러 페이지에서 공유 사용
 */

import { create } from 'zustand';

interface LocationState {
  // 사용자 현재 위치 [경도, 위도]
  userLocation: [number, number] | null;
  // 로딩 상태
  isLoading: boolean;
  // 에러 메시지
  error: string | null;
  // GPS 권한 상태
  permissionStatus: 'granted' | 'denied' | 'prompt' | null;

  // 액션
  setUserLocation: (location: [number, number]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPermissionStatus: (status: 'granted' | 'denied' | 'prompt') => void;
  resetLocationState: () => void;
}

export const useLocationStore = create<LocationState>()((set) => ({
  userLocation: null,
  isLoading: true,
  error: null,
  permissionStatus: null,

  // 위치 설정
  setUserLocation: (location) => {
    set({
      userLocation: location,
      isLoading: false,
      error: null,
    });
  },

  // 로딩 상태 설정
  setIsLoading: (loading) => {
    set({ isLoading: loading });
  },

  // 에러 설정
  setError: (error) => {
    set({
      error,
      isLoading: false,
    });
  },

  // 권한 상태 설정
  setPermissionStatus: (status) => {
    set({ permissionStatus: status });
  },

  // 상태 초기화
  resetLocationState: () => {
    set({
      userLocation: null,
      isLoading: true,
      error: null,
      permissionStatus: null,
    });
  },
}));
