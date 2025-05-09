
/**
 * Client data persistence utilities
 * Ensures robust client data management with backup and recovery mechanisms
 */

import { Client, CompanyClient, IndividualClient, VendorClient, ClientsState } from "@/types/client";

// Storage key constants
const STORAGE_KEY = 'mokClients';
const BACKUP_KEY = 'mokClientsBackup';
const SESSION_BACKUP_KEY = 'mokClientsBackup';

// Default empty state
const defaultClientsState: ClientsState = {
  companies: [],
  individuals: [],
  vendors: []
};

/**
 * Initialize client data persistence mechanisms
 * This should be called early in the application lifecycle
 */
export function initializeClientDataPersistence(): void {
  try {
    // Set up an interval to periodically back up client data
    const backupInterval = setInterval(() => {
      createClientDataBackup();
    }, 5 * 60 * 1000); // Every 5 minutes
    
    // Clean up function
    window.addEventListener('beforeunload', () => {
      clearInterval(backupInterval);
      // Create a final backup before unloading
      createClientDataBackup();
    });
    
    // Create an initial backup if we have data
    createClientDataBackup();
    console.log('Client data persistence initialized');

    // Set up storage event listener to sync across tabs
    window.addEventListener('storage', (event) => {
      if (event.key === STORAGE_KEY && event.newValue) {
        try {
          // Re-create backup when main storage is updated from another tab
          const parsedData = JSON.parse(event.newValue);
          createBackupFromData(parsedData);
        } catch (error) {
          console.error('Error handling storage event:', error);
        }
      }
    });
  } catch (error) {
    console.error('Error initializing client data persistence:', error);
  }
}

/**
 * Create a backup directly from data object
 * @param data The client data to backup
 * @returns boolean indicating if backup was successful 
 */
export function createBackupFromData(data: ClientsState): boolean {
  try {
    localStorage.setItem(BACKUP_KEY, JSON.stringify(data));
    sessionStorage.setItem(SESSION_BACKUP_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error creating backup from data:', error);
    return false;
  }
}

/**
 * Create a backup of the current client data
 * @returns boolean indicating if backup was successful
 */
export function createClientDataBackup(): boolean {
  try {
    const clientData = localStorage.getItem(STORAGE_KEY);
    if (!clientData) return false;
    
    // Validate data before backup
    try {
      JSON.parse(clientData);
    } catch {
      console.error('Invalid client data found, not backing up');
      return false;
    }
    
    // Store the backup
    localStorage.setItem(BACKUP_KEY, clientData);
    
    // Also store to sessionStorage as another layer of protection
    sessionStorage.setItem(SESSION_BACKUP_KEY, clientData);
    
    return true;
  } catch (error) {
    console.error('Error creating client data backup:', error);
    return false;
  }
}

/**
 * Restore client data from backup
 * @returns boolean indicating if restore was successful
 */
export function restoreClientDataFromBackup(): boolean {
  try {
    // Try localStorage backup first
    let backup = localStorage.getItem(BACKUP_KEY);
    
    // If not found, try sessionStorage
    if (!backup) {
      backup = sessionStorage.getItem(SESSION_BACKUP_KEY);
    }
    
    if (!backup) return false;
    
    // Validate backup data
    try {
      JSON.parse(backup);
    } catch {
      console.error('Invalid backup data found');
      return false;
    }
    
    // Restore from backup
    localStorage.setItem(STORAGE_KEY, backup);
    return true;
  } catch (error) {
    console.error('Error restoring client data from backup:', error);
    return false;
  }
}

/**
 * Safe getter for client data
 * @returns Valid client data or empty default state
 */
export function getSafeClientData(): ClientsState {
  try {
    const clientData = localStorage.getItem(STORAGE_KEY);
    if (!clientData) return defaultClientsState;
    
    const parsedData = JSON.parse(clientData) as ClientsState;
    return {
      companies: Array.isArray(parsedData.companies) ? parsedData.companies : [],
      individuals: Array.isArray(parsedData.individuals) ? parsedData.individuals : [],
      vendors: Array.isArray(parsedData.vendors) ? parsedData.vendors : []
    };
  } catch (error) {
    console.error('Error getting safe client data:', error);
    return defaultClientsState;
  }
}

/**
 * Safe setter for client data
 * @param data The client data to save
 * @returns boolean indicating if save was successful
 */
export function setSafeClientData(data: ClientsState): boolean {
  try {
    // Validate data structure
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.companies) || !Array.isArray(data.individuals) || !Array.isArray(data.vendors)) {
      return false;
    }
    
    // Save data and create backup
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    createClientDataBackup();
    return true;
  } catch (error) {
    console.error('Error setting client data safely:', error);
    return false;
  }
}

/**
 * Initialize client data at app startup
 * This ensures client data is available after login/logout
 */
export function initializeClientData(): void {
  try {
    // First check if we already have client data
    const clientData = localStorage.getItem(STORAGE_KEY);
    if (clientData) {
      console.log('Client data already present in localStorage');
      return;
    }
    
    // Try to restore from backup
    const restored = restoreClientDataFromBackup();
    if (restored) {
      console.log('Client data restored from backup');
      return;
    }
    
    console.log('No client data or backup found');
  } catch (error) {
    console.error('Error initializing client data:', error);
  }
}
