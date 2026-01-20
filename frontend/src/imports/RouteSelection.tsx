import imgImage from "@/assets/image-placeholder.png";

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
    <div className="absolute bg-white content-stretch flex items-center justify-center left-[314.59px] pl-[2.693px] pr-[2.704px] py-[2.693px] rounded-[14px] size-[39.995px] top-[19.59px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]" />
      <Text />
    </div>
  );
}

function Image() {
  return (
    <div className="absolute h-[837.184px] left-0 overflow-clip top-0 w-[378.182px]" data-name="Image">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
      <Button />
    </div>
  );
}

function Container() {
  return <div className="absolute bg-[#d1d5dc] h-[5.996px] left-[161.72px] rounded-[22590200px] top-[16px] w-[48px]" data-name="Container" />;
}

function Paragraph() {
  return (
    <div className="h-[15.001px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[15px] left-[147.33px] text-[10px] text-black text-center top-[-0.98px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        각 플레이어의 경로를 선택하세요
      </p>
    </div>
  );
}

function Container1() {
  return (
    <div className="bg-[rgba(0,217,255,0.2)] h-[53.733px] relative rounded-[10px] shrink-0 w-[331.455px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[3.366px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[3.366px] pt-[19.366px] px-[19.366px] relative size-full">
        <Paragraph />
      </div>
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[36.008px] relative shrink-0 w-[24.237px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[36px] left-0 not-italic text-[#0a0a0a] text-[24px] top-[-0.63px] tracking-[0.0703px]">1️⃣</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="bg-white relative shrink-0 size-[48px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.346px] pr-[1.357px] py-[1.346px] relative size-full">
        <Paragraph1 />
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="bg-[#fb64b6] h-[1.999px] relative shrink-0 w-[11.992px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.673px] border-black border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[15.001px] relative shrink-0 w-[37.291px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[15px] left-0 text-[10px] text-white top-[-0.98px]" style={{ fontVariationSettings: "'wght' 400" }}>
          경로 1
        </p>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="content-stretch flex gap-[7.995px] h-[15.001px] items-center relative shrink-0 w-full" data-name="Container">
      <Container3 />
      <Paragraph2 />
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[6px] text-black top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
        15분
      </p>
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-[#ffd93d] h-[19.692px] relative shrink-0 w-[35.871px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.346px] pt-[5.344px] px-[9.341px] relative size-full">
        <Paragraph3 />
      </div>
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-0 not-italic text-[6px] text-black top-[-0.65px]">2.3KM</p>
    </div>
  );
}

function Container6() {
  return (
    <div className="bg-white h-[19.692px] relative shrink-0 w-[48.684px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.346px] pt-[5.344px] px-[9.341px] relative size-full">
        <Paragraph4 />
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex gap-[3.997px] h-[19.692px] items-start relative shrink-0 w-full" data-name="Container">
      <Container5 />
      <Container6 />
    </div>
  );
}

function Checkbox() {
  return <div className="shrink-0 size-[11.992px]" data-name="Checkbox" />;
}

function Text1() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-[10.383px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[6px] text-white top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
          유저
        </p>
      </div>
    </div>
  );
}

function Label() {
  return (
    <div className="absolute content-stretch flex gap-[3.997px] h-[11.992px] items-center left-0 top-0 w-[26.372px]" data-name="Label">
      <Checkbox />
      <Text1 />
    </div>
  );
}

function Checkbox1() {
  return <div className="shrink-0 size-[11.992px]" data-name="Checkbox" />;
}

function Text2() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-[21.575px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[6px] text-white top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
          고스트1
        </p>
      </div>
    </div>
  );
}

function Label1() {
  return (
    <div className="absolute content-stretch flex gap-[3.997px] h-[11.992px] items-center left-[34.37px] top-0 w-[37.565px]" data-name="Label">
      <Checkbox1 />
      <Text2 />
    </div>
  );
}

function Checkbox2() {
  return <div className="shrink-0 size-[11.992px]" data-name="Checkbox" />;
}

function Text3() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-[21.575px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[6px] text-white top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
          고스트2
        </p>
      </div>
    </div>
  );
}

function Label2() {
  return (
    <div className="absolute content-stretch flex gap-[3.997px] h-[11.992px] items-center left-[79.93px] top-0 w-[37.565px]" data-name="Label">
      <Checkbox2 />
      <Text3 />
    </div>
  );
}

function Container8() {
  return (
    <div className="h-[11.992px] relative shrink-0 w-full" data-name="Container">
      <Label />
      <Label1 />
      <Label2 />
    </div>
  );
}

function Container9() {
  return (
    <div className="flex-[1_0_0] h-[62.674px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[7.995px] items-start relative size-full">
        <Container4 />
        <Container7 />
        <Container8 />
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex gap-[11.992px] h-[62.674px] items-start relative shrink-0 w-full" data-name="Container">
      <Container2 />
      <Container9 />
    </div>
  );
}

