import svgPaths from "./svg-r5cc74tw4";
import imgHudHeartEmpty1 from "@/assets/hud-heart-empty.png";
import imgGemGreen1 from "@/assets/gem-green.png";
import imgGemRed1 from "@/assets/gem-red.png";
import imgCoinGold2 from "@/assets/coin-gold.png";
import imgStar1 from "@/assets/star.png";
import imgWindow2 from "@/assets/window.png";
import imgSaw1 from "@/assets/saw.png";
import imgLockYellow1 from "@/assets/lock-yellow.png";

function Frame2() {
  return (
    <div className="absolute content-stretch flex flex-col items-start justify-end left-[26.96px] right-[26.96px] top-[111.98px]">
      <div className="bg-white h-[63px] relative rounded-[25px] shrink-0 w-full">
        <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none rounded-[25px]" />
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute content-stretch flex gap-[17px] items-center left-[44.61px] p-[2px] right-[45.2px] top-[123.62px]">
      <div className="relative shrink-0 size-[30px]" data-name="hud_heart_empty 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgHudHeartEmpty1} />
      </div>
      <p className="css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] h-[36.752px] leading-[30px] relative shrink-0 text-[13px] text-black w-[237.396px]" style={{ fontVariationSettings: "'wght' 400" }}>
        목적지를 입력해주세요
      </p>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[26.96px] right-[26.96px] top-[111.98px]">
      <Frame2 />
      <Frame3 />
    </div>
  );
}

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
    <div className="absolute content-stretch flex h-[41.721px] items-center justify-center left-0 top-[190.09px] w-[349.034px]">
      <Frame />
    </div>
  );
}

function Frame4() {
  return (
    <div className="absolute content-stretch flex flex-col h-[42.691px] items-start justify-end left-[26.96px] right-[26.96px] top-[243.45px]">
      <div className="bg-white h-[44px] relative rounded-[25px] shrink-0 w-full">
        <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none rounded-[25px]" />
      </div>
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute content-stretch flex gap-[17px] h-[27.615px] items-center left-[45.59px] p-[2px] right-[44.22px] top-[251.21px]">
      <div className="relative shrink-0 size-[30px]" data-name="gem_green 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgGemGreen1} />
      </div>
      <p className="css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] h-[36.752px] leading-[30px] relative shrink-0 text-[13px] text-black w-[237.396px]" style={{ fontVariationSettings: "'wght' 400" }}>
        출발지를 입력해주세요
      </p>
    </div>
  );
}

function Group3() {
  return (
    <div className="absolute contents left-[26.96px] right-[26.96px] top-[243.45px]">
      <Frame4 />
      <Frame5 />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-[26.96px] right-[26.96px] top-[243.45px]">
      <Group3 />
    </div>
  );
}

function Frame6() {
  return (
    <div className="absolute content-stretch flex flex-col h-[42.691px] items-start justify-end left-[26.96px] right-[26.96px] top-[297.78px]">
      <div className="bg-white h-[44px] relative rounded-[25px] shrink-0 w-full">
        <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none rounded-[25px]" />
      </div>
    </div>
  );
}

function Frame7() {
  return (
    <div className="absolute content-stretch flex gap-[17px] h-[27.615px] items-center left-[45.59px] p-[2px] right-[44.22px] top-[305.55px]">
      <div className="relative shrink-0 size-[30px]" data-name="gem_red 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgGemRed1} />
      </div>
      <p className="css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] h-[36.752px] leading-[30px] relative shrink-0 text-[13px] text-black w-[237.396px]" style={{ fontVariationSettings: "'wght' 400" }}>
        도착지를 입력해주세요
      </p>
    </div>
  );
}

function Group5() {
  return (
    <div className="absolute contents left-[26.96px] right-[26.96px] top-[297.78px]">
      <Frame6 />
      <Frame7 />
    </div>
  );
}

