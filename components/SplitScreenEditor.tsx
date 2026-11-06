import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  PlusCircle, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Undo
} from 'lucide-react';
import { Question, Subject } from '../types';
import { getAbsoluteApiUrl } from '../services/apiConfig';

interface SplitScreenEditorProps {
  subject: Subject;
  userEmail: string;
  onClose: () => void;
  onSaved: () => void;
}

export const SplitScreenEditor: React.FC<SplitScreenEditorProps> = ({
  subject,
  userEmail,
  onClose,
  onSaved
}) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjectName, setSubjectName] = useState('');
  const [variantSize, setVariantSize] = useState(30);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successStatus, setSuccessStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'edit'>('list');

  // Initialize
  useEffect(() => {
    if (subject) {
      setQuestions(JSON.parse(JSON.stringify(subject.questions || [])));
      setSubjectName(subject.name || '');
      setVariantSize(subject.variantSize || 30);
      setSelectedIndex(0);
    }
  }, [subject]);

  // Validation logic
  const isQuestionValid = (q: Question) => {
    if (!q) return false;
    if (!q.text || q.text.trim().length < 5) return false;
    if (!q.options || q.options.length !== 4) return false;
    if (q.options.some(o => !o || o.trim().length === 0)) return false;
    if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) return false;
    return true;
  };

  const getInvalidQuestionsCount = () => {
    return questions.filter(q => !isQuestionValid(q)).length;
  };

  const handleUpdateQuestionText = (val: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      if (updated[selectedIndex]) {
        updated[selectedIndex] = {
          ...updated[selectedIndex],
          text: val
        };
      }
      return updated;
    });
  };

  const handleUpdateOptionText = (optIdx: number, val: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      if (updated[selectedIndex]) {
        const opts = [...updated[selectedIndex].options];
        opts[optIdx] = val;
        updated[selectedIndex] = {
          ...updated[selectedIndex],
          options: opts
        };
      }
      return updated;
    });
  };

  const handleUpdateCorrectAnswer = (optIdx: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      if (updated[selectedIndex]) {
        updated[selectedIndex] = {
          ...updated[selectedIndex],
          correctAnswer: optIdx
        };
      }
      return updated;
    });
  };

  const handleAddNewQuestion = () => {
    const newQ: Question = {
      id: questions.length > 0 ? Math.max(...questions.map(q => q.id)) + 1 : 1,
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    };
    setQuestions(prev => [...prev, newQ]);
    setSelectedIndex(questions.length); // Select the newly created question
    setActiveTab('edit'); // Switch to the editor on mobile
  };

  const handleDeleteQuestion = () => {
    if (questions.length === 0) return;
    if (window.confirm("Haqiqatan ham ushbu savolni o'chirmoqchisiz?")) {
      const updated = questions.filter((_, idx) => idx !== selectedIndex);
      setQuestions(updated);
      const nextIdx = Math.max(0, Math.min(selectedIndex, updated.length - 1));
      setSelectedIndex(nextIdx);
      if (updated.length === 0) {
        setActiveTab('list');
      }
    }
  };

  const handleSaveToDatabase = async () => {
    if (!subjectName.trim()) {
      setErrorStatus("Iltimos, fan nomini kiriting.");
      return;
    }
    if (questions.length === 0) {
      setErrorStatus("To'plamda kamida bitta savol bo'lishi shart.");
      return;
    }

    setIsSaving(true);
    setErrorStatus(null);
    setSuccessStatus(null);

    // Re-index IDs sequentially
    const sequentialQuestions = questions.map((q, idx) => ({
      ...q,
      id: idx + 1
    }));

    try {
      const response = await fetch(getAbsoluteApiUrl('/api/update-subject'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-email': userEmail 
        },
        body: JSON.stringify({
          subjectId: subject.id,
          name: subjectName,
          variantSize,
          questions: sequentialQuestions,
          creator: subject.creator || userEmail
        })
      });

      if (!response.ok) {
        throw new Error("Ma'lumotlarni saqlashda xatolik yuz berdi");
      }

      setSuccessStatus("Barcha o'zgarishlar muvaffaqiyatli yangilandi!");
      setTimeout(() => {
        onSaved();
      }, 1500);
    } catch (err: any) {
      setErrorStatus(err.message || "Ulanish xatosi");
    } finally {
      setIsSaving(false);
    }
  };

  const currentQ = questions[selectedIndex];

  return (
    <div id="split-screen-editor" className="fixed inset-0 bg-slate-900/65 backdrop-blur-md z-50 flex items-center justify-center p-0 md:p-4">
      <div className="w-full h-full md:max-w-7xl md:h-[90vh] bg-slate-50 md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Bar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-100 rounded-xl text-blue-600 font-bold text-lg hidden sm:inline-block">✏️</span>
            <div className="flex-1 min-w-0">
              <input 
                type="text" 
                value={subjectName} 
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Fan nomi"
                className="font-black text-lg md:text-xl text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1 w-full max-w-full text-ellipsis"
              />
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {questions.length} ta savol • Variant hajmi: 
                <input 
                  type="number" 
                  value={variantSize} 
                  onChange={(e) => setVariantSize(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-10 text-center font-bold bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none ml-1 text-slate-600 font-mono"
                /> ta savoldan
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto border-t md:border-t-0 pt-2.5 md:pt-0">
            <button
              onClick={handleSaveToDatabase}
              disabled={isSaving}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white font-bold px-4 py-2 md:px-5 md:py-2.5 rounded-2xl shadow-lg shadow-green-100 transition-all text-sm shrink-0"
            >
              <Save size={16} /> {isSaving ? "Yangilanmoqda..." : "Bazani yangilash"}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors shrink-0 border border-slate-200 md:border-0"
              title="Yopish"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Info alerts */}
        {errorStatus && (
          <div className="bg-rose-50 border-y border-rose-200 px-6 py-3 text-rose-700 text-sm font-semibold flex items-center gap-2 shrink-0">
            <AlertCircle size={16} /> {errorStatus}
          </div>
        )}
        {successStatus && (
          <div className="bg-emerald-50 border-y border-emerald-200 px-6 py-3 text-emerald-800 text-sm font-semibold flex items-center gap-2 shrink-0">
            <CheckCircle size={16} className="text-emerald-600" /> {successStatus}
          </div>
        )}

        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden bg-white border-b border-slate-200 p-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all ${
              activeTab === 'list'
                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            📋 Savollar ro'yxati ({questions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition-all ${
              activeTab === 'edit'
                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            ✏️ Tahrirlash {currentQ ? `#${selectedIndex + 1}` : ''}
          </button>
        </div>

        {/* Main Split Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* LEFT SIDE: Question circle grid navigator (35% width, responsive toggle) */}
          <div className={`${activeTab === 'list' ? 'flex flex-1' : 'hidden md:flex'} w-full md:w-[35%] bg-white border-r border-slate-200 flex flex-col overflow-hidden shrink-0`}>
            <div className="p-3 md:p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">Savollar tartib raqami</span>
              <span className="text-[9px] md:text-xs font-semibold bg-rose-100 text-rose-700 px-2 md:px-2.5 py-0.5 md:py-1 rounded-full">
                Xatolik: {getInvalidQuestionsCount()} ta
              </span>
            </div>

            {/* Scrollable Questions circles map */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {questions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  Savollar mavjud emas. Yangi savol qo'shing.
                </div>
              ) : (
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                  {questions.map((q, idx) => {
                    const isValid = isQuestionValid(q);
                    const isSelected = selectedIndex === idx;

                    return (
                      <button
                        key={idx}
                        id={`q-btn-${idx}`}
                        onClick={() => {
                          setSelectedIndex(idx);
                          setActiveTab('edit'); // switch to editor view on mobile instantly
                        }}
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2 relative select-none ${
                          isSelected 
                            ? "bg-blue-600 text-white border-blue-600 scale-105 shadow-md shadow-blue-200" 
                            : isValid 
                            ? "bg-white text-emerald-800 border-emerald-500 hover:bg-emerald-50" 
                            : "bg-rose-50 text-rose-800 border-rose-500 hover:bg-rose-100"
                        }`}
                      >
                        {idx + 1}
                        {!isValid && !isSelected && (
                          <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-600 rounded-full border border-white"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick adding and deleting actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3 shrink-0">
              <button
                onClick={handleAddNewQuestion}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 font-bold py-3 px-4 rounded-xl transition-all text-sm"
              >
                <PlusCircle size={16} /> Savol qo'shish
              </button>
              <button
                onClick={handleDeleteQuestion}
                className="flex-1 flex items-center justify-center gap-2 bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 font-bold py-3 px-4 rounded-xl transition-all text-sm"
              >
                <Trash2 size={16} /> O'chirish
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: Action panel for selected question (responsive toggle) */}
          <div className={`${activeTab === 'edit' ? 'flex' : 'hidden md:flex'} flex-1 bg-slate-50 p-4 md:p-6 overflow-y-auto flex flex-col justify-between`}>
            {currentQ ? (
              <div className="space-y-6">
                
                {/* Header status bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('list')}
                      className="md:hidden p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg flex items-center justify-center text-xs font-bold gap-1 transition-all"
                      title="Savollar ro'yxatiga qaytish"
                    >
                      <Undo size={14} /> Ortga
                    </button>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base">
                      Savol #{selectedIndex + 1} ni tahrirlash
                    </h3>
                  </div>
                  {isQuestionValid(currentQ) ? (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-center">
                      <CheckCircle size={14} /> Darslik talabiga mos
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-rose-600 font-bold bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200 self-start sm:self-center">
                      <AlertCircle size={14} /> Xatolik aniqlandi
                    </span>
                  )}
                </div>

                {/* Free description edit input */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Savol matni/Sarlavhasi
                  </label>
                  <textarea
                    rows={4}
                    value={currentQ.text}
                    onChange={(e) => handleUpdateQuestionText(e.target.value)}
                    placeholder="Masalan: To'g'ri to'rtburchakning yuzini toping..."
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl p-4 text-slate-800 outline-none transition-all font-mono whitespace-pre-wrap text-base md:text-[15px]"
                  />
                  {(!currentQ.text || currentQ.text.trim().length < 5) && (
                    <p className="text-xs text-rose-600 font-medium">Savol matni juda qisqa (kamida 5 ta belgi bo'lishi shart)</p>
                  )}
                </div>

                {/* Options edit panel */}
                <div className="space-y-3">
                  <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    Variantlar va to'g'ri kalit
                  </label>

                  {['A', 'B', 'C', 'D'].map((lbl, idx) => {
                    const isCorrect = currentQ.correctAnswer === idx;
                    const optVal = currentQ.options[idx] || '';

                    return (
                      <div 
                        key={idx}
                        className={`flex items-center gap-3 bg-white border rounded-2xl px-4 py-3 transition-all ${
                          isCorrect 
                            ? 'border-emerald-500 ring-2 ring-emerald-50 bg-emerald-50/20' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {/* Custom Round radio choice button */}
                        <button
                          type="button"
                          onClick={() => handleUpdateCorrectAnswer(idx)}
                          className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                            isCorrect 
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' 
                              : 'bg-white border-slate-300 hover:border-emerald-500'
                          }`}
                        >
                          {isCorrect && (
                            <span className="w-2.5 h-2.5 bg-white rounded-full"></span>
                          )}
                        </button>

                        <span className="font-bold text-slate-500 font-mono text-sm mr-1">
                          {lbl}:
                        </span>

                        <input
                          type="text"
                          value={optVal}
                          onChange={(e) => handleUpdateOptionText(idx, e.target.value)}
                          placeholder={`${lbl} varianti javobi...`}
                          className="flex-1 bg-transparent border-0 outline-none text-slate-800 text-base md:text-sm p-1 font-semibold focus:ring-0 placeholder:text-slate-400"
                        />
                      </div>
                    );
                  })}
                  
                  {currentQ.options && currentQ.options.some(opt => !opt || opt.trim().length === 0) && (
                    <p className="text-xs text-rose-600 font-medium">Barcha 4ta variant javoblarini to'ldirish shart</p>
                  )}
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12">
                <HelpCircle size={44} className="mb-2 text-slate-300" />
                <p className="font-medium text-sm">Savol tanlanmagan</p>
              </div>
            )}
            
            <div className="mt-8 border-t border-slate-200/60 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span className="text-[11px] text-slate-400 font-medium italic">
                Kerakli o'zgarishlarni kiritib bo'lgach, "Bazani yangilash" tugmasini bosing.
              </span>
              {activeTab === 'edit' && (
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="md:hidden w-full sm:w-auto px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-xl text-xs transition-colors"
                >
                  Savollar ro'yxatiga o'tish
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
