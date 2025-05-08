import { format } from 'date-fns';
import { Client } from '@/types/client';

/**
 * Generate a new quote number
 * Format: Q-YYYYMM-XXX (where XXX is a sequential number)
 */
export const generateQuoteNumber = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  // In a real app, this would be based on the last quote number in the database
  // For now, we'll generate a random 3-digit number
  const randomNum = Math.floor(Math.random() * 900) + 100;
  
  return `Q-${year}${month}-${randomNum}`;
};

/**
 * Generate a new invoice number
 * Format: INV-YYYYMM-XXX (where XXX is a sequential number)
 */
export const generateInvoiceNumber = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  
  // In a real app, this would be based on the last invoice number in the database
  // For now, we'll generate a random 3-digit number
  const randomNum = Math.floor(Math.random() * 900) + 100;
  
  return `INV-${year}${month}-${randomNum}`;
};

/**
 * Format a date to "01 January 2000" format
 */
export const formatQuoteDate = (date: Date | string): string => {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return format(date, 'dd MMMM yyyy');
};

/**
 * Create a new quote item with defaults
 */
export const createNewQuoteItem = (itemNo: number = 1) => {
  return {
    itemNo,
    description: '',
    quantity: 1,
    unitPrice: 0,
    markupPercentage: 0,
    discount: 0,
    total: 0
  };
};

/**
 * Create a new invoice item with defaults
 */
export const createNewInvoiceItem = (itemNo: number = 1) => {
  return {
    itemNo,
    description: '',
    quantity: 1,
    amount: 0,
    discount: 0,
    total: 0
  };
};

/**
 * Calculate line item total with markup and discount
 */
export const calculateLineItemTotal = (
  quantity: number, 
  unitPrice: number, 
  markupPercentage: number = 0, 
  discount: number = 0
): number => {
  // Apply markup first, then discount
  const baseTotal = quantity * unitPrice;
  const withMarkup = baseTotal * (1 + (markupPercentage / 100));
  const withDiscount = withMarkup * (1 - (discount / 100));
  
  return parseFloat(withDiscount.toFixed(2));
};

/**
 * Get a client object from its ID
 */
export const getClientById = (clients: Client[], id: string): Client | undefined => {
  return clients.find(client => client.id === id);
};

/**
 * Get company data from CompanyContext
 * This returns an object formatted for the QuoteForm component
 */
export const getCompanyData = (companyDetails?: any) => {
  // If companyDetails is provided (from CompanyContext), use it
  if (companyDetails) {
    // Format the address by combining address fields
    const formattedAddress = [
      companyDetails.address,
      companyDetails.addressLine2,
      companyDetails.city && companyDetails.province ? 
        `${companyDetails.city}, ${companyDetails.province}` : 
        (companyDetails.city || companyDetails.province),
      companyDetails.postalCode
    ].filter(Boolean).join('\n');
    
    // Format the director name if available
    const contactPerson = companyDetails.directorFirstName || companyDetails.directorLastName ? 
      `${companyDetails.directorFirstName || ''} ${companyDetails.directorLastName || ''}`.trim() : 
      undefined;
    
    return {
      name: companyDetails.name || '',
      address: formattedAddress,
      email: companyDetails.contactEmail || '',
      phone: companyDetails.contactPhone || '',
      registrationNumber: companyDetails.registrationNumber || '',
      vatNumber: companyDetails.vatNumber || '',
      contactPerson: contactPerson,
      // Include the logo, stamp, and signature if available
      logo: companyDetails.logo || null,
      stamp: companyDetails.stamp || null,
      signature: companyDetails.signature || null
    };
  }
  
  // Fallback to default if no companyDetails provided
  return {
    name: 'MOKMzansi Holdings',
    address: '456 Business Ave, Johannesburg, 2000',
    email: 'contact@mokmzansi.co.za',
    phone: '011 987 6543',
    registrationNumber: 'REG12345',
    vatNumber: 'VAT12345',
    contactPerson: 'John Director',
    logo: null,
    stamp: null,
    signature: null
  };
};

/**
 * Constants for localStorage keys
 */
const STORAGE_KEYS = {
  QUOTE_TERMS: 'mokmzansi_quote_terms',
  BANKING_DETAILS: 'mokmzansi_banking_details',
  QUOTE_NOTES: 'mokmzansi_quote_notes'
};

/**
 * Save quote terms to localStorage for reuse in future quotes and invoices
 */
