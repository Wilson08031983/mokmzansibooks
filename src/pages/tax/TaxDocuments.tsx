import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useFinancialData } from "@/contexts/FinancialDataContext";
import { useNotifications } from "@/contexts/NotificationsContext";
import { FileText, Download, Calendar, Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { downloadDocumentAsPdf } from "@/utils/pdfUtils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExtractedFormData {
  id: string;
  documentId: string;
  fields: Record<string, string>;
  extractedDate: string;
}

const TaxDocuments = () => {
  const { toast } = useToast();
  const { taxDocuments, addTaxDocument } = useFinancialData();
  const { addNotification } = useNotifications();
  const documentsTableRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedFormData[]>([]);
  const [activeTab, setActiveTab] = useState("upload");

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
    } else if (selectedFile.name.toLowerCase().includes('certificate')) {
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
    });
    
    setActiveTab("documents");
  };

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tax Documents</h1>
          <p className="text-gray-500">Store and manage your tax-related documents</p>
        </div>
        <Button variant="outline" onClick={handleDownloadAllDocuments} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Document Index
        </Button>
      </div>

      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Step 1: Upload Documents</TabsTrigger>
          <TabsTrigger value="documents">Step 2: Auto-Fill Forms</TabsTrigger>
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
                  onClick={handleUpload} 
                  disabled={!selectedFile || isExtracting}
                >
                  {isExtracting ? "Extracting..." : "Upload & Extract"}
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
            </CardContent>
          </Card>
          
          <div className="text-sm text-gray-500 mt-2">
            <p>Upload your tax forms here. The system will automatically extract information for use in Step 2.</p>
            <p>Supported formats: PDF, JPG, PNG</p>
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
              {extractedData.length > 0 ? (
                <div className="space-y-4">
                  {extractedData.map(data => {
                    const document = taxDocuments.find(doc => doc.id === data.documentId);
                    return document ? (
                      <Card key={data.id} className="border border-gray-200">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base">{document.name}</CardTitle>
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
                          <Button variant="outline" size="sm" className="mt-4">
                            Use for Auto-Fill
                          </Button>
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
                  return (
                    <TableRow key={taxDoc.id}>
                      <TableCell className="font-medium">{taxDoc.name}</TableCell>
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
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                          onClick={() => handleDownload(taxDoc.id)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
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
