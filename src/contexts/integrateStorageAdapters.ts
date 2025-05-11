/**
 * Storage Adapter Integration Module
 * 
 * This module provides integration points for all the super persistent storage adapters
 * to ensure data is never lost across all sections of the application.
 */

import { syncAccountingAdapter } from '../utils/accountingStorageAdapter';
import { syncHRAdapter } from '../utils/hrStorageAdapter';
import { syncInventoryAdapter } from '../utils/inventoryStorageAdapter';
import { syncReportsAdapter } from '../utils/reportsStorageAdapter';
import { syncSettingsAdapter } from '../utils/settingsStorageAdapter';
import { SyncStatus } from '../components/shared/SyncIndicator';
import { useSyncStatus } from './SyncContext';

// Function to set up global callbacks for the sync context
export const setupSyncCallbacks = (syncContext: any) => {
  if (!syncContext) return;
  
  const { showSyncing, showSuccess, showError } = syncContext;
  
  return {
    onSyncStart: (message?: string) => showSyncing(message || 'Saving data...'),
    onSyncSuccess: (message?: string) => showSuccess(message || 'Data saved successfully'),
    onSyncError: (message?: string) => showError(message || 'Error saving data')
  };
};

// Function to initialize all persistence adapters
export const initializeAllStorageAdapters = async () => {
  console.log('Initializing all storage adapters for data persistence...');
  
  try {
    // Preload all data to ensure it's cached in memory and IndexedDB
    const adapters = [
      { name: 'Accounting', load: () => syncAccountingAdapter.load() },
      { name: 'HR', load: () => syncHRAdapter.load() },
      { name: 'Inventory', load: () => syncInventoryAdapter.load() },
      { name: 'Reports', load: () => syncReportsAdapter.load() },
      { name: 'Settings', load: () => syncSettingsAdapter.load() }
    ];
    
    // Load all adapters in parallel
    const results = await Promise.allSettled(
      adapters.map(adapter => adapter.load().catch(error => {
        console.error(`Error initializing ${adapter.name} adapter:`, error);
        return null;
      }))
    );
    
    // Log results
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    console.log(`Successfully initialized ${successCount} of ${adapters.length} storage adapters`);
    
    return successCount === adapters.length;
  } catch (error) {
    console.error('Error during storage adapters initialization:', error);
    return false;
  }
};

// Helper hook for accounting with sync status
export const useAccountingWithSync = () => {
  const syncContext = useSyncStatus();
  const callbacks = setupSyncCallbacks(syncContext);
  
  return {
    loadAccountingData: () => syncAccountingAdapter.load(callbacks),
    saveAccountingData: (data: any) => syncAccountingAdapter.save(data, callbacks),
    addAccount: (account: any) => syncAccountingAdapter.addAccount(account, callbacks),
    updateAccount: (account: any) => syncAccountingAdapter.updateAccount(account, callbacks),
    addTransaction: (transaction: any) => syncAccountingAdapter.addTransaction(transaction, callbacks),
    updateTransaction: (transaction: any) => syncAccountingAdapter.updateTransaction(transaction, callbacks)
  };
};

// Helper hook for HR with sync status
export const useHRWithSync = () => {
  const syncContext = useSyncStatus();
  const callbacks = setupSyncCallbacks(syncContext);
  
  return {
    loadHRData: () => syncHRAdapter.load(callbacks),
    saveHRData: (data: any) => syncHRAdapter.save(data, callbacks),
    addEmployee: (employee: any) => syncHRAdapter.addEmployee(employee, callbacks),
    updateEmployee: (employee: any) => syncHRAdapter.updateEmployee(employee, callbacks),
    addLeaveRequest: (request: any) => syncHRAdapter.addLeaveRequest(request, callbacks),
    addPayrollRecord: (record: any) => syncHRAdapter.addPayrollRecord(record, callbacks)
  };
};

// Helper hook for inventory with sync status
export const useInventoryWithSync = () => {
  const syncContext = useSyncStatus();
  const callbacks = setupSyncCallbacks(syncContext);
  
  return {
    loadInventoryData: () => syncInventoryAdapter.load(callbacks),
    saveInventoryData: (data: any) => syncInventoryAdapter.save(data, callbacks),
    addItem: (item: any) => syncInventoryAdapter.addItem(item, callbacks),
    updateItem: (item: any) => syncInventoryAdapter.updateItem(item, callbacks),
    recordTransaction: (transaction: any) => syncInventoryAdapter.recordTransaction(transaction, callbacks)
  };
};

// Helper hook for reports with sync status
export const useReportsWithSync = () => {
  const syncContext = useSyncStatus();
  const callbacks = setupSyncCallbacks(syncContext);
  
  return {
    loadReportsData: () => syncReportsAdapter.load(callbacks),
    saveReportsData: (data: any) => syncReportsAdapter.save(data, callbacks),
    saveReport: (report: any) => syncReportsAdapter.saveReport(report, callbacks),
    saveDashboard: (dashboard: any) => syncReportsAdapter.saveDashboard(dashboard, callbacks)
  };
};

// Helper hook for settings with sync status
export const useSettingsWithSync = () => {
  const syncContext = useSyncStatus();
  const callbacks = setupSyncCallbacks(syncContext);
  
  return {
    loadSettings: () => syncSettingsAdapter.load(callbacks),
    saveSettings: (data: any) => syncSettingsAdapter.save(data, callbacks),
    updateUserPreferences: (prefs: any) => syncSettingsAdapter.updateUserPreferences(prefs, callbacks),
    updateAppSettings: (settings: any) => syncSettingsAdapter.updateAppSettings(settings, callbacks),
    resetSettings: () => syncSettingsAdapter.reset(callbacks)
  };
};
