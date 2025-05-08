
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClientsData, ClientsState } from '@/types/client';
import { syncClientData, loadClientsFromSupabase } from '@/integrations/supabase/clientOperations';

interface ClientContextType {
  clients: ClientsState;
  loading: boolean;
  error: Error | null;
  refreshClients: () => Promise<void>;
}

const defaultState: ClientsState = {
  companies: [],
  individuals: [],
  vendors: [],
};

const ClientContext = createContext<ClientContextType>({
  clients: defaultState,
  loading: true,
  error: null,
  refreshClients: async () => {},
});

export const useClients = () => useContext(ClientContext);

export const ClientProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [clients, setClients] = useState<ClientsState>(defaultState);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Load clients on mount
  const loadClients = async () => {
    try {
      setLoading(true);
      
      // Try to load from Supabase (falls back to localStorage)
      const loadedClients = await loadClientsFromSupabase();
      
      // If clients were found, use them
      if (loadedClients) {
        console.log('Clients loaded:', {
          companies: loadedClients.companies.length,
          individuals: loadedClients.individuals.length,
          vendors: loadedClients.vendors.length
        });
        setClients(loadedClients);
      } else {
        console.log('No clients found, using default state');
        setClients(defaultState);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError(err instanceof Error ? err : new Error('Failed to load clients'));
    } finally {
      setLoading(false);
    }
  };

  // Sync client data
  const syncClients = async () => {
    try {
      await syncClientData();
      await loadClients();
    } catch (err) {
      console.error('Error syncing clients:', err);
      setError(err instanceof Error ? err : new Error('Failed to sync clients'));
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <ClientContext.Provider value={{
      clients,
      loading,
      error,
      refreshClients: syncClients
    }}>
      {children}
    </ClientContext.Provider>
  );
};
