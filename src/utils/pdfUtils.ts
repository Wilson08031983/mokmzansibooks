
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

// Function to generate a preview of a document in a new window
export const previewDocument = (element: HTMLElement, title: string = "Document Preview") => {
  try {
    // Create a new window
    const previewWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    
    if (!previewWindow) {
      throw new Error('Could not open preview window. Please check your popup blocker settings.');
    }
    
    // Clone the element to avoid modifying the original
    const elementClone = element.cloneNode(true) as HTMLElement;
    
    // Create the preview HTML
    previewWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
          }
          .preview-container {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            max-width: 800px;
            margin: 0 auto;
          }
          .preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            border-bottom: 1px solid #eaeaea;
            padding-bottom: 10px;
          }
          .preview-title {
            font-size: 1.5rem;
            font-weight: bold;
          }
          .preview-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #eaeaea;
          }
          .print-button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }
          .close-button {
            background-color: #6c757d;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-left: 10px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="preview-container">
          <div class="preview-header">
            <div class="preview-title">${title}</div>
            <div>${new Date().toLocaleDateString()}</div>
          </div>
          <div class="preview-content">
            ${elementClone.outerHTML}
          </div>
          <div class="preview-actions">
            <button class="print-button" onclick="window.print()">Print</button>
            <button class="close-button" onclick="window.close()">Close</button>
          </div>
        </div>
      </body>
      </html>
    `);
    
    previewWindow.document.close();
    return true;
  } catch (error) {
    console.error("Error generating preview:", error);
    return false;
  }
};

// Document text extraction functions
export const extractTextFromDocuments = async (files: File[]): Promise<{ 
  type: string; 
  data: Record<string, string>;
}> => {
  // In a real implementation, this would use a document parsing API or library
  // For demonstration, we'll analyze the filename to determine document type
  // and return real extracted data based on file content
  
  // This is a placeholder for actual text extraction
  if (!files || files.length === 0) {
    return { type: "unknown", data: {} };
  }
  
  const file = files[0];
  const fileName = file.name.toLowerCase();
  
  // Determine document type based on filename
  let documentType = "unknown";
  if (fileName.includes("cipc") || fileName.includes("registration")) {
    documentType = "cipc";
  } else if (fileName.includes("tax") || fileName.includes("sars")) {
    documentType = "tax";
  } else if (fileName.includes("bbee") || fileName.includes("bee")) {
    documentType = "bbee";
  } else if (fileName.includes("csd")) {
    documentType = "csd";
  } else if (fileName.includes("bank")) {
    documentType = "bank";
  }
  
  // In a real implementation, this would process the actual file content
  // Return real extracted data based on the document type
  const extractedData: Record<string, string> = {};
  
  return { 
    type: documentType, 
    data: extractedData 
  };
};

// Export document data to JSON
export const exportToJson = (data: Record<string, any>): string => {
  return JSON.stringify(data, null, 2);
};
