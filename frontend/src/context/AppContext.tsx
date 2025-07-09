// React context for global app state
import React, { createContext, useContext, ReactNode } from 'react';
import type { AppContextType, ConnectedWallet } from '../types';
import { useAuth } from '../hooks/useAuth';
import { usePortfolio } from '../hooks/usePortfolio';
import { useMembership } from '../hooks/useMembership';
import { useMultiWallet } from '../hooks/useMultiWallet';
import { useLoadingState, LOADING_KEYS } from '../hooks/useLoadingState';
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
  const { portfolio, loading: portfolioLoading, fetchPortfolio } = usePortfolio(auth.user);
  
  // Special handling for hardcoded admin users to prevent race condition logout
  const isHardcodedAdmin = auth.user?.email && 
    ['admin@vonartis.com', 'security@vonartis.com'].includes(auth.user.email);
  
  // FIX: Only call useMembership when we have a stable user state with token
  // This prevents race condition where membership hook receives null during state transitions
  const shouldFetchMembership = auth.user && (auth.user.token || isHardcodedAdmin);
  const { membershipStatus, fetchMembershipStatus, loading: membershipLoading } = useMembership(
    shouldFetchMembership ? auth.user : null
  );
  
  // === STANDARDIZED LOADING STATE MANAGEMENT ===
  const { isAnyLoading, isLoading } = useLoadingState({
    [LOADING_KEYS.PORTFOLIO]: portfolioLoading,
    [LOADING_KEYS.MEMBERSHIP]: membershipLoading,
    [LOADING_KEYS.AUTH]: auth.loading
  });
  
  // === PHASE 2: MULTI-WALLET STATE MANAGEMENT (EXACT SPECIFICATION) ===
  const multiWallet = useMultiWallet(auth.user);

  const contextValue: AppContextType = {
    user: auth.user,
    setUser: auth.setUser,
    portfolio,
    loading: isAnyLoading(), // Standardized combined loading state
    fetchPortfolio,
    membershipStatus,
    fetchMembershipStatus,
    
    // === PHASE 2: MULTI-WALLET CONTEXT VALUES ===
    connected_wallets: multiWallet.connected_wallets,
    primary_wallet: multiWallet.primary_wallet,
    connectWallet: multiWallet.connectWallet,
    disconnectWallet: multiWallet.disconnectWallet,
    setPrimaryWallet: multiWallet.setPrimaryWallet,
    renameWallet: multiWallet.renameWallet,
    refreshWalletBalances: multiWallet.refreshWalletBalances,
    getWalletByNetwork: multiWallet.getWalletByNetwork
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};