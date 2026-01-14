import { useState } from "react";
import svgPaths from "../imports/svg-uqk4ub3bkc";

interface OnboardingPageProps {
  onComplete: () => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollPercentage = (target.scrollTop / (target.scrollHeight - target.clientHeight)) * 100;
    setScrollProgress(scrollPercentage);
  };

  const rabbitPosition = Math.min(scrollProgress * 0.8, 80); // 토끼가 0-80% 위치까지 이동

  return (
    <div className="relative size-full bg-gradient-to-b from-[#c5e7f5] via-white via-50% to-white overflow-hidden">
      {/* Skip Button */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 z-20 px-4 py-2 bg-white/90 rounded-xl border-[2px] border-black shadow-[0px_3px_0px_0px_rgba(0,0,0,0.3)] text-sm text-[#2d5f3f] font-['Press_Start_2P'] hover:translate-y-0.5 transition-all"
      >
        건너뛰기 →
      </button>

      {/* Scrollable Content */}
      <div 
        className="size-full snap-y snap-mandatory scrollbar-hide"
        style={{ overflowY: 'auto' }}
        onScroll={handleScroll}
      >
        {/* Section 1: 환영 */}
        <div className="min-h-full snap-start flex flex-col items-center justify-center px-8 relative">
          {/* 왼쪽 나무 */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 text-6xl opacity-70">
            🌲
          </div>
          
          {/* 오른쪽 나무 */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 text-6xl opacity-70">
            🌲
          </div>
          
          <div className="text-center space-y-6">
            <div className="text-8xl animate-bounce">👋</div>
            <h2 className="font-['Press_Start_2P'] text-3xl text-[#2d5f3f] leading-relaxed">
              환영합니다!
            </h2>
            <p className="text-lg text-[#6b9080] leading-relaxed">
              HAD BETTER와 함께<br />더 나은 길을 찾아보세요
            </p>
            <div className="text-4xl animate-bounce mt-8">⬇️</div>
          </div>
        </div>

        {/* Section 2: H팀 소개 */}
        <div className="min-h-full snap-start flex flex-col items-center justify-center px-8 relative">
          <div className="absolute left-8 top-1/4 text-6xl">🌲</div>
          <div className="absolute right-8 top-1/4 text-6xl">🌲</div>
          <div className="text-center space-y-6 z-10">
            <div className="text-8xl">👥</div>
            <h2 className="font-['Press_Start_2P'] text-2xl text-[#2d5f3f] leading-relaxed">
              H팀을<br />소개합니다
            </h2>
            <p className="text-base text-[#6b9080] leading-relaxed">
              더 나은 경로를 찾기 위해<br />모인 열정적인 팀입니다
            </p>
          </div>
          <div className="absolute left-12 bottom-1/4 text-6xl">🌲</div>
          <div className="absolute right-12 bottom-1/4 text-6xl">🌲</div>
        </div>

        {/* Section 3: 게임처럼 즐기는 길찾기 */}
        <div className="min-h-full snap-start flex flex-col items-center justify-center px-8 relative">
          <div className="absolute left-10 top-1/3 text-5xl">🌲</div>
          <div className="absolute right-10 top-1/3 text-5xl">🌲</div>
          <div className="text-center space-y-6 z-10">
            <div className="text-8xl">🎮</div>
            <h2 className="font-['Press_Start_2P'] text-2xl text-[#2d5f3f] leading-relaxed">
              게임처럼<br />즐기는 길찾기
            </h2>
            <p className="text-base text-[#6b9080] leading-relaxed">
              고스트와 경쟁하며<br />최적의 경로를 찾아보세요
            </p>
          </div>
          <div className="absolute left-14 bottom-1/3 text-5xl">🌲</div>
          <div className="absolute right-14 bottom-1/3 text-5xl">🌲</div>
        </div>

        {/* Section 4: 실시간 비교 */}
        <div className="min-h-full snap-start flex flex-col items-center justify-center px-8 relative">
          <div className="absolute left-8 top-1/4 text-6xl">🌲</div>
          <div className="absolute right-8 top-1/4 text-6xl">🌲</div>
          <div className="text-center space-y-6 z-10">
            <div className="text-8xl">⚡</div>
            <h2 className="font-['Press_Start_2P'] text-2xl text-[#2d5f3f] leading-relaxed">
              실시간<br />비교
            </h2>
            <p className="text-base text-[#6b9080] leading-relaxed">
              선택한 경로와<br />다른 경로를 실시간으로 비교
            </p>
          </div>
          <div className="absolute left-12 bottom-1/4 text-6xl">🌲</div>
          <div className="absolute right-12 bottom-1/4 text-6xl">🌲</div>
        </div>

        {/* Section 5: 성장하는 재미 */}
        <div className="min-h-full snap-start flex flex-col items-center justify-center px-8 relative">
          <div className="absolute left-10 top-1/3 text-5xl">🌲</div>
          <div className="absolute right-10 top-1/3 text-5xl">🌲</div>
          <div className="text-center space-y-6 z-10">
            <div className="text-8xl">🏆</div>
            <h2 className="font-['Press_Start_2P'] text-2xl text-[#2d5f3f] leading-relaxed">
              성장하는<br />재미
            </h2>
            <p className="text-base text-[#6b9080] leading-relaxed">
              기록을 갱신하고<br />더 나은 선택을 경험하세요
            </p>
            <button
              onClick={onComplete}
              className="mt-8 bg-gradient-to-b from-[#48d448] to-[#3db83d] px-8 py-4 rounded-3xl border-[3.4px] border-black shadow-[0px_8px_0px_0px_#2d8b2d,0px_16px_32px_0px_rgba(61,184,61,0.3)] active:translate-y-1 active:shadow-[0px_4px_0px_0px_#2d8b2d] transition-all"
            >
              <p className="font-['Press_Start_2P'] text-sm text-white">시작하기 🚀</p>
            </button>
          </div>
          <div className="absolute left-14 bottom-1/4 text-5xl">🌲</div>
          <div className="absolute right-14 bottom-1/4 text-5xl">🌲</div>
        </div>
      </div>

      {/* Walking Rabbit - 스크롤에 따라 이동 */}
      <div 
        className="fixed bottom-20 transition-all duration-300 ease-out z-30 pointer-events-none"
        style={{ 
          left: `${20 + rabbitPosition * 0.6}%`,
          transform: `translateX(-50%) ${scrollProgress > 50 ? 'scaleX(-1)' : ''}`
        }}
      >
        <div className="relative">
          {/* 토끼 캐릭터 */}
          <div className="w-20 h-20 relative animate-bounce">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 96 112">
              <path d={svgPaths.p108f7ff0} fill="#D4A574" />
              <path d={svgPaths.p3ea9e280} fill="#D4A574" />
              <path d={svgPaths.p22f98f00} fill="#C49764" />
              <path d={svgPaths.p2d24bbc0} fill="#B8845F" />
              <path d={svgPaths.pa445800} fill="#A57050" />
              <path d={svgPaths.p195ff040} fill="#B8845F" />
              <path d={svgPaths.p19932f1} fill="#A57050" />
              <path d={svgPaths.p2f6ffb00} fill="#D4A574" />
              <path d={svgPaths.p1e761100} fill="black" />
              <path d={svgPaths.p2d7fdd00} fill="black" />
              <path d={svgPaths.p2b48e500} fill="black" />
              <path d={svgPaths.p33334020} fill="#B8845F" />
              <path d={svgPaths.p5e0ea00} fill="#B8845F" />
            </svg>
          </div>
          {/* 그림자 */}
          <div className="absolute bg-black/20 blur-sm h-3 left-1/2 -translate-x-1/2 rounded-full bottom-0 w-12" />
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="flex gap-2">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                scrollProgress >= index * 20 && scrollProgress < (index + 1) * 20
                  ? "w-8 bg-[#2d5f3f]"
                  : "w-2 bg-[#6b9080]/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Ground decoration */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-[#5a9e6e] to-[#4a8d5e] border-t-[3px] border-black overflow-hidden pointer-events-none">
        <div className="absolute bg-gradient-to-b from-[#3d6e50] to-[#2d5f3f] h-[60px] left-[60px] rounded-t-full top-[17px] w-[250px]" />
        <div className="absolute bg-gradient-to-b from-[#3d6e50] to-[#2d5f3f] h-[60px] left-[27px] rounded-t-full top-[17px] w-[250px]" />
        {/* 왼쪽 나무 */}
        <p className="absolute text-4xl left-[25%] top-6 -translate-x-1/2">🌲</p>
        {/* 오른쪽 나무 */}
        <p className="absolute text-4xl right-[25%] top-6 translate-x-1/2">🌲</p>
      </div>

      {/* CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}