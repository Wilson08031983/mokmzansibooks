import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface TemplateSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTemplate: number;
  onTemplateSelect: (templateNumber: number) => void;
  onDownload: () => Promise<void>;
  templateType: 'invoice' | 'quote';
}

const TemplateSelectionDialog: React.FC<TemplateSelectionDialogProps> = ({
  open,
  onOpenChange,
  selectedTemplate,
  onTemplateSelect,
  onDownload,
  templateType
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select {templateType === 'invoice' ? 'Invoice' : 'Quote'} Template</DialogTitle>
          <DialogDescription>
            Choose a template for your {templateType} download.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div 
            className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${selectedTemplate === 5 ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
            onClick={() => onTemplateSelect(5)}
          >
            <div className="w-full h-32 bg-purple-100 rounded-md mb-2 flex items-center justify-center">
              <span className="text-purple-700 font-medium">Template 5</span>
            </div>
            <p className="text-center text-sm">Purple Design</p>
          </div>
          
          <div 
            className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${selectedTemplate === 6 ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
            onClick={() => onTemplateSelect(6)}
          >
            <div className="w-full h-32 bg-blue-100 rounded-md mb-2 flex items-center justify-center">
              <span className="text-blue-700 font-medium">Template 6</span>
            </div>
            <p className="text-center text-sm">Blue Design</p>
          </div>
          
          <div 
            className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${selectedTemplate === 7 ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
            onClick={() => onTemplateSelect(7)}
          >
            <div className="w-full h-32 bg-green-100 rounded-md mb-2 flex items-center justify-center">
              <span className="text-green-700 font-medium">Template 7</span>
            </div>
            <p className="text-center text-sm">Green Design</p>
          </div>
          
          <div 
            className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${selectedTemplate === 8 ? 'border-primary bg-primary/10' : 'border-gray-200'}`}
            onClick={() => onTemplateSelect(8)}
          >
            <div className="w-full h-32 bg-orange-100 rounded-md mb-2 flex items-center justify-center">
              <span className="text-orange-700 font-medium">Template 8</span>
            </div>
            <p className="text-center text-sm">Orange Design</p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={onDownload} className="bg-primary">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateSelectionDialog;
