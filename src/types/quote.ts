export interface QuoteData {
  quoteNumber: string;
  issueDate: string;
  expiryDate: string;
  shortDescription?: string;
  language?: "english" | "afrikaans";
  currency?: "ZAR" | "USD" | "EUR";
  client: QuoteClient;
  company: QuoteCompany;
  items: QuoteItem[];
  subtotal: number;
  vatRate?: number;
  tax: number;
  total: number;
  notes?: string;
  terms?: string;
  signature?: string;
  bankAccount?: BankAccount;
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
  itemNo?: string;
  description: string;
  quantity: number;
  markupPercentage?: number;
  unitPrice?: number;
  rate?: number;
  discount?: number;
  amount: number;
  websiteUrl?: string;
}

export interface BankAccount {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  swiftCode?: string;
}

export interface TemplateProps {
  data: QuoteData;
  preview?: boolean;
}
