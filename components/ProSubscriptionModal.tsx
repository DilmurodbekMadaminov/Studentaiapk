import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Crown, CheckCircle2, Sparkles, X, Loader2, Check, UserCheck, 
  Hash, AlertCircle, Gift, KeyRound, Send, ShieldCheck, Lock
} from 'lucide-react';
import { getAbsoluteApiUrl } from '../services/apiConfig';
import { User as UserType } from '../types';
import { dbService } from '../services/dbService';

interface ProSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onSuccess?: (updatedUser?: UserType) => void;
}

export const ProSubscriptionModal: React.FC<ProSubscriptionModalProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess
}) => {
  const [promoInput, setPromoInput] = useState<string>('');
  const [promoLoading, setPromoLoading] = useState<boolean>(false);
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);

  // Target User ID state
  const [payForSelf, setPayForSelf] = useState<boolean>(true);
  const [targetUserIdInput, setTargetUserIdInput] = useState<string>('');
  const [targetUserInfo, setTargetUserInfo] = useState<{ id: number; name: string; email: string; isPro: boolean } | null>(null);
  const [lookupLoading, setLookupLoading] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string>('');

  useEffect(() => {
    if (!payForSelf && targetUserIdInput.trim()) {
      const timer = setTimeout(() => {
        lookupTargetUser(targetUserIdInput.trim());
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setTargetUserInfo(null);
      setLookupError('');
    }
  }, [payForSelf, targetUserIdInput]);

  const lookupTargetUser = async (idStr: string) => {
    const idNum = parseInt(idStr, 10);
    if (isNaN(idNum) || idNum <= 0) {
      setLookupError("Tog'ri ID raqam kiriting");
      setTargetUserInfo(null);
      return;
    }

    setLookupLoading(true);
    setLookupError('');
    try {
      const res = await fetch(getAbsoluteApiUrl(`/api/users/lookup?id=${idNum}`));
      if (res.ok) {
        const data = await res.json();
        setTargetUserInfo(data);
      } else {
        setTargetUserInfo(null);
        setLookupError(`ID #${idNum} raqamli foydalanuvchi topilmadi!`);
      }
    } catch (e) {
      setLookupError("Foydalanuvchini tekshirishda xatolik");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleRedeemPromo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!user?.email && !user?.id && !user?.telegramId) {
      setError("Promo-kodni qo'llash uchun tizimga kirishingiz shart!");
      return;
    }

    if (!promoInput.trim()) {
      setError("Iltimos, promo-kodni kiriting!");
      return;
    }

    if (!payForSelf && (!targetUserIdInput.trim() || !targetUserInfo)) {
      setError("Iltimos, mavjud bo'lgan to'g'ri foydalanuvchi ID raqamini kiriting.");
      return;
    }

    setPromoLoading(true);
    setError('');
    setPromoSuccessMsg('');

    const targetEmail = !payForSelf && targetUserInfo ? targetUserInfo.email : (user?.email || '');
    const targetId = !payForSelf && targetUserInfo ? targetUserInfo.id : user?.id;
    const targetTelegramId = !payForSelf ? '' : (user?.telegramId || '');

    try {
      const res = await fetch(getAbsoluteApiUrl('/api/promocodes/redeem'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': targetEmail
        },
        body: JSON.stringify({
          code: promoInput.trim(),
          email: targetEmail,
          userId: targetId,
          telegramId: targetTelegramId
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPromoSuccessMsg(data.message);
        setSuccess(true);
        setPromoInput('');

        // If it was for the current logged-in user, update session immediately
        const isCurrentTarget = payForSelf || !targetUserInfo || (user && targetUserInfo.id === user.id);
        if (isCurrentTarget && user) {
          const updatedUser: UserType = data.user 
            ? { ...user, ...data.user, isPro: true } 
            : { ...user, isPro: true, proExpiresAt: data.proExpiresAt };
          
          dbService.setSession(updatedUser);
          window.dispatchEvent(new CustomEvent('user_session_updated', { detail: updatedUser }));
          if (onSuccess) onSuccess(updatedUser);
        } else {
          if (onSuccess) onSuccess();
        }
      } else {
        setError(data.error || "Promo-kod xato, eskirgan yoki limitiga etilgan!");
      }
    } catch (e: any) {
      setError("Xatolik yuz berdi: " + e.message);
    } finally {
      setPromoLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl max-w-2xl w-full overflow-hidden relative my-8"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition-all z-20 cursor-pointer"
          >
            <X size={20} />
          </button>

          {success ? (
            <div className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-bounce">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-2">
                <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-black uppercase tracking-widest">
                  PRO A'ZO FAOLLASHTIRILDI
                </span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Muvaffaqiyatli Qo'llanildi!</h3>
                <p className="text-slate-600 font-medium text-sm max-w-md mx-auto">
                  {promoSuccessMsg || "Promo-kod muvaffaqiyatli faollashtirildi va PRO tarif imkoniyatlari taqdim etildi."}
                </p>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left space-y-2 max-w-md mx-auto text-xs">
                <div className="flex justify-between font-bold text-slate-600">
                  <span>Biriktirilgan Akkaunt:</span>
                  <span className="text-slate-900 font-black">
                    {!payForSelf && targetUserInfo ? targetUserInfo.name : (user?.name || user?.email)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-600">
                  <span>Faollashtirish Usuli:</span>
                  <span className="text-emerald-600 font-black uppercase">Promo-Kod (Bepul)</span>
                </div>
                <div className="flex justify-between font-bold text-slate-600">
                  <span>Status:</span>
                  <span className="text-amber-500 font-black">👑 PRO Aktiv</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSuccess(false);
                  onClose();
                  window.location.reload();
                }}
                className="w-full max-w-md py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl cursor-pointer"
              >
                Imkoniyatlardan Foydalanish
              </button>
            </div>
          ) : (
            <div>
              {/* Hero Banner */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/20 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-400/20 text-amber-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-400/30">
                      <Crown size={14} className="fill-amber-300" /> PROMO-KOD TIZIMI
                    </div>
                    {user?.id && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white rounded-full text-[11px] font-black border border-white/20 backdrop-blur-md">
                        <Hash size={13} className="text-blue-400" />
                        <span>Mening ID: #{user.id}</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                    PRO Obunani Promokod Orqali Faollashtiring
                  </h2>
                  <p className="text-slate-300 text-xs font-medium max-w-lg leading-relaxed">
                    Platformamizda to'lov tizimlari olib tashlangan. PRO xizmatlari va imkoniyatlar faqat bepul promo-kodlar orqali taqdim etiladi.
                  </p>
                </div>
              </div>

              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Features list */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FeatureItem title="Cheksiz AI Chat & Murabbiy" desc="GPT-4o va Gemini Pro modellari" />
                  <FeatureItem title="Cheksiz PDF Test Generatsiyasi" desc="Kitoblardan 30 talik variantlar" />
                  <FeatureItem title="Matematika & DTM imtihonlari" desc="Echimlari bilan to'liq tahlil" />
                  <FeatureItem title="24/7 VIP AI Live Tutor" desc="Ovozli va tezkor repetitor" />
                </div>

                {/* Locked Payment Methods Banner */}
                <div className="bg-slate-100/80 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase text-slate-500 tracking-wider">
                    <span className="flex items-center gap-1.5 text-slate-700">
                      <Lock size={13} className="text-amber-600" /> To'lov Tizimlari Holati:
                    </span>
                    <span className="text-rose-600 font-extrabold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Vaqtinchalik Qulflangan
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-center opacity-60">
                      <p className="text-[10px] font-black text-slate-800">CLICK</p>
                      <span className="text-[9px] font-bold text-rose-500 flex items-center justify-center gap-0.5 mt-0.5">
                        <Lock size={10} /> Qulflangan
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-center opacity-60">
                      <p className="text-[10px] font-black text-slate-800">PAYME</p>
                      <span className="text-[9px] font-bold text-rose-500 flex items-center justify-center gap-0.5 mt-0.5">
                        <Lock size={10} /> Qulflangan
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-center opacity-60">
                      <p className="text-[10px] font-black text-slate-800">UZCARD / HUMO</p>
                      <span className="text-[9px] font-bold text-rose-500 flex items-center justify-center gap-0.5 mt-0.5">
                        <Lock size={10} /> Qulflangan
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-slate-200 text-center opacity-60">
                      <p className="text-[10px] font-black text-slate-800">HAMYON</p>
                      <span className="text-[9px] font-bold text-rose-500 flex items-center justify-center gap-0.5 mt-0.5">
                        <Lock size={10} /> Qulflangan
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target User ID Option */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                    <Hash size={16} className="text-blue-600" /> Promokod Kim Uchun Qo'llaniladi?
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPayForSelf(true);
                        setTargetUserIdInput('');
                      }}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                        payForSelf 
                          ? 'border-blue-600 bg-blue-50/50 text-slate-900 font-bold' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-900">O'zimning akkauntim uchun</p>
                        <p className="text-[11px] text-slate-500 font-mono">ID #{user?.id || 1} • {user?.name || user?.email}</p>
                      </div>
                      {payForSelf && <CheckCircle2 size={18} className="text-blue-600 flex-shrink-0" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setPayForSelf(false)}
                      className={`p-3.5 rounded-xl border-2 text-left transition-all flex items-center justify-between cursor-pointer ${
                        !payForSelf 
                          ? 'border-blue-600 bg-blue-50/50 text-slate-900 font-bold' 
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-900">Boshqa foydalanuvchi uchun</p>
                        <p className="text-[11px] text-slate-500">Do'stingizga PRO sovg'a qilish</p>
                      </div>
                      {!payForSelf && <CheckCircle2 size={18} className="text-blue-600 flex-shrink-0" />}
                    </button>
                  </div>

                  {!payForSelf && (
                    <div className="space-y-2 pt-2 border-t border-slate-200/80 animate-fade-in">
                      <label className="text-xs font-bold text-slate-700 block">
                        Do'stingizning ID Raqamini Kiriting:
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min={1}
                          placeholder="Masalan: 1, 2, 3..."
                          value={targetUserIdInput}
                          onChange={(e) => setTargetUserIdInput(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm font-black text-slate-900 outline-none focus:ring-2 focus:ring-blue-600 pl-10"
                        />
                        <Hash size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        {lookupLoading && (
                          <Loader2 size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-600 animate-spin" />
                        )}
                      </div>

                      {targetUserInfo && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <UserCheck size={16} className="text-emerald-600 flex-shrink-0" />
                            <div>
                              <p className="font-black">ID #{targetUserInfo.id}: {targetUserInfo.name}</p>
                              <p className="text-[10px] text-emerald-700 font-mono">{targetUserInfo.email}</p>
                            </div>
                          </div>
                          {targetUserInfo.isPro ? (
                            <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md text-[9px] font-black uppercase">AllaQachon PRO</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-md text-[9px] font-black uppercase">FREE Tarif</span>
                          )}
                        </div>
                      )}

                      {lookupError && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs flex items-center gap-2 font-bold">
                          <AlertCircle size={16} className="flex-shrink-0" />
                          <span>{lookupError}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Main Promocode Entry Form */}
                <form onSubmit={handleRedeemPromo} className="bg-amber-50/70 p-6 rounded-2xl border border-amber-300/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-amber-950 uppercase tracking-widest flex items-center gap-2">
                      <KeyRound size={16} className="text-amber-600" /> Promokodni Kiriting
                    </label>
                    <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-200/60 px-2 py-0.5 rounded-md">
                      Promokod Orqali
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Masalan: STUDENT2026 yoki PROFREE"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      className="w-full bg-white border border-amber-300 rounded-2xl pl-4 pr-12 py-4 text-base font-black font-mono text-slate-900 uppercase tracking-wider outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
                    />
                    <Sparkles size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-500" />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={promoLoading || !promoInput.trim()}
                    className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 disabled:opacity-50 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {promoLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <Gift size={18} />
                        <span>Promokodni Faollashtirish</span>
                      </>
                    )}
                  </button>
                </form>

                {/* How to get promocode */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                      <Sparkles size={14} className="text-blue-600" /> Promokod Qanday Olinadi?
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Administratordan bepul promo-kod so'rang yoki Telegram kanalimiz orqali oling.
                    </p>
                  </div>
                  <a
                    href="https://t.me/studentai_support"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 bg-[#229ED9] hover:bg-[#1c87bb] text-white font-black text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Send size={14} /> Telegram Admin
                  </a>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const FeatureItem: React.FC<{ title: string; desc: string }> = ({ title, desc }) => (
  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
    <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
      <Check size={14} />
    </div>
    <div>
      <p className="text-xs font-black text-slate-900">{title}</p>
      <p className="text-[10px] font-medium text-slate-400">{desc}</p>
    </div>
  </div>
);
