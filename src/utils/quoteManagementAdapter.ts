/**
 * Quote Management Adapter
 * 
 * This adapter provides robust persistence and advanced features for quote management:
 * 1. Convert Quote to Invoice
 * 2. Duplicate Quote
 * 3. Archive/Restore Quotes
 * 4. Quote version history/revisions
 * 5. Export to other formats (Excel, CSV)
 */

import superPersistentStorage, { DataCategory } from './superPersistentStorage';
import { v4 as uuidv4 } from 'uuid';
import { loadQuotes, saveQuotes, Quote, Invoice } from './quotesInvoicesAdapter';

// Archive interface to track archived quotes
export interface QuoteArchive {
  archivedQuotes: Quote[];
  lastUpdated: string;
}

// Version history interface for quotes
export interface QuoteVersion {
  id: string;
  quoteId: string;
  versionNumber: number;
  createdAt: string;
  createdBy?: string;
  data: Quote;
  notes?: string;
}

// Quote version history by quote ID
export interface QuoteVersionHistory {
  [quoteId: string]: QuoteVersion[];
}

/**
 * Load archived quotes with fallback mechanisms
 */
export const loadArchivedQuotes = async (): Promise<Quote[]> => {
  try {
    console.log('QuoteManagementAdapter: Loading archived quotes...');
    
    // First try super persistent storage
    const data = await superPersistentStorage.load<QuoteArchive>(DataCategory.QUOTE_ARCHIVE);
    
    if (data && data.archivedQuotes && Array.isArray(data.archivedQuotes)) {
      console.log(`QuoteManagementAdapter: Loaded ${data.archivedQuotes.length} archived quotes from super persistent storage`);
      return data.archivedQuotes;
    }
    
    // If super persistent storage failed, try legacy storage
    try {
      // Try multiple possible legacy keys
      const legacyKeys = ['archivedQuotes', 'archived_quotes', 'quotes_archive'];
      
      for (const key of legacyKeys) {
        const legacyData = localStorage.getItem(key);
        if (legacyData) {
          try {
            const parsedData = JSON.parse(legacyData);
            
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              console.log(`QuoteManagementAdapter: Loaded ${parsedData.length} archived quotes from legacy storage (${key})`);
              
              // Migrate to super persistent storage for future use
              await superPersistentStorage.save(DataCategory.QUOTE_ARCHIVE, {
                archivedQuotes: parsedData,
                lastUpdated: new Date().toISOString()
              });
              
              return parsedData;
            }
          } catch (error) {
            console.error(`QuoteManagementAdapter: Error parsing legacy data from ${key}`, error);
          }
        }
      }
    } catch (error) {
      console.error('QuoteManagementAdapter: Error loading from legacy storage', error);
    }
    
    // If all else fails, return empty array
    console.log('QuoteManagementAdapter: No archived quotes found');
    return [];
  } catch (error) {
    console.error('QuoteManagementAdapter: Error loading archived quotes', error);
    return [];
  }
};

/**
 * Save archived quotes with super persistence
 */
export const saveArchivedQuotes = async (archivedQuotes: Quote[]): Promise<boolean> => {
  try {
    if (!archivedQuotes || !Array.isArray(archivedQuotes)) {
      console.error('QuoteManagementAdapter: Invalid archived quotes data', archivedQuotes);
      return false;
    }
    
    console.log(`QuoteManagementAdapter: Saving ${archivedQuotes.length} archived quotes...`);
    
    const archiveData: QuoteArchive = {
      archivedQuotes,
      lastUpdated: new Date().toISOString()
    };
    
    // Save to super persistent storage
    const success = await superPersistentStorage.save(DataCategory.QUOTE_ARCHIVE, archiveData);
    
    // Also save to legacy storage for compatibility
    localStorage.setItem('archivedQuotes', JSON.stringify(archivedQuotes));
    
    if (success) {
      console.log('QuoteManagementAdapter: Archived quotes saved successfully');
    } else {
      console.warn('QuoteManagementAdapter: Some storage mechanisms failed when saving archived quotes');
    }
    
    return success;
  } catch (error) {
    console.error('QuoteManagementAdapter: Error saving archived quotes', error);
    return false;
  }
};

/**
 * Archive a quote by moving it from active quotes to archive
 */
