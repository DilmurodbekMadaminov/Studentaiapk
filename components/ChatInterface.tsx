import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Sparkles, BrainCircuit, Loader2, Search, Globe, 
  Paperclip, Mic, Smile, MoreVertical, Pin, Reply, Copy, Trash2, 
  Volume2, VolumeX, Check, CheckCheck, Phone, PhoneOff, ArrowLeft, 
  Image as ImageIcon, FileText, Code2, X, Download, ZoomIn, 
  HelpCircle, BookOpen, Calculator, Laptop, Bookmark, Briefcase, 
  Flame, Heart, ThumbsUp, PartyPopper, ChevronDown, RefreshCw
} from 'lucide-react';
import { ChatMessage, MessageRole } from '../types';
import { streamSearchChatResponse } from '../services/geminiService';
import { dbService } from '../services/dbService';
import { useLanguage } from '../context/LanguageContext';
import ReactMarkdown from 'react-markdown';
import { TelegramVoicePlayer } from './TelegramVoicePlayer';
import { TelegramEmojiPicker } from './TelegramEmojiPicker';
import { TelegramAudioRecorder } from './TelegramAudioRecorder';

interface TelegramDialog {
  id: string;
  name: string;
  avatarText: string;
  avatarBg: string;
  role: 'bot' | 'saved' | 'group';
  statusText: string;
  model: 'gemini' | 'chatgpt' | 'math' | 'ielts' | 'code' | 'saved' | 'career';
  category: 'all' | 'bots' | 'study' | 'freelance' | 'saved';
  description: string;
  pinned?: boolean;
  systemPrompt?: string;
}

const DEFAULT_DIALOGS: TelegramDialog[] = [
  {
    id: 'gemini_pro',
    name: 'Google Gemini 2.5 Pro',
    avatarText: '✦',
    avatarBg: 'from-blue-500 to-indigo-600',
    role: 'bot',
    statusText: 'bot • doimo online',
    model: 'gemini',
    category: 'bots',
    description: 'Eng so\'nggi Gemini modeli, qidiruv va tahlil imkoniyatlari bilan',
    pinned: true,
    systemPrompt: 'Siz professional akademik repetitor va do\'stona AI yordamchisiz. O\'zbek tilida aniq, tushunarli va chiroyli javob bering.'
  },
  {
    id: 'chatgpt_4o',
    name: 'OpenAI ChatGPT-4o',
    avatarText: 'GPT',
    avatarBg: 'from-emerald-500 to-teal-700',
    role: 'bot',
    statusText: 'bot • doimo online',
    model: 'chatgpt',
    category: 'bots',
    description: 'Ijodiy yozish, g\'oyalar va umumiy savollarga tushuntirish',
    pinned: true,
    systemPrompt: 'Siz OpenAI ChatGPT modelisiz. Har qanday akademik va umumiy savolga puxta javob bering.'
  },
  {
    id: 'math_solver',
    name: 'Matematika Masala Yechuvchi',
    avatarText: '∑',
    avatarBg: 'from-amber-500 to-orange-600',
    role: 'bot',
    statusText: 'bot • matematika eksperti',
    model: 'math',
    category: 'study',
    description: 'Murakkab masalalar, formulalar va tenglamalarni bosqichma-bosqich yechish',
    systemPrompt: 'Siz oliy toifali matematika o\'qituvchisisiz. Masalalarni bosqichma-bosqich, formulalari va tushuntirishlari bilan to\'liq yechib bering.'
  },
  {
    id: 'ielts_master',
    name: 'IELTS & Ingliz Tili Repetitori',
    avatarText: 'EN',
    avatarBg: 'from-purple-500 to-pink-600',
    role: 'bot',
    statusText: 'bot • IELTS 8.5 murabbiy',
    model: 'ielts',
    category: 'study',
    description: 'Ingliz tili grammatikasi, IELTS Writing & Speaking tahlili va yangi so\'zlar',
    systemPrompt: 'You are an expert IELTS and English language instructor. Help the user improve grammar, vocabulary, IELTS writing and speaking with examples.'
  },
  {
    id: 'code_assistant',
    name: 'IT & Dasturlash Murabbiy',
    avatarText: '</>',
    avatarBg: 'from-cyan-600 to-blue-700',
    role: 'bot',
    statusText: 'bot • Senior Developer',
    model: 'code',
    category: 'study',
    description: 'Python, JavaScript, C++, algoritmlar va xatolarni tahlil qilish',
    systemPrompt: 'Siz katta dasturchisiz. Kodlarni toza, optimal va tushunarli qilib yozing, xatolarni ko\'rsatib bering.'
  },
  {
    id: 'career_mentor',
    name: 'Frilans & Karyera Maslahatchisi',
    avatarText: '💼',
    avatarBg: 'from-violet-600 to-purple-800',
    role: 'bot',
    statusText: 'bot • Karyera markazi',
    model: 'career',
    category: 'freelance',
    description: 'Rezyume tayyorlash, mijozlar bilan muloqot va portfolio tuzish',
    systemPrompt: 'Siz frilans va karyera mutaxassisiz. Talabalarga buyurtmalar olish, yaxshi portfolio yaratish va daromad topish sirlarini o\'rgating.'
  },
  {
    id: 'saved_messages',
    name: 'Saqlangan Xabarlar',
    avatarText: '🔖',
    avatarBg: 'from-slate-600 to-slate-800',
    role: 'saved',
    statusText: 'shaxsiy bulut xotirasi',
    model: 'saved',
    category: 'saved',
    description: 'O\'zingiz uchun kerakli eslatmalar, fayllar va konspektlarni saqlash'
  }
];

