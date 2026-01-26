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
          .hb-dashboard-shell {
            position: relative;
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 600;
          }

          .hb-dashboard-glass {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.28) 100%);
            border: 1px solid rgba(255,255,255,0.68);
            box-shadow: 0 16px 32px rgba(90,120,130,0.16), inset 0 1px 0 rgba(255,255,255,0.5);
            backdrop-filter: blur(18px) saturate(160%);
            -webkit-backdrop-filter: blur(18px) saturate(160%);
          }

          .hb-dashboard-shell.hb-dashboard-glass {
            background: #d4ebf7;
          }

          .hb-dashboard-glass-fun::before {
            content: "";
            position: absolute;
            inset: -30% -40%;
            pointer-events: none;
            background: linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0) 60%);
            opacity: 0;
            animation: hb-dashboard-sheen 12.5s ease-in-out infinite;
          }

          @keyframes hb-dashboard-sheen {
            0% { transform: translateX(-40%) translateY(-10%) rotate(12deg); opacity: 0; }
            12% { opacity: 0.55; }
            50% { opacity: 0.35; }
            100% { transform: translateX(140%) translateY(10%) rotate(12deg); opacity: 0; }
          }

          .hb-dashboard-chip {
            background: linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.42) 100%);
            border: 1px solid rgba(255,255,255,0.72);
            box-shadow: 0 10px 20px rgba(90,120,130,0.12), inset 0 1px 0 rgba(255,255,255,0.5);
            backdrop-filter: blur(16px) saturate(155%);
            -webkit-backdrop-filter: blur(16px) saturate(155%);
          }

          .hb-dashboard-card {
            background: linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.4) 100%);
            border: 1px solid rgba(255,255,255,0.7);
            box-shadow: 0 14px 28px rgba(90,120,130,0.16), inset 0 1px 0 rgba(255,255,255,0.46);
            backdrop-filter: blur(18px) saturate(160%);
            -webkit-backdrop-filter: blur(18px) saturate(160%);
          }

          .hb-dashboard-pressable {
            transition: transform 140ms ease-out, filter 140ms ease-out;
            will-change: transform, filter;
          }

          .hb-dashboard-pressable:active {
            transform: translateY(1px) scale(0.985);
            filter: brightness(1.04);
          }

          .hb-pixel-font {
            font-family: 'DNFBitBitv2', sans-serif;
          }

          .hb-dashboard-title {
            font-family: 'DNFBitBitv2', 'Press Start 2P', sans-serif;
            letter-spacing: 0.6px;
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

          /* 스크롤바 */
          .hb-dashboard-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .hb-dashboard-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .hb-dashboard-scroll::-webkit-scrollbar-thumb {
            background: rgba(107, 144, 128, 0.28);
            border-radius: 12px;
          }

          @media (prefers-reduced-motion: reduce) {
            .hb-dashboard-glass-fun::before {
              animation: none !important;
            }
            .hb-dashboard-pressable {
              transition: none !important;
            }
            .hb-dashboard-pressable:active {
              transform: none !important;
              filter: none !important;
            }
          }
        `}
      </style>
      
      {/* 백드롭 */}
      <div className="fixed inset-0 bg-black/35 z-[60] backdrop-blur-sm transition-opacity" onClick={onClose} />

      {/* 팝업 */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="hb-dashboard-shell pointer-events-auto w-full max-w-[400px] h-[90vh] max-h-[840px] rounded-[22px] hb-dashboard-glass hb-dashboard-glass-fun overflow-hidden relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="relative px-6 pt-5 pb-4">
            {/* 타이틀 */}
            <div className="hb-dashboard-glass rounded-[16px] h-[44px] flex items-center justify-center mb-4">
              <p className="hb-dashboard-title text-[16px] text-black">
                DASHBOARD
              </p>
            </div>

            {/* 닫기 버튼 - 타이틀과 같은 높이에 위치 */}
            <button
              onClick={onClose}
              className="absolute top-5 right-6 hb-dashboard-chip hb-dashboard-pressable rounded-[14px] size-[44px] flex items-center justify-center text-black"
            >
              <span className="font-['Press_Start_2P:Regular',sans-serif] text-[14px]">✕</span>
            </button>
          </div>

          {/* 컨텐츠 영역 */}
          <div className="hb-dashboard-scroll px-5 pb-6 overflow-y-auto h-[calc(100%-92px)] space-y-6">
            {/* 1. 프로필 섹션 */}
            <div className="hb-dashboard-card rounded-[24px] p-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
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
                <div key={idx} className="hb-dashboard-card rounded-[20px] p-3 flex flex-col items-center justify-center text-center">
                  <span className="text-xl mb-1">{item.icon}</span>
                  <span className="text-[10px] text-[#6b9080] mb-1">{item.label}</span>
                  <span className="hb-pixel-font text-base text-[#1a1a2e]">{item.value}</span>
                </div>
              ))}
            </div>

            {/* 3. 최근 게임 섹션 */}
            <div className="space-y-3 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              <h3 className="hb-pixel-font text-[#1a1a2e]">
                최근 모험
              </h3>
              {stats.recent_games.length > 0 ? (
                stats.recent_games.map((game, idx) => (
                  <div key={idx} className="hb-dashboard-card hb-dashboard-pressable rounded-[18px] p-4 flex justify-between items-center group cursor-pointer hover:bg-white/30 transition-all">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#1a1a2e]">{game.route_name}</span>
                      <span className="text-[11px] text-[#6b9080]">{game.duration}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`hb-pixel-font text-xs ${game.rank.includes("1") ? "text-[#f1c40f]" : "text-[#1a1a2e]"}`}>
                        {game.rank}
                      </span>
                      <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-[#6b9080]">상세보기 →</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-[#6b9080] hb-dashboard-card rounded-[18px]">
                  아직 기록이 없습니다.
                </div>
              )}
            </div>

            {/* 2-1. 월별 추세 그래프 섹션 */}
            <div className="hb-dashboard-card rounded-[24px] p-5 space-y-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex justify-between items-center">
                <h3 className="hb-pixel-font text-sm text-[#1a1a2e]">
                  승리 추세 (최근 6개월)
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
            <div className="hb-dashboard-card rounded-[24px] p-5 space-y-4 animate-fade-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex justify-between items-center">
                <h3 className="hb-pixel-font text-[#1a1a2e]">
                  승리의 기록
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
                  </div>
                ))}
              </div>
            </div>

            {/* 5. 로그아웃 버튼 */}
            <button
              onClick={onLogout}
              className="w-full hb-dashboard-pressable bg-[#e74c3c]/10 border border-[#e74c3c]/20 text-[#e74c3c] py-4 rounded-[20px] hb-pixel-font hover:bg-[#e74c3c] hover:text-white transition-all shadow-sm hover:shadow-lg animate-fade-up"
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
