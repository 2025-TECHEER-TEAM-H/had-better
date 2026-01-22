import svgPaths from "./svg-fsmj7doi0s";
import clsx from "clsx";
type BackgroundImage1Props = {
  additionalClassNames?: string;
};

function BackgroundImage1({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImage1Props>) {
  return (
    <div className={clsx("h-[11.995px] relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}

function BackgroundImage({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="basis-0 grow h-[39.989px] min-h-px min-w-px relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}
type ButtonBackgroundImageAndTextProps = {
  text: string;
};

function ButtonBackgroundImageAndText({ text }: ButtonBackgroundImageAndTextProps) {
  return (
    <BackgroundImage>
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[16px] left-[39.42px] text-[12px] text-[rgba(255,255,255,0.7)] text-center text-nowrap top-[11.35px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        {text}
      </p>
    </BackgroundImage>
  );
}

function Container() {
  return <div className="absolute h-[852.649px] left-0 opacity-10 top-0 w-[393.007px]" data-name="Container" style={{ backgroundImage: "linear-gradient(rgba(45, 95, 63, 0.3) 0.11728%, rgba(0, 0, 0, 0) 0.11728%), linear-gradient(90deg, rgba(45, 95, 63, 0.3) 0.25445%, rgba(0, 0, 0, 0) 0.25445%)" }} />;
}

function Container1() {
  return <div className="absolute bg-[rgba(74,127,167,0.5)] left-[58.94px] rounded-[2.28151e+07px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[11.995px] top-[127.89px]" data-name="Container" />;
}

function Container2() {
  return <div className="absolute bg-[rgba(0,212,146,0.7)] left-[334.05px] rounded-[2.28151e+07px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[11.995px] top-[153.48px]" data-name="Container" />;
}

function Container3() {
  return <div className="absolute bg-[rgba(0,212,146,0.9)] left-[78.6px] rounded-[2.28151e+07px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[11.995px] top-[213.16px]" data-name="Container" />;
}

function Container4() {
  return <div className="absolute bg-[rgba(179,207,229,0.5)] left-[255.45px] rounded-[2.28151e+07px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[11.995px] top-[298.42px]" data-name="Container" />;
}

function Container5() {
  return <div className="absolute bg-[rgba(74,127,167,0.5)] left-[196.5px] rounded-[2.28151e+07px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[11.995px] top-[324px]" data-name="Container" />;
}

function Container6() {
  return <div className="absolute bg-[rgba(0,212,146,0.8)] left-[275.1px] rounded-[2.28151e+07px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[11.995px] top-[358.11px]" data-name="Container" />;
}

function Container7() {
  return <div className="absolute bg-[rgba(179,207,229,0.6)] left-[294.76px] rounded-[2.28151e+07px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[11.995px] top-[468.95px]" data-name="Container" />;
}

function Container8() {
  return <div className="absolute bg-[rgba(0,212,146,0.8)] left-[117.9px] rounded-[2.28151e+07px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)] size-[11.995px] top-[409.26px]" data-name="Container" />;
}

function Icon() {
  return (
    <div className="absolute h-[852.649px] left-0 top-0 w-[393.007px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 393.007 852.649">
        <g id="Icon">
          <path d={svgPaths.p1396f600} id="Vector" stroke="url(#paint0_linear_2_1828)" strokeDasharray="8 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16" />
          <path d={svgPaths.p22aa2800} fill="var(--fill-0, #48D448)" id="Vector_2" stroke="var(--stroke-0, white)" strokeWidth="4" />
          <path d={svgPaths.p3a23fb00} fill="var(--fill-0, #4A7FA7)" id="Vector_3" stroke="var(--stroke-0, white)" strokeWidth="4" />
        </g>
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_1828" x1="120" x2="120" y1="150" y2="30150">
            <stop stopColor="#0052A4" stopOpacity="0.9" />
            <stop offset="1" stopColor="#155DFC" stopOpacity="0.9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute h-[852.649px] left-0 top-0 w-[393.007px]" data-name="Container">
      <Container />
      <Container1 />
      <Container2 />
      <Container3 />
      <Container4 />
      <Container5 />
      <Container6 />
      <Container7 />
      <Container8 />
      <Icon />
    </div>
  );
}

function Text() {
  return (
    <div className="content-stretch flex h-[21.758px] items-start relative shrink-0 w-full" data-name="Text">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[28px] not-italic relative shrink-0 text-[#0a0a0a] text-[18px] text-nowrap tracking-[-0.4395px]">🚌</p>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-[#155dfc] h-[46.714px] relative rounded-[2.28151e+07px] shrink-0 w-[36.398px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.36px] border-black border-solid inset-0 pointer-events-none rounded-[2.28151e+07px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.36px] pt-[12.08px] px-[9.36px] relative size-full">
        <Text />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="absolute h-[32px] left-0 top-0 w-[48px]" data-name="Paragraph">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[32px] left-0 not-italic text-[24px] text-nowrap text-white top-[0.08px]">19</p>
    </div>
  );
}

function Container11() {
  return (
    <div className="relative shrink-0 size-[48px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Paragraph />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[48px] relative shrink-0 w-[92.398px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Container10 />
        <Container11 />
      </div>
    </div>
  );
}

function Paragraph1() {
  return <div className="h-[16px] shrink-0 w-[48px]" data-name="Paragraph" />;
}

function Paragraph2() {
  return (
    <div className="h-[11.995px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-[83.74px] text-[8px] text-nowrap text-right text-white top-[-0.64px] translate-x-[-100%]" style={{ fontVariationSettings: "'wght' 400" }}>
        1,550원
      </p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="absolute h-[34px] left-[-58.65px] top-[-0.98px] w-[142px]" data-name="Paragraph">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-[84px] text-[8px] text-[rgba(255,255,255,0.7)] text-nowrap text-right top-[-0.64px] translate-x-[-100%]" style={{ fontVariationSettings: "'wght' 400" }}>
        오후 10:02 도착
      </p>
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[23.989px] relative shrink-0 w-[83.644px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Paragraph2 />
        <Paragraph3 />
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex h-[48px] items-center justify-between relative shrink-0 w-full" data-name="Container">
      <Container12 />
      <Paragraph1 />
      <Container13 />
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[16px] left-[100.29px] text-[12px] text-[rgba(255,255,255,0.8)] text-nowrap top-[8.03px]" style={{ fontVariationSettings: "'wght' 400" }}>
        분
      </p>
    </div>
  );
}

function Text1() {
  return (
    <BackgroundImage1 additionalClassNames="w-[21.833px]">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[8px] text-nowrap text-white top-[-0.64px]" style={{ fontVariationSettings: "'wght' 400" }}>
        1호선
      </p>
    </BackgroundImage1>
  );
}

function Container15() {
  return (
    <div className="bg-[#0052a4] relative rounded-[10px] shrink-0 size-[32px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.36px] border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.36px] pr-[1.371px] py-[1.36px] relative size-full">
        <Text1 />
      </div>
    </div>
  );
}

function Container16() {
  return <div className="bg-[rgba(255,255,255,0.3)] h-[32px] shrink-0 w-[1.997px]" data-name="Container" />;
}

function Container17() {
  return (
    <div className="h-[71.989px] relative shrink-0 w-[32px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.995px] items-center pb-[3.995px] pt-0 px-0 relative size-full">
        <Container15 />
        <Container16 />
      </div>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[11.995px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-[0.29px] text-[10px] text-nowrap text-white top-[0.03px]" style={{ fontVariationSettings: "'wght' 400" }}>
        신도림
      </p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[10.497px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] h-[31px] leading-[10.5px] left-[57.29px] text-[#ff6467] text-[10px] top-[-9.97px] w-[393px]" style={{ fontVariationSettings: "'wght' 400" }}>
        21:44 발차예정 | 열차후 여유비움
      </p>
    </div>
  );
}

function Container18() {
  return (
    <div className="basis-0 grow h-[71.989px] min-h-px min-w-px relative shrink-0" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Paragraph4 />
        <Paragraph5 />
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="h-[71.989px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex gap-[11.995px] items-start relative size-full">
        <Container17 />
        <Container18 />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="bg-[rgba(255,255,255,0.7)] relative rounded-[2.28151e+07px] shrink-0 size-[8px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#7b7b7b] border-[0.68px] border-solid inset-0 pointer-events-none rounded-[2.28151e+07px]" />
    </div>
  );
}

function Paragraph6() {
  return (
    <BackgroundImage1 additionalClassNames="w-[295.584px]">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[10px] text-nowrap text-white top-[-0.64px]" style={{ fontVariationSettings: "'wght' 400" }}>
        대방역
      </p>
    </BackgroundImage1>
  );
}

function Container21() {
  return (
    <div className="absolute content-stretch flex gap-[11.995px] h-[11.995px] items-start left-[28.29px] top-[144.03px] w-[315.579px]" data-name="Container">
      <Container20 />
      <Paragraph6 />
    </div>
  );
}

function Paragraph7() {
  return (
    <BackgroundImage1 additionalClassNames="w-[295.584px]">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-[13px] text-[10px] text-[rgba(255,255,255,0.9)] text-nowrap top-0" style={{ fontVariationSettings: "'wght' 400" }}>
        신림 대방역
      </p>
    </BackgroundImage1>
  );
}

function Container22() {
  return (
    <div className="absolute content-stretch flex h-[47.989px] items-start left-[32.29px] top-[84.03px] w-[315.579px]" data-name="Container">
      <Paragraph7 />
    </div>
  );
}

function Container23() {
  return (
    <div className="bg-white relative rounded-[2.28151e+07px] shrink-0 size-[8px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.68px] border-black border-solid inset-0 pointer-events-none rounded-[2.28151e+07px]" />
    </div>
  );
}

function Container24() {
  return <div className="bg-[rgba(255,255,255,0.3)] h-[32px] shrink-0 w-[1.997px]" data-name="Container" />;
}

function Container25() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[3.995px] h-[47.989px] items-center left-[13.29px] pb-[3.995px] pt-0 px-0 top-[84.03px] w-[8px]" data-name="Container">
      <Container23 />
      <Container24 />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col gap-[11.995px] h-[155.962px] items-start relative shrink-0 w-full" data-name="Container">
      <Container19 />
      <Container21 />
      <Container22 />
      <Container25 />
    </div>
  );
}

function Container27() {
  return <div className="absolute bg-[rgba(255,255,255,0.1)] h-[49.2px] left-[3.4px] opacity-0 top-[3.4px] w-[308.779px]" data-name="Container" />;
}

function Text2() {
  return (
    <div className="absolute content-stretch flex h-[16.319px] items-start left-[94.75px] top-[18.38px] w-[126.076px]" data-name="Text">
      <p className="font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[24px] relative shrink-0 text-[16px] text-center text-nowrap text-white tracking-[0.8px]" style={{ fontVariationSettings: "'wght' 400" }}>
        경주 시작! 🏁
      </p>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-gradient-to-b from-[#48d448] h-[56px] relative rounded-[16px] shrink-0 to-[#3db83d] w-full" data-name="Button">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Container27 />
        <Text2 />
      </div>
      <div aria-hidden="true" className="absolute border-[3.4px] border-black border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_6px_0px_0px_#2d8b2d,0px_12px_24px_0px_rgba(61,184,61,0.3)]" />
    </div>
  );
}

function Container28() {
  return (
    <div className="bg-gradient-to-b from-[rgba(0,0,0,0)] h-[337.39px] relative rounded-[16px] shrink-0 to-[rgba(150,168,179,0.94)] w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[2.72px] border-[rgba(255,255,255,0.3)] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_8px_0px_0px_rgba(0,0,0,0.2)]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-[2.72px] pt-[22.714px] px-[22.714px] relative size-full">
        <Container14 />
        <Container26 />
        <Button />
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute bg-gradient-to-b content-stretch flex flex-col from-[rgba(100,123,138,0.95)] h-[385.39px] items-start left-0 pb-0 pt-[16px] px-[16px] rounded-tl-[24px] rounded-tr-[24px] shadow-[0px_-8px_24px_0px_rgba(0,0,0,0.2)] to-[rgba(90,111,126,0.95)] top-[467.26px] w-[393.007px]" data-name="Container">
      <Container28 />
    </div>
  );
}

function Text3() {
  return (
    <div className="h-[27.995px] relative shrink-0 w-[16.988px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Black',sans-serif] font-black leading-[28px] left-[8px] not-italic text-[18px] text-black text-center text-nowrap top-[-0.28px] tracking-[-0.4395px] translate-x-[-50%]">←</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white relative rounded-[14px] shrink-0 size-[40px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[2.72px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[2.72px] relative size-full">
        <Text3 />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <div className="h-[19.995px] relative shrink-0 w-[80.191px]" data-name="Heading 1">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[20px] left-0 text-[14px] text-nowrap text-white top-[-0.28px]" style={{ fontVariationSettings: "'wght' 400" }}>
          할 걸...
        </p>
      </div>
    </div>
  );
}

function Container30() {
  return <div className="shrink-0 size-[40px]" data-name="Container" />;
}

function Container31() {
  return (
    <div className="h-[67.994px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[19.995px] py-0 relative size-full">
          <Button1 />
          <Heading />
          <Container30 />
        </div>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="basis-0 grow h-[42.709px] min-h-px min-w-px relative shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#48d448] border-[0px_0px_2.72px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[16px] left-[39.73px] text-[#48d448] text-[12px] text-center text-nowrap top-[11.35px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
          길찾기
        </p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <BackgroundImage>
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[16px] left-[39.73px] text-[12px] text-[rgba(255,255,255,0.7)] text-center text-nowrap top-[11.35px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        지하철
      </p>
    </BackgroundImage>
  );
}

function Button4() {
  return (
    <BackgroundImage>
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[16px] left-[39.3px] not-italic text-[12px] text-[rgba(255,255,255,0.7)] text-center text-nowrap top-[11.35px] translate-x-[-50%]">MY</p>
    </BackgroundImage>
  );
}

function Container32() {
  return (
    <div className="h-[44.069px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.36px_0px_0px] border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pb-0 pl-0 pr-[0.021px] pt-[1.36px] relative size-full">
          <ButtonBackgroundImageAndText text="검색" />
          <Button2 />
          <ButtonBackgroundImageAndText text="버스" />
          <Button3 />
          <Button4 />
        </div>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="absolute bg-gradient-to-b content-stretch flex flex-col from-[rgba(90,141,176,0.8)] h-[115.463px] items-start left-0 pb-[3.4px] pt-0 px-0 to-[rgba(74,127,167,0.8)] top-0 w-[393.007px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_3.4px] border-black border-solid inset-0 pointer-events-none shadow-[0px_4px_0px_0px_rgba(0,0,0,0.2)]" />
      <Container31 />
      <Container32 />
    </div>
  );
}

export default function CuteGameConceptMapApp() {
  return (
    <div className="relative size-full" data-name="Cute Game Concept Map App" style={{ backgroundImage: "linear-gradient(rgb(197, 231, 245) 0%, rgb(232, 244, 248) 50%, rgb(224, 242, 233) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <Container9 />
      <Container29 />
      <Container33 />
    </div>
  );
}