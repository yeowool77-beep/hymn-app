@echo off
title 찬송가 프로젝트 - 빠른 시작 가이드
color 0E

:MENU
cls
echo.
echo ╔════════════════════════════════════════════════╗
echo ║                                                ║
echo ║     🎵 SacredArchitect - 찬송가 재탄생 프로젝트    ║
echo ║           645곡 AI 음악 생성 시스템             ║
echo ║                                                ║
echo ╚════════════════════════════════════════════════╝
echo.
echo  [1] 🎵 찬송가 앱 실행 (포트 5173)
echo  [2] 📥 MP3 다운로드 (645곡)
echo  [3] 📊 다운로드 진행 상황 확인
echo  [4] 📁 생성된 파일 폴더 열기
echo  [5] 🔧 환경 설정 (.env.local 편집)
echo  [6] ❌ 종료
echo.
set /p choice=선택하세요 (1-6): 

if "%choice%"=="1" goto RUN_APP
if "%choice%"=="2" goto DOWNLOAD_MP3
if "%choice%"=="3" goto CHECK_PROGRESS
if "%choice%"=="4" goto OPEN_FOLDER
if "%choice%"=="5" goto EDIT_ENV
if "%choice%"=="6" goto EXIT
goto MENU

:RUN_APP
cls
echo.
echo 🎵 찬송가 앱 실행 중...
echo.
start "" "%~dp0🎵_찬송가앱_실행.bat"
goto MENU

:DOWNLOAD_MP3
cls
echo.
echo 📥 MP3 다운로드 시작...
echo.
start "" "%~dp0📥_MP3_다운로드.bat"
goto MENU

:CHECK_PROGRESS
cls
echo.
echo 📊 다운로드 진행 상황
echo ═══════════════════════════════════════
echo.
if exist "%~dp0data\mp3\progress.json" (
    type "%~dp0data\mp3\progress.json"
) else (
    echo ⚠️  아직 다운로드가 시작되지 않았습니다.
)
echo.
pause
goto MENU

:OPEN_FOLDER
cls
echo.
echo 📁 폴더 열기...
echo.
if exist "%~dp0data\mp3\" (
    explorer "%~dp0data\mp3\"
) else (
    echo ⚠️  data\mp3 폴더가 아직 생성되지 않았습니다.
)
pause
goto MENU

:EDIT_ENV
cls
echo.
echo 🔧 환경 설정 편집...
echo.
if exist "%~dp0.env.local" (
    notepad "%~dp0.env.local"
) else (
    echo VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE > "%~dp0.env.local"
    notepad "%~dp0.env.local"
)
goto MENU

:EXIT
cls
echo.
echo 👋 프로그램을 종료합니다.
echo.
timeout /t 2 >nul
exit
