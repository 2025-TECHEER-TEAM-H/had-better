import { useState, useRef, useEffect } from "react";
import svgPaths from "@/imports/svg-nlal9gfvdl";
import imgImage from "@/assets/image-placeholder.png";
import { ResultPopup } from "@/app/components/ResultPopup";

type PageType = "map" | "search" | "favorites" | "subway" | "route" | "routeDetail";

interface RouteDetailPageProps {
  onBack?: () => void;
  onNavigate?: (page: PageType) => void;
  onOpenDashboard?: () => void;
}

export function RouteDetailPage({ onBack, onNavigate, onOpenDashboard }: RouteDetailPageProps) {
  const [sheetHeight, setSheetHeight] = useState(50); // 초기 높이 50%
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isWebView, setIsWebView] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);

  // 웹/앱 화면 감지
  useEffect(() => {
    const checkViewport = () => {
      setIsWebView(window.innerWidth > 768);
    };
    
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

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
    <>
      <img 
        alt="지도" 
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" 
        src={imgImage} 
      />
      
      {/* SVG 경로 오버레이 */}
      <div className="absolute inset-0">
        {/* 핑크 경로 */}
        <svg className="absolute inset-0 w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 378.182 837.184">
          <path d={svgPaths.p27d24340} opacity="0.8" stroke="#FB64B6" strokeDasharray="15 10" strokeWidth="6" />
        </svg>
        
        {/* 주황 경로 */}
        <svg className="absolute inset-0 w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 378.182 837.184">
          <path d={svgPaths.p2b90eb80} opacity="0.8" stroke="#FFC107" strokeDasharray="15 10" strokeWidth="6" />
        </svg>
        
        {/* 하늘색 경로 */}
        <svg className="absolute inset-0 w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 378.182 837.184">
          <path d={svgPaths.p280e4600} opacity="0.7" stroke="#6DF3E3" strokeDasharray="15 10" strokeWidth="6" />
        </svg>
      </div>

      {/* 출발 마커 */}
      <div className="absolute left-[68px] top-[388px] bg-[#2b7fff] w-[27.992px] h-[35.997px] flex items-center justify-center border-[3px] border-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[18px]">출</p>
      </div>

      {/* 도착 마커 */}
      <div className="absolute left-[308px] top-[167.99px] bg-[#fb2c36] w-[27.992px] h-[35.997px] flex items-center justify-center border-[3px] border-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[18px]">도</p>
      </div>

      {/* 경로상 사용자 아이콘들 */}
      <div className="absolute left-[177.92px] top-[305.56px] w-[32.315px] h-[48px]">
        <p className="absolute text-[32px] leading-[48px] left-0 top-0">🏃</p>
        <div className="absolute bg-white left-[-2.18px] top-[40.31px] w-[36.681px] h-[11.687px] rounded-[4px] border-[3px] border-black flex items-center justify-center px-[9.341px] py-[1.346px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[9px]">YOU</p>
        </div>
      </div>

      <div className="absolute left-[169.93px] top-[294.56px] w-[28.276px] h-[42.004px]">
        <p className="absolute text-[28px] leading-[42px] left-0 top-0">👻</p>
        <div className="absolute bg-white left-[-1.2px] top-[34.31px] w-[30.685px] h-[11.687px] rounded-[4px] border-[3px] border-black flex items-center justify-center px-[9.341px] py-[1.346px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[9px]">G1</p>
        </div>
      </div>

      <div className="absolute left-[172.31px] top-[304.55px] w-[28.276px] h-[42.004px]">
        <p className="absolute text-[28px] leading-[42px] left-0 top-0">👻</p>
        <div className="absolute bg-white left-[-1.2px] top-[34.31px] w-[30.685px] h-[11.687px] rounded-[4px] border-[3px] border-black flex items-center justify-center px-[9.341px] py-[1.346px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]">
          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[9px]">G2</p>
        </div>
      </div>
    </>
  );

  // 실시간 순위 카드
  const rankingCard = (
    <div className="bg-[#ffd93d] rounded-[12px] border-[3px] border-black shadow-[6px_6px_0px_0px_black] px-[19.366px] pt-[19.366px] pb-[3.366px]">
      <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black text-center leading-[18px] mb-[12px]">
        실시간 순위 🏆
      </p>

      {/* 순위 목록 */}
      <div className="flex flex-col gap-[7.995px]">
        {/* 1위 */}
        <div className="flex gap-[7.995px] items-center">
          <div className="bg-white w-[45px] h-[26px] border-[3px] border-black flex items-center justify-center">
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">1위</p>
          </div>
          <p className="text-[20px] leading-[28px]">🏃</p>
          <div className="flex-1 bg-white h-[18px] rounded-[4px] border-[3px] border-black overflow-hidden">
            <div className="bg-[#ff6b9d] h-full" style={{ width: "46%" }} />
          </div>
          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">46%</p>
        </div>

        {/* 2위 */}
        <div className="flex gap-[7.995px] items-center">
          <div className="bg-white w-[45px] h-[26px] border-[3px] border-black flex items-center justify-center">
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">2위</p>
          </div>
          <p className="text-[20px] leading-[28px]">👻</p>
          <div className="flex-1 bg-white h-[18px] rounded-[4px] border-[3px] border-black overflow-hidden">
            <div className="bg-[#ffc107] h-full" style={{ width: "42%" }} />
          </div>
          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">42%</p>
        </div>

        {/* 3위 */}
        <div className="flex gap-[7.995px] items-center">
          <div className="bg-white w-[45px] h-[26px] border-[3px] border-black flex items-center justify-center">
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">3위</p>
          </div>
          <p className="text-[20px] leading-[28px]">👻</p>
          <div className="flex-1 bg-white h-[18px] rounded-[4px] border-[3px] border-black overflow-hidden">
            <div className="bg-[#6df3e3] h-full" style={{ width: "42%" }} />
          </div>
          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">42%</p>
        </div>
      </div>
    </div>
  );

  // 경로 카드들
  const routeCards = (
    <div className="flex flex-col gap-[16px]">
      {/* 경로 1 - 핑크 */}
      <div className="bg-gradient-to-b from-[#ff6b9d] to-[#ff9ac1] rounded-[10px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] p-[23.364px]">
        {/* 헤더 */}
        <div className="flex gap-[11.992px] items-center mb-[16px]">
          <div className="bg-white rounded-[10px] w-[48px] h-[48px] border-[3px] border-black flex items-center justify-center">
            <p className="text-[24px] leading-[36px]">🏃</p>
          </div>
          <div className="flex-1">
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[18px] mb-[3.997px]">
              내 경로 (경로 3)
            </p>
            <div className="flex gap-[3.997px]">
              <div className="bg-[#ffd93d] h-[24px] px-[12px] border-[3px] border-black flex items-center justify-center">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">20분</p>
              </div>
              <div className="bg-white h-[24px] px-[12px] border-[3px] border-black flex items-center justify-center">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">3.1KM</p>
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
            <div className="flex gap-[7.995px] items-start">
              <div className="bg-[#7ed321] w-[27.992px] h-[27.992px] rounded-[4px] border-[3px] border-black flex items-center justify-center shrink-0">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[15px]">1</p>
              </div>
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[14px] flex-1">
                공원을 통과하여 도보 이동
              </p>
            </div>
            <div className="flex gap-[7.995px] items-start">
              <div className="bg-[#7ed321] w-[27.992px] h-[27.992px] rounded-[4px] border-[3px] border-black flex items-center justify-center shrink-0">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[15px]">2</p>
              </div>
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[14px] flex-1">
                카페 거리 통과 (약 12분)
              </p>
            </div>
            <div className="flex gap-[7.995px] items-start">
              <div className="bg-[#7ed321] w-[27.992px] h-[27.992px] rounded-[4px] border-[3px] border-black flex items-center justify-center shrink-0">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[15px]">3</p>
              </div>
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[14px] flex-1">
                도착지까지 직진 후 완료
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 경로 2 - 주황 */}
      <div className="bg-gradient-to-b from-[#ffa726] to-[#ffb74d] rounded-[10px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] p-[23.364px]">
        {/* 헤더 */}
        <div className="flex gap-[11.992px] items-center mb-[16px]">
          <div className="bg-white rounded-[10px] w-[48px] h-[48px] border-[3px] border-black flex items-center justify-center">
            <p className="text-[24px] leading-[36px]">🏃</p>
          </div>
          <div className="flex-1">
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[18px] mb-[3.997px]">
              고스트1 경로
            </p>
            <div className="flex gap-[3.997px]">
              <div className="bg-[#ffd93d] h-[24px] px-[12px] border-[3px] border-black flex items-center justify-center">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">20분</p>
              </div>
              <div className="bg-white h-[24px] px-[12px] border-[3px] border-black flex items-center justify-center">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">3.1KM</p>
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
            <div className="flex gap-[7.995px] items-start">
              <div className="bg-[#7ed321] w-[27.992px] h-[27.992px] rounded-[4px] border-[3px] border-black flex items-center justify-center shrink-0">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[15px]">1</p>
              </div>
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[14px] flex-1">
                대로를 따라 빠르게 이동
              </p>
            </div>
            <div className="flex gap-[7.995px] items-start">
              <div className="bg-[#7ed321] w-[27.992px] h-[27.992px] rounded-[4px] border-[3px] border-black flex items-center justify-center shrink-0">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[15px]">2</p>
              </div>
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[14px] flex-1">
                사거리 우회전 (약 8분)
              </p>
            </div>
            <div className="flex gap-[7.995px] items-start">
              <div className="bg-[#7ed321] w-[27.992px] h-[27.992px] rounded-[4px] border-[3px] border-black flex items-center justify-center shrink-0">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[15px]">3</p>
              </div>
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[14px] flex-1">
                목적지 도착
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 경로 3 - 하늘색 */}
      <div className="bg-gradient-to-b from-[#4dd0e1] to-[#80deea] rounded-[10px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] p-[23.364px]">
        {/* 헤더 */}
        <div className="flex gap-[11.992px] items-center mb-[16px]">
          <div className="bg-white rounded-[10px] w-[48px] h-[48px] border-[3px] border-black flex items-center justify-center">
            <p className="text-[24px] leading-[36px]">🏃</p>
          </div>
          <div className="flex-1">
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[18px] mb-[3.997px]">
              고스트2 경로
            </p>
            <div className="flex gap-[3.997px]">
              <div className="bg-[#ffd93d] h-[24px] px-[12px] border-[3px] border-black flex items-center justify-center">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">25분</p>
              </div>
              <div className="bg-white h-[24px] px-[12px] border-[3px] border-black flex items-center justify-center">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">2.8KM</p>
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
            <div className="flex gap-[7.995px] items-start">
              <div className="bg-[#7ed321] w-[27.992px] h-[27.992px] rounded-[4px] border-[3px] border-black flex items-center justify-center shrink-0">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[15px]">1</p>
              </div>
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[14px] flex-1">
                주택가를 지나 조용히 이동
              </p>
            </div>
            <div className="flex gap-[7.995px] items-start">
              <div className="bg-[#7ed321] w-[27.992px] h-[27.992px] rounded-[4px] border-[3px] border-black flex items-center justify-center shrink-0">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[15px]">2</p>
              </div>
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[14px] flex-1">
                공원 옆 골목 통과 (약 15분)
              </p>
            </div>
            <div className="flex gap-[7.995px] items-start">
              <div className="bg-[#7ed321] w-[27.992px] h-[27.992px] rounded-[4px] border-[3px] border-black flex items-center justify-center shrink-0">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[15px]">3</p>
              </div>
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[14px] flex-1">
                최종 목적지 도착
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
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
              className="absolute top-6 right-8 bg-gradient-to-b from-[#00f2fe] to-[#4facfe] rounded-[16px] border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] px-[20px] py-[3px] hover:scale-105 transition-transform z-10"
            >
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[18px]">
                경주취소
              </p>
            </button>
            <p className="font-['Wittgenstein',sans-serif] leading-[30px] text-[12px] text-black text-center">
              경로 진행중
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

  // 모바일 뷰 (전체 화면 + 하단 슬라이드 시트)
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