/**
 * Emergency Data Recovery System
 * 
 * This module provides a comprehensive solution for the persistent data loss issues.
 * It implements multiple redundant storage mechanisms and aggressive recovery techniques
 * to ensure data is never lost again.
 */

import superPersistentStorage, { DataCategory } from './superPersistentStorage';
import { CompanyDetails } from '@/contexts/CompanyContext';
import type { Client } from '@/types/client';
import type { QuoteData as Quote } from '@/types/quote';
import type { InvoiceData as Invoice } from '@/types/invoice';

// Redundant storage keys
const STORAGE_KEYS = {
  COMPANY: [
    'companyDetails',
    'companyDetails_backup',
    'COMPANY_DATA', 
    'MOK_COMPANY_INFO',
    'COMPANY_BACKUP'
  ],
  CLIENTS: [
    'clients',
    'CLIENTS',
    'PERSISTENT_CLIENTS', 
    'ALTERNATE_1', 
    'ALTERNATE_2',
    'MOK_CLIENTS_BACKUP'
  ],
  QUOTES: [
    'quotes',
    'savedQuotes',
    'QUOTES_DATA', 
    'MOK_QUOTES_BACKUP'
  ],
  INVOICES: [
    'invoices',
    'savedInvoices',
    'INVOICES_DATA', 
    'MOK_INVOICES_BACKUP'
  ]
};

/**
 * Attempt to recover data from any available source
 */
export const runEmergencyRecovery = async (): Promise<boolean> => {
  console.log('🚨 EMERGENCY DATA RECOVERY: Starting recovery process...');
  
  try {
    // Log storage diagnostics
    logStorageDiagnostics();
    
    // 1. Recover company data
    await recoverCompanyData();
    
    // 2. Recover client data
    await recoverClientData();
    
    // 3. Recover quotes and invoices
    await recoverQuotesData();
    await recoverInvoicesData();
    
    // 4. Force storage to write all recovered data to all persistence mechanisms
    await forceWriteAllData();
    
    console.log('✅ EMERGENCY DATA RECOVERY: Recovery process completed');
    return true;
  } catch (error) {
    console.error('❌ EMERGENCY DATA RECOVERY: Recovery process failed', error);
    return false;
  }
};

/**
 * Log diagnostics about the current storage state
 */
const logStorageDiagnostics = (): void => {
  console.log('📊 Storage Diagnostics:');
  
  // Check localStorage availability
  let localStorageAvailable = false;
  try {
    const testKey = 'storage_test';
    localStorage.setItem(testKey, 'test');
    if (localStorage.getItem(testKey) === 'test') {
      localStorageAvailable = true;
      localStorage.removeItem(testKey);
    }
  } catch (e) {
    console.error('❌ localStorage not available:', e);
  }
  console.log('localStorage available:', localStorageAvailable);
  
  // Check indexedDB availability
  let indexedDBAvailable = !!window.indexedDB;
  console.log('indexedDB available:', indexedDBAvailable);
  
  // Log all localStorage keys
  if (localStorageAvailable) {
    const allKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        allKeys.push(key);
      }
    }
    console.log('All localStorage keys:', allKeys);
  }
};

/**
 * Recover company data from any available source
 */
const recoverCompanyData = async (): Promise<CompanyDetails | null> => {
  console.log('🔄 Attempting to recover company data...');
  
  let recoveredData: CompanyDetails | null = null;
  
  // 1. Try all localStorage keys first
  for (const key of STORAGE_KEYS.COMPANY) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data) as CompanyDetails;
        if (parsed && parsed.name) {
          console.log(`✅ Recovered company data from localStorage key: ${key}`);
          recoveredData = parsed;
          break;
        }
      }
    } catch (e) {
      console.warn(`⚠️ Failed to parse data from localStorage key: ${key}`, e);
    }
  }
  
  // 2. If not found in localStorage, try IndexedDB
  if (!recoveredData) {
    try {
      const data = await superPersistentStorage.load<CompanyDetails>(DataCategory.COMPANY);
      if (data && data.name) {
        console.log('✅ Recovered company data from IndexedDB');
        recoveredData = data;
      }
    } catch (e) {
      console.warn('⚠️ Failed to recover company data from IndexedDB', e);
    }
  }
  
  // 3. Save the recovered data to all storage mechanisms
  if (recoveredData) {
    await saveCompanyDataToAllStorages(recoveredData);
  } else {
    console.warn('⚠️ No company data could be recovered from any source');
  }
  
  return recoveredData;
};

/**
 * Save company data to all storage mechanisms
 */
