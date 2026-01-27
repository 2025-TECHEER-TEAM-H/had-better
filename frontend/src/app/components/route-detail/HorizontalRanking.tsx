import { CharacterColor } from "@/components/MovingCharacter";
import { Player } from "@/stores/routeStore";
import { useEffect, useState } from "react";

// 숫자 이미지 import (1~10)
import imgNumber10 from "/assets/Double/hud_character_0.png"; // 10은 0 이미지 사용
import imgNumber1 from "/assets/Double/hud_character_1.png";
import imgNumber2 from "/assets/Double/hud_character_2.png";
import imgNumber3 from "/assets/Double/hud_character_3.png";
import imgNumber4 from "/assets/Double/hud_character_4.png";
import imgNumber5 from "/assets/Double/hud_character_5.png";
import imgNumber6 from "/assets/Double/hud_character_6.png";
import imgNumber7 from "/assets/Double/hud_character_7.png";
import imgNumber8 from "/assets/Double/hud_character_8.png";
import imgNumber9 from "/assets/Double/hud_character_9.png";

// 플레이어 캐릭터 이미지 import (RouteSelectionPage와 동일)
import imgBot1Character from "/assets/Double/hud_player_purple.png"; // 보라색 (봇1)
import imgUserCharacter from "/assets/playerB/hud_player_green.png"; // 초록색 (유저)
import imgBot2Character from "/assets/playerB/hud_player_yellow.png"; // 노란색 (봇2)

// 숫자 이미지 배열 (1~10)
const NUMBER_IMAGES = [
  imgNumber1,
  imgNumber2,
  imgNumber3,
  imgNumber4,
  imgNumber5,
  imgNumber6,
  imgNumber7,
  imgNumber8,
  imgNumber9,
  imgNumber10,
];

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

// 플레이어 고정 순서
const PLAYER_ORDER: Player[] = ['user', 'bot1', 'bot2'];

