import clsx from "clsx";
import imgImage from "../assets/506d3ac81771f7af9c2519c77e86748254304713.png";

function Button13({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="h-[44.991px] relative shrink-0 w-[32px]">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.997px] items-center relative size-full">{children}</div>
    </div>
  );
}
type Button12Props = {
  additionalClassNames?: string;
};

function Button12({ children, additionalClassNames = "" }: React.PropsWithChildren<Button12Props>) {
  return (
    <div className={clsx("h-[110.727px] relative rounded-[10px] shrink-0 w-[331.455px]", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border-[3.366px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.992px] items-start pb-[3.366px] pt-[23.363px] px-[23.363px] relative size-full">{children}</div>
    </div>
  );
}

function Container50({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="basis-0 grow h-[64px] min-h-px min-w-px relative shrink-0">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.997px] items-start relative size-full">{children}</div>
    </div>
  );
}
type Container49Props = {
  additionalClassNames?: string;
};

function Container49({ children, additionalClassNames = "" }: React.PropsWithChildren<Container49Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.997px] items-start relative size-full">{children}</div>
    </div>
  );
}
type Container39Props = {
  additionalClassNames?: string;
};

function Container39({ children, additionalClassNames = "" }: React.PropsWithChildren<Container39Props>) {
  return (
    <div className={clsx("bg-white relative shrink-0", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.346px] relative size-full">{children}</div>
    </div>
  );
}
type Wrapper2Props = {
  additionalClassNames?: string;
};

function Wrapper2({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper2Props>) {
  return (
    <div className={clsx("h-[19.692px] relative shrink-0", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.346px] pt-[5.344px] px-[9.341px] relative size-full">{children}</div>
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
type ParagraphText6Props = {
  text: string;
};

function ParagraphText6({ text }: ParagraphText6Props) {
  return (
    <Wrapper additionalClassNames="h-[8.994px] w-[17.999px]">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[9px] not-italic text-[6px] text-black text-center text-nowrap top-[-0.65px] translate-x-[-50%]">{text}</p>
    </Wrapper>
  );
}
type ParagraphText5Props = {
  text: string;
};

function ParagraphText5({ text }: ParagraphText5Props) {
  return (
    <Wrapper additionalClassNames="h-[17.999px] w-[14.138px]">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[18px] left-[7px] not-italic text-[#0a0a0a] text-[12px] text-center text-nowrap top-[0.35px] translate-x-[-50%]">{text}</p>
    </Wrapper>
  );
}
type ParagraphText4Props = {
  text: string;
  additionalClassNames?: string;
};

function ParagraphText4({ text, additionalClassNames = "" }: ParagraphText4Props) {
  return (
    <Wrapper1 additionalClassNames={clsx("h-[17.999px] relative shrink-0", additionalClassNames)}>
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[18px] left-0 not-italic text-[12px] text-black text-nowrap top-[-0.31px]">{text}</p>
    </Wrapper1>
  );
}
type ParagraphText3Props = {
  text: string;
};

function ParagraphText3({ text }: ParagraphText3Props) {
  return (
    <Wrapper additionalClassNames="h-[15.001px] w-[208.736px]">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-[104.37px] not-italic text-[10px] text-black text-center text-nowrap top-[-0.98px] translate-x-[-50%]">{text}</p>
    </Wrapper>
  );
}

function Container3() {
  return (
    <Wrapper2 additionalClassNames="bg-white w-[42.677px]">
      <Text text="OPEN" />
    </Wrapper2>
  );
}
type Text1Props = {
  text: string;
};

function Text1({ text }: Text1Props) {
  return (
    <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[12px] not-italic text-[6px] text-black text-center text-nowrap top-[-0.65px] translate-x-[-50%]">{text}</p>
    </div>
  );
}
type TextProps = {
  text: string;
};

function Text({ text }: TextProps) {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[12px] not-italic text-[6px] text-black text-center text-nowrap top-[-0.65px] translate-x-[-50%]">{text}</p>
    </div>
  );
}
type ParagraphText2Props = {
  text: string;
};

function ParagraphText2({ text }: ParagraphText2Props) {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[18px] not-italic text-[6px] text-black text-center text-nowrap top-[-0.65px] translate-x-[-50%]">{text}</p>
    </div>
  );
}
type ParagraphText1Props = {
  text: string;
};

function ParagraphText1({ text }: ParagraphText1Props) {
  return (
    <Wrapper additionalClassNames="h-[15.001px] w-[208.736px]">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-[104.38px] not-italic text-[10px] text-black text-center text-nowrap top-[-0.98px] translate-x-[-50%]">{text}</p>
    </Wrapper>
  );
}
type ParagraphTextProps = {
  text: string;
};

function ParagraphText({ text }: ParagraphTextProps) {
  return (
    <Wrapper additionalClassNames="h-[45.002px] w-[30.296px]">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[45px] left-[15px] not-italic text-[#0a0a0a] text-[30px] text-center text-nowrap top-[0.71px] tracking-[0.3955px] translate-x-[-50%]">{text}</p>
    </Wrapper>
  );
}

function Image() {
  return (
    <div className="absolute h-[837.184px] left-0 top-0 w-[378.182px]" data-name="Image">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage} />
    </div>
  );
}

function Container() {
  return <div className="absolute bg-[#d1d5dc] h-[5.996px] left-[161.72px] rounded-[2.25902e+07px] top-[16px] w-[48px]" data-name="Container" />;
}

function Container1() {
  return (
    <Container39 additionalClassNames="size-[64px]">
      <ParagraphText text="🏞️" />
    </Container39>
  );
}

function Container2() {
  return (
    <Wrapper2 additionalClassNames="bg-[#ffd93d] w-[54.68px]">
      <ParagraphText2 text="2.5 KM" />
    </Wrapper2>
  );
}

function Container4() {
  return (
    <Container49 additionalClassNames="h-[19.692px] w-[208.736px]">
      <Container2 />
      <Container3 />
    </Container49>
  );
}

function Container5() {
  return (
    <Container50>
      <ParagraphText1 text="CENTRAL PARK" />
      <Container4 />
    </Container50>
  );
}

function Button() {
  return (
    <Button12 additionalClassNames="bg-[#7ed321]">
      <Container1 />
      <Container5 />
    </Button12>
  );
}

function Container6() {
  return (
    <Container39 additionalClassNames="size-[64px]">
      <ParagraphText text="🏪" />
    </Container39>
  );
}

function Container7() {
  return (
    <Wrapper2 additionalClassNames="bg-[#ffd93d] w-[54.68px]">
      <ParagraphText2 text="0.8 KM" />
    </Wrapper2>
  );
}

function Container8() {
  return (
    <Container49 additionalClassNames="h-[19.692px] w-[208.736px]">
      <Container7 />
      <Container3 />
    </Container49>
  );
}

function Container9() {
  return (
    <Container50>
      <ParagraphText3 text="PET SHOP" />
      <Container8 />
    </Container50>
  );
}

function Button1() {
  return (
    <Button12 additionalClassNames="bg-[#00d9ff]">
      <Container6 />
      <Container9 />
    </Button12>
  );
}

function Container10() {
  return (
    <Container39 additionalClassNames="size-[64px]">
      <ParagraphText text="🏥" />
    </Container39>
  );
}

function Container11() {
  return (
    <Wrapper2 additionalClassNames="bg-[#ffd93d] w-[54.68px]">
      <ParagraphText2 text="1.2 KM" />
    </Wrapper2>
  );
}

function Paragraph() {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[18px] not-italic text-[6px] text-center text-nowrap text-white top-[-0.65px] translate-x-[-50%]">CLOSED</p>
    </div>
  );
}

function Container12() {
  return (
    <Wrapper2 additionalClassNames="bg-[#ff6b9d] w-[54.68px]">
      <Paragraph />
    </Wrapper2>
  );
}

function Container13() {
  return (
    <Container49 additionalClassNames="h-[19.692px] w-[208.736px]">
      <Container11 />
      <Container12 />
    </Container49>
  );
}

function Container14() {
  return (
    <Container50>
      <ParagraphText3 text="VET CLINIC" />
      <Container13 />
    </Container50>
  );
}

function Button2() {
  return (
    <Button12 additionalClassNames="bg-white">
      <Container10 />
      <Container14 />
    </Button12>
  );
}

function Container15() {
  return (
    <Container39 additionalClassNames="size-[64px]">
      <ParagraphText text="☕" />
    </Container39>
  );
}

function Container16() {
  return (
    <Wrapper2 additionalClassNames="bg-[#ffd93d] w-[54.68px]">
      <ParagraphText2 text="0.5 KM" />
    </Wrapper2>
  );
}

function Container17() {
  return (
    <Container49 additionalClassNames="h-[19.692px] w-[208.736px]">
      <Container16 />
      <Container3 />
    </Container49>
  );
}

function Container18() {
  return (
    <Container50>
      <ParagraphText1 text="COFFEE SHOP" />
      <Container17 />
    </Container50>
  );
}

function Button3() {
  return (
    <Button12 additionalClassNames="bg-[#ffc107]">
      <Container15 />
      <Container18 />
    </Button12>
  );
}

function Container19() {
  return (
    <Container39 additionalClassNames="size-[64px]">
      <ParagraphText text="📚" />
    </Container39>
  );
}

function Container20() {
  return (
    <Wrapper2 additionalClassNames="bg-[#ffd93d] w-[54.68px]">
      <ParagraphText2 text="1.5 KM" />
    </Wrapper2>
  );
}

function Container21() {
  return (
    <Container49 additionalClassNames="h-[19.692px] w-[208.736px]">
      <Container20 />
      <Container3 />
    </Container49>
  );
}

function Container22() {
  return (
    <Container50>
      <ParagraphText3 text="BOOKSTORE" />
      <Container21 />
    </Container50>
  );
}

function Button4() {
  return (
    <Button12 additionalClassNames="bg-[#ff9ff3]">
      <Container19 />
      <Container22 />
    </Button12>
  );
}

function Container23() {
  return (
    <Container39 additionalClassNames="size-[64px]">
      <ParagraphText text="🍽️" />
    </Container39>
  );
}

function Paragraph1() {
  return (
    <Wrapper additionalClassNames="h-[15.001px] w-[208.736px]">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-[104.37px] not-italic text-[10px] text-center text-nowrap text-white top-[-0.98px] translate-x-[-50%]">RESTAURANT</p>
    </Wrapper>
  );
}

function Container24() {
  return (
    <Wrapper2 additionalClassNames="bg-[#ffd93d] w-[54.68px]">
      <ParagraphText2 text="1.8 KM" />
    </Wrapper2>
  );
}

function Container25() {
  return (
    <Container49 additionalClassNames="h-[19.692px] w-[208.736px]">
      <Container24 />
      <Container3 />
    </Container49>
  );
}

function Container26() {
  return (
    <Container50>
      <Paragraph1 />
      <Container25 />
    </Container50>
  );
}

function Button5() {
  return (
    <Button12 additionalClassNames="bg-[#54a0ff]">
      <Container23 />
      <Container26 />
    </Button12>
  );
}

function Container27() {
  return (
    <Container39 additionalClassNames="size-[64px]">
      <ParagraphText text="💪" />
    </Container39>
  );
}

function Paragraph2() {
  return (
    <Wrapper additionalClassNames="h-[15.001px] w-[208.736px]">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-[104.38px] not-italic text-[10px] text-center text-nowrap text-white top-[-0.98px] translate-x-[-50%]">FITNESS GYM</p>
    </Wrapper>
  );
}

function Container28() {
  return (
    <Wrapper2 additionalClassNames="bg-[#ffd93d] w-[54.68px]">
      <ParagraphText2 text="2.0 KM" />
    </Wrapper2>
  );
}

function Container29() {
  return (
    <Container49 additionalClassNames="h-[19.692px] w-[208.736px]">
      <Container28 />
      <Container3 />
    </Container49>
  );
}

function Container30() {
  return (
    <Container50>
      <Paragraph2 />
      <Container29 />
    </Container50>
  );
}

function Button6() {
  return (
    <Button12 additionalClassNames="bg-[#ff6348]">
      <Container27 />
      <Container30 />
    </Button12>
  );
}

function Container31() {
  return (
    <Container39 additionalClassNames="size-[64px]">
      <ParagraphText text="🛒" />
    </Container39>
  );
}

function Container32() {
  return (
    <Wrapper2 additionalClassNames="bg-[#ffd93d] w-[54.68px]">
      <ParagraphText2 text="1.0 KM" />
    </Wrapper2>
  );
}

function Container33() {
  return (
    <Container49 additionalClassNames="h-[19.692px] w-[208.736px]">
      <Container32 />
      <Container3 />
    </Container49>
  );
}

function Container34() {
  return (
    <Container50>
      <ParagraphText1 text="SUPERMARKET" />
      <Container33 />
    </Container50>
  );
}

function Button7() {
  return (
    <Button12 additionalClassNames="bg-[#48dbfb]">
      <Container31 />
      <Container34 />
    </Button12>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[997.815px] items-start relative shrink-0 w-full" data-name="Container">
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
      <Button5 />
      <Button6 />
      <Button7 />
    </div>
  );
}

function Container36() {
  return (
    <div className="absolute content-stretch flex flex-col h-[355.218px] items-start left-0 overflow-clip px-[19.997px] py-0 top-[38px] w-[371.449px]" data-name="Container">
      <Container35 />
    </div>
  );
}

function Container37() {
  return (
    <div className="absolute bg-white border-[3.366px_3.366px_0px] border-black border-solid h-[418.587px] left-0 rounded-tl-[24px] rounded-tr-[24px] shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] top-[418.6px] w-[378.182px]" data-name="Container">
      <Container />
      <Container36 />
    </div>
  );
}

function Container38() {
  return <div className="bg-black shrink-0 size-[3.997px]" data-name="Container" />;
}

function Container40() {
  return (
    <Container49 additionalClassNames="h-[3.997px] w-[19.987px]">
      {[...Array(3).keys()].map((_, i) => (
        <Container38 key={i} />
      ))}
    </Container49>
  );
}

function Container41() {
  return (
    <div className="h-[41.983px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[19.997px] py-0 relative size-full">
          <ParagraphText4 text="9:41" additionalClassNames="w-[47.989px]" />
          <ParagraphText4 text="MAP PLACES" additionalClassNames="w-[119.973px]" />
          <Container40 />
        </div>
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="absolute bg-[#00d9ff] content-stretch flex flex-col h-[45.349px] items-start left-0 pb-[3.366px] pt-0 px-0 top-0 w-[378.182px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0px_0px_3.366px] border-black border-solid inset-0 pointer-events-none shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]" />
      <Container41 />
    </div>
  );
}

function Container43() {
  return (
    <div className="bg-white relative shrink-0 size-[32px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none shadow-[2px_2px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.346px] relative size-full">
        <ParagraphText5 text="🗺️" />
      </div>
    </div>
  );
}

function Button8() {
  return (
    <Button13>
      <Container43 />
      <ParagraphText6 text="MAP" />
    </Button13>
  );
}

function Container44() {
  return (
    <Container39 additionalClassNames="size-[32px]">
      <ParagraphText5 text="📝" />
    </Container39>
  );
}

function Paragraph3() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-[23.995px]" data-name="Paragraph">
      <Text1 text="LIST" />
    </div>
  );
}

function Button9() {
  return (
    <Button13>
      <Container44 />
      <Paragraph3 />
    </Button13>
  );
}

function Container45() {
  return (
    <Container39 additionalClassNames="size-[32px]">
      <ParagraphText5 text="⭐" />
    </Container39>
  );
}

function Button10() {
  return (
    <Button13>
      <Container45 />
      <ParagraphText6 text="FAV" />
    </Button13>
  );
}

function Container46() {
  return (
    <Container39 additionalClassNames="size-[32px]">
      <ParagraphText5 text="👤" />
    </Container39>
  );
}

function Paragraph4() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-[23.995px]" data-name="Paragraph">
      <Text1 text="USER" />
    </div>
  );
}

