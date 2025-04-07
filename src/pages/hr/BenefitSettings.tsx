
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

const BenefitSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your benefit settings have been updated successfully",
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          className="mr-2" 
          onClick={() => navigate("/hr/benefits")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Benefit Settings</h1>
          <p className="text-muted-foreground">
            Configure global benefit plan settings and policies
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Settings</CardTitle>
            <CardDescription>
              Configure enrollment periods and eligibility rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openEnrollmentStart">Open Enrollment Start Date</Label>
              <Input id="openEnrollmentStart" type="date" defaultValue="2025-11-01" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="openEnrollmentEnd">Open Enrollment End Date</Label>
              <Input id="openEnrollmentEnd" type="date" defaultValue="2025-11-30" />
            </div>
            
            <div className="flex items-center justify-between space-y-0 py-2">
              <Label htmlFor="newHireEnrollment">New Hire Enrollment Period (days)</Label>
              <Input 
                id="newHireEnrollment" 
                type="number" 
                defaultValue="30" 
                className="w-20" 
              />
            </div>
            
            <div className="flex items-center justify-between space-y-0 py-2">
              <div className="space-y-0.5">
                <Label htmlFor="allowMidYearChanges">Allow Mid-Year Changes</Label>
                <div className="text-sm text-muted-foreground">
                  Allow employees to make changes outside open enrollment
                </div>
              </div>
              <Switch id="allowMidYearChanges" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between space-y-0 py-2">
              <div className="space-y-0.5">
                <Label htmlFor="requireDocumentation">Require Documentation</Label>
                <div className="text-sm text-muted-foreground">
                  Require supporting documentation for life events
                </div>
              </div>
              <Switch id="requireDocumentation" defaultChecked />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Configure company-wide benefit policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" defaultValue="Acme Corporation" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="planYear">Plan Year</Label>
              <Input id="planYear" defaultValue="January 1 - December 31, 2025" />
            </div>
            
            <div className="flex items-center justify-between space-y-0 py-2">
              <div className="space-y-0.5">
                <Label htmlFor="autoEnroll401k">Auto-Enroll in 401(k)</Label>
                <div className="text-sm text-muted-foreground">
                  Automatically enroll new employees in retirement plan
                </div>
              </div>
              <Switch id="autoEnroll401k" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between space-y-0 py-2">
              <div className="space-y-0.5">
                <Label htmlFor="dependentCoverage">Dependent Coverage</Label>
                <div className="text-sm text-muted-foreground">
                  Allow employees to add dependents to health plans
                </div>
              </div>
              <Switch id="dependentCoverage" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between space-y-0 py-2">
              <div className="space-y-0.5">
                <Label htmlFor="sendReminders">Send Enrollment Reminders</Label>
                <div className="text-sm text-muted-foreground">
                  Send email reminders during open enrollment
                </div>
              </div>
              <Switch id="sendReminders" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-end">
        <Button variant="outline" className="mr-2" onClick={() => navigate("/hr/benefits")}>
          Cancel
        </Button>
        <Button onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default BenefitSettings;
