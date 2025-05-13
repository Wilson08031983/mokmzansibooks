
/**
 * Robust Storage Migrator
 * Provides tools for safely migrating data between different storage mechanisms
 */

export interface MigrationOptions {
  sourceKey: string;
  targetKey: string;
  deleteSource?: boolean;
  storageType?: 'localStorage' | 'sessionStorage';
}

export interface MigrationResult {
  success: boolean;
  result?: any;
  error?: string;
}

const robustStorageMigrator = {
  /**
   * Migrates data from one key to another in web storage
   */
  migrateData: (options?: MigrationOptions): MigrationResult => {
    try {
      const {
        sourceKey, 
        targetKey, 
        deleteSource = false,
        storageType = 'localStorage'
      } = options || {};
      
      if (!sourceKey || !targetKey) {
        return { 
          success: false,
          error: 'Source and target keys are required'
        };
      }
      
      const storage = storageType === 'sessionStorage' ? sessionStorage : localStorage;
      
      // Get source data
      const sourceData = storage.getItem(sourceKey);
      if (!sourceData) {
        return { 
          success: false,
          error: `Source key '${sourceKey}' not found`
        };
      }
      
      // Try to parse as JSON
      let parsedData;
      try {
        parsedData = JSON.parse(sourceData);
      } catch (e) {
        // If not valid JSON, store as string
        parsedData = sourceData;
      }
      
      // Save to target
      storage.setItem(targetKey, typeof parsedData === 'string' ? parsedData : JSON.stringify(parsedData));
      
      // Delete source if needed
      if (deleteSource) {
        storage.removeItem(sourceKey);
      }
      
      return { 
        success: true,
        result: parsedData
      };
    } catch (error) {
      console.error('Error during storage migration:', error);
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during migration'
      };
    }
  },
  
  /**
   * Checks if data needs migration
   */
  needsMigration: (sourceKey: string, targetKey: string): boolean => {
    const sourceData = localStorage.getItem(sourceKey);
    const targetData = localStorage.getItem(targetKey);
    
    return !!(sourceData && !targetData);
  },
  
  /**
   * Consolidates data from multiple possible source keys into a target key
   */
  consolidateStorage: (sourceKeys: string[], targetKey: string, deleteSource: boolean = false): MigrationResult => {
    try {
      // Check if target already exists
      const existingTarget = localStorage.getItem(targetKey);
      if (existingTarget) {
        try {
          const parsedTarget = JSON.parse(existingTarget);
          return { 
            success: true,
            result: parsedTarget
          };
        } catch (e) {
          // If can't parse, continue with migration
        }
      }
      
      // Try each source key in sequence
      for (const sourceKey of sourceKeys) {
        const sourceData = localStorage.getItem(sourceKey);
        if (sourceData) {
          try {
            const parsedData = JSON.parse(sourceData);
            localStorage.setItem(targetKey, JSON.stringify(parsedData));
            
            if (deleteSource) {
              localStorage.removeItem(sourceKey);
            }
            
            return { 
              success: true,
              result: parsedData
            };
          } catch (e) {
            // If can't parse, try next source
            console.warn(`Could not parse data for key ${sourceKey}, trying next source`);
          }
        }
      }
      
      return { 
        success: false,
        error: 'No valid source data found'
      };
    } catch (error) {
      console.error('Error consolidating storage:', error);
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during storage consolidation' 
      };
    }
  },
  
  /**
   * Ensures storage is initialized with default values if needed
   */
  ensureInitialized: (key: string, defaultValue: any): MigrationResult => {
    try {
      const existingData = localStorage.getItem(key);
      
      if (!existingData) {
        const stringifiedDefault = JSON.stringify(defaultValue);
        localStorage.setItem(key, stringifiedDefault);
        return {
          success: true,
          result: defaultValue
        };
      }
      
      try {
        const parsedData = JSON.parse(existingData);
        return {
          success: true,
          result: parsedData
        };
      } catch (e) {
        // If existing data isn't valid JSON, replace with default
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return {
          success: true,
          result: defaultValue
        };
      }
    } catch (error) {
      console.error('Error ensuring initialized storage:', error);
      return { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during storage initialization'
      };
    }
  }
};

export default robustStorageMigrator;
