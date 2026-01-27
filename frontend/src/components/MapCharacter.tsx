import { useState, useEffect, useMemo } from 'react';

// 캐릭터 색상 타입
export type CharacterColor = 'green' | 'pink' | 'yellow';

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

// 색상별 프레임 이미지 매핑
const CHARACTER_FRAMES: Record<CharacterColor, string[]> = {
  green: [greenIdle, greenWalkA, greenFront, greenWalkB, greenJump],
  pink: [pinkIdle, pinkWalkA, pinkFront, pinkWalkB, pinkJump],
  yellow: [yellowIdle, yellowWalkA, yellowFront, yellowWalkB, yellowJump],
};

interface MapCharacterProps {
  map: mapboxgl.Map | null; // Mapbox 지도 인스턴스
  color: CharacterColor;
  coordinates: [number, number]; // [경도, 위도] - 지도상의 지리적 좌표
  size?: number; // 캐릭터 크기 (기본 64px)
  animationSpeed?: number; // 애니메이션 속도 (ms, 기본 150ms)
}

/**
 * Mapbox 지도 좌표 기반 애니메이션 캐릭터 컴포넌트
 * 지도의 특정 지리 좌표에 고정되어, 지도 이동/줌에 따라 함께 움직임
 */
export function MapCharacter({
  map,
  color,
  coordinates,
  size = 64,
  animationSpeed = 150,
}: MapCharacterProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [screenPosition, setScreenPosition] = useState<{ x: number; y: number } | null>(null);

  // 색상별 프레임 이미지 (메모이제이션)
  const frames = useMemo(() => CHARACTER_FRAMES[color], [color]);

  // 프레임 애니메이션 (무한 루프)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [animationSpeed, frames.length]);

  // 지리 좌표 -> 화면 좌표 변환 및 지도 이벤트 리스너
  useEffect(() => {
    if (!map) return;

    // 좌표를 화면 좌표로 변환하는 함수
    const updateScreenPosition = () => {
      // 스타일이 로딩 중이면 무시
      try {
        if (!map.isStyleLoaded()) return;
        const point = map.project(coordinates);
        setScreenPosition({ x: point.x, y: point.y });
      } catch {
        // 스타일 로딩 중 에러 무시
      }
    };

    // 지도 로드 완료 후 초기 위치 설정
    if (map.loaded() && map.isStyleLoaded()) {
      updateScreenPosition();
    } else {
      map.once('load', updateScreenPosition);
    }

    // 스타일 로드 완료 시 위치 업데이트
    map.on('style.load', updateScreenPosition);

    // 지도 이동/줌/회전 시 위치 업데이트
    const handleMove = () => {
      updateScreenPosition();
    };

    map.on('move', handleMove);
    map.on('zoom', handleMove);
    map.on('rotate', handleMove);
    map.on('pitch', handleMove);

    return () => {
      map.off('style.load', updateScreenPosition);
      map.off('move', handleMove);
      map.off('zoom', handleMove);
      map.off('rotate', handleMove);
      map.off('pitch', handleMove);
    };
  }, [map, coordinates]);

  // 화면 밖에 있으면 렌더링하지 않음
  if (!screenPosition) return null;

  return (
    <div
      className="absolute pointer-events-none transition-none"
      style={{
        left: `${screenPosition.x}px`,
        top: `${screenPosition.y}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: 'translate(-50%, -100%)', // 발 위치를 기준점으로
        zIndex: 100,
      }}
    >
      {/* 프레임 이미지 */}
      <img
        src={frames[currentFrame]}
        alt={`${color} character`}
        className="w-full h-full object-contain"
        style={{
          imageRendering: 'pixelated', // 픽셀 아트 스타일 유지
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
