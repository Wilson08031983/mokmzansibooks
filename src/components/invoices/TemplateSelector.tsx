
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoiceData } from "@/types/invoice";
import { QuoteData } from "@/types/quote";

interface TemplateSelectorProps {
  data: InvoiceData | QuoteData;
  type: "invoice" | "quote";
  onSave?: () => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ data, type, onSave }) => {
  const handleSelectTemplate = (templateId: string) => {
    console.log(`Selected ${type} template: ${templateId}`);
    // Here you would normally generate the PDF or whatever output format
    // For now we'll just simulate it with a timeout
    setTimeout(() => {
      console.log(`${type} created with template ${templateId}`);
      // Call the onSave callback if provided
      if (onSave) {
        onSave();
      }
    }, 500);
  };

  return (
    <Tabs defaultValue="modern" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="modern">Modern</TabsTrigger>
        <TabsTrigger value="classic">Classic</TabsTrigger>
        <TabsTrigger value="minimal">Minimal</TabsTrigger>
      </TabsList>
      
      <TabsContent value="modern">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <img 
                  src={`/assets/templates/${type}-modern-preview.jpg`} 
                  alt="Modern template" 
                  className="w-full h-auto"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.currentTarget.src = "/assets/templates/placeholder.jpg";
                  }}
                />
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Modern Template</h3>
              <p className="text-sm text-gray-500 mb-4">
                A sleek, contemporary design with a clean layout and modern typography.
              </p>
              <ul className="text-sm space-y-1 mb-6">
                <li>• Professional header with logo placement</li>
                <li>• Clean, organized line items</li>
                <li>• Subtle color accents</li>
                <li>• Space for digital signature</li>
              </ul>
            </div>
            <Button onClick={() => handleSelectTemplate("modern")} className="w-full md:w-auto">
              Use Modern Template
            </Button>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="classic">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <img 
                  src={`/assets/templates/${type}-classic-preview.jpg`} 
                  alt="Classic template" 
                  className="w-full h-auto"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.currentTarget.src = "/assets/templates/placeholder.jpg";
                  }}
                />
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Classic Template</h3>
              <p className="text-sm text-gray-500 mb-4">
                A traditional, formal design suitable for established businesses.
              </p>
              <ul className="text-sm space-y-1 mb-6">
                <li>• Traditional letterhead style</li>
                <li>• Formal typography</li>
                <li>• Detailed footer with terms</li>
                <li>• Space for company stamp</li>
              </ul>
            </div>
            <Button onClick={() => handleSelectTemplate("classic")} className="w-full md:w-auto">
              Use Classic Template
            </Button>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="minimal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <img 
                  src={`/assets/templates/${type}-minimal-preview.jpg`} 
                  alt="Minimal template" 
                  className="w-full h-auto"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.currentTarget.src = "/assets/templates/placeholder.jpg";
                  }}
                />
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Minimal Template</h3>
              <p className="text-sm text-gray-500 mb-4">
                A minimalist, essentials-only design that focuses on clarity.
              </p>
              <ul className="text-sm space-y-1 mb-6">
                <li>• Streamlined, distraction-free layout</li>
                <li>• Optimized for digital viewing</li>
                <li>• Focused on key information</li>
                <li>• Perfect for frequent invoicing</li>
              </ul>
            </div>
            <Button onClick={() => handleSelectTemplate("minimal")} className="w-full md:w-auto">
              Use Minimal Template
            </Button>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default TemplateSelector;
