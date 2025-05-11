/**
 * Client Storage Adapter
 * 
 * This adapter ensures client information is never lost by utilizing the
 * SuperPersistentStorage system with multiple redundant storage mechanisms.
 */

import superPersistentStorage, { DataCategory } from './superPersistentStorage';

import { Client, CompanyClient, IndividualClient, VendorClient, ClientsState } from '@/types/client';

// Compatibility interface for storage
export interface StorageClient {
  id: string;
  name: string;
  type: 'company' | 'individual' | 'vendor';
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  contactPerson?: string;
  vatNumber?: string;
  registrationNumber?: string;
  notes?: string;
  credit?: number;
  outstanding?: number;
  overdue?: number;
  lastInteraction?: string;
  dateAdded?: string;
  creditBalance?: number;
  status?: 'active' | 'inactive';
}

/**
 * Helper function to convert between storage format and app format
 */
const convertToAppClient = (storageClient: StorageClient): Client => {
  // Ensure required fields for app client types
  const baseClient = {
    id: storageClient.id,
    name: storageClient.name,
    email: storageClient.email || '',
    phone: storageClient.phone || '',
    address: storageClient.address || '',
    city: storageClient.city || '',
    province: storageClient.province || '',
    postalCode: storageClient.postalCode || '',
    credit: storageClient.credit || storageClient.creditBalance || 0,
    outstanding: storageClient.outstanding || 0,
    overdue: storageClient.overdue || 0,
    lastInteraction: storageClient.lastInteraction || new Date().toISOString()
  };
  
  // Create the appropriate client type
  if (storageClient.type === 'company') {
    return {
      ...baseClient,
      type: 'company',
      contactPerson: storageClient.contactPerson || ''
    } as CompanyClient;
  } else if (storageClient.type === 'vendor') {
    return {
      ...baseClient,
      type: 'vendor',
      contactPerson: storageClient.contactPerson || ''
    } as VendorClient;
  } else {
    return {
      ...baseClient,
      type: 'individual'
    } as IndividualClient;
  }
};

/**
 * Convert app client to storage format
 */
const convertToStorageClient = (client: Client): StorageClient => {
  return {
    id: client.id,
    name: client.name,
    type: client.type,
    email: client.email,
    phone: client.phone,
    address: client.address,
    city: client.city,
    province: client.province,
    postalCode: client.postalCode,
    contactPerson: client.type === 'company' || client.type === 'vendor' 
      ? (client as CompanyClient | VendorClient).contactPerson 
      : undefined,
    credit: client.credit,
    outstanding: client.outstanding,
    overdue: client.overdue,
    lastInteraction: client.lastInteraction,
    creditBalance: client.credit // For backward compatibility
  };
};

/**
 * Load all clients from storage with comprehensive fallback
 */
export const loadClients = async (): Promise<Client[]> => {
  try {
    console.log('ClientStorageAdapter: Loading clients...');
    
    // First try super persistent storage
    const data = await superPersistentStorage.load<StorageClient[]>(DataCategory.CLIENTS);
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log(`ClientStorageAdapter: Loaded ${data.length} clients from super persistent storage`);
      
      // Convert to app format
      const appClients = data.map(convertToAppClient);
      
      // Also restore to legacy storage for compatibility with existing code
      localStorage.setItem('clients', JSON.stringify(appClients));
      
      return appClients;
    }
    
    // If super persistent storage failed, try legacy storage
    try {
      // Try multiple possible legacy keys to catch all possible data
      const legacyKeys = ['clients', 'CLIENTS', 'savedClients', 'clientsData'];
      
      for (const key of legacyKeys) {
        const legacyData = localStorage.getItem(key);
        if (legacyData) {
          const parsedData = JSON.parse(legacyData);
          
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            console.log(`ClientStorageAdapter: Loaded ${parsedData.length} clients from legacy storage (${key})`);
            
            // Convert to app format if needed
            const appClients = parsedData.map((client: any) => {
              // Check if client already has the required format
              if (client.type && (client.credit !== undefined || client.creditBalance !== undefined)) {
                return convertToAppClient(client);
              }
              return client;
            });
            
            // Convert to storage format for persistence
            const storageClients = appClients.map(convertToStorageClient);
            
            // Migrate to super persistent storage for future use
            await superPersistentStorage.save(DataCategory.CLIENTS, storageClients);
            
            return appClients;
          }
        }
      }
    } catch (error) {
      console.error('ClientStorageAdapter: Error loading from legacy storage', error);
    }
    
    // If all else fails, return empty array
    console.log('ClientStorageAdapter: No clients found in any storage');
    return [];
  } catch (error) {
    console.error('ClientStorageAdapter: Error loading clients', error);
    return [];
  }
};

