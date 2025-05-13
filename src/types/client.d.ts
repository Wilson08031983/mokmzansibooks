
// Base client interface
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

// Company client type
export interface CompanyClient extends Client {
  type: 'company';
  contactPerson: string;
  vatNumber: string;
  registrationNumber: string;
}

// Individual client type
export interface IndividualClient extends Client {
  type: 'individual';
  firstName: string;
  lastName: string;
}

// Vendor client type
export interface VendorClient extends Client {
  type: 'vendor';
  contactPerson: string;
  vendorCategory: string;
  vendorCode: string | null;
}

// State for storing all client types
export interface ClientsState {
  companies: CompanyClient[];
  individuals: IndividualClient[];
  vendors: VendorClient[];
}
