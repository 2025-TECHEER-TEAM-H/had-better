import { useEffect, useRef, useState } from "react";

interface RouteDetailPageProps {
  onNavigate: (page: string, data?: any) => void;
  routeSelection: {
    user: number;
    ghost1: number;
    ghost2: number;
  };
}

const USER_ICON_SRC = `${import.meta.env.BASE_URL}assets/user_dog.png`;

// 경로별 좌표 계산 함수 - 큰 지도 기준으로 확장
const getRoutePosition = (progress: number, routeNum: number) => {
  const startX = 80;
  const startY = 400;

  // 경로 1 (핑크) - 위쪽 경로
  if (routeNum === 1) {
    const x = startX + (250 * progress / 100);
    const y = startY - (200 * progress / 100);
    return { x, y };
  }

  // 경로 2 (노란색) - 중간 경로
  if (routeNum === 2) {
    const x = startX + (240 * progress / 100);
    const y = startY - (220 * progress / 100);
    return { x, y };
  }

  // 경로 3 (청록색) - 아래쪽 경로
  if (routeNum === 3) {
    const x = startX + (240 * progress / 100);
    const y = startY - (180 * progress / 100);
    return { x, y };
  }

  return { x: startX, y: startY };
};

export function RouteDetailPage({ onNavigate, routeSelection }: RouteDetailPageProps) {
  const [raceProgress, setRaceProgress] = useState({
    user: 0,
    ghost1: 0,
    ghost2: 0,
  });
  const [sheetPosition, setSheetPosition] = useState(30); // 30% 높이에서 시작
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startPositionRef = useRef(30);
  const activePointerIdRef = useRef<number | null>(null);

  // routeSelection이 변경되면 경주 진행률 초기화
  useEffect(() => {
    setRaceProgress({
      user: 0,
      ghost1: 0,
      ghost2: 0,
    });
    console.log('🎮 RouteDetailPage - 경로 선택:', routeSelection);
  }, [routeSelection.user, routeSelection.ghost1, routeSelection.ghost2]);

  // 실시간 경주 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setRaceProgress(prev => {
        const userSpeed = 1 + Math.random() * 1.5;
        const ghost1Speed = 1 + Math.random() * 1.5;
        const ghost2Speed = 1 + Math.random() * 1.5;

        return {
          user: Math.min(prev.user + userSpeed, 100),
          ghost1: Math.min(prev.ghost1 + ghost1Speed, 100),
          ghost2: Math.min(prev.ghost2 + ghost2Speed, 100),
        };
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const maxProgress = Math.max(raceProgress.user, raceProgress.ghost1, raceProgress.ghost2);

  // 각 플레이어의 현재 위치 계산
  const userPos = getRoutePosition(raceProgress.user, routeSelection.user);
  const ghost1Pos = getRoutePosition(raceProgress.ghost1, routeSelection.ghost1);
  const ghost2Pos = getRoutePosition(raceProgress.ghost2, routeSelection.ghost2);

  const snapSheet = (pos: number) => {
    // 스냅 포인트: 10% (거의 닫힘), 30% (작게), 80% (크게)
    if (pos < 20) return 10;
    if (pos < 55) return 30;
    return 80;
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

    const newPosition = Math.max(10, Math.min(80, startPositionRef.current + deltaPercent));
    setSheetPosition(newPosition);
  };

  const handlePointerUpOrCancel = (e: React.PointerEvent) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    activePointerIdRef.current = null;
    setIsDragging(false);
    setSheetPosition((prev) => snapSheet(prev));
  };

  return (
    // NOTE: 상위 레이어가 pointer-events-none 이라서,
    // 상호작용이 필요한 요소만 pointer-events-auto를 명시합니다.
    <div className="relative size-full overflow-hidden bg-transparent pointer-events-none">
      {/* 경로 점선들 - 지도 위에 오버레이 */}
      <div className="absolute inset-0 z-[5]">
        {/* 핑크 경로 (경로 1) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <path
            d="M 80 400 Q 140 350, 200 300 T 280 220 T 330 200"
            fill="none"
            stroke="#FB64B6"
            strokeWidth="6"
            strokeDasharray="15 10"
            opacity="0.8"
          />
        </svg>

        {/* 노란색 경로 (경로 2) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <path
            d="M 80 400 Q 150 330, 220 260 T 300 200 T 320 180"
            fill="none"
            stroke="#FFC107"
            strokeWidth="6"
            strokeDasharray="15 10"
            opacity="0.8"
          />
        </svg>

        {/* 청록색 경로 (경로 3) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <path
            d="M 80 400 Q 160 360, 240 320 T 310 240 T 320 220"
            fill="none"
            stroke="#6DF3E3"
            strokeWidth="6"
            strokeDasharray="15 10"
            opacity="0.7"
          />
        </svg>

        {/* 출발 마커 */}
        <div className="absolute left-[68px] top-[388px] w-[28px] h-[36px] bg-[#2b7fff] rounded-tl-[50%] rounded-tr-[50%] rounded-br-[50%] border-[3px] border-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] flex items-center justify-center">
          <p className="font-['Press_Start_2P'] text-[12px] text-white mt-[-4px]">출</p>
        </div>

        {/* 도착 마커 */}
        <div className="absolute left-[308px] top-[168px] w-[28px] h-[36px] bg-[#fb2c36] rounded-tl-[50%] rounded-tr-[50%] rounded-br-[50%] border-[3px] border-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] flex items-center justify-center">
          <p className="font-['Press_Start_2P'] text-[12px] text-white mt-[-4px]">도</p>
        </div>
      </div>

      {/* 캐릭터들이 지도 위에서 움직임 */}
      {/* 유저 플레이어 */}
      <div
        className="absolute transition-all duration-200 z-10"
        style={{
          left: `${userPos.x}px`,
          top: `${userPos.y}px`,
          transform: 'translate(-12px, -12px)',
        }}
      >
        <div className="relative">
          <img
            src={USER_ICON_SRC}
            alt="user"
            className="w-8 h-8 [image-rendering:pixelated]"
          />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white border-[2px] border-black px-2 rounded shadow-md">
            <p className="font-['Press_Start_2P'] text-[6px] text-black whitespace-nowrap">YOU</p>
          </div>
        </div>
      </div>

      {/* 고스트 1 */}
      <div
        className="absolute transition-all duration-200 z-10"
        style={{
          left: `${ghost1Pos.x}px`,
          top: `${ghost1Pos.y}px`,
          transform: 'translate(-12px, -12px)',
        }}
      >
        <div className="relative">
          <p className="text-[28px]">👻</p>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white border-[2px] border-black px-2 rounded shadow-md">
            <p className="font-['Press_Start_2P'] text-[6px] text-black whitespace-nowrap">G1</p>
          </div>
        </div>
      </div>

      {/* 고스트 2 */}
      <div
        className="absolute transition-all duration-200 z-10"
        style={{
          left: `${ghost2Pos.x}px`,
          top: `${ghost2Pos.y}px`,
          transform: 'translate(-12px, -12px)',
        }}
      >
        <div className="relative">
          <p className="text-[28px]">👻</p>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white border-[2px] border-black px-2 rounded shadow-md">
            <p className="font-['Press_Start_2P'] text-[6px] text-black whitespace-nowrap">G2</p>
          </div>
        </div>
      </div>

      {/* 헤더 */}
      <div
        className="absolute bg-[#00d9ff] left-0 top-0 w-full border-b-[3.4px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] z-[60] pointer-events-auto"
        style={{ pointerEvents: 'auto' }}
      >
        <div className="flex items-center justify-between px-5 py-3">
          <p className="font-['Press_Start_2P'] text-[12px] text-black">9:41</p>
          <p className="font-['Press_Start_2P'] text-[12px] text-black">RACING...</p>
          <div className="flex gap-1">
            <div className="bg-black size-[4px]" />
            <div className="bg-black size-[4px]" />
            <div className="bg-black size-[4px]" />
          </div>
        </div>
      </div>

      {/* 실시간 순위 팝업 - 슬라이드 업 위치에 따라 이동 */}
      <div
        className="absolute left-5 right-5 bg-[#ffd93d] border-[3.4px] border-black rounded-[12px] shadow-[6px_6px_0px_0px_black] p-4 z-[40] transition-all pointer-events-auto"
        style={{
          bottom: `calc(${sheetPosition}% + 20px)`,
          transitionDuration: isDragging ? '0ms' : '300ms'
        }}
      >
        <p className="font-['Press_Start_2P'] text-[10px] text-black leading-[12px] text-center mb-3">
          실시간 순위 🏆
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="bg-white border-[1.36px] border-black px-2 py-1 w-10 flex items-center justify-center">
              <p className="font-['Press_Start_2P'] text-[7px] text-black">
                {raceProgress.user >= raceProgress.ghost1 && raceProgress.user >= raceProgress.ghost2 ? '1위' :
                 raceProgress.user >= Math.min(raceProgress.ghost1, raceProgress.ghost2) ? '2위' : '3위'}
              </p>
            </div>
            <img
              src={USER_ICON_SRC}
              alt="user"
              className="w-5 h-5 [image-rendering:pixelated]"
            />
            <div className="flex-1 bg-white border-[1.36px] border-black h-4 rounded overflow-hidden">
              <div
                className="bg-[#ff6b9d] h-full transition-all duration-200"
                style={{ width: `${raceProgress.user}%` }}
              />
            </div>
            <p className="font-['Press_Start_2P'] text-[6px] text-black">{Math.floor(raceProgress.user)}%</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white border-[1.36px] border-black px-2 py-1 w-10 flex items-center justify-center">
              <p className="font-['Press_Start_2P'] text-[7px] text-black">
                {raceProgress.ghost1 >= raceProgress.user && raceProgress.ghost1 >= raceProgress.ghost2 ? '1위' :
                 raceProgress.ghost1 >= Math.min(raceProgress.user, raceProgress.ghost2) ? '2위' : '3위'}
              </p>
            </div>
            <p className="text-[16px]">👻</p>
            <div className="flex-1 bg-white border-[1.36px] border-black h-4 rounded overflow-hidden">
              <div
                className="bg-[#ffc107] h-full transition-all duration-200"
                style={{ width: `${raceProgress.ghost1}%` }}
              />
            </div>
            <p className="font-['Press_Start_2P'] text-[6px] text-black">{Math.floor(raceProgress.ghost1)}%</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white border-[1.36px] border-black px-2 py-1 w-10 flex items-center justify-center">
              <p className="font-['Press_Start_2P'] text-[7px] text-black">
                {raceProgress.ghost2 >= raceProgress.user && raceProgress.ghost2 >= raceProgress.ghost1 ? '1위' :
                 raceProgress.ghost2 >= Math.min(raceProgress.user, raceProgress.ghost1) ? '2위' : '3위'}
              </p>
            </div>
            <p className="text-[16px]">👻</p>
            <div className="flex-1 bg-white border-[1.36px] border-black h-4 rounded overflow-hidden">
              <div
                className="bg-[#6DF3E3] h-full transition-all duration-200"
                style={{ width: `${raceProgress.ghost2}%` }}
              />
            </div>
            <p className="font-['Press_Start_2P'] text-[6px] text-black">{Math.floor(raceProgress.ghost2)}%</p>
          </div>
        </div>
      </div>

      {/* 바텀 시트 컨테이너 - 투명 배경 (지도가 보이도록) */}
      <div
        className="absolute left-0 right-0 z-[50] bg-transparent transition-all pointer-events-none"
        style={{
          height: `${sheetPosition}%`,
          bottom: 0,
          transitionDuration: isDragging ? '0ms' : '300ms'
        }}
      >
        {/* 내부 컨테이너 - 흰색 배경, 둥근 모서리, 테두리 */}
        <div className="w-full h-full bg-white rounded-t-[24px] border-t-[3.4px] border-x-[3.4px] border-black shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] flex flex-col pointer-events-auto">
          {/* 드래그 핸들 */}
          <div
            className="w-full py-4 cursor-grab active:cursor-grabbing flex justify-center flex-shrink-0 pointer-events-auto"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUpOrCancel}
            onPointerCancel={handlePointerUpOrCancel}
            style={{ touchAction: 'none', pointerEvents: 'auto' }}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {/* 내 경로 콘텐츠 - 스크롤 가능 */}
          <div
            className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-[80px]"
            style={{ minHeight: 0, pointerEvents: 'auto', touchAction: 'pan-y' }}
          >
            <div className="flex flex-col gap-4">
            {/* 나의 경로 정보 */}
            <div className="bg-gradient-to-br from-[#ff6b9d] to-[#ff9ac1] border-[3.4px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_black] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-white border-[2px] border-black size-[48px] flex items-center justify-center rounded-lg">
                  <img
                    src={USER_ICON_SRC}
                    alt="user"
                    className="w-6 h-6 [image-rendering:pixelated]"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-['Press_Start_2P'] text-[10px] text-white leading-[15px] mb-1">내 경로 (경로 {routeSelection.user})</p>
                  <div className="flex gap-1">
                    <div className="bg-[#ffd93d] border-[1.36px] border-black px-2 py-1">
                      <p className="font-['Press_Start_2P'] text-[6px] text-black leading-[9px]">
                        {routeSelection.user === 1 ? '15분' : routeSelection.user === 2 ? '18분' : '20분'}
                      </p>
                    </div>
                    <div className="bg-white border-[1.36px] border-black px-2 py-1">
                      <p className="font-['Press_Start_2P'] text-[6px] text-black leading-[9px]">
                        {routeSelection.user === 1 ? '2.3KM' : routeSelection.user === 2 ? '2.8KM' : '3.1KM'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 경로 단계들 */}
              <div className="space-y-3">
                <p className="font-['Press_Start_2P'] text-[8px] text-white mb-2">이동 경로</p>
                <div className="flex items-start gap-2">
                  <div className="bg-[#7ed321] border-[2px] border-black size-[28px] flex items-center justify-center flex-shrink-0 rounded">
                    <p className="font-['Press_Start_2P'] text-[10px] text-black">1</p>
                  </div>
                  <p className="font-['Press_Start_2P'] text-[7px] text-white leading-[12px] flex-1">
                    {routeSelection.user === 1 ? '2호선 신논현역 승차' :
                     routeSelection.user === 2 ? '버스 정류장에서 146번 탑승' :
                     '공원을 통과하여 도보 이동'}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="bg-[#7ed321] border-[2px] border-black size-[28px] flex items-center justify-center flex-shrink-0 rounded">
                    <p className="font-['Press_Start_2P'] text-[10px] text-black">2</p>
                  </div>
                  <p className="font-['Press_Start_2P'] text-[7px] text-white leading-[12px] flex-1">
                    {routeSelection.user === 1 ? '3정거장 이동 (약 6분)' :
                     routeSelection.user === 2 ? '5정거장 이동 (약 10분)' :
                     '카페 거리 통과 (약 12분)'}
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <div className="bg-[#7ed321] border-[2px] border-black size-[28px] flex items-center justify-center flex-shrink-0 rounded">
                    <p className="font-['Press_Start_2P'] text-[10px] text-black">3</p>
                  </div>
                  <p className="font-['Press_Start_2P'] text-[7px] text-white leading-[12px] flex-1">
                    {routeSelection.user === 1 ? '대치역 하차 후 도보 5분' :
                     routeSelection.user === 2 ? '목적지 근처 하차 후 도보 3분' :
                     '도착지까지 직진 후 완료'}
                  </p>
                </div>
              </div>
            </div>

            {/* 도착 완료 버튼 */}
            <button
              onClick={() => onNavigate('result')}
              disabled={maxProgress < 100}
              className={`w-full h-14 rounded-[10px] border-[3.4px] border-black font-['Press_Start_2P'] text-[14px] transition-all ${
                maxProgress >= 100
                  ? 'bg-[#7ed321] text-white shadow-[6px_6px_0px_0px_black] active:translate-y-1 active:shadow-[3px_3px_0px_0px_black]'
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
              style={{ touchAction: 'manipulation', pointerEvents: 'auto' }}
            >
              {maxProgress >= 100 ? '도착 완료! 🎉' : '경주 진행중...'}
            </button>
            </div>
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
    </div>
  );
}
