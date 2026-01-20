import { useState, useRef, useEffect } from "react";
import { MapView } from "./MapView";
import { ResultPopup } from "@/app/components/ResultPopup";
import { useRouteStore, type Player, PLAYER_LABELS, PLAYER_ICONS } from "@/stores/routeStore";
import { getRouteLegDetail } from "@/services/routeService";
import { secondsToMinutes, metersToKilometers, MODE_ICONS } from "@/types/route";
import { ROUTE_COLORS } from "@/mocks/routeData";

type PageType = "map" | "search" | "favorites" | "subway" | "route" | "routeDetail";

interface RouteDetailPageProps {
  onBack?: () => void;
  onNavigate?: (page: PageType) => void;
  onOpenDashboard?: () => void;
}

export function RouteDetailPage({ onBack, onNavigate, onOpenDashboard }: RouteDetailPageProps) {
  // 경로 상태 스토어
  const {
    searchResponse,
    departure,
    arrival,
    assignments,
    legDetails,
    setLegDetail,
  } = useRouteStore();

  const [sheetHeight, setSheetHeight] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWebView, setIsWebView] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // 웹/앱 화면 감지
  useEffect(() => {
    const checkViewport = () => {
      setIsWebView(window.innerWidth > 768);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // 경로 상세 정보 로드
  useEffect(() => {
    const loadRouteDetails = async () => {
      if (assignments.size === 0) return;

      setIsLoadingDetails(true);

      try {
        // 모든 할당된 경로의 상세 정보 로드
        const promises: Promise<void>[] = [];

        for (const [, routeLegId] of assignments) {
          // 이미 캐시에 있으면 스킵
          if (legDetails.has(routeLegId)) continue;

          promises.push(
            getRouteLegDetail(routeLegId).then((detail) => {
              setLegDetail(routeLegId, detail);
            })
          );
        }

        await Promise.all(promises);
      } catch (error) {
        console.error("경로 상세 정보 로드 실패:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    loadRouteDetails();
  }, [assignments]);

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
    const newHeight = Math.max(35, Math.min(85, startHeight + deltaPercent));

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

  // 지도 컨텐츠
  const mapContent = (
    <MapView currentPage="route" />
  );

  // 플레이어별 경로 정보 가져오기
  const getPlayerRoute = (player: Player) => {
    const routeLegId = assignments.get(player);
    if (!routeLegId) return null;

    const legIndex = searchResponse?.legs.findIndex((leg) => leg.route_leg_id === routeLegId);
    const legSummary = searchResponse?.legs.find((leg) => leg.route_leg_id === routeLegId);
    const legDetail = legDetails.get(routeLegId);

    return {
      routeLegId,
      legIndex: legIndex ?? -1,
      summary: legSummary,
      detail: legDetail,
    };
  };

  // 플레이어 목록
  const players: Player[] = ["user", "bot1", "bot2"];

  // 실시간 순위 카드 (임시 - 나중에 SSE로 업데이트)
  const rankingCard = (
    <div className="bg-[#ffd93d] rounded-[12px] border-[3px] border-black shadow-[6px_6px_0px_0px_black] px-[19.366px] pt-[19.366px] pb-[3.366px]">
      <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black text-center leading-[18px] mb-[12px]">
        실시간 순위 🏆
      </p>

      {/* 순위 목록 */}
      <div className="flex flex-col gap-[7.995px]">
        {players.map((player, index) => {
          const route = getPlayerRoute(player);
          const colorScheme = route ? ROUTE_COLORS[route.legIndex % ROUTE_COLORS.length] : ROUTE_COLORS[0];
          const progress = 46 - index * 4; // 임시 진행률

          return (
            <div key={player} className="flex gap-[7.995px] items-center">
              <div className="bg-white w-[45px] h-[26px] border-[3px] border-black flex items-center justify-center">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">
                  {index + 1}위
                </p>
              </div>
              <p className="text-[20px] leading-[28px]">{PLAYER_ICONS[player]}</p>
              <div className="flex-1 bg-white h-[18px] rounded-[4px] border-[3px] border-black overflow-hidden">
                <div
                  className="h-full"
                  style={{ width: `${progress}%`, backgroundColor: colorScheme.bg }}
                />
              </div>
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">
                {progress}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );

  // 경로 카드 생성
  const renderRouteCard = (player: Player, index: number) => {
    const route = getPlayerRoute(player);
    if (!route || !route.summary) return null;

    const colorScheme = ROUTE_COLORS[route.legIndex % ROUTE_COLORS.length];
    const timeMinutes = secondsToMinutes(route.summary.totalTime);
    const distanceStr = metersToKilometers(route.summary.totalDistance);
    const isUser = player === "user";

    return (
      <div
        key={player}
        className={`bg-gradient-to-b ${colorScheme.gradient} rounded-[10px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] p-[23.364px]`}
      >
        {/* 헤더 */}
        <div className="flex gap-[11.992px] items-center mb-[16px]">
          <div className="bg-white rounded-[10px] w-[48px] h-[48px] border-[3px] border-black flex items-center justify-center">
            <p className="text-[24px] leading-[36px]">{PLAYER_ICONS[player]}</p>
          </div>
          <div className="flex-1">
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[18px] mb-[3.997px]">
              {isUser ? `내 경로 (경로 ${route.legIndex + 1})` : `${PLAYER_LABELS[player]} 경로`}
            </p>
            <div className="flex gap-[3.997px]">
              <div className="bg-[#ffd93d] h-[24px] px-[12px] border-[3px] border-black flex items-center justify-center">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">
                  {timeMinutes}분
                </p>
              </div>
              <div className="bg-white h-[24px] px-[12px] border-[3px] border-black flex items-center justify-center">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">
                  {distanceStr}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 이동 경로 */}
        <div>
          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[15px] mb-[8px]">
            이동 경로
          </p>
          <div className="flex flex-col gap-[12px]">
            {route.detail?.legs.map((leg, legIndex) => (
              <div key={legIndex} className="flex gap-[7.995px] items-start">
                <div className="bg-[#7ed321] w-[27.992px] h-[27.992px] rounded-[4px] border-[3px] border-black flex items-center justify-center shrink-0">
                  <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[15px]">
                    {legIndex + 1}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[14px]">
                    {MODE_ICONS[leg.mode] || "🚶"}{" "}
                    {leg.mode === "WALK"
                      ? `도보 이동 (${metersToKilometers(leg.distance)})`
                      : `${leg.route || leg.mode} (${secondsToMinutes(leg.sectionTime)}분)`}
                  </p>
                  <p className="font-['Wittgenstein',sans-serif] text-[10px] text-white/70 leading-[12px] mt-1">
                    {leg.start.name} → {leg.end.name}
                  </p>
                </div>
              </div>
            ))}
            {!route.detail && isLoadingDetails && (
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white/70">
                경로 정보 로딩 중...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 경로 카드들
  const routeCards = (
    <div className="flex flex-col gap-[16px]">
      {players.map((player, index) => renderRouteCard(player, index))}
    </div>
  );

  // 웹 뷰
  if (isWebView) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* 왼쪽 사이드바 */}
        <div className="w-[400px] bg-white border-r-[3px] border-black flex flex-col h-full overflow-hidden">
          {/* 헤더 */}
          <div className="relative px-8 pt-6 pb-4 border-b-[3px] border-black bg-[#80cee1]">
            <button
              onClick={onBack}
              className="absolute top-6 right-8 bg-gradient-to-b from-[#00f2fe] to-[#4facfe] rounded-[16px] border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] px-[20px] py-[3px] hover:scale-105 transition-transform z-10"
            >
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[18px]">
                경주취소
              </p>
            </button>
            <p className="font-['Wittgenstein',sans-serif] leading-[30px] text-[12px] text-black text-center">
              {departure?.name && arrival?.name
                ? `${departure.name} → ${arrival.name}`
                : "경로 진행중"}
            </p>
          </div>

          {/* 스크롤 가능한 컨텐츠 영역 */}
          <div className="flex-1 overflow-auto px-5 py-5">
            {/* 실시간 순위 */}
            <div className="mb-4">
              {rankingCard}
            </div>

            {/* 경로 카드들 */}
            {routeCards}
          </div>

          {/* 하단 고정 버튼 */}
          <div className="p-5 bg-white border-t-[3px] border-black">
            <button
              onClick={() => setShowResultPopup(true)}
              className="w-full bg-[#00d9ff] h-[60px] rounded-[16px] border-[3px] border-black shadow-[6px_6px_0px_0px_black] flex items-center justify-center gap-[7.995px] hover:scale-105 active:shadow-[4px_4px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all"
            >
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[21px]">
                도착 완료
              </p>
              <p className="text-[14px] text-white leading-[21px]">
                🚀
              </p>
            </button>
          </div>
        </div>

        {/* 오른쪽 지도 영역 */}
        <div className="flex-1 relative">
          {mapContent}
        </div>

        {/* 결과 팝업 */}
        <ResultPopup
          isOpen={showResultPopup}
          onClose={() => setShowResultPopup(false)}
          onNavigate={onNavigate}
          onOpenDashboard={onOpenDashboard}
        />
      </div>
    );
  }

  // 모바일 뷰
  return (
    <div ref={containerRef} className="relative size-full overflow-hidden bg-white">
      {/* 지도 배경 */}
      <div className="absolute inset-0">
        {mapContent}
      </div>

      {/* 경주취소 버튼 */}
      <button
        onClick={onBack}
        className="absolute right-[5.97%] top-[1.5%] bg-gradient-to-b from-[#00f2fe] to-[#4facfe] rounded-[16px] border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] px-[20px] py-[3px] hover:scale-105 transition-transform z-30"
      >
        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[18px]">
          경주취소
        </p>
      </button>

      {/* 실시간 순위 카드 - 슬라이드업 위 */}
      <div
        className="absolute left-[20.05px] right-[20.05px] z-20 transition-all"
        style={{
          bottom: `calc(${sheetHeight}% + 30px)`,
          transitionDuration: isDragging ? "0ms" : "300ms",
        }}
      >
        {rankingCard}
      </div>

      {/* 슬라이드업 - 경로 카드들 */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-tl-[24px] rounded-tr-[24px] border-l-[3px] border-r-[3px] border-t-[3px] border-black shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] transition-all z-10"
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
          <div className="bg-[#d1d5dc] h-[5.996px] w-[48px] rounded-full" />
        </div>

        {/* 경로 카드들 스크롤 영역 */}
        <div className="px-[23.86px] pb-[100px] overflow-y-auto h-[calc(100%-40px)]">
          {routeCards}
        </div>
      </div>

      {/* 도착 완료 버튼 - 하단 고정 */}
      <button
        onClick={() => {
          console.log("도착 완료 버튼 클릭됨");
          setShowResultPopup(true);
        }}
        className="fixed bottom-[24px] left-[24px] right-[24px] bg-[#00d9ff] h-[60px] rounded-[16px] border-[3px] border-black shadow-[6px_6px_0px_0px_black] flex items-center justify-center gap-[7.995px] hover:scale-105 active:shadow-[4px_4px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all z-50"
      >
        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[21px]">
          도착 완료
        </p>
        <p className="text-[14px] text-white leading-[21px]">
          🚀
        </p>
      </button>

      {/* 결과 팝업 */}
      <ResultPopup
        isOpen={showResultPopup}
        onClose={() => setShowResultPopup(false)}
        onNavigate={onNavigate}
        onOpenDashboard={onOpenDashboard}
      />
    </div>
  );
}
