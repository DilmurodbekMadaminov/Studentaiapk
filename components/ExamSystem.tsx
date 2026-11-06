
import React, { useState, useEffect, useCallback } from 'react';
import { generateQuizQuestions, evaluateExamPerformance } from '../services/geminiService';
import { QuizResult, QuizQuestion } from '../types';
import { 
  Clock, ChevronLeft, ChevronRight, Flag, 
  Send, AlertCircle, CheckCircle2, Trophy, 
  BrainCircuit, Loader2, Sparkles, X, Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend
} from 'recharts';

export const ExamSystem: React.FC = () => {
  const [examState, setExamState] = useState<'intro' | 'active' | 'evaluating' | 'finished'>('intro');
  const [topic, setTopic] = useState('');
  const [quizData, setQuizData] = useState<QuizResult | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Timer logic
  useEffect(() => {
    let timer: any;
    if (examState === 'active' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && examState === 'active') {
      handleFinish();
    }
    return () => clearInterval(timer);
  }, [examState, timeLeft]);

  const startExam = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    try {
      const data = await generateQuizQuestions(topic);
      if (data) {
        setQuizData(data);
        setExamState('active');
        setTimeLeft(data.questions.length * 90); // 90 seconds per question
      }
    } catch (e) {
      alert("Xatolik! Qayta urinib ko'ring.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = async () => {
    setExamState('evaluating');
    setIsLoading(true);
    
    // Calculate basic score
    let correctCount = 0;
    quizData?.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswerIndex) correctCount++;
    });

    const results = {
      score: `${correctCount}/${quizData?.questions.length}`,
      answers: answers,
      totalQuestions: quizData?.questions.length
    };

    try {
      const analysis = await evaluateExamPerformance(results, topic);
      setAiAnalysis(analysis || "Tahlil yuborilmadi.");
      setExamState('finished');
    } catch (e) {
      setExamState('finished');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (examState === 'intro') {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
           <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center mx-auto text-primary">
              <BrainCircuit size={40} />
           </div>
           <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Professional Imtihon</h2>
           <p className="text-slate-500 font-medium">Mavzuni kiriting va AI siz uchun test vaqtini belgilaydi.</p>
        </div>

        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
           <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Imtihon mavzusi</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Masalan: SAT Matematika yoki Jahon Tarixi"
                className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 ring-primary/10 transition-all font-bold"
              />
           </div>
           <div className="bg-blue-50 p-6 rounded-2xl flex gap-4 items-start border border-blue-100">
              <Info className="text-primary shrink-0" size={20} />
              <p className="text-xs text-blue-900 font-medium leading-relaxed">
                Imtihon Student AI standartlari asosida o'tkaziladi. Vaqt cheklangan va AI sizning bilimingizni har bir xatodan kelib chiqib tahlil qiladi.
              </p>
           </div>
           <button 
            onClick={startExam}
            disabled={isLoading || !topic.trim()}
            className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2 shadow-xl"
           >
             {isLoading ? <Loader2 className="animate-spin" /> : <PlayIcon />}
             Imtihonni Boshlash
           </button>
        </div>
      </div>
    );
  }

  if (examState === 'active' && quizData) {
    const q = quizData.questions[currentIdx];
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 animate-fade-in">
        {/* Question Area */}
        <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
           <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Savol {currentIdx + 1} / {quizData.questions.length}</span>
              <button 
                onClick={() => setFlags(prev => ({ ...prev, [currentIdx]: !prev[currentIdx] }))}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${flags[currentIdx] ? 'bg-orange-500 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}
              >
                <Flag size={14} /> {flags[currentIdx] ? 'Belgilandi' : 'Belgilash'}
              </button>
           </div>
           
           <div className="flex-1 p-10 overflow-y-auto space-y-10">
              <h3 className="text-2xl font-black text-slate-800 leading-tight">{q.question}</h3>
              <div className="space-y-4">
                 {q.options.map((opt, i) => (
                   <button 
                    key={i}
                    onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: i }))}
                    className={`w-full text-left p-6 rounded-3xl border-2 transition-all flex items-center gap-6 group ${
                      answers[currentIdx] === i 
                        ? 'border-primary bg-primary/5 text-primary' 
                        : 'border-slate-50 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                   >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm transition-all ${
                        answers[currentIdx] === i ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'
                      }`}>
                         {String.fromCharCode(65 + i)}
                      </div>
                      <span className="font-bold text-lg">{opt}</span>
                   </button>
                 ))}
              </div>
           </div>

           <div className="p-8 border-t border-slate-50 flex justify-between bg-slate-50/30">
              <button 
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <ChevronLeft size={16} /> Oldingisi
              </button>
              {currentIdx === quizData.questions.length - 1 ? (
                <button 
                  onClick={handleFinish}
                  className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-primary transition-all flex items-center gap-2"
                >
                  Tugatish <Send size={16} />
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentIdx(prev => Math.min(quizData.questions.length - 1, prev + 1))}
                  className="px-8 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                >
                  Keyingisi <ChevronRight size={16} />
                </button>
              )}
           </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="w-full md:w-80 flex flex-col gap-6">
           <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-xl space-y-4">
              <div className="flex items-center gap-3 text-slate-400">
                 <Clock size={20} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Qolgan Vaqt</span>
              </div>
              <h4 className={`text-4xl font-black tracking-tighter ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </h4>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-primary transition-all duration-1000"
                   style={{ width: `${(timeLeft / (quizData.questions.length * 90)) * 100}%` }}
                 />
              </div>
           </div>

           <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-sm flex-1">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Savollar Ro'yxati</h3>
              <div className="grid grid-cols-5 gap-3">
                 {quizData.questions.map((_, i) => (
                   <button 
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all border-2 ${
                      currentIdx === i ? 'border-slate-900 bg-slate-900 text-white scale-110 shadow-lg' :
                      flags[i] ? 'border-orange-500 bg-orange-500 text-white' :
                      answers[i] !== undefined ? 'border-green-500 bg-green-500 text-white' :
                      'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'
                    }`}
                   >
                     {i + 1}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (examState === 'evaluating') {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
         <div className="text-center space-y-6">
            <div className="relative">
               <Loader2 size={80} className="text-primary animate-spin mx-auto" />
               <Sparkles size={30} className="text-orange-500 absolute top-0 right-0 animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">AI natijalaringizni tahlil qilmoqda...</h3>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Kuting, bu 5-10 soniya vaqt oladi</p>
         </div>
      </div>
    );
  }

  if (examState === 'finished') {
    // Process subject-level performance data for the Recharts visualization
    const subjectDataMap: Record<string, { correct: number; total: number }> = {};
    quizData?.questions.forEach((q, idx) => {
      const categoryName = q.category || "Boshqa";
      if (!subjectDataMap[categoryName]) {
        subjectDataMap[categoryName] = { correct: 0, total: 0 };
      }
      subjectDataMap[categoryName].total += 1;
      if (answers[idx] === q.correctAnswerIndex) {
        subjectDataMap[categoryName].correct += 1;
      }
    });

    const subjectChartData = Object.keys(subjectDataMap).map(category => {
      const { correct, total } = subjectDataMap[category];
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      return {
        name: category,
        "To'g'ri": correct,
        "Umumiy": total,
        "Foiz": accuracy
      };
    });

    return (
      <div className="max-w-4xl mx-auto py-10 space-y-10 animate-fade-in">
         <div className="bg-slate-900 rounded-[4rem] p-12 text-white shadow-2xl relative overflow-hidden text-center">
            <div className="relative z-10 space-y-6">
               <Trophy size={80} className="text-yellow-400 mx-auto fill-yellow-400/20" />
               <h2 className="text-5xl font-black tracking-tighter">Imtihon Yakunlandi!</h2>
               <div className="flex justify-center gap-12 pt-8">
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Umumiy Natija</p>
                     <p className="text-4xl font-black">
                        {Object.keys(answers).filter(k => answers[parseInt(k)] === quizData?.questions[parseInt(k)].correctAnswerIndex).length} / {quizData?.questions.length}
                     </p>
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">O'rtacha Ball</p>
                     <p className="text-4xl font-black text-primary">
                        {Math.round((Object.keys(answers).filter(k => answers[parseInt(k)] === quizData?.questions[parseInt(k)].correctAnswerIndex).length / (quizData?.questions.length || 1)) * 100)}%
                     </p>
                  </div>
               </div>
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/20 to-transparent"></div>
         </div>

         {/* Visual Subject Area Performance breakdown using Recharts */}
         <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-6">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Mavzular Bo'yicha O'sish Ko'rsatkichi</h3>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Subject Area Performance Analysis</p>
               </div>
               <span className="bg-slate-50 text-slate-500 text-xs px-4 py-2 rounded-full font-black border border-slate-100">D3/Recharts Vizualizatsiyasi</span>
            </div>

            <div className="h-80 w-full select-none" style={{ direction: 'ltr' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: '#fff', fontWeight: 700 }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  <Bar dataKey="To'g'ri" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={45} name="To'g'ri Javoblar" />
                  <Bar dataKey="Umumiy" fill="#e2e8f0" radius={[8, 8, 0, 0]} maxBarSize={45} name="Soni" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-50">
              {subjectChartData.map((item, i) => (
                <div key={i} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <h5 className="font-extrabold text-slate-800 text-sm">{item.name}</h5>
                    <p className="text-xs text-slate-400 font-bold">{item["To'g'ri"]} ta to'g'ri / {item["Umumiy"]} ta jami</p>
                  </div>
                  <span className={`text-lg font-black ${item.Foiz >= 70 ? 'text-green-500' : item.Foiz >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
                    {item.Foiz}%
                  </span>
                </div>
              ))}
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl space-y-8">
               <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                     <Sparkles size={24} />
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-slate-900">AI Chuqur Tahlili</h3>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deep Reasoning Insight</p>
                  </div>
               </div>
               <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-medium">
                  <ReactMarkdown>{aiAnalysis || "Tahlil yuklanmadi."}</ReactMarkdown>
               </div>
            </div>

            <div className="space-y-6">
               <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Statistika</h4>
                  <div className="space-y-4">
                     <StatLine label="To'g'ri javoblar" value={Object.keys(answers).filter(k => answers[parseInt(k)] === quizData?.questions[parseInt(k)].correctAnswerIndex).length} color="text-green-500" />
                     <StatLine label="Xatolar" value={(quizData?.questions.length || 0) - Object.keys(answers).filter(k => answers[parseInt(k)] === quizData?.questions[parseInt(k)].correctAnswerIndex).length} color="text-red-500" />
                     <StatLine label="O'tkazib yuborildi" value={(quizData?.questions.length || 0) - Object.keys(answers).length} color="text-orange-500" />
                  </div>
               </div>
               <button 
                onClick={() => setExamState('intro')}
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl"
               >
                 Qayta Topshirish
               </button>
            </div>
         </div>
      </div>
    );
  }

  return null;
};

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const StatLine: React.FC<{ label: string, value: any, color: string }> = ({ label, value, color }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
     <span className={`text-sm font-black ${color}`}>{value}</span>
  </div>
);
