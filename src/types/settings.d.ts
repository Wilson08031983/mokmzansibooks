
/**
 * Type definitions for application settings
 */

export interface UserPreference {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  compactMode: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  defaultCurrency: string;
  dateFormat: string;
  language: string;
}

export interface AppSettings {
  version: string;
  apiEndpoint?: string;
  features: {
    enableInventory: boolean;
    enableHR: boolean;
    enableClients: boolean;
    enableQuotes: boolean;
    enableInvoices: boolean;
    enableReports: boolean;
    enablePayments: boolean;
  };
  maintenance?: {
    scheduled: boolean;
    startTime?: string;
    endTime?: string;
    message?: string;
  };
}
