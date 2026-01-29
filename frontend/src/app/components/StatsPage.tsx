import { useEffect, useState } from "react";
import { AppHeader } from "@/app/components/AppHeader";
import { getRoutePairs, getRouteStats } from "@/services/statsService";
import { useRouteStore } from "@/stores/routeStore";
import type {
  RoutePairSummary,
  RouteStatsDetail,
  TimeSlotKey,
  RouteWinRateInfo,
} from "@/types/stats";

type PageType = "map" | "search" | "favorites" | "stats" | "route";

interface StatsPageProps {
  onBack?: () => void;
  onNavigate?: (page: PageType) => void;
  onOpenDashboard?: () => void;
  onOpenSubway?: () => void;
}

const TIME_SLOT_ICONS: Record<TimeSlotKey, string> = {
  morning: "\u{1F305}",
  afternoon: "\u{2600}\u{FE0F}",
  evening: "\u{1F319}",
};

function formatDuration(seconds: number): string {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  if (min === 0) return `${sec}\uCD08`;
  if (sec === 0) return `${min}\uBD84`;
  return `${min}\uBD84 ${sec}\uCD08`;
}

function getWinRateColor(rate: number): string {
  if (rate >= 70) return "#4CAF50";
  if (rate >= 50) return "#FF9800";
  return "#F44336";
}

