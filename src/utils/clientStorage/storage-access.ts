
/**
 * Low-level storage access functions for client data
 */

import permanentStorage, { StorageNamespace } from '../permanentStorage';
import { ClientsState } from '@/types/client';
import { DEFAULT_CLIENTS_STATE } from './types';

/**
 * Ensure permanent storage is initialized
 */
export const ensurePermanentStorageReady = async (): Promise<boolean> => {
  if (!permanentStorage.isReady()) {
    return await permanentStorage.waitUntilReady(2000);
  }
  return true;
};

/**
 * Load data from permanent storage
 */
export const loadFromPermanentStorage = async (): Promise<ClientsState | null> => {
  try {
    await ensurePermanentStorageReady();
    return await permanentStorage.loadData<ClientsState>(StorageNamespace.CLIENTS);
  } catch (error) {
    console.error('Error loading from permanent storage:', error);
    return null;
  }
};

/**
 * Save data to permanent storage
 */
export const saveToPermanentStorage = async (data: ClientsState): Promise<boolean> => {
  try {
    await ensurePermanentStorageReady();
    return await permanentStorage.saveData(StorageNamespace.CLIENTS, data);
  } catch (error) {
    console.error('Error saving to permanent storage:', error);
    return false;
  }
};

/**
 * Load data from local storage with specified key
 */
export const loadFromLocalStorage = (key: string): ClientsState | null => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    const parsedData = JSON.parse(data) as ClientsState;
    return normalizeClientData(parsedData);
  } catch (error) {
    console.warn(`Error loading from localStorage (${key}):`, error);
    return null;
  }
};

/**
 * Save data to local storage with specified key
 */
export const saveToLocalStorage = (key: string, data: ClientsState): boolean => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    return false;
  }
};

/**
 * Normalize client data structure to ensure it's valid
 */
export const normalizeClientData = (data: any): ClientsState => {
  if (!data) return DEFAULT_CLIENTS_STATE;
  
  return {
    companies: Array.isArray(data.companies) ? data.companies : [],
    individuals: Array.isArray(data.individuals) ? data.individuals : [],
    vendors: Array.isArray(data.vendors) ? data.vendors : []
  };
};
