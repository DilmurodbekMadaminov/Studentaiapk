
import React from 'react';
import { AppView } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { 
  BookOpen, FileText, Briefcase, Mic, Zap, LayoutGrid, 
  Users, Target, Video, Wand2, Globe2, LogOut, Settings, Smile, GraduationCap,
  Wallet, Trophy, ShieldAlert, Calculator, User, Lock
} from 'lucide-react';

interface NavigationProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isAdmin?: boolean;
  isPro?: boolean;
  isMobileToggle?: boolean;
  onLogout?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView, isAdmin, isPro, isMobileToggle, onLogout }) => {
  const { t } = useLanguage();
  
  const topItems = [
    { id: AppView.HOME, label: t('dashboard'), icon: <LayoutGrid size={18} /> },
    { id: AppView.MATH, label: t('matematika'), icon: <Calculator size={18} /> },
    { id: AppView.FREELANCE_HUB, label: t('freelanceHub'), icon: <Briefcase size={18} /> },
    { id: AppView.VISUAL_LAB, label: t('visualLab'), icon: <Wand2 size={18} /> },
    { id: AppView.COACH, label: t('studyCoach'), icon: <Target size={18} /> },
    { id: AppView.MAPS, label: t('maps'), icon: <Globe2 size={18} /> },
    { id: AppView.LIVE_TUTOR, label: t('aiVoice'), icon: <Mic size={18} /> },
  ];

  const bottomItems = [
    { id: AppView.NOTES, label: t('notes'), icon: <FileText size={18} /> },
    { id: AppView.PROFILE, label: t('profileAndSettings'), icon: <User size={18} /> },
  ];

  return (
    <nav className={`${isMobileToggle ? 'relative w-full h-full' : 'fixed left-0 top-0 h-full w-56 lg:w-64 border-r border-gray-100'} bg-white flex flex-col z-50 transition-all duration-300 shadow-sm md:shadow-none`}>
      {!isMobileToggle && (
        <div className="h-16 flex items-center gap-3 px-6 mb-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-primary/30 rotate-3">
             <Smile size={24} />
          </div>
          <span className="hidden md:block text-lg font-black text-primary tracking-tighter">Student AI</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 md:px-4 space-y-1.5 custom-scrollbar">
        {isMobileToggle && (
          <div className="px-2 py-2 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              Bo'limlarni Tanlash
            </span>
          </div>
        )}

        {topItems.map((item) => (
          <NavButton 
            key={item.id} 
            active={currentView === item.id} 
            onClick={() => onChangeView(item.id)} 
            icon={item.icon} 
            label={item.label} 
            isProBadge={(item as any).isProOnly && !isPro}
            isMobileToggle={isMobileToggle}
          />
        ))}
        
        {isAdmin && (
          <NavButton 
            active={currentView === AppView.ADMIN} 
            onClick={() => onChangeView(AppView.ADMIN)} 
            icon={<ShieldAlert size={18} />} 
            label={t('adminPanel')} 
            variant="admin"
            isMobileToggle={isMobileToggle}
          />
        )}
        
        <div className={`my-4 border-t border-gray-100 mx-2 ${isMobileToggle ? 'block' : 'hidden md:block'}`}></div>
        
        {isMobileToggle && (
          <div className="px-2 py-1 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              Shaxsiy & Sozlamalar
            </span>
          </div>
        )}

        {bottomItems.map((item) => (
          <NavButton 
            key={item.id} 
            active={currentView === item.id} 
            onClick={() => onChangeView(item.id)} 
            icon={item.icon} 
            label={item.label} 
            isMobileToggle={isMobileToggle}
          />
        ))}
      </div>

      <div className="p-3 md:p-4 space-y-3 mb-2">
         <div className="px-2">
            <LanguageSelector />
         </div>
         <button 
           onClick={onLogout}
           className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-error font-black transition-all hover:bg-error/5 group cursor-pointer"
         >
            <LogOut size={18} className="flex-shrink-0" />
            <span className={`${isMobileToggle ? 'block' : 'hidden md:block'} text-[11px] uppercase tracking-widest`}>{t('logout')}</span>
         </button>
      </div>
    </nav>
  );
};

const NavButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string, variant?: 'default' | 'admin', isProBadge?: boolean, isMobileToggle?: boolean }> = ({ active, onClick, icon, label, variant = 'default', isProBadge, isMobileToggle }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-3 md:px-4 py-3 rounded-xl transition-all font-black group whitespace-nowrap overflow-hidden ${
      active 
        ? variant === 'admin' ? 'bg-red-50 text-red-600 border-l-4 border-red-500 rounded-l-none' : 'bg-primary/5 text-primary border-l-4 border-primary rounded-l-none' 
        : 'text-gray-400 hover:text-primary hover:bg-gray-50'
    }`}
  >
    <div className="flex items-center gap-3 md:gap-4 truncate">
      <div className={`flex-shrink-0 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
         {icon}
      </div>
      <span className={`${isMobileToggle ? 'block text-slate-800' : 'hidden md:block'} text-[11px] uppercase tracking-widest truncate`}>{label}</span>
    </div>
    {isProBadge && (
      <span className={`${isMobileToggle ? 'inline-flex' : 'hidden md:inline-flex'} items-center gap-0.5 bg-amber-400/20 text-amber-600 text-[9px] px-1.5 py-0.5 rounded-md font-black`}>
        <Lock size={10} /> PRO
      </span>
    )}
  </button>
);
