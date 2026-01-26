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
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// 숫자 이모지 배열 (1~10)
const NUMBER_EMOJIS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

export function HorizontalRanking({ rankings, playerColors, selectedPlayer, onSelect, isExpanded = false, onToggleExpand }: HorizontalRankingProps) {
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

  // 선택된 플레이어 찾기
  const selectedRanking = rankings.find(r => r.player === selectedPlayer);
  if (!selectedRanking) return null;

  const color = playerColors[selectedRanking.player];
  const progressPercent = Math.round(selectedRanking.progress * 100);

  // 색상 스키마 매핑 (더 진한 색상)
  const colorScheme = color === 'green'
    ? { bg: '#34d399', line: '#10b981' }
    : color === 'purple'
      ? { bg: '#a78bfa', line: '#8b5cf6' }
      : color === 'yellow'
        ? { bg: '#ffc107', line: '#ffd93d' }
        : { bg: '#ff6b9d', line: '#fb64b6' };

  return (
    <div className="space-y-4">
      {/* 플레이어 선택 버튼들 */}
      <div className="flex gap-2">
        {rankings.map((r) => {
          const isSelected = selectedPlayer === r.player;
          const playerColor = playerColors[r.player];
          const playerColorScheme = playerColor === 'green'
            ? { bg: '#34d399', line: '#10b981' }
            : playerColor === 'purple'
              ? { bg: '#a78bfa', line: '#8b5cf6' }
              : playerColor === 'yellow'
                ? { bg: '#ffc107', line: '#ffd93d' }
                : { bg: '#ff6b9d', line: '#fb64b6' };

          return (
            <button
              key={r.player}
              onClick={() => {
                onSelect(r.player);
                if (onToggleExpand && isExpanded) {
                  onToggleExpand();
                }
              }}
              className={`flex-1 rounded-[10px] border border-black/20 backdrop-blur-lg shadow-lg p-3 transition-all ${
                isSelected
                  ? 'opacity-100 scale-105'
                  : 'opacity-50 hover:opacity-75'
              }`}
              style={{ backgroundColor: playerColorScheme.bg }}
            >
              <div className="flex items-center gap-2">
                <div className="bg-white size-[40px] border-[3px] border-black flex items-center justify-center shrink-0 rounded-lg shadow-md">
                  <p className="text-[20px]">
                    {NUMBER_EMOJIS[r.rank - 1] || `${r.rank}`}
                  </p>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black font-semibold">
                    {r.name}
                  </p>
                  <p className="font-['Wittgenstein',sans-serif] text-[10px] text-gray-600">
                    {r.rank}위
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 선택된 플레이어의 큰 카드 */}
      <div
        className="rounded-[10px] border border-black/20 backdrop-blur-lg shadow-lg p-4 md:p-5"
        style={{ backgroundColor: colorScheme.bg }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
          {/* 왼쪽: 순위 아이콘 */}
          <div className="flex items-center gap-3 md:flex-col md:items-start">
            <div className="bg-white size-[56px] md:size-[48px] border-[3px] border-black flex items-center justify-center shrink-0 rounded-lg shadow-md">
              <p className="text-[28px] md:text-[24px]">
                {NUMBER_EMOJIS[selectedRanking.rank - 1] || `${selectedRanking.rank}`}
              </p>
            </div>
          </div>

          {/* 중앙: 경로 정보 */}
          <div className="flex-1 flex flex-col gap-3 md:gap-2">
            <div className="flex items-start gap-3 md:gap-4">
              <div className="flex-1 flex flex-col gap-3 md:gap-2">
                {/* 플레이어 이름 */}
                <div className="flex gap-2 items-center">
                  <div
                    className="h-[3px] w-[16px] border-[0.673px] border-black rounded-full"
                    style={{ backgroundColor: colorScheme.line }}
                  />
                  <p className="font-['Wittgenstein',sans-serif] text-[14px] md:text-[12px] text-black font-semibold">
                    {selectedRanking.name}
                  </p>
                </div>

                {/* 진행률 정보 */}
                <div className="flex gap-2 flex-wrap">
                  <div className="bg-[#ffd93d] h-[28px] md:h-[20px] px-[12px] md:px-[9px] py-[6px] md:py-[5px] border-[3px] border-black flex items-center justify-center rounded-md">
                    <p className="font-['Wittgenstein',sans-serif] text-[14px] md:text-[12px] text-black leading-tight font-semibold">
                      진행률: {progressPercent}%
                    </p>
                  </div>
                  {selectedRanking.remainingMinutes !== undefined && !selectedRanking.isArrived && (
                    <div className="bg-white h-[28px] md:h-[20px] px-[12px] md:px-[9px] py-[6px] md:py-[5px] border-[3px] border-black flex items-center justify-center rounded-md">
                      <p className="font-['Wittgenstein',sans-serif] text-[14px] md:text-[12px] text-black leading-tight font-semibold">
                        남은 시간: {selectedRanking.remainingMinutes}분
                      </p>
                    </div>
                  )}
                  {selectedRanking.isArrived && (
                    <div className="bg-green-500 h-[28px] md:h-[20px] px-[12px] md:px-[9px] py-[6px] md:py-[5px] border-[3px] border-black flex items-center justify-center rounded-md">
                      <p className="font-['Wittgenstein',sans-serif] text-[14px] md:text-[12px] text-white leading-tight font-semibold">
                        도착 완료
                      </p>
                    </div>
                  )}
                </div>

                {/* 토글 버튼 */}
                {onToggleExpand && (
                  <button
                    onClick={onToggleExpand}
                    className="w-full bg-white/80 backdrop-blur-sm rounded-[12px] p-2 border-2 border-black/30 shadow-md flex items-center justify-between transition-all hover:bg-white/90 active:scale-95"
                  >
                    <span className="font-['Wittgenstein',sans-serif] text-[12px] text-black font-semibold">
                      경로 정보 {isExpanded ? '접기' : '펼치기'}
                    </span>
                    <span className="text-[16px] transition-transform" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      ▼
                    </span>
                  </button>
                )}
              </div>

              {/* 오른쪽: 캐릭터 이미지 */}
              <div className="flex items-center justify-center shrink-0">
                <div className="bg-white/80 backdrop-blur-sm rounded-[12px] p-2 md:p-2.5 border-2 border-black/30 shadow-md">
                  <img
                    src={`/src/assets/hud-player-helmet-${color === 'pink' ? 'purple' : color}.png`}
                    alt={selectedRanking.name}
                    className="size-[48px] md:size-[40px] object-contain drop-shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
