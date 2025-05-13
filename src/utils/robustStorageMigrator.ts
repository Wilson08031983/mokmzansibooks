
/**
 * Utility for migrating data between different storage mechanisms
 * with robust error handling and validation
 */

export interface MigrationOptions {
  sourceKey: string;
  targetKey: string;
  transform?: (data: any) => any;
  validateData?: (data: any) => boolean;
  deleteSource?: boolean;
}

/**
 * Migrates data from one storage key to another with optional transformation
 */
export function migrateData(options: MigrationOptions): { success: boolean, data: any } {
  try {
    const { sourceKey, targetKey, transform, validateData, deleteSource = false } = options;
    
    // Get source data
    const sourceData = localStorage.getItem(sourceKey);
    if (!sourceData) {
      return { success: false, data: null };
    }
    
    // Parse the source data
    let parsedData;
    try {
      parsedData = JSON.parse(sourceData);
    } catch (e) {
      console.error(`Invalid JSON in sourceKey ${sourceKey}:`, e);
      return { success: false, data: null };
    }
    
    // Apply transform if provided
    let transformedData = parsedData;
    if (transform) {
      try {
        transformedData = transform(parsedData);
      } catch (e) {
        console.error('Error during data transformation:', e);
        return { success: false, data: parsedData };
      }
    }
    
    // Validate data if validator provided
    if (validateData && !validateData(transformedData)) {
      console.error('Data validation failed');
      return { success: false, data: transformedData };
    }
    
    // Store data to target
    try {
      localStorage.setItem(targetKey, JSON.stringify(transformedData));
    } catch (e) {
      console.error(`Error saving to targetKey ${targetKey}:`, e);
      return { success: false, data: transformedData };
    }
    
    // Delete source if requested
    if (deleteSource) {
      try {
        localStorage.removeItem(sourceKey);
      } catch (e) {
        console.warn(`Could not remove sourceKey ${sourceKey}:`, e);
        // Still consider the migration successful even if deletion fails
      }
    }
    
    return { success: true, data: transformedData };
  } catch (error) {
    console.error('Unexpected error during data migration:', error);
    return { success: false, data: null };
  }
}

/**
 * Check if a migration is needed between source and target
 */
export function needsMigration(sourceKey: string, targetKey: string): boolean {
  try {
    const sourceData = localStorage.getItem(sourceKey);
    const targetData = localStorage.getItem(targetKey);
    
    // Migration needed if source exists but target doesn't
    return !!sourceData && !targetData;
  } catch (error) {
    // If any error occurs, assume migration is not needed
    return false;
  }
}

/**
 * Consolidate data from multiple sources into one target
 */
export function consolidateStorage(
  sourceKeys: string[], 
  targetKey: string, 
  deleteSource: boolean = false
): { success: boolean, data: any } {
  try {
    // Get data from all sources
    const dataFromSources = [];
    
    for (const key of sourceKeys) {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          dataFromSources.push(JSON.parse(data));
        }
      } catch (e) {
        console.warn(`Could not process data from ${key}:`, e);
      }
    }
    
    if (dataFromSources.length === 0) {
      return { success: false, data: null };
    }
    
    // Merge all data - this is a simplistic approach, would need custom logic for real merging
    const mergedData = dataFromSources.reduce((acc, curr) => ({ ...acc, ...curr }), {});
    
    // Store merged data
    try {
      localStorage.setItem(targetKey, JSON.stringify(mergedData));
    } catch (e) {
      console.error(`Error saving consolidated data to ${targetKey}:`, e);
      return { success: false, data: mergedData };
    }
    
    // Delete sources if requested
    if (deleteSource) {
      for (const key of sourceKeys) {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Could not remove key ${key}:`, e);
        }
      }
    }
    
    return { success: true, data: mergedData };
  } catch (error) {
    console.error('Unexpected error during storage consolidation:', error);
    return { success: false, data: null };
  }
}

/**
 * Ensure the migrator is initialized
 */
export function ensureInitialized(): boolean {
  try {
    // Set a flag to indicate the migrator has been initialized
    localStorage.setItem('storageMigratorInitialized', 'true');
    return true;
  } catch (error) {
    console.error('Failed to initialize storage migrator:', error);
    return false;
  }
}

export default {
  migrateData,
  needsMigration,
  consolidateStorage,
  ensureInitialized
};
