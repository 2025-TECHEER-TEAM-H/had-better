import { useNavigate } from "react-router-dom";
import imgTerrainGrassHorizontalMiddle10 from "@/assets/terrain-grass-horizontal-middle.png";
import imgHudPlayerHelmetPurple2 from "@/assets/hud-player-helmet-purple.png";
import imgHudPlayerHelmetGreen2 from "@/assets/hud-player-helmet-green.png";
import imgHudPlayerHelmetYellow2 from "@/assets/hud-player-helmet-yellow.png";
import { ArrowLeft } from "lucide-react";

interface Onboarding3PageProps {
  isOpen?: boolean;
  onNext?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
}

type MarkerVariant = "yellow" | "green" | "purple";

// Route curve (SVG coordinate space)
const ROUTE_W = 292;
const ROUTE_H = 60;
const ROUTE_SEG_1: [[number, number], [number, number], [number, number], [number, number]] = [
  [18, 38],
  [78, 14],
  [116, 14],
  [146, 30],
];
const ROUTE_SEG_2: [[number, number], [number, number], [number, number], [number, number]] = [
  [146, 30],
  [176, 46],
  [214, 46],
  [274, 22],
];

function bezier(p0: number, p1: number, p2: number, p3: number, t: number) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function routeYAtX(xTarget: number) {
  const seg = xTarget <= ROUTE_SEG_1[3][0] ? ROUTE_SEG_1 : ROUTE_SEG_2;
  const [p0, p1, p2, p3] = seg;
  // x(t) is monotonic increasing for these control points, so binary search is safe.
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    const x = bezier(p0[0], p1[0], p2[0], p3[0], mid);
    if (x < xTarget) lo = mid;
    else hi = mid;
  }
  const t = (lo + hi) / 2;
  return bezier(p0[1], p1[1], p2[1], p3[1], t);
}