/**
 * Save clients with multi-layer persistence
 */
export const saveClients = async (clients: Client[]): Promise<boolean> => {
  try {
    if (!clients || !Array.isArray(clients)) {
      console.error('ClientStorageAdapter: Invalid clients data', clients);
      return false;
    }
    
    console.log(`ClientStorageAdapter: Saving ${clients.length} clients...`);
    
    // Convert to storage format
    const storageClients = clients.map(convertToStorageClient);
    
    // Save to super persistent storage
    const success = await superPersistentStorage.save(DataCategory.CLIENTS, storageClients);
    
    // Also save to legacy storage for compatibility
    localStorage.setItem('clients', JSON.stringify(clients));
    
    // Create additional backup in a different key
    localStorage.setItem('clients_backup', JSON.stringify(clients));
    
    if (success) {
      console.log('ClientStorageAdapter: Clients saved successfully');
    } else {
      console.warn('ClientStorageAdapter: Some storage mechanisms failed when saving clients');
    }
    
    return success;
  } catch (error) {
    console.error('ClientStorageAdapter: Error saving clients', error);
    
    // Fall back to legacy storage as last resort
    try {
      localStorage.setItem('clients_emergency_backup', JSON.stringify(clients));
    } catch (fallbackError) {
      console.error('ClientStorageAdapter: Even fallback storage failed', fallbackError);
    }
    
    return false;
  }
};

/**
 * Load clients data as structured ClientsState
 */
export const loadClientsState = async (): Promise<ClientsState> => {
  try {
    const clients = await loadClients();
    
    // Organize by client type
    const companies = clients.filter(c => c.type === 'company') as CompanyClient[];
    const individuals = clients.filter(c => c.type === 'individual') as IndividualClient[];
    const vendors = clients.filter(c => c.type === 'vendor') as VendorClient[];
    
    return {
      companies,
      individuals,
      vendors
    };
  } catch (error) {
    console.error('ClientStorageAdapter: Error loading client state', error);
    return {
      companies: [],
      individuals: [],
      vendors: []
    };
  }
};

/**
 * Save ClientsState to storage
 */
export const saveClientsState = async (clientsState: ClientsState): Promise<boolean> => {
  try {
    // Flatten all client types into a single array
    const allClients = [
      ...clientsState.companies,
      ...clientsState.individuals,
      ...clientsState.vendors
    ];
    
    // Save using our main saveClients function
    return saveClients(allClients);
  } catch (error) {
    console.error('ClientStorageAdapter: Error saving client state', error);
    return false;
  }
};

/**
 * Add a new client
 */
export const addClient = async (client: Client): Promise<boolean> => {
  try {
    // Load existing clients first
    const clients = await loadClients();
    
    // Add new client
    clients.push(client);
    
    // Save updated list
    return saveClients(clients);
  } catch (error) {
    console.error('ClientStorageAdapter: Error adding client', error);
    return false;
  }
};

/**
 * Update an existing client
 */
export const updateClient = async (updatedClient: Client): Promise<boolean> => {
  try {
    // Load existing clients
    const clients = await loadClients();
    
    // Find and update the client
    const index = clients.findIndex(c => c.id === updatedClient.id);
    
    if (index !== -1) {
      clients[index] = updatedClient;
      return saveClients(clients);
    } else {
      console.warn(`ClientStorageAdapter: Client with ID ${updatedClient.id} not found for update`);
      return false;
    }
  } catch (error) {
    console.error('ClientStorageAdapter: Error updating client', error);
    return false;
  }
};

/**
 * Delete a client by ID
 */
export const deleteClient = async (clientId: string): Promise<boolean> => {
  try {
    // Load existing clients
    const clients = await loadClients();
    
    // Filter out the client to delete
    const updatedClients = clients.filter(c => c.id !== clientId);
    
    // Only save if something was actually removed
    if (updatedClients.length < clients.length) {
      return saveClients(updatedClients);
    } else {
      console.warn(`ClientStorageAdapter: Client with ID ${clientId} not found for deletion`);
      return false;
    }
  } catch (error) {
    console.error('ClientStorageAdapter: Error deleting client', error);
    return false;
  }
};
