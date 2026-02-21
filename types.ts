
export interface MultiLyrics {
  ko: string;
  en: string;
  es: string;
}

export interface MultiCovers {
  ko: string | null;
  en: string | null;
  es: string | null;
}

export interface PromptData {
  title: string; 
  titles: {
    ko: string;
    en: string;
    es: string;
  };
  stylePrompt: string;
  structure: string[];
  lyrics: string | null; 
  multiLyrics: MultiLyrics;
  multiCovers?: MultiCovers; 
  theoryExplanation: string; 
  videoPrompt: string; 
  youtubeDescription: string; 
  tags: {
    genre: string;
    bpm: string;
    key: string;
    vibe: string;
    era: string; 
    language: string;
  };
  sunoParameters: {
    styleInfluence: number;
    weirdness: number;
    vocalGender: string;
    recommendedModel: string;
  };
  sources?: string[]; // Grounding URLs
  coverArt?: string; 
}

export interface UserPreferences {
  hymnTheme: string; 
  language: 'Korean' | 'English' | 'Spanish';
  vibe: string;
  genre: string;
  complexity: 'Simple' | 'Balanced' | 'Complex';
  lyricsPreference: 'Instrumental' | 'Generate Lyrics';
  era: string; 
  artistReference: string; 
  focusMode: string; 
  backgroundTexture: string;
  neuroHook: boolean; 
  introStrategy: string; 
  viralContext: string; 
  bpm: string; 
}

export interface HistoryItem extends PromptData {
  id: string;
  timestamp: number;
}
