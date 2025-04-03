
export interface QuoteData {
  quoteNumber: string;
  issueDate: string;
  expiryDate: string;
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
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }[];
  subtotal: number;
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
