
/**
 * Robust Storage Migration Utility
 * Helps migrate data between different storage mechanisms and keys
 * with validation and fallbacks to ensure data integrity
 */

export interface MigrationOptions {
  sourceKey?: string;
  targetKey?: string;
  deleteSource?: boolean;
  validateData?: (data: any) => boolean;
}

export interface MigrationResult {
  success: boolean;
  error?: Error;
  migratedData?: any;
}

class RobustStorageMigrator {
  /**
   * Migrate data from one storage key to another
   * @param options Migration options
   * @returns Migration result object
   */
  migrateData(options: MigrationOptions = {}): MigrationResult {
    try {
      const {
        sourceKey = 'oldData',
        targetKey = 'newData',
        deleteSource = false,
        validateData = (data) => !!data,
      } = options;

      // Try to get source data
      const sourceData = localStorage.getItem(sourceKey);

      if (!sourceData) {
        return {
          success: false,
          error: new Error(`Source data not found with key: ${sourceKey}`),
        };
      }

      // Parse and validate data
      try {
        const parsedData = JSON.parse(sourceData);
        
        if (!validateData(parsedData)) {
          return {
            success: false,
            error: new Error('Data validation failed'),
          };
        }

        // Save to target key
        localStorage.setItem(targetKey, sourceData);

        // Delete source if requested
        if (deleteSource) {
          localStorage.removeItem(sourceKey);
        }

        return {
          success: true,
          migratedData: parsedData,
        };
      } catch (parseError) {
        return {
          success: false,
          error: parseError instanceof Error 
            ? parseError 
            : new Error('Failed to parse source data'),
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error 
          ? error 
          : new Error('Unknown error during migration'),
      };
    }
  }

  /**
   * Check if migration is needed
   * @param sourceKey Source storage key
   * @param targetKey Target storage key
   * @returns True if migration is needed
   */
  needsMigration(sourceKey: string, targetKey: string): boolean {
    try {
      const sourceData = localStorage.getItem(sourceKey);
      const targetData = localStorage.getItem(targetKey);

      // Migration needed if source has data but target doesn't
      return Boolean(sourceData) && !Boolean(targetData);
    } catch (error) {
      console.error('Error checking migration need:', error);
      return false;
    }
  }

  /**
   * Consolidate data from multiple sources into one target
   * @param sourceKeys Array of source keys
   * @param targetKey Target key
   * @param deleteSource Whether to delete source keys after migration
   * @returns Migration result
   */
  consolidateStorage(
    sourceKeys: string[],
    targetKey: string,
    deleteSource: boolean = false
  ): MigrationResult {
    try {
      const consolidatedData: Record<string, any> = {};

      // Gather all data from sources
      for (const sourceKey of sourceKeys) {
        try {
          const sourceData = localStorage.getItem(sourceKey);
          if (sourceData) {
            const parsedData = JSON.parse(sourceData);
            Object.assign(consolidatedData, parsedData);
          }
        } catch (error) {
          console.error(`Error processing source ${sourceKey}:`, error);
          // Continue with other sources
        }
      }

      // Save consolidated data
      localStorage.setItem(targetKey, JSON.stringify(consolidatedData));

      // Delete sources if requested
      if (deleteSource) {
        for (const sourceKey of sourceKeys) {
          localStorage.removeItem(sourceKey);
        }
      }

      return {
        success: true,
        migratedData: consolidatedData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error 
          ? error 
          : new Error('Failed to consolidate storage'),
      };
    }
  }

  /**
   * Ensure storage is initialized
   * @returns Promise resolving to true if initialization was successful
   */
  async ensureInitialized(): Promise<boolean> {
    try {
      // Test localStorage availability
      localStorage.setItem('__test__', 'test');
      const value = localStorage.getItem('__test__');
      localStorage.removeItem('__test__');
      
      return value === 'test';
    } catch (error) {
      console.error('Storage initialization error:', error);
      return false;
    }
  }
}

const robustStorageMigrator = new RobustStorageMigrator();
export default robustStorageMigrator;