function Container11() {
  return (
    <div className="bg-[#ff6b9d] h-[101.407px] relative rounded-[10px] shrink-0 w-[331.455px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[3.366px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[3.366px] pt-[19.366px] px-[19.366px] relative size-full">
        <Container10 />
      </div>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[36.008px] relative shrink-0 w-[24.237px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[36px] left-0 not-italic text-[#0a0a0a] text-[24px] top-[-0.63px] tracking-[0.0703px]">2️⃣</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="bg-white relative shrink-0 size-[48px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.346px] pr-[1.357px] py-[1.346px] relative size-full">
        <Paragraph5 />
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="bg-[#ffc107] h-[1.999px] relative shrink-0 w-[11.992px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.673px] border-black border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="h-[15.001px] relative shrink-0 w-[37.291px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[15px] left-0 text-[10px] text-black top-[-0.98px]" style={{ fontVariationSettings: "'wght' 400" }}>
          경로 2
        </p>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex gap-[7.995px] h-[15.001px] items-center relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Paragraph6 />
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[6px] text-black top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
        18분
      </p>
    </div>
  );
}

function Container15() {
  return (
    <div className="bg-white h-[19.692px] relative shrink-0 w-[35.871px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.346px] pt-[5.344px] px-[9.341px] relative size-full">
        <Paragraph7 />
      </div>
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-0 not-italic text-[6px] text-black top-[-0.65px]">2.8KM</p>
    </div>
  );
}

function Container16() {
  return (
    <div className="bg-white h-[19.692px] relative shrink-0 w-[48.684px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.346px] pt-[5.344px] px-[9.341px] relative size-full">
        <Paragraph8 />
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex gap-[3.997px] h-[19.692px] items-start relative shrink-0 w-full" data-name="Container">
      <Container15 />
      <Container16 />
    </div>
  );
}

function Checkbox3() {
  return <div className="shrink-0 size-[11.992px]" data-name="Checkbox" />;
}

function Text4() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-[10.383px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[6px] text-black top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
          유저
        </p>
      </div>
    </div>
  );
}

function Label3() {
  return (
    <div className="absolute content-stretch flex gap-[3.997px] h-[11.992px] items-center left-0 top-0 w-[26.372px]" data-name="Label">
      <Checkbox3 />
      <Text4 />
    </div>
  );
}

function Checkbox4() {
  return <div className="shrink-0 size-[11.992px]" data-name="Checkbox" />;
}

function Text5() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-[21.575px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[6px] text-black top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
          고스트1
        </p>
      </div>
    </div>
  );
}

function Label4() {
  return (
    <div className="absolute content-stretch flex gap-[3.997px] h-[11.992px] items-center left-[34.37px] top-0 w-[37.565px]" data-name="Label">
      <Checkbox4 />
      <Text5 />
    </div>
  );
}

function Checkbox5() {
  return <div className="shrink-0 size-[11.992px]" data-name="Checkbox" />;
}

function Text6() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-[21.575px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[6px] text-black top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
          고스트2
        </p>
      </div>
    </div>
  );
}

function Label5() {
  return (
    <div className="absolute content-stretch flex gap-[3.997px] h-[11.992px] items-center left-[79.93px] top-0 w-[37.565px]" data-name="Label">
      <Checkbox5 />
      <Text6 />
    </div>
  );
}

function Container18() {
  return (
    <div className="h-[11.992px] relative shrink-0 w-full" data-name="Container">
      <Label3 />
      <Label4 />
      <Label5 />
    </div>
  );
}

function Container19() {
  return (
    <div className="flex-[1_0_0] h-[62.674px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[7.995px] items-start relative size-full">
        <Container14 />
        <Container17 />
        <Container18 />
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex gap-[11.992px] h-[62.674px] items-start relative shrink-0 w-full" data-name="Container">
      <Container12 />
      <Container19 />
    </div>
  );
}

function Container21() {
  return (
    <div className="bg-[#ffc107] h-[101.407px] relative rounded-[10px] shrink-0 w-[331.455px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[3.366px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[3.366px] pt-[19.366px] px-[19.366px] relative size-full">
        <Container20 />
      </div>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[36.008px] relative shrink-0 w-[24.237px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular','Noto_Sans:Regular',sans-serif] font-normal leading-[36px] left-0 not-italic text-[#0a0a0a] text-[24px] top-[-0.63px] tracking-[0.0703px]">3️⃣</p>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="bg-white relative shrink-0 size-[48px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.346px] pr-[1.357px] py-[1.346px] relative size-full">
        <Paragraph9 />
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="bg-[#6df3e3] h-[1.999px] relative shrink-0 w-[11.992px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.673px] border-black border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[15.001px] relative shrink-0 w-[37.291px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[15px] left-0 text-[10px] text-black top-[-0.98px]" style={{ fontVariationSettings: "'wght' 400" }}>
          경로 3
        </p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex gap-[7.995px] h-[15.001px] items-center relative shrink-0 w-full" data-name="Container">
      <Container23 />
      <Paragraph10 />
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[6px] text-black top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
        20분
      </p>
    </div>
  );
}

function Container25() {
  return (
    <div className="bg-white h-[19.692px] relative shrink-0 w-[35.871px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.346px] pt-[5.344px] px-[9.341px] relative size-full">
        <Paragraph11 />
      </div>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-0 not-italic text-[6px] text-black top-[-0.65px]">3.1KM</p>
    </div>
  );
}

function Container26() {
  return (
    <div className="bg-white h-[19.692px] relative shrink-0 w-[48.684px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.346px] pt-[5.344px] px-[9.341px] relative size-full">
        <Paragraph12 />
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex gap-[3.997px] h-[19.692px] items-start relative shrink-0 w-full" data-name="Container">
      <Container25 />
      <Container26 />
    </div>
  );
}

function Checkbox6() {
  return <div className="shrink-0 size-[11.992px]" data-name="Checkbox" />;
}

function Text7() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-[10.383px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[6px] text-black top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
          유저
        </p>
      </div>
    </div>
  );
}

