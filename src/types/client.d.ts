
/**
 * Client type definitions for different client types in the application
 */

// Base client type with common properties
export interface Client {
  id: string;
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
  type: 'company' | 'individual' | 'vendor';
}

// Company client type
export interface CompanyClient extends Client {
  type: 'company';
  vatNumber: string;
  registrationNumber: string;
  contactPerson: string;
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

// State structure for clients
export interface ClientsState {
  companies: CompanyClient[];
  individuals: IndividualClient[];
  vendors: VendorClient[];
}
