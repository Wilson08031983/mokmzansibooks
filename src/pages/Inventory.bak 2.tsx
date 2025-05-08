import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Package, 
  Plus, 
  FileText, 
  MoreVertical, 
  Edit, 
  Trash, 
  Filter, 
  ArrowUpDown, 
  Search,
  AlertTriangle,
  Camera,
  Barcode,
  Image as ImageIcon,
  Upload,
  Building,
  UserRound,
  Minus
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import InventoryStats from "@/components/inventory/InventoryStats";
import LowStockItems from "@/components/inventory/LowStockItems";
import BarcodeScanner from "@/components/inventory/BarcodeScanner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNotifications } from "@/contexts/NotificationsContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui/alert";

interface SupplierInfo {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  location: string;
  reorderPoint: number;
  image?: string;
  supplier?: SupplierInfo;
}

const mockInventoryData: InventoryItem[] = [
  { 
    id: "INV001", 
    name: "Office Chair", 
    sku: "FURN-OC-001", 
    category: "Furniture", 
    quantity: 24, 
    unitPrice: 149.99, 
    location: "Warehouse A",
    reorderPoint: 10,
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
    supplier: {
      name: "Office Furniture Inc.",
      contactPerson: "John Smith",
      email: "john@officefurn.com",
      phone: "+27 12 345 6789"
    }
  },
  { 
    id: "INV002", 
    name: "Ergonomic Desk", 
    sku: "FURN-ED-002", 
    category: "Furniture", 
    quantity: 16, 
    unitPrice: 299.99, 
    location: "Warehouse A",
    reorderPoint: 5,
    supplier: {
      name: "Office Furniture Inc.",
      contactPerson: "John Smith",
      email: "john@officefurn.com",
      phone: "+27 12 345 6789"
    }
  },
  { 
    id: "INV003", 
    name: "Wireless Mouse", 
    sku: "TECH-WM-003", 
    category: "Electronics", 
    quantity: 42, 
    unitPrice: 29.99, 
    location: "Warehouse B",
    reorderPoint: 15,
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
    supplier: {
      name: "TechSupply Co.",
      contactPerson: "Sarah Johnson",
      email: "sarah@techsupply.co.za",
      phone: "+27 21 456 7890"
    }
  },
  { 
    id: "INV004", 
    name: "Mechanical Keyboard", 
    sku: "TECH-MK-004", 
    category: "Electronics", 
    quantity: 18, 
    unitPrice: 89.99, 
    location: "Warehouse B",
    reorderPoint: 10,
    supplier: {
      name: "TechSupply Co.",
      contactPerson: "Sarah Johnson",
      email: "sarah@techsupply.co.za",
      phone: "+27 21 456 7890"
    }
  },
  { 
    id: "INV005", 
    name: "Printer Paper (500 sheets)", 
    sku: "SUPP-PP-005", 
    category: "Supplies", 
    quantity: 8, 
    unitPrice: 5.99, 
    location: "Warehouse C",
    reorderPoint: 20
  },
  { 
    id: "INV006", 
    name: "Ballpoint Pens (Box of 12)", 
    sku: "SUPP-BP-006", 
    category: "Supplies", 
    quantity: 32, 
    unitPrice: 3.99, 
    location: "Warehouse C",
    reorderPoint: 15,
    image: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07"
  },
];

