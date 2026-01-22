import { useState, useEffect, useRef } from "react";
import { PlaceDetailPage } from "@/app/components/PlaceDetailPage";
import { SearchResultsPage } from "@/app/components/SearchResultsPage";
import placeService from "@/services/placeService";

interface FavoritePlace {
  id: number;
  savedPlaceId: number;
  name: string;
  address: string;
  distance: string;
  icon: string;
  isFavorited: boolean;
  coordinates?: {
    lon: number;
    lat: number;
  };
}

interface FavoritesPlacesProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string) => void;
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

// 카테고리별 아이콘 매핑
const getCategoryIcon = (category: string | null): string => {
  const iconMap: Record<string, string> = {
    home: "🏠",
    work: "💼",
    school: "🏫",
  };
  return iconMap[category || ""] || "📍";
};

export function FavoritesPlaces({ isOpen, onClose, onNavigate, onOpenDashboard, onOpenSubway }: FavoritesPlacesProps) {
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<FavoritePlace | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // 초기 즐겨찾기 상태 저장 (창을 닫을 때 변경사항 확인용)
  const [initialFavoritesState, setInitialFavoritesState] = useState<Map<number, boolean>>(new Map());

  // 토스트 메시지
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 1500);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // 즐겨찾기 목록 로드 함수
  const loadFavorites = async () => {
    if (!isOpen) return;
    
    setIsLoading(true);
    try {
      const response = await placeService.getSavedPlaces();
      if (response.status === "success" && response.data) {
        // category가 null인 것만 필터링 (집/회사/학교는 제외)
        const generalFavorites = response.data.filter(
          (savedPlace) => savedPlace.category === null
        );
        
        const favoritePlaces: FavoritePlace[] = generalFavorites.map((savedPlace) => ({
          id: savedPlace.poi_place.poi_place_id,
          savedPlaceId: savedPlace.saved_place_id,
          name: savedPlace.poi_place.name,
          address: savedPlace.poi_place.address,
          distance: "거리", // TODO: 거리 계산 필요 시 추가
          icon: getCategoryIcon(savedPlace.category),
          isFavorited: true,
          coordinates: savedPlace.poi_place.coordinates,
        }));
        setFavorites(favoritePlaces);
        
        // 초기 상태 저장 (모두 true)
        const initialState = new Map<number, boolean>();
        favoritePlaces.forEach((place) => {
          initialState.set(place.id, true);
        });
        setInitialFavoritesState(initialState);
      }
    } catch (err) {
      console.error("즐겨찾기 목록 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 즐겨찾기 목록 로드 (모달 열릴 때 한 번만)
  // 팝업이 열려 있는 동안에는 로컬 상태(favorites)를 기준으로 토글만 왔다 갔다 하고,
  // 닫을 때(handleClose) 실제 삭제/동기화를 처리한다.
  useEffect(() => {
    if (isOpen) {
      loadFavorites();
    }
  }, [isOpen]);

  // 즐겨찾기 토글 (즉시 API 호출)
  const toggleFavorite = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();

    const place = favorites.find((p) => p.id === id);
    if (!place) return;

    const next = !place.isFavorited;
    const particle = getSubjectParticle(place.name);

    // 로컬 상태 먼저 업데이트 (낙관적 UI)
    setFavorites((prev) =>
      prev.map((p) => (p.id !== id ? p : { ...p, isFavorited: next }))
    );

    // selectedPlace도 업데이트
    if (selectedPlace && selectedPlace.id === id) {
      setSelectedPlace({ ...selectedPlace, isFavorited: next });
    }

    if (!next) {
      // 즐겨찾기 해제: 클릭 즉시 토스트, 서버에는 삭제 요청
      showToast(`${place.name}${particle} 즐겨찾기에서 삭제됐습니다.`);

      try {
        await placeService.deleteSavedPlace(place.savedPlaceId);
        // 삭제 성공 시 initialFavoritesState도 업데이트 (중복 호출 방지)
        setInitialFavoritesState((prev) => {
          const newState = new Map(prev);
          newState.set(id, false);
          return newState;
        });

        // 다른 페이지(SearchResultsPage, PlaceDetailPage 등)와 동기화
        window.dispatchEvent(
          new CustomEvent("favoritesUpdated", {
            detail: { deletedPoiIds: [id] },
          })
        );
      } catch (err: any) {
        // 404는 이미 삭제된 것이므로 성공으로 처리
        if (err?.response?.status === 404) {
          setInitialFavoritesState((prev) => {
            const newState = new Map(prev);
            newState.set(id, false);
            return newState;
          });

          // 이미 삭제된 경우라도 동기화 이벤트는 날려서 프론트 상태를 맞춰준다
          window.dispatchEvent(
            new CustomEvent("favoritesUpdated", {
              detail: { deletedPoiIds: [id] },
            })
          );
        } else {
          // 실패 시 롤백
          console.error("즐겨찾기 삭제 실패:", err);
          setFavorites((prev) =>
            prev.map((p) => (p.id !== id ? p : { ...p, isFavorited: true }))
          );
          if (selectedPlace && selectedPlace.id === id) {
            setSelectedPlace({ ...selectedPlace, isFavorited: true });
          }
          // 실패한 경우에는 에러 토스트로 덮어쓴다
          showToast("삭제에 실패했습니다. 다시 시도해주세요.");
        }
      }
    } else {
      // 즐겨찾기 추가: 서버에도 즉시 반영
      showToast(`${place.name}${particle} 즐겨찾기에 추가됐습니다.`);
      try {
        const response = await placeService.addSavedPlace({ poi_place_id: id });
        if (response.status === "success" && response.data) {
          // 새 savedPlaceId를 반영
          setFavorites((prev) =>
            prev.map((p) =>
              p.id !== id ? p : { ...p, savedPlaceId: response.data!.saved_place_id, isFavorited: true }
            )
          );
          setInitialFavoritesState((prev) => {
            const newState = new Map(prev);
            newState.set(id, true);
            return newState;
          });

          // 다른 페이지들과 동기화
          window.dispatchEvent(
            new CustomEvent("favoritesUpdated", {
              detail: { addedPoiId: id, savedPlaceId: response.data.saved_place_id },
            })
          );
        } else if (response.status === "error" && response.error?.code === "RESOURCE_CONFLICT") {
          // 이미 서버에 즐겨찾기가 있는 경우: 목록 재로딩으로 정합성 맞춤
          loadFavorites();
        } else {
          // 실패 시 롤백
          setFavorites((prev) =>
            prev.map((p) => (p.id !== id ? p : { ...p, isFavorited: false }))
          );
          if (selectedPlace && selectedPlace.id === id) {
            setSelectedPlace({ ...selectedPlace, isFavorited: false });
          }
          showToast("즐겨찾기 추가에 실패했습니다. 다시 시도해주세요.");
        }
      } catch (err) {
        console.error("즐겨찾기 추가 실패:", err);
        setFavorites((prev) =>
          prev.map((p) => (p.id !== id ? p : { ...p, isFavorited: false }))
        );
        if (selectedPlace && selectedPlace.id === id) {
          setSelectedPlace({ ...selectedPlace, isFavorited: false });
        }
        showToast("즐겨찾기 추가에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  const toggleFavoriteById = async (id: string) => {
    const numId = parseInt(id);
    const place = favorites.find((p) => p.id === numId);
    if (!place) return;

    const next = !place.isFavorited;
    const particle = getSubjectParticle(place.name);

    // 로컬 상태 먼저 업데이트 (낙관적 UI)
    setFavorites((prev) =>
      prev.map((p) => (p.id !== numId ? p : { ...p, isFavorited: next }))
    );

    // selectedPlace도 업데이트
    if (selectedPlace && selectedPlace.id === numId) {
      setSelectedPlace({ ...selectedPlace, isFavorited: next });
    }

    if (!next) {
      // 즐겨찾기 해제: 클릭 즉시 토스트, 서버에는 삭제 요청
      showToast(`${place.name}${particle} 즐겨찾기에서 삭제됐습니다.`);

      try {
        await placeService.deleteSavedPlace(place.savedPlaceId);
        // 삭제 성공 시 initialFavoritesState도 업데이트 (중복 호출 방지)
        setInitialFavoritesState((prev) => {
          const newState = new Map(prev);
          newState.set(numId, false);
          return newState;
        });

        // 다른 페이지(SearchResultsPage, PlaceDetailPage 등)와 동기화
        window.dispatchEvent(
          new CustomEvent("favoritesUpdated", {
            detail: { deletedPoiIds: [numId] },
          })
        );
      } catch (err: any) {
        // 404는 이미 삭제된 것이므로 성공으로 처리
        if (err?.response?.status === 404) {
          setInitialFavoritesState((prev) => {
            const newState = new Map(prev);
            newState.set(numId, false);
            return newState;
          });

          // 이미 삭제된 경우라도 동기화 이벤트는 날려서 프론트 상태를 맞춰준다
          window.dispatchEvent(
            new CustomEvent("favoritesUpdated", {
              detail: { deletedPoiIds: [numId] },
            })
          );
        } else {
          // 실패 시 롤백
          console.error("즐겨찾기 삭제 실패:", err);
          setFavorites((prev) =>
            prev.map((p) => (p.id !== numId ? p : { ...p, isFavorited: true }))
          );
          if (selectedPlace && selectedPlace.id === numId) {
            setSelectedPlace({ ...selectedPlace, isFavorited: true });
          }
          // 실패한 경우에는 에러 토스트로 덮어쓴다
          showToast("삭제에 실패했습니다. 다시 시도해주세요.");
        }
      }
    } else {
      // 즐겨찾기 추가: 서버에도 즉시 반영
      showToast(`${place.name}${particle} 즐겨찾기에 추가됐습니다.`);
      try {
        const response = await placeService.addSavedPlace({ poi_place_id: numId });
        if (response.status === "success" && response.data) {
          // 새 savedPlaceId를 반영
          setFavorites((prev) =>
            prev.map((p) =>
              p.id !== numId ? p : { ...p, savedPlaceId: response.data!.saved_place_id, isFavorited: true }
            )
          );
          setInitialFavoritesState((prev) => {
            const newState = new Map(prev);
            newState.set(numId, true);
            return newState;
          });

          // 다른 페이지들과 동기화
          window.dispatchEvent(
            new CustomEvent("favoritesUpdated", {
              detail: { addedPoiId: numId, savedPlaceId: response.data.saved_place_id },
            })
          );
        } else if (response.status === "error" && response.error?.code === "RESOURCE_CONFLICT") {
          // 이미 서버에 즐겨찾기가 있는 경우: 목록 재로딩으로 정합성 맞춤
          loadFavorites();
        } else {
          // 실패 시 롤백
          setFavorites((prev) =>
            prev.map((p) => (p.id !== numId ? p : { ...p, isFavorited: false }))
          );
          if (selectedPlace && selectedPlace.id === numId) {
            setSelectedPlace({ ...selectedPlace, isFavorited: false });
          }
          showToast("즐겨찾기 추가에 실패했습니다. 다시 시도해주세요.");
        }
      } catch (err) {
        console.error("즐겨찾기 추가 실패:", err);
        setFavorites((prev) =>
          prev.map((p) => (p.id !== numId ? p : { ...p, isFavorited: false }))
        );
        if (selectedPlace && selectedPlace.id === numId) {
          setSelectedPlace({ ...selectedPlace, isFavorited: false });
        }
        showToast("즐겨찾기 추가에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 창을 닫을 때 변경사항 저장
  const handleClose = async () => {
    // 변경사항 확인: isFavorited가 false로 변경된 항목 찾기
    const toDelete: number[] = [];
    const deletedPoiIds: number[] = []; // SearchResultsPage 동기화용
    const removedNames: string[] = [];
    
    favorites.forEach((place) => {
      const initialState = initialFavoritesState.get(place.id);
      // 초기에는 true였는데 현재 false인 경우 삭제
      if (initialState === true && !place.isFavorited) {
        toDelete.push(place.savedPlaceId);
        deletedPoiIds.push(place.id); // poi_place_id 저장
        removedNames.push(place.name);
      }
    });

    let shouldDelayClose = false;

    // 삭제할 항목이 있으면 API 호출
    if (toDelete.length > 0) {
      // 요청별로 성공/실패를 나눠 처리 (이미 삭제된 404는 무시)
      const results = await Promise.allSettled(
        toDelete.map((savedPlaceId) => placeService.deleteSavedPlace(savedPlaceId))
      );

      const hasUnexpectedError = results.some((res) => {
        if (res.status === "fulfilled") return false;
        const axiosErr: any = res.reason;
        // 404 (이미 삭제됨) 는 무시
        return axiosErr?.response?.status !== 404;
      });

      if (hasUnexpectedError) {
        const errors = results.filter((r) => r.status === "rejected");
        console.error("즐겨찾기 삭제 실패:", errors);
      }

      // 성공 또는 404 무시 후, 동기화 이벤트 발생
      window.dispatchEvent(
        new CustomEvent("favoritesUpdated", {
          detail: { deletedPoiIds },
        })
      );

      // 실시간 토글 시 이미 토스트를 보여주므로 여기서는 별도 토스트를 띄우지 않음
    }

    // 토스트를 보여줘야 하면 1초 후 닫기, 아니면 바로 닫기
    if (shouldDelayClose) {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
      closeTimerRef.current = window.setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      onClose();
    }
  };

  const handlePlaceClick = (place: FavoritePlace) => {
    setSelectedPlace(place);
    setIsDetailOpen(true);
  };

  if (!isOpen && !toastMessage) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {toastMessage && (
        <div className="fixed left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-normal break-keep max-w-[420px] text-center leading-tight">
          {toastMessage}
        </div>
      )}
      {isOpen && (
        <div
          className="bg-gradient-to-b from-[#daf4ff] to-white w-full max-w-[388px] h-[838px] max-h-[90vh] rounded-[40px] overflow-hidden relative shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
        {/* 헤더 */}
        <div className="relative px-8 pt-[18px] pb-4">
          {/* 타이틀 배경 */}
          <div className="bg-white border-2 border-black rounded-[16px] h-[42px] flex items-center justify-center mb-6">
            <p className="font-['Wittgenstein:Bold_Italic','Noto_Sans_KR:Bold',sans-serif] font-bold italic text-[20px] text-black">
              자주 가는 곳
            </p>
          </div>

          {/* 뒤로가기 버튼 */}
          <button
            onClick={handleClose}
            className="absolute top-[18px] right-8 bg-white rounded-[14px] size-[40px] flex items-center justify-center border-[2.693px] border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-50 active:shadow-[0px_2px_0px_0px_rgba(0,0,0,0.3)] active:translate-y-[2px] transition-all"
          >
            <p className="font-['Press_Start_2P:Regular',sans-serif] text-[16px] text-black">←</p>
          </button>
        </div>

        {/* 리스트 영역 */}
        <div className="px-5 pb-6 overflow-y-auto h-[calc(100%-90px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#4a9960] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] text-[14px]">
                즐겨찾기한 장소가 없습니다.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {favorites.map((place) => (
                // isFavorited가 false여도 목록에 표시 (창을 닫을 때까지 유지)
              <div
                key={place.id}
                onClick={() => handlePlaceClick(place)}
                className="bg-white rounded-[12px] border-[3.366px] border-black shadow-[4px_4px_0px_0px_black] p-5 relative hover:shadow-[6px_6px_0px_0px_black] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all cursor-pointer"
              >
                {/* 아이콘과 정보 */}
                <div className="flex gap-4 items-start">
                  {/* 아이콘 */}
                  <div className="bg-gradient-to-b from-[#ffd93d] to-[#ffed4e] rounded-[10px] size-[56px] flex items-center justify-center border-[1.346px] border-black shrink-0">
                    <p className="text-[28px] leading-[42px]">{place.icon}</p>
                  </div>

                  {/* 장소 정보 */}
                  <div className="flex-1 pt-2">
                    <p className="font-['Wittgenstein:Bold_Italic','Noto_Sans_KR:Bold',sans-serif] font-bold italic text-[20px] text-black leading-[14px] mb-2">
                      {place.name}
                    </p>
                    <p className="font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] text-[10px] text-[#6b9080] leading-[11px] mb-2">
                      {place.address}
                    </p>
                    <div className="bg-[rgba(0,217,255,0.2)] border-[1.346px] border-[#00d9ff] rounded-[4px] inline-flex items-center px-[9px] py-[5px]">
                      <p className="font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[6px] text-[#00d9ff] leading-[9px]">
                        {place.distance}
                      </p>
                    </div>
                  </div>

                  {/* 즐겨찾기 버튼 */}
                  <button
                    onClick={(e) => toggleFavorite(place.id, e)}
                    className="bg-white rounded-[14px] size-[48px] flex items-center justify-center border-[2.693px] border-black shadow-[4px_4px_0px_0px_black] hover:bg-gray-50 active:shadow-[2px_2px_0px_0px_black] active:translate-x-[2px] active:translate-y-[2px] transition-all shrink-0"
                  >
                    <p className="text-[32px] leading-[48px]">
                      {place.isFavorited ? "⭐" : "☆"}
                    </p>
                  </button>
                </div>
              </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* 장소 상세 정보 모달 */}
      {isDetailOpen && selectedPlace && (
        <PlaceDetailPage
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          place={{
            id: selectedPlace.id.toString(),
            name: selectedPlace.name,
            address: selectedPlace.address,
            distance: selectedPlace.distance,
            icon: selectedPlace.icon,
            isFavorited: selectedPlace.isFavorited,
            coordinates: selectedPlace.coordinates,
            _poiPlaceId: selectedPlace.id, // POI Place ID 전달 (id가 poi_place_id)
          }}
          onToggleFavorite={toggleFavoriteById}
          onStartNavigation={() => {
            setIsDetailOpen(false);
            onNavigate?.("route");
          }}
          onSearchSubmit={(query) => {
            setSearchQuery(query);
            setIsDetailOpen(false);
            setIsSearchResultsOpen(true);
          }}
          onNavigate={onNavigate}
          onOpenDashboard={onOpenDashboard}
          onOpenSubway={onOpenSubway}
        />
      )}

      {/* 검색 결과 모달 */}
      {isSearchResultsOpen && (
        <SearchResultsPage
          isOpen={isSearchResultsOpen}
          onClose={() => setIsSearchResultsOpen(false)}
          searchQuery={searchQuery}
          onPlaceClick={(result) => {
            // 검색 결과를 FavoritePlace 형식으로 변환
            const place: FavoritePlace = {
              id: parseInt(result.id),
              savedPlaceId: 0, // 검색 결과에서는 savedPlaceId를 모르므로 0으로 설정
              name: result.name,
              address: result.status || "주소 없음",
              distance: result.distance || "거리",
              icon: result.icon,
              isFavorited: result.isFavorited || false,
              coordinates: result.coordinates,
            };
            setIsSearchResultsOpen(false);
            handlePlaceClick(place);
          }}
        />
      )}
    </div>
  );
}