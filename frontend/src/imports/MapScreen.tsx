import svgPaths from "./svg-nni0mtpei5";
import { AnimatedCharacter } from "@/components/AnimatedCharacter";

function Container() {
  return <div className="absolute border-[#e5e7eb] border-b border-solid h-[36px] left-[0.17px] top-[0.2px] w-[47px]" data-name="Container" />;
}

function Icon() {
  return (
    <div className="absolute inset-[20.83%]" data-name="Icon">
      <div className="absolute inset-[-10.71%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.3334 11.3334">
          <g id="Icon">
            <path d="M1 5.66667H10.3334" id="Vector" stroke="var(--stroke-0, #2D5F3F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            <path d="M5.66667 1V10.3334" id="Vector_2" stroke="var(--stroke-0, #2D5F3F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="overflow-clip relative shrink-0 size-[16px]" data-name="Icon">
      <Icon />
    </div>
  );
}

function Wrapper() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[16.17px] size-[16px] top-[9.2px]" data-name="Wrapper">
      <Icon1 />
    </div>
  );
}

function Button() {
  return (
    <div className="absolute h-[36px] left-[-0.03px] top-[4px] w-[35.469px]" data-name="Button">
      <Container />
      <Wrapper />
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute bottom-1/2 contents left-[20.83%] right-[20.83%] top-1/2" data-name="Icon">
      <div className="absolute bottom-1/2 left-[20.83%] right-[20.83%] top-1/2" data-name="Vector">
        <div className="absolute inset-[-1px_-10.71%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.3334 2">
            <path d="M1 1H10.3334" id="Vector" stroke="var(--stroke-0, #2D5F3F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon5() {
  return (
    <div className="h-[16px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Icon4 />
    </div>
  );
}

function Wrapper3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[15.97px] size-[16px] top-[44px]" data-name="Wrapper">
      <Icon5 />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[74px] left-[0.03px] overflow-clip rounded-[12px] top-[-1px] w-[46px]" data-name="Container">
      <Button />
      <Wrapper3 />
    </div>
  );
}

function Container13() {
  return <div className="absolute bg-[rgba(255,255,255,0)] border-3 border-black border-solid h-[73px] left-0 rounded-[12px] shadow-[4px_4px_0px_0px_black] top-[-1px] w-[48px]" data-name="Container" />;
}

function ZoomControl() {
  return (
    <div className="absolute bg-white h-[73px] left-[881px] rounded-[12px] top-[598px] w-[48px]" data-name="ZoomControl">
      <Container1 />
      <Container13 />
    </div>
  );
}

function Container18() {
  return <div className="absolute bg-[rgba(255,255,255,0)] border-3 border-black border-solid left-0 rounded-[12px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] size-[48px] top-0" data-name="Container" />;
}

function Icon6() {
  return (
    <div className="h-[5.313px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[12.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.3125 5.3125">
            <path d={svgPaths.p2fec1880} id="Vector" stroke="var(--stroke-0, #2D5F3F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.32812" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon2Vector() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[9.34px] size-[5.313px] top-[1.34px]" data-name="Icon2Vector">
      <Icon6 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="h-[5.984px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[11.11%]" data-name="Vector">
        <div className="absolute inset-[-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.98437 5.98437">
            <path d={svgPaths.p1a760a00} id="Vector" stroke="var(--stroke-0, #2D5F3F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.32986" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon2Vector1() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[8.67px] size-[5.984px] top-[1.34px]" data-name="Icon2Vector1">
      <Icon9 />
    </div>
  );
}

function Icon11() {
  return (
    <div className="h-[5.984px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[11.11%]" data-name="Vector">
        <div className="absolute inset-[-14.29%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.98437 5.98437">
            <path d={svgPaths.pdd7a280} id="Vector" stroke="var(--stroke-0, #2D5F3F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.32986" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon2Vector2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[1.34px] size-[5.984px] top-[8.67px]" data-name="Icon2Vector1">
      <Icon11 />
    </div>
  );
}

function Icon12() {
  return (
    <div className="h-[5.313px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[12.5%]" data-name="Vector">
        <div className="absolute inset-[-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.3125 5.3125">
            <path d={svgPaths.p1acfdd00} id="Vector" stroke="var(--stroke-0, #2D5F3F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.32812" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon2Vector3() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[1.34px] size-[5.313px] top-[9.34px]" data-name="Icon2Vector">
      <Icon12 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute left-[16px] overflow-clip size-[16px] top-[16px]" data-name="Icon2">
      <Icon2Vector />
      <Icon2Vector1 />
      <Icon2Vector2 />
      <Icon2Vector3 />
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute left-0 size-[48px] top-0" data-name="Container">
      <Icon2 />
    </div>
  );
}

function MapControlButton() {
  return (
    <div className="absolute bg-white left-[882.02px] rounded-[12px] shadow-[4px_4px_0px_0px_black] size-[48px] top-[681.02px]" data-name="MapControlButton">
      <Container18 />
      <Container22 />
    </div>
  );
}

