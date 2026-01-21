/**
 * 경주 진행을 위한 지도 뷰 컴포넌트
 *
 * Mapbox 지도 위에 경로선과 이동하는 캐릭터들을 표시합니다.
 * SSE를 통해 실시간으로 봇 위치를 수신하여 애니메이션합니다.
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MovingCharacter, type CharacterColor } from '@/components/MovingCharacter';
import { useRouteSSE } from '@/hooks/useRouteSSE';
import type {
  RouteParticipant,
  BotStatusUpdateEvent,
  Coordinate,
} from '@/types/route';
import {
  mergeSegmentCoordinates,
  routeLineToGeoJSON,
} from '@/utils/routeInterpolation';

// Mapbox Access Token 설정
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

// 봇별 캐릭터 색상 매핑
const BOT_COLORS: CharacterColor[] = ['pink', 'yellow', 'purple', 'gray'];

interface RaceMapViewProps {
  // 경주 Itinerary ID (SSE 연결용)
  routeItineraryId: number | null;
  // 참가자 정보 (경로 데이터 포함)
  participants: RouteParticipant[];
  // 출발지 좌표
  startCoordinate: Coordinate;
  // 도착지 좌표
  endCoordinate: Coordinate;
  // 경주 종료 콜백
  onRouteEnded?: () => void;
  // 참가자 도착 콜백
  onParticipantFinished?: (rank: number, duration: number) => void;
}

/**
 * 경주 지도 뷰 컴포넌트
 */
