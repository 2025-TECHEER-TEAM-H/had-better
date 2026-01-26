import { createPortal } from "react-dom";
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
  userNickname?: string; // 유저 닉네임
}

// 순위별 메달 이모지
const RANK_MEDALS: Record<number, string> = {
  1: '🏆',
  2: '🥈',
  3: '🥉',
};

// 순위별 글래스모피즘 스타일 (색상 힌트 포함)
const RANK_GLASS_STYLES: Record<number, { background: string; border: string; shadow: string }> = {
  1: { 
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.65) 0%, rgba(244, 196, 48, 0.45) 100%)',
    border: '1px solid rgba(255, 215, 0, 0.7)',
    shadow: '0 16px 32px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
  },
  2: { 
    background: 'linear-gradient(135deg, rgba(192, 192, 192, 0.65) 0%, rgba(168, 168, 168, 0.45) 100%)',
    border: '1px solid rgba(192, 192, 192, 0.7)',
    shadow: '0 12px 24px rgba(192, 192, 192, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
  },
  3: { 
    background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.65) 0%, rgba(181, 105, 45, 0.45) 100%)',
    border: '1px solid rgba(205, 127, 50, 0.7)',
    shadow: '0 12px 24px rgba(205, 127, 50, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
  }
};



export function ResultPopup({ isOpen, onClose, onNavigate, onOpenDashboard, onCloseDashboard, result, isLoading, userNickname = '나' }: ResultPopupProps) {
  if (!isOpen) return null;

  // Portal을 사용하여 body에 직접 렌더링 (다른 팝업 위에 표시되도록)
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/35 p-4 hb-result-popup">
      <style>
        {`
          @font-face {
            font-family: 'Pretendard';
            src: url('/fonts/Pretendard-SemiBold.woff2') format('woff2');
            font-weight: 600;
            font-style: normal;
            font-display: swap;
          }

          @font-face {
            font-family: 'FreesentationVF';
            src: url('/fonts/FreesentationVF.ttf') format('truetype');
            font-weight: 100 900;
            font-style: normal;
            font-display: swap;
          }

          @font-face {
            font-family: 'DNFBitBitv2';
            src:
              url('/fonts/DNFBitBitv2.otf') format('opentype'),
              url('/fonts/DNFBitBitv2.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }

          .hb-result-popup .hb-result-shell {
            position: relative;
            overflow: hidden;
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 600;
          }

          .hb-result-popup .hb-result-shell.hb-result-glass {
            background: #d4ebf7;
          }

          .hb-result-popup .hb-result-glass {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.28) 100%);
            border: 1px solid rgba(255,255,255,0.68);
            box-shadow: 0 16px 32px rgba(90,120,130,0.16), inset 0 1px 0 rgba(255,255,255,0.5);
            backdrop-filter: blur(18px) saturate(160%);
            -webkit-backdrop-filter: blur(18px) saturate(160%);
          }

          .hb-result-popup .hb-result-glass-fun::before {
            content: "";
            position: absolute;
            inset: -30% -40%;
            pointer-events: none;
            background: linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0) 60%);
            opacity: 0;
            animation: hb-result-sheen 12.5s ease-in-out infinite;
          }

          @keyframes hb-result-sheen {
            0% { transform: translateX(-40%) translateY(-10%) rotate(12deg); opacity: 0; }
            12% { opacity: 0.55; }
            50% { opacity: 0.35; }
            100% { transform: translateX(140%) translateY(10%) rotate(12deg); opacity: 0; }
          }

          .hb-result-popup .hb-result-title {
            font-family: 'DNFBitBitv2', 'Press Start 2P', sans-serif;
            letter-spacing: 0.6px;
          }

          .hb-result-popup .hb-result-chip {
            background: linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.42) 100%);
            border: 1px solid rgba(255,255,255,0.72);
            box-shadow: 0 10px 20px rgba(90,120,130,0.12), inset 0 1px 0 rgba(255,255,255,0.5);
            backdrop-filter: blur(16px) saturate(155%);
            -webkit-backdrop-filter: blur(16px) saturate(155%);
          }

          .hb-result-popup .hb-result-card {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.4) 100%);
            border: 1px solid rgba(255,255,255,0.7);
            box-shadow: 0 14px 28px rgba(90,120,130,0.16), inset 0 1px 0 rgba(255,255,255,0.46);
            backdrop-filter: blur(18px) saturate(160%);
            -webkit-backdrop-filter: blur(18px) saturate(160%);
          }

          .hb-result-popup .hb-result-card::after {
            content: "";
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.18);
            pointer-events: none;
          }

          .hb-result-popup .hb-result-pressable {
            transition: transform 140ms ease-out, filter 140ms ease-out;
            will-change: transform, filter;
          }

          .hb-result-popup .hb-result-pressable:active {
            transform: translateY(1px) scale(0.985);
            filter: brightness(1.04);
          }

          .hb-result-popup .hb-result-button {
            transition: transform 140ms ease-out, box-shadow 140ms ease-out, filter 140ms ease-out;
            will-change: transform, box-shadow, filter;
          }

          .hb-result-popup .hb-result-button:active {
            transform: translateY(3px) scale(0.97);
            filter: brightness(0.95);
          }

          .hb-result-popup .hb-result-button-main:active {
            box-shadow: 0 3px 12px rgba(72, 212, 72, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
          }

          .hb-result-popup .hb-result-button-dashboard:active {
            box-shadow: 0 3px 12px rgba(0, 217, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
          }

          @media (prefers-reduced-motion: reduce) {
            .hb-result-popup .hb-result-glass-fun::before {
              animation: none !important;
            }
            .hb-result-popup .hb-result-pressable {
              transition: none !important;
            }
            .hb-result-popup .hb-result-pressable:active {
              transform: none !important;
              filter: none !important;
            }
          }
        `}
      </style>
      {/* 팝업 컨텐츠 */}
      <div className="relative w-full max-w-[400px] h-[90vh] max-h-[840px] mx-auto hb-result-shell hb-result-glass hb-result-glass-fun rounded-[22px] overflow-hidden flex flex-col">

        {/* 헤더 - 제목, X 버튼 */}
        <div className="relative px-6 pt-5 pb-4">
          {/* 제목 */}
          <div className="hb-result-chip rounded-[16px] h-[44px] flex items-center justify-center mb-4">
            <p className="hb-result-title text-[16px] text-black">
              HAD BETTER
            </p>
          </div>

          {/* X 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-5 right-6 hb-result-chip hb-result-pressable size-[44px] rounded-[14px] flex items-center justify-center text-black"
          >
            <span className="font-['Press_Start_2P:Regular',sans-serif] text-[14px]">✕</span>
          </button>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] text-[16px] text-black">결과 로딩 중...</p>
          </div>
        )}

        {/* 순위 표시 */}
        {!isLoading && result && (
          <div className="absolute left-[61.01px] top-[116.83px] w-[255.999px] h-[170.974px] flex gap-[16px] items-end justify-center">
            {/* rank 기준으로 정렬 후 2위-1위-3위 순서로 배치 */}
            {(() => {
              const sortedRankings = [...result.rankings].sort((a, b) => (a.rank || 99) - (b.rank || 99));
              return [1, 0, 2].map((displayIndex) => {
              const ranking = sortedRankings[displayIndex];
              if (!ranking) return null;

              const rank = ranking.rank || displayIndex + 1;
              const isFirst = rank === 1;
              const glassStyle = RANK_GLASS_STYLES[rank] || RANK_GLASS_STYLES[3];
              const medal = RANK_MEDALS[rank] || '🏅';
              const displayName = ranking.type === 'USER' ? userNickname : ranking.name || `Bot ${ranking.bot_id}`;
              const duration = ranking.duration ? formatDuration(ranking.duration) : '-';

              return (
                <div
                  key={ranking.route_id}
                  className={`flex flex-col items-center ${isFirst ? 'w-[95.999px]' : 'w-[64px]'}`}
                >
                  <div className="relative">
                    <div
                      className={`${isFirst ? 'size-[95.999px]' : 'size-[64px]'} rounded-full flex items-center justify-center`}
                      style={{
                        background: glassStyle.background,
                        border: glassStyle.border,
                        boxShadow: glassStyle.shadow,
                        backdropFilter: 'blur(18px) saturate(160%)',
                        WebkitBackdropFilter: 'blur(18px) saturate(160%)',
                      }}
                    >
                      <p className={`${isFirst ? 'text-[48px] leading-[1]' : 'text-[30px] leading-[1]'} flex items-center justify-center`}>{medal}</p>
                    </div>
                    <p className={`font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#2d5f3f] ${isFirst ? 'mt-3' : 'mt-2'}`}>
                      {rank}위
                    </p>
                    <p className="font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#6b9080] mt-1">{displayName}</p>
                    <p className="font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#2d5f3f] mt-1">{duration}</p>
                  </div>
                  <p className={`font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#2d5f3f] ${isFirst ? 'mt-[12px]' : 'mt-[8px]'}`}>
                    {rank}위
                  </p>
                  <p className="font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#6b9080] mt-[4px]">{displayName}</p>
                  <p className="font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#2d5f3f] mt-[4px]">{duration}</p>
                </div>
              );
            });
            })()}
          </div>
        )}

        {/* 축하 메시지 */}
        <div className="absolute hb-result-card left-[24px] top-[299.8px] w-[330.038px] h-[77.683px] rounded-[16px] flex flex-col items-center justify-center gap-[8px] px-[26.72px] py-[18.72px]">
          <p className="font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] text-[15px] text-[#2d5f3f] text-center">
            {result?.user_result.is_win
              ? '오늘은 내가 제일 빨리 도착했어요!'
              : result?.user_result.rank
                ? `${result.user_result.rank}위로 도착했어요!`
                : '경주가 종료되었습니다!'}
          </p>
          <p className="css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[13px] text-[#2d5f3f] text-center">
            {result?.user_result.is_win ? '🌈BEST CHOICE!🌈' : '🏁FINISHED!🏁'}
          </p>
        </div>

        {/* 기록 카드들 */}
        <div className="absolute left-[24px] top-[417.49px] w-[330.038px] flex flex-col gap-[11.995px]">
          {result?.rankings.map((ranking) => {
            const displayName = ranking.type === 'USER' ? `${userNickname}의 기록` : `${ranking.name || `Bot ${ranking.bot_id}`} 기록`;
            const duration = ranking.duration ? formatDuration(ranking.duration) : '-';

            return (
              <div
                key={ranking.route_id}
                className={`hb-result-card h-[64px] rounded-[16px] flex flex-col items-center justify-center`}
                style={{ background: undefined }}
              >
                <p className={`font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] text-[15px] text-[#2d5f3f]`}>{displayName}</p>
                <p className={`font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#6b9080] mt-[3.995px]`}>{duration}</p>
              </div>
            );
          })}
        </div>

        {/* 하단 버튼들 */}
        <div className="absolute left-[24px] top-[653.48px] w-[330.038px] flex flex-col gap-[11.995px]">
          {/* Main 버튼 */}
          <button
            onClick={handleMainClick}
            className="hb-result-button hb-result-button-main h-[56px] rounded-[24px]"
            style={{
              background: 'linear-gradient(135deg, rgba(72, 212, 72, 0.85) 0%, rgba(61, 184, 61, 0.85) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              boxShadow: '0 8px 24px rgba(72, 212, 72, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(18px) saturate(160%)',
              WebkitBackdropFilter: 'blur(18px) saturate(160%)',
            }}
          >
            <p className="css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[18px] text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">Main</p>
          </button>

          {/* Dashboard 버튼 */}
          <button
            onClick={handleDashboardClick}
            className="hb-result-button hb-result-button-dashboard h-[56px] rounded-[24px]"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.85) 0%, rgba(0, 184, 212, 0.85) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              boxShadow: '0 8px 24px rgba(0, 217, 255, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(18px) saturate(160%)',
              WebkitBackdropFilter: 'blur(18px) saturate(160%)',
            }}
          >
            <p className="css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[18px] text-white text-center drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">Dashboard</p>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
