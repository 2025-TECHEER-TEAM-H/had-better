// API Base URL - 환경 변수로 설정 가능
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// API 응답 타입 정의
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 인증 관련 타입
export interface LoginRequest {
  name: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    username: string;
    nickname?: string;
  };
}

export interface SignUpRequest {
  email: string;
  username: string;
  password: string;
  nickname?: string;
}

export interface SignUpResponse {
  message: string;
  user: {
    id: number;
    email: string;
    username: string;
    nickname?: string;
  };
}

// 지도 관련 타입
export interface Place {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  category?: string;
  image_url?: string;
  rating?: number;
}

export interface Route {
  id: number;
  name: string;
  places: Place[];
  distance?: number;
  duration?: number;
  difficulty?: string;
}

// 토큰 관리
export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem("access_token");
  },

  setToken: (token: string): void => {
    localStorage.setItem("access_token", token);
  },

  removeToken: (): void => {
    localStorage.removeItem("access_token");
  },

  getAuthHeader: (): Record<string, string> => {
    const token = tokenManager.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
};

// 임시 사용자 데이터 관리 (테스트용)
export const tempUserStorage = {
  // 사용자 목록 가져오기
  getUsers: (): Array<{ id: number; email: string; username: string; password: string; nickname?: string }> => {
    const usersJson = localStorage.getItem("temp_users");
    return usersJson ? JSON.parse(usersJson) : [];
  },

  // 사용자 추가
  addUser: (userData: { email: string; username: string; password: string; nickname?: string }): void => {
    const users = tempUserStorage.getUsers();
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const newUser = {
      id: newId,
      ...userData,
    };
    users.push(newUser);
    localStorage.setItem("temp_users", JSON.stringify(users));
  },

  // 이메일로 사용자 찾기
  findUserByEmail: (email: string): { id: number; email: string; username: string; password: string; nickname?: string } | null => {
    const users = tempUserStorage.getUsers();
    return users.find(u => u.email === email) || null;
  },

  // 사용자명으로 사용자 찾기
  findUserByUsername: (username: string): { id: number; email: string; username: string; password: string; nickname?: string } | null => {
    const users = tempUserStorage.getUsers();
    return users.find(u => u.username === username) || null;
  },

  // 모든 사용자 삭제 (초기화)
  clearUsers: (): void => {
    localStorage.removeItem("temp_users");
  },
};

// 기본 fetch 래퍼 함수
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = tokenManager.getToken();

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.detail || data.message || "요청에 실패했습니다",
        message: data.detail || data.message,
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "네트워크 오류가 발생했습니다",
    };
  }
}

// 인증 API
export const authApi = {
  // 로그인
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    return apiRequest<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  // 회원가입
  signup: async (userData: SignUpRequest): Promise<ApiResponse<SignUpResponse>> => {
    return apiRequest<SignUpResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // 로그아웃 (토큰만 제거)
  logout: (): void => {
    tokenManager.removeToken();
  },

  // 현재 사용자 정보 가져오기
  getCurrentUser: async (): Promise<ApiResponse<LoginResponse["user"]>> => {
    return apiRequest<LoginResponse["user"]>("/auth/me");
  },
};

// 지도 API
export const mapApi = {
  // 모든 장소 가져오기
  getPlaces: async (): Promise<ApiResponse<Place[]>> => {
    return apiRequest<Place[]>("/maps/places");
  },

  // 특정 장소 가져오기
  getPlace: async (placeId: number): Promise<ApiResponse<Place>> => {
    return apiRequest<Place>(`/maps/places/${placeId}`);
  },

  // 경로 목록 가져오기
  getRoutes: async (): Promise<ApiResponse<Route[]>> => {
    return apiRequest<Route[]>("/maps/routes");
  },

  // 특정 경로 가져오기
  getRoute: async (routeId: number): Promise<ApiResponse<Route>> => {
    return apiRequest<Route>(`/maps/routes/${routeId}`);
  },

  // 즐겨찾기 장소 가져오기
  getFavoritePlaces: async (): Promise<ApiResponse<Place[]>> => {
    return apiRequest<Place[]>("/maps/favorites");
  },

  // 즐겨찾기 추가
  addFavorite: async (placeId: number): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest<{ message: string }>(`/maps/favorites/${placeId}`, {
      method: "POST",
    });
  },

  // 즐겨찾기 제거
  removeFavorite: async (placeId: number): Promise<ApiResponse<{ message: string }>> => {
    return apiRequest<{ message: string }>(`/maps/favorites/${placeId}`, {
      method: "DELETE",
    });
  },
};

// 사용자 API
export const userApi = {
  // 사용자 프로필 가져오기
  getProfile: async (): Promise<ApiResponse<LoginResponse["user"]>> => {
    return apiRequest<LoginResponse["user"]>("/user/profile");
  },

  // 사용자 프로필 업데이트
  updateProfile: async (data: Partial<SignUpRequest>): Promise<ApiResponse<LoginResponse["user"]>> => {
    return apiRequest<LoginResponse["user"]>("/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};
