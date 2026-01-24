import imgHudHeartEmpty1 from "@/assets/hud-heart-empty.png";
import placeService from "@/services/placeService";
import { useEffect, useRef, useState } from "react";
import { MapView } from "./MapView";
import { useUserDistance } from "@/hooks/useUserDistance";

interface PlaceDetailPageProps {
  isOpen: boolean;
  onClose: () => void;
  place: {
    id: string;
    name: string;
    address: string;
    distance: string;
    icon: string;
    isFavorited?: boolean;
    coordinates?: { lon: number; lat: number };
    _poiPlaceId?: number; // POI Place ID (즐겨찾기 토글용)
  } | null;
  onToggleFavorite?: (placeId: string) => void;
  onStartNavigation?: () => void;
  onSearchSubmit?: (query: string) => void;
  onNavigate?: (page: 'map' | 'search' | 'favorites' | 'subway' | 'route') => void;
  onOpenDashboard?: () => void;
  onOpenSubway?: () => void;
}

// 받침 여부에 따라 주격 조사 반환
const getSubjectParticle = (word: string): "이" | "가" => {
  if (!word) return "이";
  const lastChar = word.charCodeAt(word.length - 1);
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return "이";
  const jong = (lastChar - 0xac00) % 28;
  return jong === 0 ? "가" : "이";
};

