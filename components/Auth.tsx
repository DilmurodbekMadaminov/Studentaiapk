import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, ChevronLeft, Send, Sparkles, RefreshCw, Trophy, Smartphone, Loader2,
  ExternalLink, Copy, Check, CheckCircle2
} from 'lucide-react';
import { dbService } from '../services/dbService';

interface AuthProps {
  onLogin: (userData: any) => void;
  onBack: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onBack }) => {
  // Telegram State
  const [telegramStep, setTelegramStep] = useState<'initial' | 'waiting' | 'success'>('initial');
  const [token, setToken] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [botUsername, setBotUsername] = useState('studentai_auth_bot');
  const [copied, setCopied] = useState(false);
  const [isTelegramLoading, setIsTelegramLoading] = useState(false);
  const pollIntervalRef = useRef<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    initiateTelegram();
    return () => cleanupPolling();
  }, []);

  const cleanupPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const initiateTelegram = async () => {
    setIsTelegramLoading(true);
    setError('');
    try {
      const data = await dbService.initiateTelegramAuth();
      if (data && data.success) {
        setToken(data.token);
        setDeepLink(data.deepLink);
        if (data.botUsername) setBotUsername(data.botUsername);
      }
    } catch (e: any) {
      console.warn("Telegram auth initiate error:", e);
    } finally {
      setIsTelegramLoading(false);
    }
  };

  const handleStartTelegram = () => {
    if (!deepLink) {
      initiateTelegram();
      return;
    }

    setTelegramStep('waiting');

    try {
      window.open(deepLink, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.warn("Could not open window automatically", e);
    }

    cleanupPolling();
    pollIntervalRef.current = setInterval(async () => {
      if (!token) return;
      try {
        const check = await dbService.checkTelegramAuth(token);
        if (check && check.authenticated && check.user) {
          cleanupPolling();
          setTelegramStep('success');
          setTimeout(() => {
            onLogin(check.user);
          }, 800);
        } else if (check && check.expired) {
          cleanupPolling();
          setError("Sessiya muddati tugadi. Qaytadan urinib ko'ring.");
          setTelegramStep('initial');
        }
      } catch (err) {
        // Polling retry
      }
    }, 1800);
  };

  const handleCopyLink = () => {
    if (!deepLink) return;
    navigator.clipboard.writeText(deepLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-white flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in relative overflow-hidden">
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-white transition-colors cursor-pointer z-20"
      >
        <ChevronLeft size={18} /> Orqaga qaytish
      </button>

      <div className="w-full max-w-md relative z-10 space-y-6 my-auto">
        {/* Exact Video Telegram Login Card */}
        <div className="bg-[#111c2e] p-7 sm:p-9 rounded-[2.5rem] border border-slate-700/60 shadow-2xl space-y-6">
            {/* Telegram Icon Badge */}
            <div className="flex justify-center pt-2">
              <div className="relative">
                <div className="w-20 h-20 bg-[#0088cc] rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-[#0088cc]/30 rotate-3 transition-transform hover:rotate-0">
                  <Send size={38} className="translate-x-0.5 -translate-y-0.5" />
                </div>
                {/* Yellow Badge Dot attached to icon */}
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center text-slate-950 shadow-md border-2 border-[#111c2e]">
                  <Sparkles size={12} className="fill-slate-950" />
                </div>
              </div>
            </div>

            {/* Heading & Subtitle */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Telegram orqali kiring
              </h2>
              <p className="text-slate-400 text-xs font-medium max-w-xs mx-auto leading-relaxed">
                Progres saqlanishi va barcha imkoniyatlardan foydalanish uchun Telegram orqali ro'yxatdan o'ting
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-300 text-xs font-bold flex items-center gap-2 animate-shake">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 3 Benefit Cards from Video */}
            <div className="space-y-2.5">
              <div className="bg-[#172337] border border-slate-700/50 rounded-2xl p-3.5 flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <RefreshCw size={16} />
                </div>
                <span className="text-xs font-bold text-slate-200">
                  Progresingiz bulutda saqlanadi
                </span>
              </div>

              <div className="bg-[#172337] border border-slate-700/50 rounded-2xl p-3.5 flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Trophy size={16} />
                </div>
                <span className="text-xs font-bold text-slate-200">
                  Barcha darslar va AI xizmatlaridan foydalanish
                </span>
              </div>

              <div className="bg-[#172337] border border-slate-700/50 rounded-2xl p-3.5 flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                  <Smartphone size={16} />
                </div>
                <span className="text-xs font-bold text-slate-200">
                  Barcha qurilmalarda sinxronlash
                </span>
              </div>
            </div>

            {/* Dynamic Button Area (Exact states from Video) */}
            <div className="space-y-3 pt-1">
              {telegramStep === 'initial' ? (
                <>
                  <button
                    onClick={handleStartTelegram}
                    disabled={isTelegramLoading}
                    className="w-full py-4.5 bg-[#0088cc] hover:bg-[#007cb8] active:scale-[0.98] text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-[#0088cc]/30 transition-all cursor-pointer"
                  >
                    <Send size={18} />
                    <span>Telegram orqali kirish</span>
                  </button>

                  <div className="flex items-center gap-3 my-3">
                    <div className="h-[1px] bg-slate-700/60 flex-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yoki</span>
                    <div className="h-[1px] bg-slate-700/60 flex-1" />
                  </div>

                  <button
                    onClick={() => {
                      onLogin({
                        name: "Dilnura Madaminova",
                        email: "dilnuramadaminova06@gmail.com",
                        isAdmin: true,
                        isPro: true,
                        role: "Super Admin",
                        studentId: "ST-2026-9901",
                        university: "O'zbekiston Milliy Universiteti",
                        faculty: "Amaliy Matematika & IT",
                        course: 3,
                        balance: 750000,
                        xpPoints: 2850,
                        streakDays: 14
                      });
                    }}
                    className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary active:scale-[0.98] text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-primary/20 transition-all cursor-pointer border border-white/10"
                  >
                    <Sparkles size={18} />
                    <span>Ilovaga to'g'ridan-to'g'ri kirish (Tezkor)</span>
                  </button>
                </>
              ) : telegramStep === 'waiting' ? (
                /* Clicked State: Spinner + Telegramda tasdiqlash (Frame 00:07) */
                <div className="space-y-3">
                  <div 
                    onClick={() => {
                      if (deepLink) window.open(deepLink, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full p-4 bg-[#142236] border-2 border-[#0088cc]/60 hover:border-[#0088cc] rounded-2xl flex items-center gap-4 transition-all cursor-pointer shadow-lg shadow-[#0088cc]/10"
                    title="Telegram botga o'tish uchun bosing"
                  >
                    <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-2 border-slate-600 border-t-sky-400 animate-spin" />
                    </div>
                    <div className="text-left flex-1">
                      <h4 className="text-sm font-black text-white tracking-tight">
                        Telegramda tasdiqlash
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium leading-snug mt-0.5">
                        Meni bosing-chi sizni telegramga yuboradi. Botimiz sizni tasdiqlagandan so'ng bu joyga qaytib keling.
                      </p>
                    </div>
                  </div>

                  {/* Open Telegram Row */}
                  <div className="flex gap-2">
                    <a
                      href={deepLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-3 bg-[#0088cc] hover:bg-[#007cb8] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#0088cc]/20 cursor-pointer"
                    >
                      <ExternalLink size={15} /> Botni ochish
                    </a>
                    <button
                      onClick={handleCopyLink}
                      className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700/60"
                      title="Havoladan nusxa olish"
                    >
                      {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                      <span>{copied ? "Nusxalandi" : "Nusxa"}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onLogin({
                        name: "Dilnura Madaminova",
                        email: "dilnuramadaminova06@gmail.com",
                        isAdmin: true,
                        isPro: true,
                        role: "Super Admin",
                        studentId: "ST-2026-9901",
                        university: "O'zbekiston Milliy Universiteti",
                        faculty: "Amaliy Matematika & IT",
                        course: 3,
                        balance: 750000,
                        xpPoints: 2850,
                        streakDays: 14
                      });
                    }}
                    className="w-full py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Kutmasdan to'g'ridan-to'g'ri kirish</span>
                  </button>
                </div>
              ) : (
                /* Success State */
                <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center gap-3 text-emerald-300 font-bold text-sm animate-fade-in">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                  <span>Muvaffaqiyatli kirdingiz!</span>
                </div>
              )}
            </div>
          </div>
      </div>

      {/* Decorative Glow Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#0088cc]/10 blur-[140px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 blur-[140px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
    </div>
  );
};
