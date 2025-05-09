
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Client, 
  CompanyClient, 
  IndividualClient, 
  VendorClient, 
  ClientsState 
} from '@/types/client';
import { v4 as uuidv4 } from 'uuid';

interface ClientContextType {
  clients: ClientsState;
  addClient: (client: Partial<Client>) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  loading: boolean;
}

const defaultState: ClientsState = {
  companies: [],
  individuals: [],
  vendors: []
};

// Storage key constants
const STORAGE_KEY = 'mokClients';
const BACKUP_KEY = 'mokClientsBackup';
const SESSION_BACKUP_KEY = 'mokClientsBackup';

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<ClientsState>(defaultState);
  const [loading, setLoading] = useState(true);

  // Load clients from localStorage on mount with enhanced persistence
  useEffect(() => {
    try {
      setLoading(true);
      
      // First try to get from localStorage
      const savedClients = localStorage.getItem(STORAGE_KEY);
      
      if (savedClients) {
        const parsedClients = JSON.parse(savedClients);
        setClients(parsedClients);
        console.log('Client data loaded from localStorage');
        
        // Create backup immediately after loading
        createClientBackup(parsedClients);
      } else {
        // If not in localStorage, try to restore from backups
        const restored = restoreFromBackup();
        if (restored) {
          console.log('Client data restored from backup');
        } else {
          console.log('No client data found, starting with empty state');
        }
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      // Attempt to restore from backup on error
      restoreFromBackup();
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a backup of client data
  const createClientBackup = (clientData: ClientsState) => {
    try {
      // Store in both localStorage and sessionStorage for redundancy
      localStorage.setItem(BACKUP_KEY, JSON.stringify(clientData));
      sessionStorage.setItem(SESSION_BACKUP_KEY, JSON.stringify(clientData));
      return true;
    } catch (error) {
      console.error('Error creating client backup:', error);
      return false;
    }
  };

  // Restore client data from backup
  const restoreFromBackup = (): boolean => {
    try {
      // Try localStorage backup first
      let backup = localStorage.getItem(BACKUP_KEY);
      
      // If not found, try sessionStorage
      if (!backup) {
        backup = sessionStorage.getItem(SESSION_BACKUP_KEY);
      }
      
      if (!backup) return false;
      
      // Validate backup data
      const parsedBackup = JSON.parse(backup);
      if (!parsedBackup || typeof parsedBackup !== 'object') return false;
      
      // Restore from backup
      setClients(parsedBackup);
      localStorage.setItem(STORAGE_KEY, backup);
      
      return true;
    } catch (error) {
      console.error('Error restoring client data from backup:', error);
      return false;
    }
  };

  // Save clients to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
        
        // Also create a backup whenever clients change
        createClientBackup(clients);
      } catch (error) {
        console.error('Error saving clients:', error);
      }
    }
  }, [clients, loading]);

  // Add a new client
  const addClient = (client: Partial<Client>) => {
    if (!client.type) return;

    // Create the new client with proper typing based on client type
    let newClient: Client;
    
    const commonProperties = {
      id: client.id || uuidv4(),
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      city: client.city || '',
      province: client.province || '',
      postalCode: client.postalCode || '',
      credit: client.credit || 0,
      outstanding: client.outstanding || 0,
      overdue: client.overdue || 0,
      lastInteraction: client.lastInteraction || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (client.type === 'company') {
      const companyClient = client as Partial<CompanyClient>;
      newClient = {
        ...commonProperties,
        type: 'company',
        contactPerson: companyClient.contactPerson || '',
        vatNumber: companyClient.vatNumber || '',
        registrationNumber: companyClient.registrationNumber || ''
      } as CompanyClient;
    } else if (client.type === 'individual') {
      const individualClient = client as Partial<IndividualClient>;
      newClient = {
        ...commonProperties,
        type: 'individual',
        firstName: individualClient.firstName || '',
        lastName: individualClient.lastName || ''
      } as IndividualClient;
    } else {
      const vendorClient = client as Partial<VendorClient>;
      newClient = {
        ...commonProperties,
        type: 'vendor',
        contactPerson: vendorClient.contactPerson || '',
        category: vendorClient.category || ''
      } as VendorClient;
    }
    
    setClients(prev => {
      const newClients = { ...prev };
      
      switch (client.type) {
        case 'company':
          newClients.companies = [...prev.companies, newClient as CompanyClient];
          break;
        case 'individual':
          newClients.individuals = [...prev.individuals, newClient as IndividualClient];
          break;
        case 'vendor':
          newClients.vendors = [...prev.vendors, newClient as VendorClient];
          break;
      }
      
      return newClients;
    });
  };

  // Update an existing client
  const updateClient = (id: string, clientUpdate: Partial<Client>) => {
    setClients(prev => {
      const newClients = { ...prev };
      
      // Check in all client types
      let clientType: 'companies' | 'individuals' | 'vendors' | null = null;
      
      if (prev.companies.some(c => c.id === id)) {
        clientType = 'companies';
      } else if (prev.individuals.some(c => c.id === id)) {
        clientType = 'individuals';
      } else if (prev.vendors.some(c => c.id === id)) {
        clientType = 'vendors';
      }
      
      if (clientType) {
        newClients[clientType] = prev[clientType].map(c => 
          c.id === id 
          ? { ...c, ...clientUpdate, updatedAt: new Date().toISOString() } 
          : c
        );
      }
      
      return newClients;
    });
  };

  // Delete a client
  const deleteClient = (id: string) => {
    setClients(prev => {
      const newClients = { ...prev };
      
      newClients.companies = prev.companies.filter(c => c.id !== id);
      newClients.individuals = prev.individuals.filter(c => c.id !== id);
      newClients.vendors = prev.vendors.filter(c => c.id !== id);
      
      return newClients;
    });
  };

  // Get a client by ID
  const getClientById = (id: string): Client | undefined => {
    // First check companies
    const companyClient = clients.companies.find(c => c.id === id);
    if (companyClient) return companyClient;
    
    // Then check individuals
    const individualClient = clients.individuals.find(c => c.id === id);
    if (individualClient) return individualClient;
    
    // Finally check vendors
    const vendorClient = clients.vendors.find(c => c.id === id);
    if (vendorClient) return vendorClient;
    
    // Not found
    return undefined;
  };

  return (
    <ClientContext.Provider value={{
      clients,
      addClient,
      updateClient,
      deleteClient,
      getClientById,
      loading
    }}>
      {children}
    </ClientContext.Provider>
  );
};

export const useClient = (): ClientContextType => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
};
