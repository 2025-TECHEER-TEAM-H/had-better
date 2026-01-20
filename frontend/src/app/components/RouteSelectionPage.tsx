import { useState, useRef, useEffect } from "react";
import mapImage from "@/assets/map-image.png";

type PageType = "map" | "search" | "favorites" | "subway" | "route" | "routeDetail";

interface RouteSelectionPageProps {
  onBack?: () => void;
  onNavigate?: (page: PageType) => void;
  isSubwayMode?: boolean;
}

type Player = "user" | "ghost1" | "ghost2";
type RouteId = 1 | 2 | 3;

interface RouteAssignments {
  user: RouteId | null;
  ghost1: RouteId | null;
  ghost2: RouteId | null;
}

const routes = [
  { id: 1 as RouteId, color: "#ff6b9d", name: "경로 1", time: "15분", distance: "2.3KM", lineColor: "#fb64b6" },
  { id: 2 as RouteId, color: "#ffc107", name: "경로 2", time: "18분", distance: "2.8KM", lineColor: "#ffc107" },
  { id: 3 as RouteId, color: "#6df3e3", name: "경로 3", time: "20분", distance: "3.1KM", lineColor: "#6df3e3" },
];

const playerLabels = {
  user: "유저",
  ghost1: "고스트1",
  ghost2: "고스트2",
};

