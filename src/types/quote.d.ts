
export interface QuoteItem {
  itemNo: number;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total?: number;
  amount: number; // Adding amount property here
  markupPercentage?: number;
  websiteUrl?: string;
}

export interface QuoteData {
  quoteNumber: string;
  issueDate: string;
  expiryDate: string;
  shortDescription?: string;
  client: {
    name: string;
    address: string;
    email: string;
    phone: string;
    id?: string;
  };
  company: {
    name: string;
    address: string;
    email: string;
    phone: string;
    logo?: string;
    stamp?: string;
  };
  items: QuoteItem[];
  subtotal: number;
  vatRate: number;
  tax: number;
  total: number;
  notes?: string;
  terms?: string;
  bankingDetails?: string;
  signature?: string;
  bankAccount?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchCode: string;
    swiftCode?: string;
  };
}
