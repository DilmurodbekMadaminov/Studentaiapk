import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Phone, Video, Paperclip, Code, Mic, Check, CheckCheck, 
  DollarSign, FileText, Play, Pause, X, ShieldCheck, Info, ChevronRight,
  Smile, CornerDownRight, AlertCircle, RefreshCw, Layers, Reply, Copy,
  Trash2, Image as ImageIcon, Download, ZoomIn, PhoneOff, Volume2, VolumeX,
  Heart, Flame, ThumbsUp, PartyPopper, UserCheck, MessageSquare, Briefcase
} from 'lucide-react';
import { FreelanceChat, FreelanceChatMessage } from '../types';
import { TelegramVoicePlayer } from './TelegramVoicePlayer';
import { TelegramEmojiPicker } from './TelegramEmojiPicker';
import { TelegramAudioRecorder } from './TelegramAudioRecorder';

interface FreelanceChatViewProps {
  chat: FreelanceChat;
  onSendMessage: (message: Partial<FreelanceChatMessage>) => void;
  onAcceptOffer?: (chatId: string, msgId: string) => void;
  onReleaseMilestone?: (chatId: string, msgId: string) => void;
}

export const FreelanceChatView: React.FC<FreelanceChatViewProps> = ({
  chat,
  onSendMessage,
  onAcceptOffer,
  onReleaseMilestone,
}) => {
  const [inputText, setInputText] = useState('');
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showContractDrawer, setShowContractDrawer] = useState(false);
  const [replyingTo, setReplyingTo] = useState<FreelanceChatMessage | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  
  // Call states
  const [activeCallType, setActiveCallType] = useState<'audio' | 'video' | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Modals & previews
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; type: string } | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [codeSnippet, setCodeSnippet] = useState({ code: '', language: 'javascript' });
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerBudget, setOfferBudget] = useState('$500');
  const [offerDays, setOfferDays] = useState('5 kun');
  const [offerTitle, setOfferTitle] = useState('Bosqichli Ish Taklifi');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  // Call timer
  useEffect(() => {
    let interval: any;
    if (activeCallType) {
      interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [activeCallType]);

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendText = () => {
    if (!inputText.trim() && !selectedImage && !attachedFile) return;

    onSendMessage({
      text: inputText.trim(),
      isSender: true,
      senderName: "Siz",
      imageUrl: selectedImage || undefined,
      fileData: attachedFile ? {
        fileName: attachedFile.name,
        fileSize: attachedFile.size,
        fileType: attachedFile.type
      } : undefined,
      replyTo: replyingTo ? {
        id: replyingTo.id,
        text: replyingTo.text ? (replyingTo.text.slice(0, 60) + (replyingTo.text.length > 60 ? '...' : '')) : 'Xabar',
        sender: replyingTo.isSender ? "Siz" : chat.freelancerName
      } : undefined,
      type: selectedImage ? 'image' : (attachedFile ? 'file' : 'text'),
      status: 'read'
    });

    setInputText('');
    setSelectedImage(null);
    setAttachedFile(null);
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowAttachmentMenu(false);
  };

  const handleSendVoiceNote = (audioBlobUrl: string, durationSeconds: number) => {
    setIsRecordingVoice(false);

    onSendMessage({
      text: `🎙️ Ovozli xabar (${formatSeconds(durationSeconds || 10)})`,
      isSender: true,
      senderName: "Siz",
      type: 'voice',
      audioUrl: audioBlobUrl || undefined,
      audioDuration: formatSeconds(durationSeconds || 10),
      status: 'read'
    });
  };

  const handleSendCodeSnippet = () => {
    if (!codeSnippet.code.trim()) return;

    onSendMessage({
      text: `💻 Kod namunasi (${codeSnippet.language}):`,
      isSender: true,
      senderName: "Siz",
      type: 'code',
      codeData: {
        code: codeSnippet.code,
        language: codeSnippet.language
      },
      status: 'read'
    });
    setCodeSnippet({ code: '', language: 'javascript' });
    setShowCodeModal(false);
  };

  const handleSendOffer = () => {
    onSendMessage({
      text: `📜 Rasmiy shartnoma taklifi: ${offerTitle}`,
      isSender: true,
      senderName: "Siz",
      type: 'offer',
      offerData: {
        budget: offerBudget,
        days: offerDays,
        title: offerTitle,
        status: 'pending'
      },
      status: 'read'
    });
    setShowOfferModal(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setShowAttachmentMenu(false);
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
      setShowAttachmentMenu(false);
    }
  };

  const handleAddReaction = (msgId: string, emoji: string) => {
    const chatIndex = chat.messages.findIndex(m => m.id === msgId);
    if (chatIndex === -1) return;

    const msg = chat.messages[chatIndex];
    const reactions = { ...(msg.reactions || {}) };
    
    if (msg.userReaction === emoji) {
      reactions[emoji] = Math.max(0, (reactions[emoji] || 1) - 1);
      if (reactions[emoji] === 0) delete reactions[emoji];
      msg.userReaction = undefined;
    } else {
      if (msg.userReaction && reactions[msg.userReaction]) {
        reactions[msg.userReaction] = Math.max(0, reactions[msg.userReaction] - 1);
        if (reactions[msg.userReaction] === 0) delete reactions[msg.userReaction];
      }
      reactions[emoji] = (reactions[emoji] || 0) + 1;
      msg.userReaction = emoji;
    }

    msg.reactions = reactions;
    onSendMessage({});
  };

  const quickReplies = [
    "Assalomu alaykum, arizangiz bilan tanishib chiqdim.",
    "Loyiha bo'yicha Figma maketlari va talablarni yubordim.",
    "Topshiriqni qachondan boshlashga tayyorsiz?",
    "Ajoyib, 1-bosqich uchun Escrow to'lovini kiritdim.",
    "Bajarilgan qismni ko'rsatib bera olasizmi?"
  ];

  return (
    <div className="flex-1 flex flex-col bg-slate-100/70 h-full relative overflow-hidden text-left">
      
      {/* 1. TOP CHAT HEADER (Telegram & Instagram Direct Style) */}
      <div className="px-4 py-3 md:px-6 md:py-3.5 bg-white border-b border-slate-200/80 flex justify-between items-center shadow-xs z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-lg font-black shadow-sm">
              {chat.freelancerName.charAt(0)}
            </div>
            <span className="w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5 animate-pulse"></span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-slate-800 text-sm md:text-base leading-tight truncate">
                {chat.freelancerName}
              </h4>
              <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[9px] font-black uppercase tracking-wider rounded-md border border-green-200/80">
                Onlayn
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500 truncate">
              {chat.freelancerRole}
            </p>
            <p className="text-[10px] font-black text-[#3390ec] truncate flex items-center gap-1 mt-0.5">
              <Briefcase size={11} /> {chat.projectTitle}
            </p>
          </div>
        </div>

        {/* Action Controls: Audio Call, Video Interview, Escrow Drawer */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          <button 
            type="button"
            onClick={() => setActiveCallType('audio')}
            title="Ovozli qo'ng'iroq (Jonli suhbat)"
            className="p-2.5 bg-slate-50 hover:bg-green-50 hover:text-green-600 text-slate-600 rounded-xl transition-all cursor-pointer border border-slate-200"
          >
            <Phone size={17} />
          </button>

          <button 
            type="button"
            onClick={() => setActiveCallType('video')}
            title="Video intervyu (Jonli muloqot)"
            className="p-2.5 bg-slate-50 hover:bg-blue-50 hover:text-[#3390ec] text-slate-600 rounded-xl transition-all cursor-pointer border border-slate-200"
          >
            <Video size={17} />
          </button>

          <button 
            type="button"
            onClick={() => setShowContractDrawer(!showContractDrawer)}
            className={`px-3 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer border ${
              showContractDrawer 
                ? 'bg-[#3390ec] border-[#3390ec] text-white shadow-sm' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Layers size={14} /> <span className="hidden sm:inline">Shartnoma & Escrow</span>
          </button>
        </div>
      </div>

      {/* 2. CONTRACT & ESCROW SIDE DRAWER */}
      {showContractDrawer && (
        <div className="absolute top-16 right-4 w-80 md:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl p-5 z-30 animate-in slide-in-from-right duration-150 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h5 className="font-black text-slate-800 text-sm flex items-center gap-2">
              <ShieldCheck className="text-green-500" size={18} /> Escrow Himoyalangan Muloqot
            </h5>
            <button onClick={() => setShowContractDrawer(false)} className="text-slate-400 hover:text-slate-600 p-1">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-150 space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-400">Kelishilgan Loyiha Qiymati</span>
              <p className="text-lg font-black text-slate-900">$500.00 USD</p>
              <p className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                <Check size={12} /> $250.00 Garovda (Escrow) ushlab turilibdi
              </p>
            </div>

            <div className="space-y-2">
              <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Shartnoma Bosqichlari</p>
              <div className="p-3 bg-green-50/70 border border-green-200 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-black text-slate-800">1-Bosqich: Dizayn va API</p>
                  <p className="text-[10px] text-slate-500 font-bold">$250 • Bajarildi</p>
                </div>
                <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-black rounded-lg">Tayyor</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center opacity-80">
                <div>
                  <p className="font-black text-slate-800">2-Bosqich: Integratsiya</p>
                  <p className="text-[10px] text-slate-500 font-bold">$250 • Jarayonda</p>
                </div>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-600 text-[9px] font-black rounded-lg">Kutilmoqda</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => { setShowContractDrawer(false); setShowOfferModal(true); }}
              className="w-full py-3 bg-[#3390ec] hover:bg-[#2884df] text-white rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md"
            >
              + Yangi Shartnoma Taklifini Yuborish
            </button>
          </div>
        </div>
      )}

      {/* 3. INTERACTIVE AUDIO & VIDEO CALL MODAL */}
      {activeCallType && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-40 flex flex-col items-center justify-between p-8 text-white animate-in zoom-in-95 duration-150">
          <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10 text-xs font-bold">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
            {activeCallType === 'video' ? 'Video Intervyu (Jonli Aloqa)' : 'Ovozli Muloqot'} • {formatSeconds(callDuration)}
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-black text-4xl flex items-center justify-center shadow-2xl border-4 border-white/20">
                {chat.freelancerName.charAt(0)}
              </div>
              {!isMuted && (
                <div className="absolute -inset-3 rounded-full border-2 border-green-400/40 animate-ping pointer-events-none"></div>
              )}
            </div>
            <h3 className="text-2xl font-black">{chat.freelancerName}</h3>
            <p className="text-xs font-bold text-blue-300">{chat.projectTitle}</p>
          </div>

          <div className="flex items-center gap-6">
            <button 
              type="button"
              onClick={() => setIsMuted(!isMuted)} 
              className={`p-4 rounded-2xl transition-all cursor-pointer ${isMuted ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
            >
              <Mic size={22} />
            </button>
            {activeCallType === 'video' && (
              <button 
                type="button"
                onClick={() => setIsVideoOff(!isVideoOff)} 
                className={`p-4 rounded-2xl transition-all cursor-pointer ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}
              >
                <Video size={22} />
              </button>
            )}
            <button 
              type="button"
              onClick={() => setActiveCallType(null)} 
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl cursor-pointer"
            >
              <PhoneOff size={20} className="inline mr-2" /> Qo'ng'iroqni Yakunlash
            </button>
          </div>
        </div>
      )}

      {/* 4. MESSAGES SCROLL AREA (Telegram & SMS Bubble Style) */}
      <div 
        className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 custom-scrollbar"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 0.65px, transparent 0.65px)',
          backgroundSize: '24px 24px'
        }}
      >
        
        {/* Protection & Trust Banner */}
        <div className="p-3 bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs text-slate-700 shadow-xs mb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-green-600 shrink-0" />
            <span className="font-semibold text-[11px]">
              To'g'ridan-to'g'ri xavfsiz va shifrlangan muloqot tizimi.
            </span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-[#3390ec] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            Jonli Muloqot
          </span>
        </div>

        {/* Date capsule */}
        <div className="flex justify-center my-2">
          <span className="px-3 py-1 bg-slate-900/35 backdrop-blur-md text-white text-[10px] font-bold rounded-full select-none">
            Bugun
          </span>
        </div>

        {chat.messages.map((msg) => {
          const isMe = msg.isSender;

          return (
            <div 
              key={msg.id} 
              id={msg.id}
              className={`flex flex-col group relative ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-150`}
            >
              
              {/* Floating Quick Action Toolbar on Hover */}
              <div className={`opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 ${
                isMe ? 'right-2' : 'left-2'
              } flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2 py-1 shadow-lg z-20`}>
                {['👍', '❤️', '🔥', '👏', '😂'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleAddReaction(msg.id, emoji)}
                    className="hover:scale-125 transition-transform text-sm cursor-pointer"
                  >
                    {emoji}
                  </button>
                ))}

                <div className="w-[1px] h-3.5 bg-slate-200 mx-0.5"></div>

                <button
                  type="button"
                  onClick={() => {
                    setReplyingTo(msg);
                    inputRef.current?.focus();
                  }}
                  className="p-1 text-slate-400 hover:text-[#3390ec]"
                  title="Javob berish"
                >
                  <Reply size={13} />
                </button>

                {msg.text && (
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(msg.text)}
                    className="p-1 text-slate-400 hover:text-[#3390ec]"
                    title="Nusxalash"
                  >
                    <Copy size={13} />
                  </button>
                )}
              </div>

              {/* MESSAGE BUBBLE */}
              <div
                className={`relative max-w-[88%] sm:max-w-[75%] md:max-w-[68%] p-3.5 rounded-[1.3rem] shadow-xs text-sm transition-all ${
                  isMe
                    ? 'bg-[#effedd] text-slate-900 rounded-br-xs border border-green-200/50'
                    : 'bg-white text-slate-900 rounded-bl-xs border border-slate-200/70'
                }`}
              >
                
                {/* Quoted / Reply Header */}
                {msg.replyTo && (
                  <div className="mb-2 pl-2.5 py-1 border-l-3 border-[#3390ec] bg-black/5 rounded-r-lg text-xs font-medium">
                    <p className="font-extrabold text-[10px] text-[#3390ec]">{msg.replyTo.sender}</p>
                    <p className="truncate text-[11px] text-slate-700">{msg.replyTo.text}</p>
                  </div>
                )}

                {/* Attached Image */}
                {msg.imageUrl && (
                  <div 
                    onClick={() => setPreviewImage(msg.imageUrl || null)}
                    className="mb-2 relative rounded-xl overflow-hidden cursor-pointer group/img"
                  >
                    <img 
                      src={msg.imageUrl} 
                      alt="Biriktirilgan rasm" 
                      className="max-h-64 w-full object-cover rounded-xl hover:scale-102 transition-transform" 
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ZoomIn size={22} />
                    </div>
                  </div>
                )}

                {/* Document File Card */}
                {msg.fileData && (
                  <div className="mb-2 p-2.5 rounded-xl flex items-center gap-3 bg-slate-50 border border-slate-200">
                    <div className="w-9 h-9 rounded-lg bg-[#3390ec] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-xs truncate">{msg.fileData.fileName}</h5>
                      <p className="text-[10px] font-semibold text-slate-400">{msg.fileData.fileSize}</p>
                    </div>
                    <button className="p-1.5 text-[#3390ec] hover:scale-110 transition-transform">
                      <Download size={16} />
                    </button>
                  </div>
                )}

                {/* Voice Note Player */}
                {msg.type === 'voice' && (
                  <div className="my-1">
                    <TelegramVoicePlayer
                      audioUrl={msg.audioUrl}
                      isSender={isMe}
                    />
                  </div>
                )}

                {/* Escrow Contract Offer Card */}
                {msg.type === 'offer' && msg.offerData && (
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 my-2 shadow-xs">
                    <div className="flex items-center gap-1.5 text-[#3390ec] font-black text-xs uppercase tracking-wider">
                      <FileText size={16} /> {msg.offerData.title}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase block">Budjet</span>
                        <span className="text-slate-900 font-black text-sm">{msg.offerData.budget}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase block">Muddat</span>
                        <span className="text-slate-900 font-black text-sm">{msg.offerData.days}</span>
                      </div>
                    </div>
                    <div className="pt-1">
                      {msg.offerData.status === 'pending' ? (
                        <button 
                          type="button"
                          onClick={() => onAcceptOffer && onAcceptOffer(chat.id, msg.id)}
                          className="w-full py-2 bg-green-500 hover:bg-green-600 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all shadow cursor-pointer text-center"
                        >
                          ✓ Taklifni Qabul Qilish (Escrow Tasdiqlash)
                        </button>
                      ) : (
                        <div className="w-full py-2 bg-green-100 text-green-700 font-black text-[10px] uppercase tracking-wider text-center rounded-lg border border-green-200">
                          ✓ Taklif Tasdiqlandi va Shartnoma Tuzildi
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Code Snippet Card */}
                {msg.type === 'code' && msg.codeData && (
                  <div className="bg-slate-950 text-slate-100 p-3 rounded-xl my-2 font-mono text-xs overflow-x-auto space-y-2 border border-slate-800">
                    <div className="flex justify-between items-center text-[9px] text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-1">
                      <span>{msg.codeData.language}</span>
                      <button 
                        type="button"
                        onClick={() => navigator.clipboard.writeText(msg.codeData?.code || '')}
                        className="hover:text-white transition-colors cursor-pointer"
                      >
                        Nusxa olish
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap">{msg.codeData.code}</pre>
                  </div>
                )}

                {/* Text Message */}
                {msg.text && (
                  <p className="text-xs md:text-sm font-semibold leading-relaxed whitespace-pre-wrap">
                    {msg.text}
                  </p>
                )}

                {/* Footer: Timestamp & Read Status */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] font-bold text-slate-500 select-none">
                  <span>{msg.time}</span>
                  {isMe && <CheckCheck size={13} className="text-[#3390ec]" />}
                </div>

              </div>

              {/* Reaction Badges */}
              {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                <div className={`flex flex-wrap gap-1 mt-1 z-10 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {Object.entries(msg.reactions).map(([emoji, count]) => {
                    if (!count || count <= 0) return null;
                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleAddReaction(msg.id, emoji)}
                        className="px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-xs bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 cursor-pointer"
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

        <div ref={messagesEndRef} />
      </div>

      {/* 5. QUICK DIRECT RESPONSE CHIPS BAR */}
      <div className="bg-white/95 border-t border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider shrink-0 flex items-center gap-1">
          💬 Tezkor:
        </span>
        {quickReplies.map((reply, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setInputText(reply)}
            className="px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-[#3390ec] text-slate-700 text-xs font-bold rounded-full whitespace-nowrap transition-colors border border-slate-200/60 cursor-pointer"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* 6. INPUT AREA FOOTER */}
      <div className="p-3.5 bg-white border-t border-slate-200 space-y-2.5">
        
        {/* Action toolbar buttons: Code, Contract Offer */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button 
              type="button"
              onClick={() => setShowCodeModal(true)} 
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <Code size={13} /> Kod
            </button>
            <button 
              type="button"
              onClick={() => setShowOfferModal(true)} 
              className="px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer border border-green-200"
            >
              <DollarSign size={13} /> Shartnoma Taklifi
            </button>
          </div>
        </div>

        {/* Replying banner */}
        {replyingTo && (
          <div className="px-3 py-1.5 rounded-xl bg-[#3390ec]/10 border-l-4 border-[#3390ec] flex items-center justify-between text-xs animate-in slide-in-from-bottom duration-150">
            <div className="flex items-center gap-2 min-w-0">
              <Reply size={14} className="text-[#3390ec]" />
              <div className="min-w-0">
                <span className="font-extrabold text-[#3390ec] text-[10px]">
                  {replyingTo.isSender ? 'Sizning xabaringizga javob' : `${chat.freelancerName}ga javob`}
                </span>
                <p className="truncate text-slate-700 text-[11px] max-w-sm">
                  {replyingTo.text}
                </p>
              </div>
            </div>
            <button onClick={() => setReplyingTo(null)} className="text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Image/File Attach Preview */}
        {selectedImage && (
          <div className="relative inline-block animate-in zoom-in duration-150">
            <img src={selectedImage} alt="Selected" className="h-16 w-24 object-cover rounded-xl border-2 border-[#3390ec] shadow-sm" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-600"
            >
              ×
            </button>
          </div>
        )}

        {attachedFile && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-bold text-[#3390ec] animate-in zoom-in duration-150">
            <FileText size={14} />
            <span>{attachedFile.name} ({attachedFile.size})</span>
            <button onClick={() => setAttachedFile(null)} className="text-red-500 hover:text-red-600">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div className="absolute bottom-20 left-6 z-50">
            <TelegramEmojiPicker
              onSelectEmoji={(emoji) => {
                setInputText(prev => prev + emoji);
                inputRef.current?.focus();
              }}
              onClose={() => setShowEmojiPicker(false)}
            />
          </div>
        )}

        {/* Attachment menu */}
        {showAttachmentMenu && (
          <div className="absolute bottom-20 left-10 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 w-48 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center">
                <ImageIcon size={16} />
              </div>
              <span>Rasm / Screenshot</span>
            </button>

            <button
              onClick={() => docInputRef.current?.click()}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 text-slate-700 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500 text-white flex items-center justify-center">
                <FileText size={16} />
              </div>
              <span>Hujjat (PDF / Word)</span>
            </button>
          </div>
        )}

        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageSelect} className="hidden" />
        <input type="file" accept=".pdf,.docx,.doc,.txt" ref={docInputRef} onChange={handleDocSelect} className="hidden" />

        {/* Input Bar Row */}
        {isRecordingVoice ? (
          <TelegramAudioRecorder
            onSendAudio={handleSendVoiceNote}
            onCancel={() => setIsRecordingVoice(false)}
          />
        ) : (
          <div className="flex items-center gap-2">
            
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className={`p-2.5 rounded-full transition-colors cursor-pointer ${
                showAttachmentMenu ? 'text-[#3390ec] bg-[#3390ec]/10' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Fayl biriktirish"
            >
              <Paperclip size={19} className="-rotate-45" />
            </button>

            {/* Main Input Text Field */}
            <div className="flex-1 flex items-center bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#3390ec]/30 rounded-2xl px-3 py-1.5 transition-all border border-slate-200/70">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendText();
                  }
                }}
                placeholder="Xabar yozing..."
                className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm font-semibold text-slate-900 placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1 rounded-full transition-colors cursor-pointer ${
                  showEmojiPicker ? 'text-[#3390ec]' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Smile size={19} />
              </button>
            </div>

            {/* Send / Mic Button */}
            {inputText.trim() || selectedImage || attachedFile ? (
              <button
                type="button"
                onClick={handleSendText}
                className="w-10 h-10 rounded-full bg-[#3390ec] hover:bg-[#2884df] flex items-center justify-center text-white shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
                title="Yuborish"
              >
                <Send size={17} className="ml-0.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRecordingVoice(true)}
                className="w-10 h-10 rounded-full bg-[#3390ec] hover:bg-[#2884df] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0"
                title="Ovozli xabar yozish"
              >
                <Mic size={19} />
              </button>
            )}

          </div>
        )}

      </div>

      {/* Code Snippet Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-black text-slate-800 text-base flex items-center gap-2">
                <Code className="text-[#3390ec]" size={20} /> Kod Namunasi Yuborish
              </h4>
              <button onClick={() => setShowCodeModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Dasturlash tili</label>
              <select 
                value={codeSnippet.language}
                onChange={e => setCodeSnippet({ ...codeSnippet, language: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="javascript">JavaScript / TypeScript</option>
                <option value="python">Python</option>
                <option value="html">HTML / CSS</option>
                <option value="sql">SQL</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Kod matni</label>
              <textarea 
                rows={6}
                value={codeSnippet.code}
                onChange={e => setCodeSnippet({ ...codeSnippet, code: e.target.value })}
                placeholder="// Kodni shu yerga kiriting..."
                className="w-full p-3 bg-slate-950 text-green-400 font-mono text-xs rounded-xl border border-slate-800 outline-none"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowCodeModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-black text-xs uppercase tracking-wider">
                Bekor Qilish
              </button>
              <button onClick={handleSendCodeSnippet} disabled={!codeSnippet.code.trim()} className="flex-1 py-2.5 bg-[#3390ec] text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-blue-600 shadow disabled:opacity-50">
                Yuborish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 animate-in zoom-in-95 duration-150 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-black text-slate-800 text-base flex items-center gap-2">
                <FileText className="text-[#3390ec]" size={20} /> Rasmiy Shartnoma Taklifi
              </h4>
              <button onClick={() => setShowOfferModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Bosqich nomi</label>
                <input type="text" value={offerTitle} onChange={e => setOfferTitle(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800" placeholder="Masalan: 1-Bosqich Frontend" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Budjet ($ USD)</label>
                  <input type="text" value={offerBudget} onChange={e => setOfferBudget(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Muddat</label>
                  <input type="text" value={offerDays} onChange={e => setOfferDays(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-800" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowOfferModal(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-500 rounded-xl font-black text-xs uppercase tracking-wider">
                Bekor qil
              </button>
              <button onClick={handleSendOffer} className="flex-1 py-2.5 bg-[#3390ec] text-white rounded-xl font-black text-xs uppercase tracking-wider hover:bg-blue-600 shadow">
                Taklifni Yuborish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-150"
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

    </div>
  );
};
