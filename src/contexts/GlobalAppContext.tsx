
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ensureInitialized } from '@/utils/robustStorageMigrator';
import { toast } from '@/hooks/use-toast';

interface GlobalAppContextType {
  isInitialized: boolean;
  initializeApp: () => Promise<boolean>;
  isOnline: boolean;
  lastSyncTime: Date | null;
  triggerSync: () => Promise<boolean>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isMaintenanceMode: boolean;
}

const GlobalAppContext = createContext<GlobalAppContextType>({
  isInitialized: false,
  initializeApp: async () => false,
  isOnline: true,
  lastSyncTime: null,
  triggerSync: async () => false,
  isDarkMode: false,
  toggleDarkMode: () => {},
  isMaintenanceMode: false,
});

export const useGlobalApp = () => useContext(GlobalAppContext);

interface GlobalAppProviderProps {
  children: ReactNode;
}

export const GlobalAppProvider: React.FC<GlobalAppProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage or system preference
    const saved = localStorage.getItem('color-theme');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online",
        description: "Connection restored",
        variant: "success",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Changes will be saved locally",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize app
  const initializeApp = async (): Promise<boolean> => {
    try {
      const success = await ensureInitialized('MokMzansi Books', '1.0.0');
      setIsInitialized(success);
      
      // Check if maintenance mode is active
      checkMaintenanceMode();
      
      return success;
    } catch (error) {
      console.error('Error initializing app:', error);
      return false;
    }
  };

  // Check if server is in maintenance mode
  const checkMaintenanceMode = async () => {
    try {
      // This would typically check with a backend API
      // For now, just simulate with a local check
      const isInMaintenance = localStorage.getItem('maintenance-mode') === 'true';
      setIsMaintenanceMode(isInMaintenance);
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
    }
  };

  // Trigger data sync with server
  const triggerSync = async (): Promise<boolean> => {
    try {
      if (!isOnline) {
        toast({
          title: "Sync failed",
          description: "You're currently offline",
          variant: "destructive",
        });
        return false;
      }

      // Here you would implement actual sync logic with your backend
      // For now, just simulate a successful sync
      console.log('Syncing data with server...');
      
      // Update last sync time
      const syncTime = new Date();
      setLastSyncTime(syncTime);
      localStorage.setItem('last-sync-time', syncTime.toISOString());
      
      toast({
        title: "Sync complete",
        description: "Your data is up to date",
        variant: "success",
      });
      
      return true;
    } catch (error) {
      console.error('Error syncing data:', error);
      
      toast({
        title: "Sync failed",
        description: "Could not sync with server",
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Update localStorage and document class
    localStorage.setItem('color-theme', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    // Set initial dark mode class on document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Initialize the app on mount
    initializeApp();
    
    // Load last sync time from localStorage
    const lastSync = localStorage.getItem('last-sync-time');
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
    }
  }, []);

  return (
    <GlobalAppContext.Provider
      value={{
        isInitialized,
        initializeApp,
        isOnline,
        lastSyncTime,
        triggerSync,
        isDarkMode,
        toggleDarkMode,
        isMaintenanceMode,
      }}
    >
      {children}
    </GlobalAppContext.Provider>
  );
};
