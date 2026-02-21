
import { GoogleGenAI, Type } from "@google/genai";
import { PromptData, UserPreferences, MultiCovers } from "../types";

const cleanJson = (text: string) => {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

const getAi = () => {
  // 환경 변수에서 API 키 읽기
  let apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // 임시 fallback (환경 변수가 로드되지 않을 경우)
  if (!apiKey) {
    apiKey = 'AIzaSyBlnO46WxKt35HgdVgfu_gVdtGapEE6Kag';
    console.warn('⚠️  Using fallback API key. Please check .env.local file');
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
    You are 'SacredArchitect Global Search', a professional musicologist.
    1. SEARCH Google to find the official titles and FULL accurate lyrics for the requested hymn in Korean, English, and Spanish.
    2. Analyze its musical profile (Genre, Key, BPM, Spiritual vibe).
    3. Ensure multiLyrics contains the complete verses for each language.
    4. Provide the output in strictly valid JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Search and analyze the hymn: ${prefs.hymnTheme}. Provide full lyrics for KR, EN, and ES.`,
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

// 🎨 새로운 이미지 생성 방식: 배경만 생성 후 Canvas로 텍스트 합성
export const generateMultiLanguageArtSequential = async (promptData: PromptData, lang: keyof MultiCovers): Promise<string | null> => {
  const ai = getAi();

  const title = promptData.titles?.[lang as keyof typeof promptData.titles] || promptData.title;

  // 배경 스타일만 정의 (텍스트 생성 요청 제거!)
  const langConfig = {
    ko: {
      style: "Serene Korean mountains at dawn, soft mist, elegant oriental ink wash painting aesthetic, peaceful and spiritual",
      font: "bold 48px 'Noto Serif KR', serif",
      color: "#2d3748"
    },
    en: {
      style: "Cinematic majestic cathedral interior, volumetric divine lighting, ethereal stained glass colors, sacred atmosphere",
      font: "bold 42px 'Playfair Display', serif",
      color: "#1a202c"
    },
    es: {
      style: "Warm Spanish monastery courtyard at golden hour, peaceful and spiritual atmosphere, Mediterranean beauty",
      font: "bold 44px 'Crimson Text', serif",
      color: "#2c3e50"
    }
  };

  const config = langConfig[lang];

  // 텍스트 없는 깨끗한 배경만 요청
  const visualPrompt = `
    A professional sacred music album cover background.
    Visual Style: ${config.style}.
    Design Requirements:
    - NO TEXT, NO LETTERS, NO WORDS, NO CHARACTERS
    - Clean, elegant background only
    - Suitable for overlaying text later
    - Soft, harmonious colors
    - Professional quality, 4k, cinematic
    - Leave center area clear and uncluttered
  `.trim();

  try {
    console.log(`🎨 Generating ${lang} background image...`);

    // 1단계: 배경 이미지 생성 (텍스트 없음)
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: { parts: [{ text: visualPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    let backgroundBase64 = null;
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          backgroundBase64 = part.inlineData.data;
          break;
        }
      }
    }

    if (!backgroundBase64) {
      console.warn(`No image data received for ${lang}`);
      return null;
    }

    console.log(`✅ Background generated for ${lang}, adding text overlay...`);

    // 2단계: Canvas로 텍스트 합성
    return await overlayTextOnImage(backgroundBase64, title, config.font, config.color);

  } catch (e) {
    console.warn(`Art generation failed for ${lang}`, e);
    return null;
  }
};

// Canvas를 사용하여 이미지 위에 텍스트 오버레이 (개선된 버전)
async function overlayTextOnImage(
  base64Image: string,
  text: string,
  font: string,
  color: string
): Promise<string> {
  console.log(`🎨 Starting text overlay: "${text}"`);

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        console.log(`📐 Image loaded: ${img.width}x${img.height}`);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas context not available');
        }

        // 캔버스 크기 설정
        canvas.width = img.width;
        canvas.height = img.height;

        // 배경 이미지 그리기
        ctx.drawImage(img, 0, 0);

        // 텍스트 스타일 설정
        ctx.font = font;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 텍스트 위치
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // 배경 박스 그리기
        const padding = 40;
        const textWidth = ctx.measureText(text).width;
        const boxWidth = textWidth + padding * 2;
        const boxHeight = parseInt(font) * 2;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.fillRect(
          centerX - boxWidth / 2,
          centerY - boxHeight / 2,
          boxWidth,
          boxHeight
        );

        // 텍스트 그림자
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // 텍스트 그리기
        ctx.fillStyle = color;
        ctx.fillText(text, centerX, centerY);

        console.log('✅ Text overlay complete!');

        // 완성된 이미지를 base64로 변환
        const result = canvas.toDataURL('image/png');
        resolve(result);

      } catch (error) {
        console.error('Canvas drawing error:', error);
        reject(error);
      }
    };

    img.onerror = (error) => {
      console.error('Image load error:', error);
      reject(new Error('Failed to load image'));
    };

    img.src = `data:image/png;base64,${base64Image}`;
  });
}

