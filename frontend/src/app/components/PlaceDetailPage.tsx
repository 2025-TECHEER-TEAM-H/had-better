import favoriteStarEmpty from "@/assets/favorite-star-empty.webp";
import favoriteStarFilled from "@/assets/favorite-star-filled.webp";
import placeService from "@/services/placeService";
import { useEffect, useRef, useState } from "react";
import { MapView } from "./MapView";
import { useUserDistance } from "@/hooks/useUserDistance";
import { useNavigationStore } from "@/stores/navigationStore";
import { useLocationStore } from "@/stores/locationStore";

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
  onNavigate?: (page: 'map' | 'search' | 'favorites' | 'stats' | 'route') => void;
  onOpenDashboard?: () => void;
  onOpenSubway?: () => void;
}

// 알파벳(A, B, C, ...)에서 인덱스 계산 (마커 색상용)
const getIndexFromAlphabet = (letter: string): number => {
  if (!letter || letter.length === 0) return 0;
  const code = letter.charCodeAt(0);
  // A=65, B=66, ... Z=90
  if (code >= 65 && code <= 90) {
    return code - 65;
  }
  return 0;
};

// 인덱스 기반 마커 색상 반환 (MapView와 동일한 팔레트)
const getMarkerColor = (index: number): string => {
  const cardPalette = ["#7ed321", "#00d9ff", "#ffffff", "#ffc107", "#ff9ff3", "#54a0ff"];
  return cardPalette[index % cardPalette.length];
};

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

  // 네비게이션 상태
  const { setNavigation } = useNavigationStore();
  const { userLocation } = useLocationStore();

  // 경로 안내 시작 핸들러
  const handleStartNavigation = () => {
    if (!place?.coordinates) {
      console.warn("장소 좌표가 없습니다.");
      return;
    }

    // 출발지: 사용자 GPS 위치 (없으면 기본값 사용)
    const departure = userLocation
      ? { name: "현재 위치", lat: userLocation[1], lon: userLocation[0] }
      : { name: "현재 위치", lat: 37.5665, lon: 126.978 }; // 서울시청 기본값

    // 도착지: 선택된 장소
    const arrival = {
      name: place.name,
      lat: place.coordinates.lat,
      lon: place.coordinates.lon,
    };

    // 네비게이션 스토어에 설정
    setNavigation(departure, arrival);

    // PlaceDetailPage 닫기 (selectedPlaceForDetail 초기화)
    onClose();

    // SearchPage로 이동
    onNavigate?.('search');
  };

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
      <div
        className="backdrop-blur-lg rounded-[10px] border border-white/30 shadow-lg p-5 flex-shrink-0"
        style={{ backgroundColor: getMarkerColor(getIndexFromAlphabet(place.icon)) }}
      >
        {/* 상단: 아이콘과 장소 이름 */}
        <div className="flex items-center gap-4 mb-4">
          {/* 아이콘 */}
          <div className="bg-white/90 backdrop-blur-lg relative rounded-[10px] shrink-0 size-[72px] border border-white/40 shadow-md">
            <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center relative size-full">
              <p className="font-['Pretendard',sans-serif] font-bold leading-[64px] text-[#0a0a0a] text-[44px]">
                {place.icon}
              </p>
            </div>
          </div>

          {/* 장소 이름과 즐겨찾기 */}
          <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
            <p className="font-['Pretendard',sans-serif] font-bold leading-[24px] text-[18px] text-black break-words flex-1">
              {place.name}
            </p>
            {/* 즐겨찾기 버튼 */}
            <button
              onClick={handleToggleFavorite}
              className="bg-white/90 backdrop-blur-lg relative rounded-[14px] shrink-0 size-[48px] border border-white/40 shadow-md transition-all hover:bg-white active:scale-95 flex items-center justify-center"
            >
              <img
                src={isFavoriteInitialized && isFavorited ? favoriteStarFilled : favoriteStarEmpty}
                alt={isFavoriteInitialized && isFavorited ? "즐겨찾기됨" : "즐겨찾기 안됨"}
                className="size-[36px] object-contain pointer-events-none"
              />
            </button>
          </div>
        </div>

        {/* 하단: 거리와 주소 정보 */}
        <div className="flex flex-col gap-2 pt-3 border-t border-white/30">
          {(calculatedDistance || place.distance) && (
            <div className="flex items-center gap-2">
              <span className="text-[13px]">📍</span>
              <p className="font-['Pretendard',sans-serif] font-semibold leading-[19px] text-[#4a9960] text-[16px]">
                {calculatedDistance || place.distance}
              </p>
            </div>
          )}
          <div className="flex items-start gap-2">
            <span className="text-[13px] mt-0.5">🏠</span>
            <p className="font-['Pretendard',sans-serif] font-medium leading-[20px] text-[#6b7280] text-[14px] break-words flex-1">
              {place.address}
            </p>
          </div>
        </div>
      </div>

      {/* 경로 안내 시작 버튼 - 하단 고정 */}
      <button
        onClick={handleStartNavigation}
        className="h-[48px] w-full rounded-[18px] bg-[#4a9960] hover:bg-[#3d7f50] transition-colors border border-white/35 flex items-center justify-center active:translate-y-[1px] flex-shrink-0 mt-auto"
      >
        <span className="font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[18px] text-white">
          경로 안내 시작
        </span>
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
          {/* 헤더 */}
          <div className="px-6 py-5 border-b border-white/30 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 backdrop-blur-lg">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="bg-white/40 backdrop-blur-md rounded-[12px] w-[44px] h-[44px] flex items-center justify-center border border-white/50 shadow-lg hover:bg-white/50 active:bg-white/60 transition-all shrink-0"
                title="뒤로가기"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="rgba(0,0,0,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <h1 className="font-['DNFBitBitv2',sans-serif] text-[16px] text-black drop-shadow-md">
                상세정보
              </h1>
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
                    <p className="font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[12px] text-black mb-2">
                      장소명
                    </p>
                    <p className="font-['Pretendard',sans-serif] font-bold text-[18px] text-black leading-[22px] break-words">
                      {place.name}
                    </p>
                  </div>

                  {/* 거리 정보 (GPS 기반) */}
                  {(calculatedDistance || place.distance) && (
                    <div className="flex items-center gap-2">
                      <p className="font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[13px] text-black">거리:</p>
                      <div className="bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/40 rounded-[4px] inline-flex items-center px-[9px] py-[5px]">
                        <p className="font-['Pretendard',sans-serif] font-semibold text-[16px] text-cyan-600 leading-[19px]">
                          {calculatedDistance || place.distance}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* 주소 */}
                  <div className="flex flex-col gap-1">
                    <p className="font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[13px] text-black">주소:</p>
                    <p className="font-['Pretendard',sans-serif] font-medium text-[14px] text-[#6b9080] leading-[20px] break-words">
                      {place.address}
                    </p>
                  </div>

                  {/* 즐겨찾기 버튼 */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/30">
                    <p className="font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[12px] text-black">즐겨찾기</p>
                    <button
                      onClick={handleToggleFavorite}
                      className="bg-white/90 backdrop-blur-lg relative rounded-[14px] shrink-0 size-[48px] border border-white/40 shadow-md transition-all hover:bg-white active:scale-95 flex items-center justify-center"
                    >
                    <img
                      src={isFavoriteInitialized && isFavorited ? favoriteStarFilled : favoriteStarEmpty}
                      alt={isFavoriteInitialized && isFavorited ? "즐겨찾기됨" : "즐겨찾기 안됨"}
                      className="size-[36px] object-contain pointer-events-none"
                    />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 하단 경로 안내 시작 버튼 */}
          <div className="px-[20px] pb-6 pt-4 border-t border-white/30 bg-gradient-to-t from-white/30 via-white/20 to-transparent backdrop-blur-lg">
            <button
              onClick={handleStartNavigation}
              className="h-[48px] w-full rounded-[18px] bg-[#4a9960] hover:bg-[#3d7f50] transition-colors border border-white/35 flex items-center justify-center active:translate-y-[1px]"
            >
              <span className="font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[18px] text-white">
                경로 안내 시작
              </span>
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
          className="absolute top-[20px] left-[20px] bg-white/40 backdrop-blur-md rounded-[12px] size-[48px] flex items-center justify-center border border-white/50 shadow-lg hover:bg-white/50 active:bg-white/60 transition-all z-10"
          title="뒤로가기"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="rgba(0,0,0,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
