/**
 * OSM 지하철 데이터를 노선별 GeoJSON으로 변환
 * node scripts/convert-osm-subway.js
 */

const fs = require('fs');
const path = require('path');

// OSM 데이터 읽기
const osmData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/seoul_subway_osm.json'), 'utf-8')
);

// 노선별 색상 (기존 metro-line.json과 동일)
const lineColors = {
  '1호선': '#0052A4',
  '2호선': '#00A84D',
  '3호선': '#EF7C1C',
  '4호선': '#00A5DE',
  '5호선': '#996CAC',
  '6호선': '#CD7C2F',
  '7호선': '#747F00',
  '8호선': '#E6186C',
  '9호선': '#BDB092',
  '공항철도': '#0090D2',
  '경의중앙선': '#77C4A3',
  '경춘선': '#0C8E72',
  '수인분당선': '#FABE00',
  '신분당선': '#D4003B',
  '우이신설선': '#B7C452',
  '인천1호선': '#7CA8D5',
  '인천2호선': '#ED8B00',
  '김포골드라인': '#AD8605',
  '서해선': '#8FC31F',
  '신림선': '#6789CA',
  '경강선': '#0054A6',
  'GTX-A': '#9A6292',
};

// 노선 이름 매핑 (OSM name 태그 -> 표준 노선명)
function normalizeLineName(tags) {
  const name = tags['name:ko'] || tags['name'] || '';
  const ref = tags['ref'] || '';

  // 숫자호선 패턴
  const numMatch = name.match(/^(\d)호선/);
  if (numMatch) return `${numMatch[1]}호선`;

  // ref 태그 기반 (예: "1", "2")
  if (/^\d$/.test(ref)) return `${ref}호선`;

  // 특수 노선들
  if (name.includes('공항철도') || name.includes('AREX')) return '공항철도';
  if (name.includes('경의중앙')) return '경의중앙선';
  if (name.includes('경춘')) return '경춘선';
  if (name.includes('수인분당') || name.includes('분당선') || name.includes('수인선')) return '수인분당선';
  if (name.includes('신분당')) return '신분당선';
  if (name.includes('우이신설') || name.includes('우이')) return '우이신설선';
  if (name.includes('인천 도시철도 1호선') || name.includes('인천1호선')) return '인천1호선';
  if (name.includes('인천 도시철도 2호선') || name.includes('인천2호선')) return '인천2호선';
  if (name.includes('김포 도시철도') || name.includes('김포골드')) return '김포골드라인';
  if (name.includes('서해선')) return '서해선';
  if (name.includes('신림')) return '신림선';
  if (name.includes('경강')) return '경강선';
  if (name.includes('GTX')) return 'GTX-A';

  // 영어 이름 기반
  const nameEn = tags['name:en'] || '';
  const lineMatch = nameEn.match(/Line (\d)/);
  if (lineMatch) return `${lineMatch[1]}호선`;

  return null; // 분류 불가
}

// 메인 처리
const lineGeometries = {};

osmData.elements.forEach(element => {
  if (element.type !== 'way' || !element.geometry || !element.tags) return;

  // yard, service 등 제외 (본선만)
  if (element.tags.service === 'yard' || element.tags.service === 'siding') return;

  const lineName = normalizeLineName(element.tags);
  if (!lineName) return;

  if (!lineGeometries[lineName]) {
    lineGeometries[lineName] = [];
  }

  // geometry를 [lng, lat] 배열로 변환
  const coordinates = element.geometry.map(point => [point.lon, point.lat]);

  if (coordinates.length >= 2) {
    lineGeometries[lineName].push({
      id: element.id,
      coordinates,
    });
  }
});

// GeoJSON FeatureCollection 생성
const features = [];

Object.entries(lineGeometries).forEach(([lineName, segments]) => {
  const color = lineColors[lineName] || '#888888';

  segments.forEach((segment, index) => {
    features.push({
      type: 'Feature',
      properties: {
        line: lineName,
        color: color,
        segment: index,
        osmId: segment.id,
      },
      geometry: {
        type: 'LineString',
        coordinates: segment.coordinates,
      },
    });
  });
});

const geojson = {
  type: 'FeatureCollection',
  metadata: {
    source: 'OpenStreetMap',
    license: 'ODbL',
    generated: new Date().toISOString(),
  },
  features,
};

// 결과 저장
const outputPath = path.join(__dirname, '../src/data/subway-lines-osm.json');
fs.writeFileSync(outputPath, JSON.stringify(geojson, null, 2));

// 통계 출력
console.log('=== OSM 지하철 데이터 변환 완료 ===');
console.log(`총 세그먼트 수: ${features.length}`);
console.log('\n노선별 세그먼트 수:');
Object.entries(lineGeometries)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([name, segments]) => {
    console.log(`  ${name}: ${segments.length}개`);
  });
console.log(`\n저장 위치: ${outputPath}`);
