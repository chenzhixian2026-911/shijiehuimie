import { useState, useEffect } from 'react';

interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  cover_url?: string | null;
  created_at: string;
}

interface ArticleDetailPageProps {
  articleId: number;
  onBack: () => void;
}

export default function ArticleDetailPage({ articleId, onBack }: ArticleDetailPageProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverLoading, setCoverLoading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/blog/${articleId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setArticle(data);
      setCoverUrl(data.cover_url ?? null);
      setCoverError(null);
    } catch (err) {
      console.error('获取文章详情失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCover = async () => {
    if (!article || coverLoading) return;
    setCoverLoading(true);
    setCoverError(null);
    try {
      const res = await fetch(`/api/blog/${article.id}/illustration`, { method: 'POST' });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'AI 配图失败，请稍后重试');
      }
      setCoverUrl(data.cover_url ?? null);
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : 'AI 配图失败，请稍后重试');
    } finally {
      setCoverLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const getReadTime = (content: string) => {
    const len = content.length;
    return Math.max(1, Math.ceil(len / 300)) + ' 分钟';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text-secondary)]">文章不存在</p>
          <button onClick={onBack} className="mt-4 text-[var(--primary)] text-sm">返回</button>
        </div>
      </div>
    );
  }

  // Split content into paragraphs
  const paragraphs = article.content.split('\n').filter(p => p.trim());

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text)] transition-colors text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            返回列表
          </button>
          <h1 className="text-sm font-semibold text-[var(--text)] tracking-tight">恋爱攻略</h1>
          <div className="w-16" />
        </div>
      </nav>

      {/* Article */}
      <article className="pt-14">
        {/* Hero */}
        <div className="max-w-3xl mx-auto px-6 pt-12 pb-8">
          <p className="text-xs font-medium text-[var(--primary)] tracking-widest uppercase mb-4 animate-fade-in-up">
            Article
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text)] tracking-tight leading-tight animate-fade-in-up" style={{ animationDelay: '50ms' }}>
            {article.title}
          </h1>
          <div className="mt-5 flex items-center gap-3 text-xs text-[var(--text-tertiary)] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <span>{formatDate(article.created_at)}</span>
            <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
            <span>阅读 {getReadTime(article.content)}</span>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
            <button
              onClick={handleGenerateCover}
              disabled={coverLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {coverLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  AI 绘图中，约需 30-60 秒...
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                  {coverUrl ? '重新生成配图' : 'AI 生成配图'}
                </>
              )}
            </button>
            {coverError && <span className="text-xs text-red-500">{coverError}</span>}
          </div>
        </div>

        {/* Divider */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="h-px bg-[var(--border)]" />
        </div>

        {/* AI Cover */}
        {coverUrl && (
          <div className="max-w-3xl mx-auto px-6 mt-8 animate-fade-in-up">
            <img
              src={coverUrl}
              alt={`${article.title} 配图`}
              className="w-full aspect-[2/1] object-cover rounded-2xl border border-[var(--border)]"
            />
            <p className="mt-2 text-xs text-[var(--text-tertiary)] text-right">AI 生成配图 · 豆包 Seedream</p>
          </div>
        )}

        {/* Content */}
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="prose prose-stone">
            {paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-base text-[var(--text-secondary)] leading-[1.8] mb-5 animate-fade-in-up"
                style={{ animationDelay: `${150 + i * 50}ms` }}
              >
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-3xl mx-auto px-6 pb-16">
          <div className="h-px bg-[var(--border)] mb-8" />
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:shadow-sm transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              返回攻略列表
            </button>
            <p className="text-xs text-[var(--text-tertiary)]">哄哄模拟器 · 恋爱攻略</p>
          </div>
        </div>
      </article>
    </div>
  );
}
