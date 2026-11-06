import { Question, Subject } from "../types";
import { Type } from "@google/genai";
import { getAbsoluteApiUrl } from "./apiConfig";

const generateContentWithRetry = async (
  params: any,
  maxRetries = 15,
  onRetry?: (attempt: number, errorMsg: string, delayMs: number) => void
) => {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await fetch(getAbsoluteApiUrl("/api/generate-content"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ params }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let errMsg = "HTTP " + response.status;
        if (errData && errData.error) {
          if (typeof errData.error === 'object') {
            errMsg = errData.error.message || JSON.stringify(errData.error);
          } else {
            errMsg = errData.error;
          }
        }
        throw new Error(errMsg);
      }
      const data = await response.json();
      return data;
    } catch (error: any) {
      const errString = typeof error === 'string' 
        ? error 
        : (error.message || (error && JSON.stringify(error)) || "Noma'lum xatolik");
      
      if (errString.includes("API key not valid") || errString.includes("API key")) {
        throw new Error("Google API kalit xatosi: Kiritilgan API kalit yaroqsiz yoki kiritilmagan.");
      }
      
      retries++;
      console.log(
        `API call dynamic wait (attempt ${retries}/${maxRetries}):`,
        errString
      );
      if (retries >= maxRetries) {
        throw error;
      }

      // Smart rate limit/quota delay calculation
      let delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;
      const errLower = errString.toLowerCase();
      if (
        errLower.includes("429") ||
        errLower.includes("resource_exhausted") ||
        errLower.includes("quota") ||
        errLower.includes("limit")
      ) {
        // Default longer delay for rate limits: 20-25 seconds with jitter
        delay = 20000 + Math.random() * 5000;
        
        // Check if there is specific request to "retry in X.Y s"
        const match = errString.match(/retry(?:\s+in|\s+after)?\s*(\d+\.?\d*)\s*s/i);
        if (match && match[1]) {
          const seconds = parseFloat(match[1]);
          delay = Math.ceil(seconds * 1000) + 1500; // Add safe buffer
        }
      }

      // Real-time second-by-second countdown sleep to keep user informed
      let remainingDelay = delay;
      while (remainingDelay > 0) {
        if (onRetry) {
          try {
            onRetry(retries, errString, remainingDelay);
          } catch (callbackErr) {
            console.error("onRetry callback error:", callbackErr);
          }
        }
        const sleepTime = Math.min(1000, remainingDelay);
        await new Promise((resolve) => setTimeout(resolve, sleepTime));
        remainingDelay -= sleepTime;
      }
    }
  }
  throw new Error("Maksimal urinishlar soni tugadi");
};

