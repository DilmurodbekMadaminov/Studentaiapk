
import React from 'react';
import { UserProgress } from '../types';
import { Map as MapIcon, Star, CheckCircle2, Lock, ChevronRight, Award } from 'lucide-react';

export const ProgressMap: React.FC<{ progress: UserProgress }> = ({ progress }) => {
  const levels = [
    { id: 1, title: 'Akademik Asoslar', status: 'completed', topics: ['Matematika', 'Tarix', 'Ona tili'] },
    { id: 2, title: 'Chuqur Tahlil', status: 'active', topics: ['Fizika', 'Dasturlash', 'IELTS'] },
    { id: 3, title: 'Ekspertiza', status: 'locked', topics: ['Sun\'iy Intellekt', 'Biznes', 'Ilmiy Tadqiqot'] },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 px-4">
        <div className="space-y-2">
           <h2 className="text-4xl font-black text-text-primary tracking-tighter">Bilim Xaritangiz</h2>
           <p className="text-text-secondary font-medium">Sizning akademik sayohatingiz va erishilgan natijalar.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white p-5 rounded-[2rem] border border-border shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                 <Star size={24} fill="currentColor" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Jami Ballar</p>
                 <p className="text-xl font-black text-text-primary">{progress.points}</p>
              </div>
           </div>
        </div>
      </div>

      <div className="relative">
         {/* Connector Line */}
         <div className="absolute left-10 md:left-1/2 top-10 bottom-10 w-1 bg-slate-100 -translate-x-1/2 hidden md:block"></div>
         
         <div className="space-y-20 relative z-10">
            {levels.map((lvl, i) => (
              <div key={lvl.id} className={`flex flex-col md:flex-row items-center gap-10 ${i % 2 === 0 ? '' : 'md:flex-row-reverse'}`}>
                 <div className="w-20 h-20 rounded-[2rem] bg-white border-4 border-slate-50 shadow-xl flex items-center justify-center z-20">
                    {lvl.status === 'completed' ? <CheckCircle2 size={32} className="text-secondary" /> : 
                     lvl.status === 'active' ? <div className="w-8 h-8 bg-primary rounded-full animate-pulse shadow-lg shadow-primary/40"></div> : 
                     <Lock size={32} className="text-slate-300" />}
                 </div>
                 
                 <div className={`flex-1 w-full max-w-md p-8 rounded-[3rem] border-2 transition-all ${lvl.status === 'active' ? 'bg-white border-primary shadow-2xl scale-105' : lvl.status === 'completed' ? 'bg-slate-50 border-transparent opacity-80' : 'bg-slate-50 border-transparent grayscale'}`}>
                    <div className="flex items-center justify-between mb-4">
                       <span className={`text-[10px] font-black uppercase tracking-widest ${lvl.status === 'active' ? 'text-primary' : 'text-text-secondary'}`}>{lvl.status}</span>
                       <Award size={18} className={lvl.status === 'active' ? 'text-primary' : 'text-slate-300'} />
                    </div>
                    <h3 className="text-2xl font-black text-text-primary mb-3">{lvl.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-6">
                       {lvl.topics.map(topic => (
                         <span key={topic} className={`text-[10px] font-black px-3 py-1.5 rounded-lg border ${lvl.status === 'active' ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white border-border text-text-secondary'}`}>
                           {topic}
                         </span>
                       ))}
                    </div>
                    {lvl.status === 'active' && (
                       <button className="w-full mt-8 bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all">
                          Davom etish <ChevronRight size={16} />
                       </button>
                    )}
                 </div>
              </div>
            ))}
         </div>
      </div>

      <div className="bg-slate-900 rounded-[3rem] p-12 text-white text-center space-y-6 shadow-2xl relative overflow-hidden">
         <div className="relative z-10 space-y-4">
            <h4 className="text-3xl font-black">Yutuqlar Markazi</h4>
            <p className="text-slate-400 font-medium max-w-md mx-auto">Siz hozirgacha 5 ta yutuqni qo'lga kiritdingiz. Expert darajasiga yetishga oz qoldi!</p>
            <div className="flex justify-center gap-4 pt-6">
               {progress.badges.map(badge => (
                 <div key={badge} className="w-20 h-20 bg-white/10 rounded-2xl flex flex-col items-center justify-center gap-1 border border-white/10 group cursor-help" title={badge}>
                    <Award size={24} className="text-accent" />
                    <span className="text-[8px] font-black uppercase tracking-tighter line-clamp-1">{badge}</span>
                 </div>
               ))}
            </div>
         </div>
         <Star size={150} className="absolute -bottom-10 -right-10 text-white/5 rotate-12" />
      </div>
    </div>
  );
};
