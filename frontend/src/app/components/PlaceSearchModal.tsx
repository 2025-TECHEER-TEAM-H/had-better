import { AppHeader } from "@/app/components/AppHeader";
import { MapView } from "@/app/components/MapView";
import imgCoinGold2 from "@/assets/coin-gold.png";
import imgSaw1 from "@/assets/saw.png";
import imgWindow2 from "@/assets/window.png";
import placeService from "@/services/placeService";
import { useEffect, useMemo, useRef, useState } from "react";

type PageType = "map" | "search" | "favorites" | "subway" | "route" | "background";

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
  _poiPlaceId?: number; // API 호출용 POI Place ID
  _savedPlaceId?: number; // 즐겨찾기 삭제용 Saved Place ID
}

interface PlaceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlace: (place: Place) => void;
  targetType: "home" | "school" | "work" | null;
  /** 이미 등록된 집/학교/회사 장소 목록(초기 화면에서 리스트로 표시) */
  currentSavedPlaces?: Place[];
  /** 등록된 장소를 취소(삭제) */
  onRemoveSavedPlace?: (placeId: string) => void;
  /** 등록된 장소로 경로 안내 요청 */
  onRequestRoute?: (place: Place) => void;
  onNavigate: (page: PageType) => void;
  onOpenDashboard: () => void;
}

// 카테고리별 아이콘 매핑 (SearchResultsPage와 동일)
const getCategoryIcon = (category: string): string => {
  const c = (category || "").toLowerCase();
  const hasAny = (tokens: string[]) => tokens.some((t) => c.includes(t));

  if (hasAny(["카페", "커피", "coffee", "cafe", "베이커리", "디저트"])) return "☕";
  if (hasAny(["음식", "음식점", "식당", "restaurant", "dining", "한식", "중식", "일식", "양식", "패스트푸드"])) return "🍽️";
  if (hasAny(["편의점", "convenience", "cvs"])) return "🏪";
  if (hasAny(["병원", "의원", "clinic", "hospital", "응급", "의료"])) return "🏥";
  if (hasAny(["약국", "pharmacy", "drugstore"])) return "💊";
  if (hasAny(["공원", "park", "산", "등산", "숲", "자연"])) return "🏞️";
  if (hasAny(["학교", "대학", "대학교", "univ", "university", "school", "학원"])) return "🏫";
  if (hasAny(["은행", "bank", "atm"])) return "🏦";
  if (hasAny(["주유", "주유소", "gas", "fuel", "station"])) return "⛽";
  if (hasAny(["주차", "parking"])) return "🅿️";
  if (hasAny(["지하철", "subway", "metro", "train", "rail"])) return "🚇";
  if (hasAny(["버스", "bus"])) return "🚌";
  if (hasAny(["호텔", "숙박", "hotel", "motel", "hostel"])) return "🏨";
  if (hasAny(["마트", "market", "grocery", "supermarket"])) return "🛒";
  if (hasAny(["백화점", "department", "mall", "쇼핑"])) return "🏬";

  return "📍"; // 기본 아이콘
};

// 카테고리별 배경색 매핑
const getCategoryColor = (_category: string, index: number): string => {
  const colors = ["#7ed321", "#00d9ff", "white", "#ffc107", "#ff9ff3", "#54a0ff"];
  return colors[index % colors.length];
};

// NOTE: 이전에는 모의 데이터(mockPlaces)를 사용했지만, 이제는 실제 API 검색 결과를 사용합니다.

