import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import DocumentExtractor from '@/components/documents/DocumentExtractor';
import FillablePdfForm from '@/components/documents/FillablePdfForm';
import DataSummary from '@/components/forms/DataSummary';
import { ChevronDown, ChevronUp, FileText, Clock } from 'lucide-react';

const QuickFill = () => {
  const [activeTab, setActiveTab] = useState<string>("rfq");

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Quick Fill</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="rfq">RFQ Search & Pricing</TabsTrigger>
          <TabsTrigger value="forms">Smart Forms</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rfq" className="mt-6">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>RFQ Search & Pricing</CardTitle>
              <CardDescription>
                Search for RFQs and generate pricing quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-12">
                RFQ Search & Pricing functionality is preserved here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="forms" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card className="w-full mb-6">
                <CardHeader>
                  <CardTitle>Document AI</CardTitle>
                  <CardDescription>
                    Extract and store data from your business documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentExtractor />
                </CardContent>
              </Card>
              
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Stored Business Data</CardTitle>
                  <CardDescription>
                    All your extracted business data that can be used to fill forms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataSummary />
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Smart Form Filler</CardTitle>
                  <CardDescription>
                    Upload fillable PDF forms and auto-fill them with your data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FillablePdfForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QuickFill;
