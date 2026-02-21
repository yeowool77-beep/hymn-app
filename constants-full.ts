
export interface HymnDef {
    no: number;
    id: string;
    ko: string;
    en: string;
    es: string;
    category?: string;
}

// 전체 645곡 찬송가 데이터베이스
export const COMPLETE_HYMN_TREASURY: HymnDef[] = [
    { no: 1, id: 'h1', ko: '만복의 근원 하나님', en: 'Praise God from Whom All Blessings Flow', es: 'A Dios El Padre Celestial', category: '예배' },
    { no: 2, id: 'h2', ko: '찬양 성부 성자 성령', en: 'Praise the Father, Son, and Holy Spirit', es: 'Alabanza al Padre, Hijo y Espíritu Santo', category: '예배' },
    { no: 3, id: 'h3', ko: '성부 성자와 성령', en: 'Father, Son, and Holy Spirit', es: 'Padre, Hijo y Espíritu Santo', category: '예배' },
    { no: 4, id: 'h4', ko: '성부 성자와 성령', en: 'Father, Son, and Holy Spirit', es: 'Padre, Hijo y Espíritu Santo', category: '예배' },
    { no: 5, id: 'h5', ko: '이 천지간 만물들아', en: 'All Creatures of Our God and King', es: 'Todas las Criaturas del Señor y Rey', category: '예배' },
    { no: 6, id: 'h6', ko: '목소리 높여서', en: 'O for a Thousand Tongues to Sing', es: 'Mil Voces para Celebrar', category: '예배' },
    { no: 7, id: 'h7', ko: '성부 성자 성령', en: 'Father, Son, and Holy Spirit', es: 'Padre, Hijo y Espíritu Santo', category: '예배' },
    { no: 8, id: 'h8', ko: '거룩 거룩 거룩', en: 'Holy, Holy, Holy', es: 'Santo, Santo, Santo', category: '예배' },
    { no: 9, id: 'h9', ko: '하늘에 가득 찬 영광의 하나님', en: 'God of Glory, Lord of Love', es: 'Dios de Gloria, Señor de Amor', category: '예배' },
    { no: 10, id: 'h10', ko: '전능왕 오셔서', en: 'Come, Thou Almighty King', es: 'Ven, Rey Todopoderoso', category: '예배' },
    { no: 11, id: 'h11', ko: '홀로 한 분 하나님께', en: 'To God Be the Glory', es: 'A Dios Sea la Gloria', category: '예배' },
    { no: 12, id: 'h12', ko: '다 함께 주를 경배하세', en: 'O Come, Let Us Adore Him', es: 'Venid, Adoremos', category: '예배' },
    { no: 13, id: 'h13', ko: '영원한 하늘나라', en: 'Eternal Kingdom', es: 'Reino Eterno', category: '예배' },
    { no: 14, id: 'h14', ko: '주 우리 하나님', en: 'Lord Our God', es: 'Señor Nuestro Dios', category: '예배' },
    { no: 15, id: 'h15', ko: '하나님의 크신 사랑', en: 'The Love of God', es: 'El Amor de Dios', category: '예배' },
    { no: 16, id: 'h16', ko: '은혜로신 하나님 우리 주 하나님', en: 'Gracious God, Our Lord', es: 'Dios Misericordioso', category: '예배' },
    { no: 17, id: 'h17', ko: '사랑의 하나님', en: 'God of Love', es: 'Dios de Amor', category: '예배' },
    { no: 18, id: 'h18', ko: '성도들아 찬양하자', en: 'Saints, Let Us Praise', es: 'Santos, Alabemos', category: '예배' },
    { no: 19, id: 'h19', ko: '찬송하는 소리 있어', en: 'Joyful, Joyful, We Adore Thee', es: 'Alegres, Alegres, Te Adoramos', category: '예배' },
    { no: 20, id: 'h20', ko: '큰 영광 중에 계신 주', en: 'Lord in Glory', es: 'Señor en Gloria', category: '예배' },
    { no: 21, id: 'h21', ko: '다 찬양하여라', en: 'Praise to the Lord, the Almighty', es: 'Lobe den Herren', category: '예배' },
    // ... 계속해서 645곡까지 (여기서는 샘플만 표시)
    // 실제로는 스크래핑한 전체 데이터를 사용
];

export const HYMN_CATEGORIES = {
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

export function getCategoryForHymn(no: number): string {
    for (const [key, cat] of Object.entries(HYMN_CATEGORIES)) {
        if (no >= cat.range[0] && no <= cat.range[1]) {
            return cat.name;
        }
    }
    return '기타';
}

export const HYMN_GENRES = [
    "Auto (AI Recommended)",
    "Lo-Fi Chill Hop",
    "Vintage Motown Soul",
    "Smooth Gospel Jazz",
    "Neoclassical Ambient",
    "Bossa Nova Sanctuary",
    "Soulful R&B Revival"
];

export const BPM_OPTIONS = ["Auto (AI Recommended)", "65", "70", "75", "80", "85", "90", "95"];

export const BACKGROUND_TEXTURES = [
    "Rain & distant Thunder",
    "Vinyl Crackle & Tape Hiss",
    "Soft Cafe Ambience",
    "Church Bell Reverb",
    "Wind & Chimes"
];

export const INTRO_STRATEGIES = [
    "Nature Start",
    "Faded Organ",
    "Vinyl Crackle",
    "Cold Open"
];

export const LANGUAGES = [
    { value: 'Korean', label: '한국어 (KR)', flag: '🇰🇷' },
    { value: 'English', label: 'English (US)', flag: '🇺🇸' },
    { value: 'Spanish', label: 'Español (ES)', flag: '🇪🇸' }
];
