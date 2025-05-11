/**
 * Accounting Storage Adapter
 * 
 * This adapter ensures accounting information is never lost by utilizing the
 * SuperPersistentStorage system with multiple redundant storage mechanisms.
 */

import superPersistentStorage, { DataCategory } from './superPersistentStorage';
import { createSyncStorageWrapper, SyncCallbacks } from './syncStorageUtils';

// Basic interfaces for accounting data
export interface Account {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  subtype?: string;
  balance: number;
  description?: string;
  isActive: boolean;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  entries: TransactionEntry[];
  status: 'draft' | 'posted' | 'voided';
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  attachment?: string;
}

export interface TransactionEntry {
  id: string;
  accountId: string;
  description?: string;
  debit: number;
  credit: number;
}

export interface AccountingData {
  accounts: Account[];
  transactions: Transaction[];
  settings: {
    fiscalYearStart: string;
    baseCurrency: string;
    decimalPrecision: number;
    taxRate: number;
  };
}

// Default empty state
const defaultAccountingData: AccountingData = {
  accounts: [],
  transactions: [],
  settings: {
    fiscalYearStart: '01-01',
    baseCurrency: 'ZAR',
    decimalPrecision: 2,
    taxRate: 15
  }
};

/**
 * Load accounting data from storage with comprehensive fallback
 */
export const loadAccountingData = async (): Promise<AccountingData> => {
  try {
    console.log('AccountingStorageAdapter: Loading accounting data...');
    
    // First try super persistent storage
    const data = await superPersistentStorage.load<AccountingData>(DataCategory.ACCOUNTING);
    
    if (data && data.accounts) {
      console.log(`AccountingStorageAdapter: Loaded ${data.accounts.length} accounts and ${data.transactions.length} transactions from super persistent storage`);
      
      // Also restore to legacy storage for compatibility
      localStorage.setItem('accountingData', JSON.stringify(data));
      
      return data;
    }
    
    // If super persistent storage failed, try legacy storage
    try {
      // Try multiple possible legacy keys
      const legacyKeys = ['accountingData', 'ACCOUNTING_DATA', 'accounts', 'financialData'];
      
      for (const key of legacyKeys) {
        const legacyData = localStorage.getItem(key);
        if (legacyData) {
          try {
            const parsedData = JSON.parse(legacyData);
            
            if (parsedData && (parsedData.accounts || parsedData.transactions)) {
              console.log(`AccountingStorageAdapter: Loaded accounting data from legacy storage (${key})`);
              
              // Fill in any missing parts with defaults
              const completeData: AccountingData = {
                accounts: parsedData.accounts || [],
                transactions: parsedData.transactions || [],
                settings: parsedData.settings || defaultAccountingData.settings
              };
              
              // Migrate to super persistent storage for future use
              await superPersistentStorage.save(DataCategory.ACCOUNTING, completeData);
              
              return completeData;
            }
          } catch (error) {
            console.error(`AccountingStorageAdapter: Error parsing legacy data from ${key}`, error);
          }
        }
      }
    } catch (error) {
      console.error('AccountingStorageAdapter: Error loading from legacy storage', error);
    }
    
    // If all else fails, return default empty state
    console.log('AccountingStorageAdapter: No accounting data found, using defaults');
    return { ...defaultAccountingData };
  } catch (error) {
    console.error('AccountingStorageAdapter: Error loading accounting data', error);
    return { ...defaultAccountingData };
  }
};

/**
 * Save accounting data with multi-layer persistence
 */
export const saveAccountingData = async (data: AccountingData): Promise<boolean> => {
  try {
    if (!data || !data.accounts) {
      console.error('AccountingStorageAdapter: Invalid accounting data', data);
      return false;
    }
    
    console.log(`AccountingStorageAdapter: Saving accounting data (${data.accounts.length} accounts, ${data.transactions.length} transactions)...`);
    
    // Save to super persistent storage
    const success = await superPersistentStorage.save(DataCategory.ACCOUNTING, data);
    
    // Also save to legacy storage for compatibility
    localStorage.setItem('accountingData', JSON.stringify(data));
    
    // Create additional backup
    localStorage.setItem('accountingData_backup', JSON.stringify(data));
    
    if (success) {
      console.log('AccountingStorageAdapter: Accounting data saved successfully');
    } else {
      console.warn('AccountingStorageAdapter: Some storage mechanisms failed when saving accounting data');
    }
    
    return success;
  } catch (error) {
    console.error('AccountingStorageAdapter: Error saving accounting data', error);
    
    // Fall back to legacy storage as last resort
    try {
      localStorage.setItem('accountingData_emergency_backup', JSON.stringify(data));
    } catch (fallbackError) {
      console.error('AccountingStorageAdapter: Even fallback storage failed', fallbackError);
    }
    
    return false;
  }
};

