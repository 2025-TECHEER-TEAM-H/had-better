/**
 * SVG에서 실제 역 좌표를 추출하는 스크립트
 *
 * 전략:
 * 1. 환승역(#환승역 심볼): 심볼 좌표 사용 (클릭 영역이 정확함)
 * 2. 일반역: 텍스트 좌표 사용 (SVG에 개별 마커가 없음)
 *
 * 사용법: node scripts/extract-station-coords.cjs
 */

const fs = require('fs');
const path = require('path');

// SVG 파일 읽기
const svgPath = path.join(__dirname, '../src/assets/Seoul_subway_linemap_ko.svg');
const svgContent = fs.readFileSync(svgPath, 'utf-8');

// 범례(legend) 및 비역 텍스트 제외 패턴
const excludePatterns = [
  /호선$/,           // 1호선, 2호선 등 (노선 이름)
  /^(신림|용인|의정부|우이신설|수인분당|경의중앙|경춘|경강|서해)선$/,
  /경전철$/,
  /도시철도$/,
  /급행철도/,
  /^환승역$/,
  /^GTX/,
  /^인천국제공항철도$/,
  /Not to scale/,
  /^\d{6}/,          // 날짜 형식 (250628)
  /^인천\s*\d/,       // 인천 1호선, 인천 2호선
  /^수인·분당선$/,
  /^경의·중앙선$/,
  /^경춘선$/,
  /^경강선$/,
];

function isLegendText(name, x, y) {
  // 범례 영역 좌표 (SVG 왼쪽 상단에 위치, x < 600)
  if (x < 600 && y < 1200) return true;
  // 패턴 매칭
  return excludePatterns.some(pattern => pattern.test(name));
}

// 1. 텍스트 좌표 추출 (역 이름)
const textRegex = /<text[^>]*transform="matrix\([^)]*\s+([\d.]+)\s+([\d.]+)\)"[^>]*>([^<]+)<\/text>/g;
const texts = [];
let match;

while ((match = textRegex.exec(svgContent)) !== null) {
  const x = parseFloat(match[1]);
  const y = parseFloat(match[2]);
  const name = match[3].trim();

  // 역 이름만 필터링 (숫자나 특수문자로만 된 것 제외, 범례 제외)
  if (name && !/^[\d\s\-\.]+$/.test(name) && name.length > 0 && !isLegendText(name, x, y)) {
    texts.push({ name, x, y });
  }
}

console.log(`텍스트 추출: ${texts.length}개`);

// 2. 환승역 좌표만 추출 (<use xlink:href="#환승역">)
// 환승역만 심볼 좌표를 사용 (일반역 심볼은 범례용이거나 종점만 표시됨)
const transferStationRegex = /<use[^>]*xlink:href="#환승역"[^>]*transform="matrix\([^)]*\s+([\d.]+)\s+([\d.]+)\)"[^>]*\/>/g;
const transferStations = [];

while ((match = transferStationRegex.exec(svgContent)) !== null) {
  const x = parseFloat(match[1]);
  const y = parseFloat(match[2]);
  // 범례 영역 제외 (x < 600 && y < 1200)
  if (!(x < 600 && y < 1200)) {
    transferStations.push({ x, y, type: 'transfer' });
  }
}

console.log(`환승역 추출: ${transferStations.length}개`);

// 3. 텍스트 <-> 환승역 거리 계산 함수
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

// 4. 각 텍스트에 좌표 매핑
const stationsJson = {};
const transferMapped = [];
const textMapped = [];

for (const text of texts) {
  // 중복 체크 - 이미 있는 역 이름은 첫 번째 것만 사용
  if (stationsJson[text.name]) {
    continue;
  }

  // 가장 가까운 환승역 찾기
  let minDist = Infinity;
  let closestTransfer = null;

  for (const station of transferStations) {
    const dist = distance(text, station);
    if (dist < minDist) {
      minDist = dist;
      closestTransfer = station;
    }
  }

  // 환승역이 100px 이내에 있으면 환승역 좌표 사용
  if (closestTransfer && minDist < 100) {
    stationsJson[text.name] = {
      x: Math.round(closestTransfer.x * 100) / 100,
      y: Math.round(closestTransfer.y * 100) / 100
    };
    transferMapped.push(text.name);
  } else {
    // 그 외는 텍스트 좌표 사용
    stationsJson[text.name] = {
      x: Math.round(text.x * 100) / 100,
      y: Math.round(text.y * 100) / 100
    };
    textMapped.push(text.name);
  }
}

console.log(`\n=== 매핑 결과 ===`);
console.log(`총 역 수: ${Object.keys(stationsJson).length}개`);
console.log(`- 환승역 심볼 좌표 사용: ${transferMapped.length}개`);
console.log(`- 텍스트 좌표 사용: ${textMapped.length}개`);

// 5. 결과 저장
const outputPath = path.join(__dirname, '../src/data/stations.json');
fs.writeFileSync(outputPath, JSON.stringify(stationsJson, null, 2), 'utf-8');
console.log(`\n결과 저장: ${outputPath}`);

// 6. 비교용: 영등포구청 좌표 출력
console.log('\n=== 영등포구청 좌표 ===');
console.log('좌표:', stationsJson['영등포구청']);
console.log('(환승역 매핑 여부:', transferMapped.includes('영등포구청') ? '예' : '아니오 - 텍스트 좌표 사용', ')');

// 7. 샘플 출력
console.log('\n=== 환승역 매핑 샘플 (10개) ===');
transferMapped.slice(0, 10).forEach(name => {
  console.log(`  - ${name}: (${stationsJson[name].x}, ${stationsJson[name].y})`);
});

console.log('\n=== 텍스트 좌표 사용 샘플 (10개) ===');
textMapped.slice(0, 10).forEach(name => {
  console.log(`  - ${name}: (${stationsJson[name].x}, ${stationsJson[name].y})`);
});
