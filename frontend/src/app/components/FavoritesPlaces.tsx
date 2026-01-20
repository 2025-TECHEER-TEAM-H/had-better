import { useState } from "react";
import { PlaceDetailPage } from "@/app/components/PlaceDetailPage";
import { SearchResultsPage } from "@/app/components/SearchResultsPage";

interface FavoritePlace {
  id: number;
  name: string;
  address: string;
  distance: string;
  icon: string;
  isFavorited: boolean;
}

interface FavoritesPlacesProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
  onOpenDashboard?: () => void;
  onOpenSubway?: () => void;
}

export function FavoritesPlaces({ isOpen, onClose, onNavigate, onOpenDashboard, onOpenSubway }: FavoritesPlacesProps) {
  const [favorites, setFavorites] = useState<FavoritePlace[]>([
    {
      id: 1,
      name: "스타벅스 강남점",
      address: "서울 강남구 테헤란로 123",
      distance: "거리",
      icon: "☕",
      isFavorited: true,
    },
    {
      id: 2,
      name: "스타벅스 강남점",
      address: "서울 강남구 테헤란로 123",
      distance: "거리",
      icon: "🏠",
      isFavorited: true,
    },
    {
      id: 3,
      name: "인천대학교",
      address: "서울 강남구 테헤란로 123",
      distance: "거리",
      icon: "🏢",
      isFavorited: true,
    },
    {
      id: 4,
      name: "부평 헬스장",
      address: "서울 강남구 테헤란로 123",
      distance: "거리",
      icon: "💪",
      isFavorited: true,
    },
  ]);

  const [selectedPlace, setSelectedPlace] = useState<FavoritePlace | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(
      favorites.map((place) =>
        place.id === id ? { ...place, isFavorited: !place.isFavorited } : place
      )
    );
  };

  const toggleFavoriteById = (id: string) => {
    const numId = parseInt(id);
    setFavorites(
      favorites.map((place) =>
        place.id === numId ? { ...place, isFavorited: !place.isFavorited } : place
      )
    );
    // selectedPlace도 업데이트
    if (selectedPlace && selectedPlace.id === numId) {
      setSelectedPlace({ ...selectedPlace, isFavorited: !selectedPlace.isFavorited });
    }
  };

  const handlePlaceClick = (place: FavoritePlace) => {
    setSelectedPlace(place);
    setIsDetailOpen(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-gradient-to-b from-[#daf4ff] to-white w-full max-w-[388px] h-[838px] max-h-[90vh] rounded-[40px] overflow-hidden relative shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="relative px-8 pt-[18px] pb-4">
          {/* 타이틀 배경 */}
          <div className="bg-white border-2 border-black rounded-[16px] h-[42px] flex items-center justify-center mb-6">
            <p className="font-['Wittgenstein:Bold_Italic','Noto_Sans_KR:Bold',sans-serif] font-bold italic text-[20px] text-black">
              자주 가는 곳
            </p>
          </div>

          {/* 뒤로가기 버튼 */}
          <button
            onClick={onClose}
            className="absolute top-[18px] right-8 bg-white rounded-[14px] size-[40px] flex items-center justify-center border-[2.693px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-50 active:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-[2px] transition-all"
          >
            <p className="font-['Press_Start_2P:Regular',sans-serif] text-[16px] text-black">←</p>
          </button>
        </div>

        {/* 리스트 영역 */}
        <div className="px-5 pb-6 overflow-y-auto h-[calc(100%-90px)]">
          <div className="flex flex-col gap-3">
            {favorites.map((place) => (
              <div
                key={place.id}
                onClick={() => handlePlaceClick(place)}
                className="bg-white rounded-[12px] border-[3.366px] border-black shadow-[4px_4px_0px_0px_black] p-5 relative hover:shadow-[6px_6px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
              >
                {/* 아이콘과 정보 */}
                <div className="flex gap-4 items-start">
                  {/* 아이콘 */}
                  <div className="bg-gradient-to-b from-[#ffd93d] to-[#ffed4e] rounded-[10px] size-[56px] flex items-center justify-center border-[1.346px] border-black shrink-0">
                    <p className="text-[28px] leading-[42px]">{place.icon}</p>
                  </div>

                  {/* 장소 정보 */}
                  <div className="flex-1 pt-2">
                    <p className="font-['Wittgenstein:Bold_Italic','Noto_Sans_KR:Bold',sans-serif] font-bold italic text-[20px] text-black leading-[14px] mb-2">
                      {place.name}
                    </p>
                    <p className="font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] text-[10px] text-[#6b9080] leading-[11px] mb-2">
                      {place.address}
                    </p>
                    <div className="bg-[rgba(0,217,255,0.2)] border-[1.346px] border-[#00d9ff] rounded-[4px] inline-flex items-center px-[9px] py-[5px]">
                      <p className="font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[6px] text-[#00d9ff] leading-[9px]">
                        {place.distance}
                      </p>
                    </div>
                  </div>

                  {/* 즐겨찾기 버튼 */}
                  <button
                    onClick={(e) => toggleFavorite(place.id, e)}
                    className="bg-white rounded-[14px] size-[48px] flex items-center justify-center border-[2.693px] border-black shadow-[4px_4px_0px_0px_black] hover:bg-gray-50 active:shadow-[2px_2px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all shrink-0"
                  >
                    <p className="text-[32px] leading-[48px]">
                      {place.isFavorited ? "⭐" : "☆"}
                    </p>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 장소 상세 정보 모달 */}
      {isDetailOpen && selectedPlace && (
        <PlaceDetailPage
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          place={selectedPlace}
          onToggleFavorite={toggleFavoriteById}
          onStartNavigation={() => {
            console.log("경로 안내 시작:", selectedPlace.name);
            setIsDetailOpen(false);
            // 여기에 경로 안내 시작 로직 추가 가능
          }}
          onSearchSubmit={(query) => {
            setSearchQuery(query);
            setIsDetailOpen(false);
            setIsSearchResultsOpen(true);
          }}
          onNavigate={onNavigate}
          onOpenDashboard={onOpenDashboard}
          onOpenSubway={onOpenSubway}
        />
      )}

      {/* 검색 결과 모달 */}
      {isSearchResultsOpen && (
        <SearchResultsPage
          isOpen={isSearchResultsOpen}
          onClose={() => setIsSearchResultsOpen(false)}
          searchQuery={searchQuery}
          onPlaceClick={(result) => {
            // 검색 결과를 FavoritePlace 형식으로 변환
            const place: FavoritePlace = {
              id: parseInt(result.id),
              name: result.name,
              address: "서울 강남구",
              distance: result.distance || "0.5 KM",
              icon: result.icon,
              isFavorited: result.isFavorited || false,
            };
            setIsSearchResultsOpen(false);
            handlePlaceClick(place);
          }}
        />
      )}
    </div>
  );
}