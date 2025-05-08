import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileWithPreview } from "@/components/invoices/FileUploader";
import UploadSection from "@/components/invoices/UploadSection";
// Import QuoteForm directly
import QuoteForm from "@/components/invoices/QuoteForm";
import InvoiceForm from "@/components/invoices/InvoiceForm";
import SavedQuotes from "@/components/invoices/SavedQuotes";
import SavedInvoices from "@/components/invoices/SavedInvoices";
// ClientDataBridge removed as it's no longer needed
import { Plus, List, FileEdit, AlertCircle, CheckCircle2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCompany } from "@/contexts/CompanyContext";
import { getSavedInvoices } from "@/utils/invoiceUtils";

const Invoices: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { companyDetails } = useCompany();
  
  // State for file uploads - these would typically be loaded from localStorage or a backend API
  const [companyLogo, setCompanyLogo] = useState<FileWithPreview | null>(null);
  const [companyStamp, setCompanyStamp] = useState<FileWithPreview | null>(null);
  const [signature, setSignature] = useState<FileWithPreview | null>(null);
  
  // Active tab state 
  const [activeTab, setActiveTab] = useState<"quotes" | "invoices">("quotes");
  
  // View state: 'list' shows all quotes/invoices, 'create' shows form to create new one
  const [quotesView, setQuotesView] = useState<"list" | "create">("list");
  const [invoicesView, setInvoicesView] = useState<"list" | "create">("list");
  
  // Loading states
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [invoiceCount, setInvoiceCount] = useState<number>(0);
  
  // Check for query parameters to control initial view
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get('action');
    const tab = params.get('tab');
    
    // Set active tab based on URL parameter
    if (tab === 'invoices') {
      setActiveTab('invoices');
    } else if (tab === 'quotes') {
      setActiveTab('quotes');
    }
    
    // Set view based on URL parameter
    if (action === 'create') {
      if (tab === 'invoices') {
        setInvoicesView('create');
      } else if (tab === 'quotes') {
        setQuotesView('create');
      }
    }
  }, [location]);
  
  // Load invoice count on mount
  useEffect(() => {
    try {
      const invoices = getSavedInvoices();
      setInvoiceCount(invoices.length);
    } catch (error) {
      console.error('Error loading invoice count:', error);
    }
  }, [invoicesView]);  // Refresh count when view changes
  
  return (
    <div className="container mx-auto p-4">
      {/* We now only use real clients from localStorage */}
      
      <h1 className="text-3xl font-bold mb-6">Invoices & Quotes</h1>
      
      {/* Company Assets Uploads */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Company Assets</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadSection 
            companyLogo={companyLogo}
            setCompanyLogo={setCompanyLogo}
            companyStamp={companyStamp}
            setCompanyStamp={setCompanyStamp}
            signature={signature}
            setSignature={setSignature}
          />
        </CardContent>
      </Card>
      
      {/* Tabs for Quotes and Invoices */}
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={(value) => setActiveTab(value as "quotes" | "invoices")}
      >
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quotes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quotes Management</CardTitle>
              <div className="flex space-x-2">
                {quotesView === "list" ? (
                  <Button onClick={() => setQuotesView("create")}>
                    <Plus className="h-4 w-4 mr-2" /> Create New Quote
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => setQuotesView("list")}>
                    <List className="h-4 w-4 mr-2" /> View All Quotes
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {quotesView === "list" ? (
                <SavedQuotes 
                  onCreateNew={() => setQuotesView("create")} 
                  showCreateButton={false} 
                />
              ) : (
                <React.Suspense fallback={<div className="p-4">Loading quote form...</div>}>
                  <QuoteForm 
                    onSaveSuccess={() => {
                      toast({
                        title: "Quote created",
                        description: "Your quote has been saved successfully."
                      });
                      setQuotesView("list");
                    }} 
                    onCancel={() => setQuotesView("list")} 
                    isEditing={false}
                  />
                </React.Suspense>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invoices Management</CardTitle>
              <div className="flex space-x-2">
                {invoicesView === "list" ? (
                  <Button 
                    onClick={() => setInvoicesView("create")}
                  >
                    <Plus className="h-4 w-4 mr-2" /> 
                    New Invoice
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setInvoicesView("list");
                      navigate('?tab=invoices', { replace: true });
                    }}
                  >
                    <List className="h-4 w-4 mr-2" /> View All Invoices
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {invoicesView === "list" ? (
                <SavedInvoices 
                  onCreateNew={() => setInvoicesView("create")} 
                  showCreateButton={false} 
                />
              ) : (
                <InvoiceForm 
                  onSaveSuccess={() => {
                    toast({
                      title: "Invoice created",
                      description: "Your invoice has been saved successfully.",
                      variant: "default"
                    });
                    // Update invoice count
                    try {
                      const invoices = getSavedInvoices();
                      setInvoiceCount(invoices.length);
                    } catch (error) {
                      console.error('Error updating invoice count:', error);
                    }
                    // Reset view state and update URL
                    setInvoicesView("list");
                    navigate('?tab=invoices', { replace: true });
                  }} 
                  onCancel={() => setInvoicesView("list")} 
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Invoices;