function Group4() {
  return (
    <div className="absolute contents left-[26.96px] right-[26.96px] top-[297.78px]">
      <Group5 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[23.96px] top-[422.95px]">
      <p className="absolute css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[28.137px] leading-[30px] left-[23.96px] text-[12px] text-black top-[422.95px] tracking-[0.6px] w-[295.111px]">자주 가는 곳</p>
    </div>
  );
}

function Group11() {
  return (
    <div className="absolute contents left-[23.96px] top-[422.95px]">
      <Group />
    </div>
  );
}

function Group15() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[156.31px] mt-0 relative row-1">
      <div className="bg-white border-3 border-black border-solid col-1 h-[74px] ml-[156.31px] mt-0 rounded-[10px] row-1 w-[68.153px]" />
      <div className="col-1 flex flex-col font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[19px] justify-center ml-[190.38px] mt-[87.5px] relative row-1 text-[12px] text-black text-center tracking-[0.6px] translate-x-[-50%] translate-y-[-50%] w-[68.153px]">
        <p className="css-4hzbpn leading-[30px]">회사</p>
      </div>
    </div>
  );
}

function Group16() {
  return (
    <div className="col-[3] css-4z9rfs grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative row-[1] self-start shrink-0">
      <Group15 />
      <div className="col-1 ml-[163.31px] mt-[9px] relative row-1 size-[55px]" data-name="coin_gold 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgCoinGold2} />
      </div>
    </div>
  );
}

function Group9() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[234.46px] mt-0 relative row-1">
      <div className="bg-white border-3 border-black border-solid col-1 h-[74px] ml-[234.46px] mt-0 rounded-[10px] row-1 w-[68.153px]" />
      <div className="col-1 flex flex-col font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[19px] justify-center ml-[268.54px] mt-[87.5px] relative row-1 text-[12px] text-black text-center tracking-[0.6px] translate-x-[-50%] translate-y-[-50%] w-[68.153px]">
        <p className="css-4hzbpn leading-[30px]">즐겨찾기</p>
      </div>
    </div>
  );
}

function Group14() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[calc(50%+91.46px)] mt-[calc(50%-47.27px)] relative row-1">
      <div className="col-1 ml-[calc(50%+91.46px)] mt-[calc(50%-47.27px)] relative row-1 size-[55px]" data-name="star 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgStar1} />
      </div>
    </div>
  );
}

function Group18() {
  return (
    <div className="col-[4] css-4z9rfs grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative row-[1] self-start shrink-0">
      <Group9 />
      <Group14 />
    </div>
  );
}

function Group17() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-0 mt-0 relative row-1">
      <div className="bg-white border-3 border-black border-solid col-1 h-[74px] ml-0 mt-0 rounded-[10px] row-1 w-[68.153px]" />
      <div className="col-1 flex flex-col font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[19px] justify-center ml-[34.08px] mt-[87.5px] relative row-1 text-[12px] text-black text-center tracking-[0.6px] translate-x-[-50%] translate-y-[-50%] w-[68.153px]">
        <p className="css-4hzbpn leading-[30px]">집</p>
      </div>
    </div>
  );
}

function Group19() {
  return (
    <div className="col-[1] css-4z9rfs grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative row-[1] self-start shrink-0">
      <Group17 />
      <div className="col-1 ml-[19px] mt-[20px] relative row-1 size-[30px]" data-name="window 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgWindow2} />
      </div>
    </div>
  );
}

function Group21() {
  return (
    <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] ml-[78.15px] mt-0 relative row-1">
      <div className="bg-white border-3 border-black border-solid col-1 h-[74px] ml-[78.15px] mt-0 rounded-[10px] row-1 w-[68.153px]" />
      <div className="col-1 flex flex-col font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[19px] justify-center ml-[112.23px] mt-[87.5px] relative row-1 text-[12px] text-black text-center tracking-[0.6px] translate-x-[-50%] translate-y-[-50%] w-[68.153px]">
        <p className="css-4hzbpn leading-[30px]">학교</p>
      </div>
      <div className="col-1 ml-[97.15px] mt-[22px] relative row-1 size-[30px]" data-name="saw 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgSaw1} />
      </div>
    </div>
  );
}

