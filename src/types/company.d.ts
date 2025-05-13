
/**
 * Type definitions for company data
 */

export interface CompanyDetails {
  id?: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  registrationNumber: string;
  vatNumber: string;
  logo?: string | null;
  stamp?: string | null;
  signature?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  industry?: string;
  addressLine2?: string;
  createdAt?: string;
  updatedAt?: string;
  taxRegistrationNumber?: string;
  csdRegistrationNumber?: string;
  directorFirstName?: string;
  directorLastName?: string;
}
