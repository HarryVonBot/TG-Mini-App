import React from 'react';
import { BottomTabs } from './BottomTabs';
import { FloatingActionButton } from '../common/FloatingActionButton';
import { useTheme } from '../../hooks/useTheme';

interface MobileLayoutWithTabsProps {
  children: React.ReactNode;
  onNavigate?: (screen: string, params?: any) => void;
  showTabs?: boolean;
  showFAB?: boolean;
  currentScreen?: string;
  className?: string;
}

export const MobileLayoutWithTabs: React.FC<MobileLayoutWithTabsProps> = ({ 
  children,
  onNavigate,
  showTabs = true,
  showFAB = true,
  currentScreen,
  className = ''
}) => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-black text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Main content area */}
      <div className={`w-full px-4 pb-8 pt-4 space-y-6 ${showTabs ? 'pb-20' : 'pb-8'} ${className}`}>
        {children}
      </div>
      
      {/* Floating Action Button */}
      {showFAB && currentScreen === 'dashboard' && (
        <FloatingActionButton onNavigate={onNavigate} />
      )}
      
      {/* Bottom tabs navigation */}
      {showTabs && (
        <BottomTabs onNavigate={onNavigate} currentScreen={currentScreen} />
      )}
    </div>
  );
};