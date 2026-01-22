/**
 * 버스 실시간 위치 레이어 관리
 *
 * 기능:
 * - 노선별 운행 중인 버스의 실시간 GPS 위치 표시 (귀여운 버스 아이콘)
 * - 버스 아이콘 클릭 시 정보 팝업 (다음 정류장, 차량번호 등)
 * - 15초 간격 자동 업데이트 + 부드러운 보간 애니메이션
 *
 * 버스 유형별 색상:
 * - 간선버스 (파랑): 100~399번대
 * - 지선버스 (초록): 400~499, 5000~5999, 6000~6999, 7000~7999
 * - 광역버스 (빨강): 9000~9999
 * - 순환버스 (노랑): 01~09
 * - 마을버스 (초록): 마을, 종로01 등
 */

import mapboxgl from "mapbox-gl";
import type { BusRealtimePosition, BusAreaPosition } from "../../lib/api";

// 버스 유형별 색상
export const BUS_COLORS = {
  trunk: "#3366FF", // 간선 (파랑)
  branch: "#55AA55", // 지선 (초록)
  express: "#EE4444", // 광역 (빨강)
  circular: "#FFAA00", // 순환 (노랑)
  town: "#77BB77", // 마을 (연두)
  airport: "#6699CC", // 공항 (하늘)
  night: "#333333", // 심야 (검정)
};

// 버스 실시간 위치 + 추가 정보
interface BusPositionData extends BusRealtimePosition {
  route_id: string;
  bus_number: string;
  color: string;
  // 이전 좌표 (시간 기반 보간용)
  prev_coordinates?: [number, number];
  // 마지막 API 업데이트 시간
  last_update: number;
}

// API 업데이트 주기 (15초)
// 15초 동안 버스가 이동하는 거리(약 75~125m)는 짧아서 직선 보간해도 건물을 크게 뚫지 않음
const API_UPDATE_INTERVAL = 15000;

// 현재 팝업 참조
let currentPopup: mapboxgl.Popup | null = null;

// 현재 팝업이 열려있는 버스 ID (팝업이 버스를 따라다니도록)
let currentPopupVehId: string | null = null;

// 레이어가 추가되었는지 추적
let layersAdded = false;

// 현재 활성화된 노선들
const activeRoutes = new Map<string, string>(); // routeId -> busNumber

// 버스 위치 데이터 저장
let busPositionsData: BusPositionData[] = [];

// 버스 마커들 (HTML 마커 방식)
const busMarkers = new Map<string, mapboxgl.Marker>();

// 현재 마커가 표시되고 있는 실제 위치 (애니메이션용)
const currentDisplayPositions = new Map<string, [number, number]>();

// 보간 애니메이션 프레임 ID
let animationFrameId: number | null = null;

// 지도 인스턴스 참조
let mapInstance: mapboxgl.Map | null = null;

/**
 * 버스 번호로 버스 유형 판별
 */
export function getBusType(busNumber: string): keyof typeof BUS_COLORS {
  const num = parseInt(busNumber, 10);

  // 공항버스 (60XX번대만 - 6001, 6002, 6009, 6011 등)
  if (busNumber.startsWith("60") && busNumber.length === 4) {
    return "airport";
  }

  // 심야버스
  if (busNumber.startsWith("N")) return "night";

  // 순환버스 (01~09)
  if (/^0[1-9]$/.test(busNumber)) return "circular";

  // 간선버스 (3자리, 100~399)
  if (num >= 100 && num <= 399) return "trunk";

  // 광역버스 (9000~9999)
  if (num >= 9000 && num <= 9999) return "express";

  // 지선버스 (나머지 대부분)
  if (num >= 400 && num <= 499) return "branch";
  if (num >= 5000 && num <= 5999) return "branch";
  if (num >= 6000 && num <= 6999) return "branch";
  if (num >= 7000 && num <= 7999) return "branch";

  // 마을버스 (문자 포함 또는 기타)
  if (/[가-힣]/.test(busNumber) || busNumber.includes("마을")) return "town";

  return "branch"; // 기본값
}

/**
 * 버스 유형별 색상 반환
 */
