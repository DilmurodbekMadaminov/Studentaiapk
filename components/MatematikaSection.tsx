import React, { useState, useEffect, useMemo } from 'react';
import { Question, Subject, User } from '../types';
import backupSubjects from '../data/subjects.json';
import { getAbsoluteApiUrl } from '../services/apiConfig';
import { Chat } from './Chat';
import { SplitScreenEditor } from './SplitScreenEditor';
import { ProSubscriptionModal } from './ProSubscriptionModal';
import { dbService } from '../services/dbService';
import { 
  Calculator, Trophy, Zap, Share2, LayoutGrid, CheckCircle2, 
  XCircle, RotateCcw, ChevronRight, ArrowLeft, MessageCircle, 
  HelpCircle, Plus, Search, Edit3, Trash2, FileUp, Sparkles, BookOpen,
  Lock, Crown
} from 'lucide-react';

interface QuizState {
  selectedSubject: string | null;
  selectedVariant: number | null;
  currentQuestionIndex: number;
  score: number;
  showResults: boolean;
  userAnswers: (number | null)[];
  isStarted: boolean;
}

export const MatematikaSection: React.FC<{ user?: User | null }> = ({ user }) => {
  const currentUser = user || dbService.getCurrentUser();
  const userEmail = currentUser?.email || '';
  const isPro = !!currentUser?.isPro;

  const [showProModal, setShowProModal] = useState(false);

  const [state, setState] = useState<QuizState>({
    selectedSubject: null,
    selectedVariant: null,
    currentQuestionIndex: 0,
    score: 0,
    showResults: false,
    userAnswers: [],
    isStarted: false,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([0, 1, 2, 3]);

  // Dynamic Subjects database syncing
  const [dynamicSubjects, setDynamicSubjects] = useState<Subject[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);

  const fetchSubjects = async (email?: string) => {
    setIsLoadingSubjects(true);
    try {
      const activeEmail = email || userEmail;
      const res = await fetch(getAbsoluteApiUrl(`/api/subjects?creator=${encodeURIComponent(activeEmail)}`), {
        headers: { 'x-user-email': activeEmail }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setDynamicSubjects(data);
          setIsLoadingSubjects(false);
          return data;
        }
      }
    } catch (err) {
      console.error("Error loading live subjects:", err);
    }
    setDynamicSubjects(backupSubjects as Subject[]);
    setIsLoadingSubjects(false);
    return backupSubjects;
  };

  useEffect(() => {
    fetchSubjects(userEmail);
  }, [userEmail]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteSubject = async (subjectId: string, subjectName: string) => {
    if (!userEmail) {
      showToast("Testni o'chirish uchun tizimga kirishingiz lozim!");
      return;
    }
    if (window.confirm(`Haqiqatan ham "${subjectName}" darsligini o'chirmoqchisiz?`)) {
      try {
        const response = await fetch(getAbsoluteApiUrl('/api/delete-subject'), {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-email': userEmail 
          },
          body: JSON.stringify({ subjectId, userEmail })
        });
        if (response.ok) {
          showToast("Muvaffaqiyatli o'chirildi!");
          fetchSubjects(userEmail);
        } else {
          const errData = await response.json();
          showToast(errData.error || "O'chirishda xatolik yuz berdi");
        }
      } catch (err) {
        showToast("Server ulanishida xatolik");
      }
    }
  };

  const subjectsList = useMemo(() => {
    const rawList: Subject[] = dynamicSubjects.length > 0 ? dynamicSubjects : (backupSubjects as Subject[]);
    
    // Deduplicate by ID and normalized Name + Creator
    const seen = new Set<string>();
    const dedupedList: Subject[] = [];
    for (const sub of rawList) {
      const normKey = `${(sub.creator || 'system').toLowerCase()}::${(sub.name || '').trim().toLowerCase()}`;
      if (!seen.has(sub.id) && !seen.has(normKey)) {
        seen.add(sub.id);
        seen.add(normKey);
        dedupedList.push(sub);
      }
    }

    let filtered = dedupedList;

    if (showOnlyMine) {
      filtered = filtered.filter(sub => {
        const creator = (sub.creator || '').toLowerCase();
        return creator === userEmail.toLowerCase() && creator !== 'system';
      });
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.name.toLowerCase().includes(query) || 
        (sub.description && sub.description.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [dynamicSubjects, userEmail, showOnlyMine, searchQuery]);

  const totalVariantsForSubjectLocal = (subjectId: string) => {
    const subject = (dynamicSubjects.length > 0 ? dynamicSubjects : (backupSubjects as Subject[])).find(s => s.id === subjectId);
    if (!subject) return 0;
    const vSize = subject.variantSize || 30;
    return Math.ceil(subject.questions.length / vSize);
  };

  const getQuestionsByVariantLocal = (subjectId: string, variant: number): Question[] => {
    const subject = (dynamicSubjects.length > 0 ? dynamicSubjects : (backupSubjects as Subject[])).find(s => s.id === subjectId);
    if (!subject) return [];
    const vSize = subject.variantSize || 30;
    const start = (variant - 1) * vSize;
    const end = start + vSize;
    return subject.questions.slice(start, end);
  };

  const currentQuestions = state.selectedSubject && state.selectedVariant 
    ? getQuestionsByVariantLocal(state.selectedSubject, state.selectedVariant) 
    : [];
  const currentQuestion = currentQuestions[state.currentQuestionIndex];

  // Fisher-Yates shuffle
  const shuffleArray = (array: number[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  useEffect(() => {
    if (currentQuestion) {
      setShuffledIndices(shuffleArray([0, 1, 2, 3]));
    }
  }, [currentQuestion]);

  const selectVariant = (subjectId: string, variant: number) => {
    const questions = getQuestionsByVariantLocal(subjectId, variant);
    setState({
      selectedSubject: subjectId,
      selectedVariant: variant,
      currentQuestionIndex: 0,
      score: 0,
      showResults: false,
      userAnswers: Array(questions.length).fill(null),
      isStarted: true,
    });
    setIsAnswered(false);
    setSelectedOption(null);
  };

  const handleOptionSelect = (displayIndex: number) => {
    if (isAnswered || !currentQuestion) return;

    const originalIndex = shuffledIndices[displayIndex];
    setSelectedOption(originalIndex);

    const isCorrect = originalIndex === currentQuestion.correctAnswer;
    setIsAnswered(true);

    if (isCorrect) {
      setState(prev => ({ ...prev, score: prev.score + 1 }));
    }

    setTimeout(() => {
      handleNext();
    }, 1400);
  };

  const handleNext = () => {
    setState(prev => {
      if (prev.showResults || !prev.isStarted || !prev.selectedVariant || !prev.selectedSubject) return prev;
      const questions = getQuestionsByVariantLocal(prev.selectedSubject, prev.selectedVariant);

      if (prev.currentQuestionIndex + 1 < questions.length) {
        return {
          ...prev,
          currentQuestionIndex: prev.currentQuestionIndex + 1
        };
      } else {
        return { ...prev, showResults: true };
      }
    });
    setIsAnswered(false);
    setSelectedOption(null);
  };

  const resetToHome = () => {
    setState({
      selectedSubject: null,
      selectedVariant: null,
      currentQuestionIndex: 0,
      score: 0,
      showResults: false,
      userAnswers: [],
      isStarted: false,
    });
  };

  const copyShareLink = (e: React.MouseEvent, subjectId?: string, variant?: number) => {
    e.stopPropagation();
    const baseUrl = window.location.origin + window.location.pathname;
    let shareUrl = baseUrl;
    if (subjectId && variant) shareUrl = `${baseUrl}?subject=${subjectId}&variant=${variant}`;
    else if (subjectId) shareUrl = `${baseUrl}?subject=${subjectId}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast(variant ? `Variant ${variant} havolasi nusxalandi!` : "Bo'lim havolasi nusxalandi!");
      }).catch(() => {
        showToast("Havola nusxalandi");
      });
    } else {
      showToast("Havola nusxalandi");
    }
  };

  const handleQuestionsLoaded = async (newQuestions: Question[], newlySavedSubject: any) => {
    if (newlySavedSubject) {
      const refreshedList = await fetchSubjects();
      const targetSub = refreshedList.find((s: any) => (
        s.id === newlySavedSubject.id ||
        (s.creator && s.creator.toLowerCase() === (newlySavedSubject.creator || '').toLowerCase() &&
         s.name && s.name.trim().toLowerCase() === (newlySavedSubject.name || '').trim().toLowerCase())
      )) || newlySavedSubject;
      setEditingSubject(targetSub);
      showToast(`Muvaffaqiyatli! "${newlySavedSubject.name}" darsligi yuklandi.`);
    }
  };

  // --- RENDERING RESULTS ---
  if (state.showResults) {
    const totalQ = currentQuestions.length;
    const percentage = totalQ > 0 ? Math.round((state.score / totalQ) * 100) : 0;
    const currentSubjectObj = dynamicSubjects.find(s => s.id === state.selectedSubject);

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-10 text-center space-y-6">
          <div className="inline-block p-5 bg-amber-50 rounded-full border border-amber-100 shadow-inner">
            <Trophy className="w-12 h-12 text-amber-500 animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
              Imtihon Natijasi
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Test Yakunlandi!</h2>
            <p className="text-slate-500 text-xs font-medium">
              {currentSubjectObj?.name || 'Matematika'} — Variant {state.selectedVariant}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-3xl font-black text-primary">{state.score}/{totalQ}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">To'g'ri Javoblar</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className={`text-3xl font-black ${percentage >= 70 ? 'text-green-600' : percentage >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
                {percentage}%
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1">O'zlashtirish</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button 
              onClick={() => selectVariant(state.selectedSubject!, state.selectedVariant!)}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} /> Qayta Urinish
            </button>
            <button 
              onClick={(e) => copyShareLink(e, state.selectedSubject!, state.selectedVariant!)}
              className="w-full py-4 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <Share2 size={16} /> Natijani Ulashish
            </button>
            <button 
              onClick={resetToHome}
              className="w-full py-4 bg-transparent border border-slate-200 text-slate-500 hover:text-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} /> Bosh Sahifaga Qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING QUIZ ACTIVE SOLVING MODE ---
  if (state.isStarted && currentQuestion) {
    const labels = ['A', 'B', 'C', 'D'];

    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Navigation Bar */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-4 md:p-6 shadow-sm flex items-center justify-between">
          <button onClick={resetToHome} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-600 flex items-center gap-2 font-bold text-xs">
            <ArrowLeft size={18} /> Chiqish
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Variant {state.selectedVariant}</span>
            <h2 className="text-sm md:text-base font-black text-slate-900 tracking-tight">Savol {state.currentQuestionIndex + 1} / {currentQuestions.length}</h2>
          </div>
          <button 
            onClick={(e) => copyShareLink(e, state.selectedSubject!, state.selectedVariant!)}
            className="p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl transition-all"
            title="Ushbu variantni ulashish"
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-300 rounded-full"
            style={{ width: `${((state.currentQuestionIndex + 1) / currentQuestions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-6 md:p-10 shadow-sm space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center flex-shrink-0 mt-1">
              <MessageCircle size={20} />
            </div>
            <div className="flex-1 overflow-x-auto">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Savol Matni</span>
              <p className="text-lg md:text-xl font-mono font-medium text-slate-900 leading-relaxed whitespace-pre-wrap mt-1">
                {currentQuestion.text}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {shuffledIndices.map((originalIndex, displayIndex) => {
              const option = currentQuestion.options[originalIndex];
              if (!option) return null;

              const isSelected = selectedOption === originalIndex;
              const isCorrect = originalIndex === currentQuestion.correctAnswer;

              let btnStyle = "bg-white border-slate-200 text-slate-800 hover:border-primary hover:bg-primary/5";
              let icon = null;

              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = "bg-green-50 border-green-500 text-green-900 ring-2 ring-green-200";
                  icon = <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />;
                } else if (isSelected) {
                  btnStyle = "bg-red-50 border-red-500 text-red-900 ring-2 ring-red-200";
                  icon = <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />;
                }
              }

              return (
                <button
                  key={displayIndex}
                  disabled={isAnswered}
                  onClick={() => handleOptionSelect(displayIndex)}
                  className={`w-full p-4 md:p-5 rounded-2xl border transition-all flex items-center justify-between text-left group cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center gap-4 flex-1 pr-4">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black transition-colors flex-shrink-0 ${
                      isSelected ? 'bg-primary text-white' : 
                      isAnswered && isCorrect ? 'bg-green-600 text-white' : 
                      isAnswered && isSelected ? 'bg-red-600 text-white' : 
                      'bg-slate-100 text-slate-700 group-hover:bg-primary group-hover:text-white'
                    }`}>
                      {labels[displayIndex]}
                    </span>
                    <span className="font-mono text-sm md:text-base font-semibold leading-relaxed whitespace-pre-wrap">
                      {option}
                    </span>
                  </div>
                  {icon}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Score Counter */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
            <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-xs font-black text-slate-700">To'g'ri: {state.score}</span>
          </div>

          {isAnswered && (
            <button 
              onClick={handleNext}
              className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md"
            >
              Keyingisi <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  // --- RENDERING MAIN MATHEMATICS DASHBOARD ---
  return (
    <div className="space-y-10">
      {/* Hero Header */}
      <div className="bg-slate-950 rounded-[3rem] p-8 md:p-14 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
            <Calculator size={16} /> Standart Quiz Test Platformasi
          </div>
          <h1 className="text-3xl md:text-6xl font-black tracking-tight leading-tight">
            Standart Quiz Bilimlaringizni <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
              Sinang va Rivojlantiring
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed">
            Amaliy matematika, matematik fizika, formulalar va imtihon variantlarini bevosita ishlang, split-screen muharririda testlar tayyorlang yoki PDF darsliklardan avtomatik test to'plamlari yarating.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button 
              onClick={() => {
                const el = document.getElementById('chat-generator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Sparkles size={16} /> AI Bilan Test Yaratish
            </button>
            <button 
              onClick={() => setShowOnlyMine(!showOnlyMine)}
              className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border ${
                showOnlyMine 
                  ? 'bg-white text-slate-900 border-white' 
                  : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              {showOnlyMine ? '🌐 Barcha Fanlar' : '👤 Mening Darsliklarim'}
            </button>
          </div>
        </div>

        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/6 opacity-10 pointer-events-none">
          <Calculator size={480} className="text-primary rotate-12" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Fanlar bo'yicha qidirish..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-xs font-semibold outline-none focus:border-primary focus:bg-white transition-all text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button 
                onClick={() => fetchSubjects()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all"
              >
                Yangilash
              </button>
            </div>
          </div>

          {/* Subjects & Variant Cards */}
          {isLoadingSubjects ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Standart quiz baza yuklanmoqda...</p>
            </div>
          ) : subjectsList.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200/80">
              <HelpCircle size={48} className="mx-auto text-slate-300" />
              <h3 className="text-lg font-black text-slate-800">Test darsliklari topilmadi</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Hozircha matematika yoki boshqa fanlar bo'yicha testlar kiritilmagan. Quyidagi AI yordamchisidan foydalanib PDF yuklang yoki yangi test to'plami yarating.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {subjectsList.map((subject) => {
                const variantCount = totalVariantsForSubjectLocal(subject.id);
                if (variantCount === 0 && !subject.questions.length) return null;

                return (
                  <div key={subject.id} className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center flex-shrink-0 font-black">
                          <BookOpen size={24} />
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-slate-900 tracking-tight">
                            {subject.name}
                          </h2>
                          {subject.creator && (
                            <p className="text-[10px] font-mono font-bold text-slate-400">
                              Muallif: {subject.creator.includes('@') ? subject.creator.split('@')[0] : subject.creator}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span className="bg-primary/10 text-primary font-black px-3.5 py-1.5 rounded-full text-xs">
                          {subject.questions.length} ta savol
                        </span>
                        <button
                          onClick={() => setEditingSubject(subject)}
                          className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl transition-all font-bold text-xs flex items-center gap-1.5"
                          title="Split-Screen test tahrirlash"
                        >
                          <Edit3 size={14} /> Tahrirlash
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subject.id, subject.name)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          title="O'chirish"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Variant cards grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Array.from({ length: Math.max(variantCount, 1) }, (_, i) => i + 1).map(v => {
                        const questionCount = getQuestionsByVariantLocal(subject.id, v).length;
                        return (
                          <div
                            key={v}
                            onClick={() => selectVariant(subject.id, v)}
                            className="bg-slate-50 hover:bg-primary/5 p-5 rounded-2xl border border-slate-200/80 hover:border-primary transition-all text-left cursor-pointer group relative shadow-xs"
                          >
                            <button
                              onClick={(e) => copyShareLink(e, subject.id, v)}
                              className="absolute top-3 right-3 p-1.5 bg-white rounded-lg text-slate-400 hover:text-primary transition-colors border border-slate-100 shadow-xs"
                              title="Variant havolasini nusxalash"
                            >
                              <Share2 size={12} />
                            </button>
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-3 text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all border border-slate-100 shadow-xs">
                              <LayoutGrid size={18} />
                            </div>
                            <h3 className="font-black text-slate-900 text-sm">{v}-Variant</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{questionCount} ta savol</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Embedded AI Chat & PDF Question Generator */}
          <div id="chat-generator" className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-200/80 shadow-sm">
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1 rounded-full">
                AI Yordamchi & Generator
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-2">PDF va Matnlardan Test Generatori</h2>
              <p className="text-xs text-slate-400 font-medium">
                Imtihon savollarini AI yordamida avtomatik ajratib oling, PDF darslik yuklang yoki matematik masalalarni bosqichma-bosqich yeching.
              </p>
            </div>

            <Chat onQuestionsLoaded={handleQuestionsLoaded} userEmail={userEmail} />
          </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <CheckCircle2 size={18} className="text-green-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Split Screen Editor Modal */}
      {editingSubject && (
        <SplitScreenEditor
          subject={editingSubject}
          userEmail={userEmail}
          onClose={() => setEditingSubject(null)}
          onSaved={() => {
            setEditingSubject(null);
            showToast("Barcha o'zgarishlar saqlandi!");
            fetchSubjects();
          }}
        />
      )}

      {/* Pro Subscription & Promo Code Modal */}
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
          showToast("PRO tarif muvaffaqiyatli faollashtirildi!");
        }} 
      />
    </div>
  );
};
