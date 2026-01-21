import imgHudHeartEmpty1 from "@/assets/hud-heart-empty.png";
import imgWindow2 from "@/assets/window.png";
import imgSaw1 from "@/assets/saw.png";
import imgCoinGold2 from "@/assets/coin-gold.png";

/**
 * AppHeader - 재사용 가능한 앱 헤더 컴포넌트
 *
 * Figma 디자인을 기반으로 한 헤더로, 다음 요소들을 포함합니다:
 * - 햄버거 메뉴 (왼쪽 상단)
 * - HAD BETTER 로고 (중앙)
 * - 뒤로가기 버튼 (오른쪽 상단)
 * - 검색창 (옵션)
 * - 네비게이션 탭 (지도, 검색, 지하철, MY)
 *
 * 사용 예시:
 * ```tsx
 * <AppHeader
 *   onBack={() => console.log('뒤로가기')}
 *   onNavigate={(page) => console.log('페이지 이동:', page)}
 *   onOpenDashboard={() => console.log('대시보드 열기')}
 *   onMenuClick={() => console.log('메뉴 클릭')}
 *   searchQuery={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   onSearchSubmit={() => console.log('검색 제출')}
 *   currentPage="search"
 *   showSearchBar={true}
 * />
 * ```
 */

type PageType = "map" | "search" | "favorites" | "subway" | "route";

interface AppHeaderProps {
  onBack?: () => void;
  onNavigate?: (page: PageType) => void;
  onOpenDashboard?: () => void;
  onMenuClick?: () => void;
  /** 중앙 타이틀 텍스트 (기본: HAD BETTER) */
  title?: string;
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  currentPage?: PageType;
  showSearchBar?: boolean;
}

