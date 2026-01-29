/**
 * 메인 앱 레이아웃
 * 인증 후 페이지들의 공통 레이아웃 (팝업, 오버레이 등)
 */

import { DashboardPopup } from "@/app/components/DashboardPopup";
import { FavoritesPlaces } from "@/app/components/FavoritesPlaces";
import { MapView, type PageType } from "@/app/components/MapView";
import { PlaceDetailPage } from "@/app/components/PlaceDetailPage";
import { SearchResultsPage } from "@/app/components/SearchResultsPage";
import { useState } from "react";
import { Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";
// [로그인 API 작업] 로그아웃 기능을 위해 추가 - feature/front-login-api 브랜치
import { SubwayMap } from "@/components/SubwayMap";
import authService from "@/services/authService";
import { useAuthStore } from "@/stores/authStore";

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // [로그인 API 작업] 로그아웃 시 토큰 무효화를 위해 추가 - feature/front-login-api 브랜치
  const { refreshToken, logout: clearAuthState } = useAuthStore();

  // 팝업 상태
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isSubwayOverlayOpen, setIsSubwayOverlayOpen] = useState(false);

  // 검색 결과 상태 (URL 쿼리 파라미터로 관리)
  const searchQuery = searchParams.get("q") || "";
  const isSearchResultsOpen = searchParams.has("q");

  // 장소 상세 상태 (URL 쿼리 파라미터로 관리)
  const _placeId = searchParams.get("place");
  const isPlaceDetailOpen = !!_placeId;
  const [selectedPlace, setSelectedPlace] = useState<{
    id: string;
    name: string;
    address: string;
    distance: string;
    icon: string;
    isFavorited?: boolean;
    coordinates?: { lon: number; lat: number };
    _poiPlaceId?: number; // POI Place ID (즐겨찾기 토글용)
  } | null>(null);

  // 현재 페이지 확인
  const currentPath = location.pathname;
  const isMapPage = currentPath === "/map";
  const isSearchPage = currentPath === "/search";
  const isRoutePage = currentPath === "/route";
  const isRouteDetailPage = currentPath === "/route/detail";

  // MapView에 전달할 currentPage 결정
  let mapCurrentPage: PageType;
  if (isMapPage) {
    mapCurrentPage = "map";
  } else if (isSearchPage) {
    mapCurrentPage = "search"; // SearchPage일 때만 레이어 버튼 표시
  } else if (isRoutePage) {
    mapCurrentPage = "route"; // RouteSelectionPage - MapView에서 버튼 숨김
  } else if (isRouteDetailPage) {
    mapCurrentPage = "routeDetail"; // RouteDetailPage - MapView에서 버튼 숨김
  } else {
    mapCurrentPage = "background"; // 기타 페이지
  }

  // 페이지 이동 핸들러
  const handleNavigate = (page: string) => {
    if (page === "favorites") {
      setIsFavoritesOpen(true);
      return;
    }

    const pageRoutes: Record<string, string> = {
      map: "/map",
      search: "/search",
      stats: "/stats",
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

  // [로그인 API 작업] 로그아웃 핸들러 - 백엔드 API 호출 추가 (feature/front-login-api 브랜치)
  // 기존: navigate("/login")만 호출
  // 변경: 낙관적 UI - 즉시 로컬 상태 정리 후 API는 백그라운드 처리
  const handleLogout = () => {
    setIsDashboardOpen(false);

    // refreshToken을 먼저 저장 (clearAuthState 후에는 null이 됨)
    const tokenToInvalidate = refreshToken;

    // 로컬 인증 상태 즉시 초기화
    clearAuthState();

    // 로그인 페이지로 즉시 이동
    navigate("/login");

    // 백엔드에 토큰 무효화 요청 (백그라운드, fire-and-forget)
    if (tokenToInvalidate) {
      authService.logout(tokenToInvalidate);
    }
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
    status?: string; // address
    icon: string;
    isFavorited?: boolean;
    coordinates?: { lon: number; lat: number };
    _poiPlaceId?: number; // POI Place ID (즐겨찾기 토글용)
  }) => {
    setSelectedPlace({
      id: result.id,
      name: result.name,
      address: result.status || "", // SearchResultsPage에서 status가 address
      distance: result.distance || "",
      icon: result.icon,
      isFavorited: result.isFavorited,
      coordinates: result.coordinates,
      _poiPlaceId: result._poiPlaceId, // POI Place ID 전달
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

  return (
    <div className="size-full bg-white flex lg:h-screen lg:overflow-hidden">
      {/* 앱 화면 - 모바일에서는 전체 화면, 데스크톱에서는 왼쪽 고정 */}
      <div
        className={`w-full h-full relative flex-shrink-0 z-10 lg:h-screen lg:overflow-y-auto lg:overscroll-contain hb-sidebar-scroll ${isMapPage ? "lg:w-0" : "lg:w-[400px]"}`}
      >
        {/* 모바일: 백그라운드 지도 */}
        <div className="lg:hidden absolute inset-0">
          <MapView
            onNavigate={handleNavigate}
            currentPage={isMapPage ? "map" : "background"}
          />
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
                onOpenSubway: () => setIsSubwayOverlayOpen(true),
              }}
            />
          </div>
        )}
      </div>

      {/* 데스크톱: 오른쪽 지도 또는 노선도 영역 */}
      <div className="hidden lg:block flex-1 h-full lg:h-screen relative">
        {/* 지도 표시 - 현재 페이지에 따라 적절한 currentPage 전달 */}
        <MapView currentPage={mapCurrentPage} />

        {/* 데스크톱: 지도 전체 화면일 때 왼쪽 상단 돋보기 버튼 */}
        {isMapPage && (
          <button
            onClick={() => navigate("/search")}
            className="absolute top-4 left-4 bg-white/40 backdrop-blur-md rounded-[12px] shadow-lg border border-white/50 size-[56px] flex items-center justify-center hover:bg-white/50 active:bg-white/60 transition-all z-20"
            title="검색 화면 열기"
          >
            <span className="text-[24px]">🔍</span>
          </button>
        )}
      </div>

      {/* 대시보드 팝업 */}
      <DashboardPopup
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
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
        onToggleFavorite={(_placeId) => {
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
                className="absolute top-4 left-4 bg-white rounded-[14px] w-[40px] h-[40px] flex items-center justify-center border-[3px] border-black shadow-[4px_4px_0px_0px_black] hover:bg-gray-50 active:shadow-[2px_2px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all z-10"
              >
                <p className="font-['Press_Start_2P:Regular',sans-serif] text-[16px] text-black">
                  ✕
                </p>
              </button>
              <div className="w-full h-full bg-white overflow-hidden">
                <SubwayMap />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
