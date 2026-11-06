
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, Globe, ShieldCheck, Zap, Trophy, Users, 
  Sparkles, GraduationCap, CheckCircle2, Star, Rocket,
  Briefcase, BrainCircuit, Wallet, Search,
  Play, Send
} from 'lucide-react';
import { TelegramLoginModal } from './TelegramLoginModal';

interface LandingPageProps {
  onStart: () => void;
  onTelegramSuccess?: (user: any) => void;
  onQuickDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onTelegramSuccess, onQuickDemo }) => {
  const [showTelegramModal, setShowTelegramModal] = useState(false);

  const handleEnterApp = () => {
    if (onQuickDemo) {
      onQuickDemo();
    } else if (onTelegramSuccess) {
      onTelegramSuccess({
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
    } else {
      onStart();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black overflow-x-hidden font-sans text-white"
    >
      <TelegramLoginModal
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
        onSuccess={(user) => {
          setShowTelegramModal(false);
          if (onTelegramSuccess) onTelegramSuccess(user);
          else onStart();
        }}
        onQuickDemo={handleEnterApp}
      />
      {/* Background glow effects */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none" />

      {/* Header / Nav */}
      <nav className="fixed top-0 left-0 right-0 h-24 z-50 px-6 md:px-12 flex items-center justify-between border-b border-white/5 bg-black/60 backdrop-blur-xl">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-[14px] flex items-center justify-center text-black">
               <GraduationCap size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
               <span className="text-xl font-bold tracking-tight text-white leading-none">Student AI</span>
               <span className="text-[10px] font-medium text-white/50 uppercase tracking-[0.1em] mt-1">Platform</span>
            </div>
         </div>

         <div className="hidden lg:flex items-center gap-8 bg-white/5 px-8 py-3 rounded-full border border-white/10">
            <NavLink label="Imtihonlar" />
            <NavLink label="Freelance" />
            <NavLink label="Statistika" />
            <NavLink label="Hamjamiyat" />
         </div>

         <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowTelegramModal(true)}
              className="px-5 py-2.5 bg-[#0088cc] hover:bg-[#007cb8] text-white rounded-full font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#0088cc]/20 flex items-center gap-2 cursor-pointer"
            >
               <Send size={14} />
               <span className="hidden sm:inline">Telegram orqali</span> kirish
            </button>
            <button 
              onClick={handleEnterApp}
              className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white rounded-full font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30 border border-white/15 cursor-pointer flex items-center gap-1.5"
            >
               <Sparkles size={14} />
               <span>Ilovani ochish</span>
            </button>
         </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-48 pb-32 px-6 md:px-12 text-center relative z-10">
         <div className="max-w-4xl mx-auto space-y-10">
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.1 }}
               className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2 rounded-full text-xs font-medium text-white/80"
            >
               <Sparkles size={14} className="text-primary" /> Yangi imkoniyatlar olami
            </motion.div>
            
            <motion.h1 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="text-5xl md:text-8xl font-bold tracking-tighter leading-[1.05]"
            >
               Talabaning yagona
               <br/>
               <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">raqamli ekotizimi</span>
            </motion.h1>
            
            <motion.p 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.3 }}
               className="text-white/50 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
            >
               Xalqaro standartdagi sun'iy intellekt orqali testlar yeching, frilans bozorida daromad toping va bilimlaringizni tizimlashtiring.
            </motion.p>
            
            <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.4 }}
               className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
               <button 
                 onClick={handleEnterApp}
                 className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-white rounded-full font-black text-sm tracking-wide active:scale-95 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-primary/30 cursor-pointer border border-white/20"
               >
                  <Sparkles size={18} />
                  <span>Ilovani ochish (Tezkor)</span>
               </button>
               <button 
                 onClick={() => setShowTelegramModal(true)}
                 className="w-full sm:w-auto h-14 px-8 bg-[#0088cc] hover:bg-[#007cb8] text-white rounded-full font-black text-sm tracking-wide active:scale-95 transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-[#0088cc]/30 cursor-pointer"
               >
                  <Send size={18} />
                  <span>Telegram orqali kirish</span>
               </button>
            </motion.div>
         </div>

         {/* Abstract UI Mockup */}
         <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="max-w-5xl mx-auto mt-24 relative"
         >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10"></div>
            <div className="bg-[#111] overflow-hidden border border-white/10 rounded-[24px] rounded-b-none p-4 pb-0 shadow-2xl shadow-primary/20">
               <div className="w-full h-[400px] bg-[#1a1a1a] rounded-[16px] rounded-b-none border border-white/5 flex items-center justify-center p-8">
                  {/* Abstract elements inside mockup */}
                  <div className="w-full h-full relative">
                     <div className="absolute top-0 left-0 w-64 h-32 bg-white/5 rounded-2xl border border-white/5 p-4 flex flex-col gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10"></div>
                        <div className="w-3/4 h-3 rounded-full bg-white/10"></div>
                        <div className="w-1/2 h-3 rounded-full bg-white/5"></div>
                     </div>
                     
                     <div className="absolute top-10 right-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
                     
                     <div className="absolute bottom-10 right-0 w-72 h-40 bg-white/5 rounded-2xl border border-white/5 p-4 flex gap-4">
                        <div className="w-1/2 h-full bg-white/5 rounded-xl"></div>
                        <div className="flex-1 flex flex-col gap-2">
                           <div className="w-full h-1/4 bg-white/5 rounded-lg"></div>
                           <div className="w-full h-1/4 bg-white/5 rounded-lg"></div>
                           <div className="w-full h-1/4 bg-white/5 rounded-lg"></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </motion.div>
      </section>

      {/* Modules */}
      <section className="py-24 px-6 md:px-12 bg-black">
         <div className="max-w-6xl mx-auto space-y-16">
            <div className="text-center space-y-4">
               <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Imkoniyatlar majmuasi</h2>
               <p className="text-white/40 text-sm max-w-xl mx-auto">Sizga kerak bo'lgan barcha vositalar bitta platformada integratsiya qilingan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <FeatureCard 
                  icon={<BrainCircuit className="text-emerald-400" />}
                  title="AI Imtihon"
                  desc="Savollarni yeching va xatoliklarni chuqur tahlil qiling. AI yordamida bilimingizni baholash."
                  delay={0.1}
               />
               <FeatureCard 
                  icon={<Briefcase className="text-blue-400" />}
                  title="Freelance Hub"
                  desc="Talabalar uchun maxsus loyihalar markazi. Boshqa ustoz va mijozlar bilan ishlang."
                  delay={0.2}
               />
               <FeatureCard 
                  icon={<GraduationCap className="text-amber-400" />}
                  title="EduSystem"
                  desc="Baholar, kun tartibi va davomatni bir joyda, avtomatik nazorat qilib borish."
                  delay={0.3}
               />
               <FeatureCard 
                  icon={<Sparkles className="text-purple-400" />}
                  title="Visual Lab"
                  desc="Chizmalar, grafiklar yoki har qanday rasmning AI tahlili. Texnik chizmalar o'qish."
                  delay={0.4}
               />
               <FeatureCard 
                  icon={<Wallet className="text-cyan-400" />}
                  title="Moliya tizimi"
                  desc="Sizning ichki hamyoningiz, to'lovlar, tushumlar va barcha yechish operatsiyalari ishonchli."
                  delay={0.5}
               />
               <FeatureCard 
                  icon={<Trophy className="text-rose-400" />}
                  title="Reyting va Yutuqlar"
                  desc="Foydalanuvchilar orasida ustunlik qiling. Yutuq belgilari va maxsus darajalarni qo'lga kiriting."
                  delay={0.6}
               />
            </div>
         </div>
      </section>

      {/* Metrics Banner */}
      <section className="py-24 border-y border-white/5 relative overflow-hidden">
         <div className="absolute inset-0 bg-primary/5"></div>
         <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/10 relative z-10">
            <MetricItem value="12K+" label="Faol foydalanuvchi" />
            <MetricItem value="452K" label="Generatsiya qilingan savollar" />
            <MetricItem value="~3K" label="Muvaffaqiyatli loyihalar" />
            <MetricItem value="98%" label="AI aniqligi" />
         </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 px-6 md:px-12 border-t border-white/10">
         <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1 space-y-6">
               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-black">
                  <GraduationCap size={20} strokeWidth={2.5} />
               </div>
               <p className="text-white/40 text-sm leading-relaxed">
                  Student AI platformasi o'quv jarayonini va bo'sh vaqtni boshqarish uchun optimal echim.
               </p>
            </div>
            
            <div className="space-y-6">
               <h4 className="font-bold text-sm">Platforma</h4>
               <ul className="space-y-3">
                  <li><a className="text-white/50 text-sm hover:text-white transition-colors cursor-pointer">Imtihonlar</a></li>
                  <li><a className="text-white/50 text-sm hover:text-white transition-colors cursor-pointer">Freelance</a></li>
                  <li><a className="text-white/50 text-sm hover:text-white transition-colors cursor-pointer">Community</a></li>
               </ul>
            </div>

            <div className="space-y-6">
               <h4 className="font-bold text-sm">Kompaniya</h4>
               <ul className="space-y-3">
                  <li><a className="text-white/50 text-sm hover:text-white transition-colors cursor-pointer">Biz haqimizda</a></li>
                  <li><a className="text-white/50 text-sm hover:text-white transition-colors cursor-pointer">Hamkorlar</a></li>
                  <li><a className="text-white/50 text-sm hover:text-white transition-colors cursor-pointer">Aloqa</a></li>
               </ul>
            </div>

            <div className="space-y-6">
               <h4 className="font-bold text-sm">Huquqiy</h4>
               <ul className="space-y-3">
                  <li><a className="text-white/50 text-sm hover:text-white transition-colors cursor-pointer">Maxfiylik siyosati</a></li>
                  <li><a className="text-white/50 text-sm hover:text-white transition-colors cursor-pointer">Shartlar</a></li>
               </ul>
            </div>
         </div>

         <div className="max-w-6xl mx-auto border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-xs">© 2026 Student AI. Barcha huquqlar himoyalangan.</p>
            <div className="flex items-center gap-4">
               {/* Some social icons could go here */}
               <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"></div>
               <div className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"></div>
            </div>
         </div>
      </footer>
    </motion.div>
  );
};

const NavLink: React.FC<{ label: string }> = ({ label }) => (
  <a href="#" className="text-xs font-medium text-white/60 hover:text-white transition-colors">{label}</a>
);

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, desc: string, delay: number }> = ({ icon, title, desc, delay }) => (
  <motion.div 
     initial={{ y: 20, opacity: 0 }}
     whileInView={{ y: 0, opacity: 1 }}
     viewport={{ once: true }}
     transition={{ delay, duration: 0.5 }}
     className="p-8 bg-[#111] rounded-3xl border border-white/5 hover:border-white/10 transition-colors group"
  >
     <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-2xl group-hover:bg-white/10 transition-colors">
        {icon}
     </div>
     <h3 className="text-xl font-bold mb-3">{title}</h3>
     <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const MetricItem: React.FC<{ value: string, label: string }> = ({ value, label }) => (
  <div className="flex-1 py-12 px-6 text-center">
     <h4 className="text-5xl font-bold tracking-tighter mb-2">{value}</h4>
     <p className="text-white/40 text-sm">{label}</p>
  </div>
);
