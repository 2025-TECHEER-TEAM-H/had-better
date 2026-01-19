import { useState } from "react";
import svgPaths from "../imports/svg-uqk4ub3bkc";
import { authApi, tokenManager, tempUserStorage } from "../utils/api";

interface LoginPageProps {
  onLogin: (userData?: any) => void;
  onSignUp: () => void;
}

export function LoginPage({
  onLogin,
  onSignUp,
}: LoginPageProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    // 입력값 검증
    if (!username || !password) {
      setError("아이디와 비밀번호를 모두 입력해주세요");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 백엔드 로직에 맞춰 name으로 로그인 요청
      const response = await authApi.login({ name: username, password });

      if (response.success && response.data) {
        // 토큰 저장
        tokenManager.setToken(response.data.access_token);

        // 로그인 성공 - 사용자 정보와 함께 콜백 호출
        onLogin(response.data.user);
      } else {
        // API 실패 시 로컬 스토리지에서 확인 (테스트용)
        const tempUser = tempUserStorage.findUserByUsername(username);
        if (tempUser && tempUser.password === password) {
          // 임시 토큰 생성 (테스트용)
          const tempToken = `temp_token_${tempUser.id}_${Date.now()}`;
          tokenManager.setToken(tempToken);

          // 로그인 성공 - 임시 사용자 정보로 로그인
          onLogin({
            id: tempUser.id,
            email: tempUser.email,
            username: tempUser.username,
            nickname: tempUser.nickname,
          });
        } else {
          setError(response.error || response.message || "로그인에 실패했습니다");
        }
      }
    } catch (err) {
      // 에러 발생 시 로컬 스토리지에서 확인 (테스트용)
      const tempUser = tempUserStorage.findUserByUsername(username);
      if (tempUser && tempUser.password === password) {
        // 임시 토큰 생성 (테스트용)
        const tempToken = `temp_token_${tempUser.id}_${Date.now()}`;
        tokenManager.setToken(tempToken);

        // 로그인 성공 - 임시 사용자 정보로 로그인
        onLogin({
          id: tempUser.id,
          email: tempUser.email,
          username: tempUser.username,
          nickname: tempUser.nickname,
        });
      } else {
        setError("로그인 중 오류가 발생했습니다");
        console.error("Login error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden pointer-events-auto"
      style={{
        background:
          "linear-gradient(180deg, #c5e7f5 0%, #e8f4f8 50%, white 100%)",
        pointerEvents: 'auto',
      }}
    >
      {/* 부드러운 구름들 */}
      <div className="absolute top-16 left-8 opacity-60 pointer-events-none">
        <div className="w-32 h-16 bg-white rounded-full blur-2xl" />
      </div>
      <div className="absolute top-24 right-12 opacity-50 pointer-events-none">
        <div className="w-40 h-20 bg-white rounded-full blur-2xl" />
      </div>
      <div className="absolute top-40 left-24 opacity-40 pointer-events-none">
        <div className="w-28 h-14 bg-white rounded-full blur-2xl" />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative h-full flex flex-col items-center justify-between pt-12 pb-0 px-8 z-10">
        {/* 상단 - 로고 + 타이틀 */}
        <div className="flex flex-col items-center">
          {/* 지도 아이콘 섹션 (수정됨) */}
          <div className="relative mb-6">
            {/* 주황색 3D 상자와 지도 핀 아이콘 */}
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
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-black text-[#2d5f3f] mb-2 pixel-font tracking-wider">
              HAD BETTER
            </h1>
            <p className="text-sm font-bold text-[#6b9080] pixel-font">
              계정에 로그인하세요
            </p>
          </div>
        </div>

        {/* 중앙 - 폼 */}
        <div className="w-full max-w-[320px] space-y-5 mb-8">
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
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-14 bg-white/90 border-3 border-black rounded-2xl pl-12 pr-4 text-sm font-medium text-[#2d5f3f] placeholder:text-[#6b9080]/50 pixel-font"
                style={{
                  boxShadow: "0 4px 0 rgba(0,0,0,0.2)",
                  imageRendering: "pixelated",
                }}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                👤
              </div>
            </div>
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
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 bg-white/90 border-3 border-black rounded-2xl pl-12 pr-4 text-sm font-medium text-[#2d5f3f] placeholder:text-[#6b9080]/50 pixel-font"
                style={{
                  boxShadow: "0 4px 0 rgba(0,0,0,0.2)",
                  imageRendering: "pixelated",
                }}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                🔒
              </div>
            </div>
          </div>

          {/* 로그인 유지 & 회원가입 */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-2 border-black accent-[#48d448]"
              />
              <span className="text-xs font-medium text-[#6b9080] pixel-font">
                로그인 유지
              </span>
            </label>
            <button
              onClick={onSignUp}
              className="text-xs font-bold text-[#48d448] pixel-font hover:underline"
            >
              회원가입
            </button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="w-full p-3 bg-red-100 border-2 border-red-500 rounded-xl">
              <p className="text-xs text-red-600 pixel-font">{error}</p>
            </div>
          )}

          {/* 로그인 버튼 */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full h-16 relative group overflow-hidden bg-gradient-to-b from-[#48d448] to-[#3db83d] border-4 border-black rounded-3xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              boxShadow:
                "0 8px 0 #2d8b2d, 0 16px 32px rgba(61,184,61,0.3)",
              imageRendering: "pixelated",
            }}
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative text-white font-black text-xl pixel-font tracking-wider">
              {isLoading ? "로그인 중..." : "로그인"}
            </span>
          </button>
        </div>

        {/* 하단 링크 */}
        <div className="w-full max-w-[320px] pb-8">
          <div className="flex items-center justify-center gap-3 text-[#6b9080]">
            <button className="text-xs font-medium pixel-font hover:underline">
              이용약관
            </button>
            <span className="text-xs font-bold">•</span>
            <button className="text-xs font-medium pixel-font hover:underline">
              개인정보처리방침
            </button>
            <span className="text-xs font-bold">•</span>
            <button className="text-xs font-medium pixel-font hover:underline">
              고객센터
            </button>
          </div>
        </div>
      </div>

      {/* 픽셀 산 배경 */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ imageRendering: "pixelated" }}
      >
        {/* 뒷산 */}
        <svg
          className="absolute bottom-0 w-full"
          style={{ height: "45%" }}
          viewBox="0 0 400 180"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="mountain1-login"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#4a9960" />
              <stop offset="100%" stopColor="#3d8651" />
            </linearGradient>
          </defs>
          <path
            d="M -50 180 L -50 60 Q 10 20, 75 50 Q 125 75, 175 40 L 175 180 Z"
            fill="url(#mountain1-login)"
            opacity="0.7"
          />
        </svg>

        <svg
          className="absolute bottom-0 w-full"
          style={{ height: "50%", left: "50%" }}
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="mountain2-login"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#4a9960" />
              <stop offset="100%" stopColor="#3d8651" />
            </linearGradient>
          </defs>
          <path
            d="M 0 200 L 0 50 Q 50 10, 110 45 Q 170 80, 230 35 Q 290 5, 350 50 L 400 200 Z"
            fill="url(#mountain2-login)"
            opacity="0.7"
          />
        </svg>

        {/* 앞산 */}
        <svg
          className="absolute bottom-0 w-full"
          style={{ height: "35%" }}
          viewBox="0 0 400 140"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="mountain4-login"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#7ec98f" />
              <stop offset="100%" stopColor="#6bb87c" />
            </linearGradient>
          </defs>
          <path
            d="M 0 140 L 0 60 Q 60 30, 120 55 Q 180 80, 240 50 Q 300 25, 360 65 L 400 140 Z"
            fill="url(#mountain4-login)"
            opacity="0.85"
          />
        </svg>

        <svg
          className="absolute bottom-0 w-full"
          style={{ height: "33%", left: "50%" }}
          viewBox="0 0 400 130"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="mountain5-login"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#7ec98f" />
              <stop offset="100%" stopColor="#6bb87c" />
            </linearGradient>
          </defs>
          <path
            d="M 0 130 L 0 55 Q 50 25, 105 50 Q 160 75, 215 45 Q 270 20, 325 60 L 380 130 Z"
            fill="url(#mountain5-login)"
            opacity="0.9"
          />
        </svg>

        {/* 나무들 */}
        <div className="absolute bottom-20 left-[15%]">
          <svg
            width="32"
            height="48"
            viewBox="0 0 16 24"
            style={{ imageRendering: "pixelated" }}
          >
            <defs>
              <linearGradient
                id="tree1-login"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#2d5f3f" />
                <stop offset="100%" stopColor="#1f4a2f" />
              </linearGradient>
              <linearGradient
                id="trunk1-login"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#6b4423" />
                <stop offset="100%" stopColor="#5a3a1f" />
              </linearGradient>
            </defs>
            <rect
              x="6"
              y="16"
              width="4"
              height="8"
              fill="url(#trunk1-login)"
              rx="2"
            />
            <rect
              x="2"
              y="10"
              width="12"
              height="8"
              fill="url(#tree1-login)"
              rx="2"
            />
            <rect
              x="4"
              y="5"
              width="8"
              height="7"
              fill="url(#tree1-login)"
              rx="2"
            />
            <rect
              x="5"
              y="1"
              width="6"
              height="6"
              fill="url(#tree1-login)"
              rx="2"
            />
          </svg>
        </div>

        <div className="absolute bottom-16 right-[20%]">
          <svg
            width="40"
            height="56"
            viewBox="0 0 20 28"
            style={{ imageRendering: "pixelated" }}
          >
            <defs>
              <linearGradient
                id="tree2-login"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#2d5f3f" />
                <stop offset="100%" stopColor="#1f4a2f" />
              </linearGradient>
              <linearGradient
                id="trunk2-login"
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#6b4423" />
                <stop offset="100%" stopColor="#5a3a1f" />
              </linearGradient>
            </defs>
            <rect
              x="8"
              y="20"
              width="4"
              height="8"
              fill="url(#trunk2-login)"
              rx="2"
            />
            <rect
              x="3"
              y="13"
              width="14"
              height="9"
              fill="url(#tree2-login)"
              rx="2"
            />
            <rect
              x="5"
              y="7"
              width="10"
              height="8"
              fill="url(#tree2-login)"
              rx="2"
            />
            <rect
              x="7"
              y="2"
              width="6"
              height="7"
              fill="url(#tree2-login)"
              rx="2"
            />
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
      `}</style>
    </div>
  );
}
