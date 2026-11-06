import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Mic } from 'lucide-react';

interface TelegramVoicePlayerProps {
  audioUrl?: string;
  duration?: number;
  isSender?: boolean;
}

export const TelegramVoicePlayer: React.FC<TelegramVoicePlayerProps> = ({
  audioUrl,
  duration = 14,
  isSender = false
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<any>(null);

  // Generate simulated waveform bar heights
  const bars = [
    25, 45, 75, 90, 60, 35, 70, 85, 100, 80, 50, 65, 85, 70, 40, 60, 95, 75, 55, 35, 70, 80, 60, 40, 65, 85, 50, 30
  ];

  const totalDuration = duration || 14;

  const togglePlay = () => {
    if (audioUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.playbackRate = speed;
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setCurrentTime(0);
        };
        audioRef.current.ontimeupdate = () => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        };
      }

      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {
          // If browser blocks audio or invalid blob, fallback to simulation
          simulatePlay();
        });
        setIsPlaying(true);
      }
    } else {
      simulatePlay();
    }
  };

  const simulatePlay = () => {
    if (isPlaying) {
      clearInterval(intervalRef.current);
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            clearInterval(intervalRef.current);
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.2 * speed;
        });
      }, 200);
    }
  };

  const cycleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const progressPercent = Math.min(100, (currentTime / totalDuration) * 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex items-center gap-3 py-1 px-1 min-w-[210px] max-w-[280px]">
      {/* Telegram Circular Play Button */}
      <button
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 shrink-0 shadow-sm cursor-pointer ${
          isSender
            ? 'bg-[#3390ec] text-white hover:bg-[#2884df]'
            : 'bg-[#3390ec] text-white hover:bg-[#2884df]'
        }`}
      >
        {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
      </button>

      {/* Waveform & Time */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Waveform Bars */}
        <div className="flex items-center gap-[2.5px] h-6 cursor-pointer" onClick={togglePlay}>
          {bars.map((heightPercent, idx) => {
            const barProgress = (idx / bars.length) * 100;
            const isFilled = barProgress <= progressPercent;

            return (
              <span
                key={idx}
                style={{ height: `${Math.max(18, heightPercent * 0.22)}px` }}
                className={`w-[2.5px] rounded-full transition-colors duration-150 ${
                  isFilled
                    ? isSender ? 'bg-[#3390ec]' : 'bg-[#3390ec]'
                    : isSender ? 'bg-black/20' : 'bg-slate-300'
                }`}
              />
            );
          })}
        </div>

        {/* Duration & Speed */}
        <div className="flex items-center justify-between text-[11px] font-semibold mt-0.5">
          <span className={isSender ? 'text-slate-600' : 'text-slate-500'}>
            {isPlaying ? formatTime(currentTime) : formatTime(totalDuration)}
          </span>

          <button
            onClick={cycleSpeed}
            className={`px-1.5 py-0.5 rounded text-[9px] font-black transition-colors ${
              isSender
                ? 'bg-black/10 text-slate-700 hover:bg-black/15'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {speed}x
          </button>
        </div>
      </div>
    </div>
  );
};
