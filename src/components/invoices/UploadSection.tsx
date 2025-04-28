
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, FileImage, PenTool } from "lucide-react";

interface UploadedFile {
  name: string;
  url: string;
}

const UploadSection = () => {
  const [companyLogo, setCompanyLogo] = useState<UploadedFile | null>(null);
  const [companyStamp, setCompanyStamp] = useState<UploadedFile | null>(null);
  const [signature, setSignature] = useState<UploadedFile | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'stamp' | 'signature') => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a URL for the uploaded file
    const fileUrl = URL.createObjectURL(file);
    
    const uploadedFile = {
      name: file.name,
      url: fileUrl
    };
    
    switch(type) {
      case 'logo':
        setCompanyLogo(uploadedFile);
        break;
      case 'stamp':
        setCompanyStamp(uploadedFile);
        break;
      case 'signature':
        setSignature(uploadedFile);
        break;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <h2 className="text-lg font-medium mb-4">Upload Company Assets</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Company Logo Upload */}
        <div>
          <Label htmlFor="company-logo" className="block mb-2">Company Logo</Label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {companyLogo ? (
              <div className="space-y-2">
                <img 
                  src={companyLogo.url} 
                  alt="Company Logo" 
                  className="max-h-32 mx-auto object-contain"
                />
                <p className="text-sm text-gray-500 truncate">{companyLogo.name}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCompanyLogo(null)}
                >
                  Replace
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center space-y-2 py-4">
                  <FileImage className="h-8 w-8 text-gray-400" />
                  <p className="text-xs text-gray-500">Upload your company logo</p>
                  <Label htmlFor="company-logo" className="cursor-pointer">
                    <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm">
                      Select File
                    </div>
                  </Label>
                </div>
                <Input 
                  id="company-logo" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, 'logo')}
                />
              </>
            )}
          </div>
        </div>
        
        {/* Company Stamp Upload */}
        <div>
          <Label htmlFor="company-stamp" className="block mb-2">Company Stamp</Label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {companyStamp ? (
              <div className="space-y-2">
                <img 
                  src={companyStamp.url} 
                  alt="Company Stamp" 
                  className="max-h-32 mx-auto object-contain"
                />
                <p className="text-sm text-gray-500 truncate">{companyStamp.name}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCompanyStamp(null)}
                >
                  Replace
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center space-y-2 py-4">
                  <FileImage className="h-8 w-8 text-gray-400" />
                  <p className="text-xs text-gray-500">Upload your company stamp</p>
                  <Label htmlFor="company-stamp" className="cursor-pointer">
                    <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm">
                      Select File
                    </div>
                  </Label>
                </div>
                <Input 
                  id="company-stamp" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, 'stamp')}
                />
              </>
            )}
          </div>
        </div>
        
        {/* Signature Upload */}
        <div>
          <Label htmlFor="signature" className="block mb-2">Authorized Signature</Label>
          <div className="border-2 border-dashed rounded-lg p-4 text-center">
            {signature ? (
              <div className="space-y-2">
                <img 
                  src={signature.url} 
                  alt="Signature" 
                  className="max-h-32 mx-auto object-contain"
                />
                <p className="text-sm text-gray-500 truncate">{signature.name}</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSignature(null)}
                >
                  Replace
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center space-y-2 py-4">
                  <PenTool className="h-8 w-8 text-gray-400" />
                  <p className="text-xs text-gray-500">Upload your signature</p>
                  <Label htmlFor="signature" className="cursor-pointer">
                    <div className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm">
                      Select File
                    </div>
                  </Label>
                </div>
                <Input 
                  id="signature" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleFileUpload(e, 'signature')}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;