const saveCompanyDataToAllStorages = async (data: CompanyDetails): Promise<void> => {
  console.log('💾 Saving company data to all storage mechanisms...');
  
  // 1. Save to all localStorage keys
  for (const key of STORAGE_KEYS.COMPANY) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`⚠️ Failed to save to localStorage key: ${key}`, e);
    }
  }
  
  // 2. Save to IndexedDB
  try {
    await superPersistentStorage.save(DataCategory.COMPANY, data);
  } catch (e) {
    console.warn('⚠️ Failed to save to IndexedDB', e);
  }
  
  // 3. Save to sessionStorage as well
  try {
    sessionStorage.setItem('companyDetails', JSON.stringify(data));
  } catch (e) {
    console.warn('⚠️ Failed to save to sessionStorage', e);
  }
};

/**
 * Recover client data from any available source
 */
const recoverClientData = async (): Promise<Client[] | null> => {
  console.log('🔄 Attempting to recover client data...');
  
  let recoveredData: Client[] | null = null;
  
  // 1. Try all localStorage keys first
  for (const key of STORAGE_KEYS.CLIENTS) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data) as Client[];
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          console.log(`✅ Recovered client data from localStorage key: ${key} (${parsed.length} clients)`);
          recoveredData = parsed;
          break;
        }
      }
    } catch (e) {
      console.warn(`⚠️ Failed to parse data from localStorage key: ${key}`, e);
    }
  }
  
  // 2. If not found in localStorage, try IndexedDB
  if (!recoveredData) {
    try {
      const data = await superPersistentStorage.load<Client[]>(DataCategory.CLIENTS);
      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`✅ Recovered client data from IndexedDB (${data.length} clients)`);
        recoveredData = data;
      }
    } catch (e) {
      console.warn('⚠️ Failed to recover client data from IndexedDB', e);
    }
  }
  
  // 3. Save the recovered data to all storage mechanisms
  if (recoveredData) {
    await saveClientDataToAllStorages(recoveredData);
  } else {
    console.warn('⚠️ No client data could be recovered from any source');
  }
  
  return recoveredData;
};

/**
 * Save client data to all storage mechanisms
 */
const saveClientDataToAllStorages = async (data: Client[]): Promise<void> => {
  console.log('💾 Saving client data to all storage mechanisms...');
  
  // 1. Save to all localStorage keys
  for (const key of STORAGE_KEYS.CLIENTS) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`⚠️ Failed to save to localStorage key: ${key}`, e);
    }
  }
  
  // 2. Save to IndexedDB
  try {
    await superPersistentStorage.save(DataCategory.CLIENTS, data);
  } catch (e) {
    console.warn('⚠️ Failed to save to IndexedDB', e);
  }
  
  // 3. Save to sessionStorage as well
  try {
    sessionStorage.setItem('clients', JSON.stringify(data));
  } catch (e) {
    console.warn('⚠️ Failed to save to sessionStorage', e);
  }
};

/**
 * Recover quotes data from any available source
 */
const recoverQuotesData = async (): Promise<Quote[] | null> => {
  console.log('🔄 Attempting to recover quotes data...');
  
  let recoveredData: Quote[] | null = null;
  
  // 1. Try all localStorage keys first
  for (const key of STORAGE_KEYS.QUOTES) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data) as Quote[];
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          console.log(`✅ Recovered quotes data from localStorage key: ${key} (${parsed.length} quotes)`);
          recoveredData = parsed;
          break;
        }
      }
    } catch (e) {
      console.warn(`⚠️ Failed to parse data from localStorage key: ${key}`, e);
    }
  }
  
  // 2. If not found in localStorage, try IndexedDB
  if (!recoveredData) {
    try {
      const data = await superPersistentStorage.load<Quote[]>(DataCategory.QUOTES);
      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`✅ Recovered quotes data from IndexedDB (${data.length} quotes)`);
        recoveredData = data;
      }
    } catch (e) {
      console.warn('⚠️ Failed to recover quotes data from IndexedDB', e);
    }
  }
  
  // 3. Save the recovered data to all storage mechanisms
  if (recoveredData) {
    await saveQuotesDataToAllStorages(recoveredData);
  } else {
    console.warn('⚠️ No quotes data could be recovered from any source');
  }
  
  return recoveredData;
};

/**
 * Save quotes data to all storage mechanisms
 */
