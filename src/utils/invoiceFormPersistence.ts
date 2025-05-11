/**
 * Utility functions for persisting invoice and quote form data
 * This ensures users don't need to re-enter common information across sessions
 */

import { safeJsonParse, safeJsonStringify } from '@/utils/errorHandling';
import { decodeBase64 } from '@/utils/base64Helper';
import { FileWithPreview } from '@/components/invoices/FileUploader';

// File storage structure interface
interface StoredFileData {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
}

// Keys for localStorage
const STORAGE_KEYS = {
  COMPANY_LOGO: 'mokmzansi_company_logo',
  COMPANY_STAMP: 'mokmzansi_company_stamp',
  SIGNATURE: 'mokmzansi_signature',
  STANDARD_NOTES: 'mokmzansi_standard_notes',
  STANDARD_TERMS: 'mokmzansi_standard_terms',
  BANKING_DETAILS: 'mokmzansi_banking_details'
};

// Interface for default text fields
export interface StandardTextFields {
  notes: string;
  terms: string;
  bankingDetails: string;
}

/**
 * Save a file to localStorage
 * Converts file to Data URL for persistent storage
 */
export const saveFileToStorage = async (file: FileWithPreview | null, storageKey: string): Promise<void> => {
  if (!file) {
    localStorage.removeItem(storageKey);
    return;
  }

  try {
    // If file already has a preview that's a data URL, use it directly
    if (file.preview && file.preview.startsWith('data:')) {
      // Save file metadata and existing data URL
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: file.preview
      };
      
      localStorage.setItem(storageKey, safeJsonStringify(fileData));
      return;
    }

    // Otherwise, convert file to data URL for storage
    const reader = new FileReader();
    
    const dataUrlPromise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to data URL'));
        }
      };
      reader.onerror = () => reject(reader.error);
    });
    
    reader.readAsDataURL(file);
    const dataUrl = await dataUrlPromise;
    
    // Save file metadata and data URL
    const fileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      dataUrl
    };
    
    // Use try/catch when setting localStorage to handle quota exceeded errors
    try {
      localStorage.setItem(storageKey, safeJsonStringify(fileData));
    } catch (storageError) {
      // If storage quota is exceeded, try to remove the item first then set it again
      if (storageError instanceof DOMException && 
          (storageError.code === 22 || storageError.name === 'QuotaExceededError')) {
        console.warn('Storage quota exceeded. Trying to compress image data...');
        // In a real app, you might want to compress the image or use a different storage approach
        throw new Error('Storage quota exceeded. The image may be too large.');
      } else {
        throw storageError;
      }
    }
  } catch (error) {
    console.error(`Error saving file to storage (${storageKey}):`, error);
    throw error; // Re-throw to allow handling in the component
  }
};

/**
 * Load a file from localStorage
 * Converts data URL back to File object
 */
export const loadFileFromStorage = (storageKey: string): FileWithPreview | null => {
  try {
    const fileDataString = localStorage.getItem(storageKey);
    if (!fileDataString) return null;
    
    const fileData = safeJsonParse(fileDataString) as StoredFileData;
    if (!fileData || !fileData.dataUrl) return null;
    
    // Convert data URL back to File
    const base64Data = fileData.dataUrl.split(',')[1];
    if (!base64Data) {
      console.error(`Invalid data URL format in storage: ${storageKey}`);
      return null;
    }
    
    try {
      // Add null check for base64Data
      if (!base64Data) {
        throw new Error('Invalid base64 data: empty string');
      }
      
      // Use our helper function to decode base64 safely (avoids TypeScript errors)
      const byteString = decodeBase64(base64Data);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: fileData.type });
      const file = new File([blob], fileData.name, { type: fileData.type });
      
      // Add preview property to make it compatible with FileWithPreview
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.preview = fileData.dataUrl;
      
      return fileWithPreview;
    } catch (decodeError) {
      console.error(`Error decoding base64 data for ${storageKey}:`, decodeError);
      
      // Fallback: If we can't recreate the file, at least create a placeholder
      // with the preview so the user can see the image
      const placeholderFile = new File([
        new Blob([new ArrayBuffer(0)], { type: fileData.type })
      ], fileData.name, { type: fileData.type });
      
      const placeholder = placeholderFile as FileWithPreview;
      placeholder.preview = fileData.dataUrl;
      return placeholder;
    }
  } catch (error) {
    console.error(`Error loading file from storage (${storageKey}):`, error);
    return null;
  }
};

/**
 * Save company logo to localStorage
 */
export const saveCompanyLogo = async (logo: FileWithPreview | null): Promise<void> => {
  await saveFileToStorage(logo, STORAGE_KEYS.COMPANY_LOGO);
};

/**
 * Load company logo from localStorage
 */
export const loadCompanyLogo = (): FileWithPreview | null => {
  return loadFileFromStorage(STORAGE_KEYS.COMPANY_LOGO);
};

/**
 * Save company stamp to localStorage
 */
export const saveCompanyStamp = async (stamp: FileWithPreview | null): Promise<void> => {
  await saveFileToStorage(stamp, STORAGE_KEYS.COMPANY_STAMP);
};

/**
 * Load company stamp from localStorage
 */
export const loadCompanyStamp = (): FileWithPreview | null => {
  return loadFileFromStorage(STORAGE_KEYS.COMPANY_STAMP);
};

/**
 * Save signature to localStorage
 */
export const saveSignature = async (signature: FileWithPreview | null): Promise<void> => {
  await saveFileToStorage(signature, STORAGE_KEYS.SIGNATURE);
};

/**
 * Initialize the storage keys to ensure empty placeholders exist
 * This ensures that even after logging out, the storage keys remain
 */
export const initializeImageStorage = (): void => {
  try {
    // Only initialize keys that don't already exist
    if (!localStorage.getItem(STORAGE_KEYS.COMPANY_LOGO)) {
      localStorage.setItem(STORAGE_KEYS.COMPANY_LOGO, '{}');
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.COMPANY_STAMP)) {
      localStorage.setItem(STORAGE_KEYS.COMPANY_STAMP, '{}');
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.SIGNATURE)) {
      localStorage.setItem(STORAGE_KEYS.SIGNATURE, '{}');
    }
    
    console.log('Image storage initialized successfully');
  } catch (error) {
    console.error('Error initializing image storage:', error);
  }
};

/**
 * Load signature from localStorage
 */
export const loadSignature = (): FileWithPreview | null => {
  return loadFileFromStorage(STORAGE_KEYS.SIGNATURE);
};

/**
 * Save standard text fields to localStorage
 */
export const saveStandardTextFields = (fields: StandardTextFields): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.STANDARD_NOTES, fields.notes || '');
    localStorage.setItem(STORAGE_KEYS.STANDARD_TERMS, fields.terms || '');
    localStorage.setItem(STORAGE_KEYS.BANKING_DETAILS, fields.bankingDetails || '');
  } catch (error) {
    console.error('Error saving standard text fields:', error);
  }
};

/**
 * Load standard text fields from localStorage
 */
export const loadStandardTextFields = (): StandardTextFields => {
  try {
    return {
      notes: localStorage.getItem(STORAGE_KEYS.STANDARD_NOTES) || '',
      terms: localStorage.getItem(STORAGE_KEYS.STANDARD_TERMS) || '',
      bankingDetails: localStorage.getItem(STORAGE_KEYS.BANKING_DETAILS) || ''
    };
  } catch (error) {
    console.error('Error loading standard text fields:', error);
    return { notes: '', terms: '', bankingDetails: '' };
  }
};
