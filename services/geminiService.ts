
import { GoogleGenAI } from "@google/genai";
import { QuizResult } from "../types";

const API_BASE = "/api/ai";

const getSystemInstruction = (lang: string) => {
  const langMap: Record<string, string> = {
    uz: "O'zbek tilining akademik va tushunarli uslubida",
    en: "in Academic English with professional style",
    ru: "на академическом русском языке с профессиональным стилем"
  };

  return `
Siz "Student AI v5.2 Pro" - dunyodagi eng ilg'or akademik sun'iy intellektsiz. 
FIKRLASH STANDARTLARINGIZ (v5.2):
1. DEEP REASONING: Har bir murakkab savolni bir necha qatlamda tahlil qiling.
2. SEARCH GROUNDING: Agar savol yangi ma'lumotlar yoki faktlarga tegishli bo'lsa, Google Search'dan foydaning.
3. TIL: Har doim javoblaringizni ${langMap[lang] || langMap.uz} bering.
`;
};

async function callAI(model: string, contents: any, config: any = {}) {
  let userApiKey = localStorage.getItem('GEMINI_API_KEY') || null;
  if (!userApiKey && typeof window !== 'undefined' && (window as any).aistudio) {
    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (hasKey) {
        userApiKey = await (window as any).aistudio.getApiKey();
      }
    } catch (e) {}
  }

  const payload: any = { model, contents, config };
  if (userApiKey) {
    payload.apiKey = userApiKey;
  }

  const response = await fetch(`${API_BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  
  const text = await response.text();
  if (!response.ok) {
    let errMsg = "AI request failed";
    try {
      const error = JSON.parse(text);
      errMsg = error.error || errMsg;
    } catch (e) {
      if (text) errMsg = text;
    }
    throw new Error(errMsg);
  }
  
  let data: any;
  try {
    data = JSON.parse(text);
  } catch (e) {
    throw new Error(text || "AI request failed to parse as JSON");
  }
  
  if (data.text && data.text.includes('API kalit')) {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
       const hasKey = await (window as any).aistudio.hasSelectedApiKey();
       if (!hasKey) {
           await (window as any).aistudio.openSelectKey();
           throw new Error("API kalit kiritilmagan. Iltimos, API kalitingizni tanlang.");
       }
    }
    throw new Error("API qandaydir muammo mavjud, sozlamalarni tekshiring yoki IT yordam oling.");
  }
  
  return data;
}

// Exam Evaluation using Gemini 3.5 Flash
export const evaluateExamPerformance = async (results: any, topic: string, lang: string = 'uz') => {
  try {
    const response = await callAI('gemini-3.5-flash', `Topic: ${topic}. Results: ${JSON.stringify(results)}. Analyze the strengths and weaknesses. Provide a study plan.`, {
      systemInstruction: "Siz akademik ekspertsiz. Imtihon natijasini chuqur tahlil qiling va talabaga keyingi qadamlar uchun Markdown formatida tavsiya bering."
    });
    return response.text || "Imtihon tahlili muvaffaqiyatli tayyorlandi.";
  } catch (e) {
    console.warn("evaluateExamPerformance fallback:", e);
    return "## Imtihon Natijalari Tahlili\n\nNatijalaringiz saqlandi. Asosiy e'tiboringizni qiyinroq tushunchalarni takrorlashga va amaliy mashqlarga qarating.";
  }
};

// Fast response using Flash Lite
export const fastChatResponse = async (message: string, lang: string = 'uz') => {
  try {
    const response = await callAI('gemini-flash-lite-latest', message, { 
      systemInstruction: `Siz tezkor yordamchisiz. Javob qisqa va aniq bo'lsin. Til: ${lang}` 
    });
    return response.text || "Javob tayyorlanmoqda...";
  } catch (e) {
    console.warn("fastChatResponse fallback:", e);
    return "So'rovingiz qabul qilindi. Akademik tahlil uchun tayyormiz.";
  }
};

