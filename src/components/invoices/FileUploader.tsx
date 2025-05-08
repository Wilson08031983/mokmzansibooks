import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Type for files with preview
export interface FileWithPreview extends File {
  preview?: string;
}

interface FileUploaderProps {
  title: string;
  file: FileWithPreview | null;
  setFile: (file: FileWithPreview | null) => void;
  allowedTypes?: string[];
  maxSize?: number; // in bytes
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  title, 
  file, 
  setFile, 
  allowedTypes = ["image/jpeg", "image/png", "image/svg+xml"], 
  maxSize = 5 * 1024 * 1024 // 5MB default
}) => {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(null);
  
  // Create preview when file changes
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    
    // If the file already has a preview (from localStorage), use it
    if (file.preview) {
      setPreview(file.preview);
      return;
    }
    
    // Otherwise create a new preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    
    // Clean up function to avoid memory leaks
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);
  
  // Load saved file from localStorage on component mount
  useEffect(() => {
    const savedFile = localStorage.getItem(`${title.toLowerCase().replace(/\s+/g, '_')}_file`);
    if (savedFile) {
      try {
        const fileData = JSON.parse(savedFile);
        if (fileData && fileData.preview) {
          // Create a dummy file object with the preview
          const dummyFile = new File([], fileData.name, { type: fileData.type }) as FileWithPreview;
          dummyFile.preview = fileData.preview;
          setFile(dummyFile);
        }
      } catch (e) {
        console.error("Error loading saved file:", e);
      }
    }
  }, [title, setFile]);
  
  // Save file to localStorage when it changes
  useEffect(() => {
    if (file && preview) {
      // Save minimal data to localStorage
      const fileData = {
        name: file.name,
        type: file.type,
        preview: preview
      };
      localStorage.setItem(
        `${title.toLowerCase().replace(/\s+/g, '_')}_file`, 
        JSON.stringify(fileData)
      );
    } else {
      localStorage.removeItem(`${title.toLowerCase().replace(/\s+/g, '_')}_file`);
    }
  }, [file, preview, title]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const selectedFile = e.target.files[0];
    
    // Validate file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(selectedFile.type)) {
      toast({
        title: "Invalid file type",
        description: `Please upload one of these formats: ${allowedTypes.map(type => type.split('/')[1]).join(", ")}`,
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size
    if (maxSize > 0 && selectedFile.size > maxSize) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${(maxSize / (1024 * 1024)).toFixed(1)}MB`,
        variant: "destructive"
      });
      return;
    }
    
    setFile(selectedFile as FileWithPreview);
    toast({
      title: "File uploaded",
      description: `${title} has been updated`
    });
  };
  
  const removeFile = () => {
    setFile(null);
    toast({
      title: "File removed",
      description: `${title} has been removed`
    });
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-2">{title}</h3>
        
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt={title}
              className="w-full h-40 object-contain border rounded-md mb-2"
            />
            <Button 
              size="icon" 
              variant="destructive"
              className="absolute top-2 right-2 h-6 w-6"
              onClick={removeFile}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="border border-dashed rounded-md p-6 text-center">
            <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Click to upload or drag and drop
            </p>
            <Button asChild size="sm">
              <label className="cursor-pointer">
                <input
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept={allowedTypes.join(",")}
                />
                Select File
              </label>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUploader;
