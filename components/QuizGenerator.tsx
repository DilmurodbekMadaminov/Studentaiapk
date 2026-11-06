import React, { useState, useRef } from 'react';
import { generateQuizQuestions, generateQuizFromPDF, generateQuizFromManualPages } from '../services/geminiService';
import { QuizResult, User } from '../types';
import { dbService } from '../services/dbService';
import { getAbsoluteApiUrl } from '../services/apiConfig';
import { ProSubscriptionModal } from './ProSubscriptionModal';
import { 
  CheckCircle2, XCircle, RefreshCw, GraduationCap, 
  Loader2, Sparkles, BrainCircuit, ChevronRight,
  Trophy, Timer, Target, BookOpen, Calculator, FileUp, Plus, Trash2, Save,
  Lock, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const QuizGenerator: React.FC<{ user?: User | null }> = ({ user }) => {
  const currentUser = user || dbService.getCurrentUser();
  const userEmail = currentUser?.email || '';
  const isPro = !!currentUser?.isPro;

  const [activeUploadMode, setActiveUploadMode] = useState<'pdf' | 'manual'>('pdf');
  const [topic, setTopic] = useState('');
  const [manualPages, setManualPages] = useState<string[]>(['']);
  const [quizData, setQuizData] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [showProModal, setShowProModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetQuizState = () => {
    setLoading(true);
    setQuizData(null);
    setShowResults(false);
    setSelectedAnswers([]);
    setActiveQuestion(0);
    setSavedSuccess(false);
  };

  const handleSaveToAccount = async () => {
    if (!quizData || !userEmail) {
      alert("Testni akkauntga saqlash uchun tizimga kirishingiz lozim!");
      return;
    }
    setSaving(true);
    try {
      const subjectName = topic || "PDF/Darslik Testi";
      const response = await fetch(getAbsoluteApiUrl("/api/save-questions"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-email": userEmail
        },
        body: JSON.stringify({
          questions: quizData.questions,
          variantSize: 30,
          subjectName: subjectName,
          creator: userEmail
        }),
      });

      if (response.ok) {
        setSavedSuccess(true);
        alert(`Ajoyib! "${subjectName}" testi faqat sizning shaxsiy akkauntingiz kutubxonasiga saqlandi!`);
      } else {
        const err = await response.json();
        alert(err.error || "Saqlashda xatolik yuz berdi");
      }
    } catch (err: any) {
      alert("Server bilan ulanishda xatolik: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) return;
    resetQuizState();
    
    try {
      const data = await generateQuizQuestions(topic);
      if (data) {
        setQuizData(data);
        setSelectedAnswers(new Array(data.questions.length).fill(-1));
      }
    } catch (error) {
      console.error(error);
      alert("Test tuzishda xatolik. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPro) {
      setShowProModal(true);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    
    resetQuizState();
    try {
      const data = await generateQuizFromPDF(file, 'medium');
      if (data) {
        setQuizData(data);
        setSelectedAnswers(new Array(data.questions.length).fill(-1));
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "PDF dan test tuzishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleGenerateFromManual = async () => {
    const filteredPages = manualPages.filter(p => p.trim().length > 0);
    if (filteredPages.length === 0) {
      alert("Iltimos, kamida bitta sahifaning matnini to'ldiring.");
      return;
    }
    
    resetQuizState();
    try {
      const data = await generateQuizFromManualPages(filteredPages, 'medium', 'Umumiy mavzu', topic || 'Yozma Darslik Testi');
      if (data) {
        setQuizData(data);
        setSelectedAnswers(new Array(data.questions.length).fill(-1));
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Sahifalar asosida test tuzishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (showResults) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[activeQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    let score = 0;
    quizData.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) score++;
    });
    return score;
  };

  const isLastQuestion = quizData ? activeQuestion === quizData.questions.length - 1 : false;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 p-4">
      {/* Header Section */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="space-y-4 text-center md:text-left">
                   <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/5">
                      <Sparkles size={14} /> AI-Powered Assessment
                   </div>
                   <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                      Akademik <span className="text-primary italic">Testlar</span>
                   </h2>
                   <p className="text-slate-400 text-sm md:text-base font-medium max-w-md">
                      Istalgan mavzuni kiriting va Student AI siz uchun maxsus test savollarini shakllantiradi.
                   </p>
                </div>
                
                <div className="w-full md:w-80 space-y-3">
                   <div className="relative">
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Mavzuni kiriting..."
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:bg-white/10 focus:ring-2 focus:ring-primary outline-none transition-all font-bold"
                      />
                   </div>
                   <button
                     onClick={handleGenerateQuiz}
                     disabled={loading || !topic.trim()}
                     className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     {loading ? <Loader2 className="animate-spin" /> : <><RefreshCw size={16} /> Testni Shakllantirish</>}
                   </button>
                   
                   <div className="relative pt-2">
                     <button
                       onClick={() => {
                         if (!isPro) {
                           setShowProModal(true);
                         } else {
                           fileInputRef.current?.click();
                         }
                       }}
                       disabled={loading}
                       className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 border cursor-pointer ${
                         isPro 
                           ? 'bg-white/10 text-white hover:bg-white/20 border-white/10' 
                           : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                       }`}
                     >
                       {isPro ? <FileUp size={16} /> : <Lock size={16} className="text-amber-400" />}
                       <span>PDF dan Tuzish</span>
                       {!isPro && <span className="bg-amber-400 text-slate-900 text-[9px] px-1.5 py-0.5 rounded-md font-black">PRO</span>}
                     </button>
                     <input 
                        type="file" 
                        accept="application/pdf"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                   </div>
                </div>
             </div>
             <BrainCircuit size={400} className="absolute -bottom-20 -right-20 text-white/5 rotate-12 pointer-events-none" />
             {/* Dynamic manual upload selectors */}
          </div>

          {!quizData && (
             <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center mt-6">
                <div>
                   <h3 className="font-black text-xs uppercase tracking-widest text-[#342E37]">Darslik yuklash shakli</h3>
                   <p className="text-sm font-medium text-slate-500 mt-1">PDF yuklashingiz yoki sahifalarni betma-bet qo'lda nusxalashingiz mumkin.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl">
                   <button 
                     onClick={() => {
                       if (!isPro) {
                         setShowProModal(true);
                       } else {
                         setActiveUploadMode('pdf');
                       }
                     }}
                     className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer ${activeUploadMode === 'pdf' ? 'bg-primary text-white shadow-sm' : 'text-slate-500'}`}
                   >
                     <span>PDF Fayl</span>
                     {!isPro && <Lock size={12} className="text-amber-500" />}
                   </button>
                   <button 
                     onClick={() => { setActiveUploadMode('manual'); }}
                     className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeUploadMode === 'manual' ? 'bg-primary text-white shadow-sm' : 'text-slate-500'}`}
                   >
                     Matnli Nusxa (Betma-bet)
                   </button>
                </div>
             </div>
          )}

          {!quizData && activeUploadMode === 'pdf' && !isPro && !loading && (
             <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-8 md:p-10 rounded-[2.5rem] border border-amber-500/30 shadow-2xl space-y-6 mt-6 relative overflow-hidden text-white">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                   <div className="space-y-3 text-center md:text-left">
                      <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-400/30">
                         <Crown size={14} className="text-amber-400" /> PRO Versiya Imkoniyati
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                         PDF Darslik Yuklash Qismi Cheklangan
                      </h3>
                      <p className="text-slate-300 text-xs md:text-sm font-medium max-w-xl leading-relaxed">
                         PDF kitob va darsliklardan 30 talik avtomatik akademik testlar tuzish funksiyasi faqat PRO obunachilar uchun ochiq. PRO tarifini faollashtiring yoki admin promo-kodingizni kiriting.
                      </p>
                   </div>

                   <button
                     onClick={() => setShowProModal(true)}
                     className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer whitespace-nowrap flex-shrink-0"
                   >
                     <Lock size={16} />
                     <span>PRO Versiyaga O'tish</span>
                   </button>
                </div>
                <BrainCircuit size={260} className="absolute -bottom-10 -right-10 text-white/5 pointer-events-none" />
             </div>
          )}

          {!quizData && activeUploadMode === 'manual' && !loading && (
             <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6 mt-6">
                <div className="flex justify-between items-center">
                   <div>
                      <h3 className="font-black text-lg text-slate-900">Darslikni qo'lda betma-bet kiritish</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Har bir sahifa alohida segmentda parallel testlanadi</p>
                   </div>
                   <button 
                     onClick={() => setManualPages([...manualPages, ''])}
                     className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#342E37] bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl hover:bg-slate-100 transition"
                   >
                      <Plus size={14} /> Sahifa qo'shish
                   </button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                   {manualPages.map((pageText, idx) => (
                      <div key={idx} className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative">
                         <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sahifa #{idx + 1}</span>
                            {manualPages.length > 1 && (
                               <button 
                                 onClick={() => setManualPages(manualPages.filter((_, i) => i !== idx))}
                                 className="text-red-500 hover:text-red-700 p-1"
                               >
                                  <Trash2 size={14} />
                               </button>
                            )}
                         </div>
                         <textarea 
                           className="w-full bg-white border border-slate-200 focus:border-primary outline-none p-4 rounded-xl text-sm font-medium" 
                           rows={4} 
                           placeholder={`Ushbu darslikning ${idx + 1}-sahifasidagi barcha matnni shu yerga nusxalang (kopiya qilib joylang)...`}
                           value={pageText}
                           onChange={(e) => {
                              const updated = [...manualPages];
                              updated[idx] = e.target.value;
                              setManualPages(updated);
                           }}
                         />
                      </div>
                   ))}
                </div>

                <button 
                  onClick={handleGenerateFromManual}
                  disabled={loading}
                  className="w-full py-4 bg-slate-900 text-white hover:bg-primary rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 animate-pulse"
                >
                   <Sparkles size={16} /> Nusxa Sahifalar Asosida Testni Yarating (100% tahrir)
                </button>
             </div>
          )}

          <AnimatePresence mode="wait">
            {!quizData && !loading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                <FeatureCard icon={<Target className="text-blue-500" />} title="Aniq Savollar" desc="Gemini 3.1 Pro orqali o'ta aniq akademik savollar" />
                <FeatureCard icon={<Timer className="text-amber-500" />} title="Tezkor Natija" desc="Soniya ichida bilimingizni tahlil qiling" />
                <FeatureCard icon={<Trophy className="text-green-500" />} title="Reyting" desc="Har bir test sizning global reytingingizga ta'sir qiladi" />
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 flex flex-col items-center justify-center space-y-6"
              >
                <div className="relative">
                  <div className="w-24 h-24 border-4 border-primary/20 rounded-full animate-ping absolute"></div>
                  <div className="w-24 h-24 border-b-4 border-primary rounded-full animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={32} />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">AI Testni Tuzmoqda</h3>
                  <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Deep Reasoning is active...</p>
                </div>
              </motion.div>
            )}

            {quizData && (
              <motion.div 
                key="quiz-content"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {!showResults ? (
                  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
                    {/* Progress Bar */}
                    <div className="h-2 bg-slate-50 w-full">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((activeQuestion + 1) / quizData.questions.length) * 100}%` }}
                        className="h-full bg-primary"
                      />
                    </div>

                    <div className="p-8 md:p-12 space-y-10">
                      <div className="flex justify-between items-center flex-wrap gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Savol {activeQuestion + 1} / {quizData.questions.length}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-900 uppercase tracking-widest border border-slate-100">{topic || "Darslik Testi"}</span>
                          <button
                            onClick={handleSaveToAccount}
                            disabled={saving || savedSuccess}
                            className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                          >
                            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                            {savedSuccess ? "Akkauntga Saqlandi!" : "Akkauntga Saqlash"}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                          {quizData.questions[activeQuestion].question}
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                          {quizData.questions[activeQuestion].options.map((option, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSelectOption(idx)}
                              className={`group relative p-6 rounded-2xl border-2 transition-all text-left flex items-center justify-between ${
                                selectedAnswers[activeQuestion] === idx 
                                  ? 'border-primary bg-primary/5 text-primary' 
                                  : 'border-slate-50 bg-slate-50/50 text-slate-600 hover:border-slate-200 hover:bg-white'
                              }`}
                            >
                              <span className="font-bold text-base md:text-lg">{option}</span>
                              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                selectedAnswers[activeQuestion] === idx ? 'border-primary bg-primary' : 'border-slate-200'
                              }`}>
                                {selectedAnswers[activeQuestion] === idx && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between pt-6">
                        <button 
                          onClick={() => setActiveQuestion(prev => Math.max(0, prev - 1))}
                          disabled={activeQuestion === 0}
                          className="px-8 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 disabled:opacity-0 transition-all"
                        >
                          Orqaga
                        </button>
                        
                        {isLastQuestion ? (
                          <button 
                            onClick={() => setShowResults(true)}
                            disabled={selectedAnswers.includes(-1)}
                            className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-primary transition-all disabled:opacity-50"
                          >
                            Natijani Ko'rish
                          </button>
                        ) : (
                          <button 
                            onClick={() => setActiveQuestion(prev => prev + 1)}
                            disabled={selectedAnswers[activeQuestion] === -1}
                            className="px-10 py-5 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            Keyingisi <ChevronRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden"
                  >
                    <div className="p-12 text-center space-y-8">
                      <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-50 rounded-[2rem] shadow-inner mb-4">
                        <Trophy className="text-primary" size={48} />
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">Sizning Natijangiz</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Akademik Tahlil Yakunlandi</p>
                      </div>

                      <div className="flex justify-center gap-12 py-8">
                        <div className="text-center">
                          <p className="text-5xl font-black text-slate-900">{calculateScore()}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">To'g'ri</p>
                        </div>
                        <div className="w-px h-16 bg-slate-100" />
                        <div className="text-center">
                          <p className="text-5xl font-black text-slate-900">{quizData.questions.length}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Jami</p>
                        </div>
                        <div className="w-px h-16 bg-slate-100" />
                        <div className="text-center">
                          <p className="text-5xl font-black text-primary">{Math.round((calculateScore() / quizData.questions.length) * 100)}%</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Foiz</p>
                        </div>
                      </div>

                      <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 text-left space-y-6">
                        <h4 className="font-black text-xs uppercase tracking-widest text-slate-400">Savollar Tahlili</h4>
                        <div className="space-y-4">
                          {quizData.questions.map((q, idx) => (
                            <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100">
                              {selectedAnswers[idx] === q.correctAnswerIndex ? (
                                <CheckCircle2 className="text-green-500 mt-1 flex-shrink-0" size={18} />
                              ) : (
                                <XCircle className="text-red-500 mt-1 flex-shrink-0" size={18} />
                              )}
                              <div>
                                <p className="text-sm font-bold text-slate-900">{q.question}</p>
                                <p className="text-xs text-slate-400 mt-1">To'g'ri javob: <span className="text-green-600 font-bold">{q.options[q.correctAnswerIndex]}</span></p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={handleGenerateQuiz}
                        className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-primary transition-all flex items-center justify-center gap-3"
                      >
                        <RefreshCw size={18} /> Yangi Test Boshlash
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <ProSubscriptionModal 
            isOpen={showProModal} 
            onClose={() => setShowProModal(false)} 
            user={currentUser} 
            onSuccess={(updatedUser) => {
              if (updatedUser) {
                dbService.setSession(updatedUser);
                window.dispatchEvent(new CustomEvent('user_session_updated', { detail: updatedUser }));
              }
              setShowProModal(false);
            }} 
          />
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-6 shadow-inner">
      {icon}
    </div>
    <h4 className="font-black text-slate-900 text-sm uppercase tracking-widest mb-2">{title}</h4>
    <p className="text-xs text-slate-400 font-medium leading-relaxed">{desc}</p>
  </div>
);
