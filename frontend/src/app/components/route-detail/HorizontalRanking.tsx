import { CharacterColor } from "@/components/MovingCharacter";
import { Player } from "@/stores/routeStore";
import { useEffect, useState } from "react";

interface RankingInfo {
  player: Player;
  progress: number;
  rank: number;
  name: string;
  totalTimeMinutes?: number;
  isArrived?: boolean;
  remainingMinutes?: number;
  timeDifference?: number | null;
  timeDifferenceText?: string | null;
}

interface HorizontalRankingProps {
  rankings: RankingInfo[];
  playerColors: Record<Player, CharacterColor>;
  selectedPlayer: Player;
  onSelect: (player: Player) => void;
}

export function HorizontalRanking({ rankings, playerColors, selectedPlayer, onSelect }: HorizontalRankingProps) {
  // 이전 순위 추적
  const [previousRanks, setPreviousRanks] = useState<Map<Player, number>>(new Map());
  // 순위 변경된 플레이어 (NEW 배지 표시)
  const [rankChangedPlayers, setRankChangedPlayers] = useState<Set<Player>>(new Set());

  // 순위 변경 감지
  useEffect(() => {
    const newRanks = new Map<Player, number>();
    const changed = new Set<Player>();

    rankings.forEach((r) => {
      const prevRank = previousRanks.get(r.player);
      newRanks.set(r.player, r.rank);

      // 순위가 변경되었고, 이전 순위가 존재하는 경우
      if (prevRank !== undefined && prevRank !== r.rank) {
        changed.add(r.player);
      }
    });

    setPreviousRanks(newRanks);

    // 순위 변경된 플레이어가 있으면 NEW 배지 표시
    if (changed.size > 0) {
      setRankChangedPlayers(changed);

      // 3초 후 배지 제거
      const timer = setTimeout(() => {
        setRankChangedPlayers((prev) => {
          const updated = new Set(prev);
          changed.forEach((player) => updated.delete(player));
          return updated;
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [rankings]);
  return (
    <div className="relative -mx-6 px-6">
      {/* 스크롤 인디케이터 - 왼쪽 페이드 */}
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white/40 via-white/20 to-transparent backdrop-blur-sm pointer-events-none z-20" />
      {/* 스크롤 인디케이터 - 오른쪽 페이드 */}
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/40 via-white/20 to-transparent backdrop-blur-sm pointer-events-none z-20" />

      <div
        className="flex gap-3 overflow-x-auto overflow-y-visible pb-4 pt-2 snap-x snap-mandatory touch-pan-x"
        style={{
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent'
        }}
      >
        {rankings.map((r) => {
        const color = playerColors[r.player];
        const isSelected = selectedPlayer === r.player;

        // 그라데이션 배경 색상 매핑
        const gradientBg = color === 'green'
          ? 'from-[#34d399] to-[#10b981]'
          : color === 'purple'
            ? 'from-[#a78bfa] to-[#8b5cf6]'
            : color === 'yellow'
              ? 'from-[#ffd93d] to-[#fbbf24]'
              : 'from-[#ff6b9d] to-[#ec4899]';

        // 테두리 색상 (선택됨: 흰색, 아니면 각 색상)
        const borderColor = isSelected
          ? 'border-white border-2 shadow-[0_0_0_2px_rgba(255,255,255,0.3)]'
          : color === 'green'
            ? 'border-green-300/50'
            : color === 'purple'
              ? 'border-purple-300/50'
              : color === 'yellow'
                ? 'border-yellow-300/50'
                : 'border-pink-300/50';

        const progressColor = color === 'green' ? '#10b981' :
                          color === 'purple' ? '#8b5cf6' :
                          color === 'yellow' ? '#fbbf24' :
                          '#ec4899';

        const progressPercent = Math.round(r.progress * 100);

        return (
          <div
            key={r.player}
            onClick={() => onSelect(r.player)}
            className={`bg-gradient-to-br ${gradientBg} backdrop-blur-xl w-[120px] min-h-[100px] flex-shrink-0 p-2.5 rounded-[16px] relative active:scale-[0.97] snap-center origin-center touch-manipulation transition-all ${
              isSelected
                ? `z-10 scale-110 shadow-2xl border-4 border-white ${borderColor}`
                : 'hover:scale-[1.02] opacity-40 grayscale-[0.5] border-2 border-white/20 shadow-md'
            }`}
          >
            <div className="flex flex-col gap-0.5 relative z-10">
              {/* 상단: 이름과 VIEWING/도착 태그 */}
              <div className="flex justify-between items-start gap-1">
                <span className="font-['Wittgenstein',sans-serif] text-[11px] font-bold text-white drop-shadow-md truncate flex-1">{r.name}</span>
                <div className="flex gap-1 flex-shrink-0">
                  {r.isArrived && (
                    <span className="bg-green-500/90 text-[7px] font-black px-1.5 py-0.5 rounded-[3px] text-white whitespace-nowrap border border-white/50 shadow-sm animate-pulse">도착</span>
                  )}
                  {isSelected && !r.isArrived && (
                    <span className="bg-white/90 text-[7px] font-black px-1 py-0.5 rounded-[3px] text-gray-900 whitespace-nowrap border border-white/50 shadow-sm">보는중</span>
                  )}
                </div>
              </div>

              {/* 진행률 정보 */}
              <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-1.5 py-0.5 rounded-[4px] border border-white/20">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0`} style={{ backgroundColor: progressColor }} />
                <span className="font-['Wittgenstein',sans-serif] text-[9px] text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">진행률: {progressPercent}%</span>
              </div>

              {/* 남은 시간 정보 */}
              {!r.isArrived && r.remainingMinutes !== undefined && (
                <div className="flex items-center gap-1 mt-0.5 bg-black/20 backdrop-blur-sm px-1.5 py-0.5 rounded-[4px] border border-white/20">
                  <span className="font-['Wittgenstein',sans-serif] text-[9px] text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">⏱️ 남은 시간: {r.remainingMinutes}분</span>
                </div>
              )}
              {r.isArrived && (
                <div className="flex items-center gap-1 mt-0.5 bg-black/20 backdrop-blur-sm px-1.5 py-0.5 rounded-[4px] border border-white/20">
                  <span className="font-['Wittgenstein',sans-serif] text-[9px] text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">✅ 도착 완료</span>
                </div>
              )}

              {/* 1위와의 시간 차이 - 큰 숫자로 강조 */}
              {r.timeDifferenceText && r.rank > 1 && (
                <div className="flex items-center justify-center mt-1">
                  {r.timeDifference && r.timeDifference > 0 ? (
                    <span className="font-['Wittgenstein',sans-serif] text-[24px] font-black text-red-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-none">
                      {r.timeDifferenceText.replace('+', '').replace('분', '')}분
                    </span>
                  ) : r.timeDifference && r.timeDifference < 0 ? (
                    <span className="font-['Wittgenstein',sans-serif] text-[24px] font-black text-green-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-none">
                      {r.timeDifferenceText.replace('-', '').replace('분', '')}분
                    </span>
                  ) : null}
                </div>
              )}

              {/* 진행률 바 */}
              <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden border border-white/20 mt-1">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{
                    width: `${progressPercent}%`,
                    backgroundColor: progressColor,
                  }}
                />
              </div>
            </div>

            {/* 하단: 순위와 캐릭터 */}
            <div className="mt-2 flex justify-between items-end relative z-10">
              <div className="flex items-center gap-1.5">
                <span className={`font-['Wittgenstein',sans-serif] text-[24px] font-black italic leading-none drop-shadow-sm transition-all ${
                  rankChangedPlayers.has(r.player)
                    ? 'text-white'
                    : 'text-white/20'
                }`}>{r.rank}위</span>
                {rankChangedPlayers.has(r.player) && (
                  <span className="bg-yellow-400 text-[8px] font-black px-1.5 py-0.5 rounded-[4px] text-gray-900 whitespace-nowrap border border-white/80 shadow-lg animate-pulse">
                    NEW
                  </span>
                )}
              </div>
              <div className="w-[36px] h-[36px] bg-white/40 backdrop-blur-md rounded-full p-0.5 border-2 border-white/50 flex-shrink-0 shadow-lg">
                <img
                  src={`/src/assets/hud-player-helmet-${color === 'pink' ? 'purple' : color}.png`}
                  alt="helmet"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
}
