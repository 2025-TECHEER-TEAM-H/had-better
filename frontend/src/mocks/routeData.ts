/**
 * 경로 탐색 Mock 데이터
 *
 * 데모용 경로: 명동역 → 이태원역
 * TMap API 호출 횟수 제한(10회/일)으로 인해 개발 시 사용
 * VITE_USE_MOCK_DATA=true 환경변수로 활성화
 */

import type {
  RouteSearchResponse,
  RouteLegDetailResponse,
} from '@/types/route';

// 명동역 -> 이태원역 경로 검색 결과 Mock 데이터
export const mockRouteSearchResponse: RouteSearchResponse = {
  search_itinerary_history_id: 1,
  route_itinerary_id: 1,
  requestParameters: {
    startX: '126.985856',
    startY: '37.560970',
    endX: '126.994596',
    endY: '37.534542',
  },
  legs: [
    {
      route_leg_id: 1,
      pathType: 1, // 지하철
      totalTime: 1020, // 17분
      totalDistance: 4200,
      totalWalkTime: 480, // 8분
      totalWalkDistance: 650,
      transferCount: 2,
      fare: {
        regular: {
          totalFare: 1500,
          currency: { symbol: '￦', currency: '원', currencyCode: 'KRW' },
        },
      },
    },
    {
      route_leg_id: 2,
      pathType: 2, // 버스
      totalTime: 1260, // 21분
      totalDistance: 3800,
      totalWalkTime: 540, // 9분
      totalWalkDistance: 720,
      transferCount: 0,
      fare: {
        regular: {
          totalFare: 1500,
          currency: { symbol: '￦', currency: '원', currencyCode: 'KRW' },
        },
      },
    },
    {
      route_leg_id: 3,
      pathType: 3, // 버스+지하철
      totalTime: 1140, // 19분
      totalDistance: 4000,
      totalWalkTime: 420, // 7분
      totalWalkDistance: 560,
      transferCount: 1,
      fare: {
        regular: {
          totalFare: 1500,
          currency: { symbol: '￦', currency: '원', currencyCode: 'KRW' },
        },
      },
    },
    {
      route_leg_id: 4,
      pathType: 1, // 지하철
      totalTime: 1380, // 23분
      totalDistance: 5100,
      totalWalkTime: 600, // 10분
      totalWalkDistance: 800,
      transferCount: 1,
      fare: {
        regular: {
          totalFare: 1500,
          currency: { symbol: '￦', currency: '원', currencyCode: 'KRW' },
        },
      },
    },
    {
      route_leg_id: 5,
      pathType: 2, // 버스
      totalTime: 1500, // 25분
      totalDistance: 4500,
      totalWalkTime: 480, // 8분
      totalWalkDistance: 640,
      transferCount: 1,
      fare: {
        regular: {
          totalFare: 1500,
          currency: { symbol: '￦', currency: '원', currencyCode: 'KRW' },
        },
      },
    },
  ],
  created_at: new Date().toISOString(),
};

