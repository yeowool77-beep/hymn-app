@echo off
title 서버 재시작 - SacredArchitect
color 0C

echo.
echo ========================================
echo   🔄 개발 서버 재시작 중...
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] 기존 Node 프로세스 종료 중...
taskkill /F /IM node.exe /T 2>nul
timeout /t 2 >nul

echo.
echo [2/2] 새 서버 시작 중...
echo.
echo ✨ 브라우저에서 http://localhost:5173 을 열어주세요
echo.

start http://localhost:5173

npm run dev -- --port 5173

pause
