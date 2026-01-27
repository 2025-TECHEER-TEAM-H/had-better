import { useState, useEffect } from 'react';

// 캐릭터 색상 타입
export type CharacterColor = 'green' | 'pink' | 'yellow' | 'purple';

interface AnimatedCharacterProps {
  color: CharacterColor;
  position: { x: number; y: number }; // 지도상의 절대 위치 (픽셀)
  size?: number; // 캐릭터 크기 (기본 64px)
  animationSpeed?: number; // 애니메이션 속도 (ms, 기본 150ms)
}

/**
 * 애니메이션 캐릭터 컴포넌트
 * 5개의 PNG 프레임을 순환하며 움직이는 애니메이션 표현
 */
export function AnimatedCharacter({
  color,
  position,
  size = 64,
  animationSpeed = 150,
}: AnimatedCharacterProps) {
  const [currentFrame, setCurrentFrame] = useState(0);

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

  return (
    <div
      className="absolute transition-all duration-100 ease-linear"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: 'translate(-50%, -50%)', // 중앙 정렬
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

      {/* 그림자 효과 (선택사항) */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-black/20 rounded-full blur-sm"
        style={{
          width: `${size * 0.6}px`,
          height: `${size * 0.2}px`,
        }}
      />
    </div>
  );
}