function Button11() {
  return (
    <Button13>
      <Container46 />
      <Paragraph4 />
    </Button13>
  );
}

function Container47() {
  return (
    <div className="h-[60.981px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pl-[61.265px] pr-[61.296px] py-0 relative size-full">
          <Button8 />
          <Button9 />
          <Button10 />
          <Button11 />
        </div>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="absolute bg-[#00d9ff] content-stretch flex flex-col h-[64.347px] items-start left-0 pb-0 pt-[3.366px] px-0 top-[772.84px] w-[378.182px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[3.366px_0px_0px] border-black border-solid inset-0 pointer-events-none" />
      <Container47 />
    </div>
  );
}

function PlacesPage() {
  return (
    <div className="h-[837.184px] overflow-clip relative shrink-0 w-full" data-name="PlacesPage">
      <Image />
      <Container37 />
      <Container42 />
      <Container48 />
    </div>
  );
}

export default function ImplementDashboardAndOnboarding() {
  return (
    <div className="bg-white relative rounded-[40px] size-full" data-name="Implement Dashboard and Onboarding">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[7.406px] relative rounded-[inherit] size-full">
        <PlacesPage />
      </div>
      <div aria-hidden="true" className="absolute border-[#1a1a2e] border-[7.406px] border-solid inset-0 pointer-events-none rounded-[40px] shadow-[0px_0px_0px_4px_#4ecca3,0px_30px_80px_0px_rgba(78,204,163,0.5),0px_0px_60px_0px_rgba(78,204,163,0.3)]" />
    </div>
  );
}
