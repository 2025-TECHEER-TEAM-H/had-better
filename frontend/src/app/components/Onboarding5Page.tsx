import { useNavigate } from "react-router-dom";
import imgTerrainGrassHorizontalMiddle10 from "@/assets/terrain-grass-horizontal-middle.png";
import imgTerrainGrassCloudRight2 from "@/assets/terrain-grass-cloud-right.png";
import imgTerrainGrassCloudMiddle2 from "@/assets/terrain-grass-cloud-middle.png";
import imgTerrainGrassCloudLeft2 from "@/assets/terrain-grass-cloud-left.png";
import imgCharacterPinkWalkA1 from "@/assets/character-pink-walk.png";
import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface Onboarding5PageProps {
  isOpen?: boolean;
  onNext?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
}

export function Onboarding5Page({ isOpen = true, onNext, onSkip, onBack }: Onboarding5PageProps) {
  const navigate = useNavigate();

  const handleNext = () => onNext ? onNext() : navigate("/login");
  const handleSkip = () => onSkip ? onSkip() : navigate("/login");
  const handleBack = () => onBack ? onBack() : navigate("/onboarding/4");

  if (!isOpen) return null;

  return (
    <motion.div 
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#c5e7f5] to-white flex flex-col items-center justify-between overflow-hidden"
      initial={{ y: 0 }}
      exit={{ y: "-100%" }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
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
          자, 오늘의 승자는 누가 될까요
        </h1>

        {/* 서브 타이틀 */}
        <div className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[#767676] text-center mb-8 text-[20px] md:text-[40px] lg:text-[40px]">
          <p className="mb-0">준비가 됐다면 엔진을 켜고</p>
          <p>첫 번째 레이스를 시작해보세요!</p>
        </div>

        {/* 페이지 인디케이터 */}
        <div className="flex gap-[5.18px] mb-12">
          <div className="size-[19px] rounded-full bg-[#0A0A0A]" />
          <div className="size-[19px] rounded-full bg-[#0A0A0A]" />
          <div className="w-[20.73px] h-[19px] rounded-full bg-[#0A0A0A]" />
          <div className="size-[19px] rounded-full bg-[#0A0A0A]" />
          <div className="size-[19px] rounded-full bg-[#FF6B6B]" />
        </div>

        {/* 분홍 캐릭터 그룹 */}
        <div className="relative mb-8 w-[250px] h-[202px]">
          {/* 캐릭터 */}
          <motion.div 
            className="absolute left-1/2 -translate-x-1/2 top-0 w-[134px] h-[134px]"
            animate={{ 
              y: [0, -15, 0],
              rotate: [0, -3, 0, 3, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <img 
              alt="" 
              className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" 
              src={imgCharacterPinkWalkA1} 
            />
          </motion.div>

          {/* 플랫폼 왼쪽 */}
          <motion.div 
            className="absolute left-[20px] top-[130px] w-[70.106px] h-[70.106px]"
            animate={{ 
              y: [0, -8, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.1
            }}
          >
            <img 
              alt="" 
              className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" 
              src={imgTerrainGrassCloudLeft2} 
            />
          </motion.div>

          {/* 플랫폼 중간 */}
          <motion.div 
            className="absolute left-[90px] top-[130px] w-[70.106px] h-[70.106px]"
            animate={{ 
              y: [0, -8, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.2
            }}
          >
            <img 
              alt="" 
              className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" 
              src={imgTerrainGrassCloudMiddle2} 
            />
          </motion.div>

          {/* 플랫폼 오른쪽 */}
          <motion.div 
            className="absolute left-[160px] top-[130px] w-[69.947px] h-[69.947px]"
            animate={{ 
              y: [0, -8, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3
            }}
          >
            <img 
              alt="" 
              className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" 
              src={imgTerrainGrassCloudRight2} 
            />
          </motion.div>
        </div>

        {/* 시작 버튼 */}
        <button
          onClick={handleNext}
          className="bg-[#212121] hover:bg-[#333333] active:bg-[#000000] transition-colors h-[50px] rounded-[29px] w-[308px] max-w-[calc(100%-40px)] flex items-center justify-center cursor-pointer"
        >
          <p className="font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal text-[20px] text-white">
            시작
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
    </motion.div>
  );
}