const saveQuotesDataToAllStorages = async (data: Quote[]): Promise<void> => {
  console.log('💾 Saving quotes data to all storage mechanisms...');
  
  // 1. Save to all localStorage keys
  for (const key of STORAGE_KEYS.QUOTES) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`⚠️ Failed to save to localStorage key: ${key}`, e);
    }
  }
  
  // 2. Save to IndexedDB
  try {
    await superPersistentStorage.save(DataCategory.QUOTES, data);
  } catch (e) {
    console.warn('⚠️ Failed to save to IndexedDB', e);
  }
  
  // 3. Save to sessionStorage as well
  try {
    sessionStorage.setItem('quotes', JSON.stringify(data));
  } catch (e) {
    console.warn('⚠️ Failed to save to sessionStorage', e);
  }
};

/**
 * Recover invoices data from any available source
 */
const recoverInvoicesData = async (): Promise<Invoice[] | null> => {
  console.log('🔄 Attempting to recover invoices data...');
  
  let recoveredData: Invoice[] | null = null;
  
  // 1. Try all localStorage keys first
  for (const key of STORAGE_KEYS.INVOICES) {
    try {
      const data = localStorage.getItem(key);
      if (data) {
        const parsed = JSON.parse(data) as Invoice[];
        if (parsed && Array.isArray(parsed) && parsed.length > 0) {
          console.log(`✅ Recovered invoices data from localStorage key: ${key} (${parsed.length} invoices)`);
          recoveredData = parsed;
          break;
        }
      }
    } catch (e) {
      console.warn(`⚠️ Failed to parse data from localStorage key: ${key}`, e);
    }
  }
  
  // 2. If not found in localStorage, try IndexedDB
  if (!recoveredData) {
    try {
      const data = await superPersistentStorage.load<Invoice[]>(DataCategory.INVOICES);
      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`✅ Recovered invoices data from IndexedDB (${data.length} invoices)`);
        recoveredData = data;
      }
    } catch (e) {
      console.warn('⚠️ Failed to recover invoices data from IndexedDB', e);
    }
  }
  
  // 3. Save the recovered data to all storage mechanisms
  if (recoveredData) {
    await saveInvoicesDataToAllStorages(recoveredData);
  } else {
    console.warn('⚠️ No invoices data could be recovered from any source');
  }
  
  return recoveredData;
};

/**
 * Save invoices data to all storage mechanisms
 */
const saveInvoicesDataToAllStorages = async (data: Invoice[]): Promise<void> => {
  console.log('💾 Saving invoices data to all storage mechanisms...');
  
  // 1. Save to all localStorage keys
  for (const key of STORAGE_KEYS.INVOICES) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`⚠️ Failed to save to localStorage key: ${key}`, e);
    }
  }
  
  // 2. Save to IndexedDB
  try {
    await superPersistentStorage.save(DataCategory.INVOICES, data);
  } catch (e) {
    console.warn('⚠️ Failed to save to IndexedDB', e);
  }
  
  // 3. Save to sessionStorage as well
  try {
    sessionStorage.setItem('invoices', JSON.stringify(data));
  } catch (e) {
    console.warn('⚠️ Failed to save to sessionStorage', e);
  }
};

/**
 * Force write all data to all persistence mechanisms
 */
const forceWriteAllData = async (): Promise<void> => {
  console.log('🔄 Force writing all data to all persistence mechanisms...');
  
  try {
    // Force synchronization of storage mechanisms - flush all pending writes
    // Save dummy data to each category to force a sync
    const categories = Object.values(DataCategory);
    for (const category of categories) {
      try {
        // Get existing data to preserve it
        const existingData = await superPersistentStorage.load(category);
        // Save it back to force a sync
        if (existingData) {
          await superPersistentStorage.save(category, existingData);
        }
      } catch (err) {
        console.warn(`⚠️ Failed to sync category ${category}`, err);
      }
    }
    console.log('✅ Forced sync of all stores completed');
  } catch (e) {
    console.warn('⚠️ Failed to force sync all stores', e);
  }
};

/**
 * Initialize the emergency recovery system by adding it to the window for debugging
 * and running recovery at startup
 */
export const initializeEmergencyRecovery = async (): Promise<void> => {
  console.log('🚀 Initializing emergency data recovery system...');
  
  // Add to window for debugging
  (window as any).runEmergencyRecovery = runEmergencyRecovery;
  (window as any).logStorageDiagnostics = logStorageDiagnostics;
  
  // Run recovery immediately at startup
  await runEmergencyRecovery();
  
  // Set up a failsafe check to run after the app is fully loaded
  setTimeout(async () => {
    // Check if any data is missing after startup and run recovery again if needed
    const companyData = localStorage.getItem('companyDetails');
    if (!companyData) {
      console.warn('⚠️ Company data still missing after startup, running recovery again...');
      await runEmergencyRecovery();
    }
  }, 10000);
};
