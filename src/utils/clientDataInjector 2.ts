/**
 * This utility ensures that specific clients (like Ryzen PTY LTD) are always
 * available in the client list for quotes and invoices.
 */
import { Client } from '@/types/client';

// Client that should always be available
export const ryzenClient: Client = {
  id: "ryzen-client", 
  name: "Ryzen (PTY) LTD", 
  address: "12 Mark Str", 
  email: "them@ryzen.com", 
  phone: "0762458759", 
  type: "company" as const,
  city: "Tshwane",
  province: "Gauteng",
  postalCode: "0006",
  credit: 3000,
  outstanding: 0,
  overdue: 0,
  contactPerson: "Tom Mark"
};

/**
 * Ensures the specified client is added to localStorage
 */
export function injectClient(client: Client): void {
  try {
    // Try to update mokClients
    const savedClients = localStorage.getItem('mokClients');
    if (savedClients) {
      const parsedClients = JSON.parse(savedClients);
      
      // Add client to the appropriate array based on type
      const typeArray = `${client.type}s`; // companies, individuals, vendors
      if (!Array.isArray(parsedClients[typeArray])) {
        parsedClients[typeArray] = [];
      }
      
      // Check if client already exists
      if (!parsedClients[typeArray].some((c: Client) => c.id === client.id)) {
        // Add client
        parsedClients[typeArray].push(client);
        
        // Update mokClients in localStorage
        localStorage.setItem('mokClients', JSON.stringify(parsedClients));
        console.log(`Added ${client.name} to mokClients`);
      }
    } else {
      // If mokClients doesn't exist, create it with the client
      const newClientsData: Record<string, Client[]> = {
        companies: [],
        individuals: [],
        vendors: []
      };
      newClientsData[`${client.type}s`].push(client);
      localStorage.setItem('mokClients', JSON.stringify(newClientsData));
      console.log(`Created mokClients with ${client.name}`);
    }
    
    // Also set the selectedClientForInvoice
    localStorage.setItem('selectedClientForInvoice', JSON.stringify(client));
  } catch (error) {
    console.error('Error injecting client:', error);
  }
}

/**
 * Ensures Ryzen client is available in localStorage
 */
export function injectRyzenClient(): void {
  injectClient(ryzenClient);
}
