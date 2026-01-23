import { DashboardPage } from "@/imports/App-12-344";

interface DashboardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export function DashboardPopup({ isOpen, onClose, onLogout }: DashboardPopupProps) {
  if (!isOpen) return null;

  return (
    <>
      <style>
        {`
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

          .hb-dashboard-popup {
            background: rgba(255,255,255,0.3);
            overflow: hidden;
          }

          .hb-dashboard-popup .hb-dashboard-glass {
            position: relative;
            overflow: hidden;
            background: rgba(255,255,255,0.25);
            border: 1px solid rgba(255,255,255,0.4);
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
          }


          /* DashboardPage 내부 배경 제거 */
          .hb-dashboard-popup [data-name="DashboardPage"] {
            background: transparent !important;
          }

          /* 콘텐츠 영역 (두 번째 Container) - 글라스모피즘 배경 */
          .hb-dashboard-popup [data-name="DashboardPage"] > [data-name="Container"]:last-child {
            background: rgba(255,255,255,0.3) !important;
            backdrop-filter: blur(10px) !important;
            -webkit-backdrop-filter: blur(10px) !important;
            position: relative !important;
            z-index: 2 !important;
            padding-top: 20px !important;
            min-height: 60vh !important;
          }

          /* Container2 (헤더) - 글라스모피즘 녹색 배경 */
          .hb-dashboard-popup [data-name="DashboardPage"] > [data-name="Container"]:first-child {
            background: rgba(74,153,96,0.25) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
            border-bottom: 1px solid rgba(255,255,255,0.3) !important;
            position: relative !important;
            padding: 24px 20px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
          }

          /* 헤더 내부의 디자인을 방해하는 자식 요소 숨기기 */
          .hb-dashboard-popup [data-name="DashboardPage"] > [data-name="Container"]:first-child > * {
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
            position: absolute !important;
            width: 0 !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          /* 헤더 제목 추가 */
          .hb-dashboard-popup [data-name="DashboardPage"] > [data-name="Container"]:first-child::before {
            content: "Dashboard";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            font-weight: 700;
            color: #4a9960;
            z-index: 10;
            text-align: center;
            pointer-events: none;
            opacity: 1 !important;
            visibility: visible !important;
          }


          /* aria-hidden으로 숨겨진 모든 테두리 요소 완전 제거 */
          .hb-dashboard-popup [data-name="DashboardPage"] [aria-hidden="true"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }

          /* 모든 검은색 테두리를 녹색 테두리로 변경 */
          .hb-dashboard-popup [data-name="DashboardPage"] [class*="border-black"],
          .hb-dashboard-popup [data-name="DashboardPage"] [style*="border"][style*="black"] {
            border-color: rgba(74,153,96,0.15) !important;
            border-width: 1px !important;
          }

          /* 모든 요소의 테두리를 녹색으로 통일 */
          .hb-dashboard-popup [data-name="DashboardPage"] * {
            border-color: rgba(74,153,96,0.15) !important;
          }

          /* Container57 내부의 모든 카드들을 글라스모피즘 스타일로 */
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div[class*="gap-"] > div,
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div {
            position: relative;
            overflow: hidden;
            background: rgba(255,255,255,0.35) !important;
            border: 1px solid rgba(255,255,255,0.4) !important;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important;
            backdrop-filter: blur(15px) !important;
            -webkit-backdrop-filter: blur(15px) !important;
            border-radius: 16px !important;
          }

          /* bg-white 배경을 글라스모피즘 스타일로 변경 */
          .hb-dashboard-popup [data-name="DashboardPage"] [class*="bg-white"],
          .hb-dashboard-popup [data-name="DashboardPage"] [class*="bg-"]:not([class*="bg-clip"]):not([class*="bg-gradient"]) {
            background: rgba(255,255,255,0.35) !important;
            border: 1px solid rgba(255,255,255,0.4) !important;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1) !important;
            backdrop-filter: blur(15px) !important;
            -webkit-backdrop-filter: blur(15px) !important;
          }

          /* 기존 배경색/테두리/그림자를 단순한 글라스모피즘 스타일로 */
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[class*="bg-"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[class*="border-"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[class*="shadow-"] {
            background: rgba(255,255,255,0.85) !important;
            border: 1px solid rgba(74,153,96,0.15) !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08) !important;
            backdrop-filter: blur(20px) !important;
            -webkit-backdrop-filter: blur(20px) !important;
          }

          /* 인라인 스타일 배경도 단순한 글라스모피즘으로 변경 */
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[style*="background"] {
            background: rgba(255,255,255,0.85) !important;
          }

          /* 최근 게임 섹션 내부 요소들의 모든 효과 제거 (경로 A, B, C) */
          /* Container29 (최근 게임 섹션) 내부의 Container28의 자식들 (경로 항목들) */
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div {
            border: none !important;
            border-color: transparent !important;
            border-width: 0 !important;
            background: transparent !important;
            box-shadow: none !important;
            outline: none !important;
          }

          /* 경로 항목 컨테이너 (Container17, Container22, Container27)의 테두리 완전 제거 */
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div[class*="bg-\\[#f9fafb\\]"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div[class*="h-\\[62\\.674px\\]"] {
            border: none !important;
            border-color: transparent !important;
            border-width: 0 !important;
            box-shadow: none !important;
            background: transparent !important;
          }

          /* 경로 항목 내부의 aria-hidden 테두리 요소 완전 제거 */
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [aria-hidden="true"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [aria-hidden="true"][class*="border-"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [aria-hidden="true"][class*="border-\\[#e5e7eb\\]"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [aria-hidden="true"][class*="border-\\[1\\.346px\\]"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            border: none !important;
            border-color: transparent !important;
            border-width: 0 !important;
            pointer-events: none !important;
            position: absolute !important;
            left: -9999px !important;
            width: 0 !important;
            height: 0 !important;
          }

          /* 경로 항목 내부의 모든 요소들 테두리/그림자 완전 제거 (트로피, 경로명, 포인트 등) */
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div *,
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [data-name="Container"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [data-name="Paragraph"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [class*="border"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [class*="shadow"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [style*="border"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [style*="box-shadow"] {
            border: none !important;
            border-color: transparent !important;
            border-width: 0 !important;
            box-shadow: none !important;
            outline: none !important;
            background: transparent !important;
          }

          /* 경로 항목 내부의 모든 하위 요소들도 테두리/그림자 제거 (재귀적으로) */
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div * *,
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div * [data-name="Container"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div * [data-name="Paragraph"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div * [class*="border"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div * [class*="shadow"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div * [style*="border"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div * [style*="box-shadow"] {
            border: none !important;
            border-color: transparent !important;
            border-width: 0 !important;
            box-shadow: none !important;
            outline: none !important;
            background: transparent !important;
          }

          /* 경로명과 시간 사이 간격 줄이기 (경로 A, B, C) */
          /* Paragraph8, Paragraph10, Paragraph12 (시간 표시)의 top 값을 줄여서 경로명과 가깝게 */
          /* 모든 시간 Paragraph 요소 (top-[20px] 클래스를 가진 요소들) */
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [data-name="Container"] [data-name="Paragraph"][class*="top-\\[20px\\]"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [data-name="Container"] [data-name="Paragraph"]:nth-child(2),
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [data-name="Container"] > div [data-name="Paragraph"]:nth-child(2),
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [data-name="Container"] [data-name="Paragraph"]:nth-of-type(2) {
            top: 16px !important;
            margin-top: 0 !important;
            padding-top: 0 !important;
            line-height: 1.1 !important;
            transform: translateY(-4px) !important;
          }

          /* 경로명 Paragraph의 line-height 조정 및 margin 제거 */
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [data-name="Container"] [data-name="Paragraph"]:first-child,
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [data-name="Container"] [data-name="Paragraph"][class*="top-0"] {
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
            line-height: 1.1 !important;
          }

          /* 경로 항목 컨테이너의 높이 조정으로 시간이 잘 보이도록 */
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [data-name="Container"][class*="h-\\[35\\.997px\\]"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [data-name="Container"][class*="flex-\\[1_0_0\\]"] {
            height: auto !important;
            min-height: 32px !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
          }

          /* 범인: bg-clip-padding을 가진 내부 div 완전 무력화 (Container14, Container19, Container24 내부) */
          /* 이 div가 size-full로 높이를 제한해서 시간이 잘림 - display: contents로 완전히 제거 */
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [data-name="Container"][class*="flex-\\[1_0_0\\]"] > div[class*="bg-clip-padding"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [data-name="Container"][class*="h-\\[35\\.997px\\]"] > div[class*="bg-clip-padding"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [data-name="Container"] > div[class*="bg-clip-padding"][class*="size-full"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [data-name="Container"] > div[class*="bg-clip-padding"][class*="border-0"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [data-name="Container"] > div[class*="bg-clip-padding"][class*="relative"][class*="size-full"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [data-name="Container"] > div[class*="bg-clip-padding"] {
            display: contents !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            width: auto !important;
            overflow: visible !important;
            position: static !important;
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* 경로 항목 전체 컨테이너의 높이도 조정 및 테두리 완전 제거 */
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div[class*="h-\\[62\\.674px\\]"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div[class*="rounded-\\[14px\\]"] {
            height: auto !important;
            min-height: 50px !important;
            max-height: none !important;
            padding-top: 8px !important;
            padding-bottom: 8px !important;
            border: none !important;
            border-color: transparent !important;
            box-shadow: none !important;
            overflow: visible !important;
          }

          /* 경로 항목 컨테이너 내부의 모든 테두리 요소 제거 */
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [class*="border-\\[#"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [class*="border-\\[1\\.346px\\]"],
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div [class*="border-\\[#e5e7eb\\]"] {
            border: none !important;
            border-color: transparent !important;
            border-width: 0 !important;
            display: none !important;
          }

          /* 모든 컨테이너의 overflow 제거 */
          .hb-dashboard-popup [data-name="DashboardPage"] [data-name="Container"]:last-child > div > div[data-name="Container"]:last-child > div[data-name="Container"] > div * {
            overflow: visible !important;
          }

        `}
      </style>

      {/* 백드롭 - 클릭하면 닫힘 */}
      <div
        className="fixed inset-0 bg-black/60 z-[60] transition-opacity"
        onClick={onClose}
      />

      {/* 팝업 컨테이너 */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="hb-dashboard-popup pointer-events-auto w-full max-w-[400px] h-[90vh] max-h-[840px] rounded-[22px] hb-dashboard-glass overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-md border border-white/40 shadow-lg hover:bg-white/40 transition-all"
            title="닫기"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 5L5 15M5 5L15 15" stroke="rgba(0,0,0,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 대시보드 콘텐츠 */}
          <div className="relative min-h-full flex flex-col">
            <div className="flex-1">
              <DashboardPage onClose={onClose} onLogout={onLogout} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
