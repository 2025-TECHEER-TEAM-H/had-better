/**
 * 경로를 따라 이동하는 캐릭터 컴포넌트
 *
 * SSE를 통해 받은 위치 정보를 기반으로 Turf.js로 경로를 따라 부드럽게 이동합니다.
 * - 5초(동적 15/30초) 주기로 새 위치 수신
 * - 위치 간 보간으로 부드러운 이동
 * - 걷기 애니메이션 재생
 */

import type { BotStatus, Coordinate, RouteSegment } from '@/types/route';
import {
    calculateBearing,
    createInterpolationState,
    createRouteLine,
    interpolateByTime,
    mergeSegmentCoordinates,
    type InterpolationState,
} from '@/utils/routeInterpolation';
import type { Feature, LineString } from 'geojson';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// 캐릭터 프레임 이미지 import - Green
import greenIdle from '@/assets/green/character_green_idle.png';
import greenWalkA from '@/assets/green/character_green_walk_a.png';
import greenFront from '@/assets/green/character_green_front.png';
import greenWalkB from '@/assets/green/character_green_walk_b.png';
import greenJump from '@/assets/green/character_green_jump.png';

// 캐릭터 프레임 이미지 import - Pink
import pinkIdle from '@/assets/pink/character_pink_idle.png';
import pinkWalkA from '@/assets/pink/character_pink_walk_a.png';
import pinkFront from '@/assets/pink/character_pink_front.png';
import pinkWalkB from '@/assets/pink/character_pink_walk_b.png';
import pinkJump from '@/assets/pink/character_pink_jump.png';

// 캐릭터 프레임 이미지 import - Yellow
import yellowIdle from '@/assets/yellow/character_yellow_idle.png';
import yellowWalkA from '@/assets/yellow/character_yellow_walk_a.png';
import yellowFront from '@/assets/yellow/character_yellow_front.png';
import yellowWalkB from '@/assets/yellow/character_yellow_walk_b.png';
import yellowJump from '@/assets/yellow/character_yellow_jump.png';

// 캐릭터 프레임 이미지 import - Purple
import purpleIdle from '@/assets/purple/character_purple_idle.png';
import purpleWalkA from '@/assets/purple/character_purple_walk_a.png';
import purpleFront from '@/assets/purple/character_purple_front.png';
import purpleWalkB from '@/assets/purple/character_purple_walk_b.png';
import purpleJump from '@/assets/purple/character_purple_jump.png';

// 캐릭터 색상 타입
export type CharacterColor = 'green' | 'pink' | 'yellow' | 'purple';

