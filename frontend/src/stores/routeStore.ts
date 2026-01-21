/**
 * 경로 탐색 상태 관리 스토어
 *
 * RouteSelectionPage와 RouteDetailPage 간 데이터 공유
 */

import { create } from 'zustand';
import type {
  RouteSearchResponse,
  RouteLegSummary,
  RouteLegDetailResponse,
  CreateRouteResponse,
} from '@/types/route';

// 플레이어 타입 (유저 + 봇들)
export type Player = 'user' | 'bot1' | 'bot2';

// 경로 할당 정보
export interface RouteAssignment {
  player: Player;
  routeLegId: number;
  routeLegDetail?: RouteLegDetailResponse;
}

interface RouteState {
  // 경로 검색 결과
  searchResponse: RouteSearchResponse | null;

  // 출발지/도착지 정보
  departure: { name: string; lat: number; lon: number } | null;
  arrival: { name: string; lat: number; lon: number } | null;

  // 플레이어별 경로 할당
  assignments: Map<Player, number>; // Player -> route_leg_id

  // 경로 상세 정보 캐시
  legDetails: Map<number, RouteLegDetailResponse>; // route_leg_id -> detail

  // 경주 생성 응답
  createRouteResponse: CreateRouteResponse | null;
  userRouteId: number | null; // 유저의 route_id (결과 조회용)

  // 로딩 상태
  isLoading: boolean;
  error: string | null;

  // 액션
  setSearchResponse: (response: RouteSearchResponse) => void;
  setDepartureArrival: (
    departure: { name: string; lat: number; lon: number },
    arrival: { name: string; lat: number; lon: number }
  ) => void;
  assignRoute: (player: Player, routeLegId: number) => void;
  unassignRoute: (player: Player) => void;
  setLegDetail: (routeLegId: number, detail: RouteLegDetailResponse) => void;
  setCreateRouteResponse: (response: CreateRouteResponse, userRouteId: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetRoute: () => void;

  // 계산된 값 (getters)
  getAssignedRouteId: (player: Player) => number | undefined;
  isRouteAssigned: (routeLegId: number) => boolean;
  getPlayerForRoute: (routeLegId: number) => Player | undefined;
  areAllAssigned: () => boolean;
  getAssignmentList: () => RouteAssignment[];
}

export const useRouteStore = create<RouteState>((set, get) => ({
  searchResponse: null,
  departure: null,
  arrival: null,
  assignments: new Map(),
  legDetails: new Map(),
  createRouteResponse: null,
  userRouteId: null,
  isLoading: false,
  error: null,

  setSearchResponse: (response) => {
    set({ searchResponse: response, error: null });
  },

  setDepartureArrival: (departure, arrival) => {
    set({ departure, arrival });
  },

  assignRoute: (player, routeLegId) => {
    const { assignments, isRouteAssigned } = get();

    // 이미 다른 플레이어에게 할당된 경로인지 확인
    if (isRouteAssigned(routeLegId)) {
      const existingPlayer = get().getPlayerForRoute(routeLegId);
      if (existingPlayer !== player) {
        console.warn(`경로 ${routeLegId}는 이미 ${existingPlayer}에게 할당됨`);
        return;
      }
    }

    const newAssignments = new Map(assignments);
    newAssignments.set(player, routeLegId);
    set({ assignments: newAssignments });
  },

  unassignRoute: (player) => {
    const { assignments } = get();
    const newAssignments = new Map(assignments);
    newAssignments.delete(player);
    set({ assignments: newAssignments });
  },

  setLegDetail: (routeLegId, detail) => {
    const { legDetails } = get();
    const newLegDetails = new Map(legDetails);
    newLegDetails.set(routeLegId, detail);
    set({ legDetails: newLegDetails });
  },

  setCreateRouteResponse: (response, userRouteId) => {
    set({ createRouteResponse: response, userRouteId });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  resetRoute: () => {
    set({
      searchResponse: null,
      departure: null,
      arrival: null,
      assignments: new Map(),
      legDetails: new Map(),
      createRouteResponse: null,
      userRouteId: null,
      isLoading: false,
      error: null,
    });
  },

  // Getters
  getAssignedRouteId: (player) => {
    return get().assignments.get(player);
  },

  isRouteAssigned: (routeLegId) => {
    const { assignments } = get();
    for (const [, assignedRouteId] of assignments) {
      if (assignedRouteId === routeLegId) return true;
    }
    return false;
  },

  getPlayerForRoute: (routeLegId) => {
    const { assignments } = get();
    for (const [player, assignedRouteId] of assignments) {
      if (assignedRouteId === routeLegId) return player;
    }
    return undefined;
  },

  areAllAssigned: () => {
    const { assignments } = get();
    const players: Player[] = ['user', 'bot1', 'bot2'];
    return players.every((player) => assignments.has(player));
  },

  getAssignmentList: () => {
    const { assignments, legDetails } = get();
    const list: RouteAssignment[] = [];

    for (const [player, routeLegId] of assignments) {
      list.push({
        player,
        routeLegId,
        routeLegDetail: legDetails.get(routeLegId),
      });
    }

    return list;
  },
}));

// 플레이어 라벨
export const PLAYER_LABELS: Record<Player, string> = {
  user: '유저',
  bot1: '봇1',
  bot2: '봇2',
};

// 플레이어 아이콘
export const PLAYER_ICONS: Record<Player, string> = {
  user: '🏃',
  bot1: '👻',
  bot2: '👻',
};
