
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, ClientsState } from '@/types/client';

// Define the context shape
interface ClientDataContextType {
  clients: ClientsState;
  setClients: React.Dispatch<React.SetStateAction<ClientsState>>;
  loading: boolean;
  restoreFromBackup: () => boolean;
}

// Create the context
const ClientDataContext = createContext<ClientDataContextType | undefined>(undefined);

// Default state for clients
const defaultState: ClientsState = {
  companies: [],
  individuals: [],
  vendors: []
};

// Safe getter for client data 
function getSafeClientData(): ClientsState {
  try {
    const clientData = localStorage.getItem('mokClients');
    if (!clientData) return defaultState;
    
    const parsedData = JSON.parse(clientData) as ClientsState;
    return {
      companies: Array.isArray(parsedData.companies) ? parsedData.companies : [],
      individuals: Array.isArray(parsedData.individuals) ? parsedData.individuals : [],
      vendors: Array.isArray(parsedData.vendors) ? parsedData.vendors : []
    };
  } catch (error) {
    console.error('Error getting safe client data:', error);
    return defaultState;
  }
}

// Safe setter for client data
function setSafeClientData(data: ClientsState): boolean {
  try {
    // Validate data structure
    if (!data || typeof data !== 'object') return false;
    if (!Array.isArray(data.companies) || !Array.isArray(data.individuals) || !Array.isArray(data.vendors)) {
      return false;
    }
    
    // Save data and create backup
    localStorage.setItem('mokClients', JSON.stringify(data));
    createClientDataBackup();
    return true;
  } catch (error) {
    console.error('Error setting client data safely:', error);
    return false;
  }
}

// Create a backup of the current client data
function createClientDataBackup(): boolean {
  try {
    const clientData = localStorage.getItem('mokClients');
    if (!clientData) return false;
    
    // Validate data before backup
    try {
      JSON.parse(clientData);
    } catch {
      console.error('Invalid client data found, not backing up');
      return false;
    }
    
    // Store the backup
    localStorage.setItem('mokClientsBackup', clientData);
    
    // Also store to sessionStorage as another layer of protection
    sessionStorage.setItem('mokClientsBackup', clientData);
    
    return true;
  } catch (error) {
    console.error('Error creating client data backup:', error);
    return false;
  }
}

// Restore client data from backup
function restoreClientDataFromBackup(): boolean {
  try {
    // Try localStorage backup first
    let backup = localStorage.getItem('mokClientsBackup');
    
    // If not found, try sessionStorage
    if (!backup) {
      backup = sessionStorage.getItem('mokClientsBackup');
    }
    
    if (!backup) return false;
    
    // Validate backup data
    try {
      JSON.parse(backup);
    } catch {
      console.error('Invalid backup data found');
      return false;
    }
    
    // Restore from backup
    localStorage.setItem('mokClients', backup);
    return true;
  } catch (error) {
    console.error('Error restoring client data from backup:', error);
    return false;
  }
}

export const ClientDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state
  const [clients, setClients] = useState<ClientsState>(defaultState);
  const [loading, setLoading] = useState(true);

  // Load clients on mount
  useEffect(() => {
    try {
      const data = getSafeClientData();
      setClients(data);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save clients when they change
  useEffect(() => {
    if (!loading) {
      try {
        const result = setSafeClientData(clients);
        if (!result) {
          console.error('Error saving clients to localStorage');
        }
      } catch (error) {
        console.error('Error saving clients:', error);
      }
    }
  }, [clients, loading]);

  // Function to restore from backup
  const restoreFromBackup = (): boolean => {
    try {
      const restored = restoreClientDataFromBackup();
      if (restored) {
        // Reload the data
        const data = getSafeClientData();
        setClients(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in restore operation:', error);
      return false;
    }
  };

  return (
    <ClientDataContext.Provider
      value={{
        clients,
        setClients,
        loading,
        restoreFromBackup
      }}
    >
      {children}
    </ClientDataContext.Provider>
  );
};

export const useClientData = (): ClientDataContextType => {
  const context = useContext(ClientDataContext);
  if (!context) {
    throw new Error('useClientData must be used within a ClientDataProvider');
  }
  return context;
};
