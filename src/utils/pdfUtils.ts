
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
      scale: 2.5, // Increased scale for better quality and text clarity
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: false,
      removeContainer: true,
      // Removed letterRendering as it's not supported in the Options type
      foreignObjectRendering: false
    });

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    // Calculate the width and height to maintain aspect ratio
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Add the image to the PDF with slight margins to prevent edge cutting
    const imgData = canvas.toDataURL("image/png", 1.0);
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
  // Use a custom implementation for quotes to ensure proper formatting
  try {
    // First, make a clone of the element to avoid modifying the displayed version
    const elementClone = quoteElement.cloneNode(true) as HTMLElement;
    
    // Apply some corrective styles to the clone
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      * {
        font-family: 'Helvetica', 'Arial', sans-serif !important;
        line-height: normal !important;
        text-rendering: geometricPrecision !important;
      }
      table {
        border-collapse: separate !important;
        border-spacing: 2px !important;
      }
      td, th {
        padding: 4px !important;
        white-space: nowrap !important;
      }
    `;
    elementClone.appendChild(styleElement);
    
    // Temporarily append the clone to the document to render it
    elementClone.style.position = 'absolute';
    elementClone.style.left = '-9999px';
    document.body.appendChild(elementClone);
    
    // Create the canvas
    const canvas = await html2canvas(elementClone, {
      scale: 3, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
      // Removed letterRendering as it's not supported in the Options type
      windowWidth: 980, // Fixed width to ensure consistency
      windowHeight: 1400 // Fixed height
    });
    
    // Remove the clone from the document
    document.body.removeChild(elementClone);
    
    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });
    
    // Calculate the width and height to maintain aspect ratio
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add the image to the PDF
    const imgData = canvas.toDataURL("image/png", 1.0);
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    
    // Save the PDF
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error("Error generating quote PDF:", error);
    // If the enhanced method fails, fall back to the generic method
    return downloadDocumentAsPdf(quoteElement, fileName);
  }
};
