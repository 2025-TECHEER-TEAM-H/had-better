// 경로 승률 정보
export interface RouteWinRateInfo {
  route_label: string; // "N31", "4호선 → 6호선"
  win_rate: number; // 0-100
  avg_duration: number; // 초
  race_count: number;
  wins: number;
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
export type TimeSlotKey = "morning" | "afternoon" | "evening";
