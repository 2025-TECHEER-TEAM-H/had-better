import imgCharacterGreenFront1 from "@/assets/character-green-front.png";
import imgCharacterPurpleFront1 from "@/assets/character-purple-front.png";
import imgCharacterYellowFront1 from "@/assets/character-yellow-front.png";
import imgGemBlue1 from "@/assets/gem-blue.png";
import imgStar1 from "@/assets/star.png";
import imgTerrainGrassHorizontalMiddle10 from "@/assets/terrain-grass-horizontal-middle.png";

function Frame() {
  return (
    <div className="h-[110px] md:h-[159px] relative shrink-0 w-full">
      {/* Distant hills behind characters (only inside character area, so it won't create a mid-screen band) */}
      <svg
        className="absolute inset-x-0 bottom-[10px] h-[90px] w-full pointer-events-none"
        aria-hidden="true"
        viewBox="0 0 390 90"
        preserveAspectRatio="none"
        style={{
          opacity: 0.35,
          filter: "blur(1.5px)",
          maskImage: "linear-gradient(to top, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)",
        }}
      >
        <path
          d="M0,72 C70,46 120,62 165,50 C220,35 250,44 295,55 C330,64 360,58 390,40 L390,90 L0,90 Z"
          fill="rgba(130, 197, 220, 0.45)"
        />
        <path
          d="M0,80 C75,60 125,74 175,64 C230,54 260,64 305,72 C338,78 365,76 390,68 L390,90 L0,90 Z"
          fill="rgba(130, 197, 220, 0.30)"
        />
      </svg>

      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[40px] md:pl-[60px] md:pr-[111px] py-[60px] md:py-[117px] relative size-full">
          <div className="mr-[-30px] md:mr-[-51px] relative shrink-0 size-[110px] md:size-[160.333px] z-10" data-name="character_green_front 1">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgCharacterGreenFront1} />
          </div>
          <div className="mr-[-30px] md:mr-[-51px] relative shrink-0 size-[110px] md:size-[160.333px] z-10" data-name="character_yellow_front 1">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgCharacterYellowFront1} />
          </div>
          <div className="mr-[-30px] md:mr-[-51px] relative shrink-0 size-[110px] md:size-[160.333px] z-10" data-name="character_purple_front 1">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgCharacterPurpleFront1} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-full">
      <div className="relative shrink-0 size-[90px] md:size-[128px]" data-name="terrain_grass_horizontal_middle 10">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[90px] md:size-[128px]" data-name="terrain_grass_horizontal_middle 9">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[90px] md:size-[128px]" data-name="terrain_grass_horizontal_middle 8">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[90px] md:size-[128px]" data-name="terrain_grass_horizontal_middle 7">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[90px] md:size-[128px]" data-name="terrain_grass_horizontal_middle 6">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[90px] md:size-[128px]" data-name="terrain_grass_horizontal_middle 4">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[90px] md:size-[128px]" data-name="terrain_grass_horizontal_middle 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[90px] md:size-[128px]" data-name="terrain_grass_horizontal_middle 3">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[90px] md:size-[128px]" data-name="terrain_grass_horizontal_middle 5">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[90px] md:size-[128px]" data-name="terrain_grass_horizontal_middle 11">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[90px] md:size-[128px]" data-name="terrain_grass_horizontal_middle 12">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[90px] md:size-[128px]" data-name="terrain_grass_horizontal_middle 13">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[90px] md:size-[128px]" data-name="terrain_grass_horizontal_middle 14">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col h-[200px] md:h-[268px] items-center justify-end left-0 right-0 z-10">
      <Frame />
      <Frame1 />
    </div>
  );
}

function StartButton() {
  return (
    <div className="relative bg-[#4a9960] content-stretch flex h-[74px] items-center justify-center px-[6px] rounded-[40.5px] w-full max-w-[360px] active:translate-y-[2px] transition-transform">
      <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
      <p className="font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold leading-[42px] not-italic relative shrink-0 text-[34px] text-center text-white tracking-[2px]">
        start
      </p>
    </div>
  );
}

