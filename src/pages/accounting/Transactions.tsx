
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Download, Upload, Tag, Camera, Image, FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";
import { useState, useRef, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CATEGORIES = [
  { id: "all", name: "All Categories", color: "#8E9196" },
  { id: "income", name: "Income", color: "#4CAF50" },
  { id: "expense", name: "Expense", color: "#F97316" },
  { id: "supplies", name: "Office Supplies", color: "#8B5CF6" },
  { id: "marketing", name: "Marketing", color: "#0EA5E9" },
  { id: "salary", name: "Salary", color: "#D946EF" },
  { id: "rent", name: "Rent", color: "#F59E0B" },
  { id: "utilities", name: "Utilities", color: "#10B981" },
];

const TRANSACTIONS = [...Array(8)].map((_, index) => {
  const isIncome = index % 3 === 0;
  let categoryId = isIncome ? "income" : "expense";
  
  if (!isIncome) {
    const expenseCategories = ["supplies", "marketing", "salary", "rent", "utilities"];
    categoryId = expenseCategories[index % expenseCategories.length];
  }

  return {
    id: 1000 + index,
    date: `April ${index + 1}, 2025`,
    amount: Math.random() * 1000,
    type: isIncome ? "income" : "expense",
    categoryId,
    description: isIncome ? "Client Payment" : "Business Expense",
  };
});

const AccountingTransactions = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [newTransactionOpen, setNewTransactionOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [currentImportTab, setCurrentImportTab] = useState("statement");
  const [showCameraPreview, setShowCameraPreview] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [attachmentType, setAttachmentType] = useState<string | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  const [newTransaction, setNewTransaction] = useState({
    amount: "",
    description: "",
    type: "expense",
    categoryId: "expense",
  });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Clean up camera resources when component unmounts
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Clean up camera when dialog closes
  useEffect(() => {
    if (!importDialogOpen && cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setShowCameraPreview(false);
    }
  }, [importDialogOpen, cameraStream]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction({
      ...newTransaction,
      [name]: value,
    });
  };

  const handleSubmitTransaction = () => {
    toast({
      title: "Transaction Added",
      description: `${newTransaction.type === "income" ? "Income" : "Expense"} of ${formatCurrency(parseFloat(newTransaction.amount) || 0, "ZAR")} added successfully.`,
    });
    setNewTransactionOpen(false);
    setNewTransaction({
      amount: "",
      description: "",
      type: "expense",
      categoryId: "expense",
    });
  };

  const handleImport = (type: string = "statement") => {
    toast({
      title: "Import Successful",
      description: `Your ${type === "statement" ? "transactions have" : "attachment has"} been imported successfully.`,
    });
    setImportDialogOpen(false);
    setAttachmentPreview(null);
    setAttachmentType(null);
    setShowCameraPreview(false);
    
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    
    if (type === "attachment" && selectedTransactionId) {
      toast({
        title: "Attachment Linked",
        description: `Attachment has been linked to transaction #${selectedTransactionId}.`,
      });
      setSelectedTransactionId(null);
    }
  };

  const handleExport = () => {
    toast({
      title: "Export Successful",
      description: "Your transactions have been exported successfully.",
    });
    setExportDialogOpen(false);
  };

  const filteredTransactions = TRANSACTIONS.filter(
    (transaction) =>
      selectedCategory === "all" || transaction.categoryId === selectedCategory
  );

  const getCategoryById = (id) => CATEGORIES.find((cat) => cat.id === id) || CATEGORIES[0];

  const startCamera = async () => {
    try {
      // Stop any existing stream before starting a new one
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      
      console.log("Starting camera...");
      setCameraError(""); // Clear any previous errors
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      // Store the stream in state
      setCameraStream(stream);
      
      // Set up the video element with the stream - but only after a short delay
      // to ensure the DOM has updated and the video element is available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setShowCameraPreview(true);
          console.log("Camera started successfully");
        } else {
          // If the video element is still not available, clean up and show error
          stream.getTracks().forEach(track => track.stop());
          setCameraError("Camera element not ready. Please try again.");
          console.error("Video ref is still not available after delay");
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError(`Could not access camera: ${err.message || "Please check permissions and try again."}`);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      console.log("Taking photo...");
      const canvas = document.createElement("canvas");
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setAttachmentPreview(dataUrl);
        setAttachmentType("camera");
        
        if (cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
        }
        
        setShowCameraPreview(false);
        console.log("Photo taken successfully");
      }
    } else {
      console.error("Video not ready for capture");
      setCameraError("Camera not ready. Please wait a moment and try again.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type;
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAttachmentPreview(result);
        setAttachmentType(fileType.includes('pdf') ? 'pdf' : 'image');
      };
      
      if (fileType.includes('pdf')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsDataURL(file);
      }
    }
  };

  const handleTransactionClick = (transactionId: number) => {
    setSelectedTransactionId(transactionId);
    setAttachmentDialogOpen(true);
  };

  const startAttachmentProcess = () => {
    setAttachmentDialogOpen(false);
    setImportDialogOpen(true);
    setCurrentImportTab("attachment");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-gray-500">Manage your financial transactions</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setNewTransactionOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Transaction
          </Button>
          <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-[250px_1fr] gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => {
                const category = getCategoryById(transaction.categoryId);
                return (
                  <div 
                    key={transaction.id} 
                    className="flex justify-between items-center p-4 border rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleTransactionClick(transaction.id)}
                  >
                    <div className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-md mr-4">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Transaction #{transaction.id}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <span>{transaction.date}</span>
                          <div className="flex items-center ml-3">
                            <Tag className="h-3 w-3 mr-1" />
                            <div className="flex items-center">
                              <div
                                className="w-2 h-2 rounded-full mr-1"
                                style={{ backgroundColor: category.color }}
                              ></div>
                              <span>{category.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(transaction.amount, "ZAR")}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.type === "income" ? "Income" : "Expense"}
                      </p>
                    </div>
                  </div>
                );
              })}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  No transactions found for the selected category.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={newTransactionOpen} onOpenChange={setNewTransactionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount (ZAR)
              </Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                value={newTransaction.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select
                value={newTransaction.type}
                onValueChange={(value) => setNewTransaction({...newTransaction, type: value})}
              >
                <SelectTrigger id="type" className="col-span-3">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={newTransaction.categoryId}
                onValueChange={(value) => setNewTransaction({...newTransaction, categoryId: value})}
              >
                <SelectTrigger id="category" className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.filter(cat => cat.id !== "all").map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: category.color }}
                        ></div>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newTransaction.description}
                onChange={handleInputChange}
                placeholder="Transaction details"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSubmitTransaction}>Add Transaction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={importDialogOpen} onOpenChange={(open) => {
        if (!open && cameraStream) {
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
          setShowCameraPreview(false);
        }
        setImportDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentImportTab === "statement" ? "Import Transactions" : "Attach Document to Transaction"}
            </DialogTitle>
            {currentImportTab === "statement" && (
              <DialogDescription>Upload a CSV or Excel file with your transactions</DialogDescription>
            )}
            {currentImportTab === "attachment" && (
              <DialogDescription>
                Upload a receipt or supporting document for transaction #{selectedTransactionId}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <Tabs value={currentImportTab} onValueChange={setCurrentImportTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="statement">Bank Statement</TabsTrigger>
              <TabsTrigger value="attachment">File Upload</TabsTrigger>
              <TabsTrigger value="camera">Camera</TabsTrigger>
            </TabsList>
            
            <TabsContent value="statement" className="space-y-4">
              <div className="flex justify-center">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">CSV, XLSX (MAX. 10MB)</p>
                  </div>
                  <input ref={fileInputRef} type="file" className="hidden" accept=".csv,.xlsx" />
                </label>
              </div>
              <Button type="submit" onClick={() => handleImport("statement")} className="w-full">Import</Button>
            </TabsContent>
            
            <TabsContent value="attachment" className="space-y-4">
              {attachmentPreview && attachmentType ? (
                <div className="flex flex-col items-center space-y-4">
                  {attachmentType.includes('pdf') ? (
                    <div className="flex items-center justify-center h-48 w-full bg-gray-100 rounded-md">
                      <FileText className="h-16 w-16 text-gray-400" />
                      <p className="ml-2 text-gray-500">PDF Document</p>
                    </div>
                  ) : (
                    <div className="max-h-64 overflow-hidden border rounded-md">
                      <img 
                        src={attachmentPreview} 
                        alt="Preview" 
                        className="object-contain max-h-64 w-full"
                      />
                    </div>
                  )}
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setAttachmentPreview(null);
                        setAttachmentType(null);
                      }}
                    >
                      Change
                    </Button>
                    <Button onClick={() => handleImport("attachment")}>Attach to Transaction</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-center">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> receipt or document
                        </p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG (MAX. 10MB)</p>
                      </div>
                      <input 
                        ref={fileInputRef} 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.jpg,.jpeg,.png" 
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="camera" className="space-y-4">
              {showCameraPreview ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full rounded-md overflow-hidden border">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  <Button onClick={takePhoto}>
                    <Camera className="mr-2 h-4 w-4" />
                    Take Photo
                  </Button>
                </div>
              ) : attachmentPreview && attachmentType === "camera" ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="max-h-64 overflow-hidden border rounded-md">
                    <img 
                      src={attachmentPreview} 
                      alt="Captured photo" 
                      className="object-contain max-h-64 w-full"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setAttachmentPreview(null);
                        startCamera();
                      }}
                    >
                      Retake
                    </Button>
                    <Button onClick={() => handleImport("attachment")}>Attach to Transaction</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  {cameraError && (
                    <div className="text-red-500 text-center p-2 bg-red-50 rounded-md w-full">
                      {cameraError}
                    </div>
                  )}
                  <Button onClick={startCamera}>
                    <Camera className="mr-2 h-4 w-4" />
                    Start Camera
                  </Button>
                  <p className="text-sm text-gray-500">
                    Or upload an existing photo
                  </p>
                  <Button variant="outline" onClick={() => cameraInputRef.current?.click()}>
                    <Image className="mr-2 h-4 w-4" />
                    Choose Photo
                  </Button>
                  <input 
                    ref={cameraInputRef} 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    capture="environment"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Transactions</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-gray-500">Choose a format to export your transactions.</p>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleExport} className="flex flex-col p-4 h-auto">
                <FileText className="h-6 w-6 mb-2" />
                <span>CSV</span>
              </Button>
              <Button variant="outline" onClick={handleExport} className="flex flex-col p-4 h-auto">
                <FileText className="h-6 w-6 mb-2" />
                <span>Excel</span>
              </Button>
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select defaultValue="all">
                <SelectTrigger id="date-range">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="this-year">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleExport}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={attachmentDialogOpen} onOpenChange={setAttachmentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Attach Documents</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to attach a receipt, invoice, or other documentation to Transaction #{selectedTransactionId}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={startAttachmentProcess}>Attach Document</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AccountingTransactions;
