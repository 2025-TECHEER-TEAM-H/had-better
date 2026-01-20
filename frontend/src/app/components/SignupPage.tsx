import { useState } from "react";
import { useNavigate } from "react-router-dom";
import imgTerrainGrassHorizontalMiddle10 from "@/assets/terrain-grass-horizontal-middle.png";
import imgBeeA1 from "@/assets/bee.png";

interface SignupPageProps {
  isOpen?: boolean;
  onSignup?: () => void;
  onLogin?: () => void;
}

export function SignupPage({ isOpen = true, onSignup, onLogin }: SignupPageProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [emailError, setEmailError] = useState("");

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = () => {
    // 이메일 형식 검증
    if (!validateEmail(email)) {
      setEmailError("이메일 형식에 맞지 않습니다");
      return;
    }

    setEmailError("");
    // 여기서 실제 회원가입 로직 처리
    alert("회원가입이 완료되었습니다!");
    if (onSignup) {
      onSignup();
    } else {
      navigate("/search");
    }
  };

  const handleLogin = () => {
    if (onLogin) {
      onLogin();
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#c5e7f5] to-white">
      {/* 하단 캐릭터와 땅 - 맨 뒤 레이어 */}
      <div className="absolute bottom-0 content-stretch flex flex-col h-[268px] md:h-[287px] items-center justify-end left-0 right-0 pointer-events-none z-0">
        {/* 캐릭터들 영역 (비어있음) */}
        <div className="h-[159px] relative shrink-0 w-full pointer-events-none">
          <div className="flex flex-row items-center justify-center size-full pointer-events-none">
            <div className="size-full" />
          </div>
        </div>

        {/* 땅 타일 */}
        <div className="content-stretch flex items-center justify-center relative shrink-0 w-full overflow-hidden">
          {Array.from({ length: 14 }).map((_, index) => (
            <div key={index} className="relative shrink-0 size-[128px]">
              <img
                alt=""
                className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                src={imgTerrainGrassHorizontalMiddle10}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 타이틀 */}
      <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] leading-[60px] md:leading-[110px] left-0 not-italic right-0 text-[#1f4a2f] text-[32px] md:text-[72px] text-center top-[97px] md:top-[80px] tracking-[3.6px] z-10">
        sign up
      </p>

      {/* 벌 이미지 */}
      <div className="absolute right-[20px] md:right-[56px] size-[73px] md:size-[128px] top-[97px] md:top-[160px] pointer-events-none z-10">
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          src={imgBeeA1}
        />
      </div>

      {/* 이메일 입력 */}
      <div className="absolute bg-white content-stretch flex h-[57.243px] md:h-[73.29px] items-center justify-center left-1/2 p-[6px] rounded-[40.5px] top-[207px] md:top-[215px] translate-x-[-50%] w-[276.706px] md:w-[531.571px] z-20">
        <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError("");
          }}
          placeholder="이메일"
          className="css-ew64yg font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[90px] relative shrink-0 text-[#767676] text-[16px] md:text-[24px] text-center tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676]"
        />
      </div>

      {/* 이메일 에러 메시지 */}
      {emailError && (
        <p className="absolute left-1/2 translate-x-[-50%] top-[270px] md:top-[295px] text-red-500 text-[12px] font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] z-20">
          {emailError}
        </p>
      )}

      {/* 아이디 입력 */}
      <div className="absolute bg-white content-stretch flex h-[57.243px] md:h-[73.29px] items-center justify-center left-1/2 p-[6px] rounded-[40.5px] top-[281.55px] md:top-[310.71px] translate-x-[-50%] w-[276.706px] md:w-[531.571px] z-20">
        <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="아이디"
          className="css-ew64yg font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[90px] relative shrink-0 text-[#767676] text-[16px] md:text-[24px] text-center tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676]"
        />
      </div>

      {/* 비밀번호 입력 */}
      <div className="absolute bg-white content-stretch flex h-[57.243px] md:h-[73.29px] items-center justify-center left-1/2 p-[6px] rounded-[40.5px] top-[356.1px] md:top-[406.42px] translate-x-[-50%] w-[276.706px] md:w-[531.571px] z-20">
        <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          className="css-ew64yg font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[90px] relative shrink-0 text-[#767676] text-[16px] md:text-[24px] text-center tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676]"
        />
      </div>

      {/* 비밀번호 확인 입력 */}
      <div className="absolute bg-white content-stretch flex h-[57.243px] md:h-[73.29px] items-center justify-center left-1/2 p-[6px] rounded-[40.5px] top-[430.65px] md:top-[502.13px] translate-x-[-50%] w-[276.706px] md:w-[531.571px] z-20">
        <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
        <input
          type="password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          placeholder="비밀번호 확인"
          className="css-ew64yg font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[90px] relative shrink-0 text-[#767676] text-[16px] md:text-[24px] text-center tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676]"
        />
      </div>

      {/* 닉네임 입력 */}
      <div className="absolute bg-white content-stretch flex h-[57.243px] md:h-[73.29px] items-center justify-center left-1/2 p-[6px] rounded-[40.5px] top-[505.2px] md:top-[597.84px] translate-x-[-50%] w-[276.706px] md:w-[531.571px] z-20">
        <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder="닉네임"
          className="css-ew64yg font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[90px] relative shrink-0 text-[#767676] text-[16px] md:text-[24px] text-center tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676]"
        />
      </div>

      {/* Sign up 버튼 */}
      <button
        onClick={handleSignup}
        className="absolute bg-[#4a9960] content-stretch flex h-[57.243px] md:h-[73.29px] items-center justify-center left-1/2 p-[6px] rounded-[40.5px] top-[579.75px] md:top-[693.55px] translate-x-[-50%] w-[276.706px] md:w-[531.571px] hover:bg-[#3d8050] active:translate-y-[2px] transition-all z-20"
      >
        <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
        <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[90px] not-italic relative shrink-0 text-[16px] md:text-[24px] text-center text-white tracking-[3.6px]">
          sign up
        </p>
      </button>

      {/* 이미 계정이 있으신가요? 로그인 */}
      <div className="absolute left-1/2 translate-x-[-50%] top-[653px] md:top-[789px] flex flex-col items-center gap-[8px] z-20">
        <p className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[90px] text-[#767676] text-[16px] md:text-[24px] text-center tracking-[3.6px] whitespace-nowrap">
          이미 계정이 있으신가요?{" "}
          <button
            onClick={handleLogin}
            className="text-[rgb(95,92,239)] hover:opacity-80 transition-opacity inline font-bold text-[20px]"
          >
            로그인
          </button>
        </p>
      </div>
    </div>
  );
}