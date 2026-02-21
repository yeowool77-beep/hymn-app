@echo off
title MP3 다운로드 - 찬송가 645곡
color 0B

echo.
echo ========================================
echo   🎵 찬송가 MP3 다운로드
echo   라이즌 사이트에서 645곡 다운로드
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] Python 패키지 확인 중...
python -c "import requests, bs4" 2>nul
if errorlevel 1 (
    echo 📦 필요한 패키지 설치 중...
    pip install requests beautifulsoup4 lxml
)

echo.
echo [2/2] MP3 다운로드 시작...
echo 📁 저장 위치: D:\찬송가_MP3
echo.

python scripts\download_realtime.py

echo.
echo ✅ 다운로드 완료!
pause
