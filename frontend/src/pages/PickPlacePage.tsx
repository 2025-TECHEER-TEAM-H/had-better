import { useState, useRef, useEffect } from 'react';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Map, type MapRef } from 'react-map-gl/mapbox';
import { useSavedPlaceStore, type CategoryType } from '../stores/useSavedPlaceStore';
// import api from '../services/api'; // TODO: 백엔드 연결 시 주석 해제

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

interface PickPlacePageProps {
  onNavigate: (page: string, data?: any) => void;
  category?: CategoryType;
}

interface SearchPlace {
  poi_place_id: number;
  name: string;
  address: string;
  category?: string;
  coordinates: {
    lon: number;
    lat: number;
  };
}

export function PickPlacePage({ onNavigate, category }: PickPlacePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<SearchPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sheetPosition, setSheetPosition] = useState(10); // 처음엔 닫혀있음
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startPositionRef = useRef(10);
  const mapRef = useRef<MapRef>(null);

  const { saveCategorizedPlace } = useSavedPlaceStore();

  // 지도 로드 시 언어 플러그인 적용
  const onMapLoad = () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const language = new MapboxLanguage({
      defaultLanguage: 'ko'
    });
    map.addControl(language);
  };

  // 더미 장소 데이터 (테스트용)
  const getMockPlaces = (): SearchPlace[] => {
    return [
      {
        poi_place_id: 1001, // test-home을 숫자로 변환
        name: '가짜 우리집',
        address: '인천광역시 남동구 구월동 123-45',
        category: '집',
        coordinates: {
          lon: 126.705,
          lat: 37.456,
        },
      },
      {
        poi_place_id: 1002, // test-school을 숫자로 변환
        name: '가짜 대학교',
        address: '서울특별시 관악구 관악로 1',
        category: '학교',
        coordinates: {
          lon: 126.953,
          lat: 37.468,
        },
      },
      {
        poi_place_id: 1003, // test-work을 숫자로 변환
        name: '가짜 회사',
        address: '경기도 성남시 분당구 판교로 256',
        category: '회사',
        coordinates: {
          lon: 127.111,
          lat: 37.395,
        },
      },
    ];
  };

  // 장소 검색 (임시: 더미 데이터 사용)
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    
    // 임시: 실제 API 호출 대신 더미 데이터 반환
    // TODO: 백엔드 서버 연결 후 실제 API 호출로 복원
    setTimeout(() => {
      const mockPlaces = getMockPlaces();
      setPlaces(mockPlaces);
      // 검색 결과가 있으면 바텀 시트 열기
      if (mockPlaces.length > 0) {
        setSheetPosition(50);
      }
      setIsLoading(false);
      console.log('🔍 더미 검색 결과:', mockPlaces);
    }, 300); // 로딩 효과를 위한 짧은 딜레이

    /* 실제 API 호출 코드 (백엔드 연결 시 사용)
    try {
      const response = await api.get<{
        status: 'success' | 'error';
        data?: Array<{
          poi_place_id: number;
          name: string;
          address: string;
          category?: string;
          coordinates: {
            lon: number;
            lat: number;
          };
        }>;
        error?: { code: string; message: string };
      }>('/places/search', {
        params: { q: searchQuery.trim() }
      });

      // 백엔드 응답 형식: { status: "success", data: [...] }
      if (response.data.status === 'success' && response.data.data) {
        setPlaces(response.data.data);
        // 검색 결과가 있으면 바텀 시트 열기
        if (response.data.data.length > 0) {
          setSheetPosition(50);
        }
      } else {
        setPlaces([]);
        console.warn('장소 검색 실패:', response.data.error?.message);
      }
    } catch (error: any) {
      console.error('장소 검색 API 호출 실패:', error);
      setPlaces([]);
    } finally {
      setIsLoading(false);
    }
    */
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 장소 선택
  const handlePlaceSelect = async (place: SearchPlace) => {
    if (!category) {
      console.error('카테고리 정보가 없습니다.');
      return;
    }

    try {
      await saveCategorizedPlace(category, place.poi_place_id, {
        name: place.name,
        address: place.address,
        coordinates: place.coordinates,
      });

      // 저장 완료 후 MapPage로 돌아가기
      onNavigate('map');
    } catch (error) {
      console.error('장소 저장 실패:', error);
    }
  };

  // 드래그 핸들러
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

  return (
    <div className="relative z-[50] h-screen w-full overflow-hidden pointer-events-auto" style={{ 
      pointerEvents: 'auto', 
      zIndex: 50
    }}>
      {/* Mapbox 지도 배경 */}
      <div className="absolute inset-0 z-0">
        <Map
          ref={mapRef}
          initialViewState={{
            longitude: 126.735,
            latitude: 37.489,
            zoom: 13
          }}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: '100%', height: '100%' }}
          onLoad={onMapLoad}
          reuseMaps
        />
      </div>

      {/* 상단 헤더 */}
      <div className="relative bg-gradient-to-b from-[#5a8db0] to-[#4a7fa7] border-b-4 border-black backdrop-blur" style={{
        boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
        zIndex: 100,
        pointerEvents: 'auto',
        backgroundColor: '#5a8db0'
      }}>
        <div className="flex items-center justify-between px-5 pt-3 pb-4">
          <div className="text-xs font-bold text-white/80 pixel-font">9:41</div>
          <p className="font-['Press_Start_2P'] text-[12px] text-[rgb(255,255,255)]">CHOOSE PLACES</p>
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-white/80" />
            <div className="w-1 h-1 bg-white/80" />
            <div className="w-1 h-1 bg-white/80" />
          </div>
        </div>

        {/* 검색바 */}
        <div className="px-5 pb-4" style={{ zIndex: 100, pointerEvents: 'auto' }}>
          <div className="relative">
            <input
              type="text"
              placeholder="장소 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full h-12 bg-white border-2 border-black rounded-xl px-4 pl-12 text-sm font-medium text-[#2d5f3f] placeholder:text-[#6b9080]/50 pixel-font"
              style={{
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                zIndex: 100,
                pointerEvents: 'auto'
              }}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
              🔍
            </div>
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-[#2d5f3f] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 검색 결과 Bottom Sheet */}
      <div
        className="absolute left-0 right-0 bg-white rounded-t-[24px] border-t-[3.4px] border-l-[3.4px] border-r-[3.4px] border-black shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] z-20 transition-all"
        style={{
          height: `${sheetPosition}%`,
          bottom: 0,
          transitionDuration: isDragging ? '0ms' : '300ms',
          pointerEvents: 'auto'
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
          {places.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-xs text-[#6b9080]/60 pixel-font">
                {searchQuery ? '검색 결과가 없습니다.' : '장소를 검색해주세요.'}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-4">
            {places.map((place, index) => (
              <div
                key={place.poi_place_id}
                onClick={() => handlePlaceSelect(place)}
                className="rounded-[10px] border-[3.4px] border-black shadow-[4px_4px_0px_0px_black] p-5 flex gap-3 hover:scale-105 transition-transform active:translate-y-1 cursor-pointer"
                style={{ backgroundColor: getColorByIndex(index) }}
              >
                <div className="bg-white border-[1.36px] border-black size-[64px] flex items-center justify-center">
                  <p className="text-[30px]">{getEmojiByCategory(place.category || '')}</p>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-['Press_Start_2P'] text-[10px] leading-[15px] flex-1 text-black">
                      {place.name.toUpperCase()}
                    </p>
                  </div>
                  <div className="flex gap-1 items-start">
                    <div className="bg-[#ffd93d] border-[1.36px] border-black px-2 py-1">
                      <p className="font-['Press_Start_2P'] text-[6px] text-black leading-[9px]">
                        {place.address || '주소 정보 없음'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .pixel-font {
          font-family: 'Press Start 2P', cursive;
          image-rendering: pixelated;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
