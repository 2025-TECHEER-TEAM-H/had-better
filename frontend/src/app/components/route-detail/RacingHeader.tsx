interface RacingHeaderProps {
  status: string;
  onCancel: () => void;
  onRealtimeInfo?: () => void;
}

export function RacingHeader({ status, onCancel, onRealtimeInfo }: RacingHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-white/80 backdrop-blur-xl rounded-full border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-black/80 rounded-full shadow-inner">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
        <span className="font-['Wittgenstein',sans-serif] text-[12px] font-bold text-white whitespace-nowrap">
          {status === 'FINISHED' ? '경기 종료' : '경기 중'}
        </span>
      </div>

      <button
        onClick={onCancel}
        className="px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full transition-all active:scale-95 active:bg-white/30 border border-white/30 touch-manipulation shadow-sm"
      >
        <span className="font-['Wittgenstein',sans-serif] text-[12px] font-medium text-gray-800 whitespace-nowrap">취소</span>
      </button>

      <button
        onClick={onRealtimeInfo}
        className="px-3 py-1.5 bg-[#FFD93D]/60 backdrop-blur-md rounded-full shadow-sm border border-[#FFD93D]/40 touch-manipulation active:scale-95 transition-all"
      >
        <span className="font-['Wittgenstein',sans-serif] text-[12px] font-bold text-gray-900 whitespace-nowrap">실시간 정보</span>
      </button>
    </div>
  );
}
