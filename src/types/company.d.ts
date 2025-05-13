
export interface CompanyDetails {
  id?: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  bankingDetails?: {
    bankName: string;
    branchCode: string;
    accountNumber: string;
    accountType: string;
    accountName: string;
  };
  registrationNumber?: string;
  vatNumber?: string;
  industry?: string;
  taxId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CompanyDataResponse = {
  data: CompanyDetails[];
  success: boolean;
  error?: string;
};

export type CompanySaveResponse = {
  success: boolean;
  error?: string;
};
