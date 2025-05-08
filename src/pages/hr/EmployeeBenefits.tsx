import { useState, useRef, useCallback } from "react";
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
  FileText,
  Percent
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/utils/formatters";
import { downloadDocumentAsPdf } from "@/utils/pdfUtils";

// Update sample employee benefits data with contribution splits
const employeeBenefits = [
  {
    id: 1,
    name: "Health Insurance",
    status: "Enrolled",
    startDate: "January 1, 2025",
    coverage: "Comprehensive",
    contribution: 1200,
    companyContribution: 80, // company pays 80%
    employeeContribution: 20  // employee pays 20%
  },
  {
    id: 4,
    name: "Retirement",
    status: "Enrolled",
    startDate: "January 1, 2025",
    coverage: "6% employer match",
    contribution: 2500,
    companyContribution: 50,
    employeeContribution: 50
  },
  {
    id: 5,
    name: "Motor Vehicle Allowance",
    status: "Not Eligible",
    startDate: "N/A",
    coverage: "Monthly Allowance",
    contribution: 0,
    companyContribution: 100,
    employeeContribution: 0
  },
  {
    id: 6,
    name: "UIF",
    status: "Enrolled",
    startDate: "January 1, 2025",
    coverage: "1% of monthly salary",
    contribution: 250,
    companyContribution: 50,
    employeeContribution: 50
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
  const benefitsSummaryRef = useRef<HTMLDivElement>(null);
  const [selectedBenefit, setSelectedBenefit] = useState<number | null>(null);
  const singleBenefitRef = useRef<HTMLDivElement>(null);
  
  const handleDownloadSummary = async () => {
    if (!benefitsSummaryRef.current) {
      toast({
        title: "Error",
        description: "Could not generate the benefits summary PDF.",
        variant: "destructive",
      });
      return;
    }

    // Show loading toast
    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your benefits summary...",
    });

    try {
      // Use the utility function to download the PDF
      const success = await downloadDocumentAsPdf(
        benefitsSummaryRef.current,
        "employee-benefits-summary.pdf"
      );

      if (success) {
        toast({
          title: "Summary Downloaded",
          description: "Employee benefits summary has been downloaded as PDF in A4 format.",
          variant: "success",
        });
      } else {
        throw new Error("PDF generation failed");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was a problem generating the PDF. Please try again.",
        variant: "destructive",
      });
    }
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
  
  const calculateContribution = (total: number, percentage: number) => {
    return (total * percentage) / 100;
  };

  const handleDownloadBenefit = useCallback(async (benefitId: number) => {
    // Show loading toast first
    toast({
      title: "Generating PDF",
      description: "Please wait while we prepare your benefit details...",
    });
    
    try {
      // Find the benefit to use in the filename
      const benefit = employeeBenefits.find(b => b.id === benefitId);
      if (!benefit) {
        throw new Error("Benefit not found");
      }
      
      // Set the selected benefit and wait for the state to update
      setSelectedBenefit(benefitId);
      
      // Use a promise to ensure the DOM has updated before proceeding
      await new Promise(resolve => setTimeout(resolve, 300));
      
      if (!singleBenefitRef.current) {
        throw new Error("PDF element reference not available");
      }
      
      // Make sure the hidden div is properly rendered before capturing
      singleBenefitRef.current.style.display = "block";
      singleBenefitRef.current.style.position = "fixed";
      singleBenefitRef.current.style.top = "-9999px";
      singleBenefitRef.current.style.left = "-9999px";
      
      // Wait a bit more to ensure styles are applied
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const fileName = `${benefit.name.toLowerCase().replace(/\s+/g, '-')}-details.pdf`;
      
      // Use the utility function to download the PDF
      const success = await downloadDocumentAsPdf(
        singleBenefitRef.current,
        fileName
      );
      
      // Reset the styles
      singleBenefitRef.current.style.display = "none";
      singleBenefitRef.current.style.position = "";
      singleBenefitRef.current.style.top = "";
      singleBenefitRef.current.style.left = "";
      
      if (success) {
        toast({
          title: "Details Downloaded",
          description: `${benefit.name} details have been downloaded as PDF.`,
          variant: "success",
        });
      } else {
        throw new Error("PDF generation failed");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Download Failed",
        description: "There was a problem generating the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Reset the selected benefit state
      setSelectedBenefit(null);
    }
  }, [toast, employeeBenefits]);
  
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      {/* Hidden div for single benefit PDF generation */}
      <div 
        ref={singleBenefitRef} 
        style={{ 
          display: 'none', 
          width: '210mm', 
          padding: '20mm', 
          backgroundColor: 'white',
          boxSizing: 'border-box',
          margin: '0 auto'
        }}
      >
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Employee Benefit Details</h1>
            <div className="text-sm text-muted-foreground mb-1">Employee: {employee.name} ({employee.id})</div>
            <div className="text-sm text-muted-foreground mb-1">Department: {employee.department}</div>
            <div className="text-sm text-muted-foreground">Position: {employee.position}</div>
          </div>
          
          {employeeBenefits.filter(b => b.id === selectedBenefit).map(benefit => (
            <div key={benefit.id} className="border rounded-lg p-6 mb-6">
              <div className="flex flex-col mb-4">
                <h2 className="text-xl font-bold mb-2">{benefit.name}</h2>
                <div className="py-1 px-2 rounded text-sm inline-flex w-fit mb-2" 
                     style={{
                       backgroundColor: benefit.status === "Enrolled" ? "#dcfce7" : 
                                        benefit.status === "Eligible" ? "#dbeafe" : "#f3f4f6",
                       color: benefit.status === "Enrolled" ? "#166534" : 
                              benefit.status === "Eligible" ? "#1e40af" : "#4b5563"
                     }}>
                  {benefit.status}
                </div>
                <div className="text-sm mb-1">Start Date: {benefit.status === "Enrolled" ? benefit.startDate : "N/A"}</div>
                <div className="text-sm mb-4">Coverage: {benefit.coverage}</div>
                
                {benefit.status === "Enrolled" && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Monthly Contribution Details</h3>
                    <div className="mb-2">Total: {formatCurrency(benefit.contribution)}</div>
                    <div className="flex items-center mb-1">
                      <div style={{ width: '12px', height: '12px', marginRight: '8px', backgroundColor: '#16a34a', borderRadius: '50%' }}></div>
                      <span>Company: {benefit.companyContribution}% ({formatCurrency(calculateContribution(benefit.contribution, benefit.companyContribution))})</span>
                    </div>
                    <div className="flex items-center">
                      <div style={{ width: '12px', height: '12px', marginRight: '8px', backgroundColor: '#2563eb', borderRadius: '50%' }}></div>
                      <span>Employee: {benefit.employeeContribution}% ({formatCurrency(calculateContribution(benefit.contribution, benefit.employeeContribution))})</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <div className="text-xs text-muted-foreground mt-8">
            <p>This document was generated on {new Date().toLocaleDateString()} and is for informational purposes only.</p>
            <p>For any questions regarding your benefits, please contact the HR department.</p>
          </div>
        </div>
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/dashboard/hr/benefits")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Benefits
        </Button>
        <Button variant="outline" onClick={handleDownloadSummary}>
          <Download className="mr-2 h-4 w-4" />
          Download Summary
        </Button>
      </div>
      
      <Card>
        <div ref={benefitsSummaryRef} className="bg-white p-6">
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
                      <div className="text-right space-y-1">
                        <div className="text-sm text-muted-foreground">Monthly Contribution</div>
                        <div className="font-medium">{formatCurrency(benefit.contribution)}</div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Percent className="h-3 w-3 text-muted-foreground" />
                          <span className="text-green-600">Company: {benefit.companyContribution}% ({formatCurrency(calculateContribution(benefit.contribution, benefit.companyContribution))})</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Percent className="h-3 w-3 text-muted-foreground" />
                          <span className="text-blue-600">Employee: {benefit.employeeContribution}% ({formatCurrency(calculateContribution(benefit.contribution, benefit.employeeContribution))})</span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownloadBenefit(benefit.id)}
                        title="Download benefit details"
                      >
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
          <div className="text-right space-y-1">
            <div className="text-sm text-muted-foreground">Total Monthly Contribution</div>
            <div className="font-medium">{formatCurrency(4150)}</div>
            <div className="text-sm text-muted-foreground">
              Company: {formatCurrency(2697.50)} | Employee: {formatCurrency(1452.50)}
            </div>
          </div>
        </CardFooter>
        </div>
      </Card>
    </div>
  );
};

export default EmployeeBenefits;
