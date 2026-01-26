import { ResultPopup } from "@/app/components/ResultPopup";
import { MovingCharacter, type CharacterColor } from "@/components/MovingCharacter";
import { useRouteMapLayers } from "@/hooks/useRouteMapLayers";
import { useRouteSimulation } from "@/hooks/useRouteSimulation";
import { useRouteSSE } from "@/hooks/useRouteSSE";
import { getRouteLegDetail, updateRouteStatus } from "@/services/routeService";
import { useRouteStore, type Player } from "@/stores/routeStore";
import { metersToKilometers, secondsToMinutes, type BotStatus, type BotStatusUpdateEvent, type RouteResultResponse } from "@/types/route";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapView, type EndpointMarker, type MapViewRef, type RouteLineInfo, type StationMarker } from "./MapView";
import { ArrivalAlert } from "./route-detail/ArrivalAlert";
import { BusInputModal } from "./route-detail/BusInputModal";
import { HorizontalRanking } from "./route-detail/HorizontalRanking";
import { LayerControl } from "./route-detail/LayerControl";
import { RealtimeInfoContent } from "./route-detail/RealtimeInfoContent";
import { RouteTimeline } from "./route-detail/RouteTimeline";

type PageType = "map" | "search" | "favorites" | "subway" | "route" | "routeDetail";

interface RouteDetailPageProps {
  onBack?: () => void;
  onNavigate?: (page: PageType) => void;
  onOpenDashboard?: () => void;
}

