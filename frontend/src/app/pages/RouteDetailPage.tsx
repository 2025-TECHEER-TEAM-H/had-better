/**
 * 경로 상세 페이지 (라우터용 래퍼)
 */

import { useOutletContext } from "react-router-dom";
import { RouteDetailPage as RouteDetailPageComponent } from "@/app/components/RouteDetailPage";

interface LayoutContext {
  onNavigate: (page: string) => void;
  onOpenDashboard: () => void;
  onOpenFavorites: () => void;
  onSearchSubmit: (query: string) => void;
}

export function RouteDetailPage() {
  const context = useOutletContext<LayoutContext>();

  return (
    <RouteDetailPageComponent
      onBack={() => context.onNavigate("route")}
      onNavigate={context.onNavigate}
      onOpenDashboard={context.onOpenDashboard}
    />
  );
}
