import { Map as MapboxMap } from "mapbox-gl";

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
  const base = "/assets/sprites/characters/green"; // Vite public 루트

  await Promise.all([
    // 걷기 애니메이션 프레임 (green 캐릭터)
    loadImage(map, "navi-walk-0", `${base}/character_green_idle.png`),
    loadImage(map, "navi-walk-1", `${base}/character_green_walk_a.png`),
    loadImage(map, "navi-walk-2", `${base}/character_green_idle.png`),
    loadImage(map, "navi-walk-3", `${base}/character_green_walk_b.png`),
    // 대기 상태
    loadImage(map, "navi-idle", `${base}/character_green_idle.png`),
    // 도착 상태
    loadImage(map, "navi-arrive", `${base}/character_green_jump.png`),
  ]);

  console.log("✔ Navi 스프라이트 등록 완료 (Green 캐릭터)");
}
