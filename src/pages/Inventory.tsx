import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardDescription,
  HoverCardHeader,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command";
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useClient } from "@/contexts/ClientContext";
import { StatusBadge } from "@/utils/statusUtils";
import ActionMenu from "@/components/ActionMenu";

// Define the data structure for inventory items
interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  unitPrice: number;
  location: string;
  reorderPoint: number;
  image: string;
  supplier: SupplierInfo;
}

// Define the data structure for supplier information
interface SupplierInfo {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
}

// Define a Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Item name must be at least 2 characters.",
  }),
  sku: z.string().min(3, {
    message: "SKU must be at least 3 characters.",
  }),
  category: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
  quantity: z.number().min(0, {
    message: "Quantity must be at least 0.",
  }),
  unitPrice: z.number().min(0, {
    message: "Unit price must be at least 0.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  reorderPoint: z.number().min(0, {
    message: "Reorder point must be at least 0.",
  }),
  supplier: z.object({
    name: z.string().min(2, {
      message: "Supplier name must be at least 2 characters.",
    }),
    contactPerson: z.string().min(2, {
      message: "Contact person must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Invalid email address.",
    }),
    phone: z.string().min(10, {
      message: "Phone number must be at least 10 characters.",
    }),
  }),
});

const InventoryPage: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [suppliers, setSuppliers] = useState<SupplierInfo[]>([]);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editSupplier, setEditSupplier] = useState<SupplierInfo | null>(null);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  // Function to load inventory data from localStorage
  const loadInventory = useCallback(() => {
    const storedInventory = localStorage.getItem('inventory');
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory));
    }
  }, []);

  // Function to save inventory data to localStorage
  const saveInventory = (newInventory: InventoryItem[]) => {
    localStorage.setItem('inventory', JSON.stringify(newInventory));
    setInventory(newInventory);
  };

  // Load inventory on component mount
  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // Function to add a new item to the inventory
  const addItem = (item: InventoryItem) => {
    const newInventory = [...inventory, item];
    saveInventory(newInventory);
    toast({
      title: "Success",
      description: "Item added successfully",
    });
  };

  // Function to update an existing item in the inventory
  const updateItem = (updatedItem: InventoryItem) => {
    const newInventory = inventory.map(item => item.id === updatedItem.id ? updatedItem : item);
    saveInventory(newInventory);
    toast({
      title: "Success",
      description: "Item updated successfully",
    });
  };

  // Function to delete an item from the inventory
  const deleteItem = (id: string) => {
    const newInventory = inventory.filter(item => item.id !== id);
    saveInventory(newInventory);
    toast({
      title: "Success",
      description: "Item deleted successfully",
    });
  };

  // Function to generate a unique ID for new items
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Function to create a new item
  const newItem = () => {
    setCurrentItem({
      name: '',
      sku: '',
      category: '',
      quantity: 0,
      unitPrice: 0,
      location: '',
      reorderPoint: 0,
      image: '', // Add default empty image
      supplier: {
        name: '',
        contactPerson: '',
        email: '',
        phone: ''
      }
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // Function to edit an item
  const editItem = (item) => {
    setCurrentItem({
      ...item,
      image: item.image || '', // Ensure image property exists
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Function to handle form submission
  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    if (isEditMode && currentItem) {
      // Update existing item
      updateItem({ ...currentItem, ...values } as InventoryItem);
    } else {
      // Add new item
      addItem({ id: generateId(), ...values } as InventoryItem);
    }
    setIsModalOpen(false);
  };

  // Function to handle supplier form submission
  const handleSupplierSubmit = (supplier: SupplierInfo) => {
    if (editSupplier) {
      // Update existing supplier
      const newSuppliers = suppliers.map(s => s === editSupplier ? supplier : s);
      setSuppliers(newSuppliers);
    } else {
      // Add new supplier
      setSuppliers([...suppliers, supplier]);
    }
    setIsSupplierModalOpen(false);
    setEditSupplier(null);
  };

  // Function to handle supplier edit
  const handleSupplierEdit = (supplier: SupplierInfo) => {
    setEditSupplier(supplier);
    setIsSupplierModalOpen(true);
  };

  // Function to handle supplier delete
  const handleSupplierDelete = (supplier: SupplierInfo) => {
    const newSuppliers = suppliers.filter(s => s !== supplier);
    setSuppliers(newSuppliers);
  };

  // Define the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentItem?.name || "",
      sku: currentItem?.sku || "",
      category: currentItem?.category || "",
      quantity: currentItem?.quantity || 0,
      unitPrice: currentItem?.unitPrice || 0,
      location: currentItem?.location || "",
      reorderPoint: currentItem?.reorderPoint || 0,
      supplier: {
        name: currentItem?.supplier?.name || "",
        contactPerson: currentItem?.supplier?.contactPerson || "",
        email: currentItem?.supplier?.email || "",
        phone: currentItem?.supplier?.phone || "",
      },
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (currentItem) {
      form.reset({
        name: currentItem.name || "",
        sku: currentItem.sku || "",
        category: currentItem.category || "",
        quantity: currentItem.quantity || 0,
        unitPrice: currentItem.unitPrice || 0,
        location: currentItem.location || "",
        reorderPoint: currentItem.reorderPoint || 0,
        supplier: {
          name: currentItem.supplier.name || "",
          contactPerson: currentItem.supplier.contactPerson || "",
          email: currentItem.supplier.email || "",
          phone: currentItem.supplier.phone || "",
        },
      });
    }
  }, [currentItem, form]);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Inventory</CardTitle>
          <CardDescription>Manage your inventory items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Button onClick={newItem}>Add Item</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Reorder Point</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.unitPrice}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.reorderPoint}</TableCell>
                  <TableCell>{item.supplier.name}</TableCell>
                  <TableCell className="text-right">
                    <ActionMenu
                      onEdit={() => editItem(item)}
                      onDelete={() => deleteItem(item.id)}
                      itemName="inventory item"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Inventory Item Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Item' : 'Add Item'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Edit the item details below' : 'Enter the item details below'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Item name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the name of the item.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="SKU" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the item's stock keeping unit.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="Category" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the item's category.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Quantity"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the item's quantity.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Unit Price"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the item's unit price.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Location" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the item's location.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reorderPoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Point</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Reorder Point"
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the item's reorder point.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplier.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Supplier Name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the item's supplier name.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplier.contactPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Contact Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Supplier Contact Person" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the item's supplier contact person.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplier.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Supplier Email"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the item's supplier email.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="supplier.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Supplier Phone" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the item's supplier phone.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                <Button type="submit">{isEditMode ? 'Update Item' : 'Add Item'}</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
