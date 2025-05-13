
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { SyncStatus } from '../components/shared/SyncIndicator';

// Context interface
interface SyncContextType {
  syncStatus: SyncStatus;
  syncMessage: string;
  showSyncing: (message?: string) => void;
  showSuccess: (message?: string) => void;
  showError: (message?: string) => void;
  resetStatus: () => void;
}

// Create context with default values
const SyncContext = createContext<SyncContextType>({
  syncStatus: SyncStatus.IDLE,
  syncMessage: '',
  showSyncing: () => {},
  showSuccess: () => {},
  showError: () => {},
  resetStatus: () => {}
});

// Custom hook to use the sync context
export const useSyncStatus = () => useContext(SyncContext);

interface SyncProviderProps {
  children: ReactNode;
}

export const SyncProvider: React.FC<SyncProviderProps> = ({ children }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.IDLE);
  const [syncMessage, setSyncMessage] = useState<string>('');

  // Show syncing status
  const showSyncing = (message?: string) => {
    setSyncStatus(SyncStatus.SYNCING);
    if (message) setSyncMessage(message);
  };

  // Show success status and auto-reset after delay
  const showSuccess = (message?: string) => {
    setSyncStatus(SyncStatus.SUCCESS);
    if (message) setSyncMessage(message);
    
    // Auto-reset to idle after 3 seconds
    setTimeout(() => {
      setSyncStatus(SyncStatus.IDLE);
    }, 3000);
  };

  // Show error status
  const showError = (message?: string) => {
    setSyncStatus(SyncStatus.ERROR);
    if (message) setSyncMessage(message);
  };

  // Reset to idle
  const resetStatus = () => {
    setSyncStatus(SyncStatus.IDLE);
    setSyncMessage('');
  };

  return (
    <SyncContext.Provider
      value={{
        syncStatus,
        syncMessage,
        showSyncing,
        showSuccess,
        showError,
        resetStatus
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export default SyncContext;
