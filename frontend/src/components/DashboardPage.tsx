import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  // Mock data for charts
  const weeklyData = [
    { day: "월", wins: 3, losses: 2 },
    { day: "화", wins: 4, losses: 1 },
    { day: "수", wins: 2, losses: 3 },
    { day: "목", wins: 5, losses: 0 },
    { day: "금", wins: 3, losses: 2 },
    { day: "토", wins: 4, losses: 1 },
    { day: "일", wins: 6, losses: 0 },
  ];

  const timeData = [
    { time: "오전", avg: 12 },
    { time: "오후", avg: 15 },
    { time: "저녁", avg: 18 },
    { time: "밤", avg: 14 },
  ];

  const routeData = [
    { name: "경로 A", value: 45 },
    { name: "경로 B", value: 30 },
    { name: "경로 C", value: 25 },
  ];

  const COLORS = ["#48d448", "#ff9a6c", "#6b9080"];

  const totalGames = 27;
  const totalWins = 27;
  const totalLosses = 9;
  const winRate = Math.round((totalWins / totalGames) * 100);

  return (
    <div className="relative size-full bg-transparent overflow-y-auto scrollbar-hide pointer-events-auto" style={{ pointerEvents: 'auto' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-[#c5e7f5] to-[#b3ddf0] border-b-[3px] border-black px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="w-10" />
          <h1 className="font-['Press_Start_2P'] text-base text-[#2d5f3f]">HAD BETTER</h1>
          <button 
            onClick={() => onNavigate('full-map')}
            className="w-10 h-10 rounded-xl bg-white border-[2.72px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] flex items-center justify-center active:translate-y-1 active:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.3)] transition-all"
          >
            <span className="font-['Press_Start_2P'] text-[16px] text-[#2d5f3f]">×</span>
          </button>
        </div>
      </div> 

      <div className="px-4 py-6 space-y-6 pb-20">
        {/* User Profile Card */}
        <div className="bg-white p-6 rounded-2xl border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#48d448] to-[#3db83d] flex items-center justify-center text-4xl border-[3px] border-black">
              👤
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#2d5f3f] mb-1">H</h2>
              <p className="text-sm text-[#6b9080]">Lv. 15</p>
              <div className="mt-2 h-2 bg-[#e5e7eb] rounded-full overflow-hidden border-2 border-black">
                <div className="h-full bg-[#48d448]" style={{ width: "75%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-xl border-[3px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] text-center">
            <div className="text-2xl mb-1">🎮</div>
            <p className="text-2xl font-bold text-[#2d5f3f]">{totalGames}</p>
            <p className="text-xs text-[#6b9080] mt-1">총 게임</p>
          </div>
          <div className="bg-white p-4 rounded-xl border-[3px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] text-center">
            <div className="text-2xl mb-1">🏆</div>
            <p className="text-2xl font-bold text-[#48d448]">{totalWins}</p>
            <p className="text-xs text-[#6b9080] mt-1">승리</p>
          </div>
          <div className="bg-white p-4 rounded-xl border-[3px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] text-center">
            <div className="text-2xl mb-1">📊</div>
            <p className="text-2xl font-bold text-[#ff9a6c]">{winRate}%</p>
            <p className="text-xs text-[#6b9080] mt-1">승률</p>
          </div>
        </div>

        {/* Weekly Performance Chart */}
        <div className="bg-white p-6 rounded-2xl border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)]">
          <h3 className="font-['Press_Start_2P'] text-sm text-[#2d5f3f] mb-4">주간 승패 기록</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="wins" fill="#48d448" />
              <Bar dataKey="losses" fill="#ff9a6c" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#48d448] rounded" />
              <span className="text-xs text-[#6b9080]">승리</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#ff9a6c] rounded" />
              <span className="text-xs text-[#6b9080]">패배</span>
            </div>
          </div>
        </div>

        {/* Average Time Chart */}
        <div className="bg-white p-6 rounded-2xl border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)]">
          <h3 className="font-['Press_Start_2P'] text-sm text-[#2d5f3f] mb-4">시간대별 평균 시간</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="avg" stroke="#48d448" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Route Distribution */}
        <div className="bg-white p-6 rounded-2xl border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)]">
          <h3 className="font-['Press_Start_2P'] text-sm text-[#2d5f3f] mb-4">선호 경로 분포</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={routeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {routeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Games */}
        <div className="bg-white p-6 rounded-2xl border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)]">
          <h3 className="font-['Press_Start_2P'] text-sm text-[#2d5f3f] mb-4">최근 게임</h3>
          <div className="space-y-3">
            {[
              { result: "win", time: "15분 23초", route: "경로 A", points: "+100" },
              { result: "win", time: "12분 45초", route: "경로 B", points: "+100" },
              { result: "loss", time: "18분 12초", route: "경로 A", points: "+50" },
              { result: "win", time: "14분 56초", route: "경로 C", points: "+100" },
            ].map((game, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-[#f9fafb] rounded-xl border-2 border-[#e5e7eb]"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {game.result === "win" ? "🏆" : "😅"}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#2d5f3f]">{game.route}</p>
                    <p className="text-xs text-[#6b9080]">{game.time}</p>
                  </div>
                </div>
                <div className={`text-sm font-bold ${game.result === "win" ? "text-[#48d448]" : "text-[#ff9a6c]"}`}>
                  {game.points}P
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white p-6 rounded-2xl border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)]">
          <h3 className="font-['Press_Start_2P'] text-sm text-[#2d5f3f] mb-4">업적</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-[#ffd700]/20 to-[#ffed4e]/20 rounded-xl border-2 border-[#ffd700]">
              <div className="text-3xl mb-1">🎯</div>
              <p className="text-xs text-[#6b9080]">첫 승리</p>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-[#48d448]/20 to-[#3db83d]/20 rounded-xl border-2 border-[#48d448]">
              <div className="text-3xl mb-1">⚡</div>
              <p className="text-xs text-[#6b9080]">연승</p>
            </div>
            <div className="text-center p-3 bg-[#f9fafb] rounded-xl border-2 border-[#e5e7eb] opacity-50">
              <div className="text-3xl mb-1">🔒</div>
              <p className="text-xs text-[#6b9080]">???</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      {/* <div className="fixed bottom-0 left-0 right-0 bg-[#bfe4f4] border-t-[3px] border-black">
        <div className="flex">
          <button 
            onClick={() => onNavigate("full-map")}
            className="flex-1 py-3 text-xs text-[#4a5565]"
          >
            지도
          </button>
          <button
            onClick={() => onNavigate("map")}
            className="flex-1 py-3 text-xs text-[#4a5565]"
          >
            검색
          </button>
          <button className="flex-1 py-3 text-xs text-[#4a5565]">버스</button>
          <button className="flex-1 py-3 text-xs text-[#4a5565]">지하철</button>
          <button className="flex-1 py-3 text-xs text-[#2d5f3f] font-bold">MY</button>
        </div>
      </div>*/}

      {/* CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}