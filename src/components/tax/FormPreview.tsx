
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FileText, Save, Eye } from "lucide-react";

interface FormField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  required: boolean;
  autoFilled: boolean;
}

interface FormPreviewProps {
  formTemplate: {
    id: string;
    name: string;
    fields: FormField[];
  };
  extractedData: Record<string, string>[];
  onSave: (formData: { id: string; name: string; fields: FormField[] }) => void;
}

const FormPreview: React.FC<FormPreviewProps> = ({ formTemplate, extractedData, onSave }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormField[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Initialize form with template and try to fill with extracted data
  useEffect(() => {
    if (formTemplate) {
      const autoFilledForm = formTemplate.fields.map(field => {
        // Try to find a matching field in extracted data
        let autoFilledValue = '';
        let wasAutoFilled = false;
        
        extractedData.forEach(dataSet => {
          Object.entries(dataSet).forEach(([key, value]) => {
            // Match by field label or id with the extracted data key
            const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
            const normalizedLabel = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');
            const normalizedId = field.id.toLowerCase().replace(/[^a-z0-9]/g, '');
            
            if (normalizedKey.includes(normalizedLabel) || normalizedLabel.includes(normalizedKey) || 
                normalizedKey.includes(normalizedId) || normalizedId.includes(normalizedKey)) {
              autoFilledValue = value;
              wasAutoFilled = true;
              return;
            }
          });
        });
        
        return {
          ...field,
          value: autoFilledValue,
          autoFilled: wasAutoFilled
        };
      });
      
      setFormData(autoFilledForm);
    }
  }, [formTemplate, extractedData]);

  const handleFieldChange = (id: string, value: string) => {
    setFormData(prev => prev.map(field => 
      field.id === id ? { ...field, value, autoFilled: false } : field
    ));
  };

  const handleSave = () => {
    // Validate required fields
    const missingRequiredFields = formData.filter(field => field.required && !field.value);
    
    if (missingRequiredFields.length > 0) {
      toast({
        title: "Required Fields Missing",
        description: `Please fill in all required fields: ${missingRequiredFields.map(f => f.label).join(', ')}`,
        variant: "destructive",
      });
      return;
    }
    
    // Save the completed form
    onSave({
      id: formTemplate.id,
      name: formTemplate.name,
      fields: formData
    });
    
    toast({
      title: "Form Saved",
      description: "Your form has been saved with the auto-filled and manually entered data.",
    });
  };

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  const getCompletionPercentage = () => {
    const filledFields = formData.filter(field => field.value).length;
    return Math.round((filledFields / formData.length) * 100);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{formTemplate.name}</CardTitle>
          <Button variant="outline" size="sm" onClick={togglePreviewMode}>
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? "Edit Form" : "Preview Form"}
          </Button>
        </div>
        <div className="mt-2 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${getCompletionPercentage()}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-500">{getCompletionPercentage()}% complete - {formData.filter(f => f.autoFilled).length} fields auto-filled</p>
      </CardHeader>
      <CardContent>
        {previewMode ? (
          <div className="border p-6 rounded-md bg-white">
            <h2 className="text-xl font-bold mb-4 text-center">{formTemplate.name}</h2>
            <div className="space-y-4">
              {formData.map(field => (
                <div key={field.id} className="border-b pb-2">
                  <p className="font-medium">{field.label}{field.required ? ' *' : ''}</p>
                  <p className={field.value ? 'mt-1' : 'mt-1 text-gray-400 italic'}>
                    {field.value || 'Not filled'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {formData.map(field => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                  {field.autoFilled && (
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Auto-filled</span>
                  )}
                </Label>
                
                {field.type === 'select' && field.options ? (
                  <select
                    id={field.id}
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="">Select...</option>
                    {field.options.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={field.id}
                    type={field.type}
                    value={field.value}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className={field.autoFilled ? "border-green-300 focus:border-green-500" : ""}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          <p>Fields marked with <span className="text-red-500">*</span> are required.</p>
        </div>
        <Button onClick={handleSave} disabled={previewMode}>
          <Save className="mr-2 h-4 w-4" />
          Save Form
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FormPreview;
