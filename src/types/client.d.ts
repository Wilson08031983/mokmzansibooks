
// Base client interface with common properties
export interface BaseClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  credit?: number;
  outstanding?: number;
  overdue?: number;
  lastInteraction?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Company client type
export interface CompanyClient extends BaseClient {
  type: "company";
  contactPerson?: string;
  vatNumber?: string;
  registrationNumber?: string;
}

// Individual client type
export interface IndividualClient extends BaseClient {
  type: "individual";
  firstName?: string;
  lastName?: string;
}

// Vendor client type
export interface VendorClient extends BaseClient {
  type: "vendor";
  contactPerson?: string;
  category?: string;
}

// Union type for all client types
export type Client = CompanyClient | IndividualClient | VendorClient;

// Type guard functions to safely handle client types
export function isCompanyClient(client: Client): client is CompanyClient {
  return client.type === 'company';
}

export function isVendorClient(client: Client): client is VendorClient {
  return client.type === 'vendor';
}

export function isIndividualClient(client: Client): client is IndividualClient {
  return client.type === 'individual';
}

// Helper function to check if a client has a contact person
export function hasContactPerson(client: Client): boolean {
  return isCompanyClient(client) || isVendorClient(client);
}

// Add these for the client context - explicitly exported
export interface ClientsData {
  companies: CompanyClient[];
  individuals: IndividualClient[];
  vendors: VendorClient[];
}

export interface ClientsState {
  companies: CompanyClient[];
  individuals: IndividualClient[];
  vendors: VendorClient[];
}
