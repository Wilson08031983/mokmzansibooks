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

// Enhanced document text extraction function with OCR and AI capabilities
export const extractTextFromDocuments = async (files: File[]): Promise<{ 
  type: string; 
  data: Record<string, string>;
}> => {
  // This is a placeholder for the actual OCR and AI extraction implementation
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
  } else if (fileName.includes("invoice")) {
    documentType = "invoice";
  } else if (fileName.includes("rfq") || fileName.includes("quote")) {
    documentType = "rfq";
  } else if (fileName.includes("tender")) {
    documentType = "tender";
  } else if (fileName.includes("application")) {
    documentType = "application";
  }
  
  // In a real implementation, this would process the actual file content using OCR + AI
  // For demonstration purposes, we'll return the data based on file type
  const extractedData: Record<string, string> = {};
  
  // Simulate extracting different data based on document type
  console.log(`Extracting data from ${documentType} document`);
  
  return { 
    type: documentType, 
    data: extractedData 
  };
};

// Export document data to JSON
export const exportToJson = (data: Record<string, any>): string => {
  return JSON.stringify(data, null, 2);
};

// Function to process fillable PDF and identify form fields
export const identifyPdfFormFields = async (pdfFile: File): Promise<{
  fields: Array<{
    id: string;
    name: string;
    type: string;
    rect: { x: number, y: number, width: number, height: number };
    page: number;
  }>;
  pageCount: number;
}> => {
  // This is a placeholder for actual PDF field identification
  // In a real implementation, this would use a PDF parsing library
  
  console.log(`Identifying form fields in ${pdfFile.name}`);
  
  // Simulate identifying form fields
  return {
    fields: [],
    pageCount: 1
  };
};

// Function to populate a fillable PDF with extracted data
export const populateFillablePdf = async (
  pdfFile: File, 
  data: Record<string, string>, 
  fieldMapping: Record<string, string> = {}
): Promise<Blob> => {
  // This is a placeholder for actual PDF field population
  // In a real implementation, this would use a PDF manipulation library
  
  console.log(`Populating PDF form ${pdfFile.name} with data`);
  
  // For demonstration, we'll return the original file
  // In a real implementation, this would return the populated PDF
  return new Blob([await pdfFile.arrayBuffer()], { type: pdfFile.type });
};

// Function to match extracted data with form fields
export const matchDataToFormFields = (
  formFields: Array<{ id: string; name: string; type: string }>,
  extractedData: Record<string, string>
): { 
  mapping: Record<string, string>; 
  confidence: Record<string, number>;
} => {
  // This would use AI to match extracted data to form fields
  const mapping: Record<string, string> = {};
  const confidence: Record<string, number> = {};
  
  // For each form field, try to find the best match in extracted data
  formFields.forEach(field => {
    const fieldName = field.name.toLowerCase();
    
    // Simple matching logic (would be much more sophisticated with AI)
    Object.entries(extractedData).forEach(([key, value]) => {
      const keyLower = key.toLowerCase();
      
      // Check for common field names
      if (fieldName.includes('name') && keyLower.includes('name')) {
        mapping[field.id] = key;
        confidence[field.id] = 0.9; // High confidence
      } else if (fieldName.includes('email') && keyLower.includes('email')) {
        mapping[field.id] = key;
        confidence[field.id] = 0.95; // Very high confidence
      } else if (fieldName.includes('phone') && (keyLower.includes('phone') || keyLower.includes('tel'))) {
        mapping[field.id] = key;
        confidence[field.id] = 0.9; // High confidence
      } else if (fieldName.includes('address') && keyLower.includes('address')) {
        mapping[field.id] = key;
        confidence[field.id] = 0.85; // Good confidence
      } else if (fieldName.includes('company') && keyLower.includes('company')) {
        mapping[field.id] = key;
        confidence[field.id] = 0.9; // High confidence
      } else if (fieldName.includes('registration') && keyLower.includes('registration')) {
        mapping[field.id] = key;
        confidence[field.id] = 0.95; // Very high confidence
      } else if (fieldName.includes('tax') && keyLower.includes('tax')) {
        mapping[field.id] = key;
        confidence[field.id] = 0.9; // High confidence
      } else if (fieldName.includes('bbee') && keyLower.includes('bbee')) {
        mapping[field.id] = key;
        confidence[field.id] = 0.95; // Very high confidence
      } else if (fieldName.includes('csd') && keyLower.includes('csd')) {
        mapping[field.id] = key;
        confidence[field.id] = 0.9; // High confidence
      }
    });
    
    // If no match was found, set confidence to 0
    if (!mapping[field.id]) {
      confidence[field.id] = 0;
    }
  });
  
  return { mapping, confidence };
};

// Function to store extracted data for future use
export const storeExtractedData = (
  documentType: string, 
  data: Record<string, string>
): void => {
  // In a real implementation, this would store data in a database
  // For demonstration, we'll use localStorage
  try {
    const existingDataStr = localStorage.getItem('extractedData');
    const existingData = existingDataStr ? JSON.parse(existingDataStr) : {};
    
    existingData[documentType] = {
      ...existingData[documentType],
      ...data,
      _lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('extractedData', JSON.stringify(existingData));
    console.log(`Stored extracted data for ${documentType}`);
  } catch (error) {
    console.error('Error storing extracted data:', error);
  }
};

// Function to retrieve stored extracted data
export const getStoredExtractedData = (): Record<string, Record<string, string>> => {
  // In a real implementation, this would retrieve data from a database
  // For demonstration, we'll use localStorage
  try {
    const dataStr = localStorage.getItem('extractedData');
    return dataStr ? JSON.parse(dataStr) : {};
  } catch (error) {
    console.error('Error retrieving extracted data:', error);
    return {};
  }
};
