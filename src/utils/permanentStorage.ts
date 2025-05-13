
/**
 * Enhanced storage management with fallback mechanisms and error handling
 */

// Define storage namespaces to organize data
export enum StorageNamespace {
  APP_DATA = 'app_data',
  USER_PREFERENCES = 'user_preferences',
  COMPANY_DATA = 'company_data',
  CLIENT_DATA = 'client_data',
  TEMPORARY_DATA = 'temporary_data',
}

// Interface to track storage readiness
interface StorageReadinessState {
  isReady: boolean;
  error: Error | null;
}

class PermanentStorage {
  private readinessState: StorageReadinessState = { isReady: false, error: null };
  private storageCheckPromise: Promise<boolean> | null = null;

  constructor() {
    this.initializeStorage();
  }

  /**
   * Initialize storage and check availability
   */
  private initializeStorage(): void {
    this.storageCheckPromise = new Promise((resolve) => {
      try {
        // Test localStorage
        localStorage.setItem('__test__', 'test');
        localStorage.removeItem('__test__');
        this.readinessState.isReady = true;
        resolve(true);
      } catch (error) {
        console.error('localStorage not available:', error);
        this.readinessState.error = error instanceof Error 
          ? error 
          : new Error('Unknown storage error');
        this.readinessState.isReady = false;
        resolve(false);
      }
    });
  }

  /**
   * Wait until storage is ready before using it
   * @param timeoutMs Timeout in milliseconds
   * @returns Promise that resolves when storage is ready
   */
  async waitUntilReady(timeoutMs: number = 5000): Promise<boolean> {
    if (this.readinessState.isReady) {
      return true;
    }

    if (!this.storageCheckPromise) {
      this.initializeStorage();
    }

    // Create a timeout promise
    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(false);
      }, timeoutMs);
    });

    // Race the storage check against the timeout
    const isReady = await Promise.race([
      this.storageCheckPromise as Promise<boolean>,
      timeoutPromise,
    ]);

    if (!isReady && !this.readinessState.error) {
      this.readinessState.error = new Error(`Storage initialization timed out after ${timeoutMs}ms`);
    }

    return isReady;
  }

  /**
   * Get current storage readiness state
   */
  getReadinessState(): StorageReadinessState {
    return { ...this.readinessState };
  }

  /**
   * Save data to persistent storage with namespace
   * @param namespace Storage namespace
   * @param data Data to save
   * @returns True if save was successful
   */
  async saveData(namespace: StorageNamespace, data: Record<string, any>): Promise<boolean> {
    try {
      if (!this.readinessState.isReady) {
        await this.waitUntilReady();
      }

      const key = `mok-mzansi-books-${namespace}`;
      const dataString = JSON.stringify(data);
      localStorage.setItem(key, dataString);
      return true;
    } catch (error) {
      console.error(`Error saving data to namespace ${namespace}:`, error);
      return false;
    }
  }

  /**
   * Load data from persistent storage by namespace
   * @param namespace Storage namespace
   * @returns Data object or null if not found/error
   */
  async loadData(namespace: StorageNamespace): Promise<Record<string, any> | null> {
    try {
      if (!this.readinessState.isReady) {
        await this.waitUntilReady();
      }

      const key = `mok-mzansi-books-${namespace}`;
      const dataString = localStorage.getItem(key);
      
      if (!dataString) {
        return {};
      }

      return JSON.parse(dataString);
    } catch (error) {
      console.error(`Error loading data from namespace ${namespace}:`, error);
      return null;
    }
  }

  /**
   * Clear all data in a namespace
   * @param namespace Storage namespace
   * @returns True if clear was successful
   */
  async clearNamespace(namespace: StorageNamespace): Promise<boolean> {
    try {
      if (!this.readinessState.isReady) {
        await this.waitUntilReady();
      }

      const key = `mok-mzansi-books-${namespace}`;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error clearing namespace ${namespace}:`, error);
      return false;
    }
  }
}

// Export a singleton instance
const permanentStorage = new PermanentStorage();
export default permanentStorage;
