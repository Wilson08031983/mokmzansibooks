
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
import { Loader2, Upload, Download, Eye, ArrowRight, Edit, Save, Trash, AlertTriangle } from 'lucide-react';
import { 
  identifyPdfFormFields, 
  matchDataToFormFields, 
  populateFillablePdf,
  getStoredExtractedData,
  storeExtractedData
} from '@/utils/pdfUtils';

interface FillablePdfFormProps {
  className?: string;
}

export const FillablePdfForm: React.FC<FillablePdfFormProps> = ({ className }) => {
  // Main state
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'upload' | 'map' | 'edit' | 'preview'>('upload');
  
  // File management state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [finalPdfUrl, setFinalPdfUrl] = useState<string | null>(null);
  
  // PDF and form data state
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
  
  // References
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Load stored data on component mount
  useEffect(() => {
    setExtractedData(getStoredExtractedData());
  }, []);
  
  // Update preview when file changes
  useEffect(() => {
    if (pdfFile) {
      const url = URL.createObjectURL(pdfFile);
      setPdfPreviewUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [pdfFile]);
  
  // Upload file handler
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
      // Identify form fields in the PDF
      const { fields } = await identifyPdfFormFields(file);
      setFormFields(fields);
      
      // Prepare for the next step
      setStep('map');
      toast.success('PDF form uploaded and analyzed');
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast.error('Error processing PDF form');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Match data to fields
  const handleMatchData = () => {
    setIsLoading(true);
    
    try {
      // Flatten all extracted data for matching
      const allData: Record<string, string> = {};
      Object.values(extractedData).forEach(docData => {
        Object.entries(docData).forEach(([key, value]) => {
          if (key !== '_lastUpdated') {
            allData[key] = value;
          }
        });
      });
      
      // Match data to form fields
      const { mapping, confidence } = matchDataToFormFields(formFields, allData);
      setFieldMapping(mapping);
      setFieldConfidence(confidence);
      
      // Set initial field values based on mapping and confidence
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
      
      // Move to edit step
      setStep('edit');
      toast.success('Data mapped to form fields');
    } catch (error) {
      console.error('Error mapping data:', error);
      toast.error('Error mapping data to form fields');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate populated PDF
  const handleGeneratePdf = async () => {
    if (!pdfFile) return;
    
    setIsLoading(true);
    
    try {
      // Create data object with values
      const populatedValues: Record<string, string> = {};
      Object.entries(fieldValues).forEach(([fieldId, value]) => {
        if (value) {
          populatedValues[fieldId] = value;
        }
      });
      
      // Populate the PDF
      const populatedPdf = await populateFillablePdf(pdfFile, populatedValues);
      
      // Create URL for preview
      const url = URL.createObjectURL(populatedPdf);
      setFinalPdfUrl(url);
      
      // Store the data for future use
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
      
      // Move to preview step
      setStep('preview');
      toast.success('PDF populated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error generating populated PDF');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Download populated PDF
  const handleDownloadPdf = () => {
    if (!finalPdfUrl) return;
    
    const a = document.createElement('a');
    a.href = finalPdfUrl;
    a.download = pdfFile ? `populated-${pdfFile.name}` : 'populated-form.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Reset the whole process
  const handleReset = () => {
    setPdfFile(null);
    setPdfPreviewUrl(null);
    setFinalPdfUrl(null);
    setFormFields([]);
    setFieldMapping({});
    setFieldConfidence({});
    setFieldValues({});
    setStep('upload');
  };
  
  // Render form fields with confidence indicators
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
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleReset} disabled={isLoading}>
              Back
            </Button>
            <Button 
              className="flex-1"
              onClick={handleMatchData}
              disabled={isLoading || Object.keys(extractedData).length === 0}
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
          
          <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
            {renderFormFields()}
          </div>
          
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
    </Card>
  );
};

export default FillablePdfForm;
