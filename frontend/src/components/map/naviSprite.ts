import { Map as MapboxMap } from "mapbox-gl";

// 캐릭터 스프라이트 이미지 import
import greenIdle from "@/assets/green/character_green_idle.png";
import greenWalkA from "@/assets/green/character_green_walk_a.png";
import greenWalkB from "@/assets/green/character_green_walk_b.png";
import greenJump from "@/assets/green/character_green_jump.png";

// Mapbox에 이미지 로드하는 헬퍼 함수
async function loadImage(map: MapboxMap, name: string, url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    map.loadImage(url, (err, img) => {
      if (err) return reject(err);
      if (!map.hasImage(name) && img) {
        map.addImage(name, img);
      }
      resolve();
    });
  });
}

// 모든 Navi 스프라이트를 Mapbox에 등록
export async function registerNaviSprites(map: MapboxMap): Promise<void> {
  await Promise.all([
    // 걷기 애니메이션 프레임 (green 캐릭터)
    loadImage(map, "navi-walk-0", greenIdle),
    loadImage(map, "navi-walk-1", greenWalkA),
    loadImage(map, "navi-walk-2", greenIdle),
    loadImage(map, "navi-walk-3", greenWalkB),
    // 대기 상태
    loadImage(map, "navi-idle", greenIdle),
    // 도착 상태
    loadImage(map, "navi-arrive", greenJump),
  ]);

  console.log("✔ Navi 스프라이트 등록 완료 (Green 캐릭터)");
}
