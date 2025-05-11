
export interface InvoiceData {
  id?: string;                 // Unique identifier
  invoiceNumber: string;       // Invoice number (e.g., INV-2025-01-001)
  issueDate: string;          // Date the invoice was issued
  dueDate: string;            // Date the invoice is due
  shortDescription?: string;  // Brief description of the invoice
  
  // Client information
  client: {
    id?: string;              // Client ID added
    name: string;
    address: string;
    email: string;
    phone: string;
  };
  
  // Company information
  company: {
    name: string;
    address: string;
    email: string;
    phone: string;
    logo?: string;
    stamp?: string;
    signature?: string;        // Digital signature image
    regNumber?: string;        // Company registration number
    vatNumber?: string;        // VAT registration number
    bankDetails?: {
      accountName?: string;
      accountNumber?: string;
      bankName?: string;
      branchCode?: string;
    };
  };
  
  // Invoice line items
  items: InvoiceItem[];
  
  // Financial information
  subtotal: number;           // Sum of all items before tax
  vatRate: number;            // VAT/tax rate percentage
  tax: number;                // Tax amount
  taxAmount?: number;         // Alternative tax amount field (for compatibility)
  total: number;              // Final total including tax
  
  // Additional information
  notes?: string;             // Additional notes
  terms?: string;             // Payment terms
  bankingDetails?: string;    // Bank account information (old format)
  currency?: string;          // Currency code (default: ZAR)
  
  // Status information
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'; // Invoice status
  paidDate?: string;          // Date the invoice was paid
  
  // Metadata
  createdAt?: string;         // Date the invoice was created
  updatedAt?: string;         // Date the invoice was last updated
  sentToClient?: boolean;     // Whether the invoice has been sent to the client
  sentDate?: string;          // Date the invoice was sent to the client 

  // Template selection
  template?: number;          // Template number (1-8)
  hideMarkup?: boolean;       // Whether to hide markup percentages
  
  // Added signature property at the top level for compatibility
  signature?: string;         // Digital signature image (for backward compatibility)
}

export interface InvoiceItem {
  id?: string;                // Unique identifier
  itemNo?: number | string;    // Item number or SKU
  description: string;        // Description of the item
  quantity: number;           // Quantity
  unitPrice: number;          // Unit price
  markupPercentage?: number;  // Added markup percentage
  discount?: number;          // Discount amount or percentage
  amount: number;             // Total amount for this item
  taxRate?: number;           // Tax rate for this item
}

export interface TemplateProps {
  data: InvoiceData;
  preview?: boolean;
}
