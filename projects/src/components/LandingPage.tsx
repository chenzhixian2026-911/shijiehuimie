interface LandingPageProps {
  onStart: () => void;
  onGoToBlog: () => void;
  onGoToLeaderboard: () => void;
  username?: string;
  onLogout?: () => void;
  onGoToProfile?: () => void;
}

export default function LandingPage({ onStart, onGoToBlog, onGoToLeaderboard, username, onLogout, onGoToProfile }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] overflow-y-auto">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[var(--color-border)]/50">
        <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/images/logo.jpeg" alt="Logo" className="w-6 h-6 rounded-md object-cover" />
            <span className="text-sm font-semibold text-[var(--color-text)]">哄哄模拟器</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onGoToLeaderboard}
              className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
            >
              排行榜
            </button>
            {username && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onGoToProfile}
                  className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                >
                  {username}
                </button>
                <button
                  onClick={onLogout}
                  className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
                >
                  退出
                </button>
              </div>
            )}
            <button
              onClick={onStart}
              className="text-xs px-4 py-1.5 rounded-full bg-[var(--color-text)] text-white
                hover:bg-[var(--color-text)]/80 transition-colors"
            >
              开始体验
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-medium text-[var(--color-primary)] tracking-wide uppercase mb-4 animate-fade-in-up stagger-1">
            情侣沟通练习工具
          </p>
          <h1 className="text-5xl sm:text-7xl font-bold gradient-text-purple tracking-tight leading-tight mb-6 animate-fade-in-up stagger-2">
            哄哄<span>模拟器</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--color-text-secondary)] leading-relaxed max-w-xl mx-auto mb-10 animate-fade-in-up stagger-3">
            每一次争吵，都是一次学会理解的机会。<br />
            在 AI 模拟场景中练习沟通，让爱不再词穷。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up stagger-4">
            <button
              onClick={onStart}
              className="px-8 py-3 rounded-full text-white text-base font-medium
                bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]
                shadow-lg shadow-[var(--color-primary)]/20
                active:scale-[0.97] transition-all duration-200"
            >
              免费开始练习
            </button>
            <button
              onClick={onGoToBlog}
              className="px-8 py-3 rounded-full text-[var(--color-primary)] text-base font-medium
                border border-[var(--color-primary)]/30 hover:bg-[var(--color-primary-light)]
                transition-all duration-200"
            >
              恋爱攻略
            </button>
            <a
              href="#features"
              className="px-8 py-3 rounded-full text-[var(--color-text-secondary)] text-base font-medium
                border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)]
                transition-all duration-200"
            >
              了解更多
            </a>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-16 max-w-4xl mx-auto animate-fade-in-up stagger-5">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-[var(--color-primary)]/10">
            <img
              src="/images/hero.jpeg"
              alt="哄哄模拟器"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div className="animate-fade-in-up stagger-1">
              <div className="text-3xl sm:text-4xl font-bold text-[var(--color-text)]">10</div>
              <div className="text-sm text-[var(--color-text-secondary)] mt-1">次说话机会</div>
            </div>
            <div className="animate-fade-in-up stagger-2">
              <div className="text-3xl sm:text-4xl font-bold gradient-text">10+</div>
              <div className="text-sm text-[var(--color-text-secondary)] mt-1">种话术类型</div>
            </div>
            <div className="animate-fade-in-up stagger-3">
              <div className="text-3xl sm:text-4xl font-bold text-[var(--color-text)]">S~F</div>
              <div className="text-sm text-[var(--color-text-secondary)] mt-1">六级评分</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-[var(--color-bg-warm)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-[var(--color-text)] tracking-tight mb-4">
              为什么选择哄哄模拟器
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-lg mx-auto">
              不是冰冷的聊天机器人，而是一个让你甜蜜地紧张的练习场
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-[var(--color-card)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center text-xl mb-4">
                🎯
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">智能话术识别</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                覆盖道歉、共情、幽默等 10 种话术类型，精准识别你的沟通方式，给出实时反馈。
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[var(--color-card)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-coral-light)] flex items-center justify-center text-xl mb-4">
                🔥
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">实时怒气值</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                动态怒气值可视化，每一句话都会影响她的态度。颜色渐变、表情变化，紧张感拉满。
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[var(--color-card)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center text-xl mb-4">
                🔊
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">语音情绪反馈</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                AI 女友的语音语调随怒气值变化，越生气语气越严厉，越温柔说明你快成功了。
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[var(--color-card)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-coral-light)] flex items-center justify-center text-xl mb-4">
                📊
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">对局复盘分析</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                S~F 六级评分系统，详细的话术分布、亮点和改进建议，帮你持续提升沟通能力。
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[var(--color-card)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center text-xl mb-4">
                🛡️
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">安全试错空间</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                在虚拟场景中大胆尝试，不怕说错话。学会什么该说、什么不该说，避免现实中的沟通失误。
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[var(--color-card)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-coral-light)] flex items-center justify-center text-xl mb-4">
                ⚡
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">即开即玩</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                纯前端运行，无需注册登录，打开网页即可开始。刷新即重来，随时练习。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-[var(--color-text)] tracking-tight mb-4">
              如何玩转
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)]">
              三步上手，简单直观
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-coral)] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-[var(--color-primary)]/20">
                1
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">开始对话</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                AI 女友怒气值 100，你有 10 次说话机会。每一句话都会影响她的态度。
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-coral)] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-[var(--color-primary)]/20">
                2
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">选择话术</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                真诚道歉、共情理解、甜蜜浪漫...不同话术效果不同，攻击性言论直接出局。
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-coral)] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-[var(--color-primary)]/20">
                3
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">查看评价</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                对局结束后获得详细的话术点评和改进建议，持续提升你的沟通能力。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Section */}
      <section className="py-20 px-6 bg-[var(--color-bg-warm)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-[var(--color-text)] tracking-tight mb-4">
              真实体验
            </h2>
            <p className="text-lg text-[var(--color-text-secondary)]">
              看看 AI 女友的反应有多真实
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-8 items-center">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src="/images/girlfriend.jpeg"
                alt="AI女友示例"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="space-y-6">
              <div className="bg-[var(--color-card)] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">错误示范</span>
                </div>
                <p className="text-sm text-[var(--color-text)] font-medium mb-1">"别生气了，多大点事"</p>
                <p className="text-xs text-[var(--color-danger)]">怒气值 +15 😡 "你觉得这没什么？"</p>
              </div>
              <div className="bg-[var(--color-card)] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 font-medium">正确示范</span>
                </div>
                <p className="text-sm text-[var(--color-text)] font-medium mb-1">"我理解你的感受，是我没考虑到你的想法"</p>
                <p className="text-xs text-[var(--color-success)]">怒气值 -20 😒 "你终于知道我的感受了..."</p>
              </div>
              <div className="bg-[var(--color-card)] rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-200 text-red-700 font-medium">直接出局</span>
                </div>
                <p className="text-sm text-[var(--color-text)] font-medium mb-1">"你无理取闹"</p>
                <p className="text-xs text-[var(--color-danger)]">游戏结束 💔 攻击性言论直接终止对局</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature illustration */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-[var(--color-text)] tracking-tight mb-4">
            从冲突到和解
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-12 max-w-lg mx-auto">
            学会用正确的方式表达爱意
          </p>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src="/images/features.jpeg"
              alt="从冲突到和解"
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-bold text-[var(--color-text)] tracking-tight mb-4">
            准备好开始了吗
          </h2>
          <p className="text-lg text-[var(--color-text-secondary)] mb-8">
            10 次机会，看你能不能把她哄好
          </p>
          <button
            onClick={onStart}
            className="px-10 py-4 rounded-full text-white text-lg font-medium
              bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-coral)]
              shadow-xl shadow-[var(--color-primary)]/25
              hover:shadow-2xl hover:shadow-[var(--color-primary)]/30
              active:scale-[0.97] transition-all duration-200"
          >
            开始哄女友
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[var(--color-border)]/50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/images/logo.jpeg" alt="Logo" className="w-5 h-5 rounded object-cover" />
            <span className="text-xs text-[var(--color-text-secondary)]">哄哄模拟器</span>
          </div>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            纯前端本地游戏 · 刷新即重来 · 数据不上传
          </p>
        </div>
      </footer>
    </div>
  );
}
