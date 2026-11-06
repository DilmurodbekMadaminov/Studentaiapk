import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Briefcase, Search, Filter, DollarSign, Clock, 
  ChevronRight, Star, CheckCircle, Sparkles, Send, 
  ShieldCheck, ArrowUpRight, TrendingUp, Globe, PlusCircle, User,
  MessageSquare, LayoutGrid, Award, MapPin, Mail, Phone
} from 'lucide-react';
import { FreelanceProject, FreelanceChatMessage, FreelanceBid, FreelanceChat } from '../types';
import { FreelanceChatView } from './FreelanceChatView';
import { FreelanceJobModal } from './FreelanceJobModal';

interface FreelanceHubProps {
  user?: any;
}

export const FreelanceHub: React.FC<FreelanceHubProps> = ({ user }) => {
  const { t } = useLanguage();
  const currentUser = user || { name: 'Mehmon Foydalanuvchi', email: 'guest@example.com' };

  const [activeTab, setActiveTab] = useState<'browse' | 'my_bids' | 'chats' | 'post_job' | 'profile'>('browse');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [listFilterQuery, setListFilterQuery] = useState('');
  const [projects, setProjects] = useState<FreelanceProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<FreelanceProject | null>(null);
  const [biddingProject, setBiddingProject] = useState<FreelanceProject | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidDays, setBidDays] = useState('');
  const [bidProposal, setBidProposal] = useState('');
  const [bids, setBids] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Real-time dynamic interview chats with bidders
  const [freelanceChats, setFreelanceChats] = useState<FreelanceChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isAiReplying, setIsAiReplying] = useState(false);
  const [postJobSubTab, setPostJobSubTab] = useState<'post' | 'my_jobs'>('post');

  // Chat Roles for Manual Chat conducting
  const [chatSenderRole, setChatSenderRole] = useState<'employer' | 'candidate'>('employer');

  // Expanded Job Creation Form State for All Professions
  const [selectedFormCategory, setSelectedFormCategory] = useState<string>('Web & IT Dasturlash');
  const [formSkills, setFormSkills] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formBudget, setFormBudget] = useState<string>('');
  const [formDeadline, setFormDeadline] = useState<string>('5 kun');
  const [formSubRole, setFormSubRole] = useState<string>('');
  const [formContractType, setFormContractType] = useState<string>('Frilans / Bir martalik');
  const [formLevel, setFormLevel] = useState<string>('Intermediate');
  const [formTelegram, setFormTelegram] = useState<string>('');
  const [isGeneratingSpec, setIsGeneratingSpec] = useState<boolean>(false);

  // Dynamic user profile states
  interface PortfolioItem {
    id: string;
    title: string;
    tech: string;
    desc: string;
  }
  
  interface UserProfile {
    name: string;
    role: string;
    location: string;
    rate: string;
    completedJobs: number;
    earnings: string;
    about: string;
    telegram?: string;
    skills: string[];
    portfolio: PortfolioItem[];
  }

  const [profile, setProfile] = useState<UserProfile>({
    name: currentUser.name || "Azizbek Dasturchi",
    role: "Full-Stack Web Developer | React & Node.js Expert",
    location: "Toshkent, O'zbekiston",
    rate: "$25.00/soat",
    completedJobs: 42,
    earnings: "$12,450",
    about: "Assalomu alaykum! Men 4 yillik tajribaga ega Full-Stack dasturchiman. Asosan React, Node.js va zamonaviy web texnologiyalaridan foydalanib murakkab tizimlarni quraman. Mijozlarimning talablarini aniq tushunish va ularga sifatli mahsulot yetkazib berish mening asosiy maqsadim.",
    telegram: "dasturchi_uz",
    skills: ["React", "Node.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "MongoDB", "Next.js"],
    portfolio: [
      { id: "p_1", title: "E-commerce Dashboard", tech: "React, Tailwind, Recharts", desc: "Sotuv tahlili va monitoringni amalga oshiruvchi interaktiv boshqaruv paneli." },
      { id: "p_2", title: "Smart Chatbot Web-App", tech: "Node.js, Express, Gemini API", desc: "Telegram bot va web interfeysi orqali mijozlarni qo'llab-quvvatlash tizimi." }
    ]
  });

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editRate, setEditRate] = useState('');
  const [editCompletedJobs, setEditCompletedJobs] = useState(42);
  const [editEarnings, setEditEarnings] = useState('');
  const [editAbout, setEditAbout] = useState('');
  const [editTelegram, setEditTelegram] = useState('');
  const [editSkills, setEditSkills] = useState('');

  // Portfolio addition states
  const [isAddPortfolioOpen, setIsAddPortfolioOpen] = useState(false);
  const [portTitle, setPortTitle] = useState('');
  const [portTech, setPortTech] = useState('');
  const [portDesc, setPortDesc] = useState('');

  const openEditProfile = () => {
    setEditName(profile.name);
    setEditRole(profile.role);
    setEditLocation(profile.location);
    setEditRate(profile.rate);
    setEditCompletedJobs(profile.completedJobs);
    setEditEarnings(profile.earnings);
    setEditAbout(profile.about);
    setEditTelegram(profile.telegram || '');
    setEditSkills(profile.skills.join(', '));
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = () => {
    const updated = {
      ...profile,
      name: editName,
      role: editRole,
      location: editLocation,
      rate: editRate,
      completedJobs: Number(editCompletedJobs) || 0,
      earnings: editEarnings,
      about: editAbout,
      telegram: editTelegram.replace('@', ''),
      skills: editSkills.split(',').map(s => s.trim()).filter(s => s.length > 0)
    };
    setProfile(updated);
    localStorage.setItem('freelance_profile', JSON.stringify(updated));
    setIsEditProfileOpen(false);
  };

  const handleAddPortfolio = () => {
    if (!portTitle.trim()) return;
    const item = {
      id: "port_" + Date.now(),
      title: portTitle,
      tech: portTech,
      desc: portDesc
    };
    const updated = {
      ...profile,
      portfolio: [...profile.portfolio, item]
    };
    setProfile(updated);
    localStorage.setItem('freelance_profile', JSON.stringify(updated));
    setPortTitle('');
    setPortTech('');
    setPortDesc('');
    setIsAddPortfolioOpen(false);
  };

  const handleDeletePortfolio = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = {
      ...profile,
      portfolio: profile.portfolio.filter(p => p.id !== id)
    };
    setProfile(updated);
    localStorage.setItem('freelance_profile', JSON.stringify(updated));
  };

  const defaultChats: FreelanceChat[] = [
    {
      id: "chat_demo_1",
      projectId: "p1",
      projectTitle: "React & Next.js orqali Elektron Do'kon platformasi",
      freelancerName: "Sardorbek Alimov",
      freelancerRole: "Senior Frontend Engineer",
      messages: [
        { id: "1", text: "Assalomu alaykum! Elektron do'kon loyihasi bo'yicha yuborgan taklifimni ko'rib chiqqaningiz uchun rahmat. Loyiha maketi Figmada tayyormi?", isSender: false, time: "10:42" },
        { id: "2", text: "Va alaykum assalom, ha, Figmada barcha mobil va desktop maketlarimiz to'liq tayyorlangan.", isSender: true, time: "10:45" },
        { id: "3", text: "Ajoyib! Unda men Next.js va Tailwind CSS yordamida responsive sahifalarni pixel-perfect qilib chiqaman va API integratsiyasini boshlayman.", isSender: false, time: "10:47" }
      ]
    },
    {
      id: "chat_demo_2",
      projectId: "p2",
      projectTitle: "Telegram-bot orqali AI Assistant va Mijozlar qo'llab-quvvatlash tizimi",
      freelancerName: "Zarina Umarova",
      freelancerRole: "Python Bot Developer",
      messages: [
        { id: "1", text: "Assalomu alaykum! Loyiha bo'yicha Gemini API kalitini o'zingiz taqdim qilasizlarmi yoki server burchimizga qo'shib ketaymi?", isSender: false, time: "Kecha" },
        { id: "2", text: "Salom Zarina. Biz o'zimizning Gemini API kalitimizni taqdim qilamiz, siz esa uni .env orqali havfsiz ishlatishingiz kerak bo'ladi.", isSender: true, time: "Kecha" }
      ]
    }
  ];

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChatId) return;
    handleRichSendMessage({ text: newMessage, isSender: chatSenderRole === 'employer' });
    setNewMessage('');
  };

  const handleRichSendMessage = (msgPayload: Partial<FreelanceChatMessage>) => {
    if (!activeChatId) return;
    const chatIndex = freelanceChats.findIndex(c => c.id === activeChatId);
    if (chatIndex === -1) return;

    const updatedChats = [...freelanceChats];
    if (Object.keys(msgPayload).length === 0) {
      // Just re-save state for reaction updates or status changes
      setFreelanceChats(updatedChats);
      localStorage.setItem('freelance_chats', JSON.stringify(updatedChats));
      return;
    }

    const isCurrentSenderEmployer = msgPayload.senderRole ? msgPayload.senderRole === 'employer' : (chatSenderRole === 'employer');

    const newMsg: FreelanceChatMessage = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      text: msgPayload.text || '',
      isSender: msgPayload.isSender ?? isCurrentSenderEmployer,
      senderRole: msgPayload.senderRole || (isCurrentSenderEmployer ? 'employer' : 'candidate'),
      senderName: msgPayload.senderName || (isCurrentSenderEmployer ? "Ish e'lon qilgan buyurtmachi" : freelanceChats[chatIndex].freelancerName),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: msgPayload.type || 'text',
      imageUrl: msgPayload.imageUrl,
      fileData: msgPayload.fileData,
      audioUrl: msgPayload.audioUrl,
      audioDuration: msgPayload.audioDuration,
      replyTo: msgPayload.replyTo,
      reactions: msgPayload.reactions,
      offerData: msgPayload.offerData,
      codeData: msgPayload.codeData,
      status: 'read'
    };

    updatedChats[chatIndex].messages.push(newMsg);
    setFreelanceChats(updatedChats);
    localStorage.setItem('freelance_chats', JSON.stringify(updatedChats));
  };

  const handleAcceptOfferInChat = (chatId: string, msgId: string) => {
    const updatedChats = freelanceChats.map(c => {
      if (c.id === chatId) {
        return {
          ...c,
          messages: c.messages.map(m => {
            if (m.id === msgId && m.offerData) {
              return {
                ...m,
                offerData: { ...m.offerData, status: 'accepted' as const }
              };
            }
            return m;
          })
        };
      }
      return c;
    });
    setFreelanceChats(updatedChats);
    localStorage.setItem('freelance_chats', JSON.stringify(updatedChats));
    alert("Taklif qabul qilindi va shartnoma tasdiqlandi! Escrow hisobi faollashtirildi.");
  };

  const startInterviewChat = (bid: any) => {
    const chatKey = `chat_${bid.id}`;
    let existingChat = freelanceChats.find(c => c.id === chatKey);
    
    if (!existingChat) {
      existingChat = {
        id: chatKey,
        projectId: bid.projectId,
        projectTitle: bid.projectTitle,
        freelancerName: bid.candidateName || bid.freelancerName || "Frilanser Dasturchi",
        freelancerRole: bid.candidateRole || "Tizim Muhandisi",
        messages: [
          {
            id: "msg_init_bid",
            text: `Mana mening taklifim: "${bid.proposal}". Agar loyihangiz ma'qul kelsa, batafsil qismlarni suhbat orqali kelishib olishimiz mumkin. Savollaringiz bormi?`,
            isSender: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
      
      const updatedChats = [...freelanceChats, existingChat];
      setFreelanceChats(updatedChats);
      localStorage.setItem('freelance_chats', JSON.stringify(updatedChats));
    }
    
    setActiveChatId(chatKey);
    setActiveTab('chats');
  };

  const handleUpdateBidStatus = async (bidId: string, newStatus: 'accepted' | 'rejected') => {
    const updatedBids = bids.map((b: any) => b.id === bidId ? { ...b, status: newStatus } : b);
    setBids(updatedBids);
    try {
      await fetch('/api/freelance/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBids)
      });
      alert(`Taklif muvaffaqiyatli ${newStatus === 'accepted' ? "qabul qilindi" : "rad etildi"}!`);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/freelance/jobs');
      const data = await res.json();
      if (data.length > 0) {
        setProjects(data);
      } else {
        const defaultJobs: FreelanceProject[] = [
          {
            id: 'p1',
            title: 'React & Next.js orqali Elektron Do\'kon platformasi',
            client: 'SmartRetail Group',
            budget: '$800 - $1500',
            category: 'Web & IT Dasturlash',
            deadline: '10 kun',
            level: 'Intermediate',
            description: 'Next.js va Tailwind CSS asosida zamonaviy elektron tijorat saytini yaratish. Mahsulotlar ro\'yxati, savatcha va buyurtma berish sahifalari mukammal ishlab chiqilgan bo\'lishi shart. API integratsiyasi qilinadi.',
            verified: true,
            skills: ['React', 'Next.js', 'TailwindCSS', 'TypeScript'],
            clientRating: 4.9,
            clientReviews: 24,
            postedAt: '1 soat oldin'
          },
          {
            id: 'p2',
            title: 'Telegram-bot orqali AI Assistant va Mijozlar qo\'llab-quvvatlash tizimi',
            client: 'AI Innovators Uzbekistan',
            budget: '$300 - $600',
            category: 'Mobil & Telegram Botlar',
            deadline: '4 kun',
            level: 'Intermediate',
            description: 'Python va aiogram yordamida Google Gemini API-ga ulangan aqlli Telegram bot ishlab chiqish kerak. Bot foydalanuvchilar savollariga aniq va tezkor javob berib, ma\'lumotlar bazasiga yozib borishi kerak.',
            verified: true,
            skills: ['Python', 'aiogram', 'Gemini API', 'PostgreSQL'],
            clientRating: 4.7,
            clientReviews: 8,
            postedAt: '3 soat oldin'
          },
          {
            id: 'p3',
            title: 'iOS & Android uchun Remote Flutter Taxi Ilovasi',
            client: 'YangiYol Taxi',
            budget: '$2000 - $4000',
            category: 'Mobil & Telegram Botlar',
            deadline: '1 oy',
            level: 'Expert',
            description: 'Flutter yordamida mijoz va haydovchi qismlariga ega bo\'lgan yagona taksi chaqirish mobil ilovasini yaratish. Xaritalar (Yandex/Google Maps) va real-vaqtda GPS kuzatuv tizimi integratsiya qilinadi.',
            verified: true,
            skills: ['Flutter', 'Dart', 'Google Maps', 'Firebase', 'WebSockets'],
            clientRating: 5.0,
            clientReviews: 42,
            postedAt: '1 kun oldin'
          },
          {
            id: 'p4',
            title: 'Fintex startapi uchun zamonaviy mobil UI/UX Dizayni',
            client: 'PayPulse Team',
            budget: '$400 - $800',
            category: 'UI/UX & Grafik Dizayn',
            deadline: '7 kun',
            level: 'Expert',
            description: 'Yangi moliyaviy ilovaning 15 ta asosiy ekranining UI/UX dizaynini Figma-da tayyorlash kerak. Foydalanuvchiga yoqimli, sodda va professional dizayn tizimi talab qilinadi.',
            verified: false,
            skills: ['Figma', 'UI/UX Design', 'Wireframing', 'Prototyping'],
            clientRating: 4.6,
            clientReviews: 12,
            postedAt: '2 kun oldin'
          },
          {
            id: 'p5',
            title: 'Python & LLM yordamida Hujjatlar va Hisobotlarni Avtomatik Tahlil qilish',
            client: 'DocuAI Labs',
            budget: '$1200 - $2500',
            category: 'AI, Data Science & Tahlil',
            deadline: '15 kun',
            level: 'Expert',
            description: 'LangChain va Google Gemini Pro API yordamida PDF hujjatlarini yuklab, ularni tahlil qiladigan va avtomatik qisqartirilgan xulosalarni tayyorlaydigan veb-tizim qurish lozim.',
            verified: true,
            skills: ['Python', 'FastAPI', 'Gemini API', 'LangChain', 'React'],
            clientRating: 4.8,
            clientReviews: 14,
            postedAt: '4 soat oldin'
          },
          {
            id: 'p6',
            title: 'Online Ta\'lim Platformasi uchun Kompleks SMM, Target Reklama va Brendlash',
            client: 'EduUp Agency',
            budget: '$350 - $700',
            category: 'SMM, Target & Marketing',
            deadline: '10 kun',
            level: 'Intermediate',
            description: 'Yangi yoshlar media akademiyasi dasturlari va kurslari uchun Facebook, Instagram va Telegram-da kreativ target reklama, haftalik postlar va vizual brendlash strategiyasini yo\'lga qo\'yish lozim.',
            verified: true,
            skills: ['SMM', 'Meta Ads Manager', 'Targeting', 'Graphic Design'],
            clientRating: 4.9,
            clientReviews: 31,
            postedAt: '5 soat oldin'
          },
          {
            id: 'p7',
            title: 'Texnik va Huquqiy Shartnomalarni Ingliz tilidan O\'zbek tiliga Tarjima qilish',
            client: 'GlobalTrade LLC',
            budget: '$200 - $450',
            category: 'Matn Yozish & Tarjimashunoslik',
            deadline: '5 kun',
            level: 'Intermediate',
            description: 'Xalqaro IT va eksport shartnomalarining 40 betlik texnik va yuridik matnlarini ingliz tilidan o\'zbek va rus tillariga professional darajada sohaviy atamalarni saqlagan holda tarjima qilish.',
            verified: true,
            skills: ['Ingliz tili', 'O\'zbek tili', 'Texnik Tarjima', 'Hujjatlar'],
            clientRating: 5.0,
            clientReviews: 19,
            postedAt: 'Bugun'
          },
          {
            id: 'p8',
            title: 'SAT Math va Oliy Matematika bo\'yicha Shaxsiy Online Repetitor',
            client: 'PrepAcademy Tashkent',
            budget: '$25.00/soat',
            category: 'Ta\'lim & Repetitorlik',
            deadline: '1 oy',
            level: 'Expert',
            description: 'AQSh universitetlariga topshirayotgan abituriyentlarga SAT Math va algebra bo\'yicha haftasiga 3 marta online intensiv darslar o\'tadigan tajribali repetitor/pedagog kerak.',
            verified: true,
            skills: ['Oliy Matematika', 'SAT Prep', 'IELTS 7.5+', 'Online Dars'],
            clientRating: 4.9,
            clientReviews: 15,
            postedAt: '6 soat oldin'
          },
          {
            id: 'p9',
            title: 'O\'rta Biznes uchun 1C Buxgalteriya va Yillik Soliq Auditi Hisoboti',
            client: 'Aziya Tekstil MCHJ',
            budget: '$500 - $1000',
            category: 'Buxgalteriya & Moliya',
            deadline: '10 kun',
            level: 'Expert',
            description: 'Tekstil ishlab chiqarish korxonasi uchun 1C Buxgalteriya 8.3 dasturida hisob-kitoblarni tartibga solish, moliyaviy balansi va yillik soliq hisobotlarini shakllantirish topshirig\'i.',
            verified: true,
            skills: ['1C Buxgalteriya', 'Soliq Hisoboti', 'MS Excel', 'Moliya Tahlili'],
            clientRating: 4.8,
            clientReviews: 27,
            postedAt: 'Kecha'
          },
          {
            id: 'p10',
            title: 'YouTube Kanal uchun Premiere Pro & After Effects Video Montaj va Motion Animatsiya',
            client: 'TechReview Media',
            budget: '$300 - $600',
            category: 'Video Montaj & 3D Animatsiya',
            deadline: '7 kun',
            level: 'Intermediate',
            description: 'Texnologiyalar va gadjetlar haqidagi YouTube kanali uchun 5 ta yuqori sifatli dinamik video montaj, titrlar va After Effects intro animatsiyasini tayyorlash kerak.',
            verified: true,
            skills: ['Adobe Premiere Pro', 'After Effects', 'Motion Graphics', 'Sound Design'],
            clientRating: 4.7,
            clientReviews: 9,
            postedAt: 'Kecha'
          },
          {
            id: 'p11',
            title: 'Zamonaviy Kottej Majmuasi uchun 3D Max Interyer Dizayni va Chizmalar',
            client: 'StroyModern Group',
            budget: '$700 - $1400',
            category: 'Muhandislik & Arxitektura',
            deadline: '12 kun',
            level: 'Expert',
            description: '2 qavatli kottej uyi uchun 3D Max (Corona Render) da fotorealistik interyer va fasad dizaynini hamda AutoCAD muhandislik chizmalarini ishlab chiqish.',
            verified: true,
            skills: ['AutoCAD', '3D Max', 'Corona Render', 'Interyer Dizayn'],
            clientRating: 5.0,
            clientReviews: 33,
            postedAt: '2 kun oldin'
          },
          {
            id: 'p12',
            title: 'Ombor Mahsulotlari va Narxlar Bazasini Excelga Kiritish (Data Entry)',
            client: 'OptomMarket MCHJ',
            budget: '$150 - $300',
            category: 'Data Entry & Virtual Yordamchi',
            deadline: '3 kun',
            level: 'Entry',
            description: 'Qog\'ozdagi va rasmlardagi 2000 ta mahsulot nomlari, kodlari hamda narxlarini Excel / Google Sheets jadvaliga xatosiz va tezkor kiritish topshirig\'i.',
            verified: true,
            skills: ['MS Excel', 'Google Sheets', 'Data Entry', 'Diqqatli Ish'],
            clientRating: 4.5,
            clientReviews: 5,
            postedAt: '3 kun oldin'
          },
          {
            id: 'p13',
            title: 'Raqamli Iqtisodiyot sohasida Bitiruv Malakaviy Ishi (BMI) Tahlili va Konsultatsiya',
            client: 'Toshkent Moliya Instituti Talabasi',
            budget: '$180 - $350',
            category: 'Ilmiy Ishlar & Akademik Yozuv',
            deadline: '10 kun',
            level: 'Expert',
            description: 'Raqamli bankchilik va fintech rivojlanishi mavzusidagi 60 betlik bitiruv malakaviy ishining 2-amaliy bobida ekonometrik modellardan foydalangan holda grafiklarni shakllantirish va tahlil qilishda akademik yordam.',
            verified: true,
            skills: ['Diplom Ishi', 'BMI', 'Ilmiy Maqola', 'Akademik Ingliz tili', 'SPSS / Stata'],
            clientRating: 5.0,
            clientReviews: 8,
            postedAt: '4 soat oldin'
          },
          {
            id: 'p14',
            title: 'C++ va Python bo\'yicha Ma\'lumotlar Tuzilmasi Universiteti Laboratoriya Ishi',
            client: 'TATU Talabalar Jamoasi',
            budget: '$50 - $120',
            category: 'Talabalar Uchun Topshiriqlar (Homework & Lab)',
            deadline: '2 kun',
            level: 'Intermediate',
            description: 'Binar qidiruv daraxtlari (BST) va graf algoritmlari bo\'yicha 3 ta universiteti laboratoriya topshirig\'ini C++ va Python tillarida kodlab, koddagi har bir funksiyaga tushunarli izohlar (comments) yozish.',
            verified: true,
            skills: ['C++', 'Python', 'Algoritmlar', 'Laboratoriya Ishi', 'Code Comments'],
            clientRating: 4.9,
            clientReviews: 11,
            postedAt: 'Bugun'
          },
          {
            id: 'p15',
            title: 'Scopus Jurnali uchun Ilmiy Maqolani Akademik Ingliz Tilida Tahrirlash (Proofreading)',
            client: 'O\'zMU Ilmiy Tadqiqotchi',
            budget: '$120 - $250',
            category: 'Ilmiy Ishlar & Akademik Yozuv',
            deadline: '5 kun',
            level: 'Expert',
            description: 'Sun\'iy intellektning tibbiy diagnostikadagi o\'rni haqidagi 12 betlik maqolani IEEE / Scopus talablariga muvofiq akademik ingliz tilida grammatik proofreading va LaTeX formatlash.',
            verified: true,
            skills: ['Scopus / WoS', 'LaTeX', 'Proofreading', 'Akademik Ingliz tili'],
            clientRating: 5.0,
            clientReviews: 22,
            postedAt: 'Kecha'
          }
        ];
        setProjects(defaultJobs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchBids();
    
    const saved = localStorage.getItem('freelance_chats');
    if (saved) {
      try {
        setFreelanceChats(JSON.parse(saved));
      } catch (e) {
        setFreelanceChats(defaultChats);
      }
    } else {
      setFreelanceChats(defaultChats);
    }

    const savedProfile = localStorage.getItem('freelance_profile');
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchBids = async () => {
    try {
      const res = await fetch('/api/freelance/bids');
      const data = await res.json();
      setBids(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = formTitle.trim() || "Topshiriq";
    const fullTitle = formSubRole.trim() ? `${title} (${formSubRole.trim()})` : title;
    
    const newJob = {
      title: fullTitle,
      category: selectedFormCategory,
      budget: formBudget.trim() || "$200 - $500",
      description: formDescription,
      client: 'Sizning kompaniyangiz',
      deadline: formDeadline || 'Kelishilgan',
      level: formLevel,
      jobType: formContractType,
      verified: true,
      skills: formSkills.split(',').map(s => s.trim()).filter(s => s.length > 0),
      contacts: {
        telegram: formTelegram.trim() || 'studentai_support'
      },
      postedAt: 'Hozirgina',
      clientRating: 5.0,
      clientReviews: 1,
      bidsCount: 0
    };

    try {
      const res = await fetch('/api/freelance/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob)
      });
      await res.json();

      alert("Ish e'loningiz muvaffaqiyatli chop etildi! Barcha mutaxassislar uchun ko'rinadi.");
      setFormTitle('');
      setFormDescription('');
      setFormBudget('');
      setFormSubRole('');
      setFormSkills('');
      fetchJobs();
      await fetchBids();
      setPostJobSubTab('my_jobs');
      setActiveTab('post_job');
    } catch (error) {
      alert("Xatolik yuz berdi");
    }
  };

  const submitBid = async () => {
    if (!biddingProject || !bidAmount || !bidDays || !bidProposal) return;
    try {
      await fetch('/api/freelance/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: biddingProject.id,
          projectTitle: biddingProject.title,
          amount: bidAmount,
          days: bidDays,
          proposal: bidProposal,
          status: 'pending',
          freelancerEmail: currentUser.email,
          freelancerName: profile.name,
          candidateName: profile.name,
          candidateRole: profile.role
        })
      });
      alert("Taklif yuborildi!");
      setBiddingProject(null);
      setBidAmount('');
      setBidDays('');
      setBidProposal('');
      fetchBids();
      setActiveTab('my_bids');
    } catch (error) {
      alert("Xatolik yuz berdi");
    }
  };

  const handleAiSpecGenerate = async () => {
    if (!formTitle.trim()) {
      alert("Iltimos, avval loyiha g'oyasi yoki sarlavhasini kiriting (Masalan: 'Ingliz tili tarjimoni kerak' yoki '1C Buxgalter').");
      return;
    }
    setIsGeneratingSpec(true);
    try {
      const res = await fetch('/api/freelance/ai/spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: formTitle })
      });
      const data = await res.json();
      if (data.description) setFormDescription(data.description);
      if (data.budget) setFormBudget(data.budget);
      if (data.deadline) setFormDeadline(data.deadline);
      if (data.skills && Array.isArray(data.skills)) setFormSkills(data.skills.join(', '));
      if (data.level) setFormLevel(data.level);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSpec(false);
    }
  };

  const categories = [
    'All',
    'Web & IT Dasturlash',
    'Mobil & Telegram Botlar',
    'UI/UX & Grafik Dizayn',
    'Matn Yozish & Tarjimashunoslik',
    'SMM, Target & Marketing',
    'Ta\'lim, Repetitorlik & O\'qish',
    'Ilmiy Ishlar & Akademik Yozuv',
    'Talabalar Uchun Topshiriqlar (Homework & Lab)',
    'Buxgalteriya & Moliya',
    'Video Montaj & 3D Animatsiya',
    'Ovoz Yozish & Audio Edit',
    'AI, Data Science & Tahlil',
    'Muhandislik & Arxitektura',
    'Data Entry & Virtual Yordamchi'
  ];

  const categorySkillPresets: Record<string, string[]> = {
    'Web & IT Dasturlash': ['React', 'Node.js', 'TypeScript', 'Next.js', 'Python', 'PostgreSQL', 'Tailwind CSS'],
    'Mobil & Telegram Botlar': ['Flutter', 'React Native', 'Swift', 'Kotlin', 'aiogram', 'Telegram API', 'Firebase'],
    'UI/UX & Grafik Dizayn': ['Figma', 'Adobe Photoshop', 'Illustrator', '3D Max', 'Logo Design', 'Branding', 'UI/UX'],
    'Matn Yozish & Tarjimashunoslik': ['Ingliz tili', 'O\'zbek tili', 'Rus tili', 'Texnik Tarjima', 'Kopirayting', 'Seo Text', 'Korrektura'],
    'SMM, Target & Marketing': ['Instagram Target', 'TikTok Content', 'Meta Ads', 'Telegram Channel', 'SEO', 'Canva', 'Copywriting'],
    'Ta\'lim, Repetitorlik & O\'qish': ['Oliy Matematika', 'SAT Prep', 'IELTS 7.5+', 'Fizika', 'Ingliz tili', 'Online Dars', 'Pedagogik Tajriba', 'CEFR C1', 'Taqdimot PPT'],
    'Ilmiy Ishlar & Akademik Yozuv': ['Diplom Ishi', 'BMI', 'Kurs Ishi', 'Ilmiy Maqola', 'Scopus / WoS', 'LaTeX', 'Akademik Ingliz tili', 'SPSS'],
    'Talabalar Uchun Topshiriqlar (Homework & Lab)': ['Matematika Masalalar', 'Fizika Laboratoriya', 'Python Lab', 'C++ Topshiriq', 'Kimyo Tenglama', 'Chizma GEOM', 'Taqdimot Design'],
    'Buxgalteriya & Moliya': ['1C Buxgalteriya', 'MS Excel', 'Soliq Hisoboti', 'Audit', 'Moliya Tahlili', 'Balans', 'Biznes Plan'],
    'Video Montaj & 3D Animatsiya': ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Motion Graphics', 'CapCut Pro', 'Sound Design'],
    'Ovoz Yozish & Audio Edit': ['Dublyaj', 'Audition', 'Logic Pro', 'Podkast Montaj', 'Ovoz Rejissori', 'FL Studio'],
    'AI, Data Science & Tahlil': ['Python', 'Pandas', 'Gemini API', 'Machine Learning', 'PowerBI', 'Data Scraping', 'Prompt Engineering'],
    'Muhandislik & Arxitektura': ['AutoCAD', '3D Max', 'Revit', 'Corona Render', 'Interyer Dizayn', 'Chizma Tahlili'],
    'Data Entry & Virtual Yordamchi': ['MS Excel', 'Google Sheets', 'Data Entry', 'Virtual Assistant', 'Matn Terish', 'Email Handling']
  };

  const filteredProjects = projects.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesHeroSearch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesListFilter = !listFilterQuery || 
      p.title.toLowerCase().includes(listFilterQuery.toLowerCase()) || 
      (p.skills && p.skills.some(skill => skill.toLowerCase().includes(listFilterQuery.toLowerCase())));
    return matchesCategory && matchesHeroSearch && matchesListFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatCard icon={<DollarSign className="text-green-500" />} label={t('earnings') || "Daromad"} value="$1,240.50" change="+12% bu hafta" />
         <StatCard icon={<Briefcase className="text-blue-500" />} label={t('activeJobs') || "Faol ishlar"} value="3 ta faol" change="2 ta topshirish arafasida" />
         <StatCard icon={<TrendingUp className="text-purple-500" />} label="Job Success Score" value="98%" change="Top Rated Freelancer" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1 bg-white border border-gray-100 rounded-[1.5rem] w-fit shadow-sm">
         <TabButton active={activeTab === 'browse'} onClick={() => setActiveTab('browse')} icon={<Search size={16}/>} label="Ish qidirish" />
         <TabButton active={activeTab === 'my_bids'} onClick={() => setActiveTab('my_bids')} icon={<Briefcase size={16}/>} label="Mening takliflarim" />
         <TabButton active={activeTab === 'chats'} onClick={() => setActiveTab('chats')} icon={<MessageSquare size={16}/>} label="Suhbatlar" badge={freelanceChats.length} />
         <TabButton active={activeTab === 'post_job'} onClick={() => setActiveTab('post_job')} icon={<PlusCircle size={16}/>} label="Ish e'lon qilish" />
         <TabButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={16}/>} label="Profil" />
      </div>

      {activeTab === 'browse' && (
        <>
          {/* Hero Search Section */}
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden shadow-2xl">
             <div className="relative z-10 space-y-6">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter">O'z bilimingizni <br/><span className="text-primary">daromadga aylantiring.</span></h2>
                <div className="flex flex-col md:flex-row gap-4 max-w-2xl">
                   <div className="flex-1 relative">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input 
                        type="text" 
                        placeholder="Loyihalarni qidirish (masalan: React, Python)..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 outline-none focus:ring-4 ring-primary/20 transition-all font-medium text-white placeholder:text-white/50"
                      />
                   </div>
                   <button className="px-8 py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-xl shadow-primary/20">
                      {t('findWork') || "Ish topish"}
                   </button>
                </div>
             </div>
             <Globe size={300} className="absolute -bottom-20 -right-20 text-white/5 rotate-12" />
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
             {/* Sidebar Filters */}
             <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                   <h3 className="font-black text-xs uppercase tracking-widest text-gray-400">Yo'nalishlar</h3>
                   <div className="space-y-2">
                      {categories.map(cat => (
                        <button 
                          key={cat} 
                          onClick={() => setActiveCategory(cat)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${activeCategory === cat ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                          {cat}
                          <ChevronRight size={14} className={activeCategory === cat ? 'opacity-100' : 'opacity-0'} />
                        </button>
                      ))}
                   </div>
                   
                   <div className="pt-4 border-t border-gray-100">
                      <h3 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-4">Tajriba darajasi</h3>
                      <div className="space-y-3">
                         {['Entry', 'Intermediate', 'Expert'].map(level => (
                           <label key={level} className="flex items-center gap-3 cursor-pointer group">
                              <div className="w-5 h-5 rounded border-2 border-gray-200 group-hover:border-primary flex items-center justify-center transition-colors"></div>
                              <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">{level}</span>
                           </label>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-[2.5rem] text-white shadow-xl space-y-4">
                   <Sparkles size={32} />
                   <h4 className="font-black text-lg">Proposal Student AI</h4>
                   <p className="text-[10px] font-medium leading-relaxed opacity-80 uppercase tracking-widest">Loyiha tavsifini bering, Student AI siz uchun eng yaxshi taklifnomani yozib beradi.</p>
                   <button className="w-full py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">
                      Yaratish
                   </button>
                </div>
             </div>

             {/* Project Feed */}
             <div className="lg:col-span-3 space-y-6">
                {/* Real-time Filter by Name or Skill */}
                <div className="bg-white p-4 px-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-3">
                   <Search className="text-gray-400 shrink-0" size={18} />
                   <input 
                     type="text"
                     placeholder="Loyiha nomi yoki ko'nikma (skill) bo'yicha saralash..."
                     value={listFilterQuery}
                     onChange={(e) => setListFilterQuery(e.target.value)}
                     className="w-full bg-transparent border-none outline-none text-sm font-semibold text-slate-800 placeholder:text-gray-400"
                   />
                   {listFilterQuery && (
                     <button 
                       onClick={() => setListFilterQuery('')}
                       className="text-xs text-gray-400 hover:text-gray-600 font-bold shrink-0 transition-colors"
                     >
                       Tozalash
                     </button>
                   )}
                </div>

                <div className="flex items-center justify-between">
                   <h3 className="font-black text-xl text-[#342E37]">{filteredProjects.length} ta loyiha topildi</h3>
                   <button className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-400 bg-white px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                      <Filter size={14} /> Eng yangilari
                   </button>
                </div>

                <div className="space-y-4">
                   {loading ? (
                     <div className="py-20 text-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>
                   ) : filteredProjects.map(project => (
                     <ProjectCard key={project.id} project={project} bids={bids} onBid={() => setBiddingProject(project)} onOpenDetails={() => setSelectedProjectForModal(project)} />
                   ))}
                   
                   {!loading && filteredProjects.length === 0 && (
                     <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                        <Briefcase className="mx-auto text-gray-200 mb-4" size={48} />
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Hech narsa topilmadi</p>
                     </div>
                   )}
                </div>
             </div>
          </div>
        </>
      )}

      {activeTab === 'my_bids' && (
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-[#342E37] mb-6">Mening Takliflarim</h3>
          {bids.filter(b => b.freelancerEmail === currentUser.email).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bids.filter(b => b.freelancerEmail === currentUser.email).map((bid: any, index: number) => (
                <div key={index} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-black text-lg text-[#342E37]">{bid.projectTitle || 'Loyiha nomi'}</h4>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      bid.status === 'accepted' ? 'bg-green-50 text-green-600 border border-green-100' :
                      bid.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                      'bg-orange-50 text-orange-600 border border-orange-100'
                    }`}>
                      {bid.status || 'Pending'}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs font-bold text-gray-500">
                    <span>Narx: <span className="text-primary">{bid.amount}</span></span>
                    <span>Muddat: <span className="text-primary">{bid.days}</span></span>
                  </div>
                  <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl italic line-clamp-3">"{bid.proposal}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm text-center">
              <Briefcase className="mx-auto text-gray-200 mb-4" size={48} />
              <h3 className="text-xl font-black text-[#342E37] mb-2">Sizning takliflaringiz</h3>
              <p className="text-gray-400 font-medium">Hozircha siz hech qanday loyihaga taklif yubormagansiz.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'post_job' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Subtabs for Post Job View */}
          <div className="flex justify-center gap-3 p-1.5 bg-gray-100 rounded-2xl w-fit mx-auto shadow-inner">
            <button 
              type="button"
              onClick={() => setPostJobSubTab('post')} 
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${postJobSubTab === 'post' ? 'bg-white text-slate-800 shadow-md' : 'text-gray-500 hover:text-slate-800'}`}
            >
              ✍️ Yangi e'lon yaratish
            </button>
            <button 
              type="button"
              onClick={() => setPostJobSubTab('my_jobs')} 
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${postJobSubTab === 'my_jobs' ? 'bg-white text-slate-800 shadow-md' : 'text-gray-500 hover:text-slate-800'}`}
            >
              💼 Mening e'lonlarim ({projects.filter(p => p.client === 'Sizning kompaningiz' || p.client === 'Sizning kompaniyangiz').length})
            </button>
          </div>

          {postJobSubTab === 'post' ? (
            <div className="bg-white p-6 md:p-10 rounded-[3rem] border border-gray-100 shadow-sm max-w-3xl mx-auto space-y-6 text-left">
              <div className="text-center space-y-2">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest inline-block">
                  🌐 Barcha Kasblar & Ta'lim Topshiriqlari Tizimi
                </span>
                <h3 className="text-2xl font-black text-[#342E37]">Yangi topshiriq yoki vakansiya e'lon qilish</h3>
                <p className="text-xs text-gray-400 font-bold tracking-wide max-w-lg mx-auto">
                  IT, O'qish & Akademik topshiriqlar, Tarjima, Buxgalteriya, Repetitorlik, Dizayn va barcha soha mutaxassislariga ish biriktiring.
                </p>
              </div>

              {/* Quick Academic & Study Templates Banner */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
                    🎓 Ta'lim & Akademik O'qish Topshiriqlari uchun Tezkor Andozalar:
                  </span>
                  <span className="text-[10px] text-indigo-500 font-bold">1-bosqichda to'ldirish</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormTitle("Bitiruv Malakaviy Ishi (BMI) / Diplom Ishi Konsultatsiyasi");
                      setSelectedFormCategory("Ilmiy Ishlar & Akademik Yozuv");
                      setFormSubRole("BMI / Akademik Ekspert");
                      setFormContractType("Akademik Yordam / Kurs Ishi");
                      setFormLevel("Expert");
                      setFormBudget("$150 - $350");
                      setFormDeadline("12 kun");
                      setFormSkills("Diplom Ishi, BMI, Ilmiy Maqola, Akademik Ingliz tili, SPSS");
                      setFormDescription("Iqtisodiyot yoki axborot texnologiyalari bo'yicha bitiruv malakaviy ishining amaliy qismini tahlil qilish, ekonometrik/grafik modellarni shakllantirish va plagiat darajasini tekshirib tahrirlashda yordam beruvchi mutaxassis kerak.");
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-900 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    🎓 Diplom / BMI Ishi
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormTitle("IELTS 7.5+ va SAT Math bo'yicha Shaxsiy Repetitor");
                      setSelectedFormCategory("Ta'lim, Repetitorlik & O'qish");
                      setFormSubRole("SAT & IELTS Repetitor");
                      setFormContractType("Imtihonga Tayyorgarlik / Repetitor");
                      setFormLevel("Expert");
                      setFormBudget("$20.00/soat");
                      setFormDeadline("1 oy");
                      setFormSkills("IELTS 7.5+, SAT Prep, Online Dars, Speaking Practice");
                      setFormDescription("AQSh va Yevropa universitetlariga kirish imtihonlariga tayyorlanayotgan o'quvchi uchun haftasiga 3 marta online intensiv Speaking, Writing va Math darslarini o'tadigan repetitor kerak.");
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-900 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    📚 SAT & IELTS Repetitor
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormTitle("Oliy Matematika va Matematik Analiz Masalalar Yechimi");
                      setSelectedFormCategory("Talabalar Uchun Topshiriqlar (Homework & Lab)");
                      setFormSubRole("Matematik Analiz Assistenti");
                      setFormContractType("Laboratoriya & Amaliyot");
                      setFormLevel("Intermediate");
                      setFormBudget("$40 - $100");
                      setFormDeadline("3 kun");
                      setFormSkills("Oliy Matematika, Matematik Analiz, Differensial Tenglamalar");
                      setFormDescription("Oliy matematika kursi bo'yicha differensial tenglamalar va karrali integrallar mavzusidagi 15 ta murakkab masalaning qadam-baqadam aniq yechimini PDF holatida tayyorlab berish.");
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-900 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    🧮 Oliy Matematika
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormTitle("C++ va Python bo'yicha Laboratoriya va Amaliy Ishlar");
                      setSelectedFormCategory("Talabalar Uchun Topshiriqlar (Homework & Lab)");
                      setFormSubRole("Dasturlash Laborant");
                      setFormContractType("Laboratoriya & Amaliyot");
                      setFormLevel("Intermediate");
                      setFormBudget("$50 - $120");
                      setFormDeadline("2 kun");
                      setFormSkills("C++, Python, Algoritmlar, Laboratoriya Ishi, Code Comments");
                      setFormDescription("Ma'lumotlar tuzilmasi (Data Structures) va graf algoritmlari bo'yicha universiteti laboratoriya topshirig'ini bajarish, har bir qatorga izohlar (comments) yozish va ishlashini tushuntirib berish.");
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-900 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    💻 Dasturlash Lab Ishi
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormTitle("Scopus / Xalqaro Maqolani Akademik Ingliz Tilida Tahrirlash");
                      setSelectedFormCategory("Ilmiy Ishlar & Akademik Yozuv");
                      setFormSubRole("Akademik Editor");
                      setFormContractType("Akademik Yordam / Kurs Ishi");
                      setFormLevel("Expert");
                      setFormBudget("$100 - $250");
                      setFormDeadline("5 kun");
                      setFormSkills("Scopus / WoS, LaTeX, Proofreading, Akademik Ingliz tili");
                      setFormDescription("Scopus jurnali uchun tayyorlangan 10 betlik ilmiy maqola matnini grammatik va style jihatdan akademik ingliz tili standartlariga muvofiq proofread va LaTeX tahrir qilish.");
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-900 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    📑 Scopus Proofread
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormTitle("Diplom Himoyasi va Ilmiy Taqdimot (PowerPoint / Canva)");
                      setSelectedFormCategory("Talabalar Uchun Topshiriqlar (Homework & Lab)");
                      setFormSubRole("Akademik Taqdimot Dizayneri");
                      setFormContractType("Frilans / Bir martalik");
                      setFormLevel("Intermediate");
                      setFormBudget("$30 - $80");
                      setFormDeadline("2 kun");
                      setFormSkills("Taqdimot PPT, Canva, Infografika, PowerPoint");
                      setFormDescription("Diplom va ilmiy maqola himoyasi uchun 20 slaydli yuqori visual sifatga ega PowerPoint taqdimotini va infografikalarni tayyorlash.");
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-600 hover:text-white border border-indigo-200 text-indigo-900 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    🎨 Akademik Taqdimot (PPT)
                  </button>
                </div>
              </div>

              <form className="space-y-6" onSubmit={handlePostJob}>
                {/* Title & AI Auto Generate */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400">
                      Loyiha nomi / Topshiriq sarlavhasi *
                    </label>
                    <button
                      type="button"
                      onClick={handleAiSpecGenerate}
                      disabled={isGeneratingSpec}
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isGeneratingSpec ? '⚡ AI Shartlarni tuzmoqda...' : '✨ AI bilan topshiriqni tayyorlash'}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none text-sm font-semibold transition-all"
                    placeholder="Masalan: Shartnomalarni ingliz tilidan o'zbek tiliga tarjima qilish / 1C Buxgalter kerak"
                  />
                </div>

                {/* Category & Sub Role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                      Soha / Kategoriya *
                    </label>
                    <select
                      value={selectedFormCategory}
                      onChange={(e) => setSelectedFormCategory(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:border-primary outline-none text-sm font-bold bg-gray-50/50"
                    >
                      {categories.filter(c => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                      Quyi Kasb / Yo'nalish Nomi
                    </label>
                    <input
                      type="text"
                      value={formSubRole}
                      onChange={(e) => setFormSubRole(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:border-primary outline-none text-sm font-semibold"
                      placeholder="Masalan: Ingliz tili tarjimoni, 1C Buxgalter, Motion Editor"
                    />
                  </div>
                </div>

                {/* Contract Type & Level */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                      Ish Turi
                    </label>
                    <select
                      value={formContractType}
                      onChange={(e) => setFormContractType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs font-bold"
                    >
                      <option value="Frilans / Bir martalik">Frilans / Bir martalik</option>
                      <option value="Akademik Yordam / Kurs Ishi">Akademik Yordam / Kurs Ishi</option>
                      <option value="Imtihonga Tayyorgarlik / Repetitor">Imtihonga Tayyorgarlik / Repetitor</option>
                      <option value="Laboratoriya & Amaliyot">Laboratoriya & Amaliyot</option>
                      <option value="Masofaviy Remote (Doimiy)">Masofaviy Remote (Doimiy)</option>
                      <option value="Soatbay Topshiriq">Soatbay Topshiriq</option>
                      <option value="Konsultatsiya & Maslahat">Konsultatsiya & Maslahat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                      Tajriba Darajasi
                    </label>
                    <select
                      value={formLevel}
                      onChange={(e) => setFormLevel(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs font-bold"
                    >
                      <option value="Entry">Boshlang'ich (Junior)</option>
                      <option value="Intermediate">O'rta (Middle)</option>
                      <option value="Expert">Ekspert (Senior)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                      Bajarilish Muddati
                    </label>
                    <input
                      type="text"
                      value={formDeadline}
                      onChange={(e) => setFormDeadline(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs font-semibold"
                      placeholder="3 kun, 1 hafta, 1 oy"
                    />
                  </div>
                </div>

                {/* Budget & Telegram */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                      Ajratilgan Budjet ($ yoki UZS da) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formBudget}
                      onChange={(e) => setFormBudget(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:border-primary outline-none text-sm font-semibold"
                      placeholder="Masalan: $200 - $450 yoki 2,500,000 UZS"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                      Telegram Usernamingiz (Nomzodlar aloqasi uchun)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-3.5 text-xs font-black text-[#229ED9]">@</span>
                      <input
                        type="text"
                        value={formTelegram}
                        onChange={(e) => setFormTelegram(e.target.value.replace('@', ''))}
                        className="w-full pl-8 pr-4 py-3.5 rounded-2xl border border-gray-200 focus:border-[#229ED9] outline-none text-sm font-semibold"
                        placeholder="masalan: buyurtmachi_uz"
                      />
                    </div>
                  </div>
                </div>

                {/* Skills & Presets */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    Talab qilinadigan ko'nikmalar hamda qurollar (vergul bilan)
                  </label>
                  <input
                    type="text"
                    value={formSkills}
                    onChange={(e) => setFormSkills(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:border-primary outline-none text-sm font-semibold mb-3"
                    placeholder="Masalan: 1C Buxgalteriya, MS Excel, Soliq Hisoboti..."
                  />

                  {/* Skill Preset Chips */}
                  {categorySkillPresets[selectedFormCategory] && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        💡 {selectedFormCategory} uchun tavsiya etilgan teglar:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {categorySkillPresets[selectedFormCategory].map((skill) => {
                          const isAlreadyAdded = formSkills.toLowerCase().includes(skill.toLowerCase());
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => {
                                if (isAlreadyAdded) return;
                                const updated = formSkills ? `${formSkills}, ${skill}` : skill;
                                setFormSkills(updated);
                              }}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                                isAlreadyAdded
                                  ? 'bg-primary/10 text-primary border-primary/20 cursor-default'
                                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200 cursor-pointer'
                              }`}
                            >
                              + {skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                    Loyiha / Topshiriq batafsil tavsifi *
                  </label>
                  <textarea
                    required
                    rows={5}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 focus:border-primary outline-none text-xs font-medium leading-relaxed"
                    placeholder="Frilanserdan kutilayotgan natijalar, ish tartibi, topshiriq hajmi va qo'shimcha shartlarni batafsil yozing..."
                  ></textarea>
                </div>

                {/* Escrow Banner */}
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 font-bold text-xs">
                    🛡️
                  </div>
                  <p className="text-xs text-emerald-800 font-medium leading-normal">
                    <strong className="font-bold">Escrow Xavfsiz To'lov:</strong> Mablag'laringiz faqat topshiriq to'liq bajarilib siz tomondan qabul qilingandan so'ng frilanser hamyoniga o'tkaziladi.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-primary/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  🚀 Topshiriqni e'lon qilish
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              {projects.filter(p => p.client === 'Sizning kompaningiz' || p.client === 'Sizning kompaniyangiz').length === 0 ? (
                <div className="bg-white p-12 rounded-[3rem] border border-gray-100 shadow-sm text-center max-w-xl mx-auto space-y-4">
                  <Briefcase className="mx-auto text-gray-200" size={56} />
                  <h3 className="text-xl font-black text-[#342E37]">E'lon qilingan ishlar mavjud emas</h3>
                  <p className="text-gray-400 text-sm font-medium">Siz hali biror marta ish e'lon qilmagansiz. Yangi ish e'lon yaratib, nomzodlarning kelgan ajoyib arizalarini intervyu qilishni boshlang!</p>
                  <button onClick={() => setPostJobSubTab('post')} className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-md">
                     Yangi e'lon yaratish
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {projects.filter(p => p.client === 'Sizning kompaningiz' || p.client === 'Sizning kompaniyangiz').map((job) => {
                     const jobBids = bids.filter((b: any) => b.projectId === job.id);
                     return (
                       <div key={job.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-150 shadow-sm space-y-6">
                         <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b border-gray-100">
                           <div className="text-left">
                             <div className="flex items-center gap-2 mb-1">
                               <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest rounded-md">{job.category}</span>
                               <span className="text-[10px] text-gray-400 font-bold">{job.postedAt || "Bugun"}</span>
                             </div>
                             <h4 className="text-xl font-black text-slate-800 leading-tight">{job.title}</h4>
                           </div>
                           <div className="text-left md:text-right shrink-0">
                             <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Taklif etilgan Budjet</p>
                             <p className="text-lg font-black text-primary">{job.budget}</p>
                           </div>
                         </div>

                         {/* Bidders List for this job */}
                         <div className="space-y-4 text-left">
                           <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                             👨💻 Nomzodlar arizalari ({jobBids.length} ta)
                           </h5>

                           {jobBids.length === 0 ? (
                             <p className="text-xs text-slate-400 italic bg-slate-50 p-4 rounded-xl text-center">Hozircha nomzodlar tomonidan taklif kelib tushmadi.</p>
                           ) : (
                             <div className="grid grid-cols-1 gap-4">
                               {jobBids.map((bid: any, idx: number) => (
                                 <div key={idx} className="bg-slate-50/50 p-5 rounded-2xl border border-gray-100 flex flex-col md:flex-row justify-between items-start gap-4 hover:border-blue-100 transition-colors">
                                   <div className="space-y-2 flex-1 min-w-0">
                                     <div className="flex items-center gap-2.5 flex-wrap">
                                       <span className="text-xl">👨💻</span>
                                       <div>
                                         <h6 className="font-extrabold text-sm text-slate-800 leading-tight">{bid.candidateName || bid.freelancerName || "Frilanser Dasturchi"}</h6>
                                         <p className="text-[10px] font-bold text-gray-400">{bid.candidateRole || "Dasturiy ta'minot muhandisi"}</p>
                                       </div>
                                       <span className="text-xs text-gray-300">|</span>
                                       <div className="flex items-center gap-3 text-xs font-extrabold text-[#342E37]">
                                         <span className="bg-teal-50 text-teal-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">{bid.amount}</span>
                                         <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">{bid.days}</span>
                                       </div>
                                       {bid.status && bid.status !== 'pending' && (
                                         <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${bid.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                           {bid.status === 'accepted' ? "Qabul qilindi" : "Rad etildi"}
                                         </span>
                                       )}
                                     </div>
                                     <p className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-gray-50 leading-relaxed font-semibold">"{bid.proposal}"</p>
                                   </div>

                                   <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto self-center">
                                     <button 
                                       onClick={() => startInterviewChat(bid)}
                                       className="flex-1 md:w-auto px-4 py-2.5 bg-slate-900 hover:bg-primary text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
                                     >
                                       <MessageSquare size={12} /> Suhbatlashish
                                     </button>
                                     <div className="flex gap-2">
                                       <button 
                                         onClick={() => handleUpdateBidStatus(bid.id, 'accepted')}
                                         disabled={bid.status === 'accepted'}
                                         className={`flex-1 px-3 py-2 border rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${bid.status === 'accepted' ? 'bg-green-150 border-green-200 text-green-700 scale-100' : 'bg-white hover:bg-green-50 text-green-600 border-green-100 active:scale-95'}`}
                                       >
                                         Qabul qilish
                                       </button>
                                       <button 
                                         onClick={() => handleUpdateBidStatus(bid.id, 'rejected')}
                                         disabled={bid.status === 'rejected'}
                                         className={`flex-1 px-3 py-2 border rounded-xl text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${bid.status === 'rejected' ? 'bg-red-150 border-red-200 text-red-700' : 'bg-white hover:bg-red-50 text-red-600 border-red-100 active:scale-95'}`}
                                       >
                                         Rad etish
                                       </button>
                                     </div>
                                   </div>
                                 </div>
                               ))}
                             </div>
                           )}
                         </div>
                       </div>
                     );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}


      {activeTab === 'chats' && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden min-h-[650px] flex flex-col md:flex-row">
          {/* Sidebar: Chat List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-slate-50/50 shrink-0">
            <div className="p-5 border-b border-gray-100 bg-white">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                  <MessageSquare className="text-primary" size={20} /> Suhbatlar
                </h3>
                <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded-full">
                  {freelanceChats.length} ta suhbat
                </span>
              </div>
            </div>

            {/* Chat items */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 max-h-[600px]">
              {freelanceChats.map((c) => {
                const isActive = (c.id === activeChatId) || (!activeChatId && c.id === freelanceChats[0]?.id);
                const lastMsg = c.messages[c.messages.length - 1];
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveChatId(c.id)}
                    className={`p-4 transition-all cursor-pointer flex gap-3 items-center ${
                      isActive ? 'bg-white border-l-4 border-l-primary shadow-sm' : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow-md">
                      {c.freelancerName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex justify-between items-center mb-0.5">
                        <h5 className="font-extrabold text-xs text-slate-800 truncate">{c.freelancerName}</h5>
                        <span className="text-[9px] font-bold text-gray-400 shrink-0">{lastMsg?.time || ''}</span>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 truncate mb-1">{c.freelancerRole}</p>
                      <p className="text-[11px] font-semibold text-slate-600 truncate">
                        {lastMsg ? lastMsg.text : "Suhbat boshlandi"}
                      </p>
                      <span className="inline-block mt-1 text-[8px] font-extrabold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/10 truncate max-w-full">
                        {c.projectTitle}
                      </span>
                    </div>
                  </div>
                );
              })}

              {freelanceChats.length === 0 && (
                <div className="p-8 text-center text-gray-400 font-medium text-xs">
                  Hozircha faol suhbatlar mavjud emas. Takliflar bo'limida "Suhbatlashish" tugmasini bosing.
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Conversation Panel */}
          <div className="flex-1 flex flex-col bg-slate-50/50 min-h-[600px]">
            {(() => {
              const activeChat = freelanceChats.find(c => c.id === activeChatId) || freelanceChats[0] || null;
              return activeChat ? (
                <FreelanceChatView
                  chat={activeChat}
                  onSendMessage={handleRichSendMessage}
                  onAcceptOffer={(chatId, msgId) => handleAcceptOfferInChat(chatId, msgId)}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400 space-y-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                    <MessageSquare size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Suhbatni tanlang</p>
                  <p className="text-xs max-w-sm">
                    Nomzodlar yoki ish e'lon qilgan mijozlar bilan muloqot qilish uchun chap tomondagi ro'yxatdan suhbatni tanlang.
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-8 text-left">
           {/* Profile Header */}
           <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
              <div className="px-10 pb-10 relative">
                 <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-xl absolute -top-16 flex items-center justify-center overflow-hidden">
                    <User size={64} className="text-gray-300" />
                 </div>
                 <div className="pt-20 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                       <h2 className="text-3xl font-black text-[#342E37]">{profile.name}</h2>
                       <p className="text-gray-500 font-medium mt-1">{profile.role}</p>
                       <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-bold text-gray-400">
                          <span className="flex items-center gap-1"><MapPin size={16} /> {profile.location}</span>
                          {profile.telegram && (
                            <a 
                              href={`https://t.me/${profile.telegram.replace('@', '')}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-1 bg-[#229ED9]/10 text-[#229ED9] rounded-lg text-xs font-black hover:bg-[#229ED9] hover:text-white transition-all"
                            >
                              <Send size={14} /> @{profile.telegram.replace('@', '')}
                            </a>
                          )}
                       </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                       {profile.telegram && (
                         <a
                           href={`https://t.me/${profile.telegram.replace('@', '')}?text=${encodeURIComponent(`Salom ${profile.name}! Siz bilan platforma orqali bog'lanmoqdaman.`)}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="px-6 py-3 bg-[#229ED9] hover:bg-[#1c8ec5] text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md flex items-center gap-2"
                         >
                           <Send size={14} /> Telegram Chat
                         </a>
                       )}
                       <button 
                         onClick={openEditProfile}
                         className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors cursor-pointer text-slate-700"
                       >
                          Profilni tahrirlash
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="space-y-8">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <h3 className="font-black text-lg text-[#342E37]">Statistika</h3>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center pb-4 border-b border-gray-50 block md:flex">
                          <span className="text-sm font-bold text-gray-500">Soatbay narx</span>
                          <span className="font-black text-[#342E37]">{profile.rate}</span>
                       </div>
                       <div className="flex justify-between items-center pb-4 border-b border-gray-50 block md:flex">
                          <span className="text-sm font-bold text-gray-500">Bajarilgan ishlar</span>
                          <span className="font-black text-[#342E37]">{profile.completedJobs} ta</span>
                       </div>
                       <div className="flex justify-between items-center pb-4 border-b border-gray-50 block md:flex">
                          <span className="text-sm font-bold text-gray-500">Umumiy daromad</span>
                          <span className="font-black text-[#342E37]">{profile.earnings}</span>
                       </div>
                    </div>
                 </div>

                 <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <h3 className="font-black text-lg text-[#342E37]">Ko'nikmalar</h3>
                    <div className="flex flex-wrap gap-2">
                       {profile.skills.map(skill => (
                         <span key={skill} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold text-gray-600 block">
                           {skill}
                         </span>
                       ))}
                       {profile.skills.length === 0 && (
                          <span className="text-xs text-gray-400 font-semibold italic">Hozircha ko'nikmalar qo'shilmagan</span>
                       )}
                    </div>
                 </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 space-y-8">
                 <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                    <h3 className="font-black text-lg text-[#342E37]">Men haqimda</h3>
                    <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
                       {profile.about || "O'zingiz haqingizda ma'lumot qoldiring..."}
                    </p>
                 </div>

                 <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <div className="flex justify-between items-center">
                       <h3 className="font-black text-lg text-[#342E37]">Portfolio</h3>
                       <button 
                         onClick={() => setIsAddPortfolioOpen(true)}
                         className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-1.5 cursor-pointer"
                       >
                          <PlusCircle size={12} /> Yangi qo'shish
                       </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {profile.portfolio.map((port) => (
                         <div key={port.id} className="group cursor-pointer bg-slate-50/50 p-5 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all relative flex flex-col justify-between">
                            <div>
                               <div className="flex justify-between items-start gap-2 mb-2">
                                  <h4 className="font-black text-[#342E37] group-hover:text-primary transition-colors text-base leading-tight break-words">{port.title}</h4>
                                  <button 
                                     onClick={(e) => handleDeletePortfolio(port.id, e)}
                                     title="O'chirish"
                                     className="text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                                  >
                                     ✕
                                  </button>
                               </div>
                               <p className="text-xs text-gray-500 font-semibold mb-3 leading-relaxed break-words">{port.desc || "Ushbu loyiha uchun qo'shimcha ma'lumot yo'q."}</p>
                            </div>
                            <span className="text-[10px] font-extrabold text-[#342E37] bg-white border border-gray-100 px-2.5 py-1 rounded-md self-start truncate max-w-full">
                               {port.tech}
                            </span>
                         </div>
                       ))}
                       {profile.portfolio.length === 0 && (
                          <div className="col-span-2 py-10 text-center border-2 border-dashed border-gray-150 rounded-2xl">
                             <p className="text-xs text-gray-400 font-semibold italic">Hech qanday portfolio ishlari yuklanmagan.</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>

           {/* Edit Profile Modal */}
           {isEditProfileOpen && (
             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full space-y-6 animate-fade-in max-h-[90vh] overflow-y-auto shadow-2xl">
                 <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                   <h3 className="text-xl font-black text-[#342E37]">Profil ma'lumotlarini tahrirlash</h3>
                   <button onClick={() => setIsEditProfileOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><PlusCircle className="rotate-45" size={24} /></button>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">To'liq ismingiz</label>
                     <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs font-bold text-slate-700" placeholder="Masalan: Sardor Alimov" />
                   </div>
                   <div>
                     <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Sohangiz / Mutaxassisligingiz</label>
                     <input type="text" value={editRole} onChange={e => setEditRole(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs font-bold text-slate-700" placeholder="Masalan: Lead Developer | React & Node.js" />
                   </div>
                   <div>
                     <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Manzil / Shahar</label>
                     <input type="text" value={editLocation} onChange={e => setEditLocation(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs font-bold text-slate-700" placeholder="Masalan: Toshkent, O'zbekiston" />
                   </div>
                   <div>
                     <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Soatbay ish haqi</label>
                     <input type="text" value={editRate} onChange={e => setEditRate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs font-bold text-slate-700" placeholder="Masalan: $25.00/soat" />
                   </div>
                   <div>
                     <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Bajarilgan ishlar soni</label>
                     <input type="number" value={editCompletedJobs} onChange={e => setEditCompletedJobs(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs font-bold text-slate-700" />
                   </div>
                   <div>
                     <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Umumiy daromad</label>
                     <input type="text" value={editEarnings} onChange={e => setEditEarnings(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs font-bold text-slate-700" placeholder="Masalan: $15k+" />
                   </div>
                   <div>
                     <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Telegram Usernamingiz</label>
                     <div className="relative">
                       <span className="absolute left-4 top-3 text-xs font-black text-[#229ED9]">@</span>
                       <input type="text" value={editTelegram} onChange={e => setEditTelegram(e.target.value.replace('@', ''))} className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#229ED9] outline-none text-xs font-bold text-slate-700" placeholder="masalan: dasturchi_uz" />
                     </div>
                   </div>
                 </div>

                 <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Ko'nikmalaringiz (vergul bilan ajrating)</label>
                   <input type="text" value={editSkills} onChange={e => setEditSkills(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs font-bold text-slate-700" placeholder="React, Node.js, TypeScript, Next.js, Docker" />
                 </div>

                 <div>
                   <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Men haqimda (Bio)</label>
                   <textarea value={editAbout} onChange={e => setEditAbout(e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs font-medium leading-relaxed text-slate-700" placeholder="Texnik tajribangiz va maqsadlaringiz haqida yozing..."></textarea>
                 </div>

                 <div className="flex gap-4 border-t border-gray-100 pt-4">
                   <button onClick={() => setIsEditProfileOpen(false)} className="flex-1 py-3 border border-gray-200 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all cursor-pointer">
                     Bekor qilish
                   </button>
                   <button onClick={handleSaveProfile} className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 cursor-pointer">
                     Saqlash
                   </button>
                 </div>
               </div>
             </div>
           )}

           {/* Add Portfolio Modal */}
           {isAddPortfolioOpen && (
             <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
               <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full space-y-6 animate-fade-in shadow-2xl">
                 <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                   <h3 className="text-xl font-black text-[#342E37]">Yangi Portfolio Ishi Qo'shish</h3>
                   <button onClick={() => setIsAddPortfolioOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><PlusCircle className="rotate-45" size={24} /></button>
                 </div>
                 
                 <div className="space-y-4">
                   <div>
                     <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Loyiha nomi</label>
                     <input type="text" value={portTitle} onChange={e => setPortTitle(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs font-bold text-slate-700" placeholder="Masalan: Kriptovalyuta birjasi sahifasi" required />
                   </div>
                   <div>
                     <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Texnologiyalar</label>
                     <input type="text" value={portTech} onChange={e => setPortTech(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs font-bold text-slate-700" placeholder="Masalan: Vue.js, Vuex, Tailwind CSS, Chart.js" />
                   </div>
                   <div>
                     <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Loyiha haqida tavsif</label>
                     <textarea value={portDesc} onChange={e => setPortDesc(e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs font-medium text-slate-700 leading-relaxed" placeholder="Loyiha maqsadi, imkoniyatlari va siz bajargan ishlar haqida qisqacha tavsif bering..."></textarea>
                   </div>
                 </div>

                 <div className="flex gap-4 border-t border-gray-100 pt-4">
                   <button onClick={() => setIsAddPortfolioOpen(false)} className="flex-1 py-3 border border-gray-200 text-slate-500 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all cursor-pointer">
                     Bekor qilish
                   </button>
                   <button 
                     onClick={handleAddPortfolio} 
                     disabled={!portTitle.trim()} 
                     className="flex-1 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer"
                   >
                     Qo'shish
                   </button>
                 </div>
               </div>
             </div>
           )}
        </div>
      )}

      {/* Detailed Job Modal */}
      {selectedProjectForModal && (
        <FreelanceJobModal 
          project={selectedProjectForModal}
          bids={bids}
          onClose={() => setSelectedProjectForModal(null)}
          onSubmitBid={(bidData) => {
            setBiddingProject(selectedProjectForModal);
            setBidAmount(bidData.amount);
            setBidDays(bidData.days);
            setBidProposal(bidData.proposal);
            submitBid();
            setSelectedProjectForModal(null);
          }}
          onStartChatWithBidder={(bid) => {
            setSelectedProjectForModal(null);
            startInterviewChat(bid);
          }}
        />
      )}

      {/* Bid Modal */}
      {biddingProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-[#342E37]">Taklif yuborish</h3>
              <button onClick={() => setBiddingProject(null)} className="text-gray-400 hover:text-gray-600"><PlusCircle className="rotate-45" /></button>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 mb-1">Loyiha:</p>
              <p className="text-lg font-black text-[#342E37]">{biddingProject.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Sizning narxingiz</label>
                <input type="text" value={bidAmount} onChange={e => setBidAmount(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm font-semibold" placeholder="Masalan: $300" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Muddat</label>
                <input type="text" value={bidDays} onChange={e => setBidDays(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm font-semibold" placeholder="Masalan: 3 kun" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Cover Letter (Taklifnoma)</label>
              <textarea value={bidProposal} onChange={e => setBidProposal(e.target.value)} required rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none text-xs font-semibold" placeholder="Nima uchun sizni tanlashlari kerak?"></textarea>
            </div>
            <button onClick={submitBid} disabled={!bidAmount || !bidDays || !bidProposal} className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-primary/20 disabled:opacity-50">
              Yuborish
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string, badge?: number }> = ({ active, onClick, icon, label, badge }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2.5 px-6 py-4 rounded-[1.2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer ${
      active ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' : 'text-gray-400 hover:text-gray-600'
    }`}
  >
    {icon}
    {label}
    {badge !== undefined && badge > 0 && (
      <span className={`px-2 py-0.5 text-[9px] rounded-full font-black ${active ? 'bg-white text-primary shadow-xs' : 'bg-primary/10 text-primary'}`}>
        {badge}
      </span>
    )}
  </button>
);

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string, change: string }> = ({ icon, label, value, change }) => (
  <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:scale-[1.02] transition-transform">
     <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-xl shadow-inner">
        {icon}
     </div>
     <div className="text-left">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
        <h4 className="text-2xl font-black text-[#342E37] tracking-tighter">{value}</h4>
        <p className="text-[10px] font-bold text-gray-400 mt-0.5">{change}</p>
     </div>
  </div>
);

const ProjectCard: React.FC<{ project: FreelanceProject, bids: any[], onBid: () => void, onOpenDetails: () => void }> = ({ project, bids, onBid, onOpenDetails }) => (
  <div onClick={onOpenDetails} className="group bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-primary/10 transition-all cursor-pointer relative overflow-hidden">
     <div className="flex flex-col md:flex-row justify-between md:items-start gap-6 relative z-10">
        <div className="flex-1 space-y-4 text-left">
           <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest rounded-lg border border-primary/10">{project.category}</span>
              <span className="px-3 py-1 bg-slate-50 text-gray-400 text-[9px] font-black uppercase tracking-widest rounded-lg border border-gray-100">{project.level}</span>
              {project.verified && <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-green-100"><ShieldCheck size={10}/> Ishonchli</span>}
              {project.postedAt && <span className="px-3 py-1 text-gray-400 text-[9px] font-black uppercase tracking-widest">{project.postedAt}</span>}
           </div>
           
           <div>
             <h4 className="text-xl md:text-2xl font-black text-[#342E37] group-hover:text-primary transition-colors tracking-tight leading-tight">{project.title}</h4>
             <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold text-gray-500">{project.client}</span>
                {project.clientRating !== undefined && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={12} className="fill-yellow-500" />
                    <span className="text-[10px] font-black">{project.clientRating}</span>
                    <span className="text-[10px] text-gray-400">({project.clientReviews})</span>
                  </div>
                )}
             </div>
           </div>

           <p className="text-sm text-gray-500 font-medium line-clamp-3 leading-relaxed">{project.description}</p>
           
           {project.skills && project.skills.length > 0 && (
             <div className="flex flex-wrap gap-2 pt-2">
                {project.skills.map(skill => (
                  <span key={skill} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded-md text-[10px] font-bold text-gray-500">{skill}</span>
                ))}
             </div>
           )}

           <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4 border-t border-gray-50">
              <span className="flex items-center gap-1.5"><DollarSign size={14} className="text-primary"/> {project.budget}</span>
              <span className="flex items-center gap-1.5"><Clock size={14}/> {project.deadline} qoldi</span>
              <span className="flex items-center gap-1.5"><CheckCircle size={14}/> {bids.filter(b => b.projectId === project.id).length} ta taklif</span>
           </div>
        </div>
        <div className="flex flex-row md:flex-col gap-3">
           <button onClick={(e) => { e.stopPropagation(); onBid(); }} className="flex-1 md:w-auto px-6 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-primary transition-all flex items-center justify-center gap-2 active:scale-95">
              Taklif berish <ArrowUpRight size={14} />
           </button>
           <a 
             href={`https://t.me/${(project.contacts?.telegram || 'studentai_support').replace('@', '')}?text=${encodeURIComponent(`Salom! Men "${project.title}" loyihangiz bo'yicha Student AI platformasidan yozmoqdaman.`)}`}
             target="_blank"
             rel="noopener noreferrer"
             onClick={(e) => e.stopPropagation()}
             className="px-4 py-3.5 bg-[#229ED9]/10 hover:bg-[#229ED9] text-[#229ED9] hover:text-white rounded-2xl transition-all flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider"
             title="Telegram-da bog'lanish"
           >
              <Send size={14} /> Telegram
           </a>
        </div>
     </div>
     <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-[3] transition-transform duration-700"></div>
  </div>
);
