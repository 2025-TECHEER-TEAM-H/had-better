import { Map as MapboxMap, GeoJSONSource } from "mapbox-gl";

export type LngLat = [number, number];

// Navi 상태 타입
export type NaviState = "walking" | "idle" | "arrive";

// Navi 레이어 추가
export function addNaviLayer(map: MapboxMap, initial: LngLat): void {
  // 소스가 없으면 추가
  if (!map.getSource("navi")) {
    map.addSource("navi", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { bearing: 0, walkFrame: 0, state: "idle" },
            geometry: { type: "Point", coordinates: initial },
          },
        ],
      },
    });
  }

  // 레이어가 없으면 추가
  if (!map.getLayer("navi")) {
    map.addLayer({
      id: "navi",
      type: "symbol",
      source: "navi",
      layout: {
        "icon-image": [
          "case",
          // 도착 상태
          ["==", ["get", "state"], "arrive"],
          "navi-arrive",
          // 대기 상태
          ["==", ["get", "state"], "idle"],
          "navi-idle",
          // 걷기 상태 (프레임 애니메이션)
          [
            "match",
            ["get", "walkFrame"],
            0, "navi-walk-0",
            1, "navi-walk-1",
            2, "navi-walk-2",
            "navi-walk-3",
          ],
        ],
        "icon-size": 0.6,
        "icon-anchor": "bottom",
        "icon-allow-overlap": true,
        // icon-rotate 제거: 캐릭터가 항상 위를 향함
      },
    });
  }
}

// Navi 위치/상태 업데이트
export function updateNaviFeature(
  map: MapboxMap,
  coord: LngLat,
  bearing: number,
  walkFrame: number,
  state: NaviState = "walking"
): void {
  const src = map.getSource("navi") as GeoJSONSource | undefined;
  if (!src) {
    console.warn('⚠️ updateNaviFeature: navi 소스를 찾을 수 없음');
    return;
  }

  src.setData({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { bearing, walkFrame, state },
        geometry: { type: "Point", coordinates: coord },
      },
    ],
  });
}

// Navi 레이어 제거
export function removeNaviLayer(map: MapboxMap): void {
  if (map.getLayer("navi")) {
    map.removeLayer("navi");
  }
  if (map.getSource("navi")) {
    map.removeSource("navi");
  }
}
