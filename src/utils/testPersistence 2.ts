/**
 * Utility for testing company data persistence
 * This can be run from the browser console to verify data persistence
 */

import { CompanyDetails } from '@/contexts/CompanyContext';
import { backupCompanyData, restoreCompanyDataFromBackup } from './companyDataPersistence';
import { syncCompanyData } from '@/integrations/supabase/companyOperations';

/**
 * Test the full persistence workflow
 */
export const testPersistence = async () => {
  console.log('🔍 Testing data persistence...');
  
  // Step 1: Check if we have existing data
  const existingData = localStorage.getItem('companyDetails');
  const existingPublicData = localStorage.getItem('publicCompanyDetails');
  
  console.log('Existing company data:', existingData ? 'YES' : 'NO');
  console.log('Existing public data:', existingPublicData ? 'YES' : 'NO');
  
  // Step 2: Create a backup
  console.log('Creating backup...');
  const backupCreated = backupCompanyData();
  console.log('Backup created:', backupCreated ? 'SUCCESS' : 'FAILED');
  
  // Step 3: Clear data (simulating logout or browser close)
  console.log('Simulating data loss...');
  localStorage.removeItem('companyDetails');
  localStorage.removeItem('publicCompanyDetails');
  
  // Step 4: Verify data is gone
  const clearedData = localStorage.getItem('companyDetails');
  const clearedPublicData = localStorage.getItem('publicCompanyDetails');
  
  console.log('Data after clearing:', clearedData ? 'STILL PRESENT (BAD)' : 'CLEARED (GOOD)');
  console.log('Public data after clearing:', clearedPublicData ? 'STILL PRESENT (BAD)' : 'CLEARED (GOOD)');
  
  // Step 5: Restore from backup
  console.log('Restoring from backup...');
  const restored = restoreCompanyDataFromBackup();
  console.log('Restore result:', restored ? 'SUCCESS' : 'FAILED');
  
  // Step 6: Verify data is restored
  const restoredData = localStorage.getItem('companyDetails');
  const restoredPublicData = localStorage.getItem('publicCompanyDetails');
  
  console.log('Data after restore:', restoredData ? 'RESTORED (GOOD)' : 'MISSING (BAD)');
  console.log('Public data after restore:', restoredPublicData ? 'RESTORED (GOOD)' : 'MISSING (BAD)');
  
  // Step 7: Test Supabase sync
  console.log('Testing Supabase sync...');
  try {
    await syncCompanyData();
    console.log('Supabase sync completed successfully');
  } catch (error) {
    console.error('Supabase sync failed:', error);
  }
  
  console.log('🏁 Persistence test complete!');
};

// Make it available in the global window object for console testing
if (typeof window !== 'undefined') {
  (window as any).testCompanyDataPersistence = testPersistence;
}
