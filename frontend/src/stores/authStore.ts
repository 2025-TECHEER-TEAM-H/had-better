/**
 * 인증 상태 관리 스토어
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  // 액션
  setAuth: (user: User, tokens: { access: string; refresh: string }, keepLoggedIn?: boolean) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, tokens, keepLoggedIn = true) => {
        // 로그인 유지 여부에 따라 저장소 선택
        // keepLoggedIn=true: localStorage (브라우저 닫아도 유지)
        // keepLoggedIn=false: sessionStorage (브라우저/탭 닫으면 삭제)
        const storage = keepLoggedIn ? localStorage : sessionStorage;

        // api.ts와 동일한 키 사용 (access_token, refresh_token)
        storage.setItem('access_token', tokens.access);
        storage.setItem('refresh_token', tokens.refresh);
        set({
          user,
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
          isAuthenticated: true,
        });
      },

      logout: () => {
        // localStorage와 sessionStorage 둘 다 정리
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        // 이전 키 형식도 함께 삭제 (호환성)
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
