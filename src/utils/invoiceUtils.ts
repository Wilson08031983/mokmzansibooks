
import { InvoiceData } from "@/types/invoice";

const INVOICE_STORAGE_KEY = 'mokmzansi_saved_invoices';

/**
 * Save a new invoice to local storage
 */
export const saveInvoice = (invoice: InvoiceData): string => {
  try {
    // Generate an ID if one doesn't exist
    const invoiceToSave: InvoiceData = {
      ...invoice,
      id: invoice.id || generateId(),
      createdAt: invoice.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: invoice.status || 'draft'
    };
    
    // Get existing invoices
    const existingInvoices = getSavedInvoices();
    
    // Add the new invoice
    existingInvoices.unshift(invoiceToSave);
    
    // Save to localStorage
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(existingInvoices));
    
    return invoiceToSave.id as string;
  } catch (error) {
    console.error('Error saving invoice:', error);
    throw new Error('Failed to save invoice');
  }
};

/**
 * Get all saved invoices from local storage
 */
export const getSavedInvoices = (): InvoiceData[] => {
  try {
    const savedInvoices = localStorage.getItem(INVOICE_STORAGE_KEY);
    if (!savedInvoices) {
      return [];
    }
    return JSON.parse(savedInvoices);
  } catch (error) {
    console.error('Error retrieving invoices:', error);
    return [];
  }
};

/**
 * Get a single invoice by ID
 */
export const getInvoiceById = (invoiceId: string): InvoiceData | null => {
  try {
    const invoices = getSavedInvoices();
    return invoices.find(invoice => invoice.id === invoiceId) || null;
  } catch (error) {
    console.error('Error retrieving invoice by ID:', error);
    return null;
  }
};

/**
 * Update an existing invoice
 */
export const updateInvoice = (updatedInvoice: InvoiceData): boolean => {
  try {
    if (!updatedInvoice.id) {
      throw new Error('Invoice ID is required for update');
    }
    
    const invoices = getSavedInvoices();
    const index = invoices.findIndex(invoice => invoice.id === updatedInvoice.id);
    
    if (index === -1) {
      return false;
    }
    
    // Update the invoice with new timestamp
    invoices[index] = {
      ...updatedInvoice,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(invoices));
    return true;
  } catch (error) {
    console.error('Error updating invoice:', error);
    return false;
  }
};

/**
 * Delete an invoice by ID
 */
export const deleteInvoice = (invoiceId: string): boolean => {
  try {
    const invoices = getSavedInvoices();
    const filteredInvoices = invoices.filter(invoice => invoice.id !== invoiceId);
    
    if (filteredInvoices.length === invoices.length) {
      return false; // No invoice was deleted
    }
    
    localStorage.setItem(INVOICE_STORAGE_KEY, JSON.stringify(filteredInvoices));
    return true;
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return false;
  }
};

/**
 * Generate a unique ID
 */
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};
