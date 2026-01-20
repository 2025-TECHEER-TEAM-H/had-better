function Text() {
  return (
    <div className="h-[20.997px] relative shrink-0 w-[83.987px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[21px] left-[42px] text-[14px] text-center text-white top-[-0.63px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
          도착 완료
        </p>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="h-[20.997px] relative shrink-0 w-[14.811px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[21px] left-[7px] not-italic text-[14px] text-center text-white top-[-0.63px] translate-x-[-50%]">🚀</p>
      </div>
    </div>
  );
}

export default function Button() {
  return (
    <div className="bg-[#00d9ff] content-stretch flex gap-[7.995px] items-center justify-center pl-[3.366px] pr-[3.377px] py-[3.366px] relative rounded-[16px] size-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[3.366px] border-black border-solid inset-0 pointer-events-none rounded-[16px] shadow-[6px_6px_0px_0px_black]" />
      <Text />
      <Text1 />
    </div>
  );
}