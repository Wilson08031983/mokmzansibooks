/**
 * Supabase Client Service
 * Handles all client data operations with Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { Client, CompanyClient, IndividualClient, VendorClient } from '@/types/client';
import { ClientsState } from '@/utils/clientDataPersistence';
import { sanitizeClient } from '@/utils/clientErrorPrevention';

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bazbbweawubxqfebliil.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Fetch all clients from Supabase
 * @returns Promise with client state
 */
export async function fetchClientsFromSupabase(): Promise<ClientsState> {
  try {
    // Fetch companies
    const { data: companies, error: companyError } = await supabase
      .from('clients')
      .select('*')
      .eq('type', 'company');
      
    if (companyError) throw companyError;
    
    // Fetch individuals
    const { data: individuals, error: individualError } = await supabase
      .from('clients')
      .select('*')
      .eq('type', 'individual');
      
    if (individualError) throw individualError;
    
    // Fetch vendors
    const { data: vendors, error: vendorError } = await supabase
      .from('clients')
      .select('*')
      .eq('type', 'vendor');
      
    if (vendorError) throw vendorError;
    
    return {
      companies: companies as CompanyClient[],
      individuals: individuals as IndividualClient[],
      vendors: vendors as VendorClient[]
    };
  } catch (error) {
    console.error('Error fetching clients from Supabase:', error);
    throw error;
  }
}

/**
 * Sync local client data with Supabase
 * @param clients The client state to sync
 * @returns Promise with sync result
 */
export async function syncClientsWithSupabase(clients: ClientsState): Promise<boolean> {
  try {
    // Get all clients from Supabase for comparison
    const { data: existingClients, error: fetchError } = await supabase
      .from('clients')
      .select('id');
      
    if (fetchError) throw fetchError;
    
    // Extract all client IDs from Supabase
    const existingIds = new Set(existingClients.map(client => client.id));
    
    // Prepare all local clients for comparison
    const allLocalClients = [
      ...clients.companies,
      ...clients.individuals,
      ...clients.vendors
    ];
    
    // Identify clients to add, update, or delete
    const clientsToAdd = allLocalClients.filter(client => !existingIds.has(client.id));
    const clientsToUpdate = allLocalClients.filter(client => existingIds.has(client.id));
    
    // Add new clients
    if (clientsToAdd.length > 0) {
      const { error: insertError } = await supabase
        .from('clients')
        .insert(clientsToAdd.map(client => sanitizeClient(client)));
        
      if (insertError) throw insertError;
    }
    
    // Update existing clients
    for (const client of clientsToUpdate) {
      const { error: updateError } = await supabase
        .from('clients')
        .update(sanitizeClient(client))
        .eq('id', client.id);
        
      if (updateError) throw updateError;
    }
    
    // Handle deletions (optional - uncomment if you want to delete clients from Supabase)
    /*
    const localIds = new Set(allLocalClients.map(client => client.id));
    const idsToDelete = Array.from(existingIds).filter(id => !localIds.has(id));
    
    if (idsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .in('id', idsToDelete);
        
      if (deleteError) throw deleteError;
    }
    */
    
    return true;
  } catch (error) {
    console.error('Error syncing clients with Supabase:', error);
    return false;
  }
}

/**
 * Add a single client to Supabase
 * @param client The client to add
 * @returns Promise with operation result
 */
export async function addClientToSupabase(client: Client): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clients')
      .insert(sanitizeClient(client));
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error adding client to Supabase:', error);
    return false;
  }
}

/**
 * Update a single client in Supabase
 * @param client The client to update
 * @returns Promise with operation result
 */
export async function updateClientInSupabase(client: Client): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clients')
      .update(sanitizeClient(client))
      .eq('id', client.id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating client in Supabase:', error);
    return false;
  }
}

/**
 * Delete a client from Supabase
 * @param clientId The ID of the client to delete
 * @returns Promise with operation result
 */
export async function deleteClientFromSupabase(clientId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting client from Supabase:', error);
    return false;
  }
}

/**
 * Fetch a single client from Supabase
 * @param clientId The ID of the client to fetch
 * @returns Promise with the client data
 */
export async function getClientFromSupabase(clientId: string): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();
      
    if (error) throw error;
    
    return data as Client;
  } catch (error) {
    console.error('Error fetching client from Supabase:', error);
    return null;
  }
}
