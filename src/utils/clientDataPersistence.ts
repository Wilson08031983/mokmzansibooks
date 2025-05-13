
/**
 * Client data persistence utilities
 * Ensures robust client data management with backup and recovery mechanisms
 */

import { ClientsState } from "@/types/client";

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
    });
    
    // Create an initial backup if we have data
    createClientDataBackup();
    console.log('Client data persistence initialized');
  } catch (error) {
    console.error('Error initializing client data persistence:', error);
  }
}

/**
 * Create a backup of the current client data
 * @returns boolean indicating if backup was successful
 */
export function createClientDataBackup(): boolean {
  try {
    const clientData = localStorage.getItem('mokClients');
    if (!clientData) return false;
    
    // Validate data before backup
    try {
      JSON.parse(clientData);
    } catch {
      console.error('Invalid client data found, not backing up');
      return false;
    }
    
    // Store the backup
    localStorage.setItem('mokClientsBackup', clientData);
    
    // Also store to sessionStorage as another layer of protection
    sessionStorage.setItem('mokClientsBackup', clientData);
    
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
    let backup = localStorage.getItem('mokClientsBackup');
    
    // If not found, try sessionStorage
    if (!backup) {
      backup = sessionStorage.getItem('mokClientsBackup');
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
    localStorage.setItem('mokClients', backup);
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
    const clientData = localStorage.getItem('mokClients');
    if (!clientData) return { companies: [], individuals: [], vendors: [] };
    
    const parsedData = JSON.parse(clientData) as ClientsState;
    return {
      companies: Array.isArray(parsedData.companies) ? parsedData.companies : [],
      individuals: Array.isArray(parsedData.individuals) ? parsedData.individuals : [],
      vendors: Array.isArray(parsedData.vendors) ? parsedData.vendors : []
    };
  } catch (error) {
    console.error('Error getting safe client data:', error);
    return { companies: [], individuals: [], vendors: [] };
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
    localStorage.setItem('mokClients', JSON.stringify(data));
    createClientDataBackup();
    return true;
  } catch (error) {
    console.error('Error setting client data safely:', error);
    return false;
  }
}
