/**
 * Client context storage integration with PermanentStorage
 * Ensures client data is never lost between sessions
 */

import permanentStorage, { StorageNamespace } from './permanentStorage';
import { ClientsState, Client } from '@/types/client';

// Default clients state
export const defaultClientsState: ClientsState = {
  companies: [],
  individuals: [],
  vendors: []
};

/**
 * Get clients data with multi-layer fallback system
 */
export const getClientsData = async (): Promise<ClientsState> => {
  try {
    // Initialize permanent storage if needed
    if (!permanentStorage.isReady()) {
      await permanentStorage.waitUntilReady(2000);
    }
    
    // Try to get from permanent storage
    const storedData = await permanentStorage.loadData<ClientsState>(StorageNamespace.CLIENTS);
    
    if (storedData && (
      storedData.companies?.length > 0 || 
      storedData.individuals?.length > 0 || 
      storedData.vendors?.length > 0
    )) {
      console.log('Client data loaded from permanent storage:', {
        companies: storedData.companies?.length || 0,
        individuals: storedData.individuals?.length || 0,
        vendors: storedData.vendors?.length || 0
      });
      return storedData;
    }
    
    // Try legacy storage keys in order
    const legacyKeys = [
      'mok-mzansi-books-clients',
      'mok-mzansi-books-clients-persistent', 
      'mok-mzansi-books-clients-alt1',
      'mok-mzansi-books-clients-alt2',
      'mok-mzansi-books-clients-backup',
      'clients'
    ];
    
    for (const key of legacyKeys) {
      try {
        const legacyData = localStorage.getItem(key);
        if (legacyData) {
          const parsedData = JSON.parse(legacyData) as ClientsState;
          if (parsedData && (
            parsedData.companies?.length > 0 || 
            parsedData.individuals?.length > 0 || 
            parsedData.vendors?.length > 0
          )) {
            console.log(`Client data loaded from legacy storage (${key}):`, {
              companies: parsedData.companies?.length || 0,
              individuals: parsedData.individuals?.length || 0,
              vendors: parsedData.vendors?.length || 0
            });
            
            // Normalize data structure if needed
            const normalizedData: ClientsState = {
              companies: Array.isArray(parsedData.companies) ? parsedData.companies : [],
              individuals: Array.isArray(parsedData.individuals) ? parsedData.individuals : [],
              vendors: Array.isArray(parsedData.vendors) ? parsedData.vendors : []
            };
            
            // Save to permanent storage for next time
            permanentStorage.saveData(StorageNamespace.CLIENTS, normalizedData);
            
            return normalizedData;
          }
        }
      } catch (error) {
        console.warn(`Error loading legacy client data from ${key}:`, error);
      }
    }
    
    // Return default if nothing found
    return defaultClientsState;
  } catch (error) {
    console.error('Error getting client data:', error);
    return defaultClientsState;
  }
};

/**
 * Save clients data with guaranteed persistence
 */
export const saveClientsData = async (clientsData: ClientsState): Promise<boolean> => {
  try {
    // Initialize permanent storage if needed
    if (!permanentStorage.isReady()) {
      await permanentStorage.waitUntilReady(2000);
    }
    
    // Ensure data is properly structured
    const normalizedData: ClientsState = {
      companies: Array.isArray(clientsData.companies) ? clientsData.companies : [],
      individuals: Array.isArray(clientsData.individuals) ? clientsData.individuals : [],
      vendors: Array.isArray(clientsData.vendors) ? clientsData.vendors : []
    };
    
    // Legacy format save - to maintain compatibility
    localStorage.setItem('mok-mzansi-books-clients', JSON.stringify(normalizedData));
    localStorage.setItem('mok-mzansi-books-clients-persistent', JSON.stringify(normalizedData));
    
    // Save to our bombproof storage system
    const result = await permanentStorage.saveData(StorageNamespace.CLIENTS, normalizedData);
    
    if (result) {
      console.log('Client data saved to permanent storage:', {
        companies: normalizedData.companies.length,
        individuals: normalizedData.individuals.length,
        vendors: normalizedData.vendors.length
      });
    } else {
      console.error('Failed to save client data to permanent storage');
    }
    
    return result;
  } catch (error) {
    console.error('Error saving client data:', error);
    
    // Legacy emergency backup - if new system fails
    try {
      localStorage.setItem('mok-mzansi-books-clients-emergency-backup', JSON.stringify(clientsData));
    } catch {}
    
    return false;
  }
};

