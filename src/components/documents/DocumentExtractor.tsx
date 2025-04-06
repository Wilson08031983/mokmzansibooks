
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { extractTextFromDocuments, storeExtractedData } from '@/utils/pdfUtils';
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface DocumentExtractorProps {
  className?: string;
  onExtracted?: (data: { type: string; data: Record<string, string> }) => void;
}

export const DocumentExtractor: React.FC<DocumentExtractorProps> = ({ 
  className,
  onExtracted 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [extractedType, setExtractedType] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setFile(file);
    setStatus('processing');
    setIsLoading(true);
    
    try {
      // Extract text from the document using OCR + AI
      const result = await extractTextFromDocuments([file]);
      
      if (result.type === 'unknown') {
        toast.warning("Couldn't determine document type. Please try a different file or rename it to include the document type (e.g., 'tax_return.pdf').");
        setStatus('error');
        return;
      }
      
      // Store the extracted data
      storeExtractedData(result.type, result.data);
      setExtractedType(result.type);
      setStatus('success');
      
      // Create and dispatch a custom event for components to update
      const storageEvent = new Event('storageupdated');
      window.dispatchEvent(storageEvent);
      
      // Also trigger standard storage event for compatibility
      window.dispatchEvent(new Event('storage'));
      
      // Call the callback if provided
      if (onExtracted) {
        onExtracted(result);
      }
      
      toast.success(`Successfully extracted data from ${result.type.toUpperCase()} document`);
    } catch (error) {
      console.error('Error extracting text:', error);
      toast.error('Error extracting text from document');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setExtractedType(null);
    setStatus('idle');
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Processing document...';
      case 'success':
        return `Data extracted from ${extractedType?.toUpperCase()} document`;
      case 'error':
        return 'Error extracting data';
      default:
        return 'Upload a document to extract data';
    }
  };
  
  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="h-8 w-8 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-400" />;
    }
  };
  
  return (
    <Card className={`p-5 ${className}`}>
      <div className="text-center space-y-2 mb-4">
        <h3 className="text-lg font-semibold">Extract Data from Documents</h3>
        <p className="text-sm text-gray-500">
          Upload documents to extract business data using AI
        </p>
      </div>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center space-y-4 cursor-pointer hover:bg-gray-50 transition-colors ${
          status === 'success' ? 'bg-green-50 border-green-200' : 
          status === 'error' ? 'bg-red-50 border-red-200' : ''
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex justify-center">
          {getStatusIcon()}
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium">{getStatusMessage()}</p>
          
          {file && (
            <Badge variant="outline" className="text-xs">
              {file.name} ({Math.round(file.size / 1024)} KB)
            </Badge>
          )}
          
          {status === 'idle' && (
            <p className="text-xs text-gray-500">
              PDF, Images, Word, Excel (MAX. 10MB)
            </p>
          )}
          
          {status === 'success' && extractedType && (
            <p className="text-xs text-green-600">
              This data will be available for auto-filling forms
            </p>
          )}
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx"
          className="hidden"
          onChange={handleFileUpload}
          disabled={isLoading}
        />
      </div>
      
      <div className="flex gap-2 mt-4">
        {status === 'success' || status === 'error' ? (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleReset}
            disabled={isLoading}
          >
            Upload Another Document
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Select Document to Extract Data
          </Button>
        )}
      </div>
    </Card>
  );
};

export default DocumentExtractor;
