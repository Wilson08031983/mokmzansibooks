
/**
 * Client data persistence utilities
 */

import { Client, ClientsState } from '@/types/client';

// Safe storage key for client data
const CLIENT_DATA_KEY = 'mok_mzansi_client_data';

// Function to safely get client data from storage
export function getSafeClientData(): ClientsState {
  try {
    const data = localStorage.getItem(CLIENT_DATA_KEY);
    
    if (data) {
      return JSON.parse(data) as ClientsState;
    }
  } catch (error) {
    console.error('Error retrieving client data:', error);
  }
  
  // Return empty data if retrieval fails
  return {
    companies: [],
    individuals: [],
    vendors: []
  };
}

// Function to safely set client data in storage
export function setSafeClientData(data: ClientsState): void {
  try {
    localStorage.setItem(CLIENT_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving client data:', error);
  }
}

// For backward compatibility, alias setSafeClientData as saveClientData
export const saveClientData = setSafeClientData;

// Export the ClientsState type for use in other modules
export { ClientsState };

// Add missing client functionality for Clients page
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
