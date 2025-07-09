import React, { useState } from 'react';
// REMOVED: framer-motion dependency
import { Button } from './Button';

interface FloatingActionButtonProps {
  onNavigate?: (screen: string, params?: any) => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions = [
    {
      id: 'invest',
      icon: '💰',
      label: 'Quick Invest',
      action: () => onNavigate?.('new-investment'),
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      id: 'auto-invest',
      icon: '⚡',
      label: 'Auto-Invest',
      action: () => onNavigate?.('auto-investment'),
      color: 'bg-orange-600 hover:bg-orange-700'
    },
    {
      id: 'analytics',
      icon: '📈',
      label: 'Analytics',
      action: () => onNavigate?.('analytics'),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'crypto',
      icon: '💼',
      label: 'Crypto Wallet',
      action: () => onNavigate?.('crypto'),
      color: 'bg-green-600 hover:bg-green-700'
    }
  ];

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {/* Quick Action Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 space-y-3"
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="text-white text-sm font-medium bg-gray-800 px-3 py-1 rounded-lg">
                  {action.label}
                </span>
                <motion.button
                  className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center text-white shadow-lg`}
                  onClick={() => {
                    action.action();
                    setIsOpen(false);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <span className="text-xl">{action.icon}</span>
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
          isOpen 
            ? 'bg-red-600 hover:bg-red-700' 
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
        }`}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <span className="text-2xl">{isOpen ? '✕' : '⚡'}</span>
      </motion.button>
    </div>
  );
};