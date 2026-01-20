/**
 * 지하철 노선도 페이지
 */

import { useOutletContext } from "react-router-dom";
import { SearchPage } from "@/app/components/SearchPage";

interface LayoutContext {
  onNavigate: (page: string) => void;
  onBack?: () => void;
  onOpenDashboard: () => void;
  onOpenFavorites: () => void;
  onSearchSubmit: (query: string) => void;
}

export function SubwayPage() {
  const context = useOutletContext<LayoutContext>();

  return (
    <SearchPage
      onBack={context.onBack || (() => context.onNavigate("search"))}
      onNavigate={context.onNavigate}
      onOpenDashboard={context.onOpenDashboard}
      onOpenFavorites={context.onOpenFavorites}
      isSubwayMode={true}
      onSearchSubmit={context.onSearchSubmit}
    />
  );
}
