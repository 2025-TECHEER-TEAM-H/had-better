import { useState, useRef, useEffect, useMemo } from "react";
import { MapView, type MapViewRef, type RouteLineInfo, type EndpointMarker } from "./MapView";
import { useRouteStore, type Player, PLAYER_LABELS, PLAYER_ICONS } from "@/stores/routeStore";
import { searchRoutes, getRouteLegDetail, createRoute } from "@/services/routeService";
import { secondsToMinutes, metersToKilometers, PATH_TYPE_NAMES, type BotStatusUpdateEvent } from "@/types/route";
import { ROUTE_COLORS } from "@/mocks/routeData";
import { useRouteSSE } from "@/hooks/useRouteSSE";
import { MovingCharacter, type CharacterColor } from "@/components/MovingCharacter";

type PageType = "map" | "search" | "favorites" | "subway" | "route" | "routeDetail";

interface RouteSelectionPageProps {
  onBack?: () => void;
  onNavigate?: (page: PageType) => void;
  isSubwayMode?: boolean;
}

export function RouteSelectionPage({ onBack, onNavigate, isSubwayMode }: RouteSelectionPageProps) {
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
    setDepartureArrival,
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

  // SSE 관련 상태
  const [activeRouteId, setActiveRouteId] = useState<number | null>(null);
  const [botPositions, setBotPositions] = useState<Map<number, BotStatusUpdateEvent>>(new Map());

  // SSE 연결
  const { status, botStates, connect, disconnect } = useRouteSSE(
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
          count: 5, // 5개 경로 요청
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

  // 지도에 표시할 경로 라인 생성
  const routeLines = useMemo((): RouteLineInfo[] => {
    if (!searchResponse) return [];

    return searchResponse.legs.map((leg, index) => {
      const colorScheme = ROUTE_COLORS[index % ROUTE_COLORS.length];
      const detail = legDetails.get(leg.route_leg_id);

      // 경로 상세가 있으면 실제 경로 좌표 사용
      if (detail?.legs) {
        const coordinates: [number, number][] = [];

        detail.legs.forEach((legStep) => {
          // passShape가 있으면 파싱
          if (legStep.passShape?.linestring) {
            const points = legStep.passShape.linestring.split(' ');
            points.forEach((point) => {
              const [lon, lat] = point.split(',').map(Number);
              if (!isNaN(lon) && !isNaN(lat)) {
                coordinates.push([lon, lat]);
              }
            });
          } else {
            // passShape가 없으면 start/end 좌표 사용
            coordinates.push([legStep.start.lon, legStep.start.lat]);
            coordinates.push([legStep.end.lon, legStep.end.lat]);
          }
        });

        return {
          id: `route-${leg.route_leg_id}`,
          coordinates,
          color: colorScheme.line,
          width: 4,
          opacity: 0.7,
        };
      }

      // 경로 상세가 없으면 출발지-도착지 직선
      if (departure && arrival) {
        return {
          id: `route-${leg.route_leg_id}`,
          coordinates: [
            [departure.lon, departure.lat],
            [arrival.lon, arrival.lat],
          ],
          color: colorScheme.line,
          width: 4,
          opacity: 0.5,
        };
      }

      return {
        id: `route-${leg.route_leg_id}`,
        coordinates: [],
        color: colorScheme.line,
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
      <div className="bg-[rgba(0,217,255,0.2)] h-[54px] rounded-[10px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center mb-4">
        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black">
          {departure?.name && arrival?.name
            ? `${departure.name} → ${arrival.name}`
            : "각 플레이어의 경로를 선택하세요"}
        </p>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          <span className="ml-3 font-['Wittgenstein',sans-serif] text-[12px]">경로 검색 중...</span>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="bg-red-100 border-[3px] border-red-500 rounded-[10px] p-4 mb-4">
          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-red-700">{error}</p>
        </div>
      )}

      {/* 경로 카드들 */}
      {searchResponse && (
        <div className="flex flex-col gap-4">
          {searchResponse.legs.map((leg, index) => {
            const colorScheme = ROUTE_COLORS[index % ROUTE_COLORS.length];
            const routeNumber = index + 1;
            const timeMinutes = secondsToMinutes(leg.totalTime);
            const distanceStr = metersToKilometers(leg.totalDistance);
            const pathTypeName = PATH_TYPE_NAMES[leg.pathType] || "대중교통";
            const isFirstRoute = index === 0;

            return (
              <div
                key={leg.route_leg_id}
                className="rounded-[10px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] p-5"
                style={{ backgroundColor: colorScheme.bg }}
              >
                <div className="flex gap-3 items-start">
                  {/* 경로 번호 아이콘 */}
                  <div className="bg-white size-[48px] border-[3px] border-black flex items-center justify-center shrink-0">
                    <p className="text-[24px]">
                      {routeNumber === 1 ? "1️⃣" : routeNumber === 2 ? "2️⃣" : "3️⃣"}
                    </p>
                  </div>

                  {/* 경로 정보 */}
                  <div className="flex-1 flex flex-col gap-2">
                    {/* 경로 이름 */}
                    <div className="flex gap-2 items-center">
                      <div
                        className="h-[2px] w-[12px] border-[0.673px] border-black"
                        style={{ backgroundColor: colorScheme.line }}
                      />
                      <p
                        className={`font-['Wittgenstein',sans-serif] text-[12px] ${
                          isFirstRoute ? "text-white" : "text-black"
                        }`}
                      >
                        경로 {routeNumber} ({pathTypeName})
                      </p>
                    </div>

                    {/* 시간/거리/환승 */}
                    <div className="flex gap-1 flex-wrap">
                      <div
                        className={`${
                          isFirstRoute ? "bg-[#ffd93d]" : "bg-white"
                        } h-[20px] px-[9px] py-[5px] border-[3px] border-black flex items-center justify-center`}
                      >
                        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[9px]">
                          {timeMinutes}분
                        </p>
                      </div>
                      <div className="bg-white h-[20px] px-[9px] py-[5px] border-[3px] border-black flex items-center justify-center">
                        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[9px]">
                          {distanceStr}
                        </p>
                      </div>
                      {leg.transferCount > 0 && (
                        <div className="bg-white h-[20px] px-[9px] py-[5px] border-[3px] border-black flex items-center justify-center">
                          <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black leading-[9px]">
                            환승 {leg.transferCount}회
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 체크박스들 */}
                    <div className="flex gap-[8px] items-center">
                      {players.map((player) => (
                        <label
                          key={player}
                          className="flex gap-1 items-center cursor-pointer"
                          onClick={() => toggleAssignment(player, leg.route_leg_id)}
                        >
                          <div className="size-[12px] border-[1.5px] border-black bg-white flex items-center justify-center">
                            {isAssigned(player, leg.route_leg_id) && (
                              <div className="size-[6px] bg-black" />
                            )}
                          </div>
                          <p
                            className={`font-['Wittgenstein',sans-serif] text-[12px] ${
                              isFirstRoute ? "text-white" : "text-black"
                            }`}
                          >
                            {PLAYER_LABELS[player]}
                          </p>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 선택 현황 */}
      <div className="bg-white rounded-[10px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] p-5 mt-4 mb-8">
        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black mb-4">
          선택 현황 :
        </p>
        <div className="flex flex-col gap-3">
          {players.map((player) => {
            const assignedRouteId = getAssignedRouteId(player);
            const routeIndex = searchResponse?.legs.findIndex(
              (leg) => leg.route_leg_id === assignedRouteId
            );
            const routeNumber = routeIndex !== undefined && routeIndex >= 0 ? routeIndex + 1 : null;

            return (
              <div key={player} className="flex items-center gap-2">
                <p className="text-[20px]">{PLAYER_ICONS[player]}</p>
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black">
                  {PLAYER_LABELS[player]}
                </p>
                <p className="text-[16px]">➡️</p>
                <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black">
                  경로 {routeNumber ?? "?"}
                </p>
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

  // 웹 뷰 (왼쪽 사이드바 + 오른쪽 지도)
  if (isWebView) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {/* 왼쪽 사이드바 */}
        <div className="w-[400px] bg-white border-r-[3px] border-black flex flex-col h-full overflow-hidden">
          {/* 헤더 */}
          <div className="relative px-8 pt-6 pb-4 border-b-[3px] border-black bg-[#80cee1]">
            <button
              onClick={onBack}
              className="absolute top-6 right-8 bg-white rounded-[14px] w-[40px] h-[40px] flex items-center justify-center border-[3px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-50 active:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-[2px] transition-all z-10"
            >
              <p className="font-['Wittgenstein',sans-serif] leading-[24px] text-[12px] text-black text-center">←</p>
            </button>
            <p className="font-['Wittgenstein',sans-serif] leading-[30px] text-[12px] text-black text-center">
              경로 선택
            </p>
          </div>

          {/* 스크롤 가능한 컨텐츠 영역 */}
          <div className="flex-1 overflow-auto px-5 py-5">
            {routeContent}
          </div>

          {/* 하단 고정 버튼 */}
          <div className="p-5 bg-white border-t-[3px] border-black">
            <button
              onClick={handleStartNavigation}
              disabled={!canStartNavigation}
              className={`w-full h-[60px] rounded-[10px] border-[3px] border-black transition-all ${
                canStartNavigation
                  ? "bg-[#48d448] hover:bg-[#3db83d] cursor-pointer shadow-[0px_4px_0px_0px_#2d8b2d] active:shadow-[0px_2px_0px_0px_#2d8b2d] active:translate-y-[2px]"
                  : "bg-[#99a1af] cursor-not-allowed"
              }`}
            >
              <p
                className={`font-['Wittgenstein',sans-serif] text-[12px] ${
                  canStartNavigation ? "text-white" : "text-[#4a5565]"
                }`}
              >
                {isCreatingRoute ? "경주 생성 중..." : "이동 시작! 🏁"}
              </p>
            </button>
          </div>
        </div>

        {/* 오른쪽 지도 영역 */}
        <div className="flex-1 relative">
          {mapContent}
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
        className="absolute bottom-0 left-0 right-0 bg-white border-black border-l-[3px] border-r-[3px] border-t-[3px] rounded-tl-[24px] rounded-tr-[24px] shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] transition-all"
        style={{
          height: `${sheetHeight}%`,
          transitionDuration: isDragging ? "0ms" : "300ms",
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
          <div className="bg-[#d1d5dc] h-[6px] w-[48px] rounded-full" />
        </div>

        {/* 컨텐츠 영역 */}
        <div className="px-5 overflow-y-auto" style={{ height: 'calc(100% - 120px)', paddingBottom: '120px' }}>
          {routeContent}
        </div>

        {/* 하단 고정 버튼 */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-white">
          <button
            onClick={handleStartNavigation}
            disabled={!canStartNavigation}
            className={`w-full h-[60px] rounded-[10px] border-[3px] border-black transition-all ${
              canStartNavigation
                ? "bg-[#48d448] hover:bg-[#3db83d] cursor-pointer shadow-[0px_4px_0px_0px_#2d8b2d] active:shadow-[0px_2px_0px_0px_#2d8b2d] active:translate-y-[2px]"
                : "bg-[#99a1af] cursor-not-allowed"
            }`}
          >
            <p
              className={`font-['Wittgenstein',sans-serif] text-[12px] ${
                canStartNavigation ? "text-white" : "text-[#4a5565]"
              }`}
            >
              {isCreatingRoute ? "경주 생성 중..." : "이동 시작! 🏁"}
            </p>
          </button>
        </div>
      </div>

      {/* 닫기 버튼 */}
      <button
        onClick={onBack}
        className="absolute top-5 right-5 bg-white rounded-[14px] size-[40px] flex items-center justify-center border-[3px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-50 active:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-[2px] transition-all pointer-events-auto z-10"
      >
        <p className="font-['Wittgenstein',sans-serif] text-[12px] text-black">←</p>
      </button>
    </div>
  );
}
