import MapboxLanguage from '@mapbox/mapbox-gl-language';
import 'mapbox-gl/dist/mapbox-gl.css';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { Map, type MapRef } from 'react-map-gl/mapbox';
import { registerNaviSprites } from './map/naviSprite';
import { addNaviLayer, updateNaviFeature, type LngLat } from './map/naviLayer';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export interface MapContainerHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  recenter: () => void;
}

const MapContainer = forwardRef<MapContainerHandle>((_, ref) => {
  const mapRef = useRef<MapRef>(null);

  // Navi 캐릭터 초기 위치 (부평역 근처)
  const initialNaviPosition: LngLat = [126.735, 37.489];

  // 걷기 애니메이션 프레임
  const walkFrameRef = useRef(0);
  const animationRef = useRef<number | null>(null);

  // 핵심: 지도가 처음 로드될 때 플러그인을 한 번만 등록합니다.
  const onMapLoad = useCallback(async () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // 1. 공식 언어 플러그인 적용 (이게 가장 확실합니다)
    const language = new MapboxLanguage({
      defaultLanguage: 'ko' // 기본 언어를 한국어로 강제
    });
    map.addControl(language);

    // 2. 플러그인이 놓치는 미세한 부분까지 coalesce로 한 번 더 보정
    const setKoreanLabels = () => {
      const style = map.getStyle();
      if (!style?.layers) return;

      style.layers.forEach((layer) => {
        if (layer.type === 'symbol' && layer.layout && 'text-field' in layer.layout) {
          map.setLayoutProperty(layer.id, 'text-field', [
            'coalesce',
            ['get', 'name_ko'],
            ['get', 'name:ko'],
            ['get', 'name_ko-Latn'], // 한국어 발음 표기
            ['get', 'name']         // 최후의 보루
          ]);
        }
      });
    };

    setKoreanLabels();

    // 3. Navi 스프라이트 등록 및 레이어 추가
    try {
      await registerNaviSprites(map);
      addNaviLayer(map, initialNaviPosition);

      // 걷기 애니메이션 시작 (테스트용)
      const animate = () => {
        walkFrameRef.current = (walkFrameRef.current + 1) % 4;
        updateNaviFeature(map, initialNaviPosition, 0, walkFrameRef.current, 'walking');
        animationRef.current = window.setTimeout(() => {
          requestAnimationFrame(animate);
        }, 120); // 120ms 간격으로 빠르게 프레임 변경
      };
      animate();
    } catch (err) {
      console.error('Navi 스프라이트 로드 실패:', err);
    }
  }, []);

  useImperativeHandle(ref, () => ({
    zoomIn: () => {
      const map = mapRef.current?.getMap();
      if (map) map.zoomTo(map.getZoom() + 1, { duration: 300 });
    },
    zoomOut: () => {
      const map = mapRef.current?.getMap();
      if (map) map.zoomTo(map.getZoom() - 1, { duration: 300 });
    },
    recenter: () => {
      const map = mapRef.current?.getMap();
      if (map) {
        map.flyTo({
          center: [126.735, 37.489],
          zoom: 13,
          duration: 1000
        });
      }
    }
  }));

  return (
    <div className="absolute inset-0 z-0">
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: 126.735,
          latitude: 37.489,
          zoom: 13
        }}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        style={{ width: '100%', height: '100%' }}
        onLoad={onMapLoad} // 지도가 로드되면 위에서 정의한 함수 실행
        reuseMaps
      />
    </div>
  );
});

MapContainer.displayName = 'MapContainer';
export default MapContainer;