// 경로 1 상세 (지하철): 명동역 → 충무로 → 약수 → 이태원역
export const mockRouteLeg1Detail: RouteLegDetailResponse = {
  route_leg_id: 1,
  route_itinerary_id: 1,
  pathType: 1,
  totalTime: 1020,
  totalDistance: 4200,
  totalWalkTime: 480,
  totalWalkDistance: 650,
  transferCount: 2,
  fare: {
    regular: {
      totalFare: 1500,
      currency: { symbol: '￦', currency: '원', currencyCode: 'KRW' },
    },
  },
  legs: [
    {
      mode: 'WALK',
      sectionTime: 180,
      distance: 250,
      start: { name: '명동역', lat: 37.560970, lon: 126.985856 },
      end: { name: '명동역 4호선', lat: 37.560531, lon: 126.986784 },
      steps: [
        { description: '명동역 4호선 승강장으로 이동', distance: 250 },
      ],
    },
    {
      mode: 'SUBWAY',
      sectionTime: 120,
      distance: 800,
      start: { name: '명동', lat: 37.560531, lon: 126.986784 },
      end: { name: '충무로', lat: 37.561243, lon: 126.994287 },
      route: '4호선',
      routeId: '1004',
      routeColor: '00A5DE',
      type: 1,
      passStopList: {
        stationList: [
          { index: 0, stationID: '425', stationName: '명동', lon: '126.986784', lat: '37.560531' },
          { index: 1, stationID: '424', stationName: '충무로', lon: '126.994287', lat: '37.561243' },
        ],
      },
      passShape: {
        linestring: '126.986784,37.560531 126.994287,37.561243',
      },
    },
    {
      mode: 'WALK',
      sectionTime: 120,
      distance: 150,
      start: { name: '충무로 4호선', lat: 37.561243, lon: 126.994287 },
      end: { name: '충무로 3호선', lat: 37.561456, lon: 126.994512 },
      steps: [
        { description: '3호선으로 환승', distance: 150 },
      ],
    },
    {
      mode: 'SUBWAY',
      sectionTime: 180,
      distance: 1500,
      start: { name: '충무로', lat: 37.561456, lon: 126.994512 },
      end: { name: '약수', lat: 37.554648, lon: 127.010630 },
      route: '3호선',
      routeId: '1003',
      routeColor: 'EF7C1C',
      type: 1,
      passStopList: {
        stationList: [
          { index: 0, stationID: '332', stationName: '충무로', lon: '126.994512', lat: '37.561456' },
          { index: 1, stationID: '333', stationName: '동대입구', lon: '127.007702', lat: '37.557345' },
          { index: 2, stationID: '334', stationName: '약수', lon: '127.010630', lat: '37.554648' },
        ],
      },
      passShape: {
        linestring: '126.994512,37.561456 127.007702,37.557345 127.010630,37.554648',
      },
    },
    {
      mode: 'WALK',
      sectionTime: 60,
      distance: 100,
      start: { name: '약수 3호선', lat: 37.554648, lon: 127.010630 },
      end: { name: '약수 6호선', lat: 37.554789, lon: 127.010812 },
      steps: [
        { description: '6호선으로 환승', distance: 100 },
      ],
    },
    {
      mode: 'SUBWAY',
      sectionTime: 240,
      distance: 1250,
      start: { name: '약수', lat: 37.554789, lon: 127.010812 },
      end: { name: '이태원', lat: 37.534542, lon: 126.994596 },
      route: '6호선',
      routeId: '1006',
      routeColor: 'CD7C2F',
      type: 1,
      passStopList: {
        stationList: [
          { index: 0, stationID: '630', stationName: '약수', lon: '127.010812', lat: '37.554789' },
          { index: 1, stationID: '631', stationName: '버티고개', lon: '127.007123', lat: '37.547890' },
          { index: 2, stationID: '632', stationName: '한강진', lon: '127.001234', lat: '37.539876' },
          { index: 3, stationID: '633', stationName: '이태원', lon: '126.994596', lat: '37.534542' },
        ],
      },
      passShape: {
        linestring: '127.010812,37.554789 127.007123,37.547890 127.001234,37.539876 126.994596,37.534542',
      },
    },
    {
      mode: 'WALK',
      sectionTime: 120,
      distance: 150,
      start: { name: '이태원역 1번출구', lat: 37.534542, lon: 126.994596 },
      end: { name: '이태원역', lat: 37.534650, lon: 126.994800 },
      steps: [
        { description: '1번출구로 나와서 도착', distance: 150 },
      ],
    },
  ],
};

