
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../types';
import { Globe, Search, ChevronDown, Check } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const primaryLanguages = [
    { value: Language.UZ, label: 'Oʻzbek', flag: '🇺🇿' },
    { value: Language.RU, label: 'Русский', flag: '🇷🇺' },
    { value: Language.EN, label: 'English', flag: '🇺🇸' },
  ];

  const options = [
    ...primaryLanguages,
    { value: Language.TR, label: 'Türkçe', flag: '🇹🇷' },
    { value: Language.ES, label: 'Español', flag: '🇪🇸' },
    { value: Language.FR, label: 'Français', flag: '🇫🇷' },
    { value: Language.DE, label: 'Deutsch', flag: '🇩🇪' },
    { value: Language.AR, label: 'العربية', flag: '🇸🇦' },
    { value: Language.ZH, label: '中文', flag: '🇨🇳' },
    { value: Language.JA, label: '日本語', flag: '🇯🇵' },
    { value: Language.KO, label: '한국어', flag: '🇰🇷' },
    { value: Language.HI, label: 'हिन्दी', flag: '🇮🇳' },
    { value: Language.PT, label: 'Português', flag: '🇵🇹' },
    { value: Language.IT, label: 'Italiano', flag: '🇮🇹' }
  ];

  const currentOption = options.find(o => o.value === language) || options[0];
  const filteredOptions = options.filter(o => 
    o.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative inline-flex items-center gap-1.5">
      {/* Quick Pills for UZ, RU, EN (Visible on desktop) */}
      <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
        {primaryLanguages.map((langObj) => {
          const isActive = language === langObj.value;
          return (
            <button
              key={langObj.value}
              onClick={() => setLanguage(langObj.value)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80 scale-105'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
              title={langObj.label}
            >
              <span>{langObj.flag}</span>
              <span>{langObj.value.toUpperCase()}</span>
            </button>
          );
        })}
      </div>

      {/* Dropdown Selector Button - Optimized for Mobile & Desktop */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 border border-slate-200 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs font-bold text-slate-800 hover:bg-slate-200/70 active:scale-95 transition-all shadow-xs cursor-pointer min-h-[38px]"
        >
          <span className="text-sm">{currentOption.flag}</span>
          <span className="inline text-[11px] sm:text-xs">{currentOption.label}</span>
          <ChevronDown size={14} className={`transition-transform text-slate-500 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="fixed sm:absolute top-16 sm:top-full mt-2 left-4 right-4 sm:left-auto sm:right-0 sm:w-64 bg-white border border-slate-200 rounded-2xl sm:rounded-2xl shadow-2xl z-[100] overflow-hidden animate-fade-in max-h-[80vh] flex flex-col">
            <div className="p-3 bg-slate-50 border-b border-slate-100 space-y-2 flex-shrink-0">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block px-1">
                Asosiy Tillardan Biri (UZ | RU | EN)
              </span>
              <div className="flex gap-1.5">
                {primaryLanguages.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => {
                      setLanguage(p.value);
                      setIsOpen(false);
                    }}
                    className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all min-h-[38px] cursor-pointer ${
                      language === p.value
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{p.flag}</span>
                    <span>{p.value.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-2.5 border-b border-slate-100 flex items-center gap-2 flex-shrink-0">
              <Search size={16} className="text-slate-400 pl-1" />
              <input 
                type="text" 
                placeholder="Tilni qidirish..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs outline-none bg-transparent font-medium text-slate-700 py-1"
                autoFocus
              />
            </div>

            <div className="max-h-56 overflow-y-auto custom-scrollbar p-1.5 divide-y divide-slate-50">
              {filteredOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setLanguage(opt.value);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs transition-colors cursor-pointer min-h-[44px] ${
                    language === opt.value
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-slate-600 hover:bg-slate-50 active:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{opt.flag}</span>
                    <span className="font-semibold text-xs">{opt.label}</span>
                  </div>
                  {language === opt.value && <Check size={16} className="text-primary" />}
                </button>
              ))}
              {filteredOptions.length === 0 && (
                <p className="p-4 text-center text-xs text-slate-400 italic">Til topilmadi</p>
              )}
            </div>
          </div>
        )}
        
        {/* Click outside to close */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-xs sm:bg-transparent" 
            onClick={() => setIsOpen(false)}
          ></div>
        )}
      </div>
    </div>
  );
};

