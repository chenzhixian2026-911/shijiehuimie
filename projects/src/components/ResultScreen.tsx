import { useState, useEffect } from 'react';
import type { GameState, GameResult } from '../lib/game-engine';

interface ResultScreenProps {
  gameState: GameState;
  result: GameResult;
  onRestart: () => void;
  isLoggedIn?: boolean;
}

const GRADE_COLORS: Record<string, string> = {
  S: 'from-amber-400 to-yellow-300',
  A: 'from-emerald-400 to-green-300',
  B: 'from-blue-400 to-cyan-300',
  C: 'from-orange-400 to-yellow-300',
  D: 'from-red-400 to-orange-300',
  F: 'from-gray-600 to-gray-400',
};

const GRADE_TEXT: Record<string, string> = {
  S: 'text-amber-600',
  A: 'text-emerald-600',
  B: 'text-blue-600',
  C: 'text-orange-600',
  D: 'text-red-600',
  F: 'text-gray-600',
};

const QUALITY_BADGE: Record<string, { bg: string; text: string }> = {
  excellent: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  good: { bg: 'bg-blue-100', text: 'text-blue-700' },
  mediocre: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  bad: { bg: 'bg-red-100', text: 'text-red-700' },
  toxic: { bg: 'bg-red-200', text: 'text-red-800' },
};

export default function ResultScreen({ result, onRestart, isLoggedIn = false }: ResultScreenProps) {
  const [showConfetti, setShowConfetti] = useState(result.won);
  const [visible, setVisible] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Save game record when component mounts
  useEffect(() => {
    const saveRecord = async () => {
      if (!isLoggedIn) {
        setToast('登录后可保存你的游戏记录');
        setTimeout(() => setToast(null), 3000);
        return;
      }

      try {
        const response = await fetch('/api/game-records', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            scenario: '哄女友',
            final_score: result.finalAnger,
            result: result.won ? '通关' : '失败',
          }),
        });

        if (response.ok) {
          setToast('您的游戏记录已经保存');
        } else {
          setToast('记录保存失败');
        }
      } catch {
        setToast('记录保存失败');
      }
      setTimeout(() => setToast(null), 3000);
    };

    saveRecord();
  }, [isLoggedIn, result.finalAnger, result.won]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(t);
    }
  }, [showConfetti]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center overflow-y-auto">
      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${60 + Math.random() * 40}%`,
                animation: `confetti ${1.5 + Math.random() * 2}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              {['💕', '✨', '🌸', '💖', '🎉'][i % 5]}
            </div>
          ))}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl px-6 py-3 shadow-lg">
            <p className="text-[var(--color-text)] text-sm font-medium">{toast}</p>
          </div>
        </div>
      )}

      <div className={`w-full max-w-lg px-5 py-8 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Result Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${GRADE_COLORS[result.grade]} mb-4 animate-bounce-in shadow-lg`}>
            <span className="text-5xl font-bold text-white">{result.grade}</span>
          </div>
          <h2 className={`text-2xl font-bold ${GRADE_TEXT[result.grade]} mb-2`}>
            {result.gradeLabel}
          </h2>
          <p className="text-base text-[var(--color-text-secondary)]">
            {result.won ? '恭喜你哄好了女友！' : '很遗憾，女友更生气了...'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-[var(--color-primary)]">{result.roundsUsed}</div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-1">使用回合</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-3xl font-bold" style={{ color: result.won ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {result.finalAnger}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-1">最终怒气</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-3xl font-bold text-[var(--color-coral)]">{result.grade}</div>
            <div className="text-xs text-[var(--color-text-secondary)] mt-1">评级</div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
          <h3 className="text-sm font-semibold text-[var(--color-text)] mb-2">总体评价</h3>
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{result.summary}</p>
        </div>

        {/* Category Breakdown */}
        {result.categoryBreakdown.length > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm">
            <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">话术分布</h3>
            <div className="flex flex-wrap gap-2">
              {result.categoryBreakdown.map((cat) => {
                const badge = QUALITY_BADGE[cat.quality] || QUALITY_BADGE.mediocre;
                return (
                  <span
                    key={cat.label}
                    className={`text-xs px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}
                  >
                    {cat.label} ×{cat.count}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Highlights */}
        <div className="bg-emerald-50 rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-semibold text-emerald-700 mb-2">亮点</h3>
          <ul className="space-y-1.5">
            {result.highlights.map((h, i) => (
              <li key={i} className="text-sm text-emerald-600 flex items-start gap-1.5">
                <span className="mt-0.5 text-xs">•</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvements */}
        <div className="bg-orange-50 rounded-2xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-orange-700 mb-2">改进建议</h3>
          <ul className="space-y-1.5">
            {result.improvements.map((imp, i) => (
              <li key={i} className="text-sm text-orange-600 flex items-start gap-1.5">
                <span className="mt-0.5 text-xs">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-full text-white font-medium text-base
              bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-coral)]
              shadow-lg shadow-[var(--color-primary)]/20
              hover:shadow-xl hover:shadow-[var(--color-primary)]/30
              active:scale-[0.98] transition-all duration-200"
          >
            再来一次
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3.5 rounded-full font-medium text-base
              text-[var(--color-text-secondary)]
              border border-[var(--color-border)]
              hover:bg-gray-50 active:scale-[0.98] transition-all duration-200"
          >
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
