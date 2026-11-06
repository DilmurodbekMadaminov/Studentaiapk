
import { Order, ChatMessage, EduSubject, Transaction, User, AdminRole, SectionLockMap } from '../types';
import { securityService } from './securityService';

const INITIAL_EDU_DATA: EduSubject[] = [
  {
    _id: 'sub1',
    name: 'Algoritmlar va Ma\'lumotlar Tuzilmasi',
    teacher: 'Prof. Alisherov',
    credits: 6,
    totalHours: 72,
    attendedHours: 64,
    midtermGrade: 28,
    finalGrade: 0,
    assignments: [
      { _id: 'as1', title: 'Graf nazariyasi bo\'yicha hisob-grafik ishi', deadline: '2026-05-20', status: 'pending', maxScore: 10 },
      { _id: 'as2', title: 'Saralash algoritmlari tahlili', deadline: '2026-04-15', status: 'graded', score: 9, maxScore: 10 }
    ]
  },
  {
    _id: 'sub2',
    name: 'Sun\'iy Intellekt Asoslari',
    teacher: 'Dr. Karimov',
    credits: 5,
    totalHours: 60,
    attendedHours: 58,
    midtermGrade: 30,
    finalGrade: 0,
    assignments: [
      { _id: 'as3', title: 'Neyron tarmoqlar modelini yaratish', deadline: '2026-06-01', status: 'pending', maxScore: 20 }
    ]
  }
];

