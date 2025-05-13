import { Client, ClientsState, ClientType, CompanyClient, IndividualClient, VendorClient } from '@/types/client';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'MokMzansi_clients';
const BACKUP_KEY = 'MokMzansi_clients_backup';

// Initialize default state
const defaultClientsState: ClientsState = {
  companies: [],
  individuals: [],
  vendors: []
};

/**
 * Safely get client data with fallback to backup if corrupted
 */
export function getSafeClientData(): ClientsState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return defaultClientsState;
    
    const parsed = JSON.parse(data) as ClientsState;
    
    // Validate the parsed data structure
    if (!parsed.companies || !Array.isArray(parsed.companies) ||
        !parsed.individuals || !Array.isArray(parsed.individuals) ||
        !parsed.vendors || !Array.isArray(parsed.vendors)) {
      console.error('Invalid client data structure, attempting recovery from backup');
      return getClientDataFromBackup() || defaultClientsState;
    }
    
    return parsed;
  } catch (error) {
    console.error('Error retrieving client data:', error);
    return getClientDataFromBackup() || defaultClientsState;
  }
}

/**
 * Save client data with backup
 */
export function saveClientData(clients: ClientsState): void {
  try {
    // Create backup before saving
    const existingData = localStorage.getItem(STORAGE_KEY);
    if (existingData) {
      localStorage.setItem(BACKUP_KEY, existingData);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  } catch (error) {
    console.error('Error saving client data:', error);
    throw new Error('Failed to save client data to local storage');
  }
}

/**
 * Get client data from backup
 */
function getClientDataFromBackup(): ClientsState | null {
  try {
    const backupData = localStorage.getItem(BACKUP_KEY);
    if (!backupData) return null;
    
    return JSON.parse(backupData) as ClientsState;
  } catch (error) {
    console.error('Error retrieving backup client data:', error);
    return null;
  }
}

/**
 * Create a backup of client data
 */
export function createClientDataBackup(): boolean {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;
    
    localStorage.setItem(BACKUP_KEY, data);
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
    const backupData = localStorage.getItem(BACKUP_KEY);
    if (!backupData) return false;
    
    localStorage.setItem(STORAGE_KEY, backupData);
    return true;
  } catch (error) {
    console.error('Error restoring client data from backup:', error);
    return false;
  }
}

/**
 * Add a new client
 */
export function addClient(clientData: Partial<Client>): Client | null {
  try {
    const clients = getSafeClientData();
    
    if (!clientData.type) {
      throw new Error('Client type is required');
    }
    
    const now = new Date().toISOString();
    const newClient = {
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      ...clientData
    } as Client;
    
    // Add to the appropriate collection based on type
    switch (newClient.type) {
      case 'company':
        clients.companies.push(newClient as CompanyClient);
        break;
      case 'individual':
        clients.individuals.push(newClient as IndividualClient);
        break;
      case 'vendor':
        clients.vendors.push(newClient as VendorClient);
        break;
      default:
        throw new Error(`Invalid client type: ${clientData.type}`);
    }
    
    saveClientData(clients);
    return newClient;
  } catch (error) {
    console.error('Error adding client:', error);
    return null;
  }
}

/**
 * Update an existing client
 */
export function updateClient(id: string, clientData: Partial<Client>): Client | null {
  try {
    const clients = getSafeClientData();
    let updated = false;
    
    // Find and update client based on type
    if (clientData.type === 'company' || (!clientData.type && findClientById(id)?.type === 'company')) {
      const index = clients.companies.findIndex(c => c.id === id);
      if (index !== -1) {
        clients.companies[index] = {
          ...clients.companies[index],
          ...clientData,
          updatedAt: new Date().toISOString()
        };
        updated = true;
      }
    } else if (clientData.type === 'individual' || (!clientData.type && findClientById(id)?.type === 'individual')) {
      const index = clients.individuals.findIndex(c => c.id === id);
      if (index !== -1) {
        clients.individuals[index] = {
          ...clients.individuals[index],
          ...clientData,
          updatedAt: new Date().toISOString()
        };
        updated = true;
      }
    } else if (clientData.type === 'vendor' || (!clientData.type && findClientById(id)?.type === 'vendor')) {
      const index = clients.vendors.findIndex(c => c.id === id);
      if (index !== -1) {
        clients.vendors[index] = {
          ...clients.vendors[index],
          ...clientData,
          updatedAt: new Date().toISOString()
        };
        updated = true;
      }
    }
    
    if (!updated) {
      throw new Error(`Client with ID ${id} not found`);
    }
    
    saveClientData(clients);
    return findClientById(id);
  } catch (error) {
    console.error('Error updating client:', error);
    return null;
  }
}

/**
 * Delete a client
 */
export function deleteClient(id: string, type?: ClientType): boolean {
  try {
    const clients = getSafeClientData();
    let deleted = false;
    
    // If type is provided, delete from the specific collection
    if (type === 'company') {
      clients.companies = clients.companies.filter(c => c.id !== id);
      deleted = true;
    } else if (type === 'individual') {
      clients.individuals = clients.individuals.filter(c => c.id !== id);
      deleted = true;
    } else if (type === 'vendor') {
      clients.vendors = clients.vendors.filter(c => c.id !== id);
      deleted = true;
    } else {
      // Otherwise search all collections
      const initialCompaniesLength = clients.companies.length;
      const initialIndividualsLength = clients.individuals.length;
      const initialVendorsLength = clients.vendors.length;
      
      clients.companies = clients.companies.filter(c => c.id !== id);
      clients.individuals = clients.individuals.filter(c => c.id !== id);
      clients.vendors = clients.vendors.filter(c => c.id !== id);
      
      deleted = 
        clients.companies.length < initialCompaniesLength ||
        clients.individuals.length < initialIndividualsLength ||
        clients.vendors.length < initialVendorsLength;
    }
    
    if (!deleted) {
      throw new Error(`Client with ID ${id} not found`);
    }
    
    saveClientData(clients);
    return true;
  } catch (error) {
    console.error('Error deleting client:', error);
    return false;
  }
}

/**
 * Find a client by ID
 */
export function findClientById(id: string): Client | null {
  try {
    const clients = getSafeClientData();
    
    return (
      clients.companies.find(c => c.id === id) ||
      clients.individuals.find(c => c.id === id) ||
      clients.vendors.find(c => c.id === id) ||
      null
    );
  } catch (error) {
    console.error('Error finding client:', error);
    return null;
  }
}

/**
 * Set a safe version of client data
 */
export function setSafeClientData(clients: ClientsState): boolean {
  try {
    saveClientData(clients);
    return true;
  } catch (error) {
    console.error('Error setting client data:', error);
    return false;
  }
}
