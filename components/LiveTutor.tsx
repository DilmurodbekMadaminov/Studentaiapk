
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, Volume2, Loader2, Sparkles, BrainCircuit, Mic2, FileText, Copy, Check, FileDown, BookOpen } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { generateVoiceLessonNotes } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

export const LiveTutor: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [voiceName, setVoiceName] = useState('Aoede'); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lessonNotes, setLessonNotes] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const { t } = useLanguage();
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const voices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr', 'Aoede'];

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const startSession = async () => {
    setIsConnecting(true);
    setTranscription('');
    
    try {
      let apiKey = localStorage.getItem('GEMINI_API_KEY') || null;

      if (!apiKey && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
          alert("Jonli AI modulidan foydalanish uchun API kalitingizni tanlang Yoki sozlamalarda yozing.");
          await (window as any).aistudio.openSelectKey();
        }
        apiKey = await (window as any).aistudio.getApiKey();
      }

      if (!apiKey) {
         throw new Error("API kalit topilmadi.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      
      const inputAudioContext = new AudioContextClass({ sampleRate: 16000 });
      const outputAudioContext = new AudioContextClass({ sampleRate: 24000 });
      
      // Resume contexts as they might be suspended initially
      if (inputAudioContext.state === 'suspended') await inputAudioContext.resume();
      if (outputAudioContext.state === 'suspended') await outputAudioContext.resume();
      
      audioContextRef.current = outputAudioContext;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-3.1-flash-live-preview',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e: any) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ audio: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + ' ' + (message.serverContent?.outputTranscription?.text || ''));
            }

            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            setIsActive(false);
            setIsConnecting(false);
          },
          onerror: (e: any) => {
            console.error('Live error:', e);
            if (e.message?.includes("Requested entity was not found")) {
               alert("API kalit xatosi yuz berdi. Iltimos kalitni qayta tanlang.");
               if ((window as any).aistudio) (window as any).aistudio.openSelectKey();
            } else {
               alert("Ulanish uzildi yoki mikrofon bilan muammo yuzaga keldi.");
            }
            setIsActive(false);
            setIsConnecting(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          systemInstruction: 'Siz talabalar uchun jonli AI repetitorsiz. Savollarga ovozli javob bering, tushuntirishlaringiz sodda va motivatsiya beruvchi bo\'lsin.',
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err: any) {
      console.error(err);
      setIsConnecting(false);
      alert(err.message || "Mikrofon yoki ulanishda xatolik yuz berdi.");
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsActive(false);
  };

  const handleGenerateNotes = async () => {
    if (!transcription || !transcription.trim()) {
      alert("Konspekt tayyorlash uchun avval darsni boshlang va repetitor bilan gaplashing.");
      return;
    }
    
    setIsAnalyzing(true);
    setLessonNotes('');
    setCopied(false);
    
    try {
      const notes = await generateVoiceLessonNotes(transcription);
      if (notes) {
        setLessonNotes(notes);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Konspekt generatsiya qilishda xatolik yuz berdi.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyNotes = () => {
    if (!lessonNotes) return;
    navigator.clipboard.writeText(lessonNotes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadNotes = () => {
    if (!lessonNotes) return;
    const element = document.createElement("a");
    const file = new Blob([lessonNotes], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = "dars_konspekti.md";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-center pb-20">
      <div className="bg-surface rounded-[2rem] p-8 border border-border shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-8 justify-between">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
         <div className="text-left flex-1 relative z-10">
            <h2 className="text-3xl font-black text-text-primary tracking-tighter flex items-center gap-3">
               Jonli AI Repetitor <span className="bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-xl uppercase tracking-widest">Beta</span>
            </h2>
            <p className="text-text-secondary font-medium mt-2">
              AI bilan jonli muloqot qiling. Real vaqtda ovozli javoblar va tushuntirishlar oling.
            </p>

            {!isActive && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ovoz tanlash:</span>
                <div className="flex bg-background p-1 rounded-xl">
                  {voices.map(v => (
                    <button 
                      key={v}
                      onClick={() => setVoiceName(v)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${voiceName === v ? 'bg-surface shadow-sm text-primary' : 'text-text-secondary hover:text-slate-700'}`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            )}
         </div>
         
         <div className="relative flex items-center justify-center shrink-0 w-48 h-48">
            <div className={`absolute inset-0 bg-primary/10 rounded-full blur-[40px] transition-all duration-1000 ${isActive ? 'scale-150 opacity-100' : 'scale-100 opacity-50'}`}></div>
            
            {isActive && (
               <div className="absolute inset-[-20px] rounded-full border border-primary/20 animate-ping"></div>
            )}

            <button
              onClick={isActive ? stopSession : startSession}
              disabled={isConnecting}
              className={`relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-xl transition-all active:scale-95 ${
                isActive 
                  ? 'bg-red-500 text-white shadow-red-500/30' 
                  : 'bg-primary text-white shadow-primary/30 hover:bg-primary/90'
              } ${isConnecting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isConnecting ? (
                <Loader2 size={36} className="animate-spin mb-2" />
              ) : isActive ? (
                <>
                  <MicOff size={36} className="mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Tugatish</span>
                </>
              ) : (
                <>
                  <Mic size={36} className="mb-1" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Boshlash</span>
                </>
              )}
            </button>
         </div>
      </div>

      {isActive && (
        <div className="flex justify-center gap-2 h-20 items-end mt-4">
          {[0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000].map((delay, idx) => (
            <span 
              key={idx}
              className="w-3 bg-gradient-to-t from-primary/50 to-primary rounded-t-full animate-bounce" 
              style={{ 
                animationDelay: `${delay}ms`,
                height: `${20 + Math.random() * 60}px`
              }}
            ></span>
          ))}
        </div>
      )}

      {transcription && (
        <div className="space-y-6">
          <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-sm text-left relative overflow-hidden transition-all animate-fade-in">
            <div className="flex items-center gap-2 text-primary font-black mb-4 text-[10px] uppercase tracking-widest relative z-10">
              <Volume2 size={16} />
              Jonli transkripsiya
            </div>
            <p className="text-slate-700 text-lg font-medium leading-relaxed relative z-10 break-words">{transcription}</p>
            <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-primary/5 rounded-full blur-[60px]"></div>
          </div>

          {/* Action to analyze transcript and generate lesson notes */}
          <div className="bg-surface p-8 rounded-[2rem] border border-border shadow-sm text-left relative overflow-hidden transition-all space-y-6 animate-fade-in">
             <div className="flex justify-between items-center border-b border-border pb-4 flex-wrap gap-4">
                <div>
                  <h3 className="text-xl font-black text-text-primary tracking-tight">Ovozli darsdan avtomatik konspekt yaratish</h3>
                  <p className="text-text-secondary text-xs font-semibold mt-1">Dars davomidagi gaplarni mantiqiy, tuzilmaviy konspektga aylantiring</p>
                </div>
                {!isAnalyzing && (
                  <button
                    onClick={handleGenerateNotes}
                    className="bg-primary hover:bg-primary/95 text-white font-black text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Sparkles size={16} />
                    Konspekt yaratish
                  </button>
                )}
             </div>

             {isAnalyzing && (
                <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                   <Loader2 size={40} className="animate-spin text-primary" />
                   <h4 className="font-extrabold text-text-primary text-sm">AI dars mazmunini chuqur mantiqiy tahlil qilmoqda...</h4>
                   <p className="text-text-secondary text-xs max-w-sm">Mavzular ajratilib, dars konspekti shakllantirilmoqda. Iltimos, kuting.</p>
                </div>
             )}

             {lessonNotes && (
                <div className="mt-6 border border-border bg-background rounded-2xl p-6 md:p-8 animate-fade-in relative">
                   <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
                      <div className="flex items-center gap-2">
                         <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <FileText size={18} />
                         </div>
                         <span className="font-extrabold text-sm text-text-primary">Dars Konspekti (Markdown)</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <button 
                           onClick={handleCopyNotes}
                           className="text-text-secondary hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-bold bg-surface px-3 py-2 rounded-xl border border-border shadow-sm"
                         >
                           {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                           {copied ? "Nusxalandi" : "Nusxalash"}
                         </button>
                         <button 
                           onClick={handleDownloadNotes}
                           className="text-text-secondary hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-bold bg-surface px-3 py-2 rounded-xl border border-border shadow-sm"
                         >
                           <FileDown size={14} />
                           Yuklab olish
                         </button>
                      </div>
                   </div>
                   
                   <div className="prose prose-slate max-w-none text-left prose-headings:font-black prose-headings:text-text-primary prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:font-bold prose-ul:list-disc">
                      <ReactMarkdown>{lessonNotes}</ReactMarkdown>
                   </div>
                </div>
             )}
          </div>
        </div>
      )}

      {!isActive && !isConnecting && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <TipCard icon={<Mic2 />} title="Ovozli savollar" desc="Mikrofon orqali savol bering, matn kiritish shart emas." />
          <TipCard icon={<BrainCircuit />} title="Tezkor yechimlar" desc="AI masalalarni ovozli tushuntirib, yordam beradi." />
          <TipCard icon={<Sparkles />} title="Cheksiz imkoniyat" desc="Xorijiy tillarni ham ovozli suhbat orqali o'rganing." />
        </div>
      )}
    </div>
  );
};

const TipCard: React.FC<{ icon: React.ReactNode, title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="p-8 bg-surface rounded-[2rem] border border-border shadow-sm hover:border-primary/20 transition-all cursor-default relative overflow-hidden group">
    <div className="absolute top-0 right-0 w-32 h-32 bg-background rounded-bl-[100px] -z-10 group-hover:bg-primary/5 transition-colors"></div>
    <div className="w-12 h-12 bg-background text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
       {icon}
    </div>
    <h3 className="font-black text-text-primary text-lg mb-2">{title}</h3>
    <p className="text-sm text-text-secondary font-medium leading-relaxed">{desc}</p>
  </div>
);