function Text() {
  return (
    <div className="absolute h-[15.984px] left-[7.99px] top-[10.01px] w-[12px]" data-name="Text">
      <p className="absolute css-ew64yg font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[16px] left-0 text-[12px] text-white top-[-2.5px]">출</p>
    </div>
  );
}

function Container23() {
  return <div className="absolute border-[rgba(0,0,0,0)] border-l-6 border-r-6 border-solid border-t-3 h-[3px] left-[7.99px] opacity-0 top-[33px] w-[12px]" data-name="Container" />;
}

function LocationPin() {
  return (
    <div className="absolute bg-[#2b7fff] h-[36px] left-[11px] rounded-br-[50331600px] rounded-tl-[50331600px] rounded-tr-[50331600px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] top-[32px] w-[27.984px]" data-name="LocationPin">
      <Text />
      <Container23 />
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute h-[15.984px] left-[7.99px] top-[10.01px] w-[12px]" data-name="Text">
      <p className="absolute css-ew64yg font-['Arimo:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[16px] left-0 text-[12px] text-white top-[-2.5px]">도</p>
    </div>
  );
}

function Container24() {
  return <div className="absolute border-[rgba(0,0,0,0)] border-l-6 border-r-6 border-solid border-t-3 h-[3px] left-[7.99px] opacity-0 top-[33px] w-[12px]" data-name="Container" />;
}

function LocationPin1() {
  return (
    <div className="absolute bg-[#fb2c36] h-[36px] left-[11px] rounded-br-[50331600px] rounded-tl-[50331600px] rounded-tr-[50331600px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] top-[78px] w-[27.984px]" data-name="LocationPin">
      <Text1 />
      <Container24 />
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute bg-[#155dfc] left-[229px] rounded-[33554400px] size-[23px] top-[474px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-3 border-solid border-white inset-0 pointer-events-none rounded-[33554400px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute h-[744px] left-0 overflow-clip top-[-24px] w-[940px]" data-name="Icon3">
      <ZoomControl />
      <MapControlButton />
      <LocationPin />
      <LocationPin1 />
      <Container25 />
    </div>
  );
}

function Container2() {
  return <div className="absolute bg-[#b8e6b8] h-[140px] left-[200px] opacity-60 rounded-[20px] top-[100px] w-[180px]" data-name="Container2" />;
}

function Container3() {
  return <div className="absolute bg-[#b8e6b8] h-[180px] left-[570px] opacity-60 rounded-[30px] top-[460px] w-[220px]" data-name="Container3" />;
}

function Container4() {
  return <div className="absolute bg-[#b8e6b8] h-[120px] left-[450px] opacity-50 rounded-[15px] top-[280px] w-[140px]" data-name="Container4" />;
}

function Container5() {
  return <div className="absolute bg-[#b3ddf0] h-[200px] left-0 opacity-50 rounded-tr-[100px] top-[520px] w-[300px]" data-name="Container5" />;
}

function Container6() {
  return (
    <div className="absolute bg-[#e8e8e8] h-[720px] left-0 top-0 w-[940px]" data-name="Container6">
      <Icon3 />
      <Container2 />
      <Container3 />
      <Container4 />
      <Container5 />
    </div>
  );
}

function Container26() {
  return <div className="absolute bg-[rgba(255,255,255,0)] border-3 border-black border-solid left-0 rounded-[33554400px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] size-[40px] top-0" data-name="Container" />;
}

function TextText() {
  return (
    <div className="h-[30px] relative shrink-0 w-full" data-name="TextText">
      <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[30px] left-0 not-italic text-[#0a0a0a] text-[20px] top-0">🏠</p>
    </div>
  );
}

function Wrapper1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[30px] items-start left-[6.27px] pb-0 pt-[-3px] px-0 top-[5px] w-[27.469px]" data-name="Wrapper1">
      <TextText />
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute bg-[#4caf50] left-0 rounded-[33554400px] size-[40px] top-0" data-name="Container7">
      <Container26 />
      <Wrapper1 />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[15px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Arial:Bold',sans-serif] leading-[15px] left-0 not-italic text-[#0a0a0a] text-[10px] top-0">내 집</p>
    </div>
  );
}

function ContainerText() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[27px] items-start left-[-5.75px] opacity-0 pb-[2px] pl-[14px] pr-[16.328px] pt-[5px] rounded-[10px] top-[48px] w-[51.516px]" data-name="ContainerText">
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Paragraph />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute left-[250px] size-[40px] top-[150px]" data-name="Container8">
      <Container7 />
      <ContainerText />
    </div>
  );
}

function Container27() {
  return <div className="absolute bg-[rgba(255,255,255,0)] border-3 border-black border-solid left-0 rounded-[33554400px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] size-[40px] top-0" data-name="Container" />;
}

