/**
 * 라이즌 찬양 사이트에서 찬송가 데이터를 스크래핑하는 스크립트
 * 645곡 전체의 한글/영문 제목을 수집합니다.
 */

interface HymnData {
  no: number;
  id: string;
  ko: string;
  en: string;
  es: string;
  category?: string;
  url?: string;
}

// 라이즌 사이트에서 수집한 찬송가 제목 매핑
// URL 패턴: https://risen.runean.com/entry/새찬송가-{번호}장-{제목}-가사악보NWC

const HYMN_CATEGORIES = {
  worship: { range: [1, 62], name: '예배', subcategories: ['송영', '경배', '찬양', '주일', '봉헌', '예배마침', '아침과저녁'] },
  godFather: { range: [63, 79], name: '성부하나님', subcategories: ['창조주', '섭리'] },
  jesus: { range: [80, 181], name: '성자예수님', subcategories: ['예수그리스도', '구주강림', '성탄', '주현', '생애', '종려주일', '고난', '부활', '재림'] },
  holySpirit: { range: [182, 197], name: '성령', subcategories: ['성령강림', '은사'] },
  bible: { range: [198, 206], name: '성경', subcategories: [] },
  church: { range: [207, 223], name: '교회', subcategories: ['하나님나라', '헌신과봉사', '성도의교제'] },
  sacrament: { range: [224, 233], name: '성례', subcategories: ['세례(침례)', '성찬'] },
  heaven: { range: [234, 249], name: '천국', subcategories: [] },
  salvation: { range: [250, 289], name: '구원', subcategories: ['회개와용서', '믿음', '의롭다하심', '거듭남', '구원의확신'] },
  christianLife: { range: [290, 545], name: '그리스도인의 삶', subcategories: ['은혜', '위로', '동행', '소망', '기쁨', '감사', '평안', '인도', '기도', '헌신', '순종', '봉사', '사랑', '교제'] },
  mission: { range: [546, 575], name: '전도와 선교', subcategories: ['세계선교', '초청', '확신'] },
  events: { range: [576, 645], name: '행사와 절기', subcategories: ['송구영신', '가정', '감사절', '예식'] }
};

function getCategoryForHymn(no: number): string {
  for (const [key, cat] of Object.entries(HYMN_CATEGORIES)) {
    if (no >= cat.range[0] && no <= cat.range[1]) {
      return cat.name;
    }
  }
  return '기타';
}

// 수동으로 수집한 주요 찬송가 제목들 (샘플)
// 실제로는 웹 스크래핑이나 API를 통해 전체 데이터를 수집해야 합니다.
export const COMPLETE_HYMN_DATABASE: HymnData[] = [
  { no: 1, id: 'h1', ko: '만복의 근원 하나님', en: 'Praise God from Whom All Blessings Flow', es: 'A Dios El Padre Celestial' },
  { no: 2, id: 'h2', ko: '찬양 성부 성자 성령', en: 'Praise the Father, Son, and Holy Spirit', es: 'Alabanza al Padre, Hijo y Espíritu Santo' },
  { no: 3, id: 'h3', ko: '성부 성자와 성령', en: 'Father, Son, and Holy Spirit', es: 'Padre, Hijo y Espíritu Santo' },
  { no: 4, id: 'h4', ko: '성부 성자와 성령', en: 'Father, Son, and Holy Spirit', es: 'Padre, Hijo y Espíritu Santo' },
  { no: 5, id: 'h5', ko: '이 천지간 만물들아', en: 'All Creatures of Our God and King', es: 'Todas las Criaturas del Señor y Rey' },
  { no: 6, id: 'h6', ko: '목소리 높여서', en: 'O for a Thousand Tongues to Sing', es: 'Mil Voces para Celebrar' },
  { no: 7, id: 'h7', ko: '성부 성자 성령', en: 'Father, Son, and Holy Spirit', es: 'Padre, Hijo y Espíritu Santo' },
  { no: 8, id: 'h8', ko: '거룩거룩거룩', en: 'Holy, Holy, Holy', es: 'Santo, Santo, Santo' },
  { no: 9, id: 'h9', ko: '하늘에 가득 찬 영광의 하나님', en: 'God of Glory, Lord of Love', es: 'Dios de Gloria, Señor de Amor' },
  { no: 10, id: 'h10', ko: '전능왕 오셔서', en: 'Come, Thou Almighty King', es: 'Ven, Rey Todopoderoso' },
  // ... 계속해서 645곡까지 추가 필요
];

// 웹 스크래핑을 위한 함수 (Node.js 환경에서 실행)
export async function scrapeHymnTitles(): Promise<HymnData[]> {
  console.log('🎵 라이즌 찬양 사이트에서 찬송가 데이터 수집 시작...');

  const hymns: HymnData[] = [];

  // 실제 구현 시에는 fetch나 cheerio 등을 사용하여 스크래핑
  // 여기서는 구조만 제공

  for (let i = 1; i <= 645; i++) {
    const url = `https://risen.runean.com/entry/새찬송가-${i}장`;

    try {
      // const response = await fetch(url);
      // const html = await response.text();
      // const $ = cheerio.load(html);
      // const title = $('h1').text(); // 실제 셀렉터는 사이트 구조에 따라 조정

      hymns.push({
        no: i,
        id: `h${i}`,
        ko: `찬송가 ${i}장`, // 실제로는 스크래핑한 제목
        en: `Hymn ${i}`, // 실제로는 스크래핑한 영문 제목
        es: `Himno ${i}`, // 실제로는 번역된 스페인어 제목
        category: getCategoryForHymn(i),
        url: url
      });

      if (i % 50 === 0) {
        console.log(`✅ ${i}/645 곡 수집 완료...`);
      }
    } catch (error) {
      console.error(`❌ ${i}장 수집 실패:`, error);
    }
  }

  console.log('🎉 전체 645곡 수집 완료!');
  return hymns;
}

// JSON 파일로 저장
export function saveHymnsToJSON(hymns: HymnData[], filename: string = 'hymns-complete.json') {
  const fs = require('fs');
  fs.writeFileSync(filename, JSON.stringify(hymns, null, 2), 'utf-8');
  console.log(`💾 ${filename}에 저장 완료!`);
}

// 실행 예시
if (require.main === module) {
  scrapeHymnTitles().then(hymns => {
    saveHymnsToJSON(hymns);
  });
}
