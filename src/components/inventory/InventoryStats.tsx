
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Package, ArrowUp, ArrowDown, DollarSign } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";

const InventoryStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Items
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">142</div>
          <p className="text-xs text-muted-foreground">
            Across 6 categories
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Value
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(24538.25, "ZAR")}</div>
          <div className="flex items-center text-xs text-green-500">
            <ArrowUp className="mr-1 h-3 w-3" />
            5.2% from last month
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Stock Movements
          </CardTitle>
          <ArrowUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+87</div>
          <div className="flex items-center text-xs text-green-500">
            <ArrowUp className="mr-1 h-3 w-3" />
            12% increase
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Low Stock Items
          </CardTitle>
          <ArrowDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">9</div>
          <div className="flex items-center text-xs text-red-500">
            <ArrowUp className="mr-1 h-3 w-3" />
            3 more than last week
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryStats;
