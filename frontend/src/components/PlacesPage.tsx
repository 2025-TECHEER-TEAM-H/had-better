import { useState, useRef, useEffect } from "react";
import svgPaths from "../imports/svg-2mccnqcvdk";
import imgImageFullMap from "../assets/506d3ac81771f7af9c2519c77e86748254304713.png";
import { mapApi } from "../utils/api";
import type { Place } from "../utils/api";
import { useSavedPlaceStore } from "../stores/useSavedPlaceStore";

interface PlacesPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function PlacesPage({ onNavigate }: PlacesPageProps) {
  const [sheetPosition, setSheetPosition] = useState(50); // 50% 높이에서 시작
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startPositionRef = useRef(50);
  const [places, setPlaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 즐겨찾기 스토어
  const { isPlaceSaved, toggleSavedPlace, fetchSavedPlaces } = useSavedPlaceStore();

  // 즐겨찾기 목록 로드
  useEffect(() => {
    fetchSavedPlaces();
  }, [fetchSavedPlaces]);

  // API에서 장소 데이터 가져오기
  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await mapApi.getPlaces();
        if (response.success && response.data) {
          // API 데이터를 컴포넌트 형식에 맞게 변환
          const transformedPlaces = response.data.map((place: Place, index: number) => {
            const placeId = typeof place.id === 'number' ? place.id : (typeof place.id === 'string' ? parseInt(place.id) : place.id || 0);
            return {
              ...place, // 원본 데이터를 먼저 펼치고
              id: placeId, // 필요한 필드만 덮어쓰기
              name: place.name.toUpperCase(),
              emoji: getEmojiByCategory(place.category || ""),
              distance: `${(Math.random() * 2 + 0.5).toFixed(1)} KM`, // 임시 거리 계산
              status: 'OPEN', // 임시 상태
              bgColor: getColorByIndex(index),
              statusColor: 'white',
              textColor: 'black',
            };
          });
          setPlaces(transformedPlaces);
        } else {
          // API 실패 시 기본 데이터 사용
          setPlaces(getDefaultPlaces());
          setError(response.error || "장소를 불러오는데 실패했습니다");
        }
      } catch (err) {
        // 에러 발생 시 기본 데이터 사용
        setPlaces(getDefaultPlaces());
        setError("장소를 불러오는데 실패했습니다");
        console.error("Places fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaces();
  }, []);

  // 카테고리에 따른 이모지 반환
  const getEmojiByCategory = (category: string): string => {
    const categoryMap: Record<string, string> = {
      "공원": "🏞️",
      "카페": "☕",
      "병원": "🏥",
      "서점": "📚",
      "식당": "🍽️",
      "헬스": "💪",
      "마트": "🛒",
      "펫샵": "🏪",
    };
    return categoryMap[category] || "📍";
  };

  // 인덱스에 따른 색상 반환
  const getColorByIndex = (index: number): string => {
    const colors = [
      '#7ed321', '#00d9ff', 'white', '#ffc107',
      '#ff9ff3', '#54a0ff', '#ff6348', '#48dbfb'
    ];
    return colors[index % colors.length];
  };

  // 기본 장소 데이터 (숫자 ID 사용)
  const getDefaultPlaces = () => [
    { id: 1, name: 'CENTRAL PARK', emoji: '🏞️', distance: '2.5 KM', status: 'OPEN', bgColor: '#7ed321', statusColor: 'white', textColor: 'black' },
    { id: 2, name: 'PET SHOP', emoji: '🏪', distance: '0.8 KM', status: 'OPEN', bgColor: '#00d9ff', statusColor: 'white', textColor: 'black' },
    { id: 3, name: 'VET CLINIC', emoji: '🏥', distance: '1.2 KM', status: 'CLOSED', bgColor: 'white', statusColor: '#ff6b9d', textColor: 'black' },
    { id: 4, name: 'COFFEE SHOP', emoji: '☕', distance: '0.5 KM', status: 'OPEN', bgColor: '#ffc107', statusColor: 'white', textColor: 'black' },
    { id: 5, name: 'BOOKSTORE', emoji: '📚', distance: '1.5 KM', status: 'OPEN', bgColor: '#ff9ff3', statusColor: 'white', textColor: 'black' },
    { id: 6, name: 'RESTAURANT', emoji: '🍽️', distance: '1.8 KM', status: 'OPEN', bgColor: '#54a0ff', statusColor: 'white', textColor: 'white' },
    { id: 7, name: 'FITNESS GYM', emoji: '💪', distance: '2.0 KM', status: 'OPEN', bgColor: '#ff6348', statusColor: 'white', textColor: 'white' },
    { id: 8, name: 'SUPERMARKET', emoji: '🛒', distance: '1.0 KM', status: 'OPEN', bgColor: '#48dbfb', statusColor: 'white', textColor: 'black' },
  ];

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    startYRef.current = e.touches[0].clientY;
    startPositionRef.current = sheetPosition;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const deltaY = startYRef.current - e.touches[0].clientY;
    const windowHeight = window.innerHeight;
    const deltaPercent = (deltaY / windowHeight) * 100;

    const newPosition = Math.max(10, Math.min(90, startPositionRef.current + deltaPercent));
    setSheetPosition(newPosition);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // 스냅 포인트: 10% (거의 닫힘), 50% (반), 90% (거의 전체)
    if (sheetPosition < 30) {
      setSheetPosition(10);
    } else if (sheetPosition < 70) {
      setSheetPosition(50);
    } else {
      setSheetPosition(90);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startPositionRef.current = sheetPosition;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaY = startYRef.current - e.clientY;
    const windowHeight = window.innerHeight;
    const deltaPercent = (deltaY / windowHeight) * 100;

    const newPosition = Math.max(10, Math.min(90, startPositionRef.current + deltaPercent));
    setSheetPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // 스냅 포인트
    if (sheetPosition < 30) {
      setSheetPosition(10);
    } else if (sheetPosition < 70) {
      setSheetPosition(50);
    } else {
      setSheetPosition(90);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, sheetPosition]);

