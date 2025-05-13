
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the type for the persistence context
export interface PersistenceContextType {
  initialized: boolean;
  status: {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
    degradedMode: boolean;
  };
  initialize: () => Promise<boolean>;
  isReady: boolean;
  getItem: <T>(key: string, defaultValue: T | null) => Promise<T | null>;
  saveItem: <T>(key: string, value: T) => Promise<boolean>;
  removeItem: (key: string) => Promise<boolean>;
  getStatus: () => {
    localStorage: boolean;
    sessionStorage: boolean;
    indexedDB: boolean;
    degradedMode: boolean;
  };
}

const PersistenceContext = createContext<PersistenceContextType>({
  initialized: false,
  status: {
    localStorage: false,
    sessionStorage: false,
    indexedDB: false,
    degradedMode: false,
  },
  initialize: async () => false,
  isReady: false,
  getItem: async () => null,
  saveItem: async () => false,
  removeItem: async () => false,
  getStatus: () => ({
    localStorage: false,
    sessionStorage: false,
    indexedDB: false,
    degradedMode: false,
  }),
});

export const usePersistence = () => useContext(PersistenceContext);

interface PersistenceProviderProps {
  children: React.ReactNode;
}

export const PersistenceProvider: React.FC<PersistenceProviderProps> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [status, setStatus] = useState({
    localStorage: false,
    sessionStorage: false,
    indexedDB: false,
    degradedMode: false,
  });

  const checkStorage = (type: 'localStorage' | 'sessionStorage'): boolean => {
    try {
      const storage = window[type];
      const testKey = `test-${Math.random()}`;
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  };

  const checkIndexedDB = async (): Promise<boolean> => {
    if (!window.indexedDB) return false;
    
    try {
      const request = window.indexedDB.open('test-db', 1);
      return new Promise((resolve) => {
        request.onerror = () => resolve(false);
        request.onsuccess = () => {
          const db = request.result;
          db.close();
          window.indexedDB.deleteDatabase('test-db');
          resolve(true);
        };
      });
    } catch (e) {
      return false;
    }
  };

  const initialize = async (): Promise<boolean> => {
    const localStorageAvailable = checkStorage('localStorage');
    const sessionStorageAvailable = checkStorage('sessionStorage');
    const indexedDBAvailable = await checkIndexedDB();
    
    const newStatus = {
      localStorage: localStorageAvailable,
      sessionStorage: sessionStorageAvailable,
      indexedDB: indexedDBAvailable,
      degradedMode: !localStorageAvailable || !indexedDBAvailable,
    };
    
    setStatus(newStatus);
    setInitialized(true);
    return !newStatus.degradedMode;
  };

  useEffect(() => {
    initialize();
  }, []);

  // Implementation of persistence functions
  const getItem = async <T,>(key: string, defaultValue: T | null = null): Promise<T | null> => {
    try {
      if (status.localStorage) {
        const item = localStorage.getItem(key);
        if (item) {
          return JSON.parse(item) as T;
        }
      }
      return defaultValue;
    } catch (e) {
      console.error('Error getting item:', e);
      return defaultValue;
    }
  };

  const saveItem = async <T,>(key: string, value: T): Promise<boolean> => {
    try {
      if (status.localStorage) {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error saving item:', e);
      return false;
    }
  };

  const removeItem = async (key: string): Promise<boolean> => {
    try {
      if (status.localStorage) {
        localStorage.removeItem(key);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error removing item:', e);
      return false;
    }
  };

  const getStatus = () => status;

  const value: PersistenceContextType = {
    initialized,
    status,
    initialize,
    isReady: initialized && !status.degradedMode,
    getItem,
    saveItem,
    removeItem,
    getStatus,
  };

  return (
    <PersistenceContext.Provider value={value}>
      {children}
    </PersistenceContext.Provider>
  );
};

export default PersistenceProvider;
