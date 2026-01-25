import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { MapView, type MapViewRef, type RouteLineInfo, type EndpointMarker } from "./MapView";
import { ResultPopup } from "@/app/components/ResultPopup";
import { useRouteStore, type Player, PLAYER_LABELS, PLAYER_ICONS } from "@/stores/routeStore";
import { useMapStore, type MapStyleType } from "@/stores/mapStore";
import { getRouteLegDetail, getRouteResult, updateRouteStatus } from "@/services/routeService";
import { secondsToMinutes, metersToKilometers, MODE_ICONS, type RouteResultResponse, type BotStatusUpdateEvent, type BotColorType, type RouteSegment, type LegStep } from "@/types/route";
import { ROUTE_COLORS } from "@/mocks/routeData";
import * as turf from "@turf/turf";
import { useRouteSSE } from "@/hooks/useRouteSSE";
import { MovingCharacter, type CharacterColor } from "@/components/MovingCharacter";
import { addSubwayLayers, removeSubwayLayers, toggleSubwayLayers } from "@/components/map/subwayLayer";
import { addBusLayers, removeBusLayers, toggleBusLayers, updateAllBusPositions, clearBusData, getBusRoutePath, addBusRoutePath, clearAllBusRoutePaths } from "@/components/map/busLayer";
import { trackBusPositions, getBusRoutePath as fetchBusRoutePath } from "@/lib/api";

// 사용자 경로 시뮬레이션을 위한 Leg 타이밍 정보
interface LegTiming {
  legIndex: number;
  mode: string;
  startTime: number;      // 누적 시작 시간 (초)
  endTime: number;        // 누적 종료 시간 (초)
  startDistance: number;  // 누적 시작 거리 (m)
  endDistance: number;    // 누적 종료 거리 (m)
}

// 지도 스타일 정보
const MAP_STYLES: Record<MapStyleType, { url: string; name: string; icon: string }> = {
  default: {
    url: "mapbox://styles/mapbox/outdoors-v12",
    name: "기본 지도",
    icon: "🗺️",
  },
  dark: {
    url: "mapbox://styles/mapbox/navigation-night-v1",
    name: "야간 모드",
    icon: "🌙",
  },
  "satellite-streets": {
    url: "mapbox://styles/mapbox/satellite-streets-v12",
    name: "위성 지도",
    icon: "🛰️",
  },
};

type PageType = "map" | "search" | "favorites" | "subway" | "route" | "routeDetail";

interface RouteDetailPageProps {
  onBack?: () => void;
  onNavigate?: (page: PageType) => void;
  onOpenDashboard?: () => void;
}

/**
 * LegStep[] → RouteSegment[] 변환
 * passShape.linestring 또는 steps[].linestring에서 좌표 추출
 */
