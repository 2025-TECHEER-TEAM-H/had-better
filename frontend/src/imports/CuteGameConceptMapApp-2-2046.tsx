import svgPaths from "./svg-n7973o3npq";
import clsx from "clsx";
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div className={clsx("h-[19.995px] relative shrink-0", additionalClassNames)}>
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">{children}</div>
    </div>
  );
}
type Vector2Props = {
  additionalClassNames?: string;
};

function Vector2({ children, additionalClassNames = "" }: React.PropsWithChildren<Vector2Props>) {
  return (
    <div className={clsx("absolute", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        {children}
      </svg>
    </div>
  );
}
type Vector1Props = {
  additionalClassNames?: string;
};

function Vector1({ children, additionalClassNames = "" }: React.PropsWithChildren<Vector1Props>) {
  return (
    <div className={clsx("absolute", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 16">
        {children}
      </svg>
    </div>
  );
}
type Icon21Props = {
  additionalClassNames?: string;
};

function Icon21({ children, additionalClassNames = "" }: React.PropsWithChildren<Icon21Props>) {
  return (
    <div className={clsx("absolute h-0 top-0 w-[346.049px]", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 346.049 0">
        {children}
      </svg>
    </div>
  );
}
type ButtonTextProps = {
  text: string;
  additionalClassNames?: string;
};

function ButtonText({ text, additionalClassNames = "" }: ButtonTextProps) {
  return (
    <div className={clsx("absolute bg-gradient-to-b content-stretch flex from-white h-[64px] items-center justify-center p-[3.4px] rounded-[16px] to-[#f5f5f5] top-0", additionalClassNames)}>
      <div aria-hidden="true" className="absolute border-[3.4px] border-black border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_6px_0px_0px_#d0d0d0,0px_12px_24px_0px_rgba(0,0,0,0.1)]" />
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[36px] not-italic relative shrink-0 text-[#0a0a0a] text-[30px] text-center text-nowrap tracking-[0.3955px]">{text}</p>
    </div>
  );
}
type VectorProps = {
  additionalClassNames?: string;
};

function Vector({ additionalClassNames = "" }: VectorProps) {
  return (
    <div className={clsx("absolute", additionalClassNames)}>
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 32">
        <path d={svgPaths.p274a3e80} fill="url(#paint0_linear_2_267)" id="Vector" />
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_267" x1="0" x2="0" y1="0" y2="3200">
            <stop stopColor="#6B4423" />
            <stop offset="1" stopColor="#5A3A1F" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function Icon13() {
  return (
    <div className="h-[12px] overflow-clip relative shrink-0 w-full">
      <div className="absolute bottom-0 left-[12.5%] right-[12.5%] top-1/2" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 6">
          <path d={svgPaths.p14155300} fill="var(--fill-0, #3D6E50)" id="Vector" />
        </svg>
      </div>
      <div className="absolute bottom-[33.33%] left-1/4 right-1/4 top-[16.67%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 6">
          <path d={svgPaths.p380bac80} fill="var(--fill-0, #3D6E50)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Container() {
  return <div className="absolute bg-white blur-2xl filter h-[64px] left-[32px] opacity-60 rounded-[2.28151e+07px] top-[64px] w-[127.999px]" data-name="Container" />;
}

function Container1() {
  return <div className="absolute bg-white blur-2xl filter h-[80px] left-[138.05px] opacity-50 rounded-[2.28151e+07px] top-[96px] w-[159.999px]" data-name="Container" />;
}

function Container2() {
  return <div className="absolute bg-white blur-2xl filter h-[56px] left-[96px] opacity-40 rounded-[2.28151e+07px] top-[160px] w-[111.999px]" data-name="Container" />;
}

function Icon() {
  return (
    <Icon21 additionalClassNames="left-0">
      <g clipPath="url(#clip0_2_292)" id="Icon">
        <path d={svgPaths.p177a6300} fill="url(#paint0_linear_2_292)" id="Vector" opacity="0.7" />
      </g>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_292" x1="-43.2561" x2="-43.2561" y1="0" y2="0">
          <stop stopColor="#4A9960" />
          <stop offset="1" stopColor="#3D8651" />
        </linearGradient>
        <clipPath id="clip0_2_292">
          <rect fill="white" height="0" width="346.049" />
        </clipPath>
      </defs>
    </Icon21>
  );
}

function Icon1() {
  return (
    <Icon21 additionalClassNames="left-[173.02px]">
      <g clipPath="url(#clip0_2_248)" id="Icon">
        <path d={svgPaths.p21d26500} fill="url(#paint0_linear_2_248)" id="Vector" opacity="0.7" />
      </g>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_248" x1="0" x2="0" y1="0" y2="0">
          <stop stopColor="#4A9960" />
          <stop offset="1" stopColor="#3D8651" />
        </linearGradient>
        <clipPath id="clip0_2_248">
          <rect fill="white" height="0" width="346.049" />
        </clipPath>
      </defs>
    </Icon21>
  );
}

function Icon2() {
  return (
    <Icon21 additionalClassNames="left-[69.21px]">
      <g clipPath="url(#clip0_2_269)" id="Icon">
        <path d={svgPaths.p1adf6f00} fill="url(#paint0_linear_2_269)" id="Vector" opacity="0.7" />
      </g>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_269" x1="0" x2="0" y1="0" y2="0">
          <stop stopColor="#7EC98F" />
          <stop offset="1" stopColor="#6BB87C" />
        </linearGradient>
        <clipPath id="clip0_2_269">
          <rect fill="white" height="0" width="346.049" />
        </clipPath>
      </defs>
    </Icon21>
  );
}

function Icon3() {
  return (
    <Icon21 additionalClassNames="left-0">
      <g clipPath="url(#clip0_2_236)" id="Icon">
        <path d={svgPaths.p35f52b00} fill="url(#paint0_linear_2_236)" id="Vector" opacity="0.85" />
      </g>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_236" x1="0" x2="0" y1="0" y2="0">
          <stop stopColor="#7EC98F" />
          <stop offset="1" stopColor="#6BB87C" />
        </linearGradient>
        <clipPath id="clip0_2_236">
          <rect fill="white" height="0" width="346.049" />
        </clipPath>
      </defs>
    </Icon21>
  );
}

function Icon4() {
  return (
    <Icon21 additionalClassNames="left-[173.02px]">
      <g clipPath="url(#clip0_2_245)" id="Icon">
        <path d={svgPaths.pb02a380} fill="url(#paint0_linear_2_245)" id="Vector" opacity="0.9" />
      </g>
      <defs>
        <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_245" x1="0" x2="0" y1="0" y2="0">
          <stop stopColor="#7EC98F" />
          <stop offset="1" stopColor="#6BB87C" />
        </linearGradient>
        <clipPath id="clip0_2_245">
          <rect fill="white" height="0" width="346.049" />
        </clipPath>
      </defs>
    </Icon21>
  );
}

function Icon5() {
  return (
    <div className="h-[48px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Vector1 additionalClassNames="inset-[66.67%_37.5%_0_37.5%]">
        <path d={svgPaths.p12dd4a80} fill="url(#paint0_linear_2_290)" id="Vector" />
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_290" x1="0" x2="0" y1="0" y2="1600">
            <stop stopColor="#6B4423" />
            <stop offset="1" stopColor="#5A3A1F" />
          </linearGradient>
        </defs>
      </Vector1>
      <div className="absolute bottom-1/4 left-[12.5%] right-[12.5%] top-[41.67%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 16">
          <path d={svgPaths.p2a9d0d00} fill="url(#paint0_linear_2_218)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_218" x1="0" x2="0" y1="0" y2="1600">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-1/2 left-1/4 right-1/4 top-[20.83%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 14">
          <path d={svgPaths.p3707a700} fill="url(#paint0_linear_2_276)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_276" x1="0" x2="0" y1="0" y2="1400">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[4.17%_31.25%_70.83%_31.25%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
          <path d={svgPaths.p22077200} fill="url(#paint0_linear_2_284)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_284" x1="0" x2="0" y1="0" y2="1200">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="absolute content-stretch flex flex-col h-[48px] items-start left-[27.68px] top-[-128px] w-[32px]" data-name="Container">
      <Icon5 />
    </div>
  );
}

function Icon6() {
  return (
    <div className="h-[56px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Vector1 additionalClassNames="inset-[71.43%_40%_0_40%]">
        <path d={svgPaths.p12dd4a80} fill="url(#paint0_linear_2_194)" id="Vector" />
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_194" x1="0" x2="0" y1="0" y2="1600">
            <stop stopColor="#6B4423" />
            <stop offset="1" stopColor="#5A3A1F" />
          </linearGradient>
        </defs>
      </Vector1>
      <div className="absolute inset-[46.43%_15%_21.43%_15%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 18">
          <path d={svgPaths.p116c4000} fill="url(#paint0_linear_2_253)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_253" x1="0" x2="0" y1="0" y2="1800">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-[46.43%] left-1/4 right-1/4 top-1/4" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 16">
          <path d={svgPaths.p3033fa80} fill="url(#paint0_linear_2_259)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_259" x1="0" x2="0" y1="0" y2="1600">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[7.14%_35%_67.86%_35%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 14">
          <path d={svgPaths.p32e15b00} fill="url(#paint0_linear_2_232)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_232" x1="0" x2="0" y1="0" y2="1400">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex flex-col h-[56px] items-start left-[219.54px] top-[-120px] w-[40px]" data-name="Container">
      <Icon6 />
    </div>
  );
}

function Icon7() {
  return (
    <div className="h-[39.996px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[70%_38.46%_0_38.46%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.99935 11.9987">
          <path d={svgPaths.p39c3d880} fill="url(#paint0_linear_2_243)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_243" x1="0" x2="0" y1="0" y2="1199.87">
              <stop stopColor="#6B4423" />
              <stop offset="1" stopColor="#5A3A1F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-1/4 left-[15.38%] right-[15.38%] top-[45%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.9981 11.9987">
          <path d={svgPaths.p8df5800} fill="url(#paint0_linear_2_210)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_210" x1="0" x2="0" y1="0" y2="1199.87">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-1/2 left-[23.08%] right-[23.08%] top-1/4" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9985 9.99892">
          <path d={svgPaths.p2dda9100} fill="url(#paint0_linear_2_224)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_224" x1="0" x2="0" y1="0" y2="999.892">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[5%_30.77%_70%_30.77%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.99892 9.99892">
          <path d={svgPaths.p3f712700} fill="url(#paint0_linear_2_222)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_222" x1="0" x2="0" y1="0" y2="999.892">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex flex-col h-[40px] items-start left-[121.11px] top-[-136px] w-[25.997px]" data-name="Container">
      <Icon7 />
    </div>
  );
}

function Icon8() {
  return (
    <div className="h-[41.992px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[71.43%_42.86%_0_42.86%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.99922 11.9977">
          <path d={svgPaths.pfedce72} fill="url(#paint0_linear_2_282)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_282" x1="0" x2="0" y1="0" y2="1199.77">
              <stop stopColor="#6B4423" />
              <stop offset="1" stopColor="#5A3A1F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[47.62%_14.29%_19.05%_14.29%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9961 13.9973">
          <path d={svgPaths.p2f020e00} fill="url(#paint0_linear_2_220)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_220" x1="0" x2="0" y1="0" y2="1399.73">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[28.57%_21.43%_42.86%_21.43%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9969 11.9977">
          <path d={svgPaths.p14155c00} fill="url(#paint0_linear_2_173)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_173" x1="0" x2="0" y1="0" y2="1199.77">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[9.52%_28.57%_66.67%_28.57%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9977 9.99805">
          <path d={svgPaths.p28aa2300} fill="url(#paint0_linear_2_265)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_265" x1="0" x2="0" y1="0" y2="999.805">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex flex-col h-[41.997px] items-start left-[86.51px] top-[-98px] w-[27.995px]" data-name="Container">
      <Icon8 />
    </div>
  );
}

function Icon9() {
  return (
    <div className="h-[36px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[66.67%_41.67%_0_41.67%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4 12">
          <path d={svgPaths.p2fad0200} fill="url(#paint0_linear_2_214)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_214" x1="0" x2="0" y1="0" y2="1200">
              <stop stopColor="#6B4423" />
              <stop offset="1" stopColor="#5A3A1F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[44.44%_16.67%_27.78%_16.67%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 10">
          <path d={svgPaths.p3b76b300} fill="url(#paint0_linear_2_167)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_167" x1="0" x2="0" y1="0" y2="1000">
              <stop stopColor="#3D6E50" />
              <stop offset="1" stopColor="#2D5F3F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-1/2 left-1/4 right-1/4 top-[27.78%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 8">
          <path d={svgPaths.p10e0ba00} fill="url(#paint0_linear_2_212)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_212" x1="0" x2="0" y1="0" y2="800">
              <stop stopColor="#3D6E50" />
              <stop offset="1" stopColor="#2D5F3F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[11.11%_33.33%_66.67%_33.33%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 8">
          <path d={svgPaths.p7f44740} fill="url(#paint0_linear_2_208)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_208" x1="0" x2="0" y1="0" y2="800">
              <stop stopColor="#3D6E50" />
              <stop offset="1" stopColor="#2D5F3F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="absolute content-stretch flex flex-col h-[35.994px] items-start left-[190.32px] top-[-107.99px] w-[24px]" data-name="Container">
      <Icon9 />
    </div>
  );
}

function Icon10() {
  return (
    <div className="h-[51.992px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[69.23%_38.89%_0_38.89%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.99878 15.9976">
          <path d={svgPaths.p2d643e00} fill="url(#paint0_linear_2_263)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_263" x1="0" x2="0" y1="0" y2="1599.76">
              <stop stopColor="#6B4423" />
              <stop offset="1" stopColor="#5A3A1F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[46.15%_16.67%_23.08%_16.67%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 23.9963 15.9976">
          <path d={svgPaths.pc7b32c0} fill="url(#paint0_linear_2_204)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_204" x1="0" x2="0" y1="0" y2="1599.76">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[26.92%_22.22%_46.15%_22.22%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.9969 13.9979">
          <path d={svgPaths.p23e3ff80} fill="url(#paint0_linear_2_239)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_239" x1="0" x2="0" y1="0" y2="1399.79">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[7.69%_33.33%_69.23%_33.33%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9982 11.9982">
          <path d={svgPaths.p8eb1600} fill="url(#paint0_linear_2_251)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_251" x1="0" x2="0" y1="0" y2="1199.82">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex flex-col h-[51.994px] items-start left-[258.16px] top-[-139.99px] w-[35.994px]" data-name="Container">
      <Icon10 />
    </div>
  );
}

function Icon11() {
  return (
    <div className="h-[31.991px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[68.75%_40%_0_40%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 3.99892 9.99729">
          <path d={svgPaths.p245d8400} fill="url(#paint0_linear_2_202)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_202" x1="0" x2="0" y1="0" y2="999.729">
              <stop stopColor="#6B4423" />
              <stop offset="1" stopColor="#5A3A1F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-1/4 left-[10%] right-[10%] top-[43.75%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9957 9.99729">
          <path d={svgPaths.pa5e1900} fill="url(#paint0_linear_2_230)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_230" x1="0" x2="0" y1="0" y2="999.729">
              <stop stopColor="#3D6E50" />
              <stop offset="1" stopColor="#2D5F3F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-1/2 left-[20%] right-[20%] top-1/4" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9967 7.99783">
          <path d={svgPaths.p73d4500} fill="url(#paint0_linear_2_198)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_198" x1="0" x2="0" y1="0" y2="799.783">
              <stop stopColor="#3D6E50" />
              <stop offset="1" stopColor="#2D5F3F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[6.25%_30%_68.75%_30%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 7.99783 7.99783">
          <path d={svgPaths.p21628580} fill="url(#paint0_linear_2_288)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_288" x1="0" x2="0" y1="0" y2="799.783">
              <stop stopColor="#3D6E50" />
              <stop offset="1" stopColor="#2D5F3F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="absolute content-stretch flex flex-col h-[32px] items-start left-[170.34px] top-[-80px] w-[19.995px]" data-name="Container">
      <Icon11 />
    </div>
  );
}

function Icon12() {
  return (
    <div className="h-[43.988px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[72.73%_40%_0_40%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.99837 11.9967">
          <path d={svgPaths.p23331a80} fill="url(#paint0_linear_2_196)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_196" x1="0" x2="0" y1="0" y2="1199.67">
              <stop stopColor="#6B4423" />
              <stop offset="1" stopColor="#5A3A1F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-[18.18%] left-[13.33%] right-[13.33%] top-1/2" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21.994 13.9962">
          <path d={svgPaths.p32751300} fill="url(#paint0_linear_2_286)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_286" x1="0" x2="0" y1="0" y2="1399.62">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[31.82%_20%_45.45%_20%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.9951 9.99729">
          <path d={svgPaths.p26256000} fill="url(#paint0_linear_2_274)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_274" x1="0" x2="0" y1="0" y2="999.729">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[13.64%_33.33%_63.64%_33.33%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.99729 9.99729">
          <path d={svgPaths.p2ea9ee32} fill="url(#paint0_linear_2_255)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_255" x1="0" x2="0" y1="0" y2="999.729">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="absolute content-stretch flex flex-col h-[43.994px] items-start left-[242.23px] top-[-147.99px] w-[29.992px]" data-name="Container">
      <Icon12 />
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex flex-col h-[11.995px] items-start left-[62.28px] top-[-51.99px] w-[16px]" data-name="Container">
      <Icon13 />
    </div>
  );
}

function Icon14() {
  return (
    <div className="h-[9.994px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[40%_14.29%_0_14.29%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.99425 5.99655">
          <path d={svgPaths.p2ef44900} fill="var(--fill-0, #4A7C5F)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[0_28.57%_40%_28.57%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 5.99655 5.99655">
          <path d={svgPaths.p28a46000} fill="var(--fill-0, #4A7C5F)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="absolute content-stretch flex flex-col h-[9.997px] items-start left-[210.94px] top-[-42px] w-[13.992px]" data-name="Container">
      <Icon14 />
    </div>
  );
}

function Icon15() {
  return (
    <div className="h-[13.998px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[57.14%_11.11%_0_11.11%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 13.9979 5.99908">
          <path d={svgPaths.p1cc3d080} fill="var(--fill-0, #2D5F3F)" id="Vector" />
        </svg>
      </div>
      <div className="absolute inset-[14.29%_22.22%_28.57%_22.22%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.99847 7.99878">
          <path d={svgPaths.p285593f0} fill="var(--fill-0, #2D5F3F)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="absolute content-stretch flex flex-col h-[13.992px] items-start left-[166.1px] top-[-77.99px] w-[17.997px]" data-name="Container">
      <Icon15 />
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute content-stretch flex flex-col h-[11.995px] items-start left-[288.53px] top-[-55.99px] w-[16px]" data-name="Container">
      <Icon13 />
    </div>
  );
}

function Container15() {
  return (
    <div className="absolute h-0 left-0 top-[852.65px] w-[346.049px]" data-name="Container">
      <Icon />
      <Icon1 />
      <Icon2 />
      <Icon3 />
      <Icon4 />
      <Container3 />
      <Container4 />
      <Container5 />
      <Container6 />
      <Container7 />
      <Container8 />
      <Container9 />
      <Container10 />
      <Container11 />
      <Container12 />
      <Container13 />
      <Container14 />
    </div>
  );
}

function Heading() {
  return (
    <div className="font-['Press_Start_2P:Regular',sans-serif] h-[119.989px] leading-[60px] not-italic relative shrink-0 text-[#2d5f3f] text-[48px] text-center text-nowrap tracking-[2.4px] w-full" data-name="Heading 1">
      <p className="absolute left-[152.09px] top-[-0.56px] translate-x-[-50%]">HAD</p>
      <p className="absolute left-[151px] top-[59.43px] translate-x-[-50%]">BETTER</p>
    </div>
  );
}

function Paragraph() {
  return (
    <div className="h-[24px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[24px] left-[151.81px] text-[#6b9080] text-[16px] text-center text-nowrap top-[-0.6px] tracking-[-0.4px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        선택 경로 실시간 비교
      </p>
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[8px] h-[151.989px] items-start left-0 top-[152px] w-[302.383px]" data-name="Container">
      <Heading />
      <Paragraph />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="h-[19.995px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[20px] left-[96.5px] text-[#5a5a5a] text-[14px] text-center text-nowrap top-[-0.28px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        🗺️ 더 나은 길을 찾아보세요
      </p>
    </div>
  );
}

function Container17() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.9)] content-stretch flex flex-col h-[57.434px] items-start left-[20.48px] pb-[2.72px] pt-[18.72px] px-[34.72px] rounded-[16px] top-[327.99px] w-[261.417px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[2.72px] border-black border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.08)]" />
      <Paragraph1 />
    </div>
  );
}

function Icon16() {
  return (
    <div className="relative shrink-0 size-[79.999px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 79.9995 79.9995">
        <g id="Icon">
          <path d={svgPaths.p2422a1c0} fill="var(--fill-0, white)" id="Vector" />
          <path d={svgPaths.p24b64980} fill="var(--fill-0, #FF6B6B)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Container18() {
  return (
    <div className="absolute bg-gradient-to-b content-stretch flex from-[#ffb88c] items-center justify-center left-[91.69px] pl-0 pr-[0.011px] py-0 rounded-[24px] shadow-[0px_20px_40px_0px_rgba(255,154,108,0.4)] size-[119.999px] to-[#ff9a6c] top-[8.19px]" data-name="Container">
      <Icon16 />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0px_-8px_16px_0px_rgba(0,0,0,0.1),inset_0px_2px_8px_0px_rgba(255,255,255,0.5)]" />
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute h-[417.421px] left-[21.83px] top-[32px] w-[302.383px]" data-name="Container">
      <Container16 />
      <Container17 />
      <Container18 />
    </div>
  );
}

function Icon17() {
  return (
    <div className="h-[72px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <div className="absolute inset-[72.22%_41.67%_0_41.67%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 20">
          <path d={svgPaths.p36a1e400} fill="url(#paint0_linear_2_234)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_234" x1="0" x2="0" y1="0" y2="2000">
              <stop stopColor="#6B4423" />
              <stop offset="1" stopColor="#5A3A1F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[44.44%_16.67%_22.22%_16.67%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 24">
          <path d={svgPaths.p6a00c80} fill="url(#paint0_linear_2_226)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_226" x1="0" x2="0" y1="0" y2="2400">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-1/2 left-1/4 right-1/4 top-[22.22%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 20">
          <path d={svgPaths.p2c866c00} fill="url(#paint0_linear_2_261)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_261" x1="0" x2="0" y1="0" y2="2000">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[5.56%_33.33%_72.22%_33.33%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <path d={svgPaths.p34320900} fill="url(#paint0_linear_2_241)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_241" x1="0" x2="0" y1="0" y2="1600">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="absolute content-stretch flex flex-col h-[72px] items-start left-[24px] top-[-19.99px] w-[48px]" data-name="Container">
      <Icon17 />
    </div>
  );
}

function Icon18() {
  return (
    <div className="h-[96px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Vector additionalClassNames="inset-[66.67%_37.5%_0_37.5%]" />
      <div className="absolute bottom-1/4 left-[12.5%] right-[12.5%] top-[41.67%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 32">
          <path d={svgPaths.p16a93680} fill="url(#paint0_linear_2_206)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_206" x1="0" x2="0" y1="0" y2="3200">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute bottom-1/2 left-[18.75%] right-[18.75%] top-[20.83%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 28">
          <path d={svgPaths.p1f282380} fill="url(#paint0_linear_2_165)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_165" x1="0" x2="0" y1="0" y2="2800">
              <stop stopColor="#2D5F3F" />
              <stop offset="1" stopColor="#1F4A2F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <Vector2 additionalClassNames="inset-[4.17%_31.25%_70.83%_31.25%]">
        <path d={svgPaths.p34735200} fill="url(#paint0_linear_2_200)" id="Vector" />
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_200" x1="0" x2="0" y1="0" y2="2400">
            <stop stopColor="#2D5F3F" />
            <stop offset="1" stopColor="#1F4A2F" />
          </linearGradient>
        </defs>
      </Vector2>
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute content-stretch flex flex-col h-[95.999px] items-start left-[-80px] top-[16px] w-[64px]" data-name="Container">
      <Icon18 />
    </div>
  );
}

function Icon19() {
  return (
    <div className="h-[108px] overflow-clip relative shrink-0 w-full" data-name="Icon">
      <Vector additionalClassNames="inset-[70.37%_38.89%_0_38.89%]" />
      <div className="absolute inset-[44.44%_16.67%_22.22%_16.67%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 36">
          <path d={svgPaths.p26ebca00} fill="url(#paint0_linear_2_163)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_163" x1="0" x2="0" y1="0" y2="3600">
              <stop stopColor="#3D6E50" />
              <stop offset="1" stopColor="#2D5F3F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-[22.22%_22.22%_48.15%_22.22%]" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 32">
          <path d={svgPaths.p11add000} fill="url(#paint0_linear_2_216)" id="Vector" />
          <defs>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_216" x1="0" x2="0" y1="0" y2="3200">
              <stop stopColor="#3D6E50" />
              <stop offset="1" stopColor="#2D5F3F" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <Vector2 additionalClassNames="inset-[7.41%_33.33%_70.37%_33.33%]">
        <path d={svgPaths.p34735200} fill="url(#paint0_linear_2_257)" id="Vector" />
        <defs>
          <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_2_257" x1="0" x2="0" y1="0" y2="2400">
            <stop stopColor="#3D6E50" />
            <stop offset="1" stopColor="#2D5F3F" />
          </linearGradient>
        </defs>
      </Vector2>
    </div>
  );
}

function Container22() {
  return (
    <div className="absolute content-stretch flex flex-col h-[107.994px] items-start left-[104px] top-[4.01px] w-[72px]" data-name="Container">
      <Icon19 />
    </div>
  );
}

function Icon20() {
  return (
    <div className="absolute h-[111.999px] left-0 top-0 w-[95.999px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 95.9995 111.999">
        <g id="Icon">
          <path d={svgPaths.p108f7ff0} fill="var(--fill-0, #D4A574)" id="Vector" />
          <path d={svgPaths.p3ea9e280} fill="var(--fill-0, #D4A574)" id="Vector_2" />
          <path d={svgPaths.p22f98f00} fill="var(--fill-0, #C49764)" id="Vector_3" />
          <path d={svgPaths.p2d24bbc0} fill="var(--fill-0, #B8845F)" id="Vector_4" />
          <path d={svgPaths.pa445800} fill="var(--fill-0, #A57050)" id="Vector_5" />
          <path d={svgPaths.p195ff040} fill="var(--fill-0, #B8845F)" id="Vector_6" />
          <path d={svgPaths.p19932f1} fill="var(--fill-0, #A57050)" id="Vector_7" />
          <path d={svgPaths.p2f6ffb00} fill="var(--fill-0, #D4A574)" id="Vector_8" />
          <path d={svgPaths.p1e761100} fill="var(--fill-0, black)" id="Vector_9" />
          <path d={svgPaths.p2d7fdd00} fill="var(--fill-0, black)" id="Vector_10" />
          <path d={svgPaths.p2b48e500} fill="var(--fill-0, black)" id="Vector_11" />
          <path d={svgPaths.p33334020} fill="var(--fill-0, #B8845F)" id="Vector_12" />
          <path d={svgPaths.p5e0ea00} fill="var(--fill-0, #B8845F)" id="Vector_13" />
        </g>
      </svg>
    </div>
  );
}

function Container23() {
  return <div className="absolute bg-[rgba(0,0,0,0.2)] blur-md filter h-[16px] left-[8px] rounded-[2.28151e+07px] top-[104px] w-[80px]" data-name="Container" />;
}

function Container24() {
  return (
    <div className="absolute h-[111.999px] left-0 top-0 w-[95.999px]" data-name="Container">
      <Icon20 />
      <Container23 />
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute h-[111.999px] left-[125.02px] top-[505.04px] w-[95.999px]" data-name="Container">
      <Container20 />
      <Container21 />
      <Container22 />
      <Container24 />
    </div>
  );
}

function Container26() {
  return <div className="absolute bg-[rgba(255,255,255,0.1)] h-[57.2px] left-[3.4px] opacity-0 top-[3.4px] w-[275.249px]" data-name="Container" />;
}

function Text() {
  return (
    <div className="absolute h-[32px] left-[167.72px] top-0 w-[24.999px]" data-name="Text">
      <p className="absolute font-['Press_Start_2P:Regular',sans-serif] leading-[32px] left-[12px] not-italic text-[24px] text-center text-nowrap text-white top-[0.08px] tracking-[1px] translate-x-[-50%]">→</p>
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute h-[32px] left-[3.4px] top-[16px] w-[275.249px]" data-name="Text">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[28px] left-[120.03px] text-[20px] text-center text-nowrap text-white top-[2.08px] tracking-[1px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        시작하기
      </p>
      <Text />
    </div>
  );
}

function Button() {
  return (
    <div className="bg-gradient-to-b from-[#48d448] h-[64px] relative rounded-[24px] shrink-0 to-[#3db83d] w-full" data-name="Button">
      <div className="overflow-clip relative rounded-[inherit] size-full">
        <Container26 />
        <Text1 />
      </div>
      <div aria-hidden="true" className="absolute border-[3.4px] border-black border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_0px_0px_#2d8b2d,0px_16px_32px_0px_rgba(61,184,61,0.3)]" />
    </div>
  );
}

function Container27() {
  return (
    <div className="h-[64px] relative shrink-0 w-full" data-name="Container">
      <ButtonText text="📍" additionalClassNames="left-0 w-[86.013px]" />
      <ButtonText text="🗺️" additionalClassNames="left-[98.01px] w-[86.023px]" />
      <ButtonText text="🧭" additionalClassNames="left-[196.03px] w-[86.013px]" />
    </div>
  );
}

function Button1() {
  return (
    <Wrapper additionalClassNames="w-[48.425px]">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[20px] left-[24px] text-[#6b9080] text-[14px] text-center text-nowrap top-[-0.28px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        이용안내
      </p>
    </Wrapper>
  );
}

function Text2() {
  return (
    <Wrapper additionalClassNames="w-[6.629px]">
      <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[20px] left-0 not-italic text-[#6b9080] text-[14px] text-nowrap top-[0.36px] tracking-[-0.1504px]">•</p>
    </Wrapper>
  );
}

function Button2() {
  return (
    <Wrapper additionalClassNames="w-[96.839px]">
      <p className="absolute font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[20px] left-[48px] text-[#6b9080] text-[14px] text-center text-nowrap top-[-0.28px] translate-x-[-50%]" style={{ fontVariationSettings: "'wght' 400" }}>
        개인정보처리방침
      </p>
    </Wrapper>
  );
}

function Container28() {
  return (
    <div className="h-[19.995px] relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex gap-[16px] items-center justify-center pl-0 pr-[0.011px] py-0 relative size-full">
          <Button1 />
          <Text2 />
          <Button2 />
        </div>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[19.995px] h-[219.983px] items-start left-[32px] top-[632.66px] w-[282.049px]" data-name="Container">
      <Button />
      <Container27 />
      <Container28 />
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute h-[852.649px] left-0 top-0 w-[346.049px]" data-name="Container">
      <Container19 />
      <Container25 />
      <Container29 />
    </div>
  );
}

function CrystalForestWelcome() {
  return (
    <div className="bg-gradient-to-b from-[#c5e7f5] h-[852.649px] overflow-clip relative shrink-0 to-white via-1/2 w-full" data-name="CrystalForestWelcome">
      <Container />
      <Container1 />
      <Container2 />
      <Container15 />
      <Container30 />
    </div>
  );
}

function Container31() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0)] h-[851.99px] left-[16px] rounded-[40px] top-0 w-[361.007px]" data-name="Container">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[7.479px] relative rounded-[inherit] size-full">
        <CrystalForestWelcome />
      </div>
      <div aria-hidden="true" className="absolute border-[#1a1a2e] border-[7.479px] border-solid inset-0 pointer-events-none rounded-[40px] shadow-[0px_0px_0px_4px_#4ecca3,0px_30px_80px_0px_rgba(78,204,163,0.5),0px_0px_60px_0px_rgba(78,204,163,0.3)]" />
    </div>
  );
}

export default function CuteGameConceptMapApp() {
  return (
    <div className="bg-[rgba(10,10,15,0)] relative size-full" data-name="Cute Game Concept Map App">
      <Container31 />
    </div>
  );
}