function Paragraph() {
  return (
    <div className="h-[42.004px] relative shrink-0 w-[28.276px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[42px] left-0 not-italic text-[#0a0a0a] text-[28px] top-[0.04px] tracking-[0.3828px]">☕</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="bg-gradient-to-b from-[#ffd93d] relative rounded-[10px] shrink-0 size-[55.995px] to-[#ffed4e]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.346px] pr-[1.357px] py-[1.346px] relative size-full">
        <Paragraph />
      </div>
    </div>
  );
}

function Heading() {
  return <div className="flex-[1_0_0] h-[14.001px] min-h-px min-w-px" data-name="Heading 3" />;
}

function Container1() {
  return (
    <div className="absolute content-stretch flex h-[19.692px] items-start justify-between left-0 top-0 w-[199.458px]" data-name="Container">
      <Heading />
    </div>
  );
}

function Paragraph1() {
  return (
    <div className="absolute h-[11.003px] left-0 overflow-clip top-[27.69px] w-[199.458px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[11px] left-[4.01px] text-[#6b9080] text-[10px] top-[0.31px]">서울 강남구 테헤란로 123</p>
    </div>
  );
}

function Paragraph2() {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[#00d9ff] text-[6px] top-[-0.65px] w-[34px]" style={{ fontVariationSettings: "'wght' 400" }}>
        거리
      </p>
    </div>
  );
}

function Container2() {
  return (
    <div className="absolute bg-[rgba(0,217,255,0.2)] content-stretch flex flex-col h-[19px] items-start left-[0.01px] pb-[1.346px] pt-[5.344px] px-[9.341px] rounded-[4px] top-[47px] w-[28px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#00d9ff] border-[1.346px] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Paragraph2 />
    </div>
  );
}

