/**
 * 지도 상태 관리 스토어
 * - 마지막 지도 위치/줌 레벨 저장
 * - 지도 스타일 저장 (기본/야간/위성)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 지도 스타일 타입
export type MapStyleType = "default" | "dark" | "satellite-streets";

interface MapState {
  // 마지막 지도 위치 [경도, 위도]
  lastCenter: [number, number] | null;
  // 마지막 줌 레벨
  lastZoom: number | null;
  // 지도 스타일
  mapStyle: MapStyleType;
  // hydration 완료 여부
  hasHydrated: boolean;

  // 액션
  setMapView: (center: [number, number], zoom: number) => void;
  setMapStyle: (style: MapStyleType) => void;
  resetMapState: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useMapStore = create<MapState>()(
  persist(
    (set) => ({
      lastCenter: null,
      lastZoom: null,
      mapStyle: "default" as MapStyleType,
      hasHydrated: false,

      // 지도 위치/줌 저장
      setMapView: (center, zoom) => {
        set({
          lastCenter: center,
          lastZoom: zoom,
        });
      },

      // 지도 스타일 저장
      setMapStyle: (style) => {
        set({ mapStyle: style });
      },

      // 상태 초기화 (로그아웃 시 호출)
      resetMapState: () => {
        set({
          lastCenter: null,
          lastZoom: null,
          mapStyle: "default",
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
