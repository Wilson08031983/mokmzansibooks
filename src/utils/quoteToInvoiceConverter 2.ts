/**
 * Utility for converting Quote data to Invoice data
 */

import { format } from "date-fns";
import { generateInvoiceNumber } from "./invoiceUtils";

/**
 * Converts quote data to invoice data format
 * @param quoteData The quote data to convert
 * @returns InvoiceData object derived from the quote
 */
export const convertQuoteToInvoice = (quoteData: any) => {
  // Create a due date 30 days from now
  const dueDate = format(new Date(new Date().setDate(new Date().getDate() + 30)), "yyyy-MM-dd");
  
  return {
    invoiceNumber: generateInvoiceNumber(),
    issueDate: format(new Date(), "yyyy-MM-dd"),
    dueDate: dueDate,
    shortDescription: quoteData.shortDescription || `Invoice for Quote #${quoteData.quoteNumber}`,
    client: {
      name: quoteData.client.name,
      address: quoteData.client.address,
      email: quoteData.client.email,
      phone: quoteData.client.phone
    },
    company: quoteData.company,
    items: quoteData.items.map((item: any) => ({
      itemNo: item.itemNo,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount || 0,
      amount: item.amount
    })),
    subtotal: quoteData.subtotal,
    vatRate: quoteData.vatRate || 0,
    tax: quoteData.tax || 0,
    total: quoteData.total,
    notes: quoteData.notes || "",
    terms: quoteData.terms || "",
    bankingDetails: quoteData.bankingDetails || "",
    currency: quoteData.currency || "ZAR",
    status: "draft" as 'draft',
    quoteReference: quoteData.quoteNumber, // Keep reference to original quote
    createdAt: new Date().toISOString()
  };
};

/**
 * Saves quote data to localStorage for later conversion to invoice
 * @param quoteData The quote to save for conversion
 */
export const saveQuoteForInvoiceConversion = (quoteData: any) => {
  try {
    const quoteId = quoteData.id || quoteData.quoteNumber;
    localStorage.setItem(`quote_to_invoice_${quoteId}`, JSON.stringify(quoteData));
    return true;
  } catch (error) {
    console.error("Error saving quote for conversion:", error);
    return false;
  }
};

/**
 * Gets a list of quotes available for conversion to invoices
 * @returns Array of saved quotes with minimal info
 */
export const getQuotesForInvoiceConversion = () => {
  try {
    const quotes = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('quote_to_invoice_')) {
        const quoteData = JSON.parse(localStorage.getItem(key) || '{}');
        quotes.push({
          id: quoteData.id || quoteData.quoteNumber,
          quoteNumber: quoteData.quoteNumber,
          clientName: quoteData.client?.name || "Unknown Client",
          total: quoteData.total || 0,
          dateCreated: quoteData.dateCreated || quoteData.issueDate
        });
      }
    }
    return quotes;
  } catch (error) {
    console.error("Error getting quotes for conversion:", error);
    return [];
  }
};

/**
 * Loads a specific quote saved for conversion
 * @param quoteId The ID of the quote to load
 * @returns The quote data or null if not found
 */
export const loadQuoteForConversion = (quoteId: string) => {
  try {
    const quoteData = localStorage.getItem(`quote_to_invoice_${quoteId}`);
    if (!quoteData) return null;
    return JSON.parse(quoteData);
  } catch (error) {
    console.error("Error loading quote for conversion:", error);
    return null;
  }
};