export const archiveQuote = async (quoteId: string): Promise<boolean> => {
  try {
    // Load active quotes
    const activeQuotes = await loadQuotes();
    
    // Find the quote to archive
    const quoteToArchive = activeQuotes.find(q => q.id === quoteId);
    
    if (!quoteToArchive) {
      console.warn(`QuoteManagementAdapter: Quote with ID ${quoteId} not found for archiving`);
      return false;
    }
    
    // Load archived quotes
    const archivedQuotes = await loadArchivedQuotes();
    
    // Add the quote to archived quotes
    archivedQuotes.push({
      ...quoteToArchive,
      status: 'archived'
    });
    
    // Remove the quote from active quotes
    const updatedActiveQuotes = activeQuotes.filter(q => q.id !== quoteId);
    
    // Save both lists
    const archivedSuccess = await saveArchivedQuotes(archivedQuotes);
    const activeSuccess = await saveQuotes(updatedActiveQuotes);
    
    return archivedSuccess && activeSuccess;
  } catch (error) {
    console.error(`QuoteManagementAdapter: Error archiving quote ${quoteId}`, error);
    return false;
  }
};

/**
 * Restore a quote from archive back to active quotes
 */
export const restoreQuote = async (quoteId: string): Promise<boolean> => {
  try {
    // Load archived quotes
    const archivedQuotes = await loadArchivedQuotes();
    
    // Find the quote to restore
    const quoteToRestore = archivedQuotes.find(q => q.id === quoteId);
    
    if (!quoteToRestore) {
      console.warn(`QuoteManagementAdapter: Quote with ID ${quoteId} not found in archive for restoring`);
      return false;
    }
    
    // Load active quotes
    const activeQuotes = await loadQuotes();
    
    // Add the quote to active quotes (with status restored)
    activeQuotes.push({
      ...quoteToRestore,
      status: 'restored'
    });
    
    // Remove the quote from archived quotes
    const updatedArchivedQuotes = archivedQuotes.filter(q => q.id !== quoteId);
    
    // Save both lists
    const archivedSuccess = await saveArchivedQuotes(updatedArchivedQuotes);
    const activeSuccess = await saveQuotes(activeQuotes);
    
    return archivedSuccess && activeSuccess;
  } catch (error) {
    console.error(`QuoteManagementAdapter: Error restoring quote ${quoteId}`, error);
    return false;
  }
};

/**
 * Load quote version history
 */
export const loadQuoteVersionHistory = async (): Promise<QuoteVersionHistory> => {
  try {
    console.log('QuoteManagementAdapter: Loading quote version history...');
    
    // First try super persistent storage
    const data = await superPersistentStorage.load<QuoteVersionHistory>(DataCategory.QUOTE_VERSIONS);
    
    if (data) {
      const versionCount = Object.values(data).reduce((total, versions) => total + versions.length, 0);
      console.log(`QuoteManagementAdapter: Loaded quote version history (${versionCount} versions) from super persistent storage`);
      return data;
    }
    
    // If super persistent storage failed, try legacy storage
    try {
      const legacyData = localStorage.getItem('quoteVersions');
      if (legacyData) {
        try {
          const parsedData = JSON.parse(legacyData);
          
          console.log('QuoteManagementAdapter: Loaded quote version history from legacy storage');
          
          // Migrate to super persistent storage for future use
          await superPersistentStorage.save(DataCategory.QUOTE_VERSIONS, parsedData);
          
          return parsedData;
        } catch (error) {
          console.error('QuoteManagementAdapter: Error parsing legacy version history data', error);
        }
      }
    } catch (error) {
      console.error('QuoteManagementAdapter: Error loading version history from legacy storage', error);
    }
    
    // If all else fails, return empty object
    console.log('QuoteManagementAdapter: No quote version history found');
    return {};
  } catch (error) {
    console.error('QuoteManagementAdapter: Error loading quote version history', error);
    return {};
  }
};

/**
 * Save quote version history with super persistence
 */
export const saveQuoteVersionHistory = async (versionHistory: QuoteVersionHistory): Promise<boolean> => {
  try {
    if (!versionHistory) {
      console.error('QuoteManagementAdapter: Invalid version history data', versionHistory);
      return false;
    }
    
    const versionCount = Object.values(versionHistory).reduce((total, versions) => total + versions.length, 0);
    console.log(`QuoteManagementAdapter: Saving quote version history (${versionCount} versions)...`);
    
    // Save to super persistent storage
    const success = await superPersistentStorage.save(DataCategory.QUOTE_VERSIONS, versionHistory);
    
    // Also save to legacy storage for compatibility
    localStorage.setItem('quoteVersions', JSON.stringify(versionHistory));
    
    if (success) {
      console.log('QuoteManagementAdapter: Quote version history saved successfully');
    } else {
      console.warn('QuoteManagementAdapter: Some storage mechanisms failed when saving quote version history');
    }
    
    return success;
  } catch (error) {
    console.error('QuoteManagementAdapter: Error saving quote version history', error);
    return false;
  }
};

/**
 * Create a new version of a quote
 */
