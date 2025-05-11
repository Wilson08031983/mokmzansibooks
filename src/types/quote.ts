
export interface QuoteData {
  id?: string; // Unique identifier for the quote
  quoteNumber: string;
  issueDate: string;
  expiryDate: string;
  shortDescription?: string;
  language?: "english" | "afrikaans";
  currency?: string;
  status?: string; // Quote status: draft, sent, accepted, etc.
  client: Partial<QuoteClient> & { name: string; id?: string };
  company?: QuoteCompany;
  items?: QuoteItem[];
  subtotal?: number;
  vatRate?: number;
  tax?: number;
  taxAmount?: number; // Alternative tax amount field (for compatibility)
  total: number;
  notes?: string;
  terms?: string;
  bankingDetails?: string;
  signature?: string;
  lastUpdated?: string; // ISO string timestamp of last update
  bankAccount?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchCode: string;
    swiftCode?: string;
  };
  
  // Template selection
  template?: number; // Template number (1-8)
  hideMarkup?: boolean; // Whether to hide markup percentages
}

export interface QuoteClient {
  name: string;
  address: string;
  email: string;
  phone: string;
}

export interface QuoteCompany {
  name: string;
  address: string;
  email: string;
  phone: string;
  logo?: string;
  stamp?: string;
  signature?: string; // Digital signature image
  regNumber?: string; // Company registration number
  vatNumber?: string; // VAT registration number
  bankDetails?: {
    accountName?: string;
    accountNumber?: string;
    bankName?: string;
    branchCode?: string;
  };
}

export interface QuoteItem {
  id?: string; // Unique identifier
  itemNo?: number | string; // Item number or SKU
  description: string; // Description of the item
  quantity: number; // Quantity
  markupPercentage?: number; // Added markup percentage
  unitPrice: number; // Unit price
  discount?: number; // Discount amount or percentage
  total?: number; // Total amount (may be same as amount)
  amount: number; // Total amount for this item
  taxRate?: number; // Tax rate for this item
  websiteUrl?: string; // Website URL for service or product
}

export interface TemplateProps {
  data: QuoteData;
  preview?: boolean;
}
