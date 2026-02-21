
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

  // 한국어만 Canvas 오버레이 사용, 영어/스페인어는 AI 텍스트 생성
  const useCanvasOverlay = lang === 'ko';

  let visualPrompt: string;

  if (useCanvasOverlay) {
    // 한국어: 텍스트 없는 배경만 (고품질 프롬프트 템플릿 적용)
    visualPrompt = `
A professional, high-fidelity album cover art for a sacred hymn titled "${title}".

Genre aesthetics: ${genre}.
Atmosphere: ${vibe}.
Visual style: Inspired by ${era} design elements combined with ${config.style}.

Materiality and texture: Emphasis on physical medium (e.g., visible film grain, oil paint brushstrokes, or clean vector minimalism depending on style).
Lighting: Dramatic cinematic lighting, high contrast, artistic composition with depth.
Composition: Rule of thirds, balanced negative space, professional art direction.

CRITICAL: NO TEXT, NO LETTERS, NO WORDS on the image.
This is a background-only image for text overlay.

Quality: 4k resolution, masterpiece quality, award-winning art direction.
    `.trim();
  } else {
    // 영어/스페인어: AI가 텍스트 포함 생성 (고품질 프롬프트 템플릿 적용)
    visualPrompt = `
A professional, high-fidelity album cover art for a sacred hymn titled "${title}".

Genre aesthetics: ${genre}.
Atmosphere: ${vibe}.
Visual style: Inspired by ${era} design elements combined with ${config.style}.

Typography: Include the text "${title}" in elegant, legible typography.
The text must be correctly spelled and professionally integrated into the design.

Materiality and texture: Emphasis on physical medium (e.g., visible film grain, oil paint brushstrokes, or clean vector minimalism depending on style).
Lighting: Dramatic cinematic lighting, high contrast, artistic composition with depth.
Composition: Rule of thirds, balanced negative space, professional art direction.

Quality: 4k resolution, masterpiece quality, award-winning art direction.
    `.trim();
  }

  try {
    console.log(`🎨 Generating ${lang} (Canvas: ${useCanvasOverlay})...`);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
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

    // 한국어만 Canvas 텍스트 합성
    if (useCanvasOverlay) {
      console.log(`✅ Adding Korean text overlay...`);
      try {
        return await overlayTextOnImage(imageBase64, title, config.font, config.color);
      } catch (e) {
        console.error(`Canvas failed:`, e);
        return `data:image/png;base64,${imageBase64}`;
      }
    } else {
      // 영어/스페인어는 AI 생성 이미지 그대로
      console.log(`✅ AI text for ${lang} complete`);
      return `data:image/png;base64,${imageBase64}`;
    }


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
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 텍스트 위치
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // 📐 레이아웃 타입 결정 (랜덤 선택)
        const layouts = ['CENTRIC', 'EDITORIAL_BOTTOM', 'MODERN_SIDE'];
        const layout = layouts[Math.floor(Math.random() * layouts.length)];

        // 텍스트 측정
        const textWidth = ctx.measureText(text).width;
        const fontSize = parseInt(font);

        let targetX = canvas.width / 2;
        let targetY = canvas.height / 2;
        let textAlign: CanvasTextAlign = 'center';

        if (layout === 'EDITORIAL_BOTTOM') {
          targetX = 60;
          targetY = canvas.height - 150;
          textAlign = 'left';
        } else if (layout === 'MODERN_SIDE') {
          targetX = canvas.width - (textWidth / 2) - 60;
          targetY = 100;
          textAlign = 'center';
        }

        ctx.textAlign = textAlign;

        // 🎨 배경 그래픽 요소 (디자인 디테일)
        const addDesignDetails = () => {
          ctx.save();

          // 1. 카탈로그 번호 (우측 하단 세로 또는 가로)
          ctx.font = "14px 'Inter', sans-serif";
          ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
          ctx.textAlign = "right";
          ctx.fillText("SACRED-ARCHITECT // 2025-VOL-01", canvas.width - 40, canvas.height - 40);

          // 2. 가상의 로고 / 심볼
          ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(40, 40, 15, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(40, 30);
          ctx.lineTo(40, 50);
          ctx.moveTo(30, 40);
          ctx.lineTo(50, 40);
          ctx.stroke();

          // 3. 얇은 디자인 라인
          ctx.beginPath();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
          ctx.moveTo(40, 70);
          ctx.lineTo(40, canvas.height - 100);
          ctx.stroke();

          ctx.restore();
        };

        // 🎨 텍스트 배경 박스 및 효과
        const drawTextGroup = () => {
          const padding = 40;
          const boxWidth = textWidth + padding * 2;
          const boxHeight = fontSize * 1.8;

          ctx.save();

          // 레이아웃에 따른 좌표 조정
          let rectX: number;
          if (textAlign === 'left') {
            rectX = targetX - 20;
          } else if (textAlign === 'center') {
            rectX = targetX - boxWidth / 2;
          } else {
            rectX = targetX - boxWidth + 20;
          }
          const rectY = targetY - boxHeight / 2;

          // Glassmorphism effect
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.filter = 'blur(10px)';
          ctx.fillRect(rectX, rectY, boxWidth, boxHeight);
          ctx.filter = 'none';

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 1;
          ctx.strokeRect(rectX, rectY, boxWidth, boxHeight);

          // 메인 텍스트
          ctx.font = font;
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 10;
          ctx.fillText(text, targetX, targetY);

          // 서브 텍스트 (찬송가 번호 등 - 가상 데이터)
          ctx.font = "20px 'Inter', sans-serif";
          ctx.globalAlpha = 0.8;
          ctx.fillText("HYMN COLLECTION", targetX, targetY + (fontSize * 0.8));

          ctx.restore();
        };

        addDesignDetails();
        drawTextGroup();

        console.log('✅ Designer Album Overlay complete!');

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