export const saveQuoteTerms = (terms: string): void => {
  try {
    if (typeof window !== 'undefined' && terms && terms.trim() !== '') {
      localStorage.setItem(STORAGE_KEYS.QUOTE_TERMS, terms);
    }
  } catch (error) {
    console.error('Error saving quote terms to localStorage:', error);
  }
};

/**
 * Get previously saved quote terms from localStorage
 */
export const getSavedQuoteTerms = (): string => {
  try {
    if (typeof window !== 'undefined') {
      const savedTerms = localStorage.getItem(STORAGE_KEYS.QUOTE_TERMS);
      return savedTerms || '';
    }
  } catch (error) {
    console.error('Error retrieving quote terms from localStorage:', error);
  }
  return '';
};

/**
 * Save banking details to localStorage for reuse in future quotes and invoices
 */
export const saveBankingDetails = (bankingDetails: string): void => {
  try {
    if (typeof window !== 'undefined' && bankingDetails && bankingDetails.trim() !== '') {
      localStorage.setItem(STORAGE_KEYS.BANKING_DETAILS, bankingDetails);
    }
  } catch (error) {
    console.error('Error saving banking details to localStorage:', error);
  }
};

/**
 * Get previously saved banking details from localStorage
 */
export const getSavedBankingDetails = (): string => {
  try {
    if (typeof window !== 'undefined') {
      const savedDetails = localStorage.getItem(STORAGE_KEYS.BANKING_DETAILS);
      return savedDetails || '';
    }
  } catch (error) {
    console.error('Error retrieving banking details from localStorage:', error);
  }
  return '';
};

/**
 * Save quote notes to localStorage for reuse in future quotes and invoices
 */
export const saveQuoteNotes = (notes: string): void => {
  try {
    if (typeof window !== 'undefined' && notes && notes.trim() !== '') {
      localStorage.setItem(STORAGE_KEYS.QUOTE_NOTES, notes);
    }
  } catch (error) {
    console.error('Error saving quote notes to localStorage:', error);
  }
};

/**
 * Get previously saved quote notes from localStorage
 */
export const getSavedQuoteNotes = (): string => {
  try {
    if (typeof window !== 'undefined') {
      const savedNotes = localStorage.getItem(STORAGE_KEYS.QUOTE_NOTES);
      return savedNotes || '';
    }
  } catch (error) {
    console.error('Error retrieving quote notes from localStorage:', error);
  }
  return '';
};

/**
 * Format banking details as a string
 */
export const formatBankingDetails = (bankingDetails: any): string => {
  if (!bankingDetails) return '';
  
  const { bankName, accountName, accountNumber, branchCode, accountType } = bankingDetails;
  
  return [
    bankName && `Bank: ${bankName}`,
    accountName && `Account Name: ${accountName}`,
    accountNumber && `Account Number: ${accountNumber}`,
    branchCode && `Branch Code: ${branchCode}`,
    accountType && `Account Type: ${accountType}`
  ].filter(Boolean).join('\n');
};

/**
 * Get shared company data from localStorage
 * This function is used to retrieve company data that was shared between components
 * Specifically for the QuoteForm when creating an invoice from a client
 */
export const getSharedCompanyData = () => {
  try {
    // Try to get company data from localStorage
    const storedData = localStorage.getItem('selectedClientForInvoice');
    if (storedData) {
      const client = JSON.parse(storedData);
      return {
        name: client.name || '',
        address: [client.address, client.city, client.province, client.postalCode].filter(Boolean).join(', '),
        email: client.email || '',
        phone: client.phone || '',
      };
    }
    return null;
  } catch (error) {
    console.error('Error retrieving shared company data:', error);
    return null;
  }
};

/**
 * Store company data in localStorage for sharing between components
 * @param companyDetails The company details to store
 */
export const syncCompanyData = (companyDetails: any): void => {
  try {
    if (typeof window !== 'undefined' && companyDetails) {
      // Format the company data for storage
      const companyData = {
        name: companyDetails.name || '',
        address: companyDetails.address || '',
        city: companyDetails.city || '',
        province: companyDetails.province || '',
        postalCode: companyDetails.postalCode || '',
        email: companyDetails.contactEmail || '',
        phone: companyDetails.contactPhone || '',
        registrationNumber: companyDetails.registrationNumber || '',
        vatNumber: companyDetails.vatNumber || ''
      };
      
      // Store in localStorage
      localStorage.setItem('companyData', JSON.stringify(companyData));
    }
  } catch (error) {
    console.error('Error storing company data:', error);
  }
};
