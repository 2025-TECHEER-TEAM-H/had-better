interface BusInputModalProps {
  isOpen: boolean;
  busNumberInput: string;
  setBusNumberInput: (value: string) => void;
  trackedBusNumbers: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function BusInputModal({
  isOpen,
  busNumberInput,
  setBusNumberInput,
  trackedBusNumbers,
  onConfirm,
  onCancel,
}: BusInputModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
      <div className="bg-white/20 backdrop-blur-2xl rounded-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.3)] border border-white/40 p-8 max-w-[420px] w-full flex flex-col gap-6 animate-in zoom-in-95 duration-300">
        <div className="flex flex-col gap-2">
          <h3 className="font-['Wittgenstein',sans-serif] text-[22px] font-black text-gray-900">
            실시간 버스 추적 🚌
          </h3>
          <p className="font-['Wittgenstein',sans-serif] text-[14px] text-gray-500 font-medium">
            추적할 버스 번호를 입력하세요 (쉼표로 구분, 최대 5개)
          </p>
        </div>

        <div className="relative group">
          <input
            type="text"
            value={busNumberInput}
            onChange={(e) => setBusNumberInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onConfirm()}
            placeholder="예: 360, 472, 151"
            className="w-full px-6 py-4 bg-white/30 backdrop-blur-xl border border-white/40 rounded-[20px] font-['Wittgenstein',sans-serif] text-[16px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FFD93D]/60 focus:bg-white/40 transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
            autoFocus
          />
          <div className="absolute inset-0 rounded-[20px] border-2 border-[#FFD93D]/0 group-focus-within:border-[#FFD93D]/30 pointer-events-none transition-all" />
        </div>

        {trackedBusNumbers.length > 0 && (
          <div className="flex flex-col gap-3">
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-gray-400 font-bold px-1">현재 추적 중인 버스</p>
            <div className="flex flex-wrap gap-2">
              {trackedBusNumbers.map((num) => (
                <span
                  key={num}
                  className="px-4 py-1.5 bg-[#FFD93D]/20 backdrop-blur-sm text-[#D4AF37] font-black text-[13px] rounded-full border border-[#FFD93D]/30 shadow-sm"
                >
                  {num}번
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-4 bg-white/20 backdrop-blur-xl text-gray-700 font-black text-[15px] rounded-[20px] hover:bg-white/30 active:scale-95 transition-all border border-white/30 shadow-sm"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-[1.5] py-4 bg-[#FFD93D]/80 backdrop-blur-sm text-black font-black text-[15px] rounded-[20px] shadow-lg shadow-[#FFD93D]/30 hover:scale-[1.02] active:scale-95 transition-all border border-[#FFD93D]/50"
          >
            추적 시작하기 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
