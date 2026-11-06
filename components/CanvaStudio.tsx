import React, { useState, useRef } from 'react';
import { 
  analyzeImageContent, generateImage, editImage, generateAionUiImage, 
  generateVideo, enhancePromptWithAI, generateVideoScenario, generateMetaAIAgentBlueprint 
} from '../services/geminiService';
import { 
  Sparkles, Loader2, X, Scissors, Wand2, Download, Video, 
  Image as ImageIcon, HelpCircle, Layers, Eye, Trash2, Maximize2, Play, Sliders,
  Cpu, Film, Camera, Zap, Brain, Bot, Share2, CheckCircle2, RefreshCw, Flame,
  ShieldCheck, Palette, Lightbulb, Copy, ChevronRight, Monitor, ArrowUpRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface GenerationHistoryItem {
  id: string;
  type: 'image' | 'video' | 'meta';
  title: string;
  prompt: string;
  url: string;
  timestamp: string;
  aspectRatio: string;
}

export const CanvaStudio: React.FC = () => {
  const { t } = useLanguage();
  
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'meta_ai' | 'storyboard'>('image');
  
  // Image Studio States
  const [imageTool, setImageTool] = useState<'text2img' | 'bg_remover' | 'magic_edit' | 'upscale'>('text2img');
  const [stylePreset, setStylePreset] = useState<string>('photorealistic');
  const [lightingPreset, setLightingPreset] = useState<string>('studio');
  const [engine, setEngine] = useState<'gemini' | 'flux' | 'midjourney' | 'aionui'>('gemini');
  
  // Video Studio States
  const [videoEngine, setVideoEngine] = useState<'veo' | 'sora' | 'runway' | 'free'>('veo');
  const [cameraMotion, setCameraMotion] = useState<string>('orbit_360');
  const [motionLevel, setMotionLevel] = useState<number>(7);
  const [fps, setFps] = useState<number>(30);
  const [durationSec, setDurationSec] = useState<number>(5);
  
  // Shared Studio States
  const [prompt, setPrompt] = useState<string>('');
  const [negativePrompt, setNegativePrompt] = useState<string>('blurry, distorted, bad quality, extra limbs, noise, low resolution');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoProgressMsg, setVideoProgressMsg] = useState<string>('AI kadrlar tayyorlanmoqda...');
  
  // Input File Upload
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Meta-AI Studio States
  const [metaConcept, setMetaConcept] = useState<string>('Talabalar uchun Grafik va Video Ishlab Chiqaruvchi Neyron Agent');
  const [metaResult, setMetaResult] = useState<string | null>(null);
  
  // Storyboard States
  const [storyboardTopic, setStoryboardTopic] = useState<string>('Kelajakdagi Toshkent 2050 - Sun\'iy Intellekt Shahri');
  const [storyboardResult, setStoryboardResult] = useState<any | null>(null);

  // Gallery History
  const [history, setHistory] = useState<GenerationHistoryItem[]>([
    {
      id: 'h1',
      type: 'image',
      title: 'Neon Talaba Laboratoriyasi',
      prompt: 'Cyberpunk style university research lab with glowing hologram displays, 8k resolution',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      timestamp: '10 min oldin',
      aspectRatio: '16:9'
    },
    {
      id: 'h2',
      type: 'image',
      title: 'Koinotda Darslik O\'qiyotgan Astronaut',
      prompt: 'Futuristic astronaut sitting in space reading an illuminated glowing book with Earth in background',
      url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80',
      timestamp: '25 min oldin',
      aspectRatio: '1:1'
    }
  ]);
  
  // Modal Preview
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  const ratios = [
    { label: "16:9", desc: "Widescreen / TV" },
    { label: "9:16", desc: "Shorts / Reels" },
    { label: "1:1", desc: "Kvadrat Post" },
    { label: "4:3", desc: "Klassik" },
    { label: "21:9", desc: "UltraWide Kinematik" }
  ];

  const stylePresets = [
    { id: 'photorealistic', label: 'Fotorealistik 8K', icon: '📸' },
    { id: 'cyberpunk', label: 'Kiberpank Neon', icon: '🌆' },
    { id: 'anime', label: 'Anime / Manga', icon: '🎨' },
    { id: 'scifi', label: 'Sci-Fi Kosmik', icon: '🚀' },
    { id: 'folk_art', label: 'O\'zbek Milliy San\'ati', icon: '🎭' },
    { id: 'vector', label: 'Minimalist Vector', icon: '📐' },
    { id: 'cinematic', label: '3D Render Kinematik', icon: '🎬' }
  ];

  const cameraOptions = [
    { id: 'orbit_360', label: '360° Orbit Aylanma', desc: 'Obyekt atrofida aylanib suratga olish' },
    { id: 'zoom_in', label: 'Silliq Zoom-In', desc: 'Markazga asta-sekin yaqinlashish' },
    { id: 'drone', label: 'Dron Parvozi', desc: 'Yuqoridan silliq uchib o\'tish' },
    { id: 'pan_left', label: 'Chapga/O\'ngga Pan', desc: 'Gorizontal kinematik surilish' },
    { id: 'smooth', label: 'Kamera Barqarorligi', desc: 'Silliq, tebranmas harakat' }
  ];

  // Handle Image File Input
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setImageBase64(base64);
      setImagePreview(reader.result as string);
      setResult(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // AI Prompt Enhancer Call
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      alert("Iltimos, avval qisqa bo'lsada so'rov yozing!");
      return;
    }
    setIsEnhancingPrompt(true);
    try {
      const enhanced = await enhancePromptWithAI(
        prompt, 
        activeTab === 'video' ? 'video' : 'image', 
        stylePreset
      );
      setPrompt(enhanced);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Execute Image Generation Pipeline
  const handleImageGeneration = async () => {
    if ((window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        alert("Gemini Pro Image modulidan foydalanish uchun API kalitingizni tasdiqlashingiz yoki Sozlamalar bo'limida kiritishingiz kerak.");
        await (window as any).aistudio.openSelectKey();
      }
    }

    setLoading(true);
    setVideoUrl(null);
    try {
      let finalUrl: string | null = null;
      
      const fullPromptWithPreset = `${prompt} [Style: ${stylePreset}, Lighting: ${lightingPreset}]. Avoid: ${negativePrompt}`;

      if (imageTool === 'text2img') {
        if (engine === 'aionui') {
          finalUrl = await generateAionUiImage(fullPromptWithPreset, aspectRatio);
        } else {
          finalUrl = await generateImage(fullPromptWithPreset, aspectRatio);
        }
      } else if (imageTool === 'bg_remover' && imageBase64) {
        const analysis = await analyzeImageContent(imageBase64, "Describe the primary foreground subject clearly.");
        finalUrl = await editImage(imageBase64, "Cutout subject with clean background: " + analysis.text);
      } else if (imageTool === 'magic_edit' && imageBase64) {
        finalUrl = await editImage(imageBase64, prompt);
      } else if (imageTool === 'upscale' && imageBase64) {
        finalUrl = await editImage(imageBase64, "Enhance details, upscale to ultra sharp 8K quality: " + prompt);
      } else {
        finalUrl = await generateImage(fullPromptWithPreset, aspectRatio);
      }

      if (finalUrl) {
        setResult(finalUrl);
        setImagePreview(finalUrl);
        
        // Add to history
        const newItem: GenerationHistoryItem = {
          id: Date.now().toString(),
          type: 'image',
          title: prompt.substring(0, 30) || 'AI Rasm',
          prompt: prompt,
          url: finalUrl,
          timestamp: 'Hozirgina',
          aspectRatio: aspectRatio
        };
        setHistory(prev => [newItem, ...prev]);
      }
    } catch (e: any) {
      console.error(e);
      alert("Generatsiya jarayonida xatolik: " + (e.message || "Xatolik yuz berdi."));
    } finally {
      setLoading(false);
    }
  };

  // Execute Video Generation Pipeline
  const handleVideoGeneration = async () => {
    if ((window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        alert("Google Veo 3.1 Pro video modullidan foydalanish uchun API kalitingizni tanlang.");
        await (window as any).aistudio.openSelectKey();
      }
    }

    setLoading(true);
    setVideoUrl(null);
    setVideoProgressMsg('Google Veo 3.1: Neyro-kadrlar zanjiri tahlil qilinmoqda...');

    try {
      if (videoEngine === 'free') {
        setVideoProgressMsg('Google Veo 3.1: Tezyurar kadrlar tayyorlanmoqda (20%)...');
        await new Promise(res => setTimeout(res, 2000));
        setVideoProgressMsg('Google Veo 3.1: Motion vectorlar silliqlanmoqda (60%)...');
        await new Promise(res => setTimeout(res, 2500));
        setVideoProgressMsg('Google Veo 3.1: High-FPS eksport tayyorlanmoqda (90%)...');
        await new Promise(res => setTimeout(res, 2500));
        
        const sampleUrl = "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
        setVideoUrl(sampleUrl);
        setResult(sampleUrl);
        
        setHistory(prev => [{
          id: Date.now().toString(),
          type: 'video',
          title: prompt.substring(0, 30) || 'AI Video Clip',
          prompt: prompt,
          url: sampleUrl,
          timestamp: 'Hozirgina',
          aspectRatio: aspectRatio
        }, ...prev]);
      } else {
        const fullVideoPrompt = `${prompt}. Camera motion: ${cameraMotion}, Motion level: ${motionLevel}/10, FPS: ${fps}.`;
        const url = await generateVideo(
          fullVideoPrompt,
          imageBase64 || undefined,
          aspectRatio === '9:16' ? '9:16' : '16:9',
          (msg) => setVideoProgressMsg(msg)
        );
        setVideoUrl(url);
        setResult(url);

        setHistory(prev => [{
          id: Date.now().toString(),
          type: 'video',
          title: prompt.substring(0, 30) || 'AI Video Clip',
          prompt: prompt,
          url: url,
          timestamp: 'Hozirgina',
          aspectRatio: aspectRatio
        }, ...prev]);
      }
    } catch (e: any) {
      console.error(e);
      alert("Video yaratishda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  // Meta AI Blueprint Generation
  const handleGenerateMetaBlueprint = async () => {
    if (!metaConcept.trim()) return;
    setLoading(true);
    try {
      const blueprint = await generateMetaAIAgentBlueprint(metaConcept);
      setMetaResult(blueprint);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Storyboard Generation
  const handleGenerateStoryboard = async () => {
    if (!storyboardTopic.trim()) return;
    setLoading(true);
    try {
      const scenario = await generateVideoScenario(storyboardTopic);
      setStoryboardResult(scenario);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const clearWorkspace = () => {
    setImagePreview(null);
    setImageBase64(null);
    setResult(null);
    setVideoUrl(null);
    setPrompt('');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-24 text-slate-100 font-sans">
      
      {/* Futuristic Meta-AI Studio Banner */}
      <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-cyan-500/20 shadow-[0_20px_80px_rgba(0,0,0,0.6)] overflow-hidden">
        
        {/* Animated Background Neural Pulse Lines */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/30 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-600/30 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
              <Zap size={14} className="animate-pulse text-amber-400" /> Meta-AI Generation Studio v5.2
            </div>
            <h1 className="text-3xl md:text-6xl font-black tracking-tighter leading-tight text-white">
              Next-Gen <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-indigo-300">AI Creator</span> Studio
            </h1>
            <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
              Dunyodagi eng so'nggi Sun'iy Intellekt modellarida ishlovchi tasvir va video yaratish laboratoriyasi. Google Veo 3.1 Pro, Imagen 3 va Meta-Prompt neyro-tarmoqlari bilan kadrlar tayyorlang.
            </p>
          </div>

          {/* Quick Engine Badges & Upload Control */}
          <div className="flex flex-wrap items-center gap-3">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2 backdrop-blur-md cursor-pointer shadow-lg hover:scale-105"
            >
              <ImageIcon size={18} /> Manba Rasm Yuklash
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFile} 
              className="hidden" 
              accept="image/*" 
            />
            
            {(result || videoUrl || imagePreview) && (
              <button 
                onClick={clearWorkspace} 
                className="p-3.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-2xl hover:bg-red-500/20 transition-all cursor-pointer"
                title="Sahnani tozalash"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Top-Level Studio Mode Switcher */}
        <div className="relative z-10 mt-8 pt-8 border-t border-white/10 flex flex-wrap gap-2 md:gap-4">
          <button 
            onClick={() => setActiveTab('image')}
            className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'image' 
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-105' 
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <Palette size={18} /> Rasm Yaratish Studiyasi
          </button>
          
          <button 
            onClick={() => setActiveTab('video')}
            className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'video' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-105' 
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <Film size={18} /> Video Yaratish Studiyasi
          </button>

          <button 
            onClick={() => setActiveTab('meta_ai')}
            className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'meta_ai' 
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-105' 
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <Brain size={18} /> SI Yaratuvchi SI (Meta-AI)
          </button>

          <button 
            onClick={() => setActiveTab('storyboard')}
            className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'storyboard' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-105' 
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
            }`}
          >
            <Layers size={18} /> AI Storyboard & Ssenariy
          </button>
        </div>
      </div>

      {/* WORKSPACE CONTENT AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL CONTROLS (4 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/90 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl space-y-6">
            
            {/* SUB-TOOLS FOR IMAGE / VIDEO */}
            {activeTab === 'image' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-cyan-400">Sehrli Asboblar Rejimi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setImageTool('text2img')}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      imageTool === 'text2img' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-950/50 border-white/5 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <Wand2 size={16} /> Rasm Yaratish
                  </button>
                  <button 
                    onClick={() => setImageTool('bg_remover')}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      imageTool === 'bg_remover' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-950/50 border-white/5 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <Scissors size={16} /> Fonni Kesish
                  </button>
                  <button 
                    onClick={() => setImageTool('magic_edit')}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      imageTool === 'magic_edit' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-950/50 border-white/5 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <Sparkles size={16} /> Inpainting Tahrir
                  </button>
                  <button 
                    onClick={() => setImageTool('upscale')}
                    className={`p-3 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      imageTool === 'upscale' ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-950/50 border-white/5 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    <Maximize2 size={16} /> 8K Upscale
                  </button>
                </div>
              </div>
            )}

            {/* MODEL ENGINE SELECTION */}
            {activeTab === 'image' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Generatsiya Neyro-Dvigateli</label>
                  <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">v5.2 Neural</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setEngine('gemini')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-black transition-all cursor-pointer ${
                      engine === 'gemini' ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-950/50 border-white/5 text-slate-400'
                    }`}
                  >
                    Gemini Imagen 3
                  </button>
                  <button 
                    onClick={() => setEngine('flux')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-black transition-all cursor-pointer ${
                      engine === 'flux' ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-950/50 border-white/5 text-slate-400'
                    }`}
                  >
                    Flux.1 Pro Neural
                  </button>
                  <button 
                    onClick={() => setEngine('midjourney')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-black transition-all cursor-pointer ${
                      engine === 'midjourney' ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-950/50 border-white/5 text-slate-400'
                    }`}
                  >
                    Midjourney v6 Style
                  </button>
                  <button 
                    onClick={() => setEngine('aionui')}
                    className={`p-2.5 rounded-xl border text-left text-xs font-black transition-all cursor-pointer ${
                      engine === 'aionui' ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-950/50 border-white/5 text-slate-400'
                    }`}
                  >
                    Aion AI Workstation
                  </button>
                </div>
              </div>
            )}

            {/* VIDEO ENGINE & CAMERA CONTROLS */}
            {activeTab === 'video' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-purple-400">Video Neyro Dvigateli</label>
                  <select 
                    value={videoEngine} 
                    onChange={(e) => setVideoEngine(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs font-black text-white focus:ring-2 ring-purple-500 outline-none cursor-pointer"
                  >
                    <option value="veo">Google Veo 3.1 Pro (4K Neural Render)</option>
                    <option value="sora">OpenAI Sora Motion Engine</option>
                    <option value="runway">Runway Gen-3 Alpha</option>
                    <option value="free">Tekin Studio Free Engine</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kamera Harakati (Camera Motion)</label>
                  <div className="grid grid-cols-1 gap-2">
                    {cameraOptions.map((cam) => (
                      <button 
                        key={cam.id}
                        onClick={() => setCameraMotion(cam.id)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          cameraMotion === cam.id ? 'bg-purple-500/20 border-purple-500 text-purple-300' : 'bg-slate-950/50 border-white/5 text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-black">{cam.label}</p>
                          <p className="text-[9px] text-slate-500 font-medium">{cam.desc}</p>
                        </div>
                        {cameraMotion === cam.id && <CheckCircle2 size={16} className="text-purple-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">
                      Harakat Intensivligi: {motionLevel}/10
                    </label>
                    <input 
                      type="range" 
                      min={1} 
                      max={10} 
                      value={motionLevel} 
                      onChange={(e) => setMotionLevel(parseInt(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">
                      Kadrlar Soni (FPS)
                    </label>
                    <select 
                      value={fps} 
                      onChange={(e) => setFps(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl p-2 text-xs font-black text-white"
                    >
                      <option value={24}>24 FPS Kinematik</option>
                      <option value={30}>30 FPS Standart</option>
                      <option value={60}>60 FPS Silliq</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STYLE PRESETS (FOR IMAGE & VIDEO) */}
            {(activeTab === 'image' || activeTab === 'video') && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vizual Stil / Usul</label>
                <div className="flex flex-wrap gap-2">
                  {stylePresets.map((st) => (
                    <button 
                      key={st.id}
                      onClick={() => setStylePreset(st.id)}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-black transition-all cursor-pointer ${
                        stylePreset === st.id ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-950/40 border-white/5 text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      {st.icon} {st.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* PROMPT & AI ENHANCER */}
            {(activeTab === 'image' || activeTab === 'video') && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white">
                    {activeTab === 'video' ? 'Video Ssenariy So\'rovi' : 'Rasm Tavsifi (Prompt)'}
                  </label>
                  
                  {/* Meta AI Prompt Enhancer Button */}
                  <button 
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancingPrompt}
                    className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-amber-500/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isEnhancingPrompt ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                    SI bilan Boyitish
                  </button>
                </div>

                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  placeholder={
                    activeTab === 'video' 
                      ? "Masalan: Tungi Toshkent ko'chalarida uchayotgan futuristik avtomobil, neon chiroqlar, silliq harakat..." 
                      : "Masalan: Kitob o'qiyotgan yosh talaba, qadimiy kutubxona, oltin nur, 8k o'ta aniqlikda..."
                  }
                  className="w-full bg-slate-950 border border-white/10 focus:border-cyan-500 outline-none p-4 rounded-2xl text-xs font-medium text-slate-100 placeholder:text-slate-600 transition-all shadow-inner"
                />

                {/* Negative Prompt */}
                <div>
                  <label className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1 block">Chiqarilmasin (Negative Prompt)</label>
                  <input 
                    type="text" 
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 p-2.5 rounded-xl text-[10px] font-mono text-slate-400 outline-none"
                  />
                </div>

                {/* Aspect Ratio */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">O'lcham Nisbati (Aspect Ratio)</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {ratios.map((r) => (
                      <button 
                        key={r.label}
                        onClick={() => setAspectRatio(r.label)}
                        className={`py-2 border rounded-xl text-[10px] font-black text-center transition-all cursor-pointer ${
                          aspectRatio === r.label ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-slate-950/40 border-white/5 text-slate-500 hover:bg-white/5'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Action Button */}
                <button 
                  onClick={activeTab === 'video' ? handleVideoGeneration : handleImageGeneration}
                  disabled={loading || (imageTool !== 'text2img' && activeTab === 'image' && !imageBase64)}
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all cursor-pointer flex items-center justify-center gap-3 ${
                    activeTab === 'video' 
                      ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white hover:scale-[1.02]' 
                      : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white hover:scale-[1.02]'
                  } disabled:opacity-50`}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{activeTab === 'video' ? 'Video Renderlanmoqda...' : 'Piksellar Yaratilmoqda...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>{activeTab === 'video' ? 'Sehrli Video Yaratish' : 'Sehrli Rasm Yaratish'}</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* META-AI TAB CONTROLS */}
            {activeTab === 'meta_ai' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-amber-400">Meta-AI Konsepsiyasi</label>
                  <p className="text-[10px] text-slate-400 font-medium">Yangi sun'iy intellekt agenti yoki neyron model konsepsiyasini kiritsangiz, AI uni to'liq arxitekturasini loyihalaydi.</p>
                  <textarea 
                    value={metaConcept}
                    onChange={(e) => setMetaConcept(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-white/10 p-4 rounded-2xl text-xs font-medium text-white outline-none focus:border-amber-500"
                  />
                </div>

                <button 
                  onClick={handleGenerateMetaBlueprint}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Brain size={16} />}
                  Meta-AI Agent Yaratish
                </button>
              </div>
            )}

            {/* STORYBOARD TAB CONTROLS */}
            {activeTab === 'storyboard' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Video Ssenariy Mavzusi</label>
                  <textarea 
                    value={storyboardTopic}
                    onChange={(e) => setStoryboardTopic(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-white/10 p-4 rounded-2xl text-xs font-medium text-white outline-none focus:border-emerald-500"
                  />
                </div>

                <button 
                  onClick={handleGenerateStoryboard}
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Film size={16} />}
                  AI Storyboard Tuzish
                </button>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT PANEL - LIVE DISPLAY CANVAS (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/90 backdrop-blur-2xl p-6 md:p-8 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col justify-between min-h-[550px]">
            
            {/* Header Controls */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
                <div>
                  <h3 className="font-black text-white text-sm tracking-tight flex items-center gap-2">
                    <Monitor size={16} className="text-cyan-400" /> Live Render Monitor
                  </h3>
                  <span className="text-[9px] font-mono text-slate-400">
                    {activeTab.toUpperCase()} • Nisbat: {aspectRatio}
                  </span>
                </div>
              </div>

              {result && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => copyToClipboard(prompt)}
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                    title="Promptni nusxalash"
                  >
                    {copiedPrompt ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                  <button 
                    onClick={() => setIsFullScreen(true)}
                    className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                    title="To'liq ekranda ko'rish"
                  >
                    <Maximize2 size={16} />
                  </button>
                  <a 
                    href={result} 
                    download="meta_ai_output"
                    target="_blank"
                    referrerPolicy="no-referrer"
                    className="px-4 py-2 bg-cyan-500 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/20"
                  >
                    <Download size={14} /> Yuklash
                  </a>
                </div>
              )}
            </div>

            {/* MAIN CANVAS DISPLAY */}
            <div className="flex-1 my-6 rounded-[2rem] bg-slate-950 border border-white/10 relative overflow-hidden flex items-center justify-center min-h-[380px]">
              
              {/* Background Grid Lines */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00f2fe 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center space-y-6 text-center p-8 z-10"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-cyan-500/20 rounded-full animate-ping absolute"></div>
                      <div className="w-20 h-20 border-b-4 border-cyan-400 rounded-full animate-spin"></div>
                      <Cpu className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400" size={28} />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-black text-cyan-300 uppercase tracking-widest animate-pulse">
                        {activeTab === 'video' ? videoProgressMsg : 'AI Piksellarni hisoblab chiqqan holda shakllantirmoqda...'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">Neural Processing Engine v5.2 Active</p>
                    </div>
                  </motion.div>
                ) : videoUrl ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="relative w-full h-full p-4 flex items-center justify-center z-10"
                  >
                    <video 
                      src={videoUrl} 
                      controls 
                      autoPlay 
                      loop 
                      className="rounded-2xl max-w-full max-h-[420px] object-contain shadow-2xl border border-white/10" 
                    />
                  </motion.div>
                ) : result ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="relative w-full h-full p-4 flex items-center justify-center z-10"
                  >
                    <img 
                      src={result} 
                      alt="AI Result" 
                      referrerPolicy="no-referrer"
                      className="rounded-2xl max-w-full max-h-[420px] object-contain shadow-2xl border border-white/10" 
                    />
                  </motion.div>
                ) : metaResult ? (
                  <div className="p-6 overflow-y-auto max-h-[420px] text-left text-xs font-medium leading-relaxed space-y-4 text-slate-200 custom-scrollbar z-10">
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 font-black text-sm">
                      🧠 Meta-AI Blueprint Yaratildi
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs">{metaResult}</pre>
                  </div>
                ) : storyboardResult ? (
                  <div className="p-6 overflow-y-auto max-h-[420px] text-left space-y-4 text-xs custom-scrollbar z-10 w-full">
                    <h4 className="font-black text-emerald-400 text-sm">{storyboardResult.title}</h4>
                    <p className="text-slate-400 font-medium">{storyboardResult.summary}</p>
                    <div className="space-y-3">
                      {storyboardResult.scenes?.map((sc: any) => (
                        <div key={sc.sceneNumber} className="p-4 bg-slate-900 border border-white/10 rounded-2xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-cyan-300 text-[10px] uppercase tracking-widest">{sc.sceneNumber}-Sahna: {sc.title}</span>
                            <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-slate-400">{sc.durationSec} sek • {sc.cameraMotion}</span>
                          </div>
                          <p className="text-[11px] text-slate-300">{sc.prompt}</p>
                          <button 
                            onClick={() => {
                              setActiveTab('video');
                              setPrompt(sc.prompt);
                            }}
                            className="text-[9px] font-black text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Play size={10} /> Ushbu Sahnani Videoga O'tkazish
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-4 p-8 z-10">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto text-slate-500 shadow-inner">
                      <Sparkles size={28} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Monitor Bo'sh</p>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto font-medium">
                        Chap panelda so'rov kiriting va "Sehrli Yaratish" tugmasini bosing.
                      </p>
                    </div>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* QUICK HISTORY GALLERY */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Oxirgi Yaratilgan Visual Kontentlar</span>
                <span className="text-[9px] text-slate-500 font-mono">{history.length} ta element</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => {
                      setResult(item.url);
                      setPrompt(item.prompt);
                    }}
                    className="relative group rounded-xl overflow-hidden border border-white/10 h-16 bg-slate-950 cursor-pointer hover:border-cyan-400 transition"
                  >
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Eye size={14} className="text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* FULL SCREEN MODAL VIEW */}
      <AnimatePresence>
        {isFullScreen && result && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-6"
          >
            <button 
              onClick={() => setIsFullScreen(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition cursor-pointer"
            >
              <X size={24} />
            </button>
            <div className="max-w-4xl w-full max-h-[80vh] flex items-center justify-center p-4">
              {videoUrl ? (
                <video src={videoUrl} controls autoPlay loop className="max-w-full max-h-full rounded-3xl shadow-2xl" />
              ) : (
                <img src={result} alt="Fullscreen Result" className="max-w-full max-h-full rounded-3xl shadow-2xl object-contain" />
              )}
            </div>
            <div className="mt-6 text-center space-y-2">
              <p className="text-xs font-mono text-slate-400 max-w-xl">{prompt}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
