// Reusable button component
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { useTheme } from '../../hooks/useTheme';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button'
}) => {
  const { theme } = useTheme();
  
  const baseClasses = 'font-semibold rounded-xl shadow-md transition-colors duration-300 flex items-center justify-center';
  
  const variantClasses = {
    primary: theme === 'dark' 
      ? 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white'
      : 'bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white',
    secondary: theme === 'dark'
      ? 'border border-purple-500 text-white hover:bg-purple-500/10 disabled:border-gray-600 disabled:text-gray-400'
      : 'border border-purple-500 text-purple-600 hover:bg-purple-50 disabled:border-gray-300 disabled:text-gray-400',
    danger: theme === 'dark'
      ? 'bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white'
      : 'bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white',
    outline: theme === 'dark'
      ? 'border border-gray-500 text-gray-300 hover:bg-gray-500/10 disabled:border-gray-600 disabled:text-gray-400'
      : 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:border-gray-200 disabled:text-gray-400'
  };

  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-6',
    lg: 'py-4 px-8'
  };

  const widthClass = fullWidth ? 'w-full' : '';
  
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" color="border-white" />
          <span className="ml-2">Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};