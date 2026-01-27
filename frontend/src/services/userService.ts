/**
 * 사용자 관련 API 서비스 (내 정보 / 프로필)
 */

import api from "@/lib/api";
import type { User } from "@/types/user";

interface UpdateMeResponse {
  status: "success" | "error";
  data?: User;
  error?: {
    code: string;
    message: string;
  };
}

// 최근 게임 타입
export interface RecentGame {
  id: number;
  route_name: string;
  duration: string;
  rank: string;
  created_at: string;
}

// 사용자 통계 타입
export interface UserStats {
  total_games: number;
  wins: number;
  win_rate: number;
  recent_games: RecentGame[];
}

interface UserStatsResponse {
  status: "success" | "error";
  data?: UserStats;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 닉네임 변경 API
 * PATCH /api/v1/users
 */
export async function updateNickname(nickname: string): Promise<UpdateMeResponse> {
  const response = await api.patch<UpdateMeResponse>("/users", {
    nickname,
  });
  return response.data;
}

/**
 * 사용자 통계 조회 API
 * GET /api/v1/users/stats
 */
export async function getStats(): Promise<UserStats> {
  const response = await api.get<UserStatsResponse>("/users/stats");
  return response.data.data || { total_games: 0, wins: 0, win_rate: 0, recent_games: [] };
}

const userService = {
  updateNickname,
  getStats,
};

export default userService;

