#!/bin/bash

# 현재 스크립트가 있는 디렉토리로 이동 (더블 클릭 시 필요)
cd "$(dirname "$0")"

# SacredArchitect - Mac 시작 스크립트 (.command 버전)
# 이 파일은 Finder에서 더블 클릭하여 바로 실행할 수 있습니다.

# 색상 정의
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear
echo -e "${YELLOW}╔════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║                                                ║${NC}"
echo -e "${YELLOW}║     🎵 SacredArchitect - 찬송가 재탄생 프로젝트    ║${NC}"
echo -e "${YELLOW}║           645곡 AI 음악 생성 시스템             ║${NC}"
echo -e "${YELLOW}║                                                ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════╝${NC}"
echo ""

show_menu() {
    echo -e " [1] ${CYAN}🎵 찬송가 앱 실행${NC} (포트 3000)"
    echo -e " [2] ${CYAN}📥 MP3 다운로드${NC} (Python 사용)"
    echo -e " [3] ${CYAN}📊 다운로드 진행 상황 확인${NC}"
    echo -e " [4] ${CYAN}📁 데이터 폴더 열기${NC}"
    echo -e " [5] ${CYAN}🔧 환경 설정${NC} (.env.local 편집)"
    echo -e " [6] ${RED}❌ 종료${NC}"
    echo ""
}

while true; do
    show_menu
    read -p "선택하세요 (1-6): " choice
    
    case $choice in
        1)
            echo -e "\n${GREEN}🎵 앱 실행 중...${NC}"
            if [ ! -d "node_modules" ]; then
                echo "라이브러리가 설치되지 않았습니다. 설치를 시작합니다..."
                npm install
            fi
            npm run dev
            ;;
        2)
            echo -e "\n${GREEN}📥 MP3 다운로드 시작 (Python)...${NC}"
            python3 scripts/download_realtime.py
            ;;
        3)
            echo -e "\n${YELLOW}📊 다운로드 진행 상황${NC}"
            if [ -f "data/mp3/progress.json" ]; then
                cat data/mp3/progress.json
            else
                echo -e "${RED}⚠️ 아직 다운로드가 시작되지 않았습니다.${NC}"
            fi
            echo ""
            read -p "엔터를 눌러 메뉴로 돌아갑니다."
            ;;
        4)
            echo -e "\n${GREEN}📁 폴더 열기...${NC}"
            open data/mp3 2>/dev/null || echo "폴더가 아직 생성되지 않았습니다."
            ;;
        5)
            echo -e "\n${GREEN}🔧 환경 설정 편집...${NC}"
            if [ ! -f ".env.local" ]; then
                echo "VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE" > .env.local
            fi
            nano .env.local
            ;;
        6)
            echo -e "\n${YELLOW}👋 종료합니다.${NC}"
            exit 0
            ;;
        *)
            echo -e "\n${RED}잘못된 선택입니다.${NC}"
            ;;
    esac
    clear
done