const Inventory = () => {
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showScannerDialog, setShowScannerDialog] = useState(false);
  const [showImageUploadDialog, setShowImageUploadDialog] = useState(false);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [showEditItemDialog, setShowEditItemDialog] = useState(false);
  const [showAdjustStockDialog, setShowAdjustStockDialog] = useState(false);
  const [showItemHistoryDialog, setShowItemHistoryDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("items");
  
  // Initialize inventory items state with mock data
  const [inventoryItems, setInventoryItems] = useState(mockInventoryData);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemHistory, setItemHistory] = useState<Array<{
    date: string;
    action: string;
    quantity: number;
    user: string;
    notes?: string;
  }>>([]);
  const [newItemForm, setNewItemForm] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: 0,
    unitPrice: 0,
    location: "",
    reorderPoint: 0,
    image: "",
    supplier: {
      name: "",
      contactPerson: "",
      email: "",
      phone: ""
    }
  });
  
  const filteredItems = useMemo(() => 
    inventoryItems.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [inventoryItems, searchTerm]
  );

  // Check for low stock items and create notifications on initial load
  useEffect(() => {
    const lowStockItems = inventoryItems.filter(item => item.quantity <= item.reorderPoint);
    
    if (lowStockItems.length > 0) {
      addNotification({
        title: "Low Stock Alert",
        message: `${lowStockItems.length} items are at or below reorder point.`,
        type: "warning",
        link: "/inventory?tab=low-stock"
      });
    }
  }, []);

  // State for barcode processing dialog
  const [showBarcodeProcessDialog, setShowBarcodeProcessDialog] = useState(false);
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [isExistingProduct, setIsExistingProduct] = useState(false);
  const [expiryDateNotApplicable, setExpiryDateNotApplicable] = useState(false);
  const [quantityToAdd, setQuantityToAdd] = useState(1);
  const [expiryDate, setExpiryDate] = useState('');
  const [foundItem, setFoundItem] = useState<InventoryItem | null>(null);

  const handleBarcodeScanned = (barcode: string) => {
    // Check if the barcode exists in our inventory
    const existingItem = inventoryItems.find(item => item.sku === barcode);
    setScannedBarcode(barcode);
    
    if (existingItem) {
      // Found existing product
      setIsExistingProduct(true);
      setFoundItem(existingItem);
      setShowBarcodeProcessDialog(true);
      
      toast({
        title: "Product Found",
        description: `Found: ${existingItem.name}`,
      });
    } else {
      // New product - pre-fill the SKU field and open the add item dialog
      setIsExistingProduct(false);
      setFoundItem(null);
      setNewItemForm({
        ...newItemForm,
        sku: barcode
      });
      setShowBarcodeProcessDialog(true);
      
      toast({
        title: "New Product",
        description: `Barcode ${barcode} not found. Please add product details.`,
      });
    }
  };
  
  const handleProcessBarcodeComplete = () => {
    if (isExistingProduct && foundItem) {
      // Update existing item quantity
      const updatedItems = inventoryItems.map(item => {
        if (item.id === foundItem.id) {
          const newQuantity = item.quantity + quantityToAdd;
          
          // Check if stock is low after update
          if (newQuantity <= item.reorderPoint) {
            toast({
              title: "Low Stock Warning",
              description: `${item.name} is below reorder point (${newQuantity} remaining)`,
              variant: "warning"
            });
          }
          
          // Add expiry date logic here if needed
          return {
            ...item,
            quantity: newQuantity,
            // Store expiry date if applicable
            expiryDate: expiryDateNotApplicable ? undefined : expiryDate
          };
        }
        return item;
      });
      
      setInventoryItems(updatedItems);
      toast({
        title: "Inventory Updated",
        description: `Added ${quantityToAdd} units of ${foundItem.name}`,
        variant: "success"
      });
    } else {
      // For new items, open the add dialog with pre-filled barcode
      setShowAddItemDialog(true);
    }
    
    // Reset the form
    setShowBarcodeProcessDialog(false);
    setQuantityToAdd(1);
    setExpiryDate('');
    setExpiryDateNotApplicable(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    
    // Handle nested supplier fields
    if (id.startsWith('supplier.')) {
      const supplierField = id.split('.')[1];
      setNewItemForm({
        ...newItemForm,
        supplier: {
          ...newItemForm.supplier,
          [supplierField]: value
        }
      });
    } else {
      // Handle other fields
      setNewItemForm({
        ...newItemForm,
        [id]: id === 'quantity' || id === 'unitPrice' || id === 'reorderPoint' 
          ? parseFloat(value) || 0 
          : value
      });
    }
  };

  const handleAddItem = () => {
    // In a real app, we would add the item to the database
    const newItem: InventoryItem = {
      id: `INV${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: newItemForm.name,
      sku: newItemForm.sku,
      category: newItemForm.category,
      quantity: newItemForm.quantity,
      unitPrice: newItemForm.unitPrice,
      location: newItemForm.location,
      reorderPoint: newItemForm.reorderPoint,
      image: newItemForm.image,
      supplier: newItemForm.supplier.name ? {
        name: newItemForm.supplier.name,
        contactPerson: newItemForm.supplier.contactPerson,
        email: newItemForm.supplier.email,
        phone: newItemForm.supplier.phone
      } : undefined
    };
    
    setInventoryItems([...inventoryItems, newItem]);
    
    toast({
      title: "Item Added",
      description: `${newItemForm.name} has been added to inventory`,
    });
    setShowAddItemDialog(false);
    setNewItemForm({
      name: "",
      sku: "",
      category: "",
      quantity: 0,
      unitPrice: 0,
      location: "",
      reorderPoint: 0,
      image: "",
      supplier: {
        name: "",
        contactPerson: "",
        email: "",
        phone: ""
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, we would upload the file to a storage service
    // For this demo, we'll create a local URL
    const imageUrl = URL.createObjectURL(file);
    
    if (selectedItem) {
      // Updating existing item
      const updatedItems = inventoryItems.map(item => 
        item.id === selectedItem.id ? { ...item, image: imageUrl } : item
      );
      setInventoryItems(updatedItems);
      
      toast({
        title: "Image Updated",
        description: `Image for ${selectedItem.name} has been updated`,
      });
    } else {
      // Adding to new item form
      setNewItemForm({
        ...newItemForm,
        image: imageUrl
      });
    }
    
    setShowImageUploadDialog(false);
    setSelectedItem(null);
  };

  const openImageUploadDialog = (item?: InventoryItem) => {
    if (item) {
      setSelectedItem(item);
    }
    setShowImageUploadDialog(true);
  };

  const openSupplierDialog = (item?: InventoryItem) => {
    if (item) {
      setSelectedItem(item);
    } else {
      setSelectedItem(null);
    }
    setShowSupplierDialog(true);
  };

  const handleUpdateSupplier = () => {
    if (!selectedItem) return;
    
    const updatedItems = inventoryItems.map(item => 
      item.id === selectedItem.id 
        ? { 
            ...item, 
            supplier: {
              name: newItemForm.supplier.name,
              contactPerson: newItemForm.supplier.contactPerson,
              email: newItemForm.supplier.email,
              phone: newItemForm.supplier.phone
            } 
          } 
        : item
    );
    
    setInventoryItems(updatedItems);
    
    toast({
      title: "Supplier Updated",
      description: `Supplier information for ${selectedItem.name} has been updated`,
    });
    
    setShowSupplierDialog(false);
    setSelectedItem(null);
  };

  const editSupplier = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewItemForm({
      ...newItemForm,
      supplier: {
        name: item.supplier?.name || "",
        contactPerson: item.supplier?.contactPerson || "",
        email: item.supplier?.email || "",
        phone: item.supplier?.phone || ""
      }
    });
    setShowSupplierDialog(true);
  };

  const editItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewItemForm({
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      location: item.location,
      reorderPoint: item.reorderPoint,
      supplier: item.supplier || {
        name: '',
        contactPerson: '',
        email: '',
        phone: ''
      }
    });
    setShowEditItemDialog(true);
  };

  const adjustStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowAdjustStockDialog(true);
  };

  const viewHistory = (item: InventoryItem) => {
    setSelectedItem(item);
    
    // In a real app, we would fetch the item's history from a database
    // For this demo, we'll generate some mock history data
    const mockHistory = [
      {
        date: '2025-05-01T10:30:00',
        action: 'Stock Added',
        quantity: 10,
        user: 'Wilson Moabelo',
        notes: 'Regular inventory replenishment'
      },
      {
        date: '2025-04-25T14:15:00',
        action: 'Stock Adjusted',
        quantity: -2,
        user: 'Thabo Mkhize',
        notes: 'Damaged items removed'
      },
      {
        date: '2025-04-20T09:45:00',
        action: 'Stock Count',
        quantity: 15,
        user: 'Lerato Ndlovu',
        notes: 'Monthly inventory audit'
      },
      {
        date: '2025-04-15T16:20:00',
        action: 'Stock Added',
        quantity: 20,
        user: 'Wilson Moabelo',
        notes: 'New shipment received'
      }
    ];
    
    setItemHistory(mockHistory);
    setShowItemHistoryDialog(true);
  };

  const handleSaveEditedItem = () => {
    if (!selectedItem) return;
    
    const updatedItems = inventoryItems.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          name: newItemForm.name,
          sku: newItemForm.sku,
          category: newItemForm.category,
          unitPrice: newItemForm.unitPrice,
          location: newItemForm.location,
          reorderPoint: newItemForm.reorderPoint,
          supplier: newItemForm.supplier
        };
      }
      return item;
    });
    
    setInventoryItems(updatedItems);
    setShowEditItemDialog(false);
    
    toast({
      title: "Item Updated",
      description: `${newItemForm.name} has been updated successfully.`,
      variant: "success"
    });
  };

  const [stockAdjustment, setStockAdjustment] = useState({
    quantity: 0,
    reason: '',
    notes: ''
  });

  const handleStockAdjustment = () => {
    if (!selectedItem) return;
    
    const updatedItems = inventoryItems.map(item => {
      if (item.id === selectedItem.id) {
        const newQuantity = item.quantity + stockAdjustment.quantity;
        
        // Check if stock is low after adjustment
        if (newQuantity <= item.reorderPoint) {
          toast({
            title: "Low Stock Warning",
            description: `${item.name} is below reorder point (${newQuantity} remaining)`,
            variant: "warning"
          });
        }
        
        return {
          ...item,
          quantity: newQuantity
        };
      }
      return item;
    });
    
    setInventoryItems(updatedItems);
    setShowAdjustStockDialog(false);
    
    // Reset adjustment form
    setStockAdjustment({
      quantity: 0,
      reason: '',
      notes: ''
    });
    
    toast({
      title: "Stock Adjusted",
      description: `${selectedItem.name} stock has been adjusted by ${stockAdjustment.quantity}.`,
      variant: "success"
    });
  };

  const [supplierFormData, setSupplierFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: ''
  } as SupplierInfo);

  // Edit supplier handler
  const editSupplier = (item: InventoryItem) => {
    setSelectedItem(item);
    setSupplierFormData({
      name: item.supplier?.name || '',
      contactPerson: item.supplier?.contactPerson || '',
      email: item.supplier?.email || '',
      phone: item.supplier?.phone || ''
    } as SupplierInfo);
    setShowSupplierDialog(true);
  };

  const editItem = (item: InventoryItem) => {
    setSelectedItem(item);
    setNewItemForm({
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      location: item.location,
      reorderPoint: item.reorderPoint,
      supplier: item.supplier || {
        name: '',
        contactPerson: '',
        email: '',
        phone: ''
      }
    });
    setShowEditItemDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your inventory items, stock levels, and categories
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowScannerDialog(true)} variant="outline">
            <Barcode className="mr-2 h-4 w-4" />
            Scan Barcode
          </Button>
          <Button onClick={() => setShowAddItemDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <InventoryStats />

      <Tabs defaultValue="items" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="items">All Items</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
        </TabsList>
        
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Furniture</DropdownMenuItem>
                      <DropdownMenuItem>Electronics</DropdownMenuItem>
                      <DropdownMenuItem>Supplies</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ArrowUpDown className="mr-2 h-4 w-4" />
                        Sort
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Name (A-Z)</DropdownMenuItem>
                      <DropdownMenuItem>Name (Z-A)</DropdownMenuItem>
                      <DropdownMenuItem>Quantity (Low-High)</DropdownMenuItem>
                      <DropdownMenuItem>Quantity (High-Low)</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Item</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No items found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <Avatar className="h-9 w-9 border">
                                  <AvatarImage src={item.image} alt={item.name} />
                                  <AvatarFallback>
                                    <Package className="h-4 w-4 text-muted-foreground" />
                                  </AvatarFallback>
                                </Avatar>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="h-9 w-9 rounded-full"
                                  onClick={() => openImageUploadDialog(item)}
                                >
                                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              )}
                              {item.name}
                            </div>
                          </TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center gap-2">
                              {item.quantity}
                              {item.quantity <= item.reorderPoint && (
                                <AlertTriangle className="h-4 w-4 text-amber-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.unitPrice, "ZAR")}
                          </TableCell>
                          <TableCell>{item.location}</TableCell>
                          <TableCell>
                            {item.supplier ? (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="px-2 h-7 text-xs flex items-center gap-1"
                                onClick={() => editSupplier(item)}
                              >
                                <Building className="h-3 w-3" />
                                {item.supplier.name}
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="px-2 h-7 text-xs"
                                onClick={() => editSupplier(item)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Supplier
                              </Button>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => editItem(item)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => adjustStock(item)}>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Adjust Stock
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openImageUploadDialog(item)}>
                                  <ImageIcon className="mr-2 h-4 w-4" />
                                  Change Image
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => editSupplier(item)}>
                                  <Building className="mr-2 h-4 w-4" />
                                  Edit Supplier
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => viewHistory(item)}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View History
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between pt-3">
              <div className="text-sm text-muted-foreground">
                Showing {filteredItems.length} of {inventoryItems.length} items
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>
                Organize your inventory with categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {['Furniture', 'Electronics', 'Supplies'].map(category => (
                  <Card key={category}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{category}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">
                        {inventoryItems.filter(item => item.category === category).length}
                      </p>
                      <p className="text-sm text-muted-foreground">items</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" size="sm" className="w-full">
                        View Items
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="low-stock" className="space-y-4">
          <LowStockItems items={inventoryItems.filter(item => item.quantity <= item.reorderPoint)} />
        </TabsContent>
      </Tabs>

      {/* Barcode Scanner Dialog */}
      <BarcodeScanner 
        open={showScannerDialog} 
        onOpenChange={setShowScannerDialog} 
        onScan={handleBarcodeScanned} 
      />

      {/* Barcode Processing Dialog */}
      <Dialog open={showBarcodeProcessDialog} onOpenChange={setShowBarcodeProcessDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isExistingProduct ? 'Update Inventory' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {isExistingProduct 
                ? `Update inventory for: ${foundItem?.name}` 
                : `Add details for new product with barcode: ${scannedBarcode}`}
            </DialogDescription>
          </DialogHeader>

          {isExistingProduct && foundItem ? (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                  {foundItem.image ? (
                    <img 
                      src={foundItem.image} 
                      alt={foundItem.name} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{foundItem.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    SKU: {foundItem.sku} | Current Stock: {foundItem.quantity}
                  </p>
                  {foundItem.quantity <= foundItem.reorderPoint && (
                    <Badge variant="destructive" className="mt-1">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Low Stock
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="quantity">Quantity to Add</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantityToAdd}
                    onChange={(e) => setQuantityToAdd(parseInt(e.target.value) || 1)}
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <Label htmlFor="expiry-date">Expiry Date</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="not-applicable"
                        checked={expiryDateNotApplicable}
                        onChange={(e) => setExpiryDateNotApplicable(e.target.checked)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="not-applicable" className="text-xs cursor-pointer">
                        Not Applicable
                      </Label>
                    </div>
                  </div>
                  <Input
                    id="expiry-date"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    disabled={expiryDateNotApplicable}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-center mb-4">
                Product with barcode <span className="font-medium">{scannedBarcode}</span> not found.
              </p>
              <Button 
                className="w-full" 
                onClick={() => {
                  setShowBarcodeProcessDialog(false);
                  setShowAddItemDialog(true);
                }}
              >
                Add New Product Details
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBarcodeProcessDialog(false)}>
              Cancel
            </Button>
            {isExistingProduct && (
              <Button onClick={handleProcessBarcodeComplete}>
                Update Inventory
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Inventory Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>
              Enter the details of the new inventory item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Item Name
              </Label>
              <Input 
                id="name" 
                className="col-span-3" 
                value={newItemForm.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sku" className="text-right">
                SKU / Barcode
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input 
                  id="sku" 
                  className="flex-1" 
                  value={newItemForm.sku}
                  onChange={handleInputChange}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowScannerDialog(true)}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Input 
                id="category" 
                className="col-span-3"
                value={newItemForm.category}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantity
              </Label>
              <Input 
                id="quantity" 
                type="number" 
                className="col-span-3"
                value={newItemForm.quantity}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unitPrice" className="text-right">
                Unit Price (ZAR)
              </Label>
              <Input 
                id="unitPrice" 
                type="number" 
                step="0.01" 
                className="col-span-3"
                value={newItemForm.unitPrice}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input 
                id="location" 
                className="col-span-3"
                value={newItemForm.location}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reorderPoint" className="text-right">
                Reorder Point
              </Label>
              <Input 
                id="reorderPoint" 
                type="number" 
                className="col-span-3"
                value={newItemForm.reorderPoint}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Product Image</Label>
              <div className="col-span-3 flex items-center gap-4">
                {newItemForm.image ? (
                  <div className="relative">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={newItemForm.image} alt="Product" />
                      <AvatarFallback>
                        <Package className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-md border flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => openImageUploadDialog()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="supplier">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Supplier Information
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="supplier.name" className="text-right">
                        Supplier Name
                      </Label>
                      <Input 
                        id="supplier.name" 
                        className="col-span-3"
                        value={newItemForm.supplier.name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="supplier.contactPerson" className="text-right">
                        Contact Person
                      </Label>
                      <Input 
                        id="supplier.contactPerson" 
                        className="col-span-3"
                        value={newItemForm.supplier.contactPerson}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="supplier.email" className="text-right">
                        Email
                      </Label>
                      <Input 
                        id="supplier.email" 
                        type="email"
                        className="col-span-3"
                        value={newItemForm.supplier.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="supplier.phone" className="text-right">
                        Phone
                      </Label>
                      <Input 
                        id="supplier.phone" 
                        className="col-span-3"
                        value={newItemForm.supplier.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>Save Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Upload Dialog */}
      <Dialog open={showImageUploadDialog} onOpenChange={setShowImageUploadDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? `Update Image: ${selectedItem.name}` : 'Add Product Image'}
            </DialogTitle>
            <DialogDescription>
              Upload a new image for this product
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to browse or drag and drop
                </p>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Label 
                  htmlFor="image-upload" 
                  className="mt-4 inline-flex items-center justify-center cursor-pointer"
                >
                  <Button type="button">
                    <Upload className="mr-2 h-4 w-4" />
                    Select Image
                  </Button>
                </Label>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Supports JPG, PNG and GIF up to 5MB
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImageUploadDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplier Dialog */}
      <Dialog open={showSupplierDialog} onOpenChange={setShowSupplierDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              {activeItem ? `Edit Supplier for ${activeItem.name}` : 'Add Supplier Information'}
            </DialogTitle>
            <DialogDescription>
              Enter the supplier details for this inventory item.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier.name" className="text-right">
                Supplier Name
              </Label>
              <Input 
                id="supplier.name" 
                className="col-span-3"
                value={newItemForm.supplier.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier.contactPerson" className="text-right">
                Contact Person
              </Label>
              <Input 
                id="supplier.contactPerson" 
                className="col-span-3"
                value={newItemForm.supplier.contactPerson}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier.email" className="text-right">
                Email
              </Label>
              <Input 
                id="supplier.email" 
                type="email"
                className="col-span-3"
                value={newItemForm.supplier.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier.phone" className="text-right">
                Phone
              </Label>
              <Input 
                id="supplier.phone" 
                className="col-span-3"
                value={newItemForm.supplier.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSupplierDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSupplier}>Save Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={showEditItemDialog} onOpenChange={setShowEditItemDialog}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? `Edit Item: ${selectedItem.name}` : 'Edit Item'}
            </DialogTitle>
            <DialogDescription>
              Update the details of this inventory item
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Item Name
              </Label>
              <Input 
                id="edit-name" 
                name="name"
                className="col-span-3" 
                value={newItemForm.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-sku" className="text-right">
                SKU / Barcode
              </Label>
              <Input 
                id="edit-sku" 
                name="sku"
                className="col-span-3" 
                value={newItemForm.sku}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-category" className="text-right">
                Category
              </Label>
              <Input 
                id="edit-category" 
                name="category"
                className="col-span-3" 
                value={newItemForm.category}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-unitPrice" className="text-right">
                Unit Price
              </Label>
              <Input 
                id="edit-unitPrice" 
                name="unitPrice"
                type="number"
                className="col-span-3" 
                value={newItemForm.unitPrice}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-location" className="text-right">
                Location
              </Label>
              <Input 
                id="edit-location" 
                name="location"
                className="col-span-3" 
                value={newItemForm.location}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-reorderPoint" className="text-right">
                Reorder Point
              </Label>
              <Input 
                id="edit-reorderPoint" 
                name="reorderPoint"
                type="number"
                className="col-span-3" 
                value={newItemForm.reorderPoint}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditedItem}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Stock Dialog */}
      <Dialog open={showAdjustStockDialog} onOpenChange={setShowAdjustStockDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? `Adjust Stock: ${selectedItem.name}` : 'Adjust Stock'}
            </DialogTitle>
            <DialogDescription>
              {selectedItem && `Current stock: ${selectedItem.quantity} units`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="adjustment-quantity">Quantity Adjustment</Label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setStockAdjustment(prev => ({ ...prev, quantity: prev.quantity - 1 }))}
                  disabled={stockAdjustment.quantity <= -selectedItem?.quantity!}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input 
                  id="adjustment-quantity" 
                  type="number"
                  className="text-center" 
                  value={stockAdjustment.quantity}
                  onChange={(e) => setStockAdjustment(prev => ({ 
                    ...prev, 
                    quantity: parseInt(e.target.value) || 0 
                  }))}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setStockAdjustment(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {stockAdjustment.quantity > 0 
                  ? `Adding ${stockAdjustment.quantity} units` 
                  : stockAdjustment.quantity < 0 
                    ? `Removing ${Math.abs(stockAdjustment.quantity)} units` 
                    : 'No change'}
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adjustment-reason">Reason</Label>
              <select 
                id="adjustment-reason"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={stockAdjustment.reason}
                onChange={(e) => setStockAdjustment(prev => ({ ...prev, reason: e.target.value }))}
              >
                <option value="">Select a reason...</option>
                <option value="New Stock">New Stock</option>
                <option value="Damaged">Damaged</option>
                <option value="Expired">Expired</option>
                <option value="Stock Count">Stock Count</option>
                <option value="Return">Return</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adjustment-notes">Notes (Optional)</Label>
              <textarea
                id="adjustment-notes"
                className="min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={stockAdjustment.notes}
                onChange={(e) => setStockAdjustment(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional details about this adjustment..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdjustStockDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleStockAdjustment}
              disabled={stockAdjustment.quantity === 0 || !stockAdjustment.reason}
            >
              Confirm Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Item History Dialog */}
      <Dialog open={showItemHistoryDialog} onOpenChange={setShowItemHistoryDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {selectedItem ? `History: ${selectedItem.name}` : 'Item History'}
            </DialogTitle>
            <DialogDescription>
              View the transaction history for this item
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itemHistory.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      {new Date(record.date).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.quantity >= 0 ? "success" : "destructive"}>
                        {record.action}
                      </Badge>
                    </TableCell>
                    <TableCell className={record.quantity >= 0 ? "text-green-600" : "text-red-600"}>
                      {record.quantity > 0 ? `+${record.quantity}` : record.quantity}
                    </TableCell>
                    <TableCell>{record.user}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{record.notes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowItemHistoryDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
