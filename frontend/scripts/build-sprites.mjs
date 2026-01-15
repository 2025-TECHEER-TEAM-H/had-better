import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import { Resvg } from "@resvg/resvg-js";

// SVG 파일 위치 (src/assets에 있음)
const SRC_DIR = "src/assets";
// PNG 출력 위치 (public/assets/sprites)
const OUT_DIR = "public/assets/sprites";

const TARGETS = [
  { suffix: "", size: 256 },
  { suffix: "@2x", size: 512 }
];

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true });
}

async function render(svgPath, outPath, size) {
  const svg = await fs.readFile(svgPath, "utf8");
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: size }
  });
  const png = resvg.render().asPng();
  await fs.writeFile(outPath, png);
}

async function main() {
  await ensureDir(OUT_DIR);

  // navi-*.svg 파일들을 찾음
  const svgs = await fg(["navi-*.svg"], { cwd: SRC_DIR, absolute: true });
  if (svgs.length === 0) {
    console.error(`No SVG found in ${SRC_DIR}`);
    process.exit(1);
  }

  console.log(`Found ${svgs.length} SVG files`);

  for (const svgAbs of svgs) {
    const name = path.basename(svgAbs, ".svg"); // navi-walk-0
    for (const t of TARGETS) {
      const out = path.join(OUT_DIR, `${name}${t.suffix}.png`);
      await render(svgAbs, out, t.size);
      console.log("✔", out);
    }
  }

  console.log("\n스프라이트 빌드 완료!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
