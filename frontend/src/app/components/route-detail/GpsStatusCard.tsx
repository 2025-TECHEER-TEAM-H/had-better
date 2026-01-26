interface GpsStatusCardProps {
  isOffRoute: boolean;
  distanceFromRoute: number | null;
  isUserArrived: boolean;
  isGpsTracking: boolean;
  isGpsTestMode: boolean;
  distanceToDestination: number | null;
  onStartGpsTracking: () => void;
  onStopGpsTracking: () => void;
  onStartGpsTestMode: () => void;
  onStopGpsTestMode: () => void;
  onResetGpsTestMode: () => void;
  onOpenResultPopup: () => void;
}

export function GpsStatusCard({
  isOffRoute,
  distanceFromRoute,
  isUserArrived,
  isGpsTracking,
  isGpsTestMode,
  distanceToDestination,
  onStartGpsTracking,
  onStopGpsTracking,
  onStartGpsTestMode,
  onStopGpsTestMode,
  onResetGpsTestMode,
  onOpenResultPopup,
}: GpsStatusCardProps) {
  return (
    <div className="bg-white/20 backdrop-blur-xl rounded-[24px] p-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/30 mb-4 flex flex-col gap-4">
      {/* 상단 상태 라인 */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isGpsTestMode ? 'bg-purple-500 animate-pulse' : isGpsTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`} />
          <span className="text-[14px] font-bold text-gray-700">
            {isGpsTestMode ? '테스트 모드 가동 중' : isGpsTracking ? 'GPS 실시간 추적 중' : '위치 서비스 중단됨'}
          </span>
        </div>

        {distanceToDestination !== null && (
          <div className="bg-white/30 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1 border border-white/30 shadow-sm">
            <span className="text-[14px] font-black italic text-gray-800 tracking-tight">
              🏁 {distanceToDestination >= 1000
                ? `${(distanceToDestination / 1000).toFixed(1)}km`
                : `${distanceToDestination}m`}
            </span>
          </div>
        )}
      </div>

      {/* 버튼 영역 */}
      <div className="flex gap-2">
        <button
          onClick={isGpsTracking ? onStopGpsTracking : onStartGpsTracking}
          disabled={isGpsTestMode}
          className={`flex-1 rounded-[16px] py-3.5 flex items-center justify-center gap-2 font-bold transition-all active:scale-95 backdrop-blur-xl border ${
            isGpsTracking
              ? 'bg-red-500/20 text-red-700 border-red-400/30'
              : 'bg-green-500/20 text-green-700 border-green-400/30'
          } ${isGpsTestMode ? 'opacity-50 grayscale' : ''} shadow-sm`}
        >
          <span className="text-[16px]">🛰️</span>
          <span className="text-[14px]">{isGpsTracking ? '추적 중지' : '실제 GPS 시작'}</span>
        </button>

        <button
          onClick={isGpsTestMode ? onStopGpsTestMode : onStartGpsTestMode}
          disabled={isGpsTracking}
          className={`flex-1 rounded-[16px] py-3.5 flex items-center justify-center gap-2 font-bold transition-all active:scale-95 backdrop-blur-xl border ${
            isGpsTestMode
              ? 'bg-red-500/20 text-red-700 border-red-400/30'
              : 'bg-purple-500/20 text-purple-700 border-purple-400/30'
          } ${isGpsTracking ? 'opacity-50 grayscale' : ''} shadow-sm`}
        >
          <span className="text-[16px]">🧪</span>
          <span className="text-[14px]">{isGpsTestMode ? '중단' : '시뮬레이션'}</span>
        </button>

        <button
          onClick={onResetGpsTestMode}
          className="w-[52px] rounded-[16px] bg-white/30 backdrop-blur-xl border border-white/40 shadow-sm flex items-center justify-center transition-all active:scale-90"
        >
          <span className="text-blue-500 text-[18px]">🔄</span>
        </button>
      </div>

      {/* 경고 알림들 (필요시 표시) */}
      {isOffRoute && (
        <div className="bg-red-500/20 backdrop-blur-xl p-2 rounded-[12px] border border-red-400/30 flex items-center justify-center gap-2 shadow-sm">
          <span className="text-[14px]">⚠️</span>
          <p className="text-[12px] text-red-700 font-bold">경로 이탈 {distanceFromRoute}m</p>
        </div>
      )}

      {isUserArrived && (
        <button
          onClick={onOpenResultPopup}
          className="w-full bg-green-500/80 backdrop-blur-sm text-white py-2 rounded-[12px] font-bold text-[13px] shadow-md border border-green-400/50 animate-bounce"
        >
          🎉 도착 완료! 결과 보기
        </button>
      )}
    </div>
  );
}