// 색상 스키마 매핑 함수
const getColorScheme = (color: CharacterColor) => {
  switch (color) {
    case 'green':
      return { bg: '#34d399', bgLight: 'rgba(52, 211, 153, 0.3)', line: '#10b981' };
    case 'purple':
      return { bg: '#a78bfa', bgLight: 'rgba(167, 139, 250, 0.3)', line: '#8b5cf6' };
    case 'yellow':
      return { bg: '#ffc107', bgLight: 'rgba(255, 193, 7, 0.3)', line: '#ffd93d' };
    case 'pink':
    default:
      return { bg: '#ff6b9d', bgLight: 'rgba(255, 107, 157, 0.3)', line: '#fb64b6' };
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
                <div
                  className="size-[40px] flex items-center justify-center shrink-0 rounded-[16px] shadow-[0px_10px_22px_rgba(0,0,0,0.14)]"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.60) 0%, rgba(255,255,255,0.40) 100%)",
                    backdropFilter: "blur(18px) saturate(160%)",
                    WebkitBackdropFilter: "blur(18px) saturate(160%)",
                    border: "1px solid rgba(255,255,255,0.50)",
                    boxShadow: "0 10px 22px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.35)",
                  }}
                >
                  {r.rank <= 10 ? (
                    <img
                      src={NUMBER_IMAGES[r.rank - 1]}
                      alt={`${r.rank}위`}
                      className="size-[28px] object-contain drop-shadow-sm"
                    />
                  ) : (
                    <p className="font-['Pretendard',sans-serif] text-[20px] text-black/90">
                      {r.rank}
                    </p>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-['Pretendard',sans-serif] text-[12px] font-bold text-black">
                    {r.name}
                  </p>
                  <p className="font-['Pretendard',sans-serif] text-[12px] font-medium text-gray-600">
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
                className={`relative rounded-[10px] border border-black/20 backdrop-blur-lg shadow-lg p-4 transition-all ${
                  isExpanded && !isSelected ? 'opacity-40 grayscale' : 'opacity-100'
                }`}
                style={{ backgroundColor: colorScheme.bg }}
              >
                {/* 왼쪽 상단: 순위 아이콘 */}
                <div
                  className="absolute top-3 left-3 size-[48px] flex items-center justify-center shrink-0 rounded-[16px] shadow-[0px_10px_22px_rgba(0,0,0,0.14)] z-10"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.60) 0%, rgba(255,255,255,0.40) 100%)",
                    backdropFilter: "blur(18px) saturate(160%)",
                    WebkitBackdropFilter: "blur(18px) saturate(160%)",
                    border: "1px solid rgba(255,255,255,0.50)",
                    boxShadow: "0 10px 22px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.35)",
                  }}
                >
                  {r.rank <= 10 ? (
                    <img
                      src={NUMBER_IMAGES[r.rank - 1]}
                      alt={`${r.rank}위`}
                      className="size-[32px] object-contain drop-shadow-sm"
                    />
                  ) : (
                    <p className="font-['Pretendard',sans-serif] text-[24px] text-black/90">
                      {r.rank}
                    </p>
                  )}
                </div>

                {/* 오른쪽 하단: 캐릭터 이미지 */}
                <div className="absolute bottom-3 right-3 flex items-center justify-center z-10">
                  <div className="bg-white/80 backdrop-blur-sm rounded-[12px] p-2 border-2 border-black/30 shadow-md">
                    {r.player === 'user' ? (
                      <img
                        src={imgUserCharacter}
                        alt={r.name}
                        className="size-[40px] object-contain drop-shadow-sm"
                      />
                    ) : r.player === 'bot1' ? (
                      <img
                        src={imgBot1Character}
                        alt={r.name}
                        className="size-[40px] object-contain drop-shadow-sm"
                      />
                    ) : (
                      <img
                        src={imgBot2Character}
                        alt={r.name}
                        className="size-[40px] object-contain drop-shadow-sm"
                      />
                    )}
                  </div>
                </div>

                {/* 중앙: 정보 */}
                <div className="flex flex-col gap-2 pr-[60px] pl-[60px]">
                  {/* 플레이어 이름 */}
                  <p className="font-['Pretendard',sans-serif] text-[14px] font-semibold text-black">
                    {r.name}
                  </p>

                  {/* 진행률 정보 */}
                  <div className="flex flex-col gap-2">
                    {/* 진행률 막대 그래프 */}
                    <div
                      className="relative w-full h-[32px] rounded-[6px] border-2 border-black/20 overflow-hidden backdrop-blur-sm"
                      style={{
                        backgroundColor: colorScheme.bgLight // 카드 배경색의 연한 버전
                      }}
                    >
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: colorScheme.line
                        }}
                      />
                      {/* 진행률 퍼센트 표시 */}
                      <div
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        style={{
                          left: `${Math.min(progressPercent + 2, 85)}%`
                        }}
                      >
                        <p className="font-['Pretendard',sans-serif] text-[12px] font-bold text-black whitespace-nowrap drop-shadow-sm">
                          {progressPercent}%
                        </p>
                      </div>
                    </div>
                    {r.isArrived && (
                      <div
                        className="relative bg-[#4a9960] h-[26px] px-[14px] py-[5px] border-2 border-black/30 flex items-center justify-center rounded-[12px] backdrop-blur-sm shadow-[0px_2px_8px_rgba(74,153,96,0.3),inset_0_1px_2px_rgba(255,255,255,0.25)] transform rotate-[-0.5deg]"
                        style={{
                          background: 'linear-gradient(135deg, rgba(74,153,96,0.95) 0%, rgba(61,127,80,0.95) 100%)',
                        }}
                      >
                        <p className="font-['Pretendard',sans-serif] text-[12px] font-bold text-white leading-tight relative z-10">
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
                      <span className="font-['Pretendard',sans-serif] text-[12px] font-bold text-black">
                        경로 정보 {isThisExpanded ? '접기' : '펼치기'}
                      </span>
                      <span className="text-[14px] transition-transform" style={{ transform: isThisExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                        ▼
                      </span>
                    </button>
                  )}
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
