import svgPaths from "./svg-2mccnqcvdk";
import clsx from "clsx";
import imgImage67 from "../assets/fbcd7982a952f6eb16f488f8cd1ffb7012decdf8.png";
type Container34Props = {
  text: string;
};

function Container34({ children, text }: React.PropsWithChildren<Container34Props>) {
  return (
    <div className="bg-white relative shrink-0 size-[32px]">
      <div aria-hidden="true" className="absolute border-[1.36px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.36px] relative size-full">
        <Wrapper additionalClassNames="h-[16px] w-[14.279px]">
          <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[7px] not-italic text-[12px] text-black text-center text-nowrap top-[0.68px] translate-x-[-50%]">{text}</p>
        </Wrapper>
      </div>
    </div>
  );
}

function Button4({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[44.993px] relative shrink-0 w-[32px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.995px] items-center relative size-full">{children}</div>
    </div>
  );
}
type Container38Props = {
  additionalClassNames?: string;
};

function Container38({ children, additionalClassNames = "" }: React.PropsWithChildren<Container38Props>) {
  return (
    <div className={clsx("h-[102.799px] relative rounded-[10px] shrink-0 w-full", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border-[3.4px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="content-stretch flex gap-[11.995px] items-start pb-[3.4px] pt-[19.4px] px-[19.4px] relative size-full">{children}</div>
    </div>
  );
}

function Container29({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="basis-0 grow h-[64px] min-h-px min-w-px relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.995px] items-start relative size-full">{children}</div>
    </div>
  );
}
type Wrapper2Props = {
  additionalClassNames?: string;
};

function Wrapper2({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper2Props>) {
  return (
    <div className={clsx("h-[30.714px] relative shrink-0", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border-[1.36px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.36px] pt-[14.916px] px-[9.36px] relative size-full">{children}</div>
    </div>
  );
}
type Wrapper1Props = {
  additionalClassNames?: string;
};

function Wrapper1({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper1Props>) {
  return (
    <div className={additionalClassNames}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return <Wrapper1 additionalClassNames={clsx("relative shrink-0", additionalClassNames)}>{children}</Wrapper1>;
}
type TextText3Props = {
  text: string;
};

function TextText3({ text }: TextText3Props) {
  return (
    <Wrapper additionalClassNames="h-[8.999px] w-[23.989px]">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[12px] not-italic text-[6px] text-black text-center text-nowrap top-[-0.64px] translate-x-[-50%]">{text}</p>
    </Wrapper>
  );
}
type TextText2Props = {
  text: string;
};

function TextText2({ text }: TextText2Props) {
  return (
    <Wrapper additionalClassNames="h-[8.999px] w-[17.997px]">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[9px] not-italic text-[6px] text-black text-center text-nowrap top-[-0.64px] translate-x-[-50%]">{text}</p>
    </Wrapper>
  );
}

function TextText1({ text }: TextText1Props) {
  return (
    <Wrapper additionalClassNames="h-[16px] w-[14.279px]">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[16px] left-[7px] not-italic text-[12px] text-black text-center text-nowrap top-[0.68px] translate-x-[-50%]">{text}</p>
    </Wrapper>
  );
}
type Text2Props = {
  text: string;
  additionalClassNames?: string;
};

function Text2({ text, additionalClassNames = "" }: Text2Props) {
  return (
    <Wrapper1 additionalClassNames={clsx("h-[16px] relative shrink-0", additionalClassNames)}>
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[16px] left-0 not-italic text-[12px] text-black text-nowrap top-[-0.64px]">{text}</p>
    </Wrapper1>
  );
}

function Container8() {
  return (
    <Wrapper2 additionalClassNames="bg-white w-[42.709px]">
      <TextText text="OPEN" />
    </Wrapper2>
  );
}
type TextTextProps = {
  text: string;
};

function TextText({ text }: TextTextProps) {
  return (
    <div className="content-stretch flex h-[6.119px] items-start relative shrink-0 w-full">
      <p className="font-['Press_Start_2P:Regular',sans-serif] leading-[9px] not-italic relative shrink-0 text-[6px] text-black text-nowrap">{text}</p>
    </div>
  );
}
type HeadingTextProps = {
  text: string;
};

function HeadingText({ text }: HeadingTextProps) {
  return (
    <div className="h-[14.991px] relative shrink-0 w-full">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-black text-nowrap top-[-0.96px]">{text}</p>
    </div>
  );
}
type Text1Props = {
  text: string;
};

function Text1({ text }: Text1Props) {
  return (
    <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.36px] relative size-full">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[36px] not-italic relative shrink-0 text-[#0a0a0a] text-[30px] text-nowrap tracking-[0.3955px]">{text}</p>
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[40px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[40%_20%_20%_20%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 16">
          <path d="M48 0H0V16H48V0Z" fill="var(--fill-0, white)" id="Vector" opacity="0.9" />
        </svg>
      </div>
      <div className="absolute inset-[60%_10%_10%_10%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 64 12">
          <path d="M64 0H0V12H64V0Z" fill="var(--fill-0, white)" id="Vector" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col h-[40px] items-start left-[250.05px] top-[64px] w-[80px]" data-name="Container">
      <Icon />
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[29.997px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[40%_20%_20%_20%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 35.9966 11.9989">
          <path d={svgPaths.p36b3f80} fill="var(--fill-0, white)" id="Vector" opacity="0.9" />
        </svg>
      </div>
      <div className="absolute inset-[60%_10%_6.67%_10%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 47.9955 9.99906">
          <path d={svgPaths.pab2a800} fill="var(--fill-0, white)" id="Vector" opacity="0.9" />
        </svg>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[29.992px] items-start left-[32px] top-[128px] w-[59.994px]" data-name="Container">
      <Icon1 />
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex h-[36.854px] items-start relative w-[30.958px]" data-name="Container">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[36px] not-italic relative shrink-0 text-[#0a0a0a] text-[30px] text-nowrap tracking-[0.3955px]">🗺️</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="h-[32.083px] relative w-[23.91px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[32px] left-[0.01px] not-italic text-[#0a0a0a] text-[24px] text-nowrap top-[0.04px] tracking-[0.0703px]">📍</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute h-[32px] left-[48px] top-[32px] w-[23.798px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[32px] left-0 not-italic text-[#0a0a0a] text-[24px] text-nowrap top-[0.04px] tracking-[0.0703px]">📍</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="[grid-area:1_/_1] bg-white border-[3.4px] border-black border-solid h-[314px] ml-0 mt-0 overflow-clip relative rounded-[10px] shadow-[6px_6px_0px_0px_black] w-[307px]" data-name="Container">
      <div className="absolute h-[314px] left-[-2.4px] top-[-3.4px] w-[307px]" data-name="image 67">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage67} />
      </div>
      <Container4 />
    </div>
  );
}

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
      <Container5 />
    </div>
  );
}

function Container6() {
  return (
    <div className="bg-white relative shrink-0 size-[64px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.36px] border-black border-solid inset-0 pointer-events-none" />
      <Text1 text="🏞️" />
    </div>
  );
}

function Container7() {
  return (
    <Wrapper2 additionalClassNames="bg-[#ffd93d] w-[54.704px]">
      <TextText text="2.5 KM" />
    </Wrapper2>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex gap-[3.995px] h-[30.714px] items-start relative shrink-0 w-full" data-name="Container">
      <Container7 />
      <Container8 />
    </div>
  );
}

function Container10() {
  return (
    <Container29>
      <HeadingText text="CENTRAL PARK" />
      <Container9 />
    </Container29>
  );
}

function Container11() {
  return (
    <Container38 additionalClassNames="bg-[#7ed321]">
      <Container6 />
      <Container10 />
    </Container38>
  );
}

function Container12() {
  return (
    <div className="bg-white relative shrink-0 size-[64px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.36px] border-black border-solid inset-0 pointer-events-none" />
      <Text1 text="🏪" />
    </div>
  );
}

function Container13() {
  return (
    <Wrapper2 additionalClassNames="bg-[#ffd93d] w-[54.704px]">
      <TextText text="0.8 KM" />
    </Wrapper2>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex gap-[3.995px] h-[30.714px] items-start relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Container8 />
    </div>
  );
}

function Container15() {
  return (
    <Container29>
      <HeadingText text="PET SHOP" />
      <Container14 />
    </Container29>
  );
}

function Container16() {
  return (
    <Container38 additionalClassNames="bg-[#00d9ff]">
      <Container12 />
      <Container15 />
    </Container38>
  );
}

function Container17() {
  return (
    <div className="bg-[#ffd93d] relative shrink-0 size-[64px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.36px] border-black border-solid inset-0 pointer-events-none" />
      <Text1 text="🏥" />
    </div>
  );
}

function Container18() {
  return (
    <Wrapper2 additionalClassNames="bg-[#ffd93d] w-[54.704px]">
      <TextText text="1.2 KM" />
    </Wrapper2>
  );
}

function Text() {
  return (
    <div className="content-stretch flex h-[6.119px] items-start relative shrink-0 w-full" data-name="Text">
      <p className="font-['Press_Start_2P:Regular',sans-serif] leading-[9px] not-italic relative shrink-0 text-[6px] text-nowrap text-white">CLOSED</p>
    </div>
  );
}

function Container19() {
  return (
    <Wrapper2 additionalClassNames="bg-[#ff6b9d] w-[54.704px]">
      <Text />
    </Wrapper2>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex gap-[3.995px] h-[30.714px] items-start relative shrink-0 w-full" data-name="Container">
      <Container18 />
      <Container19 />
    </div>
  );
}

function Container21() {
  return (
    <Container29>
      <HeadingText text="VET CLINIC" />
      <Container20 />
    </Container29>
  );
}

function Container22() {
  return (
    <Container38 additionalClassNames="bg-white">
      <Container17 />
      <Container21 />
    </Container38>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[340.397px] items-start relative shrink-0 w-full" data-name="Container">
      <Container11 />
      <Container16 />
      <Container22 />
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[24px] h-[852.649px] items-start left-0 overflow-clip pb-0 pt-[64px] px-[19.995px] top-0 w-[346.049px]" data-name="Container">
      <Group />
      <Container23 />
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute h-[127.999px] left-0 top-[-128px] w-[346.049px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 346.049 127.999">
        <g clipPath="url(#clip0_5_497)" id="Icon">
          <path d={svgPaths.p2cc06d00} fill="var(--fill-0, #4A7C2E)" id="Vector" opacity="0.8" />
        </g>
        <defs>
          <clipPath id="clip0_5_497">
            <rect fill="white" height="127.999" width="346.049" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon3() {
  return (
    <div className="absolute h-[95.999px] left-0 top-[-96px] w-[346.049px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 346.049 95.9995">
        <g clipPath="url(#clip0_5_494)" id="Icon">
          <path d={svgPaths.p2297f680} fill="var(--fill-0, #5F9E3E)" id="Vector" opacity="0.9" />
        </g>
        <defs>
          <clipPath id="clip0_5_494">
            <rect fill="white" height="95.9995" width="346.049" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon4() {
  return (
    <div className="absolute h-[79.999px] left-0 top-[-80px] w-[346.049px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 346.049 79.9995">
        <g clipPath="url(#clip0_5_489)" id="Icon">
          <path d={svgPaths.p340ba200} fill="var(--fill-0, #7ED321)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_5_489">
            <rect fill="white" height="79.9995" width="346.049" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Icon5() {
  return (
    <div className="h-[20px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[60%_37.5%_0_37.5%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 8">
          <path d="M4 0H0V8H4V0Z" fill="var(--fill-0, #6B4423)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[30%_12.5%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 8">
          <path d="M12 0H0V8H12V0Z" fill="var(--fill-0, #2D5016)" id="Vector" />
        </svg>
      </div>
      <div className="absolute bottom-[60%] left-1/4 right-1/4 top-[10%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 6">
          <path d="M8 0H0V6H8V0Z" fill="var(--fill-0, #2D5016)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute content-stretch flex flex-col h-[19.995px] items-start left-[69.21px] top-[-35.99px] w-[16px]" data-name="Container">
      <Icon5 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="h-[23.993px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[66.67%_40%_0_40%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.99892 7.99783">
          <path d={svgPaths.p21831d40} fill="var(--fill-0, #6B4423)" id="Vector" />
        </svg>
      </div>
      <div className="absolute bottom-1/4 left-[20%] right-[20%] top-[41.67%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9967 7.99783">
          <path d={svgPaths.p38c74932} fill="var(--fill-0, #2D5016)" id="Vector" />
        </svg>
      </div>
      <div className="absolute bottom-1/2 left-[30%] right-[30%] top-[16.67%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.99783 7.99783">
          <path d={svgPaths.p347ab800} fill="var(--fill-0, #2D5016)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="absolute content-stretch flex flex-col h-[24px] items-start left-[239.54px] top-[-35.99px] w-[19.995px]" data-name="Container">
      <Icon6 />
    </div>
  );
}

function Container27() {
  return (
    <div className="absolute h-0 left-0 top-[780.65px] w-[346.049px]" data-name="Container">
      <Icon2 />
      <Icon3 />
      <Icon4 />
      <Container25 />
      <Container26 />
    </div>
  );
}

function Container28() {
  return <div className="bg-black shrink-0 size-[3.995px]" data-name="Container" />;
}

function Container30() {
  return (
    <div className="h-[3.995px] relative shrink-0 w-[19.973px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.995px] items-start relative size-full">
        {[...Array(3).keys()].map((_, i) => (
          <Container28 key={i} />
        ))}
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[43.994px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[19.995px] py-0 relative size-full">
          <Text2 text="9:41" additionalClassNames="w-[47.978px]" />
          <Text2 text="MAP PLACES" additionalClassNames="w-[119.946px]" />
          <Container30 />
        </div>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="absolute bg-[#00d9ff] content-stretch flex flex-col h-[47.394px] items-start left-0 pb-[3.4px] pt-0 px-0 top-0 w-[346.049px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_3.4px] border-black border-solid inset-0 pointer-events-none shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]" />
      <Container31 />
    </div>
  );
}

function Container33() {
  return (
    <div className="bg-white relative shrink-0 size-[32px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.36px] border-black border-solid inset-0 pointer-events-none shadow-[2px_2px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.36px] relative size-full">
        <TextText1 text="🗺️" />
      </div>
    </div>
  );
}

function Button() {
  return (
    <Button4>
      <Container33 />
      <TextText2 text="MAP" />
    </Button4>
  );
}

function Button1() {
  return (
    <Button4>
      <Container34 text="📝" />
      <TextText3 text="LIST" />
    </Button4>
  );
}

function Button2() {
  return (
    <Button4>
      <Container34 text="⭐" />
      <TextText2 text="FAV" />
    </Button4>
  );
}

function Button3() {
  return (
    <Button4>
      <Container34 text="👤" />
      <TextText3 text="USER" />
    </Button4>
  );
}

function Container35() {
  return (
    <div className="h-[68.982px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[42.252px] py-0 relative size-full">
          <Button />
          <Button1 />
          <Button2 />
          <Button3 />
        </div>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute bg-[#00d9ff] content-stretch flex flex-col h-[72.382px] items-start left-0 pb-0 pt-[3.4px] px-0 top-[780.27px] w-[346.049px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[3.4px_0px_0px] border-black border-solid inset-0 pointer-events-none" />
      <Container35 />
    </div>
  );
}

function CrystalForestHome() {
  return (
    <div className="bg-gradient-to-b from-[#87ceeb] h-[852.649px] overflow-clip relative shrink-0 to-[#b0e5f5] w-full" data-name="CrystalForestHome">
      <Container />
      <Container1 />
      <div className="absolute flex h-[37.744px] items-center justify-center left-[62.4px] top-[87.19px] w-[32.022px]" style={{ "--transform-inner-width": "30.390625", "--transform-inner-height": "36" } as React.CSSProperties}>
        <div className="flex-none rotate-[1.676deg]">
          <Container2 />
        </div>
      </div>
      <div className="absolute flex h-[32.166px] items-center justify-center left-[274.08px] top-[142.96px] w-[24.022px]" style={{ "--transform-inner-width": "0", "--transform-inner-height": "0" } as React.CSSProperties}>
        <div className="flex-none rotate-[0.2deg]">
          <Container3 />
        </div>
      </div>
      <Container24 />
      <Container27 />
      <Container32 />
      <Container36 />
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0)] h-[851.99px] left-[16px] rounded-[40px] top-[0.33px] w-[361.007px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[7.479px] relative rounded-[inherit] size-full">
        <CrystalForestHome />
      </div>
      <div aria-hidden="true" className="absolute border-[#1a1a2e] border-[7.479px] border-solid inset-0 pointer-events-none rounded-[40px] shadow-[0px_0px_0px_4px_#4ecca3,0px_30px_80px_0px_rgba(78,204,163,0.5),0px_0px_60px_0px_rgba(78,204,163,0.3)]" />
    </div>
  );
}

export default function CuteGameConceptMapApp() {
  return (
    <div className="bg-[rgba(10,10,15,0)] relative size-full" data-name="Cute Game Concept Map App">
      <Container37 />
    </div>
  );
}
