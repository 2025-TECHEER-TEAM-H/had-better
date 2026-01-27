import { CharacterColor } from "@/components/MovingCharacter";
import { metersToKilometers, PATH_TYPE_NAMES, secondsToMinutes } from "@/types/route";
import { Fragment, useEffect, useRef, useState } from "react";

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
  // 각 카드의 승차/하차 위치 저장
  const cardRefs = useRef<Array<{ boardingRef: HTMLDivElement | null; alightingRef: HTMLDivElement | null; cardRef: HTMLDivElement | null }>>([]);
  const [cardPositions, setCardPositions] = useState<Array<{ boardingTop: number; alightingTop: number; cardTop: number }>>([]);

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

  // cardRefs 초기화
  useEffect(() => {
    cardRefs.current = legs.map(() => ({ boardingRef: null, alightingRef: null, cardRef: null }));
  }, [legs]);

  // 카드 위치 측정
  useEffect(() => {
    const updatePositions = () => {
      const container = document.querySelector('.flex.flex-col.gap-0.relative');
      if (!container) return;

      const containerTop = container.getBoundingClientRect().top;

      const positions = cardRefs.current.map((refs) => {
        let boardingTop = 0;
        let alightingTop = 0;

        if (refs.boardingRef) {
          boardingTop = refs.boardingRef.getBoundingClientRect().top - containerTop;
        }
        if (refs.alightingRef) {
          alightingTop = refs.alightingRef.getBoundingClientRect().top - containerTop;
        }

        return { boardingTop, alightingTop, cardTop: 0 };
      });
      setCardPositions(positions);
    };

    // 여러 번 시도해서 위치 측정 (렌더링 완료 대기)
    const timers = [
      setTimeout(updatePositions, 50),
      setTimeout(updatePositions, 150),
      setTimeout(updatePositions, 300),
    ];
    window.addEventListener('resize', updatePositions);

    // IntersectionObserver를 사용해서 컨테이너가 보일 때 위치 측정
    const observer = new IntersectionObserver(() => {
      updatePositions();
    }, { threshold: 0 });

    const container = document.querySelector('.flex.flex-col.gap-0.relative');
    if (container) {
      observer.observe(container);
    }

    return () => {
      window.removeEventListener('resize', updatePositions);
      timers.forEach(timer => clearTimeout(timer));
      observer.disconnect();
    };
  }, [legs, expandedStops]);

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
              <span className="font-['Wittgenstein',sans-serif] text-gray-500 text-[11px] sm:text-[10px]">경로 타입</span>
              <span className="font-['Wittgenstein',sans-serif] font-bold text-gray-900 text-[14px] sm:text-[13px]">{PATH_TYPE_NAMES[pathType] || '대중교통'}</span>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <span className="font-['Wittgenstein',sans-serif] text-gray-500 text-[11px] sm:text-[10px]">소요 시간</span>
            <span className="font-['Wittgenstein',sans-serif] font-bold text-gray-900 text-[14px] sm:text-[13px]">{secondsToMinutes(totalTime)}분</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-['Wittgenstein',sans-serif] text-gray-500 text-[11px] sm:text-[10px]">총 거리</span>
            <span className="font-['Wittgenstein',sans-serif] font-bold text-gray-900 text-[14px] sm:text-[13px]">{metersToKilometers(totalDistance)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-['Wittgenstein',sans-serif] text-gray-500 text-[11px] sm:text-[10px]">환승</span>
            <span className="font-['Wittgenstein',sans-serif] font-bold text-gray-900 text-[14px] sm:text-[13px]">{finalTransferCount}회</span>
          </div>
        </div>

        {/* 부가 정보 - 환승 지점 */}
        {transferPoints.length > 0 && (
          <div className="mb-3 pt-3 border-t border-white/20">
            <div className="flex flex-col gap-1.5">
              <span className="font-['Wittgenstein',sans-serif] text-gray-500 text-[11px] sm:text-[10px]">환승 지점</span>
              <div className="flex flex-wrap gap-2">
                {transferPoints.map((point, index) => (
                  <span
                    key={index}
                    className="font-['Wittgenstein',sans-serif] bg-white/40 backdrop-blur-sm px-2.5 py-1.5 rounded-[6px] text-[12px] sm:text-[11px] font-medium text-gray-800 border border-white/30"
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
                <span className="font-['Wittgenstein',sans-serif] text-gray-500">정류장:</span>
                <span className="font-['Wittgenstein',sans-serif] font-semibold text-gray-800">
                  {subwayStationCount > 0 && `🚇 ${subwayStationCount}개역`}
                  {subwayStationCount > 0 && busStopCount > 0 && ' • '}
                  {busStopCount > 0 && `🚌 ${busStopCount}개 정류장`}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="font-['Wittgenstein',sans-serif] text-gray-500">도보:</span>
              <span className="font-['Wittgenstein',sans-serif] font-semibold text-gray-800">
                {secondsToMinutes(finalTotalWalkTime)}분 ({metersToKilometers(finalTotalWalkDistance)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 상세 타임라인 */}
      <div className="flex flex-col gap-0 relative">
        {/* 전체 타임라인 수직 선 - 전체 구간 연결 */}
        <div className="absolute left-[24px] top-0 bottom-0 z-0">
          {/* 전체 배경 선 (점선) */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[2px]"
            style={{
              background: `repeating-linear-gradient(to bottom, #d1d5db 0px, #d1d5db 4px, transparent 4px, transparent 8px)`,
              opacity: 0.3
            }}
          />

          {/* 각 구간별 실선/점선 */}
          {legs.map((leg, index) => {
            const isWalk = leg.mode === 'WALK';
            const isTransport = leg.mode === 'BUS' || leg.mode === 'SUBWAY';
            const isFirst = index === 0;
            const isLast = index === legs.length - 1;
            const prevLeg = index > 0 ? legs[index - 1] : null;
            const nextLeg = index < legs.length - 1 ? legs[index + 1] : null;
            const prevIsTransport = prevLeg && (prevLeg.mode === 'BUS' || prevLeg.mode === 'SUBWAY');
            const nextIsTransport = nextLeg && (nextLeg.mode === 'BUS' || nextLeg.mode === 'SUBWAY');

            // 노선 색상 결정 (routeColor가 있으면 사용, 없으면 기본 회색)
            const routeColor = leg.routeColor ? `#${leg.routeColor.replace('#', '')}` : '#888888';
            // 이전 leg의 색상 (연결선용)
            const prevRouteColor = prevLeg?.routeColor ? `#${prevLeg.routeColor.replace('#', '')}` : '#888888';

            const position = cardPositions[index] || { boardingTop: 0, alightingTop: 0, cardTop: 0 };
            const boardingTop = position.boardingTop || 0;
            const alightingTop = position.alightingTop || 0;
            const lineHeight = alightingTop > boardingTop ? alightingTop - boardingTop : (isTransport ? 180 : 40);

            // 다음 구간의 승차 위치 계산
            const nextPosition = index < legs.length - 1 ? (cardPositions[index + 1] || { boardingTop: 0, alightingTop: 0, cardTop: 0 }) : null;
            const nextBoardingTop = nextPosition?.boardingTop || 0;

            // 구간 사이 연결선 높이 계산
            const connectionHeight = alightingTop > 0 && nextBoardingTop > 0 ? nextBoardingTop - alightingTop : 0;

            return (
              <Fragment key={`fragment-${index}`}>
                {/* 교통수단 구간 실선 */}
                {isTransport && lineHeight > 0 && (
                  <div
                    className="absolute left-0 w-[2px] z-10"
                    style={{
                      top: `${boardingTop || 0}px`,
                      height: `${lineHeight}px`,
                      backgroundColor: routeColor,
                      opacity: 1.0
                    }}
                  />
                )}

                {/* 구간 사이 연결선 (하차 지점에서 다음 승차 지점까지) */}
                {!isLast && connectionHeight > 0 && (
                  <div
                    className="absolute left-0 w-[2px] z-10"
                    style={{
                      top: `${alightingTop || 0}px`,
                      height: `${connectionHeight}px`,
                      background: `repeating-linear-gradient(to bottom, ${prevIsTransport ? prevRouteColor : '#d1d5db'} 0px, ${prevIsTransport ? prevRouteColor : '#d1d5db'} 4px, transparent 4px, transparent 8px)`,
                      opacity: 0.4
                    }}
                  />
                )}

                {/* 승차 마커 (교통수단 구간 시작) */}
                {isTransport && (
                  <div
                    className="absolute -translate-y-1/2 z-20"
                    style={{
                      left: '1px', // 타임라인 선(2px)의 중앙 = 1px
                      top: `${boardingTop || 0}px`
                    }}
                  >
                    <div
                      className="w-[32px] h-[32px] rounded-full flex items-center justify-center border-2 border-white shadow-md -translate-x-1/2"
                      style={{ backgroundColor: routeColor }}
                    >
                      <span className="text-white text-[12px] font-bold">{isTransport ? '🚌' : '🚇'}</span>
                    </div>
                  </div>
                )}


                {/* 하차 마커 (교통수단 구간 끝) - 초록색 선과 맞닿도록 */}
                {isTransport && (!isLast || alightingTop > boardingTop) && (
                  <div
                    className="absolute -translate-y-1/2 z-20"
                    style={{
                      left: '1px', // 타임라인 선(2px)의 중앙 = 1px
                      top: `${alightingTop > boardingTop ? alightingTop : (boardingTop || 0) + lineHeight}px`
                    }}
                  >
                    <div className="w-[32px] h-[32px] bg-gray-300 rounded-full flex items-center justify-center border-2 border-white shadow-md -translate-x-1/2">
                      <span className="text-[12px]">🚶</span>
                    </div>
                  </div>
                )}

                {/* 도보 구간 마커 (이전 구간이 교통수단이 아닐 때만 표시) */}
                {isWalk && !prevIsTransport && boardingTop > 0 && (
                  <div
                    className="absolute -translate-y-1/2 z-20"
                    style={{
                      left: '1px', // 타임라인 선(2px)의 중앙 = 1px
                      top: `${boardingTop}px`
                    }}
                  >
                    <div className="w-[32px] h-[32px] bg-gray-300 rounded-full flex items-center justify-center border-2 border-white shadow-md -translate-x-1/2">
                      <span className="text-[12px]">🚶</span>
                    </div>
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>

        {legs.map((leg, index) => {
          const isWalk = leg.mode === 'WALK';
          const isTransport = leg.mode === 'BUS' || leg.mode === 'SUBWAY';
          const isFirst = index === 0;
          const isLast = index === legs.length - 1;
          const timeMinutes = secondsToMinutes(leg.sectionTime || 0);

          // 노선 색상 결정 (routeColor가 있으면 사용, 없으면 기본 회색)
          const routeColor = leg.routeColor ? `#${leg.routeColor.replace('#', '')}` : '#888888';
          const legColors = {
            primary: routeColor,
            light: `${routeColor}30`, // 30% 투명도
            badgeBorder: `${routeColor}40`, // 40% 투명도
          };

          return (
            <div
              key={index}
              ref={(el) => {
                if (cardRefs.current[index]) {
                  cardRefs.current[index].cardRef = el;
                }
              }}
              className="flex gap-4 relative z-10 mb-6 last:mb-0"
            >
              {/* 아이콘 - 선 중앙에 정렬 (출발/도착만 표시, 교통수단 구간은 타임라인 선 위에 마커 표시) */}
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
                ) : null}
              </div>

              {/* 정보 */}
              <div className="flex-1 flex flex-col gap-0 pt-1">
                {isFirst && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-[12px] p-2.5 sm:p-3 border border-white/30 mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-['Wittgenstein',sans-serif] text-[14px] sm:text-[13px] font-bold text-gray-900 break-words">{leg.start.name}</p>
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
                  <div className="bg-white/20 backdrop-blur-sm rounded-[12px] p-2.5 sm:p-3 border border-white/30">
                    {/* 승차 지점 */}
                    <div
                      ref={(el) => {
                        if (cardRefs.current[index]) {
                          cardRefs.current[index].boardingRef = el;
                        }
                      }}
                      className="mb-2"
                    >
                      <p className="font-['Wittgenstein',sans-serif] text-[13px] sm:text-[12px] font-semibold text-gray-800 mb-1 break-words">
                        {leg.start.name} {isTransport ? '승차' : '승차'}
                      </p>
                      {leg.passStopList?.stationList?.[0]?.stationID && (
                        <p className="font-['Wittgenstein',sans-serif] text-[11px] sm:text-[10px] text-gray-500">{leg.passStopList.stationList[0].stationID}</p>
                      )}
                    </div>

                    {/* 교통수단 정보 - 중간 강조 */}
                    <div className="rounded-[8px] p-2.5 sm:p-3 mb-2" style={{ backgroundColor: legColors.light }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-['Wittgenstein',sans-serif] text-white px-2 py-1 rounded text-[12px] sm:text-[11px] font-bold" style={{ backgroundColor: legColors.primary }}>
                          {leg.route || leg.mode}
                        </span>
                        <span className="font-['Wittgenstein',sans-serif] text-[12px] sm:text-[11px] text-gray-700">
                          {metersToKilometers(leg.distance || 0)} • {secondsToMinutes(leg.sectionTime || 0)}분
                          {leg.passStopList?.stationList && ` • ${leg.passStopList.stationList.length}정류장`}
                        </span>
                      </div>
                      {/* 정류장 목록 펼치기 버튼 */}
                      {leg.passStopList?.stationList && leg.passStopList.stationList.length > 0 && (
                        <button
                          onClick={() => toggleStopList(index)}
                          className="font-['Wittgenstein',sans-serif] w-full mt-2 text-left text-[11px] sm:text-[10px] font-medium flex items-center justify-between py-1.5 min-h-[44px] sm:min-h-0"
                          style={{
                            color: legColors.primary,
                          }}
                          onMouseEnter={(e) => {
                            const rgb = legColors.primary.replace('#', '');
                            const r = parseInt(rgb.substr(0, 2), 16);
                            const g = parseInt(rgb.substr(2, 2), 16);
                            const b = parseInt(rgb.substr(4, 2), 16);
                            const darker = `rgb(${Math.max(0, r - 20)}, ${Math.max(0, g - 20)}, ${Math.max(0, b - 20)})`;
                            e.currentTarget.style.color = darker;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = legColors.primary;
                          }}
                        >
                          <span>{leg.passStopList.stationList.length}개 정류장 {expandedStops.has(index) ? '접기' : '보기'}</span>
                          <span className="transform transition-transform flex-shrink-0 ml-2" style={{ transform: expandedStops.has(index) ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            ▼
                          </span>
                        </button>
                      )}
                      {/* 정류장 목록 (펼쳐졌을 때) */}
                      {expandedStops.has(index) && leg.passStopList?.stationList && leg.passStopList.stationList.length > 0 && (
                        <div className="mt-3 pt-3 border-t" style={{ borderColor: legColors.badgeBorder }}>
                          <div className="space-y-1.5 max-h-[250px] sm:max-h-[200px] overflow-y-auto">
                            {leg.passStopList.stationList.map((station: any, stationIndex: number) => (
                              <div
                                key={stationIndex}
                                className="flex items-center gap-2 text-[11px] sm:text-[10px] text-gray-700 bg-white/60 rounded px-2.5 sm:px-2 py-2 sm:py-1.5"
                              >
                                <span className="font-['Wittgenstein',sans-serif] text-gray-400 font-mono w-6 sm:w-6 text-right flex-shrink-0">{stationIndex + 1}</span>
                                <span className="font-['Wittgenstein',sans-serif] flex-1 font-medium break-words">{station.stationName || station.stationID}</span>
                                {station.stationID && (
                                  <span className="font-['Wittgenstein',sans-serif] text-gray-400 text-[10px] sm:text-[9px] flex-shrink-0">{station.stationID}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 하차 지점 */}
                    <div
                      ref={(el) => {
                        if (cardRefs.current[index]) {
                          cardRefs.current[index].alightingRef = el;
                        }
                      }}
                    >
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
