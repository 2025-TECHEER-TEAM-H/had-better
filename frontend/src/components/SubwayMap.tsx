/**
 * 인터랙티브 지하철 노선도 컴포넌트
 *
 * react-zoom-pan-pinch를 사용한 줌/팬 기능과
 * 클릭 가능한 역 오버레이를 제공합니다.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import stationsData from '@/data/stations.json';
import subwayMapSvg from '@/assets/Seoul_subway_linemap_ko.svg';

// SVG 원본 크기
const SVG_WIDTH = 5724;
const SVG_HEIGHT = 6516;

// 클릭 영역 크기 (SVG 좌표 기준)
const CLICK_AREA_SIZE = 40;

// 역 좌표 타입
interface StationCoords {
  x: number;
  y: number;
}

// 선택된 역 정보 타입
interface SelectedStation {
  name: string;
  x: number;
  y: number;
}

interface SubwayMapProps {
  // 역 클릭 시 콜백
  onStationSelect?: (stationName: string, coords: StationCoords) => void;
  // 검색어 (외부에서 제어)
  searchQuery?: string;
  // 선택된 역 이름 (외부에서 제어)
  selectedStationName?: string;
}

export function SubwayMap({
  onStationSelect,
  searchQuery = '',
  selectedStationName,
}: SubwayMapProps) {
  // TransformWrapper ref (센터링용)
  const transformRef = useRef<ReactZoomPanPinchRef>(null);

  // 내부 선택 상태 (외부 제어가 없을 때 사용)
  const [internalSelected, setInternalSelected] = useState<SelectedStation | null>(null);

  // 실제 선택된 역 (외부 제어 우선)
  const selectedStation = selectedStationName
    ? { name: selectedStationName, ...(stationsData as Record<string, StationCoords>)[selectedStationName] }
    : internalSelected;

  // 마운트 후 센터링 (컨테이너 크기가 확정된 후)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (transformRef.current) {
        transformRef.current.centerView(0.12);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 역 클릭 핸들러
  const handleStationClick = useCallback(
    (stationName: string, coords: StationCoords) => {
      setInternalSelected({ name: stationName, ...coords });
      onStationSelect?.(stationName, coords);
    },
    [onStationSelect]
  );

  // 검색어로 필터링된 역 목록
  const filteredStations = useMemo(() => {
    const entries = Object.entries(stationsData as Record<string, StationCoords>);
    if (!searchQuery) return entries;
    return entries.filter(([name]) => name.includes(searchQuery));
  }, [searchQuery]);

  return (
    <div className="w-full h-full relative">
      <TransformWrapper
        ref={transformRef}
        initialScale={0.12}
        minScale={0.08}
        maxScale={2}
        centerOnInit={false}
        limitToBounds={false}
        panning={{ velocityDisabled: true }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* 줌 컨트롤 버튼 */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
              <button
                onClick={() => zoomIn()}
                className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center justify-center text-xl hover:bg-gray-50 active:bg-gray-100"
              >
                +
              </button>
              <button
                onClick={() => zoomOut()}
                className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center justify-center text-xl hover:bg-gray-50 active:bg-gray-100"
              >
                -
              </button>
              <button
                onClick={() => resetTransform()}
                className="w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center justify-center text-lg hover:bg-gray-50 active:bg-gray-100"
              >
                ↺
              </button>
            </div>

            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%' }}
              contentStyle={{ width: `${SVG_WIDTH}px`, height: `${SVG_HEIGHT}px` }}
            >
              <div
                style={{
                  position: 'relative',
                  width: `${SVG_WIDTH}px`,
                  height: `${SVG_HEIGHT}px`,
                }}
              >
                {/* SVG 노선도 배경 */}
                <img
                  src={subwayMapSvg}
                  alt="서울 지하철 노선도"
                  style={{ width: '100%', height: '100%' }}
                  draggable={false}
                />

                {/* 클릭 가능한 역 오버레이 */}
                {filteredStations.map(([name, coords]) => (
                  <div
                    key={name}
                    onClick={() => handleStationClick(name, coords)}
                    style={{
                      position: 'absolute',
                      left: coords.x - CLICK_AREA_SIZE / 2,
                      top: coords.y - CLICK_AREA_SIZE / 2,
                      width: CLICK_AREA_SIZE,
                      height: CLICK_AREA_SIZE,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      background:
                        selectedStation?.name === name
                          ? 'rgba(59, 130, 246, 0.5)'
                          : 'transparent',
                      border:
                        selectedStation?.name === name
                          ? '3px solid #3b82f6'
                          : 'none',
                      transition: 'all 0.2s',
                    }}
                    title={name}
                  />
                ))}
              </div>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>

      {/* 선택된 역 정보 표시 (하단) */}
      {selectedStation && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200 z-10">
          <span className="font-bold text-blue-600">{selectedStation.name}</span>
          <span className="text-gray-600">역 선택됨</span>
        </div>
      )}
    </div>
  );
}
