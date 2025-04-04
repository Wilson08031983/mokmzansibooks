
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { InvoiceData } from "@/types/invoice";
import { QuoteData } from "@/types/quote";

// Function to render the appropriate template component
const getTemplateComponent = (templateId: number, data: InvoiceData) => {
  // This is a placeholder - the actual implementation will need to be handled in the component
  // that calls this function, as React components can't be directly used here
  return null;
};

export const downloadInvoiceAsPdf = async (
  invoiceElement: HTMLElement,
  fileName: string = "invoice.pdf"
) => {
  try {
    // Create a canvas from the invoice element
    const canvas = await html2canvas(invoiceElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Calculate the width and height to maintain aspect ratio
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add the image to the PDF
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Save the PDF
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};

// Generic function to download any document as PDF
export const downloadDocumentAsPdf = async (
  element: HTMLElement,
  fileName: string
) => {
  try {
    // Create a canvas from the element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // Calculate the width and height to maintain aspect ratio
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add the image to the PDF
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // Save the PDF
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};

export const downloadQuoteAsPdf = async (
  quoteElement: HTMLElement,
  fileName: string = "quote.pdf"
) => {
  return downloadDocumentAsPdf(quoteElement, fileName);
};
