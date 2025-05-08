import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  ArrowLeft, 
  Save, 
  Trash, 
  Users, 
  FileText, 
  Settings,
  Loader2,
  Upload,
  File,
  X,
  Download,
  Mail,
  Phone,
  Edit,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Define the plan structure
interface BenefitPlan {
  id: number;
  name: string;
  provider: string;
  plan: string;
  coverage: string;
  eligibility: string;
  enrollmentDate: string;
  details: string;
}

// Define document structure
interface PlanDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  url?: string;
}

// Define employee structure
interface Employee {
  id: number;
  name: string;
  position: string;
  department?: string;
  email?: string;
  phone?: string;
  enrollmentDate: string;
  status?: string;
  coverage?: string;
  dependents?: number;
  contributions?: string;
  notes?: string;
  imageUrl?: string;
}

const BenefitPlanDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Extract plan ID from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const planId = queryParams.get('id');
  
  // State for the plan details
  const [plan, setPlan] = useState<BenefitPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [enrolledEmployees, setEnrolledEmployees] = useState<any[]>([]);
  
  // Document state
  const [documents, setDocuments] = useState<PlanDocument[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Employee details state
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEmployeeDetailsDialog, setShowEmployeeDetailsDialog] = useState(false);
  const [loadingEmployeeDetails, setLoadingEmployeeDetails] = useState(false);
  
  // Enrollment state
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [employeeSearchResults, setEmployeeSearchResults] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeToEnroll, setSelectedEmployeeToEnroll] = useState<Employee | null>(null);
  const [enrollmentFormData, setEnrollmentFormData] = useState({
    coverageType: 'Individual',
    dependents: '0',
    contributions: '',
    notes: ''
  });
  
  // Form state
  const [formData, setFormData] = useState<Partial<BenefitPlan>>({});
  
  useEffect(() => {
    // Load plan details from sessionStorage or fetch from API
    const loadPlanDetails = async () => {
      setLoading(true);
      try {
        // Try to get from sessionStorage first
        const storedPlan = sessionStorage.getItem('currentPlan');
        
        if (storedPlan) {
          const parsedPlan = JSON.parse(storedPlan);
          setPlan(parsedPlan);
          setFormData(parsedPlan);
        } else if (planId) {
          // In a real app, this would fetch from an API
          // Simulating API call with timeout
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // For demo purposes, create a mock plan
          const mockPlan: BenefitPlan = {
            id: parseInt(planId),
            name: location.pathname.split('/').pop()?.charAt(0).toUpperCase() + location.pathname.split('/').pop()?.slice(1) || 'Unknown Plan',
            provider: 'Provider Name',
            plan: 'Standard',
            coverage: 'Comprehensive',
            eligibility: 'Full-time employees',
            enrollmentDate: 'January 1, 2025',
            details: 'Detailed information about this benefit plan.'
          };
          
          setPlan(mockPlan);
          setFormData(mockPlan);
        } else {
          // Handle case where no plan is found
          toast({
            title: "Plan Not Found",
            description: "Could not find the requested benefit plan.",
            variant: "destructive",
          });
          navigate("/dashboard/hr/benefits");
        }
        
        // Simulate fetching enrolled employees
        setEnrolledEmployees([
          { id: 1, name: "John Doe", position: "Software Developer", enrollmentDate: "2025-01-15" },
          { id: 2, name: "Jane Smith", position: "Marketing Manager", enrollmentDate: "2025-01-10" },
          { id: 3, name: "Robert Johnson", position: "Financial Analyst", enrollmentDate: "2025-02-01" }
        ]);
      } catch (error) {
        console.error("Error loading plan details:", error);
        toast({
          title: "Error",
          description: "Failed to load plan details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadPlanDetails();
    
    // Clean up sessionStorage when component unmounts
    return () => {
      sessionStorage.removeItem('currentPlan');
    };
  }, [planId, location.pathname, navigate, toast]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    // Basic validation before saving
    if (!formData.name || formData.name.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Plan name is required.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.provider || formData.provider.trim() === '') {
      toast({
        title: "Validation Error",
        description: "Provider name is required.",
        variant: "destructive",
      });
      return;
    }
    
    setSaving(true);
    
    try {
      // Track changes to show in success message
      const changedFields = [];
      if (plan) {
        if (plan.name !== formData.name) changedFields.push('name');
        if (plan.provider !== formData.provider) changedFields.push('provider');
        if (plan.plan !== formData.plan) changedFields.push('plan type');
        if (plan.coverage !== formData.coverage) changedFields.push('coverage');
        if (plan.eligibility !== formData.eligibility) changedFields.push('eligibility');
        if (plan.enrollmentDate !== formData.enrollmentDate) changedFields.push('enrollment date');
        if (plan.details !== formData.details) changedFields.push('details');
      }
      
      // Simulate API call to save changes
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call to update the plan
      // const { error } = await supabase
      //   .from('benefit_plans')
      //   .update(formData)
      //   .eq('id', plan?.id);
      // 
      // if (error) throw error;
      
      // Update local state
      setPlan(prev => prev ? { ...prev, ...formData } as BenefitPlan : null);
      
      // Prepare success message
      let successDescription = "Benefit plan has been updated successfully.";
      if (changedFields.length > 0) {
        successDescription = `Updated ${changedFields.join(', ')} for this benefit plan.`;
      }
      
      toast({
        title: "Changes Saved",
        description: successDescription,
        variant: "success",
      });
      
      // Simulate saving to database by updating sessionStorage
      if (plan) {
        const updatedPlan = { ...plan, ...formData };
        sessionStorage.setItem('currentPlan', JSON.stringify(updatedPlan));
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  
  const [deleting, setDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!plan) {
      toast({
        title: "Error",
        description: "Cannot delete plan: plan details not found.",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
      return;
    }
    
    setDeleting(true);
    
    try {
      // In a real app, this would be an API call to delete the plan
      // const { error } = await supabase
      //   .from('benefit_plans')
      //   .delete()
      //   .eq('id', plan.id);
      // 
      // if (error) throw error;
      
      // Simulate API call to delete plan
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if there are enrolled employees before deletion
      if (enrolledEmployees.length > 0) {
        // In a real app, you might handle this differently
        // For now, we'll just show a warning but proceed with deletion
        toast({
          title: "Warning",
          description: `Deleted plan with ${enrolledEmployees.length} enrolled employees. They have been automatically unenrolled.`,
          variant: "warning",
        });
      }
      
      // Remove from sessionStorage
      sessionStorage.removeItem('currentPlan');
      
      toast({
        title: "Plan Deleted",
        description: `The ${plan.name} benefit plan has been deleted successfully.`,
        variant: "success",
      });
      
      // Navigate back to benefits page
      navigate("/dashboard/hr/benefits");
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete plan. Please try again.",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
    } finally {
      setDeleting(false);
    }
  };
  
  // Document handling functions
  const handleUploadClick = () => {
    setShowUploadDialog(true);
  };
  
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    setUploading(true);
    
    try {
      // Simulate file upload with progress
      const totalSteps = 10;
      for (let i = 1; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setUploadProgress(Math.floor((i / totalSteps) * 100));
      }
      
      // Create a new document object
      const newDocument: PlanDocument = {
        id: Date.now().toString(),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        url: URL.createObjectURL(file) // Create a temporary URL for the file
      };
      
      // Add the document to the list
      setDocuments(prev => [...prev, newDocument]);
      
      toast({
        title: "Document Uploaded",
        description: `${file.name} has been uploaded successfully.`,
        variant: "success",
      });
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setShowUploadDialog(false);
    }
  };
  
  const handleDeleteDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    
    toast({
      title: "Document Deleted",
      description: "Document has been removed successfully.",
      variant: "success",
    });
  };
  
  // Load mock available employees for enrollment
  const mockAvailableEmployees: Employee[] = [
    { 
      id: 4, 
      name: "Sarah Williams", 
      position: "Marketing Specialist", 
      department: "Marketing",
      email: "sarah.williams@mokmzansi.com",
      phone: "+27 74 567 8901",
      enrollmentDate: new Date().toISOString().split('T')[0],
      imageUrl: "https://randomuser.me/api/portraits/women/4.jpg"
    },
    { 
      id: 5, 
      name: "David Brown", 
      position: "Financial Analyst", 
      department: "Finance",
      email: "david.brown@mokmzansi.com",
      phone: "+27 75 678 9012",
      enrollmentDate: new Date().toISOString().split('T')[0],
      imageUrl: "https://randomuser.me/api/portraits/men/5.jpg"
    },
    { 
      id: 6, 
      name: "Emily Davis", 
      position: "HR Coordinator", 
      department: "HR",
      email: "emily.davis@mokmzansi.com",
      phone: "+27 76 789 0123",
      enrollmentDate: new Date().toISOString().split('T')[0],
      imageUrl: "https://randomuser.me/api/portraits/women/6.jpg"
    },
  ];
  
  // Handle employee enrollment
  const handleOpenEnrollDialog = () => {
    setShowEnrollDialog(true);
    setSearchQuery('');
    setSelectedEmployeeToEnroll(null);
    setEnrollmentFormData({
      coverageType: 'Individual',
      dependents: '0',
      contributions: '',
      notes: ''
    });
    
    // Set the available employees for enrollment
    setEmployeeSearchResults(mockAvailableEmployees);
  };
  
  const handleSearchEmployees = (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      // If query is empty, show all available employees
      setEmployeeSearchResults(mockAvailableEmployees);
      return;
    }
    
    // Filter employees based on query
    const filteredEmployees = mockAvailableEmployees.filter(emp => 
      emp.name.toLowerCase().includes(query.toLowerCase()) ||
      emp.position.toLowerCase().includes(query.toLowerCase()) ||
      (emp.department && emp.department.toLowerCase().includes(query.toLowerCase()))
    );
    
    setEmployeeSearchResults(filteredEmployees);
  };
  
  const handleSelectEmployeeToEnroll = (employee: Employee) => {
    setSelectedEmployeeToEnroll(employee);
    
    // Set default contribution based on position
    let defaultContribution = '';
    if (employee.position.includes('Manager') || employee.position.includes('Director')) {
      defaultContribution = 'R1,500';
    } else if (employee.position.includes('Senior') || employee.position.includes('Lead')) {
      defaultContribution = 'R1,200';
    } else {
      defaultContribution = 'R800';
    }
    
    setEnrollmentFormData(prev => ({
      ...prev,
      contributions: defaultContribution
    }));
  };
  
  const handleEnrollmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEnrollmentFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEnrollEmployee = async () => {
    if (!selectedEmployeeToEnroll || !plan) {
      toast({
        title: "Error",
        description: "Please select an employee to enroll.",
        variant: "destructive",
      });
      return;
    }
    
    setEnrolling(true);
    
    try {
      // In a real app, this would be an API call to enroll the employee
      // const { error } = await supabase
      //   .from('employee_benefits')
      //   .insert({
      //     employee_id: selectedEmployeeToEnroll.id,
      //     plan_id: plan.id,
      //     coverage_type: enrollmentFormData.coverageType,
      //     dependents: parseInt(enrollmentFormData.dependents),
      //     contributions: enrollmentFormData.contributions,
      //     notes: enrollmentFormData.notes,
      //     enrollment_date: new Date().toISOString()
      //   });
      // 
      // if (error) throw error;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new enrolled employee with the form data
      const newEnrolledEmployee: Employee = {
        ...selectedEmployeeToEnroll,
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: "Active",
        coverage: enrollmentFormData.coverageType,
        dependents: parseInt(enrollmentFormData.dependents),
        contributions: enrollmentFormData.contributions,
        notes: enrollmentFormData.notes
      };
      
      // Add to enrolled employees
      setEnrolledEmployees(prev => [...prev, newEnrolledEmployee]);
      
      toast({
        title: "Employee Enrolled",
        description: `${selectedEmployeeToEnroll.name} has been successfully enrolled in the ${plan.name} plan.`,
        variant: "success",
      });
      
      // Close the dialog
      setShowEnrollDialog(false);
    } catch (error) {
      console.error("Error enrolling employee:", error);
      toast({
        title: "Enrollment Failed",
        description: "Failed to enroll employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };
  
  // Handle viewing employee details
  const handleViewEmployeeDetails = async (employeeId: number) => {
    setLoadingEmployeeDetails(true);
    setShowEmployeeDetailsDialog(true);
    
    try {
      // Find the employee in the current list
      const employee = enrolledEmployees.find(emp => emp.id === employeeId);
      
      if (!employee) {
        throw new Error("Employee not found");
      }
      
      // In a real app, you might want to fetch more detailed information here
      // const { data, error } = await supabase
      //   .from('employees')
      //   .select('*')
      //   .eq('id', employeeId)
      //   .single();
      // 
      // if (error) throw error;
      // setSelectedEmployee(data);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Enhance employee data with additional details for display
      const enhancedEmployee: Employee = {
        ...employee,
        department: employee.department || ["Engineering", "Marketing", "Finance", "HR", "Sales"][Math.floor(Math.random() * 5)],
        email: employee.email || `${employee.name.toLowerCase().replace(' ', '.')}@mokmzansi.com`,
        phone: employee.phone || `+27 ${Math.floor(Math.random() * 100)} ${Math.floor(Math.random() * 1000)} ${Math.floor(Math.random() * 10000)}`,
        status: "Active",
        coverage: ["Individual", "Family", "Individual + Spouse"][Math.floor(Math.random() * 3)],
        dependents: Math.floor(Math.random() * 4),
        contributions: `R${(Math.floor(Math.random() * 15) + 5) * 100}/month`,
        notes: Math.random() > 0.5 ? "Requested additional coverage options" : "",
        imageUrl: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${employee.id}.jpg`
      };
      
      setSelectedEmployee(enhancedEmployee);
    } catch (error) {
      console.error("Error fetching employee details:", error);
      toast({
        title: "Error",
        description: "Failed to load employee details. Please try again.",
        variant: "destructive",
      });
      setShowEmployeeDetailsDialog(false);
    } finally {
      setLoadingEmployeeDetails(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading plan details...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate("/dashboard/hr/benefits")} 
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            House Allowance Plan
          </h1>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete Plan
          </Button>
          <Button 
            size="sm"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">
            <Settings className="h-4 w-4 mr-2" />
            Plan Details
          </TabsTrigger>
          <TabsTrigger value="employees">
            <Users className="h-4 w-4 mr-2" />
            Enrolled Employees
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Manage the basic details of this benefit plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    value={formData.name || ''} 
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider</Label>
                  <Input 
                    id="provider" 
                    name="provider" 
                    value={formData.provider || ''} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan Type</Label>
                  <Select 
                    value={formData.plan || ''} 
                    onValueChange={(value) => handleSelectChange('plan', value)}
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
                    value={formData.coverage || ''} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eligibility">Eligibility</Label>
                  <Select 
                    value={formData.eligibility || ''} 
                    onValueChange={(value) => handleSelectChange('eligibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select eligibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All employees">All employees</SelectItem>
                      <SelectItem value="Full-time employees">Full-time employees</SelectItem>
                      <SelectItem value="Part-time employees">Part-time employees</SelectItem>
                      <SelectItem value="Employees after 90 days">Employees after 90 days</SelectItem>
                      <SelectItem value="Management only">Management only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                  <Input 
                    id="enrollmentDate" 
                    name="enrollmentDate" 
                    value={formData.enrollmentDate || ''} 
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="details">Plan Details</Label>
                <Textarea 
                  id="details" 
                  name="details" 
                  value={formData.details || ''} 
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Cost Structure</CardTitle>
              <CardDescription>
                Configure the cost and contribution structure for this plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employerContribution">Employer Contribution</Label>
                  <Input 
                    id="employerContribution" 
                    name="employerContribution" 
                    placeholder="e.g., 80% or R5000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeContribution">Employee Contribution</Label>
                  <Input 
                    id="employeeContribution" 
                    name="employeeContribution" 
                    placeholder="e.g., 20% or R1000"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billingCycle">Billing Cycle</Label>
                  <Select defaultValue="monthly">
                    <SelectTrigger>
                      <SelectValue placeholder="Select billing cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextBillingDate">Next Billing Date</Label>
                  <Input 
                    id="nextBillingDate" 
                    name="nextBillingDate" 
                    type="date"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="employees" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Employees</CardTitle>
              <CardDescription>
                Manage employees enrolled in this benefit plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {enrolledEmployees.length > 0 ? (
                <div className="border rounded-md">
                  <div className="grid grid-cols-4 gap-4 p-3 border-b bg-muted/50 font-medium text-sm">
                    <div>Employee</div>
                    <div>Position</div>
                    <div>Enrollment Date</div>
                    <div>Actions</div>
                  </div>
                  
                  {enrolledEmployees.map((employee) => (
                    <div key={employee.id} className="grid grid-cols-4 gap-4 p-3 border-b last:border-0">
                      <div>{employee.name}</div>
                      <div className="text-muted-foreground">{employee.position}</div>
                      <div>{employee.enrollmentDate}</div>
                      <div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewEmployeeDetails(employee.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Enrolled Employees</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    There are no employees enrolled in this benefit plan yet.
                  </p>
                  <Button>
                    Enroll Employees
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {enrolledEmployees.length} enrolled employees
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleOpenEnrollDialog}
              >
                <Users className="h-4 w-4 mr-2" />
                Enroll New Employee
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="documents" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Documents</CardTitle>
              <CardDescription>
                Manage documents related to this benefit plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <div className="space-y-4">
                  <div className="border rounded-md">
                    <div className="grid grid-cols-5 gap-4 p-3 border-b bg-muted/50 font-medium text-sm">
                      <div>Document Name</div>
                      <div>Type</div>
                      <div>Size</div>
                      <div>Upload Date</div>
                      <div>Actions</div>
                    </div>
                    
                    {documents.map((document) => (
                      <div key={document.id} className="grid grid-cols-5 gap-4 p-3 border-b last:border-0 items-center">
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate max-w-[150px]">{document.name}</span>
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {document.type.split('/')[1]?.toUpperCase() || document.type}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {(document.size / 1024).toFixed(1)} KB
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {new Date(document.uploadDate).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          {document.url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={document.url} download={document.name} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </a>
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteDocument(document.id)}
                          >
                            <Trash className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Documents</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    There are no documents uploaded for this benefit plan yet.
                  </p>
                  <Button onClick={handleUploadClick}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              )}
            </CardContent>
            {documents.length > 0 && (
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {documents.length} document{documents.length !== 1 ? 's' : ''}
                </div>
                <Button onClick={handleUploadClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Benefit Plan</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the {plan?.name} plan? This action cannot be undone.
              {enrolledEmployees.length > 0 && (
                <p className="mt-2 text-destructive">
                  Warning: This plan has {enrolledEmployees.length} enrolled employees. 
                  Deleting this plan will unenroll all employees.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Plan
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Document Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a document related to the {plan?.name} benefit plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            {uploading ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <h3 className="text-lg font-medium">Uploading Document</h3>
                  <p className="text-muted-foreground mt-1">
                    Please wait while your document is being uploaded...
                  </p>
                </div>
                
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  {uploadProgress}% Complete
                </p>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={handleFileSelect}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                />
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Click to select a file</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  or drag and drop a file here
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported file types: PDF, Word, Excel, PowerPoint, Text, Images
                </p>
              </div>
            )}
          </div>
          
          {!uploading && (
            <DialogFooter className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleFileSelect}>
                Select File
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Employee Details Dialog */}
      <Dialog open={showEmployeeDetailsDialog} onOpenChange={setShowEmployeeDetailsDialog}>
        <DialogContent className="max-w-3xl">
          {loadingEmployeeDetails ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Loading employee details...</p>
            </div>
          ) : selectedEmployee ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">Employee Details</DialogTitle>
                <DialogDescription>
                  Details for employee enrolled in {plan?.name} plan
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                <div className="col-span-1 flex flex-col items-center">
                  {selectedEmployee.imageUrl ? (
                    <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-primary/20 mb-4">
                      <img 
                        src={selectedEmployee.imageUrl} 
                        alt={selectedEmployee.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 w-32 rounded-full bg-primary/10 text-primary text-2xl font-bold mb-4">
                      {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  
                  <h3 className="text-lg font-semibold">{selectedEmployee.name}</h3>
                  <p className="text-muted-foreground">{selectedEmployee.position}</p>
                  <p className="text-sm text-muted-foreground">{selectedEmployee.department}</p>
                  
                  <div className="mt-4 w-full space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="bg-primary/10 p-1.5 rounded-full">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <span>{selectedEmployee.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="bg-primary/10 p-1.5 rounded-full">
                        <Phone className="h-4 w-4 text-primary" />
                      </div>
                      <span>{selectedEmployee.phone}</span>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Benefit Plan Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Enrollment Date</p>
                        <p className="font-medium">{selectedEmployee.enrollmentDate}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {selectedEmployee.status}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Coverage Type</p>
                        <p className="font-medium">{selectedEmployee.coverage}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Dependents</p>
                        <p className="font-medium">{selectedEmployee.dependents}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Monthly Contribution</p>
                        <p className="font-medium">{selectedEmployee.contributions}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Plan Provider</p>
                        <p className="font-medium">{plan?.provider}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedEmployee.notes && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Notes</h4>
                      <div className="p-3 bg-muted rounded-md text-sm">
                        {selectedEmployee.notes}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Actions</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Documents
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Enrollment
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowEmployeeDetailsDialog(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-muted-foreground">Employee details not found</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Employee Enrollment Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Enroll Employee in {plan?.name} Plan</DialogTitle>
            <DialogDescription>
              Search for an employee to enroll in this benefit plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {!selectedEmployeeToEnroll ? (
              <>
                {/* Employee Search */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search employees by name, position, or department"
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => handleSearchEmployees(e.target.value)}
                    />
                  </div>
                  
                  <div className="border rounded-md">
                    <div className="grid grid-cols-4 gap-4 p-3 border-b bg-muted/50 font-medium text-sm">
                      <div>Employee</div>
                      <div>Position</div>
                      <div>Department</div>
                      <div>Action</div>
                    </div>
                    
                    {employeeSearchResults.length > 0 ? (
                      employeeSearchResults.map((employee) => (
                        <div key={employee.id} className="grid grid-cols-4 gap-4 p-3 border-b last:border-0 items-center">
                          <div className="flex items-center gap-2">
                            {employee.imageUrl ? (
                              <div className="h-8 w-8 rounded-full overflow-hidden">
                                <img 
                                  src={employee.imageUrl} 
                                  alt={employee.name} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary text-xs font-bold">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </div>
                            )}
                            <span>{employee.name}</span>
                          </div>
                          <div className="text-muted-foreground text-sm">{employee.position}</div>
                          <div className="text-muted-foreground text-sm">{employee.department}</div>
                          <div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSelectEmployeeToEnroll(employee)}
                            >
                              Select
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <p className="text-muted-foreground">No employees found matching your search criteria.</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Enrollment Form */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-shrink-0">
                    {selectedEmployeeToEnroll.imageUrl ? (
                      <div className="h-16 w-16 rounded-full overflow-hidden">
                        <img 
                          src={selectedEmployeeToEnroll.imageUrl} 
                          alt={selectedEmployeeToEnroll.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary text-xl font-bold">
                        {selectedEmployeeToEnroll.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedEmployeeToEnroll.name}</h3>
                    <p className="text-muted-foreground">{selectedEmployeeToEnroll.position}</p>
                    <p className="text-sm text-muted-foreground">{selectedEmployeeToEnroll.department}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => setSelectedEmployeeToEnroll(null)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Change Employee
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="coverageType">Coverage Type</Label>
                      <Select 
                        name="coverageType" 
                        value={enrollmentFormData.coverageType}
                        onValueChange={(value) => handleEnrollmentFormChange({ target: { name: 'coverageType', value } } as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select coverage type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Individual">Individual</SelectItem>
                          <SelectItem value="Family">Family</SelectItem>
                          <SelectItem value="Individual + Spouse">Individual + Spouse</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dependents">Number of Dependents</Label>
                      <Input 
                        id="dependents"
                        name="dependents"
                        type="number"
                        min="0"
                        max="10"
                        value={enrollmentFormData.dependents}
                        onChange={handleEnrollmentFormChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contributions">Monthly Contribution</Label>
                    <Input 
                      id="contributions"
                      name="contributions"
                      placeholder="e.g. R1,200"
                      value={enrollmentFormData.contributions}
                      onChange={handleEnrollmentFormChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea 
                      id="notes"
                      name="notes"
                      placeholder="Add any additional notes about this enrollment"
                      value={enrollmentFormData.notes}
                      onChange={handleEnrollmentFormChange}
                      rows={3}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEnrollDialog(false)}
              disabled={enrolling}
            >
              Cancel
            </Button>
            {selectedEmployeeToEnroll && (
              <Button 
                onClick={handleEnrollEmployee}
                disabled={enrolling}
              >
                {enrolling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>Enroll Employee</>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BenefitPlanDetails;
