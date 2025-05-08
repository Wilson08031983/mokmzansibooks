/**
 * Utility functions for managing invoices
 */

import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { format } from "date-fns";
import { safeJsonParse, safeJsonStringify } from "@/utils/errorHandling";
import { supabase } from "@/integrations/supabase/client";

/**
 * Generate a unique invoice number
 */
export const generateInvoiceNumber = (): string => {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  
  // Get existing invoices to determine next sequence number
  const existingInvoices = getSavedInvoices();
  const sequenceNumbers = existingInvoices
    .filter(inv => inv.invoiceNumber.startsWith(`INV-${year}-${month}`))
    .map(inv => {
      const parts = inv.invoiceNumber.split('-');
      return parts.length > 2 ? parseInt(parts[3] || '0') : 0;
    });
  
  // Find the highest sequence number and increment by 1, or start at 1
  const nextSequence = sequenceNumbers.length > 0
    ? Math.max(...sequenceNumbers) + 1
    : 1;
  
  return `INV-${year}-${month}-${nextSequence.toString().padStart(3, '0')}`;
};

/**
 * Create a new invoice item
 */
export const createNewInvoiceItem = (itemNo: number): InvoiceItem => {
  return {
    itemNo,
    description: "",
    quantity: 1,
    unitPrice: 0,
    discount: 0,
    amount: 0
  };
};

/**
 * Save invoice to localStorage and optionally to Supabase
 */
export const saveInvoice = async (invoiceData: InvoiceData): Promise<{ success: boolean; message: string; invoice?: InvoiceData }> => {
  try {
    // Generate ID if not provided
    if (!invoiceData.id) {
      invoiceData.id = crypto.randomUUID();
    }
    
    // Set created date if not provided
    if (!invoiceData.createdAt) {
      invoiceData.createdAt = new Date().toISOString();
    }
    
    // Update last modified date
    invoiceData.updatedAt = new Date().toISOString();
    
    // Default status to draft if not provided
    if (!invoiceData.status) {
      invoiceData.status = 'draft';
    }
    
    // Get existing invoices
    const existingInvoices = getSavedInvoices();
    
    // Check if this is an update to an existing invoice
    const existingIndex = existingInvoices.findIndex(inv => inv.id === invoiceData.id);
    
    if (existingIndex >= 0) {
      // Update existing invoice
      existingInvoices[existingIndex] = invoiceData;
    } else {
      // Add new invoice
      existingInvoices.push(invoiceData);
    }
    
    // Save to localStorage
    localStorage.setItem('savedInvoices', safeJsonStringify(existingInvoices));
    
    // Save to Supabase if authenticated (using custom RPC function to avoid table schema issues)
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        // Use a generic storage approach that doesn't rely on a specific table schema
        // This allows us to store invoices even if the table isn't in our TypeScript definitions yet
        const { error } = await supabase.rpc(
          'store_json_data',
          { 
            collection_name: 'invoices',
            record_id: invoiceData.id,
            user_id: userData.user.id,
            data_json: invoiceData,
            metadata: {
              invoice_number: invoiceData.invoiceNumber,
              issue_date: invoiceData.issueDate,
              due_date: invoiceData.dueDate,
              client_name: invoiceData.client.name,
              total_amount: invoiceData.total,
              status: invoiceData.status || 'draft'
            }
          }
        );
        
        if (error) {
          // If the RPC function fails, try a more direct approach with REST API
          console.log('Falling back to direct storage method for invoice');
          
          // Use the REST API directly as a fallback
          const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/user_data`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: JSON.stringify({
              user_id: userData.user.id,
              data_type: 'invoice',
              data_id: invoiceData.id,
              data: invoiceData
            })
          });
          
          if (!response.ok) {
            console.error('Error using fallback storage:', await response.text());
          }
        }
      }
    } catch (supabaseError) {
      console.error('Supabase save error:', supabaseError);
      // Still return success since we saved to localStorage
    }
    
    return { 
      success: true, 
      message: 'Invoice saved successfully',
      invoice: invoiceData
    };
  } catch (error) {
    console.error('Error saving invoice:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to save invoice'
    };
  }
};

/**
 * Get all saved invoices from localStorage
 */
export const getSavedInvoices = (): InvoiceData[] => {
  try {
    const savedInvoices = localStorage.getItem('savedInvoices');
    return savedInvoices ? safeJsonParse(savedInvoices, []) : [];
  } catch (error) {
    console.error('Error retrieving saved invoices:', error);
    return [];
  }
};

/**
 * Get an invoice by ID
 */
export const getInvoiceById = (id: string): InvoiceData | null => {
  try {
    const savedInvoices = getSavedInvoices();
    const invoice = savedInvoices.find(inv => inv.id === id);
    return invoice || null;
  } catch (error) {
    console.error('Error retrieving invoice by ID:', error);
    return null;
  }
};

/**
 * Delete an invoice by ID
 */
export const deleteInvoice = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const savedInvoices = getSavedInvoices();
    const filteredInvoices = savedInvoices.filter(inv => inv.id !== id);
    
    // Save updated list to localStorage
    localStorage.setItem('savedInvoices', safeJsonStringify(filteredInvoices));
    
    // Also delete from Supabase if user is authenticated
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        // Try generic RPC function first
        const { error } = await supabase.rpc(
          'delete_user_data',
          { 
            collection_name: 'invoices',
            record_id: id,
            user_id: userData.user.id 
          }
        );
        
        if (error) {
          // Fallback to direct REST API
          console.log('Falling back to direct deletion method for invoice');
          
          const response = await fetch(
            `${process.env.SUPABASE_URL}/rest/v1/user_data?user_id=eq.${userData.user.id}&data_type=eq.invoice&data_id=eq.${id}`,
            {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'apikey': process.env.SUPABASE_ANON_KEY || '',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              }
            }
          );
          
          if (!response.ok) {
            console.error('Error using fallback deletion:', await response.text());
          }
        }
      }
    } catch (supabaseError) {
      console.error('Supabase delete error:', supabaseError);
      // Still return success since we deleted from localStorage
    }
    
    return {
      success: true,
      message: 'Invoice deleted successfully'
    };
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete invoice'
    };
  }
};

/**
 * Update invoice status
 */
export const updateInvoiceStatus = async (
  id: string, 
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
): Promise<{ success: boolean; message: string; invoice?: InvoiceData }> => {
  try {
    const invoice = getInvoiceById(id);
    if (!invoice) {
      return {
        success: false,
        message: 'Invoice not found'
      };
    }
    
    // Update status
    invoice.status = status;
    invoice.updatedAt = new Date().toISOString();
    
    // If marking as paid, set paid date
    if (status === 'paid' && !invoice.paidDate) {
      invoice.paidDate = format(new Date(), "yyyy-MM-dd");
    }
    
    // Save updated invoice
    return saveInvoice(invoice);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update invoice status'
    };
  }
};

/**
 * Format currency amount
 */
export const formatInvoiceCurrency = (amount: number, currency: string = 'ZAR'): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};
