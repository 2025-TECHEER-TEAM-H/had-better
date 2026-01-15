import { useEffect, useState } from "react";
import { mapApi } from "../utils/api";
import { useSavedPlaceStore } from "../stores/useSavedPlaceStore";

interface FavoritePlacesPageProps {
  onNavigate: (page: string, params?: any) => void;
}

interface FavoritePlace {
  id: number;
  name: string;
  address: string;
  category: string;
  emoji: string;
  visits: number;
}

// 카테고리에 따른 이모지 반환
const getEmojiByCategory = (category: string): string => {
  const categoryMap: Record<string, string> = {
    "카페": "☕",
    "주거": "🏠",
    "직장": "🏢",
    "운동": "💪",
    "음식점": "🍝",
    "문화시설": "📚",
    "야외": "🌳",
    "엔터테인먼트": "🎬",
  };
  return categoryMap[category] || "📍";
};

// 기본 즐겨찾기 데이터
const getDefaultFavoritePlaces = (): FavoritePlace[] => [
    {
      id: 1,
      name: "스타벅스 강남점",
      address: "서울 강남구 테헤란로 123",
      category: "카페",
      emoji: "☕",
      visits: 42,
    },
    {
      id: 2,
      name: "집",
      address: "서울 서초구 반포대로 456",
      category: "주거",
      emoji: "🏠",
      visits: 365,
    },
    {
      id: 3,
      name: "회사",
      address: "서울 강남구 테헤란로 789",
      category: "직장",
      emoji: "🏢",
      visits: 220,
    },
    {
      id: 4,
      name: "헬스장",
      address: "서울 강남구 역삼동 101",
      category: "운동",
      emoji: "💪",
      visits: 68,
    },
    {
      id: 5,
      name: "맛있는 파스타집",
      address: "서울 서초구 서초대로 234",
      category: "음식점",
      emoji: "🍝",
      visits: 15,
    },
    {
      id: 6,
      name: "도서관",
      address: "서울 강남구 선릉로 567",
      category: "문화시설",
      emoji: "📚",
      visits: 32,
    },
    {
      id: 7,
      name: "공원",
      address: "서울 서초구 매헌로 890",
      category: "야외",
      emoji: "🌳",
      visits: 28,
    },
    {
      id: 8,
      name: "영화관",
      address: "서울 강남구 강남대로 321",
      category: "엔터테인먼트",
      emoji: "🎬",
      visits: 19,
    },
  ];

