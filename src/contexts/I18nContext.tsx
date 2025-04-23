
import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "english" | "afrikaans";

interface I18nContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// English translations
const enTranslations: Record<string, string> = {
  // Navigation and common items
  "dashboard": "Dashboard",
  "clients": "Clients",
  "invoices": "Invoices",
  "quotes": "Quotes",
  "accounting": "Accounting",
  "inventory": "Inventory",
  "hr": "HR",
  "reports": "Reports",
  "settings": "Settings",
  "signIn": "Sign In",
  "signUp": "Sign Up",
  "logout": "Logout",
  "save": "Save Changes",
  "cancel": "Cancel",
  "search": "Search",
  
  // Settings page
  "settingsTitle": "Settings",
  "settingsDescription": "Manage your account settings and preferences",
  "profile": "Profile",
  "company": "Company",
  "preferences": "Preferences",
  "subscription": "Subscription",
  "security": "Security",
  "personalInformation": "Personal Information",
  "updatePersonalDetails": "Update your personal details and preferences",
  "fullName": "Full Name",
  "emailAddress": "Email Address",
  "phoneNumber": "Phone Number",
  "positionRole": "Position/Role",
  "receiveMarketing": "Receive marketing emails",
  "receiveNotifications": "Receive notification emails",
  
  // Company information
  "companyInformation": "Company Information",
  "updateCompanyDetails": "Update your company details and settings",
  "companyName": "Company Name",
  "registrationNumber": "Registration Number",
  "vatNumber": "VAT Number (if applicable)",
  "industry": "Industry",
  "businessAddress": "Business Address",
  "city": "City",
  "province": "Province",
  "postalCode": "Postal Code",
  "country": "Country",
  
  // Preferences
  "languageAndCurrency": "Language and Currency",
  "setPreferredLanguage": "Set your preferred language and currency for documents",
  "languagePreference": "Language Preference",
  "selectPreferredLanguage": "Select your preferred language for quotes, invoices and other documents.",
  "english": "English",
  "useEnglish": "Use English for all documents and interfaces",
  "afrikaans": "Afrikaans",
  "useAfrikaans": "Use Afrikaans for all documents and interfaces",
  "currencyPreference": "Currency Preference",
  "selectPreferredCurrency": "Select your preferred currency for financial calculations and reporting.",
  "southAfricanRand": "South African Rand",
  "usDollar": "US Dollar",
  "euro": "Euro",
  "themePreference": "Theme Preference",
  "chooseTheme": "Choose between light and dark themes for the application.",
  "lightTheme": "Light Theme",
  "darkTheme": "Dark Theme",
  "brightClean": "Bright and clean interface",
  "easierOnEyes": "Easier on the eyes in low light",
  "applyToAll": "Apply to all existing documents",
  "updateExisting": "(This will update all your existing quotes and invoices)",
  "savePreferences": "Save Preferences",
  "saving": "Saving...",
  
  // Subscription
  "yourSubscription": "Your Subscription",
  "manageSubscription": "Manage your subscription plan and billing",
  "freeTrial": "Free Trial",
  "premium": "Premium",
  "onFreeTrial": "You're on the free trial plan",
  "trialExpires": "Your trial expires on",
  "upgradeToPremium": "Upgrade to Premium to unlock all features including:",
  "unlimitedClients": "Unlimited clients and invoices",
  "fullQuickFill": "Full QuickFill functionality",
  "advancedAccounting": "Advanced accounting and tax features",
  "comprehensiveReports": "Comprehensive reports and analytics",
  "limitedFeatures": "Limited features for evaluation",
  "pricePerMonth": "R44.90 per month",
  "upgradeNow": "Upgrade Now",
  "onPremiumPlan": "You're on the Premium plan",
  "subscriptionRenews": "Your subscription renews on the 1st of each month.",
  "accessAllFeatures": "You have access to all premium features including unlimited clients, full QuickFill functionality, and advanced reports.",
  "subscriptionDetails": "Subscription Details",
  "plan": "Plan",
  "price": "Price",
  "billingCycle": "Billing Cycle",
  "nextBillingDate": "Next Billing Date",
  "paymentMethod": "Payment Method",
  "updatePaymentMethod": "Update Payment Method",
  "viewBillingHistory": "View Billing History",
  "cancelSubscription": "Cancel Subscription",
  
  // Security
  "securitySettings": "Security Settings",
  "manageAccountSecurity": "Manage your account security and authentication",
  "changePassword": "Change Password",
  "updateAccountPassword": "Update your account password",
  "twoFactorAuth": "Two-Factor Authentication",
  "extraLayerSecurity": "Add an extra layer of security",
  "loginHistory": "Login History",
  "viewLoginActivity": "View your recent login activity",
  "notifications": "Notifications",
  "emailLoginAlerts": "Email Login Alerts",
  "browserNotifications": "Browser Notifications",
  "securityActions": "All security actions are logged and audited for your safety."
};

