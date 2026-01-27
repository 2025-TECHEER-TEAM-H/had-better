import { addBusLayers, addBusRoutePath, clearAllBusRoutePaths, clearBusData, removeBusLayers, toggleBusLayers, updateAllBusPositions } from "@/components/map/busLayer";
import { addSubwayLayers, removeSubwayLayers, toggleSubwayLayers } from "@/components/map/subwayLayer";
import { getBusRoutePath, trackBusPositions } from "@/lib/api";
import { useMapStore, type MapStyleType } from "@/stores/mapStore";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

// 마커 이미지 import
import departureMarkerImg from "@/assets/markers/departure-marker.png";
import arrivalMarkerImg from "@/assets/markers/arrival-marker.png";

type PageType = "map" | "search" | "favorites" | "subway" | "route" | "routeDetail" | "background";

// 지도 스타일 정보
const MAP_STYLES: Record<MapStyleType, { url: string; name: string; icon: string }> = {
  default: {
    url: "mapbox://styles/mapbox/outdoors-v12",
    name: "기본 지도",
    icon: "🗺️",
  },
  dark: {
    url: "mapbox://styles/mapbox/navigation-night-v1",
    name: "야간 모드",
    icon: "🌙",
  },
  "satellite-streets": {
    url: "mapbox://styles/mapbox/satellite-streets-v12",
    name: "위성 지도",
    icon: "🛰️",
  },
};

// 마커 정보 타입
interface MarkerInfo {
  id: string;
  coordinates: [number, number]; // [경도, 위도]
  name: string;
  icon?: string;
  // 있으면 라벨에 2줄로 표시(없으면 name만 표시). 다른 파일 수정 없이 optional로 둠.
  address?: string;
}

// 정류장/역 마커 정보 타입
export interface StationMarker {
  id: string;
  coordinates: [number, number]; // [경도, 위도]
  name: string;
  stationID?: string;
  mode: 'BUS' | 'SUBWAY';
}

// 경로 라인 정보 타입
export interface RouteLineInfo {
  id: string;
  coordinates: [number, number][]; // [[경도, 위도], ...]
  color: string;
  width?: number;
  opacity?: number;
  summary?: {
    time: number;
    distance: string;
  };
  transferPoints?: Array<{
    coordinates: [number, number];
    fromMode: string; // 이전 교통수단: 'BUS', 'SUBWAY', 'WALK'
    toMode: string; // 다음 교통수단: 'BUS', 'SUBWAY', 'WALK'
    name: string;
    status?: 'expected' | 'confirmed' | 'failed'; // 환승 상태 (기본값: expected)
  }>;
  boardingAlightingPoints?: Array<{
    coordinates: [number, number];
    name: string;
    type: 'boarding' | 'alighting';
  }>;
  isSelected?: boolean; // 선택된 경로인지 여부
  walkSegments?: Array<{
    coordinates: [number, number][]; // 도보 구간 좌표
  }>; // 도보 구간 좌표 (점선으로 표시)
  playerName?: string; // 플레이어 이름
}

// 출발지/도착지 마커 타입
export interface EndpointMarker {
  type: 'departure' | 'arrival';
  coordinates: [number, number];
  name: string;
}

// 플레이어 마커 타입 (유저/봇 위치 표시용)
export interface PlayerMarker {
  id: string; // 'user' | 'bot1' | 'bot2'
  coordinates: [number, number];
  icon: string; // 이모지
  color: string; // 배경색
  label?: string; // 라벨 (선택)
}

// 이동 수단 마커 타입 (버스/걷기 시작 지점 표시용)
export interface TransportModeMarker {
  id: string;
  coordinates: [number, number];
  mode: 'BUS' | 'EXPRESSBUS' | 'SUBWAY' | 'WALK';
  player: string; // 'user' | 'bot1' | 'bot2'
}

interface MapViewProps {
  onNavigate?: (page: PageType) => void;
  /**
   * 현재 페이지(선택)
   * - 호출부 수정 없이도 동작하도록 optional로 두고,
   * - 값이 없으면 내부에서 location 기반으로 판단합니다.
   */
  currentPage?: PageType;
  /**
   * 이동할 목표 좌표 (선택)
   * - [경도, 위도] 형식
   * - 값이 변경되면 해당 위치로 지도 이동
   */
  targetLocation?: [number, number] | null;
  /**
   * 표시할 마커 목록 (선택)
   */
  markers?: MarkerInfo[];
  /**
   * 표시할 경로 라인 목록 (선택)
   */
  routeLines?: RouteLineInfo[];
  /**
   * 출발지/도착지 마커 (선택)
   */
  endpoints?: EndpointMarker[];
  /**
   * 경로 영역에 맞게 지도 범위 조정 여부 (선택)
   */
  fitToRoutes?: boolean;
  /**
   * 플레이어 마커 (유저/봇 위치 표시)
   */
  playerMarkers?: PlayerMarker[];
  /**
   * 이동 수단 마커 (버스/걷기 시작 지점 표시)
   */
  transportModeMarkers?: TransportModeMarker[];
  /**
   * 지하철 노선도 표시 여부 (선택)
   */
  showSubwayLines?: boolean;
  /**
   * 우측 상단 컨트롤 버튼 표시 여부 (선택)
   * - false일 경우 레이어, 내 위치 등 모든 버튼 숨김
   */
  showControls?: boolean;
  /**
   * 정류장/역 마커 목록 (선택)
   */
  stationMarkers?: StationMarker[];
  /**
   * 플레이어 현재 위치 (순위/남은 시간 마커 추적용)
   */
  playerPositions?: Map<string, { lon: number; lat: number }>; // player id -> position
}

// Mapbox Access Token 설정
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

// MapView에서 외부로 노출할 메서드/속성
export interface MapViewRef {
  map: mapboxgl.Map | null;
}