export function FavoritePlacesPage({ onNavigate }: FavoritePlacesPageProps) {
  const [favoritePlaces, setFavoritePlaces] = useState<FavoritePlace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 즐겨찾기 스토어 구독
  const { savedPlaces, isLoading: storeLoading, fetchSavedPlaces } = useSavedPlaceStore();

  // 스토어에서 즐겨찾기 목록 동기화
  useEffect(() => {
    fetchSavedPlaces();
  }, [fetchSavedPlaces]);

  // 스토어 데이터를 컴포넌트 형식으로 변환
  useEffect(() => {
    if (savedPlaces.length > 0) {
      const transformedPlaces = savedPlaces
        .filter((sp) => !sp.deleted_at) // 삭제되지 않은 것만
        .map((sp) => ({
          id: sp.poi_place.poi_place_id,
          name: sp.name || sp.poi_place.name,
          address: sp.poi_place.address || "주소 정보 없음",
          category: sp.poi_place.category || sp.category || "기타",
          emoji: getEmojiByCategory(sp.poi_place.category || sp.category || ""),
          visits: 0, // API에 방문 횟수가 없으면 기본값
          savedPlaceId: sp.saved_place_id,
          poiPlace: sp.poi_place,
        }));
      setFavoritePlaces(transformedPlaces);
      setIsLoading(false);
    } else if (!storeLoading && savedPlaces.length === 0) {
      // 스토어가 로딩 중이 아니고 데이터가 없으면 빈 배열
      setFavoritePlaces([]);
      setIsLoading(false);
    }
  }, [savedPlaces, storeLoading]);

  const handlePlaceClick = async (place: FavoritePlace) => {
    // POI Place 정보가 있으면 사용
    const poiPlace = (place as any).poiPlace;
    if (poiPlace) {
      onNavigate('place-map', {
        place: {
          id: poiPlace.poi_place_id,
          poi_place_id: poiPlace.poi_place_id,
          name: place.name,
          emoji: place.emoji,
          distance: '1.2 KM', // 실제 거리 계산 필요
          status: 'OPEN',
          category: place.category,
          coordinates: poiPlace.coordinates,
          address: poiPlace.address,
        },
        fromFavorites: true,
      });
    } else {
      // 장소 상세 정보 가져오기
      try {
        const response = await mapApi.getPlace(place.id);
        if (response.success && response.data) {
          onNavigate('place-map', {
            place: {
              ...response.data,
              id: place.id,
              poi_place_id: place.id,
              name: place.name,
              emoji: place.emoji,
              distance: '1.2 KM',
              status: 'OPEN',
              category: place.category,
            },
            fromFavorites: true,
          });
        } else {
          // API 실패 시 기본 데이터로 이동
          onNavigate('place-map', {
            place: {
              id: place.id,
              poi_place_id: place.id,
              name: place.name,
              emoji: place.emoji,
              distance: '1.2 KM',
              status: 'OPEN',
              category: place.category,
            },
            fromFavorites: true,
          });
        }
      } catch (err) {
        console.error("Place fetch error:", err);
        // 에러 발생 시 기본 데이터로 이동
        onNavigate('place-map', {
          place: {
            id: place.id,
            poi_place_id: place.id,
            name: place.name,
            emoji: place.emoji,
            distance: '1.2 KM',
            status: 'OPEN',
            category: place.category,
          },
          fromFavorites: true,
        });
      }
    }
  };

  return (
    <div className="relative size-full bg-transparent overflow-hidden pointer-events-auto" style={{ pointerEvents: 'auto' }}>
      {/* 헤더 */}
      <div className="absolute bg-[#00d9ff] left-0 top-0 w-full border-b-[3.4px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] z-10">
        <div className="flex items-center justify-between px-5 py-3">
          <button
            onClick={() => onNavigate('full-map')}
            className="w-10 h-10 rounded-xl bg-white border-[2.72px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] flex items-center justify-center active:translate-y-1 active:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all"
          >
            <span className="font-['Press_Start_2P'] text-[16px] text-black">←</span>
          </button>
          <p className="font-['Press_Start_2P'] text-[12px] text-black">MY PLACES</p>
          <div className="w-10" />
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="absolute left-0 top-[64px] w-full h-[calc(100%-64px)] px-5 py-6 overflow-y-auto scrollbar-hide">
        {/* 헤더 정보 */}
        <div className="bg-white/90 border-[3.4px] border-black rounded-[12px] shadow-[4px_4px_0px_0px_black] p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <p className="text-[32px]">⭐</p>
            <div className="flex-1">
              <h2 className="font-['Press_Start_2P'] text-[14px] text-black leading-[20px] mb-1">자주 가는 곳</h2>
              <p className="font-['Press_Start_2P'] text-[8px] text-[#6b9080] leading-[12px]">총 {favoritePlaces.length}곳</p>
            </div>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="font-['Press_Start_2P'] text-[12px] text-[#6b9080]">로딩 중...</p>
          </div>
        )}


        {/* 즐겨찾기 리스트 */}
        {!isLoading && (
          <div className="space-y-4 pb-6">
            {favoritePlaces.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <p className="text-4xl mb-4">⭐</p>
                <p className="font-['Press_Start_2P'] text-[10px] text-[#6b9080] text-center">
                  즐겨찾기한 장소가 없습니다
                </p>
              </div>
            ) : (
              favoritePlaces.map((place: FavoritePlace) => (
                <button
                  key={place.id}
                  onClick={() => handlePlaceClick(place)}
                  className="w-full bg-white border-[3.4px] border-black rounded-[12px] shadow-[4px_4px_0px_0px_black] p-4 hover:scale-[1.02] active:translate-y-1 active:shadow-[2px_2px_0px_0px_black] transition-all text-left"
                >
                  <div className="flex items-start gap-4">
                    {/* 아이콘 */}
                    <div className="bg-gradient-to-br from-[#ffd93d] to-[#ffed4e] border-[2px] border-black size-[56px] flex items-center justify-center flex-shrink-0 rounded-lg">
                      <p className="text-[28px]">{place.emoji}</p>
                    </div>

                    {/* 장소 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-['Press_Start_2P'] text-[10px] text-black leading-[14px] truncate flex-1">
                          {place.name}
                        </h3>
                        <div className="bg-[#ff6b9d] border-[1.36px] border-black px-2 py-1 flex-shrink-0">
                          <p className="font-['Press_Start_2P'] text-[6px] text-white leading-[9px] whitespace-nowrap">
                            {place.category}
                          </p>
                        </div>
                      </div>

                      <p className="font-['Press_Start_2P'] text-[7px] text-[#6b9080] leading-[11px] mb-2 truncate">
                        {place.address}
                      </p>

                      {/* 방문 횟수 */}
                      <div className="flex items-center gap-2">
                        <div className="bg-[#00d9ff]/20 border-[1.36px] border-[#00d9ff] px-2 py-1 rounded">
                          <p className="font-['Press_Start_2P'] text-[6px] text-[#00d9ff] leading-[9px]">
                            {place.visits}회 방문
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 화살표 */}
                    <div className="flex items-center justify-center flex-shrink-0">
                      <p className="font-['Press_Start_2P'] text-[12px] text-[#6b9080]">›</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
