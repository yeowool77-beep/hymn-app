"""
브라우저 자동화를 통한 실시간 MP3 다운로드
목록 페이지에서 링크를 하나씩 방문하며 MP3 다운로드
"""

import requests
import time
import re
from pathlib import Path
from bs4 import BeautifulSoup
import json

# 설정 (프로젝트 폴더 내 relative path 사용)
BASE_DIR = Path(__file__).parent.parent
DOWNLOAD_DIR = BASE_DIR / "data" / "mp3"
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

PROGRESS_FILE = DOWNLOAD_DIR / "progress.json"
LOG_FILE = DOWNLOAD_DIR / "download_log.txt"

# 라이즌 사이트 목록 페이지
LIST_URL = "https://risen.runean.com/entry/찬송가-목록"

def log(message):
    """로그 출력"""
    print(message)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
        f.write(f"[{timestamp}] {message}\n")

def sanitize_filename(filename):
    """파일명 정리"""
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    return filename.strip()

def load_progress():
    """진행 상황 로드"""
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"completed": [], "failed": [], "links": {}}

def save_progress(progress):
    """진행 상황 저장"""
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)

def extract_all_hymn_links():
    """목록 페이지에서 모든 찬송가 링크 추출"""
    try:
        log("📋 찬송가 목록 페이지에서 링크 추출 중...")
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(LIST_URL, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 모든 링크 찾기
        links = soup.find_all('a')
        hymn_links = {}
        
        for link in links:
            text = link.get_text().strip()
            href = link.get('href', '')
            
            # "찬송가 X장 바로가기" 패턴 찾기
            if '찬송가' in text and '장' in text and '바로가기' in text:
                # 번호 추출
                match = re.search(r'찬송가\s+(\d+)장', text)
                if match:
                    hymn_no = int(match.group(1))
                    
                    # 제목 추출 (URL에서)
                    title_match = re.search(r'장-(.*?)-가사', href)
                    if title_match:
                        title = title_match.group(1).replace('-', ' ')
                    else:
                        title = f"찬송가 {hymn_no}장"
                    
                    hymn_links[hymn_no] = {
                        "no": hymn_no,
                        "title": title,
                        "url": href if href.startswith('http') else f"https://risen.runean.com{href}"
                    }
        
        log(f"✅ {len(hymn_links)}곡 링크 추출 완료")
        return hymn_links
        
    except Exception as e:
        log(f"❌ 링크 추출 실패: {str(e)}")
        return {}

def extract_mp3_url(page_url):
    """페이지에서 MP3 URL 추출"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(page_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # 정규식으로 MP3 URL 찾기
        mp3_match = re.search(r'(https?://[^"\s]+tfile\.mp3[^"\s]*)', response.text)
        if mp3_match:
            return mp3_match.group(1)
        
        # BeautifulSoup으로 audio 태그 찾기
        soup = BeautifulSoup(response.text, 'html.parser')
        audio = soup.find('audio')
        if audio and audio.get('src'):
            return audio['src']
        
        source = soup.find('source')
        if source and source.get('src'):
            return source['src']
        
        return None
        
    except Exception as e:
        return None

def download_mp3(mp3_url, filepath):
    """MP3 다운로드"""
    try:
        if filepath.exists() and filepath.stat().st_size > 10000:
            return True
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(mp3_url, headers=headers, timeout=60, stream=True)
        response.raise_for_status()
        
        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
        
        return True
        
    except Exception as e:
        return False

def main():
    """메인 함수"""
    log("=" * 80)
    log("🎵 찬송가 MP3 자동 다운로드 (실시간 링크 추출)")
    log(f"📁 저장 경로: {DOWNLOAD_DIR}")
    log("=" * 80)
    
    # 진행 상황 로드
    progress = load_progress()
    
    # 찬송가 링크 추출
    if not progress.get("links"):
        hymn_links = extract_all_hymn_links()
        progress["links"] = hymn_links
        save_progress(progress)
    else:
        hymn_links = progress["links"]
        log(f"📋 저장된 링크 사용: {len(hymn_links)}곡")
    
    # 번호순으로 정렬
    sorted_hymns = sorted(hymn_links.items(), key=lambda x: x[0])
    
    log(f"\n🎵 총 {len(sorted_hymns)}곡 다운로드 시작\n")
    
    # 다운로드
    for hymn_no, hymn_data in sorted_hymns:
        # 이미 완료된 곡 스킵
        if hymn_no in progress["completed"]:
            continue
        
        title = hymn_data["title"]
        url = hymn_data["url"]
        
        log(f"[{hymn_no}/645] {title}")
        
        # MP3 URL 추출
        mp3_url = extract_mp3_url(url)
        
        if not mp3_url:
            log(f"  ❌ MP3 링크 없음")
            progress["failed"].append(hymn_no)
            save_progress(progress)
            continue
        
        # 파일명 생성
        safe_title = sanitize_filename(title)
        filename = f"{hymn_no:03d}_{safe_title}.mp3"
        filepath = DOWNLOAD_DIR / filename
        
        # 다운로드
        if download_mp3(mp3_url, filepath):
            file_size = filepath.stat().st_size / (1024 * 1024)
            log(f"  ✅ 완료 ({file_size:.2f} MB)")
            progress["completed"].append(hymn_no)
        else:
            log(f"  ❌ 다운로드 실패")
            progress["failed"].append(hymn_no)
        
        save_progress(progress)
        
        # 진행률 표시
        if hymn_no % 10 == 0:
            log(f"\n📊 진행률: {hymn_no}/645 ({hymn_no/645*100:.1f}%)")
            log(f"   ✅ 성공: {len(progress['completed'])} | ❌ 실패: {len(progress['failed'])}\n")
        
        # 서버 부하 방지
        time.sleep(0.5)
    
    # 최종 결과
    log("\n" + "=" * 80)
    log("🎉 다운로드 완료!")
    log(f"✅ 성공: {len(progress['completed'])}/645")
    log(f"❌ 실패: {len(progress['failed'])}/645")

if __name__ == "__main__":
    main()
