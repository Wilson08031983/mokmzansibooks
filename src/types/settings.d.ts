
/**
 * Type definitions for application settings and user preferences
 */

export interface UserPreference {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  dashboard: {
    showWelcome: boolean;
    defaultView: 'summary' | 'detailed';
    widgets: string[];
  };
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  currencyFormat: string;
  timezone: string;
}

export interface AppSettings {
  version: string;
  buildNumber: string;
  environment: 'development' | 'staging' | 'production';
  features: Record<string, boolean>;
  apiEndpoints: Record<string, string>;
  analytics: {
    enabled: boolean;
    anonymizeData: boolean;
  };
  maintenance: {
    scheduled: boolean;
    scheduledTime: string | null;
    message: string | null;
  };
  storage: {
    localStorageEnabled: boolean;
    indexedDBEnabled: boolean;
  };
  security: {
    sessionTimeout: number;
    requirePasswordChange: boolean;
    passwordPolicy: {
      minLength: number;
      requireSpecialChars: boolean;
      requireNumbers: boolean;
      requireUppercase: boolean;
    };
  };
}
