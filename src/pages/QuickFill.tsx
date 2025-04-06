
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import DocumentExtractor from '@/components/documents/DocumentExtractor';
import FillablePdfForm from '@/components/documents/FillablePdfForm';
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

// Enhanced DataSummary component to display stored data
const DataSummary = () => {
  const [data, setData] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const storedData = localStorage.getItem('extractedData');
      return storedData ? JSON.parse(storedData) : {};
    } catch {
      return {};
    }
  });
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  
  // Toggle a section's expanded state
  const toggleSection = (type: string) => {
    setExpandedSections(prev => ({ 
      ...prev, 
      [type]: !prev[type] 
    }));
  };
  
  // Reload data when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const storedData = localStorage.getItem('extractedData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setData(parsedData);
          
          // Auto-expand newly added sections
          const newSections = Object.keys(parsedData).reduce((acc, key) => {
            if (!Object.keys(data).includes(key)) {
              acc[key] = true;
            }
            return acc;
          }, {} as Record<string, boolean>);
          
          setExpandedSections(prev => ({ ...prev, ...newSections }));
          console.log('Data updated from storage:', parsedData);
        } else {
          setData({});
        }
      } catch (error) {
        console.error('Error parsing data from storage:', error);
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
  }, [data]);
  
  if (Object.keys(data).length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No data has been extracted yet.</p>
        <p className="text-sm mt-2">Upload documents to extract business data.</p>
      </div>
    );
  }
  
  // Format a date string in a more readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-ZA', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return 'Unknown date';
    }
  };
  
  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
      {Object.entries(data).map(([type, typeData]) => {
        // Skip internal fields
        const displayData = Object.entries(typeData).filter(([key]) => !key.startsWith('_'));
        
        if (displayData.length === 0) return null;
        
        const isExpanded = expandedSections[type] !== false; // Default to expanded
        const fieldCount = displayData.length;
        
        return (
          <Collapsible 
            key={type} 
            open={isExpanded}
            onOpenChange={() => toggleSection(type)}
            className="border rounded-lg overflow-hidden"
          >
            <CollapsibleTrigger asChild>
              <div className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <h3 className="font-medium capitalize">
                      {type.replace('_', ' ')} Data
                    </h3>
                    <Badge variant="outline" className="ml-1">
                      {fieldCount} {fieldCount === 1 ? 'field' : 'fields'}
                    </Badge>
                  </div>
                  
                  {typeData._lastUpdated && (
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(typeData._lastUpdated)}
                    </div>
                  )}
                </div>
                
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="p-4 divide-y">
                {displayData.map(([key, value]) => (
                  <div key={key} className="py-2 flex justify-between items-center text-sm">
                    <span className="text-gray-600 font-medium">{key}:</span>
                    <span className="font-medium max-w-[60%] truncate">{value}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
    </div>
  );
};

export default QuickFill;
