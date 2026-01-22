/**
 * 사용자 관련 타입 정의
 */

export interface User {
  id: number;
  name: string;
  email: string;
  nickname: string;
  created_at: string;
  updated_at: string;
}

export interface UserStats {
  total_routes: number;
  wins: number;
  losses: number;
  win_rate: number;
  total_distance: number;
  total_time: number;
  average_time: number;
  recent_routes: RecentRoute[];
}

export interface RecentRoute {
  route_itinerary_id: number;
  rank: number;
  total_participants: number;
  route_summary: string;
  end_time: string;
}

// 인증 관련 타입
export interface LoginRequest {
  name: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirm: string;
  nickname: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}
