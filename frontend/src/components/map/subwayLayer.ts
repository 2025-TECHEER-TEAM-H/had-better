/**
 * 지하철 노선도 레이어
 * MapView에서 사용하는 지하철 노선/역 표시 레이어
 */

import mapboxgl from "mapbox-gl";
import metroLineData from "@/data/metro-line.json";
import osmSubwayData from "@/data/subway-lines-osm.json";

// 타입 정의
interface Station {
  line: string;
  name: string;
  station_nm_eng: string;
  fr_code: string;
  station_cd: string;
  lat: number;
  lng: number;
}

interface LineNode {
  station: Station[];
  via: number[][]; // [lat, lng][]
}

interface MetroLine {
  line: string;
  line_name: string;
  line_subname?: string;
  color: string;
  node: LineNode[];
}

interface MetroData {
  VERSION: string;
  DATA: MetroLine[];
}

const data = metroLineData as unknown as MetroData;

// 역 상세 정보 타입
export interface StationInfo {
  name: string;
  nameEng: string;
  line: string;
  lineName: string;
  color: string;
  code: string;
  coordinates: [number, number];
  prevStation: string | null;
  nextStation: string | null;
}

/**
 * 특정 역의 인접 역(이전역, 다음역) 찾기
 * 분기역의 경우 모든 인접역을 찾아서 배열로 반환
 */
function findAdjacentStations(stationName: string, lineName: string): { prev: string[]; next: string[] } {
  const line = data.DATA.find(l => l.line === lineName);
  if (!line) return { prev: [], next: [] };

  const prevStations = new Set<string>();
  const nextStations = new Set<string>();

  // 모든 node를 순회하며 해당 역이 나타나는 모든 위치 찾기
  for (let i = 0; i < line.node.length; i++) {
    const node = line.node[i];
    const stations = node.station;

    // 현재 노드에서 역 찾기
    for (let j = 0; j < stations.length; j++) {
      if (stations[j].name === stationName) {
        // 현재 노드의 첫 번째 역인 경우 (노드 시작점)
        if (j === 0) {
          // 다음역은 같은 노드의 두 번째 역
          if (stations.length > 1 && stations[1].name !== stationName) {
            nextStations.add(stations[1].name);
          }
        }
        // 현재 노드의 두 번째 역인 경우 (노드 종착점)
        else if (j === 1) {
          // 이전역은 같은 노드의 첫 번째 역
          if (stations[0].name !== stationName) {
            prevStations.add(stations[0].name);
          }
        }
      }
    }
  }

  return {
    prev: Array.from(prevStations),
    next: Array.from(nextStations)
  };
}

/**
 * 호선 이름을 짧은 표시용 텍스트로 변환
 * 예: "1호선" -> "1", "공항철도" -> "공항", "신분당선" -> "신분당"
 */
function getLineDisplayText(lineName: string): string {
  // 숫자호선 (1호선 ~ 9호선)
  const numMatch = lineName.match(/^(\d)호선$/);
  if (numMatch) {
    return numMatch[1];
  }

  // 인천 호선
  const incheonMatch = lineName.match(/^인천(\d)호선$/);
  if (incheonMatch) {
    return `인${incheonMatch[1]}`;
  }

  // 특수 노선들 매핑
  const specialLines: Record<string, string> = {
    "공항철도": "공항",
    "경의중앙선": "경의",
    "경춘선": "경춘",
    "경강선": "경강",
    "수인분당선": "수분",
    "신분당선": "신분당",
    "우이신설선": "우이",
    "서해선": "서해",
    "신림선": "신림",
    "김포골드라인": "김포",
    "용인에버라인": "에버",
    "의정부경전철": "의정부",
    "GTXA": "GTX",
  };

  return specialLines[lineName] || lineName.replace("선", "");
}

/**
 * Catmull-Rom 스플라인으로 부드러운 곡선 생성
 * 각 세그먼트 내부에서만 적용 (세그먼트 간 병합 없음)
 */
