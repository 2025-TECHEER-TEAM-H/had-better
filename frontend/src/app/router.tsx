/**
 * React Router 설정
 * 앱의 모든 라우트를 정의합니다.
 */

import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "@/app/layouts/MainLayout";
import { LandingPage } from "@/app/components/LandingPage";
import { LoginPage } from "@/app/components/LoginPage";
import { SignupPage } from "@/app/components/SignupPage";
import { Onboarding1Page } from "@/app/components/Onboarding1Page";
import { Onboarding2Page } from "@/app/components/Onboarding2Page";
import { Onboarding3Page } from "@/app/components/Onboarding3Page";
import { Onboarding4Page } from "@/app/components/Onboarding4Page";
import { Onboarding5Page } from "@/app/components/Onboarding5Page";
import { SearchPageWrapper } from "@/app/pages/SearchPageWrapper";
import { MapPage } from "@/app/pages/MapPage";
import { SubwayPage } from "@/app/pages/SubwayPage";
import { RoutePage } from "@/app/pages/RoutePage";
import { RouteDetailPage } from "@/app/pages/RouteDetailPage";

/**
 * URL 구조:
 * /                - 랜딩 페이지
 * /onboarding/1-5  - 온보딩 단계
 * /login           - 로그인
 * /signup          - 회원가입
 * /search          - 검색 (메인)
 * /map             - 지도
 * /subway          - 지하철 노선도
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
        path: "/subway",
        element: <SubwayPage />,
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
