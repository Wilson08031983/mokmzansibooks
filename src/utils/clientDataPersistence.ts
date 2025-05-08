
import { ClientsState } from '@/types/client';

/**
 * Safely retrieves client data from localStorage
 * Returns default empty state if not found or invalid
 */
export const getSafeClientData = (): ClientsState => {
  try {
    const clientsString = localStorage.getItem('mokClients');
    if (!clientsString) {
      return { companies: [], individuals: [], vendors: [] };
    }
    
    const clients = JSON.parse(clientsString);
    return {
      companies: Array.isArray(clients.companies) ? clients.companies : [],
      individuals: Array.isArray(clients.individuals) ? clients.individuals : [],
      vendors: Array.isArray(clients.vendors) ? clients.vendors : []
    };
  } catch (error) {
    console.error('Error getting client data from localStorage:', error);
    return { companies: [], individuals: [], vendors: [] };
  }
};