function catmullRomSpline(
  p0: [number, number],
  p1: [number, number],
  p2: [number, number],
  p3: [number, number],
  numPoints: number = 5
): [number, number][] {
  const points: [number, number][] = [];

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const t2 = t * t;
    const t3 = t2 * t;

    // Catmull-Rom 계수 (tension = 0.5)
    const c0 = -0.5 * t3 + t2 - 0.5 * t;
    const c1 = 1.5 * t3 - 2.5 * t2 + 1;
    const c2 = -1.5 * t3 + 2 * t2 + 0.5 * t;
    const c3 = 0.5 * t3 - 0.5 * t2;

    const x = c0 * p0[0] + c1 * p1[0] + c2 * p2[0] + c3 * p3[0];
    const y = c0 * p0[1] + c1 * p1[1] + c2 * p2[1] + c3 * p3[1];

    points.push([x, y]);
  }

  return points;
}

/**
 * 좌표 배열을 Catmull-Rom 스플라인으로 부드럽게 변환
 * 세그먼트 내부에서만 적용
 */
function smoothCoordinates(coords: [number, number][], pointsPerSegment: number = 5): [number, number][] {
  if (coords.length < 3) return coords; // 3점 미만이면 보간 불필요

  const result: [number, number][] = [];

  for (let i = 0; i < coords.length - 1; i++) {
    // Catmull-Rom은 4개 점이 필요, 경계에서는 점을 복제
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(coords.length - 1, i + 2)];

    const splinePoints = catmullRomSpline(p0, p1, p2, p3, pointsPerSegment);

    // 마지막 세그먼트가 아니면 끝점 제외 (중복 방지)
    if (i < coords.length - 2) {
      result.push(...splinePoints.slice(0, -1));
    } else {
      result.push(...splinePoints);
    }
  }

  return result;
}

// 소스/레이어 ID prefix
const SOURCE_PREFIX = "subway-line-";
const LAYER_PREFIX = "subway-layer-";
const OUTLINE_PREFIX = "subway-outline-";
const STATION_SOURCE = "subway-stations";
const STATION_LAYER = "subway-stations-layer";
const STATION_LABEL_LAYER = "subway-stations-label";
const STATION_NUMBER_LAYER = "subway-stations-number";
const STATION_BAR_SOURCE = "subway-station-bars";
const STATION_BAR_LAYER = "subway-station-bars-layer";
const STATION_BAR_OUTLINE_LAYER = "subway-station-bars-outline";
const OSM_LINE_SOURCE = "subway-osm-lines";
const OSM_LINE_LAYER = "subway-osm-lines-layer";
const OSM_LINE_OUTLINE_LAYER = "subway-osm-lines-outline";

// OSM GeoJSON 데이터 타입
interface OSMFeature {
  type: "Feature";
  properties: {
    line: string;
    color: string;
    segment: number;
    osmId: number;
  };
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
}

interface OSMGeoJSON {
  type: "FeatureCollection";
  metadata: {
    source: string;
    license: string;
    generated: string;
  };
  features: OSMFeature[];
}

const osmData = osmSubwayData as OSMGeoJSON;

/**
 * 노선 데이터를 GeoJSON으로 변환 (스플라인 보간 적용)
 * 각 세그먼트(node) 내부에서만 보간, 세그먼트 간 병합 없음
 */
function convertLineToGeoJSON(lineData: MetroLine) {
  const features = lineData.node.map((node, index) => {
    // via 좌표를 [lng, lat] 형태로 변환 (Mapbox는 lng, lat 순서)
    const rawCoords = node.via.map(([lat, lng]) => [lng, lat] as [number, number]);

    // 3점 이상인 경우에만 스플라인 보간 적용
    const coordinates = rawCoords.length >= 3
      ? smoothCoordinates(rawCoords, 5)
      : rawCoords;

    return {
      type: "Feature" as const,
      properties: {
        line: lineData.line,
        color: lineData.color,
        segment: index,
      },
      geometry: {
        type: "LineString" as const,
        coordinates,
      },
    };
  });

  return {
    type: "FeatureCollection" as const,
    features,
  };
}

/**
 * 모든 역 데이터를 GeoJSON Point로 변환 (중복 제거, OSM 선로 위로 스냅)
 */
