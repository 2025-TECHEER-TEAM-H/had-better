import { useEffect, useRef, useState } from "react";

interface RouteSelectionPageProps {
  onNavigate: (page: string, params?: any) => void;
}

interface RouteSelection {
  user: number | null;
  ghost1: number | null;
  ghost2: number | null;
}

export function RouteSelectionPage({ onNavigate }: RouteSelectionPageProps) {
  const [selection, setSelection] = useState<RouteSelection>({
    user: null,
    ghost1: null,
    ghost2: null,
  });
  const [sheetPosition, setSheetPosition] = useState(60); // 60% 높이에서 시작
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startPositionRef = useRef(60);

  const handleRouteSelect = (routeNum: number, type: 'user' | 'ghost1' | 'ghost2') => {
    setSelection(prev => ({
      ...prev,
      [type]: prev[type] === routeNum ? null : routeNum,
    }));
  };

  const handleStartRace = () => {
    if (selection.user !== null && selection.ghost1 !== null && selection.ghost2 !== null) {
      onNavigate('route-detail', { routeSelection: selection });
    }
  };

  const canStartRace = selection.user !== null && selection.ghost1 !== null && selection.ghost2 !== null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startYRef.current = e.touches[0].clientY;
    startPositionRef.current = sheetPosition;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const deltaY = startYRef.current - e.touches[0].clientY;
    const windowHeight = window.innerHeight;
    const deltaPercent = (deltaY / windowHeight) * 100;

    const newPosition = Math.max(30, Math.min(90, startPositionRef.current + deltaPercent));
    setSheetPosition(newPosition);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // 스냅 포인트: 30% (작게), 60% (반), 90% (거의 전체)
    if (sheetPosition < 45) {
      setSheetPosition(30);
    } else if (sheetPosition < 75) {
      setSheetPosition(60);
    } else {
      setSheetPosition(90);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startPositionRef.current = sheetPosition;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaY = startYRef.current - e.clientY;
    const windowHeight = window.innerHeight;
    const deltaPercent = (deltaY / windowHeight) * 100;

    const newPosition = Math.max(30, Math.min(90, startPositionRef.current + deltaPercent));
    setSheetPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // 스냅 포인트
    if (sheetPosition < 45) {
      setSheetPosition(30);
    } else if (sheetPosition < 75) {
      setSheetPosition(60);
    } else {
      setSheetPosition(90);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, sheetPosition]);

  return (
    <>
      {/* 헤더 - 독립적인 absolute 요소 */}
      <div className="absolute bg-[#00d9ff] left-0 top-0 w-full border-b-[3.4px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] pointer-events-auto z-50" style={{ pointerEvents: 'auto', zIndex: 50 }}>
        <div className="flex items-center justify-between px-5 py-3">
          <p className="font-['Press_Start_2P'] text-[12px] text-black">9:41</p>
          <p className="font-['Press_Start_2P'] text-[12px] text-black">ROUTE SELECT</p>
          <div className="flex gap-1">
            <div className="bg-black size-[4px]" />
            <div className="bg-black size-[4px]" />
            <div className="bg-black size-[4px]" />
          </div>
        </div>
      </div>

      {/* 슬라이드 가능한 바텀 시트 - 독립적인 absolute 요소 */}
      <div
        className="absolute left-0 right-0 bg-yellow-400/50 rounded-t-[24px] border-t-[3.4px] border-l-[3.4px] border-r-[3.4px] border-black shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] pointer-events-auto transition-all flex flex-col z-50"
        style={{
          height: `${sheetPosition}%`,
          bottom: 0,
          transitionDuration: isDragging ? '0ms' : '300ms',
          pointerEvents: 'auto',
          zIndex: 50,
        }}
      >
        {/* 드래그 핸들 */}
        <div
          className="w-full py-4 cursor-grab active:cursor-grabbing flex justify-center flex-shrink-0"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* 경로 선택 콘텐츠 */}
        <div className="px-5 pb-[100px] overflow-y-auto flex-1 scrollbar-hide pointer-events-auto bg-yellow-400/50" style={{ minHeight: '100px', pointerEvents: 'auto', touchAction: 'pan-y' }}>
          <div className="flex flex-col gap-4">
            {/* 안내 텍스트 */}
            <div className="bg-[#00d9ff]/20 border-[3.4px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_black] p-4">
              <p className="font-['Press_Start_2P'] text-[10px] text-black leading-[15px] text-center">
                각 플레이어의 경로를 선택하세요
              </p>
            </div>

            {/* 경로 카드들 */}
            {/* 경로 1 - 핑크 */}
            <div className="bg-[#ff6b9d] rounded-[10px] border-[3.4px] border-black shadow-[4px_4px_0px_0px_black] p-4">
              <div className="flex items-start gap-3">
                <div className="bg-white border-[1.36px] border-black size-[48px] flex items-center justify-center flex-shrink-0">
                  <p className="text-[24px]">1️⃣</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-[2px] bg-[#FB64B6] border border-black" style={{ backgroundImage: 'repeating-linear-gradient(to right, #FB64B6 0, #FB64B6 4px, transparent 4px, transparent 7px)' }} />
                    <p className="font-['Press_Start_2P'] text-[10px] text-white leading-[15px]">경로 1</p>
                  </div>
                  <div className="flex gap-1 items-start mb-2">
                    <div className="bg-[#ffd93d] border-[1.36px] border-black px-2 py-1">
                      <p className="font-['Press_Start_2P'] text-[6px] text-black leading-[9px]">15분</p>
                    </div>
                    <div className="bg-white border-[1.36px] border-black px-2 py-1">
                      <p className="font-['Press_Start_2P'] text-[6px] text-black leading-[9px]">2.3KM</p>
                    </div>
                  </div>
                  {/* 체크박스들 */}
                  <div className="flex gap-2 flex-wrap">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selection.user === 1}
                        onChange={() => handleRouteSelect(1, 'user')}
                        className="w-3 h-3 accent-[#7ed321] cursor-pointer"
                      />
                      <span className="font-['Press_Start_2P'] text-[6px] text-white">유저</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selection.ghost1 === 1}
                        onChange={() => handleRouteSelect(1, 'ghost1')}
                        className="w-3 h-3 accent-[#7ed321] cursor-pointer"
                      />
                      <span className="font-['Press_Start_2P'] text-[6px] text-white">고스트1</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selection.ghost2 === 1}
                        onChange={() => handleRouteSelect(1, 'ghost2')}
                        className="w-3 h-3 accent-[#7ed321] cursor-pointer"
                      />
                      <span className="font-['Press_Start_2P'] text-[6px] text-white">고스트2</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 경로 2 - 노란색 */}
            <div className="bg-[#ffc107] rounded-[10px] border-[3.4px] border-black shadow-[4px_4px_0px_0px_black] p-4 pointer-events-auto" style={{ pointerEvents: 'auto' }}>
              <div className="flex items-start gap-3">
                <div className="bg-white border-[1.36px] border-black size-[48px] flex items-center justify-center flex-shrink-0">
                  <p className="text-[24px]">2️⃣</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-[2px] bg-[#FFC107] border border-black" style={{ backgroundImage: 'repeating-linear-gradient(to right, #FFC107 0, #FFC107 4px, transparent 4px, transparent 7px)' }} />
                    <p className="font-['Press_Start_2P'] text-[10px] text-black leading-[15px]">경로 2</p>
                  </div>
                  <div className="flex gap-1 items-start mb-2">
                    <div className="bg-white border-[1.36px] border-black px-2 py-1">
                      <p className="font-['Press_Start_2P'] text-[6px] text-black leading-[9px]">18분</p>
                    </div>
                    <div className="bg-white border-[1.36px] border-black px-2 py-1">
                      <p className="font-['Press_Start_2P'] text-[6px] text-black leading-[9px]">2.8KM</p>
                    </div>
                  </div>
                  {/* 체크박스들 */}
                  <div className="flex gap-2 flex-wrap">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selection.user === 2}
                        onChange={() => handleRouteSelect(2, 'user')}
                        className="w-3 h-3 accent-[#7ed321] cursor-pointer"
                      />
                      <span className="font-['Press_Start_2P'] text-[6px] text-black">유저</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selection.ghost1 === 2}
                        onChange={() => handleRouteSelect(2, 'ghost1')}
                        className="w-3 h-3 accent-[#7ed321] cursor-pointer"
                      />
                      <span className="font-['Press_Start_2P'] text-[6px] text-black">고스트1</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selection.ghost2 === 2}
                        onChange={() => handleRouteSelect(2, 'ghost2')}
                        className="w-3 h-3 accent-[#7ed321] cursor-pointer"
                      />
                      <span className="font-['Press_Start_2P'] text-[6px] text-black">고스트2</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 경로 3 - 청록색 */}
            <div className="bg-[#6DF3E3] rounded-[10px] border-[3.4px] border-black shadow-[4px_4px_0px_0px_black] p-4">
              <div className="flex items-start gap-3">
                <div className="bg-white border-[1.36px] border-black size-[48px] flex items-center justify-center flex-shrink-0">
                  <p className="text-[24px]">3️⃣</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-[2px] bg-[#6DF3E3] border border-black" style={{ backgroundImage: 'repeating-linear-gradient(to right, #6DF3E3 0, #6DF3E3 4px, transparent 4px, transparent 7px)' }} />
                    <p className="font-['Press_Start_2P'] text-[10px] text-black leading-[15px]">경로 3</p>
                  </div>
                  <div className="flex gap-1 items-start mb-2">
                    <div className="bg-white border-[1.36px] border-black px-2 py-1">
                      <p className="font-['Press_Start_2P'] text-[6px] text-black leading-[9px]">20분</p>
                    </div>
                    <div className="bg-white border-[1.36px] border-black px-2 py-1">
                      <p className="font-['Press_Start_2P'] text-[6px] text-black leading-[9px]">3.1KM</p>
                    </div>
                  </div>
                  {/* 체크박스들 */}
                  <div className="flex gap-2 flex-wrap">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selection.user === 3}
                        onChange={() => handleRouteSelect(3, 'user')}
                        className="w-3 h-3 accent-[#7ed321] cursor-pointer"
                      />
                      <span className="font-['Press_Start_2P'] text-[6px] text-black">유저</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selection.ghost1 === 3}
                        onChange={() => handleRouteSelect(3, 'ghost1')}
                        className="w-3 h-3 accent-[#7ed321] cursor-pointer"
                      />
                      <span className="font-['Press_Start_2P'] text-[6px] text-black">고스트1</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selection.ghost2 === 3}
                        onChange={() => handleRouteSelect(3, 'ghost2')}
                        className="w-3 h-3 accent-[#7ed321] cursor-pointer"
                      />
                      <span className="font-['Press_Start_2P'] text-[6px] text-black">고스트2</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 선택 현황 */}
            {(selection.user !== null || selection.ghost1 !== null || selection.ghost2 !== null) && (
              <div className="bg-white/90 border-[3.4px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_black] p-4">
                <p className="font-['Press_Start_2P'] text-[8px] text-black leading-[12px] mb-3">선택 현황:</p>
                <div className="space-y-2">
                  {selection.user !== null && (
                    <div className="flex items-center gap-2">
                      <p className="text-[16px]">🏃</p>
                      <p className="font-['Press_Start_2P'] text-[7px] text-black">유저 → 경로 {selection.user}</p>
                    </div>
                  )}
                  {selection.ghost1 !== null && (
                    <div className="flex items-center gap-2">
                      <p className="text-[16px]">👻</p>
                      <p className="font-['Press_Start_2P'] text-[7px] text-black">고스트1 → 경로 {selection.ghost1}</p>
                    </div>
                  )}
                  {selection.ghost2 !== null && (
                    <div className="flex items-center gap-2">
                      <p className="text-[16px]">👻</p>
                      <p className="font-['Press_Start_2P'] text-[7px] text-black">고스트2 → 경로 {selection.ghost2}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 경주 시작 버튼 */}
            <button
              onClick={handleStartRace}
              disabled={!canStartRace}
              className={`w-full h-14 rounded-[10px] border-[3.4px] border-black font-['Press_Start_2P'] text-[14px] transition-all mb-4 pointer-events-auto bg-yellow-400/50 ${
                !canStartRace
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-[#ffd93d] text-black shadow-[6px_6px_0px_0px_black] active:translate-y-1 active:shadow-[3px_3px_0px_0px_black]'
              }`}
              style={{ pointerEvents: 'auto' }}
            >
              이동 시작! 🏁
            </button>
          </div>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
