import placeService, {
  type SearchPlaceHistory,
} from "@/services/placeService";
import { useEffect, useRef, useState } from "react";
import { MapView } from "./MapView";
import { useUserDistance } from "@/hooks/useUserDistance";
import favoriteStarEmpty from "@/assets/favorite-star-empty.webp";
import favoriteStarFilled from "@/assets/favorite-star-filled.webp";

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

// 인덱스 기반 알파벳 반환 (A, B, C, ...)
const getAlphabetLabel = (index: number): string => {
  return String.fromCharCode(65 + index); // A=65, B=66, ...
};

// 카테고리별 배경색 매핑 (글라스모피즘용 단색)
const getCategoryColor = (_category: string, index: number): string => {
  const colors = [
    { r: 126, g: 211, b: 33 },   // #7ed321
    { r: 0, g: 217, b: 255 },    // #00d9ff
    { r: 255, g: 255, b: 255 },  // white
    { r: 255, g: 193, b: 7 },    // #ffc107
    { r: 255, g: 159, b: 243 },  // #ff9ff3
    { r: 84, g: 160, b: 255 },   // #54a0ff
  ];
  const color = colors[index % colors.length];
  const opacity = 0.85; // 진한 색상
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
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

  // GPS 거리 계산
  const { getDistanceTo, formatDistance } = useUserDistance();

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
        // 모든 카테고리 포함 (일반 즐겨찾기 + 집/회사/학교)
        // 자주가는곳에 저장된 장소도 별이 색칠되어 보이도록 함

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

  // savedPlaceUpdated 이벤트 리스너 (자주가는곳 목록 갱신 시)
  useEffect(() => {
    const handler = () => {
      // 자주가는곳 목록이 갱신되면 즐겨찾기 목록도 다시 로드
      loadSavedPlaces();
    };
    window.addEventListener("savedPlaceUpdated", handler);
    return () => window.removeEventListener("savedPlaceUpdated", handler);
  }, []);

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
              icon: getAlphabetLabel(index),
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
            // 자주가는곳 목록도 갱신되도록 이벤트 발생
            window.dispatchEvent(new CustomEvent("savedPlaceUpdated"));
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
            // 자주가는곳 목록도 갱신되도록 이벤트 발생
            window.dispatchEvent(new CustomEvent("savedPlaceUpdated"));
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
          // "이미 추가하셨습니다" 메시지 표시
          showToast("이미 추가하셨습니다.");
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

  // 상세 주소와 거리를 각각 별도 줄로 렌더링하기 위한 헬퍼
  const buildSubline = (result: SearchResult) => {
    const status = (result.status || "").trim();
    // GPS 거리 우선, 없으면 API 거리 사용
    const gpsDistance = result.coordinates
      ? formatDistance(getDistanceTo(result.coordinates.lon, result.coordinates.lat))
      : null;
    const distance = gpsDistance || (result.distance || "").trim();

    return {
      status,
      distance,
    };
  };

  // 검색 결과 카드 컴포넌트
  const ResultCard = ({ result }: { result: SearchResult }) => (
    <div
      onClick={() => onPlaceClick?.(result)}
      className="h-[110.665px] relative rounded-[10px] shrink-0 w-full cursor-pointer backdrop-blur-lg transition-all hover:scale-[1.02] border border-white/30 shadow-lg"
      style={{
        backgroundColor: result.backgroundColor,
      }}
    >
      <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex gap-[11.996px] items-start pb-[3.338px] pt-[23.335px] px-[23.335px] relative size-full">
        {/* 아이콘 */}
        <div className="bg-white/90 backdrop-blur-lg relative shrink-0 size-[63.996px] rounded-[10px] border border-white/40 shadow-md">
          <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex items-center justify-center relative size-full">
            <p className="font-['Pretendard',sans-serif] font-bold leading-[45px] text-[#0a0a0a] text-[30px] text-center">
              {result.icon}
            </p>
          </div>
        </div>

        {/* 장소 이름 */}
        <div className="flex-[1_0_0] min-h-px min-w-px relative">
          <div className="bg-clip-padding border-0 border-transparent border-solid content-stretch flex flex-col items-start relative w-full">
            <p className="font-['Pretendard',sans-serif] font-bold leading-[20px] text-[17px] text-black text-left w-full overflow-hidden text-ellipsis whitespace-nowrap drop-shadow-sm">
              {result.name}
            </p>
            {(() => {
              const { status, distance } = buildSubline(result);
              return (
                <>
                  {status && (
                    <p className="font-['Pretendard',sans-serif] font-medium leading-[18px] text-[14px] text-black/80 text-left mt-2 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      {status}
                    </p>
                  )}
                  {distance && (
                    <p className="font-['Pretendard',sans-serif] font-medium leading-[18px] text-[14px] text-black/70 text-left mt-1 w-full overflow-hidden text-ellipsis whitespace-nowrap">
                      {distance}
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        </div>

        {/* 즐겨찾기 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFavorite(result.id);
          }}
          className="bg-white relative rounded-[14px] shrink-0 size-[48px] transition-all hover:bg-white active:scale-95 border border-white/40 shadow-md flex items-center justify-center"
        >
          <img
            src={result.isFavorited ? favoriteStarFilled : favoriteStarEmpty}
            alt={result.isFavorited ? "즐겨찾기됨" : "즐겨찾기 안됨"}
            className="size-[36px] object-contain pointer-events-none"
          />
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
          <div className="w-8 h-8 rounded-full animate-spin backdrop-blur-sm"
            style={{
              border: "3px solid rgba(74, 153, 96, 0.3)",
              borderTop: "3px solid rgba(74, 153, 96, 0.9)",
              boxShadow: "0 4px 16px 0 rgba(74, 153, 96, 0.2)"
            }}
          />
        </div>
      )}

      {/* 에러 상태 */}
      {error && !isLoading && (
        <div className="text-center py-8">
          <div className="inline-block bg-red-100/90 backdrop-blur-lg border border-red-300 rounded-[10px] px-4 py-2 shadow-lg">
            <p className="font-['Pretendard',sans-serif] font-bold text-red-600 drop-shadow-sm">{error}</p>
          </div>
        </div>
      )}

      {/* 빈 결과 */}
      {!isLoading && !error && searchResults.length === 0 && searchQuery && (
        <div className="text-center py-8">
          <div className="inline-block bg-white/90 backdrop-blur-lg border border-black/20 rounded-[10px] px-4 py-2 shadow-lg">
            <p className="font-['Pretendard',sans-serif] font-medium text-gray-600 drop-shadow-sm">"{searchQuery}"에 대한 검색 결과가 없습니다.</p>
          </div>
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
          className="w-full py-4 text-black font-bold rounded-[10px] border border-white/40 backdrop-blur-md bg-gradient-to-r from-green-500/60 to-green-400/60 hover:from-green-500/80 hover:to-green-400/80 cursor-pointer active:scale-95 transition-all shadow-lg"
        >
          <span className="font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold text-[18px] drop-shadow-md">
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
          <div className="fixed left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl text-sm"
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
          <div className="relative px-8 pt-6 pb-4 border-b border-white/30 bg-gradient-to-r from-cyan-500/30 to-blue-500/30 backdrop-blur-lg">
            <button
              onClick={onClose}
              className="absolute top-6 right-8 bg-white/40 backdrop-blur-md rounded-[12px] size-[48px] flex items-center justify-center border border-white/50 shadow-lg hover:bg-white/50 active:bg-white/60 transition-all z-10"
              title="뒤로가기"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="rgba(0,0,0,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="font-['DNFBitBitv2',sans-serif] font-bold leading-[30px] text-[16px] text-white text-center drop-shadow-md">
              검색 결과
            </p>
            {searchQuery && (
              <p className="font-['Pretendard',sans-serif] font-medium leading-[20px] text-[12px] text-white/90 text-center mt-2 drop-shadow-md">
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
