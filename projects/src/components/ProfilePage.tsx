import { useState, useEffect } from 'react';

interface ProfilePageProps {
  userId: number;
  username: string;
  onBack: () => void;
  onLogout: () => void;
}

interface GameRecord {
  id: number;
  scenario: string;
  final_score: number;
  result: string;
  played_at: string;
}

export function ProfilePage({ userId, username, onBack, onLogout }: ProfilePageProps) {
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGameRecords();
  }, [userId]);

  const fetchGameRecords = async () => {
    try {
      const response = await fetch(`/api/game-records?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data);
      }
    } catch (error) {
      console.error('Failed to fetch game records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getResultText = (result: string) => {
    return result === 'won' ? '通关' : '失败';
  };

  const getResultColor = (result: string) => {
    return result === 'won' ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg)]/80 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">个人中心</h1>
          <button
            onClick={onLogout}
            className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
          >
            退出登录
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-[var(--color-border)] mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] flex items-center justify-center text-white text-2xl font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{username}</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">
                共 {records.length} 局游戏记录
              </p>
            </div>
          </div>
        </div>

        {/* Game Records */}
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 shadow-sm border border-[var(--color-border)]">
          <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">游戏记录</h3>
          
          {loading ? (
            <div className="text-center py-12 text-[var(--color-text-secondary)]">
              加载中...
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-text-secondary)]">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>暂无游戏记录</p>
              <p className="text-sm mt-2">快去开始一局游戏吧！</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 bg-[var(--color-bg)]/50 rounded-xl border border-[var(--color-border)] hover:border-[var(--color-primary)]/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`text-2xl font-bold ${getResultColor(record.result)}`}>
                      {record.final_score}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">
                        {record.scenario}
                      </p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {formatDate(record.played_at)}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    record.result === 'won' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {getResultText(record.result)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
