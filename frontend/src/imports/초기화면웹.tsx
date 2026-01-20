import svgPaths from "./svg-qf0fhupfle";

function Container() {
  return <div className="absolute bg-white blur-[40px] h-[100px] left-[128px] opacity-40 rounded-[33554400px] top-[108px] w-[160px]" data-name="Container" />;
}

function Container1() {
  return <div className="absolute bg-white blur-[40px] h-[120px] left-[896px] opacity-30 rounded-[33554400px] top-[180px] w-[200px]" data-name="Container" />;
}

function Container2() {
  return <div className="absolute bg-white blur-[40px] h-[80px] left-[384px] opacity-35 rounded-[33554400px] top-[432px] w-[140px]" data-name="Container" />;
}

function Container3() {
  return (
    <div className="absolute h-[720px] left-0 overflow-clip top-0 w-[1280px]" data-name="Container">
      <Container />
      <Container1 />
      <Container2 />
    </div>
  );
}

function Paragraph() {
  return <div className="h-[28px] shrink-0 w-full" data-name="Paragraph" />;
}

function Heading() {
  return (
    <div className="font-['Press_Start_2P:Regular',sans-serif] h-[180px] leading-[90px] not-italic relative shrink-0 text-[#2d5f3f] text-[72px] tracking-[3.6px] w-full" data-name="Heading 1">
      <p className="absolute css-ew64yg left-0 top-0">HAD</p>
      <p className="absolute css-ew64yg left-0 top-[90px]">BETTER</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] h-[224px] items-start left-0 top-0 w-[552px]" data-name="Container">
      <Paragraph />
      <Heading />
    </div>
  );
}

function Text() {
  return (
    <div className="absolute h-[32px] left-[312.06px] top-0 w-[24.609px]" data-name="Text">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[32px] left-[12px] not-italic text-[24px] text-center text-white top-0 tracking-[0.6px] translate-x-[-50%]">→</p>
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute h-[32px] left-0 top-[24px] w-[546px]" data-name="Text">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[32px] left-[254.83px] text-[24px] text-center text-white top-0 tracking-[0.6px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        시작하기
      </p>
      <Text />
    </div>
  );
}

