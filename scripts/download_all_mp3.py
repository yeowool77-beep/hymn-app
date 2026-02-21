"""
라이즌 사이트에서 645곡 찬송가 MP3 파일을 D: 드라이브에 자동 다운로드
브라우저에서 추출한 실제 링크 데이터 사용
"""

import requests
import time
import re
from pathlib import Path
from bs4 import BeautifulSoup
import json

# 설정
DOWNLOAD_DIR = Path("D:/찬송가_MP3")
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

PROGRESS_FILE = DOWNLOAD_DIR / "progress.json"
LOG_FILE = DOWNLOAD_DIR / "download_log.txt"

def log(message):
    """로그 출력 및 파일 저장"""
    print(message)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        f.write(f"[{timestamp}] {message}\n")

def sanitize_filename(filename):
    """파일명에서 특수문자 제거"""
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    return filename.strip()

def load_progress():
    """진행 상황 로드"""
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"completed": [], "failed": [], "total": 0}

def save_progress(progress):
    """진행 상황 저장"""
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)

def extract_mp3_url(page_url):
    """찬송가 페이지에서 MP3 URL 추출"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(page_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 방법 1: audio 태그 찾기
        audio = soup.find('audio')
        if audio and audio.get('src'):
            return audio['src']
        
        # 방법 2: audio > source 태그 찾기
        source = soup.find('source')
        if source and source.get('src'):
            return source['src']
        
        # 방법 3: 정규식으로 MP3 URL 찾기
        mp3_match = re.search(r'(https?://[^"\s]+tfile\.mp3[^"\s]*)', response.text)
        if mp3_match:
            return mp3_match.group(1)
        
        return None
        
    except Exception as e:
        log(f"  ⚠️  페이지 로드 오류: {str(e)}")
        return None

def download_mp3(mp3_url, filepath, hymn_no):
    """MP3 파일 다운로드"""
    try:
        # 이미 존재하는 파일 확인
        if filepath.exists() and filepath.stat().st_size > 10000:  # 10KB 이상
            file_size = filepath.stat().st_size / (1024 * 1024)
            log(f"  ✅ 이미 존재 ({file_size:.2f} MB)")
            return True
        
        # 다운로드
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(mp3_url, headers=headers, timeout=60, stream=True)
        response.raise_for_status()
        
        # 파일 저장
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        file_size = filepath.stat().st_size / (1024 * 1024)
        log(f"  ✅ 다운로드 완료 ({file_size:.2f} MB)")
        return True
        
    except Exception as e:
        log(f"  ❌ 다운로드 실패: {str(e)}")
        return False

def download_hymn(hymn_no, title, url):
    """찬송가 MP3 다운로드 (전체 프로세스)"""
    try:
        # 파일명 생성
        safe_title = sanitize_filename(title)
        filename = f"{hymn_no:03d}_{safe_title}.mp3"
        filepath = DOWNLOAD_DIR / filename
        
        log(f"\n[{hymn_no}/645] {title}")
        log(f"  🔗 {url}")
        
        # MP3 URL 추출
        mp3_url = extract_mp3_url(url)
        
        if not mp3_url:
            log(f"  ❌ MP3 링크를 찾을 수 없습니다")
            return False
        
        log(f"  🎵 MP3 URL: {mp3_url[:80]}...")
        
        # MP3 다운로드
        return download_mp3(mp3_url, filepath, hymn_no)
        
    except Exception as e:
        log(f"  ❌ 오류: {str(e)}")
        return False

def main():
    """메인 함수"""
    log("=" * 80)
    log("🎵 찬송가 MP3 자동 다운로드 시작")
    log(f"📁 저장 경로: {DOWNLOAD_DIR}")
    log("=" * 80)
    
    # 진행 상황 로드
    progress = load_progress()
    
    # 찬송가 링크 데이터 (브라우저에서 추출한 실제 데이터)
    # 여기에 전체 645곡 데이터를 포함해야 합니다
    hymn_links = [
        {"no": 1, "title": "만복의 근원 하나님", "url": "https://risen.runean.com/entry/새찬송가-1장-만복의-근원-하나님-가사악보NWC"},
        {"no": 2, "title": "찬양 성부 성자 성령", "url": "https://risen.runean.com/entry/새찬송가-2장-찬양-성부-성자-성령-가사악보NWC"},
        {"no": 3, "title": "성부 성자와 성령", "url": "https://risen.runean.com/entry/새찬송가-3장-성부-성자와-성령-가사악보NWC"},
        {"no": 4, "title": "성부 성자와 성령", "url": "https://risen.runean.com/entry/새찬송가-4장-성부-성자와-성령-가사악보NWC"},
        {"no": 5, "title": "이 천지간 만물들아", "url": "https://risen.runean.com/entry/새찬송가-5장-이-천지간-만물들아-가사악보NWC"},
        # ... 전체 645곡 데이터가 필요합니다
        # 실제로는 브라우저에서 추출한 전체 데이터를 사용해야 합니다
    ]
    
    log(f"📊 총 {len(hymn_links)}곡 다운로드 예정")
    
    # 다운로드 시작
    for hymn in hymn_links:
        hymn_no = hymn["no"]
        
        # 이미 완료된 곡 스킵
        if hymn_no in progress["completed"]:
            log(f"\n[{hymn_no}/645] {hymn['title']} - 이미 완료됨 (스킵)")
            continue
        
        # 다운로드 시도
        if download_hymn(hymn_no, hymn["title"], hymn["url"]):
            progress["completed"].append(hymn_no)
            progress["total"] = len(progress["completed"])
        else:
            progress["failed"].append(hymn_no)
        
        # 진행 상황 저장
        save_progress(progress)
        
        # 진행률 표시
        if hymn_no % 10 == 0:
            completed = len(progress["completed"])
            failed = len(progress["failed"])
            log(f"\n📊 진행률: {hymn_no}/{len(hymn_links)} ({hymn_no/len(hymn_links)*100:.1f}%)")
            log(f"   ✅ 성공: {completed} | ❌ 실패: {failed}")
        
        # 서버 부하 방지 (0.5초 대기)
        time.sleep(0.5)
    
    # 최종 결과
    log("\n" + "=" * 80)
    log("🎉 다운로드 완료!")
    log(f"✅ 성공: {len(progress['completed'])}/{len(hymn_links)}")
    log(f"❌ 실패: {len(progress['failed'])}/{len(hymn_links)}")
    
    if progress["failed"]:
        log(f"\n실패한 곡 번호: {progress['failed'][:20]}")
        log(f"(총 {len(progress['failed'])}곡 실패)")

if __name__ == "__main__":
    main()