export function StatsPage({
  onBack,
  onNavigate,
  onOpenDashboard,
  onOpenSubway,
}: StatsPageProps) {
  const [routePairs, setRoutePairs] = useState<RoutePairSummary[]>([]);
  const [selectedPair, setSelectedPair] = useState<{
    departure: string;
    arrival: string;
  } | null>(null);
  const [stats, setStats] = useState<RouteStatsDetail | null>(null);
  const [activeTimeSlot, setActiveTimeSlot] = useState<TimeSlotKey>("morning");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setDepartureArrival } = useRouteStore();

  // 현재 선택된 출발/도착 쌍의 좌표로 경로 탐색 페이지 이동
  const handleNavigateToRoute = () => {
    const pair = routePairs.find(
      (p) =>
        p.departure_name === selectedPair?.departure &&
        p.arrival_name === selectedPair?.arrival
    );
    if (pair) {
      setDepartureArrival(
        { name: pair.departure_name, ...pair.departure_coords },
        { name: pair.arrival_name, ...pair.arrival_coords }
      );
    }
    onNavigate?.("route");
  };

  // 출발/도착 쌍 목록 로드
  useEffect(() => {
    const fetchPairs = async () => {
      try {
        setLoading(true);
        const pairs = await getRoutePairs();
        setRoutePairs(pairs);
        // 첫 번째 쌍 자동 선택
        if (pairs.length > 0) {
          setSelectedPair({
            departure: pairs[0].departure_name,
            arrival: pairs[0].arrival_name,
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "데이터를 불러올 수 없습니다.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPairs();
  }, []);

  // 선택된 쌍의 상세 통계 로드
  useEffect(() => {
    if (!selectedPair) return;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const detail = await getRouteStats(
          selectedPair.departure,
          selectedPair.arrival,
        );
        setStats(detail);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "통계를 불러올 수 없습니다.",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedPair]);

  const currentSlot = stats?.time_slots[activeTimeSlot];
  // 최소 3회 이상인 경로 중 승률 최고를 "최고 승률"로 표시
  const bestRoute =
    currentSlot?.routes && currentSlot.routes.length > 0
      ? [...currentSlot.routes]
          .filter((r) => r.race_count >= 3)
          .sort((a, b) => b.win_rate - a.win_rate)[0] ?? null
      : null;

  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-b from-[#E8F5E9] to-[#F5F5F5] overflow-hidden hb-stats-page">
      <style>{`
          /* Header overrides (StatsPage - SearchPage와 동일) */
          .hb-stats-page .hb-search-header button[data-name="Container"],
          .hb-stats-page .hb-search-header button[data-name="Button"] {
            background: linear-gradient(135deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.16) 100%) !important;
            border: 1px solid rgba(255,255,255,0.55) !important;
            box-shadow: 0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.22) !important;
            backdrop-filter: blur(16px) saturate(155%) !important;
            -webkit-backdrop-filter: blur(16px) saturate(155%) !important;
          }

          .hb-stats-page .hb-search-header button[data-name="Container"] [data-name="Icon10"] {
            left: 50% !important;
            top: 50% !important;
            transform: translate(-50%, -50%) !important;
          }

          .hb-stats-page .hb-search-header button[data-name="Button"] p {
            text-shadow: 0.5px 0 currentColor, -0.5px 0 currentColor;
          }

          .hb-stats-page .hb-search-header button[data-name="Button"] [data-name="Text"] p {
            opacity: 0 !important;
          }

          .hb-stats-page .hb-search-header button[data-name="Button"] [data-name="Text"] {
            position: relative;
          }

          .hb-stats-page .hb-search-header button[data-name="Button"] [data-name="Text"]::before {
            content: "";
            position: absolute;
            left: 50%;
            top: calc(50% - 0.5px);
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            background-repeat: no-repeat;
            background-position: center;
            background-size: 20px 20px;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M14.5 6.5L9 12l5.5 5.5' stroke='%230a0a0a' stroke-width='2.9' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          }

          .hb-stats-page .hb-search-header-title {
            font-family: 'DNFBitBitv2', 'Press Start 2P', sans-serif;
            font-size: 16px;
            line-height: 30px;
            letter-spacing: 0.6px;
            color: #000000 !important;
            opacity: 1 !important;
            text-shadow: none;
          }
      `}</style>
      {/* 헤더 */}
      <div className="relative z-20 hb-search-header">
        {/* 헤더 뒤 불투명 배경 (스크롤 콘텐츠 가림) */}
        <div
          className="absolute inset-x-0 top-0 bg-gradient-to-b from-[#E8F5E9] to-[#E8F5E9]"
          style={{ height: "calc(130px + env(safe-area-inset-top, 0px))" }}
        />
        <AppHeader
          onBack={onBack}
          onNavigate={onNavigate}
          onOpenDashboard={onOpenDashboard}
          title=""
          currentPage="stats"
          showSearchBar={false}
          onMenuClick={() => {
            // 통계 페이지에서는 햄버거 메뉴 미사용 (레이아웃 일관성 유지용)
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 hb-search-header-title text-center"
          style={{
            top: "calc(21px + env(safe-area-inset-top, 0px))",
            color: "#000",
          }}
        >
          HAD BETTER
        </div>
      </div>

      {/* 본문 */}
      <div
        className="flex-1 overflow-y-auto px-4 pb-6 relative z-10"
        style={{ paddingTop: "calc(140px + env(safe-area-inset-top, 0px))" }}
      >
        {/* 로딩 */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-[#2d5f3f] font-['Noto_Sans_KR',sans-serif] text-[14px]">
              통계 데이터를 불러오는 중...
            </div>
          </div>
        )}

        {/* 에러 */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <p className="text-red-500 font-['Noto_Sans_KR',sans-serif] text-[14px]">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg text-[13px]"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 데이터 없음 */}
        {!loading && !error && routePairs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="text-[48px]">
              {"\u{1F3C1}"}
            </span>
            <p className="text-gray-600 font-['Noto_Sans_KR',sans-serif] text-[14px] text-center">
              아직 경주 데이터가 없습니다.
              <br />
              경주를 시작해보세요!
            </p>
            <button
              onClick={handleNavigateToRoute}
              className="px-6 py-3 bg-gradient-to-r from-[#81C784] to-[#4CAF50] text-white rounded-xl font-bold text-[14px] shadow-md"
            >
              경로 검색하기
            </button>
          </div>
        )}

        {/* 통계 본문 */}
        {!loading && !error && stats && (
          <>
            {/* 출발/도착 헤더 */}
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm mb-4">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[8px] text-[#4CAF50] flex-shrink-0">
                  {"\u{25CF}"}
                </span>
                <span className="text-[13px] font-semibold text-gray-800 font-['Noto_Sans_KR',sans-serif] truncate">
                  {stats.departure_name}
                </span>
                <span className="text-gray-400 text-[14px] flex-shrink-0 mx-1">
                  {"\u{2192}"}
                </span>
                <span className="text-[8px] text-[#F44336] flex-shrink-0">
                  {"\u{25CF}"}
                </span>
                <span className="text-[13px] font-semibold text-gray-800 font-['Noto_Sans_KR',sans-serif] truncate">
                  {stats.arrival_name}
                </span>
              </div>
              <div className="px-2.5 py-1.5 bg-gradient-to-br from-[#81C784] to-[#4CAF50] rounded-xl flex-shrink-0 ml-3">
                <span className="text-[11px] font-semibold text-white whitespace-nowrap">
                  {stats.total_races}{"회"}
                </span>
              </div>
            </div>

            {/* 출발/도착 쌍 선택 (여러 개일 경우) */}
            {routePairs.length > 1 && (
              <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                {routePairs.map((pair) => {
                  const isSelected =
                    selectedPair?.departure === pair.departure_name &&
                    selectedPair?.arrival === pair.arrival_name;
                  return (
                    <button
                      key={`${pair.departure_name}-${pair.arrival_name}`}
                      onClick={() =>
                        setSelectedPair({
                          departure: pair.departure_name,
                          arrival: pair.arrival_name,
                        })
                      }
                      className={`flex-shrink-0 px-3 py-2 rounded-lg text-[12px] font-['Noto_Sans_KR',sans-serif] transition-all ${
                        isSelected
                          ? "bg-[#4CAF50] text-white shadow-sm"
                          : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      {pair.departure_name} {"\u{2192}"} {pair.arrival_name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 시간대 탭 */}
            <div className="flex gap-2 mb-4">
              {(
                Object.entries(stats.time_slots) as [
                  TimeSlotKey,
                  (typeof stats.time_slots)[TimeSlotKey],
                ][]
              ).map(([key, slot]) => (
                <button
                  key={key}
                  onClick={() => setActiveTimeSlot(key)}
                  className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all ${
                    activeTimeSlot === key
                      ? "bg-[#E8F5E9] border-[#4CAF50]"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-[18px]">{TIME_SLOT_ICONS[key]}</span>
                  <span
                    className={`text-[13px] font-semibold font-['Noto_Sans_KR',sans-serif] ${
                      activeTimeSlot === key
                        ? "text-[#2E7D32]"
                        : "text-gray-500"
                    }`}
                  >
                    {slot.label}
                  </span>
                  <span className="text-[10px] text-gray-400">{slot.time}</span>
                </button>
              ))}
            </div>

            {/* 해당 시간대 데이터 없음 */}
            {currentSlot &&
              (!currentSlot.routes || currentSlot.routes.length === 0) && (
                <div className="bg-white rounded-2xl p-8 shadow-sm text-center mb-4">
                  <span className="text-[36px]">
                    {"\u{1F4CA}"}
                  </span>
                  <p className="mt-3 text-gray-500 text-[13px] font-['Noto_Sans_KR',sans-serif]">
                    {currentSlot.label} 시간대 경주 데이터가 아직 없습니다.
                  </p>
                </div>
              )}

            {/* 최고 승률 카드 */}
            {bestRoute && (
              <div className="bg-white rounded-2xl p-4 mb-4 shadow-md border-2 border-[#81C784]">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[18px]">
                    {"\u{1F451}"}
                  </span>
                  <span className="text-[13px] font-semibold text-[#2E7D32] uppercase tracking-wider font-['Noto_Sans_KR',sans-serif]">
                    {currentSlot?.label} 최고 승률
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="px-2.5 py-2 rounded-2xl bg-gradient-to-br from-[#81C784] to-[#4CAF50] flex items-center justify-center flex-shrink-0">
                    <span className="text-[15px] font-extrabold text-white leading-tight text-center whitespace-nowrap">
                      {bestRoute.route_label}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-around">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-gray-400">
                          {"승률"}
                        </span>
                        <span className="text-[15px] font-bold text-[#4CAF50]">
                          {bestRoute.win_rate}%
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-gray-400">
                          {"평균 시간"}
                        </span>
                        <span className="text-[15px] font-bold text-[#4CAF50] whitespace-nowrap">
                          {formatDuration(bestRoute.avg_duration)}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-gray-400">
                          {"경주"}
                        </span>
                        <span className="text-[15px] font-bold text-[#4CAF50]">
                          {bestRoute.race_count}{"회"}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[10px] text-gray-400">
                          {"승리"}
                        </span>
                        <span className="text-[15px] font-bold text-[#4CAF50]">
                          {bestRoute.wins}{"승"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 전체 루트 비교 */}
            {currentSlot &&
              currentSlot.routes &&
              currentSlot.routes.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                  <div className="mb-3">
                    <span className="text-[13px] font-semibold text-gray-800 font-['Noto_Sans_KR',sans-serif]">
                      {"\u{1F4CA}"} 전체 루트 비교
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    {currentSlot.routes.map(
                      (route: RouteWinRateInfo, index: number) => (
                        <div
                          key={route.route_label}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                        >
                          <div className="w-8 text-center text-[18px]">
                            {index === 0
                              ? "\u{1F947}"
                              : index === 1
                                ? "\u{1F948}"
                                : "\u{1F949}"}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-[11px] font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                                {route.route_label}
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{
                                  width: `${route.win_rate}%`,
                                  backgroundColor: getWinRateColor(
                                    route.win_rate,
                                  ),
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-0.5">
                            <span
                              className="text-[15px] font-bold"
                              style={{
                                color: getWinRateColor(route.win_rate),
                              }}
                            >
                              {route.win_rate}%
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {route.wins}
                              {"승"}
                            </span>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* 인사이트 */}
            {stats.insight &&
              stats.insight !== "아직 충분한 데이터가 없습니다." && (
                <div className="bg-white rounded-xl p-4 mb-4 border-l-4 border-[#4CAF50] shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-[22px]">
                      {"\u{1F4A1}"}
                    </span>
                    <p className="text-[13px] text-gray-700 leading-relaxed font-['Noto_Sans_KR',sans-serif]">
                      {stats.insight}
                    </p>
                  </div>
                </div>
              )}

            {/* CTA 버튼 */}
            <button
              onClick={handleNavigateToRoute}
              className="w-full py-4 bg-gradient-to-r from-[#81C784] to-[#4CAF50] rounded-xl text-white font-bold text-[15px] shadow-lg font-['Noto_Sans_KR',sans-serif] active:scale-[0.98] transition-transform"
            >
              경로 검색하기
            </button>
          </>
        )}
      </div>
    </div>
  );
}
