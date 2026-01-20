import svgPaths from "./svg-ssz04r2x38";
import imgImage from "@/assets/image-placeholder.png";

function Image() {
  return (
    <div className="absolute h-[837.184px] left-0 top-0 w-[378.182px]" data-name="Image">
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgImage} />
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
    <div className="absolute bg-white content-stretch flex inset-[2.34%_7.03%_92.88%_82.39%] items-center justify-center pl-[2.693px] pr-[2.704px] py-[2.693px] rounded-[14px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]" />
      <Text />
    </div>
  );
}

function Icon() {
  return (
    <div className="h-[938px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[27.47%_22%_43.86%_37.02%]" data-name="Vector">
        <div className="absolute inset-[-0.93%_-1.61%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 160.336 273.903">
            <path d={svgPaths.p159e6a20} id="Vector" opacity="0.7" stroke="var(--stroke-0, #2B7FFF)" strokeDasharray="15 10" strokeLinecap="round" strokeWidth="5" />
          </svg>
        </div>
      </div>
      <Button />
    </div>
  );
}

function Container() {
  return (
    <div className="absolute content-stretch flex flex-col h-[827px] items-start left-[-0.41px] top-[-0.41px] w-[379px]" data-name="Container">
      <Icon />
    </div>
  );
}

function Paragraph() {
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
    <div className="absolute bg-[#fb2c36] content-stretch flex h-[35.997px] items-center justify-center left-0 p-[2.693px] top-0 w-[27.992px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[2.693px] border-solid border-white inset-0 pointer-events-none shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)]" />
      <Paragraph />
    </div>
  );
}

function Container2() {
  return <div className="absolute bg-[#fb2c36] left-[-12.52px] opacity-3 rounded-[22590200px] size-[53.027px] top-[-12.52px]" data-name="Container" />;
}

function Container3() {
  return (
    <div className="absolute h-[35.997px] left-[57.59px] top-[102.59px] w-[27.992px]" data-name="Container">
      <Container1 />
      <Container2 />
    </div>
  );
}

function Container4() {
  return <div className="bg-white rounded-[22590200px] shrink-0 size-[7.995px]" data-name="Container" />;
}

function Container5() {
  return (
    <div className="absolute bg-[#2b7fff] content-stretch flex items-center justify-center left-0 pl-[2.693px] pr-[2.704px] py-[2.693px] rounded-[22590200px] size-[23.995px] top-0" data-name="Container">
      <div aria-hidden="true" className="absolute border-[2.693px] border-solid border-white inset-0 pointer-events-none rounded-[22590200px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]" />
      <Container4 />
    </div>
  );
}

function Container6() {
  return <div className="absolute bg-[#2b7fff] left-[-11.65px] opacity-1 rounded-[22590200px] size-[47.286px] top-[-11.65px]" data-name="Container" />;
}

function Container7() {
  return (
    <div className="absolute left-[274.19px] size-[23.995px] top-[533.2px]" data-name="Container">
      <Container5 />
      <Container6 />
    </div>
  );
}

function Container8() {
  return <div className="absolute bg-[#d1d5dc] h-[5.996px] left-[161.72px] rounded-[22590200px] top-[16px] w-[48px]" data-name="Container" />;
}

function Paragraph1() {
  return (
    <div className="h-[71.995px] relative shrink-0 w-[47.8px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[72px] left-0 not-italic text-[#0a0a0a] text-[48px] top-[0.41px] tracking-[0.3516px]">☕</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-white relative rounded-[10px] shrink-0 size-[80px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[2.693px] pr-[2.704px] py-[2.693px] relative size-full">
        <Paragraph1 />
      </div>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[17.999px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[18px] left-0 text-[12px] text-black top-[-0.31px]">스타벅스 강남점</p>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex font-medium gap-[7.995px] h-[14px] items-start leading-[12px] relative shrink-0 text-[#99a1af] text-[10px] w-full" data-name="Container">
      <p className="css-4hzbpn font-['Wittgenstein:Medium',sans-serif] h-[14px] relative shrink-0 w-[28px]">20km</p>
      <p className="css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] h-[14px] relative shrink-0 w-[155px]">서울특별시 서초구 방배동 1022-3</p>
    </div>
  );
}

function Container11() {
  return (
    <div className="h-[48px] relative shrink-0 w-[170px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[7.995px] items-start relative size-full">
        <Paragraph2 />
        <Container10 />
      </div>
    </div>
  );
}

function Paragraph3() {
  return (
    <div className="h-[48px] relative shrink-0 w-[32.315px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[48px] left-0 not-italic text-[#0a0a0a] text-[32px] top-[-0.29px] tracking-[0.4063px]">⭐</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white relative rounded-[14px] shrink-0 size-[48px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[4px_4px_0px_0px_black]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center p-[2.693px] relative size-full">
        <Paragraph3 />
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex gap-[16px] h-[80px] items-center relative shrink-0 w-full" data-name="Container">
      <Container9 />
      <Container11 />
      <Button1 />
    </div>
  );
}

function Button2() {
  return (
    <div className="bg-[#ff6b9d] h-[55.995px] relative rounded-[10px] shrink-0 w-[332.005px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[3.366px] border-black border-solid inset-0 pointer-events-none rounded-[10px] shadow-[6px_6px_0px_0px_black]" />
      <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[18px] left-[166.02px] text-[12px] text-center text-white top-[18.69px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        경로 안내 시작! 🏁
      </p>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[16px] h-[271px] items-start left-[-0.37px] overflow-clip px-[19.997px] py-0 top-[37.63px] w-[372px]" data-name="Container">
      <Container12 />
      <Button2 />
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute bg-white border-black border-l-[3.366px] border-r-[3.366px] border-solid border-t-[3.366px] h-[315px] left-[-0.41px] rounded-tl-[24px] rounded-tr-[24px] shadow-[0px_-4px_8px_0px_rgba(0,0,0,0.2)] top-[622.59px] w-[379px]" data-name="Container">
      <Container8 />
      <Container13 />
    </div>
  );
}

function PlaceMapPage() {
  return (
    <div className="h-[881px] overflow-clip relative shrink-0 w-full" data-name="PlaceMapPage">
      <Image />
      <Container />
      <Container3 />
      <Container7 />
      <Container14 />
    </div>
  );
}

export default function Location() {
  return (
    <div className="bg-white relative rounded-[40px] size-full" data-name="Location">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[7.406px] relative rounded-[inherit] size-full">
        <PlaceMapPage />
      </div>
      <div aria-hidden="true" className="absolute border-[#1a1a2e] border-[7.406px] border-solid inset-0 pointer-events-none rounded-[40px] shadow-[0px_0px_0px_4px_#4ecca3,0px_30px_80px_0px_rgba(78,204,163,0.5),0px_0px_60px_0px_rgba(78,204,163,0.3)]" />
    </div>
  );
}