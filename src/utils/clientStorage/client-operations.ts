
/**
 * Client CRUD operations
 */

import { Client } from '@/types/client';
import { ClientOperationResult } from './types';
import { getClientsData } from './data-retrieval';
import { saveClientsData } from './data-persistence';

/**
 * Add a new client to the appropriate category
 */
export const addClient = async (
  client: Client, 
  clientType: 'company' | 'individual' | 'vendor'
): Promise<ClientOperationResult> => {
  try {
    // Get current clients data
    const { success, data: clientsData, error } = await getClientsData();
    
    if (!success || !clientsData) {
      return { success: false, error };
    }
    
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
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Error adding client') 
    };
  }
};

/**
 * Update an existing client
 */
export const updateClient = async (
  updatedClient: Client,
  clientType: 'company' | 'individual' | 'vendor'
): Promise<ClientOperationResult> => {
  try {
    // Get current clients data
    const { success, data: clientsData, error } = await getClientsData();
    
    if (!success || !clientsData) {
      return { success: false, error };
    }
    
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
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Error updating client') 
    };
  }
};

/**
 * Delete a client
 */
export const deleteClient = async (
  clientId: string,
  clientType: 'company' | 'individual' | 'vendor'
): Promise<ClientOperationResult> => {
  try {
    // Get current clients data
    const { success, data: clientsData, error } = await getClientsData();
    
    if (!success || !clientsData) {
      return { success: false, error };
    }
    
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
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Error deleting client') 
    };
  }
};
