import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, ClientsState, CompanyClient, IndividualClient, VendorClient } from '@/types/client';

interface ClientContextType {
  clients: ClientsState;
  updateClient: (updatedClient: Client) => void;
  addClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;
  addClientCredit: (clientId: string, amount: number) => void;
  getClientById: (clientId: string) => Client | null;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const useClients = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
};

interface ClientProviderProps {
  children: ReactNode;
}

export const ClientProvider = ({ children }: ClientProviderProps) => {
  const [clients, setClients] = useState<ClientsState>(() => {
    // Try to load clients from localStorage first
    const savedClients = localStorage.getItem('mokClients');
    if (savedClients) {
      try {
        return JSON.parse(savedClients) as ClientsState;
      } catch (e) {
        console.error('Error parsing saved clients:', e);
        // Return empty client lists if parsing fails
        return {
          companies: [],
          individuals: [],
          vendors: []
        };
      }
    }
    // Return empty client lists if nothing is saved yet
    return {
      companies: [],
      individuals: [],
      vendors: []
    };
  });

  // Save client state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('mokClients', JSON.stringify(clients));
    } catch (e) {
      console.error('Error saving clients to localStorage:', e);
    }
  }, [clients]);

  // Get the current formatted date for lastInteraction updates
  const getCurrentFormattedDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  const updateClient = (updatedClient: Client) => {
    // Update the client with current interaction date
    const clientWithUpdatedInteraction = {
      ...updatedClient,
      lastInteraction: getCurrentFormattedDate()
    };

    setClients(current => {
      const updatedState = { ...current };
      
      if (clientWithUpdatedInteraction.type === 'company') {
        updatedState.companies = current.companies.map(c => 
          c.id === clientWithUpdatedInteraction.id ? clientWithUpdatedInteraction as CompanyClient : c
        );
      } else if (clientWithUpdatedInteraction.type === 'individual') {
        updatedState.individuals = current.individuals.map(c => 
          c.id === clientWithUpdatedInteraction.id ? clientWithUpdatedInteraction as IndividualClient : c
        );
      } else if (clientWithUpdatedInteraction.type === 'vendor') {
        updatedState.vendors = current.vendors.map(c => 
          c.id === clientWithUpdatedInteraction.id ? clientWithUpdatedInteraction as VendorClient : c
        );
      }
      
      return updatedState;
    });
  };

  const addClient = (client: Client) => {
    // Ensure client has a lastInteraction date
    const clientWithInteraction = {
      ...client,
      lastInteraction: getCurrentFormattedDate()
    };

    setClients(current => {
      const updatedState = { ...current };
      
      if (clientWithInteraction.type === 'company') {
        updatedState.companies = [...current.companies, clientWithInteraction as CompanyClient];
      } else if (clientWithInteraction.type === 'individual') {
        updatedState.individuals = [...current.individuals, clientWithInteraction as IndividualClient];
      } else if (clientWithInteraction.type === 'vendor') {
        updatedState.vendors = [...current.vendors, clientWithInteraction as VendorClient];
      }
      
      return updatedState;
    });
  };

  const deleteClient = (clientId: string) => {
    setClients(current => {
      const updatedState = { ...current };
      
      updatedState.companies = current.companies.filter(c => c.id !== clientId);
      updatedState.individuals = current.individuals.filter(c => c.id !== clientId);
      updatedState.vendors = current.vendors.filter(c => c.id !== clientId);
      
      return updatedState;
    });
  };

  const addClientCredit = (clientId: string, amount: number) => {
    if (amount <= 0) return;
    
    // Get current date for lastInteraction
    const currentDate = getCurrentFormattedDate();
    
    setClients(current => {
      const updatedState = { ...current };
      
      // Update company clients
      updatedState.companies = current.companies.map(c => 
        c.id === clientId
          ? { ...c, credit: c.credit + amount, lastInteraction: currentDate } as CompanyClient 
          : c
      );
      
      // Update individual clients
      updatedState.individuals = current.individuals.map(c => 
        c.id === clientId
          ? { ...c, credit: c.credit + amount, lastInteraction: currentDate } as IndividualClient 
          : c
      );
      
      // Update vendor clients
      updatedState.vendors = current.vendors.map(c => 
        c.id === clientId
          ? { ...c, credit: c.credit + amount, lastInteraction: currentDate } as VendorClient 
          : c
      );
      
      return updatedState;
    });
  };

  const getClientById = (clientId: string): Client | null => {
    // Check companies
    const companyClient = clients.companies.find(c => c.id === clientId);
    if (companyClient) return companyClient;
    
    // Check individuals
    const individualClient = clients.individuals.find(c => c.id === clientId);
    if (individualClient) return individualClient;
    
    // Check vendors
    const vendorClient = clients.vendors.find(c => c.id === clientId);
    if (vendorClient) return vendorClient;
    
    return null;
  };

  const value = {
    clients,
    updateClient,
    addClient,
    deleteClient,
    addClientCredit,
    getClientById
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
};

export default ClientContext;
