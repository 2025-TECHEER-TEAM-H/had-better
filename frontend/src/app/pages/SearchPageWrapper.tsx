/**
 * 검색 페이지 래퍼 (라우터용)
 */

import { useOutletContext } from "react-router-dom";
import { SearchPage } from "@/app/components/SearchPage";

interface LayoutContext {
  onNavigate: (page: string) => void;
  onOpenDashboard: () => void;
  onOpenFavorites: () => void;
  onSearchSubmit: (query: string) => void;
}

export function SearchPageWrapper() {
  const context = useOutletContext<LayoutContext>();

  return (
    <SearchPage
      onBack={() => context.onNavigate("map")}
      onNavigate={context.onNavigate}
      onOpenDashboard={context.onOpenDashboard}
      onOpenFavorites={context.onOpenFavorites}
      isSubwayMode={false}
      onSearchSubmit={context.onSearchSubmit}
    />
  );
}
