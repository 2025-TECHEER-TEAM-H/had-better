import imgImage67 from "../assets/fbcd7982a952f6eb16f488f8cd1ffb7012decdf8.png";

function Container() {
  return (
    <div className="absolute h-[32px] left-[48px] top-[32px] w-[23.798px]" data-name="Container">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[32px] left-0 not-italic text-[#0a0a0a] text-[24px] text-nowrap top-[0.04px] tracking-[0.0703px]">📍</p>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute bg-white border-[3.4px] border-black border-solid h-[314px] left-0 overflow-clip rounded-[10px] shadow-[6px_6px_0px_0px_black] top-0 w-[307px]" data-name="Container">
      <div className="absolute h-[314px] left-[-2.4px] top-[-3.4px] w-[307px]" data-name="image 67">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage67} />
      </div>
      <Container />
    </div>
  );
}

export default function Group() {
  return (
    <div className="relative size-full">
      <Container1 />
    </div>
  );
}
