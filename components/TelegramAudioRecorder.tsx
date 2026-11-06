import React, { useState, useEffect, useRef } from 'react';
import { Mic, Trash2, Send, Pause, Play, Check } from 'lucide-react';

interface TelegramAudioRecorderProps {
  onSendAudio: (audioBlobUrl: string, durationSeconds: number) => void;
  onCancel: () => void;
}

export const TelegramAudioRecorder: React.FC<TelegramAudioRecorderProps> = ({
  onSendAudio,
  onCancel
}) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    let streamInstance: MediaStream | null = null;

    const startRecording = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamInstance = stream;
          const recorder = new MediaRecorder(stream);
          
          recorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          recorder.start();
          setMediaRecorder(recorder);

          timerRef.current = setInterval(() => {
            setRecordingTime((prev) => prev + 1);
          }, 1000);
        } else {
          // Fallback simulation timer if browser microphone is not accessible
          timerRef.current = setInterval(() => {
            setRecordingTime((prev) => prev + 1);
          }, 1000);
        }
      } catch (err) {
        console.warn("Microphone access not permitted or unavailable, using voice note simulation:", err);
        timerRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
        }, 1000);
      }
    };

    startRecording();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamInstance) {
        streamInstance.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleFinishAndSend = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        onSendAudio(audioUrl, recordingTime || 5);
      };
      mediaRecorder.stop();
    } else {
      // Send simulated audio note with duration
      onSendAudio('', Math.max(1, recordingTime));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex items-center justify-between w-full bg-slate-100/90 backdrop-blur-md px-4 py-2.5 rounded-full border border-slate-200 shadow-inner animate-in fade-in slide-in-from-bottom-2 duration-150">
      {/* Delete / Cancel button */}
      <button
        type="button"
        onClick={onCancel}
        className="w-9 h-9 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
        title="Bekor qilish"
      >
        <Trash2 size={18} />
      </button>

      {/* Recording status & Live waveform animation */}
      <div className="flex items-center gap-3">
        {/* Pulsing red dot */}
        <div className="relative flex items-center justify-center">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute opacity-75"></span>
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full relative"></span>
        </div>

        {/* Duration */}
        <span className="text-xs font-mono font-bold text-slate-700 min-w-[36px]">
          {formatTime(recordingTime)}
        </span>

        {/* Live Audio Visualizer Bars */}
        <div className="hidden sm:flex items-center gap-1">
          {[40, 75, 100, 50, 85, 30, 90, 60, 80, 45, 95, 70].map((h, i) => (
            <span
              key={i}
              style={{
                height: `${Math.max(6, (h * (recordingTime % 3 + 1)) % 22)}px`,
                animationDelay: `${i * 0.1}s`
              }}
              className="w-1 bg-[#3390ec] rounded-full transition-all duration-200"
            />
          ))}
        </div>
        
        <span className="text-[11px] font-medium text-slate-500 hidden md:inline">
          Ovoz yozilmoqda...
        </span>
      </div>

      {/* Send voice message button */}
      <button
        type="button"
        onClick={handleFinishAndSend}
        className="w-10 h-10 rounded-full bg-[#3390ec] hover:bg-[#2884df] text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
        title="Yuborish"
      >
        <Send size={18} />
      </button>
    </div>
  );
};
