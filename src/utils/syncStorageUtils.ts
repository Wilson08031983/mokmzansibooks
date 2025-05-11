/**
 * Sync Storage Utilities
 * 
 * This module connects the SuperPersistentStorage system with the SyncContext
 * to provide visual feedback when data is being saved or loaded.
 */

import superPersistentStorage, { DataCategory } from './superPersistentStorage';
import { SyncStatus } from '../components/shared/SyncIndicator';

// Save operation type
type SaveFunction = typeof superPersistentStorage.save;
type LoadFunction = typeof superPersistentStorage.load;

// Define the sync callbacks interface
export interface SyncCallbacks {
  onSyncStart?: (message?: string) => void;
  onSyncSuccess?: (message?: string) => void;
  onSyncError?: (message?: string) => void;
}

// Global sync callbacks that can be set from anywhere
let globalSyncCallbacks: SyncCallbacks = {};

/**
 * Set global sync callbacks that will be used by all sync operations
 */
export const setGlobalSyncCallbacks = (callbacks: SyncCallbacks) => {
  globalSyncCallbacks = { ...callbacks };
  console.log('SyncStorageUtils: Global sync callbacks set');
};

/**
 * Save data with sync indicators
 */
export const saveWithSync = async <T>(
  category: DataCategory,
  data: T,
  customCallbacks?: SyncCallbacks
): Promise<boolean> => {
  // Combine global and custom callbacks
  const callbacks = { ...globalSyncCallbacks, ...customCallbacks };
  
  // Get category name for better messages
  let categoryName = 'unknown';
  try {
    if (category !== undefined && DataCategory[category] !== undefined) {
      categoryName = DataCategory[category].toLowerCase();
    } else {
      // Fallback to using the category value directly if possible
      categoryName = typeof category === 'string' ? category.toLowerCase() : 
                    (typeof category === 'number' ? `category_${category}` : 'unknown');
      console.warn(`SyncStorageUtils: Could not find category name for ${String(category)}, using fallback: ${categoryName}`);
    }
  } catch (e) {
    console.warn(`SyncStorageUtils: Error getting category name for ${String(category)}`, e);
  }
  
  try {
    // Show syncing status
    callbacks.onSyncStart?.(`Saving ${categoryName}...`);
    
    // Perform the save operation
    const result = await superPersistentStorage.save(category, data);
    
    // Show success or error based on result
    if (result) {
      callbacks.onSyncSuccess?.(`${categoryName} saved successfully`);
    } else {
      callbacks.onSyncError?.(`Some storage mechanisms failed when saving ${categoryName}`);
    }
    
    return result;
  } catch (error) {
    console.error(`SyncStorageUtils: Error saving ${categoryName}`, error);
    callbacks.onSyncError?.(`Error saving ${categoryName}`);
    return false;
  }
};

/**
 * Load data with sync indicators
 */
export const loadWithSync = async <T>(
  category: DataCategory,
  customCallbacks?: SyncCallbacks
): Promise<T | null> => {
  // Combine global and custom callbacks
  const callbacks = { ...globalSyncCallbacks, ...customCallbacks };
  
  // Get category name for better messages
  let categoryName = 'unknown';
  try {
    if (category !== undefined && DataCategory[category] !== undefined) {
      categoryName = DataCategory[category].toLowerCase();
    } else {
      // Fallback to using the category value directly if possible
      categoryName = typeof category === 'string' ? category.toLowerCase() : 
                    (typeof category === 'number' ? `category_${category}` : 'unknown');
      console.warn(`SyncStorageUtils: Could not find category name for ${String(category)}, using fallback: ${categoryName}`);
    }
  } catch (e) {
    console.warn(`SyncStorageUtils: Error getting category name for ${String(category)}`, e);
  }
  
  try {
    // Show syncing status
    callbacks.onSyncStart?.(`Loading ${categoryName}...`);
    
    // Perform the load operation
    const result = await superPersistentStorage.load<T>(category);
    
    // Show success
    callbacks.onSyncSuccess?.(`${categoryName} loaded successfully`);
    
    return result;
  } catch (error) {
    console.error(`SyncStorageUtils: Error loading ${categoryName}`, error);
    callbacks.onSyncError?.(`Error loading ${categoryName}`);
    return null;
  }
};

/**
 * Create a wrapper around storage adapters to automatically show sync status
 * This can be used to enhance existing storage adapters without modifying them directly
 */
export const createSyncStorageWrapper = <T, U = T>(
  saveFunction: (data: U) => Promise<boolean>,
  loadFunction: () => Promise<T>,
  entityName: string
) => {
  return {
    save: async (data: U, customCallbacks?: SyncCallbacks): Promise<boolean> => {
      // Combine global and custom callbacks
      const callbacks = { ...globalSyncCallbacks, ...customCallbacks };
      
      try {
        // Show syncing status
        callbacks.onSyncStart?.(`Saving ${entityName}...`);
        
        // Perform the save operation
        const result = await saveFunction(data);
        
        // Show success or error based on result
        if (result) {
          callbacks.onSyncSuccess?.(`${entityName} saved successfully`);
        } else {
          callbacks.onSyncError?.(`Some storage mechanisms failed when saving ${entityName}`);
        }
        
        return result;
      } catch (error) {
        console.error(`SyncStorageUtils: Error saving ${entityName}`, error);
        callbacks.onSyncError?.(`Error saving ${entityName}`);
        return false;
      }
    },
    
    load: async (customCallbacks?: SyncCallbacks): Promise<T> => {
      // Combine global and custom callbacks
      const callbacks = { ...globalSyncCallbacks, ...customCallbacks };
      
      try {
        // Show syncing status
        callbacks.onSyncStart?.(`Loading ${entityName}...`);
        
        // Perform the load operation
        const result = await loadFunction();
        
        // Show success
        callbacks.onSyncSuccess?.(`${entityName} loaded successfully`);
        
        return result;
      } catch (error) {
        console.error(`SyncStorageUtils: Error loading ${entityName}`, error);
        callbacks.onSyncError?.(`Error loading ${entityName}`);
        throw error;
      }
    }
  };
};
