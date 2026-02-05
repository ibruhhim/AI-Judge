/**
 * Navbar Component
 * 
 * Consistent navigation bar used across the site
 */

import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import PalmTreeLogo from './PalmTreeLogo';


function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 hover:opacity-80 transition-smooth"
          >
            <PalmTreeLogo size="sm" />
            <h1 className="text-2xl font-bold">
              <span className="gradient-text drop-shadow-[0_0_10px_rgba(255,107,53,0.5)] drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]">Judge.ai</span>
            </h1>
          </button>
          
          <div className="flex items-center space-x-4">

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg glass hover:bg-glass-dark transition-smooth"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
