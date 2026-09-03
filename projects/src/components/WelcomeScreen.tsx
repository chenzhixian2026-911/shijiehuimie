interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
      {/* Logo / Hero */}
      <div className="animate-bounce-in mb-6">
        <div className="text-7xl animate-float">💕</div>
      </div>

      <h1
        className="text-3xl font-bold text-[var(--color-text)] mb-3"
        style={{ animationDelay: '0.2s' }}
      >
        哄哄模拟器
      </h1>

      <p className="text-base text-[var(--color-text-secondary)] text-center max-w-xs mb-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
        你的 AI 女友生气了，怒气值 <span className="text-[var(--color-danger)] font-semibold">100</span>
      </p>
      <p className="text-base text-[var(--color-text-secondary)] text-center max-w-xs mb-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        你有 <span className="text-[var(--color-primary)] font-semibold">10 次</span>说话机会把怒气值降到 <span className="text-[var(--color-success)] font-semibold">0</span>
      </p>

      {/* Rules */}
      <div className="w-full max-w-sm bg-white/70 rounded-2xl p-5 mb-8 shadow-sm animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <h3 className="text-sm font-semibold text-[var(--color-text)] mb-3">游戏规则</h3>
        <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-success)]">✓</span>
            <span>说好话 → 怒气值下降</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-danger)]">✗</span>
            <span>敷衍/冷漠 → 怒气值上升</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-danger)]">⚠</span>
            <span>攻击性言论 → 直接出局</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[var(--color-primary)]">♥</span>
            <span>10 句话内降到 0 就赢了！</span>
          </li>
        </ul>
      </div>

      {/* Start Button */}
      <button
        onClick={onStart}
        className="w-full max-w-sm py-3.5 rounded-2xl text-white font-semibold text-base
          bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-coral)]
          shadow-lg shadow-[var(--color-primary)]/20
          hover:shadow-xl hover:shadow-[var(--color-primary)]/30
          active:scale-[0.98] transition-all duration-200
          animate-fade-in"
        style={{ animationDelay: '0.8s' }}
      >
        开始哄女友
      </button>

      <p className="mt-4 text-xs text-[var(--color-text-secondary)]/50 animate-fade-in" style={{ animationDelay: '1s' }}>
        纯前端本地游戏 · 刷新即重来
      </p>
    </div>
  );
}
