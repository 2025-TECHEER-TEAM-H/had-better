import { useState } from "react";
import svgPaths from "../imports/svg-uqk4ub3bkc";
import { authApi, tempUserStorage } from "../utils/api";

interface SignUpPageProps {
  onSignUp: (userData?: any) => void;
  onBack: () => void;
}

export function SignUpPage({ onSignUp, onBack }: SignUpPageProps) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // 유효성 검사 상태
  const [errors, setErrors] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // 이메일 형식 검증
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // 유효성 검사 함수
  const validateForm = (): boolean => {
    const newErrors = {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    };

    let isValid = true;

    // 이메일 검증
    if (!email) {
      newErrors.email = "이메일을 입력해주세요";
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
      isValid = false;
    }

    // 아이디(이름) 검증
    if (!username) {
      newErrors.username = "아이디를 입력해주세요";
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = "아이디는 최소 3자 이상이어야 합니다";
      isValid = false;
    }

    // 비밀번호 검증
    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다";
      isValid = false;
    }

    // 비밀번호 확인 검증
    if (!confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요";
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 입력값 변경 시 실시간 검증
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email && value) {
      if (validateEmail(value)) {
        setErrors((prev) => ({ ...prev, email: "" }));
      }
    }
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    if (errors.username && value) {
      if (value.length >= 3) {
        setErrors((prev) => ({ ...prev, username: "" }));
      }
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (errors.password && value) {
      if (value.length >= 8) {
        setErrors((prev) => ({ ...prev, password: "" }));
      }
    }
    // 비밀번호가 변경되면 비밀번호 확인도 다시 검증
    if (confirmPassword && value !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "비밀번호가 일치하지 않습니다" }));
    } else if (confirmPassword && value === confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (errors.confirmPassword && value) {
      if (password === value) {
        setErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }
  };

  // 회원가입 버튼 클릭 시 검증 및 API 호출
  const handleSignUpClick = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setApiError("");

    // 중복 체크
    const existingUser = tempUserStorage.findUserByEmail(email) || tempUserStorage.findUserByUsername(username);
    if (existingUser) {
      setApiError("이미 존재하는 이메일 또는 아이디입니다");
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.signup({
        email,
        username,
        password,
        nickname: nickname || undefined,
      });

      if (response.success && response.data) {
        // API 성공 시 로컬 스토리지에도 저장
        tempUserStorage.addUser({
          email,
          username,
          password,
          nickname: nickname || undefined,
        });
        // 회원가입 성공 - 사용자 정보와 함께 콜백 호출
        onSignUp(response.data.user);
      } else {
        // API 실패 시에도 로컬 스토리지에 저장 (테스트용)
        tempUserStorage.addUser({
          email,
          username,
          password,
          nickname: nickname || undefined,
        });

        // 임시 사용자 정보로 회원가입 성공 처리
        const tempUser = tempUserStorage.findUserByEmail(email);
        if (tempUser) {
          onSignUp({
            id: tempUser.id,
            email: tempUser.email,
            username: tempUser.username,
            nickname: tempUser.nickname,
          });
        } else {
          setApiError(response.error || response.message || "회원가입에 실패했습니다 (임시 저장됨)");
        }
      }
    } catch (err) {
      // 에러 발생 시에도 로컬 스토리지에 저장 (테스트용)
      tempUserStorage.addUser({
        email,
        username,
        password,
        nickname: nickname || undefined,
      });

      // 임시 사용자 정보로 회원가입 성공 처리
      const tempUser = tempUserStorage.findUserByEmail(email);
      if (tempUser) {
        onSignUp({
          id: tempUser.id,
          email: tempUser.email,
          username: tempUser.username,
          nickname: tempUser.nickname,
        });
      } else {
        setApiError("회원가입 중 오류가 발생했습니다 (임시 저장됨)");
        console.error("Signup error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden overflow-y-auto scrollbar-hide" style={{
      background: 'linear-gradient(180deg, #c5e7f5 0%, #e8f4f8 50%, white 100%)'
    }}>
      {/* 부드러운 구름들 */}
      <div className="absolute top-16 left-8 opacity-60">
        <div className="w-32 h-16 bg-white rounded-full blur-2xl" />
      </div>
      <div className="absolute top-24 right-12 opacity-50">
        <div className="w-40 h-20 bg-white rounded-full blur-2xl" />
      </div>
      <div className="absolute top-40 left-24 opacity-40">
        <div className="w-28 h-14 bg-white rounded-full blur-2xl" />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative min-h-screen flex flex-col items-center pt-12 pb-32 px-8 z-10">
        {/* 상단 - 로고 + 타이틀 */}
        <div className="flex flex-col items-center mb-8">
          {/* 지도 아이콘 섹션 (수정됨) */}
          <div className="relative mb-6">
            {/* 1번 스타일의 3D 주황색 상자와 내부 핀 아이콘 */}
            <div
              className="w-[120px] h-[120px] bg-gradient-to-br from-[#FFB88C] to-[#FF9A6C] rounded-3xl flex items-center justify-center animate-float-mini"
              style={{
                boxShadow: '0 20px 40px rgba(255, 154, 108, 0.4), inset 0 -8px 16px rgba(0,0,0,0.1), inset 0 2px 8px rgba(255,255,255,0.5)'
              }}
            >
              <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
                {/* 핀 몸체 (흰색) */}
                <path
                  d="M32 56C32 56 48 38 48 26C48 17.1634 40.8366 10 32 10C23.1634 10 16 17.1634 16 26C16 38 32 56 32 56Z"
                  fill="white"
                />
                {/* 핀 머리 (빨간색 점) */}
                <circle cx="32" cy="26" r="6" fill="#FF6B6B" />
              </svg>
            </div>

            {/* 귀여운 태양 이모지 (애니메이션 적용) */}
            <div className="absolute -top-4 -right-4 text-4xl animate-bounce-slow">
              ☀️
            </div>
          </div>

          {/* 타이틀 */}
          <div className="mb-4 text-center">
            <h1 className="text-3xl font-black text-[#2d5f3f] mb-2 pixel-font tracking-wider">
              Signup
            </h1>
            <p className="text-xs font-bold text-[#6b9080] pixel-font">
              회원 가입을 위해 정보를 입력해주세요
            </p>
          </div>
        </div>

        {/* 중앙 - 폼 */}
        <div className="w-full max-w-[320px] space-y-5 mb-8">
          {/* 이메일 입력 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#6b9080] pixel-font block">
              이메일
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                className={`w-full h-14 bg-white/90 border-3 rounded-2xl px-4 pl-12 text-sm font-medium text-[#2d5f3f] placeholder:text-[#6b9080]/50 pixel-font focus:outline-none transition-colors ${
                  errors.email ? "border-red-500" : "border-black focus:border-[#48d448]"
                }`}
                style={{
                  boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                  imageRendering: 'pixelated'
                }}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                📧
              </div>
            </div>
            {errors.email && (
              <p className="text-xs text-red-500 pixel-font">{errors.email}</p>
            )}
          </div>

          {/* 아이디 입력 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#6b9080] pixel-font block">
              아이디
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="아이디를 입력하세요"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                className={`w-full h-14 bg-white/90 border-3 rounded-2xl px-4 pl-12 text-sm font-medium text-[#2d5f3f] placeholder:text-[#6b9080]/50 pixel-font focus:outline-none transition-colors ${
                  errors.username ? "border-red-500" : "border-black focus:border-[#48d448]"
                }`}
                style={{
                  boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                  imageRendering: 'pixelated'
                }}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                👤
              </div>
            </div>
            {errors.username && (
              <p className="text-xs text-red-500 pixel-font">{errors.username}</p>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#6b9080] pixel-font block">
              비밀번호
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className={`w-full h-14 bg-white/90 border-3 rounded-2xl px-4 pl-12 text-sm font-medium text-[#2d5f3f] placeholder:text-[#6b9080]/50 pixel-font focus:outline-none transition-colors ${
                  errors.password ? "border-red-500" : "border-black focus:border-[#48d448]"
                }`}
                style={{
                  boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                  imageRendering: 'pixelated'
                }}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                🔒
              </div>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 pixel-font">{errors.password}</p>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#6b9080] pixel-font block">
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                className={`w-full h-14 bg-white/90 border-3 rounded-2xl px-4 pl-12 text-sm font-medium text-[#2d5f3f] placeholder:text-[#6b9080]/50 pixel-font focus:outline-none transition-colors ${
                  errors.confirmPassword ? "border-red-500" : "border-black focus:border-[#48d448]"
                }`}
                style={{
                  boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                  imageRendering: 'pixelated'
                }}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                🔒
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 pixel-font">{errors.confirmPassword}</p>
            )}
          </div>

          {/* 닉네임 입력 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#6b9080] pixel-font block">
              닉네임
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="사용하실 닉네임을 입력하세요"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full h-14 bg-white/90 border-3 border-black rounded-2xl px-4 text-sm font-medium text-[#2d5f3f] placeholder:text-[#6b9080]/50 pixel-font focus:border-[#48d448] focus:outline-none transition-colors"
                style={{
                  boxShadow: '0 4px 0 rgba(0,0,0,0.2)',
                  imageRendering: 'pixelated'
                }}
              />
            </div>
          </div>

          {/* API 에러 메시지 */}
          {apiError && (
            <div className="w-full p-3 bg-red-100 border-2 border-red-500 rounded-xl">
              <p className="text-xs text-red-600 pixel-font">{apiError}</p>
            </div>
          )}

          {/* 회원가입 버튼 */}
          <button
            onClick={handleSignUpClick}
            disabled={isLoading}
            className="w-full h-16 relative group overflow-hidden bg-gradient-to-b from-[#48d448] to-[#3db83d] border-4 border-black rounded-3xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              boxShadow: '0 8px 0 #2d8b2d, 0 16px 32px rgba(61,184,61,0.3)',
              imageRendering: 'pixelated'
            }}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative text-white font-black text-xl pixel-font tracking-wider">
              {isLoading ? "가입 중..." : "Signup"}
            </span>
          </button>

          {/* 로그인 링크 */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <span className="text-xs font-medium text-[#6b9080] pixel-font">
              이미 계정이 있으신가요?
            </span>
            <button
              onClick={onBack}
              className="text-xs font-bold text-[#48d448] pixel-font hover:underline"
            >
              로그인
            </button>
          </div>
        </div>

        {/* 하단 링크 */}
        <div className="w-full max-w-[320px]">
          <div className="flex items-center justify-center gap-3 text-[#6b9080]">
            <button className="text-xs font-medium pixel-font hover:underline">이용약관</button>
            <span className="text-xs font-bold">•</span>
            <button className="text-xs font-medium pixel-font hover:underline">개인정보처리방침</button>
          </div>
        </div>
      </div>

      {/* 픽셀 산 배경 */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ imageRendering: 'pixelated' }}>
        {/* 뒷산 */}
        <svg className="absolute bottom-0 w-full" style={{ height: '30%' }} viewBox="0 0 400 120" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountain1-signup" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a9960" />
              <stop offset="100%" stopColor="#3d8651" />
            </linearGradient>
          </defs>
          <path d="M -50 120 L -50 40 Q 10 15, 75 35 Q 125 50, 175 30 L 175 120 Z"
                fill="url(#mountain1-signup)" opacity="0.7" />
        </svg>

        <svg className="absolute bottom-0 w-full" style={{ height: '35%', left: '50%' }} viewBox="0 0 400 140" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountain2-signup" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4a9960" />
              <stop offset="100%" stopColor="#3d8651" />
            </linearGradient>
          </defs>
          <path d="M 0 140 L 0 35 Q 50 8, 110 30 Q 170 55, 230 25 Q 290 5, 350 35 L 400 140 Z"
                fill="url(#mountain2-signup)" opacity="0.7" />
        </svg>

        {/* 앞산 */}
        <svg className="absolute bottom-0 w-full" style={{ height: '25%' }} viewBox="0 0 400 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountain4-signup" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7ec98f" />
              <stop offset="100%" stopColor="#6bb87c" />
            </linearGradient>
          </defs>
          <path d="M 0 100 L 0 42 Q 60 20, 120 38 Q 180 55, 240 35 Q 300 18, 360 45 L 400 100 Z"
                fill="url(#mountain4-signup)" opacity="0.85" />
        </svg>

        <svg className="absolute bottom-0 w-full" style={{ height: '23%', left: '50%' }} viewBox="0 0 400 92" preserveAspectRatio="none">
          <defs>
            <linearGradient id="mountain5-signup" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7ec98f" />
              <stop offset="100%" stopColor="#6bb87c" />
            </linearGradient>
          </defs>
          <path d="M 0 92 L 0 38 Q 50 18, 105 35 Q 160 52, 215 32 Q 270 15, 325 42 L 380 92 Z"
                fill="url(#mountain5-signup)" opacity="0.9" />
        </svg>

        {/* 나무들 */}
        <div className="absolute bottom-12 left-[15%]">
          <svg width="28" height="40" viewBox="0 0 14 20" style={{ imageRendering: 'pixelated' }}>
            <defs>
              <linearGradient id="tree1-signup" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2d5f3f" />
                <stop offset="100%" stopColor="#1f4a2f" />
              </linearGradient>
              <linearGradient id="trunk1-signup" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b4423" />
                <stop offset="100%" stopColor="#5a3a1f" />
              </linearGradient>
            </defs>
            <rect x="5" y="14" width="4" height="6" fill="url(#trunk1-signup)" rx="2" />
            <rect x="2" y="9" width="10" height="6" fill="url(#tree1-signup)" rx="2" />
            <rect x="3" y="5" width="8" height="5" fill="url(#tree1-signup)" rx="2" />
            <rect x="4" y="1" width="6" height="5" fill="url(#tree1-signup)" rx="2" />
          </svg>
        </div>

        <div className="absolute bottom-10 right-[20%]">
          <svg width="32" height="44" viewBox="0 0 16 22" style={{ imageRendering: 'pixelated' }}>
            <defs>
              <linearGradient id="tree2-signup" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2d5f3f" />
                <stop offset="100%" stopColor="#1f4a2f" />
              </linearGradient>
              <linearGradient id="trunk2-signup" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6b4423" />
                <stop offset="100%" stopColor="#5a3a1f" />
              </linearGradient>
            </defs>
            <rect x="6" y="16" width="4" height="6" fill="url(#trunk2-signup)" rx="2" />
            <rect x="2" y="10" width="12" height="7" fill="url(#tree2-signup)" rx="2" />
            <rect x="4" y="6" width="8" height="6" fill="url(#tree2-signup)" rx="2" />
            <rect x="5" y="2" width="6" height="5" fill="url(#tree2-signup)" rx="2" />
          </svg>
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        .pixel-font {
          font-family: 'Press Start 2P', cursive;
          image-rendering: pixelated;
        }

        /* 1번 사진의 부드러운 태양 움직임 */
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        /* 주황색 상자의 미세한 공중부양 */
        @keyframes float-mini {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float-mini {
          animation: float-mini 3s ease-in-out infinite;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
