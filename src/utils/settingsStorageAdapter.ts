/**
 * Settings Storage Adapter
 * 
 * This adapter ensures application settings and user preferences are never lost
 * by utilizing the SuperPersistentStorage system with multiple redundant storage mechanisms.
 */

import superPersistentStorage, { DataCategory } from './superPersistentStorage';
import { SyncCallbacks, saveWithSync, loadWithSync } from './syncStorageUtils';

// Interfaces for settings data
export interface UserPreference {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  notifications: {
    email: boolean;
    app: boolean;
    browser: boolean;
  };
  sidebar: {
    expanded: boolean;
    favorites: string[];
  };
  dashboardLayout: {
    widgets: {
      id: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
      visible: boolean;
    }[];
  };
}

export interface AppSettings {
  version: string;
  lastUpdated: string;
  features: {
    [key: string]: boolean;
  };
  apiKeys: {
    [key: string]: string;
  };
  taxRates: {
    [key: string]: number;
  };
  modules: {
    [key: string]: {
      enabled: boolean;
      version: string;
      settings: Record<string, any>;
    };
  };
}

export interface SettingsData {
  userPreferences: UserPreference;
  appSettings: AppSettings;
}

// Default settings
const defaultUserPreference: UserPreference = {
  theme: 'system',
  language: 'en',
  currency: 'ZAR',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
  notifications: {
    email: true,
    app: true,
    browser: true
  },
  sidebar: {
    expanded: true,
    favorites: []
  },
  dashboardLayout: {
    widgets: []
  }
};

const defaultAppSettings: AppSettings = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  features: {
    quotes: true,
    invoices: true,
    accounting: true,
    hr: true,
    reports: true
  },
  apiKeys: {},
  taxRates: {
    default: 15,
    reduced: 7.5,
    zero: 0
  },
  modules: {}
};

const defaultSettings: SettingsData = {
  userPreferences: defaultUserPreference,
  appSettings: defaultAppSettings
};

/**
 * Load settings from storage with comprehensive fallback
 */
export const initializeSettingsStorage = async (): Promise<boolean> => {
  try {
    console.log('🔧 Initializing settings storage adapter...');
    
    // Check for existing stored settings in various locations
    await diagnosticCheckStorage();
    
    // Pre-load settings to ensure they're cached and available
    await loadSettings();
    console.log('✅ Settings loaded successfully');
    
    return true;
  } catch (error) {
    console.error('❌ Error initializing settings storage:', error instanceof Error ? error.message : error);
    // Even if initialization fails, try to use fallback methods
    try {
      console.log('🔄 Attempting fallback initialization...');
      await repairStorageConsistency();
      return true;
    } catch (fallbackError) {
      console.error('💥 Fallback initialization failed:', fallbackError instanceof Error ? fallbackError.message : fallbackError);
      return false;
    }
  }
};

/**
 * Run diagnostic checks on all storage mechanisms
 */
async function diagnosticCheckStorage(): Promise<void> {
  console.log('🔍 Running storage diagnostics...');
  
  // Check localStorage
  try {
    const testKey = 'settings_diagnostic_test';
    localStorage.setItem(testKey, 'test');
    const testValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    if (testValue === 'test') {
      console.log('✅ localStorage working correctly');
    } else {
      console.warn('⚠️ localStorage test failed: unexpected value');
    }
  } catch (e) {
    console.error('❌ localStorage test failed with error:', e instanceof Error ? e.message : e);
  }
  
  // Check existing settings in localStorage
  const keys = [
    'settings', 'appSettings', 'userPreferences', 'app_config', 
    'mok_settings', 'mok_settings_backup1', 'mok_emergency_settings',
    'mok_SETTINGS', 'mok_SETTINGS_backup1', 'mok_emergency_SETTINGS'
  ];
  
  let diagnosticResults = {};
  
  for (const key of keys) {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          const parsed = JSON.parse(value);
          diagnosticResults[key] = {
            exists: true,
            size: value.length,
            hasUserPreferences: !!parsed.userPreferences,
            hasAppSettings: !!parsed.appSettings,
            timestamp: new Date().toISOString()
          };
        } catch (parseError) {
          diagnosticResults[key] = { exists: true, valid: false, error: 'Parse error' };
        }
      }
    } catch (e) {
      diagnosticResults[key] = { exists: false, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }
  
  console.log('📊 Storage diagnostic results:', diagnosticResults);
}

/**
 * Attempt to repair storage inconsistencies by copying valid data between storage mechanisms
 */
/**
 * Save settings to multiple storage locations for redundancy
 */
