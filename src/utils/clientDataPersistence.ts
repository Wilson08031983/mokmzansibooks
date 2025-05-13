
/**
 * Client data persistence utilities
 * Ensures robust client data management with backup and recovery mechanisms
 */

import { Client, ClientsState } from "@/types/client";

// Safe storage keys
const CLIENT_DATA_KEY = 'mok_mzansi_client_data';
const CLIENT_DATA_BACKUP_KEY = 'mok_mzansi_client_data_backup';

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
    const clientData = localStorage.getItem(CLIENT_DATA_KEY);
    if (!clientData) return false;
    
    // Validate data before backup
    try {
      JSON.parse(clientData);
    } catch {
      console.error('Invalid client data found, not backing up');
      return false;
    }
    
    // Store the backup
    localStorage.setItem(CLIENT_DATA_BACKUP_KEY, clientData);
    
    // Also store to sessionStorage as another layer of protection
    sessionStorage.setItem(CLIENT_DATA_BACKUP_KEY, clientData);
    
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
    let backup = localStorage.getItem(CLIENT_DATA_BACKUP_KEY);
    
    // If not found, try sessionStorage
    if (!backup) {
      backup = sessionStorage.getItem(CLIENT_DATA_BACKUP_KEY);
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
    localStorage.setItem(CLIENT_DATA_KEY, backup);
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
    const clientData = localStorage.getItem(CLIENT_DATA_KEY);
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
    localStorage.setItem(CLIENT_DATA_KEY, JSON.stringify(data));
    createClientDataBackup();
    return true;
  } catch (error) {
    console.error('Error setting client data safely:', error);
    return false;
  }
}

// For backward compatibility
export const saveClientData = setSafeClientData;

// Export the ClientsState type
export { ClientsState };

// Client operations
export function addClient(client: Client, clientsData: ClientsState): ClientsState {
  const newState = { ...clientsData };
  
  if (client.type === 'company') {
    newState.companies = [...newState.companies, client];
  } else if (client.type === 'individual') {
    newState.individuals = [...newState.individuals, client];
  } else if (client.type === 'vendor') {
    newState.vendors = [...newState.vendors, client];
  }
  
  return newState;
}

export function updateClient(id: string, updatedClient: Client, clientsData: ClientsState): ClientsState {
  const newState = { ...clientsData };
  
  if (updatedClient.type === 'company') {
    newState.companies = newState.companies.map(client => 
      client.id === id ? updatedClient : client
    );
  } else if (updatedClient.type === 'individual') {
    newState.individuals = newState.individuals.map(client => 
      client.id === id ? updatedClient : client
    );
  } else if (updatedClient.type === 'vendor') {
    newState.vendors = newState.vendors.map(client => 
      client.id === id ? updatedClient : client
    );
  }
  
  return newState;
}

export function deleteClient(id: string, clientsData: ClientsState): ClientsState {
  return {
    companies: clientsData.companies.filter(client => client.id !== id),
    individuals: clientsData.individuals.filter(client => client.id !== id),
    vendors: clientsData.vendors.filter(client => client.id !== id)
  };
}
