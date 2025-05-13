
/**
 * Type definitions for synchronization
 */

export interface SyncStatus {
  lastSynced: string | null;
  inProgress: boolean;
  error: Error | null;
  syncQueue: string[];
}

export interface GlobalAppState {
  companyDetails: CompanyDetails | null;
  clients: Client[];
  settings: AppSettings;
  userPreferences: UserPreference;
  syncStatus: SyncStatus;
}

// Sync hook interfaces
export interface AccountingSyncData {}
export interface HRSyncData {}
export interface InventorySyncData {}
export interface ReportsSyncData {}
export interface SettingsSyncData {}

// Declare sync hook types
export function useAccountingWithSync(): { data: AccountingSyncData, sync: () => Promise<boolean> };
export function useHRWithSync(): { data: HRSyncData, sync: () => Promise<boolean> };
export function useInventoryWithSync(): { data: InventorySyncData, sync: () => Promise<boolean> };
export function useReportsWithSync(): { data: ReportsSyncData, sync: () => Promise<boolean> };
export function useSettingsWithSync(): { data: SettingsSyncData, sync: () => Promise<boolean> };
export function useSyncStatus(): SyncStatus;

// Storage adapter initialization
export function initializeAllStorageAdapters(): Promise<void>;
export function loadCompanyDetails(): Promise<CompanyDetails | null>;
export function loadClients(): Promise<Client[]>;
export function saveCompanyDetails(data: CompanyDetails): Promise<boolean>;
export function saveClients(clients: Client[]): Promise<boolean>;
