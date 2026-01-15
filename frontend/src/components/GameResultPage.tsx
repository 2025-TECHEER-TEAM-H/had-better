interface GameResultPageProps {
  onContinue: () => void;
  onNavigate: (page: string) => void;
}

export function GameResultPage({ onContinue, onNavigate }: GameResultPageProps) {
  // 랜덤 결과 생성 (나, 고스트1, 고스트2)
  const myTime = 18 * 60 + 30; // 18분 30초 (초 단위)
  const ghost1Time = 28 * 60 + 15; // 28분 15초
  const ghost2Time = 19 * 60 + 50; // 19분 50초

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}분 ${secs}초`;
  };

  const myDistance = "2.3 km";

  return (
    <div className="relative size-full bg-transparent overflow-hidden flex flex-col pointer-events-auto" style={{ pointerEvents: 'auto' }}>
      {/* Header */}
      <div className="bg-gradient-to-b from-[#7fb8cc] to-[#6ba9bd] border-b-[3px] border-black px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="w-8" />
          <h1 className="font-['Press_Start_2P'] text-sm text-white">Game Result</h1>
          <button
            onClick={onContinue}
            className="w-8 h-8 rounded-full bg-white/90 border-2 border-black flex items-center justify-center hover:scale-105 transition-all"
          >
            <span className="text-lg">✕</span>
          </button>
        </div>
      </div>

      {/* Result Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 space-y-6 pb-8">
        {/* 순위 표시 */}
        <div className="flex items-end justify-center gap-4 mb-4">
          {/* 2위 - 고스트2 */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#c0c0c0] to-[#a8a8a8] border-[3px] border-black flex items-center justify-center shadow-lg">
              <span className="text-3xl">🥈</span>
            </div>
            <p className="font-['Press_Start_2P'] text-xs text-[#2d5f3f] mt-2">2위</p>
            <p className="text-[10px] text-[#6b9080] mt-1">고스트2</p>
            <p className="font-['Press_Start_2P'] text-[8px] text-[#2d5f3f] mt-1">{formatTime(ghost2Time)}</p>
          </div>

          {/* 1위 - 나 */}
          <div className="flex flex-col items-center -mt-6">
            <div className="relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="text-2xl">⭐</span>
              </div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-b from-[#ffd700] to-[#f4c430] border-[4px] border-black flex items-center justify-center shadow-2xl">
                <span className="text-5xl">🏆</span>
              </div>
            </div>
            <p className="font-['Press_Start_2P'] text-base text-[#2d5f3f] mt-3">1위</p>
            <p className="text-xs text-[#6b9080] mt-1">나</p>
            <p className="font-['Press_Start_2P'] text-[10px] text-[#2d5f3f] mt-1">{formatTime(myTime)}</p>
          </div>

          {/* 3위 - 고스트1 */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#cd7f32] to-[#b5692d] border-[3px] border-black flex items-center justify-center shadow-lg">
              <span className="text-2xl">🥉</span>
            </div>
            <p className="font-['Press_Start_2P'] text-xs text-[#2d5f3f] mt-2">3위</p>
            <p className="text-[10px] text-[#6b9080] mt-1">고스트1</p>
            <p className="font-['Press_Start_2P'] text-[8px] text-[#2d5f3f] mt-1">{formatTime(ghost1Time)}</p>
          </div>
        </div>

        {/* 축하 메시지 */}
        <div className="bg-gradient-to-b from-[#7fb8cc] to-[#6ba9bd] w-full max-w-md px-6 py-4 rounded-2xl border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)]">
          <p className="font-['Press_Start_2P'] text-[10px] text-white text-center leading-relaxed">
            오늘은 내가 제일 먼저 도착했어요!
          </p>
          <p className="font-['Press_Start_2P'] text-xs text-white text-center mt-2">
            🌈BEST CHOICE!🌈
          </p>
        </div>

        {/* 기록 버튼들 */}
        <div className="w-full max-w-md space-y-3 mt-4">
          {/* 내 기록 */}
          <button className="bg-gradient-to-b from-[#ffd700] to-[#f4c430] w-full h-16 rounded-2xl border-[3.4px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] relative overflow-hidden hover:scale-105 transition-all">
            <div className="flex flex-col items-center justify-center">
              <p className="font-['Press_Start_2P'] text-[10px] text-[#2d5f3f]">내 기록</p>
              <p className="font-['Press_Start_2P'] text-sm text-[#2d5f3f] mt-1">{formatTime(myTime)}</p>
            </div>
          </button>

          {/* 고스트2 기록 */}
          <button className="bg-gradient-to-b from-[#ff94c2] to-[#ff6ba8] w-full h-16 rounded-2xl border-[3.4px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] relative overflow-hidden hover:scale-105 transition-all">
            <div className="flex flex-col items-center justify-center">
              <p className="font-['Press_Start_2P'] text-[10px] text-white">고스트2 기록</p>
              <p className="font-['Press_Start_2P'] text-sm text-white mt-1">{formatTime(ghost2Time)}</p>
            </div>
          </button>

          {/* 고스트1 기록 */}
          <button className="bg-gradient-to-b from-[#9ae6b4] to-[#68d391] w-full h-16 rounded-2xl border-[3.4px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] relative overflow-hidden hover:scale-105 transition-all">
            <div className="flex flex-col items-center justify-center">
              <p className="font-['Press_Start_2P'] text-[10px] text-[#2d5f3f]">고스트 1 기록</p>
              <p className="font-['Press_Start_2P'] text-sm text-[#2d5f3f] mt-1">{formatTime(ghost1Time)}</p>
            </div>
          </button>
        </div>

        {/* Continue Button */}
        <div className="w-full max-w-md space-y-3 mt-4">
          <button
            onClick={onContinue}
            className="bg-gradient-to-b from-[#48d448] to-[#3db83d] w-full h-14 rounded-3xl border-[3.4px] border-black shadow-[0px_8px_0px_0px_#2d8b2d,0px_16px_32px_0px_rgba(61,184,61,0.3)] relative overflow-hidden active:translate-y-1 active:shadow-[0px_4px_0px_0px_#2d8b2d] transition-all"
          >
            <p className="font-['Press_Start_2P'] text-base text-white text-center">Main</p>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="bg-gradient-to-b from-[#00d9ff] to-[#00b8d4] w-full h-14 rounded-3xl border-[3.4px] border-black shadow-[0px_8px_0px_0px_#0097a7,0px_16px_32px_0px_rgba(0,217,255,0.3)] relative overflow-hidden active:translate-y-1 active:shadow-[0px_4px_0px_0px_#0097a7] transition-all"
          >
            <p className="font-['Press_Start_2P'] text-base text-white text-center">Dashboard</p>
          </button>
        </div>
      </div>
    </div>
  );
}