import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useLocation } from "react-router-dom";
import { useMapStore } from "@/stores/mapStore";

type PageType = "map" | "search" | "favorites" | "subway";

// 마커 정보 타입
interface MarkerInfo {
  id: string;
  coordinates: [number, number]; // [경도, 위도]
  name: string;
  icon?: string;
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
}

// Mapbox Access Token 설정
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

export function MapView({ onNavigate, currentPage, targetLocation, markers = [] }: MapViewProps = {}) {
  const location = useLocation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const placeMarkers = useRef<mapboxgl.Marker[]>([]); // 검색 결과 마커들
  const initialLocationApplied = useRef(false); // 초기 위치 적용 여부
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
          : "favorites");

  // 서울 시청 좌표 (기본값)
  const defaultCenter: [number, number] = [126.9780, 37.5665];
  const defaultZoom = 14;

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

    // 기존 마커들 제거
    placeMarkers.current.forEach((marker) => marker.remove());
    placeMarkers.current = [];

    // 새 마커들 추가
    markers.forEach((markerInfo, index) => {
      // 마커 엘리먼트 생성
      const el = document.createElement("div");
      el.className = "place-marker";
      el.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        ">
          <div style="
            width: 40px;
            height: 40px;
            background: ${index === 0 ? '#4a9960' : 'white'};
            border: 3px solid black;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">${markerInfo.icon || '📍'}</div>
          <div style="
            margin-top: 4px;
            padding: 2px 6px;
            background: white;
            border: 2px solid black;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
            white-space: nowrap;
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${markerInfo.name}</div>
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(markerInfo.coordinates)
        .addTo(map.current!);

      placeMarkers.current.push(marker);
    });

    // 클린업: 컴포넌트 언마운트 시 마커 제거
    return () => {
      placeMarkers.current.forEach((marker) => marker.remove());
      placeMarkers.current = [];
    };
  }, [markers, isMapLoaded]);

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
      <div ref={mapContainer} className="w-full h-full" />

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
}
