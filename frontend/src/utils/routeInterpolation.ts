/**
 * Turf.js를 사용한 경로 기반 보간 유틸리티
 *
 * 버스/지하철이 실제 도로/노선을 따라 이동하도록 보간합니다.
 * - 직선 보간 대신 경로를 따라 이동
 * - API 업데이트 사이의 부드러운 애니메이션
 */

import * as turf from '@turf/turf';
import type { Feature, LineString } from 'geojson';
import type { Coordinate, RouteSegment } from '@/types/route';

// 보간 상태 타입
export interface InterpolationState {
  isInterpolating: boolean;
  startDistance: number; // 시작 거리 (km)
  endDistance: number; // 종료 거리 (km)
  startTime: number; // 시작 시간 (ms)
  duration: number; // 보간 시간 (ms)
  currentDistance: number; // 현재 거리 (km)
}

// 보간 결과 타입
export interface InterpolationResult {
  coordinates: [number, number]; // [lon, lat]
  bearing: number; // 이동 방향 (0~360)
  progress: number; // 0~1
  isComplete: boolean;
}

/**
 * 경로 좌표 배열로 LineString 생성
 */
export function createRouteLine(
  coordinates: [number, number][]
): Feature<LineString> {
  return turf.lineString(coordinates);
}

/**
 * 여러 세그먼트의 좌표를 하나의 경로로 합치기
 */
export function mergeSegmentCoordinates(
  segments: RouteSegment[]
): [number, number][] {
  const allCoords: [number, number][] = [];

  segments.forEach((segment) => {
    if (segment.path_coordinates && segment.path_coordinates.length > 0) {
      // 중복 좌표 제거 (이전 세그먼트 끝점과 현재 세그먼트 시작점)
      if (allCoords.length > 0) {
        const lastCoord = allCoords[allCoords.length - 1];
        const firstCoord = segment.path_coordinates[0];
        if (
          lastCoord[0] === firstCoord[0] &&
          lastCoord[1] === firstCoord[1]
        ) {
          // 첫 좌표 건너뛰기
          allCoords.push(...segment.path_coordinates.slice(1));
        } else {
          allCoords.push(...segment.path_coordinates);
        }
      } else {
        allCoords.push(...segment.path_coordinates);
      }
    } else {
      // path_coordinates가 없으면 시작-끝 좌표로 직선 생성
      allCoords.push([segment.start_lon, segment.start_lat]);
      allCoords.push([segment.end_lon, segment.end_lat]);
    }
  });

  return allCoords;
}

/**
 * 전체 경로 길이 계산 (km)
 */
export function calculateRouteLength(routeLine: Feature<LineString>): number {
  return turf.length(routeLine, { units: 'kilometers' });
}

/**
 * 점을 경로선 위로 스냅하고 경로 시작점부터의 거리 반환
 */
export function snapToRoute(
  routeLine: Feature<LineString>,
  point: Coordinate
): { snappedPoint: [number, number]; distance: number } {
  const pt = turf.point([point.lon, point.lat]);
  const snapped = turf.nearestPointOnLine(routeLine, pt);

  return {
    snappedPoint: snapped.geometry.coordinates as [number, number],
    distance: snapped.properties.location || 0, // km
  };
}

/**
 * 경로 시작점부터 특정 거리의 좌표 반환
 */
export function getPointAtDistance(
  routeLine: Feature<LineString>,
  distance: number
): [number, number] {
  const point = turf.along(routeLine, distance, { units: 'kilometers' });
  return point.geometry.coordinates as [number, number];
}

/**
 * 두 점 사이의 방향(Bearing) 계산
 * 0° = 북쪽, 90° = 동쪽, 180° = 남쪽, 270° = 서쪽
 */
export function calculateBearing(
  from: [number, number],
  to: [number, number]
): number {
  const fromPoint = turf.point(from);
  const toPoint = turf.point(to);
  const bearing = turf.bearing(fromPoint, toPoint);
  // -180~180을 0~360으로 변환
  return (bearing + 360) % 360;
}

/**
 * 경로 따라 거리 기반 보간
 * startDistance에서 endDistance까지 t(0~1) 비율만큼 이동한 좌표 반환
 */
export function interpolateAlongRoute(
  routeLine: Feature<LineString>,
  startDistance: number,
  endDistance: number,
  t: number
): InterpolationResult {
  // t를 0~1 범위로 클램핑
  const clampedT = Math.max(0, Math.min(1, t));

  // 현재 거리 계산
  const currentDistance =
    startDistance + (endDistance - startDistance) * clampedT;

  // 현재 좌표
  const currentCoord = getPointAtDistance(routeLine, currentDistance);

  // 방향 계산 (약간 앞의 점과 비교)
  const aheadDistance = Math.min(
    currentDistance + 0.01, // 10m 앞
    endDistance
  );
  const aheadCoord = getPointAtDistance(routeLine, aheadDistance);
  const bearing = calculateBearing(currentCoord, aheadCoord);

  return {
    coordinates: currentCoord,
    bearing,
    progress: clampedT,
    isComplete: clampedT >= 1,
  };
}

/**
 * 시간 기반 보간 (애니메이션 루프용)
 */
export function interpolateByTime(
  routeLine: Feature<LineString>,
  state: InterpolationState
): InterpolationResult {
  const now = Date.now();
  const elapsed = now - state.startTime;
  const t = Math.min(elapsed / state.duration, 1);

  return interpolateAlongRoute(
    routeLine,
    state.startDistance,
    state.endDistance,
    t
  );
}

/**
 * 새 위치 업데이트 시 보간 상태 생성
 */
export function createInterpolationState(
  routeLine: Feature<LineString>,
  previousPosition: Coordinate | null,
  currentPosition: Coordinate,
  duration: number = 5000 // 기본 5초
): InterpolationState {
  // 이전 위치가 없으면 현재 위치에서 시작
  const startSnap = previousPosition
    ? snapToRoute(routeLine, previousPosition)
    : snapToRoute(routeLine, currentPosition);

  const endSnap = snapToRoute(routeLine, currentPosition);

  return {
    isInterpolating: true,
    startDistance: startSnap.distance,
    endDistance: endSnap.distance,
    startTime: Date.now(),
    duration,
    currentDistance: startSnap.distance,
  };
}

/**
 * 두 좌표 사이의 직선 거리 계산 (m)
 */
export function calculateDistance(
  from: Coordinate,
  to: Coordinate
): number {
  const fromPoint = turf.point([from.lon, from.lat]);
  const toPoint = turf.point([to.lon, to.lat]);
  return turf.distance(fromPoint, toPoint, { units: 'meters' });
}

/**
 * 좌표가 목적지 반경 내에 있는지 확인
 */
export function isWithinRadius(
  point: Coordinate,
  destination: Coordinate,
  radiusMeters: number = 50
): boolean {
  const distance = calculateDistance(point, destination);
  return distance <= radiusMeters;
}

/**
 * 경로선을 GeoJSON 형식으로 변환 (Mapbox 레이어용)
 */
export function routeLineToGeoJSON(
  coordinates: [number, number][],
  properties: Record<string, unknown> = {}
): Feature<LineString> {
  return turf.lineString(coordinates, properties);
}

/**
 * TMAP passShape 문자열을 좌표 배열로 변환
 * "lon1,lat1 lon2,lat2 ..." -> [[lon1, lat1], [lon2, lat2], ...]
 */
export function parsePassShape(passShape: string): [number, number][] {
  return passShape.split(' ').map((coord) => {
    const [lon, lat] = coord.split(',').map(Number);
    return [lon, lat];
  });
}
