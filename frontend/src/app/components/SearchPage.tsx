import { AppHeader } from "@/app/components/AppHeader";                                                                           import { PlaceSearchModal } from "@/app/components/PlaceSearchModal";
import imgCoinGold2 from "@/assets/coin-gold.png";                                                                              
import imgGemGreen1 from "@/assets/gem-green.png";                                                                              
import imgGemRed1 from "@/assets/gem-red.png";
import imgSaw1 from "@/assets/saw.png";
import imgStar1 from "@/assets/star.png";
import subwayMapImage from "@/assets/subway-map-image.png";
import imgWindow2 from "@/assets/window.png";
import authService from "@/services/authService";
import userService from "@/services/userService";
import placeService, { type SearchPlaceHistory } from "@/services/placeService";
import { useAuthStore } from "@/stores/authStore";
import { useRouteStore } from "@/stores/routeStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 좌표 포함 장소 타입
interface LocationWithCoords {
  name: string;
  lat: number;
  lon: number;
}

type PageType = "map" | "search" | "favorites" | "subway" | "route";

interface SearchPageProps {
  onBack?: () => void;
  onNavigate?: (page: PageType) => void;
  onOpenDashboard?: () => void;
  onOpenFavorites?: () => void;
  isSubwayMode?: boolean;
  onSearchSubmit?: (query: string) => void;
}

interface Place {
  id: string;
  name: string;
  detail?: string;
  distance: string;
  time: string;
  icon: string;
  color: string;
}

interface FavoriteLocations {
  home: Place[];
  school: Place[];
  work: Place[];
}

