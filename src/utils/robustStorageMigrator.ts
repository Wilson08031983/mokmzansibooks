
// Storage migration utilities for safely transferring data between storage methods

/**
 * Options for data migration
 */
export interface MigrationOptions {
  sourceKey?: string;
  targetKey?: string;
  deleteSource?: boolean;
  fallbackData?: any;
  overwrite?: boolean;
}

/**
 * Result of a migration operation
 */
export interface MigrationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: Error;
}

/**
 * Robust Storage Migrator
 * Utility to safely migrate data between different storage mechanisms
 */
const robustStorageMigrator = {
  /**
   * Initialize the storage migrator
   * This ensures it's ready to use before performing operations
   */
  ensureInitialized: (): Promise<boolean> => {
    return new Promise((resolve) => {
      // Simple check to ensure storage is available
      try {
        localStorage.setItem('_storage_check', 'true');
        localStorage.removeItem('_storage_check');
        resolve(true);
      } catch (error) {
        console.warn('Storage initialization failed:', error);
        resolve(false);
      }
    });
  },

  /**
   * Migrate data from one storage key to another
   * @param options Migration options
   */
  migrateData: (options?: MigrationOptions): MigrationResult => {
    try {
      const sourceKey = options?.sourceKey || 'oldData';
      const targetKey = options?.targetKey || 'newData';
      const deleteSource = options?.deleteSource !== undefined ? options.deleteSource : false;
      const overwrite = options?.overwrite !== undefined ? options.overwrite : false;
      
      // Check if target already exists and we're not overwriting
      const existingTarget = localStorage.getItem(targetKey);
      if (existingTarget && !overwrite) {
        return {
          success: true,
          message: `Target ${targetKey} already exists, skipping migration`,
          data: JSON.parse(existingTarget)
        };
      }
      
      // Get source data
      const sourceData = localStorage.getItem(sourceKey);
      if (!sourceData) {
        if (options?.fallbackData) {
          localStorage.setItem(targetKey, JSON.stringify(options.fallbackData));
          return {
            success: true,
            message: `No source data found, used fallback for ${targetKey}`,
            data: options.fallbackData
          };
        }
        
        return {
          success: false,
          message: `Source ${sourceKey} not found`
        };
      }
      
      // Migrate data
      localStorage.setItem(targetKey, sourceData);
      
      // Delete source if requested
      if (deleteSource) {
        localStorage.removeItem(sourceKey);
      }
      
      return {
        success: true,
        message: `Successfully migrated data from ${sourceKey} to ${targetKey}`,
        data: JSON.parse(sourceData)
      };
    } catch (error) {
      console.error('Error during data migration:', error);
      return {
        success: false,
        message: 'Migration failed due to error',
        error: error as Error
      };
    }
  },
  
  /**
   * Check if migration is needed
   */
  needsMigration: (sourceKey: string, targetKey: string): boolean => {
    try {
      const sourceData = localStorage.getItem(sourceKey);
      const targetData = localStorage.getItem(targetKey);
      
      return !!sourceData && !targetData;
    } catch (error) {
      console.error('Error checking if migration is needed:', error);
      return false;
    }
  },
  
  /**
   * Consolidate data from multiple sources into a single target
   */
  consolidateStorage: (sourceKeys: string[], targetKey: string, deleteSource: boolean = false): MigrationResult => {
    try {
      // Try each source key in order
      for (const sourceKey of sourceKeys) {
        const sourceData = localStorage.getItem(sourceKey);
        if (sourceData) {
          localStorage.setItem(targetKey, sourceData);
          
          if (deleteSource) {
            localStorage.removeItem(sourceKey);
          }
          
          return {
            success: true,
            message: `Consolidated data from ${sourceKey} to ${targetKey}`,
            data: JSON.parse(sourceData)
          };
        }
      }
      
      return {
        success: false,
        message: 'No valid source data found for consolidation'
      };
    } catch (error) {
      console.error('Error during storage consolidation:', error);
      return {
        success: false,
        message: 'Consolidation failed due to error',
        error: error as Error
      };
    }
  }
};

export default robustStorageMigrator;
