
export interface HymnDef {
  no: number;
  id: string;
  ko: string;
  en: string;
  es: string;
  category?: string;
}

function getCategoryForHymn(no: number): string {
  if (no >= 1 && no <= 62) return '예배';
  if (no >= 63 && no <= 79) return '성부하나님';
  if (no >= 80 && no <= 181) return '성자예수님';
  if (no >= 182 && no <= 197) return '성령';
  if (no >= 198 && no <= 206) return '성경';
  if (no >= 207 && no <= 223) return '교회';
  if (no >= 224 && no <= 233) return '성례';
  if (no >= 234 && no <= 249) return '천국';
  if (no >= 250 && no <= 289) return '구원';
  if (no >= 290 && no <= 545) return '그리스도인의 삶';
  if (no >= 546 && no <= 575) return '전도와 선교';
  if (no >= 576 && no <= 645) return '행사와 절기';
  return '기타';
}

// 전체 645곡 찬송가 데이터베이스 (자동 생성)
export const GLOBAL_HYMN_TREASURY: HymnDef[] = Array.from({ length: 645 }, (_, i) => {
  const no = i + 1;
  return {
    no,
    id: `h${no}`,
    ko: `찬송가 ${no}장`,
    en: `Hymn ${no}`,
    es: `Himno ${no}`,
    category: getCategoryForHymn(no)
  };
});

// 실제 제목이 있는 찬송가들 (브라우저에서 추출한 데이터)
const KNOWN_TITLES: Record<number, { ko: string; en: string }> = {
  1: { ko: '만복의 근원 하나님', en: 'Praise God from Whom All Blessings Flow' },
  2: { ko: '찬양 성부 성자 성령', en: 'Praise the Father, Son, and Holy Spirit' },
  3: { ko: '성부 성자와 성령', en: 'Father, Son, and Holy Spirit' },
  4: { ko: '성부 성자와 성령', en: 'Father, Son, and Holy Spirit' },
  5: { ko: '이 천지간 만물들아', en: 'All Creatures of Our God and King' },
  6: { ko: '목소리 높여서', en: 'O for a Thousand Tongues to Sing' },
  7: { ko: '성부 성자 성령', en: 'Father, Son, and Holy Spirit' },
  8: { ko: '거룩 거룩 거룩', en: 'Holy, Holy, Holy' },
  9: { ko: '하늘에 가득 찬 영광의 하나님', en: 'God of Glory, Lord of Love' },
  10: { ko: '전능왕 오셔서', en: 'Come, Thou Almighty King' },
  21: { ko: '다 찬양하여라', en: 'Praise to the Lord, the Almighty' },
  28: { ko: '복의 근원 강림 하사', en: 'Come, Thou Fount of Every Blessing' },
  31: { ko: '찬양하라 복되신 구세주 예수', en: 'Praise Him! Praise Him!' },
  40: { ko: '주 하나님 지으신 모든 세계', en: 'How Great Thou Art' },
  79: { ko: '주 하나님 지으신 모든 세계', en: 'How Great Thou Art' },
  88: { ko: '내 진정 사모하는', en: 'The Lily of the Valley' },
  94: { ko: '주 예수보다 더 귀한 것은 없네', en: 'I\'d Rather Have Jesus' },
  151: { ko: '만왕의 왕 내 주께서', en: 'At the Cross' },
  204: { ko: '주의 말씀 듣고서', en: 'The B-I-B-L-E' },
  301: { ko: '지금까지 지내온 것', en: 'God\'s Great Grace It Is has Brought Us' },
  305: { ko: '나 같은 죄인 살리신', en: 'Amazing Grace' },
  338: { ko: '내 주를 가까이 하게 함은', en: 'Nearer, My God, to Thee' },
  370: { ko: '주 안에 있는 나에게', en: 'The Trusting Heart to Jesus Clings' },
  382: { ko: '너 근심 걱정 말아라', en: 'God Will Take Care of You' },
  413: { ko: '내 평생에 가는 길', en: 'It is Well with My Soul' },
  427: { ko: '내가 매일 기쁘게', en: 'I\'m Rejoicing Night and Day' },
  435: { ko: '나의 영원하신 기업', en: 'Close to Thee' },
  438: { ko: '내 영혼이 은총 입어', en: 'Since Christ My Soul From Sin Set Free' },
  491: { ko: '저 높은 곳을 향하여', en: 'I\'m Pressing on the Upward Way' },
  545: { ko: '이 눈에 아무 증거 아니 뵈어도', en: 'Standing on the Promises' },
};

// 알려진 제목으로 업데이트
Object.entries(KNOWN_TITLES).forEach(([noStr, titles]) => {
  const no = parseInt(noStr);
  const hymn = GLOBAL_HYMN_TREASURY.find(h => h.no === no);
  if (hymn) {
    hymn.ko = titles.ko;
    hymn.en = titles.en;
  }
});

export const HYMN_GENRES = [
  "Auto (AI Recommended)",
  "Neo-Soul Spiritual (Warm & Sophisticated)",
  "Minimal Melodic Ambient (Atmospheric & Deep)",
  "Modern Classical Glow-up (Peaceful & Grand)",
  "Organic Chillhop Sanctuary (Relaxing & Human)",
  "Deep House Meditation (Soft Pulses & Steady)",
  "Ethereal Dream Pop (Moody & Spacious)",
  "Contemporary Gospel Jazz (Smooth & Uplifting)",
  "Nordic Noir Ambient (Cool & Contemplative)",
  "Soulful R&B Revival (Emotional & Authentic)",
  "Minimalist Piano & Cello (Intimate & Pure)",
  "Lo-fi Analog Textures (Warm & Nostalgic)"
];

export const BPM_OPTIONS = ["Auto (AI Recommended)", "75", "82", "88", "92", "96", "105", "110"];

export const BACKGROUND_TEXTURES = [
  "Soft Rain & distant Thunder",
  "Warm Vinyl Crackle",
  "Gentle Wind & Distant Bells",
  "Deep Forest Ambience",
  "Ocean Waves (Gentle)",
  "Analog Tape Warmth",
  "Cosmic Background Hum"
];

export const INTRO_STRATEGIES = [
  "Nature Start",
  "Faded Digital Organ",
  "Glitch Artifacts",
  "Cinematic Rise",
  "Cold Open (Vocals Only)",
  "Synthesizer Pad Swell",
  "Ambient Texture Fade-in"
];

export const LANGUAGES = [
  { value: 'Korean', label: '한국어 (KR)', flag: '🇰🇷' },
  { value: 'English', label: 'English (US)', flag: '🇺🇸' },
  { value: 'Spanish', label: 'Español (ES)', flag: '🇪🇸' }
];