/**
 * Add a new account
 */
export const addAccount = async (account: Account): Promise<boolean> => {
  try {
    // Load existing accounting data
    const data = await loadAccountingData();
    
    // Add new account
    data.accounts.push(account);
    
    // Sort accounts by code
    data.accounts.sort((a, b) => a.code.localeCompare(b.code));
    
    // Save updated data
    return saveAccountingData(data);
  } catch (error) {
    console.error('AccountingStorageAdapter: Error adding account', error);
    return false;
  }
};

/**
 * Update an existing account
 */
export const updateAccount = async (updatedAccount: Account): Promise<boolean> => {
  try {
    // Load existing accounting data
    const data = await loadAccountingData();
    
    // Find and update the account
    const index = data.accounts.findIndex(a => a.id === updatedAccount.id);
    
    if (index !== -1) {
      data.accounts[index] = updatedAccount;
      
      // Sort accounts by code
      data.accounts.sort((a, b) => a.code.localeCompare(b.code));
      
      return saveAccountingData(data);
    } else {
      console.warn(`AccountingStorageAdapter: Account with ID ${updatedAccount.id} not found for update`);
      return false;
    }
  } catch (error) {
    console.error('AccountingStorageAdapter: Error updating account', error);
    return false;
  }
};

/**
 * Delete an account by ID
 */
export const deleteAccount = async (accountId: string): Promise<boolean> => {
  try {
    // Load existing accounting data
    const data = await loadAccountingData();
    
    // Check if account is being used in any transactions
    const isUsed = data.transactions.some(transaction => 
      transaction.entries.some(entry => entry.accountId === accountId)
    );
    
    if (isUsed) {
      console.error(`AccountingStorageAdapter: Cannot delete account ${accountId} as it is used in transactions`);
      return false;
    }
    
    // Filter out the account to delete
    const updatedAccounts = data.accounts.filter(a => a.id !== accountId);
    
    // Only save if something was actually removed
    if (updatedAccounts.length < data.accounts.length) {
      data.accounts = updatedAccounts;
      return saveAccountingData(data);
    } else {
      console.warn(`AccountingStorageAdapter: Account with ID ${accountId} not found for deletion`);
      return false;
    }
  } catch (error) {
    console.error('AccountingStorageAdapter: Error deleting account', error);
    return false;
  }
};

/**
 * Add a new transaction
 */
export const addTransaction = async (transaction: Transaction): Promise<boolean> => {
  try {
    // Load existing accounting data
    const data = await loadAccountingData();
    
    // Add the new transaction
    data.transactions.push(transaction);
    
    // Sort transactions by date (newest first)
    data.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Save updated data
    return saveAccountingData(data);
  } catch (error) {
    console.error('AccountingStorageAdapter: Error adding transaction', error);
    return false;
  }
};

/**
 * Update an existing transaction
 */
export const updateTransaction = async (updatedTransaction: Transaction): Promise<boolean> => {
  try {
    // Load existing accounting data
    const data = await loadAccountingData();
    
    // Find and update the transaction
    const index = data.transactions.findIndex(t => t.id === updatedTransaction.id);
    
    if (index !== -1) {
      // Check if transaction is already posted and trying to change to draft
      if (data.transactions[index].status === 'posted' && updatedTransaction.status === 'draft') {
        console.warn(`AccountingStorageAdapter: Cannot change posted transaction ${updatedTransaction.id} back to draft`);
        return false;
      }
      
      data.transactions[index] = updatedTransaction;
      
      // Sort transactions by date (newest first)
      data.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      return saveAccountingData(data);
    } else {
      console.warn(`AccountingStorageAdapter: Transaction with ID ${updatedTransaction.id} not found for update`);
      return false;
    }
  } catch (error) {
    console.error('AccountingStorageAdapter: Error updating transaction', error);
    return false;
  }
};

