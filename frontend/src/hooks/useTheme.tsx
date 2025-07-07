// Re-export theme hook from contexts to maintain consistency
// This file now serves as a convenience re-export to avoid breaking existing imports
export { useTheme } from '../contexts/ThemeContext';

// Theme Toggle Button Component - moved from hooks to contexts for consistency
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        theme === 'dark' ? 'bg-purple-600' : 'bg-gray-300'
      }`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
      <span className={`absolute text-xs ${
        theme === 'dark' ? 'left-1 text-white' : 'right-1 text-gray-600'
      }`}>
        {theme === 'dark' ? '🌙' : '☀️'}
      </span>
    </button>
  );
};