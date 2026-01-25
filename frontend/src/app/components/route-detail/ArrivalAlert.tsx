interface ArrivalAlertProps {
  playerName: string;
  remainingMinutes: number;
  onClose: () => void;
}

export function ArrivalAlert({ playerName, remainingMinutes, onClose }: ArrivalAlertProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border-4 border-yellow-400 animate-scaleIn">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🚨</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">도착 5분 전!</h3>
          <p className="text-gray-700 mb-1">
            <span className="font-semibold text-yellow-600">{playerName}</span>님의
          </p>
          <p className="text-gray-700 mb-4">
            예상 도착까지 약 <span className="font-bold text-2xl text-yellow-600">{remainingMinutes}</span>분 남았습니다
          </p>
          <button
            onClick={onClose}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-xl transition-colors shadow-lg"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
