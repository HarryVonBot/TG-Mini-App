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
      {/* Main content area - Optimized mobile spacing */}
      <div className={`w-full px-3 sm:px-4 py-2 space-y-4 ${showTabs ? 'pb-24' : 'pb-6'} ${className}`}>
        {children}
      </div>
      
      {/* Floating Action Button - Positioned better for mobile */}
      {showFAB && currentScreen === 'dashboard' && (
        <FloatingActionButton onNavigate={onNavigate} />
      )}
      
      {/* Bottom tabs navigation - Fixed positioning */}
      {showTabs && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomTabs onNavigate={onNavigate} currentScreen={currentScreen} />
        </div>
      )}
    </div>
  );
};