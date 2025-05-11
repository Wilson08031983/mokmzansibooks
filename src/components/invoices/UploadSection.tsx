import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Upload, FileImage, PenTool, X, Save, ImageOff, Wand2 } from "lucide-react";
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
import { removeImageBackground, shouldAttemptBackgroundRemoval } from "@/utils/imageProcessing";

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
  
  // State for background removal toggle
  const [removeBackground, setRemoveBackground] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // Load saved files on component mount
  useEffect(() => {
    const loadSavedFiles = async () => {
      try {
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
      } catch (error) {
        console.error('Error loading saved images:', error);
        toast({
          title: "Error Loading Images",
          description: "There was a problem loading your saved images.",
          variant: "destructive"
        });
      }
    };
    
    loadSavedFiles();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'stamp' | 'signature') => {
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
    
    try {
      // Create a preview of the file
      const fileWithPreview = file as FileWithPreview;
      
      // Create object URL for preview
      fileWithPreview.preview = URL.createObjectURL(file);
      
      // Apply background removal if enabled and it's a compatible image type
      let processedFile = fileWithPreview;
      
      if (removeBackground && shouldAttemptBackgroundRemoval(file)) {
        try {
          // Set processing state to display loading indicators
          setIsProcessing(true);
          
          toast({
            title: "Processing Image",
            description: "Removing background with AI enhancement... Please wait."
          });
          
          // Process image with background removal
          processedFile = await removeImageBackground(fileWithPreview);
          
          // Success feedback with more details
          toast({
            title: "Background Removed Successfully",
            description: "Image background has been removed with our enhanced algorithm.",
            variant: "success"
          });
        } catch (error) {
          console.error('Error in background removal:', error);
          toast({
            title: "Background Removal Failed",
            description: "Could not remove the background. Using original image instead.",
            variant: "destructive"
          });
          // Use original file if background removal fails
          processedFile = fileWithPreview;
        } finally {
          // Reset processing state
          setIsProcessing(false);
        }
      }
      
      // Update the state based on the file type
      switch(type) {
        case 'logo':
          setCompanyLogo(processedFile);
          // Persist to storage
          await saveCompanyLogo(processedFile);
          toast({
            title: "Logo uploaded",
            description: "Company logo has been saved for all invoices and quotes"
          });
          break;
        case 'stamp':
          setCompanyStamp(processedFile);
          // Persist to storage
          await saveCompanyStamp(processedFile);
          toast({
            title: "Stamp uploaded",
            description: "Company stamp has been saved for all invoices and quotes"
          });
          break;
        case 'signature':
          setSignature(processedFile);
          // Persist to storage
          await saveSignature(processedFile);
          toast({
            title: "Signature uploaded",
            description: "Signature has been saved for all invoices and quotes"
          });
          break;
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Error Processing Image",
        description: "There was a problem processing your image.",
        variant: "destructive"
      });
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Upload Company Assets</h2>
        
        {/* Background removal toggle with enhanced UI */}
        <div className={`flex items-center space-x-2 p-2 rounded-md border ${isProcessing ? 'bg-purple-50 border-purple-200 animate-pulse' : 'bg-slate-50 border-slate-200'}`}>
          <Switch 
            id="remove-background" 
            checked={removeBackground} 
            onCheckedChange={setRemoveBackground}
            disabled={isProcessing} 
          />
          <Label htmlFor="remove-background" className={`cursor-pointer flex items-center gap-1 ${isProcessing ? 'text-purple-700' : ''}`}>
            {isProcessing ? (
              <svg className="animate-spin h-4 w-4 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <Wand2 className={`h-4 w-4 ${removeBackground ? 'text-purple-500' : ''}`} />
            )}
            <span className="text-sm font-medium">
              {isProcessing 
                ? 'Processing Image...' 
                : (removeBackground ? 'Background Removal Active' : 'Remove Background')}
            </span>
          </Label>
        </div>
      </div>
      
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
