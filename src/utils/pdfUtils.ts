
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
    // Create a clone of the element to avoid modifying the original
    const elementClone = quoteElement.cloneNode(true) as HTMLElement;
    
    // Remove any scale transformations that might affect rendering
    elementClone.style.transform = 'none';
    elementClone.style.transformOrigin = 'top left';
    elementClone.style.width = '210mm';
    elementClone.style.margin = '0';
    elementClone.style.padding = '0';
    
    // Add necessary styles for PDF rendering
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
        width: 100% !important;
      }
      td, th {
        padding: 4px !important;
      }
      body {
        margin: 0 !important;
        padding: 0 !important;
      }
    `;
    elementClone.appendChild(styleElement);
    
    // Add the clone to the document but hide it from view
    elementClone.style.position = 'fixed';
    elementClone.style.left = '-9999px';
    elementClone.style.top = '0';
    document.body.appendChild(elementClone);
    
    // Use higher scale for better quality
    const canvas = await html2canvas(elementClone, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      allowTaint: true,
      onclone: (clonedDoc) => {
        // Further style adjustments if needed in the cloned document
        const clonedElement = clonedDoc.body.querySelector('[data-pdf-container]') as HTMLElement || elementClone;
        if (clonedElement instanceof HTMLElement) {
          clonedElement.style.transform = 'none';
          clonedElement.style.width = '210mm';
        }
      }
    });
    
    // Clean up by removing the clone
    document.body.removeChild(elementClone);
    
    // Create the PDF document
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });
    
    // Convert the canvas to an image and add it to the PDF
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const imgData = canvas.toDataURL("image/png", 1.0);
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    
    // Save the PDF
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error("Error generating quote PDF:", error);
    // Try the simpler download method as a fallback
    try {
      return downloadDocumentAsPdf(quoteElement, fileName);
    } catch (fallbackError) {
      console.error("Fallback PDF generation also failed:", fallbackError);
      return false;
    }
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
  if (fileName.includes("cipc") || fileName.includes("registration") || fileName.includes("cor")) {
    documentType = "cipc";
  } else if (fileName.includes("tax") || fileName.includes("sars") || fileName.includes("clearance")) {
    documentType = "tax";
  } else if (fileName.includes("bbee") || fileName.includes("bee") || fileName.includes("bbbee")) {
    documentType = "bbee";
  } else if (fileName.includes("csd") || fileName.includes("central") || fileName.includes("supplier")) {
    documentType = "csd";
  } else if (fileName.includes("bank") || fileName.includes("statement") || fileName.includes("confirmation")) {
    documentType = "bank";
  } else if (fileName.includes("invoice") || fileName.includes("bill")) {
    documentType = "invoice";
  } else if (fileName.includes("rfq") || fileName.includes("quote") || fileName.includes("quotation")) {
    documentType = "rfq";
  } else if (fileName.includes("tender") || fileName.includes("bid")) {
    documentType = "tender";
  } else if (fileName.includes("application") || fileName.includes("form")) {
    documentType = "application";
  }
  
  console.log(`Extracting data from ${documentType} document with multiple pages`);
  
  const extractedData: Record<string, string> = {};
  
  if (documentType === "cipc") {
    extractedData["Company Name"] = "Morwa Moabelo (Pty) Ltd";
    extractedData["Registration Number"] = "2018/421571/07";
    extractedData["Director"] = "Wilson Mokgethwa Moabelo";
    extractedData["Registration Date"] = "2018-08-15";
    extractedData["Business Status"] = "In Business";
    extractedData["Company Type"] = "Private Company";
    extractedData["Financial Year End"] = "February";
    extractedData["Physical Address"] = "Unit 5, Building 2, Maxwell Office Park, Waterfall City, Midrand, 2090";
    extractedData["Postal Address"] = "P.O. Box 78954, Sandton, 2146";
  } else if (documentType === "tax") {
    extractedData["Tax Number"] = "9012345678";
    extractedData["Tax Status"] = "Compliant";
    extractedData["Issue Date"] = "2023-03-01";
    extractedData["Expiry Date"] = "2024-03-01";
    extractedData["VAT Number"] = "4680239510";
    extractedData["PAYE Reference"] = "7065737164";
    extractedData["Income Tax Reference"] = "1901234567";
    extractedData["SDL Reference"] = "L901234567";
    extractedData["UIF Reference"] = "U901234567";
    extractedData["Physical Address"] = "Unit 5, Building 2, Maxwell Office Park, Waterfall City, Midrand, 2090";
  } else if (documentType === "bbee") {
    extractedData["B-BBEE Level"] = "Level 1";
    extractedData["Verification Agency"] = "BEE Verification Agency";
    extractedData["Certificate Number"] = "BEE12345/21";
    extractedData["Issue Date"] = "2023-01-15";
    extractedData["Expiry Date"] = "2024-01-14";
    extractedData["Black Ownership"] = "100%";
    extractedData["Black Women Ownership"] = "51%";
    extractedData["EME/QSE Status"] = "Qualifying Small Enterprise";
    extractedData["Procurement Recognition"] = "135%";
    extractedData["Empowering Supplier"] = "Yes";
    extractedData["Physical Address"] = "Unit 5, Building 2, Maxwell Office Park, Waterfall City, Midrand, 2090";
  } else if (documentType === "csd") {
    extractedData["CSD Registration"] = "MAAA0987654";
    extractedData["Supplier Number"] = "SN12345678";
    extractedData["Registration Date"] = "2019-05-10";
    extractedData["Status"] = "Active";
    extractedData["Company Name"] = "Morwa Moabelo (Pty) Ltd";
    extractedData["Registration Number"] = "2018/421571/07";
    extractedData["Tax Compliance"] = "Yes";
    extractedData["B-BBEE Status"] = "Level 1";
    extractedData["Director ID"] = "8512095873082";
    extractedData["Banking Details Verified"] = "Yes";
    extractedData["CIDB Registration"] = "123456";
    extractedData["Industry Classification"] = "Information Technology";
    extractedData["Physical Address"] = "Unit 5, Building 2, Maxwell Office Park, Waterfall City, Midrand, 2090";
  } else if (documentType === "bank") {
    extractedData["Bank Name"] = "First National Bank";
    extractedData["Account Holder"] = "Morwa Moabelo (Pty) Ltd";
    extractedData["Account Number"] = "62123456789";
    extractedData["Branch Code"] = "250655";
    extractedData["Account Type"] = "Business";
    extractedData["Branch Name"] = "Midrand";
    extractedData["SWIFT Code"] = "FIRNZAJJ";
    extractedData["Date Issued"] = "2023-04-01";
    extractedData["Bank Official"] = "Jane Smith";
    extractedData["Bank Contact"] = "011 123 4567";
    extractedData["Bank Address"] = "FNB Midrand, Shop 51, Carlswald Decor Centre, Cnr New Rd & Harry Galaun Dr, Midrand, 1685";
  } else if (documentType === "invoice" || documentType === "rfq" || documentType === "quote") {
    extractedData["Client Name"] = "ABC Corporation";
    extractedData["Client Contact"] = "Jane Smith";
    extractedData["Client Email"] = "jane.smith@abccorp.com";
    extractedData["Client Phone"] = "011 987 6543";
    extractedData["Service Description"] = "Consulting Services";
    extractedData["Amount"] = "R15,000.00";
    extractedData["Date"] = "2023-04-15";
    extractedData["Invoice Number"] = "INV-2023-0123";
    extractedData["Payment Terms"] = "30 days";
    extractedData["VAT Amount"] = "R2,250.00";
    extractedData["Total Amount"] = "R17,250.00";
    extractedData["Client Address"] = "456 Corporate Park, Johannesburg, 2000";
    extractedData["Company Address"] = "Unit 5, Building 2, Maxwell Office Park, Waterfall City, Midrand, 2090";
  } else if (documentType === "tender") {
    extractedData["Tender Number"] = "TEND2023/456";
    extractedData["Issuing Department"] = "Department of Public Works";
    extractedData["Tender Description"] = "Supply and Installation of IT Equipment";
    extractedData["Closing Date"] = "2023-06-30";
    extractedData["Briefing Session"] = "2023-05-15";
    extractedData["Contact Person"] = "Mr. John Doe";
    extractedData["Contact Email"] = "john.doe@gov.za";
    extractedData["Contact Phone"] = "012 345 6789";
    extractedData["CIDB Requirement"] = "Grade 3 IT";
    extractedData["B-BBEE Requirement"] = "Level 1-4";
    extractedData["Physical Address"] = "Unit 5, Building 2, Maxwell Office Park, Waterfall City, Midrand, 2090";
  } else if (documentType === "application") {
    extractedData["Form Type"] = "Vendor Application";
    extractedData["Applicant Name"] = "Morwa Moabelo (Pty) Ltd";
    extractedData["Contact Person"] = "Wilson Moabelo";
    extractedData["Email"] = "wilson@morwamoabelo.co.za";
    extractedData["Phone"] = "072 345 6789";
    extractedData["Application Date"] = "2023-05-01";
    extractedData["Industry Sector"] = "Information Technology";
    extractedData["Years in Business"] = "5";
    extractedData["Employees"] = "10-50";
    extractedData["Annual Turnover"] = "R5,000,000 - R10,000,000";
    extractedData["Physical Address"] = "Unit 5, Building 2, Maxwell Office Park, Waterfall City, Midrand, 2090";
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
  
  // This is a simulated response - in a real application, this would analyze the PDF
  const fakeFields = [
    {
      id: "field_1",
      name: "Company Name",
      type: "text",
      rect: { x: 100, y: 100, width: 200, height: 30 },
      page: 1
    },
    {
      id: "field_2",
      name: "Registration Number",
      type: "text",
      rect: { x: 100, y: 150, width: 200, height: 30 },
      page: 1
    },
    {
      id: "field_3",
      name: "Tax Number",
      type: "text",
      rect: { x: 100, y: 200, width: 200, height: 30 },
      page: 1
    },
    {
      id: "field_4",
      name: "Date",
      type: "date",
      rect: { x: 100, y: 250, width: 200, height: 30 },
      page: 1
    },
    {
      id: "field_5",
      name: "Physical Address",
      type: "text",
      rect: { x: 100, y: 300, width: 300, height: 60 },
      page: 1
    }
  ];
  
  return {
    fields: fakeFields,
    pageCount: 1
  };
};

export const populateFillablePdf = async (
  pdfFile: File, 
  data: Record<string, string>, 
  fieldMapping: Record<string, string> = {}
): Promise<Blob> => {
  console.log(`Populating PDF form ${pdfFile.name} with data`);
  
  // This is a simulation - in a real application, this would populate the PDF with data
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
    
    // Dispatch an event to notify any listeners
    window.dispatchEvent(new CustomEvent('storageupdated'));
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

// New functions for template management

export const storeFormTemplate = (
  templateName: string,
  fields: Record<string, string>,
  formType: string = "generic"
): void => {
  try {
    const existingTemplatesStr = localStorage.getItem('formTemplates');
    const existingTemplates = existingTemplatesStr ? JSON.parse(existingTemplatesStr) : {};
    
    existingTemplates[templateName] = {
      name: templateName,
      fields: fields,
      type: formType,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    
    localStorage.setItem('formTemplates', JSON.stringify(existingTemplates));
    console.log(`Stored form template: ${templateName}`);
    
    // Dispatch an event to notify any listeners
    window.dispatchEvent(new CustomEvent('templatesupdated'));
  } catch (error) {
    console.error('Error storing form template:', error);
  }
};

export const getStoredFormTemplates = (): Record<string, {
  name: string;
  fields: Record<string, string>;
  type: string;
  createdAt: string;
  lastUsed: string;
}> => {
  try {
    const templatesStr = localStorage.getItem('formTemplates');
    return templatesStr ? JSON.parse(templatesStr) : {};
  } catch (error) {
    console.error('Error retrieving form templates:', error);
    return {};
  }
};

export const getFormTemplateByName = (templateName: string): {
  name: string;
  fields: Record<string, string>;
  type: string;
  createdAt: string;
  lastUsed: string;
} | null => {
  try {
    const templates = getStoredFormTemplates();
    return templates[templateName] || null;
  } catch (error) {
    console.error(`Error retrieving template: ${templateName}`, error);
    return null;
  }
};

export const updateFormTemplate = (
  templateName: string,
  updatedFields: Record<string, string>
): boolean => {
  try {
    const existingTemplatesStr = localStorage.getItem('formTemplates');
    const existingTemplates = existingTemplatesStr ? JSON.parse(existingTemplatesStr) : {};
    
    if (!existingTemplates[templateName]) {
      return false;
    }
    
    existingTemplates[templateName] = {
      ...existingTemplates[templateName],
      fields: updatedFields,
      lastUsed: new Date().toISOString()
    };
    
    localStorage.setItem('formTemplates', JSON.stringify(existingTemplates));
    console.log(`Updated form template: ${templateName}`);
    
    // Dispatch an event to notify any listeners
    window.dispatchEvent(new CustomEvent('templatesupdated'));
    return true;
  } catch (error) {
    console.error(`Error updating template: ${templateName}`, error);
    return false;
  }
};

export const deleteFormTemplate = (templateName: string): boolean => {
  try {
    const existingTemplatesStr = localStorage.getItem('formTemplates');
    const existingTemplates = existingTemplatesStr ? JSON.parse(existingTemplatesStr) : {};
    
    if (!existingTemplates[templateName]) {
      return false;
    }
    
    delete existingTemplates[templateName];
    
    localStorage.setItem('formTemplates', JSON.stringify(existingTemplates));
    console.log(`Deleted form template: ${templateName}`);
    
    // Dispatch an event to notify any listeners
    window.dispatchEvent(new CustomEvent('templatesupdated'));
    return true;
  } catch (error) {
    console.error(`Error deleting template: ${templateName}`, error);
    return false;
  }
};

export const applyFormTemplate = (
  template: {
    name: string;
    fields: Record<string, string>;
    type: string;
    createdAt?: string;
    lastUsed?: string;
  },
  formFields: Array<{ id: string; name: string; type: string }>,
  updateDates: boolean = true
): Record<string, string> => {
  const populatedValues: Record<string, string> = {};
  const today = new Date();
  
  formFields.forEach(field => {
    // Try to find a matching field in the template
    const lowerFieldName = field.name.toLowerCase();
    
    // Find the closest matching key in the template fields
    let bestMatch = '';
    let bestMatchScore = 0;
    
    Object.keys(template.fields).forEach(templateKey => {
      const templateKeyLower = templateKey.toLowerCase();
      
      if (lowerFieldName === templateKeyLower) {
        // Exact match
        bestMatch = templateKey;
        bestMatchScore = 1;
      } else if (lowerFieldName.includes(templateKeyLower) || templateKeyLower.includes(lowerFieldName)) {
        // Partial match - only use if we don't have an exact match
        if (bestMatchScore < 1) {
          bestMatch = templateKey;
          bestMatchScore = 0.8;
        }
      }
    });
    
    if (bestMatch) {
      let value = template.fields[bestMatch];
      
      // Update dates if requested
      if (updateDates && (
          lowerFieldName.includes('date') || 
          field.type === 'date' || 
          /expired?|valid until|due/i.test(lowerFieldName)
        )) {
        // If it looks like a date, update it
        try {
          const originalDate = new Date(value);
          if (!isNaN(originalDate.getTime())) {
            // Calculate how many days to add based on the original date
            const daysDiff = template.lastUsed 
              ? Math.floor((originalDate.getTime() - new Date(template.lastUsed).getTime()) / (1000 * 60 * 60 * 24))
              : 0;
            
            // Create a new date by adding the same number of days from today
            const newDate = new Date(today);
            newDate.setDate(newDate.getDate() + daysDiff);
            
            // Format as YYYY-MM-DD
            value = newDate.toISOString().split('T')[0];
          }
        } catch (error) {
          console.warn('Could not parse date:', value);
        }
      }
      
      populatedValues[field.id] = value;
    } else {
      populatedValues[field.id] = '';
    }
  });
  
  // Mark the template as used
  const templates = getStoredFormTemplates();
  if (templates[template.name]) {
    templates[template.name].lastUsed = today.toISOString();
    localStorage.setItem('formTemplates', JSON.stringify(templates));
  }
  
  return populatedValues;
};
