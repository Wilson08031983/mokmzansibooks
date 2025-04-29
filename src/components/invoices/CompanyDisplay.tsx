
import React from "react";
import { Label } from "@/components/ui/label";

interface CompanyDisplayProps {
  company: {
    name: string;
    address: string;
    email: string;
    phone: string;
    logo?: string;
    stamp?: string;
  };
}

const CompanyDisplay: React.FC<CompanyDisplayProps> = ({ company }) => {
  return (
    <div className="space-y-2">
      <Label>My Company Details</Label>
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Name</p>
            <p>{company.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p>{company.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Address</p>
            <p className="whitespace-pre-line">{company.address}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p>{company.phone}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDisplay;
