import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Briefcase, 
  Users, 
  Settings, 
  FileText,
  Download,
  Plus,
  Loader2,
  Car,
  Home,
  UserPlus,
  ArrowLeft
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { addBenefitPlanAction } from "@/utils/actionUtils";

const benefitPlans = [
  {
    id: 1,
    name: "Healthcare",
    provider: "BlueCross",
    plan: "Standard",
    coverage: "Comprehensive",
    eligibility: "Full-time employees",
    enrollmentDate: "January 1, 2025",
    details: "Medical, prescription, and preventive care coverage."
  },
  {
    id: 2,
    name: "Motor Vehicle Allowance",
    provider: "Company Transport Policy",
    plan: "Standard",
    coverage: "Monthly Allowance",
    eligibility: "Full-time employees",
    enrollmentDate: "January 1, 2025",
    details: "Monthly allowance for vehicle-related expenses."
  },
  {
    id: 3,
    name: "House Allowance",
    provider: "Company Housing Policy",
    plan: "Standard",
    coverage: "Monthly Allowance",
    eligibility: "Full-time employees",
    enrollmentDate: "January 1, 2025",
    details: "Monthly allowance for housing-related expenses."
  },
  {
    id: 4,
    name: "401(k)",
    provider: "Fidelity",
    plan: "Standard",
    coverage: "Retirement",
    eligibility: "Full-time employees after 90 days",
    enrollmentDate: "January 1, 2025",
    details: "Retirement savings plan with employer matching up to 5%."
  }
];

