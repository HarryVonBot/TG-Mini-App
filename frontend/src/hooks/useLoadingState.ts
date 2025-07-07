// Standardized loading state management hook
import { useState, useCallback } from 'react';

export type LoadingKey = string;

interface LoadingState {
  [key: string]: boolean;
}

export const useLoadingState = (initialState: LoadingState = {}) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>(initialState);

  // Set loading state for a specific key
  const setLoading = useCallback((key: LoadingKey, isLoading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: isLoading
    }));
  }, []);

  // Check if any operation is loading
  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  // Check if specific operation is loading
  const isLoading = useCallback((key: LoadingKey) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  // Start loading for specific operation
  const startLoading = useCallback((key: LoadingKey) => {
    setLoading(key, true);
  }, [setLoading]);

  // Stop loading for specific operation
  const stopLoading = useCallback((key: LoadingKey) => {
    setLoading(key, false);
  }, [setLoading]);

  // Wrapper function for async operations
  const withLoading = useCallback(async <T>(
    key: LoadingKey, 
    operation: () => Promise<T>
  ): Promise<T> => {
    try {
      startLoading(key);
      const result = await operation();
      return result;
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  // Clear all loading states
  const clearAllLoading = useCallback(() => {
    setLoadingStates({});
  }, []);

  return {
    loadingStates,
    setLoading,
    isAnyLoading,
    isLoading,
    startLoading,
    stopLoading,
    withLoading,
    clearAllLoading
  };
};

// Common loading keys for consistency
export const LOADING_KEYS = {
  AUTH: 'auth',
  PORTFOLIO: 'portfolio', 
  MEMBERSHIP: 'membership',
  DASHBOARD: 'dashboard',
  INVESTMENTS: 'investments',
  CRYPTO: 'crypto',
  PROFILE: 'profile',
  SETTINGS: 'settings'
} as const;