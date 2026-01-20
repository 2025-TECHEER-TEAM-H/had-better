import svgPaths from "@/imports/svg-wsb2k3tlfm";

type PageType = "map" | "search" | "favorites" | "subway" | "route" | "routeDetail";

interface ResultPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: PageType) => void;
  onOpenDashboard?: () => void;
}

export function ResultPopup({ isOpen, onClose, onNavigate, onOpenDashboard }: ResultPopupProps) {
  if (!isOpen) return null;

  const handleMainClick = () => {
    onClose();
    onNavigate?.("search");
  };

  const handleDashboardClick = () => {
    onOpenDashboard?.();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      {/* 팝업 컨텐츠 */}
      <div className="relative w-[378px] h-[841px] mx-auto">
        {/* 배경 */}
        <div className="absolute inset-[0_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 378 841">
            <path d={svgPaths.p26b30c00} fill="url(#paint0_linear_97_439)" stroke="#0A0A0A" strokeWidth="5" />
            <defs>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_97_439" x1="189" x2="189" y1="13.4978" y2="841">
                <stop stopColor="#C5E7F5" />
                <stop offset="1" stopColor="white" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 헤더 - 햄버거 메뉴, 제목, X 버튼 */}
        <div className="absolute left-[37px] top-[29px] right-[37px]">
          {/* 햄버거 메뉴 */}
          <div className="absolute bg-white border-[3px] border-black h-[43.697px] left-0 rounded-[12px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] top-0 w-[42px]">
            <div className="absolute left-[6px] size-[24px] top-[6px]">
              <div className="h-[24px] overflow-clip relative w-full flex flex-col items-center justify-center gap-[4px] py-[5px]">
                <div className="w-[16px] h-[2px] bg-black rounded-full" />
                <div className="w-[16px] h-[2px] bg-black rounded-full" />
                <div className="w-[16px] h-[2px] bg-black rounded-full" />
              </div>
            </div>
          </div>

          {/* 제목 */}
          <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] h-[26.351px] leading-[30px] left-[154.77px] text-[16px] text-black text-center top-[9.36px] translate-x-[-50%] w-[195.542px]">
            HAD BETTER
          </p>

          {/* X 버튼 */}
          <button
            onClick={() => {
              onClose();
              onNavigate?.("search");
            }}
            className="absolute bg-white right-0 h-[42.156px] rounded-[14px] top-[2.08px] w-[40.312px] border-[3px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] flex items-center justify-center hover:bg-gray-50 active:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-[2px] transition-all"
          >
            <p className="css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] leading-[24px] text-[16px] text-black">x</p>
          </button>
        </div>

        {/* 순위 표시 */}
        <div className="absolute left-[61.01px] top-[116.83px] w-[255.999px] h-[146.974px] flex gap-[16px] items-end justify-center">
          {/* 2위 - 고스트2 */}
          <div className="w-[64px] h-[122.974px] flex flex-col items-center">
            <div className="bg-gradient-to-b from-[#c0c0c0] to-[#a8a8a8] size-[64px] rounded-full border-[3px] border-black shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] flex items-center justify-center">
              <p className="text-[30px] leading-[36px]">🥈</p>
            </div>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-[#2d5f3f] mt-[8px]">2위</p>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-[#6b9080] mt-[4px]">고스트2</p>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-[#2d5f3f] mt-[4px]">19분 50초</p>
          </div>

          {/* 1위 - 나 */}
          <div className="w-[95.999px] h-[170.974px] flex flex-col items-center">
            <div className="relative">
              <div className="bg-gradient-to-b from-[#ffd700] to-[#f4c430] size-[95.999px] rounded-full border-[3px] border-black shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] flex items-center justify-center">
                <p className="text-[48px] leading-[48px]">🏆</p>
              </div>
              <p className="absolute text-[24px] leading-[32px] left-[36.1px] top-[-13.96px]">⭐</p>
            </div>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-[#2d5f3f] mt-[12px]">1위</p>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-[#6b9080] mt-[4px]">나</p>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-[#2d5f3f] mt-[4px]">18분 30초</p>
          </div>

          {/* 3위 - 고스트1 */}
          <div className="w-[64px] h-[122.974px] flex flex-col items-center">
            <div className="bg-gradient-to-b from-[#cd7f32] to-[#b5692d] size-[64px] rounded-full border-[3px] border-black shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] flex items-center justify-center">
              <p className="text-[24px] leading-[32px]">🥉</p>
            </div>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-[#2d5f3f] mt-[8px]">3위</p>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-[#6b9080] mt-[4px]">고스트1</p>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-[#2d5f3f] mt-[4px]">28분 15초</p>
          </div>
        </div>

        {/* 축하 메시지 */}
        <div className="absolute bg-gradient-to-b from-[#7fb8cc] to-[#6ba9bd] left-[24px] top-[279.8px] w-[330.038px] h-[77.683px] rounded-[16px] border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center gap-[8px] px-[26.72px] py-[18.72px]">
          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white text-center">
            오늘은 내가 제일 먼저 도착했어요!
          </p>
          <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] text-[12px] text-white text-center">
            🌈BEST CHOICE!🌈
          </p>
        </div>

        {/* 기록 카드들 */}
        <div className="absolute left-[24px] top-[397.49px] w-[330.038px] flex flex-col gap-[11.995px]">
          {/* 내 기록 - 골드 */}
          <div className="bg-gradient-to-b from-[#ffd700] to-[#f4c430] h-[64px] rounded-[16px] border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center">
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-[#2d5f3f]">내 기록</p>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-[#2d5f3f] mt-[3.995px]">18분 30초</p>
          </div>

          {/* 고스트2 기록 - 핑크 */}
          <div className="bg-gradient-to-b from-[#ff94c2] to-[#ff6ba8] h-[64px] rounded-[16px] border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center">
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white">고스트2 기록</p>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white mt-[3.995px]">19분 50초</p>
          </div>

          {/* 고스트1 기록 - 그린 */}
          <div className="bg-gradient-to-b from-[#9ae6b4] to-[#68d391] h-[64px] rounded-[16px] border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center">
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-[#2d5f3f]">고스트 1 기록</p>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-[#2d5f3f] mt-[3.995px]">28분 15초</p>
          </div>
        </div>

        {/* 하단 버튼들 */}
        <div className="absolute left-[24px] top-[653.48px] w-[330.038px] flex flex-col gap-[11.995px]">
          {/* Main 버튼 */}
          <button
            onClick={handleMainClick}
            className="bg-gradient-to-b from-[#48d448] to-[#3db83d] h-[56px] rounded-[24px] border-[3px] border-black shadow-[0px_8px_0px_0px_#2d8b2d,0px_16px_32px_0px_rgba(61,184,61,0.3)] hover:scale-105 active:shadow-[0px_4px_0px_0px_#2d8b2d] active:translate-y-[4px] transition-all"
          >
            <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] text-[16px] text-white text-center">Main</p>
          </button>

          {/* Dashboard 버튼 */}
          <button
            onClick={handleDashboardClick}
            className="bg-gradient-to-b from-[#00d9ff] to-[#00b8d4] h-[56px] rounded-[24px] border-[3px] border-black shadow-[0px_8px_0px_0px_#0097a7,0px_16px_32px_0px_rgba(0,217,255,0.3)] hover:scale-105 active:shadow-[0px_4px_0px_0px_#0097a7] active:translate-y-[4px] transition-all"
          >
            <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] text-[16px] text-white text-center">Dashboard</p>
          </button>
        </div>
      </div>
    </div>
  );
}