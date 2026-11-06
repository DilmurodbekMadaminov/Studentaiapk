import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  X,
  MessageCircle,
  FileUp,
  Loader2,
  Bot,
  User,
  Save,
  Cpu,
  Sliders,
  Terminal,
  Sparkles,
  Flame,
  CheckCircle,
  Code
} from "lucide-react";
import { Question } from "../types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}
import { generateQuestionsFromTextProgressive, chatWithAI } from "../services/aiService";
import { extractTextFromFile } from "../services/pdfService";
import { getAbsoluteApiUrl } from "../services/apiConfig";

interface ChatProps {
  onQuestionsLoaded: (questions: Question[], savedSubject?: any) => void;
  userEmail: string;
}

export const Chat: React.FC<ChatProps> = ({ onQuestionsLoaded, userEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Salom! Google AI Studio muhitiga xush kelibsiz. PDF, Word (.docx, .doc) yoki TXT darsligingizni yuklang, men uni parallel va tarmoqlangan segmentizatsiya orqali tezkor tahlil qilib, matematika oqimi ko'rinishida testlarni nusxalab olaman.",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Custom states for Live streaming copying representation
  const [extractedQuestions, setExtractedQuestions] = useState<Question[]>([]);
  const [liveStreamQuestions, setLiveStreamQuestions] = useState<Question[]>([]);
  
  const [variantSize, setVariantSize] = useState<number>(30);
  const [progressiveProgress, setProgressiveProgress] = useState<{
    currentSegment: number;
    totalSegments: number;
    processedPages: number;
    totalPages: number;
    questionsCount: number;
    status: string;
    segmentStates?: { [sIdx: number]: "waiting" | "processing" | "completed" | "error" };
    segmentQuestionsCount?: { [sIdx: number]: number };
  } | null>(null);

  const [hasPaid, setHasPaid] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [subjectName, setSubjectName] = useState("");

  const [systemInstructions, setSystemInstructions] = useState(
    "Siz matematika o'qituvchisisiz. Savollarga qisqa va aniq javob bering."
  );
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [editingStagedIdx, setEditingStagedIdx] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const liveLogsEndRef = useRef<HTMLDivElement>(null);
  const isSavingRef = useRef(false);

  // Playback/AI instructions parameters mimic AI Studio pane
  const [modelSelected, setModelSelected] = useState("gemini-3.5-flash");
  const [temperature, setTemperature] = useState(0.7);
  const [segmentSize, setSegmentSize] = useState<number>(1); // Default to 1 (Strict page-by-page for 100% accuracy)
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (liveLogsEndRef.current) {
      liveLogsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveStreamQuestions]);

  const addUserMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "user",
        content,
        timestamp: Date.now(),
      },
    ]);
  };

  const addAssistantMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content,
        timestamp: Date.now(),
      },
    ]);
  };

  const processFile = async (file: File) => {
    if (!file || isLoading) return;
    const allowedExtensions = [".pdf", ".docx", ".doc", ".txt", ".log", ".csv", ".json", ".xml", ".html", ".md"];
    const fileNameLower = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => fileNameLower.endsWith(ext));
    if (!isAllowed) {
      addAssistantMessage("Faqat PDF, Word (.docx, .doc) va matnli (.txt, .json, .md, .csv) fayllar qabul qilinadi.");
      return;
    }

    setIsLoading(true);
    setAttachedFile(file);
    setIsReviewing(false);
    setEditingStagedIdx(null);
    setLiveStreamQuestions([]);
    addUserMessage(
      `Yuklangan hujjat: "${file.name}". Matn tahlili va ajratish jarayoni boshlandi...`
    );

    try {
      // 100% Speedy Direct JSON file parsing
      if (fileNameLower.endsWith(".json")) {
        try {
          const text = await file.text();
          const parsed = JSON.parse(text);
          let questionsList: Question[] = [];
          let extractedSubjectName = file.name.replace(/\.json$/i, "");
          let loadedVariantSize = 30;

          if (Array.isArray(parsed)) {
            if (parsed.length > 0 && parsed[0].questions) {
              questionsList = parsed[0].questions;
              extractedSubjectName = parsed[0].name || extractedSubjectName;
              loadedVariantSize = parsed[0].variantSize || 30;
            } else {
              questionsList = parsed;
            }
          } else if (parsed && parsed.questions) {
            questionsList = parsed.questions;
            extractedSubjectName = parsed.name || extractedSubjectName;
            loadedVariantSize = parsed.variantSize || 30;
          } else if (parsed && parsed.text && parsed.options) {
            questionsList = [parsed];
          } else {
            throw new Error("JSON formati mos kelmadi. Savollar ro'yxatini (array) yoki fan ob'ektini o'z ichiga olishi lozim.");
          }

          const validatedQuestions = questionsList.map((q, idx) => ({
            id: typeof q.id === 'number' ? q.id : (idx + 1),
            text: q.text || `Savol matni topilmadi #${idx + 1}`,
            options: Array.isArray(q.options) && q.options.length >= 4 
              ? q.options.slice(0, 4) 
              : ["Variant A", "Variant B", "Variant C", "Variant D"],
            correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0
          }));

          setExtractedQuestions(validatedQuestions);
          setSubjectName(extractedSubjectName);
          setVariantSize(loadedVariantSize);
          setIsLoading(false);
          addAssistantMessage(
            `JSON darslik fayli muvaffaqiyatli tahlil qilindi! "${extractedSubjectName}" fanidan jami ${validatedQuestions.length} ta test aniqlandi. Quyidan o'zgartirishlarni tahrirlashingiz yoki bazaga yozishingiz hamda testlarni tahrir etishingiz mumkin.`
          );
          return;
        } catch (jsonErr: any) {
          setIsLoading(false);
          setAttachedFile(null);
          addAssistantMessage(`JSON faylini o'qishda xatolik yuz berdi: ${jsonErr.message}`);
          return;
        }
      }

      const pages = await extractTextFromFile(file);

      if (!pages || pages.length === 0) {
        throw new Error("Hujjatdan matnlarni yuklab bo'lmadi.");
      }

      const totalTextLen = pages.reduce(
        (sum, text) => sum + text.trim().length,
        0
      );
      if (totalTextLen < 30) {
        throw new Error(
          "Hujjatda o'qiladigan matn aniqlanmadi (skanerlangan yoki bo'sh fayl bo'lishi mumkin)."
        );
      }

      let activeSegmentSize = segmentSize;
      if (segmentSize === 0) {
        if (pages.length <= 3) activeSegmentSize = 1;
        else if (pages.length <= 8) activeSegmentSize = 3;
        else if (pages.length <= 16) activeSegmentSize = 5;
        else if (pages.length <= 35) activeSegmentSize = 12;
        else if (pages.length <= 70) activeSegmentSize = 25;
        else activeSegmentSize = 45; // Group up to 45 pages at once to limit the total requests to 2-3 calls!
      }

      const groupingNotice = segmentSize === 0
        ? `Avtomatik guruhlash faollashtirildi (har bir guruhga ${activeSegmentSize} sahifadan yuboriladi - bu darslik yuklashni tezlashtiradi va kunlik bepul API so'rovlar limitini tejaydi)`
        : `Siz tanlagan rejim faol: har bir guruhga ${segmentSize} sahifadan birlashtirildi`;

      addAssistantMessage(
        `Hujjat muvaffaqiyatli aniqlandi (jami: ${pages.length} qism/sahifa)! ${groupingNotice}. Endi Google AI Studio kabi barcha qismlar tahlil qilinib, undagi testlar tartibli ko'chiriladi.`
      );

      // Progressively retrieve questions and stream them live
      const questions = await generateQuestionsFromTextProgressive(pages, (prog) => {
        setProgressiveProgress(prog);
        if (prog.newQuestions && prog.newQuestions.length > 0) {
          // Live append to showing panel on the screen
          setLiveStreamQuestions((prev) => [...prev, ...prog.newQuestions!]);
        }
      }, modelSelected, temperature, activeSegmentSize);

      if (questions && questions.length > 0) {
        setExtractedQuestions(questions);
        addAssistantMessage(
          `Hujjatning barcha qismlari to'liq nusxalandi! Jami ${questions.length} matematika test savollari muvaffaqiyatli ko'chirildi. Iltimos fan nomini kiritib tizimga saqlang.`
        );
      } else {
        throw new Error(
          "Taqdim etilgan matndan savollar ajratilmadi."
        );
      }
    } catch (error: any) {
      console.error("File processing error:", error);
      if (error?.message?.includes("API key not valid")) {
        addAssistantMessage(
          `Google API xatosi: Kiritilgan API kalit yaroqsiz yoki kiritilmagan.`
        );
      } else {
        addAssistantMessage(`Xatolik: ${error.message || "Noma'lum xatolik"}`);
      }
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const saveQuestions = async () => {
    if (isSavingRef.current || isLoading) return;
    if (extractedQuestions.length === 0) return;
    if (!subjectName.trim()) {
      addAssistantMessage("Darslik to'plami uchun fan nomini kiriting.");
      return;
    }

    isSavingRef.current = true;
    setIsLoading(true);
    try {
      const response = await fetch(getAbsoluteApiUrl("/api/save-questions"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-email": userEmail
        },
        body: JSON.stringify({
          questions: extractedQuestions,
          variantSize,
          subjectName,
          creator: userEmail
        }),
      });

      if (!response.ok) throw new Error("Yuklangan ma'lumotlarni yozishda muammo yuz berdi");

      const resData = await response.json();
      const finalSubject = (resData && resData.subject) || {
        id: (resData && resData.subjectId) || subjectName.toLowerCase().replace(/\s+/g, '-'),
        name: subjectName,
        variantSize,
        questions: extractedQuestions,
        creator: userEmail
      };

      addAssistantMessage(
        `Ajoyib! Jami ${extractedQuestions.length} ta test "${subjectName}" fani bo'yicha kutubxonaga yozildi va Split-Screen muharriri faollashmoqda.`
      );
      
      // Auto-trigger direct editing in App.tsx with canonical subject!
      onQuestionsLoaded(extractedQuestions, finalSubject);

      setExtractedQuestions([]);
      setLiveStreamQuestions([]);
      setHasPaid(false);
      setSubjectName("");
    } catch (error: any) {
      addAssistantMessage(`Saqlashda xato: ${error.message}`);
    } finally {
      setIsLoading(false);
      isSavingRef.current = false;
    }
  };

  const simulatePayment = () => {
    if (!subjectName.trim()) {
      addAssistantMessage("Iltimos, darslik nomini kiriting!");
      return;
    }
    setIsPaying(true);
    setTimeout(() => {
      setIsPaying(false);
      setHasPaid(true);
      saveQuestions();
    }, 1500);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const msg = input;
    setInput("");
    addUserMessage(msg);
    setIsLoading(true);
    try {
      const res = await chatWithAI(msg, modelSelected, temperature, systemInstructions);
      addAssistantMessage(res);
    } catch (error) {
      addAssistantMessage("Gemini tizimida xatolik yuz berdi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating launcher trigger resembling real AI Studio icon bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-full shadow-2xl z-50 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95"
        title="Google AI Studio PDF Yuklagich"
        id="ai-studio-launcher"
      >
        {isOpen ? <X size={26} /> : <Bot size={26} className="animate-pulse" />}
      </button>

      {isOpen && (
        <div
          id="google-ai-studio-playground"
          className="fixed md:bottom-24 md:right-6 w-full h-[100dvh] md:max-h-[720px] md:h-[85vh] md:w-[780px] bottom-0 right-0 bg-[#1e1e1e] text-[#e3e3e3] md:rounded-[2rem] rounded-none shadow-2xl border border-none md:border-[#3c4043] flex flex-col md:flex-row z-50 overflow-hidden font-sans animation-in fade-in zoom-in-95"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) processFile(f);
          }}
        >
          {isDragging && (
            <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-md z-50 flex items-center justify-center border-4 border-dashed border-blue-500 md:rounded-[2rem] rounded-none pointer-events-none">
              <div className="text-center p-6 bg-[#1e1e1e] rounded-2xl border border-blue-500 shadow-2xl">
                <Sparkles className="mx-auto w-10 h-10 text-blue-400 mb-2 animate-bounce" />
                <p className="font-bold text-white text-lg">Faylni shu yerga tashlang</p>
                <p className="text-xs text-slate-400 mt-1">PDF, Word (.docx, .doc), TXT yoki JSON fayllar</p>
              </div>
            </div>
          )}

          {/* LEFT COLUMN: Main playground workspace (chat + live logging) */}
          <div className="flex-1 flex flex-col justify-between overflow-hidden border-b md:border-b-0 md:border-r border-[#2d2f31]">
            
            {/* Header branding */}
            <div className="bg-[#2d2f31] px-4 md:px-6 py-4 border-b border-[#3c4043] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-1.5 bg-[#4285f4] rounded-lg text-white font-black text-xs">AI</span>
                <div>
                  <h3 className="font-bold text-xs md:text-sm text-white tracking-wide flex items-center gap-1">
                    Google AI Studio <span className="bg-[#1a73e8] text-white text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-full font-mono">Chat & PDF</span>
                  </h3>
                  <p className="text-[9px] md:text-[10px] text-gray-400 font-mono">Model: {modelSelected} • Temp: {temperature}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#8ab4f8] font-mono font-bold bg-[#1a73e8]/10 px-2 py-0.5 rounded-lg border border-[#1a73e8]/30 md:inline hidden">
                  ⚡ Parallel Segment
                </span>
                
                {/* Mobile Settings Toggle */}
                <button
                  onClick={() => setShowMobileSettings(!showMobileSettings)}
                  className="px-2 py-1 bg-blue-600/10 hover:bg-blue-600/25 border border-blue-500/30 text-[#8ab4f8] hover:text-white rounded-lg md:hidden flex items-center gap-1 transition-all text-[10px] font-bold font-mono"
                  title="Sozlamalar"
                >
                  <Sliders size={12} />
                  <span>Sozlamalar</span>
                </button>

                {/* Mobile Close Button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-[#3c4043] text-gray-400 hover:text-white rounded-lg md:hidden flex items-center justify-center"
                  title="Yopish panelini"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Main scroll content area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#121212] min-h-0 flex flex-col">
              
              {/* Messages logging */}
              <div className="space-y-4 flex-1">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 px-4 rounded-2xl text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#1a73e8] text-white shadow-lg"
                          : "bg-[#2d2f31] border border-[#3c4043] text-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 font-bold text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                        {msg.role === "user" ? <User size={12} /> : <Bot size={12} />}
                        {msg.role === "user" ? "Foydalanuvchi" : "Google AI Engine"}
                      </div>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress and indicators */}
              {isLoading && !progressiveProgress && (
                <div className="flex items-center justify-center gap-2 p-3 bg-[#2d2f31] border border-[#3c4043] rounded-xl self-center text-xs text-blue-400">
                  <Loader2 className="animate-spin w-4 h-4 text-blue-400" />
                  <span>Darslik dastlabki tahlildan o'tkazilmoqda...</span>
                </div>
              )}

              {/* Progressive Load indicators */}
              {progressiveProgress && (
                <div className="bg-[#2d2f31] border border-[#3c4043] rounded-2xl p-4 space-y-3 shadow-2xl shrink-0 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#8ab4f8] flex items-center gap-1.5 font-mono">
                      <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"></span>
                      PROGRESS LOADER SYSTEM
                    </span>
                    <span className="text-xs font-bold text-blue-400 font-mono">
                      {Math.round((progressiveProgress.processedPages / progressiveProgress.totalPages) * 100)}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-[#121212] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ 
                        width: `${progressiveProgress.totalPages > 0 
                          ? (progressiveProgress.processedPages / progressiveProgress.totalPages) * 100 
                          : 0}%` 
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                    <div className="bg-[#1e1e1e] p-2 border border-[#3c4043] rounded-xl leading-snug">
                      <p className="text-gray-400">Ishlar</p>
                      <p className="font-bold text-white text-xs mt-0.5">
                        {progressiveProgress.currentSegment}/{progressiveProgress.totalSegments}
                      </p>
                    </div>
                    <div className="bg-[#1e1e1e] p-2 border border-[#3c4043] rounded-xl leading-snug">
                      <p className="text-gray-400">O'qilda</p>
                      <p className="font-bold text-white text-xs mt-0.5">
                        {progressiveProgress.processedPages}/{progressiveProgress.totalPages} bet
                      </p>
                    </div>
                    <div className="bg-[#1e1e1e] p-2 border border-[#3c4043] rounded-xl leading-snug">
                      <p className="text-emerald-400">Tayyor test</p>
                      <p className="font-bold text-emerald-400 text-xs mt-0.5">
                        {progressiveProgress.questionsCount} ta
                      </p>
                    </div>
                  </div>

                  {progressiveProgress.segmentStates && (
                    <div className="bg-[#121212]/80 border border-[#3c4043] rounded-xl p-2.5 max-h-[150px] overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-gray-800 font-mono text-[9px]">
                      <div className="flex items-center justify-between border-b border-[#2d2f31] pb-1 text-[8.5px] text-[#8ab4f8] font-bold">
                        <span>PAGE-BY-PAGE SCANNER PROGRESS</span>
                        <span>{progressiveProgress.totalSegments} qism</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {Array.from({ length: progressiveProgress.totalSegments }).map((_, sIdx) => {
                          const state = progressiveProgress.segmentStates?.[sIdx] || "waiting";
                          const count = progressiveProgress.segmentQuestionsCount?.[sIdx] || 0;
                          
                          let icon = "⏳";
                          let color = "text-gray-500";
                          let label = "Kutilmoqda";
                          
                          if (state === "processing") {
                            icon = "⚡";
                            color = "text-yellow-400 animate-pulse font-extrabold";
                            label = "Ko'chirilmoqda...";
                          } else if (state === "completed") {
                            icon = "✅";
                            color = "text-emerald-400 font-bold";
                            label = `Nusxalandi (+${count})`;
                          } else if (state === "error") {
                            icon = "❌";
                            color = "text-rose-400 font-bold";
                            label = "Xato";
                          }
                          
                          return (
                            <div 
                              key={sIdx} 
                              className={`flex items-center gap-1.5 px-2 py-1 bg-[#1e1e1e]/60 rounded border leading-none ${
                                state === "processing" 
                                  ? "border-yellow-500/30 bg-yellow-500/5" 
                                  : state === "completed" 
                                  ? "border-emerald-500/20 bg-emerald-500/5"
                                  : "border-transparent"
                              }`}
                            >
                              <span className="text-[10px] shrink-0">{icon}</span>
                              <div className="truncate text-[8.5px] leading-tight">
                                <span className="text-gray-400 font-black">Bet {sIdx + 1}: </span>
                                <span className={color}>{label}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <p className="text-[9px] text-gray-400 font-mono text-center truncate italic">
                    STATUS: {progressiveProgress.status}
                  </p>
                </div>
              )}

              {/* LIVE REPLICATION STREAM OUTPUT (BETDAGI NUSXALAB CO"CHIRIB TURGAN KO'RSATISH) */}
              {(liveStreamQuestions.length > 0 || isLoading) && (
                <div className="bg-[#121212] border border-[#2d2f31] rounded-2xl flex flex-col flex-1 max-h-[220px] overflow-hidden shadow-inner">
                  <div className="bg-[#2d2f31] px-4 py-2 flex items-center justify-between border-b border-[#3c4043]">
                    <span className="text-[10px] font-black tracking-widest text-[#8ab4f8] uppercase font-mono flex items-center gap-1.5">
                      <Terminal size={12} className="text-blue-400" />
                      ⚡ NUSXALANGAN TESTLAR OQIMI (CANLI)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                      +{liveStreamQuestions.length} ta olingan
                    </span>
                  </div>
                  
                  {/* Streaming logs panel */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[10px] text-gray-300 leading-relaxed scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                    {liveStreamQuestions.map((q, idx) => (
                      <div key={idx} className="border-b border-[#2d2f31] pb-1.5 animate-in fade-in duration-200">
                        <p className="text-[#8ab4f8] font-bold">
                          [SAVOL #{q.id}] Nusxalandi ({q.options.length} variantli):
                        </p>
                        <p className="text-white mt-0.5 truncate pl-2">{q.text}</p>
                        <div className="grid grid-cols-2 gap-1 text-[9px] text-gray-400 pl-4 mt-0.5 shrink-0">
                          <span className={`${q.correctAnswer === 0 ? "text-emerald-400 font-bold" : ""}`}>A) {q.options[0]}</span>
                          <span className={`${q.correctAnswer === 1 ? "text-emerald-400 font-bold" : ""}`}>B) {q.options[1]}</span>
                          <span className={`${q.correctAnswer === 2 ? "text-emerald-400 font-bold" : ""}`}>C) {q.options[2]}</span>
                          <span className={`${q.correctAnswer === 3 ? "text-emerald-400 font-bold" : ""}`}>D) {q.options[3]}</span>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <p className="text-[#8ab4f8] animate-pulse flex items-center gap-1">
                        <span className="inline-block w-1.5 h-3 bg-blue-500"></span>
                        Segmentdan testlarni ajratish jarayoni yakunlanmoqda...
                      </p>
                    )}
                    <div ref={liveLogsEndRef} />
                  </div>
                </div>
              )}

              {/* SAVE FORM CONTAINER (Vabo'lgandan keyin tahrirlash va saqlash imkoniyati) */}
              {extractedQuestions.length > 0 && !isLoading && (
                <div className="bg-[#2d2f31] border border-[#3c4043] rounded-2xl p-4 gap-3.5 flex flex-col shadow-2xl animate-in slide-in-from-bottom-2 duration-300 shrink-0">
                  <div className="border-b border-[#3c4043] pb-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider font-mono">SAQLASH VA SAVOLLARNI TAHRIRLASH</span>
                      <h4 className="font-bold text-xs text-white mt-0.5 font-sans">Darslik Testlarini Joylash & Tizimli tahrir</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsReviewing(!isReviewing)}
                      className="px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/40 text-[#8ab4f8] text-[9px] font-extrabold font-mono border border-blue-500/30 rounded-lg transition-colors flex items-center gap-1"
                    >
                      {isReviewing ? "✕ Tahrirni yopish" : "✏️ Testlarni tahrirlash"}
                    </button>
                  </div>

                  {isReviewing && (
                    <div className="bg-[#121212] border border-[#3c4043] rounded-xl p-3 max-h-[220px] overflow-y-auto space-y-2.5 font-mono text-[10px]">
                      <h5 className="text-[#8ab4f8] border-b border-[#2d2f31] pb-1 font-bold text-[9px] tracking-wider uppercase flex items-center gap-1.5Packed font-mono">
                        <span>NUSXALANGAN TESTLAR RO'YXATI ({extractedQuestions.length} ta)</span>
                      </h5>
                      {extractedQuestions.map((q, qIdx) => {
                        const isEditingThis = editingStagedIdx === qIdx;
                        return (
                          <div key={qIdx} className="bg-[#1e1e1e] border border-[#2d2f31] rounded-lg p-2.5 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 font-black text-[9px]">TEST #{qIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => setEditingStagedIdx(isEditingThis ? null : qIdx)}
                                className="text-[#8ab4f8] hover:text-white font-bold text-[9px] px-1.5 py-0.5 bg-[#2d2f31] rounded border border-[#3c4043]"
                              >
                                {isEditingThis ? "Yopish" : "Tahrir ✏️"}
                              </button>
                            </div>

                            {isEditingThis ? (
                              <div className="space-y-2 pt-1 border-t border-[#2d2f31]">
                                <div className="space-y-1">
                                  <label className="text-[9px] text-gray-500">Savol matni:</label>
                                  <textarea
                                    value={q.text}
                                    rows={2}
                                    onChange={(e) => {
                                      const u = [...extractedQuestions];
                                      u[qIdx] = { ...q, text: e.target.value };
                                      setExtractedQuestions(u);
                                    }}
                                    className="w-full bg-[#121212] border border-[#3c4043] text-white rounded p-1.5 text-[10px] outline-none font-sans"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <label className="text-[9px] text-gray-500">Javob variantlari (To'g'ri kalitni o'ngdan belgilang):</label>
                                  {q.options.map((opt, oIdx) => (
                                    <div key={oIdx} className="flex items-center gap-2">
                                      <span className="text-gray-400 text-[9px] w-3 font-bold">{['A','B','C','D'][oIdx]}:</span>
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                          const revisedOpts = [...q.options];
                                          revisedOpts[oIdx] = e.target.value;
                                          const u = [...extractedQuestions];
                                          u[qIdx] = { ...q, options: revisedOpts };
                                          setExtractedQuestions(u);
                                        }}
                                        className="flex-1 bg-[#121212] border border-[#3c4043] text-white rounded p-1 text-[10px] outline-none font-sans"
                                      />
                                      <input
                                        type="radio"
                                        name={`correct-staged-${qIdx}`}
                                        checked={q.correctAnswer === oIdx}
                                        onChange={() => {
                                          const u = [...extractedQuestions];
                                          u[qIdx] = { ...q, correctAnswer: oIdx };
                                          setExtractedQuestions(u);
                                        }}
                                        className="accent-green-500 cursor-pointer h-3 w-3"
                                        title="To'g'ri javob kaliti"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <p className="text-white font-sans text-[11px] font-semibold">{q.text}</p>
                                <div className="grid grid-cols-2 gap-1 text-gray-400 text-[9px] mt-1.5 pl-2">
                                  <span className={q.correctAnswer === 0 ? "text-green-400 font-bold" : ""}>A) {q.options[0]}</span>
                                  <span className={q.correctAnswer === 1 ? "text-green-400 font-bold" : ""}>B) {q.options[1]}</span>
                                  <span className={q.correctAnswer === 2 ? "text-green-400 font-bold" : ""}>C) {q.options[2]}</span>
                                  <span className={q.correctAnswer === 3 ? "text-green-400 font-bold" : ""}>D) {q.options[3]}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide font-mono">
                        Darslik Fan nomi:
                      </label>
                      <input
                        type="text"
                        value={subjectName}
                        onChange={(e) => setSubjectName(e.target.value)}
                        placeholder="Masalan: Matematika 2026"
                        className="w-full bg-[#1e1e1e] border border-[#3c4043] text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide font-mono">
                        Variant hajmi (Savol soni):
                      </label>
                      <input
                        type="number"
                        value={variantSize}
                        onChange={(e) =>
                          setVariantSize(Math.max(1, parseInt(e.target.value) || 1))
                        }
                        className="w-full bg-[#1e1e1e] border border-[#3c4043] text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500 text-center font-mono"
                        min="1"
                      />
                    </div>
                  </div>

                  {!hasPaid ? (
                    <button
                      onClick={saveQuestions}
                      disabled={isLoading || isPaying || !subjectName.trim()}
                      className="flex items-center justify-center gap-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all w-full disabled:opacity-50 disabled:cursor-not-allowed uppercase font-mono"
                    >
                      {isLoading || isPaying ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle size={15} />}
                      Saqlash va Split-Screen tahrirga o'tish
                    </button>
                  ) : (
                    <button
                      onClick={saveQuestions}
                      disabled={isLoading || isPaying || !subjectName.trim()}
                      className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-green-700 transition-all w-full font-mono uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={14} />} Bazaga tahrirsiz yozish
                    </button>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Attached file chip showing active loaded state (AI Studio style layout) */}
            {attachedFile && (
              <div className="mx-4 my-2 p-2.5 bg-[#121212]/90 border border-[#3c4043] rounded-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-1 duration-200" id="attached-file-chip">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-[9px] font-black font-mono tracking-wider">PDF</span>
                  <div className="overflow-hidden">
                    <h4 className="text-[11px] font-bold text-white truncate max-w-[220px] md:max-w-[400px]">{attachedFile.name}</h4>
                    <p className="text-[9px] text-[#8ab4f8] font-mono leading-none mt-0.5">
                      {(attachedFile.size / 1024).toFixed(1)} KB • {isLoading ? 'Sahifa-sahifa nusxalanmoqda... ⚡' : 'Nusxalash yakunlandi ✅'}
                    </p>
                  </div>
                </div>
                {!isLoading && (
                  <button 
                    onClick={() => setAttachedFile(null)}
                    className="text-gray-400 hover:text-white p-1 hover:bg-[#2d2f31] rounded-lg transition-colors shrink-0"
                    title="Hujjatni olib tashlash"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            )}

            {/* Bottom input area */}
            <div className="p-4 bg-[#2d2f31] border-t border-[#3c4043] flex items-center gap-2 shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) processFile(f);
                }}
                accept=".pdf,.docx,.doc,.txt,.log,.csv,.json,.xml,.html,.md"
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-2.5 bg-[#4285f4] hover:bg-blue-600 disabled:bg-gray-600 text-white rounded-xl transition-all flex items-center justify-center gap-1 shrink-0"
                title="Fayl biriktirish (PDF, Word, TXT va boshqalar)"
              >
                <FileUp size={16} />
                <span className="text-[10px] uppercase font-bold tracking-wide lg:inline hidden font-mono">Fayl yuklash</span>
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Google AI-dan matematika savollari haqida so'rash..."
                className="flex-1 bg-[#1e1e1e] text-white rounded-xl px-4 py-2 text-xs border border-[#3c4043] outline-none focus:border-blue-500"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="p-2 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-xl flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                <Send size={15} />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Studio sidebar control panel (mimics custom instructions model keys) */}
          <div className={`${showMobileSettings ? "flex animate-in slide-in-from-right duration-200" : "hidden md:flex"} w-full md:w-[240px] bg-[#2d2f31] p-5 flex-col justify-between overflow-y-auto border-t md:border-t-0 border-[#3c4043] shrink-0 h-auto md:h-auto`}>
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-[#e3e3e3] text-xs uppercase tracking-widest font-mono flex items-center gap-2">
                    <Sliders size={14} className="text-blue-400" />
                    SOZLAMALAR
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-1">Google AI Studio API parametrlari</p>
                </div>
                {/* Mobile settings close action */}
                <button
                  type="button"
                  onClick={() => setShowMobileSettings(false)}
                  className="p-1 hover:bg-[#3c4043] text-gray-400 hover:text-white rounded-lg md:hidden flex items-center justify-center border border-[#3c4043]"
                  title="Yopish"
                >
                  <X size={14} />
                </button>
              </div>

              {/* System Instructions */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide font-mono">System Instructions:</label>
                <textarea
                  rows={3}
                  value={systemInstructions}
                  onChange={(e) => setSystemInstructions(e.target.value)}
                  placeholder="Siz matematika o'qituvchisisiz. Savollarga qisqa va aniq javob bering."
                  className="w-full bg-[#1e1e1e] border border-[#3c4043] text-white rounded-lg p-2 text-[10.5px] font-mono outline-none focus:border-blue-500 resize-none leading-normal"
                />
                <p className="text-[9px] text-gray-500 font-mono">Modelga yo'l-yo'riq beruvchi tizim prompti (Instruction set).</p>
              </div>

              {/* Model selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide font-mono">Model:</label>
                <select 
                  value={modelSelected} 
                  onChange={(e) => setModelSelected(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-[#3c4043] text-white rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none focus:border-blue-500"
                >
                  <option value="gemini-3.5-flash">gemini-3.5-flash</option>
                  <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite</option>
                  <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview</option>
                </select>
                <p className="text-[9px] text-gray-500">Matematik ifodalar va to'laqonli segmentlarni tezkor qayta ishlash foni moduli.</p>
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <label className="font-bold text-gray-400 uppercase tracking-wide">Temperature:</label>
                  <span className="text-blue-400 font-bold">{temperature}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 bg-[#1e1e1e] h-1 rounded-lg"
                />
                <p className="text-[9px] text-gray-500">Kichik koeffitsientlar aniqlikni, kattalari kreativ ko'chiruvni oshiradi.</p>
              </div>

              {/* Segment Size selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide font-mono">Segment (Guruhlash):</label>
                <select 
                  value={segmentSize} 
                  onChange={(e) => setSegmentSize(parseInt(e.target.value))}
                  className="w-full bg-[#1e1e1e] border border-[#3c4043] text-white rounded-lg px-2.5 py-1.5 text-xs font-mono outline-none focus:border-blue-500"
                >
                  <option value={0}>Auto (Tejamkor va barqaror - Tavsiya etiladi)</option>
                  <option value={1}>Har bir sahifani alohida (100% aniqlik)</option>
                  <option value={2}>2 sahifadan guruhlash (Tezroq)</option>
                  <option value={4}>4 sahifadan guruhlash (Tezkor va tejamkor)</option>
                  <option value={8}>8 sahifadan guruhlash (Maksimal tejamkor)</option>
                  <option value={15}>15 sahifadan guruhlash (Super tejamkor)</option>
                  <option value={30}>30 sahifadan guruhlash (Maksimal tejamkor - Faqat 1-2 so'rov)</option>
                  <option value={50}>50 sahifadan guruhlash (Ekstremal tejamkor - Katta hajmdagi fayllar)</option>
                </select>
                <p className="text-[9px] text-gray-500">
                  Auto rejimi darslik sahifalar soniga qarab optimal guruhlash hajmini belgilaydi va so'rovlar sonini kamaytirib, 429 xatoligini butunlay oldini oladi.
                </p>
              </div>

              {/* Safe system guidelines info boxes */}
              <div className="bg-[#121212]/50 border border-[#3c4043] p-3 rounded-xl space-y-2 font-mono text-[9px] text-gray-400">
                <div className="flex items-center gap-1.5 text-[#8ab4f8] font-bold text-[10px]">
                  <Flame size={12} />
                  <span>PARALLEL TIZIM</span>
                </div>
                <p className="leading-relaxed">
                  Matnlar sinxron yoki parallel ravishda sahifa-sahifa ajratilib Gemini klasterida tahlil qilinadi. Har bir sahifani alohida ishlash usuli 400 yoki 2000 gacha bo'lgan darslik testlarini 100% yo'qotishlarsiz saqlash imkonini beradi.
                </p>
              </div>

            </div>

            {/* Bottom help links */}
            <div className="pt-4 border-t border-[#3c4043] text-center text-[9px] text-gray-500 font-mono">
              <p>Google GenAI SDK Integration</p>
              <p className="mt-1 text-[#8ab4f8] font-bold">talabaai.uz talabi bo'yicha</p>
            </div>

          </div>

        </div>
      )}
    </>
  );
};
