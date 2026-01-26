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
  // 경로 정보 렌더링을 위한 콜백
  renderRouteTimeline?: (player: Player) => React.ReactNode;
}

// 숫자 이모지 배열 (1~10)
const NUMBER_EMOJIS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

// 플레이어 고정 순서
const PLAYER_ORDER: Player[] = ['user', 'bot1', 'bot2'];

// 색상 스키마 매핑 함수
const getColorScheme = (color: CharacterColor) => {
  switch (color) {
    case 'green':
      return { bg: '#34d399', line: '#10b981' };
    case 'purple':
      return { bg: '#a78bfa', line: '#8b5cf6' };
    case 'yellow':
      return { bg: '#ffc107', line: '#ffd93d' };
    case 'pink':
    default:
      return { bg: '#ff6b9d', line: '#fb64b6' };
  }
};

export function HorizontalRanking({
  rankings,
  playerColors,
  selectedPlayer,
  onSelect,
  isExpanded = false,
  onToggleExpand,
  renderRouteTimeline
}: HorizontalRankingProps) {
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

  // 플레이어 순서대로 정렬된 랭킹 (나, 봇1, 봇2 순서 고정)
  const orderedRankings = PLAYER_ORDER.map(player =>
    rankings.find(r => r.player === player)
  ).filter((r): r is RankingInfo => r !== undefined);

  // 버튼 클릭 핸들러 (선택 + 펼치기/접기)
  const handleToggleExpand = (player: Player) => {
    if (selectedPlayer === player && isExpanded) {
      // 이미 선택된 상태에서 클릭하면 접기
      onToggleExpand?.();
    } else {
      // 다른 플레이어 선택 또는 접힌 상태에서 클릭하면 선택 후 펼치기
      onSelect(player);
      if (!isExpanded) {
        onToggleExpand?.();
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* 플레이어 선택 버튼들 - 펼쳐졌을 때만 선택 효과 적용 */}
      <div className="flex gap-2">
        {orderedRankings.map((r) => {
          const isSelected = selectedPlayer === r.player;
          const playerColor = playerColors[r.player];
          const playerColorScheme = getColorScheme(playerColor);

          // isExpanded가 false면 모든 버튼 동일하게 표시, true면 선택된 것만 강조
          const shouldHighlight = !isExpanded || isSelected;

          return (
            <button
              key={r.player}
              onClick={() => onSelect(r.player)}
              className={`flex-1 rounded-[10px] border border-black/20 backdrop-blur-lg shadow-lg p-3 transition-all ${
                shouldHighlight
                  ? 'opacity-100'
                  : 'opacity-40 grayscale'
              } ${isExpanded && isSelected ? 'scale-105' : ''}`}
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

      {/* 모든 플레이어의 카드들 - 고정 순서 (나, 봇1, 봇2) */}
      <div className="flex flex-col gap-3">
        {orderedRankings.map((r) => {
          const playerColor = playerColors[r.player];
          const colorScheme = getColorScheme(playerColor);
          const progressPercent = Math.round(r.progress * 100);
          const isSelected = selectedPlayer === r.player;
          const isThisExpanded = isExpanded && isSelected;

          return (
            <div key={r.player} className="flex flex-col gap-3">
              {/* 플레이어 카드 - 고정 크기 */}
              <div
                className={`rounded-[10px] border border-black/20 backdrop-blur-lg shadow-lg p-4 transition-all ${
                  isExpanded && !isSelected ? 'opacity-40 grayscale' : 'opacity-100'
                }`}
                style={{ backgroundColor: colorScheme.bg }}
              >
                <div className="flex items-center gap-3">
                  {/* 왼쪽: 순위 아이콘 */}
                  <div className="bg-white size-[48px] border-[3px] border-black flex items-center justify-center shrink-0 rounded-lg shadow-md">
                    <p className="text-[24px]">
                      {NUMBER_EMOJIS[r.rank - 1] || `${r.rank}`}
                    </p>
                  </div>

                  {/* 중앙: 정보 */}
                  <div className="flex-1 flex flex-col gap-2">
                    {/* 플레이어 이름 */}
                    <p className="font-['Wittgenstein',sans-serif] text-[14px] text-black font-semibold">
                      {r.name}
                    </p>

                    {/* 진행률 정보 */}
                    <div className="flex gap-2 flex-wrap">
                      <div className="bg-[#ffd93d] h-[24px] px-[10px] py-[4px] flex items-center justify-center rounded-md">
                        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-tight font-semibold">
                          진행률: {progressPercent}%
                        </p>
                      </div>
                      {r.isArrived && (
                        <div className="bg-green-500 h-[24px] px-[10px] py-[4px] border-[3px] border-black flex items-center justify-center rounded-md">
                          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-tight font-semibold">
                            도착 완료
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 경로 정보 펼치기/접기 버튼 - 각 컨테이너 안에 */}
                    {onToggleExpand && (
                      <button
                        onClick={() => handleToggleExpand(r.player)}
                        className="w-full bg-white/80 backdrop-blur-sm rounded-[10px] p-2 border-2 border-black/30 shadow-md flex items-center justify-between transition-all hover:bg-white/90 active:scale-95"
                      >
                        <span className="font-['Wittgenstein',sans-serif] text-[12px] text-black font-semibold">
                          경로 정보 {isThisExpanded ? '접기' : '펼치기'}
                        </span>
                        <span className="text-[14px] transition-transform" style={{ transform: isThisExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                          ▼
                        </span>
                      </button>
                    )}
                  </div>

                  {/* 오른쪽: 캐릭터 이미지 */}
                  <div className="flex items-center justify-center shrink-0">
                    <div className="bg-white/80 backdrop-blur-sm rounded-[12px] p-2 border-2 border-black/30 shadow-md">
                      <img
                        src={`/src/assets/hud-player-helmet-${playerColor === 'pink' ? 'purple' : playerColor}.png`}
                        alt={r.name}
                        className="size-[40px] object-contain drop-shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 경로 타임라인 - 컨테이너 밖에, 흰색 배경으로 표시 */}
              {isThisExpanded && renderRouteTimeline && (
                <div className="bg-white/90 backdrop-blur-xl rounded-[12px] p-4 border border-gray-200 shadow-lg">
                  {renderRouteTimeline(r.player)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
