// React context for global app state
import React, { createContext, useContext, ReactNode } from 'react';
import type { AppContextType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { usePortfolio } from '../hooks/usePortfolio';
import { useMembership } from '../hooks/useMembership';
import { TelegramProvider, useTelegram } from './TelegramContext';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <TelegramProvider>
      <AppProviderInner>{children}</AppProviderInner>
    </TelegramProvider>
  );
};

const AppProviderInner: React.FC<AppProviderProps> = ({ children }) => {
  const auth = useAuth();
  const { portfolio, loading, fetchPortfolio } = usePortfolio(auth.user);
  const { membershipStatus, fetchMembershipStatus } = useMembership(auth.user);

  const contextValue: AppContextType = {
    user: auth.user,
    setUser: auth.setUser,
    portfolio,
    loading,
    fetchPortfolio,
    membershipStatus,
    fetchMembershipStatus
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};