import { useNavigate } from "react-router-dom";
import imgTerrainGrassHorizontalMiddle10 from "@/assets/terrain-grass-horizontal-middle.png";
import imgTerrainGrassHorizontalOverhangRight2 from "@/assets/terrain-grass-horizontal-overhang-right.png";
import imgTerrainGrassHorizontalOverhangLeft2 from "@/assets/terrain-grass-horizontal-overhang-left.png";
import imgHudPlayerHelmetPurple2 from "@/assets/hud-player-helmet-purple.png";
import imgHudPlayerHelmetGreen2 from "@/assets/hud-player-helmet-green.png";
import imgHudPlayerHelmetYellow2 from "@/assets/hud-player-helmet-yellow.png";
import imgEllipse6 from "@/assets/ellipse.png";
import imgHudCharacter12 from "@/assets/hud-character-1.png";
import imgHudCharacter22 from "@/assets/hud-character-2.png";
import imgHudCharacter32 from "@/assets/hud-character-3.png";
import svgPaths from "@/imports/svg-nlrrfs8dd7";
import { ArrowLeft } from "lucide-react";

interface Onboarding3PageProps {
  isOpen?: boolean;
  onNext?: () => void;
  onSkip?: () => void;
  onBack?: () => void;
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
        <div className="relative mb-8 h-[202px] w-[250px] flex items-center justify-center">
          {/* 맵 플랫폼 */}
          <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 flex items-center">
            <img 
              alt="" 
              className="w-[72.746px] h-[72.746px] object-cover" 
              src={imgTerrainGrassHorizontalOverhangLeft2} 
            />
            <img 
              alt="" 
              className="w-[72.912px] h-[72.912px] object-cover" 
              src={imgTerrainGrassHorizontalMiddle10} 
            />
            <img 
              alt="" 
              className="w-[72.912px] h-[72.912px] object-cover" 
              src={imgTerrainGrassHorizontalOverhangRight2} 
            />
          </div>

          {/* 그림자 타원 */}
          <div className="absolute bottom-[8px] left-1/2 -translate-x-1/2">
            <img 
              alt="" 
              className="w-[219px] h-[108px] object-contain" 
              src={imgEllipse6} 
            />
          </div>

          {/* 캐릭터 1 (노란색 - 왼쪽 앞) */}
          <div className="absolute left-[10px] top-[50px] z-30">
            <div className="relative">
              {/* 헬멧 배경 */}
              <svg className="absolute -left-[4px] -top-[4px] w-[79px] h-[96.603px]" fill="none" viewBox="0 0 79 96.6026">
                <path d={svgPaths.p2aaddf80} fill="#111111" />
              </svg>
              <img 
                alt="" 
                className="relative z-10 w-[67px] h-[67px] object-cover" 
                src={imgHudCharacter12} 
              />
              <img 
                alt="" 
                className="absolute top-[18px] left-[3px] w-[70px] h-[70px] object-cover" 
                src={imgHudPlayerHelmetYellow2} 
              />
            </div>
          </div>

          {/* 캐릭터 3 (초록색 - 중간 뒤) */}
          <div className="absolute left-[80px] top-[35px] z-20 opacity-90">
            <div className="relative">
              {/* 헬멧 배경 */}
              <svg className="absolute -left-[3px] -top-[3px] w-[44.653px] h-[52.256px]" fill="none" viewBox="0 0 44.6533 52.2557">
                <path d={svgPaths.p1f9e4f40} fill="#FF3C3C" />
              </svg>
              <img 
                alt="" 
                className="relative z-10 w-[30px] h-[30px] object-cover" 
                src={imgHudCharacter32} 
              />
              <img 
                alt="" 
                className="absolute top-[3px] left-[0px] w-[39.566px] h-[39.566px] object-cover" 
                src={imgHudPlayerHelmetGreen2} 
              />
            </div>
          </div>

          {/* 캐릭터 2 (보라색 - 오른쪽 앞) */}
          <div className="absolute right-[20px] top-[45px] z-25">
            <div className="relative">
              {/* 헬멧 배경 */}
              <svg className="absolute -left-[4px] -top-[3px] w-[53.648px] h-[63.87px]" fill="none" viewBox="0 0 53.6484 63.8701">
                <path d={svgPaths.pd907200} fill="#FF3C3C" />
              </svg>
              <img 
                alt="" 
                className="relative z-10 w-[50px] h-[50px] object-cover" 
                src={imgHudCharacter22} 
              />
              <img 
                alt="" 
                className="absolute top-[3px] left-[1px] w-[47.537px] h-[47.537px] object-cover" 
                src={imgHudPlayerHelmetPurple2} 
              />
            </div>
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