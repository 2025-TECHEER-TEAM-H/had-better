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

export default function Frame1() {
  return (
    <div className="bg-white content-stretch flex items-center justify-center relative size-full">
      <div aria-hidden="true" className="absolute border-3 border-black border-solid inset-0 pointer-events-none" />
      <Frame />
    </div>
  );
}