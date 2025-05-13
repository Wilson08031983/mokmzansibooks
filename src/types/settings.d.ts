
/**
 * Type definitions for user preferences and app settings
 */

export interface UserPreference {
  theme: string;
  language: string;
  notificationsEnabled: boolean;
  dashboardLayout: string;
  colorScheme: string;
  fontSize: string;
  [key: string]: any;
}

export interface AppSettings {
  companyInfoRequired: boolean;
  taxPercentage: number;
  currencyFormat: string;
  dateFormat: string;
  backupFrequency: string;
  showLegalDisclaimer: boolean;
  [key: string]: any;
}

export interface GlobalAppState {
  isReady: boolean;
  isLoading: {
    company: boolean;
    clients: boolean;
    settings: boolean;
  };
  company: any;
  clients: {
    companies: any[];
    individuals: any[];
    vendors: any[];
  };
  settings: {
    userPreferences: UserPreference;
    appSettings: AppSettings;
  };
}
