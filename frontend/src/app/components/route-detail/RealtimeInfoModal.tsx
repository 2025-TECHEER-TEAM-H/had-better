import { Player } from "@/stores/routeStore";
import { CharacterColor } from "@/components/MovingCharacter";
import { BotStatusUpdateEvent } from "@/types/route";
import { metersToKilometers, formatDuration } from "@/types/route";

interface RankingInfo {
  player: Player;
  progress: number;
  rank: number;
  name: string;
}

interface RealtimeInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  rankings: RankingInfo[];
  playerColors: Record<Player, CharacterColor>;
  simulationStartTime: number | null;
  distanceToDestination: number | null;
  isOffRoute: boolean;
  distanceFromRoute: number | null;
  isGpsTracking: boolean;
  isGpsTestMode: boolean;
  botPositions: Map<number, BotStatusUpdateEvent>;
  departureName?: string;
  arrivalName?: string;
  createRouteResponse?: any; // CreateRouteResponse 타입
}

export function RealtimeInfoModal({
  isOpen,
  onClose,
  rankings,
  playerColors,
  simulationStartTime,
  distanceToDestination,
  isOffRoute,
  distanceFromRoute,
  isGpsTracking,
  isGpsTestMode,
  botPositions,
  departureName,
  arrivalName,
  createRouteResponse,
}: RealtimeInfoModalProps) {
  if (!isOpen) return null;

  // 경주 경과 시간 계산
  const elapsedTime = simulationStartTime
    ? Math.floor((Date.now() - simulationStartTime) / 1000)
    : 0;

  // 봇 상태 텍스트 변환
  const getStatusText = (status: string, vehicle?: any): string => {
    switch (status) {
      case 'WALKING':
        return '도보 이동 중';
      case 'WAITING_BUS':
        return '버스 대기 중';
      case 'RIDING_BUS':
        return vehicle ? `${vehicle.route || '버스'} 탑승 중` : '버스 탑승 중';
      case 'WAITING_SUBWAY':
        return '지하철 대기 중';
      case 'RIDING_SUBWAY':
        return vehicle ? `${vehicle.route || '지하철'} 탑승 중` : '지하철 탑승 중';
      case 'FINISHED':
        return '도착 완료';
      default:
        return '이동 중';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="relative w-full max-w-md bg-white/90 backdrop-blur-2xl rounded-t-[32px] shadow-[0_32px_64px_rgba(0,0,0,0.3)] border-t border-x border-white/50 max-h-[85vh] overflow-hidden flex flex-col animate-slide-up">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/30 backdrop-blur-sm">
          <h2 className="text-[20px] font-bold text-gray-900">실시간 정보</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 active:bg-white/40 border border-white/30 transition-colors shadow-sm"
          >
            <span className="text-gray-700 text-[18px]">✕</span>
          </button>
        </div>

        {/* 스크롤 가능한 컨텐츠 */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* 경주 경과 시간 */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-[20px] p-4 border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[18px]">⏱️</span>
              <span className="font-['Wittgenstein',sans-serif] text-[12px] font-medium text-gray-600">경주 경과 시간</span>
            </div>
            <p className="font-['Wittgenstein',sans-serif] text-[24px] font-black text-gray-900">
              {formatDuration(elapsedTime)}
            </p>
          </div>

          {/* 경로 정보 */}
          {(departureName || arrivalName) && (
            <div className="bg-white/20 backdrop-blur-xl rounded-[16px] p-4 border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[16px]">📍</span>
                <span className="font-['Wittgenstein',sans-serif] text-[12px] font-medium text-gray-600">경로</span>
              </div>
              <div className="space-y-1">
                <p className="font-['Wittgenstein',sans-serif] text-[13px] text-gray-800 font-semibold">
                  {departureName || '출발지'}
                </p>
                <div className="text-gray-400 text-center py-1">↓</div>
                <p className="font-['Wittgenstein',sans-serif] text-[13px] text-gray-800 font-semibold">
                  {arrivalName || '도착지'}
                </p>
              </div>
            </div>
          )}

          {/* 플레이어 현황 */}
          <div>
            <h3 className="font-['Wittgenstein',sans-serif] text-[14px] font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>📊</span>
              플레이어 현황
            </h3>
            <div className="space-y-3">
              {rankings.map((ranking) => {
                const color = playerColors[ranking.player];

                // 봇 정보 가져오기
                let botStatus = null;
                if (ranking.player !== 'user' && createRouteResponse) {
                  const botParticipants = createRouteResponse.participants.filter((p: any) => p.type === 'BOT') || [];
                  const botIndex = ranking.player === 'bot1' ? 0 : 1;
                  const botParticipant = botParticipants[botIndex];
                  if (botParticipant?.bot_id) {
                    botStatus = botPositions.get(botParticipant.bot_id);
                  }
                }

                return (
                  <div
                    key={ranking.player}
                    className="bg-white/20 backdrop-blur-xl rounded-[16px] p-4 border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          color === 'green' ? 'bg-green-500' :
                          color === 'purple' ? 'bg-purple-500' :
                          color === 'yellow' ? 'bg-yellow-500' :
                          'bg-pink-500'
                        }`} />
                        <span className="font-['Wittgenstein',sans-serif] text-[14px] font-bold text-gray-800">
                          {ranking.name}
                        </span>
                        <span className="font-['Wittgenstein',sans-serif] text-[11px] font-medium text-gray-700 bg-white/40 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/30 shadow-sm">
                          {ranking.rank}위
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-['Wittgenstein',sans-serif] text-[11px] text-gray-600">진행률</span>
                        <span className="font-['Wittgenstein',sans-serif] text-[13px] font-bold text-gray-900">
                          {Math.round(ranking.progress * 100)}%
                        </span>
                      </div>
                      {ranking.player === 'user' && distanceToDestination !== null && (
                        <div className="flex items-center justify-between">
                          <span className="font-['Wittgenstein',sans-serif] text-[11px] text-gray-600">남은 거리</span>
                          <span className="font-['Wittgenstein',sans-serif] text-[13px] font-bold text-gray-900">
                            {metersToKilometers(distanceToDestination)}
                          </span>
                        </div>
                      )}
                      {botStatus && (
                        <div className="flex items-center justify-between">
                          <span className="font-['Wittgenstein',sans-serif] text-[11px] text-gray-600">현재 상태</span>
                          <span className="font-['Wittgenstein',sans-serif] text-[11px] font-medium text-gray-700">
                            {getStatusText(botStatus.status, botStatus.vehicle)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 내 위치 정보 */}
          <div className="bg-white/20 backdrop-blur-xl rounded-[16px] p-4 border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
            <h3 className="font-['Wittgenstein',sans-serif] text-[14px] font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span>📍</span>
              내 위치 정보
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-['Wittgenstein',sans-serif] text-[11px] text-gray-600">GPS 상태</span>
                <span className="font-['Wittgenstein',sans-serif] text-[12px] font-medium text-gray-800">
                  {isGpsTestMode ? '테스트 모드' : isGpsTracking ? '실시간 추적 중' : 'GPS 꺼짐'}
                </span>
              </div>
              {isOffRoute && distanceFromRoute !== null && (
                <div className="flex items-center justify-between">
                  <span className="font-['Wittgenstein',sans-serif] text-[11px] text-gray-600">경로 이탈</span>
                  <span className="font-['Wittgenstein',sans-serif] text-[12px] font-bold text-red-600">
                    {metersToKilometers(distanceFromRoute)}
                  </span>
                </div>
              )}
              {!isOffRoute && (
                <div className="flex items-center justify-between">
                  <span className="font-['Wittgenstein',sans-serif] text-[11px] text-gray-600">경로 이탈</span>
                  <span className="font-['Wittgenstein',sans-serif] text-[12px] font-medium text-green-600">
                    없음
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
