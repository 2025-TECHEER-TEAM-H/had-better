import { useNavigate } from "react-router-dom";
import imgTerrainGrassHorizontalMiddle10 from "@/assets/terrain-grass-horizontal-middle.png";
import imgCharacterGreenDuck1 from "@/assets/character-green-duck.png";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface Onboarding1PageProps {
  isOpen?: boolean;
  onNext?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
}

export function Onboarding1Page({ isOpen = true, onNext, onSkip, onBack }: Onboarding1PageProps) {
  const navigate = useNavigate();

  // 라우터 기반 네비게이션 또는 props 사용
  const handleNext = () => onNext ? onNext() : navigate("/onboarding/2");
  const handleSkip = () => onSkip ? onSkip() : navigate("/login");
  const handleBack = () => onBack ? onBack() : navigate("/");

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
          className="font-['DNFBitBitv2',sans-serif] font-bold text-black text-center mb-8 text-[24px]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          만나게 되어 반가워요!
        </motion.h1>

        {/* 서브 타이틀 */}
        <motion.div 
          className="font-['Pretendard',sans-serif] font-medium text-[#767676] text-center mb-8 text-[18px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="mb-0">매일 반복되는 지루한 이동 시간,</p>
          <p>멍하니 창밖만 보고 계시진 않았나요?</p>
        </motion.div>

        {/* 페이지 인디케이터 */}
        <div className="flex gap-[5.18px] mb-12">
          <motion.div 
            className="size-[19px] rounded-full bg-[#FF6B6B]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="size-[19px] rounded-full bg-[#0A0A0A]" />
          <div className="w-[20.73px] h-[19px] rounded-full bg-[#0A0A0A]" />
          <div className="size-[19px] rounded-full bg-[#0A0A0A]" />
          <div className="size-[19px] rounded-full bg-[#0A0A0A]" />
        </div>

        {/* 캐릭터 */}
        <motion.div 
          className="relative mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.img 
            alt="캐릭터" 
            className="size-[202px] object-cover" 
            src={imgCharacterGreenDuck1}
            animate={{ 
              y: [0, -8, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
          {/* 그림자 */}
          <svg 
            className="absolute left-1/2 -translate-x-1/2 -bottom-[25px]" 
            width="110" 
            height="21" 
            viewBox="0 0 110 21" 
            fill="none"
          >
            <ellipse 
              cx="55" 
              cy="10.5" 
              rx="55" 
              ry="10.5" 
              fill="url(#paint0_linear)" 
              opacity="0.5" 
            />
            <defs>
              <linearGradient 
                id="paint0_linear" 
                x1="0" 
                y1="10.5" 
                x2="13.5459" 
                y2="42.4719" 
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#FFE53E" />
                <stop offset="1" stopColor="#8DB178" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* 다음 버튼 */}
        <motion.button
          onClick={handleNext}
          className="bg-[#212121] hover:bg-[#333333] active:bg-[#000000] transition-colors h-[50px] rounded-[29px] w-[308px] max-w-[calc(100%-40px)] flex items-center justify-center cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <p className="font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[18px] text-white">
            다음
          </p>
        </motion.button>
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