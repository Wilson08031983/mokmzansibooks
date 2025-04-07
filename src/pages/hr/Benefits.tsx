
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
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

// Sample benefit plans data
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
    name: "Dental",
    provider: "DentalCare Plus",
    plan: "Standard",
    coverage: "Basic + Orthodontics",
    eligibility: "Full-time employees",
    enrollmentDate: "January 1, 2025",
    details: "Regular checkups, cleanings, and basic procedures."
  },
  {
    id: 3,
    name: "Vision",
    provider: "VisionGuard",
    plan: "Standard",
    coverage: "Basic",
    eligibility: "Full-time employees",
    enrollmentDate: "January 1, 2025",
    details: "Annual eye exams, frames, and contact lenses allowance."
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
  }
];

const Benefits = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("plans");
  
  const handleManagePlan = (name: string) => {
    toast({
      title: `Managing ${name} Plan`,
      description: `Opening ${name.toLowerCase()} plan configuration`,
    });
    
    navigate(`/hr/benefits/${name.toLowerCase()}`);
  };
  
  const handleAddNewPlan = () => {
    toast({
      title: "Add New Benefit Plan",
      description: "Setting up a new employee benefit plan",
    });
    
    navigate("/hr/benefits/new");
  };
  
  const handleExportReport = () => {
    toast({
      title: "Benefits Report Downloaded",
      description: "The benefits report has been exported as a PDF",
    });
  };
  
  const handleSettingsClick = () => {
    navigate("/hr/benefits/settings");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employee Benefits</h1>
          <p className="text-muted-foreground">
            Manage healthcare, retirement, and other benefit plans for employees
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button onClick={handleAddNewPlan}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Plan
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

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
                    <Heart className="h-5 w-5 text-muted-foreground" />
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
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2" 
                      onClick={() => handleManagePlan(plan.name)}
                    >
                      Manage Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Card className="flex flex-col justify-center items-center p-6 h-full border-dashed cursor-pointer hover:bg-accent/50 transition-colors" onClick={handleAddNewPlan}>
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Add New Benefit Plan</p>
              <p className="text-sm text-muted-foreground text-center mt-1">
                Set up additional benefits for your employees
              </p>
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
  );
};

export default Benefits;