// 경로 2 상세 (버스): 명동역 → 이태원역
export const mockRouteLeg2Detail: RouteLegDetailResponse = {
  route_leg_id: 2,
  route_itinerary_id: 1,
  pathType: 2,
  totalTime: 1260,
  totalDistance: 3800,
  totalWalkTime: 540,
  totalWalkDistance: 720,
  transferCount: 0,
  fare: {
    regular: {
      totalFare: 1500,
      currency: { symbol: '￦', currency: '원', currencyCode: 'KRW' },
    },
  },
  legs: [
    {
      mode: 'WALK',
      sectionTime: 300,
      distance: 400,
      start: { name: '명동역', lat: 37.560970, lon: 126.985856 },
      end: { name: '명동입구 정류장', lat: 37.559234, lon: 126.985123 },
      steps: [
        { description: '명동역에서 버스 정류장으로 이동', distance: 250, streetName: '명동길' },
        { description: '명동입구 정류장 도착', distance: 150 },
      ],
    },
    {
      mode: 'BUS',
      sectionTime: 720,
      distance: 3080,
      start: { name: '명동입구', lat: 37.559234, lon: 126.985123 },
      end: { name: '이태원역', lat: 37.535123, lon: 126.994234 },
      route: '421',
      routeId: '4000421',
      routeColor: '53B332',
      type: 11, // 간선버스
      passStopList: {
        stationList: [
          { index: 0, stationID: '13001', stationName: '명동입구', lon: '126.985123', lat: '37.559234' },
          { index: 1, stationID: '13002', stationName: '충무로역', lon: '126.994000', lat: '37.561000' },
          { index: 2, stationID: '13003', stationName: '장충동', lon: '127.001234', lat: '37.555678' },
          { index: 3, stationID: '13004', stationName: '한남동', lon: '127.003456', lat: '37.542345' },
          { index: 4, stationID: '13005', stationName: '이태원역', lon: '126.994234', lat: '37.535123' },
        ],
      },
      passShape: {
        linestring: '126.985123,37.559234 126.994000,37.561000 127.001234,37.555678 127.003456,37.542345 126.994234,37.535123',
      },
    },
    {
      mode: 'WALK',
      sectionTime: 240,
      distance: 320,
      start: { name: '이태원역 정류장', lat: 37.535123, lon: 126.994234 },
      end: { name: '이태원역', lat: 37.534650, lon: 126.994800 },
      steps: [
        { description: '이태원역 방향으로 이동', distance: 200 },
        { description: '도착지 도착', distance: 120 },
      ],
    },
  ],
};

// 경로 3 상세 (버스+지하철): 명동역 → 이태원역
export const mockRouteLeg3Detail: RouteLegDetailResponse = {
  route_leg_id: 3,
  route_itinerary_id: 1,
  pathType: 3,
  totalTime: 1140,
  totalDistance: 4000,
  totalWalkTime: 420,
  totalWalkDistance: 560,
  transferCount: 1,
  fare: {
    regular: {
      totalFare: 1500,
      currency: { symbol: '￦', currency: '원', currencyCode: 'KRW' },
    },
  },
  legs: [
    {
      mode: 'WALK',
      sectionTime: 180,
      distance: 240,
      start: { name: '명동역', lat: 37.560970, lon: 126.985856 },
      end: { name: '명동역 버스정류장', lat: 37.560234, lon: 126.986123 },
      steps: [
        { description: '버스 정류장으로 이동', distance: 240 },
      ],
    },
    {
      mode: 'BUS',
      sectionTime: 420,
      distance: 1800,
      start: { name: '명동역', lat: 37.560234, lon: 126.986123 },
      end: { name: '한강진역', lat: 37.539876, lon: 127.001234 },
      route: '144',
      routeId: '4000144',
      routeColor: '53B332',
      type: 11,
      passStopList: {
        stationList: [
          { index: 0, stationID: '14001', stationName: '명동역', lon: '126.986123', lat: '37.560234' },
          { index: 1, stationID: '14002', stationName: '동대입구역', lon: '127.007702', lat: '37.557345' },
          { index: 2, stationID: '14003', stationName: '한강진역', lon: '127.001234', lat: '37.539876' },
        ],
      },
      passShape: {
        linestring: '126.986123,37.560234 127.007702,37.557345 127.001234,37.539876',
      },
    },
    {
      mode: 'WALK',
      sectionTime: 120,
      distance: 120,
      start: { name: '한강진역 버스정류장', lat: 37.539876, lon: 127.001234 },
      end: { name: '한강진역 6호선', lat: 37.539950, lon: 127.001400 },
      steps: [
        { description: '지하철역으로 환승', distance: 120 },
      ],
    },
    {
      mode: 'SUBWAY',
      sectionTime: 180,
      distance: 1640,
      start: { name: '한강진', lat: 37.539950, lon: 127.001400 },
      end: { name: '이태원', lat: 37.534542, lon: 126.994596 },
      route: '6호선',
      routeId: '1006',
      routeColor: 'CD7C2F',
      type: 1,
      passStopList: {
        stationList: [
          { index: 0, stationID: '632', stationName: '한강진', lon: '127.001400', lat: '37.539950' },
          { index: 1, stationID: '633', stationName: '이태원', lon: '126.994596', lat: '37.534542' },
        ],
      },
      passShape: {
        linestring: '127.001400,37.539950 126.994596,37.534542',
      },
    },
    {
      mode: 'WALK',
      sectionTime: 120,
      distance: 200,
      start: { name: '이태원역', lat: 37.534542, lon: 126.994596 },
      end: { name: '이태원역', lat: 37.534650, lon: 126.994800 },
      steps: [
        { description: '출구에서 나와 도착', distance: 200 },
      ],
    },
  ],
};

