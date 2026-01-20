import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import imgCharacterGreenFront1 from "@/assets/character-green-front.png";
import imgCharacterYellowFront1 from "@/assets/character-yellow-front.png";
import imgCharacterPurpleFront1 from "@/assets/character-purple-front.png";
import imgTerrainGrassHorizontalMiddle10 from "@/assets/terrain-grass-horizontal-middle.png";
import { useAuthStore } from "@/stores/authStore";
import authService from "@/services/authService";

interface LoginPageProps {
  isOpen?: boolean;
  onLogin?: () => void;
  onSignup?: () => void;
}

// 개발 환경 여부
const isDev = import.meta.env.DEV;

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
            username: response.data.user.name,  // 백엔드에서는 name
            email: response.data.user.email,
            nickname: response.data.user.nickname,
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

  // 개발자용 빠른 로그인 (DEV 환경에서만)
  const handleDevLogin = () => {
    // 개발용 더미 토큰으로 로그인 (항상 로그인 유지)
    setAuth(
      {
        id: 1,
        username: "dev_user",
        email: "dev@hadbetter.com",
        nickname: "개발자",
      },
      {
        access: "dev_access_token_for_testing",
        refresh: "dev_refresh_token_for_testing",
      },
      true
    );
    navigate("/search");
  };

  const handleSignup = () => {
    if (onSignup) {
      onSignup();
    } else {
      navigate("/signup");
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#c5e7f5] to-white"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      {/* 하단 캐릭터와 땅 - 맨 뒤 레이어 */}
      <div className="absolute bottom-0 content-stretch flex flex-col h-[268px] md:h-[287px] items-center justify-end left-0 right-0 z-0">
        {/* 캐릭터들 */}
        <div className="h-[159px] relative shrink-0 w-full pointer-events-none">
          <div className="flex flex-row items-center justify-center size-full pointer-events-none">
            <div className="content-stretch flex items-center justify-center px-[60px] relative size-full pointer-events-none">
              <div className="relative shrink-0 size-[160.333px] pointer-events-none">
                <img
                  alt="Green Character"
                  className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                  src={imgCharacterGreenFront1}
                />
              </div>
              <div className="relative shrink-0 size-[160.333px] pointer-events-none">
                <img
                  alt="Yellow Character"
                  className="absolute inset-0 max-w-none object-cover pointer-events-none size-full"
                  src={imgCharacterYellowFront1}
                />
              </div>
              <div className="relative shrink-0 size-[160.333px] pointer-events-none">
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
      <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] leading-[60px] md:leading-[110px] left-0 not-italic right-0 text-[#1f4a2f] text-[48px] md:text-[72px] text-center top-[32px] md:top-[20px] tracking-[3.6px] z-10">
        HAD
        <br />
        BETTER
      </p>

      {/* 로그인 폼 */}
      <form onSubmit={handleLogin} className="contents">
        {/* 에러 메시지 */}
        {error && (
          <div className="absolute left-1/2 translate-x-[-50%] top-[180px] md:top-[200px] z-30">
            <p className="text-red-500 text-sm font-bold bg-white/80 px-4 py-2 rounded-lg">
              {error}
            </p>
          </div>
        )}

        {/* 사용자 아이디 입력 */}
        <div className="absolute bg-white content-stretch flex h-[83px] items-center justify-center left-1/2 p-[6px] rounded-[40.5px] top-[214px] md:top-[240px] translate-x-[-50%] w-[325px] md:w-[602px] z-20">
          <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="사용자 아이디"
            disabled={isLoading}
            className="css-ew64yg font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[90px] relative shrink-0 text-[#767676] text-[24px] text-center tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676] disabled:opacity-50"
          />
        </div>

        {/* 비밀번호 입력 */}
        <div className="absolute bg-white content-stretch flex h-[83px] items-center justify-center left-1/2 p-[6px] rounded-[40.5px] top-[332px] md:top-[358px] translate-x-[-50%] w-[325px] md:w-[602px] z-20">
          <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            disabled={isLoading}
            className="css-ew64yg font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[90px] relative shrink-0 text-[#767676] text-[24px] text-center tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676] disabled:opacity-50"
          />
        </div>

        {/* Login 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="absolute bg-[#4a9960] top-[450px] md:top-[476px] content-stretch flex h-[83px] items-center justify-center left-1/2 p-[6px] rounded-[40.5px] translate-x-[-50%] w-[325px] md:w-[602px] hover:bg-[#3d8050] active:translate-y-[2px] transition-all z-20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[90px] not-italic relative shrink-0 text-[24px] text-center text-white tracking-[3.6px]">
            {isLoading ? "Loading..." : "Login"}
          </p>
        </button>
      </form>

      {/* 로그인 유지 체크박스 + 회원가입 버튼 */}
      <div className="absolute left-1/2 translate-x-[-50%] top-[518px] md:top-[544px] flex flex-nowrap items-center gap-[40px] md:gap-[150px] z-20">
        {/* 로그인 유지 */}
        <label className="flex flex-nowrap items-center gap-[16px] cursor-pointer hover:opacity-80 transition-opacity">
          <input
            type="checkbox"
            checked={keepLoggedIn}
            onChange={(e) => setKeepLoggedIn(e.target.checked)}
            className="hidden"
          />
          <div
            className={`border-3 border-black border-solid h-[27px] rounded-[10px] w-[37.396px] md:w-[37px] transition-colors flex items-center justify-center shrink-0 ${
              keepLoggedIn ? "bg-[#4a9960]" : "bg-white"
            }`}
          >
            {keepLoggedIn && (
              <p className="text-white text-[20px] font-bold leading-none">✓</p>
            )}
          </div>
          <p className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[90px] text-[#767676] text-[24px] tracking-[3.6px] whitespace-nowrap">
            로그인 유지
          </p>
        </label>

        {/* 회원가입 */}
        <button
          type="button"
          onClick={handleSignup}
          className="hover:opacity-80 transition-opacity shrink-0"
        >
          <p className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[90px] text-[#767676] text-[24px] text-center tracking-[3.6px] whitespace-nowrap">
            회원가입
          </p>
        </button>
      </div>

      {/* 개발자용 빠른 로그인 버튼 (DEV 환경에서만 표시) */}
      {isDev && (
        <button
          type="button"
          onClick={handleDevLogin}
          className="absolute bottom-4 right-4 bg-yellow-400 text-black text-xs font-bold px-3 py-2 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_black] hover:bg-yellow-300 active:translate-y-[1px] transition-all z-50"
        >
          🔧 DEV LOGIN
        </button>
      )}
    </motion.div>
  );
}
