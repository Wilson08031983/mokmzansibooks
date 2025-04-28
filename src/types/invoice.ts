
export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
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
  items: InvoiceItem[];
  subtotal: number;
  vatRate: number;
  tax: number;
  total: number;
  notes?: string;
  terms?: string;
  bankingDetails?: string;
  signature?: string;
  currency?: string;
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
