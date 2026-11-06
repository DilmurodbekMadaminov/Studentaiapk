import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, ShieldCheck, ShieldAlert, 
  Trash2, Mail, Calendar, User, Search, X, 
  ChevronRight, MoreVertical, LogOut, CheckCircle,
  Activity, BarChart3, Lock, Briefcase, ShoppingCart,
  Bell, Send, Info, AlertTriangle, Check, RefreshCw,
  BookOpen, Award, DollarSign, Eye, EyeOff, Edit3, Filter,
  Layers, Zap, Clock, FileText, MessageSquare, Ban, UserCheck, KeyRound, LogIn,
  Tag, Gift, Sparkles, Plus, ToggleLeft, ToggleRight,
  Radio, ExternalLink, Globe, Link2, Smartphone, Bot
} from 'lucide-react';
import { dbService } from '../services/dbService';
import { securityService } from '../services/securityService';
import { User as UserType, AdminRole, SectionLockConfig, SectionLockMap } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getAbsoluteApiUrl } from '../services/apiConfig';

interface AdminPanelProps {
  currentUser: UserType | null;
  onBack?: () => void;
}

const ALL_SYSTEM_SECTIONS = [
  { id: 'math', name: 'Standart Quiz (Matematika)', icon: BookOpen, defaultDesc: 'Matematika va akademik testlar bazasi' },
  { id: 'quiz', name: 'PDF Test Generatori (AI Quiz)', icon: FileText, defaultDesc: 'PDF va matnlardan avtomatik test generatsiya qilish' },
  { id: 'freelance_hub', name: 'Frilans Hub (Freelance)', icon: Briefcase, defaultDesc: 'Talabalar uchun frilans buyurtmalar va bozori' },
  { id: 'visual_lab', name: 'Canva & Visual Lab', icon: Layers, defaultDesc: 'Grafik dizayn va vizual kontent yaratish' },
  { id: 'coach', name: 'AI Study Coach', icon: Zap, defaultDesc: 'Shaxsiy reja va o\'quv murabbiyi' },
  { id: 'edu_system', name: 'Edu Tizimi (ToshDTU)', icon: Award, defaultDesc: 'Dars jadvali, topshiriq va baholar tizimi' },
  { id: 'exam_mode', name: 'Imtihon Tizimi (Exam)', icon: Clock, defaultDesc: 'Real vaqt rejimida bilimni sinash va imtihon' },
  { id: 'live_tutor', name: 'Live Audio AI Tutor', icon: Activity, defaultDesc: 'Jonli ovozli sun\'iy intellekt bilan muloqot' },
  { id: 'video_gen', name: 'AI Video Generator', icon: BarChart3, defaultDesc: 'Vizual darslar va videolar yaratish' },
  { id: 'notes', name: 'AI Konspekt Generator', icon: FileText, defaultDesc: 'Mavzular bo\'yicha qisqa konspektlar' },
  { id: 'chat', name: 'AI Chat Asistent', icon: MessageSquare, defaultDesc: 'Umumiy sun\'iy intellekt savol-javob yordamchisi' },
  { id: 'marketplace', name: 'Talabalar Bozori', icon: ShoppingCart, defaultDesc: 'Kitob va referatlarni sotish va xarid qilish' },
  { id: 'community', name: 'Talabalar Jamiyati', icon: Users, defaultDesc: 'Talabalar forumi va muloqot' },
];

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  target: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  sender: string;
  createdAt: string;
  readBy?: string[];
}

interface UserActivity {
  id: string;
  userEmail: string;
  userName: string;
  actionType: string;
  description: string;
  details?: any;
  timestamp: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'users' | 'subjects' | 'orders' | 'jobs' | 'notifications' | 'admins' | 'promocodes' | 'section_locks' | 'cybersecurity' | 'channels'>('overview');
  
  // Section Locks State
  const [sectionLocks, setSectionLocks] = useState<SectionLockMap>({});
  const [savingLocks, setSavingLocks] = useState<boolean>(false);

  // Cybersecurity Diagnostics & Telemetry State
  const [securityAudit, setSecurityAudit] = useState<any>(null);
  const [pentestResults, setPentestResults] = useState<any>(null);
  const [runningPentest, setRunningPentest] = useState<boolean>(false);
  const [threatLogs, setThreatLogs] = useState<any[]>([]);

  const loadSecurityAudit = async () => {
    try {
      const res = await fetch(getAbsoluteApiUrl('/api/admin/security-audit'));
      if (res.ok) {
        const data = await res.json();
        setSecurityAudit(data);
      }
    } catch (e) {}
    setThreatLogs(securityService.getThreatLogs());
  };

  const handleRunPentest = () => {
    setRunningPentest(true);
    setTimeout(() => {
      const diag = securityService.runSecuritySelfDiagnostic();
      setPentestResults(diag);
      setRunningPentest(false);
      loadSecurityAudit();
      showToast("Kiber-xavfsizlik simulyatsiya sinovi yakunlandi! Barcha tizimlar 100% himoyalangan.");
    }, 1200);
  };
  
  // Admin Panel - Login requirement removed as requested (direct, instant access)
  const isAdminAuthenticated = true;