function extractAllStationsGeoJSON() {
  const stationMap = new Map<string, Station & {
    color: string;
    lineName: string;
    snappedLng: number;
    snappedLat: number;
  }>();

  data.DATA.forEach((line) => {
    line.node.forEach((node) => {
      node.station.forEach((station) => {
        const key = station.station_cd;
        if (!stationMap.has(key)) {
          // OSM 선로 위의 가장 가까운 점 찾기
          const osmResult = findClosestPointOnOSM(station.lng, station.lat, line.line);

          stationMap.set(key, {
            ...station,
            color: line.color,
            lineName: line.line,
            snappedLng: osmResult ? osmResult.point[0] : station.lng,
            snappedLat: osmResult ? osmResult.point[1] : station.lat,
          });
        }
      });
    });
  });

  const features = Array.from(stationMap.values()).map((station) => ({
    type: "Feature" as const,
    properties: {
      name: station.name,
      nameEng: station.station_nm_eng,
      line: station.lineName,
      code: station.fr_code,
      color: station.color,
      lineNumber: getLineDisplayText(station.lineName),
    },
    geometry: {
      type: "Point" as const,
      coordinates: [station.snappedLng, station.snappedLat],  // 스냅된 좌표 사용
    },
  }));

  return {
    type: "FeatureCollection" as const,
    features,
  };
}

/**
 * 점에서 선분까지의 최단 거리와 선분 위의 가장 가까운 점을 계산
 */
function pointToSegment(
  px: number, py: number,
  x1: number, y1: number,
  x2: number, y2: number
): { distance: number; closestPoint: [number, number] } {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;

  if (lengthSq === 0) {
    // 선분이 점인 경우
    const dist = Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    return { distance: dist, closestPoint: [x1, y1] };
  }

  // 선분 위의 가장 가까운 점의 파라미터 t (0~1 사이로 클램프)
  let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
  t = Math.max(0, Math.min(1, t));

  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;
  const distance = Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);

  return { distance, closestPoint: [closestX, closestY] };
}

/**
 * OSM 선로 데이터에서 특정 좌표에 가장 가까운 지점과 방향 벡터를 찾음
 */
function findClosestPointOnOSM(
  stationLng: number,
  stationLat: number,
  lineName: string
): { point: [number, number]; dx: number; dy: number } | null {
  // 해당 노선의 OSM 세그먼트들 찾기
  const lineSegments = osmData.features.filter(f => f.properties.line === lineName);
  if (lineSegments.length === 0) return null;

  let closestDistance = Infinity;
  let closestResult: { point: [number, number]; dx: number; dy: number } | null = null;

  // 각 세그먼트에서 역 좌표에 가장 가까운 지점 찾기
  for (const segment of lineSegments) {
    const coords = segment.geometry.coordinates;
    for (let i = 0; i < coords.length - 1; i++) {
      const [lng1, lat1] = coords[i];
      const [lng2, lat2] = coords[i + 1];

      const { distance, closestPoint } = pointToSegment(
        stationLng, stationLat,
        lng1, lat1, lng2, lat2
      );

      // 역에서 0.002도(약 200m) 이내의 선분만 고려
      if (distance < 0.002 && distance < closestDistance) {
        closestDistance = distance;
        closestResult = {
          point: closestPoint,
          dx: lng2 - lng1,
          dy: lat2 - lat1,
        };
      }
    }
  }

  return closestResult;
}

/**
 * 역 위치에 짧은 두꺼운 라인 세그먼트 생성 (카카오맵 스타일)
 * OSM 데이터 우선 (좌표도 OSM 선로 위로 스냅), 없으면 via 데이터로 폴백
 */
