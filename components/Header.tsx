
import { Link } from 'react-router-dom';
import { IconLogo } from './Icon';

interface HeaderProps {
  onLogout: () => void;
}

const Header = ({ onLogout }: HeaderProps) => {
  return (
    <header className="bg-brand-secondary/50 backdrop-blur-sm sticky top-0 z-50 border-b border-brand-secondary">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <IconLogo className="h-8 w-8 text-brand-accent" />
            <span className="text-2xl font-bold text-white tracking-tight">Crypto Briefs</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300"
            >
              Manual Composer
            </Link>
            <Link 
              to="/one-click" 
              className="bg-brand-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-brand-accent-hover transition-colors duration-300"
            >
              One-Click Blog
            </Link>
            <Link 
              to="/ai-draft" 
              className="bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300"
            >
              AI Draft
            </Link>
            <Link 
              to="/ai-batch" 
              className="bg-slate-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-slate-600 transition-colors duration-300"
            >
              AI Batch
            </Link>
            <button
              type="button"
              onClick={onLogout}
              className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-300"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
