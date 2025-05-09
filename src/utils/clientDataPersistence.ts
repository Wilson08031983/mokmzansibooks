
import { ClientsState } from "@/types/client";

// Storage key constants
const STORAGE_KEY = 'mokClients';
const BACKUP_KEY = 'mokClientsBackup';
const SESSION_BACKUP_KEY = 'mokClientsSessionBackup';

// Default empty state
const defaultState: ClientsState = {
  companies: [],
  individuals: [],
  vendors: []
};

/**
 * Initialize client data persistence
 */
export function initializeClientDataPersistence(): void {
  try {
    console.log('Initializing client data persistence system');
    
    // Check if client data exists
    if (!localStorage.getItem(STORAGE_KEY)) {
      console.log('No client data found, checking for backups');
      // Try to restore from backup
      if (!restoreClientDataFromBackup()) {
        console.log('No backups found, creating empty state');
        // Initialize with empty state
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultState));
      }
    } else {
      console.log('Client data found in localStorage');
      // Create backup of existing data
      createClientDataBackup();
    }
    
  } catch (error) {
    console.error('Error initializing client data persistence:', error);
  }
}

/**
 * Initialize client data from storage or backup
 */
export function initializeClientData(): void {
  try {
    // If no client data exists, try to restore from backup
    if (!localStorage.getItem(STORAGE_KEY)) {
      restoreClientDataFromBackup();
    }
  } catch (error) {
    console.error('Error initializing client data:', error);
  }
}

/**
 * Get client data safely
 */
export function getSafeClientData(): ClientsState {
  try {
    const clientData = localStorage.getItem(STORAGE_KEY);
    if (!clientData) return defaultState;
    
    const parsedData = JSON.parse(clientData) as ClientsState;
    return {
      companies: Array.isArray(parsedData.companies) ? parsedData.companies : [],
      individuals: Array.isArray(parsedData.individuals) ? parsedData.individuals : [],
      vendors: Array.isArray(parsedData.vendors) ? parsedData.vendors : []
    };
  } catch (error) {
    console.error('Error getting safe client data:', error);
    return defaultState;
  }
}

/**
 * Create a backup of client data
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