export const generateQuestionsFromTextProgressive = async (
  pages: string[],
  onProgress: (progress: {
    currentSegment: number;
    totalSegments: number;
    processedPages: number;
    totalPages: number;
    questionsCount: number;
    status: string;
    newQuestions?: Question[];
    segmentStates?: { [sIdx: number]: "waiting" | "processing" | "completed" | "error" };
    segmentQuestionsCount?: { [sIdx: number]: number };
  }) => void,
  modelName: string = "gemini-3.5-flash",
  temperature: number = 0.5,
  segmentSize: number = 1 // Default to 1 (page-by-page) for 100% extraction accuracy
): Promise<Question[]> => {
  try {
    const totalPages = pages.length;
    const totalSegments = Math.ceil(totalPages / segmentSize);
    
    // Create segments structure
    const segmentsData: { startIdx: number; endIdx: number; pagesList: string[] }[] = [];
    for (let s = 0; s < totalSegments; s++) {
      const startIdx = s * segmentSize;
      const endIdx = Math.min(startIdx + segmentSize, totalPages);
      segmentsData.push({
        startIdx,
        endIdx,
        pagesList: pages.slice(startIdx, endIdx)
      });
    }

    const segmentResults: { [sIdx: number]: Question[] } = {};
    const segmentStates: { [sIdx: number]: "waiting" | "processing" | "completed" | "error" } = {};
    const segmentQuestionsCount: { [sIdx: number]: number } = {};
    
    // Initialize states
    for (let s = 0; s < totalSegments; s++) {
      segmentStates[s] = "waiting";
      segmentQuestionsCount[s] = 0;
    }

    let processedPagesCount = 0;
    let completedSegmentsCount = 0;

    onProgress({
      currentSegment: 0,
      totalSegments,
      processedPages: 0,
      totalPages,
      questionsCount: 0,
      status: "Sahifalarga ajratish va parallel tahlil qilish boshlandi...",
      segmentStates,
      segmentQuestionsCount
    });

    // Concurrency pool helper: set to 5 for blaze-fast, parallel page-by-page importing of questions
    const concurrencyLimit = 5;
    const errorsList: any[] = [];

    const processSegment = async (seg: typeof segmentsData[0], sIdx: number) => {
      let prompt = "";
      segmentStates[sIdx] = "processing";

      // Fire initial processing alert
      onProgress({
        currentSegment: completedSegmentsCount,
        totalSegments,
        processedPages: processedPagesCount,
        totalPages,
        questionsCount: Object.values(segmentResults).reduce((sum, list) => sum + (list?.length || 0), 0),
        status: `Sahifa ${seg.startIdx + 1} - ${seg.endIdx} tahlil qilinmoqda...`,
        segmentStates,
        segmentQuestionsCount
      });
      
      if (segmentSize === 1) {
        const pageIdx = seg.startIdx;
        const currentPageText = pages[pageIdx];
        const prevPageText = pageIdx > 0 ? pages[pageIdx - 1] : "";
        const nextPageText = pageIdx < totalPages - 1 ? pages[pageIdx + 1] : "";
        
        // Extract surrounding lines context for boundary blending
        const prevContext = prevPageText ? prevPageText.split("\n").slice(-6).join("\n") : "";
        const nextContext = nextPageText ? nextPageText.split("\n").slice(0, 6).join("\n") : "";
        
        prompt = `
          Sizga PDF darslikdan olingan aynan bitta sahifa (${pageIdx + 1}-sahifa) matni va uning atrofdagi sahifalar bilan bog'lanish konteksti beriladi.
          Ushbu joriy sahifadagi MUTLAQO BARCHA matematika test savollarini hecham tushirib qoldirmasdan, KETMA-KETLIKDA, 100% to'liq ajratib oling va JSON formatida qaytaring.
          
          DIQQAT MULTI-PAGE CHALA SAVOLLARNI TIKLASH VA TAKRORLANMASLIK QOIDALARI:
          1. Agar joriy sahifaning boshidagi birinchi savol aslida o'tgan sahifada boshlangan bo'lsa (chala bo'lsa), sizga joriy sahifaga yordamchi sifatida oldingi sahifaning oxirgi gaplari (kontekst) berilgan. O'sha kontekstdagi boshlanish qismi bilan joriy sahifadagi davomini birlashtirib, bitta BUTUN mukammal savol qiling va natijaga qo'shing.
          2. Agar joriy sahifaning oxiridagi oxirgi savol keyingi sahifaga o'tib ketsa (chala bo'lsa), sizga joriy sahifaga yordamchi sifatida keyingi sahifaning birinchi gaplari (kontekst) berilgan. O'sha keyingi kontekstni joriy qisqartmaga qo'shib savolni to'liq qiling va natijaga qo'shing.
          3. FAQAT joriy sahifada joylashgan yoki joriy sahifaga bog'liq bo'lgan chala savollarni oling. Oldingi yoki keyingi sahifalardagi boshqa to'liq savollarni natijaga qo'shmang (takrorlanish bo'lmasligi shart!).
          4. Hech qaysi test savoli qolib ketmasligi SHART. Sahifada barcha testlar (hatto 400 yoki 2000 gacha bo'lgan test to'plamidagi barcha betlar) yig'ilganda 100% aniqlik bilan kelishi kerak.
          5. "correctAnswer" indeksini aniqlang (A=0, B=1, C=2, D=3). Agar matnda javob kaliti ko'rinmasa yoki aniqlab bo'lmasa, taxminiy javob yoki 0 deb belgilang.
          6. "id" maydoniga joriy tartib raqamni bering (1, 2, ...).
          
          Format (JSON array of objects):
          [
            {
              "id": 1,
              "text": "savol matni",
              "options": ["A-javob", "B-javob", "C-javob", "D-javob"],
              "correctAnswer": 0
            }
          ]
          
          --- OLDINGI SAHIFA OXIRIDAN YORDAMCHI KONTEKST ---
          ${prevContext || "Mavjud emas (birinchi sahifa)"}
          
          ====== JORIY SAHIFA MATNI (${pageIdx + 1}-SAHIFA) ======
          ${currentPageText}
          
          --- KEYINGI SAHIFA BOSHIDAN YORDAMCHI KONTEKST ---
          ${nextContext || "Mavjud emas (oxirgi sahifa)"}
        `;
      } else {
        const chunk = seg.pagesList
          .map((p, idx) => `--- SAHIFA ${seg.startIdx + idx + 1} ---\n${p}`)
          .join("\n\n");
          
        prompt = `
          Sizga PDF fayldan olingan KO'P SAHIFALI matn (guruh) beriladi. Sahifalar "--- SAHIFA X ---" deb ajratilgan.
          Ushbu sahifalardagi BARCHA matematika test savollarini KETMA-KETLIKDA, hech birini tushirib qoldirmasdan ajratib oling va JSON formatida qaytaring.
          Har bir sahifani alohida-alohida o'qing va barcha testlarini to'liq oling.
          
          DIQQAT QA'TIY QOIDALAR:
          1. 100% ANIQLIK! Hech qaysi test qolib ketmasligi SHART.
          2. Agar savol bir sahifada boshlanib, keyingisida tugasa yoki kesilsa ham ularni qo'shing va oling.
          3. Matnda yo'q narsani yozmang!
          4. "id" maydoniga joriy raqamini qo'ying (1, 2, 3...).
          
          Siz xuddi Google AI Studio kabi barqaror, barcha testlarni to'liq tortib olishingiz kerak. Ohirigacha yetib borganingizga ishonch hosil qiling. Bitta sahifadan boshqasiga o'tganda savollar zanjirini uzmang.
          
          Format (JSON array of objects):
          [
            {
              "id": 1,
              "text": "savol matni",
              "options": ["A", "B", "C", "D"],
              "correctAnswer": 0
            }
          ]

          Matn:
          ${chunk}
        `;
      }

      try {
        const response = await generateContentWithRetry({
          model: modelName,
          contents: prompt,
          config: {
            temperature: temperature,
            responseMimeType: "application/json",
            maxOutputTokens: 8192,
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.NUMBER },
                  text: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctAnswer: { type: Type.NUMBER },
                },
                required: ["id", "text", "options", "correctAnswer"],
              },
            },
          },
        }, 15, (attempt, errorMsg, delayMs) => {
          const activeQuestionsCount = Object.values(segmentResults).reduce((sum, list) => sum + (list?.length || 0), 0);
          onProgress({
            currentSegment: completedSegmentsCount,
            totalSegments,
            processedPages: processedPagesCount,
            totalPages,
            questionsCount: activeQuestionsCount,
            status: `Sahifa ${seg.startIdx + 1} tahlili yuklanish sababli kutilmoqda... (Urinish ${attempt}/15, ${Math.ceil(delayMs / 1000)} soniya ichida qayta uriniladi)`,
            segmentStates,
            segmentQuestionsCount
          });
        });

        const text = response.text || "[]";
        let segmentQuestions: Question[] = [];
        try {
          segmentQuestions = JSON.parse(text) as Question[];
        } catch (err) {
          console.log("Structured data format alignment check...");
          let fixedText = text.trim();
          let lastBrace = fixedText.lastIndexOf("}");

          while (lastBrace !== -1) {
            fixedText = fixedText.substring(0, lastBrace + 1);
            try {
              segmentQuestions = JSON.parse(fixedText + "]") as Question[];
              break;
            } catch (e) {
              fixedText = fixedText.substring(0, fixedText.length - 1);
              lastBrace = fixedText.lastIndexOf("}");
            }
          }
        }

        const validQuestions: Question[] = [];
        for (const q of segmentQuestions) {
          if (!q || !q.text || q.text.length < 5) continue;
          validQuestions.push({
            ...q,
            id: 0, // Placeholder, will be populated on final merge in order
          });
        }

        segmentResults[sIdx] = validQuestions;
        processedPagesCount += seg.pagesList.length;
        completedSegmentsCount++;
        segmentStates[sIdx] = "completed";
        segmentQuestionsCount[sIdx] = validQuestions.length;

        const activeQuestionsCount = Object.values(segmentResults).reduce((sum, list) => sum + (list?.length || 0), 0);

        const status = `Sahifa ${seg.startIdx + 1} - ${seg.endIdx} muvaffaqiyatli tahlil qilindi (+${validQuestions.length} ta yangi savol).`;
        
        onProgress({
          currentSegment: completedSegmentsCount,
          totalSegments,
          processedPages: processedPagesCount,
          totalPages,
          questionsCount: activeQuestionsCount,
          status,
          newQuestions: validQuestions,
          segmentStates,
          segmentQuestionsCount
        });

      } catch (err: any) {
        console.error(`Segment processing error at sahifa ${seg.startIdx + 1}:`, err);
        errorsList.push(err);
        processedPagesCount += seg.pagesList.length;
        completedSegmentsCount++;
        segmentStates[sIdx] = "error";
        segmentQuestionsCount[sIdx] = 0;
        
        segmentResults[sIdx] = []; // fallback to empty array to ensure no holes

        const activeQuestionsCount = Object.values(segmentResults).reduce((sum, list) => sum + (list?.length || 0), 0);

        onProgress({
          currentSegment: completedSegmentsCount,
          totalSegments,
          processedPages: processedPagesCount,
          totalPages,
          questionsCount: activeQuestionsCount,
          status: `Sahifa ${seg.startIdx + 1} - ${seg.endIdx} tahlilida xatolik yuz berdi (${err.message || "Noma'lum"}).`,
          segmentStates,
          segmentQuestionsCount
        });

        if (err.message && err.message.includes("API key")) {
          throw err;
        }
      }
    };

    // Execute with custom concurrency limit
    const queue = [...segmentsData];
    const workerPromises: Promise<void>[] = [];

    const worker = async (workerId: number) => {
      // Stagger worker starts slightly (e.g. 200ms * workerId) to prevent sudden rate limit triggers
      await new Promise((resolve) => setTimeout(resolve, workerId * 200));
      while (queue.length > 0) {
        const seg = queue.shift();
        if (seg) {
          await processSegment(seg, segmentsData.indexOf(seg));
          
          // Introduce a proactive short pacing delay of 0.2 seconds between page requests to maintain lightning speeds
          if (queue.length > 0) {
            const spacingMs = 200;
            console.log(`[AI Pacing] Waiting ${spacingMs}ms before parsing next page...`);
            
            // Render a smooth countdown status inside the logs or console
            let remaining = spacingMs;
            while (remaining > 0) {
              const sleepStep = Math.min(1000, remaining);
              await new Promise((resolve) => setTimeout(resolve, sleepStep));
              remaining -= sleepStep;
            }
          }
        }
      }
    };

    for (let i = 0; i < Math.min(concurrencyLimit, segmentsData.length); i++) {
      workerPromises.push(worker(i));
    }

    await Promise.all(workerPromises);

    // Merge all segments in their exact original order to preserve sequence integrity
    const allQuestions: Question[] = [];
    let currentId = 1;
    for (let s = 0; s < totalSegments; s++) {
      const qList = segmentResults[s] || [];
      for (const q of qList) {
        allQuestions.push({
          ...q,
          id: currentId++
        });
      }
    }

    onProgress({
      currentSegment: totalSegments,
      totalSegments,
      processedPages: totalPages,
      totalPages,
      questionsCount: allQuestions.length,
      status: `Tahlil yakunlandi! Jami ${allQuestions.length} ta savol olindi.`
    });

    if (allQuestions.length === 0 && errorsList.length > 0) {
      throw errorsList[0] || new Error("Kutubxonaga bog'lanish yoki PDF tahlilida xatolik.");
    }

    return allQuestions;

  } catch (error: any) {
    console.error("AI Question Generation Error:", error);
    throw error;
  }
};

