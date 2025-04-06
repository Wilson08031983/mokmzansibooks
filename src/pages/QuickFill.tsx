
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileText } from "lucide-react";
import { downloadDocumentAsPdf } from "@/utils/pdfUtils";

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
}

interface ExtractedData {
  id: string;
  fileId: string;
  fields: Record<string, string>;
  extractedDate: string;
}

const QuickFill = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [extractedData, setExtractedData] = useState<ExtractedData[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsExtracting(true);
    
    // Process each file
    Array.from(files).forEach((file) => {
      // Create a file ID
      const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Create file metadata
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        type: file.type.split('/').pop()?.toUpperCase() || 'UNKNOWN',
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
      };
      
      // Simulate extraction of data from file (in a real app, this would involve OCR or similar)
      setTimeout(() => {
        // Simulate extracted data based on filename
        const extractedFields: Record<string, string> = {};
        
        if (file.name.toLowerCase().includes('invoice')) {
          extractedFields.documentType = 'Invoice';
          extractedFields.amount = `R${Math.floor(Math.random() * 10000)}.00`;
          extractedFields.date = new Date().toISOString().split('T')[0];
          extractedFields.invoiceNumber = `INV-${Math.floor(Math.random() * 10000)}`;
        } else if (file.name.toLowerCase().includes('receipt')) {
          extractedFields.documentType = 'Receipt';
          extractedFields.amount = `R${Math.floor(Math.random() * 1000)}.00`;
          extractedFields.date = new Date().toISOString().split('T')[0];
          extractedFields.receiptNumber = `REC-${Math.floor(Math.random() * 10000)}`;
        } else {
          extractedFields.documentType = 'Document';
          extractedFields.date = new Date().toISOString().split('T')[0];
        }
        
        // Create extracted data record
        const newExtractedData: ExtractedData = {
          id: `data-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fileId: fileId,
          fields: extractedFields,
          extractedDate: new Date().toISOString()
        };
        
        // Update state
        setUploadedFiles(prev => [...prev, newFile]);
        setExtractedData(prev => [...prev, newExtractedData]);
        setIsExtracting(false);
        
        // Show success notification
        toast({
          title: "File Processed",
          description: `Successfully extracted data from ${file.name}`,
        });
        
        // Switch to documents tab
        setActiveTab("documents");
      }, 2000); // Simulate processing time
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadFile = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;
    
    toast({
      title: "Generating Document",
      description: `Preparing ${file.name} for download...`,
    });
    
    // Create temporary element with file data
    const tempContainer = document.createElement('div');
    tempContainer.className = 'p-8 bg-white';
    
    // Get extracted data for this file
    const data = extractedData.find(d => d.fileId === fileId)?.fields || {};
    
    // Generate content based on document type
    if (data.documentType === 'Invoice') {
      tempContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 24px; margin-bottom: 5px;">INVOICE</h1>
            <p>Invoice #: ${data.invoiceNumber || 'N/A'}</p>
            <p>Date: ${data.date || new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
            <div>
              <h3>From:</h3>
              <p>Your Company Name</p>
              <p>123 Business Street</p>
              <p>Business District</p>
              <p>info@yourcompany.com</p>
            </div>
            <div>
              <h3>To:</h3>
              <p>Client Name</p>
              <p>456 Client Avenue</p>
              <p>Client City</p>
              <p>client@email.com</p>
            </div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Description</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount</th>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">Professional Services</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${data.amount || 'R0.00'}</td>
            </tr>
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>Total</strong></td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;"><strong>${data.amount || 'R0.00'}</strong></td>
            </tr>
          </table>
          
          <div style="margin-top: 50px;">
            <p style="text-align: center;">Thank you for your business!</p>
          </div>
        </div>
      `;
    } else if (data.documentType === 'Receipt') {
      tempContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 20px; margin-bottom: 5px;">RECEIPT</h1>
            <p>Receipt #: ${data.receiptNumber || 'N/A'}</p>
            <p>Date: ${data.date || new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <p><strong>Amount:</strong> ${data.amount || 'R0.00'}</p>
            <p><strong>Payment Method:</strong> Card</p>
          </div>
          
          <div style="margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 10px;">
            <p style="text-align: center;">Thank you for your payment!</p>
          </div>
        </div>
      `;
    } else {
      tempContainer.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="text-align: center; margin-bottom: 20px;">${file.name}</h1>
          <p>Document Type: ${data.documentType || 'General Document'}</p>
          <p>Date: ${data.date || new Date().toLocaleDateString()}</p>
          <div style="margin-top: 40px;">
            <p>This is a system-generated document.</p>
          </div>
        </div>
      `;
    }
    
    document.body.appendChild(tempContainer);
    
    try {
      downloadDocumentAsPdf(
        tempContainer,
        `${file.name.toLowerCase().replace(/\s+/g, '-')}.pdf`
      ).then(success => {
        if (success) {
          toast({
            title: "Download Complete",
            description: `${file.name} has been downloaded successfully.`,
          });
        } else {
          throw new Error("Failed to generate PDF");
        }
      });
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

  const handleDownloadAll = async () => {
    if (!tableRef.current || uploadedFiles.length === 0) return;
    
    toast({
      title: "Generating Report",
      description: "Preparing document index for download...",
    });
    
    try {
      const success = await downloadDocumentAsPdf(
        tableRef.current,
        "document-index.pdf"
      );
      
      if (success) {
        toast({
          title: "Download Complete",
          description: "Document index has been downloaded successfully.",
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

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">QuickFill</h1>
          <p className="text-gray-500">Upload, extract, and download document data</p>
        </div>
      </div>

      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="documents">View & Download</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Drop files here or click to upload</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Support for PDF, JPEG, PNG files
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isExtracting}
                >
                  {isExtracting ? "Processing..." : "Select Files"}
                </Button>
              </div>
              
              {isExtracting && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-center text-blue-600">
                    Extracting data from your documents... Please wait.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Your Documents</CardTitle>
              {uploadedFiles.length > 0 && (
                <Button variant="outline" onClick={handleDownloadAll} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export All
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div ref={tableRef}>
                <div className="rounded-md border">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Size</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Upload Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {uploadedFiles.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-gray-500">
                            No documents uploaded yet.
                          </td>
                        </tr>
                      ) : (
                        uploadedFiles.map((file) => {
                          const fileData = extractedData.find(d => d.fileId === file.id);
                          const documentType = fileData?.fields.documentType || 'Document';
                          
                          return (
                            <tr key={file.id} className="border-b transition-colors hover:bg-muted/50">
                              <td className="p-4 align-middle font-medium">{file.name}</td>
                              <td className="p-4 align-middle">
                                <Badge variant="outline">
                                  {documentType}
                                </Badge>
                              </td>
                              <td className="p-4 align-middle">{file.size}</td>
                              <td className="p-4 align-middle">{new Date(file.uploadDate).toLocaleDateString()}</td>
                              <td className="p-4 align-middle">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-1"
                                  onClick={() => handleDownloadFile(file.id)}
                                >
                                  <FileText className="h-4 w-4" />
                                  Download
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {extractedData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Extracted Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {extractedData.map((data) => {
                    const file = uploadedFiles.find(f => f.id === data.fileId);
                    if (!file) return null;
                    
                    return (
                      <Card key={data.id} className="border border-gray-200">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">{file.name}</CardTitle>
                          <p className="text-xs text-gray-500">
                            Extracted on {new Date(data.extractedDate).toLocaleDateString()}
                          </p>
                        </CardHeader>
                        <CardContent>
                          <dl className="space-y-2">
                            {Object.entries(data.fields).map(([key, value]) => (
                              <div key={key} className="grid grid-cols-2 gap-1">
                                <dt className="text-sm font-medium text-gray-500">{key}:</dt>
                                <dd className="text-sm">{value}</dd>
                              </div>
                            ))}
                          </dl>
                          <div className="mt-4 flex justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadFile(file.id)}
                            >
                              Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuickFill;
