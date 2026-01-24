/**
 * 사용자 GPS 위치 및 거리 계산 훅
 * - GPS 위치 가져오기
 * - 특정 좌표까지의 거리 계산
 * - 거리 포맷팅
 */

import { useEffect, useCallback } from 'react';
import { useLocationStore } from '@/stores/locationStore';
import * as turf from '@turf/turf';

interface UseUserDistanceReturn {
  // 사용자 현재 위치 [경도, 위도]
  userLocation: [number, number] | null;
  // 로딩 상태
  isLoading: boolean;
  // 에러 메시지
  error: string | null;
  // 특정 좌표까지 거리 계산 (미터 단위)
  getDistanceTo: (targetLon: number, targetLat: number) => number | null;
  // 거리 포맷팅 (500m, 1.2km 등)
  formatDistance: (meters: number | null) => string;
  // GPS 위치 새로고침
  refreshLocation: () => void;
}

export function useUserDistance(): UseUserDistanceReturn {
  const {
    userLocation,
    isLoading,
    error,
    setUserLocation,
    setIsLoading,
    setError,
    setPermissionStatus,
  } = useLocationStore();

  // GPS 위치 가져오기
  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('이 브라우저에서는 GPS를 지원하지 않습니다.');
      return;
    }

    setIsLoading(true);

    // 권한 확인
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state as 'granted' | 'denied' | 'prompt');
      });
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setUserLocation([longitude, latitude]);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('위치 권한이 거부되었습니다.');
            setPermissionStatus('denied');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('위치 정보를 가져올 수 없습니다.');
            break;
          case err.TIMEOUT:
            setError('위치 요청 시간이 초과되었습니다.');
            break;
          default:
            setError('위치를 가져오는 중 오류가 발생했습니다.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // 1분간 캐시
      }
    );
  }, [setUserLocation, setIsLoading, setError, setPermissionStatus]);

  // 컴포넌트 마운트 시 위치 가져오기 (위치가 없을 때만)
  useEffect(() => {
    if (!userLocation && isLoading) {
      fetchLocation();
    }
  }, [userLocation, isLoading, fetchLocation]);

  // 특정 좌표까지 거리 계산 (미터 단위)
  const getDistanceTo = useCallback(
    (targetLon: number, targetLat: number): number | null => {
      if (!userLocation) return null;

      try {
        const from = turf.point(userLocation);
        const to = turf.point([targetLon, targetLat]);
        const distance = turf.distance(from, to, { units: 'meters' });
        return Math.round(distance);
      } catch {
        return null;
      }
    },
    [userLocation]
  );

  // 거리 포맷팅
  const formatDistance = useCallback((meters: number | null): string => {
    if (meters === null) return '-';
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  }, []);

  // 위치 새로고침
  const refreshLocation = useCallback(() => {
    fetchLocation();
  }, [fetchLocation]);

  return {
    userLocation,
    isLoading,
    error,
    getDistanceTo,
    formatDistance,
    refreshLocation,
  };
}
