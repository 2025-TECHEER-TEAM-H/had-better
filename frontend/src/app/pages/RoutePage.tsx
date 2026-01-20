/**
 * 경로 선택 페이지
 */

import { useOutletContext } from "react-router-dom";
import { RouteSelectionPage } from "@/app/components/RouteSelectionPage";

interface LayoutContext {
  onNavigate: (page: string) => void;
  onOpenDashboard: () => void;
  onOpenFavorites: () => void;
  onSearchSubmit: (query: string) => void;
}

export function RoutePage() {
  const context = useOutletContext<LayoutContext>();

  return (
    <RouteSelectionPage
      onBack={() => context.onNavigate("search")}
      onNavigate={context.onNavigate}
    />
  );
}