const Benefits = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("plans");
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [managingPlan, setManagingPlan] = useState<string | null>(null);
  
  const handleManagePlan = (name: string) => {
    // Set the managing plan state to show loading indicator
    setManagingPlan(name);
    
    // Find the plan details to pass to the management page
    const planDetails = benefitPlans.find(plan => plan.name === name);
    
    // Show toast notification
    toast({
      title: `Managing ${name} Plan`,
      description: `Opening ${name.toLowerCase()} plan configuration`,
      variant: "success",
    });
    
    // Simulate API call to fetch detailed plan information
    setTimeout(() => {
      // Store plan details in sessionStorage for the management page to access
      if (planDetails) {
        sessionStorage.setItem('currentPlan', JSON.stringify(planDetails));
      }
      
      // Navigate to the appropriate route based on plan name
      if (name === "Employee") {
        navigate("/dashboard/hr/benefits/employee");
      } else {
        // Pass plan ID as a query parameter for easier retrieval
        navigate(`/dashboard/hr/benefits/${name.toLowerCase()}?id=${planDetails?.id || ''}`);
      }
      
      // Reset the managing state after navigation
      setManagingPlan(null);
    }, 800); // Slightly longer delay for better UX
  };
  
  // State for employee benefit details viewing
  const [viewingEmployeeId, setViewingEmployeeId] = useState<string | null>(null);
  
  // Function to handle viewing an employee's benefit details
  const handleViewEmployeeBenefits = (employeeId: string, employeeName: string) => {
    setViewingEmployeeId(employeeId);
    
    // Show toast notification
    toast({
      title: "Loading Benefits",
      description: `Retrieving benefit details for ${employeeName}`,
      variant: "default",
    });
    
    // Simulate API call to fetch employee benefit details
    setTimeout(() => {
      // In a real app, you would fetch the employee's benefit details from an API
      // and store them in state or sessionStorage
      
      // For demo purposes, create mock employee benefit details
      const employeeBenefits = {
        id: employeeId,
        name: employeeName,
        enrolledPlans: employeeName === "John Doe" ? ["Healthcare", "401(k)"] : ["Healthcare", "401(k)", "Life Insurance", "Dental"],
        enrollmentDates: {
          "Healthcare": "2024-01-15",
          "401(k)": "2024-02-01",
          "Life Insurance": "2024-03-10",
          "Dental": "2024-02-15"
        },
        contributions: {
          "Healthcare": "R1,200/month",
          "401(k)": "6% of salary",
          "Life Insurance": "R300/month",
          "Dental": "R250/month"
        },
        dependents: 2,
        nextReviewDate: "2025-01-15"
      };
      
      // Store the employee benefit details in sessionStorage
      sessionStorage.setItem('currentEmployeeBenefits', JSON.stringify(employeeBenefits));
      
      // Navigate to the employee benefits details page
      navigate(`/dashboard/hr/employee-benefits-view/${employeeId}`);
      
      // Reset the viewing state
      setViewingEmployeeId(null);
    }, 1000);
  };
  
  const handleAddNewPlan = async () => {
    if (isAddingPlan) return;
    
    setIsAddingPlan(true);
    
    try {
      // Show toast notification
      toast({
        title: "Creating New Plan",
        description: "Setting up new benefit plan configuration",
        variant: "default",
      });
      
      // Simulate API call to create a new plan
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the action to the activity log
      addBenefitPlanAction("Created new benefit plan", "success");
      
      // Navigate to the new plan page
      navigate("/dashboard/hr/benefits/new");
    } catch (error) {
      console.error("Error creating new plan:", error);
      toast({
        title: "Error",
        description: "Failed to create new plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingPlan(false);
    }
  };
  
  const handleExportBenefitReport = async () => {
    try {
      // Show toast notification
      toast({
        title: "Generating Report",
        description: "Preparing benefit plans report",
        variant: "default",
      });
      
      // Simulate API call to generate report
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Get the element to export
      const element = document.getElementById('benefit-plans-container');
      
      if (element) {
        // Use html2canvas to create a canvas from the element
        const canvas = await html2canvas(element);
        
        // Create a new jsPDF instance
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Get the width and height of the canvas
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add the canvas as an image to the PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        
        // Save the PDF
        pdf.save('benefit-plans-report.pdf');
        
        // Show success toast
        toast({
          title: "Report Generated",
          description: "Benefit plans report has been downloaded",
          variant: "success",
        });
      } else {
        throw new Error("Element not found");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "Export Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Benefits</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportBenefitReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="plans" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="plans">Benefit Plans</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="plans" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="benefit-plans-container">
            {benefitPlans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  </div>
                  <CardDescription>{plan.provider}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plan:</span>
                      <span>{plan.plan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Coverage:</span>
                      <span>{plan.coverage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Eligibility:</span>
                      <span>{plan.eligibility}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enrollment Date:</span>
                      <span>{plan.enrollmentDate}</span>
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 pt-0 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleManagePlan(plan.name)}
                    disabled={managingPlan === plan.name}
                  >
                    {managingPlan === plan.name ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Settings className="h-4 w-4 mr-2" />
                        Manage Plan
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
            
            <Card 
              className="flex flex-col justify-center items-center p-6 h-full border-dashed cursor-pointer hover:bg-accent/50 transition-colors" 
              onClick={handleAddNewPlan}
            >
              {isAddingPlan ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Creating new plan...</p>
                </div>
              ) : (
                <>
                  <div className="rounded-full bg-primary/10 p-3 mb-3">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium">Add New Plan</p>
                  <p className="text-sm text-muted-foreground mt-1">Create a new benefit plan</p>
                </>
              )}
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Benefits</CardTitle>
              <CardDescription>
                View and manage employee benefit enrollment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">John Doe</div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Enrolled
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <div className="text-sm text-muted-foreground">Healthcare, 401(k)</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2" 
                      onClick={() => handleViewEmployeeBenefits("1", "John Doe")}
                      disabled={viewingEmployeeId === "1"}
                    >
                      {viewingEmployeeId === "1" ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "View"
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">Jane Smith</div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Enrolled
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <div className="text-sm text-muted-foreground">All Benefits</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2" 
                      onClick={() => handleViewEmployeeBenefits("2", "Jane Smith")}
                      disabled={viewingEmployeeId === "2"}
                    >
                      {viewingEmployeeId === "2" ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "View"
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">Robert Johnson</div>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      Partial
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <div className="text-sm text-muted-foreground">Healthcare only</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2" 
                      onClick={() => handleViewEmployeeBenefits("3", "Robert Johnson")}
                      disabled={viewingEmployeeId === "3"}
                    >
                      {viewingEmployeeId === "3" ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "View"
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="font-medium">Emily Davis</div>
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      Not Enrolled
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <div className="text-sm text-muted-foreground">No benefits</div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2" 
                      onClick={() => handleViewEmployeeBenefits("4", "Emily Davis")}
                      disabled={viewingEmployeeId === "4"}
                    >
                      {viewingEmployeeId === "4" ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "View"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="p-4 border-t flex justify-end">
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Enroll New Employee
              </Button>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benefit Settings</CardTitle>
              <CardDescription>
                Configure global benefit settings and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Open Enrollment Period</h3>
                    <p className="text-sm text-muted-foreground">November 1 - December 15, 2025</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Default Eligibility Rules</h3>
                    <p className="text-sm text-muted-foreground">Full-time employees after 90 days</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Benefit Providers</h3>
                    <p className="text-sm text-muted-foreground">Manage external benefit providers</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Notification Settings</h3>
                    <p className="text-sm text-muted-foreground">Configure benefit-related notifications</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Benefits;
