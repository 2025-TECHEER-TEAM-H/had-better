import { MapStyleType, MAP_STYLES } from "@/hooks/useRouteMapLayers";

interface LayerControlProps {
  mapStyle: MapStyleType;
  isLayerPopoverOpen: boolean;
  setIsLayerPopoverOpen: (open: boolean) => void;
  is3DBuildingsEnabled: boolean;
  isSubwayLinesEnabled: boolean;
  isBusLinesEnabled: boolean;
  onStyleChange: (style: MapStyleType) => void;
  on3DBuildingsToggle: () => void;
  onSubwayLinesToggle: () => void;
  onBusLinesToggle: () => void;
  layerButtonRef: React.RefObject<HTMLButtonElement>;
  popoverRef: React.RefObject<HTMLDivElement>;
}

export function LayerControl({
  mapStyle,
  isLayerPopoverOpen,
  setIsLayerPopoverOpen,
  is3DBuildingsEnabled,
  isSubwayLinesEnabled,
  isBusLinesEnabled,
  onStyleChange,
  on3DBuildingsToggle,
  onSubwayLinesToggle,
  onBusLinesToggle,
  layerButtonRef,
  popoverRef,
}: LayerControlProps) {
  return (
    <div className="relative">
      <button
        ref={layerButtonRef}
        onClick={() => setIsLayerPopoverOpen(!isLayerPopoverOpen)}
        className={`bg-white/20 backdrop-blur-xl rounded-[16px] size-[44px] flex items-center justify-center border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:scale-105 active:scale-95 transition-all ${
          isLayerPopoverOpen ? "bg-white/30 border-[#FFD93D]/50" : ""
        }`}
        title="레이어"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={isLayerPopoverOpen ? "#FFD93D" : "black"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke={isLayerPopoverOpen ? "#FFD93D" : "black"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke={isLayerPopoverOpen ? "#FFD93D" : "black"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isLayerPopoverOpen && (
        <div
          ref={popoverRef}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-[56px] top-0 bg-white/20 backdrop-blur-xl rounded-[24px] shadow-[0_16px_48px_rgba(0,0,0,0.25)] border border-white/40 p-5 min-w-[220px] z-20 animate-in fade-in slide-in-from-right-4 duration-200"
        >
          <div className="font-['Wittgenstein',sans-serif] text-[14px] font-black text-gray-800 mb-4 pb-2 border-b border-white/30">
            지도 스타일 선택
          </div>
          <div className="flex flex-col gap-2">
            {(Object.keys(MAP_STYLES) as MapStyleType[]).map((styleKey) => (
              <button
                key={styleKey}
                onClick={() => onStyleChange(styleKey)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-[12px] transition-all backdrop-blur-sm ${
                  mapStyle === styleKey
                    ? "bg-[#FFD93D]/20 text-black font-bold border border-[#FFD93D]/40 shadow-sm"
                    : "hover:bg-white/10 text-gray-700 font-medium border border-transparent"
                }`}
              >
                <span className="text-xl">{MAP_STYLES[styleKey].icon}</span>
                <span className="font-['Wittgenstein',sans-serif] text-[13px]">{MAP_STYLES[styleKey].name}</span>
                {mapStyle === styleKey && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FFD93D]" />
                )}
              </button>
            ))}
          </div>

          <div className="font-['Wittgenstein',sans-serif] text-[14px] font-black text-gray-800 mt-6 mb-4 pt-4 border-t border-white/30">
            레이어 옵션
          </div>
          <div className="flex flex-col gap-3">
            {[
              { id: '3d', label: '3D 입체 건물', icon: '🏢', checked: is3DBuildingsEnabled, toggle: on3DBuildingsToggle },
              { id: 'subway', label: '지하철 노선도', icon: '🚇', checked: isSubwayLinesEnabled, toggle: onSubwayLinesToggle },
              { id: 'bus', label: '실시간 버스', icon: '🚌', checked: isBusLinesEnabled, toggle: onBusLinesToggle }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={(e) => { e.stopPropagation(); opt.toggle(); }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-[12px] transition-all border backdrop-blur-sm ${
                  opt.checked
                    ? "bg-white/30 border-[#FFD93D]/40 shadow-sm"
                    : "bg-white/10 border-white/20 grayscale opacity-70"
                }`}
              >
                <span className="text-lg">{opt.icon}</span>
                <span className="font-['Wittgenstein',sans-serif] text-[13px] font-bold text-gray-700">{opt.label}</span>
                <div
                  className={`ml-auto w-10 h-5 rounded-full transition-all relative ${
                    opt.checked ? "bg-[#FFD93D]" : "bg-gray-200"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                      opt.checked ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
