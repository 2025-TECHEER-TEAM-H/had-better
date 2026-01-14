import svgPaths from "./svg-k8y2br04va";

function Icon() {
  return (
    <div className="relative shrink-0 size-[79.999px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 79.9995 79.9995">
        <g id="Icon">
          <path d={svgPaths.p2422a1c0} fill="white" id="Vector" />
          <path d={svgPaths.p24b64980} fill="#FF6B6B" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

export default function Container() {
  return (
    <div className="bg-gradient-to-b content-stretch flex from-[#ffb88c] items-center justify-center pl-0 pr-[0.011px] py-0 relative rounded-[24px] shadow-[0px_20px_40px_0px_rgba(255,154,108,0.4)] size-full to-[#ff9a6c]" data-name="Container">
      <Icon />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_-8px_16px_0px_rgba(0,0,0,0.1),inset_0px_2px_8px_0px_rgba(255,255,255,0.5)]" />
    </div>
  );
}