/**
 * Delete a transaction by ID (only if in draft status)
 */
export const deleteTransaction = async (transactionId: string): Promise<boolean> => {
  try {
    // Load existing accounting data
    const data = await loadAccountingData();
    
    // Find transaction to check its status
    const transaction = data.transactions.find(t => t.id === transactionId);
    
    if (!transaction) {
      console.warn(`AccountingStorageAdapter: Transaction with ID ${transactionId} not found for deletion`);
      return false;
    }
    
    // Only allow deletion of draft transactions
    if (transaction.status !== 'draft') {
      console.error(`AccountingStorageAdapter: Cannot delete transaction ${transactionId} as it is not in draft status`);
      return false;
    }
    
    // Filter out the transaction to delete
    const updatedTransactions = data.transactions.filter(t => t.id !== transactionId);
    
    // Only save if something was actually removed
    if (updatedTransactions.length < data.transactions.length) {
      data.transactions = updatedTransactions;
      return saveAccountingData(data);
    } else {
      return false;
    }
  } catch (error) {
    console.error('AccountingStorageAdapter: Error deleting transaction', error);
    return false;
  }
};

/**
 * Update accounting settings
 */
export const updateAccountingSettings = async (settings: AccountingData['settings']): Promise<boolean> => {
  try {
    // Load existing accounting data
    const data = await loadAccountingData();
    
    // Update settings
    data.settings = settings;
    
    // Save updated data
    return saveAccountingData(data);
  } catch (error) {
    console.error('AccountingStorageAdapter: Error updating accounting settings', error);
    return false;
  }
};

// Create sync-enabled storage wrapper for accounting data
const syncAccountingStorage = createSyncStorageWrapper<AccountingData>(
  saveAccountingData,
  loadAccountingData,
  'Accounting Data'
);

// Public API with sync indicators
export const syncAccountingAdapter = {
  load: async (callbacks?: SyncCallbacks): Promise<AccountingData> => {
    return syncAccountingStorage.load(callbacks);
  },
  save: async (data: AccountingData, callbacks?: SyncCallbacks): Promise<boolean> => {
    return syncAccountingStorage.save(data, callbacks);
  },
  addAccount: async (account: Account, callbacks?: SyncCallbacks): Promise<boolean> => {
    try {
      const data = await syncAccountingStorage.load(callbacks);
      data.accounts.push(account);
      return syncAccountingStorage.save(data, callbacks);
    } catch (error) {
      console.error('Error adding account with sync:', error);
      return false;
    }
  },
  updateAccount: async (account: Account, callbacks?: SyncCallbacks): Promise<boolean> => {
    try {
      const data = await syncAccountingStorage.load(callbacks);
      const index = data.accounts.findIndex(a => a.id === account.id);
      if (index !== -1) {
        data.accounts[index] = account;
        return syncAccountingStorage.save(data, callbacks);
      }
      return false;
    } catch (error) {
      console.error('Error updating account with sync:', error);
      return false;
    }
  },
  addTransaction: async (transaction: Transaction, callbacks?: SyncCallbacks): Promise<boolean> => {
    try {
      const data = await syncAccountingStorage.load(callbacks);
      data.transactions.push(transaction);
      data.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return syncAccountingStorage.save(data, callbacks);
    } catch (error) {
      console.error('Error adding transaction with sync:', error);
      return false;
    }
  },
  updateTransaction: async (transaction: Transaction, callbacks?: SyncCallbacks): Promise<boolean> => {
    try {
      const data = await syncAccountingStorage.load(callbacks);
      const index = data.transactions.findIndex(t => t.id === transaction.id);
      if (index !== -1) {
        if (data.transactions[index].status === 'posted' && transaction.status === 'draft') {
          return false;
        }
        data.transactions[index] = transaction;
        return syncAccountingStorage.save(data, callbacks);
      }
      return false;
    } catch (error) {
      console.error('Error updating transaction with sync:', error);
      return false;
    }
  }
};