export function getBusColor(busNumber: string): string {
  const type = getBusType(busNumber);
  return BUS_COLORS[type];
}

/**
 * 귀여운 버스 아이콘 HTML 생성
 */
function createBusIconElement(busNumber: string, color: string): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "bus-marker-container";
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transform: translate(-50%, -50%);
  `;

  // 버스 번호 라벨
  const label = document.createElement("div");
  label.className = "bus-number-label";
  label.textContent = busNumber;
  label.style.cssText = `
    background: ${color};
    color: white;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 8px;
    margin-bottom: 2px;
    white-space: nowrap;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;

  // 버스 아이콘 (귀여운 버스 모양)
  const icon = document.createElement("div");
  icon.className = "bus-icon";
  icon.innerHTML = `
    <svg width="28" height="24" viewBox="0 0 28 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 버스 본체 -->
      <rect x="2" y="4" width="24" height="14" rx="3" fill="${color}"/>
      <!-- 창문 -->
      <rect x="4" y="6" width="5" height="5" rx="1" fill="white" fill-opacity="0.9"/>
      <rect x="11" y="6" width="5" height="5" rx="1" fill="white" fill-opacity="0.9"/>
      <rect x="18" y="6" width="5" height="5" rx="1" fill="white" fill-opacity="0.9"/>
      <!-- 앞유리 강조 -->
      <rect x="4" y="6" width="5" height="5" rx="1" fill="white" fill-opacity="0.95"/>
      <!-- 하단 라인 -->
      <rect x="2" y="14" width="24" height="2" fill="${adjustColor(color, -20)}"/>
      <!-- 바퀴 -->
      <circle cx="7" cy="19" r="3" fill="#333"/>
      <circle cx="7" cy="19" r="1.5" fill="#666"/>
      <circle cx="21" cy="19" r="3" fill="#333"/>
      <circle cx="21" cy="19" r="1.5" fill="#666"/>
      <!-- 헤드라이트 -->
      <rect x="23" y="8" width="2" height="2" rx="0.5" fill="#FFE066"/>
      <!-- 사이드 미러 -->
      <rect x="0" y="7" width="2" height="3" rx="1" fill="${adjustColor(color, -30)}"/>
    </svg>
  `;
  icon.style.cssText = `
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  `;

  container.appendChild(label);
  container.appendChild(icon);

  return container;
}

/**
 * 색상 밝기 조절
 */