function Group2() {
  return (
    <div className="absolute contents left-0 top-[10px]">
      <p className="absolute css-ew64yg font-['Wittgenstein:Bold_Italic','Noto_Sans_KR:Bold',sans-serif] font-bold italic leading-[14px] left-[4.01px] text-[20px] text-black top-[10px]">스타벅스 강남점</p>
      <Paragraph1 />
      <Container2 />
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

function Button() {
  return (
    <div className="absolute bg-white content-stretch flex items-center justify-center left-[175.01px] p-[2.693px] rounded-[14px] size-[48px] top-[14px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[4px_4px_0px_0px_black]" />
      <Paragraph3 />
    </div>
  );
}

function Group() {
  return (
    <div className="absolute contents left-[175.01px] top-[14px]">
      <Button />
    </div>
  );
}

function Container3() {
  return (
    <div className="flex-[1_0_0] h-[66.377px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <Container1 />
        <Group2 />
        <Group />
      </div>
    </div>
  );
}

function Paragraph4() {
  return <div className="h-[17.999px] shrink-0 w-[12.003px]" data-name="Paragraph" />;
}

function Container4() {
  return (
    <div className="absolute content-stretch flex gap-[16px] h-[67px] items-start left-[19.6px] top-[18.89px] w-[314px]" data-name="Container">
      <Container />
      <Container3 />
      <Paragraph4 />
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white h-[105.11px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[3.366px] border-black border-solid inset-0 pointer-events-none rounded-[12px] shadow-[4px_4px_0px_0px_black]" />
      <Container4 />
    </div>
  );
}

function Paragraph5() {
  return (
    <div className="h-[42.004px] relative shrink-0 w-[28.276px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[42px] left-0 not-italic text-[#0a0a0a] text-[28px] top-[0.04px] tracking-[0.3828px]">🏠</p>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="bg-gradient-to-b from-[#ffd93d] relative rounded-[10px] shrink-0 size-[55.995px] to-[#ffed4e]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.346px] pr-[1.357px] py-[1.346px] relative size-full">
        <Paragraph5 />
      </div>
    </div>
  );
}

function Paragraph6() {
  return <div className="h-[17.999px] shrink-0 w-[12.003px]" data-name="Paragraph" />;
}

function Container6() {
  return (
    <div className="absolute content-stretch flex gap-[16px] h-[66px] items-start left-[19.6px] top-[19.78px] w-[249px]" data-name="Container">
      <Container5 />
      <Paragraph6 />
    </div>
  );
}

function Paragraph7() {
  return (
    <div className="h-[48px] relative shrink-0 w-[32.315px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[48px] left-0 not-italic text-[#0a0a0a] text-[32px] top-[-0.29px] tracking-[0.4063px]">⭐</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="absolute bg-white content-stretch flex h-[47px] items-center justify-center left-[270.6px] p-[2.693px] rounded-[14px] top-[27.78px] w-[48px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[4px_4px_0px_0px_black]" />
      <Paragraph7 />
    </div>
  );
}

function Heading1() {
  return <div className="flex-[1_0_0] h-[14.001px] min-h-px min-w-px" data-name="Heading 3" />;
}

function Paragraph8() {
  return (
    <div className="col-1 h-[11.003px] ml-0 mt-[17.69px] overflow-clip relative row-1 w-[199.458px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[11px] left-[4.01px] text-[#6b9080] text-[10px] top-[0.31px]">서울 강남구 테헤란로 123</p>
    </div>
  );
}

function Paragraph9() {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[#00d9ff] text-[6px] top-[-0.65px] w-[34px]" style={{ fontVariationSettings: "'wght' 400" }}>
        거리
      </p>
    </div>
  );
}

function Container7() {
  return (
    <div className="bg-[rgba(0,217,255,0.2)] col-1 content-stretch flex flex-col h-[19px] items-start ml-[0.01px] mt-[37px] pb-[1.346px] pt-[5.344px] px-[9.341px] relative rounded-[4px] row-1 w-[28px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#00d9ff] border-[1.346px] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Paragraph9 />
    </div>
  );
}

function Group3() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <p className="col-1 css-ew64yg font-['Wittgenstein:Bold_Italic','Noto_Sans_KR:Bold',sans-serif] font-bold italic leading-[14px] ml-[4.01px] mt-0 relative row-1 text-[20px] text-black">스타벅스 강남점</p>
      <Paragraph8 />
      <Container7 />
    </div>
  );
}

function Container8() {
  return (
    <div className="absolute content-stretch flex h-[19.692px] items-start justify-between left-[90.6px] top-[23.78px] w-[199.458px]" data-name="Container">
      <Heading1 />
      <Group3 />
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-white h-[105.11px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[3.366px] border-black border-solid inset-0 pointer-events-none rounded-[12px] shadow-[4px_4px_0px_0px_black]" />
      <Container6 />
      <Button2 />
      <Container8 />
    </div>
  );
}

function Paragraph10() {
  return (
    <div className="h-[42.004px] relative shrink-0 w-[28.276px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[42px] left-0 not-italic text-[#0a0a0a] text-[28px] top-[0.04px] tracking-[0.3828px]">🏢</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="bg-gradient-to-b from-[#ffd93d] relative rounded-[10px] shrink-0 size-[55.995px] to-[#ffed4e]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.346px] pr-[1.357px] py-[1.346px] relative size-full">
        <Paragraph10 />
      </div>
    </div>
  );
}

function Paragraph11() {
  return (
    <div className="col-1 h-[11.003px] ml-0 mt-[17.69px] overflow-clip relative row-1 w-[161.006px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[11px] left-[4.01px] text-[#6b9080] text-[10px] top-[0.31px]">서울 강남구 테헤란로 123</p>
    </div>
  );
}

function Paragraph12() {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[#00d9ff] text-[6px] top-[-0.65px] w-[34px]" style={{ fontVariationSettings: "'wght' 400" }}>
        거리
      </p>
    </div>
  );
}

function Container10() {
  return (
    <div className="bg-[rgba(0,217,255,0.2)] col-1 content-stretch flex flex-col h-[19px] items-start ml-[0.01px] mt-[37px] pb-[1.346px] pt-[5.344px] px-[9.341px] relative rounded-[4px] row-1 w-[22.602px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#00d9ff] border-[1.346px] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Paragraph12 />
    </div>
  );
}

function Group5() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <p className="col-1 css-4hzbpn font-['Wittgenstein:Bold_Italic','Noto_Sans_KR:Bold',sans-serif] font-bold italic leading-[14px] ml-[3.23px] mt-0 relative row-1 text-[20px] text-black w-[107.36px]">인천대학교</p>
      <Paragraph11 />
      <Container10 />
    </div>
  );
}