function Group20() {
  return (
    <div className="col-[2] css-4z9rfs grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] relative row-[1] self-start shrink-0">
      <Group21 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="absolute gap-[10px] grid grid-cols-[repeat(4,_fit-content(100%))] grid-rows-[__fit-content(100%)_15.55px] leading-[0] left-[22px] top-[463.7px] w-[300px]">
      <Group16 />
      <Group18 />
      <Group19 />
      <Group20 />
    </div>
  );
}

function Group8() {
  return (
    <div className="absolute contents right-[29.96px] top-[571.39px]">
      <p className="absolute css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[28.137px] leading-[30px] right-[57.41px] text-[12px] text-black text-center top-[571.39px] tracking-[0.6px] translate-x-[50%] w-[54.904px]">전체 삭제</p>
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute contents left-[23.96px] top-[571.39px]">
      <p className="absolute css-4hzbpn font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[28.137px] leading-[30px] left-[51.9px] text-[12px] text-black text-center top-[571.39px] tracking-[0.6px] translate-x-[-50%] w-[55.885px]">최근 기록</p>
      <Group8 />
    </div>
  );
}

function Group12() {
  return (
    <div className="absolute contents left-[23.96px] top-[571.39px]">
      <Group7 />
    </div>
  );
}

function Group10() {
  return (
    <div className="absolute bottom-[42.34px] contents left-[22px] right-[31.92px]">
      <div className="absolute bottom-[228.62px] font-['Wittgenstein:Medium','Noto_Sans_KR:Medium',sans-serif] font-medium h-[186.288px] leading-[50px] left-[22px] right-[31.92px] text-[0px] text-[rgba(0,0,0,0.2)] text-center tracking-[0.6px] translate-y-[100%]">
        <p className="css-4hzbpn mb-0 text-[20px]">오늘은</p>
        <p className="css-4hzbpn mb-0 text-[40px]">{`어디로 `}</p>
        <p className="css-4hzbpn text-[40px]">안내할까요?</p>
      </div>
    </div>
  );
}

function Group13() {
  return (
    <div className="absolute bottom-0 contents left-0 top-0">
      <div className="absolute inset-[0_2.94px_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 346.093 841.124">
          <path d={svgPaths.p20707d00} fill="url(#paint0_linear_73_364)" id="Rectangle 13" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_73_364" x1="173.047" x2="173.047" y1="13.4998" y2="841.124">
              <stop stopColor="#C5E7F5" />
              <stop offset="1" stopColor="white" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute h-[40.751px] left-[23.53px] top-[29.99px] w-[41.178px]" data-name="lock_yellow 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgLockYellow1} />
      </div>
      <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] h-[24.256px] leading-[30px] left-[277.46px] not-italic text-[20px] text-black text-right top-[46.49px] translate-x-[-100%] w-[201.969px]">HAD BETTER</p>
      <Group1 />
      <Frame1 />
      <Group2 />
      <Group4 />
      <Group11 />
      <Frame10 />
      <Group12 />
      <Group10 />
    </div>
  );
}

function Frame8() {
  return (
    <div className="absolute content-stretch flex flex-col h-[42.691px] items-start justify-end left-[26.96px] right-[26.96px] top-[353.5px]">
      <div className="bg-[#4a9960] h-[44px] relative rounded-[25px] shrink-0 w-full">
        <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none rounded-[25px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]" />
      </div>
    </div>
  );
}

function Frame9() {
  return (
    <div className="absolute content-stretch flex h-[27.615px] items-center left-[45.59px] pb-[7px] pt-[2px] px-[2px] right-[44.22px] top-[361.26px]">
      <p className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold h-[23px] leading-[30px] relative shrink-0 text-[13px] text-black text-center w-[237px]">길 찾기</p>
    </div>
  );
}

function Group6() {
  return (
    <div className="absolute contents left-[26.96px] right-[26.96px] top-[353.5px]">
      <Frame8 />
      <Frame9 />
    </div>
  );
}

export default function Group22() {
  return (
    <div className="relative size-full">
      <Group13 />
      <Group6 />
    </div>
  );
}