import { useState, useEffect, useMemo } from 'react';

// 캐릭터 색상 타입
export type CharacterColor = 'green' | 'pink' | 'yellow' | 'purple';

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

// 색상별 프레임 이미지 매핑
const CHARACTER_FRAMES: Record<CharacterColor, string[]> = {
  green: [greenIdle, greenWalkA, greenFront, greenWalkB, greenJump],
  pink: [pinkIdle, pinkWalkA, pinkFront, pinkWalkB, pinkJump],
  yellow: [yellowIdle, yellowWalkA, yellowFront, yellowWalkB, yellowJump],
  purple: [purpleIdle, purpleWalkA, purpleFront, purpleWalkB, purpleJump],
};

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

  // 색상별 프레임 이미지 (메모이제이션)
  const frames = useMemo(() => CHARACTER_FRAMES[color], [color]);

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
