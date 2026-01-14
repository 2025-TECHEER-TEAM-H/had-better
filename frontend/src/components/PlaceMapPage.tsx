import { useState, useRef, useEffect } from "react";
import fullMapImage from "../assets/506d3ac81771f7af9c2519c77e86748254304713.png";

interface PlaceMapPageProps {
  onNavigate: (page: string, data?: any) => void;
  place?: any;
  fromFavorites?: boolean;
}

export function PlaceMapPage({ onNavigate, place, fromFavorites }: PlaceMapPageProps) {
  const [sheetPosition, setSheetPosition] = useState(40); // 40% 높이에서 시작
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef(0);
  const startPositionRef = useRef(40);

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

    const newPosition = Math.max(20, Math.min(90, startPositionRef.current + deltaPercent));
    setSheetPosition(newPosition);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);

    // 스냅 포인트: 20% (작게), 40% (중간), 90% (거의 전체)
    if (sheetPosition < 30) {
      setSheetPosition(20);
    } else if (sheetPosition < 65) {
      setSheetPosition(40);
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

    const newPosition = Math.max(20, Math.min(90, startPositionRef.current + deltaPercent));
    setSheetPosition(newPosition);
  };

  const handleMouseUp = () => {
    setIsDragging(false);

    // 스냅 포인트
    if (sheetPosition < 30) {
      setSheetPosition(20);
    } else if (sheetPosition < 65) {
      setSheetPosition(40);
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

  // 기본 장소 정보
  const defaultPlace = {
    name: 'CENTRAL PARK',
    emoji: '🏞️',
    distance: '2.5 KM',
    status: 'OPEN',
    bgColor: '#7ed321',
    category: '공원 / 레저',
    hours: '매일 06:00 - 22:00',
    address: '서울시 강남구 테헤란로 123',
    phone: '02-1234-5678',
  };

  const placeData = place || defaultPlace;

  // 장소별 데이터 매핑
  const placeDetails: any = {
    'CENTRAL PARK': { category: '공원 / 레저', hours: '매일 06:00 - 22:00', address: '서울시 강남구 테헤란로 123', phone: '02-1234-5678' },
    'PET SHOP': { category: '반려동물 / 용품', hours: '매일 10:00 - 20:00', address: '서울시 강남구 강남대로 456', phone: '02-2345-6789' },
    'VET CLINIC': { category: '동물병원', hours: '평일 09:00 - 18:00', address: '서울시 강남구 봉은사로 789', phone: '02-3456-7890' },
    'COFFEE SHOP': { category: '카페 / 디저트', hours: '매일 08:00 - 22:00', address: '서울시 강남구 논현로 234', phone: '02-4567-8901' },
    'BOOKSTORE': { category: '서점 / 문화', hours: '매일 10:00 - 21:00', address: '서울시 강남구 선릉로 567', phone: '02-5678-9012' },
    'RESTAURANT': { category: '레스토랑 / 식당', hours: '매일 11:00 - 23:00', address: '서울시 강남구 역삼로 890', phone: '02-6789-0123' },
    'FITNESS GYM': { category: '헬스 / 피트니스', hours: '평일 06:00 - 24:00', address: '서울시 강남구 언주로 345', phone: '02-7890-1234' },
    'SUPERMARKET': { category: '마트 / 식료품', hours: '매일 07:00 - 24:00', address: '서울시 강남구 테헤란로 678', phone: '02-8901-2345' },
    '스타벅스 강남점': { category: '카페', hours: '매일 07:00 - 23:00', address: '서울 강남구 테헤란로 123', phone: '02-1111-2222' },
    '집': { category: '주거', hours: '24시간', address: '서울 서초구 반포대로 456', phone: '-' },
    '회사': { category: '직장', hours: '평일 09:00 - 18:00', address: '서울 강남구 테헤란로 789', phone: '02-3333-4444' },
    '헬스장': { category: '운동', hours: '매일 06:00 - 23:00', address: '서울 강남구 역삼동 101', phone: '02-5555-6666' },
    '맛있는 파스타집': { category: '음식점', hours: '매일 11:30 - 22:00', address: '서울 서초구 서초대로 234', phone: '02-7777-8888' },
    '도서관': { category: '문화시설', hours: '매일 09:00 - 21:00', address: '서울 강남구 선릉로 567', phone: '02-9999-0000' },
    '공원': { category: '야외', hours: '24시간', address: '서울 서초구 매헌로 890', phone: '-' },
    '영화관': { category: '엔터테인먼트', hours: '매일 10:00 - 24:00', address: '서울 강남구 강남대로 321', phone: '1544-1234' },
  };

  const details = placeDetails[placeData.name] || placeDetails['CENTRAL PARK'];

  return (
    <div className="relative size-full overflow-hidden">
      {/* 전체 화면 배경 지도 */}
      <div className="absolute inset-0">
        <img alt="" className="w-full h-full object-cover" src={fullMapImage} />
      </div>

      {/* 목적지 마커 */}
      <div className="absolute left-[120px] top-[200px] z-[5]">
        <div className="relative animate-bounce">
          <div className="w-[28px] h-[36px] bg-[#fb2c36] rounded-tl-[50%] rounded-tr-[50%] rounded-br-[50%] border-[3px] border-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] flex items-center justify-center">
            <p className="font-['Press_Start_2P'] text-[12px] text-white mt-[-4px]">도</p>
          </div>
          {/* 펄스 효과 */}
          <div className="absolute top-0 left-0 w-[28px] h-[28px] bg-[#fb2c36] rounded-full opacity-30 animate-ping" />
        </div>
      </div>

      {/* 현재 위치 마커 */}
      <div className="absolute right-[80px] bottom-[280px] z-[5]">
        <div className="relative">
          <div className="bg-[#2b7fff] border-[3px] border-white shadow-lg rounded-full w-6 h-6 flex items-center justify-center">
            <div className="bg-white rounded-full w-2 h-2" />
          </div>
          {/* 현재 위치 펄스 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-[#2b7fff] rounded-full opacity-40 animate-ping" style={{ animationDuration: '2s' }} />
          </div>
        </div>
      </div>

      {/* 경로 라인 (점선) */}
      <div className="absolute inset-0 z-[4]">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
          <path
            d="M 295 470 Q 250 400, 200 330 T 140 230"
            fill="none"
            stroke="#2b7fff"
            strokeWidth="5"
            strokeDasharray="15 10"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      </div>

      {/* 헤더 */}
      <div className="absolute bg-[#00d9ff] left-0 top-0 w-full border-b-[3.4px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] z-20">
        <div className="flex items-center justify-between px-5 py-3">
          <button onClick={() => onNavigate(fromFavorites ? 'favorites' : 'places')}>
            <p className="font-['Press_Start_2P'] text-[12px] text-black">←</p>
          </button>
          <p className="font-['Press_Start_2P'] text-[12px] text-black">LOCATION</p>
          <div className="flex gap-1">
            <div className="bg-black size-[4px]" />
            <div className="bg-black size-[4px]" />
            <div className="bg-black size-[4px]" />
          </div>
        </div>
      </div>

      {/* 슬라이드 업 바텀 시트 */}
      <div
        className="absolute left-0 right-0 bg-white rounded-t-[24px] border-t-[3.4px] border-l-[3.4px] border-r-[3.4px] border-black shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] z-10 transition-all"
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

        {/* 스크롤 가능한 컨텐츠 */}
        <div className="px-5 pb-24 overflow-y-auto scrollbar-hide" style={{ height: 'calc(100% - 40px)' }}>
          {/* 장소 헤더 */}
          <div className="mb-4">
            <div className="flex items-center gap-4 mb-3">
              <div className="bg-white border-[3px] border-black size-[80px] flex items-center justify-center shadow-[4px_4px_0px_0px_black]">
                <p className="text-[48px]">{placeData.emoji}</p>
              </div>
              <div className="flex-1">
                <p className="font-['Press_Start_2P'] text-[12px] text-black leading-[18px] mb-2">{placeData.name}</p>
                <div className="flex gap-2">
                  <div className="bg-[#ffd93d] border-[2px] border-black px-3 py-1">
                    <p className="font-['Press_Start_2P'] text-[7px] text-black leading-[12px]">{placeData.distance}</p>
                  </div>
                  <div className={`${placeData.status === 'OPEN' ? 'bg-white' : 'bg-[#ff6b9d]'} border-[2px] border-black px-3 py-1`}>
                    <p className={`font-['Press_Start_2P'] text-[7px] leading-[12px] ${placeData.status === 'OPEN' ? 'text-black' : 'text-white'}`}>{placeData.status}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 장소 상세 정보 */}
          <div className="space-y-3">
            {/* 업종 */}
            <div className="bg-[#f0f0f0] border-[2.72px] border-black rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[16px]">🏷️</p>
                <p className="font-['Press_Start_2P'] text-[8px] text-black leading-[12px]">업종</p>
              </div>
              <p className="font-['Press_Start_2P'] text-[7px] text-[#6b9080] leading-[12px] pl-6">
                {details.category}
              </p>
            </div>

            {/* 영업시간 */}
            <div className="bg-[#f0f0f0] border-[2.72px] border-black rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[16px]">⏰</p>
                <p className="font-['Press_Start_2P'] text-[8px] text-black leading-[12px]">영업시간</p>
              </div>
              <p className="font-['Press_Start_2P'] text-[7px] text-[#6b9080] leading-[12px] pl-6">
                {details.hours}
              </p>
            </div>

            {/* 주소 */}
            <div className="bg-[#f0f0f0] border-[2.72px] border-black rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[16px]">📍</p>
                <p className="font-['Press_Start_2P'] text-[8px] text-black leading-[12px]">주소</p>
              </div>
              <p className="font-['Press_Start_2P'] text-[7px] text-[#6b9080] leading-[12px] pl-6">
                {details.address}
              </p>
            </div>

            {/* 전화번호 */}
            <div className="bg-[#f0f0f0] border-[2.72px] border-black rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[16px]">📞</p>
                <p className="font-['Press_Start_2P'] text-[8px] text-black leading-[12px]">전화번호</p>
              </div>
              <p className="font-['Press_Start_2P'] text-[7px] text-[#6b9080] leading-[12px] pl-6">
                {details.phone}
              </p>
            </div>

            {/* 거리 정보 */}
            <div className="bg-[#ffd93d] border-[2.72px] border-black rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[16px]">🚶</p>
                <p className="font-['Press_Start_2P'] text-[8px] text-black leading-[12px]">현재 위치에서</p>
              </div>
              <p className="font-['Press_Start_2P'] text-[7px] text-black leading-[12px] pl-6">
                약 {placeData.distance} (도보 30분)
              </p>
            </div>
          </div>
        </div>

        {/* 경로 안내 시작 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 bg-white border-t-[2px] border-gray-100 pt-3">
          <button
            onClick={() => onNavigate('route-selection')}
            className="w-full h-14 rounded-[10px] border-[3.4px] border-black font-['Press_Start_2P'] text-[12px] bg-[#ff6b9d] text-white shadow-[6px_6px_0px_0px_black] active:translate-y-1 active:shadow-[3px_3px_0px_0px_black] transition-all"
          >
            경로 안내 시작! 🏁
          </button>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes ping {
          0% { transform: scale(1); opacity: 0.3; }
          75%, 100% { transform: scale(2); opacity: 0; }
        }

        .animate-bounce {
          animation: bounce 2s infinite;
        }

        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

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
