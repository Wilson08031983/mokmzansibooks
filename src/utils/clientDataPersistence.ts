
/**
 * Utility functions for client data persistence
 * Ensures client data is preserved even after logout
 */

import { Client, CompanyClient, IndividualClient, VendorClient } from '@/types/client';

// Storage keys for better organization
const STORAGE_KEYS = {
  CLIENTS: 'clients',
  CLIENTS_BACKUP: 'clients_backup',
  MOK_CLIENTS: 'mokClients',
  MOK_MZANSI_CLIENTS: 'mok-mzansi-books-clients',
  LEGACY_CLIENTS: 'savedClients',
  SESSION_CLIENTS: 'session_clients_backup'
};

// Default client state structure
export interface ClientsState {
  companies: CompanyClient[];
  individuals: IndividualClient[];
  vendors: VendorClient[];
}

export const defaultClientsState: ClientsState = {
  companies: [],
  individuals: [],
  vendors: []
};

/**
 * Get client data from storage with multiple fallbacks
 */
export const getSafeClientData = (): ClientsState => {
  try {
    // Try multiple storage keys in order of preference
    for (const key of [
      STORAGE_KEYS.CLIENTS,
      STORAGE_KEYS.MOK_CLIENTS,
      STORAGE_KEYS.MOK_MZANSI_CLIENTS, 
      STORAGE_KEYS.CLIENTS_BACKUP,
      STORAGE_KEYS.LEGACY_CLIENTS
    ]) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          
          // Handle both formats: object with categories or flat array
          if (parsed) {
            // If it's already in the right format with companies, individuals, vendors
            if (parsed.companies || parsed.individuals || parsed.vendors) {
              return {
                companies: Array.isArray(parsed.companies) ? parsed.companies : [],
                individuals: Array.isArray(parsed.individuals) ? parsed.individuals : [],
                vendors: Array.isArray(parsed.vendors) ? parsed.vendors : []
              };
            } 
            // If it's a flat array of clients, categorize them
            else if (Array.isArray(parsed)) {
              const result: ClientsState = {
                companies: [],
                individuals: [],
                vendors: []
              };
              
              parsed.forEach(client => {
                if (client.type === 'company') {
                  result.companies.push(client as CompanyClient);
                } else if (client.type === 'individual') {
                  result.individuals.push(client as IndividualClient);
                } else if (client.type === 'vendor') {
                  result.vendors.push(client as VendorClient);
                }
              });
              
              return result;
            }
          }
        }
      } catch (error) {
        console.warn(`Error parsing client data from key ${key}:`, error);
        // Continue to next key
      }
    }
    
    // Try sessionStorage as last resort
    try {
      const sessionData = sessionStorage.getItem(STORAGE_KEYS.SESSION_CLIENTS);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (parsed && (parsed.companies || parsed.individuals || parsed.vendors)) {
          return {
            companies: Array.isArray(parsed.companies) ? parsed.companies : [],
            individuals: Array.isArray(parsed.individuals) ? parsed.individuals : [],
            vendors: Array.isArray(parsed.vendors) ? parsed.vendors : []
          };
        }
      }
    } catch (error) {
      console.warn('Error parsing client data from session storage:', error);
    }
    
    return defaultClientsState;
  } catch (error) {
    console.error('Error in getSafeClientData:', error);
    return defaultClientsState;
  }
};

/**
 * Save client data with redundancy
 */
export const saveClientData = (data: ClientsState): boolean => {
  try {
    const stringifiedData = JSON.stringify(data);
    
    // Save to multiple locations for redundancy
    localStorage.setItem(STORAGE_KEYS.CLIENTS, stringifiedData);
    localStorage.setItem(STORAGE_KEYS.MOK_CLIENTS, stringifiedData);
    localStorage.setItem(STORAGE_KEYS.MOK_MZANSI_CLIENTS, stringifiedData);
    localStorage.setItem(STORAGE_KEYS.CLIENTS_BACKUP, stringifiedData);
    
    // Also store in session storage for immediate restore after logout
    sessionStorage.setItem(STORAGE_KEYS.SESSION_CLIENTS, stringifiedData);
    
    console.log('Client data saved with redundancy');
    return true;
  } catch (error) {
    console.error('Error saving client data:', error);
    return false;
  }
};

/**
 * Create a backup of client data - should be called before logout
 */
export const createClientDataBackup = (): void => {
  try {
    // Get all client data from any available source
    const data = getSafeClientData();
    
    // Create timestamp for versioned backup
    const timestamp = new Date().toISOString();
    
    // Store in localStorage with timestamp
    localStorage.setItem(`client_backup_${timestamp}`, JSON.stringify(data));
    
    // Store in sessionStorage which persists across page reloads but not logout
    sessionStorage.setItem(STORAGE_KEYS.SESSION_CLIENTS, JSON.stringify(data));
    
    console.log('Client data backup created successfully');
  } catch (error) {
    console.error('Error creating client data backup:', error);
  }
};

/**
 * Restore client data from backup
 * @returns boolean indicating if restore was successful
 */
export const restoreClientDataFromBackup = (): boolean => {
  try {
    // Try sessionStorage backup first
    let backup = sessionStorage.getItem(STORAGE_KEYS.SESSION_CLIENTS);
    
    // If not found, try most recent localStorage backup
    if (!backup) {
      // Look for backups with the pattern client_backup_*
      const backupKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('client_backup_')
      ).sort().reverse(); // Most recent first
      
      if (backupKeys.length > 0) {
        backup = localStorage.getItem(backupKeys[0]);
      }
    }
    
    // If still not found, try regular backup
    if (!backup) {
      backup = localStorage.getItem(STORAGE_KEYS.CLIENTS_BACKUP);
    }
    
    if (!backup) return false;
    
    try {
      const parsed = JSON.parse(backup);
      
      // Check if data has the expected structure
      if (parsed && (Array.isArray(parsed.companies) || Array.isArray(parsed.individuals) || Array.isArray(parsed.vendors))) {
        // Save to all storage locations
        localStorage.setItem(STORAGE_KEYS.CLIENTS, backup);
        localStorage.setItem(STORAGE_KEYS.MOK_CLIENTS, backup);
        localStorage.setItem(STORAGE_KEYS.MOK_MZANSI_CLIENTS, backup);
        console.log('Client data restored successfully from backup');
        return true;
      }
    } catch (e) {
      console.error('Invalid backup data format:', e);
    }
    
    return false;
  } catch (error) {
    console.error('Error restoring client data from backup:', error);
    return false;
  }
};

/**
 * Check if any client data exists in storage
 */
export const hasAnyClientData = (): boolean => {
  // Check for any client data
  const clients = getSafeClientData();
  return clients.companies.length > 0 || 
         clients.individuals.length > 0 || 
         clients.vendors.length > 0;
};

/**
 * Convert client data to flat array if needed
 */
export const clientStateToArray = (clientState: ClientsState): Client[] => {
  return [
    ...clientState.companies,
    ...clientState.individuals,
    ...clientState.vendors
  ];
};

/**
 * Export data storage adapter for components to use
 */
export const clientStorageAdapter = {
  getClients: getSafeClientData,
  saveClients: saveClientData,
  createBackup: createClientDataBackup,
  restoreFromBackup: restoreClientDataFromBackup,
  hasData: hasAnyClientData,
  toArray: clientStateToArray
};
