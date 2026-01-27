/**
 * SSE 연동 캐릭터 이동 테스트 페이지
 *
 * 백엔드에서 Postman으로 경주 생성 후, route_itinerary_id를 입력하여
 * 실제 SSE 연결 및 캐릭터 이동을 테스트합니다.
 *
 * 사용법:
 * 1. Postman에서 POST /api/v1/routes로 경주 생성
 * 2. 반환된 route_itinerary_id를 입력
 * 3. "SSE 연결" 버튼 클릭
 * 4. 캐릭터들이 경로를 따라 이동하는지 확인
 */

import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useRouteSSE, type SSEConnectionStatus } from '@/hooks/useRouteSSE';
import { MovingCharacter, type CharacterColor } from '@/components/MovingCharacter';
import type { BotStatusUpdateEvent, Coordinate } from '@/types/route';

// Mapbox Access Token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';

// 봇별 캐릭터 색상
const BOT_COLORS: CharacterColor[] = ['pink', 'yellow', 'green', 'purple'];

// 연결 상태 표시 색상
const STATUS_COLORS: Record<SSEConnectionStatus, string> = {
  disconnected: '🔴',
  connecting: '🟡',
  connected: '🟢',
  error: '🔴',
  closed: '⚫',
};

export function RaceTestPage() {
  // 입력 상태
  const [routeItineraryId, setRouteItineraryId] = useState<string>('');
  const [activeRouteId, setActiveRouteId] = useState<number | null>(null);

  // 지도 관련
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 출발/도착 좌표 (수동 입력 가능)
  const [startCoord, setStartCoord] = useState<Coordinate>({ lon: 126.9780, lat: 37.5665 }); // 서울시청
  const [endCoord, setEndCoord] = useState<Coordinate>({ lon: 127.0276, lat: 37.4979 }); // 강남역

  // 봇 상태 저장
  const [botPositions, setBotPositions] = useState<Map<number, BotStatusUpdateEvent>>(new Map());

  // 이벤트 로그
  const [eventLogs, setEventLogs] = useState<string[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // 로그 추가 함수
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString('ko-KR');
    setEventLogs((prev) => [...prev.slice(-50), `[${timestamp}] ${message}`]);
  };

  // SSE 연결
  const { status, botStates, disconnect } = useRouteSSE(
    activeRouteId,
    {
      onConnected: (data) => {
        addLog(`✅ SSE 연결됨: ${data.message}`);
      },
      onBotStatusUpdate: (data) => {
        // position이 있을 때만 좌표 표시
        const positionStr = data.position
          ? `@ [${data.position.lon.toFixed(4)}, ${data.position.lat.toFixed(4)}]`
          : '(위치 정보 없음)';
        addLog(`🤖 봇 ${data.bot_id}: ${data.status} (${data.progress_percent.toFixed(1)}%) ${positionStr}`);
        setBotPositions((prev) => {
          const next = new Map(prev);
          next.set(data.bot_id, data);
          return next;
        });
      },
      onBotBoarding: (data) => {
        addLog(`🚌 봇 ${data.bot_id} 탑승: ${data.station_name} (${data.vehicle.type} ${data.vehicle.route})`);
      },
      onBotAlighting: (data) => {
        addLog(`🚶 봇 ${data.bot_id} 하차: ${data.station_name}`);
      },
      onParticipantFinished: (data) => {
        addLog(`🏁 참가자 도착! 순위: ${data.rank}위, 소요시간: ${data.duration}초`);
      },
      onRouteEnded: (data) => {
        addLog(`🎉 경주 종료: ${data.reason}`);
      },
      onError: (error) => {
        addLog(`❌ 에러: ${error.message}`);
      },
    }
  );

  // SSE botStates 동기화
  useEffect(() => {
    if (botStates.size > 0) {
      setBotPositions(new Map(botStates));
    }
  }, [botStates]);

  // 로그 자동 스크롤
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [eventLogs]);

  // 지도 초기화
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [startCoord.lon, startCoord.lat],
      zoom: 12,
    });

    map.current.on('load', () => {
      setIsMapLoaded(true);
      addLog('🗺️ 지도 로드 완료');
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // 출발/도착 마커 추가
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;

    const mapInstance = map.current;

    // 기존 마커 제거를 위한 클래스 사용
    document.querySelectorAll('.test-marker').forEach((el) => el.remove());

    // 출발 마커
    const startEl = document.createElement('div');
    startEl.className = 'test-marker';
    startEl.innerHTML = `
      <div style="
        width: 32px;
        height: 40px;
        background: #2b7fff;
        border: 3px solid white;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        font-size: 14px;
        font-weight: bold;
        color: white;
      ">출</div>
    `;
    new mapboxgl.Marker({ element: startEl })
      .setLngLat([startCoord.lon, startCoord.lat])
      .addTo(mapInstance);

    // 도착 마커
    const endEl = document.createElement('div');
    endEl.className = 'test-marker';
    endEl.innerHTML = `
      <div style="
        width: 32px;
        height: 40px;
        background: #fb2c36;
        border: 3px solid white;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
        font-size: 14px;
        font-weight: bold;
        color: white;
      ">도</div>
    `;
    new mapboxgl.Marker({ element: endEl })
      .setLngLat([endCoord.lon, endCoord.lat])
      .addTo(mapInstance);

    // 지도 범위 조정
    const bounds = new mapboxgl.LngLatBounds()
      .extend([startCoord.lon, startCoord.lat])
      .extend([endCoord.lon, endCoord.lat]);

    mapInstance.fitBounds(bounds, {
      padding: { top: 100, bottom: 100, left: 50, right: 400 },
      duration: 1000,
    });
  }, [isMapLoaded, startCoord, endCoord]);

  // 연결 시작
  const handleConnect = () => {
    const id = parseInt(routeItineraryId);
    if (isNaN(id) || id <= 0) {
      addLog('❌ 올바른 route_itinerary_id를 입력하세요');
      return;
    }
    setActiveRouteId(id);
    setBotPositions(new Map());
    addLog(`🔗 SSE 연결 시도: route_itinerary_id = ${id}`);
  };

  // 연결 해제
  const handleDisconnect = () => {
    disconnect();
    setActiveRouteId(null);
    addLog('🔌 SSE 연결 해제');
  };

  // 봇 위치로 지도 이동
  const handleFocusBot = (botId: number) => {
    const botState = botPositions.get(botId);
    if (botState && map.current) {
      map.current.flyTo({
        center: [botState.position.lon, botState.position.lat],
        zoom: 15,
        duration: 1000,
      });
    }
  };

  // 봇 목록 (botPositions에서 추출)
  const botList = Array.from(botPositions.entries()).map(([botId, state]) => ({
    botId,
    state,
    color: BOT_COLORS[botId % BOT_COLORS.length],
  }));

  return (
    <div className="fixed inset-0 flex">
      {/* 왼쪽: 컨트롤 패널 */}
      <div className="w-[380px] bg-white border-r-4 border-black flex flex-col h-full overflow-hidden">
        {/* 헤더 */}
        <div className="bg-[#ffd93d] px-4 py-3 border-b-4 border-black">
          <h1 className="text-lg font-bold">🏁 SSE 캐릭터 이동 테스트</h1>
          <p className="text-xs text-gray-700 mt-1">
            Postman에서 경주 생성 후 route_itinerary_id 입력
          </p>
        </div>

        {/* SSE 연결 섹션 */}
        <div className="p-4 border-b-2 border-gray-200">
          <label className="block text-sm font-bold mb-2">
            Route Itinerary ID
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={routeItineraryId}
              onChange={(e) => setRouteItineraryId(e.target.value)}
              placeholder="예: 123"
              className="flex-1 px-3 py-2 border-2 border-black rounded-lg text-sm"
              disabled={activeRouteId !== null}
            />
            {activeRouteId === null ? (
              <button
                onClick={handleConnect}
                className="px-4 py-2 bg-[#48d448] text-white font-bold rounded-lg border-2 border-black hover:bg-[#3db83d] transition-colors"
              >
                연결
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-[#ff6b6b] text-white font-bold rounded-lg border-2 border-black hover:bg-[#ee5a5a] transition-colors"
              >
                해제
              </button>
            )}
          </div>
          <div className="mt-2 text-sm">
            상태: {STATUS_COLORS[status]} {status}
          </div>
        </div>

        {/* 좌표 설정 섹션 */}
        <div className="p-4 border-b-2 border-gray-200">
          <div className="text-sm font-bold mb-2">📍 출발/도착 좌표 (마커용)</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block text-gray-600">출발 경도</label>
              <input
                type="number"
                step="0.0001"
                value={startCoord.lon}
                onChange={(e) => setStartCoord((p) => ({ ...p, lon: parseFloat(e.target.value) || 0 }))}
                className="w-full px-2 py-1 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600">출발 위도</label>
              <input
                type="number"
                step="0.0001"
                value={startCoord.lat}
                onChange={(e) => setStartCoord((p) => ({ ...p, lat: parseFloat(e.target.value) || 0 }))}
                className="w-full px-2 py-1 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600">도착 경도</label>
              <input
                type="number"
                step="0.0001"
                value={endCoord.lon}
                onChange={(e) => setEndCoord((p) => ({ ...p, lon: parseFloat(e.target.value) || 0 }))}
                className="w-full px-2 py-1 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600">도착 위도</label>
              <input
                type="number"
                step="0.0001"
                value={endCoord.lat}
                onChange={(e) => setEndCoord((p) => ({ ...p, lat: parseFloat(e.target.value) || 0 }))}
                className="w-full px-2 py-1 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* 봇 목록 */}
        <div className="p-4 border-b-2 border-gray-200">
          <div className="text-sm font-bold mb-2">🤖 봇 목록 ({botList.length})</div>
          {botList.length === 0 ? (
            <p className="text-xs text-gray-500">SSE 연결 후 봇 정보가 표시됩니다</p>
          ) : (
            <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto">
              {botList.map(({ botId, state, color }) => (
                <div
                  key={botId}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleFocusBot(botId)}
                >
                  <div
                    className="w-6 h-6 rounded-full border-2 border-black"
                    style={{ backgroundColor: color === 'pink' ? '#ff6b9d' : color === 'yellow' ? '#ffc107' : color === 'green' ? '#48d448' : '#9c27b0' }}
                  />
                  <div className="flex-1 text-xs">
                    <div className="font-bold">봇 {botId}</div>
                    <div className="text-gray-600">{state.status} ({state.progress_percent.toFixed(1)}%)</div>
                  </div>
                  <button className="text-xs text-blue-500 hover:underline">
                    이동
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 이벤트 로그 */}
        <div className="flex-1 flex flex-col min-h-0 p-4">
          <div className="text-sm font-bold mb-2">📋 이벤트 로그</div>
          <div
            ref={logContainerRef}
            className="flex-1 bg-gray-900 text-green-400 text-xs font-mono p-2 rounded-lg overflow-y-auto"
          >
            {eventLogs.length === 0 ? (
              <p className="text-gray-500">이벤트가 여기에 표시됩니다...</p>
            ) : (
              eventLogs.map((log, i) => (
                <div key={i} className="py-0.5">
                  {log}
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setEventLogs([])}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            로그 지우기
          </button>
        </div>
      </div>

      {/* 오른쪽: 지도 */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />

        {/* 캐릭터들 */}
        {botList.map(({ botId, state, color }) => (
          <MovingCharacter
            key={botId}
            map={map.current}
            color={color}
            botId={botId}
            currentPosition={state.position}
            status={state.status}
            updateInterval={5000}
            size={64}
            animationSpeed={150}
            onClick={() => handleFocusBot(botId)}
          />
        ))}

        {/* 지도 위 안내 */}
        {botList.length === 0 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 px-6 py-4 rounded-xl border-2 border-black text-center">
            <p className="text-lg font-bold mb-2">🎮 테스트 준비</p>
            <p className="text-sm text-gray-600">
              1. Postman에서 경주 생성<br />
              2. route_itinerary_id 입력<br />
              3. SSE 연결 버튼 클릭
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