export const createQuoteVersion = async (quote: Quote, notes?: string): Promise<boolean> => {
  try {
    // Load version history
    const versionHistory = await loadQuoteVersionHistory();
    
    // Get current versions for this quote
    const quoteVersions = versionHistory[quote.id] || [];
    
    // Determine next version number
    const nextVersionNumber = quoteVersions.length > 0 
      ? Math.max(...quoteVersions.map(v => v.versionNumber)) + 1 
      : 1;
    
    // Create new version
    const newVersion: QuoteVersion = {
      id: uuidv4(),
      quoteId: quote.id,
      versionNumber: nextVersionNumber,
      createdAt: new Date().toISOString(),
      data: { ...quote },
      notes
    };
    
    // Add to version history
    if (!versionHistory[quote.id]) {
      versionHistory[quote.id] = [];
    }
    
    versionHistory[quote.id].push(newVersion);
    
    // Save updated version history
    return saveQuoteVersionHistory(versionHistory);
  } catch (error) {
    console.error(`QuoteManagementAdapter: Error creating version for quote ${quote.id}`, error);
    return false;
  }
};

/**
 * Get all versions of a specific quote
 */
export const getQuoteVersions = async (quoteId: string): Promise<QuoteVersion[]> => {
  try {
    // Load version history
    const versionHistory = await loadQuoteVersionHistory();
    
    // Get versions for this quote
    return versionHistory[quoteId] || [];
  } catch (error) {
    console.error(`QuoteManagementAdapter: Error getting versions for quote ${quoteId}`, error);
    return [];
  }
};

/**
 * Restore a specific version of a quote
 */
export const restoreQuoteVersion = async (quoteId: string, versionId: string): Promise<boolean> => {
  try {
    // Load version history
    const versionHistory = await loadQuoteVersionHistory();
    
    // Get versions for this quote
    const quoteVersions = versionHistory[quoteId] || [];
    
    // Find the version to restore
    const versionToRestore = quoteVersions.find(v => v.id === versionId);
    
    if (!versionToRestore) {
      console.warn(`QuoteManagementAdapter: Version ${versionId} not found for quote ${quoteId}`);
      return false;
    }
    
    // Load active quotes
    const quotes = await loadQuotes();
    
    // Find and update the quote
    const quoteIndex = quotes.findIndex(q => q.id === quoteId);
    
    if (quoteIndex === -1) {
      console.warn(`QuoteManagementAdapter: Quote ${quoteId} not found in active quotes`);
      return false;
    }
    
    // Update quote with version data
    quotes[quoteIndex] = {
      ...versionToRestore.data,
      updatedAt: new Date().toISOString()
    };
    
    // Create a new version to mark the restoration
    await createQuoteVersion(quotes[quoteIndex], `Restored from version ${versionToRestore.versionNumber}`);
    
    // Save updated quotes
    return saveQuotes(quotes);
  } catch (error) {
    console.error(`QuoteManagementAdapter: Error restoring version ${versionId} for quote ${quoteId}`, error);
    return false;
  }
};

/**
 * Duplicate a quote
 */
export const duplicateQuote = async (quoteId: string): Promise<string | null> => {
  try {
    // Load active quotes
    const quotes = await loadQuotes();
    
    // Find the quote to duplicate
    const quoteToDuplicate = quotes.find(q => q.id === quoteId);
    
    if (!quoteToDuplicate) {
      console.warn(`QuoteManagementAdapter: Quote with ID ${quoteId} not found for duplication`);
      return null;
    }
    
    // Generate new ID and quote number
    const newId = uuidv4();
    const originalNumber = quoteToDuplicate.quoteNumber;
    const newNumber = `${originalNumber}-COPY-${new Date().getTime().toString().substr(-4)}`;
    
    // Create duplicate with new ID, number, and dates
    const duplicatedQuote: Quote = {
      ...quoteToDuplicate,
      id: newId,
      quoteNumber: newNumber,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: quoteToDuplicate.notes 
        ? `${quoteToDuplicate.notes}\n(Duplicated from ${originalNumber})` 
        : `Duplicated from ${originalNumber}`
    };
    
    // Add to quotes
    quotes.push(duplicatedQuote);
    
    // Save updated quotes
    const success = await saveQuotes(quotes);
    
    return success ? newId : null;
  } catch (error) {
    console.error(`QuoteManagementAdapter: Error duplicating quote ${quoteId}`, error);
    return null;
  }
};

/**
 * Convert a quote to an invoice
 */
