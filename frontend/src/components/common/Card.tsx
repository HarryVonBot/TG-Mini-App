// Reusable card component
import React from 'react';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'md',
  style
}) => {
  const { theme } = useTheme();
  
  const baseClasses = `rounded-xl shadow-md transition-colors duration-300 ${
    theme === 'dark' 
      ? 'bg-gray-900 border border-gray-800' 
      : 'bg-white border border-gray-200'
  }`;
  
  const hoverClasses = hover ? (
    theme === 'dark' 
      ? 'hover:bg-gray-800 cursor-pointer' 
      : 'hover:bg-gray-50 cursor-pointer'
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