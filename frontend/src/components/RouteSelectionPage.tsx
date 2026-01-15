import { useRef, useState } from "react";

interface RouteSelectionPageProps {
  onNavigate: (page: string, params?: any) => void;
}

interface RouteSelection {
  user: number | null;
  ghost1: number | null;
  ghost2: number | null;
}

const USER_ICON_SRC = `${import.meta.env.BASE_URL}assets/user_dog.png`;

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
  const activePointerIdRef = useRef<number | null>(null);

  const handleRouteSelect = (routeNum: number, type: 'user' | 'ghost1' | 'ghost2') => {
    // 규칙: "한 경로(카드)에는 한 명만 선택" (유저/고스트 중 1명만)
    setSelection((prev) => {
      const isTogglingOff = prev[type] === routeNum;
      if (isTogglingOff) {
        return { ...prev, [type]: null };
      }

      const next: RouteSelection = { ...prev, [type]: routeNum };
      (['user', 'ghost1', 'ghost2'] as const).forEach((other) => {
        if (other !== type && next[other] === routeNum) {
          next[other] = null;
        }
      });
      return next;
    });
  };

  const handleStartRace = () => {
    if (!canStartRace) return;
    onNavigate('route-detail', {
      routeSelection: {
        user: selection.user!,
        ghost1: selection.ghost1!,
        ghost2: selection.ghost2!,
      },
    });
  };

  const handleBack = () => {
    onNavigate('__back__');
  };

  const canStartRace = selection.user !== null && selection.ghost1 !== null && selection.ghost2 !== null;

  const snapSheet = (pos: number) => {
    // 스냅 포인트: 30% (작게), 60% (반), 90% (거의 전체)
    if (pos < 45) return 30;
    if (pos < 75) return 60;
    return 90;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Pointer Events로 통일 (모바일/데스크톱에서 가장 안정적)
    e.preventDefault();
    e.stopPropagation();
    activePointerIdRef.current = e.pointerId;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    startYRef.current = e.clientY;
    startPositionRef.current = sheetPosition;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    if (activePointerIdRef.current !== e.pointerId) return;

    const deltaY = startYRef.current - e.clientY;
    const windowHeight = window.innerHeight || 1;
    const deltaPercent = (deltaY / windowHeight) * 100;
    const newPosition = Math.max(30, Math.min(90, startPositionRef.current + deltaPercent));
    setSheetPosition(newPosition);
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    activePointerIdRef.current = null;
    setIsDragging(false);
    setSheetPosition((prev) => snapSheet(prev));
  };

  return (
    // NOTE: 이 페이지는 버튼/체크박스 등 UI 조작이 핵심이라
    // 루트에서 pointer-events 를 열어두고(z-index 포함),
    // 필요한 요소만 레이어(z)로 정렬합니다.
    <div className="absolute inset-0 pointer-events-auto z-30">
      {/* 헤더 - 독립적인 absolute 요소 */}
      <div className="absolute bg-[#00d9ff] left-0 top-0 w-full border-b-[3.4px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] z-[60] pointer-events-auto">
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleBack();
              }}
              className="w-10 h-8 bg-white border-[3px] border-black rounded-[8px] shadow-[3px_3px_0px_0px_black] active:translate-y-[1px] active:shadow-[2px_2px_0px_0px_black] pointer-events-auto flex items-center justify-center"
              aria-label="뒤로가기"
              style={{ touchAction: 'manipulation' }}
            >
              <span className="font-['Press_Start_2P'] text-[12px] text-black leading-none">←</span>
            </button>
            <p className="font-['Press_Start_2P'] text-[12px] text-black">9:41</p>
          </div>
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
        className="absolute left-0 right-0 bg-white rounded-t-[24px] border-t-[3.4px] border-l-[3.4px] border-r-[3.4px] border-black shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] transition-all flex flex-col z-[50] pointer-events-auto"
        style={{
          height: `${sheetPosition}%`,
          bottom: 0,
          transitionDuration: isDragging ? '0ms' : '300ms',
        }}
      >
        {/* 드래그 핸들 */}
        <div
          className="w-full py-4 cursor-grab active:cursor-grabbing flex justify-center flex-shrink-0 pointer-events-auto"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUpOrCancel}
          onPointerCancel={handlePointerUpOrCancel}
          style={{ touchAction: 'none' }}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* 경로 선택 콘텐츠 */}
        <div className="px-5 pb-[140px] overflow-y-auto flex-1 scrollbar-hide pointer-events-auto bg-yellow-400/50" style={{ minHeight: '100px', pointerEvents: 'auto', touchAction: 'pan-y' }}>
          <div className="flex flex-col gap-4">
            {/* 안내 텍스트 */}
            <div className="bg-[#00d9ff]/20 border-[3.4px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_black] p-4">
              <p className="font-['Press_Start_2P'] text-[13px] text-black leading-[15px] text-center">
                각 플레이어의 경로를 선택하세요
              </p>
            </div>

            {/* 경로 카드들 */}
            {/* 경로 1 - 핑크 */}
            <div className="bg-[#ff6b9d] rounded-[10px] border-[3.4px] border-black shadow-[4px_4px_0px_0px_black] p-4 pointer-events-auto">
              <div className="flex items-start gap-3">
                <div className="bg-white border-[1.36px] border-black size-[48px] flex items-center justify-center flex-shrink-0">
                  <p className="text-[24px]">1️⃣</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-[2px] bg-[#FB64B6] border border-black" style={{ backgroundImage: 'repeating-linear-gradient(to right, #FB64B6 0, #FB64B6 4px, transparent 4px, transparent 7px)' }} />
                    <p className="font-['Press_Start_2P'] text-[13px] text-black leading-[15px]">경로 1</p>
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
                      <span className="inline-flex items-center gap-1 font-['Press_Start_2P'] text-[10px] text-black">
                        <img
                          src={USER_ICON_SRC}
                          alt="user"
                          className="w-5 h-5 [image-rendering:pixelated]"
                        />
                        유저
                      </span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selection.ghost1 === 1}
                        onChange={() => handleRouteSelect(1, 'ghost1')}
                        className="w-3 h-3 accent-[#7ed321] cursor-pointer"
                      />
                      <span className="font-['Press_Start_2P'] text-[10px] text-black">고스트1</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selection.ghost2 === 1}
                        onChange={() => handleRouteSelect(1, 'ghost2')}
                        className="w-3 h-3 accent-[#7ed321] cursor-pointer"
                      />
                      <span className="font-['Press_Start_2P'] text-[6px] text-black">고스트2</span>
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
                    <p className="font-['Press_Start_2P'] text-[13px] text-black leading-[15px]">경로 2</p>
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
                      <span className="inline-flex items-center gap-1 font-['Press_Start_2P'] text-[10px] text-black">
                        <img
                          src={USER_ICON_SRC}
                          alt="user"
                          className="w-5 h-5 [image-rendering:pixelated]"
                        />
                        유저
                      </span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selection.ghost1 === 2}
                        onChange={() => handleRouteSelect(2, 'ghost1')}
                        className="w-3 h-3 accent-[#7ed321] cursor-pointer"
                      />
                      <span className="font-['Press_Start_2P'] text-[10px] text-black">고스트1</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selection.ghost2 === 2}
                        onChange={() => handleRouteSelect(2, 'ghost2')}
                        className="w-3 h-3 accent-[#7ed321] cursor-pointer"
                      />
                      <span className="font-['Press_Start_2P'] text-[10px] text-black">고스트2</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 경로 3 - 청록색 */}
            <div className="bg-[#6DF3E3] rounded-[10px] border-[3.4px] border-black shadow-[4px_4px_0px_0px_black] p-4 pointer-events-auto">
              <div className="flex items-start gap-3">
                <div className="bg-white border-[1.36px] border-black size-[48px] flex items-center justify-center flex-shrink-0">
                  <p className="text-[24px]">3️⃣</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-[2px] bg-[#6DF3E3] border border-black" style={{ backgroundImage: 'repeating-linear-gradient(to right, #6DF3E3 0, #6DF3E3 4px, transparent 4px, transparent 7px)' }} />
                    <p className="font-['Press_Start_2P'] text-[13px] text-black leading-[15px]">경로 3</p>
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
                      <span className="inline-flex items-center gap-1 font-['Press_Start_2P'] text-[10px] text-black">
                        <img
                          src={USER_ICON_SRC}
                          alt="user"
                          className="w-5 h-5 [image-rendering:pixelated]"
                        />
                        유저
                      </span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selection.ghost1 === 3}
                        onChange={() => handleRouteSelect(3, 'ghost1')}
                        className="w-3 h-3 accent-[#7ed321] cursor-pointer"
                      />
                      <span className="font-['Press_Start_2P'] text-[10px] text-black">고스트1</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selection.ghost2 === 3}
                        onChange={() => handleRouteSelect(3, 'ghost2')}
                        className="w-3 h-3 accent-[#7ed321] cursor-pointer"
                      />
                      <span className="font-['Press_Start_2P'] text-[10px] text-black">고스트2</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 선택 현황 */}
            {(selection.user !== null || selection.ghost1 !== null || selection.ghost2 !== null) && (
              <div className="bg-white/90 border-[3.4px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_black] p-4">
                <p className="font-['Press_Start_2P'] text-[13px] text-black leading-[12px] mb-3">선택 현황:</p>
                <div className="space-y-2">
                  {selection.user !== null && (
                    <div className="flex items-center gap-2">
                      <img
                        src={USER_ICON_SRC}
                        alt="user"
                        className="w-5 h-5 [image-rendering:pixelated]"
                      />
                      <p className="font-['Press_Start_2P'] text-[10px] text-black">유저 → 경로 {selection.user}</p>
                    </div>
                  )}
                  {selection.ghost1 !== null && (
                    <div className="flex items-center gap-2">
                      <p className="text-[16px]">👻</p>
                      <p className="font-['Press_Start_2P'] text-[10px] text-black">고스트1 → 경로 {selection.ghost1}</p>
                    </div>
                  )}
                  {selection.ghost2 !== null && (
                    <div className="flex items-center gap-2">
                      <p className="text-[16px]">👻</p>
                      <p className="font-['Press_Start_2P'] text-[10px] text-black">고스트2 → 경로 {selection.ghost2}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 바텀 시트 외부(Sibling) 고정 버튼 - 스마트폰(프레임) 기준 */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🚀 버튼 클릭!', canStartRace);
          handleStartRace();
        }}
        disabled={!canStartRace}
        className={`absolute left-5 right-5 bottom-6 h-14 rounded-[10px] border-[3.4px] border-black font-['Press_Start_2P'] text-[14px] transition-all z-[100] pointer-events-auto ${
          !canStartRace
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-[#ffd93d] text-black shadow-[6px_6px_0px_0px_black] active:translate-y-1 active:shadow-[3px_3px_0px_0px_black] cursor-pointer'
        }`}
        style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
      >
        이동 시작! 🏁
      </button>

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
    </div>
  );
}
