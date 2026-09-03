import { useState, useCallback, useEffect } from 'react';
import {
  type GameState,
  createInitialState,
  startGame,
  processPlayerInput,
  evaluateGame,
  type GameResult,
} from './lib/game-engine';
import LandingPage from './components/LandingPage';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import BlogListPage from './components/BlogListPage';
import ArticleDetailPage from './components/ArticleDetailPage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import { ProfilePage } from './components/ProfilePage';
import LeaderboardPage from './components/LeaderboardPage';

type AppView = 'landing' | 'blog-list' | 'article-detail' | 'login' | 'register' | 'profile' | 'leaderboard';

interface UserInfo {
  id: number;
  username: string;
}

const AUTH_KEY = 'honghong_user';

function getStoredUser(): UserInfo | null {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

function storeUser(user: UserInfo) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function clearUser() {
  localStorage.removeItem(AUTH_KEY);
}

export default function App() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [appView, setAppView] = useState<AppView>('landing');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
    setAuthChecked(true);
  }, []);

  const handleLoginSuccess = useCallback((userInfo: UserInfo) => {
    setUser(userInfo);
    storeUser(userInfo);
    setAppView('landing');
  }, []);

  const handleLogout = useCallback(() => {
    setUser(null);
    clearUser();
    setAppView('login');
  }, []);

  const handleGoToRegister = useCallback(() => {
    setAppView('register');
  }, []);

  const handleGoToLogin = useCallback(() => {
    setAppView('login');
  }, []);

  const handleStart = useCallback(() => {
    setGameState(startGame());
    setGameResult(null);
    setAppView('landing');
  }, []);

  const handleSend = useCallback((text: string) => {
    setGameState(prev => {
      const next = processPlayerInput(prev, text);
      if (next.phase === 'won' || next.phase === 'lost') {
        setGameResult(evaluateGame(next));
      }
      return next;
    });
  }, []);

  const handleRestart = useCallback(() => {
    setGameState(createInitialState());
    setGameResult(null);
    setAppView('landing');
  }, []);

  const handleGoToBlog = useCallback(() => {
    setAppView('blog-list');
  }, []);

  const handleGoToLanding = useCallback(() => {
    setAppView('landing');
  }, []);

  const handleSelectArticle = useCallback((id: number) => {
    setSelectedArticleId(id);
    setAppView('article-detail');
  }, []);

  const handleBackToBlogList = useCallback(() => {
    setAppView('blog-list');
    setSelectedArticleId(null);
  }, []);

  const handleGoToProfile = useCallback(() => {
    setAppView('profile');
  }, []);

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="animate-pulse text-[var(--color-text-secondary)]">加载中...</div>
      </div>
    );
  }

  // Not logged in - show auth pages
  if (!user) {
    if (appView === 'register') {
      return (
        <RegisterPage
          onRegister={handleLoginSuccess}
          onSwitchToLogin={handleGoToLogin}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLoginSuccess}
        onSwitchToRegister={handleGoToRegister}
      />
    );
  }

  // Logged in - show app
  // Blog views
  if (appView === 'blog-list') {
    return (
      <BlogListPage
        onSelectArticle={handleSelectArticle}
        onBack={handleGoToLanding}
      />
    );
  }

  if (appView === 'article-detail' && selectedArticleId) {
    return (
      <ArticleDetailPage
        articleId={selectedArticleId}
        onBack={handleBackToBlogList}
      />
    );
  }

  if (appView === 'profile' && user) {
    return (
      <ProfilePage
        userId={user.id}
        username={user.username}
        onBack={() => setAppView('landing')}
        onLogout={handleLogout}
      />
    );
  }

  if (appView === 'leaderboard') {
    return (
      <LeaderboardPage
        currentUserId={user?.id}
        onBack={() => setAppView('landing')}
      />
    );
  }

  // Game views
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {gameState.phase === 'welcome' && (
        <LandingPage
          onStart={handleStart}
          onGoToBlog={handleGoToBlog}
          onGoToProfile={handleGoToProfile}
          onGoToLeaderboard={() => setAppView('leaderboard')}
          username={user.username}
          onLogout={handleLogout}
        />
      )}
      {gameState.phase === 'playing' && (
        <GameScreen gameState={gameState} onSend={handleSend} />
      )}
      {(gameState.phase === 'won' || gameState.phase === 'lost') && gameResult && (
        <ResultScreen
          gameState={gameState}
          result={gameResult}
          onRestart={handleRestart}
          isLoggedIn={!!user}
        />
      )}
    </div>
  );
}
