import { useState } from "react";
import { useNavigate } from "react-router-dom";
import imgCharacterGreenFront1 from "@/assets/character-green-front.png";
import imgCharacterYellowFront1 from "@/assets/character-yellow-front.png";
import imgCharacterPurpleFront1 from "@/assets/character-purple-front.png";
import imgTerrainGrassHorizontalMiddle10 from "@/assets/terrain-grass-horizontal-middle.png";
import imgStar from "@/assets/star.png";
import { useAuthStore } from "@/stores/authStore";
import authService from "@/services/authService";

interface LoginPageProps {
  isOpen?: boolean;
  onLogin?: () => void;
  onSignup?: () => void;
}

export function LoginPage({ isOpen = true, onLogin, onSignup }: LoginPageProps) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // 로그인 처리
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId.trim() || !password.trim()) {
      setError("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login({
        name: userId,
        password: password,
      });

      if (response.status === "success" && response.data) {
        // 인증 상태 저장 (로그인 유지 체크 여부 전달)
        setAuth(
          {
            id: response.data.user.id,
            name: response.data.user.name,
            email: response.data.user.email,
            nickname: response.data.user.nickname,
            created_at: response.data.user.created_at,
            updated_at: response.data.user.updated_at,
          },
          response.data.tokens,
          keepLoggedIn
        );

        if (onLogin) {
          onLogin();
        } else {
          navigate("/search");
        }
      } else {
        setError(response.error?.message || "로그인에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("로그인 오류:", err);
      setError(err.response?.data?.error?.message || "서버 연결에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = () => {
    if (onSignup) {
      onSignup();
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#c5e7f5] to-white">
      <style>
        {`
          @keyframes hb-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }

          @keyframes hb-cloud-drift {
            0% { transform: translateX(-18px); }
            50% { transform: translateX(18px); }
            100% { transform: translateX(-18px); }
          }

          @keyframes hb-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes hb-bounce {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
          }

          @keyframes hb-float-slow {
            0%, 100% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-8px) translateX(5px); }
            50% { transform: translateY(-12px) translateX(0); }
            75% { transform: translateY(-8px) translateX(-5px); }
          }

          @keyframes hb-shimmer {
            0% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
            100% { opacity: 0.6; transform: scale(1); }
          }

          .hb-animate-float { animation: hb-float 3.6s ease-in-out infinite; }
          .hb-cloud-drift { animation: hb-cloud-drift 9s ease-in-out infinite; }
          .hb-cloud-drift-slow { animation: hb-cloud-drift 13s ease-in-out infinite; }
          .hb-spin { animation: hb-spin 3s linear infinite; }
          .hb-bounce { animation: hb-bounce 2s ease-in-out infinite; }
          .hb-float-slow { animation: hb-float-slow 4s ease-in-out infinite; }
          .hb-shimmer { animation: hb-shimmer 2.5s ease-in-out infinite; }

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
            .hb-cloud-drift-slow,
            .hb-spin,
            .hb-bounce,
            .hb-float-slow,
            .hb-shimmer {
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

      {/* 배경 장식 요소들 (심플하게) */}
      <div className="absolute inset-0 pointer-events-none z-[5] overflow-hidden">
        {/* 별 2개만 */}
        <img
          src={imgStar}
          alt=""
          className="absolute top-[20%] left-[12%] w-[20px] md:w-[28px] h-[20px] md:h-[28px] opacity-60 hb-shimmer"
          style={{ animationDelay: "0s" }}
        />
        <img
          src={imgStar}
          alt=""
          className="absolute top-[25%] right-[15%] w-[18px] md:w-[26px] h-[18px] md:h-[26px] opacity-60 hb-shimmer"
          style={{ animationDelay: "1.5s" }}
        />
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
            <linearGradient id="loginSkyFade" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,0.0)" />
              <stop offset="1" stopColor="rgba(255,255,255,0.65)" />
            </linearGradient>

            <linearGradient id="loginM1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="0.45" stopColor="#9fe3c2" stopOpacity="0.75" />
              <stop offset="1" stopColor="#4a9960" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id="loginM2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="0.5" stopColor="#85d6b6" stopOpacity="0.7" />
              <stop offset="1" stopColor="#2d5f3f" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id="loginM3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.92" />
              <stop offset="0.55" stopColor="#a8e7cf" stopOpacity="0.62" />
              <stop offset="1" stopColor="#4a9960" stopOpacity="0.16" />
            </linearGradient>

            <filter id="loginSoft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
            <filter id="loginCloudSoft" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>

          {/* clouds */}
          <g filter="url(#loginCloudSoft)" opacity="0.78">
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

          {/* mountains (layered) - positioned behind login form */}
          <g filter="url(#loginSoft)" transform="translate(0, 60)">
            <path
              d="M-40 420 C 30 320, 90 250, 150 240 C 210 230, 250 170, 285 120 C 315 80, 345 90, 430 220 L 430 520 L -40 520 Z"
              fill="url(#loginM2)"
            />
            <path
              d="M-40 460 C 20 360, 80 320, 130 310 C 185 300, 210 250, 235 215 C 255 190, 270 190, 295 210 C 330 238, 360 265, 430 320 L 430 520 L -40 520 Z"
              fill="url(#loginM3)"
              opacity="0.95"
            />
            <path
              d="M-40 500 C 10 445, 70 410, 125 400 C 185 388, 240 370, 290 355 C 330 342, 370 346, 430 362 L 430 520 L -40 520 Z"
              fill="url(#loginM1)"
              opacity="0.95"
            />
          </g>

          {/* fade to white at bottom to blend with page */}
          <rect x="0" y="420" width="390" height="220" fill="url(#loginSkyFade)" />
        </svg>
      </div>

      {/* 타이틀 */}
      <p className="absolute hb-title-outline hb-animate-float css-4hzbpn font-['DNFBitBitv2','Press_Start_2P:Regular',sans-serif] leading-[56px] md:leading-[110px] left-0 not-italic right-0 text-[#1f4a2f] text-[52px] md:text-[72px] text-center top-[32px] md:top-[20px] tracking-[0.8px] md:tracking-[3.6px] z-10 pointer-events-none select-none">
        HAD
        <br />
        BETTER
      </p>

      {/* 로그인 폼 */}
      <form onSubmit={handleLogin} className="contents">
        {/* 에러 메시지 */}
        {error && (
          <div className="absolute left-1/2 translate-x-[-50%] top-[120px] md:top-[140px] z-30">
            <p className="text-red-500 text-xs md:text-sm font-bold bg-white/90 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-red-200 shadow-sm">
              {error}
            </p>
          </div>
        )}

        {/* 사용자 아이디 입력 */}
        <div className="absolute bg-white content-stretch flex h-[56px] md:h-[83px] items-center justify-center left-1/2 p-[4px] md:p-[6px] rounded-[28px] md:rounded-[40.5px] top-[200px] md:top-[240px] translate-x-[-50%] w-[calc(100%-48px)] max-w-[340px] md:w-[602px] z-20">
          <div aria-hidden="true" className="absolute border-[3px] md:border-6 border-black border-solid inset-0 pointer-events-none rounded-[28px] md:rounded-[40.5px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.25)] md:shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="사용자 아이디"
            disabled={isLoading}
            className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[56px] md:leading-[90px] relative shrink-0 text-[#767676] text-[14px] md:text-[24px] text-center tracking-[1.5px] md:tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676] disabled:opacity-50"
          />
        </div>

        {/* 비밀번호 입력 */}
        <div className="absolute bg-white content-stretch flex h-[56px] md:h-[83px] items-center justify-center left-1/2 p-[4px] md:p-[6px] rounded-[28px] md:rounded-[40.5px] top-[280px] md:top-[358px] translate-x-[-50%] w-[calc(100%-48px)] max-w-[340px] md:w-[602px] z-20">
          <div aria-hidden="true" className="absolute border-[3px] md:border-6 border-black border-solid inset-0 pointer-events-none rounded-[28px] md:rounded-[40.5px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.25)] md:shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            disabled={isLoading}
            className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[56px] md:leading-[90px] relative shrink-0 text-[#767676] text-[14px] md:text-[24px] text-center tracking-[1.5px] md:tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676] disabled:opacity-50"
          />
        </div>

        {/* Login 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="absolute bg-[#4a9960] top-[360px] md:top-[476px] content-stretch flex h-[56px] md:h-[83px] items-center justify-center left-1/2 p-[4px] md:p-[6px] rounded-[28px] md:rounded-[40.5px] translate-x-[-50%] w-[calc(100%-48px)] max-w-[340px] md:w-[602px] hover:bg-[#3d8050] active:translate-y-[1px] md:active:translate-y-[2px] transition-all z-20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div aria-hidden="true" className="absolute border-[3px] md:border-6 border-black border-solid inset-0 pointer-events-none rounded-[28px] md:rounded-[40.5px] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.25)] md:shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[56px] md:leading-[90px] not-italic relative shrink-0 text-[14px] md:text-[24px] text-center text-white tracking-[1.5px] md:tracking-[3.6px]">
            {isLoading ? "Loading..." : "Login"}
          </p>
        </button>
      </form>

      {/* 로그인 유지 체크박스 + 회원가입 버튼 */}
      <div className="absolute left-1/2 translate-x-[-50%] top-[440px] md:top-[580px] flex flex-row items-center justify-between z-20 w-[calc(100%-48px)] max-w-[340px] md:w-[602px]">
        {/* 로그인 유지 */}
        <label className="flex flex-nowrap items-center gap-[12px] cursor-pointer hover:opacity-80 transition-opacity">
          <input
            type="checkbox"
            checked={keepLoggedIn}
            onChange={(e) => setKeepLoggedIn(e.target.checked)}
            className="hidden"
          />
          <div
            className={`border-3 border-black border-solid h-[27px] rounded-[10px] w-[37px] transition-colors flex items-center justify-center shrink-0 ${
              keepLoggedIn ? "bg-[#4a9960]" : "bg-white"
            }`}
          >
            {keepLoggedIn && (
              <p className="text-white text-[20px] font-bold leading-none">✓</p>
            )}
          </div>
          <p className="css-4hzbpn font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-medium leading-[18px] text-[#1f4a2f] text-[12px] tracking-[0.2px] whitespace-nowrap">
            로그인 유지
          </p>
        </label>

        {/* 회원가입 */}
        <button
          type="button"
          onClick={handleSignup}
          className="hover:opacity-80 transition-opacity shrink-0"
        >
          <p className="css-4hzbpn font-['Inter:Regular','Noto_Sans_KR:Regular',sans-serif] font-medium leading-[18px] text-[#1f4a2f] text-[12px] text-center tracking-[0.2px] whitespace-nowrap">
            회원가입
          </p>
        </button>
      </div>

    </div>
  );
}
