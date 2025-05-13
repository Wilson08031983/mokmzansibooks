
/**
 * A utility for migrating data between storage mechanisms
 * and ensuring data integrity during application updates
 */

export interface MigrationOptions {
  sourceKey?: string;
  targetKey?: string;
  deleteSource?: boolean;
}

interface MigrationResult {
  success: boolean;
  data: any;
}

const robustStorageMigrator = {
  /**
   * Migrate data from one storage key to another
   */
  migrateData: (options: MigrationOptions = {}): MigrationResult => {
    const { sourceKey = 'oldData', targetKey = 'newData', deleteSource = false } = options;
    
    try {
      // Try to get data from source
      const sourceData = localStorage.getItem(sourceKey);
      
      // If no source data, just return success with null data
      if (!sourceData) {
        return { success: true, data: null };
      }
      
      // Try to parse and validate the data
      let parsedData;
      try {
        parsedData = JSON.parse(sourceData);
      } catch (e) {
        console.error('Error parsing source data during migration:', e);
        return { success: false, data: null };
      }
      
      // Save to target
      try {
        localStorage.setItem(targetKey, JSON.stringify(parsedData));
      } catch (e) {
        console.error('Error saving to target during migration:', e);
        return { success: false, data: parsedData };
      }
      
      // Delete source if requested
      if (deleteSource) {
        try {
          localStorage.removeItem(sourceKey);
        } catch (e) {
          console.warn('Could not remove source key after migration:', e);
          // Not considering this a failure
        }
      }
      
      return { success: true, data: parsedData };
    } catch (e) {
      console.error('Unexpected error during data migration:', e);
      return { success: false, data: null };
    }
  },
  
  /**
   * Check if migration is needed between keys
   */
  needsMigration: (sourceKey: string, targetKey: string): boolean => {
    try {
      const sourceData = localStorage.getItem(sourceKey);
      const targetData = localStorage.getItem(targetKey);
      
      // Migration needed if source exists but target doesn't
      return !!sourceData && !targetData;
    } catch (e) {
      console.error('Error checking if migration is needed:', e);
      return false;
    }
  },
  
  /**
   * Consolidate data from multiple sources into one target
   */
  consolidateStorage: (sourceKeys: string[], targetKey: string, deleteSource = false): MigrationResult => {
    try {
      const consolidatedData: Record<string, any> = {};
      
      // Collect data from all sources
      for (const key of sourceKeys) {
        try {
          const sourceData = localStorage.getItem(key);
          if (sourceData) {
            const parsedData = JSON.parse(sourceData);
            consolidatedData[key] = parsedData;
            
            if (deleteSource) {
              localStorage.removeItem(key);
            }
          }
        } catch (e) {
          console.warn(`Error processing source key ${key} during consolidation:`, e);
          // Continue with other keys
        }
      }
      
      // Save consolidated data
      localStorage.setItem(targetKey, JSON.stringify(consolidatedData));
      
      return { success: true, data: consolidatedData };
    } catch (e) {
      console.error('Error during storage consolidation:', e);
      return { success: false, data: null };
    }
  }
};

export default robustStorageMigrator;
