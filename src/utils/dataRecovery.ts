/**
 * Data Recovery Utility
 * 
 * Provides tools to recover from data corruption or sync conflicts
 * between local and server data.
 */

import { DataCategory } from './superPersistentStorage';
import superPersistentStorage from './superPersistentStorage';
import { supabase } from './supabaseClient';
import { toast } from '@/hooks/use-toast';

export interface DataVersion {
  data: any;
  timestamp: string;
  source: 'local' | 'server' | 'backup';
}

export interface ConflictResolutionOptions {
  preferLocal: boolean;
  preferServer: boolean;
  preferNewer: boolean;
  manual: boolean;
}

/**
 * Compare two data versions by their timestamps
 */
function compareTimestamps(a: string, b: string): number {
  const timestampA = new Date(a).getTime();
  const timestampB = new Date(b).getTime();
  
  if (isNaN(timestampA) && isNaN(timestampB)) return 0;
  if (isNaN(timestampA)) return -1;
  if (isNaN(timestampB)) return 1;
  
  return timestampA - timestampB;
}

/**
 * Get current timestamp in ISO format
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Add metadata to data object
 */
function addMetadata(data: any): any {
  if (!data) return { _meta: { timestamp: getTimestamp() } };
  
  return {
    ...data,
    _meta: {
      ...(data._meta || {}),
      timestamp: getTimestamp(),
      lastUpdated: getTimestamp()
    }
  };
}

/**
 * Extract timestamp from data object
 */
function getDataTimestamp(data: any): string {
  if (!data) return '';
  if (data._meta?.timestamp) return data._meta.timestamp;
  if (data._meta?.lastUpdated) return data._meta.lastUpdated;
  return '';
}

/**
 * Fetch all available versions of data for a category
 */
export async function getDataVersions(category: DataCategory): Promise<DataVersion[]> {
  const versions: DataVersion[] = [];
  
  try {
    // Get local version
    const localData = await superPersistentStorage.load(category);
    if (localData) {
      versions.push({
        data: localData,
        timestamp: getDataTimestamp(localData) || getTimestamp(),
        source: 'local'
      });
    }
    
    // Get server version
    const { data: serverData, error } = await supabase
      .from('app_data')
      .select('data, updated_at')
      .eq('type', category)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (!error && serverData) {
      versions.push({
        data: serverData.data,
        timestamp: serverData.updated_at || getTimestamp(),
        source: 'server'
      });
    }
    
    // Get backup version from localStorage (emergency backup)
    const backupKey = `mok_${category}_backup2`;
    try {
      const backupJson = localStorage.getItem(backupKey);
      if (backupJson) {
        const backupData = JSON.parse(backupJson);
        if (backupData) {
          versions.push({
            data: backupData,
            timestamp: getDataTimestamp(backupData) || getTimestamp(),
            source: 'backup'
          });
        }
      }
    } catch (err) {
      console.error('Error fetching backup version:', err);
    }
    
    return versions;
    
  } catch (error) {
    console.error('Error fetching data versions:', error);
    return versions;
  }
}

/**
 * Detect if there are conflicts between local and server data
 */
export async function detectConflicts(category: DataCategory): Promise<boolean> {
  try {
    const versions = await getDataVersions(category);
    
    // Need at least two versions to have a conflict
    if (versions.length < 2) return false;
    
    // Find local and server versions
    const localVersion = versions.find(v => v.source === 'local');
    const serverVersion = versions.find(v => v.source === 'server');
    
    // If we don't have both local and server versions, no conflict
    if (!localVersion || !serverVersion) return false;
    
    // Compare data content
    const localJson = JSON.stringify(localVersion.data);
    const serverJson = JSON.stringify(serverVersion.data);
    
    // If data is the same, no conflict
    if (localJson === serverJson) return false;
    
    // Check timestamps - if timestamps match but data doesn't, we have a conflict
    // If one is significantly newer than the other, we might prefer that one
    const timeDiff = Math.abs(
      new Date(localVersion.timestamp).getTime() - 
      new Date(serverVersion.timestamp).getTime()
    );
    
    // If the difference is less than 5 minutes, consider it a conflict
    // because both might have been edited close to each other
    return timeDiff < 5 * 60 * 1000;
    
  } catch (error) {
    console.error('Error detecting conflicts:', error);
    return false;
  }
}