function adjustColor(color: string, amount: number): string {
  const hex = color.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/**
 * 버스 실시간 위치 레이어 추가
 * @returns Promise - 레이어 초기화 완료 시 resolve
 */
export function addBusLayers(map: mapboxgl.Map): Promise<void> {
  return new Promise((resolve) => {
    if (layersAdded) {
      resolve();
      return;
    }

    // 스타일이 로드되지 않았으면 대기
    if (!map.isStyleLoaded()) {
      map.once("style.load", () => {
        mapInstance = map;
        layersAdded = true;
        console.log("[BusLayer] 버스 실시간 위치 레이어 초기화 완료 (HTML 마커 방식)");
        resolve();
      });
      return;
    }

    mapInstance = map;
    layersAdded = true;
    console.log("[BusLayer] 버스 실시간 위치 레이어 초기화 완료 (HTML 마커 방식)");
    resolve();
  });
}

/**
 * 버스 레이어 제거
 */
export function removeBusLayers(_map: mapboxgl.Map): void {
  if (!layersAdded) return;

  try {
    // 애니메이션 중지
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // 팝업 제거
    if (currentPopup) {
      currentPopup.remove();
      currentPopup = null;
      currentPopupVehId = null;
    }

    // 모든 마커 제거
    busMarkers.forEach((marker) => marker.remove());
    busMarkers.clear();
    currentDisplayPositions.clear();

    layersAdded = false;
    activeRoutes.clear();
    busPositionsData = [];
    mapInstance = null;
    console.log("[BusLayer] 버스 레이어 제거 완료");
  } catch (error) {
    console.error("[BusLayer] 레이어 제거 실패:", error);
  }
}

/**
 * 버스 레이어 표시/숨김 토글
 */
export function toggleBusLayers(_map: mapboxgl.Map, visible: boolean): void {
  busMarkers.forEach((marker) => {
    const el = marker.getElement();
    el.style.display = visible ? "block" : "none";
  });

  if (!visible && animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  console.log(`[BusLayer] 버스 레이어 ${visible ? "표시" : "숨김"}`);
}

/**
 * 노선 추가 (추적 시작)
 */
export function addRoute(routeId: string, busNumber: string): void {
  activeRoutes.set(routeId, busNumber);
  console.log(`[BusLayer] 노선 추가: ${busNumber} (${routeId})`);
}

/**
 * 노선 제거 (추적 중단)
 */
export function removeRoute(routeId: string): void {
  activeRoutes.delete(routeId);
  // 해당 노선의 버스 위치 데이터 및 마커 제거
  busPositionsData = busPositionsData.filter((pos) => pos.route_id !== routeId);

  // 해당 노선의 마커 제거
  busMarkers.forEach((marker, vehId) => {
    const data = busPositionsData.find((p) => p.veh_id === vehId);
    if (!data || data.route_id === routeId) {
      marker.remove();
      busMarkers.delete(vehId);
    }
  });

  console.log(`[BusLayer] 노선 제거: ${routeId}`);
}

/**
 * 활성화된 노선 목록 반환
 */
export function getActiveRoutes(): Map<string, string> {
  return activeRoutes;
}


/**
 * 보간 애니메이션 실행 (시간 기반 선형 보간)
 *
 * 핵심: 이전 좌표 → 현재 좌표를 API_UPDATE_INTERVAL(30초)에 걸쳐 부드럽게 이동
 * - 속도 "예측"이 아니라 실제 두 좌표 사이의 선형 보간
 * - 도로를 벗어나지 않음 (실제 API가 제공한 좌표 사이만 이동)
 */
function runInterpolationAnimation(): void {
  if (!mapInstance) return;

  const now = Date.now();

  busPositionsData.forEach((pos) => {
    const marker = busMarkers.get(pos.veh_id);
    if (!marker) return;

    // 이전 좌표가 없으면 (새 버스) 현재 좌표로 바로 표시
    if (!pos.prev_coordinates) {
      marker.setLngLat(pos.coordinates);
      currentDisplayPositions.set(pos.veh_id, [...pos.coordinates] as [number, number]);
      return;
    }

    // API 업데이트 이후 경과 시간 (0 ~ API_UPDATE_INTERVAL)
    const elapsed = now - pos.last_update;

    // 진행률 (0.0 ~ 1.0), 30초 후에는 1.0으로 고정
    const progress = Math.min(elapsed / API_UPDATE_INTERVAL, 1.0);

    // 이전 좌표에서 현재 좌표로 선형 보간
    const prevLng = pos.prev_coordinates[0];
    const prevLat = pos.prev_coordinates[1];
    const currLng = pos.coordinates[0];
    const currLat = pos.coordinates[1];

    const newLng = prevLng + (currLng - prevLng) * progress;
    const newLat = prevLat + (currLat - prevLat) * progress;

    marker.setLngLat([newLng, newLat]);
    currentDisplayPositions.set(pos.veh_id, [newLng, newLat]);

    // 팝업이 이 버스에 열려있으면 팝업 위치도 업데이트
    if (currentPopup && currentPopupVehId === pos.veh_id) {
      currentPopup.setLngLat([newLng, newLat]);
    }
  });

  // 버스가 있으면 계속 애니메이션
  if (busPositionsData.length > 0) {
    animationFrameId = requestAnimationFrame(runInterpolationAnimation);
  } else {
    animationFrameId = null;
  }
}

/**
 * 버스 실시간 위치 업데이트
 */
export function updateBusPositions(
  map: mapboxgl.Map,
  routeId: string,
  busNumber: string,
  positions: BusRealtimePosition[]
): void {
  if (!layersAdded) {
    console.warn("[BusLayer] 레이어가 초기화되지 않음");
    return;
  }

  const color = getBusColor(busNumber);
  const now = Date.now();

  // 기존 데이터에서 이전 좌표 찾기 (시간 기반 보간용)
  const prevDataMap = new Map<string, BusPositionData>();
  busPositionsData
    .filter((p) => p.route_id === routeId)
    .forEach((p) => prevDataMap.set(p.veh_id, p));

  // 해당 노선의 기존 데이터 제거 (다른 노선은 유지)
  busPositionsData = busPositionsData.filter((pos) => pos.route_id !== routeId);

  // 새 데이터 추가 (이전 좌표 저장 - 시간 기반 보간용)
  const newPositions: BusPositionData[] = positions.map((pos) => {
    const prevData = prevDataMap.get(pos.veh_id);

    // 이전 좌표: 기존 버스면 현재 표시 위치 사용
    let prev_coordinates: [number, number] | undefined;
    if (prevData) {
      const displayPos = currentDisplayPositions.get(pos.veh_id);
      prev_coordinates = displayPos || prevData.coordinates;
    }

    return {
      ...pos,
      route_id: routeId,
      bus_number: busNumber,
      color: color,
      prev_coordinates: prev_coordinates,
      last_update: now,
    };
  });
  busPositionsData = [...busPositionsData, ...newPositions];

  // 마커 업데이트
  newPositions.forEach((pos) => {
    let marker = busMarkers.get(pos.veh_id);

    if (!marker) {
      // 새 마커 생성
      const el = createBusIconElement(busNumber, color);

      // 클릭 이벤트
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        showBusPopup(map, pos, pos.coordinates);
      });

      // 현재 표시 위치 초기화
      currentDisplayPositions.set(pos.veh_id, [...pos.coordinates] as [number, number]);

      marker = new mapboxgl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat(pos.coordinates)
        .addTo(map);

      busMarkers.set(pos.veh_id, marker);
    }
    // 기존 마커는 애니메이션에서 위치 업데이트 (급발진 방지)
  });

  // 사라진 버스 마커 제거
  busMarkers.forEach((marker, vehId) => {
    const stillExists = busPositionsData.some((p) => p.veh_id === vehId);
    if (!stillExists) {
      marker.remove();
      busMarkers.delete(vehId);
    }
  });

  // 보간 애니메이션 시작
  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(runInterpolationAnimation);
  }

  console.log(
    `[BusLayer] ${busNumber}번 버스 위치 업데이트: ${positions.length}대 운행중 (전체 ${busPositionsData.length}대)`
  );
}