function extractStationBarsGeoJSON() {
  const features: Array<{
    type: "Feature";
    properties: { name: string; color: string; line: string };
    geometry: { type: "LineString"; coordinates: [number, number][] };
  }> = [];

  // 막대 길이 (경도/위도 단위, 약 30m 정도)
  const barLength = 0.0003;

  // 각 역의 노선 진행 방향과 스냅된 좌표를 저장
  const stationDirections = new Map<string, {
    dx: number;
    dy: number;
    color: string;
    name: string;
    line: string;
    lng: number;
    lat: number;
    snappedLng: number;  // OSM 선로 위로 스냅된 좌표
    snappedLat: number;
  }>();

  data.DATA.forEach((line) => {
    line.node.forEach((node) => {
      node.station.forEach((station) => {
        // OSM 데이터에서 가장 가까운 점과 방향 찾기
        const osmResult = findClosestPointOnOSM(station.lng, station.lat, line.line);

        if (osmResult) {
          // OSM 방향과 스냅된 좌표 사용
          const existing = stationDirections.get(station.station_cd);
          if (existing) {
            // 이미 방향이 있으면 평균
            existing.dx += osmResult.dx;
            existing.dy += osmResult.dy;
          } else {
            stationDirections.set(station.station_cd, {
              dx: osmResult.dx,
              dy: osmResult.dy,
              color: line.color,
              name: station.name,
              line: line.line,
              lng: station.lng,
              lat: station.lat,
              snappedLng: osmResult.point[0],  // OSM 선로 위의 좌표
              snappedLat: osmResult.point[1],
            });
          }
        } else {
          // OSM 데이터 없으면 via 데이터로 폴백
          if (node.via.length < 2) return;

          // 역 인덱스에 따라 방향 계산
          const stationIdx = node.station.indexOf(station);
          let dx: number, dy: number;

          if (stationIdx === 0) {
            const [lat1, lng1] = node.via[0];
            const [lat2, lng2] = node.via[Math.min(1, node.via.length - 1)];
            dx = lng2 - lng1;
            dy = lat2 - lat1;
          } else {
            const lastIdx = node.via.length - 1;
            const [lat1, lng1] = node.via[Math.max(0, lastIdx - 1)];
            const [lat2, lng2] = node.via[lastIdx];
            dx = lng2 - lng1;
            dy = lat2 - lat1;
          }

          const existing = stationDirections.get(station.station_cd);
          if (existing) {
            existing.dx += dx;
            existing.dy += dy;
          } else {
            stationDirections.set(station.station_cd, {
              dx, dy,
              color: line.color,
              name: station.name,
              line: line.line,
              lng: station.lng,
              lat: station.lat,
              snappedLng: station.lng,  // 폴백: 원래 좌표 사용
              snappedLat: station.lat,
            });
          }
        }
      });
    });
  });

  // 각 역에 대해 노선 진행 방향과 평행한 막대 생성 (스냅된 좌표 사용)
  stationDirections.forEach((info) => {
    const { dx, dy, color, name, line: lineName, snappedLng: lng, snappedLat: lat } = info;

    // 방향 벡터 정규화
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) {
      // 방향을 알 수 없으면 수평 막대
      features.push({
        type: "Feature",
        properties: { name, color, line: lineName },
        geometry: {
          type: "LineString",
          coordinates: [
            [lng - barLength, lat],
            [lng + barLength, lat],
          ],
        },
      });
      return;
    }

    // 진행 방향으로 막대 생성 (노선과 평행하게)
    const dirDx = dx / length;
    const dirDy = dy / length;

    // 노선 방향으로 막대 생성
    features.push({
      type: "Feature",
      properties: { name, color, line: lineName },
      geometry: {
        type: "LineString",
        coordinates: [
          [lng - dirDx * barLength, lat - dirDy * barLength],
          [lng + dirDx * barLength, lat + dirDy * barLength],
        ],
      },
    });
  });

  return {
    type: "FeatureCollection" as const,
    features,
  };
}

/**
 * 지하철 노선도 레이어 추가
 */
