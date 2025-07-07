import React from 'react';
import { useTheme } from '../../contexts/ThemeContext'; // Fixed: direct import from contexts
import { motion } from 'framer-motion';

export const ThemeIndicator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed top-2 left-1/2 transform -translate-x-1/2 z-50 px-3 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gray-800 text-gray-300 border border-gray-700'
          : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
      }`}
    >
      {theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </motion.div>
  );
};