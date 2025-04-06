
import React, { useState, useEffect, useRef } from "react";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useToast } from "@/hooks/use-toast";
import { downloadDocumentAsPdf } from "@/utils/pdfUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import the new components
import DocumentExtractor from "@/components/tax/DocumentExtractor";
import DocumentsTable from "@/components/tax/DocumentsTable";
import ExtractedDataCards from "@/components/tax/ExtractedDataCards";
import FormTemplates, { FormTemplate } from "@/components/tax/FormTemplates";
import FormPreview from "@/components/tax/FormPreview";

interface ExtractedFormData {
  id: string;
  documentId: string;
  fields: Record<string, string>;
  extractedDate: string;
}

interface CompletedForm {
  id: string;
  templateId: string;
  name: string;
  fields: {
    id: string;
    label: string;
    value: string;
    type: string;
    required: boolean;
    autoFilled: boolean;
  }[];
  createdAt: string;
  learnedFields: Record<string, string>;
}

const TaxDocuments = () => {
  const { toast } = useToast();
  const { taxDocuments, addTaxDocument } = useFinancialData();
  const { addNotification } = useNotifications();
  const documentsTableRef = useRef<HTMLDivElement>(null);
  
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedFormData[]>([]);
  const [activeTab, setActiveTab] = useState("upload");
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplate | null>(null);
  const [completedForms, setCompletedForms] = useState<CompletedForm[]>([]);
  const [learningDatabase, setLearningDatabase] = useState<Record<string, string>>({});

  // Check for expiring documents when component loads
  useEffect(() => {
    const today = new Date();
    
    taxDocuments.forEach(doc => {
      const extractedDoc = extractedData.find(data => data.documentId === doc.id);
      if (!extractedDoc || !extractedDoc.fields.expiryDate) return;
      
      const expiryDate = new Date(extractedDoc.fields.expiryDate);
      const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysToExpiry <= 30 && daysToExpiry > 0) {
        toast({
          title: "Document Expiring Soon",
          description: `"${doc.name}" will expire in ${daysToExpiry} day${daysToExpiry === 1 ? '' : 's'}.`,
          variant: "warning",
        });
      }
    });
  }, [taxDocuments, extractedData, toast]);

  // Handle document extraction
  const handleExtract = async (file: File, extractedFormData: ExtractedFormData) => {
    setIsExtracting(true);
    
    try {
      // Create a new document entry
      const fileType = file.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
      const fileSize = `${(file.size / (1024 * 1024)).toFixed(2)} MB`;
      
      let category = "General";
      if (file.name.toLowerCase().includes('tax')) {
        category = "Returns";
      } else if (file.name.toLowerCase().includes('certificate')) {
        category = "Certificates";
      } else if (file.name.toLowerCase().includes('letter') || 
                file.name.toLowerCase().includes('notice')) {
        category = "Correspondence";
      }
      
      const newDocument = {
        id: extractedFormData.documentId,
        name: file.name.split('.').slice(0, -1).join('.'),
        type: fileType,
        size: fileSize,
        uploadDate: new Date().toISOString().split('T')[0],
        category: category,
      };
      
      // Add the document and extracted data
      addTaxDocument(newDocument);
      setExtractedData(prev => [...prev, extractedFormData]);
      
      // Set up notifications for expiring documents
      if (extractedFormData.fields.expiryDate) {
        const expiryDate = new Date(extractedFormData.fields.expiryDate);
        const today = new Date();
        const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysToExpiry <= 90) {
          addNotification({
            title: "Document Expiration",
            message: `Document "${file.name}" will expire on ${expiryDate.toLocaleDateString()}`,
            type: daysToExpiry <= 30 ? 'warning' : 'info',
            link: '/tax/documents'
          });
        }
      }
      
      // Update the learning database with the extracted fields
      const newLearning = { ...learningDatabase };
      Object.entries(extractedFormData.fields).forEach(([key, value]) => {
        // Add only meaningful values (skip dates, empty values, etc.)
        if (value && !key.includes('Date') && !key.includes('date')) {
          newLearning[key] = value;
        }
      });
      setLearningDatabase(newLearning);
      
      // Automatically switch to the documents tab
      setActiveTab("forms");
      
    } catch (error) {
      console.error("Error processing document:", error);
      toast({
        title: "Processing Failed",
        description: "There was a problem processing your document.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle document download
  const handleDownload = async (id: string) => {
    const taxDoc = taxDocuments.find(doc => doc.id === id);
    if (!taxDoc) return;
    
    toast({
      title: "Generating Document",
      description: `Preparing ${taxDoc.name} for download...`,
    });
    
    const tempContainer = document.createElement('div');
    tempContainer.className = 'p-8 bg-white';
    
    if (taxDoc.category === "Certificates") {
      tempContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; border: 2px solid #000; padding: 20px; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 40px;">
            <h1 style="font-size: 28px; margin-bottom: 10px;">${taxDoc.name}</h1>
            <p style="font-size: 18px;">Certificate #: ${taxDoc.id.toUpperCase()}</p>
          </div>
          
          <div style="margin-bottom: 40px;">
            <p style="font-size: 16px; margin-bottom: 20px;">This is to certify that:</p>
            <p style="font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 20px;">ABC Company (Pty) Ltd</p>
            <p style="font-size: 16px; margin-bottom: 20px;">Registration Number: 2020/123456/07</p>
            
            <p style="font-size: 16px; margin-bottom: 20px; text-align: center;">Has been registered for ${taxDoc.name.replace(" Certificate", "")} purposes with the South African Revenue Service.</p>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-top: 60px;">
            <div>
              <p style="border-top: 1px solid #000; padding-top: 10px; width: 200px;">Authorized Signature</p>
            </div>
            <div>
              <p style="border-top: 1px solid #000; padding-top: 10px; width: 200px;">Date: ${new Date(taxDoc.uploadDate).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div style="margin-top: 40px; text-align: center;">
            <p>This certificate is valid from ${new Date(taxDoc.uploadDate).toLocaleDateString()} to ${new Date(new Date(taxDoc.uploadDate).setFullYear(new Date(taxDoc.uploadDate).getFullYear() + 1)).toLocaleDateString()}</p>
          </div>
        </div>
      `;
    } else if (taxDoc.category === "Returns") {
      tempContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="text-align: center; font-size: 24px; margin-bottom: 20px;">${taxDoc.name}</h1>
          <p style="text-align: center; margin-bottom: 30px;">Submission ID: ${taxDoc.id.toUpperCase()}</p>
          
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; margin-bottom: 10px;">Company Information</h2>
            <p><strong>Company Name:</strong> ABC Company (Pty) Ltd</p>
            <p><strong>Registration Number:</strong> 2020/123456/07</p>
            <p><strong>Tax Reference Number:</strong> 9876543210</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; margin-bottom: 10px;">Return Details</h2>
            <p><strong>Tax Year:</strong> 2023</p>
            <p><strong>Submission Date:</strong> ${new Date(taxDoc.uploadDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> Submitted</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="font-size: 18px; margin-bottom: 10px;">Tax Calculation Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr style="background-color: #f2f2f2;">
                <th style="border: a1px solid #ddd; padding: 8px; text-align: left;">Description</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount (ZAR)</th>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Total Income</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R5,250,000.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Total Expenses</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R3,750,000.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Taxable Income</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R1,500,000.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Tax Calculated</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R420,000.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">Tax Credits</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">R50,000.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;"><strong>Final Tax Due</strong></td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>R370,000.00</strong></td>
              </tr>
            </table>
          </div>
          
          <div style="margin-top: 50px;">
            <p style="text-align: center;">This is a computer-generated document. No signature required.</p>
          </div>
        </div>
      `;
    } else {
      tempContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <div style="text-align: right; margin-bottom: 40px;">
            <p>South African Revenue Service</p>
            <p>299 Bronkhorst Street</p>
            <p>Nieuw Muckleneuk, Pretoria</p>
            <p>0181</p>
            <p>Date: ${new Date(taxDoc.uploadDate).toLocaleDateString()}</p>
          </div>
          
          <div style="margin-bottom: 40px;">
            <p>ABC Company (Pty) Ltd</p>
            <p>123 Business Street</p>
            <p>Business Park</p>
            <p>Johannesburg, 2000</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>Subject: ${taxDoc.name}</strong></p>
            <p><strong>Reference: ${taxDoc.id.toUpperCase()}</strong></p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p>Dear Taxpayer,</p>
            
            <p style="margin-top: 20px;">This letter serves to confirm that ABC Company (Pty) Ltd (Registration Number: 2020/123456/07) has been granted tax exemption status under Section 10(1)(cN) of the Income Tax Act, 1962 (Act No. 58 of 1962).</p>
            
            <p style="margin-top: 20px;">This exemption is valid from ${new Date(taxDoc.uploadDate).toLocaleDateString()} and will remain in effect unless revoked by the Commissioner for the South African Revenue Service.</p>
            
            <p style="margin-top: 20px;">Please note the following conditions associated with this exemption:</p>
            <ul style="margin-left: 20px;">
              <li style="margin-top: 10px;">The entity must continue to comply with all relevant provisions of the Income Tax Act.</li>
              <li style="margin-top: 10px;">Annual tax returns must still be submitted.</li>
              <li style="margin-top: 10px;">Any changes to the entity's constitution or activities must be reported to SARS.</li>
            </ul>
            
            <p style="margin-top: 20px;">Should you have any queries regarding this matter, please do not hesitate to contact your nearest SARS branch or call the SARS Contact Centre at 0800 00 7277.</p>
          </div>
          
          <div style="margin-top: 50px;">
            <p>Yours sincerely,</p>
            <p style="margin-top: 30px;"><strong>J. Smith</strong></p>
            <p>Senior Manager: Tax Exemption Unit</p>
            <p>South African Revenue Service</p>
          </div>
        </div>
      `;
    }
    
    document.body.appendChild(tempContainer);
    
    try {
      const success = await downloadDocumentAsPdf(
        tempContainer,
        `${taxDoc.name.toLowerCase().replace(/\s+/g, '-')}.pdf`
      );
      
      if (success) {
        toast({
          title: "Download Complete",
          description: `${taxDoc.name} has been downloaded successfully.`,
        });
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was a problem generating your document PDF.",
        variant: "destructive",
      });
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  // Handle bulk download of document index
  const handleDownloadAllDocuments = async () => {
    if (!documentsTableRef.current) return;
    
    toast({
      title: "Generating Report",
      description: "Preparing document index for download...",
    });
    
    try {
      const success = await downloadDocumentAsPdf(
        documentsTableRef.current,
        "tax-documents-index.pdf"
      );
      
      if (success) {
        toast({
          title: "Download Complete",
          description: "Tax documents index has been downloaded successfully.",
        });
      } else {
        throw new Error("Failed to generate PDF");
      }
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "There was a problem generating your documents index PDF.",
        variant: "destructive",
      });
    }
  };

  // Function to use extracted data for form
  const handleUseForForm = (dataId: string) => {
    if (extractedData.find(data => data.id === dataId)) {
      setActiveTab("fill");
      // The FormTemplates component will be shown and user can select a template
      toast({
        title: "Form Filling Ready",
        description: "Select a form template to auto-fill using the extracted data.",
      });
    }
  };

  // Function to select a template for auto-fill
  const handleSelectTemplate = (template: FormTemplate) => {
    setSelectedTemplate(template);
  };

  // Function to save a completed form
  const handleSaveForm = (formData: { id: string; name: string; fields: any[] }) => {
    // Identify fields that were manually filled (not auto-filled)
    const manuallyFilledFields: Record<string, string> = {};
    formData.fields.forEach(field => {
      if (!field.autoFilled && field.value) {
        manuallyFilledFields[field.id] = field.value;
      }
    });
    
    // Add to completed forms
    const newForm: CompletedForm = {
      id: `form-${Date.now()}`,
      templateId: formData.id,
      name: formData.name,
      fields: formData.fields,
      createdAt: new Date().toISOString(),
      learnedFields: manuallyFilledFields
    };
    
    setCompletedForms(prev => [...prev, newForm]);
    
    // Update learning database with manually filled fields
    if (Object.keys(manuallyFilledFields).length > 0) {
      setLearningDatabase(prev => ({
        ...prev,
        ...manuallyFilledFields
      }));
      
      toast({
        title: "Learning Complete",
        description: `Learned ${Object.keys(manuallyFilledFields).length} new field values for future auto-fill.`,
      });
    }
    
    // Reset selected template
    setSelectedTemplate(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tax Documents</h1>
          <p className="text-gray-500">Store, manage, and auto-fill your tax-related documents</p>
        </div>
      </div>

      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Step 1: Upload Documents</TabsTrigger>
          <TabsTrigger value="forms">Step 2: Auto-Fill Forms</TabsTrigger>
          <TabsTrigger value="fill">Step 3: Complete & Learn</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <DocumentExtractor 
            onExtract={handleExtract}
            isExtracting={isExtracting}
          />
        </TabsContent>
        
        <TabsContent value="forms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Document Data</CardTitle>
            </CardHeader>
            <CardContent>
              <ExtractedDataCards 
                extractedData={extractedData}
                documents={taxDocuments}
                onUseForForm={handleUseForForm}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fill" className="space-y-4">
          {selectedTemplate ? (
            <FormPreview 
              formTemplate={selectedTemplate}
              extractedData={extractedData.map(data => data.fields)}
              onSave={handleSaveForm}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Select a Form Template</CardTitle>
              </CardHeader>
              <CardContent>
                <FormTemplates onSelectTemplate={handleSelectTemplate} />
              </CardContent>
            </Card>
          )}
          
          {completedForms.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Completed Forms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedForms.map(form => (
                    <Card key={form.id} className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{form.name}</CardTitle>
                        <p className="text-xs text-gray-500">
                          Completed on {new Date(form.createdAt).toLocaleDateString()}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-2">
                          {form.fields.filter(f => f.value).length} of {form.fields.length} fields completed
                        </p>
                        <div className="flex justify-between">
                          <Badge variant="outline" className="text-xs">
                            {Object.keys(form.learnedFields).length} fields learned
                          </Badge>
                          <Button variant="outline" size="sm">View Form</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <DocumentsTable 
            documents={taxDocuments}
            extractedData={extractedData}
            onDownload={handleDownload}
            onBulkDownload={handleDownloadAllDocuments}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxDocuments;