function TextText1() {
  return (
    <div className="h-[30px] relative shrink-0 w-full" data-name="TextText">
      <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[30px] left-0 not-italic text-[#0a0a0a] text-[20px] top-0">🏢</p>
    </div>
  );
}

function Wrapper4() {
  return (
    <div className="absolute content-stretch flex flex-col h-[30px] items-start left-[6.27px] pb-0 pt-[-3px] px-0 top-[5px] w-[27.469px]" data-name="Wrapper1">
      <TextText1 />
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute bg-[#2196f3] left-0 rounded-[33554400px] size-[40px] top-0" data-name="Container9">
      <Container27 />
      <Wrapper4 />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[15px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Arial:Bold',sans-serif] leading-[15px] left-0 not-italic text-[#0a0a0a] text-[10px] top-0">회사/학교</p>
    </div>
  );
}

function ContainerText1() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[27px] items-start left-[-16.19px] opacity-0 pb-[2px] pl-[14px] pr-[18.797px] pt-[5px] rounded-[10px] top-[48px] w-[72.391px]" data-name="ContainerText">
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Paragraph1 />
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute left-[480px] size-[40px] top-[320px]" data-name="Container10">
      <Container9 />
      <ContainerText1 />
    </div>
  );
}

function Container28() {
  return <div className="absolute bg-[rgba(255,255,255,0)] border-3 border-black border-solid left-0 rounded-[33554400px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] size-[40px] top-0" data-name="Container" />;
}

function TextText2() {
  return (
    <div className="h-[30px] relative shrink-0 w-full" data-name="TextText">
      <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[30px] left-0 not-italic text-[#0a0a0a] text-[20px] top-0">⭐</p>
    </div>
  );
}

function Wrapper5() {
  return (
    <div className="absolute content-stretch flex flex-col h-[30px] items-start left-[6.27px] pb-0 pt-[-3px] px-0 top-[5px] w-[27.469px]" data-name="Wrapper1">
      <TextText2 />
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute bg-[#ffc107] left-0 rounded-[33554400px] size-[40px] top-0" data-name="Container11">
      <Container28 />
      <Wrapper5 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[15px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Arial:Bold',sans-serif] leading-[15px] left-0 not-italic text-[#0a0a0a] text-[10px] top-0">즐겨찾기</p>
    </div>
  );
}

function ContainerText2() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[27px] items-start left-[-14px] opacity-0 pb-[2px] pl-[14px] pr-[17.188px] pt-[5px] rounded-[10px] top-[48px] w-[68px]" data-name="ContainerText">
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
      <Paragraph2 />
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute left-[620px] size-[40px] top-[200px]" data-name="Container12">
      <Container11 />
      <ContainerText2 />
    </div>
  );
}

function Container29() {
  return <div className="absolute bg-[rgba(255,255,255,0)] border-3 border-black border-solid left-0 rounded-[12px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] size-[48px] top-0" data-name="Container" />;
}

function Icon13() {
  return (
    <div className="absolute contents inset-[20.83%_16.67%]" data-name="Icon">
      <div className="absolute inset-[20.83%_16.67%_79.17%_16.67%]" data-name="Vector">
        <div className="absolute inset-[-1px_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
            <path d="M1 1H17" id="Vector" stroke="var(--stroke-0, #2D5F3F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-1/2 left-[16.67%] right-[16.67%] top-1/2" data-name="Vector_2">
        <div className="absolute inset-[-1px_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
            <path d="M1 1H17" id="Vector" stroke="var(--stroke-0, #2D5F3F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[79.17%_16.67%_20.83%_16.67%]" data-name="Vector_3">
        <div className="absolute inset-[-1px_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
            <path d="M1 1H17" id="Vector" stroke="var(--stroke-0, #2D5F3F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon14() {
  return (
    <div className="h-[24px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Icon13 />
    </div>
  );
}

function Icon10() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[12px] size-[24px] top-[12px]" data-name="Icon10">
      <Icon14 />
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute left-0 size-[48px] top-0" data-name="Container">
      <Icon10 />
    </div>
  );
}

function Button8() {
  return (
    <div className="absolute bg-white left-0 rounded-[12px] size-[48px] top-0" data-name="Button8">
      <Container29 />
      <Container30 />
    </div>
  );
}

function Container31() {
  return <div className="absolute bg-[rgba(255,255,255,0)] border-3 border-black border-solid h-[44.5px] left-0 rounded-[12px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] top-0 w-[48px]" data-name="Container" />;
}

function Icon15() {
  return (
    <div className="absolute contents inset-[8.33%_8.33%_12.5%_12.5%]" data-name="Icon">
      <div className="absolute inset-[8.33%_8.33%_12.5%_12.5%]" data-name="Vector">
        <div className="absolute inset-[-5.26%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.0001 21.0001">
            <path d={svgPaths.p17b1d570} id="Vector" stroke="var(--stroke-0, #2D5F3F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon16() {
  return (
    <div className="h-[24px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Icon15 />
    </div>
  );
}

function Icon17() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[12px] size-[24px] top-[10.25px]" data-name="Icon10">
      <Icon16 />
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute h-[44.5px] left-0 top-0 w-[48px]" data-name="Container">
      <Icon17 />
    </div>
  );
}