export function RaceMapView({
  routeItineraryId,
  participants,
  startCoordinate,
  endCoordinate,
  onRouteEnded,
  onParticipantFinished,
}: RaceMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 봇 상태 (봇 ID -> 위치 정보)
  const [botPositions, setBotPositions] = useState<Map<number, BotStatusUpdateEvent>>(
    new Map()
  );

  // SSE 연결
  const { status, botStates } = useRouteSSE(
    routeItineraryId,
    {
      onBotStatusUpdate: (data) => {
        setBotPositions((prev) => {
          const next = new Map(prev);
          next.set(data.bot_id, data);
          return next;
        });
      },
      onParticipantFinished: (data) => {
        console.log('🏁 참가자 도착:', data);
        onParticipantFinished?.(data.rank, data.duration);
      },
      onRouteEnded: () => {
        console.log('🎉 경주 종료');
        onRouteEnded?.();
      },
    }
  );

  // 봇 참가자만 필터링
  const botParticipants = useMemo(
    () => participants.filter((p) => p.type === 'BOT'),
    [participants]
  );

  // 경로 색상 (참가자별)
  const routeColors = useMemo(
    () => ['#ff6b9d', '#ffc107', '#6df3e3', '#9c27b0'],
    []
  );

  // 지도 초기화
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // 출발지를 중심으로 지도 초기화
    const center: [number, number] = [startCoordinate.lon, startCoordinate.lat];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center,
      zoom: 14,
      locale: {
        'NavigationControl.ZoomIn': '확대',
        'NavigationControl.ZoomOut': '축소',
        'NavigationControl.ResetBearing': '북쪽으로',
        'GeolocateControl.FindMyLocation': '내 위치',
        'GeolocateControl.LocationNotAvailable': '위치를 사용할 수 없습니다',
      },
    });

    map.current.on('load', () => {
      const mapInstance = map.current;
      if (!mapInstance) return;

      // 한국어 라벨 적용
      const layers = mapInstance.getStyle().layers;
      if (layers) {
        layers.forEach((layer) => {
          if (layer.type === 'symbol' && layer.layout?.['text-field']) {
            mapInstance.setLayoutProperty(layer.id, 'text-field', [
              'coalesce',
              ['get', 'name_ko'],
              ['get', 'name:ko'],
              ['get', 'name'],
            ]);
          }
        });
      }

      setIsMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [startCoordinate]);

  // 경로선 추가
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const mapInstance = map.current;

    // 각 참가자별 경로선 추가
    participants.forEach((participant, index) => {
      const sourceId = `route-${participant.route_id}`;
      const layerId = `route-layer-${participant.route_id}`;

      // 기존 소스/레이어 제거
      if (mapInstance.getLayer(layerId)) {
        mapInstance.removeLayer(layerId);
      }
      if (mapInstance.getSource(sourceId)) {
        mapInstance.removeSource(sourceId);
      }

      // 경로 좌표 추출
      const coordinates = mergeSegmentCoordinates(participant.leg.segments);

      if (coordinates.length < 2) return;

      // GeoJSON 소스 추가
      mapInstance.addSource(sourceId, {
        type: 'geojson',
        data: routeLineToGeoJSON(coordinates, { routeId: participant.route_id }),
      });

      // 경로선 레이어 추가
      mapInstance.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': routeColors[index % routeColors.length],
          'line-width': 6,
          'line-opacity': 0.8,
          'line-dasharray': [2, 1],
        },
      });
    });

    // 출발/도착 마커 추가
    // 출발 마커
    const startEl = document.createElement('div');
    startEl.innerHTML = `
      <div style="
        width: 28px;
        height: 36px;
        background: #2b7fff;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      ">
        <span style="color: white; font-size: 12px; font-weight: bold;">출</span>
      </div>
    `;
    new mapboxgl.Marker({ element: startEl })
      .setLngLat([startCoordinate.lon, startCoordinate.lat])
      .addTo(mapInstance);

    // 도착 마커
    const endEl = document.createElement('div');
    endEl.innerHTML = `
      <div style="
        width: 28px;
        height: 36px;
        background: #fb2c36;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      ">
        <span style="color: white; font-size: 12px; font-weight: bold;">도</span>
      </div>
    `;
    new mapboxgl.Marker({ element: endEl })
      .setLngLat([endCoordinate.lon, endCoordinate.lat])
      .addTo(mapInstance);

    // 경로가 모두 보이도록 지도 범위 조정
    const allCoords: [number, number][] = [];
    participants.forEach((p) => {
      const coords = mergeSegmentCoordinates(p.leg.segments);
      allCoords.push(...coords);
    });

    if (allCoords.length > 0) {
      const bounds = allCoords.reduce(
        (b, coord) => b.extend(coord as [number, number]),
        new mapboxgl.LngLatBounds(allCoords[0], allCoords[0])
      );

      mapInstance.fitBounds(bounds, {
        padding: { top: 100, bottom: 200, left: 50, right: 50 },
        duration: 1000,
      });
    }
  }, [isMapLoaded, participants, startCoordinate, endCoordinate, routeColors]);

  // SSE 상태에서 봇 위치 동기화
  useEffect(() => {
    if (botStates.size > 0) {
      setBotPositions(new Map(botStates));
    }
  }, [botStates]);

  return (
    <div className="relative w-full h-full">
      {/* Mapbox 지도 컨테이너 */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* SSE 연결 상태 표시 */}
      <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-lg border-2 border-black text-xs">
        SSE: {status === 'connected' ? '🟢 연결됨' : status === 'connecting' ? '🟡 연결 중' : '🔴 연결 안됨'}
      </div>

      {/* 봇 캐릭터들 */}
      {botParticipants.map((participant, index) => {
        const botState = botPositions.get(participant.bot_id!);
        const position = botState?.position || null;

        return (
          <MovingCharacter
            key={participant.bot_id}
            map={map.current}
            color={BOT_COLORS[index % BOT_COLORS.length]}
            botId={participant.bot_id!}
            currentPosition={position}
            status={botState?.status || 'WALKING'}
            routeSegments={participant.leg.segments}
            updateInterval={(botState?.next_update_in || 5) * 1000}
            size={64}
            animationSpeed={150}
          />
        );
      })}
    </div>
  );
}
