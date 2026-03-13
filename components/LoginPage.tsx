import React, { useState } from 'react';

interface LoginPageProps {
  onLogin: (username: string, password: string) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = onLogin(username, password);

    if (!isValid) {
      setError('Invalid username or password.');
      return;
    }

    setError(null);
  };

  return (
    <div className="min-h-screen bg-brand-primary text-brand-text flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-brand-secondary border border-slate-800 rounded-2xl shadow-2xl p-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-accent mb-3">Crypto Briefs CMS</p>
          <h1 className="text-3xl font-bold text-white">Login</h1>
          <p className="text-brand-text-secondary mt-2">
            Sign in before accessing the publishing tools.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-username" className="block text-sm font-medium text-brand-text-secondary mb-1">
              Username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-brand-text-secondary mb-1">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
              autoComplete="current-password"
              required
            />
          </div>

          {error ? (
            <div className="bg-red-900/40 border border-red-700 text-red-200 rounded-lg p-3 text-sm">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            className="w-full bg-brand-accent text-white font-semibold py-3 px-4 rounded-lg hover:bg-brand-accent-hover transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
