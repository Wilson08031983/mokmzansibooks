
import React, { useEffect, useState } from 'react';
import { Client } from '@/types/client';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, User, Truck } from "lucide-react";

interface ClientDropdownFixProps {
  onSelectClient: (clientId: string) => void;
  selectedClientId?: string;
  /** When true, company clients won't be shown in the dropdown (for quotes) */
  excludeCompanies?: boolean;
}

/**
 * This component replaces the client dropdown in the QuoteForm and InvoiceForm
 * to correctly show clients created in the Clients page
 */
const ClientDropdownFix: React.FC<ClientDropdownFixProps> = ({ 
  onSelectClient,
  selectedClientId = "",
  excludeCompanies = false
}) => {
  const [clients, setClients] = useState<{
    companies: Client[];
    individuals: Client[];
    vendors: Client[];
  }>({
    companies: [],
    individuals: [],
    vendors: []
  });
  
  // Load clients from multiple storage locations with comprehensive fallback
  useEffect(() => {
    const loadClients = () => {
      try {
        // Try multiple possible storage keys to find client data
        const possibleKeys = [
          'clients',                  // Main key used by clientStorageAdapter
          'CLIENTS',                  // Alternative key
          'clients_backup',           // Backup key used by clientStorageAdapter
          'mok-mzansi-books-clients', // Original key used by this component
          'savedClients',             // Another possible legacy key
          'clientsData'               // Another possible legacy key
        ];
        
        // First try to load structured client state (with companies, individuals, vendors)
        for (const key of possibleKeys) {
          const savedData = localStorage.getItem(key);
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              
              // Check if data has the expected structure with companies, individuals, vendors
              if (parsedData && 
                  (Array.isArray(parsedData.companies) || 
                   Array.isArray(parsedData.individuals) || 
                   Array.isArray(parsedData.vendors))) {
                
                // Set up default empty arrays to avoid undefined errors
                const companiesArray = Array.isArray(parsedData.companies) ? parsedData.companies : [];
                const individualsArray = Array.isArray(parsedData.individuals) ? parsedData.individuals : [];
                const vendorsArray = Array.isArray(parsedData.vendors) ? parsedData.vendors : [];
                
                // Ensure we're not setting undefined values
                setClients({
                  companies: companiesArray,
                  individuals: individualsArray,
                  vendors: vendorsArray
                });
                
                console.log(`Loaded clients from localStorage key '${key}':`, {
                  companies: companiesArray.length,
                  individuals: individualsArray.length,
                  vendors: vendorsArray.length
                });
                
                // Successfully loaded data, no need to check other keys
                return;
              }
              
              // Check if data is an array of clients (old format)
              if (Array.isArray(parsedData) && parsedData.length > 0) {
                // Categorize clients by type
                const companies: Client[] = [];
                const individuals: Client[] = [];
                const vendors: Client[] = [];
                
                parsedData.forEach((client: any) => {
                  if (client.type === 'company') {
                    companies.push(client);
                  } else if (client.type === 'individual') {
                    individuals.push(client);
                  } else if (client.type === 'vendor') {
                    vendors.push(client);
                  }
                });
                
                setClients({
                  companies,
                  individuals,
                  vendors
                });
                
                console.log(`Loaded clients from flat array in localStorage key '${key}':`, {
                  companies: companies.length,
                  individuals: individuals.length,
                  vendors: vendors.length
                });
                
                // Successfully loaded data, no need to check other keys
                return;
              }
            } catch (parseError) {
              console.error(`Error parsing client data from key '${key}':`, parseError);
              // Continue to next key
            }
          }
        }
        
        // If we get here, no valid client data was found
        console.log('No valid client data found in any storage location');
        setClients({
          companies: [],
          individuals: [],
          vendors: []
        });
      } catch (e) {
        console.error('Error loading clients:', e);
        // On error, ensure we have empty arrays rather than undefined
        setClients({
          companies: [],
          individuals: [],
          vendors: []
        });
      }
    };
    
    // Load initially
    loadClients();
    
    // Set up interval for periodic reloading (every 3 seconds rather than 2)
    const intervalId = setInterval(loadClients, 3000);
    
    // Clean up
    return () => clearInterval(intervalId);
  }, []);
  
  const handleSelectChange = (value: string) => {
    console.log('ClientDropdownFix: Selected client ID:', value);
    // Ensure we're passing a valid client ID
    if (value && typeof value === 'string') {
      // Find the client in our local state to verify it exists
      const allClients = [
        ...clients.companies,
        ...clients.individuals,
        ...clients.vendors
      ];
      
      const selectedClient = allClients.find(client => client.id === value);
      if (selectedClient) {
        console.log('ClientDropdownFix: Found client:', selectedClient.name);
      } else {
        console.warn('ClientDropdownFix: Selected client ID not found in local state:', value);
      }
      
      // Call the parent component's handler with the selected client ID
      onSelectClient(value);
    } else {
      console.error('ClientDropdownFix: Invalid client ID selected:', value);
    }
  };
  
  // Count total clients - exclude companies if needed
  const totalClients = 
    (excludeCompanies ? 0 : (clients.companies?.length || 0)) + 
    (clients.individuals?.length || 0) + 
    (clients.vendors?.length || 0);
  
  return (
    <div className="relative">
      <Select 
        value={selectedClientId} 
        onValueChange={handleSelectChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {totalClients > 0 ? (
            <>
              {!excludeCompanies && clients.companies.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Companies</SelectLabel>
                  {clients.companies.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <span>{client.name}</span>
                        {client.hasOwnProperty('contactPerson') && (
                          <span className="text-xs text-gray-500 ml-1">({(client as any).contactPerson})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              
              {clients.individuals.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Individuals</SelectLabel>
                  {clients.individuals.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-500" />
                        <span>{client.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
              
              {clients.vendors.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Vendors</SelectLabel>
                  {clients.vendors.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-orange-500" />
                        <span>{client.name}</span>
                        {client.hasOwnProperty('contactPerson') && (
                          <span className="text-xs text-gray-500 ml-1">({(client as any).contactPerson})</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              )}
            </>
          ) : (
            <div className="p-4 text-center">
              <div className="text-gray-500 mb-2">No clients found</div>
              <div className="text-sm text-gray-400">Please add clients in the Clients page first</div>
            </div>
          )}
        </SelectContent>
      </Select>
      
      <div className="mt-1 text-xs text-right text-gray-500">
        {totalClients > 0 ? 
          `${totalClients} client${totalClients > 1 ? 's' : ''} available` : 
          'No clients found'
        }
      </div>
    </div>
  );
};

export default ClientDropdownFix;
