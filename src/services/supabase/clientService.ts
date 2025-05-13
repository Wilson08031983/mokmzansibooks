import { supabase } from '@/utils/supabaseClient';
import { 
  Client, 
  CompanyClient, 
  IndividualClient, 
  VendorClient, 
  isCompanyClient, 
  isIndividualClient, 
  isVendorClient 
} from '@/types/client';
import { v4 as uuidv4 } from 'uuid';

// Using a single table for all client types for simplicity
const CLIENT_DATA_TABLE = 'client_data';

// Error handling helper
const handleError = (error: any, operation: string) => {
  console.error(`Error ${operation}:`, error);
  return null; // Return null instead of throwing to prevent app crashes
};

/**
 * Get all clients from Supabase
 */
export const getAllClients = async () => {
  try {
    // Fetch all clients from the generic table
    const { data, error } = await supabase
      .from(CLIENT_DATA_TABLE)
      .select('*')
      .or('type.eq.company,type.eq.individual,type.eq.vendor');
    
    if (error) {
      console.error('Error fetching clients:', error);
      return { companies: [], individuals: [], vendors: [] };
    }

    if (!data || data.length === 0) {
      return { companies: [], individuals: [], vendors: [] };
    }

    // Separate clients by type
    const companies: CompanyClient[] = [];
    const individuals: IndividualClient[] = [];
    const vendors: VendorClient[] = [];

    data.forEach(item => {
      const client = item.data as Client;
      if (isCompanyClient(client)) {
        companies.push(client as CompanyClient);
      } else if (isIndividualClient(client)) {
        individuals.push(client as IndividualClient);
      } else if (isVendorClient(client)) {
        vendors.push(client as VendorClient);
      }
    });

    return { companies, individuals, vendors };
  } catch (error) {
    console.error('Error fetching all clients:', error);
    return { companies: [], individuals: [], vendors: [] };
  }
};

/**
 * Create a new client in Supabase
 */
export const createClient = async (client: Client) => {
  try {
    // Ensure the client has an ID
    const clientWithId = {
      ...client,
      id: client.id || uuidv4()
    };
    
    const timestamp = new Date().toISOString();
    
    // Insert into the generic table
    const { data, error } = await supabase
      .from(CLIENT_DATA_TABLE)
      .insert([{
        id: uuidv4(),
        type: clientWithId.type, // 'company', 'individual', or 'vendor'
        data: clientWithId,
        created_at: timestamp,
        updated_at: timestamp
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating client:', error);
      return null;
    }
    
    return data.data as Client;
  } catch (error) {
    console.error('Error creating client:', error);
    return null;
  }
};

/**
 * Update an existing client
 */
export const updateClient = async (client: Client) => {
  try {
    if (!client.id) {
      console.error('Cannot update client without an ID');
      return null;
    }
    
    // Find the client record
    const { data: existingRecords, error: fetchError } = await supabase
      .from(CLIENT_DATA_TABLE)
      .select('*')
      .eq('data->>id', client.id);
    
    if (fetchError || !existingRecords || existingRecords.length === 0) {
      console.error('Error finding client to update:', fetchError || 'Client not found');
      return null;
    }
    
    const existingRecord = existingRecords[0];
    const timestamp = new Date().toISOString();
    
    // Update the record
    const { data, error } = await supabase
      .from(CLIENT_DATA_TABLE)
      .update({
        data: client,
        updated_at: timestamp
      })
      .eq('id', existingRecord.id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating client:', error);
      return null;
    }
    
    return data.data as Client;
  } catch (error) {
    console.error('Error updating client:', error);
    return null;
  }
};

/**
 * Delete a client
 */
export const deleteClient = async (client: Client) => {
  try {
    if (!client.id) {
      console.error('Cannot delete client without an ID');
      return false;
    }
    
    // Find the client record
    const { data: existingRecords, error: fetchError } = await supabase
      .from(CLIENT_DATA_TABLE)
      .select('id')
      .eq('data->>id', client.id);
    
    if (fetchError || !existingRecords || existingRecords.length === 0) {
      console.error('Error finding client to delete:', fetchError || 'Client not found');
      return false;
    }
    
    // Delete the record
    const { error } = await supabase
      .from(CLIENT_DATA_TABLE)
      .delete()
      .eq('id', existingRecords[0].id);
    
    if (error) {
      console.error('Error deleting client:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting client:', error);
    return false;
  }
};

/**
 * Get a client by ID
 */
export const getClientById = async (id: string) => {
  try {
    const { data: records, error } = await supabase
      .from(CLIENT_DATA_TABLE)
      .select('*')
      .eq('data->>id', id);
    
    if (error || !records || records.length === 0) {
      console.error('Error finding client by ID:', error || 'Client not found');
      return null;
    }
    
    const client = records[0].data as Client;
    
    // Return the client with the correct type
    if (isCompanyClient(client)) {
      return client as CompanyClient;
    } else if (isIndividualClient(client)) {
      return client as IndividualClient;
    } else if (isVendorClient(client)) {
      return client as VendorClient;
    }
    
    return client;
  } catch (error) {
    console.error('Error getting client by ID:', error);
    return null;
  }
};

/**
 * Ensure the client_data table exists in Supabase
 */
export const ensureClientDataTable = async (): Promise<boolean> => {
  try {
    // Check if the table exists by trying to query it
    const { error } = await supabase
      .from(CLIENT_DATA_TABLE)
      .select('id')
      .limit(1);
    
    if (!error) {
      console.log('Client data table exists');
      return true;
    }
    
    // If the table doesn't exist, we can't create it through the API
    // This would need to be done in the Supabase dashboard
    console.error('Client data table does not exist. Please create it in the Supabase dashboard with columns: id, type, data, created_at, updated_at');
    return false;
  } catch (error) {
    console.error('Error checking client data table:', error);
    return false;
  }
};

/**
 * Import clients from local storage to Supabase
 */
export const importClientsToSupabase = async (clients: Client[]): Promise<boolean> => {
  try {
    if (!clients || clients.length === 0) {
      console.log('No clients to import');
      return true;
    }
    
    const timestamp = new Date().toISOString();
    const records = clients.map(client => ({
      id: uuidv4(),
      type: client.type,
      data: {
        ...client,
        id: client.id || uuidv4()
      },
      created_at: timestamp,
      updated_at: timestamp
    }));
    
    // Insert in batches of 50 to avoid hitting API limits
    const batchSize = 50;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      const { error } = await supabase
        .from(CLIENT_DATA_TABLE)
        .insert(batch);
      
      if (error) {
        console.error(`Error importing clients batch ${i}-${i+batch.length}:`, error);
        return false;
      }
    }
    
    console.log(`Successfully imported ${records.length} clients to Supabase`);
    return true;
  } catch (error) {
    console.error('Error importing clients to Supabase:', error);
    return false;
  }
};

export default {
  getAllClients,
  createClient,
  updateClient,
  deleteClient,
  getClientById,
  ensureClientDataTable,
  importClientsToSupabase
};
