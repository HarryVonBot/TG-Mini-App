// Reusable card component
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext'; // Fixed: direct import from contexts

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  variant?: 'default' | 'purple' | 'gradient';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'md',
  style,
  variant = 'default'
}) => {
  const { theme } = useTheme();
  
  const variantClasses = {
    default: theme === 'dark' 
      ? 'bg-gray-900 border border-gray-800' 
      : 'bg-white border border-gray-200',
    purple: theme === 'dark'
      ? 'bg-purple-900/20 border border-purple-500/30'
      : 'bg-purple-50 border border-purple-200',
    gradient: theme === 'dark'
      ? 'bg-gradient-to-r from-purple-900/30 to-purple-900/20 border border-purple-500/30'
      : 'bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200'
  };
  
  const baseClasses = `rounded-xl shadow-md transition-all duration-300 ${variantClasses[variant]}`;
  
  const hoverClasses = hover ? (
    theme === 'dark' 
      ? 'hover:bg-gray-800 hover:border-gray-700 cursor-pointer hover:scale-[1.02]' 
      : 'hover:bg-gray-50 hover:border-gray-300 cursor-pointer hover:scale-[1.02]'
  ) : '';
  
  const clickableClasses = onClick ? 'cursor-pointer' : '';
  
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4', 
    lg: 'p-6'
  };

  return (
    <div
      onClick={onClick}
      style={style}
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${paddingClasses[padding]} ${className}`}
    >
      {children}
    </div>
  );
};