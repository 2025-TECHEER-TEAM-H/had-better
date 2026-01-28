import { Player } from "@/stores/routeStore";
import * as turf from "@turf/turf";
import { useCallback, useEffect, useRef, useState } from "react";

interface LegTiming {
  legIndex: number;
  mode: string;
  startTime: number;
  endTime: number;
  startDistance: number;
  endDistance: number;
}

interface UseRouteSimulationProps {
  departure: { lat: number; lon: number; name: string } | null;
  arrival: { lat: number; lon: number; name: string } | null;
  assignments: Map<Player, number>;
  legDetails: Map<number, any>;
  onUserArrived: () => Promise<void>;
}

export function useRouteSimulation({
  departure,
  arrival,
  assignments,
  legDetails,
  onUserArrived,
}: UseRouteSimulationProps) {
  // 상태 관리
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [distanceToDestination, setDistanceToDestination] = useState<number | null>(null);
  const [distanceFromRoute, setDistanceFromRoute] = useState<number | null>(null);
  const [isOffRoute, setIsOffRoute] = useState(false);
  const [isUserArrived, setIsUserArrived] = useState(false);
  const [isGpsTracking, setIsGpsTracking] = useState(false);
  const [isGpsTestMode, setIsGpsTestMode] = useState(false);
  const [isUserAutoMoving, setIsUserAutoMoving] = useState(false);
  const [playerProgress, setPlayerProgress] = useState<Map<Player, number>>(
    new Map([['user', 0], ['bot1', 0], ['bot2', 0]])
  );
  const [finishTimes, setFinishTimes] = useState<Map<Player, number>>(new Map());

  // Refs
  const gpsWatchId = useRef<number | null>(null);
  const gpsTestRef = useRef<number | null>(null);
  const gpsTestLastUpdate = useRef<number>(0);
  const userAutoMoveRef = useRef<number | null>(null);
  const raceStartTime = useRef<number | null>(null);
  const [_gpsTestProgress, setGpsTestProgress] = useState(0);

  // 상수
  const ARRIVAL_THRESHOLD = 20;
  const OFF_ROUTE_THRESHOLD = 100;  // 경고 시작 (100m 초과)

  // 유틸리티: 경로 LineString 생성
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
      } else if (leg.steps && leg.steps.length > 0) {
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
        allCoordinates.push([leg.start.lon, leg.start.lat]);
        allCoordinates.push([leg.end.lon, leg.end.lat]);
      }
    }

    if (allCoordinates.length < 2) return null;
    return turf.lineString(allCoordinates);
  }, [assignments, legDetails]);

  // 진행률 업데이트 함수 (SSE에서 호출용)
  const updatePlayerProgress = useCallback((player: Player, progress: number) => {
    setPlayerProgress((prev) => {
      const next = new Map(prev);
      next.set(player, progress);
      return next;
    });
  }, []);

  // 도착 처리
  const handleFinish = useCallback(() => {
    setIsUserArrived(true);
    setPlayerProgress((prev) => {
      const next = new Map(prev);
      next.set('user', 1);
      return next;
    });
    setFinishTimes((prev) => {
      if (!prev.has('user')) {
        const next = new Map(prev);
        next.set('user', Date.now());
        return next;
      }
      return prev;
    });
    onUserArrived();
  }, [onUserArrived]);

  // GPS 위치 업데이트 핸들러
  const handlePositionUpdate = useCallback((position: GeolocationPosition | { coords: { longitude: number; latitude: number } }) => {
    const { longitude, latitude } = position.coords;
    const currentLocation: [number, number] = [longitude, latitude];
    setUserLocation(currentLocation);

    if (arrival) {
      const destPoint = turf.point([arrival.lon, arrival.lat]);
      const userPoint = turf.point(currentLocation);
      const distance = turf.distance(userPoint, destPoint, { units: 'meters' });
      setDistanceToDestination(Math.round(distance));

      if (distance <= ARRIVAL_THRESHOLD && !isUserArrived) {
        handleFinish();
      }
    }

    const userRouteLine = getRouteLineString('user');
    if (userRouteLine) {
      const userPoint = turf.point(currentLocation);
      const distFromRoute = turf.pointToLineDistance(userPoint, userRouteLine, { units: 'meters' });
      setDistanceFromRoute(Math.round(distFromRoute));
      setIsOffRoute(distFromRoute > OFF_ROUTE_THRESHOLD);

      if (departure && arrival) {
        const totalDistance = turf.length(userRouteLine, { units: 'meters' });
        const startPoint = turf.point([departure.lon, departure.lat]);
        const nearestPoint = turf.nearestPointOnLine(userRouteLine, userPoint);
        const distanceFromStart = turf.distance(startPoint, nearestPoint, { units: 'meters' });
        const progress = Math.min(distanceFromStart / totalDistance, 1);
        updatePlayerProgress('user', progress);
      }
    }
  }, [arrival, departure, isUserArrived, getRouteLineString, handleFinish, updatePlayerProgress]);

  // 실제 GPS 추적 시작/중지
  const startGpsTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    setIsGpsTracking(true);
    gpsWatchId.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      (err) => console.error(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [handlePositionUpdate]);

  const stopGpsTracking = useCallback(() => {
    setIsGpsTracking(false);
    if (gpsWatchId.current !== null) {
      navigator.geolocation.clearWatch(gpsWatchId.current);
      gpsWatchId.current = null;
    }
  }, []);

  // GPS 테스트 모드 로직
  const updateTestGpsPosition = useCallback((progress: number) => {
    const userRouteLine = getRouteLineString('user');
    if (!userRouteLine) return;

    const totalLength = turf.length(userRouteLine, { units: 'meters' });
    const currentDistance = totalLength * progress;
    const currentPoint = turf.along(userRouteLine, currentDistance, { units: 'meters' });
    const currentLocation = currentPoint.geometry.coordinates as [number, number];

    const jitter = 0.00005;
    const jitteredLocation: [number, number] = [
      currentLocation[0] + (Math.random() - 0.5) * jitter,
      currentLocation[1] + (Math.random() - 0.5) * jitter,
    ];

    handlePositionUpdate({ coords: { longitude: jitteredLocation[0], latitude: jitteredLocation[1] } });
  }, [getRouteLineString, handlePositionUpdate]);

  const startGpsTestMode = useCallback(() => {
    if (isGpsTestMode || isGpsTracking) return;
    stopGpsTracking();
    setIsGpsTestMode(true);
    setGpsTestProgress(0);
    gpsTestLastUpdate.current = Date.now();

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - gpsTestLastUpdate.current) / 1000;
      gpsTestLastUpdate.current = now;

      setGpsTestProgress((prev) => {
        const speed = 0.015;
        const newProgress = Math.min(prev + speed * deltaTime, 1);
        updateTestGpsPosition(newProgress);
        if (newProgress >= 1) return 1;
        return newProgress;
      });
      gpsTestRef.current = requestAnimationFrame(animate);
    };
    gpsTestRef.current = requestAnimationFrame(animate);
  }, [isGpsTestMode, isGpsTracking, stopGpsTracking, updateTestGpsPosition]);

  const stopGpsTestMode = useCallback(() => {
    setIsGpsTestMode(false);
    if (gpsTestRef.current !== null) {
      cancelAnimationFrame(gpsTestRef.current);
      gpsTestRef.current = null;
    }
  }, []);

  const resetGpsTestMode = useCallback(() => {
    stopGpsTestMode();
    setGpsTestProgress(0);
    setUserLocation(null);
    setDistanceToDestination(null);
    setDistanceFromRoute(null);
    setIsOffRoute(false);
    setIsUserArrived(false);
    setPlayerProgress(new Map([['user', 0], ['bot1', 0], ['bot2', 0]]));
    setFinishTimes(new Map());
  }, [stopGpsTestMode]);

  // 자동 이동 (legs 기반) 로직
  const calculateLegTimings = useCallback((legs: any[]): LegTiming[] => {
    const timings: LegTiming[] = [];
    let cumulativeTime = 0;
    let cumulativeDistance = 0;
    for (let i = 0; i < legs.length; i++) {
      const leg = legs[i];
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
    return timings;
  }, []);

  const findCurrentLeg = useCallback((timings: LegTiming[], elapsed: number): LegTiming | null => {
    return timings.find(t => elapsed >= t.startTime && elapsed < t.endTime) || timings[timings.length - 1] || null;
  }, []);

  const startUserAutoMove = useCallback(() => {
    if (isUserAutoMoving || isGpsTracking || isGpsTestMode) return;
    const userRouteLegId = assignments.get('user');
    if (!userRouteLegId) return;

    const detail = legDetails.get(userRouteLegId);
    if (!detail || !detail.legs || detail.legs.length === 0) return;

    const legTimings = calculateLegTimings(detail.legs);
    const totalTime = legTimings[legTimings.length - 1]?.endTime || 0;
    const routeLine = getRouteLineString('user');
    if (!routeLine) return;

    const routeLength = turf.length(routeLine, { units: 'meters' });
    setIsUserAutoMoving(true);
    raceStartTime.current = Date.now();

    const animate = () => {
      if (!raceStartTime.current) return;
      const elapsed = (Date.now() - raceStartTime.current) / 1000;
      const progress = Math.min(elapsed / totalTime, 1);
      const currentLeg = findCurrentLeg(legTimings, elapsed);

      let currentDistance = 0;
      if (currentLeg) {
        const legDuration = currentLeg.endTime - currentLeg.startTime;
        const legElapsed = elapsed - currentLeg.startTime;
        const legProgress = legDuration > 0 ? Math.min(legElapsed / legDuration, 1) : 1;
        const legDistance = currentLeg.endDistance - currentLeg.startDistance;
        currentDistance = currentLeg.startDistance + (legDistance * legProgress);
      } else {
        currentDistance = routeLength * progress;
      }

      const point = turf.along(routeLine, Math.min(currentDistance, routeLength), { units: 'meters' });
      const currentPosition = point.geometry.coordinates as [number, number];

      setUserLocation(currentPosition);
      updatePlayerProgress('user', progress);

      if (arrival) {
        const destPoint = turf.point([arrival.lon, arrival.lat]);
        const userPoint = turf.point(currentPosition);
        setDistanceToDestination(Math.round(turf.distance(userPoint, destPoint, { units: 'meters' })));
      }

      if (progress >= 1) {
        handleFinish();
        setIsUserAutoMoving(false);
        userAutoMoveRef.current = null;
        return;
      }
      userAutoMoveRef.current = requestAnimationFrame(animate);
    };
    userAutoMoveRef.current = requestAnimationFrame(animate);
  }, [isUserAutoMoving, isGpsTracking, isGpsTestMode, assignments, legDetails, calculateLegTimings, findCurrentLeg, getRouteLineString, arrival, handleFinish, updatePlayerProgress]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (gpsWatchId.current !== null) navigator.geolocation.clearWatch(gpsWatchId.current);
      if (gpsTestRef.current !== null) cancelAnimationFrame(gpsTestRef.current);
      if (userAutoMoveRef.current !== null) cancelAnimationFrame(userAutoMoveRef.current);
    };
  }, []);

  return {
    userLocation,
    distanceToDestination,
    distanceFromRoute,
    isOffRoute,
    isUserArrived,
    isGpsTracking,
    isGpsTestMode,
    isUserAutoMoving,
    playerProgress,
    finishTimes,
    startGpsTracking,
    stopGpsTracking,
    startGpsTestMode,
    stopGpsTestMode,
    resetGpsTestMode,
    startUserAutoMove,
    updatePlayerProgress,
    getPositionOnRoute: getRouteLineString, // 이름 변경 고려 필요
  };
}
