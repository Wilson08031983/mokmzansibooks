
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Heart,
  Download,
  CheckCircle2,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";

// Sample employee benefits data
const employeeBenefits = [
  {
    id: 1,
    name: "Healthcare",
    status: "Enrolled",
    startDate: "January 1, 2025",
    coverage: "Comprehensive",
    contribution: 1200
  },
  {
    id: 2,
    name: "Dental",
    status: "Enrolled",
    startDate: "January 1, 2025",
    coverage: "Basic",
    contribution: 300
  },
  {
    id: 3,
    name: "Vision",
    status: "Eligible",
    startDate: "Pending Enrollment",
    coverage: "Standard",
    contribution: 150
  },
  {
    id: 4,
    name: "Retirement",
    status: "Enrolled",
    startDate: "January 1, 2025",
    coverage: "6% employer match",
    contribution: 2500
  },
  {
    id: 5,
    name: "Motor Vehicle Allowance",
    status: "Not Eligible",
    startDate: "N/A",
    coverage: "Monthly Allowance",
    contribution: 0
  }
];

// Sample employee data
const employee = {
  name: "John Doe",
  id: "EMP-001",
  department: "Finance",
  position: "Financial Analyst",
  enrollmentPeriod: "Open Enrollment: October 15 - November 15, 2025"
};

const EmployeeBenefits = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleDownloadSummary = () => {
    toast({
      title: "Summary Downloaded",
      description: "Employee benefits summary has been downloaded successfully.",
      variant: "success",
    });
  };
  
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Enrolled":
        return "bg-green-100 text-green-800";
      case "Eligible":
        return "bg-blue-100 text-blue-800";
      case "Not Eligible":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/hr/benefits")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Benefits
        </Button>
        <Button variant="outline" onClick={handleDownloadSummary}>
          <Download className="mr-2 h-4 w-4" />
          Download Summary
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Employee Benefits Summary</CardTitle>
              <CardDescription>
                Benefits enrollment and eligibility information
              </CardDescription>
            </div>
            <Heart className="h-5 w-5 text-red-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Employee Name</h3>
                <p className="font-medium">{employee.name}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Employee ID</h3>
                <p className="font-medium">{employee.id}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Department</h3>
                <p className="font-medium">{employee.department}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Position</h3>
                <p className="font-medium">{employee.position}</p>
              </div>
            </div>
            
            <div className="py-2">
              <h3 className="font-medium text-sm">Next Enrollment Period</h3>
              <p className="text-muted-foreground text-sm">{employee.enrollmentPeriod}</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-medium">Current Benefits</h3>
              
              {employeeBenefits.map((benefit) => (
                <div key={benefit.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{benefit.name}</h4>
                      <Badge variant="outline" className={getBadgeVariant(benefit.status)}>
                        {benefit.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {benefit.status === "Enrolled" ? (
                        <>Start Date: {benefit.startDate}</>
                      ) : benefit.status === "Eligible" ? (
                        <>Eligible for enrollment</>
                      ) : (
                        <>Not eligible for this benefit</>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">Coverage: {benefit.coverage}</p>
                  </div>
                  
                  {benefit.status === "Enrolled" && (
                    <div className="mt-2 md:mt-0 flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Monthly Contribution</div>
                        <div className="font-medium">{formatCurrency(benefit.contribution)}</div>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {benefit.status === "Eligible" && (
                    <div className="mt-2 md:mt-0">
                      <Button size="sm">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Enroll Now
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Last updated: April 21, 2025
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Total Monthly Contribution</div>
            <div className="font-medium">{formatCurrency(4150)}</div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmployeeBenefits;
