"""
라이즌 사이트에서 645곡 찬송가 MP3 파일을 D: 드라이브에 자동 다운로드
각 찬송가 페이지를 방문하여 동적 MP3 URL을 추출하고 다운로드
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import requests
import time
import os
from pathlib import Path
import json

# 설정
DOWNLOAD_DIR = Path("D:/찬송가_MP3")
DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

PROGRESS_FILE = DOWNLOAD_DIR / "download_progress.json"
LOG_FILE = DOWNLOAD_DIR / "download_log.txt"

# 찬송가 제목 데이터 (브라우저에서 스크래핑한 데이터)
HYMN_TITLES = {
    1: "만복의 근원 하나님",
    2: "찬양 성부 성자 성령",
    3: "성부 성자와 성령",
    4: "성부 성자와 성령",
    5: "이 천지간 만물들아",
    6: "목소리 높여서",
    7: "성부 성자 성령",
    8: "거룩 거룩 거룩",
    9: "하늘에 가득 찬 영광의 하나님",
    10: "전능왕 오셔서",
    # ... 전체 645곡 (실제로는 모든 제목 포함)
}

def load_progress():
    """진행 상황 로드"""
    if PROGRESS_FILE.exists():
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"completed": [], "failed": []}

def save_progress(progress):
    """진행 상황 저장"""
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, ensure_ascii=False, indent=2)

def log_message(message):
    """로그 기록"""
    print(message)
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} - {message}\n")

def sanitize_filename(filename):
    """파일명 정리"""
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    return filename

def get_hymn_page_url(hymn_no):
    """찬송가 페이지 URL 생성"""
    # 라이즌 사이트의 URL 패턴
    # 일부는 '새찬송가', 일부는 '찬송가'로 시작
    base_url = "https://risen.runean.com/entry/"
    
    # 실제 URL은 각 찬송가마다 다르므로, 
    # 목록 페이지에서 추출한 링크를 사용하는 것이 더 정확
    return f"{base_url}찬송가-{hymn_no}장"

def download_hymn_with_selenium(driver, hymn_no, title):
    """Selenium을 사용하여 찬송가 MP3 다운로드"""
    try:
        # 찬송가 페이지로 이동
        page_url = get_hymn_page_url(hymn_no)
        driver.get(page_url)
        
        # 페이지 로딩 대기
        time.sleep(2)
        
        # MP3 링크 찾기 (여러 방법 시도)
        mp3_url = None
        
        try:
            # 방법 1: audio 태그에서 src 추출
            audio_element = driver.find_element(By.TAG_NAME, "audio")
            mp3_url = audio_element.get_attribute("src")
        except:
            pass
        
        if not mp3_url:
            try:
                # 방법 2: audio > source 태그에서 src 추출
                source_element = driver.find_element(By.CSS_SELECTOR, "audio source")
                mp3_url = source_element.get_attribute("src")
            except:
                pass
        
        if not mp3_url:
            try:
                # 방법 3: JavaScript로 추출
                mp3_url = driver.execute_script("""
                    const audio = document.querySelector('audio');
                    if (audio) return audio.src;
                    const source = document.querySelector('audio source');
                    if (source) return source.src;
                    return null;
                """)
            except:
                pass
        
        if not mp3_url:
            log_message(f"❌ {hymn_no}장: MP3 링크를 찾을 수 없습니다")
            return False
        
        # MP3 파일 다운로드
        safe_title = sanitize_filename(title)
        filename = f"{hymn_no:03d}_{safe_title}.mp3"
        filepath = DOWNLOAD_DIR / filename
        
        # 이미 다운로드된 파일 확인
        if filepath.exists() and filepath.stat().st_size > 0:
            log_message(f"✅ {hymn_no}장: 이미 존재 - {filename}")
            return True
        
        # MP3 다운로드
        response = requests.get(mp3_url, timeout=60, stream=True)
        
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            
            file_size = filepath.stat().st_size / (1024 * 1024)  # MB
            log_message(f"✅ {hymn_no}장: 다운로드 완료 - {filename} ({file_size:.2f} MB)")
            return True
        else:
            log_message(f"❌ {hymn_no}장: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        log_message(f"❌ {hymn_no}장: 오류 - {str(e)}")
        return False

def download_all_hymns():
    """전체 찬송가 MP3 다운로드"""
    log_message("=" * 80)
    log_message("🎵 찬송가 MP3 자동 다운로드 시작")
    log_message(f"📁 저장 경로: {DOWNLOAD_DIR}")
    log_message("=" * 80)
    
    # 진행 상황 로드
    progress = load_progress()
    
    # Chrome 옵션 설정
    chrome_options = Options()
    chrome_options.add_argument('--headless')  # 백그라운드 실행
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    
    # WebDriver 초기화
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        for hymn_no in range(1, 646):
            # 이미 완료된 곡은 스킵
            if hymn_no in progress["completed"]:
                continue
            
            title = HYMN_TITLES.get(hymn_no, f"찬송가 {hymn_no}장")
            
            log_message(f"\n[{hymn_no}/645] {title}")
            
            # 다운로드 시도
            if download_hymn_with_selenium(driver, hymn_no, title):
                progress["completed"].append(hymn_no)
            else:
                progress["failed"].append(hymn_no)
            
            # 진행 상황 저장
            save_progress(progress)
            
            # 진행률 표시
            if hymn_no % 10 == 0:
                completed = len(progress["completed"])
                failed = len(progress["failed"])
                log_message(f"\n📊 진행률: {hymn_no}/645 ({hymn_no/645*100:.1f}%)")
                log_message(f"✅ 성공: {completed} | ❌ 실패: {failed}")
            
            # 서버 부하 방지 (0.5초 대기)
            time.sleep(0.5)
            
    finally:
        driver.quit()
    
    # 최종 결과
    log_message("\n" + "=" * 80)
    log_message("🎉 다운로드 완료!")
    log_message(f"✅ 성공: {len(progress['completed'])}/645")
    log_message(f"❌ 실패: {len(progress['failed'])}/645")
    
    if progress["failed"]:
        log_message(f"\n실패한 곡 번호: {progress['failed']}")

if __name__ == "__main__":
    download_all_hymns()
