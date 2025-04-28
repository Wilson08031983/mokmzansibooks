
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Download } from "lucide-react";
import QuoteClassicTemplate from "@/components/invoices/templates/components/QuoteClassicTemplate";
import QuoteModernTemplate from "@/components/invoices/templates/components/QuoteModernTemplate";
import QuoteElegantTemplate from "@/components/invoices/templates/components/QuoteElegantTemplate";
import QuoteMinimalTemplate from "@/components/invoices/templates/components/QuoteMinimalTemplate";
import InvoiceClassicTemplate from "@/components/invoices/templates/components/InvoiceClassicTemplate";
import InvoiceModernTemplate from "@/components/invoices/templates/components/InvoiceModernTemplate";
import InvoiceElegantTemplate from "@/components/invoices/templates/components/InvoiceElegantTemplate";
import InvoiceMinimalTemplate from "@/components/invoices/templates/components/InvoiceMinimalTemplate";

interface TemplateSelectorProps {
  data: any;
  type: 'quote' | 'invoice';
}

const TemplateSelector = ({ data, type }: TemplateSelectorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const { toast } = useToast();
  
  const handleSelectTemplate = (template: string) => {
    setSelectedTemplate(template);
  };
  
  const handleDownload = () => {
    // In a real app, this would download the document
    toast({
      title: `${type === 'quote' ? 'Quote' : 'Invoice'} downloaded successfully`,
      description: `Your ${type} has been downloaded as a PDF.`,
    });
  };

  // Template preview components
  const getTemplatePreview = () => {
    if (type === 'quote') {
      switch (selectedTemplate) {
        case "classic":
          return <QuoteClassicTemplate data={data} preview={true} />;
        case "modern":
          return <QuoteModernTemplate data={data} preview={true} />;
        case "elegant":
          return <QuoteElegantTemplate data={data} preview={true} />;
        case "minimal":
          return <QuoteMinimalTemplate data={data} preview={true} />;
        default:
          return <QuoteClassicTemplate data={data} preview={true} />;
      }
    } else {
      switch (selectedTemplate) {
        case "classic":
          return <InvoiceClassicTemplate data={data} preview={true} />;
        case "modern":
          return <InvoiceModernTemplate data={data} preview={true} />;
        case "elegant":
          return <InvoiceElegantTemplate data={data} preview={true} />;
        case "minimal":
          return <InvoiceMinimalTemplate data={data} preview={true} />;
        default:
          return <InvoiceClassicTemplate data={data} preview={true} />;
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={selectedTemplate} onValueChange={handleSelectTemplate}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="classic">Classic</TabsTrigger>
          <TabsTrigger value="modern">Modern</TabsTrigger>
          <TabsTrigger value="elegant">Elegant</TabsTrigger>
          <TabsTrigger value="minimal">Minimal</TabsTrigger>
        </TabsList>
        
        {/* Template Preview */}
        <TabsContent value={selectedTemplate} className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[500px] overflow-y-auto p-4">
                  {getTemplatePreview()}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-4">
        <Button 
          onClick={handleDownload} 
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download as PDF
        </Button>
      </div>
    </div>
  );
};

export default TemplateSelector;
