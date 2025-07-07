// Reusable loading spinner component
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext'; // Fixed: direct import from contexts

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
  variant?: 'primary' | 'secondary';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color,
  text,
  variant = 'primary'
}) => {
  const { theme } = useTheme();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-12 w-12'
  };

  const variantColors = {
    primary: 'border-purple-500',
    secondary: theme === 'dark' ? 'border-gray-400' : 'border-gray-600'
  };

  const finalColor = color || variantColors[variant];

  return (
    <div className="flex items-center justify-center space-x-2">
      <div className={`animate-spin rounded-full border-b-2 ${finalColor} ${sizeClasses[size]}`}></div>
      {text && (
        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
          {text}
        </span>
      )}
    </div>
  );
};

// Full screen loading component
export const FullScreenLoader: React.FC<{ text?: string }> = ({ text = "Loading..." }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
};