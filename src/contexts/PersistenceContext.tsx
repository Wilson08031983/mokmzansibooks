
import React, { createContext, useContext, useState, useEffect } from 'react';
import permanentStorage, { StorageNamespace } from '@/utils/permanentStorage';

export interface PersistenceContextType {
  isReady: boolean;
  error: Error | null;
  saveItem: <T>(key: string, value: T, namespace?: StorageNamespace) => Promise<boolean>;
  getItem: <T>(key: string, defaultValue: T | null, namespace?: StorageNamespace) => Promise<T | null>;
  removeItem: (key: string, namespace?: StorageNamespace) => Promise<boolean>;
  clearAll: () => Promise<boolean>;
}

const defaultContext: PersistenceContextType = {
  isReady: false,
  error: null,
  saveItem: async () => false,
  getItem: async () => null,
  removeItem: async () => false,
  clearAll: async () => false,
};

const PersistenceContext = createContext<PersistenceContextType>(defaultContext);

export const PersistenceProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await permanentStorage.waitUntilReady(2000);
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize persistence storage:', err);
        setError(err instanceof Error ? err : new Error('Unknown error initializing storage'));
      }
    };

    initializeStorage();
  }, []);

  const saveItem = async <T,>(key: string, value: T, namespace: StorageNamespace = StorageNamespace.APP_DATA): Promise<boolean> => {
    try {
      if (!isReady) {
        await permanentStorage.waitUntilReady(1000);
      }
      return await permanentStorage.saveData(namespace, { [key]: value });
    } catch (err) {
      console.error(`Error saving item ${key}:`, err);
      return false;
    }
  };

  const getItem = async <T,>(key: string, defaultValue: T | null = null, namespace: StorageNamespace = StorageNamespace.APP_DATA): Promise<T | null> => {
    try {
      if (!isReady) {
        await permanentStorage.waitUntilReady(1000);
      }
      const data = await permanentStorage.loadData(namespace);
      return data && data[key] !== undefined ? data[key] : defaultValue;
    } catch (err) {
      console.error(`Error getting item ${key}:`, err);
      return defaultValue;
    }
  };

  const removeItem = async (key: string, namespace: StorageNamespace = StorageNamespace.APP_DATA): Promise<boolean> => {
    try {
      if (!isReady) {
        await permanentStorage.waitUntilReady(1000);
      }
      const data = await permanentStorage.loadData(namespace);
      if (data) {
        delete data[key];
        return await permanentStorage.saveData(namespace, data);
      }
      return true;
    } catch (err) {
      console.error(`Error removing item ${key}:`, err);
      return false;
    }
  };

  const clearAll = async (): Promise<boolean> => {
    try {
      if (!isReady) {
        await permanentStorage.waitUntilReady(1000);
      }
      
      // Clear all namespaces
      for (const namespace of Object.values(StorageNamespace)) {
        await permanentStorage.saveData(namespace, {});
      }
      
      return true;
    } catch (err) {
      console.error('Error clearing all persistence data:', err);
      return false;
    }
  };

  return (
    <PersistenceContext.Provider 
      value={{ 
        isReady, 
        error, 
        saveItem, 
        getItem, 
        removeItem,
        clearAll
      }}
    >
      {children}
    </PersistenceContext.Provider>
  );
};

export const usePersistence = () => useContext(PersistenceContext);