/**
 * Resolve conflicts between local and server data
 */
export async function resolveConflicts(
  category: DataCategory, 
  options: ConflictResolutionOptions = { 
    preferLocal: false, 
    preferServer: false, 
    preferNewer: true, 
    manual: false 
  }
): Promise<boolean> {
  try {
    const versions = await getDataVersions(category);
    
    // Find local and server versions
    const localVersion = versions.find(v => v.source === 'local');
    const serverVersion = versions.find(v => v.source === 'server');
    
    // If we don't have both local and server versions, no conflict to resolve
    if (!localVersion || !serverVersion) return false;
    
    let resolvedData: any;
    
    // Apply conflict resolution strategy
    if (options.preferLocal) {
      resolvedData = localVersion.data;
    } else if (options.preferServer) {
      resolvedData = serverVersion.data;
    } else if (options.preferNewer) {
      // Compare timestamps and take the newer version
      const comparison = compareTimestamps(
        localVersion.timestamp, 
        serverVersion.timestamp
      );
      
      resolvedData = comparison >= 0 ? localVersion.data : serverVersion.data;
    } else if (options.manual) {
      // For manual resolution, we don't do anything here
      // The application will need to handle this separately
      return false;
    } else {
      // Default is to prefer local data
      resolvedData = localVersion.data;
    }
    
    // Add metadata with updated timestamp
    resolvedData = addMetadata(resolvedData);
    
    // Save the resolved data both locally and to the server
    await superPersistentStorage.save(category, resolvedData);
    
    // Update server data
    const { error } = await supabase
      .from('app_data')
      .upsert({
        type: category,
        data_id: `${category}_main`,
        data: resolvedData,
        updated_at: new Date()
      });
    
    if (error) {
      console.error('Error updating server data during conflict resolution:', error);
      return false;
    }
    
    toast({
      title: 'Data conflict resolved',
      description: `The ${category} data has been synchronized successfully.`,
      duration: 3000
    });
    
    return true;
    
  } catch (error) {
    console.error('Error resolving conflicts:', error);
    return false;
  }
}

/**
 * Recover data from the best available source
 */
export async function recoverData(category: DataCategory): Promise<boolean> {
  try {
    const versions = await getDataVersions(category);
    
    if (versions.length === 0) {
      toast({
        title: 'Recovery failed',
        description: `No data found for ${category}. Nothing to recover.`,
        variant: 'destructive',
        duration: 5000
      });
      return false;
    }
    
    // Sort versions by timestamp, newest first
    versions.sort((a, b) => 
      compareTimestamps(b.timestamp, a.timestamp)
    );
    
    // Get the newest version
    const newestVersion = versions[0];
    
    // Save the recovered data
    await superPersistentStorage.save(category, newestVersion.data);
    
    toast({
      title: 'Data recovered',
      description: `Successfully recovered ${category} data from ${newestVersion.source}.`,
      duration: 3000
    });
    
    return true;
    
  } catch (error) {
    console.error('Error recovering data:', error);
    
    toast({
      title: 'Recovery failed',
      description: `Failed to recover ${category} data. See console for details.`,
      variant: 'destructive',
      duration: 5000
    });
    
    return false;
  }
}

/**
 * Perform a full data recovery for all categories
 */
export async function fullRecovery(): Promise<{
  success: boolean;
  recovered: string[];
  failed: string[];
}> {
  const results = {
    success: true,
    recovered: [] as string[],
    failed: [] as string[]
  };
  
  // Get all data categories
  const categories = Object.values(DataCategory);
  
  for (const category of categories) {
    try {
      const success = await recoverData(category);
      if (success) {
        results.recovered.push(category);
      } else {
        results.failed.push(category);
        results.success = false;
      }
    } catch (error) {
      console.error(`Error recovering category ${category}:`, error);
      results.failed.push(category);
      results.success = false;
    }
  }
  
  if (results.success) {
    toast({
      title: 'Full recovery completed',
      description: `Successfully recovered data for all categories.`,
      duration: 5000
    });
  } else {
    toast({
      title: 'Partial recovery completed',
      description: `Recovered ${results.recovered.length} categories. ${results.failed.length} categories failed.`,
      variant: 'destructive',
      duration: 5000
    });
  }
  
  return results;
}
