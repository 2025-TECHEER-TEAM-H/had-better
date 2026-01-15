import { useEffect, useRef, useState } from "react";
import { CoverPage } from "./components/CoverPage";
import { DashboardPage } from "./components/DashboardPage";
import { FavoritePlacesPage } from "./components/FavoritePlacesPage";
import { FullMapPage } from "./components/FullMapPage";
import { GameResultPage } from "./components/GameResultPage";
import { LoginPage } from "./components/LoginPage";
import MapContainer, { type MapContainerHandle } from "./components/MapContainer";
import { MapPage } from "./components/MapPage";
import { OnboardingPage } from "./components/OnboardingPage";
import { PlaceInfoPage } from "./components/PlaceInfoPage";
import { PlaceMapPage } from "./components/PlaceMapPage";
import { PlacesPage } from "./components/PlacesPage";
import { RouteDetailPage } from "./components/RouteDetailPage";
import { RouteSelectionPage } from "./components/RouteSelectionPage";
import { SignUpPage } from "./components/SignUpPage";
import { authApi, tokenManager } from "./utils/api";

type Page = "cover" | "onboarding" | "login" | "signup" | "map" | "result" | "dashboard" | "places" | "route-selection" | "route-detail" | "place-info" | "place-map" | "full-map" | "favorites" | "place-detail";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("cover");
  const [pageHistory, setPageHistory] = useState<Page[]>([]);
  const [routeSelection, setRouteSelection] = useState({
    user: 1,
    ghost1: 2,
    ghost2: 3,
  });
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [fromFavorites, setFromFavorites] = useState(false);
  const mapRef = useRef<MapContainerHandle>(null);

  // 앱 시작 시 토큰 확인 및 사용자 정보 로드
  useEffect(() => {
    const token = tokenManager.getToken();
    if (token) {
      // 토큰이 있으면 사용자 정보 확인
      authApi.getCurrentUser()
        .then((response) => {
          if (response.success && response.data) {
            setCurrentPage("full-map");
          } else {
            // 토큰이 유효하지 않으면 제거
            tokenManager.removeToken();
          }
        })
        .catch(() => {
          tokenManager.removeToken();
        });
    }
  }, []);

  const handleGetStarted = () => {
    setCurrentPage("onboarding");
  };

  const handleOnboardingComplete = () => {
    setCurrentPage("login");
  };

  const handleLogin = () => {
    setCurrentPage("full-map");
  };

  const handleSignUp = () => {
    // 회원가입 성공 후 로그인 페이지로 이동
    setCurrentPage("login");
  };

  const handleNavigate = (page: string, data?: any) => {
    // 특수 네비게이션: 이전 화면으로 돌아가기
    if (page === "__back__") {
      setPageHistory((prev) => {
        const lastPage = prev[prev.length - 1];
        setCurrentPage(lastPage ?? "map");
        return lastPage ? prev.slice(0, -1) : prev;
      });
      return;
    }

    const nextPage = page as Page;

    // 현재 페이지를 히스토리에 쌓아서 "뒤로가기"가 가능하도록 함
    setPageHistory((prev) => {
      if (nextPage === currentPage) return prev;
      return [...prev, currentPage];
    });

    if (data?.routeSelection) {
      setRouteSelection(data.routeSelection);
    }
    if (data?.place) {
      setSelectedPlace(data.place);
    }
    if (data?.fromFavorites !== undefined) {
      setFromFavorites(data.fromFavorites);
    } else {
      setFromFavorites(false);
    }
    setCurrentPage(nextPage);
  };

  const handleContinue = () => {
    setCurrentPage("map");
  };

  const handleBackToLogin = () => {
    setCurrentPage("login");
  };

  const handleGoToSignUp = () => {
    setCurrentPage("signup");
  };

  // 지도가 보이는 페이지 목록
  const mapVisiblePages: Page[] = [
    "full-map",
    "map",
    "route-selection",
    "place-map",
    "route-detail",
    "places", // 추가!
  ];
  const isMapVisible = mapVisiblePages.includes(currentPage);

  return (
    <div className="size-full flex items-center justify-center bg-[#1a1a2e]">
      <div className="relative w-[393px] h-[852px] bg-white rounded-[40px] overflow-hidden border-[7.5px] border-[#1a1a2e]">

        {/* 1. 지도 레이어 (z-0) */}
        <div className="absolute inset-0 z-0">
          <MapContainer ref={mapRef} />
        </div>

        {/* 2. UI 및 배경 통합 레이어 (z-20) */}
        <div className="absolute inset-0 z-20 pointer-events-none">

          {/* 지도가 안 보이는 페이지: 여기서 배경색과 클릭 권한을 다 가집니다 */}
          {!isMapVisible && (
            <div className="absolute inset-0 bg-white pointer-events-auto z-[999]">
              {/* 이제 이 안의 버튼들은 무조건 눌립니다! */}
              {currentPage === "cover" && <CoverPage onGetStarted={handleGetStarted} />}
              {currentPage === "onboarding" && <OnboardingPage onComplete={handleOnboardingComplete} />}
              {currentPage === "login" && <LoginPage onLogin={handleLogin} onSignUp={handleGoToSignUp} />}
              {currentPage === "signup" && <SignUpPage onSignUp={handleSignUp} onBack={handleBackToLogin} />}
              {currentPage === "result" && <GameResultPage onContinue={handleContinue} onNavigate={handleNavigate} />}
              {currentPage === "dashboard" && <DashboardPage onNavigate={handleNavigate} />}
              {currentPage === "place-info" && <PlaceInfoPage onNavigate={handleNavigate} place={selectedPlace} fromFavorites={fromFavorites} />}
              {currentPage === "favorites" && <FavoritePlacesPage onNavigate={handleNavigate} />}
            </div>
          )}

          {/* 지도가 보이는 페이지: 투명하게 유지하되 내부 컴포넌트가 auto를 가짐 */}
          {isMapVisible && (
            <>
              {currentPage === "full-map" && (
                <FullMapPage
                  onNavigate={handleNavigate}
                  onZoomIn={() => mapRef.current?.zoomIn()}
                  onZoomOut={() => mapRef.current?.zoomOut()}
                  onRecenter={() => mapRef.current?.recenter()}
                />
              )}
              {currentPage === "map" && <MapPage onNavigate={handleNavigate} />}
              {currentPage === "places" && <PlacesPage onNavigate={handleNavigate} />}
              {currentPage === "route-selection" && <RouteSelectionPage onNavigate={handleNavigate} />}
              {currentPage === "route-detail" && <RouteDetailPage onNavigate={handleNavigate} routeSelection={routeSelection} />}
              {currentPage === "place-map" && <PlaceMapPage onNavigate={handleNavigate} place={selectedPlace} fromFavorites={fromFavorites} />}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
