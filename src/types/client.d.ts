
// Adding missing properties to match the usage in ClientContext.tsx

export interface Client {
  id: string;
  type: 'company' | 'individual' | 'vendor';
  name: string;
  email: string;
  phone: string;
  address: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  credit: number;
  outstanding: number;
  overdue: number;
  lastInteraction: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyClient extends Client {
  type: 'company';
  vatNumber: string;
  registrationNumber: string;
  contactPerson: string;
}

export interface IndividualClient extends Client {
  type: 'individual';
  firstName: string;
  lastName: string;
}

export interface VendorClient extends Client {
  type: 'vendor';
  contactPerson: string;
  vendorCategory: string;
  vendorCode?: string;
}

export interface ClientsState {
  companies: CompanyClient[];
  individuals: IndividualClient[];
  vendors: VendorClient[];
}
