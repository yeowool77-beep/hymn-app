
import { GoogleGenAI, Type } from "@google/genai";
import { PromptData, UserPreferences, MultiCovers } from "../types";

const cleanJson = (text: string) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

const getAi = () => {
  // 환경 변수에서 API 키 읽기
  let apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // No fallback for leaked key
  if (!apiKey) {
    console.warn('⚠️  VITE_GEMINI_API_KEY is missing. Please check .env.local file');
  }

  console.log('🔑 API Key Check:', {
    source: import.meta.env.VITE_GEMINI_API_KEY ? 'env' : 'fallback',
    exists: !!apiKey,
    length: apiKey?.length || 0,
    prefix: apiKey?.substring(0, 10) || 'none'
  });

  if (!apiKey) {
    console.error('❌ API Key not found!');
    console.log('Available env vars:', import.meta.env);
    throw new Error('An API Key must be set when running in a browser');
  }

  return new GoogleGenAI({ apiKey });
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    titles: {
      type: Type.OBJECT,
      properties: {
        ko: { type: Type.STRING },
        en: { type: Type.STRING },
        es: { type: Type.STRING },
      },
      required: ["ko", "en", "es"],
    },
    stylePrompt: { type: Type.STRING },
    structure: { type: Type.ARRAY, items: { type: Type.STRING } },
    multiLyrics: {
      type: Type.OBJECT,
      properties: {
        ko: { type: Type.STRING },
        en: { type: Type.STRING },
        es: { type: Type.STRING },
      },
      required: ["ko", "en", "es"],
    },
    theoryExplanation: { type: Type.STRING },
    videoPrompt: { type: Type.STRING },
    youtubeDescription: { type: Type.STRING },
    tags: {
      type: Type.OBJECT,
      properties: {
        genre: { type: Type.STRING },
        bpm: { type: Type.STRING },
        key: { type: Type.STRING },
        vibe: { type: Type.STRING },
        era: { type: Type.STRING },
        language: { type: Type.STRING },
      },
      required: ["genre", "bpm", "key", "vibe", "era", "language"],
    },
    sunoParameters: {
      type: Type.OBJECT,
      properties: {
        styleInfluence: { type: Type.NUMBER },
        weirdness: { type: Type.NUMBER },
        vocalGender: { type: Type.STRING },
        recommendedModel: { type: Type.STRING },
      },
      required: ["styleInfluence", "weirdness", "vocalGender", "recommendedModel"],
    }
  },
  required: ["title", "titles", "stylePrompt", "structure", "multiLyrics", "theoryExplanation", "videoPrompt", "youtubeDescription", "tags", "sunoParameters"],
};

export const generateSunoPrompt = async (prefs: UserPreferences): Promise<PromptData> => {
  const ai = getAi();
  const modelId = "gemini-3-flash-preview";

  const systemInstruction = `
    You are 'SacredArchitect Global Search', a world-class producer specializing in 'Sophisticated Easy Listening' and 'Emotional Ambience'.
    Your goal is to create hymn re-imaginings that are trendy and modern, yet comfortable enough for all-day listening (zero listening fatigue).
    
    1. SEARCH Google to find the official titles and FULL accurate lyrics (KR, EN, ES).
    2. MUSIC PHILOSOPHY: Focus on 'Warmth', 'Space', and 'Emotional Depth'. 
       - Avoid: Sharp high frequencies, overly aggressive beats, or jarring transitions.
       - Embrace: Soft transients, lush reverbs, warm analog tape saturation, and organic instrumentation.
    3. Generate a 'stylePrompt' for Suno AI using these guidelines:
       - Instruments: 'Muted Rhodes piano', 'Soft felt piano', 'Espressivo strings', 'Warm analog pads', 'Deep sub-bass', 'Organic shakers'.
       - Aesthetics: 'Hazy morning light', 'Sophisticated minimalist', 'Cinematic intimacy', 'Soulful sanctuary'.
       - Production: 'Humanized groove', 'Wide stereo image', 'Subtle tape hiss', 'Gentle sidechaining'.
    4. In 'sunoParameters', set 'weirdness' to a moderate level (0.2 - 0.4) to maintain musicality while staying unique. Focus on 'styleInfluence' (0.8 - 1.0) for high quality.
    5. Ensure multiLyrics contains the complete verses for each language.
    6. Provide the output in strictly valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Design a sophisticated, non-fatiguing masterwork for: ${prefs.hymnTheme}. 
                Selected Tone: ${prefs.genre || 'Emotional Easy Listening'}.
                Vibe: ${prefs.vibe || 'Warm, Peaceful, and Modern'}.
                The result must be trendy but perfect for all-day background listening.`,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const data = JSON.parse(cleanJson(response.text || "{}"));
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => chunk.web?.uri)
      .filter(Boolean) || [];

    return { ...data, lyrics: data.multiLyrics.en, sources };
  } catch (error: any) {
    throw error;
  }
};

