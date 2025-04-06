
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileUp, RefreshCw } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ExtractedData {
  id: string;
  documentId: string;
  fields: Record<string, string>;
  extractedDate: string;
}

interface DocumentExtractorProps {
  onExtract: (file: File, extractedData: ExtractedData) => void;
  isExtracting: boolean;
}

const DocumentExtractor: React.FC<DocumentExtractorProps> = ({ onExtract, isExtracting }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExtractionError(null);
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const extractFormData = async (file: File) => {
    try {
      setExtractionError(null);
      
      // Simulate document extraction
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const fakeFields: Record<string, string> = {};
      
      if (file.name.toLowerCase().includes('tax')) {
        fakeFields['taxYear'] = '2023';
        fakeFields['taxReferenceNumber'] = 'TAX' + Math.floor(Math.random() * 10000000);
        fakeFields['taxableIncome'] = 'R' + (Math.floor(Math.random() * 1000000) + 100000).toLocaleString();
        fakeFields['firstName'] = 'John';
        fakeFields['lastName'] = 'Doe';
        fakeFields['idNumber'] = '8101015009087';
      } else if (file.name.toLowerCase().includes('invoice')) {
        fakeFields['invoiceNumber'] = 'INV-' + Math.floor(Math.random() * 10000);
        fakeFields['invoiceDate'] = new Date().toISOString().split('T')[0];
        fakeFields['amount'] = 'R' + (Math.floor(Math.random() * 10000) + 1000).toLocaleString();
        fakeFields['companyName'] = 'ABC Corporation';
      } else if (file.name.toLowerCase().includes('certificate')) {
        fakeFields['organizationName'] = 'XYZ Nonprofit';
        fakeFields['registrationNumber'] = 'NPO-' + Math.floor(Math.random() * 100000);
        fakeFields['taxReferenceNumber'] = '9' + Math.floor(Math.random() * 10000000);
      } else {
        fakeFields['documentType'] = file.name.split('.').slice(0, -1).join('.');
        fakeFields['submissionDate'] = new Date().toISOString().split('T')[0];
      }
      
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + Math.floor(Math.random() * 12) + 1);
      fakeFields['expiryDate'] = expiryDate.toISOString().split('T')[0];
      
      const newExtractedData: ExtractedData = {
        id: `extract-${Date.now()}`,
        documentId: `doc-${Date.now()}`,
        fields: fakeFields,
        extractedDate: new Date().toISOString(),
      };
      
      onExtract(file, newExtractedData);
      
      // Reset form
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      toast({
        title: "Document Processed",
        description: "Your document has been uploaded and data has been extracted successfully.",
      });
      
    } catch (error) {
      console.error("Error extracting form data:", error);
      setExtractionError("There was a problem extracting data from your document. Please try again or upload a different file.");
      toast({
        title: "Extraction Failed",
        description: "There was a problem extracting data from your document.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    
    extractFormData(selectedFile);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange} 
                accept=".pdf,.jpg,.jpeg,.png,.tiff,.doc,.docx"
              />
            </div>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || isExtracting}
              className="flex items-center gap-2"
            >
              {isExtracting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload & Extract
                </>
              )}
            </Button>
          </div>
          
          {selectedFile && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                <strong>Selected file:</strong> {selectedFile.name} 
                ({(selectedFile.size / 1024).toFixed(2)} KB)
              </p>
            </div>
          )}
          
          {extractionError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{extractionError}</AlertDescription>
            </Alert>
          )}
          
          <div className="text-sm text-gray-500 mt-2">
            <p>Upload your tax forms here. The system will automatically extract information for use in Step 2.</p>
            <p>Supported formats: PDF, JPG, PNG, TIFF, DOC, DOCX</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentExtractor;
