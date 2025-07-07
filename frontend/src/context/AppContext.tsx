// React context for global app state
import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import type { AppContextType, ConnectedWallet } from '../types';
import { useAuth } from '../hooks/useAuth';
import { usePortfolio } from '../hooks/usePortfolio';
import { useMultiWallet } from '../hooks/useMultiWallet';
import { TelegramProvider, useTelegram } from './TelegramContext';
import { apiService } from '../services/api';

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
  
  // Manage membership state directly to avoid race conditions
  const [membershipStatus, setMembershipStatus] = useState<any>(null);
  const [membershipLoading, setMembershipLoading] = useState(false);
  
  // Fetch membership status when user becomes available
  const fetchMembershipStatus = useCallback(async () => {
    if (!auth.user?.token) {
      console.log('fetchMembershipStatus: No user token available');
      setMembershipStatus(null);
      return;
    }

    try {
      setMembershipLoading(true);
      console.log('fetchMembershipStatus: Fetching for user with token');
      const status = await apiService.getMembershipStatus(auth.user.token);
      console.log('fetchMembershipStatus: Success:', status);
      setMembershipStatus(status);
    } catch (error) {
      console.error('fetchMembershipStatus: Error:', error);
      setMembershipStatus(null);
    } finally {
      setMembershipLoading(false);
    }
  }, [auth.user?.token]);

  // Auto-fetch membership when user becomes available
  useEffect(() => {
    console.log('AppContext: Auth user changed, token exists:', !!auth.user?.token);
    if (auth.user?.token) {
      console.log('AppContext: Fetching membership status');
      fetchMembershipStatus();
    } else {
      console.log('AppContext: Clearing membership status');
      setMembershipStatus(null);
      setMembershipLoading(false);
    }
  }, [auth.user?.token, fetchMembershipStatus]);
  
  // === PHASE 2: MULTI-WALLET STATE MANAGEMENT (EXACT SPECIFICATION) ===
  const multiWallet = useMultiWallet(auth.user);

  const contextValue: AppContextType = {
    user: auth.user,
    setUser: auth.setUser,
    portfolio,
    loading: loading || membershipLoading, // Combined loading state
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