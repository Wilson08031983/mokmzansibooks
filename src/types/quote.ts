
export interface QuoteData {
  quoteNumber: string;
  issueDate: string;
  expiryDate: string;
  shortDescription?: string;
  language?: "english" | "afrikaans";
  currency?: string;
  client: QuoteClient;
  company: QuoteCompany;
  items: QuoteItem[];
  subtotal: number;
  vatRate: number;
  tax: number;
  total: number;
  notes?: string;
  terms?: string;
  bankingDetails?: string;
  signature?: string;
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
}

export interface QuoteItem {
  itemNo: number | string;
  description: string;
  quantity: number;
  markupPercentage?: number;
  unitPrice: number;
  discount: number;
  amount: number;
}

export interface TemplateProps {
  data: QuoteData;
  preview?: boolean;
}