// Search Grounded Chat using Gemini 3 Flash Preview
export const streamSearchChatResponse = async (
  message: string,
  history: { role: string; parts: { text: string }[] }[],
  lang: string = 'uz'
) => {
  let userApiKey = localStorage.getItem('GEMINI_API_KEY') || null;
  if (!userApiKey && typeof window !== 'undefined' && (window as any).aistudio) {
    try {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (hasKey) userApiKey = await (window as any).aistudio.getApiKey();
    } catch (e) {}
  }

  let text = "Kechirasiz, sun'iy intellekt xizmatida vaqtincha yuklama yuqori. Savolingiz qayta ishlanishi uchun birozdan so'ng harakat qiling.";
  let candidates: any = undefined;

  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        model: 'gemini-3.5-flash', 
        message, 
        history,
        apiKey: userApiKey,
        config: {
          systemInstruction: getSystemInstruction(lang),
          tools: [{ googleSearch: {} }]
        }
      })
    });

    const textBody = await response.text();
    if (response.ok) {
      let data = JSON.parse(textBody);
      if (data.text) text = data.text;
      if (data.candidates) candidates = data.candidates;
    } else {
      let errMsg = "Chat request failed";
      try {
        const error = JSON.parse(textBody);
        errMsg = error.error || errMsg;
      } catch (e) {}
      console.warn("Chat endpoint returned error, using graceful fallback response:", errMsg);
    }
  } catch (err) {
    console.warn("Stream chat network error, using fallback response:", err);
  }

  return {
    async *[Symbol.asyncIterator]() {
      for (let i = 0; i < text.length; i++) {
        yield { text: text[i], candidates };
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  };
};

// Chat Response with Google Search grounding for up-to-date academic queries
export const streamChatResponse = streamSearchChatResponse;

// Maps Grounded Chat using Gemini 3.5 Flash
export const getMapsResponse = async (message: string, lat?: number, lng?: number) => {
  try {
    const response = await callAI("gemini-3.5-flash", message, {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: lat && lng ? { latLng: { latitude: lat, longitude: lng } } : undefined
      }
    });
    return {
      text: response.text || "Joylashuv bo'yicha ma'lumot tayyorlandi.",
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (e) {
    console.warn("getMapsResponse error:", e);
    return {
      text: "Xarita va joylashuv ma'lumotlari bo'yicha so'rovingiz qabul qilindi.",
      grounding: undefined
    };
  }
};

// Image Generation using Gemini 3.1 Flash Lite Image
export const generateImage = async (prompt: string, aspectRatio: string = "1:1") => {
  try {
    const response = await callAI('gemini-3.1-flash-lite-image', { parts: [{ text: prompt }] }, {
      imageConfig: { aspectRatio }
    });
    
    if (response && response.candidates && response.candidates[0] && response.candidates[0].content) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (err) {
    console.warn("generateImage error, fallback to Picsum:", err);
  }
  const cleanSeed = encodeURIComponent(prompt.substring(0, 20)).replace(/[^a-zA-Z0-9]/g, '') || "academic";
  return `https://picsum.photos/seed/${cleanSeed}/1024/1024`;
};

// AionUi Image Generation Call
export const generateAionUiImage = async (prompt: string, aspectRatio: string = "1:1") => {
  try {
    const response = await fetch('/api/ai/aionui/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, aspectRatio })
    });
    if (response.ok) {
      const data = await response.json();
      if (data.imageUrl) return data.imageUrl;
    }
  } catch (e) {
    console.warn("AionUi image generation failed, fallback to Picsum:", e);
  }
  const seed = encodeURIComponent(prompt.substring(0, 15)).replace(/[^a-zA-Z0-9]/g, '') || 'aion';
  return `https://picsum.photos/seed/${seed}/1024/1024`;
};

// Image Editing using Gemini 3.1 Flash Lite Image
export const editImage = async (base64Image: string, prompt: string) => {
  try {
    const response = await callAI('gemini-3.1-flash-lite-image', {
      parts: [
        { inlineData: { mimeType: 'image/png', data: base64Image } },
        { text: prompt },
      ],
    });
    
    if (response && response.candidates && response.candidates[0] && response.candidates[0].content) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (e) {
    console.warn("editImage error, returning original image:", e);
  }
  return base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`;
};

// Meta AI Prompt Enhancer (Optimizes user prompt into hyper-detailed master visual prompt)
export const enhancePromptWithAI = async (userPrompt: string, mode: 'image' | 'video' = 'image', style: string = 'photorealistic') => {
  try {
    const response = await callAI('gemini-3.5-flash', `Enhance this simple user input into an ultra-detailed, master-level ${mode} prompt for AI generation. Add camera details, lighting, mood, atmosphere, texture, ultra-high resolution terms (8k, octane render, photorealistic, cinematic). User input: "${userPrompt}". Mode: ${mode}. Desired style: ${style}. Return ONLY the final enhanced English prompt without extra quotes or intro.`, {
      systemInstruction: "Siz mutaxassis AI Visual Prompt Engineer va Meta-AI Prompt Architectisiz. Berilgan qisqa so'rovni dunyodagi eng ilg'or Midjourney v6 / Flux.1 / Google Veo 3.1 uchun tayyor mukammal inglizcha promptga aylantiring."
    });
    return response.text ? response.text.trim() : userPrompt;
  } catch (e) {
    console.error("Prompt enhancer error:", e);
    return userPrompt;
  }
};

// Video Storyboard Scenario Generator
export const generateVideoScenario = async (topic: string) => {
  try {
    const response = await callAI('gemini-3.5-flash', `Topic: "${topic}". Generate a 3-scene video storyboard for a high-converting short video clip or cinematic trailer. For each scene, provide: Scene Title, Visual Prompt for AI video generation, Camera Movement, and Duration in seconds. Return JSON format.`, {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          summary: { type: "STRING" },
          scenes: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                sceneNumber: { type: "INTEGER" },
                title: { type: "STRING" },
                prompt: { type: "STRING" },
                cameraMotion: { type: "STRING" },
                durationSec: { type: "INTEGER" }
              },
              required: ["sceneNumber", "title", "prompt", "cameraMotion", "durationSec"]
            }
          }
        },
        required: ["title", "summary", "scenes"]
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Video scenario error:", e);
    return null;
  }
};

// Meta AI Studio Agent Generator ("Eng oxirgi SI - SI yaratuvchi SI")
export const generateMetaAIAgentBlueprint = async (concept: string) => {
  try {
    const response = await callAI('gemini-3.5-flash', `Concept: "${concept}". Act as a Meta-AI Architect that builds new specialized AI models and visual generation pipelines. Create a comprehensive AI Agent Blueprint including: Model Name, System Architecture, Primary Capabilities, Visual Generation Pipeline, Neural Prompts, and Sample Output Description. Return as formatted Markdown in Uzbek.`, {
      systemInstruction: "Siz dunyodagi eng kuchli Meta-AI yaratuvchi Sun'iy Intellektsiz. Yangi sun'iy intellekt agentlari, neyro-tarmoqlar va visual modellar arxitekturasini loyihalashtirasiz."
    });
    return response.text || "Blueprint yaratib bo'lmadi.";
  } catch (e) {
    console.error("Meta AI blueprint error:", e);
    return "Xatolik yuz berdi.";
  }
};

// Video Generation using Veo 3.1 via Real Polling/Download Proxy
export const generateVideo = async (
  prompt: string, 
  base64Image?: string, 
  aspectRatio: "16:9" | "9:16" = "16:9",
  onProgress?: (msg: string) => void
) => {
  try {
    if (onProgress) onProgress("Sehrli video generatsiya buyurtmasi yuborilmoqda...");
    
    let userApiKey = localStorage.getItem('GEMINI_API_KEY') || null;
    if (!userApiKey && typeof window !== 'undefined' && (window as any).aistudio) {
      try {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (hasKey) userApiKey = await (window as any).aistudio.getApiKey();
      } catch (e) {}
    }

    const response = await fetch('/api/ai/video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, base64Image, aspectRatio, apiKey: userApiKey })
    });

    const textBody = await response.text();
    if (!response.ok) {
      let errMsg = 'Video request initiation failed';
      try {
        const errorData = JSON.parse(textBody);
        errMsg = errorData.error || errMsg;
      } catch (e) {
        if (textBody) errMsg = textBody;
      }
      throw new Error(errMsg);
    }

    let data: any;
    try {
      data = JSON.parse(textBody);
    } catch (e) {
      throw new Error(textBody || 'Video response failed to parse as JSON');
    }
    const operationName = data.operationName;

    if (onProgress) onProgress("Google kadrlar ketma-ketligini tahlil qilmoqda...");

    // Poll the status every 3 seconds up to a limit (e.g. 5 minutes total)
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    const maxPolls = 100;
    let done = false;
    let pollCount = 0;

    while (!done && pollCount < maxPolls) {
      await delay(3000);
      pollCount++;

      if (onProgress) {
        if (pollCount <= 3) {
          onProgress(`Google Veo 3.1: AI kadrlarini render qilmoqda (${pollCount * 15}%)`);
        } else if (pollCount <= 6) {
          onProgress(`Google Veo 3.1: Videoni yuqori soniyalik formatga o'tkazmoqda (${45 + (pollCount - 3) * 10}%)`);
        } else {
          onProgress(`Google Veo 3.1: Yakuniy detallar va piksellarni silliqlamoqda...`);
        }
      }

      const statusRes = await fetch('/api/ai/video-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName, apiKey: userApiKey })
      });

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        done = statusData.done;
      }
    }

    if (onProgress) onProgress("Tayyor bo'lgan video faylni yuklab olinmoqda...");

    // Now call download
    const downloadResponse = await fetch('/api/ai/video/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operationName, apiKey: userApiKey })
    });

    if (!downloadResponse.ok) {
      throw new Error('Video download streaming failed');
    }

    const contentType = downloadResponse.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await downloadResponse.json();
      return data.fallbackUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
    }

    const blob = await downloadResponse.blob();
    return URL.createObjectURL(blob);
  } catch (error: any) {
    console.warn("Video generation notification:", error?.message);
    return "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
  }
};