export const updateStylePrompt = async (theme: string, genre: string, vibe: string): Promise<string> => {
  const ai = getAi();
  const modelId = "gemini-3-flash-preview";

  const systemInstruction = `
    You are 'SacredArchitect Global Search', a world-class producer specializing in 'Sophisticated Easy Listening' and 'Emotional Ambience'.
    Generate a 'stylePrompt' for Suno AI using these guidelines:
    
    1. MUSIC PHILOSOPHY: Focus on 'Warmth', 'Space', and 'Emotional Depth'. 
       - Avoid: Sharp high frequencies, overly aggressive beats, or jarring transitions.
       - Embrace: Soft transients, lush reverbs, warm analog tape saturation, and organic instrumentation.
    2. Style Components:
       - Instruments: 'Muted Rhodes piano', 'Soft felt piano', 'Espressivo strings', 'Warm analog pads', 'Deep sub-bass', 'Organic shakers'.
       - Aesthetics: 'Hazy morning light', 'Sophisticated minimalist', 'Cinematic intimacy', 'Soulful sanctuary'.
       - Production: 'Humanized groove', 'Wide stereo image', 'Subtle tape hiss', 'Gentle sidechaining'.
    3. The output must be a single string containing the style prompt.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Generate an optimized Suno style prompt for the hymn: ${theme}. 
                Genre: ${genre}.
                Vibe: ${vibe}.
                Make it trendy, modern, and non-fatiguing for all-day listening.`,
      config: {
        systemInstruction,
      },
    });

    return response.text?.trim() || "";
  } catch (error: any) {
    console.error("Update Style Error:", error);
    return "";
  }
};

