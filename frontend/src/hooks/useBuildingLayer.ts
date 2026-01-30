/**
 * 3D 건물 레이어 React 훅
 *
 * moveend 이벤트로 뷰포트 변경 감지 → 보이는 구의 건물 동적 로딩
 * enabled=true: moveend 리스너 등록 + 즉시 로드
 * enabled=false: 리스너 해제 + 레이어 전부 제거
 */

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import {
  loadVisibleDistricts,
  removeAllBuildingLayers,
  restoreBuildingLayers,
} from "@/components/map/buildingLayer";

export function useBuildingLayer(
  map: mapboxgl.Map | null | undefined,
  enabled: boolean,
  style?: string,
): void {
  const styleRef = useRef(style);
  styleRef.current = style;

  useEffect(() => {
    if (!map) return;

    if (!enabled) {
      removeAllBuildingLayers(map);
      return;
    }

    // 즉시 로드
    if (map.isStyleLoaded()) {
      loadVisibleDistricts(map, styleRef.current);
    } else {
      map.once("style.load", () => {
        loadVisibleDistricts(map, styleRef.current);
      });
    }

    // moveend 리스너 등록
    const onMoveEnd = () => {
      loadVisibleDistricts(map, styleRef.current);
    };
    map.on("moveend", onMoveEnd);

    return () => {
      map.off("moveend", onMoveEnd);
    };
  }, [map, enabled]);
}

export { restoreBuildingLayers };
