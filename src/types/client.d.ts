
export interface BaseClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
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

export interface CompanyClient extends BaseClient {
  type: 'company';
  contactPerson: string;
  vatNumber: string;
  registrationNumber: string;
}

export interface IndividualClient extends BaseClient {
  type: 'individual';
  firstName: string;
  lastName: string;
}

export interface VendorClient extends BaseClient {
  type: 'vendor';
  contactPerson: string;
  category: string;
  vendorCode?: string;
}

export type Client = CompanyClient | IndividualClient | VendorClient;

export interface ClientsState {
  companies: CompanyClient[];
  individuals: IndividualClient[];
  vendors: VendorClient[];
}