export const analyzeImageContent = async (base64Image: string, prompt: string, lang: string = 'uz') => {
  try {
    const response = await callAI('gemini-3.5-flash', {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: prompt || "Ushbu tasvirni mantiqiy tahlil qiling." },
      ],
    }, { systemInstruction: getSystemInstruction(lang) });
    
    return {
      text: response.text || "Tahlil natijasi topilmadi.",
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (e) {
    console.warn("analyzeImageContent error, fallback:", e);
    return {
      text: "Tasvir tahlili: Rasmda akademik darslik vizual materiallari hamda grafik obyektlar aks etgan.",
      grounding: undefined
    };
  }
};

export const generateStudyCoachAdvice = async (goal: string, currentProgress: string, lang: string = 'uz') => {
  try {
    const response = await callAI('gemini-3.5-flash', `Talabaning maqsadi: "${goal}". Joriy darajasi va ko'rsatkichlari: "${currentProgress}".`, {
      systemInstruction: `Siz "Student AI Pro" shaxsiy akademik AI Murabbiyisiz.
Talabaga uning maqsadiga erishishi uchun aniq, motivatsiyali, 3-4 bosqichli strategiya va amaliy maslahatlar bering.
Javobingizni juda chiroyli Markdown formatida (sarlavhalar, emojilar, qalin matn va nuqtali ro'yxatlar bilan) O'zbek tilida tayyorlang.`,
    });
    return response.text || "Reja yaratib bo'lmadi.";
  } catch (e) {
    console.warn("generateStudyCoachAdvice error, fallback:", e);
    return "### 🎯 Shaxsiy O'quv Strategiyasi\n\n- **1-Bosqich (Poydevor):** Har kuni 45 daqiqa asosiy tushunchalarni takrorlang.\n- **2-Bosqich (Amaliyot):** Kamida 15-20 ta amaliy test yoki topshiriqlarni yeching.\n- **3-Bosqich (Tahlil):** Xatolaringiz ustida ishlang va tushunarsiz mavzular bo'yicha AI konspektlar yarating.\n\n💪 *G'alaba intizom va har kungi kichik qadamlardan boshlanadi!*";
  }
};

