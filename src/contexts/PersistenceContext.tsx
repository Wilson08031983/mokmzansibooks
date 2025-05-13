import React, { createContext, useContext, useEffect, useState } from 'react';
import { initPersistenceService, saveData, getData, removeData } from '@/services/persistenceService';
import storageStatusManager from '@/utils/storageStatusManager';

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
    let isMounted = true;
    let initTimeout: NodeJS.Timeout | null = null;
    
    const initialize = async () => {
      try {
        // First make sure our storage status is checked
        await storageStatusManager.initialize();
        
        // Then initialize the persistence service with the storage status
        await initPersistenceService();
        
        // Only update state if component is still mounted
        if (isMounted) {
          console.log('PersistenceContext: Service initialized successfully');
          setIsReady(true);
        }
      } catch (error) {
        console.error('PersistenceContext: Failed to initialize persistence service:', error);
        
        // Try to continue even if initialization fails
        if (isMounted) {
          // Set a delayed ready state to prevent UI blocking
          initTimeout = setTimeout(() => {
            if (isMounted) {
              console.log('PersistenceContext: Continuing despite initialization failure');
              setIsReady(true);
            }
          }, 1000);
        }
      }
    };

    initialize();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      if (initTimeout) clearTimeout(initTimeout);
    };
  }, []);

  // Create the context value object with the wrapped functions
  const contextValue = {
    saveItem: async (key: string, data: any) => {
      try {
        // Get current storage status
        const status = storageStatusManager.getStatus();
        
        // Use the persistence service first
        await saveData(key, data);
        
        // For compatibility with existing code, also try localStorage if available
        if (status.localStorageAvailable) {
          try {
            localStorage.setItem(key, JSON.stringify(data));
          } catch (e) {
            console.warn(`Failed to save to localStorage for key ${key}:`, e);
            // Non-critical error, continue
          }
        }
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
