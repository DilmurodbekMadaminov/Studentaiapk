import React from 'react';
import { Lock, ShieldAlert, ArrowLeft, Crown, Sparkles, AlertTriangle, Settings } from 'lucide-react';
import { SectionLockConfig, User } from '../types';

interface LockedSectionViewProps {
  sectionName: string;
  lockConfig?: SectionLockConfig | null;
  currentUser?: User | null;
  onGoHome?: () => void;
  onOpenProModal?: () => void;
  onOpenAdminPanel?: () => void;
}

export const LockedSectionView: React.FC<LockedSectionViewProps> = ({
  sectionName,
  lockConfig,
  currentUser,
  onGoHome,
  onOpenProModal,
  onOpenAdminPanel
}) => {
  const isFreeOnly = lockConfig?.lockMode === 'FREE_ONLY';
  const customMessage = lockConfig?.lockReason?.trim() || "Ushbu bo'lim vaqtincha qulflangan. Profilaktika ishlari yakunlangach qayta ochiladi.";

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 md:p-8 animate-fade-in">
      <div className="w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/80 rounded-[3rem] p-8 md:p-12 border border-amber-500/30 shadow-2xl relative overflow-hidden text-center space-y-8 text-white">
        
        {/* Glowing Background FX */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-lg mx-auto">
          {/* Big Lock Icon with animated pulse border */}
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-amber-400/30 to-rose-500/20 border border-amber-400/40 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/20 animate-pulse">
              <Lock size={48} className="text-amber-400 drop-shadow-md" />
            </div>
            {isFreeOnly ? (
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 p-2 rounded-xl shadow-lg border border-amber-300">
                <Crown size={16} />
              </div>
            ) : (
              <div className="absolute -bottom-2 -right-2 bg-rose-500 text-white p-2 rounded-xl shadow-lg border border-rose-300">
                <ShieldAlert size={16} />
              </div>
            )}
          </div>

          {/* Badge */}
          <div>
            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              isFreeOnly 
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}>
              {isFreeOnly ? <Crown size={14} /> : <AlertTriangle size={14} />}
              {isFreeOnly ? "PRO Obunachilar Uchun" : "Bo'lim Qulflangan"}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-2xl md:text-4xl font-black tracking-tight text-white leading-tight">
            {sectionName} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-200">
              Vaqtincha Yopilgan
            </span>
          </h2>

          {/* Underneath Lock Message / Reason set by Admin */}
          <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 text-left space-y-2 shadow-inner">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} />
              <span>Admin Xabari / E'lon:</span>
            </div>
            <p className="text-slate-200 text-xs md:text-sm font-medium leading-relaxed whitespace-pre-wrap">
              {customMessage}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {onGoHome && (
              <button
                onClick={onGoHome}
                className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={16} />
                <span>Bosh Sahifaga Qaytish</span>
              </button>
            )}

            {isFreeOnly && onOpenProModal && (
              <button
                onClick={onOpenProModal}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown size={16} />
                <span>PRO Tarifga O'tish</span>
              </button>
            )}

            {currentUser?.isAdmin && onOpenAdminPanel && (
              <button
                onClick={onOpenAdminPanel}
                className="w-full sm:w-auto px-6 py-3.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-rose-500/40 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Settings size={16} />
                <span>Qulfni Sozlash</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
