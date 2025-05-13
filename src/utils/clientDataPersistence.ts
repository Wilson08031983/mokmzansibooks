
/**
 * Client Data Persistence Utilities
 * 
 * Functions for saving, loading, and managing client data
 */

import { Client, CompanyClient, IndividualClient, VendorClient } from '@/types/client';
import { v4 as uuidv4 } from 'uuid';

// Key for storing client data in local storage
const CLIENTS_STORAGE_KEY = 'mokClients';

// Default storage structure
const defaultStorage = {
  companies: [] as CompanyClient[],
  individuals: [] as IndividualClient[],
  vendors: [] as VendorClient[],
  lastUpdated: new Date().toISOString()
};

/**
 * Get all clients from local storage
 */
export const getClients = (): {
  companies: CompanyClient[];
  individuals: IndividualClient[];
  vendors: VendorClient[];
  lastUpdated: string;
} => {
  try {
    const clientsData = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!clientsData) {
      return { ...defaultStorage };
    }
    return JSON.parse(clientsData);
  } catch (error) {
    console.error('Error getting clients:', error);
    return { ...defaultStorage };
  }
};

/**
 * Save clients to local storage
 */
export const saveClients = (data: {
  companies: CompanyClient[];
  individuals: IndividualClient[];
  vendors: VendorClient[];
}): boolean => {
  try {
    const storageData = {
      ...data,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(storageData));
    return true;
  } catch (error) {
    console.error('Error saving clients:', error);
    return false;
  }
};

/**
 * Add a new client
 */
export const addClient = (client: Partial<Client>): Client | null => {
  try {
    const clients = getClients();
    const now = new Date().toISOString();
    const id = client.id || uuidv4();
    
    // Create a new client with the required fields
    const newClient = {
      ...client,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    // Add the client to the appropriate array based on type
    if (client.type === 'company') {
      clients.companies.push(newClient as CompanyClient);
    } else if (client.type === 'individual') {
      clients.individuals.push(newClient as IndividualClient);
    } else if (client.type === 'vendor') {
      clients.vendors.push(newClient as VendorClient);
    } else {
      throw new Error('Invalid client type');
    }
    
    // Save the updated clients
    saveClients(clients);
    
    return newClient as Client;
  } catch (error) {
    console.error('Error adding client:', error);
    return null;
  }
};

/**
 * Update an existing client
 */
export const updateClient = (id: string, clientData: Partial<Client>): Client | null => {
  try {
    const clients = getClients();
    const clientType = clientData.type;
    
    if (!clientType) {
      throw new Error('Client type is required');
    }
    
    // Find and update the client in the appropriate array
    if (clientType === 'company') {
      const index = clients.companies.findIndex(c => c.id === id);
      if (index === -1) return null;
      
      clients.companies[index] = {
        ...clients.companies[index],
        ...clientData,
        updatedAt: new Date().toISOString()
      } as CompanyClient;
      
      saveClients(clients);
      return clients.companies[index] as Client;
    } else if (clientType === 'individual') {
      const index = clients.individuals.findIndex(c => c.id === id);
      if (index === -1) return null;
      
      clients.individuals[index] = {
        ...clients.individuals[index],
        ...clientData,
        updatedAt: new Date().toISOString()
      } as IndividualClient;
      
      saveClients(clients);
      return clients.individuals[index] as Client;
    } else if (clientType === 'vendor') {
      const index = clients.vendors.findIndex(c => c.id === id);
      if (index === -1) return null;
      
      clients.vendors[index] = {
        ...clients.vendors[index],
        ...clientData,
        updatedAt: new Date().toISOString()
      } as VendorClient;
      
      saveClients(clients);
      return clients.vendors[index] as Client;
    }
    
    return null;
  } catch (error) {
    console.error('Error updating client:', error);
    return null;
  }
};

/**
 * Delete a client
 */
export const deleteClient = (id: string, type: 'company' | 'individual' | 'vendor'): boolean => {
  try {
    const clients = getClients();
    
    if (type === 'company') {
      clients.companies = clients.companies.filter(c => c.id !== id);
    } else if (type === 'individual') {
      clients.individuals = clients.individuals.filter(c => c.id !== id);
    } else if (type === 'vendor') {
      clients.vendors = clients.vendors.filter(c => c.id !== id);
    } else {
      throw new Error('Invalid client type');
    }
    
    saveClients(clients);
    return true;
  } catch (error) {
    console.error('Error deleting client:', error);
    return false;
  }
};

/**
 * Create a backup of client data
 */
export const createClientDataBackup = (): boolean => {
  try {
    const clients = getClients();
    const backup = {
      ...clients,
      backupDate: new Date().toISOString()
    };
    
    localStorage.setItem(`${CLIENTS_STORAGE_KEY}_backup`, JSON.stringify(backup));
    console.log('Client data backup created successfully');
    return true;
  } catch (error) {
    console.error('Error creating client data backup:', error);
    return false;
  }
};

/**
 * Restore client data from a backup
 */
export const restoreClientDataFromBackup = (): boolean => {
  try {
    const backupData = localStorage.getItem(`${CLIENTS_STORAGE_KEY}_backup`);
    if (!backupData) {
      console.error('No backup data found');
      return false;
    }
    
    const backup = JSON.parse(backupData);
    const { companies, individuals, vendors } = backup;
    
    saveClients({ companies, individuals, vendors });
    console.log('Client data restored from backup successfully');
    return true;
  } catch (error) {
    console.error('Error restoring client data from backup:', error);
    return false;
  }
};

/**
 * Set client data safely (for migrations and imports)
 */
export const setSafeClientData = (clientData: any): boolean => {
  try {
    // Validate data structure
    if (!clientData || typeof clientData !== 'object') {
      throw new Error('Invalid client data format');
    }
    
    const { companies = [], individuals = [], vendors = [] } = clientData;
    
    // Ensure arrays
    if (!Array.isArray(companies) || !Array.isArray(individuals) || !Array.isArray(vendors)) {
      throw new Error('Client data must contain arrays for companies, individuals, and vendors');
    }
    
    // Update storage
    saveClients({ 
      companies: companies as CompanyClient[], 
      individuals: individuals as IndividualClient[], 
      vendors: vendors as VendorClient[] 
    });
    
    return true;
  } catch (error) {
    console.error('Error setting safe client data:', error);
    return false;
  }
};