export const convertQuoteToInvoice = async (
  quoteId: string, 
  invoiceDetails: { invoiceNumber: string; dueDate: string }
): Promise<string | null> => {
  try {
    // Load quotes
    const quotes = await loadQuotes();
    
    // Find the quote to convert
    const quoteToConvert = quotes.find(q => q.id === quoteId);
    
    if (!quoteToConvert) {
      console.warn(`QuoteManagementAdapter: Quote with ID ${quoteId} not found for conversion to invoice`);
      return null;
    }
    
    // Generate new ID for invoice
    const newId = uuidv4();
    
    // Create invoice from quote
    const newInvoice: Invoice = {
      id: newId,
      invoiceNumber: invoiceDetails.invoiceNumber,
      client: quoteToConvert.client,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: invoiceDetails.dueDate,
      items: quoteToConvert.items,
      subtotal: quoteToConvert.subtotal,
      tax: quoteToConvert.tax,
      total: quoteToConvert.total,
      notes: quoteToConvert.notes 
        ? `${quoteToConvert.notes}\n(Converted from Quote #${quoteToConvert.quoteNumber})` 
        : `Converted from Quote #${quoteToConvert.quoteNumber}`,
      terms: quoteToConvert.terms,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paymentStatus: 'unpaid',
      payments: []
    };
    
    // Update the original quote status
    const updatedQuotes = quotes.map(q => {
      if (q.id === quoteId) {
        return {
          ...q,
          status: 'accepted',
          updatedAt: new Date().toISOString()
        };
      }
      return q;
    });
    
    // Save updated quotes
    const quotesSuccess = await saveQuotes(updatedQuotes);
    
    // Add the new invoice
    // Load existing invoices
    const invoices = await loadInvoices() || [];
    invoices.push(newInvoice);
    
    // Save updated invoices
    const invoicesSuccess = await saveInvoices(invoices);
    
    return (quotesSuccess && invoicesSuccess) ? newId : null;
  } catch (error) {
    console.error(`QuoteManagementAdapter: Error converting quote ${quoteId} to invoice`, error);
    return null;
  }
};

/**
 * Load invoices - implementing here to avoid circular dependencies
 */
export const loadInvoices = async (): Promise<Invoice[]> => {
  try {
    console.log('QuoteManagementAdapter: Loading invoices...');
    
    // First try super persistent storage
    const data = await superPersistentStorage.load<Invoice[]>(DataCategory.INVOICES);
    
    if (data && Array.isArray(data) && data.length > 0) {
      console.log(`QuoteManagementAdapter: Loaded ${data.length} invoices from super persistent storage`);
      
      // Also restore to legacy storage for compatibility
      localStorage.setItem('invoices', JSON.stringify(data));
      
      return data;
    }
    
    // If super persistent storage failed, try legacy storage
    try {
      const legacyData = localStorage.getItem('invoices');
      if (legacyData) {
        const parsedData = JSON.parse(legacyData);
        
        if (Array.isArray(parsedData) && parsedData.length > 0) {
          console.log(`QuoteManagementAdapter: Loaded ${parsedData.length} invoices from legacy storage`);
          
          // Migrate to super persistent storage for future use
          await superPersistentStorage.save(DataCategory.INVOICES, parsedData);
          
          return parsedData;
        }
      }
    } catch (error) {
      console.error('QuoteManagementAdapter: Error loading invoices from legacy storage', error);
    }
    
    // If all else fails, return empty array
    console.log('QuoteManagementAdapter: No invoices found');
    return [];
  } catch (error) {
    console.error('QuoteManagementAdapter: Error loading invoices', error);
    return [];
  }
};

/**
 * Save invoices with super persistence
 */
export const saveInvoices = async (invoices: Invoice[]): Promise<boolean> => {
  try {
    if (!invoices || !Array.isArray(invoices)) {
      console.error('QuoteManagementAdapter: Invalid invoices data', invoices);
      return false;
    }
    
    console.log(`QuoteManagementAdapter: Saving ${invoices.length} invoices...`);
    
    // Save to super persistent storage
    const success = await superPersistentStorage.save(DataCategory.INVOICES, invoices);
    
    // Also save to legacy storage for compatibility
    localStorage.setItem('invoices', JSON.stringify(invoices));
    
    if (success) {
      console.log('QuoteManagementAdapter: Invoices saved successfully');
    } else {
      console.warn('QuoteManagementAdapter: Some storage mechanisms failed when saving invoices');
    }
    
    return success;
  } catch (error) {
    console.error('QuoteManagementAdapter: Error saving invoices', error);
    
    // Fall back to legacy storage as last resort
    try {
      localStorage.setItem('invoices_emergency_backup', JSON.stringify(invoices));
    } catch (fallbackError) {
      console.error('QuoteManagementAdapter: Even fallback storage failed', fallbackError);
    }
    
    return false;
  }
};
