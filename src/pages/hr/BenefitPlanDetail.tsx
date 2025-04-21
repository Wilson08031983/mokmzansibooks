import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Save, 
  Pencil, 
  UserPlus, 
  Users, 
  FileText,
  Download,
  Heart,
  Home,
  Car,
  CheckCircle2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

const BenefitPlanDetail = () => {
  const { planId = "" } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  const planData = {
    "healthcare": {
      id: 1,
      name: "Healthcare",
      provider: "BlueCross",
      plan: "Standard",
      coverage: "Comprehensive",
      eligibility: "Full-time employees",
      enrollmentDate: "January 1, 2025",
      details: "Medical, prescription, and preventive care coverage.",
      icon: <Heart className="h-6 w-6 text-red-500" />
    },
    "motor vehicle allowance": {
      id: 2,
      name: "Motor Vehicle Allowance",
      provider: "Company Transport Policy",
      plan: "Standard",
      coverage: "Monthly Allowance",
      eligibility: "Full-time employees",
      enrollmentDate: "January 1, 2025",
      details: "Monthly allowance for vehicle-related expenses.",
      icon: <Car className="h-6 w-6 text-blue-500" />
    },
    "house allowance": {
      id: 3,
      name: "House Allowance",
      provider: "Company Housing Policy",
      plan: "Standard",
      coverage: "Monthly Stipend",
      eligibility: "Full-time employees",
      enrollmentDate: "January 1, 2025",
      details: "Monthly housing allowance to support employee accommodation.",
      icon: <Home className="h-6 w-6 text-green-500" />
    },
    "retirement": {
      id: 4,
      name: "Retirement",
      provider: "Fidelity",
      plan: "401(k)",
      coverage: "6% employer match",
      eligibility: "All employees after 90 days",
      enrollmentDate: "Anytime",
      details: "Pre-tax contributions with employer matching up to 6%.",
      icon: <Heart className="h-6 w-6 text-muted-foreground" />
    },
    "new": {
      id: 5,
      name: "New Plan",
      provider: "New Provider",
      plan: "Standard",
      coverage: "To be defined",
      eligibility: "To be defined",
      enrollmentDate: "To be defined",
      details: "New benefit plan being set up.",
      icon: <Heart className="h-6 w-6 text-purple-500" />
    }
  };
  
  const plan = planData[planId.toLowerCase()] || planData["healthcare"];
  
  const [formData, setFormData] = useState({
    name: plan.name,
    provider: plan.provider,
    plan: plan.plan,
    coverage: plan.coverage,
    eligibility: plan.eligibility,
    enrollmentDate: plan.enrollmentDate,
    details: plan.details
  });
  
  const handleGoBack = () => {
    navigate("/hr/benefits");
  };
  
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSave = () => {
    setIsSaving(true);
    
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      
      toast({
        title: "Changes Saved",
        description: `${plan.name} plan has been updated successfully.`,
        variant: "success"
      });
    }, 800);
  };
  
  const handleAddEmployee = () => {
    console.log("Add Employee button clicked from BenefitPlanDetail");
    navigate("/hr/employees/new");
  };
  
  const handleEnrollNow = () => {
    toast({
      title: "Enrollment Started",
      description: "Starting the enrollment process for this benefit plan.",
      variant: "success"
    });
    navigate(`/hr/benefits/${planId}/enroll`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={handleGoBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{plan.name}</h1>
            <p className="text-muted-foreground">
              Manage benefit plan details and enrolled employees
            </p>
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          {isEditing ? (
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleToggleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Plan
            </Button>
          )}
          <Button variant="outline" onClick={() => toast({ title: "Downloading report", description: "Feature coming soon!" })}>
            <Download className="mr-2 h-4 w-4" />
            Export Details
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Plan Details</TabsTrigger>
          <TabsTrigger value="employees">Enrolled Employees</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Benefit Information</CardTitle>
                <CardDescription>
                  Details about the benefit plan and coverage
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Input 
                    id="provider" 
                    name="provider" 
                    value={formData.provider} 
                    onChange={handleInputChange} 
                    disabled={!isEditing}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan">Plan Type</Label>
                    <Input 
                      id="plan" 
                      name="plan" 
                      value={formData.plan} 
                      onChange={handleInputChange} 
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="coverage">Coverage</Label>
                    <Input 
                      id="coverage" 
                      name="coverage" 
                      value={formData.coverage} 
                      onChange={handleInputChange} 
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eligibility">Eligibility</Label>
                    <Input 
                      id="eligibility" 
                      name="eligibility" 
                      value={formData.eligibility} 
                      onChange={handleInputChange} 
                      disabled={!isEditing}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                    <Input 
                      id="enrollmentDate" 
                      name="enrollmentDate" 
                      value={formData.enrollmentDate} 
                      onChange={handleInputChange} 
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="details">Plan Details</Label>
                  <Textarea 
                    id="details" 
                    name="details" 
                    value={formData.details} 
                    onChange={handleInputChange} 
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      {plan.icon}
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.provider}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Plan Type:</span>
                      <span className="font-medium">{plan.plan}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Enrolled:</span>
                      <span className="font-medium">24 employees</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/hr/benefits/settings")}>
                    View Settings
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Cost Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Premium:</span>
                      <span className="font-bold">$12,600</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Per Employee:</span>
                      <span>$525</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Annual Total:</span>
                      <span className="font-bold">$151,200</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Enrolled Employees</CardTitle>
                  <CardDescription>
                    Employees enrolled in this benefit plan
                  </CardDescription>
                </div>
                <Button 
                  size="sm" 
                  onClick={handleAddEmployee}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["John Doe", "Jane Smith", "Robert Johnson", "Emily Davis"].map((name, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent transition-colors">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{name}</div>
                        <div className="text-xs text-muted-foreground">Enrolled: January 1, 2025</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-6">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export List
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="mr-2 h-4 w-4" />
                  Mass Enrollment
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Plan Documents</CardTitle>
                  <CardDescription>
                    Policy documents and forms for this benefit plan
                  </CardDescription>
                </div>
                <Button size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Plan Summary Document", type: "PDF", size: "1.2 MB" },
                  { name: "Coverage Details", type: "PDF", size: "845 KB" },
                  { name: "Enrollment Form", type: "DOCX", size: "620 KB" },
                  { name: "Policy Handbook", type: "PDF", size: "3.4 MB" },
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg border hover:bg-accent transition-colors">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{doc.name}</div>
                        <div className="text-xs text-muted-foreground">{doc.type} • {doc.size}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BenefitPlanDetail;
