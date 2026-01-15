import { useState, useRef, useEffect } from 'react';
import { useSavedPlaceStore, type CategoryType } from '../stores/useSavedPlaceStore';

interface MapPageProps {
  onNavigate: (page: string, data?: any) => void;
}

export function MapPage({ onNavigate }: MapPageProps) {
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 카테고리별 장소 상태 구독
  const categorizedPlaces = useSavedPlaceStore((state) => state.categorizedPlaces);
  const fetchSavedPlaces = useSavedPlaceStore((state) => state.fetchSavedPlaces);
  
  // Long press 감지를 위한 refs
  const longPressTimerRef = useRef<{ [key: string]: ReturnType<typeof setTimeout> | null }>({
    home: null,
    school: null,
    work: null,
  });
  
  // 기본 현재 위치 (나중에 Geolocation API로 대체 가능)
  const defaultCurrentLocation = {
    lon: 126.735,
    lat: 37.489,
    name: '현재 위치',
  };

  // 초기 로드 시 카테고리별 장소 불러오기
  useEffect(() => {
    fetchSavedPlaces();
  }, [fetchSavedPlaces]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onNavigate('places');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 카테고리 버튼 클릭 핸들러 (짧은 클릭)
  const handleCategoryClick = (category: CategoryType) => {
    const savedPlace = categorizedPlaces[category];
    
    if (savedPlace && savedPlace.poi_place) {
      // 장소가 등록되어 있으면 RouteSelectionPage로 이동
      onNavigate('route-selection', {
        departure: {
          ...defaultCurrentLocation,
          type: 'current',
        },
        destination: {
          lon: savedPlace.poi_place.coordinates.lon,
          lat: savedPlace.poi_place.coordinates.lat,
          name: savedPlace.poi_place.name || savedPlace.name || '',
          address: savedPlace.poi_place.address || '',
          type: 'saved',
        },
      });
    } else {
      // 장소가 없으면 PickPlacePage로 이동
      onNavigate('pick-place', { category });
    }
  };

  // Long press 시작
  const handleLongPressStart = (category: CategoryType) => {
    longPressTimerRef.current[category] = setTimeout(() => {
      // 길게 클릭 시 항상 PickPlacePage로 이동 (수정 모드)
      onNavigate('pick-place', { category });
    }, 500); // 500ms 후 long press로 인식
  };

  // Long press 취소
  const handleLongPressCancel = (category: CategoryType) => {
    if (longPressTimerRef.current[category]) {
      clearTimeout(longPressTimerRef.current[category]!);
      longPressTimerRef.current[category] = null;
    }
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      Object.keys(longPressTimerRef.current).forEach((key) => {
        if (longPressTimerRef.current[key]) {
          clearTimeout(longPressTimerRef.current[key]!);
        }
      });
    };
  }, []);

  return (
    <div className="relative z-[50] h-screen w-full overflow-hidden pointer-events-auto" style={{ 
      pointerEvents: 'auto', 
      background: 'linear-gradient(to bottom, #a8dadc, #f1faee)',
      backgroundColor: '#a8dadc',
      zIndex: 50
    }}>
      {/* 부드러운 구름들 */}
      <div className="absolute top-16 right-4 opacity-50">
        <div className="w-32 h-16 bg-white rounded-full blur-2xl" />
      </div>
      <div className="absolute top-32 left-8 opacity-40">
        <div className="w-28 h-14 bg-white rounded-full blur-2xl" />
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
<p className="font-['Press_Start_2P'] text-[12px] text-[rgb(255,255,255)]">Had better...</p>          <div className="flex gap-1">
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
              placeholder="장소, 주소, 버스 검색"
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
          </div>
        </div>

        {/* 탭 메뉴 */}
        <div className="flex items-center border-t-2 border-white/20" style={{ zIndex: 100, pointerEvents: 'auto' }}>
          <button 
            onClick={() => onNavigate('full-map')}
            className="flex-1 py-3 text-xs font-medium text-white/70 pixel-font hover:bg-white/10"
            style={{ pointerEvents: 'auto' }}
          >
            지도
          </button>
          <button 
            className="flex-1 py-3 text-xs font-bold text-[#48d448] pixel-font border-b-3 border-[#48d448]"
            style={{ pointerEvents: 'auto' }}
          >
            검색
          </button>
          <button 
            className="flex-1 py-3 text-xs font-medium text-white/70 pixel-font hover:bg-white/10"
            style={{ pointerEvents: 'auto' }}
          >
            버스
          </button>
          <button 
            className="flex-1 py-3 text-xs font-medium text-white/70 pixel-font hover:bg-white/10"
            style={{ pointerEvents: 'auto' }}
          >
            지하철
          </button>
          <button 
            onClick={() => onNavigate('dashboard')}
            className="flex-1 py-3 text-xs font-medium text-white/70 pixel-font hover:bg-white/10"
            style={{ pointerEvents: 'auto' }}
          >
            MY
          </button>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative pt-6 pb-32 px-5" style={{ zIndex: 100, pointerEvents: 'auto' }}>
        {/* 출발지/도착지 입력 */}
        <div className="space-y-3 mb-6">
          {/* 출발지 */}
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#48d448] rounded-full shadow-lg flex-shrink-0" style={{
              boxShadow: '0 4px 8px rgba(72,212,72,0.5)'
            }} />
            <input
              type="text"
              placeholder="출발지 입력"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
              className="flex-1 h-12 bg-white border-3 border-black rounded-xl px-4 text-sm font-medium text-[#2d5f3f] placeholder:text-[#6b9080]/50 pixel-font"
              style={{
                boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                zIndex: 100,
                pointerEvents: 'auto'
              }}
            />
          </div>

          {/* 도착지 */}
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#4a7fa7] rounded-full shadow-lg flex-shrink-0" style={{
              boxShadow: '0 4px 8px rgba(74,127,167,0.5)'
            }} />
            <input
              type="text"
              placeholder="도착지 입력"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="flex-1 h-12 bg-white border-3 border-black rounded-xl px-4 text-sm font-medium text-[#2d5f3f] placeholder:text-[#6b9080]/50 pixel-font"
              style={{
                boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                zIndex: 100,
                pointerEvents: 'auto'
              }}
            />
          </div>
        </div>

        {/* 길찾기 버튼 */}
        <button
          onClick={() => onNavigate('route-selection')}
          className="relative w-full h-14 mb-6 group overflow-hidden bg-gradient-to-b from-[#48d448] to-[#3db83d] border-4 border-black rounded-2xl"
          style={{
            boxShadow: '0 6px 0 #2d8b2d, 0 12px 24px rgba(61,184,61,0.3)',
            imageRendering: 'pixelated',
            zIndex: 100,
            pointerEvents: 'auto'
          }}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative text-white font-black text-lg pixel-font tracking-wider">
            길찾기
          </span>
        </button>

        {/* 자주 가는 곳 */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-[#2d5f3f] pixel-font mb-4">자주 가는 곳</h3>
          <div className="flex gap-3">
            {/* 집 */}
            <button 
              onClick={() => handleCategoryClick('home')}
              onMouseDown={() => handleLongPressStart('home')}
              onMouseUp={() => handleLongPressCancel('home')}
              onMouseLeave={() => handleLongPressCancel('home')}
              onTouchStart={() => handleLongPressStart('home')}
              onTouchEnd={() => handleLongPressCancel('home')}
              className={`flex-1 rounded-2xl p-3 hover:scale-105 transition-transform ${
                categorizedPlaces.home
                  ? 'bg-white border-4 border-black'
                  : 'bg-white/50 border-3 border-black/30 grayscale opacity-50'
              }`}
              style={{
                boxShadow: categorizedPlaces.home 
                  ? '0 6px 0 rgba(0,0,0,0.3)' 
                  : '0 4px 0 rgba(0,0,0,0.1)',
                zIndex: 100,
                pointerEvents: 'auto'
              }}>
              <div className={`text-2xl mb-1 ${categorizedPlaces.home ? '' : 'opacity-50'}`}>🏠</div>
              <p className={`text-[8px] font-bold pixel-font ${
                categorizedPlaces.home 
                  ? 'text-[#2d5f3f]' 
                  : 'text-[#6b9080]/50'
              }`}>집</p>
            </button>

            {/* 학교 */}
            <button 
              onClick={() => handleCategoryClick('school')}
              onMouseDown={() => handleLongPressStart('school')}
              onMouseUp={() => handleLongPressCancel('school')}
              onMouseLeave={() => handleLongPressCancel('school')}
              onTouchStart={() => handleLongPressStart('school')}
              onTouchEnd={() => handleLongPressCancel('school')}
              className={`flex-1 rounded-2xl p-3 hover:scale-105 transition-transform ${
                categorizedPlaces.school
                  ? 'bg-white border-4 border-black'
                  : 'bg-white/50 border-3 border-black/30 grayscale opacity-50'
              }`}
              style={{
                boxShadow: categorizedPlaces.school 
                  ? '0 6px 0 rgba(0,0,0,0.3)' 
                  : '0 4px 0 rgba(0,0,0,0.1)',
                zIndex: 100,
                pointerEvents: 'auto'
              }}>
              <div className={`text-2xl mb-1 ${categorizedPlaces.school ? '' : 'opacity-50'}`}>🏫</div>
              <p className={`text-[8px] font-bold pixel-font ${
                categorizedPlaces.school 
                  ? 'text-[#2d5f3f]' 
                  : 'text-[#6b9080]/50'
              }`}>학교</p>
            </button>

            {/* 회사 */}
            <button 
              onClick={() => handleCategoryClick('work')}
              onMouseDown={() => handleLongPressStart('work')}
              onMouseUp={() => handleLongPressCancel('work')}
              onMouseLeave={() => handleLongPressCancel('work')}
              onTouchStart={() => handleLongPressStart('work')}
              onTouchEnd={() => handleLongPressCancel('work')}
              className={`flex-1 rounded-2xl p-3 hover:scale-105 transition-transform ${
                categorizedPlaces.work
                  ? 'bg-white border-4 border-black'
                  : 'bg-white/50 border-3 border-black/30 grayscale opacity-50'
              }`}
              style={{
                boxShadow: categorizedPlaces.work 
                  ? '0 6px 0 rgba(0,0,0,0.3)' 
                  : '0 4px 0 rgba(0,0,0,0.1)',
                zIndex: 100,
                pointerEvents: 'auto'
              }}>
              <div className={`text-2xl mb-1 ${categorizedPlaces.work ? '' : 'opacity-50'}`}>🏢</div>
              <p className={`text-[8px] font-bold pixel-font ${
                categorizedPlaces.work 
                  ? 'text-[#2d5f3f]' 
                  : 'text-[#6b9080]/50'
              }`}>회사</p>
            </button>

            {/* 추가 */}
            <button className="w-16 bg-white/90 border-3 border-black rounded-2xl p-3 hover:scale-105 transition-transform"
              style={{
                boxShadow: '0 4px 0 rgba(0,0,0,0.2)'
              }}>
              <div className="text-2xl">➕</div>
            </button>
          </div>
        </div>

        {/* 최근 검색 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#2d5f3f] pixel-font">최근 검색</h3>
            <button className="text-xs font-medium text-[#6b9080] pixel-font hover:underline">
              전체삭제
            </button>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="text-center py-12">
          <p className="text-xs text-[#6b9080]/60 pixel-font mb-2">오늘은</p>
          <h2 className="text-2xl font-black text-[#2d5f3f] pixel-font mb-2 leading-tight">
            어디로<br/>안내할까요?
          </h2>
          <p className="text-xs text-[#6b9080] pixel-font">
            출발지와 도착지를 입력해주세요.
          </p>
        </div>
      </div>

      {/* 픽셀 산 배경 */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ imageRendering: 'pixelated' }}>
        {/* 뒷산 */}
        <svg className="absolute bottom-0 w-full" style={{ height: '25%' }} viewBox="0 0 400 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountain1-home" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a9960" />
              <stop offset="100%" stopColor="#3d8651" />
            </linearGradient>
          </defs>
          <path d="M -50 100 L -50 40 Q 10 15, 75 35 Q 125 50, 175 30 L 175 100 Z" 
                fill="url(#mountain1-home)" opacity="0.6" />
        </svg>

        <svg className="absolute bottom-0 w-full" style={{ height: '28%', left: '50%' }} viewBox="0 0 400 112" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountain2-home" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a9960" />
              <stop offset="100%" stopColor="#3d8651" />
            </linearGradient>
          </defs>
          <path d="M 0 112 L 0 35 Q 50 8, 110 30 Q 170 55, 230 25 Q 290 5, 350 35 L 400 112 Z" 
                fill="url(#mountain2-home)" opacity="0.6" />
        </svg>

        {/* 앞산 */}
        <svg className="absolute bottom-0 w-full" style={{ height: '20%' }} viewBox="0 0 400 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountain4-home" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7ec98f" />
              <stop offset="100%" stopColor="#6bb87c" />
            </linearGradient>
          </defs>
          <path d="M 0 80 L 0 35 Q 60 18, 120 32 Q 180 46, 240 28 Q 300 15, 360 38 L 400 80 Z" 
                fill="url(#mountain4-home)" opacity="0.8" />
        </svg>

        <svg className="absolute bottom-0 w-full" style={{ height: '18%', left: '50%' }} viewBox="0 0 400 72" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountain5-home" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7ec98f" />
              <stop offset="100%" stopColor="#6bb87c" />
            </linearGradient>
          </defs>
          <path d="M 0 72 L 0 30 Q 50 15, 105 28 Q 160 42, 215 26 Q 270 12, 325 34 L 380 72 Z" 
                fill="url(#mountain5-home)" opacity="0.85" />
        </svg>

        {/* 나무들 */}
        <div className="absolute bottom-8 left-[15%]">
          <svg width="24" height="32" viewBox="0 0 12 16" style={{ imageRendering: 'pixelated' }}>
            <defs>
              <linearGradient id="tree1-home" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2d5f3f" />
                <stop offset="100%" stopColor="#1f4a2f" />
              </linearGradient>
              <linearGradient id="trunk1-home" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b4423" />
                <stop offset="100%" stopColor="#5a3a1f" />
              </linearGradient>
            </defs>
            <rect x="5" y="11" width="2" height="5" fill="url(#trunk1-home)" rx="1" />
            <rect x="2" y="7" width="8" height="5" fill="url(#tree1-home)" rx="1.5" />
            <rect x="3" y="4" width="6" height="4" fill="url(#tree1-home)" rx="1.5" />
            <rect x="4" y="1" width="4" height="4" fill="url(#tree1-home)" rx="1.5" />
          </svg>
        </div>

        <div className="absolute bottom-6 right-[20%]">
          <svg width="28" height="36" viewBox="0 0 14 18" style={{ imageRendering: 'pixelated' }}>
            <defs>
              <linearGradient id="tree2-home" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2d5f3f" />
                <stop offset="100%" stopColor="#1f4a2f" />
              </linearGradient>
              <linearGradient id="trunk2-home" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b4423" />
                <stop offset="100%" stopColor="#5a3a1f" />
              </linearGradient>
            </defs>
            <rect x="6" y="13" width="2" height="5" fill="url(#trunk2-home)" rx="1" />
            <rect x="2" y="8" width="10" height="6" fill="url(#tree2-home)" rx="1.5" />
            <rect x="3" y="5" width="8" height="4" fill="url(#tree2-home)" rx="1.5" />
            <rect x="5" y="2" width="4" height="4" fill="url(#tree2-home)" rx="1.5" />
          </svg>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .pixel-font {
          font-family: 'Press Start 2P', cursive;
          image-rendering: pixelated;
        }
      `}</style>
    </div>
  );
}