/**
 * 버스 정보 팝업 표시
 */
function showBusPopup(
  map: mapboxgl.Map,
  busData: BusPositionData,
  coordinates: [number, number]
): void {
  // 기존 팝업 제거
  if (currentPopup) {
    currentPopup.remove();
    currentPopup = null;
    currentPopupVehId = null;
  }

  const busNumber = busData.bus_number;
  const plateNo = busData.plate_no;
  const busType = busData.bus_type;
  const stopFlag = busData.stop_flag;
  const isFull = busData.is_full;
  const congestion = busData.congestion;
  const nextStationName = busData.next_station?.name || "";
  const dataTime = busData.data_time;
  const color = busData.color;

  // 혼잡도 표시
  const congestionText = getCongestionText(congestion);
  const congestionColor = getCongestionColor(congestion);

  // 상태 표시
  const statusText = stopFlag ? "정차 중" : "운행 중";
  const statusColor = stopFlag ? "#FF9800" : "#4CAF50";

  const popupHTML = `
    <div class="bus-info-popup" style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-width: 240px;
      padding: 0;
      margin: 0;
    ">
      <!-- 헤더 -->
      <div style="
        background: ${color};
        color: white;
        padding: 12px 16px;
        border-radius: 12px 12px 0 0;
        display: flex;
        align-items: center;
        gap: 10px;
      ">
        <!-- 버스 번호 -->
        <div style="
          background: white;
          color: ${color};
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
        ">${busNumber}</div>
        <!-- 차량 타입 -->
        <div style="
          font-size: 13px;
          opacity: 0.9;
        ">${busType} 버스</div>
      </div>

      <!-- 정보 -->
      <div style="
        background: white;
        padding: 12px 16px;
        border-radius: 0 0 12px 12px;
        border: 2px solid ${color};
        border-top: none;
      ">
        <!-- 다음 정류장 -->
        ${nextStationName ? `
          <div style="
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          ">
            <span style="font-size: 16px;">🚏</span>
            <div>
              <div style="font-size: 11px; color: #888;">다음 정류장</div>
              <div style="font-size: 14px; font-weight: 600; color: #333;">${nextStationName}</div>
            </div>
          </div>
        ` : ""}

        <!-- 상태 정보 -->
        <div style="display: flex; gap: 12px; margin-bottom: 10px;">
          <!-- 운행 상태 -->
          <div style="
            flex: 1;
            text-align: center;
            padding: 8px;
            background: ${statusColor}15;
            border-radius: 8px;
          ">
            <div style="font-size: 11px; color: #888;">상태</div>
            <div style="font-size: 13px; font-weight: 600; color: ${statusColor};">${statusText}</div>
          </div>
          <!-- 혼잡도 -->
          <div style="
            flex: 1;
            text-align: center;
            padding: 8px;
            background: ${congestionColor}15;
            border-radius: 8px;
          ">
            <div style="font-size: 11px; color: #888;">혼잡도</div>
            <div style="font-size: 13px; font-weight: 600; color: ${congestionColor};">${congestionText}${isFull ? " (만차)" : ""}</div>
          </div>
        </div>

        <!-- 차량 정보 -->
        <div style="
          font-size: 12px;
          color: #666;
          display: flex;
          justify-content: space-between;
        ">
          <span>차량번호: ${plateNo || "알 수 없음"}</span>
          <span>${dataTime ? formatTime(dataTime) : ""}</span>
        </div>
      </div>
    </div>
  `;

  currentPopup = new mapboxgl.Popup({
    closeButton: true,
    closeOnClick: true,
    maxWidth: "300px",
    className: "bus-popup-container",
  })
    .setLngLat(coordinates)
    .setHTML(popupHTML)
    .addTo(map);

  // 팝업이 열린 버스 ID 저장 (팝업이 버스를 따라다니도록)
  currentPopupVehId = busData.veh_id;

  // 팝업이 닫힐 때 ID 초기화
  currentPopup.on("close", () => {
    currentPopupVehId = null;
  });
}

