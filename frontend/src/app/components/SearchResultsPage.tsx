import { useEffect, useRef, useState } from "react";
import { MapView } from "./MapView";
import placeService, {
  type SearchPlaceHistory,
} from "@/services/placeService";

// UI용 검색 결과 타입
interface SearchResult {
  id: string;
  name: string;
  icon: string;
  distance: string;
  status: string;
  backgroundColor: string;
  isFavorited?: boolean;
  coordinates?: {
    lon: number;
    lat: number;
  };
  _poiPlaceId?: number; // POI Place ID (API 호출 시 사용)
}

// 받침 여부에 따라 주격 조사 반환
const getSubjectParticle = (word: string): "이" | "가" => {
  if (!word) return "이";
  const lastChar = word.charCodeAt(word.length - 1);
  if (lastChar < 0xac00 || lastChar > 0xd7a3) return "이";
  const jong = (lastChar - 0xac00) % 28;
  return jong === 0 ? "가" : "이";
};

// 카테고리별 아이콘 매핑
const getCategoryIcon = (category: string): string => {
  const c = (category || "").toLowerCase();
  const hasAny = (tokens: string[]) => tokens.some((t) => c.includes(t));

  // NOTE: 백엔드 category는 TMap mlClass 기반이라 포맷이 제각각(영문/복합/약어)일 수 있음.
  // 화면에서 확실히 구분되도록 "결과 이모지"는 고정(요청한 매핑) + 매칭 키워드는 넓게 커버.
  if (hasAny(["카페", "커피", "coffee", "cafe", "베이커리", "디저트"])) return "☕";
  if (hasAny(["음식", "음식점", "식당", "restaurant", "dining", "한식", "중식", "일식", "양식", "패스트푸드"])) return "🍽️";
  if (hasAny(["편의점", "convenience", "cvs"])) return "🏪";
  if (hasAny(["병원", "의원", "clinic", "hospital", "응급", "의료"])) return "🏥";
  if (hasAny(["약국", "pharmacy", "drugstore"])) return "💊";
  if (hasAny(["공원", "park", "산", "등산", "숲", "자연"])) return "🏞️";
  if (hasAny(["학교", "대학", "대학교", "univ", "university", "school", "학원"])) return "🏫";
  if (hasAny(["은행", "bank", "atm"])) return "🏦";
  if (hasAny(["주유", "주유소", "gas", "fuel", "station"])) return "⛽";
  if (hasAny(["주차", "parking"])) return "🅿️";
  if (hasAny(["지하철", "subway", "metro", "train", "rail"])) return "🚇";
  if (hasAny(["버스", "bus"])) return "🚌";
  if (hasAny(["호텔", "숙박", "hotel", "motel", "hostel"])) return "🏨";
  if (hasAny(["마트", "market", "grocery", "supermarket"])) return "🛒";
  if (hasAny(["백화점", "department", "mall", "쇼핑"])) return "🏬";

  return "📍"; // 기본 아이콘
};

// 카테고리별 배경색 매핑
const getCategoryColor = (_category: string, index: number): string => {
  const colors = ["#7ed321", "#00d9ff", "white", "#ffc107", "#ff9ff3", "#54a0ff"];
  return colors[index % colors.length];
};

interface SearchResultsPageProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onPlaceClick?: (result: SearchResult) => void;
  onToggleFavorite?: (placeId: string) => void;
}

