import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Loader2, Upload, Download, Eye, ArrowRight, Edit, Save, Trash, 
  AlertTriangle, FileText, FileCheck, FileSpreadsheet, Plus, Star, StarOff
} from 'lucide-react';
import { 
  identifyPdfFormFields, 
  matchDataToFormFields, 
  populateFillablePdf,
  getStoredExtractedData,
  storeExtractedData,
  getStoredFormTemplates,
  storeFormTemplate,
  deleteFormTemplate,
  applyFormTemplate
} from '@/utils/pdfUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FillablePdfFormProps {
  className?: string;
}

export const FillablePdfForm: React.FC<FillablePdfFormProps> = ({ className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'map' | 'edit' | 'preview'>('upload');
  
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [finalPdfUrl, setFinalPdfUrl] = useState<string | null>(null);
  
  const [formFields, setFormFields] = useState<Array<{
    id: string;
    name: string;
    type: string;
    rect: { x: number, y: number, width: number, height: number };
    page: number;
  }>>([]);
  const [extractedData, setExtractedData] = useState<Record<string, Record<string, string>>>({});
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  const [fieldConfidence, setFieldConfidence] = useState<Record<string, number>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [autoFillThreshold, setAutoFillThreshold] = useState(0.7);
  const [showLowConfidenceOnly, setShowLowConfidenceOnly] = useState(false);
  
  const [templates, setTemplates] = useState<Record<string, {
    name: string;
    fields: Record<string, string>;
    type: string;
    createdAt: string;
    lastUsed: string;
  }>>({});
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('generic');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [updateDates, setUpdateDates] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    setExtractedData(getStoredExtractedData());
    setTemplates(getStoredFormTemplates());
    
    const handleStorageUpdate = () => {
      setExtractedData(getStoredExtractedData());
    };
    
    const handleTemplatesUpdate = () => {
      setTemplates(getStoredFormTemplates());
    };
    
    window.addEventListener('storageupdated', handleStorageUpdate);
    window.addEventListener('templatesupdated', handleTemplatesUpdate);
    
    return () => {
      window.removeEventListener('storageupdated', handleStorageUpdate);
      window.removeEventListener('templatesupdated', handleTemplatesUpdate);
    };
  }, []);
  
  useEffect(() => {
    if (pdfFile) {
      const url = URL.createObjectURL(pdfFile);
      setPdfPreviewUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [pdfFile]);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Please upload a PDF file');
      return;
    }
    
    setIsLoading(true);
    setPdfFile(file);
    
    try {
      const { fields } = await identifyPdfFormFields(file);
      setFormFields(fields);
      
      setStep('map');
      toast.success('PDF form uploaded and analyzed');
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast.error('Error processing PDF form');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMatchData = () => {
    setIsLoading(true);
    
    try {
      const allData: Record<string, string> = {};
      Object.values(extractedData).forEach(docData => {
        Object.entries(docData).forEach(([key, value]) => {
          if (key !== '_lastUpdated') {
            allData[key] = value;
          }
        });
      });
      
      const { mapping, confidence } = matchDataToFormFields(formFields, allData);
      setFieldMapping(mapping);
      setFieldConfidence(confidence);
      
      const initialValues: Record<string, string> = {};
      formFields.forEach(field => {
        const mappedKey = mapping[field.id];
        if (mappedKey && confidence[field.id] >= autoFillThreshold) {
          initialValues[field.id] = allData[mappedKey];
        } else {
          initialValues[field.id] = '';
        }
      });
      setFieldValues(initialValues);
      
      setStep('edit');
      toast.success('Data mapped to form fields');
    } catch (error) {
      console.error('Error mapping data:', error);
      toast.error('Error mapping data to form fields');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUseTemplate = (templateName: string) => {
    if (!templates[templateName]) return;
    
    const template = templates[templateName];
    const populatedValues = applyFormTemplate(template, formFields, updateDates);
    
    setFieldValues(populatedValues);
    setSelectedTemplate(templateName);
    
    toast.success(`Template "${templateName}" applied to form`);
  };
  
  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }
    
    const fieldNameMapping: Record<string, string> = {};
    formFields.forEach(field => {
      if (fieldValues[field.id]) {
        fieldNameMapping[field.name] = fieldValues[field.id];
      }
    });
    
    storeFormTemplate(newTemplateName, fieldNameMapping, templateType);
    
    toast.success(`Template "${newTemplateName}" saved successfully`);
    setTemplateDialogOpen(false);
    setNewTemplateName('');
  };
  
  const handleDeleteTemplate = (templateName: string) => {
    if (deleteFormTemplate(templateName)) {
      toast.success(`Template "${templateName}" deleted`);
      if (selectedTemplate === templateName) {
        setSelectedTemplate(null);
      }
    } else {
      toast.error(`Error deleting template "${templateName}"`);
    }
  };
  
  const handleGeneratePdf = async () => {
    if (!pdfFile) return;
    
    setIsLoading(true);
    
    try {
      const populatedValues: Record<string, string> = {};
      Object.entries(fieldValues).forEach(([fieldId, value]) => {
        if (value) {
          populatedValues[fieldId] = value;
        }
      });
      
      const populatedPdf = await populateFillablePdf(pdfFile, populatedValues);
      
      const url = URL.createObjectURL(populatedPdf);
      setFinalPdfUrl(url);
      
      const dataToStore: Record<string, string> = {};
      Object.entries(fieldValues).forEach(([fieldId, value]) => {
        if (value) {
          const field = formFields.find(f => f.id === fieldId);
          if (field) {
            dataToStore[field.name] = value;
          }
        }
      });
      storeExtractedData('form_data', dataToStore);
      
      setStep('preview');
      toast.success('PDF populated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error generating populated PDF');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadPdf = () => {
    if (!finalPdfUrl) return;
    
    const a = document.createElement('a');
    a.href = finalPdfUrl;
    a.download = pdfFile ? `populated-${pdfFile.name}` : 'populated-form.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handleReset = () => {
    setPdfFile(null);
    setPdfPreviewUrl(null);
    setFinalPdfUrl(null);
    setFormFields([]);
    setFieldMapping({});
    setFieldConfidence({});
    setFieldValues({});
    setSelectedTemplate(null);
    setStep('upload');
  };
  
  const renderFormFields = () => {
    if (formFields.length === 0) {
      return <p className="text-center py-4">No form fields detected in this PDF.</p>;
    }
    
    const fieldsToShow = showLowConfidenceOnly
      ? formFields.filter(field => !fieldMapping[field.id] || fieldConfidence[field.id] < autoFillThreshold)
      : formFields;
    
    if (fieldsToShow.length === 0) {
      return <p className="text-center py-4">All fields have high confidence matches!</p>;
    }
    
    return (
      <div className="space-y-4">
        {fieldsToShow.map(field => {
          const confidence = fieldConfidence[field.id] || 0;
          const isLowConfidence = confidence < autoFillThreshold;
          
          return (
            <div key={field.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.id} className="font-medium">
                  {field.name}
                  {isLowConfidence && (
                    <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Low confidence
                    </Badge>
                  )}
                </Label>
                <Badge 
                  variant="outline" 
                  className={`${confidence >= 0.8 ? 'bg-green-100 text-green-800' : 
                    confidence >= 0.5 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}
                >
                  {Math.round(confidence * 100)}%
                </Badge>
              </div>
              <Input
                id={field.id}
                value={fieldValues[field.id] || ''}
                onChange={(e) => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                className={isLowConfidence ? 'border-amber-300 bg-amber-50' : ''}
              />
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <Card className={`p-5 ${className}`}>
      <Tabs value={step} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" disabled={isLoading}>1. Upload Form</TabsTrigger>
          <TabsTrigger value="map" disabled={isLoading || !pdfFile}>2. Map Data</TabsTrigger>
          <TabsTrigger value="edit" disabled={isLoading || Object.keys(fieldMapping).length === 0}>3. Edit Fields</TabsTrigger>
          <TabsTrigger value="preview" disabled={isLoading || !finalPdfUrl}>4. Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4 pt-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Upload Fillable PDF Form</h3>
            <p className="text-sm text-gray-500">Upload a PDF form that you want to populate with your data</p>
          </div>
          
          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center space-y-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PDF form files only (MAX. 10MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isLoading}
            />
          </div>
          
          {Object.keys(templates).length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 flex items-center gap-2 mb-3">
                <FileSpreadsheet className="h-4 w-4" /> Your Saved Form Templates
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(templates).slice(0, 4).map(([name, template]) => (
                  <Badge key={name} className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 p-2 justify-between cursor-default">
                    <span className="text-xs truncate">{name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(template.lastUsed).toLocaleDateString()}
                    </span>
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                These templates will be available to use after uploading your PDF form
              </p>
            </div>
          )}
          
          <Button 
            variant="extract" 
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
            Select PDF Form to Fill
          </Button>
        </TabsContent>
        
        <TabsContent value="map" className="space-y-4 pt-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Map Your Data to Form Fields</h3>
            <p className="text-sm text-gray-500">We'll match your extracted data to the form fields</p>
          </div>
          
          {pdfPreviewUrl && (
            <div className="border rounded-lg p-2 bg-gray-50">
              <iframe 
                src={pdfPreviewUrl} 
                className="w-full h-64 rounded border bg-white" 
                title="PDF Preview"
              />
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <h4 className="font-medium text-blue-800">Available Data Sources</h4>
            <div className="mt-2 space-y-2">
              {Object.keys(extractedData).length > 0 ? (
                Object.keys(extractedData).map(docType => (
                  <div key={docType} className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {docType.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      Updated: {extractedData[docType]?._lastUpdated 
                        ? new Date(extractedData[docType]._lastUpdated).toLocaleDateString()
                        : 'Unknown'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No extracted data available. Please upload some documents first.</p>
              )}
            </div>
          </div>
          
          {Object.keys(templates).length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
              <h4 className="font-medium text-green-800 flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" /> Available Form Templates
              </h4>
              <p className="text-xs text-green-700 mt-1 mb-3">
                You can also use one of your saved templates in the next step
              </p>
              <div className="space-y-2">
                {Object.entries(templates).map(([name, template]) => (
                  <div key={name} className="flex items-center justify-between gap-2 p-2 bg-white rounded-md">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{name}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Last used: {new Date(template.lastUsed).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleReset} disabled={isLoading}>
              Back
            </Button>
            <Button 
              className="flex-1"
              onClick={handleMatchData}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ArrowRight className="h-4 w-4 mr-2" />}
              Continue
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="edit" className="space-y-4 pt-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Review and Edit Field Values</h3>
            <p className="text-sm text-gray-500">Check fields with low confidence and make any necessary edits</p>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Label htmlFor="confidence-threshold" className="text-sm whitespace-nowrap">
                Auto-fill Threshold:
              </Label>
              <Slider
                id="confidence-threshold"
                min={0}
                max={100}
                step={5}
                className="w-24"
                value={[autoFillThreshold * 100]}
                onValueChange={(values) => setAutoFillThreshold(values[0] / 100)}
              />
              <span className="text-sm font-medium">{Math.round(autoFillThreshold * 100)}%</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="show-low-confidence"
                checked={showLowConfidenceOnly}
                onCheckedChange={setShowLowConfidenceOnly}
              />
              <Label htmlFor="show-low-confidence" className="text-sm">
                Show only low confidence
              </Label>
            </div>
          </div>
          
          {Object.keys(templates).length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex flex-col">
                <Label className="text-sm mb-1 text-green-800">Use a template to fill this form:</Label>
                <div className="flex flex-row items-center gap-2">
                  <Select value={selectedTemplate || ''} onValueChange={handleUseTemplate}>
                    <SelectTrigger className="w-full max-w-[260px] bg-white">
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(templates).map(([name]) => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="update-dates"
                  checked={updateDates}
                  onCheckedChange={setUpdateDates}
                />
                <Label htmlFor="update-dates" className="text-sm text-green-800">
                  Auto-update dates
                </Label>
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white border-green-300 text-green-700 hover:bg-green-50"
                onClick={() => setTemplateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Save as Template
              </Button>
            </div>
          )}
          
          <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
            {renderFormFields()}
          </div>
          
          {Object.keys(templates).length === 0 && (
            <Button 
              variant="outline" 
              className="w-full bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
              onClick={() => setTemplateDialogOpen(true)}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Save as Template for Future Use
            </Button>
          )}
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep('map')} disabled={isLoading}>
              Back
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleGeneratePdf}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Generate PDF
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4 pt-4">
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">Preview and Download</h3>
            <p className="text-sm text-gray-500">Your PDF form has been populated with your data</p>
          </div>
          
          {finalPdfUrl && (
            <div className="border rounded-lg p-2 bg-gray-50">
              <iframe 
                src={finalPdfUrl} 
                className="w-full h-96 rounded border bg-white" 
                title="Populated PDF Preview"
              />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep('edit')} disabled={isLoading}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Again
            </Button>
            <Button 
              variant="download" 
              className="flex-1" 
              onClick={handleDownloadPdf}
              disabled={isLoading || !finalPdfUrl}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleReset}
            disabled={isLoading}
          >
            <Trash className="h-4 w-4 mr-2" />
            Start New Form
          </Button>
        </TabsContent>
      </Tabs>
      
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Form Template</DialogTitle>
            <DialogDescription>
              Save your current form values as a template for future use. You can apply this template to similar forms in the future.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                placeholder="e.g., Tax Form 2023"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
              />
            </div>
            
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="template-type">Template Type</Label>
              <Select value={templateType} onValueChange={setTemplateType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="generic">Generic Form</SelectItem>
                  <SelectItem value="tax">Tax Form</SelectItem>
                  <SelectItem value="tender">Tender Application</SelectItem>
                  <SelectItem value="registration">Registration Form</SelectItem>
                  <SelectItem value="application">Application Form</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {Object.keys(templates).length > 0 && selectedTemplate && (
        <Dialog>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage Templates</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
              {Object.entries(templates).map(([name, template]) => (
                <div key={name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-xs text-gray-500">
                      Created: {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(name)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

export default FillablePdfForm;