function convertLegsToSegments(legs: LegStep[]): RouteSegment[] {
  return legs.map((leg, index) => {
    const pathCoordinates: [number, number][] = [];

    // passShape가 있으면 사용 (BUS/SUBWAY 구간)
    if (leg.passShape?.linestring) {
      const points = leg.passShape.linestring.split(' ');
      for (const point of points) {
        const [lon, lat] = point.split(',').map(Number);
        if (!isNaN(lon) && !isNaN(lat)) {
          pathCoordinates.push([lon, lat]);
        }
      }
    } else if (leg.steps && leg.steps.length > 0) {
      // WALK 구간: steps[].linestring 사용
      for (const step of leg.steps) {
        if (step.linestring) {
          const points = step.linestring.split(' ');
          for (const point of points) {
            const [lon, lat] = point.split(',').map(Number);
            if (!isNaN(lon) && !isNaN(lat)) {
              pathCoordinates.push([lon, lat]);
            }
          }
        }
      }
    }

    // 좌표가 없으면 시작점/끝점 사용
    if (pathCoordinates.length === 0) {
      pathCoordinates.push([leg.start.lon, leg.start.lat]);
      pathCoordinates.push([leg.end.lon, leg.end.lat]);
    }

    return {
      segment_index: index,
      mode: leg.mode as RouteSegment['mode'],
      section_time: leg.sectionTime,
      distance: leg.distance,
      start_name: leg.start.name,
      start_lat: leg.start.lat,
      start_lon: leg.start.lon,
      end_name: leg.end.name,
      end_lat: leg.end.lat,
      end_lon: leg.end.lon,
      route_name: leg.route || '',
      route_color: leg.routeColor || '#888888',
      path_coordinates: pathCoordinates,
    };
  });
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
  const [isRankingVisible, setIsRankingVisible] = useState(true); // 실시간 순위창 표시 상태

  // 레이어 관련 상태
  const { mapStyle, setMapStyle } = useMapStore();
  const [isLayerPopoverOpen, setIsLayerPopoverOpen] = useState(false);
  const [is3DBuildingsEnabled, setIs3DBuildingsEnabled] = useState(false);
  const [isSubwayLinesEnabled, setIsSubwayLinesEnabled] = useState(false);
  const [isBusLinesEnabled, setIsBusLinesEnabled] = useState(false);
  const [showBusInputModal, setShowBusInputModal] = useState(false);
  const [busNumberInput, setBusNumberInput] = useState("");
  const [trackedBusNumbers, setTrackedBusNumbers] = useState<string[]>([]);
  const layerButtonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // SSE 관련 상태
  const [botPositions, setBotPositions] = useState<Map<number, BotStatusUpdateEvent>>(new Map());

  // SSE 연결 (createRouteResponse에서 route_itinerary_id 가져옴)
  const activeRouteId = createRouteResponse?.route_itinerary_id || null;
  const { status, botStates, userBusArrival, connect, disconnect } = useRouteSSE(
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

        // 봇 진행률을 playerProgress에 반영
        if (data.progress_percent !== undefined) {
          // createRouteResponse에서 해당 봇의 인덱스 찾기
          const botParticipants = createRouteResponse?.participants.filter(p => p.type === 'BOT') || [];
          const botIndex = botParticipants.findIndex(p => p.bot_id === data.bot_id);
          const player = botIndex === 0 ? 'bot1' as Player : 'bot2' as Player;

          setPlayerProgress((prev) => {
            const newProgress = new Map(prev);
            // progress_percent는 0~100, playerProgress는 0~1
            newProgress.set(player, data.progress_percent / 100);
            return newProgress;
          });
        }
      },
      onBotBoarding: (data) => {
        console.log(`🚌 봇 ${data.bot_id} 탑승:`, data.station_name);
      },
      onBotAlighting: (data) => {
        console.log(`🚶 봇 ${data.bot_id} 하차:`, data.station_name);
      },
      onParticipantFinished: (data) => {
        console.log(`🏁 참가자 도착! 순위: ${data.rank}위`, data);

        // 참가자 타입에 따라 player 키 결정
        let player: Player;
        if (data.participant.type === 'USER') {
          player = 'user';
        } else {
          // BOT인 경우: bot_id로 bot1/bot2 매핑
          const botParticipants = createRouteResponse?.participants.filter(p => p.type === 'BOT') || [];
          const botIndex = botParticipants.findIndex(p => p.bot_id === data.participant.bot_id);
          player = botIndex === 0 ? 'bot1' : 'bot2';
        }

        // 진행률 100%로 설정
        setPlayerProgress((prev) => {
          const newProgress = new Map(prev);
          newProgress.set(player, 1);
          return newProgress;
        });

        // 도착 시간 기록 (duration 기반 또는 현재 시간)
        setFinishTimes((prev) => {
          const newTimes = new Map(prev);
          // raceStartTime이 있으면 duration 기반으로 계산, 없으면 현재 시간 사용
          const finishTime = raceStartTime.current
            ? raceStartTime.current + (data.duration * 1000)
            : Date.now();
          newTimes.set(player, finishTime);
          return newTimes;
        });
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

  // 시뮬레이션 상태 (SSE로 대체 - 주석 처리)
  // const [isSimulating, setIsSimulating] = useState(false);
  const [playerProgress, setPlayerProgress] = useState<Map<Player, number>>(
    new Map([['user', 0], ['bot1', 0], ['bot2', 0]])
  );
  const [finishTimes, setFinishTimes] = useState<Map<Player, number>>(new Map()); // 도착 시간 기록
  // const simulationRef = useRef<number | null>(null);
  // const lastUpdateTime = useRef<number>(0);

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
  const [gpsTestProgress, setGpsTestProgress] = useState(0);
  const gpsTestRef = useRef<number | null>(null);
  const gpsTestLastUpdate = useRef<number>(0);

  // 사용자 자동 이동 (경로 데이터의 totalTime 기반)
  const [isUserAutoMoving, setIsUserAutoMoving] = useState(false);
  const [userProgress, setUserProgress] = useState(0);
  const userAutoMoveRef = useRef<number | null>(null);
  const raceStartTime = useRef<number | null>(null);

  // 도착 판정 기준 (미터)
  const ARRIVAL_THRESHOLD = 20;
  const OFF_ROUTE_THRESHOLD = 20;

  // 버스 정류장 진입/이탈 상태 (버스 도착 정보 표시 제어용)
  const [hasEnteredBusStop, setHasEnteredBusStop] = useState(false);
  const [hasLeftBusStop, setHasLeftBusStop] = useState(false);
  const BUS_STOP_THRESHOLD = 10; // 10m

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

  // 플레이어 색상에 따른 경로 라인 색상
  const PLAYER_LINE_COLORS: Record<string, string> = {
    green: '#7ed321',
    pink: '#ff6b9d',
    yellow: '#ffd93d',
    purple: '#a78bfa',
  };

  // 플레이어의 색상 가져오기 (createRouteResponse 기반)
  const getPlayerLineColor = useCallback((player: Player): string => {
    if (player === 'user') {
      return PLAYER_LINE_COLORS.green; // 유저는 항상 green
    }
    // 봇의 경우 createRouteResponse에서 색상 찾기
    const botParticipants = createRouteResponse?.participants.filter(p => p.type === 'BOT') || [];
    const botIndex = player === 'bot1' ? 0 : 1;
    const botType = botParticipants[botIndex]?.bot_type as string;
    return PLAYER_LINE_COLORS[botType] || PLAYER_LINE_COLORS.purple;
  }, [createRouteResponse]);

  // 지도에 표시할 경로 라인 생성
  const routeLines = useMemo<RouteLineInfo[]>(() => {
    const lines: RouteLineInfo[] = [];

    for (const [player, routeLegId] of assignments) {
      const detail = legDetails.get(routeLegId);
      if (!detail) continue;

      // 플레이어 색상에 맞는 경로 색상 결정
      const lineColor = getPlayerLineColor(player);

      // 각 구간(leg)의 좌표를 모아서 하나의 라인으로 생성
      const allCoordinates: [number, number][] = [];

      for (const leg of detail.legs) {
        // passShape가 있으면 사용 (BUS/SUBWAY 구간)
        if (leg.passShape?.linestring) {
          const points = leg.passShape.linestring.split(' ');
          for (const point of points) {
            const [lon, lat] = point.split(',').map(Number);
            if (!isNaN(lon) && !isNaN(lat)) {
              allCoordinates.push([lon, lat]);
            }
          }
        } else if (leg.steps && leg.steps.length > 0) {
          // WALK 구간: steps[].linestring 사용 (실제 도보 경로)
          for (const step of leg.steps) {
            if (step.linestring) {
              const points = step.linestring.split(' ');
              for (const point of points) {
                const [lon, lat] = point.split(',').map(Number);
                if (!isNaN(lon) && !isNaN(lat)) {
                  allCoordinates.push([lon, lat]);
                }
              }
            }
          }
        } else {
          // passShape도 steps도 없으면 시작점과 끝점만 추가 (fallback)
          allCoordinates.push([leg.start.lon, leg.start.lat]);
          allCoordinates.push([leg.end.lon, leg.end.lat]);
        }
      }

      if (allCoordinates.length > 0) {
        lines.push({
          id: `route-${player}`,
          coordinates: allCoordinates,
          color: lineColor,
          width: player === 'user' ? 6 : 4,
          opacity: player === 'user' ? 1 : 0.7,
        });
      }
    }

    return lines;
  }, [assignments, legDetails, getPlayerLineColor]);

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
        // BUS/SUBWAY: passShape.linestring 사용
        const points = leg.passShape.linestring.split(' ');
        for (const point of points) {
          const [lon, lat] = point.split(',').map(Number);
          if (!isNaN(lon) && !isNaN(lat)) {
            allCoordinates.push([lon, lat]);
          }
        }
      } else if (leg.steps && leg.steps.length > 0) {
        // WALK: steps[].linestring 사용 (실제 도보 경로)
        for (const step of leg.steps) {
          if (step.linestring) {
            const points = step.linestring.split(' ');
            for (const point of points) {
              const [lon, lat] = point.split(',').map(Number);
              if (!isNaN(lon) && !isNaN(lat)) {
                allCoordinates.push([lon, lat]);
              }
            }
          }
        }
      } else {
        // fallback: 시작점과 끝점만 사용
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

  // 버스 정류장 진입/이탈 감지 (버스 도착 정보 표시 제어)
  useEffect(() => {
    // GPS 위치와 버스 정류장 좌표가 모두 있어야 함
    if (!userLocation || !userBusArrival?.station_lon || !userBusArrival?.station_lat) {
      return;
    }

    // 이미 정류장을 떠난 경우 더 이상 체크하지 않음
    if (hasLeftBusStop) {
      return;
    }

    // GPS 위치와 정류장 거리 계산
    const distance = turf.distance(
      turf.point(userLocation),
      turf.point([userBusArrival.station_lon, userBusArrival.station_lat]),
      { units: 'meters' }
    );

    // 10m 안에 들어오면 진입 플래그 설정
    if (distance <= BUS_STOP_THRESHOLD) {
      if (!hasEnteredBusStop) {
        setHasEnteredBusStop(true);
      }
    }

    // 10m 밖으로 나가면 (이미 들어왔었다면) 이탈 플래그 설정
    if (hasEnteredBusStop && distance > BUS_STOP_THRESHOLD) {
      setHasLeftBusStop(true);
    }
  }, [userLocation, userBusArrival, hasEnteredBusStop, hasLeftBusStop, BUS_STOP_THRESHOLD]);

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

  // 사용자 경로의 legs 배열에서 타이밍 정보 계산
  const calculateLegTimings = useCallback((legs: Array<{ mode: string; sectionTime: number; distance: number }>): LegTiming[] => {
    const timings: LegTiming[] = [];
    let cumulativeTime = 0;
    let cumulativeDistance = 0;

    console.log('📊 legs 데이터 분석:');
    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];
      console.log(`   leg[${i}]: mode=${leg.mode}, sectionTime=${leg.sectionTime}초, distance=${leg.distance}m`);
      timings.push({
        legIndex: i,
        mode: leg.mode,
        startTime: cumulativeTime,
        endTime: cumulativeTime + leg.sectionTime,
        startDistance: cumulativeDistance,
        endDistance: cumulativeDistance + leg.distance,
      });
      cumulativeTime += leg.sectionTime;
      cumulativeDistance += leg.distance;
    }
    console.log(`   → 총 시간: ${cumulativeTime}초, 총 거리: ${cumulativeDistance}m`);

    return timings;
  }, []);

  // 현재 시간에 해당하는 leg 찾기
  const findCurrentLeg = useCallback((timings: LegTiming[], elapsed: number): LegTiming | null => {
    return timings.find(t => elapsed >= t.startTime && elapsed < t.endTime) || timings[timings.length - 1] || null;
  }, []);

  // 사용자 자동 이동 시작 (legs[].sectionTime + passShape 기반)
  const startUserAutoMove = useCallback(() => {
    if (isUserAutoMoving || isGpsTracking || isGpsTestMode) return;

    // 사용자 경로 상세 정보 가져오기
    const userRouteLegId = assignments.get('user');
    if (!userRouteLegId) {
      console.warn('사용자 경로가 할당되지 않았습니다.');
      return;
    }

    const detail = legDetails.get(userRouteLegId);
    if (!detail || !detail.legs || detail.legs.length === 0) {
      console.warn('사용자 경로 상세 정보가 없습니다.');
      return;
    }

    // legs 배열에서 타이밍 정보 계산
    const legTimings = calculateLegTimings(detail.legs);
    const totalTime = legTimings[legTimings.length - 1]?.endTime || 0;
    const totalDistance = legTimings[legTimings.length - 1]?.endDistance || 0;

    if (totalTime <= 0) {
      console.warn('사용자 경로의 totalTime을 계산할 수 없습니다.');
      return;
    }

    // 경로선 생성 (turf LineString)
    const routeLine = getRouteLineString('user');
    if (!routeLine) {
      console.warn('사용자 경로선을 생성할 수 없습니다.');
      return;
    }

    const routeLength = turf.length(routeLine, { units: 'meters' });

    // 경로선 좌표 분석
    const routeCoords = routeLine.geometry.coordinates;
    const firstCoord = routeCoords[0];
    const lastCoord = routeCoords[routeCoords.length - 1];

    // 경로선 특정 지점 좌표 확인
    const point25 = turf.along(routeLine, routeLength * 0.25, { units: 'meters' });
    const point50 = turf.along(routeLine, routeLength * 0.50, { units: 'meters' });
    const point75 = turf.along(routeLine, routeLength * 0.75, { units: 'meters' });

    console.log(`🚀 사용자 자동 이동 시작 (legs 기반)`);
    console.log(`   - 총 소요 시간: ${totalTime}초 (${Math.round(totalTime / 60)}분)`);
    console.log(`   - 총 거리: ${totalDistance}m`);
    console.log(`   - 경로선 길이: ${Math.round(routeLength)}m`);
    console.log(`   - 경로선 좌표 수: ${routeCoords.length}개`);
    console.log(`   - legs 수: ${detail.legs.length}개`);
    // leg별 예상 끝 지점 (거리 기반)
    const leg0EndDist = legTimings[0]?.endDistance || 0;
    const leg0EndPoint = turf.along(routeLine, Math.min(leg0EndDist, routeLength), { units: 'meters' });
    const leg1EndDist = legTimings[1]?.endDistance || 0;
    const leg1EndPoint = turf.along(routeLine, Math.min(leg1EndDist, routeLength), { units: 'meters' });

    console.log(`📍 경로선 좌표:`);
    console.log(`   - 0% (시작): [${firstCoord[0].toFixed(6)}, ${firstCoord[1].toFixed(6)}]`);
    console.log(`   - 25%: [${point25.geometry.coordinates[0].toFixed(6)}, ${point25.geometry.coordinates[1].toFixed(6)}]`);
    console.log(`   - 50%: [${point50.geometry.coordinates[0].toFixed(6)}, ${point50.geometry.coordinates[1].toFixed(6)}]`);
    console.log(`   - 75%: [${point75.geometry.coordinates[0].toFixed(6)}, ${point75.geometry.coordinates[1].toFixed(6)}]`);
    console.log(`   - 100% (끝): [${lastCoord[0].toFixed(6)}, ${lastCoord[1].toFixed(6)}]`);
    console.log(`   - 도착지: [${arrival?.lon.toFixed(6)}, ${arrival?.lat.toFixed(6)}]`);
    console.log(`📍 leg별 예상 끝 지점:`);
    console.log(`   - leg[0] WALK 끝 (${leg0EndDist}m): [${leg0EndPoint.geometry.coordinates[0].toFixed(6)}, ${leg0EndPoint.geometry.coordinates[1].toFixed(6)}]`);
    console.log(`   - leg[1] BUS 끝 (${leg1EndDist}m): [${leg1EndPoint.geometry.coordinates[0].toFixed(6)}, ${leg1EndPoint.geometry.coordinates[1].toFixed(6)}]`);

    setIsUserAutoMoving(true);
    raceStartTime.current = Date.now();
    setSimulationStartTime(Date.now()); // 결과 생성용

    let lastLogTime = 0;
    let lastLegIndex = -1;

    const animate = () => {
      if (!raceStartTime.current) return;

      const elapsed = (Date.now() - raceStartTime.current) / 1000; // 경과 시간 (초)
      const progress = Math.min(elapsed / totalTime, 1); // 진행률 (0~1)

      // 현재 leg 찾기
      const currentLeg = findCurrentLeg(legTimings, elapsed);

      // 경로선 위 현재 위치 계산 (거리 기반)
      let currentDistance = 0;
      if (currentLeg) {
        // 현재 leg 내에서의 진행률 계산
        const legDuration = currentLeg.endTime - currentLeg.startTime;
        const legElapsed = elapsed - currentLeg.startTime;
        const legProgress = legDuration > 0 ? Math.min(legElapsed / legDuration, 1) : 1;

        // 현재 거리 계산
        const legDistance = currentLeg.endDistance - currentLeg.startDistance;
        currentDistance = currentLeg.startDistance + (legDistance * legProgress);

        // 디버그: leg 전환 시 로그
        if (currentLeg.legIndex !== lastLegIndex) {
          console.log(`🚶 leg[${currentLeg.legIndex}] 시작: ${currentLeg.mode}, 소요시간=${legDuration}초, 거리=${legDistance}m`);
          lastLegIndex = currentLeg.legIndex;
        }

        // 디버그: 30초마다 상세 로그
        if (elapsed - lastLogTime >= 30) {
          console.log(`⏱️ ${Math.round(elapsed)}초 경과: leg[${currentLeg.legIndex}] ${currentLeg.mode}, 진행률=${(legProgress * 100).toFixed(1)}%, 이동거리=${Math.round(currentDistance)}m`);
          lastLogTime = elapsed;
        }
      } else {
        currentDistance = totalDistance * progress;
      }

      // 경로선 위 위치 계산 (turf.along 사용)
      const targetDistance = Math.min(currentDistance, routeLength);
      const point = turf.along(routeLine, targetDistance, { units: 'meters' });
      const currentPosition = point.geometry.coordinates as [number, number];

      // 사용자 위치 업데이트
      setUserLocation(currentPosition);
      setUserProgress(progress);
      setPlayerProgress((prev) => {
        const newProgress = new Map(prev);
        newProgress.set('user', progress);
        return newProgress;
      });

      // 도착지까지 거리 계산
      if (arrival) {
        const destPoint = turf.point([arrival.lon, arrival.lat]);
        const userPoint = turf.point(currentPosition);
        const distToDest = turf.distance(userPoint, destPoint, { units: 'meters' });
        setDistanceToDestination(Math.round(distToDest));
      }

      // 도착 처리 (100% 진행 또는 도착지 20m 이내)
      if (progress >= 1) {
        console.log('🏁 사용자 도착! 봇 시뮬레이션 계속 관전...');
        setIsUserArrived(true);
        setFinishTimes((prevTimes) => {
          if (!prevTimes.has('user')) {
            const newTimes = new Map(prevTimes);
            newTimes.set('user', Date.now());
            return newTimes;
          }
          return prevTimes;
        });
        setIsUserAutoMoving(false);
        userAutoMoveRef.current = null;
        // 백엔드에 사용자 도착 완료 전송 (봇 시뮬레이션은 계속)
        handleUserArrived();
        return;
      }

      userAutoMoveRef.current = requestAnimationFrame(animate);
    };

    userAutoMoveRef.current = requestAnimationFrame(animate);
  }, [isUserAutoMoving, isGpsTracking, isGpsTestMode, assignments, legDetails, calculateLegTimings, findCurrentLeg, getRouteLineString, arrival, handleUserArrived]);

  // 사용자 자동 이동 중지
  const stopUserAutoMove = useCallback(() => {
    setIsUserAutoMoving(false);
    if (userAutoMoveRef.current) {
      cancelAnimationFrame(userAutoMoveRef.current);
      userAutoMoveRef.current = null;
    }
  }, []);

  // 경로 상세 정보 로드 완료 시 사용자 자동 이동 시작
  useEffect(() => {
    // 경로 상세 정보가 로드되고, 사용자 경로가 할당되어 있으면 자동 이동 시작
    const userRouteLegId = assignments.get('user');
    if (
      userRouteLegId &&
      legDetails.has(userRouteLegId) &&
      !isLoadingDetails &&
      !isUserAutoMoving &&
      !isGpsTracking &&
      !isGpsTestMode &&
      !isUserArrived
    ) {
      // 약간의 지연 후 시작 (UI 렌더링 완료 후)
      const timer = setTimeout(() => {
        startUserAutoMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [assignments, legDetails, isLoadingDetails, isUserAutoMoving, isGpsTracking, isGpsTestMode, isUserArrived, startUserAutoMove]);

  // 컴포넌트 언마운트 시 사용자 자동 이동 정리
  useEffect(() => {
    return () => {
      if (userAutoMoveRef.current) {
        cancelAnimationFrame(userAutoMoveRef.current);
      }
    };
  }, []);

  // 시뮬레이션 시작 (SSE로 대체 - 주석 처리)
  // const startSimulation = useCallback(() => {
  //   if (isSimulating) return;

  //   setIsSimulating(true);
  //   const now = Date.now();
  //   lastUpdateTime.current = now;
  //   setSimulationStartTime(now); // 시뮬레이션 시작 시간 기록

  //   // 플레이어별 속도 (봇들은 약간씩 다르게)
  //   const speeds: Record<Player, number> = {
  //     user: 0.02,   // 1초당 2% 진행
  //     bot1: 0.018,  // 1초당 1.8% 진행
  //     bot2: 0.022,  // 1초당 2.2% 진행
  //   };

  //   const animate = () => {
  //     const now = Date.now();
  //     const deltaTime = (now - lastUpdateTime.current) / 1000; // 초 단위
  //     lastUpdateTime.current = now;

  //     setPlayerProgress((prev) => {
  //       const newProgress = new Map(prev);

  //       (['user', 'bot1', 'bot2'] as Player[]).forEach((player) => {
  //         const current = prev.get(player) || 0;
  //         if (current < 1) {
  //           // 약간의 랜덤성 추가 (±10%)
  //           const randomFactor = 0.9 + Math.random() * 0.2;
  //           const newValue = Math.min(current + speeds[player] * deltaTime * randomFactor, 1);
  //           newProgress.set(player, newValue);

  //           // 100% 도달 시 도착 시간 기록
  //           if (newValue >= 1) {
  //             setFinishTimes((prevTimes) => {
  //               if (!prevTimes.has(player)) {
  //                 const newTimes = new Map(prevTimes);
  //                 newTimes.set(player, Date.now());
  //                 return newTimes;
  //               }
  //               return prevTimes;
  //             });
  //           }
  //         }
  //       });

  //       return newProgress;
  //     });

  //     simulationRef.current = requestAnimationFrame(animate);
  //   };

  //   simulationRef.current = requestAnimationFrame(animate);
  // }, [isSimulating]);

  // // 시뮬레이션 정지
  // const stopSimulation = useCallback(() => {
  //   setIsSimulating(false);
  //   if (simulationRef.current) {
  //     cancelAnimationFrame(simulationRef.current);
  //     simulationRef.current = null;
  //   }
  // }, []);

  // // 시뮬레이션 리셋
  // const resetSimulation = useCallback(() => {
  //   stopSimulation();
  //   setPlayerProgress(new Map([['user', 0], ['bot1', 0], ['bot2', 0]]));
  //   setFinishTimes(new Map()); // 도착 시간 기록도 초기화
  //   setSimulationStartTime(null); // 시작 시간도 초기화
  // }, [stopSimulation]);

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

  // 경주 결과 조회 (백엔드 API 사용 시)
  const fetchRouteResult = useCallback(async () => {
    const routeId = userRouteId || 1;

    setIsLoadingResult(true);
    try {
      const result = await getRouteResult(routeId);
      setRouteResult(result);
    } catch (error) {
      console.error('경주 결과 조회 실패:', error);
    } finally {
      setIsLoadingResult(false);
    }
  }, [userRouteId]);

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

  // 현재 위치로 이동
  const handleMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation을 지원하지 않는 브라우저입니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        const map = mapViewRef.current?.map;

        if (map) {
          map.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            duration: 1500,
          });
        }
      },
      (error) => {
        console.warn("현재 위치를 가져올 수 없습니다:", error);
      }
    );
  }, []);

  // 지도 스타일 변경
  const handleStyleChange = useCallback((style: MapStyleType) => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance) return;

    if (!mapInstance.isStyleLoaded()) return;

    const center = mapInstance.getCenter();
    const zoom = mapInstance.getZoom();
    const bearing = mapInstance.getBearing();
    const pitch = mapInstance.getPitch();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapInstance.setStyle(MAP_STYLES[style].url, { diff: false } as any);

    mapInstance.once("style.load", () => {
      if (!mapInstance) return;

      mapInstance.jumpTo({
        center: center,
        zoom: zoom,
        bearing: bearing,
        pitch: pitch,
      });

      if (style !== "satellite-streets") {
        const layers = mapInstance.getStyle().layers;
        if (layers) {
          layers.forEach((layer) => {
            if (layer.type === "symbol" && layer.layout?.["text-field"]) {
              try {
                mapInstance.setLayoutProperty(layer.id, "text-field", [
                  "coalesce",
                  ["get", "name_ko"],
                  ["get", "name:ko"],
                  ["get", "name"],
                ]);
              } catch {
                // 일부 레이어는 text-field 변경이 불가능할 수 있음
              }
            }
          });
        }
      }

      if (style === "dark") {
        const layers = mapInstance.getStyle().layers;
        if (layers) {
          layers.forEach((layer) => {
            if (layer.id.includes("traffic")) {
              try {
                mapInstance.setLayoutProperty(layer.id, "visibility", "none");
              } catch {
                // 레이어 숨기기 실패 무시
              }
            }
          });
        }
      }

      if (is3DBuildingsEnabled && mapInstance && !mapInstance.getLayer("3d-buildings")) {
        if (!mapInstance.getSource("junggu-buildings")) {
          mapInstance.addSource("junggu-buildings", {
            type: "geojson",
            data: "/junggu_buildings.geojson",
          });
        }
        mapInstance.addLayer({
          id: "3d-buildings",
          source: "junggu-buildings",
          type: "fill-extrusion",
          minzoom: 13,
          paint: {
            "fill-extrusion-color": [
              "interpolate",
              ["linear"],
              ["get", "height"],
              0, "#d4e6d7",
              10, "#a8d4ae",
              20, "#7bc47f",
              50, "#4a9960",
              100, "#2d5f3f",
            ],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": 0.75,
          },
        });
      }
    });

    setMapStyle(style);
    setIsLayerPopoverOpen(false);
  }, [is3DBuildingsEnabled]);

  // 3D 건물 레이어 추가 함수
  const add3DBuildingsLayer = useCallback(async () => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance) return;

    if (mapInstance.getLayer("3d-buildings")) return;

    if (!mapInstance.getSource("junggu-buildings")) {
      mapInstance.addSource("junggu-buildings", {
        type: "geojson",
        data: "/junggu_buildings.geojson",
      });
    }

    mapInstance.addLayer({
      id: "3d-buildings",
      source: "junggu-buildings",
      type: "fill-extrusion",
      minzoom: 13,
      paint: {
        "fill-extrusion-color": [
          "interpolate",
          ["linear"],
          ["get", "height"],
          0, "#d4e6d7",
          10, "#a8d4ae",
          20, "#7bc47f",
          50, "#4a9960",
          100, "#2d5f3f",
        ],
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.75,
      },
    });
  }, []);

  // 3D 건물 레이어 제거 함수
  const remove3DBuildingsLayer = useCallback(() => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance) return;
    if (mapInstance.getLayer("3d-buildings")) {
      mapInstance.removeLayer("3d-buildings");
    }
    if (mapInstance.getSource("junggu-buildings")) {
      mapInstance.removeSource("junggu-buildings");
    }
  }, []);

  // 3D 건물 토글 핸들러
  const handle3DBuildingsToggle = useCallback(() => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;

    const newState = !is3DBuildingsEnabled;
    setIs3DBuildingsEnabled(newState);

    if (newState) {
      add3DBuildingsLayer();
      mapInstance.easeTo({
        pitch: 45,
        duration: 500,
      });
    } else {
      remove3DBuildingsLayer();
      mapInstance.easeTo({
        pitch: 0,
        duration: 500,
      });
    }
  }, [is3DBuildingsEnabled, add3DBuildingsLayer, remove3DBuildingsLayer]);

  // 지하철 노선 토글 핸들러
  const handleSubwayLinesToggle = useCallback(() => {
    setIsSubwayLinesEnabled((prev) => !prev);
  }, []);

  // 버스 노선 토글 핸들러
  const handleBusLinesToggle = useCallback(() => {
    if (!isBusLinesEnabled) {
      setShowBusInputModal(true);
    } else {
      setIsBusLinesEnabled(false);
      setTrackedBusNumbers([]);
      setBusNumberInput("");
      const mapInstance = mapViewRef.current?.map;
      if (mapInstance) {
        clearBusData(mapInstance);
        clearAllBusRoutePaths(mapInstance);
      }
    }
  }, [isBusLinesEnabled]);

  // 버스 번호 입력 확인 핸들러
  const handleBusInputConfirm = useCallback(() => {
    const numbers = busNumberInput
      .split(/[,\s]+/)
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
      .slice(0, 5);

    if (numbers.length > 0) {
      setTrackedBusNumbers(numbers);
      setIsBusLinesEnabled(true);
      setShowBusInputModal(false);
    }
  }, [busNumberInput]);

  // 버스 번호 입력 취소 핸들러
  const handleBusInputCancel = useCallback(() => {
    setShowBusInputModal(false);
    setBusNumberInput("");
  }, []);

  // 지하철 노선 레이어 관리
  useEffect(() => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance) return;

    if (isSubwayLinesEnabled) {
      if (mapInstance.isStyleLoaded()) {
        addSubwayLayers(mapInstance);
      } else {
        mapInstance.once("style.load", () => {
          addSubwayLayers(mapInstance);
        });
      }
    } else {
      removeSubwayLayers(mapInstance);
    }
  }, [isSubwayLinesEnabled]);

  // 버스 레이어 관리
  useEffect(() => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance || trackedBusNumbers.length === 0) return;

    let intervalId: NodeJS.Timeout | null = null;
    let isInitialized = false;

    const loadBusData = async () => {
      // trackBusPositions를 호출하여 버스 번호로 실제 route_id와 위치 정보를 가져옴
      const response = await trackBusPositions(trackedBusNumbers);

      // 버스 위치 업데이트
      if (response.buses.length > 0) {
        updateAllBusPositions(mapInstance, response.buses);
      }

      // 최초 1회만 경로 데이터 로드 (경로는 변하지 않음)
      if (!isInitialized && response.meta.routes.length > 0) {
        isInitialized = true;
        for (const route of response.meta.routes) {
          try {
            const pathData = await fetchBusRoutePath(route.route_id);
            if (pathData?.geojson) {
              addBusRoutePath(mapInstance, route.route_id, route.bus_number, pathData.geojson);
            }
          } catch (error) {
            console.error(`버스 ${route.bus_number} 경로 조회 실패:`, error);
          }
        }
      }
    };

    if (isBusLinesEnabled && mapInstance.isStyleLoaded()) {
      addBusLayers(mapInstance);
      loadBusData();
      intervalId = setInterval(loadBusData, 15000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isBusLinesEnabled, trackedBusNumbers]);

  // 레이어 팝오버 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isLayerPopoverOpen &&
        popoverRef.current &&
        layerButtonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
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

  // 컴포넌트 언마운트 시 정리 (시뮬레이션 - SSE로 대체됨)
  // useEffect(() => {
  //   return () => {
  //     if (simulationRef.current) {
  //       cancelAnimationFrame(simulationRef.current);
  //     }
  //   };
  // }, []);

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

  // 유저 캐릭터 색상 (고정)
  const USER_COLOR: CharacterColor = 'green';

  // 플레이어 색상에 따른 그라디언트
  const PLAYER_GRADIENTS: Record<CharacterColor, string> = {
    green: 'from-[#7ed321] to-[#4a9960]',
    pink: 'from-[#ff6b9d] to-[#e84393]',
    yellow: 'from-[#ffd93d] to-[#f39c12]',
    purple: 'from-[#a78bfa] to-[#8b5cf6]',
  };

  // 봇 ID로 봇 타입(색상) 찾기
  const getBotColor = useCallback((botId: number): CharacterColor => {
    // createRouteResponse에서 해당 bot_id를 가진 참가자 찾기
    const participant = createRouteResponse?.participants.find(
      (p) => p.type === 'BOT' && p.bot_id === botId
    );
    // bot_type이 있으면 사용, 없으면 기본값 purple
    return (participant?.bot_type as CharacterColor) || 'purple';
  }, [createRouteResponse]);

  // 봇 목록 (SSE 데이터 + 출발지 fallback + 경로 세그먼트)
  const botList = useMemo(() => {
    const botParticipants = createRouteResponse?.participants.filter(p => p.type === 'BOT') || [];

    return botParticipants.map((participant, index) => {
      const botId = participant.bot_id!;
      const state = botPositions.get(botId);
      const player = index === 0 ? 'bot1' as Player : 'bot2' as Player;

      // SSE에서 받은 위치가 없으면 출발지를 기본 위치로 사용
      const position = state?.position || (departure ? { lon: departure.lon, lat: departure.lat } : null);
      const botStatus = state?.status || 'WALKING';

      // 봇의 경로 세그먼트 가져오기
      const routeLegId = participant.leg.route_leg_id;
      const detail = legDetails.get(routeLegId);
      const routeSegments = detail?.legs ? convertLegsToSegments(detail.legs) : [];

      return {
        botId,
        state: state ? { ...state, position } : { position, status: botStatus } as any,
        player,
        color: getBotColor(botId),
        hasRealPosition: !!state?.position,
        routeSegments,
      };
    });
  }, [botPositions, createRouteResponse, getBotColor, departure, legDetails]);

  // 순위표용 PLAYER_COLORS (레거시 호환)
  const PLAYER_COLORS: Record<Player, CharacterColor> = useMemo(() => {
    const colors: Record<Player, CharacterColor> = {
      user: USER_COLOR,
      bot1: 'purple',
      bot2: 'yellow',
    };

    // createRouteResponse에서 실제 봇 색상 가져오기
    const botParticipants = createRouteResponse?.participants.filter(p => p.type === 'BOT') || [];
    if (botParticipants[0]?.bot_type) {
      colors.bot1 = botParticipants[0].bot_type as CharacterColor;
    }
    if (botParticipants[1]?.bot_type) {
      colors.bot2 = botParticipants[1].bot_type as CharacterColor;
    }

    return colors;
  }, [createRouteResponse]);

  // user의 현재 위치 계산 (우선순위: GPS 추적 > GPS 테스트 > 자동 이동 > 진행률 기반)
  const userPosition = useMemo(() => {
    if (isGpsTracking && userLocation) {
      // GPS 추적 중: 실제 GPS 위치 사용
      return { lon: userLocation[0], lat: userLocation[1] };
    } else if (isGpsTestMode && userLocation) {
      // GPS 테스트 모드: 가짜 GPS 위치 사용
      return { lon: userLocation[0], lat: userLocation[1] };
    } else if (isUserAutoMoving && userLocation) {
      // 자동 이동 중: startUserAutoMove에서 계산한 정확한 위치 사용
      // (구간별 sectionTime을 고려한 정확한 위치)
      return { lon: userLocation[0], lat: userLocation[1] };
    } else {
      // 초기 상태 또는 자동 이동 전: 진행률 기반 위치 계산
      const progress = playerProgress.get('user') || 0;
      const pos = getPositionOnRoute('user', progress);
      if (pos) {
        return { lon: pos[0], lat: pos[1] };
      }
    }
    return null;
  }, [isGpsTracking, isGpsTestMode, isUserAutoMoving, userLocation, playerProgress, getPositionOnRoute]);

  // 경로 로딩 중인지 확인 (assignments는 있지만 routeLines가 비어있는 경우)
  const isRouteLoading = assignments.size > 0 && routeLines.length === 0;

  // 지도 컨텐츠
  const mapContent = (
    <>
      <MapView
        key={`map-${routeLines.length > 0 ? 'loaded' : 'loading'}`}
        ref={mapViewRef}
        currentPage="route"
        routeLines={routeLines}
        endpoints={endpoints}
        fitToRoutes={routeLines.length > 0}
      />

      {/* 경로 로딩 오버레이 */}
      {isRouteLoading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-20">
          <div className="bg-white rounded-[16px] border-[3px] border-black shadow-[6px_6px_0px_0px_black] px-8 py-6 flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
            <p className="font-['Wittgenstein',sans-serif] text-[14px] text-black">
              경로 불러오는 중...
            </p>
          </div>
        </div>
      )}

      {/* User 캐릭터 (GPS 또는 시뮬레이션 위치) */}
      {userPosition && (
        <MovingCharacter
          key="user"
          map={mapViewRef.current?.map || null}
          color={USER_COLOR}
          botId={0}
          currentPosition={userPosition}
          status="WALKING"
          skipInterpolation={true}  // 부모에서 이미 애니메이션 처리하므로 보간 건너뛰기
          size={64}
          animationSpeed={150}
        />
      )}

      {/* Bot 캐릭터들 (SSE 데이터 + 출발지 fallback + 경로 기반 보간) */}
      {botList.map(({ botId, state, color, routeSegments }) => (
        state.position ? (
          <MovingCharacter
            key={botId}
            map={mapViewRef.current?.map || null}
            color={color}
            botId={botId}
            currentPosition={state.position}
            status={state.status}
            routeSegments={routeSegments}
            updateInterval={(state.next_update_in || 30) * 1000}  // SSE에서 받은 다음 업데이트 시간 사용
            size={64}
            animationSpeed={150}
          />
        ) : null
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
    <div className="bg-[#ffd93d] rounded-[12px] border-[3px] border-black shadow-[6px_6px_0px_0px_black] px-[19.366px] pt-[19.366px] pb-[12px] relative">
      {/* 닫기 버튼 */}
      <button
        onClick={() => setIsRankingVisible(false)}
        className="absolute top-2 right-2 w-[24px] h-[24px] rounded-full border-[2px] border-black bg-white flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-colors"
      >
        <span className="text-[12px] font-bold">✕</span>
      </button>
      <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black text-center leading-[18px] mb-[12px]">
        실시간 순위 🏆
      </p>

      {/* 순위 목록 */}
      <div className="flex flex-col gap-[7.995px]">
        {rankings.map(({ player, progress }, index) => {
          const playerColor = PLAYER_COLORS[player];
          const progressPercent = Math.round(progress * 100);
          // 플레이어 색상에 맞는 프로그레스바 배경색
          const progressBarColor = playerColor === 'green' ? '#7ed321' :
                                   playerColor === 'pink' ? '#ff6b9d' :
                                   playerColor === 'yellow' ? '#ffd93d' :
                                   playerColor === 'purple' ? '#a78bfa' : '#7ed321';

          return (
            <div key={player} className="flex gap-[7.995px] items-center">
              <div className="bg-white w-[45px] h-[26px] border-[3px] border-black flex items-center justify-center">
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px]">
                  {index + 1}위
                </p>
              </div>
              {/* 캐릭터 헬멧 이미지 */}
              <div className="w-[32px] h-[32px] flex items-center justify-center">
                <img
                  src={`/src/assets/hud-player-helmet-${playerColor === 'pink' ? 'purple' : playerColor}.png`}
                  alt={`${player} character`}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 bg-white h-[18px] rounded-[4px] border-[3px] border-black overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%`, backgroundColor: progressBarColor }}
                />
              </div>
              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[12px] w-[35px] text-right">
                {progressPercent}%
              </p>
            </div>
          );
        })}
      </div>

      {/* 시뮬레이션 컨트롤 버튼 (SSE로 대체 - 주석 처리) */}
      {/* <div className="flex gap-2 mt-3">
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
      </div> */}
    </div>
  );

  // 경로 카드 생성
  const renderRouteCard = (player: Player, index: number) => {
    const route = getPlayerRoute(player);
    if (!route || !route.summary) return null;

    const playerColor = PLAYER_COLORS[player];
    const playerGradient = PLAYER_GRADIENTS[playerColor];
    const timeMinutes = secondsToMinutes(route.summary.totalTime);
    const distanceStr = metersToKilometers(route.summary.totalDistance);
    const isUser = player === "user";

    return (
      <div
        key={player}
        className={`bg-gradient-to-b ${playerGradient} rounded-[10px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] p-[23.364px]`}
      >
        {/* 헤더 */}
        <div className="flex gap-[11.992px] items-center mb-[16px]">
          <div className="bg-white rounded-[10px] w-[48px] h-[48px] border-[3px] border-black flex items-center justify-center overflow-hidden">
            <img
              src={`/src/assets/hud-player-helmet-${playerColor === 'pink' ? 'purple' : playerColor}.png`}
              alt={`${player} character`}
              className="w-[36px] h-[36px] object-contain"
            />
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
                    {/* 유저 버스 도착 정보 표시 (정류장 이탈 후 숨김) */}
                    {player === 'user' && leg.mode === "BUS" && !hasLeftBusStop &&
                     userBusArrival && userBusArrival.status === "ACTIVE" &&
                     userBusArrival.bus_name === (leg.route?.split(':').pop() || leg.route) && (
                      <span className="ml-2 text-[#ffd93d]">
                        · 다음 버스: {userBusArrival.arrival_message}
                      </span>
                    )}
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
      {players.map((player, index) => renderRouteCard(player, index))}
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
            {isRankingVisible ? (
              <div className="mb-4">
                {rankingCard}
              </div>
            ) : (
              <button
                onClick={() => setIsRankingVisible(true)}
                className="mb-4 ml-auto bg-[#ffd93d] rounded-[12px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] px-4 py-3 flex items-center justify-center hover:scale-[1.02] active:shadow-[2px_2px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all"
              >
                <span className="font-['Wittgenstein',sans-serif] text-[12px] text-black font-bold">순위 보기</span>
              </button>
            )}

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

          {/* 오른쪽 상단 버튼 컨테이너 */}
          <div className="absolute top-5 right-5 flex flex-col gap-3 z-10">
            {/* 레이어 버튼 */}
            <div className="relative">
              <button
                ref={layerButtonRef}
                onClick={() => setIsLayerPopoverOpen(!isLayerPopoverOpen)}
                className={`bg-white/20 backdrop-blur-md rounded-[14px] size-[40px] flex items-center justify-center border border-white/30 shadow-lg hover:bg-white/30 active:bg-white/25 active:scale-95 transition-all ${
                  isLayerPopoverOpen ? "bg-white/30" : ""
                }`}
                title="레이어"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* 레이어 팝오버 */}
              {isLayerPopoverOpen && (
                <div
                  ref={popoverRef}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-[48px] top-0 bg-white/20 backdrop-blur-lg rounded-[12px] shadow-xl border border-white/30 p-4 min-w-[200px] z-20"
                >
                  <div className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-white/20">
                    지도 스타일
                  </div>
                  <div className="flex flex-col gap-2">
                    {(Object.keys(MAP_STYLES) as MapStyleType[]).map((styleKey) => (
                      <button
                        key={styleKey}
                        onClick={() => handleStyleChange(styleKey)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          mapStyle === styleKey
                            ? "bg-white/40 text-gray-900 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                            : "hover:bg-white/30 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                        }`}
                      >
                        <span className="text-lg">{MAP_STYLES[styleKey].icon}</span>
                        <span className="text-sm font-medium">{MAP_STYLES[styleKey].name}</span>
                        {mapStyle === styleKey && (
                          <svg className="ml-auto w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* 레이어 옵션 섹션 */}
                  <div className="text-sm font-bold text-gray-800 mt-4 mb-3 pt-3 pb-2 border-t border-b border-white/20">
                    레이어 옵션
                  </div>
                  <div className="flex flex-col gap-2">
                    {/* 3D 건물 토글 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handle3DBuildingsToggle();
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        is3DBuildingsEnabled
                          ? "bg-white/50 text-gray-900 backdrop-blur-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] border border-white/40"
                          : "bg-white/25 hover:bg-white/35 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-white/20 shadow-sm"
                      }`}
                    >
                      <span className="text-lg">🏢</span>
                      <span className="text-sm font-medium">3D 건물</span>
                      <div
                        className={`ml-auto w-10 h-5 rounded-full transition-all relative backdrop-blur-sm ${
                          is3DBuildingsEnabled
                            ? "bg-green-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                            : "bg-white/35 border border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                            is3DBuildingsEnabled
                              ? "translate-x-5 bg-white shadow-md"
                              : "translate-x-0.5 bg-white border border-white/50 shadow-sm"
                          }`}
                        />
                      </div>
                    </button>

                    {/* 지하철 노선 토글 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubwayLinesToggle();
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        isSubwayLinesEnabled
                          ? "bg-white/50 text-gray-900 backdrop-blur-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] border border-white/40"
                          : "bg-white/25 hover:bg-white/35 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-white/20 shadow-sm"
                      }`}
                    >
                      <span className="text-lg">🚇</span>
                      <span className="text-sm font-medium whitespace-nowrap">지하철 노선</span>
                      <div
                        className={`ml-auto w-10 h-5 rounded-full transition-all relative backdrop-blur-sm ${
                          isSubwayLinesEnabled
                            ? "bg-green-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                            : "bg-white/35 border border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                            isSubwayLinesEnabled
                              ? "translate-x-5 bg-white shadow-md"
                              : "translate-x-0.5 bg-white border border-white/50 shadow-sm"
                          }`}
                        />
                      </div>
                    </button>

                    {/* 버스 노선 토글 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBusLinesToggle();
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        isBusLinesEnabled
                          ? "bg-white/50 text-gray-900 backdrop-blur-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] border border-white/40"
                          : "bg-white/25 hover:bg-white/35 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-white/20 shadow-sm"
                      }`}
                    >
                      <span className="text-lg">🚌</span>
                      <span className="text-sm font-medium whitespace-nowrap">초정밀 버스</span>
                      <div
                        className={`ml-auto w-10 h-5 rounded-full transition-all relative backdrop-blur-sm ${
                          isBusLinesEnabled
                            ? "bg-green-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                            : "bg-white/35 border border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                            isBusLinesEnabled
                              ? "translate-x-5 bg-white shadow-md"
                              : "translate-x-0.5 bg-white border border-white/50 shadow-sm"
                          }`}
                        />
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 현재 위치 버튼 */}
            <button
              onClick={handleMyLocation}
              className="bg-white/20 backdrop-blur-md rounded-[14px] size-[40px] flex items-center justify-center border border-white/30 shadow-lg hover:bg-white/30 active:bg-white/25 active:scale-95 transition-all"
              title="내 위치로 이동"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="black" strokeWidth="2.5"/>
                <path d="M12 2V6" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M12 18V22" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M2 12H6" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M18 12H22" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* 버스 번호 입력 모달 */}
        {showBusInputModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/20 backdrop-blur-lg rounded-[16px] shadow-2xl border border-white/30 p-6 mx-4 max-w-[400px] w-full">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                버스 번호 입력
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                추적할 버스 번호를 입력하세요 (최대 5개, 쉼표로 구분)
              </p>
              <input
                type="text"
                value={busNumberInput}
                onChange={(e) => setBusNumberInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleBusInputConfirm();
                  }
                }}
                placeholder="예: 360, 472, 151"
                className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm border border-white/40 rounded-[12px] text-base text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-white/60 focus:bg-white/40 transition-all mb-4"
                autoFocus
              />
              {trackedBusNumbers.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-700 mb-2">현재 추적 중:</p>
                  <div className="flex flex-wrap gap-2">
                    {trackedBusNumbers.map((num) => (
                      <span
                        key={num}
                        className="px-3 py-1 bg-white/40 backdrop-blur-sm text-gray-900 text-sm rounded-full border border-white/30"
                      >
                        {num}번
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleBusInputCancel}
                  className="flex-1 py-3 bg-white/30 backdrop-blur-sm text-gray-900 font-medium rounded-[12px] hover:bg-white/40 active:bg-white/50 border border-white/30 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                >
                  취소
                </button>
                <button
                  onClick={handleBusInputConfirm}
                  className="flex-1 py-3 bg-white/40 backdrop-blur-sm text-gray-900 font-medium rounded-[12px] hover:bg-white/50 active:bg-white/60 border border-white/30 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        )}

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
      {/* 지도 배경 - z-0으로 UI 요소들보다 아래에 배치 */}
      <div className="absolute inset-0 z-0">
        {mapContent}
      </div>

      {/* 경주취소 버튼 - 좌상단에 배치 */}
      <button
        onClick={handleCancelRoute}
        className="absolute left-[20px] top-[16px] bg-gradient-to-b from-[#00f2fe] to-[#4facfe] rounded-[16px] border-[3px] border-black shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] px-[20px] py-[3px] hover:scale-105 transition-transform z-30"
      >
        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[18px]">
          경주취소
        </p>
      </button>

      {/* 오른쪽 세로 버튼 컨테이너 (레이어, 현재 위치) */}
      <div className="absolute top-[20px] right-5 flex flex-col gap-3 z-10 pointer-events-none">
        {/* 레이어 버튼 */}
        <div className="relative">
          <button
            ref={layerButtonRef}
            onClick={() => setIsLayerPopoverOpen(!isLayerPopoverOpen)}
            className={`bg-white/20 backdrop-blur-md rounded-[14px] size-[40px] flex items-center justify-center border border-white/30 shadow-lg hover:bg-white/30 active:bg-white/25 active:scale-95 transition-all pointer-events-auto ${
              isLayerPopoverOpen ? "bg-white/30" : ""
            }`}
            title="레이어"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 레이어 팝오버 */}
          {isLayerPopoverOpen && (
            <div
              ref={popoverRef}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-[48px] top-0 bg-white/20 backdrop-blur-lg rounded-[12px] shadow-xl border border-white/30 p-4 min-w-[200px] z-20 pointer-events-auto"
            >
              <div className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-white/20">
                지도 스타일
              </div>
              <div className="flex flex-col gap-2">
                {(Object.keys(MAP_STYLES) as MapStyleType[]).map((styleKey) => (
                  <button
                    key={styleKey}
                    onClick={() => handleStyleChange(styleKey)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      mapStyle === styleKey
                        ? "bg-white/40 text-gray-900 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                        : "hover:bg-white/30 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                    }`}
                  >
                    <span className="text-lg">{MAP_STYLES[styleKey].icon}</span>
                    <span className="text-sm font-medium">{MAP_STYLES[styleKey].name}</span>
                    {mapStyle === styleKey && (
                      <svg className="ml-auto w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {/* 레이어 옵션 섹션 */}
              <div className="text-sm font-bold text-gray-800 mt-4 mb-3 pt-3 pb-2 border-t border-b border-white/20">
                레이어 옵션
              </div>
              <div className="flex flex-col gap-2">
                {/* 3D 건물 토글 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handle3DBuildingsToggle();
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    is3DBuildingsEnabled
                      ? "bg-white/50 text-gray-900 backdrop-blur-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] border border-white/40"
                      : "bg-white/25 hover:bg-white/35 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-white/20 shadow-sm"
                  }`}
                >
                  <span className="text-lg">🏢</span>
                  <span className="text-sm font-medium">3D 건물</span>
                  <div
                    className={`ml-auto w-10 h-5 rounded-full transition-all relative backdrop-blur-sm ${
                      is3DBuildingsEnabled
                        ? "bg-green-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                        : "bg-white/35 border border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                        is3DBuildingsEnabled
                          ? "translate-x-5 bg-white shadow-md"
                          : "translate-x-0.5 bg-white border border-white/50 shadow-sm"
                      }`}
                    />
                  </div>
                </button>

                {/* 지하철 노선 토글 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubwayLinesToggle();
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isSubwayLinesEnabled
                      ? "bg-white/50 text-gray-900 backdrop-blur-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] border border-white/40"
                      : "bg-white/25 hover:bg-white/35 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-white/20 shadow-sm"
                  }`}
                >
                  <span className="text-lg">🚇</span>
                  <span className="text-sm font-medium whitespace-nowrap">지하철 노선</span>
                  <div
                    className={`ml-auto w-10 h-5 rounded-full transition-all relative backdrop-blur-sm ${
                      isSubwayLinesEnabled
                        ? "bg-green-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                        : "bg-white/35 border border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                        isSubwayLinesEnabled
                          ? "translate-x-5 bg-white shadow-md"
                          : "translate-x-0.5 bg-white border border-white/50 shadow-sm"
                      }`}
                    />
                  </div>
                </button>

                {/* 버스 노선 토글 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBusLinesToggle();
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isBusLinesEnabled
                      ? "bg-white/50 text-gray-900 backdrop-blur-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] border border-white/40"
                      : "bg-white/25 hover:bg-white/35 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-white/20 shadow-sm"
                  }`}
                >
                  <span className="text-lg">🚌</span>
                  <span className="text-sm font-medium whitespace-nowrap">초정밀 버스</span>
                  <div
                    className={`ml-auto w-10 h-5 rounded-full transition-all relative backdrop-blur-sm ${
                      isBusLinesEnabled
                        ? "bg-green-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                        : "bg-white/35 border border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                        isBusLinesEnabled
                          ? "translate-x-5 bg-white shadow-md"
                          : "translate-x-0.5 bg-white border border-white/50 shadow-sm"
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 현재 위치 버튼 */}
        <button
          onClick={handleMyLocation}
          className="bg-white/20 backdrop-blur-md rounded-[14px] size-[40px] flex items-center justify-center border border-white/30 shadow-lg hover:bg-white/30 active:bg-white/25 active:scale-95 transition-all pointer-events-auto"
          title="내 위치로 이동"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="black" strokeWidth="2.5"/>
            <path d="M12 2V6" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M12 18V22" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M2 12H6" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M18 12H22" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* GPS 상태 표시 - 좌측 (경주취소 버튼 아래) */}
      <div className="absolute left-[20px] top-[60px] z-30">
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
      {isRankingVisible ? (
        <div
          className="absolute left-[20.05px] right-[20.05px] z-20 transition-all"
          style={{
            bottom: `calc(${sheetHeight}% + 30px)`,
            transitionDuration: isDragging ? "0ms" : "300ms",
          }}
        >
          {rankingCard}
        </div>
      ) : (
        /* 순위창 토글 버튼 - 순위창이 숨겨졌을 때 표시 (오른쪽 배치) */
        <button
          onClick={() => setIsRankingVisible(true)}
          className="absolute right-[20.05px] z-20 bg-[#ffd93d] rounded-[12px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] px-4 py-2 flex items-center hover:scale-105 active:shadow-[2px_2px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all"
          style={{
            bottom: `calc(${sheetHeight}% + 30px)`,
            transitionDuration: isDragging ? "0ms" : "300ms",
          }}
        >
          <span className="font-['Wittgenstein',sans-serif] text-[11px] text-black font-bold">순위 보기</span>
        </button>
      )}

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

      {/* 버스 번호 입력 모달 */}
      {showBusInputModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/20 backdrop-blur-lg rounded-[16px] shadow-2xl border border-white/30 p-6 mx-4 max-w-[400px] w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              버스 번호 입력
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              추적할 버스 번호를 입력하세요 (최대 5개, 쉼표로 구분)
            </p>
            <input
              type="text"
              value={busNumberInput}
              onChange={(e) => setBusNumberInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleBusInputConfirm();
                }
              }}
              placeholder="예: 360, 472, 151"
              className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm border border-white/40 rounded-[12px] text-base text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-white/60 focus:bg-white/40 transition-all mb-4"
              autoFocus
            />
            {trackedBusNumbers.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-700 mb-2">현재 추적 중:</p>
                <div className="flex flex-wrap gap-2">
                  {trackedBusNumbers.map((num) => (
                    <span
                      key={num}
                      className="px-3 py-1 bg-white/40 backdrop-blur-sm text-gray-900 text-sm rounded-full border border-white/30"
                    >
                      {num}번
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleBusInputCancel}
                className="flex-1 py-3 bg-white/30 backdrop-blur-sm text-gray-900 font-medium rounded-[12px] hover:bg-white/40 active:bg-white/50 border border-white/30 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
              >
                취소
              </button>
              <button
                onClick={handleBusInputConfirm}
                className="flex-1 py-3 bg-white/40 backdrop-blur-sm text-gray-900 font-medium rounded-[12px] hover:bg-white/50 active:bg-white/60 border border-white/30 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

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
