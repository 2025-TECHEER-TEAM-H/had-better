/**
 * 인증 관련 API 서비스
 */

import api from "@/lib/api";

// 로그인 요청 타입
interface LoginRequest {
  name: string;  // 백엔드에서는 name 사용
  password: string;
}

// 로그인 응답 타입
interface LoginResponse {
  status: "success" | "error";
  data?: {
    user: {
      id: number;
      name: string;       // 백엔드에서는 name
      email: string;
      nickname: string;
      created_at: string;
      updated_at: string;
    };
    tokens: {
      access: string;
      refresh: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

// 회원가입 요청 타입
interface SignupRequest {
  name: string;           // 유저 ID (백엔드에서는 name)
  email: string;
  password: string;
  password_confirm: string;
  nickname: string;
}

// 회원가입 응답 타입
interface SignupResponse {
  status: "success" | "error";
  data?: {
    user: {
      id: number;
      username: string;
      email: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

// 토큰 갱신 응답 타입
interface RefreshResponse {
  status: "success" | "error";
  data?: {
    access: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

/**
 * 로그인 API
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
}

/**
 * 회원가입 API
 */
export async function signup(data: SignupRequest): Promise<SignupResponse> {
  const response = await api.post<SignupResponse>("/auth/register", data);
  return response.data;
}

/**
 * 토큰 갱신 API
 */
export async function refreshToken(refreshToken: string): Promise<RefreshResponse> {
  const response = await api.post<RefreshResponse>("/auth/refresh", {
    refresh: refreshToken,
  });
  return response.data;
}

/**
 * 로그아웃 API (서버에 토큰 무효화 요청)
 * @param refreshToken - 무효화할 refresh 토큰
 */
export async function logout(refreshToken: string): Promise<void> {
  try {
    // 백엔드: POST /auth/logout { refresh: "<token>" }
    await api.post("/auth/logout", {
      refresh: refreshToken,
    });
  } catch {
    // 로그아웃 실패해도 로컬 토큰은 삭제
  }
}

// 기본 내보내기
const authService = {
  login,
  signup,
  refreshToken,
  logout,
};

export default authService;
