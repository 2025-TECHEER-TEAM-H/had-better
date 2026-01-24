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
import placeService, { type SavedPlace, type SearchPlaceHistory } from "@/services/placeService";
import routeService, { type RouteSearchHistory } from "@/services/routeService";
import userService from "@/services/userService";
import { useAuthStore } from "@/stores/authStore";
import { useRouteStore } from "@/stores/routeStore";
import { useNavigationStore } from "@/stores/navigationStore";
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
  const { user, refreshToken, logout: clearAuthState, updateUser } = useAuthStore();
  const { setDepartureArrival, resetRoute } = useRouteStore();
  const { departure: navDeparture, arrival: navArrival, hasNavigationIntent, autoSearch, clearNavigation } = useNavigationStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [isWebView, setIsWebView] = useState(false);

  // 출발지/도착지 좌표 포함 상태
  const [_selectedDeparture, setSelectedDeparture] = useState<LocationWithCoords | null>(null);
  const [_selectedArrival, setSelectedArrival] = useState<LocationWithCoords | null>(null);

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

  // 최근 경로 검색 기록 상태
  const [routeSearchHistories, setRouteSearchHistories] = useState<RouteSearchHistory[]>([]);
  const [isLoadingRouteHistories, setIsLoadingRouteHistories] = useState(false);

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

  // 노선도 위치 제한 함수 (이미지가 화면 밖으로 너무 많이 나가지 않도록)
  const constrainSubwayPosition = (x: number, y: number, zoom: number) => {
    // 뷰포트 크기 (대략적인 값, 실제로는 노선도 컨테이너 크기)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 100; // 헤더 높이 제외 (줄임)
    
    // 확대된 이미지의 실제 크기
    const imageWidth = viewportWidth * zoom;
    const imageHeight = viewportHeight * zoom;
    
    // 이미지가 뷰포트보다 작으면 중앙 고정
    if (imageWidth <= viewportWidth && imageHeight <= viewportHeight) {
      return { x: 0, y: 0 };
    }
    
    // 드래그 제한 범위 계산
    // 이미지의 가장자리가 뷰포트 가장자리를 넘지 않도록
    const maxX = (imageWidth - viewportWidth) / 2;
    const maxY = (imageHeight - viewportHeight) / 2;
    
    // 줌 레벨에 따라 위쪽 드래그 제한을 동적으로 조정
    // 줌이 작을 때(1.0): 위쪽 드래그 거의 없음 (5%)
    // 줌이 클 때(3.0): 위쪽 드래그 충분히 허용 (85%)
    const zoomFactor = Math.min(1, Math.max(0, (zoom - 1.0) / 2.0)); // 0 ~ 1 사이 값
    const topDragRatio = 0.05 + (zoomFactor * 0.80); // 5% ~ 85%
    
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY * topDragRatio, y)), // 줌에 따라 위쪽 드래그 허용
    };
  };

  // 시간대 선택 상태
  const [timeOfDay, setTimeOfDay] = useState<"day" | "evening" | "night">("day");

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

  // 최근 경로 검색 기록 불러오기
  const loadRouteSearchHistories = async () => {
    try {
      setIsLoadingRouteHistories(true);
      const response = await routeService.getRouteSearchHistories(5);
      if (response.status === "success" && response.data) {
        // UI에서 중복 제거: 출발지+도착지가 같은 기록은 최신 것만 남김
        const seen = new Map<string, RouteSearchHistory>();
        response.data.forEach((history) => {
          const key = `${history.departure.name}|${history.arrival.name}`;
          // Map에 없거나, 현재 기록이 더 최신이면 교체
          if (!seen.has(key) || (seen.get(key)!.id < history.id)) {
            seen.set(key, history);
          }
        });
        // Map의 값들을 배열로 변환 (최신순 정렬)
        const uniqueHistories = Array.from(seen.values()).sort((a, b) => b.id - a.id);
        setRouteSearchHistories(uniqueHistories);
      } else {
        setRouteSearchHistories([]);
      }
    } catch (error) {
      console.error("최근 경로 검색 기록 불러오기 실패:", error);
      setRouteSearchHistories([]);
    } finally {
      setIsLoadingRouteHistories(false);
    }
  };

  // 초기 마운트 시 최근 검색 기록 로드
  useEffect(() => {
    loadSearchHistories();
    loadRouteSearchHistories();
  }, []);

  // 네비게이션 인텐트 소비 (즐겨찾기에서 경로 안내 시작 시)
  useEffect(() => {
    if (hasNavigationIntent && navDeparture && navArrival) {
      const departureLocation = {
        name: navDeparture.name,
        lat: navDeparture.lat,
        lon: navDeparture.lon,
      };
      const arrivalLocation = {
        name: navArrival.name,
        lat: navArrival.lat,
        lon: navArrival.lon,
      };

      // 출발지/도착지 텍스트 필드 설정
      setStartLocation(navDeparture.name);
      setEndLocation(navArrival.name);

      // 좌표 정보 설정
      setSelectedDeparture(departureLocation);
      setSelectedArrival(arrivalLocation);

      // 자동 검색이 활성화된 경우 바로 경로 페이지로 이동
      if (autoSearch) {
        resetRoute();
        setDepartureArrival(departureLocation, arrivalLocation);
        // 네비게이션 인텐트 소비 완료 후 경로 페이지로 이동
        clearNavigation();
        onNavigate?.("route");
      } else {
        // 자동 검색이 아닌 경우 인텐트만 소비
        clearNavigation();
      }
    }
  }, [hasNavigationIntent, navDeparture, navArrival, autoSearch, clearNavigation, resetRoute, setDepartureArrival, onNavigate]);

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
    const handler = (_event: Event) => {
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
    const newX = e.clientX - subwayDragStart.x;
    const newY = e.clientY - subwayDragStart.y;
    const constrained = constrainSubwayPosition(newX, newY, subwayZoom);
    setSubwayPosition(constrained);
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
    const newX = touch.clientX - subwayDragStart.x;
    const newY = touch.clientY - subwayDragStart.y;
    const constrained = constrainSubwayPosition(newX, newY, subwayZoom);
    setSubwayPosition(constrained);
  };

  // 노선도 터치 종료
  const handleSubwayTouchEnd = () => {
    setIsSubwayDragging(false);
  };

  // 노선도 마우스 휠로 줌
  const handleSubwayWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.max(1.0, Math.min(3, subwayZoom + delta)); // 최소 줌 1.0으로 조정 (빈공간 방지)
    setSubwayZoom(newZoom);
    // 줌 변경 시 위치도 제한 범위 내로 조정
    const constrained = constrainSubwayPosition(subwayPosition.x, subwayPosition.y, newZoom);
    setSubwayPosition(constrained);
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

  // 최근 경로 검색 기록 단건 삭제
  const handleDeleteRouteHistory = async (historyId: number) => {
    try {
      // 먼저 화면에서 바로 제거 (UI 우선)
      setRouteSearchHistories((prev) => prev.filter((h) => h.id !== historyId));
      // 이후 서버에 삭제 요청 (실패해도 UI는 유지)
      await routeService.deleteRouteSearchHistory(historyId);
    } catch {
      // 에러는 콘솔만 조용히 무시 (UI는 유지)
    }
  };

  // 최근 경로 검색 기록 전체 삭제
  const handleClearRouteHistories = async () => {
    if (routeSearchHistories.length === 0) return;
    try {
      await routeService.clearRouteSearchHistories();
      setRouteSearchHistories([]);
    } catch (error) {
      console.error("경로 검색 기록 전체 삭제 실패:", error);
    }
  };

  // 최근 경로 검색 기록 클릭 핸들러
  const handleRouteHistoryClick = async (history: RouteSearchHistory) => {
    try {
      // 출발지와 도착지를 입력 필드에 설정
      setStartLocation(history.departure.name);
      setEndLocation(history.arrival.name);

      // 장소 검색으로 좌표 가져오기 (검색 기록 저장 안 함)
      const [departureResult, arrivalResult] = await Promise.all([
        placeService.searchPlaces({ q: history.departure.name, limit: 1, save_history: false }),
        placeService.searchPlaces({ q: history.arrival.name, limit: 1, save_history: false }),
      ]);

      if (
        departureResult.status === "success" &&
        departureResult.data &&
        departureResult.data.length > 0 &&
        arrivalResult.status === "success" &&
        arrivalResult.data &&
        arrivalResult.data.length > 0
      ) {
        const departurePlace = departureResult.data[0];
        const arrivalPlace = arrivalResult.data[0];

        const departureLocation: LocationWithCoords = {
          name: departurePlace.name,
          lat: departurePlace.coordinates.lat,
          lon: departurePlace.coordinates.lon,
        };

        const arrivalLocation: LocationWithCoords = {
          name: arrivalPlace.name,
          lat: arrivalPlace.coordinates.lat,
          lon: arrivalPlace.coordinates.lon,
        };

        // 경로 설정 및 페이지 이동
        resetRoute();
        setDepartureArrival(departureLocation, arrivalLocation);
        setSelectedDeparture(departureLocation);
        setSelectedArrival(arrivalLocation);
        onNavigate?.("route");
      } else {
        alert("출발지 또는 도착지를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("경로 검색 기록 클릭 처리 실패:", error);
      alert("경로 검색 중 오류가 발생했습니다.");
    }
  };

  // 시간대별 배경색
  const getBackgroundGradient = () => {
    switch (timeOfDay) {
      case "evening":
        // 선명한 저녁 하늘: 따뜻한 오렌지/핑크 톤
        return "linear-gradient(180deg, #FF8C69 0%, #FFB347 35%, #FFD700 60%, #FFF8DC 85%, #FFFFFF 100%)";
      case "night":
        // 깊고 선명한 밤 하늘: 어두운 보라/파란 톤
        return "linear-gradient(180deg, #1a1a3e 0%, #2d2d5e 30%, #3d3d7e 60%, #4d4d9e 85%, #5d5dae 100%)";
      default: // day
        return "linear-gradient(180deg, #b0d8e8 0%, #e0f0f8 48%, #ffffff 100%)";
    }
  };

  // 시간대별 태양/달 색상 및 위치
  const getSunMoonProps = () => {
    switch (timeOfDay) {
      case "evening":
        return {
          cx: 270,
          cy: 280, // 지평선 근처
          r: 60,
          glowColor: "#FF6347",
          gradient: {
            inner: "#FF4500",
            middle: "#FF6347",
            outer: "#FF8C69",
          },
          opacity: 0.95,
        };
      case "night":
        return {
          cx: 120,
          cy: 150, // 높은 위치
          r: 45,
          glowColor: "#FFD700",
          gradient: {
            inner: "#FFD700",
            middle: "#FFE44D",
            outer: "#FFF8DC",
          },
          opacity: 0.95,
        };
      default: // day
        return {
          cx: 270,
          cy: 200,
          r: 55,
          glowColor: "#FFE66B",
          gradient: {
            inner: "#FFE66B",
            middle: "#FFD93D",
            outer: "#FFB84D",
          },
          opacity: 0.85,
        };
    }
  };

  // 시간대별 구름 색상
  const getCloudColor = () => {
    switch (timeOfDay) {
      case "evening":
        // 저녁 하늘에 어울리는 따뜻한 오렌지/핑크 톤의 구름
        return "#FFE4B5";
      case "night":
        // 밤 하늘에 어울리는 어두운 보라/회색 톤의 구름
        return "#6B5B95";
      default: // day
        return "#ffffff";
    }
  };

  // 시간대별 산 그라데이션
  const getMountainGradients = () => {
    switch (timeOfDay) {
      case "evening":
        // 저녁 하늘에 어울리는 선명한 실루엣: 따뜻한 톤의 산
        return {
          m1: { top: "#FFE4B5", mid: "#8B7355", bottom: "#654321" },
          m2: { top: "#FFDAB9", mid: "#A0522D", bottom: "#5C3317" },
          m3: { top: "#FFE4B5", mid: "#8B7355", bottom: "#654321" },
        };
      case "night":
        // 밤 하늘에 어울리는 어두운 실루엣: 깊은 보라/파란 톤의 산
        return {
          m1: { top: "#4B3F6B", mid: "#3D2F5F", bottom: "#2D1F4F" },
          m2: { top: "#3D2F5F", mid: "#2D1F4F", bottom: "#1D0F3F" },
          m3: { top: "#5B4F7B", mid: "#4B3F6B", bottom: "#3D2F5F" },
        };
      default: // day
        return {
          m1: { top: "#ffffff", mid: "#8dd4b0", bottom: "#4a9960" },
          m2: { top: "#ffffff", mid: "#75c5a0", bottom: "#2d5f3f" },
          m3: { top: "#ffffff", mid: "#96d9ba", bottom: "#4a9960" },
        };
    }
  };

  const sunMoonProps = getSunMoonProps();
  const cloudColor = getCloudColor();
  const mountainGradients = getMountainGradients();

  // 시간대별 카드 스타일
  const getCardStyle = () => {
    switch (timeOfDay) {
      case "evening":
        return {
          background: "linear-gradient(135deg, rgba(255,255,255,0.60) 0%, rgba(255,182,193,0.35) 100%)",
          border: "1px solid rgba(255,182,193,0.55)",
          boxShadow: "0 18px 36px rgba(255,107,157,0.25), inset 0 1px 0 rgba(255,255,255,0.40)",
        };
      case "night":
        return {
          background: "linear-gradient(135deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.45) 100%)",
          border: "1px solid rgba(255,255,255,0.60)",
          boxShadow: "0 18px 36px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.50)",
        };
      default: // day
        return {
          background: "linear-gradient(135deg, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.28) 100%)",
          border: "1px solid rgba(255,255,255,0.50)",
          boxShadow: "0 18px 36px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.35)",
        };
    }
  };

  const getChipStyle = () => {
    switch (timeOfDay) {
      case "evening":
        return {
          background: "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,182,193,0.30) 100%)",
          border: "1px solid rgba(255,182,193,0.50)",
          boxShadow: "0 10px 20px rgba(255,107,157,0.20), inset 0 1px 0 rgba(255,255,255,0.35)",
        };
      case "night":
        return {
          background: "linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.40) 100%)",
          border: "1px solid rgba(255,255,255,0.55)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.45)",
        };
      default: // day
        return {
          background: "linear-gradient(135deg, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.24) 100%)",
          border: "1px solid rgba(255,255,255,0.48)",
          boxShadow: "0 10px 20px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.30)",
        };
    }
  };

  const cardStyle = getCardStyle();
  const chipStyle = getChipStyle();

  return (
    <div className="relative size-full hb-search-page" style={{
      background: getBackgroundGradient(),
      transition: "background 1s ease-in-out",
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
            transition: background 0.8s ease, border-color 0.8s ease, box-shadow 0.8s ease;
          }

          .hb-search-page .hb-search-glass-chip {
            position: relative;
            overflow: hidden;
            transition: background 0.8s ease, border-color 0.8s ease, box-shadow 0.8s ease;
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
            color: #000000 !important;
            opacity: 1 !important;
            /* 가독성만 올리기(두께 변화 최소): 부드러운 그림자로 대비 강화 */
            text-shadow: 0 1px 6px rgba(0, 0, 0, 0.28);
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
              <stop offset="0" stopColor={mountainGradients.m1.top} stopOpacity="0.95" />
              <stop offset="0.45" stopColor={mountainGradients.m1.mid} stopOpacity="0.85" />
              <stop offset="1" stopColor={mountainGradients.m1.bottom} stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="m2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={mountainGradients.m2.top} stopOpacity="0.9" />
              <stop offset="0.5" stopColor={mountainGradients.m2.mid} stopOpacity="0.8" />
              <stop offset="1" stopColor={mountainGradients.m2.bottom} stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="m3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={mountainGradients.m3.top} stopOpacity="0.92" />
              <stop offset="0.55" stopColor={mountainGradients.m3.mid} stopOpacity="0.72" />
              <stop offset="1" stopColor={mountainGradients.m3.bottom} stopOpacity="0.42" />
            </linearGradient>

            <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
            <filter id="cloudSoft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* Sun/Moon - 시간대에 따라 변경 */}
          <g>
            <defs>
              <radialGradient id="sunMoonGradient" cx="50%" cy="50%">
                <stop offset="0%" stopColor={sunMoonProps.gradient.inner} stopOpacity="0.9" />
                <stop offset="70%" stopColor={sunMoonProps.gradient.middle} stopOpacity="0.7" />
                <stop offset="100%" stopColor={sunMoonProps.gradient.outer} stopOpacity="0.4" />
              </radialGradient>
            </defs>
            {/* Sun/Moon glow effect */}
            <circle
              cx={sunMoonProps.cx}
              cy={sunMoonProps.cy}
              r={sunMoonProps.r}
              fill={sunMoonProps.glowColor}
              opacity={timeOfDay === "night" ? "0.35" : timeOfDay === "evening" ? "0.45" : "0.25"}
            />
            <circle
              cx={sunMoonProps.cx}
              cy={sunMoonProps.cy}
              r={sunMoonProps.r - 10}
              fill="url(#sunMoonGradient)"
              opacity={sunMoonProps.opacity}
            />
            {/* 밤에는 별 추가 - 더 밝고 선명하게 */}
            {timeOfDay === "night" && (
              <>
                <circle cx="80" cy="100" r="2.5" fill="#FFD700" opacity="1" />
                <circle cx="150" cy="80" r="2" fill="#FFE44D" opacity="0.95" />
                <circle cx="200" cy="120" r="2.5" fill="#FFD700" opacity="1" />
                <circle cx="250" cy="70" r="1.8" fill="#FFF8DC" opacity="0.9" />
                <circle cx="320" cy="90" r="2" fill="#FFE44D" opacity="0.95" />
                <circle cx="360" cy="110" r="2.5" fill="#FFD700" opacity="1" />
                <circle cx="100" cy="130" r="1.5" fill="#FFF8DC" opacity="0.85" />
                <circle cx="280" cy="105" r="1.8" fill="#FFE44D" opacity="0.9" />
                <circle cx="340" cy="75" r="2" fill="#FFD700" opacity="0.95" />
              </>
            )}
          </g>

          {/* clouds - 시간대별 색상 */}
          <g filter="url(#cloudSoft)" opacity={timeOfDay === "night" ? "0.65" : timeOfDay === "evening" ? "0.85" : "0.78"}>
            {/* left cloud cluster */}
            <g className="hb-search-cloud-drift">
              <g transform="translate(0 0) scale(1.18)">
                <g className="hb-search-cloud-bob">
                <circle cx="70" cy="90" r="26" fill={cloudColor} />
                <circle cx="98" cy="86" r="20" fill={cloudColor} />
                <circle cx="120" cy="94" r="22" fill={cloudColor} />
                </g>
              </g>
            </g>

            {/* right cloud cluster */}
            <g className="hb-search-cloud-drift-slow">
              <g transform="translate(0 0) scale(1.12)">
                <g className="hb-search-cloud-bob-slow">
                <circle cx="300" cy="80" r="22" fill={cloudColor} />
                <circle cx="322" cy="78" r="16" fill={cloudColor} />
                <circle cx="340" cy="86" r="18" fill={cloudColor} />
                {timeOfDay !== "night" && (
                  <>
                    <circle cx="310" cy="95" r="20" fill={cloudColor} />
                    <circle cx="330" cy="100" r="18" fill={cloudColor} />
                  </>
                )}
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
                {timeOfDay === "evening" ? (
                  <>
                    <stop offset="0" stopColor="rgba(255,218,185,0.0)" />
                    <stop offset="0.3" stopColor="rgba(255,218,185,0.4)" />
                    <stop offset="0.7" stopColor="rgba(255,239,213,0.8)" />
                    <stop offset="1" stopColor="rgba(255,255,255,1.0)" />
                  </>
                ) : timeOfDay === "night" ? (
                  <>
                    <stop offset="0" stopColor="rgba(75,63,107,0.0)" />
                    <stop offset="0.3" stopColor="rgba(93,79,123,0.4)" />
                    <stop offset="0.7" stopColor="rgba(107,91,149,0.7)" />
                    <stop offset="1" stopColor="rgba(125,109,169,1.0)" />
                  </>
                ) : (
                  <>
                    <stop offset="0" stopColor="rgba(255,255,255,0.0)" />
                    <stop offset="0.3" stopColor="rgba(255,255,255,0.3)" />
                    <stop offset="0.7" stopColor="rgba(255,255,255,0.7)" />
                    <stop offset="1" stopColor="rgba(255,255,255,1.0)" />
                  </>
                )}
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
              className="bg-white/20 backdrop-blur-lg rounded-[12px] shadow-xl border border-white/30 w-[190px] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleEditProfileClick}
                className="w-full px-4 py-3 flex items-center justify-between bg-white/25 hover:bg-white/35 active:bg-white/40 text-gray-800 backdrop-blur-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] transition-all first:rounded-t-[12px]"
              >
                <span className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] text-[13px] text-gray-800">
                  내 정보 수정
                </span>
                <span className="text-[16px]">✏️</span>
              </button>
              <div className="h-[1px] bg-white/20 mx-2" />
              <button
                type="button"
                onClick={handleLogoutClick}
                className="w-full px-4 py-3 flex items-center justify-between bg-white/25 hover:bg-red-500/20 active:bg-red-500/30 text-gray-800 backdrop-blur-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] transition-all last:rounded-b-[12px]"
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
          {/* SearchPage(검색 탭)과 동일한 헤더 UI 유지: 검색바(목적지 입력) 제거 */}
          <div className="relative z-20 hb-search-header">
            <AppHeader
              onBack={() => {
                // 지하철 모드에서는 컨텍스트에서 온 기본 뒤로가기 동작 사용
                onBack?.();
              }}
              onNavigate={onNavigate}
              onOpenDashboard={onOpenDashboard}
              onMenuClick={handleToggleProfileMenu}
              title="" /* SearchPage에서만 커스텀 타이틀을 올려 디자인/폰트 통일 */
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
              // 지하철 탭에서는 검색 입력 컨테이너를 숨기고(=검색 탭과 동일),
              // 탭/버튼 기능은 그대로 유지
              showSearchBar={false}
            />
            <div
              className="pointer-events-none absolute inset-x-0 hb-search-header-title text-center"
              style={{ top: "calc(21px + env(safe-area-inset-top, 0px))", color: "#000" }}
            >
              HAD BETTER
            </div>
          </div>
          {isWebView ? (
            // 웹 화면: 텍스트 표시
            <div className="absolute inset-0 flex items-center justify-center p-5 z-0" style={{ paddingTop: '140px' }}>
              <p className="css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#2d5f3f]">
                노선도 이미지가 나왔습니다
              </p>
            </div>
          ) : (
            // 앱 화면: 노선도 이미지 표시
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden z-0" style={{ paddingTop: '140px' }}>
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
              className="pointer-events-none absolute inset-x-0 hb-search-header-title text-center"
              style={{ top: "calc(21px + env(safe-area-inset-top, 0px))", color: "#000" }}
            >
              HAD BETTER
            </div>
          </div>

          {/* Content (clean card layout) */}
          <div
            // AppHeader의 sideInset(16px)과 기준선을 맞춰 통일감 확보
            className="relative z-10 px-4 pb-7"
            // 탭바(44px) 아래 여백이 자연스럽게 떨어지도록 약간 조정
            style={{ paddingTop: "calc(140px + env(safe-area-inset-top, 0px))" }}
          >
            <div className="mx-auto w-full max-w-[420px]">
              {/* Hero (greeting + destination search) */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
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
                      {user?.nickname || "사용자"}님,
                    </p>
                    <p className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[18px] leading-[22px] text-black">
                      어디로 레이싱 할까요?
                    </p>
                  </div>
                </div>
                {/* 시간대 선택 버튼 */}
                <div className="shrink-0">
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1.5 border border-black/10 shadow-sm">
                    <button
                      type="button"
                      onClick={() => setTimeOfDay("day")}
                      className={`px-2.5 py-1 rounded-full text-[12px] font-bold transition-all ${
                        timeOfDay === "day"
                          ? "bg-[#FFD93D] text-black shadow-sm"
                          : "text-black/60 hover:text-black"
                      }`}
                      title="낮"
                    >
                      ☀️
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeOfDay("evening")}
                      className={`px-2.5 py-1 rounded-full text-[12px] font-bold transition-all ${
                        timeOfDay === "evening"
                          ? "bg-[#FF6B9D] text-white shadow-sm"
                          : "text-black/60 hover:text-black"
                      }`}
                      title="저녁"
                    >
                      🌅
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeOfDay("night")}
                      className={`px-2.5 py-1 rounded-full text-[12px] font-bold transition-all ${
                        timeOfDay === "night"
                          ? "bg-[#1a1a2e] text-white shadow-sm"
                          : "text-black/60 hover:text-black"
                      }`}
                      title="밤"
                    >
                      🌙
                    </button>
                  </div>
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
              <div
                className="mt-5 rounded-[22px] hb-search-glass-card hb-search-glass-fun p-4"
                style={{
                  ...cardStyle,
                  backdropFilter: "blur(18px) saturate(160%)",
                  WebkitBackdropFilter: "blur(18px) saturate(160%)",
                }}
              >
                  <div className="flex items-center gap-3 rounded-[18px] bg-white/85 backdrop-blur-sm px-4 py-3 border border-white/55 shadow-[0px_10px_22px_rgba(0,0,0,0.14)]">
                  <img alt="" className="size-[28px] object-contain pointer-events-none" src={imgGemGreen1} />
                <input
                  type="text"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  placeholder="출발지를 입력해주세요"
                    className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] bg-transparent outline-none text-[14px] text-black w-full placeholder:text-black/40"
                  />
                </div>

                <div className="mt-3 flex items-center gap-3 rounded-[18px] bg-white/85 backdrop-blur-sm px-4 py-3 border border-white/55 shadow-[0px_10px_22px_rgba(0,0,0,0.14)]">
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
                    // 출발지 검색 (최근 기록에 저장하지 않음)
                    const departureResult = await placeService.searchPlaces({ q: start, limit: 1, save_history: false });
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

                  // 도착지 검색 (최근 기록에 저장하지 않음)
                  const arrivalResult = await placeService.searchPlaces({ q: end, limit: 1, save_history: false });
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
                    style={{
                      ...chipStyle,
                      backdropFilter: "blur(16px) saturate(155%)",
                      WebkitBackdropFilter: "blur(16px) saturate(155%)",
                    }}
                  >
                    <div
                      className="size-[56px] rounded-[16px] flex items-center justify-center backdrop-blur-lg border border-white/40 shadow-lg"
                      style={{
                        backgroundColor: favoriteLocations.home.length > 0 ? '#ffc107' : 'rgba(200, 200, 200, 0.4)',
                      }}
                    >
                      <img
                        alt=""
                        className="size-[28px] object-contain pointer-events-none"
                        src={imgWindow2}
                        style={{ opacity: favoriteLocations.home.length > 0 ? 1 : 0.4 }}
                      />
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
                    style={{
                      ...chipStyle,
                      backdropFilter: "blur(16px) saturate(155%)",
                      WebkitBackdropFilter: "blur(16px) saturate(155%)",
                    }}
                  >
                    <div
                      className="size-[56px] rounded-[16px] flex items-center justify-center backdrop-blur-lg border border-white/40 shadow-lg"
                      style={{
                        backgroundColor: favoriteLocations.school.length > 0 ? '#6df3e3' : 'rgba(200, 200, 200, 0.4)',
                      }}
                    >
                      <img
                        alt=""
                        className="size-[28px] object-contain pointer-events-none"
                        src={imgSaw1}
                        style={{ opacity: favoriteLocations.school.length > 0 ? 1 : 0.4 }}
                      />
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
                    style={{
                      ...chipStyle,
                      backdropFilter: "blur(16px) saturate(155%)",
                      WebkitBackdropFilter: "blur(16px) saturate(155%)",
                    }}
                  >
                    <div
                      className="size-[56px] rounded-[16px] flex items-center justify-center backdrop-blur-lg border border-white/40 shadow-lg"
                      style={{
                        backgroundColor: favoriteLocations.work.length > 0 ? '#ff6b9d' : 'rgba(200, 200, 200, 0.4)',
                      }}
                    >
                      <img
                        alt=""
                        className="size-[34px] object-contain pointer-events-none"
                        src={imgCoinGold2}
                        style={{ opacity: favoriteLocations.work.length > 0 ? 1 : 0.4 }}
                      />
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
                    style={{
                      ...chipStyle,
                      backdropFilter: "blur(16px) saturate(155%)",
                      WebkitBackdropFilter: "blur(16px) saturate(155%)",
                    }}
                  >
                    <div
                      className="size-[56px] rounded-[16px] flex items-center justify-center backdrop-blur-lg border border-white/40 shadow-lg"
                      style={{
                        backgroundColor: '#a78bfa',
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

              {/* Recent section - Glassmorphism style */}
              <div
                className="mt-7 rounded-[22px] hb-search-glass-card hb-search-glass-fun p-4"
                style={{
                  ...cardStyle,
                  backdropFilter: "blur(18px) saturate(160%)",
                  WebkitBackdropFilter: "blur(18px) saturate(160%)",
                }}
              >
                {/* Header: Title and Delete All button */}
                <div className="flex items-center justify-between mb-4">
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
                </div>

                {/* Empty state message */}
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

                {/* Pill-shaped history items - centered and full width */}
                {searchHistories.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4">
                    {searchHistories.map((history, index) => {
                      // 최근 기록일수록 흰색, 오래된 기록일수록 파란색 계열
                      const totalItems = searchHistories.length;
                      const ratio = index / Math.max(totalItems - 1, 1); // 0 (최근) ~ 1 (오래됨)

                      // 파란색 계열에서 흰색으로 그라데이션
                      // ratio가 0일 때 흰색, ratio가 1일 때 파란색
                      const whiteAmount = 1 - ratio; // 1 (최근) ~ 0 (오래됨)
                      const blueAmount = ratio; // 0 (최근) ~ 1 (오래됨)

                      // 파란색 RGB: 하늘색 계열 (135, 206, 250) ~ 더 진한 파란색 (100, 150, 200)
                      const r = Math.round(255 * whiteAmount + 100 * blueAmount);
                      const g = Math.round(255 * whiteAmount + 150 * blueAmount);
                      const b = Math.round(255 * whiteAmount + 200 * blueAmount);
                      const opacity = 0.32 + (blueAmount * 0.18); // 0.32 ~ 0.5

                      return (
                        <div
                          key={history.id}
                          className="relative rounded-full px-4 py-2.5 flex items-center gap-2 w-full group hover:bg-white/25 transition-all cursor-pointer"
                          style={{
                            background: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, ${opacity}) 0%, rgba(${r}, ${g}, ${b}, ${opacity * 0.6}) 100%)`,
                            border: '1px solid rgba(255,255,255,0.36)',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.24)',
                            backdropFilter: 'blur(16px) saturate(155%)',
                            WebkitBackdropFilter: 'blur(16px) saturate(155%)',
                          }}
                          onClick={() => handleHistoryClick(history)}
                        >
                          <span
                            className="flex-1 css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] text-[12px] text-black truncate"
                          >
                            {history.keyword}
                          </span>
                          <button
                            type="button"
                            className="shrink-0 size-[18px] flex items-center justify-center text-[12px] font-bold text-[#b91c1c] hover:text-[#7f1d1d] active:text-[#991b1b] css-4hzbpn transition-colors relative z-10"
                            style={{ touchAction: 'manipulation' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHistory(history.id);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 최근 경로 기록 섹션 */}
              <div
                className="mt-7 rounded-[22px] hb-search-glass-card hb-search-glass-fun p-4"
                style={{
                  ...cardStyle,
                  backdropFilter: "blur(18px) saturate(160%)",
                  WebkitBackdropFilter: "blur(18px) saturate(160%)",
                }}
              >
                {/* Header: Title and Delete All button */}
                <div className="flex items-center justify-between mb-4">
                  <p className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[13px] text-black/80">
                    최근 경로 기록
                  </p>
                  <button
                    type="button"
                    onClick={handleClearRouteHistories}
                    disabled={routeSearchHistories.length === 0 || isLoadingRouteHistories}
                    className="css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-medium text-[12px] text-black/60 hover:text-[#4a9960] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    전체 삭제
                  </button>
                </div>

                {/* Empty state message */}
                {isLoadingRouteHistories && (
                  <p className="css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] text-[11px] text-[rgba(0,0,0,0.35)]">
                    최근 경로 기록을 불러오는 중...
                  </p>
                )}
                {!isLoadingRouteHistories && routeSearchHistories.length === 0 && (
                  <p className="css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] text-[11px] text-[rgba(0,0,0,0.35)]">
                    최근 경로 기록이 없습니다.
                  </p>
                )}

                {/* Route history items */}
                {routeSearchHistories.length > 0 && (
                  <div className="flex flex-col gap-2 mt-4">
                    {routeSearchHistories.map((history, index) => {
                      // 최근 기록일수록 흰색, 오래된 기록일수록 초록색 계열
                      const totalItems = routeSearchHistories.length;
                      const ratio = index / Math.max(totalItems - 1, 1);
                      const whiteAmount = 1 - ratio;
                      const greenAmount = ratio;

                      // 초록색 계열 그라데이션
                      const r = Math.round(255 * whiteAmount + 100 * greenAmount);
                      const g = Math.round(255 * whiteAmount + 200 * greenAmount);
                      const b = Math.round(255 * whiteAmount + 150 * greenAmount);
                      const opacity = 0.32 + (greenAmount * 0.18);

                      return (
                        <div
                          key={history.id}
                          className="relative rounded-full px-4 py-2.5 flex items-center gap-2 w-full group hover:bg-white/25 transition-all cursor-pointer"
                          style={{
                            background: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, ${opacity}) 0%, rgba(${r}, ${g}, ${b}, ${opacity * 0.6}) 100%)`,
                            border: '1px solid rgba(255,255,255,0.36)',
                            boxShadow: '0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.24)',
                            backdropFilter: 'blur(16px) saturate(155%)',
                            WebkitBackdropFilter: 'blur(16px) saturate(155%)',
                          }}
                          onClick={() => handleRouteHistoryClick(history)}
                        >
                          <span
                            className="flex-1 css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] text-[12px] text-black truncate"
                          >
                            {history.departure.name} → {history.arrival.name}
                          </span>
                          <button
                            type="button"
                            className="shrink-0 size-[18px] flex items-center justify-center text-[12px] font-bold text-[#b91c1c] hover:text-[#7f1d1d] active:text-[#991b1b] css-4hzbpn transition-colors relative z-10"
                            style={{ touchAction: 'manipulation' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRouteHistory(history.id);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
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
