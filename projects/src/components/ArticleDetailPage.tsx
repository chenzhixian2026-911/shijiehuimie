import { useState, useEffect } from 'react';

interface Article {
  id: number;
  title: string;
  summary: string;
  content: string;
  created_at: string;
}

interface ArticleDetailPageProps {
  articleId: number;
  onBack: () => void;
}

export default function ArticleDetailPage({ articleId, onBack }: ArticleDetailPageProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      const res = await fetch(`/api/blog/${articleId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setArticle(data);
    } catch (err) {
      console.error('获取文章详情失败:', err);
    } finally {
      setLoading(false);
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
        </div>

        {/* Divider */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="h-px bg-[var(--border)]" />
        </div>

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
