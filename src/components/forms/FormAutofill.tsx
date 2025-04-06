
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  FileSpreadsheet, Save, Download, Upload, ArrowRight, 
  RotateCcw, RotateCw, Check, Calendar, Copy, Clipboard
} from 'lucide-react';
import { toast } from 'sonner';
import FormField from './FormField';
import FormTemplate, { Template } from './FormTemplate';
import FormBuilder, { FormFieldConfig } from './FormBuilder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const LOCAL_STORAGE_KEYS = {
  TEMPLATES: 'fillout_templates',
  FORM_STRUCTURE: 'fillout_form_structure',
  FORM_VALUES: 'fillout_form_values'
};

const DEFAULT_FORM_FIELDS: FormFieldConfig[] = [
  {
    id: 'company_name',
    label: 'Company Name',
    type: 'text',
    placeholder: 'Enter your company name',
    required: true
  },
  {
    id: 'registration_number',
    label: 'Registration Number',
    type: 'text',
    placeholder: 'Enter company registration number',
    required: true
  },
  {
    id: 'tax_number',
    label: 'Tax Number',
    type: 'text',
    placeholder: 'Enter tax number',
    required: true
  },
  {
    id: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'Enter email address',
    required: true
  },
  {
    id: 'phone',
    label: 'Phone Number',
    type: 'tel',
    placeholder: 'Enter phone number',
    required: true
  },
  {
    id: 'address',
    label: 'Physical Address',
    type: 'text',
    placeholder: 'Enter physical address',
    required: false
  },
  {
    id: 'website',
    label: 'Website',
    type: 'url',
    placeholder: 'Enter company website',
    required: false
  },
  {
    id: 'submission_date',
    label: 'Submission Date',
    type: 'date',
    required: true,
    defaultValue: new Date().toISOString().split('T')[0]
  }
];

