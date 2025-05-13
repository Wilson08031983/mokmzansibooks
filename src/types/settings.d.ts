
/**
 * Type definitions for application settings
 */

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  currencyFormat: string;
  dateFormat: string;
  notifications: boolean;
  autoSave: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  [key: string]: any;
}

export interface UserPreference {
  userId: string;
  lastVisitedPage: string;
  recentSearches: string[];
  favoriteClients: string[];
  favoriteItems: string[];
  dashboardLayout: string[];
  hiddenWidgets: string[];
  customTheme: Record<string, string> | null;
  [key: string]: any;
}