export function RouteSelectionPage({ onBack, onNavigate, isSubwayMode }: RouteSelectionPageProps) {
  const [assignments, setAssignments] = useState<RouteAssignments>({
    user: null,
    ghost1: null,
    ghost2: null,
  });

  // 경로 상세 페이지 표시 상태
  const [showRouteDetail, setShowRouteDetail] = useState(false);

  // 바텀시트 드래그 상태
  const [sheetHeight, setSheetHeight] = useState(60); // 60%로 시작
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(60);
  const [isWebView, setIsWebView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 웹/앱 화면 감지
  useEffect(() => {
    const checkViewport = () => {
      setIsWebView(window.innerWidth > 768);
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // 체크박스 토글
  const toggleAssignment = (player: Player, routeId: RouteId) => {
    setAssignments((prev) => {
      const currentRoute = prev[player];
      
      // 이미 이 경로에 할당되어 있다면 해제
      if (currentRoute === routeId) {
        return { ...prev, [player]: null };
      }
      
      // 이미 다른 플레이어가 이 경로를 사용 중인지 확인
      const routeOccupied = Object.entries(prev).some(
        ([otherPlayer, otherRoute]) => otherPlayer !== player && otherRoute === routeId
      );
      
      // 경로가 이미 다른 플레이어에게 할당되어 있으면 선택 불가
      if (routeOccupied) {
        return prev;
      }
      
      // 아니면 새 경로에 할당
      return { ...prev, [player]: routeId };
    });
  };

  // 특정 경로에 특정 플레이어가 할당되어 있는지 확인
  const isAssigned = (player: Player, routeId: RouteId) => {
    return assignments[player] === routeId;
  };

  // 모든 플레이어가 경로에 할당되었는지 확인
  const allAssigned = assignments.user !== null && assignments.ghost1 !== null && assignments.ghost2 !== null;

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
    const newHeight = Math.max(30, Math.min(90, startHeight + deltaPercent));
    
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

  // 전역 이벤트 리스너 (드래그 중 마우스가 요소 밖으로 나갈 때)
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

  const handleStartNavigation = () => {
    if (allAssigned && onNavigate) {
      console.log("경로 시작:", assignments);
      onNavigate("routeDetail");
    }
  };

  // 경로 선택 컨텐츠
  const routeContent = (
    <div className="flex flex-col h-full">
      {/* 타이틀 카드 */}
      <div className="bg-[rgba(0,217,255,0.2)] h-[54px] rounded-[10px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center mb-4">
        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black">
          각 플레이어의 경로를 선택하세요
        </p>
      </div>

      {/* 경로 카드들 */}
      <div className="flex flex-col gap-4">
        {routes.map((route) => (
          <div
            key={route.id}
            className="rounded-[10px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] p-5"
            style={{ backgroundColor: route.color }}
          >
            <div className="flex gap-3 items-start">
              {/* 이모지 아이콘 */}
              <div className="bg-white size-[48px] border-[3px] border-black flex items-center justify-center shrink-0">
                <p className="text-[24px]">{route.id === 1 ? "1️⃣" : route.id === 2 ? "2️⃣" : "3️⃣"}</p>
              </div>

              {/* 경로 정보 */}
              <div className="flex-1 flex flex-col gap-2">
                {/* 경로 이름 */}
                <div className="flex gap-2 items-center">
                  <div
                    className="h-[2px] w-[12px] border-[0.673px] border-black"
                    style={{ backgroundColor: route.lineColor }}
                  />
                  <p
                    className={`font-['Wittgenstein',sans-serif] text-[12px] ${
                      route.id === 1 ? "text-white" : "text-black"
                    }`}
                  >
                    {route.name}
                  </p>
                </div>

                {/* 시간/거리 */}
                <div className="flex gap-1">
                  <div
                    className={`${
                      route.id === 1 ? "bg-[#ffd93d]" : "bg-white"
                    } h-[20px] px-[9px] py-[5px] border-[3px] border-black flex items-center justify-center`}
                  >
                    <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[9px]">
                      {route.time}
                    </p>
                  </div>
                  <div className="bg-white h-[20px] px-[9px] py-[5px] border-[3px] border-black flex items-center justify-center">
                    <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[9px]">
                      {route.distance}
                    </p>
                  </div>
                </div>

                {/* 체크박스들 */}
                <div className="flex gap-[8px] items-center">
                  {(Object.keys(playerLabels) as Player[]).map((player) => (
                    <label
                      key={player}
                      className="flex gap-1 items-center cursor-pointer"
                      onClick={() => toggleAssignment(player, route.id)}
                    >
                      <div className="size-[12px] border-[1.5px] border-black bg-white flex items-center justify-center">
                        {isAssigned(player, route.id) && (
                          <div className="size-[6px] bg-black" />
                        )}
                      </div>
                      <p
                        className={`font-['Wittgenstein',sans-serif] text-[12px] ${
                          route.id === 1 ? "text-white" : "text-black"
                        }`}
                      >
                        {playerLabels[player]}
                      </p>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 선택 현황 */}
      <div className="bg-white rounded-[10px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] p-5 mt-4 mb-8">
        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black mb-4">
          선택 현황 :
        </p>
        <div className="flex flex-col gap-3">
          {/* 유저 */}
          <div className="flex items-center gap-2">
            <p className="text-[20px]">🏃</p>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black">
              유저
            </p>
            <p className="text-[16px]">➡️</p>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black">
              경로 {assignments.user || "?"}
            </p>
          </div>

          {/* 고스트1 */}
          <div className="flex items-center gap-2">
            <p className="text-[20px]">👻</p>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black">
              고스트1
            </p>
            <p className="text-[16px]">➡️</p>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black">
              경로 {assignments.ghost1 || "?"}
            </p>
          </div>

          {/* 고스트2 */}
          <div className="flex items-center gap-2">
            <p className="text-[20px]">👻</p>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black">
              고스트2
            </p>
            <p className="text-[16px]">➡️</p>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black">
              경로 {assignments.ghost2 || "?"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // 지도 컨텐츠
  const mapContent = (
    <img 
      src={mapImage} 
      alt="지도" 
      className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
    />
  );

  // 웹 뷰 (왼쪽 사이드바 + 오른쪽 지도)
  if (isWebView) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* 왼쪽 사이드바 (400px 고정) */}
        <div className="w-[400px] bg-white border-r-[3px] border-black flex flex-col h-full overflow-hidden">
          {/* 헤더 */}
          <div className="relative px-8 pt-6 pb-4 border-b-[3px] border-black bg-[#80cee1]">
            <button
              onClick={onBack}
              className="absolute top-6 right-8 bg-white rounded-[14px] w-[40px] h-[40px] flex items-center justify-center border-[3px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-50 active:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-[2px] transition-all z-10"
            >
              <p className="font-['Wittgenstein',sans-serif] leading-[24px] text-[12px] text-black text-center">←</p>
            </button>
            <p className="font-['Wittgenstein',sans-serif] leading-[30px] text-[12px] text-black text-center">
              경로 선택
            </p>
          </div>

          {/* 스크롤 가능한 컨텐츠 영역 */}
          <div className="flex-1 overflow-auto px-5 py-5">
            {routeContent}
          </div>

          {/* 하단 고정 버튼 */}
          <div className="p-5 bg-white border-t-[3px] border-black">
            <button
              onClick={handleStartNavigation}
              disabled={!allAssigned}
              className={`w-full h-[60px] rounded-[10px] border-[3px] border-black transition-all ${
                allAssigned
                  ? "bg-[#48d448] hover:bg-[#3db83d] cursor-pointer shadow-[0px_4px_0px_0px_#2d8b2d] active:shadow-[0px_2px_0px_0px_#2d8b2d] active:translate-y-[2px]"
                  : "bg-[#99a1af] cursor-not-allowed"
              }`}
            >
              <p
                className={`font-['Wittgenstein',sans-serif] text-[12px] ${
                  allAssigned ? "text-white" : "text-[#4a5565]"
                }`}
              >
                이동 시작! 🏁
              </p>
            </button>
          </div>
        </div>

        {/* 오른쪽 지도 영역 */}
        <div className="flex-1 relative">
          {mapContent}
        </div>
      </div>
    );
  }

  // 모바일 뷰 (전체 화면 + 하단 슬라이드 시트)
  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50"
    >
      {/* 백그라운드 지도 */}
      <div className="absolute inset-0">
        {mapContent}
      </div>

      {/* 바텀시트 */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white border-black border-l-[3px] border-r-[3px] border-t-[3px] rounded-tl-[24px] rounded-tr-[24px] shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] transition-all"
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

        {/* 컨텐츠 영역 */}
        <div className="px-5 overflow-y-auto" style={{ height: 'calc(100% - 120px)', paddingBottom: '120px' }}>
          {routeContent}
        </div>

        {/* 하단 고정 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-white">
          <button
            onClick={handleStartNavigation}
            disabled={!allAssigned}
            className={`w-full h-[60px] rounded-[10px] border-[3px] border-black transition-all ${
              allAssigned
                ? "bg-[#48d448] hover:bg-[#3db83d] cursor-pointer shadow-[0px_4px_0px_0px_#2d8b2d] active:shadow-[0px_2px_0px_0px_#2d8b2d] active:translate-y-[2px]"
                : "bg-[#99a1af] cursor-not-allowed"
            }`}
          >
            <p
              className={`font-['Wittgenstein',sans-serif] text-[12px] ${
                allAssigned ? "text-white" : "text-[#4a5565]"
              }`}
            >
              이동 시작! 🏁
            </p>
          </button>
        </div>
      </div>

      {/* 닫기 버튼 (오른쪽 상단) */}
      <button
        onClick={onBack}
        className="absolute top-5 right-5 bg-white rounded-[14px] size-[40px] flex items-center justify-center border-[3px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-50 active:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-[2px] transition-all pointer-events-auto z-10"
      >
        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black">←</p>
      </button>
    </div>
  );
}