/**
 * Add a new client to the appropriate category
 */
export const addClient = async (
  client: Client, 
  clientType: 'company' | 'individual' | 'vendor'
): Promise<boolean> => {
  try {
    // Get current clients data
    const clientsData = await getClientsData();
    
    // Add client to appropriate category
    switch (clientType) {
      case 'company':
        clientsData.companies.push(client);
        break;
      case 'individual':
        clientsData.individuals.push(client);
        break;
      case 'vendor':
        clientsData.vendors.push(client);
        break;
    }
    
    // Save updated data
    return await saveClientsData(clientsData);
  } catch (error) {
    console.error('Error adding client:', error);
    return false;
  }
};

/**
 * Update an existing client
 */
export const updateClient = async (
  updatedClient: Client,
  clientType: 'company' | 'individual' | 'vendor'
): Promise<boolean> => {
  try {
    // Get current clients data
    const clientsData = await getClientsData();
    
    // Update client in appropriate category
    switch (clientType) {
      case 'company':
        clientsData.companies = clientsData.companies.map(client => 
          client.id === updatedClient.id ? updatedClient : client
        );
        break;
      case 'individual':
        clientsData.individuals = clientsData.individuals.map(client => 
          client.id === updatedClient.id ? updatedClient : client
        );
        break;
      case 'vendor':
        clientsData.vendors = clientsData.vendors.map(client => 
          client.id === updatedClient.id ? updatedClient : client
        );
        break;
    }
    
    // Save updated data
    return await saveClientsData(clientsData);
  } catch (error) {
    console.error('Error updating client:', error);
    return false;
  }
};

/**
 * Delete a client
 */
export const deleteClient = async (
  clientId: string,
  clientType: 'company' | 'individual' | 'vendor'
): Promise<boolean> => {
  try {
    // Get current clients data
    const clientsData = await getClientsData();
    
    // Delete client from appropriate category
    switch (clientType) {
      case 'company':
        clientsData.companies = clientsData.companies.filter(client => client.id !== clientId);
        break;
      case 'individual':
        clientsData.individuals = clientsData.individuals.filter(client => client.id !== clientId);
        break;
      case 'vendor':
        clientsData.vendors = clientsData.vendors.filter(client => client.id !== clientId);
        break;
    }
    
    // Save updated data
    return await saveClientsData(clientsData);
  } catch (error) {
    console.error('Error deleting client:', error);
    return false;
  }
};

/**
 * Check if there are any clients saved
 */
export const hasClients = async (): Promise<boolean> => {
  try {
    // Initialize permanent storage if needed
    if (!permanentStorage.isReady()) {
      await permanentStorage.waitUntilReady(2000);
    }
    
    // Check permanent storage
    const storedData = await permanentStorage.loadData<ClientsState>(StorageNamespace.CLIENTS);
    if (storedData && (
      storedData.companies?.length > 0 || 
      storedData.individuals?.length > 0 || 
      storedData.vendors?.length > 0
    )) {
      return true;
    }
    
    // Check legacy storage
    const legacyData = localStorage.getItem('mok-mzansi-books-clients');
    if (legacyData) {
      try {
        const parsedData = JSON.parse(legacyData) as ClientsState;
        return !!(parsedData && (
          parsedData.companies?.length > 0 || 
          parsedData.individuals?.length > 0 || 
          parsedData.vendors?.length > 0
        ));
      } catch {}
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if clients exist:', error);
    return false;
  }
};
