/**
 * Automated Backup System
 * 
 * Provides scheduled backups of critical data to prevent data loss.
 * Features:
 * - Configurable backup frequency
 * - Multiple backup destinations (local and cloud)
 * - Backup rotation and pruning
 * - Backup integrity verification
 */

import { supabase } from './supabaseClient';
import superPersistentStorage from './superPersistentStorage';
import { DataCategory } from './superPersistentStorage';
import { toast } from '@/hooks/use-toast';

// Constants
const BACKUP_SETTINGS_KEY = 'backup_settings';
const BACKUP_HISTORY_KEY = 'backup_history';
const BACKUP_DATA_TABLE = 'data_backups';
const MAX_LOCAL_BACKUPS = 10;
const DEFAULT_BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

// Types
export interface BackupSettings {
  enabled: boolean;
  interval: number; // milliseconds
  categories: DataCategory[];
  storeLocal: boolean;
  storeCloud: boolean;
  lastBackup: string | null;
  maxLocalBackups: number;
  maxCloudBackups: number;
  autoDeleteOldBackups: boolean;
}

export interface BackupMetadata {
  id: string;
  timestamp: string;
  categories: DataCategory[];
  size: number;
  hash: string;
  status: 'complete' | 'partial' | 'failed';
  errorDetails?: string;
  location: ('local' | 'cloud')[];
}

/**
 * Default backup settings
 */
const DEFAULT_SETTINGS: BackupSettings = {
  enabled: true,
  interval: DEFAULT_BACKUP_INTERVAL,
  categories: Object.values(DataCategory),
  storeLocal: true,
  storeCloud: true,
  lastBackup: null,
  maxLocalBackups: MAX_LOCAL_BACKUPS,
  maxCloudBackups: 10,
  autoDeleteOldBackups: true
};

class AutoBackupManager {
  private settings: BackupSettings;
  private backupTimer: NodeJS.Timeout | null = null;
  private backupInProgress: boolean = false;
  private backupHistory: BackupMetadata[] = [];
  
  constructor() {
    this.settings = this.loadSettings();
    this.backupHistory = this.loadBackupHistory();
    
    // Initialize backup timer
    if (this.settings.enabled) {
      this.scheduleNextBackup();
    }
    
    // Listen for online status changes to trigger missed backups
    window.addEventListener('online', this.handleOnline);
  }
  
  /**
   * Load backup settings from localStorage
   */
  private loadSettings(): BackupSettings {
    try {
      const savedSettings = localStorage.getItem(BACKUP_SETTINGS_KEY);
      if (savedSettings) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Error loading backup settings:', error);
    }
    
    return DEFAULT_SETTINGS;
  }
  
  /**
   * Save backup settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(BACKUP_SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving backup settings:', error);
    }
  }
  
  /**
   * Load backup history from localStorage
   */
  private loadBackupHistory(): BackupMetadata[] {
    try {
      const history = localStorage.getItem(BACKUP_HISTORY_KEY);
      if (history) {
        return JSON.parse(history);
      }
    } catch (error) {
      console.error('Error loading backup history:', error);
    }
    
    return [];
  }
  
  /**
   * Save backup history to localStorage
   */
  private saveBackupHistory(): void {
    try {
      // Limit history size in localStorage
      const limitedHistory = this.backupHistory.slice(0, 20);
      localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving backup history:', error);
    }
  }
  
  /**
   * Schedule the next backup
   */
  private scheduleNextBackup(): void {
    if (this.backupTimer) {
      clearTimeout(this.backupTimer);
    }
    
    if (!this.settings.enabled) {
      return;
    }
    
    // Calculate time until next backup
    let nextBackupTime = this.settings.interval;
    
    if (this.settings.lastBackup) {
      const lastBackupTime = new Date(this.settings.lastBackup).getTime();
      const timeSinceLastBackup = Date.now() - lastBackupTime;
      
      // If the last backup was more recent than the interval, adjust
      if (timeSinceLastBackup < this.settings.interval) {
        nextBackupTime = this.settings.interval - timeSinceLastBackup;
      } else {
        // If we missed a backup, do it soon but not immediately
        nextBackupTime = Math.min(60000, this.settings.interval); // 1 minute or sooner
      }
    }
    
    // Schedule the backup
    this.backupTimer = setTimeout(() => {
      this.performBackup();
    }, nextBackupTime);
    
    console.log(`Next backup scheduled in ${Math.round(nextBackupTime / 60000)} minutes`);
  }
  
