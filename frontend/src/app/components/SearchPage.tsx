import { AppHeader } from "@/app/components/AppHeader";
import { PlaceDetailPage } from "@/app/components/PlaceDetailPage";
import { PlaceSearchModal } from "@/app/components/PlaceSearchModal";
import imgCharacterGreenFront from "@/assets/character-green-front.png";
import imgCoinGold2 from "@/assets/coin-gold.png";
import imgGemGreen1 from "@/assets/gem-green.png";
import imgGemRed1 from "@/assets/gem-red.png";
import imgSaw1 from "@/assets/saw.png";
import imgStar1 from "@/assets/star.png";
import subwayMapImage from "@/assets/subway-map-image.png";
import imgWindow2 from "@/assets/window.png";
import authService from "@/services/authService";
import userService from "@/services/userService";
import placeService, { type SearchPlaceHistory, type SavedPlace } from "@/services/placeService";
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
  coordinates?: {
    lon: number;
    lat: number;
  };
  _poiPlaceId?: number;
  _savedPlaceId?: number;
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

  // 경로 검색 로딩 상태
  const [isSearchingRoute, setIsSearchingRoute] = useState(false);

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

  // PlaceDetailPage 상태
  const [selectedPlaceForDetail, setSelectedPlaceForDetail] = useState<{
    id: string;
    name: string;
    address: string;
    distance: string;
    icon: string;
    isFavorited?: boolean;
    coordinates?: { lon: number; lat: number };
    _poiPlaceId?: number;
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

  // 저장된 장소 목록 불러오기
  const loadFavoriteLocations = async () => {
    try {
      const [homeResponse, schoolResponse, workResponse] = await Promise.all([
        placeService.getSavedPlaces("home"),
        placeService.getSavedPlaces("school"),
        placeService.getSavedPlaces("work"),
      ]);

      const convertSavedPlaceToPlace = (saved: SavedPlace): Place => ({
        id: `saved-${saved.saved_place_id}`,
        name: saved.poi_place.name,
        detail: saved.poi_place.address,
        distance: "",
        time: "",
        icon: "📍", // 기본 아이콘 (나중에 카테고리 기반으로 변경 가능)
        color: "#7ed321",
        coordinates: saved.poi_place.coordinates,
        _poiPlaceId: saved.poi_place.poi_place_id,
        _savedPlaceId: saved.saved_place_id,
      });

      // 각 카테고리별로 성공한 경우에만 업데이트, 실패 시 기존 상태 유지
      setFavoriteLocations((prev) => ({
        home: homeResponse.status === "success" && homeResponse.data
          ? homeResponse.data.map(convertSavedPlaceToPlace)
          : prev.home,
        school: schoolResponse.status === "success" && schoolResponse.data
          ? schoolResponse.data.map(convertSavedPlaceToPlace)
          : prev.school,
        work: workResponse.status === "success" && workResponse.data
          ? workResponse.data.map(convertSavedPlaceToPlace)
          : prev.work,
      }));
    } catch (error) {
      console.error("저장된 장소 목록 불러오기 실패:", error);
      // 에러 발생 시에도 기존 상태 유지
    }
  };

  // 초기 마운트 시 저장된 장소 목록 로드
  useEffect(() => {
    loadFavoriteLocations();
  }, []);

  // 저장된 장소 업데이트 이벤트 리스너
  useEffect(() => {
    const handler = (event: Event) => {
      // 특정 카테고리가 업데이트된 경우에도 전체를 다시 로드하여 일관성 유지
      // 에러 발생 시에도 기존 상태를 유지하도록 loadFavoriteLocations에서 처리됨
      loadFavoriteLocations();
    };
    window.addEventListener("savedPlaceUpdated", handler);
    return () => window.removeEventListener("savedPlaceUpdated", handler);
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
    <div className="relative size-full hb-search-page" style={{
      // initial vibe에 더 가깝게: 하늘색 채도/대비를 살리고, 아래로 자연스럽게 fade
      background: "linear-gradient(180deg, #c5e7f5 0%, #f3fbff 48%, #ffffff 100%)",
    }}>
      <style>
        {`
          /* SearchPage-only styles (scoped) */
          @font-face {
            font-family: 'FreesentationVF';
            src: url('/fonts/FreesentationVF.ttf') format('truetype');
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
          }

          @font-face {
            font-family: 'DNFBitBitv2';
            src:
              url('/fonts/DNFBitBitv2.otf') format('opentype'),
              url('/fonts/DNFBitBitv2.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }

          @keyframes hb-search-sheen {
            0% { transform: translateX(-40%) translateY(-10%) rotate(12deg); opacity: 0; }
            12% { opacity: 0.55; }
            50% { opacity: 0.35; }
            100% { transform: translateX(140%) translateY(10%) rotate(12deg); opacity: 0; }
          }

          @keyframes hb-search-sparkle {
            0%, 100% { opacity: 0.10; transform: scale(1); }
            50% { opacity: 0.24; transform: scale(1.08); }
          }

          @keyframes hb-search-cloud-drift {
            0% { transform: translateX(-28px); }
            50% { transform: translateX(28px); }
            100% { transform: translateX(-28px); }
          }

          @keyframes hb-search-cloud-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }

          .hb-search-page .hb-search-glass-card {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.14) 100%);
            border: 1px solid rgba(255,255,255,0.38);
            box-shadow: 0 18px 36px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.28);
            backdrop-filter: blur(18px) saturate(160%);
            -webkit-backdrop-filter: blur(18px) saturate(160%);
          }

          .hb-search-page .hb-search-glass-chip {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.12) 100%);
            border: 1px solid rgba(255,255,255,0.36);
            box-shadow: 0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.24);
            backdrop-filter: blur(16px) saturate(155%);
            -webkit-backdrop-filter: blur(16px) saturate(155%);
          }

          .hb-search-page .hb-search-glass-fun::before {
            content: "";
            position: absolute;
            inset: -30% -40%;
            pointer-events: none;
            background: linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0) 60%);
            opacity: 0;
            animation: hb-search-sheen 12.5s ease-in-out infinite;
          }

          .hb-search-page .hb-search-sparkle-dot {
            position: absolute;
            width: 6px;
            height: 6px;
            border-radius: 9999px;
            background: rgba(255,255,255,0.7);
            box-shadow: 0 0 0 1px rgba(255,255,255,0.18);
            opacity: 0.12;
            animation: hb-search-sparkle 6.8s ease-in-out infinite;
          }
          .hb-search-page .hb-search-sparkle-dot-slow { animation-duration: 9.2s; }
          .hb-search-page .hb-search-sparkle-dot-fast { animation-duration: 5.4s; }

          .hb-search-page .hb-search-pressable {
            transition: transform 140ms ease-out, filter 140ms ease-out;
            will-change: transform, filter;
          }
          .hb-search-page .hb-search-pressable:active {
            transform: translateY(1px) scale(0.985);
            filter: brightness(1.04);
          }
          .hb-search-page .hb-search-pressable:focus-visible {
            outline: 2px solid rgba(74,153,96,0.35);
            outline-offset: 2px;
          }

          .hb-search-page .hb-search-cloud-drift {
            transform-box: fill-box;
            transform-origin: center;
            animation: hb-search-cloud-drift 12s ease-in-out infinite;
          }
          .hb-search-page .hb-search-cloud-drift-slow {
            transform-box: fill-box;
            transform-origin: center;
            animation: hb-search-cloud-drift 18s ease-in-out infinite;
          }
          .hb-search-page .hb-search-cloud-bob {
            transform-box: fill-box;
            transform-origin: center;
            animation: hb-search-cloud-bob 5.6s ease-in-out infinite;
          }
          .hb-search-page .hb-search-cloud-bob-slow {
            transform-box: fill-box;
            transform-origin: center;
            animation: hb-search-cloud-bob 7.2s ease-in-out infinite;
          }

          /* Header overrides (SearchPage only) */
          .hb-search-page .hb-search-header button[data-name="Container"],
          .hb-search-page .hb-search-header button[data-name="Button"] {
            background: linear-gradient(135deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.16) 100%) !important;
            border: 1px solid rgba(255,255,255,0.55) !important;
            box-shadow: 0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.22) !important;
            backdrop-filter: blur(16px) saturate(155%) !important;
            -webkit-backdrop-filter: blur(16px) saturate(155%) !important;
          }

          /* center icons inside the header buttons (SearchPage only) */
          .hb-search-page .hb-search-header button[data-name="Container"] [data-name="Icon10"] {
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
          }

          .hb-search-page .hb-search-header button[data-name="Button"] p {
            /* make the pixel-arrow feel thicker without changing the shared component */
            text-shadow: 0.5px 0 currentColor, -0.5px 0 currentColor;
          }

          /* Replace ambiguous text arrow with a crisp SVG chevron (SearchPage only) */
          .hb-search-page .hb-search-header button[data-name="Button"] [data-name="Text"] p {
            opacity: 0 !important;
          }

          /* keep the original layout/position; swap only the glyph */
          .hb-search-page .hb-search-header button[data-name="Button"] [data-name="Text"] {
            position: relative;
          }

          .hb-search-page .hb-search-header button[data-name="Button"] [data-name="Text"]::before {
            content: "";
            position: absolute;
            left: 50%;
            top: calc(50% - 0.5px);
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            background-repeat: no-repeat;
            background-position: center;
            background-size: 20px 20px;
            /* stroke color encoded as %230a0a0a */
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M14.5 6.5L9 12l5.5 5.5' stroke='%230a0a0a' stroke-width='2.9' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          }

          .hb-search-page .hb-search-header-title {
            font-family: 'DNFBitBitv2', 'Press Start 2P', sans-serif;
            font-size: 16px;
            line-height: 30px;
            letter-spacing: 0.6px;
            color: #0a0a0a;
          }

          @media (prefers-reduced-motion: reduce) {
            .hb-search-page .hb-search-cloud-drift,
            .hb-search-page .hb-search-cloud-drift-slow,
            .hb-search-page .hb-search-cloud-bob,
            .hb-search-page .hb-search-cloud-bob-slow,
            .hb-search-page .hb-search-sparkle-dot,
            .hb-search-page .hb-search-sparkle-dot-slow,
            .hb-search-page .hb-search-sparkle-dot-fast,
            .hb-search-page .hb-search-glass-fun::before {
              animation: none !important;
            }
            .hb-search-page .hb-search-pressable {
              transition: none !important;
            }
            .hb-search-page .hb-search-pressable:active {
              transform: none !important;
              filter: none !important;
            }
          }
        `}
      </style>
      {/* mountains + clouds background (soft illustration) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* subtle sparkles (very low motion) */}
        <span className="hb-search-sparkle-dot hb-search-sparkle-dot-slow left-[22px] top-[120px]" />
        <span className="hb-search-sparkle-dot hb-search-sparkle-dot-fast left-[64px] top-[160px]" />
        <span className="hb-search-sparkle-dot hb-search-sparkle-dot-slow left-[310px] top-[140px]" />
        <span className="hb-search-sparkle-dot left-[344px] top-[190px]" />

        <svg
          aria-hidden="true"
          className="absolute left-0 top-0 w-full h-[600px]"
          viewBox="0 0 390 600"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,0.0)" />
              <stop offset="1" stopColor="rgba(255,255,255,0.65)" />
            </linearGradient>

            <linearGradient id="m1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="0.45" stopColor="#8dd4b0" stopOpacity="0.85" />
              <stop offset="1" stopColor="#4a9960" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="m2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="0.5" stopColor="#75c5a0" stopOpacity="0.8" />
              <stop offset="1" stopColor="#2d5f3f" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="m3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
              <stop offset="0.55" stopColor="#96d9ba" stopOpacity="0.72" />
              <stop offset="1" stopColor="#4a9960" stopOpacity="0.42" />
            </linearGradient>

            <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
            <filter id="cloudSoft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* Sun - 산에 절반 가려지도록 오른쪽에 배치 */}
          <g>
            <defs>
              <radialGradient id="sunGradient" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#FFE66B" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#FFD93D" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#FFB84D" stopOpacity="0.4" />
              </radialGradient>
            </defs>
            {/* Sun glow effect */}
            <circle
              cx="270"
              cy="200"
              r="55"
              fill="#FFE66B"
              opacity="0.25"
            />
            <circle
              cx="270"
              cy="200"
              r="45"
              fill="url(#sunGradient)"
              opacity="0.85"
            />
          </g>

          {/* clouds - 태양 위에 배치하여 일부 가리기 */}
          <g filter="url(#cloudSoft)" opacity="0.78">
            {/* left cloud cluster */}
            <g className="hb-search-cloud-drift">
              <g transform="translate(0 0) scale(1.18)">
                <g className="hb-search-cloud-bob">
                <circle cx="70" cy="90" r="26" fill="#ffffff" />
                <circle cx="98" cy="86" r="20" fill="#ffffff" />
                <circle cx="120" cy="94" r="22" fill="#ffffff" />
                </g>
              </g>
            </g>

            {/* right cloud cluster - 태양을 일부 가리도록 */}
            <g className="hb-search-cloud-drift-slow">
              <g transform="translate(0 0) scale(1.12)">
                <g className="hb-search-cloud-bob-slow">
                <circle cx="300" cy="80" r="22" fill="#ffffff" />
                <circle cx="322" cy="78" r="16" fill="#ffffff" />
                <circle cx="340" cy="86" r="18" fill="#ffffff" />
                {/* 태양을 가리는 추가 구름 */}
                <circle cx="310" cy="95" r="20" fill="#ffffff" />
                <circle cx="330" cy="100" r="18" fill="#ffffff" />
                </g>
              </g>
            </g>
          </g>

          {/* mountains (layered) */}
          <g filter="url(#soft)" transform="translate(0, 60)">
            <path
              d="M-40 420 C 30 320, 90 250, 150 240 C 210 230, 250 170, 285 120 C 315 80, 345 90, 430 220 L 430 520 L -40 520 Z"
              fill="url(#m2)"
            />
            <path
              d="M-40 460 C 20 360, 80 320, 130 310 C 185 300, 210 250, 235 215 C 255 190, 270 190, 295 210 C 330 238, 360 265, 430 320 L 430 520 L -40 520 Z"
              fill="url(#m3)"
              opacity="0.95"
            />
            <path
              d="M-40 500 C 10 445, 70 410, 125 400 C 185 388, 240 370, 290 355 C 330 342, 370 346, 430 362 L 430 520 L -40 520 Z"
              fill="url(#m1)"
              opacity="0.95"
            />
          </g>

          {/* wave border at bottom - 물결 모양 경계선 */}
          <g transform="translate(0, 420)">
            <defs>
              <linearGradient id="waveFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="rgba(255,255,255,0.0)" />
                <stop offset="0.3" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="0.7" stopColor="rgba(255,255,255,0.7)" />
                <stop offset="1" stopColor="rgba(255,255,255,1.0)" />
              </linearGradient>
            </defs>
            {/* 물결 모양 경계선 - 여러 개의 파도로 구성 */}
            <path
              d="M-40 0
                 C 20 15, 60 10, 100 20
                 C 140 30, 180 15, 220 25
                 C 260 35, 300 20, 340 30
                 C 380 40, 430 25, 470 35
                 L 470 200 L -40 200 Z"
              fill="url(#waveFade)"
            />
            {/* 두 번째 물결 레이어 (더 부드러운 파도) */}
            <path
              d="M-40 10
                 C 30 20, 70 15, 110 25
                 C 150 35, 190 20, 230 30
                 C 270 40, 310 25, 350 35
                 C 390 45, 430 30, 470 40
                 L 470 200 L -40 200 Z"
              fill="url(#waveFade)"
              opacity="0.6"
            />
            {/* 세 번째 물결 레이어 (가장 부드러운 파도) */}
            <path
              d="M-40 20
                 C 40 30, 80 25, 120 35
                 C 160 45, 200 30, 240 40
                 C 280 50, 320 35, 360 45
                 C 400 55, 440 40, 470 50
                 L 470 200 L -40 200 Z"
              fill="url(#waveFade)"
              opacity="0.4"
            />
          </g>
        </svg>
      </div>
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
              <p className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-medium text-[11px] leading-[14px] text-black/60 truncate">
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
          <div className="relative z-20 hb-search-header">
            <AppHeader
              onBack={onBack}
              onNavigate={onNavigate}
              onOpenDashboard={onOpenDashboard}
              onMenuClick={handleToggleProfileMenu}
              title="" /* SearchPage에서만 커스텀 타이틀을 올려 디자인/폰트 통일 */
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={async (value) => {
                const keyword = (value || searchQuery).trim();
                if (!keyword) return;

                // 헤더 입력값을 로컬 상태에도 반영
                setSearchQuery(keyword);

                if (onSearchSubmit) {
                  onSearchSubmit(keyword);
                }
              }}
              currentPage="search"
              // SearchPage 상단은 "인사 + 둥근 검색바"를 별도 배치 (아까 느낌 유지)
              showSearchBar={false}
            />
            <div
              className="pointer-events-none absolute left-1/2 -translate-x-1/2 hb-search-header-title"
              style={{ top: "calc(33.29px + env(safe-area-inset-top, 0px))" }}
            >
              HAD BETTER
            </div>
          </div>

          {/* Content (clean card layout) */}
          <div
            // AppHeader의 sideInset(16px)과 기준선을 맞춰 통일감 확보
            className="relative z-10 px-4 pb-7"
            // 탭바(44px) 아래 여백이 자연스럽게 떨어지도록 약간 조정
            style={{ paddingTop: "calc(168px + env(safe-area-inset-top, 0px))" }}
          >
            <div className="mx-auto w-full max-w-[420px]">
              {/* Hero (greeting + destination search) */}
              <div className="flex items-center gap-3">
                <div className="relative size-[44px] rounded-full bg-white border border-black/10 shadow-[0px_10px_24px_rgba(0,0,0,0.14)] overflow-hidden shrink-0">
                  <img
                    alt=""
                    src={imgCharacterGreenFront}
                    className="absolute inset-0 size-full object-cover pointer-events-none select-none"
                    style={{
                      // 캐릭터 풀바디 이미지를 "얼굴 위주"로 크롭해서 원 안에 꽉 차게
                      objectPosition: "50% 22%",
                      transform: "scale(1.35)",
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[18px] leading-[22px] text-black">
                    사용자님,
                  </p>
                  <p className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[18px] leading-[22px] text-black">
                    어디로 레이싱 할까요?
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="h-[56px] rounded-[18px] bg-white border border-black/10 shadow-[0px_12px_26px_rgba(0,0,0,0.16)] px-4 flex items-center gap-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && searchQuery.trim()) {
                        onSearchSubmit?.(searchQuery);
                      }
                    }}
                    placeholder="목적지를 입력하고 대결 시작"
                    className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] bg-transparent outline-none text-[14px] text-black w-full placeholder:text-black/35"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (searchQuery.trim()) onSearchSubmit?.(searchQuery);
                    }}
                    className="size-[36px] rounded-full bg-white border border-black/10 shadow-[0px_10px_22px_rgba(0,0,0,0.14)] flex items-center justify-center shrink-0 active:scale-[0.98] transition-transform"
                    aria-label="검색"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" stroke="#2D5F3F" strokeWidth="2" />
                      <path d="M16 16L21 21" stroke="#2D5F3F" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Start / End inputs */}
              <div className="mt-5 rounded-[22px] hb-search-glass-card hb-search-glass-fun p-4">
                  <div className="flex items-center gap-3 rounded-[18px] bg-white/75 backdrop-blur-sm px-4 py-3 border border-white/40 shadow-[0px_10px_22px_rgba(0,0,0,0.10)]">
                  <img alt="" className="size-[28px] object-contain pointer-events-none" src={imgGemGreen1} />
                <input
                  type="text"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  placeholder="출발지를 입력해주세요"
                    className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] bg-transparent outline-none text-[14px] text-black w-full placeholder:text-black/40"
                  />
                </div>

                <div className="mt-3 flex items-center gap-3 rounded-[18px] bg-white/75 backdrop-blur-sm px-4 py-3 border border-white/40 shadow-[0px_10px_22px_rgba(0,0,0,0.10)]">
                  <img alt="" className="size-[28px] object-contain pointer-events-none" src={imgGemRed1} />
                <input
                  type="text"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  placeholder="도착지를 입력해주세요"
                    className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] bg-transparent outline-none text-[14px] text-black w-full placeholder:text-black/40"
                />
          </div>

                {/* CTA */}
            <button
                  type="button"
                  disabled={isSearchingRoute}
              onClick={async () => {
                // 입력값 검증
                const start = startLocation.trim();
                const end = endLocation.trim();

                if (!start || !end) {
                  alert("출발지와 도착지를 입력해주세요.");
                  return;
                }

                setIsSearchingRoute(true);

                try {
                  let departureLocation: LocationWithCoords | null = null;
                  let arrivalLocation: LocationWithCoords | null = null;

                  // 출발지가 "현재 위치"인 경우 GPS로 좌표 가져오기
                  if (start === "현재 위치" || start === "현재위치") {
                    try {
                      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        if (!navigator.geolocation) {
                          reject(new Error("Geolocation not supported"));
                          return;
                        }
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                          enableHighAccuracy: true,
                          timeout: 15000,
                          maximumAge: 0,
                        });
                      });
                      departureLocation = {
                        name: "현재 위치",
                        lat: position.coords.latitude,
                        lon: position.coords.longitude,
                      };
                    } catch (geoError) {
                      console.warn("현재 위치 가져오기 실패:", geoError);
                      alert("현재 위치를 가져올 수 없습니다. 출발지를 직접 입력해주세요.");
                      setIsSearchingRoute(false);
                      return;
                    }
                  } else {
                    // 출발지 검색
                    const departureResult = await placeService.searchPlaces({ q: start, limit: 1 });
                    if (departureResult.status === "success" && departureResult.data && departureResult.data.length > 0) {
                      const place = departureResult.data[0];
                      departureLocation = {
                        name: place.name,
                        lat: place.coordinates.lat,
                        lon: place.coordinates.lon,
                      };
                    } else {
                      alert(`"${start}" 출발지를 찾을 수 없습니다.`);
                      setIsSearchingRoute(false);
                      return;
                    }
                  }

                  // 도착지 검색
                  const arrivalResult = await placeService.searchPlaces({ q: end, limit: 1 });
                  if (arrivalResult.status === "success" && arrivalResult.data && arrivalResult.data.length > 0) {
                    const place = arrivalResult.data[0];
                    arrivalLocation = {
                      name: place.name,
                      lat: place.coordinates.lat,
                      lon: place.coordinates.lon,
                    };
                  } else {
                    alert(`"${end}" 도착지를 찾을 수 없습니다.`);
                    setIsSearchingRoute(false);
                    return;
                  }

                  // 경로 설정 및 페이지 이동
                  if (departureLocation && arrivalLocation) {
                    resetRoute();
                    setDepartureArrival(departureLocation, arrivalLocation);
                    setSelectedDeparture(departureLocation);
                    setSelectedArrival(arrivalLocation);
                    onNavigate?.("route");
                  }
                } catch (error) {
                  console.error("경로 검색 실패:", error);
                  alert("경로 검색 중 오류가 발생했습니다.");
                } finally {
                  setIsSearchingRoute(false);
                }
              }}
                  className="mt-4 w-full h-[48px] rounded-[18px] bg-[#4a9960] hover:bg-[#3d7f50] disabled:bg-[#9cba9c] disabled:cursor-not-allowed transition-colors border border-white/35 flex items-center justify-center active:translate-y-[1px]"
            >
                  <span className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[14px] text-white">
                    {isSearchingRoute ? "검색 중..." : "길 찾기"}
                  </span>
            </button>
          </div>

              {/* Favorites / quick actions */}
              <div className="mt-6">
                <div className="flex items-center justify-between px-1">
                  <p className="-mt-1 css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[13px] text-black/80">
                    자주 가는 곳
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-4 gap-3">
            {/* 집 */}
            <button
                    type="button"
              onClick={() => {
                // 저장된 장소가 있든 없든 PlaceSearchModal 열기 (등록된 장소 목록 화면)
                setSelectedFavoriteType("home");
                setIsPlaceSearchOpen(true);
              }}
                    className="group hb-search-pressable rounded-[16px] hb-search-glass-chip px-2 py-3 flex flex-col items-center justify-center gap-2 hover:bg-white/20 transition-all"
                  >
                    <div
                      className="size-[56px] rounded-[16px] flex items-center justify-center"
                      style={{
                        background: favoriteLocations.home.length > 0
                          ? "linear-gradient(135deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.20) 100%)"
                          : "linear-gradient(135deg, rgba(255,230,107,0.75) 0%, rgba(255,230,107,0.60) 100%)",
                        border: "1px solid rgba(255,255,255,0.45)",
                        boxShadow: "0 8px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.30)",
                        backdropFilter: "blur(12px) saturate(150%)",
                        WebkitBackdropFilter: "blur(12px) saturate(150%)",
                      }}
                    >
                      <img alt="" className="size-[28px] object-contain pointer-events-none" src={imgWindow2} />
              </div>
                    <span className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-semibold text-[12px] text-black">
                      집
                    </span>
            </button>

            {/* 학교 */}
            <button
                    type="button"
              onClick={() => {
                // 저장된 장소가 있든 없든 PlaceSearchModal 열기 (등록된 장소 목록 화면)
                setSelectedFavoriteType("school");
                setIsPlaceSearchOpen(true);
              }}
                    className="group hb-search-pressable rounded-[16px] hb-search-glass-chip px-2 py-3 flex flex-col items-center justify-center gap-2 hover:bg-white/20 transition-all"
                  >
                    <div
                      className="size-[56px] rounded-[16px] flex items-center justify-center"
                      style={{
                        background: favoriteLocations.school.length > 0
                          ? "linear-gradient(135deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.20) 100%)"
                          : "linear-gradient(135deg, rgba(110,231,183,0.75) 0%, rgba(110,231,183,0.60) 100%)",
                        border: "1px solid rgba(255,255,255,0.45)",
                        boxShadow: "0 8px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.30)",
                        backdropFilter: "blur(12px) saturate(150%)",
                        WebkitBackdropFilter: "blur(12px) saturate(150%)",
                      }}
                    >
                      <img alt="" className="size-[28px] object-contain pointer-events-none" src={imgSaw1} />
              </div>
                    <span className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-semibold text-[12px] text-black">
                      학교
                    </span>
            </button>

            {/* 회사 */}
            <button
                    type="button"
              onClick={() => {
                // 저장된 장소가 있든 없든 PlaceSearchModal 열기 (등록된 장소 목록 화면)
                setSelectedFavoriteType("work");
                setIsPlaceSearchOpen(true);
              }}
                    className="group hb-search-pressable rounded-[16px] hb-search-glass-chip px-2 py-3 flex flex-col items-center justify-center gap-2 hover:bg-white/20 transition-all"
                  >
                    <div
                      className="size-[56px] rounded-[16px] flex items-center justify-center"
                      style={{
                        background: favoriteLocations.work.length > 0
                          ? "linear-gradient(135deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.20) 100%)"
                          : "linear-gradient(135deg, rgba(255,138,138,0.75) 0%, rgba(255,138,138,0.60) 100%)",
                        border: "1px solid rgba(255,255,255,0.45)",
                        boxShadow: "0 8px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.30)",
                        backdropFilter: "blur(12px) saturate(150%)",
                        WebkitBackdropFilter: "blur(12px) saturate(150%)",
                      }}
                    >
                      <img alt="" className="size-[34px] object-contain pointer-events-none" src={imgCoinGold2} />
                    </div>
                    <span className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-semibold text-[12px] text-black">
                      회사
                    </span>
            </button>

            {/* 즐겨찾기 */}
            <button
                    type="button"
              onClick={onOpenFavorites}
                    className="group hb-search-pressable rounded-[16px] hb-search-glass-chip px-2 py-3 flex flex-col items-center justify-center gap-2 hover:bg-white/20 transition-all"
                  >
                    <div
                      className="size-[56px] rounded-[16px] flex items-center justify-center"
                      style={{
                        background: "linear-gradient(135deg, rgba(196,181,253,0.75) 0%, rgba(196,181,253,0.60) 100%)",
                        border: "1px solid rgba(255,255,255,0.45)",
                        boxShadow: "0 8px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.30)",
                        backdropFilter: "blur(12px) saturate(150%)",
                        WebkitBackdropFilter: "blur(12px) saturate(150%)",
                      }}
                    >
                      <img alt="" className="size-[34px] object-contain pointer-events-none" src={imgStar1} />
                    </div>
                    <span className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-semibold text-[12px] text-black">
                      즐겨찾기
                    </span>
                  </button>
                </div>
          </div>

              {/* Recent section (placeholder UI kept) */}
              <div className="mt-7 rounded-[22px] hb-search-glass-card hb-search-glass-fun p-4">
                <div className="flex items-center justify-between">
                  <p className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[13px] text-black/80">
                    최근 기록
                  </p>
            <button
                    type="button"
              onClick={handleClearHistories}
              disabled={searchHistories.length === 0 || isLoadingHistories}
                    className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-medium text-[12px] text-black/60 hover:text-[#4a9960] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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
                <div className="mt-4 rounded-[16px] bg-[#E6F6FF]/90 border border-black/10 px-4 py-5 text-center shadow-[0px_10px_22px_rgba(0,0,0,0.12)]">
                  <p className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-medium text-[13px] text-black/35">
                    아직 최근 기록이 없어요
                  </p>
                </div>
          )}
              </div>
            </div>
          </div>
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
            // 자주 가는 곳에 저장 (각 카테고리는 하나만 저장 가능)
            // API 응답에서 받은 정보로 직접 업데이트
            const updatedPlace: Place = {
              id: place.id,
              name: place.name,
              detail: place.detail,
              distance: place.distance,
              time: place.time,
              icon: place.icon,
              color: place.color,
              coordinates: place.coordinates,
              _poiPlaceId: place._poiPlaceId,
              _savedPlaceId: place._savedPlaceId,
            };
            
            setFavoriteLocations((prev) => ({
              ...prev,
              [selectedFavoriteType]: [updatedPlace], // 각 카테고리는 하나만 저장 가능
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
          
          // routeStore에 출발지/도착지 설정
          if (place.coordinates) {
            // 출발지: 현재 위치 (사용자 위치 가져오기 시도)
            const getCurrentLocation = () => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    // 사용자 위치를 성공적으로 가져온 경우
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    
                    // 좌표 유효성 검증
                    if (isNaN(lat) || isNaN(lon) || lat === 0 || lon === 0) {
                      console.warn("유효하지 않은 위치 좌표:", { lat, lon });
                      alert("위치 정보가 유효하지 않습니다. 브라우저 설정에서 위치 권한을 확인해주세요.");
                      return;
                    }
                    
                    const currentLocation = {
                      name: "현재 위치",
                      lat: lat,
                      lon: lon,
                    };
                    
                    // 도착지: 선택된 장소
                    const destination = {
                      name: place.name,
                      lat: place.coordinates!.lat,
                      lon: place.coordinates!.lon,
                    };
                    
                    // 도착지 좌표 유효성 검증
                    if (isNaN(destination.lat) || isNaN(destination.lon) || destination.lat === 0 || destination.lon === 0) {
                      console.warn("유효하지 않은 도착지 좌표:", destination);
                      alert("도착지 정보가 유효하지 않습니다.");
                      return;
                    }
                    
                    console.log("경로 설정:", { currentLocation, destination });
                    setDepartureArrival(currentLocation, destination);
                    // 경로 선택 페이지로 이동
                    onNavigate?.("route");
                  },
                  (error) => {
                    // 위치 가져오기 실패 시 사용자에게 알림
                    let errorMessage = "현재 위치를 가져올 수 없습니다.";
                    if (error.code === error.PERMISSION_DENIED) {
                      errorMessage = "위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.";
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                      errorMessage = "위치 정보를 사용할 수 없습니다.";
                    } else if (error.code === error.TIMEOUT) {
                      errorMessage = "위치 정보를 가져오는 데 시간이 초과되었습니다.";
                    }
                    
                    console.warn("현재 위치를 가져올 수 없습니다:", error);
                    alert(errorMessage + "\n\n경로 안내를 계속하려면 출발지를 직접 입력해주세요.");
                    
                    // 위치 가져오기 실패 시 경로 선택 페이지로 이동하지 않고
                    // 사용자가 출발지를 직접 입력할 수 있도록 SearchPage에 머무름
                    // (또는 출발지 입력 모달을 띄울 수도 있음)
                  },
                  {
                    enableHighAccuracy: true,
                    timeout: 15000, // 타임아웃을 15초로 증가
                    maximumAge: 0, // 캐시된 위치 사용 안 함
                  }
                );
              } else {
                // Geolocation을 지원하지 않는 경우
                alert("이 브라우저는 위치 정보를 지원하지 않습니다.\n\n경로 안내를 계속하려면 출발지를 직접 입력해주세요.");
              }
            };
            
            getCurrentLocation();
          }
          
          // 로컬 state도 업데이트 (UI 표시용)
          setStartLocation("현재 위치");
          setEndLocation(place.name);
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

      {/* PlaceDetailPage */}
      {selectedPlaceForDetail && (
        <PlaceDetailPage
          isOpen={!!selectedPlaceForDetail}
          onClose={() => setSelectedPlaceForDetail(null)}
          place={selectedPlaceForDetail}
          onNavigate={onNavigate}
          onOpenDashboard={onOpenDashboard}
          onSearchSubmit={onSearchSubmit}
        />
      )}
    </div>
  );
}
