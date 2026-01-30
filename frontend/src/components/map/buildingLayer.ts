/**
 * 서울 25개 구 3D 건물 레이어 관리
 *
 * 기능:
 * - 뷰포트 기반 동적 로딩: 현재 화면에 보이는 구의 건물만 fetch
 * - 구별 독립 소스/레이어: buildings-{구} / 3d-buildings-{구}
 * - 중복/동시 로딩 방지 (loadedDistricts, loadingDistricts Set)
 * - 한번 로드된 구는 메모리에 유지 (뷰포트 밖이어도 재로딩 방지)
 */

import mapboxgl from "mapbox-gl";

// 서울 25개 구 바운딩박스 (AABB): [minLng, minLat, maxLng, maxLat]
const DISTRICT_BOUNDS: Record<string, [number, number, number, number]> = {
  dobong: [127.0117, 37.6386, 127.0598, 37.6895],
  dongdaemun: [127.0093, 37.5638, 127.0637, 37.5960],
  dongjak: [126.9268, 37.4770, 126.9826, 37.5190],
  eunpyeong: [126.9080, 37.5960, 126.9730, 37.6520],
  gangbuk: [126.9870, 37.6100, 127.0250, 37.6510],
  gangdong: [127.1110, 37.5210, 127.1650, 37.5720],
  gangnam: [127.0170, 37.4800, 127.0830, 37.5280],
  gangseo: [126.8160, 37.5320, 126.8820, 37.5850],
  geumcheon: [126.8820, 37.4390, 126.9280, 37.4750],
  guro: [126.8370, 37.4710, 126.9020, 37.5100],
  gwanak: [126.9050, 37.4440, 126.9650, 37.4880],
  gwangjin: [127.0630, 37.5300, 127.1060, 37.5620],
  jongno: [126.9550, 37.5640, 127.0200, 37.6050],
  junggu: [126.9660, 37.5440, 127.0060, 37.5710],
  jungnang: [127.0560, 37.5810, 127.1080, 37.6180],
  mapo: [126.8870, 37.5370, 126.9550, 37.5740],
  nowon: [127.0460, 37.6190, 127.0980, 37.6680],
  seocho: [126.9760, 37.4500, 127.0430, 37.5050],
  seodaemun: [126.9120, 37.5570, 126.9570, 37.5920],
  seongbuk: [126.9760, 37.5780, 127.0220, 37.6200],
  seongdong: [127.0060, 37.5370, 127.0560, 37.5680],
  songpa: [127.0770, 37.4870, 127.1450, 37.5340],
  yangcheon: [126.8490, 37.5100, 126.8880, 37.5420],
  yeongdeungpo: [126.8790, 37.5080, 126.9340, 37.5460],
  yongsan: [126.9500, 37.5200, 127.0040, 37.5540],
};

// 모든 구 이름 목록
const ALL_DISTRICTS = Object.keys(DISTRICT_BOUNDS);

// 로드된 구 추적
const loadedDistricts = new Set<string>();
// 현재 로딩 중인 구 추적 (동시 fetch 방지)
const loadingDistricts = new Set<string>();

/**
 * 뷰포트가 구의 바운딩박스와 교차하는지 판정
 */
function isDistrictVisible(
  bounds: [number, number, number, number],
  mapBounds: mapboxgl.LngLatBounds,
): boolean {
  const [minLng, minLat, maxLng, maxLat] = bounds;
  const sw = mapBounds.getSouthWest();
  const ne = mapBounds.getNorthEast();

  // AABB 교차 판정
  return !(
    maxLng < sw.lng ||
    minLng > ne.lng ||
    maxLat < sw.lat ||
    minLat > ne.lat
  );
}

/**
 * 개별 구의 3D 건물 소스/레이어 추가
 */
function addDistrictLayer(
  map: mapboxgl.Map,
  district: string,
  data: GeoJSON.GeoJSON,
  style?: string,
): void {
  const sourceId = `buildings-${district}`;
  const layerId = `3d-buildings-${district}`;

  if (map.getSource(sourceId)) return;

  map.addSource(sourceId, {
    type: "geojson",
    data,
  });

  map.addLayer({
    id: layerId,
    source: sourceId,
    type: "fill-extrusion",
    minzoom: 13,
    paint: {
      "fill-extrusion-color":
        style === "dark"
          ? [
              "interpolate",
              ["linear"],
              ["get", "height"],
              0,
              "#1a1a2e",
              20,
              "#16213e",
              50,
              "#0f3460",
              100,
              "#e94560",
            ]
          : [
              "interpolate",
              ["linear"],
              ["get", "height"],
              0,
              "#d4e6d7",
              10,
              "#a8d4ae",
              20,
              "#7bc47f",
              50,
              "#4a9960",
              100,
              "#2d5f3f",
            ],
      "fill-extrusion-height": ["max", ["get", "height"], 8],
      "fill-extrusion-base": 0,
      "fill-extrusion-opacity": style === "dark" ? 0.85 : 0.75,
      "fill-extrusion-vertical-gradient": true,
    },
  });
}

/**
 * 현재 뷰포트에 보이는 구의 GeoJSON을 fetch하여 소스/레이어 추가
 * 이미 로드된 구는 건너뜀
 */
export async function loadVisibleDistricts(
  map: mapboxgl.Map,
  style?: string,
): Promise<void> {
  // zoom 12 미만이면 건너뜀 (minzoom 13이므로 보이지 않음)
  if (map.getZoom() < 12) return;

  const mapBounds = map.getBounds();
  if (!mapBounds) return;

  const promises: Promise<void>[] = [];

  for (const district of ALL_DISTRICTS) {
    // 이미 로드됐거나 로딩 중이면 건너뜀
    if (loadedDistricts.has(district) || loadingDistricts.has(district)) continue;

    const bounds = DISTRICT_BOUNDS[district];
    if (!isDistrictVisible(bounds, mapBounds)) continue;

    // 로딩 시작 표시
    loadingDistricts.add(district);

    const promise = fetch(`/buildings/${district}.geojson`)
      .then((res) => res.json())
      .then((data: GeoJSON.GeoJSON) => {
        // 스타일이 변경되어 map이 무효화될 수 있으므로 확인
        if (!map.getStyle()) return;
        addDistrictLayer(map, district, data, style);
        loadedDistricts.add(district);
      })
      .catch((err) => {
        console.error(`건물 데이터 로드 실패: ${district}`, err);
      })
      .finally(() => {
        loadingDistricts.delete(district);
      });

    promises.push(promise);
  }

  await Promise.all(promises);
}

/**
 * 모든 구의 3D 건물 소스/레이어 제거
 * 3D 끌 때 호출
 */
export function removeAllBuildingLayers(map: mapboxgl.Map): void {
  for (const district of ALL_DISTRICTS) {
    const layerId = `3d-buildings-${district}`;
    const sourceId = `buildings-${district}`;

    try {
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    } catch {
      // 레이어/소스 제거 실패 무시
    }
  }

  // 추적 상태 초기화
  loadedDistricts.clear();
  loadingDistricts.clear();
}

/**
 * 스타일 변경 후 건물 레이어 복원
 * 스타일 변경 시 모든 소스/레이어가 제거되므로 재로딩 필요
 */
export function restoreBuildingLayers(
  map: mapboxgl.Map,
  style?: string,
): void {
  // 스타일 변경 시 기존 추적 초기화 (소스/레이어가 모두 사라짐)
  loadedDistricts.clear();
  loadingDistricts.clear();

  // 현재 뷰포트 기준으로 다시 로드
  loadVisibleDistricts(map, style);
}