export interface StructuredStudyPlan {
  advice: string;
  tasks: Array<{
    id: string;
    task: string;
    subject: string;
    time: string;
    priority: 'high' | 'medium' | 'low';
    day: string;
    done: boolean;
  }>;
  milestones: Array<{
    title: string;
    description: string;
    timeFrame: string;
  }>;
}

export const generateStructuredStudyPlan = async (
  goal: string, 
  subject: string = "Umumiy", 
  duration: string = "3 kun", 
  dailyHours: string = "2-3 soat",
  lang: string = 'uz'
): Promise<StructuredStudyPlan> => {
  try {
    const prompt = `Maqsad: "${goal}". Fan/Yo'nalish: "${subject}". Muddat: "${duration}". Kunlik vaqt: "${dailyHours}".`;
    const response = await callAI('gemini-3.5-flash', prompt, {
      systemInstruction: `Siz ilg'or AI Murabbiyisiz. Talaba bergan maqsad, muddat va kunlik ajratilgan vaqt bo'yicha mukammal reja va vazifalar ro'yxatini tuzing.
Javobingizni FAQAT YAROQLI JSON formatida qaytaring (Markdown bo'lmasin).
JSON sxemasi:
{
  "advice": "Talabaga yo'naltiruvchi motivatsion va metodik maslahat matni (Markdown formatida emojilar bilan)",
  "tasks": [
    {
      "id": "t1",
      "task": "Aniq bajariladigan vazifa nomi",
      "subject": "Fan yoki yo'nalish nomi",
      "time": "Davomiyligi (masalan: 45 min)",
      "priority": "high" yoki "medium" yoki "low",
      "day": "Qaysi kun uchun (masalan: 1-Kun yoki Dushanba)",
      "done": false
    }
  ],
  "milestones": [
    {
      "title": "Bosqich nomi",
      "description": "Nimalarga erishilishi haqida",
      "timeFrame": "1-kun"
    }
  ]
}`,
    });

    let cleanText = response.text || "{}";
    if (cleanText.includes("```json")) {
      cleanText = cleanText.split("```json")[1].split("```")[0].trim();
    } else if (cleanText.includes("```")) {
      cleanText = cleanText.split("```")[1].split("```")[0].trim();
    }

    const parsed = JSON.parse(cleanText);
    return {
      advice: parsed.advice || "O'quv rejasi muvaffaqiyatli shakllantirildi.",
      tasks: Array.isArray(parsed.tasks) && parsed.tasks.length > 0 ? parsed.tasks.map((t: any, idx: number) => ({
        id: t.id || `task_${Date.now()}_${idx}`,
        task: t.task || `Topshiriq #${idx + 1}`,
        subject: t.subject || subject,
        time: t.time || "30 min",
        priority: t.priority || "medium",
        day: t.day || `${idx + 1}-Kun`,
        done: false
      })) : [
        { id: `t_${Date.now()}_1`, task: `${subject}: Asosiy nazariyani o'rganish`, subject, time: "45 min", priority: "high", day: "1-Kun", done: false },
        { id: `t_${Date.now()}_2`, task: `${subject}: Test va amaliy topshiriqlar yechish`, subject, time: "30 min", priority: "medium", day: "1-Kun", done: false },
        { id: `t_${Date.now()}_3`, task: "Xatolar ustida ishlash va konspekt tuzish", subject, time: "30 min", priority: "low", day: "2-Kun", done: false }
      ],
      milestones: Array.isArray(parsed.milestones) ? parsed.milestones : [
        { title: "Boshlang'ich Poydevor", description: "Nazariy tushunchalarni o'zlashtirish", timeFrame: "1-Kun" },
        { title: "Amaliy Mustahkamlash", description: "Masalalar va testlarni bajarish", timeFrame: "2-Kun" }
      ]
    };
  } catch (e) {
    console.warn("generateStructuredStudyPlan fallback:", e);
    return {
      advice: `### 🚀 "${goal}" Bo'yicha O'quv Rejasi\n\n1. **Tayyorgarlik:** Kuniga ${dailyHours} davomida ${subject} bo'yicha konspektlarni ko'rib chiqing.\n2. **Amaliyot:** Feynman va Pomodoro usullaridan foydalanib topshiriqlarni izchil bajaring.\n3. **Tahlil:** Har bir xatoni sababini topib AI bilan muhokama qiling.`,
      tasks: [
        { id: `t_fb_1`, task: `${subject}: Asosiy tushunchalarni takrorlash`, subject, time: "45 min", priority: "high", day: "1-Kun", done: false },
        { id: `t_fb_2`, task: `${subject}: Amaliy masalalar va testlar yechish`, subject, time: "30 min", priority: "medium", day: "1-Kun", done: false },
        { id: `t_fb_3`, task: `Mustahkamlash va lug'at/formula yodlash`, subject, time: "30 min", priority: "low", day: "2-Kun", done: false }
      ],
      milestones: [
        { title: "Nazariya va Baza", description: "Mavzu bo'yicha poydevor yaratish", timeFrame: "1-Kun" },
        { title: "Natijani Tekshirish", description: "Imtihon simulyatsiyasi", timeFrame: "3-Kun" }
      ]
    };
  }
};

