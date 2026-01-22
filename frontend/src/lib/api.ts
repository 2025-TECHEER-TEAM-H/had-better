/**
 * API 클라이언트 설정
 * axios 인스턴스 생성 및 인터셉터 설정
 */

import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// 토큰 가져오기 (localStorage 우선, 없으면 sessionStorage)
const getToken = (key: string): string | null => {
  return localStorage.getItem(key) || sessionStorage.getItem(key);
};

// 토큰 저장하기 (기존 저장소 유지)
const setToken = (key: string, value: string): void => {
  // sessionStorage에 있었으면 sessionStorage에, 아니면 localStorage에 저장
  if (sessionStorage.getItem(key) !== null) {
    sessionStorage.setItem(key, value);
  } else {
    localStorage.setItem(key, value);
  }
};

// 토큰 삭제하기 (둘 다 삭제)
const removeTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('refresh_token');
};

// axios 인스턴스 생성
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// 요청 인터셉터: JWT 토큰 자동 첨부
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // localStorage 또는 sessionStorage에서 토큰 가져오기
    const token = getToken('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 토큰 갱신 중복 방지 플래그
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 응답 인터셉터: 토큰 만료 시 갱신
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 에러이고 토큰 갱신 시도 안 한 경우
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // localStorage 또는 sessionStorage에서 refresh 토큰 가져오기
      const refreshToken = getToken('refresh_token');
      console.log('[API] 401 에러 발생, refresh_token 존재:', !!refreshToken);

      // refresh 토큰이 없으면 로그인 페이지로 이동
      if (!refreshToken) {
        console.log('[API] refresh_token 없음, 로그인 페이지로 이동');
        removeTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // 이미 토큰 갱신 중이면 대기열에 추가
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 토큰 갱신 요청
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh: refreshToken,
        });

        // 백엔드 응답 형식: { status: "success", data: { access: "..." } }
        const access = response.data.status === 'success'
          ? response.data.data.access
          : response.data.data?.access || response.data.access;

        console.log('[API] 토큰 갱신 성공');

        // 기존 저장소(localStorage 또는 sessionStorage)에 저장
        setToken('access_token', access);

        processQueue(null, access);

        // 원래 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        console.log('[API] 토큰 갱신 실패, 로그인 페이지로 이동');
        processQueue(refreshError, null);
        // 토큰 갱신 실패 시 로그아웃 처리
        removeTokens();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
