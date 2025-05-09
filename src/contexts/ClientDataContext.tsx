
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, CompanyClient, IndividualClient, VendorClient, ClientsState } from '@/types/client';
import { getSafeClientData, setSafeClientData } from '@/utils/clientDataPersistence';

interface ClientContextType {
  clients: ClientsState;
  addClient: (client: Client) => boolean;
  updateClient: (client: Client) => boolean;
  deleteClient: (id: string, type: 'company' | 'individual' | 'vendor') => boolean;
  getClientById: (id: string) => Client | undefined;
  loading: boolean;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export const ClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<ClientsState>({ companies: [], individuals: [], vendors: [] });
  const [loading, setLoading] = useState(true);

  // Load clients from localStorage on mount
  useEffect(() => {
    try {
      const savedClients = getSafeClientData();
      setClients(savedClients);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save clients to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      try {
        setSafeClientData(clients);
      } catch (error) {
        console.error('Error saving clients:', error);
      }
    }
  }, [clients, loading]);

  // Add a new client
  const addClient = (client: Client): boolean => {
    try {
      setClients(prevClients => {
        const newClients = { ...prevClients };
        
        switch (client.type) {
          case 'company':
            newClients.companies = [...prevClients.companies, client as CompanyClient];
            break;
          case 'individual':
            newClients.individuals = [...prevClients.individuals, client as IndividualClient];
            break;
          case 'vendor':
            newClients.vendors = [...prevClients.vendors, client as VendorClient];
            break;
          default:
            return prevClients; // No changes if invalid type
        }
        
        return newClients;
      });
      return true;
    } catch (error) {
      console.error('Error adding client:', error);
      return false;
    }
  };

  // Update an existing client
  const updateClient = (updatedClient: Client): boolean => {
    try {
      setClients(prevClients => {
        const newClients = { ...prevClients };
        
        switch (updatedClient.type) {
          case 'company':
            newClients.companies = prevClients.companies.map(c => 
              c.id === updatedClient.id ? updatedClient as CompanyClient : c
            );
            break;
          case 'individual':
            newClients.individuals = prevClients.individuals.map(c => 
              c.id === updatedClient.id ? updatedClient as IndividualClient : c
            );
            break;
          case 'vendor':
            newClients.vendors = prevClients.vendors.map(c => 
              c.id === updatedClient.id ? updatedClient as VendorClient : c
            );
            break;
          default:
            return prevClients; // No changes if invalid type
        }
        
        return newClients;
      });
      return true;
    } catch (error) {
      console.error('Error updating client:', error);
      return false;
    }
  };

  // Delete a client
  const deleteClient = (id: string, type: 'company' | 'individual' | 'vendor'): boolean => {
    try {
      setClients(prevClients => {
        const newClients = { ...prevClients };
        
        switch (type) {
          case 'company':
            newClients.companies = prevClients.companies.filter(c => c.id !== id);
            break;
          case 'individual':
            newClients.individuals = prevClients.individuals.filter(c => c.id !== id);
            break;
          case 'vendor':
            newClients.vendors = prevClients.vendors.filter(c => c.id !== id);
            break;
          default:
            return prevClients; // No changes if invalid type
        }
        
        return newClients;
      });
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      return false;
    }
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

export const useClientData = (): ClientContextType => {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClientData must be used within a ClientProvider');
  }
  return context;
};