// 경로 4 상세 (지하철): 명동역 → 서울역 → 삼각지 → 이태원역
export const mockRouteLeg4Detail: RouteLegDetailResponse = {
  route_leg_id: 4,
  route_itinerary_id: 1,
  pathType: 1,
  totalTime: 1380,
  totalDistance: 5100,
  totalWalkTime: 600,
  totalWalkDistance: 800,
  transferCount: 1,
  fare: {
    regular: {
      totalFare: 1500,
      currency: { symbol: '￦', currency: '원', currencyCode: 'KRW' },
    },
  },
  legs: [
    {
      mode: 'WALK',
      sectionTime: 240,
      distance: 320,
      start: { name: '명동역', lat: 37.560970, lon: 126.985856 },
      end: { name: '명동역 4호선', lat: 37.560531, lon: 126.986784 },
      steps: [
        { description: '명동역 4호선 승강장으로 이동', distance: 320 },
      ],
    },
    {
      mode: 'SUBWAY',
      sectionTime: 300,
      distance: 2200,
      start: { name: '명동', lat: 37.560531, lon: 126.986784 },
      end: { name: '서울역', lat: 37.554648, lon: 126.972559 },
      route: '4호선',
      routeId: '1004',
      routeColor: '00A5DE',
      type: 1,
      passStopList: {
        stationList: [
          { index: 0, stationID: '425', stationName: '명동', lon: '126.986784', lat: '37.560531' },
          { index: 1, stationID: '426', stationName: '회현', lon: '126.981234', lat: '37.558123' },
          { index: 2, stationID: '427', stationName: '서울역', lon: '126.972559', lat: '37.554648' },
        ],
      },
      passShape: {
        linestring: '126.986784,37.560531 126.981234,37.558123 126.972559,37.554648',
      },
    },
    {
      mode: 'WALK',
      sectionTime: 120,
      distance: 180,
      start: { name: '서울역 4호선', lat: 37.554648, lon: 126.972559 },
      end: { name: '서울역 6호선', lat: 37.554800, lon: 126.972700 },
      steps: [
        { description: '6호선으로 환승', distance: 180 },
      ],
    },
    {
      mode: 'SUBWAY',
      sectionTime: 480,
      distance: 2200,
      start: { name: '삼각지', lat: 37.534800, lon: 126.973200 },
      end: { name: '이태원', lat: 37.534542, lon: 126.994596 },
      route: '6호선',
      routeId: '1006',
      routeColor: 'CD7C2F',
      type: 1,
      passStopList: {
        stationList: [
          { index: 0, stationID: '628', stationName: '삼각지', lon: '126.973200', lat: '37.534800' },
          { index: 1, stationID: '629', stationName: '녹사평', lon: '126.987654', lat: '37.534123' },
          { index: 2, stationID: '633', stationName: '이태원', lon: '126.994596', lat: '37.534542' },
        ],
      },
      passShape: {
        linestring: '126.973200,37.534800 126.987654,37.534123 126.994596,37.534542',
      },
    },
    {
      mode: 'WALK',
      sectionTime: 120,
      distance: 150,
      start: { name: '이태원역', lat: 37.534542, lon: 126.994596 },
      end: { name: '이태원역', lat: 37.534650, lon: 126.994800 },
      steps: [
        { description: '출구에서 나와 도착', distance: 150 },
      ],
    },
  ],
};

