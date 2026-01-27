/// <reference types="vite/client" />

// 환경변수 타입 선언
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_MAPBOX_ACCESS_TOKEN: string;
  readonly VITE_USE_MOCK_DATA?: string; // 'true' | 'false' | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