function MarkerPin({
  variant,
  avatarSrc,
  size = 70,
}: {
  variant: MarkerVariant;
  avatarSrc: string;
  size?: number;
}) {
  const bg =
    variant === "yellow" ? "#ffd93d" :
    variant === "green" ? "#48d448" :
    "#a78bfa";
  // tuned for a cleaner, less "sticker-like" pin
  const border = 3;
  const innerBorder = 3;
  const innerSize = Math.round(size * 0.66);
  const pointerOuter = Math.round(size * 0.14);
  const pointerInner = Math.max(pointerOuter - 2, 7);
  const pointerHeight = Math.round(size * 0.19);
  const pointerTop = size - 6;
  const totalH = size + pointerHeight + 6;

  return (
    <div
      className="relative"
      style={{
        width: size,
        height: totalH,
        filter:
          "drop-shadow(0px 6px 0px rgba(0,0,0,0.18)) drop-shadow(0px 14px 18px rgba(0,0,0,0.12))",
      }}
    >
      {/* main circle */}
      <div
        className="absolute left-1/2 top-0 -translate-x-1/2 rounded-full border-[3px] border-black flex items-center justify-center overflow-hidden"
        style={{ width: size, height: size, background: bg }}
      >
        {/* subtle highlight */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 60% at 28% 25%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 60%)",
          }}
        />
        <div
          className="relative rounded-full bg-white border-[3px] border-black overflow-hidden flex items-center justify-center"
          style={{ width: innerSize, height: innerSize, padding: innerBorder }}
        >
          <img
            alt=""
            className="w-full h-full object-cover"
            src={avatarSrc}
          />
        </div>
      </div>

      {/* pointer (outer black) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          top: pointerTop,
          borderLeft: `${pointerOuter}px solid transparent`,
          borderRight: `${pointerOuter}px solid transparent`,
          borderTop: `${pointerHeight}px solid #000`,
        }}
      />

      {/* pointer (inner fill) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
        style={{
          top: pointerTop + 2,
          borderLeft: `${pointerInner}px solid transparent`,
          borderRight: `${pointerInner}px solid transparent`,
          borderTop: `${Math.max(pointerHeight - 3, 9)}px solid ${bg}`,
        }}
      />
    </div>
  );
}

export function Onboarding3Page({ isOpen = true, onNext, onSkip, onBack }: Onboarding3PageProps) {
  const navigate = useNavigate();

  const handleNext = () => onNext ? onNext() : navigate("/onboarding/4");
  const handleSkip = () => onSkip ? onSkip() : navigate("/login");
  const handleBack = () => onBack ? onBack() : navigate("/onboarding/2");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#c5e7f5] to-white flex flex-col items-center justify-between overflow-hidden">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={handleBack}
        className="absolute top-5 left-5 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors"
      >
        <ArrowLeft className="w-6 h-6 text-black" />
      </button>

      {/* 건너뛰기 버튼 */}
      <button
        onClick={handleSkip}
        className="absolute top-5 right-5 z-10 px-4 py-2 text-[#767676] hover:text-black transition-colors font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] text-[16px]"
      >
        건너뛰기
      </button>

      {/* 상단 컨텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-20">
        {/* 타이틀 */}
        <h1 className="font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-black text-center mb-8 text-[24px] md:text-[48px] lg:text-[48px]">
          당신의 길은 이제 레이싱 트랙입니다
        </h1>

        {/* 서브 타이틀 */}
        <div className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[#767676] text-center mb-8 text-[20px] md:text-[40px] lg:text-[40px]">
          <p className="mb-0">평범한 출근길을</p>
          <p>짜릿한 승부가 펼쳐지는 게임으로 바꿔 드릴게요.</p>
        </div>

        {/* 페이지 인디케이터 */}
        <div className="flex gap-[5.18px] mb-12">
          <div className="size-[19px] rounded-full bg-[#0A0A0A]" />
          <div className="size-[19px] rounded-full bg-[#0A0A0A]" />
          <div className="w-[20.73px] h-[19px] rounded-full bg-[#FF6B6B]" />
          <div className="size-[19px] rounded-full bg-[#0A0A0A]" />
          <div className="size-[19px] rounded-full bg-[#0A0A0A]" />
        </div>

        {/* 레이싱 맵 캐릭터 */}
        <div className="relative mb-8 w-[320px] max-w-[calc(100%-40px)] h-[210px] flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* cloud "track" (no ground) */}
            <div className="absolute left-1/2 -translate-x-1/2 bottom-[54px] w-[292px] h-[92px]">
              {/* shadow */}
              <div className="absolute inset-x-[10px] bottom-[8px] h-[18px] bg-black/10 blur-[16px] rounded-full" />

              {/* cloud body */}
              <div
                className="absolute inset-x-0 bottom-[18px] h-[56px] rounded-full border border-black/10"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(231,245,255,0.82))",
                  boxShadow:
                    "inset 0 -10px 18px rgba(180, 220, 245, 0.28), 0 8px 22px rgba(0,0,0,0.06)",
                }}
              />
              {/* soft rim highlight */}
              <div
                className="absolute inset-x-[10px] bottom-[44px] h-[22px] rounded-full"
                style={{
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.9), rgba(255,255,255,0))",
                  filter: "blur(0.5px)",
                }}
              />
              {/* cloud bumps */}
              <div className="absolute left-[18px] bottom-[46px] w-[62px] h-[38px] rounded-full bg-white/82 border border-black/10 blur-[0.2px]" />
              <div className="absolute left-[88px] bottom-[52px] w-[92px] h-[46px] rounded-full bg-white/80 border border-black/10 blur-[0.2px]" />
              <div className="absolute right-[28px] bottom-[48px] w-[72px] h-[42px] rounded-full bg-white/80 border border-black/10 blur-[0.2px]" />
              {/* tiny back puff for depth */}
              <div className="absolute left-[214px] bottom-[58px] w-[38px] h-[26px] rounded-full bg-white/55 border border-black/5 blur-[0.6px]" />

              {/* dashed route line + markers snapped to the curve (perfect alignment) */}
              <div
                className="absolute left-1/2 -translate-x-1/2 bottom-[28px]"
                style={{ width: ROUTE_W, height: ROUTE_H }}
              >
                <svg
                  className="absolute inset-0"
                  width={ROUTE_W}
                  height={ROUTE_H}
                  viewBox={`0 0 ${ROUTE_W} ${ROUTE_H}`}
                  fill="none"
                >
                  <path
                    d="M18 38 C 78 14, 116 14, 146 30 C 176 46, 214 46, 274 22"
                    stroke="rgba(31, 74, 47, 0.26)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray="6 10"
                  />
                  <path
                    d="M18 38 C 78 14, 116 14, 146 30 C 176 46, 214 46, 274 22"
                    stroke="rgba(255,255,255,0.55)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="6 10"
                  />
                </svg>

                {(() => {
                  const points = [
                    {
                      xPct: 0.18,
                      variant: "yellow" as const,
                      avatarSrc: imgHudPlayerHelmetYellow2,
                      size: 64,
                      scale: 1,
                      opacity: 1,
                    },
                    {
                      xPct: 0.5,
                      variant: "green" as const,
                      avatarSrc: imgHudPlayerHelmetGreen2,
                      size: 56,
                      scale: 0.9,
                      opacity: 0.9,
                    },
                    {
                      xPct: 0.82,
                      variant: "purple" as const,
                      avatarSrc: imgHudPlayerHelmetPurple2,
                      size: 64,
                      scale: 1,
                      opacity: 1,
                    },
                  ];

                  return points.map((p, idx) => {
                    const x = p.xPct * ROUTE_W;
                    const y = routeYAtX(x);
                    // A tiny nudge so the tip visually sits on top of the stroke.
                    const yVisual = y + 2;
                    return (
                      <div
                        key={idx}
                        className="absolute"
                        style={{
                          left: `${x}px`,
                          top: `${yVisual}px`,
                          transform: `translate(-50%, -100%) scale(${p.scale})`,
                          opacity: p.opacity,
                        }}
                      >
                        <MarkerPin variant={p.variant} avatarSrc={p.avatarSrc} size={p.size} />
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <p className="absolute left-1/2 -translate-x-1/2 bottom-[12px] text-center text-[12px] text-[#1f4a2f] opacity-70 font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif]">
              3개의 경로가 동시에 달려요
            </p>
          </div>
        </div>

        {/* 다음 버튼 */}
        <button
          onClick={handleNext}
          className="bg-[#212121] hover:bg-[#333333] active:bg-[#000000] transition-colors h-[50px] rounded-[29px] w-[308px] max-w-[calc(100%-40px)] flex items-center justify-center cursor-pointer"
        >
          <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[20px] text-white">
            다음
          </p>
        </button>
      </div>

      {/* 하단 잔디 배경 */}
      <div className="relative w-full h-[128px] flex-shrink-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-center w-[1184px]">
          {Array.from({ length: 13 }).map((_, index) => (
            <div key={index} className="relative shrink-0 size-[128px]">
              <img
                alt=""
                className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                src={imgTerrainGrassHorizontalMiddle10}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
