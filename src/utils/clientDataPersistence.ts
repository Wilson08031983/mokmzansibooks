
import { ClientsState } from '@/types/client';

// Default empty state
const DEFAULT_CLIENTS_STATE: ClientsState = {
  companies: [],
  individuals: [],
  vendors: []
};

// Storage keys
const CLIENT_DATA_KEY = 'CLIENT_DATA';
const CLIENT_DATA_BACKUP_KEY = 'CLIENT_DATA_BACKUP';

/**
 * Get client data safely with fallbacks
 */
export const getSafeClientData = (): ClientsState => {
  try {
    const storedData = localStorage.getItem(CLIENT_DATA_KEY);
    if (!storedData) {
      return DEFAULT_CLIENTS_STATE;
    }
    
    const parsedData = JSON.parse(storedData);
    return parsedData || DEFAULT_CLIENTS_STATE;
  } catch (error) {
    console.error('Error retrieving client data:', error);
    
    // Try to recover from backup
    try {
      const backupData = localStorage.getItem(CLIENT_DATA_BACKUP_KEY);
      if (backupData) {
        return JSON.parse(backupData);
      }
    } catch (e) {
      console.error('Error retrieving backup client data:', e);
    }
    
    return DEFAULT_CLIENTS_STATE;
  }
};

/**
 * Save client data with backup
 */
export const setSafeClientData = (clientsData: ClientsState): boolean => {
  try {
    // First, create a backup of existing data
    const existingData = localStorage.getItem(CLIENT_DATA_KEY);
    if (existingData) {
      localStorage.setItem(CLIENT_DATA_BACKUP_KEY, existingData);
    }
    
    // Then save the new data
    localStorage.setItem(CLIENT_DATA_KEY, JSON.stringify(clientsData));
    return true;
  } catch (error) {
    console.error('Error saving client data:', error);
    return false;
  }
};

/**
 * Create a backup of client data
 */
export const createClientDataBackup = (): boolean => {
  try {
    const currentData = localStorage.getItem(CLIENT_DATA_KEY);
    if (!currentData) {
      return false;
    }
    
    localStorage.setItem(CLIENT_DATA_BACKUP_KEY, currentData);
    
    // Create a timestamped backup
    const timestamp = new Date().toISOString();
    localStorage.setItem(`CLIENT_DATA_BACKUP_${timestamp}`, currentData);
    
    return true;
  } catch (error) {
    console.error('Error creating client data backup:', error);
    return false;
  }
};

/**
 * Restore client data from backup
 */
export const restoreClientDataFromBackup = (): boolean => {
  try {
    const backupData = localStorage.getItem(CLIENT_DATA_BACKUP_KEY);
    if (!backupData) {
      return false;
    }
    
    localStorage.setItem(CLIENT_DATA_KEY, backupData);
    return true;
  } catch (error) {
    console.error('Error restoring client data from backup:', error);
    return false;
  }
};

// Add aliases for backward compatibility
export const saveClientData = setSafeClientData;
export const loadClientData = getSafeClientData;
export { ClientsState };