// 색상별 프레임 이미지 매핑
const CHARACTER_FRAMES: Record<CharacterColor, string[]> = {
  green: [greenIdle, greenWalkA, greenFront, greenWalkB, greenJump],
  pink: [pinkIdle, pinkWalkA, pinkFront, pinkWalkB, pinkJump],
  yellow: [yellowIdle, yellowWalkA, yellowFront, yellowWalkB, yellowJump],
  purple: [purpleIdle, purpleWalkA, purpleFront, purpleWalkB, purpleJump],
};

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
  // 보간 건너뛰기 (이미 애니메이션된 위치를 받는 경우)
  skipInterpolation?: boolean;
  // 캐릭터 크기
  size?: number;
  // 애니메이션 속도 (ms)
  animationSpeed?: number;
  // 클릭 이벤트
  onClick?: () => void;
  // 대기 시간 (분) - WAITING_BUS, WAITING_SUBWAY일 때 사용
  waitingTimeMinutes?: number;
  // 상태 텍스트 숨기기 (GPS 기반 사용자 캐릭터에서 사용)
  hideStatus?: boolean;
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
  skipInterpolation = false,
  size = 64,
  animationSpeed = 150,
  onClick,
  waitingTimeMinutes,
  hideStatus = false,
}: MovingCharacterProps) {
  // 상태
  const [currentFrame, setCurrentFrame] = useState(0);
  const [screenPosition, setScreenPosition] = useState<{ x: number; y: number } | null>(null);
  const [displayPosition, setDisplayPosition] = useState<[number, number] | null>(null);
  const [_bearing, setBearing] = useState(0);

  // refs
  const previousPositionRef = useRef<Coordinate | null>(null);
  const interpolationFromRef = useRef<Coordinate | null>(null);  // 보간 시작 위치 (별도 저장)
  const routeLineRef = useRef<Feature<LineString> | null>(null);
  const interpolationStateRef = useRef<InterpolationState | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // 색상별 프레임 이미지 (메모이제이션)
  const frames = useMemo(() => CHARACTER_FRAMES[color], [color]);

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
      }
    }
  }, [routeSegments, botId]);

  // 처음 위치를 받으면 바로 displayPosition 설정
  useEffect(() => {
    if (currentPosition && !displayPosition) {
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

    // 보간 시작 위치 저장 (애니메이션에서 사용)
    // 이전 위치가 없으면 현재 위치를 시작점으로 사용
    interpolationFromRef.current = prevPos ? { ...prevPos } : { ...currentPosition };

    // 경로선이 있으면 경로 기반 보간, 없으면 직선 보간
    if (routeLineRef.current) {
      interpolationStateRef.current = createInterpolationState(
        routeLineRef.current,
        interpolationFromRef.current,
        currentPosition,
        updateInterval
      );
    } else {
      // 직선 보간용 상태 (경로선 없을 때)
      interpolationStateRef.current = {
        isInterpolating: hasChanged,  // 위치가 바뀌었을 때만 보간
        startDistance: 0,
        endDistance: 1,
        startTime: Date.now(),
        duration: updateInterval,
        currentDistance: 0,
      };
    }

    // 이전 위치 업데이트 (다음 보간을 위해)
    previousPositionRef.current = { ...currentPosition };
  }, [currentPosition, botId, updateInterval, status]);

  // 애니메이션 루프 (보간)
  useEffect(() => {
    if (!currentPosition) return;

    // skipInterpolation이 true면 보간 없이 바로 위치 업데이트
    // (이미 부모 컴포넌트에서 부드러운 애니메이션 처리하는 경우)
    if (skipInterpolation) {
      setDisplayPosition([currentPosition.lon, currentPosition.lat]);
      return;
    }

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
        } else if (interpolationFromRef.current && currentPosition) {
          // 직선 보간 (경로선 없을 때)
          const elapsed = Date.now() - interpState.startTime;
          const t = Math.min(elapsed / interpState.duration, 1);

          const from = interpolationFromRef.current;
          const to = currentPosition;

          const lon = from.lon + (to.lon - from.lon) * t;
          const lat = from.lat + (to.lat - from.lat) * t;

          setDisplayPosition([lon, lat]);

          // 방향 계산
          const newBearing = calculateBearing(
            [from.lon, from.lat],
            [to.lon, to.lat]
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
  }, [currentPosition, skipInterpolation]);

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
        zIndex: 5 + botId, // 봇 ID로 z-index 구분 (UI보다 낮게)
      }}
      onClick={onClick}
    >
      {/* 상태 텍스트 표시 (hideStatus가 true면 숨김) */}
      {!hideStatus && (() => {
        let statusText = '';

        switch (status) {
          case 'WALKING':
            statusText = '걷는 중';
            break;
          case 'WAITING_BUS':
            statusText = '버스 대기 중';
            break;
          case 'WAITING_SUBWAY':
            statusText = '지하철 대기 중';
            break;
          case 'RIDING_BUS':
            statusText = '버스 이동 중';
            break;
          case 'RIDING_SUBWAY':
            statusText = '지하철 이동 중';
            break;
          case 'FINISHED':
            statusText = '도착';
            break;
          default:
            return null;
        }

        return (
          <div
            className="absolute -top-5 left-1/2 -translate-x-1/2 pointer-events-none"
            style={{
              background: 'rgba(0, 0, 0, 0.75)',
              color: 'white',
              padding: '5px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              zIndex: 10,
            }}
          >
            {statusText}
            {/* 말풍선 꼬리 */}
            <div
              style={{
                position: 'absolute',
                bottom: '-6px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid rgba(0, 0, 0, 0.75)',
              }}
            />
          </div>
        );
      })()}

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
