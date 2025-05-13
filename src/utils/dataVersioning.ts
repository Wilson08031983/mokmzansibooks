/**
 * Data Versioning System
 * 
 * Implements versioning and audit trails for data changes, allowing for:
 * - Tracking who made changes
 * - When changes were made
 * - What specific fields changed
 * - Ability to restore previous versions
 */

import { supabase } from './supabaseClient';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { toast } from '@/hooks/use-toast';
import { DataCategory } from './superPersistentStorage';
import superPersistentStorage from './superPersistentStorage';

// Types
export interface VersionMetadata {
  version: number;
  timestamp: string;
  userId: string | null;
  userName: string | null;
  changeDescription: string;
  changedFields: string[];
}

export interface DataVersion<T = any> {
  id: string;
  data: T;
  metadata: VersionMetadata;
}

const VERSION_HISTORY_TABLE = 'data_version_history';
const MAX_LOCAL_VERSIONS = 5;
const DEFAULT_VERSION_DESCRIPTION = 'Data updated';

/**
 * Get the current authenticated user information
 */
function getCurrentUser() {
  const auth = useSupabaseAuth();
  return {
    id: auth?.currentUser?.id || null,
    name: auth?.currentUser?.displayName || auth?.currentUser?.user_metadata?.display_name || 'Unknown User'
  };
}

/**
 * Generate version metadata
 */
function generateVersionMetadata(
  previousVersion: number,
  changeDescription: string,
  changedFields: string[] = []
): VersionMetadata {
  const user = getCurrentUser();
  
  return {
    version: previousVersion + 1,
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    changeDescription: changeDescription || DEFAULT_VERSION_DESCRIPTION,
    changedFields
  };
}

/**
 * Determine which fields have changed between two objects
 */
function getChangedFields(oldData: any, newData: any, parentKey = ''): string[] {
  if (!oldData || !newData) return [];
  
  const changedFields: string[] = [];
  
  // Get all keys from both objects
  const allKeys = new Set([
    ...Object.keys(oldData),
    ...Object.keys(newData)
  ]);
  
  for (const key of allKeys) {
    // Skip metadata and internal fields
    if (key === '_meta' || key === '_id' || key === '_version') continue;
    
    const currentKey = parentKey ? `${parentKey}.${key}` : key;
    
    // Check if the key exists in both objects
    const oldHasKey = oldData.hasOwnProperty(key);
    const newHasKey = newData.hasOwnProperty(key);
    
    // Field was added or removed
    if (!oldHasKey || !newHasKey) {
      changedFields.push(currentKey);
      continue;
    }
    
    const oldValue = oldData[key];
    const newValue = newData[key];
    
    // Different types
    if (typeof oldValue !== typeof newValue) {
      changedFields.push(currentKey);
      continue;
    }
    
    // Handle nested objects
    if (typeof oldValue === 'object' && oldValue !== null && 
        typeof newValue === 'object' && newValue !== null &&
        !Array.isArray(oldValue) && !Array.isArray(newValue)) {
      const nestedChanges = getChangedFields(oldValue, newValue, currentKey);
      changedFields.push(...nestedChanges);
      continue;
    }
    
    // Handle arrays (simplified - we just check if they're different)
    if (Array.isArray(oldValue) && Array.isArray(newValue)) {
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changedFields.push(currentKey);
      }
      continue;
    }
    
    // Simple value comparison
    if (oldValue !== newValue) {
      changedFields.push(currentKey);
    }
  }
  
  return changedFields;
}

/**
 * Create a new version of data
 */
export async function createVersion<T>(
  category: DataCategory,
  data: T,
  changeDescription?: string
): Promise<{ success: boolean; versionNumber: number }> {
  try {
    // Load previous data to compare changes
    const previousData = await superPersistentStorage.load(category);
    
    // Get list of changed fields
    const changedFields = getChangedFields(previousData, data);
    
    // Get previous version number
    const previousVersion = previousData && typeof previousData === 'object' && '_meta' in previousData
      ? (previousData._meta as any)?.version || 0
      : 0;
    
    // Generate metadata for new version
    const versionMetadata = generateVersionMetadata(
      previousVersion,
      changeDescription || DEFAULT_VERSION_DESCRIPTION,
      changedFields
    );
    
    // Add metadata to data
    const versionedData = {
      ...data,
      _meta: {
        ...((data as any)?._meta || {}),
        version: versionMetadata.version,
        lastUpdated: versionMetadata.timestamp
      }
    };
    
    // Save to storage with updated metadata
    await superPersistentStorage.save(category, versionedData);
    
    // Save version history to server
    const { error } = await supabase
      .from(VERSION_HISTORY_TABLE)
      .insert({
        category,
        version: versionMetadata.version,
        data: versionedData,
        metadata: versionMetadata,
        timestamp: new Date()
      });
    
    if (error) {
      console.error('Error saving version history:', error);
      // Continue anyway - we've already saved the data locally
    }
    
    // Also save a local copy of version history 
    saveLocalVersionHistory(category, versionedData, versionMetadata);
    
    return {
      success: true,
      versionNumber: versionMetadata.version
    };
  } catch (error) {
    console.error('Error creating data version:', error);
    return {
      success: false,
      versionNumber: 0
    };
  }
}

