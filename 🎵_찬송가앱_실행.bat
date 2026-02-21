@echo off
title SacredArchitect - 찬송가 재탄생 프로젝트
color 0A

echo.
echo ========================================
echo   🎵 SacredArchitect 시작 중...
echo   645곡 찬송가 AI 재탄생 프로젝트
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 의존성 확인 중...
if not exist "node_modules\" (
    echo 📦 패키지 설치 중...
    call npm install
)

echo.
echo [2/3] 환경 변수 확인 중...
if not exist ".env.local" (
    echo ⚠️  .env.local 파일이 없습니다!
    echo VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE > .env.local
    echo ✅ .env.local 파일을 생성했습니다.
    echo 📝 .env.local 파일을 열어서 API 키를 입력해주세요!
    pause
)

echo.
echo [3/3] 개발 서버 시작 중...
echo.
echo ✨ 앱이 곧 실행됩니다!
echo 🌐 브라우저에서 http://localhost:5173 을 열어주세요
echo.
echo 💡 종료하려면 Ctrl+C를 누르세요
echo.

start http://localhost:5173

npm run dev -- --port 5173

pause
