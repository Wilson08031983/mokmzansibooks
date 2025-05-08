
export interface BaseClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyClient extends BaseClient {
  type: 'company';
  contactPerson?: string;
  vatNumber?: string;
  registrationNumber?: string;
}

export interface IndividualClient extends BaseClient {
  type: 'individual';
  firstName?: string;
  lastName?: string;
}

export interface VendorClient extends BaseClient {
  type: 'vendor';
  contactPerson?: string;
  category?: string;
}

export type Client = CompanyClient | IndividualClient | VendorClient;

export interface ClientsData {
  companies: CompanyClient[];
  individuals: IndividualClient[];
  vendors: VendorClient[];
}

// Add this for the client context
export interface ClientsState {
  companies: CompanyClient[];
  individuals: IndividualClient[];
  vendors: VendorClient[];
}
