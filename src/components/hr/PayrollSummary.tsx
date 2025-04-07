
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const initialData = [
  { name: "Salaries", value: 25000, color: "#8884d8" },
  { name: "Benefits", value: 4300, color: "#82ca9d" },
  { name: "Taxes", value: 3240.25, color: "#ffc658" },
];

const detailedData = [
  { name: "Base Salaries", value: 21000, color: "#8884d8" },
  { name: "Bonuses", value: 4000, color: "#a77bdf" },
  { name: "Health Insurance", value: 2500, color: "#82ca9d" },
  { name: "Retirement", value: 1800, color: "#63be7b" },
  { name: "Income Tax", value: 2200, color: "#ffc658" },
  { name: "Social Security", value: 1040.25, color: "#ffb14a" },
];

const COLORS = ["#8884d8", "#a77bdf", "#82ca9d", "#63be7b", "#ffc658", "#ffb14a"];

const PayrollSummary = () => {
  const [isDetailed, setIsDetailed] = useState(false);
  const [data, setData] = useState(initialData);
  const { toast } = useToast();
  
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const toggleDetails = () => {
    setIsDetailed(!isDetailed);
    setData(isDetailed ? initialData : detailedData);
    
    toast({
      title: isDetailed ? "Summary View" : "Detailed View",
      description: isDetailed 
        ? "Showing summarized payroll data" 
        : "Showing detailed payroll breakdown",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Report Downloaded",
      description: "Payroll report has been downloaded as CSV",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Total Monthly Payroll: <span className="font-semibold">${total.toLocaleString()}</span>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleDetails}
          >
            <Filter className="h-4 w-4 mr-1" />
            {isDetailed ? "Summary" : "Details"}
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]} 
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <div className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span>{item.name}</span>
            </div>
            <div className="text-sm font-medium">
              ${item.value.toLocaleString()}
              <span className="text-muted-foreground ml-1">
                ({Math.round((item.value / total) * 100)}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PayrollSummary;
