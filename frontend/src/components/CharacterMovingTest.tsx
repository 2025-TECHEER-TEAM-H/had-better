import 'mapbox-gl/dist/mapbox-gl.css';
import { useEffect, useRef, useState } from 'react';
import { Map, type MapRef } from 'react-map-gl/mapbox';
import * as turf from '@turf/turf';
import type { Feature, LineString } from 'geojson';
import { registerNaviSprites } from './map/naviSprite';
import { addNaviLayer, updateNaviFeature, type LngLat } from './map/naviLayer';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

// API 응답 형태를 모방한 위치 데이터 타입
interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: string;
}

// 경로 세그먼트 타입 (백엔드 API 응답)
interface RouteSegment {
  segment_id: number;
  mode: string;
  pathCoordinates: number[][];  // [[lon, lat], [lon, lat], ...]
  geojson?: {
    type: 'LineString';
    coordinates: number[][];
  };
}

// 버스 경로 상수 (컴포넌트 외부에 선언하여 재생성 방지)
const DEPARTURE: LngLat = [126.724759, 37.49384712];
const DESTINATION: LngLat = [126.702531136, 37.508692342];

/**
 * 캐릭터 이동 테스트 컴포넌트
 * - 30초마다 더미 위치 데이터 생성
 * - 위치 간 부드러운 보간 이동
 * - 걷기 애니메이션 (120ms 간격)
 */
