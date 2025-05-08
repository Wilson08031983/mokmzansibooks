import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Client, CompanyClient, IndividualClient, VendorClient } from '@/types/client';
import { ClientsState, getSafeClientData, setSafeClientData } from '@/utils/clientDataPersistence';
import { validateClient, sanitizeClient, preventRenderingErrors } from '@/utils/clientErrorPrevention';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from './NotificationsContext';

// Define the context interface
interface ClientDataContextType {
  // Client data
  clients: ClientsState;
  setClients: React.Dispatch<React.SetStateAction<ClientsState>>;
  
  // Client operations
  addClient: (client: Client) => boolean;
  updateClient: (client: Client) => boolean;
  deleteClient: (clientId: string) => boolean;
  
  // Client credit operations
  addCredit: (clientId: string, amount: number) => boolean;
  
  // Client counts
  getTotalClientCount: () => number;
  getCompanyCount: () => number;
  getIndividualCount: () => number;
  getVendorCount: () => number;
  
  // Data operations
  saveClientData: () => boolean;
  loadClientData: () => boolean;
  
  // State flags
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string;
}

// Create the context
const ClientDataContext = createContext<ClientDataContextType | undefined>(undefined);

// Provider component
export const ClientDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for client data
  const [clients, setClients] = useState<ClientsState>({
    companies: [],
    individuals: [],
    vendors: []
  });
  
  // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Hooks for notifications
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  
  // Load client data on mount
  useEffect(() => {
    loadClientData();
  }, []);
  
  // Save client data whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveClientData();
    }
  }, [clients]);
  
  // Function to load client data
  const loadClientData = (): boolean => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      const data = getSafeClientData();
      
      // Apply error prevention to ensure data is safe for rendering
      const sanitizedData = preventRenderingErrors(data);
      
      setClients(sanitizedData);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error loading client data:', error);
      setHasError(true);
      setErrorMessage('Failed to load client data');
      setIsLoading(false);
      return false;
    }
  };
  
  // Function to save client data
  const saveClientData = (): boolean => {
    try {
      // Apply error prevention before saving
      const sanitizedData = preventRenderingErrors(clients);
      
      const success = setSafeClientData(sanitizedData);
      
      if (!success) {
        setHasError(true);
        setErrorMessage('Failed to save client data');
      }
      
      return success;
    } catch (error) {
      console.error('Error saving client data:', error);
      setHasError(true);
      setErrorMessage('Failed to save client data');
      return false;
    }
  };
  
  // Function to add a new client
  const addClient = (client: Client): boolean => {
    // Validate client data
    const validation = validateClient(client);
    if (!validation.isValid) {
      setHasError(true);
      setErrorMessage(`Invalid client data: ${validation.errors.join(', ')}`);
      return false;
    }
    
    // Sanitize client data to prevent errors
    const sanitizedClient = sanitizeClient(client);
    
    try {
      setClients(prevClients => {
        // Create a new state object to ensure React detects the change
        const newState = { ...prevClients };
        
        // Add client to the appropriate array based on type
        switch (sanitizedClient.type) {
          case 'company':
            newState.companies = [...newState.companies, sanitizedClient as CompanyClient];
            break;
          case 'individual':
            newState.individuals = [...newState.individuals, sanitizedClient as IndividualClient];
            break;
          case 'vendor':
            newState.vendors = [...newState.vendors, sanitizedClient as VendorClient];
            break;
        }
        
        return newState;
      });
      
      return true;
    } catch (error) {
      console.error('Error adding client:', error);
      setHasError(true);
      setErrorMessage('Failed to add client');
      return false;
    }
  };
  
  // Function to update an existing client
  const updateClient = (client: Client): boolean => {
    // Validate client data
    const validation = validateClient(client);
    if (!validation.isValid) {
      setHasError(true);
      setErrorMessage(`Invalid client data: ${validation.errors.join(', ')}`);
      return false;
    }
    
    // Sanitize client data to prevent errors
    const sanitizedClient = sanitizeClient(client);
    
    try {
      setClients(prevClients => {
        // Create a new state object to ensure React detects the change
        const newState = { ...prevClients };
        
        // Update client in the appropriate array based on type
        switch (sanitizedClient.type) {
          case 'company':
            newState.companies = newState.companies.map(c => 
              c.id === sanitizedClient.id ? sanitizedClient as CompanyClient : c
            );
            break;
          case 'individual':
            newState.individuals = newState.individuals.map(c => 
              c.id === sanitizedClient.id ? sanitizedClient as IndividualClient : c
            );
            break;
          case 'vendor':
            newState.vendors = newState.vendors.map(c => 
              c.id === sanitizedClient.id ? sanitizedClient as VendorClient : c
            );
            break;
        }
        
        return newState;
      });
      
      return true;
    } catch (error) {
      console.error('Error updating client:', error);
      setHasError(true);
      setErrorMessage('Failed to update client');
      return false;
    }
  };
  
  // Function to delete a client
  const deleteClient = (clientId: string): boolean => {
    try {
      setClients(prevClients => {
        // Create a new state object to ensure React detects the change
        return {
          companies: prevClients.companies.filter(c => c.id !== clientId),
          individuals: prevClients.individuals.filter(c => c.id !== clientId),
          vendors: prevClients.vendors.filter(c => c.id !== clientId)
        };
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting client:', error);
      setHasError(true);
      setErrorMessage('Failed to delete client');
      return false;
    }
  };
  
  // Function to add credit to a client
  const addCredit = (clientId: string, amount: number): boolean => {
    if (!amount || amount <= 0) {
      setHasError(true);
      setErrorMessage('Credit amount must be greater than zero');
      return false;
    }
    
    try {
      let clientFound = false;
      
      setClients(prevClients => {
        // Create a new state object to ensure React detects the change
        const newState = { ...prevClients };
        
        // Update client credit in all arrays (client could be in any of them)
        ['companies', 'individuals', 'vendors'].forEach(type => {
          newState[type] = newState[type].map(c => {
            if (c.id === clientId) {
              clientFound = true;
              return {
                ...c,
                credit: (c.credit || 0) + amount
              };
            }
            return c;
          });
        });
        
        return newState;
      });
      
      if (!clientFound) {
        setHasError(true);
        setErrorMessage('Client not found');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error adding credit:', error);
      setHasError(true);
      setErrorMessage('Failed to add credit');
      return false;
    }
  };
  
  // Helper functions for client counts
  const getTotalClientCount = (): number => {
    return clients.companies.length + clients.individuals.length + clients.vendors.length;
  };
  
  const getCompanyCount = (): number => {
    return clients.companies.length;
  };
  
  const getIndividualCount = (): number => {
    return clients.individuals.length;
  };
  
  const getVendorCount = (): number => {
    return clients.vendors.length;
  };
  
  // Context value
  const contextValue: ClientDataContextType = {
    clients,
    setClients,
    addClient,
    updateClient,
    deleteClient,
    addCredit,
    getTotalClientCount,
    getCompanyCount,
    getIndividualCount,
    getVendorCount,
    saveClientData,
    loadClientData,
    isLoading,
    hasError,
    errorMessage
  };
  
  return (
    <ClientDataContext.Provider value={contextValue}>
      {children}
    </ClientDataContext.Provider>
  );
};

// Custom hook to use the client data context
export const useClientData = () => {
  const context = useContext(ClientDataContext);
  
  if (context === undefined) {
    throw new Error('useClientData must be used within a ClientDataProvider');
  }
  
  return context;
};