  return (
    <div className="relative size-full overflow-hidden">
      {/* 전체 화면 배경 지도 */}
      <div className="absolute inset-0">
        <img alt="" className="w-full h-full object-cover" src={imgImageFullMap} />
      </div>

      {/* 헤더 */}
      <div className="absolute bg-[#00d9ff] left-0 top-0 w-full border-b-[3.4px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] z-30">
        <div className="flex items-center justify-between px-5 py-3">
          <p className="font-['Press_Start_2P'] text-[12px] text-black">9:41</p>
          <p className="font-['Press_Start_2P'] text-[12px] text-black">MAP PLACES</p>
          <div className="flex gap-1">
            <div className="bg-black size-[4px]" />
            <div className="bg-black size-[4px]" />
            <div className="bg-black size-[4px]" />
          </div>
        </div>
      </div>

      {/* 슬라이드 가능한 바텀 시트 */}
      <div
        className="absolute left-0 right-0 bg-white rounded-t-[24px] border-t-[3.4px] border-l-[3.4px] border-r-[3.4px] border-black shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] z-20 transition-all"
        style={{
          height: `${sheetPosition}%`,
          bottom: 0,
          transitionDuration: isDragging ? '0ms' : '300ms'
        }}
      >
        {/* 드래그 핸들 */}
        <div
          className="w-full py-4 cursor-grab active:cursor-grabbing flex justify-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* 장소 목록 */}
        <div className="px-5 pb-[72px] overflow-y-auto h-[calc(100%-60px)] scrollbar-hide">
          <div className="flex flex-col gap-4">
            {places.map(place => (
              <div
                key={place.id}
                onClick={() => onNavigate('place-map', { place })}
                className="rounded-[10px] border-[3.4px] border-black shadow-[4px_4px_0px_0px_black] p-5 flex gap-3 hover:scale-105 transition-transform active:translate-y-1 cursor-pointer"
                style={{ backgroundColor: place.bgColor }}
              >
                <div className="bg-white border-[1.36px] border-black size-[64px] flex items-center justify-center">
                  <p className="text-[30px]">{place.emoji}</p>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-['Press_Start_2P'] text-[10px] leading-[15px] flex-1" style={{ color: place.textColor }}>{place.name}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const poiPlaceId = typeof place.id === 'string' ? parseInt(place.id) : (place.id || 0);
                        console.log('PlacesPage - 별 클릭:', { placeId: place.id, poiPlaceId });
                        if (poiPlaceId > 0) {
                          toggleSavedPlace(poiPlaceId, undefined, place.name);
                        }
                      }}
                      className={`flex-shrink-0 w-10 h-10 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center hover:scale-105 active:translate-y-1 active:shadow-[2px_2px_0px_0px_black] transition-all z-20 relative ${
                        (() => {
                          const checkId = typeof place.id === 'string' ? parseInt(place.id) : (place.id || 0);
                          return isPlaceSaved(checkId) ? 'bg-white' : 'bg-gray-100';
                        })()
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      <span className="text-[20px] leading-none">
                        {(() => {
                          const checkId = typeof place.id === 'string' ? parseInt(place.id) : (place.id || 0);
                          return isPlaceSaved(checkId) ? '⭐' : '☆';
                        })()}
                      </span>
                    </button>
                  </div>
                  <div className="flex gap-1 items-start">
                    <div className="bg-[#ffd93d] border-[1.36px] border-black px-2 py-1">
                      <p className="font-['Press_Start_2P'] text-[6px] text-black leading-[9px]">{place.distance}</p>
                    </div>
                    <div className="border-[1.36px] border-black px-2 py-1" style={{ backgroundColor: place.status === 'CLOSED' ? '#ff6b9d' : 'white' }}>
                      <p className="font-['Press_Start_2P'] text-[6px] leading-[9px]" style={{ color: place.status === 'CLOSED' ? 'white' : 'black' }}>{place.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      {/* <div className="absolute bg-[#00d9ff] bottom-0 left-0 w-full border-t-[3.4px] border-black z-30">
        <div className="flex items-center justify-around px-10 py-2">
          <button
            onClick={() => onNavigate('map')}
            className="flex flex-col items-center gap-1"
          >
            <div className="bg-white border-[1.36px] border-black shadow-[2px_2px_0px_0px_black] size-[32px] flex items-center justify-center">
              <p className="text-[12px]">🗺️</p>
            </div>
            <p className="font-['Press_Start_2P'] text-[6px] text-black">MAP</p>
          </button>

          <button className="flex flex-col items-center gap-1">
            <div className="bg-white border-[1.36px] border-black size-[32px] flex items-center justify-center">
              <p className="text-[12px]">📝</p>
            </div>
            <p className="font-['Press_Start_2P'] text-[6px] text-black">LIST</p>
          </button>

          <button className="flex flex-col items-center gap-1">
            <div className="bg-white border-[1.36px] border-black size-[32px] flex items-center justify-center">
              <p className="text-[12px]">⭐</p>
            </div>
            <p className="font-['Press_Start_2P'] text-[6px] text-black">FAV</p>
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className="flex flex-col items-center gap-1"
          >
            <div className="bg-white border-[1.36px] border-black size-[32px] flex items-center justify-center">
              <p className="text-[12px]">👤</p>
            </div>
            <p className="font-['Press_Start_2P'] text-[6px] text-black">USER</p>
          </button>
        </div>
      </div> */}

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