export const dbService = {
  // Current Session Management
  getCurrentUser: (): User | null => {
    const session = localStorage.getItem('st_ai_session_enc');
    if (!session) return null;
    const decoded = securityService.decrypt(session);
    if (!decoded || (!decoded.email && !decoded.id && !decoded.telegramId)) return null;
    return decoded as User;
  },

  setSession: (user: User) => {
    const sessionData = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || user.photoURL,
      photoURL: user.avatar || user.photoURL,
      isAdmin: user.isAdmin,
      isPro: Boolean(user.isPro),
      proExpiresAt: user.proExpiresAt || null,
      role: user.role || 'USER',
      phone: user.phone || '',
      telegramUsername: user.telegramUsername || '',
      telegramId: user.telegramId || '',
      authProvider: user.authProvider || 'email',
      appliedPromos: (user as any).appliedPromos || [],
      balance: (user as any).balance || 0,
      fingerprint: securityService.getFingerprint(),
      timestamp: Date.now()
    };
    localStorage.setItem('st_ai_session_enc', securityService.encrypt(sessionData));
  },

  redeemPromoCode: async (code: string, user: User) => {
    try {
      const res = await fetch('/api/promocodes/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email || ''
        },
        body: JSON.stringify({
          code: code.trim(),
          email: user.email,
          userId: user.id,
          telegramId: user.telegramId,
          name: user.name,
          telegramUsername: user.telegramUsername
        })
      });
      const data = await res.json();
      return data;
    } catch (e: any) {
      return { error: e.message || "Promo-kodni tekshirishda xatolik yuz berdi" };
    }
  },

  logActivity: async (actionType: string, description: string, details?: any) => {
    try {
      const currentUser = dbService.getCurrentUser();
      const email = currentUser?.email || 'user@talabaai.uz';
      const userName = currentUser?.name || currentUser?.telegramUsername || 'Foydalanuvchi';
      await fetch('/api/activity/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          userName,
          actionType,
          description,
          details: {
            ...details,
            userId: currentUser?.id,
            telegramId: currentUser?.telegramId,
            timestamp: new Date().toISOString()
          }
        })
      });
    } catch (e) {
      // Background logging fail-safe
    }
  },

  getUserActivities: async (email?: string, userId?: string | number, telegramId?: string | number) => {
    try {
      const params = new URLSearchParams();
      if (email) params.append('email', email);
      if (userId) params.append('userId', String(userId));
      if (telegramId) params.append('telegramId', String(telegramId));
      const res = await fetch(`/api/user/activities?${params.toString()}`);
      if (res.ok) {
        return await res.json();
      }
      return [];
    } catch (e) {
      return [];
    }
  },

  updateUserAvatar: async (email: string, avatarDataUrl: string) => {
    try {
      const res = await fetch('/api/users/avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': email
        },
        body: JSON.stringify({ email, avatar: avatarDataUrl })
      });
      if (res.ok) {
        const data = await res.json();
        return data;
      }
      return null;
    } catch (e) {
      console.error("updateUserAvatar failed", e);
      return null;
    }
  },

  // Users
  getUsers: async (): Promise<User[]> => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) return [];
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        console.warn("getUsers parsed HTML or invalid JSON, returning fallback");
        return [];
      }
    } catch (e) {
      console.error("fetch in getUsers failed", e);
      return [];
    }
  },

  saveUser: async (user: User) => {
    try {
      await fetch('/api/auth/register', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
      });
    } catch (e) {
      console.error("saveUser fetch failed", e);
    }
  },

  googleLogin: async (googleData: { name: string; email: string; photoURL?: string }) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(googleData)
      });
      if (!res.ok) {
        throw new Error('Google authentication backend sync failed');
      }
      const data = await res.json();
      return data.user as User;
    } catch (e) {
      console.error("googleLogin failed", e);
      return {
        name: googleData.name,
        email: googleData.email,
        isAdmin: false
      } as User;
    }
  },

  initiateTelegramAuth: async (payload?: { phone?: string; name?: string; telegramUsername?: string }) => {
    try {
      const res = await fetch('/api/auth/telegram/initiate', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload || {})
      });
      return await res.json();
    } catch (e) {
      console.error("initiateTelegramAuth failed", e);
      return null;
    }
  },

  attachPhoneToTelegramSession: async (token: string, phone: string) => {
    try {
      const res = await fetch('/api/auth/telegram/attach-phone', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, phone })
      });
      return await res.json();
    } catch (e) {
      console.error("attachPhoneToTelegramSession failed", e);
      return { success: false, error: "Telefonni biriktirishda xatolik" };
    }
  },

  checkTelegramAuth: async (token: string) => {
    try {
      const res = await fetch(`/api/auth/telegram/check?token=${encodeURIComponent(token)}`);
      return await res.json();
    } catch (e) {
      console.error("checkTelegramAuth failed", e);
      return { authenticated: false, error: "Tarmoq xatoligi" };
    }
  },

  verifyTelegramDirect: async (payload: { token: string; name?: string; phone?: string; telegramUsername?: string }) => {
    try {
      const res = await fetch('/api/auth/telegram/verify-direct', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      console.error("verifyTelegramDirect failed", e);
      return { success: false, error: "Tasdiqlashda xatolik" };
    }
  },

  updateUserProfile: async (email: string, profile: { name?: string; phone?: string; telegramUsername?: string }) => {
    try {
      const res = await fetch('/api/users/profile', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-email": email
        },
        body: JSON.stringify(profile)
      });
      return await res.json();
    } catch (e) {
      console.error("updateUserProfile failed", e);
      return { success: false, error: "Profilni yangilashda xatolik" };
    }
  },

  getTelegramBotInfo: async () => {
    try {
      const res = await fetch('/api/telegram/bot-info');
      return await res.json();
    } catch (e) {
      return { configured: false, botUsername: "studentai_auth_bot" };
    }
  },

  setTelegramBotConfig: async (botToken: string, botUsername?: string) => {
    try {
      const res = await fetch('/api/telegram/set-bot', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken, botUsername })
      });
      return await res.json();
    } catch (e: any) {
      return { error: e.message || "Xatolik yuz berdi" };
    }
  },

  findUser: async (identifier: string | number) => {
    try {
      const users = await dbService.getUsers();
      const idStr = String(identifier || '').trim().toLowerCase();
      return users.find((u: User) => 
        (u.email && u.email.toLowerCase().trim() === idStr) ||
        (u.id && String(u.id) === idStr) ||
        (u.telegramId && String(u.telegramId) === idStr)
      );
    } catch (e) {
      console.error("findUser failed", e);
      return undefined;
    }
  },
  
  // Admins
  getAdmins: async (): Promise<User[]> => {
    try {
      const users = await dbService.getUsers();
      return users.filter(u => u.isAdmin);
    } catch (e) {
      return [];
    }
  },

  addAdmin: async (admin: User) => {
    try {
      await fetch('/api/users/admins', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: admin.email, name: admin.name, role: admin.role || 'ADMIN', action: 'add' })
      });
    } catch (e) {}
  },

  removeAdmin: async (email: string) => {
    try {
      await fetch('/api/users/admins', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: 'remove' })
      });
    } catch (e) {}
  },

  // Wallet
  getWallet: async () => {
    const user = dbService.getCurrentUser();
    if (!user) return { balance: 0, transactions: [] };
    try {
      const res = await fetch('/api/wallet', {
        headers: { 'x-user-email': user.email }
      });
      if (!res.ok) return { balance: 0, transactions: [] };
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        return { balance: 0, transactions: [] };
      }
    } catch (e) {
      return { balance: 0, transactions: [] };
    }
  },

  updateBalance: async (amount: number, type: 'in' | 'out', provider: Transaction['provider'], description: string) => {
    const user = dbService.getCurrentUser();
    if (!user) throw new Error("Not logged in");

    try {
      const res = await fetch('/api/wallet/transaction', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-email": user.email
        },
        body: JSON.stringify({ amount, type, provider, description: securityService.sanitizeInput(description) })
      });
      
      if (!res.ok) {
        const text = await res.text();
        let errMsg = "Wallet update failed";
        try {
          const err = JSON.parse(text);
          errMsg = err.error || errMsg;
        } catch (e) {}
        throw new Error(errMsg);
      }
      return await res.json();
    } catch (e: any) {
      console.error(e);
      throw e;
    }
  },

  // EDU System - keep using legacy generic one or local fallback since we didn't add full specific endpoints for edu
  getEduSubjects: async (): Promise<EduSubject[]> => {
    try {
      const res = await fetch('/api/db/edu_data');
      if (!res.ok) return INITIAL_EDU_DATA;
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (!data || data.length === 0) {
          await fetch('/api/db/edu_data', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(INITIAL_EDU_DATA)
          });
          return INITIAL_EDU_DATA;
        }
        return data;
      } catch (e) {
        return INITIAL_EDU_DATA;
      }
    } catch (e) {
      return INITIAL_EDU_DATA;
    }
  },

  submitAssignment: async (subId: string, asId: string) => {
    try {
      const subjects = await dbService.getEduSubjects();
      const updated = subjects.map(s => {
        if (s._id === subId) {
          return {
            ...s,
            assignments: s.assignments.map(a => 
              a._id === asId ? { ...a, status: 'submitted' as const } : a
            )
          };
        }
        return s;
      });
      await fetch('/api/db/edu_data', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      console.error("submitAssignment failed", e);
    }
  },

  // Marketplace
  getOrders: async (): Promise<Order[]> => {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) return [];
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        return [];
      }
    } catch (e) {
      console.error("getOrders failed", e);
      return [];
    }
  },

  addOrder: async (order: Order) => {
    try {
      await fetch('/api/orders', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });
    } catch (e) {
      console.error("addOrder failed", e);
    }
  },

  // Chat
  getChatHistory: async (userEmail: string): Promise<ChatMessage[]> => {
    try {
      const res = await fetch('/api/chat', {
        headers: { 'x-user-email': userEmail }
      });
      if (!res.ok) return [];
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        return [];
      }
    } catch (e) {
      console.error("getChatHistory failed", e);
      return [];
    }
  },

  saveChatMessage: async (userEmail: string, message: ChatMessage) => {
    try {
      await fetch('/api/chat/message', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-user-email": userEmail
        },
        body: JSON.stringify({ ...message, text: securityService.sanitizeInput(message.text) })
      });
    } catch (e) {
      console.error("saveChatMessage failed", e);
    }
  },

  // System Section Locks
  getSectionLocks: async (): Promise<SectionLockMap> => {
    try {
      const res = await fetch('/api/system/section-locks');
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          localStorage.setItem('st_ai_section_locks_cache', JSON.stringify(data));
          return data as SectionLockMap;
        }
      }
    } catch (e) {
      console.error("getSectionLocks failed, reading cache", e);
    }
    const cached = localStorage.getItem('st_ai_section_locks_cache');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return {};
  },

  saveSectionLocks: async (locks: SectionLockMap): Promise<boolean> => {
    try {
      localStorage.setItem('st_ai_section_locks_cache', JSON.stringify(locks));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('section_locks_updated', { detail: locks }));
      }
      const res = await fetch('/api/system/section-locks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locks })
      });
      return res.ok;
    } catch (e) {
      console.error("saveSectionLocks failed", e);
      return false;
    }
  }
};
