/**
 * Quotes and Invoices Storage Adapter
 * 
 * This adapter ensures quotes and invoices are never lost by utilizing the
 * SuperPersistentStorage system with multiple redundant storage mechanisms.
 */

import superPersistentStorage, { DataCategory } from './superPersistentStorage';

// Types for quotes and invoices
export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  markup?: number;
  total: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  issueDate: string;
  expiryDate: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  terms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice extends Omit<Quote, 'expiryDate' | 'status'> {
  invoiceNumber: string;
  dueDate: string;
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'overdue';
  payments?: {
    id: string;
    amount: number;
    date: string;
    method: string;
    reference?: string;
  }[];
}

/**
 * Load all quotes from storage with comprehensive fallback
 */
export const loadQuotes = async (): Promise<Quote[]> => {
  try {
    console.log('QuotesAdapter: Loading quotes...');
    
    // Try super persistent storage first
    const data = await superPersistentStorage.load<Quote[]>(DataCategory.QUOTES);
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log(`QuotesAdapter: Loaded ${data.length} quotes from super persistent storage`);
      
      // Also restore to legacy storage for compatibility
      localStorage.setItem('quotes', JSON.stringify(data));
      
      return data;
    }
    
    // If super persistent storage failed, try legacy storage
    try {
      // Check multiple possible legacy keys
      const legacyKeys = ['quotes', 'QUOTES', 'savedQuotes', 'quotesData'];
      
      for (const key of legacyKeys) {
        const legacyData = localStorage.getItem(key);
        if (legacyData) {
          const parsedData = JSON.parse(legacyData);
          
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            console.log(`QuotesAdapter: Loaded ${parsedData.length} quotes from legacy storage (${key})`);
            
            // Migrate to super persistent storage for future use
            await superPersistentStorage.save(DataCategory.QUOTES, parsedData);
            
            return parsedData;
          }
        }
      }
    } catch (error) {
      console.error('QuotesAdapter: Error loading from legacy storage', error);
    }
    
    // If all else fails, return empty array
    console.log('QuotesAdapter: No quotes found in any storage');
    return [];
  } catch (error) {
    console.error('QuotesAdapter: Error loading quotes', error);
    return [];
  }
};

/**
 * Save quotes with multi-layer persistence
 */
export const saveQuotes = async (quotes: Quote[]): Promise<boolean> => {
  try {
    if (!quotes || !Array.isArray(quotes)) {
      console.error('QuotesAdapter: Invalid quotes data', quotes);
      return false;
    }
    
    console.log(`QuotesAdapter: Saving ${quotes.length} quotes...`);
    
    // Save to super persistent storage
    const success = await superPersistentStorage.save(DataCategory.QUOTES, quotes);
    
    // Also save to legacy storage for compatibility
    localStorage.setItem('quotes', JSON.stringify(quotes));
    
    // Create additional backup in a different key
    localStorage.setItem('quotes_backup', JSON.stringify(quotes));
    
    if (success) {
      console.log('QuotesAdapter: Quotes saved successfully');
    } else {
      console.warn('QuotesAdapter: Some storage mechanisms failed when saving quotes');
    }
    
    return success;
  } catch (error) {
    console.error('QuotesAdapter: Error saving quotes', error);
    
    // Fall back to legacy storage as last resort
    try {
      localStorage.setItem('quotes_emergency_backup', JSON.stringify(quotes));
    } catch (fallbackError) {
      console.error('QuotesAdapter: Even fallback storage failed', fallbackError);
    }
    
    return false;
  }
};

/**
 * Load all invoices from storage with comprehensive fallback
 */
export const loadInvoices = async (): Promise<Invoice[]> => {
  try {
    console.log('InvoicesAdapter: Loading invoices...');
    
    // Try super persistent storage first
    const data = await superPersistentStorage.load<Invoice[]>(DataCategory.INVOICES);
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log(`InvoicesAdapter: Loaded ${data.length} invoices from super persistent storage`);
      
      // Also restore to legacy storage for compatibility
      localStorage.setItem('invoices', JSON.stringify(data));
      
      return data;
    }
    
    // If super persistent storage failed, try legacy storage
    try {
      // Check multiple possible legacy keys
      const legacyKeys = ['invoices', 'INVOICES', 'savedInvoices', 'invoicesData'];
      
      for (const key of legacyKeys) {
        const legacyData = localStorage.getItem(key);
        if (legacyData) {
          const parsedData = JSON.parse(legacyData);
          
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            console.log(`InvoicesAdapter: Loaded ${parsedData.length} invoices from legacy storage (${key})`);
            
            // Migrate to super persistent storage for future use
            await superPersistentStorage.save(DataCategory.INVOICES, parsedData);
            
            return parsedData;
          }
        }
      }
    } catch (error) {
      console.error('InvoicesAdapter: Error loading from legacy storage', error);
    }
    
    // If all else fails, return empty array
    console.log('InvoicesAdapter: No invoices found in any storage');
    return [];
  } catch (error) {
    console.error('InvoicesAdapter: Error loading invoices', error);
    return [];
  }
};

/**
 * Save invoices with multi-layer persistence
 */
export const saveInvoices = async (invoices: Invoice[]): Promise<boolean> => {
  try {
    if (!invoices || !Array.isArray(invoices)) {
      console.error('InvoicesAdapter: Invalid invoices data', invoices);
      return false;
    }
    
    console.log(`InvoicesAdapter: Saving ${invoices.length} invoices...`);
    
    // Save to super persistent storage
    const success = await superPersistentStorage.save(DataCategory.INVOICES, invoices);
    
    // Also save to legacy storage for compatibility
    localStorage.setItem('invoices', JSON.stringify(invoices));
    
    // Create additional backup in a different key
    localStorage.setItem('invoices_backup', JSON.stringify(invoices));
    
    if (success) {
      console.log('InvoicesAdapter: Invoices saved successfully');
    } else {
      console.warn('InvoicesAdapter: Some storage mechanisms failed when saving invoices');
    }
    
    return success;
  } catch (error) {
    console.error('InvoicesAdapter: Error saving invoices', error);
    
    // Fall back to legacy storage as last resort
    try {
      localStorage.setItem('invoices_emergency_backup', JSON.stringify(invoices));
    } catch (fallbackError) {
      console.error('InvoicesAdapter: Even fallback storage failed', fallbackError);
    }
    
    return false;
  }
};