function Button9() {
  return (
    <div className="absolute bg-white h-[44.5px] left-0 rounded-[12px] top-[56px] w-[48px]" data-name="Button8">
      <Container31 />
      <Container32 />
    </div>
  );
}

function Container33() {
  return <div className="absolute bg-[rgba(255,255,255,0)] border-3 border-black border-solid h-[44.5px] left-0 rounded-[12px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] top-0 w-[48px]" data-name="Container" />;
}

function Icon18() {
  return (
    <div className="absolute contents inset-[8.33%]" data-name="Icon">
      <div className="absolute inset-[8.33%]" data-name="Vector">
        <div className="absolute inset-[-5%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 22 22">
            <path d={svgPaths.pb60700} id="Vector" stroke="var(--stroke-0, #2D5F3F)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-1/2 left-3/4 right-[8.33%] top-1/2" data-name="Vector_2">
        <div className="absolute inset-[-0.67px_-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.33333 1.33333">
            <path d="M4.66667 0.666665H0.666665" id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-1/2 left-[8.33%] right-3/4 top-1/2" data-name="Vector_3">
        <div className="absolute inset-[-0.67px_-16.67%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.33333 1.33333">
            <path d="M4.66667 0.666665H0.666665" id="Vector_2" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-3/4 left-1/2 right-1/2 top-[8.33%]" data-name="Vector_4">
        <div className="absolute inset-[-16.67%_-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.33333 5.33333">
            <path d="M0.666665 4.66667V0.666665" id="Vector_4" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-[8.33%] left-1/2 right-1/2 top-3/4" data-name="Vector_5">
        <div className="absolute inset-[-16.67%_-0.67px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1.33333 5.33333">
            <path d="M0.666665 4.66667V0.666665" id="Vector_4" stroke="var(--stroke-0, #4A5565)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon19() {
  return (
    <div className="h-[24px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Icon18 />
    </div>
  );
}

function Icon20() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-0 size-[24px] top-0" data-name="Icon10">
      <Icon19 />
    </div>
  );
}

function Container51() {
  return (
    <div className="absolute h-[25px] left-[12px] top-[9.75px] w-[24px]" data-name="Container51">
      <Icon20 />
    </div>
  );
}

function Container34() {
  return (
    <div className="absolute h-[44.5px] left-0 top-0 w-[48px]" data-name="Container">
      <Container51 />
    </div>
  );
}

