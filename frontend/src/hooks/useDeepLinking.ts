// URL state management for deep linking support
import { useEffect, useCallback } from 'react';
import type { ScreenType } from '../types';

export interface DeepLinkParams {
  screen?: string;
  userId?: string;
  investmentId?: string;
  walletId?: string;
  [key: string]: string | undefined;
}

export const useDeepLinking = (
  currentScreen: ScreenType,
  onNavigate: (screen: ScreenType, params?: any) => void
) => {
  // Parse URL parameters
  const parseUrlParams = useCallback((): DeepLinkParams => {
    const urlParams = new URLSearchParams(window.location.search);
    const params: DeepLinkParams = {};
    
    // Get all URL parameters
    for (const [key, value] of urlParams.entries()) {
      params[key] = value;
    }
    
    return params;
  }, []);

  // Update URL without page reload
  const updateUrl = useCallback((screen: ScreenType, params?: any) => {
    const searchParams = new URLSearchParams();
    
    // Add screen parameter
    searchParams.set('screen', screen);
    
    // Add additional parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
    }
    
    // Update URL without reloading
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    window.history.replaceState({ screen, params }, '', newUrl);
  }, []);

  // Navigate to screen from URL
  const navigateFromUrl = useCallback((urlParams: DeepLinkParams) => {
    const { screen, ...params } = urlParams;
    
    if (screen && isValidScreen(screen)) {
      console.log(`Deep linking to screen: ${screen}`, params);
      onNavigate(screen as ScreenType, params);
      return true;
    }
    
    return false;
  }, [onNavigate]);

  // Validate screen name
  const isValidScreen = (screen: string): boolean => {
    const validScreens = [
      'welcome', 'login', 'signup', 'terms-of-service', 'privacy-policy',
      'email-verification', 'sms-verification', '2fa-setup', '2fa-authenticator-setup', 
      'enhanced-2fa-setup', '2fa-sms-setup', 'verification-success',
      'connect-bank', 'connect-crypto', 'test-wallet-connections',
      'dashboard', 'investments', 'crypto', 'profile', 
      'analytics', 'achievements', 'auto-investment', 'new-investment', 'investment-completion',
      'crypto-deposit', 'wallet-manager', 'funds', 'transfer', 'withdraw', 'membership-status', 'edit-profile',
      'admin-dashboard', 'admin-users', 'admin-user-details', 'admin-investments', 'admin-crypto', 'admin-plans',
      'create-ticket', 'my-tickets', 'smart-contract-investment',
      'ui-catalog'
    ];
    
    return validScreens.includes(screen);
  };

  // Initialize deep linking on component mount
  useEffect(() => {
    const urlParams = parseUrlParams();
    
    // If there's a screen parameter in URL, navigate to it
    if (urlParams.screen) {
      navigateFromUrl(urlParams);
    }
  }, [parseUrlParams, navigateFromUrl]);

  // Update URL when screen changes
  useEffect(() => {
    // Only update URL for main app screens, not auth screens
    const authScreens = [
      'welcome', 'login', 'signup', 'terms-of-service', 'privacy-policy',
      'email-verification', 'sms-verification', '2fa-setup', '2fa-authenticator-setup', 
      'enhanced-2fa-setup', '2fa-sms-setup', 'verification-success',
      'connect-bank', 'connect-crypto', 'test-wallet-connections'
    ];
    
    if (!authScreens.includes(currentScreen)) {
      updateUrl(currentScreen);
    }
  }, [currentScreen, updateUrl]);

  // Generate shareable URL for current screen
  const generateShareableUrl = useCallback((params?: any): string => {
    const searchParams = new URLSearchParams();
    searchParams.set('screen', currentScreen);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.set(key, String(value));
        }
      });
    }
    
    return `${window.location.origin}${window.location.pathname}?${searchParams.toString()}`;
  }, [currentScreen]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen) {
        onNavigate(event.state.screen, event.state.params);
      } else {
        // Parse URL if no state available
        const urlParams = parseUrlParams();
        if (urlParams.screen) {
          navigateFromUrl(urlParams);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [parseUrlParams, navigateFromUrl, onNavigate]);

  return {
    parseUrlParams,
    updateUrl,
    navigateFromUrl,
    generateShareableUrl,
    isValidScreen
  };
};

// Deep linking utility functions
export const deepLinkUtils = {
  // Create admin user details link
  createAdminUserDetailsLink: (userId: string): string => {
    return `${window.location.origin}${window.location.pathname}?screen=admin-user-details&userId=${userId}`;
  },

  // Create investment details link
  createInvestmentDetailsLink: (investmentId: string): string => {
    return `${window.location.origin}${window.location.pathname}?screen=investment-details&investmentId=${investmentId}`;
  },

  // Create wallet manager link
  createWalletManagerLink: (walletId?: string): string => {
    const params = walletId ? `&walletId=${walletId}` : '';
    return `${window.location.origin}${window.location.pathname}?screen=wallet-manager${params}`;
  },

  // Create profile link with specific section
  createProfileLink: (section?: string): string => {
    const params = section ? `&section=${section}` : '';
    return `${window.location.origin}${window.location.pathname}?screen=profile${params}`;
  }
};