/**
 * 검색 페이지 래퍼 (라우터용)
 */

import { useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import { SearchPage } from "@/app/components/SearchPage";

interface LayoutContext {
  onNavigate: (page: string) => void;
  onBack?: () => void;
  onOpenDashboard: () => void;
  onOpenFavorites: () => void;
  onSearchSubmit: (query: string) => void;
}

export function SearchPageWrapper() {
  const context = useOutletContext<LayoutContext>();
  const [searchParams, setSearchParams] = useSearchParams();

  // SearchPage가 마운트될 때 URL에 ?q=...가 있으면 제거
  // 이렇게 하면 다른 화면에서 SearchPage로 왔을 때 SearchResultsPage가 자동으로 열리지 않음
  useEffect(() => {
    if (searchParams.has("q")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("q");
      newParams.delete("place");
      setSearchParams(newParams, { replace: true });
    }
  }, []); // 마운트 시 한 번만 실행

  // SearchPage의 뒤로가기는 항상 map으로 이동하도록 고정
  // context.onBack(히스토리 기반)을 사용하지 않음
  const handleBack = () => {
    context.onNavigate("map");
  };

  return (
    <SearchPage
      onBack={handleBack}
      onNavigate={context.onNavigate}
      onOpenDashboard={context.onOpenDashboard}
      onOpenFavorites={context.onOpenFavorites}
      isSubwayMode={false}
      onSearchSubmit={context.onSearchSubmit}
    />
  );
}
