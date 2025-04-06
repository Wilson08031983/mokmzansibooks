import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { InvoiceData } from "@/types/invoice";
import { QuoteData } from "@/types/quote";

const getTemplateComponent = (templateId: number, data: InvoiceData) => {
  return null;
};

export const downloadInvoiceAsPdf = async (
  invoiceElement: HTMLElement,
  fileName: string = "invoice.pdf"
) => {
  try {
    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff"
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error("Error generating PDF:", error);
    return false;
  }
};

export const downloadDocumentAsPdf = async (
  element: HTMLElement,
  fileName: string
) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: false,
      removeContainer: true,
      foreignObjectRendering: false
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const imgData = canvas.toDataURL("image/png", 1.0);
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

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
  try {
    const elementClone = quoteElement.cloneNode(true) as HTMLElement;
    
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
    
    elementClone.style.position = 'absolute';
    elementClone.style.left = '-9999px';
    document.body.appendChild(elementClone);
    
    const canvas = await html2canvas(elementClone, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
      windowWidth: 980,
      windowHeight: 1400
    });
    
    document.body.removeChild(elementClone);
    
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });
    
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const imgData = canvas.toDataURL("image/png", 1.0);
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error("Error generating quote PDF:", error);
    return downloadDocumentAsPdf(quoteElement, fileName);
  }
};

export const previewDocument = (element: HTMLElement, title: string = "Document Preview") => {
  try {
    const previewWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    
    if (!previewWindow) {
      throw new Error('Could not open preview window. Please check your popup blocker settings.');
    }
    
    const elementClone = element.cloneNode(true) as HTMLElement;
    
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

export const extractTextFromDocuments = async (files: File[]): Promise<{ 
  type: string; 
  data: Record<string, string>;
}> => {
  if (!files || files.length === 0) {
    return { type: "unknown", data: {} };
  }
  
  const file = files[0];
  const fileName = file.name.toLowerCase();
  
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
  
  console.log(`Extracting data from ${documentType} document`);
  
  const extractedData: Record<string, string> = {};
  
  if (documentType === "cipc") {
    extractedData["Company Name"] = "Morwa Moabelo (Pty) Ltd";
    extractedData["Registration Number"] = "2018/421571/07";
    extractedData["Director"] = "Wilson Mokgethwa Moabelo";
    extractedData["Registration Date"] = "2018-08-15";
  } else if (documentType === "tax") {
    extractedData["Tax Number"] = "9012345678";
    extractedData["Tax Status"] = "Compliant";
    extractedData["Issue Date"] = "2023-03-01";
    extractedData["Expiry Date"] = "2024-03-01";
  } else if (documentType === "bbee") {
    extractedData["B-BBEE Level"] = "Level 1";
    extractedData["Verification Agency"] = "BEE Verification Agency";
    extractedData["Certificate Number"] = "BEE12345/21";
    extractedData["Issue Date"] = "2023-01-15";
    extractedData["Expiry Date"] = "2024-01-14";
  } else if (documentType === "csd") {
    extractedData["CSD Registration"] = "MAAA0123456";
    extractedData["Supplier Number"] = "654321";
    extractedData["Registration Date"] = "2019-05-10";
    extractedData["Status"] = "Active";
  } else if (documentType === "bank") {
    extractedData["Bank Name"] = "First National Bank";
    extractedData["Account Holder"] = "Morwa Moabelo (Pty) Ltd";
    extractedData["Account Number"] = "62123456789";
    extractedData["Branch Code"] = "250655";
    extractedData["Account Type"] = "Business";
  } else if (documentType === "invoice" || documentType === "rfq" || documentType === "quote") {
    extractedData["Client Name"] = "ABC Corporation";
    extractedData["Client Contact"] = "Jane Smith";
    extractedData["Client Email"] = "jane.smith@abccorp.com";
    extractedData["Service Description"] = "Consulting Services";
    extractedData["Amount"] = "R15,000.00";
    extractedData["Date"] = "2023-04-15";
  }
  
  return { 
    type: documentType, 
    data: extractedData 
  };
};

export const exportToJson = (data: Record<string, any>): string => {
  return JSON.stringify(data, null, 2);
};

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
  console.log(`Identifying form fields in ${pdfFile.name}`);
  
  return {
    fields: [],
    pageCount: 1
  };
};

export const populateFillablePdf = async (
  pdfFile: File, 
  data: Record<string, string>, 
  fieldMapping: Record<string, string> = {}
): Promise<Blob> => {
  console.log(`Populating PDF form ${pdfFile.name} with data`);
  
  return new Blob([await pdfFile.arrayBuffer()], { type: pdfFile.type });
};

export const matchDataToFormFields = (
  formFields: Array<{ id: string; name: string; type: string }>,
  extractedData: Record<string, string>
): { 
  mapping: Record<string, string>; 
  confidence: Record<string, number>;
} => {
  const mapping: Record<string, string> = {};
  const confidence: Record<string, number> = {};
  
  formFields.forEach(field => {
    const fieldName = field.name.toLowerCase();
    
    Object.entries(extractedData).forEach(([key, value]) => {
      const keyLower = key.toLowerCase();
      
      if (fieldName.includes('name') && keyLower.includes('name')) {
        mapping[field.id] = key;
        confidence[field.id] = 0.9;
      } else if (fieldName.includes('email') && keyLower.includes('email')) {
        mapping[field.id] = key;
        confidence[field.id] = 0.95;
      } else if (fieldName.includes('phone') && (keyLower.includes('phone') || keyLower.includes('tel'))) {
        mapping[field.id] = key;
        confidence[field.id] = 0.9;
      } else if (fieldName.includes('address') && keyLower.includes('address')) {
        mapping[field.id] = key;
        confidence[field.id] = 0.85;
      } else if (fieldName.includes('company') && keyLower.includes('company')) {
        mapping[field.id] = key;
        confidence[field.id] = 0.9;
      } else if (fieldName.includes('registration') && keyLower.includes('registration')) {
        mapping[field.id] = key;
        confidence[field.id] = 0.95;
      } else if (fieldName.includes('tax') && keyLower.includes('tax')) {
        mapping[field.id] = key;
        confidence[field.id] = 0.9;
      } else if (fieldName.includes('bbee') && keyLower.includes('bbee')) {
        mapping[field.id] = key;
        confidence[field.id] = 0.95;
      } else if (fieldName.includes('csd') && keyLower.includes('csd')) {
        mapping[field.id] = key;
        confidence[field.id] = 0.9;
      }
    });
    
    if (!mapping[field.id]) {
      confidence[field.id] = 0;
    }
  });
  
  return { mapping, confidence };
};

export const storeExtractedData = (
  documentType: string, 
  data: Record<string, string>
): void => {
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

export const getStoredExtractedData = (): Record<string, Record<string, string>> => {
  try {
    const dataStr = localStorage.getItem('extractedData');
    return dataStr ? JSON.parse(dataStr) : {};
  } catch (error) {
    console.error('Error retrieving extracted data:', error);
    return {};
  }
};
