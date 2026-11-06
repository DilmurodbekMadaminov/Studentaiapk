
import React, { useState, useEffect, useRef } from 'react';
import { User, CreditCard, Settings, Shield, HelpCircle, LogOut, Star, Package, ChevronRight, Zap, Target, BookOpen, Clock, Activity, Bell, Lock, Plus, Trash2, CheckCircle2, ShieldCheck, Loader2, Crown, Camera, Upload, Image as ImageIcon, Hash, Sparkles, Send, Gift, Tag, RefreshCw, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ProSubscriptionModal } from './ProSubscriptionModal';
import { getAbsoluteApiUrl } from '../services/apiConfig';
import { dbService } from '../services/dbService';
import { User as UserType } from '../types';

interface ProfileProps {
  onLogout: () => void;
  user: UserType | null;
  defaultTab?: 'overview' | 'settings';
}

const formatActivityDate = (isoStr: string) => {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Hozirgina';
    if (diffMins < 60) return `${diffMins} daqiqa oldin`;
    const isToday = d.toDateString() === now.toDateString();
    const timeStr = d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `Bugun, ${timeStr}`;
    return `${d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}, ${timeStr}`;
  } catch (e) {
    return isoStr;
  }
};

export const Profile: React.FC<ProfileProps> = ({ onLogout, user, defaultTab = 'overview' }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings'>(defaultTab);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [subStatus, setSubStatus] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined>(user?.avatar || user?.photoURL);
  const [avatarMsg, setAvatarMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Profile fields state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileTelegram, setProfileTelegram] = useState(user?.telegramUsername || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // User activities and promo state
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState<boolean>(true);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [isRedeemingPromo, setIsRedeemingPromo] = useState<boolean>(false);
  const [promoMsg, setPromoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUserActivities = async () => {
    if (!user) return;
    setLoadingActivities(true);
    try {
      const list = await dbService.getUserActivities(user.email, user.id, user.telegramId);
      setActivities(Array.isArray(list) ? list : []);
    } catch (e) {
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  useEffect(() => {
    loadUserActivities();
  }, [user?.email, user?.id, user?.telegramId]);

  const handleRedeemPromoInsideProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!promoCodeInput.trim()) {
      setPromoMsg({ type: 'error', text: "Promo-kodni kiriting!" });
      return;
    }
    setIsRedeemingPromo(true);
    setPromoMsg(null);
    try {
      const res = await dbService.redeemPromoCode(promoCodeInput.trim(), user);
      if (res && res.success) {
        setPromoMsg({ type: 'success', text: res.message || "Promo-kod muvaffaqiyatli faollashtirildi!" });
        setPromoCodeInput('');
        if (res.user) {
          dbService.setSession(res.user);
          window.dispatchEvent(new CustomEvent('user_session_updated', { detail: res.user }));
        }
        await loadUserActivities();
      } else {
        setPromoMsg({ type: 'error', text: res?.error || "Promo-kod xato yoki eskirgan" });
      }
    } catch (err: any) {
      setPromoMsg({ type: 'error', text: err.message || "Xatolik yuz berdi" });
    } finally {
      setIsRedeemingPromo(false);
    }
  };

  const formatPhoneInput = (val: string) => {
    if (!val) return '';
    const digits = val.replace(/\D/g, '');
    if (!digits) return '';
    let d = digits;
    if (d.startsWith('998')) {
      d = d.slice(3);
    }
    d = d.slice(0, 9);
    let res = '+998';
    if (d.length > 0) res += ' ' + d.slice(0, 2);
    if (d.length > 2) res += ' ' + d.slice(2, 5);
    if (d.length > 5) res += ' ' + d.slice(5, 7);
    if (d.length > 7) res += ' ' + d.slice(7, 9);
    return res;
  };

  useEffect(() => {
    if (user?.avatar || user?.photoURL) {
      setCurrentAvatar(user.avatar || user.photoURL);
    }
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileTelegram(user.telegramUsername || '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user?.email) return;
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      const res = await dbService.updateUserProfile(user.email, {
        name: profileName,
        phone: profilePhone,
        telegramUsername: profileTelegram
      });
      if (res && res.success && res.user) {
        dbService.setSession(res.user);
        window.dispatchEvent(new Event('user_session_updated'));
        setProfileMsg({ type: 'success', text: "Profil ma'lumotlari muvaffaqiyatli saqlandi!" });
      } else {
        setProfileMsg({ type: 'error', text: res?.error || "Saqlashda xatolik yuz berdi" });
      }
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || "Xatolik yuz berdi" });
    } finally {
      setIsSavingProfile(false);
    }
  };

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.email) return;

    if (file.size > 8 * 1024 * 1024) {
      setAvatarMsg({ type: 'error', text: "Rasm hajmi 8MB dan oshmasligi kerak!" });
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarMsg(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        if (!dataUrl) return;

        const img = new Image();
        img.src = dataUrl;
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 320;
          const MAX_HEIGHT = 320;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

          setCurrentAvatar(compressedDataUrl);

          const res = await dbService.updateUserAvatar(user.email, compressedDataUrl);
          if (res && res.user) {
            dbService.setSession(res.user);
            window.dispatchEvent(new Event('user_session_updated'));
            setAvatarMsg({ type: 'success', text: "Profil rasmi muvaffaqiyatli yangilandi!" });
          } else {
            setAvatarMsg({ type: 'error', text: "Rasm saqlashda xatolik yuz berdi" });
          }
          setIsUploadingAvatar(false);
        };
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      setAvatarMsg({ type: 'error', text: err.message || "Xatolik yuz berdi" });
      setIsUploadingAvatar(false);
    }
  };

  useEffect(() => {
    if (user?.email || user?.id || user?.telegramId) {
      loadSubscriptionStatus();
    }
  }, [user?.email, user?.id, user?.telegramId, user?.isPro]);

  const loadSubscriptionStatus = async () => {
    const email = user?.email || '';
    const userId = user?.id ? String(user.id) : '';
    const telegramId = user?.telegramId ? String(user.telegramId) : '';
    if (!email && !userId && !telegramId) return;

    try {
      const res = await fetch(getAbsoluteApiUrl(`/api/subscription/status?email=${encodeURIComponent(email)}&userId=${encodeURIComponent(userId)}&telegramId=${encodeURIComponent(telegramId)}`));
      if (res.ok) {
        const data = await res.json();
        setSubStatus(data);
        if (data.isPro && user && !user.isPro) {
          const updatedUser = { ...user, isPro: true, proExpiresAt: data.expiresAt };
          dbService.setSession(updatedUser);
          window.dispatchEvent(new CustomEvent('user_session_updated', { detail: updatedUser }));
        }
      }
    } catch (e) {
      console.error("Subscription status fetch error:", e);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-8 pb-20 animate-fade-in max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="bg-surface rounded-[2rem] p-8 border border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <div className="relative group">
            <div 
              onClick={handleAvatarClick}
              className="w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl shadow-primary/20 font-black text-4xl rotate-3 overflow-hidden border-4 border-white cursor-pointer hover:rotate-0 transition-all hover:scale-105"
              title="Profil rasmini o'zgartirish uchun bosing"
            >
              {currentAvatar ? (
                <img src={currentAvatar} alt={user?.name || 'Talaba'} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name ? getInitials(user.name) : 'ST'}</span>
              )}

              {/* Upload Hover Overlay */}
              <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 backdrop-blur-xs">
                {isUploadingAvatar ? (
                  <Loader2 size={24} className="animate-spin text-white" />
                ) : (
                  <>
                    <Camera size={22} className="text-white drop-shadow-md" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-white">O'zgartirish</span>
                  </>
                )}
              </div>
            </div>

            {/* Camera badge button */}
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary hover:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform hover:scale-110 cursor-pointer"
              title="Rasm yuklash"
            >
              {isUploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            </button>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            className="hidden" 
          />

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-3xl font-black text-text-primary tracking-tight">{user?.name || 'Talaba'}</h1>
            </div>
            <p className="text-text-secondary font-medium mb-3">{user?.email}</p>

            {avatarMsg && (
              <div className={`mb-3 inline-block px-3 py-1.5 rounded-xl text-xs font-bold ${avatarMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {avatarMsg.text}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">
                <Hash size={13} className="text-blue-400" /> ID: #{user?.id || 1}
              </span>
              {subStatus?.isPro ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-100 shadow-sm">
                  <Crown size={14} className="fill-amber-500" /> PRO Tarif (Faol)
                </span>
              ) : (
                <button
                  onClick={() => setIsProModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-400 shadow-md hover:scale-105 transition-all cursor-pointer"
                >
                  <Crown size={14} className="fill-white" /> PRO-ga O'tish (33 000 so'm)
                </button>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                <Target size={14} /> Lvl 12
              </span>
              {user?.isAdmin && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-purple-100">
                  <Shield size={14} /> Admin
                </span>
              )}
              {(user as any)?.telegramUsername && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-sky-100">
                  <Send size={12} /> @{(user as any).telegramUsername}
                </span>
              )}
              {(user as any)?.phone && !(user as any).phone.includes('*') ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                  📱 {(user as any).phone}
                </span>
              ) : (
                <button
                  onClick={() => setActiveTab('settings')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-200 transition-colors cursor-pointer"
                  title="Telefon raqamni biriktirish"
                >
                  📱 + Telefon raqam kiritish
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => setActiveTab('overview')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Profil & Statistika</button>
             <button onClick={() => setActiveTab('settings')} className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Sozlamalar & Xavfsizlik</button>
          </div>
        </div>
      </div>

      {/* Pro Banner if not pro */}
      {!subStatus?.isPro && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="space-y-2 relative z-10 text-center md:text-left">
            <span className="inline-block px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-400/30">
              Cheksiz AI Imkoniyatlar
            </span>
            <h3 className="text-xl md:text-2xl font-black tracking-tight">Student AI PRO — Maxsus Imkoniyatlar</h3>
            <p className="text-slate-300 text-xs font-medium max-w-xl">
              Cheksiz AI testlar, konspektlar, audio tutor va matematika imtihon yechimlari. Oyiga bor yog'i 33 000 so'm.
            </p>
          </div>
          <button
            onClick={() => setIsProModalOpen(true)}
            className="px-6 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer"
          >
            <Crown size={16} className="fill-slate-950" /> PRO Tarifga O'tish
          </button>
        </div>
      )}

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4">
               <StatCard icon={<Zap className="text-amber-500" />} label="AI Tokens" value="1.2M" sub="This month" trend="+15%" />
               <StatCard icon={<BookOpen className="text-blue-500" />} label="Study Hours" value="124h" sub="Total time" trend="+2h" />
               <StatCard icon={<Activity className="text-green-500" />} label="Projects" value="18" sub="Completed" trend="+3" />
               <StatCard icon={<Clock className="text-purple-500" />} label="Streak" value="14 Days" sub="Active days" trend="🔥" />
            </div>
            
            {/* Promokodlar va Balans Card */}
            <div className="bg-surface rounded-[2rem] p-6 sm:p-8 border border-border shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                    <Gift size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-text-primary">Mening Promokodlarim va Balans</h3>
                    <p className="text-xs text-slate-500 font-medium">Hisobingizga biriktirilgan chegirmalar va bonuslar</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold">Balans:</span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black border border-emerald-200">
                    {(((user as any)?.balance) || 0).toLocaleString()} so'm
                  </span>
                </div>
              </div>

              {/* Promo code input form */}
              <form onSubmit={handleRedeemPromoInsideProfile} className="space-y-3">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider">
                  Yangi Promokod Qo'shish
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Masalan: TALABA2026, TALABA_PRO, GRANT"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900 transition-all uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isRedeemingPromo || !promoCodeInput.trim()}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {isRedeemingPromo ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    <span>Faollashtirish</span>
                  </button>
                </div>

                {promoMsg && (
                  <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${promoMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    <span>{promoMsg.text}</span>
                  </div>
                )}
              </form>

              {/* Applied Promos List */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                  Hisobingizda Saqlangan Promokodlar ({user?.appliedPromos?.length || 0})
                </span>
                {user?.appliedPromos && user.appliedPromos.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {user.appliedPromos.map((promo: any, idx: number) => {
                      const codeStr = typeof promo === 'string' ? promo : (promo.code || promo.id);
                      const appliedAt = typeof promo === 'object' && promo.appliedAt ? promo.appliedAt : null;
                      return (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tag size={14} className="text-blue-600" />
                            <div>
                              <span className="font-mono font-black text-xs text-slate-900 block">{codeStr}</span>
                              {appliedAt && (
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {new Date(appliedAt).toLocaleDateString('uz-UZ')}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-bold">
                            Saqlangan ✅
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 font-medium italic p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-center">
                    Hozircha saqlangan promokodlar yo'q. Yuqoridagi maydonga promokod kiritib faollashtiring.
                  </p>
                )}
              </div>
            </div>
            
            {/* Daily Activity Log */}
            <div className="bg-surface rounded-[2rem] p-6 sm:p-8 border border-border shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Activity size={18} className="text-primary" />
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">
                    Kunlik Amallar Tarixi (Faollik Jurnali)
                  </h3>
                </div>
                <button
                  onClick={loadUserActivities}
                  disabled={loadingActivities}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                  title="Yangilash"
                >
                  <RefreshCw size={14} className={loadingActivities ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingActivities ? (
                <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-blue-600" />
                  <span>Amallar tarixi yuklanmoqda...</span>
                </div>
              ) : activities && activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.slice(0, 15).map((act, idx) => (
                    <div key={act.id || idx} className="flex items-start gap-3.5 p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                        {act.actionType === 'PROMO_REDEEM' ? (
                          <Gift size={15} className="text-amber-500" />
                        ) : act.actionType === 'LOGIN' ? (
                          <Lock size={15} className="text-emerald-500" />
                        ) : act.actionType === 'AI_REQUEST' ? (
                          <Zap size={15} className="text-blue-500" />
                        ) : (
                          <Activity size={15} className="text-indigo-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-800 break-words">{act.description}</p>
                          <span className="text-[10px] font-medium text-slate-400 shrink-0">
                            {formatActivityDate(act.timestamp)}
                          </span>
                        </div>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-slate-200/70 text-slate-600 rounded text-[9px] font-black uppercase tracking-wider">
                          {act.actionType}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center space-y-2">
                  <Activity size={28} className="mx-auto text-slate-300" />
                  <p className="text-xs font-medium text-slate-400">
                    Hozircha tizimda amallar qayd etilmagan.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Hisobingizda bajarilgan har bir amal (kirish, promokodlar, testlar) avtomatik saqlanib boradi.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Menu Column */}
          <div className="space-y-6">
             <div className="bg-surface rounded-[2rem] border border-border shadow-sm overflow-hidden p-2">
               <MenuItem icon={<Settings size={20} />} label="Profil & Xavfsizlik Sozlamalari" onClick={() => setActiveTab('settings')} />
               <MenuItem icon={<Package size={20} />} label={t('myOrders')} />
               <MenuItem icon={<Sparkles size={20} />} label="PRO Obuna & Promokod" onClick={() => setIsProModalOpen(true)} />
               <MenuItem icon={<HelpCircle size={20} />} label={t('help')} />
             </div>
             
             <div className="bg-red-50 p-6 rounded-[2rem] border border-red-100 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 bg-surface rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
                   <LogOut size={24} />
                </div>
                <div>
                   <h4 className="text-sm font-black text-red-900">Tizimdan Chiqish</h4>
                   <p className="text-[10px] font-medium text-red-500/80 mt-1">Hisobingizdan chiqishni xohlaysizmi?</p>
                </div>
                <button 
                  onClick={onLogout}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-colors shadow-lg shadow-red-500/20 cursor-pointer"
                >
                  Chiqishni Tasdiqlash
                </button>
             </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-[2rem] p-8 border border-border shadow-sm space-y-8">
           <h3 className="text-xl font-black text-text-primary tracking-tighter">Profil va Hisob Sozlamalari</h3>
           
           <div className="space-y-6 max-w-2xl">
              {/* Profile Picture Upload Section */}
              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profil Rasmi (Avatar)</h4>
                 <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-slate-200 border-2 border-white shadow-md flex items-center justify-center shrink-0">
                       {currentAvatar ? (
                          <img src={currentAvatar} alt={user?.name || 'User'} className="w-full h-full object-cover" />
                       ) : (
                          <span className="font-black text-2xl text-slate-600">{user?.name ? getInitials(user.name) : 'ST'}</span>
                       )}
                    </div>
                    <div className="space-y-2 flex-1 text-center sm:text-left">
                       <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                          <button
                             type="button"
                             onClick={handleAvatarClick}
                             disabled={isUploadingAvatar}
                             className="px-4 py-2 bg-primary hover:bg-blue-600 text-white font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                          >
                             {isUploadingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                             <span>Yangi Rasm Yuklash</span>
                          </button>
                          {currentAvatar && (
                             <button
                                type="button"
                                onClick={async () => {
                                   if (!user?.email) return;
                                   setIsUploadingAvatar(true);
                                   setCurrentAvatar(undefined);
                                   const res = await dbService.updateUserAvatar(user.email, '');
                                   if (res && res.user) {
                                      dbService.setSession(res.user);
                                      window.dispatchEvent(new Event('user_session_updated'));
                                      setAvatarMsg({ type: 'success', text: "Profil rasmi olib tashlandi" });
                                   }
                                   setIsUploadingAvatar(false);
                                }}
                                disabled={isUploadingAvatar}
                                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                             >
                                <Trash2 size={14} />
                                <span>O'chirish</span>
                             </button>
                          )}
                       </div>
                       <p className="text-[11px] text-slate-500 font-medium">
                          Kompyuter yoki telefondan rasm tanlang (JPG, PNG, WEBP). Rasm avtomatik ravishda optimallashtiriladi.
                       </p>
                    </div>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profil Ma'lumotlari</h4>
                    {(user as any)?.telegramId && (
                       <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100 flex items-center gap-1">
                          <Send size={11} /> Telegram ID: {(user as any).telegramId}
                       </span>
                    )}
                 </div>

                 {profileMsg && (
                    <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                       profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                       {profileMsg.type === 'success' ? <CheckCircle2 size={16} /> : <Trash2 size={16} />}
                       <span>{profileMsg.text}</span>
                    </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-700">To'liq Ism Sharif</label>
                       <input 
                         type="text" 
                         value={profileName} 
                         onChange={(e) => setProfileName(e.target.value)}
                         placeholder="Ism familiyangiz"
                         className="w-full bg-background border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 ring-primary/20 outline-none" 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <div className="flex items-center justify-between">
                         <label className="text-xs font-bold text-slate-700">Telefon Raqami</label>
                         <span className="text-[10px] font-semibold text-emerald-600">O'zbekiston (+998)</span>
                       </div>
                       <input 
                         type="text" 
                         value={profilePhone} 
                         onChange={(e) => setProfilePhone(formatPhoneInput(e.target.value))}
                         placeholder="+998 90 123 45 67"
                         className="w-full bg-background border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 ring-primary/20 outline-none font-mono" 
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-700">Telegram Username</label>
                       <div className="relative">
                         <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                         <input 
                           type="text" 
                           value={profileTelegram.replace(/^@/, '')} 
                           onChange={(e) => setProfileTelegram(e.target.value.replace(/^@/, ''))}
                           placeholder="username"
                           className="w-full bg-background border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm font-medium focus:ring-2 ring-primary/20 outline-none" 
                         />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-700">Email Manzili</label>
                       <input type="email" defaultValue={user?.email} className="w-full bg-slate-50 text-slate-500 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none cursor-not-allowed" disabled />
                    </div>
                 </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gemini/OpenAI/DeepSeek API Kalitlar</h4>
                 <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-slate-700">Gemini API Kaliti (Barcha asosiy xizmatlar uchun)</label>
                       <input 
                         type="password" 
                         defaultValue={localStorage.getItem('GEMINI_API_KEY') || ''} 
                         onChange={(e) => localStorage.setItem('GEMINI_API_KEY', e.target.value)}
                         placeholder="AI Studio API kalitingiz bu yerga"
                         className="w-full bg-background border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 ring-primary/20 outline-none" 
                       />
                       <p className="text-[10px] text-slate-400 font-medium">Bu kalit qurilmangizning o'zida saqlanadi (localStorage).</p>
                    </div>
                 </div>
              </div>

              {/* Biometric Security (WebAuthn / Passkeys) section removed */}

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Afzalliklar & Sozlamalar</h4>
                 
                 <div className="flex items-center justify-between p-4 bg-background border border-border rounded-2xl">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-surface rounded-xl shadow-sm flex items-center justify-center text-slate-600"><Bell size={18} /></div>
                       <div>
                          <p className="text-sm font-bold text-text-primary">Bildirishnomalar</p>
                          <p className="text-xs text-text-secondary font-medium">Email va bildirishnoma ogohlantirishlari</p>
                       </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                 </div>
                 
                 <div className="flex items-center justify-between p-4 bg-background border border-border rounded-2xl">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-surface rounded-xl shadow-sm flex items-center justify-center text-slate-600"><Lock size={18} /></div>
                       <div>
                          <p className="text-sm font-bold text-text-primary">Ikki bosqichli xavfsizlik (2FA)</p>
                          <p className="text-xs text-text-secondary font-medium">Biometrik va apparat kalitlari</p>
                       </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                 </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                 <button 
                   onClick={handleSaveProfile}
                   disabled={isSavingProfile}
                   className="px-8 py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                 >
                    {isSavingProfile && <Loader2 size={14} className="animate-spin" />}
                    <span>{isSavingProfile ? "Saqlanmoqda..." : "Saqlash"}</span>
                 </button>
              </div>
           </div>
        </div>
      )}

      <ProSubscriptionModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        user={user}
        onSuccess={(updatedUser) => {
          if (updatedUser) {
            dbService.setSession(updatedUser);
            window.dispatchEvent(new CustomEvent('user_session_updated', { detail: updatedUser }));
          }
          loadSubscriptionStatus();
        }}
      />
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, sub: string, trend: string }> = ({ icon, label, value, sub, trend }) => (
  <div className="bg-surface p-6 rounded-[2rem] border border-border shadow-sm hover:border-primary/30 transition-all cursor-default">
     <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-background rounded-2xl flex items-center justify-center">{icon}</div>
        <span className="text-[10px] font-black text-green-500 bg-green-50 px-2.5 py-1 rounded-lg">{trend}</span>
     </div>
     <h4 className="text-2xl font-black text-text-primary tracking-tighter mb-1">{value}</h4>
     <p className="text-xs font-bold text-slate-600">{label}</p>
     <p className="text-[10px] font-medium text-slate-400 mt-1">{sub}</p>
  </div>
);

const ActivityItem: React.FC<{ title: string, time: string, type: 'ai' | 'quiz' | 'achievement' | 'work' }> = ({ title, time, type }) => {
  const icons = {
    ai: <Zap size={16} className="text-blue-500" />,
    quiz: <BookOpen size={16} className="text-purple-500" />,
    achievement: <Target size={16} className="text-amber-500" />,
    work: <Activity size={16} className="text-green-500" />
  };
  const bgColors = {
    ai: 'bg-blue-50',
    quiz: 'bg-purple-50',
    achievement: 'bg-amber-50',
    work: 'bg-green-50'
  };

  return (
    <div className="flex items-center gap-4 group cursor-pointer">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bgColors[type]}`}>
         {icons[type]}
      </div>
      <div className="flex-1 min-w-0 border-b border-slate-50 py-3 group-last:border-0 border-dashed">
         <p className="text-sm font-bold text-text-primary truncate">{title}</p>
         <p className="text-[10px] font-medium text-slate-400">{time}</p>
      </div>
    </div>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 rounded-xl border-b border-slate-50 last:border-0 hover:bg-background transition-colors text-left group cursor-pointer"
  >
    <div className="flex items-center gap-4 text-text-secondary group-hover:text-primary transition-colors">
      <div className="w-8 h-8 rounded-lg bg-surface shadow-sm flex items-center justify-center border border-border group-hover:border-primary/20">
         {icon}
      </div>
      <span className="font-bold text-slate-700 text-sm group-hover:text-primary">{label}</span>
    </div>
    <ChevronRight size={16} className="text-slate-300" />
  </button>
);
