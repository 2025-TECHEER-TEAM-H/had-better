/**
 * OSM 지하철 relation 데이터를 노선별 GeoJSON으로 변환
 * node scripts/convert-osm-relations.cjs
 */

const fs = require('fs');
const path = require('path');

// OSM relation 데이터 읽기 (지하철 + 열차)
const subwayData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/seoul_subway_relations.json'), 'utf-8')
);

// 열차 relation 데이터 (공항철도, GTX 등)
let trainData = { elements: [] };
const trainPath = path.join(__dirname, '../src/data/seoul_train_relations.json');
if (fs.existsSync(trainPath)) {
  trainData = JSON.parse(fs.readFileSync(trainPath, 'utf-8'));
}

// 모든 relation 데이터 병합
const osmData = {
  elements: [...subwayData.elements, ...trainData.elements]
};

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
  '용인에버라인': '#56AD56',
  '의정부경전철': '#FDA600',
  'GTXA': '#9A6292',
};

// relation 태그에서 노선명 추출
function extractLineName(tags) {
  const name = tags?.name || tags?.['name:ko'] || '';
  const ref = tags?.ref || '';

  // ref 태그로 먼저 판단
  if (/^\d$/.test(ref)) return `${ref}호선`;
  if (ref === '인천1' || ref === 'I1') return '인천1호선';
  if (ref === '인천2' || ref === 'I2') return '인천2호선';
  if (ref === 'E') return '용인에버라인';
  if (ref === 'U') return '의정부경전철';
  if (ref === 'W') return '우이신설선';
  if (ref === 'G' || ref === '김포 골드라인') return '김포골드라인';
  if (ref === 'SL') return '신림선';
  if (ref === 'D' || ref === 'DX') return '신분당선';
  if (ref === 'A' || ref === 'AREX' || ref === 'AP') return '공항철도';
  if (ref === '경강') return '경강선';
  if (ref === '경의중앙' || ref === 'K') return '경의중앙선';
  if (ref === '경춘' || ref === 'P') return '경춘선';
  if (ref === '서해' || ref === 'S') return '서해선';
  if (ref === '수인분당' || ref === 'B') return '수인분당선';
  if (ref === 'GTX-A' || ref === 'GA') return 'GTXA';

  // 이름 기반 추출
  const numMatch = name.match(/(\d)호선/);
  if (numMatch) return `${numMatch[1]}호선`;

  if (name.includes('인천') && name.includes('1호선')) return '인천1호선';
  if (name.includes('인천') && name.includes('2호선')) return '인천2호선';
  if (name.includes('용인') || name.includes('에버')) return '용인에버라인';
  if (name.includes('의정부')) return '의정부경전철';
  if (name.includes('우이신설') || name.includes('우이')) return '우이신설선';
  if (name.includes('김포')) return '김포골드라인';
  if (name.includes('신림')) return '신림선';
  if (name.includes('신분당')) return '신분당선';
  if (name.includes('공항철도') || name.includes('AREX')) return '공항철도';
  if (name.includes('경강')) return '경강선';
  if (name.includes('경의중앙')) return '경의중앙선';
  if (name.includes('경춘')) return '경춘선';
  if (name.includes('서해')) return '서해선';
  if (name.includes('수인분당') || name.includes('분당선') || name.includes('수인선')) return '수인분당선';
  if (name.includes('GTX')) return 'GTXA';

  return null;
}

// relation에서 way의 geometry 추출
function extractGeometriesFromRelation(relation) {
  const geometries = [];

  if (!relation.members) return geometries;

  relation.members.forEach(member => {
    // way 멤버만 처리 (role이 비어있거나 'forward', 'backward' 등)
    if (member.type !== 'way') return;
    if (!member.geometry || member.geometry.length < 2) return;

    // service=siding, yard 등 제외
    // (relation 멤버에는 태그가 없을 수 있으므로 geometry만 확인)

    const coordinates = member.geometry.map(point => [point.lon, point.lat]);
    geometries.push({
      ref: member.ref,
      coordinates,
    });
  });

  return geometries;
}

// 메인 처리
const lineGeometries = {};
const processedRelations = new Set();

osmData.elements.forEach(element => {
  if (element.type !== 'relation') return;

  const lineName = extractLineName(element.tags);
  if (!lineName) {
    // console.log('Unknown relation:', element.tags?.name);
    return;
  }

  // 같은 노선의 다른 방향 relation이 있을 수 있으므로 중복 geometry 제거
  const relationKey = `${lineName}-${element.id}`;
  if (processedRelations.has(relationKey)) return;
  processedRelations.add(relationKey);

  const geometries = extractGeometriesFromRelation(element);
  if (geometries.length === 0) return;

  if (!lineGeometries[lineName]) {
    lineGeometries[lineName] = [];
  }

  // way ref 기반으로 중복 제거
  const existingRefs = new Set(lineGeometries[lineName].map(g => g.ref));
  geometries.forEach(geom => {
    if (!existingRefs.has(geom.ref)) {
      lineGeometries[lineName].push(geom);
      existingRefs.add(geom.ref);
    }
  });
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
        osmId: segment.ref,
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
console.log('=== OSM 지하철 relation 데이터 변환 완료 ===');
console.log(`총 세그먼트 수: ${features.length}`);
console.log('\n노선별 세그먼트 수:');
Object.entries(lineGeometries)
  .sort((a, b) => b[1].length - a[1].length)
  .forEach(([name, segments]) => {
    console.log(`  ${name}: ${segments.length}개`);
  });
console.log(`\n저장 위치: ${outputPath}`);
