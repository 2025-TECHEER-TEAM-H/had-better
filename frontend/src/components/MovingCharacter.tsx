/**
 * 경로를 따라 이동하는 캐릭터 컴포넌트
 *
 * SSE를 통해 받은 위치 정보를 기반으로 Turf.js로 경로를 따라 부드럽게 이동합니다.
 * - 5초(동적 15/30초) 주기로 새 위치 수신
 * - 위치 간 보간으로 부드러운 이동
 * - 걷기 애니메이션 재생
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type mapboxgl from 'mapbox-gl';
import type { Feature, LineString } from 'geojson';
import type { Coordinate, BotStatus, RouteSegment } from '@/types/route';
import {
  createRouteLine,
  mergeSegmentCoordinates,
  createInterpolationState,
  interpolateByTime,
  calculateBearing,
  type InterpolationState,
} from '@/utils/routeInterpolation';

// 캐릭터 색상 타입
export type CharacterColor = 'green' | 'pink' | 'yellow' | 'purple';

interface MovingCharacterProps {
  // Mapbox 지도 인스턴스
  map: mapboxgl.Map | null;
  // 캐릭터 색상
  color: CharacterColor;
  // 봇 ID
  botId: number;
  // 현재 위치 (SSE에서 수신)
  currentPosition: Coordinate | null;
  // 봇 상태
  status: BotStatus;
  // 경로 세그먼트 (경로 데이터)
  routeSegments?: RouteSegment[];
  // 다음 업데이트까지 시간 (ms) - 보간 duration
  updateInterval?: number;
  // 캐릭터 크기
  size?: number;
  // 애니메이션 속도 (ms)
  animationSpeed?: number;
  // 클릭 이벤트
  onClick?: () => void;
}

/**
 * 경로를 따라 이동하는 캐릭터 컴포넌트
 */
