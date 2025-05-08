import React, { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, FileImage, PenTool, X, Save } from "lucide-react";
import { FileWithPreview } from "./FileUploader";
import { useToast } from "@/hooks/use-toast";
import {
  saveCompanyLogo,
  saveCompanyStamp,
  saveSignature,
  loadCompanyLogo,
  loadCompanyStamp,
  loadSignature
} from "@/utils/invoiceFormPersistence";

interface UploadSectionProps {
  companyLogo: FileWithPreview | null;
  setCompanyLogo: (file: FileWithPreview | null) => void;
  companyStamp: FileWithPreview | null;
  setCompanyStamp: (file: FileWithPreview | null) => void;
  signature: FileWithPreview | null;
  setSignature: (file: FileWithPreview | null) => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  companyLogo,
  setCompanyLogo,
  companyStamp,
  setCompanyStamp,
  signature,
  setSignature
}) => {
  const { toast } = useToast();
  
  // Load saved files on component mount
  useEffect(() => {
    const loadSavedFiles = async () => {
      // Only load if the current values are null (don't override already set values)
      if (!companyLogo) {
        const savedLogo = loadCompanyLogo();
        if (savedLogo) setCompanyLogo(savedLogo);
      }
      
      if (!companyStamp) {
        const savedStamp = loadCompanyStamp();
        if (savedStamp) setCompanyStamp(savedStamp);
      }
      
      if (!signature) {
        const savedSignature = loadSignature();
        if (savedSignature) setSignature(savedSignature);
      }
    };
    
    loadSavedFiles();
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'stamp' | 'signature') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or SVG file.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        variant: "destructive"
      });
      return;
    }
    
    // Create a preview of the file
    const fileWithPreview = file as FileWithPreview;
    
    // Update the state based on the file type
    switch(type) {
      case 'logo':
        setCompanyLogo(fileWithPreview);
        // Persist to storage
        saveCompanyLogo(fileWithPreview);
        toast({
          title: "Logo uploaded",
          description: "Company logo has been saved for all invoices and quotes"
        });
        break;
      case 'stamp':
        setCompanyStamp(fileWithPreview);
        // Persist to storage
        saveCompanyStamp(fileWithPreview);
        toast({
          title: "Stamp uploaded",
          description: "Company stamp has been saved for all invoices and quotes"
        });
        break;
      case 'signature':
        setSignature(fileWithPreview);
        // Persist to storage
        saveSignature(fileWithPreview);
        toast({
          title: "Signature uploaded",
          description: "Signature has been saved for all invoices and quotes"
        });
        break;
    }
  };

  const getFilePreview = (file: FileWithPreview | null): string | null => {
    if (!file) return null;
    
    // If the file has a preview, use it
    if (file.preview) return file.preview;
    
    // Otherwise, create a new object URL
    return URL.createObjectURL(file);
  };

  const renderPreview = (file: FileWithPreview | null, type: string, removeHandler: () => void) => {
    if (!file) return null;
    
    const preview = getFilePreview(file);
    if (!preview) return null;
    
    return (
      <div className="mt-2 relative border rounded p-2">
        <img src={preview} alt={type} className="h-20 w-auto object-contain mx-auto" />
        <p className="text-sm text-gray-600 mt-1 text-center">{file.name}</p>
        <div className="absolute top-1 right-1 flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removeHandler}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-lg font-medium mb-4">Upload Company Assets</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Company Logo */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            <Label>Company Logo</Label>
          </div>
          
          {companyLogo ? (
            renderPreview(companyLogo, 'Company Logo', () => setCompanyLogo(null))
          ) : (
            <div className="border border-dashed rounded-md p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
              <Button asChild size="sm">
                <label className="cursor-pointer">
                  <Input 
                    type="file" 
                    accept="image/jpeg,image/png,image/svg+xml" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, 'logo')} 
                  />
                  Select Logo
                </label>
              </Button>
            </div>
          )}
        </div>

        {/* Company Stamp */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            <Label>Company Stamp</Label>
          </div>
          
          {companyStamp ? (
            renderPreview(companyStamp, 'Company Stamp', () => setCompanyStamp(null))
          ) : (
            <div className="border border-dashed rounded-md p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
              <Button asChild size="sm">
                <label className="cursor-pointer">
                  <Input 
                    type="file" 
                    accept="image/jpeg,image/png,image/svg+xml" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, 'stamp')} 
                  />
                  Select Stamp
                </label>
              </Button>
            </div>
          )}
        </div>

        {/* Signature */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <PenTool className="h-5 w-5" />
            <Label>Signature</Label>
          </div>
          
          {signature ? (
            renderPreview(signature, 'Signature', () => setSignature(null))
          ) : (
            <div className="border border-dashed rounded-md p-6 text-center">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">Click to upload or drag and drop</p>
              <Button asChild size="sm">
                <label className="cursor-pointer">
                  <Input 
                    type="file" 
                    accept="image/jpeg,image/png,image/svg+xml" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e, 'signature')} 
                  />
                  Select Signature
                </label>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
