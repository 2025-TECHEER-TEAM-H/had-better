import { useState, useEffect, useRef } from "react";
import { PlaceDetailPage } from "@/app/components/PlaceDetailPage";
import { SearchResultsPage } from "@/app/components/SearchResultsPage";
import placeService from "@/services/placeService";
import { useUserDistance } from "@/hooks/useUserDistance";
import favoriteStarEmpty from "@/assets/favorite-star-empty.png";
import favoriteStarFilled from "@/assets/favorite-star-filled.png";

// 카테고리별 아이콘 이미지 import
import iconCafe from "@/assets/icons/cafe_emoji.png";
import iconRestaurant from "@/assets/icons/restaurant_emoji.png";
import iconConvenience from "@/assets/icons/convenience.png";
import iconHospital from "@/assets/icons/hospital_emoji.png";
import iconPharmacy from "@/assets/icons/pharmacy_emoji.png";
import iconPark from "@/assets/icons/park_emoji.png";
import iconSchool from "@/assets/icons/school_emoji.png";
import iconBank from "@/assets/icons/bank_emoji.png";
import iconGas from "@/assets/icons/gas_emoji.png";
import iconParking from "@/assets/icons/parking_emoji.png";
import iconSubway from "@/assets/icons/subway_emoji.png";
import iconBus from "@/assets/icons/bus_emoji.png";
import iconHotel from "@/assets/icons/hotel_emoji.png";
import iconMarket from "@/assets/icons/market_emoji.png";
import iconMall from "@/assets/icons/mall_emoji.png";
import iconDefault from "@/assets/icons/default_emoji.png";