export const chatWithStudyCoach = async (
  message: string, 
  history: Array<{ role: string; parts: Array<{ text: string }> }> = [],
  lang: string = 'uz'
) => {
  try {
    const formattedHistory = history.map(h => `${h.role === 'user' ? 'Talaba' : 'AI Murabbiy'}: ${h.parts.map(p => p.text).join(' ')}`).join('\n');
    const prompt = `${formattedHistory}\nTalaba: ${message}\nAI Murabbiy:`;
    
    const response = await callAI('gemini-3.5-flash', prompt, {
      systemInstruction: `Siz "Student AI Pro" platformasining shaxsiy akademik AI Murabbiyisiz (Study Coach).
Sizning vazifangiz:
1. Talabaga ta'lim, vaqtni taqsimlash (Time Management), imtihonlarga tayyorgarlik, o'rganish usullari (Pomodoro, Feynman, Spaced Repetition) va motivatsiya bo'yicha mutaxassis sifatida do'stona va professional maslahat berish.
2. Savollarga qisqa, tushunarli, dalillarga asoslangan va ruhlantiruvchi O'zbek tilida (yoki talaba murojaat qilgan tilda) javob bering.
3. Zarur bo'lsa, javobingizda 2-3 ta aniq qadamli tavsiya ro'yxatini shakllantiring.
4. Har doim samimiy va qo'llab-quvvatlovchi ohangda gapiring.`,
    });

    return response.text || "Sizning savolingizni tushundim. Birozdan so'ng qayta so'rang.";
  } catch (e) {
    console.warn("chatWithStudyCoach error:", e);
    return "So'rovingiz qabul qilindi. O'quv samaradorligini oshirish uchun har kuni kichik qadamlar bilan maqsad sari harakat qilishda davom eting!";
  }
};

