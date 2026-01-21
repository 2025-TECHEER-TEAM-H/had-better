/**
 * 애니메이션 캐릭터 테스트 페이지
 * MapScreen 위에 3가지 색상의 캐릭터를 표시하여 애니메이션 동작 확인
 */
import MapScreen from '@/imports/MapScreen';

export default function CharacterTest() {
  return (
    <div className="w-full h-screen bg-gray-100">
      <MapScreen />
    </div>
  );
}
