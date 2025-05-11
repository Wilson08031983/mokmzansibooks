
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import UploadSection from "@/components/invoices/UploadSection";
import QuoteForm from "@/components/invoices/QuoteForm";
import InvoiceForm from "@/components/invoices/InvoiceForm";
import SavedQuotes from "@/components/invoices/SavedQuotes";
import SavedInvoices from "@/components/invoices/SavedInvoices";
import { useToast } from "@/components/ui/use-toast";
import { FileWithPreview } from "@/components/invoices/FileUploader";

const InvoiceQuoteManager = () => {
  const { toast } = useToast();
  
  // Active tab state with default of createQuote
  const [activeTab, setActiveTab] = useState("createQuote");
  
  // Check for active tab preference in localStorage on component mount
  useEffect(() => {
    // Get the tab preference from localStorage
    const savedTab = localStorage.getItem('activeInvoiceTab');
    
    if (savedTab) {
      console.log(`Setting active tab to ${savedTab} from localStorage`);
      setActiveTab(savedTab);
      
      // Clear the localStorage value to prevent it from persisting across page refreshes
      localStorage.removeItem('activeInvoiceTab');
      
      // Check if we're being redirected from client page specifically to create an invoice
      const clientData = localStorage.getItem('selectedClientForInvoice');
      if (savedTab === 'createInvoice' && clientData) {
        try {
          const client = JSON.parse(clientData);
          toast({
            title: "Client Selected",
            description: `Creating invoice for ${client.name}`,
          });
        } catch (error) {
          console.error('Error parsing client data from localStorage:', error);
        }
      }
    }
  }, []);
  
  // State for upload section props using the correct FileWithPreview type
  const [companyLogo, setCompanyLogo] = useState<FileWithPreview | null>(null);
  const [companyStamp, setCompanyStamp] = useState<FileWithPreview | null>(null);
  const [signature, setSignature] = useState<FileWithPreview | null>(null);
  
  // Handler functions for form actions
  // Function takes no args for QuoteForm and InvoiceForm compatibility
  const handleSaveSuccess = () => {
    toast({
      title: "Saved Successfully",
      description: "Your document has been saved."
    });
    // Switch to the appropriate saved tab after saving
    setActiveTab(activeTab.includes('Invoice') ? 'savedInvoices' : 'savedQuotes');
  };
  
  const handleCancel = () => {
    toast({
      title: "Operation Cancelled",
      description: "Changes have been discarded."
    });
  };
  
  const handleCreateNew = (type: 'invoice' | 'quote') => {
    setActiveTab(type === 'invoice' ? 'createInvoice' : 'createQuote');
  };
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Invoices & Quotes</h1>
      
      {/* Upload Section (Common across all tabs) */}
      <UploadSection 
        companyLogo={companyLogo}
        setCompanyLogo={setCompanyLogo}
        companyStamp={companyStamp}
        setCompanyStamp={setCompanyStamp}
        signature={signature}
        setSignature={setSignature}
      />
      
      {/* Tabs */}
      <Tabs defaultValue="createQuote" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="createQuote">Create Quote</TabsTrigger>
          <TabsTrigger value="createInvoice">Create Invoice</TabsTrigger>
          <TabsTrigger value="savedQuotes">Saved Quotes</TabsTrigger>
          <TabsTrigger value="savedInvoices">Saved Invoices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="createQuote" className="mt-6">
          <QuoteForm 
            onSaveSuccess={handleSaveSuccess}
            onCancel={handleCancel}
          />
        </TabsContent>
        
        <TabsContent value="createInvoice" className="mt-6">
          <InvoiceForm 
            onSaveSuccess={handleSaveSuccess}
            onCancel={handleCancel}
          />
        </TabsContent>
        
        <TabsContent value="savedQuotes" className="mt-6">
          <SavedQuotes onCreateNew={() => handleCreateNew('quote')} />
        </TabsContent>
        
        <TabsContent value="savedInvoices" className="mt-6">
          <SavedInvoices onCreateNew={() => handleCreateNew('invoice')} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceQuoteManager;
