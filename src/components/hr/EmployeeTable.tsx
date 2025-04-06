
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmployeeData {
  id: string;
  name: string;
  position: string;
  department: string;
  status: string;
  email: string;
  image?: string;
}

const employees: EmployeeData[] = [
  {
    id: "1",
    name: "John Doe",
    position: "Software Developer",
    department: "Engineering",
    status: "Active",
    email: "john.doe@example.com",
  },
  {
    id: "2",
    name: "Jane Smith",
    position: "Marketing Manager",
    department: "Marketing",
    status: "Active",
    email: "jane.smith@example.com",
  },
  {
    id: "3",
    name: "Robert Johnson",
    position: "Financial Analyst",
    department: "Finance",
    status: "On Leave",
    email: "robert.johnson@example.com",
  },
  {
    id: "4",
    name: "Emily Davis",
    position: "HR Specialist",
    department: "Human Resources",
    status: "Active",
    email: "emily.davis@example.com",
  },
  {
    id: "5",
    name: "Michael Brown",
    position: "Sales Representative",
    department: "Sales",
    status: "Remote",
    email: "michael.brown@example.com",
  },
];

const EmployeeTable = () => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "On Leave":
        return "bg-amber-100 text-amber-800";
      case "Remote":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">Employee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    {employee.image ? (
                      <AvatarImage src={employee.image} alt={employee.name} />
                    ) : (
                      <AvatarFallback>
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <div className="font-medium">{employee.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {employee.position}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={getStatusColor(employee.status)}
                >
                  {employee.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/hr/employees/${employee.id}`)}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="sr-only">View profile</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeTable;