// 🎨 새로운 이미지 생성 방식: 배경만 생성 후 Canvas로 텍스트 합성
export const generateMultiLanguageArtSequential = async (promptData: PromptData, lang: keyof MultiCovers): Promise<string | null> => {
  const ai = getAi();

  const title = promptData.titles?.[lang as keyof typeof promptData.titles] || promptData.title;

  // 🎨 그래픽 디자인 중심의 앨범 아트 스타일 (디자인 방법론 적용)
  const trendyStyles = [
    // 🇨🇭 Swiss Style (The International Typographic Style)
    "Professional Swiss Style graphic design, bold asymmetrical grid, clean geometric shapes, large areas of flat color, objective and functional aesthetic, Bauhaus influence, high-end editorial look",

    // 📖 Modern Editorial / Magazine Cover
    "High-end editorial fashion magazine cover aesthetic, sophisticated whitespace, minimalist photography with abstract light play, luxury brand visual language, clean and airy, Vogue-inspired layout",

    // 🔺 Minimalist Bauhaus
    "Bauhaus school of design inspired album cover, primary colors (red, blue, yellow) with black and white, geometric abstraction, circles and triangles, structural balance, vintage yet timeless design",

    // 🧊 Brutalist Web / Poster Design
    "Modern brutalist poster art, raw textures, bold typography grid, monochromatic with high contrast, avant-garde composition, architectural depth, urban and edgy yet sacred",

    // 🎭 Japanese Zen Minimalism
    "Contemporary Japanese minimalist graphic design, Muji-inspired aesthetic, extreme simplicity, subtle textures of washi paper, natural light and shadow play, zen-like tranquility, sophisticated void",

    // 💎 Neo-Modernist Prism
    "Neo-modernist glass and prism design, refraction of light, sharp geometric edges, clean transparency, corporate luxury aesthetic, futuristic but grounded in classic design principles",

    // 🖌️ Abstract Expressionist Collage
    "Modern abstract expressionist collage, mixed media textures, torn paper edges, layered paint strokes, sophisticated color palette (terracotta, slate, cream), artistic and organic",

    // 🎞️ Cinematic Cinephile Poster
    "Arthouse cinema poster aesthetic, dramatic low-angle shot, cinematic grain, wide aspect ratio feeling, moody and evocative lighting, a24 movie poster vibe, storytelling through single frame",

    // 📉 Data Visualization Art
    "Aesthetic data visualization art, intricate fine lines, topographic map patterns, complex yet clean, sacred geometry in a technical blueprint style, logical and spiritual",

    // 🪐 Retro-Futurist Space Age
    "1960s space age retro-futurism, matte textures, rounded geometric shapes, muted pastel mid-century colors, optimistic future aesthetic, Stanley Kubrick-inspired precision"
  ];

  // 랜덤 스타일 선택
  const randomStyle = trendyStyles[Math.floor(Math.random() * trendyStyles.length)];

  // 🎯 장르, 분위기, 시대상 추출 (promptData.tags에서)
  const genre = promptData.tags?.genre || 'Sacred Contemporary';
  const vibe = promptData.tags?.vibe || 'Peaceful and Uplifting';
  const era = promptData.tags?.era || 'Modern Minimalist';

  const langConfig = {
    ko: {
      style: randomStyle,
      font: "bold 52px 'Pretendard', 'Noto Sans KR', sans-serif",
      color: "#ffffff"
    },
    en: {
      style: randomStyle,
      font: "bold 48px 'Inter', 'Helvetica Neue', sans-serif",
      color: "#ffffff"
    },
    es: {
      style: randomStyle,
      font: "bold 50px 'Montserrat', 'Arial', sans-serif",
      color: "#ffffff"
    }
  };

  const config = langConfig[lang];

  // 영문/스페인어는 빠른 생성을 위해 flash, 한국어는 고품질 타이포그래피를 위해 pro 모델 사용 (아이디어 2번 적용)
  const imageModelId = lang === 'ko' ? "gemini-3-pro-image-preview" : "gemini-2.5-flash-image";

  // 한국어 전용 프롬프트 명시 (하이엔드 타이포그래피 지시 + 성스러운 분위기 강조)
  const textPromptKorean = `
Integrate the following Korean text beautifully and reverently into the design: "${title}".
Make the Hangul (Korean alphabet) typography look like a sacred, deeply spiritual, and ethereal masterpiece.
The text should feel divine and be a core part of the holy composition, not just a modern graphic design overlay.
  `.trim();

  // 영어/스페인어 전용 텍스트 프롬프트
  const textPromptOther = `
Typography: Include the text "${title}" in elegant, legible typography.
The text must be correctly spelled and professionally integrated into the design.
  `.trim();

  const textPrompt = lang === 'ko' ? textPromptKorean : textPromptOther;

  const visualPrompt = `
A professional, high-fidelity album cover art for a sacred hymn titled "${title}".

Genre aesthetics: ${genre}.
Atmosphere: ${vibe}.
Visual style: Inspired by ${era} design elements combined with ${config.style}.

${textPrompt}

Materiality and texture: Emphasis on physical medium (e.g., visible film grain, oil paint brushstrokes, or clean vector minimalism depending on style).
Lighting: Dramatic cinematic lighting, high contrast, artistic composition with depth.
Composition: Rule of thirds, balanced negative space, professional art direction.

Quality: 4k resolution, masterpiece quality, award-winning art direction.
  `.trim();

  try {
    console.log(`🎨 Generating ${lang} with model ${imageModelId}...`);

    const response = await ai.models.generateContent({
      model: imageModelId,
      contents: { parts: [{ text: visualPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    let imageBase64 = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!imageBase64) {
      console.warn(`No image for ${lang}`);
      return null;
    }

    console.log(`✅ AI text for ${lang} complete`);
    return `data:image/png;base64,${imageBase64}`;

  } catch (e) {
    console.warn(`Art generation failed for ${lang}`, e);
    return null;
  }
};


