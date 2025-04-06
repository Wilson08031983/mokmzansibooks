import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { FileText, Download, Calendar, Bell, Upload, FileSearch, FilePlus2, Save, Eye, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { downloadDocumentAsPdf } from "@/utils/pdfUtils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ExtractedFormData {
  id: string;
  documentId: string;
  fields: Record<string, string>;
  extractedDate: string;
}

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  requiredDocuments: string[];
  fields: string[];
}

const TaxDocuments = () => {
  const { toast } = useToast();
  const { taxDocuments, addTaxDocument } = useFinancialData();
  const { addNotification } = useNotifications();
  const documentsTableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFormFile, setSelectedFormFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedFormData[]>([]);
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [autoFillInProgress, setAutoFillInProgress] = useState(false);
  const [autoFillProgress, setAutoFillProgress] = useState(0);
  const [matchedDocuments, setMatchedDocuments] = useState<string[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<{
    title: string;
    fields: Record<string, string>;
    missingFields: string[];
  } | null>(null);
  const [manualInputs, setManualInputs] = useState<Record<string, string>>({});
  const [learnedInputs, setLearnedInputs] = useState<Record<string, string>>({});

  const formTemplates = [
    {
      id: "tender-001",
      name: "Government Tender Application",
      description: "Standard template for government tender submissions",
      requiredDocuments: ["Company Registration", "Tax Clearance", "BEE Certificate", "VAT Registration"],
      fields: ["companyName", "registrationNumber", "taxNumber", "vatNumber", "beeLevel"]
    },
    {
      id: "grant-001",
      name: "Business Grant Application",
      description: "Application for business development grants",
      requiredDocuments: ["Company Registration", "Tax Clearance", "Financial Statements"],
      fields: ["companyName", "registrationNumber", "taxNumber", "annualTurnover"]
    }
  ];

  useEffect(() => {
    const today = new Date();
    
    taxDocuments.forEach(doc => {
      const uploadDate = new Date(doc.uploadDate);
      const expiryDate = new Date(uploadDate);
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysToExpiry <= 30 && daysToExpiry > 0) {
        toast({
          title: "Document Expiring Soon",
          description: `"${doc.name}" will expire in ${daysToExpiry} day${daysToExpiry === 1 ? '' : 's'}.`,
          variant: "warning",
        });
      }
    });
  }, [taxDocuments, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadSuccess(false);
      setDownloadSuccess(false);
    }
  };

  const handleFormFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFormFile(e.target.files[0]);
      setMatchedDocuments([]);
      setAutoFillProgress(0);
    }
  };

  const extractFormData = async (file: File, docId: string) => {
    setIsExtracting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fakeFields: Record<string, string> = {};
      
      if (file.name.toLowerCase().includes('tax')) {
        fakeFields['taxYear'] = '2023';
        fakeFields['taxReferenceNumber'] = 'TAX' + Math.floor(Math.random() * 10000000);
        fakeFields['taxableIncome'] = 'R' + (Math.floor(Math.random() * 1000000) + 100000).toLocaleString();
      } else if (file.name.toLowerCase().includes('invoice')) {
        fakeFields['invoiceNumber'] = 'INV-' + Math.floor(Math.random() * 10000);
        fakeFields['invoiceDate'] = new Date().toISOString().split('T')[0];
        fakeFields['amount'] = 'R' + (Math.floor(Math.random() * 10000) + 1000).toLocaleString();
      } else if (file.name.toLowerCase().includes('registration') || file.name.toLowerCase().includes('company')) {
        fakeFields['companyName'] = 'ABC Company (Pty) Ltd';
        fakeFields['registrationNumber'] = '2020/' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0') + '/07';
        fakeFields['registrationDate'] = new Date(2020, 0, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
        fakeFields['companyType'] = 'Private Company';
      } else if (file.name.toLowerCase().includes('bee') || file.name.toLowerCase().includes('bbbee')) {
        fakeFields['beeLevel'] = Math.floor(Math.random() * 3 + 1).toString();
        fakeFields['beeScore'] = (Math.floor(Math.random() * 40) + 60).toString();
        fakeFields['beeExpiryDate'] = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
      } else if (file.name.toLowerCase().includes('vat')) {
        fakeFields['vatNumber'] = '4' + Math.floor(Math.random() * 1000000000).toString().padStart(10, '0');
        fakeFields['vatRegistrationDate'] = new Date(2020, 0, Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0];
      } else {
        fakeFields['documentType'] = file.name.split('.').slice(0, -1).join('.');
        fakeFields['submissionDate'] = new Date().toISOString().split('T')[0];
      }
      
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + Math.floor(Math.random() * 12) + 1);
      fakeFields['expiryDate'] = expiryDate.toISOString().split('T')[0];
      
      const newExtractedData: ExtractedFormData = {
        id: `extract-${Date.now()}`,
        documentId: docId,
        fields: fakeFields,
        extractedDate: new Date().toISOString(),
      };
      
      setExtractedData(prev => [...prev, newExtractedData]);
      
      toast({
        title: "Form Data Extracted",
        description: "Document information has been successfully extracted and saved.",
        variant: "upload",
      });
      
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
      
      return newExtractedData;
    } catch (error) {
      console.error("Error extracting form data:", error);
      toast({
        title: "Extraction Failed",
        description: "There was a problem extracting data from your document.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsExtracting(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    const fileType = selectedFile.name.split('.').pop()?.toUpperCase() || 'UNKNOWN';
    const fileSize = `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;
    
    let category = "General";
    if (selectedFile.name.toLowerCase().includes('tax')) {
      category = "Returns";
    } else if (selectedFile.name.toLowerCase().includes('certificate') || 
               selectedFile.name.toLowerCase().includes('registration') ||
               selectedFile.name.toLowerCase().includes('vat') ||
               selectedFile.name.toLowerCase().includes('bee')) {
      category = "Certificates";
    } else if (selectedFile.name.toLowerCase().includes('letter') || 
               selectedFile.name.toLowerCase().includes('notice')) {
      category = "Correspondence";
    }
    
    const newDocument = {
      id: `doc-${Date.now()}`,
      name: selectedFile.name.split('.').slice(0, -1).join('.'),
      type: fileType,
      size: fileSize,
      uploadDate: new Date().toISOString().split('T')[0],
      category: category,
    };
    
    addTaxDocument(newDocument);
    
    await extractFormData(selectedFile, newDocument.id);
    
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: "Document Uploaded",
      description: "Your document has been uploaded and saved successfully.",
      variant: "upload",
    });
    
    setUploadSuccess(true);
    setActiveTab("documents");
  };

  const processFormUpload = async () => {
    if (!selectedFormFile) {
      toast({
        title: "No Form Selected",
        description: "Please select a form or tender document to upload.",
        variant: "destructive",
      });
      return;
    }

    setAutoFillInProgress(true);
    setAutoFillProgress(0);
    setMatchedDocuments([]);

    const formType = selectedFormFile.name.toLowerCase().includes('tender') 
      ? formTemplates[0] 
      : formTemplates[1];
    
    toast({
      title: "Form Detected",
      description: `Processing ${formType.name}`,
      variant: "info",
    });

    const totalSteps = formType.requiredDocuments.length + 2;
    let currentStep = 0;

    await new Promise(resolve => setTimeout(resolve, 800));
    currentStep++;
    setAutoFillProgress(Math.floor((currentStep / totalSteps) * 100));
    
    const matches: string[] = [];
    
    for (const requiredDoc of formType.requiredDocuments) {
      await new Promise(resolve => setTimeout(resolve, 600));
      currentStep++;
      setAutoFillProgress(Math.floor((currentStep / totalSteps) * 100));
      
      const matchingDoc = taxDocuments.find(doc => {
        return doc.name.toLowerCase().includes(requiredDoc.toLowerCase());
      });
      
      if (matchingDoc) {
        matches.push(matchingDoc.name);
        toast({
          title: "Document Match Found",
          description: `Found matching document: ${matchingDoc.name}`,
          variant: "success",
        });
      } else {
        toast({
          title: "Missing Document",
          description: `Could not find required document: ${requiredDoc}`,
          variant: "warning",
        });
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    currentStep++;
    setAutoFillProgress(100);
    setMatchedDocuments(matches);
    
    if (matches.length > 0) {
      toast({
        title: "Auto-Fill Ready",
        description: `${matches.length} document(s) can be used to auto-fill the form`,
        variant: "success",
      });
      
      setActiveTab("documents");
      
      addNotification({
        title: "Form Ready for Submission",
        message: `${formType.name} has been processed and is ready for completion`,
        type: 'info',
        link: '/tax/documents'
      });
    } else {
      toast({
        title: "No Matching Documents",
        description: "Could not find any matching documents for this form",
        variant: "destructive",
      });
    }
    
    setSelectedFormFile(null);
    if (formFileInputRef.current) {
      formFileInputRef.current.value = '';
    }
    
    setAutoFillInProgress(false);
  };

  const handleDownload = async (id: string) => {
    const taxDoc = taxDocuments.find(doc => doc.id === id);
    if (!taxDoc) return;
    
    toast({
      title: "Generating Document",
      description: `Preparing ${taxDoc.name} for download...`,
      variant: "info",
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
          variant: "download",
        });
        setDownloadSuccess(true);
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

  const handleDownloadAllDocuments = async () => {
    if (!documentsTableRef.current) return;
    
    toast({
      title: "Generating Report",
      description: "Preparing document index for download...",
      variant: "info",
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
          variant: "download",
        });
        setDownloadSuccess(true);
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

  const getExpiryStatus = (docId: string) => {
    const extractedDoc = extractedData.find(data => data.documentId === docId);
    if (!extractedDoc || !extractedDoc.fields.expiryDate) return null;
    
    const expiryDate = new Date(extractedDoc.fields.expiryDate);
    const today = new Date();
    const daysToExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysToExpiry < 0) {
      return { status: 'expired', daysToExpiry };
    } else if (daysToExpiry <= 30) {
      return { status: 'warning', daysToExpiry };
    } else {
      return { status: 'valid', daysToExpiry };
    }
  };

  const useAutoFill = (dataId: string) => {
    const extractedItem = extractedData.find(item => item.id === dataId);
    if (!extractedItem) return;
    
    const formTemplate = matchedDocuments.length > 0 ? 
      formTemplates.find(t => t.requiredDocuments.some(doc => 
        matchedDocuments.some(match => match.toLowerCase().includes(doc.toLowerCase()))
      )) : 
      formTemplates[0];
    
    if (!formTemplate) return;
    
    const filledFields: Record<string, string> = {};
    const missingFields: string[] = [];
    
    formTemplate.fields.forEach(field => {
      if (extractedItem.fields[field]) {
        filledFields[field] = extractedItem.fields[field];
      } 
      else if (learnedInputs[field]) {
        filledFields[field] = learnedInputs[field];
      }
      else {
        missingFields.push(field);
        filledFields[field] = '';
      }
    });
    
    setPreviewData({
      title: `${formTemplate.name} Preview`,
      fields: filledFields,
      missingFields: missingFields
    });
    
    setManualInputs(filledFields);
    
    setIsPreviewOpen(true);
    
    toast({
      title: "Auto-Fill Applied",
      description: "Preview the form and fill in any missing information.",
      variant: "success",
    });
  };

  const handleFieldChange = (field: string, value: string) => {
    setManualInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveManualInputs = () => {
    if (previewData) {
      previewData.missingFields.forEach(field => {
        if (manualInputs[field] && manualInputs[field].trim() !== '') {
          setLearnedInputs(prev => ({
            ...prev,
            [field]: manualInputs[field]
          }));
        }
      });
    }
    
    toast({
      title: "Form Saved",
      description: "Manual inputs have been saved and will be used for future forms.",
      variant: "success",
    });
    
    if (previewData) {
      generateFilledPdf();
    }
    
    setIsPreviewOpen(false);
  };

  const generateFilledPdf = () => {
    if (!previewData) return;
    
    const tempContainer = document.createElement('div');
    tempContainer.className = 'p-8 bg-white';
    
    let formHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="font-size: 24px; margin-bottom: 10px;">${previewData.title}</h1>
          <p style="font-size: 16px;">Auto-filled form with manually completed fields</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Field</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Value</th>
              <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Source</th>
            </tr>
    `;
    
    Object.entries(manualInputs).forEach(([field, value]) => {
      const isManuallyFilled = previewData.missingFields.includes(field) && value.trim() !== '';
      const source = isManuallyFilled ? 'Manually Filled' : 'Auto-filled';
      const bgColor = isManuallyFilled ? '#f0fff4' : '#ffffff';
      
      formHtml += `
        <tr style="background-color: ${bgColor};">
          <td style="border: 1px solid #ddd; padding: 12px; font-weight: bold;">${field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${value || '(Not provided)'}</td>
          <td style="border: 1px solid #ddd; padding: 12px;">${source}</td>
        </tr>
      `;
    });
    
    formHtml += `
          </table>
        </div>
        
        <div style="margin-top: 40px;">
          <p style="text-align: center; margin-bottom: 20px;">This document was auto-generated with data from your saved documents.</p>
          <div style="display: flex; justify-content: space-between; margin-top: 60px;">
            <div>
              <p style="border-top: 1px solid #000; padding-top: 10px; width: 200px;">Signature</p>
            </div>
            <div>
              <p style="border-top: 1px solid #000; padding-top: 10px; width: 200px;">Date: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    tempContainer.innerHTML = formHtml;
    document.body.appendChild(tempContainer);
    
    try {
      downloadDocumentAsPdf(
        tempContainer,
        `auto-filled-form-${Date.now()}.pdf`
      );
      
      toast({
        title: "Form Generated",
        description: "Your completed form has been downloaded as a PDF.",
        variant: "download",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was a problem generating your form PDF.",
        variant: "destructive",
      });
    } finally {
      document.body.removeChild(tempContainer);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tax Documents</h1>
          <p className="text-gray-500">Store and manage your tax-related documents</p>
        </div>
        <Button 
          variant="download" 
          onClick={handleDownloadAllDocuments} 
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Document Index
        </Button>
      </div>

      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Step 1: Upload Documents</TabsTrigger>
          <TabsTrigger value="form-upload">Step 2: Upload Form/Tender</TabsTrigger>
          <TabsTrigger value="documents">Step 3: Auto-Fill Forms</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange} 
                  />
                </div>
                <Button 
                  variant="upload"
                  onClick={handleUpload} 
                  disabled={!selectedFile || isExtracting}
                  className="flex items-center gap-2"
                >
                  {isExtracting ? (
                    "Extracting..."
                  ) : (
                    <>
                      <Upload className="h-4 w-4" /> Upload & Extract
                    </>
                  )}
                </Button>
              </div>
              {selectedFile && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    <strong>Selected file:</strong> {selectedFile.name} 
                    ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </p>
                </div>
              )}
              
              {uploadSuccess && (
                <Alert variant="upload" className="mt-4">
                  <AlertTitle>Upload Successful</AlertTitle>
                  <AlertDescription>
                    Your document has been uploaded and the data has been extracted.
                    Please proceed to Step 2 to upload a form or tender document.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          
          <div className="text-sm text-gray-500 mt-2">
            <p>Upload your company documents here (registration, tax clearance, BEE certificates, etc.).</p>
            <p>The system will extract information that can be used for auto-filling forms and tenders.</p>
            <p>Supported formats: PDF, JPG, PNG</p>
          </div>
        </TabsContent>

        <TabsContent value="form-upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Form or Tender</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <Input 
                    type="file" 
                    ref={formFileInputRef}
                    onChange={handleFormFileChange} 
                  />
                </div>
                <Button 
                  variant="upload"
                  onClick={processFormUpload} 
                  disabled={!selectedFormFile || autoFillInProgress}
                  className="flex items-center gap-2"
                >
                  {autoFillInProgress ? (
                    "Processing..."
                  ) : (
                    <>
                      <FilePlus2 className="h-4 w-4" /> Process Form
                    </>
                  )}
                </Button>
              </div>
              {selectedFormFile && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    <strong>Selected form:</strong> {selectedFormFile.name} 
                    ({(selectedFormFile.size / 1024).toFixed(2)} KB)
                  </p>
                </div>
              )}
              
              {autoFillInProgress && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing document requirements...</span>
                    <span>{autoFillProgress}%</span>
                  </div>
                  <Progress value={autoFillProgress} className="h-2" />
                </div>
              )}
              
              {matchedDocuments.length > 0 && (
                <Alert variant="success" className="mt-4">
                  <AlertTitle>Document Matching Complete</AlertTitle>
                  <AlertDescription>
                    <p>Found {matchedDocuments.length} matching documents for this form:</p>
                    <ul className="mt-2 list-disc list-inside">
                      {matchedDocuments.map((doc, index) => (
                        <li key={index}>{doc}</li>
                      ))}
                    </ul>
                    <p className="mt-2">Proceed to Step 3 to complete the auto-fill process.</p>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          
          <div className="text-sm text-gray-500 mt-2">
            <p>Upload your form or tender document here. The system will automatically scan for required documents.</p>
            <p>If matching documents are found, they will be used to auto-fill the form in the next step.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Auto-Fill Forms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                The information from your uploaded documents can be used to automatically fill forms. 
                Select a document to view extracted data.
              </p>
              
              {downloadSuccess && (
                <Alert variant="download" className="mb-4">
                  <AlertTitle>Download Successful</AlertTitle>
                  <AlertDescription>
                    Your document has been successfully downloaded. You can use it for your records or submit it to the relevant authorities.
                  </AlertDescription>
                </Alert>
              )}
              
              {matchedDocuments.length > 0 && (
                <Alert variant="upload" className="mb-4">
                  <AlertTitle>Form Ready for Auto-Fill</AlertTitle>
                  <AlertDescription>
                    <p>The system has matched your uploaded form with {matchedDocuments.length} document(s).</p>
                    <p>Click "Preview & Complete Form" on any matched document below to preview, fill missing fields, and complete the form.</p>
                  </AlertDescription>
                </Alert>
              )}
              
              {extractedData.length > 0 ? (
                <div className="space-y-4">
                  {extractedData.map(data => {
                    const document = taxDocuments.find(doc => doc.id === data.documentId);
                    const isMatchedDoc = document && matchedDocuments.includes(document.name);
                    
                    return document ? (
                      <Card key={data.id} className={`border ${isMatchedDoc ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-base">{document.name}</CardTitle>
                              {isMatchedDoc && (
                                <Badge variant="outline" className="border-green-500 text-green-500">
                                  Form Match
                                </Badge>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              {data.fields.expiryDate && (
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                  <span className="text-xs">
                                    Expires: {new Date(data.fields.expiryDate).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {Object.entries(data.fields).map(([key, value], idx) => (
                              <div key={idx} className={key === 'expiryDate' ? 'hidden' : ''}>
                                <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                                <p className="text-gray-600">{value}</p>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button 
                              variant="upload" 
                              size="sm" 
                              onClick={() => useAutoFill(data.id)}
                              className={`flex items-center gap-2 ${isMatchedDoc ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            >
                              <Eye className="h-4 w-4" />
                              Preview & Complete Form
                            </Button>
                            <Button 
                              variant="download" 
                              size="sm"
                              onClick={() => handleDownload(document.id)}
                              className="flex items-center gap-2"
                            >
                              <Download className="h-4 w-4" />
                              Download Document
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : null;
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Extracted Data</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    Upload documents in Step 1 to extract form data for auto-filling.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewData?.title || 'Form Preview'}</DialogTitle>
          </DialogHeader>
          
          {previewData && (
            <div className="space-y-6 py-4">
              <Alert variant="info" className="mb-4">
                <AlertTitle>Auto-Fill Information</AlertTitle>
                <AlertDescription>
                  This form has been auto-filled with information from your documents. 
                  {previewData.missingFields.length > 0 ? (
                    <p className="mt-2">Please fill in the missing fields highlighted below. The system will learn from your inputs for future forms.</p>
                  ) : (
                    <p className="mt-2">All fields have been filled automatically. You can review and edit any information if needed.</p>
                  )}
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                {Object.entries(previewData.fields).map(([field, value]) => {
                  const isMissingField = previewData.missingFields.includes(field);
                  const fieldLabel = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  
                  return (
                    <div key={field} className={`p-3 rounded-md ${isMissingField ? 'bg-yellow-50 border border-yellow-200' : ''}`}>
                      <Label htmlFor={field} className="flex items-center gap-2">
                        {fieldLabel}
                        {isMissingField && (
                          <Badge variant="outline" className="bg-yellow-100 border-yellow-400 text-yellow-700">
                            Required
                          </Badge>
                        )}
                      </Label>
                      <Input
                        id={field}
                        value={manualInputs[field] || ''}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        className={`mt-1 ${isMissingField ? 'border-yellow-300 focus:border-yellow-500' : ''}`}
                        placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            <DialogClose asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={saveManualInputs} variant="default" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save & Generate PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div ref={documentsTableRef}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Upload Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxDocuments.map((taxDoc) => {
                  const expiryStatus = getExpiryStatus(taxDoc.id);
                  const isMatchedDoc = matchedDocuments.includes(taxDoc.name);
                  
                  return (
                    <TableRow key={taxDoc.id} className={isMatchedDoc ? 'bg-green-50' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {taxDoc.name}
                          {isMatchedDoc && (
                            <Badge variant="outline" className="border-green-500 text-green-500">
                              Form Match
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{taxDoc.category}</TableCell>
                      <TableCell>{taxDoc.type}</TableCell>
                      <TableCell>{taxDoc.size}</TableCell>
                      <TableCell>{new Date(taxDoc.uploadDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {expiryStatus ? (
                          <>
                            {expiryStatus.status === 'expired' ? (
                              <Badge variant="destructive" className="flex items-center gap-1">
                                <Bell className="h-3 w-3" /> Expired
                              </Badge>
                            ) : expiryStatus.status === 'warning' ? (
                              <Badge variant="outline" className="border-amber-500 text-amber-500 flex items-center gap-1">
                                <Bell className="h-3 w-3" /> 
                                {expiryStatus.daysToExpiry} days left
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-green-500 text-green-500">
                                Valid
                              </Badge>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="download"
                          size="sm"
                          className="flex items-center"
                          onClick={() => handleDownload(taxDoc.id)}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxDocuments;
