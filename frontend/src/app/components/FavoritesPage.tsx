interface FavoritesPageProps {
  onBack?: () => void;
  onNavigate?: (page: "map" | "search" | "favorites" | "subway") => void;
  isSubwayMode?: boolean;
}

export function FavoritesPage({ onBack, onNavigate, isSubwayMode = false }: FavoritesPageProps) {
  return (
    <div className="h-full w-full bg-gradient-to-b from-[#c5e7f5] to-[#e8f4f8] flex flex-col">
      {/* 헤더 */}
      <div className="bg-gradient-to-b from-[rgba(90,141,176,0.8)] to-[rgba(74,127,167,0.8)] border-b-[3.4px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.2)] p-5">
        <div className="flex items-center justify-between mb-4 relative">
          <div className="flex gap-1">
            <div className="bg-[rgba(255,255,255,0.8)] size-[3.995px]" />
            <div className="bg-[rgba(255,255,255,0.8)] size-[3.995px]" />
            <div className="bg-[rgba(255,255,255,0.8)] size-[3.995px]" />
          </div>
          <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] text-[12px] text-white absolute left-1/2 -translate-x-1/2">
            Had better...
          </p>
          <button onClick={onBack} className="text-white text-[16px] hover:scale-110 transition-transform">
            ←
          </button>
        </div>

        {/* 검색 바 */}
        <div className="relative">
          <div className="bg-[rgba(255,255,255,0.2)] h-[48px] rounded-[14px] border-[1.36px] border-[rgba(255,255,255,0.3)] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.1)] focus-within:bg-[rgba(255,255,255,0.3)] focus-within:border-[rgba(255,255,255,0.5)] transition-colors">
            <input
              type="text"
              placeholder="장소 검색"
              className="w-full h-full pl-[48px] pr-[16px] bg-transparent outline-none css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-white placeholder:text-[rgba(255,255,255,0.5)]"
            />
          </div>
          <div className="absolute left-[16px] top-[10px] text-[18px] pointer-events-none">
            🔍
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex mt-4 border-t-[1.36px] border-[rgba(255,255,255,0.2)] pt-[1.36px]">
          <button
            onClick={() => onNavigate?.("map")}
            className="flex-1 h-[39.989px] css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[rgba(255,255,255,0.7)] hover:text-white transition-colors"
          >
            지도
          </button>
          <button
            onClick={() => onNavigate?.("search")}
            className="flex-1 h-[39.989px] css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[rgba(255,255,255,0.7)] hover:text-white transition-colors"
          >
            검색
          </button>
          <button
            onClick={() => onNavigate?.("subway")}
            className={`flex-1 css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[12px] ${
              isSubwayMode
                ? "h-[42.709px] text-[#48d448] border-b-[2.72px] border-[#48d448]"
                : "h-[39.989px] text-[rgba(255,255,255,0.7)] hover:text-white transition-colors"
            }`}
          >
            지하철
          </button>
          <button
            className={`flex-1 css-ew64yg font-['Press_Start_2P:Regular',sans-serif] text-[12px] ${
              !isSubwayMode
                ? "h-[42.709px] text-[#48d448] border-b-[2.72px] border-[#48d448]"
                : "h-[39.989px] text-[rgba(255,255,255,0.7)] hover:text-white transition-colors"
            }`}
          >
            MY
          </button>
        </div>
      </div>

      {/* 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto p-5">
        {isSubwayMode ? (
          // 지하철 노선도 표시
          <div className="w-full h-full flex items-center justify-center">
            <p className="css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#2d5f3f]">
              노선도 이미지가 나왔습니다
            </p>
          </div>
        ) : (
          // 즐겨찾기 컨텐츠
          <>
            <h2 className="css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[18px] text-[#2d5f3f] mb-6">
              즐겨찾기
            </h2>

            {/* 즐겨찾기 목록 */}
            <div className="space-y-4">
              <button
                onClick={() => alert('집으로 이동')}
                className="w-full bg-[rgba(255,255,255,0.9)] rounded-[16px] border-[2.72px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.2)] p-4 hover:shadow-[0px_6px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[-2px] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#4caf50] rounded-full size-[40px] border-3 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] flex items-center justify-center text-[20px]">
                    🏠
                  </div>
                  <div className="flex-1 text-left">
                    <p className="css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#2d5f3f] mb-1">
                      집
                    </p>
                    <p className="css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[10px] text-[#6b9080]">
                      서울시 강남구
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => alert('회사 주소를 등록하세요')}
                className="w-full bg-[rgba(198,198,198,0.9)] rounded-[16px] border-[2.72px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.2)] p-4 hover:shadow-[0px_6px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[-2px] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#2196f3] rounded-full size-[40px] border-3 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] flex items-center justify-center text-[20px]">
                    🏢
                  </div>
                  <div className="flex-1 text-left">
                    <p className="css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#2d5f3f] mb-1">
                      회사
                    </p>
                    <p className="css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[10px] text-[#6b9080]">
                      등록된 주소 없음
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => alert('즐겨찾는 장소를 추가하세요')}
                className="w-full bg-[rgba(175,175,175,0.9)] rounded-[16px] border-[2.72px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.2)] p-4 hover:shadow-[0px_6px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[-2px] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#ffc107] rounded-full size-[40px] border-3 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] flex items-center justify-center text-[20px]">
                    ⭐
                  </div>
                  <div className="flex-1 text-left">
                    <p className="css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-[#2d5f3f] mb-1">
                      즐겨찾기
                    </p>
                    <p className="css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[10px] text-[#6b9080]">
                      즐겨찾는 장소를 추가하세요
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* 새 장소 추가 버튼 */}
            <button
              onClick={() => alert('새 장소 추가 화면')}
              className="w-full mt-6 bg-[#666] h-[56px] rounded-[16px] border-[2.72px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2 hover:shadow-[0px_6px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[-2px] active:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-[2px] transition-all"
            >
              <span className="text-[24px]">➕</span>
              <span className="css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-white">
                새 장소 추가
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
