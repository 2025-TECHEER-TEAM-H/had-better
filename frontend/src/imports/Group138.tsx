import imgHudHeartEmpty1 from "@/assets/hud-heart-empty.png";

function Butenn() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex h-[43px] items-center justify-center px-[10px] py-[5px] relative rounded-[40px] shrink-0 w-[57px]" data-name="butenn">
      <p className="css-ew64yg font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-black text-center">지도</p>
    </div>
  );
}

function Butenn1() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex h-[43px] items-center justify-center px-[10px] py-[5px] relative rounded-[40px] shrink-0 w-[56px]" data-name="butenn">
      <p className="css-ew64yg font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-black text-center">검색</p>
    </div>
  );
}

function Butenn2() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex h-[43px] items-center justify-center px-[10px] py-[5px] relative rounded-[40px] shrink-0 w-[57px]" data-name="butenn">
      <p className="css-ew64yg font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-black text-center">지하철</p>
    </div>
  );
}

function Butenn3() {
  return (
    <div className="bg-[rgba(255,255,255,0)] content-stretch flex h-[43px] items-center justify-center px-[10px] py-[5px] relative rounded-[40px] shrink-0 w-[56px]" data-name="butenn">
      <p className="css-ew64yg font-['Wittgenstein:Medium',sans-serif] font-medium leading-[30px] relative shrink-0 text-[12px] text-black text-center">MY</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex gap-[25px] items-center px-[25px] py-0 relative shrink-0 w-[351px]">
      <Butenn />
      <Butenn1 />
      <Butenn2 />
      <Butenn3 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute bg-white content-stretch flex h-[43.697px] items-center justify-center left-0 top-[155.02px] w-[354.997px]">
      <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none" />
      <Frame />
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute contents inset-[20.83%_16.67%]" data-name="Icon">
      <div className="absolute inset-[20.83%_16.67%_79.17%_16.67%]" data-name="Vector">
        <div className="absolute inset-[-1px_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
            <path d="M1 1H17" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <div className="absolute bottom-1/2 left-[16.67%] right-[16.67%] top-1/2" data-name="Vector_2">
        <div className="absolute inset-[-1px_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
            <path d="M1 1H17" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <div className="absolute inset-[79.17%_16.67%_20.83%_16.67%]" data-name="Vector_3">
        <div className="absolute inset-[-1px_-6.25%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 2">
            <path d="M1 1H17" id="Vector" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="h-[24px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Icon />
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start left-[6px] size-[24px] top-[6px]" data-name="Icon10">
      <Icon1 />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bg-white border-3 border-black border-solid h-[43.697px] left-[21px] rounded-[12px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)] top-[23.93px] w-[42px]" data-name="Container">
      <Icon2 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start justify-end left-[28px] right-[30.54px] top-[78.03px]">
      <div className="bg-white h-[63px] relative rounded-[25px] shrink-0 w-full">
        <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none rounded-[25px]" />
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute content-stretch flex gap-[17px] items-center left-[45.79px] p-[2px] right-[48.93px] top-[90.3px]">
      <div className="relative shrink-0 size-[30px]" data-name="hud_heart_empty 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHudHeartEmpty1} />
      </div>
      <p className="css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] h-[36.752px] leading-[30px] relative shrink-0 text-[13px] text-black w-[237.396px]" style={{ fontVariationSettings: "'wght' 400" }}>
        목적지를 입력해주세요
      </p>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[28px] right-[30.54px] top-[78.03px]">
      <Frame2 />
      <Frame3 />
    </div>
  );
}

function Text() {
  return (
    <div className="h-[23.995px] relative shrink-0 w-[16px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[24px] left-[8px] not-italic text-[16px] text-black text-center top-[-0.63px] translate-x-[-50%]">←</p>
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-white content-stretch flex h-[42.156px] items-center justify-center left-[285px] pl-[2.693px] pr-[2.704px] py-[2.693px] rounded-[14px] top-[26.01px] w-[40.312px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]" />
      <Text />
    </div>
  );
}

export default function Group1() {
  return (
    <div className="relative size-full">
      <div className="absolute bg-[#80cee1] h-[206px] left-[2px] top-0 w-[354px]" />
      <Frame1 />
      <Container />
      <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] h-[26.351px] leading-[30px] left-[175.77px] not-italic text-[16px] text-black text-center top-[33.29px] translate-x-[-50%] w-[195.542px]">HAD BETTER</p>
      <Group />
      <Button />
    </div>
  );
}