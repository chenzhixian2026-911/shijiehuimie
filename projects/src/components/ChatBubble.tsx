import { useState, useRef, useCallback, useEffect } from 'react';
import type { ChatMessage } from '../lib/game-engine';

interface ChatBubbleProps {
  message: ChatMessage;
  emoji: string;
  anger: number;
}

const QUALITY_COLORS: Record<string, string> = {
  excellent: 'bg-emerald-100 text-emerald-700',
  good: 'bg-blue-100 text-blue-700',
  mediocre: 'bg-yellow-100 text-yellow-700',
  bad: 'bg-red-100 text-red-700',
  toxic: 'bg-red-200 text-red-800',
};

const QUALITY_LABELS: Record<string, string> = {
  excellent: '优秀',
  good: '不错',
  mediocre: '一般',
  bad: '糟糕',
  toxic: '危险',
};

export default function ChatBubble({ message, emoji, anger }: ChatBubbleProps) {
  const isPlayer = message.role === 'player';
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceError, setVoiceError] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const hasUserInteracted = useRef(false);

  const handleVoice = useCallback(async () => {
    // Mark that user has interacted (required for autoplay policy)
    hasUserInteracted.current = true;

    // If already playing, stop
    if (isPlaying && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      setIsPlaying(false);
      return;
    }

    // Check browser support
    if (!('speechSynthesis' in window)) {
      setVoiceError(true);
      return;
    }

    setIsLoading(true);
    setVoiceError(false);

    try {
      // Cancel any ongoing speech first
      window.speechSynthesis.cancel();

      // CRITICAL: Resume speech synthesis (required after cancel or in some browsers)
      window.speechSynthesis.resume();

      // Wait a tick for voices to be available
      await new Promise(resolve => setTimeout(resolve, 50));

      const utterance = new SpeechSynthesisUtterance(message.text);
      utterance.lang = 'zh-CN';
      utteranceRef.current = utterance;

      // Map anger level to speech parameters
      if (anger >= 80) {
        utterance.rate = 1.3;
        utterance.pitch = 1.4;
        utterance.volume = 1;
      } else if (anger >= 60) {
        utterance.rate = 1.15;
        utterance.pitch = 1.25;
        utterance.volume = 0.95;
      } else if (anger >= 40) {
        utterance.rate = 1;
        utterance.pitch = 1.1;
        utterance.volume = 0.9;
      } else if (anger >= 20) {
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.85;
      } else {
        utterance.rate = 0.85;
        utterance.pitch = 1.2;
        utterance.volume = 0.8;
      }

      // Try to find a Chinese female voice
      let voices = window.speechSynthesis.getVoices();
      
      // If voices not loaded yet, wait a bit and retry
      if (voices.length === 0) {
        await new Promise(resolve => {
          const handler = () => {
            voices = window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = null;
            resolve(true);
          };
          window.speechSynthesis.onvoiceschanged = handler;
          setTimeout(handler, 1000);
        });
      }

      const femaleVoiceNames = ['yaoyao', 'xiaoxiao', 'huihui', 'xiaoyi', '女', 'female'];
      let selectedVoice: SpeechSynthesisVoice | null = null;
      
      for (const name of femaleVoiceNames) {
        selectedVoice = voices.find(v => 
          v.lang.startsWith('zh') && v.name.toLowerCase().includes(name.toLowerCase())
        );
        if (selectedVoice) break;
      }
      
      if (!selectedVoice) {
        selectedVoice = voices.find(v => 
          v.lang.startsWith('zh') && !v.name.toLowerCase().includes('kangkang')
        );
      }
      
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.startsWith('zh'));
      }
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      let hasStarted = false;
      let hasError = false;

      utterance.onstart = () => {
        hasStarted = true;
        setIsPlaying(true);
        setIsLoading(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsLoading(false);
        utteranceRef.current = null;
      };

      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        hasError = true;
        setIsPlaying(false);
        setVoiceError(true);
        setIsLoading(false);
        utteranceRef.current = null;
      };

      // Speak!
      window.speechSynthesis.speak(utterance);

      // Fallback: if no onstart after timeout, try again without voice
      setTimeout(() => {
        if (!hasStarted && !hasError && !isPlaying) {
          console.warn('Speech did not start, retrying with default voice...');
          window.speechSynthesis.cancel();
          
          const retryUtterance = new SpeechSynthesisUtterance(message.text);
          retryUtterance.lang = 'zh-CN';
          retryUtterance.rate = utterance.rate;
          retryUtterance.pitch = utterance.pitch;
          retryUtterance.volume = utterance.volume;
          
          retryUtterance.onstart = () => {
            setIsPlaying(true);
            setIsLoading(false);
          };
          retryUtterance.onend = () => {
            setIsPlaying(false);
            setIsLoading(false);
            utteranceRef.current = null;
          };
          retryUtterance.onerror = () => {
            setIsPlaying(false);
            setVoiceError(true);
            setIsLoading(false);
            utteranceRef.current = null;
          };
          
          utteranceRef.current = retryUtterance;
          window.speechSynthesis.speak(retryUtterance);
        }
      }, 500);

    } catch (err) {
      console.error('TTS error:', err);
      setVoiceError(true);
      setIsLoading(false);
    }
  }, [isPlaying, message.text, anger]);

  // Preload voices on mount and cleanup on unmount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Trigger voice loading
      window.speechSynthesis.getVoices();
      
      const handleVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  return (
    <div className={`flex gap-2 ${isPlayer ? 'flex-row-reverse' : 'flex-row'} ${isPlayer ? 'animate-slide-in-right' : 'animate-slide-in-left'}`}>
      {/* Avatar */}
      {!isPlayer && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-lg">
          {emoji}
        </div>
      )}

      <div className={`max-w-[75%] ${isPlayer ? 'items-end' : 'items-start'}`}>
        {/* Message Bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
            ${isPlayer
              ? 'bg-[var(--color-primary)] text-white rounded-br-md'
              : 'bg-white text-[var(--color-text)] rounded-bl-md shadow-sm'
            }`}
        >
          {message.text}
        </div>

        {/* Bottom row: analysis tag + voice button */}
        <div className={`flex items-center gap-1.5 mt-1 ${isPlayer ? 'justify-end' : 'justify-start'}`}>
          {/* Analysis Tag (player only) */}
          {isPlayer && message.analysis && (
            <>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${QUALITY_COLORS[message.analysis.quality]}`}>
                {QUALITY_LABELS[message.analysis.quality]}
              </span>
              <span className="text-[10px] text-[var(--color-text-secondary)]">
                {message.analysis.label}
                {message.analysis.angerDelta < 0
                  ? ` · 怒气 ${message.analysis.angerDelta}`
                  : message.analysis.angerDelta > 0
                    ? ` · 怒气 +${message.analysis.angerDelta}`
                    : ''
                }
              </span>
            </>
          )}

          {/* Voice Button (AI messages only) */}
          {!isPlayer && (
            <button
              onClick={handleVoice}
              disabled={isLoading}
              className={`relative flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full
                transition-all duration-200
                ${voiceError
                  ? 'bg-orange-50 text-orange-400 hover:bg-orange-100 hover:text-orange-500 cursor-pointer'
                  : isPlaying
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                    : 'bg-gray-100 text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]'
                }
                ${isLoading ? 'opacity-60 cursor-wait' : ''}
              `}
              title={voiceError ? '点击重试' : isPlaying ? '点击停止' : '听她说话'}
            >
              {isLoading ? (
                <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : voiceError ? (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
              ) : isPlaying ? (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
              <span>{isLoading ? '加载中' : voiceError ? '重试' : isPlaying ? '停止' : '语音'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
