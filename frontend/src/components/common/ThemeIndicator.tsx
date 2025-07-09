import React from 'react';
import { useTheme } from '../../hooks/useTheme';
// REMOVED: framer-motion dependency

export const ThemeIndicator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="theme-indicator fixed top-2 right-2 z-50 px-3 py-1 bg-black bg-opacity-50 text-white text-xs rounded-full backdrop-blur-sm">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${theme === 'dark' ? 'bg-blue-400' : 'bg-yellow-400'}`} />
        <span className="capitalize">{theme} Mode</span>
      </div>
    </div>
  );
};