// Standardized loading state management hook with overlap prevention
import { useState, useCallback } from 'react';

export type LoadingKey = string;

interface LoadingState {
  [key: string]: boolean;
}

// FIXED: Loading priority system to prevent UI flickering from overlapping states
export const LOADING_PRIORITIES = {
  AUTH: 1,        // Highest priority - blocks everything
  MEMBERSHIP: 2,  // High priority - affects user capabilities
  NAVIGATION: 3,  // Medium priority - screen transitions
  DATA: 4,        // Low priority - data fetching
  CRYPTO: 4,      // Low priority - wallet operations
  PORTFOLIO: 4,   // Low priority - portfolio updates
  PROFILE: 5      // Lowest priority - profile updates
} as const;

export const useLoadingState = (initialState: LoadingState = {}) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>(initialState);

  // FIXED: Priority-aware loading state management
  const setLoading = useCallback((key: LoadingKey, isLoading: boolean, priority?: number) => {
    setLoadingStates(prev => {
      const newState = { ...prev };
      
      if (isLoading) {
        // Starting new loading state
        newState[key] = true;
        
        // If this is high priority, clear lower priority loading states to prevent overlap
        if (priority && priority <= LOADING_PRIORITIES.MEMBERSHIP) {
          Object.keys(newState).forEach(existingKey => {
            if (existingKey !== key) {
              const existingPriority = getLoadingPriority(existingKey);
              if (existingPriority > priority) {
                newState[existingKey] = false;
              }
            }
          });
        }
      } else {
        // Stopping loading state
        newState[key] = false;
      }
      
      return newState;
    });
  }, []);

  // Helper to get priority for a loading key
  const getLoadingPriority = (key: LoadingKey): number => {
    if (key.includes('auth')) return LOADING_PRIORITIES.AUTH;
    if (key.includes('membership')) return LOADING_PRIORITIES.MEMBERSHIP;
    if (key.includes('navigation') || key.includes('screen')) return LOADING_PRIORITIES.NAVIGATION;
    if (key.includes('crypto') || key.includes('wallet')) return LOADING_PRIORITIES.CRYPTO;
    if (key.includes('portfolio')) return LOADING_PRIORITIES.PORTFOLIO;
    if (key.includes('profile')) return LOADING_PRIORITIES.PROFILE;
    return LOADING_PRIORITIES.DATA; // Default to data priority
  };

  // Check if any operation is loading
  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(loading => loading);
  }, [loadingStates]);

  // Check if specific operation is loading
  const isLoading = useCallback((key: LoadingKey) => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  // Start loading for specific operation with priority
  const startLoading = useCallback((key: LoadingKey, priority?: number) => {
    setLoading(key, true, priority);
  }, [setLoading]);

  // Stop loading for specific operation
  const stopLoading = useCallback((key: LoadingKey) => {
    setLoading(key, false);
  }, [setLoading]);

  // FIXED: Priority-aware wrapper function for async operations
  const withLoading = useCallback(async <T>(
    key: LoadingKey, 
    operation: () => Promise<T>,
    priority?: number
  ): Promise<T> => {
    try {
      startLoading(key, priority);
      const result = await operation();
      return result;
    } finally {
      stopLoading(key);
    }
  }, [startLoading, stopLoading]);

  // FIXED: Get highest priority loading state (for UI display)
  const getHighestPriorityLoading = useCallback(() => {
    const activeLoading = Object.entries(loadingStates)
      .filter(([_, isLoading]) => isLoading)
      .map(([key, _]) => ({ key, priority: getLoadingPriority(key) }))
      .sort((a, b) => a.priority - b.priority);
    
    return activeLoading[0]?.key || null;
  }, [loadingStates]);

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
    clearAllLoading,
    getHighestPriorityLoading  // FIXED: New priority-aware loading method
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