import { ResultPopup } from "@/app/components/ResultPopup";
import { MovingCharacter, type CharacterColor } from "@/components/MovingCharacter";
import { useRouteSSE } from "@/hooks/useRouteSSE";
import { ROUTE_COLORS } from "@/mocks/routeData";
import { getRouteLegDetail, updateRouteStatus } from "@/services/routeService";
import { PLAYER_ICONS, PLAYER_LABELS, useRouteStore, type Player } from "@/stores/routeStore";
import { metersToKilometers, MODE_ICONS, secondsToMinutes, type BotStatusUpdateEvent, type RouteResultResponse } from "@/types/route";
import * as turf from "@turf/turf";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapView, type EndpointMarker, type MapViewRef, type RouteLineInfo } from "./MapView";

type PageType = "map" | "search" | "favorites" | "subway" | "route" | "routeDetail" | "background";

interface RouteDetailPageProps {
  onBack?: () => void;
  onNavigate?: (page: PageType) => void;
  onOpenDashboard?: () => void;
}

export function RouteDetailPage({ onBack, onNavigate, onOpenDashboard }: RouteDetailPageProps) {
  // 경로 상태 스토어
  const {
    searchResponse,
    departure,
    arrival,
    assignments,
    legDetails,
    setLegDetail,
    userRouteId,
    createRouteResponse,
  } = useRouteStore();

  const [sheetHeight, setSheetHeight] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapViewRef = useRef<MapViewRef>(null);
  const [isWebView, setIsWebView] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // SSE 관련 상태
  const [botPositions, setBotPositions] = useState<Map<number, BotStatusUpdateEvent>>(new Map());

  // SSE 연결 (createRouteResponse에서 route_itinerary_id 가져옴)
  const activeRouteId = createRouteResponse?.route_itinerary_id || null;
  const { botStates } = useRouteSSE(
    activeRouteId,
    {
      onConnected: (data) => {
        console.log('✅ SSE 연결됨:', data.message);
      },
      onBotStatusUpdate: (data) => {
        console.log(`🤖 봇 ${data.bot_id} 위치 업데이트:`, {
          position: data.position,
          status: data.status,
          vehicle: data.vehicle,
          progress: data.progress_percent
        });
        setBotPositions((prev) => {
          const next = new Map(prev);
          next.set(data.bot_id, data);
          return next;
        });
      },
      onBotBoarding: (data) => {
        console.log(`🚌 봇 ${data.bot_id} 탑승:`, data.station_name);
      },
      onBotAlighting: (data) => {
        console.log(`🚶 봇 ${data.bot_id} 하차:`, data.station_name);
      },
      onParticipantFinished: (data) => {
        console.log(`🏁 참가자 도착! 순위: ${data.rank}위`);
      },
      onRouteEnded: (data) => {
        console.log(`🎉 경주 종료: ${data.reason}`);
      },
      onError: (error) => {
        console.error('❌ SSE 에러:', error.message);
      },
    }
  );

  // SSE botStates 동기화
  useEffect(() => {
    if (botStates.size > 0) {
      setBotPositions(new Map(botStates));
    }
  }, [botStates]);

  // 경주 결과 상태
  const [routeResult, setRouteResult] = useState<RouteResultResponse | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);

  // 시뮬레이션 상태
  const [isSimulating, setIsSimulating] = useState(false);
  const [playerProgress, setPlayerProgress] = useState<Map<Player, number>>(
    new Map([['user', 0], ['bot1', 0], ['bot2', 0]])
  );
  const [finishTimes, setFinishTimes] = useState<Map<Player, number>>(new Map()); // 도착 시간 기록
  const simulationRef = useRef<number | null>(null);
  const lastUpdateTime = useRef<number>(0);

  // GPS 추적 상태
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [distanceToDestination, setDistanceToDestination] = useState<number | null>(null);
  const [distanceFromRoute, setDistanceFromRoute] = useState<number | null>(null);
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [isUserArrived, setIsUserArrived] = useState(false);
  const [isGpsTracking, setIsGpsTracking] = useState(false);
  const gpsWatchId = useRef<number | null>(null);

  // GPS 테스트 모드 (가짜 GPS로 경로 따라 자동 이동)
  const [isGpsTestMode, setIsGpsTestMode] = useState(false);
  const [_gpsTestProgress, setGpsTestProgress] = useState(0);
  const gpsTestRef = useRef<number | null>(null);
  const gpsTestLastUpdate = useRef<number>(0);
  const [isLayerPopoverOpen, setIsLayerPopoverOpen] = useState(false);
  const layerButtonRef = useRef<HTMLButtonElement>(null);
  const layerPopoverRef = useRef<HTMLDivElement>(null);

  // 도착 판정 기준 (미터)
  const ARRIVAL_THRESHOLD = 20;
  const OFF_ROUTE_THRESHOLD = 20;

  // 웹/앱 화면 감지
  useEffect(() => {
    const checkViewport = () => {
      setIsWebView(window.innerWidth > 768);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // 경로 상세 정보 로드
  useEffect(() => {
    const loadRouteDetails = async () => {
      if (assignments.size === 0) return;

      setIsLoadingDetails(true);

      try {
        // 모든 할당된 경로의 상세 정보 로드
        const promises: Promise<void>[] = [];

        for (const [, routeLegId] of assignments) {
          // 이미 캐시에 있으면 스킵
          if (legDetails.has(routeLegId)) continue;

          promises.push(
            getRouteLegDetail(routeLegId).then((detail) => {
              setLegDetail(routeLegId, detail);
            })
          );
        }

        await Promise.all(promises);
      } catch (error) {
        console.error("경로 상세 정보 로드 실패:", error);
      } finally {
        setIsLoadingDetails(false);
      }
    };

    loadRouteDetails();
  }, [assignments]);

  // 지도에 표시할 경로 라인 생성
  const routeLines = useMemo<RouteLineInfo[]>(() => {
    const lines: RouteLineInfo[] = [];

    for (const [player, routeLegId] of assignments) {
      const detail = legDetails.get(routeLegId);
      if (!detail) continue;

      // 경로 인덱스로 색상 결정
      const legIndex = searchResponse?.legs.findIndex(
        (leg) => leg.route_leg_id === routeLegId
      ) ?? 0;
      const colorScheme = ROUTE_COLORS[legIndex % ROUTE_COLORS.length];

      // 각 구간(leg)의 좌표를 모아서 하나의 라인으로 생성
      const allCoordinates: [number, number][] = [];

      for (const leg of detail.legs) {
        // passShape가 있으면 사용 (대중교통 구간)
        if (leg.passShape?.linestring) {
          const points = leg.passShape.linestring.split(' ');
          for (const point of points) {
            const [lon, lat] = point.split(',').map(Number);
            if (!isNaN(lon) && !isNaN(lat)) {
              allCoordinates.push([lon, lat]);
            }
          }
        } else {
          // passShape가 없으면 시작점과 끝점만 추가 (도보 구간)
          allCoordinates.push([leg.start.lon, leg.start.lat]);
          allCoordinates.push([leg.end.lon, leg.end.lat]);
        }
      }

      if (allCoordinates.length > 0) {
        lines.push({
          id: `route-${player}`,
          coordinates: allCoordinates,
          color: colorScheme.line,
          width: player === 'user' ? 6 : 4,
          opacity: player === 'user' ? 1 : 0.7,
        });
      }
    }

    return lines;
  }, [assignments, legDetails, searchResponse]);

  // 출발지/도착지 마커 생성
  const endpoints = useMemo<EndpointMarker[]>(() => {
    const markers: EndpointMarker[] = [];

    if (departure) {
      markers.push({
        type: 'departure',
        coordinates: [departure.lon, departure.lat],
        name: departure.name,
      });
    }

    if (arrival) {
      markers.push({
        type: 'arrival',
        coordinates: [arrival.lon, arrival.lat],
        name: arrival.name,
      });
    }

    return markers;
  }, [departure, arrival]);

  // 경로 좌표로 turf LineString 생성
  const getRouteLineString = useCallback((player: Player) => {
    const routeLegId = assignments.get(player);
    if (!routeLegId) return null;

    const detail = legDetails.get(routeLegId);
    if (!detail) return null;

    const allCoordinates: [number, number][] = [];

    for (const leg of detail.legs) {
      if (leg.passShape?.linestring) {
        const points = leg.passShape.linestring.split(' ');
        for (const point of points) {
          const [lon, lat] = point.split(',').map(Number);
          if (!isNaN(lon) && !isNaN(lat)) {
            allCoordinates.push([lon, lat]);
          }
        }
      } else {
        allCoordinates.push([leg.start.lon, leg.start.lat]);
        allCoordinates.push([leg.end.lon, leg.end.lat]);
      }
    }

    if (allCoordinates.length < 2) return null;
    return turf.lineString(allCoordinates);
  }, [assignments, legDetails]);

  // 진행률로 경로 상 위치 계산
  const getPositionOnRoute = useCallback((player: Player, progress: number): [number, number] | null => {
    const line = getRouteLineString(player);
    if (!line) return null;

    const totalLength = turf.length(line, { units: 'meters' });
    const targetDistance = totalLength * Math.min(progress, 1);
    const point = turf.along(line, targetDistance, { units: 'meters' });

    return point.geometry.coordinates as [number, number];
  }, [getRouteLineString]);

  // 사용자 도착 처리 (백엔드에 FINISHED 전송, 팝업은 표시하지 않음)
  // 봇 시뮬레이션은 계속 진행됨
  const handleUserArrived = useCallback(async () => {
    const routeId = userRouteId || 1;

    try {
      // 유저 경주 상태를 FINISHED로 변경 (봇 시뮬레이션은 계속)
      await updateRouteStatus(routeId, { status: 'FINISHED' });
      console.log('🏁 사용자 도착 완료! 봇 시뮬레이션 계속 관전 중...');
    } catch (error) {
      console.error('사용자 도착 처리 실패:', error);
    }
  }, [userRouteId]);

  // GPS 위치 업데이트 처리
  const handlePositionUpdate = useCallback((position: GeolocationPosition) => {
    const { longitude, latitude } = position.coords;
    const currentLocation: [number, number] = [longitude, latitude];
    setUserLocation(currentLocation);

    // 도착지까지 거리 계산
    if (arrival) {
      const destPoint = turf.point([arrival.lon, arrival.lat]);
      const userPoint = turf.point(currentLocation);
      const distance = turf.distance(userPoint, destPoint, { units: 'meters' });
      setDistanceToDestination(Math.round(distance));

      // 20m 이내 진입 시 도착 처리
      if (distance <= ARRIVAL_THRESHOLD && !isUserArrived) {
        setIsUserArrived(true);
        setPlayerProgress((prev) => {
          const newProgress = new Map(prev);
          newProgress.set('user', 1);
          return newProgress;
        });
        // 도착 시간 기록
        setFinishTimes((prevTimes) => {
          if (!prevTimes.has('user')) {
            const newTimes = new Map(prevTimes);
            newTimes.set('user', Date.now());
            return newTimes;
          }
          return prevTimes;
        });
        // 백엔드에 사용자 도착 완료 전송 (봇 시뮬레이션은 계속)
        handleUserArrived();
      }
    }

    // 경로 이탈 감지
    const userRouteLine = getRouteLineString('user');
    if (userRouteLine) {
      const userPoint = turf.point(currentLocation);
      const distFromRoute = turf.pointToLineDistance(userPoint, userRouteLine, { units: 'meters' });
      setDistanceFromRoute(Math.round(distFromRoute));
      setIsOffRoute(distFromRoute > OFF_ROUTE_THRESHOLD);
    }

    // 유저의 진행률 계산 (출발지 기준)
    if (departure && arrival && userRouteLine) {
      const totalDistance = turf.length(userRouteLine, { units: 'meters' });
      const startPoint = turf.point([departure.lon, departure.lat]);
      const userPoint = turf.point(currentLocation);

      // 경로 상에서 가장 가까운 점 찾기
      const nearestPoint = turf.nearestPointOnLine(userRouteLine, userPoint);
      const distanceFromStart = turf.distance(startPoint, nearestPoint, { units: 'meters' });

      const progress = Math.min(distanceFromStart / totalDistance, 1);
      setPlayerProgress((prev) => {
        const newProgress = new Map(prev);
        newProgress.set('user', progress);
        return newProgress;
      });
    }
  }, [arrival, departure, isUserArrived, getRouteLineString, handleUserArrived]);

  // GPS 추적 시작
  const startGpsTracking = useCallback(() => {
    if (!navigator.geolocation) {
      alert('이 브라우저는 GPS를 지원하지 않습니다.');
      return;
    }

    setIsGpsTracking(true);

    gpsWatchId.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      (error) => {
        console.error('GPS 오류:', error.message);
        if (error.code === error.PERMISSION_DENIED) {
          alert('위치 권한이 거부되었습니다. 설정에서 권한을 허용해주세요.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, [handlePositionUpdate]);

  // GPS 추적 중지
  const stopGpsTracking = useCallback(() => {
    setIsGpsTracking(false);
    if (gpsWatchId.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchId.current);
      gpsWatchId.current = null;
    }
  }, []);

  // 컴포넌트 언마운트 시 GPS 추적 중지
  useEffect(() => {
    return () => {
      if (gpsWatchId.current !== null) {
        navigator.geolocation.clearWatch(gpsWatchId.current);
      }
      if (gpsTestRef.current !== null) {
        cancelAnimationFrame(gpsTestRef.current);
      }
    };
  }, []);

  // GPS 테스트 모드: 가짜 GPS 위치 업데이트
  const updateTestGpsPosition = useCallback((progress: number) => {
    const userRouteLine = getRouteLineString('user');
    if (!userRouteLine) return;

    // 경로 상 현재 위치 계산
    const totalLength = turf.length(userRouteLine, { units: 'meters' });
    const currentDistance = totalLength * progress;
    const currentPoint = turf.along(userRouteLine, currentDistance, { units: 'meters' });
    const currentLocation = currentPoint.geometry.coordinates as [number, number];

    // 약간의 GPS 오차 추가 (±5m)
    const jitter = 0.00005; // 약 5m
    const jitteredLocation: [number, number] = [
      currentLocation[0] + (Math.random() - 0.5) * jitter,
      currentLocation[1] + (Math.random() - 0.5) * jitter,
    ];

    setUserLocation(jitteredLocation);

    // 도착지까지 거리 계산
    if (arrival) {
      const destPoint = turf.point([arrival.lon, arrival.lat]);
      const userPoint = turf.point(jitteredLocation);
      const distance = turf.distance(userPoint, destPoint, { units: 'meters' });
      setDistanceToDestination(Math.round(distance));

      // 20m 이내 도착 처리
      if (distance <= ARRIVAL_THRESHOLD && !isUserArrived) {
        setIsUserArrived(true);
        setPlayerProgress((prev) => {
          const newProgress = new Map(prev);
          newProgress.set('user', 1);
          return newProgress;
        });
        // 도착 시간 기록
        setFinishTimes((prevTimes) => {
          if (!prevTimes.has('user')) {
            const newTimes = new Map(prevTimes);
            newTimes.set('user', Date.now());
            return newTimes;
          }
          return prevTimes;
        });
        stopGpsTestMode();
        // 백엔드에 사용자 도착 완료 전송 (봇 시뮬레이션은 계속)
        handleUserArrived();
      }
    }

    // 경로 이탈 감지 (테스트 모드에서는 jitter로 인해 가끔 이탈할 수 있음)
    const userPoint = turf.point(jitteredLocation);
    const distFromRoute = turf.pointToLineDistance(userPoint, userRouteLine, { units: 'meters' });
    setDistanceFromRoute(Math.round(distFromRoute));
    setIsOffRoute(distFromRoute > OFF_ROUTE_THRESHOLD);

    // 유저 진행률 업데이트
    setPlayerProgress((prev) => {
      const newProgress = new Map(prev);
      newProgress.set('user', progress);
      return newProgress;
    });
  }, [arrival, isUserArrived, getRouteLineString, handleUserArrived]);

  // GPS 테스트 모드 시작
  const startGpsTestMode = useCallback(() => {
    if (isGpsTestMode || isGpsTracking) return;

    // 실제 GPS 추적 중지
    stopGpsTracking();

    setIsGpsTestMode(true);
    setGpsTestProgress(0);
    gpsTestLastUpdate.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - gpsTestLastUpdate.current) / 1000;
      gpsTestLastUpdate.current = now;

      setGpsTestProgress((prev) => {
        const speed = 0.015; // 1초당 1.5% (시뮬레이션보다 약간 느림)
        const newProgress = Math.min(prev + speed * deltaTime, 1);

        // 위치 업데이트
        updateTestGpsPosition(newProgress);

        if (newProgress >= 1) {
          return 1;
        }
        return newProgress;
      });

      gpsTestRef.current = requestAnimationFrame(animate);
    };

    gpsTestRef.current = requestAnimationFrame(animate);
  }, [isGpsTestMode, isGpsTracking, stopGpsTracking, updateTestGpsPosition]);

  // GPS 테스트 모드 중지
  const stopGpsTestMode = useCallback(() => {
    setIsGpsTestMode(false);
    if (gpsTestRef.current !== null) {
      cancelAnimationFrame(gpsTestRef.current);
      gpsTestRef.current = null;
    }
  }, []);

  // GPS 테스트 모드 리셋
  const resetGpsTestMode = useCallback(() => {
    stopGpsTestMode();
    setGpsTestProgress(0);
    setUserLocation(null);
    setDistanceToDestination(null);
    setDistanceFromRoute(null);
    setIsOffRoute(false);
    setIsUserArrived(false);
    setPlayerProgress((prev) => {
      const newProgress = new Map(prev);
      newProgress.set('user', 0);
      return newProgress;
    });
    // 유저 도착 시간도 초기화
    setFinishTimes((prev) => {
      if (prev.has('user')) {
        const newTimes = new Map(prev);
        newTimes.delete('user');
        return newTimes;
      }
      return prev;
    });
  }, [stopGpsTestMode]);

  // 시뮬레이션 시작
  const startSimulation = useCallback(() => {
    if (isSimulating) return;

    setIsSimulating(true);
    const now = Date.now();
    lastUpdateTime.current = now;
    setSimulationStartTime(now); // 시뮬레이션 시작 시간 기록

    // 플레이어별 속도 (봇들은 약간씩 다르게)
    const speeds: Record<Player, number> = {
      user: 0.02,   // 1초당 2% 진행
      bot1: 0.018,  // 1초당 1.8% 진행
      bot2: 0.022,  // 1초당 2.2% 진행
    };

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastUpdateTime.current) / 1000; // 초 단위
      lastUpdateTime.current = now;

      setPlayerProgress((prev) => {
        const newProgress = new Map(prev);

      // 도착 처리
      if (progress >= 1) {
        console.log('🏁 사용자 도착! 봇 시뮬레이션 계속 관전...');
        setIsUserArrived(true);
        setFinishTimes((prevTimes) => {
          if (!prevTimes.has('user')) {
            const newTimes = new Map(prevTimes);
            newTimes.set('user', Date.now());
            return newTimes;
          }
        });
        setIsUserAutoMoving(false);
        userAutoMoveRef.current = null;
        // 백엔드에 사용자 도착 완료 전송 (봇 시뮬레이션은 계속)
        handleUserArrived();
        return;
      }

        return newProgress;
      });

    userAutoMoveRef.current = requestAnimationFrame(animate);
  }, [isUserAutoMoving, isGpsTracking, isGpsTestMode, getUserTotalTime, handleUserArrived]);

    simulationRef.current = requestAnimationFrame(animate);
  }, [isSimulating]);

  // 시뮬레이션 정지
  const stopSimulation = useCallback(() => {
    setIsSimulating(false);
    if (simulationRef.current) {
      cancelAnimationFrame(simulationRef.current);
      simulationRef.current = null;
    }
  }, []);

  // 시뮬레이션 리셋
  const resetSimulation = useCallback(() => {
    stopSimulation();
    setPlayerProgress(new Map([['user', 0], ['bot1', 0], ['bot2', 0]]));
    setFinishTimes(new Map()); // 도착 시간 기록도 초기화
    setSimulationStartTime(null); // 시작 시간도 초기화
  }, [stopSimulation]);

  // 시뮬레이션 시작 시간 기록
  const [simulationStartTime, setSimulationStartTime] = useState<number | null>(null);

  // 시뮬레이션 결과를 기반으로 결과 데이터 생성
  const generateResultFromSimulation = useCallback((): RouteResultResponse => {
    const routeId = userRouteId || 1;
    const now = new Date().toISOString();
    const startTime = simulationStartTime ? new Date(simulationStartTime).toISOString() : now;

    // createRouteResponse에서 실제 봇 정보 가져오기
    const bot1Participant = createRouteResponse?.participants.find(p => p.type === 'BOT' && p.name === 'Bot 1');
    const bot2Participant = createRouteResponse?.participants.find(p => p.type === 'BOT' && p.name === 'Bot 2');

    // 봇 participants가 없을 때 fallback (순서대로 가져오기)
    const botParticipants = createRouteResponse?.participants.filter(p => p.type === 'BOT') || [];

    // 플레이어 정보 매핑 (실제 route_id 사용)
    const playerInfo: Record<Player, { route_id: number; bot_id: number | null; name: string }> = {
      user: { route_id: routeId, bot_id: null, name: '나' },
      bot1: {
        route_id: bot1Participant?.route_id || botParticipants[0]?.route_id || 101,
        bot_id: bot1Participant?.bot_id || botParticipants[0]?.bot_id || 1,
        name: bot1Participant?.name || botParticipants[0]?.name || 'Bot 1'
      },
      bot2: {
        route_id: bot2Participant?.route_id || botParticipants[1]?.route_id || 102,
        bot_id: bot2Participant?.bot_id || botParticipants[1]?.bot_id || 2,
        name: bot2Participant?.name || botParticipants[1]?.name || 'Bot 2'
      },
    };

    // 도착 시간 기반으로 순위 계산
    const players: Player[] = ['user', 'bot1', 'bot2'];
    const results = players.map((player) => {
      const finishTime = finishTimes.get(player);
      const progress = playerProgress.get(player) || 0;

      // duration 계산 (시뮬레이션 시작 시간부터 도착 시간까지, 초 단위)
      let duration: number | null = null;
      if (finishTime && simulationStartTime) {
        duration = Math.round((finishTime - simulationStartTime) / 1000);
      } else if (progress >= 1 && simulationStartTime) {
        // 이미 도착했지만 finishTime이 없는 경우 현재 시간 기준
        duration = Math.round((Date.now() - simulationStartTime) / 1000);
      }

      return {
        player,
        progress,
        finishTime,
        duration,
        ...playerInfo[player],
      };
    });

    // 순위 정렬: 도착한 사람은 duration 순, 미도착은 progress 순
    results.sort((a, b) => {
      const aFinished = a.progress >= 1;
      const bFinished = b.progress >= 1;

      if (aFinished && bFinished) {
        return (a.duration || Infinity) - (b.duration || Infinity);
      }
      if (aFinished && !bFinished) return -1;
      if (!aFinished && bFinished) return 1;
      return b.progress - a.progress;
    });

    // 순위 매기기
    const rankings = results.map((r, index) => ({
      rank: index + 1,
      route_id: r.route_id,
      type: r.player === 'user' ? 'USER' as const : 'BOT' as const,
      duration: r.duration,
      end_time: r.finishTime ? new Date(r.finishTime).toISOString() : null,
      user_id: r.player === 'user' ? 1 : null,
      bot_id: r.bot_id,
      name: r.name,
    }));

    // 유저 결과 찾기
    const userRanking = rankings.find(r => r.type === 'USER');
    const userRank = userRanking?.rank || null;
    const isWin = userRank === 1;

    console.log('시뮬레이션 결과 생성:', { rankings, userRank, isWin });

    return {
      route_id: routeId,
      route_itinerary_id: 1,
      status: 'FINISHED',
      start_time: startTime,
      end_time: now,
      route_info: {
        departure: departure ? { name: departure.name, lat: departure.lat, lon: departure.lon } : { name: null, lat: null, lon: null },
        arrival: arrival ? { name: arrival.name, lat: arrival.lat, lon: arrival.lon } : { name: null, lat: null, lon: null },
      },
      rankings,
      user_result: {
        rank: userRank,
        is_win: isWin,
        duration: userRanking?.duration || null,
      },
    };
  }, [userRouteId, simulationStartTime, finishTimes, playerProgress, departure, arrival, createRouteResponse]);


  // 도착 완료 처리 (상태 변경 + 결과 생성 + 팝업 표시)
  const handleFinishRoute = useCallback(async () => {
    const routeId = userRouteId || 1;

    setShowResultPopup(true);
    setIsLoadingResult(true);

    try {
      // 시뮬레이션 결과 기반으로 결과 데이터 생성
      const result = generateResultFromSimulation();
      setRouteResult(result);
    } catch (error) {
      console.error('결과 생성 실패:', error);
      // 에러 발생해도 시뮬레이션 결과 표시
      const result = generateResultFromSimulation();
      setRouteResult(result);
    } finally {
      setIsLoadingResult(false);
    }
  }, [userRouteId, generateResultFromSimulation]);

  // 경주 취소 처리
  const handleCancelRoute = useCallback(async () => {
    const routeId = userRouteId || 1;

    try {
      // 유저 경주 상태를 CANCELED로 변경 (백엔드에서 봇들도 자동으로 CANCELED 처리)
      await updateRouteStatus(routeId, { status: 'CANCELED' });
      console.log('경주 상태 변경 완료: CANCELED (유저 + 봇 모두)');

      // 이전 페이지로 이동
      onBack?.();
    } catch (error) {
      console.error('경주 취소 실패:', error);
      // 실패해도 이전 페이지로 이동
      onBack?.();
    }
  }, [userRouteId, onBack]);

  // 결과 팝업 열기 (GPS/시뮬레이션으로 자동 도착 시 사용)
  const openResultPopup = useCallback(async () => {
    await handleFinishRoute();
  }, [handleFinishRoute]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        cancelAnimationFrame(simulationRef.current);
      }
    };
  }, []);

  // 플레이어 마커 생성 (GPS 또는 시뮬레이션 위치 기반)
  // 주석: MovingCharacter로 대체하여 사용하지 않음
  // const playerMarkers = useMemo<PlayerMarker[]>(() => {
  //   const markers: PlayerMarker[] = [];
  //   const players: Player[] = ['user', 'bot1', 'bot2'];

  //   players.forEach((player) => {
  //     let position: [number, number] | null = null;

  //     // 유저: GPS 추적 중이면 실제 위치 사용, 아니면 시뮬레이션 위치
  //     if (player === 'user' && isGpsTracking && userLocation) {
  //       position = userLocation;
  //     } else {
  //       const progress = playerProgress.get(player) || 0;
  //       position = getPositionOnRoute(player, progress);
  //     }

  //     if (position) {
  //       const routeLegId = assignments.get(player);
  //       const legIndex = searchResponse?.legs.findIndex(
  //         (leg) => leg.route_leg_id === routeLegId
  //       ) ?? 0;
  //       const colorScheme = ROUTE_COLORS[legIndex % ROUTE_COLORS.length];

  //       markers.push({
  //         id: player,
  //         coordinates: position,
  //         icon: PLAYER_ICONS[player],
  //         color: colorScheme.bg,
  //         label: player === 'user' ? '나' : PLAYER_LABELS[player],
  //       });
  //     }
  //   });

  //   return markers;
  // }, [playerProgress, getPositionOnRoute, assignments, searchResponse, isGpsTracking, userLocation]);

  // 순위 계산 (도착한 플레이어는 도착 시간순, 미도착 플레이어는 진행률순)
  const rankings = useMemo(() => {
    const players: Player[] = ['user', 'bot1', 'bot2'];
    return players
      .map((player) => ({
        player,
        progress: playerProgress.get(player) || 0,
        finishTime: finishTimes.get(player),
      }))
      .sort((a, b) => {
        const aFinished = a.progress >= 1;
        const bFinished = b.progress >= 1;

        // 둘 다 도착한 경우: 도착 시간 순 (빨리 도착한 사람이 위)
        if (aFinished && bFinished) {
          const aTime = a.finishTime || Infinity;
          const bTime = b.finishTime || Infinity;
          return aTime - bTime;
        }

        // 한 명만 도착한 경우: 도착한 사람이 위
        if (aFinished && !bFinished) return -1;
        if (!aFinished && bFinished) return 1;

        // 둘 다 미도착: 진행률 순
        return b.progress - a.progress;
      });
  }, [playerProgress, finishTimes]);

  // 모든 플레이어가 도착했는지 확인
  const allPlayersFinished = useMemo(() => {
    const players: Player[] = ['user', 'bot1', 'bot2'];
    return players.every((player) => (playerProgress.get(player) || 0) >= 1);
  }, [playerProgress]);

  // 드래그 시작
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setStartHeight(sheetHeight);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  // 드래그 중
  const handleDragMove = (clientY: number) => {
    if (!isDragging || !containerRef.current) return;

    const containerHeight = containerRef.current.clientHeight;
    const deltaY = startY - clientY;
    const deltaPercent = (deltaY / containerHeight) * 100;
    const newHeight = Math.max(35, Math.min(85, startHeight + deltaPercent));

    setSheetHeight(newHeight);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // 전역 이벤트 리스너
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      handleDragMove(e.touches[0].clientY);
    };

    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchmove", handleGlobalTouchMove);
    window.addEventListener("touchend", handleGlobalTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("touchend", handleGlobalTouchEnd);
    };
  }, [isDragging, startY, startHeight]);

  // 캐릭터 색상 매핑 (user: green, bot1: purple, bot2: yellow)
  const PLAYER_COLORS: Record<Player, CharacterColor> = {
    user: 'green',
    bot1: 'purple',
    bot2: 'yellow',
  };

  // 봇 목록 (SSE로부터 받은 botPositions)
  const botList = Array.from(botPositions.entries()).map(([botId, state]) => ({
    botId,
    state,
    // bot1 = id 1, bot2 = id 2
    player: botId === 1 ? 'bot1' as Player : 'bot2' as Player,
  }));

  // user의 현재 위치 계산 (GPS 추적 중이면 실제 위치, 아니면 시뮬레이션 위치)
  const userPosition = useMemo(() => {
    if (isGpsTracking && userLocation) {
      // GPS 추적 중: 실제 GPS 위치 사용
      return { lon: userLocation[0], lat: userLocation[1] };
    } else {
      // 시뮬레이션: 진행률 기반 위치 계산
      const progress = playerProgress.get('user') || 0;
      const pos = getPositionOnRoute('user', progress);
      if (pos) {
        return { lon: pos[0], lat: pos[1] };
      }
    }
    return null;
  }, [isGpsTracking, userLocation, playerProgress, getPositionOnRoute]);

  // 내 위치로 이동 (RouteDetailPage용)
  const handleMyLocation = useCallback(() => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance) return;

    if (userLocation) {
      // 이미 위치가 있으면 그곳으로 이동
      mapInstance.flyTo({
        center: userLocation,
        zoom: 15,
        duration: 1500,
      });
    } else if (isGpsTracking || isGpsTestMode) {
      // GPS 추적 중이면 현재 위치 가져오기
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            const coords: [number, number] = [longitude, latitude];
            setUserLocation(coords);
            mapInstance.flyTo({
              center: coords,
              zoom: 15,
              duration: 1500,
            });
          },
          (error) => {
            console.error('위치 가져오기 실패:', error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      }
    } else {
      // GPS 추적이 꺼져있으면 경로의 시작점으로 이동
      if (departure) {
        mapInstance.flyTo({
          center: [departure.lon, departure.lat],
          zoom: 15,
          duration: 1500,
        });
      }
    }
  }, [userLocation, isGpsTracking, isGpsTestMode, departure]);

  // 레이어 팝오버 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isLayerPopoverOpen &&
        layerPopoverRef.current &&
        layerButtonRef.current &&
        !layerPopoverRef.current.contains(event.target as Node) &&
        !layerButtonRef.current.contains(event.target as Node)
      ) {
        setIsLayerPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLayerPopoverOpen]);

  // 지도 컨텐츠
  const mapContent = (
    <>
      <MapView
        ref={mapViewRef}
        currentPage="routeDetail"
        routeLines={routeLines}
        endpoints={endpoints}
        fitToRoutes={routeLines.length > 0}
        onNavigate={onNavigate}
      />

      {/* User 캐릭터 (GPS 또는 시뮬레이션 위치) */}
      {userPosition && (
        <MovingCharacter
          key="user"
          map={mapViewRef.current?.map || null}
          color={PLAYER_COLORS.user}
          botId={0}
          currentPosition={userPosition}
          status="WALKING"
          updateInterval={1000}
          size={64}
          animationSpeed={150}
        />
      )}

      {/* Bot 캐릭터들 (SSE 데이터) */}
      {botList.map(({ botId, state, player }) => (
        <MovingCharacter
          key={botId}
          map={mapViewRef.current?.map || null}
          color={PLAYER_COLORS[player]}
          botId={botId}
          currentPosition={state.position}
          status={state.status}
          updateInterval={5000}
          size={64}
          animationSpeed={150}
        />
      ))}
    </>
  );

  // 플레이어별 경로 정보 가져오기
  const getPlayerRoute = (player: Player) => {
    const routeLegId = assignments.get(player);
    if (!routeLegId) return null;

    const legIndex = searchResponse?.legs.findIndex((leg) => leg.route_leg_id === routeLegId);
    const legSummary = searchResponse?.legs.find((leg) => leg.route_leg_id === routeLegId);
    const legDetail = legDetails.get(routeLegId);

    return {
      routeLegId,
      legIndex: legIndex ?? -1,
      summary: legSummary,
      detail: legDetail,
    };
  };

  // 플레이어 목록
  const players: Player[] = ["user", "bot1", "bot2"];

  // GPS 상태 카드
  const gpsStatusCard = (
    <div className={`rounded-[12px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] px-4 py-3 mb-3 ${
      isOffRoute ? 'bg-[#ff6b6b]' : isUserArrived ? 'bg-[#4ecdc4]' : 'bg-white'
    }`}>
      {/* 경로 이탈 경고 */}
      {isOffRoute && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[18px]">⚠️</span>
          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white font-bold">
            경로에서 {distanceFromRoute}m 이탈했습니다!
          </p>
        </div>
      )}

      {/* 도착 완료 */}
      {isUserArrived && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">🎉</span>
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white font-bold">
              도착 완료! 봇 시뮬레이션 관전 중...
            </p>
          </div>
          <button
            onClick={openResultPopup}
            className="px-3 py-1 bg-white text-[#4ecdc4] rounded-full text-[11px] font-bold hover:bg-gray-100 transition-colors"
          >
            결과 보기
          </button>
        </div>
      )}

      {/* GPS 상태 및 남은 거리 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isGpsTestMode ? 'bg-purple-500 animate-pulse' : isGpsTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`} />
          <p className="font-['Wittgenstein',sans-serif] text-[11px] text-black">
            {isGpsTestMode ? '🧪 테스트 모드' : isGpsTracking ? 'GPS 추적 중' : 'GPS 꺼짐'}
          </p>
        </div>
        {distanceToDestination !== null && (
          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black font-bold">
            🏁 {distanceToDestination >= 1000
              ? `${(distanceToDestination / 1000).toFixed(1)}km`
              : `${distanceToDestination}m`}
          </p>
        )}
      </div>

      {/* GPS 컨트롤 버튼들 */}
      <div className="flex gap-2 mt-2">
        {/* 실제 GPS 버튼 */}
        <button
          onClick={isGpsTracking ? stopGpsTracking : startGpsTracking}
          disabled={isGpsTestMode}
          className={`flex-1 h-[32px] rounded-[8px] border-[2px] border-black shadow-[2px_2px_0px_0px_black] flex items-center justify-center gap-1 transition-all hover:scale-[1.02] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
            isGpsTestMode ? 'bg-gray-300 opacity-50' : isGpsTracking ? 'bg-[#ff6b6b]' : 'bg-[#4ecdc4]'
          }`}
        >
          <span className="text-[12px]">{isGpsTracking ? '📍' : '🛰️'}</span>
          <span className="font-['Wittgenstein',sans-serif] text-[10px] text-black">
            {isGpsTracking ? '중지' : '실제 GPS'}
          </span>
        </button>

        {/* 테스트 모드 버튼 */}
        <button
          onClick={isGpsTestMode ? stopGpsTestMode : startGpsTestMode}
          disabled={isGpsTracking}
          className={`flex-1 h-[32px] rounded-[8px] border-[2px] border-black shadow-[2px_2px_0px_0px_black] flex items-center justify-center gap-1 transition-all hover:scale-[1.02] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
            isGpsTracking ? 'bg-gray-300 opacity-50' : isGpsTestMode ? 'bg-[#ff6b6b]' : 'bg-[#a78bfa]'
          }`}
        >
          <span className="text-[12px]">{isGpsTestMode ? '⏹️' : '🧪'}</span>
          <span className="font-['Wittgenstein',sans-serif] text-[10px] text-black">
            {isGpsTestMode ? '중지' : '테스트'}
          </span>
        </button>

        {/* 리셋 버튼 */}
        <button
          onClick={resetGpsTestMode}
          className="w-[32px] h-[32px] rounded-[8px] border-[2px] border-black shadow-[2px_2px_0px_0px_black] bg-white flex items-center justify-center transition-all hover:scale-[1.02] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        >
          <span className="text-[12px]">🔄</span>
        </button>
      </div>
    </div>
  );

  // 실시간 순위 카드
  const rankingCard = (
    <div className="bg-[#ffd93d] rounded-[12px] border-[3px] border-black shadow-[6px_6px_0px_0px_black] px-[19.366px] pt-[19.366px] pb-[12px]">
      <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black text-center leading-[18px] mb-[12px]">
        실시간 순위 🏆
      </p>

      {/* 순위 목록 */}
      <div className="flex flex-col gap-[7.995px]">
        {rankings.map(({ player, progress }, index) => {
          const route = getPlayerRoute(player);
          const colorScheme = route ? ROUTE_COLORS[route.legIndex % ROUTE_COLORS.length] : ROUTE_COLORS[0];
          const progressPercent = Math.round(progress * 100);

          return (
            <div key={player} className="flex gap-[7.995px] items-center">
              <div className="bg-white w-[45px] h-[26px] border-[3px] border-black flex items-center justify-center">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">
                  {index + 1}위
                </p>
              </div>
              <p className="text-[20px] leading-[28px]">{PLAYER_ICONS[player]}</p>
              <div className="flex-1 bg-white h-[18px] rounded-[4px] border-[3px] border-black overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%`, backgroundColor: colorScheme.bg }}
                />
              </div>
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px] w-[35px] text-right">
                {progressPercent}%
              </p>
            </div>
          );
        })}
      </div>

      {/* 시뮬레이션 컨트롤 버튼 */}
      <div className="flex gap-2 mt-3">
        <button
          onClick={isSimulating ? stopSimulation : startSimulation}
          className={`flex-1 h-[32px] rounded-[8px] border-[2px] border-black shadow-[2px_2px_0px_0px_black] flex items-center justify-center gap-1 transition-all hover:scale-[1.02] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
            isSimulating ? 'bg-[#ff6b6b]' : 'bg-[#4ecdc4]'
          }`}
        >
          <span className="text-[14px]">{isSimulating ? '⏸️' : '▶️'}</span>
          <span className="font-['Wittgenstein',sans-serif] text-[11px] text-black">
            {isSimulating ? '일시정지' : '시뮬레이션'}
          </span>
        </button>
        <button
          onClick={resetSimulation}
          className="w-[32px] h-[32px] rounded-[8px] border-[2px] border-black shadow-[2px_2px_0px_0px_black] bg-white flex items-center justify-center transition-all hover:scale-[1.02] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        >
          <span className="text-[14px]">🔄</span>
        </button>
      </div>
    </div>
  );

  // 경로 카드 생성
  const renderRouteCard = (player: Player) => {
    const route = getPlayerRoute(player);
    if (!route || !route.summary) return null;

    const colorScheme = ROUTE_COLORS[route.legIndex % ROUTE_COLORS.length];
    const timeMinutes = secondsToMinutes(route.summary.totalTime);
    const distanceStr = metersToKilometers(route.summary.totalDistance);
    const isUser = player === "user";

    return (
      <div
        key={player}
        className={`bg-gradient-to-b ${colorScheme.gradient} rounded-[10px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] p-[23.364px]`}
      >
        {/* 헤더 */}
        <div className="flex gap-[11.992px] items-center mb-[16px]">
          <div className="bg-white rounded-[10px] w-[48px] h-[48px] border-[3px] border-black flex items-center justify-center">
            <p className="text-[24px] leading-[36px]">{PLAYER_ICONS[player]}</p>
          </div>
          <div className="flex-1">
            <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[18px] mb-[3.997px]">
              {isUser ? `내 경로 (경로 ${route.legIndex + 1})` : `${PLAYER_LABELS[player]} 경로`}
            </p>
            <div className="flex gap-[3.997px]">
              <div className="bg-[#ffd93d] h-[24px] px-[12px] border-[3px] border-black flex items-center justify-center">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">
                  {timeMinutes}분
                </p>
              </div>
              <div className="bg-white h-[24px] px-[12px] border-[3px] border-black flex items-center justify-center">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">
                  {distanceStr}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 이동 경로 */}
        <div>
          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[15px] mb-[8px]">
            이동 경로
          </p>
          <div className="flex flex-col gap-[12px]">
            {route.detail?.legs.map((leg, legIndex) => (
              <div key={legIndex} className="flex gap-[7.995px] items-start">
                <div className="bg-[#7ed321] w-[27.992px] h-[27.992px] rounded-[4px] border-[3px] border-black flex items-center justify-center shrink-0">
                  <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[15px]">
                    {legIndex + 1}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[14px]">
                    {MODE_ICONS[leg.mode] || "🚶"}{" "}
                    {leg.mode === "WALK"
                      ? `도보 이동 (${metersToKilometers(leg.distance)})`
                      : `${leg.route || leg.mode} (${secondsToMinutes(leg.sectionTime)}분)`}
                  </p>
                  <p className="font-['Wittgenstein',sans-serif] text-[10px] text-white/70 leading-[12px] mt-1">
                    {leg.start.name} → {leg.end.name}
                  </p>
                </div>
              </div>
            ))}
            {!route.detail && isLoadingDetails && (
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white/70">
                경로 정보 로딩 중...
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 경로 카드들
  const routeCards = (
    <div className="flex flex-col gap-[16px]">
      {players.map((player) => renderRouteCard(player))}
    </div>
  );

  // 웹 뷰
  if (isWebView) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* 왼쪽 사이드바 */}
        <div className="w-[400px] bg-white border-r-[3px] border-black flex flex-col h-full overflow-hidden">
          {/* 헤더 */}
          <div className="relative px-8 pt-6 pb-4 border-b-[3px] border-black bg-[#80cee1]">
            <button
              onClick={handleCancelRoute}
              className="absolute top-6 right-8 bg-gradient-to-b from-[#00f2fe] to-[#4facfe] rounded-[16px] border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] px-[20px] py-[3px] hover:scale-105 transition-transform z-10"
            >
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[18px]">
                경주취소
              </p>
            </button>
            <p className="font-['Wittgenstein',sans-serif] leading-[30px] text-[12px] text-black text-center">
              {departure?.name && arrival?.name
                ? `${departure.name} → ${arrival.name}`
                : "경로 진행중"}
            </p>
          </div>

          {/* 스크롤 가능한 컨텐츠 영역 */}
          <div className="flex-1 overflow-auto px-5 py-5">
            {/* GPS 상태 */}
            {gpsStatusCard}

            {/* 실시간 순위 */}
            <div className="mb-4">
              {rankingCard}
            </div>

            {/* 경로 카드들 */}
            {routeCards}
          </div>

          {/* 하단 고정 버튼 */}
          <div className="p-5 bg-white border-t-[3px] border-black">
            <button
              onClick={handleFinishRoute}
              disabled={!allPlayersFinished}
              className={`w-full h-[60px] rounded-[16px] border-[3px] border-black shadow-[6px_6px_0px_0px_black] flex items-center justify-center gap-[7.995px] transition-all ${
                allPlayersFinished
                  ? 'bg-[#00d9ff] hover:scale-105 active:shadow-[4px_4px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[21px]">
                {allPlayersFinished ? '도착 완료' : '경주 진행중...'}
              </p>
              <p className="text-[14px] text-white leading-[21px]">
                {allPlayersFinished ? '🚀' : '⏳'}
              </p>
            </button>
          </div>
        </div>

        {/* 오른쪽 지도 영역 */}
        <div className="flex-1 relative">
          {mapContent}

          {/* 왼쪽 세로 버튼들 */}
          <div className="absolute left-[20px] top-[50%] transform -translate-y-1/2 flex flex-col gap-3 z-30">
            {/* 뒤로가기 버튼 */}
            {onBack && (
              <button
                onClick={onBack}
                className="bg-white/90 backdrop-blur-md rounded-[12px] border-[2px] border-black shadow-[3px_3px_0px_0px_black] size-[48px] flex items-center justify-center hover:bg-white active:shadow-[1px_1px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all"
                title="뒤로가기"
              >
                <span className="text-[20px] leading-[24px]">←</span>
              </button>
            )}

            {/* 레이어 버튼 */}
            <button
              ref={layerButtonRef}
              onClick={() => setIsLayerPopoverOpen(!isLayerPopoverOpen)}
              className={`bg-white/90 backdrop-blur-md rounded-[12px] border-[2px] border-black shadow-[3px_3px_0px_0px_black] size-[48px] flex items-center justify-center hover:bg-white active:shadow-[1px_1px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all ${
                isLayerPopoverOpen ? 'bg-white/95' : ''
              }`}
              title="레이어"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="rgba(0,0,0,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="rgba(0,0,0,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="rgba(0,0,0,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* 타겟/위치 버튼 */}
            <button
              onClick={handleMyLocation}
              className="bg-white/90 backdrop-blur-md rounded-[12px] border-[2px] border-black shadow-[3px_3px_0px_0px_black] size-[48px] flex items-center justify-center hover:bg-white active:shadow-[1px_1px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all"
              title="내 위치로 이동"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="rgba(0,0,0,0.8)" strokeWidth="2"/>
                <path d="M12 2V6" stroke="rgba(0,0,0,0.8)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 18V22" stroke="rgba(0,0,0,0.8)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M2 12H6" stroke="rgba(0,0,0,0.8)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18 12H22" stroke="rgba(0,0,0,0.8)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* 레이어 팝오버 */}
          {isLayerPopoverOpen && (
            <div ref={layerPopoverRef} className="absolute left-[76px] top-[50%] transform -translate-y-1/2 bg-white/95 backdrop-blur-lg rounded-[12px] border-[2px] border-black shadow-[4px_4px_0px_0px_black] p-4 min-w-[200px] z-40">
              <div className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300">
                지도 스타일
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    const mapInstance = mapViewRef.current?.map;
                    if (mapInstance) {
                      mapInstance.setStyle('mapbox://styles/mapbox/outdoors-v12', { diff: false } as any);
                    }
                    setIsLayerPopoverOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all text-left"
                >
                  <span className="text-lg">🗺️</span>
                  <span className="text-sm font-medium">기본 지도</span>
                </button>
                <button
                  onClick={() => {
                    const mapInstance = mapViewRef.current?.map;
                    if (mapInstance) {
                      mapInstance.setStyle('mapbox://styles/mapbox/navigation-night-v1', { diff: false } as any);
                    }
                    setIsLayerPopoverOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all text-left"
                >
                  <span className="text-lg">🌙</span>
                  <span className="text-sm font-medium">야간 모드</span>
                </button>
                <button
                  onClick={() => {
                    const mapInstance = mapViewRef.current?.map;
                    if (mapInstance) {
                      mapInstance.setStyle('mapbox://styles/mapbox/satellite-streets-v12', { diff: false } as any);
                    }
                    setIsLayerPopoverOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all text-left"
                >
                  <span className="text-lg">🛰️</span>
                  <span className="text-sm font-medium">위성 지도</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 결과 팝업 */}
        <ResultPopup
          isOpen={showResultPopup}
          onClose={() => setShowResultPopup(false)}
          onNavigate={onNavigate}
          onOpenDashboard={onOpenDashboard}
          result={routeResult}
          isLoading={isLoadingResult}
        />
      </div>
    );
  }

  // 모바일 뷰
  return (
    <div ref={containerRef} className="relative size-full overflow-hidden bg-white">
      {/* 지도 배경 */}
      <div className="absolute inset-0">
        {mapContent}
      </div>

      {/* 왼쪽 세로 버튼들 */}
      <div className="absolute left-[20px] top-[50%] transform -translate-y-1/2 flex flex-col gap-3 z-30">
        {/* 뒤로가기 버튼 */}
        {onBack && (
          <button
            onClick={onBack}
            className="bg-white/90 backdrop-blur-md rounded-[12px] border-[2px] border-black shadow-[3px_3px_0px_0px_black] size-[48px] flex items-center justify-center hover:bg-white active:shadow-[1px_1px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all"
            title="뒤로가기"
          >
            <span className="text-[20px] leading-[24px]">←</span>
          </button>
        )}

        {/* 레이어 버튼 */}
        <button
          ref={layerButtonRef}
          onClick={() => setIsLayerPopoverOpen(!isLayerPopoverOpen)}
          className={`bg-white/90 backdrop-blur-md rounded-[12px] border-[2px] border-black shadow-[3px_3px_0px_0px_black] size-[48px] flex items-center justify-center hover:bg-white active:shadow-[1px_1px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all ${
            isLayerPopoverOpen ? 'bg-white/95' : ''
          }`}
          title="레이어"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="rgba(0,0,0,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="rgba(0,0,0,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="rgba(0,0,0,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* 타겟/위치 버튼 */}
        <button
          onClick={handleMyLocation}
          className="bg-white/90 backdrop-blur-md rounded-[12px] border-[2px] border-black shadow-[3px_3px_0px_0px_black] size-[48px] flex items-center justify-center hover:bg-white active:shadow-[1px_1px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all"
          title="내 위치로 이동"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="rgba(0,0,0,0.8)" strokeWidth="2"/>
            <path d="M12 2V6" stroke="rgba(0,0,0,0.8)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 18V22" stroke="rgba(0,0,0,0.8)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M2 12H6" stroke="rgba(0,0,0,0.8)" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18 12H22" stroke="rgba(0,0,0,0.8)" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* 레이어 팝오버 */}
      {isLayerPopoverOpen && (
        <div ref={layerPopoverRef} className="absolute left-[76px] top-[50%] transform -translate-y-1/2 bg-white/95 backdrop-blur-lg rounded-[12px] border-[2px] border-black shadow-[4px_4px_0px_0px_black] p-4 min-w-[200px] z-40">
          <div className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-gray-300">
            지도 스타일
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                const mapInstance = mapViewRef.current?.map;
                if (mapInstance) {
                  mapInstance.setStyle('mapbox://styles/mapbox/outdoors-v12', { diff: false } as any);
                }
                setIsLayerPopoverOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all text-left"
            >
              <span className="text-lg">🗺️</span>
              <span className="text-sm font-medium">기본 지도</span>
            </button>
            <button
              onClick={() => {
                const mapInstance = mapViewRef.current?.map;
                if (mapInstance) {
                  mapInstance.setStyle('mapbox://styles/mapbox/navigation-night-v1', { diff: false } as any);
                }
                setIsLayerPopoverOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all text-left"
            >
              <span className="text-lg">🌙</span>
              <span className="text-sm font-medium">야간 모드</span>
            </button>
            <button
              onClick={() => {
                const mapInstance = mapViewRef.current?.map;
                if (mapInstance) {
                  mapInstance.setStyle('mapbox://styles/mapbox/satellite-streets-v12', { diff: false } as any);
                }
                setIsLayerPopoverOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all text-left"
            >
              <span className="text-lg">🛰️</span>
              <span className="text-sm font-medium">위성 지도</span>
            </button>
          </div>
        </div>
      )}

      {/* 경주취소 버튼 */}
      <button
        onClick={handleCancelRoute}
        className="absolute right-[5.97%] top-[1.5%] bg-gradient-to-b from-[#00f2fe] to-[#4facfe] rounded-[16px] border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] px-[20px] py-[3px] hover:scale-105 transition-transform z-30"
      >
        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[18px]">
          경주취소
        </p>
      </button>

      {/* GPS 상태 표시 - 상단 좌측 */}
      <div className="absolute left-[20px] top-[12px] z-30">
        <div className={`rounded-[10px] border-[2px] border-black shadow-[3px_3px_0px_0px_black] px-3 py-2 ${
          isOffRoute ? 'bg-[#ff6b6b]' : isUserArrived ? 'bg-[#4ecdc4]' : 'bg-white'
        }`}>
          {isOffRoute ? (
            <p className="font-['Wittgenstein',sans-serif] text-[11px] text-white font-bold">
              ⚠️ 경로 이탈 {distanceFromRoute}m
            </p>
          ) : isUserArrived ? (
            <button
              onClick={openResultPopup}
              className="font-['Wittgenstein',sans-serif] text-[11px] text-white font-bold hover:underline"
            >
              🎉 도착! [결과 보기]
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                isGpsTestMode ? 'bg-purple-500 animate-pulse' : isGpsTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
              }`} />
              <p className="font-['Wittgenstein',sans-serif] text-[11px] text-black">
                {isGpsTestMode
                  ? distanceToDestination !== null
                    ? `🧪 ${distanceToDestination >= 1000 ? `${(distanceToDestination / 1000).toFixed(1)}km` : `${distanceToDestination}m`}`
                    : '🧪 테스트 중'
                  : isGpsTracking
                    ? distanceToDestination !== null
                      ? `🏁 ${distanceToDestination >= 1000 ? `${(distanceToDestination / 1000).toFixed(1)}km` : `${distanceToDestination}m`}`
                      : 'GPS 추적 중'
                    : 'GPS 꺼짐'}
              </p>
            </div>
          )}
        </div>

        {/* GPS 버튼들 */}
        <div className="flex gap-1 mt-2">
          {/* 실제 GPS 버튼 */}
          <button
            onClick={isGpsTracking ? stopGpsTracking : startGpsTracking}
            disabled={isGpsTestMode}
            className={`flex-1 h-[28px] rounded-[8px] border-[2px] border-black shadow-[2px_2px_0px_0px_black] flex items-center justify-center gap-1 transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
              isGpsTestMode ? 'bg-gray-300 opacity-50' : isGpsTracking ? 'bg-[#ff6b6b]' : 'bg-[#4ecdc4]'
            }`}
          >
            <span className="text-[10px]">{isGpsTracking ? '📍' : '🛰️'}</span>
            <span className="font-['Wittgenstein',sans-serif] text-[9px] text-black">
              {isGpsTracking ? '중지' : 'GPS'}
            </span>
          </button>

          {/* 테스트 모드 버튼 */}
          <button
            onClick={isGpsTestMode ? stopGpsTestMode : startGpsTestMode}
            disabled={isGpsTracking}
            className={`flex-1 h-[28px] rounded-[8px] border-[2px] border-black shadow-[2px_2px_0px_0px_black] flex items-center justify-center gap-1 transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
              isGpsTracking ? 'bg-gray-300 opacity-50' : isGpsTestMode ? 'bg-[#ff6b6b]' : 'bg-[#a78bfa]'
            }`}
          >
            <span className="text-[10px]">{isGpsTestMode ? '⏹️' : '🧪'}</span>
            <span className="font-['Wittgenstein',sans-serif] text-[9px] text-black">
              {isGpsTestMode ? '중지' : '테스트'}
            </span>
          </button>

          {/* 리셋 버튼 */}
          <button
            onClick={resetGpsTestMode}
            className="w-[28px] h-[28px] rounded-[8px] border-[2px] border-black shadow-[2px_2px_0px_0px_black] bg-white flex items-center justify-center transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            <span className="text-[10px]">🔄</span>
          </button>
        </div>
      </div>

      {/* 실시간 순위 카드 - 슬라이드업 위 */}
      <div
        className="absolute left-[20.05px] right-[20.05px] z-20 transition-all"
        style={{
          bottom: `calc(${sheetHeight}% + 30px)`,
          transitionDuration: isDragging ? "0ms" : "300ms",
        }}
      >
        {rankingCard}
      </div>

      {/* 슬라이드업 - 경로 카드들 */}
      <div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-tl-[24px] rounded-tr-[24px] border-l-[3px] border-r-[3px] border-t-[3px] border-black shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] transition-all z-10"
        style={{
          height: `${sheetHeight}%`,
          transitionDuration: isDragging ? "0ms" : "300ms",
        }}
      >
        {/* 드래그 핸들 */}
        <div
          className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
        >
          <div className="bg-[#d1d5dc] h-[5.996px] w-[48px] rounded-full" />
        </div>

        {/* 경로 카드들 스크롤 영역 */}
        <div className="px-[23.86px] pb-[100px] overflow-y-auto h-[calc(100%-40px)]">
          {routeCards}
        </div>
      </div>

      {/* 도착 완료 버튼 - 하단 고정 */}
      <button
        onClick={handleFinishRoute}
        disabled={!allPlayersFinished}
        className={`fixed bottom-[24px] left-[24px] right-[24px] h-[60px] rounded-[16px] border-[3px] border-black shadow-[6px_6px_0px_0px_black] flex items-center justify-center gap-[7.995px] transition-all z-50 ${
          allPlayersFinished
            ? 'bg-[#00d9ff] hover:scale-105 active:shadow-[4px_4px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] cursor-pointer'
            : 'bg-gray-400 cursor-not-allowed opacity-60'
        }`}
      >
        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-white leading-[21px]">
          {allPlayersFinished ? '도착 완료' : '경주 진행중...'}
        </p>
        <p className="text-[14px] text-white leading-[21px]">
          {allPlayersFinished ? '🚀' : '⏳'}
        </p>
      </button>

      {/* 결과 팝업 */}
      <ResultPopup
        isOpen={showResultPopup}
        onClose={() => setShowResultPopup(false)}
        onNavigate={onNavigate}
        onOpenDashboard={onOpenDashboard}
        result={routeResult}
        isLoading={isLoadingResult}
      />
    </div>
  );
}