interface FavoritePlace {
  id: number;
  savedPlaceId: number;
  name: string;
  address: string;
  distance: string;
  icon: string;
  isFavorited: boolean;
  category?: string | null;
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

// [현재 사용중 - 이모지 버전]
// 카테고리별 아이콘 매핑 (SearchResultsPage와 동일 로직)
const getCategoryIcon = (category: string | null): string => {
  const c = (category || "").toLowerCase();
  const hasAny = (tokens: string[]) => tokens.some((t) => c.includes(t));

  // NOTE: 백엔드 category는 TMap mlClass 기반이라 포맷이 제각각일 수 있음.
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
  if (hasAny(["지하철", "subway", "metro", "train", "rail"])) return "🚉";
  if (hasAny(["버스", "bus"])) return "🚌";
  if (hasAny(["호텔", "숙박", "hotel", "motel", "hostel"])) return "🏨";
  if (hasAny(["마트", "market", "grocery", "supermarket"])) return "🛒";
  if (hasAny(["백화점", "department", "mall", "쇼핑"])) return "🏬";

  return "📍";
};

// [주석처리 - 흑백 아이콘 이미지 버전]
// 카테고리별 아이콘 매핑 (이미지 경로 반환)
// const getCategoryIcon = (category: string | null): string => {
//   const c = (category || "").toLowerCase();
//   const hasAny = (tokens: string[]) => tokens.some((t) => c.includes(t));
//
//   if (hasAny(["카페", "커피", "coffee", "cafe", "베이커리", "디저트"])) return iconCafe;
//   if (hasAny(["음식", "음식점", "식당", "restaurant", "dining", "한식", "중식", "일식", "양식", "패스트푸드"])) return iconRestaurant;
//   if (hasAny(["편의점", "convenience", "cvs"])) return iconConvenience;
//   if (hasAny(["병원", "의원", "clinic", "hospital", "응급", "의료"])) return iconHospital;
//   if (hasAny(["약국", "pharmacy", "drugstore"])) return iconPharmacy;
//   if (hasAny(["공원", "park", "산", "등산", "숲", "자연"])) return iconPark;
//   if (hasAny(["학교", "대학", "대학교", "univ", "university", "school", "학원"])) return iconSchool;
//   if (hasAny(["은행", "bank", "atm"])) return iconBank;
//   if (hasAny(["주유", "주유소", "gas", "fuel", "station"])) return iconGas;
//   if (hasAny(["주차", "parking"])) return iconParking;
//   if (hasAny(["지하철", "subway", "metro", "train", "rail"])) return iconSubway;
//   if (hasAny(["버스", "bus"])) return iconBus;
//   if (hasAny(["호텔", "숙박", "hotel", "motel", "hostel"])) return iconHotel;
//   if (hasAny(["마트", "market", "grocery", "supermarket"])) return iconMarket;
//   if (hasAny(["백화점", "department", "mall", "쇼핑"])) return iconMall;
//
//   return iconDefault; // 기본 아이콘
// };

export function FavoritesPlaces({ isOpen, onClose, onNavigate, onOpenDashboard, onOpenSubway }: FavoritesPlacesProps) {
  const [favorites, setFavorites] = useState<FavoritePlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<FavoritePlace | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSearchResultsOpen, setIsSearchResultsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // GPS 거리 계산
  const { getDistanceTo, formatDistance } = useUserDistance();

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
        
        const detailResults = await Promise.allSettled(
          generalFavorites.map((savedPlace) => placeService.getPlaceDetail(savedPlace.poi_place.poi_place_id))
        );
        const categoryMap = new Map<number, string | null>();
        detailResults.forEach((result, index) => {
          const poiPlaceId = generalFavorites[index].poi_place.poi_place_id;
          if (result.status === "fulfilled" && result.value.status === "success" && result.value.data) {
            categoryMap.set(poiPlaceId, result.value.data.category || null);
          }
        });

        const favoritePlaces: FavoritePlace[] = generalFavorites.map((savedPlace) => {
          const poiPlaceId = savedPlace.poi_place.poi_place_id;
          const category = categoryMap.get(poiPlaceId) ?? savedPlace.category;
          return {
            id: poiPlaceId,
            savedPlaceId: savedPlace.saved_place_id,
            name: savedPlace.poi_place.name,
            address: savedPlace.poi_place.address,
            distance: "", // GPS 거리는 렌더링 시 계산
            icon: getCategoryIcon(category),
            isFavorited: true,
            category,
            coordinates: savedPlace.poi_place.coordinates,
          };
        });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 hb-favorites-popup">
      <style>
        {`
          .hb-favorites-popup .hb-favorites-shell {
            position: relative;
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 600;
          }

          .hb-favorites-popup .hb-favorites-glass {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.28) 100%);
            border: 1px solid rgba(255,255,255,0.68);
            box-shadow: 0 16px 32px rgba(90,120,130,0.16), inset 0 1px 0 rgba(255,255,255,0.5);
            backdrop-filter: blur(18px) saturate(160%);
            -webkit-backdrop-filter: blur(18px) saturate(160%);
          }

          .hb-favorites-popup .hb-favorites-shell.hb-favorites-glass {
            background: #d4ebf7;
          }

          .hb-favorites-popup .hb-favorites-glass-fun::before {
            content: "";
            position: absolute;
            inset: -30% -40%;
            pointer-events: none;
            background: linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 45%, rgba(255,255,255,0) 60%);
            opacity: 0;
            animation: hb-favorites-sheen 12.5s ease-in-out infinite;
          }

          @keyframes hb-favorites-sheen {
            0% { transform: translateX(-40%) translateY(-10%) rotate(12deg); opacity: 0; }
            12% { opacity: 0.55; }
            50% { opacity: 0.35; }
            100% { transform: translateX(140%) translateY(10%) rotate(12deg); opacity: 0; }
          }

          .hb-favorites-popup .hb-favorites-title {
            font-family: 'DNFBitBitv2', 'Press Start 2P', sans-serif;
            letter-spacing: 0.6px;
            font-weight: normal;
          }

          .hb-favorites-popup .hb-favorites-chip {
            background: linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.42) 100%);
            border: 1px solid rgba(255,255,255,0.72);
            box-shadow: 0 10px 20px rgba(90,120,130,0.12), inset 0 1px 0 rgba(255,255,255,0.5);
            backdrop-filter: blur(16px) saturate(155%);
            -webkit-backdrop-filter: blur(16px) saturate(155%);
          }

          .hb-favorites-popup .hb-favorites-card {
            background: linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.4) 100%);
            border: 1px solid rgba(255,255,255,0.7);
            box-shadow: 0 14px 28px rgba(90,120,130,0.16), inset 0 1px 0 rgba(255,255,255,0.46);
            backdrop-filter: blur(18px) saturate(160%);
            -webkit-backdrop-filter: blur(18px) saturate(160%);
          }

          .hb-favorites-popup .hb-favorites-card::after {
            content: "";
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.22);
            pointer-events: none;
          }

          .hb-favorites-popup .hb-favorites-pressable {
            transition: transform 140ms ease-out, filter 140ms ease-out;
            will-change: transform, filter;
          }

          .hb-favorites-popup .hb-favorites-pressable:active {
            transform: translateY(1px) scale(0.985);
            filter: brightness(1.04);
          }

          .hb-favorites-popup .hb-favorites-scroll::-webkit-scrollbar {
            width: 8px;
          }
          .hb-favorites-popup .hb-favorites-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .hb-favorites-popup .hb-favorites-scroll::-webkit-scrollbar-thumb {
            background: rgba(107, 144, 128, 0.28);
            border-radius: 12px;
          }

          @media (prefers-reduced-motion: reduce) {
            .hb-favorites-popup .hb-favorites-glass-fun::before {
              animation: none !important;
            }
            .hb-favorites-popup .hb-favorites-pressable {
              transition: none !important;
            }
            .hb-favorites-popup .hb-favorites-pressable:active {
              transform: none !important;
              filter: none !important;
            }
          }
        `}
      </style>
      {toastMessage && (
        <div className="fixed left-1/2 top-1/2 z-[100] -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg text-sm whitespace-normal break-keep max-w-[420px] text-center leading-tight">
          {toastMessage}
        </div>
      )}
      {isOpen && (
        <div
          className="hb-favorites-shell w-full max-w-[400px] h-[90vh] max-h-[840px] rounded-[22px] overflow-hidden relative hb-favorites-glass hb-favorites-glass-fun"
          onClick={(e) => e.stopPropagation()}
        >
        {/* 헤더 */}
        <div className="relative px-6 pt-5 pb-4">
          {/* 타이틀 */}
          <div className="hb-favorites-glass rounded-[16px] h-[44px] flex items-center justify-center mb-4">
            <p className="hb-favorites-title text-[16px] text-black">
              즐겨찾기
            </p>
          </div>

          {/* 닫기 버튼 - 타이틀과 같은 높이에 위치 */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-6 hb-favorites-chip hb-favorites-pressable rounded-[14px] size-[44px] flex items-center justify-center text-black"
          >
            <span className="font-['Press_Start_2P:Regular',sans-serif] text-[14px]">✕</span>
          </button>
        </div>

        {/* 리스트 영역 */}
        <div className="hb-favorites-scroll px-5 pb-6 overflow-y-auto h-[calc(100%-92px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-[#4a9960] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-8">
              <p className="font-['Pretendard',sans-serif] font-medium text-gray-700 text-[12px]">
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
                className="hb-favorites-card hb-favorites-pressable rounded-[18px] p-4 relative cursor-pointer"
              >
                {/* 아이콘과 정보 */}
                <div className="flex gap-4 items-start">
                  {/* 아이콘 */}
                  <div className="hb-favorites-chip rounded-[14px] size-[56px] flex items-center justify-center shrink-0">
                    {/* [현재 사용중 - 이모지 버전] */}
                    <p className="text-[34px] leading-[40px]">{place.icon}</p>
                    {/* [주석처리 - 아이콘 이미지 버전] */}
                    {/* <img src={place.icon} alt="" className="w-[32px] h-[32px] object-contain" /> */}
                  </div>

                  {/* 장소 정보 */}
                  <div className="flex-1 pt-2">
                    <p className="font-['Pretendard',sans-serif] font-bold text-[16px] text-[#111827] leading-[18px] mb-1">
                      {place.name}
                    </p>
                    <p className="font-['Pretendard',sans-serif] font-medium text-[12px] text-[#375a4e] leading-[14px] mb-2">
                      {place.address}
                    </p>
                    <div className="hb-favorites-chip rounded-[999px] inline-flex items-center px-3 py-1.5">
                      <p className="font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] text-[8px] text-[#2d5f3f] leading-[10px]">
                        {place.coordinates
                          ? formatDistance(getDistanceTo(place.coordinates.lon, place.coordinates.lat))
                          : place.distance || "-"}
                      </p>
                    </div>
                  </div>

                  {/* 즐겨찾기 버튼 */}
                  <button
                    onClick={(e) => toggleFavorite(place.id, e)}
                    className="hb-favorites-chip hb-favorites-pressable rounded-[14px] size-[48px] flex items-center justify-center shrink-0"
                    style={{ background: "#ffffff" }}
                  >
                    <img
                      src={place.isFavorited ? favoriteStarFilled : favoriteStarEmpty}
                      alt={place.isFavorited ? "즐겨찾기됨" : "즐겨찾기 안됨"}
                      className="size-[30px] object-contain pointer-events-none"
                    />
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
              distance: result.distance || "", // GPS 거리는 렌더링 시 계산
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