export function AppHeader({
  onBack,
  onNavigate,
  onOpenDashboard,
  onMenuClick,
  title = "HAD BETTER",
  searchQuery = "",
  onSearchChange,
  onSearchSubmit,
  currentPage = "search",
  showSearchBar = true,
}: AppHeaderProps) {
  const isContextTitle = title !== "HAD BETTER";
  const searchPlaceholder = isContextTitle
    ? title === "집"
      ? "집 위치를 입력해주세요"
      : title === "학교"
        ? "학교 위치를 입력해주세요"
        : title === "회사"
          ? "회사 위치를 입력해주세요"
          : "장소를 입력해주세요"
    : "목적지를 입력해주세요";
  const contextIconSrc =
    title === "집"
      ? imgWindow2
      : title === "학교"
        ? imgSaw1
        : title === "회사"
          ? imgCoinGold2
          : null;
  const hasTabs = !!onNavigate;
  // 탭이 없는 모달(PlaceSearchModal)에서는 헤더 높이를 줄여 지도 영역을 더 확보
  const headerHeight = hasTabs ? 206 : 150;
  const menuTop = hasTabs ? 23.93 : 18;
  const titleTop = hasTabs ? 33.29 : 24;
  const searchTop = hasTabs ? 78.03 : 62;
  // 뒤로가기 버튼은 타이틀 라인과 시각적으로 정렬되게(탭 없는 모달에서 약간 아래로)
  const backTop = hasTabs ? 26.01 : 20;
  const backRight = hasTabs ? 24.53 : 18;
  const searchBarHeight = hasTabs ? 63 : 56;
  const searchInnerTop = hasTabs ? 12.3 : 9.5;
  const searchInputHeight = hasTabs ? 36.752 : 32;

  return (
    <div className="relative w-full z-20">
      {/* 하늘색 배경 */}
      <div
        className="absolute bg-[#80cee1] left-0 top-0 w-full"
        style={{ height: `${headerHeight}px` }}
      >
        {/* bottom edge line (clean) */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-black/15" />
      </div>

      {/* 햄버거 메뉴 버튼: onMenuClick이 있을 때만 표시 */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="absolute bg-white border-3 border-black border-solid h-[43.697px] left-[21px] rounded-[12px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] w-[42px] z-10 hover:bg-[#f0f0f0] transition-colors"
          style={{ top: `${menuTop}px` }}
          data-name="Container"
        >
          <div className="absolute content-stretch flex flex-col items-start left-[6px] size-[24px] top-[6px]" data-name="Icon10">
            <div className="h-[24px] overflow-clip relative shrink-0 w-full" data-name="Icon">
              <div className="absolute contents inset-[20.83%_16.67%]" data-name="Icon">
                <div className="absolute inset-[20.83%_16.67%_79.17%_16.67%]" data-name="Vector">
                  <div className="absolute inset-[-1px_-6.25%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
                      <path d="M1 1H17" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-1/2 left-[16.67%] right-[16.67%] top-1/2" data-name="Vector_2">
                  <div className="absolute inset-[-1px_-6.25%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
                      <path d="M1 1H17" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
                <div className="absolute inset-[79.17%_16.67%_20.83%_16.67%]" data-name="Vector_3">
                  <div className="absolute inset-[-1px_-6.25%]">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
                      <path d="M1 1H17" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </button>
      )}

      {/* HAD BETTER 타이틀 */}
      {isContextTitle ? (
        <p
          className="absolute left-1/2 -translate-x-1/2 z-10 css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[18px] text-black leading-[22px]"
          style={{ top: `${titleTop}px` }}
        >
          {title}
        </p>
      ) : (
        <p
          className="absolute css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] h-[26.351px] leading-[30px] left-[50%] not-italic text-[16px] text-black text-center translate-x-[-50%] w-[195.542px] z-10"
          style={{ top: `${titleTop}px` }}
        >
          {title}
        </p>
      )}

      {/* 검색창 */}
      {showSearchBar && (
        <div
          className="absolute content-stretch flex flex-col items-start justify-end left-[28px] right-[30.54px] z-10"
          style={{ top: `${searchTop}px` }}
        >
          <div className="bg-white relative rounded-[25px] shrink-0 w-full" style={{ height: `${searchBarHeight}px` }}>
            <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none rounded-[25px]" />
            <div
              className="absolute content-stretch flex gap-[17px] items-center left-[17.79px] p-[2px] right-[18.93px]"
              style={{ top: `${searchInnerTop}px` }}
            >
              <div className="relative shrink-0 size-[30px]" data-name="hud_heart_empty 1">
                {isContextTitle ? (
                  contextIconSrc ? (
                    <img
                      alt=""
                      className="absolute inset-0 max-w-none object-contain pointer-events-none size-full"
                      src={contextIconSrc}
                    />
                  ) : (
                    <img
                      alt=""
                      className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                      src={imgHudHeartEmpty1}
                    />
                  )
                ) : (
                  <img
                    alt=""
                    className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                    src={imgHudHeartEmpty1}
                  />
                )}
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    onSearchSubmit?.();
                  }
                }}
                placeholder={searchPlaceholder}
                className="css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[30px] bg-transparent outline-none relative shrink-0 text-[13px] text-black w-full placeholder:text-[rgba(0,0,0,0.4)]"
                style={{ fontVariationSettings: "'wght' 400", height: `${searchInputHeight}px` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 네비게이션 탭: onNavigate가 있을 때만 표시 (PlaceSearchModal에서는 숨김) */}
      {onNavigate && (
        <div className="absolute bg-white content-stretch flex h-[43.697px] items-center justify-center left-0 top-[155.02px] w-full z-10">
          <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none" />
          <div className="content-stretch flex gap-[25px] items-center px-[25px] py-0 relative shrink-0 w-[351px]">
            <button
              onClick={() => onNavigate("map")}
              className={`bg-[rgba(255,255,255,0)] content-stretch flex h-[43px] items-center justify-center px-[10px] py-[5px] relative rounded-[40px] shrink-0 w-[57px] transition-colors ${
                currentPage === "map" ? "bg-[rgba(74,153,96,0.2)]" : "hover:bg-[rgba(255,255,255,0.3)]"
              }`}
              data-name="butenn"
            >
              <p className="css-ew64yg font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-black text-center">
                지도
              </p>
            </button>
            <button
              onClick={() => onNavigate("search")}
              className={`bg-[rgba(255,255,255,0)] content-stretch flex h-[43px] items-center justify-center px-[10px] py-[5px] relative rounded-[40px] shrink-0 w-[56px] transition-colors ${
                currentPage === "search" ? "bg-[rgba(74,153,96,0.2)]" : "hover:bg-[rgba(255,255,255,0.3)]"
              }`}
              data-name="butenn"
            >
              <p className="css-ew64yg font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-black text-center">
                검색
              </p>
            </button>
            <button
              onClick={() => onNavigate("subway")}
              className={`bg-[rgba(255,255,255,0)] content-stretch flex h-[43px] items-center justify-center px-[10px] py-[5px] relative rounded-[40px] shrink-0 w-[57px] transition-colors ${
                currentPage === "subway" ? "bg-[rgba(74,153,96,0.2)]" : "hover:bg-[rgba(255,255,255,0.3)]"
              }`}
              data-name="butenn"
            >
              <p className="css-ew64yg font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-black text-center">
                지하철
              </p>
            </button>
            <button
              onClick={onOpenDashboard}
              className={`bg-[rgba(255,255,255,0)] content-stretch flex h-[43px] items-center justify-center px-[10px] py-[5px] relative rounded-[40px] shrink-0 w-[56px] transition-colors ${
                currentPage === "favorites" ? "bg-[rgba(74,153,96,0.2)]" : "hover:bg-[rgba(255,255,255,0.3)]"
              }`}
              data-name="butenn"
            >
              <p className="css-ew64yg font-['Wittgenstein:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-black text-center">
                MY
              </p>
            </button>
          </div>
        </div>
      )}

      {/* 오른쪽 상단 뒤로 가기 버튼 */}
      <button
        onClick={onBack}
        className="absolute bg-white content-stretch flex h-[42.156px] items-center justify-center pl-[2.693px] pr-[2.704px] py-[2.693px] rounded-[14px] w-[40.312px] z-10 hover:scale-110 transition-transform"
        style={{ top: `${backTop}px`, right: `${backRight}px` }}
        data-name="Button"
      >
        <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]" />
        <div className="h-[23.995px] relative shrink-0 w-[16px]" data-name="Text">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
            <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[24px] left-[8px] not-italic text-[16px] text-black text-center top-[-0.63px] translate-x-[-50%]">
              ←
            </p>
          </div>
        </div>
      </button>
    </div>
  );
}
