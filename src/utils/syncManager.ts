/**
 * Sync Manager
 * 
 * Handles online/offline synchronization to ensure data consistency
 * when network connectivity is lost and restored.
 */

import { supabase } from './supabaseClient';
import { toast } from '@/hooks/use-toast';

interface PendingSyncItem {
  id: string;
  type: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

// Constants
const MAX_RETRY_COUNT = 5;
const SYNC_QUEUE_KEY = 'sync_queue';
const NETWORK_STATUS_KEY = 'network_status';

/**
 * Class to manage synchronization
 */
class SyncManager {
  private pendingSync: PendingSyncItem[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;
  private listeners: Set<() => void> = new Set();
  
  constructor() {
    // Load pending sync items from localStorage
    this.loadPendingSync();
    
    // Set up event listeners for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Initial sync if online
    if (this.isOnline) {
      this.startSync();
    }
  }
  
  /**
   * Handle online event
   */
  private handleOnline = () => {
    console.log('Network is online. Starting sync...');
    this.isOnline = true;
    localStorage.setItem(NETWORK_STATUS_KEY, 'online');
    
    // Notify user
    toast({
      title: 'You are back online',
      description: 'Syncing your data to the cloud...',
      duration: 3000
    });
    
    // Start syncing pending items
    this.startSync();
    
    // Notify listeners
    this.notifyListeners();
  };
  
  /**
   * Handle offline event
   */
  private handleOffline = () => {
    console.log('Network is offline. Stopping sync...');
    this.isOnline = false;
    localStorage.setItem(NETWORK_STATUS_KEY, 'offline');
    
    // Notify user
    toast({
      title: 'You are offline',
      description: 'Changes will be saved locally and synced when you reconnect.',
      duration: 3000
    });
    
    // Stop syncing
    this.stopSync();
    
    // Notify listeners
    this.notifyListeners();
  };
  
  /**
   * Start sync process
   */
  private startSync = () => {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    // Immediately try to sync pending items
    this.syncPendingItems();
    
    // Set up interval to regularly check and sync
    this.syncInterval = setInterval(() => {
      this.syncPendingItems();
    }, 30000); // Sync every 30 seconds
  };
  
  /**
   * Stop sync process
   */
  private stopSync = () => {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  };
  
  /**
   * Load pending sync items from localStorage
   */
  private loadPendingSync = () => {
    try {
      const pendingSyncString = localStorage.getItem(SYNC_QUEUE_KEY);
      if (pendingSyncString) {
        this.pendingSync = JSON.parse(pendingSyncString);
      }
    } catch (error) {
      console.error('Error loading pending sync items:', error);
      this.pendingSync = [];
    }
  };
  
  /**
   * Save pending sync items to localStorage
   */
  private savePendingSync = () => {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.pendingSync));
    } catch (error) {
      console.error('Error saving pending sync items:', error);
    }
  };
  
  /**
   * Add item to pending sync queue
   */
  public addPendingSync = (
    type: string,
    action: 'create' | 'update' | 'delete',
    data: any,
    id?: string
  ) => {
    // Generate ID if not provided
    const itemId = id || `${type}_${Date.now()}`;
    
    // Check if this item is already in the queue
    const existingIndex = this.pendingSync.findIndex(
      item => item.id === itemId && item.type === type
    );
    
    if (existingIndex >= 0) {
      // Update existing item
      this.pendingSync[existingIndex] = {
        ...this.pendingSync[existingIndex],
        action,
        data,
        timestamp: Date.now(),
        retryCount: 0
      };
    } else {
      // Add new item
      this.pendingSync.push({
        id: itemId,
        type,
        action,
        data,
        timestamp: Date.now(),
        retryCount: 0
      });
    }
    
    // Save to localStorage
    this.savePendingSync();
    
    // If online, try to sync immediately
    if (this.isOnline) {
      this.syncPendingItems();
    }
  };
  
  /**
   * Sync pending items to Supabase
   */
  private syncPendingItems = async () => {
    if (this.pendingSync.length === 0) {
      return;
    }
    
    console.log(`Attempting to sync ${this.pendingSync.length} pending items...`);
    
    // Create a copy of the pending sync array for iteration
    const itemsToSync = [...this.pendingSync];
    
    // Keep track of successfully synced items
    const syncedItemIds: string[] = [];
    
    // Process each pending item
    for (const item of itemsToSync) {
      try {
        let success = false;
        
        // Handle different actions
        switch (item.action) {
          case 'create':
          case 'update':
            success = await this.saveToSupabase(item.type, item.data, item.id);
            break;
          case 'delete':
            success = await this.deleteFromSupabase(item.type, item.id);
            break;
        }
        
        if (success) {
          // Mark item as synced
          syncedItemIds.push(item.id);
        } else {
          // Increment retry count
          const itemToUpdate = this.pendingSync.find(i => i.id === item.id);
          if (itemToUpdate) {
            itemToUpdate.retryCount += 1;
            
            // If max retries reached, mark as synced anyway to remove from queue
            if (itemToUpdate.retryCount >= MAX_RETRY_COUNT) {
              syncedItemIds.push(item.id);
              console.warn(`Max retries reached for item ${item.id}. Removing from queue.`);
            }
          }
        }
      } catch (error) {
        console.error(`Error syncing item ${item.id}:`, error);
        // Update retry count
        const itemToUpdate = this.pendingSync.find(i => i.id === item.id);
        if (itemToUpdate) {
          itemToUpdate.retryCount += 1;
        }
      }
    }
    
    // Remove successfully synced items
    if (syncedItemIds.length > 0) {
      this.pendingSync = this.pendingSync.filter(item => !syncedItemIds.includes(item.id));
      this.savePendingSync();
    }
    
    // Notify listeners
    this.notifyListeners();
    
    console.log(`Sync complete. ${syncedItemIds.length} items synced. ${this.pendingSync.length} items pending.`);
  };
  
  /**
   * Save data to Supabase
   */
  private saveToSupabase = async (
    type: string,
    data: any,
    dataId: string
  ): Promise<boolean> => {
    try {
      // Check if record already exists
      const { data: existingData, error: searchError } = await supabase
        .from('app_data')
        .select('id')
        .eq('type', type)
        .eq('data_id', dataId)
        .maybeSingle();
      
      if (searchError) {
        console.error(`Error searching for existing ${type}:`, searchError);
        return false;
      }
      
      if (existingData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('app_data')
          .update({
            data: data,
            updated_at: new Date()
          })
          .eq('id', existingData.id);
        
        if (updateError) {
          console.error(`Error updating ${type}:`, updateError);
          return false;
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('app_data')
          .insert({
            type: type,
            data_id: dataId,
            data: data,
            created_at: new Date(),
            updated_at: new Date()
          });
        
        if (insertError) {
          console.error(`Error inserting ${type}:`, insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error(`Error saving ${type} to Supabase:`, error);
      throw error;
    }
  };
  
  /**
   * Delete data from Supabase
   */
  private deleteFromSupabase = async (
    type: string,
    dataId: string
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('app_data')
        .delete()
        .eq('type', type)
        .eq('data_id', dataId);
      
      if (error) {
        console.error(`Error deleting ${type}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting ${type} from Supabase:`, error);
      throw error;
    }
  };
  
  /**
   * Get current online status
   */
  public isNetworkOnline = (): boolean => {
    return this.isOnline;
  };
  
  /**
   * Get count of pending sync items
   */
  public getPendingSyncCount = (): number => {
    return this.pendingSync.length;
  };
  
  /**
   * Add a listener to be notified of sync status changes
   */
  public addListener = (listener: () => void): void => {
    this.listeners.add(listener);
  };
  
  /**
   * Remove a listener
   */
  public removeListener = (listener: () => void): void => {
    this.listeners.delete(listener);
  };
  
  /**
   * Notify all listeners
   */
  private notifyListeners = (): void => {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  };
  
  /**
   * Clean up resources
   */
  public cleanup = (): void => {
    this.stopSync();
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  };
}

// Create singleton instance
const syncManager = new SyncManager();

export default syncManager;
