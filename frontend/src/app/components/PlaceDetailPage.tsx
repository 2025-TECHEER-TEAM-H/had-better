import { useState, useEffect, useRef } from "react";
import imgHudHeartEmpty1 from "@/assets/hud-heart-empty.png";
import { MapView } from "./MapView";

interface PlaceDetailPageProps {
  isOpen: boolean;
  onClose: () => void;
  place: {
    id: string;
    name: string;
    address: string;
    distance: string;
    icon: string;
    isFavorited?: boolean;
    coordinates?: { lon: number; lat: number };
  } | null;
  onToggleFavorite?: (placeId: string) => void;
  onStartNavigation?: () => void;
  onSearchSubmit?: (query: string) => void;
  onNavigate?: (page: 'map' | 'search' | 'favorites' | 'subway' | 'route') => void;
  onOpenDashboard?: () => void;
  onOpenSubway?: () => void;
}

export function PlaceDetailPage({
  isOpen,
  onClose,
  place,
  onToggleFavorite,
  onStartNavigation,
  onSearchSubmit,
  onNavigate,
  onOpenDashboard,
  onOpenSubway,
}: PlaceDetailPageProps) {
  const [sheetHeight, setSheetHeight] = useState(35); // 초기 높이 35%
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(35);
  const [isWebView, setIsWebView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  // 드래그 시작
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setStartHeight(sheetHeight);
  };

  // 드래그 중
  const handleDragMove = (clientY: number) => {
    if (!isDragging || !containerRef.current) return;
    
    const deltaY = startY - clientY;
    const containerHeight = containerRef.current.offsetHeight;
    const deltaPercent = (deltaY / containerHeight) * 100;
    const newHeight = Math.min(Math.max(startHeight + deltaPercent, 35), 85);
    
    setSheetHeight(newHeight);
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setIsDragging(false);
    
    // 스냅 포인트: 35%, 60%, 85%
    if (sheetHeight < 47.5) {
      setSheetHeight(35);
    } else if (sheetHeight < 72.5) {
      setSheetHeight(60);
    } else {
      setSheetHeight(85);
    }
  };

  // 마우스 이벤트
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // 터치 이벤트
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // 전역 마우스/터치 이벤트 리스너
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleDragMove(e.clientY);
      };
      
      const handleGlobalMouseUp = () => {
        handleDragEnd();
      };

      const handleGlobalTouchMove = (e: TouchEvent) => {
        handleDragMove(e.touches[0].clientY);
      };

      const handleGlobalTouchEnd = () => {
        handleDragEnd();
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalTouchMove);
      window.addEventListener('touchend', handleGlobalTouchEnd);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('touchmove', handleGlobalTouchMove);
        window.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [isDragging, startY, startHeight]);

  if (!isOpen || !place) return null;

  // 장소 정보 컨텐츠 (모바일과 웹에서 공통으로 사용)
  const placeInfoContent = (
    <div className="flex flex-col gap-[16px] h-full">
      {/* 장소 정보 카드 */}
      <div className="content-stretch flex gap-[16px] h-[80px] items-center relative shrink-0 w-full">
        {/* 아이콘 */}
        <div className="bg-white relative rounded-[10px] shrink-0 size-[80px]">
          <div className="absolute border-[3px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
          <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center p-[3px] relative size-full">
            <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[72px] text-[#0a0a0a] text-[48px] tracking-[0.3516px]">
              {place.icon}
            </p>
          </div>
        </div>

        {/* 장소 정보 */}
        <div className="flex-1 shrink-0">
          <p className="css-ew64yg font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[18px] text-[12px] text-black mb-2">
            {place.name}
          </p>
          <div className="flex gap-[7.995px] items-start text-[#99a1af] text-[10px]">
            <p className="css-4hzbpn font-['Wittgenstein:Medium',sans-serif] font-medium leading-[12px]">
              {place.distance}
            </p>
            <p className="css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[12px] flex-1">
              {place.address}
            </p>
          </div>
        </div>

        {/* 즐겨찾기 버튼 */}
        <button
          onClick={() => onToggleFavorite?.(place.id)}
          className="bg-white relative rounded-[14px] shrink-0 size-[48px]"
        >
          <div className="absolute border-[3px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[4px_4px_0px_0px_black]" />
          <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center p-[3px] relative size-full">
            <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[48px] text-[#0a0a0a] text-[32px] tracking-[0.4063px]">
              {place.isFavorited ? "⭐" : "☆"}
            </p>
          </div>
        </button>
      </div>

      {/* 경로 안내 시작 버튼 */}
      <button
        onClick={() => onNavigate?.('route')}
        className="bg-[#ff6b9d] h-[55.995px] relative rounded-[10px] shrink-0 w-full"
      >
        <div className="absolute border-[3px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[6px_6px_0px_0px_black]" />
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[18px] left-[50%] text-[12px] text-center text-white top-[50%] translate-x-[-50%] translate-y-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
          경로 안내 시작! 🏁
        </p>
      </button>
    </div>
  );

  // 지도 좌표 및 마커 설정
  const targetLocation: [number, number] | null = place?.coordinates
    ? [place.coordinates.lon, place.coordinates.lat]
    : null;

  const markers = place?.coordinates
    ? [
        {
          id: place.id,
          coordinates: [place.coordinates.lon, place.coordinates.lat] as [number, number],
          name: place.name,
          icon: place.icon,
        },
      ]
    : [];

  // 지도 컨텐츠 (모바일과 웹에서 공통으로 사용)
  const mapContent = (
    <MapView
      currentPage="search"
      targetLocation={targetLocation}
      markers={markers}
    />
  );

  // 웹 뷰 (왼쪽 사이드바 + 오른쪽 지도)
  if (isWebView) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* 왼쪽 사이드바 (400px 고정) */}
        <div className="w-[400px] bg-gradient-to-b from-[#c5e7f5] to-white border-r-[3px] border-black flex flex-col h-full overflow-hidden">
          {/* 헤더 영역 - Figma 스타일 */}
          <div className="relative bg-[#80cee1] h-[198px] border-b-[3px] border-black shrink-0">
            {/* 햄버거 메뉴 버튼 */}
            <button className="absolute bg-white left-[19px] top-[23px] rounded-[12px] size-[42px] border-[3px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]">
              <div className="absolute left-[6px] size-[24px] top-[6px]">
                <div className="h-[24px] overflow-clip relative shrink-0 w-full">
                  <div className="absolute contents inset-[20.83%_16.67%]">
                    <div className="absolute inset-[20.83%_16.67%_79.17%_16.67%]">
                      <div className="absolute inset-[-1px_-6.25%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
                          <path d="M1 1H17" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-1/2 left-[16.67%] right-[16.67%] top-1/2">
                      <div className="absolute inset-[-1px_-6.25%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
                          <path d="M1 1H17" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute inset-[79.17%_16.67%_20.83%_16.67%]">
                      <div className="absolute inset-[-1px_-6.25%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
                          <path d="M1 1H17" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* 타이틀 */}
            <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] h-[25.328px] leading-[30px] left-1/2 not-italic text-[16px] text-black text-center top-[32px] -translate-x-1/2">
              HAD BETTER
            </p>

            {/* 뒤로 가기 버튼 */}
            <button
              onClick={onClose}
              className="absolute bg-white right-[19px] top-[25px] rounded-[14px] w-[40px] h-[40px] flex items-center justify-center border-[3px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-50 active:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-[2px] transition-all z-10"
            >
              <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[24px] text-[16px] text-black text-center">←</p>
            </button>

            {/* 장소 이름 입력 필드 스타일 박스 */}
            <div className="absolute left-[26px] right-[31px] top-[75px]">
              <div className="bg-white h-[63px] relative rounded-[25px] w-full border-[3px] border-black flex items-center px-[18px] gap-[17px]">
                <div className="relative shrink-0 size-[30px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHudHeartEmpty1} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      onSearchSubmit?.(searchQuery);
                    }
                  }}
                  placeholder="목적지를 입력해주세요"
                  className="css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[30px] text-[13px] text-black flex-1 bg-transparent outline-none placeholder:text-gray-400"
                  style={{ fontVariationSettings: "'wght' 400" }}
                />
              </div>
            </div>

            {/* 네비게이션 버튼들 */}
            <div className="absolute bg-white content-stretch flex h-[42px] items-center justify-center left-0 top-[160px] w-full">
              <div aria-hidden="true" className="absolute border-[3px] border-black border-solid inset-0 pointer-events-none" />
              <div className="content-stretch flex gap-[25px] items-center px-[25px] py-0 relative shrink-0 w-[351px]">
                {/* 지도 버튼 - PlaceDetailPage를 닫고 지도 페이지로 이동 */}
                <button
                  onClick={() => {
                    onClose();
                    onNavigate?.('map');
                  }}
                  className="bg-[rgba(255,255,255,0)] content-stretch flex h-[43px] items-center justify-center px-[10px] py-[5px] relative rounded-[40px] shrink-0 w-[57px]"
                >
                  <p className="css-ew64yg font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-black text-center">지도</p>
                </button>
                
                {/* 검색 버튼 - PlaceDetailPage를 닫고 검색 페이지로 이동 */}
                <button
                  onClick={() => {
                    onClose();
                    onNavigate?.('search');
                  }}
                  className="bg-[rgba(255,255,255,0)] content-stretch flex h-[43px] items-center justify-center px-[10px] py-[5px] relative rounded-[40px] shrink-0 w-[56px]"
                >
                  <p className="css-ew64yg font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-black text-center">검색</p>
                </button>
                
                {/* 지하철 버튼 - PlaceDetailPage를 닫고 지하철 노선도 오버레이 열기 */}
                <button
                  onClick={() => {
                    onClose();
                    onNavigate?.('subway');
                  }}
                  className="bg-[rgba(255,255,255,0)] content-stretch flex h-[43px] items-center justify-center px-[10px] py-[5px] relative rounded-[40px] shrink-0 w-[57px]"
                >
                  <p className="css-ew64yg font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-black text-center">지하철</p>
                </button>
                
                {/* MY 버튼 - PlaceDetailPage를 닫고 대시보드 팝업 열기 */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenDashboard?.();
                  }}
                  className="bg-[rgba(255,255,255,0)] content-stretch flex h-[43px] items-center justify-center px-[10px] py-[5px] relative rounded-[40px] shrink-0 w-[56px]"
                >
                  <p className="css-ew64yg font-['Wittgenstein:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-black text-center">MY</p>
                </button>
              </div>
            </div>
          </div>

          {/* 장소 상세 정보 컨테이너 */}
          <div className="flex-1 overflow-auto px-[20px] py-6">
            <div className="flex flex-col gap-[16px]">
              {/* 장소 정보 카드 */}
              <div className="bg-white rounded-[12px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] p-5">
                <div className="flex flex-col gap-3">
                  {/* 거리 정보 */}
                  <div className="flex items-center gap-2">
                    <p className="font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[14px] text-black">거리:</p>
                    <div className="bg-[rgba(0,217,255,0.2)] border-[3px] border-[#00d9ff] rounded-[4px] inline-flex items-center px-[9px] py-[5px]">
                      <p className="font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[8px] text-[#00d9ff] leading-[9px]">
                        {place.distance}
                      </p>
                    </div>
                  </div>

                  {/* 주소 */}
                  <div className="flex flex-col gap-1">
                    <p className="font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[14px] text-black">주소:</p>
                    <p className="font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#6b9080] leading-[16px]">
                      {place.address}
                    </p>
                  </div>

                  {/* 즐겨찾기 버튼 */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <p className="font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[14px] text-black">즐겨찾기</p>
                    <button
                      onClick={() => onToggleFavorite?.(place.id)}
                      className="bg-white relative rounded-[14px] shrink-0 size-[48px]"
                    >
                      <div className="absolute border-[3px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[4px_4px_0px_0px_black]" />
                      <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center p-[3px] relative size-full">
                        <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[48px] text-[#0a0a0a] text-[32px] tracking-[0.4063px]">
                          {place.isFavorited ? "⭐" : "☆"}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 경로 안내 시작 버튼 */}
          <div className="px-[20px] pb-6 pt-4 border-t-[3px] border-black bg-white">
            <button
              onClick={() => onNavigate?.('route')}
              className="bg-[#ff6b9d] h-[55.995px] relative rounded-[10px] w-full"
            >
              <div className="absolute border-[3px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[6px_6px_0px_0px_black]" />
              <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[18px] left-[50%] text-[12px] text-center text-white top-[50%] translate-x-[-50%] translate-y-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
                경로 안내 시작! 🏁
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
      style={{
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
    >
      {/* 지도 배경 */}
      <div className="absolute inset-0">
        {mapContent}

        {/* 뒤로 가기 버튼 */}
        <button
          onClick={onClose}
          className="absolute bg-white top-[20px] left-[20px] rounded-[14px] w-[40px] h-[40px] flex items-center justify-center z-10"
        >
          <div className="absolute border-[3px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]" />
          <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[24px] text-[16px] text-black text-center">←</p>
        </button>
      </div>

      {/* 슬라이드 가능한 하단 시트 */}
      <div 
        className="absolute left-0 right-0 bg-white border-black border-l-[3px] border-r-[3px] border-solid border-t-[3px] rounded-tl-[24px] rounded-tr-[24px] shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] transition-all"
        style={{
          bottom: 0,
          height: `${sheetHeight}%`,
          transitionDuration: isDragging ? '0ms' : '300ms',
        }}
      >
        {/* 드래그 핸들 */}
        <div 
          className="absolute top-[16px] left-[50%] translate-x-[-50%] bg-[#d1d5dc] h-[5.996px] w-[48px] rounded-full cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />

        {/* 컨텐츠 */}
        <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 right-0 overflow-auto px-[19.997px] py-0 top-[37.63px] bottom-0">
          {placeInfoContent}
        </div>
      </div>
    </div>
  );
}