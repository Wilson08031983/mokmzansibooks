import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export interface CompanyDetails {
  name: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  addressLine2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  vatNumber?: string;
  registrationNumber?: string;
  logo?: string | File;
  stamp?: string | File;
  signature?: string | File;
  industry?: string;
  website?: string;
  bankingDetails?: string;
  taxId?: string;
  notes?: string;
  directorFirstName?: string;
  directorLastName?: string;
}

interface CompanyContextProps {
  companyDetails: CompanyDetails | null;
  setCompanyDetails: (details: CompanyDetails) => void;
  clearCompanyDetails: () => void;
}

const CompanyContext = createContext<CompanyContextProps | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load company details from localStorage on mount
    const storedDetails = localStorage.getItem("companyDetails");
    if (storedDetails) {
      try {
        setCompanyDetails(JSON.parse(storedDetails));
      } catch (error) {
        console.error("Error parsing company details from localStorage:", error);
        toast({
          title: "Error",
          description: "Failed to load company details from local storage",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  useEffect(() => {
    // Save company details to localStorage whenever they change
    if (companyDetails) {
      localStorage.setItem("companyDetails", JSON.stringify(companyDetails));
    } else {
      localStorage.removeItem("companyDetails");
    }
  }, [companyDetails]);

  const clearCompanyDetails = () => {
    setCompanyDetails(null);
  };

  const value: CompanyContextProps = {
    companyDetails,
    setCompanyDetails,
    clearCompanyDetails,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
};
