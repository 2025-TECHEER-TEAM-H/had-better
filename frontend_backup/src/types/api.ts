/**
 * API 응답 타입 정의
 */

// 공통 응답 타입
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  meta?: {
    timestamp?: string;
    pagination?: PaginationMeta;
  };
}

// 페이지네이션 메타
export interface PaginationMeta {
  page: number;
  limit: number;
  total_count: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// 에러 응답 타입
export interface ApiError {
  status: 'error';
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// 좌표 타입
export interface Coordinates {
  lat: number;
  lon: number;
}
