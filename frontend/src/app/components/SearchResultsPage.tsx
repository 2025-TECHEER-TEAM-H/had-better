import { useState, useEffect, useRef } from "react";
import imgImage from "@/assets/image-placeholder.png";

interface SearchResult {
  id: string;
  name: string;
  icon: string;
  distance: string;
  status: string;
  backgroundColor: string;
  isFavorited?: boolean;
}

interface SearchResultsPageProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onPlaceClick?: (result: SearchResult) => void;
  onToggleFavorite?: (placeId: string) => void;
}

export function SearchResultsPage({
  isOpen,
  onClose,
  searchQuery,
  onPlaceClick,
  onToggleFavorite,
}: SearchResultsPageProps) {
  const [sheetHeight, setSheetHeight] = useState(60); // 초기 높이 60%
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(60);
  const [isWebView, setIsWebView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 검색 결과 상태 관리 (즐겨찾기 토글을 위해)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([
    {
      id: '1',
      name: 'CENTRAL PARK',
      icon: '🏞️',
      distance: '',
      status: '',
      backgroundColor: '#7ed321',
      isFavorited: true,
    },
    {
      id: '2',
      name: 'PET SHOP',
      icon: '🏪',
      distance: '',
      status: '',
      backgroundColor: '#00d9ff',
      isFavorited: true,
    },
    {
      id: '3',
      name: 'VET CLINIC',
      icon: '🏥',
      distance: '',
      status: '',
      backgroundColor: 'white',
      isFavorited: true,
    },
  ]);

  // 즐겨찾기 토글 핸들러
  const handleToggleFavorite = (placeId: string) => {
    setSearchResults((prev) =>
      prev.map((result) =>
        result.id === placeId
          ? { ...result, isFavorited: !result.isFavorited }
          : result
      )
    );
    onToggleFavorite?.(placeId);
  };

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

  if (!isOpen) return null;

  // 검색 결과 카드 컴포넌트
  const ResultCard = ({ result }: { result: SearchResult }) => (
    <div
      onClick={() => onPlaceClick?.(result)}
      className="h-[110.665px] relative rounded-[10px] shrink-0 w-full cursor-pointer"
      style={{ backgroundColor: result.backgroundColor }}
    >
      <div aria-hidden="true" className="absolute border-[3.338px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex gap-[11.996px] items-start pb-[3.338px] pt-[23.335px] px-[23.335px] relative size-full">
        {/* 아이콘 */}
        <div className="bg-white relative shrink-0 size-[63.996px]">
          <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
          <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center pl-[1.335px] pr-[1.345px] py-[1.335px] relative size-full">
            <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[45px] text-[#0a0a0a] text-[30px] text-center tracking-[0.3955px]">
              {result.icon}
            </p>
          </div>
        </div>

        {/* 장소 이름 */}
        <div className="flex-[1_0_0] min-h-px min-w-px relative">
          <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex flex-col items-start relative w-full">
            <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] text-[10px] text-black text-left">
              {result.name}
            </p>
          </div>
        </div>

        {/* 즐겨찾기 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFavorite(result.id);
          }}
          className="bg-white relative rounded-[14px] shrink-0 size-[48px]"
        >
          <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[4px_4px_0px_0px_black]" />
          <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center p-[2.693px] relative size-full">
            <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[48px] text-[#0a0a0a] text-[32px] tracking-[0.4063px]">
              {result.isFavorited ? "⭐" : "☆"}
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  // 검색 결과 리스트 컨텐츠
  const resultsContent = (
    <div className="flex flex-col gap-[11.996px] w-full">
      {searchResults.map((result) => (
        <ResultCard key={result.id} result={result} />
      ))}
    </div>
  );

  // 지도 컨텐츠
  const mapContent = (
    <>
      <img 
        alt="Map" 
        className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" 
        src={imgImage} 
      />
    </>
  );

  // 웹 뷰 (왼쪽 사이드바 + 오른쪽 지도)
  if (isWebView) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* 왼쪽 사이드바 (400px 고정) */}
        <div className="w-[400px] bg-white border-r-[3.366px] border-black flex flex-col h-full overflow-hidden">
          {/* 헤더 */}
          <div className="relative px-8 pt-6 pb-4 border-b-[3.366px] border-black bg-[#80cee1]">
            <button
              onClick={onClose}
              className="absolute top-6 right-8 bg-white rounded-[14px] w-[40px] h-[40px] flex items-center justify-center border-[2.693px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-50 active:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-[2px] transition-all z-10"
            >
              <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[24px] text-[16px] text-black text-center">←</p>
            </button>
            <p className="css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] leading-[30px] text-[16px] text-black text-center">
              검색 결과
            </p>
            {searchQuery && (
              <p className="css-4hzbpn font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[20px] text-[12px] text-black text-center mt-2">
                "{searchQuery}"
              </p>
            )}
          </div>

          {/* 검색 결과 리스트 */}
          <div className="flex-1 overflow-auto px-[23.335px] py-6">
            {resultsContent}
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
          <div className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]" />
          <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[24px] text-[16px] text-black text-center">←</p>
        </button>
      </div>

      {/* 슬라이드 가능한 하단 시트 */}
      <div 
        className="absolute left-0 right-0 bg-white border-black border-l-[3.366px] border-r-[3.366px] border-solid border-t-[3.366px] rounded-tl-[24px] rounded-tr-[24px] shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] transition-all"
        style={{
          bottom: 0,
          height: `${sheetHeight}%`,
          transitionDuration: isDragging ? '0ms' : '300ms',
        }}
      >
        {/* 드래그 핸들 */}
        <div 
          className="absolute top-[16px] left-[50%] translate-x-[-50%] bg-[#d1d5dc] h-[5.996px] w-[48px] rounded-full cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
        />

        {/* 컨텐츠 */}
        <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 right-0 overflow-auto px-[23.335px] py-0 top-[37.63px] bottom-0">
          {resultsContent}
        </div>
      </div>
    </div>
  );
}