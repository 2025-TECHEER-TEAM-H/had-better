// 경로 구간 상세 (RouteTimeline 렌더링용)
export interface RouteLegDetail {
  legs: any[]; // raw_data.legs 배열
  total_time: number;
  total_distance: number;
  total_walk_time: number;
  total_walk_distance: number;
  transfer_count: number;
  path_type: number;
}

// 경로 승률 정보
export interface RouteWinRateInfo {
  route_label: string; // "N31", "4호선 → 6호선"
  win_rate: number; // 0-100
  avg_duration: number; // 초
  race_count: number;
  wins: number;
  leg_detail?: RouteLegDetail; // 경로 상세 (펼치기용)
}

// 시간대별 통계
export interface TimeSlotStats {
  label: string; // "오전"
  time: string; // "06:00 - 12:00"
  total_races: number;
  routes: RouteWinRateInfo[];
}

// 출발/도착 쌍 요약
export interface RoutePairSummary {
  departure_name: string;
  arrival_name: string;
  total_races: number;
  user_win_rate: number;
  departure_coords: { lat: number; lon: number };
  arrival_coords: { lat: number; lon: number };
}

// 상세 통계 응답
export interface RouteStatsDetail {
  departure_name: string;
  arrival_name: string;
  total_races: number;
  time_slots: {
    morning: TimeSlotStats;
    afternoon: TimeSlotStats;
    evening: TimeSlotStats;
  };
  insight: string;
}

// 시간대 키 타입
export type TimeSlotKey = 'morning' | 'afternoon' | 'evening';