async function propagateSettings(settings: SettingsData): Promise<void> {
  console.log('📦 Propagating settings to all storage locations for redundancy');
  
  try {
    // Convert to JSON once for efficiency
    const jsonData = JSON.stringify(settings);
    
    // Store in memory cache (fastest)
    try {
      // Save to localStorage with multiple keys for redundancy
      localStorage.setItem('settings', jsonData);
      localStorage.setItem('mok_settings', jsonData);
      localStorage.setItem('mok_settings_backup1', jsonData);
      localStorage.setItem('mok_settings_backup2', jsonData);
      localStorage.setItem('mok_emergency_settings', jsonData);
      console.log('✅ Settings saved to localStorage successfully');
    } catch (e) {
      console.warn('⚠️ Failed to save settings to localStorage:', e instanceof Error ? e.message : e);
    }
    
    try {
      // Also save to sessionStorage for additional redundancy
      sessionStorage.setItem('settings', jsonData);
      sessionStorage.setItem('mok_settings', jsonData);
      console.log('✅ Settings saved to sessionStorage successfully');
    } catch (e) {
      console.warn('⚠️ Failed to save settings to sessionStorage:', e instanceof Error ? e.message : e);
    }
    
    // Save to IndexedDB in the background (don't await)
    superPersistentStorage.save(DataCategory.SETTINGS, settings)
      .then(result => {
        if (result) {
          console.log('✅ Settings saved to IndexedDB successfully');
        } else {
          console.warn('⚠️ Failed to save settings to IndexedDB');
        }
      })
      .catch(error => {
        console.error('❌ Error saving settings to IndexedDB:', error instanceof Error ? error.message : error);
      });
    
    // Dispatch a storage change event to notify components
    try {
      const event = new CustomEvent('mokstoragechanged', { 
        detail: { category: 'settings', action: 'save' } 
      });
      window.dispatchEvent(event);
    } catch (e) {
      console.error('Failed to dispatch storage change event:', e instanceof Error ? e.message : e);
    }
  } catch (e) {
    console.error('Error in propagateSettings:', e instanceof Error ? e.message : e);
  }
}

async function repairStorageConsistency(): Promise<void> {
  console.log('🔧 Attempting to repair storage consistency...');
  
  // Find a valid settings object in any storage location
  const keys = [
    'settings', 'appSettings', 'userPreferences', 'app_config', 
    'mok_settings', 'mok_settings_backup1', 'mok_emergency_settings',
    'mok_SETTINGS', 'mok_SETTINGS_backup1', 'mok_emergency_SETTINGS'
  ];
  
  let validSettings = null;
  
  // Try to find any valid settings object
  for (const key of keys) {
    try {
      const data = localStorage.getItem(key);
      if (!data) continue;
      
      const parsed = JSON.parse(data);
      if (parsed && (parsed.userPreferences || parsed.appSettings)) {
        console.log(`Found valid settings in '${key}'`);
        
        // Create a complete settings object with defaults for any missing parts
        validSettings = {
          userPreferences: {
            ...defaultUserPreference,
            ...(parsed.userPreferences || {})
          },
          appSettings: {
            ...defaultAppSettings,
            ...(parsed.appSettings || {})
          }
        };
        
        break;
      }
    } catch (e) {
      console.warn(`Failed to parse settings from '${key}':`, e instanceof Error ? e.message : e);
    }
  }
  
  // If we found valid settings, propagate them to all storage locations
  if (validSettings) {
    console.log('✅ Found valid settings, propagating to all storage locations');
    await propagateSettings(validSettings);
  } else {
    console.log('⚠️ No valid settings found, using defaults');
    await propagateSettings(defaultSettings);
  }
}

