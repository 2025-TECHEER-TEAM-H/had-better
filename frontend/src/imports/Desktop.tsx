import imgCharacterGreenFront1 from "@/assets/character-green-front.png";
import imgCharacterYellowFront1 from "@/assets/character-yellow-front.png";
import imgCharacterPurpleFront1 from "@/assets/character-purple-front.png";
import imgTerrainGrassHorizontalMiddle10 from "@/assets/terrain-grass-horizontal-middle.png";
import imgGemBlue1 from "@/assets/gem-blue.png";
import imgStar1 from "@/assets/star.png";

function Frame() {
  return (
    <div className="h-[159px] relative shrink-0 w-full">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[60px] py-[117px] relative size-full">
          <div className="relative shrink-0 size-[160.333px]" data-name="character_green_front 1">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgCharacterGreenFront1} />
          </div>
          <div className="relative shrink-0 size-[160.333px]" data-name="character_yellow_front 1">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgCharacterYellowFront1} />
          </div>
          <div className="relative shrink-0 size-[160.333px]" data-name="character_purple_front 1">
            <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgCharacterPurpleFront1} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[1184px]">
      <div className="relative shrink-0 size-[128px]" data-name="terrain_grass_horizontal_middle 10">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[128px]" data-name="terrain_grass_horizontal_middle 9">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[128px]" data-name="terrain_grass_horizontal_middle 8">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[128px]" data-name="terrain_grass_horizontal_middle 7">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[128px]" data-name="terrain_grass_horizontal_middle 6">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[128px]" data-name="terrain_grass_horizontal_middle 4">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[128px]" data-name="terrain_grass_horizontal_middle 2">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[128px]" data-name="terrain_grass_horizontal_middle 3">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[128px]" data-name="terrain_grass_horizontal_middle 5">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[128px]" data-name="terrain_grass_horizontal_middle 11">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[128px]" data-name="terrain_grass_horizontal_middle 12">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[128px]" data-name="terrain_grass_horizontal_middle 13">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
      <div className="relative shrink-0 size-[128px]" data-name="terrain_grass_horizontal_middle 14">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={imgTerrainGrassHorizontalMiddle10} />
      </div>
    </div>
  );
}

function Frame3() {
  return (
    <div className="absolute bottom-0 content-stretch flex flex-col h-[287px] items-center justify-end left-0 right-0">
      <Frame />
      <Frame1 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute bg-[#4a9960] content-stretch flex h-[83px] items-center justify-center left-1/2 p-[6px] rounded-[40.5px] top-[350px] translate-x-[-50%] w-[602px]">
      <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
      <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[90px] not-italic relative shrink-0 text-[24px] text-center text-white tracking-[3.6px]">start</p>
    </div>
  );
}

export default function Desktop() {
  return (
    <div className="bg-gradient-to-b from-[#c5e7f5] relative size-full to-white" data-name="Desktop">
      <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] leading-[110px] left-1/2 not-italic text-[#1f4a2f] text-[72px] text-center top-[100px] tracking-[3.6px] translate-x-[-50%] w-[1280px]">
        HAD
        <br aria-hidden="true" />
        BETTER
      </p>
      <Frame3 />
      <Frame2 />
      <p className="absolute css-4hzbpn font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-normal leading-[normal] left-0 not-italic right-0 text-[20px] text-black text-center top-[450px]">선택 경로 실시간 비교</p>
      <div className="absolute flex items-center justify-center left-[231.89px] size-[122.213px] top-[264.89px]" style={{ "--transform-inner-width": "128", "--transform-inner-height": "131.75" } as React.CSSProperties}>
        <div className="flex-none rotate-[335.062deg]">
        
        </div>
      </div>
  
    </div>
  );
}