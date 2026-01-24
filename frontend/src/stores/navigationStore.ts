/**
 * 경로 안내 네비게이션 상태 관리 스토어
 * - 즐겨찾기 → SearchPage 간 출발지/도착지 전달
 * - 경로 안내 시작 버튼 클릭 시 사용
 */

import { create } from 'zustand';

interface NavigationLocation {
  name: string;
  lat: number;
  lon: number;
}

interface NavigationState {
  // 출발지 (현재 GPS 위치)
  departure: NavigationLocation | null;
  // 도착지 (즐겨찾기 장소)
  arrival: NavigationLocation | null;
  // 네비게이션 요청 여부
  hasNavigationIntent: boolean;
  // 자동으로 경로 검색 실행 여부
  autoSearch: boolean;

  // 액션
  setNavigation: (
    departure: NavigationLocation,
    arrival: NavigationLocation,
    autoSearch?: boolean
  ) => void;
  clearNavigation: () => void;
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  departure: null,
  arrival: null,
  hasNavigationIntent: false,
  autoSearch: false,

  // 네비게이션 설정 (출발지, 도착지, 자동 검색 여부)
  setNavigation: (departure, arrival, autoSearch = true) => {
    set({
      departure,
      arrival,
      hasNavigationIntent: true,
      autoSearch,
    });
  },

  // 네비게이션 정보 초기화 (SearchPage에서 소비 후)
  clearNavigation: () => {
    set({
      departure: null,
      arrival: null,
      hasNavigationIntent: false,
      autoSearch: false,
    });
  },
}));