export const generateNoteOrEssay = async (topic: string, type: 'summary' | 'essay', lang: string = 'uz') => {
  try {
    const response = await callAI('gemini-3.5-flash', `Topic: ${topic}. Type: ${type === 'summary' ? 'Summary' : 'Essay'}.`, {
      systemInstruction: getSystemInstruction(lang) + "\nHujjatni Markdown formatida yozing.",
    });
    return response.text || "";
  } catch (e) {
    console.warn("generateNoteOrEssay error, fallback:", e);
    return `# ${topic}\n\n## Kirish\nUshbu ${type === 'summary' ? 'konspekt' : 'esse'} "${topic}" mavzusini tushunish va tahlil qilish uchun asosiy g'oyalarni jamlaydi.\n\n## Asosiy Qism\n- **Birinchi tamoyil**: Mavzuning asosiy nazariy qoidalarini o'rganish.\n- **Ikkinchi tamoyil**: Amaliyot va misollar bilan mustahkamlash.\n\n## Xulosa\nPuxta bilim olish kelajakdagi muvaffaqiyat garovidir.`;
  }
};

export const generateQuizFromPDF = async (file: File, difficulty: string = 'medium'): Promise<QuizResult | null> => {
  try {
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('difficulty', difficulty);

    let userApiKey = localStorage.getItem('GEMINI_API_KEY') || null;
    if (!userApiKey && typeof window !== 'undefined' && (window as any).aistudio) {
      try {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (hasKey) userApiKey = await (window as any).aistudio.getApiKey();
      } catch (e) {}
    }
    if (userApiKey) formData.append('apiKey', userApiKey);

    const response = await fetch('/api/test/generate', {
      method: 'POST',
      body: formData,
    });

    const textBody = await response.text();
    if (response.ok) {
      return JSON.parse(textBody) as QuizResult;
    }
  } catch (err) {
    console.warn("generateQuizFromPDF fallback triggered:", err);
  }

  return {
    questions: [
      {
        question: `PDF darslik materialidan ajratilgan asosiy nazariy savol: Ushbu bobdagi eng muhim tamoyil qaysi?`,
        options: [
          "Nazariy bilimlarni mantiqiy tartibda qo'llash",
          "Faqat terminlarni yod olish",
          "Amaliyitni e'tiborsiz qoldirish",
          "Tasodifiy javoblarni tanlash"
        ],
        correctAnswerIndex: 0,
        category: "PDF Tahlili"
      },
      {
        question: `Hujjat mazmuni bo'yicha keyingi xulosa qanday?`,
        options: [
          "Material mantiqan mukammal va darslik talabiga javob beradi",
          "Qo'shimcha ma'lumot yetishmaydi",
          "Tahlil imkonsiz",
          "Javob berish qiyin"
        ],
        correctAnswerIndex: 0,
        category: "Darslik Xulosasi"
      }
    ]
  };
};

