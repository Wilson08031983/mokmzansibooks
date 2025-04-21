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
  UserPlus
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
    coverage: "Monthly Stipend",
    eligibility: "Full-time employees",
    enrollmentDate: "January 1, 2025",
    details: "Monthly housing allowance to support employee accommodation."
  },
  {
    id: 4,
    name: "Retirement",
    provider: "Fidelity",
    plan: "401(k)",
    coverage: "6% employer match",
    eligibility: "All employees after 90 days",
    enrollmentDate: "Anytime",
    details: "Pre-tax contributions with employer matching up to 6%."
  },
  {
    id: 5,
    name: "UIF",
    provider: "Department of Labour",
    plan: "Standard",
    coverage: "1% of salary contribution",
    eligibility: "All employees (mandatory)",
    enrollmentDate: "Upon employment",
    details: "Unemployment Insurance Fund - Both employer and employee contribute 1% of salary (2% total)."
  }
];

const Benefits = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("plans");
  const [isExporting, setIsExporting] = useState(false);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [managingPlan, setManagingPlan] = useState<string | null>(null);
  
  const handleManagePlan = (name: string) => {
    setManagingPlan(name);
    
    toast({
      title: `Managing ${name} Plan`,
      description: `Opening ${name.toLowerCase()} plan configuration`,
      variant: "success",
    });
    
    setTimeout(() => {
      if (name === "Employee") {
        navigate("/hr/benefits/employee");
      } else {
        navigate(`/hr/benefits/${name.toLowerCase()}`);
      }
      setManagingPlan(null);
    }, 500);
  };
  
  const handleAddNewPlan = async () => {
    if (isAddingPlan) return;
    
    setIsAddingPlan(true);
    toast({
      title: "Creating New Plan",
      description: "Setting up a new benefit plan...",
    });

    try {
      await addBenefitPlanAction(
        { name: "New Plan", provider: "New Provider" },
        {
          onSuccess: () => {
            navigate("/hr/benefits/new");
          },
          onError: () => {
            setIsAddingPlan(false);
            toast({
              title: "Error",
              description: "Failed to create new plan. Please try again.",
              variant: "destructive",
            });
          }
        }
      );
    } catch (error) {
      console.error("Error adding new plan:", error);
      toast({
        title: "Error",
        description: "Failed to set up new benefit plan. Please try again.",
        variant: "destructive"
      });
      setIsAddingPlan(false);
    }
  };
  
  const handleAddEmployee = () => {
    navigate("/hr/employees/new");
    
    toast({
      title: "Adding New Employee",
      description: "Navigating to new employee form...",
      variant: "success"
    });
  };
  
  const handleExportReport = async () => {
    setIsExporting(true);
    
    try {
      const date = new Date().toISOString().split('T')[0];
      const filename = `benefits-report-${date}.pdf`;
      
      const content = document.getElementById('benefits-content');
      
      if (!content) {
        throw new Error("Content not found");
      }
      
      const canvas = await html2canvas(content, { 
        scale: 2, 
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      pdf.setFontSize(18);
      pdf.text("Employee Benefits Report", 20, 20);
      pdf.setFontSize(12);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
      
      const imgWidth = 170;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG', 
        20, 
        40, 
        imgWidth, 
        imgHeight
      );
      
      pdf.save(filename);
      
      toast({
        title: "Benefits Report Downloaded",
        description: `The benefits report has been exported as ${filename}`,
        variant: "success"
      });
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        title: "Export Failed",
        description: "There was an error generating the report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleSettingsClick = () => {
    navigate("/hr/benefits/settings");
  };

  const handleEmployeeClick = () => {
    navigate("/hr/benefits/employee");
  };

  const handleBackToBenefits = () => {
    navigate("/hr/benefits");
  };

  const isOnSpecificBenefitPage = location.pathname !== "/hr/benefits" && location.pathname.startsWith("/hr/benefits/");

  if (isOnSpecificBenefitPage && location.pathname !== "/hr/benefits/employee") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBackToBenefits}>
            <Heart className="mr-2 h-4 w-4 text-red-500" />
            Back to Benefits
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Benefit Plan Details</CardTitle>
            <CardDescription>
              Configure and manage this benefit plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Benefit plan details and configuration will be displayed here.</p>
            
            <div className="flex justify-end mt-6 gap-2">
              <Button 
                onClick={handleAddEmployee}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Employee
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Benefits</h1>
          <p className="text-muted-foreground">
            Manage healthcare, retirement, and other benefit plans for employees
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <Button onClick={handleEmployeeClick} variant="outline">
            <Users className="mr-2 h-4 w-4" />
            View Employee Benefits
          </Button>
          <Button onClick={handleAddEmployee}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
          <Button onClick={handleAddNewPlan} disabled={isAddingPlan}>
            {isAddingPlan ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add New Plan
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExportReport}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export Report"}
          </Button>
        </div>
      </div>

      <div id="benefits-content">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="plans">Benefit Plans</TabsTrigger>
            <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="plans">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {benefitPlans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-medium">{plan.name} Plan</CardTitle>
                      {plan.name === "Healthcare" ? (
                        <Heart className="h-5 w-5 text-red-500" />
                      ) : plan.name === "Motor Vehicle Allowance" ? (
                        <Car className="h-5 w-5 text-blue-500" />
                      ) : plan.name === "House Allowance" ? (
                        <Home className="h-5 w-5 text-green-500" />
                      ) : (
                        <Heart className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <CardDescription>{plan.provider}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="text-2xl font-bold">{plan.plan}</div>
                        <p className="text-sm text-muted-foreground">{plan.coverage}</p>
                      </div>
                      
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Eligibility:</span>
                          <span>{plan.eligibility}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Enrollment:</span>
                          <span>{plan.enrollmentDate}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm">{plan.details}</p>
                      
                      <Button 
                        variant={managingPlan === plan.name ? "success" : "outline"}
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => handleManagePlan(plan.name)}
                        disabled={managingPlan === plan.name}
                      >
                        {managingPlan === plan.name ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Opening...
                          </>
                        ) : (
                          "Manage Plan"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card 
                className="flex flex-col justify-center items-center p-6 h-full border-dashed cursor-pointer hover:bg-accent/50 transition-colors" 
                onClick={handleAddNewPlan}
              >
                {isAddingPlan ? (
                  <>
                    <Loader2 className="h-12 w-12 text-muted-foreground mb-4 animate-spin" />
                    <p className="text-lg font-medium">Setting Up New Plan...</p>
                    <p className="text-sm text-muted-foreground text-center mt-1">
                      Please wait while we prepare the form
                    </p>
                  </>
                ) : (
                  <>
                    <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">Add New Benefit Plan</p>
                    <p className="text-sm text-muted-foreground text-center mt-1">
                      Set up additional benefits for your employees
                    </p>
                  </>
                )}
              </Card>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={handleSettingsClick}>
                <Settings className="mr-2 h-4 w-4" />
                Benefit Settings
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="enrollment">
            <Card>
              <CardHeader>
                <CardTitle>Employee Enrollment</CardTitle>
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
                      <div className="text-sm text-muted-foreground">Healthcare, Dental, 401(k)</div>
                      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleManagePlan("Employee")}>
                        View
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
                      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleManagePlan("Employee")}>
                        View
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="font-medium">Robert Johnson</div>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Pending
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <div className="text-sm text-muted-foreground">Healthcare, Vision</div>
                      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleManagePlan("Employee")}>
                        View
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
                      <div className="text-sm text-muted-foreground">None</div>
                      <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleManagePlan("Employee")}>
                        View
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" size="sm">
                    <Users className="mr-2 h-4 w-4" />
                    Mass Enrollment
                  </Button>
                  <Button variant="outline" size="sm">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Open Enrollment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Benefit Documents</CardTitle>
                <CardDescription>
                  Access and manage benefit plan documents and forms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent transition-colors">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Healthcare Plan Summary</div>
                        <div className="text-xs text-muted-foreground">PDF • 1.2 MB</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent transition-colors">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Dental Coverage Details</div>
                        <div className="text-xs text-muted-foreground">PDF • 845 KB</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent transition-colors">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <div className="font-medium">401(k) Plan Overview</div>
                        <div className="text-xs text-muted-foreground">PDF • 980 KB</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent transition-colors">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Benefit Enrollment Form</div>
                        <div className="text-xs text-muted-foreground">DOCX • 620 KB</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Benefits;
