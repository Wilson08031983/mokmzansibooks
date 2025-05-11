import React, { useEffect, useState } from 'react';
import { InvoiceData } from '@/types/invoice';

// Import all templates
import InvoiceTemplate5 from '@/templates/invoices/InvoiceTemplate5';
import InvoiceTemplate6 from '@/templates/invoices/InvoiceTemplate6';
import InvoiceTemplate7 from '@/templates/invoices/InvoiceTemplate7';
import InvoiceTemplate8 from '@/templates/invoices/InvoiceTemplate8';

// Import the functions to load company assets from localStorage
import { loadCompanyLogo, loadCompanyStamp, loadSignature } from '@/utils/invoiceFormPersistence';

interface InvoiceTemplatePreviewProps {
  invoice: InvoiceData;
  templateNumber: number;
}

/**
 * Component that renders a preview of a specific invoice template
 */
const InvoiceTemplatePreview: React.FC<InvoiceTemplatePreviewProps> = ({ invoice, templateNumber }) => {
  // State for company assets
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [companyStamp, setCompanyStamp] = useState<string>('');
  const [companySignature, setCompanySignature] = useState<string>('');
  
  // Load company assets on component mount
  useEffect(() => {
    // Load assets from localStorage
    const logoFile = loadCompanyLogo();
    const stampFile = loadCompanyStamp();
    const signatureFile = loadSignature();
    
    // Set the state with the loaded assets
    if (logoFile?.preview) setCompanyLogo(logoFile.preview);
    if (stampFile?.preview) setCompanyStamp(stampFile.preview);
    if (signatureFile?.preview) setCompanySignature(signatureFile.preview);
  }, []);
  
  // Convert invoice data to template format
  const templateData = {
    invoiceNumber: invoice.invoiceNumber || '',
    date: invoice.issueDate || new Date().toISOString().split('T')[0],
    dueDate: invoice.dueDate || '',
    companyDetails: {
      name: invoice.company?.name || '',
      address: invoice.company?.address || '',
      phone: invoice.company?.phone || '',
      email: invoice.company?.email || '',
      logo: companyLogo || invoice.company?.logo || '',
      stamp: companyStamp || invoice.company?.stamp || '',
      signature: companySignature || invoice.company?.signature || '',
      regNumber: invoice.company?.regNumber || '',
      vatNumber: invoice.company?.vatNumber || '',
      bankDetails: invoice.company?.bankDetails
    },
    clientDetails: {
      name: invoice.client?.name || '',
      address: invoice.client?.address || '',
      email: invoice.client?.email || '',
      phone: invoice.client?.phone || ''
    },
    items: invoice.items?.map(item => ({
      id: item.id || String(Math.random()),
      description: item.description || '',
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      amount: item.amount || 0,
      taxRate: item.taxRate || 0,
      markupPercentage: item.markupPercentage || 0
    })) || [],
    subtotal: invoice.subtotal || 0,
    taxAmount: invoice.taxAmount || invoice.tax || 0, // Use tax as fallback
    total: invoice.total || 0,
    notes: invoice.notes || '',
    terms: invoice.terms || '',
    currency: invoice.currency || 'R',
    printMode: false,
    hideMarkup: true
  };

  // Render the appropriate template based on the template number
  switch (templateNumber) {
    case 5:
      return <InvoiceTemplate5 {...templateData} />;
    case 6:
      return <InvoiceTemplate6 {...templateData} />;
    case 7:
      return <InvoiceTemplate7 {...templateData} />;
    case 8:
      return <InvoiceTemplate8 {...templateData} />;
    default:
      return (
        <div className="bg-gray-100 p-6 rounded-lg text-center">
          <p className="text-lg font-medium">Template {templateNumber} Preview</p>
          <p className="text-sm text-gray-500 mt-2">
            This template will be used when generating the PDF.
          </p>
        </div>
      );
  }
};

export default InvoiceTemplatePreview;
