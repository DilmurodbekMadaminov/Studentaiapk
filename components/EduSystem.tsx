
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { dbService } from '../services/dbService';
import { EduSubject } from '../types';
import { 
  User, BookOpen, Calendar, Star, FileText, CheckCircle2, 
  Clock, Download, LayoutGrid, MoreVertical, Upload, Users, CheckSquare
} from 'lucide-react';

export const EduSystem: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'info' | 'attendance' | 'grades' | 'schedule' | 'tasks'>('info');
  const [subjects, setSubjects] = useState<EduSubject[]>([]);
  
  const currentUser = dbService.getCurrentUser();

  useEffect(() => {
    const loadSubjects = async () => {
      const data = await dbService.getEduSubjects();
      setSubjects(data);
    };
    loadSubjects();
  }, []);

  if (!currentUser) return null;

  const refreshSubjects = async () => {
    const data = await dbService.getEduSubjects();
    setSubjects(data);
  };

  const handleHemisSync = async () => {
    try {
      const response = await fetch('/api/hemis/sync', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        refreshSubjects();
      }
    } catch (e) {
      alert("HEMIS bilan sinxronlashda xatolik yuz berdi");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24 md:pb-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-[#342E37] tracking-tight">Akademik Tizim (HEMIS)</h1>
        <button onClick={handleHemisSync} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-primary/20">
          <Download size={16} /> HEMIS bilan sinxronlash
        </button>
      </div>
      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 md:gap-10 items-center">
         <div className="relative group">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-primary to-blue-700 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-primary/30 group-hover:rotate-3 transition-transform duration-500">
               {currentUser.name?.[0]}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white shadow-md"></div>
         </div>
         
         <div className="flex-1 text-center md:text-left space-y-2">
            <h2 className="text-2xl md:text-4xl font-black text-[#342E37] tracking-tight">{currentUser.name}</h2>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{currentUser.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 mt-4">
               <Badge icon={<CheckSquare size={12}/>} label="ID: 3121921004" />
               <Badge icon={<LayoutGrid size={12}/>} label="Computer Science" />
               <Badge icon={<Users size={12}/>} label="Guruh: 211-19" />
               <Badge icon={<Star size={12}/>} label="GPA: 3.8" color="bg-blue-50 text-blue-600" />
            </div>
         </div>
         
         <div className="hidden lg:flex gap-2">
            <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all hover:scale-105">
               <Download size={20} />
            </button>
            <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all hover:scale-105">
               <MoreVertical size={20} />
            </button>
         </div>
      </div>

      <div className="flex gap-2 p-1 bg-white border border-gray-100 rounded-[1.5rem] w-full max-w-4xl overflow-x-auto no-scrollbar shadow-sm">
         <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')} icon={<User size={16}/>} label="Profil" />
         <TabButton active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} icon={<Calendar size={16}/>} label="Jadval" />
         <TabButton active={activeTab === 'grades'} onClick={() => setActiveTab('grades')} icon={<Star size={16}/>} label="Reyting" />
         <TabButton active={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} icon={<FileText size={16}/>} label="Topshiriqlar" />
         <TabButton active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={<CheckCircle2 size={16}/>} label="Davomat" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
         <div className="lg:col-span-3 space-y-6">
            {activeTab === 'info' && <PersonalInfoView />}
            {activeTab === 'schedule' && <ScheduleView />}
            {activeTab === 'grades' && <SubjectsTableView subjects={subjects} />}
            {activeTab === 'tasks' && <TasksView subjects={subjects} onRefresh={refreshSubjects} />}
            {activeTab === 'attendance' && <AttendanceStatsView subjects={subjects} />}
         </div>

         <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
               <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest">Akademik Holat</h3>
               <div className="space-y-4">
                  <StatusRow label="GPA" value="3.8" color="text-blue-600" />
                  <StatusRow label="Kreditlar" value="180 / 240" />
                  <StatusRow label="NB soat" value="12 soat" color="text-red-500" />
                  <StatusRow label="Sertifikatlar" value="4 ta" />
               </div>
               <button className="w-full py-4 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">
                  To'liq ma'lumotnoma
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

const Badge: React.FC<{ icon: React.ReactNode, label: string, color?: string }> = ({ icon, label, color }) => (
  <span className={`px-4 py-1.5 ${color || 'bg-gray-50 text-gray-500'} border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-2`}>
    {icon}
    {label}
  </span>
);

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 px-6 py-4 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
      active ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    {icon}
    {label}
  </button>
);

const StatusRow: React.FC<{ label: string, value: string, color?: string }> = ({ label, value, color }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
     <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{label}</span>
     <span className={`text-sm font-black ${color || 'text-[#342E37]'}`}>{value}</span>
  </div>
);

const PersonalInfoView = () => (
  <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-10">
     <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-[#342E37]">Shaxsiy ma'lumotlar</h3>
        <button className="text-primary font-black text-[10px] uppercase tracking-widest">Tahrirlash</button>
     </div>
     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        <InfoItem label="Pasport seriya" value="AA 1234567" />
        <InfoItem label="JSHSHIR" value="31215024560012" />
        <InfoItem label="Tug'ilgan sana" value="15.05.2002" />
        <InfoItem label="Millati" value="O'zbek" />
        <InfoItem label="Doimiy manzil" value="Toshkent shahri, Chilonzor tumani, 24-uy" />
        <InfoItem label="Telefon" value="+998 90 123 45 67" />
     </div>
  </div>
);

const InfoItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="space-y-1 border-l-2 border-gray-50 pl-4 hover:border-primary transition-colors">
     <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{label}</p>
     <p className="text-sm font-bold text-[#342E37]">{value}</p>
  </div>
);

const SubjectsTableView: React.FC<{ subjects: EduSubject[] }> = ({ subjects }) => (
  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
     <div className="p-8 border-b border-gray-50 flex justify-between items-center">
        <h3 className="text-xl font-black">Reyting Daftarchasi</h3>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">2025-2026 Bahorgi semestr</span>
     </div>
     <div className="overflow-x-auto">
        <table className="w-full text-left">
           <thead>
              <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest border-b border-gray-50">
                 <th className="p-8">Fan nomi</th>
                 <th className="p-8">Kredit</th>
                 <th className="p-8">Oraliq</th>
                 <th className="p-8">Yakuniy</th>
                 <th className="p-8 text-center">Natija</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-gray-50">
              {subjects.map(sub => (
                 <tr key={sub._id} className="text-sm hover:bg-gray-50 transition-all group">
                    <td className="p-8">
                       <p className="font-black text-[#342E37] group-hover:text-primary transition-colors">{sub.name}</p>
                       <p className="text-[10px] text-gray-400 font-bold">{sub.teacher}</p>
                    </td>
                    <td className="p-8 font-bold">{sub.credits}</td>
                    <td className="p-8 text-gray-400 font-bold">{sub.midtermGrade}</td>
                    <td className="p-8 text-gray-400 font-bold">{sub.finalGrade || '-'}</td>
                    <td className="p-8 text-center">
                       <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase ${sub.midtermGrade + (sub.finalGrade || 0) >= 60 ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                          {sub.midtermGrade + (sub.finalGrade || 0)}
                       </span>
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
     </div>
  </div>
);

const TasksView: React.FC<{ subjects: EduSubject[], onRefresh: () => void }> = ({ subjects, onRefresh }) => {
  const allAssignments = subjects.flatMap(s => s.assignments.map(a => ({ ...a, subjectName: s.name, subjectId: s._id })));

  const handleUpload = async (subId: string, asId: string) => {
    await dbService.submitAssignment(subId, asId);
    onRefresh();
  };

  return (
    <div className="space-y-6">
       {allAssignments.map(as => (
          <div key={as._id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all border-l-8 border-l-primary/10">
             <div className="space-y-2 text-center md:text-left">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">{as.subjectName}</p>
                <h4 className="text-lg font-black text-[#342E37]">{as.title}</h4>
                <div className="flex items-center gap-4 justify-center md:justify-start">
                   <span className="flex items-center gap-2 text-xs text-gray-400 font-bold"><Clock size={14}/> {as.deadline}</span>
                   <span className="flex items-center gap-2 text-xs text-gray-400 font-bold"><Star size={14}/> Max: {as.maxScore} ball</span>
                </div>
             </div>
             <div className="flex items-center gap-4">
                {as.status === 'pending' ? (
                   <button 
                    onClick={() => handleUpload(as.subjectId, as._id)}
                    className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                   >
                      <Upload size={16}/> Topshirish
                   </button>
                ) : (
                   <div className="flex items-center gap-2 px-8 py-4 bg-green-50 text-green-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest">
                      <CheckCircle2 size={16}/> {as.status === 'graded' ? `Baholandi: ${as.score}` : 'Yuborildi'}
                   </div>
                )}
                <button className="p-4 text-gray-400 hover:text-red-500 transition-colors">
                   <MoreVertical size={20}/>
                </button>
             </div>
          </div>
       ))}
    </div>
  );
};

const AttendanceStatsView: React.FC<{ subjects: EduSubject[] }> = ({ subjects }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
     {subjects.map(sub => {
        const perc = Math.round((sub.attendedHours / sub.totalHours) * 100);
        return (
          <div key={sub._id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
             <div className="flex justify-between items-start">
                <div>
                   <h4 className="font-black text-base text-[#342E37]">{sub.name}</h4>
                   <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Davomat foizi</p>
                </div>
                <span className={`text-xl font-black ${perc < 70 ? 'text-red-500' : 'text-green-500'}`}>{perc}%</span>
             </div>
             
             <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden shadow-inner">
                <div 
                   className={`h-full rounded-full transition-all duration-1000 ${perc < 70 ? 'bg-red-500' : 'bg-primary'}`}
                   style={{ width: `${perc}%` }}
                />
             </div>
             
             <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Darslar: {sub.attendedHours} / {sub.totalHours} soat</span>
                <span>Qoldirilgan NB: {sub.totalHours - sub.attendedHours} soat</span>
             </div>
          </div>
        );
     })}
  </div>
);

const ScheduleView = () => (
  <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
     <div className="p-8 border-b border-gray-50 flex justify-between items-center">
        <h3 className="text-xl font-black">Dars Jadvali</h3>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase">Kuzgi semestr</button>
           <button className="px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-[10px] font-black uppercase hover:bg-gray-100 transition-all">Bahorgi</button>
        </div>
     </div>
     <div className="divide-y divide-gray-50">
        <ScheduleRow time="08:30 - 09:50" subject="Dasturlash (Lab)" teacher="X. Karimov" room="301" type="Laboratoriya" />
        <ScheduleRow time="10:00 - 11:20" subject="Sun'iy Intellekt" teacher="Prof. Alimov" room="405" type="Ma'ruza" active />
        <ScheduleRow time="11:30 - 12:50" subject="Matematik Analiz" teacher="S. Ergashev" room="A-Blok" type="Amaliyot" />
        <ScheduleRow time="13:30 - 14:50" subject="Elektronika" teacher="M. Usmanov" room="102" type="Laboratoriya" />
     </div>
  </div>
);

const ScheduleRow: React.FC<{ time: string, subject: string, teacher: string, room: string, type: string, active?: boolean }> = ({ time, subject, teacher, room, type, active }) => (
  <div className={`p-8 flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${active ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}>
     <div className="flex items-center gap-8 w-full md:w-auto">
        <div className="text-xs font-black text-gray-400 w-28 text-center md:text-left">{time}</div>
        <div>
           <h4 className="font-black text-sm text-[#342E37]">{subject}</h4>
           <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-gray-400 font-bold">{teacher}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="text-[10px] text-primary font-black uppercase tracking-widest">{type}</span>
           </div>
        </div>
     </div>
     <div className="flex items-center gap-4 w-full md:w-auto justify-end">
        <div className="px-5 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-primary shadow-sm">{room} xona</div>
        {active && <span className="bg-green-500 w-3 h-3 rounded-full animate-ping"></span>}
     </div>
  </div>
);
