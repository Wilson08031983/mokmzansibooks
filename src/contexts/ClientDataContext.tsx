
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, ClientsState } from '@/types/client';
import { getSafeClientData, setSafeClientData, restoreClientDataFromBackup } from '@/utils/clientDataPersistence';

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