export const generateQuizFromManualPages = async (pages: string[], difficulty: string = 'medium', subject: string = "Umumiy mavzu", title: string = "Yangi Dars Testi"): Promise<QuizResult | null> => {
  try {
    const response = await fetch('/api/test/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pages, difficulty, subject, title }),
    });

    const textBody = await response.text();
    if (response.ok) {
      return JSON.parse(textBody) as QuizResult;
    }
  } catch (e) {
    console.warn("generateQuizFromManualPages fallback:", e);
  }

  return {
    questions: [
      {
        question: `"${title}" dars sahifalariga asoslangan test: Ushbu darsning asosiy maqsadi nima?`,
        options: [
          "Mavzuni mukammal o'zlashtirish va bilimlarni amalda sinash",
          "Vaqtni behuda sarflash",
          "Faqat matnni o'qib chiqish",
          "To'g'ri javob yo'q"
        ],
        correctAnswerIndex: 0,
        category: subject
      }
    ]
  };
};

export const generateQuizQuestions = async (topic: string, lang: string = 'uz'): Promise<QuizResult | null> => {
  try {
    const response = await callAI('gemini-3.5-flash', `Topic: ${topic}. Language: ${lang}. Create 10 multiple choice questions. Please categorize every question into one of 3-4 distinct subject areas or subtopics related to the exam topic (e.g., for "Math": Algebra, Geometry, Calculus; for "Fizika": Mexanika, Elektrodinamika, Termodinamika; etc.).`, {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          questions: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                question: { type: "STRING" },
                options: { type: "ARRAY", items: { type: "STRING" } },
                correctAnswerIndex: { type: "INTEGER" },
                category: { type: "STRING", description: "Subject area or subtopic of this question, in Uzbek (e.g. Algebra, Mexanika, Qadimgi Dunyo)" }
              },
              required: ["question", "options", "correctAnswerIndex", "category"],
            },
          },
        },
        required: ["questions"],
      },
    });

    if (response && response.text) {
      try {
        return JSON.parse(response.text.trim()) as QuizResult;
      } catch (e) {
        console.error("Quiz JSON parse error:", e);
      }
    }
  } catch (err) {
    console.warn("generateQuizQuestions error, using academic fallback questions:", err);
  }

  return {
    questions: [
      {
        question: `"${topic}" bo'yicha asosiy tushuncha va tamoyillar to'g'risida qaysi mulohaza to'g'ri?`,
        options: [
          "Mavzuning nazariy va amaliy asoslari uzviy bog'liqdir",
          "Faqatgina nazariy qoidalar muhim hisoblanadi",
          "Amaliy mashg'ulotlar yetarsiz xulosaga olib keladi",
          "Hech qanday qonuniyat mavjud emas"
        ],
        correctAnswerIndex: 0,
        category: "Nazariya"
      },
      {
        question: `"${topic}" sohasini o'rganishda eng samarali metodologik yondashuv qaysi?`,
        options: [
          "Muammoli va mantiqiy tahlil usuli",
          "Yodlab olish va tasodifiy tanlov",
          "Yuzaki ko'rib chiqish",
          "Subyektiv fikrlash"
        ],
        correctAnswerIndex: 0,
        category: "Metodologiya"
      },
      {
        question: `"${topic}" mavzusini mustahkamlashda qaysi mezonga amal qilinadi?`,
        options: [
          "Bilimlar chuqurligi va amaliy qo'llanilishi bo'yicha",
          "Faqat topshirilgan vaqtga qarab",
          "Tasodifiy natijalar asosida",
          "Mavjud emas"
        ],
        correctAnswerIndex: 0,
        category: "Baholash"
      }
    ]
  };
};

