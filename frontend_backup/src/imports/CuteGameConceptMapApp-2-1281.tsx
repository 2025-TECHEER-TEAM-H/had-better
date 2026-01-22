import svgPaths from "./svg-m6omsslggu";
import clsx from "clsx";
type IconBackgroundImageProps = {
  additionalClassNames?: string;
};

function IconBackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<IconBackgroundImageProps>) {
  return (
    <div className={clsx("absolute h-0 top-0 w-[393.007px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 393.007 0">
        {children}
      </svg>
    </div>
  );
}
type ContainerBackgroundImage2Props = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage2({ children, additionalClassNames = "" }: React.PropsWithChildren<ContainerBackgroundImage2Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.995px] items-center pb-[3.995px] pt-0 px-0 relative size-full">{children}</div>
    </div>
  );
}
type BackgroundImage2Props = {
  additionalClassNames?: string;
};

function BackgroundImage2({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImage2Props>) {
  return (
    <div className={additionalClassNames}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}
type BackgroundImage1Props = {
  additionalClassNames?: string;
};

function BackgroundImage1({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImage1Props>) {
  return <BackgroundImage2 additionalClassNames={clsx("relative shrink-0", additionalClassNames)}>{children}</BackgroundImage2>;
}
type BackgroundImageProps = {
  additionalClassNames?: string;
};

function BackgroundImage({ children, additionalClassNames = "" }: React.PropsWithChildren<BackgroundImageProps>) {
  return <BackgroundImage2 additionalClassNames={clsx("basis-0 grow min-h-px min-w-px relative shrink-0", additionalClassNames)}>{children}</BackgroundImage2>;
}
type ContainerBackgroundImage1Props = {
  text: string;
  additionalClassNames?: string;
};

function ContainerBackgroundImage1({ children, text, additionalClassNames = "" }: React.PropsWithChildren<ContainerBackgroundImage1Props>) {
  return (
    <div className="basis-0 bg-[rgba(255,255,255,0.9)] grow h-[48px] min-h-px min-w-px relative rounded-[14px] shrink-0">
      <div aria-hidden="true" className="absolute border-[2.72px] border-black border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="flex flex-row items-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center pl-[18.72px] pr-[2.72px] py-[2.72px] relative size-full">
          <BackgroundImage2 additionalClassNames={clsx("h-[19.995px] relative shrink-0", additionalClassNames)}>
            <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[20px] left-0 text-[#2d5f3f] text-[14px] text-nowrap top-[-0.28px]" style={{ fontVariationSettings: "'wght' 400" }}>
              {text}
            </p>
          </BackgroundImage2>
        </div>
      </div>
    </div>
  );
}
type ButtonBackgroundImageAndTextProps = {
  text: string;
};

function ButtonBackgroundImageAndText({ text }: ButtonBackgroundImageAndTextProps) {
  return (
    <BackgroundImage additionalClassNames="h-[39.989px]">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[16px] left-[39.42px] text-[12px] text-[rgba(255,255,255,0.7)] text-center text-nowrap top-[11.35px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        {text}
      </p>
    </BackgroundImage>
  );
}
type ContainerBackgroundImageProps = {
  additionalClassNames?: string;
};

function ContainerBackgroundImage({ additionalClassNames = "" }: ContainerBackgroundImageProps) {
  return (
    <div className={clsx("bg-white relative rounded-[2.28151e+07px] shrink-0", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border-[0.68px] border-black border-solid inset-0 pointer-events-none rounded-[2.28151e+07px]" />
    </div>
  );
}
type TextBackgroundImageAndTextProps = {
  text: string;
};

function TextBackgroundImageAndText({ text }: TextBackgroundImageAndTextProps) {
  return (
    <div className="content-stretch flex h-[6.799px] items-start relative shrink-0 w-full">
      <p className="font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[10.5px] relative shrink-0 text-[7px] text-black text-center text-nowrap" style={{ fontVariationSettings: "'wght' 400" }}>
        {text}
      </p>
    </div>
  );
}
type ParagraphBackgroundImageAndText4Props = {
  text: string;
  additionalClassNames?: string;
};

function ParagraphBackgroundImageAndText4({ text, additionalClassNames = "" }: ParagraphBackgroundImageAndText4Props) {
  return (
    <div className={clsx("absolute h-[10.497px] left-0 w-[72.233px]", additionalClassNames)}>
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[10.5px] left-[36.6px] text-[7px] text-center text-nowrap text-white top-[-0.64px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        {text}
      </p>
    </div>
  );
}
type ParagraphBackgroundImageAndText3Props = {
  text: string;
};

function ParagraphBackgroundImageAndText3({ text }: ParagraphBackgroundImageAndText3Props) {
  return (
    <div className="absolute h-[10.497px] left-0 top-[72.98px] w-[72.233px]">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[10.5px] left-[36.04px] text-[7px] text-[rgba(255,255,255,0.7)] text-center text-nowrap top-[-0.64px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        {text}
      </p>
    </div>
  );
}
type ParagraphBackgroundImageAndText2Props = {
  text: string;
};

function ParagraphBackgroundImageAndText2({ text }: ParagraphBackgroundImageAndText2Props) {
  return (
    <div className="absolute h-[10.497px] left-0 top-[58.49px] w-[72.233px]">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[10.5px] left-[36.57px] text-[7px] text-[rgba(255,255,255,0.9)] text-center text-nowrap top-[-0.64px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        {text}
      </p>
    </div>
  );
}
type ParagraphBackgroundImageAndText1Props = {
  text: string;
};

function ParagraphBackgroundImageAndText1({ text }: ParagraphBackgroundImageAndText1Props) {
  return (
    <div className="absolute h-[10.497px] left-0 top-[39.99px] w-[72.233px]">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[10.5px] left-[36.58px] text-[7px] text-[rgba(255,255,255,0.8)] text-center text-nowrap top-[-0.64px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        {text}
      </p>
    </div>
  );
}
type ParagraphBackgroundImageAndTextProps = {
  text: string;
};

function ParagraphBackgroundImageAndText({ text }: ParagraphBackgroundImageAndTextProps) {
  return (
    <div className="absolute h-[35.994px] left-0 top-0 w-[72.233px]">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[36px] left-[36.11px] not-italic text-[30px] text-center text-nowrap text-white top-[-0.28px] translate-x-[-50%]">{text}</p>
    </div>
  );
}

function Container() {
  return <div className="absolute bg-white blur-2xl filter h-[64px] left-[249.01px] opacity-50 rounded-[2.28151e+07px] top-[64px] w-[127.999px]" data-name="Container" />;
}

function Container1() {
  return <div className="absolute bg-white blur-2xl filter h-[56px] left-[32px] opacity-40 rounded-[2.28151e+07px] top-[128px] w-[111.999px]" data-name="Container" />;
}

function Container2() {
  return <div className="bg-[#48d448] rounded-[2.28151e+07px] shadow-[0px_4px_8px_0px_rgba(72,212,72,0.5)] shrink-0 size-[11.995px]" data-name="Container" />;
}

function Container3() {
  return (
    <div className="content-stretch flex gap-[11.995px] h-[48px] items-center relative shrink-0 w-full" data-name="Container">
      <Container2 />
      <ContainerBackgroundImage1 text="신도림역 1호선" additionalClassNames="w-[100.621px]" />
    </div>
  );
}

function Container4() {
  return <div className="bg-[#4a7fa7] rounded-[2.28151e+07px] shadow-[0px_4px_8px_0px_rgba(74,127,167,0.5)] shrink-0 size-[11.995px]" data-name="Container" />;
}

function Container5() {
  return (
    <div className="content-stretch flex gap-[11.995px] h-[48px] items-center relative shrink-0 w-full" data-name="Container">
      <Container4 />
      <ContainerBackgroundImage1 text="대림역 1호선" additionalClassNames="w-[88.509px]" />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col gap-[11.995px] h-[107.994px] items-start relative shrink-0 w-full" data-name="Container">
      <Container3 />
      <Container5 />
    </div>
  );
}

function Container7() {
  return <div className="absolute bg-[rgba(255,255,255,0.1)] h-[49.2px] left-[3.4px] opacity-0 top-[3.4px] w-[346.219px]" data-name="Container" />;
}

function Text() {
  return (
    <div className="absolute content-stretch flex h-[17.679px] items-start left-[151.8px] top-[18.38px] w-[49.413px]" data-name="Text">
      <p className="font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[28px] relative shrink-0 text-[18px] text-center text-nowrap text-white tracking-[0.9px]" style={{ fontVariationSettings: "'wght' 400" }}>
        길찾기
      </p>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-gradient-to-b from-[#48d448] h-[56px] relative rounded-[16px] shrink-0 to-[#3db83d] w-full" data-name="Button">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Container7 />
        <Text />
      </div>
      <div aria-hidden="true" className="absolute border-[3.4px] border-black border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_6px_0px_0px_#2d8b2d,0px_12px_24px_0px_rgba(61,184,61,0.3)]" />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute h-[97.965px] left-[16px] top-[16px] w-[72.233px]" data-name="Container">
      <ParagraphBackgroundImageAndText text="18" />
      <ParagraphBackgroundImageAndText1 text="분" />
      <ParagraphBackgroundImageAndText2 text="10:07 도착" />
      <ParagraphBackgroundImageAndText3 text="한승 2길" />
      <ParagraphBackgroundImageAndText4 text="1,550원" additionalClassNames="top-[87.47px]" />
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute bg-[#ffc107] content-stretch flex flex-col h-[30.714px] items-start left-[36.7px] pb-[1.36px] pt-[14.236px] px-[9.36px] rounded-[2.28151e+07px] top-[-8px] w-[30.831px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.36px] border-black border-solid inset-0 pointer-events-none rounded-[2.28151e+07px]" />
      <TextBackgroundImageAndText text="최단" />
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-gradient-to-b border-[2.72px] border-black border-solid from-[#6b9cb3] h-[135.404px] left-0 rounded-[16px] shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] to-[#5a8db0] top-0 w-[109.673px]" data-name="Button">
      <Container8 />
      <Container9 />
    </div>
  );
}

function Container10() {
  return (
    <div className="h-[97.965px] relative shrink-0 w-full" data-name="Container">
      <ParagraphBackgroundImageAndText text="23" />
      <ParagraphBackgroundImageAndText1 text="분" />
      <ParagraphBackgroundImageAndText2 text="10:07 도착" />
      <ParagraphBackgroundImageAndText3 text="한승 2길" />
      <ParagraphBackgroundImageAndText4 text="1,550원" additionalClassNames="top-[87.47px]" />
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-gradient-to-b content-stretch flex flex-col from-[#7c98a8] h-[135.404px] items-start left-[121.67px] pb-[2.72px] pt-[18.72px] px-[18.72px] rounded-[16px] to-[#6b8998] top-0 w-[109.673px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[2.72px] border-black border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)]" />
      <Container10 />
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute h-[83.474px] left-[16px] top-[23.25px] w-[72.233px]" data-name="Container">
      <ParagraphBackgroundImageAndText text="19" />
      <ParagraphBackgroundImageAndText1 text="분" />
      <ParagraphBackgroundImageAndText2 text="10:02 도착" />
      <ParagraphBackgroundImageAndText4 text="1,550원" additionalClassNames="top-[72.98px]" />
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute bg-[#ffc107] content-stretch flex flex-col h-[30.714px] items-start left-[36.7px] pb-[1.36px] pt-[14.236px] px-[9.36px] rounded-[2.28151e+07px] top-[-8px] w-[30.831px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.36px] border-black border-solid inset-0 pointer-events-none rounded-[2.28151e+07px]" />
      <TextBackgroundImageAndText text="최저" />
    </div>
  );
}

function Button3() {
  return (
    <div className="absolute bg-gradient-to-b border-[2.72px] border-black border-solid from-[#7c98a8] h-[135.404px] left-[243.33px] rounded-[16px] shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] to-[#6b8998] top-0 w-[109.673px]" data-name="Button">
      <Container11 />
      <Container12 />
    </div>
  );
}

function Container13() {
  return (
    <div className="h-[135.404px] relative shrink-0 w-full" data-name="Container">
      <Button1 />
      <Button2 />
      <Button3 />
    </div>
  );
}

function Paragraph() {
  return (
    <BackgroundImage1 additionalClassNames="h-[32px] w-[48px]">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[32px] left-0 not-italic text-[24px] text-nowrap text-white top-[0.08px]">19</p>
    </BackgroundImage1>
  );
}

function Paragraph1() {
  return (
    <BackgroundImage1 additionalClassNames="h-[16px] w-[10.38px]">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[16px] left-0 text-[12px] text-[rgba(255,255,255,0.8)] text-nowrap top-[-0.64px]" style={{ fontVariationSettings: "'wght' 400" }}>
        분
      </p>
    </BackgroundImage1>
  );
}

function Container14() {
  return (
    <div className="h-[32px] relative shrink-0 w-[66.379px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[8px] items-center relative size-full">
        <Paragraph />
        <Paragraph1 />
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[11.995px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-[84px] text-[8px] text-[rgba(255,255,255,0.7)] text-nowrap text-right top-[-0.64px] translate-x-[-100%]" style={{ fontVariationSettings: "'wght' 400" }}>
        오늘 10:02 도착
      </p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[11.995px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-[83.74px] text-[8px] text-nowrap text-right text-white top-[-0.64px] translate-x-[-100%]" style={{ fontVariationSettings: "'wght' 400" }}>
        1,550원
      </p>
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[23.989px] relative shrink-0 w-[83.644px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <Paragraph2 />
        <Paragraph3 />
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between relative size-full">
          <Container14 />
          <Container15 />
        </div>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="bg-[#4a7fa7] h-[21.769px] relative rounded-[2.28151e+07px] shrink-0 w-[32px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.36px] border-black border-solid inset-0 pointer-events-none rounded-[2.28151e+07px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.36px] relative size-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[16px] not-italic relative shrink-0 text-[#0a0a0a] text-[12px] text-nowrap">🚌</p>
      </div>
    </div>
  );
}

function Container18() {
  return <div className="bg-[rgba(255,255,255,0.3)] h-[55.437px] shrink-0 w-[1.997px]" data-name="Container" />;
}

function Container19() {
  return (
    <ContainerBackgroundImage2 additionalClassNames="h-[85.195px] w-[32px]">
      <Container17 />
      <Container18 />
    </ContainerBackgroundImage2>
  );
}

function Text1() {
  return (
    <div className="absolute content-stretch flex h-[8.159px] items-start left-[11.99px] top-[17.52px] w-[21.833px]" data-name="Text">
      <p className="font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] relative shrink-0 text-[8px] text-nowrap text-white" style={{ fontVariationSettings: "'wght' 400" }}>
        1호선
      </p>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute bg-[#4a7fa7] border-[1.36px] border-black border-solid h-[42.72px] left-0 rounded-[10px] top-0 w-[48.542px]" data-name="Container">
      <Text1 />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="absolute h-[11.995px] left-0 top-[46.71px] w-[263.595px]" data-name="Paragraph">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[8px] text-[rgba(255,255,255,0.8)] text-nowrap top-[-0.64px]" style={{ fontVariationSettings: "'wght' 400" }}>
        신도림역
      </p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="absolute h-[10.497px] left-0 top-[62.7px] w-[263.595px]" data-name="Paragraph">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[10.5px] left-0 text-[#ff6b6b] text-[7px] text-nowrap top-[-0.64px]" style={{ fontVariationSettings: "'wght' 400" }}>
        버스 환승 구역
      </p>
    </div>
  );
}

function Container21() {
  return (
    <BackgroundImage additionalClassNames="h-[85.195px]">
      <Container20 />
      <Paragraph4 />
      <Paragraph5 />
    </BackgroundImage>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex gap-[11.995px] h-[85.195px] items-start relative shrink-0 w-full" data-name="Container">
      <Container19 />
      <Container21 />
    </div>
  );
}

function Container23() {
  return <div className="bg-[rgba(255,255,255,0.3)] h-[11.463px] shrink-0 w-[1.997px]" data-name="Container" />;
}

function Container24() {
  return (
    <ContainerBackgroundImage2 additionalClassNames="h-[23.989px] w-[8px]">
      <ContainerBackgroundImage additionalClassNames="h-[4.536px] w-[8px]" />
      <Container23 />
    </ContainerBackgroundImage2>
  );
}

function Paragraph6() {
  return (
    <BackgroundImage1 additionalClassNames="h-[11.995px] w-[287.595px]">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[8px] text-[rgba(255,255,255,0.9)] text-nowrap top-[-0.64px]" style={{ fontVariationSettings: "'wght' 400" }}>
        신림 대림역
      </p>
    </BackgroundImage1>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex gap-[11.995px] h-[23.989px] items-start relative shrink-0 w-full" data-name="Container">
      <Container24 />
      <Paragraph6 />
    </div>
  );
}

function Paragraph7() {
  return (
    <BackgroundImage1 additionalClassNames="h-[11.995px] w-[287.595px]">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[8px] text-nowrap text-white top-[-0.64px]" style={{ fontVariationSettings: "'wght' 400" }}>
        대림역
      </p>
    </BackgroundImage1>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex gap-[11.995px] h-[11.995px] items-start relative shrink-0 w-full" data-name="Container">
      <ContainerBackgroundImage additionalClassNames="size-[8px]" />
      <Paragraph7 />
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[153.178px] items-start relative shrink-0 w-full" data-name="Container">
      <Container22 />
      <Container25 />
      <Container26 />
    </div>
  );
}

function Container28() {
  return (
    <div className="bg-gradient-to-b from-[rgba(124,152,168,0.9)] h-[246.607px] relative rounded-[24px] shrink-0 to-[rgba(107,137,152,0.9)] w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[2.72px] border-black border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_0px_0px_rgba(0,0,0,0.3)]" />
      <div className="content-stretch flex flex-col gap-[16px] items-start pb-[2.72px] pt-[22.714px] px-[22.714px] relative size-full">
        <Container16 />
        <Container27 />
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[770.004px] items-start left-0 pb-0 pt-[24px] px-[19.995px] top-[115.46px] w-[393.007px]" data-name="Container">
      <Container6 />
      <Button />
      <Container13 />
      <Container28 />
    </div>
  );
}

function Icon() {
  return (
    <IconBackgroundImage additionalClassNames="left-0">
      <g clipPath="url(#clip0_2_1310)" id="Icon">
        <path d={svgPaths.p605f800} fill="url(#paint0_linear_2_1310)" id="Vector" opacity="0.6" />
      </g>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_1310" x1="-49.1259" x2="-49.1259" y1="0" y2="0">
          <stop stopColor="#4A9960" />
          <stop offset="1" stopColor="#3D8651" />
        </linearGradient>
        <clipPath id="clip0_2_1310">
          <rect fill="white" height="0" width="393.007" />
        </clipPath>
      </defs>
    </IconBackgroundImage>
  );
}

function Icon1() {
  return (
    <IconBackgroundImage additionalClassNames="left-[196.5px]">
      <g clipPath="url(#clip0_2_1307)" id="Icon">
        <path d={svgPaths.p4d84d00} fill="url(#paint0_linear_2_1307)" id="Vector" opacity="0.6" />
      </g>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_1307" x1="0" x2="0" y1="0" y2="0">
          <stop stopColor="#4A9960" />
          <stop offset="1" stopColor="#3D8651" />
        </linearGradient>
        <clipPath id="clip0_2_1307">
          <rect fill="white" height="0" width="393.007" />
        </clipPath>
      </defs>
    </IconBackgroundImage>
  );
}

function Icon2() {
  return (
    <IconBackgroundImage additionalClassNames="left-0">
      <g clipPath="url(#clip0_2_1300)" id="Icon">
        <path d={svgPaths.p231ceb00} fill="url(#paint0_linear_2_1300)" id="Vector" opacity="0.8" />
      </g>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_1300" x1="0" x2="0" y1="0" y2="0">
          <stop stopColor="#7EC98F" />
          <stop offset="1" stopColor="#6BB87C" />
        </linearGradient>
        <clipPath id="clip0_2_1300">
          <rect fill="white" height="0" width="393.007" />
        </clipPath>
      </defs>
    </IconBackgroundImage>
  );
}

function Icon3() {
  return (
    <IconBackgroundImage additionalClassNames="left-[196.5px]">
      <g clipPath="url(#clip0_2_1293)" id="Icon">
        <path d={svgPaths.p77f4600} fill="url(#paint0_linear_2_1293)" id="Vector" opacity="0.85" />
      </g>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_1293" x1="0" x2="0" y1="0" y2="0">
          <stop stopColor="#7EC98F" />
          <stop offset="1" stopColor="#6BB87C" />
        </linearGradient>
        <clipPath id="clip0_2_1293">
          <rect fill="white" height="0" width="393.007" />
        </clipPath>
      </defs>
    </IconBackgroundImage>
  );
}

function Icon4() {
  return (
    <div className="h-[32px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[68.75%_41.67%_0_41.67%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 10">
          <path d={svgPaths.p2a478080} fill="url(#paint0_linear_2_1289)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_1289" x1="0" x2="0" y1="0" y2="1000">
              <stop stopColor="#6B4423" />
              <stop offset="1" stopColor="#5A3A1F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-1/4 left-[16.67%] right-[16.67%] top-[43.75%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 10">
          <path d={svgPaths.p3b76b300} fill="url(#paint0_linear_2_1287)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_1287" x1="0" x2="0" y1="0" y2="1000">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-1/2 left-1/4 right-1/4 top-1/4" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 8">
          <path d={svgPaths.p10e0ba00} fill="url(#paint0_linear_2_1305)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_1305" x1="0" x2="0" y1="0" y2="800">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[6.25%_33.33%_68.75%_33.33%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <path d={svgPaths.p7f44740} fill="url(#paint0_linear_2_1298)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_1298" x1="0" x2="0" y1="0" y2="800">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute content-stretch flex flex-col h-[32px] items-start left-[58.94px] top-[-64px] w-[24px]" data-name="Container">
      <Icon4 />
    </div>
  );
}

function Icon5() {
  return (
    <div className="h-[35.993px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[72.22%_42.86%_0_42.86%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.99922 9.99805">
          <path d={svgPaths.p19003200} fill="url(#paint0_linear_2_1291)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_1291" x1="0" x2="0" y1="0" y2="999.805">
              <stop stopColor="#6B4423" />
              <stop offset="1" stopColor="#5A3A1F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[44.44%_14.29%_22.22%_14.29%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9961 11.9977">
          <path d={svgPaths.p19be7e00} fill="url(#paint0_linear_2_1303)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_1303" x1="0" x2="0" y1="0" y2="1199.77">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-1/2 left-[21.43%] right-[21.43%] top-[27.78%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9969 7.99844">
          <path d={svgPaths.p28387e00} fill="url(#paint0_linear_2_1296)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_1296" x1="0" x2="0" y1="0" y2="799.844">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[11.11%_35.71%_66.67%_35.71%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.99844 7.99844">
          <path d={svgPaths.p2fb3a00} fill="url(#paint0_linear_2_1285)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_1285" x1="0" x2="0" y1="0" y2="799.844">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute content-stretch flex flex-col h-[35.994px] items-start left-[286.42px] top-[-59.99px] w-[27.995px]" data-name="Container">
      <Icon5 />
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute h-0 left-0 top-[852.65px] w-[393.007px]" data-name="Container">
      <Icon />
      <Icon1 />
      <Icon2 />
      <Icon3 />
      <Container30 />
      <Container31 />
    </div>
  );
}

function Text2() {
  return (
    <BackgroundImage1 additionalClassNames="h-[27.995px] w-[16.988px]">
      <p className="absolute font-['Inter:Black',sans-serif] font-black leading-[28px] left-[8px] not-italic text-[18px] text-black text-center text-nowrap top-[-0.28px] tracking-[-0.4395px] translate-x-[-50%]">←</p>
    </BackgroundImage1>
  );
}

function Button4() {
  return (
    <div className="bg-white relative rounded-[14px] shrink-0 size-[40px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[2.72px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[2.72px] relative size-full">
        <Text2 />
      </div>
    </div>
  );
}

function Heading() {
  return (
    <BackgroundImage1 additionalClassNames="h-[19.995px] w-[80.191px]">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[20px] left-0 text-[14px] text-nowrap text-white top-[-0.28px]" style={{ fontVariationSettings: "'wght' 400" }}>
        할 걸...
      </p>
    </BackgroundImage1>
  );
}

function Container33() {
  return <div className="shrink-0 size-[40px]" data-name="Container" />;
}

function Container34() {
  return (
    <div className="h-[67.994px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[19.995px] py-0 relative size-full">
          <Button4 />
          <Heading />
          <Container33 />
        </div>
      </div>
    </div>
  );
}

function Button5() {
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

function Button6() {
  return (
    <BackgroundImage additionalClassNames="h-[39.989px]">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[16px] left-[39.73px] text-[12px] text-[rgba(255,255,255,0.7)] text-center text-nowrap top-[11.35px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        지하철
      </p>
    </BackgroundImage>
  );
}

function Button7() {
  return (
    <BackgroundImage additionalClassNames="h-[39.989px]">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[16px] left-[39.3px] not-italic text-[12px] text-[rgba(255,255,255,0.7)] text-center text-nowrap top-[11.35px] translate-x-[-50%]">MY</p>
    </BackgroundImage>
  );
}

function Container35() {
  return (
    <div className="h-[44.069px] relative shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.36px_0px_0px] border-[rgba(255,255,255,0.2)] border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center pb-0 pl-0 pr-[0.021px] pt-[1.36px] relative size-full">
          <ButtonBackgroundImageAndText text="검색" />
          <Button5 />
          <ButtonBackgroundImageAndText text="버스" />
          <Button6 />
          <Button7 />
        </div>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute bg-gradient-to-b content-stretch flex flex-col from-[rgba(90,141,176,0.8)] h-[115.463px] items-start left-0 pb-[3.4px] pt-0 px-0 to-[rgba(74,127,167,0.8)] top-0 w-[393.007px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_3.4px] border-black border-solid inset-0 pointer-events-none shadow-[0px_4px_0px_0px_rgba(0,0,0,0.2)]" />
      <Container34 />
      <Container35 />
    </div>
  );
}

export default function CuteGameConceptMapApp() {
  return (
    <div className="relative size-full" data-name="Cute Game Concept Map App" style={{ backgroundImage: "linear-gradient(rgb(197, 231, 245) 0%, rgb(232, 244, 248) 100%), linear-gradient(90deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 100%)" }}>
      <Container />
      <Container1 />
      <Container29 />
      <Container32 />
      <Container36 />
    </div>
  );
}