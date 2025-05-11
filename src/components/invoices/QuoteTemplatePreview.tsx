import React, { useEffect, useState } from 'react';
import { QuoteData } from '@/types/quote';

// Import all templates
import QuoteTemplate5 from '@/templates/quotes/QuoteTemplate5';
import QuoteTemplate6 from '@/templates/quotes/QuoteTemplate6';
import QuoteTemplate7 from '@/templates/quotes/QuoteTemplate7';
import QuoteTemplate8 from '@/templates/quotes/QuoteTemplate8';

// Import the functions to load company assets from localStorage
import { loadCompanyLogo, loadCompanyStamp, loadSignature } from '@/utils/invoiceFormPersistence';

interface QuoteTemplatePreviewProps {
  quote: QuoteData;
  templateNumber: number;
}

/**
 * Component that renders a preview of a specific quote template
 */
const QuoteTemplatePreview: React.FC<QuoteTemplatePreviewProps> = ({ quote, templateNumber }) => {
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
  
  // Convert quote data to template format
  const templateData = {
    quoteNumber: quote.quoteNumber || '',
    date: quote.issueDate || new Date().toISOString().split('T')[0],
    expiryDate: quote.expiryDate || '',
    companyDetails: {
      name: quote.company?.name || '',
      address: quote.company?.address || '',
      phone: quote.company?.phone || '',
      email: quote.company?.email || '',
      logo: companyLogo || quote.company?.logo || '',
      stamp: companyStamp || quote.company?.stamp || '',
      signature: companySignature || quote.company?.signature || '',
      regNumber: quote.company?.regNumber || '',
      vatNumber: quote.company?.vatNumber || '',
      bankDetails: quote.company?.bankDetails
    },
    clientDetails: {
      name: quote.client?.name || '',
      address: quote.client?.address || '',
      email: quote.client?.email || '',
      phone: quote.client?.phone || ''
    },
    items: quote.items?.map(item => ({
      id: item.id || String(Math.random()),
      description: item.description || '',
      quantity: item.quantity || 0,
      unitPrice: item.unitPrice || 0,
      amount: item.amount || 0,
      taxRate: item.taxRate || 0,
      markupPercentage: item.markupPercentage || 0
    })) || [],
    subtotal: quote.subtotal || 0,
    taxAmount: quote.taxAmount || quote.tax || 0, // Use tax as fallback
    total: quote.total || 0,
    notes: quote.notes || '',
    terms: quote.terms || '',
    currency: quote.currency || 'R',
    printMode: false,
    hideMarkup: true
  };

  // Render the appropriate template based on the template number
  switch (templateNumber) {
    case 5:
      return <QuoteTemplate5 {...templateData} />;
    case 6:
      return <QuoteTemplate6 {...templateData} />;
    case 7:
      return <QuoteTemplate7 {...templateData} />;
    case 8:
      return <QuoteTemplate8 {...templateData} />;
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

export default QuoteTemplatePreview;
