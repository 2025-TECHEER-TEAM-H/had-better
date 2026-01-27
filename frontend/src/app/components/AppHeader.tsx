import imgCoinGold2 from "@/assets/coin-gold.png";
import imgHudHeartEmpty1 from "@/assets/hud-heart-empty.png";
import imgSaw1 from "@/assets/saw.png";
import imgWindow2 from "@/assets/window.png";

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
  /**
   * 검색 제출 핸들러
   * - 입력창의 현재 값이 인자로 전달됩니다.
   */
  onSearchSubmit?: (value: string) => void;
  currentPage?: PageType;
  showSearchBar?: boolean;
  /**
   * 탭이 없는 모달(예: PlaceSearchModal)에서 헤더/검색바의 배경 스타일을 선택합니다.
   * - glass: 기존 반투명/블러 스타일
   * - solid: 불투명한 단색 흰색 스타일 (슬라이드업 시트와 톤 통일용)
   */
  modalHeaderVariant?: "glass" | "solid";
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
  modalHeaderVariant = "glass",
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
  // SearchPage의 "지도 노출" 디자인을 위해 검색바 없는 경우 헤더를 더 컴팩트하게
  const headerHeight = hasTabs ? (showSearchBar ? 206 : 130) : showSearchBar ? 150 : 96;
  // 버튼 위치: 세이프 에어리어 포함해서 "상단 라인"에 정렬되게
  const menuTop = hasTabs ? 14 : 12;
  const sideInset = hasTabs ? 16 : 14;
  // 타이틀을 버튼의 수직 중앙에 맞춤 (버튼 높이 44px, 타이틀 line-height 30px 기준)
  const titleTop = hasTabs ? 21 : 19;
  const searchTop = hasTabs ? 78.03 : 62;
  // 뒤로가기 버튼은 타이틀 라인과 시각적으로 정렬되게(탭 없는 모달에서 약간 아래로)
  const backTop = hasTabs ? 14 : 12;
  const backRight = sideInset;
  const searchBarHeight = hasTabs ? 63 : 56;
  const searchInnerTop = hasTabs ? 12.3 : 9.5;
  const searchInputHeight = hasTabs ? 36.752 : 32;
  // 탭 위치도 세이프에어리어를 고려해, 상단 버튼들과 같은 리듬으로 맞춤
  const tabsTop = showSearchBar ? 155.02 : 70;
  const safeTop = "env(safe-area-inset-top, 0px)";
  const isModal = !hasTabs;
  const isModalGlass = isModal && showSearchBar && modalHeaderVariant === "glass";
  const isModalSolid = isModal && showSearchBar && modalHeaderVariant === "solid";

  // PlaceSearchModal 하단 슬라이드업 시트와 동일한 토큰(톤)으로 맞추기
  const sheetBg =
    "linear-gradient(135deg, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.75) 100%)";
  const sheetBorder = "1px solid rgba(255,255,255,0.40)";
  // 하단 시트는 위로 그림자가 져서(0 -4px ...) 뜨는 느낌인데,
  // 헤더는 아래 방향 그림자가 자연스러워서 y만 반대로 맞춥니다(톤/강도는 동일).
  const sheetShadowHeader = "0 4px 8px 0px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.30)";
  const sheetBackdrop = "blur(18px) saturate(160%)";

  const headerBg = isModalSolid
    ? sheetBg
    : isModalGlass
      ? "linear-gradient(135deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.14) 100%)"
      : showSearchBar
        ? "linear-gradient(180deg, rgba(197,231,245,1) 0%, rgba(217,243,255,0.75) 40%, rgba(255,255,255,0.18) 78%, rgba(255,255,255,0) 100%)"
        : "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(197,231,245,0.65) 55%, rgba(255,255,255,0) 100%)";

  return (
    <div className="relative w-full z-20">
      {/* 하늘색 배경 (clean) - PlaceSearchModal에서는 glassmorphism */}
      <div
        className="absolute left-0 top-0 w-full"
        style={{ height: `${headerHeight}px` }}
      >
        <div
          className={`absolute inset-0 ${isModalGlass || isModalSolid ? "backdrop-blur-[18px] saturate-[160%]" : ""}`}
          style={{
            background: headerBg,
            ...(isModalGlass
              ? {
                  border: "1px solid rgba(255,255,255,0.38)",
                  boxShadow: "0 18px 36px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.28)",
                }
              : isModalSolid
                ? {
                    border: sheetBorder,
                    boxShadow: sheetShadowHeader,
                    backdropFilter: sheetBackdrop,
                    WebkitBackdropFilter: sheetBackdrop,
                  }
                : {}),
          }}
        />
        {/* bottom edge line (HUD style) - 숨김 처리 (PlaceSearchModal에서 검색창 느낌을 위해) */}
        {hasTabs && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/25" />}
      </div>

      {/* 햄버거 메뉴 버튼: onMenuClick이 있을 때만 표시 */}
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="absolute bg-white/95 backdrop-blur h-[44px] rounded-[16px] shadow-[0px_6px_0px_rgba(0,0,0,0.26)] border-2 border-black/25 w-[44px] z-10 hover:bg-white transition-colors active:translate-y-[1px] active:shadow-[0px_4px_0px_rgba(0,0,0,0.26)]"
          style={{
            left: `${sideInset}px`,
            top: `calc(${menuTop}px + env(safe-area-inset-top, 0px))`,
          }}
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
          className="absolute left-1/2 -translate-x-1/2 z-10 css-4hzbpn font-['Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[18px] leading-[30px]"
          style={{ 
            top: `calc(${titleTop}px + ${safeTop})`,
            color: '#000000',
            opacity: 1
          }}
        >
          {title}
        </p>
      ) : (
        <p
          className="absolute css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] leading-[30px] left-[50%] not-italic text-[16px] text-center translate-x-[-50%] w-[195.542px] z-10"
          style={{ 
            top: `calc(${titleTop}px + ${safeTop})`,
            color: '#000000',
            opacity: 1
          }}
        >
          {title}
        </p>
      )}

      {/* 검색창 */}
      {showSearchBar && (
        <div
          className="absolute content-stretch flex flex-col items-start justify-end z-10"
          style={{
            left: `${sideInset}px`,
            right: `${sideInset}px`,
            top: `calc(${searchTop}px + ${safeTop})`,
          }}
        >
          <div
            className={`relative rounded-[18px] shrink-0 w-full overflow-hidden ${
              isModalSolid
                ? ""
                : !hasTabs
                  ? "border-2 border-black/25 shadow-[0px_6px_0px_rgba(0,0,0,0.22)]"
                  : "border-2 border-black/25 shadow-[0px_6px_0px_rgba(0,0,0,0.22)]"
            }`}
            style={{
              height: `${searchBarHeight}px`,
              background: isModalSolid
                ? sheetBg
                : !hasTabs
                  ? "linear-gradient(135deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.14) 100%)"
                  : "rgba(255,255,255,0.95)",
              backdropFilter: isModalSolid ? sheetBackdrop : isModalGlass ? sheetBackdrop : !hasTabs ? undefined : "blur(8px)",
              WebkitBackdropFilter: isModalSolid ? sheetBackdrop : isModalGlass ? sheetBackdrop : !hasTabs ? undefined : "blur(8px)",
              border: isModalSolid ? sheetBorder : isModalGlass ? "1px solid rgba(255,255,255,0.38)" : undefined,
              boxShadow: isModalSolid ? sheetShadowHeader : isModalGlass ? "0 18px 36px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.28)" : undefined,
            }}
          >
            {/* 집 - 노란색 원형 그라데이션 (아이콘 뒤) */}
            {!hasTabs && title === "집" && (
              <div
                className="absolute left-[17.79px] top-1/2 -translate-y-1/2 w-[80px] h-[80px] pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(255,230,107,0.35) 0%, rgba(255,230,107,0.20) 40%, transparent 70%)",
                }}
              />
            )}
            {/* 학교 - 민트 그린 원형 그라데이션 (아이콘 뒤) */}
            {!hasTabs && title === "학교" && (
              <div
                className="absolute left-[17.79px] top-1/2 -translate-y-1/2 w-[80px] h-[80px] pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(110,231,183,0.35) 0%, rgba(110,231,183,0.20) 40%, transparent 70%)",
                }}
              />
            )}
            {/* 회사 - 코랄 핑크 원형 그라데이션 (아이콘 뒤) */}
            {!hasTabs && title === "회사" && (
              <div
                className="absolute left-[17.79px] top-1/2 -translate-y-1/2 w-[80px] h-[80px] pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(255,138,138,0.35) 0%, rgba(255,138,138,0.20) 40%, transparent 70%)",
                }}
              />
            )}
            <div
              className="absolute content-stretch flex gap-[17px] items-center left-[17.79px] p-[2px] right-[18.93px]"
              style={{ top: `${searchInnerTop}px` }}
            >
              <div
                className="relative shrink-0 size-[30px] rounded-[8px] flex items-center justify-center"
                data-name="hud_heart_empty 1"
                style={
                  title === "집"
                    ? {
                        background: "linear-gradient(135deg, rgba(255,230,107,0.75) 0%, rgba(255,230,107,0.60) 100%)",
                        border: "1px solid rgba(255,255,255,0.45)",
                        boxShadow: "0 4px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.30)",
                        backdropFilter: "blur(8px) saturate(140%)",
                        WebkitBackdropFilter: "blur(8px) saturate(140%)",
                      }
                    : undefined
                }
              >
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
                  const value = (e.currentTarget as HTMLInputElement).value;
                  if (e.key === 'Enter' && value.trim()) {
                    onSearchSubmit?.(value);
                  }
                }}
                placeholder={searchPlaceholder}
                className="css-4hzbpn font-['Pretendard','Noto_Sans_KR',sans-serif] leading-[30px] bg-transparent outline-none relative shrink-0 text-[14px] text-black w-full placeholder:text-black/40"
                style={{ fontVariationSettings: "'wght' 400", height: `${searchInputHeight}px` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 네비게이션 탭: onNavigate가 있을 때만 표시 (PlaceSearchModal에서는 숨김) */}
      {onNavigate && (
        <div
          className="absolute z-10"
          style={{
            left: `${sideInset}px`,
            right: `${sideInset}px`,
            top: `calc(${tabsTop}px + ${safeTop})`,
          }}
        >
          <div className="bg-white/92 backdrop-blur rounded-[18px] border-2 border-black/25 shadow-[0px_6px_0px_rgba(0,0,0,0.22)] h-[44px] flex items-center justify-center">
            <div className="grid grid-cols-4 gap-2 items-center px-2 w-full">
            <button
              onClick={() => onNavigate("map")}
              className={`w-full content-stretch flex h-[36px] items-center justify-center px-3 py-[5px] relative rounded-[999px] transition-colors active:translate-y-[1px] ${
                currentPage === "map" ? "bg-[#4a9960]/20 text-[#2d5f3f]" : "hover:bg-black/5 text-black/80"
              }`}
              data-name="butenn"
            >
              {currentPage === "map" && (
                <span
                  aria-hidden="true"
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-[6px] rounded-full bg-[#4a9960]"
                />
              )}
              <p className="css-ew64yg font-['Pretendard','Noto_Sans_KR',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-current text-center">
                지도
              </p>
            </button>
            <button
              onClick={() => onNavigate("search")}
              className={`w-full content-stretch flex h-[36px] items-center justify-center px-3 py-[5px] relative rounded-[999px] transition-colors active:translate-y-[1px] ${
                currentPage === "search" ? "bg-[#4a9960]/20 text-[#2d5f3f]" : "hover:bg-black/5 text-black/80"
              }`}
              data-name="butenn"
            >
              {currentPage === "search" && (
                <span
                  aria-hidden="true"
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-[6px] rounded-full bg-[#4a9960]"
                />
              )}
              <p className="css-ew64yg font-['Pretendard','Noto_Sans_KR',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-current text-center">
                검색
              </p>
            </button>
            <button
              onClick={() => onNavigate("subway")}
              className={`w-full content-stretch flex h-[36px] items-center justify-center px-3 py-[5px] relative rounded-[999px] transition-colors active:translate-y-[1px] ${
                currentPage === "subway" ? "bg-[#4a9960]/20 text-[#2d5f3f]" : "hover:bg-black/5 text-black/80"
              }`}
              data-name="butenn"
            >
              {currentPage === "subway" && (
                <span
                  aria-hidden="true"
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-[6px] rounded-full bg-[#4a9960]"
                />
              )}
              <p className="css-ew64yg font-['Pretendard','Noto_Sans_KR',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-current text-center">
                지하철
              </p>
            </button>
            <button
              onClick={onOpenDashboard}
              className={`w-full content-stretch flex h-[36px] items-center justify-center px-3 py-[5px] relative rounded-[999px] transition-colors active:translate-y-[1px] ${
                currentPage === "favorites" ? "bg-[#4a9960]/20 text-[#2d5f3f]" : "hover:bg-black/5 text-black/80"
              }`}
              data-name="butenn"
            >
              {currentPage === "favorites" && (
                <span
                  aria-hidden="true"
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-[6px] rounded-full bg-[#4a9960]"
                />
              )}
              <p className="css-ew64yg font-['Pretendard','Noto_Sans_KR',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-current text-center">
                MY
              </p>
            </button>
          </div>
          </div>
        </div>
      )}

      {/* 오른쪽 상단 뒤로 가기 버튼 */}
      <button
        onClick={onBack}
        className="absolute content-stretch flex h-[44px] items-center justify-center rounded-[16px] w-[44px] z-10 hover:opacity-90 active:translate-y-[1px] transition-all"
        style={{
          top: `calc(${backTop}px + env(safe-area-inset-top, 0px))`,
          right: `${backRight}px`,
          background: isModalSolid
            ? sheetBg
            : !hasTabs
              ? "linear-gradient(135deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.14) 100%)"
              : "rgba(255,255,255,0.95)",
          backdropFilter: isModalSolid ? sheetBackdrop : isModalGlass ? sheetBackdrop : !hasTabs ? undefined : "blur(8px)",
          WebkitBackdropFilter: isModalSolid ? sheetBackdrop : isModalGlass ? sheetBackdrop : !hasTabs ? undefined : "blur(8px)",
          border: isModalSolid ? sheetBorder : isModalGlass ? "1px solid rgba(255,255,255,0.38)" : "2px solid rgba(0,0,0,0.25)",
          boxShadow: isModalGlass
            ? "0 18px 36px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.28)"
            : isModalSolid
              ? sheetShadowHeader
              : "0px 6px 0px rgba(0,0,0,0.22)",
        }}
        data-name="Button"
      >
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