function Paragraph13() {
  return (
    <div className="h-[48px] relative shrink-0 w-[32.315px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[48px] left-0 not-italic text-[#0a0a0a] text-[32px] top-[-0.29px] tracking-[0.4063px]">⭐</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="bg-white col-1 content-stretch flex items-center justify-center ml-0 mt-0 p-[2.693px] relative rounded-[14px] row-1 size-[48px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[4px_4px_0px_0px_black]" />
      <Paragraph13 />
    </div>
  );
}

function Group1() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <Button4 />
    </div>
  );
}

function Container11() {
  return (
    <div className="absolute content-stretch flex gap-[16px] h-[66px] items-start left-[20.6px] top-[19.67px] w-[218px]" data-name="Container">
      <Container9 />
      <Group5 />
      <Group1 />
    </div>
  );
}

function Button5() {
  return (
    <div className="bg-white h-[105.11px] relative rounded-[12px] shrink-0 w-full" data-name="Button">
      <div aria-hidden="true" className="absolute border-[3.366px] border-black border-solid inset-0 pointer-events-none rounded-[12px] shadow-[4px_4px_0px_0px_black]" />
      <Container11 />
    </div>
  );
}

function Paragraph14() {
  return (
    <div className="h-[42.004px] relative shrink-0 w-[28.276px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[42px] left-0 not-italic text-[#0a0a0a] text-[28px] top-[0.04px] tracking-[0.3828px]">💪</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="bg-gradient-to-b from-[#ffd93d] relative rounded-[10px] shrink-0 size-[55.995px] to-[#ffed4e]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[1.346px] border-black border-solid inset-0 pointer-events-none rounded-[10px]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pl-[1.346px] pr-[1.357px] py-[1.346px] relative size-full">
        <Paragraph14 />
      </div>
    </div>
  );
}

function Paragraph15() {
  return <div className="h-[17.999px] shrink-0 w-[12.003px]" data-name="Paragraph" />;
}

function Paragraph16() {
  return (
    <div className="col-1 h-[11.003px] ml-[0.41px] mt-[17.12px] overflow-clip relative row-1 w-[199.458px]" data-name="Paragraph">
      <p className="absolute css-ew64yg font-['Wittgenstein:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[11px] left-0 text-[#6b9080] text-[10px] top-0">서울 강남구 테헤란로 123</p>
    </div>
  );
}

function Paragraph17() {
  return (
    <div className="h-[9.005px] relative shrink-0 w-full" data-name="Paragraph">
      <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular','Noto_Sans_KR:Regular',sans-serif] leading-[9px] left-0 text-[#00d9ff] text-[6px] top-[-0.65px] w-[34px]" style={{ fontVariationSettings: "'wght' 400" }}>
        거리
      </p>
    </div>
  );
}

function Container13() {
  return (
    <div className="bg-[rgba(0,217,255,0.2)] col-1 content-stretch flex flex-col h-[19px] items-start ml-[0.41px] mt-[31.12px] pb-[1.346px] pt-[5.344px] px-[9.341px] relative rounded-[4px] row-1 w-[28px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#00d9ff] border-[1.346px] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <Paragraph17 />
    </div>
  );
}

function Group6() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <p className="col-1 css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[48px] ml-[10.59px] mt-[373.41px] not-italic relative row-1 text-[#0a0a0a] text-[32px] tracking-[0.4063px]">⭐</p>
      <p className="col-1 css-ew64yg font-['Wittgenstein:Bold_Italic','Noto_Sans_KR:Bold',sans-serif] font-bold italic leading-[14px] ml-0 mt-0 relative row-1 text-[20px] text-black">부평 헬스장</p>
      <Paragraph16 />
      <Container13 />
    </div>
  );
}

function Container14() {
  return (
    <div className="absolute content-stretch flex gap-[5px] items-start left-[16.23px] top-[16.19px] w-[243px]" data-name="Container">
      <Container12 />
      <Paragraph15 />
      <Group6 />
    </div>
  );
}

