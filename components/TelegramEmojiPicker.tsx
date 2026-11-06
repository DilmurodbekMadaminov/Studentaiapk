import React, { useState } from 'react';
import { Smile, Sparkles, Heart, Zap, Coffee, GraduationCap, Code2, Globe } from 'lucide-react';

interface TelegramEmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

export const TelegramEmojiPicker: React.FC<TelegramEmojiPickerProps> = ({
  onSelectEmoji,
  onClose
}) => {
  const [activeCategory, setActiveCategory] = useState<'smileys' | 'study' | 'tech' | 'reactions' | 'gestures'>('smileys');

  const emojiData = {
    smileys: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
      '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
      '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸',
      '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️',
      '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡',
      '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
      '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯'
    ],
    study: [
      '🎓', '📚', '📖', '📝', '✍️', '📐', '📏', '🔬', '🔭', '🧪',
      '🧮', '📊', '📈', '📉', '💡', '🧠', '🏛️', '🏫', '🎒', '🖋️',
      '✏️', '📌', '📍', '📎', '🗓️', '📅', '🕒', '⏳', '🏆', '🥇',
      '🥈', '🥉', '🎯', '💯', '🎖️', '🏅', '📜', '🔍', '🔎', '📑'
    ],
    tech: [
      '💻', '🖥️', '⌨️', '🖱️', '📱', '🤖', '👾', '🚀', '🛰️', '📡',
      '⚡', '🔋', '🔌', '💾', '💿', '🕹️', '🛡️', '🔒', '🔑', '⚙️',
      '🛠️', '🧰', '✨', '🌐', '📡', '🕹️', '🔮', '🧬', '⚛️', '🌌'
    ],
    reactions: [
      '👍', '👎', '❤️', '🔥', '👏', '🎉', '💡', '🤯', '😱', '😍',
      '🤝', '🙌', '💯', '⚡', '🌟', '💪', '🙏', '🫡', '👀', '✨'
    ],
    gestures: [
      '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
      '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
      '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝'
    ]
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-80 sm:w-96 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
      {/* Category Tabs */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100 text-slate-500">
        <button
          type="button"
          onClick={() => setActiveCategory('smileys')}
          className={`p-2 rounded-xl transition-all ${
            activeCategory === 'smileys' ? 'bg-white text-[#3390ec] shadow-sm' : 'hover:text-slate-800'
          }`}
          title="Smileys"
        >
          <Smile size={18} />
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('study')}
          className={`p-2 rounded-xl transition-all ${
            activeCategory === 'study' ? 'bg-white text-[#3390ec] shadow-sm' : 'hover:text-slate-800'
          }`}
          title="Talaba & Ta'lim"
        >
          <GraduationCap size={18} />
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('tech')}
          className={`p-2 rounded-xl transition-all ${
            activeCategory === 'tech' ? 'bg-white text-[#3390ec] shadow-sm' : 'hover:text-slate-800'
          }`}
          title="Dasturlash & IT"
        >
          <Code2 size={18} />
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('reactions')}
          className={`p-2 rounded-xl transition-all ${
            activeCategory === 'reactions' ? 'bg-white text-[#3390ec] shadow-sm' : 'hover:text-slate-800'
          }`}
          title="Reaksiyalar"
        >
          <Heart size={18} />
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('gestures')}
          className={`p-2 rounded-xl transition-all ${
            activeCategory === 'gestures' ? 'bg-white text-[#3390ec] shadow-sm' : 'hover:text-slate-800'
          }`}
          title="Qo'l harakatlari"
        >
          <Zap size={18} />
        </button>
      </div>

      {/* Emoji Grid */}
      <div className="p-3 max-h-60 overflow-y-auto grid grid-cols-7 sm:grid-cols-8 gap-1.5 custom-scrollbar text-2xl">
        {emojiData[activeCategory].map((emoji, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              onSelectEmoji(emoji);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 hover:scale-125 transition-transform active:scale-95 cursor-pointer select-none"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Footer / Quick reaction row */}
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tezkor emoji</span>
        <div className="flex gap-1 text-base">
          {['👍', '❤️', '🔥', '🎉', '🧠'].map((quickEmoji) => (
            <button
              key={quickEmoji}
              type="button"
              onClick={() => onSelectEmoji(quickEmoji)}
              className="hover:scale-125 transition-transform px-1 cursor-pointer"
            >
              {quickEmoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