function Button({ onClick }: { onClick?: () => void }) {
  return (
    <div 
      className="absolute bg-gradient-to-b border-3 border-black border-solid from-[#48d448] h-[86px] left-0 rounded-[24px] shadow-[0px_6px_0px_0px_#2d8b2d,0px_12px_24px_0px_rgba(61,184,61,0.3)] to-[#3db83d] top-[350px] w-[552px] cursor-pointer" 
      data-name="Button"
      onClick={onClick}
    >
      <Text1 />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute bg-gradient-to-b content-stretch flex flex-col from-white h-[75px] items-start left-0 pb-[3px] pl-[47px] pr-[61px] pt-[48px] rounded-[16px] to-[#f5f5f5] top-0 w-[173.328px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_4px_0px_0px_#d0d0d0,0px_8px_16px_0px_rgba(0,0,0,0.1)]" />
      <p className="css-4hzbpn font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] relative shrink-0 text-[#101828] text-[14px] text-center w-[80px]">실시간 추적</p>
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex h-[20px] items-start relative shrink-0 w-[82px]" data-name="Heading 3">
      <p className="css-4hzbpn flex-[1_0_0] font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] min-h-px min-w-px relative text-[#101828] text-[14px] text-center">고스트 경로</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute bg-gradient-to-b content-stretch flex flex-col from-white h-[75px] items-start left-[189.33px] pb-[3px] pl-[47px] pr-[66.063px] pt-[47px] rounded-[16px] to-[#f5f5f5] top-0 w-[173.328px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_4px_0px_0px_#d0d0d0,0px_8px_16px_0px_rgba(0,0,0,0.1)]" />
      <Heading1 />
    </div>
  );
}

function Heading2() {
  return (
    <div className="h-[20px] relative shrink-0 w-[103px]" data-name="Heading 3">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="css-4hzbpn flex-[1_0_0] font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[20px] min-h-px min-w-px relative text-[#101828] text-[14px] text-center">개쩌는 정확도</p>
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="content-stretch flex h-[40px] items-start relative shrink-0 w-full" data-name="Text">
      <Heading2 />
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute bg-gradient-to-b content-stretch flex flex-col from-white h-[75px] items-start left-[378.66px] pb-[3px] pl-[35px] pr-[66.063px] pt-[46px] rounded-[16px] to-[#f5f5f5] top-0 w-[173.328px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_4px_0px_0px_#d0d0d0,0px_8px_16px_0px_rgba(0,0,0,0.1)]" />
      <Text2 />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute h-[75px] left-0 top-[460px] w-[552px]" data-name="Container">
      <Container5 />
      <Container6 />
      <Container7 />
      <p className="absolute css-ew64yg font-['Arimo:Regular',sans-serif] font-normal leading-[32px] left-[87px] text-[#0a0a0a] text-[24px] text-center top-[13.5px] translate-x-[-50%]">📍</p>
      <p className="absolute css-ew64yg font-['Arimo:Regular',sans-serif] font-normal leading-[32px] left-[277px] text-[#0a0a0a] text-[24px] text-center top-[11.5px] translate-x-[-50%]">👻</p>
      <p className="absolute css-4hzbpn font-['Arial:Regular',sans-serif] leading-[36px] left-[464.5px] not-italic text-[#0a0a0a] text-[25px] text-center top-[11.5px] translate-x-[-50%] w-[33px]">🧭</p>
    </div>
  );
}

function Container9({ onStart }: { onStart?: () => void }) {
  return (
    <div className="absolute h-[535px] left-0 top-0 w-[552px]" data-name="Container">
      <Container4 />
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[28px] left-0 text-[#6b9080] text-[20px] top-[223.5px] tracking-[-0.5px]" style={{ fontVariationSettings: "'wght' 400" }}>
        선택 경로 실시간 비교
      </p>
      <Button onClick={onStart} />
      <Container8 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute bottom-[51.11%] contents left-[10%] right-1/2 top-[8.89%]" data-name="Group">
      <div className="absolute inset-[31.11%_63.33%_51.11%_23.33%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 14.2222">
          <path d={svgPaths.p2183e060} fill="url(#paint0_linear_27_437)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_27_437" x1="0" x2="0" y1="0" y2="14.2222">
              <stop stopColor="#6B4423" />
              <stop offset="1" stopColor="#5A3A1F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-[62.22%] left-[10%] right-1/2 top-[20%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 14.2222">
          <path d={svgPaths.pa98e100} fill="url(#paint0_linear_27_418)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_27_418" x1="0" x2="0" y1="0" y2="14.2222">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[14.44%_53.33%_70%_13.33%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 12.4444">
          <path d={svgPaths.p2a0acf00} fill="url(#paint0_linear_27_416)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_27_416" x1="0" x2="0" y1="0" y2="12.4444">
              <stop stopColor="#3D6E50" />
              <stop offset="1" stopColor="#2D5F3F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[8.89%_60%_77.78%_20%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 10.6667">
          <path d={svgPaths.p2cb00b30} fill="url(#paint0_linear_27_435)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_27_435" x1="0" x2="0" y1="0" y2="10.6667">
              <stop stopColor="#3D6E50" />
              <stop offset="1" stopColor="#2D5F3F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[80px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group />
    </div>
  );
}

function Tree() {
  return (
    <div className="absolute content-stretch flex flex-col h-[80px] items-start left-[23px] top-[114.5px] w-[60px]" data-name="Tree">
      <Icon />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents inset-[39.58%_31.11%_0.42%_8.89%]" data-name="Group">
      <div className="absolute inset-[72.92%_51.11%_0.42%_28.89%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 32">
          <path d={svgPaths.p210d7f80} fill="url(#paint0_linear_27_429)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_27_429" x1="0" x2="0" y1="0" y2="32">
              <stop stopColor="#6B4423" />
              <stop offset="1" stopColor="#5A3A1F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[56.25%_31.11%_17.08%_8.89%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 54 32">
          <path d={svgPaths.p7290100} fill="url(#paint0_linear_27_407)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_27_407" x1="0" x2="0" y1="0" y2="32">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[47.92%_36.11%_28.75%_13.89%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 45 28">
          <path d={svgPaths.p141c3b80} fill="url(#paint0_linear_27_390)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_27_390" x1="0" x2="0" y1="0" y2="28">
              <stop stopColor="#3D6E50" />
              <stop offset="1" stopColor="#2D5F3F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[39.58%_46.11%_40.42%_23.89%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 24">
          <path d={svgPaths.p3d46cb00} fill="url(#paint0_linear_27_388)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_27_388" x1="0" x2="0" y1="0" y2="24">
              <stop stopColor="#3D6E50" />
              <stop offset="1" stopColor="#2D5F3F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Icon2() {
  return (
    <div className="h-[120px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group2 />
    </div>
  );
}

function Tree1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[120px] items-start left-[234px] top-[55px] w-[90px]" data-name="Tree">
      <Icon2 />
    </div>
  );
}

function Container10() {
  return <div className="absolute bg-gradient-to-b from-white h-[24px] left-[12px] rounded-[33554400px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.08)] to-[#f0f4f8] top-[16px] w-[72px]" data-name="Container" />;
}

function Container15() {
  return <div className="absolute bg-gradient-to-b from-white h-[32px] left-0 rounded-[33554400px] shadow-[0px_3px_6px_0px_rgba(0,0,0,0.06)] to-[#f0f4f8] top-[4px] w-[40px]" data-name="Container" />;
}

function Container16() {
  return <div className="absolute bg-gradient-to-b from-white h-[36px] left-[24px] rounded-[33554400px] shadow-[0px_3px_6px_0px_rgba(0,0,0,0.06)] to-[#f0f4f8] top-0 w-[48px]" data-name="Container" />;
}

function Container17() {
  return <div className="absolute bg-gradient-to-b from-white h-[28px] left-[60px] rounded-[33554400px] shadow-[0px_3px_6px_0px_rgba(0,0,0,0.06)] to-[#f0f4f8] top-[8px] w-[36px]" data-name="Container" />;
}

function Cloud1() {
  return (
    <div className="absolute h-[40px] left-[13px] top-[-179.5px] w-[96px]" data-name="Cloud1">
      <Container10 />
      <Container15 />
      <Container16 />
      <Container17 />
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute h-[175px] left-[114px] top-[180px] w-[324px]" data-name="Container">
      <Tree />
      <Tree1 />
      <Cloud1 />
    </div>
  );
}

function Container19() {
  return <div className="absolute bg-gradient-to-b from-white h-[20px] left-[8px] rounded-[33554400px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.07)] to-[#f0f4f8] top-[16px] w-[64px]" data-name="Container" />;
}

function Container20() {
  return <div className="absolute bg-gradient-to-b from-white h-[28px] left-0 rounded-[33554400px] shadow-[0px_3px_6px_0px_rgba(0,0,0,0.06)] to-[#f0f4f8] top-[4px] w-[36px]" data-name="Container" />;
}

function Container21() {
  return <div className="absolute bg-gradient-to-b from-white h-[32px] left-[24px] rounded-[33554400px] shadow-[0px_3px_6px_0px_rgba(0,0,0,0.06)] to-[#f0f4f8] top-0 w-[40px]" data-name="Container" />;
}

function Container22() {
  return <div className="absolute bg-gradient-to-b from-white h-[24px] left-[52px] rounded-[33554400px] shadow-[0px_3px_6px_0px_rgba(0,0,0,0.06)] to-[#f0f4f8] top-[8px] w-[28px]" data-name="Container" />;
}

function Cloud4() {
  return (
    <div className="absolute h-[36px] left-[393px] top-[153.5px] w-[80px]" data-name="Cloud4">
      <Container19 />
      <Container20 />
      <Container21 />
      <Container22 />
    </div>
  );
}

function Container23() {
  return <div className="absolute bg-gradient-to-b from-white h-[28px] left-[16px] rounded-[33554400px] shadow-[0px_5px_10px_0px_rgba(0,0,0,0.1)] to-[#edf2f7] top-[20px] w-[96px]" data-name="Container" />;
}

function Container24() {
  return <div className="absolute bg-gradient-to-b from-white h-[36px] left-0 rounded-[33554400px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.08)] to-[#edf2f7] top-[4px] w-[48px]" data-name="Container" />;
}

function Container25() {
  return <div className="absolute bg-gradient-to-b from-white h-[44px] left-[32px] rounded-[33554400px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.08)] to-[#edf2f7] top-0 w-[56px]" data-name="Container" />;
}

function Container26() {
  return <div className="absolute bg-gradient-to-b from-white h-[36px] left-[58.41px] rounded-[33554400px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.08)] to-[#edf2f7] top-[4px] w-[44px]" data-name="Container" />;
}

function Container27() {
  return <div className="absolute bg-gradient-to-b from-white h-[32px] left-[88px] rounded-[33554400px] shadow-[0px_3px_6px_0px_rgba(0,0,0,0.06)] to-[#edf2f7] top-[8px] w-[40px]" data-name="Container" />;
}

function Cloud2() {
  return (
    <div className="absolute h-[48px] left-[153px] top-[131.5px] w-[128px]" data-name="Cloud2">
      <Container23 />
      <Container24 />
      <Container25 />
      <Container26 />
      <Container27 />
    </div>
  );
}

function Container28() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0)] left-0 rounded-[28px] size-[148px] top-0" data-name="Container">
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_-6px_12px_0px_rgba(0,0,0,0.1),inset_0px_2px_6px_0px_rgba(255,255,255,0.5)]" />
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents inset-[8.33%_20.83%]" data-name="Group">
      <div className="absolute inset-[8.33%_20.83%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 58.333 83.3328">
          <path d={svgPaths.pe1c8d80} fill="var(--fill-0, white)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[27.08%_39.58%_52.08%_39.58%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.8331 20.8333">
          <path d={svgPaths.p1f3d1f00} fill="var(--fill-0, #FF6B6B)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Icon3() {
  return (
    <div className="h-[100px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group3 />
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[24px] size-[100px] top-[24px]" data-name="Container">
      <Icon3 />
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute bg-gradient-to-b from-[#ffb88c] left-[202px] rounded-[28px] shadow-[0px_16px_32px_0px_rgba(255,154,108,0.4)] size-[148px] to-[#ff9a6c] top-0" data-name="Container">
      <Container28 />
      <Container29 />
    </div>
  );
}

function Container31() {
  return <div className="absolute bg-gradient-to-b from-white h-[16px] left-[8px] rounded-[33554400px] shadow-[0px_3px_6px_0px_rgba(0,0,0,0.06)] to-[#f5f8fa] top-[12px] w-[48px]" data-name="Container" />;
}

function Container32() {
  return <div className="absolute bg-gradient-to-b from-white h-[20px] left-0 rounded-[33554400px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] to-[#f5f8fa] top-[6px] w-[28px]" data-name="Container" />;
}

function Container33() {
  return <div className="absolute bg-gradient-to-b from-white h-[24px] left-[16px] rounded-[33554400px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] to-[#f5f8fa] top-0 w-[32px]" data-name="Container" />;
}

function Container34() {
  return <div className="absolute bg-gradient-to-b from-white h-[20px] left-[40px] rounded-[33554400px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] to-[#f5f8fa] top-[6px] w-[24px]" data-name="Container" />;
}

function Cloud3() {
  return (
    <div className="absolute h-[28px] left-[457px] top-[71.5px] w-[64px]" data-name="Cloud3">
      <Container31 />
      <Container32 />
      <Container33 />
      <Container34 />
    </div>
  );
}

function Container35() {
  return <div className="absolute bg-gradient-to-b from-white h-[24px] left-[16px] rounded-[33554400px] shadow-[0px_5px_10px_0px_rgba(0,0,0,0.09)] to-[#edf2f7] top-[20px] w-[80px]" data-name="Container" />;
}

function Container36() {
  return <div className="absolute bg-gradient-to-b from-white h-[32px] left-[4px] rounded-[33554400px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.07)] to-[#edf2f7] top-[6px] w-[40px]" data-name="Container" />;
}

function Container37() {
  return <div className="absolute bg-gradient-to-b from-white h-[36px] left-[22.39px] rounded-[33554400px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.07)] to-[#edf2f7] top-[4px] w-[44px]" data-name="Container" />;
}

function Container38() {
  return <div className="absolute bg-gradient-to-b from-white h-[40px] left-[32px] rounded-[33554400px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.07)] to-[#edf2f7] top-0 w-[48px]" data-name="Container" />;
}

function Container39() {
  return <div className="absolute bg-gradient-to-b from-white h-[28px] left-[72px] rounded-[33554400px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.07)] to-[#edf2f7] top-[10px] w-[36px]" data-name="Container" />;
}

function Cloud5() {
  return (
    <div className="absolute h-[44px] left-[6px] top-[49.5px] w-[112px]" data-name="Cloud5">
      <Container35 />
      <Container36 />
      <Container37 />
      <Container38 />
      <Container39 />
    </div>
  );
}

function Container41() {
  return <div className="absolute bg-[rgba(255,255,255,0.3)] blur-[24px] h-[64px] left-[50px] rounded-[33554400px] top-[-14.5px] w-[128px]" data-name="Container" />;
}

function Group1() {
  return <div className="h-0 shrink-0 w-full" data-name="Group1" />;
}

function Icon1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[120px] items-start left-[234px] overflow-clip pb-0 pl-[-1466.5px] pr-[1556.5px] pt-[-682.5px] top-[55px] w-[90px]" data-name="Icon1">
      <Group1 />
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute h-[70px] left-[55px] top-[70px] w-[60px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 60 70">
        <g clipPath="url(#clip0_27_431)" id="Icon">
          <path d="M10 0L0 70H60L50 0H10Z" fill="url(#paint0_linear_27_431)" id="Vector" />
          <g id="Vector_2" opacity="0.1"></g>
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_27_431" x1="1800" x2="1800" y1="0" y2="4900">
            <stop stopColor="#9B8670" />
            <stop offset="0.5" stopColor="#8A7560" />
            <stop offset="1" stopColor="#6B5B4A" />
          </linearGradient>
          <clipPath id="clip0_27_431">
            <rect fill="white" height="70" width="60" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon5() {
  return (
    <div className="absolute h-[60px] left-0 top-[30px] w-[70px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70 60">
        <g id="Icon">
          <path d="M60 0L70 60H15L40 0H60Z" fill="url(#paint0_linear_27_413)" id="Vector" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_27_413" x1="2490" x2="2326.42" y1="-2.23517e-06" y2="3598.81">
            <stop stopColor="#9B8670" />
            <stop offset="1" stopColor="#6B5B4A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Icon6() {
  return (
    <div className="absolute h-[60px] left-[100px] top-[30px] w-[70px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 70 60">
        <g id="Icon">
          <path d="M10 0L0 60H55L30 0H10Z" fill="url(#paint0_linear_27_385)" id="Vector" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_27_385" x1="1512.5" x2="1512.5" y1="0" y2="3600">
            <stop stopColor="#9B8670" />
            <stop offset="1" stopColor="#6B5B4A" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Container42() {
  return <div className="absolute bg-[#5a4a3a] border border-black border-solid left-[8px] rounded-[33554400px] size-[6px] top-[45px]" data-name="Container" />;
}

function Container43() {
  return <div className="absolute bg-[#6a5a4a] border border-black border-solid left-[18px] rounded-[33554400px] size-[5px] top-[60px]" data-name="Container" />;
}

function Container44() {
  return <div className="absolute bg-[#5a4a3a] border border-black border-solid left-[5px] rounded-[33554400px] size-[4px] top-[75px]" data-name="Container" />;
}

function Container45() {
  return <div className="absolute bg-[#5a4a3a] border border-black border-solid left-[156px] rounded-[33554400px] size-[6px] top-[45px]" data-name="Container" />;
}

function Container46() {
  return <div className="absolute bg-[#6a5a4a] border border-black border-solid left-[147px] rounded-[33554400px] size-[5px] top-[60px]" data-name="Container" />;
}

function Container47() {
  return <div className="absolute bg-[#5a4a3a] border border-black border-solid left-[161px] rounded-[33554400px] size-[4px] top-[75px]" data-name="Container" />;
}

function Container48() {
  return <div className="absolute bg-gradient-to-b from-[#4a7060] h-[6px] left-0 rounded-tl-[33554400px] rounded-tr-[33554400px] to-[#2d5f3f] top-0 w-[3px]" data-name="Container" />;
}

function Container49() {
  return <div className="absolute bg-gradient-to-b from-[#4a7060] h-[6px] left-[2px] rounded-tl-[33554400px] rounded-tr-[33554400px] to-[#2d5f3f] top-[3px] w-[3px]" data-name="Container" />;
}

function Container50() {
  return (
    <div className="absolute h-[9px] left-[25px] top-[38px] w-[5px]" data-name="Container">
      <Container48 />
      <Container49 />
    </div>
  );
}

function Container51() {
  return <div className="absolute bg-gradient-to-b from-[#4a7060] h-[6px] left-0 rounded-tl-[33554400px] rounded-tr-[33554400px] to-[#2d5f3f] top-0 w-[3px]" data-name="Container" />;
}

function Container52() {
  return <div className="absolute bg-gradient-to-b from-[#4a7060] h-[6px] left-[2px] rounded-tl-[33554400px] rounded-tr-[33554400px] to-[#2d5f3f] top-[3px] w-[3px]" data-name="Container" />;
}

function Container53() {
  return (
    <div className="absolute h-[9px] left-[140px] top-[38px] w-[5px]" data-name="Container">
      <Container51 />
      <Container52 />
    </div>
  );
}

function Container54() {
  return <div className="absolute bg-gradient-to-b border-black border-l-2 border-r-2 border-solid from-[#6b4423] h-[22px] left-[17px] to-[#5a3a1f] top-[28px] w-[6px]" data-name="Container" />;
}

function Text3() {
  return (
    <div className="h-[16px] relative shrink-0 w-[21.969px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#0a0a0a] text-[16px] top-[-2px]">🚶</p>
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="bg-gradient-to-b content-stretch flex from-[#f5deb3] h-[16px] items-center justify-center p-[2px] relative rounded-[6px] shrink-0 to-[#d4b896] w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-2 border-[#6b4423] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Text3 />
    </div>
  );
}

function Container56() {
  return (
    <div className="absolute bg-gradient-to-b content-stretch flex flex-col from-[#8b6b4a] h-[28px] items-start left-0 pb-[3px] pt-[6px] px-[6px] rounded-[6px] to-[#6b5b3a] top-0 w-[40px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none rounded-[6px] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]" />
      <Container55 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="absolute left-[-8px] size-[12px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_27_380)" id="Icon">
          <path d="M0 6L8 2V10L0 6Z" fill="var(--fill-0, #2D5F3F)" id="Vector" stroke="var(--stroke-0, black)" />
        </g>
        <defs>
          <clipPath id="clip0_27_380">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container57() {
  return (
    <div className="absolute h-[28px] left-[15px] top-[12px] w-[40px]" data-name="Container">
      <Container54 />
      <Container56 />
      <Icon7 />
    </div>
  );
}

function Container58() {
  return <div className="absolute bg-gradient-to-b border-black border-l-2 border-r-2 border-solid from-[#6b4423] h-[22px] left-[17px] to-[#5a3a1f] top-[28px] w-[6px]" data-name="Container" />;
}

function Text4() {
  return (
    <div className="h-[16px] relative shrink-0 w-[21.969px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[16px] left-0 not-italic text-[#0a0a0a] text-[16px] top-[-2px]">🚗</p>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="bg-gradient-to-b content-stretch flex from-[#f5deb3] h-[16px] items-center justify-center p-[2px] relative rounded-[6px] shrink-0 to-[#d4b896] w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-2 border-[#6b4423] border-solid inset-0 pointer-events-none rounded-[6px]" />
      <Text4 />
    </div>
  );
}

function Container60() {
  return (
    <div className="absolute bg-gradient-to-b content-stretch flex flex-col from-[#8b6b4a] h-[28px] items-start left-0 pb-[3px] pt-[6px] px-[6px] rounded-[6px] to-[#6b5b3a] top-0 w-[40px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none rounded-[6px] shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]" />
      <Container59 />
    </div>
  );
}

function Icon8() {
  return (
    <div className="absolute left-[36px] size-[12px] top-[8px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        <g clipPath="url(#clip0_27_426)" id="Icon">
          <path d="M12 6L4 2V10L12 6Z" fill="var(--fill-0, #2D5F3F)" id="Vector" stroke="var(--stroke-0, black)" />
        </g>
        <defs>
          <clipPath id="clip0_27_426">
            <rect fill="white" height="12" width="12" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container61() {
  return (
    <div className="absolute h-[28px] left-[115px] top-[12px] w-[40px]" data-name="Container">
      <Container58 />
      <Container60 />
      <Icon8 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[56.25%_10%_6.25%_10%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 6">
          <path d={svgPaths.pb7a5d00} fill="url(#paint0_radial_27_411)" id="Vector" />
          <defs>
            <radialGradient cx="0" cy="0" gradientTransform="translate(8 3) scale(8 3)" gradientUnits="userSpaceOnUse" id="paint0_radial_27_411" r="1">
              <stop stopOpacity="0.3" />
              <stop offset="1" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[12.5%_20%]" data-name="Vector">
        <div className="absolute inset-[-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5 13.5">
            <path d={svgPaths.p2617b300} fill="url(#paint0_radial_27_422)" id="Vector" stroke="var(--stroke-0, #1F4A2F)" strokeWidth="1.5" />
            <defs>
              <radialGradient cx="0" cy="0" gradientTransform="translate(6.75 6.75) scale(6)" gradientUnits="userSpaceOnUse" id="paint0_radial_27_422" r="1">
                <stop stopColor="#4A7060" />
                <stop offset="1" stopColor="#2D5F3F" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[12.5%] left-[5%] right-[45%] top-1/4" data-name="Vector">
        <div className="absolute inset-[-7.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.5 11.5">
            <path d={svgPaths.p1ba1bc00} fill="url(#paint0_radial_27_383)" id="Vector" stroke="var(--stroke-0, #1F4A2F)" strokeWidth="1.5" />
            <defs>
              <radialGradient cx="0" cy="0" gradientTransform="translate(5.75 5.75) scale(5)" gradientUnits="userSpaceOnUse" id="paint0_radial_27_383" r="1">
                <stop stopColor="#3D6E50" />
                <stop offset="1" stopColor="#2D5F3F" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[12.5%] left-[45%] right-[5%] top-1/4" data-name="Vector">
        <div className="absolute inset-[-7.5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.5 11.5">
            <path d={svgPaths.p1ba1bc00} fill="url(#paint0_radial_27_383)" id="Vector" stroke="var(--stroke-0, #1F4A2F)" strokeWidth="1.5" />
            <defs>
              <radialGradient cx="0" cy="0" gradientTransform="translate(5.75 5.75) scale(5)" gradientUnits="userSpaceOnUse" id="paint0_radial_27_383" r="1">
                <stop stopColor="#3D6E50" />
                <stop offset="1" stopColor="#2D5F3F" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div className="absolute inset-[12.5%_30%_37.5%_30%]" data-name="Vector">
        <div className="absolute inset-[-9.38%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.5 9.5">
            <path d={svgPaths.p1f8c1310} fill="url(#paint0_radial_27_409)" id="Vector" stroke="var(--stroke-0, #1F4A2F)" strokeWidth="1.5" />
            <defs>
              <radialGradient cx="0" cy="0" gradientTransform="translate(4.75 4.75) scale(4)" gradientUnits="userSpaceOnUse" id="paint0_radial_27_409" r="1">
                <stop stopColor="#5A8070" />
                <stop offset="1" stopColor="#3D6E50" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container62() {
  return (
    <div className="absolute content-stretch flex flex-col h-[16px] items-start left-[75px] top-[55px] w-[20px]" data-name="Container">
      <Icon9 />
    </div>
  );
}

function Crossroad() {
  return (
    <div className="absolute h-[140px] left-[85px] top-[50px] w-[170px]" data-name="Crossroad">
      <Icon4 />
      <Icon5 />
      <Icon6 />
      <Container42 />
      <Container43 />
      <Container44 />
      <Container45 />
      <Container46 />
      <Container47 />
      <Container50 />
      <Container53 />
      <Container57 />
      <Container61 />
      <Container62 />
    </div>
  );
}

function Container11() {
  return <div className="absolute bg-gradient-to-b from-white h-[24px] left-[12px] rounded-[33554400px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.08)] to-[#f0f4f8] top-[16px] w-[72px]" data-name="Container11" />;
}

function Container12() {
  return <div className="absolute bg-gradient-to-b from-white h-[32px] left-0 rounded-[33554400px] shadow-[0px_3px_6px_0px_rgba(0,0,0,0.06)] to-[#f0f4f8] top-[4px] w-[40px]" data-name="Container12" />;
}

function Container13() {
  return <div className="absolute bg-gradient-to-b from-white h-[36px] left-[24px] rounded-[33554400px] shadow-[0px_3px_6px_0px_rgba(0,0,0,0.06)] to-[#f0f4f8] top-0 w-[48px]" data-name="Container13" />;
}

function Container14() {
  return <div className="absolute bg-gradient-to-b from-white h-[28px] left-[60px] rounded-[33554400px] shadow-[0px_3px_6px_0px_rgba(0,0,0,0.06)] to-[#f0f4f8] top-[8px] w-[36px]" data-name="Container14" />;
}

function Cloud() {
  return (
    <div className="absolute h-[40px] left-[13px] top-[-179.5px] w-[96px]" data-name="Cloud">
      <Container11 />
      <Container12 />
      <Container13 />
      <Container14 />
    </div>
  );
}

function Container40() {
  return <div className="absolute bg-[rgba(255,255,255,0.2)] blur-[24px] h-[56px] left-[180px] rounded-[33554400px] top-[-28.5px] w-[112px]" data-name="Container40" />;
}

function Y() {
  return (
    <div className="absolute h-[175px] left-[96px] top-[161.5px] w-[324px]" data-name="Y루트">
      <Icon1 />
      <Crossroad />
      <Cloud />
      <Container40 />
    </div>
  );
}

function Container63() {
  return (
    <div className="absolute h-[355px] left-[600px] top-[90px] w-[552px]" data-name="Container">
      <Container18 />
      <Cloud4 />
      <Cloud2 />
      <Container30 />
      <Cloud3 />
      <Cloud5 />
      <Container41 />
      <Y />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute inset-[35.71%_8.33%_7.14%_8.33%]" data-name="Group">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 125 116">
        <g id="Group">
          <path d={svgPaths.p34e57100} fill="var(--fill-0, #D4A574)" id="Vector" />
          <path d={svgPaths.p17cbd100} fill="var(--fill-0, #D4A574)" id="Vector_2" />
          <path d={svgPaths.p2f4740f0} fill="var(--fill-0, #C49764)" id="Vector_3" />
          <path d={svgPaths.p28439a80} fill="var(--fill-0, #B8845F)" id="Vector_4" />
          <path d={svgPaths.pa312100} fill="var(--fill-0, #A57050)" id="Vector_5" />
          <path d={svgPaths.pbf06600} fill="var(--fill-0, #B8845F)" id="Vector_6" />
          <path d={svgPaths.p6e89bc0} fill="var(--fill-0, #A57050)" id="Vector_7" />
          <path d={svgPaths.p237908f0} fill="var(--fill-0, #D4A574)" id="Vector_8" />
          <path d={svgPaths.p37055800} fill="var(--fill-0, black)" id="Vector_9" />
          <path d={svgPaths.p2eee0100} fill="var(--fill-0, black)" id="Vector_10" />
          <path d={svgPaths.p20f4c300} fill="var(--fill-0, black)" id="Vector_11" />
          <path d={svgPaths.pd639180} fill="var(--fill-0, #B8845F)" id="Vector_12" />
          <path d={svgPaths.p34c38500} fill="var(--fill-0, #B8845F)" id="Vector_13" />
        </g>
      </svg>
    </div>
  );
}

function Icon10() {
  return (
    <div className="absolute h-[203px] left-0 overflow-clip top-[-28px] w-[150px]" data-name="Icon">
      <Group4 />
    </div>
  );
}

function Container64() {
  return <div className="absolute bg-[rgba(0,0,0,0.2)] blur-[12px] h-[24px] left-[12px] rounded-[33554400px] top-[151px] w-[120px]" data-name="Container" />;
}

function Character() {
  return (
    <div className="absolute h-[192px] left-[790px] top-[333.5px] w-[173px]" data-name="Character">
      <Icon10 />
      <Container64 />
    </div>
  );
}

function Container65() {
  return <div className="absolute bg-[rgba(255,255,255,0.25)] blur-[40px] h-[80px] left-[996.22px] rounded-[33554400px] top-[-13.5px] w-[160px]" data-name="Container" />;
}

function Container66() {
  return <div className="absolute bg-[rgba(255,255,255,0.2)] blur-[24px] h-[56px] left-[917px] rounded-[33554400px] top-[308.52px] w-[112px]" data-name="Container" />;
}

function Container67({ onStart }: { onStart?: () => void }) {
  return (
    <div className="absolute h-[535px] left-[64px] top-[65.5px] w-[1152px]" data-name="Container">
      <Container9 onStart={onStart} />
      <Container63 />
      <Character />
      <Container65 />
      <Container66 />
    </div>
  );
}

function Container68() {
  return <div className="absolute bg-gradient-to-b from-white h-[12px] left-[6px] rounded-[33554400px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.05)] to-[#f5f8fa] top-[12px] w-[44px]" data-name="Container" />;
}

function Container69() {
  return <div className="absolute bg-gradient-to-b from-white h-[16px] left-0 rounded-[33554400px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.04)] to-[#f5f8fa] top-[8px] w-[24px]" data-name="Container" />;
}

function Container70() {
  return <div className="absolute bg-gradient-to-b from-white h-[20px] left-[14px] rounded-[33554400px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.04)] to-[#f5f8fa] top-0 w-[28px]" data-name="Container" />;
}

function Container71() {
  return <div className="absolute bg-gradient-to-b from-white h-[16px] left-[36px] rounded-[33554400px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.04)] to-[#f5f8fa] top-[8px] w-[20px]" data-name="Container" />;
}

function Cloud6() {
  return (
    <div className="absolute h-[24px] left-[1173px] top-[378px] w-[56px]" data-name="Cloud6">
      <Container68 />
      <Container69 />
      <Container70 />
      <Container71 />
    </div>
  );
}

function Text5() {
  return <div className="h-[20px] shrink-0 w-[5.859px]" data-name="Text" />;
}

function Link() {
  return (
    <div className="h-[16px] relative shrink-0 w-[48px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="css-4hzbpn flex-[1_0_0] font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px relative text-[#6a7282] text-[12px]">이용약관</p>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="h-[16px] relative shrink-0 w-[96px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="css-4hzbpn flex-[1_0_0] font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px relative text-[#6a7282] text-[12px]">개인정보처리방침</p>
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="h-[16px] relative shrink-0 w-[48px]" data-name="Link">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
        <p className="css-4hzbpn flex-[1_0_0] font-['Arimo:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] min-h-px min-w-px relative text-[#6a7282] text-[12px]">고객센터</p>
      </div>
    </div>
  );
}

function Container72() {
  return (
    <div className="h-[20px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[16px] items-center justify-center pl-0 pr-[0.016px] py-0 relative size-full">
          <Text5 />
          <Link />
          <p className="css-ew64yg font-['Arial:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#6b9080] text-[14px]">•</p>
          <Link1 />
          <p className="css-ew64yg font-['Arial:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[#6b9080] text-[14px]">•</p>
          <Link2 />
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="absolute content-stretch flex flex-col h-[54px] items-start left-0 pb-0 pt-[18px] px-0 top-[666px] w-[1280px]" data-name="Footer">
      <div aria-hidden="true" className="absolute border-[#e0e0e0] border-solid border-t-2 inset-0 pointer-events-none" />
      <Container72 />
    </div>
  );
}

function Container73({ onStart }: { onStart?: () => void }) {
  return (
    <div className="absolute h-[720px] left-0 right-0 mx-auto top-0 w-[1280px]" data-name="Container">
      <Container67 onStart={onStart} />
      <Cloud6 />
      <Footer />
    </div>
  );
}

export default function Component({ onStart }: { onStart?: () => void }) {
  return (
    <div className="bg-gradient-to-b from-[#c5e7f5] overflow-clip relative rounded-[10px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] size-full to-white via-1/2 via-[#e8f5fa]" data-name="초기화면(웹)">
      <Container3 />
      <Container73 onStart={onStart} />
    </div>
  );
}