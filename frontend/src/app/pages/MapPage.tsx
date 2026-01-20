/**
 * 지도 페이지
 * 전체 화면 지도 표시
 */

import { useOutletContext } from "react-router-dom";
import { MapView } from "@/app/components/MapView";

interface LayoutContext {
  onNavigate: (page: string) => void;
  onOpenDashboard: () => void;
  onOpenFavorites: () => void;
  onSearchSubmit: (query: string) => void;
}

export function MapPage() {
  const { onNavigate } = useOutletContext<LayoutContext>();

  return (
    <div className="size-full">
      <MapView onNavigate={onNavigate} />
    </div>
  );
}
