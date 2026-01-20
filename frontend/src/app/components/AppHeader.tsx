import imgHudHeartEmpty1 from "@/assets/hud-heart-empty.png";

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
  searchQuery = "",
  onSearchChange,
  onSearchSubmit,
  currentPage = "search",
  showSearchBar = true,
}: AppHeaderProps) {
  return (
    <div className="relative w-full z-20">
      {/* 하늘색 배경 */}
      <div className="absolute bg-[#80cee1] h-[206px] left-0 top-0 w-full" />

      {/* 햄버거 메뉴 버튼 */}
      <button
        onClick={onMenuClick}
        className="absolute bg-white border-3 border-black border-solid h-[43.697px] left-[21px] rounded-[12px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] top-[23.93px] w-[42px] z-10 hover:bg-[#f0f0f0] transition-colors"
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

      {/* HAD BETTER 타이틀 */}
      <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] h-[26.351px] leading-[30px] left-[50%] not-italic text-[16px] text-black text-center top-[33.29px] translate-x-[-50%] w-[195.542px] z-10">
        HAD BETTER
      </p>

      {/* 검색창 */}
      {showSearchBar && (
        <div className="absolute content-stretch flex flex-col items-start justify-end left-[28px] right-[30.54px] top-[78.03px] z-10">
          <div className="bg-white h-[63px] relative rounded-[25px] shrink-0 w-full">
            <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none rounded-[25px]" />
            <div className="absolute content-stretch flex gap-[17px] items-center left-[17.79px] p-[2px] right-[18.93px] top-[12.3px]">
              <div className="relative shrink-0 size-[30px]" data-name="hud_heart_empty 1">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHudHeartEmpty1} />
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
                placeholder="목적지를 입력해주세요"
                className="css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] h-[36.752px] leading-[30px] bg-transparent outline-none relative shrink-0 text-[13px] text-black w-full placeholder:text-[rgba(0,0,0,0.4)]"
                style={{ fontVariationSettings: "'wght' 400" }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 네비게이션 탭 */}
      <div className="absolute bg-white content-stretch flex h-[43.697px] items-center justify-center left-0 top-[155.02px] w-full z-10">
        <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none" />
        <div className="content-stretch flex gap-[25px] items-center px-[25px] py-0 relative shrink-0 w-[351px]">
          <button
            onClick={() => onNavigate?.("map")}
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
            onClick={() => onNavigate?.("search")}
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
            onClick={() => onNavigate?.("subway")}
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

      {/* 오른쪽 상단 뒤로 가기 버튼 */}
      <button
        onClick={onBack}
        className="absolute bg-white content-stretch flex h-[42.156px] items-center justify-center right-[24.53px] pl-[2.693px] pr-[2.704px] py-[2.693px] rounded-[14px] top-[26.01px] w-[40.312px] z-10 hover:scale-110 transition-transform"
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