const FormAutofill: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('fill');
  const [formFields, setFormFields] = useState<FormFieldConfig[]>(DEFAULT_FORM_FIELDS);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [templates, setTemplates] = useState<Template[]>([]);
  const [copyText, setCopyText] = useState<string>('');
  
  // Load saved data from localStorage
  useEffect(() => {
    try {
      // Load templates
      const savedTemplates = localStorage.getItem(LOCAL_STORAGE_KEYS.TEMPLATES);
      if (savedTemplates) {
        setTemplates(JSON.parse(savedTemplates));
      }
      
      // Load form structure
      const savedFormStructure = localStorage.getItem(LOCAL_STORAGE_KEYS.FORM_STRUCTURE);
      if (savedFormStructure) {
        setFormFields(JSON.parse(savedFormStructure));
      }
      
      // Load form values
      const savedFormValues = localStorage.getItem(LOCAL_STORAGE_KEYS.FORM_VALUES);
      if (savedFormValues) {
        setFormValues(JSON.parse(savedFormValues));
      } else {
        // Initialize with default values from form fields
        const initialValues: Record<string, string> = {};
        DEFAULT_FORM_FIELDS.forEach(field => {
          if (field.defaultValue) {
            initialValues[field.id] = field.defaultValue;
          }
        });
        setFormValues(initialValues);
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      toast.error('Failed to load saved data');
    }
  }, []);
  
  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  }, [templates]);
  
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.FORM_STRUCTURE, JSON.stringify(formFields));
  }, [formFields]);
  
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.FORM_VALUES, JSON.stringify(formValues));
    
    // Generate copy text for the form values
    let text = '';
    formFields.forEach(field => {
      if (formValues[field.id]) {
        text += `${field.label}: ${formValues[field.id]}\n`;
      }
    });
    setCopyText(text);
  }, [formValues, formFields]);
  
  const handleUpdateFormField = (id: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  const handleSaveFormFields = (newFields: FormFieldConfig[]) => {
    setFormFields(newFields);
    
    // Initialize any new fields with default values
    const updatedValues = { ...formValues };
    newFields.forEach(field => {
      if (field.defaultValue && !updatedValues[field.id]) {
        updatedValues[field.id] = field.defaultValue;
      }
    });
    setFormValues(updatedValues);
  };
  
  const handleSaveTemplate = (templateData: Omit<Template, 'id' | 'createdAt' | 'lastUsed'>) => {
    const newTemplate: Template = {
      id: `template_${Date.now()}`,
      name: templateData.name,
      category: templateData.category,
      fields: { ...formValues },
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };
    
    setTemplates([...templates, newTemplate]);
  };
  
  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(templates.filter(template => template.id !== templateId));
  };
  
  const handleApplyTemplate = (template: Template, updateDates: boolean) => {
    const newValues = { ...template.fields };
    
    // Update date fields if requested
    if (updateDates) {
      const today = new Date();
      const lastUsedDate = new Date(template.lastUsed);
      
      formFields.forEach(field => {
        if (field.type === 'date' && newValues[field.id]) {
          try {
            const originalDate = new Date(newValues[field.id]);
            const daysDiff = Math.round((originalDate.getTime() - lastUsedDate.getTime()) / (1000 * 60 * 60 * 24));
            
            const newDate = new Date(today);
            newDate.setDate(newDate.getDate() + daysDiff);
            newValues[field.id] = newDate.toISOString().split('T')[0];
          } catch (error) {
            console.warn('Could not update date field:', field.id);
          }
        }
      });
    }
    
    // Update the template's last used date
    setTemplates(templates.map(t => 
      t.id === template.id 
        ? { ...t, lastUsed: new Date().toISOString() } 
        : t
    ));
    
    setFormValues(newValues);
  };
  
  const handleResetForm = () => {
    if (confirm('Are you sure you want to reset the form? All current values will be cleared.')) {
      const initialValues: Record<string, string> = {};
      formFields.forEach(field => {
        if (field.defaultValue) {
          initialValues[field.id] = field.defaultValue;
        } else {
          initialValues[field.id] = '';
        }
      });
      setFormValues(initialValues);
      toast.success('Form reset successfully');
    }
  };
  
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(copyText)
      .then(() => toast.success('Form data copied to clipboard'))
      .catch(() => toast.error('Failed to copy to clipboard'));
  };
  
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(formValues, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    
    const exportName = `form_data_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportName);
    linkElement.click();
  };
  
  const isFormValid = () => {
    for (const field of formFields) {
      if (field.required && !formValues[field.id]) {
        return false;
      }
    }
    return true;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Smart Form Autofill</CardTitle>
        <CardDescription>
          Fill forms quickly and save templates for future use
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fill">Fill Form</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="customize">Customize Form</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fill" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {formFields.map(field => (
                  <FormField
                    key={field.id}
                    id={field.id}
                    label={field.label}
                    type={field.type}
                    value={formValues[field.id] || ''}
                    onChange={(value) => handleUpdateFormField(field.id, value)}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                ))}
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-medium mb-2 flex items-center">
                    <Clipboard className="h-4 w-4 mr-2" />
                    Form Data Preview
                  </h3>
                  <div className="bg-white p-3 rounded border text-sm font-mono whitespace-pre-wrap max-h-80 overflow-y-auto">
                    {copyText || 'No data entered yet'}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 w-full"
                    onClick={handleCopyToClipboard}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </Button>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    variant="fillout" 
                    disabled={!isFormValid()}
                    onClick={() => toast.success('Form submitted successfully')}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Submit Form
                  </Button>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleResetForm}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={handleExportJSON}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export JSON
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="space-y-6 pt-4">
            <FormTemplate
              templates={templates}
              onSaveTemplate={handleSaveTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onApplyTemplate={handleApplyTemplate}
              currentFormFields={formValues}
            />
          </TabsContent>
          
          <TabsContent value="customize" className="space-y-6 pt-4">
            <FormBuilder
              formFields={formFields}
              onSave={handleSaveFormFields}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FormAutofill;
