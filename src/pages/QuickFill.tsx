
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DocumentExtractor from '@/components/documents/DocumentExtractor';
import FillablePdfForm from '@/components/documents/FillablePdfForm';

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
          {/* Existing RFQ Search & Pricing content */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>RFQ Search & Pricing</CardTitle>
              <CardDescription>
                Search for RFQs and generate pricing quickly
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* This is where the existing RFQ content would be */}
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

// Helper component to display stored data summary
const DataSummary = () => {
  const [data, setData] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const storedData = localStorage.getItem('extractedData');
      return storedData ? JSON.parse(storedData) : {};
    } catch {
      return {};
    }
  });
  
  // Reload data when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedData = localStorage.getItem('extractedData');
        setData(storedData ? JSON.parse(storedData) : {});
      } catch {
        setData({});
      }
    };
    
    // Add event listener for both storage event and custom event
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageupdated', handleStorageChange);
    
    // Also check on mount
    handleStorageChange();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageupdated', handleStorageChange);
    };
  }, []);
  
  if (Object.keys(data).length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No data has been extracted yet.</p>
        <p className="text-sm mt-2">Upload documents to extract business data.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
      {Object.entries(data).map(([type, typeData]) => {
        // Skip internal fields
        const displayData = Object.entries(typeData).filter(([key]) => !key.startsWith('_'));
        
        if (displayData.length === 0) return null;
        
        return (
          <div key={type} className="border rounded-lg p-4">
            <h3 className="font-medium capitalize mb-2">
              {type.replace('_', ' ')} Data
              {typeData._lastUpdated && (
                <span className="text-xs text-gray-500 ml-2">
                  Updated: {new Date(typeData._lastUpdated).toLocaleDateString()}
                </span>
              )}
            </h3>
            
            <div className="grid grid-cols-1 gap-2">
              {displayData.map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuickFill;
