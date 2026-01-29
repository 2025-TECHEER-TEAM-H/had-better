/**
 * 경주 통계 관련 API 서비스
 */

import api from "@/lib/api";
import type { RoutePairSummary, RouteStatsDetail } from "@/types/stats";

// API 응답 기본 타입
interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 출발/도착 쌍 목록 조회
 */
export async function getRoutePairs(): Promise<RoutePairSummary[]> {
  const response = await api.get<
    ApiResponse<{ route_pairs: RoutePairSummary[] }>
  >("/routes/stats");
  if (response.data.status === "error") {
    throw new Error(response.data.error?.message || "통계 조회에 실패했습니다.");
  }
  return response.data.data?.route_pairs || [];
}

/**
 * 특정 출발/도착 쌍의 상세 통계 조회
 */
export async function getRouteStats(
  departureName: string,
  arrivalName: string,
): Promise<RouteStatsDetail> {
  const response = await api.get<ApiResponse<RouteStatsDetail>>(
    "/routes/stats",
    {
      params: {
        departure_name: departureName,
        arrival_name: arrivalName,
      },
    },
  );
  if (response.data.status === "error") {
    throw new Error(response.data.error?.message || "통계 조회에 실패했습니다.");
  }
  return response.data.data!;
}
