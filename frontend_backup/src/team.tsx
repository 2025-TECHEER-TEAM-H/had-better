import { useState, useEffect } from "react";
import { CoverPage } from "./components/CoverPage";
import { OnboardingPage } from "./components/OnboardingPage";
import { LoginPage } from "./components/LoginPage";
import { SignUpPage } from "./components/SignUpPage";
import { MapPage } from "./components/MapPage";
import { GameResultPage } from "./components/GameResultPage";
import { DashboardPage } from "./components/DashboardPage";
import { PlacesPage } from "./components/PlacesPage";
import { RouteSelectionPage } from "./components/RouteSelectionPage";
import { RouteDetailPage } from "./components/RouteDetailPage";
import { PlaceInfoPage } from "./components/PlaceInfoPage";
import { PlaceMapPage } from "./components/PlaceMapPage";
import { FullMapPage } from "./components/FullMapPage";
import { FavoritePlacesPage } from "./components/FavoritePlacesPage";
import { tokenManager, authApi } from "./utils/api";

type Page = "cover" | "onboarding" | "login" | "signup" | "map" | "result" | "dashboard" | "places" | "route-selection" | "route-detail" | "place-info" | "place-map" | "full-map" | "favorites" | "place-detail";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("cover");
  const [routeSelection, setRouteSelection] = useState({
    user: 1,
    ghost1: 2,
    ghost2: 3,
  });
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [fromFavorites, setFromFavorites] = useState(false);

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
    setCurrentPage(page as Page);
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

  return (
    <div className="size-full flex items-center justify-center bg-[#1a1a2e]">
      {/* Mobile Frame */}
      <div className="relative w-[393px] h-[852px] bg-white rounded-[40px] overflow-hidden shadow-[0px_0px_0px_4px_#4ecca3,0px_30px_80px_0px_rgba(78,204,163,0.5),0px_0px_60px_0px_rgba(78,204,163,0.3)] border-[7.5px] border-[#1a1a2e]">
        {currentPage === "cover" && <CoverPage onGetStarted={handleGetStarted} />}
        {currentPage === "onboarding" && <OnboardingPage onComplete={handleOnboardingComplete} />}
        {currentPage === "login" && <LoginPage onLogin={handleLogin} onSignUp={handleGoToSignUp} />}
        {currentPage === "signup" && <SignUpPage onSignUp={handleSignUp} onBack={handleBackToLogin} />}
        {currentPage === "full-map" && <FullMapPage onNavigate={handleNavigate} />}
        {currentPage === "map" && <MapPage onNavigate={handleNavigate} />}
        {currentPage === "result" && <GameResultPage onContinue={handleContinue} onNavigate={handleNavigate} />}
        {currentPage === "dashboard" && <DashboardPage onNavigate={handleNavigate} />}
        {currentPage === "places" && <PlacesPage onNavigate={handleNavigate} />}
        {currentPage === "route-selection" && <RouteSelectionPage onNavigate={handleNavigate} />}
        {currentPage === "route-detail" && <RouteDetailPage onNavigate={handleNavigate} routeSelection={routeSelection} />}
        {currentPage === "place-info" && <PlaceInfoPage onNavigate={handleNavigate} place={selectedPlace} fromFavorites={fromFavorites} />}
        {currentPage === "place-map" && <PlaceMapPage onNavigate={handleNavigate} place={selectedPlace} fromFavorites={fromFavorites} />}
        {currentPage === "favorites" && <FavoritePlacesPage onNavigate={handleNavigate} />}
      </div>
    </div>
  );
}