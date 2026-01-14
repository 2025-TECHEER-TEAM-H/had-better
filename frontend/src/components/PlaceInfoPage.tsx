import svgPaths from "../imports/svg-2mccnqcvdk";

interface PlaceInfoPageProps {
  onNavigate: (page: string, data?: any) => void;
  place?: any;
  fromFavorites?: boolean;
}

export function PlaceInfoPage({ onNavigate, place, fromFavorites }: PlaceInfoPageProps) {
  // 기본 장소 정보 (place가 없을 경우)
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
  };

  const details = placeDetails[placeData.name] || placeDetails['CENTRAL PARK'];

  return (
    <div className="relative size-full bg-transparent overflow-hidden pointer-events-auto" style={{ pointerEvents: 'auto' }}>
      {/* 구름들 */}
      <div className="absolute h-[40px] left-[250.05px] top-[64px] w-[80px] pointer-events-none">
        <div className="h-[40px] overflow-clip relative shrink-0 w-full">
          <div className="absolute inset-[40%_20%_20%_20%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 16">
              <path d="M48 0H0V16H48V0Z" fill="white" opacity="0.9" />
            </svg>
          </div>
          <div className="absolute inset-[60%_10%_10%_10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64 12">
              <path d="M64 0H0V12H64V0Z" fill="white" opacity="0.9" />
            </svg>
          </div>
        </div>
      </div>

      <div className="absolute h-[29.992px] left-[32px] top-[128px] w-[59.994px] pointer-events-none">
        <div className="h-[29.997px] overflow-clip relative shrink-0 w-full">
          <div className="absolute inset-[40%_20%_20%_20%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 35.9966 11.9989">
              <path d={svgPaths.p36b3f80} fill="white" opacity="0.9" />
            </svg>
          </div>
          <div className="absolute inset-[60%_10%_6.67%_10%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47.9955 9.99906">
              <path d={svgPaths.pab2a800} fill="white" opacity="0.9" />
            </svg>
          </div>
        </div>
      </div>

      {/* 이모지들 */}
      <div className="absolute flex items-center justify-center left-[62.4px] top-[87.19px] pointer-events-none">
        <p className="text-[30px]">🗺️</p>
      </div>

      <div className="absolute flex items-center justify-center left-[274.08px] top-[142.96px] pointer-events-none">
        <p className="text-[24px]">📍</p>
      </div>

      {/* 헤더 */}
      <div className="absolute bg-[#00d9ff] left-0 top-0 w-full border-b-[3.4px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between px-5 py-3">
          <button onClick={() => onNavigate(fromFavorites ? 'favorites' : 'places')}>
            <p className="font-['Press_Start_2P'] text-[12px] text-black">←</p>
          </button>
          <p className="font-['Press_Start_2P'] text-[12px] text-black">PLACE INFO</p>
          <div className="flex gap-1">
            <div className="bg-black size-[4px]" />
            <div className="bg-black size-[4px]" />
            <div className="bg-black size-[4px]" />
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="absolute left-0 top-[64px] w-full px-5 pb-[140px] scrollbar-hide" style={{ height: 'calc(100% - 64px)', overflowY: 'auto' }}>
        <div className="flex flex-col gap-4 pt-4">
          {/* 장소 이미지 */}
          <div className="bg-white border-[3.4px] border-black rounded-[10px] shadow-[6px_6px_0px_0px_black] overflow-hidden relative h-[200px] flex items-center justify-center">
            <p className="text-[80px]">{placeData.emoji}</p>
          </div>

          {/* 장소 이름 */}
          <div className="bg-[#7ed321] border-[3.4px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_black] p-5">
            <p className="font-['Press_Start_2P'] text-[14px] text-black leading-[20px] text-center">
              {placeData.name}
            </p>
          </div>

          {/* 장소 정보 */}
          <div className="bg-white border-[3.4px] border-black rounded-[10px] shadow-[4px_4px_0px_0px_black] p-5 space-y-4">
            {/* 업종 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[16px]">🏷️</p>
                <p className="font-['Press_Start_2P'] text-[8px] text-black leading-[12px]">업종</p>
              </div>
              <div className="bg-[#f0f0f0] border-[2px] border-black rounded px-3 py-2">
                <p className="font-['Press_Start_2P'] text-[7px] text-black leading-[12px]">
                  {details.category}
                </p>
              </div>
            </div>

            {/* 영업시간 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[16px]">⏰</p>
                <p className="font-['Press_Start_2P'] text-[8px] text-black leading-[12px]">영업시간</p>
              </div>
              <div className="bg-[#f0f0f0] border-[2px] border-black rounded px-3 py-2">
                <p className="font-['Press_Start_2P'] text-[7px] text-black leading-[12px]">
                  {details.hours}
                </p>
              </div>
            </div>

            {/* 주소 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[16px]">📍</p>
                <p className="font-['Press_Start_2P'] text-[8px] text-black leading-[12px]">주소</p>
              </div>
              <div className="bg-[#f0f0f0] border-[2px] border-black rounded px-3 py-2">
                <p className="font-['Press_Start_2P'] text-[7px] text-black leading-[12px]">
                  {details.address}
                </p>
              </div>
            </div>

            {/* 전화번호 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[16px]">📞</p>
                <p className="font-['Press_Start_2P'] text-[8px] text-black leading-[12px]">전화번호</p>
              </div>
              <div className="bg-[#f0f0f0] border-[2px] border-black rounded px-3 py-2">
                <p className="font-['Press_Start_2P'] text-[7px] text-black leading-[12px]">
                  {details.phone}
                </p>
              </div>
            </div>

            {/* 거리 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[16px]">🚶</p>
                <p className="font-['Press_Start_2P'] text-[8px] text-black leading-[12px]">현재 위치에서</p>
              </div>
              <div className="bg-[#ffd93d] border-[2px] border-black rounded px-3 py-2">
                <p className="font-['Press_Start_2P'] text-[7px] text-black leading-[12px]">
                  약 {placeData.distance} (도보 30분)
                </p>
              </div>
            </div>

            {/* 상태 */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[16px]">🔔</p>
                <p className="font-['Press_Start_2P'] text-[8px] text-black leading-[12px]">운영 상태</p>
              </div>
              <div className="bg-[#7ed321] border-[2px] border-black rounded px-3 py-2 flex items-center justify-center">
                <p className="font-['Press_Start_2P'] text-[8px] text-white leading-[12px]">
                  ✓ {placeData.status}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 산 배경 */}
      <div className="absolute bottom-[72px] left-0 right-0 pointer-events-none" style={{ imageRendering: 'pixelated' }}>
        <div className="absolute h-[128px] left-0 w-full" style={{ bottom: 0 }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 346.049 127.999">
            <g clipPath="url(#clip0_5_497_pi)">
              <path d={svgPaths.p2cc06d00} fill="#4A7C2E" opacity="0.8" />
            </g>
            <defs>
              <clipPath id="clip0_5_497_pi">
                <rect fill="white" height="127.999" width="346.049" />
              </clipPath>
            </defs>
          </svg>
        </div>

        <div className="absolute h-[96px] left-0 w-full" style={{ bottom: 0 }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 346.049 95.9995">
            <g clipPath="url(#clip0_5_494_pi)">
              <path d={svgPaths.p2297f680} fill="#5F9E3E" opacity="0.9" />
            </g>
            <defs>
              <clipPath id="clip0_5_494_pi">
                <rect fill="white" height="95.9995" width="346.049" />
              </clipPath>
            </defs>
          </svg>
        </div>

        <div className="absolute h-[80px] left-0 w-full" style={{ bottom: 0 }}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 346.049 79.9995">
            <g clipPath="url(#clip0_5_489_pi)">
              <path d={svgPaths.p340ba200} fill="#7ED321" />
            </g>
            <defs>
              <clipPath id="clip0_5_489_pi">
                <rect fill="white" height="79.9995" width="346.049" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>

      {/* 이동 버튼 */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-5 bg-gradient-to-t from-[#b0e5f5] via-[#b0e5f5] to-transparent pt-8">
        <button
          onClick={() => onNavigate('place-map', { place: placeData })}
          className="w-full h-14 rounded-[10px] border-[3.4px] border-black font-['Press_Start_2P'] text-[12px] bg-[#7ed321] text-white shadow-[6px_6px_0px_0px_black] active:translate-y-1 active:shadow-[3px_3px_0px_0px_black] transition-all"
        >
          이 장소로 이동! 🚀
        </button>
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