
// If you already have this file, make sure it includes these types
export interface Client {
  id: string;
  name: string;
  type: 'company' | 'individual' | 'vendor';
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
  vendorCategory: string;
  vendorCode: string | null;
  contactPerson: string;
}

export interface ClientsState {
  companies: CompanyClient[];
  individuals: IndividualClient[];
  vendors: VendorClient[];
}
