
export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
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
    itemNo: number;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    discount: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  terms?: string;
  signature?: string;
}

export interface TemplateProps {
  data: InvoiceData;
  preview?: boolean;
}
