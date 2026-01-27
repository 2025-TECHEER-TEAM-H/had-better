import { useNavigate } from "react-router-dom";
import svgPaths from "@/imports/svg-jxr8ghnz2z";
import imgTerrainGrassHorizontalMiddle10 from "@/assets/terrain-grass-horizontal-middle.png";
import imgCharacterYellowJump2 from "@/assets/character-yellow-jump.png";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface Onboarding2PageProps {
  isOpen?: boolean;
  onNext?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
}

export function Onboarding2Page({
  isOpen = true,
  onNext,
  onSkip,
  onBack,
}: Onboarding2PageProps) {
  const navigate = useNavigate();

  const handleNext = () => onNext ? onNext() : navigate("/onboarding/3");
  const handleSkip = () => onSkip ? onSkip() : navigate("/login");
  const handleBack = () => onBack ? onBack() : navigate("/onboarding/1");

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
        className="absolute top-5 right-5 z-10 px-4 py-2 text-[#767676] hover:text-black transition-colors font-['Pretendard',sans-serif] font-medium text-[16px]"
      >
        건너뛰기
      </button>

      {/* 상단 컨텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 pt-20">
        {/* 타이틀 */}
        <motion.h1
          className="font-['DNFBitBitv2',sans-serif] font-bold text-black text-center mb-8 text-[24px] md:text-[32px] lg:text-[38px]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          추천경로, 정말 가장 빠를까요?
        </motion.h1>

        {/* 서브 타이틀 */}
        <motion.div
          className="font-['Pretendard',sans-serif] font-medium text-[#767676] text-center mb-8 text-[18px] md:text-[22px] lg:text-[26px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="mb-0">지도 앱이 알려주는 결과,</p>
          <p>어떤 경로가 진짜 빠른지 직접 학인해 보세요.</p>
        </motion.div>

        {/* 페이지 인디케이터 */}
        <div className="flex gap-[5.18px] mb-12">
          <div className="size-[19px] rounded-full bg-[#0A0A0A]" />
          <motion.div
            className="size-[19px] rounded-full bg-[#FF6B6B]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="w-[20.73px] h-[19px] rounded-full bg-[#0A0A0A]" />
          <div className="size-[19px] rounded-full bg-[#0A0A0A]" />
          <div className="size-[19px] rounded-full bg-[#0A0A0A]" />
        </div>

        {/* 캐릭터와 화살표 */}
        <motion.div
          className="relative mb-8 h-[202px] w-[202px] flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* 화살표 SVG - 캐릭터 뒤쪽 배경 */}
          <div className="absolute left-[-30px] top-[-20px]">
            <motion.div
              className="rotate-[-27.246deg]"
              animate={{
                y: [0, -5, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              <svg
                width="166"
                height="261"
                viewBox="0 0 166 261"
                fill="none"
              >
                <g filter="url(#filter0_d_onboarding2)">
                  <path d={svgPaths.pd505f80} fill="#FFE53E" />
                  <path
                    d={svgPaths.p2b403800}
                    stroke="black"
                    strokeWidth="5"
                  />
                </g>
                <defs>
                  <filter
                    colorInterpolationFilters="sRGB"
                    filterUnits="userSpaceOnUse"
                    height="260.961"
                    id="filter0_d_onboarding2"
                    width="166.129"
                    x="0"
                    y="0"
                  >
                    <feFlood
                      floodOpacity="0"
                      result="BackgroundImageFix"
                    />
                    <feColorMatrix
                      in="SourceAlpha"
                      result="hardAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    />
                    <feOffset dy="6" />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite
                      in2="hardAlpha"
                      operator="out"
                    />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                      in2="BackgroundImageFix"
                      mode="normal"
                      result="effect1_dropShadow_onboarding2"
                    />
                    <feBlend
                      in="SourceGraphic"
                      in2="effect1_dropShadow_onboarding2"
                      mode="normal"
                      result="shape"
                    />
                  </filter>
                </defs>
              </svg>
            </motion.div>
          </div>

          {/* 캐릭터 */}
          <motion.div
            className="relative z-10"
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          >
            <img
              alt="캐릭터"
              className="size-[140px] object-cover"
              src={imgCharacterYellowJump2}
            />
            {/* 그림자 */}
            <svg
              className="absolute left-1/2 -translate-x-1/2 -bottom-[15px]"
              width="40"
              height="12"
              viewBox="0 0 40 12"
              fill="none"
            >
              <ellipse
                cx="20"
                cy="6"
                rx="20"
                ry="6"
                fill="#0B0B0B"
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* 다음 버튼 */}
        <motion.button
          onClick={handleNext}
          className="bg-[#212121] hover:bg-[#333333] active:bg-[#000000] transition-colors h-[50px] md:h-[60px] lg:h-[70px] rounded-[29px] w-[308px] md:w-[380px] lg:w-[450px] max-w-[calc(100%-40px)] flex items-center justify-center cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <p className="font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[18px] md:text-[22px] lg:text-[26px] text-white">
            다음
          </p>
        </motion.button>
      </div>

      {/* 하단 잔디 배경 */}
      <div className="relative w-full h-[128px] flex-shrink-0 overflow-hidden">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center justify-center w-[1184px]">
          {Array.from({ length: 13 }).map((_, index) => (
            <div
              key={index}
              className="relative shrink-0 size-[128px]"
            >
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