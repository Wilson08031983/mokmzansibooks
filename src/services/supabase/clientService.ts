import { supabase } from '@/lib/supabase';
import { 
  Client, 
  CompanyClient, 
  IndividualClient, 
  VendorClient, 
  isCompanyClient, 
  isIndividualClient, 
  isVendorClient 
} from '@/types/client';

// Table name constants
const COMPANIES_TABLE = 'companies';
const INDIVIDUALS_TABLE = 'individuals';
const VENDORS_TABLE = 'vendors';

// Error handling helper
const handleError = (error: any, operation: string) => {
  console.error(`Error ${operation}:`, error);
  throw new Error(`Failed to ${operation}: ${error.message || 'Unknown error'}`);
};

/**
 * Get all clients from Supabase
 */
export const getAllClients = async () => {
  try {
    // Fetch companies
    const { data: companies, error: companiesError } = await supabase
      .from(COMPANIES_TABLE)
      .select('*');
    
    if (companiesError) throw companiesError;

    // Fetch individuals
    const { data: individuals, error: individualsError } = await supabase
      .from(INDIVIDUALS_TABLE)
      .select('*');
    
    if (individualsError) throw individualsError;

    // Fetch vendors
    const { data: vendors, error: vendorsError } = await supabase
      .from(VENDORS_TABLE)
      .select('*');
    
    if (vendorsError) throw vendorsError;

    return {
      companies: companies as CompanyClient[],
      individuals: individuals as IndividualClient[],
      vendors: vendors as VendorClient[]
    };
  } catch (error) {
    handleError(error, 'fetch all clients');
    // Return empty array to prevent app crashes (this line won't execute if handleError throws)
    return { companies: [], individuals: [], vendors: [] };
  }
};

/**
 * Create a new client in the appropriate table
 */
export const createClient = async (client: Client) => {
  try {
    let tableName = '';
    
    if (isCompanyClient(client)) {
      tableName = COMPANIES_TABLE;
    } else if (isIndividualClient(client)) {
      tableName = INDIVIDUALS_TABLE;
    } else if (isVendorClient(client)) {
      tableName = VENDORS_TABLE;
    } else {
      throw new Error('Invalid client type');
    }
    
    const { data, error } = await supabase
      .from(tableName)
      .insert([client])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'create client');
    return null;
  }
};

/**
 * Update an existing client
 */
export const updateClient = async (client: Client) => {
  try {
    let tableName = '';
    
    if (isCompanyClient(client)) {
      tableName = COMPANIES_TABLE;
    } else if (isIndividualClient(client)) {
      tableName = INDIVIDUALS_TABLE;
    } else if (isVendorClient(client)) {
      tableName = VENDORS_TABLE;
    } else {
      throw new Error('Invalid client type');
    }
    
    const { data, error } = await supabase
      .from(tableName)
      .update(client)
      .eq('id', client.id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    handleError(error, 'update client');
    return null;
  }
};

/**
 * Delete a client by ID and type
 */
export const deleteClient = async (clientId: string, clientType: string) => {
  try {
    let tableName = '';
    
    if (clientType === 'company') {
      tableName = COMPANIES_TABLE;
    } else if (clientType === 'individual') {
      tableName = INDIVIDUALS_TABLE;
    } else if (clientType === 'vendor') {
      tableName = VENDORS_TABLE;
    } else {
      throw new Error('Invalid client type');
    }
    
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', clientId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    handleError(error, 'delete client');
    return false;
  }
};

/**
 * Add credit to a client
 */
export const addClientCredit = async (clientId: string, clientType: string, amount: number) => {
  try {
    let tableName = '';
    
    if (clientType === 'company') {
      tableName = COMPANIES_TABLE;
    } else if (clientType === 'individual') {
      tableName = INDIVIDUALS_TABLE;
    } else if (clientType === 'vendor') {
      tableName = VENDORS_TABLE;
    } else {
      throw new Error('Invalid client type');
    }
    
    // First, get the current client data
    const { data: client, error: fetchError } = await supabase
      .from(tableName)
      .select('credit, lastInteraction')
      .eq('id', clientId)
      .single();
    
    if (fetchError) throw fetchError;
    if (!client) throw new Error('Client not found');
    
    // Update with new credit amount and lastInteraction date
    const { data, error: updateError } = await supabase
      .from(tableName)
      .update({
        credit: client.credit + amount,
        lastInteraction: new Date().toISOString().split('T')[0] // Update last interaction date
      })
      .eq('id', clientId)
      .select()
      .single();
    
    if (updateError) throw updateError;
    return data;
  } catch (error) {
    handleError(error, 'add client credit');
    return null;
  }
};

/**
 * Get client by ID (will search all client tables)
 */
export const getClientById = async (clientId: string) => {
  try {
    // Check companies
    const { data: company, error: companyError } = await supabase
      .from(COMPANIES_TABLE)
      .select('*')
      .eq('id', clientId)
      .maybeSingle();
    
    if (companyError) throw companyError;
    if (company) return company;
    
    // Check individuals
    const { data: individual, error: individualError } = await supabase
      .from(INDIVIDUALS_TABLE)
      .select('*')
      .eq('id', clientId)
      .maybeSingle();
    
    if (individualError) throw individualError;
    if (individual) return individual;
    
    // Check vendors
    const { data: vendor, error: vendorError } = await supabase
      .from(VENDORS_TABLE)
      .select('*')
      .eq('id', clientId)
      .maybeSingle();
    
    if (vendorError) throw vendorError;
    if (vendor) return vendor;
    
    // No client found
    return null;
  } catch (error) {
    handleError(error, 'get client by ID');
    return null;
  }
};

// Export client service functions
export const clientService = {
  getAllClients,
  createClient,
  updateClient,
  deleteClient,
  addClientCredit,
  getClientById
};