export function addSubwayLayers(map: mapboxgl.Map) {
  // 이미 추가되어 있으면 스킵
  if (map.getSource(STATION_SOURCE)) return;

  // 1. OSM 노선 레이어 추가 (실제 선형 데이터)
  map.addSource(OSM_LINE_SOURCE, {
    type: "geojson",
    data: osmData as GeoJSON.FeatureCollection,
  });

  // OSM 노선 외곽선 레이어
  map.addLayer({
    id: OSM_LINE_OUTLINE_LAYER,
    type: "line",
    source: OSM_LINE_SOURCE,
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#000000",
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10, 4,
        14, 8,
      ],
      "line-opacity": 0.3,
    },
  });

  // OSM 노선 메인 레이어 (노선 색상 사용)
  map.addLayer({
    id: OSM_LINE_LAYER,
    type: "line",
    source: OSM_LINE_SOURCE,
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": ["get", "color"],
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10, 2,
        14, 5,
      ],
      "line-opacity": 0.9,
    },
  });

  // 2. 기존 노선 레이어 추가 (OSM에 없는 노선용 폴백)
  data.DATA.forEach((line) => {
    // OSM 데이터에 있는 노선은 스킵
    const hasOsmData = osmData.features.some(f => f.properties.line === line.line);
    if (hasOsmData) return;

    const sourceId = `${SOURCE_PREFIX}${line.line}`;
    const layerId = `${LAYER_PREFIX}${line.line}`;
    const outlineId = `${OUTLINE_PREFIX}${line.line}`;

    const geojson = convertLineToGeoJSON(line);

    // 소스 추가
    map.addSource(sourceId, {
      type: "geojson",
      data: geojson,
    });

    // 외곽선 레이어 (두꺼운 검정 배경)
    map.addLayer({
      id: outlineId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#000000",
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10, 4,
          14, 8,
        ],
        "line-opacity": 0.3,
      },
    });

    // 메인 노선 레이어
    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": line.color,
        "line-width": [
          "interpolate",
          ["linear"],
          ["zoom"],
          10, 2,
          14, 5,
        ],
        "line-opacity": 0.9,
      },
    });
  });

  // 2. 역 막대 레이어 추가 (카카오맵 스타일 - 역 위치에서 노선이 두꺼워지는 효과)
  const stationBarsGeoJSON = extractStationBarsGeoJSON();

  map.addSource(STATION_BAR_SOURCE, {
    type: "geojson",
    data: stationBarsGeoJSON,
  });

  // 역 막대 외곽선 (흰색 배경)
  map.addLayer({
    id: STATION_BAR_OUTLINE_LAYER,
    type: "line",
    source: STATION_BAR_SOURCE,
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#ffffff",
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10, 6,
        12, 10,
        14, 14,
        16, 18,
      ],
      "line-opacity": 1,
    },
  });

  // 역 막대 메인 (노선 색상)
  map.addLayer({
    id: STATION_BAR_LAYER,
    type: "line",
    source: STATION_BAR_SOURCE,
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": ["get", "color"],
      "line-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        10, 4,
        12, 7,
        14, 10,
        16, 13,
      ],
      "line-opacity": 1,
    },
  });

  // 3. 역 포인트 레이어 추가 (라벨용)
  const stationsGeoJSON = extractAllStationsGeoJSON();

  map.addSource(STATION_SOURCE, {
    type: "geojson",
    data: stationsGeoJSON,
  });

  // 역 중앙 흰색 원 (호선 번호 배경)
  map.addLayer({
    id: STATION_LAYER,
    type: "circle",
    source: STATION_SOURCE,
    minzoom: 12,
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        12, 6,
        14, 8,
        16, 10,
      ],
      "circle-color": "#ffffff",
      "circle-stroke-color": ["get", "color"],
      "circle-stroke-width": [
        "interpolate",
        ["linear"],
        ["zoom"],
        12, 1.5,
        14, 2,
        16, 2.5,
      ],
    },
  });

  // 역 중앙 호선 번호 표시 (줌 레벨 12 이상에서만 표시)
  map.addLayer({
    id: STATION_NUMBER_LAYER,
    type: "symbol",
    source: STATION_SOURCE,
    minzoom: 12,
    layout: {
      "text-field": ["get", "lineNumber"],
      "text-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        12, 7,
        14, 9,
        16, 11,
      ],
      "text-allow-overlap": true,
      "text-ignore-placement": true,
    },
    paint: {
      "text-color": ["get", "color"],
    },
  });

  // 역명 라벨 (줌 레벨 13 이상에서만 표시)
  map.addLayer({
    id: STATION_LABEL_LAYER,
    type: "symbol",
    source: STATION_SOURCE,
    minzoom: 13,
    layout: {
      "text-field": ["get", "name"],
      "text-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        13, 10,
        16, 14,
      ],
      "text-offset": [0, 1.5],
      "text-anchor": "top",
      "text-allow-overlap": false,
      "text-ignore-placement": false,
    },
    paint: {
      "text-color": "#333333",
      "text-halo-color": "#ffffff",
      "text-halo-width": 2,
    },
  });

  // 역 클릭 이벤트 핸들러 추가
  setupStationClickHandler(map);
}

// 현재 열린 팝업 참조
let currentPopup: mapboxgl.Popup | null = null;

/**
 * 역 클릭 시 팝업 표시 이벤트 핸들러 설정
 */
