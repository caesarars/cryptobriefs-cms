
import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import PostForm from './components/PostForm';
import OneClickPost from './components/OneClickPost';
import AIDraftGenerator from './components/AIDraftGenerator';
import AIBatchGenerator from './components/AIBatchGenerator';

const SESSION_KEY = 'cryptobriefs-session';
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

type SessionPayload = {
  token: string;
  issuedAt: number;
  expiresAt: number;
};

const parseSessionPayload = (value: string | null): SessionPayload | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as SessionPayload;
    if (!parsed.token || !parsed.issuedAt || !parsed.expiresAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const isSessionValid = (session: SessionPayload | null) => {
  if (!session) {
    return false;
  }

  const now = Date.now();
  return Boolean(session.token) && session.issuedAt <= now && session.expiresAt > now;
};

const createSessionPayload = (): SessionPayload => {
  const issuedAt = Date.now();
  const token =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${issuedAt}-${Math.random().toString(36).slice(2)}`;

  return {
    token,
    issuedAt,
    expiresAt: issuedAt + SESSION_DURATION_MS,
  };
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);

  const expectedUsername = process.env.APP_LOGIN_USERNAME;
  const expectedPassword = process.env.APP_LOGIN_PASSWORD;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedSession = parseSessionPayload(window.sessionStorage.getItem(SESSION_KEY));
    const valid = isSessionValid(storedSession);

    if (!valid) {
      window.sessionStorage.removeItem(SESSION_KEY);
    }

    setIsAuthenticated(valid);
    setIsSessionReady(true);
  }, []);

  const handleLogin = useCallback((username: string, password: string) => {
    const isValid = username === expectedUsername && password === expectedPassword;

    if (!isValid) {
      return false;
    }

    const session = createSessionPayload();
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setIsAuthenticated(true);
    return true;
  }, [expectedPassword, expectedUsername]);

  const handleLogout = useCallback(() => {
    window.sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthenticated) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const storedSession = parseSessionPayload(window.sessionStorage.getItem(SESSION_KEY));
      if (!isSessionValid(storedSession)) {
        window.sessionStorage.removeItem(SESSION_KEY);
        setIsAuthenticated(false);
      }
    }, 30 * 1000);

    return () => window.clearInterval(intervalId);
  }, [isAuthenticated]);

  if (!expectedUsername || !expectedPassword) {
    return (
      <div className="min-h-screen bg-brand-primary text-brand-text flex items-center justify-center px-4">
        <div className="max-w-lg bg-brand-secondary border border-slate-800 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white">Login is not configured</h1>
          <p className="text-brand-text-secondary mt-3">
            Set <code>APP_LOGIN_USERNAME</code> and <code>APP_LOGIN_PASSWORD</code> in your environment before using this app.
          </p>
        </div>
      </div>
    );
  }

  if (!isSessionReady) {
    return (
      <div className="min-h-screen bg-brand-primary text-brand-text flex items-center justify-center px-4">
        <div className="max-w-md bg-brand-secondary border border-slate-800 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Loading session</h1>
          <p className="text-brand-text-secondary mt-3">
            Checking access token before opening the CMS.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {isAuthenticated ? <Header onLogout={handleLogout} /> : null}
      <main className={`flex-grow ${isAuthenticated ? 'container mx-auto px-4 py-8' : ''}`}>
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />}
          />
          <Route
            path="/"
            element={isAuthenticated ? <PostForm /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/one-click"
            element={isAuthenticated ? <OneClickPost /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/ai-draft"
            element={isAuthenticated ? <AIDraftGenerator /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/ai-batch"
            element={isAuthenticated ? <AIBatchGenerator /> : <Navigate to="/login" replace />}
          />
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />}
          />
        </Routes>
      </main>
      {isAuthenticated ? <Footer /> : null}
    </div>
  );
}

export default App;