// 경로 5 상세 (버스 환승): 명동역 → 남산 → 이태원역
export const mockRouteLeg5Detail: RouteLegDetailResponse = {
  route_leg_id: 5,
  route_itinerary_id: 1,
  pathType: 2,
  totalTime: 1500,
  totalDistance: 4500,
  totalWalkTime: 480,
  totalWalkDistance: 640,
  transferCount: 1,
  fare: {
    regular: {
      totalFare: 1500,
      currency: { symbol: '￦', currency: '원', currencyCode: 'KRW' },
    },
  },
  legs: [
    {
      mode: 'WALK',
      sectionTime: 180,
      distance: 240,
      start: { name: '명동역', lat: 37.560970, lon: 126.985856 },
      end: { name: '명동역 정류장', lat: 37.560234, lon: 126.985500 },
      steps: [
        { description: '버스 정류장으로 이동', distance: 240 },
      ],
    },
    {
      mode: 'BUS',
      sectionTime: 480,
      distance: 1800,
      start: { name: '명동역', lat: 37.560234, lon: 126.985500 },
      end: { name: '남산공원', lat: 37.551234, lon: 126.988765 },
      route: '402',
      routeId: '4000402',
      routeColor: '53B332',
      type: 11,
      passStopList: {
        stationList: [
          { index: 0, stationID: '15001', stationName: '명동역', lon: '126.985500', lat: '37.560234' },
          { index: 1, stationID: '15002', stationName: '퇴계로2가', lon: '126.987000', lat: '37.556000' },
          { index: 2, stationID: '15003', stationName: '남산공원', lon: '126.988765', lat: '37.551234' },
        ],
      },
      passShape: {
        linestring: '126.985500,37.560234 126.987000,37.556000 126.988765,37.551234',
      },
    },
    {
      mode: 'WALK',
      sectionTime: 120,
      distance: 160,
      start: { name: '남산공원 정류장', lat: 37.551234, lon: 126.988765 },
      end: { name: '남산공원 환승정류장', lat: 37.551400, lon: 126.989000 },
      steps: [
        { description: '환승 정류장으로 이동', distance: 160 },
      ],
    },
    {
      mode: 'BUS',
      sectionTime: 540,
      distance: 2300,
      start: { name: '남산공원', lat: 37.551400, lon: 126.989000 },
      end: { name: '이태원역', lat: 37.535000, lon: 126.994300 },
      route: '405',
      routeId: '4000405',
      routeColor: '53B332',
      type: 11,
      passStopList: {
        stationList: [
          { index: 0, stationID: '15004', stationName: '남산공원', lon: '126.989000', lat: '37.551400' },
          { index: 1, stationID: '15005', stationName: '한남동', lon: '127.001000', lat: '37.540000' },
          { index: 2, stationID: '15006', stationName: '이태원역', lon: '126.994300', lat: '37.535000' },
        ],
      },
      passShape: {
        linestring: '126.989000,37.551400 127.001000,37.540000 126.994300,37.535000',
      },
    },
    {
      mode: 'WALK',
      sectionTime: 180,
      distance: 240,
      start: { name: '이태원역 정류장', lat: 37.535000, lon: 126.994300 },
      end: { name: '이태원역', lat: 37.534650, lon: 126.994800 },
      steps: [
        { description: '도착지까지 이동', distance: 240 },
      ],
    },
  ],
};

// route_leg_id로 상세 데이터 가져오기
export const mockRouteLegDetails: Record<number, RouteLegDetailResponse> = {
  1: mockRouteLeg1Detail,
  2: mockRouteLeg2Detail,
  3: mockRouteLeg3Detail,
  4: mockRouteLeg4Detail,
  5: mockRouteLeg5Detail,
};

// 경로 카드에 사용할 색상 (UI용)
export const ROUTE_COLORS = [
  { bg: '#ff6b9d', gradient: 'from-[#ff6b9d] to-[#ff9ac1]', line: '#fb64b6' },
  { bg: '#ffc107', gradient: 'from-[#ffa726] to-[#ffb74d]', line: '#ffc107' },
  { bg: '#6df3e3', gradient: 'from-[#4dd0e1] to-[#80deea]', line: '#6df3e3' },
  { bg: '#a78bfa', gradient: 'from-[#a78bfa] to-[#c4b5fd]', line: '#8b5cf6' },
  { bg: '#34d399', gradient: 'from-[#34d399] to-[#6ee7b7]', line: '#10b981' },
];
