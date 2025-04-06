
import { useState } from "react";
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
  Upload
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import InventoryStats from "@/components/inventory/InventoryStats";
import LowStockItems from "@/components/inventory/LowStockItems";
import BarcodeScanner from "@/components/inventory/BarcodeScanner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
    image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"
  },
  { 
    id: "INV002", 
    name: "Ergonomic Desk", 
    sku: "FURN-ED-002", 
    category: "Furniture", 
    quantity: 16, 
    unitPrice: 299.99, 
    location: "Warehouse A",
    reorderPoint: 5
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
    image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901"
  },
  { 
    id: "INV004", 
    name: "Mechanical Keyboard", 
    sku: "TECH-MK-004", 
    category: "Electronics", 
    quantity: 18, 
    unitPrice: 89.99, 
    location: "Warehouse B",
    reorderPoint: 10
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
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showScannerDialog, setShowScannerDialog] = useState(false);
  const [showImageUploadDialog, setShowImageUploadDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("items");
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  const [newItemForm, setNewItemForm] = useState({
    name: "",
    sku: "",
    category: "",
    quantity: 0,
    unitPrice: 0,
    location: "",
    reorderPoint: 0,
    image: ""
  });
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(mockInventoryData);
  
  const filteredItems = inventoryItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBarcodeScanned = (barcode: string) => {
    // In a real app, we would look up the barcode in a database
    // For this demo, we'll just pre-fill the SKU field and open the add item dialog
    setNewItemForm({
      ...newItemForm,
      sku: barcode
    });
    setShowAddItemDialog(true);
    
    toast({
      title: "Barcode Scanned",
      description: `Item with barcode ${barcode} ready to be added`,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewItemForm({
      ...newItemForm,
      [id]: id === 'quantity' || id === 'unitPrice' || id === 'reorderPoint' 
        ? parseFloat(value) || 0 
        : value
    });
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
      image: newItemForm.image
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
      image: ""
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // In a real app, we would upload the file to a storage service
    // For this demo, we'll create a local URL
    const imageUrl = URL.createObjectURL(file);
    
    if (activeItem) {
      // Updating existing item
      const updatedItems = inventoryItems.map(item => 
        item.id === activeItem.id ? { ...item, image: imageUrl } : item
      );
      setInventoryItems(updatedItems);
      
      toast({
        title: "Image Updated",
        description: `Image for ${activeItem.name} has been updated`,
      });
    } else {
      // Adding to new item form
      setNewItemForm({
        ...newItemForm,
        image: imageUrl
      });
    }
    
    setShowImageUploadDialog(false);
    setActiveItem(null);
  };

  const openImageUploadDialog = (item?: InventoryItem) => {
    if (item) {
      setActiveItem(item);
    }
    setShowImageUploadDialog(true);
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
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
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
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Adjust Stock
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openImageUploadDialog(item)}>
                                  <ImageIcon className="mr-2 h-4 w-4" />
                                  Change Image
                                </DropdownMenuItem>
                                <DropdownMenuItem>
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

      {/* Add Inventory Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent className="sm:max-w-[525px]">
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
            <DialogTitle>Upload Product Image</DialogTitle>
            <DialogDescription>
              Select an image file to upload for this product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
    </div>
  );
};

export default Inventory;
