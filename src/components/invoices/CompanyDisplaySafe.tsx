
import React from 'react';
import { Skeleton } from '../ui/skeleton';

export interface CompanyDisplaySafeProps {
  company?: {
    name?: string;
    address?: string;
    email?: string;
    phone?: string;
    logo?: string;
    stamp?: string;
    signature?: string;
    regNumber?: string;
    vatNumber?: string;
    bankDetails?: {
      accountName?: string;
      accountNumber?: string;
      bankName?: string;
      branchCode?: string;
    };
  };
  className?: string;
}

const CompanyDisplaySafe: React.FC<CompanyDisplaySafeProps> = ({ company, className = '' }) => {
  if (!company) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }
  
  return (
    <div className={`space-y-1 ${className}`}>
      <h3 className="font-bold text-lg">{company.name || 'Company Name'}</h3>
      <p className="text-sm">{company.address || 'Company Address'}</p>
      <p className="text-sm">{company.email || 'company@example.com'}</p>
      <p className="text-sm">{company.phone || '000-000-0000'}</p>
      {company.regNumber && <p className="text-sm">Reg: {company.regNumber}</p>}
      {company.vatNumber && <p className="text-sm">VAT: {company.vatNumber}</p>}
    </div>
  );
};

export default CompanyDisplaySafe;
