import { useNavigate } from "react-router-dom";
import imgTerrainGrassHorizontalMiddle10 from "@/assets/terrain-grass-horizontal-middle.png";
import imgFlagRedB2 from "@/assets/flag-red.png";
import imgTerrainGrassHorizontalOverhangRight2 from "@/assets/terrain-grass-horizontal-overhang-right.png";
import imgTerrainGrassHorizontalOverhangLeft2 from "@/assets/terrain-grass-horizontal-overhang-left.png";
import imgHudCharacter12 from "@/assets/hud-character-1.png";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface Onboarding4PageProps {
  isOpen?: boolean;
  onNext?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
}

export function Onboarding4Page({ isOpen = true, onNext, onSkip, onBack }: Onboarding4PageProps) {
  const navigate = useNavigate();

  const handleNext = () => onNext ? onNext() : navigate("/onboarding/5");
  const handleSkip = () => onSkip ? onSkip() : navigate("/login");
  const handleBack = () => onBack ? onBack() : navigate("/onboarding/3");

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
          규칙은 단하나, 누구보다 빠르게 도착하는 것
        </motion.h1>

        {/* 서브 타이틀 */}
        <motion.div 
          className="font-['Pretendard',sans-serif] font-medium text-[#767676] text-center mb-8 text-[18px] md:text-[22px] lg:text-[26px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <p className="mb-0">실시간 순위를 확인해 경로를 지키세요</p>
          <p>1초의 차이가 당신의 전직을 바꿉니다</p>
        </motion.div>

        {/* 페이지 인디케이터 */}
        <div className="flex gap-[5.18px] mb-12">
          <div className="size-[19px] rounded-full bg-[#0A0A0A]" />
          <div className="size-[19px] rounded-full bg-[#0A0A0A]" />
          <div className="w-[20.73px] h-[19px] rounded-full bg-[#0A0A0A]" />
          <motion.div 
            className="size-[19px] rounded-full bg-[#FF6B6B]"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="size-[19px] rounded-full bg-[#0A0A0A]" />
        </div>

        {/* 1등 캐릭터 그룹 */}
        <motion.div 
          className="relative mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="w-[250px] h-[202px] relative mx-auto flex items-end justify-center">
            {/* 플랫폼 왼쪽 */}
            <motion.div 
              className="absolute left-[30px] bottom-0 w-[97px] h-[97px] z-30"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <img 
                alt="" 
                className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" 
                src={imgTerrainGrassHorizontalOverhangLeft2} 
              />
            </motion.div>

            {/* 플랫폼 오른쪽 */}
            <motion.div 
              className="absolute right-[30px] bottom-0 w-[97px] h-[97px] z-30"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <img 
                alt="" 
                className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" 
                src={imgTerrainGrassHorizontalOverhangRight2} 
              />
            </motion.div>

            {/* 캐릭터 */}
            <motion.div 
              className="absolute left-[-10px] bottom-[140px] w-[110px] h-[110px] z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <motion.img 
                alt="" 
                className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" 
                src={imgHudCharacter12}
                animate={{ 
                  y: [0, -6, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.8
                }}
              />
            </motion.div>

            {/* 깃발 */}
            <motion.div 
              className="absolute right-[45px] bottom-[90px] w-[110px] h-[110px] z-20"
              initial={{ scale: 0, rotate: -45 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.6
              }}
            >
              <motion.img 
                alt="" 
                className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" 
                src={imgFlagRedB2}
                animate={{ 
                  rotate: [0, 3, 0, -3, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </motion.div>
          </div>
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