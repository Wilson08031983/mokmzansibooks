
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

// Define types for our financial data
export interface TaxReturn {
  id: string;
  period: string;
  dueDate: string;
  status: string;
  amount: number;
  submissionDate?: string;
}

export interface TaxDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  category: string;
}

export interface TaxDeadline {
  id: string;
  title: string;
  date: string;
  description: string;
  type: string;
}

export interface FinancialReportData {
  title: string;
  type: string;
  items: {
    label: string;
    value: number;
  }[];
}

interface FinancialDataContextType {
  vatReturns: TaxReturn[];
  payeReturns: TaxReturn[];
  incomeTaxForms: {
    id: string;
    taxYear: string;
    dueDate: string;
    status: string;
    taxableIncome: number;
    taxDue: number;
    submissionDate?: string;
  }[];
  taxDocuments: TaxDocument[];
  taxDeadlines: TaxDeadline[];
  financialReports: FinancialReportData[];
  updateVatReturns: (returns: TaxReturn[]) => void;
  updatePayeReturns: (returns: TaxReturn[]) => void;
  updateIncomeTaxForms: (forms: any[]) => void;
  updateTaxDocuments: (documents: TaxDocument[]) => void;
  updateTaxDeadlines: (deadlines: TaxDeadline[]) => void;
  updateFinancialReports: (reports: FinancialReportData[]) => void;
  addVatReturn: (vatReturn: TaxReturn) => void;
  addPayeReturn: (payeReturn: TaxReturn) => void;
  addTaxDocument: (document: TaxDocument) => void;
  getTotalTaxLiability: () => number;
  getUpcomingDeadlines: (count?: number) => TaxDeadline[];
  getRecentDocuments: (count?: number) => TaxDocument[];
}

const FinancialDataContext = createContext<FinancialDataContextType | undefined>(undefined);

