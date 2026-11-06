
import React from 'react';
import { Users, MessageSquare, Heart, Share2, Search, Filter, Plus, Trophy } from 'lucide-react';

export const Community: React.FC = () => {
  const posts = [
    { id: '1', author: 'Anvar I.', title: 'Fizikadan qiyin masala yechimi kerak', likes: 24, comments: 8, category: 'Fizika' },
    { id: '2', author: 'Lola M.', title: 'IELTS Writing uchun 7+ shablonlar', likes: 156, comments: 42, category: 'English' },
    { id: '3', author: 'Bobur T.', title: 'Python kursidan eng yaxshi manbalar', likes: 89, comments: 15, category: 'Programming' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="space-y-2">
           <h2 className="text-4xl font-black text-text-primary tracking-tighter">Student Community</h2>
           <p className="text-text-secondary font-medium">Bilim almashing, savol bering va o'sib boring.</p>
        </div>
        <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-all">
          <Plus size={18} /> Yangi Post
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
         <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
            <input type="text" placeholder="Mavzu yoki savol izlash..." className="w-full pl-12 pr-4 py-4 bg-white border border-border rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none text-sm font-medium transition-all" />
         </div>
         <button className="bg-white border border-border px-6 py-4 rounded-2xl flex items-center gap-2 text-sm font-bold text-text-secondary hover:bg-slate-50">
            <Filter size={18} /> Filtr
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-6">
            {posts.map(post => (
              <div key={post.id} className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl hover:border-primary/10 transition-all cursor-pointer group">
                 <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-500">{post.author[0]}</div>
                       <span className="text-xs font-black text-text-primary">{post.author}</span>
                    </div>
                    <span className="text-[9px] font-black text-primary bg-primary/5 px-3 py-1 rounded-full uppercase tracking-widest">{post.category}</span>
                 </div>
                 <h3 className="text-xl font-black text-text-primary group-hover:text-primary transition-colors mb-6 leading-tight">{post.title}</h3>
                 <div className="flex items-center gap-6 pt-6 border-t border-slate-50">
                    <button className="flex items-center gap-2 text-text-secondary hover:text-error transition-colors text-xs font-bold">
                       <Heart size={16} /> {post.likes}
                    </button>
                    <button className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-xs font-bold">
                       <MessageSquare size={16} /> {post.comments}
                    </button>
                    <button className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors text-xs font-bold ml-auto">
                       <Share2 size={16} />
                    </button>
                 </div>
              </div>
            ))}
         </div>

         <div className="space-y-8">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
               <div className="relative z-10 space-y-4">
                  <Trophy size={40} className="text-white fill-white/20 mb-2" />
                  <h4 className="text-xl font-black">Top Ekspertlar</h4>
                  <p className="text-xs text-white/80 font-medium">Savollarga javob berib ball to'plang va yutuqlarga ega bo'ling.</p>
                  <div className="space-y-3 pt-4">
                     {['Otabek R.', 'Sardor A.', 'Laylo T.'].map((name, i) => (
                       <div key={name} className="flex items-center justify-between bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/10">
                          <span className="text-xs font-black">{i+1}. {name}</span>
                          <span className="text-[10px] font-black">{(5-i)*100} pt</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
            
            <div className="bg-white p-8 rounded-[2.5rem] border border-border shadow-sm">
               <h3 className="font-black text-sm uppercase tracking-widest mb-6">Trenddagi mavzular</h3>
               <div className="flex flex-wrap gap-2">
                  {['#IELTS', '#Python', '#Fizika', '#Tarix', '#Mathematics', '#WebDesign'].map(tag => (
                    <span key={tag} className="text-[10px] font-black text-text-secondary bg-slate-50 px-3 py-1.5 rounded-lg hover:bg-primary/5 hover:text-primary transition-all cursor-pointer">{tag}</span>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