/**
 * Save version history locally
 */
function saveLocalVersionHistory<T>(
  category: DataCategory,
  data: T,
  metadata: VersionMetadata
): void {
  try {
    // Get existing version history from localStorage
    const historyKey = `version_history_${category}`;
    const existingHistoryJson = localStorage.getItem(historyKey);
    let existingHistory: DataVersion[] = [];
    
    if (existingHistoryJson) {
      try {
        existingHistory = JSON.parse(existingHistoryJson);
      } catch (e) {
        console.error('Error parsing version history:', e);
      }
    }
    
    // Add new version
    const newVersion: DataVersion = {
      id: `${category}_${metadata.version}`,
      data,
      metadata
    };
    
    // Add to history and limit size
    existingHistory.unshift(newVersion);
    if (existingHistory.length > MAX_LOCAL_VERSIONS) {
      existingHistory = existingHistory.slice(0, MAX_LOCAL_VERSIONS);
    }
    
    // Save back to localStorage
    localStorage.setItem(historyKey, JSON.stringify(existingHistory));
    
  } catch (error) {
    console.error('Error saving local version history:', error);
  }
}

/**
 * Get version history for a category
 */
export async function getVersionHistory(
  category: DataCategory,
  limit = 10
): Promise<DataVersion[]> {
  try {
    // Try to get from server first
    const { data: serverVersions, error } = await supabase
      .from(VERSION_HISTORY_TABLE)
      .select('*')
      .eq('category', category)
      .order('version', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching version history:', error);
      // Fall back to local version history
      return getLocalVersionHistory(category);
    }
    
    if (serverVersions && serverVersions.length > 0) {
      return serverVersions.map(v => ({
        id: `${category}_${v.version}`,
        data: v.data,
        metadata: v.metadata
      }));
    }
    
    // Fall back to local version history if no server versions
    return getLocalVersionHistory(category);
    
  } catch (error) {
    console.error('Error getting version history:', error);
    return getLocalVersionHistory(category);
  }
}

/**
 * Get local version history
 */
function getLocalVersionHistory(category: DataCategory): DataVersion[] {
  try {
    const historyKey = `version_history_${category}`;
    const historyJson = localStorage.getItem(historyKey);
    
    if (!historyJson) return [];
    
    return JSON.parse(historyJson);
  } catch (error) {
    console.error('Error getting local version history:', error);
    return [];
  }
}

/**
 * Restore a previous version of data
 */
export async function restoreVersion(
  category: DataCategory,
  versionId: string
): Promise<boolean> {
  try {
    // Get the version to restore
    let versionToRestore: DataVersion | null = null;
    
    // First try local versions
    const localVersions = getLocalVersionHistory(category);
    versionToRestore = localVersions.find(v => v.id === versionId) || null;
    
    // If not found locally, try server
    if (!versionToRestore) {
      const versionNumber = parseInt(versionId.split('_')[1], 10);
      
      if (!isNaN(versionNumber)) {
        const { data: serverVersions, error } = await supabase
          .from(VERSION_HISTORY_TABLE)
          .select('*')
          .eq('category', category)
          .eq('version', versionNumber)
          .limit(1);
        
        if (!error && serverVersions && serverVersions.length > 0) {
          versionToRestore = {
            id: versionId,
            data: serverVersions[0].data,
            metadata: serverVersions[0].metadata
          };
        }
      }
    }
    
    if (!versionToRestore) {
      toast({
        title: 'Version Not Found',
        description: `Could not find version ${versionId} for ${category}`,
        variant: 'destructive'
      });
      return false;
    }
    
    // Create a new version with the restored data
    const { success } = await createVersion(
      category,
      versionToRestore.data,
      `Restored from version ${versionToRestore.metadata.version}`
    );
    
    if (success) {
      toast({
        title: 'Version Restored',
        description: `Successfully restored ${category} to version ${versionToRestore.metadata.version}`
      });
      return true;
    } else {
      toast({
        title: 'Restore Failed',
        description: `Failed to restore ${category} to version ${versionToRestore.metadata.version}`,
        variant: 'destructive'
      });
      return false;
    }
    
  } catch (error) {
    console.error('Error restoring version:', error);
    toast({
      title: 'Restore Failed',
      description: 'An error occurred while restoring the previous version',
      variant: 'destructive'
    });
    return false;
  }
}

/**
 * Get audit trail information for a category
 */
export async function getAuditTrail(
  category: DataCategory,
  limit = 50
): Promise<VersionMetadata[]> {
  try {
    const { data, error } = await supabase
      .from(VERSION_HISTORY_TABLE)
      .select('metadata')
      .eq('category', category)
      .order('version', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching audit trail:', error);
      return [];
    }
    
    return data.map(item => item.metadata);
  } catch (error) {
    console.error('Error getting audit trail:', error);
    return [];
  }
}
