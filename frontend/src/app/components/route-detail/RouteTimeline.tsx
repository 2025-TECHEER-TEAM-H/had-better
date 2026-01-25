import { CharacterColor } from "@/components/MovingCharacter";
import { metersToKilometers, PATH_TYPE_NAMES, secondsToMinutes } from "@/types/route";
import { useState } from "react";

interface RouteTimelineProps {
  legs: any[];
  isLoading: boolean;
  playerColor?: CharacterColor;
  totalTime?: number;
  totalDistance?: number;
  totalWalkTime?: number;
  totalWalkDistance?: number;
  transferCount?: number;
  pathType?: number;
}

export function RouteTimeline({
  legs,
  isLoading,
  playerColor = 'green',
  totalTime = 0,
  totalDistance = 0,
  totalWalkTime = 0,
  totalWalkDistance = 0,
  transferCount = 0,
  pathType,
}: RouteTimelineProps) {
  // 각 구간별 정류장 목록 펼침 상태 관리
  const [expandedStops, setExpandedStops] = useState<Set<number>>(new Set());

  const toggleStopList = (legIndex: number) => {
    setExpandedStops(prev => {
      const newSet = new Set(prev);
      if (newSet.has(legIndex)) {
        newSet.delete(legIndex);
      } else {
        newSet.add(legIndex);
      }
      return newSet;
    });
  };

  // 플레이어 색상에 따른 색상 매핑
  const colorMap = {
    green: {
      primary: '#7ed321',
      light: 'rgba(126, 211, 33, 0.3)',
      badge: '#7ed321',
      badgeBg: 'rgba(126, 211, 33, 0.1)',
      badgeBorder: 'rgba(126, 211, 33, 0.2)',
    },
    purple: {
      primary: '#a78bfa',
      light: 'rgba(167, 139, 250, 0.3)',
      badge: '#a78bfa',
      badgeBg: 'rgba(167, 139, 250, 0.1)',
      badgeBorder: 'rgba(167, 139, 250, 0.2)',
    },
    yellow: {
      primary: '#ffd93d',
      light: 'rgba(255, 217, 61, 0.3)',
      badge: '#ffd93d',
      badgeBg: 'rgba(255, 217, 61, 0.1)',
      badgeBorder: 'rgba(255, 217, 61, 0.2)',
    },
    pink: {
      primary: '#ff6b9d',
      light: 'rgba(255, 107, 157, 0.3)',
      badge: '#ff6b9d',
      badgeBg: 'rgba(255, 107, 157, 0.1)',
      badgeBorder: 'rgba(255, 107, 157, 0.2)',
    },
  };

  const colors = colorMap[playerColor] || colorMap.green;

  // 환승 횟수 계산 (BUS/SUBWAY가 연속으로 나오는 경우)
  const calculatedTransferCount = legs.filter((leg, index) => {
    if (index === 0) return false;
    const prevMode = legs[index - 1].mode;
    const currentMode = leg.mode;
    return (prevMode === 'BUS' || prevMode === 'SUBWAY') &&
           (currentMode === 'BUS' || currentMode === 'SUBWAY') &&
           prevMode !== currentMode;
  }).length;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
        <div className={`w-8 h-8 border-4 border-gray-200 rounded-full animate-spin`} style={{ borderTopColor: colors.primary }} />
        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-gray-500">경로 정보를 불러오는 중...</p>
      </div>
    );
  }

  const finalTransferCount = transferCount || calculatedTransferCount;
  const finalTotalWalkTime = totalWalkTime || legs.filter(l => l.mode === 'WALK').reduce((sum, l) => sum + (l.sectionTime || 0), 0);
  const finalTotalWalkDistance = totalWalkDistance || legs.filter(l => l.mode === 'WALK').reduce((sum, l) => sum + (l.distance || 0), 0);

  // 교통수단별 정류장/역 개수 계산
  const subwayStationCount = legs
    .filter(l => l.mode === 'SUBWAY')
    .reduce((sum, l) => sum + (l.passStopList?.stationList?.length || 0), 0);
  const busStopCount = legs
    .filter(l => l.mode === 'BUS')
    .reduce((sum, l) => sum + (l.passStopList?.stationList?.length || 0), 0);

  // 환승 지점 찾기
  const transferPoints: string[] = [];
  for (let i = 1; i < legs.length; i++) {
    const prevLeg = legs[i - 1];
    const currentLeg = legs[i];
    const prevMode = prevLeg.mode;
    const currentMode = currentLeg.mode;

    // 이전 구간과 현재 구간이 모두 대중교통이고, mode가 다른 경우 환승
    if (
      (prevMode === 'BUS' || prevMode === 'SUBWAY') &&
      (currentMode === 'BUS' || currentMode === 'SUBWAY') &&
      prevMode !== currentMode
    ) {
      // 이전 구간의 하차 지점이 환승 지점
      transferPoints.push(prevLeg.end.name);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {/* 경로 요약 정보 */}
      <div className="bg-white/20 backdrop-blur-xl rounded-[16px] p-3 sm:p-4 border border-white/30 shadow-sm">
        {/* 주요 정보 - 그리드 레이아웃 */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
          {pathType && (
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-[11px] sm:text-[10px]">경로 타입</span>
              <span className="font-bold text-gray-900 text-[14px] sm:text-[13px]">{PATH_TYPE_NAMES[pathType] || '대중교통'}</span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 text-[11px] sm:text-[10px]">소요 시간</span>
            <span className="font-bold text-gray-900 text-[14px] sm:text-[13px]">{secondsToMinutes(totalTime)}분</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 text-[11px] sm:text-[10px]">총 거리</span>
            <span className="font-bold text-gray-900 text-[14px] sm:text-[13px]">{metersToKilometers(totalDistance)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-gray-500 text-[11px] sm:text-[10px]">환승</span>
            <span className="font-bold text-gray-900 text-[14px] sm:text-[13px]">{finalTransferCount}회</span>
          </div>
        </div>

        {/* 부가 정보 - 환승 지점 */}
        {transferPoints.length > 0 && (
          <div className="mb-3 pt-3 border-t border-white/20">
            <div className="flex flex-col gap-1.5">
              <span className="text-gray-500 text-[11px] sm:text-[10px]">환승 지점</span>
              <div className="flex flex-wrap gap-2">
                {transferPoints.map((point, index) => (
                  <span
                    key={index}
                    className="bg-white/40 backdrop-blur-sm px-2.5 py-1.5 rounded-[6px] text-[12px] sm:text-[11px] font-medium text-gray-800 border border-white/30"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 부가 정보 - 정류장/역 개수 및 도보 */}
        <div className="pt-3 border-t border-white/20">
          <div className="flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-2 text-[12px] sm:text-[11px]">
            {(subwayStationCount > 0 || busStopCount > 0) && (
              <div className="flex items-center gap-1.5">
                <span className="text-gray-500">정류장:</span>
                <span className="font-semibold text-gray-800">
                  {subwayStationCount > 0 && `🚇 ${subwayStationCount}개역`}
                  {subwayStationCount > 0 && busStopCount > 0 && ' • '}
                  {busStopCount > 0 && `🚌 ${busStopCount}개 정류장`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">도보:</span>
              <span className="font-semibold text-gray-800">
                {secondsToMinutes(finalTotalWalkTime)}분 ({metersToKilometers(finalTotalWalkDistance)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 경로 개요 바 */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {legs.map((leg, index) => {
          const isWalk = leg.mode === 'WALK';
          const isTransport = leg.mode === 'BUS' || leg.mode === 'SUBWAY';
          const timeMinutes = secondsToMinutes(leg.sectionTime || 0);

          return (
            <div key={index} className="flex items-center gap-1 flex-shrink-0">
              {isWalk ? (
                <>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-[10px]">🚶</span>
                    </div>
                    <span className="text-[10px] text-gray-600 font-medium">{timeMinutes}분 ({metersToKilometers(leg.distance || 0)})</span>
                  </div>
                  <div className="w-8 h-1 bg-gray-300 rounded-full" />
                </>
              ) : (
                <>
                  <div className="flex flex-col items-center gap-1">
                    <div className={`px-2 py-1 rounded ${isTransport ? 'bg-blue-500' : 'bg-gray-300'} text-white text-[10px] font-bold`}>
                      {leg.route || leg.mode}
                    </div>
                    <span className="text-[10px] text-gray-600 font-medium">{timeMinutes}분 ({metersToKilometers(leg.distance || 0)})</span>
                  </div>
                  {index < legs.length - 1 && <div className="w-8 h-1 bg-gray-300 rounded-full" />}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* 상세 타임라인 */}
      <div className="flex flex-col gap-0 relative">
        {/* 타임라인 수직 선 - 중앙 정렬 */}
        <div className="absolute left-[24px] top-0 bottom-0 w-[2px] bg-gray-200 z-0" />

        {legs.map((leg, index) => {
          const isWalk = leg.mode === 'WALK';
          const isTransport = leg.mode === 'BUS' || leg.mode === 'SUBWAY';
          const isFirst = index === 0;
          const isLast = index === legs.length - 1;
          const timeMinutes = secondsToMinutes(leg.sectionTime || 0);

          return (
            <div key={index} className="flex gap-4 relative z-10 mb-6 last:mb-0">
              {/* 아이콘 - 선 중앙에 정렬 (선이 left-[24px]에 있으므로 아이콘 중심을 24px에 맞춤) */}
              <div className="relative flex-shrink-0 w-[48px] flex items-center justify-center">
                {isFirst ? (
                  <div className="w-[48px] h-[48px] flex items-center justify-center">
                    <img
                      src="/assets/markers/departure-marker.png"
                      alt="출발"
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                  </div>
                ) : isLast ? (
                  <div className="w-[48px] h-[48px] flex items-center justify-center">
                    <img
                      src="/assets/markers/arrival-marker.png"
                      alt="도착"
                      className="w-full h-full object-contain drop-shadow-lg"
                    />
                  </div>
                ) : isWalk ? (
                  <div className="w-[24px] h-[24px] bg-gray-300 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-[10px]">🚶</span>
                  </div>
                ) : (
                  <div className="w-[24px] h-[24px] bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-white text-[8px] font-bold">{isTransport ? '🚌' : '🚇'}</span>
                  </div>
                )}
              </div>

              {/* 정보 */}
              <div className="flex-1 flex flex-col gap-0 pt-1">
                {isFirst && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-[12px] p-2.5 sm:p-3 border border-white/30 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-['Wittgenstein',sans-serif] text-[14px] sm:text-[13px] font-bold text-gray-900 break-words">{leg.start.name}</p>
                      <span className="text-gray-400 text-[11px] sm:text-[10px] flex-shrink-0 ml-2">📍</span>
                    </div>
                  </div>
                )}

                {isWalk ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 text-[11px] sm:text-[10px]">🚶</span>
                      <span className="font-['Wittgenstein',sans-serif] text-[12px] sm:text-[11px] text-gray-600">{timeMinutes}분</span>
                    </div>
                    <span className="font-['Wittgenstein',sans-serif] text-[12px] sm:text-[11px] text-gray-600">도보 {metersToKilometers(leg.distance)}</span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0">
                    {/* 승차 지점 - 상단 연결선 포함 */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-t-[12px] p-2.5 sm:p-3 border border-white/30 border-b-0">
                      <p className="font-['Wittgenstein',sans-serif] text-[13px] sm:text-[12px] font-semibold text-gray-800 mb-1 break-words">
                        {leg.start.name} {isTransport ? '승차' : '승차'}
                      </p>
                      {leg.passStopList?.stationList?.[0]?.stationID && (
                        <p className="font-['Wittgenstein',sans-serif] text-[11px] sm:text-[10px] text-gray-500">{leg.passStopList.stationList[0].stationID}</p>
                      )}
                    </div>

                    {/* 교통수단 정보 - 중간 연결 */}
                    <div className="bg-blue-50 rounded-none p-2.5 sm:p-3 border-x border-blue-200 border-y-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-blue-500 text-white px-2 py-1 rounded text-[12px] sm:text-[11px] font-bold">
                            {leg.route || leg.mode}
                          </span>
                          <span className="font-['Wittgenstein',sans-serif] text-[12px] sm:text-[11px] text-gray-700">
                            {timeMinutes}분 ({metersToKilometers(leg.distance || 0)})
                            {leg.passStopList?.stationList && ` • ${leg.passStopList.stationList.length}정류장`}
                          </span>
                        </div>
                      </div>
                      {/* 정류장 목록 펼치기 버튼 */}
                      {leg.passStopList?.stationList && leg.passStopList.stationList.length > 0 && (
                        <button
                          onClick={() => toggleStopList(index)}
                          className="w-full mt-2 text-left text-[11px] sm:text-[10px] text-blue-600 hover:text-blue-700 active:text-blue-800 font-medium flex items-center justify-between py-1.5 min-h-[44px] sm:min-h-0"
                        >
                          <span>{leg.passStopList.stationList.length}개 정류장 {expandedStops.has(index) ? '접기' : '보기'}</span>
                          <span className="transform transition-transform flex-shrink-0 ml-2" style={{ transform: expandedStops.has(index) ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            ▼
                          </span>
                        </button>
                      )}
                      {/* 정류장 목록 (펼쳐졌을 때) */}
                      {expandedStops.has(index) && leg.passStopList?.stationList && leg.passStopList.stationList.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <div className="space-y-1.5 max-h-[250px] sm:max-h-[200px] overflow-y-auto">
                            {leg.passStopList.stationList.map((station: any, stationIndex: number) => (
                              <div
                                key={stationIndex}
                                className="flex items-center gap-2 text-[11px] sm:text-[10px] text-gray-700 bg-white/60 rounded px-2.5 sm:px-2 py-2 sm:py-1.5"
                              >
                                <span className="text-gray-400 font-mono w-6 sm:w-6 text-right flex-shrink-0">{stationIndex + 1}</span>
                                <span className="flex-1 font-medium break-words">{station.stationName || station.stationID}</span>
                                {station.stationID && (
                                  <span className="text-gray-400 text-[10px] sm:text-[9px] flex-shrink-0">{station.stationID}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 하차 지점 - 하단 연결선 포함 */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-b-[12px] p-2.5 sm:p-3 border border-white/30 border-t-0">
                      <p className="font-['Wittgenstein',sans-serif] text-[13px] sm:text-[12px] font-semibold text-gray-800 mb-1 break-words">
                        {leg.end.name} {isTransport ? '하차' : '하차'}
                      </p>
                      {leg.passStopList?.stationList && leg.passStopList.stationList.length > 0 && (
                        <p className="font-['Wittgenstein',sans-serif] text-[11px] sm:text-[10px] text-gray-500">
                          {leg.passStopList.stationList[leg.passStopList.stationList.length - 1]?.stationID}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {isLast && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-[12px] p-2.5 sm:p-3 border border-white/30 mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-['Wittgenstein',sans-serif] text-[14px] sm:text-[13px] font-bold text-gray-900 break-words">{leg.end.name}</p>
                      <span className="text-gray-400 text-[11px] sm:text-[10px] flex-shrink-0 ml-2">📍</span>
                    </div>
                    <p className="font-['Wittgenstein',sans-serif] text-[11px] sm:text-[10px] text-gray-500 mt-1">상세정보</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
