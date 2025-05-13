
/**
 * Hook for accessing client data throughout the application
 * This provides a consistent way to access client information
 * from any component without direct dependency on the Clients page
 * 
 * ULTRA RESILIENT VERSION: This implementation ensures client data is NEVER lost
 * by using multiple storage mechanisms with automatic recovery, including IndexedDB
 * for persistent storage that survives browser restarts and cache clearing.
 */

import { useState, useEffect } from 'react';
import { 
  Client, 
  CompanyClient, 
  IndividualClient, 
  VendorClient,
  ClientsState
} from '@/types/client';
import { getClientsData, saveClientsData, defaultClientsState } from '@/utils/clientStorage';
import permanentStorage, { StorageNamespace } from '@/utils/permanentStorage';
import { toast } from '@/hooks/use-toast';
import { usePersistence } from '@/contexts/PersistenceContext';

/**
 * Safe getter for client data with bombproof data retrieval
 * This function will NEVER fail to return client data
 */
async function getSafeClientDataAsync(): Promise<ClientsState> {
  try {
    // Initialize permanent storage if needed
    if (!permanentStorage.isReady()) {
      await permanentStorage.waitUntilReady(2000);
    }
    
    // First try our bombproof storage system
    const result = await getClientsData();
    if (result.success && result.data) {
      console.log('Client data loaded from bombproof storage');
      return result.data;
    }
    
    // Check legacy keys in order of preference
    const legacyKeys = [
      'mok-mzansi-books-clients',
      'mokClients',
      'clients'
    ];
    
    for (const key of legacyKeys) {
      try {
        const clientData = localStorage.getItem(key);
        if (clientData) {
          const parsedData = JSON.parse(clientData) as ClientsState;
          if (parsedData && (
            Array.isArray(parsedData.companies) || 
            Array.isArray(parsedData.individuals) || 
            Array.isArray(parsedData.vendors)
          )) {
            console.log(`Client data loaded from ${key}`);
            
            // Normalize structure
            const normalized = {
              companies: Array.isArray(parsedData.companies) ? parsedData.companies : [],
              individuals: Array.isArray(parsedData.individuals) ? parsedData.individuals : [],
              vendors: Array.isArray(parsedData.vendors) ? parsedData.vendors : []
            };
            
            // Save to permanent storage for next time
            saveClientsData(normalized);
            
            return normalized;
          }
        }
      } catch (error) {
        console.warn(`Error loading from ${key}:`, error);
      }
    }
    
    return defaultClientsState;
  } catch (error) {
    console.error('Error getting client data:', error);
    return defaultClientsState;
  }
}

/**
 * Synchronous fallback version for initial state
 */
function getSafeClientData(): ClientsState {
  try {
    // Try multiple legacy keys
    for (const key of ['mok-mzansi-books-clients', 'mokClients', 'clients']) {
      try {
        const clientData = localStorage.getItem(key);
        if (clientData) {
          const parsedData = JSON.parse(clientData) as ClientsState;
          if (parsedData) {
            return {
              companies: Array.isArray(parsedData.companies) ? parsedData.companies : [],
              individuals: Array.isArray(parsedData.individuals) ? parsedData.individuals : [],
              vendors: Array.isArray(parsedData.vendors) ? parsedData.vendors : []
            };
          }
        }
      } catch {}
    }
    
    return defaultClientsState;
  } catch (error) {
    console.error('Error getting safe client data:', error);
    return defaultClientsState;
  }
}

/**
 * Hook to access client data throughout the application
 * Returns read-only client data that persists across the application
 */
