import { useState, useEffect, useRef } from 'react';
import type mapboxgl from 'mapbox-gl';

// 캐릭터 색상 타입
export type CharacterColor = 'green' | 'pink' | 'yellow';

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
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // 각 색상별 프레임 이미지 경로
  const frames = [
    `/src/assets/${color}/character_${color}_idle.png`,
    `/src/assets/${color}/character_${color}_walk_a.png`,
    `/src/assets/${color}/character_${color}_front.png`,
    `/src/assets/${color}/character_${color}_walk_b.png`,
    `/src/assets/${color}/character_${color}_jump.png`,
  ];

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
      const point = map.project(coordinates);
      setScreenPosition({ x: point.x, y: point.y });
    };

    // 지도 로드 완료 후 초기 위치 설정
    if (map.loaded()) {
      updateScreenPosition();
    } else {
      map.once('load', updateScreenPosition);
    }

    // 지도 이동/줌/회전 시 위치 업데이트
    const handleMove = () => {
      updateScreenPosition();
    };

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
