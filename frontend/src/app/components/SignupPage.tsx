import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#c5e7f5] to-white overflow-y-auto">
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
      <p className="absolute css-4hzbpn font-['Press_Start_2P:Regular',sans-serif] leading-[60px] md:leading-[110px] left-0 not-italic right-0 text-[#1f4a2f] text-[32px] md:text-[72px] text-center top-[40px] md:top-[40px] tracking-[3.6px] z-10">
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
          <div className="absolute left-1/2 translate-x-[-50%] top-[110px] md:top-[160px] z-30">
            <p className="text-red-500 text-sm font-bold bg-white/80 px-4 py-2 rounded-lg">
              {error}
            </p>
          </div>
        )}

        {/* 이메일 입력 */}
        <div className="absolute bg-white content-stretch flex h-[57.243px] md:h-[73.29px] items-center justify-center left-1/2 p-[6px] rounded-[40.5px] top-[150px] md:top-[200px] translate-x-[-50%] w-[300px] md:w-[531.571px] z-20">
          <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            disabled={isLoading}
            className="css-ew64yg font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[90px] relative shrink-0 text-[#767676] text-[16px] md:text-[24px] text-center tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676] disabled:opacity-50"
          />
        </div>

        {/* 아이디 입력 */}
        <div className="absolute bg-white content-stretch flex h-[57.243px] md:h-[73.29px] items-center justify-center left-1/2 p-[6px] rounded-[40.5px] top-[220px] md:top-[290px] translate-x-[-50%] w-[300px] md:w-[531.571px] z-20">
          <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="아이디 (4자 이상)"
            disabled={isLoading}
            className="css-ew64yg font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[90px] relative shrink-0 text-[#767676] text-[16px] md:text-[24px] text-center tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676] disabled:opacity-50"
          />
        </div>

        {/* 비밀번호 입력 */}
        <div className="absolute bg-white content-stretch flex h-[57.243px] md:h-[73.29px] items-center justify-center left-1/2 p-[6px] rounded-[40.5px] top-[290px] md:top-[380px] translate-x-[-50%] w-[300px] md:w-[531.571px] z-20">
          <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <input
            type="password"
            name="new-password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (8자 이상)"
            disabled={isLoading}
            className="css-ew64yg font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[90px] relative shrink-0 text-[#767676] text-[16px] md:text-[24px] text-center tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676] disabled:opacity-50"
          />
        </div>

        {/* 비밀번호 확인 입력 */}
        <div className="absolute bg-white content-stretch flex h-[57.243px] md:h-[73.29px] items-center justify-center left-1/2 p-[6px] rounded-[40.5px] top-[360px] md:top-[470px] translate-x-[-50%] w-[300px] md:w-[531.571px] z-20">
          <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <input
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            placeholder="비밀번호 확인"
            disabled={isLoading}
            className="css-ew64yg font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[90px] relative shrink-0 text-[#767676] text-[16px] md:text-[24px] text-center tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676] disabled:opacity-50"
          />
        </div>

        {/* 닉네임 입력 */}
        <div className="absolute bg-white content-stretch flex h-[57.243px] md:h-[73.29px] items-center justify-center left-1/2 p-[6px] rounded-[40.5px] top-[430px] md:top-[560px] translate-x-[-50%] w-[300px] md:w-[531.571px] z-20">
          <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <input
            type="text"
            name="nickname"
            autoComplete="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 (선택)"
            disabled={isLoading}
            className="css-ew64yg font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[90px] relative shrink-0 text-[#767676] text-[16px] md:text-[24px] text-center tracking-[3.6px] bg-transparent outline-none w-full placeholder:text-[#767676] disabled:opacity-50"
          />
        </div>

        {/* Sign up 버튼 */}
        <button
          type="submit"
          disabled={isLoading}
          className="absolute bg-[#4a9960] content-stretch flex h-[57.243px] md:h-[73.29px] items-center justify-center left-1/2 p-[6px] rounded-[40.5px] top-[510px] md:top-[660px] translate-x-[-50%] w-[300px] md:w-[531.571px] hover:bg-[#3d8050] active:translate-y-[2px] transition-all z-20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div aria-hidden="true" className="absolute border-6 border-black border-solid inset-0 pointer-events-none rounded-[40.5px] shadow-[0px_6px_4px_0px_rgba(0,0,0,0.25)]" />
          <p className="css-ew64yg font-['Press_Start_2P:Regular',sans-serif] leading-[90px] not-italic relative shrink-0 text-[16px] md:text-[24px] text-center text-white tracking-[3.6px]">
            {isLoading ? "Loading..." : "sign up"}
          </p>
        </button>
      </form>

      {/* 이미 계정이 있으신가요? 로그인 */}
      <div className="absolute left-1/2 translate-x-[-50%] top-[580px] md:top-[750px] flex flex-col items-center gap-[8px] z-20 pb-8">
        <p className="css-4hzbpn font-['Wittgenstein:Bold','Noto_Sans_KR:Bold',sans-serif] font-bold leading-[90px] text-[#767676] text-[14px] md:text-[20px] text-center tracking-[2px] whitespace-nowrap">
          이미 계정이 있으신가요?{" "}
          <button
            type="button"
            onClick={handleLogin}
            className="text-[rgb(95,92,239)] hover:opacity-80 transition-opacity inline font-bold"
          >
            로그인
          </button>
        </p>
      </div>
    </div>
  );
}