export function CharacterMovingTest() {
  const mapRef = useRef<MapRef>(null);

  // 현재 위치 데이터
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [previousLocation, setPreviousLocation] = useState<LocationData | null>(null);

  // 애니메이션 제어
  const walkFrameRef = useRef(0);
  const animationLoopRef = useRef<number | null>(null);

  // 현재 캐릭터 상태
  const currentPositionRef = useRef<LngLat>(DEPARTURE); // 출발지에서 시작
  const currentBearingRef = useRef<number>(0);

  // 경로 데이터 (백엔드에서 받은 실제 도로 경로)
  const routeLineRef = useRef<Feature<LineString> | null>(null);
  const routeLengthRef = useRef<number>(0); // 전체 경로 길이 (km)

  // 보간 관련 상태 (경로 기반)
  const interpolationStateRef = useRef<{
    isInterpolating: boolean;
    startDistance: number;  // 경로 시작점부터의 거리 (km)
    endDistance: number;    // 경로 시작점부터의 거리 (km)
    startTime: number;
    duration: number;
  } | null>(null);

  // ========== 지도 로드 및 스프라이트 등록 ==========
  const onMapLoad = async () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    try {
      // 캐릭터 스프라이트 등록
      await registerNaviSprites(map);
      addNaviLayer(map, currentPositionRef.current);
      console.log('✅ 테스트 지도 초기화 완료');

      // 걷기 애니메이션 시작
      startWalkingAnimation(map);
    } catch (err) {
      console.error('❌ 스프라이트 로드 실패:', err);
    }
  };

  // ========== 걷기 애니메이션 + 경로 기반 보간 (120ms 간격) ==========
  const startWalkingAnimation = (map: mapboxgl.Map) => {
    const animate = () => {
      walkFrameRef.current = (walkFrameRef.current + 1) % 4;

      // 보간 중이라면 위치 업데이트 (경로 기반)
      const interpState = interpolationStateRef.current;
      const routeLine = routeLineRef.current;

      if (interpState && interpState.isInterpolating && routeLine) {
        const elapsed = Date.now() - interpState.startTime;
        const t = Math.min(elapsed / interpState.duration, 1); // 0 ~ 1

        // 경로 위에서의 거리 보간
        const currentDistance =
          interpState.startDistance +
          (interpState.endDistance - interpState.startDistance) * t;

        // 경로선을 따라 해당 거리만큼 이동한 지점의 좌표 구하기
        const pointOnRoute = turf.along(routeLine, currentDistance);
        const coordinates = pointOnRoute.geometry.coordinates as [number, number];

        currentPositionRef.current = coordinates;

        // 보간 완료 확인
        if (t >= 1) {
          interpolationStateRef.current = null;
          console.log('✅ 경로 기반 보간 이동 완료');
        }

        // 진행률 로그 (10% 단위)
        if (Math.floor(t * 10) !== Math.floor((t - 0.01) * 10)) {
          console.log(`🚶 진행률: ${(t * 100).toFixed(0)}% - 경로상 거리: ${currentDistance.toFixed(3)}km - 위치: ${coordinates[1].toFixed(6)}, ${coordinates[0].toFixed(6)}`);
        }
      }

      // 현재 위치로 지도 업데이트
      const currentPos = currentPositionRef.current;
      const currentBear = currentBearingRef.current;

      updateNaviFeature(
        map,
        currentPos,
        currentBear,
        walkFrameRef.current,
        'walking'
      );

      animationLoopRef.current = window.setTimeout(animate, 120);
    };

    animate();
    console.log('🎬 걷기 애니메이션 시작 (경로 기반 보간)');
  };

  // ========== 경로 데이터 생성 (더미 데이터로 테스트) ==========
  useEffect(() => {
    const fetchRouteData = async () => {
      // 더미 경로 데이터 (부평역 → 신촌역 실제 도로 경로 시뮬레이션)
      // 실제로는 백엔드 API에서 받아올 데이터
      const dummyRouteCoordinates: [number, number][] = [
        // 출발: 부평역
        [126.724759, 37.49384712],

        // 경인로를 따라 서울 방향으로 이동
        [126.722, 37.495],
        [126.720, 37.496],
        [126.718, 37.497],
        [126.716, 37.498],
        [126.714, 37.499],
        [126.712, 37.500],
        [126.710, 37.501],
        [126.708, 37.502],
        [126.706, 37.504],
        [126.704, 37.506],

        // 도착: 신촌역 근처
        [126.702531136, 37.508692342],
      ];

      const routeLine = turf.lineString(dummyRouteCoordinates);
      routeLineRef.current = routeLine;

      const length = turf.length(routeLine, { units: 'kilometers' });
      routeLengthRef.current = length;

      console.log('✅ 더미 경로 데이터 생성 완료');
      console.log(`📏 전체 경로 길이: ${length.toFixed(2)}km`);
      console.log(`📍 좌표 개수: ${dummyRouteCoordinates.length}개`);
      console.log('💡 실제 도로를 따라 이동하는 경로 시뮬레이션');

      // 백엔드 API 연동 코드 (주석 처리)
      /*
      try {
        const routeLegId = 1;
        console.log(`🔄 경로 데이터 로딩 중... (route_leg_id: ${routeLegId})`);

        const response = await fetch(`http://localhost:8000/api/v1/itineraries/legs/${routeLegId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`API 오류: ${response.status}`);
        }

        const result = await response.json();
        const legData = result.data;
        const rawLegs = legData.legs || [];

        const allCoords: [number, number][] = [];
        for (const segment of rawLegs) {
          const passShape = segment.passShape?.linestring || '';
          if (passShape) {
            const points = passShape.trim().split(' ');
            for (const point of points) {
              const [lon, lat] = point.split(',').map(Number);
              if (!isNaN(lon) && !isNaN(lat)) {
                allCoords.push([lon, lat]);
              }
            }
          }
        }

        const routeLine = turf.lineString(allCoords);
        routeLineRef.current = routeLine;

        console.log('✅ 백엔드 API에서 경로 데이터 로드 완료');
      } catch (error) {
        console.error('❌ 경로 데이터 로드 실패:', error);
      }
      */
    };

    fetchRouteData();
  }, []);

  // ========== API 시뮬레이션: 30초마다 새 좌표 수신 ==========
  useEffect(() => {
    // 경로 데이터가 준비될 때까지 대기
    if (!routeLineRef.current) return;

    // 초기 위치: 출발지
    const initialLocation: LocationData = {
      latitude: DEPARTURE[1],
      longitude: DEPARTURE[0],
      timestamp: new Date().toISOString(),
    };
    setCurrentLocation(initialLocation);
    console.log('🚌 출발지 설정:', `${initialLocation.latitude}, ${initialLocation.longitude}`);

    // 목적지까지의 거리 계산 (Haversine formula)
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371; // 지구 반경 (km)
    const dLat = toRad(DESTINATION[1] - DEPARTURE[1]);
    const dLon = toRad(DESTINATION[0] - DEPARTURE[0]);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(DEPARTURE[1])) *
        Math.cos(toRad(DESTINATION[1])) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const totalDistance = R * c; // km

    console.log(`📏 총 거리: ${totalDistance.toFixed(2)}km`);

    // 버스 속도: 30km/h
    // 30초마다 API에서 위치 수신 → 30초에 약 250m 이동
    const busSpeed = 30; // km/h
    const API_UPDATE_INTERVAL = 30; // 초 (API 호출 주기)
    const distancePerUpdate = (busSpeed * 1000 * API_UPDATE_INTERVAL) / 3600; // 미터

    // 총 API 호출 횟수
    const totalUpdates = Math.ceil((totalDistance * 1000) / distancePerUpdate);
    console.log(`🔢 총 API 호출 횟수: ${totalUpdates}회 (${API_UPDATE_INTERVAL}초 간격)`);
    console.log(`⏱️ 예상 소요 시간: ${((totalUpdates * API_UPDATE_INTERVAL) / 60).toFixed(1)}분`);
    console.log(`📏 30초당 이동 거리: ${distancePerUpdate.toFixed(0)}m`);

    let currentUpdate = 0;

    // 30초마다 API에서 새 좌표를 받는 것을 시뮬레이션
    const interval = setInterval(() => {
      setCurrentLocation((prev) => {
        if (!prev) return prev;

        currentUpdate++;

        // 목적지 도착
        if (currentUpdate >= totalUpdates) {
          console.log('🎯 목적지 도착!');
          clearInterval(interval);
          return {
            latitude: DESTINATION[1],
            longitude: DESTINATION[0],
            timestamp: new Date().toISOString(),
          };
        }

        // 이전 위치 저장 (보간 시작점)
        setPreviousLocation(prev);

        // 진행률 계산 (0 ~ 1)
        const progress = currentUpdate / totalUpdates;

        // 다음 API 응답 좌표 계산
        const newLocation: LocationData = {
          latitude: DEPARTURE[1] + (DESTINATION[1] - DEPARTURE[1]) * progress,
          longitude: DEPARTURE[0] + (DESTINATION[0] - DEPARTURE[0]) * progress,
          timestamp: new Date().toISOString(),
        };

        console.log('📡 API 응답 수신 (30초):', {
          이전: `${prev.latitude.toFixed(6)}, ${prev.longitude.toFixed(6)}`,
          신규: `${newLocation.latitude.toFixed(6)}, ${newLocation.longitude.toFixed(6)}`,
          진행률: `${(progress * 100).toFixed(1)}%`,
        });

        return newLocation;
      });
    }, API_UPDATE_INTERVAL * 1000);

    return () => clearInterval(interval);
  }, []); // DEPARTURE, DESTINATION은 상수이므로 dependency에서 제외

  // ========== 위치 변경 시 경로 기반 보간 상태 설정 ==========
  useEffect(() => {
    if (!currentLocation || !previousLocation || !routeLineRef.current) return;

    const routeLine = routeLineRef.current;

    const startPos = turf.point([previousLocation.longitude, previousLocation.latitude]);
    const endPos = turf.point([currentLocation.longitude, currentLocation.latitude]);

    // 이전 위치와 현재 위치를 경로선 위로 스냅 (가장 가까운 지점 찾기)
    const prevPointOnLine = turf.nearestPointOnLine(routeLine, startPos);
    const currentPointOnLine = turf.nearestPointOnLine(routeLine, endPos);

    // 경로 시작점부터의 거리 (km)
    const startDistance = prevPointOnLine.properties.location || 0;
    const endDistance = currentPointOnLine.properties.location || 0;

    console.log('🎯 경로 기반 보간 준비:', {
      이전위치: `${previousLocation.latitude.toFixed(6)}, ${previousLocation.longitude.toFixed(6)}`,
      현재위치: `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`,
      시작거리: `${startDistance.toFixed(3)}km`,
      종료거리: `${endDistance.toFixed(3)}km`,
      이동거리: `${((endDistance - startDistance) * 1000).toFixed(0)}m`,
    });

    // Bearing 계산 (방향)
    const dLng = ((currentLocation.longitude - previousLocation.longitude) * Math.PI) / 180;
    const lat1 = (previousLocation.latitude * Math.PI) / 180;
    const lat2 = (currentLocation.latitude * Math.PI) / 180;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const bearing = ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;

    currentBearingRef.current = bearing;

    // 경로 기반 보간 상태 설정 (애니메이션 루프에서 처리)
    interpolationStateRef.current = {
      isInterpolating: true,
      startDistance,
      endDistance,
      startTime: Date.now(),
      duration: 30000, // 30초 (API 업데이트 주기와 동일)
    };

    console.log('🚶 경로 기반 보간 이동 시작 (30초 동안)');
  }, [currentLocation, previousLocation]);

  // ========== Cleanup ==========
  useEffect(() => {
    return () => {
      if (animationLoopRef.current) clearTimeout(animationLoopRef.current);
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      {/* 지도 */}
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: DEPARTURE[0],
          latitude: DEPARTURE[1],
          zoom: 14,
        }}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: '100%', height: '100%' }}
        onLoad={onMapLoad}
      />

      {/* 정보 패널 */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
        <h2 className="text-lg font-bold mb-2">🚌 버스 이동 시뮬레이션 (API 연동)</h2>
        <div className="space-y-2 text-sm">
          <p><strong>출발지:</strong></p>
          <p className="text-xs font-mono text-gray-600">
            {DEPARTURE[1].toFixed(6)}, {DEPARTURE[0].toFixed(6)}
          </p>
          <p><strong>목적지:</strong></p>
          <p className="text-xs font-mono text-gray-600">
            {DESTINATION[1].toFixed(6)}, {DESTINATION[0].toFixed(6)}
          </p>
          <p><strong>현재 위치:</strong></p>
          {currentLocation && (
            <p className="text-xs font-mono text-blue-600">
              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </p>
          )}
          <p className="text-gray-600 mt-2 text-xs">
            🚌 버스 속도: 30km/h<br />
            📡 API: 30초마다 좌표 수신<br />
            🛣️ 경로: 백엔드 API에서 실제 도로 경로 로드<br />
            🔧 Turf.js로 경로선 따라 보간<br />
            🚶 30초 동안 부드럽게 이동<br />
            🎬 걷기 애니메이션 (120ms)
          </p>
          <p className="text-blue-600 mt-2 text-xs font-bold">
            💡 콘솔에서 상세 로그 확인
          </p>
          <p className="text-yellow-600 mt-2 text-xs">
            ⚠️ 더미 데이터로 테스트 중<br />
            실제 API 연동 시 주석 해제 필요
          </p>
        </div>
      </div>
    </div>
  );
}
