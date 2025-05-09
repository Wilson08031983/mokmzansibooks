
import { Client, CompanyClient, IndividualClient, VendorClient, ClientsState } from '@/types/client';

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

/**
 * Saves client data to localStorage
 */
export const setSafeClientData = (data: ClientsState): void => {
  try {
    localStorage.setItem('mokClients', JSON.stringify(data));
  } catch (error) {
    console.error('Error saving client data to localStorage:', error);
  }
};

/**
 * Creates a backup of client data
 */
export const createClientDataBackup = (): string => {
  try {
    const currentData = getSafeClientData();
    const backupData = JSON.stringify(currentData);
    localStorage.setItem('mokClientsBackup', backupData);
    return backupData;
  } catch (error) {
    console.error('Error creating client data backup:', error);
    return '';
  }
};

/**
 * Restores client data from backup
 */
export const restoreClientDataFromBackup = (): boolean => {
  try {
    const backupData = localStorage.getItem('mokClientsBackup');
    if (!backupData) return false;
    
    const parsedData = JSON.parse(backupData) as ClientsState;
    setSafeClientData(parsedData);
    return true;
  } catch (error) {
    console.error('Error restoring client data from backup:', error);
    return false;
  }
};
