import React, { useState } from 'react';
import { 
  X, ShieldCheck, DollarSign, Clock, Calendar, CheckCircle, 
  User, Star, FileText, Send, Paperclip, ChevronRight, MessageSquare,
  CheckSquare, Square, Award, MapPin, Building, Briefcase, Plus, AlertCircle
} from 'lucide-react';
import { FreelanceProject, FreelanceBid, FreelanceErrand, FreelanceMilestone } from '../types';

interface FreelanceJobModalProps {
  project: FreelanceProject;
  bids: FreelanceBid[];
  onClose: () => void;
  onSubmitBid: (bid: { projectId: string; amount: string; days: string; proposal: string; telegramUsername?: string }) => void;
  onStartChatWithBidder?: (bid: FreelanceBid) => void;
}

export const FreelanceJobModal: React.FC<FreelanceJobModalProps> = ({
  project,
  bids,
  onClose,
  onSubmitBid,
  onStartChatWithBidder,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'errands' | 'bids' | 'submit_bid'>('details');

  // Bid submission form states
  const [bidAmount, setBidAmount] = useState('');
  const [bidDays, setBidDays] = useState('');
  const [bidProposal, setBidProposal] = useState('');
  const [bidTelegram, setBidTelegram] = useState('');

  // Local state for interactive errands (check/uncheck)
  const [errands, setErrands] = useState<FreelanceErrand[]>(project.errands || [
    { id: 'e1', title: "Figma va UX/UI arxitekturani tasdiqlash", isCompleted: true, priority: 'high' },
    { id: 'e2', title: "Frontend UI komponentlarini responsive ishlab chiqish", isCompleted: true, priority: 'high' },
    { id: 'e3', title: "Backend va REST API integratsiyasi", isCompleted: false, priority: 'medium' },
    { id: 'e4', title: "Tizimni testlash va xavfsizlik auditidan o'tkazish", isCompleted: false, priority: 'low' }
  ]);

  // Default milestones if none provided
  const milestones: FreelanceMilestone[] = project.milestones || [
    { id: 'm1', title: "1-Bosqich: Dizayn va Prototiplash", budget: "$200", status: 'completed', escrowStatus: 'released' },
    { id: 'm2', title: "2-Bosqich: Asosiy funksionallik va Frontend", budget: "$400", status: 'in_progress', escrowStatus: 'locked' },
    { id: 'm3', title: "3-Bosqich: Server, Bazalar va Deploy", budget: "$200", status: 'pending', escrowStatus: 'none' }
  ];

  const projectBids = bids.filter(b => b.projectId === project.id);

  const toggleErrand = (id: string) => {
    setErrands(prev => prev.map(e => e.id === id ? { ...e, isCompleted: !e.isCompleted } : e));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidAmount || !bidDays || !bidProposal) return;
    onSubmitBid({
      projectId: project.id,
      amount: bidAmount,
      days: bidDays,
      proposal: bidProposal,
      telegramUsername: bidTelegram
    });
    setActiveTab('bids');
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in text-left">
      <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="p-6 md:p-8 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative">
          <div className="space-y-2 pr-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-lg">
                {project.category}
              </span>
              <span className="px-3 py-1 bg-white/10 text-slate-200 text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10">
                {project.level}
              </span>
              {project.verified && (
                <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 border border-green-500/30 text-[9px] font-black uppercase tracking-widest rounded-lg">
                  <ShieldCheck size={12} /> Escrow Tasdiqlangan
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight">
              {project.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1"><Building size={14} className="text-primary" /> {project.client}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {project.clientLocation || "Toshkent, O'zbekiston"}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> Joylandi: {project.postedAt || "Yangi"}</span>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 bg-slate-50 px-6 gap-2 overflow-x-auto shrink-0">
          <button 
            onClick={() => setActiveTab('details')}
            className={`py-4 px-4 font-black text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'details' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-slate-800'
            }`}
          >
            📋 Loyiha Tafsilotlari
          </button>
          <button 
            onClick={() => setActiveTab('errands')}
            className={`py-4 px-4 font-black text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'errands' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-slate-800'
            }`}
          >
            🎯 Topshiriqlar & Bosqichlar ({errands.filter(e => e.isCompleted).length}/{errands.length})
          </button>
          <button 
            onClick={() => setActiveTab('bids')}
            className={`py-4 px-4 font-black text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'bids' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-slate-800'
            }`}
          >
            📩 Arizalar va Takliflar ({projectBids.length})
          </button>
          <button 
            onClick={() => setActiveTab('submit_bid')}
            className={`py-4 px-4 font-black text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'submit_bid' ? 'border-primary text-primary bg-white' : 'border-transparent text-gray-500 hover:text-slate-800'
            }`}
          >
            ✍️ Taklif Yuborish
          </button>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-8">
              {/* Highlights Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-gray-100 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Budjet</span>
                    <span className="font-black text-slate-800 text-sm">{project.budget}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-gray-100 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
                    <Clock size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Bajarish Muddati</span>
                    <span className="font-black text-slate-800 text-sm">{project.deadline}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-gray-100 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center font-black">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-gray-400 block">Buyurtmachi Sarfi</span>
                    <span className="font-black text-slate-800 text-sm">{project.clientSpentTotal || "$15,200.00 Spent"}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-800 text-base">Loyiha Tavsifi va Talablar</h4>
                <div className="bg-slate-50/70 p-6 rounded-2xl border border-gray-100 text-gray-600 font-medium text-xs leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </div>
              </div>

              {/* Required Skills */}
              {project.skills && project.skills.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-black text-slate-800 text-base">Talab qilinadigan ko'nikmalar</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map(s => (
                      <span key={s} className="px-3 py-1.5 bg-primary/5 text-primary border border-primary/20 rounded-xl text-xs font-bold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments Section */}
              <div className="space-y-3">
                <h4 className="font-black text-slate-800 text-base">Ilova qilingan Fayllar</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-gray-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Paperclip size={18} className="text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 text-xs truncate">Technical_Specification.pdf</p>
                        <p className="text-[9px] font-bold text-gray-400">2.4 MB • PDF Hujjat</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black rounded-lg transition-all">
                      Yuklash
                    </button>
                  </div>

                  <div className="p-3 bg-white border border-gray-200 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Paperclip size={18} className="text-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-black text-slate-800 text-xs truncate">Figma_Design_System.url</p>
                        <p className="text-[9px] font-bold text-gray-400">Figma Maket Link</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-black rounded-lg transition-all">
                      Ochish
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://t.me/${(project.contacts?.telegram || 'studentai_support').replace('@', '')}?text=${encodeURIComponent(`Salom! Men Student AI Frilans platformasidan "${project.title}" loyihangiz bo'yicha bog'lanmoqdaman.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-4 bg-[#229ED9] hover:bg-[#1d8ec4] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={16} /> Telegram-da Bog'lanish
                </a>
                <button 
                  onClick={() => setActiveTab('submit_bid')}
                  className="flex-1 py-4 bg-primary hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  Taklif Bera Oling <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ERRANDS & MILESTONES */}
          {activeTab === 'errands' && (
            <div className="space-y-8">
              {/* Errands Checklist Section */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-black text-slate-800 text-base">Topshiriqlar Ro'yxati (Errands Breakdown)</h4>
                  <p className="text-xs font-semibold text-gray-400">Loyihada kutilayotgan har bir kichik topshiriq va ularning bajarilish holati</p>
                </div>

                <div className="space-y-2">
                  {errands.map((errand) => (
                    <div 
                      key={errand.id}
                      onClick={() => toggleErrand(errand.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        errand.isCompleted ? 'bg-green-50/50 border-green-200 text-slate-700' : 'bg-white border-gray-200 hover:border-primary/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {errand.isCompleted ? (
                          <CheckSquare className="text-green-600 shrink-0" size={20} />
                        ) : (
                          <Square className="text-gray-300 shrink-0" size={20} />
                        )}
                        <span className={`text-xs font-black ${errand.isCompleted ? 'line-through text-gray-400' : 'text-slate-800'}`}>
                          {errand.title}
                        </span>
                      </div>

                      <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                        errand.priority === 'high' ? 'bg-red-50 text-red-600 border border-red-100' :
                        errand.priority === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {errand.priority || 'oddiy'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones Escrow Table */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-black text-slate-800 text-base">Bosqichli To'lovlar (Milestones)</h4>
                  <p className="text-xs font-semibold text-gray-400">Xavfsiz va bosqichma-bosqich moliyalashtirish rejasi</p>
                </div>

                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-gray-200 font-black text-[10px] uppercase text-gray-400 tracking-wider">
                      <tr>
                        <th className="p-4">Bosqich nomi</th>
                        <th className="p-4">Budjet</th>
                        <th className="p-4">Holat</th>
                        <th className="p-4">Escrow Garov</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-semibold text-slate-700">
                      {milestones.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-black text-slate-800">{m.title}</td>
                          <td className="p-4 font-black text-primary">{m.budget}</td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                              m.status === 'completed' ? 'bg-green-100 text-green-700' :
                              m.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {m.status === 'completed' ? 'Bajarilgan' : m.status === 'in_progress' ? 'Jarayonda' : 'Kutilmoqda'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                              m.escrowStatus === 'released' ? 'bg-green-500 text-white' :
                              m.escrowStatus === 'locked' ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {m.escrowStatus === 'released' ? 'To\'landi' : m.escrowStatus === 'locked' ? 'Escrow Garovda' : 'Boshlanmagan'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROPOSALS / BIDS */}
          {activeTab === 'bids' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-black text-slate-800 text-base">G'oliblikka Nomzodlar</h4>
                  <p className="text-xs font-semibold text-gray-400">Frilanserlar tomonidan yuborilgan taklif va arizalar ro'yxati</p>
                </div>
                <button 
                  onClick={() => setActiveTab('submit_bid')}
                  className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow cursor-pointer"
                >
                  + Ariza berish
                </button>
              </div>

              {projectBids.length > 0 ? (
                <div className="space-y-4">
                  {projectBids.map((bid) => (
                    <div key={bid.id} className="p-6 bg-white border border-gray-200 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg">
                            {(bid as any).candidateName?.charAt(0) || 'F'}
                          </div>
                          <div>
                            <h5 className="font-black text-slate-800 text-sm">{(bid as any).candidateName || "Tajribali Frilanser"}</h5>
                            <p className="text-[11px] text-gray-400 font-bold">{(bid as any).candidateRole || "Full-Stack Developer"}</p>
                            <div className="flex items-center gap-1 text-yellow-500 text-xs font-black mt-0.5">
                              <Star size={12} className="fill-yellow-500" /> 4.9 (18 reyting)
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-primary text-base block">{bid.amount}</span>
                          <span className="text-[10px] font-bold text-gray-400">{bid.days} muddat</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 text-xs text-slate-700 font-semibold leading-relaxed">
                        "{bid.proposal}"
                      </div>

                      <div className="flex flex-wrap justify-between items-center gap-2 pt-2">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${
                          bid.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          bid.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {bid.status === 'accepted' ? 'Qabul qilingan' : bid.status === 'rejected' ? 'Rad etilgan' : 'Kutilmoqda'}
                        </span>

                        <div className="flex items-center gap-2">
                          <a 
                            href={`https://t.me/${((bid as any).telegramUsername || 'student_freelancer').replace('@', '')}?text=${encodeURIComponent(`Salom! Men "${project.title}" loyihasi bo'yicha Student AI platformasidan yozmoqdaman.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-[#229ED9] hover:bg-[#1b8abf] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Send size={13} /> Telegram Chat
                          </a>
                          {onStartChatWithBidder && (
                            <button 
                              onClick={() => onStartChatWithBidder(bid)}
                              className="px-4 py-2 bg-slate-900 hover:bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <MessageSquare size={14} /> Intervyu
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center border-2 border-dashed border-gray-200 rounded-3xl space-y-3">
                  <AlertCircle size={36} className="mx-auto text-gray-300" />
                  <p className="font-black text-slate-700 text-sm">Hozircha ariza tushmagan</p>
                  <p className="text-xs text-gray-400 font-semibold">Ushbu loyihaga birinchilardan bo'lib o'z taklifingizni yuboring!</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SUBMIT BID FORM */}
          {activeTab === 'submit_bid' && (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div>
                <h4 className="font-black text-slate-800 text-base">Ushbu Loyihaga O'z Taklifingizni Yuboring</h4>
                <p className="text-xs font-semibold text-gray-400">Buyurtmachi uchun aniq narx va muddatni ko'rsating</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Sizning Narxingiz ($ USD)</label>
                  <input 
                    type="text" 
                    required 
                    value={bidAmount} 
                    onChange={e => setBidAmount(e.target.value)} 
                    placeholder="Masalan: $450" 
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-slate-800 outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Bajarish Muddati</label>
                  <input 
                    type="text" 
                    required 
                    value={bidDays} 
                    onChange={e => setBidDays(e.target.value)} 
                    placeholder="Masalan: 5 kun" 
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-slate-800 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Telegram Usernamingiz (Aloqa uchun)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-xs font-black text-[#229ED9]">@</span>
                  <input 
                    type="text" 
                    value={bidTelegram} 
                    onChange={e => setBidTelegram(e.target.value.replace('@', ''))} 
                    placeholder="masalan: dasturchi_uz" 
                    className="w-full pl-8 pr-4 py-3 rounded-2xl border border-gray-200 text-xs font-bold text-slate-800 outline-none focus:border-[#229ED9]"
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-semibold mt-1">Buyurtmachi Telegram orqali ham siz bilan bog'lanishi mumkin bo'ladi</p>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Cover Letter (Sizning taklifnomangiz)</label>
                <textarea 
                  required 
                  rows={5} 
                  value={bidProposal} 
                  onChange={e => setBidProposal(e.target.value)} 
                  placeholder="Buyurtmachiga nima uchun aynan siz ushbu vazifani eng sifatli bajara olishingiz va qanday tajribangiz borligini yozing..." 
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-xs font-semibold text-slate-800 outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="p-4 bg-slate-50 border border-gray-150 rounded-2xl flex items-center gap-3 text-xs text-slate-600 font-bold">
                <ShieldCheck size={20} className="text-green-600 shrink-0" />
                <span>Taklif yuborilgach, buyurtmachi siz bilan darhol intervyu va muloqot chatini ochishi mumkin.</span>
              </div>

              <button 
                type="submit" 
                disabled={!bidAmount || !bidDays || !bidProposal} 
                className="w-full py-4 bg-primary hover:bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Send size={16} /> Taklifni Yuborish
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
