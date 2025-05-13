
/**
 * Types for sync functionality
 */

// Sync status types
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'success';

// Sync hook types
export interface UseSyncStatus {
  status: SyncStatus;
  message: string;
  showSyncing: (message?: string) => void;
  showSuccess: (message?: string) => void;
  showError: (message?: string) => void;
  showIdle: () => void;
}

// Storage adapter types with sync capabilities
export interface StorageAdapterWithSync<T> {
  syncStatus: SyncStatus;
  lastSynced: Date | null;
  load: () => Promise<T | null>;
  save: (data: T) => Promise<boolean>;
  sync: () => Promise<boolean>;
}

// Type for accounting adapter with sync
export interface AccountingAdapter extends StorageAdapterWithSync<any> {
  loadAccountingData: () => Promise<any>;
  saveAccountingData: (data: any) => Promise<boolean>;
  syncAccountingData: () => Promise<boolean>;
}

// Type for HR adapter with sync
export interface HRAdapter extends StorageAdapterWithSync<any> {
  loadHRData: () => Promise<any>;
  saveHRData: (data: any) => Promise<boolean>;
  syncHRData: () => Promise<boolean>;
}

// Type for inventory adapter with sync
export interface InventoryAdapter extends StorageAdapterWithSync<any> {
  loadInventoryData: () => Promise<any>;
  saveInventoryData: (data: any) => Promise<boolean>;
  syncInventoryData: () => Promise<boolean>;
}

// Type for reports adapter with sync
export interface ReportsAdapter extends StorageAdapterWithSync<any> {
  loadReportsData: () => Promise<any>;
  saveReportsData: (data: any) => Promise<boolean>;
  syncReportsData: () => Promise<boolean>;
}

// Type for settings adapter with sync
export interface SettingsAdapter extends StorageAdapterWithSync<any> {
  loadSettings: () => Promise<any>;
  saveSettings: (data: any) => Promise<boolean>;
  syncSettings: () => Promise<boolean>;
  updateUserPreferences: (preferences: Partial<import('./settings').UserPreference>) => Promise<boolean>;
}

// Hook factories
export function useAccountingWithSync(): AccountingAdapter;
export function useHRWithSync(): HRAdapter;
export function useInventoryWithSync(): InventoryAdapter;
export function useReportsWithSync(): ReportsAdapter;
export function useSettingsWithSync(): SettingsAdapter;
export function useSyncStatus(): UseSyncStatus;
