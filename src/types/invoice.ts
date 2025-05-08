
export interface InvoiceData {
  id?: string;                 // Unique identifier
  invoiceNumber: string;       // Invoice number (e.g., INV-2025-01-001)
  issueDate: string;          // Date the invoice was issued
  dueDate: string;            // Date the invoice is due
  shortDescription?: string;  // Brief description of the invoice
  
  // Client information
  client: {
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
  };
  
  // Invoice line items
  items: InvoiceItem[];
  
  // Financial information
  subtotal: number;           // Sum of all items before tax
  vatRate: number;            // VAT/tax rate percentage
  tax: number;                // Tax amount
  total: number;              // Final total including tax
  
  // Additional information
  notes?: string;             // Additional notes
  terms?: string;             // Payment terms
  bankingDetails?: string;    // Bank account information
  signature?: string;         // Digital signature image
  currency?: string;          // Currency code (default: ZAR)
  
  // Status information
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'; // Invoice status
  paidDate?: string;          // Date the invoice was paid
  
  // Metadata
  createdAt?: string;         // Date the invoice was created
  updatedAt?: string;         // Date the invoice was last updated
  sentToClient?: boolean;     // Whether the invoice has been sent to the client
  sentDate?: string;          // Date the invoice was sent to the client 
}

export interface InvoiceItem {
  itemNo: number | string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  amount: number;
}

export interface TemplateProps {
  data: InvoiceData;
  preview?: boolean;
}
