
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Heart, 
  Save, 
  ArrowLeft,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const NewBenefitPlan = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    plan: "Standard",
    coverage: "",
    eligibility: "Full-time employees",
    enrollmentDate: "",
    details: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Success",
        description: "Benefit plan has been created successfully.",
        variant: "success",
      });
      
      // Navigate back to benefits page
      navigate("/dashboard/hr/benefits");
    } catch (error) {
      console.error("Error creating benefit plan:", error);
      toast({
        title: "Error",
        description: "There was an error creating the benefit plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => navigate("/dashboard/hr/benefits")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Benefits
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6">
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Create New Benefit Plan</CardTitle>
              <CardDescription>
                Add a new employee benefit plan to your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    placeholder="Healthcare, Retirement, etc."
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Input 
                    id="provider" 
                    name="provider" 
                    placeholder="Insurance company, bank, etc."
                    value={formData.provider}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan Type</Label>
                  <Select 
                    value={formData.plan} 
                    onValueChange={(value) => handleSelectChange("plan", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Premium">Premium</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="coverage">Coverage</Label>
                  <Input 
                    id="coverage" 
                    name="coverage" 
                    placeholder="Monthly allowance, 6% employer match, etc."
                    value={formData.coverage}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="eligibility">Eligibility</Label>
                  <Select 
                    value={formData.eligibility} 
                    onValueChange={(value) => handleSelectChange("eligibility", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select eligibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All employees">All employees</SelectItem>
                      <SelectItem value="Full-time employees">Full-time employees</SelectItem>
                      <SelectItem value="Part-time employees">Part-time employees</SelectItem>
                      <SelectItem value="Contract employees">Contract employees</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                  <Input 
                    id="enrollmentDate" 
                    name="enrollmentDate" 
                    type="date"
                    value={formData.enrollmentDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="details">Plan Details</Label>
                <Textarea 
                  id="details" 
                  name="details" 
                  placeholder="Provide detailed information about the benefit plan..."
                  rows={4}
                  value={formData.details}
                  onChange={handleChange}
                  className="resize-none"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate("/hr/benefits")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Benefit Plan
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default NewBenefitPlan;
