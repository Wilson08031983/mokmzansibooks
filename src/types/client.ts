
export type ClientType = 'company' | 'individual' | 'vendor';

export interface BaseClient {
  id: string;
  type: ClientType;
  name: string;
  email: string;
  phone: string;
  address: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  notes?: string;
  outstanding?: number;
  credit?: number;
  lastInteraction?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyClient extends BaseClient {
  type: 'company';
  contactPerson: string;
  vatNumber?: string;
  registrationNumber?: string;
}

export interface IndividualClient extends BaseClient {
  type: 'individual';
  firstName: string;
  lastName: string;
  idNumber?: string;
}

export interface VendorClient extends BaseClient {
  type: 'vendor';
  contactPerson: string;
  vendorCategory: string;
  vendorCode: string;
  paymentTerms?: string;
}

export type Client = CompanyClient | IndividualClient | VendorClient;

export interface ClientsState {
  companies: CompanyClient[];
  individuals: IndividualClient[];
  vendors: VendorClient[];
}