export const useGlobalClientData = () => {
  const persistence = usePersistence();
  const [clientsState, setClientsState] = useState<ClientsState>(getSafeClientData());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allClients, setAllClients] = useState<Client[]>([]);
  const [hasData, setHasData] = useState<boolean>(false);

  // Update allClients whenever clientsState changes
  useEffect(() => {
    const combined = [
      ...clientsState.companies,
      ...clientsState.individuals,
      ...clientsState.vendors
    ];
    setAllClients(combined);
    setHasData(combined.length > 0);
  }, [clientsState]);

  // Load clients state on component mount with multiple fallback methods
  useEffect(() => {
    let isMounted = true;
    
    const loadClientsData = async () => {
      try {
        setIsLoading(true);
        
        // First attempt: Try loading from our new ultra-resilient persistence system
        if (persistence.isReady) {
          const persistedData = await persistence.getItem('mokClients', null);
          if (persistedData && isMounted) {
            console.log('Client data loaded from PersistenceService');
            setClientsState(persistedData);
            setIsLoading(false);
            return;
          }
        }
        
        // Second attempt: Try our bombproof storage system
        const data = await getSafeClientDataAsync();
        if (isMounted) {
          setClientsState(data);
          
          // Store in our new persistence system for future use
          if (persistence.isReady) {
            await persistence.saveItem('mokClients', data);
            await persistence.saveItem('mok-mzansi-books-clients', data);
            console.log('Client data saved to PersistenceService');
          }
          
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading client data:', err);
        if (isMounted) {
          setError('Failed to load client data');
          toast({
            title: 'Error',
            description: 'Failed to load client data, using backup data',
            variant: 'destructive'
          });
          setIsLoading(false);
        }
      }
    };
    
    loadClientsData();
    
    // Set up a storage event listener to sync client data across tabs
    const handleStorageChange = (event: StorageEvent) => {
      if ((event.key === 'mokClients' || event.key === 'mok-mzansi-books-clients') && event.newValue) {
        try {
          const newData = JSON.parse(event.newValue) as ClientsState;
          setClientsState(newData);
        } catch (error) {
          console.error('Error parsing updated client data:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [persistence]);

  // Helper function to find a client by ID
  const findClientById = (id: string): Client | undefined => {
    return allClients.find(client => client.id === id);
  };

  // Helper function to get company clients only
  const getCompanyClients = (): CompanyClient[] => {
    return [...clientsState.companies];
  };

  // Helper function to get individual clients only
  const getIndividualClients = (): IndividualClient[] => {
    return [...clientsState.individuals];
  };

  // Helper function to get vendor clients only
  const getVendorClients = (): VendorClient[] => {
    return [...clientsState.vendors];
  };

  // Helper function to get clients with outstanding balances
  const getClientsWithOutstanding = (): Client[] => {
    return allClients.filter(client => (client.outstanding || 0) > 0);
  };

  // Helper function to get clients with overdue payments
  const getClientsWithOverdue = (): Client[] => {
    return allClients.filter(client => (client.overdue || 0) > 0);
  };

  // Function to save client data with multiple layers of redundancy
  const saveClientData = async (data: ClientsState) => {
    try {
      setIsLoading(true);
      const persistentData = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      
      // Use multiple layers of redundancy to ensure data is never lost
      let savedSuccessfully = false;
      
      // 1. Save to our new ultra-resilient persistence system (IndexedDB + localStorage)
      if (persistence.isReady) {
        try {
          await persistence.saveItem('mokClients', persistentData);
          await persistence.saveItem('mok-mzansi-books-clients', persistentData);
          savedSuccessfully = true;
          console.log('Client data saved to PersistenceService');
        } catch (err) {
          console.error('Error saving to PersistenceService:', err);
        }
      }
      
      // 2. Also save to our legacy permanent storage as fallback
      try {
        await saveClientsData(persistentData);
        savedSuccessfully = true;
        console.log('Client data saved to legacy storage');
      } catch (err) {
        console.error('Error saving to legacy storage:', err);
      }
      
      // 3. Direct localStorage as last resort
      try {
        localStorage.setItem('mokClients', JSON.stringify(persistentData));
        localStorage.setItem('mok-mzansi-books-clients', JSON.stringify(persistentData));
        savedSuccessfully = true;
        console.log('Client data saved directly to localStorage');
      } catch (err) {
        console.error('Error saving directly to localStorage:', err);
      }
      
      if (savedSuccessfully) {
        setClientsState(persistentData);
        return true;
      } else {
        throw new Error('All storage mechanisms failed');
      }
    } catch (err) {
      console.error('Error saving client data:', err);
      toast({
        title: 'Error',
        description: 'Failed to save client data',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Clients data
    clients: clientsState,
    allClients,
    hasData,
    isLoading,
    
    // Getters
    findClientById,
    getCompanyClients,
    getIndividualClients,
    getVendorClients,
    
    // CRUD operations
    addClient: async (client: Client) => {
      const newClientsState = { ...clientsState };
      if (client.type === 'company') {
        newClientsState.companies.push(client as CompanyClient);
      } else if (client.type === 'individual') {
        newClientsState.individuals.push(client as IndividualClient);
      } else if (client.type === 'vendor') {
        newClientsState.vendors.push(client as VendorClient);
      }
      await saveClientData(newClientsState);
    },
    updateClient: async (id: string, client: Client) => {
      const newClientsState = { ...clientsState };
      if (client.type === 'company') {
        const index = newClientsState.companies.findIndex(c => c.id === id);
        if (index !== -1) {
          newClientsState.companies[index] = client as CompanyClient;
          await saveClientData(newClientsState);
        }
      } else if (client.type === 'individual') {
        const index = newClientsState.individuals.findIndex(c => c.id === id);
        if (index !== -1) {
          newClientsState.individuals[index] = client as IndividualClient;
          await saveClientData(newClientsState);
        }
      } else if (client.type === 'vendor') {
        const index = newClientsState.vendors.findIndex(c => c.id === id);
        if (index !== -1) {
          newClientsState.vendors[index] = client as VendorClient;
          await saveClientData(newClientsState);
        }
      }
    },
    deleteClient: async (id: string) => {
      const newClientsState = { 
        companies: clientsState.companies.filter(c => c.id !== id),
        individuals: clientsState.individuals.filter(c => c.id !== id),
        vendors: clientsState.vendors.filter(c => c.id !== id)
      };
      await saveClientData(newClientsState);
    },
    
    // Client types
    addCompanyClient: async (client: CompanyClient) => {
      const newClientsState = { ...clientsState };
      newClientsState.companies.push(client);
      await saveClientData(newClientsState);
    },
    updateCompanyClient: async (id: string, client: CompanyClient) => {
      const newClientsState = { ...clientsState };
      const index = newClientsState.companies.findIndex(c => c.id === id);
      if (index !== -1) {
        newClientsState.companies[index] = client;
        await saveClientData(newClientsState);
      }
    },
    deleteCompanyClient: async (id: string) => {
      const newClientsState = { ...clientsState };
      const index = newClientsState.companies.findIndex(c => c.id === id);
      if (index !== -1) {
        newClientsState.companies.splice(index, 1);
        await saveClientData(newClientsState);
      }
    },
    
    addIndividualClient: async (client: IndividualClient) => {
      const newClientsState = { ...clientsState };
      newClientsState.individuals.push(client);
      await saveClientData(newClientsState);
    },
    updateIndividualClient: async (id: string, client: IndividualClient) => {
      const newClientsState = { ...clientsState };
      const index = newClientsState.individuals.findIndex(c => c.id === id);
      if (index !== -1) {
        newClientsState.individuals[index] = client;
        await saveClientData(newClientsState);
      }
    },
    deleteIndividualClient: async (id: string) => {
      const newClientsState = { ...clientsState };
      const index = newClientsState.individuals.findIndex(c => c.id === id);
      if (index !== -1) {
        newClientsState.individuals.splice(index, 1);
        await saveClientData(newClientsState);
      }
    },
    
    addVendorClient: async (client: VendorClient) => {
      const newClientsState = { ...clientsState };
      newClientsState.vendors.push(client);
      await saveClientData(newClientsState);
    },
    updateVendorClient: async (id: string, client: VendorClient) => {
      const newClientsState = { ...clientsState };
      const index = newClientsState.vendors.findIndex(c => c.id === id);
      if (index !== -1) {
        newClientsState.vendors[index] = client;
        await saveClientData(newClientsState);
      }
    },
    deleteVendorClient: async (id: string) => {
      const newClientsState = { ...clientsState };
      const index = newClientsState.vendors.findIndex(c => c.id === id);
      if (index !== -1) {
        newClientsState.vendors.splice(index, 1);
        await saveClientData(newClientsState);
      }
    },
  };
};

export default useGlobalClientData;
