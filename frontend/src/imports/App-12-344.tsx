import svgPaths from "./svg-v94pfc0f1m";
import { Container5 as DashboardProfileCard, Container12 as DashboardStatsCard, Container29 as DashboardRecentGames } from "./Container";
import { LogoutButton } from "./Button";
import characterGreenFront from "@/assets/character-green-front.png";

function Container() {
  return <div className="h-0 shrink-0 w-[39.995px]" data-name="Container" />;
}

function Heading() {
  return (
    <div className="h-[23.995px] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 shrink-0 w-[159.968px]" data-name="Heading 1">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-4hzbpn font-['FreesentationVF','Pretendard','Noto_Sans_KR',sans-serif] font-bold leading-[24px] left-1/2 -translate-x-1/2 not-italic text-[#2d5f3f] text-[18px] top-[-0.63px] whitespace-nowrap">Dashboard</p>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[23.995px] relative shrink-0 w-[16px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[24px] left-[8px] not-italic text-[#2d5f3f] text-[16px] text-center top-[-0.63px] translate-x-[-50%]">×</p>
      </div>
    </div>
  );
}

function Button({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white relative rounded-[14px] shrink-0 size-[39.995px] hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer"
      data-name="Button"
      aria-label="닫기"
    >
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[2.693px] pr-[2.703px] py-[2.693px] relative size-full">
        <Text />
      </div>
    </button>
  );
}

function Container1({ onClose }: { onClose?: () => void }) {
  return (
    <div className="h-[39.995px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container />
          <Heading />
          <Button onClick={onClose} />
        </div>
      </div>
    </div>
  );
}

function Container2({ onClose }: { onClose?: () => void }) {
  return (
    <div
      className="relative shrink-0 w-full"
      data-name="Container"
      style={{
        background: "linear-gradient(180deg, rgba(240,253,250,0.95) 0%, rgba(255,255,255,1) 100%)",
      }}
    >
      <div className="content-stretch flex flex-col items-start pb-[2.693px] pt-[32px] px-[16px] relative">
        <Container1 onClose={onClose} />
        {/* CharacterDisplay 제거 - 프로필이 맨 위부터 시작하도록 */}
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div
      className="relative rounded-[22590200px] shrink-0 size-[80px] overflow-hidden"
      data-name="Container"
      style={{
        background: "linear-gradient(135deg, rgba(74,153,96,0.85) 0%, rgba(110,231,183,0.75) 100%)",
        border: "2px solid rgba(255,255,255,0.50)",
        boxShadow: "0 8px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.30)",
        backdropFilter: "blur(12px) saturate(150%)",
        WebkitBackdropFilter: "blur(12px) saturate(150%)",
      }}
    >
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-0 relative size-full overflow-hidden">
        <img
          src={characterGreenFront}
          alt="민트색 캐릭터"
          className="object-contain"
          style={{
            imageRendering: 'pixelated',
            width: '110%',
            height: '110%',
            transform: 'scale(1.1)',
          }}
        />
      </div>
    </div>
  );
}

function Heading1() {
  return (
    <div className="h-[27.992px] relative shrink-0 w-full" data-name="Heading 2">
      <p className="absolute css-ew64yg font-['Inter:Bold',sans-serif] font-bold leading-[28px] left-0 not-italic text-[#2d5f3f] text-[20px] top-[0.02px] tracking-[-0.4492px]">H</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[19.997px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-0 not-italic text-[#6b9080] text-[14px] top-[0.35px] tracking-[-0.1504px]">Lv. 15</p>
    </div>
  );
}

function Container4() {
  return <div className="bg-[#48d448] h-[8px] shrink-0 rounded-full" data-name="Container" style={{ width: "60%" }} />;
}

function Container5() {
  return (
    <div className="bg-[#e5e7eb] h-[8px] relative rounded-full shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start py-0 relative size-full">
          <Container4 />
        </div>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="flex-[1_0_0] h-[67.976px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.997px] items-start relative size-full">
        <Heading1 />
        <Paragraph />
        <Container5 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex gap-[16px] items-center relative shrink-0 w-full" data-name="Container">
      {/* 아바타 */}
      <div
        className="relative rounded-full shrink-0 size-[80px] overflow-hidden"
        data-name="Avatar"
        style={{
          background: "#48d448",
          border: "2px solid black",
        }}
      >
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[8px] relative size-full overflow-hidden">
          <img
            src={characterGreenFront}
            alt="민트색 캐릭터"
            className="w-full h-full object-contain"
            style={{
              imageRendering: 'pixelated',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          />
        </div>
      </div>
      {/* 사용자 정보 */}
      <Container6 />
    </div>
  );
}

function Container8() {
  return (
    <div
      className="relative rounded-[16px] shrink-0 w-full"
      data-name="Container"
      style={{
        background: "white",
        border: "1px solid black",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div className="content-stretch flex flex-row items-center pb-[16px] pt-[16px] px-[16px] relative size-full">
        <Container7 />
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[32px] left-[34.88px] not-italic text-[#0a0a0a] text-[24px] text-center top-[-0.65px] tracking-[0.0703px] translate-x-[-50%]">🎮</p>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-[34.67px] not-italic text-[#2d5f3f] text-[24px] text-center top-[-0.65px] tracking-[0.0703px] translate-x-[-50%]">27</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[35.25px] not-italic text-[#6b9080] text-[12px] text-center top-[0.67px] translate-x-[-50%]">총 게임</p>
    </div>
  );
}

function Container10() {
  return (
    <div
      className="content-stretch flex flex-col gap-[3.997px] h-[125.38px] items-center pb-[2.693px] pt-[18.693px] px-[18.693px] rounded-[14px] flex-1 min-w-0 relative"
      data-name="Container"
      style={{
        background: "white",
        border: "1px solid rgba(110,231,183,0.3)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Container9 />
      <Paragraph1 />
      <Paragraph2 />
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[32px] left-[34.89px] not-italic text-[#0a0a0a] text-[24px] text-center top-[-0.65px] tracking-[0.0703px] translate-x-[-50%]">🏆</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-[34.67px] not-italic text-[#48d448] text-[24px] text-center top-[-0.65px] tracking-[0.0703px] translate-x-[-50%]">27</p>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[35.13px] not-italic text-[#6b9080] text-[12px] text-center top-[0.67px] translate-x-[-50%]">승리</p>
    </div>
  );
}

function Container12() {
  return (
    <div
      className="content-stretch flex flex-col gap-[3.997px] h-[125.38px] items-center pb-[2.693px] pt-[18.693px] px-[18.693px] rounded-[14px] flex-1 min-w-0 relative"
      data-name="Container"
      style={{
        background: "white",
        border: "1px solid rgba(110,231,183,0.3)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Container11 />
      <Paragraph3 />
      <Paragraph4 />
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[32px] left-[34.89px] not-italic text-[#0a0a0a] text-[24px] text-center top-[-0.65px] tracking-[0.0703px] translate-x-[-50%]">📊</p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[32px] left-[35.17px] not-italic text-[#ff9a6c] text-[24px] text-center top-[-0.65px] tracking-[0.0703px] translate-x-[-50%] w-[66px]">100%</p>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[35.13px] not-italic text-[#6b9080] text-[12px] text-center top-[0.67px] translate-x-[-50%]">승률</p>
    </div>
  );
}

function Container14() {
  return (
    <div
      className="content-stretch flex flex-col gap-[3.997px] h-[125.38px] items-center pb-[2.693px] pt-[18.693px] px-[18.693px] rounded-[14px] flex-1 min-w-0 relative"
      data-name="Container"
      style={{
        background: "white",
        border: "1px solid rgba(110,231,183,0.3)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Container13 />
      <Paragraph5 />
      <Paragraph6 />
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[125.38px] relative shrink-0 w-full flex gap-[11.99px]" data-name="Container">
      <Container10 />
      <Container12 />
      <Container14 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[19.997px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[20px] left-0 text-[#2d5f3f] text-[14px] top-[-0.31px]" style={{ fontVariationSettings: "'wght' 400" }}>
        주간 승패 기록
      </p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[2.5%_1.71%_17.5%_22.18%]" data-name="Group">
      <div className="absolute inset-[-0.31%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 222.997 160.998">
          <g id="Group">
            <path d="M0 160.498H222.997" id="Vector" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M0 120.498H222.997" id="Vector_2" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M0 80.4989H222.997" id="Vector_3" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M0 40.4994H222.997" id="Vector_4" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M6.9264e-06 0.499993H222.997" id="Vector_5" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[2.5%_1.71%_17.5%_22.18%]" data-name="Group">
      <div className="absolute inset-[0_-0.22%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 223.997 159.998">
          <g id="Group">
            <path d="M16.4286 8.74907e-06V159.998" id="Vector" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M48.285 0V159.998" id="Vector_2" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M80.1417 0V159.998" id="Vector_3" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M111.998 0V159.998" id="Vector_4" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M143.855 0V159.998" id="Vector_5" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M175.712 0V159.998" id="Vector_6" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M207.569 0V159.998" id="Vector_7" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d={svgPaths.p12543b00} id="Vector_8" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M223.497 0V159.998" id="Vector_9" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-[2.5%_1.71%_17.5%_22.18%]" data-name="Group">
      <Group />
      <Group1 />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents inset-[2.5%_1.71%_17.5%_22.18%]" data-name="Group">
      <Group2 />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute inset-[52.5%_73.32%_17.5%_23.27%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 60">
        <g id="Group">
          <path d="M0 0H10V60H0V0Z" fill="var(--fill-0, #48D448)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute inset-[42.5%_62.44%_17.5%_34.14%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.99986 79.9989">
        <g id="Group">
          <path d="M0 0H9.99986V79.9989H0V0Z" fill="var(--fill-0, #48D448)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute inset-[62.5%_51.57%_17.5%_45.02%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 40">
        <g id="Group">
          <path d="M0 0H10V40H0V0Z" fill="var(--fill-0, #48D448)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute inset-[32.5%_40.7%_17.5%_55.89%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.99986 99.9986">
        <g id="Group">
          <path d="M0 0H9.99986V99.9986H0V0Z" fill="var(--fill-0, #48D448)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group8() {
  return (
    <div className="absolute inset-[52.5%_29.82%_17.5%_66.76%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 60">
        <g id="Group">
          <path d="M0 0H10V60H0V0Z" fill="var(--fill-0, #48D448)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group9() {
  return (
    <div className="absolute inset-[42.5%_18.95%_17.5%_77.64%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.99986 79.9989">
        <g id="Group">
          <path d="M0 0H9.99986V79.9989H0V0Z" fill="var(--fill-0, #48D448)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group10() {
  return (
    <div className="absolute inset-[22.5%_8.08%_17.5%_88.51%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.99986 119.998">
        <g id="Group">
          <path d="M0 0H9.99986V119.998H0V0Z" fill="var(--fill-0, #48D448)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group11() {
  return (
    <div className="absolute contents inset-[22.5%_8.08%_17.5%_23.27%]" data-name="Group">
      <Group4 />
      <Group5 />
      <Group6 />
      <Group7 />
      <Group8 />
      <Group9 />
      <Group10 />
    </div>
  );
}

function Group12() {
  return (
    <div className="absolute contents inset-[22.5%_8.08%_17.5%_23.27%]" data-name="Group">
      <Group11 />
    </div>
  );
}

function RechartsBarR() {
  return (
    <div className="absolute contents inset-[22.5%_8.08%_17.5%_23.27%]" data-name="recharts-bar-:r0:">
      <Group12 />
    </div>
  );
}

function Group13() {
  return (
    <div className="absolute inset-[62.5%_68.54%_17.5%_28.05%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 40">
        <g id="Group">
          <path d="M0 0H10V40H0V0Z" fill="var(--fill-0, #FF9A6C)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group14() {
  return (
    <div className="absolute inset-[72.5%_57.66%_17.5%_38.92%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 20">
        <g id="Group">
          <path d="M0 0H10V20H0V0Z" fill="var(--fill-0, #FF9A6C)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group15() {
  return (
    <div className="absolute inset-[52.5%_46.79%_17.5%_49.8%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 60">
        <g id="Group">
          <path d="M0 0H10V60H0V0Z" fill="var(--fill-0, #FF9A6C)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group16() {
  return (
    <div className="absolute inset-[62.5%_25.05%_17.5%_71.54%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 40">
        <g id="Group">
          <path d="M0 0H10V40H0V0Z" fill="var(--fill-0, #FF9A6C)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group17() {
  return (
    <div className="absolute inset-[72.5%_14.17%_17.5%_82.41%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 20">
        <g id="Group">
          <path d="M0 0H10V20H0V0Z" fill="var(--fill-0, #FF9A6C)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group18() {
  return (
    <div className="absolute contents inset-[52.5%_14.17%_17.5%_28.05%]" data-name="Group">
      <Group13 />
      <Group14 />
      <Group15 />
      <Group16 />
      <Group17 />
    </div>
  );
}

function Group19() {
  return (
    <div className="absolute contents inset-[52.5%_14.17%_17.5%_28.05%]" data-name="Group">
      <Group18 />
    </div>
  );
}

function RechartsBarR1() {
  return (
    <div className="absolute contents inset-[52.5%_14.17%_17.5%_28.05%]" data-name="recharts-bar-:r1:">
      <Group19 />
    </div>
  );
}

function Group20() {
  return (
    <div className="absolute contents inset-[22.5%_8.08%_17.5%_23.27%]" data-name="Group">
      <RechartsBarR />
      <RechartsBarR1 />
    </div>
  );
}

function Group21() {
  return (
    <div className="absolute inset-[82.5%_72.38%_14.5%_27.62%]" data-name="Group">
      <div className="absolute inset-[0_-0.5px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.999986 6">
          <g id="Group">
            <path d="M0.499993 6V0" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group22() {
  return (
    <div className="absolute inset-[82.5%_61.51%_14.5%_38.49%]" data-name="Group">
      <div className="absolute inset-[0_-0.5px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.999986 6">
          <g id="Group">
            <path d="M0.499993 6V0" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group23() {
  return (
    <div className="absolute inset-[82.5%_50.63%_14.5%_49.37%]" data-name="Group">
      <div className="absolute inset-[0_-0.5px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.999986 6">
          <g id="Group">
            <path d="M0.499993 6V0" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group24() {
  return (
    <div className="absolute inset-[82.5%_39.76%_14.5%_60.24%]" data-name="Group">
      <div className="absolute inset-[0_-0.5px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.999986 6">
          <g id="Group">
            <path d="M0.499993 6V0" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group25() {
  return (
    <div className="absolute inset-[82.5%_28.89%_14.5%_71.11%]" data-name="Group">
      <div className="absolute inset-[0_-0.5px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.999986 6">
          <g id="Group">
            <path d="M0.499993 6V0" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group26() {
  return (
    <div className="absolute inset-[82.5%_18.02%_14.5%_81.98%]" data-name="Group">
      <div className="absolute inset-[0_-0.5px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.999986 6">
          <g id="Group">
            <path d="M0.499993 6V0" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group27() {
  return (
    <div className="absolute inset-[82.5%_7.14%_14.5%_92.86%]" data-name="Group">
      <div className="absolute inset-[0_-0.5px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.999986 6">
          <g id="Group">
            <path d="M0.499993 6V0" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group28() {
  return (
    <div className="absolute contents inset-[82.5%_7.14%_14.5%_27.62%]" data-name="Group">
      <Group21 />
      <Group22 />
      <Group23 />
      <Group24 />
      <Group25 />
      <Group26 />
      <Group27 />
    </div>
  );
}

function Group29() {
  return (
    <div className="absolute contents inset-[82.5%_7.14%_14.5%_27.62%]" data-name="Group">
      <Group28 />
    </div>
  );
}

function Group30() {
  return (
    <div className="absolute contents inset-[82.5%_1.71%_14.5%_22.18%]" data-name="Group">
      <div className="absolute inset-[82.5%_1.71%_17.5%_22.18%]" data-name="Vector">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 222.997 0.999986">
            <path d="M0 0.499993H222.997" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </svg>
        </div>
      </div>
      <Group29 />
    </div>
  );
}

function Group31() {
  return (
    <div className="absolute inset-[82.5%_77.82%_17.5%_20.14%]" data-name="Group">
      <div className="absolute inset-[-0.5px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 0.999986">
          <g id="Group">
            <path d="M0 0.499993H6" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group32() {
  return (
    <div className="absolute inset-[62.5%_77.82%_37.5%_20.14%]" data-name="Group">
      <div className="absolute inset-[-0.5px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 0.999986">
          <g id="Group">
            <path d="M0 0.499993H6" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group33() {
  return (
    <div className="absolute inset-[42.5%_77.82%_57.5%_20.14%]" data-name="Group">
      <div className="absolute inset-[-0.5px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 0.999986">
          <g id="Group">
            <path d="M0 0.499993H6" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group34() {
  return (
    <div className="absolute inset-[22.5%_77.82%_77.5%_20.14%]" data-name="Group">
      <div className="absolute inset-[-0.5px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 0.999986">
          <g id="Group">
            <path d="M0 0.499993H6" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group35() {
  return (
    <div className="absolute inset-[2.5%_77.82%_97.5%_20.14%]" data-name="Group">
      <div className="absolute inset-[-0.5px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 0.999986">
          <g id="Group">
            <path d="M0 0.499993H6" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group36() {
  return (
    <div className="absolute contents inset-[2.5%_77.82%_17.5%_20.14%]" data-name="Group">
      <Group31 />
      <Group32 />
      <Group33 />
      <Group34 />
      <Group35 />
    </div>
  );
}

function Group37() {
  return (
    <div className="absolute contents inset-[2.5%_77.82%_17.5%_20.14%]" data-name="Group">
      <Group36 />
    </div>
  );
}

function Group38() {
  return (
    <div className="absolute contents inset-[2.5%_77.82%_17.5%_20.14%]" data-name="Group">
      <div className="absolute inset-[2.5%_77.82%_17.5%_22.18%]" data-name="Vector">
        <div className="absolute inset-[0_-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.999986 159.998">
            <path d="M0.499993 0V159.998" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </svg>
        </div>
      </div>
      <Group37 />
    </div>
  );
}

function Group39() {
  return (
    <div className="absolute contents inset-[2.5%_1.71%_14.5%_20.14%]" data-name="Group">
      <Group30 />
      <Group38 />
    </div>
  );
}

function Group40() {
  return (
    <div className="absolute contents inset-[84.76%_70.33%_7.74%_25.57%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal inset-[84.76%_70.33%_7.74%_25.57%] leading-[normal] not-italic text-[#666] text-[12px] text-center">월</p>
    </div>
  );
}

function Group41() {
  return (
    <div className="absolute contents inset-[84.76%_59.46%_7.74%_36.45%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal inset-[84.76%_59.46%_7.74%_36.45%] leading-[normal] not-italic text-[#666] text-[12px] text-center">화</p>
    </div>
  );
}

function Group42() {
  return (
    <div className="absolute contents inset-[84.76%_48.59%_7.74%_47.32%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal inset-[84.76%_48.59%_7.74%_47.32%] leading-[normal] not-italic text-[#666] text-[12px] text-center">수</p>
    </div>
  );
}

function Group43() {
  return (
    <div className="absolute contents inset-[84.76%_37.71%_7.74%_58.19%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal inset-[84.76%_37.71%_7.74%_58.19%] leading-[normal] not-italic text-[#666] text-[12px] text-center">목</p>
    </div>
  );
}

function Group44() {
  return (
    <div className="absolute contents inset-[84.76%_26.84%_7.74%_69.06%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal inset-[84.76%_26.84%_7.74%_69.06%] leading-[normal] not-italic text-[#666] text-[12px] text-center">금</p>
    </div>
  );
}

function Group45() {
  return (
    <div className="absolute contents inset-[84.76%_15.97%_7.74%_79.94%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal inset-[84.76%_15.97%_7.74%_79.94%] leading-[normal] not-italic text-[#666] text-[12px] text-center">토</p>
    </div>
  );
}

function Group46() {
  return (
    <div className="absolute contents inset-[84.76%_5.1%_7.74%_90.81%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal inset-[84.76%_5.1%_7.74%_90.81%] leading-[normal] not-italic text-[#666] text-[12px] text-center">일</p>
    </div>
  );
}

function Group47() {
  return (
    <div className="absolute contents inset-[84.76%_5.1%_7.74%_25.57%]" data-name="Group">
      <Group40 />
      <Group41 />
      <Group42 />
      <Group43 />
      <Group44 />
      <Group45 />
      <Group46 />
    </div>
  );
}

function Group48() {
  return (
    <div className="absolute contents inset-[78.63%_80.55%_13.87%_16.72%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal inset-[78.63%_80.55%_13.87%_16.72%] leading-[normal] not-italic text-[#666] text-[12px] text-right">0</p>
    </div>
  );
}

function Group49() {
  return (
    <div className="absolute contents inset-[58.63%_80.55%_33.87%_16.72%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal inset-[58.63%_80.55%_33.87%_16.72%] leading-[normal] not-italic text-[#666] text-[12px] text-right">2</p>
    </div>
  );
}

function Group50() {
  return (
    <div className="absolute contents inset-[38.63%_80.55%_53.87%_16.72%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal inset-[38.63%_80.55%_53.87%_16.72%] leading-[normal] not-italic text-[#666] text-[12px] text-right">4</p>
    </div>
  );
}

function Group51() {
  return (
    <div className="absolute contents inset-[18.63%_80.55%_73.87%_16.72%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal inset-[18.63%_80.55%_73.87%_16.72%] leading-[normal] not-italic text-[#666] text-[12px] text-right">6</p>
    </div>
  );
}

function Group52() {
  return (
    <div className="absolute contents inset-[2.13%_80.55%_90.37%_16.72%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal inset-[2.13%_80.55%_90.37%_16.72%] leading-[normal] not-italic text-[#666] text-[12px] text-right">8</p>
    </div>
  );
}

function Group53() {
  return (
    <div className="absolute contents inset-[2.13%_80.55%_13.87%_16.72%]" data-name="Group">
      <Group48 />
      <Group49 />
      <Group50 />
      <Group51 />
      <Group52 />
    </div>
  );
}

function Group54() {
  return (
    <div className="absolute contents inset-[2.13%_5.1%_7.74%_16.72%]" data-name="Group">
      <Group47 />
      <Group53 />
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute h-[199.997px] left-0 overflow-clip top-0 w-[292.996px]" data-name="Icon">
      <Group3 />
      <Group20 />
      <Group39 />
      <Group54 />
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[199.994px] relative shrink-0 w-full" data-name="Container">
      <Icon />
    </div>
  );
}

function Container17() {
  return <div className="bg-[#48d448] rounded-[4px] shrink-0 size-[16px]" data-name="Container" />;
}

function Text1() {
  return (
    <div className="h-[16px] relative shrink-0 w-[20.765px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6b9080] text-[12px] top-[0.67px]">승리</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[16px] relative shrink-0 w-[44.76px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.995px] items-center relative size-full">
        <Container17 />
        <Text1 />
      </div>
    </div>
  );
}

function Container19() {
  return <div className="bg-[#ff9a6c] rounded-[4px] shrink-0 size-[16px]" data-name="Container" />;
}

function Text2() {
  return (
    <div className="h-[16px] relative shrink-0 w-[20.765px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6b9080] text-[12px] top-[0.67px]">패배</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[16px] relative shrink-0 w-[44.76px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[7.995px] items-center relative size-full">
        <Container19 />
        <Text2 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row justify-center size-full">
        <div className="content-stretch flex gap-[16px] items-start justify-center relative size-full">
          <Container18 />
          <Container20 />
        </div>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div
      className="h-[321.367px] relative rounded-[16px] shrink-0 w-full"
      data-name="Container"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.50) 100%)",
        border: "1px solid rgba(255,255,255,0.50)",
        boxShadow: "0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.40)",
        backdropFilter: "blur(16px) saturate(155%)",
        WebkitBackdropFilter: "blur(16px) saturate(155%)",
      }}
    >
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-[2.693px] pt-[26.688px] px-[26.688px] relative size-full">
        <Heading2 />
        <Container16 />
        <Container21 />
      </div>
    </div>
  );
}

function Heading3() {
  return (
    <div className="h-[19.997px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[20px] left-0 text-[#2d5f3f] text-[14px] top-[-0.31px]" style={{ fontVariationSettings: "'wght' 400" }}>
        시간대별 평균 시간
      </p>
    </div>
  );
}

function Group55() {
  return (
    <div className="absolute inset-[2.5%_1.71%_17.5%_22.18%]" data-name="Group">
      <div className="absolute inset-[-0.31%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 222.997 160.998">
          <g id="Group">
            <path d="M0 160.498H222.997" id="Vector" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M0 120.498H222.997" id="Vector_2" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M0 80.4989H222.997" id="Vector_3" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M0 40.4994H222.997" id="Vector_4" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M6.9264e-06 0.499993H222.997" id="Vector_5" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group56() {
  return (
    <div className="absolute inset-[2.5%_1.71%_17.5%_22.18%]" data-name="Group">
      <div className="absolute inset-[0_-0.22%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 223.997 159.998">
          <g id="Group">
            <path d={svgPaths.p12543b00} id="Vector" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M74.8323 0V159.998" id="Vector_2" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M149.165 0V159.998" id="Vector_3" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
            <path d="M223.497 0V159.998" id="Vector_4" stroke="var(--stroke-0, #CCCCCC)" strokeDasharray="3 3" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group57() {
  return (
    <div className="absolute contents inset-[2.5%_1.71%_17.5%_22.18%]" data-name="Group">
      <Group55 />
      <Group56 />
    </div>
  );
}

function Group58() {
  return (
    <div className="absolute contents inset-[2.5%_1.71%_17.5%_22.18%]" data-name="Group">
      <Group57 />
    </div>
  );
}

function Group59() {
  return (
    <div className="absolute inset-[10.5%_1.71%_65.5%_22.18%]" data-name="Group">
      <div className="absolute inset-[-3.13%_-0.36%_-2.97%_-0.21%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 224.271 50.9267">
          <g id="Group">
            <path d={svgPaths.p263c8a00} id="recharts-line-:r2:" stroke="var(--stroke-0, #48D448)" strokeDasharray="238.72 0" strokeWidth="2.99996" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group60() {
  return (
    <div className="absolute contents inset-[10.5%_1.71%_65.5%_22.18%]" data-name="Group">
      <Group59 />
    </div>
  );
}

function Group61() {
  return (
    <div className="absolute inset-[82.5%_77.82%_14.5%_22.18%]" data-name="Group">
      <div className="absolute inset-[0_-0.5px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.999986 6">
          <g id="Group">
            <path d="M0.499993 6V0" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group62() {
  return (
    <div className="absolute inset-[82.5%_52.45%_14.5%_47.55%]" data-name="Group">
      <div className="absolute inset-[0_-0.5px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.999986 6">
          <g id="Group">
            <path d="M0.499993 6V0" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group63() {
  return (
    <div className="absolute inset-[82.5%_27.08%_14.5%_72.92%]" data-name="Group">
      <div className="absolute inset-[0_-0.5px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.999986 6">
          <g id="Group">
            <path d="M0.499993 6V0" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group64() {
  return (
    <div className="absolute inset-[82.5%_1.71%_14.5%_98.29%]" data-name="Group">
      <div className="absolute inset-[0_-0.5px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.999986 6">
          <g id="Group">
            <path d="M0.499993 6V0" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group65() {
  return (
    <div className="absolute contents inset-[82.5%_1.71%_14.5%_22.18%]" data-name="Group">
      <Group61 />
      <Group62 />
      <Group63 />
      <Group64 />
    </div>
  );
}

function Group66() {
  return (
    <div className="absolute contents inset-[82.5%_1.71%_14.5%_22.18%]" data-name="Group">
      <Group65 />
    </div>
  );
}

function Group67() {
  return (
    <div className="absolute contents inset-[82.5%_1.71%_14.5%_22.18%]" data-name="Group">
      <div className="absolute inset-[82.5%_1.71%_17.5%_22.18%]" data-name="Vector">
        <div className="absolute inset-[-0.5px_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 222.997 0.999986">
            <path d="M0 0.499993H222.997" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </svg>
        </div>
      </div>
      <Group66 />
    </div>
  );
}

function Group68() {
  return (
    <div className="absolute inset-[82.5%_77.82%_17.5%_20.14%]" data-name="Group">
      <div className="absolute inset-[-0.5px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 0.999986">
          <g id="Group">
            <path d="M0 0.499993H6" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group69() {
  return (
    <div className="absolute inset-[62.5%_77.82%_37.5%_20.14%]" data-name="Group">
      <div className="absolute inset-[-0.5px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 0.999986">
          <g id="Group">
            <path d="M0 0.499993H6" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group70() {
  return (
    <div className="absolute inset-[42.5%_77.82%_57.5%_20.14%]" data-name="Group">
      <div className="absolute inset-[-0.5px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 0.999986">
          <g id="Group">
            <path d="M0 0.499993H6" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group71() {
  return (
    <div className="absolute inset-[22.5%_77.82%_77.5%_20.14%]" data-name="Group">
      <div className="absolute inset-[-0.5px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 0.999986">
          <g id="Group">
            <path d="M0 0.499993H6" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group72() {
  return (
    <div className="absolute inset-[2.5%_77.82%_97.5%_20.14%]" data-name="Group">
      <div className="absolute inset-[-0.5px_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 0.999986">
          <g id="Group">
            <path d="M0 0.499993H6" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group73() {
  return (
    <div className="absolute contents inset-[2.5%_77.82%_17.5%_20.14%]" data-name="Group">
      <Group68 />
      <Group69 />
      <Group70 />
      <Group71 />
      <Group72 />
    </div>
  );
}

function Group74() {
  return (
    <div className="absolute contents inset-[2.5%_77.82%_17.5%_20.14%]" data-name="Group">
      <Group73 />
    </div>
  );
}

function Group75() {
  return (
    <div className="absolute contents inset-[2.5%_77.82%_17.5%_20.14%]" data-name="Group">
      <div className="absolute inset-[2.5%_77.82%_17.5%_22.18%]" data-name="Vector">
        <div className="absolute inset-[0_-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 0.999986 159.998">
            <path d="M0.499993 0V159.998" id="Vector" stroke="var(--stroke-0, #666666)" strokeWidth="0.999986" />
          </svg>
        </div>
      </div>
      <Group74 />
    </div>
  );
}

function Group76() {
  return (
    <div className="absolute contents inset-[2.5%_1.71%_14.5%_20.14%]" data-name="Group">
      <Group67 />
      <Group75 />
    </div>
  );
}

function Group77() {
  return (
    <div className="absolute inset-[9%_0.68%_64%_21.16%]" data-name="Group">
      <div className="absolute inset-[-2.78%_-0.66%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 231.997 56.9993">
          <g id="Group">
            <path d={svgPaths.p31e5db00} fill="var(--fill-0, white)" id="Vector" stroke="var(--stroke-0, #48D448)" strokeWidth="2.99996" />
            <path d={svgPaths.pa258980} fill="var(--fill-0, white)" id="Vector_2" stroke="var(--stroke-0, #48D448)" strokeWidth="2.99996" />
            <path d={svgPaths.pbaf0c80} fill="var(--fill-0, white)" id="Vector_3" stroke="var(--stroke-0, #48D448)" strokeWidth="2.99996" />
            <path d={svgPaths.p1521c700} fill="var(--fill-0, white)" id="Vector_4" stroke="var(--stroke-0, #48D448)" strokeWidth="2.99996" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group78() {
  return (
    <div className="absolute contents inset-[9%_0.68%_64%_21.16%]" data-name="Group">
      <Group77 />
    </div>
  );
}

function Group79() {
  return (
    <div className="absolute contents inset-[84.76%_73.89%_7.74%_18.26%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal inset-[84.76%_73.89%_7.74%_18.26%] leading-[normal] not-italic text-[#666] text-[12px] text-center">오전</p>
    </div>
  );
}

function Group80() {
  return (
    <div className="absolute contents inset-[84.76%_48.52%_7.74%_43.63%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal inset-[84.76%_48.52%_7.74%_43.63%] leading-[normal] not-italic text-[#666] text-[12px] text-center">오후</p>
    </div>
  );
}

function Group81() {
  return (
    <div className="absolute contents inset-[84.76%_23.15%_7.74%_69%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal inset-[84.76%_23.15%_7.74%_69%] leading-[normal] not-italic text-[#666] text-[12px] text-center">저녁</p>
    </div>
  );
}

function Group82() {
  return (
    <div className="absolute contents inset-[84.76%_0.31%_7.74%_95.59%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal inset-[84.76%_0.31%_7.74%_95.59%] leading-[normal] not-italic text-[#666] text-[12px] text-center">밤</p>
    </div>
  );
}

function Group83() {
  return (
    <div className="absolute contents inset-[84.76%_0.31%_7.74%_18.26%]" data-name="Group">
      <Group79 />
      <Group80 />
      <Group81 />
      <Group82 />
    </div>
  );
}

function Group84() {
  return (
    <div className="absolute contents inset-[78.63%_80.55%_13.87%_16.72%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal inset-[78.63%_80.55%_13.87%_16.72%] leading-[normal] not-italic text-[#666] text-[12px] text-right">0</p>
    </div>
  );
}

function Group85() {
  return (
    <div className="absolute contents inset-[58.63%_80.55%_33.87%_16.72%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal inset-[58.63%_80.55%_33.87%_16.72%] leading-[normal] not-italic text-[#666] text-[12px] text-right">5</p>
    </div>
  );
}

function Group86() {
  return (
    <div className="absolute contents inset-[38.63%_80.55%_53.87%_14.68%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal inset-[38.63%_80.55%_53.87%_14.68%] leading-[normal] not-italic text-[#666] text-[12px] text-right">10</p>
    </div>
  );
}

function Group87() {
  return (
    <div className="absolute contents inset-[18.63%_80.55%_73.87%_15.02%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal inset-[18.63%_80.55%_73.87%_15.02%] leading-[normal] not-italic text-[#666] text-[12px] text-right">15</p>
    </div>
  );
}

function Group88() {
  return (
    <div className="absolute contents inset-[2.13%_80.55%_90.37%_14.33%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal inset-[2.13%_80.55%_90.37%_14.33%] leading-[normal] not-italic text-[#666] text-[12px] text-right">20</p>
    </div>
  );
}

function Group89() {
  return (
    <div className="absolute contents inset-[2.13%_80.55%_13.87%_14.33%]" data-name="Group">
      <Group84 />
      <Group85 />
      <Group86 />
      <Group87 />
      <Group88 />
    </div>
  );
}

function Group90() {
  return (
    <div className="absolute contents inset-[2.13%_0.31%_7.74%_14.33%]" data-name="Group">
      <Group83 />
      <Group89 />
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute h-[199.997px] left-0 overflow-clip top-0 w-[292.996px]" data-name="Icon">
      <Group58 />
      <Group60 />
      <Group76 />
      <Group78 />
      <Group90 />
    </div>
  );
}

function Container23() {
  return (
    <div className="h-[199.994px] relative shrink-0 w-full" data-name="Container">
      <Icon1 />
    </div>
  );
}

function Container24() {
  return (
    <div
      className="h-[289.367px] relative rounded-[16px] shrink-0 w-full"
      data-name="Container"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.50) 100%)",
        border: "1px solid rgba(255,255,255,0.50)",
        boxShadow: "0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.40)",
        backdropFilter: "blur(16px) saturate(155%)",
        WebkitBackdropFilter: "blur(16px) saturate(155%)",
      }}
    >
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-[2.693px] pt-[26.688px] px-[26.688px] relative size-full">
        <Heading3 />
        <Container23 />
      </div>
    </div>
  );
}

function Heading4() {
  return (
    <div className="h-[19.997px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[20px] left-0 text-[#2d5f3f] text-[14px] top-[-0.31px]" style={{ fontVariationSettings: "'wght' 400" }}>
        선호 경로 분포
      </p>
    </div>
  );
}

function Group91() {
  return (
    <div className="absolute bottom-1/2 left-[24.03%] right-[22.7%] top-[10%]" data-name="Group">
      <div className="absolute inset-[-0.63%_-0.32%_-0.62%_-0.4%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 157.212 80.999">
          <g id="Group">
            <path d={svgPaths.p134cd800} fill="var(--fill-0, #48D448)" id="Vector" stroke="var(--stroke-0, white)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group92() {
  return (
    <div className="absolute bottom-[10%] left-[22.7%] right-1/2 top-[37.64%]" data-name="Group">
      <div className="absolute inset-[-0.6%_-0.62%_-0.48%_-0.63%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80.9989 105.85">
          <g id="Group">
            <path d={svgPaths.p1f0fcf80} fill="var(--fill-0, #FF9A6C)" id="Vector" stroke="var(--stroke-0, white)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group93() {
  return (
    <div className="absolute bottom-[10%] left-1/2 right-[22.7%] top-1/2" data-name="Group">
      <div className="absolute inset-[-0.62%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 80.9989 80.9989">
          <g id="Group">
            <path d={svgPaths.p17d2ad80} fill="var(--fill-0, #6B9080)" id="Vector" stroke="var(--stroke-0, white)" strokeWidth="0.999986" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Group94() {
  return (
    <div className="absolute contents inset-[10%_22.7%]" data-name="Group">
      <Group91 />
      <Group92 />
      <Group93 />
    </div>
  );
}

function Group95() {
  return (
    <div className="absolute contents inset-[10%_22.7%]" data-name="Group">
      <Group94 />
    </div>
  );
}

function Group96() {
  return (
    <div className="absolute contents inset-[10%_22.7%]" data-name="Group">
      <Group95 />
    </div>
  );
}

function Group97() {
  return (
    <div className="absolute contents inset-[-5.38%_23.5%_97.88%_55.34%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal inset-[-5.38%_23.5%_97.88%_55.34%] leading-[normal] not-italic text-[#48d448] text-[12px]">경로 A 45%</p>
    </div>
  );
}

function Group98() {
  return (
    <div className="absolute contents inset-[73.39%_77.61%_19.11%_1.23%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal inset-[73.39%_77.61%_19.11%_1.23%] leading-[normal] not-italic text-[#ff9a6c] text-[12px] text-right">경로 B 30%</p>
    </div>
  );
}

function Group99() {
  return (
    <div className="absolute contents inset-[79.36%_4.71%_13.14%_74.13%]" data-name="Group">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal inset-[79.36%_4.71%_13.14%_74.13%] leading-[normal] not-italic text-[#6b9080] text-[12px]">경로 C 25%</p>
    </div>
  );
}

function Group100() {
  return (
    <div className="absolute contents inset-[-5.38%_4.71%_13.14%_1.23%]" data-name="Group">
      <Group97 />
      <Group98 />
      <Group99 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute h-[199.997px] left-0 overflow-clip top-0 w-[292.996px]" data-name="Icon">
      <Group96 />
      <Group100 />
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[199.994px] relative shrink-0 w-full" data-name="Container">
      <Icon2 />
    </div>
  );
}

function Container26() {
  return (
    <div
      className="h-[289.367px] relative rounded-[16px] shrink-0 w-full"
      data-name="Container"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.50) 100%)",
        border: "1px solid rgba(255,255,255,0.50)",
        boxShadow: "0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.40)",
        backdropFilter: "blur(16px) saturate(155%)",
        WebkitBackdropFilter: "blur(16px) saturate(155%)",
      }}
    >
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-[2.693px] pt-[26.688px] px-[26.688px] relative size-full">
        <Heading4 />
        <Container25 />
      </div>
    </div>
  );
}

function Heading5() {
  return (
    <div className="h-[19.997px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[20px] left-0 text-[#2d5f3f] text-[14px] top-[-0.31px]" style={{ fontVariationSettings: "'wght' 400" }}>
        최근 게임
      </p>
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[32px] relative shrink-0 w-[24.237px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[32px] left-0 not-italic text-[#0a0a0a] text-[24px] top-[-0.65px] tracking-[0.0703px]">🏆</p>
      </div>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="absolute h-[19.997px] left-0 top-0 w-[51.882px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#2d5f3f] text-[14px] top-[0.35px] tracking-[-0.1504px]">경로 A</p>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="absolute h-[16px] left-0 top-[20px] w-[51.882px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6b9080] text-[12px] top-[0.67px]">15분 23초</p>
    </div>
  );
}

function Container28() {
  return (
    <div className="flex-[1_0_0] h-[35.997px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Paragraph7 />
        <Paragraph8 />
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="h-[35.997px] relative shrink-0 w-[88.11px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.992px] items-center relative size-full">
        <Container27 />
        <Container28 />
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="h-[19.997px] relative shrink-0 w-[44.413px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#48d448] text-[14px] top-[0.35px] tracking-[-0.1504px] w-[45px]">+100P</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div
      className="h-[62.674px] relative rounded-[14px] shrink-0 w-full"
      data-name="Container"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.45) 100%)",
        border: "1px solid rgba(255,255,255,0.50)",
        boxShadow: "0 6px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.30)",
        backdropFilter: "blur(12px) saturate(150%)",
        WebkitBackdropFilter: "blur(12px) saturate(150%)",
      }}
    >
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[13.338px] py-[1.346px] relative size-full">
          <Container29 />
          <Container30 />
        </div>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="h-[32px] relative shrink-0 w-[24.237px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[32px] left-0 not-italic text-[#0a0a0a] text-[24px] top-[-0.65px] tracking-[0.0703px]">🏆</p>
      </div>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="absolute h-[19.997px] left-0 top-0 w-[52.081px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#2d5f3f] text-[14px] top-[0.35px] tracking-[-0.1504px]">경로 B</p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="absolute h-[16px] left-0 top-[20px] w-[52.081px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6b9080] text-[12px] top-[0.67px]">12분 45초</p>
    </div>
  );
}

function Container33() {
  return (
    <div className="flex-[1_0_0] h-[35.997px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Paragraph9 />
        <Paragraph10 />
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="h-[35.997px] relative shrink-0 w-[88.31px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.992px] items-center relative size-full">
        <Container32 />
        <Container33 />
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="h-[19.997px] relative shrink-0 w-[44.413px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#48d448] text-[14px] top-[0.35px] tracking-[-0.1504px] w-[45px]">+100P</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div
      className="h-[62.674px] relative rounded-[14px] shrink-0 w-full"
      data-name="Container"
      style={{
        background: "white",
        border: "1px solid rgba(110,231,183,0.3)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[13.338px] py-[1.346px] relative size-full">
          <Container34 />
          <div className="flex flex-col gap-1">
            <Container35 />
            <div
              className="h-[24px] px-2 rounded-[8px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(74,153,96,0.85) 0%, rgba(110,231,183,0.75) 100%)",
                border: "1px solid rgba(255,255,255,0.50)",
                backdropFilter: "blur(8px) saturate(140%)",
                WebkitBackdropFilter: "blur(8px) saturate(140%)",
              }}
            >
              <p className="css-4hzbpn font-['Inter:Bold',sans-serif] font-bold text-[12px] text-white">+500P</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="h-[32px] relative shrink-0 w-[24.237px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[32px] left-0 not-italic text-[#0a0a0a] text-[24px] top-[-0.65px] tracking-[0.0703px]">😅</p>
      </div>
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="absolute h-[19.997px] left-0 top-0 w-[50.167px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#2d5f3f] text-[14px] top-[0.35px] tracking-[-0.1504px]">경로 A</p>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="absolute h-[16px] left-0 top-[20px] w-[50.167px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6b9080] text-[12px] top-[0.67px]">18분 12초</p>
    </div>
  );
}

function Container38() {
  return (
    <div className="h-[35.997px] relative shrink-0 w-[50.167px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Paragraph11 />
        <Paragraph12 />
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="h-[35.997px] relative shrink-0 w-[86.396px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.992px] items-center relative size-full">
        <Container37 />
        <Container38 />
      </div>
    </div>
  );
}

function Container40() {
  return (
    <div className="h-[19.997px] relative shrink-0 w-[37.112px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#ff9a6c] text-[14px] top-[0.35px] tracking-[-0.1504px] w-[38px]">+50P</p>
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div
      className="h-[62.674px] relative rounded-[14px] shrink-0 w-full"
      data-name="Container"
      style={{
        background: "white",
        border: "1px solid rgba(110,231,183,0.3)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[13.338px] py-[1.346px] relative size-full">
          <Container39 />
          <div className="flex flex-col gap-1">
            <Container40 />
            <div
              className="h-[24px] px-2 rounded-[8px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(74,153,96,0.85) 0%, rgba(110,231,183,0.75) 100%)",
                border: "1px solid rgba(255,255,255,0.50)",
                backdropFilter: "blur(8px) saturate(140%)",
                WebkitBackdropFilter: "blur(8px) saturate(140%)",
              }}
            >
              <p className="css-4hzbpn font-['Inter:Bold',sans-serif] font-bold text-[12px] text-white">+500P</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="h-[32px] relative shrink-0 w-[24.237px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[32px] left-0 not-italic text-[#0a0a0a] text-[24px] top-[-0.65px] tracking-[0.0703px]">🏆</p>
      </div>
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="absolute h-[19.997px] left-0 top-0 w-[52.471px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#2d5f3f] text-[14px] top-[0.35px] tracking-[-0.1504px]">경로 C</p>
    </div>
  );
}

function Paragraph14() {
  return (
    <div className="absolute h-[16px] left-0 top-[20px] w-[52.471px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6b9080] text-[12px] top-[0.67px]">14분 56초</p>
    </div>
  );
}

function Container43() {
  return (
    <div className="h-[35.997px] relative shrink-0 w-[52.471px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Paragraph13 />
        <Paragraph14 />
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="h-[35.997px] relative shrink-0 w-[88.699px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.992px] items-center relative size-full">
        <Container42 />
        <Container43 />
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="h-[19.997px] relative shrink-0 w-[44.413px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#48d448] text-[14px] top-[0.35px] tracking-[-0.1504px] w-[45px]">+100P</p>
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div
      className="h-[62.674px] relative rounded-[14px] shrink-0 w-full"
      data-name="Container"
      style={{
        background: "white",
        border: "1px solid rgba(110,231,183,0.3)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[13.338px] py-[1.346px] relative size-full">
          <Container44 />
          <div className="flex flex-col gap-1">
            <Container45 />
            <div
              className="h-[24px] px-2 rounded-[8px] flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, rgba(74,153,96,0.85) 0%, rgba(110,231,183,0.75) 100%)",
                border: "1px solid rgba(255,255,255,0.50)",
                backdropFilter: "blur(8px) saturate(140%)",
                WebkitBackdropFilter: "blur(8px) saturate(140%)",
              }}
            >
              <p className="css-4hzbpn font-['Inter:Bold',sans-serif] font-bold text-[12px] text-white">+500P</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="content-stretch flex flex-col gap-[11.992px] h-[286.674px] items-start relative shrink-0 w-full" data-name="Container">
      <Container31 />
      <Container36 />
      <Container41 />
      <Container46 />
    </div>
  );
}

function Container48() {
  return (
    <div
      className="h-[376.046px] relative rounded-[16px] shrink-0 w-full"
      data-name="Container"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.50) 100%)",
        border: "1px solid rgba(255,255,255,0.50)",
        boxShadow: "0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.40)",
        backdropFilter: "blur(16px) saturate(155%)",
        WebkitBackdropFilter: "blur(16px) saturate(155%)",
      }}
    >
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-[2.693px] pt-[26.688px] px-[26.688px] relative size-full">
        <Heading5 />
        <Container47 />
      </div>
    </div>
  );
}

function Heading6() {
  return (
    <div className="h-[19.997px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[20px] left-0 text-[#2d5f3f] text-[14px] top-[-0.31px]" style={{ fontVariationSettings: "'wght' 400" }}>
        업적
      </p>
    </div>
  );
}

function Container49() {
  return (
    <div className="content-stretch flex h-[35.997px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="css-4hzbpn flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[36px] min-h-px min-w-px not-italic relative text-[#0a0a0a] text-[30px] text-center tracking-[0.3955px]">🎯</p>
    </div>
  );
}

function Paragraph15() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[31.7px] not-italic text-[#6b9080] text-[12px] text-center top-[0.67px] translate-x-[-50%]">첫 승리</p>
    </div>
  );
}

function Container50() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[3.997px] h-[82.672px] items-start left-0 pb-[1.346px] pt-[13.339px] px-[13.339px] rounded-[14px] top-0 w-[89.604px]" data-name="Container" style={{ backgroundImage: "linear-gradient(137.304deg, rgba(255, 215, 0, 0.2) 0%, rgba(255, 237, 78, 0.2) 100%)" }}>
      <div aria-hidden="true" className="absolute border-[#ffd700] border-[1.346px] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Container49 />
      <Paragraph15 />
    </div>
  );
}

function Container51() {
  return (
    <div className="content-stretch flex h-[35.997px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="css-4hzbpn flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[36px] min-h-px min-w-px not-italic relative text-[#0a0a0a] text-[30px] text-center tracking-[0.3955px]">⚡</p>
    </div>
  );
}

function Paragraph16() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[31.58px] not-italic text-[#6b9080] text-[12px] text-center top-[0.67px] translate-x-[-50%]">연승</p>
    </div>
  );
}

function Container52() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[3.997px] h-[82.672px] items-start left-[101.6px] pb-[1.346px] pt-[13.339px] px-[13.339px] rounded-[14px] top-0 w-[89.604px]" data-name="Container" style={{ backgroundImage: "linear-gradient(137.304deg, rgba(72, 212, 72, 0.2) 0%, rgba(61, 184, 61, 0.2) 100%)" }}>
      <div aria-hidden="true" className="absolute border-[#48d448] border-[1.346px] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Container51 />
      <Paragraph16 />
    </div>
  );
}

function Container53() {
  return (
    <div className="content-stretch flex h-[35.997px] items-start relative shrink-0 w-full" data-name="Container">
      <p className="css-4hzbpn flex-[1_0_0] font-['Inter:Regular',sans-serif] font-normal leading-[36px] min-h-px min-w-px not-italic relative text-[#0a0a0a] text-[30px] text-center tracking-[0.3955px]">🔒</p>
    </div>
  );
}

function Paragraph17() {
  return (
    <div className="h-[16px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[31.73px] not-italic text-[#6b9080] text-[12px] text-center top-[0.67px] translate-x-[-50%]">???</p>
    </div>
  );
}

function Container54() {
  return (
    <div className="absolute bg-[#f9fafb] content-stretch flex flex-col gap-[3.997px] h-[82.672px] items-start left-[203.19px] opacity-50 pb-[1.346px] pt-[13.339px] px-[13.339px] rounded-[14px] top-0 w-[89.604px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[1.346px] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <Container53 />
      <Paragraph17 />
    </div>
  );
}

function Container55() {
  return (
    <div className="h-[82.672px] relative shrink-0 w-full" data-name="Container">
      <Container50 />
      <Container52 />
      <Container54 />
    </div>
  );
}

function Container56() {
  return (
    <div
      className="h-[172.044px] relative rounded-[16px] shrink-0 w-full"
      data-name="Container"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.50) 100%)",
        border: "1px solid rgba(255,255,255,0.50)",
        boxShadow: "0 10px 20px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.40)",
        backdropFilter: "blur(16px) saturate(155%)",
        WebkitBackdropFilter: "blur(16px) saturate(155%)",
      }}
    >
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-[2.693px] pt-[26.688px] px-[26.688px] relative size-full">
        <Heading6 />
        <Container55 />
      </div>
    </div>
  );
}

function Container57({ onLogout }: { onLogout?: () => void }) {
  return (
    <div className="h-[1954.909px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex flex-col gap-[23.995px] items-center pb-0 pt-[23.995px] px-[16px] relative size-full">
        <DashboardProfileCard />
        <DashboardStatsCard />
        <DashboardRecentGames />
        <LogoutButton onClick={onLogout} />
      </div>
    </div>
  );
}

function DashboardPage({ onClose, onLogout }: { onClose?: () => void; onLogout?: () => void }) {
  return (
    <div
      className="content-stretch flex flex-col h-[837.184px] items-start overflow-clip relative shrink-0 w-full"
      data-name="DashboardPage"
      style={{
        background: "linear-gradient(180deg, rgba(240,253,250,1) 0%, rgba(255,255,255,1) 100%)",
      }}
    >
      <Container2 onClose={onClose} />
      <Container57 onLogout={onLogout} />
    </div>
  );
}

export { DashboardPage };

export default function App() {
  return (
    <div className="bg-white relative rounded-[40px] size-full" data-name="App">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[7.406px] relative rounded-[inherit] size-full">
        <DashboardPage />
      </div>
      <div aria-hidden="true" className="absolute border-[#1a1a2e] border-[7.406px] border-solid inset-0 pointer-events-none rounded-[40px] shadow-[0px_0px_0px_4px_#4ecca3,0px_30px_80px_0px_rgba(78,204,163,0.5),0px_0px_60px_0px_rgba(78,204,163,0.3)]" />
    </div>
  );
}
