import imgImage from "@/assets/image-placeholder.png";

function Container() {
  return <div className="bg-[rgba(255,255,255,0.8)] shrink-0 size-[3.995px]" data-name="Container" />;
}

function Container1() {
  return (
    <div className="h-[3.995px] relative shrink-0 w-[19.973px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.995px] items-start relative size-full">
        {[...Array(3).keys()].map((_, i) => (
          <Container key={i} />
        ))}
      </div>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[18.008px] relative shrink-0 w-[155.93px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[18px] left-0 not-italic text-[12px] text-white top-[-0.28px]">Had better...</p>
      </div>
    </div>
  );
}

function Text() {
  return (
    <div className="h-[23.995px] relative shrink-0 w-[16px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[24px] left-[8px] not-italic text-[16px] text-center text-white top-[-0.63px] translate-x-[-50%]">←</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute content-stretch flex h-[46.002px] items-center justify-between left-0 px-[19.995px] py-0 top-0 w-[378.038px]" data-name="Container">
      <Container1 />
      <Paragraph />
      <Text />
    </div>
  );
}

function TextInput() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.2)] h-[48px] left-0 rounded-[14px] top-0 w-[338.049px]" data-name="Text Input">
      <div className="content-stretch flex items-center overflow-clip pl-[48px] pr-[16px] py-0 relative rounded-[inherit] size-full">
        <p className="css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[normal] relative shrink-0 text-[14px] text-[rgba(255,255,255,0.5)]" style={{ fontVariationSettings: "'wght' 400" }}>
          장소, 검색
        </p>
      </div>
      <div aria-hidden="true" className="absolute border-[1.36px] border-[rgba(255,255,255,0.3)] border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_4px_8px_0px_rgba(0,0,0,0.1)]" />
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute h-[27.995px] left-[16px] top-[10px] w-[17.679px]" data-name="Container">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[28px] left-0 not-italic text-[#0a0a0a] text-[18px] top-[-0.28px] tracking-[-0.4395px]">🔍</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute h-[48px] left-[19.99px] top-[46px] w-[338.049px]" data-name="Container">
      <TextInput />
      <Container3 />
    </div>
  );
}

