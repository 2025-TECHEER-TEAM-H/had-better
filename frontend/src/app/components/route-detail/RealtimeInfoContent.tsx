import { CharacterColor } from "@/components/MovingCharacter";
import { Player } from "@/stores/routeStore";
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface RankingInfo {
  player: Player;
  progress: number;
  rank: number;
  name: string;
  totalTimeMinutes?: number;
  timeDifference?: number | null;
  timeDifferenceText?: string | null;
  remainingMinutes?: number;
}

interface RealtimeInfoContentProps {
  rankings: RankingInfo[];
  playerColors: Record<Player, CharacterColor>;
  simulationStartTime?: number | null;
  distanceToDestination?: number | null;
  isOffRoute?: boolean;
  distanceFromRoute?: number | null;
  isGpsTracking?: boolean;
  isGpsTestMode?: boolean;
  botPositions?: Map<number, any>;
  departureName?: string;
  arrivalName?: string;
  createRouteResponse?: any;
  userProgress?: number;
  userTotalTime?: number;
  chartData?: Array<{
    time: number;
    timestamp: number;
    [key: string]: number | string;
  }>;
}

export function RealtimeInfoContent({
  rankings,
  playerColors,
  distanceToDestination,
  userProgress = 0,
  userTotalTime = 0,
  simulationStartTime,
  chartData = [],
}: RealtimeInfoContentProps) {
  // 사용자 통계 계산
  const progressPercent = Math.round(userProgress * 100);
  const remainingTimeSeconds = Math.max(0, userTotalTime * (1 - userProgress));
  const remainingMinutes = Math.floor(remainingTimeSeconds / 60);
  const remainingDistance = distanceToDestination !== null && distanceToDestination !== undefined
    ? distanceToDestination >= 1000
      ? `${(distanceToDestination / 1000).toFixed(1)}km`
      : `${distanceToDestination}m`
    : '0m';

  // 사용자 순위 정보
  const userRanking = rankings.find(r => r.player === 'user');
  const userRank = userRanking?.rank || 0;
  const userTimeDifference = userRanking?.timeDifference;
  const userTimeDifferenceText = userRanking?.timeDifferenceText;

  // 카드 뒤집기 상태 관리
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const toggleCard = (cardId: string) => {
    setFlippedCards((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-3 pt-2">
      {/* 타이틀 섹션 */}
      <div className="text-center py-2">
        <h2 className="font-['Wittgenstein',sans-serif] text-[16px] font-bold text-gray-900 mb-1">
          정말 내가 선택한 길이 빠를까?
        </h2>
        <p className="font-['Wittgenstein',sans-serif] text-[11px] text-gray-600 leading-tight">
          실시간 경로 성능 비교
        </p>
      </div>
      {/* 경주 통계 카드 */}
      <div className="bg-white/20 backdrop-blur-xl rounded-[16px] p-3 border-2 border-gray-300/50 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px]">📊</span>
            <h3 className="font-['Wittgenstein',sans-serif] text-[13px] font-bold text-gray-800">경주 통계</h3>
          </div>
          <button
            onClick={() => toggleCard('stats')}
            className="flex items-center gap-1 px-2 py-1 bg-white/20 active:bg-white/30 rounded-lg transition-colors text-[10px] font-medium text-gray-700 touch-manipulation"
          >
            <span>{flippedCards.has('stats') ? '📖 숨기기' : '📖 가이드'}</span>
          </button>
        </div>

        {/* 4개 주요 지표 */}
        <div className="flex flex-row gap-2 mb-3">
          {/* 현재 순위 */}
          <div className="flex-1 flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-[10px] p-2 border border-white/20">
            <span className="font-['Wittgenstein',sans-serif] text-[9px] text-gray-600 font-medium mb-0.5">순위</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-[24px] font-black text-gray-900">{userRank}</span>
              <span className="text-[11px] font-bold text-gray-600">위</span>
            </div>
            {userTimeDifferenceText && userRank > 1 && (
              <div className="mt-0.5">
                {userTimeDifference && userTimeDifference > 0 ? (
                  <span className="font-['Wittgenstein',sans-serif] text-[8px] text-red-500 font-semibold">+{userTimeDifferenceText}</span>
                ) : userTimeDifference && userTimeDifference < 0 ? (
                  <span className="font-['Wittgenstein',sans-serif] text-[8px] text-green-500 font-semibold">{userTimeDifferenceText}</span>
                ) : null}
              </div>
            )}
          </div>

          {/* 진행률 */}
          <div className="flex-1 flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-[10px] p-2 border border-white/20">
            <span className="font-['Wittgenstein',sans-serif] text-[9px] text-gray-600 font-medium mb-0.5">진행률</span>
            <div className="relative w-[50px] h-[50px]">
              <svg className="transform -rotate-90 w-full h-full">
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="4"
                  fill="none"
                />
                <circle
                  cx="25"
                  cy="25"
                  r="20"
                  stroke="#7ED321"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 20}
                  strokeDashoffset={2 * Math.PI * 20 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-['Wittgenstein',sans-serif] text-[12px] font-black text-gray-800">
                  {progressPercent}%
                </span>
              </div>
            </div>
          </div>

          {/* 남은 거리 */}
          <div className="flex-1 flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-[10px] p-2 border border-white/20">
            <span className="font-['Wittgenstein',sans-serif] text-[9px] text-gray-600 font-medium mb-0.5">남은 거리</span>
            <div className="text-[18px] font-black text-gray-900">
              {remainingDistance}
            </div>
          </div>

          {/* 예상 시간 */}
          <div className="flex-1 flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-[10px] p-2 border border-white/20">
            <span className="font-['Wittgenstein',sans-serif] text-[9px] text-gray-600 font-medium mb-0.5">예상 시간</span>
            <div className="text-[18px] font-black text-gray-900">
              {remainingMinutes}
            </div>
            <span className="font-['Wittgenstein',sans-serif] text-[8px] text-gray-500">분</span>
          </div>
        </div>

        {/* 미니 차트 영역 */}
        <div className="bg-white/10 backdrop-blur-sm rounded-[10px] p-2 border border-white/20">
          <div className="flex items-center justify-between mb-1">
            <span className="font-['Wittgenstein',sans-serif] text-[9px] text-gray-600 font-medium">시간별 진행률</span>
            <span className="font-['Wittgenstein',sans-serif] text-[8px] text-gray-500">
              {simulationStartTime
                ? `${Math.floor((Date.now() - simulationStartTime) / 1000 / 60)}분`
                : '시작 전'}
            </span>
          </div>
          <div className="relative h-[28px] bg-white/10 rounded-[6px] overflow-hidden border border-white/10">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#7ED321]/40 to-[#7ED321]/60 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-['Wittgenstein',sans-serif] text-[10px] font-bold text-gray-800 drop-shadow-sm">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* 사용 가이드 - 슬라이드 다운 */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            flippedCards.has('stats')
              ? 'max-h-[400px] opacity-100 mt-2'
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-2 border-t border-white/20">
            <div className="space-y-2 text-[10px] text-gray-600">
              <div>
                <p className="font-semibold text-gray-800 mb-0.5">📊 순위</p>
                <p>3명 중 현재 순위. 1위일수록 빠른 경로.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-0.5">📈 진행률</p>
                <p>전체 경로 진행 정도. 100%에 가까울수록 곧 도착.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-0.5">📍 남은 거리</p>
                <p>목적지까지 남은 거리 (km/m 자동 변환).</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-0.5">⏰ 예상 시간</p>
                <p>현재 속도 기준 예상 도착 시간(분).</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 진행률 비교 그래프 */}
      <div className="bg-white/20 backdrop-blur-xl rounded-[16px] p-3 border-2 border-gray-300/50 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px]">📊</span>
            <h3 className="font-['Wittgenstein',sans-serif] text-[13px] font-bold text-gray-800">진행률 비교</h3>
          </div>
          <button
            onClick={() => toggleCard('progress')}
            className="flex items-center gap-1 px-2 py-1 bg-white/20 active:bg-white/30 rounded-lg transition-colors text-[10px] font-medium text-gray-700 touch-manipulation"
          >
            <span>{flippedCards.has('progress') ? '📖 숨기기' : '📖 가이드'}</span>
          </button>
        </div>
        <div className="h-[160px] w-full">
          {chartData.length > 0 ? (() => {
            // Y축 범위를 동적으로 계산 (현재 데이터의 최소값~최대값 기준)
            const allProgressValues = chartData.flatMap(d =>
              rankings.map(r => d[`progress_${r.player}`] as number).filter(v => v !== undefined)
            );
            const minProgress = Math.max(0, Math.min(...allProgressValues) - 5); // 최소값에서 5% 여유
            const maxProgress = Math.min(100, Math.max(...allProgressValues) + 5); // 최대값에서 5% 여유
            const yAxisDomain = [minProgress, maxProgress];

            return (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <defs>
                    {rankings.map((r) => {
                      const color = playerColors[r.player];
                      const lineColor = color === 'green' ? '#7ED321' :
                                       color === 'purple' ? '#A78BFA' :
                                       color === 'yellow' ? '#FFD93D' :
                                       '#FF6B9D';
                      const gradientId = `gradient-${r.player}`;
                      return (
                        <linearGradient key={gradientId} id={gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={lineColor} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={lineColor} stopOpacity={0.05} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: '#666', fontSize: 9 }}
                    label={{ value: '시간(초)', position: 'insideBottom', offset: -3, fill: '#666', fontSize: 9 }}
                  />
                  <YAxis
                    domain={yAxisDomain}
                    tick={{ fill: '#666', fontSize: 9 }}
                    label={{ value: '진행률(%)', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 9 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      fontSize: '10px'
                    }}
                    formatter={(value: number) => `${value}%`}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '9px', paddingTop: '5px' }}
                    iconType="line"
                  />
                  {rankings.map((r) => {
                    const color = playerColors[r.player];
                    const lineColor = color === 'green' ? '#7ED321' :
                                     color === 'purple' ? '#A78BFA' :
                                     color === 'yellow' ? '#FFD93D' :
                                     '#FF6B9D';
                    const gradientId = `gradient-${r.player}`;
                    return (
                      <Area
                        key={`progress_${r.player}`}
                        type="monotone"
                        dataKey={`progress_${r.player}`}
                        name={r.name}
                        stroke={lineColor}
                        strokeWidth={2.5}
                        fill={`url(#${gradientId})`}
                        dot={{ r: 2 }}
                        activeDot={{ r: 4 }}
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            );
          })() : (
            <div className="h-full flex flex-col items-center justify-center bg-white/5 rounded-[10px] border border-white/10">
              <div className="text-2xl mb-2 opacity-50">📊</div>
              <p className="font-['Wittgenstein',sans-serif] text-[10px] text-gray-500 font-medium">
                데이터 수집 중...
              </p>
            </div>
          )}
              </div>

        {/* 사용 가이드 - 슬라이드 다운 */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            flippedCards.has('progress')
              ? 'max-h-[300px] opacity-100 mt-2'
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-2 border-t border-white/20">
            <div className="space-y-2 text-[10px] text-gray-600">
              <div>
                <p className="font-semibold text-gray-800 mb-0.5">📈 읽는 방법</p>
                <p>가로: 경과 시간(초) / 세로: 진행률 (0~100%)</p>
                </div>
              <div>
                <p className="font-semibold text-gray-800 mb-0.5">⚡ 속도 비교</p>
                <p>선이 가파르게 올라가면 빠르게 진행 중. 100%에 먼저 도달하는 플레이어가 승리.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 예상 도착 시간 비교 그래프 */}
      <div className="bg-white/20 backdrop-blur-xl rounded-[16px] p-3 border-2 border-gray-300/50 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px]">⏰</span>
            <h3 className="font-['Wittgenstein',sans-serif] text-[13px] font-bold text-gray-800">예상 도착 시간</h3>
          </div>
          <button
            onClick={() => toggleCard('remaining')}
            className="flex items-center gap-1 px-2 py-1 bg-white/20 active:bg-white/30 rounded-lg transition-colors text-[10px] font-medium text-gray-700 touch-manipulation"
          >
            <span>{flippedCards.has('remaining') ? '📖 숨기기' : '📖 가이드'}</span>
          </button>
        </div>
        <div className="h-[160px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="time"
                  tick={{ fill: '#666', fontSize: 9 }}
                  label={{ value: '시간(초)', position: 'insideBottom', offset: -3, fill: '#666', fontSize: 9 }}
                />
                <YAxis
                  tick={{ fill: '#666', fontSize: 9 }}
                  label={{ value: '남은 시간(분)', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 9 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '10px'
                  }}
                  formatter={(value: number) => `${value}분`}
                />
                <Legend
                  wrapperStyle={{ fontSize: '9px', paddingTop: '5px' }}
                  iconType="line"
                />
                {rankings.map((r) => {
                  const color = playerColors[r.player];
                  const lineColor = color === 'green' ? '#7ED321' :
                                   color === 'purple' ? '#A78BFA' :
                                   color === 'yellow' ? '#FFD93D' :
                                   '#FF6B9D';
                  return (
                    <Line
                      key={`remaining_${r.player}`}
                      type="monotone"
                      dataKey={`remaining_${r.player}`}
                      name={r.name}
                      stroke={lineColor}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
        );
      })}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white/5 rounded-[10px] border border-white/10">
              <div className="text-2xl mb-2 opacity-50">⏰</div>
              <p className="font-['Wittgenstein',sans-serif] text-[10px] text-gray-500 font-medium">
                데이터 수집 중...
              </p>
            </div>
          )}
        </div>

        {/* 사용 가이드 - 슬라이드 다운 */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            flippedCards.has('remaining')
              ? 'max-h-[300px] opacity-100 mt-2'
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="pt-2 border-t border-white/20">
            <div className="space-y-2 text-[10px] text-gray-600">
              <div>
                <p className="font-semibold text-gray-800 mb-0.5">⏰ 도착 시간 예측</p>
                <p>"정말 빠를까?"에 직접 답. 선이 아래에 있을수록(남은 시간 적을수록) 더 빠르게 도착.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800 mb-0.5">📊 추세</p>
                <p>선이 빠르게 내려가면 빠르게 진행 중. 0분에 먼저 도달하는 플레이어가 승리.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
