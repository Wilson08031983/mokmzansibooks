import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

interface LoadingState {
  isLoading: boolean;
  lastError: Error | null;
  pendingRoutes: string[];
  retryCount: number;
}

interface LoadingStateContextType {
  loadingState: LoadingState;
  setIsLoading: (isLoading: boolean) => void;
  setLastError: (error: Error | null) => void;
  registerPendingRoute: (route: string) => void;
  unregisterPendingRoute: (route: string) => void;
  incrementRetryCount: () => void;
  resetRetryCount: () => void;
  resetLoadingState: () => void;
}

const defaultLoadingState: LoadingState = {
  isLoading: false,
  lastError: null,
  pendingRoutes: [],
  retryCount: 0
};

const LoadingStateContext = createContext<LoadingStateContextType | undefined>(undefined);

export const LoadingStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loadingState, setLoadingState] = useState<LoadingState>(defaultLoadingState);
  const location = useLocation();

  // Listen for Suspense loading events
  useEffect(() => {
    const handleSuspenseTimeout = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.warn('Suspense loading timeout detected:', customEvent.detail);
      
      // We can notify other components about loading issues this way
      setLoadingState(prev => ({
        ...prev,
        lastError: new Error(`Loading timeout on ${customEvent.detail?.path || 'unknown route'}`)
      }));
    };
    
    window.addEventListener('app:loading:timeout', handleSuspenseTimeout);
    window.addEventListener('app:error:boundary', (event: Event) => {
      const customEvent = event as CustomEvent;
      console.error('Error boundary triggered:', customEvent.detail);
    });

    return () => {
      window.removeEventListener('app:loading:timeout', handleSuspenseTimeout);
      window.removeEventListener('app:error:boundary', handleSuspenseTimeout);
    };
  }, []);

  // Reset error state on route change
  useEffect(() => {
    setLoadingState(prev => ({
      ...prev,
      lastError: null,
      retryCount: 0
    }));
  }, [location.pathname]);

  const setIsLoading = (isLoading: boolean) => {
    setLoadingState(prev => ({ ...prev, isLoading }));
  };

  const setLastError = (error: Error | null) => {
    setLoadingState(prev => ({ ...prev, lastError: error }));
  };

  const registerPendingRoute = (route: string) => {
    setLoadingState(prev => ({
      ...prev,
      pendingRoutes: [...prev.pendingRoutes, route]
    }));
  };

  const unregisterPendingRoute = (route: string) => {
    setLoadingState(prev => ({
      ...prev,
      pendingRoutes: prev.pendingRoutes.filter(r => r !== route)
    }));
  };

  const incrementRetryCount = () => {
    setLoadingState(prev => ({
      ...prev,
      retryCount: prev.retryCount + 1
    }));
  };

  const resetRetryCount = () => {
    setLoadingState(prev => ({
      ...prev,
      retryCount: 0
    }));
  };

  const resetLoadingState = () => {
    setLoadingState(defaultLoadingState);
  };

  return (
    <LoadingStateContext.Provider
      value={{
        loadingState,
        setIsLoading,
        setLastError,
        registerPendingRoute,
        unregisterPendingRoute,
        incrementRetryCount,
        resetRetryCount,
        resetLoadingState
      }}
    >
      {children}
    </LoadingStateContext.Provider>
  );
};

export const useLoadingState = (): LoadingStateContextType => {
  const context = useContext(LoadingStateContext);
  if (!context) {
    throw new Error('useLoadingState must be used within a LoadingStateProvider');
  }
  return context;
};

// Custom hook to show SuspenseFallback status in other components
export const useSuspenseStatus = () => {
  const { loadingState } = useLoadingState();
  return {
    isAnySuspenseActive: loadingState.pendingRoutes.length > 0 || loadingState.isLoading,
    hasError: loadingState.lastError !== null,
    errorDetails: loadingState.lastError,
    retryAttempts: loadingState.retryCount
  };
};
