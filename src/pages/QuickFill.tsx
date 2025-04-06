
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DataSummary from '@/components/forms/DataSummary';
import FormAutofill from '@/components/forms/FormAutofill';
import FillablePdfForm from '@/components/documents/FillablePdfForm';
import DocumentExtractor from '@/components/documents/DocumentExtractor';
import { FileText, FilePen, FileSpreadsheet } from 'lucide-react';

const QuickFill = () => {
  const [activeTab, setActiveTab] = useState<string>("extract");

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quick Fill</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full md:w-[600px]">
          <TabsTrigger value="extract" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Extract Data</span>
            <span className="sm:hidden">Extract</span>
          </TabsTrigger>
          <TabsTrigger value="pdf" className="flex items-center gap-2">
            <FilePen className="h-4 w-4" />
            <span className="hidden sm:inline">PDF Form Fill</span>
            <span className="sm:hidden">PDF</span>
          </TabsTrigger>
          <TabsTrigger value="forms" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span className="hidden sm:inline">Smart Forms</span>
            <span className="sm:hidden">Forms</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="extract" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Document Extraction</CardTitle>
                <CardDescription>
                  Upload documents to extract business data automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentExtractor />
              </CardContent>
            </Card>
            
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Extracted Data</CardTitle>
                <CardDescription>
                  Data extracted from your business documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataSummary />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="pdf" className="mt-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>PDF Form Auto-Fill</CardTitle>
              <CardDescription>
                Upload fillable PDF forms and auto-populate them with your stored data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FillablePdfForm />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="forms" className="mt-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Smart Form Builder</CardTitle>
              <CardDescription>
                Create, fill, and save forms with saved templates and auto-fill
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormAutofill />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuickFill;
