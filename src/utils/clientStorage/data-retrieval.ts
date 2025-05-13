
/**
 * Client data retrieval with multi-layer fallback system
 */

import { ClientsState } from '@/types/client';
import { StorageNamespace } from '../permanentStorage';
import { ClientStorageResult, DEFAULT_CLIENTS_STATE } from './types';
import { LEGACY_STORAGE_KEYS, BACKUP_STORAGE_KEYS } from './storage-keys';
import { 
  loadFromPermanentStorage, 
  loadFromLocalStorage, 
  saveToPermanentStorage,
  normalizeClientData 
} from './storage-access';

/**
 * Check if clients data has content
 */
const hasClientData = (data: ClientsState): boolean => {
  return (
    data.companies?.length > 0 || 
    data.individuals?.length > 0 || 
    data.vendors?.length > 0
  );
};

/**
 * Get clients data with multi-layer fallback system
 */
export const getClientsData = async (): Promise<ClientStorageResult> => {
  try {
    // Try to get from permanent storage
    const storedData = await loadFromPermanentStorage();
    
    if (storedData && hasClientData(storedData)) {
      console.log('Client data loaded from permanent storage:', {
        companies: storedData.companies?.length || 0,
        individuals: storedData.individuals?.length || 0,
        vendors: storedData.vendors?.length || 0
      });
      return { success: true, data: storedData };
    }
    
    // Try legacy storage keys in order
    for (const key of LEGACY_STORAGE_KEYS) {
      const legacyData = loadFromLocalStorage(key);
      if (legacyData && hasClientData(legacyData)) {
        console.log(`Client data loaded from legacy storage (${key}):`, {
          companies: legacyData.companies?.length || 0,
          individuals: legacyData.individuals?.length || 0,
          vendors: legacyData.vendors?.length || 0
        });
        
        // Save to permanent storage for next time
        saveToPermanentStorage(legacyData);
        
        return { success: true, data: legacyData };
      }
    }
    
    // Try backup storage keys
    for (const key of BACKUP_STORAGE_KEYS) {
      const backupData = loadFromLocalStorage(key);
      if (backupData && hasClientData(backupData)) {
        console.log(`Client data loaded from backup storage (${key})`);
        
        // Save to permanent storage for next time
        saveToPermanentStorage(backupData);
        
        return { success: true, data: backupData };
      }
    }
    
    // Return default if nothing found
    return { success: true, data: DEFAULT_CLIENTS_STATE };
  } catch (error) {
    console.error('Error getting client data:', error);
    return { 
      success: false, 
      data: DEFAULT_CLIENTS_STATE, 
      error: error instanceof Error ? error : new Error('Unknown error getting client data') 
    };
  }
};

/**
 * Check if there are any clients saved
 */
export const hasClients = async (): Promise<boolean> => {
  try {
    // Check permanent storage
    const storedData = await loadFromPermanentStorage();
    if (storedData && hasClientData(storedData)) {
      return true;
    }
    
    // Check legacy storage
    for (const key of LEGACY_STORAGE_KEYS) {
      const legacyData = loadFromLocalStorage(key);
      if (legacyData && hasClientData(legacyData)) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking if clients exist:', error);
    return false;
  }
};
