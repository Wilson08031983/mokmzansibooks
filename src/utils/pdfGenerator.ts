import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatCurrency } from './formatters';
import { QuoteData } from '@/types/quote';
import { InvoiceData } from '@/types/invoice';
import ReactDOMServer from 'react-dom/server';
import React from 'react';
// Import the functions to load company assets from localStorage
import { loadCompanyLogo, loadCompanyStamp, loadSignature } from './invoiceFormPersistence';

// Import new templates
import InvoiceTemplate5 from '@/templates/invoices/InvoiceTemplate5';
import InvoiceTemplate6 from '@/templates/invoices/InvoiceTemplate6';
import InvoiceTemplate7 from '@/templates/invoices/InvoiceTemplate7';
import InvoiceTemplate8 from '@/templates/invoices/InvoiceTemplate8';

import QuoteTemplate5 from '@/templates/quotes/QuoteTemplate5';
import QuoteTemplate6 from '@/templates/quotes/QuoteTemplate6';
import QuoteTemplate7 from '@/templates/quotes/QuoteTemplate7';
import QuoteTemplate8 from '@/templates/quotes/QuoteTemplate8';

/**
 * Generate a PDF quote directly from quote data
 * @param quote The quote data to generate the PDF from
 */
export const generateQuotePDF = async (quote: QuoteData, downloadPdf: boolean = true): Promise<jsPDF | void> => {
  try {
    // Create new PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set up variables for positioning
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;
    
    // Add company logo if available
    if (quote.company?.logo) {
      pdf.addImage(quote.company.logo, 'PNG', margin, yPos, 50, 20);
      yPos += 25;
    }
    
    // Header - Company Info
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('QUOTE', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // Add quote details
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Company details on left
    if (quote.company) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('From:', margin, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 5;
      pdf.text(quote.company.name || '', margin, yPos);
      yPos += 5;
      if (quote.company.address) {
        const addressLines = quote.company.address.split('\\n');
        addressLines.forEach(line => {
          pdf.text(line, margin, yPos);
          yPos += 5;
        });
      }
      if (quote.company.email) {
        pdf.text(`Email: ${quote.company.email}`, margin, yPos);
        yPos += 5;
      }
      if (quote.company.phone) {
        pdf.text(`Phone: ${quote.company.phone}`, margin, yPos);
        yPos += 5;
      }
    }
    
    // Reset yPos for client info on right
    yPos = 40;
    
    // Quote number, issue date, expiry date on right
    const rightColumnX = pageWidth - margin - 60;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Quote Details:', rightColumnX, yPos);
    pdf.setFont('helvetica', 'normal');
    yPos += 5;
    pdf.text(`Quote #: ${quote.quoteNumber || ''}`, rightColumnX, yPos);
    yPos += 5;
    pdf.text(`Issue Date: ${quote.issueDate || ''}`, rightColumnX, yPos);
    yPos += 5;
    pdf.text(`Expiry Date: ${quote.expiryDate || ''}`, rightColumnX, yPos);
    yPos += 5;
    
    if (quote.status) {
      pdf.setFillColor(quote.status === 'accepted' ? 200 : 240, quote.status === 'accepted' ? 240 : 200, 200);
      pdf.roundedRect(rightColumnX, yPos, 40, 7, 1, 1, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Status: ${quote.status.toUpperCase()}`, rightColumnX + 2, yPos + 5);
      yPos += 10;
    }
    
    // Client details
    yPos = 80;
    if (quote.client) {
      pdf.setFont('helvetica', 'bold');
      pdf.text('To:', margin, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 5;
      pdf.text(quote.client.name || '', margin, yPos);
      yPos += 5;
      if (quote.client.address) {
        const addressLines = quote.client.address.split('\\n');
        addressLines.forEach(line => {
          pdf.text(line, margin, yPos);
          yPos += 5;
        });
      }
      if (quote.client.email) {
        pdf.text(`Email: ${quote.client.email}`, margin, yPos);
        yPos += 5;
      }
      if (quote.client.phone) {
        pdf.text(`Phone: ${quote.client.phone}`, margin, yPos);
        yPos += 10;
      }
    }
    
    // Quote description if available
    if (quote.shortDescription) {
      yPos += 5;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Description:', margin, yPos);
      pdf.setFont('helvetica', 'normal');
      yPos += 5;
      pdf.text(quote.shortDescription, margin, yPos, {
        maxWidth: contentWidth
      });
      yPos += 10;
    }
    
    // Items table
    yPos += 10;
    pdf.setFont('helvetica', 'bold');
    
    // Table header
    const tableTop = yPos;
    const colWidths = {
      item: 10,
      desc: 70,
      qty: 20,
      price: 25,
      markup: 25,
      discount: 25,
      total: 25
    };
    
    // Draw table header background
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, yPos - 5, contentWidth, 10, 'F');
    
    // Draw table header text
    pdf.text('#', margin + 2, yPos);
    pdf.text('Description', margin + colWidths.item + 2, yPos);
    pdf.text('Qty', margin + colWidths.item + colWidths.desc + 2, yPos);
    pdf.text('Price', margin + colWidths.item + colWidths.desc + colWidths.qty + 2, yPos);
    pdf.text('Markup %', margin + colWidths.item + colWidths.desc + colWidths.qty + colWidths.price + 2, yPos);
    pdf.text('Disc. %', margin + colWidths.item + colWidths.desc + colWidths.qty + colWidths.price + colWidths.markup + 2, yPos);
    pdf.text('Total', pageWidth - margin - 20, yPos, { align: 'right' });
    
    yPos += 8;
    
    // Table rows
    pdf.setFont('helvetica', 'normal');
    
    if (quote.items && quote.items.length > 0) {
      quote.items.forEach((item, index) => {
        const itemNumber = item.itemNo || (index + 1);
        pdf.text(itemNumber.toString(), margin + 2, yPos);
        pdf.text(item.description || '', margin + colWidths.item + 2, yPos, {
          maxWidth: colWidths.desc - 4
        });
        pdf.text(item.quantity?.toString() || '0', margin + colWidths.item + colWidths.desc + 2, yPos);
        pdf.text(formatCurrency(Number(item.unitPrice) || 0), margin + colWidths.item + colWidths.desc + colWidths.qty + 2, yPos);
        pdf.text((item.markupPercentage?.toString() || '0') + '%', margin + colWidths.item + colWidths.desc + colWidths.qty + colWidths.price + 2, yPos);
        pdf.text((item.discount?.toString() || '0') + '%', margin + colWidths.item + colWidths.desc + colWidths.qty + colWidths.price + colWidths.markup + 2, yPos);
        pdf.text(formatCurrency(Number(item.total) || 0), pageWidth - margin - 20, yPos, { align: 'right' });
        
        // If description is long, add more space
        const descLines = pdf.splitTextToSize(item.description || '', colWidths.desc - 4);
        yPos += Math.max(7, descLines.length * 5);
        
        // Add line break between items
        if (index < quote.items.length - 1) {
          pdf.setDrawColor(200, 200, 200);
          pdf.line(margin, yPos - 3, margin + contentWidth, yPos - 3);
        }
        
        // Check if we need a new page
        if (yPos > 250) {
          pdf.addPage();
          yPos = margin;
        }
      });
    }
    
    // Draw outer border around items table
    const tableBottom = yPos;
    pdf.setDrawColor(180, 180, 180);
    pdf.rect(margin, tableTop - 5, contentWidth, tableBottom - tableTop + 5);
    
    // Summary section
    yPos += 15;
    const summaryX = pageWidth - margin - 80;
    
    // Subtotal
    pdf.text('Subtotal:', summaryX, yPos);
    pdf.text(formatCurrency(Number(quote.subtotal) || 0), pageWidth - margin, yPos, { align: 'right' });
    yPos += 7;
    
    // VAT
    if (quote.vatRate) {
      pdf.text(`VAT (${quote.vatRate}%):`, summaryX, yPos);
      pdf.text(formatCurrency(Number(quote.tax) || 0), pageWidth - margin, yPos, { align: 'right' });
      yPos += 7;
    }
    
    // Total
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total:', summaryX, yPos);
    pdf.text(formatCurrency(Number(quote.total) || 0), pageWidth - margin, yPos, { align: 'right' });
    
    // Terms and conditions
    yPos += 15;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Terms & Conditions:', margin, yPos);
    yPos += 7;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    
    const terms = quote.terms || `1. This quote is valid for 30 days from the issue date.
2. Payment terms: 50% deposit required to commence work, balance due on completion.
3. Delivery timeframe will be agreed upon acceptance of this quote.
4. Prices are subject to change if the scope of work changes.`;
    
    const termsLines = pdf.splitTextToSize(terms, contentWidth);
    pdf.text(termsLines, margin, yPos);
    
    // Footer with page number
    const footerText = `Quote #${quote.quoteNumber} - Generated on ${new Date().toLocaleDateString()}`;
    pdf.setFontSize(8);
    pdf.text(footerText, pageWidth / 2, 285, { align: 'center' });
    
    // Either save the PDF or return it based on the downloadPdf parameter
    if (downloadPdf) {
      // Save the PDF to the user's device
      pdf.save(`Quote_${quote.quoteNumber}.pdf`);
      return Promise.resolve();
    } else {
      // Return the pdf object for further processing (e.g., for email attachments)
      return Promise.resolve(pdf);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    return Promise.reject(error);
  }
};

/**
 * Generate a PDF from a DOM element
 * Alternative method that captures an HTML template
 */
/**
 * Generate an invoice PDF using one of the new templates
 * @param invoice Invoice data
 * @param templateNumber Template number (5, 6, 7, or 8)
 * @param downloadPdf Whether to download the PDF or return the jsPDF instance
 * @returns The jsPDF instance if downloadPdf is false, otherwise void
 */
export const generateInvoicePDFWithTemplate = async (
  invoice: InvoiceData,
  templateNumber: 5 | 6 | 7 | 8 = 5,
  downloadPdf: boolean = true
): Promise<jsPDF | void> => {
  try {
    // Load company assets from localStorage
    const logoFile = loadCompanyLogo();
    const stampFile = loadCompanyStamp();
    const signatureFile = loadSignature();
    
    // Convert invoice data to the format expected by the templates
    const templateData = {
      invoiceNumber: invoice.invoiceNumber || '',
      date: invoice.issueDate || new Date().toISOString().split('T')[0],
      dueDate: invoice.dueDate || '',
      companyDetails: {
        name: invoice.company?.name || '',
        address: invoice.company?.address || '',
        phone: invoice.company?.phone || '',
        email: invoice.company?.email || '',
        logo: logoFile?.preview || invoice.company?.logo || '',
        stamp: stampFile?.preview || invoice.company?.stamp || '',
        signature: signatureFile?.preview || invoice.company?.signature || '',
        regNumber: invoice.company?.regNumber || '',
        vatNumber: invoice.company?.vatNumber || '',
        bankDetails: invoice.company?.bankDetails || {
          accountName: '',
          accountNumber: '',
          bankName: '',
          branchCode: ''
        }
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
      taxAmount: invoice.taxAmount || 0,
      total: invoice.total || 0,
      notes: invoice.notes || '',
      terms: invoice.terms || '',
      currency: invoice.currency || 'R',
      printMode: true,
      hideMarkup: true
    };

    // Select the appropriate template component
    let TemplateComponent;
    switch (templateNumber) {
      case 6:
        TemplateComponent = InvoiceTemplate6;
        break;
      case 7:
        TemplateComponent = InvoiceTemplate7;
        break;
      case 8:
        TemplateComponent = InvoiceTemplate8;
        break;
      default:
        TemplateComponent = InvoiceTemplate5;
    }

    // Render the template to HTML string
    const templateHtml = ReactDOMServer.renderToString(
      React.createElement(TemplateComponent, templateData)
    );

    // Create a temporary DOM element to render the template
    const tempElement = document.createElement('div');
    tempElement.innerHTML = templateHtml;
    tempElement.style.width = '210mm';
    tempElement.style.height = '297mm';
    document.body.appendChild(tempElement);

    try {
      // Use html2canvas to convert the template to canvas
      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add the canvas image to the PDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

      if (downloadPdf) {
        // Download the PDF
        pdf.save(`Invoice_${invoice.invoiceNumber.replace(/\s+/g, '_')}.pdf`);
      } else {
        return pdf;
      }
    } finally {
      // Clean up the temporary element
      document.body.removeChild(tempElement);
    }
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw error;
  }
};

/**
 * Generate a quote PDF using one of the new templates
 * @param quote Quote data
 * @param templateNumber Template number (5, 6, 7, or 8)
 * @param downloadPdf Whether to download the PDF or return the jsPDF instance
 * @returns The jsPDF instance if downloadPdf is false, otherwise void
 */
export const generateQuotePDFWithTemplate = async (
  quote: QuoteData,
  templateNumber: 5 | 6 | 7 | 8 = 5,
  downloadPdf: boolean = true
): Promise<jsPDF | void> => {
  try {
    // Load company assets from localStorage
    const logoFile = loadCompanyLogo();
    const stampFile = loadCompanyStamp();
    const signatureFile = loadSignature();
    
    // Convert quote data to the format expected by the templates
    const templateData = {
      quoteNumber: quote.quoteNumber || '',
      date: quote.issueDate || new Date().toISOString().split('T')[0],
      expiryDate: quote.expiryDate || '',
      companyDetails: {
        name: quote.company?.name || '',
        address: quote.company?.address || '',
        phone: quote.company?.phone || '',
        email: quote.company?.email || '',
        logo: logoFile?.preview || quote.company?.logo || '',
        stamp: stampFile?.preview || quote.company?.stamp || '',
        signature: signatureFile?.preview || quote.company?.signature || '',
        regNumber: quote.company?.regNumber || '',
        vatNumber: quote.company?.vatNumber || '',
        bankDetails: quote.company?.bankDetails || {
          accountName: '',
          accountNumber: '',
          bankName: '',
          branchCode: ''
        }
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
      taxAmount: quote.taxAmount || 0,
      total: quote.total || 0,
      notes: quote.notes || '',
      terms: quote.terms || '',
      currency: quote.currency || 'R',
      printMode: true,
      hideMarkup: true
    };

    // Select the appropriate template component
    let TemplateComponent;
    switch (templateNumber) {
      case 6:
        TemplateComponent = QuoteTemplate6;
        break;
      case 7:
        TemplateComponent = QuoteTemplate7;
        break;
      case 8:
        TemplateComponent = QuoteTemplate8;
        break;
      default:
        TemplateComponent = QuoteTemplate5;
    }

    // Render the template to HTML string
    const templateHtml = ReactDOMServer.renderToString(
      React.createElement(TemplateComponent, templateData)
    );

    // Create a temporary DOM element to render the template
    const tempElement = document.createElement('div');
    tempElement.innerHTML = templateHtml;
    tempElement.style.width = '210mm';
    tempElement.style.height = '297mm';
    document.body.appendChild(tempElement);

    try {
      // Use html2canvas to convert the template to canvas
      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Create PDF with A4 dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Add the canvas image to the PDF
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);

      if (downloadPdf) {
        // Download the PDF
        pdf.save(`Quote_${quote.quoteNumber.replace(/\s+/g, '_')}.pdf`);
      } else {
        return pdf;
      }
    } finally {
      // Clean up the temporary element
      document.body.removeChild(tempElement);
    }
  } catch (error) {
    console.error('Error generating quote PDF:', error);
    throw error;
  }
};

export const generatePDFFromTemplate = async (elementId: string, filename: string): Promise<void> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID ${elementId} not found`);
    }
    
    // Capture the element as a canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Better resolution
      useCORS: true, // Allow images from other domains
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    // Create PDF from canvas
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Calculate dimensions to fit the image to PDF page
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageWidth = canvas.width;
    const imageHeight = canvas.height;
    const ratio = Math.min(pageWidth / imageWidth, pageHeight / imageHeight);
    
    const newWidth = imageWidth * ratio;
    const newHeight = imageHeight * ratio;
    const xPos = (pageWidth - newWidth) / 2;
    
    // Add the image to the PDF
    pdf.addImage(imgData, 'PNG', xPos, 10, newWidth, newHeight);
    
    // Save the PDF
    pdf.save(filename);
    
    return Promise.resolve();
  } catch (error) {
    console.error('Error generating PDF from template:', error);
    return Promise.reject(error);
  }
};