function setupStationClickHandler(map: mapboxgl.Map) {
  // 역 원/막대 클릭 시 커서 변경
  map.on("mouseenter", STATION_LAYER, () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", STATION_LAYER, () => {
    map.getCanvas().style.cursor = "";
  });
  map.on("mouseenter", STATION_BAR_LAYER, () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", STATION_BAR_LAYER, () => {
    map.getCanvas().style.cursor = "";
  });

  // 역 클릭 이벤트
  map.on("click", STATION_LAYER, (e) => {
    if (!e.features || e.features.length === 0) return;

    const feature = e.features[0];
    const props = feature.properties;
    if (!props) return;

    const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];
    const stationName = props.name;
    const lineName = props.line;
    const color = props.color;

    showStationPopup(map, coordinates, stationName, lineName, color);
  });

  // 역 막대 클릭도 동일하게 처리
  map.on("click", STATION_BAR_LAYER, (e) => {
    if (!e.features || e.features.length === 0) return;

    const feature = e.features[0];
    const props = feature.properties;
    if (!props) return;

    // 막대의 중심점 계산
    const coords = (feature.geometry as GeoJSON.LineString).coordinates;
    const midIdx = Math.floor(coords.length / 2);
    const coordinates = coords[midIdx] as [number, number];

    const stationName = props.name;
    const lineName = props.line;
    const color = props.color;

    showStationPopup(map, coordinates, stationName, lineName, color);
  });
}

/**
 * 역 상세 정보 팝업 표시
 */
function showStationPopup(
  map: mapboxgl.Map,
  coordinates: [number, number],
  stationName: string,
  lineName: string,
  color: string
) {
  // 기존 팝업 닫기
  if (currentPopup) {
    currentPopup.remove();
  }

  // 인접역 찾기
  const { prev, next } = findAdjacentStations(stationName, lineName);

  // 호선 표시 텍스트
  const lineDisplayText = getLineDisplayText(lineName);

  // 이전역/다음역 텍스트 생성 (여러 개인 경우 쉼표로 구분)
  const prevText = prev.length > 0 ? prev.join(', ') : null;
  const nextText = next.length > 0 ? next.join(', ') : null;

  // 팝업 HTML 생성 (카카오맵 스타일)
  const popupHTML = `
    <div class="subway-station-popup" style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-width: 280px;
      padding: 0;
      margin: 0;
    ">
      <!-- 헤더: 노선 색상 배경 -->
      <div style="
        background: ${color};
        color: white;
        padding: 12px 16px;
        border-radius: 12px 12px 0 0;
        display: flex;
        align-items: center;
        gap: 10px;
      ">
        <!-- 호선 번호 타원형 배지 -->
        <div style="
          background: white;
          color: ${color};
          padding: 4px 10px;
          height: 24px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          flex-shrink: 0;
          white-space: nowrap;
        ">${lineDisplayText}</div>
        <!-- 역명 -->
        <div style="
          font-size: 18px;
          font-weight: 700;
        ">${stationName}</div>
      </div>

      <!-- 인접역 정보 -->
      <div style="
        background: white;
        padding: 12px 16px;
        border-radius: 0 0 12px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border: 2px solid ${color};
        border-top: none;
      ">
        <!-- 이전역 -->
        <div style="
          flex: 1;
          min-width: 0;
          text-align: left;
          display: flex;
          align-items: center;
          gap: 4px;
        ">
          ${prevText ? `
            <span style="color: ${color}; font-size: 12px; flex-shrink: 0;">◀</span>
            <span style="color: #666; font-size: 13px; word-break: keep-all;">${prevText}</span>
          ` : `
            <span style="color: #ccc; font-size: 12px; flex-shrink: 0;">◀</span>
            <span style="color: #ccc; font-size: 12px;">시/종착</span>
          `}
        </div>

        <!-- 구분선 -->
        <div style="
          width: 2px;
          height: 20px;
          background: ${color};
          opacity: 0.3;
          flex-shrink: 0;
        "></div>

        <!-- 다음역 -->
        <div style="
          flex: 1;
          min-width: 0;
          text-align: right;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 4px;
        ">
          ${nextText ? `
            <span style="color: #666; font-size: 13px; word-break: keep-all;">${nextText}</span>
            <span style="color: ${color}; font-size: 12px; flex-shrink: 0;">▶</span>
          ` : `
            <span style="color: #ccc; font-size: 12px;">시/종착</span>
            <span style="color: #ccc; font-size: 12px; flex-shrink: 0;">▶</span>
          `}
        </div>
      </div>
    </div>
  `;

  // Mapbox 팝업 생성
  currentPopup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true,
    maxWidth: "350px",
    className: "subway-popup-container",
  })
    .setLngLat(coordinates)
    .setHTML(popupHTML)
    .addTo(map);
}