export const ChatInterface: React.FC = () => {
  const [dialogs, setDialogs] = useState<TelegramDialog[]>(DEFAULT_DIALOGS);
  const [activeDialogId, setActiveDialogId] = useState<string>('gemini_pro');
  const [activeCategory, setActiveCategory] = useState<'all' | 'bots' | 'study' | 'freelance' | 'saved'>('all');
  const [dialogSearchQuery, setDialogSearchQuery] = useState('');
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTypingAnimation, setIsTypingAnimation] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // Telegram features
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<ChatMessage | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  
  // In-chat search
  const [isInChatSearching, setIsInChatSearching] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');
  
  // Mobile responsive sidebar toggle
  const [showMobileChatList, setShowMobileChatList] = useState(true);
  
  // Call simulation modal
  const [isInCall, setIsInCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isCallMuted, setIsCallMuted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { language, t } = useLanguage();
  
  const currentUser = dbService.getCurrentUser() || { name: 'Foydalanuvchi', email: 'user@student.ai' };
  const activeDialog = dialogs.find(d => d.id === activeDialogId) || dialogs[0];

  // Load chat history for selected dialog
  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      const storageKey = `tg_chat_${currentUser.email}_${activeDialogId}`;
      const localData = localStorage.getItem(storageKey);
      
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (isMounted) {
            setMessages(parsed);
            const pinned = parsed.find((m: ChatMessage) => m.isPinned);
            if (pinned) setPinnedMessage(pinned);
            return;
          }
        } catch (e) {}
      }

      // If empty, generate welcoming message
      if (activeDialogId === 'saved_messages') {
        const welcome: ChatMessage = {
          id: 'welcome_saved',
          role: MessageRole.MODEL,
          text: '📌 **Saqlangan Xabarlar bo\'limiga xush kelibsiz!**\n\nBu yerda kerakli matnlar, konspektlar, audio xabarlar va fayllaringizni o\'zingiz uchun saqlab qo\'yishingiz mumkin.',
          timestamp: new Date(),
          status: 'read'
        };
        if (isMounted) {
          setMessages([welcome]);
          localStorage.setItem(storageKey, JSON.stringify([welcome]));
        }
      } else {
        const welcomeId = `welcome_${Date.now()}`;
        const welcome: ChatMessage = {
          id: welcomeId,
          role: MessageRole.MODEL,
          text: `Salom, **${currentUser.name}**! 👋\n\nMen **${activeDialog.name}**man. ${activeDialog.description}.\n\nQanday savol yoki topshiriq ustida ishlaymiz? Matn, rasm yoki ovozli xabar yuborishingiz mumkin.`,
          timestamp: new Date(),
          status: 'read'
        };
        if (isMounted) {
          setMessages([welcome]);
          localStorage.setItem(storageKey, JSON.stringify([welcome]));
        }
      }
    };

    loadHistory();
    setReplyingTo(null);
    setPinnedMessage(null);
    return () => { isMounted = false; };
  }, [activeDialogId, currentUser.email]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTypingAnimation]);

  // Call timer simulation
  useEffect(() => {
    let timer: any = null;
    if (isInCall) {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isInCall]);

  const saveMessagesState = (newMsgs: ChatMessage[]) => {
    setMessages(newMsgs);
    const storageKey = `tg_chat_${currentUser.email}_${activeDialogId}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(newMsgs));
    } catch (e) {}
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setShowAttachMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setAttachedFile({
        name: file.name,
        size: `${sizeMB} MB`,
        type: file.name.split('.').pop()?.toUpperCase() || 'FILE'
      });
      setShowAttachMenu(false);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage && !attachedFile) || isLoading) return;

    const userMsgId = 'msg_' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: MessageRole.USER,
      text: input.trim(),
      timestamp: new Date(),
      imageUrl: selectedImage || undefined,
      fileName: attachedFile ? attachedFile.name : undefined,
      fileSize: attachedFile ? attachedFile.size : undefined,
      replyTo: replyingTo ? {
        id: replyingTo.id,
        text: replyingTo.text ? (replyingTo.text.slice(0, 70) + (replyingTo.text.length > 70 ? '...' : '')) : 'Xabar',
        sender: replyingTo.role === MessageRole.USER ? 'Siz' : activeDialog.name
      } : undefined,
      status: 'read'
    };

    const updatedWithUser = [...messages, userMsg];
    saveMessagesState(updatedWithUser);

    const promptText = input.trim();
    const userImage = selectedImage;
    const userFile = attachedFile;

    // Reset input fields
    setInput('');
    setSelectedImage(null);
    setAttachedFile(null);
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowAttachMenu(false);

    // If saved messages, no bot reply needed
    if (activeDialogId === 'saved_messages') {
      return;
    }

    // Bot Response Logic
    setIsLoading(true);
    setIsTypingAnimation(true);

    try {
      const botMsgId = 'bot_' + Date.now();
      const botMsg: ChatMessage = {
        id: botMsgId,
        role: MessageRole.MODEL,
        text: '',
        timestamp: new Date(),
        status: 'read'
      };

      const withBotPlaceholder = [...updatedWithUser, botMsg];
      setMessages(withBotPlaceholder);

      let fullResponseText = '';

      if (activeDialog.model === 'gemini') {
        const history = updatedWithUser.slice(-8).map(m => ({
          role: m.role,
          parts: [{ text: m.text || " " }]
        }));

        const promptToSend = userImage 
          ? `${promptText}\n[Foydalanuvchi rasm yubordi]` 
          : (userFile ? `${promptText}\n[Foydalanuvchi "${userFile.name}" nomli hujjat biriktirdi]` : promptText);

        const stream = await streamSearchChatResponse(promptToSend, history, language);
        let groundingLinks: { uri: string; title: string }[] = [];

        for await (const chunk of stream) {
          if (chunk.text) {
            fullResponseText += chunk.text;
            const chunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
              chunks.forEach((c: any) => {
                if (c.web) groundingLinks.push({ uri: c.web.uri, title: c.web.title });
              });
            }
            setMessages(prev => prev.map(m => m.id === botMsgId ? {
              ...m,
              text: fullResponseText,
              groundingLinks: groundingLinks.length > 0 ? Array.from(new Map(groundingLinks.map(l => [l.uri, l])).values()) : undefined
            } : m));
          }
        }
      } else {
        // Multi-agent server API endpoint
        let endpoint = '/api/ai/deepseek';
        if (activeDialog.model === 'chatgpt') endpoint = '/api/ai/chatgpt';

        const historyPayload = updatedWithUser.slice(-8).map(m => ({
          role: m.role === MessageRole.USER ? 'user' : 'assistant',
          content: m.text || " "
        }));

        historyPayload.push({
          role: 'user',
          content: `${activeDialog.systemPrompt ? `[Instruksiya: ${activeDialog.systemPrompt}]\n\n` : ''}${promptText || 'Salom'}`
        });

        let userApiKey = localStorage.getItem('GEMINI_API_KEY') || undefined;
        if (!userApiKey && typeof window !== 'undefined' && (window as any).aistudio) {
          try {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            if (hasKey) userApiKey = await (window as any).aistudio.getApiKey();
          } catch (e) {}
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: historyPayload, apiKey: userApiKey })
        });

        if (!response.ok) throw new Error(`${activeDialog.model} javob qaytara olmadi`);

        const data = await response.json();
        const rawText = data.text || "Kechirasiz, javob olishda muammo yuz berdi.";

        // Stream typewriter effect for realistic Telegram bot feel
        for (let i = 0; i < rawText.length; i += 3) {
          fullResponseText += rawText.slice(i, i + 3);
          setMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullResponseText } : m));
          await new Promise(r => setTimeout(r, 12));
        }
      }

      const finalMessages = withBotPlaceholder.map(m => m.id === botMsgId ? { ...m, text: fullResponseText } : m);
      saveMessagesState(finalMessages);

    } catch (err: any) {
      console.error("Bot chat response error:", err);
      const errorMsg = "Kechirasiz, sun'iy intellekt xizmati bilan bog'lanishda vaqtincha xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.";
      setMessages(prev => prev.map(m => m.text === '' ? { ...m, text: errorMsg, isError: true } : m));
    } finally {
      setIsLoading(false);
      setIsTypingAnimation(false);
    }
  };

  const handleSendVoiceNote = (audioUrl: string, durationSeconds: number) => {
    setIsRecordingAudio(false);
    const voiceMsgId = 'voice_' + Date.now();
    const voiceMsg: ChatMessage = {
      id: voiceMsgId,
      role: MessageRole.USER,
      text: '🎙️ Ovozli xabar',
      audioUrl: audioUrl || undefined,
      audioDuration: durationSeconds || 8,
      timestamp: new Date(),
      status: 'read'
    };

    const updated = [...messages, voiceMsg];
    saveMessagesState(updated);

    if (activeDialogId !== 'saved_messages') {
      // Simulate quick friendly bot audio acknowledgement
      setIsLoading(true);
      setIsTypingAnimation(true);
      setTimeout(() => {
        const botReply: ChatMessage = {
          id: 'bot_voice_' + Date.now(),
          role: MessageRole.MODEL,
          text: `Ovozli xabaringiz qabul qilindi (${durationSeconds} soniya)! 👍\n\nAI tahlilchisi sizning talabingizni qabul qildi. Qanday qo'shimcha yordam bera olaman?`,
          timestamp: new Date(),
          status: 'read'
        };
        const withBot = [...updated, botReply];
        saveMessagesState(withBot);
        setIsLoading(false);
        setIsTypingAnimation(false);
      }, 1200);
    }
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    setMessages(prev => {
      const updated = prev.map(m => {
        if (m.id === msgId) {
          const currentReactions = { ...(m.reactions || {}) };
          const userAlreadyReacted = m.userReaction === emoji;

          if (userAlreadyReacted) {
            currentReactions[emoji] = Math.max(0, (currentReactions[emoji] || 1) - 1);
            if (currentReactions[emoji] === 0) delete currentReactions[emoji];
            return { ...m, reactions: currentReactions, userReaction: undefined };
          } else {
            if (m.userReaction && currentReactions[m.userReaction]) {
              currentReactions[m.userReaction] = Math.max(0, currentReactions[m.userReaction] - 1);
              if (currentReactions[m.userReaction] === 0) delete currentReactions[m.userReaction];
            }
            currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;
            return { ...m, reactions: currentReactions, userReaction: emoji };
          }
        }
        return m;
      });
      saveMessagesState(updated);
      return updated;
    });
    setActiveReactionMessageId(null);
  };

  const handleTogglePin = (msg: ChatMessage) => {
    const updated = messages.map(m => ({
      ...m,
      isPinned: m.id === msg.id ? !m.isPinned : false
    }));
    saveMessagesState(updated);
    if (pinnedMessage?.id === msg.id) {
      setPinnedMessage(null);
    } else {
      setPinnedMessage(msg);
    }
  };

  const handleDeleteMessage = (msgId: string) => {
    const updated = messages.filter(m => m.id !== msgId);
    saveMessagesState(updated);
    if (pinnedMessage?.id === msgId) setPinnedMessage(null);
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleTextToSpeech = (msgId: string, text: string) => {
    if ('speechSynthesis' in window) {
      if (speakingMessageId === msgId) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
        return;
      }

      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);

      setSpeakingMessageId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  const formatMessageTime = (date: any) => {
    try {
      const d = new Date(date);
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      return `${hours}:${mins}`;
    } catch (e) {
      return '12:00';
    }
  };

  // Filter dialogs
  const filteredDialogs = dialogs.filter(d => {
    const matchesCategory = activeCategory === 'all' || d.category === activeCategory;
    const matchesSearch = d.name.toLowerCase().includes(dialogSearchQuery.toLowerCase()) || 
                          d.description.toLowerCase().includes(dialogSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filter messages if in-chat search active
  const displayedMessages = inChatSearchQuery.trim()
    ? messages.filter(m => m.text?.toLowerCase().includes(inChatSearchQuery.toLowerCase()))
    : messages;

  return (
    <div className={`flex h-[calc(100vh-110px)] md:h-[calc(100vh-80px)] rounded-[2rem] shadow-2xl border overflow-hidden transition-colors ${
      isDarkTheme ? 'bg-[#0e1621] border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
    }`}>
      
      {/* 1. LEFT SIDEBAR: TELEGRAM DIALOGS & FOLDERS */}
      <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r shrink-0 transition-all ${
        isDarkTheme ? 'bg-[#17212b] border-slate-800' : 'bg-[#ffffff] border-slate-100'
      } ${!showMobileChatList ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Sidebar Header: Brand + Search */}
        <div className="p-3.5 space-y-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#3390ec] text-white flex items-center justify-center font-bold text-sm shadow-md">
                ✈️
              </div>
              <h2 className="font-extrabold text-base tracking-tight">Telegram AI Hub</h2>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title={isDarkTheme ? "Kunduzgi mavzu" : "Tungi mavzu"}
              >
                {isDarkTheme ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Qidirish..."
              value={dialogSearchQuery}
              onChange={(e) => setDialogSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs font-semibold outline-none transition-all ${
                isDarkTheme 
                  ? 'bg-[#242f3d] text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-[#3390ec]' 
                  : 'bg-slate-100 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#3390ec]/30'
              }`}
            />
            {dialogSearchQuery && (
              <button 
                onClick={() => setDialogSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Folder Tabs (Barchasi, Botlar, Ta'lim, Saqlanganlar) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-extrabold scrollbar-none">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'bots', label: '🤖 AI Botlar' },
              { id: 'study', label: '📚 Ta\'lim' },
              { id: 'freelance', label: '💼 Frilans' },
              { id: 'saved', label: '🔖 Saqlangan' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? isDarkTheme ? 'bg-[#2b5278] text-[#3390ec]' : 'bg-[#e3f2fd] text-[#3390ec]'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dialogs List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 custom-scrollbar">
          {filteredDialogs.map((dialog) => {
            const isActive = dialog.id === activeDialogId;
            return (
              <div
                key={dialog.id}
                onClick={() => {
                  setActiveDialogId(dialog.id);
                  setShowMobileChatList(false);
                }}
                className={`flex items-center gap-3 p-3.5 transition-all cursor-pointer select-none ${
                  isActive
                    ? isDarkTheme ? 'bg-[#2b5278] text-white' : 'bg-[#3390ec] text-white shadow-sm'
                    : isDarkTheme ? 'hover:bg-[#202b36]' : 'hover:bg-slate-50'
                }`}
              >
                {/* Avatar with gradient & online dot */}
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${dialog.avatarBg} text-white flex items-center justify-center font-black text-base shadow-sm`}>
                    {dialog.avatarText}
                  </div>
                  {dialog.role === 'bot' && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                  )}
                </div>

                {/* Dialog Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h4 className={`font-bold text-sm truncate ${isActive ? 'text-white' : ''}`}>
                      {dialog.name}
                    </h4>
                    <span className={`text-[10px] font-semibold shrink-0 ${
                      isActive ? 'text-white/80' : 'text-slate-400'
                    }`}>
                      {dialog.pinned ? '📌' : '19:54'}
                    </span>
                  </div>

                  <p className={`text-xs truncate font-medium ${
                    isActive ? 'text-white/85' : isDarkTheme ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    {dialog.description}
                  </p>
                </div>
              </div>
            );
          })}

          {filteredDialogs.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs font-semibold">
              Ushbu bo'limda suhbatlar topilmadi
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN TELEGRAM CHAT CONVERSATION VIEW */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all ${
        showMobileChatList ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Telegram Chat Header */}
        <div className={`px-4 py-3 border-b flex items-center justify-between shrink-0 z-10 shadow-xs ${
          isDarkTheme ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Back button */}
            <button
              onClick={() => setShowMobileChatList(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft size={20} />
            </button>

            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${activeDialog.avatarBg} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm`}>
              {activeDialog.avatarText}
            </div>

            {/* Title & Status */}
            <div className="min-w-0">
              <h3 className="font-bold text-sm tracking-tight truncate flex items-center gap-1.5">
                {activeDialog.name}
                {activeDialog.role === 'bot' && (
                  <span className="px-1.5 py-0.2 bg-[#3390ec]/15 text-[#3390ec] rounded text-[9px] font-black uppercase">
                    bot
                  </span>
                )}
              </h3>
              <p className="text-[11px] font-medium text-[#3390ec] flex items-center gap-1">
                {isTypingAnimation ? (
                  <span className="animate-pulse flex items-center gap-1 text-primary">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                    yozmoqda...
                  </span>
                ) : (
                  activeDialog.statusText
                )}
              </p>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-1 text-slate-500">
            {/* Search inside chat */}
            <button
              onClick={() => setIsInChatSearching(!isInChatSearching)}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isInChatSearching ? 'bg-[#3390ec]/10 text-[#3390ec]' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Xabarlar ichidan qidirish"
            >
              <Search size={18} />
            </button>

            {/* Search Grounding toggle for Gemini */}
            {activeDialog.model === 'gemini' && (
              <button
                onClick={() => setIsSearchMode(!isSearchMode)}
                className={`p-2 rounded-xl flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer ${
                  isSearchMode ? 'bg-[#3390ec] text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Google Real-time Search Grounding"
              >
                <Globe size={18} />
                <span className="hidden lg:inline text-[10px] uppercase">Qidiruv</span>
              </button>
            )}

            {/* Audio Call Simulator */}
            {activeDialog.role === 'bot' && (
              <button
                onClick={() => setIsInCall(true)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-green-600 transition-colors cursor-pointer"
                title="AI Ovozli qo'ng'iroq"
              >
                <Phone size={18} />
              </button>
            )}

            {/* More Menu Dropdown */}
            <div className="relative group">
              <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                <MoreVertical size={18} />
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#17212b] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl py-1 hidden group-hover:block z-50">
                <button
                  onClick={() => {
                    const storageKey = `tg_chat_${currentUser.email}_${activeDialogId}`;
                    localStorage.removeItem(storageKey);
                    setMessages([]);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2"
                >
                  <Trash2 size={14} /> Tarixni tozalash
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* In-chat search bar overlay */}
        {isInChatSearching && (
          <div className="px-4 py-2 bg-slate-50 dark:bg-[#242f3d] border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 animate-in slide-in-from-top duration-150">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Xabarlar ichidan qidirish..."
              value={inChatSearchQuery}
              onChange={(e) => setInChatSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-xs font-semibold outline-none"
              autoFocus
            />
            <span className="text-[10px] font-bold text-slate-400">
              {displayedMessages.length} ta natija
            </span>
            <button onClick={() => { setIsInChatSearching(false); setInChatSearchQuery(''); }} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Pinned Message Banner */}
        {pinnedMessage && (
          <div 
            onClick={() => {
              const el = document.getElementById(pinnedMessage.id);
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`px-4 py-2 border-b flex items-center justify-between text-xs cursor-pointer shadow-xs ${
              isDarkTheme ? 'bg-[#182533] border-slate-800 text-slate-200' : 'bg-[#e3f2fd]/60 border-blue-100 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Pin size={14} className="text-[#3390ec] shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold text-[#3390ec] uppercase tracking-wider">Qadalgan xabar</p>
                <p className="font-semibold truncate max-w-md">{pinnedMessage.text || 'Ovozli / Hujjat xabari'}</p>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setPinnedMessage(null); }}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* TELEGRAM CHAT WALLPAPER & MESSAGES CONTAINER */}
        <div 
          className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar transition-colors ${
            isDarkTheme 
              ? 'bg-[#0e1621]' 
              : 'bg-[#8e9fae]/15'
          }`}
          style={{
            backgroundImage: isDarkTheme 
              ? 'radial-gradient(#1e2c3a 1px, transparent 1px)' 
              : 'radial-gradient(#94a3b8 0.75px, transparent 0.75px)',
            backgroundSize: '24px 24px'
          }}
        >
          
          {/* Date Separator Capsule */}
          <div className="flex justify-center my-3">
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-xs select-none backdrop-blur-md ${
              isDarkTheme ? 'bg-[#17212b]/80 text-slate-300' : 'bg-slate-900/40 text-white'
            }`}>
              Bugun
            </span>
          </div>

          {/* Messages Loop */}
          {displayedMessages.map((msg) => {
            const isUser = msg.role === MessageRole.USER;

            return (
              <div
                key={msg.id}
                id={msg.id}
                className={`flex flex-col group relative ${isUser ? 'items-end' : 'items-start'}`}
              >
                {/* Floating Telegram Reaction & Action Menu on hover */}
                <div className={`opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 ${
                  isUser ? 'right-2' : 'left-2'
                } flex items-center gap-1 bg-white dark:bg-[#17212b] border border-slate-200 dark:border-slate-700 rounded-full px-2 py-1 shadow-lg z-20`}>
                  {/* Quick Reactions */}
                  {['👍', '❤️', '🔥', '👏', '🧠'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleToggleReaction(msg.id, emoji)}
                      className="hover:scale-125 transition-transform text-sm cursor-pointer"
                    >
                      {emoji}
                    </button>
                  ))}

                  <div className="w-[1px] h-3.5 bg-slate-200 dark:bg-slate-700 mx-0.5"></div>

                  {/* Reply */}
                  <button
                    onClick={() => {
                      setReplyingTo(msg);
                      inputRef.current?.focus();
                    }}
                    className="p-1 text-slate-400 hover:text-[#3390ec] transition-colors"
                    title="Javob berish"
                  >
                    <Reply size={13} />
                  </button>

                  {/* Pin */}
                  <button
                    onClick={() => handleTogglePin(msg)}
                    className={`p-1 transition-colors ${msg.isPinned ? 'text-[#3390ec]' : 'text-slate-400 hover:text-[#3390ec]'}`}
                    title="Qadash"
                  >
                    <Pin size={13} />
                  </button>

                  {/* TTS Voice Speak */}
                  {msg.text && (
                    <button
                      onClick={() => handleTextToSpeech(msg.id, msg.text)}
                      className={`p-1 transition-colors ${speakingMessageId === msg.id ? 'text-[#3390ec]' : 'text-slate-400 hover:text-[#3390ec]'}`}
                      title="Ovozli eshitish"
                    >
                      <Volume2 size={13} />
                    </button>
                  )}

                  {/* Copy */}
                  {msg.text && (
                    <button
                      onClick={() => handleCopyMessage(msg.text)}
                      className="p-1 text-slate-400 hover:text-[#3390ec] transition-colors"
                      title="Nusxalash"
                    >
                      <Copy size={13} />
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="O'chirish"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                {/* TELEGRAM MESSAGE BUBBLE */}
                <div
                  className={`relative max-w-[88%] sm:max-w-[75%] md:max-w-[70%] p-3.5 rounded-[1.3rem] shadow-sm text-sm transition-all ${
                    isUser
                      ? isDarkTheme 
                        ? 'bg-[#2b5278] text-white rounded-br-xs' 
                        : 'bg-[#effedd] text-slate-900 rounded-br-xs'
                      : isDarkTheme 
                        ? 'bg-[#182533] text-slate-100 rounded-bl-xs' 
                        : 'bg-white text-slate-900 rounded-bl-xs'
                  }`}
                >
                  
                  {/* Sender Name in group or bot chats */}
                  {!isUser && activeDialog.role === 'bot' && (
                    <div className="font-extrabold text-xs text-[#3390ec] mb-1 flex items-center gap-1.5">
                      <span>{activeDialog.name}</span>
                      {msg.isPinned && <Pin size={11} className="rotate-45" />}
                    </div>
                  )}

                  {/* Quoted / Reply Preview Header */}
                  {msg.replyTo && (
                    <div className={`mb-2 pl-2.5 py-1 border-l-3 rounded-r-lg text-xs font-medium cursor-pointer ${
                      isUser
                        ? isDarkTheme ? 'border-[#3390ec] bg-black/20 text-slate-200' : 'border-[#3390ec] bg-black/5 text-slate-700'
                        : isDarkTheme ? 'border-[#3390ec] bg-white/5 text-slate-300' : 'border-[#3390ec] bg-blue-50/70 text-slate-700'
                    }`}>
                      <p className="font-extrabold text-[10px] text-[#3390ec]">{msg.replyTo.sender}</p>
                      <p className="truncate text-[11px]">{msg.replyTo.text}</p>
                    </div>
                  )}

                  {/* Image Attachment Card */}
                  {msg.imageUrl && (
                    <div className="mb-2 relative rounded-xl overflow-hidden group/img cursor-pointer" onClick={() => setPreviewImage(msg.imageUrl || null)}>
                      <img 
                        src={msg.imageUrl} 
                        alt="Biriktirilgan rasm" 
                        className="max-h-72 w-full object-cover rounded-xl hover:scale-102 transition-transform" 
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <ZoomIn size={24} />
                      </div>
                    </div>
                  )}

                  {/* Document / File Card */}
                  {msg.fileName && (
                    <div className={`mb-2 p-2.5 rounded-xl flex items-center gap-3 border ${
                      isDarkTheme ? 'bg-black/20 border-slate-700/50' : 'bg-slate-50 border-slate-200/70'
                    }`}>
                      <div className="w-10 h-10 rounded-lg bg-[#3390ec] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-bold text-xs truncate">{msg.fileName}</h5>
                        <p className="text-[10px] font-semibold text-slate-400">{msg.fileSize || '2.4 MB'}</p>
                      </div>
                      <button className="p-2 text-[#3390ec] hover:scale-110 transition-transform">
                        <Download size={18} />
                      </button>
                    </div>
                  )}

                  {/* Voice Message Player */}
                  {msg.audioUrl !== undefined && (
                    <div className="my-1">
                      <TelegramVoicePlayer
                        audioUrl={msg.audioUrl}
                        duration={msg.audioDuration}
                        isSender={isUser}
                      />
                    </div>
                  )}

                  {/* Main Message Text with Markdown */}
                  {msg.text && (
                    <div className="prose prose-slate dark:prose-invert prose-sm max-w-none break-words leading-relaxed">
                      <ReactMarkdown
                        components={{
                          code({ className, children, ...props }) {
                            const isCodeBlock = String(children).includes('\n');
                            if (isCodeBlock) {
                              return (
                                <div className="relative my-2 rounded-xl overflow-hidden bg-slate-950 text-slate-100 text-xs">
                                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-[10px] font-bold text-slate-400">
                                    <span>KOD BLOKI</span>
                                    <button
                                      onClick={() => handleCopyMessage(String(children))}
                                      className="flex items-center gap-1 hover:text-white transition-colors"
                                    >
                                      <Copy size={11} /> Nusxalash
                                    </button>
                                  </div>
                                  <pre className="p-3 overflow-x-auto">
                                    <code>{children}</code>
                                  </pre>
                                </div>
                              );
                            }
                            return (
                              <code className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-[12px] font-mono font-semibold" {...props}>
                                {children}
                              </code>
                            );
                          }
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}

                  {/* Grounding Web Links */}
                  {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 flex flex-wrap gap-1.5">
                      {msg.groundingLinks.map((link, i) => (
                        <a
                          key={i}
                          href={link.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#3390ec]/15 text-[#3390ec] hover:bg-[#3390ec]/25 flex items-center gap-1 transition-colors"
                        >
                          <Globe size={10} /> {link.title || 'Manba'}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Telegram Bubble Footer: Timestamp & Read Checkmarks */}
                  <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] font-bold select-none ${
                    isUser
                      ? isDarkTheme ? 'text-slate-300' : 'text-slate-500'
                      : isDarkTheme ? 'text-slate-400' : 'text-slate-400'
                  }`}>
                    <span>{formatMessageTime(msg.timestamp)}</span>
                    {isUser && (
                      <CheckCheck size={14} className="text-[#3390ec]" />
                    )}
                  </div>
                </div>

                {/* Telegram Floating Reaction Badges at bottom of Bubble */}
                {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                  <div className={`flex flex-wrap gap-1 mt-1 z-10 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    {Object.entries(msg.reactions).map(([emoji, count]) => {
                      if (!count || count <= 0) return null;
                      const isUserReacted = msg.userReaction === emoji;

                      return (
                        <button
                          key={emoji}
                          onClick={() => handleToggleReaction(msg.id, emoji)}
                          className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-90 cursor-pointer ${
                            isUserReacted
                              ? 'bg-[#3390ec] text-white border border-[#3390ec]'
                              : isDarkTheme 
                                ? 'bg-[#182533] text-slate-200 border border-slate-700 hover:bg-[#202b36]' 
                                : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span className="text-[10px]">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 pl-2 animate-in fade-in duration-200">
              <div className="w-8 h-8 rounded-full bg-[#3390ec] text-white flex items-center justify-center text-xs font-bold animate-pulse">
                {activeDialog.avatarText}
              </div>
              <div className={`px-4 py-2.5 rounded-2xl rounded-bl-xs text-xs font-semibold flex items-center gap-2 shadow-xs ${
                isDarkTheme ? 'bg-[#182533] text-slate-300' : 'bg-white text-slate-700'
              }`}>
                <Loader2 size={14} className="animate-spin text-[#3390ec]" />
                <span>{activeDialog.name} javob tayyorlamoqda...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. TELEGRAM BOTTOM INPUT BOX & ACTION BAR */}
        <div className={`p-3 border-t shrink-0 relative transition-colors ${
          isDarkTheme ? 'bg-[#17212b] border-slate-800' : 'bg-white border-slate-100'
        }`}>
          
          {/* Replying Banner */}
          {replyingTo && (
            <div className="mb-2 px-3 py-1.5 rounded-xl bg-[#3390ec]/10 border-l-4 border-[#3390ec] flex items-center justify-between text-xs animate-in slide-in-from-bottom duration-150">
              <div className="flex items-center gap-2 min-w-0">
                <Reply size={14} className="text-[#3390ec]" />
                <div className="min-w-0">
                  <span className="font-extrabold text-[#3390ec] text-[10px]">
                    {replyingTo.role === MessageRole.USER ? 'Sizga javob' : `${activeDialog.name}ga javob`}
                  </span>
                  <p className="truncate text-slate-600 dark:text-slate-300 text-[11px] max-w-sm">
                    {replyingTo.text}
                  </p>
                </div>
              </div>
              <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Attached Image/File Previews */}
          {selectedImage && (
            <div className="mb-2 relative inline-block animate-in zoom-in duration-150">
              <img src={selectedImage} alt="Selected" className="h-20 w-28 object-cover rounded-xl border-2 border-[#3390ec] shadow-md" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}

          {attachedFile && (
            <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-bold text-[#3390ec] animate-in zoom-in duration-150">
              <FileText size={14} />
              <span>{attachedFile.name} ({attachedFile.size})</span>
              <button onClick={() => setAttachedFile(null)} className="text-red-500 hover:text-red-600">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Emoji Picker Popup */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 z-50">
              <TelegramEmojiPicker
                onSelectEmoji={(emoji) => {
                  setInput(prev => prev + emoji);
                  inputRef.current?.focus();
                }}
                onClose={() => setShowEmojiPicker(false)}
              />
            </div>
          )}

          {/* Attach Menu Popup */}
          {showAttachMenu && (
            <div className="absolute bottom-16 left-12 bg-white dark:bg-[#17212b] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 w-48 animate-in zoom-in-95 duration-150">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                  <ImageIcon size={16} />
                </div>
                <span>Rasm / Foto</span>
              </button>

              <button
                onClick={() => docInputRef.current?.click()}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                  <FileText size={16} />
                </div>
                <span>Hujjat (PDF/Doc)</span>
              </button>
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
          />
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            ref={docInputRef}
            onChange={handleDocSelect}
            className="hidden"
          />

          {/* INPUT BAR ROW */}
          {isRecordingAudio ? (
            <TelegramAudioRecorder
              onSendAudio={handleSendVoiceNote}
              onCancel={() => setIsRecordingAudio(false)}
            />
          ) : (
            <div className="flex items-end gap-2">
              
              {/* Paperclip Attach Button */}
              <button
                type="button"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                  showAttachMenu ? 'text-[#3390ec] bg-[#3390ec]/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title="Fayl biriktirish"
              >
                <Paperclip size={20} className="-rotate-45" />
              </button>

              {/* Text Input Area */}
              <div className={`flex-1 flex items-center rounded-2xl px-3 py-1.5 transition-all ${
                isDarkTheme ? 'bg-[#242f3d] text-slate-100' : 'bg-slate-100 text-slate-900 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#3390ec]/30'
              }`}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Xabar yozing..."
                  className="flex-1 bg-transparent resize-none outline-none text-sm font-medium py-1.5 max-h-32 custom-scrollbar placeholder-slate-400"
                />

                {/* Emoji Picker Toggle */}
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    showEmojiPicker ? 'text-[#3390ec]' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title="Emoji & Stikerlar"
                >
                  <Smile size={20} />
                </button>
              </div>

              {/* Action Button: Mic or Telegram Send Airplane */}
              {input.trim() || selectedImage || attachedFile ? (
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isLoading}
                  className="w-11 h-11 rounded-full bg-[#3390ec] hover:bg-[#2884df] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0 disabled:opacity-50"
                  title="Yuborish"
                >
                  <Send size={18} className="ml-0.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRecordingAudio(true)}
                  className="w-11 h-11 rounded-full bg-[#3390ec] hover:bg-[#2884df] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
                  title="Ovozli xabar yozish"
                >
                  <Mic size={20} />
                </button>
              )}

            </div>
          )}
        </div>

      </div>

      {/* 4. FULLSCREEN IMAGE PREVIEW MODAL */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <button 
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 text-white hover:text-slate-300 p-2"
          >
            <X size={28} />
          </button>
          <img 
            src={previewImage} 
            alt="Preview" 
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl" 
          />
        </div>
      )}

      {/* 5. TELEGRAM AUDIO/VIDEO CALL SIMULATOR MODAL */}
      {isInCall && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-between p-8 text-white animate-in zoom-in-95 duration-200">
          {/* Call Header */}
          <div className="text-center space-y-2 pt-6">
            <h2 className="text-2xl font-black">{activeDialog.name}</h2>
            <p className="text-xs font-bold text-green-400 uppercase tracking-widest flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
              Jonli AI Ovozli Aloqa
            </p>
            <p className="text-lg font-mono text-slate-400">
              {Math.floor(callDuration / 60)}:{(callDuration % 60).toString().padStart(2, '0')}
            </p>
          </div>

          {/* Center Avatar & Pulsing Voice Rings */}
          <div className="relative flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-[#3390ec]/20 animate-ping absolute"></div>
            <div className="w-40 h-40 rounded-full bg-[#3390ec]/30 animate-pulse absolute"></div>
            <div className={`w-32 h-32 rounded-full bg-gradient-to-tr ${activeDialog.avatarBg} flex items-center justify-center text-4xl font-black shadow-2xl z-10`}>
              {activeDialog.avatarText}
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center gap-6 pb-10">
            <button
              onClick={() => setIsCallMuted(!isCallMuted)}
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                isCallMuted ? 'bg-red-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {isCallMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>

            <button
              onClick={() => setIsInCall(false)}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform cursor-pointer"
            >
              <PhoneOff size={28} />
            </button>

            <button
              onClick={() => {
                if ('speechSynthesis' in window) {
                  const u = new SpeechSynthesisUtterance("Salom! Men sizni eshitmoqdaman, savolingizni berishingiz mumkin.");
                  window.speechSynthesis.speak(u);
                }
              }}
              className="w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-transform hover:scale-110"
              title="AI Salomlashish"
            >
              <Sparkles size={24} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
