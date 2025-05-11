import React, { createContext, useContext, useEffect, useState } from 'react';
import { initPersistenceService, saveData, getData, removeData } from '@/services/persistenceService';

// Define the context interface
interface PersistenceContextType {
  saveItem: (key: string, data: any) => Promise<void>;
  getItem: (key: string, defaultValue?: any) => Promise<any>;
  removeItem: (key: string) => Promise<void>;
  isReady: boolean;
}

// Create the context with default values
const PersistenceContext = createContext<PersistenceContextType>({
  saveItem: async () => {},
  getItem: async () => null,
  removeItem: async () => {},
  isReady: false,
});

export const usePersistence = () => useContext(PersistenceContext);

interface PersistenceProviderProps {
  children: React.ReactNode;
}

export const PersistenceProvider: React.FC<PersistenceProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  // Initialize the persistence service on component mount
  useEffect(() => {
    const initialize = async () => {
      try {
        initPersistenceService();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize persistence service:', error);
        // Try to continue even if initialization fails
        setIsReady(true);
      }
    };

    initialize();
  }, []);

  // Create the context value object with the wrapped functions
  const contextValue = {
    saveItem: async (key: string, data: any) => {
      try {
        await saveData(key, data);
        
        // For compatibility with existing code, also use the original localStorage format
        // This helps with transitioning to the new system
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.error(`Error saving item with key ${key}:`, error);
        throw error;
      }
    },

    getItem: async (key: string, defaultValue: any = null) => {
      try {
        return await getData(key, defaultValue);
      } catch (error) {
        console.error(`Error getting item with key ${key}:`, error);
        return defaultValue;
      }
    },

    removeItem: async (key: string) => {
      try {
        await removeData(key);
        
        // For compatibility with existing code, also remove from localStorage
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing item with key ${key}:`, error);
        throw error;
      }
    },

    isReady,
  };

  return (
    <PersistenceContext.Provider value={contextValue}>
      {children}
    </PersistenceContext.Provider>
  );
};

export default PersistenceProvider;