// Afrikaans translations
const afTranslations: Record<string, string> = {
  // Navigation and common items
  "dashboard": "Kontroleskerm",
  "clients": "Kliënte",
  "invoices": "Fakture",
  "quotes": "Kwotasies",
  "accounting": "Rekeningkunde",
  "inventory": "Voorraad",
  "hr": "Menslike Hulpbronne",
  "reports": "Verslae",
  "settings": "Instellings",
  "signIn": "Meld Aan",
  "signUp": "Registreer",
  "logout": "Teken Uit",
  "save": "Veranderinge Stoor",
  "cancel": "Kanselleer",
  "search": "Soek",
  
  // Settings page
  "settingsTitle": "Instellings",
  "settingsDescription": "Bestuur jou rekening en voorkeure",
  "profile": "Profiel",
  "company": "Maatskappy",
  "preferences": "Voorkeure",
  "subscription": "Intekening",
  "security": "Sekuriteit",
  "personalInformation": "Persoonlike Inligting",
  "updatePersonalDetails": "Werk jou persoonlike besonderhede en voorkeure by",
  "fullName": "Volle Naam",
  "emailAddress": "E-posadres",
  "phoneNumber": "Telefoonnommer",
  "positionRole": "Posisie/Rol",
  "receiveMarketing": "Ontvang bemarkings-e-posse",
  "receiveNotifications": "Ontvang kennisgewings e-posse",
  
  // Company information
  "companyInformation": "Maatskappy Inligting",
  "updateCompanyDetails": "Werk jou maatskappy besonderhede en instellings by",
  "companyName": "Maatskappy Naam",
  "registrationNumber": "Registrasienommer",
  "vatNumber": "BTW Nommer (indien van toepassing)",
  "industry": "Bedryf",
  "businessAddress": "Besigheidsadres",
  "city": "Stad",
  "province": "Provinsie",
  "postalCode": "Poskode",
  "country": "Land",
  
  // Preferences
  "languageAndCurrency": "Taal en Geldeenheid",
  "setPreferredLanguage": "Stel jou voorkeur taal en geldeenheid vir dokumente",
  "languagePreference": "Taalvoorkeur",
  "selectPreferredLanguage": "Kies jou voorkeur taal vir kwotasies, fakture en ander dokumente.",
  "english": "Engels",
  "useEnglish": "Gebruik Engels vir alle dokumente en koppelvlakke",
  "afrikaans": "Afrikaans",
  "useAfrikaans": "Gebruik Afrikaans vir alle dokumente en koppelvlakke",
  "currencyPreference": "Geldeenheid Voorkeur",
  "selectPreferredCurrency": "Kies jou voorkeur geldeenheid vir finansiële berekeninge en verslagdoening.",
  "southAfricanRand": "Suid-Afrikaanse Rand",
  "usDollar": "Amerikaanse Dollar",
  "euro": "Euro",
  "themePreference": "Tema Voorkeur",
  "chooseTheme": "Kies tussen ligte en donker temas vir die toepassing.",
  "lightTheme": "Ligte Tema",
  "darkTheme": "Donker Tema",
  "brightClean": "Helder en skoon koppelvlak",
  "easierOnEyes": "Makliker op die oë in lae lig",
  "applyToAll": "Pas toe op alle bestaande dokumente",
  "updateExisting": "(Dit sal al jou bestaande kwotasies en fakture bywerk)",
  "savePreferences": "Voorkeure Stoor",
  "saving": "Stoor...",
  
  // Subscription
  "yourSubscription": "Jou Intekening",
  "manageSubscription": "Bestuur jou intekenplan en fakturering",
  "freeTrial": "Gratis Proefperiode",
  "premium": "Premium",
  "onFreeTrial": "Jy is op die gratis proefplan",
  "trialExpires": "Jou proeftydperk verval op",
  "upgradeToPremium": "Gradeer op na Premium om alle kenmerke te ontsluit, insluitend:",
  "unlimitedClients": "Onbeperkte kliënte en fakture",
  "fullQuickFill": "Volledige QuickFill funksionaliteit",
  "advancedAccounting": "Gevorderde rekeningkunde en belastingfunksies",
  "comprehensiveReports": "Omvattende verslae en analise",
  "limitedFeatures": "Beperkte kenmerke vir evaluasie",
  "pricePerMonth": "R44.90 per maand",
  "upgradeNow": "Gradeer Nou Op",
  "onPremiumPlan": "Jy is op die Premium plan",
  "subscriptionRenews": "Jou intekening hernu op die 1ste van elke maand.",
  "accessAllFeatures": "Jy het toegang tot alle premium kenmerke insluitend onbeperkte kliënte, volledige QuickFill funksionaliteit, en gevorderde verslae.",
  "subscriptionDetails": "Intekening Besonderhede",
  "plan": "Plan",
  "price": "Prys",
  "billingCycle": "Faktureringsiklus",
  "nextBillingDate": "Volgende Faktureringsdatum",
  "paymentMethod": "Betaalmetode",
  "updatePaymentMethod": "Betaalmetode Opdateer",
  "viewBillingHistory": "Bekyk Faktureringsrekord",
  "cancelSubscription": "Kanselleer Intekening",
  
  // Security
  "securitySettings": "Sekuriteit Instellings",
  "manageAccountSecurity": "Bestuur jou rekening sekuriteit en verifikasie",
  "changePassword": "Verander Wagwoord",
  "updateAccountPassword": "Werk jou rekening wagwoord by",
  "twoFactorAuth": "Twee-Faktor Verifikasie",
  "extraLayerSecurity": "Voeg 'n ekstra laag sekuriteit by",
  "loginHistory": "Aanmeldgeskiedenis",
  "viewLoginActivity": "Bekyk jou onlangse aanmeldaktiwiteit",
  "notifications": "Kennisgewings",
  "emailLoginAlerts": "E-pos Aanmeldwaarskuwings",
  "browserNotifications": "Blaaier Kennisgewings",
  "securityActions": "Alle sekuriteitsaksies word geregistreer en geoudit vir jou veiligheid."
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get initial language from localStorage or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem("language");
    return (savedLanguage as Language) || "english";
  });

  // Translation function
  const t = (key: string): string => {
    const translations = language === "english" ? enTranslations : afTranslations;
    return translations[key] || key; // Return the key if translation not found
  };

  // Update language and save to localStorage
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem("language", newLanguage);
  };

  // Effect to apply language when it changes
  useEffect(() => {
    document.documentElement.setAttribute("lang", language === "english" ? "en" : "af");
    // You could also update document.title here if needed
  }, [language]);

  const contextValue = {
    language,
    setLanguage,
    t
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
};
