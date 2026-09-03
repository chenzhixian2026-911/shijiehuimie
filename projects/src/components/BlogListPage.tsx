import { useState, useEffect } from 'react';

interface BlogPost {
  id: number;
  title: string;
  summary: string;
  created_at: string;
}

interface BlogListPageProps {
  onBack: () => void;
  onSelectArticle: (id: number) => void;
}

export default function BlogListPage({ onBack, onSelectArticle }: BlogListPageProps) {
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/blog');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setArticles(data);
    } catch (err) {
      console.error('获取文章列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/blog/generate', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate');
      const newArticle = await res.json();
      setArticles(prev => [newArticle, ...prev]);
    } catch (err) {
      console.error('生成文章失败:', err);
      alert('生成文章失败，请稍后重试');
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getReadTime = (summary: string) => {
    const len = summary.length;
    return Math.max(1, Math.ceil(len / 200)) + ' 分钟';
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 className="text-sm font-semibold text-[var(--text)] tracking-tight">恋爱攻略</h1>
          <div className="w-10" />
        </div>
      </nav>

      {/* Content */}
      <div className="pt-14">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-6 pt-12 pb-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium text-[var(--primary)] tracking-widest uppercase mb-3">Blog</p>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] tracking-tight">恋爱攻略</h1>
              <p className="mt-3 text-base text-[var(--text-secondary)] leading-relaxed max-w-lg">
                吵架不慌，沟通有方。实用的恋爱沟通技巧，帮你化解矛盾、升温感情。
              </p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  生成中...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v18M3 12h18" />
                  </svg>
                  AI 生成新文章
                </>
              )}
            </button>
          </div>
        </div>

        {/* Articles */}
        <div className="max-w-4xl mx-auto px-6 pb-20">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[var(--text-secondary)]">暂无文章</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {articles.map((article, index) => (
                <article
                  key={article.id}
                  onClick={() => onSelectArticle(article.id)}
                  className="group cursor-pointer bg-white rounded-2xl border border-[var(--border)] p-6 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-[var(--text)] tracking-tight group-hover:text-[var(--primary)] transition-colors line-clamp-1">
                        {article.title}
                      </h2>
                      <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="mt-4 flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                        <span>{formatDate(article.created_at)}</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
                        <span>阅读 {getReadTime(article.summary)}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--bg)] flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-colors text-[var(--text-tertiary)]">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Mobile Generate Button */}
          <div className="md:hidden mt-8">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[var(--primary)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {generating ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  正在生成...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v18M3 12h18" />
                  </svg>
                  AI 生成新文章
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
