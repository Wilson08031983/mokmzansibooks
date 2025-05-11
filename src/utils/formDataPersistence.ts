import { QuoteData } from "@/types/quote";
import { InvoiceData } from "@/types/invoice";

// Storage key constants
const FORM_SETTINGS_KEY = 'mokFormSettings';

// Default template settings
const defaultSettings = {
  notes: '',
  terms: 'Payment due within 30 days of invoice date. Late payments subject to 1.5% monthly interest.',
  bankingDetails: 'Bank: Standard Bank\nAccount Name: MokMzansi Holdings\nAccount Number: 123456789\nBranch Code: 051001',
};

// Type for form settings
interface FormSettings {
  notes: string;
  terms: string;
  bankingDetails: string;
  [key: string]: any; // Allow for future field additions
}

/**
 * Initialize form data persistence
 */
export function initializeFormDataPersistence(): void {
  try {
    console.log('Initializing form data persistence');
    
    // Check if form settings exist
    if (!localStorage.getItem(FORM_SETTINGS_KEY)) {
      console.log('No form settings found, creating default settings');
      localStorage.setItem(FORM_SETTINGS_KEY, JSON.stringify(defaultSettings));
    } else {
      console.log('Form settings found in localStorage');
    }
  } catch (error) {
    console.error('Error initializing form data persistence:', error);
    
    // Attempt recovery with default settings
    try {
      localStorage.setItem(FORM_SETTINGS_KEY, JSON.stringify(defaultSettings));
    } catch (e) {
      console.error('Failed to initialize default form settings');
    }
  }
}

/**
 * Get stored form settings
 */
export function getFormSettings(): FormSettings {
  try {
    const settingsJson = localStorage.getItem(FORM_SETTINGS_KEY);
    if (!settingsJson) {
      return defaultSettings;
    }
    
    const settings = JSON.parse(settingsJson);
    return {
      ...defaultSettings, // Fallback for any missing fields
      ...settings,        // Override with stored values
    };
  } catch (error) {
    console.error('Error getting form settings:', error);
    return defaultSettings;
  }
}

/**
 * Save form settings
 * @param settings The form settings to save
 */
export function saveFormSettings(settings: Partial<FormSettings>): boolean {
  try {
    // Get current settings and merge with new values
    const currentSettings = getFormSettings();
    const updatedSettings = {
      ...currentSettings,
      ...settings,
    };
    
    // Store the updated settings
    localStorage.setItem(FORM_SETTINGS_KEY, JSON.stringify(updatedSettings));
    console.log('Form settings saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving form settings:', error);
    return false;
  }
}

/**
 * Apply stored settings to a new quote
 * @param quote The quote data to populate with stored settings
 */
export function applySettingsToQuote(quote: QuoteData): QuoteData {
  const settings = getFormSettings();
  
  return {
    ...quote,
    notes: quote.notes || settings.notes,
    terms: quote.terms || settings.terms,
    bankingDetails: quote.bankingDetails || settings.bankingDetails,
  };
}

/**
 * Apply stored settings to a new invoice
 * @param invoice The invoice data to populate with stored settings
 */
export function applySettingsToInvoice(invoice: InvoiceData): InvoiceData {
  const settings = getFormSettings();
  
  return {
    ...invoice,
    notes: invoice.notes || settings.notes,
    terms: invoice.terms || settings.terms,
    bankingDetails: invoice.bankingDetails || settings.bankingDetails,
  };
}

/**
 * Update settings from quote data
 * @param quote The quote data to extract settings from
 */
export function updateSettingsFromQuote(quote: QuoteData): void {
  if (!quote) return;
  
  const settings: Partial<FormSettings> = {};
  
  // Only update fields that have content
  if (quote.notes) settings.notes = quote.notes;
  if (quote.terms) settings.terms = quote.terms;
  if (quote.bankingDetails) settings.bankingDetails = quote.bankingDetails;
  
  // Save settings if any were extracted
  if (Object.keys(settings).length > 0) {
    saveFormSettings(settings);
  }
}

/**
 * Update settings from invoice data
 * @param invoice The invoice data to extract settings from
 */
export function updateSettingsFromInvoice(invoice: InvoiceData): void {
  if (!invoice) return;
  
  const settings: Partial<FormSettings> = {};
  
  // Only update fields that have content
  if (invoice.notes) settings.notes = invoice.notes;
  if (invoice.terms) settings.terms = invoice.terms;
  if (invoice.bankingDetails) settings.bankingDetails = invoice.bankingDetails;
  
  // Save settings if any were extracted
  if (Object.keys(settings).length > 0) {
    saveFormSettings(settings);
  }
}
