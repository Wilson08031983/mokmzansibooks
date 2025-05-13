
/**
 * Type definitions for synchronization functionality
 */

export interface SyncAdapter {
  isReady: boolean;
  isPending: boolean;
  lastSync?: Date;
  syncErrors?: Error[];
}

export interface AccountingAdapter extends SyncAdapter {
  loadAccountingData: () => Promise<any>;
  saveAccountingData: (data: any) => Promise<boolean>;
}

export interface HRAdapter extends SyncAdapter {
  loadHRData: () => Promise<any>;
  saveHRData: (data: any) => Promise<boolean>;
}

export interface InventoryAdapter extends SyncAdapter {
  loadInventoryData: () => Promise<any>;
  saveInventoryData: (data: any) => Promise<boolean>;
}

export interface ReportsAdapter extends SyncAdapter {
  loadReportsData: () => Promise<any>;
  saveReportsData: (data: any) => Promise<boolean>;
}

export interface SettingsAdapter extends SyncAdapter {
  loadSettings: () => Promise<any>;
  updateUserPreferences: (preferences: Partial<UserPreference>) => Promise<boolean>;
}

// Stub functions for the adapters
export function useAccountingWithSync(): AccountingAdapter {
  return {
    isReady: true,
    isPending: false,
    loadAccountingData: async () => Promise.resolve({}),
    saveAccountingData: async () => Promise.resolve(true)
  };
}

export function useHRWithSync(): HRAdapter {
  return {
    isReady: true,
    isPending: false,
    loadHRData: async () => Promise.resolve({}),
    saveHRData: async () => Promise.resolve(true)
  };
}

export function useInventoryWithSync(): InventoryAdapter {
  return {
    isReady: true,
    isPending: false,
    loadInventoryData: async () => Promise.resolve({}),
    saveInventoryData: async () => Promise.resolve(true)
  };
}

export function useReportsWithSync(): ReportsAdapter {
  return {
    isReady: true,
    isPending: false,
    loadReportsData: async () => Promise.resolve({}),
    saveReportsData: async () => Promise.resolve(true)
  };
}

export function useSettingsWithSync(): SettingsAdapter {
  return {
    isReady: true,
    isPending: false,
    loadSettings: async () => Promise.resolve({}),
    updateUserPreferences: async () => Promise.resolve(true)
  };
}

export interface SyncStatusManager {
  showSyncing: (message?: string) => void;
  showSuccess: (message?: string) => void;
  showError: (message?: string) => void;
  clearStatus: () => void;
}

export function useSyncStatus(): SyncStatusManager {
  return {
    showSyncing: () => {},
    showSuccess: () => {},
    showError: () => {},
    clearStatus: () => {}
  };
}
