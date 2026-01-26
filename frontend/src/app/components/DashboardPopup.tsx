import characterGreenFront from "@/assets/character-green-front.png";
import routeService from "@/services/routeService";
import userService, { type UserStats } from "@/services/userService";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";

type PageType = "map" | "search" | "favorites" | "subway" | "route" | "routeDetail";

interface DashboardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  onNavigate?: (page: PageType) => void;
}

export function DashboardPopup({ isOpen, onClose, onLogout, onNavigate }: DashboardPopupProps) {
  const user = useAuthStore((state) => state.user);
  const [stats, setStats] = useState<UserStats>({
    total_games: 0,
    wins: 0,
    win_rate: 0,
    recent_games: [],
  });
  const [allRoutes, setAllRoutes] = useState<any[]>([]);
  const currentDate = new Date();

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [statsData, routesData] = await Promise.all([
            userService.getStats(),
            routeService.getUserRoutes("FINISHED"),
          ]);
          setStats(statsData);
          setAllRoutes(routesData);
        } catch (error) {
          console.error("[Dashboard] 데이터 로드 실패:", error);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 달력 관련 로직
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfMonth = getFirstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ day: null, month: "prev" });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, month: "current" });
  }

  const winDates = new Set(
    allRoutes
      .filter((r) => r.is_win)
      .map((r) => {
        const date = new Date(r.start_time);
        return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      })
  );

  const isToday = (d: number) => {
    const today = new Date();
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === d;
  };

  const isWinDay = (d: number) => {
    return winDates.has(`${year}-${month}-${d}`);
  };

  // 최근 6개월 월별 통계 계산
  const getMonthlyStats = () => {
    interface MonthlyStat {
      year: number;
      month: number;
      label: string;
      wins: number;
    }
    const last6Months: MonthlyStat[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: `${d.getMonth() + 1}월`,
        wins: 0
      });
    }

    allRoutes.forEach(route => {
      if (!route.is_win) return;
      const d = new Date(route.start_time);
      const mIdx = last6Months.findIndex(m => m.year === d.getFullYear() && m.month === d.getMonth());
      if (mIdx !== -1) {
        last6Months[mIdx].wins++;
      }
    });

    const maxWins = Math.max(...last6Months.map(m => m.wins), 1);
    return { last6Months, maxWins };
  };

  const { last6Months, maxWins } = getMonthlyStats();

  // 레벨 및 칭호 계산 로직
  const getLevelInfo = (totalGames: number) => {
    if (totalGames <= 5) return { lv: 1, title: "초보 모험가", color: "#4ade80", icon: "🌱" };
    if (totalGames <= 15) return { lv: 2, title: "프로 환승러", color: "#3498db", icon: "🏃" };
    if (totalGames <= 30) return { lv: 3, title: "대중교통 마스터", color: "#9b59b6", icon: "🚌" };
    return { lv: 4, title: "하드베터의 전설", color: "#f1c40f", icon: "👑" };
  };

  const levelInfo = getLevelInfo(stats.total_games);

  return (
    <>
      <style>
        {`
          @font-face {
            font-family: 'DNFBitBitv2';
            src: url('/fonts/DNFBitBitv2.otf') format('opentype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }

          .hb-dashboard-glass {
            background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.2) 100%);
            border: 1px solid rgba(255,255,255,0.5);
            backdrop-filter: blur(20px) saturate(160%);
            -webkit-backdrop-filter: blur(20px) saturate(160%);
            box-shadow: 0 12px 40px rgba(0,0,0,0.08);
          }

          .hb-pixel-font {
            font-family: 'DNFBitBitv2', sans-serif;
          }

          /* 애니메이션 */
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes characterBounce {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-4px) scale(1.05); }
          }

          .animate-fade-up {
            animation: fadeInUp 0.5s ease-out forwards;
          }

          .animate-character {
            animation: characterBounce 2s ease-in-out infinite;
          }

          /* 스크롤바 숨기기 */
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
      
      {/* 백드롭 */}
      <div className="fixed inset-0 bg-black/30 z-[60] backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* 팝업 */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="pointer-events-auto w-full max-w-[420px] h-[85vh] max-h-[800px] rounded-[32px] hb-dashboard-glass overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-300 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="sticky top-0 z-10 px-6 py-4 flex justify-between items-center backdrop-blur-md bg-white/10">
            <h1 className="hb-pixel-font text-xl text-[#1a1a2e]">DASHBOARD</h1>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              ✕
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* 1. 프로필 섹션 */}
            <div className="hb-dashboard-glass rounded-[24px] p-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden bg-white/40"
                  style={{ border: `2px solid ${levelInfo.color}` }}
                >
                  <img
                    src={characterGreenFront}
                    alt="Character"
                    className="w-[120%] h-[120%] object-contain animate-character"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
            <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white hb-pixel-font"
                      style={{ backgroundColor: levelInfo.color }}
                    >
                      Lv.{levelInfo.lv}
                    </span>
                    <span className="text-xs font-bold text-[#6b9080]">{levelInfo.title}</span>
                  </div>
                  <h2 className="hb-pixel-font text-xl text-[#1a1a2e]">{user?.nickname || "Guest"}</h2>
                  <p className="text-[11px] text-[#6b9080] opacity-80">{user?.email || "로그인이 필요합니다"}</p>
                </div>
              </div>

              {/* 레벨 게이지 (다음 레벨까지) */}
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-[9px] font-bold text-[#6b9080]">
                  <span>NEXT LEVEL</span>
                  <span>{stats.total_games} / {levelInfo.lv === 1 ? 6 : levelInfo.lv === 2 ? 16 : levelInfo.lv === 3 ? 31 : stats.total_games}</span>
                </div>
                <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${Math.min(100, (stats.total_games / (levelInfo.lv === 1 ? 6 : levelInfo.lv === 2 ? 16 : levelInfo.lv === 3 ? 31 : stats.total_games)) * 100)}%`,
                      backgroundColor: levelInfo.color
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 2. 통계 섹션 */}
            <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              {[
                { label: "총 게임", value: stats.total_games, icon: "🎮" },
                { label: "승리", value: stats.wins, icon: "🏆" },
                { label: "승률", value: `${stats.win_rate}%`, icon: "📈" },
              ].map((item, idx) => (
                <div key={idx} className="hb-dashboard-glass rounded-[20px] p-3 flex flex-col items-center justify-center text-center">
                  <span className="text-xl mb-1">{item.icon}</span>
                  <span className="text-[10px] text-[#6b9080] mb-1">{item.label}</span>
                  <span className="hb-pixel-font text-base text-[#1a1a2e]">{item.value}</span>
                </div>
              ))}
            </div>

            {/* 3. 최근 게임 섹션 */}
            <div className="space-y-3 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="hb-pixel-font text-[#1a1a2e] flex items-center gap-2">
                <span>📜</span> 최근 모험
              </h3>
              {stats.recent_games.length > 0 ? (
                stats.recent_games.map((game, idx) => (
                  <div key={idx} className="hb-dashboard-glass rounded-[18px] p-4 flex justify-between items-center group cursor-pointer hover:bg-white/30 transition-all">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#1a1a2e]">{game.route_name}</span>
                      <span className="text-[11px] text-[#6b9080]">{game.duration}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`hb-pixel-font text-sm ${game.rank.includes("1") ? "text-[#f1c40f]" : "text-[#1a1a2e]"}`}>
                        {game.rank}
                      </span>
                      <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-[#6b9080]">상세보기 →</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-[#6b9080] hb-dashboard-glass rounded-[18px]">
                  아직 기록이 없습니다.
                </div>
              )}
            </div>

            {/* 2-1. 월별 추세 그래프 섹션 */}
            <div className="hb-dashboard-glass rounded-[24px] p-5 space-y-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex justify-between items-center">
                <h3 className="hb-pixel-font text-sm text-[#1a1a2e] flex items-center gap-2">
                  <span>📊</span> 승리 추세 (최근 6개월)
                </h3>
              </div>
              <div className="flex items-end justify-between h-24 px-2">
                {last6Months.map((m, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1 group relative">
                    <div className="relative w-full flex justify-center items-end h-16">
                      {/* 툴팁 */}
                      <span className="absolute -top-6 text-[10px] font-bold text-[#2ecc71] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {m.wins}승
                      </span>
                      {/* 막대 그래프 */}
                      <div
                        className={`w-3 rounded-t-full transition-all duration-1000 ease-out
                          ${m.wins === maxWins && m.wins > 0 ? "bg-gradient-to-t from-[#2ecc71] to-[#4ade80] shadow-[0_0_10px_rgba(46,204,113,0.4)]" : "bg-[#6b9080]/20"}
                        `}
                        style={{ height: `${m.wins > 0 ? Math.max((m.wins / maxWins) * 100, 10) : 5}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-bold text-[#6b9080] opacity-80">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. 승리 달력 섹션 */}
            <div className="hb-dashboard-glass rounded-[24px] p-5 space-y-4 animate-fade-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex justify-between items-center">
                <h3 className="hb-pixel-font text-[#1a1a2e] flex items-center gap-2">
                  <span>🏆</span> 승리의 기록
                </h3>
                <span className="text-xs font-bold text-[#6b9080]">{year}.{String(month + 1).padStart(2, '0')}</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold text-[#6b9080] opacity-60">{d}</div>
                ))}
                {days.map((d, i) => (
                  <div
                    key={i}
                    className={`aspect-square flex items-center justify-center text-[11px] rounded-lg transition-all relative
                      ${d.month !== "current" ? "opacity-20" : "bg-white/20"}
                      ${d.day && isWinDay(d.day) ? "bg-gradient-to-br from-[#48d448] to-[#2ecc71] text-white shadow-md font-bold" : ""}
                      ${d.day && isToday(d.day) ? "border border-[#6b9080]" : ""}
                    `}
                  >
                    {d.day}
                    {d.day && isWinDay(d.day) && <span className="absolute -top-1 -right-1 text-[8px]">👑</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* 5. 로그아웃 버튼 */}
            <button
              onClick={onLogout}
              className="w-full bg-[#e74c3c]/10 border border-[#e74c3c]/20 text-[#e74c3c] py-4 rounded-[20px] hb-pixel-font hover:bg-[#e74c3c] hover:text-white transition-all shadow-sm hover:shadow-lg animate-fade-up"
              style={{ animationDelay: '0.6s', marginBottom: '40px' }}
            >
              LOG OUT
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
