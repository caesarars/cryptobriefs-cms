
import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './components/LoginPage';
import PostForm from './components/PostForm';
import OneClickPost from './components/OneClickPost';
import AIDraftGenerator from './components/AIDraftGenerator';
import AIBatchGenerator from './components/AIBatchGenerator';

const SESSION_KEY = 'cryptobriefs-authenticated';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const expectedUsername = process.env.APP_LOGIN_USERNAME;
  const expectedPassword = process.env.APP_LOGIN_PASSWORD;

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setIsAuthenticated(window.localStorage.getItem(SESSION_KEY) === 'true');
  }, []);

  const handleLogin = useCallback((username: string, password: string) => {
    const isValid = username === expectedUsername && password === expectedPassword;

    if (!isValid) {
      return false;
    }

    window.localStorage.setItem(SESSION_KEY, 'true');
    setIsAuthenticated(true);
    return true;
  }, [expectedPassword, expectedUsername]);

  const handleLogout = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

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
