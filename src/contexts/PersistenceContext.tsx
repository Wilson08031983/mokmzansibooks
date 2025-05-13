
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface StorageStatus {
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  degradedMode: boolean;
}

interface PersistenceContextType {
  isStorageAvailable: (type: string) => boolean;
  storageStatus: StorageStatus;
  checkAllStorage: () => void;
  isDegraded: boolean;
}

const PersistenceContext = createContext<PersistenceContextType | undefined>(undefined);

export function PersistenceProvider({ children }: { children: React.ReactNode }) {
  const [storageStatus, setStorageStatus] = useState<StorageStatus>({
    localStorage: true,
    sessionStorage: true,
    indexedDB: true,
    degradedMode: false
  });

  // Function to check if a storage type is available
  const isStorageAvailable = (type: string): boolean => {
    try {
      const storage = window[type as keyof Window];
      const x = '__storage_test__';
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Check all storage types
  const checkAllStorage = () => {
    const localStorageAvailable = isStorageAvailable('localStorage');
    const sessionStorageAvailable = isStorageAvailable('sessionStorage');
    
    // Basic check for IndexedDB
    const indexedDBAvailable = 'indexedDB' in window;
    
    // Update storage status
    const newStatus: StorageStatus = {
      localStorage: localStorageAvailable,
      sessionStorage: sessionStorageAvailable,
      indexedDB: indexedDBAvailable,
      degradedMode: !localStorageAvailable || !indexedDBAvailable
    };
    
    setStorageStatus(newStatus);
    
    // If we're in degraded mode, show a toast
    if (newStatus.degradedMode && (
      storageStatus.localStorage !== newStatus.localStorage || 
      storageStatus.indexedDB !== newStatus.indexedDB
    )) {
      toast({
        title: 'Storage Warning',
        description: 'Some storage features are not available. Your data may not persist between sessions.',
        variant: 'destructive',
        duration: 10000
      });
    }
  };

  // Check storage on component mount
  useEffect(() => {
    checkAllStorage();
    
    // Setup periodic checks
    const checkInterval = setInterval(() => {
      checkAllStorage();
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(checkInterval);
  }, []);

  const value = {
    isStorageAvailable,
    storageStatus,
    checkAllStorage,
    isDegraded: storageStatus.degradedMode
  };

  return (
    <PersistenceContext.Provider value={value}>
      {children}
    </PersistenceContext.Provider>
  );
}

export function usePersistence() {
  const context = useContext(PersistenceContext);
  if (context === undefined) {
    throw new Error('usePersistence must be used within a PersistenceProvider');
  }
  return context;
}
