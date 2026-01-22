import { AppHeader } from "@/app/components/AppHeader";
import imgCoinGold2 from "@/assets/coin-gold.png";
import mapImage from "@/assets/map-image.png";
import imgSaw1 from "@/assets/saw.png";
import imgWindow2 from "@/assets/window.png";
import { useEffect, useRef, useState } from "react";

type PageType = "map" | "search" | "favorites" | "subway" | "route";

interface Place {
  id: string;
  name: string;
  detail?: string;
  distance: string;
  time: string;
  icon: string;
  color: string;
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

const mockPlaces: Place[] = [
  {
    id: "1",
    name: "CENTRAL PARK",
    detail: "5 Av To Central Park W, 59 St To 110 St",
    distance: "2.3 KM",
    time: "15 MIN",
    icon: "🏞️",
    color: "#c8f66f",
  },
  {
    id: "2",
    name: "PET SHOP",
    detail: "123 PET STREET, NEAR CITY HALL",
    distance: "1.5 KM",
    time: "8 MIN",
    icon: "🐾",
    color: "#00d9ff",
  },
  {
    id: "3",
    name: "VET CLINIC",
    detail: "24H ANIMAL HOSPITAL, BLDG 2F",
    distance: "1.6 KM",
    time: "10 MIN",
    icon: "🏥",
    color: "#ffffff",
  },
  {
    id: "4",
    name: "COFFEE HOUSE",
    detail: "CORNER OF MAIN ST & 7TH AVE",
    distance: "0.8 KM",
    time: "5 MIN",
    icon: "☕",
    color: "#ffd93d",
  },
  {
    id: "5",
    name: "GYM FITNESS",
    detail: "RIVERSIDE PLAZA, GATE B",
    distance: "3.2 KM",
    time: "20 MIN",
    icon: "💪",
    color: "#ff6b9d",
  },
];

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _onNavigate = onNavigate; // 향후 사용 예정

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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowResults(true);
      setSheetHeight(60);
    }
  };

  const handlePlaceClick = (place: Place) => {
    setPendingPlace(place);
    setIsConfirmOpen(true);
  };

  const handleConfirmAdd = () => {
    if (!pendingPlace) return;
    onSelectPlace(pendingPlace);
    setIsConfirmOpen(false);
    setPendingPlace(null);
    // 저장 후: 모달을 닫지 않고 "초기 화면"으로 돌아가서 하단에 등록된 장소가 보이게
    setShowResults(false);
    setSearchQuery("");
    setSheetHeight(34);
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

  if (!isOpen) return null;

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

      {/* 백그라운드 지도 */}
      <div className="absolute inset-0 z-0">
        <img
          src={mapImage}
          alt="지도"
          className="w-full h-full object-cover"
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

                {currentSavedPlaces.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {currentSavedPlaces.map((saved) => (
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
                            onClick={() => onRemoveSavedPlace?.(saved.id)}
                            disabled={!onRemoveSavedPlace}
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
                {mockPlaces.map((place) => (
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
                        <div className="flex gap-2">
                          <div
                            className="h-[24px] px-[12px] py-[6px] rounded-[8px] flex items-center justify-center"
                            style={{
                              background: "linear-gradient(135deg, rgba(255,217,61,0.75) 0%, rgba(255,217,61,0.60) 100%)",
                              border: "1px solid rgba(255,255,255,0.40)",
                              backdropFilter: "blur(8px) saturate(140%)",
                              WebkitBackdropFilter: "blur(8px) saturate(140%)",
                            }}
                          >
                            <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] text-[8px] text-black leading-[12px]">
                              {place.distance}
                            </p>
                          </div>
                          <div
                            className="h-[24px] px-[12px] py-[6px] rounded-[8px] flex items-center justify-center"
                            style={{
                              background: "linear-gradient(135deg, rgba(255,158,205,0.75) 0%, rgba(255,158,205,0.60) 100%)",
                              border: "1px solid rgba(255,255,255,0.40)",
                              backdropFilter: "blur(8px) saturate(140%)",
                              WebkitBackdropFilter: "blur(8px) saturate(140%)",
                            }}
                          >
                            <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] text-[8px] text-black leading-[12px]">
                              {place.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
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
