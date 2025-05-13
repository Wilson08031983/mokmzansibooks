
/**
 * Type definitions for synchronization and storage adapters
 */

export interface SyncCallbacks {
  onSyncStart?: (message?: string) => void;
  onSyncSuccess?: (message?: string) => void;
  onSyncError?: (message?: string) => void;
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'success' | 'error';
  message: string;
  timestamp: number;
}

export interface SyncContextType {
  syncStatus: SyncStatus;
  showSyncing: (message?: string) => void;
  showSuccess: (message?: string) => void;
  showError: (message?: string) => void;
  resetStatus: () => void;
}

// Adapter interface types
export interface StorageAdapter<T> {
  load: (callbacks?: SyncCallbacks) => Promise<T>;
  save: (data: T, callbacks?: SyncCallbacks) => Promise<boolean>;
}

// Type declarations for the specific hooks
export interface AccountingWithSync extends StorageAdapter<any> {
  addAccount: (account: any, callbacks?: SyncCallbacks) => Promise<boolean>;
  updateAccount: (account: any, callbacks?: SyncCallbacks) => Promise<boolean>;
  addTransaction: (transaction: any, callbacks?: SyncCallbacks) => Promise<boolean>;
  updateTransaction: (transaction: any, callbacks?: SyncCallbacks) => Promise<boolean>;
}

export interface HRWithSync extends StorageAdapter<any> {
  addEmployee: (employee: any, callbacks?: SyncCallbacks) => Promise<boolean>;
  updateEmployee: (employee: any, callbacks?: SyncCallbacks) => Promise<boolean>;
  addLeaveRequest: (request: any, callbacks?: SyncCallbacks) => Promise<boolean>;
  addPayrollRecord: (record: any, callbacks?: SyncCallbacks) => Promise<boolean>;
}

export interface InventoryWithSync extends StorageAdapter<any> {
  addItem: (item: any, callbacks?: SyncCallbacks) => Promise<boolean>;
  updateItem: (item: any, callbacks?: SyncCallbacks) => Promise<boolean>;
  recordTransaction: (transaction: any, callbacks?: SyncCallbacks) => Promise<boolean>;
}

export interface ReportsWithSync extends StorageAdapter<any> {
  saveReport: (report: any, callbacks?: SyncCallbacks) => Promise<boolean>;
  saveDashboard: (dashboard: any, callbacks?: SyncCallbacks) => Promise<boolean>;
}

export interface SettingsWithSync extends StorageAdapter<any> {
  updateUserPreferences: (prefs: any, callbacks?: SyncCallbacks) => Promise<boolean>;
  updateAppSettings: (settings: any, callbacks?: SyncCallbacks) => Promise<boolean>;
  reset: (callbacks?: SyncCallbacks) => Promise<boolean>;
}

export interface MigrationResult {
  success: boolean;
  result?: any;
  error?: string;
}