export const loadSettings = async (callbacks?: SyncCallbacks): Promise<SettingsData> => {
  try {
    console.log('SettingsStorageAdapter: Loading settings...');
    
    // Show sync status if callbacks provided
    callbacks?.onSyncStart?.('Loading settings...');
    
    // Create a promise with timeout to handle potentially stuck operations
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.warn('SettingsStorageAdapter: Load operation timed out, using fallback');
        resolve(null);
      }, 5000); // Increase timeout to 5 seconds
    });
    
    // Try to load from super persistent storage first with timeout protection
    let data: SettingsData | null = null;
    let superPersistentError: any = null;
    
    try {
      // First attempt - normal load path
      const superPersistentPromise = loadWithSync<SettingsData>(DataCategory.SETTINGS, callbacks).catch(e => {
        superPersistentError = e;
        console.error('SettingsStorageAdapter: Error in loadWithSync', e instanceof Error ? 
          { message: e.message, stack: e.stack } : JSON.stringify(e));
        return null;
      });
      
      // Race between the load operation and timeout
      data = await Promise.race([superPersistentPromise, timeoutPromise]);
      
      if (data && data.userPreferences && data.appSettings) {
        console.log('SettingsStorageAdapter: Loaded settings from super persistent storage');
        
        // Ensure this data is saved in multiple locations for redundancy
        await propagateSettings(data);
        
        // Return the combined settings
        callbacks?.onSyncSuccess?.('Settings loaded successfully');
        return data;
      }
    } catch (e) {
      console.error('SettingsStorageAdapter: Error in loadWithSync try/catch', 
        e instanceof Error ? { message: e.message, stack: e.stack } : e);
      superPersistentError = e;
    }
    
    // Log diagnostic information about what went wrong
    console.warn('SettingsStorageAdapter: SuperPersistentStorage load failed, falling back to direct storage access');
    console.warn('SuperPersistentStorage error details:', superPersistentError);
    
    // Fallback: If super persistent storage failed, try direct access to localStorage with extensive fallbacks
    try {
      // Try multiple possible legacy keys in localStorage
      const legacyKeys = [
        'settings', 'appSettings', 'userPreferences', 'app_config',
        'mok_settings', 'mok_settings_backup1', 'mok_settings_backup2', 'mok_emergency_settings',
        'mok_SETTINGS', 'mok_SETTINGS_backup1', 'mok_emergency_SETTINGS',
        // Try with additional prefixes/variations
        'mokm_settings', 'mokm_settings_backup',
        'savedSettings', 'app.settings', 'user.settings'
      ];
      
      for (const key of legacyKeys) {
        try {
          const legacyData = localStorage.getItem(key);
          if (!legacyData) continue;
          
          const parsedData = JSON.parse(legacyData);
          
          // Determine if this is a complete settings object or just part of it
          if (parsedData.userPreferences && parsedData.appSettings) {
            console.log(`SettingsStorageAdapter: Loaded complete settings from key ${key}`);
            
            // Ensure this data is propagated to all storage locations
            await propagateSettings(parsedData);
            
            callbacks?.onSyncSuccess?.('Settings loaded successfully from fallback');
            return parsedData;
          } else if (key === 'userPreferences' || parsedData.theme || parsedData.language) {
            // This appears to be just user preferences - combine with default app settings
            console.log(`SettingsStorageAdapter: Found partial settings (preferences) in key ${key}`);
            
            const completeSettings = {
              userPreferences: {
                ...defaultUserPreference,
                ...(typeof parsedData === 'object' ? parsedData : {})
              },
              appSettings: defaultAppSettings
            };
            
            // Save this combined data for future use
            await propagateSettings(completeSettings);
            
            callbacks?.onSyncSuccess?.('Settings partially recovered and restored');
            return completeSettings;
          } else if (key === 'appSettings' || parsedData.version || parsedData.features) {
            // This appears to be just app settings - combine with default user preferences
            console.log(`SettingsStorageAdapter: Found partial settings (app settings) in key ${key}`);
            
            const completeSettings = {
              userPreferences: defaultUserPreference,
              appSettings: {
                ...defaultAppSettings,
                ...(typeof parsedData === 'object' ? parsedData : {})
              }
            };
            
            // Save this combined data for future use
            await propagateSettings(completeSettings);
            
            callbacks?.onSyncSuccess?.('Settings partially recovered and restored');
            return completeSettings;
          }
        } catch (error) {
          console.warn(`SettingsStorageAdapter: Non-critical error with key ${key}`, error);
          // Continue to next key
        }
      }
    } catch (error) {
      console.error('SettingsStorageAdapter: Error in legacy storage section', error);
    }
    
    // If all else fails, create and save new default settings
    console.log('SettingsStorageAdapter: Creating new default settings');
    const freshSettings = { ...defaultSettings };
    
    try {
      // Save the default settings to all storage mechanisms for future use
      await propagateSettings(freshSettings);
      
      callbacks?.onSyncSuccess?.('Default settings created successfully');
    } catch (e) {
      console.error('Failed to save default settings:', e instanceof Error ? e.message : e);
      callbacks?.onSyncError?.('Error creating default settings');
    }
    
    // Always return valid settings, even if saving failed
    return freshSettings;
  } catch (error) {
    console.error('SettingsStorageAdapter: Critical error loading settings', error);
    callbacks?.onSyncError?.('Failed to load settings');
    return { ...defaultSettings };
  }
};

/**
 * Save settings with multi-layer persistence
 */
