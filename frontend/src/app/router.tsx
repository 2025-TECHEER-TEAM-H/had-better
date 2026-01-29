/**
 * React Router 설정
 * 앱의 모든 라우트를 정의합니다.
 */

import { LandingPage } from "@/app/components/LandingPage";
import { LoginPage } from "@/app/components/LoginPage";
import { Onboarding1Page } from "@/app/components/Onboarding1Page";
import { Onboarding2Page } from "@/app/components/Onboarding2Page";
import { Onboarding3Page } from "@/app/components/Onboarding3Page";
import { Onboarding4Page } from "@/app/components/Onboarding4Page";
import { Onboarding5Page } from "@/app/components/Onboarding5Page";
import { SignupPage } from "@/app/components/SignupPage";
import { MainLayout } from "@/app/layouts/MainLayout";
import { MapPage } from "@/app/pages/MapPage";
import { RouteDetailPage } from "@/app/pages/RouteDetailPage";
import { RoutePage } from "@/app/pages/RoutePage";
import { SearchPageWrapper } from "@/app/pages/SearchPageWrapper";
import { StatsPage } from "@/app/pages/StatsPage";
import { createBrowserRouter } from "react-router-dom";

/**
 * URL 구조:
 * /                - 랜딩 페이지
 * /onboarding/1-5  - 온보딩 단계
 * /login           - 로그인
 * /signup          - 회원가입
 * /search          - 검색 (메인)
 * /map             - 지도
 * /stats           - 경주 통계
 * /route           - 경로 선택
 * /route/detail    - 경로 상세
 */

export const router = createBrowserRouter([
  // 인증 전 페이지들
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/onboarding/1",
    element: <Onboarding1Page />,
  },
  {
    path: "/onboarding/2",
    element: <Onboarding2Page />,
  },
  {
    path: "/onboarding/3",
    element: <Onboarding3Page />,
  },
  {
    path: "/onboarding/4",
    element: <Onboarding4Page />,
  },
  {
    path: "/onboarding/5",
    element: <Onboarding5Page />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
  },

  // 메인 앱 페이지들 (공통 레이아웃 사용)
  {
    element: <MainLayout />,
    children: [
      {
        path: "/search",
        element: <SearchPageWrapper />,
      },
      {
        path: "/map",
        element: <MapPage />,
      },
      {
        path: "/stats",
        element: <StatsPage />,
      },
      {
        path: "/route",
        element: <RoutePage />,
      },
      {
        path: "/route/detail",
        element: <RouteDetailPage />,
      },
    ],
  },
]);
