
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Filter, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";
import { format } from "date-fns";

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
  const [isExporting, setIsExporting] = useState(false);
  const csvLinkRef = useRef<HTMLAnchorElement>(null);
  
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
    setIsExporting(true);
    
    try {
      // Prepare the data for CSV export
      const currentData = isDetailed ? detailedData : initialData;
      const headers = ["Category", "Amount", "Percentage"];
      
      // Calculate percentages for each item
      const csvData = currentData.map(item => {
        const percentage = ((item.value / total) * 100).toFixed(2);
        return [
          item.name,
          formatCurrency(item.value),
          `${percentage}%`
        ];
      });
      
      // Add a total row
      csvData.push(["Total", formatCurrency(total), "100.00%"]);
      
      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
      ].join("\n");
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      
      // Create a link element if it doesn't exist
      if (!csvLinkRef.current) {
        const link = document.createElement("a");
        link.style.display = "none";
        document.body.appendChild(link);
        csvLinkRef.current = link;
      }
      
      // Set up the download
      const fileName = `payroll_summary_${format(new Date(), "yyyy-MM-dd")}.csv`;
      csvLinkRef.current.href = url;
      csvLinkRef.current.setAttribute("download", fileName);
      csvLinkRef.current.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      
      toast({
        title: "Report Downloaded",
        description: `Payroll report has been downloaded as ${fileName}`,
        variant: "success",
      });
    } catch (error) {
      console.error("Error exporting payroll data:", error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the payroll report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Total Monthly Payroll: <span className="font-semibold">{formatCurrency(total)}</span>
        </div>
        <div className="flex flex-wrap gap-1 justify-end items-center min-w-0">
  <Button 
    variant="outline" 
    size="sm" 
    className="px-2 py-1 h-7 text-xs min-w-0"
    onClick={toggleDetails}
  >
    <Filter className="h-3 w-3 mr-1" />
    {isDetailed ? "Summary" : "Details"}
  </Button>
  <Button 
    variant="outline" 
    size="sm" 
    className="px-2 py-1 h-7 text-xs min-w-0"
    onClick={handleDownload}
    disabled={isExporting}
  >
    {isExporting ? (
      <>
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Exporting...
      </>
    ) : (
      <>
        <Download className="h-3 w-3 mr-1" />
        Export
      </>
    )}
          </Button>
        </div>
      </div>
      
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 5, right: 5, bottom: 25, left: 5 }}>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              outerRadius={75}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), undefined]} 
            />
            <Legend 
              wrapperStyle={{
                fontSize: '10px',      // Small text
                position: 'absolute',  // Use absolute positioning
                bottom: '0px',         // Position at bottom
                left: '50%',           // Center horizontally
                transform: 'translateX(-50%)', // Perfect centering
                width: '100%',         // Full width
                paddingTop: '10px',    // Add padding
                backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
                zIndex: 10             // Ensure it's above other elements
              }}
              iconSize={8}             // Small icons
              layout="horizontal"
              verticalAlign="bottom"
            />
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
              {formatCurrency(item.value)}
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

