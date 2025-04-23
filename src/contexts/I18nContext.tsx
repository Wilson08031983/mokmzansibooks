import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Example translation structure, extend as needed
const translations = {
  english: {
    settingsTitle: "Settings",
    settingsDescription: "Manage your account, preferences and more.",
    profile: "Profile",
    company: "Company",
    preferences: "Preferences",
    subscription: "Subscription",
    security: "Security",
    personalInformation: "Personal Information",
    updatePersonalDetails: "Update your personal details",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    positionRole: "Position/Role",
    receiveMarketing: "Receive Marketing Emails",
    receiveNotifications: "Receive Notifications",
    cancel: "Cancel",
    save: "Save",
    saving: "Saving...",
    companyInformation: "Company Information",
    updateCompanyDetails: "Update your company details",
    companyName: "Company Name",
    registrationNumber: "Registration Number",
    vatNumber: "VAT Number",
    industry: "Industry",
    businessAddress: "Business Address",
    city: "City",
    province: "Province",
    postalCode: "Postal Code",
    country: "Country",
    languageAndCurrency: "Language & Currency",
    setPreferredLanguage: "Set your preferred language and currency",
    languagePreference: "Language Preference",
    selectPreferredLanguage: "Select your preferred language for the application.",
    english: "English",
    useEnglish: "Use English as the default language",
    afrikaans: "Afrikaans",
    useAfrikaans: "Gebruik Afrikaans as die verstektaal",
    currencyPreference: "Currency Preference",
    selectPreferredCurrency: "Select your preferred currency for transactions.",
    themePreference: "Theme Preference",
    chooseTheme: "Choose your preferred theme for the application.",
    applyToAll: "Apply to all invoices and quotes",
    updateExisting: "(updates existing documents)",
    savePreferences: "Save Preferences",
  },
  afrikaans: {
    settingsTitle: "Instellings",
    settingsDescription: "Bestuur jou rekening, voorkeure en meer.",
    profile: "Profiel",
    company: "Maatskappy",
    preferences: "Voorkeure",
    subscription: "Subskripsie",
    security: "Sekuriteit",
    personalInformation: "Persoonlike Inligting",
    updatePersonalDetails: "Dateer jou persoonlike inligting op",
    fullName: "Volle Naam",
    emailAddress: "E-posadres",
    phoneNumber: "Telefoonnommer",
    positionRole: "Pos/Rol",
    receiveMarketing: "Ontvang Bemarkings E-posse",
    receiveNotifications: "Ontvang Kennisgewings",
    cancel: "Kanselleer",
    save: "Stoor",
    saving: "Besig om te stoor...",
    companyInformation: "Maatskappy Inligting",
    updateCompanyDetails: "Dateer jou maatskappy se besonderhede op",
    companyName: "Maatskappy Naam",
    registrationNumber: "Registrasienommer",
    vatNumber: "BTW Nommer",
    industry: "Industrie",
    businessAddress: "Besigheidsadres",
    city: "Stad",
    province: "Provinsie",
    postalCode: "Poskode",
    country: "Land",
    languageAndCurrency: "Taal & Geldeenheid",
    setPreferredLanguage: "Stel jou voorkeurtaal en geldeenheid",
    languagePreference: "Taalvoorkeur",
    selectPreferredLanguage: "Kies jou voorkeurtaal vir die toepassing.",
    english: "Engels",
    useEnglish: "Use English as the default language",
    afrikaans: "Afrikaans",
    useAfrikaans: "Gebruik Afrikaans as die verstektaal",
    currencyPreference: "Geldeenheidvoorkeur",
    selectPreferredCurrency: "Kies jou voorkeur geldeenheid vir transaksies.",
    themePreference: "Tema Voorkeur",
    chooseTheme: "Kies jou voorkeur tema vir die toepassing.",
    applyToAll: "Pas toe op alle fakture en kwotasies",
    updateExisting: "(werk bestaande dokumente op)",
    savePreferences: "Stoor Voorkeure",
  },
};

type SupportedLanguage = "english" | "afrikaans";
type SupportedCurrency = "ZAR" | "USD" | "EUR";

interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(
    (localStorage.getItem("lang") as SupportedLanguage) || "english"
  );
  const [currency, setCurrencyState] = useState<SupportedCurrency>(
    (localStorage.getItem("currency") as SupportedCurrency) || "ZAR"
  );

  useEffect(() => {
    localStorage.setItem("lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("currency", currency);
  }, [currency]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
  };

  const setCurrency = (cur: SupportedCurrency) => {
    setCurrencyState(cur);
  };

  const t = (key: string) => {
    return translations[language]?.[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, currency, setCurrency }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
};
