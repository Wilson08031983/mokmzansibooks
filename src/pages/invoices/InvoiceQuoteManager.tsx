
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

const InvoiceQuoteManager = () => {
  // Active tab state
  const [activeTab, setActiveTab] = useState("createQuote");
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Invoices & Quotes</h1>
      
      {/* Upload Section (Common across all tabs) */}
      <UploadSection />
      
      {/* Tabs */}
      <Tabs defaultValue="createQuote" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="createQuote">Create Quote</TabsTrigger>
          <TabsTrigger value="createInvoice">Create Invoice</TabsTrigger>
          <TabsTrigger value="savedQuotes">Saved Quotes</TabsTrigger>
          <TabsTrigger value="savedInvoices">Saved Invoices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="createQuote" className="mt-6">
          <QuoteForm />
        </TabsContent>
        
        <TabsContent value="createInvoice" className="mt-6">
          <InvoiceForm />
        </TabsContent>
        
        <TabsContent value="savedQuotes" className="mt-6">
          <SavedQuotes />
        </TabsContent>
        
        <TabsContent value="savedInvoices" className="mt-6">
          <SavedInvoices />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceQuoteManager;
