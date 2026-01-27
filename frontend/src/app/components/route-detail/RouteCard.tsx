import { Player, PLAYER_LABELS } from "@/stores/routeStore";
import { CharacterColor } from "@/components/MovingCharacter";
import { MODE_ICONS, secondsToMinutes, metersToKilometers } from "@/types/route";

interface RouteCardProps {
  player: Player;
  route: {
    routeLegId: number;
    legIndex: number;
    summary: any;
    detail: any;
  } | null;
  playerColor: CharacterColor;
  isLoadingDetails: boolean;
}

const PLAYER_GRADIENTS: Record<CharacterColor, string> = {
  green: 'from-[#7ed321] to-[#4a9960]',
  pink: 'from-[#ff6b9d] to-[#e84393]',
  yellow: 'from-[#ffd93d] to-[#f39c12]',
  purple: 'from-[#a78bfa] to-[#8b5cf6]',
};

export function RouteCard({
  player,
  route,
  playerColor,
  isLoadingDetails,
}: RouteCardProps) {
  if (!route || !route.summary) return null;

  const playerGradient = PLAYER_GRADIENTS[playerColor];
  const timeMinutes = secondsToMinutes(route.summary.totalTime);
  const distanceStr = metersToKilometers(route.summary.totalDistance);
  const isUser = player === "user";

  return (
    <div
      className={`bg-gradient-to-b ${playerGradient} rounded-[16px] border border-white/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] p-[23.364px] opacity-80`}
    >
      <div className="flex gap-[11.992px] items-center mb-[16px]">
        <div className="bg-white/30 backdrop-blur-md rounded-[12px] w-[48px] h-[48px] border border-white/40 flex items-center justify-center overflow-hidden shadow-sm">
          <img
            src={`/src/assets/hud-player-helmet-${playerColor === 'pink' ? 'purple' : playerColor}.png`}
            alt={`${player} character`}
            className="w-[36px] h-[36px] object-contain drop-shadow-md"
          />
        </div>
        <div className="flex-1">
          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[18px] mb-[3.997px] drop-shadow-md">
            {isUser ? `내 경로 (경로 ${route.legIndex + 1})` : `${PLAYER_LABELS[player]} 경로`}
          </p>
          <div className="flex gap-[3.997px]">
            <div className="bg-[#ffd93d]/40 backdrop-blur-md h-[24px] px-[12px] border border-white/40 rounded-[6px] flex items-center justify-center shadow-sm">
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[12px] drop-shadow-md font-bold">
                {timeMinutes}분
              </p>
            </div>
            <div className="bg-white/30 backdrop-blur-md h-[24px] px-[12px] border border-white/40 rounded-[6px] flex items-center justify-center shadow-sm">
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[12px] drop-shadow-md font-bold">
                {distanceStr}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[15px] mb-[8px]">
          이동 경로
        </p>
        <div className="flex flex-col gap-[12px]">
          {route.detail?.legs.map((leg: any, legIndex: number) => (
            <div key={legIndex} className="flex gap-[7.995px] items-start">
              <div className="bg-white/30 backdrop-blur-md w-[27.992px] h-[27.992px] rounded-[6px] border border-white/40 flex items-center justify-center shrink-0 shadow-sm">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[15px] drop-shadow-md font-bold">
                  {legIndex + 1}
                </p>
              </div>
              <div className="flex-1">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[14px] drop-shadow-md">
                  {MODE_ICONS[leg.mode] || "🚶"}{" "}
                  {leg.mode === "WALK"
                    ? `도보 이동 (${metersToKilometers(leg.distance)})`
                    : `${leg.route || leg.mode} (${secondsToMinutes(leg.sectionTime)}분)`}
                </p>
                <p className="font-['Wittgenstein',sans-serif] text-[10px] text-white/80 leading-[12px] mt-1 drop-shadow-sm">
                  {leg.start.name} → {leg.end.name}
                </p>
              </div>
            </div>
          ))}
          {!route.detail && isLoadingDetails && (
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white/80 drop-shadow-sm">
              경로 정보 로딩 중...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