/**
 * 혼잡도 텍스트 반환
 */
function getCongestionText(congestion: number): string {
  switch (congestion) {
    case 0:
      return "정보없음";
    case 1:
      return "여유";
    case 2:
      return "보통";
    case 3:
      return "혼잡";
    case 4:
      return "매우혼잡";
    default:
      return "여유";
  }
}

/**
 * 혼잡도 색상 반환
 */
function getCongestionColor(congestion: number): string {
  switch (congestion) {
    case 1:
      return "#4CAF50"; // 여유 - 녹색
    case 2:
      return "#FFC107"; // 보통 - 노랑
    case 3:
      return "#FF9800"; // 혼잡 - 주황
    case 4:
      return "#F44336"; // 매우혼잡 - 빨강
    default:
      return "#9E9E9E"; // 정보없음 - 회색
  }
}

/**
 * 시간 포맷팅
 */
function formatTime(dateTimeStr: string): string {
  try {
    // "20240115123456" 형태 가정
    if (dateTimeStr.length >= 14) {
      const hour = dateTimeStr.substring(8, 10);
      const minute = dateTimeStr.substring(10, 12);
      const second = dateTimeStr.substring(12, 14);
      return `${hour}:${minute}:${second}`;
    }
    return dateTimeStr;
  } catch {
    return dateTimeStr;
  }
}

/**
 * 버스 레이어 데이터 초기화 (모두 제거)
 */
export function clearBusData(_map: mapboxgl.Map): void {
  // 애니메이션 중지
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  // 모든 마커 제거
  busMarkers.forEach((marker) => marker.remove());
  busMarkers.clear();
  currentDisplayPositions.clear();

  busPositionsData = [];
  activeRoutes.clear();

  console.log("[BusLayer] 데이터 초기화");
}

