
export interface CompanyDetails {
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string; 
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  vatNumber?: string;
  registrationNumber?: string;
  logo?: string;
  stamp?: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: UserPermissions;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type UserRole = 'owner' | 'admin' | 'manager' | 'accountant' | 'employee';

export interface UserPermissions {
  canViewInvoices: boolean;
  canCreateInvoices: boolean;
  canEditInvoices: boolean;
  canDeleteInvoices: boolean;
  canViewClients: boolean;
  canCreateClients: boolean;
  canEditClients: boolean;
  canDeleteClients: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
  canManageUsers: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

export interface CompanySettings {
  defaultCurrency: string;
  defaultVatRate: number;
  defaultPaymentTerms: string;
  fiscalYearStart: string;
  dateFormat: string;
  language: string;
  logo?: string;
  emailSettings: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
    emailSignature: string;
  };
}
