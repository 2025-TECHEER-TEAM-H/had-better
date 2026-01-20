import svgPaths from "./svg-nlal9gfvdl";
import imgImage from "@/assets/image-placeholder.png";

function Image() {
  return (
    <div className="absolute h-[837.184px] left-0 top-0 w-[378.182px]" data-name="Image">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute h-[837.184px] left-0 top-0 w-[378.182px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 378.182 837.184">
        <g id="Icon">
          <path d={svgPaths.p27d24340} id="Vector" opacity="0.8" stroke="var(--stroke-0, #FB64B6)" strokeDasharray="15 10" strokeWidth="6" />
        </g>
      </svg>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute h-[837.184px] left-0 top-0 w-[378.182px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 378.182 837.184">
        <g id="Icon">
          <path d={svgPaths.p2b90eb80} id="Vector" opacity="0.8" stroke="var(--stroke-0, #FFC107)" strokeDasharray="15 10" strokeWidth="6" />
        </g>
      </svg>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-gradient-to-b border-[3.4px] border-black border-solid from-[#00f2fe] inset-[1.5%_5.97%_92.4%_69.96%] overflow-clip rounded-[16px] shadow-[0px_6px_0px_0px_rgba(0,0,0,0.3)] to-[#4facfe]" data-name="Button">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[18px] left-[19.84px] text-[12px] text-black top-[3.23px]" style={{ fontVariationSettings: "'wght' 400" }}>
        경주취소
      </p>
    </div>
  );
}

function Icon2() {
  return (
    <div className="absolute h-[517px] left-[-0.41px] overflow-clip top-[-0.41px] w-[379px]" data-name="Icon">
      <div className="absolute inset-[25.48%_15.38%_52.22%_21.15%]" data-name="Vector">
        <div className="absolute inset-[-2.28%_-0.65%_-2.49%_-0.37%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 242.976 120.773">
            <path d={svgPaths.p280e4600} id="Vector" opacity="0.7" stroke="var(--stroke-0, #6DF3E3)" strokeDasharray="15 10" strokeWidth="6" />
          </svg>
        </div>
      </div>
      <Button />
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[17.999px] relative shrink-0 w-[10.383px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[18px] left-0 text-[12px] text-white top-[-0.31px]" style={{ fontVariationSettings: "'wght' 400" }}>
          출
        </p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute bg-[#2b7fff] content-stretch flex h-[35.997px] items-center justify-center left-[68px] p-[2.693px] top-[388px] w-[27.992px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[2.693px] border-solid border-white inset-0 pointer-events-none shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" />
      <Paragraph />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[17.999px] relative shrink-0 w-[10.383px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[18px] left-0 text-[12px] text-white top-[-0.31px]" style={{ fontVariationSettings: "'wght' 400" }}>
          도
        </p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute bg-[#fb2c36] content-stretch flex h-[35.997px] items-center justify-center left-[308px] p-[2.693px] top-[167.99px] w-[27.992px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[2.693px] border-solid border-white inset-0 pointer-events-none shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" />
      <Paragraph1 />
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute h-[837.184px] left-0 top-0 w-[378.182px]" data-name="Container">
      <Icon />
      <Icon1 />
      <Icon2 />
      <Container />
      <Container1 />
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="absolute h-[48px] left-0 top-0 w-[32.315px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[48px] left-0 not-italic text-[#0a0a0a] text-[32px] top-[-0.29px] tracking-[0.4063px]">🏃</p>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-0 not-italic text-[6px] text-black top-[-0.65px]">YOU</p>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[11.687px] items-start left-[-2.18px] px-[9.341px] py-[1.346px] rounded-[4px] top-[40.31px] w-[36.681px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" />
      <Paragraph3 />
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute h-[48px] left-[177.92px] top-[305.56px] w-[32.315px]" data-name="Container">
      <Paragraph2 />
      <Container3 />
    </div>
  );
}

function Paragraph4() {
  return (
    <div className="absolute h-[42.004px] left-0 top-0 w-[28.276px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[42px] left-0 not-italic text-[#0a0a0a] text-[28px] top-[0.04px] tracking-[0.3828px]">👻</p>
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-0 not-italic text-[6px] text-black top-[-0.65px]">G1</p>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[11.687px] items-start left-[-1.2px] px-[9.341px] py-[1.346px] rounded-[4px] top-[34.31px] w-[30.685px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" />
      <Paragraph5 />
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute h-[42.004px] left-[169.93px] top-[294.56px] w-[28.276px]" data-name="Container">
      <Paragraph4 />
      <Container5 />
    </div>
  );
}

function Paragraph6() {
  return (
    <div className="absolute h-[42.004px] left-0 top-0 w-[28.276px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[42px] left-0 not-italic text-[#0a0a0a] text-[28px] top-[0.04px] tracking-[0.3828px]">👻</p>
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-0 not-italic text-[6px] text-black top-[-0.65px]">G2</p>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute bg-white content-stretch flex flex-col h-[11.687px] items-start left-[-1.2px] px-[9.341px] py-[1.346px] rounded-[4px] top-[34.31px] w-[30.685px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[4px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" />
      <Paragraph7 />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute h-[42.004px] left-[172.31px] top-[304.55px] w-[28.276px]" data-name="Container">
      <Paragraph6 />
      <Container7 />
    </div>
  );
}

function RouteDetailPage() {
  return (
    <div className="absolute h-[561px] left-0 overflow-clip top-0 w-[379.169px]" data-name="RouteDetailPage">
      <Image />
      <Container2 />
      <Container4 />
      <Container6 />
      <Container8 />
    </div>
  );
}

function Paragraph8() {
  return (
    <div className="h-[12.003px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-[149.71px] text-[10px] text-black text-center top-[-0.33px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        실시간 순위 🏆
      </p>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[10.488px] relative shrink-0 w-[13.055px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[10.5px] left-0 text-[7px] text-black top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
          1위
        </p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-white h-[21.175px] relative shrink-0 w-[39.995px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.346px] pr-[1.357px] py-[1.346px] relative size-full">
        <Paragraph9 />
      </div>
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[23.995px] relative shrink-0 w-[16.158px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#0a0a0a] text-[16px] top-[-0.98px] tracking-[-0.3125px]">🏃</p>
      </div>
    </div>
  );
}

function Container10() {
  return <div className="bg-[#ff6b9d] h-[13.307px] shrink-0 w-full" data-name="Container" />;
}

function Container11() {
  return (
    <div className="bg-white flex-[1_0_0] h-[16px] min-h-px min-w-px relative rounded-[4px]" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-[1.346px] pr-[109.002px] py-[1.346px] relative size-full">
          <Container10 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-[18.009px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-0 not-italic text-[6px] text-black top-[-0.65px] w-[19px]">46%</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex gap-[7.995px] h-[23.995px] items-center relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Paragraph10 />
      <Container11 />
      <Paragraph11 />
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="h-[10.488px] relative shrink-0 w-[13.055px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[10.5px] left-0 text-[7px] text-black top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
          2위
        </p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="bg-white h-[21.175px] relative shrink-0 w-[39.995px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.346px] pr-[1.357px] py-[1.346px] relative size-full">
        <Paragraph12 />
      </div>
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="h-[23.995px] relative shrink-0 w-[16.158px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#0a0a0a] text-[16px] top-[-0.98px] tracking-[-0.3125px]">👻</p>
      </div>
    </div>
  );
}

function Container14() {
  return <div className="bg-[#ffc107] h-[13.307px] shrink-0 w-full" data-name="Container" />;
}

function Container15() {
  return (
    <div className="bg-white flex-[1_0_0] h-[16px] min-h-px min-w-px relative rounded-[4px]" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-[1.346px] pr-[115.608px] py-[1.346px] relative size-full">
          <Container14 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Paragraph14() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-[18.009px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-0 not-italic text-[6px] text-black top-[-0.65px] w-[19px]">42%</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex gap-[7.995px] h-[23.995px] items-center relative shrink-0 w-full" data-name="Container">
      <Container13 />
      <Paragraph13 />
      <Container15 />
      <Paragraph14 />
    </div>
  );
}

function Paragraph15() {
  return (
    <div className="h-[10.488px] relative shrink-0 w-[13.055px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[10.5px] left-0 text-[7px] text-black top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
          3위
        </p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="bg-white h-[21.175px] relative shrink-0 w-[39.995px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.346px] pr-[1.357px] py-[1.346px] relative size-full">
        <Paragraph15 />
      </div>
    </div>
  );
}

function Paragraph16() {
  return (
    <div className="h-[23.995px] relative shrink-0 w-[16.158px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-0 not-italic text-[#0a0a0a] text-[16px] top-[-0.98px] tracking-[-0.3125px]">👻</p>
      </div>
    </div>
  );
}

function Container18() {
  return <div className="bg-[#6df3e3] h-[13.307px] shrink-0 w-full" data-name="Container" />;
}

function Container19() {
  return (
    <div className="bg-white flex-[1_0_0] h-[16px] min-h-px min-w-px relative rounded-[4px]" data-name="Container">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-[1.346px] pr-[117.091px] py-[1.346px] relative size-full">
          <Container18 />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

function Paragraph17() {
  return (
    <div className="h-[8.994px] relative shrink-0 w-[18.009px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-0 not-italic text-[6px] text-black top-[-0.65px] w-[19px]">42%</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex gap-[7.995px] h-[23.995px] items-center relative shrink-0 w-full" data-name="Container">
      <Container17 />
      <Paragraph16 />
      <Container19 />
      <Paragraph17 />
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col gap-[7.995px] h-[87.973px] items-start relative shrink-0 w-full" data-name="Container">
      <Container12 />
      <Container16 />
      <Container20 />
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute bg-[#ffd93d] content-stretch flex flex-col gap-[11.992px] h-[150.7px] items-start left-[20.05px] pb-[3.366px] pt-[19.366px] px-[19.366px] rounded-[12px] top-[177px] w-[339.063px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[3.366px] border-black border-solid inset-0 pointer-events-none rounded-[12px] shadow-[6px_6px_0px_0px_black]" />
      <Paragraph8 />
      <Container21 />
    </div>
  );
}

function Container23() {
  return <div className="absolute bg-[#d1d5dc] h-[5.996px] left-[161.72px] rounded-[22590200px] top-[16px] w-[48px]" data-name="Container" />;
}

function Paragraph18() {
  return (
    <div className="h-[36.008px] relative shrink-0 w-[24.237px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[36px] left-0 not-italic text-[#0a0a0a] text-[24px] top-[-0.63px] tracking-[0.0703px]">🏃</p>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="bg-white relative rounded-[10px] shrink-0 size-[48px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.346px] pr-[1.357px] py-[1.346px] relative size-full">
        <Paragraph18 />
      </div>
    </div>
  );
}

function Paragraph19() {
  return (
    <div className="h-[15.001px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[15px] left-0 text-[10px] text-white top-[-0.98px] w-[104px]" style={{ fontVariationSettings: "'wght' 400" }}>
        내 경로 (경로 3)
      </p>
    </div>
  );
}

function Paragraph20() {
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
    <div className="bg-[#ffd93d] h-[19.692px] relative shrink-0 w-[35.871px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.346px] pt-[5.344px] px-[9.341px] relative size-full">
        <Paragraph20 />
      </div>
    </div>
  );
}

function Paragraph21() {
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
        <Paragraph21 />
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

function Container28() {
  return (
    <div className="flex-[1_0_0] h-[38.69px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.997px] items-start relative size-full">
        <Paragraph19 />
        <Container27 />
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex gap-[11.992px] h-[48px] items-center relative shrink-0 w-full" data-name="Container">
      <Container24 />
      <Container28 />
    </div>
  );
}

function Paragraph22() {
  return (
    <div className="absolute h-[12.003px] left-0 top-0 w-[284.728px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[8px] text-white top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
        이동 경로
      </p>
    </div>
  );
}

function Paragraph23() {
  return (
    <div className="h-[15.001px] relative shrink-0 w-[10.004px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-black top-[-0.98px]">1</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="bg-[#7ed321] relative rounded-[4px] shrink-0 size-[27.992px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.346px] relative size-full">
        <Paragraph23 />
      </div>
    </div>
  );
}

function Paragraph24() {
  return (
    <div className="flex-[1_0_0] h-[12.003px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[7px] text-white top-[-0.98px]" style={{ fontVariationSettings: "'wght' 400" }}>
          공원을 통과하여 도보 이동
        </p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute content-stretch flex gap-[7.995px] h-[27.992px] items-start left-0 top-[20px] w-[284.728px]" data-name="Container">
      <Container30 />
      <Paragraph24 />
    </div>
  );
}

function Paragraph25() {
  return (
    <div className="h-[15.001px] relative shrink-0 w-[10.004px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-black top-[-0.98px]">2</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="bg-[#7ed321] relative rounded-[4px] shrink-0 size-[27.992px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.346px] relative size-full">
        <Paragraph25 />
      </div>
    </div>
  );
}

function Paragraph26() {
  return (
    <div className="flex-[1_0_0] h-[12.003px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[7px] text-white top-[-0.98px]" style={{ fontVariationSettings: "'wght' 400" }}>
          카페 거리 통과 (약 12분)
        </p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="absolute content-stretch flex gap-[7.995px] h-[27.992px] items-start left-0 top-[59.98px] w-[284.728px]" data-name="Container">
      <Container32 />
      <Paragraph26 />
    </div>
  );
}

function Paragraph27() {
  return (
    <div className="h-[15.001px] relative shrink-0 w-[10.004px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-black top-[-0.98px]">3</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="bg-[#7ed321] relative rounded-[4px] shrink-0 size-[27.992px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.346px] relative size-full">
        <Paragraph27 />
      </div>
    </div>
  );
}

function Paragraph28() {
  return (
    <div className="flex-[1_0_0] h-[12.003px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[7px] text-white top-[-0.98px]" style={{ fontVariationSettings: "'wght' 400" }}>
          도착지까지 직진 후 완료
        </p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="absolute content-stretch flex gap-[7.995px] h-[27.992px] items-start left-0 top-[99.97px] w-[284.728px]" data-name="Container">
      <Container34 />
      <Paragraph28 />
    </div>
  );
}

function Container36() {
  return (
    <div className="h-[127.958px] relative shrink-0 w-full" data-name="Container">
      <Paragraph22 />
      <Container31 />
      <Container33 />
      <Container35 />
    </div>
  );
}

function Container37() {
  return (
    <div className="bg-gradient-to-b from-[#ff6b9d] h-[238.684px] relative rounded-[10px] shrink-0 to-[#ff9ac1] w-[331.455px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[3.366px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start pb-[3.366px] pt-[23.364px] px-[23.364px] relative size-full">
        <Container29 />
        <Container36 />
      </div>
    </div>
  );
}

function Paragraph29() {
  return (
    <div className="h-[36.008px] relative shrink-0 w-[24.237px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[36px] left-0 not-italic text-[#0a0a0a] text-[24px] top-[-0.63px] tracking-[0.0703px]">🏃</p>
      </div>
    </div>
  );
}

function Container38() {
  return (
    <div className="bg-white relative rounded-[10px] shrink-0 size-[48px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.346px] pr-[1.357px] py-[1.346px] relative size-full">
        <Paragraph29 />
      </div>
    </div>
  );
}

function Paragraph30() {
  return (
    <div className="h-[15.001px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[15px] left-0 text-[10px] text-white top-[-0.98px] w-[104px]" style={{ fontVariationSettings: "'wght' 400" }}>
        고스트1 경로
      </p>
    </div>
  );
}

function Paragraph31() {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[6px] text-black top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
        20분
      </p>
    </div>
  );
}

function Container39() {
  return (
    <div className="bg-[#ffd93d] h-[19.692px] relative shrink-0 w-[35.871px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.346px] pt-[5.344px] px-[9.341px] relative size-full">
        <Paragraph31 />
      </div>
    </div>
  );
}

function Paragraph32() {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-0 not-italic text-[6px] text-black top-[-0.65px]">3.1KM</p>
    </div>
  );
}

function Container40() {
  return (
    <div className="bg-white h-[19.692px] relative shrink-0 w-[48.684px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.346px] pt-[5.344px] px-[9.341px] relative size-full">
        <Paragraph32 />
      </div>
    </div>
  );
}

function Container41() {
  return (
    <div className="content-stretch flex gap-[3.997px] h-[19.692px] items-start relative shrink-0 w-full" data-name="Container">
      <Container39 />
      <Container40 />
    </div>
  );
}

function Container42() {
  return (
    <div className="flex-[1_0_0] h-[38.69px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.997px] items-start relative size-full">
        <Paragraph30 />
        <Container41 />
      </div>
    </div>
  );
}

function Container43() {
  return (
    <div className="content-stretch flex gap-[11.992px] h-[48px] items-center relative shrink-0 w-full" data-name="Container">
      <Container38 />
      <Container42 />
    </div>
  );
}

function Paragraph33() {
  return (
    <div className="absolute h-[12.003px] left-0 top-0 w-[284.728px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[8px] text-white top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
        이동 경로
      </p>
    </div>
  );
}

function Paragraph34() {
  return (
    <div className="h-[15.001px] relative shrink-0 w-[10.004px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-black top-[-0.98px]">1</p>
      </div>
    </div>
  );
}

function Container44() {
  return (
    <div className="bg-[#7ed321] relative rounded-[4px] shrink-0 size-[27.992px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.346px] relative size-full">
        <Paragraph34 />
      </div>
    </div>
  );
}

function Paragraph35() {
  return (
    <div className="flex-[1_0_0] h-[12.003px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[7px] text-white top-[-0.98px]" style={{ fontVariationSettings: "'wght' 400" }}>
          공원을 통과하여 도보 이동
        </p>
      </div>
    </div>
  );
}

function Container45() {
  return (
    <div className="absolute content-stretch flex gap-[7.995px] h-[27.992px] items-start left-0 top-[20px] w-[284.728px]" data-name="Container">
      <Container44 />
      <Paragraph35 />
    </div>
  );
}

function Paragraph36() {
  return (
    <div className="h-[15.001px] relative shrink-0 w-[10.004px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-black top-[-0.98px]">2</p>
      </div>
    </div>
  );
}

function Container46() {
  return (
    <div className="bg-[#7ed321] relative rounded-[4px] shrink-0 size-[27.992px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.346px] relative size-full">
        <Paragraph36 />
      </div>
    </div>
  );
}

function Paragraph37() {
  return (
    <div className="flex-[1_0_0] h-[12.003px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[7px] text-white top-[-0.98px]" style={{ fontVariationSettings: "'wght' 400" }}>
          카페 거리 통과 (약 12분)
        </p>
      </div>
    </div>
  );
}

function Container47() {
  return (
    <div className="absolute content-stretch flex gap-[7.995px] h-[27.992px] items-start left-0 top-[59.98px] w-[284.728px]" data-name="Container">
      <Container46 />
      <Paragraph37 />
    </div>
  );
}

function Paragraph38() {
  return (
    <div className="h-[15.001px] relative shrink-0 w-[10.004px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-black top-[-0.98px]">3</p>
      </div>
    </div>
  );
}

function Container48() {
  return (
    <div className="bg-[#7ed321] relative rounded-[4px] shrink-0 size-[27.992px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.346px] relative size-full">
        <Paragraph38 />
      </div>
    </div>
  );
}

function Paragraph39() {
  return (
    <div className="flex-[1_0_0] h-[12.003px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[7px] text-white top-[-0.98px]" style={{ fontVariationSettings: "'wght' 400" }}>
          도착지까지 직진 후 완료
        </p>
      </div>
    </div>
  );
}

function Container49() {
  return (
    <div className="absolute content-stretch flex gap-[7.995px] h-[27.992px] items-start left-0 top-[99.97px] w-[284.728px]" data-name="Container">
      <Container48 />
      <Paragraph39 />
    </div>
  );
}

function Container50() {
  return (
    <div className="h-[127.958px] relative shrink-0 w-full" data-name="Container">
      <Paragraph33 />
      <Container45 />
      <Container47 />
      <Container49 />
    </div>
  );
}

function Container51() {
  return (
    <div className="bg-gradient-to-b from-[#ffc107] h-[238.684px] relative rounded-[10px] shrink-0 to-[#ffd93d] w-[331.455px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[3.366px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start pb-[3.366px] pt-[23.364px] px-[23.364px] relative size-full">
        <Container43 />
        <Container50 />
      </div>
    </div>
  );
}

function Paragraph40() {
  return (
    <div className="h-[36.008px] relative shrink-0 w-[24.237px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[36px] left-0 not-italic text-[#0a0a0a] text-[24px] top-[-0.63px] tracking-[0.0703px]">🏃</p>
      </div>
    </div>
  );
}

function Container52() {
  return (
    <div className="bg-white relative rounded-[10px] shrink-0 size-[48px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.346px] pr-[1.357px] py-[1.346px] relative size-full">
        <Paragraph40 />
      </div>
    </div>
  );
}

function Paragraph41() {
  return (
    <div className="h-[15.001px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[15px] left-0 text-[10px] text-white top-[-0.98px] w-[104px]" style={{ fontVariationSettings: "'wght' 400" }}>
        고스트2 경로
      </p>
    </div>
  );
}

function Paragraph42() {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[6px] text-black top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
        20분
      </p>
    </div>
  );
}

function Container53() {
  return (
    <div className="bg-[#ffd93d] h-[19.692px] relative shrink-0 w-[35.871px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.346px] pt-[5.344px] px-[9.341px] relative size-full">
        <Paragraph42 />
      </div>
    </div>
  );
}

function Paragraph43() {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[9px] left-0 not-italic text-[6px] text-black top-[-0.65px]">3.1KM</p>
    </div>
  );
}

function Container54() {
  return (
    <div className="bg-white h-[19.692px] relative shrink-0 w-[48.684px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pb-[1.346px] pt-[5.344px] px-[9.341px] relative size-full">
        <Paragraph43 />
      </div>
    </div>
  );
}

function Container55() {
  return (
    <div className="content-stretch flex gap-[3.997px] h-[19.692px] items-start relative shrink-0 w-full" data-name="Container">
      <Container53 />
      <Container54 />
    </div>
  );
}

function Container56() {
  return (
    <div className="flex-[1_0_0] h-[38.69px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.997px] items-start relative size-full">
        <Paragraph41 />
        <Container55 />
      </div>
    </div>
  );
}

function Container57() {
  return (
    <div className="content-stretch flex gap-[11.992px] h-[48px] items-center relative shrink-0 w-full" data-name="Container">
      <Container52 />
      <Container56 />
    </div>
  );
}

function Paragraph44() {
  return (
    <div className="absolute h-[12.003px] left-0 top-0 w-[284.728px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[8px] text-white top-[-0.65px]" style={{ fontVariationSettings: "'wght' 400" }}>
        이동 경로
      </p>
    </div>
  );
}

function Paragraph45() {
  return (
    <div className="h-[15.001px] relative shrink-0 w-[10.004px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-black top-[-0.98px]">1</p>
      </div>
    </div>
  );
}

function Container58() {
  return (
    <div className="bg-[#7ed321] relative rounded-[4px] shrink-0 size-[27.992px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.346px] relative size-full">
        <Paragraph45 />
      </div>
    </div>
  );
}

function Paragraph46() {
  return (
    <div className="flex-[1_0_0] h-[12.003px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[7px] text-white top-[-0.98px]" style={{ fontVariationSettings: "'wght' 400" }}>
          공원을 통과하여 도보 이동
        </p>
      </div>
    </div>
  );
}

function Container59() {
  return (
    <div className="absolute content-stretch flex gap-[7.995px] h-[27.992px] items-start left-0 top-[20px] w-[284.728px]" data-name="Container">
      <Container58 />
      <Paragraph46 />
    </div>
  );
}

function Paragraph47() {
  return (
    <div className="h-[15.001px] relative shrink-0 w-[10.004px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-black top-[-0.98px]">2</p>
      </div>
    </div>
  );
}

function Container60() {
  return (
    <div className="bg-[#7ed321] relative rounded-[4px] shrink-0 size-[27.992px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.346px] relative size-full">
        <Paragraph47 />
      </div>
    </div>
  );
}

function Paragraph48() {
  return (
    <div className="flex-[1_0_0] h-[12.003px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[7px] text-white top-[-0.98px]" style={{ fontVariationSettings: "'wght' 400" }}>
          카페 거리 통과 (약 12분)
        </p>
      </div>
    </div>
  );
}

function Container61() {
  return (
    <div className="absolute content-stretch flex gap-[7.995px] h-[27.992px] items-start left-0 top-[59.98px] w-[284.728px]" data-name="Container">
      <Container60 />
      <Paragraph48 />
    </div>
  );
}

function Paragraph49() {
  return (
    <div className="h-[15.001px] relative shrink-0 w-[10.004px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[15px] left-0 not-italic text-[10px] text-black top-[-0.98px]">3</p>
      </div>
    </div>
  );
}

function Container62() {
  return (
    <div className="bg-[#7ed321] relative rounded-[4px] shrink-0 size-[27.992px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[1.346px] relative size-full">
        <Paragraph49 />
      </div>
    </div>
  );
}

function Paragraph50() {
  return (
    <div className="flex-[1_0_0] h-[12.003px] min-h-px min-w-px relative" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[12px] left-0 text-[7px] text-white top-[-0.98px]" style={{ fontVariationSettings: "'wght' 400" }}>
          도착지까지 직진 후 완료
        </p>
      </div>
    </div>
  );
}

function Container63() {
  return (
    <div className="absolute content-stretch flex gap-[7.995px] h-[27.992px] items-start left-0 top-[99.97px] w-[284.728px]" data-name="Container">
      <Container62 />
      <Paragraph50 />
    </div>
  );
}

function Container64() {
  return (
    <div className="h-[127.958px] relative shrink-0 w-full" data-name="Container">
      <Paragraph44 />
      <Container59 />
      <Container61 />
      <Container63 />
    </div>
  );
}

function Container65() {
  return (
    <div className="bg-[#6df3e3] h-[238.684px] relative rounded-[10px] shrink-0 w-[331.455px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[3.366px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start pb-[3.366px] pt-[23.364px] px-[23.364px] relative size-full">
        <Container57 />
        <Container64 />
      </div>
    </div>
  );
}

function Container66() {
  return (
    <div className="h-[1838px] relative shrink-0 w-[332px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[16px] items-start relative size-full">
        <Container51 />
        <Container65 />
      </div>
    </div>
  );
}

function Container67() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] h-[1112px] items-start relative shrink-0 w-full" data-name="Container">
      <Container37 />
      <Container66 />
    </div>
  );
}

function Container68() {
  return (
    <div className="absolute content-stretch flex flex-col h-[797px] items-start left-[-0.37px] overflow-clip px-[19.997px] py-0 top-[37.63px] w-[372px]" data-name="Container">
      <Container67 />
    </div>
  );
}

function Container69() {
  return (
    <div className="absolute bg-white border-black border-l-[3.366px] border-r-[3.366px] border-solid border-t-[3.366px] h-[838px] left-[8.02px] rounded-tl-[24px] rounded-tr-[24px] shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] top-[345px] w-[378.979px]" data-name="Container">
      <Container23 />
      <Container68 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[8.02px] top-[177px]">
      <Container22 />
      <Container69 />
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-0 top-0">
      <RouteDetailPage />
      <Group />
    </div>
  );
}

export default function Group2() {
  return (
    <div className="relative size-full">
      <Group1 />
    </div>
  );
}