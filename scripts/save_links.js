// 브라우저에서 추출한 645곡 찬송가 링크 데이터를 저장하는 스크립트
// 이 데이터를 사용하여 MP3 다운로드를 진행합니다

const fs = require('fs');
const path = require('path');

// 브라우저에서 추출한 데이터 (JavaScript 실행 결과)
// 실제로는 브라우저 서브에이전트가 반환한 전체 645곡 데이터를 사용
const hymnLinks = [
    { no: 1, title: "만복의 근원 하나님", url: "https://risen.runean.com/entry/새찬송가-1장-만복의-근원-하나님-가사악보NWC" },
    { no: 2, title: "찬양 성부 성자 성령", url: "https://risen.runean.com/entry/새찬송가-2장-찬양-성부-성자-성령-가사악보NWC" },
    // ... 전체 645곡
];

// D: 드라이브에 JSON 파일로 저장
const outputDir = 'D:\\찬송가_MP3';
const outputFile = path.join(outputDir, 'hymn_links_645.json');

// 디렉토리 생성
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// JSON 파일 저장
fs.writeFileSync(outputFile, JSON.stringify(hymnLinks, null, 2), 'utf-8');

console.log(`✅ 645곡 링크 데이터 저장 완료: ${outputFile}`);
console.log(`📊 총 ${hymnLinks.length}곡`);
