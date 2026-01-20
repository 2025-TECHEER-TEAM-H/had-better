import { useState, useRef, useEffect } from "react";
import mapImage from "@/assets/map-image.png";
import { AppHeader } from "@/app/components/AppHeader";

interface Place {
  id: string;
  name: string;
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
  onNavigate: (page: "map" | "search" | "subway" | "my") => void;
  onOpenDashboard: () => void;
}

const mockPlaces: Place[] = [
  {
    id: "1",
    name: "CENTRAL PARK",
    distance: "2.3 KM",
    time: "15 MIN",
    icon: "🏞️",
    color: "#c8f66f",
  },
  {
    id: "2",
    name: "PET SHOP",
    distance: "1.5 KM",
    time: "8 MIN",
    icon: "🐾",
    color: "#00d9ff",
  },
  {
    id: "3",
    name: "VET CLINIC",
    distance: "1.6 KM",
    time: "10 MIN",
    icon: "🏥",
    color: "#ffffff",
  },
  {
    id: "4",
    name: "COFFEE HOUSE",
    distance: "0.8 KM",
    time: "5 MIN",
    icon: "☕",
    color: "#ffd93d",
  },
  {
    id: "5",
    name: "GYM FITNESS",
    distance: "3.2 KM",
    time: "20 MIN",
    icon: "💪",
    color: "#ff6b9d",
  },
];

export function PlaceSearchModal({ isOpen, onClose, onSelectPlace, targetType, onNavigate, onOpenDashboard }: PlaceSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(60);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(60);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setShowResults(true);
    }
  };

  const handlePlaceClick = (place: Place) => {
    onSelectPlace(place);
    onClose();
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

  const getTargetLabel = () => {
    if (targetType === "home") return "집";
    if (targetType === "school") return "학교";
    if (targetType === "work") return "회사";
    return "";
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-50">
      {/* 헤더 */}
      <AppHeader
        onBack={onClose}
        onNavigate={onNavigate} // 장소 검색 모달에서는 네비게이션 비활성화
        onOpenDashboard={onOpenDashboard} // 대시보드 비활성화
        onMenuClick={() => {}} // 메뉴 비활성화
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

      {/* 바텀시트 - 검색 결과 */}
      {showResults && (
        <div
          className="absolute bottom-0 left-0 right-0 bg-white border-black border-l-[3.366px] border-r-[3.366px] border-t-[3.366px] rounded-tl-[24px] rounded-tr-[24px] shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] transition-all"
          style={{
            height: `${sheetHeight}%`,
            transitionDuration: isDragging ? "0ms" : "300ms",
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
            <div className="bg-[#d1d5dc] h-[6px] w-[48px] rounded-full" />
          </div>

          {/* 결과 목록 */}
          <div className="px-5 pb-6 overflow-y-auto h-[calc(100%-40px)]">
            <div className="flex flex-col gap-4">
              {mockPlaces.map((place) => (
                <button
                  key={place.id}
                  onClick={() => handlePlaceClick(place)}
                  className="rounded-[10px] border-[3.366px] border-black shadow-[4px_4px_0px_0px_black] p-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_black] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                  style={{ backgroundColor: place.color }}
                >
                  <div className="flex gap-3 items-center">
                    {/* 아이콘 */}
                    <div className="bg-white size-[64px] border-[1.346px] border-black flex items-center justify-center shrink-0">
                      <p className="text-[32px]">{place.icon}</p>
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 flex flex-col gap-2 items-start">
                      <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] text-[12px] text-black">
                        {place.name}
                      </p>
                      <div className="flex gap-2">
                        <div className="bg-[#ffd93d] h-[24px] px-[12px] py-[6px] border-[1.346px] border-black flex items-center justify-center">
                          <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] text-[8px] text-black leading-[12px]">
                            {place.distance}
                          </p>
                        </div>
                        <div className="bg-[#ff9ecd] h-[24px] px-[12px] py-[6px] border-[1.346px] border-black flex items-center justify-center">
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
          </div>
        </div>
      )}
    </div>
  );
}