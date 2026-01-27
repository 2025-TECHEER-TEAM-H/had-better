import characterGreenFront from "@/assets/character-green-front.png";

function Container() {
  return (
    <div className="bg-gradient-to-b from-[#48d448] relative rounded-[22590200px] shrink-0 size-[80px] to-[#3db83d] overflow-hidden" data-name="Container">
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[22590200px]" />
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

function Heading() {
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

function Container1() {
  return <div className="bg-[#48d448] h-[5.302px] shrink-0 w-full" data-name="Container" />;
}

function Container2() {
  return (
    <div className="bg-[#e5e7eb] h-[7.995px] relative rounded-[22590200px] shrink-0 w-full" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pl-[1.346px] pr-[49.883px] py-[1.346px] relative size-full">
          <Container1 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[22590200px]" />
    </div>
  );
}

function Container3() {
  return (
    <div className="flex-[1_0_0] h-[75.976px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.997px] items-start relative size-full pt-[4px] pb-[4px]">
        <Heading />
        <Paragraph />
        <Container2 />
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex gap-[16px] h-[80px] items-center relative shrink-0 w-full" data-name="Container">
      <Container />
      <Container3 />
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-white content-stretch flex flex-col h-[133.375px] items-start pb-[16px] pt-[40px] px-[26.688px] relative rounded-[16px] shrink-0 w-[346.182px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)]" />
      <Container4 />
    </div>
  );
}

function Container6() {
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
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-[35.25px] not-italic text-[#6b9080] text-[12px] text-center top-[0.67px] translate-x-[-50%] whitespace-nowrap">총 게임</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[3.997px] h-[125.38px] items-start left-0 pb-[2.693px] pt-[18.693px] px-[18.693px] rounded-[14px] top-0 w-[107.392px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]" />
      <Container6 />
      <Paragraph1 />
      <Paragraph2 />
    </div>
  );
}

function Container8() {
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

function Container9() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[3.997px] h-[125.38px] items-start left-[119.38px] pb-[2.693px] pt-[18.693px] px-[18.693px] rounded-[14px] top-0 w-[107.403px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]" />
      <Container8 />
      <Paragraph3 />
      <Paragraph4 />
    </div>
  );
}

function Container10() {
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

function Container11() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col gap-[3.997px] h-[125.38px] items-start left-[238.78px] pb-[2.693px] pt-[18.693px] px-[18.693px] rounded-[14px] top-0 w-[107.403px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]" />
      <Container10 />
      <Paragraph5 />
      <Paragraph6 />
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[125.38px] relative shrink-0 w-[346.182px]" data-name="Container">
      <Container7 />
      <Container9 />
      <Container11 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="h-[19.997px] relative shrink-0 w-full" data-name="Heading 3">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[20px] left-0 text-[#2d5f3f] text-[14px] top-[-0.31px]" style={{ fontVariationSettings: "'wght' 400" }}>
        최근 게임
      </p>
    </div>
  );
}

function Container13() {
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
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6b9080] text-[12px] top-[0.67px] whitespace-nowrap">15분 23초</p>
    </div>
  );
}

function Container14() {
  return (
    <div className="flex-[1_0_0] h-[35.997px] min-h-px min-w-px relative" data-name="Container">
      <Paragraph7 />
      <Paragraph8 />
    </div>
  );
}

function Container15() {
  return (
    <div className="h-[35.997px] relative shrink-0 w-[88.11px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.992px] items-center relative size-full">
        <Container13 />
        <Container14 />
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="h-[19.997px] relative shrink-0 w-[44.413px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#48d448] text-[14px] top-[0.35px] tracking-[-0.1504px] w-[45px]">+100P</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="bg-[#f9fafb] h-[62.674px] relative rounded-[14px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[1.346px] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[13.338px] py-[1.346px] relative size-full">
          <Container15 />
          <Container16 />
        </div>
      </div>
    </div>
  );
}

function Container18() {
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
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6b9080] text-[12px] top-[0.67px] whitespace-nowrap">12분 45초</p>
    </div>
  );
}

function Container19() {
  return (
    <div className="flex-[1_0_0] h-[35.997px] min-h-px min-w-px relative" data-name="Container">
      <Paragraph9 />
      <Paragraph10 />
    </div>
  );
}

function Container20() {
  return (
    <div className="h-[35.997px] relative shrink-0 w-[88.31px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.992px] items-center relative size-full">
        <Container18 />
        <Container19 />
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="h-[19.997px] relative shrink-0 w-[44.413px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#48d448] text-[14px] top-[0.35px] tracking-[-0.1504px] w-[45px]">+100P</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="bg-[#f9fafb] h-[62.674px] relative rounded-[14px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[1.346px] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[13.338px] py-[1.346px] relative size-full">
          <Container20 />
          <Container21 />
        </div>
      </div>
    </div>
  );
}

function Container23() {
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
      <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#6b9080] text-[12px] top-[0.67px] whitespace-nowrap">18분 12초</p>
    </div>
  );
}

function Container24() {
  return (
    <div className="h-[35.997px] relative shrink-0 w-[50.167px]" data-name="Container">
      <Paragraph11 />
      <Paragraph12 />
    </div>
  );
}

function Container25() {
  return (
    <div className="h-[35.997px] relative shrink-0 w-[86.396px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.992px] items-center relative size-full">
        <Container23 />
        <Container24 />
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="h-[19.997px] relative shrink-0 w-[37.112px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-4hzbpn font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#ff9a6c] text-[14px] top-[0.35px] tracking-[-0.1504px] w-[38px]">+50P</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="bg-[#f9fafb] h-[62.674px] relative rounded-[14px] shrink-0 w-full" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#e5e7eb] border-[1.346px] border-solid inset-0 pointer-events-none rounded-[14px]" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[13.338px] py-[1.346px] relative size-full">
          <Container25 />
          <Container26 />
        </div>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col gap-[11.992px] h-[233px] items-start relative shrink-0 w-full" data-name="Container">
      <Container17 />
      <Container22 />
      <Container27 />
    </div>
  );
}

function Container29() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[16px] h-[306px] items-start pb-[2.693px] pt-[26.688px] px-[26.688px] relative rounded-[16px] shrink-0 w-[346px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)]" />
      <Heading1 />
      <Container28 />
    </div>
  );
}

export { Container5, Container12, Container29 };

export default function Container30() {
  return (
    <div className="content-stretch flex flex-col gap-[23.995px] items-start pb-0 pt-[23.995px] px-[16px] relative size-full" data-name="Container">
      <Container5 />
      <Container12 />
      <Container29 />
    </div>
  );
}