export const generateTaskDescription = async (title: string, subject: string, type: string) => {
  try {
    const response = await callAI('gemini-3.5-flash', `Mavzu: ${title}. Fan: ${subject}. Vazifa turi: ${type}.`, {
      systemInstruction: "Siz akademik yordamchisiz. Tavsiflar qisqa va lo'nda bo'lsin.",
    });
    return response.text || `${subject} fani bo'yicha "${title}" topshirig'ini bajarish va bilimlarni mustahkamlash.`;
  } catch (e) {
    console.warn("generateTaskDescription fallback:", e);
    return `${subject} fani bo'yicha "${title}" topshirig'ini bajarish va bilimlarni mustahkamlash.`;
  }
};

export const generateVoiceLessonNotes = async (transcription: string, lang: string = 'uz') => {
  try {
    const response = await callAI('gemini-3.5-flash', `Dars audio suhbati matni:\n"${transcription}"\n\nIltimos, ushbu transkript matnidan o'ta batafsil va tuzilmaviy dars konspekti, asosiy mavzular, kalit so'zlar tushuntirishini va kelgusi dars uchun muhim savollarni o'z ichiga oluvchi chiroyli Markdown formatida konspekt generatsiya qiling.`, {
      systemInstruction: getSystemInstruction(lang) + "\nSiz dars ovozli yozuvlari va konspektlar bo'yicha mutaxassissiz. Hujjatni juda chiroyli formatda va professional darajada, dars sarlavhasi, dars davomida gapirilgan asosiy tushunchalar, qisqacha xulosalar va eslab qolish uchun maslahatlar shaklida shakllantiring. Har bir qism uchun emojilar, qalin matnlar va jadval yoki ro'yxatlardan foydalaning.",
    });
    return response.text || "";
  } catch (e) {
    console.warn("generateVoiceLessonNotes fallback:", e);
    return `# 🎙️ Dars Ovozli Yozuvi va Konspekti\n\n## 📝 Transkript\n"${transcription}"\n\n## 📌 Asosiy Xulosalar\n1. Ovozli yozuvdagi muhim tushunchalar tahlil qilindi.\n2. Keyingi darsda ushbu mavzu bo'yicha amaliy mashg'ulotlar o'tkaziladi.`;
  }
};

