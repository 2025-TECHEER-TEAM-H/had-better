import clsx from "clsx";
import imgImageFullMap from "../assets/506d3ac81771f7af9c2519c77e86748254304713.png";
type Button2Props = {
  text: string;
};

function Button2({ children, text }: React.PropsWithChildren<Button2Props>) {
  return (
    <div className="bg-white relative rounded-[14px] shrink-0 size-[48px]">
      <div aria-hidden="true" className="absolute border-[2.72px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[2.72px] pr-[2.731px] py-[2.72px] relative size-full">
        <div className="relative shrink-0 size-[20.005px]">
          <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-start relative size-full">
            <p className="font-['Press_Start_2P:Regular',sans-serif] leading-[20px] not-italic relative shrink-0 text-[20px] text-black text-center text-nowrap">{text}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}

function ImageFullMap() {
  return (
    <div className="h-[837.031px] relative shrink-0 w-full" data-name="Image (Full Map)">
      <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImageFullMap} />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col h-[837.031px] items-start left-0 overflow-clip top-0 w-[378.038px]" data-name="Container">
      <ImageFullMap />
    </div>
  );
}

function Container1() {
  return <div className="bg-black h-[1.997px] rounded-[2.28151e+07px] shrink-0 w-full" data-name="Container" />;
}

function Container2() {
  return (
    <div className="h-[13.981px] relative shrink-0 w-[19.995px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.995px] items-start relative size-full">
        {[...Array(3).keys()].map((_, i) => (
          <Container1 key={i} />
        ))}
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="bg-white relative rounded-[14px] shrink-0 size-[48px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[2.72px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[2.72px] relative size-full">
        <Container2 />
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <Wrapper additionalClassNames="h-[24px] w-[16.319px]">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[24px] left-[8px] not-italic text-[#0a0a0a] text-[16px] text-center text-nowrap top-[-0.96px] tracking-[-0.3125px] translate-x-[-50%]">👤</p>
    </Wrapper>
  );
}

function Container3() {
  return (
    <div className="bg-[#00d9ff] relative rounded-[2.28151e+07px] shrink-0 size-[32px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.36px] border-black border-solid inset-0 pointer-events-none rounded-[2.28151e+07px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.36px] relative size-full">
        <Paragraph />
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="basis-0 bg-white grow h-[48px] min-h-px min-w-px relative rounded-[14px] shrink-0" data-name="Button">
      <div aria-hidden="true" className="absolute border-[2.72px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[4px_4px_0px_0px_black]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[2.72px] relative size-full">
          <Container3 />
        </div>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex gap-[11.995px] h-[48px] items-start left-[250.05px] top-[19.99px] w-[107.994px]" data-name="Container">
      <Button />
      <Button1 />
    </div>
  );
}

function Container5() {
  return <div className="bg-[#00d9ff] h-[7.719px] opacity-[0.404] rounded-[2.28151e+07px] shrink-0 w-full" data-name="Container" />;
}

function Container6() {
  return (
    <div className="absolute bg-[#00d9ff] content-stretch flex flex-col items-start left-[19.99px] pb-[1.36px] pt-[0.14px] px-[0.14px] rounded-[2.28151e+07px] size-[8px] top-[19.99px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.36px] border-black border-solid inset-0 pointer-events-none rounded-[2.28151e+07px]" />
      <Container5 />
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-white relative rounded-[14px] shrink-0 size-[48px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[2.72px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container6 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[11.995px] h-[167.988px] items-start left-[19.99px] top-[573.04px] w-[48px]" data-name="Container">
      <Button2 text="+" />
      <Button2 text="-" />
      <Button3 />
    </div>
  );
}

function Text() {
  return (
    <Wrapper additionalClassNames="h-[21.004px] w-[83.962px]">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[21px] left-[42px] not-italic text-[14px] text-center text-nowrap text-white top-[-1.28px] translate-x-[-50%]">start!</p>
    </Wrapper>
  );
}

function Text1() {
  return (
    <Wrapper additionalClassNames="h-[21.004px] w-[14.959px]">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[21px] left-[7px] not-italic text-[14px] text-center text-nowrap text-white top-[-1.28px] translate-x-[-50%]">🚀</p>
    </Wrapper>
  );
}

function Button4() {
  return (
    <div className="bg-[#00d9ff] h-[64px] relative rounded-[16px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[3.4px] border-black border-solid inset-0 pointer-events-none rounded-[16px] shadow-[6px_6px_0px_0px_black]" />
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center pl-[3.4px] pr-[3.411px] py-[3.4px] relative size-full">
          <Text />
          <Text1 />
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute bg-gradient-to-b content-stretch flex flex-col from-white h-[115.994px] items-start left-0 pb-0 pt-[32px] px-[19.995px] to-[rgba(0,0,0,0)] top-[721.04px] via-1/2 w-[378.038px]" data-name="Container">
      <Button4 />
    </div>
  );
}

function FullMapPage() {
  return (
    <div className="bg-white h-[837.031px] overflow-clip relative shrink-0 w-full" data-name="FullMapPage">
      <Container />
      <Container4 />
      <Container7 />
      <Container8 />
    </div>
  );
}

export default function ImplementDashboardAndOnboarding() {
  return (
    <div className="bg-white relative rounded-[40px] size-full" data-name="Implement Dashboard and Onboarding">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[7.479px] relative rounded-[inherit] size-full">
        <FullMapPage />
      </div>
      <div aria-hidden="true" className="absolute border-[#1a1a2e] border-[7.479px] border-solid inset-0 pointer-events-none rounded-[40px] shadow-[0px_0px_0px_4px_#4ecca3,0px_30px_80px_0px_rgba(78,204,163,0.5),0px_0px_60px_0px_rgba(78,204,163,0.3)]" />
    </div>
  );
}
