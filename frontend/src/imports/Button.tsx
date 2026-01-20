function Text() {
  return (
    <div className="h-[20.997px] relative shrink-0 w-[83.987px]" data-name="Text">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[21px] left-[42px] not-italic text-[14px] text-center text-white top-[-0.63px] translate-x-[-50%] whitespace-nowrap">Log out</p>
      </div>
    </div>
  );
}

function LogoutButton({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick} className="bg-[#e02f2c] content-stretch flex flex-col items-start px-[130.366px] py-[25.366px] relative rounded-[16px] w-full hover:bg-[#c72825] active:bg-[#b01f1d] transition-colors cursor-pointer" data-name="Button">
      <div aria-hidden="true" className="absolute border-[3.366px] border-black border-solid inset-0 pointer-events-none rounded-[16px] shadow-[6px_6px_0px_0px_black]" />
      <Text />
    </button>
  );
}

export { LogoutButton };

export default LogoutButton;