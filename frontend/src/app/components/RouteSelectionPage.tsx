import imgGemGreen1 from "@/assets/gem-green.png";
import imgGemRed1 from "@/assets/gem-red.png";
import { MovingCharacter, type CharacterColor } from "@/components/MovingCharacter";
import { addBusLayers, addBusRoutePath, clearAllBusRoutePaths, clearBusData, removeBusLayers, toggleBusLayers, updateAllBusPositions } from "@/components/map/busLayer";
import { addSubwayLayers, removeSubwayLayers, toggleSubwayLayers } from "@/components/map/subwayLayer";
import { useRouteSSE } from "@/hooks/useRouteSSE";
import { getBusRoutePath, trackBusPositions } from "@/lib/api";
import { ROUTE_COLORS } from "@/mocks/routeData";
import { createRoute, getRouteLegDetail, searchRoutes } from "@/services/routeService";
import { PLAYER_LABELS, useRouteStore, type Player } from "@/stores/routeStore";
import { metersToKilometers, PATH_TYPE_NAMES, secondsToMinutes, type BotStatusUpdateEvent } from "@/types/route";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapView, type EndpointMarker, type MapViewRef, type RouteLineInfo } from "./MapView";
import imgBot1Character from "/assets/Double/hud_player_purple.png"; // 보라색 (봇1)
import imgUserCharacter from "/assets/playerB/hud_player_green.png"; // 초록색 (유저)
import imgBot2Character from "/assets/playerB/hud_player_yellow.png"; // 노란색 (봇2)

// 지도 스타일 타입
type MapStyleType = "default" | "dark" | "satellite-streets";

// 지도 스타일 정보
const MAP_STYLES: Record<MapStyleType, { url: string; name: string; icon: string }> = {
  default: {
    url: "mapbox://styles/mapbox/outdoors-v12",
    name: "기본 지도",
    icon: "🗺️",
  },
  dark: {
    url: "mapbox://styles/mapbox/navigation-night-v1",
    name: "야간 모드",
    icon: "🌙",
  },
  "satellite-streets": {
    url: "mapbox://styles/mapbox/satellite-streets-v12",
    name: "위성 지도",
    icon: "🛰️",
  },
};

// 숫자 이모지 배열 (1~10)
const NUMBER_EMOJIS = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

type PageType = "map" | "search" | "favorites" | "subway" | "route" | "routeDetail";

interface RouteSelectionPageProps {
  onBack?: () => void;
  onNavigate?: (page: PageType) => void;
  isSubwayMode?: boolean;
}

