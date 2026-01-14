import { useState } from "react";
import fullMapImage from "../assets/506d3ac81771f7af9c2519c77e86748254304713.png";

interface FullMapPageProps {
  onNavigate: (page: string) => void;
}

export function FullMapPage({ onNavigate }: FullMapPageProps) {
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.6));
  };

  return (
    <div className="relative size-full bg-white overflow-hidden">
      {/* 전체 지도 */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="w-full h-full transition-transform duration-300"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center'
          }}
        >
          <img
            src={fullMapImage}
            alt="Full Map"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 우상단 버튼들 */}
      <div className="absolute top-5 right-5 flex gap-3 z-10">
        {/* 즐겨찾기 버튼 */}
        <button
          onClick={() => onNavigate('favorites')}
          className="w-12 h-12 bg-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center hover:scale-105 active:translate-y-1 active:shadow-[2px_2px_0px_0px_black] transition-all"
        >
          <p className="text-[24px]">⭐</p>
        </button>

        {/* 마이페이지 버튼 */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-12 h-12 bg-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center hover:scale-105 active:translate-y-1 active:shadow-[2px_2px_0px_0px_black] transition-all"
        >
          <div className="w-8 h-8 bg-[#00d9ff] rounded-full border-[2px] border-black flex items-center justify-center">
            <p className="text-[16px]">👤</p>
          </div>
        </button>
      </div>

      {/* 우하단 확대/축소 버튼들 */}
      <div className="absolute bottom-24 right-5 flex flex-col gap-3 z-10">
        {/* 확대 버튼 */}
        <button
          onClick={handleZoomIn}
          className="w-12 h-12 bg-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center hover:scale-105 active:translate-y-1 active:shadow-[2px_2px_0px_0px_black] transition-all"
        >
          <p className="font-['Press_Start_2P'] text-[20px] text-black leading-none">+</p>
        </button>

        {/* 축소 버튼 */}
        <button
          onClick={handleZoomOut}
          className="w-12 h-12 bg-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center hover:scale-105 active:translate-y-1 active:shadow-[2px_2px_0px_0px_black] transition-all"
        >
          <p className="font-['Press_Start_2P'] text-[20px] text-black leading-none">-</p>
        </button>

        {/* 현재 위치 버튼 */}
        <button
          onClick={() => setZoomLevel(1)}
          className="w-12 h-12 bg-white rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center hover:scale-105 active:translate-y-1 active:shadow-[2px_2px_0px_0px_black] transition-all"
        >
          <div className="w-2 h-2 bg-[#00d9ff] rounded-full border-[2px] border-black relative">
            <div className="absolute inset-0 bg-[#00d9ff] rounded-full animate-ping opacity-75" />
          </div>
        </button>
      </div>

      {/* 하단 길찾기 버튼 */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 bg-gradient-to-t from-white via-white to-transparent pt-8 z-10">
        <button
          onClick={() => onNavigate('map')}
          className="w-full h-16 rounded-[16px] border-[3.4px] border-black font-['Press_Start_2P'] text-[14px] bg-[#00d9ff] text-white shadow-[6px_6px_0px_0px_black] active:translate-y-1 active:shadow-[3px_3px_0px_0px_black] transition-all flex items-center justify-center gap-2"
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
