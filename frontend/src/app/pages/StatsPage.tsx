/**
 * 통계 페이지 래퍼
 */

import { useOutletContext } from "react-router-dom";
import { StatsPage as StatsPageComponent } from "@/app/components/StatsPage";

interface LayoutContext {
  onNavigate: (page: string) => void;
  onBack?: () => void;
  onOpenDashboard: () => void;
  onOpenSubway?: () => void;
}

export function StatsPage() {
  const context = useOutletContext<LayoutContext>();

  return (
    <StatsPageComponent
      onBack={context.onBack || (() => context.onNavigate("search"))}
      onNavigate={context.onNavigate}
      onOpenDashboard={context.onOpenDashboard}
      onOpenSubway={context.onOpenSubway}
    />
  );
}
