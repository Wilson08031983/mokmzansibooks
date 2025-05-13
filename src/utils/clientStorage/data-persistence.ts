
/**
 * Client data persistence with guaranteed storage
 */

import { ClientsState } from '@/types/client';
import { ClientOperationResult } from './types';
import { PRIMARY_STORAGE_KEY, BACKUP_STORAGE_KEYS } from './storage-keys';
import { saveToPermanentStorage, saveToLocalStorage } from './storage-access';

/**
 * Save clients data with guaranteed persistence across multiple storage mechanisms
 */
export const saveClientsData = async (clientsData: ClientsState): Promise<ClientOperationResult> => {
  try {
    // Ensure data is properly structured
    if (!clientsData || typeof clientsData !== 'object') {
      return { 
        success: false, 
        error: new Error('Invalid client data format') 
      };
    }

    let savedSuccessfully = false;
    let lastError: Error | undefined;
    
    // 1. Save to permanent storage
    const permanentResult = await saveToPermanentStorage(clientsData);
    savedSuccessfully = permanentResult;
    
    // 2. Save to primary localStorage key
    const primaryResult = saveToLocalStorage(PRIMARY_STORAGE_KEY, clientsData);
    if (primaryResult) {
      savedSuccessfully = true;
    }
    
    // 3. Save to backup localStorage keys
    for (const key of BACKUP_STORAGE_KEYS) {
      const backupResult = saveToLocalStorage(key, clientsData);
      if (backupResult) {
        savedSuccessfully = true;
      }
    }
    
    if (savedSuccessfully) {
      console.log('Client data saved successfully');
      return { success: true };
    } else {
      throw new Error('Failed to save to any storage mechanism');
    }
  } catch (error) {
    console.error('Error saving client data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error saving client data') 
    };
  }
};