/**
 * 영역 기반 전체 버스 위치 업데이트
 */
export function updateAllBusPositions(
  map: mapboxgl.Map,
  positions: BusAreaPosition[]
): void {
  if (!layersAdded) {
    console.warn("[BusLayer] 레이어가 초기화되지 않음");
    return;
  }

  const now = Date.now();

  // 기존 버스 데이터를 Map으로 변환 (이전 좌표 참조용)
  const prevDataMap = new Map<string, BusPositionData>();
  busPositionsData.forEach((p) => prevDataMap.set(p.veh_id, p));

  // 새 데이터로 교체 (이전 좌표 저장 - 시간 기반 보간용)
  const newPositions: BusPositionData[] = positions.map((pos) => {
    const color = getBusColor(pos.bus_number);
    const prevData = prevDataMap.get(pos.veh_id);

    // 이전 좌표: 기존 버스면 현재 표시 위치 또는 이전 API 좌표 사용
    let prev_coordinates: [number, number] | undefined;
    if (prevData) {
      // 현재 화면에 표시 중인 위치를 이전 좌표로 사용 (더 부드러운 전환)
      const displayPos = currentDisplayPositions.get(pos.veh_id);
      prev_coordinates = displayPos || prevData.coordinates;
    }

    return {
      veh_id: pos.veh_id,
      plate_no: pos.plate_no,
      coordinates: pos.coordinates,
      sect_ord: pos.sect_ord,
      stop_flag: pos.stop_flag,
      bus_type: pos.bus_type,
      is_full: pos.is_full,
      congestion: pos.congestion,
      data_time: pos.data_time,
      next_station: null,
      route_id: pos.route_id,
      bus_number: pos.bus_number,
      color: color,
      prev_coordinates: prev_coordinates,
      last_update: now,
    };
  });

  busPositionsData = newPositions;

  // 마커 업데이트
  const currentVehIds = new Set(positions.map((p) => p.veh_id));

  // 새 버스 마커 추가 및 기존 마커 업데이트
  newPositions.forEach((pos) => {
    let marker = busMarkers.get(pos.veh_id);

    if (!marker) {
      // 새 마커 생성
      const el = createBusIconElement(pos.bus_number, pos.color);

      // 클릭 이벤트
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        showBusPopup(map, pos, pos.coordinates);
      });

      // 현재 표시 위치 초기화
      currentDisplayPositions.set(pos.veh_id, [...pos.coordinates] as [number, number]);

      marker = new mapboxgl.Marker({
        element: el,
        anchor: "center",
      })
        .setLngLat(pos.coordinates)
        .addTo(map);

      busMarkers.set(pos.veh_id, marker);
    }
    // 기존 마커는 애니메이션에서 위치 업데이트 (급발진 방지)
  });

  // 사라진 버스 마커 제거
  busMarkers.forEach((marker, vehId) => {
    if (!currentVehIds.has(vehId)) {
      marker.remove();
      busMarkers.delete(vehId);
      currentDisplayPositions.delete(vehId); // 표시 위치도 제거
    }
  });

  // 보간 애니메이션 시작 (아직 실행 중이 아니면)
  if (!animationFrameId && busPositionsData.length > 0) {
    animationFrameId = requestAnimationFrame(runInterpolationAnimation);
  }

  console.log(
    `[BusLayer] 전체 버스 위치 업데이트: ${positions.length}대 운행중`
  );
}

// ============================================
// 버스 노선 경로 표시 기능
// ============================================

// 현재 표시 중인 경로 레이어 ID들
const routeLayerIds = new Map<string, { lineId: string; outlineId: string }>();

/**
 * 버스 노선 경로를 지도에 추가
 * 왕복 노선(MultiLineString)은 상행/하행을 분리해서 offset 적용
 */