export function SearchResultsPage({
  isOpen,
  onClose,
  searchQuery,
  onPlaceClick,
  onToggleFavorite,
}: SearchResultsPageProps) {
  const [sheetHeight, setSheetHeight] = useState(35); // 초기 높이 35% (컨테이너 2개 보이는 정도)
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startHeight, setStartHeight] = useState(35);
  const [isWebView, setIsWebView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sheetHeightRef = useRef(sheetHeight); // 최신 sheetHeight 추적용

  // sheetHeight가 변경될 때마다 ref 업데이트
  useEffect(() => {
    sheetHeightRef.current = sheetHeight;
  }, [sheetHeight]);

  // 검색 결과 상태
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10); // 현재 표시할 개수
  
  // 즐겨찾기 상태 관리 (poi_place_id -> saved_place_id 매핑)
  const [savedPlacesMap, setSavedPlacesMap] = useState<Map<number, number>>(new Map());

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

  // 즐겨찾기 목록 로드 함수 (매핑만 업데이트, 검색 결과는 건드리지 않음)
  const loadSavedPlaces = async (): Promise<void> => {
    try {
      const response = await placeService.getSavedPlaces();
      if (response.status === "success" && response.data) {
        // poi_place_id -> saved_place_id 매핑 생성
        const map = new Map<number, number>();
        response.data.forEach((savedPlace) => {
          const poiId = savedPlace.poi_place.poi_place_id;
          map.set(poiId, savedPlace.saved_place_id);
        });
        setSavedPlacesMap(map);
      }
    } catch (err) {
      console.error("즐겨찾기 목록 로드 실패:", err);
    }
  };

  // 즐겨찾기 목록 로드
  useEffect(() => {
    if (isOpen) {
      loadSavedPlaces();
    }
  }, [isOpen]);

  // FavoritesPlaces / PlaceDetailPage 등에서 즐겨찾기 변경 시 동기화
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
        
        // 검색 결과의 즐겨찾기 상태 업데이트
        setSearchResults((prev) =>
          prev.map((result) => {
            const poiPlaceId = result._poiPlaceId;
            if (poiPlaceId && deletedPoiIds.includes(poiPlaceId)) {
              return { ...result, isFavorited: false };
            }
            return result;
          })
        );
      }
      
      if (addedPoiId && savedPlaceId) {
        // 추가된 POI ID를 매핑에 추가
        setSavedPlacesMap((prev) => {
          const newMap = new Map(prev);
          newMap.set(addedPoiId, savedPlaceId);
          return newMap;
        });

        // 검색 결과의 즐겨찾기 상태도 업데이트
        // - SearchResultsPage 내부에서 토글한 경우: 이미 handleToggleFavorite에서 isFavorited를 true로 만들어 둔 상태라 여기서 한 번 더 true로 설정해도 문제 없음
        // - PlaceDetailPage / FavoritesPlaces 등 "외부"에서 즐겨찾기를 추가한 경우:
        //   여기서 처음으로 해당 결과의 isFavorited를 true로 맞춰주어야 함
        setSearchResults((prev) =>
          prev.map((result) => {
            const poiPlaceId = result._poiPlaceId;
            if (poiPlaceId && poiPlaceId === addedPoiId) {
              return { ...result, isFavorited: true };
            }
            return result;
          })
        );
      }
    };

    window.addEventListener("favoritesUpdated", handleFavoritesUpdated as EventListener);
    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdated as EventListener);
    };
  }, []);

  // 검색어가 변경될 때 API 호출
  useEffect(() => {
    if (!searchQuery.trim() || !isOpen) {
      setSearchResults([]);
      setVisibleCount(10); // 리셋
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      setError(null);
      setVisibleCount(10); // 새 검색 시 리셋

      try {
        const response = await placeService.searchPlaces({ q: searchQuery });

        if (response.status === "success" && response.data) {
          // API 응답을 UI용 데이터로 변환
          const results: SearchResult[] = response.data.map((place, index) => {
            const poiPlaceId = place.poi_place_id;
            const savedPlaceId = savedPlacesMap.get(poiPlaceId);
            // 고유 ID 생성: poi_place_id + index (백엔드에서 각 장소가 고유한 poi_place_id를 가지므로)
            const uniqueId = `${poiPlaceId}-${index}`;
            return {
              id: uniqueId,
              name: place.name,
              icon: getCategoryIcon(place.category || ""),
              distance: "",
              status: place.address,
              backgroundColor: getCategoryColor(place.category || "", index),
              isFavorited: savedPlaceId !== undefined,
              coordinates: place.coordinates,
              // POI Place ID 저장 (API 호출 시 사용)
              _poiPlaceId: poiPlaceId,
            };
          });
          setSearchResults(results);

          // 검색 성공 시, 서버에서 저장된 최신 검색 기록 목록을 가져와 SearchPage와 동기화
          try {
            const historiesResponse = await placeService.getSearchPlaceHistories();
            if (historiesResponse.status === "success" && historiesResponse.data) {
              const histories: SearchPlaceHistory[] = historiesResponse.data;
              window.dispatchEvent(
                new CustomEvent("searchHistoriesUpdated", {
                  detail: { histories },
                }),
              );
            }
          } catch (historyError) {
            console.error("검색 기록 동기화 실패:", historyError);
          }
        } else {
          setError(response.error?.message || "검색에 실패했습니다.");
          setSearchResults([]);
        }
      } catch (err: any) {
        console.error("검색 오류:", err);
        setError(err.response?.data?.error?.message || "서버 연결에 실패했습니다.");
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
    // savedPlacesMap 변경 시에는 검색 결과를 다시 불러오지 않는다
    // (즐겨찾기 토글 시 re-fetch로 인한 화면 재로딩을 막기 위함)
  }, [searchQuery, isOpen]);

  // 즐겨찾기 토글 핸들러
  const handleToggleFavorite = async (placeId: string) => {
    const result = searchResults.find((r) => r.id === placeId);
    
    if (!result || !result._poiPlaceId) return;

    const poiPlaceId = result._poiPlaceId;
    const savedPlaceId = savedPlacesMap.get(poiPlaceId);

    // 낙관적 UI 업데이트 (즉시 반영) - 해당 결과만 업데이트
    const newIsFavorited = !result.isFavorited;
    setSearchResults((prev) =>
      prev.map((r) =>
        r.id === placeId ? { ...r, isFavorited: newIsFavorited } : r
      )
    );
    // 토글 즉시 토스트 표시
    const particle = getSubjectParticle(result.name);
    showToast(
      newIsFavorited
        ? `${result.name}${particle} 즐겨찾기에 추가됐습니다.`
        : `${result.name}${particle} 즐겨찾기에서 삭제됐습니다.`
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
          } else {
            // 실패 시 롤백
            setSearchResults((prev) =>
              prev.map((r) =>
                r.id === placeId ? { ...r, isFavorited: !newIsFavorited } : r
              )
            );
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
          } else {
            // 다른 에러인 경우 롤백
            setSearchResults((prev) =>
              prev.map((r) =>
                r.id === placeId ? { ...r, isFavorited: !newIsFavorited } : r
              )
            );
            throw deleteErr;
          }
        }
      } else {
        // 즐겨찾기 추가
        const response = await placeService.addSavedPlace({
          poi_place_id: poiPlaceId,
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
          setSearchResults((prev) =>
            prev.map((r) =>
              r.id === placeId ? { ...r, isFavorited: !newIsFavorited } : r
            )
          );
        }
      }
    } catch (err: any) {
      console.error("즐겨찾기 토글 실패:", err);
      // 실패 시 롤백
      setSearchResults((prev) =>
        prev.map((r) =>
          r.id === placeId ? { ...r, isFavorited: !newIsFavorited } : r
        )
      );
    }

    onToggleFavorite?.(placeId);
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

    // 스냅 포인트: 35%, 60%, 85% (ref를 사용해 최신 값 참조)
    const currentHeight = sheetHeightRef.current;
    if (currentHeight < 47.5) {
      setSheetHeight(35);
    } else if (currentHeight < 72.5) {
      setSheetHeight(60);
    } else {
      setSheetHeight(85);
    }
  };

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

  if (!isOpen) return null;

  const buildSubline = (result: SearchResult) => {
    const status = (result.status || "").trim();
    const distance = (result.distance || "").trim();
    if (status && distance) return `${status} · ${distance}`;
    return status || distance || "";
  };

  // 검색 결과 카드 컴포넌트
  const ResultCard = ({ result }: { result: SearchResult }) => (
    <div
      onClick={() => onPlaceClick?.(result)}
      className="h-[110.665px] relative rounded-[10px] shrink-0 w-full cursor-pointer"
      style={{ backgroundColor: result.backgroundColor }}
    >
      <div aria-hidden="true" className="absolute border-[3.338px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex gap-[11.996px] items-start pb-[3.338px] pt-[23.335px] px-[23.335px] relative size-full">
        {/* 아이콘 */}
        <div className="bg-white relative shrink-0 size-[63.996px]">
          <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
          <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center pl-[1.335px] pr-[1.345px] py-[1.335px] relative size-full">
            <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[45px] text-[#0a0a0a] text-[30px] text-center tracking-[0.3955px]">
              {result.icon}
            </p>
          </div>
        </div>

        {/* 장소 이름 */}
        <div className="flex-[1_0_0] min-h-px min-w-px relative">
          <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex flex-col items-start relative w-full">
            <p className="css-ew64yg font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-extrabold leading-[18px] text-[14px] text-black text-left w-full overflow-hidden text-ellipsis whitespace-nowrap">
              {result.name}
            </p>
            {buildSubline(result) && (
              <p className="css-ew64yg font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[16px] text-[12px] text-black/70 text-left mt-2 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                {buildSubline(result)}
              </p>
            )}
          </div>
        </div>

        {/* 즐겨찾기 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFavorite(result.id);
          }}
          className="bg-white relative rounded-[14px] shrink-0 size-[48px]"
        >
          <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[4px_4px_0px_0px_black]" />
          <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center p-[2.693px] relative size-full">
            <p className="css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[48px] text-[#0a0a0a] text-[32px] tracking-[0.4063px]">
              {result.isFavorited ? "⭐" : "☆"}
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  // 검색 결과 리스트 컨텐츠
  const resultsContent = (
    <div className="flex flex-col gap-[11.996px] w-full">
      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-4 border-[#4a9960] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 에러 상태 */}
      {error && !isLoading && (
        <div className="text-center py-8">
          <p className="text-red-500 font-bold">{error}</p>
        </div>
      )}

      {/* 빈 결과 */}
      {!isLoading && !error && searchResults.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <p className="text-gray-500">"{searchQuery}"에 대한 검색 결과가 없습니다.</p>
        </div>
      )}

      {/* 검색 결과 목록 (visibleCount만큼만 표시) */}
      {!isLoading && !error && searchResults.slice(0, visibleCount).map((result, index) => (
        <ResultCard key={`${result.id}-${index}-${result.name}`} result={result} />
      ))}

      {/* 정보 더보기 버튼 */}
      {!isLoading && !error && searchResults.length > visibleCount && (
        <button
          onClick={() => setVisibleCount((prev) => prev + 10)}
          className="w-full py-4 bg-[#4a9960] text-white font-bold rounded-[10px] border-[3px] border-black shadow-[4px_4px_0px_0px_black] hover:bg-[#3d8050] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_black] transition-all"
        >
          <span className="font-['Press_Start_2P:Regular',sans-serif] text-[12px]">
            정보 더보기 ({searchResults.length - visibleCount}개 남음)
          </span>
        </button>
      )}
    </div>
  );

  // 첫 번째 검색 결과의 좌표 (지도 이동용)
  const firstResultLocation: [number, number] | null =
    searchResults.length > 0 && searchResults[0].coordinates
      ? [searchResults[0].coordinates.lon, searchResults[0].coordinates.lat]
      : null;

  // 검색 결과를 마커 정보로 변환 (visibleCount만큼만, 중복 ID 방지를 위해 인덱스 포함)
  const mapMarkers = searchResults
    .slice(0, visibleCount)
    .filter((result) => result.coordinates)
    .map((result, index) => ({
      id: `${result.id}-${index}`,
      coordinates: [result.coordinates!.lon, result.coordinates!.lat] as [number, number],
      name: result.name,
      icon: result.icon,
    }));

  // 지도 컨텐츠 - 실제 MapView 컴포넌트 사용
  const mapContent = (
    <MapView
      currentPage="search"
      targetLocation={firstResultLocation}
      markers={mapMarkers}
    />
  );

  // 웹 뷰 (왼쪽 사이드바 + 오른쪽 지도)
  if (isWebView) {
    return (
      <div className="fixed inset-0 z-50 flex">
        {toastMessage && (
          <div className="fixed left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
            {toastMessage}
          </div>
        )}
        {/* 왼쪽 사이드바 (400px 고정) */}
        <div className="w-[400px] bg-white border-r-[3.366px] border-black flex flex-col h-full overflow-hidden">
          {/* 헤더 */}
          <div className="relative px-8 pt-6 pb-4 border-b-[3.366px] border-black bg-[#80cee1]">
            <button
              onClick={onClose}
              className="absolute top-6 right-8 bg-white rounded-[14px] w-[40px] h-[40px] flex items-center justify-center border-[2.693px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-50 active:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-[2px] transition-all z-10"
            >
              <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[24px] text-[16px] text-black text-center">←</p>
            </button>
            <p className="css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] leading-[30px] text-[16px] text-black text-center">
              검색 결과
            </p>
            {searchQuery && (
              <p className="css-4hzbpn font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[20px] text-[12px] text-black text-center mt-2">
                "{searchQuery}"
              </p>
            )}
          </div>

          {/* 검색 결과 리스트 */}
          <div className="flex-1 overflow-auto px-[23.335px] py-6">
            {resultsContent}
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
        <div className="fixed left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-normal break-keep max-w-[420px] text-center leading-tight">
          {toastMessage}
        </div>
      )}
      {/* 지도 배경 */}
      <div className="absolute inset-0">
        {mapContent}
        
        {/* 뒤로 가기 버튼 */}
        <button
          onClick={onClose}
          className="absolute bg-white top-[20px] left-[20px] rounded-[14px] w-[40px] h-[40px] flex items-center justify-center z-10"
        >
          <div className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]" />
          <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[24px] text-[16px] text-black text-center">←</p>
        </button>
      </div>

      {/* 슬라이드 가능한 하단 시트 */}
      <div
        className="absolute left-0 right-0 bg-white border-black border-l-[3.366px] border-r-[3.366px] border-solid border-t-[3.366px] rounded-tl-[24px] rounded-tr-[24px] shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] transition-all"
        style={{
          bottom: 0,
          height: `${sheetHeight}%`,
          transitionDuration: isDragging ? '0ms' : '300ms',
        }}
      >
        {/* 드래그 핸들 */}
        <div
          className="absolute top-[16px] left-[50%] translate-x-[-50%] bg-[#d1d5dc] h-[5.996px] w-[48px] rounded-full cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
        />

        {/* 컨텐츠 */}
        <div className="absolute content-stretch flex flex-col gap-[16px] items-start left-0 right-0 overflow-auto px-[23.335px] py-0 top-[37.63px] bottom-0">
          {resultsContent}
        </div>
      </div>
    </div>
  );
}
