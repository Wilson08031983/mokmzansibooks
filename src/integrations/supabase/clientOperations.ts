
/**
 * Mock Supabase operations for client data
 * This file contains functions for client-related operations, currently using localStorage
 */

import { supabase } from './client';
import { Client, CompanyClient, IndividualClient, VendorClient, ClientsState } from "@/types/client";
import { getSafeClientData } from '@/utils/clientDataPersistence';

/**
 * Save all clients to storage (currently using localStorage)
 * @param clients The client state to save
 * @returns Promise that resolves when save is complete
 */
export const saveClientsToSupabase = async (clients: ClientsState): Promise<void> => {
  try {
    // Get the current user info
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found, saving locally only');
    } else {
      console.log('User authenticated, would sync to Supabase if table existed');
    }
    
    // For now, just save to localStorage
    localStorage.setItem('mokClients', JSON.stringify(clients));
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error saving clients:', error);
    throw error;
  }
};

/**
 * Load client data from storage (currently using localStorage)
 * @returns Promise resolving to the client state
 */
export const loadClientsFromSupabase = async (): Promise<ClientsState | null> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No authenticated user found, loading from localStorage only');
    }
    
    // Get clients from localStorage
    const clientsJson = localStorage.getItem('mokClients');
    if (!clientsJson) return null;
    
    const clients = JSON.parse(clientsJson) as ClientsState;
    return clients;
  } catch (error) {
    console.error('Error loading clients:', error);
    return null;
  }
};

/**
 * Sync local client data with storage
 * This will push local data to storage and then pull the latest data back
 */
export const syncClientData = async (): Promise<void> => {
  try {
    // Get current client data from localStorage
    const clientData = getSafeClientData();
    
    // Save to storage
    await saveClientsToSupabase(clientData);
    
    // Update local storage with latest data (currently just a no-op)
    const latestData = await loadClientsFromSupabase();
    if (latestData) {
      localStorage.setItem('mokClients', JSON.stringify(latestData));
    }
  } catch (error) {
    console.error('Error syncing client data:', error);
  }
};
