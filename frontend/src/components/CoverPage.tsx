import Container from "../imports/Container";

interface CoverPageProps {
  onGetStarted: () => void;
}

export function CoverPage({ onGetStarted }: CoverPageProps) {
  return (
    <div
      className="relative h-full w-full overflow-hidden pointer-events-auto"
      style={{
        background:
          "linear-gradient(180deg, #c5e7f5 0%, #e8f4f8 50%, white 100%)",
        pointerEvents: 'auto',
      }}
    >
      {/* 부드러운 구름들 */}
      <div className="absolute top-16 left-8 opacity-60 pointer-events-none">
        <div className="w-32 h-16 bg-white rounded-full blur-2xl" />
      </div>
      <div className="absolute top-24 right-12 opacity-50 pointer-events-none">
        <div className="w-40 h-20 bg-white rounded-full blur-2xl" />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative h-full flex flex-col items-center justify-between pt-8 pb-0 px-8 z-10">
        <div className="flex flex-col items-center">
          {/* 상단 - 지도 아이콘 + 태양 애니메이션 */}
          <div className="relative mb-8">
            {/* 태양: 1번 스타일 애니메이션 적용 */}
            <div className="absolute -top-4 -right-4 text-4xl z-20 animate-bounce-slow">
              ☀️
            </div>

            {/* 1번 스타일의 3D 주황색 상자와 내부 핀 아이콘 */}
            <div
              className="relative w-[120px] h-[120px] bg-gradient-to-br from-[#FFB88C] to-[#FF9A6C] rounded-3xl flex items-center justify-center animate-float-mini"
              style={{
                boxShadow:
                  "0 20px 40px rgba(255, 154, 108, 0.4), inset 0 -8px 16px rgba(0,0,0,0.1), inset 0 2px 8px rgba(255,255,255,0.5)",
              }}
            >
              {/* 1번 사진 내부의 지도 핀 아이콘 직접 구현 */}
              <svg
                className="w-16 h-16"
                viewBox="0 0 64 64"
                fill="none"
              >
                {/* 핀 몸체 (흰색) */}
                <path
                  d="M32 56C32 56 48 38 48 26C48 17.1634 40.8366 10 32 10C23.1634 10 16 17.1634 16 26C16 38 32 56 32 56Z"
                  fill="white"
                />
                {/* 핀 머리 (빨간색 점) */}
                <circle cx="32" cy="26" r="6" fill="#FF6B6B" />
              </svg>
            </div>
          </div>

          {/* 타이틀 */}
          <div className="mb-6 text-center">
            <h1 className="text-5xl font-black text-[#2d5f3f] mb-2 pixel-font tracking-wider leading-tight">
              HAD
              <br />
              BETTER
            </h1>
            <p className="text-base font-bold text-[#6b9080] pixel-font tracking-tight">
              선택 경로 실시간 비교
            </p>
          </div>

          {/* 설명 박스 */}
          <div className="relative mb-8">
            <div
              className="bg-white/90 border-3 border-black rounded-2xl px-8 py-4 backdrop-blur"
              style={{
                boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
                imageRendering: "pixelated",
              }}
            >
              <p className="text-sm font-bold text-[#5a5a5a] text-center pixel-font">
                🗺️ 더 나은 길을 찾아보세요
              </p>
            </div>
          </div>
        </div>

       {/* 중앙 - 토끼 캐릭터 (산 위) */}
        <div className="relative z-20 mb-[-40px]">
          {/* 왼쪽 큰 나무 */}
          <div className="absolute left-[-80px] bottom-0">
            <svg width="64" height="96" viewBox="0 0 32 48" style={{ imageRendering: 'pixelated' }}>
              <defs>
                <linearGradient id="bigTree1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2d5f3f" />
                  <stop offset="100%" stopColor="#1f4a2f" />
                </linearGradient>
                <linearGradient id="bigTrunk1" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6b4423" />
                  <stop offset="100%" stopColor="#5a3a1f" />
                </linearGradient>
              </defs>
              <rect x="12" y="32" width="8" height="16" fill="url(#bigTrunk1)" rx="3" />
              <rect x="4" y="20" width="24" height="16" fill="url(#bigTree1)" rx="4" />
              <rect x="6" y="10" width="20" height="14" fill="url(#bigTree1)" rx="4" />
              <rect x="10" y="2" width="12" height="12" fill="url(#bigTree1)" rx="4" />
            </svg>
          </div>

          {/* 오른쪽 큰 나무 */}
          <div className="absolute right-[-80px] bottom-0">
            <svg width="72" height="108" viewBox="0 0 36 54" style={{ imageRendering: 'pixelated' }}>
              <defs>
                <linearGradient id="bigTree2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3d6e50" />
                  <stop offset="100%" stopColor="#2d5f3f" />
                </linearGradient>
                <linearGradient id="bigTrunk2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6b4423" />
                  <stop offset="100%" stopColor="#5a3a1f" />
                </linearGradient>
              </defs>
              <rect x="14" y="38" width="8" height="16" fill="url(#bigTrunk2)" rx="3" />
              <rect x="6" y="24" width="24" height="18" fill="url(#bigTree2)" rx="4" />
              <rect x="8" y="12" width="20" height="16" fill="url(#bigTree2)" rx="4" />
              <rect x="12" y="4" width="12" height="12" fill="url(#bigTree2)" rx="4" />
            </svg>
          </div>

          {/* 토끼 뒤 중앙 나무 (약간 작음) */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[60px] z-[-1]">
            <svg width="48" height="72" viewBox="0 0 24 36" style={{ imageRendering: 'pixelated' }}>
              <defs>
                <linearGradient id="centerTree" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2d5f3f" />
                  <stop offset="100%" stopColor="#1f4a2f" />
                </linearGradient>
                <linearGradient id="centerTrunk" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#6b4423" />
                  <stop offset="100%" stopColor="#5a3a1f" />
                </linearGradient>
              </defs>
              <rect x="10" y="26" width="4" height="10" fill="url(#centerTrunk)" rx="2" />
              <rect x="4" y="16" width="16" height="12" fill="url(#centerTree)" rx="3" />
              <rect x="6" y="8" width="12" height="10" fill="url(#centerTree)" rx="3" />
              <rect x="8" y="2" width="8" height="8" fill="url(#centerTree)" rx="3" />
            </svg>
          </div>

          <div className="relative" style={{ imageRendering: 'pixelated' }}>
            <svg className="w-24 h-28" viewBox="0 0 48 56" fill="none">
              {/* 토끼 몸통 */}
              <rect x="12" y="32" width="24" height="20" fill="#d4a574" />
              <rect x="10" y="34" width="28" height="16" fill="#d4a574" />

              {/* 배 */}
              <rect x="16" y="36" width="16" height="12" fill="#c49764" />

              {/* 토끼 귀 - 왼쪽 */}
              <rect x="14" y="20" width="6" height="16" fill="#b8845f" />
              <rect x="15" y="22" width="4" height="12" fill="#a57050" />

              {/* 토끼 귀 - 오른쪽 */}
              <rect x="28" y="20" width="6" height="16" fill="#b8845f" />
              <rect x="29" y="22" width="4" height="12" fill="#a57050" />

              {/* 머리 */}
              <rect x="16" y="28" width="16" height="12" fill="#d4a574" />

              {/* 눈 - 왼쪽 */}
              <rect x="20" y="32" width="2" height="2" fill="black" />

              {/* 눈 - 오른쪽 */}
              <rect x="26" y="32" width="2" height="2" fill="black" />

              {/* 코 */}
              <rect x="23" y="36" width="2" height="2" fill="black" />

              {/* 팔 - 왼쪽 */}
              <rect x="4" y="40" width="8" height="8" fill="#b8845f" className="rounded-full" />

              {/* 팔 - 오른쪽 */}
              <rect x="36" y="40" width="8" height="8" fill="#b8845f" className="rounded-full" />
            </svg>

            {/* 그림자 */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black/20 rounded-full blur-md" />
          </div>
        </div>

        {/* 하단 버튼들 (산 위에) */}
        <div className="w-full max-w-[320px] relative z-50 pb-8">
          {/* 시작하기 버튼 */}
          <button
            onClick={onGetStarted}
            className="w-full h-16 mb-5 relative group overflow-hidden bg-gradient-to-b from-[#48d448] to-[#3db83d] border-4 border-black rounded-3xl"
            style={{
              boxShadow: '0 8px 0 #2d8b2d, 0 16px 32px rgba(61,184,61,0.3)',
              imageRendering: 'pixelated'
            }}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative text-white font-black text-xl pixel-font tracking-wider flex items-center justify-center gap-3">
              시작하기
              <span className="text-2xl">→</span>
            </span>
          </button>

          {/* 3개 아이콘 버튼 */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <button className="h-16 bg-gradient-to-b from-white to-[#f5f5f5] border-4 border-black rounded-2xl flex items-center justify-center text-3xl hover:scale-105 transition-transform"
              style={{
                boxShadow: '0 6px 0 #d0d0d0, 0 12px 24px rgba(0,0,0,0.1)',
                imageRendering: 'pixelated'
              }}>
              📍
            </button>
            <button className="h-16 bg-gradient-to-b from-white to-[#f5f5f5] border-4 border-black rounded-2xl flex items-center justify-center text-3xl hover:scale-105 transition-transform"
              style={{
                boxShadow: '0 6px 0 #d0d0d0, 0 12px 24px rgba(0,0,0,0.1)',
                imageRendering: 'pixelated'
              }}>
              🗺️
            </button>
            <button className="h-16 bg-gradient-to-b from-white to-[#f5f5f5] border-4 border-black rounded-2xl flex items-center justify-center text-3xl hover:scale-105 transition-transform"
              style={{
                boxShadow: '0 6px 0 #d0d0d0, 0 12px 24px rgba(0,0,0,0.1)',
                imageRendering: 'pixelated'
              }}>
              🧭
            </button>
          </div>

          {/* 하단 링크 */}
          <div className="flex items-center justify-center gap-4 text-[#6b9080]">
            <button className="text-sm font-medium pixel-font hover:underline">이용안내</button>
            <span className="text-sm font-bold">•</span>
            <button className="text-sm font-medium pixel-font hover:underline">개인정보처리방침</button>
          </div>
        </div>
      </div>

      {/* 픽셀 산 배경 - 여러 레이어 (Figma 디자인 참조) */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ imageRendering: 'pixelated' }}>
        {/* 뒷산 1 (가장 어두운) */}
        <svg className="absolute bottom-0 w-full" style={{ height: '45%' }} viewBox="0 0 400 180" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountain1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a9960" />
              <stop offset="100%" stopColor="#3d8651" />
            </linearGradient>
          </defs>
          <path d="M -50 180 L -50 60 Q 10 20, 75 50 Q 125 75, 175 40 L 175 180 Z"
                fill="url(#mountain1)" opacity="0.7" />
        </svg>

        <svg className="absolute bottom-0 w-full" style={{ height: '50%', left: '50%' }} viewBox="0 0 400 200" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountain2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a9960" />
              <stop offset="100%" stopColor="#3d8651" />
            </linearGradient>
          </defs>
          <path d="M 0 200 L 0 50 Q 50 10, 110 45 Q 170 80, 230 35 Q 290 5, 350 50 L 400 200 Z"
                fill="url(#mountain2)" opacity="0.7" />
        </svg>

        {/* 중간산 */}
        <svg className="absolute bottom-0 w-full" style={{ height: '38%', left: '20%' }} viewBox="0 0 400 150" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountain3" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7ec98f" />
              <stop offset="100%" stopColor="#6bb87c" />
            </linearGradient>
          </defs>
          <path d="M 0 150 L 0 50 Q 40 20, 90 45 Q 140 70, 190 40 Q 240 15, 290 55 L 350 150 Z"
                fill="url(#mountain3)" opacity="0.7" />
        </svg>

        {/* 앞산 (가장 밝은) */}
        <svg className="absolute bottom-0 w-full" style={{ height: '35%' }} viewBox="0 0 400 140" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountain4" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7ec98f" />
              <stop offset="100%" stopColor="#6bb87c" />
            </linearGradient>
          </defs>
          <path d="M 0 140 L 0 60 Q 60 30, 120 55 Q 180 80, 240 50 Q 300 25, 360 65 L 400 140 Z"
                fill="url(#mountain4)" opacity="0.85" />
        </svg>

        <svg className="absolute bottom-0 w-full" style={{ height: '33%', left: '50%' }} viewBox="0 0 400 130" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountain5" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7ec98f" />
              <stop offset="100%" stopColor="#6bb87c" />
            </linearGradient>
          </defs>
          <path d="M 0 130 L 0 55 Q 50 25, 105 50 Q 160 75, 215 45 Q 270 20, 325 60 L 380 130 Z"
                fill="url(#mountain5)" opacity="0.9" />
        </svg>

        {/* 나무들 */}
        <div className="absolute bottom-20 left-[8%]">
          <svg width="32" height="48" viewBox="0 0 16 24" style={{ imageRendering: 'pixelated' }}>
            <defs>
              <linearGradient id="tree1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2d5f3f" />
                <stop offset="100%" stopColor="#1f4a2f" />
              </linearGradient>
              <linearGradient id="trunk1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b4423" />
                <stop offset="100%" stopColor="#5a3a1f" />
              </linearGradient>
            </defs>
            <rect x="6" y="16" width="4" height="8" fill="url(#trunk1)" rx="2" />
            <rect x="2" y="10" width="12" height="8" fill="url(#tree1)" rx="2" />
            <rect x="4" y="5" width="8" height="7" fill="url(#tree1)" rx="2" />
            <rect x="5" y="1" width="6" height="6" fill="url(#tree1)" rx="2" />
          </svg>
        </div>

        <div className="absolute bottom-16 right-[25%]">
          <svg width="40" height="56" viewBox="0 0 20 28" style={{ imageRendering: 'pixelated' }}>
            <defs>
              <linearGradient id="tree2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2d5f3f" />
                <stop offset="100%" stopColor="#1f4a2f" />
              </linearGradient>
              <linearGradient id="trunk2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b4423" />
                <stop offset="100%" stopColor="#5a3a1f" />
              </linearGradient>
            </defs>
            <rect x="8" y="20" width="4" height="8" fill="url(#trunk2)" rx="2" />
            <rect x="3" y="13" width="14" height="9" fill="url(#tree2)" rx="2" />
            <rect x="5" y="7" width="10" height="8" fill="url(#tree2)" rx="2" />
            <rect x="7" y="2" width="6" height="7" fill="url(#tree2)" rx="2" />
          </svg>
        </div>

        <div className="absolute bottom-24 left-[35%]">
          <svg width="26" height="40" viewBox="0 0 13 20" style={{ imageRendering: 'pixelated' }}>
            <defs>
              <linearGradient id="tree3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2d5f3f" />
                <stop offset="100%" stopColor="#1f4a2f" />
              </linearGradient>
              <linearGradient id="trunk3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b4423" />
                <stop offset="100%" stopColor="#5a3a1f" />
              </linearGradient>
            </defs>
            <rect x="5" y="14" width="3" height="6" fill="url(#trunk3)" rx="1.5" />
            <rect x="2" y="9" width="9" height="6" fill="url(#tree3)" rx="2" />
            <rect x="3" y="5" width="7" height="5" fill="url(#tree3)" rx="2" />
            <rect x="4" y="1" width="5" height="5" fill="url(#tree3)" rx="2" />
          </svg>
        </div>

        {/* 추가 나무들 */}
        <div className="absolute bottom-14 left-[25%]">
          <svg width="28" height="42" viewBox="0 0 14 21" style={{ imageRendering: 'pixelated' }}>
            <defs>
              <linearGradient id="tree4" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2d5f3f" />
                <stop offset="100%" stopColor="#1f4a2f" />
              </linearGradient>
              <linearGradient id="trunk4" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b4423" />
                <stop offset="100%" stopColor="#5a3a1f" />
              </linearGradient>
            </defs>
            <rect x="6" y="15" width="2" height="6" fill="url(#trunk4)" rx="1" />
            <rect x="2" y="10" width="10" height="7" fill="url(#tree4)" rx="2" />
            <rect x="3" y="6" width="8" height="6" fill="url(#tree4)" rx="2" />
            <rect x="4" y="2" width="6" height="5" fill="url(#tree4)" rx="2" />
          </svg>
        </div>

        <div className="absolute bottom-18 left-[55%]">
          <svg width="24" height="36" viewBox="0 0 12 18" style={{ imageRendering: 'pixelated' }}>
            <defs>
              <linearGradient id="tree5" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3d6e50" />
                <stop offset="100%" stopColor="#2d5f3f" />
              </linearGradient>
              <linearGradient id="trunk5" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b4423" />
                <stop offset="100%" stopColor="#5a3a1f" />
              </linearGradient>
            </defs>
            <rect x="5" y="12" width="2" height="6" fill="url(#trunk5)" rx="1" />
            <rect x="2" y="8" width="8" height="5" fill="url(#tree5)" rx="1.5" />
            <rect x="3" y="5" width="6" height="4" fill="url(#tree5)" rx="1.5" />
            <rect x="4" y="2" width="4" height="4" fill="url(#tree5)" rx="1.5" />
          </svg>
        </div>

        <div className="absolute bottom-22 right-[15%]">
          <svg width="36" height="52" viewBox="0 0 18 26" style={{ imageRendering: 'pixelated' }}>
            <defs>
              <linearGradient id="tree6" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2d5f3f" />
                <stop offset="100%" stopColor="#1f4a2f" />
              </linearGradient>
              <linearGradient id="trunk6" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b4423" />
                <stop offset="100%" stopColor="#5a3a1f" />
              </linearGradient>
            </defs>
            <rect x="7" y="18" width="4" height="8" fill="url(#trunk6)" rx="2" />
            <rect x="3" y="12" width="12" height="8" fill="url(#tree6)" rx="2" />
            <rect x="4" y="7" width="10" height="7" fill="url(#tree6)" rx="2" />
            <rect x="6" y="2" width="6" height="6" fill="url(#tree6)" rx="2" />
          </svg>
        </div>

        <div className="absolute bottom-12 right-[45%]">
          <svg width="20" height="32" viewBox="0 0 10 16" style={{ imageRendering: 'pixelated' }}>
            <defs>
              <linearGradient id="tree7" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3d6e50" />
                <stop offset="100%" stopColor="#2d5f3f" />
              </linearGradient>
              <linearGradient id="trunk7" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b4423" />
                <stop offset="100%" stopColor="#5a3a1f" />
              </linearGradient>
            </defs>
            <rect x="4" y="11" width="2" height="5" fill="url(#trunk7)" rx="1" />
            <rect x="1" y="7" width="8" height="5" fill="url(#tree7)" rx="1.5" />
            <rect x="2" y="4" width="6" height="4" fill="url(#tree7)" rx="1.5" />
            <rect x="3" y="1" width="4" height="4" fill="url(#tree7)" rx="1.5" />
          </svg>
        </div>

        <div className="absolute bottom-26 left-[70%]">
          <svg width="30" height="44" viewBox="0 0 15 22" style={{ imageRendering: 'pixelated' }}>
            <defs>
              <linearGradient id="tree8" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2d5f3f" />
                <stop offset="100%" stopColor="#1f4a2f" />
              </linearGradient>
              <linearGradient id="trunk8" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b4423" />
                <stop offset="100%" stopColor="#5a3a1f" />
              </linearGradient>
            </defs>
            <rect x="6" y="16" width="3" height="6" fill="url(#trunk8)" rx="1.5" />
            <rect x="2" y="11" width="11" height="7" fill="url(#tree8)" rx="2" />
            <rect x="3" y="7" width="9" height="5" fill="url(#tree8)" rx="2" />
            <rect x="5" y="3" width="5" height="5" fill="url(#tree8)" rx="2" />
          </svg>
        </div>

        {/* 작은 관목들 */}
        <div className="absolute bottom-10 left-[18%]">
          <svg width="16" height="12" viewBox="0 0 8 6" style={{ imageRendering: 'pixelated' }}>
            <rect x="1" y="3" width="6" height="3" fill="#3d6e50" rx="1.5" />
            <rect x="2" y="1" width="4" height="3" fill="#3d6e50" rx="1.5" />
          </svg>
        </div>

        <div className="absolute bottom-8 right-[35%]">
          <svg width="14" height="10" viewBox="0 0 7 5" style={{ imageRendering: 'pixelated' }}>
            <rect x="1" y="2" width="5" height="3" fill="#4a7c5f" rx="1.5" />
            <rect x="2" y="0" width="3" height="3" fill="#4a7c5f" rx="1.5" />
          </svg>
        </div>

        <div className="absolute bottom-16 left-[48%]">
          <svg width="18" height="14" viewBox="0 0 9 7" style={{ imageRendering: 'pixelated' }}>
            <rect x="1" y="4" width="7" height="3" fill="#2d5f3f" rx="1.5" />
            <rect x="2" y="1" width="5" height="4" fill="#2d5f3f" rx="1.5" />
          </svg>
        </div>

        <div className="absolute bottom-11 right-[12%]">
          <svg width="16" height="12" viewBox="0 0 8 6" style={{ imageRendering: 'pixelated' }}>
            <rect x="1" y="3" width="6" height="3" fill="#3d6e50" rx="1.5" />
            <rect x="2" y="1" width="4" height="3" fill="#3d6e50" rx="1.5" />
          </svg>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        .pixel-font {
          font-family: 'Press Start 2P', cursive;
          image-rendering: pixelated;
        }

        /* 1번 사진의 부드러운 태양 움직임 */
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        /* 주황색 상자의 미세한 공중부양 */
        @keyframes float-mini {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float-mini {
          animation: float-mini 3s ease-in-out infinite;
        }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float-slow {
          animation: float-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