/**
 * 지하철 노선도 레이어 제거
 */
export function removeSubwayLayers(map: mapboxgl.Map) {
  // 역 레이어/소스 제거
  if (map.getLayer(STATION_LABEL_LAYER)) {
    map.removeLayer(STATION_LABEL_LAYER);
  }
  if (map.getLayer(STATION_NUMBER_LAYER)) {
    map.removeLayer(STATION_NUMBER_LAYER);
  }
  if (map.getLayer(STATION_LAYER)) {
    map.removeLayer(STATION_LAYER);
  }
  if (map.getSource(STATION_SOURCE)) {
    map.removeSource(STATION_SOURCE);
  }

  // 역 막대 레이어/소스 제거
  if (map.getLayer(STATION_BAR_LAYER)) {
    map.removeLayer(STATION_BAR_LAYER);
  }
  if (map.getLayer(STATION_BAR_OUTLINE_LAYER)) {
    map.removeLayer(STATION_BAR_OUTLINE_LAYER);
  }
  if (map.getSource(STATION_BAR_SOURCE)) {
    map.removeSource(STATION_BAR_SOURCE);
  }

  // OSM 노선 레이어/소스 제거
  if (map.getLayer(OSM_LINE_LAYER)) {
    map.removeLayer(OSM_LINE_LAYER);
  }
  if (map.getLayer(OSM_LINE_OUTLINE_LAYER)) {
    map.removeLayer(OSM_LINE_OUTLINE_LAYER);
  }
  if (map.getSource(OSM_LINE_SOURCE)) {
    map.removeSource(OSM_LINE_SOURCE);
  }

  // 폴백 노선 레이어/소스 제거
  data.DATA.forEach((line) => {
    const sourceId = `${SOURCE_PREFIX}${line.line}`;
    const layerId = `${LAYER_PREFIX}${line.line}`;
    const outlineId = `${OUTLINE_PREFIX}${line.line}`;

    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getLayer(outlineId)) {
      map.removeLayer(outlineId);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }
  });
}

/**
 * 지하철 레이어 표시/숨김 토글
 */
export function toggleSubwayLayers(map: mapboxgl.Map, visible: boolean) {
  const visibility = visible ? "visible" : "none";

  // 역 레이어
  if (map.getLayer(STATION_LABEL_LAYER)) {
    map.setLayoutProperty(STATION_LABEL_LAYER, "visibility", visibility);
  }
  if (map.getLayer(STATION_NUMBER_LAYER)) {
    map.setLayoutProperty(STATION_NUMBER_LAYER, "visibility", visibility);
  }
  if (map.getLayer(STATION_LAYER)) {
    map.setLayoutProperty(STATION_LAYER, "visibility", visibility);
  }

  // 역 막대 레이어
  if (map.getLayer(STATION_BAR_LAYER)) {
    map.setLayoutProperty(STATION_BAR_LAYER, "visibility", visibility);
  }
  if (map.getLayer(STATION_BAR_OUTLINE_LAYER)) {
    map.setLayoutProperty(STATION_BAR_OUTLINE_LAYER, "visibility", visibility);
  }

  // OSM 노선 레이어
  if (map.getLayer(OSM_LINE_LAYER)) {
    map.setLayoutProperty(OSM_LINE_LAYER, "visibility", visibility);
  }
  if (map.getLayer(OSM_LINE_OUTLINE_LAYER)) {
    map.setLayoutProperty(OSM_LINE_OUTLINE_LAYER, "visibility", visibility);
  }

  // 폴백 노선 레이어
  data.DATA.forEach((line) => {
    const layerId = `${LAYER_PREFIX}${line.line}`;
    const outlineId = `${OUTLINE_PREFIX}${line.line}`;

    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", visibility);
    }
    if (map.getLayer(outlineId)) {
      map.setLayoutProperty(outlineId, "visibility", visibility);
    }
  });
}

/**
 * 노선 목록 반환
 */
export function getLineList() {
  return data.DATA.map((line) => ({
    name: line.line,
    fullName: line.line_name,
    subName: line.line_subname,
    color: line.color,
  }));
}
