
/**
 * Type definitions for company data
 */

export interface CompanyDetails {
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  contactEmail?: string;
  contactPhone?: string;
  website: string;
  registrationNumber: string;
  vatNumber: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  industry?: string;
}