export default function Mobile() {
  return (
    <div className="bg-gradient-to-b from-[#c5e7f5] relative size-full to-white" data-name="Mobile">
      <style>
        {`
          /* Landing-only motion (Mobile.tsx scope) */
          @keyframes hb-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }

          @keyframes hb-twinkle {
            0%, 100% { transform: scale(1); opacity: 0.65; }
            50% { transform: scale(1.03); opacity: 0.9; }
          }

          @keyframes hb-wiggle {
            0%, 100% { transform: rotate(-2deg); }
            50% { transform: rotate(2deg); }
          }

          .hb-animate-float { animation: hb-float 3.6s ease-in-out infinite; }
          .hb-animate-twinkle { animation: hb-twinkle 2.4s ease-in-out infinite; }
          .hb-animate-wiggle { animation: hb-wiggle 3.2s ease-in-out infinite; }

          @keyframes hb-cloud-drift {
            0% { transform: translateX(-18px); }
            50% { transform: translateX(18px); }
            100% { transform: translateX(-18px); }
          }

          .hb-cloud {
            position: absolute;
            height: 34px;
            border-radius: 9999px;
            background: rgba(255, 255, 255, 0.7);
            filter: blur(0.2px);
            box-shadow:
              0 6px 14px rgba(0, 0, 0, 0.06),
              inset 0 -3px 0 rgba(255, 255, 255, 0.35);
          }

          .hb-cloud::before,
          .hb-cloud::after {
            content: "";
            position: absolute;
            background: rgba(255, 255, 255, 0.72);
            border-radius: 9999px;
          }

          .hb-cloud::before {
            width: 34px;
            height: 34px;
            left: 18px;
            top: -14px;
          }

          .hb-cloud::after {
            width: 46px;
            height: 46px;
            left: 44px;
            top: -22px;
          }

          .hb-cloud-drift { animation: hb-cloud-drift 9s ease-in-out infinite; }
          .hb-cloud-drift-slow { animation: hb-cloud-drift 13s ease-in-out infinite; }

          @media (prefers-reduced-motion: reduce) {
            .hb-animate-float,
            .hb-animate-twinkle,
            .hb-animate-wiggle,
            .hb-cloud-drift,
            .hb-cloud-drift-slow {
              animation: none !important;
            }
          }

          /* Subtle title outline (avoid being too “sticker-like”) */
          .hb-title-outline {
            /* Keep it calm: no “sticker” outline, just soft depth + slight highlight */
            text-shadow:
              0 2px 0 rgba(255, 255, 255, 0.35),
              2px 3px 0 rgba(0, 0, 0, 0.18),
              0 10px 18px rgba(0, 0, 0, 0.12);
          }
        `}
      </style>
      <Frame3 />

      {/* Top tint overlay (adds a bit more sky depth without darkening the whole screen) */}
      <div
        className="absolute inset-x-0 top-0 h-[280px] pointer-events-none z-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, rgba(169, 217, 238, 0.55), rgba(255, 255, 255, 0))",
        }}
      />

      {/* Bottom tint overlay (reduces the “too white” empty feel near the ground) */}
      <div
        className="absolute inset-x-0 bottom-0 h-[240px] pointer-events-none z-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to top, rgba(169, 217, 238, 0.16), rgba(255, 255, 255, 0))",
        }}
      />

      {/* Clouds (background decoration) */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <div className="hb-cloud hb-cloud-drift" style={{ width: "120px", left: "18px", top: "86px", opacity: 0.7 }} />
        <div className="hb-cloud hb-cloud-drift-slow" style={{ width: "160px", right: "10px", top: "132px", opacity: 0.62 }} />
        <div className="hb-cloud hb-cloud-drift" style={{ width: "140px", left: "38px", top: "168px", opacity: 0.5 }} />
      </div>

      {/* Main content (mobile): title + hero in the upper area, CTA anchored just above the character layer */}
      <div
        className="absolute inset-x-0 top-0 bottom-[380px] flex flex-col items-center justify-center px-6 z-20"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
      >
        {/* Title + hero group centered in the available space (above CTA) */}
        <div className="w-full flex flex-col items-center">
          <p className="hb-title-outline hb-animate-float css-4hzbpn font-['DNFBitBitv2','Press_Start_2P:Regular',sans-serif] leading-[64px] not-italic text-[#1f4a2f] text-[62px] text-center tracking-[0.8px] pointer-events-none select-none">
            HAD
            <br aria-hidden="true" />
            BETTER
          </p>

          {/* Middle hero zone: fills the “empty” center without adding new functionality */}
          <div className="w-full flex items-center justify-center mt-4">
            <div className="relative w-full max-w-[380px] h-[120px]">
              <div className="hb-animate-twinkle absolute left-0 top-[10px] size-[60px] opacity-75 rotate-[-8deg] pointer-events-none">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgStar1} />
              </div>
              <div className="hb-animate-wiggle absolute right-0 top-0 size-[84px] opacity-85 rotate-[10deg] pointer-events-none">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgGemBlue1} />
              </div>

              <p className="absolute left-0 right-0 top-[42px] px-8 font-['Pretendard',sans-serif] font-bold leading-[26px] not-italic text-[20px] text-[#1f4a2f] text-center tracking-[0.2px]">
                선택 경로 실시간 비교
              </p>

              <p className="absolute left-0 right-0 top-[74px] px-8 font-['Pretendard',sans-serif] font-medium leading-[22px] not-italic text-[16px] text-[#1f4a2f] text-center opacity-70 tracking-[0.2px]">
                더 빠른 길, 지금 바로 확인해요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA cluster anchored above the character/ground layer (Frame3 is 268px tall) */}
      <div className="absolute inset-x-0 bottom-[300px] px-6 flex flex-col items-center z-30">
        <div className="w-full flex justify-center">
          <StartButton />
        </div>
        <p className="mt-3 px-2 font-['Pretendard',sans-serif] font-medium leading-[22px] not-italic text-[16px] text-[#1f4a2f] text-center opacity-60 tracking-[0.2px]">
          start를 눌러 시작하기
        </p>
      </div>
    </div>
  );
}