export const FinancialDataProvider = ({ children }: { children: ReactNode }) => {
  const { toast } = useToast();
  const [vatReturns, setVatReturns] = useState<TaxReturn[]>([
    {
      id: "VAT-2025-Q1",
      period: "Jan - Mar 2025",
      dueDate: "2025-04-30",
      status: "Due",
      amount: 12450.75,
    },
    {
      id: "VAT-2024-Q4",
      period: "Oct - Dec 2024",
      dueDate: "2025-01-31",
      status: "Submitted",
      amount: 10320.50,
      submissionDate: "2025-01-15",
    },
    {
      id: "VAT-2024-Q3",
      period: "Jul - Sep 2024",
      dueDate: "2024-10-31",
      status: "Submitted",
      amount: 9875.25,
      submissionDate: "2024-10-20",
    }
  ]);

  const [payeReturns, setPayeReturns] = useState<TaxReturn[]>([
    {
      id: "PAYE-2025-03",
      period: "March 2025",
      dueDate: "2025-04-07",
      status: "Due",
      amount: 45250.50,
    },
    {
      id: "PAYE-2025-02",
      period: "February 2025",
      dueDate: "2025-03-07",
      status: "Submitted",
      amount: 44830.75,
      submissionDate: "2025-03-05",
    },
    {
      id: "PAYE-2025-01",
      period: "January 2025",
      dueDate: "2025-02-07",
      status: "Submitted",
      amount: 44125.25,
      submissionDate: "2025-02-06",
    }
  ]);

  const [incomeTaxForms, setIncomeTaxForms] = useState([
    {
      id: "ITR14-2024",
      taxYear: "2024",
      dueDate: "2024-12-31",
      status: "Pending",
      taxableIncome: 1250000,
      taxDue: 350000,
    },
    {
      id: "ITR14-2023",
      taxYear: "2023",
      dueDate: "2023-12-31",
      status: "Submitted",
      taxableIncome: 980000,
      taxDue: 274400,
      submissionDate: "2023-11-15",
    },
    {
      id: "ITR14-2022",
      taxYear: "2022",
      dueDate: "2022-12-31",
      status: "Submitted",
      taxableIncome: 875000,
      taxDue: 245000,
      submissionDate: "2022-10-25",
    }
  ]);

  const [taxDocuments, setTaxDocuments] = useState<TaxDocument[]>([
    {
      id: "doc-1",
      name: "Tax Clearance Certificate",
      type: "PDF",
      size: "1.2 MB",
      uploadDate: "2025-02-15",
      category: "Certificates",
    },
    {
      id: "doc-2",
      name: "VAT Registration Certificate",
      type: "PDF",
      size: "854 KB",
      uploadDate: "2024-11-20",
      category: "Certificates",
    },
    {
      id: "doc-3",
      name: "ITR14 2023 Submission",
      type: "PDF",
      size: "2.3 MB",
      uploadDate: "2023-12-01",
      category: "Returns",
    },
    {
      id: "doc-4",
      name: "PAYE Registration Certificate",
      type: "PDF",
      size: "1.1 MB",
      uploadDate: "2023-10-15",
      category: "Certificates",
    },
    {
      id: "doc-5",
      name: "Tax Exemption Letter",
      type: "PDF",
      size: "590 KB",
      uploadDate: "2024-05-22",
      category: "Correspondence",
    }
  ]);

  const [taxDeadlines, setTaxDeadlines] = useState<TaxDeadline[]>([
    {
      id: "deadline-1",
      title: "VAT Return (Q1)",
      date: "2025-04-30",
      description: "Submit VAT return for January to March 2025",
      type: "VAT",
    },
    {
      id: "deadline-2",
      title: "Monthly PAYE",
      date: "2025-04-07",
      description: "Submit PAYE for March 2025",
      type: "PAYE",
    },
    {
      id: "deadline-3",
      title: "Provisional Tax Payment",
      date: "2025-06-30",
      description: "First provisional tax payment for 2025 tax year",
      type: "Provisional Tax",
    },
    {
      id: "deadline-4",
      title: "VAT Return (Q2)",
      date: "2025-07-31",
      description: "Submit VAT return for April to June 2025",
      type: "VAT",
    },
    {
      id: "deadline-5",
      title: "Annual Income Tax Return",
      date: "2025-12-31",
      description: "Submit annual income tax return (ITR14) for 2024 tax year",
      type: "Income Tax",
    }
  ]);

  const [financialReports, setFinancialReports] = useState<FinancialReportData[]>([
    {
      title: "Revenue by Quarter (2024)",
      type: "Revenue",
      items: [
        { label: "Q1", value: 320000 },
        { label: "Q2", value: 380000 },
        { label: "Q3", value: 420000 },
        { label: "Q4", value: 480000 }
      ]
    },
    {
      title: "Tax Payments (2024)",
      type: "Tax",
      items: [
        { label: "Income Tax", value: 274400 },
        { label: "VAT", value: 32540 },
        { label: "PAYE", value: 132750 },
        { label: "Other", value: 12500 }
      ]
    },
    {
      title: "Expense Breakdown",
      type: "Expense",
      items: [
        { label: "Operations", value: 420000 },
        { label: "Marketing", value: 180000 },
        { label: "Salaries", value: 850000 },
        { label: "Other", value: 90000 }
      ]
    }
  ]);

  // Update methods
  const updateVatReturns = (returns: TaxReturn[]) => {
    setVatReturns(returns);
    toast({
      title: "VAT Returns Updated",
      description: "Your VAT returns data has been updated."
    });
  };

  const updatePayeReturns = (returns: TaxReturn[]) => {
    setPayeReturns(returns);
    toast({
      title: "PAYE Returns Updated",
      description: "Your PAYE returns data has been updated."
    });
  };

  const updateIncomeTaxForms = (forms: any[]) => {
    setIncomeTaxForms(forms);
    toast({
      title: "Income Tax Forms Updated",
      description: "Your income tax forms data has been updated."
    });
  };

  const updateTaxDocuments = (documents: TaxDocument[]) => {
    setTaxDocuments(documents);
    toast({
      title: "Tax Documents Updated",
      description: "Your tax documents have been updated."
    });
  };

  const updateTaxDeadlines = (deadlines: TaxDeadline[]) => {
    setTaxDeadlines(deadlines);
    toast({
      title: "Tax Deadlines Updated",
      description: "Your tax deadlines have been updated."
    });
  };

  const updateFinancialReports = (reports: FinancialReportData[]) => {
    setFinancialReports(reports);
    toast({
      title: "Financial Reports Updated",
      description: "Your financial reports have been updated."
    });
  };

  // Add methods
  const addVatReturn = (vatReturn: TaxReturn) => {
    setVatReturns(prev => [vatReturn, ...prev]);
    toast({
      title: "VAT Return Added",
      description: `${vatReturn.id} has been added to your VAT returns.`
    });
  };

  const addPayeReturn = (payeReturn: TaxReturn) => {
    setPayeReturns(prev => [payeReturn, ...prev]);
    toast({
      title: "PAYE Return Added",
      description: `${payeReturn.id} has been added to your PAYE returns.`
    });
  };

  const addTaxDocument = (document: TaxDocument) => {
    setTaxDocuments(prev => [document, ...prev]);
    toast({
      title: "Tax Document Added",
      description: `${document.name} has been added to your documents.`
    });
  };

  // Utility methods
  const getTotalTaxLiability = () => {
    const vatLiability = vatReturns.reduce((sum, item) => 
      item.status === "Due" ? sum + item.amount : sum, 0);
    
    const payeLiability = payeReturns.reduce((sum, item) => 
      item.status === "Due" ? sum + item.amount : sum, 0);
    
    const incomeTaxLiability = incomeTaxForms.reduce((sum, item) => 
      item.status === "Pending" ? sum + item.taxDue : sum, 0);
    
    return vatLiability + payeLiability + incomeTaxLiability;
  };

  const getUpcomingDeadlines = (count = 3) => {
    // Sort deadlines by date and return the closest ones
    return [...taxDeadlines]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .filter(deadline => new Date(deadline.date) >= new Date())
      .slice(0, count);
  };

  const getRecentDocuments = (count = 3) => {
    // Sort documents by upload date and return the most recent ones
    return [...taxDocuments]
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())
      .slice(0, count);
  };

  return (
    <FinancialDataContext.Provider value={{
      vatReturns,
      payeReturns,
      incomeTaxForms,
      taxDocuments,
      taxDeadlines,
      financialReports,
      updateVatReturns,
      updatePayeReturns,
      updateIncomeTaxForms,
      updateTaxDocuments,
      updateTaxDeadlines,
      updateFinancialReports,
      addVatReturn,
      addPayeReturn,
      addTaxDocument,
      getTotalTaxLiability,
      getUpcomingDeadlines,
      getRecentDocuments
    }}>
      {children}
    </FinancialDataContext.Provider>
  );
};

export const useFinancialData = () => {
  const context = useContext(FinancialDataContext);
  if (context === undefined) {
    throw new Error('useFinancialData must be used within a FinancialDataProvider');
  }
  return context;
};
