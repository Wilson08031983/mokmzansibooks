
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  Search,
  FileUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShoppingCart,
  ArrowRight,
  ExternalLink,
  Download,
  Plus,
  Edit,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { formatCurrency } from "@/utils/formatters";
import { QuoteData } from "@/types/quote";

const QuickFill = () => {
  const [activeTab, setActiveTab] = useState("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; status: string; type: string }[]>([]);
  const [processingStatus, setProcessingStatus] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [generatedForms, setGeneratedForms] = useState<boolean>(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteData | null>(null);
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemDiscount, setItemDiscount] = useState(0);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [attachedQuote, setAttachedQuote] = useState<QuoteData | null>(null);
  const [isAutoSearchDone, setIsAutoSearchDone] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();
  const { toast: useToastHook } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isPremiumUser = currentUser?.subscriptionStatus === "active";

  // Check if there's an attached quote in the location state
  useEffect(() => {
    if (location.state?.attachedQuote && !isAutoSearchDone) {
      const quote = location.state.attachedQuote;
      setAttachedQuote(quote);
      setActiveTab("rfq");
      toast.info("Found attached quote", {
        description: `Automatically searching for items in quote ${quote.quoteNumber}`
      });
      
      // Auto-search for items in the quote
      autoSearchQuoteItems(quote);
      setIsAutoSearchDone(true);
    }
  }, [location, isAutoSearchDone]);

  // Function to automatically search for items in the attached quote
  const autoSearchQuoteItems = (quote: QuoteData) => {
    if (!quote || !quote.items || quote.items.length === 0) return;
    
    setIsSearching(true);
    
    // Create a batch of search queries based on quote items
    setTimeout(() => {
      // Simulate searching for each item in the quote
      const results: any[] = [];
      
      quote.items.forEach(item => {
        const searchTerms = item.description.toLowerCase();
        
        // Add search results based on the item description
        if (searchTerms.includes("chair") || searchTerms.includes("office")) {
          results.push({
            id: Math.random().toString(36).substr(2, 9),
            item: item.description,
            description: `Based on quote item: ${item.description}`,
            priceCheckUrl: "https://www.pricecheck.co.za/search?search=" + encodeURIComponent(item.description),
            googleShoppingUrl: "https://shopping.google.co.za/search?q=" + encodeURIComponent(item.description),
            suppliers: [
              { name: "Incredible Connection", price: Math.round(item.amount * 0.9), rating: 4.5, shipping: 150, url: "https://www.incredible.co.za", source: "PriceCheck" },
              { name: "Takealot", price: Math.round(item.amount * 0.85), rating: 4.7, shipping: 0, url: "https://www.takealot.com", source: "PriceCheck" },
              { name: "Office National", price: Math.round(item.amount * 0.95), rating: 4.8, shipping: 0, url: "https://www.officenational.co.za", source: "PriceCheck" },
              { name: "Game", price: Math.round(item.amount * 0.8), rating: 4.4, shipping: 99, url: "https://www.game.co.za", source: "Google Shopping" },
              { name: "Makro", price: Math.round(item.amount * 0.92), rating: 4.6, shipping: 0, url: "https://www.makro.co.za", source: "Google Shopping" },
            ],
          });
        } else if (searchTerms.includes("laptop") || searchTerms.includes("computer")) {
          results.push({
            id: Math.random().toString(36).substr(2, 9),
            item: item.description,
            description: `Based on quote item: ${item.description}`,
            priceCheckUrl: "https://www.pricecheck.co.za/search?search=" + encodeURIComponent(item.description),
            googleShoppingUrl: "https://shopping.google.co.za/search?q=" + encodeURIComponent(item.description),
            suppliers: [
              { name: "Evetech", price: Math.round(item.amount * 0.92), rating: 4.6, shipping: 0, url: "https://www.evetech.co.za", source: "PriceCheck" },
              { name: "Wootware", price: Math.round(item.amount * 0.97), rating: 4.8, shipping: 0, url: "https://www.wootware.co.za", source: "PriceCheck" },
              { name: "Takealot", price: Math.round(item.amount * 1.03), rating: 4.5, shipping: 0, url: "https://www.takealot.com", source: "PriceCheck" },
              { name: "Technomobi", price: Math.round(item.amount * 0.89), rating: 4.4, shipping: 0, url: "https://www.technomobi.co.za", source: "Google Shopping" },
              { name: "Incredible Connection", price: Math.round(item.amount * 0.99), rating: 4.7, shipping: 0, url: "https://www.incredible.co.za", source: "Google Shopping" },
            ],
          });
        } else if (searchTerms.includes("printer") || searchTerms.includes("scanner")) {
          results.push({
            id: Math.random().toString(36).substr(2, 9),
            item: item.description,
            description: `Based on quote item: ${item.description}`,
            priceCheckUrl: "https://www.pricecheck.co.za/search?search=" + encodeURIComponent(item.description),
            googleShoppingUrl: "https://shopping.google.co.za/search?q=" + encodeURIComponent(item.description),
            suppliers: [
              { name: "Takealot", price: Math.round(item.amount * 0.91), rating: 4.2, shipping: 0, url: "https://www.takealot.com", source: "PriceCheck" },
              { name: "Incredible Connection", price: Math.round(item.amount * 0.98), rating: 4.5, shipping: 150, url: "https://www.incredible.co.za", source: "PriceCheck" },
              { name: "Game", price: Math.round(item.amount * 0.85), rating: 4.0, shipping: 250, url: "https://www.game.co.za", source: "PriceCheck" },
              { name: "Makro", price: Math.round(item.amount * 0.88), rating: 4.3, shipping: 0, url: "https://www.makro.co.za", source: "Google Shopping" },
              { name: "Loot", price: Math.round(item.amount * 0.96), rating: 4.1, shipping: 0, url: "https://www.loot.co.za", source: "Google Shopping" },
            ],
          });
        } else {
          // Generic result for any other type of item
          results.push({
            id: Math.random().toString(36).substr(2, 9),
            item: item.description,
            description: `Based on quote item: ${item.description}`,
            priceCheckUrl: "https://www.pricecheck.co.za/search?search=" + encodeURIComponent(item.description),
            googleShoppingUrl: "https://shopping.google.co.za/search?q=" + encodeURIComponent(item.description),
            suppliers: [
              { name: "Takealot", price: Math.round(item.amount * 0.92), rating: 4.5, shipping: 0, url: "https://www.takealot.com", source: "PriceCheck" },
              { name: "Incredible Connection", price: Math.round(item.amount * 0.98), rating: 4.3, shipping: 150, url: "https://www.incredible.co.za", source: "PriceCheck" },
              { name: "Makro", price: Math.round(item.amount * 0.85), rating: 4.4, shipping: 0, url: "https://www.makro.co.za", source: "Google Shopping" },
              { name: "Game", price: Math.round(item.amount * 0.88), rating: 4.2, shipping: 99, url: "https://www.game.co.za", source: "Google Shopping" },
            ],
          });
        }
      });
      
      setIsSearching(false);
      setSearchResults(results);
      
      if (results.length > 0) {
        toast.success(`Found ${results.length} items matching your quote from top South African retailers`);
      } else {
        toast.error("No matching products found for the quote items");
      }
    }, 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const nextProgress = prev + 10;
        if (nextProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newFiles = Array.from(files).map((file) => ({
              name: file.name,
              status: "success",
              type: file.type.includes("pdf") ? "PDF" : "Document",
            }));
            setUploadedFiles([...uploadedFiles, ...newFiles]);
            setIsUploading(false);
            setProcessingStatus("processing");
            
            setTimeout(() => {
              setProcessingStatus("completed");
              
              // Check if we have a quote file in the uploaded files
              const hasQuoteFile = newFiles.some(file => 
                file.name.toLowerCase().includes('quote') || 
                file.name.toLowerCase().includes('rfq')
              );
              
              if (hasQuoteFile) {
                toast.success("Documents processed successfully! Found quote document in uploads.");
                
                // Simulate finding a quote in the uploaded documents
                setTimeout(() => {
                  const simulatedQuote: QuoteData = {
                    quoteNumber: "Q-2023-003",
                    issueDate: "2023-06-01",
                    expiryDate: "2023-07-01",
                    client: {
                      name: "Digital Solutions Inc.",
                      address: "456 Tech Avenue, Sandton",
                      email: "info@digitalsolutions.co.za",
                      phone: "+27 11 555 6789"
                    },
                    company: {
                      name: "Morwa Moabelo (Pty) Ltd",
                      address: "456 Business Park, Pretoria",
                      email: "mokgethwamoabelo@gmail.com",
                      phone: "+27 64 550 4029"
                    },
                    items: [
                      {
                        description: "HP OfficeJet Pro MFP Printer",
                        quantity: 2,
                        amount: 3499,
                      },
                      {
                        description: "Dell Latitude Business Laptop i7",
                        quantity: 3,
                        amount: 15999,
                      },
                      {
                        description: "Ergonomic Office Chair - Premium",
                        quantity: 5,
                        amount: 2499,
                      }
                    ],
                    subtotal: 57492,
                    tax: 8624,
                    total: 66116
                  };
                  
                  setAttachedQuote(simulatedQuote);
                  setActiveTab("rfq");
                  toast.info("Quote extracted from documents", {
                    description: `Automatically searching for items from Quote ${simulatedQuote.quoteNumber}`
                  });
                  
                  // Auto-search for items in the quote
                  autoSearchQuoteItems(simulatedQuote);
                  setIsAutoSearchDone(true);
                }, 1500);
              } else {
                toast.success("Documents processed successfully!");
              }
            }, 2000);
          }, 500);
        }
        return nextProgress;
      });
    }, 300);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    if (fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      for (let i = 0; i < files.length; i++) {
        dataTransfer.items.add(files[i]);
      }
      fileInputRef.current.files = dataTransfer.files;
      handleFileUpload({ target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleSearch = () => {
    if (!isPremiumUser) {
      useToastHook({
        title: "Premium Feature",
        description: "The RFQ price search is only available on the Premium plan.",
        variant: "destructive",
      });
      return;
    }
    
    if (!searchQuery.trim()) {
      toast.error("Please enter search terms");
      return;
    }
    
    setIsSearching(true);
    setSearchResults([]);
    
    setTimeout(() => {
      setIsSearching(false);
      let results = [];
      
      if (searchQuery.toLowerCase().includes("chair") || searchQuery.toLowerCase().includes("office")) {
        results.push({
          id: 1,
          item: "Office Chair - Ergonomic",
          description: "High-quality ergonomic office chair with lumbar support",
          priceCheckUrl: "https://www.pricecheck.co.za/search?search=ergonomic+office+chair",
          googleShoppingUrl: "https://shopping.google.co.za/search?q=ergonomic+office+chair",
          suppliers: [
            { name: "Incredible Connection", price: 1899, rating: 4.5, shipping: 150, url: "https://www.incredible.co.za", source: "PriceCheck" },
            { name: "Takealot", price: 1699, rating: 4.7, shipping: 0, url: "https://www.takealot.com", source: "PriceCheck" },
            { name: "Office National", price: 2150, rating: 4.8, shipping: 0, url: "https://www.officenational.co.za", source: "PriceCheck" },
            { name: "Game", price: 1599, rating: 4.4, shipping: 99, url: "https://www.game.co.za", source: "Google Shopping" },
            { name: "Makro", price: 1849, rating: 4.6, shipping: 0, url: "https://www.makro.co.za", source: "Google Shopping" },
          ],
        });
      }
      
      if (searchQuery.toLowerCase().includes("laptop") || searchQuery.toLowerCase().includes("computer")) {
        results.push({
          id: 2,
          item: "Laptop - Business Grade",
          description: "15.6-inch business laptop, i7, 16GB RAM, 512GB SSD",
          priceCheckUrl: "https://www.pricecheck.co.za/search?search=business+laptop+i7",
          googleShoppingUrl: "https://shopping.google.co.za/search?q=business+laptop+i7+16gb+512gb",
          suppliers: [
            { name: "Evetech", price: 15999, rating: 4.6, shipping: 0, url: "https://www.evetech.co.za", source: "PriceCheck" },
            { name: "Wootware", price: 16599, rating: 4.8, shipping: 0, url: "https://www.wootware.co.za", source: "PriceCheck" },
            { name: "Takealot", price: 17450, rating: 4.5, shipping: 0, url: "https://www.takealot.com", source: "PriceCheck" },
            { name: "Technomobi", price: 15799, rating: 4.4, shipping: 0, url: "https://www.technomobi.co.za", source: "Google Shopping" },
            { name: "Incredible Connection", price: 16999, rating: 4.7, shipping: 0, url: "https://www.incredible.co.za", source: "Google Shopping" },
          ],
        });
      }
      
      if (searchQuery.toLowerCase().includes("printer") || searchQuery.toLowerCase().includes("scanner")) {
        results.push({
          id: 3,
          item: "Multifunction Printer",
          description: "Color laser printer with scanning and copying capabilities",
          priceCheckUrl: "https://www.pricecheck.co.za/search?search=multifunction+laser+printer",
          googleShoppingUrl: "https://shopping.google.co.za/search?q=multifunction+color+laser+printer",
          suppliers: [
            { name: "Takealot", price: 4299, rating: 4.2, shipping: 0, url: "https://www.takealot.com", source: "PriceCheck" },
            { name: "Incredible Connection", price: 4599, rating: 4.5, shipping: 150, url: "https://www.incredible.co.za", source: "PriceCheck" },
            { name: "Game", price: 3999, rating: 4.0, shipping: 250, url: "https://www.game.co.za", source: "PriceCheck" },
            { name: "Makro", price: 4150, rating: 4.3, shipping: 0, url: "https://www.makro.co.za", source: "Google Shopping" },
            { name: "Loot", price: 4499, rating: 4.1, shipping: 0, url: "https://www.loot.co.za", source: "Google Shopping" },
          ],
        });
      }
      
      if (results.length === 0) {
        results = [
          {
            id: 1,
            item: "Office Chair - Ergonomic",
            description: "High-quality ergonomic office chair with lumbar support",
            priceCheckUrl: "https://www.pricecheck.co.za/search?search=ergonomic+office+chair",
            googleShoppingUrl: "https://shopping.google.co.za/search?q=ergonomic+office+chair",
            suppliers: [
              { name: "Incredible Connection", price: 1899, rating: 4.5, shipping: 150, url: "https://www.incredible.co.za", source: "PriceCheck" },
              { name: "Takealot", price: 1699, rating: 4.7, shipping: 0, url: "https://www.takealot.com", source: "PriceCheck" },
              { name: "Office National", price: 2150, rating: 4.8, shipping: 0, url: "https://www.officenational.co.za", source: "PriceCheck" },
              { name: "Game", price: 1599, rating: 4.4, shipping: 99, url: "https://www.game.co.za", source: "Google Shopping" },
              { name: "Makro", price: 1849, rating: 4.6, shipping: 0, url: "https://www.makro.co.za", source: "Google Shopping" },
            ],
          },
          {
            id: 2,
            item: "Laptop - Business Grade",
            description: "15.6-inch business laptop, i7, 16GB RAM, 512GB SSD",
            priceCheckUrl: "https://www.pricecheck.co.za/search?search=business+laptop+i7",
            googleShoppingUrl: "https://shopping.google.co.za/search?q=business+laptop+i7+16gb+512gb",
            suppliers: [
              { name: "Evetech", price: 15999, rating: 4.6, shipping: 0, url: "https://www.evetech.co.za", source: "PriceCheck" },
              { name: "Wootware", price: 16599, rating: 4.8, shipping: 0, url: "https://www.wootware.co.za", source: "PriceCheck" },
              { name: "Takealot", price: 17450, rating: 4.5, shipping: 0, url: "https://www.takealot.com", source: "PriceCheck" },
              { name: "Technomobi", price: 15799, rating: 4.4, shipping: 0, url: "https://www.technomobi.co.za", source: "Google Shopping" },
              { name: "Incredible Connection", price: 16999, rating: 4.7, shipping: 0, url: "https://www.incredible.co.za", source: "Google Shopping" },
            ],
          },
        ];
      }
      
      setSearchResults(results);
      toast.success(`Found ${results.length} items matching your search from top South African retailers`);
    }, 2000);
  };

  const handleRfqUpload = () => {
    toast.success("RFQ document uploaded successfully");
    
    setTimeout(() => {
      setIsSearching(true);
      
      setTimeout(() => {
        setIsSearching(false);
        setSearchResults([
          {
            id: 1,
            item: "Office Chair - Ergonomic",
            description: "High-quality ergonomic office chair with lumbar support",
            priceCheckUrl: "https://www.pricecheck.co.za/search?search=ergonomic+office+chair",
            googleShoppingUrl: "https://shopping.google.co.za/search?q=ergonomic+office+chair",
            suppliers: [
              { name: "Incredible Connection", price: 1899, rating: 4.5, shipping: 150, url: "https://www.incredible.co.za", source: "PriceCheck" },
              { name: "Takealot", price: 1699, rating: 4.7, shipping: 0, url: "https://www.takealot.com", source: "PriceCheck" },
              { name: "Office National", price: 2150, rating: 4.8, shipping: 0, url: "https://www.officenational.co.za", source: "PriceCheck" },
              { name: "Game", price: 1599, rating: 4.4, shipping: 99, url: "https://www.game.co.za", source: "Google Shopping" },
              { name: "Makro", price: 1849, rating: 4.6, shipping: 0, url: "https://www.makro.co.za", source: "Google Shopping" },
            ],
          },
          {
            id: 2,
            item: "Laptop - Business Grade",
            description: "15.6-inch business laptop, i7, 16GB RAM, 512GB SSD",
            priceCheckUrl: "https://www.pricecheck.co.za/search?search=business+laptop+i7",
            googleShoppingUrl: "https://shopping.google.co.za/search?q=business+laptop+i7+16gb+512gb",
            suppliers: [
              { name: "Evetech", price: 15999, rating: 4.6, shipping: 0, url: "https://www.evetech.co.za", source: "PriceCheck" },
              { name: "Wootware", price: 16599, rating: 4.8, shipping: 0, url: "https://www.wootware.co.za", source: "PriceCheck" },
              { name: "Takealot", price: 17450, rating: 4.5, shipping: 0, url: "https://www.takealot.com", source: "PriceCheck" },
              { name: "Technomobi", price: 15799, rating: 4.4, shipping: 0, url: "https://www.technomobi.co.za", source: "Google Shopping" },
              { name: "Incredible Connection", price: 16999, rating: 4.7, shipping: 0, url: "https://www.incredible.co.za", source: "Google Shopping" },
            ],
          },
          {
            id: 3,
            item: "Multifunction Printer",
            description: "Color laser printer with scanning and copying capabilities",
            priceCheckUrl: "https://www.pricecheck.co.za/search?search=multifunction+laser+printer",
            googleShoppingUrl: "https://shopping.google.co.za/search?q=multifunction+color+laser+printer",
            suppliers: [
              { name: "Takealot", price: 4299, rating: 4.2, shipping: 0, url: "https://www.takealot.com", source: "PriceCheck" },
              { name: "Incredible Connection", price: 4599, rating: 4.5, shipping: 150, url: "https://www.incredible.co.za", source: "PriceCheck" },
              { name: "Game", price: 3999, rating: 4.0, shipping: 250, url: "https://www.game.co.za", source: "PriceCheck" },
              { name: "Makro", price: 4150, rating: 4.3, shipping: 0, url: "https://www.makro.co.za", source: "Google Shopping" },
              { name: "Loot", price: 4499, rating: 4.1, shipping: 0, url: "https://www.loot.co.za", source: "Google Shopping" },
            ],
          },
        ]);
        toast.success("RFQ items extracted and prices found from South African retailers");
      }, 3000);
    }, 1000);
  };

  const handleDownloadAllForms = () => {
    toast.success("All forms downloaded as ZIP file");
  };

  const handleDownloadForm = (formName: string) => {
    toast.success(`${formName} downloaded successfully`);
  };

  const handleViewForm = (formName: string) => {
    toast.success(`Previewing ${formName}`);
  };

  const handleEditForm = (formName: string) => {
    toast.success(`Editing ${formName}`);
  };

  const handleGeneratePriceReport = () => {
    toast.success("Price comparison report generated");
    
    setTimeout(() => {
      toast("Price Report Ready", {
        description: "Your price comparison report has been generated and is ready to download",
        action: {
          label: "Download",
          onClick: () => toast.success("Report downloaded")
        },
      });
    }, 2000);
  };

  const handleAddToQuote = (item: string, supplier: string) => {
    toast.success(`Added ${item} from ${supplier} to your quote`);
  };

  const handleViewPriceCheck = (priceCheckUrl: string, googleShoppingUrl: string, source: string = "pricecheck") => {
    const url = source.toLowerCase() === "google" ? googleShoppingUrl : priceCheckUrl;
    window.open(url, '_blank');
    toast.success(`Viewing price comparisons on ${source === "google" ? "Google Shopping" : "PriceCheck.co.za"}`);
  };

  const handleViewSupplier = (supplier: string, url: string) => {
    window.open(url, '_blank');
    toast(`Viewing ${supplier} website`, {
      description: "Opening the supplier's website in a new tab"
    });
  };

  const generateFormsFromUploadedFiles = () => {
    if (processingStatus !== "completed") {
      toast.error("Please upload and process documents first");
      return;
    }
    
    setGeneratedForms(true);
    toast.success("Forms generated successfully");
  };

  const fetchQuotes = () => {
    const mockQuotes: QuoteData[] = [
      {
        quoteNumber: "Q-2023-001",
        issueDate: "2023-04-01",
        expiryDate: "2023-05-01",
        client: {
          name: "ABC Corporation",
          address: "123 Main St, Johannesburg",
          email: "contact@abccorp.co.za",
          phone: "+27 11 123 4567"
        },
        company: {
          name: "Morwa Moabelo (Pty) Ltd",
          address: "456 Business Park, Pretoria",
          email: "mokgethwamoabelo@gmail.com",
          phone: "+27 64 550 4029"
        },
        items: [
          {
            description: "Consulting Services",
            quantity: 10,
            amount: 5000,
          }
        ],
        subtotal: 5000,
        tax: 750,
        total: 5750
      },
      {
        quoteNumber: "Q-2023-002",
        issueDate: "2023-04-15",
        expiryDate: "2023-05-15",
        client: {
          name: "Tech Solutions Ltd",
          address: "789 Tech Park, Cape Town",
          email: "info@techsolutions.co.za",
          phone: "+27 21 987 6543"
        },
        company: {
          name: "Morwa Moabelo (Pty) Ltd",
          address: "456 Business Park, Pretoria",
          email: "mokgethwamoabelo@gmail.com",
          phone: "+27 64 550 4029"
        },
        items: [
          {
            description: "IT Support Package",
            quantity: 1,
            amount: 12000,
          }
        ],
        subtotal: 12000,
        tax: 1800,
        total: 13800
      }
    ];
    
    // If we have an attached quote, add it to the list
    if (attachedQuote) {
      mockQuotes.push(attachedQuote);
    }
    
    setQuotes(mockQuotes);
  };

  const handleLinkToQuote = (item: any, supplier: any) => {
    setSelectedItem(item);
    setSelectedSupplier(supplier);
    fetchQuotes();
    setIsQuoteDialogOpen(true);
  };

  const handleSelectQuote = (quote: QuoteData) => {
    setSelectedQuote(quote);
  };

  const handleUpdateQuote = () => {
    if (!selectedQuote || !selectedItem || !selectedSupplier) {
      toast.error("Please select a quote and product");
      return;
    }

    const discountAmount = selectedSupplier.price * (itemDiscount / 100);
    const discountedPrice = selectedSupplier.price - discountAmount;
    const totalAmount = discountedPrice * itemQuantity;

    const newItem = {
      description: `${selectedItem.item} - ${selectedItem.description} (${selectedSupplier.name})`,
      quantity: itemQuantity,
      unitPrice: selectedSupplier.price,
      discount: itemDiscount,
      amount: totalAmount,
      websiteUrl: selectedSupplier.url,
    };

    toast.success(`Added ${selectedItem.item} to Quote ${selectedQuote.quoteNumber}`);
    setIsQuoteDialogOpen(false);

    setItemQuantity(1);
    setItemDiscount(0);
    setSelectedQuote(null);

    navigate("/invoices/quotes", { 
      state: { 
        fromQuickFill: true,
        quoteNumber: selectedQuote.quoteNumber,
        addedItem: newItem
      } 
    });

    setTimeout(() => {
      navigate("/quickfill");
      toast.success(`Updated Quote ${selectedQuote.quoteNumber} successfully`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">QuickFill System</h1>
        <p className="text-gray-500">
          Streamline your tendering process with document auto-fill and South African price comparisons
        </p>
      </div>

      {attachedQuote && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-medium">Working with Quote: {attachedQuote.quoteNumber}</h3>
                <p className="text-sm text-muted-foreground">
                  Client: {attachedQuote.client.name} | Total: {formatCurrency(attachedQuote.total, "ZAR")}
                </p>
              </div>
              <Badge variant="outline" className="border-primary text-primary">
                {attachedQuote.items.length} items
              </Badge>
            </div>
            
            <div className="mt-4">
              <p className="text-sm">
                Automatically searching for the best prices for items in this quote from South African retailers.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs
        defaultValue="upload"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="upload">
            <Upload className="mr-2 h-4 w-4" /> Document Upload & Auto-Fill
          </TabsTrigger>
          <TabsTrigger value="rfq">
            <Search className="mr-2 h-4 w-4" /> RFQ Search & Pricing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Upload Documents</CardTitle>
                <CardDescription>
                  Upload your company registration documents, tax clearance, and other certificates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <Label
                    htmlFor="documentUpload"
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FileUp className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, DOCX, PNG or JPG (MAX. 10MB)
                      </p>
                    </div>
                    <Input
                      id="documentUpload"
                      type="file"
                      className="hidden"
                      multiple
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      accept=".pdf,.docx,.png,.jpg"
                      ref={fileInputRef}
                    />
                  </Label>
                </div>
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h3 className="text-sm font-medium">Uploaded Documents</h3>
                    <ul className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-500" />
                            <span className="text-sm">{file.name}</span>
                          </div>
                          <Badge
                            variant={file.status === "success" ? "outline" : "default"}
                            className={file.status === "success" ? "border-green-500 text-green-500" : ""}
                          >
                            {file.status === "success" ? (
                              <span className="flex items-center">
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Success
                              </span>
                            ) : (
                              file.status
                            )}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-xs text-gray-500">
                  {isPremiumUser ? (
                    <span className="flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" /> Premium features unlocked
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1 text-amber-500" /> Limited features in trial version
                    </span>
                  )}
                </div>
                <Button
                  disabled={uploadedFiles.length === 0 || processingStatus === "processing"}
                  onClick={generateFormsFromUploadedFiles}
                >
                  {processingStatus === "processing" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                    </>
                  ) : (
                    <>
                      Generate Forms <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Step 2: Auto-Fill Forms</CardTitle>
                <CardDescription>
                  The system extracts information from your documents to auto-fill tender forms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className={`p-4 rounded-md bg-gray-50 h-64 overflow-y-auto ${
                    processingStatus === "completed" ? "" : "opacity-50"
                  }`}
                >
                  {processingStatus === "completed" ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium mb-2">Extracted Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-500">Company Name</p>
                            <p className="text-sm font-medium">Morwa Moabelo (Pty) Ltd</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Registration Number</p>
                            <p className="text-sm font-medium">2018/421571/07</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Director</p>
                            <p className="text-sm font-medium">Wilson Mokgethwa Moabelo</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Phone Number</p>
                            <p className="text-sm font-medium">+27 64 550 4029</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Email</p>
                            <p className="text-sm font-medium">mokgethwamoabelo@gmail.com</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Tax Status</p>
                            <p className="text-sm font-medium">Compliant</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">B-BBEE Level</p>
                            <p className="text-sm font-medium">Level 1</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">CSD Registration</p>
                            <p className="text-sm font-medium">MAAA0123456</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : processingStatus === "processing" ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
                      <p className="text-sm text-gray-500">Processing documents...</p>
                      <p className="text-xs text-gray-400 mt-1">
                        Extracting information and mapping data
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <FileText className="h-10 w-10 mb-2" />
                      <p className="text-sm">Upload documents to see extracted data</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <div className="text-xs text-gray-500 w-full">
                  <div className="flex items-center justify-between">
                    <span>Data extraction accuracy</span>
                    <span>{processingStatus === "completed" ? "92%" : "0%"}</span>
                  </div>
                  <Progress
                    value={processingStatus === "completed" ? 92 : 0}
                    className="h-1 mt-1"
                  />
                </div>
              </CardFooter>
            </Card>
          </div>

          {processingStatus === "completed" && generatedForms && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Forms</CardTitle>
                <CardDescription>
                  The following tender forms have been pre-populated with your information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-primary mr-2" />
                        <span className="font-medium">SBD 1</span>
                      </div>
                      <Badge variant="outline" className="border-green-500 text-green-500">
                        Completed
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Invitation to Bid
                    </p>
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleViewForm("SBD 1")}>
                        Preview
                      </Button>
                      <Button size="sm" onClick={() => handleDownloadForm("SBD 1")}>
                        <Download className="mr-2 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-primary mr-2" />
                        <span className="font-medium">SBD 4</span>
                      </div>
                      <Badge variant="outline" className="border-green-500 text-green-500">
                        Completed
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Declaration of Interest
                    </p>
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleViewForm("SBD 4")}>
                        Preview
                      </Button>
                      <Button size="sm" onClick={() => handleDownloadForm("SBD 4")}>
                        <Download className="mr-2 h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <div className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-primary mr-2" />
                        <span className="font-medium">SBD 6.1</span>
                      </div>
                      <Badge variant="outline" className="border-amber-500 text-amber-500">
                        Needs Review
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      B-BBEE Status
                    </p>
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleViewForm("SBD 6.1")}>
                        Preview
                      </Button>
                      <Button size="sm" onClick={() => handleEditForm("SBD 6.1")}>
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <p className="text-sm text-gray-500">
                    All mandatory forms are pre-populated. Review and make any necessary adjustments before submission.
                  </p>
                  <Button onClick={handleDownloadAllForms}>
                    <Download className="mr-2 h-4 w-4" />
                    Download All Forms
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rfq" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>RFQ Item Search</CardTitle>
                <CardDescription>
                  Search for items from your Request for Quotation to find the best prices from South African suppliers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rfqUpload">Upload RFQ Document</Label>
                  <div className="flex mt-1.5">
                    <Input
                      id="rfqUpload"
                      type="file"
                      accept=".pdf,.docx,.xlsx"
                    />
                    <Button className="ml-2" onClick={handleRfqUpload}>
                      <FileUp className="mr-2 h-4 w-4" /> Upload
                    </Button>
                  </div>
                </div>
                <div className="relative mt-6">
                  <Label htmlFor="itemSearch">Or search for items manually</Label>
                  <div className="flex mt-1.5">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                      <Input
                        id="itemSearch"
                        placeholder="e.g., Office Chair, Laptop, Printer..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Button className="ml-2" onClick={handleSearch}>
                      Search
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Label className="text-sm">Search Sources:</Label>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="cursor-pointer">
                      PriceCheck.co.za
                    </Badge>
                    <Badge variant="outline" className="cursor-pointer">
                      Google Shopping
                    </Badge>
                  </div>
                </div>
                {!isPremiumUser && (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-3 mt-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          Premium Feature
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          The RFQ price search is only available on the Premium plan.{" "}
                          <Button variant="link" className="h-auto p-0 text-xs text-primary" asChild>
                            <Link to="/payment">Upgrade now</Link>
                          </Button>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>
                  Get the best prices from South African retailers in three easy steps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-medium">Upload or Enter</h3>
                    <p className="text-sm text-gray-500">
                      Upload your RFQ document or enter items manually
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-medium">Automatic Parsing</h3>
                    <p className="text-sm text-gray-500">
                      Our system extracts items and searches PriceCheck.co.za and Google Shopping for the best prices
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-medium">Compare and Select</h3>
                    <p className="text-sm text-gray-500">
                      Compare suppliers by price, rating, and delivery options
                    </p>
                  </div>
                </div>
                <div className="rounded-md bg-gray-50 p-3 mt-2">
                  <p className="text-sm text-gray-600">
                    <strong>Premium feature:</strong> Price comparison from top South African retailers like Takealot, Incredible Connection, and more.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {isSearching && (
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                  <h3 className="text-lg font-medium">Searching for prices across South African retailers...</h3>
                  <p className="text-gray-500 mt-1">
                    Checking PriceCheck.co.za and Google Shopping for the best deals
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Price Comparison Results</CardTitle>
                <CardDescription>
                  {attachedQuote 
                    ? `Found ${searchResults.length} items from Quote ${attachedQuote.quoteNumber} with price options from top South African retailers`
                    : `Found ${searchResults.length} items with price options from top South African retailers`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {searchResults.map((result) => (
                    <AccordionItem key={result.id} value={`item-${result.id}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex flex-1 items-center justify-between pr-4">
                          <div className="text-left">
                            <div className="font-medium">{result.item}</div>
                            <div className="text-sm text-gray-500">{result.description}</div>
                          </div>
                          <div className="hidden md:block text-sm text-gray-500">
                            {result.suppliers.length} suppliers
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="mb-2">
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              variant="outline" 
                              className="text-sm" 
                              onClick={() => handleViewPriceCheck(result.priceCheckUrl, "", "pricecheck")}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" /> 
                              View on PriceCheck.co.za
                            </Button>
                            <Button 
                              variant="outline" 
                              className="text-sm" 
                              onClick={() => handleViewPriceCheck("", result.googleShoppingUrl, "google")}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" /> 
                              View on Google Shopping
                            </Button>
                          </div>
                        </div>
                        <Table className="mt-2">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Supplier</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Rating</TableHead>
                              <TableHead>Shipping</TableHead>
                              <TableHead>Source</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {result.suppliers.map((supplier, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {supplier.name}
                                </TableCell>
                                <TableCell>
                                  {formatCurrency(supplier.price, "ZAR")}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <span className="text-amber-500">★</span>{" "}
                                    {supplier.rating.toFixed(1)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {supplier.shipping === 0
                                    ? "Free"
                                    : formatCurrency(supplier.shipping, "ZAR")}
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={supplier.source === "Google Shopping" ? "bg-blue-50" : "bg-amber-50"}>
                                    {supplier.source}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mr-2"
                                    onClick={() => handleViewSupplier(supplier.name, supplier.url)}
                                  >
                                    View <ExternalLink className="ml-1 h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleLinkToQuote(result, supplier)}
                                  >
                                    <FileText className="h-3 w-3 mr-1" /> Link to Quote
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
              <CardFooter>
                <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <p className="text-sm text-gray-500">
                    Prices are updated daily from PriceCheck.co.za and Google Shopping. Click "View" to see full product details.
                  </p>
                  <Button onClick={handleGeneratePriceReport}>
                    Generate Price Report
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isQuoteDialogOpen} onOpenChange={setIsQuoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Link to Quote</DialogTitle>
            <DialogDescription>
              Select a quote to add this item to and update the quantity and discount.
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="py-4">
              <h3 className="font-medium text-sm">Selected Item:</h3>
              <p>{selectedItem.item} - {selectedSupplier?.name}</p>
              <p className="text-sm text-muted-foreground">
                Price: {formatCurrency(selectedSupplier?.price || 0, "ZAR")}
              </p>
              {selectedSupplier?.source && (
                <Badge variant="outline" className="mt-1">
                  Source: {selectedSupplier.source}
                </Badge>
              )}
            </div>
          )}
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quote">Select Quote</Label>
              <div className="grid gap-2">
                {quotes.map((quote) => (
                  <div 
                    key={quote.quoteNumber}
                    className={`p-3 border rounded-md cursor-pointer ${
                      selectedQuote?.quoteNumber === quote.quoteNumber 
                        ? "border-primary bg-primary/5" 
                        : ""
                    }`}
                    onClick={() => handleSelectQuote(quote)}
                  >
                    <div className="font-medium">{quote.quoteNumber}</div>
                    <div className="text-sm text-muted-foreground">
                      Client: {quote.client.name} | 
                      Total: {formatCurrency(quote.total, "ZAR")}
                    </div>
                  </div>
                ))}
                {quotes.length === 0 && (
                  <div className="text-center p-4 text-muted-foreground">
                    No quotes found
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  value={itemDiscount}
                  onChange={(e) => setItemDiscount(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            
            {selectedQuote && selectedItem && selectedSupplier && (
              <div className="p-3 bg-muted rounded-md">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedSupplier.price * itemQuantity, "ZAR")}</span>
                </div>
                {itemDiscount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Discount ({itemDiscount}%):</span>
                    <span>-{formatCurrency((selectedSupplier.price * itemQuantity) * (itemDiscount / 100), "ZAR")}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium mt-1 pt-1 border-t">
                  <span>Total:</span>
                  <span>
                    {formatCurrency(
                      (selectedSupplier.price * itemQuantity) * (1 - itemDiscount / 100), 
                      "ZAR"
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setIsQuoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateQuote}
              disabled={!selectedQuote}
            >
              Update Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickFill;
