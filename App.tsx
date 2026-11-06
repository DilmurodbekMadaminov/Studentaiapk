
import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation.tsx';
import { motion, AnimatePresence } from 'motion/react';
import { ChatInterface } from './components/ChatInterface.tsx';
import { CanvaStudio } from './components/CanvaStudio.tsx';
import { NotesGenerator } from './components/NotesGenerator.tsx';
import { QuizGenerator } from './components/QuizGenerator.tsx';
import { Profile } from './components/Profile.tsx';
import { LiveTutor } from './components/LiveTutor.tsx';
import { Auth } from './components/Auth.tsx';
import { Community } from './components/Community.tsx';
import { StudyCoach } from './components/StudyCoach.tsx';
import { ProgressMap } from './components/ProgressMap.tsx';
import { MapsView } from './components/MapsView.tsx';
import { EduSystem } from './components/EduSystem.tsx';
import { FreelanceHub } from './components/FreelanceHub.tsx';
import { ExamSystem } from './components/ExamSystem.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { MatematikaSection } from './components/MatematikaSection.tsx';
import { LockedSectionView } from './components/LockedSectionView.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { LanguageSelector } from './components/LanguageSelector.tsx';
import { AppView, User, AdminRole, SectionLockMap } from './types.ts';
import { dbService } from './services/dbService.ts';
import { securityService } from './services/securityService.ts';
import { ProSubscriptionModal } from './components/ProSubscriptionModal.tsx';
import { 
  ShieldCheck, Lock, Shield, Fingerprint, ScanFace, Zap, Cpu, Bell,
  BrainCircuit, Briefcase, Trophy, Wallet, BookOpen, Menu, X, Calculator, Crown, LayoutGrid, Wand2
} from 'lucide-react';

const SecurityStat: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="bg-white p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-2xl transition-all group">
     <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 rounded-2xl md:rounded-[1.8rem] flex items-center justify-center text-xl md:text-2xl shadow-inner group-hover:scale-110 transition-transform">{icon}</div>
     <div>
        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tighter">{value}</p>
     </div>
  </div>
);

