import { useMapStore } from "@/stores/mapStore";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { useLocation } from "react-router-dom";

type PageType = "map" | "search" | "favorites" | "subway" | "route";

// 마커 정보 타입
interface MarkerInfo {
  id: string;
  coordinates: [number, number]; // [경도, 위도]
  name: string;
  icon?: string;
  // 있으면 라벨에 2줄로 표시(없으면 name만 표시). 다른 파일 수정 없이 optional로 둠.
  address?: string;
}

// 경로 라인 정보 타입
export interface RouteLineInfo {
  id: string;
  coordinates: [number, number][]; // [[경도, 위도], ...]
  color: string;
  width?: number;
  opacity?: number;
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
}, ref) {
  const location = useLocation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const placeMarkers = useRef<mapboxgl.Marker[]>([]); // 검색 결과 마커들
  const endpointMarkers = useRef<mapboxgl.Marker[]>([]); // 출발지/도착지 마커
  const playerMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map()); // 플레이어 마커들
  const initialLocationApplied = useRef(false); // 초기 위치 적용 여부
  // SVG <defs> id 충돌 방지: MapView 인스턴스별 고유 prefix (SVG id는 document 전역 namespace)
  const svgIdPrefixRef = useRef(`m${Math.random().toString(36).slice(2)}`);
  const routesFitted = useRef(false); // 경로 범위 맞춤 여부
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false); // 지도 로드 상태

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

  // ref로 map 객체 노출
  useImperativeHandle(ref, () => ({
    map: map.current,
  }));

  // 지도 초기화
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // 저장된 위치가 있으면 그 위치로, 없으면 기본값으로 시작
    const initialCenter = lastCenter || defaultCenter;
    const initialZoom = lastZoom || defaultZoom;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/outdoors-v12",
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
    });

    // 지도 이동/줌 완료 시 상태 저장 (moveend 이벤트)
    map.current.on("moveend", () => {
      const mapInstance = map.current;
      if (mapInstance) {
        const center = mapInstance.getCenter();
        const zoom = mapInstance.getZoom();
        setMapView([center.lng, center.lat], zoom);
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
    // (labelText를 항상 black으로 고정해서, 밝기 기반 분기는 필요 없음)

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
      // 핀 내부(흰 원)에는 아이콘/글자 없이 비워둠

      // 글씨색은 항상 검정으로 통일
      const labelText = "black";
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
          <!-- 라벨(우측, 장소 이름) -->
          <div style="
            position: absolute;
            left: 18px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 14px 10px 44px; /* 핀 아래로 깔리므로 텍스트는 핀 오른쪽에서 시작 */
            background: rgba(255,255,255,0.96);
            color: ${labelText};
            border: 2px solid rgba(0,0,0,0.18);
            border-radius: 999px;
            white-space: nowrap;
            max-width: 240px;
            overflow: visible;
            user-select: none;
            z-index: 0; /* 핀보다 뒤 */
          ">
            <!-- 텍스트(장소 위치) -->
            <div style="
              display: flex;
              flex-direction: column;
              gap: 2px;
              min-width: 0;
              padding-right: 2px;
            ">
              <div style="
                font-size: 12px;
                font-weight: 900;
                line-height: 1.05;
                overflow: hidden;
                text-overflow: ellipsis;
              ">${markerInfo.name}</div>
              <div style="
                display: ${markerInfo.address ? "block" : "none"};
                font-size: 10px;
                font-weight: 700;
                line-height: 1.05;
                opacity: 0.65;
                overflow: hidden;
                text-overflow: ellipsis;
              ">${markerInfo.address ?? ""}</div>
            </div>
          </div>

          <!-- 핀(좌측) -->
          <div style="
            position: absolute;
            left: 0;
            top: 0;
            width: 48px;
            height: 58px;
            filter: none;
            z-index: 1; /* 라벨보다 위 */
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

    // 기존 경로 레이어 및 소스 제거
    routeLines.forEach((_, index) => {
      const layerId = `route-line-${index}`;
      const sourceId = `route-source-${index}`;

      if (mapInstance.getLayer(layerId)) {
        mapInstance.removeLayer(layerId);
      }
      if (mapInstance.getSource(sourceId)) {
        mapInstance.removeSource(sourceId);
      }
    });

    // 이전에 추가된 레이어들도 정리 (최대 10개까지)
    for (let i = 0; i < 10; i++) {
      const layerId = `route-line-${i}`;
      const sourceId = `route-source-${i}`;

      if (mapInstance.getLayer(layerId)) {
        mapInstance.removeLayer(layerId);
      }
      if (mapInstance.getSource(sourceId)) {
        mapInstance.removeSource(sourceId);
      }
    }

    // 새 경로 라인 추가
    routeLines.forEach((route, index) => {
      const sourceId = `route-source-${index}`;
      const layerId = `route-line-${index}`;

      // GeoJSON 소스 추가
      mapInstance.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route.coordinates,
          },
        },
      });

      // 라인 레이어 추가
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
          'line-width': route.width || 5,
          'line-opacity': route.opacity || 0.8,
        },
      });
    });

    // 클린업
    return () => {
      // 지도가 이미 제거되었는지 확인
      if (!mapInstance || !mapInstance.getStyle()) return;

      routeLines.forEach((_, index) => {
        const layerId = `route-line-${index}`;
        const sourceId = `route-source-${index}`;

        try {
          if (mapInstance.getLayer(layerId)) {
            mapInstance.removeLayer(layerId);
          }
          if (mapInstance.getSource(sourceId)) {
            mapInstance.removeSource(sourceId);
          }
        } catch {
          // 지도가 제거된 경우 무시
        }
      });
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

      const bgColor = endpoint.type === 'departure' ? '#4CAF50' : '#F44336';
      const icon = endpoint.type === 'departure' ? '🚩' : '🏁';

      el.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
        ">
          <div style="
            width: 44px;
            height: 44px;
            background: ${bgColor};
            border: 3px solid black;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          ">${icon}</div>
          <div style="
            margin-top: 4px;
            padding: 4px 8px;
            background: white;
            border: 2px solid black;
            border-radius: 6px;
            font-size: 11px;
            font-weight: bold;
            white-space: nowrap;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          ">${endpoint.name}</div>
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
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

      {/* 지도 컨트롤 버튼들 */}
      <div className="absolute right-4 bottom-20 flex flex-col gap-3 z-10">
        {/* 지도 페이지에서만 컨트롤 표시 */}
        {resolvedCurrentPage === "map" && (
          <>
            {/* 네비게이션 버튼들 - 모바일에서만 표시 */}
            {onNavigate && (
              <>
                <button
                  onClick={() => onNavigate("map")}
                  className="md:hidden bg-white rounded-[12px] shadow-[4px_4px_0px_0px_black] border-3 border-black size-[48px] flex items-center justify-center hover:bg-[#f0f0f0] active:bg-[#e5e7eb] transition-colors"
                  title="지도"
                >
                  <span className="text-[20px]">🗺️</span>
                </button>

                <button
                  onClick={() => onNavigate("search")}
                  className="md:hidden bg-white rounded-[12px] shadow-[4px_4px_0px_0px_black] border-3 border-black size-[48px] flex items-center justify-center hover:bg-[#f0f0f0] active:bg-[#e5e7eb] transition-colors"
                  title="검색"
                >
                  <span className="text-[20px]">🔍</span>
                </button>

                <button
                  onClick={() => onNavigate("favorites")}
                  className="md:hidden bg-white rounded-[12px] shadow-[4px_4px_0px_0px_black] border-3 border-black size-[48px] flex items-center justify-center hover:bg-[#f0f0f0] active:bg-[#e5e7eb] transition-colors"
                  title="MY"
                >
                  <span className="text-[20px]">⭐</span>
                </button>
              </>
            )}

            {/* 줌 컨트롤 */}
            <div className="bg-white rounded-[12px] shadow-[4px_4px_0px_0px_black] border-3 border-black overflow-hidden w-[48px]">
              <button
                onClick={handleZoomIn}
                className="w-full h-[48px] border-b-2 border-[#e5e7eb] flex items-center justify-center hover:bg-[#f0f0f0] active:bg-[#e5e7eb] transition-colors"
                title="줌 인"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13" stroke="#2D5F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 3V13" stroke="#2D5F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={handleZoomOut}
                className="w-full h-[48px] flex items-center justify-center hover:bg-[#f0f0f0] active:bg-[#e5e7eb] transition-colors"
                title="줌 아웃"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13" stroke="#2D5F3F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* 현재 위치 버튼 */}
            <button
              onClick={handleMyLocation}
              className="bg-white rounded-[12px] shadow-[4px_4px_0px_0px_black] border-3 border-black size-[48px] flex items-center justify-center hover:bg-[#f0f0f0] active:bg-[#e5e7eb] transition-colors"
              title="내 위치로 이동"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="#2D5F3F" strokeWidth="2"/>
                <path d="M12 2V6" stroke="#2D5F3F" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 18V22" stroke="#2D5F3F" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 12H6" stroke="#2D5F3F" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18 12H22" stroke="#2D5F3F" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
});
