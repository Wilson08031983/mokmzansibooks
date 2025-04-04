
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
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
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();
  const { toast: useToastHook } = useToast();
  
  const isPremiumUser = currentUser?.subscriptionStatus === "active";

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
              toast.success("Documents processed successfully!");
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
    
    // Update the file input value to trigger handleFileUpload
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
          suppliers: [
            { name: "Office Supplies SA", price: 1250, rating: 4.7, shipping: 120 },
            { name: "Corporate Furniture", price: 1499, rating: 4.8, shipping: 0 },
            { name: "Durban Office", price: 1150, rating: 4.3, shipping: 250 },
          ],
        });
      }
      
      if (searchQuery.toLowerCase().includes("laptop") || searchQuery.toLowerCase().includes("computer")) {
        results.push({
          id: 2,
          item: "Laptop - Business Grade",
          description: "15.6-inch business laptop, i7, 16GB RAM, 512GB SSD",
          suppliers: [
            { name: "Tech Solutions", price: 15499, rating: 4.6, shipping: 0 },
            { name: "Computer Warehouse", price: 14750, rating: 4.4, shipping: 150 },
            { name: "Digital World", price: 16200, rating: 4.9, shipping: 0 },
          ],
        });
      }
      
      if (searchQuery.toLowerCase().includes("printer") || searchQuery.toLowerCase().includes("scanner")) {
        results.push({
          id: 3,
          item: "Multifunction Printer",
          description: "Color laser printer with scanning and copying capabilities",
          suppliers: [
            { name: "Office Tech", price: 3899, rating: 4.2, shipping: 0 },
            { name: "PrintSolutions", price: 4250, rating: 4.5, shipping: 0 },
            { name: "Corporate Systems", price: 3750, rating: 4.0, shipping: 199 },
          ],
        });
      }
      
      if (results.length === 0) {
        // Add default results if no specific matches
        results = [
          {
            id: 1,
            item: "Office Chair - Ergonomic",
            description: "High-quality ergonomic office chair with lumbar support",
            suppliers: [
              { name: "Office Supplies SA", price: 1250, rating: 4.7, shipping: 120 },
              { name: "Corporate Furniture", price: 1499, rating: 4.8, shipping: 0 },
              { name: "Durban Office", price: 1150, rating: 4.3, shipping: 250 },
            ],
          },
          {
            id: 2,
            item: "Laptop - Business Grade",
            description: "15.6-inch business laptop, i7, 16GB RAM, 512GB SSD",
            suppliers: [
              { name: "Tech Solutions", price: 15499, rating: 4.6, shipping: 0 },
              { name: "Computer Warehouse", price: 14750, rating: 4.4, shipping: 150 },
              { name: "Digital World", price: 16200, rating: 4.9, shipping: 0 },
            ],
          },
        ];
      }
      
      setSearchResults(results);
      toast.success(`Found ${results.length} items matching your search`);
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
            suppliers: [
              { name: "Office Supplies SA", price: 1250, rating: 4.7, shipping: 120 },
              { name: "Corporate Furniture", price: 1499, rating: 4.8, shipping: 0 },
              { name: "Durban Office", price: 1150, rating: 4.3, shipping: 250 },
            ],
          },
          {
            id: 2,
            item: "Laptop - Business Grade",
            description: "15.6-inch business laptop, i7, 16GB RAM, 512GB SSD",
            suppliers: [
              { name: "Tech Solutions", price: 15499, rating: 4.6, shipping: 0 },
              { name: "Computer Warehouse", price: 14750, rating: 4.4, shipping: 150 },
              { name: "Digital World", price: 16200, rating: 4.9, shipping: 0 },
            ],
          },
          {
            id: 3,
            item: "Multifunction Printer",
            description: "Color laser printer with scanning and copying capabilities",
            suppliers: [
              { name: "Office Tech", price: 3899, rating: 4.2, shipping: 0 },
              { name: "PrintSolutions", price: 4250, rating: 4.5, shipping: 0 },
              { name: "Corporate Systems", price: 3750, rating: 4.0, shipping: 199 },
            ],
          },
        ]);
        toast.success("RFQ items extracted and prices found");
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
  
  const handleViewSupplier = (supplier: string) => {
    toast(`Viewing ${supplier} details`, {
      description: "This would typically open the supplier's website in a new tab"
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">QuickFill System</h1>
        <p className="text-gray-500">
          Streamline your tendering process with document auto-fill and price suggestions
        </p>
      </div>

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
                  Search for items from your Request for Quotation to find the best prices
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
                  Get the best prices for your RFQ items in three easy steps
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
                      Our system extracts items and searches for the best prices
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
                    <strong>Premium feature:</strong> Price comparison from multiple suppliers, including major South African retailers and distributors.
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
                  <h3 className="text-lg font-medium">Searching for prices...</h3>
                  <p className="text-gray-500 mt-1">
                    Checking multiple suppliers for the best deals
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
                  Found {searchResults.length} items with price options from multiple suppliers
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
                        <Table className="mt-2">
                          <TableHeader>
                            <TableRow>
                              <TableHead>Supplier</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Rating</TableHead>
                              <TableHead>Shipping</TableHead>
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
                                  R{supplier.price.toLocaleString()}
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
                                    : `R${supplier.shipping}`}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="mr-2"
                                    onClick={() => handleViewSupplier(supplier.name)}
                                  >
                                    View <ExternalLink className="ml-1 h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={() => handleAddToQuote(result.item, supplier.name)}
                                  >
                                    <ShoppingCart className="h-3 w-3 mr-1" /> Add
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
                    Prices are updated daily. Click "View" to see full product details.
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
    </div>
  );
};

export default QuickFill;