const HomeView: React.FC<{ onViewChange: (v: AppView) => void, user: User | null }> = ({ onViewChange, user }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6 sm:space-y-12"
  >
     <div className="bg-slate-950 rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] p-5 sm:p-8 md:p-16 text-white relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.2)]">
        <div className="relative z-10 space-y-4 sm:space-y-6 md:space-y-8 max-w-2xl text-left">
           <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-white/5 backdrop-blur-md">
              <ShieldCheck size={16} /> Zero-Trust Verified
           </div>
           <h1 className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tighter leading-tight sm:leading-none">
              Xush kelibsiz, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400 italic">
                {user?.name ? user.name.split(' ')[0] : 'Talaba'}
              </span>
           </h1>
           <p className="text-slate-400 text-xs sm:text-base md:text-xl font-medium leading-relaxed max-w-xl">
              Tizimga kirish muvaffaqiyatli yakunlandi. Sizning sessiyangiz apparat darajasida shifrlangan va xavfsiz tugun orqali bog'langan.
           </p>
           <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <button onClick={() => onViewChange(AppView.COACH)} className="px-6 sm:px-8 md:px-12 py-3.5 sm:py-4 md:py-6 bg-primary text-white rounded-xl sm:rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all cursor-pointer">AI Murabbiy</button>
              <button onClick={() => onViewChange(AppView.NOTES)} className="px-6 sm:px-8 md:px-12 py-3.5 sm:py-4 md:py-6 bg-white/5 text-white border border-white/10 rounded-xl sm:rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer">Konspekt Generatori</button>
           </div>
        </div>
        
        <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 opacity-10 pointer-events-none">
           <Shield size={400} className="text-primary rotate-12 sm:w-[600px]" />
           <div className="absolute inset-0 bg-primary/20 blur-[150px] rounded-full"></div>
        </div>
     </div>

     {/* Quick Start Guide & Section Selection */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
        <div className="col-span-1 md:col-span-2 bg-white p-5 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-sm space-y-4 sm:space-y-6">
           <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">Bo'limni Tanlang</h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-full">Bo'limlar</span>
           </div>
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
              <QuickAction 
                icon={<Calculator className="text-primary" />} 
                title="Standart Quiz" 
                desc="Imtihonlar & Testlar" 
                onClick={() => onViewChange(AppView.MATH)}
              />
              <QuickAction 
                icon={<Wand2 className="text-purple-500" />} 
                title="Canva AI Magic" 
                desc="Veo 3.1 & Rasm Studiyasi" 
                onClick={() => onViewChange(AppView.VISUAL_LAB)}
              />
              <QuickAction 
                icon={<BrainCircuit className="text-primary" />} 
                title="AI Murabbiy" 
                desc="O'quv rejangizni tuzing" 
                onClick={() => onViewChange(AppView.COACH)}
              />
              <QuickAction 
                icon={<BookOpen className="text-blue-500" />} 
                title="AI Konspektlar" 
                desc="Konspekt generatori" 
                onClick={() => onViewChange(AppView.NOTES)}
              />
              <QuickAction 
                icon={<Briefcase className="text-green-500" />} 
                title="Freelance" 
                desc="Loyihalarda qatnashing" 
                onClick={() => onViewChange(AppView.FREELANCE_HUB)}
              />
              <QuickAction 
                icon={<Zap className="text-amber-500" />} 
                title="Knowledge Map" 
                desc="Bilim xaritasi & tahlil" 
                onClick={() => onViewChange(AppView.PROGRESS)}
              />
           </div>
        </div>
        <div className="bg-primary text-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] shadow-xl shadow-primary/20 flex flex-col justify-between space-y-4">
           <div className="space-y-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-2xl flex items-center justify-center"><Trophy size={20} /></div>
              <h4 className="text-lg sm:text-xl font-black tracking-tight">Haftalik Reyting</h4>
              <p className="text-white/80 text-xs sm:text-sm font-medium">Siz top 5% talabalar qatoridasiz. Davom eting!</p>
           </div>
           <button onClick={() => onViewChange(AppView.PROGRESS)} className="w-full py-3.5 bg-white text-primary rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all cursor-pointer">Batafsil</button>
        </div>
     </div>

     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        <SecurityStat icon={<Cpu className="text-blue-500" />} label="Hardware Auth" value="FIPS 140-2" />
        <SecurityStat icon={<Lock className="text-indigo-500" />} label="Encryption" value="AES-256-XTS" />
        <SecurityStat icon={<ShieldCheck className="text-green-500" />} label="Integrity" value="SHA-512-HMAC" />
        <SecurityStat icon={<Zap className="text-amber-500" />} label="Response" value="< 50ms Node" />
     </div>
  </motion.div>
);

const QuickAction: React.FC<{ icon: React.ReactNode, title: string, desc: string, onClick: () => void }> = ({ icon, title, desc, onClick }) => (
  <div 
    onClick={onClick}
    className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:border-primary hover:bg-white hover:shadow-xl transition-all cursor-pointer group"
  >
     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
     <h4 className="font-black text-slate-900 text-sm tracking-tight">{title}</h4>
     <p className="text-[10px] font-medium text-slate-400">{desc}</p>
  </div>
);

import { NotificationsPopover } from './components/NotificationsPopover';

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(() => {
    return AppView.HOME;
  });
  const [isScanning, setIsScanning] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [sectionLocks, setSectionLocks] = useState<SectionLockMap>({});

  useEffect(() => {
    const fetchLocks = async () => {
      const locks = await dbService.getSectionLocks();
      setSectionLocks(locks || {});
    };
    fetchLocks();

    const handleLocksUpdate = (e: any) => {
      if (e.detail) {
        setSectionLocks(e.detail);
      }
    };
    window.addEventListener('section_locks_updated', handleLocksUpdate);
    return () => {
      window.removeEventListener('section_locks_updated', handleLocksUpdate);
    };
  }, [currentView]);
  
  useEffect(() => {
    const initSession = async () => {
      try {
        const session = localStorage.getItem('st_ai_session_enc');
        if (session) {
          const decoded = securityService.decrypt(session);
          if (decoded && (decoded.email || decoded.id || decoded.telegramId)) {
            const searchId = decoded.email || decoded.id || decoded.telegramId;
            const currentUser = await dbService.findUser(searchId);
            if (currentUser) {
              setUser(currentUser);
              setIsAuthenticated(true);
              // Log daily activity for active session
              dbService.logActivity('LOGIN', `Foydalanuvchi tizimga kirdi`, { email: currentUser.email });
            } else {
              setUser(decoded as User);
              setIsAuthenticated(true);
            }
          }
        }
      } catch (e) {
        console.error("Session restoration failed gracefully:", e);
      }
    };
    initSession();

    const handleSessionUpdate = (e?: any) => {
      const detailUser = e?.detail;
      if (detailUser) {
        setUser(detailUser);
        return;
      }
      const current = dbService.getCurrentUser();
      if (current) {
        setUser(current);
        const searchId = current.email || current.id || current.telegramId;
        if (searchId) {
          dbService.findUser(searchId).then(fresh => {
            if (fresh) {
              setUser(prev => ({ ...prev, ...fresh, isPro: fresh.isPro ?? prev?.isPro }));
            }
          });
        }
      }
    };

    window.addEventListener('user_session_updated', handleSessionUpdate);
    return () => window.removeEventListener('user_session_updated', handleSessionUpdate);
  }, []);

  // Detect Telegram Bot direct redirect & Auto-login
  useEffect(() => {
    const handleTelegramRedirect = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const authToken = params.get('auth_token') || params.get('token');
        const telegramId = params.get('telegram_id') || params.get('telegramId');
        const isAdminView = params.get('view') === 'admin' || params.has('admin_token');

        if (authToken) {
          const res = await dbService.checkTelegramAuth(authToken);
          if (res && res.authenticated && res.user) {
            setUser(res.user);
            setIsAuthenticated(true);
            dbService.setSession(res.user);
            if (isAdminView && (res.user.isAdmin || (res.user.role as string) === 'SUPER_ADMIN' || (res.user.role as string) === 'Super Admin')) {
              setCurrentView(AppView.ADMIN);
            } else {
              setCurrentView(AppView.HOME);
            }
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }
        }

        if (telegramId) {
          const allUsers = await dbService.getUsers();
          const matched = allUsers.find((u: any) => String(u.telegramId) === String(telegramId) || String(u.id) === String(telegramId));
          if (matched) {
            setUser(matched);
            setIsAuthenticated(true);
            dbService.setSession(matched);
            if (isAdminView && (matched.isAdmin || (matched.role as string) === 'SUPER_ADMIN' || (matched.role as string) === 'Super Admin')) {
              setCurrentView(AppView.ADMIN);
            } else {
              setCurrentView(AppView.HOME);
            }
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          }
        }

        if (isAdminView) {
          setCurrentView(AppView.ADMIN);
        }
      } catch (e) {
        console.error("[Telegram Auto-Login Error]:", e);
      }
    };

    handleTelegramRedirect();
  }, []);

  const handleLogin = async (userData: User) => {
    setIsScanning(true);
    setTimeout(async () => {
      let freshUser = await dbService.findUser(userData.email);
      if (!freshUser) {
        await dbService.saveUser(userData);
        freshUser = await dbService.findUser(userData.email);
      }
      
      const loggedUser = freshUser || {
        name: userData.name,
        email: userData.email,
        isAdmin: userData.email === 'dilnuramadaminova06@gmail.com'
      };

      setUser(loggedUser);
      setIsScanning(false);
      setIsAuthenticated(true);
      dbService.setSession(loggedUser);
    }, 1000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('st_ai_session_enc');
    setCurrentView(AppView.HOME);
  };

  const isUserAdmin = !!(
    sessionStorage.getItem('student_ai_admin_session') === 'true' ||
    (user && (
      user.isAdmin || 
      user.role === AdminRole.SUPER_ADMIN || 
      user.role === AdminRole.ADMIN || 
      user.role === AdminRole.MODERATOR ||
      user.email === 'dilnuramadaminova06@gmail.com' ||
      String(user.telegramId) === '71153350' ||
      String(user.telegramId) === '105159360'
    ))
  );

  const renderContent = () => {
    // Check if the current section is locked by Admin
    if (!isUserAdmin && currentView !== AppView.HOME && currentView !== AppView.PROFILE && currentView !== AppView.SETTINGS && currentView !== AppView.ADMIN) {
      const lockConfig = sectionLocks[currentView];
      if (lockConfig && lockConfig.isLocked) {
        const isFreeOnly = lockConfig.lockMode === 'FREE_ONLY';
        // If FREE_ONLY and user is PRO, allow access. Otherwise lock view.
        if (!(isFreeOnly && user?.isPro)) {
          return (
            <LockedSectionView
              sectionName={lockConfig.sectionName || currentView}
              lockConfig={lockConfig}
              currentUser={user}
              onGoHome={() => setCurrentView(AppView.HOME)}
              onOpenProModal={() => setIsProModalOpen(true)}
              onOpenAdminPanel={() => setCurrentView(AppView.ADMIN)}
            />
          );
        }
      }
    }

    switch (currentView) {
      case AppView.HOME: return <HomeView onViewChange={setCurrentView} user={user} />;
      case AppView.MATH: return <MatematikaSection user={user} />;
      case AppView.ADMIN: 
        return <AdminPanel currentUser={user} onBack={() => setCurrentView(AppView.HOME)} />;
      case AppView.PROFILE: return <Profile onLogout={handleLogout} user={user} defaultTab="overview" />;
      case AppView.SETTINGS: return <Profile onLogout={handleLogout} user={user} defaultTab="settings" />;
      case AppView.CHAT: return <ChatInterface />;
      case AppView.VISUAL_LAB: return <CanvaStudio />;
      case AppView.VIDEO_GEN: return <CanvaStudio />;
      case AppView.MAPS: return <MapsView />;
      case AppView.NOTES: return <NotesGenerator />;
      case AppView.QUIZ: return <QuizGenerator user={user} />;
      case AppView.LIVE_TUTOR: return <LiveTutor />;
      case AppView.COMMUNITY: return <Community />;
      case AppView.COACH: return <StudyCoach user={user} />;
      case AppView.PROGRESS: return <ProgressMap progress={{level: 'Pro', points: 2543, badges: ['Security Expert', 'AI Early Adopter'], streak: 12, completedTopics: []}} />;
      case AppView.EDU_SYSTEM: return <EduSystem />;
      case AppView.FREELANCE_HUB: return <FreelanceHub user={user} />;
      case AppView.EXAM_MODE: return <ExamSystem />;
      default: return <HomeView onViewChange={setCurrentView} user={user} />;
    }
  };

  if (isScanning) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-primary">
         <div className="relative mb-12">
            <div className="w-32 h-32 border-4 border-primary/20 rounded-full animate-ping absolute"></div>
            <div className="w-32 h-32 border-b-4 border-primary rounded-full animate-spin"></div>
            <ScanFace className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={48} />
         </div>
         <h2 className="text-2xl font-black uppercase tracking-[0.5em] animate-pulse">Verifying Account</h2>
         <p className="text-slate-500 text-xs font-bold mt-4 uppercase tracking-widest">Student AI login in progress...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showAuth) return <Auth onLogin={handleLogin} onBack={() => setShowAuth(false)} />;
    return (
      <LandingPage 
        onStart={() => setShowAuth(true)} 
        onTelegramSuccess={handleLogin} 
        onQuickDemo={() => handleLogin({
          name: "Dilnura Madaminova",
          email: "dilnuramadaminova06@gmail.com",
          isAdmin: true,
          isPro: true,
          role: AdminRole.SUPER_ADMIN,
          studentId: "ST-2026-9901",
          university: "O'zbekiston Milliy Universiteti",
          faculty: "Amaliy Matematika & IT",
          course: 3,
          balance: 750000,
          xpPoints: 2850,
          streakDays: 14
        })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FBFF] flex flex-col md:flex-row text-[#1E293B] font-sans antialiased overflow-x-hidden">
      {/* Desktop / Computer Navigation */}
      <div className="hidden md:block">
        <Navigation 
          currentView={currentView} 
          onChangeView={setCurrentView} 
          isAdmin={isUserAdmin} 
          isPro={!!user?.isPro}
          onLogout={handleLogout} 
        />
      </div>

      {/* Mobile & Tablet Sliding Drawer Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-50 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] sm:w-[320px] bg-white z-50 p-4 shadow-2xl flex flex-col md:hidden border-r border-gray-100"
            >
              <div className="flex items-center justify-between pb-6 border-b border-gray-50 mb-4 h-16 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-primary/30 rotate-3">
                     <span className="font-bold text-xl">S</span>
                  </div>
                  <span className="text-lg font-black text-primary tracking-tighter">Student AI</span>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation list rendering with active labels */}
              <div className="flex-1 overflow-y-auto px-1 custom-scrollbar">
                <Navigation 
                  currentView={currentView} 
                  onChangeView={(view) => {
                    setCurrentView(view);
                    setIsMobileMenuOpen(false);
                  }} 
                  isAdmin={isUserAdmin} 
                  isPro={!!user?.isPro}
                  isMobileToggle={true}
                  onLogout={handleLogout}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-h-screen md:ml-56 lg:ml-64 pb-20 md:pb-0 transition-all duration-300">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-10 sticky top-0 z-40">
           <div className="flex items-center gap-3">
              {/* Responsive Hamburger Button visible on Mobile and Tablet viewports (< 768px matches md:hidden) */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)} 
                className="md:hidden p-3 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer focus:outline-none"
              >
                 <Menu size={20} />
              </button>

              <div className="flex items-center gap-2">
                 <div className="hidden sm:flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20">
                   📱 Planshet Rejimi Faol
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Secure Node v5.2</span>
                    <div className="flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                       <span className="text-[7px] font-black text-green-600 uppercase tracking-[0.2em]">AES-256-XTS Active</span>
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-2 sm:gap-4 md:gap-6 relative">
              <div className="block">
                <LanguageSelector />
              </div>
              <button 
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className="p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all relative cursor-pointer"
                title="Bildirishnomalar"
              >
                 <Bell size={18} />
                 {unreadNotifCount > 0 && (
                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-white animate-pulse">
                     {unreadNotifCount}
                   </span>
                 )}
              </button>

              <NotificationsPopover
                userEmail={user?.email || ''}
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                onUnreadCountChange={(count) => setUnreadNotifCount(count)}
              />

              <div 
                onClick={() => setCurrentView(AppView.PROFILE)}
                className="w-10 h-10 rounded-2xl bg-slate-100 border-2 border-white shadow-sm overflow-hidden cursor-pointer hover:rotate-6 transition-transform"
                title="Profil va Sozlamalar"
              >
                 <img 
                   src={user?.avatar || user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=3C91E6&color=fff`} 
                   alt={user?.name || 'User'} 
                   className="w-full h-full object-cover"
                 />
              </div>
           </div>
        </header>

        <div className="max-w-[1400px] mx-auto w-full p-4 md:p-10">
           <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
           </AnimatePresence>
        </div>

        {/* Mobile & Smartphone Bottom Navigation Bar (Visible only on phone/mobile screens) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 px-2 py-2 flex items-center justify-around z-40 md:hidden shadow-lg">
          <button
            onClick={() => setCurrentView(AppView.HOME)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
              currentView === AppView.HOME ? 'text-primary font-black' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutGrid size={20} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Bosh sahifa</span>
          </button>

          <button
            onClick={() => setCurrentView(AppView.MATH)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer relative ${
              currentView === AppView.MATH ? 'text-primary font-black' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Calculator size={20} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Quiz</span>
          </button>

          <button
            onClick={() => setCurrentView(AppView.COACH)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
              currentView === AppView.COACH ? 'text-primary font-black' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BrainCircuit size={20} />
            <span className="text-[9px] uppercase tracking-wider font-bold">AI Coach</span>
          </button>

          <button
            onClick={() => setCurrentView(AppView.FREELANCE_HUB)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all cursor-pointer ${
              currentView === AppView.FREELANCE_HUB ? 'text-primary font-black' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Briefcase size={20} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Frilans</span>
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 p-2 rounded-xl text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
          >
            <Menu size={20} />
            <span className="text-[9px] uppercase tracking-wider font-bold">Barchasi</span>
          </button>
        </div>
      </main>

      <ProSubscriptionModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
        user={user}
        onSuccess={(updatedUser) => {
          if (updatedUser) {
            setUser(updatedUser);
            dbService.setSession(updatedUser);
          } else {
            const current = dbService.getCurrentUser();
            if (current) {
              setUser(current);
            }
          }
        }}
      />
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;
