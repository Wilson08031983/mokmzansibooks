
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

const data = [
  { name: "Salaries", value: 25000, color: "#8884d8" },
  { name: "Benefits", value: 4300, color: "#82ca9d" },
  { name: "Taxes", value: 3240.25, color: "#ffc658" },
];

const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

const PayrollSummary = () => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Total Monthly Payroll: <span className="font-semibold">${total.toLocaleString()}</span>
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
                style={{ backgroundColor: item.color }}
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
