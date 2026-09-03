import { useState, useRef, useEffect } from 'react';
import {
  type GameState,
  getGirlfriendEmoji,
  getAngerColor,
  getAngerLabel,
} from '../lib/game-engine';
import ChatBubble from './ChatBubble';
import AngerMeter from './AngerMeter';

interface GameScreenProps {
  gameState: GameState;
  onSend: (text: string) => void;
}

export default function GameScreen({ gameState, onSend }: GameScreenProps) {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const prevAngerRef = useRef(gameState.anger);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.messages]);

  useEffect(() => {
    if (gameState.anger > prevAngerRef.current) {
      setShakeKey(k => k + 1);
    }
    prevAngerRef.current = gameState.anger;
  }, [gameState.anger]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  };

  const emoji = getGirlfriendEmoji(gameState.anger);
  const angerColor = getAngerColor(gameState.anger);
  const angerLabel = getAngerLabel(gameState.anger);

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto w-full bg-[var(--color-bg)]">
      {/* Header */}
      <header className="flex-shrink-0 glass border-b border-[var(--color-border)]/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="w-8 h-8 rounded-full flex items-center justify-center
                text-[var(--color-text-secondary)] hover:bg-gray-100 transition-colors"
              title="返回首页"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{emoji}</span>
              <div>
                <h2 className="text-sm font-semibold text-[var(--color-text)]">女友</h2>
                <span className="text-xs font-medium" style={{ color: angerColor }}>{angerLabel}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-secondary)] bg-gray-100 px-2.5 py-1 rounded-full">
              {gameState.round}/{gameState.maxRounds}
            </span>
          </div>
        </div>
        <AngerMeter anger={gameState.anger} shakeKey={shakeKey} />
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto chat-scroll px-4 py-4 space-y-3">
        {gameState.messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            message={msg}
            emoji={emoji}
            anger={gameState.anger}
          />
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="flex-shrink-0 glass border-t border-[var(--color-border)]/50 px-4 py-3"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="说点什么哄哄她..."
            className="flex-1 px-4 py-2.5 rounded-full bg-white
              border border-[var(--color-border)]
              focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 focus:outline-none
              text-sm text-[var(--color-text)]
              placeholder:text-[var(--color-text-tertiary)]
              transition-all duration-200"
            maxLength={100}
            autoFocus
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-5 py-2.5 rounded-full text-white text-sm font-medium
              bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]
              disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-95 transition-all duration-150"
          >
            发送
          </button>
        </div>
      </form>
    </div>
  );
}