export function addBusRoutePath(
  map: mapboxgl.Map,
  routeId: string,
  busNumber: string,
  geojson: {
    type: "Feature";
    properties: { route_id: string; station_count: number; is_loop?: boolean };
    geometry: {
      type: "LineString" | "MultiLineString";
      coordinates: [number, number][] | [number, number][][];
    };
  }
): void {
  // 이미 추가된 경로면 무시
  if (routeLayerIds.has(routeId)) {
    console.log(`[BusLayer] 경로 이미 존재: ${busNumber}번 (${routeId})`);
    return;
  }

  const color = getBusColor(busNumber);
  const isLoop = geojson.properties.is_loop && geojson.geometry.type === "MultiLineString";

  try {
    if (isLoop) {
      // 왕복 노선: 상행/하행 분리해서 offset 적용
      const coords = geojson.geometry.coordinates as [number, number][][];
      const outboundCoords = coords[0] || [];
      const inboundCoords = coords[1] || [];

      // 상행 (outbound) 소스 & 레이어
      const outboundSourceId = `bus-route-source-${routeId}-outbound`;
      const outboundOutlineId = `bus-route-outline-${routeId}-outbound`;
      const outboundLineId = `bus-route-line-${routeId}-outbound`;

      // 하행 (inbound) 소스 & 레이어
      const inboundSourceId = `bus-route-source-${routeId}-inbound`;
      const inboundOutlineId = `bus-route-outline-${routeId}-inbound`;
      const inboundLineId = `bus-route-line-${routeId}-inbound`;

      // 상행 소스
      if (!map.getSource(outboundSourceId)) {
        map.addSource(outboundSourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: outboundCoords },
          },
        });
      }

      // 하행 소스
      if (!map.getSource(inboundSourceId)) {
        map.addSource(inboundSourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: inboundCoords },
          },
        });
      }

      // 상행 외곽선
      if (!map.getLayer(outboundOutlineId)) {
        map.addLayer({
          id: outboundOutlineId,
          type: "line",
          source: outboundSourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#ffffff",
            "line-width": ["interpolate", ["linear"], ["zoom"], 10, 4, 14, 8, 18, 12],
            "line-opacity": 0.8,
            "line-offset": ["interpolate", ["linear"], ["zoom"], 10, 3, 14, 5, 18, 8],
          },
        });
      }

      // 상행 라인 (대시 패턴으로 방향 표시)
      if (!map.getLayer(outboundLineId)) {
        map.addLayer({
          id: outboundLineId,
          type: "line",
          source: outboundSourceId,
          layout: { "line-join": "round", "line-cap": "butt" },
          paint: {
            "line-color": color,
            "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 14, 5, 18, 8],
            "line-opacity": 0.9,
            "line-offset": ["interpolate", ["linear"], ["zoom"], 10, 3, 14, 5, 18, 8],
            "line-dasharray": [2, 1], // 긴 대시 + 짧은 간격 (방향감 표시)
          },
        });
      }

      // 하행 외곽선
      if (!map.getLayer(inboundOutlineId)) {
        map.addLayer({
          id: inboundOutlineId,
          type: "line",
          source: inboundSourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#ffffff",
            "line-width": ["interpolate", ["linear"], ["zoom"], 10, 4, 14, 8, 18, 12],
            "line-opacity": 0.8,
            "line-offset": ["interpolate", ["linear"], ["zoom"], 10, -3, 14, -5, 18, -8],
          },
        });
      }

      // 하행 라인 (대시 패턴 + 색상 살짝 다르게)
      if (!map.getLayer(inboundLineId)) {
        map.addLayer({
          id: inboundLineId,
          type: "line",
          source: inboundSourceId,
          layout: { "line-join": "round", "line-cap": "butt" },
          paint: {
            "line-color": adjustColor(color, -30), // 살짝 어두운 색
            "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 14, 5, 18, 8],
            "line-opacity": 0.9,
            "line-offset": ["interpolate", ["linear"], ["zoom"], 10, -3, 14, -5, 18, -8],
            "line-dasharray": [2, 1], // 동일한 대시 패턴
          },
        });
      }

      // 레이어 ID 저장 (제거할 때 사용)
      routeLayerIds.set(routeId, {
        lineId: `${outboundLineId},${inboundLineId}`,
        outlineId: `${outboundOutlineId},${inboundOutlineId}`,
      });

      console.log(`[BusLayer] 왕복 경로 추가: ${busNumber}번 (상행/하행 분리), 색상: ${color}`);
    } else {
      // 단방향 노선: 기존 방식
      const sourceId = `bus-route-source-${routeId}`;
      const outlineLayerId = `bus-route-outline-${routeId}`;
      const lineLayerId = `bus-route-line-${routeId}`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "geojson",
          data: geojson as any,
        });
      }

      // 외곽선
      if (!map.getLayer(outlineLayerId)) {
        map.addLayer({
          id: outlineLayerId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": "#ffffff",
            "line-width": ["interpolate", ["linear"], ["zoom"], 10, 4, 14, 8, 18, 12],
            "line-opacity": 0.8,
          },
        });
      }

      // 메인 라인 (대시 패턴으로 방향 표시)
      if (!map.getLayer(lineLayerId)) {
        map.addLayer({
          id: lineLayerId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "butt" },
          paint: {
            "line-color": color,
            "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2, 14, 5, 18, 8],
            "line-opacity": 0.9,
            "line-dasharray": [2, 1], // 방향 표시용 대시 패턴
          },
        });
      }

      routeLayerIds.set(routeId, {
        lineId: lineLayerId,
        outlineId: outlineLayerId,
      });

      console.log(`[BusLayer] 경로 추가: ${busNumber}번 (${routeId}), 색상: ${color}`);
    }
  } catch (error) {
    console.error(`[BusLayer] 경로 추가 실패: ${busNumber}번 (${routeId})`, error);
  }
}