function Button10() {
  return (
    <div className="absolute bg-white h-[44.5px] left-0 rounded-[12px] top-[108.5px] w-[48px]" data-name="Button8">
      <Container33 />
      <Container34 />
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute h-[153px] left-[876px] shadow-[4px_4px_0px_0px_black] top-[16px] w-[48px]" data-name="Container14">
      <Button8 />
      <Button9 />
      <Button10 />
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute bg-[#f5f5f5] h-[720px] left-[340px] top-0 w-[940px]" data-name="Container15">
      <Container6 />
      <Container8 />
      <Container10 />
      <Container12 />
      <Container14 />
    </div>
  );
}

function Container35() {
  return <div className="absolute border-b-3 border-black border-solid h-[131px] left-0 top-0 w-[337px]" data-name="Container" />;
}

function Container16() {
  return <div className="absolute h-0 left-[273px] top-[20px] w-[32px]" data-name="Container16" />;
}

function Icon21() {
  return (
    <div className="h-[2.016px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-1/2 left-[5.56%] right-[5.56%] top-1/2" data-name="Vector">
        <div className="absolute inset-[-1px_-6.27%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18.0078 2.00779">
            <path d="M1.0039 1.0039H17.0039" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.00779" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon7Helper() {
  return (
    <div className="content-stretch flex flex-col h-[2.016px] items-start relative shrink-0 w-full" data-name="Icon7Helper">
      <Icon21 />
    </div>
  );
}

function Icon22() {
  return (
    <div className="h-[2px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute bottom-1/2 left-[5.56%] right-[5.56%] top-1/2" data-name="Vector">
        <div className="absolute inset-[-1px_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
            <path d="M1 1H17" id="Vector" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon7Helper1() {
  return (
    <div className="content-stretch flex flex-col h-[2px] items-start relative shrink-0 w-full" data-name="Icon7Helper">
      <Icon22 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[5px] items-start left-[8px] overflow-clip pb-0 pt-[3.984px] px-[3px] size-[24px] top-[8px]" data-name="Icon7">
      <Icon7Helper />
      <Icon7Helper1 />
      <Icon7Helper />
    </div>
  );
}

function Button5() {
  return (
    <div className="absolute left-0 rounded-[10px] size-[40px] top-0" data-name="Button5">
      <Icon7 />
    </div>
  );
}

function Heading() {
  return (
    <div className="absolute h-[24px] left-[76.5px] top-[8px] w-[160px]" data-name="Heading">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[24px] left-0 not-italic text-[16px] text-white top-0">HAD BETTER</p>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute h-[40px] left-[16px] top-[16px] w-[305px]" data-name="Container17">
      <Container16 />
      <Button5 />
      <Heading />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="absolute h-[19px] left-[40px] top-[12.5px] w-[113.75px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[normal] left-0 not-italic text-[#99a1af] text-[13px] top-[3px]">장소, 주소, 버스 검색</p>
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute h-[44px] left-0 overflow-clip rounded-[12px] top-0 w-[305px]" data-name="Container">
      <Paragraph3 />
    </div>
  );
}

function Container37() {
  return <div className="absolute bg-[rgba(255,255,255,0)] border-3 border-black border-solid h-[44px] left-0 rounded-[12px] shadow-[0px_3px_0px_0px_rgba(0,0,0,0.3)] top-0 w-[305px]" data-name="Container" />;
}

function TextInput() {
  return (
    <div className="absolute bg-white h-[44px] left-0 rounded-[12px] top-0 w-[305px]" data-name="TextInput">
      <Container36 />
      <Container37 />
    </div>
  );
}

function Icon23() {
  return (
    <div className="h-[4.766px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[15.77%]" data-name="Vector">
        <div className="absolute inset-[-23.04%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.76562 4.76562">
            <path d={svgPaths.p3c5f2eb0} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50335" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[11.73px] size-[4.766px] top-[11.73px]" data-name="Container">
      <Icon23 />
    </div>
  );
}

function Icon24() {
  return (
    <div className="h-[13.516px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[5.56%]" data-name="Vector">
        <div className="absolute inset-[-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.5156 13.5156">
            <path d={svgPaths.p1480b100} id="Vector" stroke="var(--stroke-0, #99A1AF)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.50174" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Container39() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[1.5px] size-[13.516px] top-[1.5px]" data-name="Container">
      <Icon24 />
    </div>
  );
}

function Icon8() {
  return (
    <div className="absolute left-[12px] overflow-clip size-[18px] top-[13px]" data-name="Icon8">
      <Container38 />
      <Container39 />
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute h-[44px] left-[16px] top-[68px] w-[305px]" data-name="Container19">
      <TextInput />
      <Icon8 />
    </div>
  );
}

function Container20() {
  return (
    <div className="bg-gradient-to-b from-[rgba(90,141,176,0.8)] h-[131px] relative shrink-0 to-[rgba(74,127,167,0.8)] w-full" data-name="Container20">
      <Container35 />
      <Container17 />
      <Container19 />
    </div>
  );
}

function Container40() {
  return <div className="absolute border-b-3 border-black border-solid h-[43.5px] left-0 top-0 w-[337px]" data-name="Container" />;
}

function Container41() {
  return <div className="absolute border-black border-r-2 border-solid h-[40.5px] left-0 top-0 w-[67.391px]" data-name="Container" />;
}

function Button6() {
  return (
    <div className="absolute h-[16.5px] left-0 top-[12px] w-[65.391px]" data-name="Button6">
      <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[16.5px] left-[33.06px] not-italic text-[#4a5565] text-[11px] text-center top-0 translate-x-[-50%]">검색</p>
    </div>
  );
}

function Container42() {
  return (
    <div className="absolute h-[40.5px] left-0 top-0 w-[67.391px]" data-name="Container">
      <Button6 />
    </div>
  );
}

function Wrapper2() {
  return (
    <div className="absolute h-[40.5px] left-0 top-0 w-[67.391px]" data-name="Wrapper2">
      <Container41 />
      <Container42 />
    </div>
  );
}

function Container43() {
  return <div className="absolute border-black border-r-2 border-solid h-[40.5px] left-0 top-0 w-[67.391px]" data-name="Container" />;
}

function Container21() {
  return (
    <div className="absolute h-[16.5px] left-0 top-[12px] w-[65.391px]" data-name="Container21">
      <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[16.5px] left-[33px] not-italic text-[11px] text-black text-center top-0 translate-x-[-50%]">길찾기</p>
    </div>
  );
}

function Container48() {
  return (
    <div className="absolute h-[40.5px] left-0 top-0 w-[67.391px]" data-name="Container">
      <Container21 />
    </div>
  );
}

function Wrapper6() {
  return (
    <div className="absolute bg-[#c5e7f5] h-[40.5px] left-[67.39px] top-0 w-[67.391px]" data-name="Wrapper2">
      <Container43 />
      <Container48 />
    </div>
  );
}

function Container49() {
  return <div className="absolute border-black border-r-2 border-solid h-[40.5px] left-0 top-0 w-[67.391px]" data-name="Container" />;
}

function Container50() {
  return (
    <div className="absolute h-[16.5px] left-0 top-[12px] w-[65.391px]" data-name="Container21">
      <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[16.5px] left-[33.06px] not-italic text-[#4a5565] text-[11px] text-center top-0 translate-x-[-50%]">버스</p>
    </div>
  );
}

function Container52() {
  return (
    <div className="absolute h-[40.5px] left-0 top-0 w-[67.391px]" data-name="Container">
      <Container50 />
    </div>
  );
}

function Wrapper7() {
  return (
    <div className="absolute h-[40.5px] left-[134.78px] top-0 w-[67.391px]" data-name="Wrapper2">
      <Container49 />
      <Container52 />
    </div>
  );
}

function Container53() {
  return <div className="absolute border-black border-r-2 border-solid h-[40.5px] left-0 top-0 w-[67.391px]" data-name="Container" />;
}

function Container54() {
  return (
    <div className="absolute h-[16.5px] left-0 top-[12px] w-[65.391px]" data-name="Container21">
      <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[16.5px] left-[33px] not-italic text-[#4a5565] text-[11px] text-center top-0 translate-x-[-50%]">지하철</p>
    </div>
  );
}

function Container55() {
  return (
    <div className="absolute h-[40.5px] left-0 top-0 w-[67.391px]" data-name="Container">
      <Container54 />
    </div>
  );
}

function Wrapper8() {
  return (
    <div className="absolute h-[40.5px] left-[202.17px] top-0 w-[67.391px]" data-name="Wrapper2">
      <Container53 />
      <Container55 />
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute h-[16.5px] left-0 top-[12px] w-[67.391px]" data-name="Button">
      <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[16.5px] left-[33.94px] not-italic text-[#4a5565] text-[11px] text-center top-0 translate-x-[-50%]">MY</p>
    </div>
  );
}

function Button7() {
  return (
    <div className="absolute h-[40.5px] left-[269.56px] top-0 w-[67.391px]" data-name="Button7">
      <Button1 />
    </div>
  );
}

function Container56() {
  return (
    <div className="bg-white h-[43.5px] relative shrink-0 w-full" data-name="Container21">
      <Container40 />
      <Wrapper2 />
      <Wrapper6 />
      <Wrapper7 />
      <Wrapper8 />
      <Button7 />
    </div>
  );
}

function Container57() {
  return <div className="bg-[#4caf50] rounded-[33554400px] shrink-0 size-[8px]" data-name="Container" />;
}

function TextInput1() {
  return (
    <div className="content-stretch flex h-[18px] items-center overflow-clip relative shrink-0 w-full" data-name="Text Input">
      <p className="css-ew64yg font-['Arial:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] text-[rgba(10,10,10,0.5)]">출발지 입력</p>
    </div>
  );
}

function Container58() {
  return (
    <div className="bg-white flex-[1_0_0] h-[48px] min-h-px min-w-px relative rounded-[8px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-2 border-[#e5e7eb] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[2px] pt-[17px] px-[14px] relative size-full">
        <TextInput1 />
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="absolute content-stretch flex gap-[12px] h-[48px] items-center left-[16px] top-[16px] w-[290px]" data-name="Container">
      <Container57 />
      <Container58 />
    </div>
  );
}

function TextInput2() {
  return (
    <div className="content-stretch flex h-[18px] items-center overflow-clip relative shrink-0 w-full" data-name="Text Input">
      <p className="css-ew64yg font-['Arial:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[12px] text-[rgba(10,10,10,0.5)]">도착지 입력</p>
    </div>
  );
}

function Container60() {
  return (
    <div className="bg-white h-[48px] relative rounded-[8px] shrink-0 w-[270px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-2 border-[#e5e7eb] border-solid inset-0 pointer-events-none rounded-[8px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[2px] pt-[17px] px-[14px] relative size-full">
        <TextInput2 />
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-center left-[36px] top-[75.5px] w-[270px]" data-name="Container">
      <Container60 />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[21px] left-[143.17px] text-[14px] text-center text-white top-0 translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        길찾기
      </p>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-gradient-to-r content-stretch flex flex-col from-[#48d448] h-[49px] items-start left-[16px] pb-[2px] pt-[14px] px-[2px] rounded-[8px] to-[#3db83d] top-[136px] w-[290px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[8px] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]" />
      <Paragraph4 />
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[16.5px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Arial:Bold',sans-serif] leading-[16.5px] left-0 not-italic text-[#0a0a0a] text-[11px] top-0">자주 가는 곳</p>
    </div>
  );
}

function Text2() {
  return (
    <div className="h-[30px] relative shrink-0 w-[27.469px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[30px] left-[14px] not-italic text-[#0a0a0a] text-[20px] text-center top-[-3px] translate-x-[-50%]">🏠</p>
      </div>
    </div>
  );
}

function Container62() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[10px] w-[48px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_2px_0px_0px_rgba(0,0,0,0.2)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[2px] relative size-full">
        <Text2 />
      </div>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[15px] relative shrink-0 w-[9.203px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[15px] left-[5px] text-[#666] text-[10px] text-center top-0 translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
          집
        </p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="h-[67px] relative shrink-0 w-[48px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-center relative size-full">
        <Container62 />
        <Paragraph6 />
      </div>
    </div>
  );
}

function Text3() {
  return <div className="h-[30px] shrink-0 w-[60px]" data-name="Text" />;
}

function Container63() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[10px] w-[48px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_2px_0px_0px_rgba(0,0,0,0.2)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[2px] relative size-full">
        <Text3 />
      </div>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[15px] relative shrink-0 w-[18.406px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[15px] left-[9.5px] text-[#666] text-[10px] text-center top-0 translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
          회사
        </p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="h-[67px] relative shrink-0 w-[48px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-center relative size-full">
        <Container63 />
        <Paragraph7 />
      </div>
    </div>
  );
}

function Text4() {
  return (
    <div className="h-[30px] relative shrink-0 w-[27.469px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[30px] left-[14px] not-italic text-[#0a0a0a] text-[20px] text-center top-[-3px] translate-x-[-50%]">🏫</p>
      </div>
    </div>
  );
}

function Container64() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[10px] w-[48px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-2 border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[0px_2px_0px_0px_rgba(0,0,0,0.2)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[2px] relative size-full">
        <Text4 />
      </div>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[15px] relative shrink-0 w-[18.406px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[15px] left-[9.5px] not-italic text-[#666] text-[10px] text-center top-0 translate-x-[-50%]">학교</p>
      </div>
    </div>
  );
}

function Button11() {
  return (
    <div className="h-[67px] relative shrink-0 w-[48px]" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[4px] items-center relative size-full">
        <Container64 />
        <Paragraph8 />
      </div>
    </div>
  );
}

function Container65() {
  return (
    <div className="content-stretch flex gap-[12px] h-[67px] items-start relative shrink-0 w-full" data-name="Container">
      <Button3 />
      <Button4 />
      <Button11 />
    </div>
  );
}

function Container66() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[12px] h-[95.5px] items-start left-[16px] top-[205px] w-[290px]" data-name="Container">
      <Paragraph5 />
      <Container65 />
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[21px] left-[145.17px] text-[#2d5f3f] text-[14px] text-center top-[-1px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        오늘은
      </p>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[21px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[21px] left-[145.47px] text-[#2d5f3f] text-[14px] text-center top-[-1px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        어디로 안내할까요?
      </p>
    </div>
  );
}

function Container67() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[50px] items-start left-[16px] top-[336.5px] w-[290px]" data-name="Container">
      <Paragraph9 />
      <Paragraph10 />
    </div>
  );
}

function Container68() {
  return <div className="bg-[#5c9ead] rounded-[33554400px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container69() {
  return (
    <div className="absolute content-stretch flex items-center justify-center left-[13px] size-[16px] top-[91.5px]" data-name="Container">
      <Container68 />
    </div>
  );
}

function Container70() {
  return (
    <div className="bg-gradient-to-b from-[rgba(197,231,245,0.5)] h-[465px] relative shrink-0 to-[#e0f2e9] via-1/2 via-[#e8f4f8] w-full" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container59 />
        <Container61 />
        <Button2 />
        <Container66 />
        <Container67 />
        <Container69 />
      </div>
    </div>
  );
}

function DirectionsContent() {
  return (
    <div className="bg-white h-[465.5px] relative shrink-0 w-full" data-name="DirectionsContent">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] size-full">
        <Container70 />
      </div>
      <div aria-hidden="true" className="absolute border border-black border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Container44() {
  return <div className="absolute bg-gradient-to-b from-[#3d6e50] h-[60px] left-[60px] rounded-tl-[33554400px] rounded-tr-[33554400px] to-[#2d5f3f] top-[20px] w-[250px]" data-name="Container44" />;
}

function Container45() {
  return <div className="absolute bg-gradient-to-b from-[#3d6e50] h-[60px] left-[27px] rounded-tl-[33554400px] rounded-tr-[33554400px] to-[#2d5f3f] top-[20px] w-[250px]" data-name="Container45" />;
}

function ContainerText3() {
  return (
    <div className="absolute h-[36px] left-[80px] top-[27px] w-[32.953px]" data-name="ContainerText3">
      <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[36px] left-0 not-italic text-[#0a0a0a] text-[24px] top-0">🌲</p>
    </div>
  );
}

function ContainerText4() {
  return (
    <div className="absolute h-[36px] left-[224.05px] top-[27px] w-[32.953px]" data-name="ContainerText3">
      <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[36px] left-0 not-italic text-[#0a0a0a] text-[24px] top-0">🌲</p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents inset-0" data-name="Group">
      <div className="absolute inset-[37.5%_20%_0_20%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 36.6097 37.7636">
          <path d={svgPaths.p1024500} fill="var(--fill-0, #D4A574)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[43.75%_15%_6.25%_15%]" data-name="Vector_2">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42.7115 30.2109">
          <path d={svgPaths.p1ad7e980} fill="var(--fill-0, #D4A574)" id="Vector_2" />
        </svg>
      </div>
      <div className="absolute bottom-[12.5%] left-[30%] right-[30%] top-1/2" data-name="Vector_3">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.4064 22.6582">
          <path d={svgPaths.p1ba29400} fill="var(--fill-0, #C49764)" id="Vector_3" />
        </svg>
      </div>
      <div className="absolute bottom-1/2 left-1/4 right-[60%] top-0" data-name="Vector_4">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.15244 30.211">
          <path d={svgPaths.p351a6000} fill="var(--fill-0, #B8845F)" id="Vector_4" />
        </svg>
      </div>
      <div className="absolute inset-[6.25%_62.5%_56.25%_27.5%]" data-name="Vector_5">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.10156 22.6583">
          <path d={svgPaths.p16fa1ff0} fill="var(--fill-0, #A57050)" id="Vector_5" />
        </svg>
      </div>
      <div className="absolute bottom-1/2 left-[60%] right-1/4 top-0" data-name="Vector_6">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.15244 30.211">
          <path d={svgPaths.p351a6000} fill="var(--fill-0, #B8845F)" id="Vector_6" />
        </svg>
      </div>
      <div className="absolute inset-[6.25%_27.5%_56.25%_62.5%]" data-name="Vector_7">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6.10156 22.6583">
          <path d={svgPaths.p16fa1ff0} fill="var(--fill-0, #A57050)" id="Vector_7" />
        </svg>
      </div>
      <div className="absolute bottom-[37.5%] left-[30%] right-[30%] top-1/4" data-name="Vector_8">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.4064 22.6582">
          <path d={svgPaths.p1ba29400} fill="var(--fill-0, #D4A574)" id="Vector_8" />
        </svg>
      </div>
      <div className="absolute inset-[37.5%_55%_56.25%_40%]" data-name="Vector_9">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.05088 3.77638">
          <path d={svgPaths.p3ce456c0} fill="var(--fill-0, black)" id="Vector_9" />
        </svg>
      </div>
      <div className="absolute inset-[37.5%_40%_56.25%_55%]" data-name="Vector_10">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.05088 3.77638">
          <path d={svgPaths.p3ce456c0} fill="var(--fill-0, black)" id="Vector_10" />
        </svg>
      </div>
      <div className="absolute bottom-[43.75%] left-[47.5%] right-[47.5%] top-1/2" data-name="Vector_11">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.05078 3.77627">
          <path d={svgPaths.p1b7f6000} fill="var(--fill-0, black)" id="Vector_11" />
        </svg>
      </div>
      <div className="absolute inset-[62.5%_80%_12.5%_0]" data-name="Vector_12">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.2033 15.1055">
          <path d={svgPaths.p33849600} fill="var(--fill-0, #B8845F)" id="Vector_12" />
        </svg>
      </div>
      <div className="absolute inset-[62.5%_0_12.5%_80%]" data-name="Vector_13">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.2034 15.1055">
          <path d={svgPaths.p372c5000} fill="var(--fill-0, #B8845F)" id="Vector_13" />
        </svg>
      </div>
    </div>
  );
}

function Icon25() {
  return (
    <div className="h-[60.422px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Group />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[60.422px] items-start left-[136.98px] top-[12.5px] w-[61.016px]" data-name="Group">
      <Icon25 />
    </div>
  );
}

function Container46() {
  return (
    <div className="bg-gradient-to-b from-[#5a9e6e] h-[80px] relative shrink-0 to-[#4a8d5e] w-full" data-name="Container46">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Container44 />
        <Container45 />
        <ContainerText3 />
        <ContainerText4 />
        <Group1 />
      </div>
      <div aria-hidden="true" className="absolute border-black border-solid border-t-3 inset-0 pointer-events-none" />
    </div>
  );
}

function Container71() {
  return <div className="bg-[#5c9ead] rounded-[33554400px] shrink-0 size-[8px]" data-name="Container" />;
}

function Container47() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[720px] items-start left-0 pl-0 pr-[3px] py-0 top-0 w-[340px]" data-name="Container47">
      <div aria-hidden="true" className="absolute border-black border-r-3 border-solid inset-0 pointer-events-none" />
      <Container20 />
      <Container56 />
      <DirectionsContent />
      <Container46 />
      <Container71 />
    </div>
  );
}

export default function MapScreen() {
  return (
    <div className="bg-white relative size-full" data-name="MapScreen">
      <Container15 />
      <Container47 />
      <p className="absolute css-ew64yg font-['Arial:Regular',sans-serif] leading-[30px] left-[91px] not-italic text-[#0a0a0a] text-[20px] top-[417px]">🏢</p>

      {/* 애니메이션 캐릭터 테스트 - 지도 영역 (Container15) 내부에 배치 */}
      {/* Green 캐릭터 - 왼쪽 상단 */}
      <AnimatedCharacter
        color="green"
        position={{ x: 500, y: 150 }}
        size={80}
        animationSpeed={150}
      />

      {/* Pink 캐릭터 - 중앙 */}
      <AnimatedCharacter
        color="pink"
        position={{ x: 700, y: 350 }}
        size={80}
        animationSpeed={180}
      />

      {/* Yellow 캐릭터 - 오른쪽 하단 */}
      <AnimatedCharacter
        color="yellow"
        position={{ x: 900, y: 550 }}
        size={80}
        animationSpeed={200}
      />

      {/* Purple 캐릭터 - 왼쪽 하단 */}
      <AnimatedCharacter
        color="purple"
        position={{ x: 550, y: 500 }}
        size={80}
        animationSpeed={170}
      />
    </div>
  );
}