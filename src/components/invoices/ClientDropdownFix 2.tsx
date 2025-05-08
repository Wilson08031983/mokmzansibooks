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
}

/**
 * This component replaces the client dropdown in the QuoteForm and InvoiceForm
 * to correctly show clients created in the Clients page
 */
const ClientDropdownFix: React.FC<ClientDropdownFixProps> = ({ 
  onSelectClient,
  selectedClientId = ""
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
  
  // Load clients from localStorage
  useEffect(() => {
    const loadClients = () => {
      try {
        // Try to get clients from localStorage
        const savedClients = localStorage.getItem('mokClients');
        if (savedClients) {
          const parsedClients = JSON.parse(savedClients);
          setClients({
            companies: Array.isArray(parsedClients.companies) ? parsedClients.companies : [],
            individuals: Array.isArray(parsedClients.individuals) ? parsedClients.individuals : [],
            vendors: Array.isArray(parsedClients.vendors) ? parsedClients.vendors : []
          });
          console.log('Loaded clients from localStorage:', {
            companies: parsedClients.companies?.length || 0,
            individuals: parsedClients.individuals?.length || 0,
            vendors: parsedClients.vendors?.length || 0
          });
        }
      } catch (e) {
        console.error('Error loading clients:', e);
      }
    };
    
    // Load initially
    loadClients();
    
    // Set up interval for periodic reloading
    const intervalId = setInterval(loadClients, 2000);
    
    // Clean up
    return () => clearInterval(intervalId);
  }, []);
  
  const handleSelectChange = (value: string) => {
    onSelectClient(value);
  };
  
  // Count total clients
  const totalClients = 
    (clients.companies?.length || 0) + 
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
              {clients.companies.length > 0 && (
                <SelectGroup>
                  <SelectLabel>Companies</SelectLabel>
                  {clients.companies.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <span>{client.name}</span>
                        {client.contactPerson && (
                          <span className="text-xs text-gray-500 ml-1">({client.contactPerson})</span>
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
                        {client.contactPerson && (
                          <span className="text-xs text-gray-500 ml-1">({client.contactPerson})</span>
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
