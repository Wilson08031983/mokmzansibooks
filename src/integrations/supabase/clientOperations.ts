/**
 * Supabase operations for client data
 * This file contains functions for interacting with the Supabase database for client-related operations
 */

import { supabase } from './client';
import { Client, CompanyClient, IndividualClient, VendorClient } from "@/types/client";
import { ClientsState, getSafeClientData } from '@/utils/clientDataPersistence';

/**
 * Save all clients to Supabase
 * @param clients The client state to save
 * @returns Promise that resolves when save is complete
 */
export const saveClientsToSupabase = async (clients: ClientsState): Promise<void> => {
  try {
    // Get the current user to associate with clients
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // First, get all existing clients for this user
    const { data: existingClients } = await supabase
      .from('clients')
      .select('id, local_id')
      .eq('user_id', user.id);
    
    // Create a map of local_id to database id for existing clients
    const existingClientMap = new Map();
    if (existingClients) {
      existingClients.forEach(client => {
        existingClientMap.set(client.local_id, client.id);
      });
    }
    
    // Process all client types
    const allClients = [
      ...clients.companies.map(c => ({ ...c, clientType: 'company' })),
      ...clients.individuals.map(c => ({ ...c, clientType: 'individual' })),
      ...clients.vendors.map(c => ({ ...c, clientType: 'vendor' }))
    ];
    
    // Process each client - update existing or insert new
    for (const client of allClients) {
      const clientData = {
        user_id: user.id,
        local_id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        city: client.city,
        province: client.province,
        postal_code: client.postalCode,
        client_type: client.clientType,
        credit: client.credit || 0,
        outstanding: client.outstanding || 0,
        overdue: client.overdue || 0,
        last_interaction: client.lastInteraction,
        contact_person: 'contactPerson' in client ? client.contactPerson : null,
        updated_at: new Date().toISOString()
      };
      
      if (existingClientMap.has(client.id)) {
        // Update existing client
        await supabase
          .from('clients')
          .update(clientData)
          .eq('id', existingClientMap.get(client.id));
      } else {
        // Insert new client
        await supabase
          .from('clients')
          .insert({
            ...clientData,
            created_at: new Date().toISOString()
          });
      }
    }
  } catch (error) {
    console.error('Error saving clients to Supabase:', error);
    throw error;
  }
};

/**
 * Load client data from Supabase
 * @returns Promise resolving to the client state
 */
export const loadClientsFromSupabase = async (): Promise<ClientsState | null> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    // Get all clients for this user
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id);
    
    if (error) throw error;
    
    if (!data || data.length === 0) return null;
    
    // Convert data to ClientsState format
    const clientsState: ClientsState = {
      companies: [],
      individuals: [],
      vendors: []
    };
    
    data.forEach(client => {
      const clientData = {
        id: client.local_id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        city: client.city,
        province: client.province,
        postalCode: client.postal_code,
        credit: client.credit || 0,
        outstanding: client.outstanding || 0,
        overdue: client.overdue || 0,
        lastInteraction: client.last_interaction
      };
      
      if (client.client_type === 'company') {
        clientsState.companies.push({
          ...clientData,
          type: 'company',
          contactPerson: client.contact_person
        } as CompanyClient);
      } else if (client.client_type === 'individual') {
        clientsState.individuals.push({
          ...clientData,
          type: 'individual'
        } as IndividualClient);
      } else if (client.client_type === 'vendor') {
        clientsState.vendors.push({
          ...clientData,
          type: 'vendor',
          contactPerson: client.contact_person
        } as VendorClient);
      }
    });
    
    return clientsState;
  } catch (error) {
    console.error('Error loading clients from Supabase:', error);
    return null;
  }
};

/**
 * Sync local client data with Supabase
 * This will push local data to Supabase and then pull the latest data back
 */
export const syncClientData = async (): Promise<void> => {
  try {
    // Get current client data from localStorage
    const clientData = getSafeClientData();
    
    // Save to Supabase
    await saveClientsToSupabase(clientData);
    
    // Update local storage with latest data from Supabase
    const latestData = await loadClientsFromSupabase();
    if (latestData) {
      localStorage.setItem('mokClients', JSON.stringify(latestData));
    }
  } catch (error) {
    console.error('Error syncing client data:', error);
  }
};
