/**
 * 메인 앱 레이아웃
 * 인증 후 페이지들의 공통 레이아웃 (팝업, 오버레이 등)
 */

import { useState } from "react";
import { Outlet, useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { MapView } from "@/app/components/MapView";
import { DashboardPopup } from "@/app/components/DashboardPopup";
import { FavoritesPlaces } from "@/app/components/FavoritesPlaces";
import { SearchResultsPage } from "@/app/components/SearchResultsPage";
import { PlaceDetailPage } from "@/app/components/PlaceDetailPage";
import subwayMapImage from "@/assets/subway-map-image.png";

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // 팝업 상태
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isSubwayOverlayOpen, setIsSubwayOverlayOpen] = useState(false);

  // 검색 결과 상태 (URL 쿼리 파라미터로 관리)
  const searchQuery = searchParams.get("q") || "";
  const isSearchResultsOpen = searchParams.has("q");

  // 장소 상세 상태 (URL 쿼리 파라미터로 관리)
  const placeId = searchParams.get("place");
  const isPlaceDetailOpen = !!placeId;
  const [selectedPlace, setSelectedPlace] = useState<{
    id: string;
    name: string;
    address: string;
    distance: string;
    icon: string;
    isFavorited?: boolean;
  } | null>(null);

  // 노선도 줌/드래그 상태
  const [subwayZoom, setSubwayZoom] = useState(1);
  const [subwayPosition, setSubwayPosition] = useState({ x: 0, y: 0 });
  const [isSubwayDragging, setIsSubwayDragging] = useState(false);
  const [subwayDragStart, setSubwayDragStart] = useState({ x: 0, y: 0 });

  // 현재 페이지 확인
  const currentPath = location.pathname;
  const isMapPage = currentPath === "/map";
  const isSubwayPage = currentPath === "/subway";

  // 페이지 이동 핸들러
  const handleNavigate = (page: string) => {
    if (page === "favorites") {
      setIsFavoritesOpen(true);
      return;
    }

    const pageRoutes: Record<string, string> = {
      map: "/map",
      search: "/search",
      subway: "/subway",
      route: "/route",
      routeDetail: "/route/detail",
    };

    const route = pageRoutes[page];
    if (route) {
      // search 페이지로 이동할 때는 항상 쿼리 파라미터를 제거
      // 이렇게 하면 다른 화면에서 SearchPage로 왔을 때 SearchResultsPage가 자동으로 열리지 않음
      if (page === "search") {
        navigate("/search", { replace: false });
      } else {
        navigate(route);
      }
    }
  };

  // 뒤로가기 핸들러 (브라우저 히스토리 활용)
  const handleBack = () => {
    // 브라우저 히스토리를 사용하여 이전 페이지로 이동
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // 히스토리가 없으면 기본적으로 검색 페이지로 이동
      navigate("/search");
    }
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    setIsDashboardOpen(false);
    navigate("/login");
  };

  // 검색 제출 핸들러
  const handleSearchSubmit = (query: string) => {
    if (query.trim()) {
      // 검색 결과는 히스토리 스택을 늘리지 않고 현재 /search 엔트리를
      // /search?q=... 로 교체한다.
      navigate(
        {
          pathname: "/search",
          search: `?q=${encodeURIComponent(query)}`,
        },
        { replace: true }
      );
    }
  };

  // 검색 결과 닫기
  const handleCloseSearchResults = () => {
    // 쿼리 없이 /search 로 현재 엔트리를 교체하여,
    // 이후 뒤로가기를 하면 바로 이전 화면(예: /map, /route 등)으로 이동.
    navigate("/search", { replace: true });
  };

  // 장소 클릭 핸들러
  const handlePlaceClick = (result: {
    id: string;
    name: string;
    distance?: string;
    icon: string;
    isFavorited?: boolean;
  }) => {
    setSelectedPlace({
      id: result.id,
      name: result.name,
      address: "123 Main Street, City",
      distance: result.distance || "1.2km",
      icon: result.icon,
      isFavorited: result.isFavorited,
    });
    searchParams.set("place", result.id);
    setSearchParams(searchParams);
  };

  // 장소 상세 닫기
  const handleClosePlaceDetail = () => {
    searchParams.delete("place");
    setSearchParams(searchParams);
    setSelectedPlace(null);
  };

  // 노선도 이벤트 핸들러들
  const handleSubwayMouseDown = (e: React.MouseEvent) => {
    setIsSubwayDragging(true);
    setSubwayDragStart({
      x: e.clientX - subwayPosition.x,
      y: e.clientY - subwayPosition.y,
    });
  };

  const handleSubwayMouseMove = (e: React.MouseEvent) => {
    if (!isSubwayDragging) return;
    setSubwayPosition({
      x: e.clientX - subwayDragStart.x,
      y: e.clientY - subwayDragStart.y,
    });
  };

  const handleSubwayMouseUp = () => {
    setIsSubwayDragging(false);
  };

  const handleSubwayTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsSubwayDragging(true);
    setSubwayDragStart({
      x: touch.clientX - subwayPosition.x,
      y: touch.clientY - subwayPosition.y,
    });
  };

  const handleSubwayTouchMove = (e: React.TouchEvent) => {
    if (!isSubwayDragging) return;
    const touch = e.touches[0];
    setSubwayPosition({
      x: touch.clientX - subwayDragStart.x,
      y: touch.clientY - subwayDragStart.y,
    });
  };

  const handleSubwayTouchEnd = () => {
    setIsSubwayDragging(false);
  };

  const handleSubwayWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setSubwayZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  return (
    <div className="size-full bg-white flex">
      {/* 앱 화면 - 모바일에서는 전체 화면, 데스크톱에서는 왼쪽 고정 */}
      <div
        className={`w-full h-full relative flex-shrink-0 z-10 ${isMapPage ? "lg:w-0" : "lg:w-[400px]"}`}
      >
        {/* 모바일: 백그라운드 지도 */}
        <div className="lg:hidden absolute inset-0">
          <MapView onNavigate={handleNavigate} />
        </div>

        {/* 페이지 콘텐츠 */}
        {!isMapPage && (
          <div className="absolute inset-0 lg:relative lg:h-full">
            <Outlet
              context={{
                onNavigate: handleNavigate,
                onBack: handleBack,
                onOpenDashboard: () => setIsDashboardOpen(true),
                onOpenFavorites: () => setIsFavoritesOpen(true),
                onSearchSubmit: handleSearchSubmit,
              }}
            />
          </div>
        )}
      </div>

      {/* 데스크톱: 오른쪽 지도 또는 노선도 영역 */}
      <div className="hidden lg:block flex-1 h-full relative">
        {isSubwayPage ? (
          // 노선도 표시
          <div className="w-full h-full bg-white flex items-center justify-center overflow-hidden">
            <img
              src={subwayMapImage}
              alt="지하철 노선도"
              className={`w-full h-full object-contain ${isSubwayDragging ? "cursor-grabbing" : "cursor-grab"}`}
              style={{
                transform: `scale(${subwayZoom}) translate(${subwayPosition.x / subwayZoom}px, ${subwayPosition.y / subwayZoom}px)`,
                transition: isSubwayDragging ? "none" : "transform 0.3s ease-out",
              }}
              onMouseDown={handleSubwayMouseDown}
              onMouseMove={handleSubwayMouseMove}
              onMouseUp={handleSubwayMouseUp}
              onMouseLeave={handleSubwayMouseUp}
              onWheel={handleSubwayWheel}
              onTouchStart={handleSubwayTouchStart}
              onTouchMove={handleSubwayTouchMove}
              onTouchEnd={handleSubwayTouchEnd}
              draggable={false}
            />
          </div>
        ) : (
          // 지도 표시
          <MapView />
        )}

        {/* 데스크톱: 지도 전체 화면일 때 왼쪽 상단 돋보기 버튼 */}
        {isMapPage && (
          <button
            onClick={() => navigate("/search")}
            className="absolute top-4 left-4 bg-white rounded-[12px] shadow-[4px_4px_0px_0px_black] border-3 border-black size-[56px] flex items-center justify-center hover:bg-[#f0f0f0] active:bg-[#e5e7eb] transition-colors z-20"
            title="검색 화면 열기"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="#2D5F3F" strokeWidth="2" />
              <path d="M16 16L21 21" stroke="#2D5F3F" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* 대시보드 팝업 */}
      <DashboardPopup
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        onLogout={handleLogout}
      />

      {/* 즐겨찾기 팝업 */}
      <FavoritesPlaces
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        onNavigate={(page) => {
          setIsFavoritesOpen(false);
          handleNavigate(page);
        }}
        onOpenDashboard={() => {
          setIsFavoritesOpen(false);
          setIsDashboardOpen(true);
        }}
        onOpenSubway={() => {
          setIsFavoritesOpen(false);
          setIsSubwayOverlayOpen(true);
        }}
      />

      {/* 검색 결과 페이지 */}
      <SearchResultsPage
        isOpen={isSearchResultsOpen}
        onClose={handleCloseSearchResults}
        searchQuery={searchQuery}
        onPlaceClick={handlePlaceClick}
      />

      {/* 장소 상세 페이지 */}
      <PlaceDetailPage
        isOpen={isPlaceDetailOpen}
        onClose={handleClosePlaceDetail}
        place={selectedPlace}
        onToggleFavorite={(placeId) => {
          if (selectedPlace) {
            setSelectedPlace({
              ...selectedPlace,
              isFavorited: !selectedPlace.isFavorited,
            });
          }
        }}
        onStartNavigation={() => {
          handleClosePlaceDetail();
          handleCloseSearchResults();
          navigate("/route");
        }}
        onSearchSubmit={handleSearchSubmit}
        onNavigate={(page) => {
          handleClosePlaceDetail();
          handleCloseSearchResults();
          handleNavigate(page);
        }}
        onOpenDashboard={() => {
          handleClosePlaceDetail();
          handleCloseSearchResults();
          setIsDashboardOpen(true);
        }}
        onOpenSubway={() => {
          handleClosePlaceDetail();
          handleCloseSearchResults();
          setIsSubwayOverlayOpen(true);
        }}
      />

      {/* 글로벌 지하철 노선도 오버레이 */}
      {isSubwayOverlayOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-[60] transition-opacity"
            onClick={() => setIsSubwayOverlayOpen(false)}
          />
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto w-full h-full max-w-[95vw] max-h-[95vh] bg-white rounded-[12px] border-[3px] border-black shadow-[8px_8px_0px_0px_black] overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsSubwayOverlayOpen(false)}
                className="absolute top-4 right-4 bg-white rounded-[14px] w-[40px] h-[40px] flex items-center justify-center border-[3px] border-black shadow-[4px_4px_0px_0px_black] hover:bg-gray-50 active:shadow-[2px_2px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all z-10"
              >
                <p className="font-['Press_Start_2P:Regular',sans-serif] text-[16px] text-black">
                  ✕
                </p>
              </button>
              <div className="w-full h-full bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={subwayMapImage}
                  alt="지하철 노선도"
                  className={`w-full h-full object-contain ${isSubwayDragging ? "cursor-grabbing" : "cursor-grab"}`}
                  style={{
                    transform: `scale(${subwayZoom}) translate(${subwayPosition.x / subwayZoom}px, ${subwayPosition.y / subwayZoom}px)`,
                    transition: isSubwayDragging ? "none" : "transform 0.3s ease-out",
                  }}
                  onMouseDown={handleSubwayMouseDown}
                  onMouseMove={handleSubwayMouseMove}
                  onMouseUp={handleSubwayMouseUp}
                  onMouseLeave={handleSubwayMouseUp}
                  onWheel={handleSubwayWheel}
                  onTouchStart={handleSubwayTouchStart}
                  onTouchMove={handleSubwayTouchMove}
                  onTouchEnd={handleSubwayTouchEnd}
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
