import { createPortal } from "react-dom";
import svgPaths from "@/imports/svg-wsb2k3tlfm";
import type { RouteResultResponse } from "@/types/route";
import { formatDuration } from "@/types/route";

type PageType = "map" | "search" | "favorites" | "subway" | "route" | "routeDetail";

interface ResultPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: PageType) => void;
  onOpenDashboard?: () => void;
  onCloseDashboard?: () => void; // 대시보드 닫기 콜백 (Main 버튼 클릭 시 사용)
  result?: RouteResultResponse | null; // 경주 결과 데이터
  isLoading?: boolean; // 로딩 상태
}

// 순위별 메달 이모지
const RANK_MEDALS: Record<number, string> = {
  1: '🏆',
  2: '🥈',
  3: '🥉',
};

// 순위별 배경 그라데이션
const RANK_GRADIENTS: Record<number, string> = {
  1: 'from-[#ffd700] to-[#f4c430]', // 골드
  2: 'from-[#c0c0c0] to-[#a8a8a8]', // 실버
  3: 'from-[#cd7f32] to-[#b5692d]', // 브론즈
};

// 카드 배경 그라데이션 (순위순)
const CARD_GRADIENTS = [
  'from-[#ffd700] to-[#f4c430]', // 1위: 골드
  'from-[#ff94c2] to-[#ff6ba8]', // 2위: 핑크
  'from-[#9ae6b4] to-[#68d391]', // 3위: 그린
];

// 참가자 타입별 아이콘
const PARTICIPANT_ICONS: Record<string, string> = {
  USER: '👤',
  BOT: '🤖',
};

export function ResultPopup({ isOpen, onClose, onNavigate, onOpenDashboard, onCloseDashboard, result, isLoading }: ResultPopupProps) {
  if (!isOpen) return null;

  // 메인(SearchPage)으로 돌아갈 때의 내비게이션 규칙:
  // 1) 결과 팝업 닫기
  // 2) 대시보드 팝업 닫기 (있는 경우)
  // 3) Search 페이지로 이동
  const handleMainClick = () => {
    onClose(); // 결과 팝업 닫기
    onCloseDashboard?.(); // 대시보드 팝업 닫기
    if (onNavigate) {
      onNavigate("search"); // Search 페이지로 이동
    }
  };

  const handleDashboardClick = () => {
    onClose(); // 결과 팝업 닫기
    // 대시보드에서 열린 경우: 팝업만 닫으면 대시보드가 보임
    // 경주 끝난 후 열린 경우: onOpenDashboard로 대시보드 열기
    if (onOpenDashboard) {
      onOpenDashboard();
    }
  };

  // Portal을 사용하여 body에 직접 렌더링 (다른 팝업 위에 표시되도록)
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50">
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

        {/* 헤더 - 제목, X 버튼 */}
        <div className="absolute left-[37px] top-[29px] right-[37px]">
          {/* 제목 */}
          <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] h-[26.351px] leading-[30px] left-[154.77px] text-[16px] text-black text-center top-[9.36px] translate-x-[-50%] w-[195.542px]">
            HAD BETTER
          </p>

          {/* X 버튼 */}
          <button
            onClick={onClose}
            className="absolute bg-white right-0 h-[42.156px] rounded-[14px] top-[2.08px] w-[40.312px] border-[3px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] flex items-center justify-center hover:bg-gray-50 active:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-[2px] transition-all"
          >
            <p className="css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] leading-[24px] text-[16px] text-black">x</p>
          </button>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-['Wittgenstein',sans-serif] text-[14px] text-black">결과 로딩 중...</p>
          </div>
        )}

        {/* 순위 표시 */}
        {!isLoading && result && (
          <div className="absolute left-[61.01px] top-[116.83px] w-[255.999px] h-[170.974px] flex gap-[16px] items-end justify-center">
            {/* 순위를 2위-1위-3위 순서로 배치 */}
            {[1, 0, 2].map((displayIndex) => {
              const ranking = result.rankings[displayIndex];
              if (!ranking) return null;

              const rank = ranking.rank || displayIndex + 1;
              const isFirst = rank === 1;
              const gradient = RANK_GRADIENTS[rank] || RANK_GRADIENTS[3];
              const medal = RANK_MEDALS[rank] || '🏅';
              const displayName = ranking.type === 'USER' ? '나' : ranking.name || `Bot ${ranking.bot_id}`;
              const duration = ranking.duration ? formatDuration(ranking.duration) : '-';

              return (
                <div
                  key={ranking.route_id}
                  className={`flex flex-col items-center ${isFirst ? 'w-[95.999px]' : 'w-[64px]'}`}
                >
                  <div className="relative">
                    <div
                      className={`bg-gradient-to-b ${gradient} ${isFirst ? 'size-[95.999px]' : 'size-[64px]'} rounded-full border-[3px] border-black ${isFirst ? 'shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)]' : 'shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]'} flex items-center justify-center`}
                    >
                      <p className={`${isFirst ? 'text-[48px] leading-[48px]' : 'text-[30px] leading-[36px]'}`}>{medal}</p>
                    </div>
                    {isFirst && <p className="absolute text-[24px] leading-[32px] left-[36.1px] top-[-13.96px]">⭐</p>}
                  </div>
                  <p className={`font-['Wittgenstein',sans-serif] text-[12px] text-[#2d5f3f] ${isFirst ? 'mt-[12px]' : 'mt-[8px]'}`}>
                    {rank}위
                  </p>
                  <p className="font-['Wittgenstein',sans-serif] text-[12px] text-[#6b9080] mt-[4px]">{displayName}</p>
                  <p className="font-['Wittgenstein',sans-serif] text-[12px] text-[#2d5f3f] mt-[4px]">{duration}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* 축하 메시지 */}
        <div className="absolute bg-gradient-to-b from-[#7fb8cc] to-[#6ba9bd] left-[24px] top-[299.8px] w-[330.038px] h-[77.683px] rounded-[16px] border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center gap-[8px] px-[26.72px] py-[18.72px]">
          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white text-center">
            {result?.user_result.is_win
              ? '오늘은 내가 제일 빨리 도착했어요!'
              : result?.user_result.rank
                ? `${result.user_result.rank}위로 도착했어요!`
                : '경주가 종료되었습니다!'}
          </p>
          <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] text-[12px] text-white text-center">
            {result?.user_result.is_win ? '🌈BEST CHOICE!🌈' : '🏁FINISHED!🏁'}
          </p>
        </div>

        {/* 기록 카드들 */}
        <div className="absolute left-[24px] top-[417.49px] w-[330.038px] flex flex-col gap-[11.995px]">
          {result?.rankings.map((ranking, index) => {
            const gradient = CARD_GRADIENTS[index] || CARD_GRADIENTS[2];
            const isFirstCard = index === 0;
            const displayName = ranking.type === 'USER' ? '내 기록' : `${ranking.name || `Bot ${ranking.bot_id}`} 기록`;
            const duration = ranking.duration ? formatDuration(ranking.duration) : '-';
            const textColor = isFirstCard ? 'text-[#2d5f3f]' : index === 1 ? 'text-white' : 'text-[#2d5f3f]';

            return (
              <div
                key={ranking.route_id}
                className={`bg-gradient-to-b ${gradient} h-[64px] rounded-[16px] border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center`}
              >
                <p className={`font-['Wittgenstein',sans-serif] text-[12px] ${textColor}`}>{displayName}</p>
                <p className={`font-['Wittgenstein',sans-serif] text-[12px] ${textColor} mt-[3.995px]`}>{duration}</p>
              </div>
            );
          })}
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
    </div>,
    document.body
  );
}
