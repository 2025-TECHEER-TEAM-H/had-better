import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MobileView from "@/imports/Mobile";
import TabletView from "@/imports/Tablet";
import DesktopView from "@/imports/Desktop";

interface LandingPageProps {
  onStart?: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const navigate = useNavigate();

  // useNavigate 또는 props의 onStart 사용
  const handleStart = useCallback(() => {
    if (onStart) {
      onStart();
    } else {
      navigate("/onboarding/1");
    }
  }, [onStart, navigate]);

  useEffect(() => {
    // start 버튼에 클릭 이벤트 추가
    const addStartButtonHandler = () => {
      const startButtons = document.querySelectorAll('p');
      startButtons.forEach((button) => {
        const parent = button.parentElement;
        if (button.textContent?.toLowerCase().includes('start') && parent) {
          parent.style.cursor = 'pointer';
          parent.addEventListener('click', handleStart);
        }
      });
    };

    // Run after a slight delay to ensure DOM is ready
    setTimeout(addStartButtonHandler, 100);

    // Cleanup
    return () => {
      const startButtons = document.querySelectorAll('p');
      startButtons.forEach((button) => {
        const parent = button.parentElement;
        if (button.textContent?.toLowerCase().includes('start') && parent) {
          parent.removeEventListener('click', handleStart);
        }
      });
    };
  }, [handleStart]);

  return (
    <div className="fixed inset-0 z-50 bg-white text-[17px] md:text-[18px] lg:text-[20px]">
      {/* 모바일 뷰 (< 768px) */}
      <div className="md:hidden size-full">
        <MobileView />
      </div>

      {/* 태블릿 뷰 (768px ~ 1024px) */}
      <div className="hidden md:block lg:hidden size-full">
        <TabletView />
      </div>

      {/* 데스크톱 뷰 (>= 1024px) */}
      <div className="hidden lg:block size-full">
        <DesktopView />
      </div>
    </div>
  );
}