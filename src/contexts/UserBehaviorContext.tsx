import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSupabaseAuth } from './SupabaseAuthContext';

// Types for User Behavior Tracking
export interface UserAction {
  type: 'navigation' | 'interaction' | 'feature_usage';
  route: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export interface UserBehaviorContextType {
  trackAction: (action: Omit<UserAction, 'timestamp'>) => void;
  getUserActionHistory: (filter?: Partial<UserAction>) => UserAction[];
  getMostFrequentRoutes: () => Record<string, number>;
  getRecentActions: (limit?: number) => UserAction[];
}

const UserBehaviorContext = createContext<UserBehaviorContextType | undefined>(undefined);

export const UserBehaviorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [actionHistory, setActionHistory] = useState<UserAction[]>([]);
  const { currentUser } = useSupabaseAuth();

  // Track initial page load
  useEffect(() => {
    if (currentUser) {
      trackAction({
        type: 'navigation',
        route: window.location.pathname,
        details: { initial_load: true }
      });
    }
  }, [currentUser]);

  const trackAction = useCallback((action: Omit<UserAction, 'timestamp'>) => {
    if (!currentUser) return;

    const newAction: UserAction = {
      ...action,
      timestamp: new Date()
    };

    setActionHistory(prev => {
      // Limit history to last 100 actions
      const updatedHistory = [...prev, newAction].slice(-100);
      
      // Optional: Send to backend for more advanced tracking
      // sendActionToBackend(newAction);

      return updatedHistory;
    });
  }, [currentUser]);

  const getUserActionHistory = useCallback((filter?: Partial<UserAction>) => {
    if (!filter) return actionHistory;

    return actionHistory.filter(action => 
      Object.entries(filter).every(([key, value]) => 
        action[key as keyof UserAction] === value
      )
    );
  }, [actionHistory]);

  const getMostFrequentRoutes = useCallback(() => {
    const routeCounts: Record<string, number> = {};
    
    actionHistory
      .filter(action => action.type === 'navigation')
      .forEach(action => {
        routeCounts[action.route] = (routeCounts[action.route] || 0) + 1;
      });

    return routeCounts;
  }, [actionHistory]);

  const getRecentActions = useCallback((limit = 10) => {
    return actionHistory.slice(-limit).reverse();
  }, [actionHistory]);

  const contextValue = {
    trackAction,
    getUserActionHistory,
    getMostFrequentRoutes,
    getRecentActions
  };

  return (
    <UserBehaviorContext.Provider value={contextValue}>
      {children}
    </UserBehaviorContext.Provider>
  );
};

export const useUserBehavior = () => {
  const context = useContext(UserBehaviorContext);
  if (context === undefined) {
    throw new Error('useUserBehavior must be used within a UserBehaviorProvider');
  }
  return context;
};
