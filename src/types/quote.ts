
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
  };
  company: {
    name: string;
    address: string;
    email: string;
    phone: string;
    logo?: string;
    stamp?: string;
  };
  items: {
    itemNo?: string;
    description: string;
    quantity: number;
    unitPrice?: number;
    rate?: number;
    discount?: number;
    amount: number;
    websiteUrl?: string;
  }[];
  subtotal: number;
  vatRate?: number;
  tax: number;
  total: number;
  notes?: string;
  terms?: string;
  signature?: string;
}

export interface TemplateProps {
  data: QuoteData;
  preview?: boolean;
}