function Button6() {
  return (
    <div className="bg-white border-[3.366px] border-black border-solid col-1 h-[105.11px] ml-0 mt-0 relative rounded-[12px] row-1 shadow-[4px_4px_0px_0px_black] w-[338.187px]" data-name="Button">
      <Container14 />
    </div>
  );
}

function Paragraph18() {
  return (
    <div className="h-[48px] relative shrink-0 w-[32.315px]" data-name="Paragraph">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute css-ew64yg font-['Inter:Regular',sans-serif] font-normal leading-[48px] left-0 not-italic text-[#0a0a0a] text-[32px] top-[-0.29px] tracking-[0.4063px]">⭐</p>
      </div>
    </div>
  );
}

function Button7() {
  return (
    <div className="bg-white col-1 content-stretch flex items-center justify-center ml-[269.6px] mt-[26.27px] p-[2.693px] relative rounded-[14px] row-1 size-[48px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[4px_4px_0px_0px_black]" />
      <Paragraph18 />
    </div>
  );
}

function Group4() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid items-[start] justify-items-[start] leading-[0] relative shrink-0">
      <Button6 />
      <Button7 />
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] h-[976.87px] items-start relative shrink-0 w-full" data-name="Container">
      <Button1 />
      <Button3 />
      <Button5 />
      <Group4 />
    </div>
  );
}

function Container16() {
  return (
    <div className="absolute content-stretch flex flex-col h-[752px] items-start left-[-0.41px] overflow-clip pb-0 pt-[23.995px] px-[19.997px] top-[65.59px] w-[379px]" data-name="Container">
      <Container15 />
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

function Button8() {
  return (
    <div className="absolute bg-white content-stretch flex items-center justify-center left-[314.59px] pl-[2.693px] pr-[2.704px] py-[2.693px] rounded-[14px] size-[39.995px] top-[17.59px]" data-name="Button">
      <div aria-hidden="true" className="absolute border-[2.693px] border-black border-solid inset-0 pointer-events-none rounded-[14px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.3)]" />
      <Text />
    </div>
  );
}

function Group7() {
  return (
    <div className="absolute contents left-[31.59px] top-[17.59px]">
      <div className="absolute bg-white border-2 border-black border-solid h-[42px] left-[31.59px] rounded-[16px] top-[17.59px] w-[273px]" />
      <div className="absolute left-[44.59px] size-[44px] top-[17.59px]" data-name="star 1" />
      <p className="absolute css-4hzbpn font-['Wittgenstein:Bold_Italic','Noto_Sans_KR:Bold',sans-serif] font-bold italic leading-[14px] left-[115.59px] text-[20px] text-black top-[34.59px] w-[100px]">자주 가는 곳</p>
    </div>
  );
}

function FavoritePlacesPage() {
  return (
    <div className="h-[838px] overflow-clip relative shrink-0 w-[388px]" data-name="FavoritePlacesPage" style={{ backgroundImage: "linear-gradient(179.939deg, rgb(218, 244, 255) 56.004%, rgb(255, 255, 255) 99.975%)" }}>
      <Container16 />
      <Button8 />
      <Group7 />
    </div>
  );
}

function Container17() {
  return (
    <div className="bg-[rgba(0,217,255,0.2)] h-[19.692px] relative rounded-[4px] shrink-0 w-[58.256px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[#00d9ff] border-[1.346px] border-solid inset-0 pointer-events-none rounded-[4px]" />
    </div>
  );
}

export default function Favorites() {
  return (
    <div className="bg-white relative rounded-[40px] size-full" data-name="favorites">
      <div className="content-stretch flex flex-col items-start overflow-clip p-[7.406px] relative rounded-[inherit] size-full">
        <FavoritePlacesPage />
        <Container17 />
      </div>
      <div aria-hidden="true" className="absolute border-[#1a1a2e] border-[7.406px] border-solid inset-0 pointer-events-none rounded-[40px] shadow-[0px_0px_0px_4px_#4ecca3,0px_30px_80px_0px_rgba(78,204,163,0.5),0px_0px_60px_0px_rgba(78,204,163,0.3)]" />
    </div>
  );
}