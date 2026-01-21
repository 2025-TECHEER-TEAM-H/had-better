/**
 * 지도 상태 관리 스토어
 * - 마지막 지도 위치/줌 레벨 저장
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MapState {
  // 마지막 지도 위치 [경도, 위도]
  lastCenter: [number, number] | null;
  // 마지막 줌 레벨
  lastZoom: number | null;
  // hydration 완료 여부
  hasHydrated: boolean;

  // 액션
  setMapView: (center: [number, number], zoom: number) => void;
  resetMapState: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      lastCenter: null,
      lastZoom: null,
      hasHydrated: false,

      // 지도 위치/줌 저장
      setMapView: (center, zoom) => {
        set({
          lastCenter: center,
          lastZoom: zoom,
        });
      },

      // 상태 초기화 (로그아웃 시 호출)
      resetMapState: () => {
        set({
          lastCenter: null,
          lastZoom: null,
        });
      },

      setHasHydrated: (state) => {
        set({ hasHydrated: state });
      },
    }),
    {
      name: 'map-storage',
      onRehydrateStorage: () => (state) => {
        // localStorage에서 데이터 로드 완료 시 호출
        state?.setHasHydrated(true);
      },
    }
  )
);
