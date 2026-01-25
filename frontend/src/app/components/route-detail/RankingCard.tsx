import { Player, PLAYER_LABELS } from "@/stores/routeStore";
import { CharacterColor } from "@/components/MovingCharacter";

interface RankingCardProps {
  rankings: Array<{
    player: Player;
    progress: number;
    finishTime?: number;
  }>;
  playerColors: Record<Player, CharacterColor>;
  isRankingVisible: boolean;
  setIsRankingVisible: (visible: boolean) => void;
}

export function RankingCard({
  rankings,
  playerColors,
  isRankingVisible,
  setIsRankingVisible
}: RankingCardProps) {
  if (!isRankingVisible) return null;

  return (
    <div className="bg-white/20 backdrop-blur-xl rounded-[16px] border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] px-[19.366px] pt-[19.366px] pb-[12px] relative">
      <button
        onClick={() => setIsRankingVisible(false)}
        className="absolute top-2 right-2 w-[24px] h-[24px] rounded-full border border-white/40 backdrop-blur-md bg-white/30 flex items-center justify-center hover:bg-white/40 active:bg-white/50 transition-colors shadow-sm"
      >
        <span className="text-[12px] font-bold text-gray-700 drop-shadow-md">✕</span>
      </button>
      <p className="font-['Wittgenstein',sans-serif] text-[12px] text-gray-800 text-center leading-[18px] mb-[12px] drop-shadow-md font-bold">
        실시간 순위 🏆
      </p>

      <div className="flex flex-col gap-[7.995px]">
        {rankings.map(({ player, progress }, index) => {
          const playerColor = playerColors[player];
          const progressPercent = Math.round(progress * 100);
          const progressBarColor = playerColor === 'green' ? '#7ed321' :
                                   playerColor === 'pink' ? '#ff6b9d' :
                                   playerColor === 'yellow' ? '#ffd93d' :
                                   playerColor === 'purple' ? '#a78bfa' : '#7ed321';

          return (
            <div key={player} className="flex gap-[7.995px] items-center">
              <div className="bg-white/30 backdrop-blur-md w-[45px] h-[26px] border border-white/40 rounded-[6px] flex items-center justify-center shadow-sm">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-gray-800 leading-[12px] drop-shadow-md font-bold">
                  {index + 1}위
                </p>
              </div>
              <div className="w-[32px] h-[32px] flex items-center justify-center">
                <img
                  src={`/src/assets/hud-player-helmet-${playerColor === 'pink' ? 'purple' : playerColor}.png`}
                  alt={`${player} character`}
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              <div className="flex-1 bg-white/20 backdrop-blur-sm h-[18px] rounded-[6px] border border-white/30 overflow-hidden shadow-sm">
                <div
                  className="h-full transition-all duration-300 rounded-[4px] shadow-sm"
                  style={{ width: `${progressPercent}%`, backgroundColor: progressBarColor, opacity: 0.9 }}
                />
              </div>
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-gray-800 leading-[12px] w-[35px] text-right drop-shadow-md font-bold">
                {progressPercent}%
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