export function MovingCharacter({
  map,
  color,
  botId,
  currentPosition,
  status,
  routeSegments = [],
  updateInterval = 5000,
  size = 64,
  animationSpeed = 150,
  onClick,
}: MovingCharacterProps) {
  // 상태
  const [currentFrame, setCurrentFrame] = useState(0);
  const [screenPosition, setScreenPosition] = useState<{ x: number; y: number } | null>(null);
  const [displayPosition, setDisplayPosition] = useState<[number, number] | null>(null);
  const [bearing, setBearing] = useState(0);

  // refs
  const previousPositionRef = useRef<Coordinate | null>(null);
  const routeLineRef = useRef<Feature<LineString> | null>(null);
  const interpolationStateRef = useRef<InterpolationState | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 프레임 이미지 경로
  const frames = [
    `/src/assets/${color}/character_${color}_idle.png`,
    `/src/assets/${color}/character_${color}_walk_a.png`,
    `/src/assets/${color}/character_${color}_front.png`,
    `/src/assets/${color}/character_${color}_walk_b.png`,
    `/src/assets/${color}/character_${color}_jump.png`,
  ];

  // 상태에 따른 프레임 선택
  const getFrameByStatus = useCallback((status: BotStatus, frameIndex: number): number => {
    switch (status) {
      case 'WALKING':
        // 걷기 애니메이션: idle -> walk_a -> front -> walk_b 반복 (0~3)
        return frameIndex % 4;
      case 'WAITING_BUS':
      case 'WAITING_SUBWAY':
        // 대기 상태: idle 고정
        return 0;
      case 'RIDING_BUS':
      case 'RIDING_SUBWAY':
        // 탑승 상태: front 고정 또는 약간의 흔들림
        return frameIndex % 2 === 0 ? 2 : 0;
      case 'FINISHED':
        // 완료: jump 고정 (승리 포즈)
        return 4;
      default:
        return 0;
    }
  }, []);

  // 프레임 애니메이션
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [animationSpeed, frames.length]);

  // 경로선 생성 (세그먼트 데이터가 있을 때)
  useEffect(() => {
    if (routeSegments.length > 0) {
      const coordinates = mergeSegmentCoordinates(routeSegments);
      if (coordinates.length >= 2) {
        routeLineRef.current = createRouteLine(coordinates);
        console.log(`📍 봇 ${botId} 경로 생성: ${coordinates.length}개 좌표`);
      }
    }
  }, [routeSegments, botId]);

  // 처음 위치를 받으면 바로 displayPosition 설정
  useEffect(() => {
    if (currentPosition && !displayPosition) {
      console.log(`🎯 봇 ${botId} 초기 위치 설정:`, currentPosition);
      setDisplayPosition([currentPosition.lon, currentPosition.lat]);
    }
  }, [currentPosition, botId]); // displayPosition은 의존성에서 제외

  // 새 위치 수신 시 보간 상태 생성
  useEffect(() => {
    if (!currentPosition) return;

    // 이전 위치와 비교
    const prevPos = previousPositionRef.current;
    const hasChanged = !prevPos ||
      prevPos.lon !== currentPosition.lon ||
      prevPos.lat !== currentPosition.lat;

    // 경로선이 있으면 경로 기반 보간, 없으면 직선 보간
    if (routeLineRef.current) {
      interpolationStateRef.current = createInterpolationState(
        routeLineRef.current,
        previousPositionRef.current,
        currentPosition,
        updateInterval
      );
    } else {
      // 직선 보간용 상태 (경로선 없을 때)
      interpolationStateRef.current = {
        isInterpolating: true,
        startDistance: 0,
        endDistance: 1,
        startTime: Date.now(),
        duration: updateInterval,
        currentDistance: 0,
      };
    }

    // 이전 위치 업데이트
    previousPositionRef.current = currentPosition;
  }, [currentPosition, botId, updateInterval, status]);

  // 애니메이션 루프 (보간)
  useEffect(() => {
    if (!currentPosition) return;

    const animate = () => {
      const interpState = interpolationStateRef.current;

      if (interpState && interpState.isInterpolating) {
        if (routeLineRef.current) {
          // 경로 기반 보간
          const result = interpolateByTime(routeLineRef.current, interpState);
          setDisplayPosition(result.coordinates);
          setBearing(result.bearing);

          if (result.isComplete) {
            interpState.isInterpolating = false;
          }
        } else if (previousPositionRef.current && currentPosition) {
          // 직선 보간 (경로선 없을 때)
          const elapsed = Date.now() - interpState.startTime;
          const t = Math.min(elapsed / interpState.duration, 1);

          const prev = previousPositionRef.current;
          const curr = currentPosition;

          const lon = prev.lon + (curr.lon - prev.lon) * t;
          const lat = prev.lat + (curr.lat - prev.lat) * t;

          setDisplayPosition([lon, lat]);

          // 방향 계산
          const newBearing = calculateBearing(
            [prev.lon, prev.lat],
            [curr.lon, curr.lat]
          );
          setBearing(newBearing);

          if (t >= 1) {
            interpState.isInterpolating = false;
          }
        }
      } else if (currentPosition) {
        // 보간 중이 아닐 때는 현재 위치 표시
        setDisplayPosition([currentPosition.lon, currentPosition.lat]);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentPosition]);

  // 지도 좌표 -> 화면 좌표 변환
  useEffect(() => {
    if (!map || !displayPosition) return;

    const updateScreenPosition = () => {
      const point = map.project(displayPosition as [number, number]);
      setScreenPosition({ x: point.x, y: point.y });
    };

    // 지도 로드 완료 후 초기 위치 설정
    if (map.loaded()) {
      updateScreenPosition();
    } else {
      map.once('load', updateScreenPosition);
    }

    // 지도 이동/줌/회전 시 위치 업데이트
    const handleMove = () => updateScreenPosition();

    map.on('move', handleMove);
    map.on('zoom', handleMove);
    map.on('rotate', handleMove);
    map.on('pitch', handleMove);

    return () => {
      map.off('move', handleMove);
      map.off('zoom', handleMove);
      map.off('rotate', handleMove);
      map.off('pitch', handleMove);
    };
  }, [map, displayPosition]);

  // 화면 밖이면 렌더링하지 않음
  if (!screenPosition || !displayPosition) return null;

  // 상태에 따른 프레임 인덱스
  const frameIndex = getFrameByStatus(status, currentFrame);

  return (
    <div
      className={`absolute pointer-events-auto transition-none ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        left: `${screenPosition.x}px`,
        top: `${screenPosition.y}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: 'translate(-50%, -100%)',
        zIndex: 100 + botId, // 봇 ID로 z-index 구분
      }}
      onClick={onClick}
    >
      {/* 상태 표시 (디버그용) */}
      <div
        className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs bg-black/70 text-white px-2 py-0.5 rounded whitespace-nowrap"
        style={{ fontSize: '10px' }}
      >
        {status}
      </div>

      {/* 캐릭터 이미지 */}
      <img
        src={frames[frameIndex]}
        alt={`${color} character (Bot ${botId})`}
        className="w-full h-full object-contain"
        style={{
          imageRendering: 'pixelated',
        }}
      />

      {/* 그림자 효과 */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/30 rounded-full blur-sm"
        style={{
          width: `${size * 0.5}px`,
          height: `${size * 0.15}px`,
        }}
      />
    </div>
  );
}
