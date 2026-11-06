import React, { useState } from 'react';
import { generateNoteOrEssay } from '../services/geminiService';
import { FileText, AlignLeft, Sparkles, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const NotesGenerator: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [result, setResult] = useState('');
  const [mode, setMode] = useState<'summary' | 'essay'>('summary');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult('');
    setCopied(false);
    try {
      const text = await generateNoteOrEssay(topic, mode);
      if (text) setResult(text);
    } catch (err) {
      console.error(err);
      setResult("Xatolik yuz berdi. Qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
          <FileText className="text-primary" />
          Konspekt va Referat Yordamchisi
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-1">Mavzu nomi</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Masalan: Amir Temur davlati yoki Nyuton qonunlari"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary focus:outline-none transition-all"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setMode('summary')}
              className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${
                mode === 'summary' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-border text-text-secondary hover:bg-background'
              }`}
            >
              <AlignLeft size={18} />
              Qisqa Konspekt
            </button>
            <button
              onClick={() => setMode('essay')}
              className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 font-bold transition-all ${
                mode === 'essay' 
                  ? 'border-primary bg-primary/5 text-primary' 
                  : 'border-border text-text-secondary hover:bg-background'
              }`}
            >
              <FileText size={18} />
              Batafsil Referat
            </button>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full bg-primary hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-98"
          >
            {loading ? (
              <>Generating...</>
            ) : (
              <>
                <Sparkles size={20} />
                Yaratish
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-surface p-8 rounded-2xl shadow-sm border border-border animate-fade-in">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-border">
            <h3 className="font-bold text-xl text-text-primary">Natija:</h3>
            <button 
              onClick={handleCopy}
              className="text-text-secondary hover:text-primary transition-colors flex items-center gap-1 text-sm font-bold bg-background px-3 py-1.5 rounded-lg border border-border"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Nusxalandi" : "Nusxalash"}
            </button>
          </div>
          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-primary">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};