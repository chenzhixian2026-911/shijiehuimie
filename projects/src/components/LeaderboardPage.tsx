import { useState, useEffect } from 'react';

interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  final_score: number;
  played_at: string;
}

interface LeaderboardPageProps {
  currentUserId?: number | null;
  onBack: () => void;
}

export default function LeaderboardPage({ currentUserId, onBack }: LeaderboardPageProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/game-records/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error('获取排行榜失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-xl border-b" style={{
        background: 'rgba(255, 255, 255, 0.72)',
        borderColor: 'var(--border-color)',
      }}>
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-medium transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <span>←</span> 返回
          </button>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            排行榜
          </h1>
          <div className="w-12" />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: 'var(--primary) var(--primary) var(--border-color)' }} />
            <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>加载中...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏆</div>
            <p className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              暂无排行数据
            </p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              快去玩游戏，成为第一个上榜的人吧！
            </p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <div className="flex items-end justify-center gap-4 mb-8">
                {/* 2nd place */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #C0C0C0, #E8E8E8)' }}>
                    🥈
                  </div>
                  <p className="text-sm font-medium truncate max-w-[80px]" style={{ color: 'var(--text-primary)' }}>
                    {leaderboard[1].username}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {leaderboard[1].final_score}分
                  </p>
                </div>
                {/* 1st place */}
                <div className="text-center -mt-4">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-2 shadow-lg" style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}>
                    🥇
                  </div>
                  <p className="text-sm font-bold truncate max-w-[80px]" style={{ color: 'var(--text-primary)' }}>
                    {leaderboard[0].username}
                  </p>
                  <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                    {leaderboard[0].final_score}分
                  </p>
                </div>
                {/* 3rd place */}
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-2" style={{ background: 'linear-gradient(135deg, #CD7F32, #DEB887)' }}>
                    🥉
                  </div>
                  <p className="text-sm font-medium truncate max-w-[80px]" style={{ color: 'var(--text-primary)' }}>
                    {leaderboard[2].username}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {leaderboard[2].final_score}分
                  </p>
                </div>
              </div>
            )}

            {/* Full Leaderboard List */}
            <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              {leaderboard.map((entry, index) => {
                const isCurrentUser = currentUserId && entry.user_id === currentUserId;
                const showMedal = index < 3;

                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center px-5 py-4 transition-colors ${index !== leaderboard.length - 1 ? 'border-b' : ''}`}
                    style={{
                      borderColor: 'var(--border-color)',
                      background: isCurrentUser ? 'rgba(255, 107, 138, 0.08)' : 'transparent',
                    }}
                  >
                    {/* Rank */}
                    <div className="w-12 text-center">
                      {showMedal ? (
                        <span className="text-2xl">{getMedalEmoji(entry.rank)}</span>
                      ) : (
                        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {entry.rank}
                        </span>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0 ml-3">
                      <p className={`text-sm font-medium truncate ${isCurrentUser ? 'font-bold' : ''}`} style={{
                        color: isCurrentUser ? 'var(--primary)' : 'var(--text-primary)',
                      }}>
                        {entry.username}
                        {isCurrentUser && <span className="ml-2 text-xs font-normal">(我)</span>}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                        {formatDate(entry.played_at)}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>
                        {entry.final_score}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>分</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Note */}
            {!currentUserId && (
              <p className="text-center text-xs mt-6" style={{ color: 'var(--text-secondary)' }}>
                登录后参与游戏，你的成绩也将上榜
              </p>
            )}
          </>
        )}
      </main>
    </div>
  );
}
