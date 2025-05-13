
import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import storageStatusManager from '@/utils/storageStatusManager';

interface PersistenceContextType {
  isReady: boolean;
  getItem: <T>(key: string, defaultValue?: T) => T | null;
  saveItem: <T>(key: string, value: T) => boolean;
  removeItem: (key: string) => boolean;
  clearAll: () => boolean;
  status: {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
    degradedMode: boolean;
  };
}

const PersistenceContext = createContext<PersistenceContextType>({
  isReady: false,
  getItem: () => null,
  saveItem: () => false,
  removeItem: () => false,
  clearAll: () => false,
  status: {
    localStorage: false,
    sessionStorage: false,
    indexedDB: false,
    degradedMode: true
  }
});

interface PersistenceProviderProps {
  children: React.ReactNode;
}

export const PersistenceProvider: React.FC<PersistenceProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState(storageStatusManager.getStorageStatus());
  
  // Initialize persistence layer
  useEffect(() => {
    const initialize = async () => {
      try {
        // Get the current storage status
        const currentStatus = await storageStatusManager.initialize();
        setStatus(currentStatus);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize persistence layer:', error);
        // Still mark as ready, but with degraded capabilities
        setIsReady(true);
      }
    };
    
    initialize();
    
    // Start periodic monitoring of storage status
    const stopMonitoring = storageStatusManager.startStorageMonitoring(30000);
    
    return () => {
      stopMonitoring();
    };
  }, []);
  
  // Update status when storage status changes
  useEffect(() => {
    const handleStorageStatusChange = () => {
      setStatus(storageStatusManager.getStorageStatus());
    };
    
    window.addEventListener('storage:status:change', handleStorageStatusChange);
    
    return () => {
      window.removeEventListener('storage:status:change', handleStorageStatusChange);
    };
  }, []);
  
  // Main persistence methods
  const getItem = <T,>(key: string, defaultValue?: T): T | null => {
    try {
      if (status.localStorage) {
        const item = localStorage.getItem(key);
        if (item) {
          return JSON.parse(item) as T;
        }
      }
      
      // Fallback to sessionStorage if localStorage is not available
      if (status.sessionStorage) {
        const item = sessionStorage.getItem(key);
        if (item) {
          return JSON.parse(item) as T;
        }
      }
      
      // Return default value or null if not found
      return defaultValue !== undefined ? defaultValue : null;
    } catch (error) {
      console.error(`Error getting item with key "${key}":`, error);
      return defaultValue !== undefined ? defaultValue : null;
    }
  };
  
  const saveItem = <T,>(key: string, value: T): boolean => {
    try {
      const serialized = JSON.stringify(value);
      
      // Try localStorage first
      if (status.localStorage) {
        try {
          localStorage.setItem(key, serialized);
          return true;
        } catch (error) {
          console.warn(`Failed to save to localStorage, trying sessionStorage:`, error);
        }
      }
      
      // Fallback to sessionStorage
      if (status.sessionStorage) {
        try {
          sessionStorage.setItem(key, serialized);
          return true;
        } catch (error) {
          console.error(`Failed to save to sessionStorage:`, error);
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Error saving item with key "${key}":`, error);
      return false;
    }
  };
  
  const removeItem = (key: string): boolean => {
    try {
      // Try to remove from both storage types
      let success = false;
      
      if (status.localStorage) {
        try {
          localStorage.removeItem(key);
          success = true;
        } catch (error) {
          console.warn(`Failed to remove from localStorage:`, error);
        }
      }
      
      if (status.sessionStorage) {
        try {
          sessionStorage.removeItem(key);
          success = true;
        } catch (error) {
          console.warn(`Failed to remove from sessionStorage:`, error);
        }
      }
      
      return success;
    } catch (error) {
      console.error(`Error removing item with key "${key}":`, error);
      return false;
    }
  };
  
  const clearAll = (): boolean => {
    try {
      let success = false;
      
      if (status.localStorage) {
        try {
          localStorage.clear();
          success = true;
        } catch (error) {
          console.warn(`Failed to clear localStorage:`, error);
        }
      }
      
      if (status.sessionStorage) {
        try {
          sessionStorage.clear();
          success = true;
        } catch (error) {
          console.warn(`Failed to clear sessionStorage:`, error);
        }
      }
      
      return success;
    } catch (error) {
      console.error(`Error clearing storage:`, error);
      return false;
    }
  };
  
  const contextValue = useMemo(() => ({
    isReady,
    getItem,
    saveItem,
    removeItem,
    clearAll,
    status
  }), [isReady, status]);
  
  return (
    <PersistenceContext.Provider value={contextValue}>
      {children}
    </PersistenceContext.Provider>
  );
};

export const usePersistence = (): PersistenceContextType => {
  const context = useContext(PersistenceContext);
  
  if (!context) {
    throw new Error('usePersistence must be used within a PersistenceProvider');
  }
  
  return context;
};

export default PersistenceContext;
