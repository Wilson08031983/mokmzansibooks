
/**
 * Utilities for persisting client data
 */

import { ClientsState } from "@/types/client";

// Default state for clients
export const defaultClientsState: ClientsState = {
  companies: [],
  individuals: [],
  vendors: []
};

// Storage keys for client data
const CLIENT_DATA_PRIMARY_KEY = 'mok-mzansi-books-clients';
const CLIENT_DATA_BACKUP_KEYS = ['mokClients', 'clients'];

/**
 * Get client data with fallbacks for different storage keys
 * @returns The client data or default state
 */
export const getSafeClientData = (): ClientsState => {
  try {
    // Try primary storage key first
    const clientDataStr = localStorage.getItem(CLIENT_DATA_PRIMARY_KEY);
    if (clientDataStr) {
      const parsedData = JSON.parse(clientDataStr);
      if (isValidClientData(parsedData)) {
        return parsedData;
      }
    }
    
    // Try backup keys if primary fails
    for (const key of CLIENT_DATA_BACKUP_KEYS) {
      try {
        const backupDataStr = localStorage.getItem(key);
        if (backupDataStr) {
          const parsedData = JSON.parse(backupDataStr);
          if (isValidClientData(parsedData)) {
            // Save to primary key for future use
            setSafeClientData(parsedData);
            return parsedData;
          }
        }
      } catch (e) {
        console.warn(`Error parsing backup client data from ${key}:`, e);
      }
    }
    
    return { ...defaultClientsState };
  } catch (error) {
    console.error('Error getting client data:', error);
    return { ...defaultClientsState };
  }
};

/**
 * Save client data with redundancy
 * @param clientsState The client data to save
 */
export const setSafeClientData = (clientsState: ClientsState): void => {
  try {
    const clientDataStr = JSON.stringify(clientsState);
    
    // Save to primary key
    localStorage.setItem(CLIENT_DATA_PRIMARY_KEY, clientDataStr);
    
    // Also save to backup keys
    for (const key of CLIENT_DATA_BACKUP_KEYS) {
      try {
        localStorage.setItem(key, clientDataStr);
      } catch (e) {
        console.warn(`Error saving backup client data to ${key}:`, e);
      }
    }
  } catch (error) {
    console.error('Error saving client data:', error);
  }
};

/**
 * Validate client data structure
 * @param data The data to validate
 * @returns True if the data is valid
 */
const isValidClientData = (data: any): boolean => {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.companies) &&
    Array.isArray(data.individuals) &&
    Array.isArray(data.vendors)
  );
};

// Export adapter for backward compatibility
export const clientStorageAdapter = {
  getClientData: getSafeClientData,
  saveClientData: setSafeClientData,
  
  restoreClientDataFromBackup: (): boolean => {
    try {
      // Try backup keys
      for (const key of CLIENT_DATA_BACKUP_KEYS) {
        try {
          const backupDataStr = localStorage.getItem(key);
          if (backupDataStr) {
            const parsedData = JSON.parse(backupDataStr);
            if (isValidClientData(parsedData)) {
              // Save to primary key
              setSafeClientData(parsedData);
              return true;
            }
          }
        } catch (e) {
          console.warn(`Error restoring client data from ${key}:`, e);
        }
      }
      return false;
    } catch (error) {
      console.error('Error restoring client data:', error);
      return false;
    }
  }
};
