import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import imgCharacterGreenFront1 from "@/assets/character-green-front.png";
import imgCharacterYellowFront1 from "@/assets/character-yellow-front.png";
import imgCharacterPurpleFront1 from "@/assets/character-purple-front.png";
import imgTerrainGrassHorizontalMiddle10 from "@/assets/terrain-grass-horizontal-middle.png";
import imgBeeA1 from "@/assets/bee.png";
import authService from "@/services/authService";

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // 이메일 형식 검증
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 회원가입 처리
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 필수 필드 검증
    if (!email.trim() || !userId.trim() || !password.trim() || !passwordConfirm.trim()) {
      setError("모든 필드를 입력해주세요.");
      return;
    }

    // 이메일 형식 검증
    if (!validateEmail(email)) {
      setError("이메일 형식이 올바르지 않습니다.");
      return;
    }

    // 아이디 길이 검증
    if (userId.length < 4) {
      setError("아이디는 4자 이상이어야 합니다.");
      return;
    }

    // 비밀번호 길이 검증 (백엔드: 최소 8자)
    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    // 비밀번호 확인 검증
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.signup({
        name: userId,
        email: email,
        password: password,
        password_confirm: passwordConfirm,
        nickname: nickname || userId,  // 닉네임 미입력 시 아이디 사용
      });

      if (response.status === "success") {
        alert("회원가입이 완료되었습니다! 로그인해주세요.");
        if (onSignup) {
          onSignup();
        } else {
          navigate("/login");
        }
      } else {
        setError(response.error?.message || "회원가입에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("회원가입 오류:", err);
      setError(err.response?.data?.error?.message || "서버 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
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
    <motion.div
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#c5e7f5] to-white overflow-y-auto"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <style>
        {`
          @font-face {
            font-family: 'DNFBitBitv2';
            src:
              url('/fonts/DNFBitBitv2.otf') format('opentype'),
              url('/fonts/DNFBitBitv2.ttf') format('truetype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }

          @keyframes hb-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }

          @keyframes hb-cloud-drift {
            0% { transform: translateX(-18px); }
            50% { transform: translateX(18px); }
            100% { transform: translateX(-18px); }
          }

          .hb-animate-float { animation: hb-float 3.6s ease-in-out infinite; }
          .hb-cloud-drift { animation: hb-cloud-drift 9s ease-in-out infinite; }
          .hb-cloud-drift-slow { animation: hb-cloud-drift 13s ease-in-out infinite; }

          .hb-cloud {
            position: absolute;
            height: 34px;
            border-radius: 9999px;
            background: rgba(255, 255, 255, 0.7);
            filter: blur(0.2px);
            box-shadow:
              0 6px 14px rgba(0, 0, 0, 0.06),
              inset 0 -3px 0 rgba(255, 255, 255, 0.35);
          }

          .hb-cloud::before,
          .hb-cloud::after {
            content: "";
            position: absolute;
            background: rgba(255, 255, 255, 0.72);
            border-radius: 9999px;
          }

          .hb-cloud::before {
            width: 34px;
            height: 34px;
            left: 18px;
            top: -14px;
          }

          .hb-cloud::after {
            width: 46px;
            height: 46px;
            left: 44px;
            top: -22px;
          }

          .hb-title-outline {
            text-shadow:
              0 2px 0 rgba(255, 255, 255, 0.35),
              2px 3px 0 rgba(0, 0, 0, 0.18),
              0 10px 18px rgba(0, 0, 0, 0.12);
          }

          @media (prefers-reduced-motion: reduce) {
            .hb-animate-float,
            .hb-cloud-drift,
            .hb-cloud-drift-slow {
              animation: none !important;
            }
          }
        `}
      </style>
      {/* 하단 캐릭터와 땅 */}
      <div className="absolute bottom-0 content-stretch flex flex-col h-[200px] md:h-[287px] items-center justify-end left-0 right-0 z-10">
        {/* 캐릭터들 */}
        <div className="h-[110px] md:h-[159px] relative shrink-0 w-full pointer-events-none">
          {/* Distant hills behind characters (like Mobile.tsx) */}
          <svg
            className="absolute inset-x-0 bottom-[10px] h-[90px] w-full pointer-events-none"
            aria-hidden="true"
            viewBox="0 0 390 90"
            preserveAspectRatio="none"
            style={{
              opacity: 0.35,
              filter: "blur(1.5px)",
              maskImage: "linear-gradient(to top, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)",
              WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 45%, rgba(0,0,0,0) 100%)",
            }}
          >
            <path
              d="M0,72 C70,46 120,62 165,50 C220,35 250,44 295,55 C330,64 360,58 390,40 L390,90 L0,90 Z"
              fill="rgba(130, 197, 220, 0.45)"
            />
            <path
              d="M0,80 C75,60 125,74 175,64 C230,54 260,64 305,72 C338,78 365,76 390,68 L390,90 L0,90 Z"
              fill="rgba(130, 197, 220, 0.30)"
            />
          </svg>
          <div className="flex flex-row items-center justify-center size-full pointer-events-none">
            <div className="content-stretch flex items-center justify-center px-[40px] md:px-[60px] relative size-full pointer-events-none">
              <div className="relative shrink-0 size-[110px] md:size-[160.333px] pointer-events-none">
                <img
                  alt="Green Character"
                  className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                  src={imgCharacterGreenFront1}
                />
              </div>
              <div className="relative shrink-0 size-[110px] md:size-[160.333px] pointer-events-none">
                <img
                  alt="Yellow Character"
                  className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                  src={imgCharacterYellowFront1}
                />
              </div>
              <div className="relative shrink-0 size-[110px] md:size-[160.333px] pointer-events-none">
                <img
                  alt="Purple Character"
                  className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                  src={imgCharacterPurpleFront1}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 땅 타일 */}
        <div className="content-stretch flex items-center justify-center relative shrink-0 w-full overflow-hidden">
          {Array.from({ length: 14 }).map((_, index) => (
            <div key={index} className="relative shrink-0 size-[90px] md:size-[128px]">
              <img
                alt=""
                className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                src={imgTerrainGrassHorizontalMiddle10}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Top tint overlay */}
      <div
        className="absolute inset-x-0 top-0 h-[280px] pointer-events-none z-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, rgba(169, 217, 238, 0.55), rgba(255, 255, 255, 0))",
        }}
      />

      {/* Bottom tint overlay */}
      <div
        className="absolute inset-x-0 bottom-0 h-[240px] pointer-events-none z-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to top, rgba(169, 217, 238, 0.16), rgba(255, 255, 255, 0))",
        }}
      />

      {/* Mountains + Clouds background */}
      <div className="absolute inset-0 pointer-events-none z-[-1] overflow-hidden" aria-hidden="true">
        <svg
          aria-hidden="true"
          className="absolute left-0 bottom-0 w-full"
          viewBox="0 0 390 600"
          preserveAspectRatio="xMidYMid slice"
          style={{ height: "100%", minHeight: "600px" }}
        >
          <defs>
            <linearGradient id="signupSkyFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,0.0)" />
              <stop offset="1" stopColor="rgba(255,255,255,0.65)" />
            </linearGradient>

            <linearGradient id="signupM1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="0.45" stopColor="#9fe3c2" stopOpacity="0.75" />
              <stop offset="1" stopColor="#4a9960" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id="signupM2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="0.5" stopColor="#85d6b6" stopOpacity="0.7" />
              <stop offset="1" stopColor="#2d5f3f" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id="signupM3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
              <stop offset="0.55" stopColor="#a8e7cf" stopOpacity="0.62" />
              <stop offset="1" stopColor="#4a9960" stopOpacity="0.16" />
            </linearGradient>

            <filter id="signupSoft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
            <filter id="signupCloudSoft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* clouds */}
          <g filter="url(#signupCloudSoft)" opacity="0.78">
            {/* left cloud cluster */}
            <g className="hb-cloud-drift">
              <g transform="translate(0 0) scale(1.18)">
                <g className="hb-cloud-drift">
                <circle cx="70" cy="90" r="26" fill="#ffffff" />
                <circle cx="98" cy="86" r="20" fill="#ffffff" />
                <circle cx="120" cy="94" r="22" fill="#ffffff" />
                </g>
              </g>
            </g>

            {/* right cloud cluster */}
            <g className="hb-cloud-drift-slow">
              <g transform="translate(0 0) scale(1.12)">
                <g className="hb-cloud-drift-slow">
                <circle cx="300" cy="80" r="22" fill="#ffffff" />
                <circle cx="322" cy="78" r="16" fill="#ffffff" />
                <circle cx="340" cy="86" r="18" fill="#ffffff" />
                </g>
              </g>
            </g>
          </g>

          {/* mountains (layered) - positioned behind signup form */}
          <g filter="url(#signupSoft)" transform="translate(0, 60)">
            <path
              d="M-40 420 C 30 320, 90 250, 150 240 C 210 230, 250 170, 285 120 C 315 80, 345 90, 430 220 L 430 520 L -40 520 Z"
              fill="url(#signupM2)"
            />
            <path
              d="M-40 460 C 20 360, 80 320, 130 310 C 185 300, 210 250, 235 215 C 255 190, 270 190, 295 210 C 330 238, 360 265, 430 320 L 430 520 L -40 520 Z"
              fill="url(#signupM3)"
              opacity="0.95"
            />
            <path
              d="M-40 500 C 10 445, 70 410, 125 400 C 185 388, 240 370, 290 355 C 330 342, 370 346, 430 362 L 430 520 L -40 520 Z"
              fill="url(#signupM1)"
              opacity="0.95"
            />
          </g>

          {/* fade to white at bottom to blend with page */}
          <rect x="0" y="420" width="390" height="220" fill="url(#signupSkyFade)" />
        </svg>
      </div>

      {/* 타이틀 */}
      <p className="absolute hb-title-outline hb-animate-float css-4hzbpn font-['DNFBitBitv2','Press_Start_2P:Regular',sans-serif] leading-[56px] md:leading-[110px] left-0 not-italic right-0 text-[#1f4a2f] text-[52px] md:text-[72px] text-center top-[32px] md:top-[20px] tracking-[0.8px] md:tracking-[3.6px] z-10 pointer-events-none select-none">
        sign up
      </p>

      {/* 벌 이미지 */}
      <div className="absolute right-[20px] md:right-[56px] size-[73px] md:size-[128px] top-[40px] md:top-[100px] pointer-events-none z-10">
        <img
          alt=""
          className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
          src={imgBeeA1}
        />
      </div>

      {/* 회원가입 폼 */}
      <form onSubmit={handleSignup} className="contents">
        {/* 에러 메시지 */}
        {error && (
          <div className="absolute left-1/2 translate-x-[-50%] top-[120px] md:top-[140px] z-30">
            <p className="text-red-500 text-xs md:text-sm font-bold bg-white/90 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-red-200 shadow-sm">
              {error}
            </p>
          </div>
        )}

        {/* 이메일 입력 */}
        <div className="absolute bg-white content-stretch flex h-[56px] md:h-[83px] items-center justify-center left-1/2 p-[4px] md:p-[6px] rounded-[28px] md:rounded-[40.5px] top-[180px] md:top-[240px] translate-x-[-50%] w-[calc(100%-48px)] max-w-[340px] md:w-[602px] z-20">
          <div aria-hidden="true" className="absolute border-[3px] md:border-6 border-black border-solid inset-0 pointer-events-none rounded-[28px] md:rounded-[40.5px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.25)] md:shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            disabled={isLoading}
            className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[56px] md:leading-[90px] relative shrink-0 text-[#767676] text-[14px] md:text-[24px] text-center tracking-[1.5px] md:tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676] disabled:opacity-50"
          />
        </div>

        {/* 아이디 입력 */}
        <div className="absolute bg-white content-stretch flex h-[56px] md:h-[83px] items-center justify-center left-1/2 p-[4px] md:p-[6px] rounded-[28px] md:rounded-[40.5px] top-[250px] md:top-[358px] translate-x-[-50%] w-[calc(100%-48px)] max-w-[340px] md:w-[602px] z-20">
          <div aria-hidden="true" className="absolute border-[3px] md:border-6 border-black border-solid inset-0 pointer-events-none rounded-[28px] md:rounded-[40.5px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.25)] md:shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="아이디 (4자 이상)"
            disabled={isLoading}
            className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[56px] md:leading-[90px] relative shrink-0 text-[#767676] text-[14px] md:text-[24px] text-center tracking-[1.5px] md:tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676] disabled:opacity-50"
          />
        </div>

        {/* 비밀번호 입력 */}
        <div className="absolute bg-white content-stretch flex h-[56px] md:h-[83px] items-center justify-center left-1/2 p-[4px] md:p-[6px] rounded-[28px] md:rounded-[40.5px] top-[320px] md:top-[476px] translate-x-[-50%] w-[calc(100%-48px)] max-w-[340px] md:w-[602px] z-20">
          <div aria-hidden="true" className="absolute border-[3px] md:border-6 border-black border-solid inset-0 pointer-events-none rounded-[28px] md:rounded-[40.5px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.25)] md:shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <input
            type="password"
            name="new-password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (8자 이상)"
            disabled={isLoading}
            className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[56px] md:leading-[90px] relative shrink-0 text-[#767676] text-[14px] md:text-[24px] text-center tracking-[1.5px] md:tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676] disabled:opacity-50"
          />
        </div>

        {/* 비밀번호 확인 입력 */}
        <div className="absolute bg-white content-stretch flex h-[56px] md:h-[83px] items-center justify-center left-1/2 p-[4px] md:p-[6px] rounded-[28px] md:rounded-[40.5px] top-[390px] md:top-[594px] translate-x-[-50%] w-[calc(100%-48px)] max-w-[340px] md:w-[602px] z-20">
          <div aria-hidden="true" className="absolute border-[3px] md:border-6 border-black border-solid inset-0 pointer-events-none rounded-[28px] md:rounded-[40.5px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.25)] md:shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <input
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="비밀번호 확인"
            disabled={isLoading}
            className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[56px] md:leading-[90px] relative shrink-0 text-[#767676] text-[14px] md:text-[24px] text-center tracking-[1.5px] md:tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676] disabled:opacity-50"
          />
        </div>

        {/* 닉네임 입력 */}
        <div className="absolute bg-white content-stretch flex h-[56px] md:h-[83px] items-center justify-center left-1/2 p-[4px] md:p-[6px] rounded-[28px] md:rounded-[40.5px] top-[460px] md:top-[712px] translate-x-[-50%] w-[calc(100%-48px)] max-w-[340px] md:w-[602px] z-20">
          <div aria-hidden="true" className="absolute border-[3px] md:border-6 border-black border-solid inset-0 pointer-events-none rounded-[28px] md:rounded-[40.5px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.25)] md:shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <input
            type="text"
            name="nickname"
            autoComplete="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 (선택)"
            disabled={isLoading}
            className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[56px] md:leading-[90px] relative shrink-0 text-[#767676] text-[14px] md:text-[24px] text-center tracking-[1.5px] md:tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676] disabled:opacity-50"
          />
        </div>

        {/* Sign up 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="absolute bg-[#4a9960] top-[540px] md:top-[830px] content-stretch flex h-[56px] md:h-[83px] items-center justify-center left-1/2 p-[4px] md:p-[6px] rounded-[28px] md:rounded-[40.5px] translate-x-[-50%] w-[calc(100%-48px)] max-w-[340px] md:w-[602px] hover:bg-[#3d8050] active:translate-y-[1px] md:active:translate-y-[2px] transition-all z-20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div aria-hidden="true" className="absolute border-[3px] md:border-6 border-black border-solid inset-0 pointer-events-none rounded-[28px] md:rounded-[40.5px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.25)] md:shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[56px] md:leading-[90px] not-italic relative shrink-0 text-[14px] md:text-[24px] text-center text-white tracking-[1.5px] md:tracking-[3.6px]">
            {isLoading ? "Loading..." : "sign up"}
          </p>
        </button>
      </form>

      {/* 이미 계정이 있으신가요? 로그인 */}
      <div className="absolute left-1/2 translate-x-[-50%] top-[620px] md:top-[920px] flex flex-col items-center gap-[8px] z-20 pb-8">
        <p className="css-4hzbpn font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-medium leading-[18px] text-[#1f4a2f] text-[12px] text-center opacity-60 tracking-[0.2px] whitespace-nowrap">
          이미 계정이 있으신가요?{" "}
          <button
            type="button"
            onClick={handleLogin}
            className="text-[#4a9960] hover:opacity-80 transition-opacity inline font-medium"
          >
            로그인
          </button>
        </p>
      </div>
    </motion.div>
  );
}
