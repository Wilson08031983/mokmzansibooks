import { SimplifiedCompanyData } from "@/utils/companyDataSync";

/**
 * Global window object type extension for MokMzansi Books application
 */
declare global {
  interface Window {
    MokMzansiGlobal: {
      latestCompanyData: SimplifiedCompanyData;
      [key: string]: any;
    };
  }
}

export {};