function Label6() {
  return (
    <div className="absolute content-stretch flex gap-[3.997px] h-[11.992px] items-center left-0 top-0 w-[26.372px]" data-name="Label">
      <Checkbox6 />
      <Text7 />
    </div>
  );
}

function Checkbox7() {
  return <div className="shrink-0 size-[11.992px]" data-name="Checkbox" />;
}

function Text8() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-[21.575px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[6px] text-black top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
          고스트1
        </p>
      </div>
    </div>
  );
}

function Label7() {
  return (
    <div className="absolute content-stretch flex gap-[3.997px] h-[11.992px] items-center left-[34.37px] top-0 w-[37.565px]" data-name="Label">
      <Checkbox7 />
      <Text8 />
    </div>
  );
}

function Checkbox8() {
  return <div className="shrink-0 size-[11.992px]" data-name="Checkbox" />;
}

function Text9() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-[21.575px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[6px] text-black top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
          고스트2
        </p>
      </div>
    </div>
  );
}

function Label8() {
  return (
    <div className="absolute content-stretch flex gap-[3.997px] h-[11.992px] items-center left-[79.93px] top-0 w-[37.565px]" data-name="Label">
      <Checkbox8 />
      <Text9 />
    </div>
  );
}

function Container28() {
  return (
    <div className="h-[11.992px] relative shrink-0 w-full" data-name="Container">
      <Label6 />
      <Label7 />
      <Label8 />
    </div>
  );
}

function Container29() {
  return (
    <div className="flex-[1_0_0] h-[62.674px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[7.995px] items-start relative size-full">
        <Container24 />
        <Container27 />
        <Container28 />
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex gap-[11.992px] h-[62.674px] items-start relative shrink-0 w-full" data-name="Container">
      <Container22 />
      <Container29 />
    </div>
  );
}

function Container31() {
  return (
    <div className="bg-[#6df3e3] h-[101.407px] relative rounded-[10px] shrink-0 w-[331.455px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[3.366px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[3.366px] pt-[19.366px] px-[19.366px] relative size-full">
        <Container30 />
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[493.947px] items-start relative shrink-0 w-full" data-name="Container">
      <Container1 />
      <Container11 />
      <Container21 />
      <Container31 />
    </div>
  );
}

function Container33() {
  return (
    <div className="absolute content-stretch flex flex-col h-[436px] items-start left-[0.63px] overflow-clip px-[19.997px] py-0 top-[21.63px] w-[371px]" data-name="Container">
      <Container32 />
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[#99a1af] border-[3.366px] border-black border-solid h-[79px] left-[21.23px] rounded-[10px] top-[409.35px] w-[333px]" data-name="Button">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[21px] left-[162.74px] text-[#4a5565] text-[14px] text-center top-[13.49px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        이동 시작! 🏁
      </p>
    </div>
  );
}

function Container34() {
  return (
    <div className="absolute bg-white border-black border-l-[3.366px] border-r-[3.366px] border-solid border-t-[3.366px] h-[503px] left-[-0.41px] rounded-tl-[24px] rounded-tr-[24px] shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] top-[334.59px] w-[379px]" data-name="Container">
      <Container />
      <Container33 />
      <Button1 />
    </div>
  );
}

function RouteSelectionPage() {
  return (
    <div className="h-[837.184px] overflow-clip relative shrink-0 w-full" data-name="RouteSelectionPage">
      <Image />
      <Container34 />
    </div>
  );
}

export default function RouteSelection() {
  return (
    <div className="bg-white relative rounded-[40px] size-full" data-name="route-selection">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[7.406px] relative rounded-[inherit] size-full">
        <RouteSelectionPage />
      </div>
      <div aria-hidden="true" className="absolute border-[#1a1a2e] border-[7.406px] border-solid inset-0 pointer-events-none rounded-[40px] shadow-[0px_0px_0px_4px_#4ecca3,0px_30px_80px_0px_rgba(78,204,163,0.5),0px_0px_60px_0px_rgba(78,204,163,0.3)]" />
    </div>
  );
}