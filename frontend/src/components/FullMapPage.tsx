interface FullMapPageProps {
  onNavigate: (page: string) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRecenter?: () => void;
}

export function FullMapPage({
  onNavigate,
  onZoomIn = () => {},
  onZoomOut = () => {},
  onRecenter = () => {},
}: FullMapPageProps) {

  return (
    <div className="relative z-[100] size-full bg-transparent overflow-hidden pointer-events-none" style={{ pointerEvents: 'none' }}>

      {/* 우상단 버튼들 */}
      <div className="absolute top-5 right-5 flex gap-3 z-[110] pointer-events-auto" style={{ pointerEvents: 'auto' }}>
        {/* 즐겨찾기 버튼 */}
        <button
          onClick={() => onNavigate('favorites')}
          className="relative z-[110] pointer-events-auto w-12 h-12 bg-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center hover:scale-105 active:translate-y-1 active:shadow-[2px_2px_0px_0px_black] transition-all"
          style={{ pointerEvents: 'auto' }}
        >
          <p className="text-[24px]">⭐</p>
        </button>

        {/* 마이페이지 버튼 */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="relative z-[110] pointer-events-auto w-12 h-12 bg-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center hover:scale-105 active:translate-y-1 active:shadow-[2px_2px_0px_0px_black] transition-all"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="w-8 h-8 bg-[#00d9ff] rounded-full border-[2px] border-black flex items-center justify-center">
            <p className="text-[16px]">👤</p>
          </div>
        </button>
      </div>

      {/* 우하단 확대/축소 버튼들 */}
      <div className="absolute bottom-24 right-5 flex flex-col gap-3 z-[110] pointer-events-auto" style={{ pointerEvents: 'auto' }}>
        {/* 확대 버튼 */}
        <button
          onClick={onZoomIn}
          className="relative z-[110] pointer-events-auto w-12 h-12 bg-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center hover:scale-105 active:translate-y-1 active:shadow-[2px_2px_0px_0px_black] transition-all"
          style={{ pointerEvents: 'auto' }}
        >
          <p className="font-['Press_Start_2P'] text-[20px] text-black leading-none">+</p>
        </button>

        {/* 축소 버튼 */}
        <button
          onClick={onZoomOut}
          className="relative z-[110] pointer-events-auto w-12 h-12 bg-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center hover:scale-105 active:translate-y-1 active:shadow-[2px_2px_0px_0px_black] transition-all"
          style={{ pointerEvents: 'auto' }}
        >
          <p className="font-['Press_Start_2P'] text-[20px] text-black leading-none">-</p>
        </button>

        {/* 현재 위치 버튼 */}
        <button
          onClick={onRecenter}
          className="relative z-[110] pointer-events-auto w-12 h-12 bg-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center hover:scale-105 active:translate-y-1 active:shadow-[2px_2px_0px_0px_black] transition-all"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="w-2 h-2 bg-[#00d9ff] rounded-full border-[2px] border-black relative">
            <div className="absolute inset-0 bg-[#00d9ff] rounded-full animate-ping opacity-75" />
          </div>
        </button>
      </div>

      {/* 하단 길찾기 시작 버튼튼 */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 z-[110] pointer-events-auto" style={{ pointerEvents: 'auto' }}>
        <button
          onClick={() => onNavigate('map')}
          className="relative z-[110] pointer-events-auto w-full h-16 rounded-[16px] border-[3.4px] border-black font-['Press_Start_2P'] text-[14px] bg-[#00d9ff] text-white shadow-[6px_6px_0px_0px_black] active:translate-y-1 active:shadow-[3px_3px_0px_0px_black] transition-all flex items-center justify-center gap-2"
          style={{ pointerEvents: 'auto' }}
        >
          <span>start!</span>
          <span>🚀</span>
        </button>
      </div>

      {/* CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        @keyframes ping {
          0% { transform: scale(1); opacity: 0.75; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }

        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