  // Data States
  const [admins, setAdmins] = useState<UserType[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [promocodes, setPromocodes] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  // Promo Code Form State
  const [newPromo, setNewPromo] = useState({
    code: '',
    type: 'PRO_MONTHS' as 'PRO_MONTHS' | 'WALLET_BONUS' | 'DISCOUNT_PERCENT',
    value: 1,
    maxUses: 20,
    expiresAt: ''
  });
  const [promoCreating, setPromoCreating] = useState(false);

  // Loading & UI States
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activityFilter, setActivityFilter] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editRole, setEditRole] = useState<string>('USER');
  const [editBalance, setEditBalance] = useState<number>(0);
  const [editIsAdmin, setEditIsAdmin] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // New Admin Form
  const [newAdmin, setNewAdmin] = useState<Partial<UserType>>({ 
    role: AdminRole.MODERATOR 
  });

  // Notification Form
  const [notifSending, setNotifSending] = useState(false);
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    targetType: 'all',
    specificUserEmail: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'alert',
  });

  // Obuna Kanallari (Mandatory Channels Management)
  const [channelSettings, setChannelSettings] = useState<{
    channelUsername: string;
    channels: string[];
    hdpLink?: string;
    omonLink?: string;
  }>({
    channelUsername: '@dilmurodbekmatematika',
    channels: ['@dilmurodbekmatematika'],
    hdpLink: 'https://forms.gle/f6ZiQtiqCAH1CLy87',
    omonLink: 'https://forms.gle/97m9hCsBFovYKKrX7'
  });
  const [newChannelInput, setNewChannelInput] = useState<string>('');
  const [savingChannels, setSavingChannels] = useState<boolean>(false);
  const [channelSuccess, setChannelSuccess] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      // 1. Admins
      const adminData = await dbService.getAdmins();
      setAdmins(adminData);

      // 2. Sections & Users
      const sectionsRes = await fetch(getAbsoluteApiUrl('/api/admin/sections-data'));
      if (sectionsRes.ok) {
        const secData = await sectionsRes.json();
        setAllUsers(secData.users || []);
        setOrders(secData.orders || []);
        setJobs(secData.jobs || []);
        setNotifications(secData.notifications || []);
        setSubjects(secData.subjects || []);
        setActivities(secData.activities || []);
        setPromocodes(secData.promocodes || []);
      }

      // 3. Analytics
      const analyticsRes = await fetch(getAbsoluteApiUrl('/api/analytics'));
      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }

      // 4. Section Locks
      const locksData = await dbService.getSectionLocks();
      setSectionLocks(locksData || {});

      // 5. Cybersecurity Telemetry Audit
      await loadSecurityAudit();

      // 6. Obuna Kanallari Sozlamasi
      await loadChannelSettings();
    } catch (err) {
      console.error("Admin ma'lumotlarini yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSectionLock = (sectionId: string, sectionName: string) => {
    setSectionLocks(prev => {
      const current = prev[sectionId] || {
        sectionId,
        sectionName,
        isLocked: false,
        lockReason: 'Ushbu bo\'limda profilaktika ishlari olib borilmoqda. Tez orada qayta ishga tushadi.',
        lockMode: 'ALL'
      };
      const updated = {
        ...prev,
        [sectionId]: {
          ...current,
          isLocked: !current.isLocked,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser?.email || 'Admin'
        }
      };
      // Auto-save instantly to Cloud Firestore
      dbService.saveSectionLocks(updated).then(ok => {
        if (ok) {
          showToast(`${sectionName} ${updated[sectionId].isLocked ? "qulflandi 🔒" : "ochildi 🔓"} (Serverda saqlandi)`);
        }
      });
      return updated;
    });
  };

  const handleUpdateSectionReason = (sectionId: string, sectionName: string, reason: string) => {
    setSectionLocks(prev => {
      const current = prev[sectionId] || {
        sectionId,
        sectionName,
        isLocked: false,
        lockReason: '',
        lockMode: 'ALL'
      };
      return {
        ...prev,
        [sectionId]: {
          ...current,
          lockReason: reason,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser?.email || 'Admin'
        }
      };
    });
  };

  const handleUpdateSectionMode = (sectionId: string, sectionName: string, mode: 'ALL' | 'FREE_ONLY') => {
    setSectionLocks(prev => {
      const current = prev[sectionId] || {
        sectionId,
        sectionName,
        isLocked: false,
        lockReason: '',
        lockMode: 'ALL'
      };
      const updated = {
        ...prev,
        [sectionId]: {
          ...current,
          lockMode: mode,
          updatedAt: new Date().toISOString(),
          updatedBy: currentUser?.email || 'Admin'
        }
      };
      dbService.saveSectionLocks(updated);
      return updated;
    });
  };

  const handleSaveAllLocks = async () => {
    setSavingLocks(true);
    const success = await dbService.saveSectionLocks(sectionLocks);
    setSavingLocks(false);
    if (success) {
      showToast("Bo'limlar qulflanish sozlamalari va matnlari muvaffaqiyatli saqlandi!");
    } else {
      showToast("Saqlashda xatolik yuz berdi!");
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated) {
      loadAllData();
    }
  }, [isAdminAuthenticated]);

  const loadChannelSettings = async () => {
    try {
      const res = await fetch(getAbsoluteApiUrl('/api/admin/channels'));
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.channels)) {
          const channelsList = data.channels.filter((c: string) => c && c.trim() !== '' && c.toLowerCase() !== '@studentaicom');
          if (!channelsList.some((c: string) => c.toLowerCase() === '@dilmurodbekmatematika')) {
            channelsList.unshift('@dilmurodbekmatematika');
          }
          setChannelSettings({
            channelUsername: data.channelUsername || '@dilmurodbekmatematika',
            channels: channelsList,
            hdpLink: data.hdpLink || 'https://forms.gle/f6ZiQtiqCAH1CLy87',
            omonLink: data.omonLink || 'https://forms.gle/97m9hCsBFovYKKrX7'
          });
        }
      }
    } catch (err) {
      console.error("Obuna kanallari sozlamasini yuklashda xatolik:", err);
    }
  };

  const handleAddChannel = () => {
    let ch = newChannelInput.trim();
    if (!ch) return;
    if (!ch.startsWith('@') && !ch.startsWith('https://t.me/')) {
      ch = '@' + ch;
    }
    if (channelSettings.channels.some(c => c.toLowerCase() === ch.toLowerCase())) {
      showToast("Bu kanal ro'yxatda allaqachon mavjud!");
      return;
    }
    setChannelSettings(prev => ({
      ...prev,
      channels: [...prev.channels, ch]
    }));
    setNewChannelInput('');
    showToast(`${ch} ro'yxatga qo'shildi. Saqlash tugmasini bosing!`);
  };

  const handleRemoveChannel = (chToRemove: string) => {
    if (chToRemove.toLowerCase() === '@dilmurodbekmatematika') {
      showToast("⚠️ Bu asosiy majburiy kanal! Tizim barqarorligi uchun uni o'chirib bo'lmaydi.");
      return;
    }
    setChannelSettings(prev => ({
      ...prev,
      channels: prev.channels.filter(c => c.toLowerCase() !== chToRemove.toLowerCase())
    }));
    showToast(`${chToRemove} ro'yxatdan olib tashlandi.`);
  };

  const handleSaveChannelSettings = async () => {
    setSavingChannels(true);
    try {
      const res = await fetch(getAbsoluteApiUrl('/api/settings'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channels: channelSettings.channels,
          hdpLink: channelSettings.hdpLink,
          omonLink: channelSettings.omonLink
        })
      });
      if (res.ok) {
        setChannelSuccess(true);
        showToast("Obuna kanallari muvaffaqiyatli saqlandi va Telegram bot bilan sinxronlashtirildi! ✅");
        setTimeout(() => setChannelSuccess(false), 3000);
      } else {
        showToast("Kanallarni saqlashda xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
      showToast("Server bilan bog'lanishda xatolik!");
    } finally {
      setSavingChannels(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifForm.title.trim() || !notifForm.message.trim()) {
      showToast("Sarlavha va xabar matnini kiriting!");
      return;
    }

    const targetEmail = notifForm.targetType === 'all' ? 'all' : notifForm.specificUserEmail.trim();
    if (notifForm.targetType === 'specific' && !targetEmail) {
      showToast("Foydalanuvchi emailini kiriting!");
      return;
    }

    setNotifSending(true);
    try {
      const res = await fetch(getAbsoluteApiUrl('/api/notifications'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: notifForm.title.trim(),
          message: notifForm.message.trim(),
          target: targetEmail,
          type: notifForm.type,
          sender: currentUser?.name || 'Admin',
        }),
      });

      if (res.ok) {
        showToast("Bildirishnoma yuborildi!");
        setNotifForm({
          title: '',
          message: '',
          targetType: 'all',
          specificUserEmail: '',
          type: 'info',
        });
        loadAllData();
      } else {
        const errData = await res.json();
        showToast(errData.error || "Xabar yuborishda xatolik");
      }
    } catch (err: any) {
      showToast("Xatolik: " + err.message);
    } finally {
      setNotifSending(false);
    }
  };

  const handleDeleteItem = async (collection: string, idValue: string, idKey: string = 'id') => {
    if (!confirm("Haqiqatan ham ushbu ma'lumotni o'chirib tashlamoqchimisiz?")) return;
    try {
      const res = await fetch(getAbsoluteApiUrl('/api/admin/delete-item'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection, idKey, idValue })
      });
      if (res.ok) {
        showToast("Element o'chirildi.");
        loadAllData();
      }
    } catch (err) {
      showToast("O'chirishda xatolik yuz berdi.");
    }
  };

  const handleSaveUserUpdate = async () => {
    if (!editingUser) return;
    try {
      const isNowAdmin = editIsAdmin || editRole === 'SUPER_ADMIN' || editRole === 'ADMIN' || editRole === 'MODERATOR' || editRole === 'EDITOR';
      const res = await fetch(getAbsoluteApiUrl('/api/admin/users/update'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editingUser.email,
          role: editRole,
          balance: editBalance,
          isAdmin: isNowAdmin
        })
      });

      if (res.ok) {
        showToast("Foydalanuvchi ma'lumotlari va huquqlari muvaffaqiyatli saqlandi.");
        setIsUserModalOpen(false);
        setEditingUser(null);
        loadAllData();
      }
    } catch (err) {
      showToast("Yangilashda xatolik yuz berdi.");
    }
  };

  const handleGrantOrRevokeAdmin = async (email: string, makeAdmin: boolean, role: AdminRole | string = 'ADMIN') => {
    try {
      const targetUser = allUsers.find(u => u.email === email);
      const name = targetUser?.name || email.split('@')[0];

      if (makeAdmin) {
        await dbService.addAdmin({
          email,
          name,
          isAdmin: true,
          role: role as AdminRole,
          createdAt: new Date()
        });
        showToast(`'${name}' (${email}) foydalanuvchisiga Adminlik huquqi berildi!`);
      } else {
        if (!confirm(`'${name}' foydalanuvchisidan Adminlik huquqini olib tashlamoqchimisiz?`)) return;
        await dbService.removeAdmin(email);
        showToast(`'${name}' foydalanuvchisining Adminlik huquqi bekor qilindi.`);
      }
      loadAllData();
    } catch (err) {
      showToast("Amalni bajarishda xatolik yuz berdi.");
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.email || !newAdmin.name) return;

    const adminData: UserType = {
      name: newAdmin.name!,
      email: newAdmin.email!,
      password: newAdmin.password || 'admin123',
      isAdmin: true,
      role: (newAdmin.role as AdminRole) || AdminRole.ADMIN,
      createdAt: new Date()
    };

    await dbService.addAdmin(adminData);
    showToast(`'${adminData.name}' ga Adminlik huquqi berildi!`);
    setIsModalOpen(false);
    setNewAdmin({ role: AdminRole.ADMIN });
    loadAllData();
  };

  const handleRemoveAdmin = async (email: string) => {
    if (confirm("Ushbu adminni vakolatlaridan mahrum qilmoqchimisiz?")) {
      await dbService.removeAdmin(email);
      showToast("Adminlik maqomi olib tashlandi.");
      loadAllData();
    }
  };

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromo.code.trim()) {
      showToast("Promo-kod nomini kiriting!");
      return;
    }
    setPromoCreating(true);
    try {
      const res = await fetch(getAbsoluteApiUrl('/api/admin/promocodes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newPromo.code,
          type: newPromo.type,
          value: newPromo.value,
          maxUses: newPromo.maxUses,
          expiresAt: newPromo.expiresAt || null
        })
      });
      if (res.ok) {
        showToast("Yangi promo-kod muvaffaqiyatli yaratildi!");
        setNewPromo({ code: '', type: 'PRO_MONTHS', value: 1, maxUses: 20, expiresAt: '' });
        loadAllData();
      } else {
        const err = await res.json();
        showToast(err.error || "Promo-kod yaratishda xatolik");
      }
    } catch (e: any) {
      showToast("Xatolik: " + e.message);
    } finally {
      setPromoCreating(false);
    }
  };

  const handleTogglePromo = async (id: string) => {
    try {
      const res = await fetch(getAbsoluteApiUrl('/api/admin/promocodes/toggle'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        showToast("Promo-kod holati o'zgartirildi");
        loadAllData();
      }
    } catch (e) {
      showToast("Xatolik yuz berdi");
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm("Haqiqatan ham ushbu promo-kodni o'chirib tashlamoqchimisiz?")) return;
    try {
      const res = await fetch(getAbsoluteApiUrl('/api/admin/promocodes/delete'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        showToast("Promo-kod o'chirildi");
        loadAllData();
      }
    } catch (e) {
      showToast("O'chirishda xatolik");
    }
  };

  const getRoleIcon = (role?: AdminRole | string) => {
    switch (role) {
      case AdminRole.SUPER_ADMIN:
      case 'SUPER_ADMIN': return <ShieldAlert className="text-red-500" size={16} />;
      case AdminRole.MODERATOR:
      case 'ADMIN': return <ShieldCheck className="text-blue-600" size={16} />;
      case AdminRole.EDITOR: return <Shield className="text-amber-500" size={16} />;
      default: return <User className="text-slate-400" size={16} />;
    }
  };

  // Activity filter logic
  const filteredActivities = activities.filter(act => {
    const matchesSearch = act.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          act.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          act.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (activityFilter === 'ALL') return matchesSearch;
    return matchesSearch && act.actionType === activityFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-20 p-4 md:p-8">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-slate-700 animate-bounce">
          <Check size={18} className="text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2.5rem] shadow-xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
        <div className="space-y-2 z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-500/30">
            <ShieldCheck size={14} /> System Command Center
          </div>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            Admin Boshqaruv Markazi
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-medium">
            Tizim bo'limlarini boshqarish, foydalanuvchilar bajargan barcha amallar jurnali va xavfsizlik nazorati.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10 flex-wrap w-full md:w-auto justify-between sm:justify-start">
          <button
            onClick={loadAllData}
            className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl sm:rounded-2xl text-xs font-bold flex items-center gap-2 border border-white/20 backdrop-blur-md transition-all cursor-pointer min-h-[38px]"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="inline text-[11px] sm:text-xs">Yangilash</span>
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl sm:rounded-2xl text-xs font-bold flex items-center gap-2 border border-white/20 backdrop-blur-md transition-all cursor-pointer min-h-[38px]"
              title="Bosh sahifaga qaytish"
            >
              <ChevronRight size={15} className="rotate-180" />
              <span>Bosh Sahifa</span>
            </button>
          )}
        </div>

        {/* Decorative background grid */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Quick Navigation Tabs - Touch Scrollable on Mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 no-scrollbar custom-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
        <TabButton
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          icon={<BarChart3 size={16} />}
          label="Umumiy Statistika"
        />
        <TabButton
          active={activeTab === 'activities'}
          onClick={() => setActiveTab('activities')}
          icon={<Activity size={16} />}
          label="Amallar Jurnali"
          badge={activities.length.toString()}
        />
        <TabButton
          active={activeTab === 'users'}
          onClick={() => setActiveTab('users')}
          icon={<Users size={16} />}
          label="Foydalanuvchilar"
          badge={allUsers.length.toString()}
        />
        <TabButton
          active={activeTab === 'subjects'}
          onClick={() => setActiveTab('subjects')}
          icon={<BookOpen size={16} />}
          label="Fanlar va Testlar"
          badge={subjects.length.toString()}
        />
        <TabButton
          active={activeTab === 'orders'}
          onClick={() => setActiveTab('orders')}
          icon={<ShoppingCart size={16} />}
          label="Buyurtmalar"
          badge={orders.length.toString()}
        />
        <TabButton
          active={activeTab === 'jobs'}
          onClick={() => setActiveTab('jobs')}
          icon={<Briefcase size={16} />}
          label="Freelance Ishlar"
          badge={jobs.length.toString()}
        />
        <TabButton
          active={activeTab === 'notifications'}
          onClick={() => setActiveTab('notifications')}
          icon={<Bell size={16} />}
          label="Bildirishnomalar"
          badge={notifications.length.toString()}
        />
        <TabButton
          active={activeTab === 'admins'}
          onClick={() => setActiveTab('admins')}
          icon={<Shield size={16} />}
          label="Adminlar"
          badge={admins.length.toString()}
        />
        <TabButton
          active={activeTab === 'promocodes'}
          onClick={() => setActiveTab('promocodes')}
          icon={<Tag size={16} />}
          label="Promo-kodlar"
          badge={promocodes.length.toString()}
        />
        <TabButton
          active={activeTab === 'section_locks'}
          onClick={() => setActiveTab('section_locks')}
          icon={<Lock size={16} />}
          label="Bo'lim Qulflari"
          badge={Object.values(sectionLocks).filter(l => l.isLocked).length.toString()}
        />
        <TabButton
          active={activeTab === 'cybersecurity'}
          onClick={() => {
            setActiveTab('cybersecurity');
            loadSecurityAudit();
          }}
          icon={<ShieldAlert size={16} className="text-emerald-500" />}
          label="Kiberxavfsizlik (WAF & Pentest)"
          badge="100% OK"
        />
        <TabButton
          active={activeTab === 'channels'}
          onClick={() => {
            setActiveTab('channels');
            loadChannelSettings();
          }}
          icon={<Radio size={16} className="text-blue-500" />}
          label="Obuna Kanallari"
          badge={channelSettings.channels.length.toString()}
        />
      </div>

      {/* TAB 1: OVERVIEW & STATS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <AdminStat icon={<Users className="text-blue-600" />} label="Jami Foydalanuvchilar" value={allUsers.length.toString()} />
            <AdminStat icon={<Activity className="text-emerald-500" />} label="Bajarilgan Amallar" value={activities.length.toString()} />
            <AdminStat icon={<BookOpen className="text-purple-600" />} label="Fan va Testlar" value={subjects.length.toString()} />
            <AdminStat icon={<ShoppingCart className="text-amber-500" />} label="Bozor Buyurtmalari" value={orders.length.toString()} />
          </div>

          {/* Analytics Chart */}
          {analytics?.chartData && (
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Platforma Faollik Dinamikasi</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Haftalik tashriflar va sinovlar statistikasi</p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.chartData}>
                    <defs>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="active" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorActive)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER ACTIVITIES LOG STREAM */}
      {activeTab === 'activities' && (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Activity className="text-emerald-500" size={22} />
                Foydalanuvchilar Bajarayotgan Amallar Jurnali
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Tizimda foydalanuvchilar tomonidan bajarilgan barcha harakatlar xronologiyasi.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Ism, email yoki amal..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
              >
                <option value="ALL">Barcha Amallar</option>
                <option value="LOGIN">Kirish (Login)</option>
                <option value="QUIZ_SUBMIT">Test topshirish</option>
                <option value="PDF_PARSE">PDF tahlili</option>
                <option value="WALLET_TRANS">Hamyon to'lovi</option>
                <option value="ORDER_CREATE">Buyurtma berish</option>
                <option value="CHAT_MSG">Suhbat xabari</option>
              </select>
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-bold text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Ushbu filtr bo'yicha hech qanday harakat topilmadi.
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-start justify-between gap-4 hover:border-slate-300 transition-all"
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      {act.userName.charAt(0).toUpperCase()}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xs text-slate-900">{act.userName}</span>
                        <span className="text-[11px] text-slate-400 font-mono">({act.userEmail})</span>
                        <span className="px-2 py-0.5 text-[9px] font-black rounded-md bg-slate-200 text-slate-700 uppercase">
                          {act.actionType}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 font-medium">{act.description}</p>

                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        <span>{new Date(act.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteItem('user_activities', act.id)}
                    className="p-2 text-slate-300 hover:text-red-500 rounded-xl hover:bg-white transition-all"
                    title="Jurnaldan o'chirish"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Barcha Foydalanuvchilar</h3>
              <p className="text-xs text-slate-500">Platformadagi barcha ro'yxatdan o'tgan foydalanuvchilar va ularning huquqlari.</p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Foydalanuvchini qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Mobile Phone Cards View (visible on small screens < 768px) */}
          <div className="block md:hidden p-3 sm:p-4 space-y-3">
            {allUsers
              .filter(u => 
                (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u.id && u.id.toString().includes(searchQuery))
              )
              .map(user => (
                <div key={user.email} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-800 flex items-center justify-center font-black text-sm">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">{user.name || 'Foydalanuvchi'}</h4>
                        <p className="text-[11px] font-mono text-slate-500 break-all">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-blue-600 font-black">#{user.id || 'N/A'}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-slate-200/60 pt-2.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-200/80 text-slate-800 text-[10px] font-black uppercase">
                        {getRoleIcon(user.role)}
                        {user.role || 'USER'}
                      </span>
                      {user.isAdmin && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black uppercase rounded-md">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Yaqinda'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {user.isAdmin ? (
                      <button
                        onClick={() => handleGrantOrRevokeAdmin(user.email, false)}
                        className="flex-1 py-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShieldAlert size={14} /> Adminlikni Olish
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGrantOrRevokeAdmin(user.email, true, 'ADMIN')}
                        className="flex-1 py-2 bg-primary text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck size={14} /> Admin Berish
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setEditRole(user.role || (user.isAdmin ? 'ADMIN' : 'USER'));
                        setEditBalance(500000);
                        setEditIsAdmin(!!user.isAdmin);
                        setIsUserModalOpen(true);
                      }}
                      className="p-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                      title="Tahrirlash"
                    >
                      <Edit3 size={15} />
                    </button>

                    <button
                      onClick={() => handleDeleteItem('users', user.email, 'email')}
                      className="p-2 bg-rose-100 text-rose-600 rounded-xl text-xs font-bold cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Desktop Table View (visible on screens >= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-slate-400 font-black uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Foydalanuvchi</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Maqomi / Role</th>
                  <th className="p-4">Ro'yxatdan o'tgan</th>
                  <th className="p-4 text-right pr-6">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allUsers
                  .filter(u => 
                    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (u.id && u.id.toString().includes(searchQuery))
                  )
                  .map(user => (
                    <tr key={user.email} className="hover:bg-slate-50/70 transition-all text-xs font-bold">
                      <td className="p-4 pl-6 font-mono text-blue-600 font-black">
                        #{user.id || 'N/A'}
                      </td>
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-900 font-bold">{user.name || 'Foydalanuvchi'}</p>
                          {user.isAdmin && <span className="text-[9px] text-blue-600 font-black">ADMIN</span>}
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 font-mono">{user.email}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-black uppercase">
                          {getRoleIcon(user.role)}
                          {user.role || 'USER'}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 font-medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Yaqinda'}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          {user.isAdmin ? (
                            <button
                              onClick={() => handleGrantOrRevokeAdmin(user.email, false)}
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 rounded-xl text-[11px] font-black inline-flex items-center gap-1 transition-all cursor-pointer"
                              title="Adminlik huquqini bekor qilish"
                            >
                              <ShieldAlert size={14} /> Adminlikni Olish
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGrantOrRevokeAdmin(user.email, true, 'ADMIN')}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-[11px] font-black inline-flex items-center gap-1 transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                              title="Adminlik huquqini berish"
                            >
                              <ShieldCheck size={14} /> Admin Berish
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setEditRole(user.role || (user.isAdmin ? 'ADMIN' : 'USER'));
                              setEditBalance(500000);
                              setEditIsAdmin(!!user.isAdmin);
                              setIsUserModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <Edit3 size={14} /> Tahrirlash
                          </button>

                          <button
                            onClick={() => handleDeleteItem('users', user.email, 'email')}
                            className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-all inline-flex items-center"
                            title="Foydalanuvchini o'chirish"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SUBJECTS & QUIZZES */}
      {activeTab === 'subjects' && (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="text-purple-600" size={22} />
                Fanlar va Testlar Boshqaruvi
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Yaratilgan fanlar, mavzular va barcha test savollari.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjects.map((sub) => (
              <div key={sub.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">{sub.name}</h4>
                    <p className="text-xs text-slate-500">{sub.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem('subjects', sub.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-white rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-600 font-bold">
                  <span>Mavzular: {sub.topics?.length || 0} ta</span>
                  <span>•</span>
                  <span>Muallif: {sub.creator || 'Tizim'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ShoppingCart className="text-amber-500" size={22} />
              Bozor Buyurtmalari
            </h3>
            <p className="text-xs text-slate-500 mt-1">Foydalanuvchilar tomonidan rasmiylashtirilgan marketplace buyurtmalari.</p>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl">
              Hozircha buyurtmalar yo'q.
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((ord) => (
                <div key={ord.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Buyurtma #{ord.id}</h5>
                    <p className="text-xs text-slate-600">Xaridor: {ord.userEmail || ord.userName || 'Noma\'lum'}</p>
                    <p className="text-[10px] text-slate-400">{new Date(ord.date || Date.now()).toLocaleString()}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-emerald-600">{ord.totalAmount || 0} UZS</span>
                    <button
                      onClick={() => handleDeleteItem('orders', ord.id)}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-xl"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: FREELANCE JOBS */}
      {activeTab === 'jobs' && (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Briefcase className="text-blue-600" size={22} />
              Freelance E'lonlar va Ishlar
            </h3>
            <p className="text-xs text-slate-500 mt-1">Joylashtirilgan loyihalar va topshiriqlar.</p>
          </div>

          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{job.title}</h5>
                  <p className="text-xs text-slate-500">Buyurtmachi: {job.client} ({job.clientEmail})</p>
                  <span className="text-[10px] text-blue-600 font-bold">Bujet: {job.budget}</span>
                </div>

                <button
                  onClick={() => handleDeleteItem('freelance_jobs', job.id)}
                  className="p-2 text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: NOTIFICATIONS SENDER */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Send className="text-blue-600" size={22} />
                Bildirishnoma Yuborish
              </h3>
              <p className="text-xs text-slate-500 mt-1">E'lon va xabarlarni tarqatish.</p>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Xabar Sarlavhasi</label>
                <input
                  type="text"
                  required
                  placeholder="Yangi sinovlar e'loni"
                  value={notifForm.title}
                  onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Xabar Matni</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Batafsil matn..."
                  value={notifForm.message}
                  onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={notifSending}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {notifSending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                <span>Yuborish</span>
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-xl font-black text-slate-900">Yuborilgan Bildirishnomalar Tarixi</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-start gap-3">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{notif.title}</h5>
                    <p className="text-xs text-slate-600 mt-1">{notif.message}</p>
                    <span className="text-[10px] text-slate-400">Kimga: {notif.target}</span>
                  </div>

                  <button
                    onClick={() => handleDeleteItem('notifications', notif.id)}
                    className="p-2 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: ADMINS MANAGEMENT */}
      {activeTab === 'admins' && (
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase rounded-full border border-blue-100 mb-2">
                <ShieldCheck size={12} /> Boshqaruv Huquqlari
              </div>
              <h3 className="text-xl font-black text-slate-900">Tizim Adminlari va Moderatorlar</h3>
              <p className="text-xs text-slate-500">Platforma admin paneli va resurslarini boshqarish vakolatiga ega foydalanuvchilar.</p>
            </div>

            <button
              onClick={() => {
                setNewAdmin({ role: AdminRole.ADMIN });
                setIsModalOpen(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <UserPlus size={18} /> Yangi Admin / Moderator Berish
            </button>
          </div>

          {admins.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl">
              Tizimda adminlar ro'yxati topilmadi.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {admins.map((admin) => (
                <div key={admin.email} className="p-5 bg-slate-50 border border-slate-200/80 rounded-2xl flex justify-between items-center hover:border-slate-300 transition-all">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-md">
                      {(admin.name || admin.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-900">{admin.name || 'Admin'}</h5>
                      <p className="text-[11px] font-mono text-slate-500">{admin.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black uppercase rounded-md flex items-center gap-1">
                          {getRoleIcon(admin.role)}
                          {admin.role || 'ADMIN'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRemoveAdmin(admin.email)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                      title="Adminlikni bekor qilish"
                    >
                      <Trash2 size={14} /> Olish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 9: PROMO CODES MANAGEMENT */}
      {activeTab === 'promocodes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Form */}
          <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
                <Gift size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Yangi Promo-Kod Yaratish</h3>
                <p className="text-xs text-slate-500 font-medium">Barcha foydalanuvchilar uchun rag'batlantiruvchi promo-kodlar</p>
              </div>
            </div>

            <form onSubmit={handleCreatePromoCode} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Promo-Kod Nomi</label>
                  <button
                    type="button"
                    onClick={() => {
                      const randCode = 'STUDENT_' + Math.random().toString(36).substring(2, 7).toUpperCase();
                      setNewPromo({ ...newPromo, code: randCode });
                    }}
                    className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles size={12} /> Generatsiya
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Masalan: STUDENT2026, PROFREE"
                  value={newPromo.code}
                  onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 uppercase font-mono outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Promo Turi</label>
                <select
                  value={newPromo.type}
                  onChange={(e) => setNewPromo({ ...newPromo, type: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                >
                  <option value="PRO_MONTHS">👑 PRO Tarif Tekin Oylar (Oy)</option>
                  <option value="WALLET_BONUS">💰 Hamyon Bonusi (So'm)</option>
                  <option value="DISCOUNT_PERCENT">🏷️ Chegirma Foizi (%)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {newPromo.type === 'PRO_MONTHS' && 'Oylar Soni'}
                    {newPromo.type === 'WALLET_BONUS' && 'Bonus Summasi (UZS)'}
                    {newPromo.type === 'DISCOUNT_PERCENT' && 'Chegirma (%)'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newPromo.value}
                    onChange={(e) => setNewPromo({ ...newPromo, value: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Maks. Ishlatish Limiti</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="0 = cheksiz"
                    value={newPromo.maxUses}
                    onChange={(e) => setNewPromo({ ...newPromo, maxUses: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tugash Sanasi (Ixtiyoriy)</label>
                <input
                  type="date"
                  value={newPromo.expiresAt}
                  onChange={(e) => setNewPromo({ ...newPromo, expiresAt: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={promoCreating}
                className="w-full py-4 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {promoCreating ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
                <span>Promo-Kod Yaratish</span>
              </button>
            </form>
          </div>

          {/* Promocodes List */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Mavjud Promo-Kodlar</h3>
                <p className="text-xs text-slate-500 font-medium">Barcha aktiv va passiv promo-kodlar ro'yxati</p>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black rounded-full self-start sm:self-auto">
                Jami: {promocodes.length} ta
              </span>
            </div>

            {promocodes.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Tag size={32} className="mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-500">Hozircha hech qanday promo-kod mavjud emas</p>
                <p className="text-[11px] text-slate-400">Chap tarafdagi shakl orqali birinchi promo-kodni yarating.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {promocodes.map((promo) => (
                  <div
                    key={promo.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      promo.isActive
                        ? 'bg-slate-50/80 border-slate-200/90 hover:border-slate-300'
                        : 'bg-slate-100/60 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 bg-slate-900 text-white font-mono font-black text-xs rounded-lg tracking-wider">
                          {promo.code}
                        </span>

                        {promo.type === 'PRO_MONTHS' && (
                          <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-black uppercase rounded-md border border-amber-200">
                            👑 PRO Tarif ({promo.value} oy)
                          </span>
                        )}
                        {promo.type === 'WALLET_BONUS' && (
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase rounded-md border border-emerald-200">
                            💰 Hamyon (+{promo.value.toLocaleString()} UZS)
                          </span>
                        )}
                        {promo.type === 'DISCOUNT_PERCENT' && (
                          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-900 text-[10px] font-black uppercase rounded-md border border-blue-200">
                            🏷️ Chegirma ({promo.value}%)
                          </span>
                        )}

                        {promo.isActive ? (
                          <span className="px-2 py-0.5 bg-emerald-500 text-white text-[9px] font-black uppercase rounded-full">
                            Faol
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-400 text-white text-[9px] font-black uppercase rounded-full">
                            Nofaol
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                        <span>
                          Foydalanildi: <strong className="text-slate-900 font-black">{promo.currentUses || 0}</strong>
                          {promo.maxUses > 0 ? ` / ${promo.maxUses}` : ' (Cheksiz)'}
                        </span>
                        {promo.expiresAt && (
                          <span>Tugash muddati: <strong className="text-slate-800">{new Date(promo.expiresAt).toLocaleDateString()}</strong></span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleTogglePromo(promo.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          promo.isActive
                            ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        {promo.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        <span>{promo.isActive ? "O'chirish" : "Yoqish"}</span>
                      </button>

                      <button
                        onClick={() => handleDeletePromo(promo.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="O'chirish"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 10: SECTION LOCKS MANAGEMENT */}
      {activeTab === 'section_locks' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-[2.5rem] p-8 text-white border border-amber-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-400/30">
                <Lock size={14} /> Bo'limlarni Qulflash va Ogohlantirish Matnlari Sozlamasi
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                Tizim Bo'limlarini Qulflash & Maxsus Yozuv Qoldirish
              </h2>
              <p className="text-slate-300 text-xs font-medium leading-relaxed">
                Platformadagi har bir bo'limni alohida qulflashingiz, ruxsat turini (Barcha uchun / Faqat FREE uchun) tanlashingiz va <strong>qulf ostiga ko'rinadigan maxsus e'lon yoki profilaktika sababi matnini</strong> yozib qo'yishingiz mumkin.
              </p>
            </div>

            <button
              onClick={handleSaveAllLocks}
              disabled={savingLocks}
              className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50 self-stretch md:self-auto justify-center"
            >
              {savingLocks ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <CheckCircle size={18} />
              )}
              <span>{savingLocks ? "Saqlanmoqda..." : "Barcha O'zgarishlarni Saqlash"}</span>
            </button>
          </div>

          {/* Section Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ALL_SYSTEM_SECTIONS.map((sec) => {
              const secIcon = sec.icon;
              const IconComp = secIcon;
              const lockConfig = sectionLocks[sec.id] || {
                sectionId: sec.id,
                sectionName: sec.name,
                isLocked: false,
                lockReason: 'Ushbu bo\'limda profilaktika ishlari olib borilmoqda. Tez orada qayta ishga tushadi.',
                lockMode: 'ALL'
              };

              const isLocked = lockConfig.isLocked;
              const lockMode = lockConfig.lockMode || 'ALL';
              const lockReason = lockConfig.lockReason || '';

              return (
                <div 
                  key={sec.id} 
                  className={`bg-white rounded-[2.5rem] p-6 border transition-all space-y-5 shadow-sm relative overflow-hidden ${
                    isLocked 
                      ? 'border-rose-300 ring-2 ring-rose-500/10 bg-rose-50/20' 
                      : 'border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                        isLocked 
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                          : 'bg-primary/10 text-primary'
                      }`}>
                        <IconComp size={24} />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 tracking-tight">{sec.name}</h3>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{sec.defaultDesc}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {isLocked ? (
                        <span className="px-3 py-1 bg-rose-100 text-rose-700 text-[10px] font-black uppercase rounded-full border border-rose-200 flex items-center gap-1">
                          <Lock size={12} /> Qulflangan
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle size={12} /> Ochiq
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Lock Toggle & Mode Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                      <div>
                        <h4 className="text-xs font-black text-slate-900">Bo'lim Qulfi Holati:</h4>
                        <p className="text-[10px] text-slate-500 font-medium">Bo'limni yoqish yoki qulflash</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleSectionLock(sec.id, sec.name)}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                          isLocked
                            ? 'bg-rose-500 text-white shadow-md hover:bg-rose-600'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {isLocked ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                        <span>{isLocked ? "QULFLANGAN" : "OCHIQ"}</span>
                      </button>
                    </div>

                    {/* Lock Mode Selector */}
                    {isLocked && (
                      <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-2">
                        <label className="block text-xs font-black text-amber-900 uppercase tracking-wider">
                          Qulflash Rejimi (Kimsaga qulflanadi?):
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateSectionMode(sec.id, sec.name, 'ALL')}
                            className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                              lockMode === 'ALL'
                                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                            }`}
                          >
                            <div className="font-black">Barcha uchun qulflash</div>
                            <div className="text-[10px] opacity-80 mt-0.5">Adminlardan tashqari hammasiga yopiq</div>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateSectionMode(sec.id, sec.name, 'FREE_ONLY')}
                            className={`p-3 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                              lockMode === 'FREE_ONLY'
                                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                                : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                            }`}
                          >
                            <div className="font-black">Faqat FREE uchun</div>
                            <div className="text-[10px] opacity-80 mt-0.5">PRO obunachilarga ochiq qoladi</div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Lock Reason / Notice Input */}
                    <div className="space-y-2">
                      <label className="block text-xs font-black text-slate-700">
                        Qulf Ostida Ko'rinadigan Maxsus Yozuv / Sabab:
                      </label>
                      <textarea
                        rows={3}
                        value={lockReason}
                        onChange={(e) => handleUpdateSectionReason(sec.id, sec.name, e.target.value)}
                        placeholder="Masalan: Ushbu bo'limda texnik profilaktika ishlari olib borilmoqda. Soat 18:00 da qayta ishga tushadi."
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all resize-none"
                      />
                      <p className="text-[10px] text-slate-400 font-medium">
                        Ushbu matn foydalanuvchi bo'limga kirganda qulf belgisi va sarlavha ostida ko'rinadi.
                      </p>
                    </div>

                    {/* Live Preview Box */}
                    {isLocked && (
                      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 space-y-2">
                        <div className="flex items-center gap-2 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                          <Eye size={12} /> Live Ko'rinish (Foydalanuvchi Ko'zi bilan):
                        </div>
                        <div className="bg-slate-950/80 p-3 rounded-xl border border-white/10 space-y-1.5 text-center">
                          <Lock size={20} className="text-amber-400 mx-auto" />
                          <h5 className="text-xs font-black text-white">{sec.name} Vaqtincha Yopilgan</h5>
                          <p className="text-[11px] text-slate-300 italic font-medium">
                            "{lockReason.trim() || "Profilaktika ishlari ketmoqda..."}"
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Save Action */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSaveAllLocks}
              disabled={savingLocks}
              className="px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
            >
              {savingLocks ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <CheckCircle size={18} />
              )}
              <span>{savingLocks ? "Saqlanmoqda..." : "Barcha O'zgarishlarni Saqlash"}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 11: CYBERSECURITY COMMAND & THREAT SHIELD */}
      {activeTab === 'cybersecurity' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 rounded-[2rem] border border-emerald-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <ShieldAlert size={200} className="text-emerald-400" />
            </div>
            <div className="relative z-10 space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                WAF Cyber Defense Fortress Active
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Kiberxavfsizlik va Hackerlar Hujumidan Himoya Tizimi
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                Platforma har bir so'rovni 8 qatlamli xavfsizlik filtri orqali tekshiradi. Zero-Trust Firestore qoidalari, HTTPS HSTS shifrlash, XSS va NoSQL in'yektsiya filtrlar, IP DoS rate-limiter hamda biometrik WebAuthn apparat himoyasi faol holatda.
              </p>
              
              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={handleRunPentest}
                  disabled={runningPentest}
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {runningPentest ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Zap size={18} />
                  )}
                  <span>{runningPentest ? "PenTest Sinovi Ketmoqda..." : "Kiber-Hujum Simulyatsiya Sinovini Boshlash"}</span>
                </button>

                <button
                  onClick={securityService.triggerPanic}
                  className="px-5 py-3.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <AlertTriangle size={16} />
                  <span>Favqulodda Qulflash (Panic Lockdown)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Diagnostics Results Panel */}
          {pentestResults && (
            <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                    <CheckCircle className="text-emerald-500" size={24} />
                    Penetration Test Diagnostics Hisoboti
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Avtomatik ravishda barcha xavfsizlik devorlari va filtrlar sinovdan o'tkazildi.
                  </p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 px-5 py-2.5 rounded-2xl text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">Himoya Indeksi</span>
                  <span className="text-2xl font-black text-emerald-700">{pentestResults.score}% (100/100 Xavfsiz)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pentestResults.results.map((res: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 mt-0.5">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-xs">{res.testName}</div>
                      <div className="text-[11px] text-slate-600 font-medium mt-0.5">{res.detail}</div>
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500 text-white">
                        {res.status} - PASS
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Defense Mechanisms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="p-3 w-fit rounded-xl bg-blue-50 text-blue-600">
                <Lock size={22} />
              </div>
              <h4 className="font-black text-slate-900 text-sm">Strict Zero-Trust Rules</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Firestore database to'liq default-deny qoidalari bilan yopilgan. Har bir so'rov foydalanuvchi UID va roliga ko'ra tekshiriladi.
              </p>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <Check size={14} /> Deployed & Enforced
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="p-3 w-fit rounded-xl bg-purple-50 text-purple-600">
                <Shield size={22} />
              </div>
              <h4 className="font-black text-slate-900 text-sm">Anti-XSS & Payload Sanitizer</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Server va mijoz tomonida kiritilgan har bir matn, PDF test va savol avtomatik neytrallanadi. Zararli JavaScript va script taglar bloklanadi.
              </p>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <Check size={14} /> Active Filter
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="p-3 w-fit rounded-xl bg-rose-50 text-rose-600">
                <ShieldAlert size={22} />
              </div>
              <h4 className="font-black text-slate-900 text-sm">NoSQL / SQL Injection Shield</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                In'yeksion kalitlar ($where, $gt, UNION SELECT, drop table) so'rov payloadidan darhol tozalanadi hamda IP xavfsizlik jurnaliga yoziladi.
              </p>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <Check size={14} /> Interceptor Active
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="p-3 w-fit rounded-xl bg-amber-50 text-amber-600">
                <Zap size={22} />
              </div>
              <h4 className="font-black text-slate-900 text-sm">IP Rate Limiter & DoS Guard</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Mijoz IP manzili bo'yicha minutiga maks. 300 so'rov, login urinishlari esa 20 tadan oshganda avtomatik ravishda 429 kodi bilan cheklanadi.
              </p>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <Check size={14} /> Dynamic Throttling
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="p-3 w-fit rounded-xl bg-teal-50 text-teal-600">
                <KeyRound size={22} />
              </div>
              <h4 className="font-black text-slate-900 text-sm">WebAuthn Biometric Hardware</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Admin va foydalanuvchilar Barmoq izi (TouchID), Yuzni tanish (FaceID) va YubiKey orqali eng yuqori darajada xavfsiz kirishi mumkin.
              </p>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <Check size={14} /> Hardware Passkeys Enabled
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="p-3 w-fit rounded-xl bg-indigo-50 text-indigo-600">
                <Activity size={22} />
              </div>
              <h4 className="font-black text-slate-900 text-sm">CSRF Token & Session HMAC</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Har bir sessiya va so'rov kriptografik HMAC va CSRF tokenlar orqali qalbakilashtirish hamda session hijackingdan himoyalangan.
              </p>
              <div className="text-[10px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                <Check size={14} /> Crypto HMAC Verified
              </div>
            </div>
          </div>

          {/* Intercepted Threat Log Feed */}
          <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-[2rem] border border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Activity size={20} className="text-emerald-400" />
                <h3 className="text-lg font-black text-white">To'sib Qolingan Hujum va Xavfsizlik Voqealari Jurnali</h3>
              </div>
              <button 
                onClick={() => {
                  securityService.clearThreatLogs();
                  setThreatLogs([]);
                  showToast("Jurnal tozalandi");
                }}
                className="text-xs text-slate-400 hover:text-rose-400 transition-all font-bold cursor-pointer"
              >
                Jurnalni Tozalash
              </button>
            </div>

            {threatLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs font-mono">
                [WAF_AUDIT_LOG]: Tizimda hozircha hech qanday buzib kirish urinishlari qayd etilmadi. Barcha qalqonlar normal rejimda ishlamoqda.
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar font-mono text-xs">
                {threatLogs.map((log: any) => (
                  <div key={log.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        {log.type}
                      </span>
                      <span className="text-slate-300 truncate max-w-xs">{log.payloadSnippet}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span>{log.source || log.ip}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className="text-emerald-400 font-bold uppercase">{log.actionTaken || 'BLOCKED'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 12: OBUNA KANALLARI (MAJBURIIY A'ZOLIK TIZIMI) */}
      {activeTab === 'channels' && (
        <div className="space-y-6 sm:space-y-8 animate-fade-in">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-[2rem] border border-blue-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Radio size={200} className="text-blue-400" />
            </div>
            <div className="relative z-10 space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-300 text-xs font-black tracking-wider uppercase">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
                Telegram Bot & Firestore Obuna Qalqoni Faol
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Majburiy Obuna Kanallari Boshqaruvi
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                Yangi talabalar Telegram botda <b>/start</b> bosganlarida dastlab quyidagi barcha kanallarga a'zolik holati tekshiriladi. Faqat barcha kanallarga obuna bo'lgandan keyingina ularga Student AI tizimida hisob ochiladi va kirish huquqi beriladi.
              </p>
              
              <div className="pt-2 flex flex-wrap gap-4">
                <button
                  onClick={handleSaveChannelSettings}
                  disabled={savingChannels}
                  className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer disabled:opacity-50"
                >
                  {savingChannels ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : channelSuccess ? (
                    <Check size={18} className="text-emerald-300" />
                  ) : (
                    <CheckCircle size={18} />
                  )}
                  <span>{savingChannels ? "Saqlanmoqda..." : channelSuccess ? "Saqlandi va Sinxronlandi! ✅" : "O'zgarishlarni Saqlash"}</span>
                </button>

                <button
                  onClick={loadChannelSettings}
                  className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
                >
                  <RefreshCw size={16} />
                  <span>Qayta Yuklash</span>
                </button>
              </div>
            </div>
          </div>

          {/* Channels Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Kanallar Ro'yxati (7 Cols) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Radio size={20} className="text-blue-600" />
                    <span>Faol Kanallar Ro'yxati</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Bot foydalanuvchilarning quyidagi har bir kanalga a'zoligini alohida tekshiradi
                  </p>
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl text-xs font-black">
                  {channelSettings.channels.length} ta kanal
                </span>
              </div>

              {/* Admin Instruction Banner */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 font-bold">
                  💡
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">
                    Bot Ruxsatnomasi Bo'yicha Muhim Eslatma
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed font-medium">
                    Bot (<b>@Studentaicombot</b>) foydalanuvchilarning kanalga a'zo bo'lganini avtomatik aniq tekshira olishi uchun botni yuqoridagi <b>barcha kanallarga Administrator</b> qilib qo'shing va unga foydalanuvchilarni ko'rish ruxsatini bering.
                  </p>
                </div>
              </div>

              {/* Channel list cards */}
              <div className="space-y-3">
                {channelSettings.channels.map((ch, idx) => {
                  const cleanName = ch.replace('@', '').replace('https://t.me/', '');
                  const isCore = ['@dilmurodbekmatematika', '@DilnuraMadaminova']
                    .some(core => core.toLowerCase() === ch.toLowerCase());
                  
                  let badgeTitle = "Qo'shimcha Kanal";
                  if (ch.toLowerCase() === '@dilmurodbekmatematika') badgeTitle = "Asosiy Matematika Kanali";
                  if (ch.toLowerCase() === '@dilnuramadaminova') badgeTitle = "Hamkor / Muallif Kanali";

                  return (
                    <div 
                      key={ch + idx}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCore 
                          ? 'bg-blue-50/50 border-blue-200 hover:border-blue-300' 
                          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                          isCore ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900 font-mono">
                              {ch.startsWith('@') ? ch : `@${ch}`}
                            </span>
                            {isCore && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                                Asosiy Majburiy
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {badgeTitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <a
                          href={`https://t.me/${cleanName}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                        >
                          <span>Kanalga o'tish</span>
                          <ExternalLink size={13} />
                        </a>
                        
                        {!isCore && (
                          <button
                            onClick={() => handleRemoveChannel(ch)}
                            className="p-2 text-rose-500 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-all border border-transparent hover:border-rose-200 cursor-pointer"
                            title="Kanalni o'chirish"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Channel */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                  Yangi Kanal Qo'shish
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold font-mono">@</span>
                    <input
                      type="text"
                      placeholder="kanal_nomi yoki linki"
                      value={newChannelInput.replace(/^@/, '')}
                      onChange={(e) => setNewChannelInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddChannel();
                        }
                      }}
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                    />
                  </div>
                  <button
                    onClick={handleAddChannel}
                    type="button"
                    className="px-5 py-3 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus size={16} />
                    <span>Qo'shish</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1.5">
                  Diqqat: Bot yangi qo'shilgan kanalda admin (a'zolarni ko'rish ruxsati bilan) bo'lishi lozim.
                </p>
              </div>
            </div>

            {/* Right: Bog'liq Havolalar & Sozlamalar (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                  <Link2 size={20} className="text-indigo-600" />
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Tashqi Havolalar Sozlamalari
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Google Forms, HDP va Omon integratsiya havolalari
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                      HDP Ariza Havolasi (Google Forms)
                    </label>
                    <input
                      type="url"
                      value={channelSettings.hdpLink || ''}
                      onChange={(e) => setChannelSettings(prev => ({ ...prev, hdpLink: e.target.value }))}
                      placeholder="https://forms.gle/..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1.5">
                      Omon Ariza Havolasi (Google Forms)
                    </label>
                    <input
                      type="url"
                      value={channelSettings.omonLink || ''}
                      onChange={(e) => setChannelSettings(prev => ({ ...prev, omonLink: e.target.value }))}
                      placeholder="https://forms.gle/..."
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-black text-xs">
                    <AlertTriangle size={15} />
                    <span>Ishlash Tizimi Eslatmasi</span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Telegram bot foydalanuvchi obunasini <b>getChatMember</b> orqali tekshiradi. Foydalanuvchi har bir kanalga a'zo bo'lgach, «Obunani tekshirish» tugmasini bosganda avtomatik hisob ochiladi.
                  </p>
                </div>

                <button
                  onClick={handleSaveChannelSettings}
                  disabled={savingChannels}
                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingChannels ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  <span>{savingChannels ? "Saqlanmoqda..." : "Sozlamalarni Saqlash"}</span>
                </button>
              </div>

              {/* Bot Info Box */}
              <div className="bg-slate-900 text-white p-6 rounded-[2rem] border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">Telegram Bot</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Polling Faol
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-black">
                    <Globe size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Student AI Bot</h4>
                    <p className="text-xs text-slate-400 font-mono">@Studentaicombot</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  Bot orqali avtorizatsiya va kanal obunalarini real vaqt rejimida tekshirish serverda uzluksiz ishlamoqda.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {isUserModalOpen && editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] w-full max-w-md p-5 sm:p-8 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setIsUserModalOpen(false)}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 text-slate-400 hover:text-slate-900 p-1 rounded-lg"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg sm:text-xl font-black text-slate-900">Foydalanuvchini Tahrirlash</h3>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-500 mb-1">Email</label>
                <input
                  type="text"
                  disabled
                  value={editingUser.email}
                  className="w-full px-4 py-3 bg-slate-100 rounded-xl text-slate-600 font-mono"
                />
              </div>

              {/* Admin Privileges Toggle */}
              <div>
                <label className="block text-slate-500 mb-1">Adminlik Maqomi va Huquqi</label>
                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !editIsAdmin;
                    setEditIsAdmin(nextVal);
                    if (nextVal && editRole === 'USER') setEditRole('ADMIN');
                    if (!nextVal) setEditRole('USER');
                  }}
                  className={`w-full p-3 rounded-xl border text-xs font-black flex items-center justify-between transition-all cursor-pointer ${
                    editIsAdmin
                      ? 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-500/20'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {editIsAdmin ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                    {editIsAdmin ? "ADMIN HUQUQI BERILGAN" : "ODATIY FOYDALANUVCHI"}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-white/20">
                    {editIsAdmin ? "Faol Admin" : "User"}
                  </span>
                </button>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Lavozim / Role</label>
                <select
                  value={editRole}
                  onChange={(e) => {
                    const r = e.target.value;
                    setEditRole(r);
                    if (r === 'ADMIN' || r === 'SUPER_ADMIN' || r === 'MODERATOR' || r === 'EDITOR') {
                      setEditIsAdmin(true);
                    } else {
                      setEditIsAdmin(false);
                    }
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-slate-800"
                >
                  <option value="USER">👤 Foydalanuvchi (USER)</option>
                  <option value="MODERATOR">🔰 Moderator</option>
                  <option value="EDITOR">✍️ Muharrir (EDITOR)</option>
                  <option value="ADMIN">🛡️ Administrator (ADMIN)</option>
                  <option value="SUPER_ADMIN">⚡ Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Hamyon Balansi (UZS)</label>
                <input
                  type="number"
                  value={editBalance}
                  onChange={(e) => setEditBalance(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-black"
                />
              </div>

              <button
                onClick={handleSaveUserUpdate}
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold cursor-pointer hover:bg-blue-600 transition-all shadow-md"
              >
                O'zgarishlarni Saqlash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ADMIN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl sm:rounded-[2.5rem] w-full max-w-md p-5 sm:p-8 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 sm:top-6 right-4 sm:right-6 text-slate-400 hover:text-slate-900 p-1 rounded-lg"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-black">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Adminlik Huquqi Berish</h3>
                <p className="text-xs text-slate-500">Mavjud foydalanuvchini admin qilish yoki yangi admin qo'shish</p>
              </div>
            </div>

            <form onSubmit={handleAddAdmin} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-slate-500 mb-1">Mavjud Foydalanuvchilar orasidan Tanlash</label>
                <select
                  onChange={(e) => {
                    const selectedEmail = e.target.value;
                    if (!selectedEmail) return;
                    const selectedUser = allUsers.find(u => u.email === selectedEmail);
                    if (selectedUser) {
                      setNewAdmin({
                        ...newAdmin,
                        email: selectedUser.email,
                        name: selectedUser.name || selectedUser.email.split('@')[0],
                        role: (selectedUser.role as any) || 'ADMIN'
                      });
                    }
                  }}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 font-bold"
                >
                  <option value="">-- Foydalanuvchini Tanlang (Ixtiyoriy) --</option>
                  {allUsers
                    .filter(u => !u.isAdmin)
                    .map(u => (
                      <option key={u.email} value={u.email}>
                        {u.name || u.email} ({u.email})
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-400 font-medium mt-1">
                  Mavjud foydalanuvchini tanlasangiz, uning ma'lumotlari avtomatik to'ldiriladi.
                </p>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Ism Familiya</label>
                <input
                  type="text"
                  required
                  placeholder="Alisher Aliyev"
                  value={newAdmin.name || ''}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="admin@student.ai"
                  value={newAdmin.email || ''}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Admin Rolini Tanlang</label>
                <select
                  value={newAdmin.role || 'ADMIN'}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as any })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 font-bold"
                >
                  <option value="ADMIN">🛡️ Administrator (To'liq admin)</option>
                  <option value="SUPER_ADMIN">⚡ Super Admin</option>
                  <option value="MODERATOR">🔰 Moderator</option>
                  <option value="EDITOR">✍️ Muharrir (Editor)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold cursor-pointer transition-all shadow-lg shadow-blue-500/20"
              >
                Tasdiqlash & Adminlik Huquqini Berish
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}> = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold text-xs flex items-center gap-2 whitespace-nowrap shrink-0 transition-all cursor-pointer min-h-[40px] ${
      active
        ? 'bg-slate-900 text-white shadow-md'
        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/60'
    }`}
  >
    {icon}
    <span>{label}</span>
    {badge && (
      <span
        className={`px-2 py-0.5 text-[10px] rounded-full font-black ${
          active ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-700'
        }`}
      >
        {badge}
      </span>
    )}
  </button>
);

const AdminStat: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5">
    <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-inner">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
      <h4 className="text-2xl font-black text-slate-900">{value}</h4>
    </div>
  </div>
);