export function PlaceSearchModal({
  isOpen,
  onClose,
  onSelectPlace,
  targetType,
  currentSavedPlaces = [],
  onRemoveSavedPlace,
  onRequestRoute,
  onNavigate,
  onOpenDashboard,
}: PlaceSearchModalProps) {
  // NOTE: 이 모달에서는 상단 메뉴/탭 UI를 숨깁니다. (다만, 경로 안내 등 일부 흐름에서 onNavigate를 사용할 수 있습니다.)
  void onOpenDashboard;

  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  // 검색 결과가 없을 때(기본 화면)는 등록된 장소 "목록"을 보여주는 낮은 시트,
  // 검색 결과가 있을 때는 더 크게 펼쳐서 리스트를 보이게
  const [sheetHeight, setSheetHeight] = useState(34);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(34);
  const [pendingPlace, setPendingPlace] = useState<Place | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 검색 결과 상태
  const [searchResults, setSearchResults] = useState<Place[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // 저장된 장소 목록 (API에서 가져옴)
  const [savedPlaces, setSavedPlaces] = useState<Place[]>([]);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  // 저장된 장소 목록 불러오기
  const loadSavedPlaces = async () => {
    if (!targetType) return;

    setIsLoadingSaved(true);
    try {
      const response = await placeService.getSavedPlaces(targetType);
      if (response.status === "success" && response.data) {
        const places: Place[] = response.data.map((saved) => ({
          id: `saved-${saved.saved_place_id}`,
          name: saved.poi_place.name,
          detail: saved.poi_place.address,
          distance: "",
          time: "",
          icon: "📍", // 기본 아이콘
          color: "#7ed321",
          coordinates: saved.poi_place.coordinates,
          _poiPlaceId: saved.poi_place.poi_place_id,
          _savedPlaceId: saved.saved_place_id,
        }));
        setSavedPlaces(places);
      } else {
        setSavedPlaces([]);
      }
    } catch (error) {
      console.error("저장된 장소 목록 불러오기 실패:", error);
      setSavedPlaces([]);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  // 모달이 열리고 targetType이 있을 때 저장된 장소 목록 로드 및 초기 상태로 리셋
  useEffect(() => {
    if (isOpen && targetType) {
      // 초기 화면으로 리셋 (등록된 장소 목록 화면)
      setShowResults(false);
      setSearchQuery("");
      setSheetHeight(34);
      loadSavedPlaces();
    }
  }, [isOpen, targetType]);

  // 저장된 장소 업데이트 이벤트 리스너
  useEffect(() => {
    const handler = () => {
      if (targetType) {
        loadSavedPlaces();
      }
    };
    window.addEventListener("savedPlaceUpdated", handler);
    return () => window.removeEventListener("savedPlaceUpdated", handler);
  }, [targetType]);

  const handleSearch = async () => {
    const keyword = searchQuery.trim();
    if (!keyword) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await placeService.searchPlaces({ q: keyword, limit: 20 });

      if (response.status === "success" && response.data) {
        const places: Place[] = response.data.map((p, index) => ({
          id: `${p.poi_place_id}-${index}`,
          name: p.name,
          detail: p.address,
          // 거리/시간은 아직 백엔드에서 안 주므로 빈 값으로 두고 나중에 계산 가능
          distance: "",
          time: "",
          // 카테고리에 따라 아이콘/색상 지정
          icon: getCategoryIcon(p.category || ""),
          color: getCategoryColor(p.category || "", index),
          coordinates: p.coordinates,
          _poiPlaceId: p.poi_place_id, // API 호출용
        }));

        setSearchResults(places);
        setShowResults(true);
        setSheetHeight(60);
      } else {
        setSearchResults([]);
        setSearchError(response.error?.message || "장소 검색에 실패했습니다.");
      }
    } catch (error: any) {
      // 서버 에러 메시지 우선 표시
      const message =
        error?.response?.data?.error?.message || "서버 오류로 장소를 검색할 수 없습니다.";
      setSearchResults([]);
      setSearchError(message);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlaceClick = (place: Place) => {
    setPendingPlace(place);
    setIsConfirmOpen(true);
  };

  const handleConfirmAdd = async () => {
    if (!pendingPlace || !targetType || !pendingPlace._poiPlaceId) return;

    try {
      // API로 즐겨찾기 추가
      const response = await placeService.addSavedPlace({
        poi_place_id: pendingPlace._poiPlaceId,
        category: targetType,
      });

      if (response.status === "success" && response.data) {
        // 저장된 장소 정보 업데이트
        const savedPlace: Place = {
          ...pendingPlace,
          _savedPlaceId: response.data.saved_place_id,
        };

        // 부모 컴포넌트에 알림 (SearchPage의 토스트 표시용)
        onSelectPlace(savedPlace);

        // 초기 화면으로 복귀
        setIsConfirmOpen(false);
        setPendingPlace(null);
        setShowResults(false);
        setSearchQuery("");
        setSheetHeight(34);

        // 저장된 장소 목록 다시 로드 (현재 카테고리만)
        loadSavedPlaces();

        // 다른 컴포넌트에도 알림 (SearchPage의 상태 업데이트용)
        window.dispatchEvent(new CustomEvent("savedPlaceUpdated", {
          detail: { category: targetType }
        }));
      } else if (response.status === "error" && response.error?.code === "RESOURCE_CONFLICT") {
        // 409 Conflict: 이미 해당 카테고리에 장소가 등록된 경우
        // "이미 추가하셨습니다" 메시지 표시하고 정상 처리
        alert(`이미 ${titleText}이(가) 등록되어 있습니다.`);

        // 초기 화면으로 복귀
        setIsConfirmOpen(false);
        setPendingPlace(null);
        setShowResults(false);
        setSearchQuery("");
        setSheetHeight(34);

        // 저장된 장소 목록 다시 로드하여 동기화
        loadSavedPlaces();

        // 다른 컴포넌트에도 알림
        window.dispatchEvent(new CustomEvent("savedPlaceUpdated", {
          detail: { category: targetType }
        }));
      } else {
        // 다른 에러 처리
        alert(response.error?.message || "장소 저장에 실패했습니다.");
      }
    } catch (error: any) {
      console.error("즐겨찾기 추가 실패:", error);

      // 409 Conflict 에러 체크
      if (error?.response?.status === 409 || error?.response?.data?.error?.code === "RESOURCE_CONFLICT") {
        // 이미 해당 카테고리에 장소가 등록된 경우
        alert(`이미 ${titleText}이(가) 등록되어 있습니다.`);

        // 초기 화면으로 복귀
        setIsConfirmOpen(false);
        setPendingPlace(null);
        setShowResults(false);
        setSearchQuery("");
        setSheetHeight(34);

        // 저장된 장소 목록 다시 로드하여 동기화
        loadSavedPlaces();

        // 다른 컴포넌트에도 알림
        window.dispatchEvent(new CustomEvent("savedPlaceUpdated", {
          detail: { category: targetType }
        }));
      } else {
        // 다른 에러
        const errorMessage =
          error?.response?.data?.error?.message || "서버 오류로 장소를 저장할 수 없습니다.";
        alert(errorMessage);
      }
    }
  };

  const handleCancelAdd = () => {
    setIsConfirmOpen(false);
    setPendingPlace(null);
  };

  // 드래그 시작
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setStartHeight(sheetHeight);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  // 드래그 중
  const handleDragMove = (clientY: number) => {
    if (!isDragging || !containerRef.current) return;

    const containerHeight = containerRef.current.clientHeight;
    const deltaY = startY - clientY;
    const deltaPercent = (deltaY / containerHeight) * 100;
    const newHeight = Math.max(30, Math.min(85, startHeight + deltaPercent));

    setSheetHeight(newHeight);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // 전역 이벤트 리스너
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      handleDragMove(e.touches[0].clientY);
    };

    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchmove", handleGlobalTouchMove);
    window.addEventListener("touchend", handleGlobalTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("touchend", handleGlobalTouchEnd);
    };
  }, [isDragging, startY, startHeight]);

  const titleText =
    targetType === "home"
      ? "집"
      : targetType === "school"
        ? "학교"
        : targetType === "work"
          ? "회사"
          : "HAD BETTER";

  const contextIconSrc =
    titleText === "집"
      ? imgWindow2
      : titleText === "학교"
        ? imgSaw1
        : titleText === "회사"
          ? imgCoinGold2
          : null;

  // 지도에 표시할 마커 생성
  const mapMarkers = useMemo(() => {
    const markers: Array<{
      id: string;
      coordinates: [number, number];
      name: string;
      address?: string;
      icon?: string;
    }> = [];

    // 등록된 장소 마커
    currentSavedPlaces.forEach((place) => {
      if (place.coordinates) {
        markers.push({
          id: `saved-${place.id}`,
          coordinates: [place.coordinates.lon, place.coordinates.lat],
          name: place.name,
          address: place.detail,
          icon: place.icon,
        });
      }
    });

    // 검색 결과 마커 (showResults가 true일 때만)
    if (showResults) {
      searchResults.forEach((place) => {
        if (place.coordinates) {
          markers.push({
            id: `search-${place.id}`,
            coordinates: [place.coordinates.lon, place.coordinates.lat],
            name: place.name,
            address: place.detail,
            icon: place.icon,
          });
        }
      });
    }

    return markers;
  }, [savedPlaces, searchResults, showResults]);

  // 첫 번째 마커 위치 (지도 중심 이동용)
  const targetLocation: [number, number] | null = useMemo(() => {
    if (mapMarkers.length > 0) {
      return mapMarkers[0].coordinates;
    }
    return null;
  }, [mapMarkers]);

  if (!isOpen) {
    return null;
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-50">
      {/* 헤더 */}
      <AppHeader
        onBack={onClose}
        title={titleText}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearch}
        currentPage="search"
        showSearchBar={true}
      />

      {/* 백그라운드 지도 - MapView 컴포넌트 사용 */}
      <div className="absolute inset-0 z-0">
        <MapView
          currentPage="search"
          targetLocation={targetLocation}
          markers={mapMarkers}
          onNavigate={onNavigate}
        />
      </div>

      {/* 바텀시트: 기본(등록된 장소 목록) / 검색 결과 - Glassmorphism 스타일 */}
      {targetType && (
        <div
          className="absolute bottom-0 left-0 right-0 rounded-tl-[24px] rounded-tr-[24px] transition-all z-10"
          style={{
            height: `${sheetHeight}%`,
            transitionDuration: isDragging ? "0ms" : "300ms",
            background: "linear-gradient(135deg, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.75) 100%)",
            border: "1px solid rgba(255,255,255,0.40)",
            boxShadow: "0 -4px 8px 0px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.30)",
            backdropFilter: "blur(18px) saturate(160%)",
            WebkitBackdropFilter: "blur(18px) saturate(160%)",
          }}
        >
          {/* 드래그 핸들 */}
          <div
            className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseUp={handleDragEnd}
            onTouchEnd={handleDragEnd}
          >
            <div className="bg-white/60 h-[6px] w-[48px] rounded-full" />
          </div>

          {/* 내용 */}
          <div className="px-5 pb-6 overflow-y-auto h-[calc(100%-40px)]">
            {!showResults ? (
              <>
                <p className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[12px] text-black mb-3">
                  등록된 {titleText} 장소
                </p>

                {isLoadingSaved ? (
                  <div className="text-center py-4">
                    <p className="css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] text-[11px] text-[rgba(0,0,0,0.35)]">
                      로딩 중...
                    </p>
                  </div>
                ) : savedPlaces.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {savedPlaces.map((saved) => (
                      <div
                        key={saved.id}
                        className="rounded-[18px] p-4 relative overflow-hidden"
                        style={{
                          background: "linear-gradient(135deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.50) 100%)",
                          border: "1px solid rgba(255,255,255,0.50)",
                          boxShadow: "0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.40)",
                          backdropFilter: "blur(16px) saturate(155%)",
                          WebkitBackdropFilter: "blur(16px) saturate(155%)",
                        }}
                      >
                        <div className="flex gap-3 items-center">
                          <div
                            className="size-[64px] rounded-[16px] flex items-center justify-center shrink-0"
                            style={{
                              background: "linear-gradient(135deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.50) 100%)",
                              border: "1px solid rgba(255,255,255,0.50)",
                              boxShadow: "0 8px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.40)",
                              backdropFilter: "blur(12px) saturate(150%)",
                              WebkitBackdropFilter: "blur(12px) saturate(150%)",
                            }}
                          >
                            {contextIconSrc ? (
                              <img
                                alt=""
                                className="size-[34px] object-contain pointer-events-none"
                                src={contextIconSrc}
                              />
                            ) : null}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] text-[12px] text-black truncate w-full">
                              {saved.name}
                            </p>
                            <p className="mt-1 css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium text-[11px] leading-[14px] text-black/60 truncate w-full">
                              {saved.detail?.trim() ? saved.detail : "상세 장소 정보 없음"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              if (!saved._savedPlaceId) return;
                              try {
                                await placeService.deleteSavedPlace(saved._savedPlaceId);
                                // 저장된 장소 목록 다시 로드
                                loadSavedPlaces();
                                // 부모 컴포넌트에 알림
                                onRemoveSavedPlace?.(saved.id);
                                // 이벤트 발생
                                window.dispatchEvent(new CustomEvent("savedPlaceUpdated"));
                              } catch (error) {
                                console.error("즐겨찾기 삭제 실패:", error);
                                alert("삭제에 실패했습니다.");
                              }
                            }}
                            className="flex-1 rounded-[14px] h-[40px] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            style={{
                              background: "linear-gradient(135deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.16) 100%)",
                              border: "1px solid rgba(255,255,255,0.55)",
                              boxShadow: "0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.22)",
                              backdropFilter: "blur(16px) saturate(155%)",
                              WebkitBackdropFilter: "blur(16px) saturate(155%)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.24) 100%)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.16) 100%)";
                            }}
                          >
                            <span className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[12px] text-black">
                              등록취소
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onRequestRoute?.(saved)}
                            disabled={!onRequestRoute}
                            className="flex-1 rounded-[14px] h-[40px] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            style={{
                              background: "linear-gradient(135deg, rgba(74,153,96,0.85) 0%, rgba(74,153,96,0.70) 100%)",
                              border: "1px solid rgba(255,255,255,0.35)",
                              boxShadow: "0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.22)",
                              backdropFilter: "blur(16px) saturate(155%)",
                              WebkitBackdropFilter: "blur(16px) saturate(155%)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "linear-gradient(135deg, rgba(61,127,80,0.90) 0%, rgba(61,127,80,0.75) 100%)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "linear-gradient(135deg, rgba(74,153,96,0.85) 0%, rgba(74,153,96,0.70) 100%)";
                            }}
                          >
                            <span className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[12px] text-white">
                              경로 안내
                            </span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    className="rounded-[18px] p-4 relative overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.50) 100%)",
                      border: "1px solid rgba(255,255,255,0.50)",
                      boxShadow: "0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.40)",
                      backdropFilter: "blur(16px) saturate(155%)",
                      WebkitBackdropFilter: "blur(16px) saturate(155%)",
                    }}
                  >
                    <p className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[14px] text-black">
                      아직 등록되지 않았어요
                    </p>
                    <p className="mt-1 css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium text-[12px] text-black/60">
                      위 검색창에 입력하면 검색 결과(카드 목록)가 나와요.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-4">
                {/* 로딩 상태 */}
                {isSearching && (
                  <div className="flex items-center justify-center py-6">
                    <div className="w-6 h-6 border-4 border-[#4a9960] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {/* 에러 상태 */}
                {searchError && !isSearching && (
                  <p className="css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] text-[12px] text-red-600">
                    {searchError}
                  </p>
                )}

                {/* 결과 리스트 */}
                {!isSearching &&
                  !searchError &&
                  searchResults.map((place) => (
                    <button
                      key={place.id}
                      onClick={() => handlePlaceClick(place)}
                      className="rounded-[18px] p-4 transition-all relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${place.color}CC 0%, ${place.color}AA 100%)`,
                        border: "1px solid rgba(255,255,255,0.36)",
                        boxShadow: "0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.24)",
                        backdropFilter: "blur(16px) saturate(155%)",
                        WebkitBackdropFilter: "blur(16px) saturate(155%)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.28)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.24)";
                      }}
                    >
                      <div className="flex gap-3 items-center">
                        {/* 아이콘 */}
                        <div
                          className="size-[64px] rounded-[16px] flex items-center justify-center shrink-0"
                          style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.20) 100%)",
                            border: "1px solid rgba(255,255,255,0.45)",
                            boxShadow: "0 8px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.30)",
                            backdropFilter: "blur(12px) saturate(150%)",
                            WebkitBackdropFilter: "blur(12px) saturate(150%)",
                          }}
                        >
                          <p className="text-[32px]">{place.icon}</p>
                        </div>

                        {/* 정보 */}
                        <div className="flex-1 flex flex-col gap-2 items-start">
                          <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] text-[12px] text-black">
                            {place.name}
                          </p>
                          <p className="css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] text-[11px] text-black/60 truncate w-full">
                            {place.detail || "상세 주소 정보 없음"}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}

                {!isSearching && !searchError && searchResults.length === 0 && (
                  <p className="css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] text-[12px] text-[rgba(0,0,0,0.35)]">
                    검색 결과가 없습니다.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 컨펌 모달: 장소 선택 후 확인/취소 */}
      {isConfirmOpen && pendingPlace && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          {/* dim */}
          <button
            aria-label="닫기"
            className="absolute inset-0 bg-black/30"
            onClick={handleCancelAdd}
          />

          <div
            className="relative w-[340px] rounded-[18px] px-5 py-4"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.14) 100%)",
              border: "1px solid rgba(255,255,255,0.38)",
              boxShadow: "0 18px 36px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.28)",
              backdropFilter: "blur(18px) saturate(160%)",
              WebkitBackdropFilter: "blur(18px) saturate(160%)",
            }}
          >
            <p className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[14px] text-black leading-[20px]">
              {titleText}에 이 장소를 추가하시겠습니까?
            </p>

            <div
              className="mt-3 rounded-[14px] px-4 py-3 flex items-center gap-3"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.10) 100%)",
                border: "1px solid rgba(255,255,255,0.32)",
                backdropFilter: "blur(12px) saturate(150%)",
                WebkitBackdropFilter: "blur(12px) saturate(150%)",
              }}
            >
              <div
                className="rounded-[12px] size-[44px] flex items-center justify-center shrink-0"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.20) 100%)",
                  border: "1px solid rgba(255,255,255,0.45)",
                  backdropFilter: "blur(8px) saturate(140%)",
                  WebkitBackdropFilter: "blur(8px) saturate(140%)",
                }}
              >
                {contextIconSrc ? (
                  <img
                    alt=""
                    className="size-[28px] object-contain pointer-events-none"
                    src={contextIconSrc}
                  />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[14px] leading-[18px] text-black truncate">
                  {pendingPlace.name}
                </p>
                <p className="css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium text-[11px] leading-[14px] text-black/60 truncate">
                  {pendingPlace.detail?.trim()
                    ? pendingPlace.detail
                    : `${pendingPlace.distance} · ${pendingPlace.time}`}
                </p>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={handleCancelAdd}
                className="flex-1 rounded-[14px] h-[44px] transition-all"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.16) 100%)",
                  border: "1px solid rgba(255,255,255,0.55)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.22)",
                  backdropFilter: "blur(16px) saturate(155%)",
                  WebkitBackdropFilter: "blur(16px) saturate(155%)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.24) 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.16) 100%)";
                }}
              >
                <span className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[13px] text-black">
                  취소
                </span>
              </button>
              <button
                onClick={handleConfirmAdd}
                className="flex-1 rounded-[14px] h-[44px] transition-all"
                style={{
                  background: "linear-gradient(135deg, rgba(74,153,96,0.85) 0%, rgba(74,153,96,0.70) 100%)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.22)",
                  backdropFilter: "blur(16px) saturate(155%)",
                  WebkitBackdropFilter: "blur(16px) saturate(155%)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(61,127,80,0.90) 0%, rgba(61,127,80,0.75) 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(135deg, rgba(74,153,96,0.85) 0%, rgba(74,153,96,0.70) 100%)";
                }}
              >
                <span className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[13px] text-white">
                  확인
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