function Button() {
  return (
    <div className="flex-[1_0_0] h-[39.989px] min-h-px min-w-px relative" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[16px] left-[37.92px] text-[12px] text-[rgba(255,255,255,0.7)] text-center top-[11.35px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
          지도
        </p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="flex-[1_0_0] h-[42.709px] min-h-px min-w-px relative" data-name="Button">
      <div aria-hidden="true" className="absolute border-[#48d448] border-b-[2.72px] border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[16px] left-[37.92px] text-[#48d448] text-[12px] text-center top-[11.35px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
          검색
        </p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="flex-[1_0_0] h-[39.989px] min-h-px min-w-px relative" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[16px] left-[38.24px] text-[12px] text-[rgba(255,255,255,0.7)] text-center top-[11.35px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
          지하철
        </p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="flex-[1_0_0] h-[39.989px] min-h-px min-w-px relative" data-name="Button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[16px] left-[37.81px] not-italic text-[12px] text-[rgba(255,255,255,0.7)] text-center top-[11.35px] translate-x-[-50%]">MY</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex h-[44.069px] items-center left-0 pb-0 pl-0 pr-[-0.021px] pt-[1.36px] top-[110px] w-[378.038px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[rgba(255,255,255,0.2)] border-solid border-t-[1.36px] inset-0 pointer-events-none" />
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute bg-gradient-to-b border-b-[3.4px] border-black border-solid from-[rgba(90,141,176,0.8)] h-[157.471px] left-[0.66px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.2)] to-[rgba(74,127,167,0.8)] top-[-0.34px] w-[378.038px]" data-name="Container">
      <Container2 />
      <Container4 />
      <Container5 />
    </div>
  );
}

function Image() {
  return (
    <div className="absolute h-[837.303px] left-0 overflow-clip top-0 w-[378.309px]" data-name="Image">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
      <Container6 />
    </div>
  );
}

function Container7() {
  return <div className="absolute bg-[#d1d5dc] h-[5.998px] left-[161.82px] rounded-[22400900px] top-[15.99px] w-[47.994px]" data-name="Container" />;
}

function Paragraph1() {
  return (
    <div className="h-[45px] relative shrink-0 w-[30.042px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[45px] left-[15px] not-italic text-[#0a0a0a] text-[30px] text-center top-[0.67px] tracking-[0.3955px] translate-x-[-50%]">🏞️</p>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="bg-white relative shrink-0 size-[63.996px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.335px] pr-[1.345px] py-[1.335px] relative size-full">
        <Paragraph1 />
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[15px] relative shrink-0 w-[208.979px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-[60px] not-italic text-[10px] text-black text-center top-[-1px] translate-x-[-50%]">CENTRAL PARK</p>
      </div>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[9.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[18px] not-italic text-[6px] text-black text-center top-[-0.66px] translate-x-[-50%]">2.5 KM</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-[#ffd93d] h-[19.663px] relative shrink-0 w-[54.628px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.335px] pt-[5.33px] px-[9.326px] relative size-full">
        <Paragraph3 />
      </div>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[9.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[12px] not-italic text-[6px] text-black text-center top-[-0.66px] translate-x-[-50%]">OPEN</p>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-white h-[19.663px] relative shrink-0 w-[42.632px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.335px] pt-[5.33px] px-[9.326px] relative size-full">
        <Paragraph4 />
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[19.663px] relative shrink-0 w-[208.979px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.995px] items-start relative size-full">
        <Container9 />
        <Container10 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="flex-[1_0_0] h-[63.996px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.995px] items-start relative size-full">
        <Paragraph2 />
        <Container11 />
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-[#7ed321] h-[110.665px] relative rounded-[10px] shrink-0 w-[331.64px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[3.338px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.996px] items-start pb-[3.338px] pt-[23.335px] px-[23.335px] relative size-full">
        <Container8 />
        <Container12 />
      </div>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[45px] relative shrink-0 w-[30.042px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[45px] left-[15px] not-italic text-[#0a0a0a] text-[30px] text-center top-[0.67px] tracking-[0.3955px] translate-x-[-50%]">🏪</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="bg-white relative shrink-0 size-[63.996px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.335px] pr-[1.345px] py-[1.335px] relative size-full">
        <Paragraph5 />
      </div>
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[15px] relative shrink-0 w-[208.979px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-[39.99px] not-italic text-[10px] text-black text-center top-[-1px] translate-x-[-50%]">PET SHOP</p>
      </div>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[9.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[18px] not-italic text-[6px] text-black text-center top-[-0.66px] translate-x-[-50%]">0.8 KM</p>
    </div>
  );
}

function Container14() {
  return (
    <div className="bg-[#ffd93d] h-[19.663px] relative shrink-0 w-[54.628px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.335px] pt-[5.33px] px-[9.326px] relative size-full">
        <Paragraph7 />
      </div>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[9.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[12px] not-italic text-[6px] text-black text-center top-[-0.66px] translate-x-[-50%]">OPEN</p>
    </div>
  );
}

function Container15() {
  return (
    <div className="bg-white h-[19.663px] relative shrink-0 w-[42.632px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.335px] pt-[5.33px] px-[9.326px] relative size-full">
        <Paragraph8 />
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[19.663px] relative shrink-0 w-[208.979px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.995px] items-start relative size-full">
        <Container14 />
        <Container15 />
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="flex-[1_0_0] h-[63.996px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.995px] items-start relative size-full">
        <Paragraph6 />
        <Container16 />
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-[#00d9ff] h-[110.665px] relative rounded-[10px] shrink-0 w-[331.64px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[3.338px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.996px] items-start pb-[3.338px] pt-[23.335px] px-[23.335px] relative size-full">
        <Container13 />
        <Container17 />
      </div>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[45px] relative shrink-0 w-[30.042px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[45px] left-[15px] not-italic text-[#0a0a0a] text-[30px] text-center top-[0.67px] tracking-[0.3955px] translate-x-[-50%]">🏥</p>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="bg-white relative shrink-0 size-[63.996px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.335px] pr-[1.345px] py-[1.335px] relative size-full">
        <Paragraph9 />
      </div>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[15px] relative shrink-0 w-[208.979px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-[49.99px] not-italic text-[10px] text-black text-center top-[-1px] translate-x-[-50%]">VET CLINIC</p>
      </div>
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="h-[9.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[18px] not-italic text-[6px] text-black text-center top-[-0.66px] translate-x-[-50%]">1.2 KM</p>
    </div>
  );
}

function Container19() {
  return (
    <div className="bg-[#ffd93d] h-[19.663px] relative shrink-0 w-[54.628px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.335px] pt-[5.33px] px-[9.326px] relative size-full">
        <Paragraph11 />
      </div>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="h-[9.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[18px] not-italic text-[6px] text-center text-white top-[-0.66px] translate-x-[-50%]">CLOSED</p>
    </div>
  );
}

function Container20() {
  return (
    <div className="bg-[#ff6b9d] h-[19.663px] relative shrink-0 w-[54.628px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.335px] pt-[5.33px] px-[9.326px] relative size-full">
        <Paragraph12 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[19.663px] relative shrink-0 w-[208.979px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.995px] items-start relative size-full">
        <Container19 />
        <Container20 />
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.995px] items-start relative w-full">
        <Paragraph10 />
        <Container21 />
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-white h-[110.665px] relative rounded-[10px] shrink-0 w-[331.64px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[3.338px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.996px] items-start pb-[3.338px] pt-[23.335px] px-[23.335px] relative size-full">
        <Container18 />
        <Container22 />
      </div>
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="h-[45px] relative shrink-0 w-[30.042px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[45px] left-[15px] not-italic text-[#0a0a0a] text-[30px] text-center top-[0.67px] tracking-[0.3955px] translate-x-[-50%]">☕</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="bg-white relative shrink-0 size-[63.996px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.335px] pr-[1.345px] py-[1.335px] relative size-full">
        <Paragraph13 />
      </div>
    </div>
  );
}

function Paragraph14() {
  return (
    <div className="h-[15px] relative shrink-0 w-[208.979px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-[104.52px] not-italic text-[10px] text-black text-center top-[-1px] translate-x-[-50%]">COFFEE SHOP</p>
      </div>
    </div>
  );
}

function Paragraph15() {
  return (
    <div className="h-[9.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[18px] not-italic text-[6px] text-black text-center top-[-0.66px] translate-x-[-50%]">0.5 KM</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="bg-[#ffd93d] h-[19.663px] relative shrink-0 w-[54.628px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.335px] pt-[5.33px] px-[9.326px] relative size-full">
        <Paragraph15 />
      </div>
    </div>
  );
}

function Paragraph16() {
  return (
    <div className="h-[9.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[12px] not-italic text-[6px] text-black text-center top-[-0.66px] translate-x-[-50%]">OPEN</p>
    </div>
  );
}

function Container25() {
  return (
    <div className="bg-white h-[19.663px] relative shrink-0 w-[42.632px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.335px] pt-[5.33px] px-[9.326px] relative size-full">
        <Paragraph16 />
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[19.663px] relative shrink-0 w-[208.979px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.995px] items-start relative size-full">
        <Container24 />
        <Container25 />
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="flex-[1_0_0] h-[63.996px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.995px] items-start relative size-full">
        <Paragraph14 />
        <Container26 />
      </div>
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-[#ffc107] h-[110.665px] relative rounded-[10px] shrink-0 w-[331.64px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[3.338px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.996px] items-start pb-[3.338px] pt-[23.335px] px-[23.335px] relative size-full">
        <Container23 />
        <Container27 />
      </div>
    </div>
  );
}

function Paragraph17() {
  return (
    <div className="h-[45px] relative shrink-0 w-[30.042px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[45px] left-[15px] not-italic text-[#0a0a0a] text-[30px] text-center top-[0.67px] tracking-[0.3955px] translate-x-[-50%]">📚</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="bg-white relative shrink-0 size-[63.996px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.335px] pr-[1.345px] py-[1.335px] relative size-full">
        <Paragraph17 />
      </div>
    </div>
  );
}

function Paragraph18() {
  return (
    <div className="h-[15px] relative shrink-0 w-[208.979px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-[104.51px] not-italic text-[10px] text-black text-center top-[-1px] translate-x-[-50%]">BOOKSTORE</p>
      </div>
    </div>
  );
}

function Paragraph19() {
  return (
    <div className="h-[9.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[18px] not-italic text-[6px] text-black text-center top-[-0.66px] translate-x-[-50%]">1.5 KM</p>
    </div>
  );
}

function Container29() {
  return (
    <div className="bg-[#ffd93d] h-[19.663px] relative shrink-0 w-[54.628px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.335px] pt-[5.33px] px-[9.326px] relative size-full">
        <Paragraph19 />
      </div>
    </div>
  );
}

function Paragraph20() {
  return (
    <div className="h-[9.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[12px] not-italic text-[6px] text-black text-center top-[-0.66px] translate-x-[-50%]">OPEN</p>
    </div>
  );
}

function Container30() {
  return (
    <div className="bg-white h-[19.663px] relative shrink-0 w-[42.632px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.335px] pt-[5.33px] px-[9.326px] relative size-full">
        <Paragraph20 />
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="h-[19.663px] relative shrink-0 w-[208.979px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.995px] items-start relative size-full">
        <Container29 />
        <Container30 />
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="flex-[1_0_0] h-[63.996px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.995px] items-start relative size-full">
        <Paragraph18 />
        <Container31 />
      </div>
    </div>
  );
}

function Button8() {
  return (
    <div className="bg-[#ff9ff3] h-[110.665px] relative rounded-[10px] shrink-0 w-[331.64px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[3.338px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.996px] items-start pb-[3.338px] pt-[23.335px] px-[23.335px] relative size-full">
        <Container28 />
        <Container32 />
      </div>
    </div>
  );
}

function Paragraph21() {
  return (
    <div className="h-[45px] relative shrink-0 w-[30.042px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[45px] left-[15px] not-italic text-[#0a0a0a] text-[30px] text-center top-[0.67px] tracking-[0.3955px] translate-x-[-50%]">🍽️</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="bg-white relative shrink-0 size-[63.996px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.335px] pr-[1.345px] py-[1.335px] relative size-full">
        <Paragraph21 />
      </div>
    </div>
  );
}

function Paragraph22() {
  return (
    <div className="h-[15px] relative shrink-0 w-[208.979px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-[104.51px] not-italic text-[10px] text-center text-white top-[-1px] translate-x-[-50%]">RESTAURANT</p>
      </div>
    </div>
  );
}

function Paragraph23() {
  return (
    <div className="h-[9.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[18px] not-italic text-[6px] text-black text-center top-[-0.66px] translate-x-[-50%]">1.8 KM</p>
    </div>
  );
}

function Container34() {
  return (
    <div className="bg-[#ffd93d] h-[19.663px] relative shrink-0 w-[54.628px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.335px] pt-[5.33px] px-[9.326px] relative size-full">
        <Paragraph23 />
      </div>
    </div>
  );
}

function Paragraph24() {
  return (
    <div className="h-[9.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[12px] not-italic text-[6px] text-black text-center top-[-0.66px] translate-x-[-50%]">OPEN</p>
    </div>
  );
}

function Container35() {
  return (
    <div className="bg-white h-[19.663px] relative shrink-0 w-[42.632px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.335px] pt-[5.33px] px-[9.326px] relative size-full">
        <Paragraph24 />
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="h-[19.663px] relative shrink-0 w-[208.979px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.995px] items-start relative size-full">
        <Container34 />
        <Container35 />
      </div>
    </div>
  );
}

function Container37() {
  return (
    <div className="flex-[1_0_0] h-[63.996px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.995px] items-start relative size-full">
        <Paragraph22 />
        <Container36 />
      </div>
    </div>
  );
}

function Button9() {
  return (
    <div className="bg-[#54a0ff] h-[110.665px] relative rounded-[10px] shrink-0 w-[331.64px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[3.338px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.996px] items-start pb-[3.338px] pt-[23.335px] px-[23.335px] relative size-full">
        <Container33 />
        <Container37 />
      </div>
    </div>
  );
}

function Paragraph25() {
  return (
    <div className="h-[45px] relative shrink-0 w-[30.042px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[45px] left-[15px] not-italic text-[#0a0a0a] text-[30px] text-center top-[0.67px] tracking-[0.3955px] translate-x-[-50%]">💪</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="bg-white relative shrink-0 size-[63.996px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.335px] pr-[1.345px] py-[1.335px] relative size-full">
        <Paragraph25 />
      </div>
    </div>
  );
}

function Paragraph26() {
  return (
    <div className="h-[15px] relative shrink-0 w-[208.979px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-[104.52px] not-italic text-[10px] text-center text-white top-[-1px] translate-x-[-50%]">FITNESS GYM</p>
      </div>
    </div>
  );
}

function Paragraph27() {
  return (
    <div className="h-[9.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[18px] not-italic text-[6px] text-black text-center top-[-0.66px] translate-x-[-50%]">2.0 KM</p>
    </div>
  );
}

function Container39() {
  return (
    <div className="bg-[#ffd93d] h-[19.663px] relative shrink-0 w-[54.628px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.335px] pt-[5.33px] px-[9.326px] relative size-full">
        <Paragraph27 />
      </div>
    </div>
  );
}

function Paragraph28() {
  return (
    <div className="h-[9.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[12px] not-italic text-[6px] text-black text-center top-[-0.66px] translate-x-[-50%]">OPEN</p>
    </div>
  );
}

function Container40() {
  return (
    <div className="bg-white h-[19.663px] relative shrink-0 w-[42.632px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.335px] pt-[5.33px] px-[9.326px] relative size-full">
        <Paragraph28 />
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="h-[19.663px] relative shrink-0 w-[208.979px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.995px] items-start relative size-full">
        <Container39 />
        <Container40 />
      </div>
    </div>
  );
}

function Container42() {
  return (
    <div className="flex-[1_0_0] h-[63.996px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.995px] items-start relative size-full">
        <Paragraph26 />
        <Container41 />
      </div>
    </div>
  );
}

function Button10() {
  return (
    <div className="bg-[#ff6348] h-[110.665px] relative rounded-[10px] shrink-0 w-[331.64px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[3.338px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.996px] items-start pb-[3.338px] pt-[23.335px] px-[23.335px] relative size-full">
        <Container38 />
        <Container42 />
      </div>
    </div>
  );
}

function Paragraph29() {
  return (
    <div className="h-[45px] relative shrink-0 w-[30.042px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[45px] left-[15px] not-italic text-[#0a0a0a] text-[30px] text-center top-[0.67px] tracking-[0.3955px] translate-x-[-50%]">🛒</p>
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="bg-white relative shrink-0 size-[63.996px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.335px] pr-[1.345px] py-[1.335px] relative size-full">
        <Paragraph29 />
      </div>
    </div>
  );
}

function Paragraph30() {
  return (
    <div className="h-[15px] relative shrink-0 w-[208.979px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-[104.52px] not-italic text-[10px] text-black text-center top-[-1px] translate-x-[-50%]">SUPERMARKET</p>
      </div>
    </div>
  );
}

function Paragraph31() {
  return (
    <div className="h-[9.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[18px] not-italic text-[6px] text-black text-center top-[-0.66px] translate-x-[-50%]">1.0 KM</p>
    </div>
  );
}

function Container44() {
  return (
    <div className="bg-[#ffd93d] h-[19.663px] relative shrink-0 w-[54.628px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.335px] pt-[5.33px] px-[9.326px] relative size-full">
        <Paragraph31 />
      </div>
    </div>
  );
}

function Paragraph32() {
  return (
    <div className="h-[9.002px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-[12px] not-italic text-[6px] text-black text-center top-[-0.66px] translate-x-[-50%]">OPEN</p>
    </div>
  );
}

function Container45() {
  return (
    <div className="bg-white h-[19.663px] relative shrink-0 w-[42.632px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.335px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.335px] pt-[5.33px] px-[9.326px] relative size-full">
        <Paragraph32 />
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="h-[19.663px] relative shrink-0 w-[208.979px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[3.995px] items-start relative size-full">
        <Container44 />
        <Container45 />
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="flex-[1_0_0] h-[63.996px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.995px] items-start relative size-full">
        <Paragraph30 />
        <Container46 />
      </div>
    </div>
  );
}

function Button11() {
  return (
    <div className="bg-[#48dbfb] h-[110.665px] relative rounded-[10px] shrink-0 w-[331.64px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[3.338px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.996px] items-start pb-[3.338px] pt-[23.335px] px-[23.335px] relative size-full">
        <Container43 />
        <Container47 />
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="content-stretch flex flex-col gap-[15.991px] h-[997.255px] items-start relative shrink-0 w-full" data-name="Container">
      <Button4 />
      <Button5 />
      <Button6 />
      <Button7 />
      <Button8 />
      <Button9 />
      <Button10 />
      <Button11 />
    </div>
  );
}

function Container49() {
  return (
    <div className="absolute content-stretch flex flex-col h-[355.308px] items-start left-0 overflow-clip px-[19.997px] py-0 top-[37.98px] w-[371.633px]" data-name="Container">
      <Container48 />
    </div>
  );
}

function Container50() {
  return (
    <div className="absolute bg-white border-black border-l-[3.338px] border-r-[3.338px] border-solid border-t-[3.338px] h-[418.646px] left-0 rounded-tl-[24px] rounded-tr-[24px] shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] top-[418.66px] w-[378.309px]" data-name="Container">
      <Container7 />
      <Container49 />
    </div>
  );
}

function PlacesPage() {
  return (
    <div className="h-[838px] overflow-clip relative shrink-0 w-[387px]" data-name="PlacesPage">
      <Image />
      <Container50 />
    </div>
  );
}

export default function ImplementDashboardAndOnboarding() {
  return (
    <div className="bg-white relative rounded-[40px] size-full" data-name="Implement Dashboard and Onboarding">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[7.344px] relative rounded-[inherit] size-full">
        <PlacesPage />
      </div>
      <div aria-hidden="true" className="absolute border-[#1a1a2e] border-[7.344px] border-solid inset-0 pointer-events-none rounded-[40px] shadow-[0px_0px_0px_4px_#4ecca3,0px_30px_80px_0px_rgba(78,204,163,0.5),0px_0px_60px_0px_rgba(78,204,163,0.3)]" />
    </div>
  );
}