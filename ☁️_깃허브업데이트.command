#!/bin/bash

# 스크립트가 위치한 디렉토리로 이동
cd "$(dirname "$0")"

echo "================================================"
echo "☁️  찬송가 앱 깃허브 원클릭 업데이트 (Mac용)"
echo "================================================"
echo ""

# 변경 사항 확인
if [ -z "$(git status --porcelain)" ]; then
  echo "✅ 현재 변경된 사항이 없습니다. 최신 상태입니다."
  echo ""
  exit 0
fi

echo "어떤 내용을 수정하셨나요? (엔터를 누르면 기본 메시지로 저장됩니다)"
read -p "수정 내용: " COMMIT_MSG

# 입력값이 없으면 기본 메시지 사용
if [ -z "$COMMIT_MSG" ]; then
  COMMIT_MSG="fix: Auto update via 1-click script"
fi

echo ""
echo "⏳ 작업을 깃허브로 전송하는 중..."
git add .
git commit -m "$COMMIT_MSG"
git push origin main

echo ""
echo "✅ 모든 업데이트가 깃허브에 성공적으로 전송되었습니다!"
echo ""
