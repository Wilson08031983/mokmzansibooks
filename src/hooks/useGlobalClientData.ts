/**
 * Hook for accessing client data throughout the application
 * This provides a consistent way to access client information
 * from any component without direct dependency on the Clients page
 */

import { useState, useEffect } from 'react';
import { Client, CompanyClient, IndividualClient, VendorClient, ClientsState } from '@/types/client';

// Default empty state
const defaultClientsState: ClientsState = {
  companies: [],
  individuals: [],
  vendors: []
};

/**
 * Safe getter for client data 
 */
function getSafeClientData(): ClientsState {
  try {
    const clientData = localStorage.getItem('mokClients');
    if (!clientData) return defaultClientsState;
    
    const parsedData = JSON.parse(clientData) as ClientsState;
    return {
      companies: Array.isArray(parsedData.companies) ? parsedData.companies : [],
      individuals: Array.isArray(parsedData.individuals) ? parsedData.individuals : [],
      vendors: Array.isArray(parsedData.vendors) ? parsedData.vendors : []
    };
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
  const [clientsData, setClientsData] = useState<ClientsState>(() => getSafeClientData());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasData, setHasData] = useState<boolean>(false);
  const [allClients, setAllClients] = useState<Client[]>([]);

  // Load initial data
  useEffect(() => {
    try {
      setIsLoading(true);
      const data = getSafeClientData();
      setClientsData(data);
      setHasData(data.companies.length > 0 || data.individuals.length > 0 || data.vendors.length > 0);
      setAllClients([
        ...data.companies,
        ...data.individuals,
        ...data.vendors
      ]);
    } catch (error) {
      console.error('Error loading global client data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set up a listener for changes to client data in localStorage
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'mokClients' && event.newValue) {
        try {
          const newData = JSON.parse(event.newValue) as ClientsState;
          setClientsData(newData);
          setHasData(newData.companies.length > 0 || newData.individuals.length > 0 || newData.vendors.length > 0);
          setAllClients([
            ...newData.companies,
            ...newData.individuals,
            ...newData.vendors
          ]);
        } catch (error) {
          console.error('Error parsing updated client data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Helper function to find a client by ID
  const findClientById = (id: string): Client | undefined => {
    return allClients.find(client => client.id === id);
  };

  // Helper function to get company clients only
  const getCompanyClients = (): CompanyClient[] => {
    return [...clientsData.companies];
  };

  // Helper function to get individual clients only
  const getIndividualClients = (): IndividualClient[] => {
    return [...clientsData.individuals];
  };

  // Helper function to get vendor clients only
  const getVendorClients = (): VendorClient[] => {
    return [...clientsData.vendors];
  };

  // Helper function to get clients with outstanding balances
  const getClientsWithOutstanding = (): Client[] => {
    return allClients.filter(client => (client.outstanding || 0) > 0);
  };

  // Helper function to get clients with overdue payments
  const getClientsWithOverdue = (): Client[] => {
    return allClients.filter(client => (client.overdue || 0) > 0);
  };

  return {
    allClients,
    companies: clientsData.companies,
    individuals: clientsData.individuals,
    vendors: clientsData.vendors,
    isLoading,
    hasData,
    totalClients: allClients.length,
    companyCount: clientsData.companies.length,
    individualCount: clientsData.individuals.length,
    vendorCount: clientsData.vendors.length,
    findClientById,
    getCompanyClients,
    getIndividualClients,
    getVendorClients,
    getClientsWithOutstanding,
    getClientsWithOverdue
  };
};

export default useGlobalClientData;