export function RouteDetailPage({ onBack, onNavigate, onOpenDashboard }: RouteDetailPageProps) {
  const { departure, arrival, assignments, legDetails, setLegDetail, userRouteId, createRouteResponse } = useRouteStore();
  const [sheetHeight, setSheetHeight] = useState(45);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(45);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapViewRef = useRef<MapViewRef>(null);
  const layerButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isWebView, setIsWebView] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [bottomSheetView, setBottomSheetView] = useState<'route' | 'realtime'>('route');
  const [simulationStartTime, setSimulationStartTime] = useState<number | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [arrivalAlert, setArrivalAlert] = useState<{ player: Player; name: string; remainingMinutes: number } | null>(null);
  const [alertedPlayers, setAlertedPlayers] = useState<Set<Player>>(new Set());

  // 실시간 그래프 데이터 (시간에 따른 순위/진행률 추적)
  const [chartData, setChartData] = useState<Array<{
    time: number; // 경과 시간 (초)
    timestamp: number; // 실제 타임스탬프
    [key: string]: number | string; // player별 순위/진행률
  }>>([]);

  // 현재 어떤 플레이어의 경로를 보고 있는지 관리하는 상태 추가
  const [selectedPlayer, setSelectedPlayer] = useState<Player>('user');
  const [isRouteInfoExpanded, setIsRouteInfoExpanded] = useState(false);

  const handleUserArrived = useCallback(async () => {
    try {
      await updateRouteStatus(userRouteId || 1, { status: 'FINISHED' });
    } catch (error) {
      console.error('사용자 도착 처리 실패:', error);
    }
  }, [userRouteId]);

  const {
    userLocation, distanceToDestination, distanceFromRoute, isOffRoute, isUserArrived, isGpsTracking, isGpsTestMode,
    isUserAutoMoving, playerProgress, finishTimes, startGpsTracking, stopGpsTracking, startGpsTestMode, stopGpsTestMode,
    resetGpsTestMode, startUserAutoMove, updatePlayerProgress,
  } = useRouteSimulation({
    departure, arrival, assignments, legDetails, onUserArrived: handleUserArrived,
  });

  const {
    mapStyle, isLayerPopoverOpen, setIsLayerPopoverOpen, is3DBuildingsEnabled, isSubwayLinesEnabled, isBusLinesEnabled,
    showBusInputModal, busNumberInput, setBusNumberInput, trackedBusNumbers, handleStyleChange, handle3DBuildingsToggle,
    handleSubwayLinesToggle, handleBusLinesToggle, handleBusInputConfirm, handleBusInputCancel,
  } = useRouteMapLayers(mapViewRef);

  const [botPositions, setBotPositions] = useState<Map<number, BotStatusUpdateEvent>>(new Map());

  const { botStates } = useRouteSSE(
    createRouteResponse?.route_itinerary_id || null,
    {
      onBotStatusUpdate: (data) => {
        setBotPositions(prev => {
          const next = new Map(prev);
          next.set(data.bot_id, data);
          return next;
        });
        if (data.progress_percent !== undefined) {
          const botParticipants = createRouteResponse?.participants.filter(p => p.type === 'BOT') || [];
          const botIndex = botParticipants.findIndex(p => p.bot_id === data.bot_id);
          updatePlayerProgress(botIndex === 0 ? 'bot1' : 'bot2', data.progress_percent / 100);
        }
      },
    }
  );

  useEffect(() => {
    if (botStates.size > 0) setBotPositions(new Map(botStates));
  }, [botStates]);

  const [routeResult, setRouteResult] = useState<RouteResultResponse | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);

  useEffect(() => {
    const checkViewport = () => setIsWebView(window.innerWidth > 768);
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  useEffect(() => {
    const loadRouteDetails = async () => {
      if (assignments.size === 0) return;
      setIsLoadingDetails(true);
      try {
        const promises = [];
        for (const [, routeLegId] of assignments) {
          if (legDetails.has(routeLegId)) continue;
          promises.push(getRouteLegDetail(routeLegId).then(detail => setLegDetail(routeLegId, detail)));
        }
        await Promise.all(promises);
      } catch (error) {
        console.error("경로 상세 정보 로드 실패:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    loadRouteDetails();
  }, [assignments, legDetails, setLegDetail]);

  const playerLineColors: Record<string, string> = { green: '#7ed321', pink: '#ff6b9d', yellow: '#ffd93d', purple: '#a78bfa' };

  const getPlayerLineColor = useCallback((player: Player): string => {
    if (player === 'user') return playerLineColors.green;
    const botParticipants = createRouteResponse?.participants.filter(p => p.type === 'BOT') || [];
    const botIndex = player === 'bot1' ? 0 : 1;
    const botType = botParticipants[botIndex]?.bot_type as string;
    return playerLineColors[botType] || playerLineColors.purple;
  }, [createRouteResponse, playerLineColors]);

  const routeLines = useMemo<RouteLineInfo[]>(() => {
    const lines: RouteLineInfo[] = [];
    for (const [player, routeLegId] of assignments) {
      const detail = legDetails.get(routeLegId);
      if (!detail) continue;
      const lineColor = getPlayerLineColor(player);
      const allCoordinates: [number, number][] = [];
      const walkSegments: Array<{ coordinates: [number, number][] }> = []; // 도보 구간 좌표
      const transferPoints: any[] = [];
      const boardingAlightingPoints: Array<{ coordinates: [number, number]; name: string; type: 'boarding' | 'alighting' }> = [];

      detail.legs.forEach((leg, legIndex) => {
        // 환승 지점 찾기 (이전 구간과 현재 구간이 mode가 다른 경우)
        if (legIndex > 0) {
          const prevLeg = detail.legs[legIndex - 1];
          const prevMode = prevLeg.mode;
          const currentMode = leg.mode;

          // 이전 구간과 현재 구간이 다른 경우 환승
          if (prevMode !== currentMode) {
            // 이전 구간의 하차 지점이 환승 지점
            // status는 기본적으로 'confirmed' (정상 표시)
            // 실패 시에는 이 마커를 표시하지 않음 (자연스럽게 숨김)
            transferPoints.push({
              coordinates: [prevLeg.end.lon, prevLeg.end.lat],
              fromMode: prevMode, // 이전 교통수단
              toMode: currentMode, // 다음 교통수단
              name: prevLeg.end.name,
              status: 'confirmed' as const, // 정상 환승 지점 (기본값)
        });
      }
    }

        // 도보 구간 좌표 추출
        if (leg.mode === 'WALK') {
          const walkCoords: [number, number][] = [];

          // 도보 구간의 시작 좌표 추가
          walkCoords.push([leg.start.lon, leg.start.lat]);

          // 도보 경로 좌표 추출
          if (leg.steps) {
            leg.steps.forEach((step: any) => {
              if (step.linestring) {
                const points = step.linestring.split(' ');
                points.forEach((p: string) => {
                  const [lon, lat] = p.split(',').map(Number);
                  if (!isNaN(lon) && !isNaN(lat)) {
                    walkCoords.push([lon, lat]);
                  }
                });
              }
            });
          }

          // 도보 구간의 끝 좌표 추가
          walkCoords.push([leg.end.lon, leg.end.lat]);

          if (walkCoords.length > 1) {
            walkSegments.push({ coordinates: walkCoords });
          }
        }
        // 버스/지하철 구간의 승차/하차 지점 수집 (환승 지점 제외)
        if (leg.mode === 'BUS' || leg.mode === 'SUBWAY') {
          // 승차 지점
          boardingAlightingPoints.push({
            coordinates: [leg.start.lon, leg.start.lat],
            name: leg.start.name,
            type: 'boarding',
          });
          // 하차 지점
          boardingAlightingPoints.push({
            coordinates: [leg.end.lon, leg.end.lat],
            name: leg.end.name,
            type: 'alighting',
          });
        }

        // 이전 leg와의 연결을 보장하기 위해 시작 좌표를 먼저 추가
        if (legIndex > 0 && allCoordinates.length > 0) {
          const lastCoord = allCoordinates[allCoordinates.length - 1];
          const startCoord: [number, number] = [leg.start.lon, leg.start.lat];
          // 이전 좌표와 시작 좌표가 다르면 연결 좌표 추가
          if (Math.abs(lastCoord[0] - startCoord[0]) > 0.0001 ||
              Math.abs(lastCoord[1] - startCoord[1]) > 0.0001) {
            allCoordinates.push(startCoord);
          }
        } else if (legIndex === 0) {
          // 첫 번째 leg의 시작 좌표 추가
          allCoordinates.push([leg.start.lon, leg.start.lat]);
        }

      if (leg.passShape?.linestring) {
        const points = leg.passShape.linestring.split(' ');
          let isFirstPoint = true;
          points.forEach((p: string) => {
            const [lon, lat] = p.split(',').map(Number);
          if (!isNaN(lon) && !isNaN(lat)) {
              // 첫 번째 점은 이미 start 좌표로 추가했으므로 스킵 (중복 방지)
              if (isFirstPoint && allCoordinates.length > 0) {
                const lastCoord = allCoordinates[allCoordinates.length - 1];
                const dist = Math.sqrt(
                  Math.pow(lastCoord[0] - lon, 2) + Math.pow(lastCoord[1] - lat, 2)
                );
                // 거리가 매우 가까우면(0.0001도 이내) 스킵
                if (dist < 0.0001) {
                  isFirstPoint = false;
      return;
    }
              }
              allCoordinates.push([lon, lat]);
              isFirstPoint = false;
            }
          });
        } else if (leg.steps) {
          leg.steps.forEach((step: any, stepIndex: number) => {
            if (step.linestring) {
              const points = step.linestring.split(' ');
              let isFirstPointInStep = legIndex === 0 && stepIndex === 0;
              points.forEach((p: string) => {
                const [lon, lat] = p.split(',').map(Number);
                if (!isNaN(lon) && !isNaN(lat)) {
                  // 첫 번째 leg의 첫 번째 step의 첫 번째 점은 이미 start 좌표로 추가했으므로 스킵
                  if (isFirstPointInStep && allCoordinates.length > 0) {
                    const lastCoord = allCoordinates[allCoordinates.length - 1];
                    const dist = Math.sqrt(
                      Math.pow(lastCoord[0] - lon, 2) + Math.pow(lastCoord[1] - lat, 2)
                    );
                    // 거리가 매우 가까우면(0.0001도 이내) 스킵
                    if (dist < 0.0001) {
                      isFirstPointInStep = false;
      return;
    }
                  }
                  allCoordinates.push([lon, lat]);
                  isFirstPointInStep = false;
                }
              });
            }
          });
        } else {
          // passShape도 steps도 없으면 start/end 좌표 사용 (fallback)
          // start는 이미 추가했으므로 end만 추가
          allCoordinates.push([leg.end.lon, leg.end.lat]);
        }

        // 마지막 leg의 경우 end 좌표도 명시적으로 추가 (연결 보장)
        if (legIndex === detail.legs.length - 1) {
          const lastCoord = allCoordinates[allCoordinates.length - 1];
          const endCoord: [number, number] = [leg.end.lon, leg.end.lat];
          // 마지막 좌표와 end 좌표가 다르면 추가
          if (Math.abs(lastCoord[0] - endCoord[0]) > 0.0001 ||
              Math.abs(lastCoord[1] - endCoord[1]) > 0.0001) {
            allCoordinates.push(endCoord);
          }
        }
      });
      if (allCoordinates.length > 0) {
        const isSelected = player === selectedPlayer;
        // 진행률과 남은 시간 계산
        const progress = playerProgress.get(player) || 0;
        const totalTimeSeconds = detail.totalTime;
        const remainingSeconds = progress < 1 ? totalTimeSeconds * (1 - progress) : 0;
        const remainingMinutes = Math.ceil(remainingSeconds / 60);

        lines.push({
          id: `route-${player}`, coordinates: allCoordinates, color: lineColor,
          width: isSelected ? 10 : 6, // 선택된 경로: 10px, 나머지: 6px
          opacity: 1.0, // 모든 경로 불투명
          summary: { time: secondsToMinutes(detail.totalTime), distance: metersToKilometers(detail.totalDistance) },
          transferPoints,
          boardingAlightingPoints,
          isSelected,
          walkSegments: walkSegments.length > 0 ? walkSegments : undefined,
        });
      }
    }
    // 선택된 경로를 마지막에 배치하여 위에 표시되도록 정렬
    return lines.sort((a, b) => {
      if (a.isSelected && !b.isSelected) return 1; // 선택된 경로를 뒤로
      if (!a.isSelected && b.isSelected) return -1;
      return 0;
    });
  }, [assignments, legDetails, getPlayerLineColor, selectedPlayer, playerProgress]);

  const endpoints = useMemo<EndpointMarker[]>(() => {
    const markers: EndpointMarker[] = [];
    if (departure) markers.push({ type: 'departure', coordinates: [departure.lon, departure.lat], name: departure.name });
    if (arrival) markers.push({ type: 'arrival', coordinates: [arrival.lon, arrival.lat], name: arrival.name });
    return markers;
  }, [departure, arrival]);

  // 정류장/역 마커 수집 (선택된 플레이어의 경로만)
  const stationMarkers = useMemo<StationMarker[]>(() => {
    const markers: StationMarker[] = [];
    const routeLegId = assignments.get(selectedPlayer);
    if (!routeLegId) return markers;

    const detail = legDetails.get(routeLegId);
    if (!detail) return markers;

    detail.legs.forEach((leg) => {
      // 버스나 지하철 구간만 처리
      if ((leg.mode === 'BUS' || leg.mode === 'SUBWAY') && leg.passStopList?.stationList) {
        const mode = leg.mode as 'BUS' | 'SUBWAY';
        leg.passStopList.stationList.forEach((station) => {
          // 중복 제거 (같은 좌표의 정류장은 한 번만 표시)
          const existingMarker = markers.find(
            m => Math.abs(m.coordinates[0] - parseFloat(station.lon)) < 0.0001 &&
                 Math.abs(m.coordinates[1] - parseFloat(station.lat)) < 0.0001
          );
          if (!existingMarker) {
            markers.push({
              id: `${mode}-${station.stationID || station.index}`,
              coordinates: [parseFloat(station.lon), parseFloat(station.lat)],
              name: station.stationName || station.stationID || '',
              stationID: station.stationID,
              mode: mode,
            });
          }
        });
      }
    });

    return markers;
  }, [assignments, legDetails, selectedPlayer]);

  const generateResultFromSimulation = useCallback((): RouteResultResponse => {
    const routeId = userRouteId || 1;
    const now = new Date().toISOString();
    const startTime = simulationStartTime ? new Date(simulationStartTime).toISOString() : now;
    const botParticipants = createRouteResponse?.participants.filter(p => p.type === 'BOT') || [];
    const playerInfo: Record<Player, any> = {
      user: { route_id: routeId, bot_id: null, name: '나' },
      bot1: { route_id: botParticipants[0]?.route_id || 101, bot_id: botParticipants[0]?.bot_id || 1, name: botParticipants[0]?.name || 'Bot 1' },
      bot2: { route_id: botParticipants[1]?.route_id || 102, bot_id: botParticipants[1]?.bot_id || 2, name: botParticipants[1]?.name || 'Bot 2' },
    };
    const results = (['user', 'bot1', 'bot2'] as Player[]).map(player => {
      const finishTime = finishTimes.get(player);
      const progress = playerProgress.get(player) || 0;
      let duration = finishTime && simulationStartTime ? Math.round((finishTime - simulationStartTime) / 1000) : (progress >= 1 && simulationStartTime ? Math.round((Date.now() - simulationStartTime) / 1000) : null);
      return { player, progress, finishTime, duration, ...playerInfo[player] };
    });
    results.sort((a, b) => {
      if (a.progress >= 1 && b.progress >= 1) return (a.duration || Infinity) - (b.duration || Infinity);
      if (a.progress >= 1) return -1;
      if (b.progress >= 1) return 1;
      return b.progress - a.progress;
    });
    const rankings = results.map((r, index) => ({
      rank: index + 1, route_id: r.route_id, type: (r.player === 'user' ? 'USER' : 'BOT') as any,
      duration: r.duration, end_time: r.finishTime ? new Date(r.finishTime).toISOString() : null,
      user_id: r.player === 'user' ? 1 : null, bot_id: r.bot_id, name: r.name,
    }));
    const userRanking = rankings.find(r => r.type === 'USER');
      return {
      route_id: routeId, route_itinerary_id: 1, status: 'FINISHED', start_time: startTime, end_time: now,
      route_info: { departure: departure ? { name: departure.name, lat: departure.lat, lon: departure.lon } : { name: null, lat: null, lon: null } as any, arrival: arrival ? { name: arrival.name, lat: arrival.lat, lon: arrival.lon } : { name: null, lat: null, lon: null } as any },
      rankings, user_result: { rank: userRanking?.rank || null, is_win: userRanking?.rank === 1, duration: userRanking?.duration || null },
    };
  }, [userRouteId, simulationStartTime, finishTimes, playerProgress, departure, arrival, createRouteResponse]);

  const rankingsList = useMemo(() => {
    const bots = createRouteResponse?.participants.filter(p => p.type === 'BOT') || [];
    const players = (['user', 'bot1', 'bot2'] as Player[]).map(player => {
      const progress = playerProgress.get(player) || 0;
      let name = player === 'user' ? '나' : (player === 'bot1' ? bots[0]?.name : bots[1]?.name) || '고스트';
      const routeLegId = assignments.get(player);
      const legData = routeLegId ? legDetails.get(routeLegId) : null;
      const totalTimeMinutes = legData ? Math.floor(legData.totalTime / 60) : 0;
      const totalTimeSeconds = legData ? legData.totalTime : 0;
      const isArrived = progress >= 1;

      // 남은 시간 계산 (진행률 기반)
      const remainingSeconds = !isArrived && totalTimeSeconds > 0
        ? totalTimeSeconds * (1 - progress)
        : 0;
      const remainingMinutes = Math.ceil(remainingSeconds / 60);

      // 예상 도착 시간 계산
      const estimatedArrivalTime = simulationStartTime && remainingSeconds > 0
        ? new Date(simulationStartTime + (totalTimeSeconds * 1000))
        : null;

      return { player, progress, name, totalTimeMinutes, totalTimeSeconds, isArrived, remainingMinutes, remainingSeconds, estimatedArrivalTime };
    });

    // 순위 정렬
    const sorted = players.sort((a, b) => {
      if (a.isArrived && b.isArrived) {
        // 둘 다 도착: 남은 시간이 적은 순 (빠른 순)
        return a.remainingSeconds - b.remainingSeconds;
      }
      if (a.isArrived) return -1;
      if (b.isArrived) return 1;
      // 둘 다 진행 중: 진행률 높은 순
      return b.progress - a.progress;
    });

    // 1위 찾기
    const firstPlace = sorted[0];

    // 1위와의 시간 차이 계산
    return sorted.map((item, index) => {
      let timeDifference: number | null = null;
      let timeDifferenceText: string | null = null;

      if (!item.isArrived && firstPlace && !firstPlace.isArrived) {
        // 둘 다 진행 중: 남은 시간 차이
        timeDifference = item.remainingSeconds - firstPlace.remainingSeconds;
        const diffMinutes = Math.abs(Math.round(timeDifference / 60));
        if (timeDifference > 0) {
          timeDifferenceText = `+${diffMinutes}분`;
        } else if (timeDifference < 0) {
          timeDifferenceText = `-${diffMinutes}분`;
        } else {
          timeDifferenceText = '동일';
        }
      } else if (item.isArrived && firstPlace && firstPlace.isArrived && simulationStartTime) {
        // 둘 다 도착: 실제 소요 시간 차이
        const itemFinishTime = finishTimes.get(item.player);
        const firstFinishTime = finishTimes.get(firstPlace.player);
        if (itemFinishTime && firstFinishTime) {
          timeDifference = (itemFinishTime - firstFinishTime) / 1000;
          const diffMinutes = Math.abs(Math.round(timeDifference / 60));
          if (timeDifference > 0) {
            timeDifferenceText = `+${diffMinutes}분`;
          } else if (timeDifference < 0) {
            timeDifferenceText = `-${diffMinutes}분`;
          } else {
            timeDifferenceText = '동일';
          }
        }
      }

    return {
        ...item,
        rank: index + 1,
        timeDifference,
        timeDifferenceText,
      };
    });
  }, [playerProgress, createRouteResponse, assignments, legDetails, simulationStartTime, finishTimes]);

  const playerColors = useMemo(() => {
    const colors: Record<Player, CharacterColor> = { user: 'green', bot1: 'purple', bot2: 'yellow' };
    const bots = createRouteResponse?.participants.filter(p => p.type === 'BOT') || [];
    if (bots[0]?.bot_type) colors.bot1 = bots[0].bot_type as CharacterColor;
    if (bots[1]?.bot_type) colors.bot2 = bots[1].bot_type as CharacterColor;
    return colors;
  }, [createRouteResponse]);

  const handleFinishRoute = useCallback(async () => {
    setShowResultPopup(true);
    setIsLoadingResult(true);
    try {
      setRouteResult(generateResultFromSimulation());
    } finally {
      setIsLoadingResult(false);
    }
  }, [generateResultFromSimulation]);

  const handleCancelRoute = useCallback(async () => {
    try {
      await updateRouteStatus(userRouteId || 1, { status: 'CANCELED' });
      onBack?.();
    } catch {
      onBack?.();
    }
  }, [userRouteId, onBack]);

  useEffect(() => {
    const userLeg = assignments.get('user');
    if (userLeg && legDetails.has(userLeg) && !isUserAutoMoving && !isGpsTracking && !isGpsTestMode && !isUserArrived) {
      setTimeout(() => {
        startUserAutoMove();
        if (!simulationStartTime) setSimulationStartTime(Date.now());
      }, 500);
    }
  }, [assignments, legDetails, isUserAutoMoving, isGpsTracking, isGpsTestMode, isUserArrived, startUserAutoMove, simulationStartTime]);

  // 5분 전 알림 체크
  useEffect(() => {
    if (!simulationStartTime) return;

    const checkArrivalAlert = () => {
      const bots = createRouteResponse?.participants.filter(p => p.type === 'BOT') || [];

      (['user', 'bot1', 'bot2'] as Player[]).forEach(player => {
        // 이미 도착했거나 이미 알림을 받은 플레이어는 스킵
        const progress = playerProgress.get(player) || 0;
        if (progress >= 1 || alertedPlayers.has(player)) return;

        const routeLegId = assignments.get(player);
        const legData = routeLegId ? legDetails.get(routeLegId) : null;
        if (!legData) return;

        const totalTimeSeconds = legData.totalTime;

        // 진행률 기반으로 남은 시간 계산
        const elapsedSeconds = totalTimeSeconds * progress;
        const remainingSeconds = totalTimeSeconds - elapsedSeconds;
        const remainingMinutes = Math.ceil(remainingSeconds / 60);

        // 5분 전 알림 (5분 이하 남았을 때)
        if (remainingMinutes <= 5 && remainingMinutes > 0) {
          const name = player === 'user' ? '나' : (player === 'bot1' ? bots[0]?.name : bots[1]?.name) || '고스트';

          // 아직 알림을 받지 않은 경우에만 표시
          if (!alertedPlayers.has(player)) {
            setArrivalAlert({ player, name, remainingMinutes });
            setAlertedPlayers(prev => new Set(prev).add(player));
          }
        }
      });
    };

    const interval = setInterval(checkArrivalAlert, 1000); // 1초마다 체크
    return () => clearInterval(interval);
  }, [simulationStartTime, playerProgress, assignments, legDetails, createRouteResponse, alertedPlayers]);

  // 실시간 그래프 데이터 수집 (5초마다)
  useEffect(() => {
    if (!simulationStartTime) return;

    const updateChartData = () => {
      const elapsedSeconds = Math.floor((Date.now() - simulationStartTime!) / 1000);

      // 현재 순위와 진행률 데이터 수집
      const dataPoint: any = {
        time: elapsedSeconds,
        timestamp: Date.now(),
      };

      (['user', 'bot1', 'bot2'] as Player[]).forEach(player => {
        const progress = playerProgress.get(player) || 0;
        const rankingInfo = rankingsList.find(r => r.player === player);
        const routeLegId = assignments.get(player);
        const legData = routeLegId ? legDetails.get(routeLegId) : null;

        // 순위 데이터 (rank_user, rank_bot1, rank_bot2)
        dataPoint[`rank_${player}`] = rankingInfo?.rank || 0;

        // 진행률 데이터 (progress_user, progress_bot1, progress_bot2)
        dataPoint[`progress_${player}`] = Math.round(progress * 100);

        // 남은 시간 데이터 (remaining_user, remaining_bot1, remaining_bot2) - 예상 도착 시간 비교용
        if (legData && progress < 1) {
          const totalTimeSeconds = legData.totalTime;
          const remainingSeconds = totalTimeSeconds * (1 - progress);
          dataPoint[`remaining_${player}`] = Math.ceil(remainingSeconds / 60); // 분 단위
        } else {
          dataPoint[`remaining_${player}`] = 0;
        }
      });

      setChartData(prev => {
        const newData = [...prev, dataPoint];
        // 최근 60개 데이터만 유지 (약 5분간의 데이터)
        return newData.slice(-60);
      });
    };

    // 즉시 한 번 실행
    updateChartData();

    // 5초마다 업데이트
    const interval = setInterval(updateChartData, 5000);
    return () => clearInterval(interval);
  }, [simulationStartTime, playerProgress, rankingsList, assignments, legDetails]);

  const handleDragStart = (y: number) => { setIsDragging(true); setStartY(y); setStartHeight(sheetHeight); };

  useEffect(() => {
    if (!isDragging) return;
    const move = (e: MouseEvent | TouchEvent) => {
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const h = containerRef.current?.clientHeight || 1;
      setSheetHeight(Math.max(30, Math.min(85, startHeight + ((startY - y) / h) * 100)));
    };
    const end = () => setIsDragging(false);
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", end);
    window.addEventListener("touchmove", move); window.addEventListener("touchend", end);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", end); window.removeEventListener("touchmove", move); window.removeEventListener("touchend", end); };
  }, [isDragging, startY, startHeight]);

  const userPosition = useMemo(() => userLocation ? { lon: userLocation[0], lat: userLocation[1] } : null, [userLocation]);

  // 플레이어 위치 Map 생성 (순위/남은 시간 마커 추적용)
  const playerPositions = useMemo(() => {
    const positions = new Map<string, { lon: number; lat: number }>();

    // 유저 위치
    if (userLocation) {
      positions.set('user', { lon: userLocation[0], lat: userLocation[1] });
    }

    // 봇 위치
    const bots = createRouteResponse?.participants.filter(p => p.type === 'BOT') || [];
    rankingsList.filter(r => r.player !== 'user').forEach(r => {
      const botId = r.player === 'bot1' ? bots[0]?.bot_id : bots[1]?.bot_id;
      const state = botPositions.get(botId!);
      if (state?.position) {
        positions.set(r.player, { lon: state.position.lon, lat: state.position.lat });
      }
    });

    return positions;
  }, [userLocation, botPositions, rankingsList, createRouteResponse]);

  // 선택된 플레이어의 경로 데이터를 계산
  const selectedLegData = useMemo(() => {
    const id = assignments.get(selectedPlayer);
    return id ? legDetails.get(id) : null;
  }, [assignments, legDetails, selectedPlayer]);

  // 사용자 경로 데이터 (통계 카드용)
  const userLegData = useMemo(() => {
    const id = assignments.get('user');
    return id ? legDetails.get(id) : null;
  }, [assignments, legDetails]);

  // 사용자의 현재 이동 수단 계산 (진행률 기반)
  const userCurrentStatus = useMemo<BotStatus>(() => {
    const progress = playerProgress.get('user') || 0;
    if (progress >= 1) return 'FINISHED';

    if (!userLegData || !userLegData.legs || userLegData.legs.length === 0) {
      return 'WALKING';
    }

    // 전체 경로 시간 계산
    const totalTime = userLegData.totalTime;
    const currentTime = totalTime * progress;

    // 각 leg의 누적 시간 계산하여 현재 leg 찾기
    let accumulatedTime = 0;
    for (const leg of userLegData.legs) {
      const legTime = leg.sectionTime || 0;
      if (currentTime <= accumulatedTime + legTime) {
        // 현재 leg 발견
        if (leg.mode === 'BUS') return 'RIDING_BUS';
        if (leg.mode === 'SUBWAY') return 'RIDING_SUBWAY';
        return 'WALKING';
      }
      accumulatedTime += legTime;
    }

    return 'WALKING';
  }, [playerProgress, userLegData]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-white overflow-hidden flex flex-col md:flex-row">
      {/* 메인 지도 영역 */}
      <div className="flex-1 relative order-1 md:order-2">
        <MapView ref={mapViewRef} currentPage="route" routeLines={routeLines} endpoints={endpoints} fitToRoutes={routeLines.length > 0} stationMarkers={stationMarkers} playerPositions={playerPositions} />

        {/* 경기 중 표시 - 상단 가운데 */}
        <div className="absolute left-1/2 top-[12px] -translate-x-1/2 z-30">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <span className="font-['Wittgenstein',sans-serif] text-[12px] font-bold text-white whitespace-nowrap">
              경기 중
            </span>
          </div>
        </div>

        {/* GPS 상태 표시 - 상단 좌측 (기존 모양 그대로) */}
        <div className="absolute left-[20px] top-[12px] z-30">
          <div className={`rounded-[12px] border border-white/30 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] px-3 py-2 ${
            isOffRoute ? 'bg-[#ff6b6b]/20' : isUserArrived ? 'bg-[#4ecdc4]/20' : 'bg-white/10'
          }`}>
            {isOffRoute ? (
              <p className="font-['Wittgenstein',sans-serif] text-[11px] text-white font-bold drop-shadow-md">
                ⚠️ 경로 이탈 {distanceFromRoute}m
              </p>
            ) : isUserArrived ? (
              <button
                onClick={handleFinishRoute}
                className="font-['Wittgenstein',sans-serif] text-[11px] text-white font-bold hover:underline drop-shadow-md"
              >
                🎉 도착! [결과 보기]
              </button>
            ) : null}
          </div>
        </div>

        {/* 우측 상단 레이어 컨트롤 */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-3">
          <LayerControl
            mapStyle={mapStyle} isLayerPopoverOpen={isLayerPopoverOpen} setIsLayerPopoverOpen={setIsLayerPopoverOpen}
            is3DBuildingsEnabled={is3DBuildingsEnabled} isSubwayLinesEnabled={isSubwayLinesEnabled} isBusLinesEnabled={isBusLinesEnabled}
            onStyleChange={handleStyleChange} on3DBuildingsToggle={handle3DBuildingsToggle} onSubwayLinesToggle={handleSubwayLinesToggle}
            onBusLinesToggle={handleBusLinesToggle} layerButtonRef={layerButtonRef} popoverRef={popoverRef}
          />
          <button onClick={() => navigator.geolocation.getCurrentPosition(p => mapViewRef.current?.map?.flyTo({ center: [p.coords.longitude, p.coords.latitude], zoom: 15 }))} className="bg-white/20 backdrop-blur-xl size-10 rounded-2xl flex items-center justify-center border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:scale-110 active:scale-95 transition-all">🎯</button>
              </div>

        {/* 캐릭터 렌더링 */}
        {userPosition && <MovingCharacter map={mapViewRef.current?.map || null} color="green" botId={0} currentPosition={userPosition} status={userCurrentStatus} skipInterpolation size={64} animationSpeed={150} />}
        {rankingsList.filter(r => r.player !== 'user').map(r => {
          const bots = createRouteResponse?.participants.filter(p => p.type === 'BOT') || [];
          const botId = r.player === 'bot1' ? bots[0]?.bot_id : bots[1]?.bot_id;
          const state = botPositions.get(botId!);
          if (!state?.position) return null;

          // 대기 시간 계산 (arrival_time이 있으면)
          let waitingTimeMinutes: number | undefined;
          if ((state.status === 'WAITING_BUS' || state.status === 'WAITING_SUBWAY') && state.arrival_time) {
            const currentTime = Math.floor(Date.now() / 1000);
            const remainingSeconds = Math.max(0, state.arrival_time - currentTime);
            waitingTimeMinutes = Math.ceil(remainingSeconds / 60);
          }

          return (
            <MovingCharacter
              key={botId}
              map={mapViewRef.current?.map || null}
              color={playerColors[r.player]}
              botId={botId!}
              currentPosition={state.position}
              status={state.status}
              updateInterval={30000}
              size={64}
              animationSpeed={150}
              waitingTimeMinutes={waitingTimeMinutes}
            />
          );
        })}
      </div>

      {/* 하단/좌측 슬라이드 시트 */}
      <div
        className={`${isWebView ? 'w-[400px] h-full' : 'absolute bottom-0 left-0 right-0 rounded-t-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)]'} bg-white/90 backdrop-blur-2xl border-t border-x border-white/50 z-20 transition-all flex flex-col order-2 md:order-1`}
        style={!isWebView ? { height: `${sheetHeight}%` } : {}}
      >
        {!isWebView && (
          <div className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing" onMouseDown={e => handleDragStart(e.clientY)} onTouchStart={e => handleDragStart(e.touches[0].clientY)}>
            <div className="w-12 h-1.5 bg-white/40 backdrop-blur-sm rounded-full border border-white/30 shadow-sm" />
    </div>
        )}

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-24">
          {bottomSheetView === 'route' ? (
            <>
              {/* 순위 카드 선택 기능 연결 */}
              <div className="relative pt-4">
                <HorizontalRanking
                  rankings={rankingsList}
                  playerColors={playerColors}
                  selectedPlayer={selectedPlayer}
                  onSelect={(player) => {
                    setSelectedPlayer(player);
                    setIsRouteInfoExpanded(false);
                  }}
                  isExpanded={isRouteInfoExpanded}
                  onToggleExpand={() => setIsRouteInfoExpanded(!isRouteInfoExpanded)}
                />
        </div>

              {/* 선택된 플레이어의 타임라인 표시 (토글) */}
              {isRouteInfoExpanded && (
                <div className="mt-4">
                  <RouteTimeline
                    legs={selectedLegData?.legs || []}
                    isLoading={isLoadingDetails || !selectedLegData}
                    playerColor={playerColors[selectedPlayer]}
                    totalTime={selectedLegData?.totalTime || 0}
                    totalDistance={selectedLegData?.totalDistance || 0}
                    totalWalkTime={selectedLegData?.totalWalkTime || 0}
                    totalWalkDistance={selectedLegData?.totalWalkDistance || 0}
                    transferCount={selectedLegData?.transferCount || 0}
                    pathType={selectedLegData?.pathType}
                  />
                </div>
              )}
            </>
          ) : (
            <RealtimeInfoContent
              rankings={rankingsList}
              playerColors={playerColors}
              simulationStartTime={simulationStartTime}
              distanceToDestination={distanceToDestination}
              isOffRoute={isOffRoute}
              distanceFromRoute={distanceFromRoute}
              isGpsTracking={isGpsTracking}
              isGpsTestMode={isGpsTestMode}
              botPositions={botPositions}
              departureName={departure?.name}
              arrivalName={arrival?.name}
              createRouteResponse={createRouteResponse}
              userProgress={playerProgress.get('user') || 0}
              userTotalTime={userLegData?.totalTime || 0}
              chartData={chartData}
            />
          )}
          </div>

        <div className="p-4 bg-white/20 backdrop-blur-xl border-t border-white/30 space-y-3">
          {/* 경주 진행 중 버튼 */}
            <button
              onClick={handleFinishRoute}
            disabled={!rankingsList.every(r => r.progress >= 1)}
            className="w-full h-16 rounded-[24px] bg-[#FFD93D]/80 backdrop-blur-sm text-black font-bold text-[18px] shadow-lg shadow-[#FFD93D]/30 border border-[#FFD93D]/50 disabled:bg-white/10 disabled:text-gray-400 disabled:shadow-none disabled:border-white/20 transition-all active:scale-95"
          >
            {rankingsList.every(r => r.progress >= 1) ? '도착 완료! 🚀' : '경주 진행 중... ⏳'}
            </button>

          {/* 하단 버튼들 */}
          <div className="flex gap-2">
      <button
        onClick={handleCancelRoute}
              className="flex-1 h-12 rounded-[16px] bg-white/20 backdrop-blur-xl text-gray-800 font-bold text-[14px] border border-white/30 shadow-sm transition-all active:scale-95 hover:bg-white/30"
            >
              경로 취소
      </button>
          <button
              onClick={() => setBottomSheetView('realtime')}
              className={`flex-1 h-12 rounded-[16px] font-bold text-[14px] transition-all active:scale-95 backdrop-blur-xl border ${
                bottomSheetView === 'realtime'
                  ? 'bg-[#FFD93D]/80 text-black shadow-lg shadow-[#FFD93D]/30 border-[#FFD93D]/50'
                  : 'bg-white/20 text-gray-800 border-white/30 shadow-sm hover:bg-white/30'
              }`}
            >
              실시간정보
          </button>
          <button
              onClick={() => setBottomSheetView('route')}
              className={`flex-1 h-12 rounded-[16px] font-bold text-[14px] transition-all active:scale-95 backdrop-blur-xl border ${
                bottomSheetView === 'route'
                  ? 'bg-[#FFD93D]/80 text-black shadow-lg shadow-[#FFD93D]/30 border-[#FFD93D]/50'
                  : 'bg-white/20 text-gray-800 border-white/30 shadow-sm hover:bg-white/30'
              }`}
            >
              노선정보
          </button>
        </div>
      </div>
        </div>

      <BusInputModal isOpen={showBusInputModal} busNumberInput={busNumberInput} setBusNumberInput={setBusNumberInput} trackedBusNumbers={trackedBusNumbers} onConfirm={handleBusInputConfirm} onCancel={handleBusInputCancel} />
      <ResultPopup isOpen={showResultPopup} onClose={() => setShowResultPopup(false)} result={routeResult} isLoading={isLoadingResult} onNavigate={onNavigate} onOpenDashboard={onOpenDashboard} />

      {/* 도착 5분 전 알림 */}
      {arrivalAlert && (
        <ArrivalAlert
          playerName={arrivalAlert.name}
          remainingMinutes={arrivalAlert.remainingMinutes}
          onClose={() => setArrivalAlert(null)}
        />
      )}
    </div>
  );
}