export const saveSettings = async (settings: SettingsData, callbacks?: SyncCallbacks): Promise<boolean> => {
  try {
    if (!settings || !settings.userPreferences || !settings.appSettings) {
      console.error('SettingsStorageAdapter: Invalid settings data', settings);
      return false;
    }
    
    console.log('SettingsStorageAdapter: Saving settings...');
    
    // Show sync status if callbacks provided
    callbacks?.onSyncStart?.('Saving settings...');
    
    // Update last updated timestamp
    const updatedSettings = {
      ...settings,
      appSettings: {
        ...settings.appSettings,
        lastUpdated: new Date().toISOString()
      }
    };
    
    // Save to super persistent storage with sync status
    const success = await saveWithSync(DataCategory.SETTINGS, updatedSettings, callbacks);
    
    // Also save to legacy storage for compatibility
    localStorage.setItem('settings', JSON.stringify(updatedSettings));
    
    // Create additional backups in different keys for legacy compatibility
    localStorage.setItem('userPreferences', JSON.stringify(updatedSettings.userPreferences));
    localStorage.setItem('appSettings', JSON.stringify(updatedSettings.appSettings));
    
    if (success) {
      console.log('Settings saved successfully:', success);
      callbacks?.onSyncSuccess?.('Settings saved successfully');
    } else {
      console.warn('SettingsStorageAdapter: Some storage mechanisms failed when saving settings');
    }
    
    return success;
  } catch (error) {
    console.error('SettingsStorageAdapter: Error saving settings', error);
    callbacks?.onSyncError?.('Failed to save settings');
    
    // Fall back to legacy storage as last resort
    try {
      localStorage.setItem('settings_emergency_backup', JSON.stringify(settings));
    } catch (fallbackError) {
      console.error('SettingsStorageAdapter: Even fallback storage failed', fallbackError);
    }
    
    return false;
  }
};

/**
 * Update user preferences only
 */
export const updateUserPreferences = async (preferences: Partial<UserPreference>, callbacks?: SyncCallbacks): Promise<boolean> => {
  try {
    // Load existing settings
    const settings = await loadSettings();
    
    // Update user preferences
    settings.userPreferences = {
      ...settings.userPreferences,
      ...preferences
    };
    
    // Save the updated settings
    const success = await saveSettings(settings, callbacks);
    if (success) {
      callbacks?.onSyncSuccess?.('User preferences updated successfully');
    }
    return success;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    callbacks?.onSyncError?.('Failed to update user preferences');
    return false;
  }
};

/**
 * Update app settings only
 */
export const updateAppSettings = async (newSettings: Partial<AppSettings>, callbacks?: SyncCallbacks): Promise<boolean> => {
  try {
    // Load existing settings
    const settings = await loadSettings();
    
    // Update app settings with deep merge
    settings.appSettings = deepMerge(settings.appSettings, newSettings);
    
    // Save the updated settings
    const success = await saveSettings(settings, callbacks);
    if (success) {
      callbacks?.onSyncSuccess?.('App settings updated successfully');
    }
    return success;
  } catch (error) {
    console.error('Error updating app settings:', error);
    callbacks?.onSyncError?.('Failed to update app settings');
    return false;
  }
};

/**
 * Helper function to deep merge objects
 */
export function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const output = { ...target };
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key as keyof typeof source])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key as keyof typeof source] });
        } else {
          (output as any)[key] = deepMerge(
            (target as any)[key],
            source[key as keyof typeof source] as any
          );
        }
      } else {
        Object.assign(output, { [key]: source[key as keyof typeof source] });
      }
    });
  }
  
  return output;
}

/**
 * Helper function to check if value is an object
 */
export function isObject(item: any): boolean {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * Reset all settings to default
 */
export const resetSettings = async (callbacks?: SyncCallbacks): Promise<boolean> => {
  try {
    callbacks?.onSyncStart?.('Resetting settings to default...');
    
    // Create default settings
    const defaultSettings: SettingsData = {
      userPreferences: defaultUserPreference,
      appSettings: defaultAppSettings
    };
    
    // Save default settings
    const success = await saveSettings(defaultSettings, callbacks);
    if (success) {
      callbacks?.onSyncSuccess?.('Settings reset successfully');
    }
    return success;
  } catch (error) {
    console.error('Error resetting settings:', error);
    callbacks?.onSyncError?.('Failed to reset settings');
    return false;
  }
};

/**
 * Create an enhanced settings adapter with sync status indicator integration
 * for better visual feedback when settings are being saved or loaded
 */
export const syncSettingsAdapter = {
  load: async (callbacks?: SyncCallbacks) => await loadSettings(callbacks),
  save: async (settings: SettingsData, callbacks?: SyncCallbacks) => await saveSettings(settings, callbacks),
  updateUserPreferences: async (preferences: Partial<UserPreference>, callbacks?: SyncCallbacks) => 
    await updateUserPreferences(preferences, callbacks),
  updateAppSettings: async (settings: Partial<AppSettings>, callbacks?: SyncCallbacks) => 
    await updateAppSettings(settings, callbacks),
  reset: async (callbacks?: SyncCallbacks) => await resetSettings(callbacks),
  initialize: async () => await initializeSettingsStorage()
};
