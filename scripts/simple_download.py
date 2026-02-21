"""
브라우저 자동화를 통한 찬송가 MP3 다운로드
1단계: 목록 페이지에서 모든 찬송가 링크 추출
2단계: 각 페이지 방문하여 MP3 URL 추출 및 다운로드
"""

import json
import time
import requests
from pathlib import Path
from urllib.parse import urljoin, unquote
import re

# 설정
DOWNLOAD_DIR = Path("D:/찬송가_MP3")
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

LINKS_FILE = DOWNLOAD_DIR / "hymn_links.json"
PROGRESS_FILE = DOWNLOAD_DIR / "progress.json"

def sanitize_filename(filename):
    """파일명 정리"""
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    return filename.strip()

def extract_hymn_number(url_or_text):
    """URL이나 텍스트에서 찬송가 번호 추출"""
    match = re.search(r'(\d+)장', url_or_text)
    if match:
        return int(match.group(1))
    return None

def load_json(filepath):
    """JSON 파일 로드"""
    if filepath.exists():
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def save_json(filepath, data):
    """JSON 파일 저장"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def download_file(url, filepath, hymn_no):
    """파일 다운로드"""
    try:
        # 이미 존재하는 파일 확인
        if filepath.exists() and filepath.stat().st_size > 10000:  # 10KB 이상
            print(f"✅ [{hymn_no:03d}] 이미 존재: {filepath.name}")
            return True
        
        # 다운로드
        response = requests.get(url, timeout=60, stream=True)
        
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            
            file_size = filepath.stat().st_size / (1024 * 1024)  # MB
            print(f"✅ [{hymn_no:03d}] 다운로드 완료: {filepath.name} ({file_size:.2f} MB)")
            return True
        else:
            print(f"❌ [{hymn_no:03d}] HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ [{hymn_no:03d}] 오류: {str(e)}")
        return False

def download_from_page(page_url, hymn_no, title):
    """찬송가 페이지에서 MP3 다운로드"""
    try:
        # 페이지 HTML 가져오기
        response = requests.get(page_url, timeout=30)
        html = response.text
        
        # MP3 URL 찾기 (여러 패턴 시도)
        mp3_url = None
        
        # 패턴 1: audio src 또는 source src
        audio_match = re.search(r'<audio[^>]*src=["\']([^"\']*tfile\.mp3[^"\']*)["\']', html)
        if audio_match:
            mp3_url = audio_match.group(1)
        
        if not mp3_url:
            # 패턴 2: source 태그
            source_match = re.search(r'<source[^>]*src=["\']([^"\']*tfile\.mp3[^"\']*)["\']', html)
            if source_match:
                mp3_url = source_match.group(1)
        
        if not mp3_url:
            # 패턴 3: 일반 링크
            link_match = re.search(r'href=["\']([^"\']*tfile\.mp3[^"\']*)["\']', html)
            if link_match:
                mp3_url = link_match.group(1)
        
        if not mp3_url:
            print(f"❌ [{hymn_no:03d}] MP3 링크를 찾을 수 없습니다")
            return False
        
        # 상대 URL을 절대 URL로 변환
        mp3_url = urljoin(page_url, mp3_url)
        
        # 파일명 생성
        safe_title = sanitize_filename(title)
        filename = f"{hymn_no:03d}_{safe_title}.mp3"
        filepath = DOWNLOAD_DIR / filename
        
        # 다운로드
        return download_file(mp3_url, filepath, hymn_no)
        
    except Exception as e:
        print(f"❌ [{hymn_no:03d}] 페이지 오류: {str(e)}")
        return False

def main():
    """메인 함수"""
    print("=" * 80)
    print("🎵 찬송가 MP3 자동 다운로드")
    print(f"📁 저장 경로: {DOWNLOAD_DIR}")
    print("=" * 80)
    
    # 찬송가 링크 데이터 (브라우저에서 추출한 데이터 사용)
    # 실제로는 목록 페이지를 스크래핑하거나 미리 준비된 데이터 사용
    hymn_data = {
        1: {"title": "만복의 근원 하나님", "url": "https://risen.runean.com/entry/새찬송가-1장-만복의-근원-하나님-가사악보NWC"},
        2: {"title": "찬양 성부 성자 성령", "url": "https://risen.runean.com/entry/새찬송가-2장-찬양-성부-성자-성령-가사악보NWC"},
        # ... 전체 645곡 데이터
    }
    
    # 진행 상황 로드
    progress = load_json(PROGRESS_FILE)
    if "completed" not in progress:
        progress = {"completed": [], "failed": []}
    
    # 다운로드 시작
    for hymn_no in range(1, 646):
        # 이미 완료된 곡 스킵
        if hymn_no in progress["completed"]:
            continue
        
        # 찬송가 정보 가져오기
        hymn_info = hymn_data.get(hymn_no)
        if not hymn_info:
            print(f"⚠️  [{hymn_no:03d}] 정보 없음")
            continue
        
        title = hymn_info["title"]
        url = hymn_info["url"]
        
        print(f"\n[{hymn_no}/645] {title}")
        
        # 다운로드 시도
        if download_from_page(url, hymn_no, title):
            progress["completed"].append(hymn_no)
        else:
            progress["failed"].append(hymn_no)
        
        # 진행 상황 저장
        save_json(PROGRESS_FILE, progress)
        
        # 진행률 표시
        if hymn_no % 10 == 0:
            completed = len(progress["completed"])
            failed = len(progress["failed"])
            print(f"\n📊 진행률: {hymn_no}/645 ({hymn_no/645*100:.1f}%)")
            print(f"✅ 성공: {completed} | ❌ 실패: {failed}")
        
        # 서버 부하 방지
        time.sleep(0.5)
    
    # 최종 결과
    print("\n" + "=" * 80)
    print("🎉 다운로드 완료!")
    print(f"✅ 성공: {len(progress['completed'])}/645")
    print(f"❌ 실패: {len(progress['failed'])}/645")
    
    if progress["failed"]:
        print(f"\n실패한 곡 번호 (처음 20개): {progress['failed'][:20]}")

if __name__ == "__main__":
    main()
