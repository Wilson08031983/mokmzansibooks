
export interface QuoteItem {
  itemNo: number | string;
  description: string;
  quantity: number;
  markupPercentage?: number;
  unitPrice: number;
  discount: number;
  total: number;
  amount: number; // Adding amount property here
  websiteUrl?: string;
}

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
}

export interface QuoteClient {
  name: string;
  address: string;
  email: string;
  phone: string;
  id?: string;
}

export interface QuoteCompany {
  name: string;
  address: string;
  email: string;
  phone: string;
  logo?: string;
  stamp?: string;
}

export interface TemplateProps {
  quoteData: QuoteData;
  quoteItems: QuoteItem[];
  client: QuoteClient;
  company: QuoteCompany;
  bankAccount: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchCode: string;
    swiftCode?: string;
  };
}
