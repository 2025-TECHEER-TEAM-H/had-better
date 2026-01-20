import { DashboardPage } from "@/imports/App-12-344";

interface DashboardPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export function DashboardPopup({ isOpen, onClose, onLogout }: DashboardPopupProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* 백드롭 - 클릭하면 닫힘 */}
      <div 
        className="fixed inset-0 bg-black/40 z-[60] transition-opacity"
        onClick={onClose}
      />
      
      {/* 팝업 컨테이너 */}
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="pointer-events-auto w-full max-w-[400px] h-[90vh] max-h-[840px] overflow-y-auto scrollbar-hide animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {/* 대시보드 콘텐츠 - onClose와 onLogout을 전달 */}
          <DashboardPage onClose={onClose} onLogout={onLogout} />
        </div>
      </div>
    </>
  );
}