export const generateQuestionsFromText = async (
  pages: string[],
): Promise<Question[]> => {
  return generateQuestionsFromTextProgressive(pages, () => {}, "gemini-3.5-flash", 0.5, 1);
};

export const chatWithAI = async (
  message: string,
  modelName: string = "gemini-3.5-flash",
  temperature: number = 0.7,
  systemInstruction: string = "Siz matematika o'qituvchisisiz. Savollarga qisqa va aniq javob bering."
): Promise<string> => {
  try {
    const response = await generateContentWithRetry({
      model: modelName,
      contents: message,
      config: {
        temperature: temperature,
        systemInstruction: systemInstruction,
      },
    });
    return response.text || "Kechirasiz, javob bera olmayman.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "Xatolik yuz berdi.";
  }
};

export async function initializeDatabase(): Promise<void> {
  console.log("[aiService] Database initialized on backend.");
}

export async function getSubjects(): Promise<Subject[]> {
  try {
    const response = await fetch(getAbsoluteApiUrl("/api/subjects"));
    if (!response.ok) {
      throw new Error("Failed to fetch subjects");
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getSubjects:", error);
    return [];
  }
}

export async function getQuestions(subjectId: string): Promise<Question[]> {
  try {
    const subjects = await getSubjects();
    const target = subjects.find(s => s.id === subjectId);
    return target ? target.questions : [];
  } catch (error) {
    console.error("Error in getQuestions:", error);
    return [];
  }
}

export async function addSubject(subjectData: { name: string; description?: string; icon?: string; topicCount?: number; questionCount?: number }): Promise<Subject> {
  const newId = 'sub_' + Math.random().toString(36).substring(2, 9);
  const newSubject: Subject = {
    id: newId,
    name: subjectData.name,
    variantSize: 30,
    questions: [],
    creator: 'dilnuramadaminova06@gmail.com',
    description: subjectData.description || '',
    icon: subjectData.icon || 'BookOpen'
  } as any;

  const response = await fetch(getAbsoluteApiUrl("/api/update-subject"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subjectId: newId,
      name: subjectData.name,
      questions: [],
      variantSize: 30,
      creator: 'dilnuramadaminova06@gmail.com',
      description: subjectData.description,
      icon: subjectData.icon
    })
  });

  if (!response.ok) {
    throw new Error("Failed to add subject on server");
  }

  return newSubject;
}

export async function updateSubject(subjectId: string, updates: Partial<Subject>): Promise<Subject> {
  const subjects = await getSubjects();
  const existing = subjects.find(s => s.id === subjectId);
  if (!existing) {
    throw new Error("Subject not found");
  }

  const updated = {
    ...existing,
    ...updates
  };

  const response = await fetch(getAbsoluteApiUrl("/api/update-subject"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subjectId,
      name: updated.name,
      questions: updated.questions,
      variantSize: updated.variantSize || 30,
      creator: updated.creator || 'dilnuramadaminova06@gmail.com',
      description: updated.description,
      icon: updated.icon
    })
  });

  if (!response.ok) {
    throw new Error("Failed to update subject on server");
  }

  return updated as any;
}

export async function deleteSubject(subjectId: string): Promise<void> {
  const response = await fetch(getAbsoluteApiUrl("/api/delete-subject"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subjectId })
  });

  if (!response.ok) {
    throw new Error("Failed to delete subject on server");
  }
}

