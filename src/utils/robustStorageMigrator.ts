
/**
 * Robust Storage Migrator
 * Handles migration of data between different storage mechanisms
 * and provides fallback options if primary storage fails
 */

// Default migration options
interface MigrationOptions {
  sourceKey: string;
  targetKey: string;
  deleteSource?: boolean;
  transformer?: (data: any) => any;
}

/**
 * Migrate data from one storage key to another
 * @param options Migration options
 * @returns Success status and any migrated data
 */
export const migrateData = (options: MigrationOptions): { success: boolean; data: any } => {
  const { sourceKey, targetKey, deleteSource = false, transformer } = options;
  
  try {
    // Get data from source
    const sourceData = localStorage.getItem(sourceKey);
    
    if (!sourceData) {
      return { success: false, data: null };
    }
    
    // Parse the source data
    let parsedData;
    try {
      parsedData = JSON.parse(sourceData);
    } catch (e) {
      console.error(`Error parsing data from ${sourceKey}:`, e);
      return { success: false, data: null };
    }
    
    // Transform data if transformer is provided
    const dataToStore = transformer ? transformer(parsedData) : parsedData;
    
    // Store in target
    localStorage.setItem(targetKey, JSON.stringify(dataToStore));
    
    // Delete source if requested
    if (deleteSource) {
      localStorage.removeItem(sourceKey);
    }
    
    return { success: true, data: dataToStore };
  } catch (error) {
    console.error(`Error migrating data from ${sourceKey} to ${targetKey}:`, error);
    return { success: false, data: null };
  }
};

/**
 * Check if a migration is needed
 * @param sourceKey Source storage key
 * @param targetKey Target storage key
 * @returns True if migration is needed
 */
export const needsMigration = (sourceKey: string, targetKey: string): boolean => {
  try {
    const sourceExists = !!localStorage.getItem(sourceKey);
    const targetExists = !!localStorage.getItem(targetKey);
    
    return sourceExists && !targetExists;
  } catch (error) {
    console.error('Error checking migration need:', error);
    return false;
  }
};

/**
 * Consolidate data from multiple sources into one target
 * @param sourceKeys Array of source keys to check
 * @param targetKey Target storage key
 * @param deleteSource Whether to delete sources after migration
 * @returns Success status and consolidated data
 */
export const consolidateStorage = (
  sourceKeys: string[],
  targetKey: string,
  deleteSource = false
): { success: boolean; data: any } => {
  try {
    // Check if target already exists
    const targetExists = !!localStorage.getItem(targetKey);
    if (targetExists) {
      // Target already exists, no consolidation needed
      return { 
        success: true, 
        data: JSON.parse(localStorage.getItem(targetKey) || '{}') 
      };
    }
    
    // Try each source key in order
    for (const sourceKey of sourceKeys) {
      const sourceData = localStorage.getItem(sourceKey);
      if (sourceData) {
        try {
          const parsedData = JSON.parse(sourceData);
          localStorage.setItem(targetKey, JSON.stringify(parsedData));
          
          if (deleteSource) {
            localStorage.removeItem(sourceKey);
          }
          
          return { success: true, data: parsedData };
        } catch (e) {
          console.warn(`Skipping invalid data at ${sourceKey}:`, e);
          continue;
        }
      }
    }
    
    // No valid source found
    return { success: false, data: null };
  } catch (error) {
    console.error('Error consolidating storage:', error);
    return { success: false, data: null };
  }
};

export default {
  migrateData,
  needsMigration,
  consolidateStorage
};