  /**
   * Handle coming back online
   */
  private handleOnline = (): void => {
    // If we're coming back online, check if we need to run a backup
    if (!this.settings.enabled || !this.settings.lastBackup) {
      return;
    }
    
    const lastBackupTime = new Date(this.settings.lastBackup).getTime();
    const timeSinceLastBackup = Date.now() - lastBackupTime;
    
    // If it's been longer than the interval, schedule a backup soon
    if (timeSinceLastBackup > this.settings.interval) {
      console.log('Back online, scheduling missed backup');
      
      // Cancel existing timer and create a new one
      if (this.backupTimer) {
        clearTimeout(this.backupTimer);
      }
      
      // Do the backup after a short delay to allow for other reconnection tasks
      this.backupTimer = setTimeout(() => {
        this.performBackup();
      }, 30000); // 30 seconds
    }
  };
  
  /**
   * Perform a backup operation
   */
  public async performBackup(): Promise<BackupMetadata | null> {
    if (this.backupInProgress) {
      console.log('Backup already in progress, skipping');
      return null;
    }
    
    this.backupInProgress = true;
    
    try {
      console.log('Starting backup operation');
      
      // Generate backup ID
      const backupId = `backup_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Backup metadata
      const metadata: BackupMetadata = {
        id: backupId,
        timestamp: new Date().toISOString(),
        categories: [],
        size: 0,
        hash: '',
        status: 'complete',
        location: []
      };
      
      // Data container
      const backupData: Record<string, any> = {};
      let totalSize = 0;
      const failedCategories: DataCategory[] = [];
      
      // Collect data to back up
      for (const category of this.settings.categories) {
        try {
          const data = await superPersistentStorage.load(category);
          
          if (data) {
            backupData[category] = data;
            metadata.categories.push(category);
            
            // Approximate size calculation
            const dataString = JSON.stringify(data);
            totalSize += dataString.length;
          }
        } catch (error) {
          console.error(`Error backing up category ${category}:`, error);
          failedCategories.push(category);
        }
      }
      
      // Update metadata
      metadata.size = totalSize;
      metadata.hash = this.generateHash(JSON.stringify(backupData));
      
      // Check if we had failures
      if (failedCategories.length > 0) {
        if (failedCategories.length === this.settings.categories.length) {
          metadata.status = 'failed';
          metadata.errorDetails = `Failed to backup all categories: ${failedCategories.join(', ')}`;
        } else {
          metadata.status = 'partial';
          metadata.errorDetails = `Failed to backup some categories: ${failedCategories.join(', ')}`;
        }
      }
      
      // Store local backup if enabled
      if (this.settings.storeLocal) {
        try {
          this.storeLocalBackup(backupId, backupData, metadata);
          metadata.location.push('local');
        } catch (error) {
          console.error('Error storing local backup:', error);
        }
      }
      
      // Store cloud backup if enabled and online
      if (this.settings.storeCloud) {
        try {
          await this.storeCloudBackup(backupId, backupData, metadata);
          metadata.location.push('cloud');
        } catch (error) {
          console.error('Error storing cloud backup:', error);
        }
      }
      
      // Update settings with last backup time
      this.settings.lastBackup = metadata.timestamp;
      this.saveSettings();
      
      // Add to backup history
      this.backupHistory.unshift(metadata);
      this.saveBackupHistory();
      
      // Prune old backups if needed
      if (this.settings.autoDeleteOldBackups) {
        this.pruneOldBackups();
      }
      
      // Schedule next backup
      this.scheduleNextBackup();
      
      // Show notification on complete or partial backups
      if (metadata.status !== 'failed') {
        toast({
          title: 'Backup Complete',
          description: metadata.status === 'complete' 
            ? `Successfully backed up ${metadata.categories.length} data categories.`
            : `Partially backed up data. Some categories failed.`,
          duration: 3000
        });
      } else {
        toast({
          title: 'Backup Failed',
          description: 'Failed to create backup. Please check the backup history for details.',
          variant: 'destructive',
          duration: 5000
        });
      }
      
      console.log('Backup operation completed with status:', metadata.status);
      return metadata;
      
    } catch (error) {
      console.error('Error during backup operation:', error);
      
      toast({
        title: 'Backup Failed',
        description: 'An unexpected error occurred during the backup process.',
        variant: 'destructive',
        duration: 5000
      });
      
      return null;
    } finally {
      this.backupInProgress = false;
    }
  }
  
  /**
   * Store backup in localStorage
   */
  private storeLocalBackup(
    backupId: string,
    data: Record<string, any>,
    metadata: BackupMetadata
  ): void {
    try {
      // Save metadata and data separately
      localStorage.setItem(`backup_meta_${backupId}`, JSON.stringify(metadata));
      localStorage.setItem(`backup_data_${backupId}`, JSON.stringify(data));
      
      console.log('Local backup stored successfully');
    } catch (error) {
      console.error('Error storing local backup:', error);
      throw error;
    }
  }
  
  /**
   * Store backup in Supabase
   */
  private async storeCloudBackup(
    backupId: string,
    data: Record<string, any>,
    metadata: BackupMetadata
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from(BACKUP_DATA_TABLE)
        .insert({
          backup_id: backupId,
          data: data,
          metadata: metadata,
          created_at: new Date()
        });
      
      if (error) {
        throw error;
      }
      
      console.log('Cloud backup stored successfully');
    } catch (error) {
      console.error('Error storing cloud backup:', error);
      throw error;
    }
  }
  
  /**
   * Generate a simple hash for data verification
   */
  private generateHash(data: string): string {
    let hash = 0;
    
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    // Convert to hex string and ensure it's always positive
    return (hash >>> 0).toString(16);
  }
  
  /**
   * Remove old backups to save space
   */
  private async pruneOldBackups(): Promise<void> {
    try {
      // Prune local backups
      if (this.settings.storeLocal) {
        // Get all local backups
        const localBackups = this.backupHistory
          .filter(b => b.location.includes('local'))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        // Keep only the most recent ones
        if (localBackups.length > this.settings.maxLocalBackups) {
          const toDelete = localBackups.slice(this.settings.maxLocalBackups);
          
          for (const backup of toDelete) {
            try {
              localStorage.removeItem(`backup_data_${backup.id}`);
              localStorage.removeItem(`backup_meta_${backup.id}`);
              
              // Update backup history to remove 'local' from location
              const index = this.backupHistory.findIndex(b => b.id === backup.id);
              if (index >= 0) {
                this.backupHistory[index].location = this.backupHistory[index].location
                  .filter(loc => loc !== 'local');
              }
            } catch (error) {
              console.error(`Error deleting local backup ${backup.id}:`, error);
            }
          }
          
          // Save updated history
          this.saveBackupHistory();
        }
      }
      
      // Prune cloud backups
      if (this.settings.storeCloud) {
        // Only delete if we have too many
        const { count } = await supabase
          .from(BACKUP_DATA_TABLE)
          .select('*', { count: 'exact', head: true });
        
        if (count && count > this.settings.maxCloudBackups) {
          // Get the oldest backups that exceed our limit
          const { data: oldBackups } = await supabase
            .from(BACKUP_DATA_TABLE)
            .select('backup_id')
            .order('created_at', { ascending: true })
            .limit(count - this.settings.maxCloudBackups);
          
          if (oldBackups && oldBackups.length > 0) {
            // Delete old backups
            const { error } = await supabase
              .from(BACKUP_DATA_TABLE)
              .delete()
              .in('backup_id', oldBackups.map(b => b.backup_id));
            
            if (error) {
              console.error('Error pruning cloud backups:', error);
            } else {
              console.log(`Pruned ${oldBackups.length} old cloud backups`);
              
              // Update backup history to remove 'cloud' from location
              for (const backup of oldBackups) {
                const index = this.backupHistory.findIndex(b => b.id === backup.backup_id);
                if (index >= 0) {
                  this.backupHistory[index].location = this.backupHistory[index].location
                    .filter(loc => loc !== 'cloud');
                }
              }
              
              // Save updated history
              this.saveBackupHistory();
            }
          }
        }
      }
    } catch (error) {
      console.error('Error pruning old backups:', error);
    }
  }
  
  /**
   * Get a list of available backups
   */
  public getBackupList(): BackupMetadata[] {
    return [...this.backupHistory];
  }
  
  /**
   * Get backup settings
   */
  public getSettings(): BackupSettings {
    return { ...this.settings };
  }
  
  /**
   * Update backup settings
   */
  public updateSettings(newSettings: Partial<BackupSettings>): void {
    const oldSettings = { ...this.settings };
    
    // Update settings
    this.settings = {
      ...this.settings,
      ...newSettings
    };
    
    // Save to localStorage
    this.saveSettings();
    
    // Reschedule backups if needed
    if (oldSettings.enabled !== this.settings.enabled || 
        oldSettings.interval !== this.settings.interval) {
      this.scheduleNextBackup();
    }
    
    console.log('Backup settings updated:', this.settings);
  }
  
  /**
   * Restore data from a backup
   */
  public async restoreBackup(backupId: string): Promise<{
    success: boolean;
    restoredCategories: DataCategory[];
    failedCategories: DataCategory[];
  }> {
    console.log(`Attempting to restore backup: ${backupId}`);
    
    const result = {
      success: false,
      restoredCategories: [] as DataCategory[],
      failedCategories: [] as DataCategory[]
    };
    
    try {
      // Find the backup in our history
      const backupMeta = this.backupHistory.find(b => b.id === backupId);
      
      if (!backupMeta) {
        throw new Error(`Backup ${backupId} not found in history`);
      }
      
      let backupData: Record<string, any> | null = null;
      
      // Try to get from local storage first if it should be there
      if (backupMeta.location.includes('local')) {
        try {
          const localBackupData = localStorage.getItem(`backup_data_${backupId}`);
          if (localBackupData) {
            backupData = JSON.parse(localBackupData);
          }
        } catch (error) {
          console.error('Error loading local backup:', error);
        }
      }
      
      // If not found locally or local load failed, try cloud
      if (!backupData && backupMeta.location.includes('cloud')) {
        try {
          const { data, error } = await supabase
            .from(BACKUP_DATA_TABLE)
            .select('data')
            .eq('backup_id', backupId)
            .single();
          
          if (error) {
            throw error;
          }
          
          backupData = data.data;
        } catch (error) {
          console.error('Error loading cloud backup:', error);
          throw new Error('Could not load backup data from cloud');
        }
      }
      
      if (!backupData) {
        throw new Error('Backup data not found in any location');
      }
      
      // Verify backup integrity with hash
      const computedHash = this.generateHash(JSON.stringify(backupData));
      if (computedHash !== backupMeta.hash) {
        console.warn('Backup hash mismatch, data may be corrupted');
        // We'll still try to restore, but log the warning
      }
      
      // Restore each category
      for (const category of backupMeta.categories) {
        if (backupData[category]) {
          try {
            await superPersistentStorage.save(category, backupData[category]);
            result.restoredCategories.push(category);
          } catch (error) {
            console.error(`Error restoring category ${category}:`, error);
            result.failedCategories.push(category);
          }
        } else {
          console.warn(`Category ${category} not found in backup data`);
        }
      }
      
      // Success if we restored at least one category
      result.success = result.restoredCategories.length > 0;
      
      // Show notification
      if (result.success) {
        const partial = result.failedCategories.length > 0;
        
        toast({
          title: partial ? 'Partial Restore' : 'Restore Complete',
          description: partial
            ? `Restored ${result.restoredCategories.length} categories. ${result.failedCategories.length} categories failed.`
            : `Successfully restored ${result.restoredCategories.length} categories from backup.`,
          duration: 5000
        });
      } else {
        toast({
          title: 'Restore Failed',
          description: 'Could not restore any data from the backup.',
          variant: 'destructive',
          duration: 5000
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error restoring backup:', error);
      
      toast({
        title: 'Restore Failed',
        description: error instanceof Error ? error.message : 'Unknown error during restore',
        variant: 'destructive',
        duration: 5000
      });
      
      return result;
    }
  }
  
  /**
   * Delete a backup
   */
  public async deleteBackup(backupId: string): Promise<boolean> {
    try {
      // Find the backup in our history
      const backupIndex = this.backupHistory.findIndex(b => b.id === backupId);
      
      if (backupIndex === -1) {
        throw new Error(`Backup ${backupId} not found in history`);
      }
      
      const backup = this.backupHistory[backupIndex];
      
      // Delete from local storage if it's there
      if (backup.location.includes('local')) {
        try {
          localStorage.removeItem(`backup_data_${backupId}`);
          localStorage.removeItem(`backup_meta_${backupId}`);
        } catch (error) {
          console.error('Error deleting local backup:', error);
        }
      }
      
      // Delete from cloud if it's there
      if (backup.location.includes('cloud')) {
        try {
          const { error } = await supabase
            .from(BACKUP_DATA_TABLE)
            .delete()
            .eq('backup_id', backupId);
          
          if (error) {
            throw error;
          }
        } catch (error) {
          console.error('Error deleting cloud backup:', error);
        }
      }
      
      // Remove from history
      this.backupHistory.splice(backupIndex, 1);
      this.saveBackupHistory();
      
      console.log(`Backup ${backupId} deleted successfully`);
      return true;
      
    } catch (error) {
      console.error('Error deleting backup:', error);
      return false;
    }
  }
  
  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.backupTimer) {
      clearTimeout(this.backupTimer);
      this.backupTimer = null;
    }
    
    window.removeEventListener('online', this.handleOnline);
  }
}

// Create singleton instance
const autoBackupManager = new AutoBackupManager();

export default autoBackupManager;