/**
 * 특정 버스 노선 경로 제거
 */
export function removeBusRoutePath(map: mapboxgl.Map, routeId: string): void {
  const layers = routeLayerIds.get(routeId);
  if (!layers) return;

  try {
    // 레이어 ID가 콤마로 구분되어 있으면 (왕복 노선) 각각 제거
    const lineIds = layers.lineId.split(",");
    const outlineIds = layers.outlineId.split(",");

    // 레이어 제거 (라인 -> 외곽선 순서)
    lineIds.forEach((id: string) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    outlineIds.forEach((id: string) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });

    // 소스 제거 (단방향 또는 왕복 노선)
    const sourceId = `bus-route-source-${routeId}`;
    const outboundSourceId = `bus-route-source-${routeId}-outbound`;
    const inboundSourceId = `bus-route-source-${routeId}-inbound`;

    if (map.getSource(sourceId)) map.removeSource(sourceId);
    if (map.getSource(outboundSourceId)) map.removeSource(outboundSourceId);
    if (map.getSource(inboundSourceId)) map.removeSource(inboundSourceId);

    routeLayerIds.delete(routeId);
    console.log(`[BusLayer] 경로 제거: ${routeId}`);
  } catch (error) {
    console.error(`[BusLayer] 경로 제거 실패: ${routeId}`, error);
  }
}

/**
 * 모든 버스 노선 경로 제거
 */
export function clearAllBusRoutePaths(map: mapboxgl.Map): void {
  console.log(`[BusLayer] 경로 제거 시작, 등록된 경로 수: ${routeLayerIds.size}`, Array.from(routeLayerIds.keys()));
  routeLayerIds.forEach((layers, routeId) => {
    console.log(`[BusLayer] 경로 제거 중: ${routeId}`, layers);
    removeBusRoutePath(map, routeId);
  });
  console.log("[BusLayer] 모든 경로 제거 완료");
}

/**
 * 버스 노선 경로 표시 여부 토글
 */
export function toggleBusRoutePathVisibility(
  map: mapboxgl.Map,
  routeId: string,
  visible: boolean
): void {
  const layers = routeLayerIds.get(routeId);
  if (!layers) return;

  const visibility = visible ? "visible" : "none";

  // 콤마로 구분된 경우 (왕복 노선) 각각 처리
  layers.lineId.split(",").forEach((id: string) => {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, "visibility", visibility);
    }
  });
  layers.outlineId.split(",").forEach((id: string) => {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, "visibility", visibility);
    }
  });
}