export function SearchPage({ onBack, onNavigate, onOpenDashboard, onOpenFavorites, isSubwayMode = false, onSearchSubmit }: SearchPageProps) {
  const navigate = useNavigate();
  const { refreshToken, logout: clearAuthState, updateUser } = useAuthStore();
  const { setDepartureArrival, resetRoute } = useRouteStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [isWebView, setIsWebView] = useState(false);

  // 출발지/도착지 좌표 포함 상태
  const [selectedDeparture, setSelectedDeparture] = useState<LocationWithCoords | null>(null);
  const [selectedArrival, setSelectedArrival] = useState<LocationWithCoords | null>(null);

  // 장소 검색 모달 상태
  const [isPlaceSearchOpen, setIsPlaceSearchOpen] = useState(false);
  const [selectedFavoriteType, setSelectedFavoriteType] = useState<"home" | "school" | "work" | null>(null);
  const [favoriteLocations, setFavoriteLocations] = useState<FavoriteLocations>({
    home: [],
    school: [],
    work: [],
  });
  const [favoriteSavedToast, setFavoriteSavedToast] = useState<{
    type: "home" | "school" | "work";
    placeName: string;
  } | null>(null);

  useEffect(() => {
    if (!favoriteSavedToast) return;
    const t = window.setTimeout(() => setFavoriteSavedToast(null), 2000);
    return () => window.clearTimeout(t);
  }, [favoriteSavedToast]);

  // 최근 검색 기록 상태
  const [searchHistories, setSearchHistories] = useState<SearchPlaceHistory[]>([]);
  const [isLoadingHistories, setIsLoadingHistories] = useState(false);

  // 웹/앱 화면 감지
  useEffect(() => {
    const checkViewport = () => {
      setIsWebView(window.innerWidth > 768);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // 노선도 줌/드래그 상태
  const [subwayZoom, setSubwayZoom] = useState(1.5);
  const [subwayPosition, setSubwayPosition] = useState({ x: 0, y: 0 });
  const [isSubwayDragging, setIsSubwayDragging] = useState(false);
  const [subwayDragStart, setSubwayDragStart] = useState({ x: 0, y: 0 });

  // 햄버거 메뉴 팝오버 상태
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [isSavingNickname, setIsSavingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);

  const handleToggleProfileMenu = () => {
    setIsProfileMenuOpen((prev) => !prev);
  };

  // 최근 검색 기록 불러오기
  const loadSearchHistories = async () => {
    try {
      setIsLoadingHistories(true);
      const response = await placeService.getSearchPlaceHistories();
      if (response.status === "success" && response.data) {
        // UI에서는 최신 5개까지만 사용
        setSearchHistories(response.data.slice(0, 5));
      } else {
        setSearchHistories([]);
      }
    } catch (error) {
      console.error("최근 검색 기록 불러오기 실패:", error);
      setSearchHistories([]);
    } finally {
      setIsLoadingHistories(false);
    }
  };

  // 초기 마운트 시 최근 검색 기록 로드
  useEffect(() => {
    loadSearchHistories();
  }, []);

  // SearchResultsPage 등에서 검색 기록이 갱신되었을 때 이벤트로 동기화
  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ histories: SearchPlaceHistory[] }>;
      if (customEvent.detail?.histories) {
        // UI에서는 최신 5개까지만 사용
        setSearchHistories(customEvent.detail.histories.slice(0, 5));
      }
    };

    window.addEventListener("searchHistoriesUpdated", handler as EventListener);
    return () => {
      window.removeEventListener("searchHistoriesUpdated", handler as EventListener);
    };
  }, []);

  const handleEditProfileClick = () => {
    setIsProfileMenuOpen(false);
    setNicknameInput("");
    setNicknameError(null);
    setIsProfileDialogOpen(true);
  };

  const handleLogoutClick = () => {
    setIsProfileMenuOpen(false);
    const tokenToInvalidate = refreshToken;
    clearAuthState();
    navigate("/login");
    if (tokenToInvalidate) {
      authService.logout(tokenToInvalidate);
    }
  };

  const handleSaveNickname = async () => {
    const trimmed = nicknameInput.trim();
    if (!trimmed) {
      setNicknameError("닉네임을 입력해주세요.");
      return;
    }

    setIsSavingNickname(true);
    setNicknameError(null);

    try {
      const response = await userService.updateNickname(trimmed);
      if (response.status === "success" && response.data) {
        updateUser({ nickname: response.data.nickname });
        setIsProfileDialogOpen(false);
      } else {
        setNicknameError(response.error?.message || "닉네임 변경에 실패했습니다.");
      }
    } catch (error: any) {
      setNicknameError(error?.response?.data?.error?.message || "서버 오류로 닉네임을 변경할 수 없습니다.");
    } finally {
      setIsSavingNickname(false);
    }
  };

  // 노선도 마우스 드래그 시작
  const handleSubwayMouseDown = (e: React.MouseEvent) => {
    setIsSubwayDragging(true);
    setSubwayDragStart({
      x: e.clientX - subwayPosition.x,
      y: e.clientY - subwayPosition.y,
    });
  };

  // 노선도 마우스 이동
  const handleSubwayMouseMove = (e: React.MouseEvent) => {
    if (!isSubwayDragging) return;
    setSubwayPosition({
      x: e.clientX - subwayDragStart.x,
      y: e.clientY - subwayDragStart.y,
    });
  };

  // 노선도 마우스 드래그 종료
  const handleSubwayMouseUp = () => {
    setIsSubwayDragging(false);
  };

  // 노선도 터치 드래그 시작
  const handleSubwayTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsSubwayDragging(true);
    setSubwayDragStart({
      x: touch.clientX - subwayPosition.x,
      y: touch.clientY - subwayPosition.y,
    });
  };

  // 노선도 터치 이동
  const handleSubwayTouchMove = (e: React.TouchEvent) => {
    if (!isSubwayDragging) return;
    const touch = e.touches[0];
    setSubwayPosition({
      x: touch.clientX - subwayDragStart.x,
      y: touch.clientY - subwayDragStart.y,
    });
  };

  // 노선도 터치 종료
  const handleSubwayTouchEnd = () => {
    setIsSubwayDragging(false);
  };

  // 노선도 마우스 휠로 줌
  const handleSubwayWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setSubwayZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  // 최근 기록 항목 클릭 시: 검색어 입력 + 검색 실행
  const handleHistoryClick = async (history: SearchPlaceHistory) => {
    const keyword = history.keyword.trim();
    if (!keyword) return;

    setSearchQuery(keyword);
    if (onSearchSubmit) {
      onSearchSubmit(keyword);
    }
  };

  // 최근 기록 단건 삭제
  const handleDeleteHistory = async (historyId: number) => {
    try {
      // 먼저 화면에서 바로 제거 (UI 우선)
      setSearchHistories((prev) => prev.filter((h) => h.id !== historyId));
      // 이후 서버에 삭제 요청 (실패해도 UI는 유지)
      await placeService.deleteSearchPlaceHistory(historyId);
    } catch {
      // 에러는 콘솔만 조용히 무시 (UI는 유지)
    }
  };

  // 최근 기록 전체 삭제
  const handleClearHistories = async () => {
    if (searchHistories.length === 0) return;
    try {
      await placeService.clearSearchPlaceHistories();
      setSearchHistories([]);
    } catch (error) {
      console.error("검색 기록 전체 삭제 실패:", error);
    }
  };

  return (
    <div className="relative size-full" style={{
      background: 'linear-gradient(180deg, #c5e7f5 0%, #ffffff 100%)'
    }}>
      {/* 저장 완료 토스트: 모달 닫힌 뒤 SearchPage에서 저장 확인용 */}
      {favoriteSavedToast && !isPlaceSearchOpen && (
        <div className="fixed left-1/2 top-[92px] -translate-x-1/2 z-50 w-[340px] pointer-events-none">
          <div className="bg-white border-3 border-black rounded-[18px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.25)] px-4 py-3 flex items-center gap-3">
            <div className="bg-[rgba(198,198,198,0.35)] border-3 border-black rounded-[12px] size-[44px] flex items-center justify-center shrink-0">
              <img
                alt=""
                className="size-[28px] object-contain pointer-events-none"
                src={
                  favoriteSavedToast.type === "home"
                    ? imgWindow2
                    : favoriteSavedToast.type === "school"
                      ? imgSaw1
                      : imgCoinGold2
                }
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[13px] leading-[16px] text-black">
                {favoriteSavedToast.type === "home"
                  ? "집"
                  : favoriteSavedToast.type === "school"
                    ? "학교"
                    : "회사"}
                이(가) 등록되었습니다
              </p>
              <p className="css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium text-[11px] leading-[14px] text-black/60 truncate">
                {favoriteSavedToast.placeName}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 내 정보 수정 모달 */}
      {isProfileDialogOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[20px] border-4 border-black shadow-[8px_8px_0px_0px_black] w-[320px] max-w-[90vw] px-6 pt-6 pb-5 relative">
            <p className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] text-[14px] text-black text-center mb-4">
              닉네임을 변경해주세요
            </p>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              maxLength={50}
              placeholder="새 닉네임을 입력하세요"
              className="w-full bg-white border-3 border-black rounded-[14px] px-3 py-2 css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] text-[13px] text-black placeholder:text-[rgba(0,0,0,0.35)] outline-none"
            />
            {nicknameError && (
              <p className="mt-2 text-[11px] text-red-600 css-4hzbpn">
                {nicknameError}
              </p>
            )}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsProfileDialogOpen(false);
                }}
                className="flex-1 bg-white border-3 border-black rounded-[16px] h-[40px] flex items-center justify-center shadow-[4px_4px_0px_0px_black] hover:bg-[#f3f4f6] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_black] transition-all"
              >
                <span className="css-ew64yg font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] text-[12px] text-black">
                  취소
                </span>
              </button>
              <button
                type="button"
                onClick={handleSaveNickname}
                disabled={isSavingNickname}
                className="flex-1 bg-[#4a9960] border-3 border-black rounded-[16px] h-[40px] flex items-center justify-center shadow-[4px_4px_0px_0px_black] hover:bg-[#3d7f50] disabled:opacity-60 disabled:cursor-not-allowed active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_black] transition-all"
              >
                <span className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] text-[11px] text-white">
                  {isSavingNickname ? "Saving..." : "저장"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 햄버거 메뉴 팝오버 */}
      {isProfileMenuOpen && (
        <>
          {/* 배경 클릭 시 닫히는 투명 오버레이 */}
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsProfileMenuOpen(false)}
          />
          {/* 팝오버 본문 */}
          <div className="absolute left-[21px] top-[74px] z-30">
            <div
              className="bg-white rounded-[16px] border-3 border-black shadow-[6px_6px_0px_0px_black] w-[190px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleEditProfileClick}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#f3f4f6] active:bg-[#e5e7eb] transition-colors"
              >
                <span className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] text-[13px] text-black">
                  내 정보 수정
                </span>
                <span className="text-[16px]">✏️</span>
              </button>
              <div className="h-[1px] bg-black/10" />
              <button
                type="button"
                onClick={handleLogoutClick}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#fee2e2] active:bg-[#fecaca] transition-colors"
              >
                <span className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] text-[13px] text-[#b91c1c]">
                  로그아웃
                </span>
                <span className="text-[16px]">🚪</span>
              </button>
            </div>
          </div>
        </>
      )}

      {isSubwayMode ? (
        // 지하철 노선도 표시
        <>
          <AppHeader
            onBack={() => {
              if (isSubwayMode) {
                // 지하철 모드에서는 컨텍스트에서 온 기본 뒤로가기 동작 사용
                onBack?.();
              } else {
                // 기본 검색 화면에서는 항상 SearchPage를 닫고 지도(MapView)로 이동
                onNavigate?.("map");
              }
            }}
            onNavigate={onNavigate}
            onOpenDashboard={onOpenDashboard}
            onMenuClick={handleToggleProfileMenu}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={async (value) => {
              const keyword = value.trim();
              if (!keyword) return;

              // 헤더 입력값을 로컬 상태에도 반영
              setSearchQuery(keyword);

              if (onSearchSubmit) {
                onSearchSubmit(keyword);
              }
            }}
            currentPage="subway"
            showSearchBar={true}
          />
          {isWebView ? (
            // 웹 화면: 텍스트 표시
            <div className="absolute inset-0 flex items-center justify-center p-5 z-0" style={{ paddingTop: '230px' }}>
              <p className="css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#2d5f3f]">
                노선도 이미지가 나왔습니다
              </p>
            </div>
          ) : (
            // 앱 화면: 노선도 이미지 표시
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-0" style={{ paddingTop: '230px' }}>
              <img
                src={subwayMapImage}
                alt="지하철 노선도"
                className={`w-full h-full object-contain ${isSubwayDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                style={{
                  transform: `scale(${subwayZoom}) translate(${subwayPosition.x / subwayZoom}px, ${subwayPosition.y / subwayZoom}px)`,
                  transition: isSubwayDragging ? 'none' : 'transform 0.3s ease-out',
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
          )}
        </>
      ) : (
        <>
          {/* 새로운 헤더 컴포넌트 */}
          <AppHeader
            onBack={onBack}
            onNavigate={onNavigate}
            onOpenDashboard={onOpenDashboard}
            onMenuClick={handleToggleProfileMenu}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={async (value) => {
              const keyword = value.trim();
              if (!keyword) return;

              // 헤더 입력값을 로컬 상태에도 반영
              setSearchQuery(keyword);

              if (onSearchSubmit) {
                onSearchSubmit(keyword);
              }
            }}
            currentPage="search"
            showSearchBar={true}
          />

          {/* 출발지 입력 필드 */}
          <div className="absolute content-stretch flex flex-col h-[42.691px] items-start justify-end left-[27.96px] right-[27.93px] top-[243.45px] z-10">
            <div className="bg-white h-[44px] relative rounded-[25px] shrink-0 w-full">
              <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none rounded-[25px]" />
              <div className="absolute content-stretch flex gap-[17px] h-[27.615px] items-center left-[18.63px] p-[2px] right-[17.26px] top-[7.76px]">
                <div className="relative shrink-0 size-[30px]" data-name="gem_green 1">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgGemGreen1} />
                </div>
                <input
                  type="text"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  placeholder="출발지를 입력해주세요"
                  className="css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] h-[36.752px] leading-[30px] bg-transparent outline-none relative shrink-0 text-[13px] text-black w-[237.396px] placeholder:text-[rgba(0,0,0,0.4)]"
                  style={{ fontVariationSettings: "'wght' 400" }}
                />
              </div>
            </div>
          </div>

          {/* 도착지 입력 필드 */}
          <div className="absolute content-stretch flex flex-col h-[42.691px] items-start justify-end left-[27.96px] right-[27.93px] top-[297.78px] z-10">
            <div className="bg-white h-[44px] relative rounded-[25px] shrink-0 w-full">
              <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none rounded-[25px]" />
              <div className="absolute content-stretch flex gap-[17px] h-[27.615px] items-center left-[18.63px] p-[2px] right-[17.26px] top-[7.76px]">
                <div className="relative shrink-0 size-[30px]" data-name="gem_red 1">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgGemRed1} />
                </div>
                <input
                  type="text"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  placeholder="도착지를 입력해주세요"
                  className="css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] h-[36.752px] leading-[30px] bg-transparent outline-none relative shrink-0 text-[13px] text-black w-[237.396px] placeholder:text-[rgba(0,0,0,0.4)]"
                  style={{ fontVariationSettings: "'wght' 400" }}
                />
              </div>
            </div>
          </div>

          {/* 길 찾기 버튼 */}
          <div className="absolute content-stretch flex flex-col h-[42.691px] items-start justify-end left-[27.96px] right-[27.93px] top-[353.5px] z-10">
            <button
              onClick={() => {
                // 출발지/도착지 좌표가 있으면 routeStore에 저장
                if (selectedDeparture && selectedArrival) {
                  // 기존 검색 결과 초기화 (새로운 경로 검색을 위해)
                  resetRoute();
                  // 새 출발지/도착지 설정
                  setDepartureArrival(selectedDeparture, selectedArrival);
                }
                onNavigate?.("route");
              }}
              className="bg-[#4a9960] h-[44px] relative rounded-[25px] shrink-0 w-full hover:bg-[#3d7f50] transition-colors flex items-center justify-center"
            >
              <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none rounded-[25px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" />
              <p className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[30px] text-[13px] text-black text-center relative z-10">길 찾기</p>
            </button>
          </div>

          {/* 자주 가는 곳 타이틀 */}
          <p className="absolute css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[28.137px] leading-[30px] left-[50%] text-[12px] text-black top-[422.95px] tracking-[0.6px] translate-x-[-50%] w-[295.111px] z-10">자주 가는 곳</p>

          {/* 자주 가는 곳 버튼들 */}
          <div className="absolute left-[50%] top-[455px] translate-x-[-50%] w-[320px] flex gap-[15px] z-10">
            {/* 집 */}
            <button
              onClick={() => {
                if (favoriteLocations.home.length > 0) {
                  const place = favoriteLocations.home[0];
                  setStartLocation("현재 위치");
                  setEndLocation(place.name);
                  onNavigate?.("route");
                } else {
                  setSelectedFavoriteType("home");
                  setIsPlaceSearchOpen(true);
                }
              }}
              className="flex flex-col items-center relative hover:scale-105 transition-transform"
            >
              <div className={`${favoriteLocations.home.length > 0 ? 'bg-white' : 'bg-[rgba(198,198,198,0.6)]'} border-3 border-black border-solid h-[74px] rounded-[10px] w-[68.153px]`} />
              <p className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[30px] text-[12px] text-black text-center tracking-[0.6px] mt-[13.5px]">집</p>
              <div className="absolute size-[30px] top-[20px] left-[50%] translate-x-[-50%] pointer-events-none" data-name="window 2">
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgWindow2} />
              </div>
            </button>

            {/* 학교 */}
            <button
              onClick={() => {
                if (favoriteLocations.school.length > 0) {
                  const place = favoriteLocations.school[0];
                  setStartLocation("현재 위치");
                  setEndLocation(place.name);
                  onNavigate?.("route");
                } else {
                  setSelectedFavoriteType("school");
                  setIsPlaceSearchOpen(true);
                }
              }}
              className="flex flex-col items-center relative hover:scale-105 transition-transform"
            >
              <div className={`${favoriteLocations.school.length > 0 ? 'bg-white' : 'bg-[rgba(198,198,198,0.6)]'} border-3 border-black border-solid h-[74px] rounded-[10px] w-[68.153px]`} />
              <p className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[30px] text-[12px] text-black text-center tracking-[0.6px] mt-[13.5px]">학교</p>
              <div className="absolute size-[30px] top-[22px] left-[50%] translate-x-[-50%] pointer-events-none" data-name="saw 1">
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgSaw1} />
              </div>
            </button>

            {/* 회사 */}
            <button
              onClick={() => {
                if (favoriteLocations.work.length > 0) {
                  const place = favoriteLocations.work[0];
                  setStartLocation("현재 위치");
                  setEndLocation(place.name);
                  onNavigate?.("route");
                } else {
                  setSelectedFavoriteType("work");
                  setIsPlaceSearchOpen(true);
                }
              }}
              className="flex flex-col items-center relative hover:scale-105 transition-transform"
            >
              <div className={`${favoriteLocations.work.length > 0 ? 'bg-white' : 'bg-[rgba(175,175,175,0.6)]'} border-3 border-black border-solid h-[74px] rounded-[10px] w-[68.153px]`} />
              <p className="css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[30px] text-[12px] text-black text-center tracking-[0.6px] mt-[13.5px]">회사</p>
              <div className="absolute size-[55px] top-[9px] left-[50%] translate-x-[-50%] pointer-events-none" data-name="coin_gold 2">
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgCoinGold2} />
              </div>
            </button>

            {/* 즐겨찾기 */}
            <button
              onClick={onOpenFavorites}
              className="flex flex-col items-center relative hover:scale-105 transition-transform"
            >
              <div className="bg-white border-3 border-black border-solid h-[74px] rounded-[10px] w-[68.153px]"/>
              <p className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[30px] text-[12px] text-black text-center tracking-[0.6px] mt-[13.5px]">즐겨찾기</p>
              <div className="absolute size-[55px] top-[9px] left-[50%] translate-x-[-50%] pointer-events-none" data-name="star 1">
                <img alt="" className="absolute inset-0 max-w-none object-cover size-full" src={imgStar1} />
              </div>
            </button>
          </div>

          {/* 최근 기록 섹션 */}
          <div className="absolute left-[24.96px] right-[30.93px] top-[571.4px] z-10">
            <p className="absolute css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[28.137px] leading-[30px] left-[27.94px] text-[12px] text-black text-center top-0 tracking-[0.6px] translate-x-[-50%] w-[55.885px]">최근 기록</p>
            <button 
              onClick={handleClearHistories}
              disabled={searchHistories.length === 0 || isLoadingHistories}
              className="absolute css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[28.137px] leading-[30px] right-[27.45px] text-[12px] text-black text-center top-0 tracking-[0.6px] translate-x-[50%] w-[54.904px] hover:text-[#4a9960] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              전체 삭제
            </button>
            {/* 최근 기록 리스트 (최대 5개, 화면 전체 스크롤로 표시) */}
            <div className="mt-8 space-y-2">
              {isLoadingHistories && (
                <p className="css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] text-[11px] text-[rgba(0,0,0,0.35)]">
                  최근 검색 기록을 불러오는 중...
                </p>
              )}
              {!isLoadingHistories && searchHistories.length === 0 && (
                <p className="css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] text-[11px] text-[rgba(0,0,0,0.35)]">
                  최근 검색 기록이 없습니다.
                </p>
              )}
              {searchHistories.map((history) => (
                <div
                  key={history.id}
                  className="w-full bg-white border-3 border-black rounded-[14px] px-3 py-2 flex items-center justify-between hover:bg-[#f3f4f6] transition-colors"
                >
                  <span 
                    className="flex-1 css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] text-[12px] text-black truncate"
                    onClick={() => handleHistoryClick(history)}
                    style={{ cursor: 'pointer' }}
                  >
                    {history.keyword}
                  </span>
                  <button
                    type="button"
                    className="ml-2 min-w-[24px] min-h-[24px] flex items-center justify-center text-[14px] font-bold text-[#b91c1c] hover:text-[#7f1d1d] active:text-[#991b1b] css-4hzbpn relative z-20"
                    style={{ touchAction: 'manipulation' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteHistory(history.id);
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 안내 메시지 (검색 기록이 없을 때만 표시) */}
          {searchHistories.length === 0 && !isLoadingHistories && (
            <div className="absolute bottom-[228.5px] font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[186.288px] leading-[50px] left-[23px] right-[32.89px] text-[0px] text-[rgba(0,0,0,0.2)] text-center tracking-[0.6px] translate-y-[100%] z-10">
              <p className="css-4hzbpn mb-0 text-[20px]">오늘은</p>
              <p className="css-4hzbpn mb-0 text-[40px]">{`어디로 `}</p>
              <p className="css-4hzbpn text-[40px]">안내할까요?</p>
            </div>
          )}
        </>
      )}

      {/* 장소 검색 모달 */}
      <PlaceSearchModal
        isOpen={isPlaceSearchOpen}
        onClose={() => {
          setIsPlaceSearchOpen(false);
          setSelectedFavoriteType(null);
        }}
        onSelectPlace={(place) => {
          if (selectedFavoriteType) {
            // 자주 가는 곳에 저장 (최신이 위로 오도록 unshift, 중복 id는 제거)
            setFavoriteLocations((prev) => ({
              ...prev,
              [selectedFavoriteType]: [
                place,
                ...prev[selectedFavoriteType].filter((p) => p.id !== place.id),
              ],
            }));
            setFavoriteSavedToast({ type: selectedFavoriteType, placeName: place.name });
            // 모달은 PlaceSearchModal이 UX 흐름에 맞게 제어(저장 후 초기 화면으로 돌아가게)
          }
        }}
        targetType={selectedFavoriteType}
        currentSavedPlaces={selectedFavoriteType ? favoriteLocations[selectedFavoriteType] : []}
        onRemoveSavedPlace={(placeId) => {
          if (!selectedFavoriteType) return;
          setFavoriteLocations((prev) => ({
            ...prev,
            [selectedFavoriteType]: prev[selectedFavoriteType].filter((p) => p.id !== placeId),
          }));
        }}
        onRequestRoute={(place) => {
          // 모달 닫고 경로 안내로 이동: 현재 위치 -> 선택된 장소
          setIsPlaceSearchOpen(false);
          setSelectedFavoriteType(null);
          setStartLocation("현재 위치");
          setEndLocation(place.name);
          onNavigate?.("route");
        }}
        onNavigate={(page) => {
          if (page === "map") {
            // 지도 버튼 - 모달 닫고 지도로 이동
            setIsPlaceSearchOpen(false);
            setSelectedFavoriteType(null);
            onNavigate?.("map");
          } else if (page === "search") {
            // 검색 버튼 - 모달만 닫기 (이미 SearchPage에 있음)
            setIsPlaceSearchOpen(false);
            setSelectedFavoriteType(null);
          } else if (onNavigate) {
            // 다른 페이지로 이동
            onNavigate(page as PageType);
          }
        }}
        onOpenDashboard={() => {
          if (onOpenDashboard) {
            onOpenDashboard();
          }
        }}
      />
    </div>
  );
}
