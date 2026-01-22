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
    <button
      onClick={onClick}
      className="content-stretch flex flex-col items-center justify-center px-[130.366px] py-[25.366px] relative rounded-full w-full transition-all cursor-pointer"
      data-name="Button"
      style={{
        background: "black",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(0,0,0,0.85)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "black";
      }}
    >
      <Text />
    </button>
  );
}

export { LogoutButton };

export default LogoutButton;
