
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, CompanyClient, IndividualClient, VendorClient, ClientsState } from '@/types/client';
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

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<ClientsState>(defaultState);
  const [loading, setLoading] = useState(true);

  // Load clients from localStorage on mount
  useEffect(() => {
    try {
      const savedClients = localStorage.getItem('mokClients');
      if (savedClients) {
        setClients(JSON.parse(savedClients));
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save clients to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('mokClients', JSON.stringify(clients));
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (client.type === 'company') {
      newClient = {
        ...commonProperties,
        type: 'company',
        contactPerson: (client as Partial<CompanyClient>).contactPerson
      } as CompanyClient;
    } else if (client.type === 'individual') {
      newClient = {
        ...commonProperties,
        type: 'individual',
        firstName: (client as Partial<IndividualClient>).firstName,
        lastName: (client as Partial<IndividualClient>).lastName
      } as IndividualClient;
    } else {
      newClient = {
        ...commonProperties,
        type: 'vendor',
        contactPerson: (client as Partial<VendorClient>).contactPerson,
        category: (client as Partial<VendorClient>).category
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
