/**
 * Utility for testing client data persistence
 * This can be run from the browser console to verify data persistence
 */

import { ClientsState, createClientDataBackup, restoreClientDataFromBackup } from './clientDataPersistence';
import { syncClientData } from '@/integrations/supabase/clientOperations';

/**
 * Test the full client data persistence workflow
 */
export const testClientPersistence = async () => {
  console.log('🔍 Testing client data persistence...');
  
  // Step 1: Check if we have existing data
  const existingData = localStorage.getItem('mokClients');
  
  console.log('Existing client data:', existingData ? 'YES' : 'NO');
  
  // Step 2: Create a backup
  console.log('Creating backup...');
  const backupCreated = createClientDataBackup();
  console.log('Backup created:', backupCreated ? 'SUCCESS' : 'FAILED');
  
  // Step 3: Check session storage backup
  const sessionBackup = sessionStorage.getItem('mokClientsBackup');
  console.log('Session storage backup:', sessionBackup ? 'FOUND' : 'NOT FOUND');
  
  // Step 4: Simulate data loss by clearing localStorage
  if (existingData) {
    const tempBackup = existingData;
    console.log('Simulating data loss...');
    localStorage.removeItem('mokClients');
    
    // Step 5: Verify data is gone
    const clearedData = localStorage.getItem('mokClients');
    console.log('Data after clearing:', clearedData ? 'STILL PRESENT (BAD)' : 'CLEARED (GOOD)');
    
    // Step 6: Restore from backup
    console.log('Restoring from backup...');
    const restored = restoreClientDataFromBackup();
    console.log('Restore result:', restored ? 'SUCCESS' : 'FAILED');
    
    // Step 7: Verify data is restored
    const restoredData = localStorage.getItem('mokClients');
    console.log('Data after restore:', restoredData ? 'RESTORED (GOOD)' : 'MISSING (BAD)');
    
    // If restore failed, put back the original data
    if (!restored && tempBackup) {
      localStorage.setItem('mokClients', tempBackup);
      console.log('Manually restored original data');
    }
  } else {
    console.log('No existing data to test restore with');
  }
  
  // Step 8: Test Supabase sync
  console.log('Testing Supabase sync...');
  try {
    await syncClientData();
    console.log('Supabase sync completed successfully');
  } catch (error) {
    console.error('Supabase sync failed:', error);
  }
  
  console.log('🏁 Client data persistence test complete!');
};

// Make it available in the global window object for console testing
if (typeof window !== 'undefined') {
  (window as any).testClientDataPersistence = testClientPersistence;
}