export function PlaceDetailPage({
  isOpen,
  onClose,
  place,
  onToggleFavorite,
  onSearchSubmit,
  onNavigate,
  onOpenDashboard,
}: PlaceDetailPageProps) {
  const [sheetHeight, setSheetHeight] = useState(40); // 초기 높이 40% (컨텐츠가 모두 보이도록)
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(40);
  const [isWebView, setIsWebView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // GPS 거리 계산
  const { getDistanceTo, formatDistance } = useUserDistance();
  const calculatedDistance = place?.coordinates
    ? formatDistance(getDistanceTo(place.coordinates.lon, place.coordinates.lat))
    : null;

  // 즐겨찾기 상태 관리
  const [savedPlacesMap, setSavedPlacesMap] = useState<Map<number, number>>(new Map());
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteInitialized, setIsFavoriteInitialized] = useState(false); // 초기 즐겨찾기 여부 로딩 완료 플래그

  // 토스트 메시지
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 1500);
  };

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // 즐겨찾기 목록 로드 함수
  const loadSavedPlaces = async (): Promise<void> => {
    try {
      const response = await placeService.getSavedPlaces();
      if (response.status === "success" && response.data) {
        // 모든 카테고리 포함 (일반 즐겨찾기 + 집/회사/학교)
        // 자주가는곳에 저장된 장소도 별이 색칠되어 보이도록 함

        // poi_place_id -> saved_place_id 매핑 생성
        const map = new Map<number, number>();
        response.data.forEach((savedPlace) => {
          const poiId = savedPlace.poi_place.poi_place_id;
          map.set(poiId, savedPlace.saved_place_id);
        });
        setSavedPlacesMap(map);

        // 현재 장소의 즐겨찾기 상태 업데이트
        if (place?._poiPlaceId) {
          setIsFavorited(map.has(place._poiPlaceId));
        } else {
          setIsFavorited(false);
        }
      }
      setIsFavoriteInitialized(true);
    } catch (err) {
      console.error("즐겨찾기 목록 로드 실패:", err);
      // 에러가 나도 최소한 초기 상태는 빈 별로 고정
      setIsFavorited(false);
      setIsFavoriteInitialized(true);
    }
  };

  // 즐겨찾기 목록 로드
  useEffect(() => {
    if (isOpen && place) {
      loadSavedPlaces();
    }
  }, [isOpen, place?._poiPlaceId]);

  // place 또는 즐겨찾기 매핑이 변경되면 즐겨찾기 상태 업데이트
  useEffect(() => {
    if (place?._poiPlaceId) {
      setIsFavorited(savedPlacesMap.has(place._poiPlaceId));
    } else {
      setIsFavorited(false);
    }
    // 이 시점부터는 "초기 로딩이 끝났다"고 보고 플래그를 켜준다.
    setIsFavoriteInitialized(true);
  }, [place?._poiPlaceId, savedPlacesMap]);

  // savedPlaceUpdated 이벤트 리스너 (자주가는곳 목록 갱신 시)
  useEffect(() => {
    const handler = () => {
      // 자주가는곳 목록이 갱신되면 즐겨찾기 목록도 다시 로드
      loadSavedPlaces();
    };
    window.addEventListener("savedPlaceUpdated", handler);
    return () => window.removeEventListener("savedPlaceUpdated", handler);
  }, []);

  // FavoritesPlaces에서 즐겨찾기 변경 시 동기화
  useEffect(() => {
    const handleFavoritesUpdated = (event: CustomEvent<{ deletedPoiIds?: number[]; addedPoiId?: number; savedPlaceId?: number }>) => {
      const { deletedPoiIds, addedPoiId, savedPlaceId } = event.detail;

      if (deletedPoiIds && deletedPoiIds.length > 0) {
        // 삭제된 POI ID들을 매핑에서 제거
        setSavedPlacesMap((prev) => {
          const newMap = new Map(prev);
          deletedPoiIds.forEach((poiId) => {
            newMap.delete(poiId);
          });
          return newMap;
        });

        // 현재 장소가 삭제된 경우 상태 업데이트
        if (place?._poiPlaceId && deletedPoiIds.includes(place._poiPlaceId)) {
          setIsFavorited(false);
        }
      }

      if (addedPoiId && savedPlaceId) {
        // 추가된 POI ID를 매핑에 추가
        setSavedPlacesMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(addedPoiId, savedPlaceId);
          return newMap;
        });

        // 현재 장소가 추가된 경우 상태 업데이트
        if (place?._poiPlaceId && addedPoiId === place._poiPlaceId) {
          setIsFavorited(true);
        }
      }
    };

    window.addEventListener("favoritesUpdated", handleFavoritesUpdated as EventListener);
    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdated as EventListener);
    };
  }, [place?._poiPlaceId]);

  // 즐겨찾기 토글 핸들러
  const handleToggleFavorite = async () => {
    if (!place?._poiPlaceId) return;

    const poiPlaceId = place._poiPlaceId;
    const savedPlaceId = savedPlacesMap.get(poiPlaceId);

    // 낙관적 UI 업데이트 (즉시 반영)
    const newIsFavorited = !isFavorited;
    setIsFavorited(newIsFavorited);

    // 토글 즉시 토스트 표시
    const particle = getSubjectParticle(place.name);
    showToast(
      newIsFavorited
        ? `${place.name}${particle} 즐겨찾기에 추가됐습니다.`
        : `${place.name}${particle} 즐겨찾기에서 삭제됐습니다.`
    );

    try {
      if (savedPlaceId !== undefined) {
        // 즐겨찾기 삭제
        try {
          const response = await placeService.deleteSavedPlace(savedPlaceId);
          if (response.status === "success") {
            // 매핑에서 제거
            setSavedPlacesMap((prev) => {
              const newMap = new Map(prev);
              newMap.delete(poiPlaceId);
              return newMap;
            });

            // 다른 컴포넌트에 동기화 이벤트 발생
            window.dispatchEvent(
              new CustomEvent("favoritesUpdated", {
                detail: { deletedPoiIds: [poiPlaceId] },
              })
            );
            // 자주가는곳 목록도 갱신되도록 이벤트 발생
            window.dispatchEvent(new CustomEvent("savedPlaceUpdated"));
          } else {
            // 실패 시 롤백
            setIsFavorited(!newIsFavorited);
          }
        } catch (deleteErr: any) {
          const status = deleteErr.response?.status;
          // 404/409: 이미 삭제되었거나 충돌 → 매핑에서 제거하고 진행
          if (status === 404 || status === 409) {
            console.warn(`즐겨찾기 ${savedPlaceId} 처리 중 상태 ${status}, 로컬 정리만 진행합니다.`);
            setSavedPlacesMap((prev) => {
              const newMap = new Map(prev);
              newMap.delete(poiPlaceId);
              return newMap;
            });

            // 다른 컴포넌트에 동기화 이벤트 발생
            window.dispatchEvent(
              new CustomEvent("favoritesUpdated", {
                detail: { deletedPoiIds: [poiPlaceId] },
              })
            );
            // 자주가는곳 목록도 갱신되도록 이벤트 발생
            window.dispatchEvent(new CustomEvent("savedPlaceUpdated"));
          } else {
            // 다른 에러인 경우 롤백
            setIsFavorited(!newIsFavorited);
            throw deleteErr;
          }
        }
      } else {
        // 즐겨찾기 추가 (category를 null로 명시적으로 설정하여 일반 즐겨찾기로 추가)
        const response = await placeService.addSavedPlace({
          poi_place_id: poiPlaceId,
          category: null, // 일반 즐겨찾기 (집/회사/학교가 아님)
        });
        if (response.status === "success" && response.data) {
          // 매핑에 추가
          setSavedPlacesMap((prev) => {
            const newMap = new Map(prev);
            newMap.set(poiPlaceId, response.data!.saved_place_id);
            return newMap;
          });

          // 다른 컴포넌트에 동기화 이벤트 발생
          window.dispatchEvent(
            new CustomEvent("favoritesUpdated", {
              detail: { addedPoiId: poiPlaceId, savedPlaceId: response.data.saved_place_id },
            })
          );
        } else if (response.status === "error" && response.error?.code === "RESOURCE_CONFLICT") {
          // 이미 즐겨찾기에 있는 경우 (409 Conflict)
          // 즐겨찾기 목록을 다시 로드하여 정확한 saved_place_id 가져오기
          loadSavedPlaces();
        } else {
          // 실패 시 롤백
          setIsFavorited(!newIsFavorited);
        }
      }
    } catch (err: any) {
      console.error("즐겨찾기 토글 실패:", err);
      // 실패 시 롤백
      setIsFavorited(!newIsFavorited);
    }

    onToggleFavorite?.(place.id);
  };

  // 웹/앱 화면 감지
  useEffect(() => {
    const checkViewport = () => {
      setIsWebView(window.innerWidth > 768);
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // 드래그 시작
  const handleDragStart = (clientY: number) => {
    setIsDragging(true);
    setStartY(clientY);
    setStartHeight(sheetHeight);
  };

  // 드래그 중
  const handleDragMove = (clientY: number) => {
    if (!isDragging || !containerRef.current) return;

    const deltaY = startY - clientY;
    const containerHeight = containerRef.current.offsetHeight;
    const deltaPercent = (deltaY / containerHeight) * 100;
    const newHeight = Math.min(Math.max(startHeight + deltaPercent, 35), 85);

    setSheetHeight(newHeight);
  };

  // 드래그 종료
  const handleDragEnd = () => {
    setIsDragging(false);

    // 스냅 포인트: 40%, 60%, 85%
    if (sheetHeight < 50) {
      setSheetHeight(40);
    } else if (sheetHeight < 72.5) {
      setSheetHeight(60);
    } else {
      setSheetHeight(85);
    }
  };

  // 마우스 이벤트
  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientY);
  };

  // NOTE: 현재 컴포넌트에서는 sheet 드래그를 터치 중심으로만 사용 (web handlers는 추후 연결)

  // 터치 이벤트
  const handleTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientY);
  };

  // NOTE: touch move/end는 전역 리스너에서 처리

  // 전역 마우스/터치 이벤트 리스너
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        handleDragMove(e.clientY);
      };

      const handleGlobalMouseUp = () => {
        handleDragEnd();
      };

      const handleGlobalTouchMove = (e: TouchEvent) => {
        handleDragMove(e.touches[0].clientY);
      };

      const handleGlobalTouchEnd = () => {
        handleDragEnd();
      };

      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
      window.addEventListener('touchmove', handleGlobalTouchMove);
      window.addEventListener('touchend', handleGlobalTouchEnd);

      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('touchmove', handleGlobalTouchMove);
        window.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [isDragging, startY, startHeight]);

  if (!isOpen || !place) return null;

  // 장소 정보 컨텐츠 (모바일과 웹에서 공통으로 사용)
  const placeInfoContent = (
    <div className="flex flex-col h-full gap-4">
      {/* 장소 정보 카드 */}
      <div className="bg-white/90 backdrop-blur-lg rounded-[10px] border border-white/30 shadow-lg p-5 flex-shrink-0">
        {/* 상단: 아이콘과 장소 이름 */}
        <div className="flex items-center gap-4 mb-4">
          {/* 아이콘 */}
          <div className="bg-white/90 backdrop-blur-lg relative rounded-[10px] shrink-0 size-[72px] border border-white/40 shadow-md">
            <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center relative size-full">
              <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[64px] text-[#0a0a0a] text-[44px] tracking-[0.3516px]">
                {place.icon}
              </p>
            </div>
          </div>

          {/* 장소 이름과 즐겨찾기 */}
          <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
            <p className="css-ew64yg font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[22px] text-[16px] text-black break-words flex-1">
              {place.name}
            </p>
            {/* 즐겨찾기 버튼 */}
            <button
              onClick={handleToggleFavorite}
              className="bg-white/90 backdrop-blur-lg relative rounded-[14px] shrink-0 size-[48px] border border-white/40 shadow-md transition-all hover:bg-white active:scale-95"
            >
              <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center relative size-full">
                <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[48px] text-[#0a0a0a] text-[32px] tracking-[0.4063px]">
                  {/* 초기 로딩이 끝나기 전까지는 항상 빈 별로 표시해서 플리커(⭐→☆) 느낌을 없앤다 */}
                  {isFavoriteInitialized && isFavorited ? "⭐" : "☆"}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 하단: 거리와 주소 정보 */}
        <div className="flex flex-col gap-2 pt-3 border-t border-white/30">
          {(calculatedDistance || place.distance) && (
            <div className="flex items-center gap-2">
              <span className="text-[12px]">📍</span>
              <p className="css-4hzbpn font-['Wittgenstein:Medium',sans-serif] font-medium leading-[16px] text-[#4a9960] text-[12px]">
                {calculatedDistance || place.distance}
              </p>
            </div>
          )}
          <div className="flex items-start gap-2">
            <span className="text-[12px] mt-0.5">🏠</span>
            <p className="css-4hzbpn font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[18px] text-[#6b7280] text-[12px] break-words flex-1">
              {place.address}
            </p>
          </div>
        </div>
      </div>

      {/* 경로 안내 시작 버튼 - 하단 고정 */}
      <button
        onClick={() => onNavigate?.('route')}
        className="h-[55.995px] relative rounded-[10px] w-full border border-white/40 backdrop-blur-md bg-gradient-to-r from-pink-500/60 to-pink-400/60 hover:from-pink-500/80 hover:to-pink-400/80 cursor-pointer active:scale-95 transition-all shadow-lg flex-shrink-0 mt-auto"
      >
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[18px] left-[50%] text-[12px] text-center text-white top-[50%] translate-x-[-50%] translate-y-[-50%] drop-shadow-md" style={{ fontVariationSettings: "'wght' 400" }}>
          경로 안내 시작! 🏁
        </p>
      </button>
    </div>
  );

  // 지도 좌표 및 마커 설정
  const targetLocation: [number, number] | null = place?.coordinates
    ? [place.coordinates.lon, place.coordinates.lat]
    : null;

  const markers = place?.coordinates
    ? [
        {
          id: place.id,
          coordinates: [place.coordinates.lon, place.coordinates.lat] as [number, number],
          name: place.name,
          icon: place.icon,
        },
      ]
    : [];

  // 지도 컨텐츠 (모바일과 웹에서 공통으로 사용)
  const mapContent = (
    <MapView
      currentPage="search"
      targetLocation={targetLocation}
      markers={markers}
    />
  );

  // 웹 뷰 (왼쪽 사이드바 + 오른쪽 지도)
  if (isWebView) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {toastMessage && (
          <div className="fixed left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl text-sm whitespace-normal break-keep max-w-[420px] text-center leading-tight"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.3)"
            }}
          >
            {toastMessage}
          </div>
        )}
        {/* 왼쪽 사이드바 (400px 고정) */}
        <div className="w-[400px] bg-white/20 backdrop-blur-xl border-r border-white/30 flex flex-col h-full overflow-hidden shadow-2xl">
          {/* 헤더 영역 - Figma 스타일 */}
          <div className="relative h-[198px] border-b border-white/30 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 backdrop-blur-lg shrink-0">
            {/* 햄버거 메뉴 버튼 */}
            <button className="absolute bg-white left-[19px] top-[23px] rounded-[12px] size-[42px] border-[3px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]">
              <div className="absolute left-[6px] size-[24px] top-[6px]">
                <div className="h-[24px] overflow-clip relative shrink-0 w-full">
                  <div className="absolute contents inset-[20.83%_16.67%]">
                    <div className="absolute inset-[20.83%_16.67%_79.17%_16.67%]">
                      <div className="absolute inset-[-1px_-6.25%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
                          <path d="M1 1H17" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-1/2 left-[16.67%] right-[16.67%] top-1/2">
                      <div className="absolute inset-[-1px_-6.25%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
                          <path d="M1 1H17" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute inset-[79.17%_16.67%_20.83%_16.67%]">
                      <div className="absolute inset-[-1px_-6.25%]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
                          <path d="M1 1H17" stroke="black" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* 타이틀 */}
            <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] h-[25.328px] leading-[30px] left-1/2 not-italic text-[16px] text-white text-center top-[32px] -translate-x-1/2 drop-shadow-md">
              HAD BETTER
            </p>

            {/* 뒤로 가기 버튼 */}
            <button
              onClick={onClose}
              className="absolute bg-white/20 backdrop-blur-md right-[19px] top-[25px] rounded-[14px] w-[40px] h-[40px] flex items-center justify-center border border-white/30 shadow-lg hover:bg-white/30 active:scale-95 transition-all z-10"
            >
              <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[24px] text-[16px] text-white text-center drop-shadow-md">←</p>
            </button>

            {/* 장소 이름 입력 필드 스타일 박스 */}
            <div className="absolute left-[26px] right-[31px] top-[75px]">
              <div className="bg-white h-[63px] relative rounded-[25px] w-full border-[3px] border-black flex items-center px-[18px] gap-[17px]">
                <div className="relative shrink-0 size-[30px]">
                  <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHudHeartEmpty1} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      onSearchSubmit?.(searchQuery);
                    }
                  }}
                  placeholder="목적지를 입력해주세요"
                  className="css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[30px] text-[13px] text-black flex-1 bg-transparent outline-none placeholder:text-gray-400"
                  style={{ fontVariationSettings: "'wght' 400" }}
                />
              </div>
            </div>

            {/* 네비게이션 버튼들 */}
            <div className="absolute bg-white content-stretch flex h-[42px] items-center justify-center left-0 top-[160px] w-full">
              <div aria-hidden="true" className="absolute border-[3px] border-black border-solid inset-0 pointer-events-none" />
              <div className="content-stretch flex gap-[25px] items-center px-[25px] py-0 relative shrink-0 w-[351px]">
                {/* 지도 버튼 - PlaceDetailPage를 닫고 지도 페이지로 이동 */}
                <button
                  onClick={() => {
                    onClose();
                    onNavigate?.('map');
                  }}
                  className="bg-[rgba(255,255,255,0)] content-stretch flex h-[43px] items-center justify-center px-[10px] py-[5px] relative rounded-[40px] shrink-0 w-[57px]"
                >
                  <p className="css-ew64yg font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-black text-center">지도</p>
                </button>

                {/* 검색 버튼 - PlaceDetailPage를 닫고 검색 페이지로 이동 */}
                <button
                  onClick={() => {
                    onClose();
                    onNavigate?.('search');
                  }}
                  className="bg-[rgba(255,255,255,0)] content-stretch flex h-[43px] items-center justify-center px-[10px] py-[5px] relative rounded-[40px] shrink-0 w-[56px]"
                >
                  <p className="css-ew64yg font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-black text-center">검색</p>
                </button>

                {/* 지하철 버튼 - PlaceDetailPage를 닫고 지하철 노선도 오버레이 열기 */}
                <button
                  onClick={() => {
                    onClose();
                    onNavigate?.('subway');
                  }}
                  className="bg-[rgba(255,255,255,0)] content-stretch flex h-[43px] items-center justify-center px-[10px] py-[5px] relative rounded-[40px] shrink-0 w-[57px]"
                >
                  <p className="css-ew64yg font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-black text-center">지하철</p>
                </button>

                {/* MY 버튼 - PlaceDetailPage를 닫고 대시보드 팝업 열기 */}
                <button
                  onClick={() => {
                    onClose();
                    onOpenDashboard?.();
                  }}
                  className="bg-[rgba(255,255,255,0)] content-stretch flex h-[43px] items-center justify-center px-[10px] py-[5px] relative rounded-[40px] shrink-0 w-[56px]"
                >
                  <p className="css-ew64yg font-['Wittgenstein:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-black text-center">MY</p>
                </button>
              </div>
            </div>
          </div>

          {/* 장소 상세 정보 컨테이너 */}
          <div className="flex-1 overflow-auto px-[20px] py-6">
            <div className="flex flex-col gap-[16px]">
              {/* 장소 정보 카드 */}
              <div className="bg-white/90 backdrop-blur-lg rounded-[10px] border border-white/30 shadow-lg p-5">
                <div className="flex flex-col gap-4">
                  {/* 장소 이름 */}
                  <div>
                    <p className="font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[14px] text-black mb-2">
                      장소명
                    </p>
                    <p className="font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px] text-black leading-[20px] break-words">
                      {place.name}
                    </p>
                  </div>

                  {/* 거리 정보 (GPS 기반) */}
                  {(calculatedDistance || place.distance) && (
                    <div className="flex items-center gap-2">
                      <p className="font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[14px] text-black">거리:</p>
                      <div className="bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/40 rounded-[4px] inline-flex items-center px-[9px] py-[5px]">
                        <p className="font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[8px] text-cyan-600 leading-[9px]">
                          {calculatedDistance || place.distance}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 주소 */}
                  <div className="flex flex-col gap-1">
                    <p className="font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[14px] text-black">주소:</p>
                    <p className="font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] text-[12px] text-[#6b9080] leading-[18px] break-words">
                      {place.address}
                    </p>
                  </div>

                  {/* 즐겨찾기 버튼 */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/30">
                    <p className="font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold text-[14px] text-black">즐겨찾기</p>
                    <button
                      onClick={handleToggleFavorite}
                      className="bg-white/90 backdrop-blur-lg relative rounded-[14px] shrink-0 size-[48px] border border-white/40 shadow-md transition-all hover:bg-white active:scale-95"
                    >
                      <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center relative size-full">
                        <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[48px] text-[#0a0a0a] text-[32px] tracking-[0.4063px]">
                          {isFavoriteInitialized && isFavorited ? "⭐" : "☆"}
                        </p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 경로 안내 시작 버튼 */}
          <div className="px-[20px] pb-6 pt-4 border-t border-white/30 bg-gradient-to-t from-white/30 via-white/20 to-transparent backdrop-blur-lg">
            <button
              onClick={() => onNavigate?.('route')}
              className="h-[55.995px] relative rounded-[10px] w-full border border-white/40 backdrop-blur-md bg-gradient-to-r from-pink-500/60 to-pink-400/60 hover:from-pink-500/80 hover:to-pink-400/80 cursor-pointer active:scale-95 transition-all shadow-lg"
            >
              <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[18px] left-[50%] text-[12px] text-center text-white top-[50%] translate-x-[-50%] translate-y-[-50%] drop-shadow-md" style={{ fontVariationSettings: "'wght' 400" }}>
                경로 안내 시작! 🏁
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

  // 모바일 뷰 (전체 화면 + 하단 슬라이드 시트)
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50"
      style={{
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
    >
      {toastMessage && (
        <div className="fixed left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl text-sm whitespace-normal break-keep max-w-[420px] text-center leading-tight"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.3)"
          }}
        >
          {toastMessage}
        </div>
      )}
      {/* 지도 배경 */}
      <div className="absolute inset-0">
        {mapContent}

        {/* 뒤로 가기 버튼 */}
        <button
          onClick={onClose}
          className="absolute bg-white/20 backdrop-blur-md top-[20px] left-[20px] rounded-[14px] w-[40px] h-[40px] flex items-center justify-center z-10 border border-white/30 shadow-lg hover:bg-white/30 active:bg-white/25 active:scale-95 transition-all"
        >
          <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[24px] text-[16px] text-black text-center drop-shadow-sm">←</p>
        </button>
      </div>

      {/* 슬라이드 가능한 하단 시트 */}
      <div
        className="absolute left-0 right-0 rounded-tl-[24px] rounded-tr-[24px] transition-all"
        style={{
          bottom: 0,
          height: `${sheetHeight}%`,
          transitionDuration: isDragging ? '0ms' : '300ms',
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
          className="absolute top-[16px] left-[50%] translate-x-[-50%] bg-white/40 backdrop-blur-sm h-[6px] w-[48px] rounded-full shadow-sm cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        />

        {/* 컨텐츠 */}
        <div className="absolute left-0 right-0 top-[37.63px] bottom-0 flex flex-col px-[19.997px] py-4 overflow-hidden">
          {placeInfoContent}
        </div>
      </div>
    </div>
  );
}
