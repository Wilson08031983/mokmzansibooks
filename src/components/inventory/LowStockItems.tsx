
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
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, Plus, Image as ImageIcon, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/utils/formatters";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useEffect } from "react";

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

interface LowStockItemsProps {
  items: InventoryItem[];
}

const LowStockItems = ({ items }: LowStockItemsProps) => {
  const { addNotification } = useNotifications();

  // Add notifications for low stock items
  useEffect(() => {
    if (items.length > 0) {
      // Only notify for items that are critically low (less than half of reorder point)
      const criticalItems = items.filter(item => item.quantity <= item.reorderPoint / 2);
      
      if (criticalItems.length > 0) {
        addNotification({
          title: "Critical Low Stock Alert",
          message: `${criticalItems.length} items are critically low on stock and need immediate attention.`,
          type: "warning",
          link: "/inventory"
        });
      }
    }
  }, [items, addNotification]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
          <CardTitle>Low Stock Items</CardTitle>
        </div>
        <CardDescription>
          Items that have reached or fallen below their reorder point
        </CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Package className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No low stock items found</p>
            <p className="text-xs text-muted-foreground">All your inventory is at healthy levels</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Quantity</TableHead>
                  <TableHead className="text-right">Reorder Point</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(item => (
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
                          <div className="h-9 w-9 rounded-full border flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        {item.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-amber-500">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.reorderPoint}
                    </TableCell>
                    <TableCell>{item.location}</TableCell>
                    <TableCell>
                      {item.supplier?.name ? (
                        <span className="text-sm">{item.supplier.name}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">No supplier</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-1" />
                        Restock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {items.length} items that need attention
        </p>
        <Button variant="outline" size="sm">View All Inventory</Button>
      </CardFooter>
    </Card>
  );
};

export default LowStockItems;
