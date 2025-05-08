
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
import { ExternalLink, Edit, Heart } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/utils/supabaseClient";

interface EmployeeData {
  id: string;
  name: string;
  position: string;
  department: string;
  status: string;
  email: string;
  image?: string;
}

// Employee data will be fetched from Supabase in the component
const EmployeeTable = () => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('employees')
          .select('*');
          
        if (error) throw error;
        
        setEmployees(data || []);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch employees'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployees();
  }, [supabase]);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingProfile, setLoadingProfile] = useState<string | null>(null);

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
                <div className="flex items-center justify-end space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-1 h-7 w-7 min-w-0 flex items-center justify-center transition-colors
                      ${loadingProfile === employee.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-blue-50 hover:text-blue-600'}
                      focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 active:bg-blue-100`}
                    onClick={() => {
                      setLoadingProfile(employee.id);
                      toast({
                        title: "Loading profile",
                        description: `Opening ${employee.name}'s profile details`,
                        variant: "default"
                      });
                      // Small timeout to show loading state for better UX
                      setTimeout(() => {
                        navigate(`/dashboard/hr/employee/${employee.id}`);
                        setLoadingProfile(null);
                      }, 300);
                    }}
                    title="View employee profile"
                    disabled={loadingProfile === employee.id}
                  >
                    {loadingProfile === employee.id ? (
                      <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    <span className="sr-only">View profile</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-7 w-7 min-w-0 flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 transition-colors"
                    onClick={() => {
                      // Navigate to the new employee form but with query parameters to indicate edit mode
                      navigate(`/dashboard/hr/new-employee?mode=edit&id=${employee.id}`);
                      toast({
                        title: "Edit Employee",
                        description: `Opening edit form for ${employee.name}`,
                        variant: "default"
                      });
                    }}
                    title="Edit employee"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit employee</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1 h-7 w-7 min-w-0 flex items-center justify-center hover:bg-green-50 hover:text-green-600 transition-colors"
                    onClick={() => navigate(`/dashboard/hr/employee-benefits/${employee.id}`)}
                    title="View benefits"
                  >
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">View benefits</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EmployeeTable;