export const MapView = forwardRef<MapViewRef, MapViewProps>(function MapView({
  onNavigate,
  currentPage,
  targetLocation,
  markers = [],
  routeLines = [],
  endpoints = [],
  fitToRoutes = false,
  playerMarkers = [],
  showSubwayLines = false,
  showControls = true,
  stationMarkers = [],
  playerPositions: _playerPositions,
  transportModeMarkers = [],
}, ref) {
  const location = useLocation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const placeMarkers = useRef<mapboxgl.Marker[]>([]); // 검색 결과 마커들
  const endpointMarkers = useRef<mapboxgl.Marker[]>([]); // 출발지/도착지 마커
  const transferMarkers = useRef<mapboxgl.Marker[]>([]); // 환승 지점 마커
  const stationMarkersRef = useRef<mapboxgl.Marker[]>([]); // 정류장/역 마커
  const playerMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map()); // 플레이어 마커들
  const transportModeMarkersRef = useRef<mapboxgl.Marker[]>([]); // 이동 수단 마커들
  const initialLocationApplied = useRef(false); // 초기 위치 적용 여부
  // SVG <defs> id 충돌 방지: MapView 인스턴스별 고유 prefix (SVG id는 document 전역 namespace)
  const svgIdPrefixRef = useRef(`m${Math.random().toString(36).slice(2)}`);
  const routesFitted = useRef(false); // 경로 범위 맞춤 여부
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false); // 지도 로드 상태
  const { mapStyle, setMapStyle } = useMapStore(); // 지도 스타일 (글로벌 스토어)
  const [isLayerPopoverOpen, setIsLayerPopoverOpen] = useState(false); // 레이어 팝오버 상태
  const [is3DBuildingsEnabled, setIs3DBuildingsEnabled] = useState(false); // 3D 건물 레이어 상태
  const [isSubwayLinesEnabled, setIsSubwayLinesEnabled] = useState(showSubwayLines); // 지하철 노선 레이어 상태
  const [isBusLinesEnabled, setIsBusLinesEnabled] = useState(false); // 버스 노선 레이어 상태
  const [showBusInputModal, setShowBusInputModal] = useState(false); // 버스 번호 입력 모달
  const [busNumberInput, setBusNumberInput] = useState(""); // 버스 번호 입력값
  const [trackedBusNumbers, setTrackedBusNumbers] = useState<string[]>([]); // 추적 중인 버스 번호
  const layerButtonRef = useRef<HTMLButtonElement>(null); // 레이어 버튼 ref
  const popoverRef = useRef<HTMLDivElement>(null); // 팝오버 ref

  // 지도 상태 저장 store
  const { lastCenter, lastZoom, hasHydrated, setMapView } = useMapStore();

  const resolvedCurrentPage: PageType =
    currentPage ??
    (location.pathname === "/map"
      ? "map"
      : location.pathname === "/subway"
        ? "subway"
        : location.pathname === "/search"
          ? "search"
          : location.pathname.startsWith("/route")
            ? "route"
            : "favorites");

  // 서울 시청 좌표 (기본값)
  const defaultCenter: [number, number] = [126.9780, 37.5665];
  const defaultZoom = 14;

  // ref로 map 객체 노출 (isMapLoaded 변경 시 업데이트)
  useImperativeHandle(ref, () => ({
    map: map.current,
  }), [isMapLoaded]);

  // 지도 초기화
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // 저장된 위치가 있으면 그 위치로, 없으면 기본값으로 시작
    const initialCenter = lastCenter || defaultCenter;
    const initialZoom = lastZoom || defaultZoom;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLES[mapStyle].url, // 글로벌 스토어의 스타일 사용
      center: initialCenter,
      zoom: initialZoom,
      // 한국어 라벨 표시
      locale: {
        "NavigationControl.ZoomIn": "확대",
        "NavigationControl.ZoomOut": "축소",
        "NavigationControl.ResetBearing": "북쪽으로",
        "GeolocateControl.FindMyLocation": "내 위치",
        "GeolocateControl.LocationNotAvailable": "위치를 사용할 수 없습니다",
      },
    });

    // 콘솔 경고 필터링 (Mapbox layer null 관련 경고 무시)
    const originalWarn = console.warn;
    const warnFilter = (...args: any[]) => {
      const message = args[0]?.toString() || "";
      // Mapbox의 layer null 관련 경고는 무시
      if (
        message.includes("Failed to evaluate expression") &&
        message.includes('["get","layer"]')
      ) {
        return;
      }
      originalWarn.apply(console, args);
    };

    // console.warn 필터링 적용
    console.warn = warnFilter;

    // 지도 로드 완료 후 한국어 라벨 적용 및 현재 위치 가져오기
    map.current.on("load", () => {
      // 모든 심볼 레이어의 텍스트를 한국어로 변경
      const mapInstance = map.current;
      if (mapInstance) {
        const layers = mapInstance.getStyle().layers;
        if (layers) {
          layers.forEach((layer) => {
            if (layer.type === "symbol" && layer.layout?.["text-field"]) {
              mapInstance.setLayoutProperty(layer.id, "text-field", [
                "coalesce",
                ["get", "name_ko"],
                ["get", "name:ko"],
                ["get", "name"],
              ]);
            }
          });
        }
      }
      // 지도 로드 완료 상태 설정
      setIsMapLoaded(true);

      // 하늘 및 대기권 레이어 추가 (3D 뷰 대비)
      if (mapInstance && !mapInstance.getLayer('sky')) {
        mapInstance.addLayer({
          'id': 'sky',
          'type': 'sky',
          'paint': {
            'sky-type': 'atmosphere',
            'sky-atmosphere-sun': [0.0, 0.0],
            'sky-atmosphere-sun-intensity': 15
          }
        });
      }
    });

    // 지도 이동/줌 완료 시 상태 저장 (moveend 이벤트)
    map.current.on("moveend", () => {
      const mapInstance = map.current;
      if (mapInstance && mapInstance.isStyleLoaded()) {
        try {
          const center = mapInstance.getCenter();
          const zoom = mapInstance.getZoom();
          setMapView([center.lng, center.lat], zoom);
        } catch {
          // 스타일 로딩 중 에러 무시
        }
      }
    });

    // 클린업
    return () => {
      // console.warn 복원
      console.warn = originalWarn;

      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // 지도 로드 후 저장된 위치로 이동 (hydration 완료 후, 한 번만 실행)
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    if (!hasHydrated) return; // hydration 완료 대기
    if (initialLocationApplied.current) return; // 이미 적용됨

    // 저장된 위치가 있으면 해당 위치로 이동
    if (lastCenter && lastZoom) {
      map.current.jumpTo({
        center: lastCenter,
        zoom: lastZoom,
      });
    }

    initialLocationApplied.current = true;
  }, [isMapLoaded, hasHydrated, lastCenter, lastZoom]);

  // 목표 좌표가 변경되면 해당 위치로 이동
  useEffect(() => {
    if (!map.current || !targetLocation) return;

    // 지도가 로드된 후에 이동
    if (map.current.loaded()) {
      map.current.flyTo({
        center: targetLocation,
        zoom: 15,
        duration: 1500,
      });
    } else {
      // 지도가 아직 로드되지 않았으면 로드 후 이동
      map.current.once("load", () => {
        map.current?.flyTo({
          center: targetLocation,
          zoom: 15,
          duration: 1500,
        });
      });
    }
  }, [targetLocation]);

  // 마커 표시 (지도 로드 완료 후에만)
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const isHex = (c: string) => /^#([0-9a-fA-F]{6})$/.test(c);
    const clamp255 = (n: number) => Math.max(0, Math.min(255, n));
    const lightenHex = (hex: string, amount = 0.25) => {
      if (!isHex(hex)) return hex;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const lr = clamp255(Math.round(r + (255 - r) * amount));
      const lg = clamp255(Math.round(g + (255 - g) * amount));
      const lb = clamp255(Math.round(b + (255 - b) * amount));
      return `#${lr.toString(16).padStart(2, "0")}${lg.toString(16).padStart(2, "0")}${lb
        .toString(16)
        .padStart(2, "0")}`;
    };
    const darkenHex = (hex: string, amount = 0.28) => {
      if (!isHex(hex)) return hex;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const dr = clamp255(Math.round(r * (1 - amount)));
      const dg = clamp255(Math.round(g * (1 - amount)));
      const db = clamp255(Math.round(b * (1 - amount)));
      return `#${dr.toString(16).padStart(2, "0")}${dg.toString(16).padStart(2, "0")}${db
        .toString(16)
        .padStart(2, "0")}`;
    };

    // 기존 마커들 제거
    placeMarkers.current.forEach((marker) => marker.remove());
    placeMarkers.current = [];

    // 새 마커들 추가
    markers.forEach((markerInfo, index) => {
      // 마커 엘리먼트 생성
      const el = document.createElement("div");
      el.className = "place-marker";
      const isActive = index === 0;
      // 활성(초록 카드) 마커를 "다른 마커들보다만" 위로 (카드/오버레이 UI보다 위로는 올라오면 안 됨)
      // 따라서 z-index는 낮게 유지하고, 지도 컨테이너를 별도 stacking context로 묶어 UI 오버레이에 눌리도록 합니다.
      el.style.zIndex = isActive ? "3" : "1";
      // "한 파일(MapView)에서만" 색 규칙 유지:
      // SearchResultsPage의 카드 팔레트(인덱스 기반)와 동일 규칙을 여기서 그대로 사용합니다.
      const cardPalette = ["#7ed321", "#00d9ff", "#ffffff", "#ffc107", "#ff9ff3", "#54a0ff"];
      const pinBase = cardPalette[index % cardPalette.length];
      const pinHi = lightenHex(pinBase, 0.22);
      const pinLo = darkenHex(pinBase, 0.12);
      const pinStroke = darkenHex(pinBase, 0.32);
      const innerFill = "white";
      // 핀 내부(흰 원)에 알파벳 표시
      const markerLabel = markerInfo.icon || "";

      // SVG id는 XML Name 규칙을 타서 숫자 시작/특수문자에 취약할 수 있어 안전하게 sanitize + prefix
      const safeId = String(markerInfo.id).replace(/[^a-zA-Z0-9_-]/g, "_");
      const pinFillId = `${svgIdPrefixRef.current}-pinFill-${safeId}`;
      const holeShadowId = `${svgIdPrefixRef.current}-holeShadow-${safeId}`;
      el.innerHTML = `
        <div style="
          position: relative;
          width: 48px;
          height: 58px;
          cursor: pointer;
          overflow: visible;
        ">
          <!-- 핀 -->
          <div style="
            position: absolute;
            left: 0;
            top: 0;
            width: 48px;
            height: 58px;
            filter: none;
            z-index: 1;
          ">
            <svg width="48" height="58" viewBox="0 0 48 58" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;">
              <defs>
                <!-- 핀 바디: 은은한 하이라이트(위) + 살짝 어두운 바닥(아래) -->
                <linearGradient id="${pinFillId}" x1="0" y1="0" x2="0" y2="58">
                  <stop offset="0" stop-color="${pinHi}" />
                  <stop offset="0.55" stop-color="${pinBase}" />
                  <stop offset="1" stop-color="${pinLo}" />
                </linearGradient>

                <!-- 가운데 링/구멍에 부드러운 그림자(입체감) -->
                <filter id="${holeShadowId}" x="-40%" y="-40%" width="180%" height="180%">
                  <feDropShadow dx="1.2" dy="1.8" stdDeviation="0.6" flood-color="black" flood-opacity="0.16" />
                </filter>
              </defs>
              <path
                d="M24 2C14.611 2 7 9.611 7 19c0 12.6 17 36 17 36s17-23.4 17-36C41 9.611 33.389 2 24 2Z"
                fill="url(#${pinFillId})"
                stroke="${pinStroke}"
                stroke-width="2.5"
                stroke-linejoin="round"
              />
              <!-- 컬러 링(핀색) + 흰 구멍 -->
              <circle cx="24" cy="20" r="13.2" fill="${pinBase}" filter="url(#${holeShadowId})" />
              <circle cx="24" cy="20" r="11.1" fill="${innerFill}" />
              <!-- 링 하이라이트 -->
              <circle cx="21" cy="17" r="6.8" fill="${pinHi}" opacity="0.16" />
              <!-- 구멍 가장자리 얇은 음영(입체감) -->
              <circle cx="24" cy="20" r="11.1" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="1" />
              <!-- 알파벳 라벨 -->
              <text x="24" y="24" text-anchor="middle" font-family="Pretendard, Arial, sans-serif" font-size="14" font-weight="bold" fill="#333">${markerLabel}</text>
            </svg>
          </div>
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
        .setLngLat(markerInfo.coordinates)
        .addTo(map.current!);

      placeMarkers.current.push(marker);
    });

    // 클린업: 컴포넌트 언마운트 시 마커 제거
    return () => {
      try {
        placeMarkers.current.forEach((marker) => marker.remove());
      } catch {
        // 지도가 제거된 경우 무시
      }
      placeMarkers.current = [];
    };
  }, [markers, isMapLoaded]);

  // 경로 라인 표시 (지도 로드 완료 후에만)
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const mapInstance = map.current;

    // 경로 라인 추가/업데이트 함수
    const addRouteLinesToMap = () => {
      try {
        // 기존 경로 레이어 및 소스 제거 (최대 10개까지, 화살표 레이어 포함)
        // 단, routeLines가 비어있지 않으면 기존 레이어를 유지하고 소스만 업데이트
        if (routeLines.length === 0) {
          // 경로선이 없으면 모든 레이어 제거
          for (let i = 0; i < 10; i++) {
            const layerId = `route-line-${i}`;
            const arrowLayerId = `route-arrow-${i}`;
            const sourceId = `route-source-${i}`;

            if (mapInstance.getLayer(arrowLayerId)) {
              mapInstance.removeLayer(arrowLayerId);
            }
            if (mapInstance.getLayer(layerId)) {
              mapInstance.removeLayer(layerId);
            }
            if (mapInstance.getSource(sourceId)) {
              mapInstance.removeSource(sourceId);
            }
          }
          return;
        }

        // 새 경로 라인 추가 - 선택되지 않은 경로를 먼저 추가 (아래 레이어)
        const unselectedRoutes = routeLines.filter(r => !r.isSelected);
        const selectedRoutes = routeLines.filter(r => r.isSelected);
        const orderedRoutes = [...unselectedRoutes, ...selectedRoutes]; // 선택된 경로를 마지막에

        orderedRoutes.forEach((route, index) => {
          const sourceId = `route-source-${index}`;
          const layerId = `route-line-${index}`;

          // GeoJSON 데이터 생성
          const geoJsonData = {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: route.coordinates,
            },
          };

          // 소스가 이미 존재하면 업데이트, 없으면 추가
          if (mapInstance.getSource(sourceId)) {
            (mapInstance.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geoJsonData as any);
          } else {
            mapInstance.addSource(sourceId, {
              type: 'geojson',
              data: geoJsonData as any,
            });
          }

          // 도보 구간 점선 레이어 추가 (먼저 추가하여 메인 선 아래에 배치)
          if (route.walkSegments && route.walkSegments.length > 0) {
            route.walkSegments.forEach((walkSegment, walkIndex) => {
              const walkSourceId = `walk-source-${index}-${walkIndex}`;
              const walkLayerId = `walk-line-${index}-${walkIndex}`;

              try {
                // 도보 구간 GeoJSON 데이터 생성
                const walkGeoJsonData = {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: walkSegment.coordinates,
                  },
                };

                // 소스가 이미 존재하면 업데이트, 없으면 추가
                if (mapInstance.getSource(walkSourceId)) {
                  (mapInstance.getSource(walkSourceId) as mapboxgl.GeoJSONSource).setData(walkGeoJsonData as any);
                } else {
                  mapInstance.addSource(walkSourceId, {
                    type: 'geojson',
                    data: walkGeoJsonData as any,
                  });
                }

                // 도보 구간 점선 레이어 추가
                if (!mapInstance.getLayer(walkLayerId)) {
                  mapInstance.addLayer({
                    id: walkLayerId,
                    type: 'line',
                    source: walkSourceId,
                    layout: {
                      'line-join': 'round',
                      'line-cap': 'round',
                    },
                    paint: {
                      'line-color': route.color,
                      'line-width': (route.width || (route.isSelected ? 10 : 6)) + 1, // 메인 선보다 1px 두껍게 (위에 표시)
                      'line-opacity': route.opacity !== undefined ? route.opacity : 1.0,
                      'line-dasharray': [5, 3], // 점선 패턴: 5px 선, 3px 공백
                    },
                  }, layerId); // 메인 선 레이어 위에 배치
                } else {
                  // 레이어가 이미 있으면 paint 속성만 업데이트
                  mapInstance.setPaintProperty(walkLayerId, 'line-color', route.color);
                  mapInstance.setPaintProperty(walkLayerId, 'line-width', (route.width || (route.isSelected ? 10 : 6)) + 1);
                  mapInstance.setPaintProperty(walkLayerId, 'line-opacity', route.opacity !== undefined ? route.opacity : 1.0);
                }
              } catch (e) {
                // 에러 무시
              }
            });
          }

          // 메인 경로선 레이어 추가 (실선) - 버스/지하철 구간만
          try {
            if (!mapInstance.getLayer(layerId)) {
              // 레이어가 없으면 추가
              mapInstance.addLayer({
                id: layerId,
                type: 'line',
                source: sourceId,
                layout: {
                  'line-join': 'round',
                  'line-cap': 'round',
                },
                paint: {
                  'line-color': route.color,
                  'line-width': route.width || (route.isSelected ? 10 : 6),
                  'line-opacity': route.opacity !== undefined ? route.opacity : 1.0, // 모든 경로 불투명
                },
              });
            } else {
              // 레이어가 이미 있으면 paint 속성만 업데이트
              mapInstance.setPaintProperty(layerId, 'line-color', route.color);
              mapInstance.setPaintProperty(layerId, 'line-width', route.width || (route.isSelected ? 10 : 6));
              mapInstance.setPaintProperty(layerId, 'line-opacity', route.opacity !== undefined ? route.opacity : 1.0);
            }
          } catch (e) {
            // 에러 무시
          }

          // 화살표 패턴을 위한 심볼 레이어 추가
          const arrowLayerId = `route-arrow-${index}`;
          const arrowImageId = `arrow-${index}`;

          // 경로 색상에 맞는 화살표 SVG 생성 (흰색 배경 원 제거)
          const arrowSvg = `
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M 2 12 L 18 12 M 12 6 L 18 12 L 12 18" stroke="${route.color}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;

          const arrowImage = new Image(24, 24);
          arrowImage.onload = () => {
            if (mapInstance.hasImage(arrowImageId)) {
              mapInstance.removeImage(arrowImageId);
            }
            mapInstance.addImage(arrowImageId, arrowImage);

            // 화살표 레이어 추가
            if (!mapInstance.getLayer(arrowLayerId)) {
              mapInstance.addLayer({
                id: arrowLayerId,
                type: 'symbol',
                source: sourceId,
                layout: {
                  'symbol-placement': 'line',
                  'symbol-spacing': 50, // 화살표 간격 축소 (80px -> 50px)
                  'icon-image': arrowImageId,
                  'icon-size': 1.2, // 화살표 크기 증가
                  'icon-allow-overlap': true,
                  'icon-ignore-placement': true,
                  'icon-rotation-alignment': 'map',
                  'icon-keep-upright': false,
                },
                paint: {
                  'icon-opacity': route.opacity !== undefined ? route.opacity : 1.0, // 모든 화살표 불투명
                },
              });
            }
          };
          arrowImage.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(arrowSvg);
        });
      } catch {
        // 스타일 로딩 중 에러 무시
      }
    };

    // 스타일이 로딩 중이면 잠시 후 재시도
    if (!mapInstance.isStyleLoaded()) {
      const retryTimeout = setTimeout(() => {
        if (mapInstance.isStyleLoaded()) {
          addRouteLinesToMap();
        } else {
          setTimeout(() => {
            addRouteLinesToMap();
          }, 200);
        }
      }, 100);
      return () => clearTimeout(retryTimeout);
    }

    // 스타일이 이미 로드되어 있으면 바로 추가
    addRouteLinesToMap();

    // 클린업
    return () => {
      // 지도가 이미 제거되었거나 스타일 로딩 중이면 무시
      try {
        if (!mapInstance || !mapInstance.isStyleLoaded()) return;

        routeLines.forEach((route, index) => {
          const layerId = `route-line-${index}`;
          const arrowLayerId = `route-arrow-${index}`;
          const sourceId = `route-source-${index}`;

          // 도보 구간 레이어 제거
          if (route.walkSegments && route.walkSegments.length > 0) {
            route.walkSegments.forEach((_, walkIndex) => {
              const walkLayerId = `walk-line-${index}-${walkIndex}`;
              const walkSourceId = `walk-source-${index}-${walkIndex}`;

              if (mapInstance.getLayer(walkLayerId)) {
                mapInstance.removeLayer(walkLayerId);
              }
              if (mapInstance.getSource(walkSourceId)) {
                mapInstance.removeSource(walkSourceId);
              }
            });
          }

          if (mapInstance.getLayer(arrowLayerId)) {
            mapInstance.removeLayer(arrowLayerId);
          }
          if (mapInstance.getLayer(layerId)) {
            mapInstance.removeLayer(layerId);
          }
          if (mapInstance.getSource(sourceId)) {
            mapInstance.removeSource(sourceId);
          }
        });
      } catch {
        // 지도가 제거된 경우 무시
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeLines, routeLines.length, isMapLoaded]);

  // 환승 지점 표시
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // 기존 환승 마커 제거
    transferMarkers.current.forEach(m => m.remove());
    transferMarkers.current = [];

    // 환승 지점 마커 추가 (모든 경로)
    routeLines.forEach((route) => {
      if (!route.transferPoints) return;

      route.transferPoints.forEach((tp) => {
        // 환승 방향에 따른 이모지 선택
        const getTransferEmoji = (toMode: string) => {
          // 다음 교통수단에 따라 이모지 표시
          if (toMode === 'BUS') return '🚌';
          if (toMode === 'SUBWAY') return '🚇';
          if (toMode === 'WALK') return '🚶';
          return '🔄'; // 기본값
        };

        const emoji = getTransferEmoji(tp.toMode);
        const status = tp.status || 'confirmed'; // 기본값: 정상 (실시간 정보이므로)

        // 실패한 환승 지점은 표시하지 않음 (자연스럽게 숨김)
        if (status === 'failed') {
          return; // 마커를 생성하지 않음
        }

        // 정상 환승 지점만 표시 (항상 정상으로 보이게)
        const el = document.createElement("div");
        el.className = "transfer-marker";
        el.innerHTML = `
          <div style="
            width: 28px;
            height: 28px;
            background: ${route.color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            line-height: 1;
          ">${emoji}</div>
        `;
        el.style.cursor = 'pointer';

        const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
          .setLngLat(tp.coordinates)
          .addTo(map.current!);
        transferMarkers.current.push(marker);
      });
    });

    return () => {
      transferMarkers.current.forEach(m => m.remove());
      transferMarkers.current = [];
    };
  }, [routeLines, isMapLoaded]);


  // 출발지/도착지 마커 표시
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // 기존 마커 제거
    endpointMarkers.current.forEach((marker) => marker.remove());
    endpointMarkers.current = [];

    // 새 마커 추가
    endpoints.forEach((endpoint) => {
      const el = document.createElement("div");
      el.className = "endpoint-marker";

      const markerImageSrc = endpoint.type === 'departure'
        ? departureMarkerImg
        : arrivalMarkerImg;

      el.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <img
              src="${markerImageSrc}"
              alt="${endpoint.type === 'departure' ? '출발지' : '도착지'}"
              style="
                width: 100%;
                height: 100%;
                object-fit: contain;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
              "
            />
          </div>
          <div style="
            margin-top: 4px;
            padding: 4px 8px;
            background: white;
            border: 2px solid black;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">${endpoint.name}</div>
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat(endpoint.coordinates)
        .addTo(map.current!);

      endpointMarkers.current.push(marker);
    });

    return () => {
      try {
        endpointMarkers.current.forEach((marker) => marker.remove());
      } catch {
        // 지도가 제거된 경우 무시
      }
      endpointMarkers.current = [];
    };
  }, [endpoints, isMapLoaded]);

  // 이동 수단 마커 표시 (버스/걷기 시작 지점)
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // 기존 마커 제거
    transportModeMarkersRef.current.forEach((marker) => marker.remove());
    transportModeMarkersRef.current = [];

    // 새 마커 추가
    transportModeMarkers.forEach((marker) => {
      const el = document.createElement("div");
      el.className = "transport-mode-marker";

      // 이동 수단에 따른 아이콘
      let icon = '';
      if (marker.mode === 'BUS' || marker.mode === 'EXPRESSBUS') {
        icon = '🚌';
      } else if (marker.mode === 'SUBWAY') {
        icon = '🚇';
      } else if (marker.mode === 'WALK') {
        icon = '🚶';
      }

      // 해당 플레이어의 경로 색상 찾기
      const playerRoute = routeLines.find(route => route.playerName === marker.player);
      const bgColor = playerRoute?.color || '#888888'; // 기본값: 회색

      el.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: ${bgColor};
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            font-size: 20px;
          ">${icon}</div>
        </div>
      `;

      const mapboxMarker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat(marker.coordinates)
        .addTo(map.current!);

      transportModeMarkersRef.current.push(mapboxMarker);
    });

    return () => {
      try {
        transportModeMarkersRef.current.forEach((marker) => marker.remove());
      } catch {
        // 지도가 제거된 경우 무시
      }
      transportModeMarkersRef.current = [];
    };
  }, [transportModeMarkers, routeLines, isMapLoaded]);

  // 정류장/역 마커 표시 - 비활성화 (경로선만 표시)
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    // 기존 마커 제거
    stationMarkersRef.current.forEach((marker) => marker.remove());
    stationMarkersRef.current = [];

    // 정류장/역 마커 표시 비활성화 - 경로선만 표시
    // 모든 정보 제거

    return () => {
      try {
        stationMarkersRef.current.forEach((marker) => marker.remove());
      } catch {
        // 지도가 제거된 경우 무시
      }
      stationMarkersRef.current = [];
    };
  }, [stationMarkers, isMapLoaded]);

  // 플레이어 마커 표시 (유저/봇 위치)
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const currentMarkers = playerMarkersRef.current;

    // 새 마커 추가 또는 기존 마커 위치 업데이트
    playerMarkers.forEach((player) => {
      const existingMarker = currentMarkers.get(player.id);

      if (existingMarker) {
        // 기존 마커 위치 업데이트 (부드러운 이동)
        existingMarker.setLngLat(player.coordinates);
      } else {
        // 새 마커 생성
        const el = document.createElement("div");
        el.className = "player-marker";
        el.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transition: transform 0.3s ease-out;
          ">
            <div style="
              width: 48px;
              height: 48px;
              background: ${player.color};
              border: 4px solid black;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.4);
              animation: bounce 0.5s ease-out;
            ">${player.icon}</div>
            ${player.label ? `
              <div style="
                margin-top: 4px;
                padding: 2px 8px;
                background: ${player.color};
                border: 2px solid black;
                border-radius: 4px;
                font-size: 10px;
                font-weight: bold;
                color: white;
                text-shadow: 1px 1px 0 black;
              ">${player.label}</div>
            ` : ''}
          </div>
        `;

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat(player.coordinates)
          .addTo(map.current!);

        currentMarkers.set(player.id, marker);
      }
    });

    // 삭제된 마커 제거
    const activeIds = new Set(playerMarkers.map((p) => p.id));
    currentMarkers.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    return () => {
      // 컴포넌트 언마운트 시 모든 마커 제거
      currentMarkers.forEach((marker) => {
        try {
          marker.remove();
        } catch {
          // 무시
        }
      });
      currentMarkers.clear();
    };
  }, [playerMarkers, isMapLoaded]);

  // 경로 영역에 맞게 지도 범위 조정
  useEffect(() => {
    if (!map.current || !isMapLoaded || !fitToRoutes) return;
    if (routeLines.length === 0 && endpoints.length === 0) return;
    if (routesFitted.current) return; // 이미 맞춤 완료

    // 모든 좌표 수집
    const allCoordinates: [number, number][] = [];

    routeLines.forEach((route) => {
      allCoordinates.push(...route.coordinates);
    });

    endpoints.forEach((endpoint) => {
      allCoordinates.push(endpoint.coordinates);
    });

    if (allCoordinates.length === 0) return;

    // bounds 계산
    const bounds = new mapboxgl.LngLatBounds();
    allCoordinates.forEach((coord) => {
      bounds.extend(coord);
    });

    // 지도 범위 조정
    map.current.fitBounds(bounds, {
      padding: { top: 80, bottom: 200, left: 50, right: 50 },
      duration: 1000,
    });

    routesFitted.current = true;
  }, [routeLines, endpoints, fitToRoutes, isMapLoaded]);

  // fitToRoutes가 변경되면 다시 맞춤 가능하도록 리셋
  useEffect(() => {
    if (!fitToRoutes) {
      routesFitted.current = false;
    }
  }, [fitToRoutes]);

  // 지하철 노선도 레이어 표시/숨김
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const mapInstance = map.current;

    // 내부 상태 또는 prop으로 전달된 값 사용
    const shouldShowSubway = isSubwayLinesEnabled || showSubwayLines;

    if (shouldShowSubway) {
      // 레이어 추가 (이미 있으면 내부에서 스킵)
      addSubwayLayers(mapInstance);
      toggleSubwayLayers(mapInstance, true);
    } else {
      // 레이어 숨김
      toggleSubwayLayers(mapInstance, false);
    }

    return () => {
      // 컴포넌트 언마운트 시 레이어 제거
      if (mapInstance && mapInstance.isStyleLoaded()) {
        try {
          removeSubwayLayers(mapInstance);
        } catch {
          // 지도가 이미 제거된 경우 무시
        }
      }
    };
  }, [showSubwayLines, isSubwayLinesEnabled, isMapLoaded]);

  // 버스 실시간 위치 레이어 표시/숨김 (사용자 지정 버스 번호 추적)
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const mapInstance = map.current;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (isBusLinesEnabled && trackedBusNumbers.length > 0) {
      // 사용자가 입력한 버스 번호로 실시간 위치 조회
      const loadBusPositions = async () => {
        try {
          console.log("[BusLayer] 추적 버스 API 호출:", trackedBusNumbers);

          const response = await trackBusPositions(trackedBusNumbers);

          console.log(`[BusLayer] API 응답: ${response.buses.length}대 버스`);

          if (response.buses.length > 0) {
            updateAllBusPositions(mapInstance, response.buses);
          }

          // 경로 데이터 로드 (최초 1회만 - 경로는 변하지 않음)
          if (response.meta.routes.length > 0) {
            for (const route of response.meta.routes) {
              const pathData = await getBusRoutePath(route.route_id);
              if (pathData?.geojson) {
                addBusRoutePath(mapInstance, route.route_id, route.bus_number, pathData.geojson);
              }
            }
          }
        } catch (error) {
          console.error("[BusLayer] 버스 실시간 위치 로드 실패:", error);
        }
      };

      // 레이어 추가 후 데이터 로드
      addBusLayers(mapInstance).then(() => {
        toggleBusLayers(mapInstance, true);
        loadBusPositions();
      });

      // 15초마다 위치 업데이트 (경로는 이미 추가되어 있으므로 중복 추가 안됨)
      intervalId = setInterval(loadBusPositions, 15000);
    } else if (isBusLinesEnabled && trackedBusNumbers.length === 0) {
      // 버스 레이어 활성화했지만 추적할 버스가 없으면 입력 모달 표시
      setShowBusInputModal(true);
    } else {
      // 레이어 숨김
      toggleBusLayers(mapInstance, false);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (mapInstance && mapInstance.isStyleLoaded()) {
        try {
          clearBusData(mapInstance);
          clearAllBusRoutePaths(mapInstance);
          removeBusLayers(mapInstance);
        } catch {
          // 지도가 이미 제거된 경우 무시
        }
      }
    };
  }, [isBusLinesEnabled, trackedBusNumbers, isMapLoaded]);

  // 지하철 노선 토글 핸들러
  const handleSubwayLinesToggle = useCallback(() => {
    setIsSubwayLinesEnabled((prev) => !prev);
  }, []);

  // 버스 노선 토글 핸들러
  const handleBusLinesToggle = useCallback(() => {
    if (!isBusLinesEnabled) {
      // 켤 때: 모달 표시
      setShowBusInputModal(true);
    } else {
      // 끌 때: 레이어 비활성화 및 추적 초기화
      setIsBusLinesEnabled(false);
      setTrackedBusNumbers([]);
      setBusNumberInput("");
      // 경로 및 마커 데이터 정리
      if (map.current) {
        clearBusData(map.current);
        clearAllBusRoutePaths(map.current);
      }
    }
  }, [isBusLinesEnabled]);

  // 버스 번호 입력 확인 핸들러
  const handleBusInputConfirm = useCallback(() => {
    const numbers = busNumberInput
      .split(/[,\s]+/) // 쉼표 또는 공백으로 분리
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
      .slice(0, 5); // 최대 5개

    if (numbers.length > 0) {
      setTrackedBusNumbers(numbers);
      setIsBusLinesEnabled(true);
      setShowBusInputModal(false);
    }
  }, [busNumberInput]);

  // 버스 입력 모달 취소 핸들러
  const handleBusInputCancel = useCallback(() => {
    setShowBusInputModal(false);
    setBusNumberInput("");
  }, []);

  // 자동 현재 위치 이동 제거
  // - 저장된 위치가 있으면 그 위치로 시작 (지도 초기화 시 처리)
  // - 저장된 위치가 없으면 기본값(서울 시청)으로 시작
  // - 현재 위치는 사용자가 "내 위치" 버튼을 눌러야만 이동

  // 사용자 위치 가져오기
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation을 지원하지 않는 브라우저입니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        const coords: [number, number] = [longitude, latitude];
        setUserLocation(coords);

        // 사용자 위치에 마커 추가
        if (map.current) {
          // 기존 마커 제거
          if (userMarker.current) {
            userMarker.current.remove();
          }

          // 사용자 위치 마커 생성
          const el = document.createElement("div");
          el.className = "user-location-marker";
          el.innerHTML = `
            <div style="
              width: 20px;
              height: 20px;
              background: #4285F4;
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            "></div>
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 40px;
              height: 40px;
              background: rgba(66, 133, 244, 0.2);
              border-radius: 50%;
              animation: pulse 2s infinite;
            "></div>
          `;

          userMarker.current = new mapboxgl.Marker({ element: el })
            .setLngLat(coords)
            .addTo(map.current);

          // 사용자 위치로 지도 이동
          map.current.flyTo({
            center: coords,
            zoom: 15,
            duration: 1500,
          });
        }
      },
      (error) => {
        console.log("위치 가져오기 실패:", error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // 줌 인
  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn({ duration: 300 });
    }
  };

  // 줌 아웃
  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut({ duration: 300 });
    }
  };

  // 내 위치로 이동
  const handleMyLocation = () => {
    if (userLocation && map.current) {
      map.current.flyTo({
        center: userLocation,
        zoom: 15,
        duration: 1500,
      });
    } else {
      getUserLocation();
    }
  };

  // 지도 스타일 변경
  const handleStyleChange = useCallback((style: MapStyleType) => {
    if (!map.current) return;

    // 스타일이 아직 로딩 중이면 무시
    if (!map.current.isStyleLoaded()) return;

    // 현재 지도 상태 저장
    const center = map.current.getCenter();
    const zoom = map.current.getZoom();
    const bearing = map.current.getBearing();
    const pitch = map.current.getPitch();

    // 지도 로딩 상태를 false로 설정 (다른 컴포넌트가 접근하지 않도록)
    setIsMapLoaded(false);

    // 스타일 변경 (diff: false로 경고 방지)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.current.setStyle(MAP_STYLES[style].url, { diff: false } as any);

    // 스타일 로드 후 상태 복원 및 한국어 라벨 적용
    map.current.once("style.load", () => {
      if (!map.current) return;

      // 지도 상태 복원
      map.current.jumpTo({
        center: center,
        zoom: zoom,
        bearing: bearing,
        pitch: pitch,
      });

      // 한국어 라벨 적용 (위성 지도는 라벨이 없으므로 제외)
      if (style !== "satellite-streets") {
        const layers = map.current.getStyle().layers;
        if (layers) {
          layers.forEach((layer) => {
            if (layer.type === "symbol" && layer.layout?.["text-field"]) {
              try {
                map.current?.setLayoutProperty(layer.id, "text-field", [
                  "coalesce",
                  ["get", "name_ko"],
                  ["get", "name:ko"],
                  ["get", "name"],
                ]);
              } catch {
                // 일부 레이어는 text-field 변경이 불가능할 수 있음
              }
            }
          });
        }
      }

      // 야간 모드(navigation-night-v1)의 혼잡도 레이어 숨기기
      if (style === "dark") {
        const layers = map.current.getStyle().layers;
        if (layers) {
          layers.forEach((layer) => {
            // traffic 관련 레이어 숨기기
            if (layer.id.includes("traffic")) {
              try {
                map.current?.setLayoutProperty(layer.id, "visibility", "none");
              } catch {
                // 레이어 숨기기 실패 무시
              }
            }
          });
        }
      }

      // 3D 건물 상태 유지 (스타일 변경 후에도)
      if (is3DBuildingsEnabled && map.current && !map.current.getLayer("3d-buildings")) {
        // 중구 건물 GeoJSON 소스 추가
        if (!map.current.getSource("junggu-buildings")) {
          map.current.addSource("junggu-buildings", {
            type: "geojson",
            data: "/junggu_buildings.geojson",
          });
        }
        // 건물 레이어 추가
        map.current.addLayer({
          id: "3d-buildings",
          source: "junggu-buildings",
          type: "fill-extrusion",
          minzoom: 13,
          paint: {
            "fill-extrusion-color": [
              "interpolate",
              ["linear"],
              ["get", "height"],
              0, "#d4e6d7",
              10, "#a8d4ae",
              20, "#7bc47f",
              50, "#4a9960",
              100, "#2d5f3f",
            ],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.75,
          },
        });
      }

      // 지도 로딩 완료
      setIsMapLoaded(true);
    });

    setMapStyle(style);
    setIsLayerPopoverOpen(false);
  }, [is3DBuildingsEnabled]);

  // 3D 건물 레이어 추가 함수 (중구 GeoJSON 데이터 사용)
  const add3DBuildingsLayer = useCallback(async () => {
    if (!map.current) return;

    // 이미 레이어가 있으면 무시
    if (map.current.getLayer("3d-buildings")) return;

    // 중구 건물 GeoJSON 소스 추가
    if (!map.current.getSource("junggu-buildings")) {
      map.current.addSource("junggu-buildings", {
        type: "geojson",
        data: "/junggu_buildings.geojson",
      });
    }

    // 건물 레이어 추가 (층수 기반 높이 사용)
    map.current.addLayer({
      id: "3d-buildings",
      source: "junggu-buildings",
      type: "fill-extrusion",
      minzoom: 13,
      paint: {
        // 높이에 따라 색상 변화 (낮은 건물: 밝은색, 높은 건물: 어두운색)
        "fill-extrusion-color": [
          "interpolate",
          ["linear"],
          ["get", "height"],
          0, "#d4e6d7",    // 매우 낮은 건물 - 연한 녹색
          10, "#a8d4ae",   // 낮은 건물
          20, "#7bc47f",   // 중간 건물
          50, "#4a9960",   // 높은 건물 - 진한 녹색
          100, "#2d5f3f",  // 매우 높은 건물
        ],
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.75,
      },
    });
  }, []);

  // 3D 건물 레이어 제거 함수
  const remove3DBuildingsLayer = useCallback(() => {
    if (!map.current) return;
    if (map.current.getLayer("3d-buildings")) {
      map.current.removeLayer("3d-buildings");
    }
    // 소스도 제거
    if (map.current.getSource("junggu-buildings")) {
      map.current.removeSource("junggu-buildings");
    }
  }, []);

  // 3D 건물 토글 핸들러
  const handle3DBuildingsToggle = useCallback(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    const newState = !is3DBuildingsEnabled;
    setIs3DBuildingsEnabled(newState);

    if (newState) {
      add3DBuildingsLayer();
      // 3D 효과를 위해 pitch 추가
      map.current.easeTo({
        pitch: 45,
        duration: 500,
      });
    } else {
      remove3DBuildingsLayer();
      // pitch 초기화
      map.current.easeTo({
        pitch: 0,
        duration: 500,
      });
    }
  }, [is3DBuildingsEnabled, add3DBuildingsLayer, remove3DBuildingsLayer]);

  // 팝오버 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isLayerPopoverOpen &&
        popoverRef.current &&
        layerButtonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !layerButtonRef.current.contains(event.target as Node)
      ) {
        setIsLayerPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLayerPopoverOpen]);

  return (
    <div className="w-full h-full bg-[#f5f5f5] relative overflow-hidden">
      {/* Mapbox 지도 컨테이너 */}
      <div ref={mapContainer} className="w-full h-full relative z-0" />

      {/* 펄스 애니메이션을 위한 스타일 */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>

      {/* 우상단 컨트롤 버튼들 - 지도가 표시되는 모든 페이지에서 표시 */}
      {showControls && (resolvedCurrentPage === "map" || resolvedCurrentPage === "search" || resolvedCurrentPage === "route" || resolvedCurrentPage === "routeDetail") && (
        <div className="absolute right-4 top-4 flex flex-col gap-3 z-10">
          {/* 검색 버튼 - 모바일에서만 표시, route 페이지에서는 RouteSelectionPage에서 관리하므로 숨김 */}
          {onNavigate && resolvedCurrentPage !== "route" && (
            <button
              onClick={() => onNavigate("search")}
              className="md:hidden bg-white/40 backdrop-blur-md rounded-[12px] shadow-lg border border-white/50 size-[48px] flex items-center justify-center hover:bg-white/50 active:bg-white/60 transition-all"
              title="검색"
            >
              <span className="text-[20px]">🔍</span>
            </button>
          )}

          {/* 레이어 버튼 - route/routeDetail 페이지에서는 각 페이지에서 관리하므로 숨김 */}
          {resolvedCurrentPage !== "route" && resolvedCurrentPage !== "routeDetail" && (
          <div className="relative">
            <button
              ref={layerButtonRef}
              onClick={() => setIsLayerPopoverOpen(!isLayerPopoverOpen)}
              className={`bg-white/40 backdrop-blur-md rounded-[12px] shadow-lg border border-white/50 size-[48px] flex items-center justify-center hover:bg-white/50 active:bg-white/60 transition-all ${isLayerPopoverOpen ? "bg-white/60" : ""}`}
              title="레이어"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="rgba(0,0,0,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="rgba(0,0,0,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="rgba(0,0,0,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* 레이어 팝오버 */}
            {isLayerPopoverOpen && (
              <div
                ref={popoverRef}
                className="absolute right-[56px] top-0 bg-white/20 backdrop-blur-lg rounded-[12px] shadow-xl border border-white/30 p-4 min-w-[200px] z-20"
              >
                <div className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-white/20">
                  지도 스타일
                </div>
                <div className="flex flex-col gap-2">
                  {(Object.keys(MAP_STYLES) as MapStyleType[]).map((styleKey) => (
                    <button
                      key={styleKey}
                      onClick={() => handleStyleChange(styleKey)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        mapStyle === styleKey
                          ? "bg-white/40 text-gray-900 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                          : "hover:bg-white/30 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                      }`}
                    >
                      <span className="text-lg">{MAP_STYLES[styleKey].icon}</span>
                      <span className="text-sm font-medium">{MAP_STYLES[styleKey].name}</span>
                      {mapStyle === styleKey && (
                        <svg className="ml-auto w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>

                {/* 레이어 옵션 섹션 */}
                <div className="text-sm font-bold text-gray-800 mt-4 mb-3 pt-3 pb-2 border-t border-b border-white/20">
                  레이어 옵션
                </div>
                <div className="flex flex-col gap-2">
                  {/* 3D 건물 토글 */}
                  <button
                    onClick={handle3DBuildingsToggle}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      is3DBuildingsEnabled
                        ? "bg-white/50 text-gray-900 backdrop-blur-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] border border-white/40"
                        : "bg-white/25 hover:bg-white/35 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-white/20 shadow-sm"
                    }`}
                  >
                    <span className="text-lg">🏢</span>
                    <span className="text-sm font-medium">3D 건물</span>
                    {/* 토글 스위치 */}
                    <div
                      className={`ml-auto w-10 h-5 rounded-full transition-all relative backdrop-blur-sm ${
                        is3DBuildingsEnabled
                          ? "bg-green-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                          : "bg-white/35 border border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                          is3DBuildingsEnabled
                            ? "translate-x-5 bg-white shadow-md"
                            : "translate-x-0.5 bg-white border border-white/50 shadow-sm"
                        }`}
                      />
                    </div>
                  </button>

                  {/* 지하철 노선 토글 */}
                  <button
                    onClick={handleSubwayLinesToggle}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      isSubwayLinesEnabled
                        ? "bg-white/50 text-gray-900 backdrop-blur-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] border border-white/40"
                        : "bg-white/25 hover:bg-white/35 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-white/20 shadow-sm"
                    }`}
                  >
                    <span className="text-lg">🚇</span>
                    <span className="text-sm font-medium whitespace-nowrap">지하철 노선</span>
                    {/* 토글 스위치 */}
                    <div
                      className={`ml-auto w-10 h-5 rounded-full transition-all relative backdrop-blur-sm ${
                        isSubwayLinesEnabled
                          ? "bg-green-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                          : "bg-white/35 border border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                          isSubwayLinesEnabled
                            ? "translate-x-5 bg-white shadow-md"
                            : "translate-x-0.5 bg-white border border-white/50 shadow-sm"
                        }`}
                      />
                    </div>
                  </button>

                  {/* 버스 노선 토글 */}
                  <button
                    onClick={handleBusLinesToggle}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      isBusLinesEnabled
                        ? "bg-white/50 text-gray-900 backdrop-blur-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] border border-white/40"
                        : "bg-white/25 hover:bg-white/35 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-white/20 shadow-sm"
                    }`}
                  >
                    <span className="text-lg">🚌</span>
                    <span className="text-sm font-medium whitespace-nowrap">실시간 버스</span>
                    {/* 토글 스위치 */}
                    <div
                      className={`ml-auto w-10 h-5 rounded-full transition-all relative backdrop-blur-sm ${
                        isBusLinesEnabled
                          ? "bg-green-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                          : "bg-white/35 border border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                          isBusLinesEnabled
                            ? "translate-x-5 bg-white shadow-md"
                            : "translate-x-0.5 bg-white border border-white/50 shadow-sm"
                        }`}
                      />
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
          )}

          {/* 현재 위치 버튼 - route/routeDetail 페이지에서는 각 페이지에서 관리하므로 표시하지 않음 */}
          {resolvedCurrentPage !== "route" && resolvedCurrentPage !== "routeDetail" && (
            <button
              onClick={handleMyLocation}
              className="bg-white/40 backdrop-blur-md rounded-[12px] shadow-lg border border-white/50 size-[48px] flex items-center justify-center hover:bg-white/50 active:bg-white/60 transition-all"
              title="내 위치로 이동"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="rgba(0,0,0,0.7)" strokeWidth="2"/>
                <path d="M12 2V6" stroke="rgba(0,0,0,0.7)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 18V22" stroke="rgba(0,0,0,0.7)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 12H6" stroke="rgba(0,0,0,0.7)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18 12H22" stroke="rgba(0,0,0,0.7)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* 우하단 컨트롤 버튼들 - 데스크톱 줌 컨트롤 */}
      {resolvedCurrentPage === "map" && (
        <div className="hidden md:flex absolute right-4 bottom-10 flex-col gap-3 z-10">
          {/* 줌 컨트롤 - 데스크톱에서만 표시 */}
          <div className="bg-white/40 backdrop-blur-md rounded-[12px] shadow-lg border border-white/50 overflow-hidden w-[48px]">
            <button
              onClick={handleZoomIn}
              className="w-full h-[48px] border-b border-white/30 flex items-center justify-center hover:bg-white/50 active:bg-white/60 transition-all"
              title="줌 인"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13" stroke="rgba(0,0,0,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 3V13" stroke="rgba(0,0,0,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={handleZoomOut}
              className="w-full h-[48px] flex items-center justify-center hover:bg-white/50 active:bg-white/60 transition-all"
              title="줌 아웃"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8H13" stroke="rgba(0,0,0,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 버스 번호 입력 모달 */}
      {showBusInputModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/20 backdrop-blur-lg rounded-[16px] shadow-2xl border border-white/30 p-6 mx-4 max-w-[400px] w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              버스 번호 입력
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              추적할 버스 번호를 입력하세요 (최대 5개, 쉼표로 구분)
            </p>
            <input
              type="text"
              value={busNumberInput}
              onChange={(e) => setBusNumberInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleBusInputConfirm();
                }
              }}
              placeholder="예: 360, 472, 151"
              className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm border border-white/40 rounded-[12px] text-base text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-white/60 focus:bg-white/40 transition-all mb-4"
              autoFocus
            />
            {trackedBusNumbers.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-700 mb-2">현재 추적 중:</p>
                <div className="flex flex-wrap gap-2">
                  {trackedBusNumbers.map((num) => (
                    <span
                      key={num}
                      className="px-3 py-1 bg-white/40 backdrop-blur-sm text-gray-900 text-sm rounded-full border border-white/30"
                    >
                      {num}번
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleBusInputCancel}
                className="flex-1 py-3 bg-white/30 backdrop-blur-sm text-gray-900 font-medium rounded-[12px] hover:bg-white/40 active:bg-white/50 border border-white/30 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
              >
                취소
              </button>
              <button
                onClick={handleBusInputConfirm}
                className="flex-1 py-3 bg-white/40 backdrop-blur-sm text-gray-900 font-medium rounded-[12px] hover:bg-white/50 active:bg-white/60 border border-white/30 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
