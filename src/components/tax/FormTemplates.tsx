
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select';
    options?: string[];
    required: boolean;
    autoFilled: boolean;
    value: string;
  }[];
}

interface FormTemplatesProps {
  onSelectTemplate: (template: FormTemplate) => void;
}

const FormTemplates: React.FC<FormTemplatesProps> = ({ onSelectTemplate }) => {
  const templates: FormTemplate[] = [
    {
      id: 'tax-return-2023',
      name: 'Tax Return 2023',
      description: 'Standard tax return form for the 2023 financial year',
      category: 'Returns',
      fields: [
        { id: 'taxReferenceNumber', label: 'Tax Reference Number', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'taxYear', label: 'Tax Year', type: 'text', required: true, autoFilled: false, value: '2023' },
        { id: 'firstName', label: 'First Name', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'lastName', label: 'Last Name', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'idNumber', label: 'ID Number', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'dateOfBirth', label: 'Date of Birth', type: 'date', required: true, autoFilled: false, value: '' },
        { id: 'email', label: 'Email Address', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'phone', label: 'Phone Number', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'address', label: 'Residential Address', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'postalCode', label: 'Postal Code', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'employerName', label: 'Employer Name', type: 'text', required: false, autoFilled: false, value: '' },
        { id: 'employerTaxNumber', label: 'Employer Tax Number', type: 'text', required: false, autoFilled: false, value: '' },
        { id: 'totalIncome', label: 'Total Income', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'totalDeductions', label: 'Total Deductions', type: 'text', required: false, autoFilled: false, value: '' },
      ]
    },
    {
      id: 'vat-return',
      name: 'VAT Return Form',
      description: 'VAT return form for registered businesses',
      category: 'Returns',
      fields: [
        { id: 'vatNumber', label: 'VAT Registration Number', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'tradingName', label: 'Trading Name', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'periodStart', label: 'Period Start Date', type: 'date', required: true, autoFilled: false, value: '' },
        { id: 'periodEnd', label: 'Period End Date', type: 'date', required: true, autoFilled: false, value: '' },
        { id: 'totalSales', label: 'Total Sales (Including VAT)', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'zeroRatedSupplies', label: 'Zero Rated Supplies', type: 'text', required: false, autoFilled: false, value: '' },
        { id: 'exemptSupplies', label: 'Exempt Supplies', type: 'text', required: false, autoFilled: false, value: '' },
        { id: 'standardRatedSupplies', label: 'Standard Rated Supplies', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'vatOnPurchases', label: 'VAT on Purchases', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'vatDue', label: 'VAT Due', type: 'text', required: true, autoFilled: false, value: '' },
      ]
    },
    {
      id: 'exemption-certificate',
      name: 'Tax Exemption Certificate',
      description: 'Application for tax exemption certificate',
      category: 'Certificates',
      fields: [
        { id: 'organizationName', label: 'Organization Name', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'registrationNumber', label: 'Registration Number', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'taxReferenceNumber', label: 'Tax Reference Number', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'exemptionType', label: 'Type of Exemption', type: 'select', options: ['Non-Profit Organization', 'Public Benefit Organization', 'Educational Institution', 'Religious Organization', 'Other'], required: true, autoFilled: false, value: '' },
        { id: 'exemptionReason', label: 'Reason for Exemption', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'authorizedPerson', label: 'Authorized Person Name', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'position', label: 'Position in Organization', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'contactNumber', label: 'Contact Number', type: 'text', required: true, autoFilled: false, value: '' },
        { id: 'email', label: 'Email Address', type: 'text', required: true, autoFilled: false, value: '' },
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map(template => (
        <Card key={template.id} className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>{template.name}</CardTitle>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <span className="font-medium">Category:</span> {template.category}
            </div>
            <div className="text-sm mt-2">
              <span className="font-medium">Fields:</span> {template.fields.length}
            </div>
          </CardContent>
          <CardFooter className="mt-auto">
            <Button 
              className="w-full" 
              variant="default" 
              onClick={() => onSelectTemplate(template)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Use Template
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default FormTemplates;
