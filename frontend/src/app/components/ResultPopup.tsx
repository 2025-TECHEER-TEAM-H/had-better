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
  isCanceling?: boolean | 'record'; // 취소 중 상태 (true: 취소, false: 완료, 'record': 기록 조회)
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



export function ResultPopup({ isOpen, onClose, onNavigate, onOpenDashboard, onCloseDashboard, result, isLoading, isCanceling = 'record', userNickname = '나' }: ResultPopupProps) {
  if (!isOpen) return null;

  // Portal을 사용하여 body에 직접 렌더링 (다른 팝업 위에 표시되도록)
  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/35 p-4 hb-result-popup">
      <style>
        {`
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

          @keyframes hb-result-pulse {
            0%, 100% { 
              transform: translate(-50%, -50%) scale(1); 
              opacity: 0.6; 
            }
            50% { 
              transform: translate(-50%, -50%) scale(1.1); 
              opacity: 0.8; 
            }
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
      <div className="relative w-full max-w-[400px] h-[90vh] max-h-[840px] mx-auto hb-result-shell hb-result-glass hb-result-glass-fun rounded-[22px] overflow-hidden">

        {/* 헤더 - 제목, X 버튼 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[29px] w-[calc(100%-74px)]">
          {/* 제목 */}
          <div className="hb-result-chip rounded-[16px] h-[44px] flex items-center justify-center">
            <p className="hb-result-title text-[18px] text-black">
              HAD BETTER
            </p>
          </div>

          {/* X 버튼 */}
          <button
            onClick={onClose}
            className="absolute hb-result-chip hb-result-pressable right-0 top-0 size-[44px] rounded-[14px] flex items-center justify-center text-black"
          >
            <p className="font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[20px] text-[16px] text-black">✕</p>
          </button>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="absolute left-1/2 -translate-x-1/2 top-[333px] w-[330.038px] h-[120px] rounded-[16px] flex items-center justify-center">
            <div className="hb-result-card w-full h-full rounded-[16px] flex flex-col items-center justify-center gap-[12px] px-[26.72px] py-[24px]">
              {isCanceling === 'record' ? (
                // 기록 조회 중
                <p className="font-['Pretendard',sans-serif] font-medium text-[16px] text-black text-center">
                  경주 기록을 불러오고 있습니다..
                </p>
              ) : (
                <>
                  {/* 영어 메시지 (픽셀 글씨체, 크게) */}
                  <p className="font-['DNFBitBitv2','Press_Start_2P',sans-serif] text-[26px] text-black text-center">
                    {isCanceling ? 'CANCELED!' : 'FINISHED!'}
                  </p>
                  {/* 한글 메시지 (영어보다 작게) */}
                  <p className="font-['Pretendard',sans-serif] font-medium text-[16px] text-black text-center">
                    {isCanceling ? '경주가 취소되었습니다' : '경주가 종료되었습니다'}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* 순위 표시 */}
        {!isLoading && result && (
          <div className="absolute left-1/2 -translate-x-1/2 top-[150px] w-[255.999px] h-[170.974px] flex gap-[16px] items-end justify-center">
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

              // 배지 색상 정의
              const badgeColor = 
                rank === 1 ? '#FFD700' :
                rank === 2 ? '#C0C0C0' :
                '#CD7F32';
              const borderColor = 
                rank === 1 ? '#FFD700' :
                rank === 2 ? '#C0C0C0' :
                '#CD7F32';

              return (
                <div
                  key={ranking.route_id}
                  className={`flex flex-col items-center ${isFirst ? 'w-[110px]' : 'w-[75px]'}`}
                >
                  {/* 메달 (순위별 색상 테두리) */}
                  <div className="relative mb-3">
                    <div
                      className={`${isFirst ? 'size-[95.999px]' : 'size-[64px]'} rounded-full flex items-center justify-center`}
                      style={{
                        background: glassStyle.background,
                        border: `3px solid ${borderColor}`,
                        boxShadow: `
                          0 4px 12px rgba(0, 0, 0, 0.1),
                          0 0 0 1px rgba(255, 255, 255, 0.5) inset,
                          0 0 20px ${borderColor}30
                        `,
                        backdropFilter: 'blur(18px) saturate(160%)',
                        WebkitBackdropFilter: 'blur(18px) saturate(160%)',
                      }}
                    >
                      <p className={`${isFirst ? 'text-[48px] leading-[1]' : 'text-[30px] leading-[1]'} flex items-center justify-center`}>{medal}</p>
                    </div>
                    
                    {isFirst && (
                      <p className="absolute text-[24px] leading-[1] left-1/2 -translate-x-1/2 top-[-14px] z-[50]">
                        ⭐
                      </p>
                    )}
                  </div>

                  {/* 순위 배지 */}
                  <div 
                    className="px-3 py-1 rounded-full mb-2"
                    style={{
                      backgroundColor: badgeColor,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    }}
                  >
                    <p className="font-['Pretendard',sans-serif] font-bold text-[12px] text-white">
                      {rank}위
                    </p>
                  </div>

                  {/* 이름 (반투명 배경 카드) */}
                  <div 
                    className="px-3 py-1.5 rounded-xl mb-2"
                    style={{
                      background: 'rgba(255, 255, 255, 0.6)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    }}
                  >
                    <p className="font-['Pretendard',sans-serif] font-medium text-[14px] text-black">{displayName}</p>
                  </div>

                  {/* 시간 */}
                  <p className="font-['Pretendard',sans-serif] font-bold text-[16px] text-black whitespace-nowrap">{duration}</p>
                </div>
              );
            });
            })()}
          </div>
        )}

        {/* 축하 메시지 */}
        {!isLoading && result && (
        <div className="absolute hb-result-card left-1/2 -translate-x-1/2 top-[333px] w-[330.038px] h-[120px] rounded-[16px] flex flex-col items-center justify-center gap-[12px] px-[26.72px] py-[24px]">
          {/* 영어 메시지 (픽셀 글씨체, 크게) */}
          <p className="font-['DNFBitBitv2','Press_Start_2P',sans-serif] text-[26px] text-black text-center">
            {result?.status === 'CANCELED'
              ? 'CANCELED'
              : result?.user_result.rank === 1
                ? 'BEST CHOICE!'
                : result?.user_result.rank === 2
                  ? 'GOOD CHOICE!'
                  : result?.user_result.rank === 3
                    ? 'NICE TRY!'
                    : 'FINISHED!'}
          </p>
          {/* 한글 메시지 (영어보다 작게) */}
          <p className="font-['Pretendard',sans-serif] font-medium text-[16px] text-black text-center">
            {result?.status === 'CANCELED'
              ? '경주가 취소됐어요'
              : result?.user_result.rank === 1
                ? '최적의 경로로 가장 빨리 도착했어요!'
                : result?.user_result.rank === 2
                  ? '조금만 더 서둘렀다면 1등!'
                  : result?.user_result.rank === 3
                    ? '다음엔 더 나은 경로가 있을 거예요'
                    : '경주가 종료되었습니다!'}
          </p>
        </div>
        )}

        {/* 기록 카드들 */}
        {!isLoading && result && (
        <div className="absolute left-1/2 -translate-x-1/2 top-[470px] w-[330.038px] flex flex-col gap-[18px]">
          {result?.rankings.map((ranking) => {
            const displayName = ranking.type === 'USER' ? `${userNickname}의 기록` : `${ranking.name || `Bot ${ranking.bot_id}`} 기록`;
            const duration = ranking.duration ? formatDuration(ranking.duration) : '-';
            
            // 순위별 메달 색상
            const medalColor = 
              ranking.rank === 1 ? '#FFD700' :
              ranking.rank === 2 ? '#C0C0C0' :
              '#CD7F32';
            const medalDark = 
              ranking.rank === 1 ? '#DAA520' :
              ranking.rank === 2 ? '#A8A8A8' :
              '#B56927';

            return (
              <div
                key={ranking.route_id}
                className={`hb-result-card h-[64px] rounded-[16px] flex flex-col items-center justify-center relative overflow-visible`}
                style={{ background: undefined }}
              >
                {/* 메달 아이콘 */}
                <div className="absolute top-2 left-3 flex flex-col items-center z-20">
                  {/* 메달 본체 */}
                  <div
                    className="w-[36px] h-[36px] rounded-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${medalColor} 0%, ${medalDark} 100%)`,
                      border: '2px solid white',
                      boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <span className="font-['Pretendard',sans-serif] font-bold text-[16px] text-white" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
                      {ranking.rank}
                    </span>
                  </div>
                </div>
                
                <p className={`font-['Pretendard',sans-serif] font-bold text-[16px] text-black`}>{displayName}</p>
                <p className={`font-['Pretendard',sans-serif] font-semibold text-[16px] text-black mt-[3.995px] whitespace-nowrap`}>{duration}</p>
              </div>
            );
          })}
        </div>
        )}

      </div>
    </div>,
    document.body
  );
}
