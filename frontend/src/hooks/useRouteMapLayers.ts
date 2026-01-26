import { MapViewRef } from "@/app/components/MapView";
import { addBusLayers, addBusRoutePath, clearAllBusRoutePaths, clearBusData, updateAllBusPositions } from "@/components/map/busLayer";
import { addSubwayLayers, removeSubwayLayers } from "@/components/map/subwayLayer";
import { getBusRoutePath as fetchBusRoutePath, trackBusPositions } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export type MapStyleType = "default" | "dark" | "satellite-streets";

export const MAP_STYLES: Record<MapStyleType, { url: string; name: string; icon: string }> = {
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

export function useRouteMapLayers(mapViewRef: React.RefObject<MapViewRef>) {
  const [mapStyle, setMapStyle] = useState<MapStyleType>("default");
  const [isLayerPopoverOpen, setIsLayerPopoverOpen] = useState(false);
  const [is3DBuildingsEnabled, setIs3DBuildingsEnabled] = useState(false);
  const [isSubwayLinesEnabled, setIsSubwayLinesEnabled] = useState(false);
  const [isBusLinesEnabled, setIsBusLinesEnabled] = useState(false);
  const [showBusInputModal, setShowBusInputModal] = useState(false);
  const [busNumberInput, setBusNumberInput] = useState("");
  const [trackedBusNumbers, setTrackedBusNumbers] = useState<string[]>([]);

  // 3D 건물 레이어 관리
  const add3DBuildingsLayer = useCallback(() => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance || mapInstance.getLayer("3d-buildings")) return;

    if (!mapInstance.getSource("junggu-buildings")) {
      mapInstance.addSource("junggu-buildings", {
        type: "geojson",
        data: "/junggu_buildings.geojson",
      });
    }

    mapInstance.addLayer({
      id: "3d-buildings",
      source: "junggu-buildings",
      type: "fill-extrusion",
      minzoom: 13,
      paint: {
        "fill-extrusion-color": [
          "interpolate",
          ["linear"],
          ["get", "height"],
          0, "#d4e6d7",
          10, "#a8d4ae",
          20, "#7bc47f",
          50, "#4a9960",
          100, "#2d5f3f",
        ],
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": 0.75,
      },
    });
  }, [mapViewRef]);

  const remove3DBuildingsLayer = useCallback(() => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance) return;
    if (mapInstance.getLayer("3d-buildings")) mapInstance.removeLayer("3d-buildings");
    if (mapInstance.getSource("junggu-buildings")) mapInstance.removeSource("junggu-buildings");
  }, [mapViewRef]);

  const handle3DBuildingsToggle = useCallback(() => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;

    const newState = !is3DBuildingsEnabled;
    setIs3DBuildingsEnabled(newState);

    if (newState) {
      add3DBuildingsLayer();
      mapInstance.easeTo({ pitch: 45, duration: 500 });
    } else {
      remove3DBuildingsLayer();
      mapInstance.easeTo({ pitch: 0, duration: 500 });
    }
  }, [is3DBuildingsEnabled, add3DBuildingsLayer, remove3DBuildingsLayer, mapViewRef]);

  // 지도 스타일 변경
  const handleStyleChange = useCallback((style: MapStyleType) => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance || !mapInstance.isStyleLoaded()) return;

    const center = mapInstance.getCenter();
    const zoom = mapInstance.getZoom();
    const bearing = mapInstance.getBearing();
    const pitch = mapInstance.getPitch();

    mapInstance.setStyle(MAP_STYLES[style].url, { diff: false } as any);

    mapInstance.once("style.load", () => {
      if (!mapInstance) return;
      mapInstance.jumpTo({ center, zoom, bearing, pitch });

      // 한국어 라벨 설정 등 추가 로직
      if (style !== "satellite-streets") {
        const layers = mapInstance.getStyle().layers;
        layers?.forEach((layer) => {
          if (layer.type === "symbol" && layer.layout?.["text-field"]) {
            try {
              mapInstance.setLayoutProperty(layer.id, "text-field", [
                "coalesce", ["get", "name_ko"], ["get", "name:ko"], ["get", "name"],
              ]);
            } catch {}
          }
        });
      }

      if (is3DBuildingsEnabled) add3DBuildingsLayer();
    });

    setMapStyle(style);
    setIsLayerPopoverOpen(false);
  }, [is3DBuildingsEnabled, add3DBuildingsLayer, mapViewRef]);

  // 지하철/버스 노선 관리
  const handleSubwayLinesToggle = useCallback(() => setIsSubwayLinesEnabled(prev => !prev), []);

  const handleBusLinesToggle = useCallback(() => {
    if (!isBusLinesEnabled) {
      setShowBusInputModal(true);
    } else {
      setIsBusLinesEnabled(false);
      setTrackedBusNumbers([]);
      setBusNumberInput("");
      const mapInstance = mapViewRef.current?.map;
      if (mapInstance) {
        clearBusData(mapInstance);
        clearAllBusRoutePaths(mapInstance);
      }
    }
  }, [isBusLinesEnabled, mapViewRef]);

  const handleBusInputCancel = useCallback(() => {
    setShowBusInputModal(false);
    setBusNumberInput("");
  }, []);

  const handleBusInputConfirm = useCallback(() => {
    const numbers = busNumberInput.split(/[,\s]+/).map(n => n.trim()).filter(n => n.length > 0).slice(0, 5);
    if (numbers.length > 0) {
      setTrackedBusNumbers(numbers);
      setIsBusLinesEnabled(true);
      setShowBusInputModal(false);
    }
  }, [busNumberInput]);

  useEffect(() => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance) return;

    if (isSubwayLinesEnabled) {
      if (mapInstance.isStyleLoaded()) addSubwayLayers(mapInstance);
      else mapInstance.once("style.load", () => addSubwayLayers(mapInstance));
    } else {
      // 지도가 로드되었을 때만 제거
      if (mapInstance && mapInstance.isStyleLoaded()) {
        removeSubwayLayers(mapInstance);
      }
    }
  }, [isSubwayLinesEnabled, mapViewRef]);

  useEffect(() => {
    const mapInstance = mapViewRef.current?.map;
    if (!mapInstance || trackedBusNumbers.length === 0 || !isBusLinesEnabled) return;

    let isInitialized = false;
    const loadBusData = async () => {
      const response = await trackBusPositions(trackedBusNumbers);
      if (response.buses.length > 0) updateAllBusPositions(mapInstance, response.buses);

      if (!isInitialized && response.meta.routes.length > 0) {
        isInitialized = true;
        for (const route of response.meta.routes) {
          try {
            const pathData = await fetchBusRoutePath(route.route_id);
            if (pathData?.geojson) addBusRoutePath(mapInstance, route.route_id, route.bus_number, pathData.geojson);
          } catch (error) {
            console.error(`버스 ${route.bus_number} 경로 조회 실패:`, error);
          }
        }
      }
    };

    if (mapInstance.isStyleLoaded()) {
      addBusLayers(mapInstance);
      loadBusData();
    }
    const intervalId = setInterval(loadBusData, 15000);
    return () => clearInterval(intervalId);
  }, [isBusLinesEnabled, trackedBusNumbers, mapViewRef]);

  return {
    mapStyle,
    isLayerPopoverOpen,
    setIsLayerPopoverOpen,
    is3DBuildingsEnabled,
    isSubwayLinesEnabled,
    isBusLinesEnabled,
    showBusInputModal,
    setShowBusInputModal,
    busNumberInput,
    setBusNumberInput,
    trackedBusNumbers,
    handleStyleChange,
    handle3DBuildingsToggle,
    handleSubwayLinesToggle,
    handleBusLinesToggle,
    handleBusInputConfirm,
    handleBusInputCancel,
  };
}
