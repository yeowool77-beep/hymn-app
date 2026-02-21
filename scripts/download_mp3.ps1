"""
PowerShell을 사용한 간단한 MP3 다운로드 스크립트
각 찬송가 페이지의 링크를 수집하고 MP3를 다운로드
"""

# 찬송가 목록 페이지에서 모든 링크 추출
$listUrl = "https://risen.runean.com/entry/찬송가-목록"

# 현재 스크립트 위치 기준으로 data/mp3 폴더 지정
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$downloadDir = Join-Path $scriptDir "..\data\mp3"

# 디렉토리 생성
if (!(Test-Path $downloadDir)) {
    New-Item -ItemType Directory -Path $downloadDir | Out-Null
}

Write-Host "🎵 찬송가 MP3 다운로드 시작..." -ForegroundColor Green
Write-Host "📁 저장 경로: $downloadDir" -ForegroundColor Cyan
Write-Host "=" * 80

# 찬송가 번호별로 다운로드
for ($i = 1; $i -le 645; $i++) {
    try {
        # 찬송가 페이지 URL (패턴은 실제 사이트에 맞게 조정 필요)
        $hymnUrl = "https://risen.runean.com/entry/찬송가-$i장"
        
        Write-Host "[$i/645] 다운로드 중..." -NoNewline
        
        # 웹 페이지 가져오기
        $response = Invoke-WebRequest -Uri $hymnUrl -UseBasicParsing
        
        # MP3 링크 찾기 (audio 태그 또는 tfile.mp3 링크)
        $mp3Link = $response.Links | Where-Object { $_.href -like "*tfile.mp3*" } | Select-Object -First 1
        
        if ($mp3Link) {
            $mp3Url = $mp3Link.href
            $fileName = "{0:D3}_찬송가_{1}장.mp3" -f $i, $i
            $filePath = Join-Path $downloadDir $fileName
            
            # 이미 다운로드된 파일 확인
            if (Test-Path $filePath) {
                Write-Host " ✅ 이미 존재" -ForegroundColor Yellow
                continue
            }
            
            # MP3 다운로드
            Invoke-WebRequest -Uri $mp3Url -OutFile $filePath
            
            $fileSize = (Get-Item $filePath).Length / 1MB
            Write-Host " ✅ 완료 ($([math]::Round($fileSize, 2)) MB)" -ForegroundColor Green
        }
        else {
            Write-Host " ❌ MP3 링크 없음" -ForegroundColor Red
        }
        
        # 서버 부하 방지 (0.5초 대기)
        Start-Sleep -Milliseconds 500
        
        # 진행률 표시
        if ($i % 50 -eq 0) {
            Write-Host "`n📊 진행률: $i/645 ($([math]::Round($i/645*100, 1))%)" -ForegroundColor Cyan
        }
    }
    catch {
        Write-Host " ❌ 오류: $_" -ForegroundColor Red
    }
}

Write-Host "`n" + ("=" * 80)
Write-Host "🎉 다운로드 완료!" -ForegroundColor Green

# 다운로드된 파일 수 확인
$fileCount = (Get-ChildItem -Path $downloadDir -Filter "*.mp3").Count
Write-Host "✅ 다운로드된 파일: $fileCount/645" -ForegroundColor Cyan