export function RouteSelectionPage({ onBack, onNavigate }: RouteSelectionPageProps) {
  // 경로 상태 스토어
  const {
    searchResponse,
    departure,
    arrival,
    assignments,
    legDetails,
    isLoading,
    error,
    setSearchResponse,
    setLegDetail,
    setCreateRouteResponse,
    assignRoute,
    unassignRoute,
    getAssignedRouteId,
    isRouteAssigned,
    getPlayerForRoute,
    areAllAssigned,
    setLoading,
    setError,
  } = useRouteStore();

  // 바텀시트 드래그 상태
  const [sheetHeight, setSheetHeight] = useState(40);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(40);
  const [isWebView, setIsWebView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapViewRef = useRef<MapViewRef>(null);
  const [mapStyle, setMapStyle] = useState<MapStyleType>("default"); // 지도 스타일
  const [isLayerPopoverOpen, setIsLayerPopoverOpen] = useState(false); // 레이어 팝오버 상태
  const [is3DBuildingsEnabled, setIs3DBuildingsEnabled] = useState(false); // 3D 건물 레이어 상태
  const [isSubwayLinesEnabled, setIsSubwayLinesEnabled] = useState(false); // 지하철 노선 레이어 상태
  const [isBusLinesEnabled, setIsBusLinesEnabled] = useState(false); // 버스 노선 레이어 상태
  const [showBusInputModal, setShowBusInputModal] = useState(false); // 버스 번호 입력 모달
  const [busNumberInput, setBusNumberInput] = useState(""); // 버스 번호 입력값
  const [trackedBusNumbers, setTrackedBusNumbers] = useState<string[]>([]); // 추적 중인 버스 번호
  const layerButtonRef = useRef<HTMLButtonElement>(null); // 레이어 버튼 ref
  const popoverRef = useRef<HTMLDivElement>(null); // 팝오버 ref

  // SSE 관련 상태
  const activeRouteId = null; // RouteSelectionPage에서는 아직 활성 경로 ID가 없으므로 null 유지
  const [botPositions, setBotPositions] = useState<Map<number, BotStatusUpdateEvent>>(new Map());

  // SSE 연결
  const { botStates } = useRouteSSE(
    activeRouteId,
    {
      onConnected: (data) => {
        console.log('✅ SSE 연결됨:', data.message);
      },
      onBotStatusUpdate: (data) => {
        console.log(`🤖 봇 ${data.bot_id} 위치 업데이트:`, data.position);
        setBotPositions((prev) => {
          const next = new Map(prev);
          next.set(data.bot_id, data);
          return next;
        });
      },
      onBotBoarding: (data) => {
        console.log(`🚌 봇 ${data.bot_id} 탑승:`, data.station_name);
      },
      onBotAlighting: (data) => {
        console.log(`🚶 봇 ${data.bot_id} 하차:`, data.station_name);
      },
      onParticipantFinished: (data) => {
        console.log(`🏁 참가자 도착! 순위: ${data.rank}위`);
      },
      onRouteEnded: (data) => {
        console.log(`🎉 경주 종료: ${data.reason}`);
      },
      onError: (error) => {
        console.error('❌ SSE 에러:', error.message);
      },
    }
  );

  // SSE botStates 동기화
  useEffect(() => {
    if (botStates.size > 0) {
      setBotPositions(new Map(botStates));
    }
  }, [botStates]);

  // 웹/앱 화면 감지
  useEffect(() => {
    const checkViewport = () => {
      setIsWebView(window.innerWidth > 768);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // 경로 검색 (컴포넌트 마운트 시 또는 출발지/도착지 변경 시)
  useEffect(() => {
    const loadRoutes = async () => {
      // store에 출발지/도착지가 없으면 에러 표시하고 검색하지 않음
      if (!departure || !arrival) {
        setError("출발지와 도착지를 설정해주세요.");
        setLoading(false);
        return;
      }

      // 좌표 유효성 검증
      if (
        isNaN(departure.lat) || isNaN(departure.lon) ||
        isNaN(arrival.lat) || isNaN(arrival.lon) ||
        departure.lat === 0 || departure.lon === 0 ||
        arrival.lat === 0 || arrival.lon === 0
      ) {
        setError("출발지 또는 도착지 좌표가 유효하지 않습니다.");
        setLoading(false);
        return;
      }

      // 이미 검색 결과가 있고, 출발지/도착지가 같으면 스킵
      if (searchResponse) {
        const isSameDeparture =
          searchResponse.requestParameters.startX === departure.lon.toString() &&
          searchResponse.requestParameters.startY === departure.lat.toString();
        const isSameArrival =
          searchResponse.requestParameters.endX === arrival.lon.toString() &&
          searchResponse.requestParameters.endY === arrival.lat.toString();

        if (isSameDeparture && isSameArrival) {
          console.log('[Route] 동일 경로 - 기존 검색 결과 사용');
          return;
        }
        console.log('[Route] 다른 경로 - 새로 검색');
      }

      setLoading(true);
      setError(null);

      try {
        const response = await searchRoutes({
          startX: departure.lon.toString(),
          startY: departure.lat.toString(),
          endX: arrival.lon.toString(),
          endY: arrival.lat.toString(),
          departure_name: departure.name,
          arrival_name: arrival.name,
          count: 10, // 10개 경로 요청
        });

        setSearchResponse(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "경로 검색에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadRoutes();
  }, [departure, arrival]);

  // 경로 상세 정보 로드 (지도에 표시하기 위해)
  useEffect(() => {
    const loadLegDetails = async () => {
      if (!searchResponse) return;

      // 모든 경로의 상세 정보를 로드
      for (const leg of searchResponse.legs) {
        // 이미 캐시에 있으면 스킵
        if (legDetails.has(leg.route_leg_id)) continue;

        try {
          const detail = await getRouteLegDetail(leg.route_leg_id);
          setLegDetail(leg.route_leg_id, detail);
        } catch (error) {
          console.error(`경로 ${leg.route_leg_id} 상세 로드 실패:`, error);
        }
      }
    };

    loadLegDetails();
  }, [searchResponse]);

  // 지하철 노선도 레이어 표시/숨김
  useEffect(() => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance) return;

    if (isSubwayLinesEnabled) {
      // 레이어 추가 (이미 있으면 내부에서 스킵)
      addSubwayLayers(mapInstance);
      toggleSubwayLayers(mapInstance, true);
    } else {
      // 레이어 숨김
      toggleSubwayLayers(mapInstance, false);
    }

    return () => {
      // 컴포넌트 언마운트 시 레이어 제거
      if (mapInstance && mapInstance.getStyle()) {
        try {
          removeSubwayLayers(mapInstance);
        } catch {
          // 지도가 이미 제거된 경우 무시
        }
      }
    };
  }, [isSubwayLinesEnabled]);

  // 버스 실시간 위치 레이어 표시/숨김
  useEffect(() => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance) return;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    if (isBusLinesEnabled && trackedBusNumbers.length > 0) {
      // 사용자가 입력한 버스 번호로 실시간 위치 조회
      const loadBusPositions = async () => {
        try {
          console.log("[BusLayer] 추적 버스 API 호출:", trackedBusNumbers);

          const response = await trackBusPositions(trackedBusNumbers);

          console.log(`[BusLayer] API 응답: ${response.buses.length}대 버스`);

          if (response.buses.length > 0) {
            updateAllBusPositions(mapInstance, response.buses);
          }

          // 경로 데이터 로드 (최초 1회만 - 경로는 변하지 않음)
          if (response.meta.routes.length > 0) {
            for (const route of response.meta.routes) {
              const pathData = await getBusRoutePath(route.route_id);
              if (pathData?.geojson) {
                addBusRoutePath(mapInstance, route.route_id, route.bus_number, pathData.geojson);
              }
            }
          }
        } catch (error) {
          console.error("[BusLayer] 버스 실시간 위치 로드 실패:", error);
        }
      };

      // 레이어 추가 후 데이터 로드
      addBusLayers(mapInstance).then(() => {
        toggleBusLayers(mapInstance, true);
        loadBusPositions();
      });

      // 15초마다 위치 업데이트
      intervalId = setInterval(loadBusPositions, 15000);
    } else if (isBusLinesEnabled && trackedBusNumbers.length === 0) {
      // 버스 레이어 활성화했지만 추적할 버스가 없으면 입력 모달 표시
      setShowBusInputModal(true);
    } else {
      // 레이어 숨김
      toggleBusLayers(mapInstance, false);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (mapInstance && mapInstance.getStyle()) {
        try {
          clearBusData(mapInstance);
          clearAllBusRoutePaths(mapInstance);
          removeBusLayers(mapInstance);
        } catch {
          // 지도가 이미 제거된 경우 무시
        }
      }
    };
  }, [isBusLinesEnabled, trackedBusNumbers]);

  // 팝오버 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isLayerPopoverOpen &&
        popoverRef.current &&
        layerButtonRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        !layerButtonRef.current.contains(event.target as Node)
      ) {
        setIsLayerPopoverOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isLayerPopoverOpen]);

  // 지도에 표시할 경로 라인 생성
  const routeLines = useMemo((): RouteLineInfo[] => {
    if (!searchResponse) return [];

    // 가장 빠른 시간 찾기
    const minTime = Math.min(...searchResponse.legs.map(l => l.totalTime));

    return searchResponse.legs.map((leg, index) => {
      const colorScheme = ROUTE_COLORS[index % ROUTE_COLORS.length];
      const detail = legDetails.get(leg.route_leg_id);

      // 누군가에게 할당되었거나, 가장 빠른 경로인 경우만 정보 표시
      const isAssignedToAnyone = isRouteAssigned(leg.route_leg_id);
      const isFastest = leg.totalTime === minTime;
      const shouldShowInfo = isAssignedToAnyone || isFastest;

      const summary = shouldShowInfo ? {
        time: secondsToMinutes(leg.totalTime),
        distance: metersToKilometers(leg.totalDistance),
      } : undefined;

      // 경로 상세가 있으면 실제 경로 좌표 추출 (선택 페이지에서는 환승 지점 수집 제외)
      if (detail?.legs) {
        const coordinates: [number, number][] = [];

        detail.legs.forEach((legStep, legIndex) => {
          // 이전 legStep과의 연결을 보장하기 위해 시작 좌표를 먼저 추가
          // 첫 번째 legStep이 아니고, 이전 좌표와 다르면 시작 좌표 추가
          if (legIndex > 0 && coordinates.length > 0) {
            const lastCoord = coordinates[coordinates.length - 1];
            const startCoord: [number, number] = [legStep.start.lon, legStep.start.lat];

            // 이전 좌표와 시작 좌표가 다르면 연결 좌표 추가
            if (Math.abs(lastCoord[0] - startCoord[0]) > 0.0001 ||
                Math.abs(lastCoord[1] - startCoord[1]) > 0.0001) {
              coordinates.push(startCoord);
            }
          } else if (legIndex === 0) {
            // 첫 번째 legStep의 시작 좌표 추가
            coordinates.push([legStep.start.lon, legStep.start.lat]);
          }

          // passShape가 있으면 파싱 (BUS/SUBWAY 구간)
          if (legStep.passShape?.linestring) {
            const points = legStep.passShape.linestring.split(' ');
            let isFirstPoint = true;
            points.forEach((point) => {
              const [lon, lat] = point.split(',').map(Number);
              if (!isNaN(lon) && !isNaN(lat)) {
                // 첫 번째 점은 이미 start 좌표로 추가했으므로 스킵 (중복 방지)
                if (isFirstPoint && coordinates.length > 0) {
                  const lastCoord = coordinates[coordinates.length - 1];
                  const dist = Math.sqrt(
                    Math.pow(lastCoord[0] - lon, 2) + Math.pow(lastCoord[1] - lat, 2)
                  );
                  // 거리가 매우 가까우면(0.0001도 이내) 스킵
                  if (dist < 0.0001) {
                    isFirstPoint = false;
                    return;
                  }
                }
                coordinates.push([lon, lat]);
                isFirstPoint = false;
              }
            });
          } else if (legStep.steps && legStep.steps.length > 0) {
            // WALK 구간: steps[].linestring 사용 (실제 도보 경로)
            legStep.steps.forEach((step, stepIndex) => {
              if (step.linestring) {
                const points = step.linestring.split(' ');
                let isFirstPointInStep = stepIndex === 0;
                points.forEach((point) => {
                  const [lon, lat] = point.split(',').map(Number);
                  if (!isNaN(lon) && !isNaN(lat)) {
                    // 첫 번째 step의 첫 번째 점은 이미 start 좌표로 추가했으므로 스킵
                    if (isFirstPointInStep && coordinates.length > 0) {
                      const lastCoord = coordinates[coordinates.length - 1];
                      const dist = Math.sqrt(
                        Math.pow(lastCoord[0] - lon, 2) + Math.pow(lastCoord[1] - lat, 2)
                      );
                      // 거리가 매우 가까우면(0.0001도 이내) 스킵
                      if (dist < 0.0001) {
                        isFirstPointInStep = false;
                        return;
                      }
                    }
                    coordinates.push([lon, lat]);
                    isFirstPointInStep = false;
                  }
                });
              }
            });
          } else {
            // passShape도 steps도 없으면 start/end 좌표 사용 (fallback)
            // start는 이미 추가했으므로 end만 추가
            coordinates.push([legStep.end.lon, legStep.end.lat]);
          }

          // 마지막 legStep의 경우 end 좌표도 명시적으로 추가 (연결 보장)
          if (legIndex === detail.legs.length - 1) {
            const lastCoord = coordinates[coordinates.length - 1];
            const endCoord: [number, number] = [legStep.end.lon, legStep.end.lat];

            // 마지막 좌표와 end 좌표가 다르면 추가
            if (Math.abs(lastCoord[0] - endCoord[0]) > 0.0001 ||
                Math.abs(lastCoord[1] - endCoord[1]) > 0.0001) {
              coordinates.push(endCoord);
            }
          }
        });

        return {
          id: `route-${leg.route_leg_id}`,
          coordinates,
          color: colorScheme.line,
          width: 8,
          opacity: 0.7,
          summary,
        };
      }

      // 경로 상세가 없으면 그리지 않음 (로딩 중)
      return {
        id: `route-${leg.route_leg_id}`,
        coordinates: [],
        color: colorScheme.line,
        summary,
      };
    }).filter((route) => route.coordinates.length > 0);
  }, [searchResponse, legDetails, departure, arrival]);

  // 출발지/도착지 마커
  const endpoints = useMemo((): EndpointMarker[] => {
    const markers: EndpointMarker[] = [];

    if (departure) {
      markers.push({
        type: 'departure',
        coordinates: [departure.lon, departure.lat],
        name: departure.name,
      });
    }

    if (arrival) {
      markers.push({
        type: 'arrival',
        coordinates: [arrival.lon, arrival.lat],
        name: arrival.name,
      });
    }

    return markers;
  }, [departure, arrival]);

  // 체크박스 토글
  const toggleAssignment = (player: Player, routeLegId: number) => {
    const currentRouteId = getAssignedRouteId(player);

    // 이미 이 경로에 할당되어 있다면 해제
    if (currentRouteId === routeLegId) {
      unassignRoute(player);
      return;
    }

    // 이미 다른 플레이어가 이 경로를 사용 중인지 확인
    if (isRouteAssigned(routeLegId)) {
      const existingPlayer = getPlayerForRoute(routeLegId);
      if (existingPlayer !== player) {
        // 경로가 이미 다른 플레이어에게 할당되어 있으면 선택 불가
        return;
      }
    }

    // 새 경로에 할당
    assignRoute(player, routeLegId);
  };

  // 특정 경로에 특정 플레이어가 할당되어 있는지 확인
  const isAssigned = (player: Player, routeLegId: number) => {
    return getAssignedRouteId(player) === routeLegId;
  };

  // 드래그 시작
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setStartHeight(sheetHeight);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  // 드래그 중
  const handleDragMove = (clientY: number) => {
    if (!isDragging || !containerRef.current) return;

    const containerHeight = containerRef.current.clientHeight;
    const deltaY = startY - clientY;
    const deltaPercent = (deltaY / containerHeight) * 100;
    const newHeight = Math.max(30, Math.min(90, startHeight + deltaPercent));

    setSheetHeight(newHeight);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientY);
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // 전역 이벤트 리스너
  useEffect(() => {
    if (!isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleDragMove(e.clientY);
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      handleDragMove(e.touches[0].clientY);
    };

    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("touchmove", handleGlobalTouchMove);
    window.addEventListener("touchend", handleGlobalTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("touchend", handleGlobalTouchEnd);
    };
  }, [isDragging, startY, startHeight]);

  // 경주 생성 중 상태
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);

  const handleStartNavigation = async () => {
    if (!areAllAssigned() || !onNavigate || !searchResponse) {
      setError("모든 플레이어에게 경로를 할당해주세요.");
      return;
    }

    // 출발지/도착지 검증
    if (!departure || !arrival) {
      setError("출발지와 도착지가 설정되지 않았습니다.");
      return;
    }

    // 좌표 유효성 검증
    if (
      isNaN(departure.lat) || isNaN(departure.lon) ||
      isNaN(arrival.lat) || isNaN(arrival.lon) ||
      departure.lat === 0 || departure.lon === 0 ||
      arrival.lat === 0 || arrival.lon === 0
    ) {
      setError("출발지 또는 도착지 좌표가 유효하지 않습니다.");
      return;
    }

    const userLegId = assignments.get('user');
    const bot1LegId = assignments.get('bot1');
    const bot2LegId = assignments.get('bot2');

    if (!userLegId || !bot1LegId || !bot2LegId) {
      setError("모든 플레이어에게 경로가 할당되어야 합니다.");
      return;
    }

    // route_itinerary_id 검증
    if (!searchResponse.route_itinerary_id || searchResponse.route_itinerary_id <= 0) {
      setError("경로 검색 결과가 유효하지 않습니다. 다시 검색해주세요.");
      return;
    }

    setIsCreatingRoute(true);
    setError(null);

    try {
      console.log("경주 생성 요청:", {
        route_itinerary_id: searchResponse.route_itinerary_id,
        user_leg_id: userLegId,
        bot_leg_ids: [bot1LegId, bot2LegId],
        departure,
        arrival,
      });

      const response = await createRoute({
        route_itinerary_id: searchResponse.route_itinerary_id,
        user_leg_id: userLegId,
        bot_leg_ids: [bot1LegId, bot2LegId],
      });

      console.log("경주 생성 응답:", response);

      // 유저의 route_id 찾기
      const userParticipant = response.participants.find(p => p.type === 'USER');
      if (!userParticipant) {
        throw new Error("유저 참가자 정보를 찾을 수 없습니다.");
      }

      // 스토어에 저장
      setCreateRouteResponse(response, userParticipant.route_id);

      // 경로 상세 페이지로 이동 (RouteDetailPage에서 SSE가 자동으로 연결됨)
      onNavigate("routeDetail");
    } catch (err: any) {
      console.error("경주 생성 실패:", err);

      // Axios 에러인 경우 상세 메시지 추출
      let errorMessage = "경주 생성에 실패했습니다.";
      if (err?.response?.data?.error) {
        const backendError = err.response.data.error;
        errorMessage = backendError.message || errorMessage;
        if (backendError.details) {
          console.error("백엔드 에러 상세:", backendError.details);
          // details가 객체인 경우 문자열로 변환
          if (typeof backendError.details === 'object') {
            const detailsStr = Object.entries(backendError.details)
              .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
              .join(', ');
            errorMessage += ` (${detailsStr})`;
          } else {
            errorMessage += ` (${backendError.details})`;
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      alert(`경주 생성 실패: ${errorMessage}\n\n출발지와 도착지를 확인하고 다시 시도해주세요.`);
    } finally {
      setIsCreatingRoute(false);
    }
  };

  // 플레이어 목록
  const players: Player[] = ["user", "bot1", "bot2"];

  // 경로 선택 컨텐츠
  const routeContent = (
    <div className="flex flex-col h-full">
      {/* 타이틀 카드 */}
      <div className="bg-white/90 backdrop-blur-lg min-h-[64px] md:h-[54px] rounded-[10px] border border-white/50 shadow-lg flex items-center justify-center mb-4 px-4 md:px-0">
        {departure?.name && arrival?.name ? (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              <img alt="출발지" className="size-[24px] md:size-[20px] object-contain" src={imgGemGreen1} />
              <p className="font-['Wittgenstein',sans-serif] text-[14px] md:text-[12px] text-black font-semibold leading-tight">
                {departure.name}
              </p>
            </div>
            <p className="text-[16px] md:text-[14px]">→</p>
            <div className="flex items-center gap-2">
              <img alt="도착지" className="size-[24px] md:size-[20px] object-contain" src={imgGemRed1} />
              <p className="font-['Wittgenstein',sans-serif] text-[14px] md:text-[12px] text-black font-semibold leading-tight">
                {arrival.name}
              </p>
            </div>
          </div>
        ) : (
          <p className="font-['Wittgenstein',sans-serif] text-[14px] md:text-[12px] text-black text-center font-semibold leading-tight">
            각 플레이어의 경로를 선택하세요
          </p>
        )}
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3 font-['Wittgenstein',sans-serif] text-[12px] text-black">경로 검색 중...</span>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="bg-red-100/90 backdrop-blur-lg border border-red-300 rounded-[10px] p-4 mb-4 shadow-lg">
          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-red-700">{error}</p>
        </div>
      )}

      {/* 경로 카드들 */}
      {searchResponse && (
        <div className="flex flex-col gap-4">
          {(() => {
            // 가장 빠른 경로 찾기 (최단 시간)
            const minTime = Math.min(...searchResponse.legs.map(l => l.totalTime));

            return searchResponse.legs.map((leg, index) => {
              const colorScheme = ROUTE_COLORS[index % ROUTE_COLORS.length];
              const routeNumber = index + 1;
              const timeMinutes = secondsToMinutes(leg.totalTime);
              const distanceStr = metersToKilometers(leg.totalDistance);
              const pathTypeName = PATH_TYPE_NAMES[leg.pathType] || "대중교통";

              // 태그 조건들
              const isFastest = leg.totalTime === minTime;
              const isTransferHell = leg.transferCount >= 2;
              const isBusPath = leg.pathType === 2 || leg.pathType === 3; // 버스 포함
              const isWalkingHeavy = leg.totalWalkDistance > 1000;

              // 이 경로에 할당된 플레이어 찾기
              const assignedPlayer = getPlayerForRoute(leg.route_leg_id);
              const assignedPlayerImage = assignedPlayer
                ? assignedPlayer === 'user' ? imgUserCharacter :
                  assignedPlayer === 'bot1' ? imgBot1Character :
                  imgBot2Character
                : null;

              return (
                <div
                  key={leg.route_leg_id}
                  className="rounded-[10px] border border-black/20 backdrop-blur-lg shadow-lg p-4 md:p-5"
                  style={{
                    backgroundColor: colorScheme.bg,
                  }}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                    {/* 경로 번호 아이콘 */}
                    <div className="flex items-center gap-3 md:flex-col md:items-start">
                      <div className="bg-white size-[56px] md:size-[48px] border-[3px] border-black flex items-center justify-center shrink-0 rounded-lg shadow-md">
                        <p className="text-[28px] md:text-[24px]">
                          {NUMBER_EMOJIS[routeNumber - 1] || `${routeNumber}`}
                        </p>
                      </div>

                      {/* 경로 이름 - 모바일에서 아이콘 옆에 표시 */}
                      <div className="flex flex-col md:hidden">
                        <div className="flex gap-2 items-center">
                          <div
                            className="h-[3px] w-[16px] border-[0.673px] border-black rounded-full"
                            style={{ backgroundColor: colorScheme.line }}
                          />
                          <p className="font-['Wittgenstein',sans-serif] text-[14px] md:text-[12px] text-black font-semibold">
                            경로 {routeNumber} ({pathTypeName})
                          </p>
                        </div>

                        {/* 모바일 태그 영역 */}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {isFastest && (
                            <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">⚡ 최단시간</span>
                          )}
                          {isTransferHell && (
                            <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">👣 환승지옥</span>
                          )}
                          {isBusPath && (
                            <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">🚌 도로정체주의</span>
                          )}
                          {isWalkingHeavy && (
                            <span className="bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">👟 유산소코스</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 경로 정보 */}
                    <div className="flex-1 flex flex-col gap-3 md:gap-2">
                      <div className="flex items-start gap-3 md:gap-4">
                        {/* 왼쪽: 경로 정보 */}
                        <div className="flex-1 flex flex-col gap-3 md:gap-2">
                          {/* 경로 이름 - 데스크톱에서만 표시 */}
                          <div className="hidden md:flex flex-col gap-1">
                            <div className="flex gap-2 items-center">
                              <div
                                className="h-[2px] w-[12px] border-[0.673px] border-black"
                                style={{ backgroundColor: colorScheme.line }}
                              />
                              <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black">
                                경로 {routeNumber} ({pathTypeName})
                              </p>
                            </div>
                            {/* 데스크탑 태그 영역 */}
                            <div className="flex flex-wrap gap-1">
                              {isFastest && (
                                <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">⚡ 최단시간</span>
                              )}
                              {isTransferHell && (
                                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">👣 환승지옥</span>
                              )}
                              {isBusPath && (
                                <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">🚌 도로정체주의</span>
                              )}
                              {isWalkingHeavy && (
                                <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">👟 유산소코스</span>
                              )}
                            </div>
                          </div>

                          {/* 시간/거리/환승 */}
                        <div className="flex gap-2 flex-wrap">
                          <div
                            className="bg-[#ffd93d] h-[28px] md:h-[20px] px-[12px] md:px-[9px] py-[6px] md:py-[5px] border-[3px] border-black flex items-center justify-center rounded-md"
                          >
                            <p className="font-['Wittgenstein',sans-serif] text-[14px] md:text-[12px] text-black leading-tight font-semibold">
                              {timeMinutes}분
                            </p>
                          </div>
                          <div className="bg-white h-[28px] md:h-[20px] px-[12px] md:px-[9px] py-[6px] md:py-[5px] border-[3px] border-black flex items-center justify-center rounded-md">
                            <p className="font-['Wittgenstein',sans-serif] text-[14px] md:text-[12px] text-black leading-tight font-semibold">
                              {distanceStr}
                            </p>
                          </div>
                          {leg.transferCount > 0 && (
                            <div className="bg-white h-[28px] md:h-[20px] px-[12px] md:px-[9px] py-[6px] md:py-[5px] border-[3px] border-black flex items-center justify-center rounded-md">
                              <p className="font-['Wittgenstein',sans-serif] text-[14px] md:text-[12px] text-black leading-tight font-semibold">
                                환승 {leg.transferCount}회
                              </p>
                            </div>
                          )}
                        </div>

                        {/* 체크박스들 */}
                        <div className="flex gap-3 md:gap-[8px] items-center flex-wrap">
                          {players.map((player) => (
                            <label
                              key={player}
                              className="flex gap-2 md:gap-1 items-center cursor-pointer py-1 md:py-0"
                              onClick={() => toggleAssignment(player, leg.route_leg_id)}
                            >
                              <div className="size-[18px] md:size-[12px] border-[2px] md:border-[1.5px] border-black bg-white flex items-center justify-center rounded-sm">
                                {isAssigned(player, leg.route_leg_id) && (
                                  <div className="size-[10px] md:size-[6px] bg-black rounded-sm" />
                                )}
                              </div>
                              <p className="font-['Wittgenstein',sans-serif] text-[14px] md:text-[12px] text-black font-medium">
                                {PLAYER_LABELS[player]}
                              </p>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* 오른쪽: 선택된 플레이어 이미지 */}
                      <div className="flex items-center justify-center shrink-0">
                        {assignedPlayerImage ? (
                          <div className="bg-white/80 backdrop-blur-sm rounded-[12px] p-2 md:p-2.5 border-2 border-black/30 shadow-md">
                            <img
                              src={assignedPlayerImage}
                              alt={assignedPlayer ? PLAYER_LABELS[assignedPlayer] : ''}
                              className="size-[48px] md:size-[40px] object-contain drop-shadow-sm"
                            />
                          </div>
                        ) : (
                          <div className="bg-gray-100/50 rounded-[12px] p-2 md:p-2.5 border-2 border-dashed border-gray-300">
                            <p className="font-['Wittgenstein',sans-serif] text-[10px] md:text-[8px] text-gray-400 text-center">
                              선택<br />대기
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          });
        })()}
        </div>
      )}

      {/* 선택 현황 */}
      <div className="bg-white/90 backdrop-blur-lg rounded-[10px] border border-black/20 shadow-lg p-4 md:p-5 mt-4 mb-8">
        <p className="font-['Wittgenstein',sans-serif] text-[14px] md:text-[12px] text-black mb-4 font-semibold">
          선택 현황
        </p>
        <div className="flex flex-col gap-3">
          {players.map((player) => {
            const assignedRouteId = getAssignedRouteId(player);
            const routeIndex = searchResponse?.legs.findIndex(
              (leg) => leg.route_leg_id === assignedRouteId
            );
            const routeNumber = routeIndex !== undefined && routeIndex >= 0 ? routeIndex + 1 : null;
            const hasRoute = routeNumber !== null;

            // 플레이어별 이미지 매핑 (초록색=유저, 나머지=봇)
            const playerImage =
              player === 'user' ? imgUserCharacter :
              player === 'bot1' ? imgBot1Character :
              imgBot2Character;

            // 플레이어별 색상 테마
            const playerColor =
              player === 'user' ? 'green' :
              player === 'bot1' ? 'purple' :
              'yellow';

            const colorClasses = {
              green: {
                bg: 'bg-green-50',
                border: 'border-green-200',
                badge: 'bg-green-500',
                text: 'text-green-700',
              },
              purple: {
                bg: 'bg-purple-50',
                border: 'border-purple-200',
                badge: 'bg-purple-500',
                text: 'text-purple-700',
              },
              yellow: {
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                badge: 'bg-yellow-500',
                text: 'text-yellow-700',
              },
            };

            const colors = colorClasses[playerColor];

            return (
              <div
                key={player}
                className={`${colors.bg} ${colors.border} border-2 rounded-[12px] p-3 md:p-4 flex items-center gap-3 md:gap-4 transition-all hover:shadow-md ${
                  hasRoute ? 'opacity-100' : 'opacity-60'
                }`}
              >
                {/* 플레이어 아이콘 */}
                <div className="relative">
                  <img
                    src={playerImage}
                    alt={PLAYER_LABELS[player]}
                    className="size-[40px] md:size-[32px] object-contain drop-shadow-sm"
                  />
                  {hasRoute && (
                    <div className="absolute -top-1 -right-1 size-[12px] bg-white rounded-full border-2 border-white flex items-center justify-center">
                      <div className={`size-[6px] ${colors.badge} rounded-full`} />
                    </div>
                  )}
                </div>

                {/* 플레이어 이름 */}
                <div className="flex-1">
                  <p className={`font-['Wittgenstein',sans-serif] text-[14px] md:text-[12px] ${colors.text} font-semibold`}>
                    {PLAYER_LABELS[player]}
                  </p>
                </div>

                {/* 경로 번호 배지 */}
                <div className="flex items-center gap-2">
                  {hasRoute ? (
                    <>
                      <div className={`${colors.badge} text-white rounded-[8px] px-3 py-1.5 md:px-2.5 md:py-1 shadow-sm`}>
                        <p className="font-['Wittgenstein',sans-serif] text-[16px] md:text-[14px] font-bold">
                          {NUMBER_EMOJIS[routeNumber - 1] || `${routeNumber}`}
                        </p>
                      </div>
                      <p className="font-['Wittgenstein',sans-serif] text-[12px] md:text-[10px] text-gray-600">
                        경로 {routeNumber}
                      </p>
                    </>
                  ) : (
                    <div className="bg-gray-200 text-gray-400 rounded-[8px] px-3 py-1.5 md:px-2.5 md:py-1">
                      <p className="font-['Wittgenstein',sans-serif] text-[14px] md:text-[12px] font-medium">
                        경로 선택 필요
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // 봇별 캐릭터 색상
  const BOT_COLORS: CharacterColor[] = ['pink', 'yellow', 'green', 'purple'];

  // 봇 목록 (SSE로부터 받은 botPositions)
  const botList = Array.from(botPositions.entries()).map(([botId, state]) => ({
    botId,
    state,
    color: BOT_COLORS[(botId - 1) % BOT_COLORS.length], // botId는 1부터 시작
  }));

  // 지도 컨텐츠
  const mapContent = (
    <>
      <MapView
        ref={mapViewRef}
        currentPage="route"
        routeLines={routeLines}
        endpoints={endpoints}
        fitToRoutes={true}
      />

      {/* MovingCharacter 컴포넌트들 - bot1, bot2만 SSE 데이터 사용 */}
      {botList.map(({ botId, state, color }) => (
        <MovingCharacter
          key={botId}
          map={mapViewRef.current?.map || null}
          color={color}
          botId={botId}
          currentPosition={state.position}
          status={state.status}
          updateInterval={5000}
          size={64}
          animationSpeed={150}
        />
      ))}

      {/* User 캐릭터 (GPS 기반 - 일단 임시 위치) */}
      {/* TODO: 실제 GPS 위치로 업데이트 */}
    </>
  );

  // 모든 플레이어가 경로를 선택했는지 확인
  const allAssigned = areAllAssigned();
  // 버튼 활성화 조건
  const canStartNavigation = allAssigned && !isCreatingRoute;

  // 현재 위치로 이동
  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation을 지원하지 않는 브라우저입니다.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        const map = mapViewRef.current?.map;

        if (map) {
          map.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            duration: 1500,
          });
        }
      },
      (error) => {
        console.warn("현재 위치를 가져올 수 없습니다:", error);
      }
    );
  };

  // 지도 스타일 변경
  const handleStyleChange = useCallback((style: MapStyleType) => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance) return;

    // 스타일이 아직 로딩 중이면 무시
    if (!mapInstance.isStyleLoaded()) return;

    // 현재 지도 상태 저장
    const center = mapInstance.getCenter();
    const zoom = mapInstance.getZoom();
    const bearing = mapInstance.getBearing();
    const pitch = mapInstance.getPitch();

    // 스타일 변경 (diff: false로 경고 방지)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapInstance.setStyle(MAP_STYLES[style].url, { diff: false } as any);

    // 스타일 로드 후 상태 복원 및 한국어 라벨 적용
    mapInstance.once("style.load", () => {
      if (!mapInstance) return;

      // 지도 상태 복원
      mapInstance.jumpTo({
        center: center,
        zoom: zoom,
        bearing: bearing,
        pitch: pitch,
      });

      // 한국어 라벨 적용 (위성 지도는 라벨이 없으므로 제외)
      if (style !== "satellite-streets") {
        const layers = mapInstance.getStyle().layers;
        if (layers) {
          layers.forEach((layer) => {
            if (layer.type === "symbol" && layer.layout?.["text-field"]) {
              try {
                mapInstance.setLayoutProperty(layer.id, "text-field", [
                  "coalesce",
                  ["get", "name_ko"],
                  ["get", "name:ko"],
                  ["get", "name"],
                ]);
              } catch {
                // 일부 레이어는 text-field 변경이 불가능할 수 있음
              }
            }
          });
        }
      }

      // 야간 모드(navigation-night-v1)의 혼잡도 레이어 숨기기
      if (style === "dark") {
        const layers = mapInstance.getStyle().layers;
        if (layers) {
          layers.forEach((layer) => {
            // traffic 관련 레이어 숨기기
            if (layer.id.includes("traffic")) {
              try {
                mapInstance.setLayoutProperty(layer.id, "visibility", "none");
              } catch {
                // 레이어 숨기기 실패 무시
              }
            }
          });
        }
      }

      // 3D 건물 상태 유지 (스타일 변경 후에도)
      if (is3DBuildingsEnabled && mapInstance && !mapInstance.getLayer("3d-buildings")) {
        // 중구 건물 GeoJSON 소스 추가
        if (!mapInstance.getSource("junggu-buildings")) {
          mapInstance.addSource("junggu-buildings", {
            type: "geojson",
            data: "/junggu_buildings.geojson",
          });
        }
        // 건물 레이어 추가 (스타일별 가변 색상 및 수직 그라데이션 적용)
        mapInstance.addLayer({
          id: "3d-buildings",
          source: "junggu-buildings",
          type: "fill-extrusion",
          minzoom: 13,
          paint: {
            "fill-extrusion-color": style === "dark"
              ? [ // 야간 모드: 사이버펑크 네온 스타일
                  "interpolate", ["linear"], ["get", "height"],
                  0, "#1a1a2e",
                  20, "#16213e",
                  50, "#0f3460",
                  100, "#e94560"
                ]
              : [ // 기본 모드: 깔끔한 파스텔 녹색 스타일
                  "interpolate", ["linear"], ["get", "height"],
                  0, "#d4e6d7",
                  10, "#a8d4ae",
                  20, "#7bc47f",
                  50, "#4a9960",
                  100, "#2d5f3f",
                ],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": 0,
            "fill-extrusion-opacity": style === "dark" ? 0.85 : 0.75,
            "fill-extrusion-vertical-gradient": true, // 입체감을 위한 수직 그라데이션 활성화
          },
        });
      }
    });

    setMapStyle(style);
    setIsLayerPopoverOpen(false);
  }, [is3DBuildingsEnabled]);

  // 3D 건물 레이어 추가 함수
  const add3DBuildingsLayer = useCallback(async () => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance) return;

    // 이미 레이어가 있으면 무시
    if (mapInstance.getLayer("3d-buildings")) return;

    // 중구 건물 GeoJSON 소스 추가
    if (!mapInstance.getSource("junggu-buildings")) {
      mapInstance.addSource("junggu-buildings", {
        type: "geojson",
        data: "/junggu_buildings.geojson",
      });
    }

    // 건물 레이어 추가 (스타일별 가변 색상 및 수직 그라데이션 적용)
    mapInstance.addLayer({
      id: "3d-buildings",
      source: "junggu-buildings",
      type: "fill-extrusion",
      minzoom: 13,
      paint: {
        "fill-extrusion-color": mapStyle === "dark"
          ? [ // 야간 모드: 사이버펑크 네온 스타일
              "interpolate", ["linear"], ["get", "height"],
              0, "#1a1a2e",
              20, "#16213e",
              50, "#0f3460",
              100, "#e94560"
            ]
          : [ // 기본 모드: 깔끔한 파스텔 녹색 스타일
              "interpolate", ["linear"], ["get", "height"],
              0, "#d4e6d7",
              10, "#a8d4ae",
              20, "#7bc47f",
              50, "#4a9960",
              100, "#2d5f3f",
            ],
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": mapStyle === "dark" ? 0.85 : 0.75,
        "fill-extrusion-vertical-gradient": true, // 입체감을 위한 수직 그라데이션 활성화
      },
    });
  }, [mapStyle]);

  // 3D 건물 레이어 제거 함수
  const remove3DBuildingsLayer = useCallback(() => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance) return;
    if (mapInstance.getLayer("3d-buildings")) {
      mapInstance.removeLayer("3d-buildings");
    }
    // 소스도 제거
    if (mapInstance.getSource("junggu-buildings")) {
      mapInstance.removeSource("junggu-buildings");
    }
  }, []);

  // 3D 건물 토글 핸들러
  const handle3DBuildingsToggle = useCallback(() => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;

    const newState = !is3DBuildingsEnabled;
    setIs3DBuildingsEnabled(newState);

    if (newState) {
      add3DBuildingsLayer();

      // 시네마틱 카메라 연출: 눕히면서(pitch) 도착지 방향으로 살짝 회전(bearing)
      mapInstance.easeTo({
        pitch: 60,
        bearing: -20,
        duration: 1000,
        easing: (t) => t * (2 - t), // smooth out
      });
    } else {
      remove3DBuildingsLayer();
      // 카메라 초기화
      mapInstance.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 800,
      });
    }
  }, [is3DBuildingsEnabled, add3DBuildingsLayer, remove3DBuildingsLayer]);

  // 지하철 노선 토글 핸들러
  const handleSubwayLinesToggle = useCallback(() => {
    setIsSubwayLinesEnabled((prev) => !prev);
  }, []);

  // 버스 노선 토글 핸들러
  const handleBusLinesToggle = useCallback(() => {
    if (!isBusLinesEnabled) {
      // 켤 때: 모달 표시 (팝오버는 유지)
      setShowBusInputModal(true);
    } else {
      // 끌 때: 레이어 비활성화 및 추적 초기화
      setIsBusLinesEnabled(false);
      setTrackedBusNumbers([]);
      setBusNumberInput("");
      // 경로 및 마커 데이터 정리
      const mapInstance = mapViewRef.current?.map;
      if (mapInstance) {
        clearBusData(mapInstance);
        clearAllBusRoutePaths(mapInstance);
      }
    }
  }, [isBusLinesEnabled]);

  // 버스 번호 입력 확인 핸들러
  const handleBusInputConfirm = useCallback(() => {
    const numbers = busNumberInput
      .split(/[,\s]+/) // 쉼표 또는 공백으로 분리
      .map((n) => n.trim())
      .filter((n) => n.length > 0)
      .slice(0, 5); // 최대 5개

    if (numbers.length > 0) {
      setTrackedBusNumbers(numbers);
      setIsBusLinesEnabled(true);
      setShowBusInputModal(false);
    }
  }, [busNumberInput]);

  // 버스 입력 모달 취소 핸들러
  const handleBusInputCancel = useCallback(() => {
    setShowBusInputModal(false);
    setBusNumberInput("");
  }, []);


  // 웹 뷰 (왼쪽 사이드바 + 오른쪽 지도)
  if (isWebView) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* 왼쪽 사이드바 */}
        <div className="w-[400px] bg-white/20 backdrop-blur-xl border-r border-white/30 flex flex-col h-full overflow-hidden shadow-2xl">
          {/* 헤더 */}
          <div className="relative px-8 pt-6 pb-4 border-b border-white/30 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 backdrop-blur-lg">
            <button
              onClick={onBack}
              className="absolute top-6 right-8 bg-white/20 backdrop-blur-md rounded-[14px] w-[40px] h-[40px] flex items-center justify-center border border-white/30 shadow-lg hover:bg-white/30 active:scale-95 transition-all z-10"
            >
              <p className="font-['Wittgenstein',sans-serif] leading-[24px] text-[12px] text-white text-center drop-shadow-md">←</p>
            </button>
            <p className="font-['Wittgenstein',sans-serif] leading-[30px] text-[12px] text-white text-center drop-shadow-md">
              경로 선택
            </p>
          </div>

          {/* 스크롤 가능한 컨텐츠 영역 */}
          <div className="flex-1 overflow-auto px-5 py-5">
            {routeContent}
          </div>

          {/* 하단 고정 버튼 */}
          <div className="p-5 bg-gradient-to-t from-white/30 via-white/20 to-transparent backdrop-blur-lg border-t border-white/30">
            <button
              onClick={handleStartNavigation}
              disabled={!canStartNavigation}
              className={`w-full h-[60px] rounded-[10px] border transition-all shadow-lg ${
                canStartNavigation
                  ? "border-white/40 backdrop-blur-md bg-gradient-to-r from-green-500/60 to-green-400/60 hover:from-green-500/80 hover:to-green-400/80 cursor-pointer active:scale-95 text-black"
                  : "bg-gray-600 border-gray-500 cursor-not-allowed text-black"
              }`}
            >
              <p className="font-['Wittgenstein',sans-serif] text-[16px] md:text-[14px] font-bold drop-shadow-md">
                {isCreatingRoute ? "경주 생성 중..." : "이동 시작! 🏁"}
              </p>
            </button>
          </div>
        </div>

        {/* 오른쪽 지도 영역 */}
        <div className="flex-1 relative">
          {mapContent}

          {/* 오른쪽 상단 버튼들 */}
          <div className="absolute top-5 right-5 flex flex-col gap-3 z-10">
            {/* 레이어 버튼 */}
            <div className="relative">
              <button
                ref={layerButtonRef}
                onClick={() => setIsLayerPopoverOpen(!isLayerPopoverOpen)}
                className={`bg-white/20 backdrop-blur-md rounded-[14px] size-[40px] flex items-center justify-center border border-white/30 shadow-lg hover:bg-white/30 active:bg-white/25 active:scale-95 transition-all ${
                  isLayerPopoverOpen ? "bg-white/30" : ""
                }`}
                title="레이어"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* 레이어 팝오버 */}
              {isLayerPopoverOpen && (
                <div
                  ref={popoverRef}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-[48px] top-0 bg-white/20 backdrop-blur-lg rounded-[12px] shadow-xl border border-white/30 p-4 min-w-[200px] z-20"
                >
                  <div className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-white/20">
                    지도 스타일
                  </div>
                  <div className="flex flex-col gap-2">
                    {(Object.keys(MAP_STYLES) as MapStyleType[]).map((styleKey) => (
                      <button
                        key={styleKey}
                        onClick={() => handleStyleChange(styleKey)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          mapStyle === styleKey
                            ? "bg-white/40 text-gray-900 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                            : "hover:bg-white/30 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                        }`}
                      >
                        <span className="text-lg">{MAP_STYLES[styleKey].icon}</span>
                        <span className="text-sm font-medium">{MAP_STYLES[styleKey].name}</span>
                        {mapStyle === styleKey && (
                          <svg className="ml-auto w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* 레이어 옵션 섹션 */}
                  <div className="text-sm font-bold text-gray-800 mt-4 mb-3 pt-3 pb-2 border-t border-b border-white/20">
                    레이어 옵션
                  </div>
                  <div className="flex flex-col gap-2">
                    {/* 3D 건물 토글 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handle3DBuildingsToggle();
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        is3DBuildingsEnabled
                          ? "bg-white/50 text-gray-900 backdrop-blur-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] border border-white/40"
                          : "bg-white/25 hover:bg-white/35 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-white/20 shadow-sm"
                      }`}
                    >
                      <span className="text-lg">🏢</span>
                      <span className="text-sm font-medium">3D 건물</span>
                      <div
                        className={`ml-auto w-10 h-5 rounded-full transition-all relative backdrop-blur-sm ${
                          is3DBuildingsEnabled
                            ? "bg-green-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                            : "bg-white/35 border border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                            is3DBuildingsEnabled
                              ? "translate-x-5 bg-white shadow-md"
                              : "translate-x-0.5 bg-white border border-white/50 shadow-sm"
                          }`}
                        />
                      </div>
                    </button>

                    {/* 지하철 노선 토글 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubwayLinesToggle();
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        isSubwayLinesEnabled
                          ? "bg-white/50 text-gray-900 backdrop-blur-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] border border-white/40"
                          : "bg-white/25 hover:bg-white/35 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-white/20 shadow-sm"
                      }`}
                    >
                      <span className="text-lg">🚇</span>
                      <span className="text-sm font-medium whitespace-nowrap">지하철 노선</span>
                      <div
                        className={`ml-auto w-10 h-5 rounded-full transition-all relative backdrop-blur-sm ${
                          isSubwayLinesEnabled
                            ? "bg-green-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                            : "bg-white/35 border border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                            isSubwayLinesEnabled
                              ? "translate-x-5 bg-white shadow-md"
                              : "translate-x-0.5 bg-white border border-white/50 shadow-sm"
                          }`}
                        />
                      </div>
                    </button>

                    {/* 버스 노선 토글 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBusLinesToggle();
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                        isBusLinesEnabled
                          ? "bg-white/50 text-gray-900 backdrop-blur-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] border border-white/40"
                          : "bg-white/25 hover:bg-white/35 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-white/20 shadow-sm"
                      }`}
                    >
                      <span className="text-lg">🚌</span>
                      <span className="text-sm font-medium whitespace-nowrap">초정밀 버스</span>
                      <div
                        className={`ml-auto w-10 h-5 rounded-full transition-all relative backdrop-blur-sm ${
                          isBusLinesEnabled
                            ? "bg-green-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                            : "bg-white/35 border border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                        }`}
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                            isBusLinesEnabled
                              ? "translate-x-5 bg-white shadow-md"
                              : "translate-x-0.5 bg-white border border-white/50 shadow-sm"
                          }`}
                        />
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 현재 위치 버튼 */}
            <button
              onClick={handleMyLocation}
              className="bg-white/20 backdrop-blur-md rounded-[14px] size-[40px] flex items-center justify-center border border-white/30 shadow-lg hover:bg-white/30 active:bg-white/25 active:scale-95 transition-all"
              title="내 위치로 이동"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="black" strokeWidth="2.5"/>
                <path d="M12 2V6" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M12 18V22" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M2 12H6" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M18 12H22" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* 버스 번호 입력 모달 */}
          {showBusInputModal && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white/20 backdrop-blur-lg rounded-[16px] shadow-2xl border border-white/30 p-6 mx-4 max-w-[400px] w-full">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  버스 번호 입력
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  추적할 버스 번호를 입력하세요 (최대 5개, 쉼표로 구분)
                </p>
                <input
                  type="text"
                  value={busNumberInput}
                  onChange={(e) => setBusNumberInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleBusInputConfirm();
                    }
                  }}
                  placeholder="예: 360, 472, 151"
                  className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm border border-white/40 rounded-[12px] text-base text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-white/60 focus:bg-white/40 transition-all mb-4"
                  autoFocus
                />
                {trackedBusNumbers.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-700 mb-2">현재 추적 중:</p>
                    <div className="flex flex-wrap gap-2">
                      {trackedBusNumbers.map((num) => (
                        <span
                          key={num}
                          className="px-3 py-1 bg-white/40 backdrop-blur-sm text-gray-900 text-sm rounded-full border border-white/30"
                        >
                          {num}번
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={handleBusInputCancel}
                    className="flex-1 py-3 bg-white/30 backdrop-blur-sm text-gray-900 font-medium rounded-[12px] hover:bg-white/40 active:bg-white/50 border border-white/30 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleBusInputConfirm}
                    className="flex-1 py-3 bg-white/40 backdrop-blur-sm text-gray-900 font-medium rounded-[12px] hover:bg-white/50 active:bg-white/60 border border-white/30 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                  >
                    확인
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 모바일 뷰
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50"
    >
      {/* 백그라운드 지도 */}
      <div className="absolute inset-0">
        {mapContent}
      </div>

      {/* 바텀시트 */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-tl-[24px] rounded-tr-[24px] transition-all"
        style={{
          height: `${sheetHeight}%`,
          transitionDuration: isDragging ? "0ms" : "300ms",
          // PlaceSearchModal.tsx와 동일한 시트 배경 스타일
          background: "linear-gradient(135deg, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.75) 100%)",
          border: "1px solid rgba(255,255,255,0.40)",
          boxShadow: "0 -4px 8px 0px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.30)",
          backdropFilter: "blur(18px) saturate(160%)",
          WebkitBackdropFilter: "blur(18px) saturate(160%)",
        }}
      >
        {/* 드래그 핸들 */}
        <div
          className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
        >
          <div className="bg-white/40 backdrop-blur-sm h-[6px] w-[48px] rounded-full shadow-sm" />
        </div>

        {/* 컨텐츠 영역 */}
        <div className="px-5 overflow-y-auto" style={{ height: 'calc(100% - 120px)', paddingBottom: '120px' }}>
          {routeContent}
        </div>

        {/* 하단 고정 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white/30 via-white/20 to-transparent backdrop-blur-lg">
          <button
            onClick={handleStartNavigation}
            disabled={!canStartNavigation}
            className={`w-full h-[60px] rounded-[10px] border transition-all shadow-lg ${
              canStartNavigation
                ? "border-white/40 backdrop-blur-md bg-gradient-to-r from-green-500/60 to-green-400/60 hover:from-green-500/80 hover:to-green-400/80 cursor-pointer active:scale-95 text-black"
                : "bg-gray-600 border-gray-500 cursor-not-allowed text-white"
            }`}
          >
            <p className="font-['Wittgenstein',sans-serif] text-[12px] drop-shadow-md">
              {isCreatingRoute ? "경주 생성 중..." : "이동 시작! 🏁"}
            </p>
          </button>
        </div>
      </div>

      {/* 오른쪽 세로 버튼 컨테이너 */}
      <div className="absolute top-5 right-5 flex flex-col gap-3 z-10 pointer-events-none">
        {/* 뒤로가기 버튼 */}
        <button
          onClick={onBack}
          className="bg-white/20 backdrop-blur-md rounded-[14px] size-[40px] flex items-center justify-center border border-white/30 shadow-lg hover:bg-white/30 active:bg-white/25 active:scale-95 transition-all pointer-events-auto"
        >
          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black font-bold">←</p>
        </button>

        {/* 레이어 버튼 */}
        <div className="relative">
          <button
            ref={layerButtonRef}
            onClick={() => setIsLayerPopoverOpen(!isLayerPopoverOpen)}
            className={`bg-white/20 backdrop-blur-md rounded-[14px] size-[40px] flex items-center justify-center border border-white/30 shadow-lg hover:bg-white/30 active:bg-white/25 active:scale-95 transition-all pointer-events-auto ${
              isLayerPopoverOpen ? "bg-white/30" : ""
            }`}
            title="레이어"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* 레이어 팝오버 */}
          {isLayerPopoverOpen && (
            <div
              ref={popoverRef}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-[48px] top-0 bg-white/20 backdrop-blur-lg rounded-[12px] shadow-xl border border-white/30 p-4 min-w-[200px] z-20 pointer-events-auto"
            >
              <div className="text-sm font-bold text-gray-800 mb-3 pb-2 border-b border-white/20">
                지도 스타일
              </div>
              <div className="flex flex-col gap-2">
                {(Object.keys(MAP_STYLES) as MapStyleType[]).map((styleKey) => (
                  <button
                    key={styleKey}
                    onClick={() => handleStyleChange(styleKey)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                      mapStyle === styleKey
                        ? "bg-white/40 text-gray-900 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
                        : "hover:bg-white/30 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]"
                    }`}
                  >
                    <span className="text-lg">{MAP_STYLES[styleKey].icon}</span>
                    <span className="text-sm font-medium">{MAP_STYLES[styleKey].name}</span>
                    {mapStyle === styleKey && (
                      <svg className="ml-auto w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              {/* 레이어 옵션 섹션 */}
              <div className="text-sm font-bold text-gray-800 mt-4 mb-3 pt-3 pb-2 border-t border-b border-white/20">
                레이어 옵션
              </div>
              <div className="flex flex-col gap-2">
                {/* 3D 건물 토글 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handle3DBuildingsToggle();
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    is3DBuildingsEnabled
                      ? "bg-white/50 text-gray-900 backdrop-blur-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] border border-white/40"
                      : "bg-white/25 hover:bg-white/35 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-white/20 shadow-sm"
                  }`}
                >
                  <span className="text-lg">🏢</span>
                  <span className="text-sm font-medium">3D 건물</span>
                  {/* 토글 스위치 */}
                  <div
                    className={`ml-auto w-10 h-5 rounded-full transition-all relative backdrop-blur-sm ${
                      is3DBuildingsEnabled
                        ? "bg-green-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                        : "bg-white/35 border border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                        is3DBuildingsEnabled
                          ? "translate-x-5 bg-white shadow-md"
                          : "translate-x-0.5 bg-white border border-white/50 shadow-sm"
                      }`}
                    />
                  </div>
                </button>

                {/* 지하철 노선 토글 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubwayLinesToggle();
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isSubwayLinesEnabled
                      ? "bg-white/50 text-gray-900 backdrop-blur-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] border border-white/40"
                      : "bg-white/25 hover:bg-white/35 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-white/20 shadow-sm"
                  }`}
                >
                  <span className="text-lg">🚇</span>
                  <span className="text-sm font-medium whitespace-nowrap">지하철 노선</span>
                  {/* 토글 스위치 */}
                  <div
                    className={`ml-auto w-10 h-5 rounded-full transition-all relative backdrop-blur-sm ${
                      isSubwayLinesEnabled
                        ? "bg-green-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                        : "bg-white/35 border border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                        isSubwayLinesEnabled
                          ? "translate-x-5 bg-white shadow-md"
                          : "translate-x-0.5 bg-white border border-white/50 shadow-sm"
                      }`}
                    />
                  </div>
                </button>

                {/* 버스 노선 토글 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBusLinesToggle();
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                    isBusLinesEnabled
                      ? "bg-white/50 text-gray-900 backdrop-blur-sm shadow-[inset_0_3px_6px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(0,0,0,0.1)] border border-white/40"
                      : "bg-white/25 hover:bg-white/35 text-gray-800 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-white/20 shadow-sm"
                  }`}
                >
                  <span className="text-lg">🚌</span>
                  <span className="text-sm font-medium whitespace-nowrap">초정밀 버스</span>
                  {/* 토글 스위치 */}
                  <div
                    className={`ml-auto w-10 h-5 rounded-full transition-all relative backdrop-blur-sm ${
                      isBusLinesEnabled
                        ? "bg-green-500/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.15)]"
                        : "bg-white/35 border border-white/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.08)]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full transition-transform ${
                        isBusLinesEnabled
                          ? "translate-x-5 bg-white shadow-md"
                          : "translate-x-0.5 bg-white border border-white/50 shadow-sm"
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 현재 위치 버튼 */}
        <button
          onClick={handleMyLocation}
          className="bg-white/20 backdrop-blur-md rounded-[14px] size-[40px] flex items-center justify-center border border-white/30 shadow-lg hover:bg-white/30 active:bg-white/25 active:scale-95 transition-all pointer-events-auto"
          title="내 위치로 이동"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="black" strokeWidth="2.5"/>
            <path d="M12 2V6" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M12 18V22" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M2 12H6" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M18 12H22" stroke="black" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* 버스 번호 입력 모달 */}
      {showBusInputModal && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/20 backdrop-blur-lg rounded-[16px] shadow-2xl border border-white/30 p-6 mx-4 max-w-[400px] w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              버스 번호 입력
            </h3>
            <p className="text-sm text-gray-700 mb-4">
              추적할 버스 번호를 입력하세요 (최대 5개, 쉼표로 구분)
            </p>
            <input
              type="text"
              value={busNumberInput}
              onChange={(e) => setBusNumberInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleBusInputConfirm();
                }
              }}
              placeholder="예: 360, 472, 151"
              className="w-full px-4 py-3 bg-white/30 backdrop-blur-sm border border-white/40 rounded-[12px] text-base text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-white/60 focus:bg-white/40 transition-all mb-4"
              autoFocus
            />
            {trackedBusNumbers.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-700 mb-2">현재 추적 중:</p>
                <div className="flex flex-wrap gap-2">
                  {trackedBusNumbers.map((num) => (
                    <span
                      key={num}
                      className="px-3 py-1 bg-white/40 backdrop-blur-sm text-gray-900 text-sm rounded-full border border-white/30"
                    >
                      {num}번
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleBusInputCancel}
                className="flex-1 py-3 bg-white/30 backdrop-blur-sm text-gray-900 font-medium rounded-[12px] hover:bg-white/40 active:bg-white/50 border border-white/30 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)]"
              >
                취소
              </button>
              <button
                onClick={handleBusInputConfirm}
                className="flex-1 py-3 bg-white/40 backdrop-blur-sm text-gray-900 font-medium rounded-[12px] hover:bg-white/50 active:bg-white/60 border border-white/30 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
